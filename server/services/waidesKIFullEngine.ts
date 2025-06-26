/**
 * WAIDES KI FULL ENGINE
 * Complete smart risk management system with integrated stop-loss, performance tracking, and auto-tuning
 */

import { WaidesKIStopLossManager, TradeEntry } from './waidesKIStopLossManager';
import { WaidesKIPerformanceTracker, TradeRecord } from './waidesKIPerformanceTracker';
import { WaidesKIStrategyTuner, waidesKIStrategyTuner as tunerInstance } from './waidesKIStrategyTuner';
import { ethMonitor } from './ethMonitor';

export interface FullEngineConfig {
  strategy_name: string;
  enabled: boolean;
  trading_pair: string;
  position_size_usd: number;
  max_concurrent_trades: number;
  min_confidence_threshold: number;
  auto_tuning_enabled: boolean;
  emergency_stop_enabled: boolean;
}

export interface ActiveTrade {
  trade_id: string;
  entry_price: number;
  entry_time: number;
  pair: string;
  position_type: 'LONG' | 'SHORT';
  amount: number;
  current_price?: number;
  current_pnl_pct?: number;
  stop_loss_price?: number;
  strategy_name: string;
  confidence_score: number;
}

export interface EngineStatus {
  is_active: boolean;
  active_trades: ActiveTrade[];
  total_trades_today: number;
  daily_pnl_pct: number;
  daily_pnl_usd: number;
  current_strategy: string;
  last_tuning: number;
  next_evaluation: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  emergency_stop_active: boolean;
}

export interface TradingSignal {
  action: 'BUY' | 'SELL' | 'HOLD' | 'CLOSE';
  confidence: number;
  price: number;
  reasoning: string;
  strategy_source: string;
  risk_assessment: string;
}

export class WaidesKIFullEngine {
  private config: FullEngineConfig;
  private stopLossManager: WaidesKIStopLossManager;
  private performanceTracker: WaidesKIPerformanceTracker;
  private strategyTuner: WaidesKIStrategyTuner;
  private activeTrades: Map<string, ActiveTrade> = new Map();
  private isRunning: boolean = false;
  private lastEvaluation: number = 0;
  private dailyStats: {
    trades: number;
    pnl_pct: number;
    pnl_usd: number;
    start_of_day: number;
  };

  constructor(config: Partial<FullEngineConfig> = {}) {
    this.config = {
      strategy_name: 'WAIDES_FULL_ENGINE',
      enabled: true,
      trading_pair: 'ETH/USDT',
      position_size_usd: 100,
      max_concurrent_trades: 1,
      min_confidence_threshold: 0.7,
      auto_tuning_enabled: true,
      emergency_stop_enabled: true,
      ...config
    };

    this.stopLossManager = new WaidesKIStopLossManager();
    this.performanceTracker = new WaidesKIPerformanceTracker();
    this.strategyTuner = new WaidesKIStrategyTuner(this.performanceTracker, this.stopLossManager);
    
    // Initialize tuner reference
    if (!tunerInstance) {
      (global as any).waidesKIStrategyTuner = this.strategyTuner;
    }

    this.dailyStats = {
      trades: 0,
      pnl_pct: 0,
      pnl_usd: 0,
      start_of_day: this.getStartOfDay()
    };

    this.startMonitoring();
  }

  /**
   * Start the full engine monitoring and trading
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log(`🚀 Waides KI Full Engine started - Strategy: ${this.config.strategy_name}`);
    
    // Reset daily stats if new day
    if (Date.now() - this.dailyStats.start_of_day > 24 * 60 * 60 * 1000) {
      this.resetDailyStats();
    }
  }

  /**
   * Stop the full engine
   */
  stop(): void {
    this.isRunning = false;
    console.log('🛑 Waides KI Full Engine stopped');
  }

