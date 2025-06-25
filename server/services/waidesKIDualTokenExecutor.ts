/**
 * STEP 39: Waides KI Dual Token Executor - ETH3L/ETH3S Position Management
 * 
 * Intelligent execution engine that handles position entry/exit for ETH3L (bullish)
 * and ETH3S (bearish) tokens based on omniview oracle decisions.
 */

import { waidesKIOmniviewOracle, OmniviewDecision } from './waidesKIOmniviewOracle';
import { waidesKIPriceFeed, TokenPrice } from './waidesKIPriceFeed';

export interface TokenPosition {
  symbol: 'ETH3L' | 'ETH3S' | 'NONE';
  entry_price: number;
  current_price: number;
  quantity: number;
  value_usd: number;
  unrealized_pnl: number;
  pnl_percentage: number;
  entry_timestamp: string;
  hold_duration: number; // minutes
  decision_confidence: number;
  timeframes_confirmed: string[];
}

export interface ExecutionResult {
  action: 'BUY' | 'SELL' | 'HOLD' | 'NO_ACTION';
  symbol: 'ETH3L' | 'ETH3S' | 'NONE';
  quantity: number;
  price: number;
  value_usd: number;
  reason: string;
  success: boolean;
  timestamp: string;
  oracle_decision: OmniviewDecision;
}

export interface ExecutorStats {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  eth3l_trades: number;
  eth3s_trades: number;
  no_trade_decisions: number;
  total_pnl: number;
  win_rate: number;
  average_hold_time: number;
  last_execution: ExecutionResult | null;
}

export class WaidesKIDualTokenExecutor {
  private current_position: TokenPosition | null;
  private execution_history: ExecutionResult[];
  private stats: ExecutorStats;
  private max_history: number;
  private default_trade_amount: number; // USD
  private auto_trading_enabled: boolean;
  private min_confidence_threshold: number;

  constructor() {
    this.current_position = null;
    this.execution_history = [];
    this.max_history = 200;
    this.default_trade_amount = 50; // $50 per trade
    this.auto_trading_enabled = false; // Safe default
    this.min_confidence_threshold = 0.65; // 65% minimum confidence
    this.stats = {
      total_executions: 0,
      successful_executions: 0,
      failed_executions: 0,
      eth3l_trades: 0,
      eth3s_trades: 0,
      no_trade_decisions: 0,
      total_pnl: 0,
      win_rate: 0,
      average_hold_time: 0,
      last_execution: null
    };
  }

  /**
   * Execute trading decision based on omniview oracle
   */
  async executeTrade(): Promise<ExecutionResult> {
    try {
      // Get oracle decision
      const oracle_decision = await waidesKIOmniviewOracle.scanAllTimeframes();
      
      // Check if we should trade based on confidence
      if (oracle_decision.confidence < this.min_confidence_threshold) {
        return this.createExecutionResult(
          'NO_ACTION',
          'NONE',
          0,
          0,
          0,
          `Confidence too low: ${(oracle_decision.confidence * 100).toFixed(1)}% < ${(this.min_confidence_threshold * 100).toFixed(1)}%`,
          true,
          oracle_decision
        );
      }

      // Get current market prices
      const dual_prices = await waidesKIPriceFeed.getDualTokenPrices();
      
      if (!dual_prices.eth3l_price || !dual_prices.eth3s_price) {
        return this.createExecutionResult(
          'NO_ACTION',
          'NONE',
          0,
          0,
          0,
          'Unable to fetch token prices',
          false,
          oracle_decision
        );
      }

      // Update current position if exists
      if (this.current_position) {
        await this.updateCurrentPosition();
      }

      // Determine action based on oracle decision and current position
      const execution_result = await this.determineAction(oracle_decision, dual_prices);
      
      // Update statistics and history
      this.updateStats(execution_result);
      this.execution_history.push(execution_result);
      if (this.execution_history.length > this.max_history) {
        this.execution_history.shift();
      }

      return execution_result;

    } catch (error) {
      console.error('Error in trade execution:', error);
      return this.createExecutionResult(
        'NO_ACTION',
        'NONE',
        0,
        0,
        0,
        `Execution error: ${error}`,
        false,
        await waidesKIOmniviewOracle.scanAllTimeframes()
      );
    }
  }

