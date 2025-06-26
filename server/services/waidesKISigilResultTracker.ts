/**
 * STEP 42: Waides KI Sigil Result Tracker
 * Tracks how accurate each sigil is over time and feeds results back to memory vault
 */

import { WaidesKIMemorySigilVault } from './waidesKIMemorySigilVault';
import { WaidesKISigilPredictor } from './waidesKISigilPredictor';

interface TradeResult {
  trade_id: string;
  kons_symbol: string;
  prediction_used?: any;
  execution_data: {
    entry_price: number;
    exit_price?: number;
    quantity: number;
    trade_type: 'BUY' | 'SELL';
    executed_at: string;
    closed_at?: string;
  };
  outcome: {
    profit: number;
    profit_percentage: number;
    result: 'profit' | 'loss' | 'neutral';
    duration_minutes: number;
  };
  market_context: {
    volatility: string;
    volume: string;
    trend: 'UP' | 'DOWN' | 'SIDEWAYS';
    time_of_day: string;
    day_of_week: string;
  };
  spiritual_context: {
    confidence_level: number;
    energy_level: number;
    moon_phase: string;
    prediction_accuracy?: number;
  };
}

interface AccuracyMetrics {
  symbol: string;
  total_predictions: number;
  correct_predictions: number;
  accuracy_percentage: number;
  profit_accuracy: number;
  loss_accuracy: number;
  avg_profit_when_correct: number;
  avg_loss_when_incorrect: number;
  recent_accuracy: number;
  confidence_calibration: number;
}

interface TrackerStats {
  total_trades_tracked: number;
  total_predictions_validated: number;
  overall_accuracy: number;
  profitable_trades: number;
  losing_trades: number;
  neutral_trades: number;
  total_profit: number;
  avg_trade_duration: number;
  last_trade_recorded: string;
  accuracy_improvement_rate: number;
}

export class WaidesKISigilResultTracker {
  private memorySigilVault: WaidesKIMemorySigilVault;
  private sigilPredictor: WaidesKISigilPredictor;
  private tradeResults: Map<string, TradeResult> = new Map();
  private predictionAccuracy: Map<string, AccuracyMetrics> = new Map();
  
  private trackerStats: TrackerStats = {
    total_trades_tracked: 0,
    total_predictions_validated: 0,
    overall_accuracy: 0.0,
    profitable_trades: 0,
    losing_trades: 0,
    neutral_trades: 0,
    total_profit: 0,
    avg_trade_duration: 0,
    last_trade_recorded: new Date().toISOString(),
    accuracy_improvement_rate: 0.0
  };

  constructor(memorySigilVault: WaidesKIMemorySigilVault, sigilPredictor: WaidesKISigilPredictor) {
    this.memorySigilVault = memorySigilVault;
    this.sigilPredictor = sigilPredictor;
    console.log('📊 Sigil Result Tracker initialized - ready to track trading accuracy and outcomes');
  }

  /**
   * Record a completed trade result
   */
  recordTradeResult(trade: Partial<TradeResult>): string {
    const tradeId = trade.trade_id || this.generateTradeId();
    
    // Build complete trade result
    const completeTradeResult: TradeResult = {
      trade_id: tradeId,
      kons_symbol: trade.kons_symbol || 'UNKNOWN',
      prediction_used: trade.prediction_used,
      execution_data: {
        entry_price: trade.execution_data?.entry_price || 0,
        exit_price: trade.execution_data?.exit_price,
        quantity: trade.execution_data?.quantity || 0,
        trade_type: trade.execution_data?.trade_type || 'BUY',
        executed_at: trade.execution_data?.executed_at || new Date().toISOString(),
        closed_at: trade.execution_data?.closed_at
      },
      outcome: this.calculateOutcome(trade),
      market_context: this.buildMarketContext(trade.market_context),
      spiritual_context: this.buildSpiritualContext(trade.spiritual_context)
    };

    // Store trade result
    this.tradeResults.set(tradeId, completeTradeResult);

    // Log to memory vault
    this.memorySigilVault.logSymbolOutcome(
      completeTradeResult.kons_symbol,
      completeTradeResult.market_context.trend,
      completeTradeResult.outcome.result,
      completeTradeResult.outcome.profit,
      {
        confidence: completeTradeResult.spiritual_context.confidence_level,
        trade_id: tradeId,
        duration: completeTradeResult.outcome.duration_minutes
      }
    );

    // Update prediction accuracy if prediction was used
    if (completeTradeResult.prediction_used) {
      this.updatePredictionAccuracy(completeTradeResult);
    }

    // Update tracker statistics
    this.updateTrackerStats(completeTradeResult);

    console.log(`📈 Recorded trade ${tradeId}: ${completeTradeResult.kons_symbol} → ${completeTradeResult.outcome.result} (${completeTradeResult.outcome.profit > 0 ? '+' : ''}${completeTradeResult.outcome.profit.toFixed(2)})`);

    return tradeId;
  }

