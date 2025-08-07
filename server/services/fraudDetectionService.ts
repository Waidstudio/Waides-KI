import { db } from '../storage';
import { 
  fraudDetectionLogs,
  authenticationAttempts,
  financialAuditTrail,
  trades,
  users,
  type InsertFraudDetectionLog 
} from '../../shared/schema';
import { eq, and, desc, gte, lte, count, sql } from 'drizzle-orm';

/**
 * Fraud Detection Engine
 * Real-time monitoring and detection of suspicious activities
 * Addresses Question 12: Are suspicious trade behaviors flagged?
 */
export class FraudDetectionService {
  private static instance: FraudDetectionService;
  
  // Risk scoring thresholds
  private readonly RISK_THRESHOLDS = {
    LOW: 25,
    MEDIUM: 50,
    HIGH: 75,
    CRITICAL: 90,
  };

  // Pattern detection configurations
  private readonly DETECTION_CONFIG = {
    MAX_LOGIN_ATTEMPTS: 5,
    MAX_FAILED_TRADES: 10,
    UNUSUAL_VOLUME_MULTIPLIER: 5, // 5x normal volume considered unusual
    MAX_HOURLY_TRADES: 50,
    SUSPICIOUS_WITHDRAWAL_PERCENTAGE: 80, // % of balance withdrawal
    RAPID_SUCCESSION_INTERVAL: 60000, // 1 minute in ms
  };

  public static getInstance(): FraudDetectionService {
    if (!FraudDetectionService.instance) {
      FraudDetectionService.instance = new FraudDetectionService();
    }
    return FraudDetectionService.instance;
  }

  /**
   * Analyze trade pattern for suspicious activity
   */
  async analyzeTradePattern(userId: number, tradeData: {
    type: string;
    amount: string;
    pair: string;
    strategy?: string;
    confidence?: number;
  }): Promise<{ suspicious: boolean; riskScore: number; actions: string[] }> {
    try {
      let riskScore = 0;
      const suspiciousActivities: string[] = [];
      const automaticActions: string[] = [];

      // 1. Check for rapid succession trades
      const recentTrades = await this.getRecentTrades(userId, this.DETECTION_CONFIG.RAPID_SUCCESSION_INTERVAL);
      if (recentTrades.length > 5) {
        riskScore += 20;
        suspiciousActivities.push(`${recentTrades.length} trades in rapid succession`);
      }

      // 2. Check hourly trade volume
      const hourlyTrades = await this.getRecentTrades(userId, 3600000); // 1 hour
      if (hourlyTrades.length > this.DETECTION_CONFIG.MAX_HOURLY_TRADES) {
        riskScore += 25;
        suspiciousActivities.push(`Excessive hourly trading: ${hourlyTrades.length} trades`);
      }

      // 3. Analyze trade amounts vs historical patterns
      const avgTradeAmount = await this.getUserAverageTradeAmount(userId);
      const currentTradeAmount = parseFloat(tradeData.amount);
      
      if (avgTradeAmount > 0 && currentTradeAmount > avgTradeAmount * this.DETECTION_CONFIG.UNUSUAL_VOLUME_MULTIPLIER) {
        riskScore += 15;
        suspiciousActivities.push(`Unusually large trade amount: ${currentTradeAmount} vs avg ${avgTradeAmount}`);
      }

      // 4. Check for failed trade patterns
      const failedTradesCount = await this.getFailedTradesCount(userId, 86400000); // 24 hours
      if (failedTradesCount > this.DETECTION_CONFIG.MAX_FAILED_TRADES) {
        riskScore += 10;
        suspiciousActivities.push(`High failed trades count: ${failedTradesCount}`);
      }

      // 5. Analyze trading confidence patterns
      if (tradeData.confidence && tradeData.confidence < 20) {
        riskScore += 5;
        suspiciousActivities.push('Low confidence trades pattern');
      }

      // 6. Check for unusual trading pairs
      const isUnusualPair = await this.isUnusualTradingPair(userId, tradeData.pair);
      if (isUnusualPair) {
        riskScore += 8;
        suspiciousActivities.push(`Unusual trading pair: ${tradeData.pair}`);
      }

      // Determine risk level and automatic actions
      const riskLevel = this.calculateRiskLevel(riskScore);
      
      if (riskScore >= this.RISK_THRESHOLDS.HIGH) {
        automaticActions.push('trade_blocked', 'admin_notified');
      } else if (riskScore >= this.RISK_THRESHOLDS.MEDIUM) {
        automaticActions.push('additional_verification_required');
      }

      // Log suspicious activity if risk score is significant
      if (riskScore >= this.RISK_THRESHOLDS.LOW) {
        await this.logSuspiciousActivity({
          userId,
          detectionType: 'trade_pattern',
          suspiciousActivity: suspiciousActivities.join('; '),
          riskLevel,
          riskScore,
          activityData: {
            trade: tradeData,
            recentTradesCount: recentTrades.length,
            hourlyTradesCount: hourlyTrades.length,
            avgTradeAmount,
            failedTradesCount,
          },
          automaticAction: automaticActions.join(', '),
          manualReviewRequired: riskScore >= this.RISK_THRESHOLDS.HIGH,
        });
      }

      console.log(`🔍 Trade pattern analyzed for user ${userId}: Risk Score ${riskScore} (${riskLevel})`);

      return {
        suspicious: riskScore >= this.RISK_THRESHOLDS.MEDIUM,
        riskScore,
        actions: automaticActions,
      };
    } catch (error) {
      console.error('Error analyzing trade pattern:', error);
      return { suspicious: false, riskScore: 0, actions: [] };
    }
  }

