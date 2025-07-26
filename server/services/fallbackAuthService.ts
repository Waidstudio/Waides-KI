import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface TempUser {
  id: string;
  username: string;
  email: string;
  password: string; // hashed
  role: 'user' | 'admin';
  permissions: string[];
  createdAt: Date;
}

interface TempSession {
  sessionId: string;
  userId: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  lastActivity: Date;
  isActive: boolean;
}

interface LoginResult {
  success: boolean;
  user?: any;
  token?: string;
  sessionId?: string;
  message: string;
}

// Temporary in-memory user storage when database is unavailable
class FallbackAuthService {
  private users: Map<string, TempUser> = new Map();
  private sessions: Map<string, TempSession> = new Map();
  private ipSessions: Map<string, Map<string, TempSession>> = new Map(); // ipAddress -> userId -> session

  constructor() {
    this.initializeDefaultUsers();
  }

  private async initializeDefaultUsers() {
    try {
      // Create default admin user
      const adminPassword = await bcrypt.hash('WaidesKI2025!', 10);
      this.users.set('admin@waides.com', {
        id: 'admin-1',
        username: 'admin',
        email: 'admin@waides.com',
        password: adminPassword,
        role: 'admin',
        permissions: ['all'],
        createdAt: new Date()
      });

      // Create default regular user
      const userPassword = await bcrypt.hash('WaidesUser2025!', 10);
      this.users.set('user@waides.com', {
        id: 'user-1',
        username: 'user',
        email: 'user@waides.com',
        password: userPassword,
        role: 'user',
        permissions: ['view_dashboard', 'view_wallet', 'create_trades', 'view_trades', 'view_forum', 'create_forum_posts', 'control_trading', 'update_config', 'manage_financial'],
        createdAt: new Date()
      });

      console.log('✅ Fallback authentication initialized with default users');
    } catch (error) {
      console.error('❌ Error initializing fallback auth:', error);
    }
  }

  // Check if user already has active session from this IP
  public checkActiveSessionByIP(userId: string, ipAddress: string): TempSession | null {
    const cleanIpAddress = ipAddress.split(',')[0].trim();
    const userSessions = this.ipSessions.get(cleanIpAddress);
    
    if (userSessions && userSessions.has(userId)) {
      const session = userSessions.get(userId)!;
      if (session.isActive && session.expiresAt > new Date()) {
        return session;
      }
    }
    return null;
  }

  public async login(credentials: { email: string; password: string; rememberMe?: boolean }, ipAddress?: string, userAgent?: string): Promise<LoginResult> {
    try {
      const user = this.users.get(credentials.email);
      
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Verify password
      const passwordValid = await bcrypt.compare(credentials.password, user.password);
      if (!passwordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const cleanIpAddress = ipAddress ? ipAddress.split(',')[0].trim() : 'unknown';
      
      // Check if user already has active session from this IP
      const existingSession = this.checkActiveSessionByIP(user.id, cleanIpAddress);
      if (existingSession) {
        // Update last activity and return existing session
        existingSession.lastActivity = new Date();
        
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            role: user.role,
            sessionId: existingSession.sessionId
          },
          process.env.JWT_SECRET || 'fallback-secret-key',
          { expiresIn: '365d' }
        );

        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            permissions: user.permissions
          },
          token,
          sessionId: existingSession.sessionId,
          message: 'Welcome back! Restored your session (using fallback authentication)'
        };
      }

      // Generate new session
      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year - persistent session

      // Create session object
      const session: TempSession = {
        sessionId,
        userId: user.id,
        expiresAt,
        ipAddress: cleanIpAddress,
        userAgent: userAgent || 'unknown',
        lastActivity: new Date(),
        isActive: true
      };

      // Store session
      this.sessions.set(sessionId, session);
      
      // Store by IP for quick lookup
      if (!this.ipSessions.has(cleanIpAddress)) {
        this.ipSessions.set(cleanIpAddress, new Map());
      }
      this.ipSessions.get(cleanIpAddress)!.set(user.id, session);

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          sessionId
        },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '365d' } // 1 year - persistent until manual logout
      );

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        },
        token,
        sessionId,
        message: 'Login successful (using fallback authentication)'
      };

    } catch (error) {
      console.error('Fallback auth login error:', error);
      return {
        success: false,
        message: 'An error occurred during login'
      };
    }
  }

  public async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as any;
      
      // Check if session exists and is valid
      const session = this.sessions.get(decoded.sessionId);
      if (!session || !session.isActive || session.expiresAt < new Date()) {
        return null;
      }

      // Update last activity
      session.lastActivity = new Date();

      const user = Array.from(this.users.values()).find(u => u.id === decoded.userId);
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  // Logout - invalidate session
  public async logout(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.isActive = false;
        
        // Remove from IP lookup
        const userSessions = this.ipSessions.get(session.ipAddress);
        if (userSessions && userSessions.has(session.userId)) {
          userSessions.delete(session.userId);
        }
      }

      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'An error occurred during logout',
      };
    }
  }

  public getUserById(id: string): TempUser | undefined {
    return Array.from(this.users.values()).find(user => user.id === id);
  }

  public getUserByEmail(email: string): TempUser | undefined {
    return this.users.get(email);
  }

  public cleanup() {
    // Remove expired sessions
    const now = new Date();
    const sessionsArray = Array.from(this.sessions.entries());
    for (const [sessionId, session] of sessionsArray) {
      if (session.expiresAt < now || !session.isActive) {
        this.sessions.delete(sessionId);
        
        // Also remove from IP lookup
        const userSessions = this.ipSessions.get(session.ipAddress);
        if (userSessions && userSessions.has(session.userId)) {
          userSessions.delete(session.userId);
        }
      }
    }
  }
}

export const fallbackAuthService = new FallbackAuthService();

// Cleanup expired sessions every hour
setInterval(() => {
  fallbackAuthService.cleanup();
}, 60 * 60 * 1000);