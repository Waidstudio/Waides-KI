import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { eq, and, gte, desc, count } from 'drizzle-orm';
import { db } from '../db';
import {
  adminUsers,
  adminSessions,
  adminActivityLogs,
  adminLoginAttempts,
  type AdminUser,
  type InsertAdminUser,
  type LoginCredentials,
  type AdminRole,
  type AdminPermission,
  AdminRoles,
  RolePermissions,
} from '@shared/authSchema';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'waides-ki-admin-secret-2025';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermission[];
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  lastLogin?: Date;
}

interface LoginResult {
  success: boolean;
  user?: AuthenticatedUser;
  token?: string;
  sessionId?: string;
  message?: string;
  remainingAttempts?: number;
  lockoutUntil?: Date;
}

interface SessionInfo {
  userId: number;
  sessionId: string;
  user: AuthenticatedUser;
  expiresAt: Date;
}

export class AuthService {
  // Hash password
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Verify password
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate session ID
  private generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate JWT token
  private generateToken(user: AuthenticatedUser, sessionId: string, rememberMe = false): string {
    const expiresIn = rememberMe ? '30d' : '24h';
    return jwt.sign(
      {
        userId: user.id,
        sessionId,
        role: user.role,
        permissions: user.permissions,
      },
      JWT_SECRET,
      { expiresIn }
    );
  }

  // Verify JWT token
  public async verifyToken(token: string): Promise<SessionInfo | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const sessionId = decoded.sessionId;
      
      // Check if session exists and is active
      const session = await db
        .select()
        .from(adminSessions)
        .where(
          and(
            eq(adminSessions.id, sessionId),
            eq(adminSessions.isActive, true),
            gte(adminSessions.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!session.length) {
        return null;
      }

      // Get user data
      const user = await this.getUserById(decoded.userId);
      if (!user) {
        return null;
      }

      return {
        userId: decoded.userId,
        sessionId,
        user,
        expiresAt: session[0].expiresAt,
      };
    } catch (error) {
      return null;
    }
  }

  // Get user by ID
  public async getUserById(id: number): Promise<AuthenticatedUser | null> {
    try {
      const [user] = await db
        .select()
        .from(adminUsers)
        .where(and(eq(adminUsers.id, id), eq(adminUsers.isActive, true)))
        .limit(1);

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role as AdminRole,
        permissions: user.permissions || RolePermissions[user.role as AdminRole] || [],
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        profileImage: user.profileImage || undefined,
        lastLogin: user.lastLogin || undefined,
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  // Check login attempts
  private async checkLoginAttempts(email: string, ipAddress: string): Promise<{ allowed: boolean; remainingAttempts?: number; lockoutUntil?: Date }> {
    const since = new Date(Date.now() - LOCKOUT_DURATION);
    
    // Handle multiple IP addresses from proxy headers by taking the first one
    const cleanIpAddress = ipAddress.split(',')[0].trim();
    
    const attempts = await db
      .select({ count: count() })
      .from(adminLoginAttempts)
      .where(
        and(
          eq(adminLoginAttempts.email, email),
          eq(adminLoginAttempts.success, false),
          gte(adminLoginAttempts.createdAt, since)
        )
      );

    const failedAttempts = attempts[0]?.count || 0;
    
    if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION);
      return { 
        allowed: false, 
        remainingAttempts: 0,
        lockoutUntil 
      };
    }

    return { 
      allowed: true, 
      remainingAttempts: MAX_LOGIN_ATTEMPTS - failedAttempts 
    };
  }

  // Record login attempt
  private async recordLoginAttempt(
    email: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
    failureReason?: string
  ): Promise<void> {
    try {
      // Handle multiple IP addresses from proxy headers by taking the first one
      const cleanIpAddress = ipAddress.split(',')[0].trim();
      
      await db.insert(adminLoginAttempts).values({
        email,
        ipAddress: cleanIpAddress,
        userAgent,
        success,
        failureReason,
      });
    } catch (error) {
      console.error('Error recording login attempt:', error);
    }
  }

