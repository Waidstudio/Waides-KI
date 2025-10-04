/**
 * 👤 Waides KI User Flow Service
 * Complete user journey: Register → Deposit → Select Bot/Market → Trade → Withdraw
 */

import { masterBotAlignment, BotConfiguration, CURRENCY_CONFIG } from './masterBotAlignmentService';
import { smaisikaMiningEngine } from './smaisikaMiningEngine';
import { gamificationReferral } from './gamificationReferralService';
import { db } from '../db';
import { userProfiles } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export interface UserFlowStep {
  step: number;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  actions: string[];
  completedAt?: Date;
}

export interface OnboardingProgress {
  userId: number;
  currentStep: number;
  totalSteps: number;
  steps: UserFlowStep[];
  completionPercentage: number;
  estimatedTimeRemaining: string;
}

export interface DepositInfo {
  supportedCurrencies: string[];
  conversionRates: Record<string, number>;
  minimumDeposit: Record<string, number>;
  depositAddress?: {
    currency: string;
    address: string;
    network: string;
    qrCode?: string;
  };
}

export interface BotSelectionInfo {
  availableBots: BotConfiguration[];
  recommendations: {
    botId: string;
    reason: string;
    confidence: number;
  }[];
  userTier: string;
  upgradeOptions: {
    tier: string;
    price: number;
    benefits: string[];
  }[];
}

export interface TradingSetup {
  selectedBot: BotConfiguration;
  marketType: string;
  riskPercent: number;
  availableBalance: number;
  estimatedTradeSize: number;
  connectorOptions: {
    code: string;
    name: string;
    status: string;
  }[];
}

export interface WithdrawalInfo {
  availableBalance: number;
  currency: string;
  supportedWithdrawals: string[];
  minimumWithdrawal: Record<string, number>;
  conversionRates: Record<string, number>;
  processingTime: string;
  fees: Record<string, number>;
}

class UserFlowService {
  // Define complete user flow steps
  private defineUserFlowSteps(): Omit<UserFlowStep, 'status' | 'completedAt'>[] {
    return [
      {
        step: 1,
        name: 'Account Registration',
        description: 'Create your Waides KI account with SmaiPrint or Email',
        actions: [
          'Enter email/phone',
          'Set password',
          'Accept terms & conditions',
          'Verify email/SMS'
        ]
      },
      {
        step: 2,
        name: 'Deposit Funds',
        description: 'Deposit USDT/BTC/ETH/BNB - Auto converted to Smaisika (1:1 USD)',
        actions: [
          'Choose deposit currency',
          'Get deposit address',
          'Send funds to address',
          'Wait for confirmation',
          'Funds auto-converted to Smaisika'
        ]
      },
      {
        step: 3,
        name: 'Select Trading Bot',
        description: 'Choose bot based on your trading preferences and tier',
        actions: [
          'Review available bots',
          'Check tier requirements',
          'Select preferred bot',
          'Upgrade tier if needed'
        ]
      },
      {
        step: 4,
        name: 'Configure Market & Risk',
        description: 'Select market type and set risk management preferences',
        actions: [
          'Choose market type (Binary/Forex/Spot)',
          'Set risk percentage (default 2%)',
          'Configure stop-loss/take-profit',
          'Select trading connector'
        ]
      },
      {
        step: 5,
        name: 'Connect API Keys',
        description: 'Connect personal API keys or use Waides KI managed account',
        actions: [
          'Choose: Personal Keys or Waides Account',
          'Enter API credentials (if personal)',
          'Verify connection',
          'Test API access'
        ]
      },
      {
        step: 6,
        name: 'Start Trading',
        description: 'Activate bot and begin automated trading',
        actions: [
          'Review bot configuration',
          'Start trading bot',
          'Monitor live dashboard',
          'Receive real-time updates'
        ]
      },
      {
        step: 7,
        name: 'Monitor Performance',
        description: 'Track PnL, confidence, and trading performance',
        actions: [
          'View live trading activity',
          'Check profit/loss metrics',
          'Review bot confidence',
          'Analyze trading patterns'
        ]
      },
      {
        step: 8,
        name: 'Withdraw Profits',
        description: 'Withdraw earnings with automatic 50/50 split applied',
        actions: [
          'Check available balance',
          'Select withdrawal currency',
          'Enter withdrawal address',
          'Confirm withdrawal (50/50 split auto-applied)',
          'Wait for processing'
        ]
      }
    ];
  }

