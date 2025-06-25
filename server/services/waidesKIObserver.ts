import { storage } from '../storage';

interface MarketIndicators {
  price: number;
  ema50: number;
  ema200: number;
  vwap: number;
  rsi: number;
  volume: number;
  trend: 'UPTREND' | 'DOWNTREND' | 'RANGING';
  vwap_status: 'ABOVE' | 'BELOW';
  timestamp: number;
}

interface SignalStrengthAnalysis {
  score: number;
  maxScore: number;
  confidence: number;
  reasoning: string[];
  shouldTrade: boolean;
}

export class WaidesKIObserver {
  private currentIndicators: MarketIndicators | null = null;
  private observationHistory: MarketIndicators[] = [];
  private signalThreshold: number = 75; // 75% confidence minimum
  private isObserving: boolean = false;

  constructor() {
    this.startContinuousObservation();
  }

  // REAL-TIME MARKET DATA FETCHING
  async fetchMarketData(): Promise<MarketIndicators | null> {
    try {
      // Get latest ETH data
      const ethData = await storage.getLatestEthData();
      if (!ethData) return null;

      // Get recent candlesticks for calculations
      const candles = await storage.getCandlestickHistory('ETHUSDT', '1m', 50);
      if (!candles || candles.length < 20) return null;

      // Calculate indicators
      const rsi = this.calculateRSI(candles);
      const ema50 = this.calculateEMA(candles, 50);
      const ema200 = this.calculateEMA(candles, 200);
      const vwap = this.calculateVWAP(candles);
      const volume = candles[candles.length - 1]?.volume || 0;

      const indicators: MarketIndicators = {
        price: ethData.price,
        ema50,
        ema200,
        vwap,
        rsi,
        volume,
        trend: this.analyzeTrend(ethData.price, ema50, ema200),
        vwap_status: ethData.price > vwap ? 'ABOVE' : 'BELOW',
        timestamp: Date.now()
      };

      this.currentIndicators = indicators;
      this.updateObservationHistory(indicators);

      return indicators;
    } catch (error) {
      return null; // Silent error handling
    }
  }

  // SIGNAL STRENGTH ASSESSMENT (Enhanced version)
  assessSignalStrength(indicators: MarketIndicators): SignalStrengthAnalysis {
    let score = 0;
    const maxScore = 100;
    const reasoning: string[] = [];

    // 1. Trend + VWAP Alignment (30 points)
    if (indicators.trend === 'UPTREND' && indicators.vwap_status === 'ABOVE') {
      score += 30;
      reasoning.push('Strong bullish alignment: Uptrend + Above VWAP');
    } else if (indicators.trend === 'DOWNTREND' && indicators.vwap_status === 'BELOW') {
      score += 30;
      reasoning.push('Strong bearish alignment: Downtrend + Below VWAP');
    } else if (indicators.trend === 'UPTREND' && indicators.vwap_status === 'BELOW') {
      score += 10;
      reasoning.push('Weak bullish: Uptrend but below VWAP');
    } else if (indicators.trend === 'DOWNTREND' && indicators.vwap_status === 'ABOVE') {
      score += 10;
      reasoning.push('Weak bearish: Downtrend but above VWAP');
    } else {
      reasoning.push('Neutral: Ranging market with mixed signals');
    }

    // 2. RSI Positioning (25 points)
    if (indicators.rsi > 70) {
      score += 5;
      reasoning.push('RSI overbought - bearish signal');
    } else if (indicators.rsi < 30) {
      score += 5;
      reasoning.push('RSI oversold - bullish signal');
    } else if (indicators.rsi >= 40 && indicators.rsi <= 60) {
      score += 25;
      reasoning.push('RSI in optimal range (40-60) - clear directional bias');
    } else if (indicators.rsi > 50 && indicators.trend === 'UPTREND') {
      score += 20;
      reasoning.push('RSI confirms uptrend momentum');
    } else if (indicators.rsi < 50 && indicators.trend === 'DOWNTREND') {
      score += 20;
      reasoning.push('RSI confirms downtrend momentum');
    }

    // 3. EMA Structure Quality (20 points)
    const emaSpread = Math.abs(indicators.ema50 - indicators.ema200) / indicators.price;
    if (emaSpread > 0.02) { // 2% spread = strong trend
      score += 20;
      reasoning.push('Strong EMA divergence indicates established trend');
    } else if (emaSpread > 0.01) { // 1% spread = moderate trend
      score += 15;
      reasoning.push('Moderate EMA separation');
    } else {
      score += 5;
      reasoning.push('EMAs too close - weak trend structure');
    }

    // 4. Price Action Quality (15 points)
    const priceVsEMA50 = (indicators.price - indicators.ema50) / indicators.ema50;
    if (Math.abs(priceVsEMA50) < 0.005) { // Within 0.5% of EMA50
      score += 15;
      reasoning.push('Price near EMA50 - optimal entry zone');
    } else if (Math.abs(priceVsEMA50) < 0.015) { // Within 1.5%
      score += 10;
      reasoning.push('Price reasonably close to EMA50');
    } else {
      score += 5;
      reasoning.push('Price extended from EMA50 - higher risk');
    }

    // 5. Volume Confirmation (10 points)
    const avgVolume = this.getAverageVolume();
    if (indicators.volume > avgVolume * 1.5) {
      score += 10;
      reasoning.push('High volume confirms signal strength');
    } else if (indicators.volume > avgVolume * 1.2) {
      score += 7;
      reasoning.push('Above average volume');
    } else if (indicators.volume < avgVolume * 0.7) {
      score -= 5;
      reasoning.push('Low volume weakens signal');
    }

    const confidence = Math.min(Math.max(score, 0), maxScore);
    const shouldTrade = confidence >= this.signalThreshold;

    return {
      score,
      maxScore,
      confidence,
      reasoning,
      shouldTrade
    };
  }

