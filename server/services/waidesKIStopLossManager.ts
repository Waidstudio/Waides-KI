/**
 * WAIDES KI SMART STOP-LOSS MANAGER
 * Dynamic stop-loss and trailing adjustments for intelligent risk management
 */

export interface StopLossConfig {
  initial_sl_pct: number;
  trail_pct: number;
  max_sl_pct: number;
  min_sl_pct: number;
}

export interface TradeEntry {
  entry_price: number;
  timestamp: number;
  pair: string;
  position_type: 'LONG' | 'SHORT';
  amount: number;
}

export interface StopLossState {
  entry_price: number | null;
  trailing_sl: number | null;
  highest_price: number | null;
  lowest_price: number | null;
  position_type: 'LONG' | 'SHORT' | null;
  sl_triggered: boolean;
  sl_history: Array<{
    price: number;
    timestamp: number;
    reason: string;
  }>;
}

export class WaidesKIStopLossManager {
  private config: StopLossConfig;
  private state: StopLossState;

  constructor(config: Partial<StopLossConfig> = {}) {
    this.config = {
      initial_sl_pct: 0.01,    // 1% initial stop loss
      trail_pct: 0.005,        // 0.5% trailing percentage
      max_sl_pct: 0.05,        // 5% maximum stop loss
      min_sl_pct: 0.005,       // 0.5% minimum stop loss
      ...config
    };

    this.state = {
      entry_price: null,
      trailing_sl: null,
      highest_price: null,
      lowest_price: null,
      position_type: null,
      sl_triggered: false,
      sl_history: []
    };
  }

  /**
   * Set entry point for position
   */
  setEntry(trade: TradeEntry): void {
    this.state.entry_price = trade.entry_price;
    this.state.position_type = trade.position_type;
    this.state.highest_price = trade.entry_price;
    this.state.lowest_price = trade.entry_price;
    this.state.sl_triggered = false;

    // Calculate initial stop loss based on position type
    if (trade.position_type === 'LONG') {
      this.state.trailing_sl = trade.entry_price * (1 - this.config.initial_sl_pct);
    } else {
      this.state.trailing_sl = trade.entry_price * (1 + this.config.initial_sl_pct);
    }

    this.state.sl_history.push({
      price: this.state.trailing_sl,
      timestamp: Date.now(),
      reason: 'INITIAL_ENTRY'
    });
  }

  /**
   * Update stop loss based on current price
   */
  update(currentPrice: number): { trailing_sl: number; updated: boolean } {
    if (!this.state.entry_price || !this.state.trailing_sl || !this.state.position_type) {
      return { trailing_sl: 0, updated: false };
    }

    let updated = false;
    const oldSl = this.state.trailing_sl;

    if (this.state.position_type === 'LONG') {
      // Update highest price seen
      if (currentPrice > (this.state.highest_price || 0)) {
        this.state.highest_price = currentPrice;
      }

      // Only trail up when price moves favorably
      if (currentPrice > this.state.entry_price) {
        const newSl = currentPrice * (1 - this.config.trail_pct);
        if (newSl > this.state.trailing_sl) {
          this.state.trailing_sl = newSl;
          updated = true;
        }
      }
    } else {
      // SHORT position logic
      // Update lowest price seen
      if (currentPrice < (this.state.lowest_price || Infinity)) {
        this.state.lowest_price = currentPrice;
      }

      // Only trail down when price moves favorably
      if (currentPrice < this.state.entry_price) {
        const newSl = currentPrice * (1 + this.config.trail_pct);
        if (newSl < this.state.trailing_sl) {
          this.state.trailing_sl = newSl;
          updated = true;
        }
      }
    }

    if (updated) {
      this.state.sl_history.push({
        price: this.state.trailing_sl,
        timestamp: Date.now(),
        reason: 'TRAILING_UPDATE'
      });
    }

    return { trailing_sl: this.state.trailing_sl, updated };
  }

