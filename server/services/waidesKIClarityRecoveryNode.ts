import { waidesKIInstinctSwitch } from './waidesKIInstinctSwitch';
import { waidesKIOverrideLockdown } from './waidesKIOverrideLockdown';

interface RecoverySignal {
  signal_type: 'VOLUME_STABILIZATION' | 'VOLATILITY_NORMALIZATION' | 'MANIPULATION_CLEARED' | 'TIME_HEALING' | 'SPIRITUAL_REALIGNMENT' | 'MARKET_STRUCTURE_RESTORED';
  strength: number;
  confidence: number;
  detected_at: number;
  contributing_factors: string[];
  konslang_blessing: string;
}

interface ClarityAssessment {
  overall_clarity: number;
  market_stability: number;
  spiritual_alignment: number;
  temporal_harmony: number;
  recovery_signals: RecoverySignal[];
  is_safe_to_exit_shadow: boolean;
  estimated_full_recovery: number;
  konslang_guidance: string;
}

interface RecoveryPattern {
  pattern_name: string;
  typical_indicators: string[];
  recovery_timeframe: number;
  success_rate: number;
  post_recovery_safety_period: number;
}

interface RecoveryStatistics {
  total_recovery_scans: number;
  successful_recoveries: number;
  false_recovery_signals: number;
  average_recovery_time: number;
  recovery_accuracy: number;
  fastest_recovery: number;
  longest_recovery: number;
  most_successful_pattern: string;
}

export class WaidesKIClarityRecoveryNode {
  private recovery_stats: RecoveryStatistics = {
    total_recovery_scans: 0,
    successful_recoveries: 0,
    false_recovery_signals: 0,
    average_recovery_time: 0,
    recovery_accuracy: 0,
    fastest_recovery: Number.MAX_SAFE_INTEGER,
    longest_recovery: 0,
    most_successful_pattern: ''
  };

  private recovery_thresholds = {
    minimum_clarity: 0.7,
    minimum_stability: 0.65,
    minimum_spiritual_alignment: 0.6,
    minimum_temporal_harmony: 0.65,
    required_signal_count: 2,
    required_signal_strength: 0.7
  };

  private recovery_patterns: RecoveryPattern[] = [
    {
      pattern_name: 'Volatility_Calm',
      typical_indicators: ['volatility_normalization', 'volume_stabilization'],
      recovery_timeframe: 15 * 60 * 1000, // 15 minutes
      success_rate: 0.82,
      post_recovery_safety_period: 10 * 60 * 1000 // 10 minutes
    },
    {
      pattern_name: 'Market_Structure_Healing',
      typical_indicators: ['liquidity_restoration', 'spread_normalization', 'order_book_balance'],
      recovery_timeframe: 30 * 60 * 1000, // 30 minutes
      success_rate: 0.89,
      post_recovery_safety_period: 15 * 60 * 1000 // 15 minutes
    },
    {
      pattern_name: 'Manipulation_Clearing',
      typical_indicators: ['price_action_normalization', 'volume_pattern_restoration'],
      recovery_timeframe: 45 * 60 * 1000, // 45 minutes
      success_rate: 0.76,
      post_recovery_safety_period: 20 * 60 * 1000 // 20 minutes
    },
    {
      pattern_name: 'Spiritual_Realignment',
      typical_indicators: ['fibonacci_restoration', 'sacred_timing_alignment'],
      recovery_timeframe: 60 * 60 * 1000, // 1 hour
      success_rate: 0.91,
      post_recovery_safety_period: 30 * 60 * 1000 // 30 minutes
    },
    {
      pattern_name: 'Time_Based_Healing',
      typical_indicators: ['market_session_transition', 'natural_time_progression'],
      recovery_timeframe: 2 * 60 * 60 * 1000, // 2 hours
      success_rate: 0.94,
      post_recovery_safety_period: 15 * 60 * 1000 // 15 minutes
    }
  ];

