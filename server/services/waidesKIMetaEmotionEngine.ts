/**
 * STEP 51: Meta-Emotion Engine - Self-Aware Emotional Intelligence
 * Tracks emotions about emotions and builds feedback loops for adaptive behavior
 */

interface EmotionalStateHistory {
  timestamp: Date;
  emotion_state: string;
  temperature: number;
  context: string;
}

export interface MetaEmotionalReflection {
  current_state: string;
  emotional_volatility: number;
  state_frequency: Record<string, number>;
  recent_transitions: string[];
  self_awareness_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'TRANSCENDENT';
  emotional_intelligence_score: number;
  adaptive_recommendations: string[];
}

interface MetaEmotionStats {
  total_reflections: number;
  average_volatility: number;
  most_common_state: string;
  adaptation_events: number;
  self_awareness_evolution: string;
  last_reflection: string;
}

export class WaidesKIMetaEmotionEngine {
  private emotionalHistory: EmotionalStateHistory[] = [];
  private maxHistorySize = 200; // Store 200 emotional state entries
  private lastReflectionTime: Date = new Date();
  
  private stats: MetaEmotionStats = {
    total_reflections: 0,
    average_volatility: 0,
    most_common_state: 'neutral',
    adaptation_events: 0,
    self_awareness_evolution: 'AWAKENING',
    last_reflection: new Date().toISOString()
  };

  private readonly SELF_AWARENESS_THRESHOLDS = {
    LOW: 10,       // < 10 reflections
    MEDIUM: 50,    // 10-50 reflections
    HIGH: 150,     // 50-150 reflections
    TRANSCENDENT: 300 // 150+ reflections
  };

  /**
   * Record emotional state for meta-analysis
   */
  recordEmotionalState(
    emotion_state: string, 
    temperature: number, 
    context: string = 'trading'
  ): void {
    const stateEntry: EmotionalStateHistory = {
      timestamp: new Date(),
      emotion_state,
      temperature,
      context
    };

    this.emotionalHistory.push(stateEntry);

    // Maintain history size limit
    if (this.emotionalHistory.length > this.maxHistorySize) {
      this.emotionalHistory = this.emotionalHistory.slice(-this.maxHistorySize);
    }

    // Update stats
    this.updateStats();
  }

  /**
   * Perform meta-emotional reflection and analysis
   */
  performMetaReflection(): MetaEmotionalReflection {
    if (this.emotionalHistory.length < 3) {
      return this.getBasicReflection();
    }

    // Calculate emotional volatility over recent history
    const recentStates = this.emotionalHistory.slice(-20);
    const volatility = this.calculateEmotionalVolatility(recentStates);
    
    // Analyze state frequency
    const stateFrequency = this.calculateStateFrequency(recentStates);
    
    // Track recent transitions
    const recentTransitions = this.getRecentTransitions(recentStates);
    
    // Determine self-awareness level
    const selfAwarenessLevel = this.calculateSelfAwarenessLevel();
    
    // Calculate emotional intelligence score
    const intelligenceScore = this.calculateEmotionalIntelligenceScore(
      volatility, 
      stateFrequency, 
      recentTransitions.length
    );
    
    // Generate adaptive recommendations
    const adaptiveRecommendations = this.generateAdaptiveRecommendations(
      volatility, 
      stateFrequency, 
      selfAwarenessLevel
    );

    const reflection: MetaEmotionalReflection = {
      current_state: recentStates[recentStates.length - 1]?.emotion_state || 'neutral',
      emotional_volatility: volatility,
      state_frequency: stateFrequency,
      recent_transitions: recentTransitions,
      self_awareness_level: selfAwarenessLevel,
      emotional_intelligence_score: intelligenceScore,
      adaptive_recommendations: adaptiveRecommendations
    };

    this.lastReflectionTime = new Date();
    this.stats.total_reflections++;
    this.stats.last_reflection = new Date().toISOString();

    console.log(`[MetaEmotion] Reflection completed - Volatility: ${volatility.toFixed(2)}, Intelligence: ${intelligenceScore}`);

    return reflection;
  }

