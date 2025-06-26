/**
 * STEP 45: Waides KI Multi-Strategy Ensemble Engine
 * Advanced system running multiple AI trading strategies in parallel with dynamic capital allocation
 */

interface StrategyConfig {
  name: string;
  type: 'MOMENTUM' | 'MEAN_REVERSION' | 'ARBITRAGE' | 'BREAKOUT' | 'GRID' | 'DCA' | 'SCALPING' | 'SWING';
  active: boolean;
  capital_allocation: number; // Percentage of total capital (0-100)
  risk_tolerance: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  parameters: { [key: string]: any };
}

interface StrategyPerformance {
  strategy_name: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  profit_factor: number;
  total_return: number;
  max_drawdown: number;
  sharpe_ratio: number;
  avg_trade_duration: number;
  last_30d_return: number;
  confidence_score: number;
  risk_adjusted_return: number;
}

interface MarketConditions {
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS' | 'VOLATILE' | 'UNKNOWN';
  volatility: number; // 0-1 scale
  volume_profile: 'HIGH' | 'NORMAL' | 'LOW';
  market_phase: 'ACCUMULATION' | 'MARKUP' | 'DISTRIBUTION' | 'MARKDOWN';
  sentiment: 'EXTREME_FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME_GREED';
  institutional_flow: 'INFLOW' | 'OUTFLOW' | 'NEUTRAL';
}

interface EnsembleDecision {
  recommended_action: 'BUY' | 'SELL' | 'HOLD' | 'REBALANCE';
  confidence: number;
  capital_allocation: { [strategy: string]: number };
  active_strategies: string[];
  risk_assessment: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  expected_return: number;
  max_risk: number;
  reasoning: string[];
}

interface EnsembleStats {
  total_strategies: number;
  active_strategies: number;
  total_capital: number;
  allocated_capital: number;
  available_capital: number;
  portfolio_return: number;
  portfolio_sharpe: number;
  portfolio_max_drawdown: number;
  best_performing_strategy: string;
  worst_performing_strategy: string;
  rebalance_frequency: number;
  last_rebalance: Date;
}

export class WaidesKIMultiStrategyEnsemble {
  private strategies: Map<string, StrategyConfig> = new Map();
  private performance: Map<string, StrategyPerformance> = new Map();
  private tradeHistory: any[] = [];
  private totalCapital = 10000; // Starting with $10,000
  private lastRebalance = new Date();
  private rebalanceThreshold = 0.1; // 10% performance deviation triggers rebalance

  private readonly STRATEGY_TEMPLATES = {
    MOMENTUM: {
      rsi_period: 14,
      rsi_overbought: 70,
      rsi_oversold: 30,
      ema_fast: 12,
      ema_slow: 26,
      volume_confirmation: true
    },
    MEAN_REVERSION: {
      bollinger_period: 20,
      bollinger_std: 2,
      rsi_extreme_high: 80,
      rsi_extreme_low: 20,
      reversion_threshold: 0.02
    },
    ARBITRAGE: {
      price_difference_threshold: 0.001,
      execution_speed: 'ULTRA_FAST',
      slippage_tolerance: 0.0005,
      minimum_profit: 0.002
    },
    BREAKOUT: {
      support_resistance_period: 50,
      volume_breakout_multiplier: 1.5,
      false_breakout_filter: true,
      breakout_confirmation_bars: 3
    },
    GRID: {
      grid_spacing: 0.01,
      grid_levels: 10,
      take_profit_per_level: 0.005,
      max_open_positions: 5
    },
    DCA: {
      buy_interval: '1h',
      buy_amount: 100,
      deviation_threshold: -0.05,
      take_profit_target: 0.1
    },
    SCALPING: {
      profit_target: 0.001,
      stop_loss: 0.0005,
      max_hold_time: 300, // 5 minutes
      spread_threshold: 0.0002
    },
    SWING: {
      swing_high_period: 20,
      swing_low_period: 20,
      trend_confirmation: 'EMA_CROSSOVER',
      hold_time_range: [3600, 86400] // 1 hour to 1 day
    }
  };