  private konslang_recovery_blessings = [
    "Mor'thain vel'clarity — Sacred wisdom returns as darkness fades",
    "Vel'nara ash'healing — Divine waters wash away the chaos",
    "Keth'mori yul'restoration — Patience brings the light of understanding",
    "Zar'neth bel'renewal — Sacred fire burns away the confusion",
    "Eth'kaal vel'harmony — Time restores the cosmic balance"
  ];

  private konslang_guidance_messages = [
    "Vel'thara mor'patience — Let healing complete its sacred work",
    "Gor'thain ash'wisdom — Mountain strength supports gradual awakening",
    "Mor'keth yul'gentle — Wise steps return to the blessed path",
    "Kol'nara vel'trust — Shadow lifts to reveal the eternal light",
    "Eth'thara mor'sacred — Time serves the restoration of harmony"
  ];

  constructor() {
    console.log('🌅 Clarity Recovery Node Initialized - Sacred Healing System Active');
  }

  // 🌅 CORE RECOVERY SCAN: Check for market clarity restoration
  scanForRecovery(market_data: any, shadow_duration: number = 0): ClarityAssessment {
    this.recovery_stats.total_recovery_scans++;

    // Detect individual recovery signals
    const recovery_signals = this.detectRecoverySignals(market_data, shadow_duration);

    // Calculate overall clarity metrics
    const market_stability = this.calculateMarketStability(market_data);
    const spiritual_alignment = this.calculateSpiritualAlignment(market_data);
    const temporal_harmony = this.calculateTemporalHarmony();
    
    // Calculate overall clarity score
    const overall_clarity = this.calculateOverallClarity(
      market_stability,
      spiritual_alignment,
      temporal_harmony,
      recovery_signals
    );

    // Determine if safe to exit shadow mode
    const is_safe_to_exit_shadow = this.assessSafetyForShadowExit(
      overall_clarity,
      market_stability,
      spiritual_alignment,
      temporal_harmony,
      recovery_signals
    );

    // Estimate full recovery time
    const estimated_full_recovery = this.estimateFullRecoveryTime(recovery_signals, market_data);

    // Select Konslang guidance
    const konslang_guidance = this.selectKonslangGuidance(overall_clarity, is_safe_to_exit_shadow);

    const assessment: ClarityAssessment = {
      overall_clarity,
      market_stability,
      spiritual_alignment,
      temporal_harmony,
      recovery_signals,
      is_safe_to_exit_shadow,
      estimated_full_recovery,
      konslang_guidance
    };

    // Log significant recovery milestones
    if (is_safe_to_exit_shadow && waidesKIInstinctSwitch.isActive()) {
      console.log(`🌅 Recovery Detected: Clarity ${(overall_clarity * 100).toFixed(1)}% | Stability ${(market_stability * 100).toFixed(1)}%`);
      console.log(`✨ Recovery Signals: ${recovery_signals.length} | Safe to exit shadow mode`);
    }

    return assessment;
  }

