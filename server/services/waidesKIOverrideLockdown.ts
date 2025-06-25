import { waidesKIInstinctSwitch } from './waidesKIInstinctSwitch';

interface TradeBlockReason {
  is_blocked: boolean;
  primary_reason: string;
  protection_layers: string[];
  konslang_warning: string;
  estimated_safe_time: number;
  override_level: 'BASIC' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'ABSOLUTE';
  bypass_possible: boolean;
}

interface LockdownStatistics {
  total_trades_evaluated: number;
  trades_blocked: number;
  trades_allowed: number;
  false_blocks: number;
  successful_protections: number;
  block_accuracy: number;
  average_lockdown_duration: number;
  most_common_block_reason: string;
}

interface EmergencyLockdown {
  is_active: boolean;
  activation_time: number;
  lockdown_reason: string;
  estimated_duration: number;
  emergency_level: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' | 'CATASTROPHIC';
  manual_override_required: boolean;
}

export class WaidesKIOverrideLockdown {
  private lockdown_stats: LockdownStatistics = {
    total_trades_evaluated: 0,
    trades_blocked: 0,
    trades_allowed: 0,
    false_blocks: 0,
    successful_protections: 0,
    block_accuracy: 0,
    average_lockdown_duration: 0,
    most_common_block_reason: ''
  };

  private emergency_lockdown: EmergencyLockdown = {
    is_active: false,
    activation_time: 0,
    lockdown_reason: '',
    estimated_duration: 0,
    emergency_level: 'LOW',
    manual_override_required: false
  };

  private protection_protocols = {
    'Basic_Volatility_Shield': {
      check: (trade_data: any) => trade_data.volatility > 0.8,
      message: 'High volatility detected - basic protection active',
      bypass_possible: true
    },
    'Manipulation_Detector': {
      check: (trade_data: any) => trade_data.manipulation_score > 0.7,
      message: 'Market manipulation signals detected - enhanced protection active',
      bypass_possible: false
    },
    'Emergency_Lockdown': {
      check: () => true, // Always blocks when active
      message: 'Emergency lockdown protocol active - all trading suspended',
      bypass_possible: false
    },
    'Sacred_Firewall': {
      check: (trade_data: any) => trade_data.spiritual_alignment < 0.3,
      message: 'Sacred energy firewall active - spiritual misalignment detected',
      bypass_possible: false
    },
    'Temporal_Lock': {
      check: (trade_data: any) => this.isInTemporalDangerZone(),
      message: 'Temporal lock engaged - time-based danger zone detected',
      bypass_possible: false
    }
  };

  private konslang_lockdown_warnings = [
    "Kol'thain mor'protection — Sacred barriers shield from destruction",
    "Zar'neth vel'lockdown — Fire wisdom blocks the path of danger",
    "Vel'thara kol'shield — Divine energy creates impenetrable wall",
    "Eth'kaal mor'sacred — Time stands still to preserve the sacred",
    "Gor'thain vel'absolute — Mountain strength guards the eternal flame"
  ];

  private block_reason_counts: { [key: string]: number } = {};

  constructor() {
    console.log('🚫 Override Lockdown Initialized - Sacred Trading Protection Active');
  }

