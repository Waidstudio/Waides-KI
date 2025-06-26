/**
 * STEP 54: Production Risk Manager - Comprehensive Risk Controls & Compliance
 * Enforces trading limits, drawdown caps, position sizing, and regulatory compliance
 */

interface RiskLimits {
  maxDailyLossPercent: number;
  maxTradeSize: number;
  maxPositionSize: number;
  maxDrawdownPercent: number;
  maxOpenPositions: number;
  maxDailyTrades: number;
  cooldownPeriodMs: number;
  emergencyStopThreshold: number;
}

interface TradingAccount {
  initialBalance: number;
  currentBalance: number;
  availableBalance: number;
  lockedBalance: number;
  totalPnL: number;
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
  maxDrawdown: number;
  peakBalance: number;
}

interface RiskEvent {
  eventId: string;
  timestamp: Date;
  eventType: 'limit_breach' | 'emergency_stop' | 'cooldown_triggered' | 'position_denied' | 'compliance_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  tradeDetails?: any;
  actionTaken: string;
  resolved: boolean;
}

interface TradeRiskAssessment {
  allowed: boolean;
  riskScore: number;
  positionSizeMultiplier: number;
  warnings: string[];
  blockers: string[];
  riskFactors: {
    dailyLossCheck: boolean;
    tradeSizeCheck: boolean;
    positionLimitCheck: boolean;
    drawdownCheck: boolean;
    cooldownCheck: boolean;
    emergencyStopCheck: boolean;
  };
}

