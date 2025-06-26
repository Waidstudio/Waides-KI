import { BasicWaidBot, BasicWaidDecision } from './basicWaidBot';
import { WaidBotPro, WaidBotProDecision } from './waidBotPro';
import { EthPriceData } from './ethMonitor';

export interface BotStatus {
  running: boolean;
  profit: number;
  totalTrades: number;
  winRate: number;
  currentBalance: number;
  trades: TradeRecord[];
  lastDecision: BasicWaidDecision | WaidBotProDecision | null;
  currentRisk: number;
  uptime: number;
  startTime: number;
}

export interface TradeRecord {
  id: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  timestamp: number;
  profit?: number;
  bot: 'WaidBot' | 'WaidBot Pro';
  strategy?: string;
  confidence: number;
}

export interface RiskManagement {
  maxRiskPerTrade: number;
  maxDrawdown: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  dailyLossLimit: number;
  positionSizing: 'FIXED' | 'KELLY' | 'ADAPTIVE';
}

export interface TradingParameters {
  waidBot: {
    enabled: boolean;
    trendThreshold: number;
    confidenceThreshold: number;
    positionSize: number;
    onlyUptrends: boolean;
  };
  waidBotPro: {
    enabled: boolean;
    strategies: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    sidewaysDetection: boolean;
    shortSelling: boolean;
    maxPositions: number;
  };
  riskManagement: RiskManagement;
}

/**
 * Enhanced WaidBot Controller - Central Management System
 * 
 * Features:
 * - Unified control for both WaidBot and WaidBot Pro
 * - Real-time performance tracking and analytics
 * - Advanced risk management and position sizing
 * - Live status dashboard with profit tracking
 * - Automated trade execution with error handling
 * - WebSocket integration for real-time updates
 */
export class EnhancedWaidBotController {
  private basicWaidBot: BasicWaidBot;
  private waidBotPro: WaidBotPro;
  private waidBotStatus: BotStatus;
  private waidBotProStatus: BotStatus;
  private parameters: TradingParameters;
  private ethPrice: number = 0;
  private isInitialized: boolean = false;

  constructor() {
    this.basicWaidBot = new BasicWaidBot();
    this.waidBotPro = new WaidBotPro();
    
    this.waidBotStatus = this.initializeBotStatus('WaidBot');
    this.waidBotProStatus = this.initializeBotStatus('WaidBot Pro');
    
    this.parameters = this.getDefaultParameters();
    
    console.log('🚀 Enhanced WaidBot Controller initialized');
  }

  private initializeBotStatus(botName: string): BotStatus {
    return {
      running: false,
      profit: 0,
      totalTrades: 0,
      winRate: 0,
      currentBalance: 10000, // Starting with $10,000 virtual balance
      trades: [],
      lastDecision: null,
      currentRisk: 0,
      uptime: 0,
      startTime: 0
    };
  }

  private getDefaultParameters(): TradingParameters {
    return {
      waidBot: {
        enabled: false,
        trendThreshold: 2.0, // 2% price change for trend detection
        confidenceThreshold: 75, // 75% confidence required for trades
        positionSize: 0.1, // 10% of balance per trade
        onlyUptrends: true
      },
      waidBotPro: {
        enabled: false,
        strategies: ['TREND_FOLLOWING', 'MEAN_REVERSION', 'BREAKOUT', 'SIDEWAYS_RANGE'],
        riskLevel: 'MEDIUM',
        sidewaysDetection: true,
        shortSelling: true,
        maxPositions: 3
      },
      riskManagement: {
        maxRiskPerTrade: 0.05, // 5% max risk per trade
        maxDrawdown: 0.2, // 20% max drawdown
        stopLossPercentage: 0.03, // 3% stop loss
        takeProfitPercentage: 0.06, // 6% take profit (1:2 risk/reward)
        dailyLossLimit: 0.1, // 10% daily loss limit
        positionSizing: 'ADAPTIVE'
      }
    };
  }

