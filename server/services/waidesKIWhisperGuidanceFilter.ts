/**
 * STEP 50: Whisper Guidance Filter - Apply Ancestral Wisdom
 * Applies ancestral trading wisdom to allow/block trades based on historical patterns
 * Integrates with pre-trade pipeline for real-time decision filtering
 */

import { waidesKIAncestralWhisperEngine } from './waidesKIAncestralWhisperEngine.js';
import { waidesKIWhisperContextAnalyzer } from './waidesKIWhisperContextAnalyzer.js';

interface TradeRequest {
  action: string;
  price: number;
  amount: number;
  context: {
    rsi: number;
    ema50: number;
    ema200: number;
    volume: number;
    market_trend: string;
    emotional_state: string;
    time_window: string;
    volatility: number;
    position_type?: string;
  };
}

interface FilterDecision {
  approved: boolean;
  action: 'ALLOW' | 'BLOCK' | 'MODIFY' | 'DEFER';
  reason: string;
  ancestral_advice: string | null;
  confidence: number;
  konslang_echo: string;
  modified_amount?: number;
  wait_duration?: number;
  risk_warning?: string;
  spirit_count: number;
  success_rate: number;
}

export class WaidesKIWhisperGuidanceFilter {
  private filterThresholds = {
    block_threshold: 25,      // Block if ancestral success rate below 25%
    caution_threshold: 50,    // Apply caution if below 50%
    reduce_threshold: 40,     // Reduce position size if below 40%
    defer_threshold: 30,      // Defer if confidence below 30%
    min_spirit_count: 2       // Minimum spirits needed for guidance
  };

  private konslangResponses = {
    'block': 'mor\'keleth ael\'kor - ancestral shadows forbid this path',
    'allow': 'sil\'varien ael\'kor - ancient light blesses this decision',
    'caution': 'vel\'thara ael\'kor - spirits counsel careful steps',
    'modify': 'ri\'saal ael\'kor - echoes suggest a different measure',
    'defer': 'nou\'mar ael\'kor - wait for clearer ancestral signs',
    'no_guidance': 'dun\'morogh ael\'kor - deep memory stirs but speaks not'
  };

  /**
   * Apply ancestral guidance to filter trade decision
   */
  applyAncestralGuidance(tradeRequest: TradeRequest): FilterDecision {
    const guidance = waidesKIAncestralWhisperEngine.ask(tradeRequest.context);
    
    if (!guidance.advice || guidance.count < this.filterThresholds.min_spirit_count) {
      return this.handleNoGuidance(tradeRequest, guidance);
    }

    // Apply filtering logic based on ancestral wisdom
    return this.processAncestralGuidance(tradeRequest, guidance);
  }

  /**
   * Validate trade against ancestral patterns
   */
  validateTrade(tradeRequest: TradeRequest): FilterDecision {
    const validation = waidesKIAncestralWhisperEngine.validateTradeDecision(
      tradeRequest.context,
      tradeRequest.action
    );
    
    const guidance = waidesKIAncestralWhisperEngine.ask(tradeRequest.context);
    
    return {
      approved: validation.ancestral_approval,
      action: validation.ancestral_approval ? 'ALLOW' : 'BLOCK',
      reason: validation.final_recommendation,
      ancestral_advice: guidance.advice,
      confidence: validation.approval_strength,
      konslang_echo: validation.konslang_blessing,
      spirit_count: guidance.count,
      success_rate: guidance.success_rate,
      risk_warning: guidance.risk_warning
    };
  }

  /**
   * Get comprehensive trade analysis with ancestral insight
   */
  getTradeAnalysis(tradeRequest: TradeRequest): any {
    const comprehensiveGuidance = waidesKIAncestralWhisperEngine.getComprehensiveGuidance(tradeRequest.context);
    const filterDecision = this.applyAncestralGuidance(tradeRequest);
    
    return {
      trade_request: tradeRequest,
      filter_decision: filterDecision,
      comprehensive_analysis: comprehensiveGuidance,
      integration_recommendations: this.generateIntegrationRecommendations(filterDecision, comprehensiveGuidance),
      post_trade_requirements: this.generatePostTradeRequirements(tradeRequest, filterDecision)
    };
  }

