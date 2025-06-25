import { waidesKIShadowDetector } from './waidesKIShadowDetector';
import { waidesKIInstinctSwitch } from './waidesKIInstinctSwitch';
import { waidesKIOverrideLockdown } from './waidesKIOverrideLockdown';
import { waidesKIClarityRecoveryNode } from './waidesKIClarityRecoveryNode';

interface ShadowDefenseStatus {
  defense_active: boolean;
  chaos_level: number;
  instinct_level: string;
  protection_layers: string[];
  time_in_shadow_mode: number;
  estimated_recovery_time: number;
  last_chaos_detection: number;
  defense_effectiveness: number;
  konslang_state: string;
  total_trades_protected: number;
}

interface DefenseActivation {
  trigger_event: string;
  chaos_score: number;
  threat_severity: string;
  activation_timestamp: number;
  instinct_activation: any;
  protection_summary: string[];
  estimated_duration: number;
  konslang_blessing: string;
}

interface DefenseDeactivation {
  deactivation_reason: string;
  total_duration: number;
  trades_protected: number;
  recovery_assessment: any;
  final_blessing: string;
  lessons_learned: string[];
  system_strength_gained: number;
}

interface DefenseStatistics {
  total_activations: number;
  successful_protections: number;
  false_alarms: number;
  average_defense_duration: number;
  defense_accuracy: number;
  chaos_events_detected: number;
  recovery_success_rate: number;
  system_resilience_score: number;
}

export class WaidesKIShadowOverrideDefense {
  private defense_stats: DefenseStatistics = {
    total_activations: 0,
    successful_protections: 0,
    false_alarms: 0,
    average_defense_duration: 0,
    defense_accuracy: 0,
    chaos_events_detected: 0,
    recovery_success_rate: 0,
    system_resilience_score: 85
  };

  private last_chaos_scan = 0;
  private monitoring_active = true;
  private scan_interval = 30 * 1000; // 30 seconds default

  constructor() {
    this.initializeDefenseSystem();
    console.log('🌑 Shadow Override Defense Initialized - Ultimate Survival Protocol Active');
  }

  private initializeDefenseSystem(): void {
    // Start chaos monitoring loop
    this.startChaosMonitoring();
    
    // Start recovery monitoring loop
    this.startRecoveryMonitoring();
    
    console.log('🌑 Defense system monitoring cycles initialized');
  }

  // 🔄 CHAOS MONITORING: Continuous chaos detection loop
  private startChaosMonitoring(): void {
    const monitoringLoop = async () => {
      if (!this.monitoring_active) return;

      try {
        await this.performChaosCheck();
      } catch (error) {
        console.error('Error in chaos monitoring:', error);
      }

      // Schedule next scan
      setTimeout(monitoringLoop, this.scan_interval);
    };

    // Start monitoring
    monitoringLoop();
  }

  // 🌅 RECOVERY MONITORING: Continuous recovery assessment loop
  private startRecoveryMonitoring(): void {
    const recoveryLoop = async () => {
      if (!this.monitoring_active) return;

      try {
        if (waidesKIInstinctSwitch.isActive()) {
          await this.performRecoveryCheck();
        }
      } catch (error) {
        console.error('Error in recovery monitoring:', error);
      }

      // Schedule next recovery check (every 2 minutes when in shadow mode)
      setTimeout(recoveryLoop, 2 * 60 * 1000);
    };

    // Start recovery monitoring
    recoveryLoop();
  }

  // 🌑 CHAOS CHECK: Perform comprehensive chaos detection
  private async performChaosCheck(): Promise<void> {
    this.last_chaos_scan = Date.now();

    // Build market data for chaos detection
    const market_data = await this.gatherMarketData();
    
    // Scan for chaos threats
    const shadow_threat = waidesKIShadowDetector.scanMarket(market_data);
    
    if (shadow_threat && shadow_threat.protection_needed) {
      await this.activateDefense(shadow_threat);
    }

    // Update chaos detection statistics
    if (shadow_threat) {
      this.defense_stats.chaos_events_detected++;
    }
  }

