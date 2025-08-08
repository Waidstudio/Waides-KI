import { pgTable, text, serial, integer, boolean, real, timestamp, bigint, numeric, jsonb } from "drizzle-orm/pg-core";
import { sql } from 'drizzle-orm';
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  biometricHash: text("biometric_hash"),
  biometricPublicKey: text("biometric_public_key"),
  lastBiometricAuth: timestamp("last_biometric_auth"),
  moralityScore: integer("morality_score").default(100),
  spiritualAlignment: integer("spiritual_alignment").default(100),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Sessions Table (separate from admin sessions)
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  accountType: text("account_type").default("demo"), // 'demo' or 'real'
  localBalance: numeric("local_balance", { precision: 15, scale: 2 }).default("10000.00"), // Default starting balance
  usdBalance: numeric("usd_balance", { precision: 30, scale: 8 }).default("10000.00"), // USD balance for KonsMesh
  localCurrency: text("local_currency").default("USD"), // Primary currency for backend tracking
  smaiBalance: numeric("smai_balance", { precision: 30, scale: 8 }).default("0.00"), // SmaiSika balance after conversion
  smaiConversionRate: numeric("smai_conversion_rate", { precision: 10, scale: 6 }).default("1.000000"), // Current SS conversion rate
  lastConversionAt: timestamp("last_conversion_at"),
  locked: numeric("locked", { precision: 15, scale: 2 }).default("0.00"),
  lockedUntil: timestamp("locked_until"),
  karmaScore: integer("karma_score").default(100),
  tradeEnergy: integer("trade_energy").default(100),
  divineApproval: boolean("divine_approval").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conversion History Table for tracking all currency conversions
