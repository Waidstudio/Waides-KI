import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { adminUsers, adminSessions, adminActivityLogs, type AdminUser } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';

// Define admin levels configuration (excluding super admin for unified login)
export const adminLevels = {
  system: {
    name: 'System Admin',
    description: 'System configuration and user management',
    color: 'purple',
    icon: 'Settings',
    permissions: [
      'system.config',
      'user.management',
      'security.settings',
      'system.monitoring',
      'backup.management'
    ],
    dashboardRoute: '/system-admin-dashboard',
  },
  trading: {
    name: 'Trading Admin',
    description: 'Trading operations and bot management',
    color: 'blue',
    icon: 'TrendingUp',
    permissions: [
      'trading.bots',
      'trading.config',
      'exchange.management',
      'risk.settings',
      'trading.analytics'
    ],
    dashboardRoute: '/trading-admin-dashboard',
  },
  support: {
    name: 'Support Admin',
    description: 'User support and customer service',
    color: 'green',
    icon: 'Headphones',
    permissions: [
      'user.support',
      'transaction.view',
      'support.tickets',
      'user.communication'
    ],
    dashboardRoute: '/support-admin-dashboard',
  },
  viewer: {
    name: 'Read-Only Admin',
    description: 'View-only access to system metrics',
    color: 'gray',
    icon: 'Eye',
    permissions: [
      'system.view',
      'trading.view',
      'analytics.view'
    ],
    dashboardRoute: '/viewer-admin-dashboard',
  }
} as const;

// Super admin configuration (separate for super admin login only)
export const superAdminConfig = {
  super: {
    name: 'Super Admin',
    description: 'Ultimate system control with all permissions',
    color: 'red',
    icon: 'Crown',
    permissions: ['*'], // All permissions
    dashboardRoute: '/super-admin-dashboard',
  }
};

export type AdminLevel = keyof typeof adminLevels;

export class UnifiedAdminAuthService {
  private jwtSecret = process.env.JWT_SECRET || 'waides-ki-admin-secret-key';
  private tokenExpirationHours = 8; // 8 hours for admin sessions

