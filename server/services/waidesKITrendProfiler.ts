/**
 * STEP 39: Waides KI Trend Profiler - ETH Direction Detection
 * 
 * Advanced trend analysis engine that detects ETH up/down/sideways movements
 * with sophisticated technical indicators and momentum analysis.
 */

import { CandleData } from './waidesKIPriceFeed';

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
    this.max_history = 100;
    this.stats = {
      total_analyses: 0,
      trend_distribution: { up: 0, down: 0, sideways: 0 },
      average_strength: 0,
      average_confidence: 0,
      recent_accuracy: 0.5
    };
  }

  /**
   * Detect trend from candlestick data with comprehensive analysis
   */
  detectTrend(candles: CandleData[]): TrendAnalysis {
    if (!candles || candles.length < 10) {
      return this.getDefaultAnalysis('Insufficient data for analysis');
    }

    try {
      const reasoning: string[] = [];
      
      // Extract price data
      const closes = candles.map(c => c.close);
      const volumes = candles.map(c => c.volume);
      const highs = candles.map(c => c.high);
      const lows = candles.map(c => c.low);

      // 1. Basic price change analysis
      const price_change = (closes[closes.length - 1] - closes[0]) / closes[0];
      const abs_change = Math.abs(price_change);
      reasoning.push(`Price change: ${(price_change * 100).toFixed(2)}%`);

      // 2. EMA alignment analysis
      const ema_alignment = this.calculateEMAAlignment(closes);
      reasoning.push(`EMA alignment: ${ema_alignment ? 'aligned' : 'conflicted'}`);

      // 3. RSI analysis
      const rsi_signal = this.calculateRSI(closes);
      reasoning.push(`RSI signal: ${rsi_signal}`);

      // 4. Volume analysis
      const volume_confirmation = this.analyzeVolume(volumes, closes);
      reasoning.push(`Volume confirmation: ${volume_confirmation ? 'confirmed' : 'weak'}`);

      // 5. Breakout detection
      const breakout_detected = this.detectBreakout(highs, lows, closes);
      reasoning.push(`Breakout: ${breakout_detected ? 'detected' : 'none'}`);

      // 6. Momentum calculation
      const momentum = this.calculateMomentum(closes);
      reasoning.push(`Momentum: ${momentum.toFixed(3)}`);

      // 7. Volume profile
      const volume_profile = this.getVolumeProfile(volumes);
      reasoning.push(`Volume profile: ${volume_profile}`);

      // Determine trend based on multiple factors
      let trend: 'up' | 'down' | 'sideways';
      let strength: number;
      let confidence: number;

      // Sideways threshold
      const sideways_threshold = 0.005; // 0.5%

      if (abs_change < sideways_threshold) {
        trend = 'sideways';
        strength = 1 - (abs_change / sideways_threshold);
        confidence = 0.6 + (strength * 0.3);
        reasoning.push('Trend: sideways - low price movement');
      } else {
        // Determine direction
        trend = price_change > 0 ? 'up' : 'down';
        
        // Calculate strength based on multiple factors
        let strength_factors = 0;
        let factor_count = 0;

        // Price change factor
        strength_factors += Math.min(abs_change * 50, 1); // Cap at 1
        factor_count++;

        // EMA alignment factor
        if (ema_alignment) {
          strength_factors += 0.8;
        } else {
          strength_factors += 0.2;
        }
        factor_count++;

        // Volume confirmation factor
        if (volume_confirmation) {
          strength_factors += 0.7;
        } else {
          strength_factors += 0.3;
        }
        factor_count++;

        // Momentum factor
        const momentum_strength = Math.abs(momentum);
        strength_factors += momentum_strength;
        factor_count++;

        // Breakout factor
        if (breakout_detected) {
          strength_factors += 0.9;
        } else {
          strength_factors += 0.1;
        }
        factor_count++;

        strength = Math.min(strength_factors / factor_count, 1);

        // Calculate confidence
        let confidence_factors = 0;
        let conf_count = 0;

        // RSI confirmation
        if ((trend === 'up' && rsi_signal !== 'overbought') || 
            (trend === 'down' && rsi_signal !== 'oversold')) {
          confidence_factors += 0.8;
        } else {
          confidence_factors += 0.4;
        }
        conf_count++;

        // Volume confirmation
        confidence_factors += volume_confirmation ? 0.9 : 0.3;
        conf_count++;

        // EMA alignment
        confidence_factors += ema_alignment ? 0.8 : 0.2;
        conf_count++;

        // Strength factor
        confidence_factors += strength;
        conf_count++;

        confidence = Math.min(confidence_factors / conf_count, 0.95);
        
        reasoning.push(`Trend: ${trend} - strength: ${(strength * 100).toFixed(1)}%`);
      }

      // Create analysis result
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

      // Update statistics and history
      this.updateStats(analysis);
      this.analysis_history.push(analysis);
      if (this.analysis_history.length > this.max_history) {
        this.analysis_history.shift();
      }

      return analysis;

    } catch (error) {
      console.error('Error in trend detection:', error);
      return this.getDefaultAnalysis(`Analysis error: ${error}`);
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

    // Check if EMAs are aligned (all increasing or all decreasing)
    const trend_up = ema9 > ema21 && ema21 > ema50;
    const trend_down = ema9 < ema21 && ema21 < ema50;

    return trend_up || trend_down;
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

    // Calculate initial average gains/losses
    for (let i = 1; i <= period; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    let avg_gain = gains / period;
    let avg_loss = losses / period;

    // Calculate RSI for remaining periods
    for (let i = period + 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      avg_gain = ((avg_gain * (period - 1)) + gain) / period;
      avg_loss = ((avg_loss * (period - 1)) + loss) / period;
    }

    const rs = avg_gain / avg_loss;
    const rsi = 100 - (100 / (1 + rs));

    if (rsi > 70) return 'overbought';
    if (rsi < 30) return 'oversold';
    return 'neutral';
  }

  /**
   * Analyze volume confirmation
   */
  private analyzeVolume(volumes: number[], closes: number[]): boolean {
    if (volumes.length < 10 || closes.length < 10) return false;

    const recent_volumes = volumes.slice(-5);
    const earlier_volumes = volumes.slice(-10, -5);
    const recent_closes = closes.slice(-5);

    const avg_recent_volume = recent_volumes.reduce((sum, v) => sum + v, 0) / recent_volumes.length;
    const avg_earlier_volume = earlier_volumes.reduce((sum, v) => sum + v, 0) / earlier_volumes.length;

    const price_change = recent_closes[recent_closes.length - 1] - recent_closes[0];
    const volume_increase = avg_recent_volume > avg_earlier_volume;

    // Volume should increase with price movement for confirmation
    return Math.abs(price_change) > 0.001 && volume_increase;
  }

  /**
   * Detect breakout patterns
   */
  private detectBreakout(highs: number[], lows: number[], closes: number[]): boolean {
    if (highs.length < 20) return false;

    const recent_high = Math.max(...highs.slice(-5));
    const recent_low = Math.min(...lows.slice(-5));
    const previous_high = Math.max(...highs.slice(-20, -5));
    const previous_low = Math.min(...lows.slice(-20, -5));
    const current_price = closes[closes.length - 1];

    // Upward breakout
    const upward_breakout = current_price > previous_high && recent_high > previous_high;
    
    // Downward breakout
    const downward_breakout = current_price < previous_low && recent_low < previous_low;

    return upward_breakout || downward_breakout;
  }

  /**
   * Calculate momentum
   */
  private calculateMomentum(closes: number[]): number {
    if (closes.length < 10) return 0;

    const short_ma = closes.slice(-5).reduce((sum, price) => sum + price, 0) / 5;
    const long_ma = closes.slice(-10).reduce((sum, price) => sum + price, 0) / 10;

    return (short_ma - long_ma) / long_ma;
  }

  /**
   * Get volume profile
   */
  private getVolumeProfile(volumes: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (volumes.length < 10) return 'stable';

    const recent_avg = volumes.slice(-5).reduce((sum, v) => sum + v, 0) / 5;
    const earlier_avg = volumes.slice(-10, -5).reduce((sum, v) => sum + v, 0) / 5;

    const change = (recent_avg - earlier_avg) / earlier_avg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
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

    // Update averages
    const total = this.analysis_history.length + 1;
    this.stats.average_strength = 
      ((this.stats.average_strength * (total - 1)) + analysis.strength) / total;
    this.stats.average_confidence = 
      ((this.stats.average_confidence * (total - 1)) + analysis.confidence) / total;
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
    current_trend: 'up' | 'down' | 'sideways' | 'unknown';
    trend_strength: number;
    trend_duration: number;
    confidence: number;
  } {
    if (this.analysis_history.length === 0) {
      return {
        current_trend: 'unknown',
        trend_strength: 0,
        trend_duration: 0,
        confidence: 0
      };
    }

    const latest = this.analysis_history[this.analysis_history.length - 1];
    
    // Calculate trend duration (consecutive same trend)
    let duration = 1;
    for (let i = this.analysis_history.length - 2; i >= 0; i--) {
      if (this.analysis_history[i].trend === latest.trend) {
        duration++;
      } else {
        break;
      }
    }

    return {
      current_trend: latest.trend,
      trend_strength: latest.strength,
      trend_duration: duration,
      confidence: latest.confidence
    };
  }

  /**
   * Clear analysis history
   */
  clearHistory(): void {
    this.analysis_history = [];
    this.stats = {
      total_analyses: 0,
      trend_distribution: { up: 0, down: 0, sideways: 0 },
      average_strength: 0,
      average_confidence: 0,
      recent_accuracy: 0.5
    };
  }
}

export const waidesKITrendProfiler = new WaidesKITrendProfiler();