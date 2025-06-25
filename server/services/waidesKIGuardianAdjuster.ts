import { waidesKISentinelWatchdog } from './waidesKISentinelWatchdog';
import { waidesKIRiskAlertEngine } from './waidesKIRiskAlertEngine';
import { waidesKIDailyReporter } from './waidesKIDailyReporter';

interface GuardianAction {
  action_id: string;
  timestamp: number;
  bot_id: string;
  action_type: 'PAUSE' | 'COOLDOWN' | 'EMERGENCY_STOP' | 'REDUCE_POSITION' | 'ADJUST_FREQUENCY' | 'FORCE_EXIT' | 'REROUTE_STRATEGY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  trigger_reason: string;
  action_parameters: {
    duration_minutes?: number;
    position_reduction_percent?: number;
    new_frequency_limit?: number;
    cooldown_until?: number;
    emergency_contact?: boolean;
  };
  action_status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  auto_executed: boolean;
  effectiveness_score?: number;
  completion_time?: number;
}

interface CooldownPeriod {
  bot_id: string;
  cooldown_type: 'TRADING' | 'POSITION_OPENING' | 'FREQUENCY_LIMITED' | 'EMERGENCY_PAUSE';
  start_time: number;
  end_time: number;
  remaining_minutes: number;
  can_override: boolean;
  override_conditions: string[];
}

interface PositionAdjustment {
  bot_id: string;
  adjustment_type: 'SIZE_REDUCTION' | 'FREQUENCY_LIMIT' | 'RISK_LIMIT' | 'TIMEFRAME_RESTRICTION';
  original_parameters: any;
  adjusted_parameters: any;
  adjustment_factor: number;
  duration_minutes: number;
  auto_revert: boolean;
  effectiveness_tracking: {
    trades_before: number;
    trades_after: number;
    performance_before: number;
    performance_after: number;
  };
}

interface GuardianStatistics {
  total_actions_executed: number;
  actions_by_type: {
    pause: number;
    cooldown: number;
    emergency_stop: number;
    position_reduction: number;
    frequency_adjustment: number;
  };
  prevention_success_rate: number;
  average_action_effectiveness: number;
  bots_currently_protected: number;
  total_protected_capital: number;
  emergency_interventions: number;
  auto_recoveries: number;
  manual_overrides: number;
  guardian_response_time_seconds: number;
}

export class WaidesKIGuardianAdjuster {
  private guardianActions: GuardianAction[] = [];
  private activeCooldowns: Map<string, CooldownPeriod> = new Map();
  private activeAdjustments: Map<string, PositionAdjustment> = new Map();
  private guardianStatistics: GuardianStatistics = {
    total_actions_executed: 0,
    actions_by_type: {
      pause: 0,
      cooldown: 0,
      emergency_stop: 0,
      position_reduction: 0,
      frequency_adjustment: 0
    },
    prevention_success_rate: 0,
    average_action_effectiveness: 0,
    bots_currently_protected: 0,
    total_protected_capital: 0,
    emergency_interventions: 0,
    auto_recoveries: 0,
    manual_overrides: 0,
    guardian_response_time_seconds: 0
  };