  /**
   * Process trade with real-time ancestral consultation
   */
  processTradeWithAncestors(tradeRequest: TradeRequest): any {
    const startTime = Date.now();
    
    // Step 1: Get ancestral guidance
    const guidance = waidesKIAncestralWhisperEngine.ask(tradeRequest.context);
    
    // Step 2: Apply filtering
    const filterDecision = this.applyAncestralGuidance(tradeRequest);
    
    // Step 3: Generate execution plan
    const executionPlan = this.generateExecutionPlan(tradeRequest, filterDecision, guidance);
    
    // Step 4: Create monitoring plan
    const monitoringPlan = this.createMonitoringPlan(tradeRequest, guidance);
    
    const processingTime = Date.now() - startTime;
    
    return {
      ancestral_consultation: guidance,
      filter_decision: filterDecision,
      execution_plan: executionPlan,
      monitoring_plan: monitoringPlan,
      processing_time_ms: processingTime,
      timestamp: new Date(),
      context_hash: waidesKIWhisperContextAnalyzer.getContextHash(tradeRequest.context)
    };
  }

  /**
   * Handle cases with no ancestral guidance
   */
  private handleNoGuidance(tradeRequest: TradeRequest, guidance: any): FilterDecision {
    return {
      approved: true, // Allow by default when no guidance
      action: 'ALLOW',
      reason: 'No ancestral guidance available - proceeding with standard risk management',
      ancestral_advice: null,
      confidence: 50, // Neutral confidence
      konslang_echo: this.konslangResponses.no_guidance,
      spirit_count: guidance.count,
      success_rate: 0,
      risk_warning: 'Proceed with heightened awareness - no historical precedent available'
    };
  }

  /**
   * Process guidance and make filtering decision
   */
  private processAncestralGuidance(tradeRequest: TradeRequest, guidance: any): FilterDecision {
    const { success_rate, confidence, advice, risk_warning } = guidance;
    
    // Block trade if ancestral patterns show high failure rate
    if (success_rate <= this.filterThresholds.block_threshold && confidence >= 60) {
      return {
        approved: false,
        action: 'BLOCK',
        reason: `Ancestral patterns show ${success_rate.toFixed(1)}% success rate - blocking trade`,
        ancestral_advice: advice,
        confidence,
        konslang_echo: this.konslangResponses.block,
        spirit_count: guidance.count,
        success_rate,
        risk_warning
      };
    }
    
    // Defer trade if confidence is too low
    if (confidence <= this.filterThresholds.defer_threshold) {
      return {
        approved: false,
        action: 'DEFER',
        reason: `Low ancestral confidence (${confidence.toFixed(1)}%) - deferring for clearer signals`,
        ancestral_advice: advice,
        confidence,
        konslang_echo: this.konslangResponses.defer,
        wait_duration: 300, // 5 minutes
        spirit_count: guidance.count,
        success_rate,
        risk_warning
      };
    }
    
    // Reduce position size if patterns suggest caution
    if (success_rate <= this.filterThresholds.reduce_threshold && confidence >= 50) {
      const reductionFactor = this.calculateReductionFactor(success_rate, confidence);
      
      return {
        approved: true,
        action: 'MODIFY',
        reason: `Ancestral caution - reducing position size by ${((1 - reductionFactor) * 100).toFixed(0)}%`,
        ancestral_advice: advice,
        confidence,
        konslang_echo: this.konslangResponses.modify,
        modified_amount: tradeRequest.amount * reductionFactor,
        spirit_count: guidance.count,
        success_rate,
        risk_warning
      };
    }
    
    // Apply caution but allow trade
    if (success_rate <= this.filterThresholds.caution_threshold) {
      return {
        approved: true,
        action: 'ALLOW',
        reason: `Proceeding with caution - ancestral patterns show ${success_rate.toFixed(1)}% success rate`,
        ancestral_advice: advice,
        confidence,
        konslang_echo: this.konslangResponses.caution,
        spirit_count: guidance.count,
        success_rate,
        risk_warning: risk_warning || 'Exercise additional caution based on ancestral patterns'
      };
    }
    
    // Allow trade with ancestral blessing
    return {
      approved: true,
      action: 'ALLOW',
      reason: `Ancestral blessing - patterns show ${success_rate.toFixed(1)}% success rate`,
      ancestral_advice: advice,
      confidence,
      konslang_echo: this.konslangResponses.allow,
      spirit_count: guidance.count,
      success_rate,
      risk_warning
    };
  }

