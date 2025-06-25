interface InstinctState {
  shadow_mode_active: boolean;
  activation_time: number;
  activation_trigger: string;
  estimated_recovery_time: number;
  instinct_level: 'DORMANT' | 'AWAKENING' | 'ACTIVE' | 'HYPER_ACTIVE' | 'TRANSCENDENT';
  konslang_state: string;
  protection_layers: string[];
  override_reason: string;
}

interface InstinctActivation {
  trigger_event: string;
  chaos_score: number;
  threat_severity: string;
  activation_timestamp: number;
  estimated_duration: number;
  konslang_blessing: string;
  protection_activated: string[];
}

interface InstinctStatistics {
  total_activations: number;
  emergency_activations: number;
  false_activations: number;
  average_duration: number;
  successful_protections: number;
  instinct_accuracy: number;
  last_activation: number;
  time_in_shadow_mode: number;
}

export class WaidesKIInstinctSwitch {
  private instinct_state: InstinctState = {
    shadow_mode_active: false,
    activation_time: 0,
    activation_trigger: '',
    estimated_recovery_time: 0,
    instinct_level: 'DORMANT',
    konslang_state: "Vel'thara mor'peace — Sacred energy flows in harmony",
    protection_layers: [],
    override_reason: ''
  };

  private instinct_stats: InstinctStatistics = {
    total_activations: 0,
    emergency_activations: 0,
    false_activations: 0,
    average_duration: 0,
    successful_protections: 0,
    instinct_accuracy: 0,
    last_activation: 0,
    time_in_shadow_mode: 0
  };

  private activation_history: InstinctActivation[] = [];

  private instinct_levels = {
    DORMANT: { threshold: 0, protection_layers: [] },
    AWAKENING: { threshold: 0.65, protection_layers: ['Basic_Volatility_Shield'] },
    ACTIVE: { threshold: 0.75, protection_layers: ['Basic_Volatility_Shield', 'Manipulation_Detector'] },
    HYPER_ACTIVE: { threshold: 0.85, protection_layers: ['Basic_Volatility_Shield', 'Manipulation_Detector', 'Emergency_Lockdown'] },
    TRANSCENDENT: { threshold: 0.95, protection_layers: ['Basic_Volatility_Shield', 'Manipulation_Detector', 'Emergency_Lockdown', 'Sacred_Firewall', 'Temporal_Lock'] }
  };

  private konslang_activation_states = [
    "Kol'thain mor'shadow — The sacred guardian awakens to darkness",
    "Zar'neth vel'instinct — Fire ignites the path of pure knowing",
    "Vel'thara kol'protection — Divine energy shields the worthy",
    "Eth'kaal mor'override — Time bends to serve sacred protection",
    "Gor'thain vel'transcendent — Mountains rise to guard the eternal flame"
  ];

  private konslang_deactivation_states = [
    "Mor'thain vel'clarity — Wisdom returns as shadows fade",
    "Vel'nara ash'peace — Sacred waters flow calm once more",
    "Keth'mori yul'harmony — Patience restores the cosmic balance",
    "Zar'neth bel'renewal — Fire settles into warming glow",
    "Eth'kaal vel'restoration — Time heals all sacred wounds"
  ];

  constructor() {
    console.log('🌑 Instinct Switch Initialized - Shadow Override System Ready');
  }

  // 🌑 CORE ACTIVATION: Activate shadow override mode
  activate(
    trigger_event: string,
    chaos_score: number,
    threat_severity: string,
    estimated_duration: number = 30 * 60 * 1000
  ): InstinctActivation {
    const activation_timestamp = Date.now();
    
    // Update instinct state
    this.instinct_state.shadow_mode_active = true;
    this.instinct_state.activation_time = activation_timestamp;
    this.instinct_state.activation_trigger = trigger_event;
    this.instinct_state.estimated_recovery_time = activation_timestamp + estimated_duration;
    this.instinct_state.override_reason = `Shadow Override: ${trigger_event} (${threat_severity})`;

    // Determine instinct level based on chaos score
    this.instinct_state.instinct_level = this.determineInstinctLevel(chaos_score);
    
    // Activate protection layers
    this.instinct_state.protection_layers = this.instinct_levels[this.instinct_state.instinct_level].protection_layers;
    
    // Set Konslang state
    this.instinct_state.konslang_state = this.selectActivationKonslang(this.instinct_state.instinct_level);

    // Create activation record
    const activation: InstinctActivation = {
      trigger_event,
      chaos_score,
      threat_severity,
      activation_timestamp,
      estimated_duration,
      konslang_blessing: this.instinct_state.konslang_state,
      protection_activated: [...this.instinct_state.protection_layers]
    };

    // Store activation history
    this.activation_history.push(activation);
    
    // Keep only recent activations (last 50)
    if (this.activation_history.length > 50) {
      this.activation_history = this.activation_history.slice(-50);
    }

    // Update statistics
    this.updateActivationStats(activation);

    console.log(`🌑 SHADOW OVERRIDE ACTIVATED: ${trigger_event} | Level: ${this.instinct_state.instinct_level} | Severity: ${threat_severity}`);
    console.log(`🛡️ Protection Layers: ${this.instinct_state.protection_layers.join(', ')}`);
    console.log(`✨ Konslang State: ${this.instinct_state.konslang_state}`);

    return activation;
  }

