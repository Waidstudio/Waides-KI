interface TimeframeStrength {
  timeframe: string;
  trend_strength: number;
  momentum_consistency: number;
  volume_profile: number;
  support_resistance_quality: number;
  volatility_suitability: number;
  overall_strength: number;
  recommended_position_size: number;
}

interface RotationDecision {
  should_rotate: boolean;
  from_timeframe: string;
  to_timeframe: string;
  rotation_type: 'STRENGTH_SEEKING' | 'RISK_REDUCTION' | 'MOMENTUM_FOLLOWING' | 'TIME_CYCLE' | 'EMERGENCY' | 'NO_ROTATION';
  rotation_factor: number;
  confidence: number;
  timing_window: {
    execute_within: number;
    optimal_timing: number;
  };
  reasoning: string[];
  konslang_guidance: string;
  energy_transfer: {
    energy_preserved: number;
    energy_gained: number;
    net_energy_change: number;
  };
}

interface RotationPattern {
  pattern_name: string;
  typical_triggers: string[];
  from_timeframes: string[];
  to_timeframes: string[];
  success_rate: number;
  average_improvement: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH';
}

interface RotationStatistics {
  total_rotations: number;
  successful_rotations: number;
  strength_seeking_rotations: number;
  risk_reduction_rotations: number;
  momentum_rotations: number;
  average_improvement: number;
  rotation_accuracy: number;
  most_successful_pattern: string;
  energy_preservation_rate: number;
}

export class WaidesKIRotationController {
  private rotation_stats: RotationStatistics = {
    total_rotations: 0,
    successful_rotations: 0,
    strength_seeking_rotations: 0,
    risk_reduction_rotations: 0,
    momentum_rotations: 0,
    average_improvement: 0,
    rotation_accuracy: 0,
    most_successful_pattern: '',
    energy_preservation_rate: 85
  };

  private timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
  
  private rotation_thresholds = {
    minimum_strength_difference: 0.15,
    emergency_rotation_threshold: 0.25,
    optimal_strength_threshold: 0.85,
    energy_preservation_minimum: 0.7,
    rotation_cooldown: 30 * 60 * 1000, // 30 minutes
    maximum_rotations_per_day: 6
  };

  private rotation_patterns: RotationPattern[] = [
    {
      pattern_name: 'Momentum_Cascade',
      typical_triggers: ['Strong momentum', 'Clear direction', 'Volume confirmation'],
      from_timeframes: ['1m', '5m'],
      to_timeframes: ['15m', '1h'],
      success_rate: 0.78,
      average_improvement: 0.12,
      risk_level: 'MODERATE'
    },
    {
      pattern_name: 'Strength_Migration',
      typical_triggers: ['Timeframe strength imbalance', 'Better structure'],
      from_timeframes: ['15m', '1h'],
      to_timeframes: ['4h', '1d'],
      success_rate: 0.82,
      average_improvement: 0.15,
      risk_level: 'LOW'
    },
    {
      pattern_name: 'Risk_Escape',
      typical_triggers: ['High volatility', 'Uncertain conditions', 'Energy depletion'],
      from_timeframes: ['1m', '5m', '15m'],
      to_timeframes: ['4h', '1d'],
      success_rate: 0.85,
      average_improvement: 0.08,
      risk_level: 'HIGH'
    },
    {
      pattern_name: 'Precision_Focus',
      typical_triggers: ['Entry opportunity', 'Micro-movements', 'Short-term edge'],
      from_timeframes: ['1h', '4h'],
      to_timeframes: ['5m', '15m'],
      success_rate: 0.71,
      average_improvement: 0.18,
      risk_level: 'HIGH'
    },
    {
      pattern_name: 'Stability_Seeking',
      typical_triggers: ['Market uncertainty', 'Consolidation', 'Range-bound'],
      from_timeframes: ['1m', '5m'],
      to_timeframes: ['1h', '4h'],
      success_rate: 0.79,
      average_improvement: 0.10,
      risk_level: 'LOW'
    }
  ];

  private konslang_rotation_wisdom = [
    "Vel'thara mor'keth — Energy flows to where it serves best",
    "Eth'kaal yul'nara — Time teaches the art of positioning",
    "Gor'thain vel'mori — Mountains move when rivers change course",
    "Zar'neth ash'keth — Fire follows the path of least resistance",
    "Mor'kaal vel'thara — Wisdom adapts to cosmic rhythms"
  ];