  /**
   * Calculate position size reduction factor
   */
  private calculateReductionFactor(successRate: number, confidence: number): number {
    // Base reduction on success rate and confidence
    const successFactor = successRate / 100;
    const confidenceFactor = confidence / 100;
    
    // Minimum 30% position, maximum 80% position based on ancestral guidance
    const reductionFactor = Math.max(0.3, Math.min(0.8, (successFactor + confidenceFactor) / 2));
    
    return reductionFactor;
  }

  /**
   * Generate execution plan based on ancestral guidance
   */
  private generateExecutionPlan(tradeRequest: TradeRequest, decision: FilterDecision, guidance: any): any {
    const plan = {
      execute: decision.approved,
      delay_seconds: 0,
      position_size: tradeRequest.amount,
      stop_loss_adjustment: 0,
      take_profit_adjustment: 0,
      monitoring_interval: 60, // seconds
      exit_conditions: [] as string[]
    };

    if (decision.action === 'DEFER') {
      plan.execute = false;
      plan.delay_seconds = decision.wait_duration || 300;
    }

    if (decision.action === 'MODIFY' && decision.modified_amount) {
      plan.position_size = decision.modified_amount;
    }

    // Adjust risk parameters based on ancestral wisdom
    if (guidance.success_rate <= 40) {
      plan.stop_loss_adjustment = -0.5; // Tighter stop loss
      plan.monitoring_interval = 30; // More frequent monitoring
      plan.exit_conditions.push('Exit early if pattern deteriorates');
    }

    if (guidance.advice && guidance.advice.includes('hold')) {
      plan.take_profit_adjustment = 0.3; // Wider take profit
      plan.exit_conditions.push('Hold for longer based on ancestral patience');
    }

    return plan;
  }

  /**
   * Create monitoring plan for post-trade tracking
   */
  private createMonitoringPlan(tradeRequest: TradeRequest, guidance: any): any {
    return {
      track_outcome: true,
      feedback_categories: [
        'entry_timing',
        'exit_timing', 
        'position_sizing',
        'market_context',
        'emotional_factors'
      ],
      learning_points: [
        'Compare actual vs ancestral predictions',
        'Note any pattern deviations',
        'Record emotional state during trade',
        'Document market condition changes'
      ],
      record_spirit_on_exit: true,
      context_hash: waidesKIWhisperContextAnalyzer.getContextHash(tradeRequest.context),
      guidance_used: guidance
    };
  }

  /**
   * Generate integration recommendations for other systems
   */
  private generateIntegrationRecommendations(decision: FilterDecision, comprehensive: any): any {
    const recommendations = {
      trinity_brain_integration: 'normal',
      immunity_system_alert: false,
      emotional_core_adjustment: 'none',
      risk_manager_notification: false
    };

    if (decision.action === 'BLOCK') {
      recommendations.trinity_brain_integration = 'override_warning';
      recommendations.immunity_system_alert = true;
      recommendations.risk_manager_notification = true;
    }

    if (decision.success_rate <= 30) {
      recommendations.emotional_core_adjustment = 'increase_caution';
    }

    return recommendations;
  }

  /**
   * Generate post-trade requirements
   */
  private generatePostTradeRequirements(tradeRequest: TradeRequest, decision: FilterDecision): any {
    return {
      record_outcome: true,
      feedback_required: decision.spirit_count >= 3,
      learning_update: true,
      pattern_validation: decision.confidence >= 60,
      spirit_strength_update: true,
      context_documentation: {
        market_conditions: tradeRequest.context.market_trend,
        emotional_state: tradeRequest.context.emotional_state,
        time_window: tradeRequest.context.time_window
      }
    };
  }
}

export const waidesKIWhisperGuidanceFilter = new WaidesKIWhisperGuidanceFilter();