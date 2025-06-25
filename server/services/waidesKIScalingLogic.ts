interface ScalingContext {
  trade_id: string;
  current_position_size: number;
  entry_price: number;
  current_price: number;
  time_in_position: number;
  
  harmony_metrics: {
    market_harmony: number;
    momentum_consistency: number;
    volume_stability: number;
    trend_alignment: number;
    spiritual_resonance: number;
  };
  
  halo_energy: {
    core_energy: number;
    stability: number;
    trend: 'RISING' | 'STABLE' | 'DECLINING' | 'CRITICAL';
    protection_level: number;
  };
  
  risk_parameters: {
    max_position_size: number;
    current_risk_percentage: number;
    available_capital: number;
    max_scale_factor: number;
  };
}

interface ScalingDecision {
  action: 'SCALE_UP' | 'SCALE_DOWN' | 'HOLD' | 'EMERGENCY_REDUCE';
  scale_factor: number;
  new_position_size: number;
  reasoning: string[];
  confidence: number;
  sacred_approval: boolean;
  konslang_guidance: string;
  timing_window: {
    execute_within: number;
    optimal_timing: number;
  };
  risk_assessment: {
    risk_increase: number;
    max_loss_change: number;
    reward_potential: number;
  };
}

interface ScalingPattern {
  pattern_name: string;
  trigger_conditions: string[];
  scale_direction: 'UP' | 'DOWN';
  typical_factor: number;
  success_rate: number;
  market_conditions: string[];
}

interface ScalingStatistics {
  total_scaling_decisions: number;
  scale_up_count: number;
  scale_down_count: number;
  hold_decisions: number;
  emergency_reductions: number;
  average_scale_factor: number;
  scaling_success_rate: number;
  most_successful_pattern: string;
  breathing_rhythm_score: number;
}

export class WaidesKIScalingLogic {
  private scaling_stats: ScalingStatistics = {
    total_scaling_decisions: 0,
    scale_up_count: 0,
    scale_down_count: 0,
    hold_decisions: 0,
    emergency_reductions: 0,
    average_scale_factor: 1.0,
    scaling_success_rate: 0,
    most_successful_pattern: '',
    breathing_rhythm_score: 85
  };

  private sacred_scaling_thresholds = {
    scale_up_harmony: 0.85,
    scale_down_harmony: 0.45,
    emergency_harmony: 0.25,
    minimum_energy: 0.4,
    optimal_energy: 0.75,
    maximum_scale_factor: 2.5,
    minimum_scale_factor: 0.25
  };

  private breathing_patterns: ScalingPattern[] = [
    {
      pattern_name: 'Deep_Inhale',
      trigger_conditions: ['High harmony', 'Rising energy', 'Strong momentum'],
      scale_direction: 'UP',
      typical_factor: 1.5,
      success_rate: 0.78,
      market_conditions: ['Trending', 'High volume', 'Clear direction']
    },
    {
      pattern_name: 'Gentle_Exhale',
      trigger_conditions: ['Declining harmony', 'Profit protection', 'Momentum weakening'],
      scale_direction: 'DOWN',
      typical_factor: 0.7,
      success_rate: 0.82,
      market_conditions: ['Consolidation', 'Volume decline', 'Uncertainty']
    },
    {
      pattern_name: 'Steady_Breath',
      trigger_conditions: ['Stable harmony', 'Consistent energy', 'Balanced momentum'],
      scale_direction: 'UP',
      typical_factor: 1.2,
      success_rate: 0.71,
      market_conditions: ['Trending', 'Stable volume', 'Clear structure']
    },
    {
      pattern_name: 'Protective_Contraction',
      trigger_conditions: ['Low harmony', 'Energy decline', 'Risk increase'],
      scale_direction: 'DOWN',
      typical_factor: 0.5,
      success_rate: 0.85,
      market_conditions: ['Volatile', 'Uncertain', 'Risk-off']
    },
    {
      pattern_name: 'Sacred_Expansion',
      trigger_conditions: ['Perfect harmony', 'Peak energy', 'Divine alignment'],
      scale_direction: 'UP',
      typical_factor: 2.0,
      success_rate: 0.73,
      market_conditions: ['Strong trend', 'High conviction', 'Optimal timing']
    }
  ];

  private konslang_scaling_wisdom = [
    "Mor'thain vel'keth — Wisdom grows through measured expansion",
    "Vel'nara ash'thul — Power breathes with natural rhythm",
    "Keth'mori yul'van — Patience shapes the sacred flow",
    "Zar'neth bel'thara — Strength contracts to preserve essence",
    "Eth'kaal mor'neth — Time teaches the art of scaling"
  ];