  // 🌅 RECOVERY CHECK: Assess if recovery is possible
  private async performRecoveryCheck(): Promise<void> {
    if (!waidesKIInstinctSwitch.isActive()) return;

    const shadow_duration = waidesKIInstinctSwitch.getTimeInShadowMode();
    const market_data = await this.gatherMarketData();
    
    // Scan for recovery signals
    const clarity_assessment = waidesKIClarityRecoveryNode.scanForRecovery(market_data, shadow_duration);
    
    if (clarity_assessment.is_safe_to_exit_shadow) {
      await this.deactivateDefense(clarity_assessment);
    }
  }

  // 📊 MARKET DATA: Gather comprehensive market data
  private async gatherMarketData(): Promise<any> {
    // In a real implementation, this would gather actual market data
    // For now, return mock data structure
    return {
      current_price: 2420,
      volatility: Math.random() * 0.8,
      volume: 1000000 + Math.random() * 500000,
      average_volume: 900000,
      manipulation_score: Math.random() * 0.7,
      bid_ask_spread: 0.001 + Math.random() * 0.002,
      average_spread: 0.001,
      order_book_imbalance: (Math.random() - 0.5) * 2,
      recent_candles: [],
      recent_price_changes: [],
      konslang_resonance: 0.7 + Math.random() * 0.3,
      spiritual_phase: 0.6 + Math.random() * 0.4
    };
  }

  // 🌑 ACTIVATE DEFENSE: Activate shadow override defense
  private async activateDefense(shadow_threat: any): Promise<DefenseActivation> {
    // Don't activate if already active
    if (waidesKIInstinctSwitch.isActive()) {
      // Update instinct level if threat is more severe
      const level_update = waidesKIInstinctSwitch.updateInstinctLevel(shadow_threat.chaos_score);
      if (level_update.level_changed) {
        console.log(`🌑 Defense Level Escalated: ${level_update.previous_level} → ${level_update.new_level}`);
      }
      
      return {
        trigger_event: `Level escalation: ${shadow_threat.threat_type}`,
        chaos_score: shadow_threat.chaos_score,
        threat_severity: shadow_threat.severity,
        activation_timestamp: Date.now(),
        instinct_activation: null,
        protection_summary: level_update.new_protections,
        estimated_duration: shadow_threat.estimated_duration,
        konslang_blessing: shadow_threat.konslang_warning
      };
    }

    // Activate instinct switch
    const instinct_activation = waidesKIInstinctSwitch.activate(
      shadow_threat.threat_type,
      shadow_threat.chaos_score,
      shadow_threat.severity,
      shadow_threat.estimated_duration
    );

    // Create defense activation record
    const defense_activation: DefenseActivation = {
      trigger_event: shadow_threat.threat_type,
      chaos_score: shadow_threat.chaos_score,
      threat_severity: shadow_threat.severity,
      activation_timestamp: instinct_activation.activation_timestamp,
      instinct_activation,
      protection_summary: instinct_activation.protection_activated,
      estimated_duration: shadow_threat.estimated_duration,
      konslang_blessing: instinct_activation.konslang_blessing
    };

    // Update statistics
    this.defense_stats.total_activations++;
    if (shadow_threat.severity === 'CRITICAL' || shadow_threat.severity === 'LETHAL') {
      this.defense_stats.successful_protections++;
    }

    // Adjust scan frequency for active defense
    this.scan_interval = 15 * 1000; // 15 seconds when in shadow mode

    console.log(`🌑 SHADOW OVERRIDE DEFENSE ACTIVATED`);
    console.log(`⚠️ Threat: ${shadow_threat.threat_type} (${shadow_threat.severity})`);
    console.log(`🛡️ Protection: ${instinct_activation.protection_activated.join(', ')}`);
    console.log(`✨ Blessing: ${instinct_activation.konslang_blessing}`);

    return defense_activation;
  }