  /**
   * Calculate emotional volatility based on state changes
   */
  private calculateEmotionalVolatility(states: EmotionalStateHistory[]): number {
    if (states.length < 2) return 0;

    let transitions = 0;
    for (let i = 1; i < states.length; i++) {
      if (states[i].emotion_state !== states[i-1].emotion_state) {
        transitions++;
      }
    }

    return Math.round((transitions / (states.length - 1)) * 100) / 100;
  }

  /**
   * Calculate frequency of emotional states
   */
  private calculateStateFrequency(states: EmotionalStateHistory[]): Record<string, number> {
    const frequency: Record<string, number> = {};
    
    states.forEach(state => {
      frequency[state.emotion_state] = (frequency[state.emotion_state] || 0) + 1;
    });

    // Convert to percentages
    const total = states.length;
    Object.keys(frequency).forEach(key => {
      frequency[key] = Math.round((frequency[key] / total) * 100);
    });

    return frequency;
  }

  /**
   * Get recent emotional transitions
   */
  private getRecentTransitions(states: EmotionalStateHistory[]): string[] {
    const transitions: string[] = [];
    
    for (let i = 1; i < states.length; i++) {
      if (states[i].emotion_state !== states[i-1].emotion_state) {
        transitions.push(`${states[i-1].emotion_state} → ${states[i].emotion_state}`);
      }
    }

    return transitions.slice(-10); // Return last 10 transitions
  }