  constructor() {
    this.initializeDefaultStrategies();
    this.startEnsembleEngine();
  }

  /**
   * Initialize default strategy portfolio
   */
  private initializeDefaultStrategies(): void {
    const defaultStrategies: StrategyConfig[] = [
      {
        name: 'Momentum_Rider',
        type: 'MOMENTUM',
        active: true,
        capital_allocation: 25,
        risk_tolerance: 'MEDIUM',
        timeframe: '15m',
        parameters: this.STRATEGY_TEMPLATES.MOMENTUM
      },
      {
        name: 'Mean_Reversion_Master',
        type: 'MEAN_REVERSION',
        active: true,
        capital_allocation: 20,
        risk_tolerance: 'LOW',
        timeframe: '1h',
        parameters: this.STRATEGY_TEMPLATES.MEAN_REVERSION
      },
      {
        name: 'Breakout_Hunter',
        type: 'BREAKOUT',
        active: true,
        capital_allocation: 20,
        risk_tolerance: 'HIGH',
        timeframe: '4h',
        parameters: this.STRATEGY_TEMPLATES.BREAKOUT
      },
      {
        name: 'Grid_Trader',
        type: 'GRID',
        active: true,
        capital_allocation: 15,
        risk_tolerance: 'LOW',
        timeframe: '1h',
        parameters: this.STRATEGY_TEMPLATES.GRID
      },
      {
        name: 'Scalp_Master',
        type: 'SCALPING',
        active: true,
        capital_allocation: 10,
        risk_tolerance: 'EXTREME',
        timeframe: '1m',
        parameters: this.STRATEGY_TEMPLATES.SCALPING
      },
      {
        name: 'DCA_Accumulator',
        type: 'DCA',
        active: true,
        capital_allocation: 10,
        risk_tolerance: 'LOW',
        timeframe: '1d',
        parameters: this.STRATEGY_TEMPLATES.DCA
      }
    ];

    defaultStrategies.forEach(strategy => {
      this.strategies.set(strategy.name, strategy);
      this.initializeStrategyPerformance(strategy.name);
    });
  }

  /**
   * Initialize performance tracking for a strategy
   */
  private initializeStrategyPerformance(strategyName: string): void {
    this.performance.set(strategyName, {
      strategy_name: strategyName,
      total_trades: 0,
      winning_trades: 0,
      losing_trades: 0,
      win_rate: 0,
      profit_factor: 1,
      total_return: 0,
      max_drawdown: 0,
      sharpe_ratio: 0,
      avg_trade_duration: 0,
      last_30d_return: 0,
      confidence_score: 50,
      risk_adjusted_return: 0
    });
  }

  /**
   * Start the ensemble engine with continuous monitoring and rebalancing
   */
  private startEnsembleEngine(): void {
    setInterval(() => {
      this.monitorStrategies();
      this.checkRebalanceTriggers();
    }, 60000); // Every minute

    setInterval(() => {
      this.performPortfolioRebalancing();
    }, 3600000); // Every hour
  }

