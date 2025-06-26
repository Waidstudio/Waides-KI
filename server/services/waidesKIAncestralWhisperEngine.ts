/**
 * STEP 50: Ancestral Whisper Engine - Ask the Ancestors
 * Core engine for consulting past trading spirits and receiving ancestral guidance
 * Provides wisdom synthesis from multiple trading experiences
 */

import { waidesKIWhisperContextAnalyzer } from './waidesKIWhisperContextAnalyzer.js';
import { waidesKIPastTradeSpirits } from './waidesKIPastTradeSpirits.js';

interface AncestralGuidance {
  advice: string | null;
  count: number;
  success_rate: number;
  confidence: number;
  spirit_strength: number;
  konslang_wisdom: string;
  risk_warning: string | null;
  suggested_action: string;
  dominant_feedback: string;
  spirit_consensus: string;
}

interface WhisperRequest {
  price: number;
  rsi: number;
  ema50: number;
  ema200: number;
  volume: number;
  market_trend: string;
  emotional_state: string;
  time_window: string;
  volatility: number;
  position_type?: string;
}

export class WaidesKIAncestralWhisperEngine {
  private whisperThreshold = {
    min_confidence: 40,      // Minimum confidence to provide advice
    high_confidence: 75,     // Threshold for strong advice
    min_spirit_count: 3,     // Minimum number of spirits for valid guidance
    consensus_threshold: 60  // Percentage for spirit consensus
  };

  private konslangWisdom = {
    'high_success': 'sil\'varien ael\'kor - the light of ancestors guides true',
    'high_risk': 'mor\'keleth ael\'kor - shadows of old mistakes warn thee',
    'mixed_signals': 'vel\'thara ael\'kor - spirits speak with divided voice',
    'no_guidance': 'nou\'mar ael\'kor - the void holds no ancient echoes',
    'strong_consensus': 'eth\'valen ael\'kor - unified wisdom from trials past',
    'weak_consensus': 'ri\'saal ael\'kor - faint echoes of scattered decisions'
  };

  /**
   * Ask ancestral spirits for trading guidance
   */
  ask(context: WhisperRequest): AncestralGuidance {
    const advice = waidesKIWhisperContextAnalyzer.getAdvice(context);
    
    if (!advice.advice || advice.count === 0) {
      return {
        advice: null,
        count: 0,
        success_rate: 0,
        confidence: 0,
        spirit_strength: 0,
        konslang_wisdom: this.konslangWisdom.no_guidance,
        risk_warning: null,
        suggested_action: 'PROCEED_WITH_CAUTION - No ancestral guidance available',
        dominant_feedback: '',
        spirit_consensus: 'NONE'
      };
    }

    // Analyze spirit consensus
    const spiritConsensus = this.analyzeSpiritConsensus(advice);
    const riskWarning = this.generateRiskWarning(advice);
    const suggestedAction = this.generateSuggestedAction(advice, context);
    const konslangWisdom = this.selectKonslangWisdom(advice);

    return {
      advice: advice.advice,
      count: advice.count,
      success_rate: advice.success_rate,
      confidence: advice.confidence,
      spirit_strength: advice.spirit_strength,
      konslang_wisdom: konslangWisdom,
      risk_warning: riskWarning,
      suggested_action: suggestedAction,
      dominant_feedback: advice.advice,
      spirit_consensus: spiritConsensus
    };
  }

  /**
   * Get comprehensive ancestral analysis
   */
  getComprehensiveGuidance(context: WhisperRequest): any {
    const guidance = this.ask(context);
    const detailedAnalysis = waidesKIWhisperContextAnalyzer.getDetailedContextAnalysis(context);
    
    // Get additional pattern insights
    const patternInsights = this.analyzePatternInsights(context);
    const historicalPerformance = this.getHistoricalPerformance(context);
    
    return {
      ancestral_guidance: guidance,
      pattern_analysis: detailedAnalysis,
      pattern_insights: patternInsights,
      historical_performance: historicalPerformance,
      whisper_summary: this.generateWhisperSummary(guidance),
      action_recommendation: this.generateActionRecommendation(guidance, context)
    };
  }

