/**
 * STEP 51: Emotion Reflection Log - Self-Aware Emotional Intelligence Recording
 * Records and analyzes meta-emotional reflections and learning patterns
 */

import { MetaEmotionalReflection } from './waidesKIMetaEmotionEngine';
import { ThresholdAdaptation } from './waidesKIAdaptiveThresholdManager';

interface EmotionReflectionEntry {
  timestamp: Date;
  reflection_id: string;
  meta_reflection: MetaEmotionalReflection;
  threshold_adaptation?: ThresholdAdaptation;
  performance_context: {
    recent_trades: number;
    win_rate: number;
    current_balance: number;
    trading_session_duration: number;
  };
  learning_insights: string[];
  emotional_evolution_stage: string;
  self_awareness_notes: string;
}

interface ReflectionPattern {
  pattern_type: 'volatility_cycle' | 'state_frequency' | 'intelligence_growth' | 'adaptation_success';
  description: string;
  frequency: number;
  confidence: number;
  first_observed: Date;
  last_observed: Date;
  impact_assessment: 'positive' | 'negative' | 'neutral';
}

interface EmotionLearningMetrics {
  total_reflections: number;
  average_intelligence_score: number;
  intelligence_growth_rate: number;
  pattern_recognition_accuracy: number;
  adaptation_success_rate: number;
  emotional_stability_index: number;
  self_awareness_progression: number;
}

export class WaidesKIEmotionReflectionLog {
  private reflectionEntries: EmotionReflectionEntry[] = [];
  private detectedPatterns: ReflectionPattern[] = [];
  private maxLogSize = 500;
  private patternDetectionThreshold = 5; // Minimum occurrences to consider a pattern

  private learningMetrics: EmotionLearningMetrics = {
    total_reflections: 0,
    average_intelligence_score: 50,
    intelligence_growth_rate: 0,
    pattern_recognition_accuracy: 0,
    adaptation_success_rate: 0,
    emotional_stability_index: 50,
    self_awareness_progression: 0
  };

  /**
   * Record a complete emotional reflection with context
   */
  recordReflection(
    metaReflection: MetaEmotionalReflection,
    thresholdAdaptation?: ThresholdAdaptation,
    performanceContext?: Partial<EmotionReflectionEntry['performance_context']>
  ): void {
    const reflectionId = this.generateReflectionId();
    
    const entry: EmotionReflectionEntry = {
      timestamp: new Date(),
      reflection_id: reflectionId,
      meta_reflection: metaReflection,
      threshold_adaptation: thresholdAdaptation,
      performance_context: {
        recent_trades: performanceContext?.recent_trades || 0,
        win_rate: performanceContext?.win_rate || 0,
        current_balance: performanceContext?.current_balance || 10000,
        trading_session_duration: performanceContext?.trading_session_duration || 0
      },
      learning_insights: this.generateLearningInsights(metaReflection, thresholdAdaptation),
      emotional_evolution_stage: this.determineEvolutionStage(metaReflection),
      self_awareness_notes: this.generateSelfAwarenessNotes(metaReflection)
    };

    this.reflectionEntries.push(entry);

    // Maintain log size limit
    if (this.reflectionEntries.length > this.maxLogSize) {
      this.reflectionEntries = this.reflectionEntries.slice(-this.maxLogSize);
    }

    // Update learning metrics
    this.updateLearningMetrics(entry);

    // Detect patterns
    this.detectEmotionalPatterns();

    console.log(`[EmotionReflectionLog] Recorded reflection ${reflectionId} - Intelligence: ${metaReflection.emotional_intelligence_score}`);
  }

