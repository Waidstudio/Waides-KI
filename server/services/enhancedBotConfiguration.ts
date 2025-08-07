/**
 * Enhanced Bot Configuration Service
 * Comprehensive settings, profit/loss tracking, and advanced features for all trading bots
 */

export interface BotSettings {
  id: string;
  name: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  maxPositionSize: number;
  stopLoss: number;
  takeProfit: number;
  tradingPairs: string[];
  strategies: string[];
  activeStrategy: string;
  autoTrading: boolean;
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    profitThreshold: number;
    lossThreshold: number;
  };
  timeframes: string[];
  activeTimeframe: string;
  maxDailyTrades: number;
  emergencyStop: {
    enabled: boolean;
    maxDailyLoss: number;
    consecutiveLossLimit: number;
  };
  advanced: {
    aiModel: string;
    confidenceThreshold: number;
    signalFilters: string[];
    backtestPeriod: number;
    paperTrading: boolean;
  };
}

export interface ProfitLossTracker {
  botId: string;
  totalProfit: number;
  totalLoss: number;
  netProfitLoss: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  currentDrawdown: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  dailyProfitLoss: number;
  weeklyProfitLoss: number;
  monthlyProfitLoss: number;
  yearlyProfitLoss: number;
  isCurrentlyProfiting: boolean;
  isCurrentlyLosing: boolean;
  lastTradeResult: 'win' | 'loss' | 'neutral';
  riskAdjustedReturns: number;
}

export interface TradeResult {
  id: string;
  botId: string;
  timestamp: number;
  action: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  amount: number;
  profit: number;
  loss: number;
  netResult: number;
  isWin: boolean;
  confidence: number;
  strategy: string;
  reason: string;
  fees: number;
  slippage: number;
  executionTime: number;
  marketConditions: {
    trend: string;
    volatility: number;
    volume: number;
  };
}

export interface BotMemory {
  botId: string;
  marketLearnings: {
    bestPerformingConditions: string[];
    worstPerformingConditions: string[];
    profitablePatterns: string[];
    lossPatterns: string[];
  };
  adaptiveSettings: {
    dynamicRiskAdjustment: boolean;
    performanceBasedPositioning: boolean;
    lossRecoveryMode: boolean;
    profitTakingOptimization: boolean;
  };
  emotionalState: {
    confidence: number;
    aggression: number;
    caution: number;
    greed: number;
    fear: number;
  };
  recentPerformanceWindow: TradeResult[];
}

class EnhancedBotConfiguration {
  private botSettings: Map<string, BotSettings> = new Map();
  private profitLossTrackers: Map<string, ProfitLossTracker> = new Map();
  private botMemories: Map<string, BotMemory> = new Map();
  private tradeHistory: Map<string, TradeResult[]> = new Map();

  constructor() {
    this.initializeDefaultSettings();
  }

  private initializeDefaultSettings(): void {
    const defaultBots = ['maibot', 'waidbot', 'waidbot-pro', 'autonomous-trader', 'full-engine', 'nwaora-chigozie'];

    defaultBots.forEach(botId => {
      this.botSettings.set(botId, this.createDefaultSettings(botId));
      this.profitLossTrackers.set(botId, this.createDefaultProfitLossTracker(botId));
      this.botMemories.set(botId, this.createDefaultBotMemory(botId));
      this.tradeHistory.set(botId, []);
    });
  }