  constructor() {
    console.log('🌬️ Sacred Scaling Logic Initialized - Position Breathing System Active');
  }

  // 🌬️ CORE SCALING: Make sacred scaling decision
  decideScale(context: ScalingContext): ScalingDecision {
    this.scaling_stats.total_scaling_decisions++;
    
    // Calculate overall harmony
    const overall_harmony = this.calculateOverallHarmony(context.harmony_metrics);
    
    // Determine scaling action
    const base_action = this.determineBaseAction(overall_harmony, context.halo_energy);
    
    // Calculate scale factor
    const scale_factor = this.calculateScaleFactor(base_action, context, overall_harmony);
    
    // Apply sacred validation
    const sacred_approval = this.validateSacredScaling(context, scale_factor, overall_harmony);
    
    // Generate reasoning
    const reasoning = this.generateScalingReasoning(base_action, context, overall_harmony);
    
    // Calculate confidence
    const confidence = this.calculateScalingConfidence(context, overall_harmony, sacred_approval);
    
    // Select Konslang guidance
    const konslang_guidance = this.selectKonslangGuidance(base_action, overall_harmony);
    
    // Calculate new position size
    const new_position_size = Math.max(0, context.current_position_size * scale_factor);
    
    // Determine timing window
    const timing_window = this.calculateTimingWindow(base_action, overall_harmony);
    
    // Assess risk changes
    const risk_assessment = this.assessRiskChanges(context, scale_factor);
    
    const decision: ScalingDecision = {
      action: base_action,
      scale_factor,
      new_position_size,
      reasoning,
      confidence,
      sacred_approval,
      konslang_guidance,
      timing_window,
      risk_assessment
    };

    // Update statistics
    this.updateScalingStats(decision);
    
    console.log(`🌬️ Scaling Decision: ${base_action} | Factor: ${scale_factor.toFixed(2)} | Confidence: ${(confidence * 100).toFixed(1)}%`);
    
    return decision;
  }

  // 🎯 OVERALL HARMONY: Calculate combined harmony score
  private calculateOverallHarmony(harmony_metrics: ScalingContext['harmony_metrics']): number {
    const weights = {
      market_harmony: 0.25,
      momentum_consistency: 0.20,
      volume_stability: 0.15,
      trend_alignment: 0.25,
      spiritual_resonance: 0.15
    };

    return Object.entries(harmony_metrics).reduce((total, [key, value]) => {
      const weight = weights[key as keyof typeof weights] || 0;
      return total + (value * weight);
    }, 0);
  }

  // 🎬 BASE ACTION: Determine fundamental scaling action
  private determineBaseAction(
    overall_harmony: number, 
    halo_energy: ScalingContext['halo_energy']
  ): ScalingDecision['action'] {
    // Emergency conditions
    if (halo_energy.core_energy < this.sacred_scaling_thresholds.emergency_harmony || 
        halo_energy.trend === 'CRITICAL') {
      return 'EMERGENCY_REDUCE';
    }

    // Scale up conditions
    if (overall_harmony >= this.sacred_scaling_thresholds.scale_up_harmony &&
        halo_energy.core_energy >= this.sacred_scaling_thresholds.optimal_energy &&
        (halo_energy.trend === 'RISING' || halo_energy.trend === 'STABLE')) {
      return 'SCALE_UP';
    }

    // Scale down conditions
    if (overall_harmony <= this.sacred_scaling_thresholds.scale_down_harmony ||
        halo_energy.core_energy <= this.sacred_scaling_thresholds.minimum_energy ||
        halo_energy.trend === 'DECLINING') {
      return 'SCALE_DOWN';
    }

    // Default to hold
    return 'HOLD';
  }