  /**
   * Start/Stop WaidBot
   */
  public toggleWaidBot(enabled: boolean): BotStatus {
    this.parameters.waidBot.enabled = enabled;
    this.waidBotStatus.running = enabled;
    
    if (enabled) {
      this.waidBotStatus.startTime = Date.now();
      this.basicWaidBot.setAutoTrading(true);
      console.log('🤖 WaidBot STARTED - Long-only ETH trading enabled');
    } else {
      this.basicWaidBot.setAutoTrading(false);
      this.waidBotStatus.uptime += Date.now() - this.waidBotStatus.startTime;
      console.log('🤖 WaidBot STOPPED');
    }
    
    return this.waidBotStatus;
  }

  /**
   * Start/Stop WaidBot Pro
   */
  public toggleWaidBotPro(enabled: boolean): BotStatus {
    this.parameters.waidBotPro.enabled = enabled;
    this.waidBotProStatus.running = enabled;
    
    if (enabled) {
      this.waidBotProStatus.startTime = Date.now();
      this.waidBotPro.setAutoTrading(true);
      console.log('🔥 WaidBot Pro STARTED - Advanced multi-strategy trading enabled');
    } else {
      this.waidBotPro.setAutoTrading(false);
      this.waidBotProStatus.uptime += Date.now() - this.waidBotProStatus.startTime;
      console.log('🔥 WaidBot Pro STOPPED');
    }
    
    return this.waidBotProStatus;
  }

  /**
   * Update ETH price and trigger bot analysis
   */
  public async updateEthPrice(ethData: EthPriceData): Promise<void> {
    this.ethPrice = ethData.price;
    
    // Run WaidBot if enabled
    if (this.parameters.waidBot.enabled) {
      await this.runWaidBot(ethData);
    }
    
    // Run WaidBot Pro if enabled
    if (this.parameters.waidBotPro.enabled) {
      await this.runWaidBotPro(ethData);
    }
  }

  /**
   * Execute WaidBot trading logic
   */
  private async runWaidBot(ethData: EthPriceData): Promise<void> {
    try {
      const decision = await this.basicWaidBot.generateDecision(ethData);
      this.waidBotStatus.lastDecision = decision;
      
      // Execute trade if conditions are met
      if (decision.action === 'BUY_ETH' && this.shouldExecuteTrade('WaidBot', decision)) {
        await this.executeTrade('BUY', ethData.price, decision.quantity, 'WaidBot', decision.confidence);
      } else if (decision.action === 'SELL_ETH' && this.shouldExecuteTrade('WaidBot', decision)) {
        await this.executeTrade('SELL', ethData.price, decision.quantity, 'WaidBot', decision.confidence);
      }
    } catch (error) {
      console.error('❌ WaidBot execution error:', error);
    }
  }

  /**
   * Execute WaidBot Pro trading logic
   */
  private async runWaidBotPro(ethData: EthPriceData): Promise<void> {
    try {
      const decision = await this.waidBotPro.generateDecision(ethData);
      this.waidBotProStatus.lastDecision = decision;
      
      // Execute trade if conditions are met
      if (decision.action === 'BUY_ETH' && this.shouldExecuteTrade('WaidBot Pro', decision)) {
        await this.executeTrade('BUY', ethData.price, decision.quantity, 'WaidBot Pro', decision.confidence);
      } else if (decision.action === 'SELL_ETH' && this.shouldExecuteTrade('WaidBot Pro', decision)) {
        await this.executeTrade('SELL', ethData.price, decision.quantity, 'WaidBot Pro', decision.confidence);
      }
    } catch (error) {
      console.error('❌ WaidBot Pro execution error:', error);
    }
  }

