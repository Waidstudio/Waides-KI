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

interface LoginResult {
  success: boolean;
  user?: any;
  token?: string;
  message: string;
}

// Temporary in-memory user storage when database is unavailable
class FallbackAuthService {
  private users: Map<string, TempUser> = new Map();
  private sessions: Map<string, { userId: string; expiresAt: Date }> = new Map();

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

  public async login(credentials: { email: string; password: string }): Promise<LoginResult> {
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

      // Generate session token
      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store session
      this.sessions.set(sessionId, {
        userId: user.id,
        expiresAt
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          sessionId
        },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '24h' }
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
      if (!session || session.expiresAt < new Date()) {
        return null;
      }

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
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

export const fallbackAuthService = new FallbackAuthService();

// Cleanup expired sessions every hour
setInterval(() => {
  fallbackAuthService.cleanup();
}, 60 * 60 * 1000);