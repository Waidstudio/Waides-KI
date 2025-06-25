import { waidesKIGlyphMemoryTree } from './waidesKIGlyphMemoryTree';
import { waidesKIKonsigilEngine } from './waidesKIKonsigilEngine';

interface OracleReading {
  confidence: number;
  glyphs_consulted: number;
  success_probability: number;
  risk_assessment: string;
  spiritual_guidance: string;
  protective_measures: string[];
  pattern_warnings: string[];
  oracle_message: string;
  recommended_adjustments: string[];
}

interface PatternProphecy {
  pattern_name: string;
  emotion_context: string;
  historical_success_rate: number;
  average_profit: number;
  strongest_protection: string;
  common_failure_points: string[];
  evolution_recommendations: string[];
  spiritual_compatibility: number;
}

interface OracleStats {
  total_readings_performed: number;
  accurate_predictions: number;
  oracle_accuracy_rate: number;
  most_consulted_pattern: string;
  strongest_prophecy: string;
  last_reading_time: number;
  spiritual_connection_strength: number;
}

export class WaidesKISigilOracle {
  private oracle_stats: OracleStats = {
    total_readings_performed: 0,
    accurate_predictions: 0,
    oracle_accuracy_rate: 0,
    most_consulted_pattern: '',
    strongest_prophecy: '',
    last_reading_time: 0,
    spiritual_connection_strength: 85
  };

  private mystical_phrases = [
    "The ancient glyphs whisper of patterns yet unseen",
    "Sacred geometry reveals the path through market chaos",
    "Spiritual energy flows strongest when discipline guides action",
    "The cosmos aligns when patience meets opportunity",
    "Divine protection surrounds those who honor risk limits",
    "Market spirits favor the prepared mind over the hopeful heart",
    "Konsigils glow brightest when emotion serves strategy",
    "The oracle sees through time's veil to probable futures"
  ];

  private protection_recommendations = {
    'GREED': [
      'Activate Ward_against_Greed before trade execution',
      'Set profit targets below maximum euphoria levels',
      'Use position sizing to prevent overconfidence'
    ],
    'FEAR': [
      'Invoke Barrier_of_Wisdom for emotional stability',
      'Strengthen stop losses with logical reasoning',
      'Channel fear into cautious preparation'
    ],
    'IMPATIENCE': [
      'Summon Shield_of_Patience for timing discipline',
      'Wait for full confirmation before entry',
      'Trust the natural rhythm of market cycles'
    ],
    'EUPHORIA': [
      'Deploy Guard_of_Discipline immediately',
      'Remember: markets humble the overconfident',
      'Scale into positions gradually'
    ]
  };

  constructor() {
    console.log('🔮 Sigil Oracle Initialized - Ancient Wisdom Flows Through Digital Channels');
  }

  // 🔮 CORE ORACLE READING: Scan patterns for future guidance
  async scanPattern(pattern: string, emotion: string, additional_context?: any): Promise<OracleReading> {
    const start_time = Date.now();
    
    // Consult the glyph memory tree
    const historical_glyphs = waidesKIGlyphMemoryTree.findByPatternAndEmotion(pattern, emotion);
    const similar_patterns = this.findSimilarPatterns(pattern, emotion);
    
    // Combine all consulted glyphs
    const all_consulted_glyphs = [...historical_glyphs, ...similar_patterns];
    
    // Calculate oracle insights
    const confidence = this.calculateOracleConfidence(all_consulted_glyphs, additional_context);
    const success_probability = this.calculateSuccessProbability(all_consulted_glyphs);
    const risk_assessment = this.assessRiskLevel(all_consulted_glyphs, emotion);
    
    // Generate spiritual guidance
    const spiritual_guidance = this.generateSpiritualGuidance(
      pattern, 
      emotion, 
      confidence, 
      all_consulted_glyphs
    );
    
    // Recommend protective measures
    const protective_measures = this.recommendProtectiveMeasures(emotion, risk_assessment);
    
    // Identify pattern warnings
    const pattern_warnings = this.identifyPatternWarnings(all_consulted_glyphs);
    
    // Generate oracle message
    const oracle_message = this.generateOracleMessage(
      pattern,
      emotion,
      confidence,
      all_consulted_glyphs.length
    );
    
    // Suggest adjustments
    const recommended_adjustments = this.generateRecommendedAdjustments(
      all_consulted_glyphs,
      emotion,
      additional_context
    );
    
    // Update oracle statistics
    this.updateOracleStats(pattern, confidence);
    
    const reading: OracleReading = {
      confidence,
      glyphs_consulted: all_consulted_glyphs.length,
      success_probability,
      risk_assessment,
      spiritual_guidance,
      protective_measures,
      pattern_warnings,
      oracle_message,
      recommended_adjustments
    };
    
    console.log(`🔮 Oracle Reading Complete: ${pattern}/${emotion} | Confidence: ${(confidence * 100).toFixed(1)}% | Glyphs: ${all_consulted_glyphs.length}`);
    
    return reading;
  }

