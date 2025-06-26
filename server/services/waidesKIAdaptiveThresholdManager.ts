/**
 * STEP 51: Adaptive Threshold Manager - Dynamic Emotional Intelligence Adjustment
 * Evolves trading sensitivity based on meta-emotional analysis
 */

import { waidesKIMetaEmotionEngine, MetaEmotionalReflection } from './waidesKIMetaEmotionEngine';

interface ThresholdConfiguration {
  loss_streak_threshold: number;
  win_streak_threshold: number;
  overheating_temperature: number;
  freezing_temperature: number;
  cooldown_duration: number;
  position_multiplier: number;
}

export interface ThresholdAdaptation {
  previous_config: ThresholdConfiguration;
  new_config: ThresholdConfiguration;
  adaptation_reason: string;
  confidence: number;
  adaptation_type: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'EMERGENCY';
  expected_improvement: string;
}

interface AdaptationHistory {
  timestamp: Date;
  adaptation: ThresholdAdaptation;
  performance_before: number;
  performance_after?: number;
  success_rating?: number;
}

export class WaidesKIAdaptiveThresholdManager {
  private currentConfig: ThresholdConfiguration = {
    loss_streak_threshold: 3,
    win_streak_threshold: 5,
    overheating_temperature: 45,
    freezing_temperature: -35,
    cooldown_duration: 300000, // 5 minutes in ms
    position_multiplier: 1.0
  };

  private baselineConfig: ThresholdConfiguration = { ...this.currentConfig };
  private adaptationHistory: AdaptationHistory[] = [];
  private lastAdaptationTime: Date = new Date();
  private adaptationCooldown = 600000; // 10 minutes between adaptations

  private readonly ADAPTATION_LIMITS = {
    loss_streak_threshold: { min: 2, max: 8 },
    win_streak_threshold: { min: 3, max: 12 },
    overheating_temperature: { min: 30, max: 60 },
    freezing_temperature: { min: -50, max: -20 },
    cooldown_duration: { min: 180000, max: 900000 }, // 3-15 minutes
    position_multiplier: { min: 0.1, max: 2.0 }
  };

  /**
   * Perform adaptive threshold adjustment based on meta-emotional analysis
   */
  performAdaptiveAdjustment(metaReflection: MetaEmotionalReflection): ThresholdAdaptation {
    // Check if enough time has passed since last adaptation
    const timeSinceLastAdaptation = Date.now() - this.lastAdaptationTime.getTime();
    if (timeSinceLastAdaptation < this.adaptationCooldown) {
      return this.getNoChangeAdaptation('Adaptation cooldown period active');
    }

    const previousConfig = { ...this.currentConfig };
    let adaptationType: ThresholdAdaptation['adaptation_type'] = 'MODERATE';
    let adaptationReason = 'Routine meta-emotional optimization';
    let expectedImprovement = 'Maintain current performance level';

    // Analyze volatility and adjust accordingly
    if (metaReflection.emotional_volatility > 0.7) {
      // High volatility - make system more conservative
      this.makeMoreConservative(metaReflection);
      adaptationType = 'CONSERVATIVE';
      adaptationReason = 'High emotional volatility detected - implementing conservative measures';
      expectedImprovement = 'Reduced emotional swings and more stable trading behavior';
    } else if (metaReflection.emotional_volatility < 0.2) {
      // Low volatility - can be more aggressive
      this.makeMoreAggressive(metaReflection);
      adaptationType = 'AGGRESSIVE';
      adaptationReason = 'Low emotional volatility - safe to increase trading aggressiveness';
      expectedImprovement = 'Higher profit potential with maintained emotional stability';
    }

    // Analyze state frequency patterns
    this.adjustBasedOnStateFrequency(metaReflection.state_frequency);

    // Analyze self-awareness level
    this.adjustBasedOnSelfAwareness(metaReflection.self_awareness_level);

    // Emergency adjustments for critical situations
    if (this.detectEmergencyConditions(metaReflection)) {
      adaptationType = 'EMERGENCY';
      adaptationReason = 'Emergency emotional pattern detected - implementing protective measures';
      expectedImprovement = 'Prevent catastrophic losses and restore emotional balance';
    }

    const adaptation: ThresholdAdaptation = {
      previous_config: previousConfig,
      new_config: { ...this.currentConfig },
      adaptation_reason: adaptationReason,
      confidence: this.calculateAdaptationConfidence(metaReflection),
      adaptation_type: adaptationType,
      expected_improvement: expectedImprovement
    };

    // Record adaptation
    this.recordAdaptation(adaptation);
    this.lastAdaptationTime = new Date();

    console.log(`[AdaptiveThresholds] ${adaptationType} adaptation applied: ${adaptationReason}`);

    return adaptation;
  }

