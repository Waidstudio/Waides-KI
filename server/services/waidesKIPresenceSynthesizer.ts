/**
 * Presence Synthesizer: Translates multi-sensory state into intuitive metaphors
 * Transforms ETH's market behavior into human-like emotional expressions
 */

interface PresenceState {
  price_trend: 'rising' | 'falling' | 'sideways' | 'unknown';
  volatility: number;
  volume_trend: 'increasing' | 'decreasing' | 'stable' | 'unknown';
  sentiment: number;
  emotional_intensity: number;
  trend_strength: number;
}

interface PresenceMetaphor {
  description: string;
  mood: string;
  energy_level: 'low' | 'medium' | 'high' | 'extreme';
  confidence: number;
  trading_implication: string;
}

export class WaidesKIPresenceSynthesizer {
  private metaphorMap: Map<string, PresenceMetaphor>;

  constructor() {
    this.initializeMetaphors();
  }

  /**
   * Initialize the metaphor mapping system
   */
  private initializeMetaphors(): void {
    this.metaphorMap = new Map([
      // Bullish patterns
      ['rising_increasing_high', {
        description: 'preparing for a big night out',
        mood: 'excited',
        energy_level: 'extreme',
        confidence: 95,
        trading_implication: 'Strong buy signal with high conviction'
      }],
      ['rising_increasing_medium', {
        description: 'getting dressed up for something special',
        mood: 'optimistic',
        energy_level: 'high',
        confidence: 80,
        trading_implication: 'Good buy opportunity'
      }],
      ['rising_stable_medium', {
        description: 'walking confidently toward a destination',
        mood: 'determined',
        energy_level: 'medium',
        confidence: 65,
        trading_implication: 'Cautious bullish stance'
      }],
      ['rising_decreasing_low', {
        description: 'cautiously optimistic but hesitant',
        mood: 'uncertain',
        energy_level: 'low',
        confidence: 40,
        trading_implication: 'Weak buy signal, proceed carefully'
      }],

      // Bearish patterns
      ['falling_increasing_high', {
        description: 'readying for a long sleep',
        mood: 'tired',
        energy_level: 'extreme',
        confidence: 95,
        trading_implication: 'Strong sell signal with high conviction'
      }],
      ['falling_increasing_medium', {
        description: 'feeling heavy and wanting to rest',
        mood: 'melancholic',
        energy_level: 'high',
        confidence: 80,
        trading_implication: 'Good sell opportunity'
      }],
      ['falling_stable_medium', {
        description: 'slowly walking away from the crowd',
        mood: 'withdrawn',
        energy_level: 'medium',
        confidence: 65,
        trading_implication: 'Cautious bearish stance'
      }],
      ['falling_decreasing_low', {
        description: 'quietly withdrawing from attention',
        mood: 'subdued',
        energy_level: 'low',
        confidence: 40,
        trading_implication: 'Weak sell signal, monitor closely'
      }],

      // Sideways patterns
      ['sideways_stable_low', {
        description: 'lounging in a calm room',
        mood: 'peaceful',
        energy_level: 'low',
        confidence: 30,
        trading_implication: 'No trading recommended, wait for clarity'
      }],
      ['sideways_stable_medium', {
        description: 'quietly contemplating life',
        mood: 'thoughtful',
        energy_level: 'medium',
        confidence: 25,
        trading_implication: 'Range-bound, wait for breakout'
      }],
      ['sideways_increasing_medium', {
        description: 'sitting still but eyes alert',
        mood: 'watchful',
        energy_level: 'medium',
        confidence: 45,
        trading_implication: 'Potential breakout building'
      }],
      ['sideways_decreasing_low', {
        description: 'dozing peacefully in sunlight',
        mood: 'serene',
        energy_level: 'low',
        confidence: 20,
        trading_implication: 'Low volatility consolidation'
      }],

      // Default/unknown patterns
      ['unknown_unknown_low', {
        description: 'pondering quietly in the shadows',
        mood: 'mysterious',
        energy_level: 'low',
        confidence: 10,
        trading_implication: 'Insufficient data, avoid trading'
      }]
    ]);
  }

  /**
   * Translate presence state into human metaphor
   */
  translate(state: PresenceState): PresenceMetaphor {
    const key = this.generateMetaphorKey(state);
    const metaphor = this.metaphorMap.get(key);
    
    if (metaphor) {
      return {
        ...metaphor,
        confidence: this.adjustConfidenceByTrendStrength(metaphor.confidence, state.trend_strength)
      };
    }

    // Fallback to dynamic generation
    return this.generateDynamicMetaphor(state);
  }

  /**
   * Generate metaphor key based on state patterns
   */
  private generateMetaphorKey(state: PresenceState): string {
    const price = state.price_trend;
    const volume = state.volume_trend;
    const intensity = this.categorizeIntensity(state.emotional_intensity);
    
    return `${price}_${volume}_${intensity}`;
  }

  /**
   * Categorize emotional intensity
   */
  private categorizeIntensity(intensity: number): string {
    if (intensity < 20) return 'low';
    if (intensity < 50) return 'medium';
    if (intensity < 80) return 'high';
    return 'extreme';
  }

  /**
   * Adjust confidence based on trend strength
   */
  private adjustConfidenceByTrendStrength(baseConfidence: number, trendStrength: number): number {
    const strengthMultiplier = trendStrength / 100;
    const adjustedConfidence = baseConfidence * (0.5 + 0.5 * strengthMultiplier);
    return Math.round(Math.max(5, Math.min(95, adjustedConfidence)));
  }