  // GET CURRENT MARKET ASSESSMENT
  getCurrentAssessment(): {
    indicators: MarketIndicators | null;
    signalStrength: SignalStrengthAnalysis | null;
    recommendation: string;
  } {
    if (!this.currentIndicators) {
      return {
        indicators: null,
        signalStrength: null,
        recommendation: 'No market data available'
      };
    }

    const signalStrength = this.assessSignalStrength(this.currentIndicators);
    
    let recommendation: string;
    if (signalStrength.shouldTrade) {
      if (this.currentIndicators.trend === 'UPTREND') {
        recommendation = 'STRONG BUY SIGNAL';
      } else if (this.currentIndicators.trend === 'DOWNTREND') {
        recommendation = 'STRONG SELL SIGNAL';
      } else {
        recommendation = 'TRADE WITH CAUTION';
      }
    } else {
      recommendation = 'WAIT FOR BETTER SETUP';
    }

    return {
      indicators: this.currentIndicators,
      signalStrength,
      recommendation
    };
  }

  // OBSERVATION PATTERN ANALYSIS
  analyzeObservationPatterns(): {
    trendConsistency: number;
    volatility: number;
    volumeProfile: string;
    marketPhase: string;
  } {
    if (this.observationHistory.length < 10) {
      return {
        trendConsistency: 0,
        volatility: 0,
        volumeProfile: 'INSUFFICIENT_DATA',
        marketPhase: 'LEARNING'
      };
    }

    const recent = this.observationHistory.slice(-20);
    
    // Trend consistency
    const uptrendCount = recent.filter(obs => obs.trend === 'UPTREND').length;
    const downtrendCount = recent.filter(obs => obs.trend === 'DOWNTREND').length;
    const trendConsistency = Math.max(uptrendCount, downtrendCount) / recent.length;

    // Volatility calculation
    const priceChanges = recent.slice(1).map((obs, i) => 
      Math.abs(obs.price - recent[i].price) / recent[i].price
    );
    const volatility = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;

    // Volume profile
    const avgVolume = recent.reduce((sum, obs) => sum + obs.volume, 0) / recent.length;
    const currentVolume = recent[recent.length - 1].volume;
    let volumeProfile: string;
    if (currentVolume > avgVolume * 1.5) volumeProfile = 'HIGH';
    else if (currentVolume < avgVolume * 0.7) volumeProfile = 'LOW';
    else volumeProfile = 'NORMAL';

    // Market phase
    let marketPhase: string;
    if (trendConsistency > 0.7) marketPhase = 'TRENDING';
    else if (volatility > 0.02) marketPhase = 'VOLATILE';
    else marketPhase = 'RANGING';

    return {
      trendConsistency,
      volatility,
      volumeProfile,
      marketPhase
    };
  }

  // PRIVATE HELPER METHODS
  private startContinuousObservation(): void {
    this.isObserving = true;
    
    // Fetch market data every 15 seconds
    setInterval(async () => {
      if (this.isObserving) {
        await this.fetchMarketData();
      }
    }, 15000);
  }

  private updateObservationHistory(indicators: MarketIndicators): void {
    this.observationHistory.push(indicators);
    
    // Keep only last 200 observations (about 50 minutes of data)
    if (this.observationHistory.length > 200) {
      this.observationHistory = this.observationHistory.slice(-200);
    }
  }

  private analyzeTrend(price: number, ema50: number, ema200: number): 'UPTREND' | 'DOWNTREND' | 'RANGING' {
    if (price > ema50 && ema50 > ema200) return 'UPTREND';
    if (price < ema50 && ema50 < ema200) return 'DOWNTREND';
    return 'RANGING';
  }

  private calculateRSI(candles: any[], period: number = 14): number {
    if (candles.length < period + 1) return 50;
    
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < candles.length; i++) {
      const change = candles[i].close - candles[i-1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateEMA(candles: any[], period: number): number {
    if (candles.length < period) return candles[candles.length - 1]?.close || 0;
    
    const multiplier = 2 / (period + 1);
    let ema = candles.slice(0, period).reduce((sum, candle) => sum + candle.close, 0) / period;
    
    for (let i = period; i < candles.length; i++) {
      ema = (candles[i].close * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  private calculateVWAP(candles: any[]): number {
    let volumeSum = 0;
    let priceVolumeSum = 0;
    
    for (const candle of candles) {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      priceVolumeSum += typicalPrice * candle.volume;
      volumeSum += candle.volume;
    }
    
    return volumeSum > 0 ? priceVolumeSum / volumeSum : 0;
  }

  private getAverageVolume(): number {
    if (this.observationHistory.length === 0) return 0;
    
    const recent = this.observationHistory.slice(-20);
    return recent.reduce((sum, obs) => sum + obs.volume, 0) / recent.length;
  }

  // PUBLIC INTERFACE METHODS
  setSignalThreshold(threshold: number): void {
    this.signalThreshold = Math.max(Math.min(threshold, 100), 0);
  }

  getObservationStats(): any {
    return {
      totalObservations: this.observationHistory.length,
      isObserving: this.isObserving,
      signalThreshold: this.signalThreshold,
      lastUpdate: this.currentIndicators?.timestamp || 0,
      patterns: this.analyzeObservationPatterns()
    };
  }

  stopObservation(): void {
    this.isObserving = false;
  }

  resumeObservation(): void {
    this.isObserving = true;
  }
}

export const waidesKIObserver = new WaidesKIObserver();