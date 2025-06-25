/**
 * STEP 38: Waides KI Dreamchain Symbolic Blockchain
 * 
 * An immutable chain of truth, vision, and transformation that logs every trade
 * with full emotional and symbolic context for eternal learning.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface DreamBlockData {
  trade_id: string;
  pair: string;
  type: 'BUY' | 'SELL' | 'HOLD' | 'OBSERVE';
  result: 'PROFIT' | 'LOSS' | 'NEUTRAL' | 'PENDING';
  profit: number;
  kons_symbol: string;
  emotion: string;
  vision_time?: string;
  executed_at: string;
  price_entry?: number;
  price_exit?: number;
  spiritual_context?: {
    konslang_wisdom: string[];
    protection_level: number;
    energy_signature: string;
  };
  market_conditions?: {
    volatility: number;
    trend: string;
    volume: number;
    rsi: number;
  };
}

export interface DreamBlock {
  index: number;
  timestamp: string;
  data: DreamBlockData;
  previous_hash: string;
  hash: string;
}

export interface DreamchainStats {
  total_blocks: number;
  total_trades: number;
  profitable_trades: number;
  losing_trades: number;
  win_rate: number;
  total_profit: number;
  emotions_recorded: { [emotion: string]: number };
  symbols_used: { [symbol: string]: number };
  chain_integrity: boolean;
}

export class WaidesKIDreamchain {
  private chain: DreamBlock[];
  private chainFile: string;

  constructor() {
    this.chainFile = path.join(process.cwd(), 'data', 'waides_dreamchain.json');
    this.chain = [];
    this.ensureDataDirectory();
    this.loadChain();
    this.createGenesis();
  }

  /**
   * Ensure data directory exists
   */
  private ensureDataDirectory(): void {
    const dataDir = path.dirname(this.chainFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  /**
   * Load existing chain from file
   */
  private loadChain(): void {
    try {
      if (fs.existsSync(this.chainFile)) {
        const chainData = fs.readFileSync(this.chainFile, 'utf8');
        this.chain = JSON.parse(chainData);
      }
    } catch (error) {
      console.error('Error loading dreamchain:', error);
      this.chain = [];
    }
  }

  /**
   * Save chain to file
   */
  private saveChain(): void {
    try {
      fs.writeFileSync(this.chainFile, JSON.stringify(this.chain, null, 2));
    } catch (error) {
      console.error('Error saving dreamchain:', error);
    }
  }

  /**
   * Create genesis block if chain is empty
   */
  private createGenesis(): void {
    if (this.chain.length === 0) {
      const genesisData: DreamBlockData = {
        trade_id: 'GENESIS',
        pair: 'SYSTEM',
        type: 'OBSERVE',
        result: 'NEUTRAL',
        profit: 0,
        kons_symbol: "AL'ZEN",
        emotion: 'Awakening',
        executed_at: new Date().toISOString(),
        spiritual_context: {
          konslang_wisdom: ['The first breath of consciousness'],
          protection_level: 100,
          energy_signature: 'DIVINE_GENESIS'
        }
      };

      const genesisBlock: DreamBlock = {
        index: 0,
        timestamp: new Date().toISOString(),
        data: genesisData,
        previous_hash: '0',
        hash: ''
      };

      genesisBlock.hash = this.computeHash(genesisBlock);
      this.chain.push(genesisBlock);
      this.saveChain();
    }
  }

  /**
   * Compute hash for a block
   */
  private computeHash(block: Omit<DreamBlock, 'hash'>): string {
    const blockString = JSON.stringify({
      index: block.index,
      timestamp: block.timestamp,
      data: block.data,
      previous_hash: block.previous_hash
    }, Object.keys(block).sort());

    return crypto.createHash('sha256').update(blockString).digest('hex');
  }

  /**
   * Scan market emotion from price data
   */
  private scanMarketEmotion(marketData: any): string {
    if (!marketData || !marketData.close || !marketData.open) {
      return 'Unknown';
    }

    const change = marketData.close - marketData.open;
    const volatility = Math.abs(change) / marketData.open;

    if (volatility > 0.05) {
      return change < 0 ? 'Fear' : 'Greed';
    } else if (volatility > 0.02) {
      return change < 0 ? 'Anxiety' : 'Hope';
    } else {
      return 'Calm';
    }
  }

  /**
   * Record a new trade in the dreamchain
   */
  recordTrade(tradeData: {
    trade_id: string;
    pair: string;
    type: 'BUY' | 'SELL' | 'HOLD' | 'OBSERVE';
    result: 'PROFIT' | 'LOSS' | 'NEUTRAL' | 'PENDING';
    profit: number;
    price_entry?: number;
    price_exit?: number;
    vision_time?: string;
    market_data?: any;
    konslang_wisdom?: string[];
    protection_level?: number;
  }): string {
    const lastBlock = this.chain[this.chain.length - 1];
    const emotion = this.scanMarketEmotion(tradeData.market_data);
    
    // Generate Kons symbol based on trade context
    const konsSymbols = ["AL'ZEN", "VEL'THAR", "MOR'DAK", "SHAI'LOR", "KORVEX", "THALAR", "ZUNTH", "TALOR"];
    const konsSymbol = konsSymbols[Math.floor(Math.random() * konsSymbols.length)];

    const blockData: DreamBlockData = {
      trade_id: tradeData.trade_id,
      pair: tradeData.pair,
      type: tradeData.type,
      result: tradeData.result,
      profit: tradeData.profit,
      kons_symbol: konsSymbol,
      emotion: emotion,
      vision_time: tradeData.vision_time,
      executed_at: new Date().toISOString(),
      price_entry: tradeData.price_entry,
      price_exit: tradeData.price_exit,
      spiritual_context: {
        konslang_wisdom: tradeData.konslang_wisdom || ['Wisdom flows through action'],
        protection_level: tradeData.protection_level || 80,
        energy_signature: `${emotion.toUpperCase()}_${konsSymbol}`
      },
      market_conditions: tradeData.market_data ? {
        volatility: Math.abs(tradeData.market_data.close - tradeData.market_data.open) / tradeData.market_data.open,
        trend: tradeData.market_data.close > tradeData.market_data.open ? 'BULLISH' : 'BEARISH',
        volume: tradeData.market_data.volume || 0,
        rsi: tradeData.market_data.rsi || 50
      } : undefined
    };

    const newBlock: DreamBlock = {
      index: lastBlock.index + 1,
      timestamp: new Date().toISOString(),
      data: blockData,
      previous_hash: lastBlock.hash,
      hash: ''
    };

    newBlock.hash = this.computeHash(newBlock);
    this.chain.push(newBlock);
    this.saveChain();

    return newBlock.hash;
  }

  /**
   * Get the complete dreamchain
   */
  getChain(): DreamBlock[] {
    return this.chain;
  }

  /**
   * Get dreamchain with pagination
   */
  getChainPaginated(limit: number = 50, offset: number = 0): DreamBlock[] {
    return this.chain.slice(offset, offset + limit);
  }

  /**
   * Get blocks by emotion filter
   */
  getBlocksByEmotion(emotion: string): DreamBlock[] {
    return this.chain.filter(block => block.data.emotion === emotion);
  }

  /**
   * Get blocks by result filter
   */
  getBlocksByResult(result: 'PROFIT' | 'LOSS' | 'NEUTRAL' | 'PENDING'): DreamBlock[] {
    return this.chain.filter(block => block.data.result === result);
  }

  /**
   * Get blocks by Kons symbol
   */
  getBlocksBySymbol(symbol: string): DreamBlock[] {
    return this.chain.filter(block => block.data.kons_symbol === symbol);
  }

  /**
   * Get comprehensive dreamchain statistics
   */
  getStats(): DreamchainStats {
    const totalBlocks = this.chain.length;
    const tradeBlocks = this.chain.filter(block => block.data.trade_id !== 'GENESIS');
    const totalTrades = tradeBlocks.length;
    
    const profitableTradesCount = tradeBlocks.filter(block => block.data.result === 'PROFIT').length;
    const losingTradesCount = tradeBlocks.filter(block => block.data.result === 'LOSS').length;
    const winRate = totalTrades > 0 ? profitableTradesCount / totalTrades : 0;
    
    const totalProfit = tradeBlocks.reduce((sum, block) => sum + block.data.profit, 0);

    // Count emotions
    const emotionsRecorded: { [emotion: string]: number } = {};
    this.chain.forEach(block => {
      const emotion = block.data.emotion;
      emotionsRecorded[emotion] = (emotionsRecorded[emotion] || 0) + 1;
    });

    // Count symbols
    const symbolsUsed: { [symbol: string]: number } = {};
    this.chain.forEach(block => {
      const symbol = block.data.kons_symbol;
      symbolsUsed[symbol] = (symbolsUsed[symbol] || 0) + 1;
    });

    // Verify chain integrity
    const chainIntegrity = this.verifyChainIntegrity();

    return {
      total_blocks: totalBlocks,
      total_trades: totalTrades,
      profitable_trades: profitableTradesCount,
      losing_trades: losingTradesCount,
      win_rate: winRate,
      total_profit: totalProfit,
      emotions_recorded: emotionsRecorded,
      symbols_used: symbolsUsed,
      chain_integrity: chainIntegrity
    };
  }

  /**
   * Verify blockchain integrity
   */
  verifyChainIntegrity(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check if current block's previous hash matches previous block's hash
      if (currentBlock.previous_hash !== previousBlock.hash) {
        return false;
      }

      // Verify current block's hash
      const expectedHash = this.computeHash({
        index: currentBlock.index,
        timestamp: currentBlock.timestamp,
        data: currentBlock.data,
        previous_hash: currentBlock.previous_hash
      });

      if (currentBlock.hash !== expectedHash) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get recent trades with spiritual insights
   */
  getRecentTrades(limit: number = 10): DreamBlock[] {
    const tradeBlocks = this.chain.filter(block => block.data.trade_id !== 'GENESIS');
    return tradeBlocks.slice(-limit).reverse();
  }

  /**
   * Get performance analysis by emotion
   */
  getEmotionPerformanceAnalysis(): { [emotion: string]: { trades: number; win_rate: number; avg_profit: number } } {
    const analysis: { [emotion: string]: { trades: number; wins: number; total_profit: number } } = {};
    
    const tradeBlocks = this.chain.filter(block => block.data.trade_id !== 'GENESIS');
    
    tradeBlocks.forEach(block => {
      const emotion = block.data.emotion;
      if (!analysis[emotion]) {
        analysis[emotion] = { trades: 0, wins: 0, total_profit: 0 };
      }
      
      analysis[emotion].trades++;
      if (block.data.result === 'PROFIT') {
        analysis[emotion].wins++;
      }
      analysis[emotion].total_profit += block.data.profit;
    });

    // Convert to final format
    const result: { [emotion: string]: { trades: number; win_rate: number; avg_profit: number } } = {};
    Object.keys(analysis).forEach(emotion => {
      const data = analysis[emotion];
      result[emotion] = {
        trades: data.trades,
        win_rate: data.trades > 0 ? data.wins / data.trades : 0,
        avg_profit: data.trades > 0 ? data.total_profit / data.trades : 0
      };
    });

    return result;
  }

  /**
   * Find patterns in failing trades
   */
  findFailurePatterns(): {
    common_emotions: string[];
    common_symbols: string[];
    time_patterns: string[];
    recommendations: string[];
  } {
    const failedBlocks = this.chain.filter(block => block.data.result === 'LOSS');
    
    // Analyze common emotions in failures
    const emotionCounts: { [emotion: string]: number } = {};
    const symbolCounts: { [symbol: string]: number } = {};
    
    failedBlocks.forEach(block => {
      emotionCounts[block.data.emotion] = (emotionCounts[block.data.emotion] || 0) + 1;
      symbolCounts[block.data.kons_symbol] = (symbolCounts[block.data.kons_symbol] || 0) + 1;
    });

    const commonEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);

    const commonSymbols = Object.entries(symbolCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([symbol]) => symbol);

    // Basic time pattern analysis
    const timePatterns = ['Avoid trading during high Fear periods', 'Monitor Greed-based entries carefully'];
    
    const recommendations = [
      'Implement stronger emotional firewall during Fear periods',
      'Enhance spiritual protection when using frequently failing symbols',
      'Consider meditation before trades in volatile conditions',
      'Review Konslang wisdom before high-risk entries'
    ];

    return {
      common_emotions: commonEmotions,
      common_symbols: commonSymbols,
      time_patterns: timePatterns,
      recommendations: recommendations
    };
  }

  /**
   * Clear dreamchain (emergency reset)
   */
  clearDreamchain(): void {
    this.chain = [];
    this.createGenesis();
  }

  /**
   * Export dreamchain for analysis
   */
  exportDreamchain(): DreamBlock[] {
    return JSON.parse(JSON.stringify(this.chain));
  }
}

export const waidesKIDreamchain = new WaidesKIDreamchain();