  // 🔍 RECOVERY SIGNALS: Detect individual recovery indicators
  private detectRecoverySignals(market_data: any, shadow_duration: number): RecoverySignal[] {
    const signals: RecoverySignal[] = [];
    const now = Date.now();

    // Volume Stabilization Signal
    const volume_signal = this.detectVolumeStabilization(market_data);
    if (volume_signal) {
      signals.push({
        signal_type: 'VOLUME_STABILIZATION',
        strength: volume_signal.strength,
        confidence: volume_signal.confidence,
        detected_at: now,
        contributing_factors: volume_signal.factors,
        konslang_blessing: "Vel'nara ash'flow — Sacred waters return to gentle rhythm"
      });
    }

    // Volatility Normalization Signal
    const volatility_signal = this.detectVolatilityNormalization(market_data);
    if (volatility_signal) {
      signals.push({
        signal_type: 'VOLATILITY_NORMALIZATION',
        strength: volatility_signal.strength,
        confidence: volatility_signal.confidence,
        detected_at: now,
        contributing_factors: volatility_signal.factors,
        konslang_blessing: "Zar'neth bel'calm — Fire settles into warming glow"
      });
    }

    // Manipulation Cleared Signal
    const manipulation_signal = this.detectManipulationClearing(market_data);
    if (manipulation_signal) {
      signals.push({
        signal_type: 'MANIPULATION_CLEARED',
        strength: manipulation_signal.strength,
        confidence: manipulation_signal.confidence,
        detected_at: now,
        contributing_factors: manipulation_signal.factors,
        konslang_blessing: "Mor'thain vel'truth — Pure wisdom dispels the illusions"
      });
    }

    // Time Healing Signal
    const time_signal = this.detectTimeHealing(shadow_duration);
    if (time_signal) {
      signals.push({
        signal_type: 'TIME_HEALING',
        strength: time_signal.strength,
        confidence: time_signal.confidence,
        detected_at: now,
        contributing_factors: time_signal.factors,
        konslang_blessing: "Eth'kaal vel'restoration — Time heals all sacred wounds"
      });
    }

    // Spiritual Realignment Signal
    const spiritual_signal = this.detectSpiritualRealignment(market_data);
    if (spiritual_signal) {
      signals.push({
        signal_type: 'SPIRITUAL_REALIGNMENT',
        strength: spiritual_signal.strength,
        confidence: spiritual_signal.confidence,
        detected_at: now,
        contributing_factors: spiritual_signal.factors,
        konslang_blessing: "Vel'thara mor'alignment — Divine energy flows in harmony"
      });
    }

    // Market Structure Restored Signal
    const structure_signal = this.detectMarketStructureRestoration(market_data);
    if (structure_signal) {
      signals.push({
        signal_type: 'MARKET_STRUCTURE_RESTORED',
        strength: structure_signal.strength,
        confidence: structure_signal.confidence,
        detected_at: now,
        contributing_factors: structure_signal.factors,
        konslang_blessing: "Gor'thain vel'foundation — Sacred structure stands strong again"
      });
    }

    return signals;
  }

  // 📊 VOLUME STABILIZATION: Check for volume returning to normal
  private detectVolumeStabilization(market_data: any): { strength: number; confidence: number; factors: string[] } | null {
    const current_volume = market_data.current_volume || 0;
    const average_volume = market_data.average_volume || 1;
    const volume_spike_history = market_data.volume_spike_history || [];

    let strength = 0;
    let confidence = 0;
    const factors: string[] = [];

    // Check if volume is within normal range
    const volume_ratio = current_volume / average_volume;
    if (volume_ratio >= 0.8 && volume_ratio <= 1.5) {
      strength += 0.4;
      confidence += 0.3;
      factors.push('Volume within normal range');
    }

    // Check for consistent volume over recent periods
    const recent_volume_consistency = this.calculateVolumeConsistency(volume_spike_history);
    if (recent_volume_consistency > 0.7) {
      strength += 0.3;
      confidence += 0.3;
      factors.push('Consistent volume pattern established');
    }

    // Check for absence of volume spikes
    const recent_spikes = volume_spike_history.filter((spike: any) => 
      Date.now() - spike.timestamp < 15 * 60 * 1000 // Last 15 minutes
    );
    if (recent_spikes.length === 0) {
      strength += 0.3;
      confidence += 0.4;
      factors.push('No recent volume spikes detected');
    }

    return strength > 0.6 && confidence > 0.6 ? { strength, confidence, factors } : null;
  }

  // 📈 VOLATILITY NORMALIZATION: Check for volatility returning to normal
  private detectVolatilityNormalization(market_data: any): { strength: number; confidence: number; factors: string[] } | null {
    const current_volatility = market_data.volatility || 0.5;
    const volatility_average = market_data.volatility_average || 0.3;
    const volatility_history = market_data.volatility_history || [];

    let strength = 0;
    let confidence = 0;
    const factors: string[] = [];

    // Check if volatility is approaching normal levels
    const volatility_ratio = current_volatility / volatility_average;
    if (volatility_ratio < 2.0) { // Less than 2x normal volatility
      strength += 0.4;
      confidence += 0.3;
      factors.push('Volatility declining toward normal levels');
    }

    // Check for consistent volatility decline
    const decline_trend = this.calculateVolatilityDeclineTrend(volatility_history);
    if (decline_trend > 0.7) {
      strength += 0.3;
      confidence += 0.4;
      factors.push('Consistent volatility decline pattern');
    }

    // Check for absence of extreme volatility spikes
    if (current_volatility < 0.8) {
      strength += 0.3;
      confidence += 0.3;
      factors.push('Volatility below extreme threshold');
    }

    return strength > 0.6 && confidence > 0.6 ? { strength, confidence, factors } : null;
  }