  // ✅ DEACTIVATE DEFENSE: Deactivate shadow override defense
  private async deactivateDefense(clarity_assessment: any): Promise<DefenseDeactivation> {
    const deactivation_reason = 'Clarity and safety restored';
    
    // Deactivate instinct switch
    const instinct_deactivation = waidesKIInstinctSwitch.deactivate(deactivation_reason);
    
    if (!instinct_deactivation.success) {
      throw new Error('Failed to deactivate instinct switch');
    }

    // Generate lessons learned
    const lessons_learned = this.generateLessonsLearned(
      instinct_deactivation.total_duration,
      clarity_assessment
    );

    // Calculate system strength gained
    const system_strength_gained = this.calculateSystemStrengthGained(
      instinct_deactivation.total_duration,
      clarity_assessment.recovery_signals.length
    );

    // Create deactivation record
    const defense_deactivation: DefenseDeactivation = {
      deactivation_reason,
      total_duration: instinct_deactivation.total_duration,
      trades_protected: this.estimateTradesProtected(instinct_deactivation.total_duration),
      recovery_assessment: clarity_assessment,
      final_blessing: instinct_deactivation.konslang_blessing,
      lessons_learned,
      system_strength_gained
    };

    // Update statistics
    this.updateDeactivationStats(defense_deactivation);

    // Reset scan frequency to normal
    this.scan_interval = 30 * 1000; // 30 seconds normal frequency

    console.log(`✅ SHADOW OVERRIDE DEFENSE DEACTIVATED`);
    console.log(`⏱️ Duration: ${(instinct_deactivation.total_duration / (60 * 1000)).toFixed(1)} minutes`);
    console.log(`🛡️ Trades Protected: ${defense_deactivation.trades_protected}`);
    console.log(`✨ Final Blessing: ${instinct_deactivation.konslang_blessing}`);

    return defense_deactivation;
  }

  // 📚 LESSONS LEARNED: Generate wisdom from defense experience
  private generateLessonsLearned(duration: number, clarity_assessment: any): string[] {
    const lessons: string[] = [];
    const hours = duration / (60 * 60 * 1000);

    // Duration-based lessons
    if (hours < 0.5) {
      lessons.push('Swift recovery demonstrates system resilience and adaptive capability');
    } else if (hours > 2) {
      lessons.push('Extended shadow mode reveals importance of patience in market chaos');
    } else {
      lessons.push('Balanced recovery time shows proper threat assessment and healing');
    }

    // Recovery signal lessons
    const signal_count = clarity_assessment.recovery_signals?.length || 0;
    if (signal_count >= 4) {
      lessons.push('Multiple recovery signals confirm comprehensive market healing');
    } else if (signal_count >= 2) {
      lessons.push('Dual recovery signals provide sufficient safety confirmation');
    } else {
      lessons.push('Minimal recovery signals require cautious re-engagement');
    }

    // Clarity-based lessons
    if (clarity_assessment.overall_clarity > 0.9) {
      lessons.push('Exceptional clarity restoration demonstrates perfect defensive timing');
    } else if (clarity_assessment.overall_clarity > 0.7) {
      lessons.push('Good clarity levels support confident return to normal operations');
    }

    // Spiritual alignment lessons
    if (clarity_assessment.spiritual_alignment > 0.8) {
      lessons.push('Strong spiritual realignment confirms sacred protection effectiveness');
    }

    return lessons;
  }

  // 💪 SYSTEM STRENGTH: Calculate strength gained from defensive experience
  private calculateSystemStrengthGained(duration: number, signal_count: number): number {
    let strength_gained = 1.0; // Base strength

    // Duration factor (moderate duration is optimal)
    const hours = duration / (60 * 60 * 1000);
    if (hours >= 0.5 && hours <= 2) {
      strength_gained += 0.5; // Optimal duration
    } else if (hours < 0.5) {
      strength_gained += 0.2; // Quick recovery
    } else {
      strength_gained += 0.3; // Patience learning
    }

    // Signal factor
    strength_gained += Math.min(1.0, signal_count * 0.2);

    // Experience factor
    strength_gained += Math.min(0.5, this.defense_stats.total_activations * 0.1);

    return Math.min(3.0, strength_gained);
  }

