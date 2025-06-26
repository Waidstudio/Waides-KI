import { EthMonitor } from './ethMonitor.js';
import { WaidBotEngine } from './waidBotEngine.js';
import { WaidBotPro } from './waidBotPro.js';

interface MarketData {
  price: number;
  volume: number;
  change: number;
  marketCap: number;
  timestamp: number;
}

interface WaidesMemory {
  lastPrices: number[];
  lastSignals: TradeSignal[];
  gainStreak: number;
  failStreak: number;
  totalTrades: number;
  successRate: number;
  lastTradeTime: number;
  spiritualState: 'enlightened' | 'focused' | 'cautious' | 'blocked';
  learningWeight: number;
}

interface TradeSignal {
  type: 'BUY' | 'SELL' | 'HOLD' | 'SCALP';
  confidence: number;
  timestamp: number;
  market: MarketData;
  result?: TradeResult;
}

interface TradeResult {
  success: boolean;
  profit: number;
  executionTime: number;
}

interface TradeDecision {
  shouldTrade: boolean;
  type?: 'BUY' | 'SELL' | 'HOLD' | 'SCALP';
  confidence: number;
  reasoning: string;
  spiritualGuidance?: string;
}

interface WalletState {
  balance: number;
  totalProfit: number;
  activeBot: 'WaidBot' | 'WaidBotPro' | 'autonomous';
  riskLevel: 'safe' | 'moderate' | 'aggressive';
}

class WaidesKiCoreEngine {
  private memory: WaidesMemory;
  private ethMonitor: EthMonitor;
  private waidBot: WaidBotEngine;
  private waidBotPro: WaidBotPro;
  private isRunning: boolean = false;
  private engineInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.memory = {
      lastPrices: [],
      lastSignals: [],
      gainStreak: 0,
      failStreak: 0,
      totalTrades: 0,
      successRate: 0,
      lastTradeTime: 0,
      spiritualState: 'enlightened',
      learningWeight: 1.0
    };
    
