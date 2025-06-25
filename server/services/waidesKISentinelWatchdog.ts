import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKILiveFeed } from './waidesKILiveFeed';

interface BotRegistration {
  bot_id: string;
  registration_time: number;
  bot_type: 'EXTERNAL_API' | 'MOBILE_APP' | 'WEB_DASHBOARD' | 'THIRD_PARTY' | 'INTERNAL';
  platform_name: string;
  api_key: string;
  last_heartbeat: number;
  permissions: string[];
  risk_profile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  status: 'ACTIVE' | 'PAUSED' | 'SUSPENDED' | 'OFFLINE';
}

interface BotMonitoringData {
  bot_id: string;
  last_pnl: number;
  risk_level: number; // 0.0 - 1.0
  consecutive_losses: number;
  total_trades_today: number;
  drawdown_percentage: number;
  last_trade_time: number;
  emotional_state: 'STABLE' | 'PANIC' | 'GREEDY' | 'FEARFUL' | 'REVENGE';
  trading_frequency: number; // trades per hour
  risk_indicators: {
    overtrading: boolean;
    panic_selling: boolean;
    revenge_trading: boolean;
    ignoring_signals: boolean;
    capital_at_risk: number;
  };
  performance_metrics: {
    win_rate: number;
    avg_trade_duration: number;
    largest_loss: number;
    position_sizing_violation: boolean;
  };
  sentinel_warnings: string[];
  protection_level: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM';
}

interface SentinelAlert {
  alert_id: string;
  timestamp: number;
  bot_id: string;
  alert_type: 'RISK_WARNING' | 'EMERGENCY_STOP' | 'OVERTRADING' | 'PANIC_DETECTED' | 'PERFORMANCE_DECLINE' | 'API_ABUSE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  recommended_action: 'MONITOR' | 'PAUSE' | 'COOLDOWN' | 'EMERGENCY_STOP' | 'REDUCE_POSITION';
  auto_action_taken: boolean;
  alert_status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED';
}

interface SentinelStatistics {
  total_registered_bots: number;
  active_monitoring_sessions: number;
  total_alerts_sent: number;
  emergency_interventions: number;
  bots_saved_from_loss: number;
  average_risk_level: number;
  most_risky_bot: string;
  protection_success_rate: number;
  sentinel_uptime_hours: number;
  last_scan_time: number;
  scanning_frequency_minutes: number;
  total_protected_capital: number;
}

export class WaidesKISentinelWatchdog {
  private registeredBots: Map<string, BotRegistration> = new Map();
  private monitoringData: Map<string, BotMonitoringData> = new Map();
  private alertHistory: SentinelAlert[] = [];
  private sentinelStatistics: SentinelStatistics = {
    total_registered_bots: 0,
    active_monitoring_sessions: 0,
    total_alerts_sent: 0,
    emergency_interventions: 0,
    bots_saved_from_loss: 0,
    average_risk_level: 0,
    most_risky_bot: '',
    protection_success_rate: 95,
    sentinel_uptime_hours: 0,
    last_scan_time: 0,
    scanning_frequency_minutes: 5,
    total_protected_capital: 0
  };

  private isSentinelActive: boolean = true;
  private scanInterval: NodeJS.Timeout | null = null;
  private maxAlertHistory: number = 1000;
  private sentinelStartTime: number = Date.now();

  constructor() {
    this.startSentinelScanning();
  }