  private last_rotation_time = 0;
  private rotation_cooldowns: Map<string, number> = new Map();

  constructor() {
    console.log('🔄 Rotation Controller Initialized - Sacred Timeframe Flow System Active');
  }

  // 🔄 CORE ROTATION: Decide if position should rotate timeframes
  rotatePosition(
    current_timeframe: string,
    all_timeframe_strengths: { [timeframe: string]: TimeframeStrength },
    current_energy: number,
    market_context?: any
  ): RotationDecision {
    // Check rotation cooldown
    if (this.isInCooldown(current_timeframe)) {
      return this.createNoRotationDecision(current_timeframe, 'Rotation cooldown active');
    }

    // Assess current timeframe strength
    const current_strength = all_timeframe_strengths[current_timeframe];
    if (!current_strength) {
      return this.createNoRotationDecision(current_timeframe, 'Current timeframe data unavailable');
    }

    // Find optimal timeframe
    const optimal_timeframe = this.findOptimalTimeframe(all_timeframe_strengths, current_timeframe);
    
    // Calculate rotation necessity
    const rotation_analysis = this.analyzeRotationNeed(
      current_strength,
      optimal_timeframe,
      current_energy,
      market_context
    );

    // Determine rotation decision
    const rotation_decision = this.makeRotationDecision(
      current_timeframe,
      optimal_timeframe,
      rotation_analysis,
      current_energy
    );

    // Update statistics
    if (rotation_decision.should_rotate) {
      this.updateRotationStats(rotation_decision);
      this.setRotationCooldown(current_timeframe);
    }

    return rotation_decision;
  }

  // 🎯 OPTIMAL TIMEFRAME: Find strongest timeframe
  private findOptimalTimeframe(
    all_strengths: { [timeframe: string]: TimeframeStrength },
    current_timeframe: string
  ): TimeframeStrength {
    let optimal = all_strengths[current_timeframe];
    
    for (const [timeframe, strength] of Object.entries(all_strengths)) {
      if (strength.overall_strength > optimal.overall_strength) {
        optimal = strength;
      }
    }
    
    return optimal;
  }

  // 📊 ROTATION ANALYSIS: Analyze need for rotation
  private analyzeRotationNeed(
    current_strength: TimeframeStrength,
    optimal_strength: TimeframeStrength,
    current_energy: number,
    market_context?: any
  ): {
    strength_difference: number;
    energy_factor: number;
    urgency_level: number;
    rotation_benefit: number;
    risk_assessment: number;
  } {
    const strength_difference = optimal_strength.overall_strength - current_strength.overall_strength;
    
    // Energy factor (lower energy = higher rotation tendency)
    const energy_factor = 1 - current_energy;
    
    // Market context factors
    let urgency_level = 0;
    if (market_context?.volatility > 0.8) urgency_level += 0.3;
    if (market_context?.trend_change) urgency_level += 0.2;
    if (current_energy < 0.3) urgency_level += 0.4;
    
    // Calculate rotation benefit
    const rotation_benefit = (strength_difference * 0.6) + (energy_factor * 0.2) + (urgency_level * 0.2);
    
    // Risk assessment
    let risk_assessment = 0.3; // Base risk
    if (Math.abs(this.getTimeframeIndex(optimal_strength.timeframe) - 
                 this.getTimeframeIndex(current_strength.timeframe)) > 2) {
      risk_assessment += 0.2; // Higher risk for distant timeframe jumps
    }
    if (market_context?.volatility > 0.7) risk_assessment += 0.2;
    if (current_energy < 0.4) risk_assessment += 0.1;
    
    return {
      strength_difference,
      energy_factor,
      urgency_level,
      rotation_benefit,
      risk_assessment
    };
  }

