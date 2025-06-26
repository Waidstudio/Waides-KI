/**
 * MODULE C — Presence Orchestrator
 * Brings together multi-sense pressure, global consensus, social sentiment
 */

import { waidesKIETHOrderPresenceRegistry } from './waidesKIETHOrderPresenceRegistry.js';
import { waidesKIMultiNodeOrderConsensus } from './waidesKIMultiNodeOrderConsensus.js';
import { waidesKIETHSentimentTracker } from './waidesKIETHSentimentTracker.js';
import { waidesKIOrderPresenceService } from './waidesKIOrderPresenceService.js';

interface PresenceEvaluation {
  order_pressure: string;
  network_consensus: string;
  consensus_confidence: number;
  consensus_count: number;
  sentiment: {
    score: number;
    category: string;
    confidence: number;
  };
  price_trend: string;
  overall_alignment: 'strong_bullish' | 'strong_bearish' | 'moderate_bullish' | 'moderate_bearish' | 'neutral' | 'conflicted';
  alignment_score: number;
  recommendation: string;
  risk_level: 'low' | 'medium' | 'high';
}

interface HolisticIntelligence {
  data_presence: any;
  network_empathy: any;
  sentiment_overlay: any;
  integration_status: any;
  final_decision: {
    action: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'WAIT';
    confidence: number;
    reasoning: string;
    conditions_met: string[];
    conditions_failed: string[];
  };
}

