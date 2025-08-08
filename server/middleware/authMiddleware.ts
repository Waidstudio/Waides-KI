import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AdminPermission, AdminRoles, type AdminUser, type AuthenticatedUser } from '@shared/authSchema';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      sessionId?: string;
    }
  }
}

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Security headers
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:;");
  
  // CORS headers for admin
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

export const rateLimitLogin = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  const attempts = loginAttempts.get(ip);
  
  if (attempts) {
    // Clean old attempts
    if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW) {
      loginAttempts.delete(ip);
    } else if (attempts.count >= MAX_ATTEMPTS) {
      return res.status(429).json({
        error: 'Too many login attempts',
        message: 'Please try again later',
        retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - attempts.lastAttempt)) / 1000)
      });
    }
  }
  
  next();
};

// Update login attempts counter
export const updateLoginAttempts = (ip: string, success: boolean) => {
  if (success) {
    loginAttempts.delete(ip);
    return;
  }
  
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  
  if (attempts) {
    attempts.count++;
    attempts.lastAttempt = now;
  } else {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
  }
};

// Get client IP address
export const getClientIP = (req: Request): string => {
  return (
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

// Get user agent
export const getUserAgent = (req: Request): string => {
  return req.headers['user-agent'] || 'unknown';
};

// Authentication middleware
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header or X-Admin-Token header
    const authHeader = req.headers.authorization;
    const adminToken = req.headers['x-admin-token'] as string;
    
    let token: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (adminToken) {
      token = adminToken;
    }
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Access token not provided'
      });
    }
    
    // Verify token and get session info
    const sessionInfo = await authService.verifyToken(token);
    
    if (!sessionInfo) {
      return res.status(401).json({
        error: 'Invalid or expired token',
        message: 'Please log in again'
      });
    }
    
    // Check if session is still valid
    if (new Date() > sessionInfo.expiresAt) {
      return res.status(401).json({
        error: 'Session expired',
        message: 'Please log in again'
      });
    }
    
    // Attach user and session info to request (convert to AuthenticatedUser type)
    req.user = {
      id: sessionInfo.user.id,
      username: sessionInfo.user.username,
      email: sessionInfo.user.email,
      role: sessionInfo.user.role as AdminRole | "user",
      permissions: sessionInfo.user.permissions || [],
      firstName: sessionInfo.user.firstName,
      lastName: sessionInfo.user.lastName,
      profileImage: sessionInfo.user.profileImage,
      lastLogin: sessionInfo.user.lastLogin
    };
    req.sessionId = sessionInfo.sessionId;
    
    // Log activity for sensitive operations
    const sensitiveRoutes = ['/api/admin/users', '/api/admin/configuration', '/api/admin/trading-bot-config'];
    if (sensitiveRoutes.some(route => req.path.startsWith(route)) && req.method !== 'GET') {
      await authService.logActivity(
        sessionInfo.user.id,
        `${req.method.toLowerCase()}_${req.path.replace('/api/admin/', '')}`,
        'admin_panel',
        { body: req.body, params: req.params },
        getClientIP(req),
        getUserAgent(req)
      );
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    });
  }
};