  // 📏 SCALE FACTOR: Calculate precise scaling factor
  private calculateScaleFactor(
    action: ScalingDecision['action'],
    context: ScalingContext,
    overall_harmony: number
  ): number {
    let factor = 1.0;

    switch (action) {
      case 'SCALE_UP':
        // Base scale up factor
        factor = 1.2 + (overall_harmony - this.sacred_scaling_thresholds.scale_up_harmony) * 2;
        
        // Energy boost
        if (context.halo_energy.core_energy > 0.9) factor += 0.2;
        
        // Momentum boost
        if (context.harmony_metrics.momentum_consistency > 0.8) factor += 0.15;
        
        // Time-based adjustment (longer positions scale more conservatively)
        const hours_in_position = context.time_in_position / (60 * 60 * 1000);
        if (hours_in_position > 4) factor *= (1 - (hours_in_position - 4) * 0.05);
        
        factor = Math.min(factor, this.sacred_scaling_thresholds.maximum_scale_factor);
        break;

      case 'SCALE_DOWN':
        // Base scale down factor
        factor = 0.8 - (this.sacred_scaling_thresholds.scale_down_harmony - overall_harmony) * 1.5;
        
        // Energy penalty
        if (context.halo_energy.core_energy < 0.4) factor -= 0.2;
        
        // Protection preservation
        factor = Math.max(factor, this.sacred_scaling_thresholds.minimum_scale_factor);
        break;

      case 'EMERGENCY_REDUCE':
        // Aggressive reduction for protection
        factor = 0.3 - (0.3 - overall_harmony) * 0.5;
        factor = Math.max(0.1, factor);
        break;

      case 'HOLD':
      default:
        factor = 1.0;
        break;
    }

    // Ensure factor respects risk parameters
    const risk_adjusted_factor = this.adjustForRiskLimits(factor, context);
    
    return Math.max(0.1, Math.min(3.0, risk_adjusted_factor));
  }

  // ⚖️ RISK ADJUSTMENT: Adjust factor for risk limits
  private adjustForRiskLimits(factor: number, context: ScalingContext): number {
    const new_size = context.current_position_size * factor;
    
    // Check maximum position size
    if (new_size > context.risk_parameters.max_position_size) {
      factor = context.risk_parameters.max_position_size / context.current_position_size;
    }
    
    // Check maximum scale factor
    if (factor > context.risk_parameters.max_scale_factor) {
      factor = context.risk_parameters.max_scale_factor;
    }
    
    // Check available capital
    const additional_capital_needed = (new_size - context.current_position_size) * context.current_price;
    if (additional_capital_needed > context.risk_parameters.available_capital) {
      const max_additional_size = context.risk_parameters.available_capital / context.current_price;
      factor = (context.current_position_size + max_additional_size) / context.current_position_size;
    }
    
    return factor;
  }

  // ✨ SACRED VALIDATION: Validate scaling with sacred principles
  private validateSacredScaling(
    context: ScalingContext,
    scale_factor: number,
    overall_harmony: number
  ): boolean {
    // Minimum harmony requirement
    if (overall_harmony < 0.3) return false;
    
    // Minimum energy requirement for scale ups
    if (scale_factor > 1.1 && context.halo_energy.core_energy < 0.6) return false;
    
    // Protection level requirement
    if (context.halo_energy.protection_level < 0.4 && scale_factor > 1.2) return false;
    
    // Time-based restrictions (avoid scaling in first 10 minutes)
    if (context.time_in_position < 10 * 60 * 1000 && scale_factor > 1.3) return false;
    
    // Spiritual resonance requirement for large scales
    if (scale_factor > 1.5 && context.harmony_metrics.spiritual_resonance < 0.7) return false;
    
    return true;
  }

  // 📝 REASONING: Generate human-readable reasoning
  private generateScalingReasoning(
    action: ScalingDecision['action'],
    context: ScalingContext,
    overall_harmony: number
  ): string[] {
    const reasoning: string[] = [];

    // Harmony-based reasoning
    if (overall_harmony > 0.8) {
      reasoning.push('Exceptional market harmony supports expansion');
    } else if (overall_harmony > 0.6) {
      reasoning.push('Good market harmony allows measured scaling');
    } else if (overall_harmony < 0.4) {
      reasoning.push('Poor market harmony requires defensive positioning');
    }

    // Energy-based reasoning
    if (context.halo_energy.core_energy > 0.8) {
      reasoning.push('Strong halo energy provides scaling confidence');
    } else if (context.halo_energy.core_energy < 0.4) {
      reasoning.push('Weak halo energy suggests position reduction');
    }

    // Trend-based reasoning
    if (context.halo_energy.trend === 'RISING') {
      reasoning.push('Rising energy trend supports growth');
    } else if (context.halo_energy.trend === 'DECLINING') {
      reasoning.push('Declining energy trend recommends caution');
    } else if (context.halo_energy.trend === 'CRITICAL') {
      reasoning.push('Critical energy level requires immediate protection');
    }

    // Momentum reasoning
    if (context.harmony_metrics.momentum_consistency > 0.8) {
      reasoning.push('Consistent momentum allows confident scaling');
    } else if (context.harmony_metrics.momentum_consistency < 0.4) {
      reasoning.push('Inconsistent momentum suggests position reduction');
    }

    // Time-based reasoning
    const hours_in_position = context.time_in_position / (60 * 60 * 1000);
    if (hours_in_position > 6) {
      reasoning.push('Extended position duration calls for conservative approach');
    } else if (hours_in_position < 1) {
      reasoning.push('Early position stage allows for patient scaling');
    }

    // Action-specific reasoning
    switch (action) {
      case 'SCALE_UP':
        reasoning.push('Sacred expansion: inhaling position size with market breath');
        break;
      case 'SCALE_DOWN':
        reasoning.push('Sacred contraction: exhaling excess to maintain balance');
        break;
      case 'EMERGENCY_REDUCE':
        reasoning.push('Emergency protection: rapid contraction to preserve capital');
        break;
      case 'HOLD':
        reasoning.push('Sacred stillness: maintaining current breath rhythm');
        break;
    }

    return reasoning;
  }