  /**
   * Execute a trade based on signal
   */
  async executeTrade(signal: TradingSignal): Promise<{
    success: boolean;
    trade?: ActiveTrade;
    error?: string;
    blocked_reason?: string;
  }> {
    if (!this.isRunning || !this.config.enabled) {
      return { success: false, error: 'Engine not running or disabled' };
    }

    // Check emergency stop
    if (this.config.emergency_stop_enabled && this.isEmergencyStopTriggered()) {
      return { success: false, blocked_reason: 'Emergency stop active' };
    }

    // Check confidence threshold
    if (signal.confidence < this.config.min_confidence_threshold) {
      return { success: false, blocked_reason: 'Signal confidence below threshold' };
    }

    // Check max concurrent trades
    if (this.activeTrades.size >= this.config.max_concurrent_trades) {
      return { success: false, blocked_reason: 'Maximum concurrent trades reached' };
    }

    // Get current tuning parameters
    const tuningParams = this.strategyTuner.getParameters(this.config.strategy_name);
    
    // Apply tuning adjustments to signal
    const adjustedConfidence = signal.confidence * tuningParams.confidence_threshold;
    const adjustedPositionSize = this.config.position_size_usd * tuningParams.position_size_multiplier;

    if (adjustedConfidence < this.config.min_confidence_threshold) {
      return { success: false, blocked_reason: 'Adjusted confidence below threshold' };
    }

    try {
      // Create trade entry
      const tradeEntry: TradeEntry = {
        entry_price: signal.price,
        timestamp: Date.now(),
        pair: this.config.trading_pair,
        position_type: signal.action === 'BUY' ? 'LONG' : 'SHORT',
        amount: adjustedPositionSize / signal.price
      };

      // Set up stop loss
      this.stopLossManager.setEntry(tradeEntry);

      // Create active trade
      const activeTrade: ActiveTrade = {
        trade_id: this.generateTradeId(),
        entry_price: signal.price,
        entry_time: Date.now(),
        pair: this.config.trading_pair,
        position_type: tradeEntry.position_type,
        amount: tradeEntry.amount,
        current_price: signal.price,
        current_pnl_pct: 0,
        stop_loss_price: this.stopLossManager.getState().trailing_sl || 0,
        strategy_name: this.config.strategy_name,
        confidence_score: adjustedConfidence
      };

      this.activeTrades.set(activeTrade.trade_id, activeTrade);
      this.dailyStats.trades++;

      console.log(`✅ Trade executed: ${activeTrade.trade_id} - ${signal.action} ${this.config.trading_pair} at ${signal.price}`);

      return { success: true, trade: activeTrade };

    } catch (error) {
      console.error('❌ Trade execution failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Monitor active trades and update stop losses
   */
  private async monitorActiveTrades(): Promise<void> {
    if (this.activeTrades.size === 0) return;

    try {
      // Get current price
      const marketData = await ethMonitor.getCurrentPrice();
      const currentPrice = marketData.price;

      if (!currentPrice || currentPrice === 0) return;

      for (const [tradeId, trade] of this.activeTrades) {
        // Update current price and P&L
        trade.current_price = currentPrice;
        trade.current_pnl_pct = this.stopLossManager.getPnLPercentage(currentPrice);

        // Update stop loss
        const slUpdate = this.stopLossManager.update(currentPrice);
        trade.stop_loss_price = slUpdate.trailing_sl;

        // Check if stop loss should trigger
        const shouldExit = this.stopLossManager.shouldExit(currentPrice);

        if (shouldExit.should_exit) {
          await this.closeTrade(tradeId, currentPrice, shouldExit.reason);
        }
      }
    } catch (error) {
      console.error('❌ Error monitoring trades:', error);
    }
  }

  /**
   * Close a trade
   */
  async closeTrade(tradeId: string, exitPrice: number, reason: string): Promise<{
    success: boolean;
    trade_record?: TradeRecord;
    error?: string;
  }> {
    const trade = this.activeTrades.get(tradeId);
    if (!trade) {
      return { success: false, error: 'Trade not found' };
    }

    try {
      const duration = Date.now() - trade.entry_time;
      const profitLossPct = this.stopLossManager.getPnLPercentage(exitPrice);
      const profitLossUsd = (profitLossPct / 100) * (trade.amount * trade.entry_price);
      const isWin = profitLossPct > 0;

      // Create trade record
      const tradeRecord: TradeRecord = {
        trade_id: tradeId,
        timestamp: trade.entry_time,
        pair: trade.pair,
        position_type: trade.position_type,
        entry_price: trade.entry_price,
        exit_price: exitPrice,
        amount: trade.amount,
        win: isWin,
        profit_loss_pct: profitLossPct,
        profit_loss_usd: profitLossUsd,
        duration_minutes: duration / (1000 * 60),
        strategy_name: trade.strategy_name,
        stop_loss_triggered: reason.includes('STOP_LOSS'),
        max_profit_pct: this.stopLossManager.getAnalytics().max_profit_pct,
        max_drawdown_pct: this.stopLossManager.getAnalytics().max_drawdown_pct,
        sl_adjustments: this.stopLossManager.getAnalytics().sl_adjustments,
        market_conditions: {
          volatility: 0, // Will be calculated by tracker
          trend: 'UNKNOWN',
          volume: 0,
          rsi: 0
        }
      };

      // Record performance
      this.performanceTracker.recordTrade(tradeRecord);

      // Update daily stats
      this.dailyStats.pnl_pct += profitLossPct;
      this.dailyStats.pnl_usd += profitLossUsd;

      // Remove from active trades
      this.activeTrades.delete(tradeId);

      // Reset stop loss manager
      this.stopLossManager.reset();

      // Auto-tune if enabled
      if (this.config.auto_tuning_enabled) {
        const tuningResult = this.strategyTuner.evaluate(this.config.strategy_name);
        if (tuningResult.tuning_applied) {
          console.log('🔧 Auto-tuning applied:', tuningResult.trigger_reason);
        }
      }

      console.log(`💰 Trade closed: ${tradeId} - ${isWin ? 'WIN' : 'LOSS'} ${profitLossPct.toFixed(2)}% - Reason: ${reason}`);

      return { success: true, trade_record: tradeRecord };

    } catch (error) {
      console.error('❌ Error closing trade:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get current engine status
   */
  getStatus(): EngineStatus {
    const riskLevel = this.calculateRiskLevel();
    const nextEvaluation = this.lastEvaluation + (this.strategyTuner['tuningInterval'] * 60 * 1000);

    return {
      is_active: this.isRunning,
      active_trades: Array.from(this.activeTrades.values()),
      total_trades_today: this.dailyStats.trades,
      daily_pnl_pct: this.dailyStats.pnl_pct,
      daily_pnl_usd: this.dailyStats.pnl_usd,
      current_strategy: this.config.strategy_name,
      last_tuning: this.lastEvaluation,
      next_evaluation: nextEvaluation,
      risk_level: riskLevel,
      emergency_stop_active: this.isEmergencyStopTriggered()
    };
  }

  /**
   * Calculate current risk level
   */
  private calculateRiskLevel(): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const performance = this.performanceTracker.getStrategyPerformance(this.config.strategy_name);
    
    if (performance.metrics.max_drawdown_pct > 20) return 'CRITICAL';
    if (performance.metrics.max_drawdown_pct > 15) return 'HIGH';
    if (performance.metrics.max_drawdown_pct > 10) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Check if emergency stop should be triggered
   */
  private isEmergencyStopTriggered(): boolean {
    if (!this.config.emergency_stop_enabled) return false;

    const performance = this.performanceTracker.getStrategyPerformance(this.config.strategy_name);
    
    // Emergency stop conditions
    return (
      performance.metrics.max_drawdown_pct > 25 ||
      performance.metrics.max_consecutive_losses > 8 ||
      this.dailyStats.pnl_pct < -15
    );
  }

  /**
   * Start monitoring loop
   */
  private startMonitoring(): void {
    setInterval(async () => {
      if (this.isRunning) {
        await this.monitorActiveTrades();
      }
    }, 5000); // Monitor every 5 seconds

    // Performance evaluation every hour
    setInterval(() => {
      if (this.isRunning && this.config.auto_tuning_enabled) {
        this.lastEvaluation = Date.now();
        const result = this.strategyTuner.evaluate(this.config.strategy_name);
        if (result.tuning_applied) {
          console.log('🔧 Scheduled auto-tuning completed:', result.trigger_reason);
        }
      }
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Update engine configuration
   */
  updateConfig(newConfig: Partial<FullEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Engine configuration updated');
  }

  /**
   * Force close all active trades
   */
  async forceCloseAllTrades(reason: string = 'MANUAL_CLOSE'): Promise<void> {
    const currentPrice = (await ethMonitor.getCurrentPrice()).price;
    
    for (const tradeId of this.activeTrades.keys()) {
      await this.closeTrade(tradeId, currentPrice, reason);
    }
    
    console.log('🛑 All active trades force closed');
  }

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics(): {
    strategy_performance: any;
    tuning_stats: any;
    stop_loss_analytics: any;
    daily_stats: any;
  } {
    const strategyPerformance = this.performanceTracker.getStrategyPerformance(this.config.strategy_name);
    const tuningStats = this.strategyTuner.getTuningStats();
    const stopLossAnalytics = this.stopLossManager.getAnalytics();

    return {
      strategy_performance: strategyPerformance,
      tuning_stats: tuningStats,
      stop_loss_analytics: stopLossAnalytics,
      daily_stats: this.dailyStats
    };
  }

  /**
   * Generate unique trade ID
   */
  private generateTradeId(): string {
    return `wfull_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get start of current day timestamp
   */
  private getStartOfDay(): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  }

  /**
   * Reset daily statistics
   */
  private resetDailyStats(): void {
    this.dailyStats = {
      trades: 0,
      pnl_pct: 0,
      pnl_usd: 0,
      start_of_day: this.getStartOfDay()
    };
  }

  /**
   * Export complete engine data
   */
  exportEngineData(): {
    config: FullEngineConfig;
    active_trades: ActiveTrade[];
    daily_stats: any;
    performance_data: any;
    tuning_data: any;
    stop_loss_history: any;
  } {
    return {
      config: this.config,
      active_trades: Array.from(this.activeTrades.values()),
      daily_stats: this.dailyStats,
      performance_data: this.performanceTracker.exportData(),
      tuning_data: this.strategyTuner.exportTuningData(),
      stop_loss_history: this.stopLossManager.exportHistory()
    };
  }
}

// Global instance
export const waidesKIFullEngine = new WaidesKIFullEngine();