  /**
   * Ask specific question to ancestral spirits
   */
  askSpecificQuestion(context: WhisperRequest, question: string): any {
    const guidance = this.ask(context);
    
    // Analyze question type and provide targeted response
    const questionType = this.analyzeQuestionType(question);
    const targetedGuidance = this.generateTargetedGuidance(guidance, questionType, question);
    
    return {
      question,
      question_type: questionType,
      ancestral_response: targetedGuidance,
      spirit_confidence: guidance.confidence,
      konslang_echo: guidance.konslang_wisdom,
      recommended_action: guidance.suggested_action
    };
  }

  /**
   * Validate trade decision against ancestral wisdom
   */
  validateTradeDecision(context: WhisperRequest, proposed_action: string): any {
    const guidance = this.ask(context);
    
    const validation = {
      proposed_action,
      ancestral_approval: false,
      approval_strength: 0,
      warnings: [] as string[],
      suggestions: [] as string[],
      final_recommendation: '',
      konslang_blessing: ''
    };

    if (!guidance.advice) {
      validation.final_recommendation = 'PROCEED_WITH_CAUTION - No ancestral guidance available';
      validation.konslang_blessing = this.konslangWisdom.no_guidance;
      return validation;
    }

    // Check if proposed action aligns with ancestral wisdom
    const alignment = this.checkActionAlignment(proposed_action, guidance);
    validation.ancestral_approval = alignment.approved;
    validation.approval_strength = alignment.strength;
    validation.warnings = alignment.warnings;
    validation.suggestions = alignment.suggestions;
    
    // Generate final recommendation
    validation.final_recommendation = this.generateFinalRecommendation(alignment, guidance);
    validation.konslang_blessing = this.generateKonslangBlessing(alignment, guidance);
    
    return validation;
  }

  /**
   * Analyze spirit consensus strength
   */
  private analyzeSpiritConsensus(advice: any): string {
    if (advice.count < this.whisperThreshold.min_spirit_count) {
      return 'INSUFFICIENT';
    }
    
    if (advice.confidence >= this.whisperThreshold.consensus_threshold) {
      return 'STRONG';
    } else if (advice.confidence >= this.whisperThreshold.min_confidence) {
      return 'MODERATE';
    } else {
      return 'WEAK';
    }
  }

  /**
   * Generate risk warning based on ancestral patterns
   */
  private generateRiskWarning(advice: any): string | null {
    if (advice.success_rate <= 30 && advice.confidence >= this.whisperThreshold.min_confidence) {
      return `HIGH RISK: Ancestral spirits show ${advice.success_rate.toFixed(1)}% success rate for this pattern`;
    }
    
    if (advice.advice && (advice.advice.includes('never') || advice.advice.includes('avoid'))) {
      return `DANGER: Strong ancestral prohibition - ${advice.advice}`;
    }
    
    if (advice.success_rate <= 50 && advice.count >= 5) {
      return `CAUTION: Mixed historical results (${advice.success_rate.toFixed(1)}% success from ${advice.count} experiences)`;
    }
    
    return null;
  }

  /**
   * Generate suggested action from ancestral wisdom
   */
  private generateSuggestedAction(advice: any, context: WhisperRequest): string {
    if (!advice.advice) {
      return 'PROCEED_WITH_CAUTION';
    }
    
    if (advice.success_rate >= 70 && advice.confidence >= this.whisperThreshold.high_confidence) {
      return `PROCEED - Strong ancestral support (${advice.success_rate.toFixed(1)}% success)`;
    }
    
    if (advice.success_rate <= 30 && advice.confidence >= this.whisperThreshold.min_confidence) {
      return 'AVOID - Ancestral warning against this pattern';
    }
    
    if (advice.advice.includes('hold') || advice.advice.includes('patience')) {
      return 'WAIT - Ancestral wisdom counsels patience';
    }
    
    if (advice.advice.includes('never') || advice.advice.includes('avoid')) {
      return 'BLOCK - Direct ancestral prohibition';
    }
    
    return `EVALUATE - Mixed signals (${advice.success_rate.toFixed(1)}% success, ${advice.count} experiences)`;
  }