  /**
   * Make thresholds more conservative (safer trading)
   */
  private makeMoreConservative(metaReflection: MetaEmotionalReflection): void {
    // Increase loss streak threshold (take fewer consecutive losses before stopping)
    this.currentConfig.loss_streak_threshold = Math.max(
      this.ADAPTATION_LIMITS.loss_streak_threshold.min,
      this.currentConfig.loss_streak_threshold - 1
    );

    // Lower overheating temperature (get emotional protection sooner)
    this.currentConfig.overheating_temperature = Math.max(
      this.ADAPTATION_LIMITS.overheating_temperature.min,
      this.currentConfig.overheating_temperature - 5
    );

    // Longer cooldown periods
    this.currentConfig.cooldown_duration = Math.min(
      this.ADAPTATION_LIMITS.cooldown_duration.max,
      this.currentConfig.cooldown_duration * 1.2
    );

    // Reduce position multiplier
    this.currentConfig.position_multiplier = Math.max(
      this.ADAPTATION_LIMITS.position_multiplier.min,
      this.currentConfig.position_multiplier * 0.8
    );
  }

  /**
   * Make thresholds more aggressive (higher risk/reward)
   */
  private makeMoreAggressive(metaReflection: MetaEmotionalReflection): void {
    // Only increase aggressiveness if emotional intelligence is high
    if (metaReflection.emotional_intelligence_score < 60) {
      return;
    }

    // Increase loss streak threshold (allow more consecutive losses)
    this.currentConfig.loss_streak_threshold = Math.min(
      this.ADAPTATION_LIMITS.loss_streak_threshold.max,
      this.currentConfig.loss_streak_threshold + 1
    );

    // Higher overheating temperature (tolerate more emotional heat)
    this.currentConfig.overheating_temperature = Math.min(
      this.ADAPTATION_LIMITS.overheating_temperature.max,
      this.currentConfig.overheating_temperature + 3
    );

    // Shorter cooldown periods
    this.currentConfig.cooldown_duration = Math.max(
      this.ADAPTATION_LIMITS.cooldown_duration.min,
      this.currentConfig.cooldown_duration * 0.85
    );

    // Increase position multiplier slightly
    this.currentConfig.position_multiplier = Math.min(
      this.ADAPTATION_LIMITS.position_multiplier.max,
      this.currentConfig.position_multiplier * 1.1
    );
  }

  /**
   * Adjust thresholds based on emotional state frequency patterns
   */
  private adjustBasedOnStateFrequency(stateFrequency: Record<string, number>): void {
    // If frequently overheated, lower the temperature threshold
    if (stateFrequency.overheated && stateFrequency.overheated > 25) {
      this.currentConfig.overheating_temperature = Math.max(
        this.ADAPTATION_LIMITS.overheating_temperature.min,
        this.currentConfig.overheating_temperature - 8
      );
    }

    // If frequently frozen, adjust freezing temperature
    if (stateFrequency.frozen && stateFrequency.frozen > 20) {
      this.currentConfig.freezing_temperature = Math.min(
        this.ADAPTATION_LIMITS.freezing_temperature.max,
        this.currentConfig.freezing_temperature + 5
      );
    }

    // If mostly neutral, can be slightly more aggressive
    if (stateFrequency.neutral && stateFrequency.neutral > 60) {
      this.currentConfig.position_multiplier = Math.min(
        this.ADAPTATION_LIMITS.position_multiplier.max,
        this.currentConfig.position_multiplier * 1.05
      );
    }
  }

  /**
   * Adjust thresholds based on self-awareness level
   */
  private adjustBasedOnSelfAwareness(selfAwarenessLevel: MetaEmotionalReflection['self_awareness_level']): void {
    switch (selfAwarenessLevel) {
      case 'LOW':
        // New system - be very conservative
        this.currentConfig.position_multiplier = Math.max(0.5, this.currentConfig.position_multiplier);
        this.currentConfig.loss_streak_threshold = Math.max(2, this.currentConfig.loss_streak_threshold);
        break;

      case 'MEDIUM':
        // Developing awareness - moderate approach
        this.currentConfig.position_multiplier = Math.max(0.7, this.currentConfig.position_multiplier);
        break;

      case 'HIGH':
        // Good awareness - can be more flexible
        this.currentConfig.cooldown_duration = Math.max(
          this.ADAPTATION_LIMITS.cooldown_duration.min,
          this.currentConfig.cooldown_duration * 0.9
        );
        break;

      case 'TRANSCENDENT':
        // Peak awareness - trust the system more
        this.currentConfig.position_multiplier = Math.min(
          this.ADAPTATION_LIMITS.position_multiplier.max,
          this.currentConfig.position_multiplier * 1.15
        );
        break;
    }
  }

