import { storage } from '../storage';

interface Position {
  symbol: string;
  quantity: number;
  entryPrice: number;
  entryTime: number;
  positionType: 'LONG' | 'SHORT';
  unrealizedPnL: number;
  realizedPnL: number;
}

interface RiskParameters {
  maxPositionSize: number; // Percentage of portfolio
  stopLossPercentage: number;
  takeProfitPercentage: number;
  maxDrawdown: number;
  maxDailyLoss: number;
}

interface PortfolioStats {
  totalValue: number;
  availableBalance: number;
  totalPnL: number;
  dailyPnL: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  positions: Position[];
}

export class PortfolioManager {
  private balance: number = 10000; // Starting balance in USDT
  private positions: Map<string, Position> = new Map();
  private tradeHistory: any[] = [];
  private riskParams: RiskParameters;
  private dailyStartBalance: number;
  private maxBalance: number;

  constructor() {
    this.riskParams = {
      maxPositionSize: 0.2, // 20% max per position
      stopLossPercentage: 0.05, // 5% stop loss
      takeProfitPercentage: 0.15, // 15% take profit
      maxDrawdown: 0.15, // 15% max drawdown
      maxDailyLoss: 0.05 // 5% max daily loss
    };
    this.dailyStartBalance = this.balance;
    this.maxBalance = this.balance;
    this.loadPortfolioState();
  }

  private async loadPortfolioState() {
    // In a real implementation, this would load from database
    console.log('📊 Portfolio Manager initialized with $' + this.balance.toFixed(2));
  }

  public async openPosition(
    symbol: string,
    side: 'LONG' | 'SHORT',
    currentPrice: number,
    confidence: number
  ): Promise<{ success: boolean; message: string; trade?: any }> {
    
    // Risk checks
    const riskCheck = this.performRiskChecks(symbol, currentPrice, confidence);
    if (!riskCheck.allowed) {
      return { success: false, message: riskCheck.reason };
    }

    // Calculate position size based on confidence and risk parameters
    const positionSize = this.calculatePositionSize(confidence);
    const quantity = (positionSize * this.balance) / currentPrice;

    // Check if we have sufficient balance
    const requiredBalance = quantity * currentPrice;
    if (requiredBalance > this.balance * 0.95) { // Keep 5% buffer
      return { 
        success: false, 
        message: `Insufficient balance. Required: $${requiredBalance.toFixed(2)}, Available: $${this.balance.toFixed(2)}` 
      };
    }

    // Create position
    const position: Position = {
      symbol,
      quantity,
      entryPrice: currentPrice,
      entryTime: Date.now(),
      positionType: side,
      unrealizedPnL: 0,
      realizedPnL: 0
    };

    // Store position
    this.positions.set(symbol, position);
    this.balance -= requiredBalance;

    // Record trade
    const trade = {
      id: Date.now().toString(),
      symbol,
      side,
      quantity,
      price: currentPrice,
      timestamp: Date.now(),
      type: 'OPEN',
      confidence,
      positionSize: positionSize * 100
    };

    this.tradeHistory.push(trade);

    console.log(`🎯 Opened ${side} position: ${quantity.toFixed(4)} ${symbol} at $${currentPrice.toFixed(2)}`);

    return { 
      success: true, 
      message: `Position opened successfully`,
      trade 
    };
  }

  public async closePosition(
    symbol: string,
    currentPrice: number,
    reason: string = 'Manual'
  ): Promise<{ success: boolean; message: string; pnl?: number }> {
    
    const position = this.positions.get(symbol);
    if (!position) {
      return { success: false, message: 'Position not found' };
    }

    // Calculate PnL
    let pnl: number;
    if (position.positionType === 'LONG') {
      pnl = (currentPrice - position.entryPrice) * position.quantity;
    } else {
      pnl = (position.entryPrice - currentPrice) * position.quantity;
    }

    // Update balance
    const totalValue = position.quantity * currentPrice;
    this.balance += totalValue;

    // Record trade
    const trade = {
      id: Date.now().toString(),
      symbol,
      side: position.positionType,
      quantity: position.quantity,
      price: currentPrice,
      timestamp: Date.now(),
      type: 'CLOSE',
      pnl,
      reason,
      holdingTime: Date.now() - position.entryTime
    };

    this.tradeHistory.push(trade);
    this.positions.delete(symbol);

    const pnlPercentage = (pnl / (position.entryPrice * position.quantity)) * 100;
    console.log(`💰 Closed ${position.positionType} position: ${symbol} | PnL: $${pnl.toFixed(2)} (${pnlPercentage.toFixed(2)}%) | Reason: ${reason}`);

    return { 
      success: true, 
      message: `Position closed. PnL: $${pnl.toFixed(2)}`,
      pnl 
    };
  }