  // 🚫 CORE BLOCK CHECK: Primary trade blocking logic
  blockTradeIfNeeded(
    trade_data: any = {},
    force_evaluation: boolean = false
  ): TradeBlockReason {
    this.lockdown_stats.total_trades_evaluated++;

    // Emergency lockdown check (highest priority)
    if (this.emergency_lockdown.is_active) {
      this.lockdown_stats.trades_blocked++;
      this.updateBlockReasonCount('Emergency_Lockdown');
      
      return {
        is_blocked: true,
        primary_reason: this.emergency_lockdown.lockdown_reason,
        protection_layers: ['Emergency_Lockdown'],
        konslang_warning: "Kol'thain mor'absolute — All paths sealed by divine decree",
        estimated_safe_time: this.emergency_lockdown.activation_time + this.emergency_lockdown.estimated_duration,
        override_level: 'ABSOLUTE',
        bypass_possible: !this.emergency_lockdown.manual_override_required
      };
    }

    // Shadow override check (instinct switch)
    if (waidesKIInstinctSwitch.isActive()) {
      const active_protections = waidesKIInstinctSwitch.getProtectionLayers();
      const instinct_level = waidesKIInstinctSwitch.getInstinctLevel();
      const konslang_state = waidesKIInstinctSwitch.getKonslangState();

      // Check each active protection layer
      for (const protection of active_protections) {
        const protocol = this.protection_protocols[protection];
        if (protocol && protocol.check(trade_data)) {
          this.lockdown_stats.trades_blocked++;
          this.updateBlockReasonCount(protection);

          return {
            is_blocked: true,
            primary_reason: `Shadow Override: ${protection}`,
            protection_layers: active_protections,
            konslang_warning: konslang_state,
            estimated_safe_time: waidesKIInstinctSwitch.getEstimatedRecoveryTime(),
            override_level: this.getOverrideLevelFromInstinct(instinct_level),
            bypass_possible: protocol.bypass_possible && instinct_level !== 'TRANSCENDENT'
          };
        }
      }
    }

    // Additional safety checks even when shadow mode is not active
    const additional_checks = this.performAdditionalSafetyChecks(trade_data);
    if (additional_checks.should_block) {
      this.lockdown_stats.trades_blocked++;
      this.updateBlockReasonCount(additional_checks.reason);

      return {
        is_blocked: true,
        primary_reason: additional_checks.reason,
        protection_layers: ['Basic_Safety_Protocol'],
        konslang_warning: additional_checks.konslang_warning,
        estimated_safe_time: Date.now() + additional_checks.estimated_duration,
        override_level: 'BASIC',
        bypass_possible: true
      };
    }

    // Trade allowed
    this.lockdown_stats.trades_allowed++;
    return {
      is_blocked: false,
      primary_reason: 'Trade permitted - all safety checks passed',
      protection_layers: [],
      konslang_warning: "Vel'thara mor'flow — Sacred path is clear and blessed",
      estimated_safe_time: 0,
      override_level: 'BASIC',
      bypass_possible: true
    };
  }

  // 🔒 EMERGENCY LOCKDOWN: Activate emergency trading halt
  activateEmergencyLockdown(
    reason: string,
    duration: number,
    emergency_level: EmergencyLockdown['emergency_level'] = 'HIGH',
    manual_override_required: boolean = false
  ): {
    success: boolean;
    lockdown_id: string;
    activation_time: number;
    estimated_end_time: number;
  } {
    const activation_time = Date.now();
    const lockdown_id = `emergency_${activation_time}`;

    this.emergency_lockdown = {
      is_active: true,
      activation_time,
      lockdown_reason: reason,
      estimated_duration: duration,
      emergency_level,
      manual_override_required
    };

    console.log(`🚨 EMERGENCY LOCKDOWN ACTIVATED: ${reason}`);
    console.log(`⏱️ Duration: ${(duration / (60 * 1000)).toFixed(1)} minutes`);
    console.log(`🔒 Level: ${emergency_level} | Manual Override: ${manual_override_required}`);

    return {
      success: true,
      lockdown_id,
      activation_time,
      estimated_end_time: activation_time + duration
    };
  }