  /**
   * Generate ensemble trading decision based on all active strategies
   */
  generateEnsembleDecision(marketConditions: MarketConditions): EnsembleDecision {
    const activeStrategies = Array.from(this.strategies.values()).filter(s => s.active);
    const strategyVotes: { [action: string]: number } = { BUY: 0, SELL: 0, HOLD: 0 };
    const strategyConfidences: number[] = [];
    const reasoning: string[] = [];

    // Collect votes from each strategy
    activeStrategies.forEach(strategy => {
      const strategyDecision = this.getStrategyDecision(strategy, marketConditions);
      const performance = this.performance.get(strategy.name)!;
      const weight = this.calculateStrategyWeight(strategy, performance);

      strategyVotes[strategyDecision.action] += weight;
      strategyConfidences.push(strategyDecision.confidence * weight);
      reasoning.push(`${strategy.name}: ${strategyDecision.action} (${strategyDecision.confidence}% confidence, ${weight.toFixed(2)} weight)`);
    });

    // Determine ensemble decision
    const winningAction = Object.keys(strategyVotes).reduce((a, b) => 
      strategyVotes[a] > strategyVotes[b] ? a : b
    ) as 'BUY' | 'SELL' | 'HOLD';

    const ensembleConfidence = strategyConfidences.reduce((sum, conf) => sum + conf, 0) / strategyConfidences.length;

    // Calculate optimal capital allocation
    const capitalAllocation = this.calculateOptimalAllocation(marketConditions);

    // Assess overall risk
    const riskAssessment = this.assessPortfolioRisk(marketConditions);

    return {
      recommended_action: winningAction,
      confidence: ensembleConfidence,
      capital_allocation: capitalAllocation,
      active_strategies: activeStrategies.map(s => s.name),
      risk_assessment: riskAssessment,
      expected_return: this.calculateExpectedReturn(marketConditions),
      max_risk: this.calculateMaxRisk(),
      reasoning
    };
  }

  /**
   * Get individual strategy decision
   */
  private getStrategyDecision(strategy: StrategyConfig, conditions: MarketConditions): { action: string; confidence: number } {
    const performance = this.performance.get(strategy.name)!;
    
    // Strategy-specific logic based on type and market conditions
    switch (strategy.type) {
      case 'MOMENTUM':
        return this.getMomentumDecision(strategy, conditions, performance);
      case 'MEAN_REVERSION':
        return this.getMeanReversionDecision(strategy, conditions, performance);
      case 'BREAKOUT':
        return this.getBreakoutDecision(strategy, conditions, performance);
      case 'GRID':
        return this.getGridDecision(strategy, conditions, performance);
      case 'SCALPING':
        return this.getScalpingDecision(strategy, conditions, performance);
      case 'DCA':
        return this.getDCADecision(strategy, conditions, performance);
      default:
        return { action: 'HOLD', confidence: 50 };
    }
  }

  /**
   * Momentum strategy decision logic
   */
  private getMomentumDecision(strategy: StrategyConfig, conditions: MarketConditions, performance: StrategyPerformance): { action: string; confidence: number } {
    let confidence = 50;
    let action = 'HOLD';

    // Momentum strategies work best in trending markets
    if (conditions.trend === 'BULLISH' && conditions.volatility > 0.3) {
      action = 'BUY';
      confidence = 75 + (performance.win_rate * 0.3);
    } else if (conditions.trend === 'BEARISH' && conditions.volatility > 0.3) {
      action = 'SELL';
      confidence = 75 + (performance.win_rate * 0.3);
    } else if (conditions.trend === 'SIDEWAYS') {
      confidence = 30; // Low confidence in sideways markets
    }

    // Adjust based on volume
    if (conditions.volume_profile === 'HIGH') {
      confidence += 10;
    } else if (conditions.volume_profile === 'LOW') {
      confidence -= 15;
    }

    return { action, confidence: Math.max(0, Math.min(100, confidence)) };
  }

  /**
   * Mean reversion strategy decision logic
   */
  private getMeanReversionDecision(strategy: StrategyConfig, conditions: MarketConditions, performance: StrategyPerformance): { action: string; confidence: number } {
    let confidence = 50;
    let action = 'HOLD';

    // Mean reversion works best in sideways/ranging markets
    if (conditions.trend === 'SIDEWAYS' && conditions.volatility < 0.5) {
      if (conditions.sentiment === 'EXTREME_FEAR') {
        action = 'BUY';
        confidence = 80;
      } else if (conditions.sentiment === 'EXTREME_GREED') {
        action = 'SELL';
        confidence = 80;
      }
    } else if (conditions.volatility > 0.7) {
      // High volatility creates mean reversion opportunities
      action = 'BUY';
      confidence = 60 + (performance.win_rate * 0.2);
    }

    return { action, confidence: Math.max(0, Math.min(100, confidence)) };
  }

