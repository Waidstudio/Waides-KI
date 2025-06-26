/**
 * WAIDES KI PERFORMANCE TRACKER
 * Strategy performance measurement and analytics for continuous improvement
 */

export interface TradeRecord {
  trade_id: string;
  timestamp: number;
  pair: string;
  position_type: 'LONG' | 'SHORT';
  entry_price: number;
  exit_price: number;
  amount: number;
  win: boolean;
  profit_loss_pct: number;
  profit_loss_usd: number;
  duration_minutes: number;
  strategy_name: string;
  stop_loss_triggered: boolean;
  max_profit_pct: number;
  max_drawdown_pct: number;
  sl_adjustments: number;
  market_conditions: {
    volatility: number;
    trend: string;
    volume: number;
    rsi: number;
  };
}

export interface PerformanceMetrics {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  avg_profit_pct: number;
  avg_loss_pct: number;
  profit_factor: number;
  total_return_pct: number;
  total_return_usd: number;
  max_consecutive_wins: number;
  max_consecutive_losses: number;
  avg_trade_duration_minutes: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  recovery_factor: number;
}

export interface StrategyPerformance {
  strategy_name: string;
  metrics: PerformanceMetrics;
  recent_performance: TradeRecord[];
  performance_trend: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'UNKNOWN';
  confidence_score: number;
  recommendation: 'INCREASE_ALLOCATION' | 'DECREASE_ALLOCATION' | 'MAINTAIN' | 'PAUSE';
}

export class WaidesKIPerformanceTracker {
  private tradeRecords: Map<string, TradeRecord[]> = new Map();
  private maxRecordsPerStrategy: number = 1000;

  constructor() {
    // Initialize with empty records for different strategies
    this.initializeStrategies();
  }

  /**
   * Initialize default strategy tracking
   */
  private initializeStrategies(): void {
    const defaultStrategies = [
      'DIVINE_QUANTUM_FLUX',
      'NEURAL_QUANTUM_SINGULARITY',
      'TRINITY_BRAIN_CONSENSUS',
      'STOP_LOSS_MANAGER',
      'AUTO_TUNED_STRATEGY'
    ];

    defaultStrategies.forEach(strategy => {
      this.tradeRecords.set(strategy, []);
    });
  }

  /**
   * Record a completed trade
   */
  recordTrade(trade: TradeRecord): void {
    const strategyRecords = this.tradeRecords.get(trade.strategy_name) || [];
    
    // Add new trade record
    strategyRecords.push({
      ...trade,
      trade_id: trade.trade_id || this.generateTradeId(),
      timestamp: trade.timestamp || Date.now()
    });

    // Maintain max records limit
    if (strategyRecords.length > this.maxRecordsPerStrategy) {
      strategyRecords.shift(); // Remove oldest record
    }

    this.tradeRecords.set(trade.strategy_name, strategyRecords);
  }

  /**
   * Get performance metrics for a strategy
   */
  getStrategyMetrics(strategyName: string): PerformanceMetrics {
    const records = this.tradeRecords.get(strategyName) || [];
    
    if (records.length === 0) {
      return this.getEmptyMetrics();
    }

    const winningTrades = records.filter(r => r.win);
    const losingTrades = records.filter(r => !r.win);
    
    const totalProfitPct = records.reduce((sum, r) => sum + r.profit_loss_pct, 0);
    const totalProfitUsd = records.reduce((sum, r) => sum + r.profit_loss_usd, 0);
    
    const avgProfitPct = winningTrades.length > 0 
      ? winningTrades.reduce((sum, r) => sum + r.profit_loss_pct, 0) / winningTrades.length 
      : 0;
    
    const avgLossPct = losingTrades.length > 0 
      ? Math.abs(losingTrades.reduce((sum, r) => sum + r.profit_loss_pct, 0) / losingTrades.length)
      : 0;

    const profitFactor = avgLossPct > 0 ? avgProfitPct / avgLossPct : 0;
    
    // Calculate consecutive wins/losses
    const { maxWins, maxLosses } = this.calculateConsecutiveStreaks(records);
    
    // Calculate average trade duration
    const avgDuration = records.reduce((sum, r) => sum + r.duration_minutes, 0) / records.length;
    
    // Calculate Sharpe ratio (simplified)
    const returns = records.map(r => r.profit_loss_pct);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;
    
    // Calculate max drawdown
    const maxDrawdown = this.calculateMaxDrawdown(records);
    
    // Calculate recovery factor
    const recoveryFactor = maxDrawdown > 0 ? totalProfitPct / maxDrawdown : 0;

    return {
      total_trades: records.length,
      winning_trades: winningTrades.length,
      losing_trades: losingTrades.length,
      win_rate: records.length > 0 ? winningTrades.length / records.length : 0,
      avg_profit_pct: avgProfitPct,
      avg_loss_pct: avgLossPct,
      profit_factor: profitFactor,
      total_return_pct: totalProfitPct,
      total_return_usd: totalProfitUsd,
      max_consecutive_wins: maxWins,
      max_consecutive_losses: maxLosses,
      avg_trade_duration_minutes: avgDuration,
      sharpe_ratio: sharpeRatio,
      max_drawdown_pct: maxDrawdown,
      recovery_factor: recoveryFactor
    };
  }