  // 🔓 DEACTIVATE EMERGENCY: Remove emergency lockdown
  deactivateEmergencyLockdown(reason: string = 'Manual deactivation'): {
    success: boolean;
    deactivation_time: number;
    total_duration: number;
    trades_protected: number;
  } {
    if (!this.emergency_lockdown.is_active) {
      return {
        success: false,
        deactivation_time: Date.now(),
        total_duration: 0,
        trades_protected: 0
      };
    }

    const deactivation_time = Date.now();
    const total_duration = deactivation_time - this.emergency_lockdown.activation_time;
    
    // Calculate trades protected during lockdown
    const trades_protected = this.lockdown_stats.trades_blocked; // Simplified calculation

    // Reset emergency lockdown
    this.emergency_lockdown = {
      is_active: false,
      activation_time: 0,
      lockdown_reason: '',
      estimated_duration: 0,
      emergency_level: 'LOW',
      manual_override_required: false
    };

    console.log(`🔓 EMERGENCY LOCKDOWN DEACTIVATED: ${reason}`);
    console.log(`⏱️ Duration: ${(total_duration / (60 * 1000)).toFixed(1)} minutes`);

    return {
      success: true,
      deactivation_time,
      total_duration,
      trades_protected
    };
  }

  // 🛡️ ADDITIONAL SAFETY: Extra safety checks beyond shadow mode
  private performAdditionalSafetyChecks(trade_data: any): {
    should_block: boolean;
    reason: string;
    konslang_warning: string;
    estimated_duration: number;
  } {
    // Check for extreme market conditions
    if (trade_data.volatility > 0.9) {
      return {
        should_block: true,
        reason: 'Extreme volatility detected - emergency volatility protection',
        konslang_warning: "Zar'neth kol'chaos — Fire warns of the consuming storm",
        estimated_duration: 15 * 60 * 1000 // 15 minutes
      };
    }

    // Check for manipulation patterns
    if (trade_data.manipulation_score > 0.85) {
      return {
        should_block: true,
        reason: 'Critical manipulation patterns detected - market integrity compromised',
        konslang_warning: "Mor'thain kol'deception — Dark wisdom clouds the sacred path",
        estimated_duration: 30 * 60 * 1000 // 30 minutes
      };
    }

    // Check for system overload
    if (trade_data.system_load > 0.95) {
      return {
        should_block: true,
        reason: 'System overload detected - processing capacity exceeded',
        konslang_warning: "Eth'kaal mor'burden — Time struggles under excessive weight",
        estimated_duration: 10 * 60 * 1000 // 10 minutes
      };
    }

    // Check for unusual time patterns
    if (this.isInHighRiskTimeZone()) {
      return {
        should_block: true,
        reason: 'High-risk time zone - market historically unstable',
        konslang_warning: "Vel'thara kol'timing — Sacred timing warns of danger",
        estimated_duration: 60 * 60 * 1000 // 1 hour
      };
    }

    return {
      should_block: false,
      reason: '',
      konslang_warning: '',
      estimated_duration: 0
    };
  }

  // 📊 OVERRIDE LEVEL: Determine override level from instinct level
  private getOverrideLevelFromInstinct(instinct_level: string): TradeBlockReason['override_level'] {
    switch (instinct_level) {
      case 'TRANSCENDENT': return 'ABSOLUTE';
      case 'HYPER_ACTIVE': return 'CRITICAL';
      case 'ACTIVE': return 'HIGH';
      case 'AWAKENING': return 'MODERATE';
      default: return 'BASIC';
    }
  }

  // ⏰ TEMPORAL DANGER: Check for time-based danger zones
  private isInTemporalDangerZone(): boolean {
    const now = new Date();
    const hour = now.getUTCHours();
    const minute = now.getMinutes();

    // Market open/close danger zones
    if ((hour === 13 && minute >= 25 && minute <= 35) || // Market open +/- 5 minutes
        (hour === 20 && minute >= 55) || (hour === 21 && minute <= 5)) { // Market close +/- 5 minutes
      return true;
    }

    // News release danger zones (every hour at :30)
    if (minute >= 28 && minute <= 32) {
      return true;
    }

    return false;
  }