// Permission middleware factory
export const requirePermission = (permission: AdminPermission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }
    
    // Super admin has all permissions
    if (req.user.role === AdminRoles.SUPER_ADMIN) {
      return next();
    }
    
    // Check if user has the required permission
    // Convert AuthenticatedUser back to AdminUser for permission checking
    const adminUser: AdminUser = {
      ...req.user,
      passwordHash: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: req.user.permissions || [],
      twoFactorEnabled: false,
      twoFactorSecret: null
    };
    
    if (!authService.hasPermission(adminUser, permission)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires the '${permission}' permission`,
        required: permission,
        userRole: req.user.role,
        userPermissions: req.user.permissions
      });
    }
    
    next();
  };
};

// Role-based middleware
export const requireRole = (role: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }
    
    const allowedRoles = Array.isArray(role) ? role : [role];
    
    // Super admin can access everything
    if (req.user.role === AdminRoles.SUPER_ADMIN) {
      return next();
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient role',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        required: allowedRoles,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

// Super admin only middleware
export const requireSuperAdmin = requireRole(AdminRoles.SUPER_ADMIN);

// Admin or higher middleware
export const requireAdmin = requireRole([AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN]);

// Session timeout middleware
export const checkSessionTimeout = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.sessionId) {
    return next();
  }
  
  try {
    // Check if session is close to expiring (within 30 minutes)
    const sessionInfo = await authService.verifyToken(req.headers.authorization?.substring(7) || '');
    
    if (sessionInfo) {
      const timeUntilExpiry = sessionInfo.expiresAt.getTime() - Date.now();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (timeUntilExpiry < thirtyMinutes && timeUntilExpiry > 0) {
        // Add header to warn client about upcoming expiry
        res.setHeader('X-Session-Warning', 'Session expiring soon');
        res.setHeader('X-Session-Expires-In', Math.floor(timeUntilExpiry / 1000).toString());
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

// Audit logging middleware for all admin actions
export const auditLog = async (req: Request, res: Response, next: NextFunction) => {
  // Store original send function
  const originalSend = res.send;
  
  // Override send to capture response
  res.send = function(data) {
    // Log the action if user is authenticated
    if (req.user && req.method !== 'GET') {
      const action = `${req.method.toLowerCase()}_${req.path.replace('/api/admin/', '').replace(/\//g, '_')}`;
      
      // Don't await this to avoid blocking the response
      authService.logActivity(
        req.user.id,
        action,
        req.path,
        {
          method: req.method,
          body: req.body,
          params: req.params,
          query: req.query,
          statusCode: res.statusCode
        },
        getClientIP(req),
        getUserAgent(req),
        res.statusCode < 400
      ).catch(error => {
        console.error('Audit log error:', error);
      });
    }
    
    // Call original send
    return originalSend.call(this, data);
  };
  
  next();
};

// IP whitelist middleware (for high-security environments)
export const ipWhitelist = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (allowedIPs.length === 0) {
      return next(); // No whitelist configured
    }
    
    const clientIP = getClientIP(req);
    
    if (!allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        error: 'IP not allowed',
        message: 'Your IP address is not authorized to access this resource'
      });
    }
    
    next();
  };
};

// Universal authentication middleware that accepts both admin and user auth
export const requireAnyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header or X-Admin-Token header
    const authHeader = req.headers.authorization;
    const adminToken = req.headers['x-admin-token'] as string;
    
    let token: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (adminToken) {
      token = adminToken;
    }
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Access token not provided'
      });
    }
    
    // Try admin auth first
    try {
      const sessionInfo = await authService.verifyToken(token);
      if (sessionInfo && new Date() <= sessionInfo.expiresAt) {
        req.user = sessionInfo.user;
        req.sessionId = sessionInfo.sessionId;
        return next();
      }
    } catch (adminError) {
      // Admin auth failed, try user auth
    }
    
    // Try user auth
    try {
      const { userAuthService } = await import('../services/userAuthService');
      const userInfo = await userAuthService.verifyToken(token);
      if (userInfo) {
        req.user = userInfo.user;
        req.sessionId = userInfo.sessionId;
        return next();
      }
    } catch (userError) {
      // User auth failed, try fallback
    }
    
    // Try fallback user auth
    try {
      const { fallbackAuthService } = await import('../services/fallbackAuthService');
      const fallbackInfo = await fallbackAuthService.verifyToken(token);
      if (fallbackInfo) {
        req.user = fallbackInfo.user;
        req.sessionId = fallbackInfo.sessionId;
        return next();
      }
    } catch (fallbackError) {
      // All auth methods failed
    }
    
    return res.status(401).json({
      error: 'Invalid or expired token',
      message: 'Please log in again'
    });
    
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    });
  }
};