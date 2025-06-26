import { pgTable, text, serial, integer, boolean, real, timestamp, bigint, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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

export const insertProphecyLogSchema = createInsertSchema(prophecyLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

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
