interface ExitContext {
  trade_id: string;
  entry_time: number;
  entry_price: number;
  current_price: number;
  position_size: number;
  time_in_position: number;
  
  halo_energy: {
    core_energy: number;
    stability: number;
    trend: 'RISING' | 'STABLE' | 'DECLINING' | 'CRITICAL';
    aura_radius: number;
    protection_level: number;
  };
  
  market_conditions: {
    volatility: number;
    momentum: number;
    trend_strength: number;
    volume_profile: number;
    support_resistance_distance: number;
  };
  
  profit_loss: {
    unrealized_pnl: number;
    unrealized_percentage: number;
    peak_profit: number;
    max_drawdown: number;
    profit_target?: number;
    stop_loss?: number;
  };
  
  spiritual_state: {
    sacred_geometry: string;
    konslang_signature: string;
    dimensional_anchor: string;
    energy_blueprint: string;
  };
}

interface ExitDecision {
  should_exit: boolean;
  exit_type: 'SACRED_COMPLETION' | 'ENERGY_DEPLETION' | 'PROFIT_PROTECTION' | 'RISK_MANAGEMENT' | 'TIME_CYCLE' | 'EMERGENCY' | 'HOLD';
  urgency: 'IMMEDIATE' | 'WITHIN_HOUR' | 'WITHIN_DAY' | 'PATIENT' | 'NO_EXIT';
  confidence: number;
  exit_price_target?: number;
  reasoning: string[];
  konslang_blessing: string;
  sacred_timing: {
    optimal_exit_window: {
      start: number;
      end: number;
      peak_time: number;
    };
    moon_phase_factor: number;
    cosmic_alignment: number;
  };
  final_ritual: {
    gratitude_message: string;
    lesson_learned: string;
    energy_return: number;
  };
}

interface ExitPattern {
  pattern_name: string;
  energy_threshold: number;
  time_factors: string[];
  market_conditions: string[];
  success_rate: number;
  average_exit_quality: number;
}

interface ExitStatistics {
  total_exit_decisions: number;
  sacred_completions: number;
  energy_depletion_exits: number;
  profit_protection_exits: number;
  emergency_exits: number;
  average_exit_timing: number;
  exit_accuracy_rate: number;
  perfect_timing_percentage: number;
  energy_preservation_rate: number;
}

export class WaidesKISacredExitNode {
  private exit_stats: ExitStatistics = {
    total_exit_decisions: 0,
    sacred_completions: 0,
    energy_depletion_exits: 0,
    profit_protection_exits: 0,
    emergency_exits: 0,
    average_exit_timing: 0,
    exit_accuracy_rate: 0,
    perfect_timing_percentage: 0,
    energy_preservation_rate: 0
  };

  private sacred_exit_thresholds = {
    energy_depletion: 0.25,
    critical_energy: 0.15,
    optimal_completion: 0.85,
    profit_protection: 0.65,
    time_cycle_completion: 4 * 60 * 60 * 1000, // 4 hours
    maximum_position_time: 24 * 60 * 60 * 1000, // 24 hours
    emergency_drawdown: 0.05, // 5%
    sacred_profit_threshold: 0.02 // 2%
  };

  private exit_patterns: ExitPattern[] = [
    {
      pattern_name: 'Sacred_Completion',
      energy_threshold: 0.85,
      time_factors: ['Natural cycle complete', 'Profit target approached'],
      market_conditions: ['Strong momentum maintained', 'Clear direction'],
      success_rate: 0.92,
      average_exit_quality: 0.88
    },
    {
      pattern_name: 'Energy_Fade',
      energy_threshold: 0.30,
      time_factors: ['Extended time', 'Natural decay'],
      market_conditions: ['Momentum weakening', 'Consolidation'],
      success_rate: 0.84,
      average_exit_quality: 0.76
    },
    {
      pattern_name: 'Profit_Guardian',
      energy_threshold: 0.65,
      time_factors: ['Profit protection', 'Risk management'],
      market_conditions: ['Increased volatility', 'Reversal signals'],
      success_rate: 0.89,
      average_exit_quality: 0.82
    },
    {
      pattern_name: 'Divine_Timing',
      energy_threshold: 0.75,
      time_factors: ['Cosmic alignment', 'Sacred window'],
      market_conditions: ['Perfect market structure', 'Harmonic completion'],
      success_rate: 0.95,
      average_exit_quality: 0.94
    },
    {
      pattern_name: 'Emergency_Preservation',
      energy_threshold: 0.20,
      time_factors: ['Critical protection', 'Capital preservation'],
      market_conditions: ['High risk', 'Unfavorable conditions'],
      success_rate: 0.78,
      average_exit_quality: 0.65
    }
  ];