  /**
   * Calculate current self-awareness level
   */
  private calculateSelfAwarenessLevel(): MetaEmotionalReflection['self_awareness_level'] {
    const reflections = this.stats.total_reflections;
    
    if (reflections >= this.SELF_AWARENESS_THRESHOLDS.TRANSCENDENT) {
      return 'TRANSCENDENT';
    } else if (reflections >= this.SELF_AWARENESS_THRESHOLDS.HIGH) {
      return 'HIGH';
    } else if (reflections >= this.SELF_AWARENESS_THRESHOLDS.MEDIUM) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  /**
   * Calculate emotional intelligence score (0-100)
   */
  private calculateEmotionalIntelligenceScore(
    volatility: number, 
    stateFrequency: Record<string, number>, 
    transitionCount: number
  ): number {
    let score = 50; // Base score

    // Lower volatility increases intelligence (emotional stability)
    score += Math.max(0, (0.5 - volatility) * 50);

    // Balanced state distribution increases intelligence
    const states = Object.values(stateFrequency);
    const balance = 1 - (Math.max(...states) / 100);
    score += balance * 20;

    // Moderate transition count indicates good emotional regulation
    const idealTransitions = 3;
    const transitionScore = Math.max(0, 10 - Math.abs(transitionCount - idealTransitions));
    score += transitionScore;

    // Self-awareness level bonus
    const awarenessLevel = this.calculateSelfAwarenessLevel();
    const awarenessBonus = {
      LOW: 0,
      MEDIUM: 10,
      HIGH: 20,
      TRANSCENDENT: 30
    };
    score += awarenessBonus[awarenessLevel];

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generate adaptive recommendations based on meta-emotional analysis
   */
  private generateAdaptiveRecommendations(
    volatility: number, 
    stateFrequency: Record<string, number>,
    selfAwarenessLevel: MetaEmotionalReflection['self_awareness_level']
  ): string[] {
    const recommendations: string[] = [];

    // Volatility-based recommendations
    if (volatility > 0.6) {
      recommendations.push('High emotional volatility detected - Consider longer cooldown periods');
      recommendations.push('Implement emotional stability protocols before trading');
    } else if (volatility < 0.1) {
      recommendations.push('Emotional state very stable - Safe to increase trading frequency');
    }

    // State frequency recommendations
    const hottestState = Object.entries(stateFrequency)
      .reduce((a, b) => a[1] > b[1] ? a : b, ['neutral', 0]);
    
    if (hottestState[0] === 'overheated' && hottestState[1] > 40) {
      recommendations.push('Frequent overheating detected - Reduce position sizes permanently');
    }
    
    if (hottestState[0] === 'frozen' && hottestState[1] > 30) {
      recommendations.push('Excessive freezing periods - Consider warming strategies');
    }

    // Self-awareness level recommendations
    if (selfAwarenessLevel === 'LOW') {
      recommendations.push('Developing self-awareness - Continue emotional monitoring');
    } else if (selfAwarenessLevel === 'TRANSCENDENT') {
      recommendations.push('Peak emotional intelligence achieved - Trust instinct fully');
    }

    return recommendations.length > 0 ? recommendations : ['Emotional state optimal - Continue current approach'];
  }

  /**
   * Get basic reflection for insufficient data
   */
  private getBasicReflection(): MetaEmotionalReflection {
    return {
      current_state: 'neutral',
      emotional_volatility: 0,
      state_frequency: { neutral: 100 },
      recent_transitions: [],
      self_awareness_level: 'LOW',
      emotional_intelligence_score: 25,
      adaptive_recommendations: ['Insufficient emotional data - Continue trading to build awareness']
    };
  }

  /**
   * Update internal statistics
   */
  private updateStats(): void {
    if (this.emotionalHistory.length === 0) return;

    // Calculate average volatility over all history
    const allVolatilities: number[] = [];
    for (let i = 10; i <= this.emotionalHistory.length; i += 10) {
      const chunk = this.emotionalHistory.slice(Math.max(0, i-20), i);
      allVolatilities.push(this.calculateEmotionalVolatility(chunk));
    }
    
    this.stats.average_volatility = allVolatilities.length > 0 
      ? Math.round((allVolatilities.reduce((a, b) => a + b, 0) / allVolatilities.length) * 100) / 100
      : 0;

    // Find most common state
    const allStates = this.emotionalHistory.map(h => h.emotion_state);
    const stateCount: Record<string, number> = {};
    allStates.forEach(state => {
      stateCount[state] = (stateCount[state] || 0) + 1;
    });
    
    this.stats.most_common_state = Object.entries(stateCount)
      .reduce((a, b) => a[1] > b[1] ? a : b, ['neutral', 0])[0];

    // Update self-awareness evolution
    const awarenessLevel = this.calculateSelfAwarenessLevel();
    this.stats.self_awareness_evolution = awarenessLevel;
  }

  /**
   * Get comprehensive meta-emotion statistics
   */
  getMetaEmotionStats(): MetaEmotionStats & {
    current_reflection: MetaEmotionalReflection;
    emotional_history_size: number;
    time_since_last_reflection: number;
  } {
    const currentReflection = this.performMetaReflection();
    const timeSinceReflection = Date.now() - this.lastReflectionTime.getTime();

    return {
      ...this.stats,
      current_reflection: currentReflection,
      emotional_history_size: this.emotionalHistory.length,
      time_since_last_reflection: Math.round(timeSinceReflection / 1000)
    };
  }

  /**
   * Get recent emotional history for analysis
   */
  getEmotionalHistory(limit: number = 50): EmotionalStateHistory[] {
    return this.emotionalHistory.slice(-limit);
  }

  /**
   * Reset meta-emotional data (for testing/maintenance)
   */
  resetMetaEmotionalData(): void {
    this.emotionalHistory = [];
    this.stats = {
      total_reflections: 0,
      average_volatility: 0,
      most_common_state: 'neutral',
      adaptation_events: 0,
      self_awareness_evolution: 'AWAKENING',
      last_reflection: new Date().toISOString()
    };
    
    console.log('[MetaEmotion] Meta-emotional data reset successfully');
  }

  /**
   * Trigger immediate meta-emotional reflection
   */
  triggerImmediateReflection(): MetaEmotionalReflection {
    console.log('[MetaEmotion] Immediate reflection triggered by external request');
    return this.performMetaReflection();
  }
}

// Export singleton instance
export const waidesKIMetaEmotionEngine = new WaidesKIMetaEmotionEngine();