  /**
   * Breakout strategy decision logic
   */
  private getBreakoutDecision(strategy: StrategyConfig, conditions: MarketConditions, performance: StrategyPerformance): { action: string; confidence: number } {
    let confidence = 50;
    let action = 'HOLD';

    // Breakouts work best with strong trends and high volume
    if (conditions.volume_profile === 'HIGH' && conditions.volatility > 0.4) {
      if (conditions.trend === 'BULLISH') {
        action = 'BUY';
        confidence = 70 + (performance.win_rate * 0.25);
      } else if (conditions.trend === 'BEARISH') {
        action = 'SELL';
        confidence = 70 + (performance.win_rate * 0.25);
      }
    }

    // Institutional flow confirmation
    if (conditions.institutional_flow === 'INFLOW' && action === 'BUY') {
      confidence += 15;
    } else if (conditions.institutional_flow === 'OUTFLOW' && action === 'SELL') {
      confidence += 15;
    }

    return { action, confidence: Math.max(0, Math.min(100, confidence)) };
  }

  /**
   * Grid strategy decision logic
   */
  private getGridDecision(strategy: StrategyConfig, conditions: MarketConditions, performance: StrategyPerformance): { action: string; confidence: number } {
    let confidence = 60; // Grid strategies are generally stable
    let action = 'BUY'; // Grid strategies continuously buy and sell

    // Grid works best in ranging markets
    if (conditions.trend === 'SIDEWAYS') {
      confidence = 80;
    } else if (conditions.volatility > 0.6) {
      confidence = 70; // Still good with volatility
    } else if (conditions.trend === 'BULLISH' || conditions.trend === 'BEARISH') {
      confidence = 45; // Lower confidence in strong trends
    }

    return { action, confidence };
  }

  /**
   * Scalping strategy decision logic
   */
  private getScalpingDecision(strategy: StrategyConfig, conditions: MarketConditions, performance: StrategyPerformance): { action: string; confidence: number } {
    let confidence = 50;
    let action = 'HOLD';

    // Scalping needs high volume and volatility
    if (conditions.volume_profile === 'HIGH' && conditions.volatility > 0.5) {
      action = 'BUY';
      confidence = 85;
    } else if (conditions.volume_profile === 'LOW') {
      confidence = 20; // Very low confidence without volume
    }

    // Market phase matters for scalping
    if (conditions.market_phase === 'MARKUP' || conditions.market_phase === 'MARKDOWN') {
      confidence += 10;
    }

    return { action, confidence: Math.max(0, Math.min(100, confidence)) };
  }

  /**
   * DCA strategy decision logic
   */
  private getDCADecision(strategy: StrategyConfig, conditions: MarketConditions, performance: StrategyPerformance): { action: string; confidence: number } {
    let confidence = 70; // DCA is generally stable long-term
    let action = 'BUY'; // DCA always buys

    // DCA works well in all conditions but especially downtrends
    if (conditions.trend === 'BEARISH') {
      confidence = 85; // Best time to accumulate
    } else if (conditions.sentiment === 'EXTREME_FEAR') {
      confidence = 90; // Perfect DCA opportunity
    } else if (conditions.sentiment === 'EXTREME_GREED') {
      confidence = 40; // Reduce DCA during euphoria
    }

    return { action, confidence };
  }

  /**
   * Calculate strategy weight based on performance and risk
   */
  private calculateStrategyWeight(strategy: StrategyConfig, performance: StrategyPerformance): number {
    let weight = strategy.capital_allocation / 100;

    // Adjust weight based on recent performance
    weight *= (1 + performance.last_30d_return);
    
    // Risk adjustment
    weight *= (1 - (performance.max_drawdown * 0.5));
    
    // Confidence adjustment
    weight *= (performance.confidence_score / 100);

    return Math.max(0.1, Math.min(2.0, weight)); // Weight between 0.1 and 2.0
  }

