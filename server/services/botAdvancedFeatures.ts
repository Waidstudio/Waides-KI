/**
 * Bot Advanced Features Service
 * Enhanced trading capabilities, AI learning, and intelligent automation
 */

import { enhancedBotConfiguration, BotSettings, ProfitLossTracker, TradeResult } from './enhancedBotConfiguration';

export interface MarketCondition {
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  volume: 'LOW' | 'MEDIUM' | 'HIGH';
  sentiment: 'FEAR' | 'GREED' | 'NEUTRAL';
  strength: number; // 0-100
}

export interface TradingSignal {
  botId: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  strength: number;
  symbol: string;
  targetPrice: number;
  stopLoss: number;
  takeProfit: number;
  reasoning: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timeframe: string;
  strategy: string;
  marketConditions: MarketCondition;
  timestamp: number;
}

export interface BotPerformanceMetrics {
  botId: string;
  efficiency: number;
  adaptability: number;
  consistency: number;
  riskManagement: number;
  learningProgress: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  improvementAreas: string[];
}

export interface AutoOptimizationResult {
  botId: string;
  optimizations: {
    parameter: string;
    oldValue: any;
    newValue: any;
    expectedImprovement: number;
    reasoning: string;
  }[];
  projectedPerformance: {
    winRateImprovement: number;
    profitImprovement: number;
    riskReduction: number;
  };
  implementationDate: number;
}

class BotAdvancedFeatures {
  private marketConditionsCache: Map<string, MarketCondition> = new Map();
  private signalsHistory: Map<string, TradingSignal[]> = new Map();
  private performanceMetrics: Map<string, BotPerformanceMetrics> = new Map();

  constructor() {
    this.initializeAdvancedFeatures();
  }

  private initializeAdvancedFeatures(): void {
    const bots = ['maibot', 'waidbot', 'waidbot-pro', 'autonomous-trader', 'full-engine', 'nwaora-chigozie'];
    
    bots.forEach(botId => {
      this.signalsHistory.set(botId, []);
      this.performanceMetrics.set(botId, this.calculatePerformanceMetrics(botId));
    });

    // Start periodic optimization checks
    setInterval(() => {
      this.runPeriodicOptimization();
    }, 60 * 60 * 1000); // Every hour
  }

  // Market Analysis and Signal Generation
  public async analyzeMarketConditions(symbol: string = 'ETH/USDT'): Promise<MarketCondition> {
    // Check cache first
    const cached = this.marketConditionsCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes cache
      return cached;
    }

    // Simulate advanced market analysis
    const mockPrice = 3800 + (Math.random() - 0.5) * 200;
    const priceChange = (Math.random() - 0.5) * 10;
    const volume = Math.random() * 1000000;
    const volatilityIndex = Math.random() * 100;

    const condition: MarketCondition = {
      trend: priceChange > 2 ? 'BULLISH' : priceChange < -2 ? 'BEARISH' : 'SIDEWAYS',
      volatility: volatilityIndex > 70 ? 'HIGH' : volatilityIndex > 30 ? 'MEDIUM' : 'LOW',
      volume: volume > 600000 ? 'HIGH' : volume > 300000 ? 'MEDIUM' : 'LOW',
      sentiment: Math.random() > 0.6 ? 'GREED' : Math.random() > 0.3 ? 'NEUTRAL' : 'FEAR',
      strength: Math.min(100, Math.max(0, 50 + priceChange * 5 + (volatilityIndex - 50))),
      timestamp: Date.now()
    };