  /**
   * Analyze login pattern for suspicious activity
   */
  async analyzeLoginPattern(userId: number | null, loginData: {
    ipAddress: string;
    userAgent: string;
    location?: string;
    success: boolean;
    email?: string;
  }): Promise<{ suspicious: boolean; riskScore: number; shouldBlock: boolean }> {
    try {
      let riskScore = 0;
      const suspiciousActivities: string[] = [];

      // 1. Check failed login attempts from same IP
      const recentFailedAttempts = await db
        .select({ count: count() })
        .from(authenticationAttempts)
        .where(
          and(
            eq(authenticationAttempts.ipAddress, loginData.ipAddress),
            eq(authenticationAttempts.success, false),
            gte(authenticationAttempts.createdAt, new Date(Date.now() - 3600000)) // Last hour
          )
        );

      const failedCount = recentFailedAttempts[0]?.count || 0;
      
      if (failedCount > this.DETECTION_CONFIG.MAX_LOGIN_ATTEMPTS) {
        riskScore += 40;
        suspiciousActivities.push(`${failedCount} failed login attempts from IP`);
      }

      // 2. Check for geolocation anomalies (if userId exists)
      if (userId) {
        const locationAnomaly = await this.checkLocationAnomaly(userId, loginData.location);
        if (locationAnomaly.suspicious) {
          riskScore += locationAnomaly.riskIncrease;
          suspiciousActivities.push(locationAnomaly.reason);
        }
      }

      // 3. Analyze user agent patterns
      const userAgentAnomaly = await this.checkUserAgentAnomaly(userId, loginData.userAgent);
      if (userAgentAnomaly.suspicious) {
        riskScore += userAgentAnomaly.riskIncrease;
        suspiciousActivities.push(userAgentAnomaly.reason);
      }

      // 4. Check for concurrent login attempts
      const concurrentAttempts = await this.getConcurrentLoginAttempts(loginData.ipAddress);
      if (concurrentAttempts > 3) {
        riskScore += 15;
        suspiciousActivities.push(`${concurrentAttempts} concurrent login attempts`);
      }

      const riskLevel = this.calculateRiskLevel(riskScore);
      const shouldBlock = riskScore >= this.RISK_THRESHOLDS.HIGH;

      // Log if suspicious
      if (riskScore >= this.RISK_THRESHOLDS.LOW) {
        await this.logSuspiciousActivity({
          userId,
          detectionType: 'login_pattern',
          suspiciousActivity: suspiciousActivities.join('; '),
          riskLevel,
          riskScore,
          activityData: {
            login: loginData,
            failedCount,
            concurrentAttempts,
          },
          automaticAction: shouldBlock ? 'ip_blocked' : 'monitoring_increased',
          manualReviewRequired: shouldBlock,
        });
      }

      console.log(`🔍 Login pattern analyzed: IP ${loginData.ipAddress}, Risk Score ${riskScore} (${riskLevel})`);

      return {
        suspicious: riskScore >= this.RISK_THRESHOLDS.MEDIUM,
        riskScore,
        shouldBlock,
      };
    } catch (error) {
      console.error('Error analyzing login pattern:', error);
      return { suspicious: false, riskScore: 0, shouldBlock: false };
    }
  }

