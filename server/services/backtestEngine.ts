/**
 * WAIDES KI BACKTEST ENGINE
 * Runs Waides strategy logic on historical candles to measure performance
 */

import { waidesKIHistoricalDataLoader } from './historicalDataLoader.js';
import { waidesKIOrderSimulator } from './orderManager.js';
import { waidesKIFullEngine } from './waidesKIFullEngine.js';

interface CandleData {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  symbol: string;
  interval: string;
}

interface BacktestConfig {
  symbol: string;
  interval: string;
  startingBalance: number;
  lookbackPeriod: number;
  strategy: 'waides_full' | 'oracle_trend' | 'custom';
  stopLoss?: number;
  takeProfit?: number;
  maxPosition?: number;
}

interface BacktestResult {
  config: BacktestConfig;
  performance: {
    totalTrades: number;
    winRate: number;
    totalReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    profitFactor: number;
    avgTradeReturn: number;
    bestTrade: number;
    worstTrade: number;
  };
  trades: BacktestTrade[];
  equity: EquityPoint[];
  statistics: BacktestStatistics;
  timeRange: {
    start: Date;
    end: Date;
    duration: string;
  };
}

interface BacktestTrade {
  id: string;
  entryTime: Date;
  exitTime?: Date;
  symbol: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  pnl?: number;
  pnlPercent?: number;
  duration?: number;
  reason: string;
  confidence: number;
}

interface EquityPoint {
  time: Date;
  balance: number;
  drawdown: number;
  trades: number;
}

interface BacktestStatistics {
  totalCandles: number;
  tradingDays: number;
  avgTradesPerDay: number;
  longestWinStreak: number;
  longestLossStreak: number;
  largestWin: number;
  largestLoss: number;
  avgWinAmount: number;
  avgLossAmount: number;
  winLossRatio: number;
  calmarRatio: number;
}

export class WaidesKIBacktestEngine {
  private isRunning: boolean = false;
  private currentBacktest: string | null = null;

  constructor() {
    console.log('🧪 Waides KI Backtest Engine initialized');
  }

