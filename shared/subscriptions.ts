import { pgTable, varchar, timestamp, decimal, boolean, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Bot Hierarchy and Subscription Management Schema
 * Phase 1-4 Implementation of Complete Bot Subscription System
 */

// Bot Tiers Enum
export enum BotTier {
  FREE = 'free',           // Maibot - 35% platform fee, manual approval
  BASIC = 'basic',         // WaidBot α - $9.99/month, 20% platform fee  
  PRO = 'pro',             // WaidBot Pro β - $29.99/month, 10% platform fee
  ELITE = 'elite',         // Autonomous Trader γ - $59.99/month, fixed fee
  MASTER = 'master',       // Full Engine Ω - $149.99/month, advanced features
  DIVINE_DELTA = 'divine_delta',  // SmaiChinnikstah δ - $299.99/month, divine trading
  COSMIC_EPSILON = 'cosmic_epsilon'  // Nwaora Chigozie ε - $999.99/month, cosmic intelligence
}

// Subscription Status Enum
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending',
  TRIAL = 'trial'
}

// User Subscriptions Table
export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  botTier: varchar("bot_tier").notNull(),
  status: varchar("status").notNull().default(SubscriptionStatus.ACTIVE),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }),
  platformFeeRate: decimal("platform_fee_rate", { precision: 5, scale: 4 }), // e.g., 0.1500 = 15%
  isTrialActive: boolean("is_trial_active").default(false),
  trialEndDate: timestamp("trial_end_date"),
  paymentMethod: varchar("payment_method"), // stripe, paypal, crypto, etc.
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  features: text("features"), // JSON string of enabled features
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Bot Access Control Table
export const botAccessControl = pgTable("bot_access_control", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  botTier: varchar("bot_tier").notNull(),
  isEnabled: boolean("is_enabled").default(true),
  dailyTradingLimit: decimal("daily_trading_limit", { precision: 15, scale: 8 }), // Max daily trading amount
  monthlyTradingLimit: decimal("monthly_trading_limit", { precision: 15, scale: 8 }), // Max monthly trading amount
  maxPositionSize: decimal("max_position_size", { precision: 15, scale: 8 }), // Max position size per trade
  automationLevel: varchar("automation_level").notNull().default('manual'), // manual, semi_auto, full_auto
  strategiesEnabled: text("strategies_enabled"), // JSON array of enabled strategies
  lastAccessDate: timestamp("last_access_date"),
  usageCount: decimal("usage_count").default('0'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Subscription History Table
export const subscriptionHistory = pgTable("subscription_history", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action").notNull(), // upgrade, downgrade, cancel, renew, trial_start
  fromTier: varchar("from_tier"),
  toTier: varchar("to_tier").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  reason: text("reason"),
  paymentTransactionId: varchar("payment_transaction_id"),
  createdAt: timestamp("created_at").defaultNow()
});

// Bot Performance Tracking Table
export const botPerformanceTracking = pgTable("bot_performance_tracking", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  botTier: varchar("bot_tier").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  tradesExecuted: decimal("trades_executed").default('0'),
  profitGenerated: decimal("profit_generated", { precision: 15, scale: 8 }).default('0'),
  platformFees: decimal("platform_fees", { precision: 15, scale: 8 }).default('0'),
  winRate: decimal("win_rate", { precision: 5, scale: 4 }).default('0'), // e.g., 0.7500 = 75%
  totalVolume: decimal("total_volume", { precision: 20, scale: 8 }).default('0'),
  uptime: decimal("uptime", { precision: 5, scale: 4 }).default('0'), // percentage uptime
  createdAt: timestamp("created_at").defaultNow()
});