  /**
   * Analyze withdrawal pattern for suspicious activity
   */
  async analyzeWithdrawalPattern(userId: number, withdrawalData: {
    amount: string;
    currency: string;
    destination: string;
    currentBalance: string;
  }): Promise<{ suspicious: boolean; riskScore: number; requiresApproval: boolean }> {
    try {
      let riskScore = 0;
      const suspiciousActivities: string[] = [];
      const withdrawalAmount = parseFloat(withdrawalData.amount);
      const currentBalance = parseFloat(withdrawalData.currentBalance);

      // 1. Check withdrawal amount vs balance percentage
      const withdrawalPercentage = (withdrawalAmount / currentBalance) * 100;
      if (withdrawalPercentage > this.DETECTION_CONFIG.SUSPICIOUS_WITHDRAWAL_PERCENTAGE) {
        riskScore += 30;
        suspiciousActivities.push(`Large withdrawal: ${withdrawalPercentage.toFixed(2)}% of balance`);
      }

      // 2. Check recent withdrawal frequency
      const recentWithdrawals = await this.getRecentWithdrawals(userId, 86400000); // 24 hours
      if (recentWithdrawals.length > 5) {
        riskScore += 20;
        suspiciousActivities.push(`${recentWithdrawals.length} withdrawals in 24 hours`);
      }

      // 3. Check for new withdrawal destination
      const isNewDestination = await this.isNewWithdrawalDestination(userId, withdrawalData.destination);
      if (isNewDestination) {
        riskScore += 15;
        suspiciousActivities.push('New withdrawal destination');
      }

      // 4. Check withdrawal timing patterns (off-hours)
      const isOffHours = this.isOffHours();
      if (isOffHours && withdrawalAmount > 1000) {
        riskScore += 10;
        suspiciousActivities.push('Large off-hours withdrawal');
      }

      // 5. Compare with historical withdrawal patterns
      const avgWithdrawal = await this.getUserAverageWithdrawal(userId);
      if (avgWithdrawal > 0 && withdrawalAmount > avgWithdrawal * 3) {
        riskScore += 12;
        suspiciousActivities.push(`Unusually large withdrawal: ${withdrawalAmount} vs avg ${avgWithdrawal}`);
      }

      const riskLevel = this.calculateRiskLevel(riskScore);
      const requiresApproval = riskScore >= this.RISK_THRESHOLDS.MEDIUM;

      // Log suspicious withdrawal
      if (riskScore >= this.RISK_THRESHOLDS.LOW) {
        await this.logSuspiciousActivity({
          userId,
          detectionType: 'withdrawal_pattern',
          suspiciousActivity: suspiciousActivities.join('; '),
          riskLevel,
          riskScore,
          activityData: {
            withdrawal: withdrawalData,
            withdrawalPercentage,
            recentWithdrawalsCount: recentWithdrawals.length,
            isNewDestination,
            avgWithdrawal,
          },
          automaticAction: requiresApproval ? 'approval_required' : 'monitoring',
          manualReviewRequired: riskScore >= this.RISK_THRESHOLDS.HIGH,
        });
      }

      console.log(`🔍 Withdrawal pattern analyzed for user ${userId}: Risk Score ${riskScore} (${riskLevel})`);

      return {
        suspicious: riskScore >= this.RISK_THRESHOLDS.MEDIUM,
        riskScore,
        requiresApproval,
      };
    } catch (error) {
      console.error('Error analyzing withdrawal pattern:', error);
      return { suspicious: false, riskScore: 0, requiresApproval: false };
    }
  }

