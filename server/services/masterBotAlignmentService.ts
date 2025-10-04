/**
 * 🔹 Waides KI Master Bot Alignment Service
 * Central configuration and management for all TredBeings (trading bots)
 * Ensures correct market alignment, currency handling, profit sharing, and risk management
 */

import { smaisikaMiningEngine } from './smaisikaMiningEngine';

// Bot Market Type Definitions
export type MarketType = 'binary' | 'forex' | 'spot';
export type BotTier = 'free' | 'basic' | 'pro' | 'premium' | 'autonomous';

export interface BotConfiguration {
  id: string;
  name: string;
  displayName: string;
  symbol: string; // Greek letter symbol
  marketType: MarketType;
  tier: BotTier;
  description: string;
  role: string;
  features: string[];
  pricing: {
    currency: 'Smaisika';
    amount: number; // In Smaisika (1:1 USD)
    isManuallyAdjustable: boolean;
    billingCycle: 'one-time' | 'monthly' | 'yearly';
  };
  riskManagement: {
    defaultRiskPercent: number;
    minRiskPercent: number;
    maxRiskPercent: number;
    adminAdjustable: boolean;
  };
  profitSharing: {
    enabled: boolean;
    userShare: number; // Percentage
    treasuryShare: number; // Percentage
  };
  connectors: string[]; // Compatible connector codes
  isActive: boolean;
  isAutonomous: boolean;
}