  /**
   * Get comprehensive strategy performance analysis
   */
  getStrategyPerformance(strategyName: string): StrategyPerformance {
    const metrics = this.getStrategyMetrics(strategyName);
    const records = this.tradeRecords.get(strategyName) || [];
    const recentRecords = records.slice(-20); // Last 20 trades
    
    const trend = this.calculatePerformanceTrend(records);
    const confidence = this.calculateConfidenceScore(metrics, records);
    const recommendation = this.generateRecommendation(metrics, trend, confidence);

    return {
      strategy_name: strategyName,
      metrics,
      recent_performance: recentRecords,
      performance_trend: trend,
      confidence_score: confidence,
      recommendation
    };
  }

  /**
   * Get all strategy performances
   */
  getAllStrategyPerformances(): StrategyPerformance[] {
    return Array.from(this.tradeRecords.keys()).map(strategy => 
      this.getStrategyPerformance(strategy)
    );
  }

  /**
   * Get top performing strategies
   */
  getTopStrategies(limit: number = 5): StrategyPerformance[] {
    const performances = this.getAllStrategyPerformances()
      .filter(p => p.metrics.total_trades >= 10) // Minimum trades for ranking
      .sort((a, b) => {
        // Sort by combination of win rate, profit factor, and total return
        const scoreA = (a.metrics.win_rate * 0.4) + (a.metrics.profit_factor * 0.3) + (a.metrics.total_return_pct * 0.3);
        const scoreB = (b.metrics.win_rate * 0.4) + (b.metrics.profit_factor * 0.3) + (b.metrics.total_return_pct * 0.3);
        return scoreB - scoreA;
      });

    return performances.slice(0, limit);
  }