  /**
   * Calculate optimal capital allocation across strategies
   */
  private calculateOptimalAllocation(conditions: MarketConditions): { [strategy: string]: number } {
    const allocation: { [strategy: string]: number } = {};
    let totalAllocation = 0;

    // Base allocation on market conditions and strategy suitability
    this.strategies.forEach((strategy, name) => {
      if (!strategy.active) {
        allocation[name] = 0;
        return;
      }

      let suitability = this.calculateStrategySuitability(strategy, conditions);
      const performance = this.performance.get(name)!;
      
      // Adjust for performance
      suitability *= (1 + performance.risk_adjusted_return);
      
      allocation[name] = suitability;
      totalAllocation += suitability;
    });

    // Normalize to 100%
    Object.keys(allocation).forEach(name => {
      allocation[name] = (allocation[name] / totalAllocation) * 100;
    });

    return allocation;
  }

  /**
   * Calculate strategy suitability for current market conditions
   */
  private calculateStrategySuitability(strategy: StrategyConfig, conditions: MarketConditions): number {
    let suitability = 0.5; // Base suitability

    switch (strategy.type) {
      case 'MOMENTUM':
        if (conditions.trend !== 'SIDEWAYS') suitability += 0.3;
        if (conditions.volume_profile === 'HIGH') suitability += 0.2;
        break;
      case 'MEAN_REVERSION':
        if (conditions.trend === 'SIDEWAYS') suitability += 0.4;
        if (conditions.volatility > 0.6) suitability += 0.2;
        break;
      case 'BREAKOUT':
        if (conditions.volume_profile === 'HIGH') suitability += 0.3;
        if (conditions.volatility > 0.4) suitability += 0.2;
        break;
      case 'GRID':
        if (conditions.trend === 'SIDEWAYS') suitability += 0.3;
        suitability += 0.1; // Always somewhat suitable
        break;
      case 'SCALPING':
        if (conditions.volume_profile === 'HIGH') suitability += 0.4;
        if (conditions.volatility > 0.5) suitability += 0.3;
        break;
      case 'DCA':
        if (conditions.trend === 'BEARISH') suitability += 0.3;
        if (conditions.sentiment === 'EXTREME_FEAR') suitability += 0.2;
        suitability += 0.1; // Always somewhat suitable
        break;
    }

    return Math.max(0.1, Math.min(1.0, suitability));
  }

  /**
   * Assess overall portfolio risk
   */
  private assessPortfolioRisk(conditions: MarketConditions): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
    let riskScore = 0;

    // Market condition risk factors
    if (conditions.volatility > 0.7) riskScore += 30;
    else if (conditions.volatility > 0.5) riskScore += 20;
    else if (conditions.volatility > 0.3) riskScore += 10;

    if (conditions.sentiment === 'EXTREME_GREED' || conditions.sentiment === 'EXTREME_FEAR') {
      riskScore += 25;
    }

    if (conditions.volume_profile === 'LOW') riskScore += 15;

    // Strategy risk factors
    const activeStrategies = Array.from(this.strategies.values()).filter(s => s.active);
    const highRiskStrategies = activeStrategies.filter(s => s.risk_tolerance === 'HIGH' || s.risk_tolerance === 'EXTREME');
    riskScore += (highRiskStrategies.length / activeStrategies.length) * 20;

    if (riskScore >= 70) return 'EXTREME';
    if (riskScore >= 50) return 'HIGH';
    if (riskScore >= 30) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Calculate expected portfolio return
   */
  private calculateExpectedReturn(conditions: MarketConditions): number {
    let expectedReturn = 0;

    this.strategies.forEach((strategy, name) => {
      if (!strategy.active) return;

      const performance = this.performance.get(name)!;
      const allocation = strategy.capital_allocation / 100;
      const suitability = this.calculateStrategySuitability(strategy, conditions);
      
      const strategyExpectedReturn = performance.last_30d_return * suitability;
      expectedReturn += strategyExpectedReturn * allocation;
    });

    return expectedReturn;
  }