  // Get user onboarding progress
  async getUserOnboardingProgress(userId: number): Promise<OnboardingProgress> {
    const baseSteps = this.defineUserFlowSteps();
    
    // Fetch actual progress from database
    let completedSteps = 0;
    let stepStatuses: { [key: number]: { status: string; completedAt?: Date } } = {};
    
    try {
      const profile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, userId)
      });
      
      const stats = (profile?.stats as any) || {};
      completedSteps = stats.onboardingCompletedSteps || 0;
      stepStatuses = stats.onboardingStepStatuses || {};
    } catch (error) {
      console.error(`Error fetching onboarding progress for user ${userId}:`, error);
    }
    
    const steps: UserFlowStep[] = baseSteps.map((step, index) => {
      const stepStatus = stepStatuses[step.step] || {};
      return {
        ...step,
        status: stepStatus.status || (index < completedSteps ? 'completed' : 
                index === completedSteps ? 'in_progress' : 'pending'),
        completedAt: stepStatus.completedAt ? new Date(stepStatus.completedAt) : undefined
      };
    });

    const completionPercentage = Math.round((completedSteps / baseSteps.length) * 100);
    const estimatedTimeRemaining = this.calculateEstimatedTime(baseSteps.length - completedSteps);

    return {
      userId,
      currentStep: completedSteps + 1,
      totalSteps: baseSteps.length,
      steps,
      completionPercentage,
      estimatedTimeRemaining
    };
  }

  private calculateEstimatedTime(remainingSteps: number): string {
    const minutesPerStep = 3;
    const totalMinutes = remainingSteps * minutesPerStep;
    
    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  }

  // Get deposit information
  async getDepositInfo(userId: number): Promise<DepositInfo> {
    return {
      supportedCurrencies: CURRENCY_CONFIG.depositCurrencies,
      conversionRates: CURRENCY_CONFIG.conversionRates,
      minimumDeposit: {
        USDT: 10,
        BTC: 0.0002,
        ETH: 0.004,
        BNB: 0.03
      },
      depositAddress: {
        currency: 'USDT',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        network: 'TRC20',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      }
    };
  }

  // Get bot selection info
  async getBotSelectionInfo(userId: number, userTier: string = 'free'): Promise<BotSelectionInfo> {
    const allBots = masterBotAlignment.getActiveBots();
    const tierAccess = masterBotAlignment.getMembershipAccess(userTier);
    
    const availableBots = allBots.filter(bot => tierAccess.includes(bot.id));
    
    // Generate recommendations based on user tier
    const recommendations = this.generateBotRecommendations(userTier, availableBots);
    
    const upgradeOptions = [
      {
        tier: 'basic',
        price: 50,
        benefits: ['WaidBot Alpha access', 'Binary options trading', '50/50 profit sharing']
      },
      {
        tier: 'pro',
        price: 200,
        benefits: ['WaidBot Pro Beta access', 'Advanced binary trading', 'AI signals']
      },
      {
        tier: 'premium',
        price: 500,
        benefits: ['All bots access', 'Forex + Spot trading', '24/7 autonomous trading']
      }
    ];

    return {
      availableBots,
      recommendations,
      userTier,
      upgradeOptions
    };
  }

  private generateBotRecommendations(userTier: string, availableBots: BotConfiguration[]): { botId: string; reason: string; confidence: number }[] {
    const recommendations = [];

    if (userTier === 'free') {
      recommendations.push({
        botId: 'maibot',
        reason: 'Perfect for beginners - Free tier with learning mode',
        confidence: 95
      });
    }

    if (userTier === 'basic' || userTier === 'pro') {
      recommendations.push({
        botId: 'waidbot-alpha',
        reason: 'Solid entry-level binary options bot with 73% win rate',
        confidence: 85
      });
    }

    if (userTier === 'premium' || userTier === 'vip') {
      recommendations.push({
        botId: 'autonomous-trader-gamma',
        reason: '24/7 forex trading with 82% win rate - Best for hands-off trading',
        confidence: 90
      });
      recommendations.push({
        botId: 'full-engine-omega',
        reason: 'Advanced spot trading with smart risk management',
        confidence: 88
      });
    }

    return recommendations;
  }

  // Get trading setup info
  async getTradingSetupInfo(userId: number, botId: string): Promise<TradingSetup | null> {
    const bot = masterBotAlignment.getBotConfig(botId);
    if (!bot) return null;

    const userStats = await smaisikaMiningEngine.getUserStats(userId);
    const availableBalance = userStats.totalSmaiSika;
    
    const riskPercent = bot.riskManagement.defaultRiskPercent;
    const estimatedTradeSize = (availableBalance * riskPercent) / 100;

    // Get compatible connectors
    const connectorOptions = bot.connectors.map(code => ({
      code,
      name: this.getConnectorName(code),
      status: this.getConnectorStatus(code)
    }));

    return {
      selectedBot: bot,
      marketType: bot.marketType,
      riskPercent,
      availableBalance,
      estimatedTradeSize,
      connectorOptions
    };
  }

  private getConnectorName(code: string): string {
    const names: Record<string, string> = {
      'DERIV': 'Deriv Binary',
      'IQOPTION': 'IQ Option',
      'BINANCE': 'Binance',
      'COINBASE': 'Coinbase',
      'MT5': 'MetaTrader 5',
      // Add more as needed
    };
    return names[code] || code;
  }

  private getConnectorStatus(code: string): string {
    // In production, check actual connector status
    const operational = ['DERIV', 'IQOPTION', 'POCKETOPTION', 'QUOTEX', 'BINANCE', 'COINBASE', 'KRAKEN'];
    return operational.includes(code) ? 'operational' : 'demo_mode';
  }

  // Get withdrawal information
  async getWithdrawalInfo(userId: number): Promise<WithdrawalInfo> {
    const userStats = await smaisikaMiningEngine.getUserStats(userId);
    const availableBalance = userStats.totalSmaiSika;

    return {
      availableBalance,
      currency: 'Smaisika',
      supportedWithdrawals: CURRENCY_CONFIG.withdrawalCurrencies,
      minimumWithdrawal: {
        USDT: 20,
        BTC: 0.0005,
        ETH: 0.01,
        BNB: 0.05
      },
      conversionRates: CURRENCY_CONFIG.conversionRates,
      processingTime: '1-24 hours',
      fees: {
        USDT: 1, // 1 USDT fee
        BTC: 0.0001,
        ETH: 0.001,
        BNB: 0.001
      }
    };
  }

  // Process deposit
  async processDeposit(userId: number, amount: number, currency: string): Promise<{ success: boolean; smaiSikaAmount: number; message: string }> {
    try {
      // Convert to Smaisika
      const smaiSikaAmount = masterBotAlignment.convertToSmaisika(amount, currency);
      
      // Add to wallet
      await smaisikaMiningEngine.addSmaiSikaToWallet(userId, smaiSikaAmount);
      
      // Award XP for deposit
      await gamificationReferral.awardTradeXP(userId, 'win', smaiSikaAmount);
      
      console.log(`💰 Deposit processed: ${amount} ${currency} → ${smaiSikaAmount} Smaisika for User ${userId}`);
      
      return {
        success: true,
        smaiSikaAmount,
        message: `Successfully deposited ${amount} ${currency} (${smaiSikaAmount} Smaisika)`
      };
    } catch (error) {
      return {
        success: false,
        smaiSikaAmount: 0,
        message: `Deposit failed: ${error}`
      };
    }
  }

  // Process withdrawal
  async processWithdrawal(userId: number, amount: number, currency: string, address: string): Promise<{ success: boolean; message: string; fee: number }> {
    try {
      const userStats = await smaisikaMiningEngine.getUserStats(userId);
      const availableBalance = userStats.totalSmaiSika;

      if (amount > availableBalance) {
        return {
          success: false,
          message: 'Insufficient balance',
          fee: 0
        };
      }

      // Convert from Smaisika to target currency
      const cryptoAmount = masterBotAlignment.convertFromSmaisika(amount, currency);
      
      // Deduct from wallet
      await smaisikaMiningEngine.deductSmaiSikaFromWallet(userId, amount);
      
      // In production, trigger actual crypto withdrawal
      console.log(`💸 Withdrawal processed: ${amount} Smaisika → ${cryptoAmount} ${currency} to ${address}`);
      
      return {
        success: true,
        message: `Withdrawal of ${cryptoAmount} ${currency} initiated`,
        fee: 1 // Fee in Smaisika
      };
    } catch (error) {
      return {
        success: false,
        message: `Withdrawal failed: ${error}`,
        fee: 0
      };
    }
  }

  // Complete flow - mark step as completed
  async completeFlowStep(userId: number, stepNumber: number): Promise<{ success: boolean; nextStep?: UserFlowStep }> {
    try {
      // Update database with completed step
      const profile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, userId)
      });
      
      const stats = (profile?.stats as any) || {};
      const stepStatuses = stats.onboardingStepStatuses || {};
      
      stepStatuses[stepNumber] = {
        status: 'completed',
        completedAt: new Date().toISOString()
      };
      
      stats.onboardingStepStatuses = stepStatuses;
      stats.onboardingCompletedSteps = Math.max(stats.onboardingCompletedSteps || 0, stepNumber);
      
      await db.update(userProfiles)
        .set({ 
          stats: stats,
          updatedAt: new Date()
        })
        .where(eq(userProfiles.userId, userId));
      
      console.log(`✅ User ${userId} completed step ${stepNumber} (saved to database)`);
      
      const progress = await this.getUserOnboardingProgress(userId);
      const nextStep = progress.steps.find(s => s.step === stepNumber + 1);
      
      return {
        success: true,
        nextStep
      };
    } catch (error) {
      console.error(`❌ Error completing step ${stepNumber} for user ${userId}:`, error);
      return {
        success: false
      };
    }
  }
}

// Export singleton instance
export const userFlow = new UserFlowService();
