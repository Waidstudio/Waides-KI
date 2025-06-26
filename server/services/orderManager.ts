/**
 * WAIDES KI ORDER MANAGER
 * Unified interface controlling real or simulated trades with safety-first design
 */

import { waidesKIOrderSimulator, SimulatedTrade } from './orderSimulator';

export interface OrderResult {
  success: boolean;
  trade_id: string;
  side: 'BUY' | 'SELL';
  symbol: string;
  quantity: number;
  price: number;
  quote_amount: number;
  timestamp: number;
  mode: 'SIMULATED' | 'LIVE';
  error?: string;
  fees?: number;
  slippage?: number;
}

export interface OrderManagerConfig {
  simulate: boolean;
  safety_enabled: boolean;
  max_trade_amount: number;
  max_daily_trades: number;
  emergency_stop: boolean;
}

export class WaidesKIOrderManager {
  private config: OrderManagerConfig;
  private dailyTradeCount: number = 0;
  private lastResetDate: string = '';
  private realClient: any = null; // Placeholder for future Binance client
  private emergencyMode: boolean = false;

  constructor(config: Partial<OrderManagerConfig> = {}) {
    this.config = {
      simulate: config.simulate ?? true, // Default to simulate mode
      safety_enabled: config.safety_enabled ?? true,
      max_trade_amount: config.max_trade_amount ?? 1000,
      max_daily_trades: config.max_daily_trades ?? 50,
      emergency_stop: config.emergency_stop ?? false
    };
    
    this.resetDailyCountIfNeeded();
  }

  /**
   * Execute buy order through appropriate channel
   */
  async buy(symbol: string, quoteAmount: number): Promise<OrderResult> {
    // Safety checks
    const safetyCheck = this.performSafetyChecks('BUY', symbol, quoteAmount);
    if (!safetyCheck.allowed) {
      return this.createErrorResult('BUY', symbol, 0, 0, quoteAmount, safetyCheck.reason);
    }

    try {
      if (this.config.simulate || this.emergencyMode) {
        return await this.executeSimulatedBuy(symbol, quoteAmount);
      } else {
        return await this.executeLiveBuy(symbol, quoteAmount);
      }
    } catch (error) {
      // Auto-fallback to simulation on error
      this.emergencyMode = true;
      console.error('Order execution failed, falling back to simulation:', error);
      return await this.executeSimulatedBuy(symbol, quoteAmount);
    }
  }

  /**
   * Execute sell order through appropriate channel
   */
  async sell(symbol: string, quantity?: number): Promise<OrderResult> {
    // Safety checks
    const safetyCheck = this.performSafetyChecks('SELL', symbol, 0);
    if (!safetyCheck.allowed) {
      return this.createErrorResult('SELL', symbol, quantity || 0, 0, 0, safetyCheck.reason);
    }

    try {
      if (this.config.simulate || this.emergencyMode) {
        return await this.executeSimulatedSell(symbol, quantity);
      } else {
        return await this.executeLiveSell(symbol, quantity);
      }
    } catch (error) {
      // Auto-fallback to simulation on error
      this.emergencyMode = true;
      console.error('Order execution failed, falling back to simulation:', error);
      return await this.executeSimulatedSell(symbol, quantity);
    }
  }

  /**
   * Execute simulated buy order
   */
  private async executeSimulatedBuy(symbol: string, quoteAmount: number): Promise<OrderResult> {
    const trade = await waidesKIOrderSimulator.buy(symbol, quoteAmount);
    this.incrementDailyTradeCount();

    return {
      success: trade.success,
      trade_id: trade.id,
      side: 'BUY',
      symbol,
      quantity: trade.quantity,
      price: trade.price,
      quote_amount: quoteAmount,
      timestamp: trade.timestamp,
      mode: 'SIMULATED',
      error: trade.error
    };
  }

  /**
   * Execute simulated sell order
   */
  private async executeSimulatedSell(symbol: string, quantity?: number): Promise<OrderResult> {
    const trade = await waidesKIOrderSimulator.sell(symbol, quantity);
    this.incrementDailyTradeCount();

    return {
      success: trade.success,
      trade_id: trade.id,
      side: 'SELL',
      symbol,
      quantity: trade.quantity,
      price: trade.price,
      quote_amount: trade.quoteAmount,
      timestamp: trade.timestamp,
      mode: 'SIMULATED',
      error: trade.error
    };
  }

  /**
   * Execute live buy order (placeholder for future implementation)
   */
  private async executeLiveBuy(symbol: string, quoteAmount: number): Promise<OrderResult> {
    // Placeholder for real Binance client integration
    throw new Error('Live trading not implemented - falling back to simulation');
  }

  /**
   * Execute live sell order (placeholder for future implementation)
   */
  private async executeLiveSell(symbol: string, quantity?: number): Promise<OrderResult> {
    // Placeholder for real Binance client integration
    throw new Error('Live trading not implemented - falling back to simulation');
  }

