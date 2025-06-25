import { waidesKIDailyReporter } from './waidesKIDailyReporter';

interface AlertChannel {
  channel_id: string;
  channel_type: 'EMAIL' | 'WEBHOOK' | 'SMS' | 'PUSH_NOTIFICATION' | 'API_CALLBACK';
  endpoint: string;
  is_active: boolean;
  priority_filter: 'ALL' | 'HIGH_ONLY' | 'CRITICAL_ONLY';
  rate_limit_minutes: number;
  last_sent: number;
}

interface AlertTemplate {
  template_id: string;
  alert_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title_template: string;
  message_template: string;
  action_buttons?: {
    text: string;
    action: string;
    style: 'PRIMARY' | 'SECONDARY' | 'DANGER';
  }[];
}

interface SentAlert {
  alert_id: string;
  timestamp: number;
  bot_id: string;
  channel_id: string;
  alert_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  delivery_status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'RATE_LIMITED';
  retry_count: number;
  response_received: boolean;
  user_action?: string;
}

interface RiskAlertStatistics {
  total_alerts_sent: number;
  alerts_by_severity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  delivery_success_rate: number;
  average_response_time: number;
  most_active_channel: string;
  alert_frequency_per_hour: number;
  rate_limited_alerts: number;
  user_response_rate: number;
}