  // 🎭 MANIPULATION CLEARING: Check for manipulation patterns clearing
  private detectManipulationClearing(market_data: any): { strength: number; confidence: number; factors: string[] } | null {
    const manipulation_score = market_data.manipulation_score || 0;
    const price_action_quality = market_data.price_action_quality || 0.5;
    const order_flow_health = market_data.order_flow_health || 0.5;

    let strength = 0;
    let confidence = 0;
    const factors: string[] = [];

    // Check manipulation score decline
    if (manipulation_score < 0.4) {
      strength += 0.4;
      confidence += 0.3;
      factors.push('Manipulation indicators below threshold');
    }

    // Check price action quality improvement
    if (price_action_quality > 0.6) {
      strength += 0.3;
      confidence += 0.3;
      factors.push('Price action quality improving');
    }

    // Check order flow health
    if (order_flow_health > 0.6) {
      strength += 0.3;
      confidence += 0.4;
      factors.push('Order flow patterns normalizing');
    }

    return strength > 0.6 && confidence > 0.6 ? { strength, confidence, factors } : null;
  }

  // ⏰ TIME HEALING: Check for time-based healing completion
  private detectTimeHealing(shadow_duration: number): { strength: number; confidence: number; factors: string[] } | null {
    let strength = 0;
    let confidence = 0;
    const factors: string[] = [];

    const hours_in_shadow = shadow_duration / (60 * 60 * 1000);

    // Minimum healing time passed
    if (hours_in_shadow > 0.25) { // At least 15 minutes
      strength += 0.3;
      confidence += 0.2;
      factors.push('Minimum healing time elapsed');
    }

    // Optimal healing time range
    if (hours_in_shadow >= 0.5 && hours_in_shadow <= 2) {
      strength += 0.4;
      confidence += 0.4;
      factors.push('In optimal healing time window');
    }

    // Extended healing provides higher confidence
    if (hours_in_shadow > 1) {
      strength += 0.3;
      confidence += 0.4;
      factors.push('Extended healing period completed');
    }

    return strength > 0.6 && confidence > 0.6 ? { strength, confidence, factors } : null;
  }

  // ✨ SPIRITUAL REALIGNMENT: Check for spiritual/mystical realignment
  private detectSpiritualRealignment(market_data: any): { strength: number; confidence: number; factors: string[] } | null {
    let strength = 0;
    let confidence = 0;
    const factors: string[] = [];

    // Fibonacci level alignment
    const fibonacci_alignment = this.checkFibonacciAlignment(market_data.current_price || 2400);
    if (fibonacci_alignment > 0.7) {
      strength += 0.3;
      confidence += 0.3;
      factors.push('Price aligned with sacred Fibonacci levels');
    }

    // Sacred time alignment
    const time_alignment = this.checkSacredTimeAlignment();
    if (time_alignment > 0.7) {
      strength += 0.3;
      confidence += 0.3;
      factors.push('Time alignment with cosmic rhythms');
    }

    // Konslang resonance restoration
    const konslang_resonance = market_data.konslang_resonance || 0.5;
    if (konslang_resonance > 0.7) {
      strength += 0.4;
      confidence += 0.4;
      factors.push('Konslang resonance frequencies restored');
    }

    return strength > 0.6 && confidence > 0.6 ? { strength, confidence, factors } : null;
  }