  /**
   * Risk management check before executing trades
   */
  private shouldExecuteTrade(bot: 'WaidBot' | 'WaidBot Pro', decision: BasicWaidDecision | WaidBotProDecision): boolean {
    const status = bot === 'WaidBot' ? this.waidBotStatus : this.waidBotProStatus;
    
    // Check daily loss limit
    const todayLoss = this.calculateTodayLoss(status);
    if (todayLoss >= this.parameters.riskManagement.dailyLossLimit * status.currentBalance) {
      console.log(`🛑 ${bot}: Daily loss limit reached, blocking trade`);
      return false;
    }
    
    // Check maximum drawdown
    const drawdown = this.calculateDrawdown(status);
    if (drawdown >= this.parameters.riskManagement.maxDrawdown) {
      console.log(`🛑 ${bot}: Maximum drawdown reached, blocking trade`);
      return false;
    }
    
    // Check confidence threshold
    const threshold = bot === 'WaidBot' ? this.parameters.waidBot.confidenceThreshold : 70;
    if (decision.confidence < threshold) {
      console.log(`🛑 ${bot}: Confidence too low (${decision.confidence}% < ${threshold}%)`);
      return false;
    }
    
    return true;
  }

  /**
   * Execute trade with proper logging and tracking
   */
  private async executeTrade(type: 'BUY' | 'SELL', price: number, quantity: number, bot: 'WaidBot' | 'WaidBot Pro', confidence: number): Promise<void> {
    const trade: TradeRecord = {
      id: `${bot.toLowerCase().replace(' ', '')}-${Date.now()}`,
      type,
      price,
      quantity,
      timestamp: Date.now(),
      bot,
      confidence
    };
    
    const status = bot === 'WaidBot' ? this.waidBotStatus : this.waidBotProStatus;
    
    // Calculate trade value
    const tradeValue = price * quantity;
    
    if (type === 'BUY') {
      status.currentBalance -= tradeValue;
      console.log(`💰 ${bot} executed BUY: ${quantity} ETH at $${price.toFixed(2)} (${confidence}% confidence)`);
    } else {
      status.currentBalance += tradeValue;
      // Calculate profit for sell trades
      const lastBuyTrade = status.trades.filter(t => t.type === 'BUY').pop();
      if (lastBuyTrade) {
        trade.profit = (price - lastBuyTrade.price) * quantity;
        status.profit += trade.profit;
      }
      console.log(`💰 ${bot} executed SELL: ${quantity} ETH at $${price.toFixed(2)} (${confidence}% confidence)`);
    }
    
    status.trades.push(trade);
    status.totalTrades++;
    
    // Update win rate
    const profitableTrades = status.trades.filter(t => t.profit && t.profit > 0).length;
    const sellTrades = status.trades.filter(t => t.type === 'SELL').length;
    status.winRate = sellTrades > 0 ? (profitableTrades / sellTrades) * 100 : 0;
    
    // Update current risk
    status.currentRisk = this.calculateCurrentRisk(status);
  }

  /**
   * Calculate current portfolio risk
   */
  private calculateCurrentRisk(status: BotStatus): number {
    const openPositions = this.getOpenPositions(status);
    const totalRisk = openPositions.length * this.parameters.riskManagement.maxRiskPerTrade;
    return Math.min(totalRisk, 1.0);
  }