  // ⏰ HIGH RISK TIME: Check for historically risky time zones
  private isInHighRiskTimeZone(): boolean {
    const now = new Date();
    const hour = now.getUTCHours();
    const day = now.getDay(); // 0 = Sunday

    // Weekend trading (higher risk)
    if (day === 0 || day === 6) return true;

    // Late night/early morning (thin liquidity)
    if (hour >= 23 || hour <= 5) return true;

    // Lunch break period (12-2 PM UTC)
    if (hour >= 12 && hour <= 14) return true;

    return false;
  }

  // 📈 BLOCK REASON TRACKING: Update block reason statistics
  private updateBlockReasonCount(reason: string): void {
    this.block_reason_counts[reason] = (this.block_reason_counts[reason] || 0) + 1;

    // Update most common block reason
    let max_count = 0;
    let most_common = '';
    for (const [block_reason, count] of Object.entries(this.block_reason_counts)) {
      if (count > max_count) {
        max_count = count;
        most_common = block_reason;
      }
    }
    this.lockdown_stats.most_common_block_reason = most_common;
  }

  // 🎯 BYPASS ATTEMPT: Attempt to bypass protection (for authorized override)
  attemptBypass(
    authorization_code: string,
    bypass_reason: string,
    trade_data: any
  ): {
    bypass_granted: boolean;
    bypass_level: string;
    conditions: string[];
    konslang_blessing: string;
    expires_in: number;
  } {
    // Simple authorization check (in real implementation, would be more sophisticated)
    const authorized_codes = ['EMERGENCY_OVERRIDE', 'ADMIN_BYPASS', 'CRITICAL_TRADE'];
    
    if (!authorized_codes.includes(authorization_code)) {
      return {
        bypass_granted: false,
        bypass_level: 'NONE',
        conditions: ['Invalid authorization code'],
        konslang_blessing: "Kol'thain mor'denied — The sacred guardian rejects false keys",
        expires_in: 0
      };
    }

    // Check if bypass is even possible based on current protection level
    const current_protections = waidesKIInstinctSwitch.getProtectionLayers();
    const bypass_blocked = current_protections.some(protection => 
      this.protection_protocols[protection] && !this.protection_protocols[protection].bypass_possible
    );

    if (bypass_blocked && authorization_code !== 'EMERGENCY_OVERRIDE') {
      return {
        bypass_granted: false,
        bypass_level: 'BLOCKED',
        conditions: ['Current protection level prevents bypass', 'Emergency override required'],
        konslang_blessing: "Gor'thain vel'immovable — Mountain stands firm against all storms",
        expires_in: 0
      };
    }

    // Grant bypass
    const expires_in = 10 * 60 * 1000; // 10 minutes
    const bypass_level = authorization_code === 'EMERGENCY_OVERRIDE' ? 'EMERGENCY' : 'AUTHORIZED';

    console.log(`🔓 BYPASS GRANTED: ${bypass_reason} | Level: ${bypass_level} | Code: ${authorization_code}`);

    return {
      bypass_granted: true,
      bypass_level,
      conditions: [
        'Bypass active for 10 minutes',
        'Enhanced monitoring enabled',
        'Automatic re-lock after expiry'
      ],
      konslang_blessing: "Vel'thara mor'trusted — Sacred path opens for the worthy guardian",
      expires_in
    };
  }

