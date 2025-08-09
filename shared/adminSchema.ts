import { sql } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  boolean,
  text,
  jsonb,
} from "drizzle-orm/pg-core";

// Admin user levels and their hierarchical permissions
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash").notNull(),
  adminLevel: varchar("admin_level").notNull(), // 'super', 'system', 'trading', 'support', 'viewer'
  displayName: varchar("display_name").notNull(),
  department: varchar("department"), // e.g., 'Trading Operations', 'System Management'
  permissions: jsonb("permissions").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by"), // Reference to admin who created this user
  sessionToken: varchar("session_token"),
  sessionExpiresAt: timestamp("session_expires_at"),
});

// Admin session management
export const adminSessions = pgTable("admin_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull(),
  token: varchar("token").notNull(),
  adminLevel: varchar("admin_level").notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Admin activity audit log
export const adminAuditLog = pgTable("admin_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull(),
  adminLevel: varchar("admin_level").notNull(),
  action: varchar("action").notNull(), // 'login', 'logout', 'config_change', 'user_management'
  resource: varchar("resource"), // What was accessed/modified
  details: jsonb("details").$type<Record<string, any>>(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
  success: boolean("success").default(true),
});

// Admin level definitions and their capabilities
export const adminLevels = {
  super: {
    name: 'Super Admin',
    description: 'Ultimate system control with all permissions',
    color: 'red',
    icon: 'Crown',
    permissions: ['*'], // All permissions
    dashboardRoute: '/super-admin',
  },
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
    dashboardRoute: '/system-admin',
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
    dashboardRoute: '/trading-admin',
  },
  support: {
    name: 'Support Admin',
    description: 'User support and customer service',
    color: 'green',
    icon: 'HeadphonesIcon',
    permissions: [
      'user.support',
      'transaction.view',
      'support.tickets',
      'user.communication'
    ],
    dashboardRoute: '/support-admin',
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
    dashboardRoute: '/viewer-admin',
  }
} as const;

export type AdminLevel = keyof typeof adminLevels;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;
export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertAdminSession = typeof adminSessions.$inferInsert;
export type AdminAuditEntry = typeof adminAuditLog.$inferSelect;
export type InsertAdminAuditEntry = typeof adminAuditLog.$inferInsert;