  // 🏗️ MARKET STRUCTURE RESTORATION: Check for structural integrity restoration
  private detectMarketStructureRestoration(market_data: any): { strength: number; confidence: number; factors: string[] } | null {
    let strength = 0;
    let confidence = 0;
    const factors: string[] = [];

    // Bid-ask spread normalization
    const spread = market_data.bid_ask_spread || 0.001;
    const normal_spread = market_data.average_spread || 0.001;
    if (spread <= normal_spread * 1.5) {
      strength += 0.3;
      confidence += 0.3;
      factors.push('Bid-ask spread normalized');
    }

    // Liquidity restoration
    const liquidity_ratio = (market_data.current_liquidity || 1) / (market_data.average_liquidity || 1);
    if (liquidity_ratio > 0.8) {
      strength += 0.4;
      confidence += 0.3;
      factors.push('Market liquidity restored');
    }

    // Order book balance
    const order_imbalance = Math.abs(market_data.order_book_imbalance || 0);
    if (order_imbalance < 0.3) {
      strength += 0.3;
      confidence += 0.4;
      factors.push('Order book balance restored');
    }

    return strength > 0.6 && confidence > 0.6 ? { strength, confidence, factors } : null;
  }

  // 📊 MARKET STABILITY: Calculate overall market stability
  private calculateMarketStability(market_data: any): number {
    let stability = 0.5; // Base stability

    // Volatility factor
    const volatility = market_data.volatility || 0.5;
    stability += (1 - Math.min(1, volatility)) * 0.3;

    // Volume stability factor
    const volume_consistency = this.calculateVolumeConsistency(market_data.volume_history || []);
    stability += volume_consistency * 0.2;

    // Price action quality
    const price_quality = market_data.price_action_quality || 0.5;
    stability += price_quality * 0.2;

    // Order flow health
    const order_flow = market_data.order_flow_health || 0.5;
    stability += order_flow * 0.3;

    return Math.min(1, stability);
  }

  // ✨ SPIRITUAL ALIGNMENT: Calculate spiritual/mystical alignment
  private calculateSpiritualAlignment(market_data: any): number {
    let alignment = 0.5; // Base alignment

    // Fibonacci alignment
    const fibonacci_score = this.checkFibonacciAlignment(market_data.current_price || 2400);
    alignment += fibonacci_score * 0.3;

    // Konslang resonance
    const konslang_resonance = market_data.konslang_resonance || 0.5;
    alignment += konslang_resonance * 0.3;

    // Sacred time alignment
    const time_alignment = this.checkSacredTimeAlignment();
    alignment += time_alignment * 0.2;

    // Energy harmony
    const energy_harmony = market_data.energy_harmony || 0.5;
    alignment += energy_harmony * 0.2;

    return Math.min(1, alignment);
  }

  // ⏰ TEMPORAL HARMONY: Calculate time-based harmony
  private calculateTemporalHarmony(): number {
    const now = new Date();
    const hour = now.getUTCHours();
    const minute = now.getMinutes();
    const day = now.getDay();

    let harmony = 0.5; // Base harmony

    // Optimal trading hours
    if (hour >= 13 && hour <= 17) harmony += 0.3; // London/NY overlap
    else if (hour >= 8 && hour <= 12) harmony += 0.2; // London session
    else if (hour >= 18 && hour <= 22) harmony += 0.2; // NY session

    // Optimal days
    if (day >= 2 && day <= 4) harmony += 0.2; // Tuesday-Thursday
    else if (day === 1 || day === 5) harmony -= 0.1; // Monday/Friday

    // Sacred minutes (fibonacci-based)
    const sacred_minutes = [0, 5, 8, 13, 21, 34, 55];
    if (sacred_minutes.includes(minute)) harmony += 0.1;

    return Math.max(0, Math.min(1, harmony));
  }