  /**
   * Calculate performance trend
   */
  private calculatePerformanceTrend(records: TradeRecord[]): 'IMPROVING' | 'DECLINING' | 'STABLE' | 'UNKNOWN' {
    if (records.length < 20) return 'UNKNOWN';
    
    const recentRecords = records.slice(-10);
    const olderRecords = records.slice(-20, -10);
    
    const recentWinRate = recentRecords.filter(r => r.win).length / recentRecords.length;
    const olderWinRate = olderRecords.filter(r => r.win).length / olderRecords.length;
    
    const recentAvgProfit = recentRecords.reduce((sum, r) => sum + r.profit_loss_pct, 0) / recentRecords.length;
    const olderAvgProfit = olderRecords.reduce((sum, r) => sum + r.profit_loss_pct, 0) / olderRecords.length;
    
    const winRateImprovement = recentWinRate - olderWinRate;
    const profitImprovement = recentAvgProfit - olderAvgProfit;
    
    const overallImprovement = (winRateImprovement * 0.6) + (profitImprovement * 0.4);
    
    if (overallImprovement > 0.05) return 'IMPROVING';
    if (overallImprovement < -0.05) return 'DECLINING';
    return 'STABLE';
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidenceScore(metrics: PerformanceMetrics, records: TradeRecord[]): number {
    let confidence = 0;
    
    // Trade volume confidence (more trades = higher confidence)
    const volumeScore = Math.min(metrics.total_trades / 100, 1) * 25;
    
    // Win rate confidence
    const winRateScore = metrics.win_rate * 25;
    
    // Profit factor confidence
    const profitScore = Math.min(metrics.profit_factor / 2, 1) * 25;
    
    // Consistency confidence (lower drawdown = higher confidence)
    const consistencyScore = Math.max(0, (10 - metrics.max_drawdown_pct) / 10) * 25;
    
    confidence = volumeScore + winRateScore + profitScore + consistencyScore;
    
    return Math.min(Math.max(confidence, 0), 100);
  }

  /**
   * Generate recommendation
   */
  private generateRecommendation(
    metrics: PerformanceMetrics, 
    trend: string, 
    confidence: number
  ): 'INCREASE_ALLOCATION' | 'DECREASE_ALLOCATION' | 'MAINTAIN' | 'PAUSE' {
    
    // Pause if confidence is very low or performance is poor
    if (confidence < 30 || metrics.win_rate < 0.3 || metrics.profit_factor < 0.5) {
      return 'PAUSE';
    }
    
    // Increase allocation for strong performers
    if (confidence > 70 && metrics.win_rate > 0.6 && metrics.profit_factor > 1.5 && trend === 'IMPROVING') {
      return 'INCREASE_ALLOCATION';
    }
    
    // Decrease allocation for declining performers
    if (confidence < 50 || trend === 'DECLINING' || metrics.win_rate < 0.45) {
      return 'DECREASE_ALLOCATION';
    }
    
    return 'MAINTAIN';
  }

  /**
   * Calculate consecutive streaks
   */
  private calculateConsecutiveStreaks(records: TradeRecord[]): { maxWins: number; maxLosses: number } {
    let maxWins = 0;
    let maxLosses = 0;
    let currentWins = 0;
    let currentLosses = 0;
    
    for (const record of records) {
      if (record.win) {
        currentWins++;
        currentLosses = 0;
        maxWins = Math.max(maxWins, currentWins);
      } else {
        currentLosses++;
        currentWins = 0;
        maxLosses = Math.max(maxLosses, currentLosses);
      }
    }
    
    return { maxWins, maxLosses };
  }

  /**
   * Calculate maximum drawdown
   */
  private calculateMaxDrawdown(records: TradeRecord[]): number {
    let peak = 0;
    let maxDrawdown = 0;
    let cumulativeReturn = 0;
    
    for (const record of records) {
      cumulativeReturn += record.profit_loss_pct;
      peak = Math.max(peak, cumulativeReturn);
      const drawdown = peak - cumulativeReturn;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    
    return maxDrawdown;
  }

  /**
   * Generate unique trade ID
   */
  private generateTradeId(): string {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get empty metrics template
   */
  private getEmptyMetrics(): PerformanceMetrics {
    return {
      total_trades: 0,
      winning_trades: 0,
      losing_trades: 0,
      win_rate: 0,
      avg_profit_pct: 0,
      avg_loss_pct: 0,
      profit_factor: 0,
      total_return_pct: 0,
      total_return_usd: 0,
      max_consecutive_wins: 0,
      max_consecutive_losses: 0,
      avg_trade_duration_minutes: 0,
      sharpe_ratio: 0,
      max_drawdown_pct: 0,
      recovery_factor: 0
    };
  }

  /**
   * Export performance data for analysis
   */
  exportData(strategyName?: string): { 
    strategies: string[]; 
    trade_records: Record<string, TradeRecord[]>; 
    performance_summary: StrategyPerformance[] 
  } {
    const strategies = strategyName 
      ? [strategyName] 
      : Array.from(this.tradeRecords.keys());
    
    const tradeRecords: Record<string, TradeRecord[]> = {};
    strategies.forEach(strategy => {
      tradeRecords[strategy] = this.tradeRecords.get(strategy) || [];
    });
    
    const performanceSummary = strategies.map(strategy => 
      this.getStrategyPerformance(strategy)
    );
    
    return {
      strategies,
      trade_records: tradeRecords,
      performance_summary: performanceSummary
    };
  }

  /**
   * Clear all performance data
   */
  clearData(strategyName?: string): void {
    if (strategyName) {
      this.tradeRecords.set(strategyName, []);
    } else {
      this.tradeRecords.clear();
      this.initializeStrategies();
    }
  }

  /**
   * Get quick stats for dashboard
   */
  getQuickStats(): {
    total_strategies: number;
    total_trades: number;
    overall_win_rate: number;
    best_strategy: string;
    worst_strategy: string;
    total_return_pct: number;
  } {
    const performances = this.getAllStrategyPerformances();
    const totalTrades = performances.reduce((sum, p) => sum + p.metrics.total_trades, 0);
    const totalWins = performances.reduce((sum, p) => sum + p.metrics.winning_trades, 0);
    const totalReturn = performances.reduce((sum, p) => sum + p.metrics.total_return_pct, 0);
    
    const overallWinRate = totalTrades > 0 ? totalWins / totalTrades : 0;
    
    const sortedByPerformance = performances
      .filter(p => p.metrics.total_trades > 0)
      .sort((a, b) => b.metrics.profit_factor - a.metrics.profit_factor);
    
    return {
      total_strategies: performances.length,
      total_trades: totalTrades,
      overall_win_rate: overallWinRate,
      best_strategy: sortedByPerformance[0]?.strategy_name || 'None',
      worst_strategy: sortedByPerformance[sortedByPerformance.length - 1]?.strategy_name || 'None',
      total_return_pct: totalReturn
    };
  }
}

// Global instance
export const waidesKIPerformanceTracker = new WaidesKIPerformanceTracker();