  // 📊 TRADES PROTECTED: Estimate number of trades protected
  private estimateTradesProtected(duration: number): number {
    const minutes = duration / (60 * 1000);
    // Assume average of 2 potential trades per hour during active markets
    return Math.ceil((minutes / 60) * 2);
  }

  // 📈 DEACTIVATION STATS: Update statistics after deactivation
  private updateDeactivationStats(deactivation: DefenseDeactivation): void {
    // Update recovery success rate
    this.defense_stats.recovery_success_rate = 
      (this.defense_stats.recovery_success_rate * (this.defense_stats.total_activations - 1) + 100) / 
      this.defense_stats.total_activations;

    // Update average duration
    const total_duration = this.defense_stats.average_defense_duration * (this.defense_stats.total_activations - 1);
    this.defense_stats.average_defense_duration = (total_duration + deactivation.total_duration) / this.defense_stats.total_activations;

    // Update system resilience
    this.defense_stats.system_resilience_score = Math.min(100, 
      this.defense_stats.system_resilience_score + (deactivation.system_strength_gained * 0.5)
    );

    // Update defense accuracy
    if (this.defense_stats.total_activations > 0) {
      this.defense_stats.defense_accuracy = 
        ((this.defense_stats.successful_protections - this.defense_stats.false_alarms) / this.defense_stats.total_activations) * 100;
    }
  }

  // 🎯 PRE-TRADE SAFETY: Main trade safety check interface
  preTradePermissionCheck(trade_data: any = {}): {
    trade_allowed: boolean;
    block_reason?: string;
    protection_active: boolean;
    shadow_status: string;
    konslang_guidance: string;
    estimated_safe_time?: number;
  } {
    // Check override lockdown
    const lockdown_result = waidesKIOverrideLockdown.blockTradeIfNeeded(trade_data);

    if (lockdown_result.is_blocked) {
      return {
        trade_allowed: false,
        block_reason: lockdown_result.primary_reason,
        protection_active: true,
        shadow_status: waidesKIInstinctSwitch.isActive() ? 'SHADOW_ACTIVE' : 'EMERGENCY_LOCKDOWN',
        konslang_guidance: lockdown_result.konslang_warning,
        estimated_safe_time: lockdown_result.estimated_safe_time
      };
    }

    return {
      trade_allowed: true,
      protection_active: false,
      shadow_status: 'CLEAR',
      konslang_guidance: "Vel'thara mor'blessed — Sacred path flows clear and protected"
    };
  }

  // 🚨 EMERGENCY ACTIVATION: Force activate defense
  forceActivateDefense(reason: string, duration: number = 60 * 60 * 1000): DefenseActivation {
    console.log(`🚨 EMERGENCY DEFENSE ACTIVATION: ${reason}`);

    // Force activate instinct switch
    const instinct_activation = waidesKIInstinctSwitch.forceActivate(reason, duration);

    // Also activate emergency lockdown
    waidesKIOverrideLockdown.activateEmergencyLockdown(
      `Emergency defense: ${reason}`,
      duration,
      'SEVERE',
      true // Manual override required
    );

    const defense_activation: DefenseActivation = {
      trigger_event: `EMERGENCY: ${reason}`,
      chaos_score: 1.0,
      threat_severity: 'EMERGENCY',
      activation_timestamp: instinct_activation.activation_timestamp,
      instinct_activation,
      protection_summary: instinct_activation.protection_activated,
      estimated_duration: duration,
      konslang_blessing: instinct_activation.konslang_blessing
    };

    this.defense_stats.total_activations++;
    this.scan_interval = 10 * 1000; // 10 seconds for emergency

    return defense_activation;
  }