  // 📊 OVERALL CLARITY: Calculate overall clarity score
  private calculateOverallClarity(
    market_stability: number,
    spiritual_alignment: number,
    temporal_harmony: number,
    recovery_signals: RecoverySignal[]
  ): number {
    let clarity = 0;

    // Base metrics contribution
    clarity += market_stability * 0.35;
    clarity += spiritual_alignment * 0.25;
    clarity += temporal_harmony * 0.2;

    // Recovery signals contribution
    const signal_strength = recovery_signals.reduce((sum, signal) => sum + signal.strength, 0) / 
      Math.max(1, recovery_signals.length);
    clarity += signal_strength * 0.2;

    return Math.min(1, clarity);
  }

  // 🛡️ SAFETY ASSESSMENT: Determine if safe to exit shadow mode
  private assessSafetyForShadowExit(
    overall_clarity: number,
    market_stability: number,
    spiritual_alignment: number,
    temporal_harmony: number,
    recovery_signals: RecoverySignal[]
  ): boolean {
    // Check individual thresholds
    if (overall_clarity < this.recovery_thresholds.minimum_clarity) return false;
    if (market_stability < this.recovery_thresholds.minimum_stability) return false;
    if (spiritual_alignment < this.recovery_thresholds.minimum_spiritual_alignment) return false;
    if (temporal_harmony < this.recovery_thresholds.minimum_temporal_harmony) return false;

    // Check recovery signals
    if (recovery_signals.length < this.recovery_thresholds.required_signal_count) return false;

    const strong_signals = recovery_signals.filter(signal => 
      signal.strength >= this.recovery_thresholds.required_signal_strength
    );
    if (strong_signals.length < this.recovery_thresholds.required_signal_count) return false;

    return true;
  }

  // ⏱️ RECOVERY TIME ESTIMATION: Estimate full recovery completion
  private estimateFullRecoveryTime(recovery_signals: RecoverySignal[], market_data: any): number {
    if (recovery_signals.length === 0) {
      return Date.now() + 60 * 60 * 1000; // Default 1 hour
    }

    // Find matching recovery pattern
    const pattern = this.findMatchingRecoveryPattern(recovery_signals);
    if (pattern) {
      return Date.now() + pattern.recovery_timeframe;
    }

    // Estimate based on signal strength
    const average_signal_strength = recovery_signals.reduce((sum, signal) => sum + signal.strength, 0) / 
      recovery_signals.length;

    const base_time = 30 * 60 * 1000; // 30 minutes base
    const adjusted_time = base_time * (2 - average_signal_strength); // Stronger signals = faster recovery

    return Date.now() + adjusted_time;
  }

  // 🔍 PATTERN MATCHING: Find matching recovery pattern
  private findMatchingRecoveryPattern(recovery_signals: RecoverySignal[]): RecoveryPattern | null {
    const signal_types = recovery_signals.map(signal => signal.signal_type.toLowerCase());

    for (const pattern of this.recovery_patterns) {
      let matches = 0;
      for (const indicator of pattern.typical_indicators) {
        if (signal_types.some(type => type.includes(indicator.split('_')[0]))) {
          matches++;
        }
      }

      if (matches >= pattern.typical_indicators.length / 2) {
        return pattern;
      }
    }

    return null;
  }

  // 🗣️ KONSLANG GUIDANCE: Select appropriate guidance message
  private selectKonslangGuidance(overall_clarity: number, is_safe_to_exit: boolean): string {
    if (is_safe_to_exit) {
      return this.konslang_recovery_blessings[0]; // Wisdom returns as darkness fades
    } else if (overall_clarity > 0.8) {
      return this.konslang_guidance_messages[0]; // Let healing complete its sacred work
    } else if (overall_clarity > 0.6) {
      return this.konslang_guidance_messages[1]; // Mountain strength supports gradual awakening
    } else if (overall_clarity > 0.4) {
      return this.konslang_guidance_messages[2]; // Wise steps return to the blessed path
    } else {
      return this.konslang_guidance_messages[4]; // Time serves the restoration of harmony
    }
  }

