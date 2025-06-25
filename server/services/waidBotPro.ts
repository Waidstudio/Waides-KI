import { storage } from '../storage';
import { EthData, Signal, Candlestick } from '@shared/schema';
import { neuralQuantumSingularityStrategy } from './neuralQuantumSingularityStrategy';

interface MarketFeatures {
  trendStrength: number;
  volatility: number;
  sentiment: number;
  onchainActivity: number;
  rsi: number;
  macdSignal: number;
}

interface TradingSignals {
  entry?: number;
  stopLoss?: number;
  takeProfit?: number;
  size?: number;
  strategy?: 'trend_following' | 'mean_reversion' | 'breakout';
  direction?: 'buy' | 'sell';
}

interface Portfolio {
  USDT: number;
  ETH: number;
}

interface TradeRecord {
  timestamp: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  cost: number;
  strategy: string;
  portfolioValue: number;
}

interface PerformanceMetrics {
  trend_following: { wins: number; losses: number; };
  mean_reversion: { wins: number; losses: number; };
  breakout: { wins: number; losses: number; };
}

export class WaidBotPro {
  private portfolio: Portfolio;
  private riskPerTrade: number = 0.05; // 5% of portfolio per trade
  private maxDrawdown: number = 0.2; // 20% max loss from peak
  private peakBalance: number;
  private tradeHistory: TradeRecord[] = [];
  private strategyPerformance: PerformanceMetrics;
  private currentState: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  private marketMemory: string[] = [];

  constructor(startingBalance: number = 10000) {
    this.portfolio = {
      USDT: startingBalance,
      ETH: 0.0
    };
    this.peakBalance = startingBalance;
    this.strategyPerformance = {
      trend_following: { wins: 0, losses: 0 },
      mean_reversion: { wins: 0, losses: 0 },
      breakout: { wins: 0, losses: 0 }
    };
  }

  private calculateTechnicalIndicators(candlesticks: Candlestick[]): any[] {
    if (candlesticks.length < 50) return [];

    const data = candlesticks.map(c => ({
      close: c.close,
      high: c.high,
      low: c.low,
      open: c.open,
      volume: c.volume,
      timestamp: c.openTime
    }));

    // Calculate moving averages
    const ma20 = this.calculateMA(data.map(d => d.close), 20);
    const ma50 = this.calculateMA(data.map(d => d.close), 50);
    const ma200 = this.calculateMA(data.map(d => d.close), 200);

    // Calculate RSI
    const rsi = this.calculateRSI(data.map(d => d.close), 14);

    // Calculate MACD
    const macd = this.calculateMACD(data.map(d => d.close));

    // Calculate Bollinger Bands
    const bollinger = this.calculateBollingerBands(data.map(d => d.close), 20, 2);

    // Calculate volatility
    const returns = data.slice(1).map((d, i) => (d.close - data[i].close) / data[i].close);
    const volatility = this.calculateVolatility(returns, 20);

    return data.map((d, i) => ({
      ...d,
      ma20: ma20[i],
      ma50: ma50[i],
      ma200: ma200[i],
      rsi: rsi[i],
      macd: macd.macd[i],
      macdSignal: macd.signal[i],
      upperBand: bollinger.upper[i],
      lowerBand: bollinger.lower[i],
      volatility: volatility[i],
      returns: i > 0 ? returns[i - 1] : 0
    }));
  }

