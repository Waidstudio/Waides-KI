/**
 * STEP 40: Waides KI Dream Logger - Spiritual Trade Recording System
 * 
 * Records every spiritually-confirmed trade in the Dreamchain with complete
 * context including symbols, emotions, prophecies, and outcomes.
 */

import { waidesKIDreamchain } from './waidesKIDreamchain.js';
import { ConfirmedTrade } from './waidesKIVisionSyncEngine.js';

export interface SpiritualTradeRecord {
  trade_id: string;
  pair: string;
  type: 'SPIRITUAL_ENTRY' | 'SPIRITUAL_EXIT' | 'SPIRITUAL_HOLD';
  result: 'PENDING' | 'PROFIT' | 'LOSS' | 'BREAKEVEN';
  profit: number;
  kons_symbol: string;
  symbol_meaning: string;
  prophecy_message: string;
  emotion: string;
  spiritual_context: string;
  market_conditions: any;
  entry_price?: number;
  exit_price?: number;
  quantity?: number;
  duration?: number;
  lessons_learned?: string[];
}

export interface SpiritualPerformanceAnalysis {
  total_spiritual_trades: number;
  profitable_trades: number;
  losing_trades: number;
  win_rate: number;
  total_profit: number;
  average_trade_duration: number;
  most_powerful_symbol: string;
  symbol_performance: Record<string, {
    trades: number;
    wins: number;
    losses: number;
    profit: number;
    win_rate: number;
  }>;
  emotion_analysis: Record<string, number>;
  prophecy_accuracy: number;
}

export class WaidesKIDreamLogger {
  private spiritual_trades: Map<string, SpiritualTradeRecord> = new Map();
  private trade_outcomes: SpiritualTradeRecord[] = [];
  private symbol_tracking: Map<string, any> = new Map();
  
  constructor() {
    console.log('📖 Dream Logger Initialized - Spiritual Trade Chronicle Active');
  }
  