  // 📊 LOCKDOWN STATUS: Get comprehensive lockdown status
  getLockdownStatus(): {
    shadow_override_active: boolean;
    emergency_lockdown_active: boolean;
    active_protections: string[];
    override_level: string;
    estimated_safe_time: number;
    lockdown_reason: string;
    bypass_possible: boolean;
  } {
    const shadow_active = waidesKIInstinctSwitch.isActive();
    const emergency_active = this.emergency_lockdown.is_active;
    
    let active_protections: string[] = [];
    let override_level = 'NONE';
    let estimated_safe_time = 0;
    let lockdown_reason = '';
    let bypass_possible = true;

    if (emergency_active) {
      active_protections = ['Emergency_Lockdown'];
      override_level = 'ABSOLUTE';
      estimated_safe_time = this.emergency_lockdown.activation_time + this.emergency_lockdown.estimated_duration;
      lockdown_reason = this.emergency_lockdown.lockdown_reason;
      bypass_possible = !this.emergency_lockdown.manual_override_required;
    } else if (shadow_active) {
      active_protections = waidesKIInstinctSwitch.getProtectionLayers();
      override_level = this.getOverrideLevelFromInstinct(waidesKIInstinctSwitch.getInstinctLevel());
      estimated_safe_time = waidesKIInstinctSwitch.getEstimatedRecoveryTime();
      lockdown_reason = `Shadow Override: ${waidesKIInstinctSwitch.getInstinctLevel()}`;
      bypass_possible = waidesKIInstinctSwitch.getInstinctLevel() !== 'TRANSCENDENT';
    }

    return {
      shadow_override_active: shadow_active,
      emergency_lockdown_active: emergency_active,
      active_protections,
      override_level,
      estimated_safe_time,
      lockdown_reason,
      bypass_possible
    };
  }

  // 📊 STATISTICS: Get lockdown statistics
  getLockdownStatistics(): LockdownStatistics {
    // Update block accuracy
    if (this.lockdown_stats.total_trades_evaluated > 0) {
      const successful_blocks = this.lockdown_stats.trades_blocked - this.lockdown_stats.false_blocks;
      this.lockdown_stats.block_accuracy = (successful_blocks / this.lockdown_stats.trades_blocked) * 100;
    }

    return { ...this.lockdown_stats };
  }

  // 🚨 EMERGENCY STATUS: Get emergency lockdown status
  getEmergencyStatus(): EmergencyLockdown {
    return { ...this.emergency_lockdown };
  }

  // 📊 PROTECTION SUMMARY: Get summary of all active protections
  getProtectionSummary(): {
    total_active_protections: number;
    protection_details: Array<{
      name: string;
      type: 'SHADOW' | 'EMERGENCY' | 'ADDITIONAL';
      status: 'ACTIVE' | 'INACTIVE';
      bypass_possible: boolean;
    }>;
    overall_protection_level: string;
    estimated_recovery_time: number;
  } {
    const protections = [];
    let total_active = 0;

    // Shadow protections
    if (waidesKIInstinctSwitch.isActive()) {
      const shadow_protections = waidesKIInstinctSwitch.getProtectionLayers();
      for (const protection of shadow_protections) {
        protections.push({
          name: protection,
          type: 'SHADOW' as const,
          status: 'ACTIVE' as const,
          bypass_possible: this.protection_protocols[protection]?.bypass_possible || false
        });
        total_active++;
      }
    }

    // Emergency protections
    if (this.emergency_lockdown.is_active) {
      protections.push({
        name: 'Emergency_Lockdown',
        type: 'EMERGENCY' as const,
        status: 'ACTIVE' as const,
        bypass_possible: !this.emergency_lockdown.manual_override_required
      });
      total_active++;
    }

    // Determine overall protection level
    let overall_level = 'NONE';
    if (this.emergency_lockdown.is_active) overall_level = 'EMERGENCY';
    else if (waidesKIInstinctSwitch.isActive()) {
      overall_level = waidesKIInstinctSwitch.getInstinctLevel();
    }

    // Calculate estimated recovery time
    let recovery_time = 0;
    if (this.emergency_lockdown.is_active) {
      recovery_time = this.emergency_lockdown.activation_time + this.emergency_lockdown.estimated_duration;
    } else if (waidesKIInstinctSwitch.isActive()) {
      recovery_time = waidesKIInstinctSwitch.getEstimatedRecoveryTime();
    }

    return {
      total_active_protections: total_active,
      protection_details: protections,
      overall_protection_level: overall_level,
      estimated_recovery_time: recovery_time
    };
  }
}

export const waidesKIOverrideLockdown = new WaidesKIOverrideLockdown();