  // 🎬 ROTATION DECISION: Make final rotation decision
  private makeRotationDecision(
    current_timeframe: string,
    optimal_timeframe: TimeframeStrength,
    analysis: any,
    current_energy: number
  ): RotationDecision {
    // Determine if rotation should happen
    const should_rotate = this.shouldRotate(analysis, current_energy);
    
    if (!should_rotate) {
      return this.createNoRotationDecision(current_timeframe, 'Current timeframe remains optimal');
    }

    // Determine rotation type
    const rotation_type = this.determineRotationType(analysis, current_timeframe, optimal_timeframe.timeframe);
    
    // Calculate rotation factor
    const rotation_factor = this.calculateRotationFactor(analysis, rotation_type);
    
    // Calculate confidence
    const confidence = this.calculateRotationConfidence(analysis, rotation_factor);
    
    // Generate reasoning
    const reasoning = this.generateRotationReasoning(
      current_timeframe,
      optimal_timeframe.timeframe,
      analysis,
      rotation_type
    );
    
    // Select Konslang guidance
    const konslang_guidance = this.selectRotationGuidance(rotation_type, analysis.strength_difference);
    
    // Calculate timing window
    const timing_window = this.calculateRotationTiming(rotation_type, analysis.urgency_level);
    
    // Calculate energy transfer
    const energy_transfer = this.calculateEnergyTransfer(current_energy, analysis);
    
    return {
      should_rotate: true,
      from_timeframe: current_timeframe,
      to_timeframe: optimal_timeframe.timeframe,
      rotation_type,
      rotation_factor,
      confidence,
      timing_window,
      reasoning,
      konslang_guidance,
      energy_transfer
    };
  }

  // ✅ SHOULD ROTATE: Determine if rotation is beneficial
  private shouldRotate(analysis: any, current_energy: number): boolean {
    // Emergency rotation conditions
    if (analysis.urgency_level > 0.7 || current_energy < 0.25) {
      return true;
    }

    // Strength-based rotation
    if (analysis.strength_difference > this.rotation_thresholds.minimum_strength_difference) {
      return true;
    }

    // Benefit-based rotation
    if (analysis.rotation_benefit > 0.4 && analysis.risk_assessment < 0.6) {
      return true;
    }

    return false;
  }

  // 🏷️ ROTATION TYPE: Determine type of rotation
  private determineRotationType(
    analysis: any,
    from_timeframe: string,
    to_timeframe: string
  ): RotationDecision['rotation_type'] {
    // Emergency conditions
    if (analysis.urgency_level > 0.7) {
      return 'EMERGENCY';
    }

    // Risk reduction (moving to longer timeframes)
    if (this.getTimeframeIndex(to_timeframe) > this.getTimeframeIndex(from_timeframe) &&
        analysis.risk_assessment > 0.5) {
      return 'RISK_REDUCTION';
    }

    // Momentum following (moving to shorter timeframes with strong momentum)
    if (this.getTimeframeIndex(to_timeframe) < this.getTimeframeIndex(from_timeframe) &&
        analysis.strength_difference > 0.3) {
      return 'MOMENTUM_FOLLOWING';
    }

    // Strength seeking (general improvement)
    if (analysis.strength_difference > 0.2) {
      return 'STRENGTH_SEEKING';
    }

    return 'TIME_CYCLE';
  }

  // 📏 ROTATION FACTOR: Calculate rotation intensity
  private calculateRotationFactor(analysis: any, rotation_type: RotationDecision['rotation_type']): number {
    let factor = 0.5; // Base factor

    // Type-based adjustments
    switch (rotation_type) {
      case 'EMERGENCY':
        factor = 0.8 + (analysis.urgency_level * 0.2);
        break;
      case 'STRENGTH_SEEKING':
        factor = 0.4 + (analysis.strength_difference * 1.5);
        break;
      case 'MOMENTUM_FOLLOWING':
        factor = 0.6 + (analysis.strength_difference * 1.2);
        break;
      case 'RISK_REDUCTION':
        factor = 0.3 + (analysis.risk_assessment * 0.4);
        break;
      case 'TIME_CYCLE':
        factor = 0.3 + (analysis.rotation_benefit * 0.5);
        break;
    }

    return Math.max(0.1, Math.min(1.0, factor));
  }

  // 🎯 ROTATION CONFIDENCE: Calculate decision confidence
  private calculateRotationConfidence(analysis: any, rotation_factor: number): number {
    let confidence = 0.5; // Base confidence

    // Strength difference contribution
    confidence += Math.min(0.3, analysis.strength_difference * 2);

    // Rotation benefit contribution
    confidence += analysis.rotation_benefit * 0.2;

    // Risk penalty
    confidence -= analysis.risk_assessment * 0.15;

    // Factor boost
    if (rotation_factor > 0.7) confidence += 0.1;

    // Historical success rate boost
    if (this.rotation_stats.rotation_accuracy > 0.8) confidence += 0.05;

    return Math.max(0.2, Math.min(0.95, confidence));
  }