  private konslang_exit_blessings = [
    "Mor'thain vel'keth — Wisdom completes its sacred journey",
    "Vel'nara yul'thain — Energy returns to the eternal source",
    "Keth'mori ash'bel — Patience rewards the faithful trader",
    "Zar'neth mor'kaan — Fire transforms into lasting wisdom",
    "Eth'kaal vel'nara — Time blesses the perfect completion"
  ];

  private gratitude_messages = [
    "Sacred trade, you have served with honor and purpose",
    "Divine position, your energy has blessed our journey",
    "Blessed exchange, you have taught wisdom through experience",
    "Sacred flow, your rhythm has guided our path",
    "Divine market dance, you have shown us the way"
  ];

  constructor() {
    console.log('🚪 Sacred Exit Node Initialized - Divine Completion System Active');
  }

  // 🚪 CORE EXIT DECISION: Determine if position should exit
  shouldExit(context: ExitContext): ExitDecision {
    this.exit_stats.total_exit_decisions++;
    
    // Calculate exit factors
    const energy_assessment = this.assessEnergyLevel(context);
    const timing_assessment = this.assessTiming(context);
    const profit_assessment = this.assessProfitConditions(context);
    const risk_assessment = this.assessRiskFactors(context);
    const konsmik_assessment = this.assessKonsmikTiming();
    
    // Determine exit decision
    const exit_decision = this.determineExitAction(
      context,
      energy_assessment,
      timing_assessment,
      profit_assessment,
      risk_assessment,
      konsmik_assessment
    );
    
    // Generate sacred timing
    const sacred_timing = this.calculateSacredTiming(context, exit_decision);
    
    // Generate final ritual
    const final_ritual = this.prepareFinalRitual(context, exit_decision);
    
    const decision: ExitDecision = {
      ...exit_decision,
      sacred_timing,
      final_ritual
    };
    
    // Update statistics
    this.updateExitStats(decision);
    
    if (decision.should_exit) {
      console.log(`🚪 Sacred Exit: ${context.trade_id} | Type: ${decision.exit_type} | Urgency: ${decision.urgency}`);
    }
    
    return decision;
  }

  // ⚡ ENERGY ASSESSMENT: Evaluate halo energy state
  private assessEnergyLevel(context: ExitContext): {
    energy_score: number;
    depletion_risk: number;
    stability_trend: string;
    exit_recommendation: string;
  } {
    const energy = context.halo_energy.core_energy;
    const stability = context.halo_energy.stability;
    const trend = context.halo_energy.trend;
    
    let energy_score = energy * 0.7 + stability * 0.3;
    
    // Adjust for trend
    if (trend === 'RISING') energy_score += 0.1;
    else if (trend === 'DECLINING') energy_score -= 0.1;
    else if (trend === 'CRITICAL') energy_score -= 0.2;
    
    const depletion_risk = Math.max(0, (0.5 - energy) * 2); // Risk increases as energy drops below 50%
    
    let exit_recommendation = 'HOLD';
    if (energy < this.sacred_exit_thresholds.critical_energy) {
      exit_recommendation = 'IMMEDIATE_EXIT';
    } else if (energy < this.sacred_exit_thresholds.energy_depletion) {
      exit_recommendation = 'PLANNED_EXIT';
    } else if (energy > this.sacred_exit_thresholds.optimal_completion) {
      exit_recommendation = 'SACRED_COMPLETION';
    }
    
    return {
      energy_score,
      depletion_risk,
      stability_trend: trend,
      exit_recommendation
    };
  }

