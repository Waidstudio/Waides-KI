/**
 * STEP 39: Waides KI Omniview Oracle - ETH3L/ETH3S Dual-Motion Intelligence
 * 
 * The third eye of Waides KI that scans all timeframes simultaneously,
 * automatically deciding between ETH3L (bullish) and ETH3S (bearish) positions
 * based on multi-timeframe trend confirmation.
 */

import { waidesKIPriceFeed } from './waidesKIPriceFeed.js';
import { waidesKITrendProfiler } from './waidesKITrendProfiler.js';

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
    this.required_agreement = 0.6; // 60% agreement required
    this.timeframes = ['5m', '15m', '1h', '4h', '1d'];
    this.max_history = 100;
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

    // Initialize timeframe reliability
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
    try {
      const timeframe_analysis: { [timeframe: string]: any } = {};
      const trend_votes: { up: number; down: number; sideways: number } = { up: 0, down: 0, sideways: 0 };
      const reasoning: string[] = [];

      // Analyze each timeframe
      for (const timeframe of this.timeframes) {
        try {
          const candles = await waidesKIPriceFeed.getBinanceData('ETHUSDT', timeframe, 50);
          const trendAnalysis = waidesKITrendProfiler.detectTrend(candles);
          
          timeframe_analysis[timeframe] = {
            trend: trendAnalysis.trend,
            strength: trendAnalysis.strength,
            price_change: trendAnalysis.price_change
          };

          // Weight votes by timeframe importance and strength
          const weight = this.getTimeframeWeight(timeframe) * trendAnalysis.strength;
          trend_votes[trendAnalysis.trend] += weight;

          reasoning.push(`${timeframe}: ${trendAnalysis.trend} (${trendAnalysis.strength.toFixed(2)} strength, ${trendAnalysis.price_change.toFixed(2)}%)`);
        } catch (error) {
          console.error(`Error analyzing timeframe ${timeframe}:`, error);
          timeframe_analysis[timeframe] = {
            trend: 'sideways',
            strength: 0,
            price_change: 0
          };
          reasoning.push(`${timeframe}: analysis failed`);
        }
      }

      // Calculate agreement score
      const total_votes = trend_votes.up + trend_votes.down + trend_votes.sideways;
      const max_votes = Math.max(trend_votes.up, trend_votes.down, trend_votes.sideways);
      const agreement_score = total_votes > 0 ? max_votes / total_votes : 0;

      // Determine decision based on weighted votes
      let decision: 'ETH3L' | 'ETH3S' | 'NO_TRADE' = 'NO_TRADE';
      let confidence = 0;

      if (agreement_score >= this.required_agreement) {
        if (trend_votes.up > trend_votes.down && trend_votes.up > trend_votes.sideways) {
          decision = 'ETH3L';
          confidence = Math.min(agreement_score + (trend_votes.up / total_votes) * 0.3, 1);
          reasoning.push(`Bullish consensus detected: ETH3L recommended`);
        } else if (trend_votes.down > trend_votes.up && trend_votes.down > trend_votes.sideways) {
          decision = 'ETH3S';
          confidence = Math.min(agreement_score + (trend_votes.down / total_votes) * 0.3, 1);
          reasoning.push(`Bearish consensus detected: ETH3S recommended`);
        }
      }

      if (decision === 'NO_TRADE') {
        reasoning.push(`Insufficient agreement (${(agreement_score * 100).toFixed(1)}% < ${(this.required_agreement * 100)}%)`);
        confidence = 0.1;
      }

      const omniview_decision: OmniviewDecision = {
        decision,
        confidence,
        timeframe_analysis,
        agreement_score,
        reasoning,
        vision_timestamp: new Date().toISOString()
      };

      // Store decision and update stats
      this.scan_history.push(omniview_decision);
      if (this.scan_history.length > this.max_history) {
        this.scan_history.shift();
      }

      this.updateStats(omniview_decision);

      return omniview_decision;
    } catch (error) {
      console.error('Error in omniview scan:', error);
      
      const default_decision: OmniviewDecision = {
        decision: 'NO_TRADE',
        confidence: 0,
        timeframe_analysis: {},
        agreement_score: 0,
        reasoning: ['Omniview scan failed - system error'],
        vision_timestamp: new Date().toISOString()
      };

      this.updateStats(default_decision);
      return default_decision;
    }
  }

  /**
   * Get timeframe weight for voting
   */
  private getTimeframeWeight(timeframe: string): number {
    const weights: { [key: string]: number } = {
      '5m': 0.8,   // Short-term noise, lower weight
      '15m': 1.0,  // Primary timeframe
      '1h': 1.2,   // Important intermediate trend
      '4h': 1.5,   // Strong trend confirmation
      '1d': 2.0    // Dominant trend, highest weight
    };
    return weights[timeframe] || 1.0;
  }

  /**
   * Get quick omniview status without full scan
   */
  getQuickStatus(): {
    last_scan_time: string | null;
    last_decision: 'ETH3L' | 'ETH3S' | 'NO_TRADE' | null;
    last_confidence: number;
    scan_frequency: string;
    timeframes_monitored: string[];
    agreement_threshold: number;
  } {
    const lastDecision = this.stats.last_decision;
    
    return {
      last_scan_time: lastDecision?.vision_timestamp || null,
      last_decision: lastDecision?.decision || null,
      last_confidence: lastDecision?.confidence || 0,
      scan_frequency: 'On-demand',
      timeframes_monitored: this.timeframes,
      agreement_threshold: this.required_agreement
    };
  }

  /**
   * Update internal statistics
   */
  private updateStats(decision: OmniviewDecision): void {
    this.stats.total_scans++;
    this.stats.last_decision = decision;

    // Count decision types
    switch (decision.decision) {
      case 'ETH3L':
        this.stats.eth3l_signals++;
        break;
      case 'ETH3S':
        this.stats.eth3s_signals++;
        break;
      case 'NO_TRADE':
        this.stats.no_trade_signals++;
        break;
    }

    // Update average confidence
    const total = this.stats.total_scans;
    this.stats.average_confidence = ((this.stats.average_confidence * (total - 1)) + decision.confidence) / total;

    // Update timeframe reliability (simplified)
    Object.keys(decision.timeframe_analysis).forEach(timeframe => {
      if (this.stats.timeframe_reliability[timeframe]) {
        this.stats.timeframe_reliability[timeframe].total_signals++;
        
        // Assume higher confidence decisions are more accurate (simplified)
        if (decision.confidence > 0.7) {
          const current = this.stats.timeframe_reliability[timeframe];
          current.accuracy = ((current.accuracy * (current.total_signals - 1)) + 0.8) / current.total_signals;
        }
      }
    });
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
    timeframe_weights: { [timeframe: string]: number };
    reliability_scores: { [timeframe: string]: number };
    most_reliable: string;
    least_reliable: string;
  } {
    const weights: { [timeframe: string]: number } = {};
    const reliability_scores: { [timeframe: string]: number } = {};

    this.timeframes.forEach(tf => {
      weights[tf] = this.getTimeframeWeight(tf);
      reliability_scores[tf] = this.stats.timeframe_reliability[tf]?.accuracy || 0.5;
    });

    const sortedByReliability = this.timeframes.sort((a, b) => 
      reliability_scores[b] - reliability_scores[a]
    );

    return {
      timeframe_weights: weights,
      reliability_scores,
      most_reliable: sortedByReliability[0] || '15m',
      least_reliable: sortedByReliability[sortedByReliability.length - 1] || '5m'
    };
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
    this.required_agreement = Math.max(0.1, Math.min(1.0, agreement));
  }

  /**
   * Get current configuration
   */
  getConfiguration(): {
    required_agreement: number;
    timeframes: string[];
    max_history: number;
    timeframe_weights: { [timeframe: string]: number };
  } {
    const timeframe_weights: { [timeframe: string]: number } = {};
    this.timeframes.forEach(tf => {
      timeframe_weights[tf] = this.getTimeframeWeight(tf);
    });

    return {
      required_agreement: this.required_agreement,
      timeframes: [...this.timeframes],
      max_history: this.max_history,
      timeframe_weights
    };
  }
}

export const waidesKIOmniviewOracle = new WaidesKIOmniviewOracle();