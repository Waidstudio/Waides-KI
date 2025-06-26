/**
 * WAIDES KI ORDER SIMULATOR
 * Safe dry-run environment for Binance trade simulation with balance tracking and history
 */

export interface SimulatedTrade {
  id: string;
  side: 'BUY' | 'SELL';
  symbol: string;
  quantity: number;
  price: number;
  quoteAmount: number;
  timestamp: number;
  balance: number;
  success: boolean;
  error?: string;
}

export interface SimulatorBalance {
  usdt: number;
  eth: number;
  total_value_usdt: number;
}

export interface SimulatorPosition {
  symbol: string;
  quantity: number;
  average_price: number;
  current_value: number;
  pnl: number;
  pnl_percentage: number;
}

export class WaidesKIOrderSimulator {
  private balance: number;
  private positions: Map<string, number> = new Map();
  private averagePrices: Map<string, number> = new Map();
  private tradeHistory: SimulatedTrade[] = [];
  private isActive: boolean = true;

  constructor(startingBalance: number = 10000) {
    this.balance = startingBalance;
    this.positions.set('USDT', startingBalance);
    this.positions.set('ETH', 0);
  }

  /**
   * Simulate buying cryptocurrency
   */
  async buy(symbol: string, quoteAmount: number): Promise<SimulatedTrade> {
    const price = await this.getCurrentPrice(symbol);
    const quantity = quoteAmount / price;
    
    // Check if sufficient balance
    if (this.balance < quoteAmount) {
      const trade: SimulatedTrade = {
        id: this.generateTradeId(),
        side: 'BUY',
        symbol,
        quantity: 0,
        price,
        quoteAmount,
        timestamp: Date.now(),
        balance: this.balance,
        success: false,
        error: 'Insufficient balance'
      };
      this.tradeHistory.push(trade);
      return trade;
    }

    // Execute buy
    this.balance -= quoteAmount;
    const currentPosition = this.positions.get(symbol) || 0;
    const currentAvgPrice = this.averagePrices.get(symbol) || 0;
    
    // Calculate new average price
    const newPosition = currentPosition + quantity;
    const newAvgPrice = currentPosition > 0 
      ? ((currentPosition * currentAvgPrice) + (quantity * price)) / newPosition
      : price;
    
    this.positions.set(symbol, newPosition);
    this.positions.set('USDT', this.balance);
    this.averagePrices.set(symbol, newAvgPrice);

    const trade: SimulatedTrade = {
      id: this.generateTradeId(),
      side: 'BUY',
      symbol,
      quantity,
      price,
      quoteAmount,
      timestamp: Date.now(),
      balance: this.balance,
      success: true
    };

    this.tradeHistory.push(trade);
    return trade;
  }

  /**
   * Simulate selling cryptocurrency
   */
  async sell(symbol: string, quantity?: number): Promise<SimulatedTrade> {
    const price = await this.getCurrentPrice(symbol);
    const heldQuantity = this.positions.get(symbol) || 0;
    const sellQuantity = quantity || heldQuantity;
    
    // Check if sufficient position
    if (sellQuantity > heldQuantity) {
      const trade: SimulatedTrade = {
        id: this.generateTradeId(),
        side: 'SELL',
        symbol,
        quantity: 0,
        price,
        quoteAmount: 0,
        timestamp: Date.now(),
        balance: this.balance,
        success: false,
        error: 'Insufficient position'
      };
      this.tradeHistory.push(trade);
      return trade;
    }

    // Execute sell
    const quoteAmount = sellQuantity * price;
    this.balance += quoteAmount;
    this.positions.set(symbol, heldQuantity - sellQuantity);
    this.positions.set('USDT', this.balance);

    const trade: SimulatedTrade = {
      id: this.generateTradeId(),
      side: 'SELL',
      symbol,
      quantity: sellQuantity,
      price,
      quoteAmount,
      timestamp: Date.now(),
      balance: this.balance,
      success: true
    };

    this.tradeHistory.push(trade);
    return trade;
  }