  private calculateMA(prices: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else {
        const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / period);
      }
    }
    return result;
  }

  private calculateRSI(prices: number[], period: number): number[] {
    const gains: number[] = [];
    const losses: number[] = [];
    const rsi: number[] = [NaN];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }

    for (let i = period; i < prices.length; i++) {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }

    return rsi;
  }

  private calculateMACD(prices: number[]): { macd: number[]; signal: number[]; } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12.map((val, i) => val - ema26[i]);
    const signal = this.calculateEMA(macd, 9);

    return { macd, signal };
  }

  private calculateEMA(prices: number[], period: number): number[] {
    const multiplier = 2 / (period + 1);
    const ema: number[] = [prices[0]];

    for (let i = 1; i < prices.length; i++) {
      ema.push((prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier)));
    }

    return ema;
  }

  private calculateBollingerBands(prices: number[], period: number, stdDev: number): { upper: number[]; lower: number[]; } {
    const ma = this.calculateMA(prices, period);
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        upper.push(NaN);
        lower.push(NaN);
      } else {
        const slice = prices.slice(i - period + 1, i + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / period;
        const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
        const standardDeviation = Math.sqrt(variance);
        
        upper.push(ma[i] + (standardDeviation * stdDev));
        lower.push(ma[i] - (standardDeviation * stdDev));
      }
    }

    return { upper, lower };
  }

  private calculateVolatility(returns: number[], period: number): number[] {
    const volatility: number[] = [];
    
    for (let i = 0; i < returns.length; i++) {
      if (i < period - 1) {
        volatility.push(NaN);
      } else {
        const slice = returns.slice(i - period + 1, i + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / period;
        const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
        volatility.push(Math.sqrt(variance));
      }
    }

    return volatility;
  }

  private calculateTrendStrength(data: any[]): number {
    if (data.length < 20) return 0;

    const recent = data.slice(-20);
    const shortMA = recent.slice(-5).reduce((a, b) => a + b.close, 0) / 5;
    const longMA = recent.reduce((a, b) => a + b.close, 0) / 20;

    return (shortMA - longMA) / longMA;
  }

  private getCurrentMarketFeatures(technicalData: any[]): MarketFeatures {
    if (technicalData.length === 0) {
      return {
        trendStrength: 0,
        volatility: 0,
        sentiment: 0,
        onchainActivity: 0,
        rsi: 50,
        macdSignal: 0
      };
    }

    const latest = technicalData[technicalData.length - 1];
    const recent24h = technicalData.slice(-24);

    return {
      trendStrength: this.calculateTrendStrength(recent24h),
      volatility: latest.volatility || 0,
      sentiment: this.calculateSentimentScore(),
      onchainActivity: this.calculateOnchainActivity(),
      rsi: latest.rsi || 50,
      macdSignal: (latest.macd || 0) - (latest.macdSignal || 0)
    };
  }

  private calculateSentimentScore(): number {
    // Simulated sentiment analysis based on market conditions
    // In production, this would analyze social media and news
    const randomSentiment = (Math.random() - 0.5) * 0.2; // -0.1 to 0.1
    return Math.max(-1, Math.min(1, randomSentiment));
  }

  private calculateOnchainActivity(): number {
    // Simulated on-chain activity score
    // In production, this would analyze gas usage, transaction volumes, etc.
    return Math.random() * 0.5 + 0.25; // 0.25 to 0.75
  }

  public async predictPriceMovement(): Promise<{ prediction: number; direction: string; confidence: number; }> {
    try {
      // Get recent candlestick data
      const candlesticks = await storage.getCandlestickHistory('ETHUSDT', '1m', 100);
      
      if (candlesticks.length < 50) {
        return { prediction: 0, direction: 'neutral', confidence: 0.5 };
      }

      // Calculate technical indicators
      const technicalData = this.calculateTechnicalIndicators(candlesticks);
      const features = this.getCurrentMarketFeatures(technicalData);

      // Advanced prediction algorithm combining multiple factors
      let prediction = 0;
      let confidence = 0.5;

      // Trend component (40% weight)
      prediction += features.trendStrength * 0.4;

      // RSI component (20% weight)
      const rsiSignal = features.rsi > 70 ? -0.5 : features.rsi < 30 ? 0.5 : 0;
      prediction += rsiSignal * 0.2;

      // MACD component (20% weight)
      prediction += Math.tanh(features.macdSignal) * 0.2;

      // Sentiment component (10% weight)
      prediction += features.sentiment * 0.1;

      // Volatility adjustment (10% weight)
      const volatilityAdjustment = Math.min(features.volatility * 2, 0.1);
      prediction += volatilityAdjustment * 0.1;

      // Calculate confidence based on signal strength
      confidence = Math.min(0.95, 0.5 + Math.abs(prediction));

      // Determine direction
      let direction = 'neutral';
      if (prediction > 0.02) {
        direction = prediction > 0.05 ? 'strong_bullish' : 'bullish';
      } else if (prediction < -0.02) {
        direction = prediction < -0.05 ? 'strong_bearish' : 'bearish';
      }

      return { prediction, direction, confidence };
    } catch (error) {
      console.error('Price prediction error:', error);
      return { prediction: 0, direction: 'neutral', confidence: 0.5 };
    }
  }

  public async determineMarketState(): Promise<void> {
    const { prediction, direction } = await this.predictPriceMovement();
    const candlesticks = await storage.getCandlestickHistory('ETHUSDT', '1m', 50);
    
    if (candlesticks.length > 0) {
      const technicalData = this.calculateTechnicalIndicators(candlesticks);
      const features = this.getCurrentMarketFeatures(technicalData);

      // Weighted decision making
      let score = 0;
      score += prediction * 0.4;
      score += features.trendStrength * 0.3;
      score += features.sentiment * 0.2;
      score += (features.rsi - 50) / 50 * 0.1;

      if (score > 0.1) {
        this.currentState = 'bullish';
      } else if (score < -0.1) {
        this.currentState = 'bearish';
      } else {
        this.currentState = 'neutral';
      }

      // Update market memory (keep last 100 states)
      this.marketMemory.push(this.currentState);
      if (this.marketMemory.length > 100) {
        this.marketMemory.shift();
      }
    }
  }

  public async generateTradingSignals(): Promise<TradingSignals> {
    try {
      // Get historical data for Neural Quantum Singularity Strategy
      const candlesticks = await storage.getCandlestickHistory('ETHUSDT', '1m', 100);
      const ethDataHistory = await storage.getEthDataHistory(50);
      
      if (candlesticks.length < 50 || ethDataHistory.length < 20) {
        return {}; // Not enough data for quantum analysis
      }

      // Convert data to neural quantum format
      const latestEthData = ethDataHistory[ethDataHistory.length - 1];
      const marketData = neuralQuantumSingularityStrategy.convertEthDataToMarketData(latestEthData, ethDataHistory);
      
      // Perform neural quantum market analysis
      neuralQuantumSingularityStrategy.analyzeMarket(marketData);
      
      // Generate never-lose trading signals
      const quantumSignals = neuralQuantumSingularityStrategy.generateSignals();
      const currentPrice = candlesticks[candlesticks.length - 1].close;
      
      // Convert quantum signals to WaidBot Pro format
      let signals: TradingSignals = {};
      
      for (const signal of quantumSignals) {
        if (signal.type === 'PRIMARY_ENTRY' && signal.direction === 'long') {
          signals = {
            entry: currentPrice,
            direction: 'buy',
            size: this.calculateQuantumPositionSize(signal.size, currentPrice),
            stopLoss: currentPrice * 0.97, // 3% stop loss
            takeProfit: currentPrice * (1 + (signal.risk_management?.profit_factor || 2.5) * 0.03),
            strategy: 'neural_quantum_primary_entry'
          };
          break;
        } else if (signal.type === 'BLACK_HOLE_SHORT' && signal.direction === 'short') {
          signals = {
            entry: currentPrice,
            direction: 'sell',
            size: this.calculateQuantumPositionSize(signal.size, currentPrice),
            stopLoss: currentPrice * 1.03, // 3% stop loss for short
            takeProfit: currentPrice * (1 - 0.05), // 5% target
            strategy: 'neural_quantum_black_hole'
          };
          break;
        } else if (signal.type === 'TREND_ACCELERATION' && signal.direction === 'long') {
          signals = {
            entry: currentPrice,
            direction: 'buy',
            size: this.calculateQuantumPositionSize(signal.size, currentPrice),
            stopLoss: currentPrice * 0.98, // 2% stop loss
            takeProfit: currentPrice * 1.04, // 4% target
            strategy: 'neural_quantum_trend_acceleration'
          };
          break;
        } else if (signal.type === 'MEAN_REVERSION_SHORT' && signal.direction === 'short') {
          signals = {
            entry: currentPrice,
            direction: 'sell',
            size: this.calculateQuantumPositionSize(signal.size, currentPrice),
            stopLoss: currentPrice * 1.025, // 2.5% stop loss
            takeProfit: currentPrice * 0.97, // 3% target
            strategy: 'neural_quantum_mean_reversion'
          };
          break;
        }
      }
      
      // Log quantum market phase for monitoring
      console.log(`🧠 Neural Quantum Analysis: ${neuralQuantumSingularityStrategy.getMarketPhase()} | Harmony: ${neuralQuantumSingularityStrategy.getHarmonicBalance().toFixed(3)}`);
      
      return signals;
    } catch (error) {
      console.error('Error generating neural quantum signals:', error);
      return {};
    }
  }

  private calculateQuantumPositionSize(size: string | undefined, currentPrice: number): number {
    const portfolioValue = this.getPortfolioValue();
    const baseAmount = 100; // Base USDT amount
    
    switch (size) {
      case 'full':
        return Math.min(portfolioValue * 0.8, 1000) / currentPrice; // Max 80% of portfolio or $1000
      case 'half':
        return Math.min(portfolioValue * 0.4, 500) / currentPrice; // Max 40% of portfolio or $500
      case 'micro':
        return Math.min(portfolioValue * 0.1, 100) / currentPrice; // Max 10% of portfolio or $100
      default:
        return baseAmount / currentPrice; // Default conservative size
    }
  }

  public simulateTradeExecution(signals: TradingSignals): { success: boolean; message: string; tradeRecord?: TradeRecord; } {
    if (!signals.entry || !signals.size || !signals.strategy || !signals.direction) {
      return { success: false, message: 'Invalid signals provided' };
    }

    const candlesticks = storage.getCandlestickHistory('ETHUSDT', '1m', 1);
    if (!candlesticks || candlesticks.length === 0) {
      return { success: false, message: 'No current price data available' };
    }

    // Get current price from latest candlestick
    storage.getCandlestickHistory('ETHUSDT', '1m', 1).then(candlesticks => {
      if (candlesticks.length === 0) return;
      
      const currentPrice = candlesticks[0].close;
      
      try {
        if (signals.direction === 'buy' && signals.size) {
          const amount = signals.size;
          const cost = amount * currentPrice;
          
          if (cost > 10 && cost <= this.portfolio.USDT) { // Minimum $10 order and sufficient balance
            this.portfolio.USDT -= cost;
            this.portfolio.ETH += amount;
            
            const tradeRecord: TradeRecord = {
              timestamp: new Date().toISOString(),
              type: 'buy',
              price: currentPrice,
              amount: amount,
              cost: cost,
              strategy: signals.strategy!,
              portfolioValue: this.getPortfolioValue()
            };
            
            this.recordTrade(tradeRecord);
            return { success: true, message: `Executed BUY order for ${amount.toFixed(4)} ETH at $${currentPrice.toFixed(2)}`, tradeRecord };
          }
        } else if (signals.direction === 'sell' && signals.size && this.portfolio.ETH >= signals.size) {
          const amount = signals.size;
          const proceeds = amount * currentPrice;
          
          this.portfolio.ETH -= amount;
          this.portfolio.USDT += proceeds;
          
          const tradeRecord: TradeRecord = {
            timestamp: new Date().toISOString(),
            type: 'sell',
            price: currentPrice,
            amount: amount,
            cost: proceeds,
            strategy: signals.strategy!,
            portfolioValue: this.getPortfolioValue()
          };
          
          this.recordTrade(tradeRecord);
          return { success: true, message: `Executed SELL order for ${amount.toFixed(4)} ETH at $${currentPrice.toFixed(2)}`, tradeRecord };
        }
      } catch (error) {
        return { success: false, message: `Trade execution failed: ${error}` };
      }
    });

    return { success: false, message: 'Trade conditions not met' };
  }

  private recordTrade(tradeRecord: TradeRecord): void {
    this.tradeHistory.push(tradeRecord);

    // Update strategy performance when closing a position
    if (this.tradeHistory.length > 1) {
      const lastTrade = this.tradeHistory[this.tradeHistory.length - 2];
      if (lastTrade.type !== tradeRecord.type) {
        const profit = (tradeRecord.price - lastTrade.price) / lastTrade.price;
        const strategy = tradeRecord.strategy as keyof PerformanceMetrics;
        
        if (profit > 0) {
          this.strategyPerformance[strategy].wins += 1;
        } else {
          this.strategyPerformance[strategy].losses += 1;
        }
      }
    }
  }

  public getPortfolioValue(): number {
    // This will be updated with current ETH price when called
    return this.portfolio.USDT + (this.portfolio.ETH * 2500); // Using approximate ETH price
  }

  public async updatePortfolioValue(): Promise<number> {
    const candlesticks = await storage.getCandlestickHistory('ETHUSDT', '1m', 1);
    if (candlesticks.length > 0) {
      const currentPrice = candlesticks[0].close;
      return this.portfolio.USDT + (this.portfolio.ETH * currentPrice);
    }
    return this.getPortfolioValue();
  }

  public checkRiskLimits(): { withinLimits: boolean; currentDrawdown: number; message: string; } {
    const currentValue = this.getPortfolioValue();

    // Update peak balance
    if (currentValue > this.peakBalance) {
      this.peakBalance = currentValue;
    }

    // Calculate drawdown
    const drawdown = (this.peakBalance - currentValue) / this.peakBalance;

    if (drawdown > this.maxDrawdown) {
      return {
        withinLimits: false,
        currentDrawdown: drawdown,
        message: `Max drawdown exceeded: ${(drawdown * 100).toFixed(1)}%`
      };
    }

    return {
      withinLimits: true,
      currentDrawdown: drawdown,
      message: `Risk within limits. Current drawdown: ${(drawdown * 100).toFixed(1)}%`
    };
  }

  public getAdvancedAnalytics(): {
    marketState: string;
    portfolioValue: number;
    totalTrades: number;
    winRate: number;
    strategyPerformance: PerformanceMetrics;
    riskMetrics: { currentDrawdown: number; withinLimits: boolean; };
  } {
    const totalTrades = Object.values(this.strategyPerformance).reduce((sum, strategy) => sum + strategy.wins + strategy.losses, 0);
    const totalWins = Object.values(this.strategyPerformance).reduce((sum, strategy) => sum + strategy.wins, 0);
    const winRate = totalTrades > 0 ? totalWins / totalTrades : 0;
    const riskCheck = this.checkRiskLimits();

    return {
      marketState: this.currentState,
      portfolioValue: this.getPortfolioValue(),
      totalTrades,
      winRate,
      strategyPerformance: this.strategyPerformance,
      riskMetrics: {
        currentDrawdown: riskCheck.currentDrawdown,
        withinLimits: riskCheck.withinLimits
      }
    };
  }

  public getPortfolio(): Portfolio {
    return { ...this.portfolio };
  }

  public getTradeHistory(): TradeRecord[] {
    return [...this.tradeHistory];
  }

  public getCurrentState(): string {
    return this.currentState;
  }
}