// Bot Tier Definitions
export const botTierDefinitions = {
  [BotTier.FREE]: {
    name: 'Maibot',
    displayName: 'Free Trading Assistant',
    monthlyPrice: 0,
    platformFeeRate: 0.35, // 35%
    maxPositionSize: 0.01,
    automationLevel: 'manual',
    features: [
      'Basic market analysis',
      'Manual trade approval',
      'Conservative risk management',
      'Email support',
      'Limited strategies'
    ],
    limitations: [
      'Manual approval required',
      '35% platform fee',
      'Limited position sizes',
      'Basic strategies only'
    ]
  },
  [BotTier.BASIC]: {
    name: 'WaidBot α',
    displayName: 'Basic ETH Uptrend Trading',
    monthlyPrice: 9.99,
    platformFeeRate: 0.20, // 20%
    maxPositionSize: 0.1,
    automationLevel: 'semi_auto',
    features: [
      'ETH uptrend-only trading',
      'Semi-automated execution',
      'Basic risk management',
      'Email & chat support',
      'Standard strategies'
    ],
    limitations: [
      'Uptrend trading only',
      '20% platform fee',
      'Semi-automated only'
    ]
  },
  [BotTier.PRO]: {
    name: 'WaidBot Pro β',
    displayName: 'Professional Bidirectional Trading',
    monthlyPrice: 29.99,
    platformFeeRate: 0.10, // 10%
    maxPositionSize: 0.5,
    automationLevel: 'full_auto',
    features: [
      'Bidirectional ETH3L/ETH3S trading',
      'Fully automated execution',
      'Advanced risk management',
      'Priority support',
      'Professional strategies',
      'Real-time alerts'
    ],
    limitations: [
      '10% platform fee'
    ]
  },
  [BotTier.ELITE]: {
    name: 'Autonomous Trader γ',
    displayName: '24/7 Market Scanner Elite',
    monthlyPrice: 59.99,
    platformFeeRate: 0.05, // 5%
    maxPositionSize: 1.0,
    automationLevel: 'full_auto',
    features: [
      '24/7 autonomous trading',
      'Multi-market scanning',
      'Advanced ML algorithms',
      'Premium support',
      'Elite strategies',
      'Custom alerts',
      'Portfolio management'
    ],
    limitations: [
      'Fixed monthly fee structure'
    ]
  },
  [BotTier.MASTER]: {
    name: 'Full Engine Ω',
    displayName: 'Master Trading Engine',
    monthlyPrice: 149.99,
    platformFeeRate: 0.03, // 3%
    maxPositionSize: 5.0,
    automationLevel: 'full_auto',
    features: [
      'Complete trading engine suite',
      'Advanced AI integration',
      'Smart risk management',
      'VIP support',
      'All strategies included',
      'Custom trading logic',
      'Advanced analytics',
      'Multi-exchange support'
    ],
    limitations: []
  },
  [BotTier.DIVINE_DELTA]: {
    name: 'SmaiChinnikstah δ',
    displayName: 'Divine Spiritual Trading',
    monthlyPrice: 299.99,
    platformFeeRate: 0.02, // 2%
    maxPositionSize: 10.0,
    automationLevel: 'full_auto',
    features: [
      'Spiritual market intelligence',
      'Divine trading signals',
      'Cosmic pattern recognition',
      'White-glove support',
      'Metaphysical strategies',
      'Karmic risk assessment',
      'Astral projection insights',
      'Sacred geometry analysis'
    ],
    limitations: []
  },
  [BotTier.COSMIC_EPSILON]: {
    name: 'Nwaora Chigozie ε',
    displayName: 'Cosmic Intelligence Omega',
    monthlyPrice: 999.99,
    platformFeeRate: 0.01, // 1%
    maxPositionSize: 50.0,
    automationLevel: 'full_auto',
    features: [
      'Cosmic consciousness trading',
      'Universal market intelligence',
      'Omniscient pattern recognition',
      'Divine support channel',
      'All cosmic strategies',
      'Quantum entanglement analysis',
      'Interdimensional signals',
      'Universal harmony trading',
      'Unlimited everything'
    ],
    limitations: []
  }
};

// Type definitions using Drizzle inference
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

export type BotAccessControl = typeof botAccessControl.$inferSelect;
export type InsertBotAccessControl = typeof botAccessControl.$inferInsert;

export type SubscriptionHistory = typeof subscriptionHistory.$inferSelect;
export type InsertSubscriptionHistory = typeof subscriptionHistory.$inferInsert;

export type BotPerformanceTracking = typeof botPerformanceTracking.$inferSelect;
export type InsertBotPerformanceTracking = typeof botPerformanceTracking.$inferInsert;

// Zod schemas for validation
export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions);
export const insertBotAccessControlSchema = createInsertSchema(botAccessControl);
export const insertSubscriptionHistorySchema = createInsertSchema(subscriptionHistory);
export const insertBotPerformanceTrackingSchema = createInsertSchema(botPerformanceTracking);

// API request/response schemas
export const subscriptionUpgradeRequestSchema = z.object({
  fromTier: z.string(),
  toTier: z.string(),
  paymentMethod: z.string(),
  promoCode: z.string().optional()
});

export const botAccessUpdateRequestSchema = z.object({
  botTier: z.string(),
  isEnabled: z.boolean(),
  dailyTradingLimit: z.number().optional(),
  monthlyTradingLimit: z.number().optional(),
  automationLevel: z.string().optional()
});

export type SubscriptionUpgradeRequest = z.infer<typeof subscriptionUpgradeRequestSchema>;
export type BotAccessUpdateRequest = z.infer<typeof botAccessUpdateRequestSchema>;

// Import users table reference
import { users } from "./schema";