  /**
   * Determine trading action based on oracle decision
   */
  private async determineAction(
    oracle_decision: OmniviewDecision,
    dual_prices: any
  ): Promise<ExecutionResult> {
    
    // If auto trading is disabled, only simulate
    if (!this.auto_trading_enabled) {
      return this.simulateAction(oracle_decision, dual_prices);
    }

    const current_symbol = this.current_position?.symbol || 'NONE';
    const target_symbol = oracle_decision.decision === 'NO_TRADE' ? 'NONE' : oracle_decision.decision;

    // Case 1: No trade recommended by oracle
    if (oracle_decision.decision === 'NO_TRADE') {
      if (this.current_position) {
        // Close current position
        return await this.closePosition(oracle_decision, 'Oracle recommends no trade');
      } else {
        // No action needed
        return this.createExecutionResult(
          'NO_ACTION',
          'NONE',
          0,
          0,
          0,
          'Oracle recommends no trade',
          true,
          oracle_decision
        );
      }
    }

    // Case 2: Oracle recommends same token we already hold
    if (current_symbol === target_symbol) {
      return this.createExecutionResult(
        'HOLD',
        current_symbol,
        this.current_position?.quantity || 0,
        this.current_position?.current_price || 0,
        this.current_position?.value_usd || 0,
        `Holding ${current_symbol} - oracle confirms position`,
        true,
        oracle_decision
      );
    }

    // Case 3: Oracle recommends different token or we have no position
    if (this.current_position && current_symbol !== target_symbol) {
      // Close current position first
      await this.closePosition(oracle_decision, `Switching from ${current_symbol} to ${target_symbol}`);
    }

    // Open new position
    return await this.openPosition(oracle_decision, dual_prices);
  }

  /**
   * Open new position based on oracle decision
   */
  private async openPosition(
    oracle_decision: OmniviewDecision,
    dual_prices: any
  ): Promise<ExecutionResult> {
    
    const symbol = oracle_decision.decision as 'ETH3L' | 'ETH3S';
    const price = symbol === 'ETH3L' ? dual_prices.eth3l.price : dual_prices.eth3s.price;
    
    if (!price || price <= 0) {
      return this.createExecutionResult(
        'NO_ACTION',
        'NONE',
        0,
        0,
        0,
        `Invalid price for ${symbol}: ${price}`,
        false,
        oracle_decision
      );
    }

    // Calculate quantity based on trade amount
    const quantity = this.default_trade_amount / price;
    const actual_value = quantity * price;

    // Create new position
    this.current_position = {
      symbol,
      entry_price: price,
      current_price: price,
      quantity,
      value_usd: actual_value,
      unrealized_pnl: 0,
      pnl_percentage: 0,
      entry_timestamp: new Date().toISOString(),
      hold_duration: 0,
      decision_confidence: oracle_decision.confidence,
      timeframes_confirmed: Object.keys(oracle_decision.timeframe_analysis)
    };

    return this.createExecutionResult(
      'BUY',
      symbol,
      quantity,
      price,
      actual_value,
      `Opened ${symbol} position based on oracle signal`,
      true,
      oracle_decision
    );
  }

  /**
   * Close current position
   */
  private async closePosition(
    oracle_decision: OmniviewDecision,
    reason: string
  ): Promise<ExecutionResult> {
    
    if (!this.current_position) {
      return this.createExecutionResult(
        'NO_ACTION',
        'NONE',
        0,
        0,
        0,
        'No position to close',
        false,
        oracle_decision
      );
    }

    const symbol = this.current_position.symbol;
    const quantity = this.current_position.quantity;
    const current_price = this.current_position.current_price;
    const value_usd = quantity * current_price;
    const pnl = this.current_position.unrealized_pnl;

    // Update total PnL
    this.stats.total_pnl += pnl;

    // Clear position
    this.current_position = null;

    return this.createExecutionResult(
      'SELL',
      symbol,
      quantity,
      current_price,
      value_usd,
      `Closed ${symbol} position: ${reason} (PnL: $${pnl.toFixed(2)})`,
      true,
      oracle_decision
    );
  }

  /**
   * Simulate action without actual trading
   */
  private simulateAction(
    oracle_decision: OmniviewDecision,
    dual_prices: any
  ): ExecutionResult {
    
    if (oracle_decision.decision === 'NO_TRADE') {
      return this.createExecutionResult(
        'NO_ACTION',
        'NONE',
        0,
        0,
        0,
        'Simulation: Oracle recommends no trade',
        true,
        oracle_decision
      );
    }

    const symbol = oracle_decision.decision;
    const price = symbol === 'ETH3L' ? dual_prices.eth3l?.price || 0 : dual_prices.eth3s?.price || 0;
    const quantity = price > 0 ? this.default_trade_amount / price : 0;
    const value = quantity * price;

    return this.createExecutionResult(
      'BUY',
      symbol,
      quantity,
      price,
      value,
      `Simulation: Would buy ${symbol} (auto-trading disabled)`,
      true,
      oracle_decision
    );
  }