  /**
   * Calculate today's losses
   */
  private calculateTodayLoss(status: BotStatus): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTrades = status.trades.filter(t => new Date(t.timestamp) >= today);
    return todayTrades.reduce((loss, trade) => {
      if (trade.profit && trade.profit < 0) {
        return loss + Math.abs(trade.profit);
      }
      return loss;
    }, 0);
  }

  /**
   * Calculate current drawdown
   */
  private calculateDrawdown(status: BotStatus): number {
    const initialBalance = 10000;
    const currentValue = status.currentBalance + status.profit;
    const peak = Math.max(initialBalance, currentValue);
    return (peak - currentValue) / peak;
  }

  /**
   * Get open positions
   */
  private getOpenPositions(status: BotStatus): TradeRecord[] {
    const buyTrades = status.trades.filter(t => t.type === 'BUY');
    const sellTrades = status.trades.filter(t => t.type === 'SELL');
    
    // Simple position tracking - in real implementation would be more sophisticated
    return buyTrades.slice(sellTrades.length);
  }

  /**
   * Get comprehensive status for both bots
   */
  public getStatus(): {
    waidBot: BotStatus;
    waidBotPro: BotStatus;
    ethPrice: number;
    parameters: TradingParameters;
    timestamp: number;
  } {
    // Update uptime for running bots
    if (this.waidBotStatus.running) {
      this.waidBotStatus.uptime = Date.now() - this.waidBotStatus.startTime;
    }
    if (this.waidBotProStatus.running) {
      this.waidBotProStatus.uptime = Date.now() - this.waidBotProStatus.startTime;
    }
    
    return {
      waidBot: { ...this.waidBotStatus },
      waidBotPro: { ...this.waidBotProStatus },
      ethPrice: this.ethPrice,
      parameters: { ...this.parameters },
      timestamp: Date.now()
    };
  }

  /**
   * Update trading parameters
   */
  public updateParameters(newParameters: Partial<TradingParameters>): TradingParameters {
    this.parameters = { ...this.parameters, ...newParameters };
    console.log('⚙️ Trading parameters updated:', newParameters);
    return this.parameters;
  }

  /**
   * Get performance analytics
   */
  public getAnalytics(): {
    waidBot: any;
    waidBotPro: any;
    combined: any;
  } {
    return {
      waidBot: this.calculateBotAnalytics(this.waidBotStatus),
      waidBotPro: this.calculateBotAnalytics(this.waidBotProStatus),
      combined: this.calculateCombinedAnalytics()
    };
  }

  private calculateBotAnalytics(status: BotStatus) {
    const trades = status.trades;
    const profitableTrades = trades.filter(t => t.profit && t.profit > 0);
    const losingTrades = trades.filter(t => t.profit && t.profit < 0);
    
    return {
      totalTrades: trades.length,
      profitableTrades: profitableTrades.length,
      losingTrades: losingTrades.length,
      winRate: status.winRate,
      totalProfit: status.profit,
      averageProfit: profitableTrades.length > 0 ? profitableTrades.reduce((sum, t) => sum + (t.profit || 0), 0) / profitableTrades.length : 0,
      averageLoss: losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + Math.abs(t.profit || 0), 0) / losingTrades.length : 0,
      maxProfit: Math.max(...trades.map(t => t.profit || 0)),
      maxLoss: Math.min(...trades.map(t => t.profit || 0)),
      profitFactor: this.calculateProfitFactor(trades),
      sharpeRatio: this.calculateSharpeRatio(trades),
      currentDrawdown: this.calculateDrawdown(status)
    };
  }

  private calculateCombinedAnalytics() {
    const combined = {
      totalProfit: this.waidBotStatus.profit + this.waidBotProStatus.profit,
      totalTrades: this.waidBotStatus.totalTrades + this.waidBotProStatus.totalTrades,
      combinedBalance: this.waidBotStatus.currentBalance + this.waidBotProStatus.currentBalance
    };
    
    return combined;
  }

  private calculateProfitFactor(trades: TradeRecord[]): number {
    const grossProfit = trades.filter(t => t.profit && t.profit > 0).reduce((sum, t) => sum + (t.profit || 0), 0);
    const grossLoss = Math.abs(trades.filter(t => t.profit && t.profit < 0).reduce((sum, t) => sum + (t.profit || 0), 0));
    return grossLoss > 0 ? grossProfit / grossLoss : 0;
  }

  private calculateSharpeRatio(trades: TradeRecord[]): number {
    if (trades.length < 2) return 0;
    
    const returns = trades.map(t => t.profit || 0);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev > 0 ? avgReturn / stdDev : 0;
  }

  /**
   * Emergency stop all bots
   */
  public emergencyStop(): void {
    this.toggleWaidBot(false);
    this.toggleWaidBotPro(false);
    console.log('🚨 EMERGENCY STOP: All bots disabled');
  }

  /**
   * Reset bot statistics
   */
  public resetStats(bot?: 'WaidBot' | 'WaidBot Pro'): void {
    if (!bot || bot === 'WaidBot') {
      this.waidBotStatus = this.initializeBotStatus('WaidBot');
      console.log('🔄 WaidBot statistics reset');
    }
    if (!bot || bot === 'WaidBot Pro') {
      this.waidBotProStatus = this.initializeBotStatus('WaidBot Pro');
      console.log('🔄 WaidBot Pro statistics reset');
    }
  }
}

// Export singleton instance
export const enhancedWaidBotController = new EnhancedWaidBotController();