  /**
   * Get pending fraud cases requiring manual review
   */
  async getPendingFraudCases(): Promise<any[]> {
    try {
      const pendingCases = await db
        .select({
          id: fraudDetectionLogs.id,
          userId: fraudDetectionLogs.userId,
          detectionType: fraudDetectionLogs.detectionType,
          suspiciousActivity: fraudDetectionLogs.suspiciousActivity,
          riskLevel: fraudDetectionLogs.riskLevel,
          riskScore: fraudDetectionLogs.riskScore,
          activityData: fraudDetectionLogs.activityData,
          createdAt: fraudDetectionLogs.createdAt,
          username: users.username,
          email: users.email,
        })
        .from(fraudDetectionLogs)
        .leftJoin(users, eq(fraudDetectionLogs.userId, users.id))
        .where(
          and(
            eq(fraudDetectionLogs.manualReviewRequired, true),
            eq(fraudDetectionLogs.resolved, false)
          )
        )
        .orderBy(desc(fraudDetectionLogs.riskScore), desc(fraudDetectionLogs.createdAt))
        .limit(50);

      return pendingCases;
    } catch (error) {
      console.error('Error getting pending fraud cases:', error);
      return [];
    }
  }

  /**
   * Resolve fraud case with review outcome
   */
  async resolveFraudCase(caseId: number, reviewedBy: number, outcome: 'false_positive' | 'confirmed_fraud' | 'needs_monitoring', actionTaken?: string): Promise<boolean> {
    try {
      await db
        .update(fraudDetectionLogs)
        .set({
          reviewedBy,
          reviewedAt: new Date(),
          reviewOutcome: outcome,
          actionTaken: actionTaken || `Case resolved as ${outcome}`,
          resolved: true,
        })
        .where(eq(fraudDetectionLogs.id, caseId));

      console.log(`🔍 Fraud case ${caseId} resolved as ${outcome} by user ${reviewedBy}`);
      return true;
    } catch (error) {
      console.error('Error resolving fraud case:', error);
      return false;
    }
  }

  // ===== HELPER METHODS =====

  private async logSuspiciousActivity(data: {
    userId: number | null;
    detectionType: string;
    suspiciousActivity: string;
    riskLevel: string;
    riskScore: number;
    activityData: any;
    automaticAction: string;
    manualReviewRequired: boolean;
  }): Promise<void> {
    const logEntry: InsertFraudDetectionLog = {
      userId: data.userId,
      detectionType: data.detectionType,
      suspiciousActivity: data.suspiciousActivity,
      riskLevel: data.riskLevel,
      riskScore: data.riskScore,
      activityData: data.activityData,
      automaticAction: data.automaticAction,
      manualReviewRequired: data.manualReviewRequired,
    };

    await db.insert(fraudDetectionLogs).values(logEntry);
  }

  private async getRecentTrades(userId: number, timeWindowMs: number): Promise<any[]> {
    const since = new Date(Date.now() - timeWindowMs);
    return await db
      .select()
      .from(trades)
      .where(
        and(
          eq(trades.userId, userId),
          gte(trades.createdAt, since)
        )
      );
  }

  private async getUserAverageTradeAmount(userId: number): Promise<number> {
    const result = await db
      .select({ avg: sql<number>`AVG(CAST(${trades.amount} AS DECIMAL))` })
      .from(trades)
      .where(eq(trades.userId, userId));
    
    return result[0]?.avg || 0;
  }

  private async getFailedTradesCount(userId: number, timeWindowMs: number): Promise<number> {
    const since = new Date(Date.now() - timeWindowMs);
    const result = await db
      .select({ count: count() })
      .from(trades)
      .where(
        and(
          eq(trades.userId, userId),
          eq(trades.status, 'failed'),
          gte(trades.createdAt, since)
        )
      );
    
    return result[0]?.count || 0;
  }

  private async isUnusualTradingPair(userId: number, pair: string): Promise<boolean> {
    const result = await db
      .select({ count: count() })
      .from(trades)
      .where(
        and(
          eq(trades.userId, userId),
          eq(trades.pair, pair)
        )
      );
    
    return (result[0]?.count || 0) < 3; // Consider unusual if less than 3 historical trades
  }