  /**
   * Calculate maximum risk exposure
   */
  private calculateMaxRisk(): number {
    let maxRisk = 0;

    this.strategies.forEach((strategy, name) => {
      if (!strategy.active) return;

      const performance = this.performance.get(name)!;
      const allocation = strategy.capital_allocation / 100;
      
      maxRisk += performance.max_drawdown * allocation;
    });

    return Math.min(maxRisk, 0.25); // Cap at 25% max risk
  }

  /**
   * Monitor strategy performance and update metrics
   */
  private monitorStrategies(): void {
    this.strategies.forEach((strategy, name) => {
      // Simulate strategy monitoring (in real implementation, this would track actual trades)
      const performance = this.performance.get(name)!;
      
      // Update confidence based on recent performance
      const recentTrades = this.tradeHistory.filter(trade => 
        trade.strategy === name && 
        Date.now() - trade.timestamp < 86400000 // Last 24 hours
      );

      if (recentTrades.length > 0) {
        const recentWinRate = recentTrades.filter(t => t.profit > 0).length / recentTrades.length;
        performance.confidence_score = (performance.confidence_score * 0.7) + (recentWinRate * 100 * 0.3);
      }

      this.performance.set(name, performance);
    });
  }

  /**
   * Check if portfolio rebalancing is needed
   */
  private checkRebalanceTriggers(): void {
    const timeSinceRebalance = Date.now() - this.lastRebalance.getTime();
    const hoursSinceRebalance = timeSinceRebalance / (1000 * 60 * 60);

    // Force rebalance every 24 hours
    if (hoursSinceRebalance >= 24) {
      this.performPortfolioRebalancing();
      return;
    }

    // Check performance deviation triggers
    let needsRebalance = false;
    const performances = Array.from(this.performance.values());
    const avgPerformance = performances.reduce((sum, p) => sum + p.last_30d_return, 0) / performances.length;

    performances.forEach(perf => {
      const deviation = Math.abs(perf.last_30d_return - avgPerformance);
      if (deviation > this.rebalanceThreshold) {
        needsRebalance = true;
      }
    });

    if (needsRebalance) {
      this.performPortfolioRebalancing();
    }
  }

  /**
   * Perform portfolio rebalancing
   */
  private performPortfolioRebalancing(): void {
    console.log('🔄 Performing portfolio rebalancing...');

    // Calculate new optimal allocations based on performance
    const performances = Array.from(this.performance.values());
    const totalReturn = performances.reduce((sum, p) => sum + p.total_return, 0);

    this.strategies.forEach((strategy, name) => {
      const performance = this.performance.get(name)!;
      
      // Increase allocation for high performers, decrease for poor performers
      if (performance.last_30d_return > 0 && performance.win_rate > 0.6) {
        strategy.capital_allocation = Math.min(strategy.capital_allocation * 1.1, 40); // Max 40% per strategy
      } else if (performance.last_30d_return < -0.1 || performance.win_rate < 0.4) {
        strategy.capital_allocation = Math.max(strategy.capital_allocation * 0.9, 5); // Min 5% per strategy
      }

      this.strategies.set(name, strategy);
    });

    // Normalize allocations to 100%
    const totalAllocation = Array.from(this.strategies.values()).reduce((sum, s) => sum + s.capital_allocation, 0);
    this.strategies.forEach((strategy, name) => {
      strategy.capital_allocation = (strategy.capital_allocation / totalAllocation) * 100;
      this.strategies.set(name, strategy);
    });

    this.lastRebalance = new Date();
    console.log('✅ Portfolio rebalancing completed');
  }

  /**
   * Add a new strategy to the ensemble
   */
  addStrategy(config: StrategyConfig): void {
    this.strategies.set(config.name, config);
    this.initializeStrategyPerformance(config.name);
  }