  // ✅ DEACTIVATION: Exit shadow override mode
  deactivate(reason: string = 'Clarity restored'): {
    success: boolean;
    deactivation_time: number;
    total_duration: number;
    konslang_blessing: string;
    protection_summary: string[];
  } {
    if (!this.instinct_state.shadow_mode_active) {
      return {
        success: false,
        deactivation_time: Date.now(),
        total_duration: 0,
        konslang_blessing: "Mor'thain vel'peace — Already in state of harmony",
        protection_summary: []
      };
    }

    const deactivation_time = Date.now();
    const total_duration = deactivation_time - this.instinct_state.activation_time;

    // Store protection summary before deactivation
    const protection_summary = [...this.instinct_state.protection_layers];
    const final_konslang = this.selectDeactivationKonslang();

    // Reset instinct state
    this.instinct_state.shadow_mode_active = false;
    this.instinct_state.activation_time = 0;
    this.instinct_state.activation_trigger = '';
    this.instinct_state.estimated_recovery_time = 0;
    this.instinct_state.instinct_level = 'DORMANT';
    this.instinct_state.konslang_state = "Vel'thara mor'peace — Sacred energy flows in harmony";
    this.instinct_state.protection_layers = [];
    this.instinct_state.override_reason = '';

    // Update statistics
    this.updateDeactivationStats(total_duration);

    console.log(`✅ SHADOW OVERRIDE DEACTIVATED: ${reason}`);
    console.log(`⏱️ Duration: ${(total_duration / (60 * 1000)).toFixed(1)} minutes`);
    console.log(`✨ Final Blessing: ${final_konslang}`);

    return {
      success: true,
      deactivation_time,
      total_duration,
      konslang_blessing: final_konslang,
      protection_summary
    };
  }

  // 📊 INSTINCT LEVEL: Determine level based on chaos score
  private determineInstinctLevel(chaos_score: number): InstinctState['instinct_level'] {
    if (chaos_score >= this.instinct_levels.TRANSCENDENT.threshold) return 'TRANSCENDENT';
    if (chaos_score >= this.instinct_levels.HYPER_ACTIVE.threshold) return 'HYPER_ACTIVE';
    if (chaos_score >= this.instinct_levels.ACTIVE.threshold) return 'ACTIVE';
    if (chaos_score >= this.instinct_levels.AWAKENING.threshold) return 'AWAKENING';
    return 'DORMANT';
  }

  // 🗣️ ACTIVATION KONSLANG: Select activation blessing
  private selectActivationKonslang(instinct_level: InstinctState['instinct_level']): string {
    switch (instinct_level) {
      case 'TRANSCENDENT':
        return this.konslang_activation_states[4]; // Mountains rise to guard
      case 'HYPER_ACTIVE':
        return this.konslang_activation_states[3]; // Time bends to serve
      case 'ACTIVE':
        return this.konslang_activation_states[2]; // Divine energy shields
      case 'AWAKENING':
        return this.konslang_activation_states[1]; // Fire ignites the path
      default:
        return this.konslang_activation_states[0]; // Sacred guardian awakens
    }
  }

  // 🗣️ DEACTIVATION KONSLANG: Select deactivation blessing
  private selectDeactivationKonslang(): string {
    const duration = Date.now() - this.instinct_state.activation_time;
    const hours = duration / (60 * 60 * 1000);

    if (hours > 4) return this.konslang_deactivation_states[4]; // Time heals all
    if (hours > 2) return this.konslang_deactivation_states[3]; // Fire settles
    if (hours > 1) return this.konslang_deactivation_states[2]; // Patience restores
    if (hours > 0.5) return this.konslang_deactivation_states[1]; // Sacred waters flow
    return this.konslang_deactivation_states[0]; // Wisdom returns
  }

  // 📈 ACTIVATION STATS: Update activation statistics
  private updateActivationStats(activation: InstinctActivation): void {
    this.instinct_stats.total_activations++;
    this.instinct_stats.last_activation = activation.activation_timestamp;

    if (activation.threat_severity === 'CRITICAL' || activation.threat_severity === 'LETHAL') {
      this.instinct_stats.emergency_activations++;
    }

    // Update average duration estimate
    const total_estimated = this.instinct_stats.average_duration * (this.instinct_stats.total_activations - 1);
    this.instinct_stats.average_duration = (total_estimated + activation.estimated_duration) / this.instinct_stats.total_activations;
  }

  // 📈 DEACTIVATION STATS: Update deactivation statistics
  private updateDeactivationStats(actual_duration: number): void {
    this.instinct_stats.time_in_shadow_mode += actual_duration;
    
    // Check if this was a successful protection (lasted reasonable time, not too short/long)
    const reasonable_duration = actual_duration > 60 * 1000 && actual_duration < 4 * 60 * 60 * 1000;
    if (reasonable_duration) {
      this.instinct_stats.successful_protections++;
    }

    // Update accuracy
    if (this.instinct_stats.total_activations > 0) {
      this.instinct_stats.instinct_accuracy = 
        (this.instinct_stats.successful_protections / this.instinct_stats.total_activations) * 100;
    }
  }