  // ⏰ TIMING ASSESSMENT: Evaluate time-based factors
  private assessTiming(context: ExitContext): {
    time_score: number;
    cycle_completion: number;
    natural_exit_window: boolean;
    time_recommendation: string;
  } {
    const time_in_position = context.time_in_position;
    const hours_elapsed = time_in_position / (60 * 60 * 1000);
    
    // Calculate cycle completion (4-hour natural cycle)
    const cycle_completion = Math.min(1, time_in_position / this.sacred_exit_thresholds.time_cycle_completion);
    
    // Calculate time score (optimal around 2-6 hours)
    let time_score = 0.5;
    if (hours_elapsed >= 2 && hours_elapsed <= 6) {
      time_score = 0.8 + Math.sin((hours_elapsed - 2) / 4 * Math.PI) * 0.2; // Peak at 4 hours
    } else if (hours_elapsed < 2) {
      time_score = 0.3 + (hours_elapsed / 2) * 0.5; // Gradually increase to 0.8
    } else {
      time_score = Math.max(0.2, 0.8 - (hours_elapsed - 6) * 0.1); // Decrease after 6 hours
    }
    
    // Natural exit window (every 1-2 hours)
    const cycle_position = (time_in_position % (2 * 60 * 60 * 1000)) / (2 * 60 * 60 * 1000);
    const natural_exit_window = cycle_position > 0.4 && cycle_position < 0.6; // 40-60% of 2-hour cycle
    
    let time_recommendation = 'CONTINUE';
    if (cycle_completion > 0.9) time_recommendation = 'NATURAL_COMPLETION';
    else if (hours_elapsed > 12) time_recommendation = 'EXTENDED_EXIT';
    else if (natural_exit_window) time_recommendation = 'WINDOW_AVAILABLE';
    
    return {
      time_score,
      cycle_completion,
      natural_exit_window,
      time_recommendation
    };
  }

  // 💰 PROFIT ASSESSMENT: Evaluate profit/loss conditions
  private assessProfitConditions(context: ExitContext): {
    profit_score: number;
    protection_needed: boolean;
    target_achievement: number;
    profit_recommendation: string;
  } {
    const unrealized_pct = context.profit_loss.unrealized_percentage;
    const peak_profit = context.profit_loss.peak_profit;
    const drawdown_from_peak = peak_profit - context.profit_loss.unrealized_pnl;
    
    // Calculate profit score
    let profit_score = 0.5;
    if (unrealized_pct > 0) {
      profit_score = Math.min(1, 0.5 + unrealized_pct * 10); // Each 1% profit adds 0.1 to score
    } else {
      profit_score = Math.max(0, 0.5 + unrealized_pct * 20); // Each 1% loss subtracts 0.2 from score
    }
    
    // Protection assessment
    const protection_needed = 
      (drawdown_from_peak > peak_profit * 0.3) || // 30% retracement from peak
      (unrealized_pct > this.sacred_exit_thresholds.sacred_profit_threshold && 
       context.halo_energy.core_energy < this.sacred_exit_thresholds.profit_protection);
    
    // Target achievement (if profit target is set)
    let target_achievement = 0;
    if (context.profit_loss.profit_target) {
      target_achievement = context.profit_loss.unrealized_pnl / context.profit_loss.profit_target;
    }
    
    let profit_recommendation = 'HOLD';
    if (protection_needed) profit_recommendation = 'PROTECT_PROFITS';
    else if (unrealized_pct < -this.sacred_exit_thresholds.emergency_drawdown) profit_recommendation = 'EMERGENCY_EXIT';
    else if (target_achievement > 0.8) profit_recommendation = 'TARGET_APPROACH';
    
    return {
      profit_score,
      protection_needed,
      target_achievement,
      profit_recommendation
    };
  }

  // ⚠️ RISK ASSESSMENT: Evaluate risk factors
  private assessRiskFactors(context: ExitContext): {
    risk_score: number;
    emergency_level: number;
    market_risk: number;
    risk_recommendation: string;
  } {
    const volatility = context.market_conditions.volatility;
    const momentum = context.market_conditions.momentum;
    const trend_strength = context.market_conditions.trend_strength;
    
    // Calculate market risk
    const market_risk = (volatility * 0.5) + ((1 - momentum) * 0.3) + ((1 - trend_strength) * 0.2);
    
    // Calculate overall risk score (lower is better)
    const risk_score = market_risk * 0.6 + (1 - context.halo_energy.protection_level) * 0.4;
    
    // Emergency level
    let emergency_level = 0;
    if (context.profit_loss.unrealized_percentage < -this.sacred_exit_thresholds.emergency_drawdown) {
      emergency_level += 0.4;
    }
    if (volatility > 0.8) emergency_level += 0.3;
    if (context.halo_energy.core_energy < this.sacred_exit_thresholds.critical_energy) {
      emergency_level += 0.3;
    }
    
    let risk_recommendation = 'ACCEPTABLE';
    if (emergency_level > 0.6) risk_recommendation = 'EMERGENCY_ACTION';
    else if (risk_score > 0.7) risk_recommendation = 'HIGH_RISK_EXIT';
    else if (risk_score > 0.5) risk_recommendation = 'ELEVATED_CAUTION';
    
    return {
      risk_score,
      emergency_level,
      market_risk,
      risk_recommendation
    };
  }