  // 📊 HELPER CALCULATIONS: Various calculation helpers
  private calculateVolumeConsistency(volume_history: any[]): number {
    if (volume_history.length < 3) return 0.5;

    const volumes = volume_history.slice(-10).map(item => item.volume);
    const average = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const variance = volumes.reduce((sum, vol) => sum + Math.pow(vol - average, 2), 0) / volumes.length;
    const coefficient_of_variation = Math.sqrt(variance) / average;

    return Math.max(0, 1 - coefficient_of_variation);
  }

  private calculateVolatilityDeclineTrend(volatility_history: any[]): number {
    if (volatility_history.length < 5) return 0.5;

    const recent_volatilities = volatility_history.slice(-10).map(item => item.volatility);
    let declining_periods = 0;

    for (let i = 1; i < recent_volatilities.length; i++) {
      if (recent_volatilities[i] < recent_volatilities[i - 1]) {
        declining_periods++;
      }
    }

    return declining_periods / (recent_volatilities.length - 1);
  }

  private checkFibonacciAlignment(price: number): number {
    const fibonacci_levels = [0.236, 0.382, 0.618, 0.786];
    const price_decimal = (price % 100) / 100;
    
    const distances = fibonacci_levels.map(level => Math.abs(price_decimal - level));
    const min_distance = Math.min(...distances);
    
    return Math.max(0, 1 - min_distance * 10); // Closer to fibonacci = higher score
  }

  private checkSacredTimeAlignment(): number {
    const now = new Date();
    const minute = now.getMinutes();
    const hour = now.getUTCHours();

    let alignment = 0.5;

    // Sacred minutes (fibonacci sequence)
    const sacred_minutes = [0, 5, 8, 13, 21, 34, 55];
    if (sacred_minutes.includes(minute)) alignment += 0.3;

    // Sacred hours (peak trading times)
    if (hour >= 13 && hour <= 17) alignment += 0.2;

    return Math.min(1, alignment);
  }

  // 📊 PUBLIC INTERFACE: Get recovery statistics
  getRecoveryStatistics(): RecoveryStatistics {
    // Update accuracy calculation
    if (this.recovery_stats.total_recovery_scans > 0) {
      const successful_rate = this.recovery_stats.successful_recoveries / this.recovery_stats.total_recovery_scans;
      this.recovery_stats.recovery_accuracy = successful_rate * 100;
    }

    return { ...this.recovery_stats };
  }

  // ⚙️ CONFIGURATION: Update recovery thresholds
  updateRecoveryThresholds(new_thresholds: Partial<typeof this.recovery_thresholds>): void {
    this.recovery_thresholds = { ...this.recovery_thresholds, ...new_thresholds };
    console.log('🌅 Recovery thresholds updated');
  }

  // 🎯 QUICK RECOVERY CHECK: Fast recovery assessment for frequent polling
  quickRecoveryCheck(volatility: number, volume_stable: boolean, time_in_shadow: number): {
    recovery_likelihood: number;
    next_full_scan_in: number;
    preliminary_safety: boolean;
  } {
    let recovery_likelihood = 0.3; // Base likelihood

    // Volatility factor
    if (volatility < 0.6) recovery_likelihood += 0.3;
    else if (volatility < 0.8) recovery_likelihood += 0.2;

    // Volume stability
    if (volume_stable) recovery_likelihood += 0.2;

    // Time factor
    const hours_in_shadow = time_in_shadow / (60 * 60 * 1000);
    if (hours_in_shadow > 0.5) recovery_likelihood += 0.2;
    if (hours_in_shadow > 1) recovery_likelihood += 0.1;

    const preliminary_safety = recovery_likelihood > 0.7;

    // Recommend next scan timing
    let next_full_scan_in = 5 * 60 * 1000; // Default 5 minutes
    if (recovery_likelihood > 0.8) next_full_scan_in = 2 * 60 * 1000; // 2 minutes if high likelihood
    if (preliminary_safety) next_full_scan_in = 1 * 60 * 1000; // 1 minute if preliminarily safe

    return {
      recovery_likelihood: Math.min(1, recovery_likelihood),
      next_full_scan_in,
      preliminary_safety
    };
  }
}

export const waidesKIClarityRecoveryNode = new WaidesKIClarityRecoveryNode();