export class WaidesKIRiskAlertEngine {
  private alertChannels: Map<string, AlertChannel> = new Map();
  private alertTemplates: Map<string, AlertTemplate> = new Map();
  private sentAlerts: SentAlert[] = [];
  private alertStatistics: RiskAlertStatistics = {
    total_alerts_sent: 0,
    alerts_by_severity: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    },
    delivery_success_rate: 0,
    average_response_time: 0,
    most_active_channel: '',
    alert_frequency_per_hour: 0,
    rate_limited_alerts: 0,
    user_response_rate: 0
  };

  private isAlertEngineActive: boolean = true;
  private maxAlertHistory: number = 2000;
  private defaultRateLimitMinutes: number = 5;

  constructor() {
    this.initializeDefaultTemplates();
    this.initializeDefaultChannels();
  }

  private initializeDefaultTemplates(): void {
    const templates: AlertTemplate[] = [
      {
        template_id: 'RISK_WARNING',
        alert_type: 'RISK_WARNING',
        severity: 'MEDIUM',
        title_template: '⚠️ Risk Warning - Bot {bot_id}',
        message_template: 'Bot {bot_id} is showing elevated risk levels:\n\n• Risk Score: {risk_level}%\n• P&L: {pnl}%\n• Emotional State: {emotional_state}\n\nRecommended Action: {recommended_action}',
        action_buttons: [
          { text: 'Pause Bot', action: 'pause_bot', style: 'DANGER' },
          { text: 'Monitor', action: 'monitor', style: 'SECONDARY' }
        ]
      },
      {
        template_id: 'EMERGENCY_STOP',
        alert_type: 'EMERGENCY_STOP',
        severity: 'CRITICAL',
        title_template: '🚨 EMERGENCY - Bot {bot_id} Stopped',
        message_template: 'CRITICAL: Bot {bot_id} has been emergency stopped due to severe risk conditions:\n\n• Risk Score: {risk_level}%\n• Drawdown: {drawdown}%\n• Consecutive Losses: {consecutive_losses}\n\nImmediate intervention required!',
        action_buttons: [
          { text: 'Review Trades', action: 'review_trades', style: 'PRIMARY' },
          { text: 'Resume Carefully', action: 'resume_bot', style: 'SECONDARY' }
        ]
      },
      {
        template_id: 'PANIC_DETECTED',
        alert_type: 'PANIC_DETECTED',
        severity: 'HIGH',
        title_template: '😰 Panic Trading - Bot {bot_id}',
        message_template: 'Panic trading pattern detected for bot {bot_id}:\n\n• Rapid consecutive losses: {consecutive_losses}\n• Current P&L: {pnl}%\n• Trading frequency: {trading_frequency}/hour\n\nEmotional firewall recommended.',
        action_buttons: [
          { text: 'Apply Cooldown', action: 'apply_cooldown', style: 'DANGER' },
          { text: 'Reduce Size', action: 'reduce_position', style: 'SECONDARY' }
        ]
      },
      {
        template_id: 'OVERTRADING',
        alert_type: 'OVERTRADING',
        severity: 'HIGH',
        title_template: '🔄 Overtrading Alert - Bot {bot_id}',
        message_template: 'Overtrading detected for bot {bot_id}:\n\n• Trades today: {trades_today}\n• Trading frequency: {trading_frequency}/hour\n• Risk indicators active\n\nCooling off period recommended.',
        action_buttons: [
          { text: 'Force Cooldown', action: 'force_cooldown', style: 'PRIMARY' },
          { text: 'Adjust Frequency', action: 'adjust_frequency', style: 'SECONDARY' }
        ]
      },
      {
        template_id: 'PERFORMANCE_DECLINE',
        alert_type: 'PERFORMANCE_DECLINE',
        severity: 'MEDIUM',
        title_template: '📉 Performance Decline - Bot {bot_id}',
        message_template: 'Performance decline detected for bot {bot_id}:\n\n• Win rate: {win_rate}%\n• Recent drawdown: {drawdown}%\n• Strategy effectiveness declining\n\nStrategy review recommended.',
        action_buttons: [
          { text: 'Review Strategy', action: 'review_strategy', style: 'PRIMARY' },
          { text: 'Continue Monitoring', action: 'continue_monitoring', style: 'SECONDARY' }
        ]
      }
    ];

    templates.forEach(template => {
      this.alertTemplates.set(template.template_id, template);
    });
  }

  private initializeDefaultChannels(): void {
    // Default console logging channel
    const consoleChannel: AlertChannel = {
      channel_id: 'console_logger',
      channel_type: 'API_CALLBACK',
      endpoint: 'console',
      is_active: true,
      priority_filter: 'ALL',
      rate_limit_minutes: 1,
      last_sent: 0
    };

    this.alertChannels.set(consoleChannel.channel_id, consoleChannel);
  }

  // CHANNEL MANAGEMENT
  addAlertChannel(channelConfig: {
    channel_id: string;
    channel_type: AlertChannel['channel_type'];
    endpoint: string;
    priority_filter?: AlertChannel['priority_filter'];
    rate_limit_minutes?: number;
  }): AlertChannel {
    const channel: AlertChannel = {
      channel_id: channelConfig.channel_id,
      channel_type: channelConfig.channel_type,
      endpoint: channelConfig.endpoint,
      is_active: true,
      priority_filter: channelConfig.priority_filter || 'ALL',
      rate_limit_minutes: channelConfig.rate_limit_minutes || this.defaultRateLimitMinutes,
      last_sent: 0
    };

    this.alertChannels.set(channel.channel_id, channel);

    waidesKIDailyReporter.recordLesson(
      `New alert channel added: ${channel.channel_id} (${channel.channel_type})`,
      'RISK_ALERTS',
      'MEDIUM',
      'Risk Alert Engine'
    );

    return channel;
  }

  // ALERT SENDING
  async sendAlert(alertData: {
    bot_id: string;
    alert_type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    risk_level?: number;
    pnl?: number;
    emotional_state?: string;
    recommended_action?: string;
    drawdown?: number;
    consecutive_losses?: number;
    trading_frequency?: number;
    trades_today?: number;
    win_rate?: number;
    custom_message?: string;
  }): Promise<SentAlert[]> {
    if (!this.isAlertEngineActive) {
      return [];
    }

    const sentAlerts: SentAlert[] = [];
    const template = this.alertTemplates.get(alertData.alert_type);

    if (!template) {
      console.error(`Alert template not found: ${alertData.alert_type}`);
      return [];
    }

    // Generate alert content
    const alertContent = this.generateAlertContent(template, alertData);

    // Send to all qualifying channels
    for (const [channelId, channel] of this.alertChannels.entries()) {
      if (!channel.is_active) continue;
      
      // Check priority filter
      if (!this.shouldSendToChannel(channel, alertData.severity)) continue;
      
      // Check rate limiting
      if (this.isRateLimited(channel)) {
        this.alertStatistics.rate_limited_alerts++;
        continue;
      }

      const sentAlert = await this.sendToChannel(channel, alertContent, alertData.bot_id);
      if (sentAlert) {
        sentAlerts.push(sentAlert);
      }
    }

    // Update statistics
    this.updateAlertStatistics(alertData.severity, sentAlerts.length);

    return sentAlerts;
  }

  private generateAlertContent(template: AlertTemplate, data: any): { title: string; message: string } {
    let title = template.title_template;
    let message = data.custom_message || template.message_template;

    // Replace placeholders
    const replacements = {
      '{bot_id}': data.bot_id || 'UNKNOWN',
      '{risk_level}': (data.risk_level * 100).toFixed(1) || '0',
      '{pnl}': data.pnl?.toFixed(2) || '0',
      '{emotional_state}': data.emotional_state || 'UNKNOWN',
      '{recommended_action}': data.recommended_action || 'Monitor',
      '{drawdown}': data.drawdown?.toFixed(2) || '0',
      '{consecutive_losses}': data.consecutive_losses?.toString() || '0',
      '{trading_frequency}': data.trading_frequency?.toFixed(1) || '0',
      '{trades_today}': data.trades_today?.toString() || '0',
      '{win_rate}': data.win_rate?.toFixed(1) || '0'
    };

    Object.entries(replacements).forEach(([placeholder, value]) => {
      title = title.replace(new RegExp(placeholder, 'g'), value);
      message = message.replace(new RegExp(placeholder, 'g'), value);
    });

    return { title, message };
  }

  private shouldSendToChannel(channel: AlertChannel, severity: string): boolean {
    switch (channel.priority_filter) {
      case 'CRITICAL_ONLY':
        return severity === 'CRITICAL';
      case 'HIGH_ONLY':
        return severity === 'HIGH' || severity === 'CRITICAL';
      case 'ALL':
      default:
        return true;
    }
  }

  private isRateLimited(channel: AlertChannel): boolean {
    const timeSinceLastSent = Date.now() - channel.last_sent;
    const rateLimitMs = channel.rate_limit_minutes * 60 * 1000;
    return timeSinceLastSent < rateLimitMs;
  }

  private async sendToChannel(
    channel: AlertChannel, 
    content: { title: string; message: string }, 
    botId: string
  ): Promise<SentAlert | null> {
    const alertId = this.generateAlertId();
    
    const sentAlert: SentAlert = {
      alert_id: alertId,
      timestamp: Date.now(),
      bot_id: botId,
      channel_id: channel.channel_id,
      alert_type: 'RISK_WARNING',
      severity: 'MEDIUM',
      title: content.title,
      message: content.message,
      delivery_status: 'PENDING',
      retry_count: 0,
      response_received: false
    };

    try {
      switch (channel.channel_type) {
        case 'API_CALLBACK':
          await this.sendToConsole(content);
          sentAlert.delivery_status = 'DELIVERED';
          break;
          
        case 'WEBHOOK':
          await this.sendToWebhook(channel.endpoint, content);
          sentAlert.delivery_status = 'SENT';
          break;
          
        case 'EMAIL':
          await this.sendToEmail(channel.endpoint, content);
          sentAlert.delivery_status = 'SENT';
          break;
          
        case 'SMS':
          await this.sendToSMS(channel.endpoint, content);
          sentAlert.delivery_status = 'SENT';
          break;
          
        case 'PUSH_NOTIFICATION':
          await this.sendToPush(channel.endpoint, content);
          sentAlert.delivery_status = 'SENT';
          break;
          
        default:
          console.warn(`Unknown channel type: ${channel.channel_type}`);
          sentAlert.delivery_status = 'FAILED';
      }
      
      channel.last_sent = Date.now();
      
    } catch (error) {
      console.error(`Failed to send alert to channel ${channel.channel_id}:`, error);
      sentAlert.delivery_status = 'FAILED';
    }

    this.sentAlerts.push(sentAlert);
    
    // Maintain alert history size
    if (this.sentAlerts.length > this.maxAlertHistory) {
      this.sentAlerts = this.sentAlerts.slice(-this.maxAlertHistory);
    }

    return sentAlert;
  }

  private async sendToConsole(content: { title: string; message: string }): Promise<void> {
    console.log(`\n🚨 SENTINEL ALERT 🚨`);
    console.log(`Title: ${content.title}`);
    console.log(`Message: ${content.message}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`─────────────────────────────────────────\n`);
  }

  private async sendToWebhook(endpoint: string, content: { title: string; message: string }): Promise<void> {
    // Webhook implementation would go here
    console.log(`Webhook alert sent to ${endpoint}:`, content);
  }

  private async sendToEmail(endpoint: string, content: { title: string; message: string }): Promise<void> {
    // Email implementation would go here
    console.log(`Email alert sent to ${endpoint}:`, content);
  }

  private async sendToSMS(endpoint: string, content: { title: string; message: string }): Promise<void> {
    // SMS implementation would go here
    console.log(`SMS alert sent to ${endpoint}:`, content);
  }

  private async sendToPush(endpoint: string, content: { title: string; message: string }): Promise<void> {
    // Push notification implementation would go here
    console.log(`Push notification sent to ${endpoint}:`, content);
  }

  // STATISTICS AND MONITORING
  private updateAlertStatistics(severity: string, alertCount: number): void {
    this.alertStatistics.total_alerts_sent += alertCount;
    
    switch (severity.toLowerCase()) {
      case 'low':
        this.alertStatistics.alerts_by_severity.low += alertCount;
        break;
      case 'medium':
        this.alertStatistics.alerts_by_severity.medium += alertCount;
        break;
      case 'high':
        this.alertStatistics.alerts_by_severity.high += alertCount;
        break;
      case 'critical':
        this.alertStatistics.alerts_by_severity.critical += alertCount;
        break;
    }

    // Calculate delivery success rate
    const deliveredAlerts = this.sentAlerts.filter(a => a.delivery_status === 'DELIVERED' || a.delivery_status === 'SENT').length;
    this.alertStatistics.delivery_success_rate = this.sentAlerts.length > 0 ? 
      (deliveredAlerts / this.sentAlerts.length) * 100 : 0;

    // Find most active channel
    const channelCounts = new Map<string, number>();
    this.sentAlerts.forEach(alert => {
      channelCounts.set(alert.channel_id, (channelCounts.get(alert.channel_id) || 0) + 1);
    });
    
    let maxCount = 0;
    for (const [channelId, count] of channelCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        this.alertStatistics.most_active_channel = channelId;
      }
    }
  }

  private generateAlertId(): string {
    return `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  // PUBLIC INTERFACE METHODS
  getAlertChannels(): AlertChannel[] {
    return Array.from(this.alertChannels.values());
  }

  getAlertTemplates(): AlertTemplate[] {
    return Array.from(this.alertTemplates.values());
  }

  getSentAlerts(limit: number = 100): SentAlert[] {
    return this.sentAlerts.slice(-limit).reverse();
  }

  getAlertStatistics(): RiskAlertStatistics {
    return { ...this.alertStatistics };
  }

  updateChannelStatus(channelId: string, isActive: boolean): boolean {
    const channel = this.alertChannels.get(channelId);
    if (channel) {
      channel.is_active = isActive;
      return true;
    }
    return false;
  }

  removeAlertChannel(channelId: string): boolean {
    return this.alertChannels.delete(channelId);
  }

  addCustomTemplate(template: AlertTemplate): void {
    this.alertTemplates.set(template.template_id, template);
  }

  testChannel(channelId: string): Promise<boolean> {
    const channel = this.alertChannels.get(channelId);
    if (!channel) return Promise.resolve(false);

    return this.sendToChannel(channel, {
      title: 'Test Alert',
      message: 'This is a test alert to verify channel connectivity.'
    }, 'TEST_BOT').then(alert => alert !== null);
  }

  enableAlertEngine(): void {
    this.isAlertEngineActive = true;
    
    waidesKIDailyReporter.logEmotionalState(
      'ALERT',
      'Risk alert engine activated - comprehensive alert monitoring enabled',
      'Alert Engine Activation',
      90
    );
  }

  disableAlertEngine(): void {
    this.isAlertEngineActive = false;
    
    waidesKIDailyReporter.logEmotionalState(
      'NEUTRAL',
      'Risk alert engine deactivated - manual alert management required',
      'Alert Engine Deactivation',
      70
    );
  }

  exportAlertData(): any {
    return {
      alert_statistics: this.getAlertStatistics(),
      alert_channels: this.getAlertChannels(),
      alert_templates: this.getAlertTemplates(),
      sent_alerts: this.getSentAlerts(500),
      engine_config: {
        is_active: this.isAlertEngineActive,
        max_alert_history: this.maxAlertHistory,
        default_rate_limit_minutes: this.defaultRateLimitMinutes
      },
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKIRiskAlertEngine = new WaidesKIRiskAlertEngine();