  private createDefaultSettings(botId: string): BotSettings {
    const baseSettings = {
      id: botId,
      name: this.getBotDisplayName(botId),
      tradingPairs: ['ETH/USDT', 'BTC/USDT'],
      timeframes: ['1m', '5m', '15m', '1h', '4h', '1d'],
      activeTimeframe: '15m',
      strategies: ['trend_following', 'mean_reversion', 'momentum', 'breakout'],
      notifications: {
        email: true,
        sms: false,
        inApp: true,
        profitThreshold: 100,
        lossThreshold: -50
      },
      emergencyStop: {
        enabled: true,
        maxDailyLoss: -500,
        consecutiveLossLimit: 5
      },
      advanced: {
        aiModel: 'neural_network_v3',
        confidenceThreshold: 0.7,
        signalFilters: ['volume_confirmation', 'trend_alignment'],
        backtestPeriod: 30,
        paperTrading: false
      }
    };

    // Bot-specific configurations
    switch (botId) {
      case 'maibot':
        return {
          ...baseSettings,
          riskLevel: 'conservative',
          maxPositionSize: 0.01,
          stopLoss: -3,
          takeProfit: 5,
          activeStrategy: 'trend_following',
          autoTrading: false,
          maxDailyTrades: 3,
          advanced: {
            ...baseSettings.advanced,
            confidenceThreshold: 0.8,
            paperTrading: true
          }
        };

      case 'waidbot':
        return {
          ...baseSettings,
          riskLevel: 'moderate',
          maxPositionSize: 0.05,
          stopLoss: -5,
          takeProfit: 10,
          activeStrategy: 'momentum',
          autoTrading: true,
          maxDailyTrades: 10,
          advanced: {
            ...baseSettings.advanced,
            confidenceThreshold: 0.75
          }
        };

      case 'waidbot-pro':
        return {
          ...baseSettings,
          riskLevel: 'moderate',
          maxPositionSize: 0.1,
          stopLoss: -7,
          takeProfit: 15,
          activeStrategy: 'breakout',
          autoTrading: true,
          maxDailyTrades: 20,
          tradingPairs: [...baseSettings.tradingPairs, 'ETH3L/USDT', 'ETH3S/USDT']
        };

      case 'autonomous-trader':
        return {
          ...baseSettings,
          riskLevel: 'aggressive',
          maxPositionSize: 0.15,
          stopLoss: -10,
          takeProfit: 20,
          activeStrategy: 'mean_reversion',
          autoTrading: true,
          maxDailyTrades: 50,
          advanced: {
            ...baseSettings.advanced,
            confidenceThreshold: 0.65,
            signalFilters: [...baseSettings.advanced.signalFilters, 'ml_confirmation']
          }
        };

      case 'full-engine':
        return {
          ...baseSettings,
          riskLevel: 'aggressive',
          maxPositionSize: 0.25,
          stopLoss: -12,
          takeProfit: 25,
          activeStrategy: 'multi_strategy',
          autoTrading: true,
          maxDailyTrades: 100,
          strategies: [...baseSettings.strategies, 'multi_strategy', 'arbitrage', 'scalping'],
          advanced: {
            ...baseSettings.advanced,
            aiModel: 'ensemble_model_v4',
            confidenceThreshold: 0.6,
            signalFilters: [...baseSettings.advanced.signalFilters, 'ml_confirmation', 'sentiment_analysis']
          }
        };

      case 'nwaora-chigozie':
        return {
          ...baseSettings,
          riskLevel: 'moderate',
          maxPositionSize: 0.08,
          stopLoss: -8,
          takeProfit: 18,
          activeStrategy: 'divine_intuition',
          autoTrading: true,
          maxDailyTrades: 15,
          strategies: [...baseSettings.strategies, 'divine_intuition', 'spiritual_signals'],
          advanced: {
            ...baseSettings.advanced,
            aiModel: 'divine_consciousness_v2',
            confidenceThreshold: 0.7,
            signalFilters: [...baseSettings.advanced.signalFilters, 'spiritual_alignment']
          }
        };

      default:
        return { ...baseSettings, riskLevel: 'moderate', maxPositionSize: 0.05, stopLoss: -5, takeProfit: 10, activeStrategy: 'trend_following', autoTrading: false, maxDailyTrades: 5 };
    }
  }

  private createDefaultProfitLossTracker(botId: string): ProfitLossTracker {
    return {
      botId,
      totalProfit: 0,
      totalLoss: 0,
      netProfitLoss: 0,
      winRate: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      profitFactor: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      currentDrawdown: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      dailyProfitLoss: 0,
      weeklyProfitLoss: 0,
      monthlyProfitLoss: 0,
      yearlyProfitLoss: 0,
      isCurrentlyProfiting: false,
      isCurrentlyLosing: false,
      lastTradeResult: 'neutral',
      riskAdjustedReturns: 0
    };
  }

  private createDefaultBotMemory(botId: string): BotMemory {
    return {
      botId,
      marketLearnings: {
        bestPerformingConditions: [],
        worstPerformingConditions: [],
        profitablePatterns: [],
        lossPatterns: []
      },
      adaptiveSettings: {
        dynamicRiskAdjustment: true,
        performanceBasedPositioning: true,
        lossRecoveryMode: false,
        profitTakingOptimization: true
      },
      emotionalState: {
        confidence: 0.7,
        aggression: 0.5,
        caution: 0.5,
        greed: 0.3,
        fear: 0.2
      },
      recentPerformanceWindow: []
    };
  }

  private getBotDisplayName(botId: string): string {
    const names = {
      'maibot': 'Maibot (Free)',
      'waidbot': 'WaidBot α',
      'waidbot-pro': 'WaidBot Pro β',
      'autonomous-trader': 'Autonomous Trader γ',
      'full-engine': 'Full Engine Ω',
      'nwaora-chigozie': 'Nwaora Chigozie ε'
    };
    return names[botId] || botId;
  }

  // Settings Management
  public getBotSettings(botId: string): BotSettings | null {
    return this.botSettings.get(botId) || null;
  }