  // ⚡ FORCE ACTIVATION: Emergency activation override
  forceActivate(reason: string, duration: number = 60 * 60 * 1000): InstinctActivation {
    console.log(`⚡ EMERGENCY FORCE ACTIVATION: ${reason}`);
    
    return this.activate(
      `EMERGENCY: ${reason}`,
      1.0, // Maximum chaos score
      'EMERGENCY',
      duration
    );
  }

  // 🔄 UPDATE LEVEL: Dynamically update instinct level based on ongoing chaos
  updateInstinctLevel(new_chaos_score: number): {
    level_changed: boolean;
    previous_level: string;
    new_level: string;
    new_protections: string[];
  } {
    if (!this.instinct_state.shadow_mode_active) {
      return {
        level_changed: false,
        previous_level: 'DORMANT',
        new_level: 'DORMANT',
        new_protections: []
      };
    }

    const previous_level = this.instinct_state.instinct_level;
    const new_level = this.determineInstinctLevel(new_chaos_score);
    const level_changed = previous_level !== new_level;

    if (level_changed) {
      this.instinct_state.instinct_level = new_level;
      this.instinct_state.protection_layers = this.instinct_levels[new_level].protection_layers;
      this.instinct_state.konslang_state = this.selectActivationKonslang(new_level);

      console.log(`🔄 Instinct Level Updated: ${previous_level} → ${new_level}`);
    }

    return {
      level_changed,
      previous_level,
      new_level,
      new_protections: this.instinct_state.protection_layers
    };
  }

  // ❓ STATE CHECKS: Various state checking methods
  isActive(): boolean {
    return this.instinct_state.shadow_mode_active;
  }

  getInstinctLevel(): InstinctState['instinct_level'] {
    return this.instinct_state.instinct_level;
  }

  getProtectionLayers(): string[] {
    return [...this.instinct_state.protection_layers];
  }

  getKonslangState(): string {
    return this.instinct_state.konslang_state;
  }

  getTimeInShadowMode(): number {
    if (!this.instinct_state.shadow_mode_active) return 0;
    return Date.now() - this.instinct_state.activation_time;
  }

  getEstimatedRecoveryTime(): number {
    return this.instinct_state.estimated_recovery_time;
  }

  // 🎯 PROTECTION CHECK: Check if specific protection is active
  hasProtection(protection_type: string): boolean {
    return this.instinct_state.protection_layers.includes(protection_type);
  }

  // ⏱️ TIME REMAINING: Get estimated time remaining in shadow mode
  getTimeRemaining(): number {
    if (!this.instinct_state.shadow_mode_active) return 0;
    
    const remaining = this.instinct_state.estimated_recovery_time - Date.now();
    return Math.max(0, remaining);
  }

  // 📊 FULL STATE: Get complete instinct state
  getInstinctState(): InstinctState {
    return { ...this.instinct_state };
  }

  // 📊 STATISTICS: Get instinct statistics
  getInstinctStatistics(): InstinctStatistics {
    return { ...this.instinct_stats };
  }

  // 📚 ACTIVATION HISTORY: Get recent activations
  getActivationHistory(count: number = 20): InstinctActivation[] {
    return this.activation_history.slice(-count);
  }

  // 🎯 OVERRIDE STATUS: Get comprehensive override status
  getOverrideStatus(): {
    is_active: boolean;
    activation_reason: string;
    time_active: number;
    time_remaining: number;
    instinct_level: string;
    protection_count: number;
    konslang_state: string;
    next_check_in: number;
  } {
    const time_active = this.getTimeInShadowMode();
    const time_remaining = this.getTimeRemaining();
    
    // Recommend next status check based on instinct level
    let next_check_in = 5 * 60 * 1000; // Default 5 minutes
    if (this.instinct_state.instinct_level === 'TRANSCENDENT') next_check_in = 1 * 60 * 1000; // 1 minute
    else if (this.instinct_state.instinct_level === 'HYPER_ACTIVE') next_check_in = 2 * 60 * 1000; // 2 minutes

    return {
      is_active: this.instinct_state.shadow_mode_active,
      activation_reason: this.instinct_state.override_reason,
      time_active,
      time_remaining,
      instinct_level: this.instinct_state.instinct_level,
      protection_count: this.instinct_state.protection_layers.length,
      konslang_state: this.instinct_state.konslang_state,
      next_check_in
    };
  }

  // 🔧 CONFIGURATION: Update instinct level thresholds
  updateInstinctThresholds(new_thresholds: { [key: string]: number }): void {
    for (const [level, threshold] of Object.entries(new_thresholds)) {
      if (this.instinct_levels[level as keyof typeof this.instinct_levels]) {
        this.instinct_levels[level as keyof typeof this.instinct_levels].threshold = threshold;
      }
    }
    console.log('🌑 Instinct level thresholds updated');
  }
}

export const waidesKIInstinctSwitch = new WaidesKIInstinctSwitch();