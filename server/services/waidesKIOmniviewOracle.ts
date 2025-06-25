/**
 * STEP 39: Waides KI Omniview Oracle - ETH3L/ETH3S Dual-Motion Intelligence
 * 
 * The third eye of Waides KI that scans all timeframes simultaneously,
 * automatically deciding between ETH3L (bullish) and ETH3S (bearish) positions
 * based on multi-timeframe trend confirmation.
 */

import { waidesKIPriceFeed } from './waidesKIPriceFeed';
import { waidesKITrendProfiler } from './waidesKITrendProfiler';

export interface OmniviewDecision {
  decision: 'ETH3L' | 'ETH3S' | 'NO_TRADE';
  confidence: number;
  timeframe_analysis: {
    [timeframe: string]: {
      trend: 'up' | 'down' | 'sideways';
      strength: number;
      price_change: number;
    };
  };
  agreement_score: number;
  reasoning: string[];
  vision_timestamp: string;
}

export interface OmniviewStats {
  total_scans: number;
  eth3l_signals: number;
  eth3s_signals: number;
  no_trade_signals: number;
  last_decision: OmniviewDecision | null;
  average_confidence: number;
  timeframe_reliability: {
    [timeframe: string]: {
      accuracy: number;
      total_signals: number;
    };
  };
}

export class WaidesKIOmniviewOracle {
  private required_agreement: number;
  private timeframes: string[];
  private stats: OmniviewStats;
  private scan_history: OmniviewDecision[];
  private max_history: number;

  constructor() {
    this.required_agreement = 2; // Minimum timeframes that must agree
    this.timeframes = ['15m', '1h', '4h', '1d'];
    this.max_history = 100;
    this.stats = {
      total_scans: 0,
      eth3l_signals: 0,
      eth3s_signals: 0,
      no_trade_signals: 0,
      last_decision: null,
      average_confidence: 0,
      timeframe_reliability: {}
    };
    this.scan_history = [];

    // Initialize timeframe reliability tracking
    this.timeframes.forEach(tf => {
      this.stats.timeframe_reliability[tf] = {
        accuracy: 0.5,
        total_signals: 0
      };
    });
  }

  /**
   * Perform comprehensive omniview scan across all timeframes
   */
  async scanAllTimeframes(): Promise<OmniviewDecision> {
    const timeframe_analysis: { [timeframe: string]: any } = {};
    const trends: string[] = [];
    const reasoning: string[] = [];

    try {
      // Scan each timeframe for trend analysis
      for (const timeframe of this.timeframes) {
        try {
          const candles = await waidesKIPriceFeed.getBinanceData('ETHUSDT', timeframe, 50);
          const trend_data = waidesKITrendProfiler.detectTrend(candles);
          
          timeframe_analysis[timeframe] = {
            trend: trend_data.trend,
            strength: trend_data.strength,
            price_change: trend_data.price_change
          };

          trends.push(trend_data.trend);
          reasoning.push(`${timeframe}: ${trend_data.trend} (${(trend_data.strength * 100).toFixed(1)}% strength)`);
          
          // Update reliability stats
          this.stats.timeframe_reliability[timeframe].total_signals++;
        } catch (error) {
          console.error(`Error scanning ${timeframe}:`, error);
          timeframe_analysis[timeframe] = {
            trend: 'sideways',
            strength: 0,
            price_change: 0
          };
          trends.push('sideways');
          reasoning.push(`${timeframe}: error - defaulting to sideways`);
        }
      }

      // Count votes for each direction
      const up_votes = trends.filter(t => t === 'up').length;
      const down_votes = trends.filter(t => t === 'down').length;
      const sideways_votes = trends.filter(t => t === 'sideways').length;

      // Calculate agreement score
      const total_timeframes = this.timeframes.length;
      const max_votes = Math.max(up_votes, down_votes, sideways_votes);
      const agreement_score = max_votes / total_timeframes;

      // Make decision based on agreement
      let decision: 'ETH3L' | 'ETH3S' | 'NO_TRADE';
      let confidence: number;

      if (up_votes >= this.required_agreement && up_votes > down_votes) {
        decision = 'ETH3L';
        confidence = Math.min(0.95, 0.5 + (up_votes / total_timeframes) * 0.5);
        reasoning.push(`✅ ETH3L: ${up_votes}/${total_timeframes} timeframes bullish`);
      } else if (down_votes >= this.required_agreement && down_votes > up_votes) {
        decision = 'ETH3S';
        confidence = Math.min(0.95, 0.5 + (down_votes / total_timeframes) * 0.5);
        reasoning.push(`✅ ETH3S: ${down_votes}/${total_timeframes} timeframes bearish`);
      } else {
        decision = 'NO_TRADE';
        confidence = 0.3 + (sideways_votes / total_timeframes) * 0.3;
        reasoning.push(`⚠️ NO_TRADE: Insufficient agreement (up:${up_votes}, down:${down_votes}, sideways:${sideways_votes})`);
      }

      // Create decision object
      const omniview_decision: OmniviewDecision = {
        decision,
        confidence,
        timeframe_analysis,
        agreement_score,
        reasoning,
        vision_timestamp: new Date().toISOString()
      };

      // Update statistics
      this.updateStats(omniview_decision);

      // Store in history
      this.scan_history.push(omniview_decision);
      if (this.scan_history.length > this.max_history) {
        this.scan_history.shift();
      }

      return omniview_decision;

    } catch (error) {
      console.error('Error in omniview scan:', error);
      
      // Return safe default decision
      const default_decision: OmniviewDecision = {
        decision: 'NO_TRADE',
        confidence: 0.1,
        timeframe_analysis: {},
        agreement_score: 0,
        reasoning: ['Error during scan - defaulting to NO_TRADE for safety'],
        vision_timestamp: new Date().toISOString()
      };

      this.updateStats(default_decision);
      return default_decision;
    }
  }

