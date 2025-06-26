/**
 * STEP 44: Waides KI Soul Weight Filter
 * Light vs. Greed Detection - Filters trades based on spiritual alignment and motivation
 */

interface TradeMetadata {
  goal: string;
  motivation: 'LONG_TERM_GROWTH' | 'QUICK_GAIN' | 'BALANCED' | 'PROTECTION' | 'UNKNOWN';
  trend_conflict: boolean;
  symbol_history_loss_rate: number;
  risk_reward_ratio: number;
  position_size_relative: number;
  emotional_state: string;
  time_since_last_trade: number;
  consecutive_losses: number;
  profit_target_realistic: boolean;
}

interface SoulWeightAnalysis {
  spiritual_alignment: number;
  greed_indicators: string[];
  light_indicators: string[];
  motivation_score: number;
  patience_score: number;
  wisdom_score: number;
  overall_soul_weight: number;
  spiritual_verdict: 'PURE_LIGHT' | 'BALANCED_LIGHT' | 'NEUTRAL' | 'SHADOW_TAINTED' | 'PURE_GREED';
  purification_needed: boolean;
}

export class WaidesKISoulWeightFilter {
  private readonly SOUL_WEIGHT_THRESHOLDS = {
    PURE_LIGHT_MINIMUM: 0.85,
    BALANCED_LIGHT_MINIMUM: 0.7,
    NEUTRAL_MINIMUM: 0.5,
    SHADOW_TAINTED_MINIMUM: 0.3,
    QUICK_GAIN_PENALTY: 0.2,
    TREND_CONFLICT_PENALTY: 0.3,
    HIGH_LOSS_RATE_PENALTY: 0.3,
    PATIENCE_BONUS: 0.15,
    WISDOM_BONUS: 0.1
  };

  private readonly MOTIVATION_WEIGHTS = {
    LONG_TERM_GROWTH: 1.0,
    BALANCED: 0.8,
    PROTECTION: 0.9,
    QUICK_GAIN: 0.3,
    UNKNOWN: 0.5
  };

  private readonly GREED_PATTERNS = {
    EXCESSIVE_RISK: 'Position size exceeds prudent risk management',
    CHASING_LOSSES: 'Trading frequency increased after losses',
    UNREALISTIC_TARGETS: 'Profit targets exceed historical probability',
    IMPATIENCE: 'Trading too soon after previous trade',
    TREND_FIGHTING: 'Fighting established market trends',
    EMOTION_DRIVEN: 'Decisions based on fear or greed rather than analysis'
  };

  private readonly LIGHT_PATTERNS = {
    PATIENT_ENTRY: 'Waiting for optimal entry conditions',
    REALISTIC_EXPECTATIONS: 'Profit targets align with market probability',
    TREND_ALIGNMENT: 'Trading with natural market flow',
    BALANCED_RISK: 'Risk management aligned with capital preservation',
    WISDOM_BASED: 'Decisions rooted in analysis and experience',
    PROTECTIVE_INTENT: 'Trading to protect and grow capital sustainably'
  };

  constructor() {
    console.log('🕊️ Waides KI Soul Weight Filter initialized - Light vs Greed detection active');
  }

