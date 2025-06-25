/**
 * STEP 39: Waides KI Trend Profiler - ETH Direction Detection
 * 
 * Advanced trend analysis engine that detects ETH up/down/sideways movements
 * with sophisticated technical indicators and momentum analysis.
 */

import { CandleData } from './waidesKIPriceFeed.js';

export interface TrendAnalysis {
  trend: 'up' | 'down' | 'sideways';
  strength: number; // 0-1 scale
  price_change: number; // percentage change
  momentum: number; // -1 to 1 scale
  volume_profile: 'increasing' | 'decreasing' | 'stable';
  confidence: number; // 0-1 scale
  indicators: {
    ema_alignment: boolean;
    rsi_signal: 'oversold' | 'overbought' | 'neutral';
    volume_confirmation: boolean;
    breakout_detected: boolean;
  };
  reasoning: string[];
}

export interface TrendStats {
  total_analyses: number;
  trend_distribution: {
    up: number;
    down: number;
    sideways: number;
  };
  average_strength: number;
  average_confidence: number;
  recent_accuracy: number;
}

export class WaidesKITrendProfiler {
  private analysis_history: TrendAnalysis[];
  private max_history: number;
  private stats: TrendStats;

  constructor() {
    this.analysis_history = [];
    this.max_history = 200;
    this.stats = {
      total_analyses: 0,
      trend_distribution: {
        up: 0,
        down: 0,
        sideways: 0
      },
      average_strength: 0,
      average_confidence: 0,
      recent_accuracy: 0
    };
  }

  /**
   * Detect trend from candlestick data with comprehensive analysis
   */
  detectTrend(candles: CandleData[]): TrendAnalysis {
    try {
      if (!candles || candles.length < 20) {
        return this.getDefaultAnalysis('Insufficient data for analysis');
      }

      const closes = candles.map(c => c.close);
      const highs = candles.map(c => c.high);
      const lows = candles.map(c => c.low);
      const volumes = candles.map(c => c.volume);

      // Calculate price change
      const price_change = ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100;

      // Determine basic trend
      let trend: 'up' | 'down' | 'sideways' = 'sideways';
      if (price_change > 1) {
        trend = 'up';
      } else if (price_change < -1) {
        trend = 'down';
      }

      // Calculate indicators
      const ema_alignment = this.calculateEMAAlignment(closes);
      const rsi_signal = this.calculateRSI(closes);
      const volume_confirmation = this.analyzeVolume(volumes, closes);
      const breakout_detected = this.detectBreakout(highs, lows, closes);

      // Calculate momentum
      const momentum = this.calculateMomentum(closes);

      // Calculate strength (0-1 scale)
      const strength = Math.min(Math.abs(price_change) / 5, 1);

      // Get volume profile
      const volume_profile = this.getVolumeProfile(volumes);

      // Build reasoning
      const reasoning: string[] = [];
      reasoning.push(`Price change: ${price_change.toFixed(2)}%`);
      reasoning.push(`EMA alignment: ${ema_alignment ? 'aligned' : 'mixed'}`);
      reasoning.push(`RSI signal: ${rsi_signal}`);
      reasoning.push(`Volume: ${volume_profile}`);
      reasoning.push(`Momentum: ${momentum.toFixed(3)}`);

      if (breakout_detected) {
        reasoning.push('Breakout pattern detected');
      }

      // Calculate confidence based on indicator agreement
      let confidence = 0.5; // base confidence
      
      if (ema_alignment) confidence += 0.2;
      if (volume_confirmation) confidence += 0.2;
      if (breakout_detected) confidence += 0.1;
      
      // Adjust confidence based on strength
      confidence += strength * 0.1;
      
      confidence = Math.min(confidence, 1);

      const analysis: TrendAnalysis = {
        trend,
        strength,
        price_change,
        momentum,
        volume_profile,
        confidence,
        indicators: {
          ema_alignment,
          rsi_signal,
          volume_confirmation,
          breakout_detected
        },
        reasoning
      };

      // Store analysis and update stats
      this.analysis_history.push(analysis);
      if (this.analysis_history.length > this.max_history) {
        this.analysis_history.shift();
      }
      
      this.updateStats(analysis);
      
      return analysis;
    } catch (error) {
      console.error('Error in trend analysis:', error);
      return this.getDefaultAnalysis('Analysis error occurred');
    }
  }