  // 🎯 CONFIDENCE: Calculate decision confidence
  private calculateScalingConfidence(
    context: ScalingContext,
    overall_harmony: number,
    sacred_approval: boolean
  ): number {
    let confidence = 0.5; // Base confidence

    // Harmony contribution
    confidence += overall_harmony * 0.3;

    // Energy contribution
    confidence += context.halo_energy.core_energy * 0.2;

    // Stability contribution
    confidence += context.halo_energy.stability * 0.15;

    // Sacred approval boost
    if (sacred_approval) confidence += 0.1;

    // Consistency contribution
    confidence += context.harmony_metrics.momentum_consistency * 0.1;

    // Trend contribution
    if (context.halo_energy.trend === 'RISING') confidence += 0.05;
    else if (context.halo_energy.trend === 'DECLINING') confidence -= 0.05;
    else if (context.halo_energy.trend === 'CRITICAL') confidence -= 0.15;

    return Math.max(0.1, Math.min(0.95, confidence));
  }

  // 🗣️ KONSLANG GUIDANCE: Select appropriate wisdom
  private selectKonslangGuidance(action: ScalingDecision['action'], harmony: number): string {
    if (harmony > 0.9) {
      return "Vel'thara mor'keth — Divine harmony blesses sacred expansion";
    } else if (harmony > 0.7) {
      return this.konslang_scaling_wisdom[0]; // Wisdom grows through measured expansion
    } else if (harmony > 0.5) {
      return this.konslang_scaling_wisdom[1]; // Power breathes with natural rhythm
    } else if (harmony > 0.3) {
      return this.konslang_scaling_wisdom[3]; // Strength contracts to preserve essence
    } else {
      return "Mor'thain keth'vel — Sacred wisdom protects through careful contraction";
    }
  }

  // ⏰ TIMING WINDOW: Calculate execution timing
  private calculateTimingWindow(action: ScalingDecision['action'], harmony: number): {
    execute_within: number;
    optimal_timing: number;
  } {
    let execute_within = 15 * 60 * 1000; // Default 15 minutes
    let optimal_timing = 5 * 60 * 1000;  // Default 5 minutes

    switch (action) {
      case 'EMERGENCY_REDUCE':
        execute_within = 2 * 60 * 1000;  // 2 minutes
        optimal_timing = 30 * 1000;      // 30 seconds
        break;
      case 'SCALE_UP':
        if (harmony > 0.9) {
          execute_within = 10 * 60 * 1000; // 10 minutes for high harmony
          optimal_timing = 3 * 60 * 1000;  // 3 minutes
        }
        break;
      case 'SCALE_DOWN':
        execute_within = 8 * 60 * 1000;  // 8 minutes
        optimal_timing = 2 * 60 * 1000;  // 2 minutes
        break;
    }

    return { execute_within, optimal_timing };
  }

  // 📊 RISK ASSESSMENT: Assess risk changes
  private assessRiskChanges(context: ScalingContext, scale_factor: number): {
    risk_increase: number;
    max_loss_change: number;
    reward_potential: number;
  } {
    const position_change = (scale_factor - 1) * context.current_position_size;
    const capital_change = position_change * context.current_price;
    
    const risk_increase = capital_change / context.risk_parameters.available_capital;
    const max_loss_change = capital_change * 0.02; // Assume 2% max loss per position
    
    // Estimate reward potential based on harmony and energy
    const harmony_avg = Object.values(context.harmony_metrics).reduce((a, b) => a + b, 0) / 5;
    const reward_potential = capital_change * harmony_avg * 0.05; // Conservative estimate
    
    return {
      risk_increase,
      max_loss_change,
      reward_potential
    };
  }