  private async checkLocationAnomaly(userId: number, currentLocation?: string): Promise<{ suspicious: boolean; riskIncrease: number; reason: string }> {
    if (!currentLocation) return { suspicious: false, riskIncrease: 0, reason: '' };

    const recentLocations = await db
      .select({ location: authenticationAttempts.location })
      .from(authenticationAttempts)
      .where(
        and(
          eq(authenticationAttempts.userId, userId),
          eq(authenticationAttempts.success, true),
          gte(authenticationAttempts.createdAt, new Date(Date.now() - 7 * 86400000)) // Last 7 days
        )
      )
      .limit(10);

    const knownLocations = recentLocations.map(r => r.location).filter(Boolean);
    
    if (knownLocations.length > 0 && !knownLocations.includes(currentLocation)) {
      return { 
        suspicious: true, 
        riskIncrease: 25, 
        reason: `Login from new location: ${currentLocation}` 
      };
    }

    return { suspicious: false, riskIncrease: 0, reason: '' };
  }

  private async checkUserAgentAnomaly(userId: number | null, currentUserAgent: string): Promise<{ suspicious: boolean; riskIncrease: number; reason: string }> {
    if (!userId) return { suspicious: false, riskIncrease: 0, reason: '' };

    const recentUserAgents = await db
      .select({ userAgent: authenticationAttempts.userAgent })
      .from(authenticationAttempts)
      .where(
        and(
          eq(authenticationAttempts.userId, userId),
          eq(authenticationAttempts.success, true),
          gte(authenticationAttempts.createdAt, new Date(Date.now() - 30 * 86400000)) // Last 30 days
        )
      )
      .limit(20);

    const knownUserAgents = recentUserAgents.map(r => r.userAgent).filter(Boolean);
    
    if (knownUserAgents.length > 0 && !knownUserAgents.includes(currentUserAgent)) {
      return { 
        suspicious: true, 
        riskIncrease: 15, 
        reason: 'Login from new device/browser' 
      };
    }

    return { suspicious: false, riskIncrease: 0, reason: '' };
  }

  private async getConcurrentLoginAttempts(ipAddress: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(authenticationAttempts)
      .where(
        and(
          eq(authenticationAttempts.ipAddress, ipAddress),
          gte(authenticationAttempts.createdAt, new Date(Date.now() - 300000)) // Last 5 minutes
        )
      );
    
    return result[0]?.count || 0;
  }

  private async getRecentWithdrawals(userId: number, timeWindowMs: number): Promise<any[]> {
    const since = new Date(Date.now() - timeWindowMs);
    return await db
      .select()
      .from(financialAuditTrail)
      .where(
        and(
          eq(financialAuditTrail.userId, userId),
          eq(financialAuditTrail.auditType, 'withdrawal'),
          gte(financialAuditTrail.createdAt, since)
        )
      );
  }

  private async isNewWithdrawalDestination(userId: number, destination: string): Promise<boolean> {
    const result = await db
      .select({ count: count() })
      .from(financialAuditTrail)
      .where(
        and(
          eq(financialAuditTrail.userId, userId),
          eq(financialAuditTrail.auditType, 'withdrawal'),
          sql`${financialAuditTrail.reason} LIKE ${'%' + destination + '%'}`
        )
      );
    
    return (result[0]?.count || 0) === 0;
  }

  private async getUserAverageWithdrawal(userId: number): Promise<number> {
    const result = await db
      .select({ avg: sql<number>`AVG(CAST(${financialAuditTrail.amountChanged} AS DECIMAL))` })
      .from(financialAuditTrail)
      .where(
        and(
          eq(financialAuditTrail.userId, userId),
          eq(financialAuditTrail.auditType, 'withdrawal')
        )
      );
    
    return Math.abs(result[0]?.avg || 0);
  }

  private isOffHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    return hour < 6 || hour > 22; // Consider 10 PM to 6 AM as off-hours
  }

  private calculateRiskLevel(riskScore: number): string {
    if (riskScore >= this.RISK_THRESHOLDS.CRITICAL) return 'critical';
    if (riskScore >= this.RISK_THRESHOLDS.HIGH) return 'high';
    if (riskScore >= this.RISK_THRESHOLDS.MEDIUM) return 'medium';
    if (riskScore >= this.RISK_THRESHOLDS.LOW) return 'low';
    return 'minimal';
  }
}

// Export singleton instance
export const fraudDetectionService = FraudDetectionService.getInstance();