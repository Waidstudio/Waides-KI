import { db } from '../storage';
import { smaiWallets, tradeHistory, botPerformance, executionLogs } from '../../shared/walletSchema';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * SmaiWallet Manager - Core wallet system for autonomous wealth management
 * Handles wallet creation, balance management, and bot connections
 */
export class SmaiWalletManager {
  private static instance: SmaiWalletManager;

  public static getInstance(): SmaiWalletManager {
    if (!SmaiWalletManager.instance) {
      SmaiWalletManager.instance = new SmaiWalletManager();
    }
    return SmaiWalletManager.instance;
  }

  /**
   * Create or get existing wallet for user
   */
  async createOrGetWallet(userId: string): Promise<any> {
    try {
      // Check if wallet already exists
      const existingWallet = await db
        .select()
        .from(smaiWallets)
        .where(eq(smaiWallets.userId, userId))
        .limit(1);

      if (existingWallet.length > 0) {
        return {
          success: true,
          wallet: existingWallet[0],
          message: 'Wallet retrieved successfully'
        };
      }

      // Generate unique wallet address
      const walletAddress = this.generateWalletAddress(userId);

      // Create new wallet
      const newWallet = await db
        .insert(smaiWallets)
        .values({
          userId,
          walletAddress,
          balance: '1000.0', // Starting balance: $1000 USDT
          totalProfit: '0.0',
          totalLoss: '0.0',
          activeBot: 'Waidbot',
          botEnabled: true,
          riskLevel: 'MEDIUM',
          maxDailyTrades: '10',
          stopLossPercentage: '3.0',
          takeProfitPercentage: '6.0',
          metadata: {
            createdBy: 'SmaiWalletManager',
            initialBalance: '1000.0',
            region: 'global'
          }
        })
        .returning();

      // Initialize bot performance tracking
      await this.initializeBotPerformance(userId, walletAddress);

      console.log(`💰 SmaiWallet created for user ${userId}: ${walletAddress}`);

      return {
        success: true,
        wallet: newWallet[0],
        message: 'Wallet created successfully with $1000 starting balance'
      };
    } catch (error) {
      console.error('❌ Error creating wallet:', error);
      return {
        success: false,
        error: 'Failed to create wallet',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get wallet by user ID
   */
  async getWallet(userId: string): Promise<any> {
    try {
      const wallet = await db
        .select()
        .from(smaiWallets)
        .where(eq(smaiWallets.userId, userId))
        .limit(1);

      if (wallet.length === 0) {
        return {
          success: false,
          error: 'Wallet not found'
        };
      }

      return {
        success: true,
        wallet: wallet[0]
      };
    } catch (error) {
      console.error('❌ Error getting wallet:', error);
      return {
        success: false,
        error: 'Failed to retrieve wallet'
      };
    }
  }

  /**
   * Update wallet balance after trade
   */
  async updateBalance(userId: string, profitLoss: number, tradeType: 'profit' | 'loss'): Promise<any> {
    try {
      const walletResult = await this.getWallet(userId);
      if (!walletResult.success) {
        return walletResult;
      }

      const currentBalance = parseFloat(walletResult.wallet.balance);
      const newBalance = currentBalance + profitLoss;

      // Update balance and profit/loss totals
      const updateData: any = {
        balance: newBalance.toString(),
        updatedAt: new Date()
      };

      if (tradeType === 'profit' && profitLoss > 0) {
        const currentProfit = parseFloat(walletResult.wallet.totalProfit);
        updateData.totalProfit = (currentProfit + profitLoss).toString();
      } else if (tradeType === 'loss' && profitLoss < 0) {
        const currentLoss = parseFloat(walletResult.wallet.totalLoss);
        updateData.totalLoss = (currentLoss + Math.abs(profitLoss)).toString();
      }

      await db
        .update(smaiWallets)
        .set(updateData)
        .where(eq(smaiWallets.userId, userId));

      console.log(`💰 Balance updated for ${userId}: ${currentBalance} → ${newBalance} (${profitLoss > 0 ? '+' : ''}${profitLoss})`);

      return {
        success: true,
        previousBalance: currentBalance,
        newBalance,
        change: profitLoss
      };
    } catch (error) {
      console.error('❌ Error updating balance:', error);
      return {
        success: false,
        error: 'Failed to update balance'
      };
    }
  }

  /**
   * Record trade in history
   */
  async recordTrade(tradeData: {
    userId: string;
    walletId: string;
    botType: string;
    tradeType: string;
    pair: string;
    amount: number;
    price: number;
    profit: number;
    profitPercentage: number;
    signal?: string;
    confidence?: number;
    metadata?: any;
  }): Promise<any> {
    try {
      const trade = await db
        .insert(tradeHistory)
        .values({
          walletId: tradeData.walletId,
          userId: tradeData.userId,
          botType: tradeData.botType,
          tradeType: tradeData.tradeType,
          pair: tradeData.pair,
          amount: tradeData.amount.toString(),
          price: tradeData.price.toString(),
          profit: tradeData.profit.toString(),
          profitPercentage: tradeData.profitPercentage.toString(),
          signal: tradeData.signal || '',
          confidence: tradeData.confidence?.toString() || '0',
          status: 'COMPLETED',
          metadata: tradeData.metadata || {}
        })
        .returning();

      // Update bot performance
      await this.updateBotPerformance(tradeData.userId, tradeData.botType, tradeData.profit);

      console.log(`📊 Trade recorded: ${tradeData.botType} ${tradeData.tradeType} ${tradeData.pair} - Profit: $${tradeData.profit}`);

      return {
        success: true,
        trade: trade[0]
      };
    } catch (error) {
      console.error('❌ Error recording trade:', error);
      return {
        success: false,
        error: 'Failed to record trade'
      };
    }
  }

  /**
   * Get wallet performance statistics
   */
  async getWalletStats(userId: string): Promise<any> {
    try {
      const wallet = await this.getWallet(userId);
      if (!wallet.success) {
        return wallet;
      }

      // Get recent trades
      const recentTrades = await db
        .select()
        .from(tradeHistory)
        .where(eq(tradeHistory.userId, userId))
        .orderBy(desc(tradeHistory.executedAt))
        .limit(10);

      // Get bot performance
      const performance = await db
        .select()
        .from(botPerformance)
        .where(eq(botPerformance.userId, userId));

      return {
        success: true,
        wallet: wallet.wallet,
        recentTrades,
        performance,
        stats: {
          totalBalance: parseFloat(wallet.wallet.balance),
          totalProfit: parseFloat(wallet.wallet.totalProfit),
          totalLoss: parseFloat(wallet.wallet.totalLoss),
          netProfit: parseFloat(wallet.wallet.totalProfit) - parseFloat(wallet.wallet.totalLoss),
          totalTrades: recentTrades.length
        }
      };
    } catch (error) {
      console.error('❌ Error getting wallet stats:', error);
      return {
        success: false,
        error: 'Failed to get wallet statistics'
      };
    }
  }

  /**
   * Update bot settings
   */
  async updateBotSettings(userId: string, settings: {
    activeBot?: string;
    botEnabled?: boolean;
    riskLevel?: string;
    maxDailyTrades?: number;
    stopLossPercentage?: number;
    takeProfitPercentage?: number;
  }): Promise<any> {
    try {
      await db
        .update(smaiWallets)
        .set({
          ...settings,
          updatedAt: new Date()
        })
        .where(eq(smaiWallets.userId, userId));

      console.log(`⚙️ Bot settings updated for ${userId}:`, settings);

      return {
        success: true,
        message: 'Bot settings updated successfully'
      };
    } catch (error) {
      console.error('❌ Error updating bot settings:', error);
      return {
        success: false,
        error: 'Failed to update bot settings'
      };
    }
  }

  /**
   * Log execution event
   */
  async logExecution(userId: string, walletId: string, botType: string, action: string, message: string, signal?: any, metadata?: any): Promise<void> {
    try {
      await db
        .insert(executionLogs)
        .values({
          walletId,
          userId,
          botType,
          action,
          message,
          signal: signal || null,
          metadata: metadata || {}
        });
    } catch (error) {
      console.error('❌ Error logging execution:', error);
    }
  }

  /**
   * Generate unique wallet address
   */
  private generateWalletAddress(userId: string): string {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(8).toString('hex');
    const hash = crypto.createHash('sha256').update(userId + timestamp + random).digest('hex');
    return `0x${hash.substring(0, 40)}`;
  }

  /**
   * Initialize bot performance tracking
   */
  private async initializeBotPerformance(userId: string, walletId: string): Promise<void> {
    try {
      const bots = ['Waidbot', 'WaidbotPro'];
      
      for (const botType of bots) {
        await db
          .insert(botPerformance)
          .values({
            walletId,
            userId,
            botType,
            totalTrades: '0',
            winningTrades: '0',
            losingTrades: '0',
            winRate: '0',
            totalProfit: '0',
            bestTrade: '0',
            worstTrade: '0',
            averageProfit: '0',
            sharpeRatio: '0',
            maxDrawdown: '0',
            metadata: {
              initialized: new Date().toISOString(),
              version: '1.0'
            }
          });
      }
    } catch (error) {
      console.error('❌ Error initializing bot performance:', error);
    }
  }

  /**
   * Update bot performance after trade
   */
  private async updateBotPerformance(userId: string, botType: string, profit: number): Promise<void> {
    try {
      const performance = await db
        .select()
        .from(botPerformance)
        .where(and(
          eq(botPerformance.userId, userId),
          eq(botPerformance.botType, botType)
        ))
        .limit(1);

      if (performance.length === 0) return;

      const current = performance[0];
      const totalTrades = parseInt(current.totalTrades) + 1;
      const isWinning = profit > 0;
      const winningTrades = parseInt(current.winningTrades) + (isWinning ? 1 : 0);
      const losingTrades = parseInt(current.losingTrades) + (isWinning ? 0 : 1);
      const winRate = (winningTrades / totalTrades) * 100;
      const totalProfit = parseFloat(current.totalProfit) + profit;
      const averageProfit = totalProfit / totalTrades;

      await db
        .update(botPerformance)
        .set({
          totalTrades: totalTrades.toString(),
          winningTrades: winningTrades.toString(),
          losingTrades: losingTrades.toString(),
          winRate: winRate.toString(),
          totalProfit: totalProfit.toString(),
          averageProfit: averageProfit.toString(),
          bestTrade: profit > parseFloat(current.bestTrade || '0') ? profit.toString() : current.bestTrade,
          worstTrade: profit < parseFloat(current.worstTrade || '0') ? profit.toString() : current.worstTrade,
          lastUpdateAt: new Date()
        })
        .where(and(
          eq(botPerformance.userId, userId),
          eq(botPerformance.botType, botType)
        ));
    } catch (error) {
      console.error('❌ Error updating bot performance:', error);
    }
  }
}