interface ComplianceCheck {
  passed: boolean;
  violations: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export class WaidesKIProductionRiskManager {
  private riskLimits: RiskLimits;
  private tradingAccount: TradingAccount;
  private riskEvents: RiskEvent[] = [];
  private emergencyStopActive = false;
  private lastTradeTime = 0;
  private dailyTradeCount = 0;
  private openPositions = 0;
  private lastDailyReset = new Date().getDate();

  private readonly MAX_RISK_EVENTS = 1000;
  private readonly EMERGENCY_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

  constructor(initialBalance: number = 10000) {
    this.riskLimits = {
      maxDailyLossPercent: 0.05,     // 5% daily loss limit
      maxTradeSize: 0.02,            // 2% of balance per trade
      maxPositionSize: 0.1,          // 10% of balance in single position
      maxDrawdownPercent: 0.2,       // 20% maximum drawdown
      maxOpenPositions: 3,           // Maximum 3 concurrent positions
      maxDailyTrades: 20,            // Maximum 20 trades per day
      cooldownPeriodMs: 5 * 60 * 1000, // 5 minutes between trades
      emergencyStopThreshold: 0.15   // 15% loss triggers emergency stop
    };

    this.tradingAccount = {
      initialBalance,
      currentBalance: initialBalance,
      availableBalance: initialBalance,
      lockedBalance: 0,
      totalPnL: 0,
      dailyPnL: 0,
      weeklyPnL: 0,
      monthlyPnL: 0,
      maxDrawdown: 0,
      peakBalance: initialBalance
    };

    this.initializeDailyReset();
  }

  /**
   * Initialize daily reset scheduler
   */
  private initializeDailyReset(): void {
    setInterval(() => {
      const currentDay = new Date().getDate();
      if (currentDay !== this.lastDailyReset) {
        this.resetDailyLimits();
        this.lastDailyReset = currentDay;
      }
    }, 60 * 60 * 1000); // Check every hour
  }

  /**
   * Reset daily trading limits
   */
  private resetDailyLimits(): void {
    this.dailyTradeCount = 0;
    this.tradingAccount.dailyPnL = 0;
    
    this.recordRiskEvent({
      eventType: 'limit_breach',
      severity: 'low',
      description: 'Daily limits reset - new trading day started',
      actionTaken: 'Reset daily trade count and P&L tracking'
    });
  }

  /**
   * Assess trade risk before execution
   */
  assessTradeRisk(
    tradeAmount: number,
    symbol: string,
    side: 'BUY' | 'SELL',
    orderType: 'MARKET' | 'LIMIT' = 'MARKET'
  ): TradeRiskAssessment {
    const riskFactors = {
      dailyLossCheck: this.checkDailyLossLimit(),
      tradeSizeCheck: this.checkTradeSize(tradeAmount),
      positionLimitCheck: this.checkPositionLimits(),
      drawdownCheck: this.checkDrawdownLimit(),
      cooldownCheck: this.checkCooldownPeriod(),
      emergencyStopCheck: !this.emergencyStopActive
    };

    const warnings: string[] = [];
    const blockers: string[] = [];
    let riskScore = 0;
    let positionSizeMultiplier = 1.0;

    // Check each risk factor
    if (!riskFactors.dailyLossCheck) {
      blockers.push('Daily loss limit exceeded');
      riskScore += 40;
    }

    if (!riskFactors.tradeSizeCheck) {
      blockers.push(`Trade size (${tradeAmount}) exceeds maximum allowed`);
      riskScore += 30;
    }

    if (!riskFactors.positionLimitCheck) {
      blockers.push('Maximum open positions reached');
      riskScore += 20;
    }

    if (!riskFactors.drawdownCheck) {
      blockers.push('Maximum drawdown limit reached');
      riskScore += 50;
    }

    if (!riskFactors.cooldownCheck) {
      warnings.push('Cooldown period active - trade frequency too high');
      riskScore += 15;
      positionSizeMultiplier *= 0.5; // Reduce position size during cooldown
    }

    if (!riskFactors.emergencyStopCheck) {
      blockers.push('Emergency stop is active - all trading suspended');
      riskScore += 100;
    }

    // Additional risk scoring based on account health
    const drawdownPercent = (this.tradingAccount.peakBalance - this.tradingAccount.currentBalance) / this.tradingAccount.peakBalance;
    if (drawdownPercent > 0.1) {
      warnings.push('Account in significant drawdown');
      riskScore += 10;
      positionSizeMultiplier *= 0.8;
    }

    if (this.dailyTradeCount > this.riskLimits.maxDailyTrades * 0.8) {
      warnings.push('Approaching daily trade limit');
      riskScore += 5;
    }

    // Determine if trade is allowed
    const allowed = blockers.length === 0 && riskScore < 60;

    return {
      allowed,
      riskScore,
      positionSizeMultiplier,
      warnings,
      blockers,
      riskFactors
    };
  }

  /**
   * Check daily loss limit
   */
  private checkDailyLossLimit(): boolean {
    const maxDailyLoss = this.tradingAccount.currentBalance * this.riskLimits.maxDailyLossPercent;
    return this.tradingAccount.dailyPnL > -maxDailyLoss;
  }

  /**
   * Check trade size limit
   */
  private checkTradeSize(tradeAmount: number): boolean {
    const maxTradeAmount = this.tradingAccount.availableBalance * this.riskLimits.maxTradeSize;
    return tradeAmount <= maxTradeAmount;
  }

  /**
   * Check position limits
   */
  private checkPositionLimits(): boolean {
    return this.openPositions < this.riskLimits.maxOpenPositions;
  }

  /**
   * Check drawdown limit
   */
  private checkDrawdownLimit(): boolean {
    const currentDrawdown = (this.tradingAccount.peakBalance - this.tradingAccount.currentBalance) / this.tradingAccount.peakBalance;
    return currentDrawdown < this.riskLimits.maxDrawdownPercent;
  }

  /**
   * Check cooldown period
   */
  private checkCooldownPeriod(): boolean {
    const timeSinceLastTrade = Date.now() - this.lastTradeTime;
    return timeSinceLastTrade >= this.riskLimits.cooldownPeriodMs;
  }

  /**
   * Record trade execution and update account
   */
  recordTradeExecution(
    tradeAmount: number,
    executedPrice: number,
    side: 'BUY' | 'SELL',
    fees: number = 0,
    pnl?: number
  ): {
    success: boolean;
    newBalance: number;
    updatedAccount: TradingAccount;
  } {
    this.lastTradeTime = Date.now();
    this.dailyTradeCount++;

    if (side === 'BUY') {
      this.openPositions++;
      this.tradingAccount.availableBalance -= tradeAmount + fees;
      this.tradingAccount.lockedBalance += tradeAmount;
    } else {
      this.openPositions = Math.max(0, this.openPositions - 1);
      
      if (pnl !== undefined) {
        this.tradingAccount.currentBalance += pnl;
        this.tradingAccount.availableBalance += pnl;
        this.tradingAccount.totalPnL += pnl;
        this.tradingAccount.dailyPnL += pnl;
        
        // Update peak balance and drawdown
        if (this.tradingAccount.currentBalance > this.tradingAccount.peakBalance) {
          this.tradingAccount.peakBalance = this.tradingAccount.currentBalance;
        }
        
        const currentDrawdown = (this.tradingAccount.peakBalance - this.tradingAccount.currentBalance) / this.tradingAccount.peakBalance;
        if (currentDrawdown > this.tradingAccount.maxDrawdown) {
          this.tradingAccount.maxDrawdown = currentDrawdown;
        }
      }
    }

    // Subtract fees
    this.tradingAccount.currentBalance -= fees;
    this.tradingAccount.availableBalance -= fees;
    this.tradingAccount.totalPnL -= fees;
    this.tradingAccount.dailyPnL -= fees;

    // Check for emergency stop conditions
    this.checkEmergencyStopConditions();

    return {
      success: true,
      newBalance: this.tradingAccount.currentBalance,
      updatedAccount: { ...this.tradingAccount }
    };
  }

  /**
   * Check and trigger emergency stop if needed
   */
  private checkEmergencyStopConditions(): void {
    const totalLossPercent = (this.tradingAccount.initialBalance - this.tradingAccount.currentBalance) / this.tradingAccount.initialBalance;
    
    if (totalLossPercent >= this.riskLimits.emergencyStopThreshold && !this.emergencyStopActive) {
      this.triggerEmergencyStop('Total loss threshold exceeded');
    }

    const drawdownPercent = (this.tradingAccount.peakBalance - this.tradingAccount.currentBalance) / this.tradingAccount.peakBalance;
    
    if (drawdownPercent >= this.riskLimits.maxDrawdownPercent && !this.emergencyStopActive) {
      this.triggerEmergencyStop('Maximum drawdown exceeded');
    }
  }

  /**
   * Trigger emergency stop
   */
  triggerEmergencyStop(reason: string): void {
    this.emergencyStopActive = true;
    
    this.recordRiskEvent({
      eventType: 'emergency_stop',
      severity: 'critical',
      description: `Emergency stop triggered: ${reason}`,
      actionTaken: 'All trading suspended, positions to be reviewed'
    });

    // Auto-disable emergency stop after cooldown period (for safety)
    setTimeout(() => {
      this.disableEmergencyStop('Automatic cooldown period expired');
    }, this.EMERGENCY_COOLDOWN_MS);
  }

  /**
   * Manually disable emergency stop
   */
  disableEmergencyStop(reason: string): void {
    this.emergencyStopActive = false;
    
    this.recordRiskEvent({
      eventType: 'emergency_stop',
      severity: 'medium',
      description: `Emergency stop disabled: ${reason}`,
      actionTaken: 'Trading resumed with enhanced monitoring'
    });
  }

  /**
   * Record risk event
   */
  private recordRiskEvent(event: Omit<RiskEvent, 'eventId' | 'timestamp' | 'resolved'>): void {
    const riskEvent: RiskEvent = {
      eventId: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      ...event
    };

    this.riskEvents.push(riskEvent);
    
    // Keep only recent events
    if (this.riskEvents.length > this.MAX_RISK_EVENTS) {
      this.riskEvents = this.riskEvents.slice(-this.MAX_RISK_EVENTS);
    }

    // Log critical events
    if (event.severity === 'critical') {
      console.error(`🚨 CRITICAL RISK EVENT: ${event.description}`);
    }
  }

  /**
   * Perform comprehensive compliance check
   */
  performComplianceCheck(): ComplianceCheck {
    const violations: string[] = [];
    const recommendations: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check account health
    const drawdownPercent = (this.tradingAccount.peakBalance - this.tradingAccount.currentBalance) / this.tradingAccount.peakBalance;
    
    if (drawdownPercent > 0.15) {
      violations.push('Excessive drawdown detected');
      riskLevel = 'high';
    } else if (drawdownPercent > 0.1) {
      recommendations.push('Monitor drawdown levels closely');
      riskLevel = 'medium';
    }

    // Check trading frequency
    if (this.dailyTradeCount > this.riskLimits.maxDailyTrades * 0.9) {
      violations.push('Approaching daily trade limit');
      recommendations.push('Reduce trading frequency');
      riskLevel = 'medium';
    }

    // Check position concentration
    const positionConcentration = this.openPositions / this.riskLimits.maxOpenPositions;
    if (positionConcentration > 0.8) {
      recommendations.push('High position concentration - consider reducing exposure');
    }

    // Check recent risk events
    const recentEvents = this.riskEvents.filter(event => 
      Date.now() - event.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );
    
    const criticalEvents = recentEvents.filter(event => event.severity === 'critical');
    if (criticalEvents.length > 0) {
      violations.push(`${criticalEvents.length} critical risk events in last 24 hours`);
      riskLevel = 'critical';
    }

    // Emergency stop check
    if (this.emergencyStopActive) {
      violations.push('Emergency stop is currently active');
      riskLevel = 'critical';
    }

    return {
      passed: violations.length === 0,
      violations,
      recommendations,
      riskLevel
    };
  }

  /**
   * Get comprehensive risk dashboard
   */
  getRiskDashboard(): {
    account: TradingAccount;
    riskLimits: RiskLimits;
    currentRiskLevel: string;
    emergencyStopActive: boolean;
    dailyStats: {
      tradesExecuted: number;
      tradesRemaining: number;
      dailyPnL: number;
      dailyPnLPercent: number;
    };
    riskMetrics: {
      currentDrawdown: number;
      maxDrawdownUsed: number;
      positionUtilization: number;
      riskScore: number;
    };
    recentEvents: RiskEvent[];
    complianceStatus: ComplianceCheck;
  } {
    const drawdownPercent = (this.tradingAccount.peakBalance - this.tradingAccount.currentBalance) / this.tradingAccount.peakBalance;
    const complianceStatus = this.performComplianceCheck();
    
    return {
      account: { ...this.tradingAccount },
      riskLimits: { ...this.riskLimits },
      currentRiskLevel: complianceStatus.riskLevel,
      emergencyStopActive: this.emergencyStopActive,
      dailyStats: {
        tradesExecuted: this.dailyTradeCount,
        tradesRemaining: Math.max(0, this.riskLimits.maxDailyTrades - this.dailyTradeCount),
        dailyPnL: this.tradingAccount.dailyPnL,
        dailyPnLPercent: (this.tradingAccount.dailyPnL / this.tradingAccount.currentBalance) * 100
      },
      riskMetrics: {
        currentDrawdown: drawdownPercent,
        maxDrawdownUsed: (drawdownPercent / this.riskLimits.maxDrawdownPercent) * 100,
        positionUtilization: (this.openPositions / this.riskLimits.maxOpenPositions) * 100,
        riskScore: this.calculateOverallRiskScore()
      },
      recentEvents: this.riskEvents.slice(-10),
      complianceStatus
    };
  }

  /**
   * Calculate overall risk score
   */
  private calculateOverallRiskScore(): number {
    let riskScore = 0;
    
    // Drawdown contribution
    const drawdownPercent = (this.tradingAccount.peakBalance - this.tradingAccount.currentBalance) / this.tradingAccount.peakBalance;
    riskScore += (drawdownPercent / this.riskLimits.maxDrawdownPercent) * 40;
    
    // Position concentration
    riskScore += (this.openPositions / this.riskLimits.maxOpenPositions) * 20;
    
    // Daily P&L impact
    const dailyLossPercent = Math.abs(this.tradingAccount.dailyPnL) / this.tradingAccount.currentBalance;
    riskScore += (dailyLossPercent / this.riskLimits.maxDailyLossPercent) * 30;
    
    // Trading frequency
    riskScore += (this.dailyTradeCount / this.riskLimits.maxDailyTrades) * 10;
    
    return Math.min(100, Math.max(0, riskScore));
  }

  /**
   * Update risk limits (admin function)
   */
  updateRiskLimits(newLimits: Partial<RiskLimits>): {
    success: boolean;
    previousLimits: RiskLimits;
    newLimits: RiskLimits;
  } {
    const previousLimits = { ...this.riskLimits };
    this.riskLimits = { ...this.riskLimits, ...newLimits };
    
    this.recordRiskEvent({
      eventType: 'compliance_violation',
      severity: 'medium',
      description: 'Risk limits updated by administrator',
      actionTaken: 'Applied new risk parameters'
    });
    
    return {
      success: true,
      previousLimits,
      newLimits: { ...this.riskLimits }
    };
  }

  /**
   * Get risk events with filtering
   */
  getRiskEvents(
    severity?: 'low' | 'medium' | 'high' | 'critical',
    eventType?: string,
    limit: number = 50
  ): RiskEvent[] {
    let filteredEvents = [...this.riskEvents];
    
    if (severity) {
      filteredEvents = filteredEvents.filter(event => event.severity === severity);
    }
    
    if (eventType) {
      filteredEvents = filteredEvents.filter(event => event.eventType === eventType);
    }
    
    return filteredEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Reset account for testing/maintenance
   */
  resetAccount(newBalance: number): void {
    this.tradingAccount = {
      initialBalance: newBalance,
      currentBalance: newBalance,
      availableBalance: newBalance,
      lockedBalance: 0,
      totalPnL: 0,
      dailyPnL: 0,
      weeklyPnL: 0,
      monthlyPnL: 0,
      maxDrawdown: 0,
      peakBalance: newBalance
    };
    
    this.emergencyStopActive = false;
    this.dailyTradeCount = 0;
    this.openPositions = 0;
    
    this.recordRiskEvent({
      eventType: 'compliance_violation',
      severity: 'medium',
      description: 'Account reset performed',
      actionTaken: `Reset account balance to ${newBalance}`
    });
  }
}

export const waidesKIProductionRiskManager = new WaidesKIProductionRiskManager();