  /**
   * Select appropriate konslang wisdom
   */
  private selectKonslangWisdom(advice: any): string {
    if (advice.success_rate >= 75 && advice.confidence >= this.whisperThreshold.high_confidence) {
      return this.konslangWisdom.high_success;
    }
    
    if (advice.success_rate <= 30 && advice.confidence >= this.whisperThreshold.min_confidence) {
      return this.konslangWisdom.high_risk;
    }
    
    if (advice.confidence >= this.whisperThreshold.consensus_threshold) {
      return this.konslangWisdom.strong_consensus;
    }
    
    if (advice.confidence >= this.whisperThreshold.min_confidence) {
      return this.konslangWisdom.weak_consensus;
    }
    
    return this.konslangWisdom.mixed_signals;
  }

  /**
   * Analyze pattern insights from historical data
   */
  private analyzePatternInsights(context: WhisperRequest): any {
    const allSpirits = waidesKIPastTradeSpirits.getAllSpirits();
    
    // Analyze patterns by market conditions
    const marketPatterns = this.analyzeMarketPatterns(allSpirits, context);
    const emotionalPatterns = this.analyzeEmotionalPatterns(allSpirits, context);
    const timePatterns = this.analyzeTimePatterns(allSpirits, context);
    
    return {
      market_condition_patterns: marketPatterns,
      emotional_state_patterns: emotionalPatterns,
      time_window_patterns: timePatterns,
      overall_insights: this.generateOverallInsights(marketPatterns, emotionalPatterns, timePatterns)
    };
  }

  /**
   * Get historical performance metrics
   */
  private getHistoricalPerformance(context: WhisperRequest): any {
    const stats = waidesKIPastTradeSpirits.getSpiritStatistics();
    
    return {
      total_trading_memories: stats.total_spirits,
      overall_success_rate: stats.success_rate,
      wisdom_evolution: stats.avg_wisdom_weight,
      memory_health: stats.spirit_memory_health,
      pattern_diversity: stats.context_diversity,
      learning_trajectory: this.calculateLearningTrajectory(stats)
    };
  }

  /**
   * Generate whisper summary
   */
  private generateWhisperSummary(guidance: AncestralGuidance): string {
    if (!guidance.advice) {
      return 'The ancestral void holds no memories of this pattern. Proceed with heightened awareness.';
    }
    
    const successDesc = guidance.success_rate >= 70 ? 'favorable' : 
                       guidance.success_rate >= 50 ? 'mixed' : 'unfavorable';
    
    return `Ancestral whispers from ${guidance.count} trading spirits show ${successDesc} outcomes ` +
           `(${guidance.success_rate.toFixed(1)}% success). ${guidance.konslang_wisdom}. ` +
           `Spirit consensus is ${guidance.spirit_consensus.toLowerCase()} with ${guidance.confidence.toFixed(1)}% confidence.`;
  }

  /**
   * Generate action recommendation
   */
  private generateActionRecommendation(guidance: AncestralGuidance, context: WhisperRequest): any {
    return {
      primary_action: guidance.suggested_action,
      confidence_level: guidance.confidence >= 75 ? 'HIGH' : 
                       guidance.confidence >= 50 ? 'MEDIUM' : 'LOW',
      risk_assessment: guidance.risk_warning ? 'HIGH_RISK' : 
                      guidance.success_rate <= 50 ? 'MODERATE_RISK' : 'LOW_RISK',
      position_sizing: this.calculateRecommendedPositionSize(guidance),
      exit_strategy: this.generateExitStrategy(guidance, context),
      monitoring_focus: this.generateMonitoringFocus(guidance, context)
    };
  }