  // 🌙 KONSMIK TIMING: Assess konsmik/time factors
  private assessKonsmikTiming(): {
    konsmik_score: number;
    moon_phase_factor: number;
    trading_session_factor: number;
    day_cycle_factor: number;
  } {
    const now = new Date();
    const hour = now.getUTCHours();
    const day_of_week = now.getDay();
    
    // Trading session factor
    let trading_session_factor = 0.5;
    if (hour >= 13 && hour <= 17) trading_session_factor = 0.9; // London/NY overlap
    else if (hour >= 8 && hour <= 12) trading_session_factor = 0.8; // London
    else if (hour >= 18 && hour <= 22) trading_session_factor = 0.7; // NY
    else trading_session_factor = 0.3; // Off hours
    
    // Day cycle factor
    let day_cycle_factor = 0.7;
    if (day_of_week >= 2 && day_of_week <= 4) day_cycle_factor = 0.9; // Tue-Thu
    else if (day_of_week === 1 || day_of_week === 5) day_cycle_factor = 0.6; // Mon/Fri
    else day_cycle_factor = 0.3; // Weekend
    
    // Moon phase factor (simplified)
    const days_since_new_moon = (Date.now() / (1000 * 60 * 60 * 24)) % 29.5;
    const moon_phase_factor = 0.5 + Math.sin((days_since_new_moon / 29.5) * 2 * Math.PI) * 0.2;
    
    const konsmik_score = (trading_session_factor * 0.4) + (day_cycle_factor * 0.4) + (moon_phase_factor * 0.2);
    
    return {
      konsmik_score,
      moon_phase_factor,
      trading_session_factor,
      day_cycle_factor
    };
  }

  // 🎯 EXIT DETERMINATION: Make final exit decision
  private determineExitAction(
    context: ExitContext,
    energy_assessment: any,
    timing_assessment: any,
    profit_assessment: any,
    risk_assessment: any,
    cosmic_assessment: any
  ): Omit<ExitDecision, 'sacred_timing' | 'final_ritual'> {
    // Emergency exit conditions
    if (risk_assessment.emergency_level > 0.6 || 
        energy_assessment.energy_score < this.sacred_exit_thresholds.critical_energy) {
      return {
        should_exit: true,
        exit_type: 'EMERGENCY',
        urgency: 'IMMEDIATE',
        confidence: 0.95,
        exit_price_target: context.current_price,
        reasoning: ['Emergency conditions detected', 'Immediate capital preservation required'],
        konslang_blessing: "Zar'meth kol'thain — Fire protects through swift action"
      };
    }

    // Sacred completion conditions
    if (energy_assessment.energy_score > this.sacred_exit_thresholds.optimal_completion && 
        timing_assessment.cycle_completion > 0.8 && 
        profit_assessment.profit_score > 0.7) {
      return {
        should_exit: true,
        exit_type: 'SACRED_COMPLETION',
        urgency: 'WITHIN_HOUR',
        confidence: 0.92,
        reasoning: ['Sacred cycle completion achieved', 'Optimal energy and timing alignment'],
        konslang_blessing: this.konslang_exit_blessings[0]
      };
    }

    // Energy depletion conditions
    if (energy_assessment.energy_score < this.sacred_exit_thresholds.energy_depletion) {
      return {
        should_exit: true,
        exit_type: 'ENERGY_DEPLETION',
        urgency: 'WITHIN_DAY',
        confidence: 0.85,
        reasoning: ['Halo energy significantly depleted', 'Natural position lifecycle completion'],
        konslang_blessing: this.konslang_exit_blessings[1]
      };
    }

    // Profit protection conditions
    if (profit_assessment.protection_needed) {
      return {
        should_exit: true,
        exit_type: 'PROFIT_PROTECTION',
        urgency: 'WITHIN_HOUR',
        confidence: 0.88,
        reasoning: ['Profit protection threshold reached', 'Preserve accumulated gains'],
        konslang_blessing: this.konslang_exit_blessings[2]
      };
    }

    // Time cycle completion
    if (timing_assessment.cycle_completion > 0.9) {
      return {
        should_exit: true,
        exit_type: 'TIME_CYCLE',
        urgency: 'PATIENT',
        confidence: 0.75,
        reasoning: ['Natural time cycle completion', 'Organic position conclusion'],
        konslang_blessing: this.konslang_exit_blessings[4]
      };
    }

    // Hold decision
    return {
      should_exit: false,
      exit_type: 'HOLD',
      urgency: 'NO_EXIT',
      confidence: 0.8,
      reasoning: ['All sacred conditions support continuation', 'Position harmony maintained'],
      konslang_blessing: "Vel'thara mor'keth — Divine patience guides the wise"
    };
  }