  /**
   * Remove a strategy from the ensemble
   */
  removeStrategy(strategyName: string): void {
    this.strategies.delete(strategyName);
    this.performance.delete(strategyName);
  }

  /**
   * Update strategy configuration
   */
  updateStrategy(strategyName: string, updates: Partial<StrategyConfig>): void {
    const strategy = this.strategies.get(strategyName);
    if (strategy) {
      Object.assign(strategy, updates);
      this.strategies.set(strategyName, strategy);
    }
  }

  /**
   * Get ensemble statistics
   */
  getEnsembleStats(): EnsembleStats {
    const strategies = Array.from(this.strategies.values());
    const activeStrategies = strategies.filter(s => s.active);
    const performances = Array.from(this.performance.values());

    const allocatedCapital = activeStrategies.reduce((sum, s) => sum + (this.totalCapital * s.capital_allocation / 100), 0);
    const portfolioReturn = performances.reduce((sum, p) => sum + p.total_return, 0) / performances.length;
    
    const bestStrategy = performances.reduce((best, current) => 
      current.risk_adjusted_return > best.risk_adjusted_return ? current : best
    );
    
    const worstStrategy = performances.reduce((worst, current) => 
      current.risk_adjusted_return < worst.risk_adjusted_return ? current : worst
    );

    return {
      total_strategies: strategies.length,
      active_strategies: activeStrategies.length,
      total_capital: this.totalCapital,
      allocated_capital: allocatedCapital,
      available_capital: this.totalCapital - allocatedCapital,
      portfolio_return: portfolioReturn,
      portfolio_sharpe: this.calculatePortfolioSharpe(),
      portfolio_max_drawdown: this.calculatePortfolioMaxDrawdown(),
      best_performing_strategy: bestStrategy.strategy_name,
      worst_performing_strategy: worstStrategy.strategy_name,
      rebalance_frequency: 24, // Hours
      last_rebalance: this.lastRebalance
    };
  }

  /**
   * Calculate portfolio Sharpe ratio
   */
  private calculatePortfolioSharpe(): number {
    const performances = Array.from(this.performance.values());
    const returns = performances.map(p => p.total_return);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const returnStd = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
    
    return returnStd > 0 ? avgReturn / returnStd : 0;
  }

  /**
   * Calculate portfolio maximum drawdown
   */
  private calculatePortfolioMaxDrawdown(): number {
    const performances = Array.from(this.performance.values());
    const strategies = Array.from(this.strategies.values());
    
    let portfolioDrawdown = 0;
    performances.forEach((perf, index) => {
      const strategy = strategies[index];
      if (strategy && strategy.active) {
        const weight = strategy.capital_allocation / 100;
        portfolioDrawdown += perf.max_drawdown * weight;
      }
    });

    return portfolioDrawdown;
  }

  /**
   * Get strategy performance details
   */
  getStrategyPerformance(strategyName?: string): StrategyPerformance | StrategyPerformance[] | null {
    if (strategyName) {
      return this.performance.get(strategyName) || null;
    }
    return Array.from(this.performance.values());
  }

  /**
   * Get all strategy configurations
   */
  getStrategies(): StrategyConfig[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Record trade execution result
   */
  recordTradeResult(strategyName: string, tradeResult: any): void {
    const trade = {
      ...tradeResult,
      strategy: strategyName,
      timestamp: Date.now()
    };

    this.tradeHistory.push(trade);
    
    // Update strategy performance
    const performance = this.performance.get(strategyName);
    if (performance) {
      performance.total_trades++;
      if (tradeResult.profit > 0) {
        performance.winning_trades++;
      } else {
        performance.losing_trades++;
      }
      performance.win_rate = performance.winning_trades / performance.total_trades;
      performance.total_return += tradeResult.profit;
      
      this.performance.set(strategyName, performance);
    }

    // Keep only last 1000 trades
    if (this.tradeHistory.length > 1000) {
      this.tradeHistory = this.tradeHistory.slice(-1000);
    }
  }
}