  /**
   * Calculate the soul weight of a trading decision
   */
  calculateSoulWeight(tradeMetadata: TradeMetadata): SoulWeightAnalysis {
    let soulWeight = 1.0;
    const greedIndicators: string[] = [];
    const lightIndicators: string[] = [];

    // 1. Motivation Analysis
    const motivationAnalysis = this.analyzeMotivation(tradeMetadata.motivation, tradeMetadata.goal);
    soulWeight *= motivationAnalysis.weight;
    greedIndicators.push(...motivationAnalysis.greedFlags);
    lightIndicators.push(...motivationAnalysis.lightFlags);

    // 2. Trend Conflict Assessment
    if (tradeMetadata.trend_conflict) {
      soulWeight -= this.SOUL_WEIGHT_THRESHOLDS.TREND_CONFLICT_PENALTY;
      greedIndicators.push(this.GREED_PATTERNS.TREND_FIGHTING);
    } else {
      lightIndicators.push(this.LIGHT_PATTERNS.TREND_ALIGNMENT);
    }

    // 3. Historical Performance Impact
    if (tradeMetadata.symbol_history_loss_rate > 0.6) {
      soulWeight -= this.SOUL_WEIGHT_THRESHOLDS.HIGH_LOSS_RATE_PENALTY;
      greedIndicators.push('Repeated trading of losing symbol - emotional attachment');
    }

    // 4. Risk Management Assessment
    const riskAnalysis = this.analyzeRiskManagement(tradeMetadata);
    soulWeight += riskAnalysis.adjustment;
    greedIndicators.push(...riskAnalysis.greedFlags);
    lightIndicators.push(...riskAnalysis.lightFlags);

    // 5. Patience and Wisdom Scoring
    const patienceScore = this.calculatePatienceScore(tradeMetadata);
    const wisdomScore = this.calculateWisdomScore(tradeMetadata);
    
    soulWeight += (patienceScore - 0.5) * this.SOUL_WEIGHT_THRESHOLDS.PATIENCE_BONUS;
    soulWeight += (wisdomScore - 0.5) * this.SOUL_WEIGHT_THRESHOLDS.WISDOM_BONUS;

    // 6. Emotional State Impact
    const emotionalAnalysis = this.analyzeEmotionalState(tradeMetadata.emotional_state);
    soulWeight += emotionalAnalysis.adjustment;
    greedIndicators.push(...emotionalAnalysis.greedFlags);
    lightIndicators.push(...emotionalAnalysis.lightFlags);

    const finalSoulWeight = Math.max(0, Math.min(1, soulWeight));

    return {
      spiritual_alignment: Number(this.calculateSpiritualAlignment(tradeMetadata).toFixed(3)),
      greed_indicators: greedIndicators,
      light_indicators: lightIndicators,
      motivation_score: Number(motivationAnalysis.score.toFixed(3)),
      patience_score: Number(patienceScore.toFixed(3)),
      wisdom_score: Number(wisdomScore.toFixed(3)),
      overall_soul_weight: Number(finalSoulWeight.toFixed(3)),
      spiritual_verdict: this.getSpiritualVerdict(finalSoulWeight),
      purification_needed: finalSoulWeight < this.SOUL_WEIGHT_THRESHOLDS.NEUTRAL_MINIMUM
    };
  }

  /**
   * Quick soul weight check for fast decisions
   */
  quickSoulCheck(motivation: string, trendConflict: boolean, lossRate: number): boolean {
    let weight = 1.0;
    
    if (motivation.includes('quick') || motivation.includes('fast')) {
      weight -= this.SOUL_WEIGHT_THRESHOLDS.QUICK_GAIN_PENALTY;
    }
    
    if (trendConflict) {
      weight -= this.SOUL_WEIGHT_THRESHOLDS.TREND_CONFLICT_PENALTY;
    }
    
    if (lossRate > 0.6) {
      weight -= this.SOUL_WEIGHT_THRESHOLDS.HIGH_LOSS_RATE_PENALTY;
    }

    return weight >= this.SOUL_WEIGHT_THRESHOLDS.NEUTRAL_MINIMUM;
  }

