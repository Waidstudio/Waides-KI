import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin Users Table
export const adminUsers = pgTable("admin_users", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("viewer"), // 'super_admin', 'admin', 'viewer'
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  profileImage: text("profile_image"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
});

// Admin Sessions Table
export const adminSessions = pgTable("admin_sessions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id"),
  tokenHash: varchar("token_hash"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
});

// Admin Activity Logs Table
export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").references(() => adminUsers.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  success: boolean("success").default(true),
});

// Admin Login Attempts Table
export const adminLoginAttempts = pgTable("admin_login_attempts", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  email: varchar("email", { length: 255 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  userAgent: text("user_agent"),
  success: boolean("success").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  failureReason: varchar("failure_reason", { length: 100 }),
});

// Zod Schemas
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  passwordHash: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const updateAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  passwordHash: true,
}).partial().extend({
  newPassword: z.string().min(8).optional(),
  currentPassword: z.string().optional(),
});

// Types
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type UpdateAdminUser = z.infer<typeof updateAdminUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type AdminSession = typeof adminSessions.$inferSelect;
export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type AdminLoginAttempt = typeof adminLoginAttempts.$inferSelect;

// Role Definitions
export const AdminRoles = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin', 
  VIEWER: 'viewer'
} as const;

export type AdminRole = typeof AdminRoles[keyof typeof AdminRoles];

// Permission Definitions
export const AdminPermissions = {
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  UPDATE_USERS: 'update_users',
  DELETE_USERS: 'delete_users',
  
  // System Configuration
  VIEW_CONFIG: 'view_config',
  UPDATE_CONFIG: 'update_config',
  VIEW_ADVANCED_CONFIG: 'view_advanced_config',
  UPDATE_ADVANCED_CONFIG: 'update_advanced_config',
  
  // Trading Controls
  VIEW_TRADING: 'view_trading',
  CONTROL_TRADING: 'control_trading',
  VIEW_BOT_CONFIG: 'view_bot_config',
  UPDATE_BOT_CONFIG: 'update_bot_config',
  
  // Financial Data
  VIEW_FINANCIAL: 'view_financial',
  MANAGE_FINANCIAL: 'manage_financial',
  
  // Security & Audit
  VIEW_SECURITY: 'view_security',
  MANAGE_SECURITY: 'manage_security',
  VIEW_LOGS: 'view_logs',
  EXPORT_LOGS: 'export_logs',
  
  // System Administration
  SYSTEM_MAINTENANCE: 'system_maintenance',
  MANAGE_SESSIONS: 'manage_sessions',
  VIEW_INFRASTRUCTURE: 'view_infrastructure',
} as const;

export type AdminPermission = typeof AdminPermissions[keyof typeof AdminPermissions];

// Role Permission Mapping
export const RolePermissions: Record<AdminRole, AdminPermission[]> = {
  [AdminRoles.SUPER_ADMIN]: Object.values(AdminPermissions),
  [AdminRoles.ADMIN]: [
    AdminPermissions.VIEW_USERS,
    AdminPermissions.UPDATE_USERS,
    AdminPermissions.VIEW_CONFIG,
    AdminPermissions.UPDATE_CONFIG,
    AdminPermissions.VIEW_TRADING,
    AdminPermissions.CONTROL_TRADING,
    AdminPermissions.VIEW_BOT_CONFIG,
    AdminPermissions.UPDATE_BOT_CONFIG,
    AdminPermissions.VIEW_FINANCIAL,
    AdminPermissions.VIEW_SECURITY,
    AdminPermissions.VIEW_LOGS,
    AdminPermissions.VIEW_INFRASTRUCTURE,
  ],
  [AdminRoles.VIEWER]: [
    AdminPermissions.VIEW_USERS,
    AdminPermissions.VIEW_CONFIG,
    AdminPermissions.VIEW_TRADING,
    AdminPermissions.VIEW_BOT_CONFIG,
    AdminPermissions.VIEW_FINANCIAL,
    AdminPermissions.VIEW_SECURITY,
    AdminPermissions.VIEW_LOGS,
    AdminPermissions.VIEW_INFRASTRUCTURE,
  ],
};