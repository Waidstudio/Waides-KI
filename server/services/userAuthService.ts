import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { eq, and, gte } from 'drizzle-orm';
import { db } from '../db';
import {
  users,
  userSessions,
  type User,
  type UserLoginCredentials,
  type UserRegisterData,
  type UserSession,
} from '@shared/schema';

// Environment variables for user auth (separate from admin)
const JWT_SECRET = process.env.JWT_SECRET || 'waides-ki-user-secret-2025';
const SESSION_DURATION = 365 * 24 * 60 * 60 * 1000; // 1 year (persistent until manual logout)
const REMEMBER_ME_DURATION = 365 * 24 * 60 * 60 * 1000; // 1 year

interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  role: 'user';
  permissions: string[];
  moralityScore?: number;
  spiritualAlignment?: number;
  createdAt?: Date;
}

interface LoginResult {
  success: boolean;
  user?: AuthenticatedUser;
  token?: string;
  sessionId?: string;
  message?: string;
}

interface SessionInfo {
  userId: number;
  sessionId: string;
  user: AuthenticatedUser;
  expiresAt: Date;
}

export class UserAuthService {
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
    const expiresIn = '365d'; // 1 year - persistent until manual logout
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
        .from(userSessions)
        .where(
          and(
            eq(userSessions.sessionId, sessionId),
            eq(userSessions.isActive, true),
            gte(userSessions.expiresAt, new Date())
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
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'user',
        permissions: ['view_dashboard', 'view_wallet', 'create_trades', 'view_trades', 'view_forum', 'create_forum_posts', 'control_trading', 'update_config', 'manage_financial'],
        moralityScore: user.moralityScore || undefined,
        spiritualAlignment: user.spiritualAlignment || undefined,
        createdAt: user.createdAt || undefined,
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  // Login user
  public async login(
    credentials: UserLoginCredentials,
    ipAddress: string,
    userAgent: string
  ): Promise<LoginResult> {
    try {
      // Clean IP address to handle proxy headers with multiple IPs
      const cleanIpAddress = ipAddress.split(',')[0].trim();
      
      // Find user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, credentials.email))
        .limit(1);

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Verify password
      const passwordValid = await this.verifyPassword(credentials.password, user.password);
      if (!passwordValid) {
        return {
          success: false,
          message: 'Invalid email or password',
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
        role: 'user',
        permissions: ['view_dashboard', 'view_wallet', 'create_trades', 'view_trades', 'view_forum', 'create_forum_posts', 'control_trading', 'update_config', 'manage_financial'],
        moralityScore: user.moralityScore || undefined,
        spiritualAlignment: user.spiritualAlignment || undefined,
        createdAt: user.createdAt || undefined,
      };
      
      const token = this.generateToken(authenticatedUser, sessionId, credentials.rememberMe);
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Insert session
      await db.insert(userSessions).values({
        sessionId: sessionId,
        userId: user.id,
        tokenHash: tokenHash,
        expiresAt,
        ipAddress: cleanIpAddress,
        userAgent,
      });

      return {
        success: true,
        user: authenticatedUser,
        token,
        sessionId,
        message: 'Login successful',
      };
    } catch (error) {
      console.error('User login error:', error);
      
      // Re-throw database connection errors to allow fallback authentication
      if ((error.message && error.message.includes('The endpoint has been disabled')) || 
          error.code === 'XX000') {
        throw error;
      }
      
      return {
        success: false,
        message: 'An error occurred during login',
      };
    }
  }

  // Register new user
  public async register(userData: UserRegisterData): Promise<LoginResult> {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingUser.length > 0) {
        return { success: false, message: 'User with this email already exists' };
      }

      // Check if username already exists
      const existingUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, userData.username))
        .limit(1);

      if (existingUsername.length > 0) {
        return { success: false, message: 'Username already taken' };
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          username: userData.username,
          email: userData.email,
          password: passwordHash,
        })
        .returning();

      const authenticatedUser: AuthenticatedUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: 'user',
        permissions: ['view_dashboard', 'view_wallet', 'create_trades', 'view_trades', 'view_forum', 'create_forum_posts', 'control_trading', 'update_config', 'manage_financial'],
        moralityScore: newUser.moralityScore || undefined,
        spiritualAlignment: newUser.spiritualAlignment || undefined,
        createdAt: newUser.createdAt || undefined,
      };

      return { success: true, user: authenticatedUser };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, message: 'Failed to create user account' };
    }
  }

  // Logout user
  public async logout(sessionId: string): Promise<boolean> {
    try {
      // Deactivate session
      await db
        .update(userSessions)
        .set({ isActive: false })
        .where(eq(userSessions.sessionId, sessionId));

      return true;
    } catch (error) {
      console.error('User logout error:', error);
      return false;
    }
  }

  // Get user by email
  public async getUserByEmail(email: string): Promise<AuthenticatedUser | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'user',
        permissions: ['view_dashboard', 'view_wallet', 'create_trades', 'view_trades', 'view_forum', 'create_forum_posts', 'control_trading', 'update_config', 'manage_financial'],
        moralityScore: user.moralityScore || undefined,
        spiritualAlignment: user.spiritualAlignment || undefined,
        createdAt: user.createdAt || undefined,
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  // Get user sessions
  public async getUserSessions(userId: number): Promise<UserSession[]> {
    try {
      return await db
        .select()
        .from(userSessions)
        .where(and(eq(userSessions.userId, userId), eq(userSessions.isActive, true)));
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  // Revoke all sessions for user
  public async revokeAllUserSessions(userId: number): Promise<boolean> {
    try {
      await db
        .update(userSessions)
        .set({ isActive: false })
        .where(eq(userSessions.userId, userId));
      
      return true;
    } catch (error) {
      console.error('Error revoking user sessions:', error);
      return false;
    }
  }
}

export const userAuthService = new UserAuthService();