  /**
   * Check if stop loss should trigger
   */
  shouldExit(currentPrice: number): { should_exit: boolean; reason: string; sl_price: number } {
    if (!this.state.trailing_sl || !this.state.position_type) {
      return { should_exit: false, reason: 'NO_POSITION', sl_price: 0 };
    }

    let shouldExit = false;
    let reason = '';

    if (this.state.position_type === 'LONG') {
      if (currentPrice <= this.state.trailing_sl) {
        shouldExit = true;
        reason = 'LONG_STOP_LOSS_TRIGGERED';
      }
    } else {
      if (currentPrice >= this.state.trailing_sl) {
        shouldExit = true;
        reason = 'SHORT_STOP_LOSS_TRIGGERED';
      }
    }

    if (shouldExit) {
      this.state.sl_triggered = true;
      this.state.sl_history.push({
        price: currentPrice,
        timestamp: Date.now(),
        reason: 'STOP_LOSS_EXIT'
      });
    }

    return {
      should_exit: shouldExit,
      reason,
      sl_price: this.state.trailing_sl
    };
  }

  /**
   * Update stop loss configuration
   */
  updateConfig(newConfig: Partial<StopLossConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current stop loss state
   */
  getState(): StopLossState {
    return { ...this.state };
  }

  /**
   * Get stop loss configuration
   */
  getConfig(): StopLossConfig {
    return { ...this.config };
  }

  /**
   * Calculate profit/loss percentage
   */
  getPnLPercentage(currentPrice: number): number {
    if (!this.state.entry_price || !this.state.position_type) {
      return 0;
    }

    if (this.state.position_type === 'LONG') {
      return ((currentPrice - this.state.entry_price) / this.state.entry_price) * 100;
    } else {
      return ((this.state.entry_price - currentPrice) / this.state.entry_price) * 100;
    }
  }

  /**
   * Get detailed analytics
   */
  getAnalytics(): {
    max_profit_pct: number;
    max_drawdown_pct: number;
    current_pnl_pct: number;
    sl_adjustments: number;
    profit_locked: number;
  } {
    if (!this.state.entry_price || !this.state.position_type) {
      return {
        max_profit_pct: 0,
        max_drawdown_pct: 0,
        current_pnl_pct: 0,
        sl_adjustments: 0,
        profit_locked: 0
      };
    }

    let maxProfitPct = 0;
    let maxDrawdownPct = 0;
    let profitLocked = 0;

    if (this.state.position_type === 'LONG') {
      if (this.state.highest_price) {
        maxProfitPct = ((this.state.highest_price - this.state.entry_price) / this.state.entry_price) * 100;
      }
      if (this.state.lowest_price) {
        maxDrawdownPct = ((this.state.entry_price - this.state.lowest_price) / this.state.entry_price) * 100;
      }
      if (this.state.trailing_sl) {
        profitLocked = ((this.state.trailing_sl - this.state.entry_price) / this.state.entry_price) * 100;
      }
    } else {
      if (this.state.lowest_price) {
        maxProfitPct = ((this.state.entry_price - this.state.lowest_price) / this.state.entry_price) * 100;
      }
      if (this.state.highest_price) {
        maxDrawdownPct = ((this.state.highest_price - this.state.entry_price) / this.state.entry_price) * 100;
      }
      if (this.state.trailing_sl) {
        profitLocked = ((this.state.entry_price - this.state.trailing_sl) / this.state.entry_price) * 100;
      }
    }

    return {
      max_profit_pct: maxProfitPct,
      max_drawdown_pct: maxDrawdownPct,
      current_pnl_pct: 0, // Will be calculated by caller
      sl_adjustments: this.state.sl_history.filter(h => h.reason === 'TRAILING_UPDATE').length,
      profit_locked: Math.max(0, profitLocked)
    };
  }

  /**
   * Reset position state
   */
  reset(): void {
    this.state = {
      entry_price: null,
      trailing_sl: null,
      highest_price: null,
      lowest_price: null,
      position_type: null,
      sl_triggered: false,
      sl_history: []
    };
  }

  /**
   * Export stop loss history for analysis
   */
  exportHistory(): Array<{
    price: number;
    timestamp: number;
    reason: string;
    formatted_time: string;
  }> {
    return this.state.sl_history.map(entry => ({
      ...entry,
      formatted_time: new Date(entry.timestamp).toISOString()
    }));
  }
}

// Global instance
export const waidesKIStopLossManager = new WaidesKIStopLossManager();