// Master Bot Registry - All 7 TredBeings
export const BOT_REGISTRY: Record<string, BotConfiguration> = {
  'waidbot-alpha': {
    id: 'waidbot-alpha',
    name: 'WaidBot Alpha',
    displayName: 'WaidBot α (Alpha)',
    symbol: 'α',
    marketType: 'binary',
    tier: 'basic',
    description: 'Entry-level binary options trading bot',
    role: 'Binary Options Master - ETH uptrend specialist',
    features: [
      'Binary options trading',
      'ETH trend following',
      'Basic market analysis',
      'Real-time signals'
    ],
    pricing: {
      currency: 'Smaisika',
      amount: 50, // 50 Smaisika = $50 USD
      isManuallyAdjustable: true,
      billingCycle: 'monthly'
    },
    riskManagement: {
      defaultRiskPercent: 2.0,
      minRiskPercent: 0.5,
      maxRiskPercent: 5.0,
      adminAdjustable: true
    },
    profitSharing: {
      enabled: true,
      userShare: 50,
      treasuryShare: 50
    },
    connectors: ['DERIV', 'IQOPTION', 'POCKETOPTION', 'QUOTEX', 'OLYMPTRADE', 'BINOMO', 'EXPERTOPTION', 'RACEOPTION', 'BINARYCOM'],
    isActive: true,
    isAutonomous: false
  },
  
  'waidbot-pro-beta': {
    id: 'waidbot-pro-beta',
    name: 'WaidBot Pro Beta',
    displayName: 'WaidBot Pro β (Beta)',
    symbol: 'β',
    marketType: 'binary',
    tier: 'pro',
    description: 'Advanced bidirectional binary options trading',
    role: 'Advanced Binary Trader - ETH3L/ETH3S specialist',
    features: [
      'Bidirectional binary trading',
      'ETH3L/ETH3S leverage',
      'Advanced analysis',
      'Higher trade frequency',
      'AI-powered signals'
    ],
    pricing: {
      currency: 'Smaisika',
      amount: 150, // 150 Smaisika = $150 USD
      isManuallyAdjustable: true,
      billingCycle: 'monthly'
    },
    riskManagement: {
      defaultRiskPercent: 2.0,
      minRiskPercent: 1.0,
      maxRiskPercent: 10.0,
      adminAdjustable: true
    },
    profitSharing: {
      enabled: true,
      userShare: 50,
      treasuryShare: 50
    },
    connectors: ['DERIV', 'IQOPTION', 'POCKETOPTION', 'QUOTEX', 'OLYMPTRADE', 'BINOMO', 'EXPERTOPTION', 'RACEOPTION', 'BINARYCOM'],
    isActive: true,
    isAutonomous: false
  },
  
  'maibot': {
    id: 'maibot',
    name: 'Maibot',
    displayName: 'Maibot',
    symbol: 'M',
    marketType: 'binary',
    tier: 'free',
    description: 'Free entry-level bot for beginners',
    role: 'Entry-Level Learning Bot - Small growth binary trading',
    features: [
      'Binary options basics',
      'Learning mode',
      'Manual approval trades',
      'Educational insights',
      'Platform fee: 30-40%'
    ],
    pricing: {
      currency: 'Smaisika',
      amount: 0, // Free tier
      isManuallyAdjustable: false,
      billingCycle: 'one-time'
    },
    riskManagement: {
      defaultRiskPercent: 2.0,
      minRiskPercent: 0.5,
      maxRiskPercent: 3.0,
      adminAdjustable: true
    },
    profitSharing: {
      enabled: true,
      userShare: 50, // 50/50 automatic profit sharing (aligned with all bots)
      treasuryShare: 50
    },
    connectors: ['DERIV', 'IQOPTION', 'POCKETOPTION', 'QUOTEX', 'OLYMPTRADE', 'BINOMO', 'EXPERTOPTION', 'RACEOPTION', 'BINARYCOM'],
    isActive: true,
    isAutonomous: false
  },
  
  'autonomous-trader-gamma': {
    id: 'autonomous-trader-gamma',
    name: 'Autonomous Trader Gamma',
    displayName: 'Autonomous Trader γ (Gamma)',
    symbol: 'γ',
    marketType: 'forex',
    tier: 'premium',
    description: '24/7 autonomous forex/CFD trading',
    role: 'Forex Pro - Multi-strategy trading with Deriv/MT5/Oanda',
    features: [
      'Forex/CFD trading',
      '24/7 autonomous operation',
      'Multi-strategy analysis',
      'ETH/BTC/SOL pairs',
      'Advanced AI models'
    ],
    pricing: {
      currency: 'Smaisika',
      amount: 300, // 300 Smaisika = $300 USD
      isManuallyAdjustable: true,
      billingCycle: 'monthly'
    },
    riskManagement: {
      defaultRiskPercent: 2.0,
      minRiskPercent: 1.0,
      maxRiskPercent: 8.0,
      adminAdjustable: true
    },
    profitSharing: {
      enabled: true,
      userShare: 50,
      treasuryShare: 50
    },
    connectors: ['DERIV_FOREX', 'MT4', 'MT5', 'CTRADER', 'OANDA', 'FXCM'],
    isActive: true,
    isAutonomous: true
  },
  
  'full-engine-omega': {
    id: 'full-engine-omega',
    name: 'Full Engine Omega',
    displayName: 'Full Engine Ω (Omega)',
    symbol: 'Ω',
    marketType: 'spot',
    tier: 'premium',
    description: 'Advanced spot exchange trading engine',
    role: 'Spot Engine - Binance/Kucoin/Bybit master',
    features: [
      'Spot exchange trading',
      'Multi-exchange support',
      'Smart risk management',
      'ML-powered coordination',
      'Guardian decision system'
    ],
    pricing: {
      currency: 'Smaisika',
      amount: 250, // 250 Smaisika = $250 USD
      isManuallyAdjustable: true,
      billingCycle: 'monthly'
    },
    riskManagement: {
      defaultRiskPercent: 2.0,
      minRiskPercent: 1.0,
      maxRiskPercent: 10.0,
      adminAdjustable: true
    },
    profitSharing: {
      enabled: true,
      userShare: 50,
      treasuryShare: 50
    },
    connectors: ['BINANCE', 'COINBASE', 'KRAKEN', 'KUCOIN', 'BYBIT', 'BITFINEX', 'OKX', 'GATEIO', 'GEMINI'],
    isActive: true,
    isAutonomous: false
  },
  
  'smai-chinnikstah-delta': {
    id: 'smai-chinnikstah-delta',
    name: 'Smai Chinnikstah Delta',
    displayName: 'Smai Chinnikstah Δ (Delta)',
    symbol: 'Δ',
    marketType: 'binary', // Primary market, can broadcast to all
    tier: 'autonomous',
    description: 'Central signal broadcaster and energy hub',
    role: 'Energy Distribution Hub - Signal broadcaster to all bots',
    features: [
      'Central signal broadcasting',
      '20% energy boost',
      'Multi-bot coordination',
      'Real-time signal distribution',
      'High-confidence analysis'
    ],
    pricing: {
      currency: 'Smaisika',
      amount: 500, // 500 Smaisika = $500 USD (premium autonomous)
      isManuallyAdjustable: true,
      billingCycle: 'monthly'
    },
    riskManagement: {
      defaultRiskPercent: 2.0,
      minRiskPercent: 1.5,
      maxRiskPercent: 12.0,
      adminAdjustable: true
    },
    profitSharing: {
      enabled: true,
      userShare: 50,
      treasuryShare: 50
    },
    connectors: ['DERIV', 'IQOPTION', 'POCKETOPTION', 'QUOTEX', 'OLYMPTRADE', 'BINOMO', 'EXPERTOPTION', 'RACEOPTION', 'BINARYCOM'],
    isActive: true,
    isAutonomous: true
  },
  
  'nwaora-chigozie-epsilon': {
    id: 'nwaora-chigozie-epsilon',
    name: 'Nwaora Chigozie Epsilon',
    displayName: 'Nwaora Chigozie ε (Epsilon)',
    symbol: 'ε',
    marketType: 'binary', // Can switch between binary and spot
    tier: 'autonomous',
    description: 'Always-on guardian and backup trading system',
    role: 'Guardian System - 24/7 protection and autonomous trading',
    features: [
      'Always-on guardian mode',
      'Binary & spot trading',
      'Autonomous operation',
      'Emergency intervention',
      'Backup trading system',
      '24/7 monitoring'
    ],
    pricing: {
      currency: 'Smaisika',
      amount: 0, // Admin-only autonomous account
      isManuallyAdjustable: false,
      billingCycle: 'one-time'
    },
    riskManagement: {
      defaultRiskPercent: 2.0,
      minRiskPercent: 1.0,
      maxRiskPercent: 15.0,
      adminAdjustable: true
    },
    profitSharing: {
      enabled: true,
      userShare: 50, // 50/50 automatic profit sharing (aligned with all bots)
      treasuryShare: 50
    },
    connectors: [
      'DERIV', 'IQOPTION', 'POCKETOPTION', 'QUOTEX', 'OLYMPTRADE', 'BINOMO', 'EXPERTOPTION', 'RACEOPTION', 'BINARYCOM',
      'BINANCE', 'COINBASE', 'KRAKEN', 'KUCOIN', 'BYBIT', 'BITFINEX', 'OKX', 'GATEIO', 'GEMINI'
    ],
    isActive: true,
    isAutonomous: true
  }
};