  /**
   * Detect emergency conditions requiring immediate threshold changes
   */
  private detectEmergencyConditions(metaReflection: MetaEmotionalReflection): boolean {
    // Very high volatility with low intelligence score
    if (metaReflection.emotional_volatility > 0.8 && metaReflection.emotional_intelligence_score < 40) {
      this.emergencyLockdown();
      return true;
    }

    // Frequent overheating pattern
    if (metaReflection.state_frequency.overheated && metaReflection.state_frequency.overheated > 40) {
      this.emergencyLockdown();
      return true;
    }

    return false;
  }

  /**
   * Apply emergency lockdown thresholds
   */
  private emergencyLockdown(): void {
    this.currentConfig.loss_streak_threshold = 2;
    this.currentConfig.overheating_temperature = 25;
    this.currentConfig.cooldown_duration = this.ADAPTATION_LIMITS.cooldown_duration.max;
    this.currentConfig.position_multiplier = 0.3;
    
    console.log('[AdaptiveThresholds] Emergency lockdown activated - all thresholds set to maximum safety');
  }

  /**
   * Calculate confidence in the adaptation decision
   */
  private calculateAdaptationConfidence(metaReflection: MetaEmotionalReflection): number {
    let confidence = 50; // Base confidence

    // Higher intelligence score increases confidence
    confidence += (metaReflection.emotional_intelligence_score - 50) * 0.5;

    // More self-awareness increases confidence
    const awarenessBonus = {
      LOW: 0,
      MEDIUM: 10,
      HIGH: 20,
      TRANSCENDENT: 30
    };
    confidence += awarenessBonus[metaReflection.self_awareness_level];

    // Clear patterns increase confidence
    const maxStateFreq = Math.max(...Object.values(metaReflection.state_frequency));
    if (maxStateFreq > 50) confidence += 15;

    // Recent transitions indicate dynamic emotional state
    if (metaReflection.recent_transitions.length > 5) confidence += 10;

    return Math.max(0, Math.min(100, Math.round(confidence)));
  }

  /**
   * Get adaptation that indicates no changes were made
   */
  private getNoChangeAdaptation(reason: string): ThresholdAdaptation {
    return {
      previous_config: { ...this.currentConfig },
      new_config: { ...this.currentConfig },
      adaptation_reason: reason,
      confidence: 100,
      adaptation_type: 'MODERATE',
      expected_improvement: 'Maintain stability during adaptation cooldown'
    };
  }

  /**
   * Record adaptation in history
   */
  private recordAdaptation(adaptation: ThresholdAdaptation): void {
    const historyEntry: AdaptationHistory = {
      timestamp: new Date(),
      adaptation,
      performance_before: 0 // Would be filled by performance tracking system
    };

    this.adaptationHistory.push(historyEntry);

    // Maintain history limit
    if (this.adaptationHistory.length > 100) {
      this.adaptationHistory = this.adaptationHistory.slice(-100);
    }
  }

  /**
   * Get current threshold configuration
   */
  getCurrentConfig(): ThresholdConfiguration {
    return { ...this.currentConfig };
  }

  /**
   * Get adaptation history
   */
  getAdaptationHistory(limit: number = 20): AdaptationHistory[] {
    return this.adaptationHistory.slice(-limit);
  }

  /**
   * Reset to baseline configuration
   */
  resetToBaseline(): void {
    this.currentConfig = { ...this.baselineConfig };
    console.log('[AdaptiveThresholds] Reset to baseline configuration');
  }

  /**
   * Force immediate adaptation (for testing)
   */
  forceAdaptation(): ThresholdAdaptation {
    const metaReflection = waidesKIMetaEmotionEngine.performMetaReflection();
    this.lastAdaptationTime = new Date(0); // Reset cooldown
    return this.performAdaptiveAdjustment(metaReflection);
  }

  /**
   * Get comprehensive adaptation statistics
   */
  getAdaptationStats(): {
    current_config: ThresholdConfiguration;
    baseline_config: ThresholdConfiguration;
    total_adaptations: number;
    adaptation_types: Record<string, number>;
    average_confidence: number;
    time_since_last_adaptation: number;
  } {
    const adaptationTypes: Record<string, number> = {};
    let totalConfidence = 0;

    this.adaptationHistory.forEach(entry => {
      const type = entry.adaptation.adaptation_type;
      adaptationTypes[type] = (adaptationTypes[type] || 0) + 1;
      totalConfidence += entry.adaptation.confidence;
    });

    const averageConfidence = this.adaptationHistory.length > 0 
      ? Math.round(totalConfidence / this.adaptationHistory.length)
      : 0;

    return {
      current_config: this.getCurrentConfig(),
      baseline_config: { ...this.baselineConfig },
      total_adaptations: this.adaptationHistory.length,
      adaptation_types: adaptationTypes,
      average_confidence: averageConfidence,
      time_since_last_adaptation: Date.now() - this.lastAdaptationTime.getTime()
    };
  }
}

// Export singleton instance
export const waidesKIAdaptiveThresholdManager = new WaidesKIAdaptiveThresholdManager();