  /**
   * Purify trading intention to align with light
   */
  purifyTradingIntention(originalMetadata: TradeMetadata): {
    purified_metadata: Partial<TradeMetadata>;
    purification_steps: string[];
    light_enhancement: number;
  } {
    const purificationSteps: string[] = [];
    const purifiedMetadata: Partial<TradeMetadata> = { ...originalMetadata };

    // Convert quick gain to balanced approach
    if (originalMetadata.motivation === 'QUICK_GAIN') {
      purifiedMetadata.motivation = 'BALANCED';
      purificationSteps.push('Transformed quick-gain motivation to balanced approach');
    }

    // Align with trends instead of fighting them
    if (originalMetadata.trend_conflict) {
      purifiedMetadata.trend_conflict = false;
      purificationSteps.push('Aligned trade direction with market trend');
    }

    // Reduce position size if excessive
    if (originalMetadata.position_size_relative > 0.15) {
      purifiedMetadata.position_size_relative = 0.1;
      purificationSteps.push('Reduced position size to prudent levels');
    }

    // Improve profit targets if unrealistic
    if (!originalMetadata.profit_target_realistic) {
      purifiedMetadata.profit_target_realistic = true;
      purificationSteps.push('Adjusted profit targets to realistic market expectations');
    }

    const originalWeight = this.calculateSoulWeight(originalMetadata).overall_soul_weight;
    const purifiedWeight = this.calculateSoulWeight(purifiedMetadata as TradeMetadata).overall_soul_weight;

    return {
      purified_metadata: purifiedMetadata,
      purification_steps,
      light_enhancement: Number((purifiedWeight - originalWeight).toFixed(3))
    };
  }

  /**
   * Generate soul weight statistics and insights
   */
  generateSoulInsights(recentAnalyses: SoulWeightAnalysis[]): {
    average_soul_weight: number;
    light_trades_percentage: number;
    common_greed_patterns: string[];
    spiritual_growth_trend: 'ASCENDING' | 'STABLE' | 'DECLINING';
    purification_recommendations: string[];
  } {
    if (recentAnalyses.length === 0) {
      return {
        average_soul_weight: 0,
        light_trades_percentage: 0,
        common_greed_patterns: [],
        spiritual_growth_trend: 'STABLE',
        purification_recommendations: ['Begin soul weight analysis for spiritual trading alignment']
      };
    }

    const avgSoulWeight = recentAnalyses.reduce((sum, analysis) => sum + analysis.overall_soul_weight, 0) / recentAnalyses.length;
    
    const lightTrades = recentAnalyses.filter(a => 
      a.spiritual_verdict === 'PURE_LIGHT' || a.spiritual_verdict === 'BALANCED_LIGHT'
    ).length;
    const lightPercentage = (lightTrades / recentAnalyses.length) * 100;

    // Count greed pattern frequency
    const greedCounts: { [key: string]: number } = {};
    recentAnalyses.forEach(analysis => {
      analysis.greed_indicators.forEach(indicator => {
        greedCounts[indicator] = (greedCounts[indicator] || 0) + 1;
      });
    });

    const commonGreedPatterns = Object.entries(greedCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([pattern]) => pattern);

    // Determine spiritual growth trend
    const recentWeights = recentAnalyses.slice(-10).map(a => a.overall_soul_weight);
    const firstHalf = recentWeights.slice(0, Math.floor(recentWeights.length / 2));
    const secondHalf = recentWeights.slice(Math.floor(recentWeights.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, weight) => sum + weight, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, weight) => sum + weight, 0) / secondHalf.length;
    
    let trend: 'ASCENDING' | 'STABLE' | 'DECLINING' = 'STABLE';
    if (secondAvg > firstAvg + 0.05) trend = 'ASCENDING';
    else if (secondAvg < firstAvg - 0.05) trend = 'DECLINING';