  public updateBotSettings(botId: string, settings: Partial<BotSettings>): boolean {
    const currentSettings = this.botSettings.get(botId);
    if (!currentSettings) return false;

    const updatedSettings = { ...currentSettings, ...settings };
    this.botSettings.set(botId, updatedSettings);
    return true;
  }

  public updateBotSetting(botId: string, settingKey: string, settingValue: any): boolean {
    const currentSettings = this.botSettings.get(botId);
    if (!currentSettings) return false;

    // Handle nested settings like 'advanced.confidenceThreshold'
    if (settingKey.includes('.')) {
      const keys = settingKey.split('.');
      let target = currentSettings.settings as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!target[keys[i]]) target[keys[i]] = {};
        target = target[keys[i]];
      }
      
      target[keys[keys.length - 1]] = settingValue;
    } else {
      (currentSettings.settings as any)[settingKey] = settingValue;
    }

    currentSettings.lastUpdated = new Date();
    this.botSettings.set(botId, currentSettings);
    return true;
  }

  public resetBotSettings(botId: string): boolean {
    const defaultSettings = this.createDefaultBotSettings(botId);
    this.botSettings.set(botId, {
      botId,
      settings: defaultSettings,
      lastUpdated: new Date()
    });
    return true;
  }

  // Profit/Loss Tracking
  public recordTrade(trade: TradeResult): void {
    const tracker = this.profitLossTrackers.get(trade.botId);
    if (!tracker) return;

    // Update trade history
    const history = this.tradeHistory.get(trade.botId) || [];
    history.push(trade);
    if (history.length > 1000) history.shift(); // Keep last 1000 trades
    this.tradeHistory.set(trade.botId, history);

    // Update profit/loss tracker
    tracker.totalTrades++;
    
    if (trade.isWin) {
      tracker.winningTrades++;
      tracker.totalProfit += trade.profit;
      tracker.consecutiveWins++;
      tracker.consecutiveLosses = 0;
      tracker.lastTradeResult = 'win';
      if (trade.profit > tracker.largestWin) tracker.largestWin = trade.profit;
    } else if (trade.netResult < 0) {
      tracker.losingTrades++;
      tracker.totalLoss += Math.abs(trade.loss);
      tracker.consecutiveLosses++;
      tracker.consecutiveWins = 0;
      tracker.lastTradeResult = 'loss';
      if (Math.abs(trade.loss) > tracker.largestLoss) tracker.largestLoss = Math.abs(trade.loss);
    } else {
      tracker.lastTradeResult = 'neutral';
    }

    // Calculate metrics
    tracker.netProfitLoss = tracker.totalProfit - tracker.totalLoss;
    tracker.winRate = tracker.totalTrades > 0 ? (tracker.winningTrades / tracker.totalTrades) * 100 : 0;
    tracker.averageWin = tracker.winningTrades > 0 ? tracker.totalProfit / tracker.winningTrades : 0;
    tracker.averageLoss = tracker.losingTrades > 0 ? tracker.totalLoss / tracker.losingTrades : 0;
    tracker.profitFactor = tracker.totalLoss > 0 ? tracker.totalProfit / tracker.totalLoss : tracker.totalProfit;
    
    // Update status flags
    tracker.isCurrentlyProfiting = tracker.netProfitLoss > 0;
    tracker.isCurrentlyLosing = tracker.netProfitLoss < 0;

    // Update drawdown
    this.updateDrawdown(tracker, trade);

    // Update time-based profit/loss
    this.updateTimePeriodProfitLoss(tracker, trade);
  }

  private updateDrawdown(tracker: ProfitLossTracker, trade: TradeResult): void {
    if (trade.netResult < 0) {
      tracker.currentDrawdown += Math.abs(trade.netResult);
      if (tracker.currentDrawdown > tracker.maxDrawdown) {
        tracker.maxDrawdown = tracker.currentDrawdown;
      }
    } else if (trade.netResult > 0) {
      tracker.currentDrawdown = Math.max(0, tracker.currentDrawdown - trade.netResult);
    }
  }

  private updateTimePeriodProfitLoss(tracker: ProfitLossTracker, trade: TradeResult): void {
    const now = new Date();
    const tradeDate = new Date(trade.timestamp);
    
    // Daily profit/loss (last 24 hours)
    if (now.getTime() - tradeDate.getTime() < 24 * 60 * 60 * 1000) {
      tracker.dailyProfitLoss += trade.netResult;
    }
    
    // Weekly profit/loss (last 7 days)
    if (now.getTime() - tradeDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
      tracker.weeklyProfitLoss += trade.netResult;
    }
    
    // Monthly profit/loss (last 30 days)
    if (now.getTime() - tradeDate.getTime() < 30 * 24 * 60 * 60 * 1000) {
      tracker.monthlyProfitLoss += trade.netResult;
    }
    
    // Yearly profit/loss (last 365 days)
    if (now.getTime() - tradeDate.getTime() < 365 * 24 * 60 * 60 * 1000) {
      tracker.yearlyProfitLoss += trade.netResult;
    }
  }

  public getProfitLossTracker(botId: string): ProfitLossTracker | null {
    return this.profitLossTrackers.get(botId) || null;
  }

  public getAllProfitLossTrackers(): Map<string, ProfitLossTracker> {
    return new Map(this.profitLossTrackers);
  }

  // Bot Memory and Learning
  public updateBotMemory(botId: string, memory: Partial<BotMemory>): boolean {
    const currentMemory = this.botMemories.get(botId);
    if (!currentMemory) return false;

    const updatedMemory = { ...currentMemory, ...memory };
    this.botMemories.set(botId, updatedMemory);
    return true;
  }

  public getBotMemory(botId: string): BotMemory | null {
    return this.botMemories.get(botId) || null;
  }

  // Trade History
  public getTradeHistory(botId: string, limit: number = 100): TradeResult[] {
    const history = this.tradeHistory.get(botId) || [];
    return history.slice(-limit).reverse(); // Return latest trades first
  }

  // Analysis Methods
  public analyzePerformance(botId: string): any {
    const tracker = this.profitLossTrackers.get(botId);
    const memory = this.botMemories.get(botId);
    const trades = this.tradeHistory.get(botId) || [];

    if (!tracker || !memory) return null;

    return {
      overall: {
        profitability: tracker.isCurrentlyProfiting ? 'PROFITABLE' : tracker.isCurrentlyLosing ? 'LOSING' : 'NEUTRAL',
        performance: tracker.netProfitLoss > 1000 ? 'EXCELLENT' : tracker.netProfitLoss > 500 ? 'GOOD' : tracker.netProfitLoss > 0 ? 'FAIR' : 'POOR',
        riskAssessment: tracker.maxDrawdown > 1000 ? 'HIGH_RISK' : tracker.maxDrawdown > 500 ? 'MEDIUM_RISK' : 'LOW_RISK'
      },
      currentStatus: {
        isProfit: tracker.isCurrentlyProfiting,
        isLoss: tracker.isCurrentlyLosing,
        consecutiveWins: tracker.consecutiveWins,
        consecutiveLosses: tracker.consecutiveLosses,
        needsAttention: tracker.consecutiveLosses > 3 || tracker.currentDrawdown > 500
      },
      recommendations: this.generateRecommendations(tracker, memory)
    };
  }

  private generateRecommendations(tracker: ProfitLossTracker, memory: BotMemory): string[] {
    const recommendations = [];

    if (tracker.consecutiveLosses > 3) {
      recommendations.push('Consider reducing position size due to consecutive losses');
    }

    if (tracker.winRate < 40) {
      recommendations.push('Review and optimize trading strategy - win rate below 40%');
    }

    if (tracker.currentDrawdown > 500) {
      recommendations.push('Implement stricter risk management - current drawdown is high');
    }

    if (tracker.profitFactor < 1.2) {
      recommendations.push('Improve profit factor by optimizing take profit and stop loss levels');
    }

    if (memory.emotionalState.fear > 0.7) {
      recommendations.push('Bot showing high fear levels - consider paper trading to rebuild confidence');
    }

    return recommendations;
  }

  // Emergency Controls
  public triggerEmergencyStop(botId: string, reason: string): boolean {
    const settings = this.botSettings.get(botId);
    if (!settings) return false;

    settings.autoTrading = false;
    settings.emergencyStop.enabled = true;
    
    console.log(`🚨 Emergency stop triggered for ${botId}: ${reason}`);
    return true;
  }

  public checkEmergencyConditions(botId: string): boolean {
    const tracker = this.profitLossTrackers.get(botId);
    const settings = this.botSettings.get(botId);
    
    if (!tracker || !settings || !settings.emergencyStop.enabled) return false;

    // Check daily loss limit
    if (tracker.dailyProfitLoss <= settings.emergencyStop.maxDailyLoss) {
      this.triggerEmergencyStop(botId, `Daily loss limit exceeded: ${tracker.dailyProfitLoss}`);
      return true;
    }

    // Check consecutive loss limit
    if (tracker.consecutiveLosses >= settings.emergencyStop.consecutiveLossLimit) {
      this.triggerEmergencyStop(botId, `Consecutive loss limit reached: ${tracker.consecutiveLosses}`);
      return true;
    }

    return false;
  }
}

export const enhancedBotConfiguration = new EnhancedBotConfiguration();