  /**
   * Run comprehensive backtest
   */
  async runBacktest(config: BacktestConfig): Promise<BacktestResult> {
    console.log(`🚀 Starting backtest: ${config.symbol} ${config.interval} with ${config.strategy} strategy`);
    
    this.isRunning = true;
    this.currentBacktest = `${config.symbol}_${Date.now()}`;

    try {
      // Load historical data
      const historicalData = await waidesKIHistoricalDataLoader.loadHistoricalData({
        symbol: config.symbol,
        interval: config.interval,
        limit: 1000
      });

      if (historicalData.length < config.lookbackPeriod + 10) {
        throw new Error(`Insufficient historical data: ${historicalData.length} candles available, ${config.lookbackPeriod + 10} required`);
      }

      // Reset simulator with starting balance
      waidesKIOrderSimulator.reset(config.startingBalance);

      // Initialize tracking variables
      const trades: BacktestTrade[] = [];
      const equity: EquityPoint[] = [];
      let currentPosition: BacktestTrade | null = null;
      let peakBalance = config.startingBalance;
      let maxDrawdown = 0;

      console.log(`📊 Processing ${historicalData.length} historical candles...`);

      // Process each candle
      for (let i = config.lookbackPeriod; i < historicalData.length; i++) {
        const currentCandle = historicalData[i];
        const lookbackWindow = historicalData.slice(i - config.lookbackPeriod, i);
        
        // Generate trading signal
        const signal = await this.generateTradingSignal(lookbackWindow, currentCandle, config);
        
        // Execute trades based on signal
        if (signal.action !== 'HOLD' && signal.confidence > 0.6) {
          const tradeResult = await this.executeTrade(signal, currentCandle, config);
          
          if (tradeResult) {
            if (currentPosition && signal.action !== currentPosition.side) {
              // Close existing position
              await this.closePosition(currentPosition, currentCandle, 'Signal Change');
              trades.push(currentPosition);
              currentPosition = null;
            }
            
            if (!currentPosition) {
              // Open new position
              currentPosition = tradeResult;
            }
          }
        }

        // Check stop loss / take profit
        if (currentPosition) {
          const exitSignal = this.checkExitConditions(currentPosition, currentCandle, config);
          if (exitSignal) {
            await this.closePosition(currentPosition, currentCandle, exitSignal);
            trades.push(currentPosition);
            currentPosition = null;
          }
        }

        // Update equity curve
        const currentBalance = waidesKIOrderSimulator.getBalance().total_value_usdt;
        if (currentBalance > peakBalance) {
          peakBalance = currentBalance;
        }
        
        const drawdown = ((peakBalance - currentBalance) / peakBalance) * 100;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }

        equity.push({
          time: currentCandle.time,
          balance: currentBalance,
          drawdown: drawdown,
          trades: trades.length
        });
      }

      // Close any remaining position
      if (currentPosition) {
        const lastCandle = historicalData[historicalData.length - 1];
        await this.closePosition(currentPosition, lastCandle, 'Backtest End');
        trades.push(currentPosition);
      }

      // Calculate performance metrics
      const performance = this.calculatePerformance(trades, config.startingBalance, maxDrawdown);
      const statistics = this.calculateStatistics(trades, historicalData);

      const result: BacktestResult = {
        config,
        performance,
        trades,
        equity,
        statistics,
        timeRange: {
          start: historicalData[0].time,
          end: historicalData[historicalData.length - 1].time,
          duration: this.formatDuration(historicalData[0].time, historicalData[historicalData.length - 1].time)
        }
      };

      console.log(`✅ Backtest completed: ${trades.length} trades, ${performance.winRate.toFixed(1)}% win rate, ${performance.totalReturn.toFixed(2)}% return`);
      
      this.isRunning = false;
      this.currentBacktest = null;
      
      return result;
    } catch (error) {
      this.isRunning = false;
      this.currentBacktest = null;
      console.error('❌ Backtest failed:', error);
      throw error;
    }
  }

  /**
   * Generate trading signal using specified strategy
   */
  private async generateTradingSignal(
    window: CandleData[], 
    currentCandle: CandleData, 
    config: BacktestConfig
  ): Promise<{ action: 'BUY' | 'SELL' | 'HOLD'; confidence: number; reason: string }> {
    
    switch (config.strategy) {
      case 'waides_full':
        return this.generateWaidesFullSignal(window, currentCandle);
      
      case 'oracle_trend':
        return this.generateOracleTrendSignal(window, currentCandle);
      
      case 'custom':
        return this.generateCustomSignal(window, currentCandle);
      
      default:
        return { action: 'HOLD', confidence: 0, reason: 'Unknown strategy' };
    }
  }

  /**
   * Generate signal using Waides Full Engine logic
   */
  private async generateWaidesFullSignal(
    window: CandleData[], 
    currentCandle: CandleData
  ): Promise<{ action: 'BUY' | 'SELL' | 'HOLD'; confidence: number; reason: string }> {
    
    try {
      // Calculate technical indicators from window
      const prices = window.map(c => c.close);
      const volumes = window.map(c => c.volume);
      
      // Simple trend detection
      const sma20 = this.calculateSMA(prices.slice(-20));
      const sma50 = this.calculateSMA(prices.slice(-50));
      const rsi = this.calculateRSI(prices.slice(-14));
      const volumeAvg = volumes.slice(-10).reduce((a, b) => a + b, 0) / 10;
      
      const currentPrice = currentCandle.close;
      const currentVolume = currentCandle.volume;
      
      let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
      let confidence = 0;
      let reason = 'No clear signal';
      
      // Bullish conditions
      if (currentPrice > sma20 && sma20 > sma50 && rsi < 70 && currentVolume > volumeAvg * 1.2) {
        action = 'BUY';
        confidence = Math.min(0.8, (currentPrice - sma20) / sma20 + 0.5);
        reason = 'Bullish trend with volume confirmation';
      }
      // Bearish conditions
      else if (currentPrice < sma20 && sma20 < sma50 && rsi > 30 && currentVolume > volumeAvg * 1.2) {
        action = 'SELL';
        confidence = Math.min(0.8, (sma20 - currentPrice) / sma20 + 0.5);
        reason = 'Bearish trend with volume confirmation';
      }
      
      return { action, confidence, reason };
    } catch (error) {
      console.error('Error generating Waides Full signal:', error);
      return { action: 'HOLD', confidence: 0, reason: 'Signal generation error' };
    }
  }

  /**
   * Generate signal using Oracle trend detection
   */
  private generateOracleTrendSignal(
    window: CandleData[], 
    currentCandle: CandleData
  ): Promise<{ action: 'BUY' | 'SELL' | 'HOLD'; confidence: number; reason: string }> {
    
    const prices = window.map(c => c.close);
    const trend = this.detectTrend(prices);
    
    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 0;
    let reason = 'Neutral trend';
    
    if (trend.direction === 'up' && trend.strength > 0.6) {
      action = 'BUY';
      confidence = trend.strength;
      reason = `Strong uptrend detected (${(trend.strength * 100).toFixed(1)}%)`;
    } else if (trend.direction === 'down' && trend.strength > 0.6) {
      action = 'SELL';
      confidence = trend.strength;
      reason = `Strong downtrend detected (${(trend.strength * 100).toFixed(1)}%)`;
    }
    
    return Promise.resolve({ action, confidence, reason });
  }

  /**
   * Generate signal using custom logic
   */
  private generateCustomSignal(
    window: CandleData[], 
    currentCandle: CandleData
  ): Promise<{ action: 'BUY' | 'SELL' | 'HOLD'; confidence: number; reason: string }> {
    
    // Simple mean reversion strategy
    const prices = window.map(c => c.close);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const std = Math.sqrt(prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length);
    
    const currentPrice = currentCandle.close;
    const zScore = (currentPrice - mean) / std;
    
    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 0;
    let reason = 'Price within normal range';
    
    if (zScore < -2) {
      action = 'BUY';
      confidence = Math.min(0.9, Math.abs(zScore) / 3);
      reason = `Oversold condition (Z-score: ${zScore.toFixed(2)})`;
    } else if (zScore > 2) {
      action = 'SELL';
      confidence = Math.min(0.9, Math.abs(zScore) / 3);
      reason = `Overbought condition (Z-score: ${zScore.toFixed(2)})`;
    }
    
    return Promise.resolve({ action, confidence, reason });
  }

  /**
   * Execute trade based on signal
   */
  private async executeTrade(
    signal: { action: 'BUY' | 'SELL' | 'HOLD'; confidence: number; reason: string },
    candle: CandleData,
    config: BacktestConfig
  ): Promise<BacktestTrade | null> {
    
    try {
      const balance = waidesKIOrderSimulator.getBalance();
      const tradeAmount = Math.min(balance.usdt * 0.1, config.maxPosition || 1000); // Risk 10% per trade
      
      if (signal.action === 'BUY' && tradeAmount > 10) {
        const result = await waidesKIOrderSimulator.buy(config.symbol, tradeAmount);
        
        if (result.success) {
          return {
            id: result.id,
            entryTime: candle.time,
            symbol: config.symbol,
            side: 'BUY',
            entryPrice: candle.close,
            quantity: result.quantity,
            reason: signal.reason,
            confidence: signal.confidence
          };
        }
      } else if (signal.action === 'SELL') {
        // For backtesting, we'll simulate short selling by tracking negative positions
        return {
          id: `SHORT_${Date.now()}`,
          entryTime: candle.time,
          symbol: config.symbol,
          side: 'SELL',
          entryPrice: candle.close,
          quantity: tradeAmount / candle.close,
          reason: signal.reason,
          confidence: signal.confidence
        };
      }
    } catch (error) {
      console.error('Error executing trade:', error);
    }
    
    return null;
  }

  /**
   * Check exit conditions for open position
   */
  private checkExitConditions(
    position: BacktestTrade,
    currentCandle: CandleData,
    config: BacktestConfig
  ): string | null {
    
    const currentPrice = currentCandle.close;
    const entryPrice = position.entryPrice;
    
    // Calculate P&L percentage
    const pnlPercent = position.side === 'BUY' 
      ? ((currentPrice - entryPrice) / entryPrice) * 100
      : ((entryPrice - currentPrice) / entryPrice) * 100;
    
    // Stop loss check
    if (config.stopLoss && pnlPercent <= -config.stopLoss) {
      return 'Stop Loss';
    }
    
    // Take profit check
    if (config.takeProfit && pnlPercent >= config.takeProfit) {
      return 'Take Profit';
    }
    
    // Time-based exit (holding period > 24 hours for testing)
    const holdingTime = currentCandle.time.getTime() - position.entryTime.getTime();
    if (holdingTime > 24 * 60 * 60 * 1000) {
      return 'Time Exit';
    }
    
    return null;
  }

  /**
   * Close open position
   */
  private async closePosition(
    position: BacktestTrade,
    exitCandle: CandleData,
    reason: string
  ): Promise<void> {
    
    position.exitTime = exitCandle.time;
    position.exitPrice = exitCandle.close;
    position.duration = exitCandle.time.getTime() - position.entryTime.getTime();
    
    // Calculate P&L
    if (position.side === 'BUY') {
      position.pnl = (position.exitPrice - position.entryPrice) * position.quantity;
      position.pnlPercent = ((position.exitPrice - position.entryPrice) / position.entryPrice) * 100;
      
      // Execute sell in simulator
      try {
        await waidesKIOrderSimulator.sell(position.symbol, position.quantity);
      } catch (error) {
        console.error('Error closing long position:', error);
      }
    } else {
      // Short position
      position.pnl = (position.entryPrice - position.exitPrice) * position.quantity;
      position.pnlPercent = ((position.entryPrice - position.exitPrice) / position.entryPrice) * 100;
    }
    
    position.reason += ` | Exit: ${reason}`;
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformance(
    trades: BacktestTrade[],
    startingBalance: number,
    maxDrawdown: number
  ): BacktestResult['performance'] {
    
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalReturn: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        profitFactor: 0,
        avgTradeReturn: 0,
        bestTrade: 0,
        worstTrade: 0
      };
    }

    const completedTrades = trades.filter(t => t.pnl !== undefined);
    const wins = completedTrades.filter(t => t.pnl! > 0);
    const losses = completedTrades.filter(t => t.pnl! < 0);
    
    const totalPnl = completedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalReturn = (totalPnl / startingBalance) * 100;
    
    const winRate = completedTrades.length > 0 ? (wins.length / completedTrades.length) * 100 : 0;
    
    const grossProfit = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
    
    const returns = completedTrades.map(t => (t.pnlPercent || 0) / 100);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const returnStd = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
    const sharpeRatio = returnStd > 0 ? (avgReturn / returnStd) * Math.sqrt(252) : 0;
    
    return {
      totalTrades: completedTrades.length,
      winRate,
      totalReturn,
      maxDrawdown,
      sharpeRatio,
      profitFactor,
      avgTradeReturn: avgReturn * 100,
      bestTrade: completedTrades.length > 0 ? Math.max(...completedTrades.map(t => t.pnlPercent || 0)) : 0,
      worstTrade: completedTrades.length > 0 ? Math.min(...completedTrades.map(t => t.pnlPercent || 0)) : 0
    };
  }

  /**
   * Calculate additional statistics
   */
  private calculateStatistics(trades: BacktestTrade[], historicalData: CandleData[]): BacktestStatistics {
    const completedTrades = trades.filter(t => t.pnl !== undefined);
    const wins = completedTrades.filter(t => t.pnl! > 0);
    const losses = completedTrades.filter(t => t.pnl! < 0);
    
    // Calculate streaks
    let currentStreak = 0;
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let isWinStreak = false;
    
    for (const trade of completedTrades) {
      const isWin = (trade.pnl || 0) > 0;
      
      if (isWin === isWinStreak) {
        currentStreak++;
      } else {
        if (isWinStreak) {
          longestWinStreak = Math.max(longestWinStreak, currentStreak);
        } else {
          longestLossStreak = Math.max(longestLossStreak, currentStreak);
        }
        currentStreak = 1;
        isWinStreak = isWin;
      }
    }
    
    // Update final streak
    if (isWinStreak) {
      longestWinStreak = Math.max(longestWinStreak, currentStreak);
    } else {
      longestLossStreak = Math.max(longestLossStreak, currentStreak);
    }
    
    const tradingDays = Math.ceil((historicalData[historicalData.length - 1].time.getTime() - historicalData[0].time.getTime()) / (24 * 60 * 60 * 1000));
    
    return {
      totalCandles: historicalData.length,
      tradingDays,
      avgTradesPerDay: tradingDays > 0 ? completedTrades.length / tradingDays : 0,
      longestWinStreak,
      longestLossStreak,
      largestWin: wins.length > 0 ? Math.max(...wins.map(t => t.pnl!)) : 0,
      largestLoss: losses.length > 0 ? Math.min(...losses.map(t => t.pnl!)) : 0,
      avgWinAmount: wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl!, 0) / wins.length : 0,
      avgLossAmount: losses.length > 0 ? losses.reduce((sum, t) => sum + t.pnl!, 0) / losses.length : 0,
      winLossRatio: losses.length > 0 && wins.length > 0 ? (wins.reduce((sum, t) => sum + t.pnl!, 0) / wins.length) / Math.abs(losses.reduce((sum, t) => sum + t.pnl!, 0) / losses.length) : 0,
      calmarRatio: 0 // Placeholder for Calmar ratio calculation
    };
  }

  /**
   * Helper methods for technical analysis
   */
  private calculateSMA(prices: number[]): number {
    return prices.reduce((sum, price) => sum + price, 0) / prices.length;
  }

  private calculateRSI(prices: number[]): number {
    if (prices.length < 2) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }
    
    const avgGain = gains / (prices.length - 1);
    const avgLoss = losses / (prices.length - 1);
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private detectTrend(prices: number[]): { direction: 'up' | 'down' | 'sideways'; strength: number } {
    if (prices.length < 10) return { direction: 'sideways', strength: 0 };
    
    const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
    const secondHalf = prices.slice(Math.floor(prices.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, p) => sum + p, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p, 0) / secondHalf.length;
    
    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
    const strength = Math.min(Math.abs(changePercent) / 5, 1); // Normalize to 0-1
    
    if (changePercent > 1) {
      return { direction: 'up', strength };
    } else if (changePercent < -1) {
      return { direction: 'down', strength };
    } else {
      return { direction: 'sideways', strength: 0 };
    }
  }

  private formatDuration(start: Date, end: Date): string {
    const diffMs = end.getTime() - start.getTime();
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) {
      return `${days} days, ${hours} hours`;
    } else {
      return `${hours} hours`;
    }
  }

  /**
   * Get current backtest status
   */
  getStatus(): { isRunning: boolean; currentBacktest: string | null } {
    return {
      isRunning: this.isRunning,
      currentBacktest: this.currentBacktest
    };
  }

  /**
   * Get supported strategies
   */
  getSupportedStrategies(): string[] {
    return ['waides_full', 'oracle_trend', 'custom'];
  }
}

// Global instance
export const waidesKIBacktestEngine = new WaidesKIBacktestEngine();