    return {
      average_soul_weight: Number(avgSoulWeight.toFixed(3)),
      light_trades_percentage: Number(lightPercentage.toFixed(1)),
      common_greed_patterns: commonGreedPatterns,
      spiritual_growth_trend: trend,
      purification_recommendations: this.generatePurificationRecommendations(greedCounts, trend)
    };
  }

  /**
   * Analyze motivation and goal alignment
   */
  private analyzeMotivation(motivation: TradeMetadata['motivation'], goal: string): {
    weight: number;
    score: number;
    greedFlags: string[];
    lightFlags: string[];
  } {
    const weight = this.MOTIVATION_WEIGHTS[motivation];
    const greedFlags: string[] = [];
    const lightFlags: string[] = [];

    if (motivation === 'QUICK_GAIN') {
      greedFlags.push('Quick gain motivation indicates impatience and greed');
    } else if (motivation === 'LONG_TERM_GROWTH') {
      lightFlags.push(this.LIGHT_PATTERNS.PATIENT_ENTRY);
    } else if (motivation === 'PROTECTION') {
      lightFlags.push(this.LIGHT_PATTERNS.PROTECTIVE_INTENT);
    }

    if (goal.toLowerCase().includes('quick') || goal.toLowerCase().includes('fast')) {
      greedFlags.push('Goal focused on speed rather than sustainability');
    }

    return {
      weight,
      score: weight,
      greedFlags,
      lightFlags
    };
  }

  /**
   * Analyze risk management practices
   */
  private analyzeRiskManagement(metadata: TradeMetadata): {
    adjustment: number;
    greedFlags: string[];
    lightFlags: string[];
  } {
    let adjustment = 0;
    const greedFlags: string[] = [];
    const lightFlags: string[] = [];

    // Position size analysis
    if (metadata.position_size_relative > 0.2) {
      adjustment -= 0.2;
      greedFlags.push(this.GREED_PATTERNS.EXCESSIVE_RISK);
    } else if (metadata.position_size_relative <= 0.1) {
      adjustment += 0.1;
      lightFlags.push(this.LIGHT_PATTERNS.BALANCED_RISK);
    }

    // Risk-reward ratio analysis
    if (metadata.risk_reward_ratio < 1.5) {
      adjustment -= 0.15;
      greedFlags.push('Poor risk-reward ratio indicates greed over prudence');
    } else if (metadata.risk_reward_ratio >= 2.0) {
      adjustment += 0.1;
      lightFlags.push('Excellent risk-reward ratio shows wisdom');
    }

    // Realistic profit targets
    if (!metadata.profit_target_realistic) {
      adjustment -= 0.15;
      greedFlags.push(this.GREED_PATTERNS.UNREALISTIC_TARGETS);
    } else {
      lightFlags.push(this.LIGHT_PATTERNS.REALISTIC_EXPECTATIONS);
    }

    return { adjustment, greedFlags, lightFlags };
  }

  /**
   * Calculate patience score based on trading behavior
   */
  private calculatePatienceScore(metadata: TradeMetadata): number {
    let patienceScore = 0.5; // Base neutral score

    // Time since last trade (hours)
    if (metadata.time_since_last_trade >= 24) {
      patienceScore += 0.3; // Good patience
    } else if (metadata.time_since_last_trade >= 4) {
      patienceScore += 0.1; // Moderate patience
    } else if (metadata.time_since_last_trade < 1) {
      patienceScore -= 0.3; // Impatience
    }

    // Consecutive losses impact
    if (metadata.consecutive_losses > 2) {
      patienceScore -= 0.2; // Likely chasing losses
    }

    return Math.max(0, Math.min(1, patienceScore));
  }

  /**
   * Calculate wisdom score based on decision quality
   */
  private calculateWisdomScore(metadata: TradeMetadata): number {
    let wisdomScore = 0.5;

    // Risk-reward awareness
    if (metadata.risk_reward_ratio >= 2.0) wisdomScore += 0.2;
    else if (metadata.risk_reward_ratio < 1.5) wisdomScore -= 0.2;

    // Historical learning
    if (metadata.symbol_history_loss_rate < 0.3) wisdomScore += 0.15;
    else if (metadata.symbol_history_loss_rate > 0.7) wisdomScore -= 0.2;

    // Trend alignment
    if (!metadata.trend_conflict) wisdomScore += 0.15;
    else wisdomScore -= 0.15;

    return Math.max(0, Math.min(1, wisdomScore));
  }

  /**
   * Calculate overall spiritual alignment
   */
  private calculateSpiritualAlignment(metadata: TradeMetadata): number {
    let alignment = 0.5;

    // Motivation alignment
    const motivationWeight = this.MOTIVATION_WEIGHTS[metadata.motivation];
    alignment += (motivationWeight - 0.5) * 0.4;

    // Trend harmony
    if (!metadata.trend_conflict) alignment += 0.2;
    else alignment -= 0.3;

    // Risk consciousness
    if (metadata.position_size_relative <= 0.1) alignment += 0.15;
    else if (metadata.position_size_relative > 0.2) alignment -= 0.2;

    return Math.max(0, Math.min(1, alignment));
  }

  /**
   * Analyze emotional state impact
   */
  private analyzeEmotionalState(emotionalState: string): {
    adjustment: number;
    greedFlags: string[];
    lightFlags: string[];
  } {
    let adjustment = 0;
    const greedFlags: string[] = [];
    const lightFlags: string[] = [];

    const lowerState = emotionalState.toLowerCase();

    if (lowerState.includes('greedy') || lowerState.includes('fomo')) {
      adjustment -= 0.3;
      greedFlags.push(this.GREED_PATTERNS.EMOTION_DRIVEN);
    } else if (lowerState.includes('fearful') || lowerState.includes('panic')) {
      adjustment -= 0.2;
      greedFlags.push('Fear-based decision making');
    } else if (lowerState.includes('calm') || lowerState.includes('balanced')) {
      adjustment += 0.1;
      lightFlags.push(this.LIGHT_PATTERNS.WISDOM_BASED);
    } else if (lowerState.includes('patient') || lowerState.includes('mindful')) {
      adjustment += 0.15;
      lightFlags.push(this.LIGHT_PATTERNS.PATIENT_ENTRY);
    }

    return { adjustment, greedFlags, lightFlags };
  }

  /**
   * Determine spiritual verdict based on soul weight
   */
  private getSpiritualVerdict(soulWeight: number): SoulWeightAnalysis['spiritual_verdict'] {
    if (soulWeight >= this.SOUL_WEIGHT_THRESHOLDS.PURE_LIGHT_MINIMUM) return 'PURE_LIGHT';
    if (soulWeight >= this.SOUL_WEIGHT_THRESHOLDS.BALANCED_LIGHT_MINIMUM) return 'BALANCED_LIGHT';
    if (soulWeight >= this.SOUL_WEIGHT_THRESHOLDS.NEUTRAL_MINIMUM) return 'NEUTRAL';
    if (soulWeight >= this.SOUL_WEIGHT_THRESHOLDS.SHADOW_TAINTED_MINIMUM) return 'SHADOW_TAINTED';
    return 'PURE_GREED';
  }

  /**
   * Generate purification recommendations
   */
  private generatePurificationRecommendations(greedCounts: { [key: string]: number }, trend: string): string[] {
    const recommendations = [];

    if (greedCounts['Quick gain motivation indicates impatience and greed']) {
      recommendations.push('Cultivate patience - focus on long-term sustainable growth over quick gains');
    }

    if (greedCounts[this.GREED_PATTERNS.EXCESSIVE_RISK]) {
      recommendations.push('Reduce position sizes to align with prudent risk management principles');
    }

    if (greedCounts[this.GREED_PATTERNS.TREND_FIGHTING]) {
      recommendations.push('Practice market harmony - trade with trends rather than against them');
    }

    if (greedCounts[this.GREED_PATTERNS.UNREALISTIC_TARGETS]) {
      recommendations.push('Set realistic profit targets based on historical market probabilities');
    }

    if (trend === 'DECLINING') {
      recommendations.push('Focus on spiritual purification - review motivations and align with light principles');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue cultivating spiritual awareness in all trading decisions');
    }

    return recommendations;
  }
}