  // 📈 STATISTICS UPDATE: Update scaling statistics
  private updateScalingStats(decision: ScalingDecision): void {
    switch (decision.action) {
      case 'SCALE_UP':
        this.scaling_stats.scale_up_count++;
        break;
      case 'SCALE_DOWN':
        this.scaling_stats.scale_down_count++;
        break;
      case 'EMERGENCY_REDUCE':
        this.scaling_stats.emergency_reductions++;
        break;
      case 'HOLD':
        this.scaling_stats.hold_decisions++;
        break;
    }

    // Update average scale factor
    const total_factors = this.scaling_stats.average_scale_factor * (this.scaling_stats.total_scaling_decisions - 1);
    this.scaling_stats.average_scale_factor = (total_factors + decision.scale_factor) / this.scaling_stats.total_scaling_decisions;

    // Update breathing rhythm score based on decision quality
    if (decision.sacred_approval && decision.confidence > 0.7) {
      this.scaling_stats.breathing_rhythm_score = Math.min(100, this.scaling_stats.breathing_rhythm_score + 0.5);
    } else if (!decision.sacred_approval || decision.confidence < 0.4) {
      this.scaling_stats.breathing_rhythm_score = Math.max(0, this.scaling_stats.breathing_rhythm_score - 1);
    }
  }

  // 🌬️ BREATHING PATTERN: Get current breathing pattern
  getCurrentBreathingPattern(): {
    pattern_name: string;
    rhythm_score: number;
    inhale_exhale_ratio: number;
    breathing_depth: string;
    next_breath_prediction: string;
  } {
    const total_decisions = this.scaling_stats.total_scaling_decisions;
    const inhale_count = this.scaling_stats.scale_up_count;
    const exhale_count = this.scaling_stats.scale_down_count + this.scaling_stats.emergency_reductions;
    
    const inhale_exhale_ratio = exhale_count > 0 ? inhale_count / exhale_count : inhale_count;
    
    let pattern_name = 'Balanced_Breathing';
    if (inhale_exhale_ratio > 1.5) pattern_name = 'Expansion_Focused';
    else if (inhale_exhale_ratio < 0.67) pattern_name = 'Contraction_Focused';
    
    let breathing_depth = 'MODERATE';
    if (this.scaling_stats.average_scale_factor > 1.4) breathing_depth = 'DEEP';
    else if (this.scaling_stats.average_scale_factor < 1.1) breathing_depth = 'SHALLOW';
    
    const next_breath_prediction = inhale_exhale_ratio > 1.2 ? 'EXHALE_LIKELY' : 
                                  inhale_exhale_ratio < 0.8 ? 'INHALE_LIKELY' : 'BALANCED';
    
    return {
      pattern_name,
      rhythm_score: this.scaling_stats.breathing_rhythm_score,
      inhale_exhale_ratio,
      breathing_depth,
      next_breath_prediction
    };
  }

  // 📊 PUBLIC INTERFACE: Get scaling statistics
  getScalingStatistics(): ScalingStatistics {
    return { ...this.scaling_stats };
  }

  // 🎯 PATTERN MATCHING: Find matching breathing pattern
  findMatchingPattern(context: ScalingContext): ScalingPattern | null {
    const overall_harmony = this.calculateOverallHarmony(context.harmony_metrics);
    
    for (const pattern of this.breathing_patterns) {
      let matches = 0;
      
      // Check harmony-based conditions
      if (pattern.pattern_name.includes('Deep') && overall_harmony > 0.8) matches++;
      if (pattern.pattern_name.includes('Gentle') && overall_harmony < 0.6) matches++;
      if (pattern.pattern_name.includes('Steady') && overall_harmony >= 0.6 && overall_harmony <= 0.8) matches++;
      if (pattern.pattern_name.includes('Protective') && overall_harmony < 0.4) matches++;
      if (pattern.pattern_name.includes('Sacred') && overall_harmony > 0.9) matches++;
      
      // Check energy conditions
      if (context.halo_energy.trend === 'RISING' && pattern.trigger_conditions.includes('Rising energy')) matches++;
      if (context.halo_energy.trend === 'DECLINING' && pattern.trigger_conditions.includes('Energy decline')) matches++;
      
      // Check momentum conditions
      if (context.harmony_metrics.momentum_consistency > 0.8 && pattern.trigger_conditions.includes('Strong momentum')) matches++;
      if (context.harmony_metrics.momentum_consistency < 0.4 && pattern.trigger_conditions.includes('Momentum weakening')) matches++;
      
      if (matches >= 2) return pattern;
    }
    
    return null;
  }

  // ⚙️ CONFIGURATION: Update scaling thresholds
  updateScalingThresholds(new_thresholds: Partial<typeof this.sacred_scaling_thresholds>): void {
    this.sacred_scaling_thresholds = { ...this.sacred_scaling_thresholds, ...new_thresholds };
    console.log('🌬️ Sacred scaling thresholds updated');
  }
}

export const waidesKIScalingLogic = new WaidesKIScalingLogic();