  /**
   * Get quick omniview status without full scan
   */
  getQuickStatus(): {
    last_decision: OmniviewDecision | null;
    next_scan_available: boolean;
    scan_count: number;
    current_mode: string;
  } {
    return {
      last_decision: this.stats.last_decision,
      next_scan_available: true,
      scan_count: this.stats.total_scans,
      current_mode: this.stats.last_decision?.decision || 'UNKNOWN'
    };
  }

  /**
   * Update internal statistics
   */
  private updateStats(decision: OmniviewDecision): void {
    this.stats.total_scans++;
    this.stats.last_decision = decision;

    // Count decision types
    if (decision.decision === 'ETH3L') {
      this.stats.eth3l_signals++;
    } else if (decision.decision === 'ETH3S') {
      this.stats.eth3s_signals++;
    } else {
      this.stats.no_trade_signals++;
    }

    // Update average confidence
    const total_confidence = this.scan_history.reduce((sum, d) => sum + d.confidence, 0);
    this.stats.average_confidence = total_confidence / this.scan_history.length;
  }

  /**
   * Get comprehensive statistics
   */
  getStats(): OmniviewStats {
    return { ...this.stats };
  }

  /**
   * Get scan history
   */
  getScanHistory(limit: number = 20): OmniviewDecision[] {
    return this.scan_history.slice(-limit);
  }

  /**
   * Get timeframe performance analysis
   */
  getTimeframeAnalysis(): {
    [timeframe: string]: {
      bullish_signals: number;
      bearish_signals: number;
      sideways_signals: number;
      accuracy_score: number;
    };
  } {
    const analysis: any = {};

    this.timeframes.forEach(tf => {
      const tf_decisions = this.scan_history.filter(d => 
        d.timeframe_analysis[tf]
      );

      analysis[tf] = {
        bullish_signals: tf_decisions.filter(d => d.timeframe_analysis[tf]?.trend === 'up').length,
        bearish_signals: tf_decisions.filter(d => d.timeframe_analysis[tf]?.trend === 'down').length,
        sideways_signals: tf_decisions.filter(d => d.timeframe_analysis[tf]?.trend === 'sideways').length,
        accuracy_score: this.stats.timeframe_reliability[tf]?.accuracy || 0.5
      };
    });

    return analysis;
  }

  /**
   * Force clear scan history
   */
  clearHistory(): void {
    this.scan_history = [];
    this.stats = {
      total_scans: 0,
      eth3l_signals: 0,
      eth3s_signals: 0,
      no_trade_signals: 0,
      last_decision: null,
      average_confidence: 0,
      timeframe_reliability: {}
    };

    // Reinitialize timeframe reliability
    this.timeframes.forEach(tf => {
      this.stats.timeframe_reliability[tf] = {
        accuracy: 0.5,
        total_signals: 0
      };
    });
  }

  /**
   * Update required agreement threshold
   */
  setRequiredAgreement(agreement: number): void {
    if (agreement >= 1 && agreement <= this.timeframes.length) {
      this.required_agreement = agreement;
    }
  }

  /**
   * Get current configuration
   */
  getConfiguration(): {
    required_agreement: number;
    timeframes: string[];
    max_history: number;
  } {
    return {
      required_agreement: this.required_agreement,
      timeframes: [...this.timeframes],
      max_history: this.max_history
    };
  }
}

export const waidesKIOmniviewOracle = new WaidesKIOmniviewOracle();