// Currency Configuration
export const CURRENCY_CONFIG = {
  baseCurrency: 'Smaisika',
  exchangeRate: 1.0, // 1 Smaisika = 1 USD
  depositCurrencies: ['USDT', 'BTC', 'ETH', 'BNB'],
  withdrawalCurrencies: ['USDT', 'BTC', 'ETH', 'BNB'],
  conversionRates: {
    // These would be fetched from real-time APIs in production
    USDT: 1.0,    // 1 USDT = 1 Smaisika
    BTC: 43250.0, // 1 BTC = 43250 Smaisika
    ETH: 2450.0,  // 1 ETH = 2450 Smaisika
    BNB: 315.0    // 1 BNB = 315 Smaisika
  }
};

// Membership Tiers
export interface MembershipTier {
  id: string;
  name: string;
  price: number; // In Smaisika
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  botAccess: string[]; // Bot IDs accessible
  isManuallyAdjustable: boolean;
}

export const MEMBERSHIP_TIERS: Record<string, MembershipTier> = {
  free: {
    id: 'free',
    name: 'Free Tier',
    price: 0,
    billingCycle: 'monthly',
    features: [
      'Access to Maibot (Free)',
      'Basic trading signals',
      'Educational content',
      '35% platform fee on profits'
    ],
    botAccess: ['maibot'],
    isManuallyAdjustable: false
  },
  basic: {
    id: 'basic',
    name: 'Basic Trader',
    price: 50,
    billingCycle: 'monthly',
    features: [
      'Access to WaidBot Alpha',
      'Binary options trading',
      'Real-time signals',
      '50/50 profit sharing'
    ],
    botAccess: ['maibot', 'waidbot-alpha'],
    isManuallyAdjustable: true
  },
  pro: {
    id: 'pro',
    name: 'Pro Trader',
    price: 200,
    billingCycle: 'monthly',
    features: [
      'Access to WaidBot Pro Beta',
      'Advanced binary trading',
      'AI-powered analysis',
      '50/50 profit sharing'
    ],
    botAccess: ['maibot', 'waidbot-alpha', 'waidbot-pro-beta'],
    isManuallyAdjustable: true
  },
  premium: {
    id: 'premium',
    name: 'Premium Trader',
    price: 500,
    billingCycle: 'monthly',
    features: [
      'Access to all trading bots',
      'Forex, Binary, and Spot trading',
      '24/7 autonomous trading',
      'Priority support',
      '50/50 profit sharing'
    ],
    botAccess: ['maibot', 'waidbot-alpha', 'waidbot-pro-beta', 'autonomous-trader-gamma', 'full-engine-omega'],
    isManuallyAdjustable: true
  },
  vip: {
    id: 'vip',
    name: 'VIP Autonomous',
    price: 1000,
    billingCycle: 'monthly',
    features: [
      'Access to ALL bots including autonomous',
      'Signal broadcasting from Smai Chinnikstah',
      'Guardian protection',
      'Custom risk management',
      'Dedicated support',
      '50/50 profit sharing'
    ],
    botAccess: ['maibot', 'waidbot-alpha', 'waidbot-pro-beta', 'autonomous-trader-gamma', 'full-engine-omega', 'smai-chinnikstah-delta'],
    isManuallyAdjustable: true
  }
};