export class WaidesKIPresenceOrchestrator {
  private evaluationHistory: PresenceEvaluation[] = [];
  private maxHistorySize = 100;
  private isRunning = false;
  private evaluationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startContinuousEvaluation();
  }

  /**
   * Start continuous presence evaluation
   */
  private startContinuousEvaluation(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Evaluate every 15 seconds
    this.evaluationInterval = setInterval(() => {
      this.evaluate();
    }, 15000);

    console.log('🎯 Started continuous presence orchestration');
  }

  /**
   * Main evaluation function combining all presence systems
   */
  async evaluate(): Promise<PresenceEvaluation> {
    try {
      // Gather all presence data
      const orderPresence = waidesKIETHOrderPresenceRegistry.get();
      const consensusResult = await waidesKIMultiNodeOrderConsensus.getConsensusWithInterpretation();
      const sentimentData = waidesKIETHSentimentTracker.getSentimentForTrading();
      const flowInsights = waidesKIOrderPresenceService.getOrderFlowInsights();

      // Determine price trend from order flow
      const priceTrend = this.determinePriceTrend(flowInsights, orderPresence);

      // Create evaluation
      const evaluation: PresenceEvaluation = {
        order_pressure: orderPresence.pressure,
        network_consensus: consensusResult.consensus.consensus_pressure,
        consensus_confidence: consensusResult.consensus.confidence,
        consensus_count: consensusResult.consensus.consensus_count,
        sentiment: {
          score: sentimentData.sentiment.score,
          category: sentimentData.sentiment.overall_sentiment,
          confidence: sentimentData.sentiment.confidence
        },
        price_trend: priceTrend,
        overall_alignment: 'neutral',
        alignment_score: 0,
        recommendation: '',
        risk_level: 'high'
      };

      // Calculate overall alignment
      this.calculateOverallAlignment(evaluation);

      // Store in history
      this.evaluationHistory.push(evaluation);
      if (this.evaluationHistory.length > this.maxHistorySize) {
        this.evaluationHistory.shift();
      }

      return evaluation;
    } catch (error) {
      console.error('❌ Error in presence orchestrator evaluation:', error);
      return this.getDefaultEvaluation();
    }
  }

  /**
   * Determine price trend from multiple sources
   */
  private determinePriceTrend(flowInsights: any, orderPresence: any): string {
    const factors = [];

    // Order book pressure influence
    if (orderPresence.pressure === 'buy_pressure') {
      factors.push('rising');
    } else if (orderPresence.pressure === 'sell_pressure') {
      factors.push('falling');
    }

    // Order flow influence
    if (flowInsights?.recent_trades_bias === 'buy_heavy') {
      factors.push('rising');
    } else if (flowInsights?.recent_trades_bias === 'sell_heavy') {
      factors.push('falling');
    }

    // Volume influence
    if (flowInsights?.volume_strength > 70) {
      // High volume suggests trend continuation
      factors.push(factors.length > 0 ? factors[factors.length - 1] : 'rising');
    }

    // Determine consensus
    const risingCount = factors.filter(f => f === 'rising').length;
    const fallingCount = factors.filter(f => f === 'falling').length;

    if (risingCount > fallingCount) return 'rising';
    if (fallingCount > risingCount) return 'falling';
    return 'sideways';
  }

  /**
   * Calculate overall alignment and generate recommendation
   */
  private calculateOverallAlignment(evaluation: PresenceEvaluation): void {
    let alignmentScore = 0;
    const conditions = [];

    // Order pressure alignment (weight: 30%)
    if (evaluation.order_pressure === 'buy_pressure') {
      alignmentScore += 30;
      conditions.push('Local order pressure bullish');
    } else if (evaluation.order_pressure === 'sell_pressure') {
      alignmentScore -= 30;
      conditions.push('Local order pressure bearish');
    }

    // Network consensus alignment (weight: 35%)
    if (evaluation.network_consensus === 'buy_pressure' && evaluation.consensus_confidence > 70) {
      alignmentScore += 35;
      conditions.push('Strong network consensus bullish');
    } else if (evaluation.network_consensus === 'sell_pressure' && evaluation.consensus_confidence > 70) {
      alignmentScore -= 35;
      conditions.push('Strong network consensus bearish');
    } else if (evaluation.consensus_confidence > 50) {
      // Moderate consensus
      alignmentScore += evaluation.network_consensus === 'buy_pressure' ? 20 : -20;
      conditions.push(`Moderate network consensus ${evaluation.network_consensus.replace('_pressure', '')}`);
    }

    // Sentiment alignment (weight: 20%)
    if (evaluation.sentiment.category === 'bullish' && evaluation.sentiment.confidence > 60) {
      alignmentScore += 20;
      conditions.push('Bullish sentiment confirmed');
    } else if (evaluation.sentiment.category === 'bearish' && evaluation.sentiment.confidence > 60) {
      alignmentScore -= 20;
      conditions.push('Bearish sentiment confirmed');
    }

    // Price trend alignment (weight: 15%)
    if (evaluation.price_trend === 'rising') {
      alignmentScore += 15;
      conditions.push('Price trend rising');
    } else if (evaluation.price_trend === 'falling') {
      alignmentScore -= 15;
      conditions.push('Price trend falling');
    }

    // Determine overall alignment category
    evaluation.alignment_score = alignmentScore;

    if (alignmentScore >= 70) {
      evaluation.overall_alignment = 'strong_bullish';
      evaluation.recommendation = '🟢 Strong bullish alignment - High confidence long position';
      evaluation.risk_level = 'low';
    } else if (alignmentScore >= 40) {
      evaluation.overall_alignment = 'moderate_bullish';
      evaluation.recommendation = '🟡 Moderate bullish alignment - Consider long position with reduced size';
      evaluation.risk_level = 'medium';
    } else if (alignmentScore <= -70) {
      evaluation.overall_alignment = 'strong_bearish';
      evaluation.recommendation = '🔴 Strong bearish alignment - Consider short position or exit longs';
      evaluation.risk_level = 'low';
    } else if (alignmentScore <= -40) {
      evaluation.overall_alignment = 'moderate_bearish';
      evaluation.recommendation = '🟠 Moderate bearish alignment - Reduce exposure or wait';
      evaluation.risk_level = 'medium';
    } else if (Math.abs(alignmentScore) < 20) {
      evaluation.overall_alignment = 'neutral';
      evaluation.recommendation = '⚪ Neutral alignment - Wait for clearer signals';
      evaluation.risk_level = 'medium';
    } else {
      evaluation.overall_alignment = 'conflicted';
      evaluation.recommendation = '⚠️ Conflicted signals - Avoid trading until alignment improves';
      evaluation.risk_level = 'high';
    }
  }

  /**
   * Get holistic intelligence with final trading decision
   */
  async getHolisticIntelligence(): Promise<HolisticIntelligence> {
    const evaluation = await this.evaluate();
    const orderPresence = waidesKIETHOrderPresenceRegistry.get();
    const consensusResult = await waidesKIMultiNodeOrderConsensus.getConsensusWithInterpretation();
    const sentimentData = waidesKIETHSentimentTracker.getSentimentForTrading();
    const systemStatus = waidesKIOrderPresenceService.getSystemStatus();

    // Conditions for trading decision
    const conditionsMet: string[] = [];
    const conditionsFailed: string[] = [];

    // Check alignment conditions
    if (evaluation.alignment_score >= 70) {
      conditionsMet.push('Strong bullish alignment (70%+)');
    } else if (evaluation.alignment_score <= -70) {
      conditionsMet.push('Strong bearish alignment (70%+)');
    } else {
      conditionsFailed.push('Insufficient alignment for confident trading');
    }

    // Check network consensus
    if (consensusResult.consensus.confidence >= 80) {
      conditionsMet.push('High network consensus (80%+)');
    } else if (consensusResult.consensus.confidence >= 60) {
      conditionsMet.push('Moderate network consensus (60%+)');
    } else {
      conditionsFailed.push('Low network consensus');
    }

    // Check sentiment confidence
    if (sentimentData.sentiment.confidence >= 70) {
      conditionsMet.push('High sentiment confidence (70%+)');
    } else {
      conditionsFailed.push('Low sentiment confidence');
    }

    // Check system health
    if (systemStatus.service_initialized) {
      conditionsMet.push('Order book system operational');
    } else {
      conditionsFailed.push('Order book system not fully operational');
    }

    // Final trading decision
    let action: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'WAIT' = 'WAIT';
    let confidence = 0;
    let reasoning = '';

    if (evaluation.alignment_score >= 70 && consensusResult.consensus.confidence >= 80 && sentimentData.sentiment.score > 15) {
      action = 'BUY_ETH';
      confidence = Math.min(95, (evaluation.alignment_score + consensusResult.consensus.confidence) / 2);
      reasoning = 'All systems aligned for bullish trade - price trend, network consensus, and sentiment all positive';
    } else if (evaluation.alignment_score <= -70 && consensusResult.consensus.confidence >= 80 && sentimentData.sentiment.score < -15) {
      action = 'SELL_ETH';
      confidence = Math.min(95, (Math.abs(evaluation.alignment_score) + consensusResult.consensus.confidence) / 2);
      reasoning = 'All systems aligned for bearish trade - price trend, network consensus, and sentiment all negative';
    } else if (evaluation.overall_alignment === 'neutral' || evaluation.overall_alignment === 'conflicted') {
      action = 'WAIT';
      confidence = 0;
      reasoning = 'Mixed or conflicted signals across presence systems - waiting for clearer alignment';
    } else {
      action = 'HOLD';
      confidence = Math.max(0, Math.abs(evaluation.alignment_score));
      reasoning = 'Moderate signals detected but insufficient confidence for new positions';
    }

    return {
      data_presence: orderPresence,
      network_empathy: consensusResult,
      sentiment_overlay: sentimentData,
      integration_status: systemStatus,
      final_decision: {
        action,
        confidence,
        reasoning,
        conditions_met: conditionsMet,
        conditions_failed: conditionsFailed
      }
    };
  }

  /**
   * Get current evaluation
   */
  getCurrentEvaluation(): PresenceEvaluation {
    if (this.evaluationHistory.length === 0) {
      return this.getDefaultEvaluation();
    }
    return this.evaluationHistory[this.evaluationHistory.length - 1];
  }

  /**
   * Get evaluation trends
   */
  getEvaluationTrends(): {
    alignment_trend: 'improving' | 'deteriorating' | 'stable';
    consistency: number;
    recent_recommendations: string[];
    stability_score: number;
  } {
    if (this.evaluationHistory.length < 5) {
      return {
        alignment_trend: 'stable',
        consistency: 0,
        recent_recommendations: [],
        stability_score: 0
      };
    }

    const recent = this.evaluationHistory.slice(-10);
    const alignmentScores = recent.map(e => e.alignment_score);
    const recommendations = recent.map(e => e.recommendation);

    // Calculate trend
    const firstHalf = alignmentScores.slice(0, Math.floor(alignmentScores.length / 2));
    const secondHalf = alignmentScores.slice(Math.floor(alignmentScores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    let alignmentTrend: 'improving' | 'deteriorating' | 'stable';
    if (secondAvg > firstAvg + 10) {
      alignmentTrend = 'improving';
    } else if (secondAvg < firstAvg - 10) {
      alignmentTrend = 'deteriorating';
    } else {
      alignmentTrend = 'stable';
    }

    // Calculate consistency (how often recommendations are similar)
    const uniqueRecommendations = new Set(recommendations);
    const consistency = Math.round((1 - (uniqueRecommendations.size / recommendations.length)) * 100);

    // Calculate stability (variance in alignment scores)
    const variance = this.calculateVariance(alignmentScores);
    const stabilityScore = Math.round(Math.max(0, 100 - variance));

    return {
      alignment_trend: alignmentTrend,
      consistency,
      recent_recommendations: recommendations.slice(-5),
      stability_score: stabilityScore
    };
  }

  /**
   * Calculate variance for stability scoring
   */
  private calculateVariance(scores: number[]): number {
    if (scores.length === 0) return 100;
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Get orchestrator statistics
   */
  getOrchestratorStatistics(): {
    total_evaluations: number;
    uptime_minutes: number;
    alignment_distribution: Record<string, number>;
    average_confidence: number;
    decision_breakdown: Record<string, number>;
  } {
    const alignmentDistribution = this.evaluationHistory.reduce((acc, eval) => {
      acc[eval.overall_alignment] = (acc[eval.overall_alignment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgConfidence = this.evaluationHistory.length > 0 ?
      Math.round(this.evaluationHistory.reduce((sum, e) => sum + Math.abs(e.alignment_score), 0) / this.evaluationHistory.length) : 0;

    // Estimate uptime (15 second intervals)
    const uptimeMinutes = Math.round((this.evaluationHistory.length * 15) / 60);

    return {
      total_evaluations: this.evaluationHistory.length,
      uptime_minutes: uptimeMinutes,
      alignment_distribution: alignmentDistribution,
      average_confidence: avgConfidence,
      decision_breakdown: alignmentDistribution
    };
  }

  /**
   * Get default evaluation when no data available
   */
  private getDefaultEvaluation(): PresenceEvaluation {
    return {
      order_pressure: 'neutral',
      network_consensus: 'neutral',
      consensus_confidence: 0,
      consensus_count: 0,
      sentiment: {
        score: 0,
        category: 'neutral',
        confidence: 0
      },
      price_trend: 'sideways',
      overall_alignment: 'neutral',
      alignment_score: 0,
      recommendation: 'Insufficient data for recommendation',
      risk_level: 'high'
    };
  }

  /**
   * Stop orchestrator
   */
  stop(): void {
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Presence orchestrator stopped');
  }

  /**
   * Restart orchestrator
   */
  restart(): void {
    this.stop();
    this.startContinuousEvaluation();
  }
}

export const waidesKIPresenceOrchestrator = new WaidesKIPresenceOrchestrator();