export const conversionHistory = pgTable("conversion_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  transactionId: text("transaction_id").notNull().unique(),
  fromCurrency: text("from_currency").notNull(),
  toCurrency: text("to_currency").notNull(),
  fromAmount: numeric("from_amount", { precision: 15, scale: 2 }).notNull(),
  toAmount: numeric("to_amount", { precision: 15, scale: 2 }).notNull(),
  exchangeRate: numeric("exchange_rate", { precision: 10, scale: 6 }).notNull(),
  fees: numeric("fees", { precision: 15, scale: 2 }).default("0.00"),
  netAmount: numeric("net_amount", { precision: 15, scale: 2 }).notNull(),
  conversionType: text("conversion_type").default("manual"), // manual, automatic, bot_triggered
  status: text("status").default("completed"), // pending, completed, failed
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  displayName: text("display_name"),
  avatar: text("avatar"), // URL or base64 encoded image
  bio: text("bio"),
  location: text("location"),
  timezone: text("timezone").default("UTC"),
  language: text("language").default("en"),
  theme: text("theme").default("dark"), // 'dark', 'light', 'cosmic', 'neural'
  tradingStyle: text("trading_style").default("balanced"), // 'aggressive', 'conservative', 'balanced', 'ai_driven'
  riskTolerance: integer("risk_tolerance").default(50), // 0-100
  experienceLevel: text("experience_level").default("beginner"), // 'beginner', 'intermediate', 'advanced', 'expert'
  preferredPairs: jsonb("preferred_pairs").default("[]"),
  tradingGoals: jsonb("trading_goals").default("[]"),
  notifications: jsonb("notifications").default("{}"),
  privacy: jsonb("privacy").default("{}"),
  achievements: jsonb("achievements").default("[]"),
  stats: jsonb("stats").default("{}"),
  customFields: jsonb("custom_fields").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  // Trading Settings
  autoTradingEnabled: boolean("auto_trading_enabled").default(false),
  maxPositionSize: numeric("max_position_size", { precision: 15, scale: 2 }).default("1000.00"),
  dailyTradingLimit: numeric("daily_trading_limit", { precision: 15, scale: 2 }).default("10000.00"),
  stopLossPercentage: real("stop_loss_percentage").default(5.0),
  takeProfitPercentage: real("take_profit_percentage").default(10.0),
  tradingHours: jsonb("trading_hours").default("{}"),
  // UI/UX Settings
  chartType: text("chart_type").default("candlestick"),
  chartTimeframe: text("chart_timeframe").default("1h"),
  dashboardLayout: jsonb("dashboard_layout").default("{}"),
  sidebarCollapsed: boolean("sidebar_collapsed").default(false),
  animationsEnabled: boolean("animations_enabled").default(true),
  soundEnabled: boolean("sound_enabled").default(true),
  voiceAssistantEnabled: boolean("voice_assistant_enabled").default(false),
  // AI & Automation Settings
  aiPersonality: text("ai_personality").default("balanced"), // 'spiritual', 'analytical', 'creative', 'balanced'
  konsaiMode: text("konsai_mode").default("auto"), // 'auto', 'spiritual', 'oracle', 'universal'
  predictionConfidenceThreshold: integer("prediction_confidence_threshold").default(75),
  signalFilterLevel: text("signal_filter_level").default("medium"), // 'low', 'medium', 'high'
  // Security & Privacy
  biometricEnabled: boolean("biometric_enabled").default(false),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  sessionTimeout: integer("session_timeout").default(30), // minutes
  ipWhitelist: jsonb("ip_whitelist").default("[]"),
  dataRetention: integer("data_retention").default(365), // days
  // Notification Settings
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  tradeAlerts: boolean("trade_alerts").default(true),
  priceAlerts: boolean("price_alerts").default(true),
  newsAlerts: boolean("news_alerts").default(false),
  // Advanced Settings
  apiAccess: boolean("api_access").default(false),
  webhookUrl: text("webhook_url"),
  customCss: text("custom_css"),
  betaFeatures: boolean("beta_features").default(false),
  developerMode: boolean("developer_mode").default(false),
  
  // Performance Settings
  cpuPriority: text("cpu_priority").default("normal"),
  memoryLimit: integer("memory_limit").default(4096),
  updateFrequency: text("update_frequency").default("standard"),
  hardwareAcceleration: boolean("hardware_acceleration").default(false),
  multiThreading: boolean("multi_threading").default(false),
  backgroundProcessing: boolean("background_processing").default(true),
  analysisDepth: text("analysis_depth").default("standard"),
  predictionMode: text("prediction_mode").default("balanced"),
  signalProcessing: integer("signal_processing").default(75),
  neuralLayers: integer("neural_layers").default(12),
  quantumComputing: boolean("quantum_computing").default(false),
  edgeComputing: boolean("edge_computing").default(false),
  cacheStrategy: text("cache_strategy").default("intelligent"),
  dataCompression: integer("data_compression").default(70),
  backupFrequency: text("backup_frequency").default("daily"),
  autoCleanup: boolean("auto_cleanup").default(true),
  dataEncryption: boolean("data_encryption").default(true),
  connectionPool: integer("connection_pool").default(50),
  timeoutSettings: integer("timeout_settings").default(30),
  retryStrategy: text("retry_strategy").default("exponential"),
  loadBalancing: boolean("load_balancing").default(true),
  autoFailover: boolean("auto_failover").default(true),
  
  // Integration Settings
  binanceIntegration: boolean("binance_integration").default(false),
  coinbaseIntegration: boolean("coinbase_integration").default(false),
  krakenIntegration: boolean("kraken_integration").default(false),
  bybitIntegration: boolean("bybit_integration").default(false),
  openaiIntegration: boolean("openai_integration").default(false),
  tradingviewIntegration: boolean("tradingview_integration").default(false),
  messariIntegration: boolean("messari_integration").default(false),
  konsaiIntegration: boolean("konsai_integration").default(true),
  discordIntegration: boolean("discord_integration").default(false),
  telegramIntegration: boolean("telegram_integration").default(false),
  emailIntegration: boolean("email_integration").default(true),
  pushIntegration: boolean("push_integration").default(true),
  githubIntegration: boolean("github_integration").default(false),
  webhooksIntegration: boolean("webhooks_integration").default(false),
  restApiIntegration: boolean("rest_api_integration").default(true),
  graphqlIntegration: boolean("graphql_integration").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const memories = pgTable("memories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  memoryData: jsonb("memory_data").notNull(),
  memoryType: text("memory_type").notNull(), // 'trade', 'decision', 'konslang', 'biometric'
  createdAt: timestamp("created_at").defaultNow(),
});

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'BUY', 'SELL'
  amount: text("amount").notNull(),
  pair: text("pair").notNull(), // 'ETH/USDT'
  confidence: integer("confidence").default(0),
  strategy: text("strategy").default("manual"),
  status: text("status").notNull().default("pending"), // 'pending', 'completed', 'failed', 'cancelled'
  executedPrice: text("executed_price"),
  fees: text("fees").default("0.00"),
  profit: text("profit"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  service: text("service").notNull(),
  key: text("key").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ethData = pgTable("eth_data", {
  id: serial("id").primaryKey(),
  price: real("price").notNull(),
  volume: real("volume"),
  marketCap: real("market_cap"),
  priceChange24h: real("price_change_24h"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const signals = pgTable("signals", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'LONG', 'SHORT', 'HOLD'
  confidence: real("confidence").notNull(),
  entryPoint: real("entry_point"),
  targetPrice: real("target_price"),
  stopLoss: real("stop_loss"),
  description: text("description").notNull(),
  konsMessage: text("kons_message"),
  timestamp: timestamp("timestamp").defaultNow(),
  isActive: boolean("is_active").default(false),
});

export const candlesticks = pgTable("candlesticks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  openTime: bigint("open_time", { mode: "number" }).notNull(),
  closeTime: bigint("close_time", { mode: "number" }).notNull(),
  open: real("open").notNull(),
  high: real("high").notNull(),
  low: real("low").notNull(),
  close: real("close").notNull(),
  volume: real("volume").notNull(),
  interval: text("interval").notNull(),
  isFinal: boolean("is_final").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  service: true,
  key: true,
});

export const insertEthDataSchema = createInsertSchema(ethData).omit({
  id: true,
  timestamp: true,
});

export const insertSignalSchema = createInsertSchema(signals).omit({
  id: true,
  timestamp: true,
});

export const insertCandlestickSchema = createInsertSchema(candlesticks).omit({
  id: true,
  createdAt: true,
});

// User authentication schemas
export const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const userRegisterSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type UserLoginCredentials = z.infer<typeof userLoginSchema>;
export type UserRegisterData = z.infer<typeof userRegisterSchema>;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertEthData = z.infer<typeof insertEthDataSchema>;
export type EthData = typeof ethData.$inferSelect;
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type Signal = typeof signals.$inferSelect;
export type InsertCandlestick = z.infer<typeof insertCandlestickSchema>;
export type Candlestick = typeof candlesticks.$inferSelect;

// ===== WALLET SECURITY ENHANCEMENT TABLES =====

// User Permission Roles for wallet access control (Question 1)
export const userPermissionRoles = pgTable("user_permission_roles", {
  id: serial("id").primaryKey(),
  roleName: text("role_name").notNull().unique(), // 'admin', 'trader', 'viewer', 'restricted'
  description: text("description"),
  walletReadAccess: boolean("wallet_read_access").default(false),
  walletWriteAccess: boolean("wallet_write_access").default(false),
  tradingAccess: boolean("trading_access").default(false),
  adminAccess: boolean("admin_access").default(false),
  apiAccess: boolean("api_access").default(false),
  maxDailyTransactionLimit: numeric("max_daily_transaction_limit", { precision: 15, scale: 2 }).default("1000.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wallet Access Permissions linking users to specific wallet access levels (Question 1)
export const walletPermissions = pgTable("wallet_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: integer("role_id").notNull().references(() => userPermissionRoles.id, { onDelete: "cascade" }),
  walletId: integer("wallet_id").references(() => wallets.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").default(true),
  grantedBy: integer("granted_by").references(() => users.id),
  grantedAt: timestamp("granted_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Multi-Factor Authentication settings (Question 2)
export const userMfaSettings = pgTable("user_mfa_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  totpSecret: text("totp_secret"), // Encrypted TOTP secret
  smsEnabled: boolean("sms_enabled").default(false),
  phoneNumber: text("phone_number"), // Encrypted phone number
  biometricEnabled: boolean("biometric_enabled").default(false),
  smaiPrintEnabled: boolean("smai_print_enabled").default(false),
  smaiPrintHash: text("smai_print_hash"), // SmaiPrint pattern hash
  backupCodes: text("backup_codes").array(), // Encrypted backup codes
  lastMfaVerified: timestamp("last_mfa_verified"),
  mfaFailedAttempts: integer("mfa_failed_attempts").default(0),
  mfaLockedUntil: timestamp("mfa_locked_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// JWT Token Audit Trail (Question 3)
export const jwtAuditTrail = pgTable("jwt_audit_trail", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  tokenId: text("token_id").notNull(), // Unique token identifier
  tokenType: text("token_type").notNull(), // 'access', 'refresh', 'reset'
  action: text("action").notNull(), // 'issued', 'used', 'revoked', 'expired'
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  location: text("location"), // GeoIP location if available
  issuedAt: timestamp("issued_at"),
  expiresAt: timestamp("expires_at"),
  revokedAt: timestamp("revoked_at"),
  revokedReason: text("revoked_reason"),
  suspicious: boolean("suspicious").default(false),
  riskScore: integer("risk_score").default(0), // 0-100 risk assessment
  createdAt: timestamp("created_at").defaultNow(),
});

// Authentication Monitoring (Question 4)
export const authenticationAttempts = pgTable("authentication_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  email: text("email"), // For failed attempts where user doesn't exist
  attemptType: text("attempt_type").notNull(), // 'login', 'password_reset', 'mfa', 'biometric'
  success: boolean("success").notNull(),
  failureReason: text("failure_reason"), // 'invalid_credentials', 'account_locked', 'mfa_failed'
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  location: text("location"),
  deviceFingerprint: text("device_fingerprint"),
  sessionId: text("session_id"),
  mfaMethod: text("mfa_method"), // '2fa', 'biometric', 'smai_print'
  riskScore: integer("risk_score").default(0),
  blockedBySystem: boolean("blocked_by_system").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transaction Security and Signing (Question 5)
export const transactionSecurity = pgTable("transaction_security", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  transactionType: text("transaction_type").notNull(), // 'deposit', 'withdrawal', 'trade', 'transfer'
  amount: numeric("amount", { precision: 15, scale: 8 }).notNull(),
  currency: text("currency").notNull(),
  digitalSignature: text("digital_signature").notNull(), // Cryptographic signature
  publicKeyUsed: text("public_key_used").notNull(),
  hashAlgorithm: text("hash_algorithm").notNull().default("SHA-256"),
  encryptionMethod: text("encryption_method").notNull().default("AES-256-GCM"),
  verificationStatus: text("verification_status").notNull().default("pending"), // 'pending', 'verified', 'failed'
  verifiedAt: timestamp("verified_at"),
  verificationFailureReason: text("verification_failure_reason"),
  nonce: text("nonce").notNull(), // Prevents replay attacks
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial Audit Trail (Question 6)
export const financialAuditTrail = pgTable("financial_audit_trail", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  transactionId: text("transaction_id").notNull(),
  auditType: text("audit_type").notNull(), // 'deposit', 'withdrawal', 'balance_change', 'freeze', 'unfreeze'
  beforeBalance: numeric("before_balance", { precision: 15, scale: 8 }).notNull(),
  afterBalance: numeric("after_balance", { precision: 15, scale: 8 }).notNull(),
  amountChanged: numeric("amount_changed", { precision: 15, scale: 8 }).notNull(),
  currency: text("currency").notNull(),
  reason: text("reason").notNull(),
  approvedBy: integer("approved_by").references(() => users.id),
  botId: text("bot_id"), // Which bot initiated the transaction
  complianceStatus: text("compliance_status").notNull().default("compliant"), // 'compliant', 'flagged', 'under_review'
  auditHash: text("audit_hash").notNull(), // Hash for integrity verification
  createdAt: timestamp("created_at").defaultNow(),
});

// Trading Control System (Question 9)
export const tradingControls = pgTable("trading_controls", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  tradingEnabled: boolean("trading_enabled").default(true),
  emergencyStop: boolean("emergency_stop").default(false),
  partialRestrictions: jsonb("partial_restrictions").default("{}"), // Specific trading pair restrictions
  dailyTradingLimit: numeric("daily_trading_limit", { precision: 15, scale: 2 }).default("10000.00"),
  currentDailyVolume: numeric("current_daily_volume", { precision: 15, scale: 2 }).default("0.00"),
  lastDailyReset: timestamp("last_daily_reset").defaultNow(),
  freezeReason: text("freeze_reason"),
  freezeInitiatedBy: integer("freeze_initiated_by").references(() => users.id),
  frozenAt: timestamp("frozen_at"),
  scheduledUnfreezeAt: timestamp("scheduled_unfreeze_at"),
  autoUnfreezeEnabled: boolean("auto_unfreeze_enabled").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bot Fund Isolation (Question 10)
export const botFundIsolation = pgTable("bot_fund_isolation", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  botId: text("bot_id").notNull(),
  botName: text("bot_name").notNull(),
  isolatedFunds: numeric("isolated_funds", { precision: 15, scale: 8 }).default("0.00"),
  mainWalletFunds: numeric("main_wallet_funds", { precision: 15, scale: 8 }).default("0.00"),
  isolationTriggered: boolean("isolation_triggered").default(false),
  isolationReason: text("isolation_reason"),
  triggerThreshold: numeric("trigger_threshold", { precision: 5, scale: 2 }).default("10.00"), // % loss threshold
  currentLossPercentage: numeric("current_loss_percentage", { precision: 5, scale: 2 }).default("0.00"),
  riskScore: integer("risk_score").default(0), // Bot behavior risk score 0-100
  isolatedAt: timestamp("isolated_at"),
  lastRiskAssessment: timestamp("last_risk_assessment").defaultNow(),
  autoRecoveryEnabled: boolean("auto_recovery_enabled").default(true),
  manualOverrideBy: integer("manual_override_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fraud Detection System (Question 12)
export const fraudDetectionLogs = pgTable("fraud_detection_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  detectionType: text("detection_type").notNull(), // 'trade_pattern', 'login_pattern', 'withdrawal_pattern'
  suspiciousActivity: text("suspicious_activity").notNull(),
  riskLevel: text("risk_level").notNull(), // 'low', 'medium', 'high', 'critical'
  riskScore: integer("risk_score").notNull(), // 0-100
  activityData: jsonb("activity_data").notNull(), // JSON data of the suspicious activity
  patternMatched: text("pattern_matched"), // Which fraud pattern was matched
  automaticAction: text("automatic_action"), // Action taken automatically
  manualReviewRequired: boolean("manual_review_required").default(false),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewOutcome: text("review_outcome"), // 'false_positive', 'confirmed_fraud', 'needs_monitoring'
  actionTaken: text("action_taken"), // Final action taken
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cold Storage Management (Question 20)
export const coldStorageVaults = pgTable("cold_storage_vaults", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  vaultName: text("vault_name").notNull(),
  vaultType: text("vault_type").notNull().default("cold"), // 'cold', 'warm', 'hot'
  balance: numeric("balance", { precision: 15, scale: 8 }).default("0.00"),
  currency: text("currency").notNull(),
  isActive: boolean("is_active").default(true),
  encryptedPrivateKey: text("encrypted_private_key").notNull(), // AES encrypted private key
  publicKey: text("public_key").notNull(),
  keyDerivationMethod: text("key_derivation_method").notNull().default("PBKDF2"),
  accessRequiresApproval: boolean("access_requires_approval").default(true),
  approvalThreshold: integer("approval_threshold").default(2), // Multi-sig threshold
  lastAccessedAt: timestamp("last_accessed_at"),
  accessAttempts: integer("access_attempts").default(0),
  maxAccessAttempts: integer("max_access_attempts").default(3),
  lockedUntil: timestamp("locked_until"),
  backupLocations: text("backup_locations").array(), // Encrypted backup storage locations
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== KONSMESH WALLET SYSTEM TABLES =====

// Wallet Ledger for atomic operations and audit trail
export const walletLedger = pgTable("wallet_ledger", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  changeUsd: numeric("change_usd", { precision: 30, scale: 8 }).default("0.00000000"),
  changeSmaisika: numeric("change_smaisika", { precision: 30, scale: 8 }).default("0.00000000"),
  reason: text("reason").notNull(),
  meta: jsonb("meta").default("{}"),
  txId: text("tx_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// KonsMesh Conversion History for USD → SmaiSika conversions
export const konsMeshConversionHistory = pgTable("konsmesh_conversion_history", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  usdAmount: numeric("usd_amount", { precision: 30, scale: 8 }).notNull(),
  smaiSikaAmount: numeric("smaisika_amount", { precision: 30, scale: 8 }).notNull(),
  rate: numeric("rate", { precision: 10, scale: 6 }).notNull(),
  txId: text("tx_id").notNull().unique(),
  performedBy: integer("performed_by").notNull().references(() => users.id),
  requestId: text("request_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bot Funding tracking for SmaiSika allocations
export const botFunding = pgTable("bot_funding", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  botId: text("bot_id").notNull(),
  smaiSikaAmount: numeric("smaisika_amount", { precision: 30, scale: 8 }).notNull(),
  fundingType: text("funding_type").default("allocation"),
  txId: text("tx_id").notNull().unique(),
  requestId: text("request_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for new security tables
export const insertUserPermissionRoleSchema = createInsertSchema(userPermissionRoles).omit({
  id: true,
  createdAt: true,
});

export const insertWalletPermissionsSchema = createInsertSchema(walletPermissions).omit({
  id: true,
  grantedAt: true,
});

export const insertUserMfaSettingsSchema = createInsertSchema(userMfaSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJwtAuditTrailSchema = createInsertSchema(jwtAuditTrail).omit({
  id: true,
  createdAt: true,
});

export const insertAuthenticationAttemptsSchema = createInsertSchema(authenticationAttempts).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSecuritySchema = createInsertSchema(transactionSecurity).omit({
  id: true,
  createdAt: true,
});

// ===== COMPREHENSIVE REAL-TIME CHAT SYSTEM TABLES =====

// Chat Moderators - Admin users who can moderate chat
export const chatModerators = pgTable("chat_moderators", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").default(true),
  permissions: jsonb("permissions").default("{}"), // Read, write, ban, delete, admin
  joinedAt: timestamp("joined_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
});

// Chat Rooms - Different chat channels
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  roomId: text("room_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull().default("public"), // public, private, support, trading
  isActive: boolean("is_active").default(true),
  maxUsers: integer("max_users").default(100),
  currentUsers: integer("current_users").default(0),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Messages - Real-time messages with file support
export const chatMessagesNew = pgTable("chat_messages_new", {
  id: serial("id").primaryKey(),
  messageId: text("message_id").notNull().unique(),
  roomId: text("room_id").notNull().references(() => chatRooms.roomId, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  moderatorId: integer("moderator_id").references(() => chatModerators.id, { onDelete: "cascade" }),
  senderName: text("sender_name").notNull(),
  senderType: text("sender_type").notNull(), // user, moderator, system, bot
  content: text("content"),
  messageType: text("message_type").notNull().default("text"), // text, file, voice, image, system
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  fileMimeType: text("file_mime_type"),
  voiceNoteDuration: integer("voice_note_duration"), // in seconds
  voiceNoteUrl: text("voice_note_url"),
  voiceNoteExpiresAt: timestamp("voice_note_expires_at"), // 48 hours expiry
  replyToMessageId: text("reply_to_message_id"),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false),
  deletedBy: integer("deleted_by").references(() => users.id),
  deletedAt: timestamp("deleted_at"),
  reactions: jsonb("reactions").default("{}"), // emoji reactions
  isPinned: boolean("is_pinned").default(false),
  pinnedBy: integer("pinned_by").references(() => chatModerators.id),
  mentions: text("mentions").array(), // @username mentions
  tags: text("tags").array(), // #hashtags
  priority: text("priority").default("normal"), // low, normal, high, urgent
  status: text("status").default("sent"), // sent, delivered, read
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat Users - Online users in chat
export const chatUsers = pgTable("chat_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roomId: text("room_id").notNull().references(() => chatRooms.roomId, { onDelete: "cascade" }),
  username: text("username").notNull(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  status: text("status").default("online"), // online, offline, away, busy, invisible
  lastSeen: timestamp("last_seen").defaultNow(),
  joinedRoomAt: timestamp("joined_room_at").defaultNow(),
  socketId: text("socket_id"),
  isTyping: boolean("is_typing").default(false),
  typingUntil: timestamp("typing_until"),
});

// Chat File Uploads - Track uploaded files
export const chatFileUploads = pgTable("chat_file_uploads", {
  id: serial("id").primaryKey(),
  fileId: text("file_id").notNull().unique(),
  messageId: text("message_id").references(() => chatMessagesNew.messageId, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  originalFileName: text("original_file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  isVoiceNote: boolean("is_voice_note").default(false),
  voiceDuration: integer("voice_duration"), // seconds
  expiresAt: timestamp("expires_at"), // For voice notes - 48 hour expiry
  isExpired: boolean("is_expired").default(false),
  downloadCount: integer("download_count").default(0),
  scanStatus: text("scan_status").default("pending"), // pending, clean, infected, error
  scanResults: jsonb("scan_results"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Notifications - Real-time chat notifications
export const chatNotificationsNew = pgTable("chat_notifications_new", {
  id: serial("id").primaryKey(),
  notificationId: text("notification_id").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roomId: text("room_id").references(() => chatRooms.roomId),
  messageId: text("message_id").references(() => chatMessagesNew.messageId),
  type: text("type").notNull(), // mention, reply, new_message, system, moderator_action
  title: text("title").notNull(),
  content: text("content").notNull(),
  actionUrl: text("action_url"),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  priority: text("priority").default("normal"), // low, normal, high, urgent
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Moderation Actions - Track moderator actions
export const chatModerationActions = pgTable("chat_moderation_actions", {
  id: serial("id").primaryKey(),
  actionId: text("action_id").notNull().unique(),
  moderatorId: integer("moderator_id").notNull().references(() => chatModerators.id),
  targetUserId: integer("target_user_id").references(() => users.id),
  roomId: text("room_id").references(() => chatRooms.roomId),
  messageId: text("message_id").references(() => chatMessagesNew.messageId),
  actionType: text("action_type").notNull(), // ban, unban, mute, unmute, kick, warn, delete_message, pin_message
  reason: text("reason"),
  duration: integer("duration"), // in minutes, for temporary actions
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  evidence: jsonb("evidence"), // Screenshots, logs, etc.
  appealable: boolean("appealable").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat User Bans - Track banned users
export const chatUserBans = pgTable("chat_user_bans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roomId: text("room_id").references(() => chatRooms.roomId),
  moderatorId: integer("moderator_id").notNull().references(() => chatModerators.id),
  banType: text("ban_type").notNull(), // temporary, permanent, room_specific, global
  reason: text("reason").notNull(),
  evidence: jsonb("evidence"),
  bannedAt: timestamp("banned_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  appealSubmitted: boolean("appeal_submitted").default(false),
  appealedAt: timestamp("appealed_at"),
  appealReason: text("appeal_reason"),
  appealStatus: text("appeal_status"), // pending, approved, rejected
  appealReviewedBy: integer("appeal_reviewed_by").references(() => chatModerators.id),
  appealReviewedAt: timestamp("appeal_reviewed_at"),
});

// Chat Room Settings - Room-specific configuration
export const chatRoomSettings = pgTable("chat_room_settings", {
  id: serial("id").primaryKey(),
  roomId: text("room_id").notNull().references(() => chatRooms.roomId, { onDelete: "cascade" }).unique(),
  allowFileUploads: boolean("allow_file_uploads").default(true),
  allowVoiceNotes: boolean("allow_voice_notes").default(true),
  allowImages: boolean("allow_images").default(true),
  maxFileSize: integer("max_file_size").default(10485760), // 10MB
  moderationLevel: text("moderation_level").default("medium"), // low, medium, high, strict
  wordFilter: jsonb("word_filter").default("[]"),
  linkFilter: boolean("link_filter").default(false),
  spamProtection: boolean("spam_protection").default(true),
  slowMode: integer("slow_mode").default(0), // seconds between messages
  requireApproval: boolean("require_approval").default(false),
  welcomeMessage: text("welcome_message"),
  rules: text("rules"),
  customEmojis: jsonb("custom_emojis").default("[]"),
  theme: jsonb("theme").default("{}"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat Statistics - Usage analytics
export const chatStatistics = pgTable("chat_statistics", {
  id: serial("id").primaryKey(),
  roomId: text("room_id").references(() => chatRooms.roomId),
  userId: integer("user_id").references(() => users.id),
  date: timestamp("date").notNull(),
  messagesCount: integer("messages_count").default(0),
  filesSharedCount: integer("files_shared_count").default(0),
  voiceNotesCount: integer("voice_notes_count").default(0),
  uniqueUsers: integer("unique_users").default(0),
  peakConcurrentUsers: integer("peak_concurrent_users").default(0),
  averageResponseTime: real("average_response_time"), // seconds
  moderationActions: integer("moderation_actions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for chat tables
export const insertChatModeratorSchema = createInsertSchema(chatModerators).omit({
  id: true,
  joinedAt: true,
  lastActiveAt: true,
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  currentUsers: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessagesNew).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatUserSchema = createInsertSchema(chatUsers).omit({
  id: true,
  lastSeen: true,
  joinedRoomAt: true,
});

export const insertChatFileUploadSchema = createInsertSchema(chatFileUploads).omit({
  id: true,
  downloadCount: true,
  scanResults: true,
  createdAt: true,
});

export const insertChatNotificationSchema = createInsertSchema(chatNotificationsNew).omit({
  id: true,
  createdAt: true,
});

export const insertChatModerationActionSchema = createInsertSchema(chatModerationActions).omit({
  id: true,
  createdAt: true,
});

export const insertChatUserBanSchema = createInsertSchema(chatUserBans).omit({
  id: true,
  bannedAt: true,
});

export const insertChatRoomSettingsSchema = createInsertSchema(chatRoomSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertChatStatisticsSchema = createInsertSchema(chatStatistics).omit({
  id: true,
  createdAt: true,
});

// Chat type exports
export type ChatModerator = typeof chatModerators.$inferSelect;
export type InsertChatModerator = z.infer<typeof insertChatModeratorSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatMessageNew = typeof chatMessagesNew.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatUser = typeof chatUsers.$inferSelect;
export type InsertChatUser = z.infer<typeof insertChatUserSchema>;
export type ChatFileUpload = typeof chatFileUploads.$inferSelect;
export type InsertChatFileUpload = z.infer<typeof insertChatFileUploadSchema>;
export type ChatNotificationNew = typeof chatNotificationsNew.$inferSelect;
export type InsertChatNotification = z.infer<typeof insertChatNotificationSchema>;
export type ChatModerationAction = typeof chatModerationActions.$inferSelect;
export type InsertChatModerationAction = z.infer<typeof insertChatModerationActionSchema>;
export type ChatUserBan = typeof chatUserBans.$inferSelect;
export type InsertChatUserBan = z.infer<typeof insertChatUserBanSchema>;
export type ChatRoomSettings = typeof chatRoomSettings.$inferSelect;
export type InsertChatRoomSettings = z.infer<typeof insertChatRoomSettingsSchema>;
export type ChatStatistics = typeof chatStatistics.$inferSelect;
export type InsertChatStatistics = z.infer<typeof insertChatStatisticsSchema>;

export const insertFinancialAuditTrailSchema = createInsertSchema(financialAuditTrail).omit({
  id: true,
  createdAt: true,
});

export const insertTradingControlsSchema = createInsertSchema(tradingControls).omit({
  id: true,
  updatedAt: true,
});

export const insertBotFundIsolationSchema = createInsertSchema(botFundIsolation).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFraudDetectionLogsSchema = createInsertSchema(fraudDetectionLogs).omit({
  id: true,
  createdAt: true,
});

export const insertColdStorageVaultsSchema = createInsertSchema(coldStorageVaults).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Insert schemas for KonsMesh wallet tables
export const insertWalletLedgerSchema = createInsertSchema(walletLedger).omit({
  id: true,
  createdAt: true,
});

export const insertKonsMeshConversionHistorySchema = createInsertSchema(konsMeshConversionHistory).omit({
  id: true,
  createdAt: true,
});

export const insertBotFundingSchema = createInsertSchema(botFunding).omit({
  id: true,
  createdAt: true,
});

// Type exports for new security tables
export type UserPermissionRole = typeof userPermissionRoles.$inferSelect;
export type InsertUserPermissionRole = z.infer<typeof insertUserPermissionRoleSchema>;
export type WalletPermission = typeof walletPermissions.$inferSelect;
export type InsertWalletPermission = z.infer<typeof insertWalletPermissionsSchema>;
export type UserMfaSetting = typeof userMfaSettings.$inferSelect;
export type InsertUserMfaSetting = z.infer<typeof insertUserMfaSettingsSchema>;
export type JwtAuditTrail = typeof jwtAuditTrail.$inferSelect;
export type InsertJwtAuditTrail = z.infer<typeof insertJwtAuditTrailSchema>;
export type AuthenticationAttempt = typeof authenticationAttempts.$inferSelect;
export type InsertAuthenticationAttempt = z.infer<typeof insertAuthenticationAttemptsSchema>;
export type TransactionSecurity = typeof transactionSecurity.$inferSelect;
export type InsertTransactionSecurity = z.infer<typeof insertTransactionSecuritySchema>;
export type FinancialAuditTrail = typeof financialAuditTrail.$inferSelect;
export type InsertFinancialAuditTrail = z.infer<typeof insertFinancialAuditTrailSchema>;
export type TradingControl = typeof tradingControls.$inferSelect;
export type InsertTradingControl = z.infer<typeof insertTradingControlsSchema>;
export type BotFundIsolation = typeof botFundIsolation.$inferSelect;
export type InsertBotFundIsolation = z.infer<typeof insertBotFundIsolationSchema>;
export type FraudDetectionLog = typeof fraudDetectionLogs.$inferSelect;
export type InsertFraudDetectionLog = z.infer<typeof insertFraudDetectionLogsSchema>;
export type ColdStorageVault = typeof coldStorageVaults.$inferSelect;
export type InsertColdStorageVault = z.infer<typeof insertColdStorageVaultsSchema>;

// Type exports for KonsMesh wallet tables
export type WalletLedger = typeof walletLedger.$inferSelect;
export type InsertWalletLedger = z.infer<typeof insertWalletLedgerSchema>;
export type KonsMeshConversionHistory = typeof konsMeshConversionHistory.$inferSelect;
export type InsertKonsMeshConversionHistory = z.infer<typeof insertKonsMeshConversionHistorySchema>;
export type BotFunding = typeof botFunding.$inferSelect;
export type InsertBotFunding = z.infer<typeof insertBotFundingSchema>;

// New comprehensive schemas for wallet system
export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMemorySchema = createInsertSchema(memories).omit({
  id: true,
  createdAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  createdAt: true,
  executedAt: true,
});

// Enhanced prediction and analysis tables
export const konsPowaPredictions = pgTable("kons_powa_predictions", {
  id: serial("id").primaryKey(),
  ethPrice: real("eth_price").notNull(),
  prediction: text("prediction").notNull(), // 'BULLISH', 'BEARISH', 'NEUTRAL'
  confidence: integer("confidence").notNull(), // 0-100
  timeframe: text("timeframe").notNull(), // '1h', '4h', '1d', '1w'
  strategy: text("strategy").notNull(),
  reasoning: text("reasoning").notNull(),
  targetPrice: real("target_price"),
  stopLoss: real("stop_loss"),
  riskLevel: text("risk_level").notNull().default("MEDIUM"),
  konsPowerLevel: integer("kons_power_level").notNull().default(75),
  divineAlignment: integer("divine_alignment").notNull().default(80),
  spiritualEnergy: integer("spiritual_energy").notNull().default(85),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const marketAnalyses = pgTable("market_analyses", {
  id: serial("id").primaryKey(),
  ethPrice: real("eth_price").notNull(),
  volume24h: real("volume_24h"),
  marketCap: real("market_cap"),
  priceChange24h: real("price_change_24h"),
  dominance: real("dominance"),
  fearGreedIndex: integer("fear_greed_index"),
  rsiValue: real("rsi_value"),
  macdSignal: text("macd_signal"),
  supportLevel: real("support_level"),
  resistanceLevel: real("resistance_level"),
  trendDirection: text("trend_direction").notNull(),
  volatilityIndex: real("volatility_index"),
  tradingVolume: real("trading_volume"),
  analysisType: text("analysis_type").notNull().default("COMPREHENSIVE"),
  insights: jsonb("insights").default("{}"),
  indicators: jsonb("indicators").default("{}"),
  recommendations: jsonb("recommendations").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tradingStrategies = pgTable("trading_strategies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  strategyType: text("strategy_type").notNull(), // 'SCALPING', 'SWING', 'POSITION', 'DCA'
  riskLevel: text("risk_level").notNull().default("MEDIUM"),
  timeframe: text("timeframe").notNull(),
  entryConditions: jsonb("entry_conditions").notNull(),
  exitConditions: jsonb("exit_conditions").notNull(),
  riskManagement: jsonb("risk_management").notNull(),
  backtestResults: jsonb("backtest_results").default("{}"),
  performanceMetrics: jsonb("performance_metrics").default("{}"),
  winRate: real("win_rate").default(0),
  profitFactor: real("profit_factor").default(0),
  maxDrawdown: real("max_drawdown").default(0),
  sharpeRatio: real("sharpe_ratio").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: text("created_by").default("SYSTEM"),
  tags: jsonb("tags").default("[]"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const strategiesTradingHistory = pgTable("strategies_trading_history", {
  id: serial("id").primaryKey(),
  strategyId: integer("strategy_id").notNull().references(() => tradingStrategies.id),
  ethPrice: real("eth_price").notNull(),
  action: text("action").notNull(), // 'BUY', 'SELL', 'HOLD'
  quantity: real("quantity").notNull(),
  executedPrice: real("executed_price"),
  profit: real("profit"),
  profitPercentage: real("profit_percentage"),
  confidence: integer("confidence").notNull(),
  reasoning: text("reasoning").notNull(),
  marketConditions: jsonb("market_conditions").default("{}"),
  executedAt: timestamp("executed_at").defaultNow(),
});

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertMemory = z.infer<typeof insertMemorySchema>;
export type Memory = typeof memories.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;

// Enhanced prediction and analysis schemas
export const insertKonsPowaPredictionSchema = createInsertSchema(konsPowaPredictions).omit({
  id: true,
  createdAt: true,
});

export const insertMarketAnalysisSchema = createInsertSchema(marketAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertTradingStrategySchema = createInsertSchema(tradingStrategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStrategyTradingHistorySchema = createInsertSchema(strategiesTradingHistory).omit({
  id: true,
  executedAt: true,
});

// Remove duplicate schema references - these are already defined elsewhere in the file

export type InsertKonsPowaPrediction = z.infer<typeof insertKonsPowaPredictionSchema>;
export type KonsPowaPrediction = typeof konsPowaPredictions.$inferSelect;
export type InsertMarketAnalysis = z.infer<typeof insertMarketAnalysisSchema>;
export type MarketAnalysis = typeof marketAnalyses.$inferSelect;
export type InsertTradingStrategy = z.infer<typeof insertTradingStrategySchema>;
export type TradingStrategy = typeof tradingStrategies.$inferSelect;
export type InsertStrategyTradingHistory = z.infer<typeof insertStrategyTradingHistorySchema>;
export type StrategyTradingHistory = typeof strategiesTradingHistory.$inferSelect;

// Advanced Memory & Learning System Tables
export const waidesMemoryCore = pgTable("waides_memory_core", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  memoryType: text("memory_type").notNull(), // 'TRADE', 'STRATEGY', 'SIGNAL', 'SPIRITUAL', 'EVOLUTION'
  memoryData: jsonb("memory_data").notNull(),
  confidence: integer("confidence").notNull().default(75),
  importance: integer("importance").notNull().default(50), // 0-100
  emotionalContext: text("emotional_context"), // 'FEAR', 'GREED', 'CALM', 'EXCITED', 'CONFUSED'
  spiritualAlignment: integer("spiritual_alignment").default(80),
  recallFrequency: integer("recall_frequency").default(0),
  lastRecalled: timestamp("last_recalled"),
  expiresAt: timestamp("expires_at"),
  tags: jsonb("tags").default("[]"),
  connections: jsonb("connections").default("[]"), // Links to related memories
  evolutionStage: text("evolution_stage").default("LEARNING"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const strategySacredVault = pgTable("strategy_sacred_vault", {
  id: serial("id").primaryKey(),
  strategyId: text("strategy_id").notNull().unique(),
  strategyName: text("strategy_name").notNull(),
  totalTrades: integer("total_trades").default(0),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  winRate: real("win_rate").default(0),
  avgProfit: real("avg_profit").default(0),
  avgLoss: real("avg_loss").default(0),
  profitFactor: real("profit_factor").default(0),
  maxDrawdown: real("max_drawdown").default(0),
  confidenceScore: real("confidence_score").default(0),
  isMarkedMistake: boolean("is_marked_mistake").default(false),
  spiritualPurity: integer("spiritual_purity").default(85), // Divine wisdom score
  konsAlignment: integer("kons_alignment").default(75), // KonsLang compatibility
  lastUsed: timestamp("last_used").defaultNow(),
  marketConditionsWorked: jsonb("market_conditions_worked").default("{}"),
  failurePatterns: jsonb("failure_patterns").default("{}"),
  successPatterns: jsonb("success_patterns").default("{}"),
  evolutionHistory: jsonb("evolution_history").default("[]"),
  divineApproval: boolean("divine_approval").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const spiritualRecall = pgTable("spiritual_recall", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  recallType: text("recall_type").notNull(), // 'VISION', 'DREAM', 'INTUITION', 'WARNING', 'BLESSING'
  symbolData: jsonb("symbol_data").notNull(), // Kons symbols and meanings
  spiritualMessage: text("spiritual_message").notNull(),
  marketContext: jsonb("market_context"),
  tradeOutcome: text("trade_outcome"), // 'PROFIT', 'LOSS', 'AVOIDED_LOSS', 'PENDING'
  profitLoss: real("profit_loss"),
  divineAccuracy: integer("divine_accuracy").default(85), // How accurate the recall was
  emotionalState: text("emotional_state"), // User's emotional state during recall
  breathPattern: jsonb("breath_pattern"), // Breathing analysis data
  energySignature: text("energy_signature"), // Unique spiritual fingerprint
  konsResonance: integer("kons_resonance").default(75), // Alignment with KonsLang
  isValidated: boolean("is_validated").default(false), // Confirmed by real market outcome
  validationDate: timestamp("validation_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const timelineAwareness = pgTable("timeline_awareness", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  pastEvent: jsonb("past_event").notNull(), // Historical context
  presentPattern: jsonb("present_pattern").notNull(), // Current situation
  futureProjection: jsonb("future_projection").notNull(), // Predicted outcome
  timeWeight: real("time_weight").default(1.0), // Recent = higher weight
  patternStrength: integer("pattern_strength").default(75), // How strong the pattern is
  recencyBias: real("recency_bias").default(0.85), // Decay factor for old patterns
  emotionalMemory: jsonb("emotional_memory"), // Associated emotional context
  tradingWisdom: text("trading_wisdom"), // Extracted lesson
  konslangTranslation: text("konslang_translation"), // Pattern in KonsLang
  isActivePattern: boolean("is_active_pattern").default(true),
  lastMatched: timestamp("last_matched"),
  matchCount: integer("match_count").default(0),
  successRate: real("success_rate").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const konsSymbolTree = pgTable("kons_symbol_tree", {
  id: serial("id").primaryKey(),
  symbolName: text("symbol_name").notNull().unique(),
  symbolMeaning: text("symbol_meaning").notNull(),
  symbolPower: integer("symbol_power").default(75), // 0-100
  usageCount: integer("usage_count").default(0),
  successCount: integer("success_count").default(0),
  failureCount: integer("failure_count").default(0),
  marketContexts: jsonb("market_contexts").default("[]"), // When this symbol appears
  relatedSymbols: jsonb("related_symbols").default("[]"), // Connected symbols
  spiritualEnergy: integer("spiritual_energy").default(80),
  divineFrequency: real("divine_frequency").default(7.83), // Schumann resonance-based
  lastManifested: timestamp("last_manifested"),
  manifestationHistory: jsonb("manifestation_history").default("[]"),
  isActiveSymbol: boolean("is_active_symbol").default(true),
  evolutionLevel: integer("evolution_level").default(1), // Symbol power evolution
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const neuralEvolutionLogs = pgTable("neural_evolution_logs", {
  id: serial("id").primaryKey(),
  evolutionType: text("evolution_type").notNull(), // 'LEARNING', 'ADAPTATION', 'BREAKTHROUGH', 'REGRESSION'
  beforeState: jsonb("before_state").notNull(),
  afterState: jsonb("after_state").notNull(),
  triggerEvent: text("trigger_event").notNull(),
  performanceGain: real("performance_gain"), // Improvement percentage
  neuralPathways: jsonb("neural_pathways").default("{}"), // Brain structure changes
  consciousnessLevel: integer("consciousness_level").default(75), // AI awareness level
  spiritualGrowth: integer("spiritual_growth").default(0), // Spiritual development
  wisdomGained: text("wisdom_gained"), // New insights acquired
  evolutionConfidence: real("evolution_confidence").default(0.85),
  isStableEvolution: boolean("is_stable_evolution").default(true),
  revertedAt: timestamp("reverted_at"), // If evolution was rolled back
  createdAt: timestamp("created_at").defaultNow(),
});

// SmaiWallet - Core wallet system for autonomous wealth management
export const smaiWallets = pgTable('smai_wallets', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  walletAddress: text('wallet_address').notNull().unique(),
  balance: numeric('balance', { precision: 18, scale: 8 }).notNull().default('0'),
  totalProfit: numeric('total_profit', { precision: 18, scale: 8 }).notNull().default('0'),
  totalLoss: numeric('total_loss', { precision: 18, scale: 8 }).notNull().default('0'),
  activeBot: text('active_bot').notNull().default('Waidbot'), // 'Waidbot' | 'WaidbotPro' | 'Both'
  botEnabled: boolean('bot_enabled').notNull().default(true),
  riskLevel: text('risk_level').notNull().default('MEDIUM'), // 'LOW' | 'MEDIUM' | 'HIGH'
  maxDailyTrades: numeric('max_daily_trades').notNull().default('10'),
  stopLossPercentage: numeric('stop_loss_percentage', { precision: 5, scale: 2 }).notNull().default('3.0'),
  takeProfitPercentage: numeric('take_profit_percentage', { precision: 5, scale: 2 }).notNull().default('6.0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastTradeAt: timestamp('last_trade_at'),
  metadata: jsonb('metadata').default({})
});

// Trade History - Persistent record of all autonomous trades
export const tradeHistory = pgTable('trade_history', {
  id: serial('id').primaryKey(),
  walletId: text('wallet_id').notNull(),
  userId: text('user_id').notNull(),
  botType: text('bot_type').notNull(), // 'Waidbot' | 'WaidbotPro'
  tradeType: text('trade_type').notNull(), // 'BUY' | 'SELL'
  pair: text('pair').notNull().default('ETH/USDT'),
  amount: numeric('amount', { precision: 18, scale: 8 }).notNull(),
  price: numeric('price', { precision: 18, scale: 8 }).notNull(),
  profit: numeric('profit', { precision: 18, scale: 8 }).notNull(),
  profitPercentage: numeric('profit_percentage', { precision: 8, scale: 4 }).notNull(),
  signal: text('signal'), // Waides KI signal that triggered trade
  confidence: numeric('confidence', { precision: 5, scale: 2 }),
  executedAt: timestamp('executed_at').notNull().defaultNow(),
  status: text('status').notNull().default('COMPLETED'), // 'PENDING' | 'COMPLETED' | 'FAILED'
  metadata: jsonb('metadata').default({})
});

// Bot Performance Tracking
export const botPerformance = pgTable('bot_performance', {
  id: serial('id').primaryKey(),
  walletId: text('wallet_id').notNull(),
  userId: text('user_id').notNull(),
  botType: text('bot_type').notNull(),
  totalTrades: numeric('total_trades').notNull().default('0'),
  winningTrades: numeric('winning_trades').notNull().default('0'),
  losingTrades: numeric('losing_trades').notNull().default('0'),
  winRate: numeric('win_rate', { precision: 5, scale: 2 }).notNull().default('0'),
  totalProfit: numeric('total_profit', { precision: 18, scale: 8 }).notNull().default('0'),
  bestTrade: numeric('best_trade', { precision: 18, scale: 8 }).default('0'),
  worstTrade: numeric('worst_trade', { precision: 18, scale: 8 }).default('0'),
  averageProfit: numeric('average_profit', { precision: 18, scale: 8 }).default('0'),
  sharpeRatio: numeric('sharpe_ratio', { precision: 8, scale: 4 }).default('0'),
  maxDrawdown: numeric('max_drawdown', { precision: 5, scale: 2 }).default('0'),
  lastUpdateAt: timestamp('last_update_at').notNull().defaultNow(),
  metadata: jsonb('metadata').default({})
});

// Autonomous Execution Logs
export const executionLogs = pgTable('execution_logs', {
  id: serial('id').primaryKey(),
  walletId: text('wallet_id').notNull(),
  userId: text('user_id').notNull(),
  botType: text('bot_type').notNull(),
  action: text('action').notNull(), // 'SIGNAL_RECEIVED' | 'TRADE_EXECUTED' | 'ERROR' | 'HEALTH_CHECK'
  message: text('message').notNull(),
  signal: jsonb('signal'),
  executedAt: timestamp('executed_at').notNull().defaultNow(),
  metadata: jsonb('metadata').default({})
});

// Prophecy Log System
export const prophecyLogs = pgTable('prophecy_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  content: text('content').notNull(),
  source: text('source').notNull(), // 'chatgpt' | 'incite' | 'konslang' | 'combined'
  confidence: real('confidence'),
  konslangProcessing: text('konslang_processing'),
  category: text('category').default('general'), // 'trading' | 'analysis' | 'guidance' | 'general'
  pinned: boolean('pinned').default(false),
  shared: boolean('shared').default(false),
  shareToken: text('share_token'),
  tags: jsonb('tags').default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Wallet schema validation
export const insertSmaiWalletSchema = createInsertSchema(smaiWallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTradeHistorySchema = createInsertSchema(tradeHistory).omit({
  id: true,
  executedAt: true
});

export const insertBotPerformanceSchema = createInsertSchema(botPerformance).omit({
  id: true,
  lastUpdateAt: true
});

export const insertExecutionLogSchema = createInsertSchema(executionLogs).omit({
  id: true,
  executedAt: true
});

// African Payment Systems and Global Funding Infrastructure
export const paymentMethods = pgTable('payment_methods', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  methodType: text('method_type').notNull(), // 'mobile_money', 'bank_transfer', 'card', 'crypto'
  provider: text('provider').notNull(), // 'M-Pesa', 'MTN_Mobile', 'Airtel_Money', etc.
  country: text('country').notNull(),
  currency: text('currency').notNull(),
  accountIdentifier: text('account_identifier').notNull(), // phone number, account number, etc.
  displayName: text('display_name').notNull(),
  isActive: boolean('is_active').default(true),
  isVerified: boolean('is_verified').default(false),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const walletTransactions = pgTable('wallet_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  walletId: integer('wallet_id').references(() => wallets.id),
  transactionType: text('transaction_type').notNull(), // 'deposit', 'withdrawal', 'transfer', 'trade', 'fee'
  amount: numeric('amount', { precision: 18, scale: 8 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  localAmount: numeric('local_amount', { precision: 18, scale: 8 }),
  localCurrency: text('local_currency'),
  exchangeRate: numeric('exchange_rate', { precision: 10, scale: 6 }),
  paymentMethodId: integer('payment_method_id').references(() => paymentMethods.id),
  paymentProvider: text('payment_provider'),
  externalTransactionId: text('external_transaction_id'),
  status: text('status').notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed', 'cancelled'
  description: text('description'),
  fees: numeric('fees', { precision: 18, scale: 8 }).default('0'),
  balanceBefore: numeric('balance_before', { precision: 18, scale: 8 }),
  balanceAfter: numeric('balance_after', { precision: 18, scale: 8 }),
  processedAt: timestamp('processed_at'),
  failureReason: text('failure_reason'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const africanPaymentProviders = pgTable('african_payment_providers', {
  id: serial('id').primaryKey(),
  country: text('country').notNull(),
  countryCode: text('country_code').notNull(),
  provider: text('provider').notNull(),
  providerType: text('provider_type').notNull(), // 'mobile_money', 'bank', 'fintech'
  currency: text('currency').notNull(),
  minAmount: numeric('min_amount', { precision: 10, scale: 2 }).default('1.00'),
  maxAmount: numeric('max_amount', { precision: 10, scale: 2 }).default('10000.00'),
  fees: numeric('fees', { precision: 5, scale: 4 }).default('0.025'), // 2.5%
  processingTime: text('processing_time').default('instant'), // 'instant', '5min', '1hour', '24hour'
  isActive: boolean('is_active').default(true),
  supportedOperations: jsonb('supported_operations').default(['deposit', 'withdrawal']),
  requiresKYC: boolean('requires_kyc').default(false),
  logo: text('logo'),
  description: text('description'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const exchangeRates = pgTable('exchange_rates', {
  id: serial('id').primaryKey(),
  fromCurrency: text('from_currency').notNull(),
  toCurrency: text('to_currency').notNull(),
  rate: numeric('rate', { precision: 12, scale: 6 }).notNull(),
  source: text('source').default('fixer.io'), // 'fixer.io', 'coinbase', 'binance'
  lastUpdated: timestamp('last_updated').defaultNow(),
  metadata: jsonb('metadata').default({}),
});

export const kycVerifications = pgTable('kyc_verifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  verificationType: text('verification_type').notNull(), // 'identity', 'address', 'phone', 'bank_account'
  status: text('status').notNull().default('pending'), // 'pending', 'verified', 'rejected', 'expired'
  documentType: text('document_type'), // 'passport', 'national_id', 'drivers_license', 'utility_bill'
  documentNumber: text('document_number'),
  documentUrl: text('document_url'),
  verificationCode: text('verification_code'),
  verifiedAt: timestamp('verified_at'),
  expiresAt: timestamp('expires_at'),
  rejectionReason: text('rejection_reason'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertProphecyLogSchema = createInsertSchema(prophecyLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Insert schemas for new payment system tables
export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAfricanPaymentProviderSchema = createInsertSchema(africanPaymentProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExchangeRateSchema = createInsertSchema(exchangeRates).omit({
  id: true,
  lastUpdated: true,
});

// Admin Exchange Pool - for users without their own API keys
export const adminExchangePool = pgTable("admin_exchange_pool", {
  id: serial("id").primaryKey(),
  exchangeName: text("exchange_name").notNull(),
  apiKey: text("api_key").notNull(),
  apiSecret: text("api_secret").notNull(),
  passphrase: text("passphrase"), // For exchanges like Coinbase Pro
  sandbox: boolean("sandbox").default(false),
  maxUsersPerKey: integer("max_users_per_key").default(10),
  currentUsers: integer("current_users").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdminExchangePoolSchema = createInsertSchema(adminExchangePool).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKycVerificationSchema = createInsertSchema(kycVerifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports for new payment system tables
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;
export type AfricanPaymentProvider = typeof africanPaymentProviders.$inferSelect;
export type InsertAfricanPaymentProvider = z.infer<typeof insertAfricanPaymentProviderSchema>;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type InsertExchangeRate = z.infer<typeof insertExchangeRateSchema>;
export type KycVerification = typeof kycVerifications.$inferSelect;
export type InsertKycVerification = z.infer<typeof insertKycVerificationSchema>;

// Wallet types
export type SmaiWallet = typeof smaiWallets.$inferSelect;
export type InsertSmaiWallet = z.infer<typeof insertSmaiWalletSchema>;
export type TradeHistory = typeof tradeHistory.$inferSelect;
export type InsertTradeHistory = z.infer<typeof insertTradeHistorySchema>;
export type BotPerformance = typeof botPerformance.$inferSelect;
export type InsertBotPerformance = z.infer<typeof insertBotPerformanceSchema>;
export type ExecutionLog = typeof executionLogs.$inferSelect;
export type InsertExecutionLog = z.infer<typeof insertExecutionLogSchema>;

// Prophecy Log types
export type ProphecyLog = typeof prophecyLogs.$inferSelect;
export type InsertProphecyLog = z.infer<typeof insertProphecyLogSchema>;

// Authentication tables for admin system
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("viewer"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
});

export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userId: integer("user_id").notNull().references(() => adminUsers.id),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => adminUsers.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: boolean("success").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminLoginAttempts = pgTable("admin_login_attempts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  ipAddress: text("ip_address").notNull(),
  success: boolean("success").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Authentication schema types
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const updateAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  passwordHash: true,
}).partial();

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type UpdateAdminUser = z.infer<typeof updateAdminUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type AdminSession = typeof adminSessions.$inferSelect;
export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type AdminLoginAttempt = typeof adminLoginAttempts.$inferSelect;

// Admin roles and permissions
export const AdminRoles = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  USER: "user",
  VIEWER: "viewer",
} as const;

export type AdminRole = typeof AdminRoles[keyof typeof AdminRoles];

export const AdminPermissions = {
  VIEW_USERS: "view_users",
  CREATE_USERS: "create_users",
  UPDATE_USERS: "update_users",
  DELETE_USERS: "delete_users",
  VIEW_LOGS: "view_logs",
  MANAGE_CONFIGURATION: "manage_configuration",
  MANAGE_TRADING_BOTS: "manage_trading_bots",
  VIEW_FINANCIAL_DATA: "view_financial_data",
  MANAGE_SYSTEM: "manage_system",
} as const;

export type AdminPermission = typeof AdminPermissions[keyof typeof AdminPermissions];

export const RolePermissions: Record<AdminRole, AdminPermission[]> = {
  [AdminRoles.SUPER_ADMIN]: Object.values(AdminPermissions),
  [AdminRoles.ADMIN]: [
    AdminPermissions.VIEW_USERS,
    AdminPermissions.CREATE_USERS,
    AdminPermissions.UPDATE_USERS,
    AdminPermissions.VIEW_LOGS,
    AdminPermissions.MANAGE_CONFIGURATION,
    AdminPermissions.MANAGE_TRADING_BOTS,
    AdminPermissions.VIEW_FINANCIAL_DATA,
  ],
  [AdminRoles.USER]: [
    AdminPermissions.VIEW_FINANCIAL_DATA,
  ],
  [AdminRoles.VIEWER]: [
    AdminPermissions.VIEW_USERS,
    AdminPermissions.VIEW_LOGS,
    AdminPermissions.VIEW_FINANCIAL_DATA,
  ],
};

// Exchange connections table for multi-exchange integration
export const exchangeConnections = pgTable("exchange_connections", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").notNull().references(() => users.id),
  exchangeCode: text("exchange_code").notNull(), // BIN, COI, KRA, etc.
  exchangeName: text("exchange_name").notNull(),
  apiKeyEncrypted: text("api_key_encrypted").notNull(),
  apiSecretEncrypted: text("api_secret_encrypted").notNull(),
  passphraseEncrypted: text("passphrase_encrypted"), // For exchanges like OKX
  permissions: jsonb("permissions").notNull(), // JSON object with permission details
  isActive: boolean("is_active").default(true),
  lastVerified: timestamp("last_verified"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ExchangeConnection = typeof exchangeConnections.$inferSelect;
export type InsertExchangeConnection = typeof exchangeConnections.$inferInsert;