  /**
   * Generate dynamic metaphor for unmapped patterns
   */
  private generateDynamicMetaphor(state: PresenceState): PresenceMetaphor {
    let description = 'experiencing something undefined';
    let mood = 'neutral';
    let energy_level: 'low' | 'medium' | 'high' | 'extreme' = 'low';
    let confidence = 15;
    let trading_implication = 'Pattern unclear, avoid trading';

    // Price-based mood
    switch (state.price_trend) {
      case 'rising':
        mood = 'hopeful';
        description = 'sensing upward energy';
        trading_implication = 'Weak bullish signal';
        confidence += 20;
        break;
      case 'falling':
        mood = 'concerned';
        description = 'feeling downward pressure';
        trading_implication = 'Weak bearish signal';
        confidence += 20;
        break;
      default:
        mood = 'neutral';
        description = 'floating in equilibrium';
        trading_implication = 'No clear direction';
    }

    // Volume-based energy
    switch (state.volume_trend) {
      case 'increasing':
        energy_level = state.emotional_intensity > 50 ? 'extreme' : 'high';
        confidence += 15;
        break;
      case 'decreasing':
        energy_level = 'low';
        confidence -= 10;
        break;
      default:
        energy_level = 'medium';
    }

    // Emotional intensity adjustment
    if (state.emotional_intensity > 70) {
      description = `intensely ${description}`;
      energy_level = 'extreme';
    } else if (state.emotional_intensity < 10) {
      description = `barely ${description}`;
      energy_level = 'low';
    }

    return {
      description,
      mood,
      energy_level,
      confidence: Math.max(5, Math.min(85, confidence)),
      trading_implication
    };
  }

  /**
   * Get trading advice based on metaphor
   */
  getTradingAdvice(metaphor: PresenceMetaphor): {
    action: string;
    strength: string;
    reasoning: string;
    wait_condition?: string;
  } {
    if (metaphor.confidence < 30) {
      return {
        action: 'WAIT',
        strength: 'NONE',
        reasoning: 'ETH presence unclear, insufficient confidence',
        wait_condition: 'Wait for emotional intensity above 30% and clear trend'
      };
    }

    if (metaphor.energy_level === 'extreme' && metaphor.confidence > 70) {
      const action = metaphor.mood === 'excited' || metaphor.mood === 'optimistic' ? 'BUY' : 'SELL';
      return {
        action,
        strength: 'STRONG',
        reasoning: `ETH is ${metaphor.description} with high conviction`
      };
    }

    if (metaphor.energy_level === 'high' && metaphor.confidence > 50) {
      const action = metaphor.mood === 'excited' || metaphor.mood === 'optimistic' || metaphor.mood === 'determined' ? 'BUY' : 'SELL';
      return {
        action,
        strength: 'MODERATE',
        reasoning: `ETH shows ${metaphor.mood} sentiment with good confidence`
      };
    }

    if (metaphor.energy_level === 'medium' && metaphor.confidence > 40) {
      const action = metaphor.trading_implication.includes('bullish') ? 'BUY' : 
                    metaphor.trading_implication.includes('bearish') ? 'SELL' : 'HOLD';
      return {
        action,
        strength: 'WEAK',
        reasoning: `ETH is ${metaphor.description} but with limited conviction`
      };
    }

    return {
      action: 'WAIT',
      strength: 'NONE',
      reasoning: `ETH is ${metaphor.description} - not suitable for trading`,
      wait_condition: 'Wait for higher energy levels and clearer emotional signals'
    };
  }

  /**
   * Get comprehensive analysis
   */
  getComprehensiveAnalysis(state: PresenceState): {
    metaphor: PresenceMetaphor;
    trading_advice: any;
    emotional_context: string;
    risk_assessment: string;
  } {
    const metaphor = this.translate(state);
    const trading_advice = this.getTradingAdvice(metaphor);
    
    const emotional_context = `ETH is currently ${metaphor.description}, feeling ${metaphor.mood} with ${metaphor.energy_level} energy levels. This suggests ${metaphor.trading_implication.toLowerCase()}.`;
    
    let risk_assessment = 'MODERATE';
    if (metaphor.energy_level === 'extreme') {
      risk_assessment = metaphor.confidence > 80 ? 'HIGH_REWARD' : 'HIGH_RISK';
    } else if (metaphor.energy_level === 'low') {
      risk_assessment = 'LOW_OPPORTUNITY';
    }

    return {
      metaphor,
      trading_advice,
      emotional_context,
      risk_assessment
    };
  }

  /**
   * Check if presence favors specific trading timeframes
   */
  getTimeframeRecommendation(state: PresenceState): {
    preferred_timeframe: string;
    reasoning: string;
    confidence: number;
  } {
    const metaphor = this.translate(state);
    
    if (metaphor.energy_level === 'extreme' && metaphor.confidence > 80) {
      return {
        preferred_timeframe: '5m-15m',
        reasoning: 'High energy and conviction suggest short-term momentum opportunities',
        confidence: metaphor.confidence
      };
    }
    
    if (metaphor.energy_level === 'high' && metaphor.confidence > 60) {
      return {
        preferred_timeframe: '15m-1h',
        reasoning: 'Good energy levels suitable for medium-term position holds',
        confidence: metaphor.confidence
      };
    }
    
    if (metaphor.energy_level === 'medium' && metaphor.confidence > 40) {
      return {
        preferred_timeframe: '1h-4h',
        reasoning: 'Moderate energy suggests longer-term position development',
        confidence: metaphor.confidence
      };
    }
    
    return {
      preferred_timeframe: 'AVOID',
      reasoning: 'Low energy and confidence suggest avoiding time-sensitive trades',
      confidence: metaphor.confidence
    };
  }
}

export const waidesKIPresenceSynthesizer = new WaidesKIPresenceSynthesizer();