  async initializeDefaultAdmins() {
    try {
      // Check if super admin exists (using existing schema)
      const existingSuperAdmin = await db.select()
        .from(adminUsers)
        .where(eq(adminUsers.role, 'super'))
        .limit(1);

      if (existingSuperAdmin.length === 0) {
        // Create default super admin using existing schema
        const passwordHash = await bcrypt.hash('SuperAdmin123!@#', 12);
        await db.insert(adminUsers).values({
          username: 'superadmin',
          email: 'superadmin@waideski.com',
          passwordHash,
          role: 'super',
          firstName: 'Super',
          lastName: 'Administrator',
          isActive: true,
        });
        console.log('✅ Default Super Admin created');
      }

      // Create default admins for each level if they don't exist
      const defaultAdmins = [
        {
          username: 'systemadmin',
          email: 'system@waideski.com',
          password: 'SystemAdmin123!',
          role: 'system',
          firstName: 'System',
          lastName: 'Administrator'
        },
        {
          username: 'tradingadmin',
          email: 'trading@waideski.com',
          password: 'TradingAdmin123!',
          role: 'trading',
          firstName: 'Trading',
          lastName: 'Administrator'
        },
        {
          username: 'supportadmin',
          email: 'support@waideski.com',
          password: 'SupportAdmin123!',
          role: 'support',
          firstName: 'Support',
          lastName: 'Administrator'
        },
        {
          username: 'vieweradmin',
          email: 'viewer@waideski.com',
          password: 'ViewerAdmin123!',
          role: 'viewer',
          firstName: 'Viewer',
          lastName: 'Administrator'
        }
      ];

      for (const admin of defaultAdmins) {
        const existing = await db.select()
          .from(adminUsers)
          .where(and(
            eq(adminUsers.email, admin.email),
            eq(adminUsers.role, admin.role)
          ))
          .limit(1);

        if (existing.length === 0) {
          const passwordHash = await bcrypt.hash(admin.password, 12);
          await db.insert(adminUsers).values({
            username: admin.username,
            email: admin.email,
            passwordHash,
            role: admin.role,
            firstName: admin.firstName,
            lastName: admin.lastName,
            isActive: true,
          });
          console.log(`✅ Default ${admin.role} admin created`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize default admins:', error);
    }
  }

  async authenticateAdmin(email: string, password: string, requiredLevel?: AdminLevel) {
    try {
      // Find admin user using existing schema
      const admin = await db.select()
        .from(adminUsers)
        .where(and(
          eq(adminUsers.email, email),
          eq(adminUsers.isActive, true)
        ))
        .limit(1);

      if (admin.length === 0) {
        await this.logAuditEntry(null, 'login', 'authentication', {
          email,
          success: false,
          reason: 'user_not_found'
        });
        return { success: false, message: 'Invalid credentials' };
      }

      const adminUser = admin[0];

      // Check if specific level is required
      if (requiredLevel && adminUser.role !== requiredLevel) {
        await this.logAuditEntry(adminUser.id.toString(), 'login', 'authentication', {
          email,
          success: false,
          reason: 'insufficient_level',
          required: requiredLevel,
          actual: adminUser.role
        });
        return { success: false, message: 'Insufficient admin level' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash);
      if (!isValidPassword) {
        await this.logAuditEntry(adminUser.id.toString(), 'login', 'authentication', {
          email,
          success: false,
          reason: 'invalid_password'
        });
        return { success: false, message: 'Invalid credentials' };
      }

      // Create session token
      const sessionToken = this.generateSessionToken(adminUser);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.tokenExpirationHours);

      // Save session using existing schema
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(adminSessions).values({
        sessionId,
        userId: adminUser.id,
        expiresAt,
        ipAddress: '127.0.0.1',
      });

      // Update last login
      await db.update(adminUsers)
        .set({ 
          lastLogin: new Date(),
        })
        .where(eq(adminUsers.id, adminUser.id));

      // Log successful login
      await this.logAuditEntry(adminUser.id.toString(), 'login', 'authentication', {
        email,
        success: true,
        level: adminUser.role
      });

      const adminLevelConfig = adminLevels[adminUser.role as AdminLevel] || adminLevels.viewer;

      return {
        success: true,
        admin: {
          id: adminUser.id.toString(),
          email: adminUser.email,
          level: adminUser.role,
          displayName: `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim(),
          department: 'Administration',
          permissions: adminLevelConfig.permissions,
          dashboardRoute: adminLevelConfig.dashboardRoute
        },
        token: sessionToken,
        expiresAt
      };
    } catch (error) {
      console.error('❌ Admin authentication error:', error);
      return { success: false, message: 'Authentication failed' };
    }
  }

  async validateSession(token: string) {
    try {
      // Verify JWT
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      // Get admin user directly (simplified for existing schema)
      const admin = await db.select()
        .from(adminUsers)
        .where(and(
          eq(adminUsers.id, decoded.adminId),
          eq(adminUsers.isActive, true)
        ))
        .limit(1);

      if (admin.length === 0) {
        return { valid: false, message: 'Admin user not found' };
      }

      const adminUser = admin[0];
      const adminLevelConfig = adminLevels[adminUser.role as AdminLevel] || adminLevels.viewer;

      return {
        valid: true,
        admin: {
          id: adminUser.id.toString(),
          email: adminUser.email,
          level: adminUser.role,
          displayName: `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim(),
          department: 'Administration',
          permissions: adminLevelConfig.permissions,
          dashboardRoute: adminLevelConfig.dashboardRoute
        }
      };
    } catch (error) {
      return { valid: false, message: 'Session validation failed' };
    }
  }

  async logout(token: string) {
    try {
      // Verify token and get admin info
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      // Log logout
      await this.logAuditEntry(decoded.adminId, 'logout', 'authentication', {
        success: true
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Admin logout error:', error);
      return { success: false, message: 'Logout failed' };
    }
  }

  async getAdminLevels() {
    return Object.entries(adminLevels).map(([key, level]) => ({
      id: key,
      ...level
    }));
  }

  async hasPermission(adminId: string, permission: string): Promise<boolean> {
    try {
      const admin = await db.select()
        .from(adminUsers)
        .where(eq(adminUsers.id, parseInt(adminId)))
        .limit(1);

      if (admin.length === 0) return false;

      const adminLevelConfig = adminLevels[admin[0].role as keyof typeof adminLevels];
      if (!adminLevelConfig) return false;

      const permissions = adminLevelConfig.permissions;
      
      // Super admin has all permissions
      if (permissions.includes('*' as any)) return true;
      
      // Check specific permission
      return permissions.includes(permission as any);
    } catch (error) {
      return false;
    }
  }

  private generateSessionToken(admin: AdminUser): string {
    return jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        level: admin.role,
        iat: Math.floor(Date.now() / 1000)
      },
      this.jwtSecret,
      { expiresIn: `${this.tokenExpirationHours}h` }
    );
  }

  private async logAuditEntry(
    adminId: string | null,
    action: string,
    resource: string,
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      await db.insert(adminActivityLogs).values({
        userId: adminId ? parseInt(adminId) : 0,
        action,
        resource,
        details,
        ipAddress: ipAddress || '127.0.0.1',
        userAgent: userAgent || 'Unknown',
        success: details.success !== false
      });
    } catch (error) {
      console.error('❌ Failed to log audit entry:', error);
    }
  }

  async getAuditLogs(limit: number = 100) {
    try {
      return await db.select()
        .from(adminActivityLogs)
        .orderBy(adminActivityLogs.createdAt)
        .limit(limit);
    } catch (error) {
      console.error('❌ Failed to get audit logs:', error);
      return [];
    }
  }

  async createAdmin(adminData: {
    email: string;
    password: string;
    level: AdminLevel;
    displayName: string;
    department?: string;
  }, createdBy: string) {
    try {
      const passwordHash = await bcrypt.hash(adminData.password, 12);
      const [firstName, ...lastNameParts] = adminData.displayName.split(' ');
      const lastName = lastNameParts.join(' ');
      
      const newAdmin = await db.insert(adminUsers).values({
        username: adminData.email.split('@')[0],
        email: adminData.email,
        passwordHash,
        role: adminData.level,
        firstName,
        lastName,
        isActive: true,
      }).returning();

      // Log admin creation
      await this.logAuditEntry(createdBy, 'create_admin', 'user_management', {
        createdAdminId: newAdmin[0].id,
        email: adminData.email,
        level: adminData.level,
        success: true
      });

      return { success: true, admin: newAdmin[0] };
    } catch (error) {
      console.error('❌ Failed to create admin:', error);
      return { success: false, message: 'Failed to create admin user' };
    }
  }
}

export const unifiedAdminAuth = new UnifiedAdminAuthService();