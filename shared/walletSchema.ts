import { pgTable, text, numeric, timestamp, jsonb, serial, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

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

// Zod schemas for validation
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

// TypeScript types
export type SmaiWallet = typeof smaiWallets.$inferSelect;
export type InsertSmaiWallet = z.infer<typeof insertSmaiWalletSchema>;
export type TradeHistory = typeof tradeHistory.$inferSelect;
export type InsertTradeHistory = z.infer<typeof insertTradeHistorySchema>;
export type BotPerformance = typeof botPerformance.$inferSelect;
export type InsertBotPerformance = z.infer<typeof insertBotPerformanceSchema>;
export type ExecutionLog = typeof executionLogs.$inferSelect;
export type InsertExecutionLog = z.infer<typeof insertExecutionLogSchema>;