/**
 * Presence Interpreter: Converts technical trends into human-like presence descriptions
 * Transforms ETH's market behavior into intuitive, emotional language
 */

interface PresenceMapping {
  description: string;
  mood: string;
  energy_level: 'low' | 'medium' | 'high' | 'extreme';
  human_analogy: string;
  trading_sentiment: 'bullish' | 'bearish' | 'neutral' | 'uncertain';
}

interface EnhancedPresence {
  state: string;
  description: string;
  mood: string;
  energy_level: string;
  human_analogy: string;
  trading_sentiment: string;
  confidence_interpretation: string;
  market_phase: string;
  emotional_tone: string;
}

export class WaidesKIPresenceInterpreter {
  private presenceMappings: Map<string, PresenceMapping>;
  private volatilityMappings: Map<string, string>;
  private confidenceMappings: Map<string, string>;

  constructor() {
    this.initializePresenceMappings();
    this.initializeVolatilityMappings();
    this.initializeConfidenceMappings();
  }

  /**
   * Initialize presence state mappings
   */
  private initializePresenceMappings(): void {
    this.presenceMappings = new Map([
      ['rising', {
        description: 'dressing up to go out',
        mood: 'optimistic',
        energy_level: 'high',
        human_analogy: 'getting ready for an exciting evening',
        trading_sentiment: 'bullish'
      }],
      ['falling', {
        description: 'getting ready to sleep',
        mood: 'tired',
        energy_level: 'low',
        human_analogy: 'settling down for the night',
        trading_sentiment: 'bearish'
      }],
      ['sideways', {
        description: 'sitting down in a room',
        mood: 'contemplative',
        energy_level: 'medium',
        human_analogy: 'quietly reading a book',
        trading_sentiment: 'neutral'
      }],
      ['unknown', {
        description: 'unknown mood',
        mood: 'mysterious',
        energy_level: 'medium',
        human_analogy: 'in another room, can\'t quite tell what they\'re doing',
        trading_sentiment: 'uncertain'
      }]
    ]);
  }

  /**
   * Initialize volatility interpretation mappings
   */
  private initializeVolatilityMappings(): void {
    this.volatilityMappings = new Map([
      ['very_low', 'breathing slowly and peacefully'],
      ['low', 'relaxed and steady'],
      ['medium', 'moving with purpose'],
      ['high', 'pacing around with energy'],
      ['very_high', 'restless and agitated'],
      ['extreme', 'in a state of intense motion']
    ]);
  }

  /**
   * Initialize confidence interpretation mappings
   */
  private initializeConfidenceMappings(): void {
    this.confidenceMappings = new Map([
      ['very_low', 'whispered hints, barely audible'],
      ['low', 'subtle gestures, easy to miss'],
      ['medium', 'clear body language, noticeable'],
      ['high', 'strong signals, impossible to ignore'],
      ['very_high', 'shouting with full conviction'],
      ['extreme', 'overwhelming presence, fills the entire room']
    ]);
  }

  /**
   * Interpret basic presence state
   */
  interpret(state: string): string {
    const mapping = this.presenceMappings.get(state);
    return mapping ? mapping.description : 'unknown mood';
  }

