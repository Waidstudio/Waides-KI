import { pgTable, serial, integer, text, timestamp, decimal, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const smaisaTransactions = pgTable('smaisa_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  type: text('type').notNull(), // 'credit', 'debit', 'convert_to', 'convert_from', 'mining', 'trade_profit', 'trade_loss', 'profit_share'
  amount: decimal('amount', { precision: 18, scale: 8 }).notNull(),
  currency: text('currency').default('SMAISA').notNull(), // 'SMAISA', 'BTC', 'ETH', 'USDT', etc.
  balanceBefore: decimal('balance_before', { precision: 18, scale: 8 }).notNull(),
  balanceAfter: decimal('balance_after', { precision: 18, scale: 8 }).notNull(),
  description: text('description').notNull(),
  referenceId: text('reference_id'), // Reference to trade, mining session, etc.
  referenceType: text('reference_type'), // 'trade', 'mining', 'conversion', 'profit_share'
  metadata: jsonb('metadata'), // Additional data (exchange rates, profit share details, etc.)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isReversed: boolean('is_reversed').default(false),
  reversalId: integer('reversal_id')
});

export const smaisaBalances = pgTable('smaisa_balances', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique(),
  balance: decimal('balance', { precision: 18, scale: 8 }).default('0').notNull(),
  lockedBalance: decimal('locked_balance', { precision: 18, scale: 8 }).default('0').notNull(),
  totalEarned: decimal('total_earned', { precision: 18, scale: 8 }).default('0').notNull(),
  totalSpent: decimal('total_spent', { precision: 18, scale: 8 }).default('0').notNull(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const smaisaConversionRates = pgTable('smaisa_conversion_rates', {
  id: serial('id').primaryKey(),
  fromCurrency: text('from_currency').notNull(),
  toCurrency: text('to_currency').notNull(),
  rate: decimal('rate', { precision: 18, scale: 8 }).notNull(),
  source: text('source').default('admin').notNull(), // 'admin', 'market', 'fixed'
  effectiveAt: timestamp('effective_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Insert schemas
export const insertSmaisaTransactionSchema = createInsertSchema(smaisaTransactions).omit({
  id: true,
  createdAt: true
});

export const insertSmaisaBalanceSchema = createInsertSchema(smaisaBalances).omit({
  id: true,
  createdAt: true,
  lastUpdated: true
});

export const insertSmaisaConversionRateSchema = createInsertSchema(smaisaConversionRates).omit({
  id: true,
  createdAt: true
});

// Types
export type SmaisaTransaction = typeof smaisaTransactions.$inferSelect;
export type InsertSmaisaTransaction = z.infer<typeof insertSmaisaTransactionSchema>;

export type SmaisaBalance = typeof smaisaBalances.$inferSelect;
export type InsertSmaisaBalance = z.infer<typeof insertSmaisaBalanceSchema>;

export type SmaisaConversionRate = typeof smaisaConversionRates.$inferSelect;
export type InsertSmaisaConversionRate = z.infer<typeof insertSmaisaConversionRateSchema>;

// Transaction types enum
export const SMAISA_TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  CONVERT_TO: 'convert_to',
  CONVERT_FROM: 'convert_from',
  MINING: 'mining',
  TRADE_PROFIT: 'trade_profit',
  TRADE_LOSS: 'trade_loss',
  PROFIT_SHARE: 'profit_share',
  REFERRAL_BONUS: 'referral_bonus',
  MEMBERSHIP_PAYMENT: 'membership_payment',
  ACHIEVEMENT_REWARD: 'achievement_reward'
} as const;

// Currency types
export const SUPPORTED_CURRENCIES = {
  SMAISA: 'SMAISA',
  BTC: 'BTC',
  ETH: 'ETH',
  USDT: 'USDT',
  XMR: 'XMR'
} as const;