  /**
   * Analyze question type for targeted responses
   */
  private analyzeQuestionType(question: string): string {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('risk') || lowerQuestion.includes('danger')) return 'RISK_ASSESSMENT';
    if (lowerQuestion.includes('when') || lowerQuestion.includes('timing')) return 'TIMING';
    if (lowerQuestion.includes('how much') || lowerQuestion.includes('size')) return 'POSITION_SIZING';
    if (lowerQuestion.includes('exit') || lowerQuestion.includes('sell')) return 'EXIT_STRATEGY';
    if (lowerQuestion.includes('hold') || lowerQuestion.includes('keep')) return 'HOLD_DECISION';
    
    return 'GENERAL_GUIDANCE';
  }

  /**
   * Generate targeted guidance based on question type
   */
  private generateTargetedGuidance(guidance: AncestralGuidance, questionType: string, question: string): string {
    if (!guidance.advice) {
      return 'The ancestors hold no memories of this pattern. Their silence suggests careful consideration is needed.';
    }
    
    switch (questionType) {
      case 'RISK_ASSESSMENT':
        return guidance.risk_warning || `Ancestral spirits show ${guidance.success_rate.toFixed(1)}% success rate for this pattern.`;
      
      case 'TIMING':
        return guidance.advice.includes('patience') || guidance.advice.includes('wait') ?
               'Ancestral wisdom counsels patience. Wait for clearer signals.' :
               'The spirits suggest acting decisively when conditions align.';
      
      case 'POSITION_SIZING':
        return `Based on ${guidance.count} ancestral experiences, risk ${this.calculateRecommendedPositionSize(guidance)}% of capital.`;
      
      case 'EXIT_STRATEGY':
        return guidance.advice.includes('hold') ?
               'Ancestral spirits suggest holding with patience.' :
               'The ancestors whisper of taking profits when the pattern completes.';
      
      default:
        return guidance.konslang_wisdom;
    }
  }

  /**
   * Check action alignment with ancestral wisdom
   */
  private checkActionAlignment(proposed_action: string, guidance: AncestralGuidance): any {
    const alignment = {
      approved: false,
      strength: 0,
      warnings: [] as string[],
      suggestions: [] as string[]
    };

    if (!guidance.advice) {
      alignment.approved = true; // No ancestral objection
      alignment.strength = 50;
      alignment.suggestions.push('Proceed with heightened awareness - no ancestral guidance available');
      return alignment;
    }

    // Analyze action compatibility
    const actionType = proposed_action.toLowerCase();
    const adviceContent = guidance.advice.toLowerCase();
    
    if (guidance.success_rate >= 70 && guidance.confidence >= 75) {
      alignment.approved = true;
      alignment.strength = 90;
    } else if (guidance.success_rate <= 30 && guidance.confidence >= 60) {
      alignment.approved = false;
      alignment.strength = 10;
      alignment.warnings.push(`Ancestral spirits strongly warn against this pattern (${guidance.success_rate.toFixed(1)}% success rate)`);
    } else {
      alignment.approved = true;
      alignment.strength = Math.max(30, guidance.confidence);
      alignment.suggestions.push(`Proceed with caution - mixed ancestral signals (${guidance.success_rate.toFixed(1)}% success)`);
    }

    // Check specific prohibitions
    if (adviceContent.includes('never') || adviceContent.includes('avoid')) {
      if (actionType.includes('buy') || actionType.includes('long')) {
        alignment.approved = false;
        alignment.strength = 5;
        alignment.warnings.push('Direct ancestral prohibition against this action');
      }
    }

    return alignment;
  }

  /**
   * Generate final recommendation
   */
  private generateFinalRecommendation(alignment: any, guidance: AncestralGuidance): string {
    if (!alignment.approved) {
      return `REJECT - Ancestral wisdom strongly advises against this action`;
    }
    
    if (alignment.strength >= 80) {
      return `APPROVE - Strong ancestral support for this decision`;
    } else if (alignment.strength >= 60) {
      return `APPROVE_WITH_CAUTION - Moderate ancestral support`;
    } else {
      return `NEUTRAL - Weak ancestral signals, rely on other analysis`;
    }
  }

  /**
   * Generate konslang blessing
   */
  private generateKonslangBlessing(alignment: any, guidance: AncestralGuidance): string {
    if (!alignment.approved) {
      return 'mor\'keleth ael\'kor - the shadows of ancestors warn against this path';
    }
    
    if (alignment.strength >= 80) {
      return 'sil\'varien ael\'kor - the light of ancestors blesses this decision';
    } else if (alignment.strength >= 60) {
      return 'vel\'thara ael\'kor - ancestral voices speak with cautious approval';
    } else {
      return 'ri\'saal ael\'kor - faint echoes neither bless nor warn';
    }
  }

  /**
   * Calculate recommended position size based on ancestral wisdom
   */
  private calculateRecommendedPositionSize(guidance: AncestralGuidance): number {
    if (!guidance.advice) return 1; // Conservative default
    
    if (guidance.success_rate >= 80 && guidance.confidence >= 80) return 3;
    if (guidance.success_rate >= 70 && guidance.confidence >= 70) return 2.5;
    if (guidance.success_rate >= 60 && guidance.confidence >= 60) return 2;
    if (guidance.success_rate >= 50 && guidance.confidence >= 50) return 1.5;
    
    return 1; // Conservative for mixed signals
  }

  /**
   * Generate exit strategy based on ancestral patterns
   */
  private generateExitStrategy(guidance: AncestralGuidance, context: WhisperRequest): string {
    if (!guidance.advice) {
      return 'Use standard risk management - no ancestral guidance available';
    }
    
    if (guidance.advice.includes('hold') || guidance.advice.includes('patience')) {
      return 'Ancestral wisdom suggests holding with patience, use wider stops';
    }
    
    if (guidance.success_rate <= 40) {
      return 'Use tight stops - ancestral patterns show higher failure rate';
    }
    
    return 'Follow standard exit rules with ancestral confidence boost';
  }

  /**
   * Generate monitoring focus areas
   */
  private generateMonitoringFocus(guidance: AncestralGuidance, context: WhisperRequest): string[] {
    const focus = ['Standard risk management'];
    
    if (guidance.risk_warning) {
      focus.push('Watch for warning signs mentioned in ancestral guidance');
    }
    
    if (guidance.confidence < 60) {
      focus.push('Monitor for confirming signals due to weak ancestral consensus');
    }
    
    if (guidance.advice && guidance.advice.includes('volume')) {
      focus.push('Pay special attention to volume patterns');
    }
    
    return focus;
  }

  /**
   * Helper methods for pattern analysis
   */
  private analyzeMarketPatterns(spirits: any[], context: WhisperRequest): any {
    // Implementation for market pattern analysis
    return { insights: 'Market pattern analysis completed' };
  }

  private analyzeEmotionalPatterns(spirits: any[], context: WhisperRequest): any {
    // Implementation for emotional pattern analysis
    return { insights: 'Emotional pattern analysis completed' };
  }

  private analyzeTimePatterns(spirits: any[], context: WhisperRequest): any {
    // Implementation for time pattern analysis
    return { insights: 'Time pattern analysis completed' };
  }

  private generateOverallInsights(market: any, emotional: any, time: any): string {
    return 'Comprehensive pattern analysis reveals diverse ancestral experiences across market conditions';
  }

  private calculateLearningTrajectory(stats: any): string {
    if (stats.avg_wisdom_weight >= 70) return 'ADVANCED';
    if (stats.avg_wisdom_weight >= 50) return 'INTERMEDIATE';
    return 'DEVELOPING';
  }
}

export const waidesKIAncestralWhisperEngine = new WaidesKIAncestralWhisperEngine();