  /**
   * Get current price for symbol
   */
  private async getCurrentPrice(symbol: string): Promise<number> {
    try {
      // Use Binance API for real price data
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`);
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      // Fallback to mock price if API fails
      if (symbol === 'ETH') return 2500.0;
      return 1.0;
    }
  }

  /**
   * Get current simulator balance
   */
  getBalance(): SimulatorBalance {
    const ethPosition = this.positions.get('ETH') || 0;
    const usdtBalance = this.balance;
    
    // Calculate total value in USDT
    const ethValueUsdt = ethPosition * 2500; // Use current ETH price
    const totalValueUsdt = usdtBalance + ethValueUsdt;

    return {
      usdt: usdtBalance,
      eth: ethPosition,
      total_value_usdt: totalValueUsdt
    };
  }

  /**
   * Get all positions
   */
  getPositions(): SimulatorPosition[] {
    const positions: SimulatorPosition[] = [];
    
    for (const [symbol, quantity] of this.positions.entries()) {
      if (symbol !== 'USDT' && quantity > 0) {
        const avgPrice = this.averagePrices.get(symbol) || 0;
        const currentPrice = 2500; // Mock current price
        const currentValue = quantity * currentPrice;
        const pnl = currentValue - (quantity * avgPrice);
        const pnlPercentage = avgPrice > 0 ? (pnl / (quantity * avgPrice)) * 100 : 0;

        positions.push({
          symbol,
          quantity,
          average_price: avgPrice,
          current_value: currentValue,
          pnl,
          pnl_percentage: pnlPercentage
        });
      }
    }

    return positions;
  }

  /**
   * Get trade history
   */
  getTradeHistory(): SimulatedTrade[] {
    return [...this.tradeHistory].reverse(); // Most recent first
  }

  /**
   * Get simulator statistics
   */
  getStatistics(): {
    total_trades: number;
    successful_trades: number;
    failed_trades: number;
    success_rate: number;
    total_volume: number;
    profit_loss: number;
    profit_loss_percentage: number;
  } {
    const totalTrades = this.tradeHistory.length;
    const successfulTrades = this.tradeHistory.filter(t => t.success).length;
    const failedTrades = totalTrades - successfulTrades;
    const successRate = totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;
    
    const totalVolume = this.tradeHistory
      .filter(t => t.success)
      .reduce((sum, t) => sum + t.quoteAmount, 0);
    
    const currentBalance = this.getBalance();
    const profitLoss = currentBalance.total_value_usdt - 10000; // Starting balance
    const profitLossPercentage = (profitLoss / 10000) * 100;

    return {
      total_trades: totalTrades,
      successful_trades: successfulTrades,
      failed_trades: failedTrades,
      success_rate: successRate,
      total_volume: totalVolume,
      profit_loss: profitLoss,
      profit_loss_percentage: profitLossPercentage
    };
  }

  /**
   * Reset simulator to initial state
   */
  reset(startingBalance: number = 10000): void {
    this.balance = startingBalance;
    this.positions.clear();
    this.averagePrices.clear();
    this.tradeHistory = [];
    this.positions.set('USDT', startingBalance);
    this.positions.set('ETH', 0);
  }

  /**
   * Enable/disable simulator
   */
  setActive(active: boolean): void {
    this.isActive = active;
  }

  /**
   * Check if simulator is active
   */
  isSimulatorActive(): boolean {
    return this.isActive;
  }

  /**
   * Generate unique trade ID
   */
  private generateTradeId(): string {
    return `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export simulator state
   */
  exportState(): {
    balance: number;
    positions: Record<string, number>;
    average_prices: Record<string, number>;
    trade_history: SimulatedTrade[];
    statistics: any;
  } {
    return {
      balance: this.balance,
      positions: Object.fromEntries(this.positions),
      average_prices: Object.fromEntries(this.averagePrices),
      trade_history: this.tradeHistory,
      statistics: this.getStatistics()
    };
  }
}

// Global simulator instance
export const waidesKIOrderSimulator = new WaidesKIOrderSimulator();