  /**
   * Record a simple symbol outcome (for backward compatibility)
   */
  recordSymbolOutcome(
    symbol: string,
    trend: 'UP' | 'DOWN' | 'SIDEWAYS',
    result: 'profit' | 'loss' | 'neutral',
    profit: number
  ): string {
    return this.recordTradeResult({
      kons_symbol: symbol,
      outcome: {
        profit,
        profit_percentage: 0,
        result,
        duration_minutes: 0
      },
      market_context: {
        trend,
        volatility: 'MEDIUM',
        volume: 'MEDIUM',
        time_of_day: 'UNKNOWN',
        day_of_week: 'UNKNOWN'
      }
    });
  }

  /**
   * Get accuracy metrics for a specific symbol
   */
  getSymbolAccuracy(symbol: string): AccuracyMetrics | null {
    return this.predictionAccuracy.get(symbol) || null;
  }

  /**
   * Get accuracy metrics for all symbols
   */
  getAllAccuracyMetrics(): AccuracyMetrics[] {
    return Array.from(this.predictionAccuracy.values())
      .sort((a, b) => b.accuracy_percentage - a.accuracy_percentage);
  }

  /**
   * Get trade results history
   */
  getTradeHistory(limit: number = 50): TradeResult[] {
    const trades = Array.from(this.tradeResults.values());
    return trades
      .sort((a, b) => new Date(b.execution_data.executed_at).getTime() - 
                     new Date(a.execution_data.executed_at).getTime())
      .slice(0, limit);
  }

  /**
   * Get profitable trades
   */
  getProfitableTrades(limit: number = 20): TradeResult[] {
    return this.getTradeHistory(1000)
      .filter(trade => trade.outcome.result === 'profit')
      .slice(0, limit);
  }

  /**
   * Get losing trades for analysis
   */
  getLosingTrades(limit: number = 20): TradeResult[] {
    return this.getTradeHistory(1000)
      .filter(trade => trade.outcome.result === 'loss')
      .slice(0, limit);
  }

  /**
   * Analyze prediction vs actual performance
   */
  analyzePredictionPerformance(): {
    overall_prediction_accuracy: number;
    by_symbol: AccuracyMetrics[];
    by_confidence_level: { confidence_range: string; accuracy: number; count: number }[];
    by_market_conditions: { condition: string; accuracy: number; count: number }[];
    improvement_suggestions: string[];
  } {
    const allMetrics = this.getAllAccuracyMetrics();
    const overallAccuracy = allMetrics.length > 0 ? 
      allMetrics.reduce((sum, m) => sum + m.accuracy_percentage, 0) / allMetrics.length : 0;

    // Analyze by confidence levels
    const confidenceLevels = this.analyzeByConfidenceLevel();
    
    // Analyze by market conditions
    const marketConditions = this.analyzeByMarketConditions();

    // Generate improvement suggestions
    const suggestions = this.generateImprovementSuggestions(allMetrics, confidenceLevels);

    return {
      overall_prediction_accuracy: Math.round(overallAccuracy),
      by_symbol: allMetrics,
      by_confidence_level: confidenceLevels,
      by_market_conditions: marketConditions,
      improvement_suggestions: suggestions
    };
  }