  /**
   * Update current position with latest prices
   */
  private async updateCurrentPosition(): Promise<void> {
    if (!this.current_position) return;

    try {
      const token_price = await waidesKIPriceFeed.getTokenPrice(
        this.current_position.symbol === 'ETH3L' ? 'ETH3LUSDT' : 'ETH3SUSDT'
      );

      if (token_price && token_price.price > 0) {
        this.current_position.current_price = token_price.price;
        this.current_position.value_usd = this.current_position.quantity * token_price.price;
        this.current_position.unrealized_pnl = this.current_position.value_usd - (this.current_position.quantity * this.current_position.entry_price);
        this.current_position.pnl_percentage = (this.current_position.unrealized_pnl / (this.current_position.quantity * this.current_position.entry_price)) * 100;
        
        // Update hold duration
        const entry_time = new Date(this.current_position.entry_timestamp).getTime();
        this.current_position.hold_duration = Math.floor((Date.now() - entry_time) / (1000 * 60)); // minutes
      }
    } catch (error) {
      console.error('Error updating position:', error);
    }
  }

  /**
   * Create execution result object
   */
  private createExecutionResult(
    action: 'BUY' | 'SELL' | 'HOLD' | 'NO_ACTION',
    symbol: 'ETH3L' | 'ETH3S' | 'NONE',
    quantity: number,
    price: number,
    value_usd: number,
    reason: string,
    success: boolean,
    oracle_decision: OmniviewDecision
  ): ExecutionResult {
    return {
      action,
      symbol,
      quantity,
      price,
      value_usd,
      reason,
      success,
      timestamp: new Date().toISOString(),
      oracle_decision
    };
  }

  /**
   * Update execution statistics
   */
  private updateStats(result: ExecutionResult): void {
    this.stats.total_executions++;
    this.stats.last_execution = result;

    if (result.success) {
      this.stats.successful_executions++;
    } else {
      this.stats.failed_executions++;
    }

    if (result.action === 'BUY') {
      if (result.symbol === 'ETH3L') {
        this.stats.eth3l_trades++;
      } else if (result.symbol === 'ETH3S') {
        this.stats.eth3s_trades++;
      }
    } else if (result.action === 'NO_ACTION') {
      this.stats.no_trade_decisions++;
    }

    // Calculate win rate
    const completed_trades = this.execution_history.filter(e => e.action === 'SELL').length;
    const profitable_trades = this.execution_history.filter(e => 
      e.action === 'SELL' && e.reason.includes('PnL:') && 
      parseFloat(e.reason.match(/PnL: \$([+-]?\d+\.?\d*)/)?.[1] || '0') > 0
    ).length;
    
    this.stats.win_rate = completed_trades > 0 ? profitable_trades / completed_trades : 0;

    // Calculate average hold time
    const sell_trades = this.execution_history.filter(e => e.action === 'SELL');
    if (sell_trades.length > 0) {
      const total_hold_time = sell_trades.reduce((sum, trade) => {
        // Extract hold time from trade history - this would need position tracking
        return sum + 60; // Placeholder: 60 minutes average
      }, 0);
      this.stats.average_hold_time = total_hold_time / sell_trades.length;
    }
  }

  /**
   * Get current position
   */
  getCurrentPosition(): TokenPosition | null {
    return this.current_position ? { ...this.current_position } : null;
  }

  /**
   * Get executor statistics
   */
  getStats(): ExecutorStats {
    return { ...this.stats };
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit: number = 50): ExecutionResult[] {
    return this.execution_history.slice(-limit);
  }

  /**
   * Enable/disable auto trading
   */
  setAutoTrading(enabled: boolean): void {
    this.auto_trading_enabled = enabled;
  }

  /**
   * Get auto trading status
   */
  isAutoTradingEnabled(): boolean {
    return this.auto_trading_enabled;
  }

  /**
   * Set minimum confidence threshold
   */
  setConfidenceThreshold(threshold: number): void {
    this.min_confidence_threshold = Math.max(0.1, Math.min(0.95, threshold));
  }

  /**
   * Set default trade amount
   */
  setTradeAmount(amount: number): void {
    this.default_trade_amount = Math.max(10, Math.min(1000, amount));
  }

  /**
   * Get current configuration
   */
  getConfiguration(): {
    auto_trading_enabled: boolean;
    min_confidence_threshold: number;
    default_trade_amount: number;
    max_history: number;
  } {
    return {
      auto_trading_enabled: this.auto_trading_enabled,
      min_confidence_threshold: this.min_confidence_threshold,
      default_trade_amount: this.default_trade_amount,
      max_history: this.max_history
    };
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.execution_history = [];
    this.current_position = null;
    this.stats = {
      total_executions: 0,
      successful_executions: 0,
      failed_executions: 0,
      eth3l_trades: 0,
      eth3s_trades: 0,
      no_trade_decisions: 0,
      total_pnl: 0,
      win_rate: 0,
      average_hold_time: 0,
      last_execution: null
    };
  }

  /**
   * Force close position (emergency)
   */
  async forceClosePosition(reason: string = 'Manual close'): Promise<ExecutionResult | null> {
    if (!this.current_position) {
      return null;
    }

    const oracle_decision = await waidesKIOmniviewOracle.scanAllTimeframes();
    return await this.closePosition(oracle_decision, reason);
  }
}

export const waidesKIDualTokenExecutor = new WaidesKIDualTokenExecutor();