  private startSentinelScanning(): void {
    // Main sentinel scan every 5 minutes
    this.scanInterval = setInterval(() => {
      if (this.isSentinelActive) {
        this.performSentinelScan();
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Initial scan after 30 seconds
    setTimeout(() => {
      if (this.isSentinelActive) {
        this.performSentinelScan();
      }
    }, 30000);
  }

  // BOT REGISTRATION AND MANAGEMENT
  registerBot(registration: {
    bot_id: string;
    bot_type: BotRegistration['bot_type'];
    platform_name: string;
    api_key: string;
    permissions?: string[];
    risk_profile?: BotRegistration['risk_profile'];
  }): BotRegistration {
    const botRegistration: BotRegistration = {
      bot_id: registration.bot_id,
      registration_time: Date.now(),
      bot_type: registration.bot_type,
      platform_name: registration.platform_name,
      api_key: registration.api_key,
      last_heartbeat: Date.now(),
      permissions: registration.permissions || ['BASIC_TRADING'],
      risk_profile: registration.risk_profile || 'MODERATE',
      status: 'ACTIVE'
    };

    this.registeredBots.set(registration.bot_id, botRegistration);

    // Initialize monitoring data
    this.monitoringData.set(registration.bot_id, this.createInitialMonitoringData(registration.bot_id));

    this.sentinelStatistics.total_registered_bots++;

    waidesKIDailyReporter.recordLesson(
      `New bot registered for sentinel protection: ${registration.bot_id} (${registration.platform_name})`,
      'SENTINEL',
      'MEDIUM',
      'Sentinel Watchdog'
    );

    return botRegistration;
  }

  private createInitialMonitoringData(botId: string): BotMonitoringData {
    return {
      bot_id: botId,
      last_pnl: 0,
      risk_level: 0.1,
      consecutive_losses: 0,
      total_trades_today: 0,
      drawdown_percentage: 0,
      last_trade_time: 0,
      emotional_state: 'STABLE',
      trading_frequency: 0,
      risk_indicators: {
        overtrading: false,
        panic_selling: false,
        revenge_trading: false,
        ignoring_signals: false,
        capital_at_risk: 0
      },
      performance_metrics: {
        win_rate: 0,
        avg_trade_duration: 0,
        largest_loss: 0,
        position_sizing_violation: false
      },
      sentinel_warnings: [],
      protection_level: 'MEDIUM'
    };
  }

  updateBotHeartbeat(botId: string): boolean {
    const bot = this.registeredBots.get(botId);
    if (bot) {
      bot.last_heartbeat = Date.now();
      return true;
    }
    return false;
  }

  updateBotTradingData(botId: string, tradingData: {
    pnl?: number;
    trade_result?: 'WIN' | 'LOSS';
    position_size?: number;
    trade_duration?: number;
    market_conditions?: any;
  }): void {
    const monitoringData = this.monitoringData.get(botId);
    if (!monitoringData) return;

    // Update basic metrics
    if (tradingData.pnl !== undefined) {
      monitoringData.last_pnl = tradingData.pnl;
      
      if (tradingData.pnl < monitoringData.drawdown_percentage) {
        monitoringData.drawdown_percentage = tradingData.pnl;
      }
    }

    // Update trade results
    if (tradingData.trade_result) {
      monitoringData.total_trades_today++;
      monitoringData.last_trade_time = Date.now();

      if (tradingData.trade_result === 'LOSS') {
        monitoringData.consecutive_losses++;
      } else {
        monitoringData.consecutive_losses = 0;
      }
    }

    // Recalculate risk level and emotional state
    monitoringData.risk_level = this.calculateBotRiskLevel(monitoringData);
    monitoringData.emotional_state = this.detectEmotionalState(monitoringData);

    // Update risk indicators
    this.updateRiskIndicators(monitoringData);

    // Check for alerts
    this.checkForRiskAlerts(botId, monitoringData);
  }

  private calculateBotRiskLevel(data: BotMonitoringData): number {
    let riskScore = 0;

    // P&L based risk (40% weight)
    if (data.last_pnl < -10) riskScore += 0.4;
    else if (data.last_pnl < -5) riskScore += 0.25;
    else if (data.last_pnl < -2) riskScore += 0.1;

    // Consecutive losses (25% weight)
    if (data.consecutive_losses >= 5) riskScore += 0.25;
    else if (data.consecutive_losses >= 3) riskScore += 0.15;
    else if (data.consecutive_losses >= 2) riskScore += 0.05;

    // Drawdown (20% weight)
    if (data.drawdown_percentage < -15) riskScore += 0.2;
    else if (data.drawdown_percentage < -10) riskScore += 0.12;
    else if (data.drawdown_percentage < -5) riskScore += 0.05;

    // Trading frequency (15% weight)
    if (data.trading_frequency > 10) riskScore += 0.15; // More than 10 trades per hour
    else if (data.trading_frequency > 5) riskScore += 0.08;

    return Math.min(1.0, Math.max(0.0, riskScore));
  }

  private detectEmotionalState(data: BotMonitoringData): BotMonitoringData['emotional_state'] {
    // Panic state detection
    if (data.consecutive_losses >= 3 && data.last_pnl < -5) {
      return 'PANIC';
    }

    // Revenge trading detection
    if (data.consecutive_losses >= 2 && data.trading_frequency > 5) {
      return 'REVENGE';
    }

    // Greed detection
    if (data.last_pnl > 10 && data.trading_frequency > 8) {
      return 'GREEDY';
    }

    // Fear detection
    if (data.drawdown_percentage < -8 && data.total_trades_today === 0) {
      return 'FEARFUL';
    }

    return 'STABLE';
  }

  private updateRiskIndicators(data: BotMonitoringData): void {
    // Overtrading detection
    data.risk_indicators.overtrading = data.trading_frequency > 6; // More than 6 trades per hour

    // Panic selling detection
    data.risk_indicators.panic_selling = data.consecutive_losses >= 3 && data.last_pnl < -5;

    // Revenge trading detection
    data.risk_indicators.revenge_trading = data.consecutive_losses >= 2 && data.trading_frequency > 4;

    // Ignoring signals detection (simplified)
    data.risk_indicators.ignoring_signals = data.risk_level > 0.7 && data.total_trades_today > 10;

    // Capital at risk calculation
    data.risk_indicators.capital_at_risk = Math.abs(data.drawdown_percentage) + (data.consecutive_losses * 2);
  }

  // SENTINEL SCANNING AND MONITORING
  private async performSentinelScan(): Promise<void> {
    try {
      const riskyBots: Array<{ bot_id: string; risk_level: number }> = [];
      let totalRisk = 0;
      let activeSessionsCount = 0;

      for (const [botId, monitoringData] of this.monitoringData.entries()) {
        const bot = this.registeredBots.get(botId);
        if (!bot || bot.status !== 'ACTIVE') continue;

        activeSessionsCount++;
        totalRisk += monitoringData.risk_level;

        // Check if bot is offline (no heartbeat in 30 minutes)
        if (Date.now() - bot.last_heartbeat > 30 * 60 * 1000) {
          bot.status = 'OFFLINE';
          continue;
        }

        // Identify risky bots
        if (monitoringData.risk_level >= 0.7) {
          riskyBots.push({ bot_id: botId, risk_level: monitoringData.risk_level });
        }

        // Update trading frequency
        const hoursAgo = (Date.now() - (Date.now() - 60 * 60 * 1000)) / (60 * 60 * 1000);
        monitoringData.trading_frequency = monitoringData.total_trades_today / Math.max(1, hoursAgo);
      }

      // Update statistics
      this.sentinelStatistics.active_monitoring_sessions = activeSessionsCount;
      this.sentinelStatistics.average_risk_level = activeSessionsCount > 0 ? totalRisk / activeSessionsCount : 0;
      this.sentinelStatistics.last_scan_time = Date.now();
      this.sentinelStatistics.sentinel_uptime_hours = (Date.now() - this.sentinelStartTime) / (60 * 60 * 1000);

      // Find most risky bot
      if (riskyBots.length > 0) {
        const mostRisky = riskyBots.reduce((prev, current) => 
          current.risk_level > prev.risk_level ? current : prev
        );
        this.sentinelStatistics.most_risky_bot = mostRisky.bot_id;
      }

      // Process risky bots
      for (const riskyBot of riskyBots) {
        await this.handleRiskyBot(riskyBot.bot_id, riskyBot.risk_level);
      }

      waidesKIDailyReporter.recordLesson(
        `Sentinel scan completed: ${activeSessionsCount} bots monitored, ${riskyBots.length} risky situations detected`,
        'SENTINEL',
        riskyBots.length > 0 ? 'HIGH' : 'LOW',
        'Sentinel Watchdog'
      );

    } catch (error) {
      console.error('Error in sentinel scanning:', error);
    }
  }

  private async handleRiskyBot(botId: string, riskLevel: number): Promise<void> {
    const monitoringData = this.monitoringData.get(botId);
    const bot = this.registeredBots.get(botId);
    
    if (!monitoringData || !bot) return;

    // Determine action based on risk level and current state
    let action: 'MONITOR' | 'PAUSE' | 'COOLDOWN' | 'EMERGENCY_STOP' | 'REDUCE_POSITION' = 'MONITOR';
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

    if (riskLevel >= 0.9) {
      action = 'EMERGENCY_STOP';
      severity = 'CRITICAL';
    } else if (riskLevel >= 0.8) {
      action = 'PAUSE';
      severity = 'HIGH';
    } else if (riskLevel >= 0.7) {
      action = 'COOLDOWN';
      severity = 'MEDIUM';
    }

    // Create alert
    const alert = this.createAlert(botId, action, severity, monitoringData);
    
    // Execute protective action if needed
    if (action !== 'MONITOR') {
      await this.executeProtectiveAction(botId, action);
    }
  }

  private checkForRiskAlerts(botId: string, data: BotMonitoringData): void {
    const alerts: string[] = [];

    // Check for various risk conditions
    if (data.risk_indicators.overtrading) {
      alerts.push('Overtrading detected - reduce trading frequency');
    }

    if (data.risk_indicators.panic_selling) {
      alerts.push('Panic selling pattern detected - emotional override recommended');
    }

    if (data.risk_indicators.revenge_trading) {
      alerts.push('Revenge trading pattern detected - cooling off period needed');
    }

    if (data.drawdown_percentage < -10) {
      alerts.push('Significant drawdown detected - risk management review required');
    }

    if (data.consecutive_losses >= 4) {
      alerts.push('Extended losing streak - strategy reassessment needed');
    }

    // Update warnings and create alerts if needed
    data.sentinel_warnings = alerts;
    
    if (alerts.length > 0) {
      this.createAlert(botId, 'MONITOR', 'MEDIUM', data);
    }
  }

  // ALERT MANAGEMENT
  private createAlert(
    botId: string, 
    action: SentinelAlert['recommended_action'], 
    severity: SentinelAlert['severity'],
    monitoringData: BotMonitoringData
  ): SentinelAlert {
    const alertId = this.generateAlertId();
    
    let alertType: SentinelAlert['alert_type'] = 'RISK_WARNING';
    let message = '';

    switch (monitoringData.emotional_state) {
      case 'PANIC':
        alertType = 'PANIC_DETECTED';
        message = `Panic trading detected for bot ${botId} - immediate intervention required`;
        break;
      case 'REVENGE':
        alertType = 'OVERTRADING';
        message = `Revenge trading pattern detected for bot ${botId} - cooling off needed`;
        break;
      default:
        message = `Risk level elevated for bot ${botId} - monitoring increased`;
    }

    const alert: SentinelAlert = {
      alert_id: alertId,
      timestamp: Date.now(),
      bot_id: botId,
      alert_type: alertType,
      severity: severity,
      message: message,
      recommended_action: action,
      auto_action_taken: action !== 'MONITOR',
      alert_status: 'ACTIVE'
    };

    this.alertHistory.push(alert);
    this.sentinelStatistics.total_alerts_sent++;

    // Maintain alert history size
    if (this.alertHistory.length > this.maxAlertHistory) {
      this.alertHistory = this.alertHistory.slice(-this.maxAlertHistory);
    }

    waidesKIDailyReporter.recordLesson(
      `Sentinel alert created: ${alert.message}`,
      'SENTINEL',
      severity,
      'Sentinel Watchdog'
    );

    return alert;
  }

  private async executeProtectiveAction(botId: string, action: SentinelAlert['recommended_action']): Promise<void> {
    const bot = this.registeredBots.get(botId);
    if (!bot) return;

    try {
      switch (action) {
        case 'PAUSE':
          bot.status = 'PAUSED';
          this.sentinelStatistics.emergency_interventions++;
          break;
        
        case 'EMERGENCY_STOP':
          bot.status = 'SUSPENDED';
          this.sentinelStatistics.emergency_interventions++;
          this.sentinelStatistics.bots_saved_from_loss++;
          break;
        
        case 'COOLDOWN':
          // Implement cooldown logic - bot can resume after 15 minutes
          setTimeout(() => {
            if (bot.status === 'PAUSED') {
              bot.status = 'ACTIVE';
            }
          }, 15 * 60 * 1000);
          bot.status = 'PAUSED';
          break;
        
        case 'REDUCE_POSITION':
          // Signal to reduce position size (implementation depends on bot capabilities)
          break;
      }

      waidesKIDailyReporter.recordLesson(
        `Protective action executed: ${action} for bot ${botId}`,
        'SENTINEL',
        'HIGH',
        'Sentinel Watchdog'
      );

    } catch (error) {
      console.error(`Error executing protective action for bot ${botId}:`, error);
    }
  }

  private generateAlertId(): string {
    return `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  // PUBLIC INTERFACE METHODS
  getAllRegisteredBots(): BotRegistration[] {
    return Array.from(this.registeredBots.values());
  }

  getBotMonitoringData(botId: string): BotMonitoringData | null {
    return this.monitoringData.get(botId) || null;
  }

  getAllMonitoringData(): BotMonitoringData[] {
    return Array.from(this.monitoringData.values());
  }

  getActiveAlerts(): SentinelAlert[] {
    return this.alertHistory.filter(alert => alert.alert_status === 'ACTIVE');
  }

  getAlertHistory(limit: number = 100): SentinelAlert[] {
    return this.alertHistory.slice(-limit).reverse();
  }

  getSentinelStatistics(): SentinelStatistics {
    return { ...this.sentinelStatistics };
  }

  getRiskyBots(): Array<{ bot_id: string; risk_level: number; emotional_state: string }> {
    return Array.from(this.monitoringData.values())
      .filter(data => data.risk_level >= 0.6)
      .map(data => ({
        bot_id: data.bot_id,
        risk_level: data.risk_level,
        emotional_state: data.emotional_state
      }))
      .sort((a, b) => b.risk_level - a.risk_level);
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alertHistory.find(a => a.alert_id === alertId);
    if (alert) {
      alert.alert_status = 'ACKNOWLEDGED';
      return true;
    }
    return false;
  }

  unregisterBot(botId: string): boolean {
    const success = this.registeredBots.delete(botId) && this.monitoringData.delete(botId);
    if (success) {
      this.sentinelStatistics.total_registered_bots = Math.max(0, this.sentinelStatistics.total_registered_bots - 1);
    }
    return success;
  }

  pauseBot(botId: string): boolean {
    const bot = this.registeredBots.get(botId);
    if (bot) {
      bot.status = 'PAUSED';
      return true;
    }
    return false;
  }

  resumeBot(botId: string): boolean {
    const bot = this.registeredBots.get(botId);
    if (bot && bot.status === 'PAUSED') {
      bot.status = 'ACTIVE';
      return true;
    }
    return false;
  }

  enableSentinel(): void {
    this.isSentinelActive = true;
    
    waidesKIDailyReporter.logEmotionalState(
      'FOCUSED',
      'Sentinel watchdog activated - comprehensive bot monitoring enabled',
      'Sentinel Activation',
      95
    );
  }

  disableSentinel(): void {
    this.isSentinelActive = false;
    
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    
    waidesKIDailyReporter.logEmotionalState(
      'NEUTRAL',
      'Sentinel watchdog deactivated - manual monitoring required',
      'Sentinel Deactivation',
      70
    );
  }

  async forceSentinelScan(): Promise<void> {
    await this.performSentinelScan();
  }

  exportSentinelData(): any {
    return {
      sentinel_statistics: this.getSentinelStatistics(),
      registered_bots: this.getAllRegisteredBots(),
      monitoring_data: this.getAllMonitoringData(),
      active_alerts: this.getActiveAlerts(),
      alert_history: this.getAlertHistory(200),
      risky_bots: this.getRiskyBots(),
      sentinel_config: {
        is_active: this.isSentinelActive,
        scanning_frequency_minutes: this.sentinelStatistics.scanning_frequency_minutes,
        max_alert_history: this.maxAlertHistory,
        uptime_hours: this.sentinelStatistics.sentinel_uptime_hours
      },
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKISentinelWatchdog = new WaidesKISentinelWatchdog();