  /**
   * Get performance summary for dashboard
   */
  getPerformanceSummary(): {
    tracker_stats: TrackerStats;
    recent_performance: {
      last_7_days: { trades: number; profit: number; accuracy: number };
      last_24_hours: { trades: number; profit: number; accuracy: number };
    };
    top_performing_symbols: string[];
    worst_performing_symbols: string[];
    prediction_calibration: number;
  } {
    const recentPerformance = this.calculateRecentPerformance();
    const topSymbols = this.getTopPerformingSymbols(5);
    const worstSymbols = this.getWorstPerformingSymbols(3);
    const calibration = this.calculatePredictionCalibration();

    return {
      tracker_stats: { ...this.trackerStats },
      recent_performance: recentPerformance,
      top_performing_symbols: topSymbols,
      worst_performing_symbols: worstSymbols,
      prediction_calibration: calibration
    };
  }

  /**
   * Get tracker statistics
   */
  getTrackerStats(): TrackerStats & {
    accuracy_by_symbol: { symbol: string; accuracy: number }[];
    recent_accuracy_trend: number[];
  } {
    const accuracyBySymbol = this.getAllAccuracyMetrics().map(m => ({
      symbol: m.symbol,
      accuracy: m.accuracy_percentage
    }));

    const recentTrend = this.calculateAccuracyTrend();

    return {
      ...this.trackerStats,
      accuracy_by_symbol: accuracyBySymbol,
      recent_accuracy_trend: recentTrend
    };
  }

  /**
   * Reset tracker data (admin function)
   */
  resetTracker(): void {
    this.tradeResults.clear();
    this.predictionAccuracy.clear();
    this.trackerStats = {
      total_trades_tracked: 0,
      total_predictions_validated: 0,
      overall_accuracy: 0.0,
      profitable_trades: 0,
      losing_trades: 0,
      neutral_trades: 0,
      total_profit: 0,
      avg_trade_duration: 0,
      last_trade_recorded: new Date().toISOString(),
      accuracy_improvement_rate: 0.0
    };
    console.log('🔄 Sigil Result Tracker reset - all tracking data cleared');
  }