  /**
   * Get enhanced presence interpretation with full context
   */
  interpretEnhanced(
    state: string,
    confidence: number,
    volatility: number,
    changePercent: number
  ): EnhancedPresence {
    const baseMapping = this.presenceMappings.get(state) || this.presenceMappings.get('unknown')!;
    
    // Determine volatility level
    const volatilityLevel = this.getVolatilityLevel(volatility);
    const volatilityDescription = this.volatilityMappings.get(volatilityLevel) || 'moving normally';
    
    // Determine confidence level
    const confidenceLevel = this.getConfidenceLevel(confidence);
    const confidenceDescription = this.confidenceMappings.get(confidenceLevel) || 'unclear signals';
    
    // Determine market phase
    const marketPhase = this.getMarketPhase(state, confidence, volatility);
    
    // Create emotional tone
    const emotionalTone = this.getEmotionalTone(state, confidence, changePercent);
    
    // Enhanced description combining base state with volatility
    let enhancedDescription = baseMapping.description;
    if (volatilityLevel !== 'low' && volatilityLevel !== 'very_low') {
      enhancedDescription += `, ${volatilityDescription}`;
    }

    return {
      state: state,
      description: enhancedDescription,
      mood: baseMapping.mood,
      energy_level: baseMapping.energy_level,
      human_analogy: baseMapping.human_analogy,
      trading_sentiment: baseMapping.trading_sentiment,
      confidence_interpretation: confidenceDescription,
      market_phase: marketPhase,
      emotional_tone: emotionalTone
    };
  }

  /**
   * Get volatility level from numeric value
   */
  private getVolatilityLevel(volatility: number): string {
    if (volatility < 0.001) return 'very_low';
    if (volatility < 0.005) return 'low';
    if (volatility < 0.01) return 'medium';
    if (volatility < 0.02) return 'high';
    if (volatility < 0.05) return 'very_high';
    return 'extreme';
  }

  /**
   * Get confidence level from numeric value
   */
  private getConfidenceLevel(confidence: number): string {
    if (confidence < 20) return 'very_low';
    if (confidence < 40) return 'low';
    if (confidence < 60) return 'medium';
    if (confidence < 80) return 'high';
    if (confidence < 95) return 'very_high';
    return 'extreme';
  }

  /**
   * Determine market phase
   */
  private getMarketPhase(state: string, confidence: number, volatility: number): string {
    if (state === 'unknown' || confidence < 20) {
      return 'discovery';
    }
    
    if (volatility > 0.02) {
      return state === 'rising' ? 'breakout' : state === 'falling' ? 'breakdown' : 'chaos';
    }
    
    if (confidence > 70) {
      return state === 'rising' ? 'uptrend' : state === 'falling' ? 'downtrend' : 'consolidation';
    }
    
    return 'transition';
  }

  /**
   * Get emotional tone based on state and metrics
   */
  private getEmotionalTone(state: string, confidence: number, changePercent: number): string {
    if (confidence < 30) {
      return 'uncertain';
    }
    
    if (state === 'rising') {
      if (changePercent > 1) return 'euphoric';
      if (changePercent > 0.5) return 'excited';
      return 'hopeful';
    }
    
    if (state === 'falling') {
      if (changePercent < -1) return 'panicked';
      if (changePercent < -0.5) return 'worried';
      return 'cautious';
    }
    
    if (state === 'sideways') {
      return confidence > 60 ? 'patient' : 'indecisive';
    }
    
    return 'neutral';
  }

  /**
   * Generate narrative description of current presence
   */
  generateNarrative(
    state: string,
    confidence: number,
    volatility: number,
    changePercent: number,
    priceData: any
  ): string {
    const enhanced = this.interpretEnhanced(state, confidence, volatility, changePercent);
    
    const narratives = [
      `ETH is currently ${enhanced.description}, showing ${enhanced.confidence_interpretation}.`,
      `The mood feels ${enhanced.mood} with ${enhanced.energy_level} energy.`,
      `Like someone ${enhanced.human_analogy}, the market sentiment is ${enhanced.trading_sentiment}.`,
      `We're in a ${enhanced.market_phase} phase with an ${enhanced.emotional_tone} emotional tone.`
    ];
    
    // Add price context
    if (priceData && priceData.current > 0) {
      const priceDirection = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'flat';
      const changeAmount = Math.abs(changePercent).toFixed(2);
      narratives.push(`Price is ${priceDirection} ${changeAmount}% at $${priceData.current.toFixed(2)}.`);
    }
    
    return narratives.join(' ');
  }

