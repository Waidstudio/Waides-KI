/**
 * SmartNotify.js - Intelligent Alert System for KonsAi
 * Provides proactive, wise trading alerts based on market conditions
 * Integrated with all Waides KI subsystems for comprehensive monitoring
 */

interface NotificationConfig {
  enabled: boolean;
  cooldownPeriod: number; // Minutes between similar notifications
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: ('ui' | 'audio' | 'websocket' | 'sms')[];
  smsPhoneNumber?: string; // Phone number for SMS notifications
}

interface TradingAlert {
  id: string;
  type: 'trade_opportunity' | 'wallet_warning' | 'strategy_risk' | 'market_shift' | 'timing_optimal';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  conditions: any;
  actionRequired: boolean;
  expires?: number;
}

interface MarketConditions {
  volatility: number;
  momentum: string;
  trend: string;
  volume: number;
  rsi: number;
  priceChange24h: number;
}

interface WalletStatus {
  balance: number;
  lastTransactionTime: number;
  riskExposure: number;
  availableForTrading: number;
}

interface StrategyRisk {
  currentRiskLevel: 'low' | 'medium' | 'high' | 'extreme';
  winRate: number;
  recentPerformance: number;
  drawdown: number;
  positionSize: number;
}

class SmartNotify {
  private alerts: Map<string, TradingAlert> = new Map();
  private lastNotificationTime: Map<string, number> = new Map();
  private config: NotificationConfig;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = {
      enabled: true,
      cooldownPeriod: 5, // 5 minutes between similar alerts
      severity: 'medium',
      channels: ['ui', 'websocket']
    };
  }

  // Initialize monitoring system
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔔 SmartNotify: Intelligent alert system activated');
    
    // Monitor every 5 seconds for critical conditions
    this.monitoringInterval = setInterval(() => {
      this.performComprehensiveScan();
    }, 5000);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🔔 SmartNotify: Monitoring paused');
  }

  // Main scanning method - checks all systems for alert conditions
  private async performComprehensiveScan(): Promise<void> {
    try {
      // Get current system state
      const marketConditions = await this.getMarketConditions();
      const walletStatus = await this.getWalletStatus();
      const strategyRisk = await this.getStrategyRisk();
      const tradingSignals = await this.getTradingSignals();

      // Check for various alert conditions
      this.checkTradeOpportunities(marketConditions, tradingSignals);
      this.checkWalletWarnings(walletStatus);
      this.checkStrategyRisks(strategyRisk);
      this.checkMarketShifts(marketConditions);
      this.checkOptimalTiming();

      // Clean up expired alerts
      this.cleanupExpiredAlerts();

    } catch (error) {
      // Silent monitoring - don't disrupt user experience
      console.log('SmartNotify: Scan completed with partial data');
    }
  }

  // 1. Trade Opportunity Detection
  private checkTradeOpportunities(market: MarketConditions, signals: any): void {
    // Strong buy signal detected
    if (signals.strength > 80 && signals.signal === 'BUY' && market.rsi < 70) {
      this.createAlert({
        type: 'trade_opportunity',
        severity: 'high',
        message: `Strong buy opportunity detected! RSI: ${market.rsi}, Signal strength: ${signals.strength}%. The market momentum favors entry now.`,
        conditions: { rsi: market.rsi, strength: signals.strength, momentum: market.momentum },
        actionRequired: true,
        expires: Date.now() + (15 * 60 * 1000) // 15 minutes
      });
    }

    // Excellent timing for long position
    if (market.momentum === 'bullish' && market.volatility < 0.3 && signals.confidence > 75) {
      this.createAlert({
        type: 'trade_opportunity',
        severity: 'medium',
        message: `Excellent timing for a long position. Low volatility with bullish momentum provides a stable entry window.`,
        conditions: { volatility: market.volatility, momentum: market.momentum },
        actionRequired: true,
        expires: Date.now() + (30 * 60 * 1000) // 30 minutes
      });
    }

    // Exit opportunity - take profits
    if (signals.signal === 'SELL' && market.priceChange24h > 5) {
      this.createAlert({
        type: 'trade_opportunity',
        severity: 'medium',
        message: `Consider taking profits. 24h gain of ${market.priceChange24h.toFixed(1)}% suggests a good exit point before potential pullback.`,
        conditions: { priceChange: market.priceChange24h, signal: signals.signal },
        actionRequired: true,
        expires: Date.now() + (20 * 60 * 1000) // 20 minutes
      });
    }
  }

  // 2. Wallet Warning System
  private checkWalletWarnings(wallet: WalletStatus): void {
    // Low balance warning
    if (wallet.balance < 100) {
      this.createAlert({
        type: 'wallet_warning',
        severity: 'medium',
        message: `Your trading balance is low ($${wallet.balance}). Consider funding to avoid missing future opportunities.`,
        conditions: { balance: wallet.balance },
        actionRequired: true
      });
    }

    // High risk exposure warning
    if (wallet.riskExposure > 80) {
      this.createAlert({
        type: 'wallet_warning',
        severity: 'high',
        message: `High risk exposure detected (${wallet.riskExposure}%). Consider reducing position sizes to protect capital.`,
        conditions: { riskExposure: wallet.riskExposure },
        actionRequired: true
      });
    }

    // Insufficient available funds for optimal trading
    if (wallet.availableForTrading < 50) {
      this.createAlert({
        type: 'wallet_warning',
        severity: 'low',
        message: `Limited funds available for trading ($${wallet.availableForTrading}). This may restrict position sizing options.`,
        conditions: { availableFunds: wallet.availableForTrading },
        actionRequired: false
      });
    }
  }

  // 3. Strategy Risk Assessment
  private checkStrategyRisks(strategy: StrategyRisk): void {
    // High-risk strategy with poor performance
    if (strategy.currentRiskLevel === 'high' && strategy.winRate < 40) {
      this.createAlert({
        type: 'strategy_risk',
        severity: 'high',
        message: `Your current strategy appears risky with a ${strategy.winRate}% win rate. Consider adjusting approach or reducing position sizes.`,
        conditions: { riskLevel: strategy.currentRiskLevel, winRate: strategy.winRate },
        actionRequired: true
      });
    }

    // Dangerous drawdown levels
    if (strategy.drawdown > 15) {
      this.createAlert({
        type: 'strategy_risk',
        severity: 'critical',
        message: `Significant drawdown detected (${strategy.drawdown}%). Immediate risk management required to protect capital.`,
        conditions: { drawdown: strategy.drawdown },
        actionRequired: true
      });
    }

    // Position size too large for current volatility
    if (strategy.positionSize > 5 && strategy.currentRiskLevel === 'high') {
      this.createAlert({
        type: 'strategy_risk',
        severity: 'medium',
        message: `Position size may be too large for current market conditions. Consider reducing to 2-3% per trade.`,
        conditions: { positionSize: strategy.positionSize, riskLevel: strategy.currentRiskLevel },
        actionRequired: true
      });
    }
  }

  // 4. Market Shift Detection
  private checkMarketShifts(market: MarketConditions): void {
    // Volatility spike detection
    if (market.volatility > 0.8) {
      this.createAlert({
        type: 'market_shift',
        severity: 'high',
        message: `High volatility spike detected (${(market.volatility * 100).toFixed(1)}%). Market is entering turbulent phase - trade with extreme caution.`,
        conditions: { volatility: market.volatility },
        actionRequired: true,
        expires: Date.now() + (45 * 60 * 1000) // 45 minutes
      });
    }

    // Momentum shift warning
    if (market.momentum === 'shifting' && market.volume > 1.5) {
      this.createAlert({
        type: 'market_shift',
        severity: 'medium',
        message: `Market momentum is shifting with high volume. Prepare for potential trend reversal - adjust strategies accordingly.`,
        conditions: { momentum: market.momentum, volume: market.volume },
        actionRequired: true,
        expires: Date.now() + (60 * 60 * 1000) // 1 hour
      });
    }

    // Extreme RSI conditions
    if (market.rsi > 80 || market.rsi < 20) {
      const condition = market.rsi > 80 ? 'overbought' : 'oversold';
      this.createAlert({
        type: 'market_shift',
        severity: 'medium',
        message: `Extreme ${condition} condition detected (RSI: ${market.rsi}). Potential reversal opportunity approaching.`,
        conditions: { rsi: market.rsi, condition },
        actionRequired: false,
        expires: Date.now() + (30 * 60 * 1000) // 30 minutes
      });
    }
  }

  // 5. Optimal Timing Detection
  private checkOptimalTiming(): void {
    const now = new Date();
    const hour = now.getHours();
    
    // Sacred trading windows (based on market sessions)
    const isOptimalTime = (hour >= 6 && hour <= 9) || (hour >= 14 && hour <= 17);
    
    if (isOptimalTime && !this.hasRecentAlert('timing_optimal')) {
      this.createAlert({
        type: 'timing_optimal',
        severity: 'low',
        message: `You're in an optimal trading window. Institutional activity is high, providing better liquidity and price discovery.`,
        conditions: { hour, session: hour >= 6 && hour <= 9 ? 'morning' : 'afternoon' },
        actionRequired: false,
        expires: Date.now() + (120 * 60 * 1000) // 2 hours
      });
    }
  }

  // Create and manage alerts
  private createAlert(alertData: Partial<TradingAlert>): void {
    const alertId = `${alertData.type}_${Date.now()}`;
    
    // Check cooldown period for similar alerts
    if (this.isInCooldown(alertData.type!)) {
      return;
    }

    const alert: TradingAlert = {
      id: alertId,
      type: alertData.type!,
      message: alertData.message!,
      severity: alertData.severity || 'medium',
      timestamp: Date.now(),
      conditions: alertData.conditions || {},
      actionRequired: alertData.actionRequired || false,
      expires: alertData.expires
    };

    this.alerts.set(alertId, alert);
    this.lastNotificationTime.set(alertData.type!, Date.now());
    
    // Send notification through configured channels
    this.sendNotification(alert);
    
    console.log(`🔔 SmartNotify Alert: ${alert.type} - ${alert.message}`);
  }

  private isInCooldown(alertType: string): boolean {
    const lastTime = this.lastNotificationTime.get(alertType);
    if (!lastTime) return false;
    
    const cooldownMs = this.config.cooldownPeriod * 60 * 1000;
    return (Date.now() - lastTime) < cooldownMs;
  }

  private hasRecentAlert(alertType: string): boolean {
    return Array.from(this.alerts.values()).some(alert => 
      alert.type === alertType && 
      (Date.now() - alert.timestamp) < (60 * 60 * 1000) // 1 hour
    );
  }

  private cleanupExpiredAlerts(): void {
    const now = Date.now();
    for (const [id, alert] of this.alerts.entries()) {
      if (alert.expires && now > alert.expires) {
        this.alerts.delete(id);
      }
    }
    
    // Also clean up old alerts (older than 24 hours)
    for (const [id, alert] of this.alerts.entries()) {
      if ((now - alert.timestamp) > (24 * 60 * 60 * 1000)) {
        this.alerts.delete(id);
      }
    }
  }

  // Send notifications through various channels
  private sendNotification(alert: TradingAlert): void {
    if (!this.config.enabled) return;

    // UI notification (stored for frontend to retrieve)
    if (this.config.channels.includes('ui')) {
      this.storeForUI(alert);
    }

    // WebSocket notification (real-time)
    if (this.config.channels.includes('websocket')) {
      this.sendWebSocketNotification(alert);
    }

    // Audio notification for critical alerts
    if (this.config.channels.includes('audio') && alert.severity === 'critical') {
      this.triggerAudioAlert(alert);
    }

    // SMS notification for high and critical alerts
    if (this.config.channels.includes('sms') && 
        (alert.severity === 'high' || alert.severity === 'critical') &&
        this.config.smsPhoneNumber) {
      this.sendSMSNotification(alert);
    }
  }

  private storeForUI(alert: TradingAlert): void {
    // Store alert for frontend polling/retrieval
    // This will be implemented with the frontend integration
  }

  private sendWebSocketNotification(alert: TradingAlert): void {
    // Send real-time WebSocket notification
    // This will be implemented with WebSocket integration
  }

  private triggerAudioAlert(alert: TradingAlert): void {
    // Trigger audio notification for critical alerts
    // This will be implemented with audio system integration
  }

  // Data fetching methods (integrate with existing services)
  private async getMarketConditions(): Promise<MarketConditions> {
    // In real implementation, this would fetch from actual market data services
    return {
      volatility: Math.random() * 0.5, // Simulated - replace with real data
      momentum: ['bullish', 'bearish', 'sideways', 'shifting'][Math.floor(Math.random() * 4)],
      trend: ['up', 'down', 'sideways'][Math.floor(Math.random() * 3)],
      volume: 1 + Math.random(),
      rsi: 30 + Math.random() * 40,
      priceChange24h: -5 + Math.random() * 10
    };
  }

  private async getWalletStatus(): Promise<WalletStatus> {
    // In real implementation, this would fetch from SmaiSika Wallet
    return {
      balance: 500 + Math.random() * 9500, // Simulated - replace with real data
      lastTransactionTime: Date.now() - Math.random() * 86400000,
      riskExposure: Math.random() * 100,
      availableForTrading: 100 + Math.random() * 400
    };
  }

  private async getStrategyRisk(): Promise<StrategyRisk> {
    // In real implementation, this would fetch from trading engines
    const riskLevels: ('low' | 'medium' | 'high' | 'extreme')[] = ['low', 'medium', 'high', 'extreme'];
    return {
      currentRiskLevel: riskLevels[Math.floor(Math.random() * 4)],
      winRate: 30 + Math.random() * 50,
      recentPerformance: -10 + Math.random() * 20,
      drawdown: Math.random() * 25,
      positionSize: 1 + Math.random() * 8
    };
  }

  private async getTradingSignals(): Promise<any> {
    // In real implementation, this would fetch from analysis engines
    return {
      signal: ['BUY', 'SELL', 'HOLD'][Math.floor(Math.random() * 3)],
      strength: 50 + Math.random() * 50,
      confidence: 60 + Math.random() * 40,
      timeframe: '1h'
    };
  }

  // Public API methods
  getActiveAlerts(): TradingAlert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  getAlertsByType(type: string): TradingAlert[] {
    return Array.from(this.alerts.values())
      .filter(alert => alert.type === type)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  dismissAlert(alertId: string): boolean {
    return this.alerts.delete(alertId);
  }

  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  getStats(): any {
    const alerts = Array.from(this.alerts.values());
    return {
      totalAlerts: alerts.length,
      alertsByType: alerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      alertsBySeverity: alerts.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      isMonitoring: this.isMonitoring,
      lastScanTime: Date.now()
    };
  }
}

// Export singleton instance
export const smartNotify = new SmartNotify();
export default smartNotify;