  /**
   * Export tracking data for analysis
   */
  exportTrackingData(): {
    trade_results: TradeResult[];
    accuracy_metrics: AccuracyMetrics[];
    tracker_stats: TrackerStats;
    export_timestamp: string;
  } {
    return {
      trade_results: Array.from(this.tradeResults.values()),
      accuracy_metrics: Array.from(this.predictionAccuracy.values()),
      tracker_stats: { ...this.trackerStats },
      export_timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate trade outcome
   */
  private calculateOutcome(trade: Partial<TradeResult>): TradeResult['outcome'] {
    const entryPrice = trade.execution_data?.entry_price || 0;
    const exitPrice = trade.execution_data?.exit_price || entryPrice;
    const quantity = trade.execution_data?.quantity || 0;
    
    const profit = (exitPrice - entryPrice) * quantity;
    const profitPercentage = entryPrice > 0 ? ((exitPrice - entryPrice) / entryPrice) * 100 : 0;
    
    let result: 'profit' | 'loss' | 'neutral' = 'neutral';
    if (profit > 0.01) result = 'profit';
    else if (profit < -0.01) result = 'loss';

    const executedAt = new Date(trade.execution_data?.executed_at || new Date());
    const closedAt = new Date(trade.execution_data?.closed_at || new Date());
    const durationMinutes = Math.max(0, (closedAt.getTime() - executedAt.getTime()) / (1000 * 60));

    return {
      profit: Math.round(profit * 100) / 100,
      profit_percentage: Math.round(profitPercentage * 100) / 100,
      result,
      duration_minutes: Math.round(durationMinutes)
    };
  }

  /**
   * Build market context with defaults
   */
  private buildMarketContext(context?: Partial<TradeResult['market_context']>): TradeResult['market_context'] {
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay = 'MORNING';
    if (hour >= 12 && hour < 18) timeOfDay = 'AFTERNOON';
    else if (hour >= 18 && hour < 24) timeOfDay = 'EVENING';
    else if (hour >= 0 && hour < 6) timeOfDay = 'NIGHT';

    return {
      volatility: context?.volatility || 'MEDIUM',
      volume: context?.volume || 'MEDIUM',
      trend: context?.trend || 'SIDEWAYS',
      time_of_day: context?.time_of_day || timeOfDay,
      day_of_week: context?.day_of_week || now.toLocaleDateString('en-US', { weekday: 'long' })
    };
  }

  /**
   * Build spiritual context with defaults
   */
  private buildSpiritualContext(context?: Partial<TradeResult['spiritual_context']>): TradeResult['spiritual_context'] {
    const moonPhases = ['NEW_MOON', 'WAXING_CRESCENT', 'FIRST_QUARTER', 'WAXING_GIBBOUS', 'FULL_MOON', 'WANING_GIBBOUS', 'LAST_QUARTER', 'WANING_CRESCENT'];
    
    return {
      confidence_level: context?.confidence_level || Math.floor(Math.random() * 40) + 60,
      energy_level: context?.energy_level || Math.floor(Math.random() * 40) + 60,
      moon_phase: context?.moon_phase || moonPhases[Math.floor(Math.random() * moonPhases.length)],
      prediction_accuracy: context?.prediction_accuracy
    };
  }

  /**
   * Update prediction accuracy for symbol
   */
  private updatePredictionAccuracy(tradeResult: TradeResult): void {
    const symbol = tradeResult.kons_symbol;
    
    if (!this.predictionAccuracy.has(symbol)) {
      this.predictionAccuracy.set(symbol, {
        symbol,
        total_predictions: 0,
        correct_predictions: 0,
        accuracy_percentage: 0,
        profit_accuracy: 0,
        loss_accuracy: 0,
        avg_profit_when_correct: 0,
        avg_loss_when_incorrect: 0,
        recent_accuracy: 0,
        confidence_calibration: 0
      });
    }

    const metrics = this.predictionAccuracy.get(symbol)!;
    const prediction = tradeResult.prediction_used;
    
    metrics.total_predictions++;

    // Check if prediction was correct
    const wasCorrect = this.wasPredictionCorrect(prediction, tradeResult);
    if (wasCorrect) {
      metrics.correct_predictions++;
    }

    // Update accuracy percentage
    metrics.accuracy_percentage = (metrics.correct_predictions / metrics.total_predictions) * 100;

    // Update profit/loss accuracy
    if (tradeResult.outcome.result === 'profit') {
      metrics.profit_accuracy = wasCorrect ? 
        ((metrics.profit_accuracy * (metrics.total_predictions - 1)) + 100) / metrics.total_predictions :
        (metrics.profit_accuracy * (metrics.total_predictions - 1)) / metrics.total_predictions;
    } else if (tradeResult.outcome.result === 'loss') {
      metrics.loss_accuracy = wasCorrect ? 
        ((metrics.loss_accuracy * (metrics.total_predictions - 1)) + 100) / metrics.total_predictions :
        (metrics.loss_accuracy * (metrics.total_predictions - 1)) / metrics.total_predictions;
    }

    // Calculate recent accuracy (last 10 trades)
    const recentTrades = this.getTradeHistory(10).filter(t => t.kons_symbol === symbol);
    if (recentTrades.length > 0) {
      const recentCorrect = recentTrades.filter(t => this.wasPredictionCorrect(t.prediction_used, t)).length;
      metrics.recent_accuracy = (recentCorrect / recentTrades.length) * 100;
    }

    this.predictionAccuracy.set(symbol, metrics);
  }

  /**
   * Check if prediction was correct
   */
  private wasPredictionCorrect(prediction: any, tradeResult: TradeResult): boolean {
    if (!prediction) return false;

    // Simple accuracy check - prediction recommendation vs outcome
    const recommendedTrade = prediction.recommendation === 'CONFIRMED_TRADE';
    const actualProfit = tradeResult.outcome.result === 'profit';

    return recommendedTrade === actualProfit;
  }

  /**
   * Update tracker statistics
   */
  private updateTrackerStats(tradeResult: TradeResult): void {
    this.trackerStats.total_trades_tracked++;
    this.trackerStats.last_trade_recorded = tradeResult.execution_data.executed_at;
    this.trackerStats.total_profit += tradeResult.outcome.profit;

    if (tradeResult.prediction_used) {
      this.trackerStats.total_predictions_validated++;
    }

    // Update outcome counters
    switch (tradeResult.outcome.result) {
      case 'profit':
        this.trackerStats.profitable_trades++;
        break;
      case 'loss':
        this.trackerStats.losing_trades++;
        break;
      case 'neutral':
        this.trackerStats.neutral_trades++;
        break;
    }

    // Update average trade duration
    const totalDuration = this.trackerStats.avg_trade_duration * (this.trackerStats.total_trades_tracked - 1) + 
                         tradeResult.outcome.duration_minutes;
    this.trackerStats.avg_trade_duration = totalDuration / this.trackerStats.total_trades_tracked;

    // Calculate overall accuracy
    if (this.trackerStats.total_predictions_validated > 0) {
      const allMetrics = this.getAllAccuracyMetrics();
      this.trackerStats.overall_accuracy = allMetrics.length > 0 ? 
        allMetrics.reduce((sum, m) => sum + m.accuracy_percentage, 0) / allMetrics.length : 0;
    }
  }

  /**
   * Generate trade ID
   */
  private generateTradeId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `trade_${timestamp}_${random}`;
  }

  /**
   * Analyze performance by confidence level
   */
  private analyzeByConfidenceLevel(): { confidence_range: string; accuracy: number; count: number }[] {
    const ranges = [
      { min: 90, max: 100, label: '90-100%' },
      { min: 80, max: 89, label: '80-89%' },
      { min: 70, max: 79, label: '70-79%' },
      { min: 60, max: 69, label: '60-69%' },
      { min: 0, max: 59, label: '0-59%' }
    ];

    return ranges.map(range => {
      const tradesInRange = Array.from(this.tradeResults.values()).filter(trade => 
        trade.spiritual_context.confidence_level >= range.min && 
        trade.spiritual_context.confidence_level <= range.max
      );

      const correctTrades = tradesInRange.filter(trade => 
        this.wasPredictionCorrect(trade.prediction_used, trade)
      );

      return {
        confidence_range: range.label,
        accuracy: tradesInRange.length > 0 ? (correctTrades.length / tradesInRange.length) * 100 : 0,
        count: tradesInRange.length
      };
    });
  }

  /**
   * Analyze performance by market conditions
   */
  private analyzeByMarketConditions(): { condition: string; accuracy: number; count: number }[] {
    const conditions = ['HIGH', 'MEDIUM', 'LOW'];
    const results: { condition: string; accuracy: number; count: number }[] = [];

    for (const volatility of conditions) {
      const tradesInCondition = Array.from(this.tradeResults.values()).filter(trade => 
        trade.market_context.volatility === volatility
      );

      const correctTrades = tradesInCondition.filter(trade => 
        this.wasPredictionCorrect(trade.prediction_used, trade)
      );

      results.push({
        condition: `${volatility} Volatility`,
        accuracy: tradesInCondition.length > 0 ? (correctTrades.length / tradesInCondition.length) * 100 : 0,
        count: tradesInCondition.length
      });
    }

    return results;
  }

  /**
   * Generate improvement suggestions
   */
  private generateImprovementSuggestions(
    metrics: AccuracyMetrics[], 
    confidenceLevels: any[]
  ): string[] {
    const suggestions: string[] = [];

    // Check overall accuracy
    const avgAccuracy = metrics.length > 0 ? 
      metrics.reduce((sum, m) => sum + m.accuracy_percentage, 0) / metrics.length : 0;

    if (avgAccuracy < 60) {
      suggestions.push('Overall prediction accuracy is below 60% - consider revising prediction thresholds');
    }

    // Check confidence calibration
    const highConfidenceRange = confidenceLevels.find(c => c.confidence_range === '90-100%');
    if (highConfidenceRange && highConfidenceRange.accuracy < 80) {
      suggestions.push('High confidence predictions are not sufficiently accurate - recalibrate confidence scoring');
    }

    // Check symbol performance
    const poorPerformers = metrics.filter(m => m.accuracy_percentage < 50).length;
    if (poorPerformers > metrics.length * 0.3) {
      suggestions.push('More than 30% of symbols have poor accuracy - consider filtering weak signals');
    }

    return suggestions;
  }

  /**
   * Calculate recent performance
   */
  private calculateRecentPerformance(): {
    last_7_days: { trades: number; profit: number; accuracy: number };
    last_24_hours: { trades: number; profit: number; accuracy: number };
  } {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const trades24h = Array.from(this.tradeResults.values()).filter(trade => 
      new Date(trade.execution_data.executed_at) > last24h
    );

    const trades7d = Array.from(this.tradeResults.values()).filter(trade => 
      new Date(trade.execution_data.executed_at) > last7days
    );

    const calc = (trades: TradeResult[]) => ({
      trades: trades.length,
      profit: trades.reduce((sum, t) => sum + t.outcome.profit, 0),
      accuracy: trades.length > 0 ? 
        (trades.filter(t => this.wasPredictionCorrect(t.prediction_used, t)).length / trades.length) * 100 : 0
    });

    return {
      last_24_hours: calc(trades24h),
      last_7_days: calc(trades7d)
    };
  }

  /**
   * Get top performing symbols
   */
  private getTopPerformingSymbols(limit: number): string[] {
    return this.getAllAccuracyMetrics()
      .sort((a, b) => b.accuracy_percentage - a.accuracy_percentage)
      .slice(0, limit)
      .map(m => m.symbol);
  }

  /**
   * Get worst performing symbols
   */
  private getWorstPerformingSymbols(limit: number): string[] {
    return this.getAllAccuracyMetrics()
      .sort((a, b) => a.accuracy_percentage - b.accuracy_percentage)
      .slice(0, limit)
      .map(m => m.symbol);
  }

  /**
   * Calculate prediction calibration
   */
  private calculatePredictionCalibration(): number {
    const trades = Array.from(this.tradeResults.values()).filter(t => t.prediction_used);
    if (trades.length === 0) return 0;

    let totalCalibration = 0;
    for (const trade of trades) {
      const predictedConfidence = trade.spiritual_context.confidence_level;
      const actualSuccess = this.wasPredictionCorrect(trade.prediction_used, trade) ? 100 : 0;
      const calibrationError = Math.abs(predictedConfidence - actualSuccess);
      totalCalibration += (100 - calibrationError);
    }

    return totalCalibration / trades.length;
  }

  /**
   * Calculate accuracy trend
   */
  private calculateAccuracyTrend(): number[] {
    const recentTrades = this.getTradeHistory(50).reverse(); // Oldest first
    const windowSize = 10;
    const trend: number[] = [];

    for (let i = windowSize; i <= recentTrades.length; i++) {
      const window = recentTrades.slice(i - windowSize, i);
      const correct = window.filter(t => this.wasPredictionCorrect(t.prediction_used, t)).length;
      const accuracy = (correct / window.length) * 100;
      trend.push(Math.round(accuracy));
    }

    return trend;
  }
}