  public updatePositions(currentPrices: Map<string, number>): void {
    for (const [symbol, position] of Array.from(this.positions.entries())) {
      const currentPrice = currentPrices.get(symbol);
      if (!currentPrice) continue;

      // Update unrealized PnL
      if (position.positionType === 'LONG') {
        position.unrealizedPnL = (currentPrice - position.entryPrice) * position.quantity;
      } else {
        position.unrealizedPnL = (position.entryPrice - currentPrice) * position.quantity;
      }

      // Check stop loss and take profit
      const pnlPercentage = position.unrealizedPnL / (position.entryPrice * position.quantity);
      
      if (pnlPercentage <= -this.riskParams.stopLossPercentage) {
        this.closePosition(symbol, currentPrice, 'Stop Loss');
      } else if (pnlPercentage >= this.riskParams.takeProfitPercentage) {
        this.closePosition(symbol, currentPrice, 'Take Profit');
      }
    }
  }

  private performRiskChecks(symbol: string, currentPrice: number, confidence: number): { allowed: boolean; reason: string } {
    // Check if position already exists
    if (this.positions.has(symbol)) {
      return { allowed: false, reason: 'Position already exists for this symbol' };
    }

    // Check daily loss limit
    const dailyPnL = this.calculateDailyPnL();
    const dailyLossPercentage = Math.abs(dailyPnL) / this.dailyStartBalance;
    if (dailyPnL < 0 && dailyLossPercentage >= this.riskParams.maxDailyLoss) {
      return { allowed: false, reason: 'Daily loss limit reached' };
    }

    // Check max drawdown
    const currentDrawdown = (this.maxBalance - this.getTotalPortfolioValue()) / this.maxBalance;
    if (currentDrawdown >= this.riskParams.maxDrawdown) {
      return { allowed: false, reason: 'Maximum drawdown limit reached' };
    }

    // Check confidence threshold
    if (confidence < 0.6) {
      return { allowed: false, reason: 'Confidence level too low for trading' };
    }

    return { allowed: true, reason: 'All risk checks passed' };
  }

  private calculatePositionSize(confidence: number): number {
    // Scale position size based on confidence (60% to 100% confidence maps to 5% to 20% position size)
    const minSize = 0.05;
    const maxSize = this.riskParams.maxPositionSize;
    const normalizedConfidence = (confidence - 0.6) / 0.4; // Scale 0.6-1.0 to 0-1
    return minSize + (normalizedConfidence * (maxSize - minSize));
  }

  private calculateDailyPnL(): number {
    const today = new Date().toDateString();
    return this.tradeHistory
      .filter(trade => new Date(trade.timestamp).toDateString() === today)
      .reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  }

  private getTotalPortfolioValue(): number {
    let totalValue = this.balance;
    for (const position of this.positions.values()) {
      totalValue += position.unrealizedPnL + (position.entryPrice * position.quantity);
    }
    return totalValue;
  }

  public getPortfolioStats(): PortfolioStats {
    const totalValue = this.getTotalPortfolioValue();
    const totalPnL = totalValue - 10000; // Initial balance
    const dailyPnL = this.calculateDailyPnL();

    // Calculate win rate
    const closedTrades = this.tradeHistory.filter(t => t.type === 'CLOSE' && t.pnl !== undefined);
    const winningTrades = closedTrades.filter(t => t.pnl > 0);
    const winRate = closedTrades.length > 0 ? winningTrades.length / closedTrades.length : 0;

    // Calculate Sharpe ratio (simplified)
    const returns = closedTrades.map(t => t.pnl / (t.price * t.quantity));
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const returnStd = returns.length > 1 ? 
      Math.sqrt(returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / (returns.length - 1)) : 0;
    const sharpeRatio = returnStd > 0 ? avgReturn / returnStd : 0;

    // Calculate max drawdown
    const maxDrawdown = (this.maxBalance - Math.min(...this.tradeHistory.map(() => totalValue))) / this.maxBalance;

    return {
      totalValue,
      availableBalance: this.balance,
      totalPnL,
      dailyPnL,
      winRate,
      sharpeRatio,
      maxDrawdown,
      positions: Array.from(this.positions.values())
    };
  }

  public getRecentTrades(limit: number = 10): any[] {
    return this.tradeHistory.slice(-limit).reverse();
  }

  public updateRiskParameters(newParams: Partial<RiskParameters>): void {
    this.riskParams = { ...this.riskParams, ...newParams };
    console.log('📋 Risk parameters updated:', this.riskParams);
  }

  // Reset daily tracking (call this at start of each day)
  public resetDailyTracking(): void {
    this.dailyStartBalance = this.getTotalPortfolioValue();
    console.log('🌅 Daily tracking reset. Starting balance: $' + this.dailyStartBalance.toFixed(2));
  }
}

export const portfolioManager = new PortfolioManager();