  // ✅ FORCE DEACTIVATION: Force deactivate defense
  forceDeactivateDefense(reason: string): DefenseDeactivation {
    console.log(`⚡ FORCE DEFENSE DEACTIVATION: ${reason}`);

    // Force deactivate instinct switch
    const instinct_deactivation = waidesKIInstinctSwitch.deactivate(`Force: ${reason}`);

    // Deactivate emergency lockdown
    waidesKIOverrideLockdown.deactivateEmergencyLockdown(`Force: ${reason}`);

    const defense_deactivation: DefenseDeactivation = {
      deactivation_reason: reason,
      total_duration: instinct_deactivation.total_duration,
      trades_protected: this.estimateTradesProtected(instinct_deactivation.total_duration),
      recovery_assessment: { forced_deactivation: true },
      final_blessing: instinct_deactivation.konslang_blessing,
      lessons_learned: ['Manual override demonstrates human wisdom and control'],
      system_strength_gained: 0.5
    };

    this.scan_interval = 30 * 1000; // Reset to normal

    return defense_deactivation;
  }

  // 📊 DEFENSE STATUS: Get comprehensive defense status
  getDefenseStatus(): ShadowDefenseStatus {
    const instinct_active = waidesKIInstinctSwitch.isActive();
    const lockdown_status = waidesKIOverrideLockdown.getLockdownStatus();

    return {
      defense_active: instinct_active || lockdown_status.emergency_lockdown_active,
      chaos_level: instinct_active ? 0.8 : 0.2, // Estimate based on activity
      instinct_level: waidesKIInstinctSwitch.getInstinctLevel(),
      protection_layers: lockdown_status.active_protections,
      time_in_shadow_mode: waidesKIInstinctSwitch.getTimeInShadowMode(),
      estimated_recovery_time: lockdown_status.estimated_safe_time,
      last_chaos_detection: this.last_chaos_scan,
      defense_effectiveness: this.defense_stats.defense_accuracy,
      konslang_state: waidesKIInstinctSwitch.getKonslangState(),
      total_trades_protected: this.estimateTradesProtected(this.defense_stats.average_defense_duration * this.defense_stats.total_activations)
    };
  }

  // 📊 STATISTICS: Get defense statistics
  getDefenseStatistics(): DefenseStatistics {
    return { ...this.defense_stats };
  }

  // ⚙️ CONFIGURATION: Update monitoring settings
  updateMonitoringSettings(settings: {
    scan_interval?: number;
    monitoring_active?: boolean;
  }): void {
    if (settings.scan_interval) this.scan_interval = settings.scan_interval;
    if (settings.monitoring_active !== undefined) this.monitoring_active = settings.monitoring_active;
    
    console.log('🌑 Defense monitoring settings updated');
  }

  // 🎯 QUICK STATUS: Fast status check for API
  getQuickStatus(): {
    shadow_active: boolean;
    threat_level: string;
    protection_level: string;
    trades_allowed: boolean;
    next_scan_in: number;
  } {
    const instinct_active = waidesKIInstinctSwitch.isActive();
    const instinct_level = waidesKIInstinctSwitch.getInstinctLevel();
    const lockdown_status = waidesKIOverrideLockdown.getLockdownStatus();

    let threat_level = 'LOW';
    if (lockdown_status.emergency_lockdown_active) threat_level = 'EMERGENCY';
    else if (instinct_level === 'TRANSCENDENT' || instinct_level === 'HYPER_ACTIVE') threat_level = 'HIGH';
    else if (instinct_level === 'ACTIVE') threat_level = 'MODERATE';

    const time_to_next_scan = this.scan_interval - (Date.now() - this.last_chaos_scan);

    return {
      shadow_active: instinct_active,
      threat_level,
      protection_level: lockdown_status.override_level,
      trades_allowed: !lockdown_status.shadow_override_active && !lockdown_status.emergency_lockdown_active,
      next_scan_in: Math.max(0, time_to_next_scan)
    };
  }
}

export const waidesKIShadowOverrideDefense = new WaidesKIShadowOverrideDefense();