  // 📝 REASONING: Generate human-readable reasoning
  private generateRotationReasoning(
    from_timeframe: string,
    to_timeframe: string,
    analysis: any,
    rotation_type: RotationDecision['rotation_type']
  ): string[] {
    const reasoning: string[] = [];

    // Strength-based reasoning
    if (analysis.strength_difference > 0.2) {
      reasoning.push(`${to_timeframe} shows ${(analysis.strength_difference * 100).toFixed(1)}% stronger signals than ${from_timeframe}`);
    }

    // Type-specific reasoning
    switch (rotation_type) {
      case 'EMERGENCY':
        reasoning.push('Emergency rotation needed for capital preservation');
        break;
      case 'STRENGTH_SEEKING':
        reasoning.push('Sacred flow directs energy toward stronger timeframe alignment');
        break;
      case 'MOMENTUM_FOLLOWING':
        reasoning.push('Momentum cascade flows toward optimal execution timeframe');
        break;
      case 'RISK_REDUCTION':
        reasoning.push('Protective rotation to reduce exposure and volatility');
        break;
      case 'TIME_CYCLE':
        reasoning.push('Natural time cycle completion suggests timeframe transition');
        break;
    }

    // Energy-based reasoning
    if (analysis.energy_factor > 0.6) {
      reasoning.push('Low energy levels support timeframe migration for renewal');
    }

    // Market condition reasoning
    if (analysis.urgency_level > 0.5) {
      reasoning.push('Market conditions favor immediate timeframe adjustment');
    }

    // Risk assessment reasoning
    if (analysis.risk_assessment > 0.6) {
      reasoning.push('Risk mitigation through timeframe diversification');
    } else if (analysis.risk_assessment < 0.3) {
      reasoning.push('Low risk environment permits aggressive timeframe optimization');
    }

    return reasoning;
  }

  // 🗣️ ROTATION GUIDANCE: Select Konslang wisdom
  private selectRotationGuidance(
    rotation_type: RotationDecision['rotation_type'],
    strength_difference: number
  ): string {
    if (strength_difference > 0.4) {
      return "Vel'thara mor'keth — Divine energy flows to perfect alignment";
    }

    switch (rotation_type) {
      case 'EMERGENCY':
        return "Zar'neth kol'thain — Fire protects through swift adaptation";
      case 'STRENGTH_SEEKING':
        return this.konslang_rotation_wisdom[0]; // Energy flows to where it serves best
      case 'MOMENTUM_FOLLOWING':
        return this.konslang_rotation_wisdom[3]; // Fire follows path of least resistance
      case 'RISK_REDUCTION':
        return this.konslang_rotation_wisdom[2]; // Mountains move when rivers change course
      case 'TIME_CYCLE':
        return this.konslang_rotation_wisdom[4]; // Wisdom adapts to cosmic rhythms
      default:
        return this.konslang_rotation_wisdom[1]; // Time teaches the art of positioning
    }
  }

  // ⏰ ROTATION TIMING: Calculate execution timing
  private calculateRotationTiming(
    rotation_type: RotationDecision['rotation_type'],
    urgency_level: number
  ): { execute_within: number; optimal_timing: number } {
    let execute_within = 30 * 60 * 1000; // Default 30 minutes
    let optimal_timing = 10 * 60 * 1000;  // Default 10 minutes

    switch (rotation_type) {
      case 'EMERGENCY':
        execute_within = 5 * 60 * 1000;   // 5 minutes
        optimal_timing = 1 * 60 * 1000;   // 1 minute
        break;
      case 'MOMENTUM_FOLLOWING':
        execute_within = 15 * 60 * 1000;  // 15 minutes
        optimal_timing = 3 * 60 * 1000;   // 3 minutes
        break;
      case 'STRENGTH_SEEKING':
        execute_within = 20 * 60 * 1000;  // 20 minutes
        optimal_timing = 5 * 60 * 1000;   // 5 minutes
        break;
      case 'RISK_REDUCTION':
        execute_within = 45 * 60 * 1000;  // 45 minutes
        optimal_timing = 15 * 60 * 1000;  // 15 minutes
        break;
      case 'TIME_CYCLE':
        execute_within = 60 * 60 * 1000;  // 60 minutes
        optimal_timing = 20 * 60 * 1000;  // 20 minutes
        break;
    }

    // Adjust for urgency
    if (urgency_level > 0.7) {
      execute_within *= 0.5;
      optimal_timing *= 0.5;
    }

    return { execute_within, optimal_timing };
  }