// Risk Management Configuration
export const RISK_MANAGEMENT_CONFIG = {
  defaultRiskPercent: 2.0,
  globalMinRiskPercent: 0.5,
  globalMaxRiskPercent: 20.0,
  adminCanAdjust: true,
  userCanAdjustRange: {
    min: 0.5,
    max: 10.0 // Users can adjust within 0.5% - 10% range
  }
};

class MasterBotAlignmentService {
  // Get bot configuration
  getBotConfig(botId: string): BotConfiguration | null {
    return BOT_REGISTRY[botId] || null;
  }

  // Get all bots by market type
  getBotsByMarketType(marketType: MarketType): BotConfiguration[] {
    return Object.values(BOT_REGISTRY).filter(bot => bot.marketType === marketType);
  }

  // Get all bots by tier
  getBotsByTier(tier: BotTier): BotConfiguration[] {
    return Object.values(BOT_REGISTRY).filter(bot => bot.tier === tier);
  }

  // Validate bot-to-connector compatibility
  validateBotConnector(botId: string, connectorCode: string): { valid: boolean; reason?: string } {
    const bot = this.getBotConfig(botId);
    if (!bot) {
      return { valid: false, reason: 'Bot not found' };
    }

    if (!bot.connectors.includes(connectorCode)) {
      return { 
        valid: false, 
        reason: `${connectorCode} is not compatible with ${bot.displayName}. This bot requires ${bot.marketType} market connectors.` 
      };
    }

    return { valid: true };
  }

