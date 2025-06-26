import { SmaiWalletManager } from './smaiWalletManager';
import { BasicWaidBot } from './basicWaidBot';
import { WaidBotPro } from './waidBotPro';
import { EthMonitor } from './ethMonitor';

/**
 * Autonomous Bot Engine - 24/7 Trading Intelligence
 * "Bots that live forever. Wallets that grow themselves. Wealth without login."
 */
export class AutonomousBotEngine {
  private static instance: AutonomousBotEngine;
  private walletManager: SmaiWalletManager;
  private basicWaidBot: BasicWaidBot;
  private waidBotPro: WaidBotPro;
  private isRunning: boolean = false;
  private executionInterval: NodeJS.Timeout | null = null;
  private activeUsers: Set<string> = new Set();

  public static getInstance(): AutonomousBotEngine {
    if (!AutonomousBotEngine.instance) {
      AutonomousBotEngine.instance = new AutonomousBotEngine();
    }
    return AutonomousBotEngine.instance;
  }

  constructor() {
    this.walletManager = SmaiWalletManager.getInstance();
    this.basicWaidBot = new BasicWaidBot();
    this.waidBotPro = new WaidBotPro();
  }

  /**
   * Start autonomous bot execution for all users
   */
  async startAutonomousExecution(): Promise<void> {
    if (this.isRunning) {
      console.log('🤖 Autonomous Bot Engine already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Autonomous Bot Engine - 24/7 Wealth Generation');

    // Execute bot cycles every 60 seconds
    this.executionInterval = setInterval(async () => {
      await this.executeAllBots();
    }, 60000);

    // Initial execution
    await this.executeAllBots();
  }

  /**
   * Stop autonomous bot execution
   */
  stopAutonomousExecution(): void {
    if (this.executionInterval) {
      clearInterval(this.executionInterval);
      this.executionInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Autonomous Bot Engine stopped');
  }

  /**
   * Execute trading cycle for all users
   */
  private async executeAllBots(): Promise<void> {
    try {
      // Get all active users from recent activity
      const activeUsers = await this.getActiveUsers();
      
      console.log(`🔄 Executing bot cycle for ${activeUsers.length} users`);

      for (const userId of activeUsers) {
        await this.executeBotForUser(userId);
      }
    } catch (error) {
      console.error('❌ Error in bot execution cycle:', error);
    }
  }

  /**
   * Execute bot for specific user
   */
  async executeBotForUser(userId: string): Promise<any> {
    try {
      // Get user wallet
      const walletResult = await this.walletManager.getWallet(userId);
      if (!walletResult.success) {
        // Create wallet if doesn't exist
        const createResult = await this.walletManager.createOrGetWallet(userId);
        if (!createResult.success) {
          return { success: false, error: 'Failed to create wallet' };
        }
      }

      const wallet = walletResult.success ? walletResult.wallet : (await this.walletManager.getWallet(userId)).wallet;

      // Check if bot is enabled and has sufficient balance
      if (!wallet.botEnabled || parseFloat(wallet.balance) < 10) {
        await this.walletManager.logExecution(
          userId,
          wallet.walletAddress,
          wallet.activeBot,
          'SKIP',
          `Bot disabled or insufficient balance: $${wallet.balance}`
        );
        return { success: false, reason: 'Bot disabled or insufficient balance' };
      }

      // Get Waides KI signal
      const signal = await this.getWaidesKISignal(wallet.activeBot);
      
      await this.walletManager.logExecution(
        userId,
        wallet.walletAddress,
        wallet.activeBot,
        'SIGNAL_RECEIVED',
        `Signal: ${signal.action}, Confidence: ${signal.confidence}%`,
        signal
      );

      // Execute trade based on signal
      if (signal.shouldTrade) {
        const tradeResult = await this.executeTrade(userId, wallet, signal);
        return tradeResult;
      }

      return { success: true, action: 'HOLD', reason: 'No trading signal' };
    } catch (error) {
      console.error(`❌ Error executing bot for user ${userId}:`, error);
      return { success: false, error: 'Bot execution failed' };
    }
  }

  /**
   * Get Waides KI trading signal
   */
  private async getWaidesKISignal(botType: string): Promise<any> {
    try {
      // Get current ETH price and market data from ETH monitor
      const ethMonitor = new EthMonitor();
      const marketData = await ethMonitor.fetchEthData();
      const ethPrice = marketData?.price || 0;

      let signal;
      
      if (botType === 'Waidbot') {
        // Basic WaidBot - long-only ETH trading
        signal = await this.basicWaidBot.generateDecision();
      } else if (botType === 'WaidbotPro') {
        // WaidBot Pro - advanced multi-strategy trading
        signal = await this.waidBotPro.generateDecision();
      } else {
        // Default to basic bot
        signal = await this.basicWaidBot.generateDecision();
      }

      // Enhanced with Waides KI intelligence
      const enhancedSignal = {
        ...signal,
        ethPrice,
        marketData,
        timestamp: Date.now(),
        waidesKIGuidance: true
      };

      return enhancedSignal;
    } catch (error) {
      console.error('❌ Error getting Waides KI signal:', error);
      return {
        action: 'HOLD',
        shouldTrade: false,
        confidence: 0,
        reasoning: 'Signal generation failed'
      };
    }
  }

  /**
   * Execute trade based on signal
   */
  private async executeTrade(userId: string, wallet: any, signal: any): Promise<any> {
    try {
      const balance = parseFloat(wallet.balance);
      const positionSize = Math.min(balance * 0.1, 100); // 10% of balance, max $100
      
      // Simulate trade execution with realistic market behavior
      const price = signal.ethPrice || 2500;
      const amount = positionSize / price;
      
      // Calculate profit/loss based on signal confidence and market conditions
      const baseReturn = (signal.confidence - 50) / 100; // -50% to +50% base return
      const marketNoise = (Math.random() - 0.5) * 0.1; // ±5% market noise
      const actualReturn = baseReturn + marketNoise;
      
      const profit = positionSize * actualReturn;
      const profitPercentage = actualReturn * 100;

      // Update wallet balance
      const balanceUpdate = await this.walletManager.updateBalance(
        userId,
        profit,
        profit > 0 ? 'profit' : 'loss'
      );

      if (!balanceUpdate.success) {
        throw new Error('Failed to update balance');
      }

      // Record trade
      const tradeRecord = await this.walletManager.recordTrade({
        userId,
        walletId: wallet.walletAddress,
        botType: wallet.activeBot,
        tradeType: signal.action,
        pair: 'ETH/USDT',
        amount,
        price,
        profit,
        profitPercentage,
        signal: signal.reasoning,
        confidence: signal.confidence,
        metadata: {
          waidesKIGuidance: true,
          marketData: signal.marketData,
          executionTime: new Date().toISOString()
        }
      });

      // Log execution
      await this.walletManager.logExecution(
        userId,
        wallet.walletAddress,
        wallet.activeBot,
        'TRADE_EXECUTED',
        `${signal.action} ${amount.toFixed(6)} ETH at $${price} - Profit: $${profit.toFixed(2)} (${profitPercentage.toFixed(2)}%)`,
        signal,
        { tradeId: tradeRecord.trade?.id }
      );

      console.log(`💰 Trade executed for ${userId}: ${signal.action} - Profit: $${profit.toFixed(2)}`);

      return {
        success: true,
        trade: {
          action: signal.action,
          amount,
          price,
          profit,
          profitPercentage,
          newBalance: balanceUpdate.newBalance
        }
      };
    } catch (error) {
      console.error('❌ Error executing trade:', error);
      
      // Log error
      await this.walletManager.logExecution(
        userId,
        wallet.walletAddress,
        wallet.activeBot,
        'ERROR',
        `Trade execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        signal
      );

      return {
        success: false,
        error: 'Trade execution failed'
      };
    }
  }

  /**
   * Get list of active users (users with wallets and enabled bots)
   */
  private async getActiveUsers(): Promise<string[]> {
    // For now, return demo users. In production, this would query the database
    // to find users with enabled bots and sufficient balances
    return [
      'user_demo_001',
      'user_demo_002',
      'user_demo_003'
    ];
  }

  /**
   * Register user for autonomous trading
   */
  async registerUser(userId: string): Promise<any> {
    try {
      // Create or get wallet
      const walletResult = await this.walletManager.createOrGetWallet(userId);
      if (!walletResult.success) {
        return walletResult;
      }

      this.activeUsers.add(userId);
      
      console.log(`👤 User ${userId} registered for autonomous trading`);
      
      return {
        success: true,
        wallet: walletResult.wallet,
        message: 'User registered for autonomous trading'
      };
    } catch (error) {
      console.error('❌ Error registering user:', error);
      return {
        success: false,
        error: 'Failed to register user'
      };
    }
  }

  /**
   * Get autonomous engine status
   */
  getStatus(): any {
    return {
      isRunning: this.isRunning,
      activeUsers: this.activeUsers.size,
      uptime: this.isRunning ? Date.now() : 0,
      lastExecution: new Date().toISOString(),
      engineInfo: {
        name: 'Autonomous Bot Engine',
        version: '1.0.0',
        motto: 'Bots that live forever. Wallets that grow themselves. Wealth without login.'
      }
    };
  }

  /**
   * Get user trading statistics
   */
  async getUserStats(userId: string): Promise<any> {
    return await this.walletManager.getWalletStats(userId);
  }

  /**
   * Update user bot settings
   */
  async updateUserBotSettings(userId: string, settings: any): Promise<any> {
    return await this.walletManager.updateBotSettings(userId, settings);
  }
}