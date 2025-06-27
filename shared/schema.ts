import { pgTable, text, serial, integer, boolean, real, timestamp, bigint, numeric, jsonb } from "drizzle-orm/pg-core";
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

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  localBalance: numeric("local_balance", { precision: 15, scale: 2 }).default("0.00"),
  smaiBalance: numeric("smai_balance", { precision: 15, scale: 2 }).default("0.00"),
  locked: numeric("locked", { precision: 15, scale: 2 }).default("0.00"),
  lockedUntil: timestamp("locked_until"),
  karmaScore: integer("karma_score").default(100),
  tradeEnergy: integer("trade_energy").default(100),
  divineApproval: boolean("divine_approval").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertEthData = z.infer<typeof insertEthDataSchema>;
export type EthData = typeof ethData.$inferSelect;
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type Signal = typeof signals.$inferSelect;
export type InsertCandlestick = z.infer<typeof insertCandlestickSchema>;
export type Candlestick = typeof candlesticks.$inferSelect;

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