    this.ethMonitor = new EthMonitor();
    this.waidBot = new WaidBotEngine();
    this.waidBotPro = new WaidBotPro();
  }

  // Core market data fetching with comprehensive analysis
  async fetchETHMarketData(): Promise<MarketData> {
    try {
      const ethData = await this.ethMonitor.fetchEthData();
      return {
        price: ethData.price,
        volume: ethData.volume || 0,
        change: ethData.priceChange24h || 0,
        marketCap: ethData.marketCap || 0,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      // Use last known data if available
      if (this.memory.lastPrices.length > 0) {
        return {
          price: this.memory.lastPrices[this.memory.lastPrices.length - 1],
          volume: 0,
          change: 0,
          marketCap: 0,
          timestamp: Date.now()
        };
      }
      throw error;
    }
  }

  // Spiritual filter for emotional trading prevention
  spiritualFilter(signal: TradeSignal, message?: string): { allowed: boolean; guidance: string } {
    const forbiddenStates = ['panic', 'greed', 'fear', 'fomo', 'revenge'];
    const lowConfidenceThreshold = 0.6;
    
    // Check message for emotional content
    if (message) {
      for (let state of forbiddenStates) {
        if (message.toLowerCase().includes(state)) {
          return {
            allowed: false,
            guidance: "🛑 The vision is clouded by emotion. Purify your heart before you act."
          };
        }
      }
    }

    // Check confidence level
    if (signal.confidence < lowConfidenceThreshold) {
      return {
        allowed: false,
        guidance: "⚠️ The signal lacks clarity. Wait for stronger conviction."
      };
    }

    // Check recent failure streak
    if (this.memory.failStreak >= 3) {
      return {
        allowed: false,
        guidance: "🔄 The spirit needs rest. Allow healing before the next move."
      };
    }

    // Check frequency (no trades within 30 minutes)
    const timeSinceLastTrade = Date.now() - this.memory.lastTradeTime;
    if (timeSinceLastTrade < 30 * 60 * 1000) {
      return {
        allowed: false,
        guidance: "⏰ Patience, young trader. Let the market breathe."
      };
    }

    return {
      allowed: true,
      guidance: "✅ The path is clear. The chart aligns with inner peace."
    };
  }

  // Advanced decision-making engine
  decideTrade(market: MarketData, wallet: WalletState): TradeDecision {
    const priceHistory = this.memory.lastPrices;
    
    if (priceHistory.length < 10) {
      return {
        shouldTrade: false,
        confidence: 0,
        reasoning: "Insufficient price history for analysis"
      };
    }

    // Calculate trend analysis
    const currentPrice = market.price;
    const price5minAgo = priceHistory[Math.max(0, priceHistory.length - 6)];
    const price15minAgo = priceHistory[Math.max(0, priceHistory.length - 16)];
    const price1hAgo = priceHistory[Math.max(0, priceHistory.length - 61)];

    const shortTrend = currentPrice > price5minAgo ? 'UP' : currentPrice < price5minAgo ? 'DOWN' : 'SIDE';
    const mediumTrend = currentPrice > price15minAgo ? 'UP' : currentPrice < price15minAgo ? 'DOWN' : 'SIDE';
    const longTrend = currentPrice > price1hAgo ? 'UP' : currentPrice < price1hAgo ? 'DOWN' : 'SIDE';

    // Calculate momentum
    const shortMomentum = ((currentPrice - price5minAgo) / price5minAgo) * 100;
    const mediumMomentum = ((currentPrice - price15minAgo) / price15minAgo) * 100;

    // Risk assessment based on wallet mode
    const riskMultiplier = wallet.riskLevel === 'safe' ? 0.5 : wallet.riskLevel === 'aggressive' ? 1.5 : 1.0;
    const botMultiplier = wallet.activeBot === 'WaidBotPro' ? 1.2 : 1.0;

    // Learning weight adjustment
    const learningAdjustment = this.memory.learningWeight;

    let confidence = 0;
    let tradeType: 'BUY' | 'SELL' | 'HOLD' | 'SCALP' = 'HOLD';
    let reasoning = '';

    // Strong upward momentum (BUY signal)
    if (shortTrend === 'UP' && mediumTrend === 'UP' && market.change > 1.0 && shortMomentum > 0.3) {
      confidence = Math.min(0.9, 0.7 + (shortMomentum / 10) * riskMultiplier * botMultiplier * learningAdjustment);
      tradeType = 'BUY';
      reasoning = `Strong upward momentum: ${shortMomentum.toFixed(2)}% in 5min, ${market.change.toFixed(2)}% in 24h`;
    }
    // Strong downward momentum (SELL signal for aggressive mode)
    else if (shortTrend === 'DOWN' && mediumTrend === 'DOWN' && market.change < -1.0 && wallet.riskLevel === 'aggressive') {
      confidence = Math.min(0.8, 0.6 + (Math.abs(shortMomentum) / 10) * riskMultiplier * botMultiplier * learningAdjustment);
      tradeType = 'SELL';
      reasoning = `Strong downward momentum: ${shortMomentum.toFixed(2)}% in 5min, ${market.change.toFixed(2)}% in 24h`;
    }
    // Sideways with high volume (SCALP signal)
    else if (shortTrend === 'SIDE' && market.volume > 15000000000 && Math.abs(shortMomentum) < 0.1) {
      confidence = Math.min(0.75, 0.5 + (market.volume / 30000000000) * riskMultiplier * botMultiplier * learningAdjustment);
      tradeType = 'SCALP';
      reasoning = `High volume consolidation: ${(market.volume / 1000000000).toFixed(1)}B volume with low volatility`;
    }
    // Conservative hold
    else {
      confidence = 0.3;
      tradeType = 'HOLD';
      reasoning = `Market conditions unclear: ${shortTrend}/${mediumTrend}/${longTrend} trend, ${market.change.toFixed(2)}% change`;
    }

    // Apply success rate adjustment
    if (this.memory.successRate > 0.7) {
      confidence *= 1.1; // Boost confidence on winning streak
    } else if (this.memory.successRate < 0.4) {
      confidence *= 0.8; // Reduce confidence on losing streak
    }

    return {
      shouldTrade: confidence > 0.6,
      type: tradeType,
      confidence,
      reasoning
    };
  }

  // Trade execution simulation
  async executeTrade(signal: TradeSignal, wallet: WalletState): Promise<TradeResult> {
    const baseAmount = wallet.balance * 0.05; // 5% of wallet per trade
    const riskAdjustedAmount = baseAmount * (signal.confidence * 2); // Scale by confidence
    
    // Simulate market impact and slippage
    const slippage = Math.random() * 0.002; // 0-0.2% slippage
    const marketImpact = riskAdjustedAmount > 1000 ? 0.001 : 0;
    
    // Simulate profit/loss based on signal type and market conditions
    let profitMultiplier = 0;
    
    switch (signal.type) {
      case 'BUY':
        profitMultiplier = signal.market.change > 0 ? 0.8 + Math.random() * 0.4 : -0.2 - Math.random() * 0.3;
        break;
      case 'SELL':
        profitMultiplier = signal.market.change < 0 ? 0.6 + Math.random() * 0.3 : -0.3 - Math.random() * 0.2;
        break;
      case 'SCALP':
        profitMultiplier = (Math.random() - 0.3) * 0.5; // Small but frequent gains
        break;
      default:
        profitMultiplier = 0;
    }

    // Apply confidence multiplier
    profitMultiplier *= signal.confidence;

    // Calculate final profit
    const grossProfit = riskAdjustedAmount * profitMultiplier;
    const fees = riskAdjustedAmount * 0.001; // 0.1% trading fee
    const netProfit = grossProfit - fees - (riskAdjustedAmount * slippage) - (riskAdjustedAmount * marketImpact);

    const success = netProfit > 0;
    
    return {
      success,
      profit: netProfit,
      executionTime: Date.now()
    };
  }

  // Memory and learning system
  updateMemory(signal: TradeSignal, result: TradeResult): void {
    // Update signal with result
    signal.result = result;
    this.memory.lastSignals.push(signal);
    
    // Keep only last 100 signals
    if (this.memory.lastSignals.length > 100) {
      this.memory.lastSignals.shift();
    }

    // Update streaks
    if (result.success) {
      this.memory.gainStreak++;
      this.memory.failStreak = 0;
    } else {
      this.memory.failStreak++;
      this.memory.gainStreak = 0;
    }

    // Update statistics
    this.memory.totalTrades++;
    this.memory.lastTradeTime = Date.now();
    
    const recentTrades = this.memory.lastSignals.filter(s => s.result).slice(-20);
    const recentSuccesses = recentTrades.filter(s => s.result!.success).length;
    this.memory.successRate = recentTrades.length > 0 ? recentSuccesses / recentTrades.length : 0;

    // Update learning weight based on performance
    if (this.memory.successRate > 0.7) {
      this.memory.learningWeight = Math.min(1.5, this.memory.learningWeight + 0.1);
    } else if (this.memory.successRate < 0.4) {
      this.memory.learningWeight = Math.max(0.5, this.memory.learningWeight - 0.1);
    }

    // Update spiritual state
    if (this.memory.gainStreak >= 5) {
      this.memory.spiritualState = 'enlightened';
    } else if (this.memory.successRate > 0.6) {
      this.memory.spiritualState = 'focused';
    } else if (this.memory.failStreak >= 3) {
      this.memory.spiritualState = 'cautious';
    } else if (this.memory.failStreak >= 5) {
      this.memory.spiritualState = 'blocked';
    }
  }

  // Main engine cycle
  async waidesKiEngineCore(wallet: WalletState): Promise<void> {
    try {
      // Fetch current market data
      const market = await this.fetchETHMarketData();

      // Update price history
      this.memory.lastPrices.push(market.price);
      if (this.memory.lastPrices.length > 200) {
        this.memory.lastPrices.shift();
      }

      // Make trading decision
      const decision = this.decideTrade(market, wallet);

      if (decision.shouldTrade && decision.type && decision.type !== 'HOLD') {
        const signal: TradeSignal = {
          type: decision.type,
          confidence: decision.confidence,
          timestamp: Date.now(),
          market
        };

        // Apply spiritual filter
        const spiritualCheck = this.spiritualFilter(signal);
        
        if (spiritualCheck.allowed) {
          // Execute trade
          const result = await this.executeTrade(signal, wallet);
          
          // Update memory with results
          this.updateMemory(signal, result);

          console.log(`🤖 Waides KI executed ${signal.type} trade: ${result.success ? 'SUCCESS' : 'FAILED'} | Profit: $${result.profit.toFixed(2)} | Confidence: ${(signal.confidence * 100).toFixed(1)}%`);
        } else {
          console.log(`🛑 Waides KI blocked trade: ${spiritualCheck.guidance}`);
        }
      }

    } catch (error) {
      console.error('Waides KI Core Engine error:', error);
    }
  }

  // Start autonomous engine
  startEngine(wallet: WalletState): void {
    if (this.isRunning) {
      console.log('🤖 Waides KI Core Engine is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Waides KI Core Intelligence Engine...');

    // Run engine every 60 seconds
    this.engineInterval = setInterval(async () => {
      await this.waidesKiEngineCore(wallet);
    }, 60000);

    // Initial run
    this.waidesKiEngineCore(wallet);
  }

  // Stop engine
  stopEngine(): void {
    if (this.engineInterval) {
      clearInterval(this.engineInterval);
      this.engineInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Waides KI Core Engine stopped');
  }

  // Get engine status and statistics
  getEngineStatus() {
    return {
      isRunning: this.isRunning,
      memory: {
        ...this.memory,
        priceHistoryLength: this.memory.lastPrices.length,
        signalHistoryLength: this.memory.lastSignals.length
      },
      lastMarketPrice: this.memory.lastPrices[this.memory.lastPrices.length - 1] || 0,
      recentSignals: this.memory.lastSignals.slice(-5)
    };
  }

  // Dream mode - simulate trades during low activity
  async dreamMode(): Promise<void> {
    console.log('💭 Entering Dream Mode - simulating future trades...');
    
    // Create hypothetical market scenarios
    const currentPrice = this.memory.lastPrices[this.memory.lastPrices.length - 1] || 2500;
    const scenarios = [
      { price: currentPrice * 1.02, change: 2.0, volume: 20000000000 },
      { price: currentPrice * 0.98, change: -2.0, volume: 25000000000 },
      { price: currentPrice * 1.05, change: 5.0, volume: 30000000000 },
      { price: currentPrice * 0.95, change: -5.0, volume: 15000000000 }
    ];

    for (const scenario of scenarios) {
      const dreamMarket: MarketData = {
        ...scenario,
        marketCap: 0,
        timestamp: Date.now()
      };

      const dreamWallet: WalletState = {
        balance: 10000,
        totalProfit: 0,
        activeBot: 'WaidBotPro',
        riskLevel: 'moderate'
      };

      const decision = this.decideTrade(dreamMarket, dreamWallet);
      console.log(`💭 Dream scenario: Price ${scenario.price.toFixed(2)}, Decision: ${decision.type}, Confidence: ${(decision.confidence * 100).toFixed(1)}%`);
    }
  }
}

export { WaidesKiCoreEngine, type MarketData, type WaidesMemory, type TradeSignal, type WalletState };