  private isGuardianActive: boolean = true;
  private maxActionHistory: number = 2000;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startGuardianMonitoring();
  }

  private startGuardianMonitoring(): void {
    // Monitor cooldowns and adjustments every minute
    this.monitoringInterval = setInterval(() => {
      this.updateCooldowns();
      this.updateAdjustments();
      this.checkAutoRecoveries();
    }, 60 * 1000); // 1 minute
  }

  // CORE GUARDIAN ACTIONS
  async pauseBot(
    botId: string, 
    reason: string, 
    durationMinutes: number = 30,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
  ): Promise<GuardianAction> {
    const actionId = this.generateActionId();
    const startTime = Date.now();

    const guardianAction: GuardianAction = {
      action_id: actionId,
      timestamp: startTime,
      bot_id: botId,
      action_type: 'PAUSE',
      severity: severity,
      trigger_reason: reason,
      action_parameters: {
        duration_minutes: durationMinutes,
        emergency_contact: severity === 'CRITICAL'
      },
      action_status: 'PENDING',
      auto_executed: true
    };

    try {
      // Execute the pause
      const success = waidesKISentinelWatchdog.pauseBot(botId);
      
      if (success) {
        guardianAction.action_status = 'ACTIVE';
        
        // Set up automatic resume if duration is specified
        if (durationMinutes > 0) {
          setTimeout(() => {
            this.resumeBot(botId, 'Automatic resume after cooldown period');
          }, durationMinutes * 60 * 1000);
        }

        // Send alert
        await waidesKIRiskAlertEngine.sendAlert({
          bot_id: botId,
          alert_type: 'EMERGENCY_STOP',
          severity: severity,
          custom_message: `Bot ${botId} has been paused by Guardian: ${reason}. Duration: ${durationMinutes} minutes.`,
          recommended_action: 'Review and resume when safe'
        });

        this.guardianStatistics.actions_by_type.pause++;
        this.guardianStatistics.total_actions_executed++;

        waidesKIDailyReporter.recordLesson(
          `Guardian paused bot ${botId}: ${reason}`,
          'GUARDIAN',
          'HIGH',
          'Guardian Adjuster'
        );
      } else {
        guardianAction.action_status = 'FAILED';
      }

    } catch (error) {
      console.error(`Error pausing bot ${botId}:`, error);
      guardianAction.action_status = 'FAILED';
    }

    this.guardianActions.push(guardianAction);
    this.maintainActionHistory();

    return guardianAction;
  }

  async applyCooldown(
    botId: string,
    cooldownType: CooldownPeriod['cooldown_type'],
    durationMinutes: number,
    reason: string
  ): Promise<GuardianAction> {
    const actionId = this.generateActionId();

    const guardianAction: GuardianAction = {
      action_id: actionId,
      timestamp: Date.now(),
      bot_id: botId,
      action_type: 'COOLDOWN',
      severity: 'MEDIUM',
      trigger_reason: reason,
      action_parameters: {
        duration_minutes: durationMinutes,
        cooldown_until: Date.now() + (durationMinutes * 60 * 1000)
      },
      action_status: 'PENDING',
      auto_executed: true
    };

    try {
      const cooldownPeriod: CooldownPeriod = {
        bot_id: botId,
        cooldown_type: cooldownType,
        start_time: Date.now(),
        end_time: Date.now() + (durationMinutes * 60 * 1000),
        remaining_minutes: durationMinutes,
        can_override: cooldownType !== 'EMERGENCY_PAUSE',
        override_conditions: [
          'Manual admin intervention',
          'Risk level drops below 0.3',
          'Market conditions change significantly'
        ]
      };

      this.activeCooldowns.set(botId, cooldownPeriod);
      guardianAction.action_status = 'ACTIVE';

      // Send alert
      await waidesKIRiskAlertEngine.sendAlert({
        bot_id: botId,
        alert_type: 'OVERTRADING',
        severity: 'MEDIUM',
        custom_message: `Cooldown applied to bot ${botId}: ${reason}. Duration: ${durationMinutes} minutes.`,
        recommended_action: 'Wait for cooldown to complete'
      });

      this.guardianStatistics.actions_by_type.cooldown++;
      this.guardianStatistics.total_actions_executed++;

      waidesKIDailyReporter.recordLesson(
        `Guardian applied ${durationMinutes}min cooldown to bot ${botId}: ${reason}`,
        'GUARDIAN',
        'MEDIUM',
        'Guardian Adjuster'
      );

    } catch (error) {
      console.error(`Error applying cooldown to bot ${botId}:`, error);
      guardianAction.action_status = 'FAILED';
    }

    this.guardianActions.push(guardianAction);
    return guardianAction;
  }

  async emergencyStopBot(
    botId: string,
    reason: string,
    requireManualResume: boolean = true
  ): Promise<GuardianAction> {
    const actionId = this.generateActionId();

    const guardianAction: GuardianAction = {
      action_id: actionId,
      timestamp: Date.now(),
      bot_id: botId,
      action_type: 'EMERGENCY_STOP',
      severity: 'CRITICAL',
      trigger_reason: reason,
      action_parameters: {
        emergency_contact: true,
        duration_minutes: requireManualResume ? -1 : 60 // -1 means manual resume required
      },
      action_status: 'PENDING',
      auto_executed: true
    };

    try {
      // Force pause the bot
      const success = waidesKISentinelWatchdog.pauseBot(botId);
      
      if (success) {
        guardianAction.action_status = 'ACTIVE';

        // Apply emergency cooldown
        await this.applyCooldown(botId, 'EMERGENCY_PAUSE', requireManualResume ? 1440 : 60, reason); // 24 hours or 1 hour

        // Send critical alert
        await waidesKIRiskAlertEngine.sendAlert({
          bot_id: botId,
          alert_type: 'EMERGENCY_STOP',
          severity: 'CRITICAL',
          custom_message: `EMERGENCY STOP executed for bot ${botId}: ${reason}. Manual intervention required.`,
          recommended_action: 'Immediate review and manual restart required'
        });

        this.guardianStatistics.actions_by_type.emergency_stop++;
        this.guardianStatistics.emergency_interventions++;
        this.guardianStatistics.total_actions_executed++;

        waidesKIDailyReporter.recordLesson(
          `Guardian EMERGENCY STOP for bot ${botId}: ${reason}`,
          'GUARDIAN',
          'CRITICAL',
          'Guardian Adjuster'
        );
      } else {
        guardianAction.action_status = 'FAILED';
      }

    } catch (error) {
      console.error(`Error emergency stopping bot ${botId}:`, error);
      guardianAction.action_status = 'FAILED';
    }

    this.guardianActions.push(guardianAction);
    return guardianAction;
  }

  async reducePosition(
    botId: string,
    reductionPercent: number,
    reason: string,
    durationMinutes: number = 120
  ): Promise<GuardianAction> {
    const actionId = this.generateActionId();

    const guardianAction: GuardianAction = {
      action_id: actionId,
      timestamp: Date.now(),
      bot_id: botId,
      action_type: 'REDUCE_POSITION',
      severity: 'MEDIUM',
      trigger_reason: reason,
      action_parameters: {
        position_reduction_percent: reductionPercent,
        duration_minutes: durationMinutes
      },
      action_status: 'PENDING',
      auto_executed: true
    };

    try {
      // Create position adjustment
      const adjustment: PositionAdjustment = {
        bot_id: botId,
        adjustment_type: 'SIZE_REDUCTION',
        original_parameters: { position_size: 100 }, // Would get from bot configuration
        adjusted_parameters: { position_size: 100 - reductionPercent },
        adjustment_factor: reductionPercent / 100,
        duration_minutes: durationMinutes,
        auto_revert: true,
        effectiveness_tracking: {
          trades_before: 0,
          trades_after: 0,
          performance_before: 0,
          performance_after: 0
        }
      };

      this.activeAdjustments.set(botId, adjustment);
      guardianAction.action_status = 'ACTIVE';

      // Send alert
      await waidesKIRiskAlertEngine.sendAlert({
        bot_id: botId,
        alert_type: 'RISK_WARNING',
        severity: 'MEDIUM',
        custom_message: `Position size reduced by ${reductionPercent}% for bot ${botId}: ${reason}`,
        recommended_action: 'Monitor performance with reduced position size'
      });

      this.guardianStatistics.actions_by_type.position_reduction++;
      this.guardianStatistics.total_actions_executed++;

      // Set up automatic reversion
      setTimeout(() => {
        this.revertPositionAdjustment(botId);
      }, durationMinutes * 60 * 1000);

      waidesKIDailyReporter.recordLesson(
        `Guardian reduced position size by ${reductionPercent}% for bot ${botId}: ${reason}`,
        'GUARDIAN',
        'MEDIUM',
        'Guardian Adjuster'
      );

    } catch (error) {
      console.error(`Error reducing position for bot ${botId}:`, error);
      guardianAction.action_status = 'FAILED';
    }

    this.guardianActions.push(guardianAction);
    return guardianAction;
  }

  async adjustTradingFrequency(
    botId: string,
    newFrequencyLimit: number,
    reason: string,
    durationMinutes: number = 240
  ): Promise<GuardianAction> {
    const actionId = this.generateActionId();

    const guardianAction: GuardianAction = {
      action_id: actionId,
      timestamp: Date.now(),
      bot_id: botId,
      action_type: 'ADJUST_FREQUENCY',
      severity: 'LOW',
      trigger_reason: reason,
      action_parameters: {
        new_frequency_limit: newFrequencyLimit,
        duration_minutes: durationMinutes
      },
      action_status: 'PENDING',
      auto_executed: true
    };

    try {
      // Create frequency adjustment
      const adjustment: PositionAdjustment = {
        bot_id: botId,
        adjustment_type: 'FREQUENCY_LIMIT',
        original_parameters: { max_trades_per_hour: 10 }, // Would get from bot configuration
        adjusted_parameters: { max_trades_per_hour: newFrequencyLimit },
        adjustment_factor: newFrequencyLimit / 10,
        duration_minutes: durationMinutes,
        auto_revert: true,
        effectiveness_tracking: {
          trades_before: 0,
          trades_after: 0,
          performance_before: 0,
          performance_after: 0
        }
      };

      this.activeAdjustments.set(`${botId}_frequency`, adjustment);
      guardianAction.action_status = 'ACTIVE';

      // Send alert
      await waidesKIRiskAlertEngine.sendAlert({
        bot_id: botId,
        alert_type: 'OVERTRADING',
        severity: 'LOW',
        custom_message: `Trading frequency limited to ${newFrequencyLimit} trades/hour for bot ${botId}: ${reason}`,
        recommended_action: 'Monitor trading behavior with frequency limits'
      });

      this.guardianStatistics.actions_by_type.frequency_adjustment++;
      this.guardianStatistics.total_actions_executed++;

      waidesKIDailyReporter.recordLesson(
        `Guardian limited trading frequency to ${newFrequencyLimit}/hour for bot ${botId}: ${reason}`,
        'GUARDIAN',
        'LOW',
        'Guardian Adjuster'
      );

    } catch (error) {
      console.error(`Error adjusting frequency for bot ${botId}:`, error);
      guardianAction.action_status = 'FAILED';
    }

    this.guardianActions.push(guardianAction);
    return guardianAction;
  }

  // RECOVERY AND RESTORATION
  async resumeBot(botId: string, reason: string): Promise<boolean> {
    try {
      const success = waidesKISentinelWatchdog.resumeBot(botId);
      
      if (success) {
        // Remove cooldowns
        this.activeCooldowns.delete(botId);
        
        // Mark related actions as completed
        this.guardianActions
          .filter(action => action.bot_id === botId && action.action_status === 'ACTIVE')
          .forEach(action => {
            action.action_status = 'COMPLETED';
            action.completion_time = Date.now();
          });

        this.guardianStatistics.auto_recoveries++;

        waidesKIDailyReporter.recordLesson(
          `Guardian resumed bot ${botId}: ${reason}`,
          'GUARDIAN',
          'MEDIUM',
          'Guardian Adjuster'
        );

        return true;
      }
    } catch (error) {
      console.error(`Error resuming bot ${botId}:`, error);
    }
    
    return false;
  }

  private revertPositionAdjustment(botId: string): void {
    const adjustment = this.activeAdjustments.get(botId);
    if (adjustment && adjustment.auto_revert) {
      this.activeAdjustments.delete(botId);
      
      waidesKIDailyReporter.recordLesson(
        `Guardian reverted position adjustment for bot ${botId}`,
        'GUARDIAN',
        'LOW',
        'Guardian Adjuster'
      );
    }
  }

  // MONITORING AND MAINTENANCE
  private updateCooldowns(): void {
    const now = Date.now();
    
    for (const [botId, cooldown] of this.activeCooldowns.entries()) {
      cooldown.remaining_minutes = Math.max(0, (cooldown.end_time - now) / (60 * 1000));
      
      if (cooldown.remaining_minutes <= 0) {
        // Cooldown expired - auto resume if allowed
        if (cooldown.cooldown_type !== 'EMERGENCY_PAUSE') {
          this.resumeBot(botId, 'Cooldown period completed');
        }
        this.activeCooldowns.delete(botId);
      }
    }
  }

  private updateAdjustments(): void {
    const now = Date.now();
    
    for (const [adjustmentId, adjustment] of this.activeAdjustments.entries()) {
      const elapsedMinutes = (now - adjustment.duration_minutes) / (60 * 1000);
      
      if (elapsedMinutes >= adjustment.duration_minutes && adjustment.auto_revert) {
        this.activeAdjustments.delete(adjustmentId);
      }
    }
  }

  private checkAutoRecoveries(): void {
    // Check if any bots can be automatically recovered based on improved conditions
    for (const [botId, cooldown] of this.activeCooldowns.entries()) {
      if (cooldown.can_override) {
        const botData = waidesKISentinelWatchdog.getBotMonitoringData(botId);
        
        if (botData && botData.risk_level < 0.3 && botData.emotional_state === 'STABLE') {
          this.resumeBot(botId, 'Auto-recovery: risk conditions improved');
        }
      }
    }
  }

  private maintainActionHistory(): void {
    if (this.guardianActions.length > this.maxActionHistory) {
      this.guardianActions = this.guardianActions.slice(-this.maxActionHistory);
    }
  }

  private generateActionId(): string {
    return `GUARDIAN_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  // PUBLIC INTERFACE METHODS
  getGuardianActions(limit: number = 100): GuardianAction[] {
    return this.guardianActions.slice(-limit).reverse();
  }

  getActiveCooldowns(): CooldownPeriod[] {
    return Array.from(this.activeCooldowns.values());
  }

  getActiveAdjustments(): PositionAdjustment[] {
    return Array.from(this.activeAdjustments.values());
  }

  getGuardianStatistics(): GuardianStatistics {
    // Update current statistics
    this.guardianStatistics.bots_currently_protected = this.activeCooldowns.size + this.activeAdjustments.size;
    
    return { ...this.guardianStatistics };
  }

  getCooldownStatus(botId: string): CooldownPeriod | null {
    return this.activeCooldowns.get(botId) || null;
  }

  canBotTrade(botId: string): { allowed: boolean; reason?: string; remaining_minutes?: number } {
    const cooldown = this.activeCooldowns.get(botId);
    
    if (cooldown) {
      return {
        allowed: false,
        reason: `Bot is in ${cooldown.cooldown_type} cooldown`,
        remaining_minutes: cooldown.remaining_minutes
      };
    }

    return { allowed: true };
  }

  overrideCooldown(botId: string, adminReason: string): boolean {
    const cooldown = this.activeCooldowns.get(botId);
    
    if (cooldown && cooldown.can_override) {
      this.activeCooldowns.delete(botId);
      this.guardianStatistics.manual_overrides++;
      
      waidesKIDailyReporter.recordLesson(
        `Guardian cooldown overridden for bot ${botId}: ${adminReason}`,
        'GUARDIAN',
        'HIGH',
        'Guardian Adjuster'
      );
      
      return true;
    }
    
    return false;
  }

  enableGuardian(): void {
    this.isGuardianActive = true;
    
    waidesKIDailyReporter.logEmotionalState(
      'PROTECTIVE',
      'Guardian adjuster activated - comprehensive bot protection enabled',
      'Guardian Activation',
      95
    );
  }

  disableGuardian(): void {
    this.isGuardianActive = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    waidesKIDailyReporter.logEmotionalState(
      'NEUTRAL',
      'Guardian adjuster deactivated - manual protection required',
      'Guardian Deactivation',
      70
    );
  }

  exportGuardianData(): any {
    return {
      guardian_statistics: this.getGuardianStatistics(),
      guardian_actions: this.getGuardianActions(500),
      active_cooldowns: this.getActiveCooldowns(),
      active_adjustments: this.getActiveAdjustments(),
      guardian_config: {
        is_active: this.isGuardianActive,
        max_action_history: this.maxActionHistory
      },
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKIGuardianAdjuster = new WaidesKIGuardianAdjuster();