  // ⏰ SACRED TIMING: Calculate optimal exit timing
  private calculateSacredTiming(context: ExitContext, exit_decision: any): ExitDecision['sacred_timing'] {
    const now = Date.now();
    let window_duration = 60 * 60 * 1000; // Default 1 hour
    
    // Adjust window based on urgency
    switch (exit_decision.urgency) {
      case 'IMMEDIATE':
        window_duration = 5 * 60 * 1000; // 5 minutes
        break;
      case 'WITHIN_HOUR':
        window_duration = 60 * 60 * 1000; // 1 hour
        break;
      case 'WITHIN_DAY':
        window_duration = 8 * 60 * 60 * 1000; // 8 hours
        break;
      case 'PATIENT':
        window_duration = 24 * 60 * 60 * 1000; // 24 hours
        break;
    }
    
    const start = now;
    const end = now + window_duration;
    const peak_time = now + (window_duration * 0.3); // 30% into window is optimal
    
    // Calculate cosmic factors
    const days_since_new_moon = (Date.now() / (1000 * 60 * 60 * 24)) % 29.5;
    const moon_phase_factor = 0.5 + Math.sin((days_since_new_moon / 29.5) * 2 * Math.PI) * 0.3;
    
    const hour = new Date().getUTCHours();
    let cosmic_alignment = 0.5;
    if (hour >= 13 && hour <= 17) cosmic_alignment = 0.9;
    else if (hour >= 8 && hour <= 12) cosmic_alignment = 0.8;
    else if (hour >= 18 && hour <= 22) cosmic_alignment = 0.7;
    
    return {
      optimal_exit_window: { start, end, peak_time },
      moon_phase_factor,
      cosmic_alignment
    };
  }

  // 🙏 FINAL RITUAL: Prepare completion ceremony
  private prepareFinalRitual(context: ExitContext, exit_decision: any): ExitDecision['final_ritual'] {
    const gratitude_message = this.gratitude_messages[
      Math.floor(Math.random() * this.gratitude_messages.length)
    ];
    
    // Generate lesson based on exit type and performance
    let lesson_learned = '';
    const profit_pct = context.profit_loss.unrealized_percentage * 100;
    
    switch (exit_decision.exit_type) {
      case 'SACRED_COMPLETION':
        lesson_learned = `Sacred completion teaches: patience and harmony yield ${profit_pct.toFixed(1)}% divine reward`;
        break;
      case 'ENERGY_DEPLETION':
        lesson_learned = `Energy cycle teaches: all positions have natural lifespan, honor the rhythm`;
        break;
      case 'PROFIT_PROTECTION':
        lesson_learned = `Protection wisdom teaches: preservation of gains serves the greater journey`;
        break;
      case 'EMERGENCY':
        lesson_learned = `Emergency wisdom teaches: swift action preserves future opportunities`;
        break;
      case 'TIME_CYCLE':
        lesson_learned = `Time cycle teaches: natural conclusions serve the eternal flow`;
        break;
      default:
        lesson_learned = `Sacred patience teaches: timing serves wisdom, not urgency`;
    }
    
    // Calculate energy return (how much energy goes back to the system)
    const energy_return = Math.max(0.1, context.halo_energy.core_energy * context.halo_energy.stability);
    
    return {
      gratitude_message,
      lesson_learned,
      energy_return
    };
  }