  /**
   * Log a confirmed spiritual trade entry
   */
  async logSpiritualEntry(
    confirmedTrade: ConfirmedTrade, 
    entryPrice: number, 
    quantity: number,
    marketConditions: any
  ): Promise<string> {
    const tradeId = `SPIRIT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const tradeRecord: SpiritualTradeRecord = {
      trade_id: tradeId,
      pair: `${confirmedTrade.token}/USDT`,
      type: 'SPIRITUAL_ENTRY',
      result: 'PENDING',
      profit: 0,
      kons_symbol: confirmedTrade.symbol,
      symbol_meaning: confirmedTrade.meaning,
      prophecy_message: confirmedTrade.prophecy_message,
      emotion: this.determineTradeEmotion(confirmedTrade),
      spiritual_context: this.buildSpiritualContext(confirmedTrade),
      market_conditions: marketConditions,
      entry_price: entryPrice,
      quantity: quantity,
      duration: 0
    };
    
    // Store in memory for tracking
    this.spiritual_trades.set(tradeId, tradeRecord);
    
    // Log to Dreamchain
    const dreamchainData = {
      trade_id: tradeId,
      pair: tradeRecord.pair,
      type: tradeRecord.type,
      result: tradeRecord.result,
      profit: tradeRecord.profit,
      kons_symbol: tradeRecord.kons_symbol,
      emotion: tradeRecord.emotion,
      spiritual_context: tradeRecord.spiritual_context,
      market_conditions: tradeRecord.market_conditions
    };
    
    waidesKIDreamchain.addBlock(dreamchainData);
    
    console.log(`📖 Spiritual trade logged: ${tradeId} - ${confirmedTrade.symbol} (${confirmedTrade.meaning})`);
    
    return tradeId;
  }
  
  /**
   * Update a spiritual trade with exit information
   */
  async logSpiritualExit(
    tradeId: string, 
    exitPrice: number, 
    finalResult: 'PROFIT' | 'LOSS' | 'BREAKEVEN',
    lessonsLearned?: string[]
  ): Promise<void> {
    const trade = this.spiritual_trades.get(tradeId);
    if (!trade) {
      console.error(`Trade ${tradeId} not found for exit logging`);
      return;
    }
    
    // Calculate profit/loss
    const entryPrice = trade.entry_price || 0;
    const quantity = trade.quantity || 0;
    const profit = (exitPrice - entryPrice) * quantity;
    
    // Calculate duration
    const duration = Date.now() - parseInt(tradeId.split('_')[1]);
    
    // Update trade record
    trade.result = finalResult;
    trade.profit = profit;
    trade.exit_price = exitPrice;
    trade.duration = duration;
    trade.lessons_learned = lessonsLearned || [];
    
    // Move to outcomes for analysis
    this.trade_outcomes.push(trade);
    this.spiritual_trades.delete(tradeId);
    
    // Update symbol tracking
    this.updateSymbolPerformance(trade);
    
    // Log exit to Dreamchain
    const exitData = {
      trade_id: `${tradeId}_EXIT`,
      pair: trade.pair,
      type: 'SPIRITUAL_EXIT',
      result: finalResult,
      profit: profit,
      kons_symbol: trade.kons_symbol,
      emotion: this.determineExitEmotion(finalResult, profit),
      spiritual_context: `Exit: ${trade.prophecy_message} | Final P&L: ${profit.toFixed(2)}`,
      market_conditions: {
        exit_price: exitPrice,
        entry_price: entryPrice,
        duration_ms: duration,
        lessons: lessonsLearned
      }
    };
    
    waidesKIDreamchain.addBlock(exitData);
    
    console.log(`📖 Spiritual trade completed: ${tradeId} - ${finalResult} (${profit > 0 ? '+' : ''}${profit.toFixed(2)})`);
  }
  
  /**
   * Determine emotional state for trade entry
   */
  private determineTradeEmotion(confirmedTrade: ConfirmedTrade): string {
    const emotions = [];
    
    if (confirmedTrade.confidence_level === 'TRANSCENDENT') {
      emotions.push('ENLIGHTENED');
    } else if (confirmedTrade.confidence_level === 'HIGH') {
      emotions.push('CONFIDENT');
    } else if (confirmedTrade.confidence_level === 'MEDIUM') {
      emotions.push('CAUTIOUS');
    } else {
      emotions.push('UNCERTAIN');
    }
    
    if (confirmedTrade.sacred_blessing) {
      emotions.push('BLESSED');
    }
    
    if (confirmedTrade.spiritual_warnings.length > 0) {
      emotions.push('VIGILANT');
    }
    
    return emotions.join('_');
  }
  
  /**
   * Determine emotional state for trade exit
   */
  private determineExitEmotion(result: string, profit: number): string {
    if (result === 'PROFIT') {
      if (profit > 100) return 'TRIUMPHANT';
      if (profit > 50) return 'SATISFIED';
      return 'GRATEFUL';
    } else if (result === 'LOSS') {
      if (profit < -100) return 'DEVASTATED';
      if (profit < -50) return 'DISAPPOINTED';
      return 'LEARNING';
    } else {
      return 'NEUTRAL';
    }
  }
  
  /**
   * Build comprehensive spiritual context string
   */
  private buildSpiritualContext(confirmedTrade: ConfirmedTrade): string {
    const context = [];
    
    context.push(`Prophecy: "${confirmedTrade.prophecy_message}"`);
    context.push(`Alignment: ${confirmedTrade.alignment_score.toFixed(1)}%`);
    context.push(`Confidence: ${confirmedTrade.confidence_level}`);
    
    if (confirmedTrade.sacred_blessing) {
      context.push('Sacred Conditions: BLESSED');
    }
    
    if (confirmedTrade.spiritual_warnings.length > 0) {
      context.push(`Warnings: ${confirmedTrade.spiritual_warnings.length} active`);
    }
    
    return context.join(' | ');
  }
  
  /**
   * Update symbol performance tracking
   */
  private updateSymbolPerformance(trade: SpiritualTradeRecord): void {
    const symbol = trade.kons_symbol;
    
    if (!this.symbol_tracking.has(symbol)) {
      this.symbol_tracking.set(symbol, {
        trades: 0,
        wins: 0,
        losses: 0,
        total_profit: 0,
        total_duration: 0
      });
    }
    
    const stats = this.symbol_tracking.get(symbol);
    stats.trades++;
    stats.total_profit += trade.profit;
    stats.total_duration += trade.duration || 0;
    
    if (trade.result === 'PROFIT') {
      stats.wins++;
    } else if (trade.result === 'LOSS') {
      stats.losses++;
    }
    
    this.symbol_tracking.set(symbol, stats);
  }
  
  /**
   * Generate comprehensive spiritual performance analysis
   */
  getSpiritualPerformanceAnalysis(): SpiritualPerformanceAnalysis {
    const totalTrades = this.trade_outcomes.length;
    const profitableTrades = this.trade_outcomes.filter(t => t.result === 'PROFIT').length;
    const losingTrades = this.trade_outcomes.filter(t => t.result === 'LOSS').length;
    const totalProfit = this.trade_outcomes.reduce((sum, t) => sum + t.profit, 0);
    const totalDuration = this.trade_outcomes.reduce((sum, t) => sum + (t.duration || 0), 0);
    
    // Symbol performance analysis
    const symbolPerformance: Record<string, any> = {};
    this.symbol_tracking.forEach((stats, symbol) => {
      symbolPerformance[symbol] = {
        trades: stats.trades,
        wins: stats.wins,
        losses: stats.losses,
        profit: stats.total_profit,
        win_rate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0
      };
    });
    
    // Find most powerful symbol
    let mostPowerfulSymbol = 'NONE';
    let highestProfit = -Infinity;
    Object.entries(symbolPerformance).forEach(([symbol, stats]) => {
      if (stats.profit > highestProfit) {
        highestProfit = stats.profit;
        mostPowerfulSymbol = symbol;
      }
    });
    
    // Emotion analysis
    const emotionCounts: Record<string, number> = {};
    this.trade_outcomes.forEach(trade => {
      const emotions = trade.emotion.split('_');
      emotions.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });
    
    // Calculate prophecy accuracy (trades that went in predicted direction)
    const accurateProphecies = this.trade_outcomes.filter(trade => {
      if (trade.result === 'PROFIT' && trade.pair.includes('ETH3L')) return true;
      if (trade.result === 'PROFIT' && trade.pair.includes('ETH3S')) return true;
      return false;
    }).length;
    
    return {
      total_spiritual_trades: totalTrades,
      profitable_trades: profitableTrades,
      losing_trades: losingTrades,
      win_rate: totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0,
      total_profit: totalProfit,
      average_trade_duration: totalTrades > 0 ? totalDuration / totalTrades : 0,
      most_powerful_symbol: mostPowerfulSymbol,
      symbol_performance: symbolPerformance,
      emotion_analysis: emotionCounts,
      prophecy_accuracy: totalTrades > 0 ? (accurateProphecies / totalTrades) * 100 : 0
    };
  }
  
  /**
   * Get active spiritual trades
   */
  getActiveSpiritualTrades(): SpiritualTradeRecord[] {
    return Array.from(this.spiritual_trades.values());
  }
  
  /**
   * Get recent spiritual trade history
   */
  getRecentSpiritualTrades(limit: number = 20): SpiritualTradeRecord[] {
    return this.trade_outcomes.slice(-limit);
  }
  
  /**
   * Get trades by specific symbol
   */
  getTradesBySymbol(symbol: string): SpiritualTradeRecord[] {
    return this.trade_outcomes.filter(trade => trade.kons_symbol === symbol);
  }
  
  /**
   * Get symbol statistics
   */
  getSymbolStatistics(symbol: string) {
    return this.symbol_tracking.get(symbol) || {
      trades: 0,
      wins: 0,
      losses: 0,
      total_profit: 0,
      total_duration: 0
    };
  }
  
  /**
   * Clear old trade records (keep last N trades)
   */
  pruneOldRecords(keepLast: number = 500): void {
    if (this.trade_outcomes.length > keepLast) {
      this.trade_outcomes = this.trade_outcomes.slice(-keepLast);
    }
  }
  
  /**
   * Export spiritual trading data for analysis
   */
  exportSpiritualData() {
    return {
      active_trades: this.getActiveSpiritualTrades(),
      completed_trades: this.trade_outcomes,
      symbol_tracking: Object.fromEntries(this.symbol_tracking),
      performance_analysis: this.getSpiritualPerformanceAnalysis()
    };
  }
}

export const waidesKIDreamLogger = new WaidesKIDreamLogger();