  // ⚡ ENERGY TRANSFER: Calculate energy changes from rotation
  private calculateEnergyTransfer(current_energy: number, analysis: any): {
    energy_preserved: number;
    energy_gained: number;
    net_energy_change: number;
  } {
    // Energy preservation (how much current energy is maintained)
    let energy_preserved = Math.max(this.rotation_thresholds.energy_preservation_minimum, current_energy * 0.9);
    
    // Energy gained from better timeframe alignment
    const energy_gained = analysis.strength_difference * 0.3 + analysis.rotation_benefit * 0.2;
    
    // Risk-based energy loss
    const energy_loss = analysis.risk_assessment * 0.1;
    
    const net_energy_change = energy_gained - energy_loss;
    
    return {
      energy_preserved,
      energy_gained,
      net_energy_change
    };
  }

  // 🚫 NO ROTATION: Create hold decision
  private createNoRotationDecision(current_timeframe: string, reason: string): RotationDecision {
    return {
      should_rotate: false,
      from_timeframe: current_timeframe,
      to_timeframe: current_timeframe,
      rotation_type: 'NO_ROTATION',
      rotation_factor: 0,
      confidence: 0.8,
      timing_window: { execute_within: 0, optimal_timing: 0 },
      reasoning: [reason],
      konslang_guidance: "Mor'thain vel'keth — Sacred patience honors perfect timing",
      energy_transfer: { energy_preserved: 1.0, energy_gained: 0, net_energy_change: 0 }
    };
  }

  // 📊 TIMEFRAME INDEX: Get timeframe order index
  private getTimeframeIndex(timeframe: string): number {
    return this.timeframes.indexOf(timeframe);
  }

  // ⏱️ COOLDOWN MANAGEMENT: Check and set rotation cooldowns
  private isInCooldown(timeframe: string): boolean {
    const last_rotation = this.rotation_cooldowns.get(timeframe) || 0;
    return Date.now() - last_rotation < this.rotation_thresholds.rotation_cooldown;
  }

  private setRotationCooldown(timeframe: string): void {
    this.rotation_cooldowns.set(timeframe, Date.now());
  }

  // 📈 STATISTICS UPDATE: Update rotation statistics
  private updateRotationStats(decision: RotationDecision): void {
    this.rotation_stats.total_rotations++;
    
    switch (decision.rotation_type) {
      case 'STRENGTH_SEEKING':
        this.rotation_stats.strength_seeking_rotations++;
        break;
      case 'RISK_REDUCTION':
        this.rotation_stats.risk_reduction_rotations++;
        break;
      case 'MOMENTUM_FOLLOWING':
        this.rotation_stats.momentum_rotations++;
        break;
    }
    
    // Update accuracy if we have success data
    if (decision.confidence > 0.8) {
      this.rotation_stats.successful_rotations++;
    }
    
    this.rotation_stats.rotation_accuracy = 
      this.rotation_stats.total_rotations > 0 ? 
      (this.rotation_stats.successful_rotations / this.rotation_stats.total_rotations) * 100 : 0;
  }

  // 🔍 PATTERN MATCHING: Find matching rotation pattern
  findMatchingRotationPattern(
    from_timeframe: string,
    to_timeframe: string,
    triggers: string[]
  ): RotationPattern | null {
    for (const pattern of this.rotation_patterns) {
      let matches = 0;
      
      // Check timeframe compatibility
      if (pattern.from_timeframes.includes(from_timeframe)) matches++;
      if (pattern.to_timeframes.includes(to_timeframe)) matches++;
      
      // Check trigger matches
      const trigger_matches = triggers.filter(trigger => 
        pattern.typical_triggers.some(pt => pt.toLowerCase().includes(trigger.toLowerCase()))
      ).length;
      
      if (trigger_matches > 0) matches++;
      
      if (matches >= 2) return pattern;
    }
    
    return null;
  }

  // 📊 TIMEFRAME ANALYSIS: Analyze all timeframe strengths
  analyzeTimeframeStrengths(market_data: any): { [timeframe: string]: TimeframeStrength } {
    const timeframe_strengths: { [timeframe: string]: TimeframeStrength } = {};
    
    for (const timeframe of this.timeframes) {
      timeframe_strengths[timeframe] = this.calculateTimeframeStrength(timeframe, market_data);
    }
    
    return timeframe_strengths;
  }