  /**
   * Get trading advice based on presence interpretation
   */
  getTradingAdvice(enhanced: EnhancedPresence): {
    recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL' | 'WAIT';
    reasoning: string;
    risk_level: 'low' | 'medium' | 'high' | 'extreme';
    time_horizon: 'short' | 'medium' | 'long';
  } {
    const { trading_sentiment, energy_level, market_phase, emotional_tone } = enhanced;
    
    // Determine risk level
    let risk_level: 'low' | 'medium' | 'high' | 'extreme' = 'medium';
    if (energy_level === 'extreme' || emotional_tone === 'panicked' || emotional_tone === 'euphoric') {
      risk_level = 'extreme';
    } else if (energy_level === 'high' || emotional_tone === 'excited' || emotional_tone === 'worried') {
      risk_level = 'high';
    } else if (energy_level === 'low' || emotional_tone === 'patient' || emotional_tone === 'cautious') {
      risk_level = 'low';
    }
    
    // Determine time horizon
    let time_horizon: 'short' | 'medium' | 'long' = 'medium';
    if (market_phase === 'breakout' || market_phase === 'breakdown' || market_phase === 'chaos') {
      time_horizon = 'short';
    } else if (market_phase === 'consolidation' || market_phase === 'discovery') {
      time_horizon = 'long';
    }
    
    // Generate recommendation
    let recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL' | 'WAIT' = 'WAIT';
    let reasoning = '';
    
    if (trading_sentiment === 'bullish') {
      if (market_phase === 'breakout' && emotional_tone === 'excited') {
        recommendation = 'STRONG_BUY';
        reasoning = 'Strong bullish momentum with breakout confirmation';
      } else if (emotional_tone === 'hopeful' || emotional_tone === 'patient') {
        recommendation = 'BUY';
        reasoning = 'Positive sentiment with controlled enthusiasm';
      } else {
        recommendation = 'HOLD';
        reasoning = 'Bullish but waiting for better entry';
      }
    } else if (trading_sentiment === 'bearish') {
      if (market_phase === 'breakdown' && emotional_tone === 'worried') {
        recommendation = 'STRONG_SELL';
        reasoning = 'Strong bearish momentum with breakdown confirmation';
      } else if (emotional_tone === 'cautious') {
        recommendation = 'SELL';
        reasoning = 'Bearish sentiment suggests defensive action';
      } else {
        recommendation = 'HOLD';
        reasoning = 'Bearish but no clear exit signal yet';
      }
    } else if (trading_sentiment === 'neutral') {
      if (emotional_tone === 'patient') {
        recommendation = 'HOLD';
        reasoning = 'Neutral market, patience is key';
      } else {
        recommendation = 'WAIT';
        reasoning = 'Unclear direction, waiting for clearer signals';
      }
    } else {
      recommendation = 'WAIT';
      reasoning = 'Market mood is uncertain, avoiding action';
    }
    
    return {
      recommendation,
      reasoning,
      risk_level,
      time_horizon
    };
  }

  /**
   * Generate presence report for logging/display
   */
  generatePresenceReport(
    state: string,
    confidence: number,
    volatility: number,
    changePercent: number,
    priceData: any
  ): {
    enhanced_presence: EnhancedPresence;
    narrative: string;
    trading_advice: any;
    technical_summary: string;
  } {
    const enhanced = this.interpretEnhanced(state, confidence, volatility, changePercent);
    const narrative = this.generateNarrative(state, confidence, volatility, changePercent, priceData);
    const tradingAdvice = this.getTradingAdvice(enhanced);
    
    const technicalSummary = `State: ${state} | Confidence: ${confidence}% | Volatility: ${(volatility * 100).toFixed(3)}% | Change: ${changePercent.toFixed(2)}%`;
    
    return {
      enhanced_presence: enhanced,
      narrative,
      trading_advice: tradingAdvice,
      technical_summary: technicalSummary
    };
  }
}

export const waidesKIPresenceInterpreter = new WaidesKIPresenceInterpreter();