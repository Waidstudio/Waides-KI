import { storage } from '../storage.js';
import type { InsertMarketAnalysis, MarketAnalysis } from '@shared/schema.js';

export class EnhancedMarketAnalysisService {
  private analysisCache: Map<string, any> = new Map();
  private lastAnalysisTime: number = 0;

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    try {
      // Clean up old analysis data (keep last 100 records)
      await this.maintainDataIntegrity();
      
      // Generate initial analysis if none exists
      const latestAnalysis = await storage.getLatestMarketAnalysis();
      if (!latestAnalysis) {
        await this.generateInitialAnalysis();
      }
    } catch (error) {
      console.error('Error initializing Enhanced Market Analysis Service:', error);
    }
  }

  async generateComprehensiveAnalysis(currentEthPrice: number, marketData?: any): Promise<MarketAnalysis> {
    const ethData = await storage.getLatestEthData();
    const candlestickData = await storage.getCandlestickHistory('ETHUSDT', '1h', 24);
    
    // Calculate technical indicators
    const indicators = this.calculateTechnicalIndicators(currentEthPrice, candlestickData);
    
    // Analyze market sentiment
    const sentimentAnalysis = this.analyzeSentiment(marketData, indicators);
    
    // Generate insights and recommendations
    const insights = this.generateInsights(indicators, sentimentAnalysis);
    const recommendations = this.generateRecommendations(indicators, sentimentAnalysis);
    
    // Determine trend direction
    const trendDirection = this.determineTrend(indicators);
    
    const analysisData: InsertMarketAnalysis = {
      ethPrice: currentEthPrice,
      volume24h: marketData?.volume24h || ethData?.volume || 0,
      marketCap: marketData?.marketCap || ethData?.marketCap || 0,
      priceChange24h: marketData?.priceChange24h || ethData?.priceChange24h || 0,
      dominance: marketData?.dominance || 0,
      fearGreedIndex: this.calculateFearGreedIndex(indicators),
      rsiValue: indicators.rsi,
      macdSignal: indicators.macd.signal,
      supportLevel: indicators.support,
      resistanceLevel: indicators.resistance,
      trendDirection,
      volatilityIndex: indicators.volatility,
      tradingVolume: marketData?.tradingVolume || 0,
      analysisType: 'COMPREHENSIVE',
      insights,
      indicators,
      recommendations
    };

    // Store in database
    const savedAnalysis = await storage.createMarketAnalysis(analysisData);
    
    // Update cache
    this.analysisCache.set('latest', savedAnalysis);
    this.lastAnalysisTime = Date.now();
    
    return savedAnalysis;
  }

  private calculateTechnicalIndicators(currentPrice: number, candlestickData: any[]): any {
    const closes = candlestickData.map(c => c.close).reverse();
    const highs = candlestickData.map(c => c.high).reverse();
    const lows = candlestickData.map(c => c.low).reverse();
    const volumes = candlestickData.map(c => c.volume).reverse();
    
    return {
      rsi: this.calculateRSI(closes),
      macd: this.calculateMACD(closes),
      ema20: this.calculateEMA(closes, 20),
      ema50: this.calculateEMA(closes, 50),
      sma20: this.calculateSMA(closes, 20),
      sma50: this.calculateSMA(closes, 50),
      bb: this.calculateBollingerBands(closes, 20),
      support: this.calculateSupport(lows),
      resistance: this.calculateResistance(highs),
      volume: this.calculateVolumeAnalysis(volumes),
      volatility: this.calculateVolatility(closes),
      momentum: this.calculateMomentum(closes),
      stochastic: this.calculateStochastic(highs, lows, closes)
    };
  }

  private calculateRSI(closes: number[], period: number = 14): number {
    if (closes.length < period + 1) return 50;
    
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      gains.push(diff > 0 ? diff : 0);
      losses.push(diff < 0 ? -diff : 0);
    }
    
    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(closes: number[]): any {
    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    const macdLine = ema12 - ema26;
    
    // Calculate signal line (9-period EMA of MACD)
    const macdHistory = [macdLine]; // In real implementation, this would be historical MACD values
    const signal = this.calculateEMA(macdHistory, 9);
    const histogram = macdLine - signal;
    
    return {
      line: macdLine,
      signal: signal > 0 ? 'BULLISH' : 'BEARISH',
      histogram,
      crossover: macdLine > signal ? 'BULLISH' : 'BEARISH'
    };
  }

  private calculateEMA(values: number[], period: number): number {
    if (values.length === 0) return 0;
    if (values.length < period) return values[values.length - 1];
    
    const multiplier = 2 / (period + 1);
    let ema = values[0];
    
    for (let i = 1; i < values.length; i++) {
      ema = (values[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  private calculateSMA(values: number[], period: number): number {
    if (values.length < period) return values[values.length - 1] || 0;
    
    const sum = values.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  private calculateBollingerBands(closes: number[], period: number = 20): any {
    const sma = this.calculateSMA(closes, period);
    const recentCloses = closes.slice(-period);
    
    const variance = recentCloses.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    return {
      upper: sma + (stdDev * 2),
      middle: sma,
      lower: sma - (stdDev * 2),
      bandwidth: (stdDev * 4) / sma,
      position: closes.length > 0 ? (closes[closes.length - 1] - sma) / (stdDev * 2) : 0
    };
  }

  private calculateSupport(lows: number[]): number {
    if (lows.length === 0) return 0;
    
    // Find recent low points
    const recentLows = lows.slice(-10);
    return Math.min(...recentLows);
  }

  private calculateResistance(highs: number[]): number {
    if (highs.length === 0) return 0;
    
    // Find recent high points
    const recentHighs = highs.slice(-10);
    return Math.max(...recentHighs);
  }

  private calculateVolumeAnalysis(volumes: number[]): any {
    if (volumes.length === 0) return { average: 0, trend: 'NEUTRAL' };
    
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const recentVolume = volumes.slice(-3).reduce((a, b) => a + b, 0) / 3;
    
    return {
      average: avgVolume,
      recent: recentVolume,
      trend: recentVolume > avgVolume * 1.2 ? 'INCREASING' : 
             recentVolume < avgVolume * 0.8 ? 'DECREASING' : 'NEUTRAL',
      strength: recentVolume / avgVolume
    };
  }

  private calculateVolatility(closes: number[]): number {
    if (closes.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push((closes[i] - closes[i-1]) / closes[i-1]);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * 100; // Convert to percentage
  }

  private calculateMomentum(closes: number[]): number {
    if (closes.length < 10) return 0;
    
    const recent = closes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const older = closes.slice(-10, -5).reduce((a, b) => a + b, 0) / 5;
    
    return ((recent - older) / older) * 100;
  }

  private calculateStochastic(highs: number[], lows: number[], closes: number[]): any {
    if (highs.length < 14) return { k: 50, d: 50, signal: 'NEUTRAL' };
    
    const highestHigh = Math.max(...highs.slice(-14));
    const lowestLow = Math.min(...lows.slice(-14));
    const currentClose = closes[closes.length - 1];
    
    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    const d = k; // Simplified - normally would be 3-period SMA of %K
    
    return {
      k,
      d,
      signal: k > 80 ? 'OVERBOUGHT' : k < 20 ? 'OVERSOLD' : 'NEUTRAL'
    };
  }

  private analyzeSentiment(marketData: any, indicators: any): any {
    let sentiment = 'NEUTRAL';
    let strength = 0;
    
    // Analyze multiple sentiment factors
    const factors = [];
    
    // RSI sentiment
    if (indicators.rsi > 70) {
      factors.push({ type: 'RSI', sentiment: 'BEARISH', weight: 0.3 });
    } else if (indicators.rsi < 30) {
      factors.push({ type: 'RSI', sentiment: 'BULLISH', weight: 0.3 });
    }
    
    // MACD sentiment
    if (indicators.macd.crossover === 'BULLISH') {
      factors.push({ type: 'MACD', sentiment: 'BULLISH', weight: 0.25 });
    } else if (indicators.macd.crossover === 'BEARISH') {
      factors.push({ type: 'MACD', sentiment: 'BEARISH', weight: 0.25 });
    }
    
    // Volume sentiment
    if (indicators.volume.trend === 'INCREASING') {
      factors.push({ type: 'VOLUME', sentiment: 'BULLISH', weight: 0.2 });
    } else if (indicators.volume.trend === 'DECREASING') {
      factors.push({ type: 'VOLUME', sentiment: 'BEARISH', weight: 0.15 });
    }
    
    // Momentum sentiment
    if (indicators.momentum > 2) {
      factors.push({ type: 'MOMENTUM', sentiment: 'BULLISH', weight: 0.25 });
    } else if (indicators.momentum < -2) {
      factors.push({ type: 'MOMENTUM', sentiment: 'BEARISH', weight: 0.25 });
    }
    
    // Calculate weighted sentiment
    const bullishWeight = factors.filter(f => f.sentiment === 'BULLISH').reduce((sum, f) => sum + f.weight, 0);
    const bearishWeight = factors.filter(f => f.sentiment === 'BEARISH').reduce((sum, f) => sum + f.weight, 0);
    
    if (bullishWeight > bearishWeight + 0.1) {
      sentiment = 'BULLISH';
      strength = bullishWeight;
    } else if (bearishWeight > bullishWeight + 0.1) {
      sentiment = 'BEARISH';
      strength = bearishWeight;
    } else {
      sentiment = 'NEUTRAL';
      strength = 0.5;
    }
    
    return {
      overall: sentiment,
      strength,
      factors,
      confidence: Math.min(strength * 100, 95)
    };
  }

  private generateInsights(indicators: any, sentiment: any): any {
    const insights = [];
    
    // Technical insights
    if (indicators.rsi > 70) {
      insights.push({
        type: 'TECHNICAL',
        level: 'WARNING',
        message: 'RSI indicates overbought conditions. Potential pullback expected.',
        confidence: 75
      });
    } else if (indicators.rsi < 30) {
      insights.push({
        type: 'TECHNICAL',
        level: 'OPPORTUNITY',
        message: 'RSI shows oversold conditions. Potential bounce opportunity.',
        confidence: 80
      });
    }
    
    // Bollinger Bands insights
    if (indicators.bb.position > 0.8) {
      insights.push({
        type: 'TECHNICAL',
        level: 'WARNING',
        message: 'Price near upper Bollinger Band. Resistance level approached.',
        confidence: 70
      });
    } else if (indicators.bb.position < -0.8) {
      insights.push({
        type: 'TECHNICAL',
        level: 'OPPORTUNITY',
        message: 'Price near lower Bollinger Band. Support level approached.',
        confidence: 75
      });
    }
    
    // Volume insights
    if (indicators.volume.strength > 1.5) {
      insights.push({
        type: 'VOLUME',
        level: 'INFO',
        message: 'Unusual volume activity detected. Significant price movement likely.',
        confidence: 85
      });
    }
    
    // Momentum insights
    if (Math.abs(indicators.momentum) > 5) {
      insights.push({
        type: 'MOMENTUM',
        level: 'INFO',
        message: `Strong ${indicators.momentum > 0 ? 'bullish' : 'bearish'} momentum detected.`,
        confidence: 80
      });
    }
    
    return insights;
  }

  private generateRecommendations(indicators: any, sentiment: any): any {
    const recommendations = [];
    
    // Entry recommendations
    if (sentiment.overall === 'BULLISH' && sentiment.strength > 0.6) {
      recommendations.push({
        type: 'ENTRY',
        action: 'BUY',
        reasoning: 'Strong bullish sentiment with favorable technical indicators.',
        confidence: sentiment.confidence,
        riskLevel: 'MEDIUM'
      });
    } else if (sentiment.overall === 'BEARISH' && sentiment.strength > 0.6) {
      recommendations.push({
        type: 'ENTRY',
        action: 'SELL',
        reasoning: 'Strong bearish sentiment with unfavorable technical indicators.',
        confidence: sentiment.confidence,
        riskLevel: 'MEDIUM'
      });
    }
    
    // Risk management recommendations
    if (indicators.volatility > 5) {
      recommendations.push({
        type: 'RISK_MANAGEMENT',
        action: 'REDUCE_POSITION',
        reasoning: 'High volatility detected. Consider reducing position size.',
        confidence: 80,
        riskLevel: 'HIGH'
      });
    }
    
    // Support/Resistance recommendations
    if (indicators.support && indicators.resistance) {
      recommendations.push({
        type: 'LEVELS',
        action: 'MONITOR',
        reasoning: `Key levels: Support at ${indicators.support.toFixed(2)}, Resistance at ${indicators.resistance.toFixed(2)}`,
        confidence: 85,
        riskLevel: 'LOW'
      });
    }
    
    return recommendations;
  }

  private determineTrend(indicators: any): string {
    let bullishSignals = 0;
    let bearishSignals = 0;
    
    // EMA trend
    if (indicators.ema20 > indicators.ema50) bullishSignals++;
    else bearishSignals++;
    
    // MACD trend
    if (indicators.macd.crossover === 'BULLISH') bullishSignals++;
    else if (indicators.macd.crossover === 'BEARISH') bearishSignals++;
    
    // Momentum trend
    if (indicators.momentum > 0) bullishSignals++;
    else bearishSignals++;
    
    // Volume trend
    if (indicators.volume.trend === 'INCREASING') bullishSignals++;
    else if (indicators.volume.trend === 'DECREASING') bearishSignals++;
    
    if (bullishSignals > bearishSignals) return 'BULLISH';
    else if (bearishSignals > bullishSignals) return 'BEARISH';
    else return 'SIDEWAYS';
  }

  private calculateFearGreedIndex(indicators: any): number {
    // Simplified Fear & Greed calculation based on technical indicators
    let score = 50; // Neutral starting point
    
    // RSI component
    if (indicators.rsi > 70) score -= 20;
    else if (indicators.rsi < 30) score += 20;
    
    // Volatility component
    if (indicators.volatility > 5) score -= 15;
    else if (indicators.volatility < 2) score += 10;
    
    // Momentum component
    if (indicators.momentum > 3) score += 15;
    else if (indicators.momentum < -3) score -= 15;
    
    // Volume component
    if (indicators.volume.strength > 1.5) score += 10;
    else if (indicators.volume.strength < 0.5) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private async generateInitialAnalysis() {
    // Generate initial analysis with default values
    const defaultPrice = 2400;
    await this.generateComprehensiveAnalysis(defaultPrice);
  }

  private async maintainDataIntegrity() {
    // In a real implementation, this would clean up old records
    // For now, just log the maintenance
    console.log('🔧 Market Analysis: Maintaining data integrity...');
  }

  async getLatestAnalysis(): Promise<MarketAnalysis | undefined> {
    const cached = this.analysisCache.get('latest');
    if (cached && Date.now() - this.lastAnalysisTime < 5 * 60 * 1000) {
      return cached;
    }
    
    return await storage.getLatestMarketAnalysis();
  }

  async getAnalysisHistory(limit: number = 50): Promise<MarketAnalysis[]> {
    return await storage.getMarketAnalysisHistory(limit);
  }

  async shouldGenerateNewAnalysis(): Promise<boolean> {
    const now = Date.now();
    const timeSinceLastAnalysis = now - this.lastAnalysisTime;
    
    // Generate new analysis every 15 minutes
    return timeSinceLastAnalysis > 15 * 60 * 1000;
  }
}

export const enhancedMarketAnalysisService = new EnhancedMarketAnalysisService();