  // 🎯 SIMILAR PATTERNS: Find related pattern combinations
  private findSimilarPatterns(pattern: string, emotion: string): any[] {
    const similar_glyphs: any[] = [];
    
    // Find patterns with same emotion but different pattern
    const emotion_matches = waidesKIGlyphMemoryTree.searchGlyphs({ emotion });
    similar_glyphs.push(...emotion_matches.slice(0, 5));
    
    // Find patterns with same pattern but different emotion
    const pattern_matches = waidesKIGlyphMemoryTree.searchGlyphs({ pattern });
    similar_glyphs.push(...pattern_matches.slice(0, 5));
    
    // Remove duplicates
    const unique_glyphs = similar_glyphs.filter((glyph, index, array) => 
      array.findIndex(g => g.konsigil === glyph.konsigil) === index
    );
    
    return unique_glyphs;
  }

  // 📊 ORACLE CONFIDENCE: Calculate reading confidence
  private calculateOracleConfidence(glyphs: any[], additional_context?: any): number {
    if (glyphs.length === 0) return 0.3; // Low confidence with no historical data
    
    let confidence = 0.5; // Base confidence
    
    // More glyphs = higher confidence (but with diminishing returns)
    const glyph_bonus = Math.min(0.3, glyphs.length * 0.05);
    confidence += glyph_bonus;
    
    // Recent glyphs are more relevant
    const recent_glyphs = glyphs.filter(g => Date.now() - g.timestamp < 30 * 24 * 60 * 60 * 1000);
    if (recent_glyphs.length > 0) {
      confidence += 0.1;
    }
    
    // High memory strength glyphs increase confidence
    const strong_memories = glyphs.filter(g => g.memory_strength > 70);
    confidence += (strong_memories.length / glyphs.length) * 0.15;
    
    // Consistent outcomes increase confidence
    const successful_glyphs = glyphs.filter(g => g.success);
    const success_rate = successful_glyphs.length / glyphs.length;
    if (success_rate > 0.8 || success_rate < 0.2) {
      confidence += 0.1; // High consistency (either way) increases confidence
    }
    
    // Additional context can boost confidence
    if (additional_context?.market_conditions === 'FAVORABLE') {
      confidence += 0.05;
    }
    
    // Spiritual connection strength affects confidence
    confidence *= (this.oracle_stats.spiritual_connection_strength / 100);
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  // 🎲 SUCCESS PROBABILITY: Calculate likelihood of success
  private calculateSuccessProbability(glyphs: any[]): number {
    if (glyphs.length === 0) return 0.5; // Neutral probability
    
    const successful_glyphs = glyphs.filter(g => g.success);
    let base_probability = successful_glyphs.length / glyphs.length;
    
    // Weight recent glyphs more heavily
    const recent_glyphs = glyphs.filter(g => Date.now() - g.timestamp < 14 * 24 * 60 * 60 * 1000);
    if (recent_glyphs.length > 0) {
      const recent_success_rate = recent_glyphs.filter(g => g.success).length / recent_glyphs.length;
      base_probability = (base_probability * 0.7) + (recent_success_rate * 0.3);
    }
    
    // Consider power scores
    const average_power = glyphs.reduce((sum, g) => sum + g.power_score, 0) / glyphs.length;
    if (average_power > 0.5) {
      base_probability += 0.1;
    } else if (average_power < -0.2) {
      base_probability -= 0.1;
    }
    
    return Math.max(0.1, Math.min(0.9, base_probability));
  }

  // ⚠️ RISK ASSESSMENT: Evaluate risk level
  private assessRiskLevel(glyphs: any[], emotion: string): string {
    if (glyphs.length === 0) return 'UNKNOWN';
    
    const average_loss = glyphs
      .filter(g => !g.success)
      .reduce((sum, g) => sum + Math.abs(g.result), 0) / Math.max(1, glyphs.filter(g => !g.success).length);
    
    const failed_glyphs_ratio = glyphs.filter(g => !g.success).length / glyphs.length;
    
    // Emotional risk factors
    const high_risk_emotions = ['GREEDY', 'FEARFUL', 'EUPHORIC', 'IMPATIENT'];
    const emotional_risk = high_risk_emotions.includes(emotion);
    
    if (average_loss > 100 || failed_glyphs_ratio > 0.7 || emotional_risk) {
      return 'HIGH';
    } else if (average_loss > 50 || failed_glyphs_ratio > 0.5) {
      return 'MODERATE';
    } else if (average_loss < 20 && failed_glyphs_ratio < 0.3) {
      return 'LOW';
    } else {
      return 'MODERATE';
    }
  }

  // ✨ SPIRITUAL GUIDANCE: Generate mystical wisdom
  private generateSpiritualGuidance(
    pattern: string, 
    emotion: string, 
    confidence: number, 
    glyphs: any[]
  ): string {
    let guidance = '';
    
    if (confidence > 0.8) {
      guidance = "The spirits speak with clear voice - path ahead shows promise. ";
    } else if (confidence > 0.6) {
      guidance = "Moderate spiritual clarity received - proceed with balanced awareness. ";
    } else if (confidence > 0.4) {
      guidance = "Mixed signals from beyond - extra caution advised. ";
    } else {
      guidance = "Spiritual channels clouded - seek deeper preparation. ";
    }
    
    // Add emotion-specific guidance
    if (emotion === 'GREEDY') {
      guidance += "Temper desire with wisdom. Greed clouds the sacred sight.";
    } else if (emotion === 'FEARFUL') {
      guidance += "Transform fear into careful preparation. Courage grows from knowledge.";
    } else if (emotion === 'DISCIPLINED') {
      guidance += "Your discipline honors the ancient ways. Continue with steady resolve.";
    } else if (emotion === 'CONFIDENT') {
      guidance += "Confidence serves you well, but remain humble before market mysteries.";
    } else {
      guidance += this.mystical_phrases[Math.floor(Math.random() * this.mystical_phrases.length)];
    }
    
    return guidance;
  }

  // 🛡️ PROTECTIVE MEASURES: Recommend safeguards
  private recommendProtectiveMeasures(emotion: string, risk_level: string): string[] {
    const measures: string[] = [];
    
    // Emotion-based protections
    if (this.protection_recommendations[emotion as keyof typeof this.protection_recommendations]) {
      measures.push(...this.protection_recommendations[emotion as keyof typeof this.protection_recommendations]);
    }
    
    // Risk-based protections
    if (risk_level === 'HIGH') {
      measures.push(
        'Reduce position size by 50%',
        'Set tighter stop losses',
        'Consider paper trading this setup first'
      );
    } else if (risk_level === 'MODERATE') {
      measures.push(
        'Use standard position sizing',
        'Implement trailing stops',
        'Monitor closely for first hour'
      );
    } else if (risk_level === 'LOW') {
      measures.push(
        'Standard protections sufficient',
        'Consider slightly larger position',
        'Set reasonable profit targets'
      );
    }
    
    // Always recommend these
    measures.push(
      'Honor stop losses without exception',
      'Review exit plan before entry',
      'Maintain emotional discipline'
    );
    
    return [...new Set(measures)]; // Remove duplicates
  }

  // ⚠️ PATTERN WARNINGS: Identify potential failure points
  private identifyPatternWarnings(glyphs: any[]): string[] {
    const warnings: string[] = [];
    
    if (glyphs.length === 0) {
      warnings.push('No historical data - trading blind');
      return warnings;
    }
    
    // Check for consistent failure patterns
    const recent_failures = glyphs
      .filter(g => !g.success && Date.now() - g.timestamp < 30 * 24 * 60 * 60 * 1000)
      .length;
    
    if (recent_failures > glyphs.length * 0.6) {
      warnings.push('High recent failure rate detected');
    }
    
    // Check for large losses
    const big_losses = glyphs.filter(g => g.result < -100);
    if (big_losses.length > 0) {
      warnings.push('Pattern has history of significant losses');
    }
    
    // Check for emotional patterns
    const emotional_failures = glyphs.filter(g => 
      !g.success && ['GREEDY', 'FEARFUL', 'IMPATIENT'].includes(g.emotion_shade)
    );
    if (emotional_failures.length > glyphs.length * 0.4) {
      warnings.push('Emotional trading associated with poor outcomes');
    }
    
    // Check for quick exits
    const quick_exits = glyphs.filter(g => 
      !g.success && g.duration_ms < 60 * 60 * 1000 // Less than 1 hour
    );
    if (quick_exits.length > glyphs.length * 0.3) {
      warnings.push('Pattern shows tendency for premature exits');
    }
    
    return warnings;
  }

  // 📜 ORACLE MESSAGE: Generate mystical communication
  private generateOracleMessage(
    pattern: string, 
    emotion: string, 
    confidence: number, 
    glyph_count: number
  ): string {
    const confidence_percent = (confidence * 100).toFixed(1);
    
    let message = `🔮 The Oracle speaks: `;
    
    if (glyph_count === 0) {
      message += `"No ancient marks guide this path of ${pattern} born from ${emotion}. Walk with extreme caution, for you venture into uncharted spiritual territory."`;
    } else if (confidence > 0.8) {
      message += `"${glyph_count} sacred glyphs align with ${confidence_percent}% certainty. The path of ${pattern} fueled by ${emotion} shows strong promise. The ancestors smile upon this direction."`;
    } else if (confidence > 0.6) {
      message += `"${glyph_count} glyphs whisper with ${confidence_percent}% clarity. ${pattern} pattern touched by ${emotion} carries moderate favor. Proceed with measured confidence."`;
    } else if (confidence > 0.4) {
      message += `"${glyph_count} ancient marks speak with ${confidence_percent}% certainty. The ${pattern} path influenced by ${emotion} shows mixed omens. Extra vigilance required."`;
    } else {
      message += `"${glyph_count} glyphs offer only ${confidence_percent}% clarity. ${pattern} shaped by ${emotion} walks through shadow. Seek deeper wisdom before proceeding."`;
    }
    
    return message;
  }

  // 🔧 RECOMMENDED ADJUSTMENTS: Suggest improvements
  private generateRecommendedAdjustments(
    glyphs: any[], 
    emotion: string, 
    additional_context?: any
  ): string[] {
    const adjustments: string[] = [];
    
    if (glyphs.length === 0) {
      adjustments.push(
        'Start with minimal position size',
        'Document this setup for future learning',
        'Consider waiting for confirmed pattern'
      );
      return adjustments;
    }
    
    // Analyze common failure points
    const failed_glyphs = glyphs.filter(g => !g.success);
    if (failed_glyphs.length > 0) {
      const common_exit_reasons = failed_glyphs.reduce((acc, g) => {
        acc[g.exit_reason] = (acc[g.exit_reason] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
      
      const most_common_failure = Object.entries(common_exit_reasons)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (most_common_failure && most_common_failure[1] > failed_glyphs.length * 0.3) {
        adjustments.push(`Address common failure point: ${most_common_failure[0]}`);
      }
    }
    
    // Success pattern analysis
    const successful_glyphs = glyphs.filter(g => g.success);
    if (successful_glyphs.length > 0) {
      const avg_success_duration = successful_glyphs.reduce((sum, g) => sum + g.duration_ms, 0) / successful_glyphs.length;
      adjustments.push(`Target holding duration: ${Math.round(avg_success_duration / (60 * 60 * 1000))} hours`);
      
      const most_protective_runes = successful_glyphs
        .flatMap(g => g.protection_runes)
        .reduce((acc, rune) => {
          acc[rune] = (acc[rune] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });
      
      const top_protection = Object.entries(most_protective_runes)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (top_protection) {
        adjustments.push(`Emphasize protection: ${top_protection[0]}`);
      }
    }
    
    // Emotion-specific adjustments
    if (emotion === 'GREEDY') {
      adjustments.push('Set profit targets before entry', 'Use partial profit taking');
    } else if (emotion === 'FEARFUL') {
      adjustments.push('Practice with smaller sizes first', 'Have clear exit plan');
    }
    
    return adjustments;
  }

  // 🔮 PATTERN PROPHECY: Deep analysis of specific pattern
  async generatePatternProphecy(pattern: string, emotion: string): Promise<PatternProphecy> {
    const historical_glyphs = waidesKIGlyphMemoryTree.findByPatternAndEmotion(pattern, emotion);
    const all_pattern_glyphs = waidesKIGlyphMemoryTree.searchGlyphs({ pattern });
    
    const successful_trades = historical_glyphs.filter(g => g.success);
    const historical_success_rate = historical_glyphs.length > 0 ? 
      (successful_trades.length / historical_glyphs.length) * 100 : 0;
    
    const average_profit = successful_trades.length > 0 ?
      successful_trades.reduce((sum, g) => sum + g.result, 0) / successful_trades.length : 0;
    
    // Find strongest protection
    const protection_usage = historical_glyphs
      .flatMap(g => g.protection_runes)
      .reduce((acc, rune) => {
        acc[rune] = (acc[rune] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
    
    const strongest_protection = Object.entries(protection_usage)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
    
    // Identify failure points
    const failed_trades = historical_glyphs.filter(g => !g.success);
    const common_failure_points = failed_trades
      .map(g => g.exit_reason)
      .reduce((acc, reason) => {
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });
    
    const failure_list = Object.entries(common_failure_points)
      .sort(([,a], [,b]) => b - a)
      .map(([reason]) => reason)
      .slice(0, 3);
    
    // Generate evolution recommendations
    const evolution_recommendations = this.generateEvolutionRecommendations(
      historical_glyphs, 
      pattern, 
      emotion
    );
    
    // Calculate spiritual compatibility
    const spiritual_compatibility = this.calculateSpiritualCompatibility(
      pattern, 
      emotion, 
      historical_glyphs
    );
    
    return {
      pattern_name: pattern,
      emotion_context: emotion,
      historical_success_rate,
      average_profit,
      strongest_protection,
      common_failure_points: failure_list,
      evolution_recommendations,
      spiritual_compatibility
    };
  }

  private generateEvolutionRecommendations(glyphs: any[], pattern: string, emotion: string): string[] {
    const recommendations: string[] = [];
    
    if (glyphs.length < 5) {
      recommendations.push('Gather more experience with this pattern');
    }
    
    const success_rate = glyphs.filter(g => g.success).length / Math.max(1, glyphs.length);
    
    if (success_rate < 0.5) {
      recommendations.push('Consider modifying entry criteria');
      recommendations.push('Strengthen risk management rules');
    } else if (success_rate > 0.8) {
      recommendations.push('Pattern shows strong performance - maintain discipline');
      recommendations.push('Consider slightly larger position sizes');
    }
    
    if (emotion === 'GREEDY' && success_rate < 0.6) {
      recommendations.push('Work on emotional discipline before trading this pattern');
    }
    
    return recommendations;
  }

  private calculateSpiritualCompatibility(pattern: string, emotion: string, glyphs: any[]): number {
    let compatibility = 50; // Base compatibility
    
    // Positive emotions increase compatibility
    if (['CALM', 'DISCIPLINED', 'CONFIDENT', 'FOCUSED'].includes(emotion)) {
      compatibility += 20;
    } else if (['GREEDY', 'FEARFUL', 'IMPATIENT'].includes(emotion)) {
      compatibility -= 15;
    }
    
    // Pattern complexity affects compatibility
    if (['REVERSAL', 'BREAKOUT'].includes(pattern)) {
      compatibility += 10; // Clear patterns have good compatibility
    }
    
    // Historical success improves compatibility
    if (glyphs.length > 0) {
      const success_rate = glyphs.filter(g => g.success).length / glyphs.length;
      compatibility += (success_rate - 0.5) * 40; // Adjust based on historical performance
    }
    
    return Math.max(0, Math.min(100, compatibility));
  }

  // 📊 ORACLE STATISTICS: Update and get oracle stats
  private updateOracleStats(pattern: string, confidence: number): void {
    this.oracle_stats.total_readings_performed++;
    this.oracle_stats.last_reading_time = Date.now();
    
    // Track most consulted pattern
    // This would need a proper tracking mechanism in real implementation
    
    // Update spiritual connection based on confidence levels
    if (confidence > 0.8) {
      this.oracle_stats.spiritual_connection_strength = Math.min(100, 
        this.oracle_stats.spiritual_connection_strength + 1);
    } else if (confidence < 0.3) {
      this.oracle_stats.spiritual_connection_strength = Math.max(50, 
        this.oracle_stats.spiritual_connection_strength - 1);
    }
  }

  // 📊 PUBLIC INTERFACE: Get oracle statistics
  getOracleStatistics(): OracleStats {
    return { ...this.oracle_stats };
  }

  // 🔮 DIVINE CONSULTATION: Quick consultation for trading decision
  async quickConsultation(pattern: string, emotion: string): Promise<{
    proceed: boolean;
    confidence_level: string;
    key_warning: string;
    blessed_protection: string;
  }> {
    const reading = await this.scanPattern(pattern, emotion);
    
    const proceed = reading.confidence > 0.5 && reading.success_probability > 0.6;
    
    const confidence_level = reading.confidence > 0.8 ? 'HIGH' :
                            reading.confidence > 0.6 ? 'MODERATE' :
                            reading.confidence > 0.4 ? 'LOW' : 'VERY_LOW';
    
    const key_warning = reading.pattern_warnings.length > 0 ? 
      reading.pattern_warnings[0] : 'Standard market risks apply';
    
    const blessed_protection = reading.protective_measures.length > 0 ?
      reading.protective_measures[0] : 'Maintain disciplined approach';
    
    return {
      proceed,
      confidence_level,
      key_warning,
      blessed_protection
    };
  }
}

export const waidesKISigilOracle = new WaidesKISigilOracle();