  // Get membership tier access
  getMembershipAccess(tierId: string): string[] {
    return MEMBERSHIP_TIERS[tierId]?.botAccess || [];
  }

  // Calculate profit sharing
  async calculateProfitSharing(botId: string, grossProfit: number, userId: number): Promise<{ userProfit: number; treasuryShare: number }> {
    const bot = this.getBotConfig(botId);
    if (!bot || !bot.profitSharing.enabled) {
      return { userProfit: grossProfit, treasuryShare: 0 };
    }

    const userShare = (grossProfit * bot.profitSharing.userShare) / 100;
    const treasuryShare = (grossProfit * bot.profitSharing.treasuryShare) / 100;

    // Record in SmaisikaMiningEngine
    await smaisikaMiningEngine.recordTradeProfit(userId, grossProfit, `trade_${Date.now()}`, bot.displayName);

    return {
      userProfit: userShare,
      treasuryShare: treasuryShare
    };
  }

  // Convert crypto to Smaisika
  convertToSmaisika(amount: number, fromCurrency: string): number {
    const rate = CURRENCY_CONFIG.conversionRates[fromCurrency as keyof typeof CURRENCY_CONFIG.conversionRates];
    if (!rate) {
      throw new Error(`Unsupported currency: ${fromCurrency}`);
    }
    return amount * rate;
  }

  // Convert Smaisika to crypto
  convertFromSmaisika(amount: number, toCurrency: string): number {
    const rate = CURRENCY_CONFIG.conversionRates[toCurrency as keyof typeof CURRENCY_CONFIG.conversionRates];
    if (!rate) {
      throw new Error(`Unsupported currency: ${toCurrency}`);
    }
    return amount / rate;
  }

  // Get all active bots
  getActiveBots(): BotConfiguration[] {
    return Object.values(BOT_REGISTRY).filter(bot => bot.isActive);
  }

  // Get autonomous bots
  getAutonomousBots(): BotConfiguration[] {
    return Object.values(BOT_REGISTRY).filter(bot => bot.isAutonomous);
  }

  // Generate deployment checklist
  generateDeploymentChecklist(): { question: string; status: 'pending' | 'verified' | 'failed'; critical: boolean }[] {
    return [
      { question: 'Are WaidBot Alpha & Pro mapped to binary options only?', status: 'pending', critical: true },
      { question: 'Is Maibot connected for binary small growth trading?', status: 'pending', critical: true },
      { question: 'Is Autonomous Trader pulling forex pairs correctly?', status: 'pending', critical: true },
      { question: 'Is Full Engine live with spot exchanges?', status: 'pending', critical: true },
      { question: 'Are wallets & Smaisika working 1:1 with USD?', status: 'pending', critical: true },
      { question: 'Is risk management locked at 2% default?', status: 'pending', critical: true },
      { question: 'Can admin adjust risk % and membership pricing?', status: 'pending', critical: false },
      { question: 'Is 50/50 profit sharing applied automatically?', status: 'pending', critical: true },
      { question: 'Are gamification + referral features active?', status: 'pending', critical: false },
      { question: 'Is Nwaora Chigozie account trading autonomously?', status: 'pending', critical: false },
      { question: 'Are security + 2FA + audit logs working?', status: 'pending', critical: true },
      { question: 'Is dashboard showing live results from APIs?', status: 'pending', critical: false },
      { question: 'Are all 24 connectors (9 binary, 6 forex, 9 spot) operational?', status: 'pending', critical: true },
      { question: 'Is Smai Chinnikstah broadcasting signals to all bots?', status: 'pending', critical: false },
      { question: 'Are deposit/withdrawal flows working with USDT/BTC/ETH/BNB?', status: 'pending', critical: true }
    ];
  }
}

// Export singleton instance
export const masterBotAlignment = new MasterBotAlignmentService();