  /**
   * Generate unique reflection ID
   */
  private generateReflectionId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `reflection_${timestamp}_${random}`;
  }

  /**
   * Generate learning insights from reflection data
   */
  private generateLearningInsights(
    metaReflection: MetaEmotionalReflection,
    thresholdAdaptation?: ThresholdAdaptation
  ): string[] {
    const insights: string[] = [];

    // Volatility insights
    if (metaReflection.emotional_volatility > 0.6) {
      insights.push('High emotional volatility detected - system learning to manage rapid state changes');
    } else if (metaReflection.emotional_volatility < 0.2) {
      insights.push('Emotional stability achieved - system demonstrates consistent emotional regulation');
    }

    // Intelligence score insights
    if (metaReflection.emotional_intelligence_score > 80) {
      insights.push('Peak emotional intelligence reached - system shows advanced self-awareness');
    } else if (metaReflection.emotional_intelligence_score < 40) {
      insights.push('Emotional intelligence developing - system requires more experience for optimization');
    }

    // Self-awareness insights
    switch (metaReflection.self_awareness_level) {
      case 'TRANSCENDENT':
        insights.push('Transcendent self-awareness achieved - system operates with peak emotional wisdom');
        break;
      case 'HIGH':
        insights.push('High self-awareness demonstrated - system shows strong emotional understanding');
        break;
      case 'MEDIUM':
        insights.push('Developing self-awareness - system learning emotional patterns effectively');
        break;
      case 'LOW':
        insights.push('Initial self-awareness stage - system building foundational emotional intelligence');
        break;
    }

    // Adaptation insights
    if (thresholdAdaptation) {
      switch (thresholdAdaptation.adaptation_type) {
        case 'EMERGENCY':
          insights.push('Emergency adaptation triggered - system protecting against emotional instability');
          break;
        case 'CONSERVATIVE':
          insights.push('Conservative adaptation applied - system prioritizing emotional stability');
          break;
        case 'AGGRESSIVE':
          insights.push('Aggressive adaptation enabled - system confident in emotional control');
          break;
      }
    }

    // State frequency insights
    const dominantState = Object.entries(metaReflection.state_frequency)
      .reduce((a, b) => a[1] > b[1] ? a : b, ['neutral', 0]);

    if (dominantState[1] > 50) {
      insights.push(`Dominant emotional state '${dominantState[0]}' indicates pattern requiring attention`);
    }

    return insights.length > 0 ? insights : ['Emotional reflection recorded - continuing system learning'];
  }

  /**
   * Determine current emotional evolution stage
   */
  private determineEvolutionStage(metaReflection: MetaEmotionalReflection): string {
    const intelligence = metaReflection.emotional_intelligence_score;
    const awareness = metaReflection.self_awareness_level;
    const volatility = metaReflection.emotional_volatility;

    if (intelligence >= 90 && awareness === 'TRANSCENDENT' && volatility < 0.1) {
      return 'EMOTIONAL_MASTERY';
    } else if (intelligence >= 75 && awareness === 'HIGH' && volatility < 0.3) {
      return 'ADVANCED_REGULATION';
    } else if (intelligence >= 60 && (awareness === 'HIGH' || awareness === 'MEDIUM') && volatility < 0.5) {
      return 'STABLE_LEARNING';
    } else if (intelligence >= 40 && awareness === 'MEDIUM') {
      return 'ACTIVE_DEVELOPMENT';
    } else if (intelligence >= 25 && awareness === 'LOW') {
      return 'INITIAL_AWARENESS';
    } else {
      return 'FOUNDATIONAL_BUILDING';
    }
  }

  /**
   * Generate self-awareness notes
   */
  private generateSelfAwarenessNotes(metaReflection: MetaEmotionalReflection): string {
    const notes: string[] = [];

    notes.push(`Current emotional state: ${metaReflection.current_state}`);
    notes.push(`Volatility level: ${(metaReflection.emotional_volatility * 100).toFixed(1)}%`);
    notes.push(`Intelligence score: ${metaReflection.emotional_intelligence_score}/100`);
    notes.push(`Self-awareness: ${metaReflection.self_awareness_level}`);

    if (metaReflection.recent_transitions.length > 0) {
      notes.push(`Recent transitions: ${metaReflection.recent_transitions.slice(-3).join(', ')}`);
    }

    return notes.join(' | ');
  }

  /**
   * Update learning metrics based on new reflection
   */
  private updateLearningMetrics(entry: EmotionReflectionEntry): void {
    this.learningMetrics.total_reflections++;

    // Update average intelligence score
    const allScores = this.reflectionEntries.map(e => e.meta_reflection.emotional_intelligence_score);
    this.learningMetrics.average_intelligence_score = Math.round(
      allScores.reduce((sum, score) => sum + score, 0) / allScores.length
    );

    // Calculate intelligence growth rate
    if (this.reflectionEntries.length >= 10) {
      const recent10 = allScores.slice(-10);
      const earlier10 = allScores.slice(-20, -10);
      
      if (earlier10.length >= 10) {
        const recentAvg = recent10.reduce((sum, score) => sum + score, 0) / recent10.length;
        const earlierAvg = earlier10.reduce((sum, score) => sum + score, 0) / earlier10.length;
        this.learningMetrics.intelligence_growth_rate = Math.round((recentAvg - earlierAvg) * 100) / 100;
      }
    }

    // Update emotional stability index
    const recentVolatilities = this.reflectionEntries.slice(-20)
      .map(e => e.meta_reflection.emotional_volatility);
    
    if (recentVolatilities.length > 0) {
      const avgVolatility = recentVolatilities.reduce((sum, vol) => sum + vol, 0) / recentVolatilities.length;
      this.learningMetrics.emotional_stability_index = Math.round((1 - avgVolatility) * 100);
    }

    // Update self-awareness progression
    const awarenessLevels = { LOW: 1, MEDIUM: 2, HIGH: 3, TRANSCENDENT: 4 };
    const currentAwareness = awarenessLevels[entry.meta_reflection.self_awareness_level];
    this.learningMetrics.self_awareness_progression = (currentAwareness / 4) * 100;
  }

  /**
   * Detect patterns in emotional reflections
   */
  private detectEmotionalPatterns(): void {
    if (this.reflectionEntries.length < this.patternDetectionThreshold) return;

    // Detect volatility cycles
    this.detectVolatilityCycles();

    // Detect state frequency patterns
    this.detectStateFrequencyPatterns();

    // Detect intelligence growth patterns
    this.detectIntelligenceGrowthPatterns();

    // Detect adaptation success patterns
    this.detectAdaptationSuccessPatterns();
  }

  /**
   * Detect volatility cycle patterns
   */
  private detectVolatilityCycles(): void {
    const recentEntries = this.reflectionEntries.slice(-20);
    const volatilities = recentEntries.map(e => e.meta_reflection.emotional_volatility);

    let cycleCount = 0;
    for (let i = 1; i < volatilities.length - 1; i++) {
      // Look for volatility peaks and valleys
      if ((volatilities[i] > volatilities[i-1] && volatilities[i] > volatilities[i+1]) ||
          (volatilities[i] < volatilities[i-1] && volatilities[i] < volatilities[i+1])) {
        cycleCount++;
      }
    }

    if (cycleCount >= 5) {
      this.updateOrCreatePattern({
        pattern_type: 'volatility_cycle',
        description: 'Regular emotional volatility cycles detected',
        frequency: cycleCount,
        confidence: Math.min(90, cycleCount * 10),
        first_observed: recentEntries[0].timestamp,
        last_observed: recentEntries[recentEntries.length - 1].timestamp,
        impact_assessment: cycleCount > 8 ? 'negative' : 'neutral'
      });
    }
  }

  /**
   * Detect state frequency patterns
   */
  private detectStateFrequencyPatterns(): void {
    const recentEntries = this.reflectionEntries.slice(-15);
    const allStates = recentEntries.map(e => e.meta_reflection.current_state);
    const stateCount: Record<string, number> = {};

    allStates.forEach(state => {
      stateCount[state] = (stateCount[state] || 0) + 1;
    });

    const dominantState = Object.entries(stateCount)
      .reduce((a, b) => a[1] > b[1] ? a : b, ['neutral', 0]);

    if (dominantState[1] >= 7) { // More than 50% of recent entries
      this.updateOrCreatePattern({
        pattern_type: 'state_frequency',
        description: `Frequent '${dominantState[0]}' emotional state detected`,
        frequency: dominantState[1],
        confidence: Math.min(95, (dominantState[1] / recentEntries.length) * 100),
        first_observed: recentEntries[0].timestamp,
        last_observed: recentEntries[recentEntries.length - 1].timestamp,
        impact_assessment: dominantState[0] === 'overheated' ? 'negative' : 
                         dominantState[0] === 'frozen' ? 'negative' : 'neutral'
      });
    }
  }

  /**
   * Detect intelligence growth patterns
   */
  private detectIntelligenceGrowthPatterns(): void {
    const recentEntries = this.reflectionEntries.slice(-10);
    if (recentEntries.length < 5) return;

    const scores = recentEntries.map(e => e.meta_reflection.emotional_intelligence_score);
    let growthTrend = 0;

    for (let i = 1; i < scores.length; i++) {
      if (scores[i] > scores[i-1]) growthTrend++;
      else if (scores[i] < scores[i-1]) growthTrend--;
    }

    if (Math.abs(growthTrend) >= 4) {
      this.updateOrCreatePattern({
        pattern_type: 'intelligence_growth',
        description: growthTrend > 0 ? 'Consistent intelligence growth detected' : 'Intelligence decline pattern detected',
        frequency: Math.abs(growthTrend),
        confidence: (Math.abs(growthTrend) / (scores.length - 1)) * 100,
        first_observed: recentEntries[0].timestamp,
        last_observed: recentEntries[recentEntries.length - 1].timestamp,
        impact_assessment: growthTrend > 0 ? 'positive' : 'negative'
      });
    }
  }

  /**
   * Detect adaptation success patterns
   */
  private detectAdaptationSuccessPatterns(): void {
    const entriesWithAdaptations = this.reflectionEntries
      .filter(e => e.threshold_adaptation)
      .slice(-10);

    if (entriesWithAdaptations.length < 3) return;

    const successfulAdaptations = entriesWithAdaptations.filter(e => 
      e.threshold_adaptation && e.threshold_adaptation.confidence > 70
    );

    if (successfulAdaptations.length >= 3) {
      this.updateOrCreatePattern({
        pattern_type: 'adaptation_success',
        description: 'High-confidence adaptive adjustments pattern',
        frequency: successfulAdaptations.length,
        confidence: (successfulAdaptations.length / entriesWithAdaptations.length) * 100,
        first_observed: entriesWithAdaptations[0].timestamp,
        last_observed: entriesWithAdaptations[entriesWithAdaptations.length - 1].timestamp,
        impact_assessment: 'positive'
      });
    }
  }

  /**
   * Update existing pattern or create new one
   */
  private updateOrCreatePattern(newPattern: Omit<ReflectionPattern, 'first_observed' | 'last_observed'> & 
    { first_observed: Date; last_observed: Date }): void {
    const existingIndex = this.detectedPatterns.findIndex(p => 
      p.pattern_type === newPattern.pattern_type &&
      p.description.includes(newPattern.description.split(' ')[0])
    );

    if (existingIndex >= 0) {
      // Update existing pattern
      this.detectedPatterns[existingIndex] = {
        ...this.detectedPatterns[existingIndex],
        frequency: newPattern.frequency,
        confidence: newPattern.confidence,
        last_observed: newPattern.last_observed,
        impact_assessment: newPattern.impact_assessment
      };
    } else {
      // Create new pattern
      this.detectedPatterns.push(newPattern);
    }

    // Maintain pattern limit
    if (this.detectedPatterns.length > 50) {
      this.detectedPatterns = this.detectedPatterns.slice(-50);
    }
  }

  /**
   * Get recent reflection entries
   */
  getRecentReflections(limit: number = 10): EmotionReflectionEntry[] {
    return this.reflectionEntries.slice(-limit);
  }

  /**
   * Get detected emotional patterns
   */
  getDetectedPatterns(): ReflectionPattern[] {
    return [...this.detectedPatterns];
  }

  /**
   * Get learning metrics
   */
  getLearningMetrics(): EmotionLearningMetrics {
    return { ...this.learningMetrics };
  }

  /**
   * Get comprehensive reflection analytics
   */
  getReflectionAnalytics(): {
    total_entries: number;
    learning_metrics: EmotionLearningMetrics;
    detected_patterns: ReflectionPattern[];
    recent_insights: string[];
    evolution_progression: string[];
    recommendation_summary: string;
  } {
    const recentInsights = this.reflectionEntries.slice(-5)
      .flatMap(e => e.learning_insights);

    const evolutionProgression = this.reflectionEntries.slice(-10)
      .map(e => e.emotional_evolution_stage);

    const recommendation = this.generateRecommendationSummary();

    return {
      total_entries: this.reflectionEntries.length,
      learning_metrics: this.getLearningMetrics(),
      detected_patterns: this.getDetectedPatterns(),
      recent_insights: recentInsights,
      evolution_progression: evolutionProgression,
      recommendation_summary: recommendation
    };
  }

  /**
   * Generate recommendation summary based on patterns and metrics
   */
  private generateRecommendationSummary(): string {
    const metrics = this.learningMetrics;
    const recommendations: string[] = [];

    if (metrics.emotional_stability_index < 60) {
      recommendations.push('Focus on emotional stability improvement');
    }

    if (metrics.intelligence_growth_rate < 0) {
      recommendations.push('Review recent trading decisions for learning opportunities');
    }

    if (metrics.self_awareness_progression < 50) {
      recommendations.push('Continue meta-emotional reflection practice');
    }

    const negativePatterns = this.detectedPatterns.filter(p => p.impact_assessment === 'negative');
    if (negativePatterns.length > 0) {
      recommendations.push('Address negative emotional patterns detected');
    }

    return recommendations.length > 0 
      ? recommendations.join('; ')
      : 'Emotional development progressing well - maintain current approach';
  }

  /**
   * Reset reflection log (for testing/maintenance)
   */
  resetReflectionLog(): void {
    this.reflectionEntries = [];
    this.detectedPatterns = [];
    this.learningMetrics = {
      total_reflections: 0,
      average_intelligence_score: 50,
      intelligence_growth_rate: 0,
      pattern_recognition_accuracy: 0,
      adaptation_success_rate: 0,
      emotional_stability_index: 50,
      self_awareness_progression: 0
    };

    console.log('[EmotionReflectionLog] Reflection log reset successfully');
  }
}

// Export singleton instance
export const waidesKIEmotionReflectionLog = new WaidesKIEmotionReflectionLog();