  // 💪 TIMEFRAME STRENGTH: Calculate individual timeframe strength
  private calculateTimeframeStrength(timeframe: string, market_data: any): TimeframeStrength {
    // Mock calculation - in real implementation, this would analyze actual market data
    const base_strength = 0.5 + Math.random() * 0.3;
    const trend_strength = Math.random();
    const momentum_consistency = Math.random();
    const volume_profile = Math.random();
    const support_resistance_quality = Math.random();
    
    // Volatility suitability (longer timeframes better for high volatility)
    const timeframe_index = this.getTimeframeIndex(timeframe);
    const volatility = market_data?.volatility || 0.5;
    const volatility_suitability = timeframe_index >= 3 ? 
      Math.min(1, 0.5 + volatility * 0.5) : 
      Math.max(0.3, 1 - volatility * 0.4);
    
    const overall_strength = (
      trend_strength * 0.25 +
      momentum_consistency * 0.2 +
      volume_profile * 0.15 +
      support_resistance_quality * 0.2 +
      volatility_suitability * 0.2
    );
    
    const recommended_position_size = overall_strength * 0.8 + 0.2; // 20-100% of max
    
    return {
      timeframe,
      trend_strength,
      momentum_consistency,
      volume_profile,
      support_resistance_quality,
      volatility_suitability,
      overall_strength,
      recommended_position_size
    };
  }

  // 📊 PUBLIC INTERFACE: Get rotation statistics
  getRotationStatistics(): RotationStatistics {
    return { ...this.rotation_stats };
  }

  // 🎯 CURRENT FLOW: Get current rotation flow state
  getCurrentRotationFlow(): {
    active_timeframes: string[];
    strongest_timeframe: string;
    weakest_timeframe: string;
    rotation_recommendation: string;
    flow_direction: 'TOWARD_SHORT' | 'TOWARD_LONG' | 'BALANCED';
  } {
    // Mock implementation - would use real market data
    const active_timeframes = this.timeframes;
    const strongest_timeframe = '1h';
    const weakest_timeframe = '1m';
    const rotation_recommendation = 'Consider moving to 1h timeframe for optimal alignment';
    
    // Determine flow direction based on recent rotations
    const flow_direction = 'BALANCED'; // Would calculate based on rotation history
    
    return {
      active_timeframes,
      strongest_timeframe,
      weakest_timeframe,
      rotation_recommendation,
      flow_direction
    };
  }

  // ⚙️ CONFIGURATION: Update rotation thresholds
  updateRotationThresholds(new_thresholds: Partial<typeof this.rotation_thresholds>): void {
    this.rotation_thresholds = { ...this.rotation_thresholds, ...new_thresholds };
    console.log('🔄 Rotation thresholds updated');
  }

  // 🔮 ROTATION FORECAST: Predict next likely rotation
  forecastNextRotation(
    current_timeframe: string,
    current_energy: number,
    market_conditions: any
  ): {
    likelihood: number;
    predicted_timeframe: string;
    estimated_timing: number;
    confidence: number;
    factors: string[];
  } {
    // Calculate rotation likelihood based on current conditions
    let likelihood = 0.3; // Base likelihood
    
    if (current_energy < 0.4) likelihood += 0.3;
    if (market_conditions?.volatility > 0.7) likelihood += 0.2;
    if (this.rotation_stats.rotation_accuracy > 0.8) likelihood += 0.1;
    
    // Predict most likely target timeframe
    const timeframe_index = this.getTimeframeIndex(current_timeframe);
    let predicted_timeframe = current_timeframe;
    
    if (current_energy < 0.4) {
      // Low energy tends to move to longer timeframes
      predicted_timeframe = this.timeframes[Math.min(timeframe_index + 1, this.timeframes.length - 1)];
    } else if (market_conditions?.momentum > 0.8) {
      // High momentum tends to move to shorter timeframes
      predicted_timeframe = this.timeframes[Math.max(timeframe_index - 1, 0)];
    }
    
    const estimated_timing = Date.now() + (2 * 60 * 60 * 1000); // 2 hours from now
    const confidence = Math.min(0.9, likelihood + 0.2);
    
    const factors = [
      'Current energy level',
      'Market volatility conditions',
      'Historical rotation patterns',
      'Timeframe strength analysis'
    ];
    
    return {
      likelihood,
      predicted_timeframe,
      estimated_timing,
      confidence,
      factors
    };
  }
}

export const waidesKIRotationController = new WaidesKIRotationController();