    this.marketConditionsCache.set(symbol, condition);
    return condition;
  }

  public async generateTradingSignal(
    botId: string, 
    symbol: string = 'ETH/USDT',
    marketConditions?: MarketCondition
  ): Promise<TradingSignal> {
    const settings = enhancedBotConfiguration.getBotSettings(botId);
    const tracker = enhancedBotConfiguration.getProfitLossTracker(botId);
    const conditions = marketConditions || await this.analyzeMarketConditions(symbol);

    if (!settings || !tracker) {
      throw new Error(`Bot ${botId} not found or not configured`);
    }

    // Generate signal based on bot configuration and market conditions
    const signal = this.calculateTradingSignal(botId, settings, tracker, conditions, symbol);
    
    // Store signal in history
    const history = this.signalsHistory.get(botId) || [];
    history.push(signal);
    if (history.length > 1000) history.shift(); // Keep last 1000 signals
    this.signalsHistory.set(botId, history);

    return signal;
  }

  private calculateTradingSignal(
    botId: string,
    settings: BotSettings,
    tracker: ProfitLossTracker,
    conditions: MarketCondition,
    symbol: string
  ): TradingSignal {
    // Base confidence calculation
    let confidence = settings.advanced.confidenceThreshold;
    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let strength = 50;
    const reasoning: string[] = [];

    // Market condition analysis
    if (conditions.trend === 'BULLISH' && conditions.strength > 70) {
      action = 'BUY';
      confidence += 0.1;
      strength += 20;
      reasoning.push('Strong bullish trend detected');
    } else if (conditions.trend === 'BEARISH' && conditions.strength > 70) {
      action = 'SELL';
      confidence += 0.1;
      strength += 20;
      reasoning.push('Strong bearish trend detected');
    }

    // Volatility considerations
    if (conditions.volatility === 'HIGH') {
      confidence -= 0.1;
      reasoning.push('High volatility reducing confidence');
    } else if (conditions.volatility === 'LOW') {
      confidence += 0.05;
      reasoning.push('Low volatility favorable for trading');
    }

    // Performance-based adjustments
    if (tracker.consecutiveLosses > 2) {
      confidence -= 0.2;
      strength -= 30;
      reasoning.push('Recent losses reducing signal strength');
    } else if (tracker.consecutiveWins > 3) {
      confidence += 0.1;
      strength += 15;
      reasoning.push('Recent wins increasing confidence');
    }

    // Risk management
    if (tracker.currentDrawdown > settings.emergencyStop.maxDailyLoss * 0.5) {
      action = 'HOLD';
      confidence -= 0.3;
      reasoning.push('High drawdown - holding position');
    }

    // Bot-specific logic
    confidence = this.applyBotSpecificLogic(botId, confidence, conditions, tracker);

    // Calculate price targets
    const currentPrice = 3800 + (Math.random() - 0.5) * 100; // Mock current price
    const targetPrice = action === 'BUY' 
      ? currentPrice * (1 + settings.takeProfit / 100)
      : action === 'SELL' 
        ? currentPrice * (1 - settings.takeProfit / 100)
        : currentPrice;

    const stopLoss = action === 'BUY'
      ? currentPrice * (1 + settings.stopLoss / 100)
      : action === 'SELL'
        ? currentPrice * (1 - settings.stopLoss / 100)
        : currentPrice;

    const takeProfit = action === 'BUY'
      ? currentPrice * (1 + settings.takeProfit / 100)
      : action === 'SELL'
        ? currentPrice * (1 - settings.takeProfit / 100)
        : currentPrice;

    return {
      botId,
      action,
      confidence: Math.min(1, Math.max(0, confidence)),
      strength: Math.min(100, Math.max(0, strength)),
      symbol,
      targetPrice,
      stopLoss,
      takeProfit,
      reasoning,
      riskLevel: this.calculateRiskLevel(confidence, conditions),
      timeframe: settings.activeTimeframe,
      strategy: settings.activeStrategy,
      marketConditions: conditions,
      timestamp: Date.now()
    };
  }

  private applyBotSpecificLogic(
    botId: string, 
    baseConfidence: number, 
    conditions: MarketCondition,
    tracker: ProfitLossTracker
  ): number {
    let confidence = baseConfidence;

    switch (botId) {
      case 'maibot':
        // Conservative adjustments for beginners
        confidence -= 0.1; // More conservative
        if (conditions.volatility === 'HIGH') confidence -= 0.2;
        break;

      case 'waidbot':
        // Momentum-focused adjustments
        if (conditions.trend !== 'SIDEWAYS') confidence += 0.05;
        break;

      case 'waidbot-pro':
        // Bidirectional trading adjustments
        if (conditions.volatility === 'HIGH') confidence += 0.1; // Thrives in volatility
        break;

      case 'autonomous-trader':
        // Aggressive ML-based adjustments
        if (tracker.winRate > 60) confidence += 0.15;
        confidence += 0.05; // Generally more aggressive
        break;

      case 'full-engine':
        // Multi-strategy ensemble adjustments
        confidence += 0.1; // Most sophisticated bot
        if (conditions.strength > 80) confidence += 0.1;
        break;

      case 'nwaora-chigozie':
        // Spiritual/intuition-based adjustments
        if (conditions.sentiment === 'NEUTRAL') confidence += 0.1; // Thrives in balanced markets
        break;
    }

    return confidence;
  }

  private calculateRiskLevel(confidence: number, conditions: MarketCondition): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (confidence > 0.8 && conditions.volatility === 'LOW') return 'LOW';
    if (confidence < 0.5 || conditions.volatility === 'HIGH') return 'HIGH';
    return 'MEDIUM';
  }

  // Performance Analysis
  public calculatePerformanceMetrics(botId: string): BotPerformanceMetrics {
    const tracker = enhancedBotConfiguration.getProfitLossTracker(botId);
    const trades = enhancedBotConfiguration.getTradeHistory(botId, 100);
    
    if (!tracker) {
      return this.createDefaultMetrics(botId);
    }

    // Calculate metrics
    const efficiency = this.calculateEfficiency(tracker, trades);
    const adaptability = this.calculateAdaptability(trades);
    const consistency = this.calculateConsistency(tracker, trades);
    const riskManagement = this.calculateRiskManagement(tracker, trades);
    const learningProgress = this.calculateLearningProgress(trades);

    const overallScore = (efficiency + adaptability + consistency + riskManagement + learningProgress) / 5;

    const metrics: BotPerformanceMetrics = {
      botId,
      efficiency,
      adaptability,
      consistency,
      riskManagement,
      learningProgress,
      overallScore,
      strengths: this.identifyStrengths(efficiency, adaptability, consistency, riskManagement, learningProgress),
      weaknesses: this.identifyWeaknesses(efficiency, adaptability, consistency, riskManagement, learningProgress),
      improvementAreas: this.identifyImprovementAreas(tracker, trades)
    };

    this.performanceMetrics.set(botId, metrics);
    return metrics;
  }

  private calculateEfficiency(tracker: ProfitLossTracker, trades: TradeResult[]): number {
    if (tracker.totalTrades === 0) return 50;
    
    const profitFactor = tracker.profitFactor;
    const winRate = tracker.winRate;
    
    // Efficiency score based on profit factor and win rate
    const efficiencyScore = Math.min(100, (profitFactor * 20) + (winRate * 0.5));
    return Math.max(0, efficiencyScore);
  }

  private calculateAdaptability(trades: TradeResult[]): number {
    if (trades.length < 10) return 50;
    
    // Check performance across different market conditions
    const recentTrades = trades.slice(-20);
    const marketConditions = recentTrades.map(t => t.marketConditions);
    
    const conditionTypes = new Set(marketConditions.map(c => `${c.trend}_${c.volatility}`));
    const adaptabilityScore = Math.min(100, conditionTypes.size * 15);
    
    return adaptabilityScore;
  }

  private calculateConsistency(tracker: ProfitLossTracker, trades: TradeResult[]): number {
    if (trades.length < 5) return 50;
    
    const recentResults = trades.slice(-20).map(t => t.netResult);
    const mean = recentResults.reduce((a, b) => a + b, 0) / recentResults.length;
    const variance = recentResults.reduce((sum, result) => sum + Math.pow(result - mean, 2), 0) / recentResults.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    const consistencyScore = Math.max(0, 100 - (stdDev / 10));
    return Math.min(100, consistencyScore);
  }

  private calculateRiskManagement(tracker: ProfitLossTracker, trades: TradeResult[]): number {
    // Risk management score based on drawdown control and loss limits
    const maxDrawdownRatio = tracker.maxDrawdown / Math.max(1, tracker.totalProfit);
    const consecutiveLossControl = Math.max(0, 10 - tracker.consecutiveLosses) * 10;
    
    const riskScore = Math.min(100, consecutiveLossControl + (100 - Math.min(100, maxDrawdownRatio * 100)));
    return Math.max(0, riskScore);
  }

  private calculateLearningProgress(trades: TradeResult[]): number {
    if (trades.length < 20) return 50;
    
    // Compare early vs recent performance
    const earlyTrades = trades.slice(0, Math.floor(trades.length / 2));
    const recentTrades = trades.slice(Math.floor(trades.length / 2));
    
    const earlyWinRate = earlyTrades.filter(t => t.isWin).length / earlyTrades.length;
    const recentWinRate = recentTrades.filter(t => t.isWin).length / recentTrades.length;
    
    const improvement = ((recentWinRate - earlyWinRate) + 1) * 50; // +1 to avoid negative scores
    return Math.min(100, Math.max(0, improvement));
  }

  private identifyStrengths(eff: number, ada: number, con: number, risk: number, learn: number): string[] {
    const strengths = [];
    if (eff > 80) strengths.push('High Efficiency');
    if (ada > 80) strengths.push('Excellent Adaptability');
    if (con > 80) strengths.push('Consistent Performance');
    if (risk > 80) strengths.push('Strong Risk Management');
    if (learn > 80) strengths.push('Fast Learning');
    return strengths;
  }

  private identifyWeaknesses(eff: number, ada: number, con: number, risk: number, learn: number): string[] {
    const weaknesses = [];
    if (eff < 40) weaknesses.push('Low Efficiency');
    if (ada < 40) weaknesses.push('Poor Adaptability');
    if (con < 40) weaknesses.push('Inconsistent Results');
    if (risk < 40) weaknesses.push('Weak Risk Management');
    if (learn < 40) weaknesses.push('Slow Learning');
    return weaknesses;
  }

  private identifyImprovementAreas(tracker: ProfitLossTracker, trades: TradeResult[]): string[] {
    const areas = [];
    
    if (tracker.winRate < 50) areas.push('Improve signal accuracy');
    if (tracker.profitFactor < 1.5) areas.push('Optimize profit/loss ratio');
    if (tracker.maxDrawdown > 1000) areas.push('Enhance risk controls');
    if (tracker.consecutiveLosses > 5) areas.push('Implement loss recovery strategy');
    
    return areas;
  }

  private createDefaultMetrics(botId: string): BotPerformanceMetrics {
    return {
      botId,
      efficiency: 50,
      adaptability: 50,
      consistency: 50,
      riskManagement: 50,
      learningProgress: 50,
      overallScore: 50,
      strengths: [],
      weaknesses: [],
      improvementAreas: ['Initialize trading to begin performance analysis']
    };
  }

  // Auto-Optimization
  public async autoOptimizeBot(botId: string): Promise<AutoOptimizationResult> {
    const settings = enhancedBotConfiguration.getBotSettings(botId);
    const tracker = enhancedBotConfiguration.getProfitLossTracker(botId);
    const metrics = this.performanceMetrics.get(botId);

    if (!settings || !tracker || !metrics) {
      throw new Error(`Cannot optimize bot ${botId}: Missing configuration or data`);
    }

    const optimizations = [];

    // Optimize stop loss and take profit based on performance
    if (tracker.averageLoss > tracker.averageWin * 0.5) {
      optimizations.push({
        parameter: 'stopLoss',
        oldValue: settings.stopLoss,
        newValue: settings.stopLoss * 0.8, // Tighter stop loss
        expectedImprovement: 15,
        reasoning: 'Reducing stop loss to improve profit/loss ratio'
      });
    }

    // Optimize position size based on win rate
    if (tracker.winRate > 70 && settings.maxPositionSize < 0.15) {
      optimizations.push({
        parameter: 'maxPositionSize',
        oldValue: settings.maxPositionSize,
        newValue: Math.min(0.2, settings.maxPositionSize * 1.2),
        expectedImprovement: 20,
        reasoning: 'Increasing position size due to high win rate'
      });
    } else if (tracker.winRate < 40) {
      optimizations.push({
        parameter: 'maxPositionSize',
        oldValue: settings.maxPositionSize,
        newValue: settings.maxPositionSize * 0.7,
        expectedImprovement: 10,
        reasoning: 'Reducing position size due to low win rate'
      });
    }

    // Optimize confidence threshold
    if (metrics.efficiency < 60) {
      optimizations.push({
        parameter: 'confidenceThreshold',
        oldValue: settings.advanced.confidenceThreshold,
        newValue: Math.min(0.9, settings.advanced.confidenceThreshold + 0.1),
        expectedImprovement: 12,
        reasoning: 'Increasing confidence threshold to filter weak signals'
      });
    }

    return {
      botId,
      optimizations,
      projectedPerformance: {
        winRateImprovement: optimizations.length * 5,
        profitImprovement: optimizations.reduce((sum, opt) => sum + opt.expectedImprovement, 0),
        riskReduction: optimizations.filter(opt => opt.parameter.includes('stop') || opt.parameter.includes('position')).length * 8
      },
      implementationDate: Date.now()
    };
  }

  private async runPeriodicOptimization(): Promise<void> {
    const bots = ['maibot', 'waidbot', 'waidbot-pro', 'autonomous-trader', 'full-engine', 'nwaora-chigozie'];
    
    for (const botId of bots) {
      try {
        const metrics = this.calculatePerformanceMetrics(botId);
        
        // Auto-optimize if performance is declining
        if (metrics.overallScore < 60) {
          const optimization = await this.autoOptimizeBot(botId);
          console.log(`🔧 Auto-optimization generated for ${botId}:`, optimization.optimizations.length, 'improvements');
        }
      } catch (error) {
        console.error(`❌ Error in periodic optimization for ${botId}:`, error);
      }
    }
  }

  // Public API Methods
  public getSignalHistory(botId: string, limit: number = 50): TradingSignal[] {
    const history = this.signalsHistory.get(botId) || [];
    return history.slice(-limit).reverse();
  }

  public getPerformanceMetrics(botId: string): BotPerformanceMetrics | null {
    return this.performanceMetrics.get(botId) || null;
  }

  public async getAdvancedAnalysis(botId: string): Promise<any> {
    const settings = enhancedBotConfiguration.getBotSettings(botId);
    const tracker = enhancedBotConfiguration.getProfitLossTracker(botId);
    const metrics = this.getPerformanceMetrics(botId);
    const recentSignals = this.getSignalHistory(botId, 20);
    
    return {
      currentStatus: {
        isActive: settings?.autoTrading || false,
        performance: metrics?.overallScore || 0,
        profitability: tracker?.isCurrentlyProfiting || false,
        riskLevel: this.assessCurrentRisk(botId)
      },
      insights: {
        strengths: metrics?.strengths || [],
        weaknesses: metrics?.weaknesses || [],
        recommendations: enhancedBotConfiguration.analyzePerformance(botId)?.recommendations || []
      },
      recentActivity: {
        signals: recentSignals.slice(0, 5),
        trades: enhancedBotConfiguration.getTradeHistory(botId, 5)
      }
    };
  }

  private assessCurrentRisk(botId: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const tracker = enhancedBotConfiguration.getProfitLossTracker(botId);
    if (!tracker) return 'MEDIUM';
    
    if (tracker.consecutiveLosses > 5 || tracker.currentDrawdown > 1000) return 'HIGH';
    if (tracker.consecutiveLosses > 2 || tracker.currentDrawdown > 500) return 'MEDIUM';
    return 'LOW';
  }
}

export const botAdvancedFeatures = new BotAdvancedFeatures();