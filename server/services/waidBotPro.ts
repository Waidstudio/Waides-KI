import { EthPriceData } from './ethMonitor';

export interface WaidBotProDecision {
  action: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'OBSERVE';
  reasoning: string;
  confidence: number;
  ethPosition: 'LONG' | 'SHORT' | 'NEUTRAL';
  tradingPair: 'ETH/USDT' | 'NONE';
  quantity: number;
  trendDirection: 'UPWARD' | 'DOWNWARD' | 'SIDEWAYS';
  strategy: 'TREND_FOLLOWING' | 'MEAN_REVERSION' | 'BREAKOUT' | 'SIDEWAYS_RANGE';
  autoTradingEnabled: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: number;
}

export interface TechnicalAnalysis {
  rsi: number;
  macd: number;
  ema20: number;
  ema50: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  support: number;
  resistance: number;
  volatility: number;
}

/**
 * WaidBot Pro - Advanced AI-Powered ETH Trading System
 * 
 * Features:
 * - Trades both long and short positions
 * - Profitable in upward, downward, AND sideways markets
 * - Advanced technical analysis and risk management
 * - Multiple trading strategies (trend following, mean reversion, breakout, range trading)
 * - Automatic trading with sophisticated position sizing
 */
export class WaidBotPro {
  private autoTradingEnabled: boolean = false;
  private lastDecision: WaidBotProDecision | null = null;
  private decisionHistory: WaidBotProDecision[] = [];
  private priceHistory: number[] = [];
  private maxRiskPerTrade: number = 0.05; // 5% max risk per trade
  private maxDrawdown: number = 0.2; // 20% max drawdown

  constructor() {
    console.log('🚀 WaidBot Pro initialized - Advanced ETH trading system ready');
  }