  /**
   * Calculate EMA alignment (9, 21, 50 periods)
   */
  private calculateEMAAlignment(closes: number[]): boolean {
    if (closes.length < 50) return false;

    const ema9 = this.calculateEMA(closes, 9);
    const ema21 = this.calculateEMA(closes, 21);
    const ema50 = this.calculateEMA(closes, 50);

    // Check if EMAs are in alignment (bullish: 9 > 21 > 50, bearish: 9 < 21 < 50)
    return (ema9 > ema21 && ema21 > ema50) || (ema9 < ema21 && ema21 < ema50);
  }

  /**
   * Calculate EMA (Exponential Moving Average)
   */
  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];

    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }

  /**
   * Calculate RSI signal
   */
  private calculateRSI(closes: number[], period: number = 14): 'oversold' | 'overbought' | 'neutral' {
    if (closes.length < period + 1) return 'neutral';

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate RSI using smoothed averages
    for (let i = period + 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    if (rsi < 30) return 'oversold';
    if (rsi > 70) return 'overbought';
    return 'neutral';
  }

  /**
   * Analyze volume confirmation
   */
  private analyzeVolume(volumes: number[], closes: number[]): boolean {
    if (volumes.length < 10 || closes.length < 10) return false;

    const recentVolumes = volumes.slice(-5);
    const previousVolumes = volumes.slice(-10, -5);
    const recentPrices = closes.slice(-5);
    const previousPrices = closes.slice(-10, -5);

    const avgRecentVolume = recentVolumes.reduce((sum, vol) => sum + vol, 0) / recentVolumes.length;
    const avgPreviousVolume = previousVolumes.reduce((sum, vol) => sum + vol, 0) / previousVolumes.length;

    const recentPriceChange = recentPrices[recentPrices.length - 1] - recentPrices[0];
    const volumeIncrease = avgRecentVolume > avgPreviousVolume * 1.2;

    // Volume confirmation: higher volume with price movement
    return Math.abs(recentPriceChange) > 0 && volumeIncrease;
  }

  /**
   * Detect breakout patterns
   */
  private detectBreakout(highs: number[], lows: number[], closes: number[]): boolean {
    if (highs.length < 20) return false;

    const recent = 5;
    const lookback = 15;

    const recentHighs = highs.slice(-recent);
    const recentLows = lows.slice(-recent);
    const recentCloses = closes.slice(-recent);

    const priorHighs = highs.slice(-lookback, -recent);
    const priorLows = lows.slice(-lookback, -recent);

    const maxPriorHigh = Math.max(...priorHighs);
    const minPriorLow = Math.min(...priorLows);

    const currentHigh = Math.max(...recentHighs);
    const currentLow = Math.min(...recentLows);
    const currentClose = recentCloses[recentCloses.length - 1];

    // Breakout above resistance or below support
    const bullishBreakout = currentHigh > maxPriorHigh && currentClose > maxPriorHigh * 0.99;
    const bearishBreakout = currentLow < minPriorLow && currentClose < minPriorLow * 1.01;

    return bullishBreakout || bearishBreakout;
  }

  /**
   * Calculate momentum
   */
  private calculateMomentum(closes: number[]): number {
    if (closes.length < 10) return 0;

    const recent = closes.slice(-5);
    const previous = closes.slice(-10, -5);

    const recentAvg = recent.reduce((sum, price) => sum + price, 0) / recent.length;
    const previousAvg = previous.reduce((sum, price) => sum + price, 0) / previous.length;

    const momentum = (recentAvg - previousAvg) / previousAvg;
    
    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, momentum * 10));
  }

  /**
   * Get volume profile
   */
  private getVolumeProfile(volumes: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (volumes.length < 10) return 'stable';

    const recent = volumes.slice(-5);
    const previous = volumes.slice(-10, -5);

    const recentAvg = recent.reduce((sum, vol) => sum + vol, 0) / recent.length;
    const previousAvg = previous.reduce((sum, vol) => sum + vol, 0) / previous.length;

    const change = (recentAvg - previousAvg) / previousAvg;

    if (change > 0.2) return 'increasing';
    if (change < -0.2) return 'decreasing';
    return 'stable';
  }

  /**
   * Get default analysis for error cases
   */
  private getDefaultAnalysis(reason: string): TrendAnalysis {
    return {
      trend: 'sideways',
      strength: 0,
      price_change: 0,
      momentum: 0,
      volume_profile: 'stable',
      confidence: 0.1,
      indicators: {
        ema_alignment: false,
        rsi_signal: 'neutral',
        volume_confirmation: false,
        breakout_detected: false
      },
      reasoning: [reason]
    };
  }

  /**
   * Update statistics
   */
  private updateStats(analysis: TrendAnalysis): void {
    this.stats.total_analyses++;
    this.stats.trend_distribution[analysis.trend]++;
    
    // Update running averages
    const total = this.stats.total_analyses;
    this.stats.average_strength = ((this.stats.average_strength * (total - 1)) + analysis.strength) / total;
    this.stats.average_confidence = ((this.stats.average_confidence * (total - 1)) + analysis.confidence) / total;
    
    // Calculate recent accuracy (simplified)
    if (this.analysis_history.length >= 10) {
      const recentAnalyses = this.analysis_history.slice(-10);
      const accurateCount = recentAnalyses.filter(a => a.confidence > 0.7).length;
      this.stats.recent_accuracy = accurateCount / recentAnalyses.length;
    }
  }

  /**
   * Get trend statistics
   */
  getStats(): TrendStats {
    return { ...this.stats };
  }

  /**
   * Get analysis history
   */
  getHistory(limit: number = 20): TrendAnalysis[] {
    return this.analysis_history.slice(-limit);
  }

  /**
   * Get trend summary for timeframe
   */
  getTrendSummary(): {
    current_trend: 'up' | 'down' | 'sideways';
    trend_strength: number;
    confidence_level: number;
    dominant_trend: 'up' | 'down' | 'sideways';
    trend_consistency: number;
  } {
    if (this.analysis_history.length === 0) {
      return {
        current_trend: 'sideways',
        trend_strength: 0,
        confidence_level: 0,
        dominant_trend: 'sideways',
        trend_consistency: 0
      };
    }

    const latest = this.analysis_history[this.analysis_history.length - 1];
    const recent = this.analysis_history.slice(-10);

    // Calculate dominant trend from recent analyses
    const trendCounts = recent.reduce((counts, analysis) => {
      counts[analysis.trend]++;
      return counts;
    }, { up: 0, down: 0, sideways: 0 } as { [key: string]: number });

    const dominant_trend = Object.keys(trendCounts).reduce((a, b) => 
      trendCounts[a] > trendCounts[b] ? a : b
    ) as 'up' | 'down' | 'sideways';

    // Calculate consistency (how often the trend matches the dominant trend)
    const consistency_count = recent.filter(a => a.trend === dominant_trend).length;
    const trend_consistency = consistency_count / recent.length;

    return {
      current_trend: latest.trend,
      trend_strength: latest.strength,
      confidence_level: latest.confidence,
      dominant_trend,
      trend_consistency
    };
  }

  /**
   * Clear analysis history
   */
  clearHistory(): void {
    this.analysis_history = [];
    this.stats = {
      total_analyses: 0,
      trend_distribution: {
        up: 0,
        down: 0,
        sideways: 0
      },
      average_strength: 0,
      average_confidence: 0,
      recent_accuracy: 0
    };
  }
}

export const waidesKITrendProfiler = new WaidesKITrendProfiler();