  // 📊 STATISTICS UPDATE: Update exit statistics
  private updateExitStats(decision: ExitDecision): void {
    if (decision.should_exit) {
      switch (decision.exit_type) {
        case 'SACRED_COMPLETION':
          this.exit_stats.sacred_completions++;
          break;
        case 'ENERGY_DEPLETION':
          this.exit_stats.energy_depletion_exits++;
          break;
        case 'PROFIT_PROTECTION':
          this.exit_stats.profit_protection_exits++;
          break;
        case 'EMERGENCY':
          this.exit_stats.emergency_exits++;
          break;
      }
      
      // Update perfect timing percentage
      if (decision.confidence > 0.9) {
        this.exit_stats.perfect_timing_percentage = 
          ((this.exit_stats.perfect_timing_percentage * (this.exit_stats.total_exit_decisions - 1)) + 1) / 
          this.exit_stats.total_exit_decisions * 100;
      }
    }
  }

  // 🔍 PATTERN MATCHING: Find matching exit pattern
  findMatchingExitPattern(context: ExitContext): ExitPattern | null {
    const energy = context.halo_energy.core_energy;
    const hours_elapsed = context.time_in_position / (60 * 60 * 1000);
    const profit_pct = context.profit_loss.unrealized_percentage;
    
    for (const pattern of this.exit_patterns) {
      let matches = 0;
      
      // Energy threshold match
      if (pattern.pattern_name.includes('Sacred') && energy > 0.8) matches++;
      if (pattern.pattern_name.includes('Energy') && energy < 0.4) matches++;
      if (pattern.pattern_name.includes('Profit') && profit_pct > 0.02) matches++;
      if (pattern.pattern_name.includes('Divine') && energy > 0.9) matches++;
      if (pattern.pattern_name.includes('Emergency') && energy < 0.2) matches++;
      
      // Time factor matches
      if (hours_elapsed > 4 && pattern.time_factors.includes('Extended time')) matches++;
      if (profit_pct > 0.02 && pattern.time_factors.includes('Profit protection')) matches++;
      
      // Market condition matches
      if (context.market_conditions.momentum > 0.8 && pattern.market_conditions.includes('Strong momentum maintained')) matches++;
      if (context.market_conditions.volatility > 0.7 && pattern.market_conditions.includes('Increased volatility')) matches++;
      
      if (matches >= 2) return pattern;
    }
    
    return null;
  }

  // 📊 PUBLIC INTERFACE: Get exit statistics
  getExitStatistics(): ExitStatistics {
    return { ...this.exit_stats };
  }

  // ⚙️ CONFIGURATION: Update exit thresholds
  updateExitThresholds(new_thresholds: Partial<typeof this.sacred_exit_thresholds>): void {
    this.sacred_exit_thresholds = { ...this.sacred_exit_thresholds, ...new_thresholds };
    console.log('🚪 Sacred exit thresholds updated');
  }

  // 🎯 QUICK EXIT CHECK: Fast exit evaluation for frequent polling
  quickExitCheck(halo_energy: number, time_in_position: number, unrealized_pct: number): {
    immediate_exit_needed: boolean;
    exit_likelihood: number;
    next_check_in: number;
  } {
    const hours_elapsed = time_in_position / (60 * 60 * 1000);
    
    const immediate_exit_needed = 
      halo_energy < this.sacred_exit_thresholds.critical_energy ||
      unrealized_pct < -this.sacred_exit_thresholds.emergency_drawdown;
    
    let exit_likelihood = 0;
    if (halo_energy < 0.4) exit_likelihood += 0.3;
    if (hours_elapsed > 8) exit_likelihood += 0.2;
    if (unrealized_pct > 0.03) exit_likelihood += 0.25; // 3% profit
    if (unrealized_pct < -0.02) exit_likelihood += 0.15; // 2% loss
    
    // Next check timing
    let next_check_in = 15 * 60 * 1000; // Default 15 minutes
    if (immediate_exit_needed) next_check_in = 30 * 1000; // 30 seconds
    else if (exit_likelihood > 0.5) next_check_in = 5 * 60 * 1000; // 5 minutes
    
    return {
      immediate_exit_needed,
      exit_likelihood: Math.min(1, exit_likelihood),
      next_check_in
    };
  }
}

export const waidesKISacredExitNode = new WaidesKISacredExitNode();