  /**
   * Perform comprehensive safety checks
   */
  private performSafetyChecks(side: 'BUY' | 'SELL', symbol: string, amount: number): {
    allowed: boolean;
    reason?: string;
  } {
    if (!this.config.safety_enabled) {
      return { allowed: true };
    }

    // Emergency stop check
    if (this.config.emergency_stop) {
      return { allowed: false, reason: 'Emergency stop activated' };
    }

    // Daily trade limit check
    if (this.dailyTradeCount >= this.config.max_daily_trades) {
      return { allowed: false, reason: 'Daily trade limit exceeded' };
    }

    // Maximum trade amount check
    if (side === 'BUY' && amount > this.config.max_trade_amount) {
      return { allowed: false, reason: 'Trade amount exceeds maximum allowed' };
    }

    // Symbol validation
    if (!symbol || !symbol.includes('ETH')) {
      return { allowed: false, reason: 'Invalid trading pair - only ETH pairs allowed' };
    }

    return { allowed: true };
  }

  /**
   * Create error result
   */
  private createErrorResult(
    side: 'BUY' | 'SELL',
    symbol: string,
    quantity: number,
    price: number,
    quoteAmount: number,
    error: string
  ): OrderResult {
    return {
      success: false,
      trade_id: `ERROR_${Date.now()}`,
      side,
      symbol,
      quantity,
      price,
      quote_amount: quoteAmount,
      timestamp: Date.now(),
      mode: this.config.simulate ? 'SIMULATED' : 'LIVE',
      error
    };
  }

  /**
   * Get current configuration
   */
  getConfiguration(): OrderManagerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfiguration(newConfig: Partial<OrderManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get order manager status
   */
  getStatus(): {
    mode: 'SIMULATED' | 'LIVE';
    emergency_mode: boolean;
    daily_trades: number;
    max_daily_trades: number;
    safety_enabled: boolean;
    emergency_stop: boolean;
  } {
    this.resetDailyCountIfNeeded();
    
    return {
      mode: (this.config.simulate || this.emergencyMode) ? 'SIMULATED' : 'LIVE',
      emergency_mode: this.emergencyMode,
      daily_trades: this.dailyTradeCount,
      max_daily_trades: this.config.max_daily_trades,
      safety_enabled: this.config.safety_enabled,
      emergency_stop: this.config.emergency_stop
    };
  }

  /**
   * Enable/disable simulation mode
   */
  setSimulationMode(simulate: boolean): void {
    this.config.simulate = simulate;
  }

  /**
   * Activate emergency stop
   */
  activateEmergencyStop(): void {
    this.config.emergency_stop = true;
  }

  /**
   * Deactivate emergency stop
   */
  deactivateEmergencyStop(): void {
    this.config.emergency_stop = false;
  }

  /**
   * Clear emergency mode
   */
  clearEmergencyMode(): void {
    this.emergencyMode = false;
  }

  /**
   * Get simulator access for statistics
   */
  getSimulator() {
    return waidesKIOrderSimulator;
  }

  /**
   * Reset daily trade count if new day
   */
  private resetDailyCountIfNeeded(): void {
    const today = new Date().toDateString();
    if (this.lastResetDate !== today) {
      this.dailyTradeCount = 0;
      this.lastResetDate = today;
    }
  }

  /**
   * Increment daily trade count
   */
  private incrementDailyTradeCount(): void {
    this.resetDailyCountIfNeeded();
    this.dailyTradeCount++;
  }

  /**
   * Test connection and validate setup
   */
  async testConnection(): Promise<{
    simulator_available: boolean;
    live_client_available: boolean;
    mode: 'SIMULATED' | 'LIVE';
    status: string;
  }> {
    const simulatorAvailable = waidesKIOrderSimulator.isSimulatorActive();
    const liveClientAvailable = false; // Will be true when real client is implemented
    
    return {
      simulator_available: simulatorAvailable,
      live_client_available: liveClientAvailable,
      mode: (this.config.simulate || this.emergencyMode) ? 'SIMULATED' : 'LIVE',
      status: 'Order Manager operational'
    };
  }

  /**
   * Export complete order manager data
   */
  exportData(): {
    configuration: OrderManagerConfig;
    status: any;
    simulator_data: any;
    daily_stats: {
      trade_count: number;
      remaining_trades: number;
      reset_date: string;
    };
  } {
    this.resetDailyCountIfNeeded();
    
    return {
      configuration: this.config,
      status: this.getStatus(),
      simulator_data: waidesKIOrderSimulator.exportState(),
      daily_stats: {
        trade_count: this.dailyTradeCount,
        remaining_trades: Math.max(0, this.config.max_daily_trades - this.dailyTradeCount),
        reset_date: this.lastResetDate
      }
    };
  }
}

// Global order manager instance
export const waidesKIOrderManager = new WaidesKIOrderManager();
export { waidesKIOrderSimulator };