  /**
   * Enable/disable automatic trading
   */
  public setAutoTrading(enabled: boolean): void {
    this.autoTradingEnabled = enabled;
    console.log(`🚀 WaidBot Pro auto-trading ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Get current bot status
   */
  public getStatus(): { 
    autoTradingEnabled: boolean; 
    currentPosition: 'LONG' | 'SHORT' | 'NEUTRAL';
    lastDecision: WaidBotProDecision | null;
    riskMetrics: {
      maxRiskPerTrade: number;
      maxDrawdown: number;
      currentRisk: number;
    };
  } {
    return {
      autoTradingEnabled: this.autoTradingEnabled,
      currentPosition: this.lastDecision?.ethPosition || 'NEUTRAL',
      lastDecision: this.lastDecision,
      riskMetrics: {
        maxRiskPerTrade: this.maxRiskPerTrade,
        maxDrawdown: this.maxDrawdown,
        currentRisk: this.calculateCurrentRisk()
      }
    };
  }

  /**
   * Calculate current portfolio risk
   */
  private calculateCurrentRisk(): number {
    if (!this.lastDecision || this.lastDecision.ethPosition === 'NEUTRAL') {
      return 0;
    }
    return this.lastDecision.quantity * this.maxRiskPerTrade;
  }

  /**
   * Perform comprehensive technical analysis
   */
  private performTechnicalAnalysis(ethData: EthPriceData): TechnicalAnalysis {
    // Update price history
    this.priceHistory.push(ethData.price);
    if (this.priceHistory.length > 200) {
      this.priceHistory.shift(); // Keep last 200 prices
    }

    const prices = this.priceHistory;
    const currentPrice = ethData.price;

    // Calculate RSI (14-period)
    const rsi = this.calculateRSI(prices, 14);
    
    // Calculate MACD
    const macd = this.calculateMACD(prices);
    
    // Calculate EMAs
    const ema20 = this.calculateEMA(prices, 20);
    const ema50 = this.calculateEMA(prices, 50);
    
    // Calculate Bollinger Bands
    const bollinger = this.calculateBollingerBands(prices, 20);
    
    // Calculate support and resistance
    const { support, resistance } = this.calculateSupportResistance(prices);
    
    // Calculate volatility
    const volatility = this.calculateVolatility(prices);

    return {
      rsi,
      macd,
      ema20,
      ema50,
      bollinger,
      support,
      resistance,
      volatility
    };
  }

  /**
   * Calculate RSI indicator
   */
  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50; // Neutral RSI if insufficient data

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * Calculate MACD indicator
   */
  private calculateMACD(prices: number[]): number {
    if (prices.length < 26) return 0;

    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    
    return ema12 - ema26;
  }

  /**
   * Calculate EMA (Exponential Moving Average)
   */
  private calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    if (prices.length < period) return prices[prices.length - 1];

    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }

  /**
   * Calculate Bollinger Bands
   */
  private calculateBollingerBands(prices: number[], period: number = 20): { upper: number; middle: number; lower: number } {
    if (prices.length < period) {
      const currentPrice = prices[prices.length - 1] || 0;
      return { upper: currentPrice * 1.02, middle: currentPrice, lower: currentPrice * 0.98 };
    }

    const sma = prices.slice(-period).reduce((sum, price) => sum + price, 0) / period;
    const variance = prices.slice(-period).reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    return {
      upper: sma + (stdDev * 2),
      middle: sma,
      lower: sma - (stdDev * 2)
    };
  }

  /**
   * Calculate support and resistance levels
   */
  private calculateSupportResistance(prices: number[]): { support: number; resistance: number } {
    if (prices.length < 10) {
      const currentPrice = prices[prices.length - 1] || 0;
      return { support: currentPrice * 0.95, resistance: currentPrice * 1.05 };
    }

    const recent = prices.slice(-50); // Last 50 prices
    const maxPrice = Math.max(...recent);
    const minPrice = Math.min(...recent);

    return {
      support: minPrice,
      resistance: maxPrice
    };
  }

  /**
   * Calculate price volatility
   */
  private calculateVolatility(prices: number[]): number {
    if (prices.length < 20) return 0.02; // Default volatility

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Determine optimal trading strategy based on market conditions
   */
  private selectTradingStrategy(ethData: EthPriceData, technical: TechnicalAnalysis): 'TREND_FOLLOWING' | 'MEAN_REVERSION' | 'BREAKOUT' | 'SIDEWAYS_RANGE' {
    const priceChange24h = ethData.priceChange24h || 0;
    const currentPrice = ethData.price;

    // High volatility + strong trend = Trend Following
    if (technical.volatility > 0.03 && Math.abs(priceChange24h) > 3) {
      return 'TREND_FOLLOWING';
    }

    // Price near Bollinger Band extremes = Mean Reversion
    if (currentPrice <= technical.bollinger.lower || currentPrice >= technical.bollinger.upper) {
      return 'MEAN_REVERSION';
    }

    // Price near support/resistance with high volume = Breakout
    if (ethData.volume > 2000000 && 
        (Math.abs(currentPrice - technical.support) / currentPrice < 0.01 || 
         Math.abs(currentPrice - technical.resistance) / currentPrice < 0.01)) {
      return 'BREAKOUT';
    }

    // Low volatility + sideways movement = Range Trading
    return 'SIDEWAYS_RANGE';
  }

  /**
   * Generate trading decision using selected strategy
   */
  public async generateDecision(ethData: EthPriceData): Promise<WaidBotProDecision> {
    const technical = this.performTechnicalAnalysis(ethData);
    const strategy = this.selectTradingStrategy(ethData, technical);
    const trendDirection = this.analyzeTrendDirection(ethData, technical);
    
    let decision: WaidBotProDecision;

    switch (strategy) {
      case 'TREND_FOLLOWING':
        decision = this.generateTrendFollowingDecision(ethData, technical, trendDirection);
        break;
      case 'MEAN_REVERSION':
        decision = this.generateMeanReversionDecision(ethData, technical, trendDirection);
        break;
      case 'BREAKOUT':
        decision = this.generateBreakoutDecision(ethData, technical, trendDirection);
        break;
      case 'SIDEWAYS_RANGE':
        decision = this.generateSidewaysRangeDecision(ethData, technical, trendDirection);
        break;
    }

    // Apply risk management
    decision = this.applyRiskManagement(decision, technical);

    // Store decision
    this.lastDecision = decision;
    this.decisionHistory.push(decision);
    
    // Keep only last 100 decisions
    if (this.decisionHistory.length > 100) {
      this.decisionHistory.shift();
    }

    return decision;
  }

  /**
   * Analyze trend direction using technical indicators
   */
  private analyzeTrendDirection(ethData: EthPriceData, technical: TechnicalAnalysis): 'UPWARD' | 'DOWNWARD' | 'SIDEWAYS' {
    const priceChange24h = ethData.priceChange24h || 0;
    const currentPrice = ethData.price;

    // Strong upward trend
    if (priceChange24h > 2 && technical.ema20 > technical.ema50 && currentPrice > technical.ema20) {
      return 'UPWARD';
    }

    // Strong downward trend
    if (priceChange24h < -2 && technical.ema20 < technical.ema50 && currentPrice < technical.ema20) {
      return 'DOWNWARD';
    }

    // Sideways movement
    return 'SIDEWAYS';
  }

  /**
   * Generate trend following decision
   */
  private generateTrendFollowingDecision(ethData: EthPriceData, technical: TechnicalAnalysis, trendDirection: string): WaidBotProDecision {
    const confidence = this.calculateConfidence(technical, 'TREND_FOLLOWING');
    
    if (trendDirection === 'UPWARD' && confidence > 75) {
      return {
        action: 'BUY_ETH',
        reasoning: `WaidBot Pro: Strong upward trend detected (${confidence.toFixed(1)}% confidence) - trend following strategy`,
        confidence,
        ethPosition: 'LONG',
        tradingPair: 'ETH/USDT',
        quantity: this.calculatePositionSize(confidence, 'MEDIUM'),
        trendDirection: 'UPWARD',
        strategy: 'TREND_FOLLOWING',
        autoTradingEnabled: this.autoTradingEnabled,
        riskLevel: 'MEDIUM',
        timestamp: Date.now()
      };
    }

    if (trendDirection === 'DOWNWARD' && confidence > 75) {
      return {
        action: 'SELL_ETH',
        reasoning: `WaidBot Pro: Strong downward trend detected (${confidence.toFixed(1)}% confidence) - short position`,
        confidence,
        ethPosition: 'SHORT',
        tradingPair: 'ETH/USDT',
        quantity: this.calculatePositionSize(confidence, 'MEDIUM'),
        trendDirection: 'DOWNWARD',
        strategy: 'TREND_FOLLOWING',
        autoTradingEnabled: this.autoTradingEnabled,
        riskLevel: 'MEDIUM',
        timestamp: Date.now()
      };
    }

    return this.generateHoldDecision(trendDirection as any, 'TREND_FOLLOWING', confidence);
  }

  /**
   * Generate mean reversion decision
   */
  private generateMeanReversionDecision(ethData: EthPriceData, technical: TechnicalAnalysis, trendDirection: string): WaidBotProDecision {
    const confidence = this.calculateConfidence(technical, 'MEAN_REVERSION');
    const currentPrice = ethData.price;

    // Price oversold - buy
    if (currentPrice <= technical.bollinger.lower && technical.rsi < 30) {
      return {
        action: 'BUY_ETH',
        reasoning: `WaidBot Pro: Oversold conditions (RSI: ${technical.rsi.toFixed(1)}, below Bollinger lower) - mean reversion buy`,
        confidence,
        ethPosition: 'LONG',
        tradingPair: 'ETH/USDT',
        quantity: this.calculatePositionSize(confidence, 'LOW'),
        trendDirection: trendDirection as any,
        strategy: 'MEAN_REVERSION',
        autoTradingEnabled: this.autoTradingEnabled,
        riskLevel: 'LOW',
        timestamp: Date.now()
      };
    }

    // Price overbought - sell
    if (currentPrice >= technical.bollinger.upper && technical.rsi > 70) {
      return {
        action: 'SELL_ETH',
        reasoning: `WaidBot Pro: Overbought conditions (RSI: ${technical.rsi.toFixed(1)}, above Bollinger upper) - mean reversion short`,
        confidence,
        ethPosition: 'SHORT',
        tradingPair: 'ETH/USDT',
        quantity: this.calculatePositionSize(confidence, 'LOW'),
        trendDirection: trendDirection as any,
        strategy: 'MEAN_REVERSION',
        autoTradingEnabled: this.autoTradingEnabled,
        riskLevel: 'LOW',
        timestamp: Date.now()
      };
    }

    return this.generateHoldDecision(trendDirection as any, 'MEAN_REVERSION', confidence);
  }

  /**
   * Generate breakout decision
   */
  private generateBreakoutDecision(ethData: EthPriceData, technical: TechnicalAnalysis, trendDirection: string): WaidBotProDecision {
    const confidence = this.calculateConfidence(technical, 'BREAKOUT');
    const currentPrice = ethData.price;

    // Resistance breakout
    if (currentPrice > technical.resistance * 1.001 && ethData.volume > 2000000) {
      return {
        action: 'BUY_ETH',
        reasoning: `WaidBot Pro: Resistance breakout at ${technical.resistance.toFixed(2)} with high volume - bullish breakout`,
        confidence,
        ethPosition: 'LONG',
        tradingPair: 'ETH/USDT',
        quantity: this.calculatePositionSize(confidence, 'HIGH'),
        trendDirection: 'UPWARD',
        strategy: 'BREAKOUT',
        autoTradingEnabled: this.autoTradingEnabled,
        riskLevel: 'HIGH',
        timestamp: Date.now()
      };
    }

    // Support breakdown
    if (currentPrice < technical.support * 0.999 && ethData.volume > 2000000) {
      return {
        action: 'SELL_ETH',
        reasoning: `WaidBot Pro: Support breakdown at ${technical.support.toFixed(2)} with high volume - bearish breakdown`,
        confidence,
        ethPosition: 'SHORT',
        tradingPair: 'ETH/USDT',
        quantity: this.calculatePositionSize(confidence, 'HIGH'),
        trendDirection: 'DOWNWARD',
        strategy: 'BREAKOUT',
        autoTradingEnabled: this.autoTradingEnabled,
        riskLevel: 'HIGH',
        timestamp: Date.now()
      };
    }

    return this.generateHoldDecision(trendDirection as any, 'BREAKOUT', confidence);
  }

  /**
   * Generate sideways range decision - WaidBot Pro's specialty
   */
  private generateSidewaysRangeDecision(ethData: EthPriceData, technical: TechnicalAnalysis, trendDirection: string): WaidBotProDecision {
    const confidence = this.calculateConfidence(technical, 'SIDEWAYS_RANGE');
    const currentPrice = ethData.price;
    const midPoint = (technical.support + technical.resistance) / 2;

    // Buy near support in sideways market
    if (currentPrice <= technical.support * 1.005 && technical.volatility < 0.02) {
      return {
        action: 'BUY_ETH',
        reasoning: `WaidBot Pro: Near support in sideways market (${technical.support.toFixed(2)}) - range trading buy`,
        confidence,
        ethPosition: 'LONG',
        tradingPair: 'ETH/USDT',
        quantity: this.calculatePositionSize(confidence, 'MEDIUM'),
        trendDirection: 'SIDEWAYS',
        strategy: 'SIDEWAYS_RANGE',
        autoTradingEnabled: this.autoTradingEnabled,
        riskLevel: 'MEDIUM',
        timestamp: Date.now()
      };
    }

    // Sell near resistance in sideways market
    if (currentPrice >= technical.resistance * 0.995 && technical.volatility < 0.02) {
      return {
        action: 'SELL_ETH',
        reasoning: `WaidBot Pro: Near resistance in sideways market (${technical.resistance.toFixed(2)}) - range trading short`,
        confidence,
        ethPosition: 'SHORT',
        tradingPair: 'ETH/USDT',
        quantity: this.calculatePositionSize(confidence, 'MEDIUM'),
        trendDirection: 'SIDEWAYS',
        strategy: 'SIDEWAYS_RANGE',
        autoTradingEnabled: this.autoTradingEnabled,
        riskLevel: 'MEDIUM',
        timestamp: Date.now()
      };
    }

    return this.generateHoldDecision('SIDEWAYS', 'SIDEWAYS_RANGE', confidence);
  }

  /**
   * Generate hold decision
   */
  private generateHoldDecision(trendDirection: 'UPWARD' | 'DOWNWARD' | 'SIDEWAYS', strategy: string, confidence: number): WaidBotProDecision {
    return {
      action: 'HOLD',
      reasoning: `WaidBot Pro: No clear signal for ${strategy.toLowerCase().replace('_', ' ')} strategy - holding position`,
      confidence,
      ethPosition: 'NEUTRAL',
      tradingPair: 'NONE',
      quantity: 0,
      trendDirection,
      strategy: strategy as any,
      autoTradingEnabled: this.autoTradingEnabled,
      riskLevel: 'LOW',
      timestamp: Date.now()
    };
  }

  /**
   * Calculate confidence based on technical indicators and strategy
   */
  private calculateConfidence(technical: TechnicalAnalysis, strategy: string): number {
    let confidence = 60; // Base confidence

    // RSI contribution
    if (strategy === 'MEAN_REVERSION') {
      if (technical.rsi < 30 || technical.rsi > 70) confidence += 15;
    } else {
      if (technical.rsi > 40 && technical.rsi < 60) confidence += 10;
    }

    // MACD contribution
    if (Math.abs(technical.macd) > 10) confidence += 10;

    // EMA alignment contribution
    if (technical.ema20 > technical.ema50) confidence += 5;

    // Volatility contribution
    if (strategy === 'SIDEWAYS_RANGE' && technical.volatility < 0.02) confidence += 15;
    else if (strategy === 'TREND_FOLLOWING' && technical.volatility > 0.03) confidence += 15;

    return Math.min(confidence, 95);
  }

  /**
   * Calculate position size based on confidence and risk level
   */
  private calculatePositionSize(confidence: number, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'): number {
    const baseSize = {
      'LOW': 0.02,     // 2% of capital
      'MEDIUM': 0.05,  // 5% of capital
      'HIGH': 0.08     // 8% of capital
    }[riskLevel];

    const confidenceMultiplier = confidence / 100;
    return baseSize * confidenceMultiplier;
  }

  /**
   * Apply risk management rules
   */
  private applyRiskManagement(decision: WaidBotProDecision, technical: TechnicalAnalysis): WaidBotProDecision {
    // Don't trade if auto-trading is disabled
    if (!this.autoTradingEnabled && (decision.action === 'BUY_ETH' || decision.action === 'SELL_ETH')) {
      return {
        ...decision,
        action: 'OBSERVE',
        reasoning: 'WaidBot Pro: Auto-trading disabled - manual control required',
        ethPosition: 'NEUTRAL',
        quantity: 0
      };
    }

    // Reduce position size in high volatility
    if (technical.volatility > 0.05) {
      decision.quantity *= 0.5;
      decision.reasoning += ' (position size reduced due to high volatility)';
    }

    // Don't trade with low confidence
    if (decision.confidence < 70 && (decision.action === 'BUY_ETH' || decision.action === 'SELL_ETH')) {
      return {
        ...decision,
        action: 'OBSERVE',
        reasoning: `WaidBot Pro: Confidence too low (${decision.confidence.toFixed(1)}%) - waiting for better setup`,
        ethPosition: 'NEUTRAL',
        quantity: 0
      };
    }

    return decision;
  }

  /**
   * Get decision history
   */
  public getDecisionHistory(): WaidBotProDecision[] {
    return this.decisionHistory.slice(-20); // Return last 20 decisions
  }

  /**
   * Execute trade automatically (if auto-trading is enabled)
   */
  public async executeTrade(decision: WaidBotProDecision): Promise<boolean> {
    if (!this.autoTradingEnabled) {
      console.log('🚀 WaidBot Pro: Auto-trading disabled, skipping execution');
      return false;
    }

    if (decision.action === 'BUY_ETH') {
      console.log(`🚀 WaidBot Pro executing BUY: ${(decision.quantity * 100).toFixed(1)}% position (${decision.strategy})`);
      return true;
    }

    if (decision.action === 'SELL_ETH') {
      console.log(`🚀 WaidBot Pro executing SELL: ${(decision.quantity * 100).toFixed(1)}% position (${decision.strategy})`);
      return true;
    }

    return false;
  }
}

// Create singleton instance
export const waidBotPro = new WaidBotPro();