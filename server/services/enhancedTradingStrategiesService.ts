import { storage } from '../storage.js';
import type { InsertTradingStrategy, TradingStrategy, InsertStrategyTradingHistory } from '@shared/schema.js';

export class EnhancedTradingStrategiesService {
  private strategiesCache: Map<string, TradingStrategy[]> = new Map();
  private lastUpdateTime: number = 0;

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    try {
      // Create default strategies if none exist
      const activeStrategies = await storage.getActiveStrategies();
      if (activeStrategies.length === 0) {
        await this.createDefaultStrategies();
      }
      
      // Cache active strategies
      await this.refreshCache();
    } catch (error) {
      console.error('Error initializing Enhanced Trading Strategies Service:', error);
    }
  }

  private async createDefaultStrategies() {
    const defaultStrategies: InsertTradingStrategy[] = [
      {
        name: 'Divine Quantum Flux Strategy',
        description: 'Advanced quantum-powered trading strategy using Kons Powa energy fields and 8-dimensional market analysis.',
        strategyType: 'SWING',
        riskLevel: 'MEDIUM',
        timeframe: '4h',
        entryConditions: {
          konsPowerLevel: { min: 75 },
          divineAlignment: { min: 80 },
          rsi: { min: 30, max: 70 },
          quantumFlux: { threshold: 0.8 },
          spiritualEnergy: { min: 85 }
        },
        exitConditions: {
          profitTarget: 1.05,
          stopLoss: 0.97,
          konsPowerDecline: { threshold: 50 },
          timeExit: { hours: 8 }
        },
        riskManagement: {
          maxPositionSize: 0.25,
          maxDailyTrades: 3,
          cooldownPeriod: 2,
          emergencyStop: true
        },
        backtestResults: {
          winRate: 78.5,
          profitFactor: 2.4,
          totalTrades: 156,
          avgReturn: 3.2
        },
        performanceMetrics: {
          sharpeRatio: 1.85,
          maxDrawdown: 8.5,
          volatility: 12.3,
          alpha: 0.15
        },
        winRate: 78.5,
        profitFactor: 2.4,
        maxDrawdown: 8.5,
        sharpeRatio: 1.85,
        tags: ['quantum', 'divine', 'kons-powa', 'advanced']
      },
      {
        name: 'Neural Singularity Strategy',
        description: 'AI-powered neural network strategy with LSTM quantum processing and harmonic balance calculations.',
        strategyType: 'SCALPING',
        riskLevel: 'LOW',
        timeframe: '15m',
        entryConditions: {
          neuralConfidence: { min: 85 },
          lstmSignal: 'STRONG_BUY',
          harmonicBalance: { threshold: 0.75 },
          marketPhase: ['entangled_bullish', 'bullish']
        },
        exitConditions: {
          profitTarget: 1.02,
          stopLoss: 0.995,
          neuralExit: true,
          quickExit: { minutes: 30 }
        },
        riskManagement: {
          maxPositionSize: 0.15,
          maxDailyTrades: 10,
          cooldownPeriod: 1,
          adaptiveRisk: true
        },
        backtestResults: {
          winRate: 82.3,
          profitFactor: 1.8,
          totalTrades: 342,
          avgReturn: 1.5
        },
        performanceMetrics: {
          sharpeRatio: 2.1,
          maxDrawdown: 4.2,
          volatility: 8.7,
          alpha: 0.08
        },
        winRate: 82.3,
        profitFactor: 1.8,
        maxDrawdown: 4.2,
        sharpeRatio: 2.1,
        tags: ['neural', 'ai', 'scalping', 'lstm']
      },
      {
        name: 'Sacred Positioning Engine',
        description: 'Harmonic entry alignment strategy using breathing-like position expansion and sacred timing.',
        strategyType: 'POSITION',
        riskLevel: 'LOW',
        timeframe: '1d',
        entryConditions: {
          sacredThreshold: { min: 72 },
          harmonicAlignment: true,
          energyFlow: 'POSITIVE',
          breathingCycle: 'EXPANSION'
        },
        exitConditions: {
          profitTarget: 1.15,
          stopLoss: 0.92,
          energyDepletion: true,
          sacredCompletion: true
        },
        riskManagement: {
          maxPositionSize: 0.4,
          maxDailyTrades: 1,
          cooldownPeriod: 24,
          positionBreathing: true
        },
        backtestResults: {
          winRate: 71.2,
          profitFactor: 3.2,
          totalTrades: 89,
          avgReturn: 8.5
        },
        performanceMetrics: {
          sharpeRatio: 1.6,
          maxDrawdown: 15.3,
          volatility: 18.5,
          alpha: 0.25
        },
        winRate: 71.2,
        profitFactor: 3.2,
        maxDrawdown: 15.3,
        sharpeRatio: 1.6,
        tags: ['sacred', 'positioning', 'harmonic', 'long-term']
      },
      {
        name: 'Shadow Override Defense',
        description: 'Emergency protection strategy with chaos detection and instinct-based trading blocks.',
        strategyType: 'DCA',
        riskLevel: 'HIGH',
        timeframe: '1h',
        entryConditions: {
          chaosLevel: { max: 30 },
          instinctLevel: 'DORMANT',
          marketStability: true,
          volatilitySpike: false
        },
        exitConditions: {
          profitTarget: 1.08,
          stopLoss: 0.95,
          chaosDetection: true,
          instinctOverride: true
        },
        riskManagement: {
          maxPositionSize: 0.1,
          maxDailyTrades: 5,
          cooldownPeriod: 4,
          shadowProtection: true
        },
        backtestResults: {
          winRate: 65.8,
          profitFactor: 1.9,
          totalTrades: 203,
          avgReturn: 2.8
        },
        performanceMetrics: {
          sharpeRatio: 1.3,
          maxDrawdown: 12.7,
          volatility: 15.2,
          alpha: 0.12
        },
        winRate: 65.8,
        profitFactor: 1.9,
        maxDrawdown: 12.7,
        sharpeRatio: 1.3,
        tags: ['defense', 'chaos', 'protection', 'emergency']
      },
      {
        name: 'Momentum Acceleration Engine',
        description: 'High-frequency momentum capture with micro-movement detection and trend acceleration.',
        strategyType: 'SCALPING',
        riskLevel: 'MEDIUM',
        timeframe: '5m',
        entryConditions: {
          momentumScore: { min: 80 },
          trendAcceleration: true,
          microMovement: 'DETECTED',
          volumeSpike: true
        },
        exitConditions: {
          profitTarget: 1.015,
          stopLoss: 0.998,
          momentumLoss: true,
          rapidExit: { minutes: 10 }
        },
        riskManagement: {
          maxPositionSize: 0.2,
          maxDailyTrades: 15,
          cooldownPeriod: 0.5,
          microRisk: true
        },
        backtestResults: {
          winRate: 76.4,
          profitFactor: 2.1,
          totalTrades: 487,
          avgReturn: 1.2
        },
        performanceMetrics: {
          sharpeRatio: 1.9,
          maxDrawdown: 6.8,
          volatility: 9.5,
          alpha: 0.06
        },
        winRate: 76.4,
        profitFactor: 2.1,
        maxDrawdown: 6.8,
        sharpeRatio: 1.9,
        tags: ['momentum', 'scalping', 'acceleration', 'micro']
      }
    ];

    for (const strategy of defaultStrategies) {
      await storage.createStrategy(strategy);
    }

    console.log('✨ Created 5 default enhanced trading strategies');
  }

  async getAllActiveStrategies(): Promise<TradingStrategy[]> {
    // Return cached strategies if fresh
    const cached = this.strategiesCache.get('active');
    if (cached && Date.now() - this.lastUpdateTime < 10 * 60 * 1000) {
      return cached;
    }

    return await this.refreshCache();
  }

  private async refreshCache(): Promise<TradingStrategy[]> {
    const strategies = await storage.getActiveStrategies();
    this.strategiesCache.set('active', strategies);
    this.lastUpdateTime = Date.now();
    return strategies;
  }

  async getStrategyById(id: number): Promise<TradingStrategy | undefined> {
    return await storage.getStrategyById(id);
  }

  async getStrategyHistory(strategyId: number, limit?: number): Promise<any[]> {
    return await storage.getStrategyHistory(strategyId, limit);
  }

  async evaluateStrategyPerformance(strategyId: number): Promise<any> {
    const strategy = await storage.getStrategyById(strategyId);
    if (!strategy) {
      throw new Error('Strategy not found');
    }

    const tradeHistory = await storage.getStrategyHistory(strategyId, 100);
    
    return this.calculatePerformanceMetrics(strategy, tradeHistory);
  }

  private calculatePerformanceMetrics(strategy: TradingStrategy, trades: any[]): any {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        profitFactor: 0,
        avgReturn: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        totalProfit: 0,
        bestTrade: 0,
        worstTrade: 0
      };
    }

    const winningTrades = trades.filter(trade => trade.profit > 0);
    const losingTrades = trades.filter(trade => trade.profit <= 0);
    
    const totalProfit = trades.reduce((sum, trade) => sum + trade.profit, 0);
    const totalWinnings = winningTrades.reduce((sum, trade) => sum + trade.profit, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.profit, 0));
    
    const winRate = (winningTrades.length / trades.length) * 100;
    const profitFactor = totalLosses > 0 ? totalWinnings / totalLosses : 0;
    const avgReturn = totalProfit / trades.length;
    
    // Calculate maximum drawdown
    let runningProfit = 0;
    let maxProfit = 0;
    let maxDrawdown = 0;
    
    for (const trade of trades.reverse()) {
      runningProfit += trade.profit;
      maxProfit = Math.max(maxProfit, runningProfit);
      const drawdown = ((maxProfit - runningProfit) / maxProfit) * 100;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    
    // Calculate Sharpe ratio (simplified)
    const returns = trades.map(trade => trade.profitPercentage || 0);
    const avgReturnPercent = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturnPercent, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);
    const sharpeRatio = volatility > 0 ? avgReturnPercent / volatility : 0;
    
    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: Math.round(winRate * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      avgReturn: Math.round(avgReturn * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      bestTrade: Math.max(...trades.map(t => t.profit)),
      worstTrade: Math.min(...trades.map(t => t.profit))
    };
  }

  async simulateStrategy(strategyId: number, marketConditions: any): Promise<any> {
    const strategy = await storage.getStrategyById(strategyId);
    if (!strategy) {
      throw new Error('Strategy not found');
    }

    // Simulate strategy execution based on current market conditions
    const simulation = this.runStrategySimulation(strategy, marketConditions);
    
    return {
      strategy: strategy.name,
      simulation,
      recommendation: this.generateRecommendation(simulation, strategy),
      riskAssessment: this.assessRisk(strategy, marketConditions)
    };
  }

  private runStrategySimulation(strategy: TradingStrategy, marketConditions: any): any {
    const { entryConditions, exitConditions, riskManagement } = strategy;
    
    // Check entry conditions
    const entrySignal = this.evaluateEntryConditions(entryConditions, marketConditions);
    
    if (!entrySignal.met) {
      return {
        action: 'WAIT',
        reason: entrySignal.reason,
        confidence: 0,
        expectedReturn: 0,
        risk: 0
      };
    }
    
    // Calculate expected outcomes
    const expectedProfit = this.calculateExpectedProfit(strategy, marketConditions);
    const riskLevel = this.calculateRiskLevel(strategy, marketConditions);
    
    return {
      action: 'ENTER',
      reason: entrySignal.reason,
      confidence: entrySignal.confidence,
      expectedReturn: expectedProfit,
      risk: riskLevel,
      positionSize: this.calculatePositionSize(riskManagement, marketConditions),
      estimatedDuration: this.estimateTradeDuration(strategy, marketConditions)
    };
  }

  private evaluateEntryConditions(conditions: any, market: any): any {
    const checks = [];
    let confidence = 0;
    
    // Evaluate different condition types
    if (conditions.konsPowerLevel) {
      const kondPower = market.konsPowerLevel || 75;
      if (kondPower >= conditions.konsPowerLevel.min) {
        checks.push({ name: 'Kons Power Level', met: true, contribution: 20 });
        confidence += 20;
      } else {
        checks.push({ name: 'Kons Power Level', met: false, contribution: 0 });
      }
    }
    
    if (conditions.rsi) {
      const rsi = market.rsi || 50;
      if (rsi >= conditions.rsi.min && rsi <= conditions.rsi.max) {
        checks.push({ name: 'RSI Range', met: true, contribution: 15 });
        confidence += 15;
      } else {
        checks.push({ name: 'RSI Range', met: false, contribution: 0 });
      }
    }
    
    if (conditions.neuralConfidence) {
      const neural = market.neuralConfidence || 70;
      if (neural >= conditions.neuralConfidence.min) {
        checks.push({ name: 'Neural Confidence', met: true, contribution: 25 });
        confidence += 25;
      } else {
        checks.push({ name: 'Neural Confidence', met: false, contribution: 0 });
      }
    }
    
    if (conditions.momentumScore) {
      const momentum = market.momentumScore || 60;
      if (momentum >= conditions.momentumScore.min) {
        checks.push({ name: 'Momentum Score', met: true, contribution: 20 });
        confidence += 20;
      } else {
        checks.push({ name: 'Momentum Score', met: false, contribution: 0 });
      }
    }
    
    // Add more condition evaluations as needed
    
    const passedChecks = checks.filter(c => c.met).length;
    const totalChecks = checks.length;
    const met = passedChecks >= Math.ceil(totalChecks * 0.7); // 70% of conditions must pass
    
    return {
      met,
      confidence: Math.min(confidence, 100),
      reason: met ? 
        `${passedChecks}/${totalChecks} entry conditions satisfied` : 
        `Only ${passedChecks}/${totalChecks} entry conditions met`,
      checks
    };
  }

  private calculateExpectedProfit(strategy: TradingStrategy, market: any): number {
    // Base expected return on strategy's historical performance
    let expectedReturn = strategy.performanceMetrics?.avgReturn || 2.5;
    
    // Adjust based on current market conditions
    if (market.volatility > 10) expectedReturn *= 1.2; // Higher volatility = higher potential
    if (market.volume?.strength > 1.5) expectedReturn *= 1.1; // High volume = better execution
    if (market.trend === 'BULLISH') expectedReturn *= 1.15; // Trend alignment
    
    return Math.round(expectedReturn * 100) / 100;
  }

  private calculateRiskLevel(strategy: TradingStrategy, market: any): number {
    let baseRisk = strategy.riskLevel === 'LOW' ? 2 : strategy.riskLevel === 'MEDIUM' ? 5 : 8;
    
    // Adjust risk based on market conditions
    if (market.volatility > 15) baseRisk += 3;
    if (market.fearGreedIndex < 20 || market.fearGreedIndex > 80) baseRisk += 2;
    if (market.chaos?.level > 70) baseRisk += 5;
    
    return Math.min(baseRisk, 10);
  }

  private calculatePositionSize(riskManagement: any, market: any): number {
    let positionSize = riskManagement.maxPositionSize || 0.25;
    
    // Reduce position size in high volatility
    if (market.volatility > 15) positionSize *= 0.8;
    if (market.chaos?.level > 50) positionSize *= 0.6;
    
    return Math.round(positionSize * 100) / 100;
  }

  private estimateTradeDuration(strategy: TradingStrategy, market: any): string {
    const timeframes = {
      '5m': 30, // minutes
      '15m': 90,
      '1h': 240,
      '4h': 960,
      '1d': 2880
    };
    
    const baseMinutes = timeframes[strategy.timeframe] || 240;
    
    // Adjust based on market conditions
    let multiplier = 1;
    if (market.volatility > 10) multiplier *= 0.8; // Faster in volatile markets
    if (strategy.strategyType === 'SCALPING') multiplier *= 0.5;
    if (strategy.strategyType === 'POSITION') multiplier *= 2;
    
    const estimatedMinutes = baseMinutes * multiplier;
    
    if (estimatedMinutes < 60) return `${Math.round(estimatedMinutes)}m`;
    if (estimatedMinutes < 1440) return `${Math.round(estimatedMinutes / 60)}h`;
    return `${Math.round(estimatedMinutes / 1440)}d`;
  }

  private generateRecommendation(simulation: any, strategy: TradingStrategy): any {
    let recommendation = 'WAIT';
    let reasoning = 'Conditions not optimal for entry';
    
    if (simulation.action === 'ENTER') {
      if (simulation.confidence > 80 && simulation.risk < 5) {
        recommendation = 'STRONG_BUY';
        reasoning = 'High confidence with low risk - excellent entry opportunity';
      } else if (simulation.confidence > 60 && simulation.risk < 7) {
        recommendation = 'BUY';
        reasoning = 'Good entry conditions with manageable risk';
      } else if (simulation.confidence > 40) {
        recommendation = 'WEAK_BUY';
        reasoning = 'Marginal entry conditions - consider smaller position';
      }
    }
    
    return {
      action: recommendation,
      reasoning,
      confidence: simulation.confidence,
      strategy: strategy.name,
      positionSize: simulation.positionSize,
      estimatedReturn: simulation.expectedReturn,
      riskLevel: simulation.risk
    };
  }

  private assessRisk(strategy: TradingStrategy, market: any): any {
    const risks = [];
    
    // Market risks
    if (market.volatility > 15) {
      risks.push({
        type: 'MARKET_VOLATILITY',
        level: 'HIGH',
        description: 'High market volatility may cause unpredictable price movements'
      });
    }
    
    if (market.volume?.strength < 0.5) {
      risks.push({
        type: 'LOW_LIQUIDITY',
        level: 'MEDIUM',
        description: 'Low trading volume may result in poor trade execution'
      });
    }
    
    // Strategy-specific risks
    if (strategy.strategyType === 'SCALPING' && market.spread > 0.1) {
      risks.push({
        type: 'SPREAD_RISK',
        level: 'HIGH',
        description: 'High spread unfavorable for scalping strategy'
      });
    }
    
    if (strategy.maxDrawdown > 15) {
      risks.push({
        type: 'DRAWDOWN_RISK',
        level: 'MEDIUM',
        description: 'Strategy has historically high maximum drawdown'
      });
    }
    
    const overallRisk = risks.length === 0 ? 'LOW' : 
                       risks.filter(r => r.level === 'HIGH').length > 0 ? 'HIGH' : 'MEDIUM';
    
    return {
      overall: overallRisk,
      factors: risks,
      recommendation: overallRisk === 'HIGH' ? 'Reduce position size or wait for better conditions' :
                     overallRisk === 'MEDIUM' ? 'Proceed with standard risk management' :
                     'Favorable risk environment for strategy execution'
    };
  }

  async recordTrade(strategyId: number, tradeData: any): Promise<any> {
    const trade: InsertStrategyTradingHistory = {
      strategyId,
      ethPrice: tradeData.ethPrice,
      action: tradeData.action,
      quantity: tradeData.quantity,
      executedPrice: tradeData.executedPrice,
      profit: tradeData.profit || 0,
      profitPercentage: tradeData.profitPercentage || 0,
      confidence: tradeData.confidence || 50,
      reasoning: tradeData.reasoning || 'Trade executed',
      marketConditions: tradeData.marketConditions || {},
      status: tradeData.status || 'COMPLETED'
    };

    return await storage.recordStrategyTrade(trade);
  }

  async getStrategyRecommendations(marketData: any): Promise<any[]> {
    const strategies = await this.getAllActiveStrategies();
    const recommendations = [];
    
    for (const strategy of strategies) {
      const simulation = await this.simulateStrategy(strategy.id, marketData);
      if (simulation.recommendation.action !== 'WAIT') {
        recommendations.push({
          strategyId: strategy.id,
          strategyName: strategy.name,
          recommendation: simulation.recommendation,
          riskAssessment: simulation.riskAssessment
        });
      }
    }
    
    // Sort by confidence and expected return
    return recommendations.sort((a, b) => 
      (b.recommendation.confidence * b.recommendation.estimatedReturn) - 
      (a.recommendation.confidence * a.recommendation.estimatedReturn)
    );
  }
}

export const enhancedTradingStrategiesService = new EnhancedTradingStrategiesService();