  // Login user
  public async login(
    credentials: LoginCredentials,
    ipAddress: string,
    userAgent: string
  ): Promise<LoginResult> {
    try {
      // Check login attempts
      const attemptCheck = await this.checkLoginAttempts(credentials.email, ipAddress);
      if (!attemptCheck.allowed) {
        await this.recordLoginAttempt(credentials.email, ipAddress, userAgent, false, 'too_many_attempts');
        return {
          success: false,
          message: 'Too many failed login attempts. Please try again later.',
          remainingAttempts: 0,
          lockoutUntil: attemptCheck.lockoutUntil,
        };
      }

      // Find user
      const [user] = await db
        .select()
        .from(adminUsers)
        .where(and(eq(adminUsers.email, credentials.email), eq(adminUsers.isActive, true)))
        .limit(1);

      if (!user) {
        await this.recordLoginAttempt(credentials.email, ipAddress, userAgent, false, 'user_not_found');
        return {
          success: false,
          message: 'Invalid email or password',
          remainingAttempts: attemptCheck.remainingAttempts! - 1,
        };
      }

      // Verify password
      const passwordValid = await this.verifyPassword(credentials.password, user.passwordHash);
      if (!passwordValid) {
        await this.recordLoginAttempt(credentials.email, ipAddress, userAgent, false, 'invalid_password');
        return {
          success: false,
          message: 'Invalid email or password',
          remainingAttempts: attemptCheck.remainingAttempts! - 1,
        };
      }

      // Create session
      const sessionId = this.generateSessionId();
      const expiresAt = new Date(Date.now() + (credentials.rememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION));

      // Generate token and hash it for storage
      const authenticatedUser: AuthenticatedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role as AdminRole,
        permissions: user.permissions || RolePermissions[user.role as AdminRole] || [],
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        profileImage: user.profileImage || undefined,
        lastLogin: new Date(),
      };
      
      const token = this.generateToken(authenticatedUser, sessionId, credentials.rememberMe);
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      await db.insert(adminSessions).values({
        userId: user.id,
        sessionId: sessionId,
        tokenHash: tokenHash,
        expiresAt,
        ipAddress,
        userAgent,
      });

      // Update last login
      await db
        .update(adminUsers)
        .set({ lastLogin: new Date() })
        .where(eq(adminUsers.id, user.id));

      // Record successful login
      await this.recordLoginAttempt(credentials.email, ipAddress, userAgent, true);

      // Log activity
      await this.logActivity(user.id, 'login', 'admin_session', { ipAddress, userAgent }, ipAddress, userAgent);

      return {
        success: true,
        user: authenticatedUser,
        token,
        sessionId,
        message: 'Login successful',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login',
      };
    }
  }

  // Logout user
  public async logout(sessionId: string, userId?: number): Promise<boolean> {
    try {
      // Deactivate session
      await db
        .update(adminSessions)
        .set({ isActive: false })
        .where(eq(adminSessions.id, sessionId));

      // Log activity
      if (userId) {
        await this.logActivity(userId, 'logout', 'admin_session');
      }

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  // Create admin user
  public async createAdminUser(userData: InsertAdminUser): Promise<{ success: boolean; user?: AuthenticatedUser; message?: string }> {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.email, userData.email))
        .limit(1);

      if (existingUser.length > 0) {
        return { success: false, message: 'User with this email already exists' };
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Create user
      const [newUser] = await db
        .insert(adminUsers)
        .values({
          username: userData.username,
          email: userData.email,
          passwordHash,
          role: userData.role || AdminRoles.VIEWER,
          firstName: userData.firstName,
          lastName: userData.lastName,
          permissions: userData.permissions || RolePermissions[userData.role as AdminRole] || RolePermissions[AdminRoles.VIEWER],
        })
        .returning();

      const authenticatedUser: AuthenticatedUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role as AdminRole,
        permissions: newUser.permissions || RolePermissions[newUser.role as AdminRole] || [],
        firstName: newUser.firstName || undefined,
        lastName: newUser.lastName || undefined,
      };

      return { success: true, user: authenticatedUser };
    } catch (error) {
      console.error('Error creating admin user:', error);
      return { success: false, message: 'Failed to create user' };
    }
  }

  // Check permission
  public hasPermission(user: AuthenticatedUser, permission: AdminPermission): boolean {
    return user.permissions.includes(permission) || user.role === AdminRoles.SUPER_ADMIN;
  }

  // Log activity
  public async logActivity(
    userId: number,
    action: string,
    resource?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string,
    success = true
  ): Promise<void> {
    try {
      await db.insert(adminActivityLogs).values({
        userId,
        action,
        resource,
        details,
        ipAddress,
        userAgent,
        success,
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // Get user sessions
  public async getUserSessions(userId: number): Promise<any[]> {
    try {
      return await db
        .select()
        .from(adminSessions)
        .where(and(eq(adminSessions.userId, userId), eq(adminSessions.isActive, true)))
        .orderBy(desc(adminSessions.createdAt));
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  // Revoke all sessions for user
  public async revokeAllUserSessions(userId: number): Promise<boolean> {
    try {
      await db
        .update(adminSessions)
        .set({ isActive: false })
        .where(eq(adminSessions.userId, userId));
      
      await this.logActivity(userId, 'revoke_all_sessions', 'admin_session');
      return true;
    } catch (error) {
      console.error('Error revoking user sessions:', error);
      return false;
    }
  }

  // Get activity logs
  public async getActivityLogs(userId?: number, limit = 100): Promise<any[]> {
    try {
      const query = db
        .select({
          id: adminActivityLogs.id,
          userId: adminActivityLogs.userId,
          action: adminActivityLogs.action,
          resource: adminActivityLogs.resource,
          details: adminActivityLogs.details,
          ipAddress: adminActivityLogs.ipAddress,
          timestamp: adminActivityLogs.createdAt,
          success: adminActivityLogs.success,
          username: adminUsers.username,
        })
        .from(adminActivityLogs)
        .leftJoin(adminUsers, eq(adminActivityLogs.userId, adminUsers.id))
        .orderBy(desc(adminActivityLogs.createdAt))
        .limit(limit);

      if (userId) {
        return await query.where(eq(adminActivityLogs.userId, userId));
      }

      return await query;
    } catch (error) {
      console.error('Error getting activity logs:', error);
      return [];
    }
  }

  // Register new user
  public async register(userData: {
    username: string;
    email: string;
    password: string;
    role?: AdminRole;
  }): Promise<{ success: boolean; user?: AuthenticatedUser; message?: string }> {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.email, userData.email))
        .limit(1);

      if (existingUser.length > 0) {
        return { success: false, message: 'User with this email already exists' };
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Create user
      const [newUser] = await db
        .insert(adminUsers)
        .values({
          username: userData.username,
          email: userData.email,
          passwordHash,
          role: userData.role || AdminRoles.USER,
          permissions: RolePermissions[userData.role as AdminRole] || RolePermissions[AdminRoles.USER],
        })
        .returning();

      const authenticatedUser: AuthenticatedUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role as AdminRole,
        permissions: newUser.permissions || RolePermissions[newUser.role as AdminRole] || [],
      };

      return { success: true, user: authenticatedUser };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, message: 'Failed to create account' };
    }
  }

  // Initialize default admin user
  public async initializeDefaultAdmin(): Promise<boolean> {
    try {
      // Check if any admin users exist
      const existingAdmins = await db
        .select({ count: count() })
        .from(adminUsers);

      if (existingAdmins[0]?.count > 0) {
        return true; // Already initialized
      }

      // Create default super admin
      const defaultAdmin: InsertAdminUser = {
        username: 'admin',
        email: 'admin@waides.com',
        password: 'WaidesKI2025!',
        confirmPassword: 'WaidesKI2025!',
        role: AdminRoles.SUPER_ADMIN,
        firstName: 'System',
        lastName: 'Administrator',
        permissions: RolePermissions[AdminRoles.SUPER_ADMIN],
      };

      const result = await this.createAdminUser(defaultAdmin);
      
      if (result.success) {
        console.log('✅ Default admin user created: admin@waides.com / WaidesKI2025!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error initializing default admin:', error);
      return false;
    }
  }
}

export const authService = new AuthService();