/**
 * Loss Streak Tracker - Monitors and Analyzes Losing Streaks
 * Tracks losing streaks across all 6 trading entities and provides adaptive responses
 */

export interface LossStreak {
  id: string;
  entity: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  consecutiveLosses: number;
  totalLossAmount: number;
  averageLossSize: number;
  longestStreakDuration: number; // in minutes
  streakTrades: StreakTrade[];
  marketConditions: MarketCondition[];
  psychologicalImpact: PsychologicalAssessment;
  adaptiveActions: AdaptiveAction[];
}

export interface StreakTrade {
  id: string;
  timestamp: Date;
  symbol: string;
  action: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  loss: number;
  lossPercentage: number;
  confidence: number;
  reason: string;
  marketCondition: string;
  emotionalState: string;
}

export interface MarketCondition {
  timestamp: Date;
  condition: 'bull' | 'bear' | 'sideways' | 'volatile' | 'crash';
  volatility: number;
  sentiment: number;
  volume: number;
  fearGreedIndex: number;
}

export interface PsychologicalAssessment {
  stressLevel: number;           // 0-100 stress level
  confidenceImpact: number;      // -1 to 1 change in confidence
  riskAversion: number;          // 0-1 current risk aversion level
  emotionalState: 'calm' | 'anxious' | 'frustrated' | 'panicked' | 'numb';
  behaviorPattern: 'revenge_trading' | 'over_cautious' | 'analysis_paralysis' | 'normal';
  recoveryTimeEstimate: number;  // minutes until psychological recovery
}

export interface AdaptiveAction {
  id: string;
  timestamp: Date;
  actionType: 'position_reduction' | 'strategy_pause' | 'risk_limit_reduction' | 'model_retrain' | 'psychological_break' | 'strategy_switch';
  severity: 'minor' | 'moderate' | 'major' | 'emergency';
  description: string;
  parameters: Record<string, any>;
  effectiveness?: number;        // 0-1 rating after implementation
  duration?: number;             // minutes the action should last
  isActive: boolean;
}

export interface StreakAlert {
  id: string;
  entity: string;
  alertType: 'streak_warning' | 'streak_critical' | 'psychological_concern' | 'model_failure' | 'emergency_intervention';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
  triggeredAt: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  triggerConditions: Record<string, any>;
}

export interface StreakStatistics {
  entity: string;
  totalStreaks: number;
  activeStreaks: number;
  longestStreak: number;
  averageStreakLength: number;
  totalLossesFromStreaks: number;
  recoveryRate: number;          // Percentage of streaks that ended profitably
  timeToRecovery: number;        // Average time to break streak (minutes)
  commonPatterns: StreakPattern[];
  riskFactors: RiskFactor[];
}

export interface StreakPattern {
  pattern: string;
  frequency: number;
  averageLength: number;
  typicalOutcome: string;
  recommendations: string[];
}

export interface RiskFactor {
  factor: string;
  correlationStrength: number;   // 0-1
  description: string;
  mitigation: string;
}

export class LossStreakTracker {
  private activeStreaks = new Map<string, LossStreak>();
  private streakHistory: LossStreak[] = [];
  private alerts = new Map<string, StreakAlert>();
  private entityStatistics = new Map<string, StreakStatistics>();
  
  private readonly STREAK_THRESHOLDS = {
    WARNING: 3,      // 3 consecutive losses triggers warning
    CRITICAL: 5,     // 5 consecutive losses triggers critical alert
    EMERGENCY: 8,    // 8 consecutive losses triggers emergency intervention
    MAX_TRACKED: 50  // Maximum streak length to track
  };

  private readonly PSYCHOLOGICAL_THRESHOLDS = {
    STRESS_HIGH: 70,
    STRESS_CRITICAL: 85,
    CONFIDENCE_LOSS_MAJOR: -0.3,
    RECOVERY_TIME_LONG: 240 // 4 hours
  };

  constructor() {
    this.initializeEntityStatistics();
    this.startMonitoring();
    console.log('📉 Loss Streak Tracker initialized - monitoring all entities for losing patterns');
  }

  private initializeEntityStatistics(): void {
    const entities = ['alpha', 'beta', 'gamma', 'omega', 'delta', 'epsilon'];
    
    entities.forEach(entity => {
      this.entityStatistics.set(entity, {
        entity,
        totalStreaks: 0,
        activeStreaks: 0,
        longestStreak: 0,
        averageStreakLength: 0,
        totalLossesFromStreaks: 0,
        recoveryRate: 0,
        timeToRecovery: 0,
        commonPatterns: [],
        riskFactors: []
      });
    });
  }

  public recordTrade(
    entity: string,
    trade: {
      id: string;
      symbol: string;
      action: 'BUY' | 'SELL';
      entryPrice: number;
      exitPrice: number;
      quantity: number;
      confidence: number;
      reason: string;
      timestamp: Date;
    },
    marketCondition: MarketCondition
  ): void {
    
    const pnl = this.calculatePnL(trade);
    const isLoss = pnl < 0;
    
    if (isLoss) {
      this.handleLosingTrade(entity, trade, pnl, marketCondition);
    } else {
      this.handleWinningTrade(entity, trade, pnl);
    }
  }

  private calculatePnL(trade: {
    action: 'BUY' | 'SELL';
    entryPrice: number;
    exitPrice: number;
    quantity: number;
  }): number {
    
    if (trade.action === 'BUY') {
      return (trade.exitPrice - trade.entryPrice) * trade.quantity;
    } else {
      return (trade.entryPrice - trade.exitPrice) * trade.quantity;
    }
  }

  private handleLosingTrade(
    entity: string,
    trade: any,
    loss: number,
    marketCondition: MarketCondition
  ): void {
    
    const lossPercentage = Math.abs(loss) / (trade.entryPrice * trade.quantity);
    
    const streakTrade: StreakTrade = {
      id: trade.id,
      timestamp: trade.timestamp,
      symbol: trade.symbol,
      action: trade.action,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      quantity: trade.quantity,
      loss: Math.abs(loss),
      lossPercentage,
      confidence: trade.confidence,
      reason: trade.reason,
      marketCondition: marketCondition.condition,
      emotionalState: this.assessEmotionalState(entity, lossPercentage)
    };

    // Get or create active streak
    let streak = this.activeStreaks.get(entity);
    
    if (!streak) {
      // Start new streak
      streak = this.createNewStreak(entity, streakTrade, marketCondition);
      this.activeStreaks.set(entity, streak);
    } else {
      // Extend existing streak
      this.extendStreak(streak, streakTrade, marketCondition);
    }

    // Check for alert conditions
    this.checkAlertConditions(streak);
    
    // Apply adaptive actions if needed
    this.applyAdaptiveActions(streak);
    
    console.log(`📉 Loss recorded for ${entity}: ${loss.toFixed(2)} (Streak: ${streak.consecutiveLosses})`);
  }

  private handleWinningTrade(entity: string, trade: any, profit: number): void {
    const activeStreak = this.activeStreaks.get(entity);
    
    if (activeStreak && activeStreak.isActive) {
      // End the streak
      this.endStreak(activeStreak, trade.timestamp);
      console.log(`✅ ${entity} broke losing streak of ${activeStreak.consecutiveLosses} trades with profit: ${profit.toFixed(2)}`);
    }
  }

  private createNewStreak(
    entity: string,
    firstTrade: StreakTrade,
    marketCondition: MarketCondition
  ): LossStreak {
    
    const streak: LossStreak = {
      id: `streak_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entity,
      startTime: firstTrade.timestamp,
      isActive: true,
      consecutiveLosses: 1,
      totalLossAmount: firstTrade.loss,
      averageLossSize: firstTrade.loss,
      longestStreakDuration: 0,
      streakTrades: [firstTrade],
      marketConditions: [marketCondition],
      psychologicalImpact: this.assessPsychologicalImpact(entity, 1, firstTrade.loss),
      adaptiveActions: []
    };

    return streak;
  }

  private extendStreak(
    streak: LossStreak,
    newTrade: StreakTrade,
    marketCondition: MarketCondition
  ): void {
    
    streak.consecutiveLosses++;
    streak.totalLossAmount += newTrade.loss;
    streak.averageLossSize = streak.totalLossAmount / streak.consecutiveLosses;
    streak.longestStreakDuration = newTrade.timestamp.getTime() - streak.startTime.getTime();
    streak.streakTrades.push(newTrade);
    streak.marketConditions.push(marketCondition);
    
    // Update psychological assessment
    streak.psychologicalImpact = this.assessPsychologicalImpact(
      streak.entity,
      streak.consecutiveLosses,
      streak.totalLossAmount
    );
  }

  private endStreak(streak: LossStreak, endTime: Date): void {
    streak.isActive = false;
    streak.endTime = endTime;
    streak.longestStreakDuration = endTime.getTime() - streak.startTime.getTime();
    
    // Move to history
    this.streakHistory.push(streak);
    this.activeStreaks.delete(streak.entity);
    
    // Update statistics
    this.updateEntityStatistics(streak.entity);
    
    // Resolve related alerts
    this.resolveStreakAlerts(streak.entity);
    
    // End adaptive actions
    streak.adaptiveActions.forEach(action => {
      action.isActive = false;
    });
  }

  private assessEmotionalState(entity: string, lossPercentage: number): string {
    const activeStreak = this.activeStreaks.get(entity);
    const streakLength = activeStreak?.consecutiveLosses || 0;
    
    if (lossPercentage > 0.1 || streakLength > 7) return 'panicked';
    if (lossPercentage > 0.05 || streakLength > 5) return 'frustrated';
    if (streakLength > 3) return 'anxious';
    if (streakLength > 6) return 'numb';
    return 'calm';
  }

  private assessPsychologicalImpact(
    entity: string,
    streakLength: number,
    totalLoss: number
  ): PsychologicalAssessment {
    
    // Calculate stress level (0-100)
    const baseStress = Math.min(100, streakLength * 10 + (totalLoss / 1000) * 5);
    
    // Calculate confidence impact (-1 to 1)
    const confidenceImpact = -Math.min(1, streakLength * 0.1 + (totalLoss / 5000) * 0.2);
    
    // Calculate risk aversion (0-1)
    const riskAversion = Math.min(1, 0.3 + (streakLength * 0.08));
    
    // Determine emotional state
    let emotionalState: PsychologicalAssessment['emotionalState'] = 'calm';
    if (baseStress > 80) emotionalState = 'panicked';
    else if (baseStress > 60) emotionalState = 'frustrated';
    else if (baseStress > 40) emotionalState = 'anxious';
    else if (streakLength > 8) emotionalState = 'numb';
    
    // Determine behavior pattern
    let behaviorPattern: PsychologicalAssessment['behaviorPattern'] = 'normal';
    if (streakLength > 5 && baseStress > 70) behaviorPattern = 'revenge_trading';
    else if (baseStress > 60) behaviorPattern = 'over_cautious';
    else if (streakLength > 7) behaviorPattern = 'analysis_paralysis';
    
    // Estimate recovery time
    const recoveryTimeEstimate = Math.min(480, streakLength * 15 + baseStress * 2); // Max 8 hours
    
    return {
      stressLevel: baseStress,
      confidenceImpact,
      riskAversion,
      emotionalState,
      behaviorPattern,
      recoveryTimeEstimate
    };
  }

  private checkAlertConditions(streak: LossStreak): void {
    const { consecutiveLosses, psychologicalImpact, entity } = streak;
    
    // Streak length alerts
    if (consecutiveLosses >= this.STREAK_THRESHOLDS.EMERGENCY) {
      this.createAlert(
        entity,
        'emergency_intervention',
        'critical',
        `EMERGENCY: ${consecutiveLosses} consecutive losses detected`,
        'Immediate intervention required - halt trading and reassess strategy',
        { consecutiveLosses, totalLoss: streak.totalLossAmount }
      );
    } else if (consecutiveLosses >= this.STREAK_THRESHOLDS.CRITICAL) {
      this.createAlert(
        entity,
        'streak_critical',
        'high',
        `Critical losing streak: ${consecutiveLosses} consecutive losses`,
        'Implement emergency risk reduction measures and consider strategy review',
        { consecutiveLosses, totalLoss: streak.totalLossAmount }
      );
    } else if (consecutiveLosses >= this.STREAK_THRESHOLDS.WARNING) {
      this.createAlert(
        entity,
        'streak_warning',
        'medium',
        `Warning: ${consecutiveLosses} consecutive losses detected`,
        'Monitor closely and consider risk reduction measures',
        { consecutiveLosses }
      );
    }

    // Psychological alerts
    if (psychologicalImpact.stressLevel >= this.PSYCHOLOGICAL_THRESHOLDS.STRESS_CRITICAL) {
      this.createAlert(
        entity,
        'psychological_concern',
        'high',
        `Critical stress level: ${psychologicalImpact.stressLevel}%`,
        'Immediate psychological intervention recommended',
        { stressLevel: psychologicalImpact.stressLevel, emotionalState: psychologicalImpact.emotionalState }
      );
    }

    // Model failure alert
    if (consecutiveLosses >= 10) {
      this.createAlert(
        entity,
        'model_failure',
        'critical',
        'Potential model failure - excessive consecutive losses',
        'Urgent model review and retraining required',
        { consecutiveLosses, modelEffectiveness: 'critically_low' }
      );
    }
  }

  private createAlert(
    entity: string,
    alertType: StreakAlert['alertType'],
    severity: StreakAlert['severity'],
    message: string,
    recommendation: string,
    triggerConditions: Record<string, any>
  ): void {
    
    const alert: StreakAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entity,
      alertType,
      severity,
      message,
      recommendation,
      triggeredAt: new Date(),
      isResolved: false,
      triggerConditions
    };

    this.alerts.set(alert.id, alert);
    
    console.log(`🚨 LOSS STREAK ALERT [${severity.toUpperCase()}] ${entity}: ${message}`);
  }

  private applyAdaptiveActions(streak: LossStreak): void {
    const { consecutiveLosses, psychologicalImpact, entity } = streak;
    
    // Apply position size reduction
    if (consecutiveLosses >= 3 && !this.hasActiveAction(streak, 'position_reduction')) {
      const reductionFactor = Math.min(0.8, 1 - (consecutiveLosses * 0.1));
      this.addAdaptiveAction(streak, {
        actionType: 'position_reduction',
        severity: consecutiveLosses >= 5 ? 'major' : 'moderate',
        description: `Reduce position sizes by ${((1 - reductionFactor) * 100).toFixed(0)}%`,
        parameters: { reductionFactor, originalTrigger: consecutiveLosses },
        duration: Math.max(60, consecutiveLosses * 30) // At least 1 hour
      });
    }

    // Apply strategy pause
    if (consecutiveLosses >= 5 && !this.hasActiveAction(streak, 'strategy_pause')) {
      this.addAdaptiveAction(streak, {
        actionType: 'strategy_pause',
        severity: 'major',
        description: 'Pause trading strategy for analysis and recovery',
        parameters: { pauseDuration: consecutiveLosses * 15 },
        duration: consecutiveLosses * 15 // 15 minutes per loss
      });
    }

    // Apply psychological break
    if (psychologicalImpact.stressLevel >= this.PSYCHOLOGICAL_THRESHOLDS.STRESS_HIGH) {
      this.addAdaptiveAction(streak, {
        actionType: 'psychological_break',
        severity: psychologicalImpact.stressLevel >= this.PSYCHOLOGICAL_THRESHOLDS.STRESS_CRITICAL ? 'emergency' : 'major',
        description: 'Implement psychological recovery break',
        parameters: { 
          stressLevel: psychologicalImpact.stressLevel,
          recoveryActivities: ['meditation', 'analysis', 'strategy_review']
        },
        duration: psychologicalImpact.recoveryTimeEstimate
      });
    }

    // Apply model retraining
    if (consecutiveLosses >= 7 && !this.hasActiveAction(streak, 'model_retrain')) {
      this.addAdaptiveAction(streak, {
        actionType: 'model_retrain',
        severity: 'major',
        description: 'Trigger emergency model retraining',
        parameters: { 
          priority: 'high',
          includeRecentData: true,
          analysisDepth: 'comprehensive'
        },
        duration: 180 // 3 hours
      });
    }
  }

  private hasActiveAction(streak: LossStreak, actionType: string): boolean {
    return streak.adaptiveActions.some(action => 
      action.actionType === actionType && action.isActive
    );
  }

  private addAdaptiveAction(streak: LossStreak, actionConfig: Partial<AdaptiveAction>): void {
    const action: AdaptiveAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      actionType: actionConfig.actionType!,
      severity: actionConfig.severity!,
      description: actionConfig.description!,
      parameters: actionConfig.parameters || {},
      duration: actionConfig.duration,
      isActive: true
    };

    streak.adaptiveActions.push(action);
    
    console.log(`🔧 Applied adaptive action for ${streak.entity}: ${action.description}`);
  }

  private updateEntityStatistics(entity: string): void {
    const stats = this.entityStatistics.get(entity);
    if (!stats) return;

    const entityStreaks = this.streakHistory.filter(s => s.entity === entity);
    
    stats.totalStreaks = entityStreaks.length;
    stats.activeStreaks = this.activeStreaks.has(entity) ? 1 : 0;
    stats.longestStreak = Math.max(...entityStreaks.map(s => s.consecutiveLosses), 0);
    stats.averageStreakLength = entityStreaks.length > 0 
      ? entityStreaks.reduce((sum, s) => sum + s.consecutiveLosses, 0) / entityStreaks.length 
      : 0;
    stats.totalLossesFromStreaks = entityStreaks.reduce((sum, s) => sum + s.totalLossAmount, 0);
    
    // Calculate recovery rate (streaks that were broken with wins)
    const brokenStreaks = entityStreaks.filter(s => !s.isActive);
    stats.recoveryRate = brokenStreaks.length > 0 ? brokenStreaks.length / entityStreaks.length : 0;
    
    // Calculate average time to recovery
    stats.timeToRecovery = brokenStreaks.length > 0
      ? brokenStreaks.reduce((sum, s) => sum + s.longestStreakDuration, 0) / brokenStreaks.length / 60000 // Convert to minutes
      : 0;

    // Update patterns and risk factors
    stats.commonPatterns = this.analyzeStreakPatterns(entityStreaks);
    stats.riskFactors = this.identifyRiskFactors(entityStreaks);
  }

  private analyzeStreakPatterns(streaks: LossStreak[]): StreakPattern[] {
    // Simplified pattern analysis
    const patterns: StreakPattern[] = [];
    
    // Analyze by market condition
    const conditionGroups = this.groupStreaksByCondition(streaks);
    Object.entries(conditionGroups).forEach(([condition, conditionStreaks]) => {
      if (conditionStreaks.length >= 2) {
        patterns.push({
          pattern: `Streaks during ${condition} markets`,
          frequency: conditionStreaks.length,
          averageLength: conditionStreaks.reduce((sum, s) => sum + s.consecutiveLosses, 0) / conditionStreaks.length,
          typicalOutcome: conditionStreaks.some(s => !s.isActive) ? 'recovered' : 'ongoing',
          recommendations: this.getConditionRecommendations(condition)
        });
      }
    });

    return patterns;
  }

  private groupStreaksByCondition(streaks: LossStreak[]): Record<string, LossStreak[]> {
    const groups: Record<string, LossStreak[]> = {};
    
    streaks.forEach(streak => {
      const dominantCondition = this.getDominantMarketCondition(streak.marketConditions);
      if (!groups[dominantCondition]) {
        groups[dominantCondition] = [];
      }
      groups[dominantCondition].push(streak);
    });
    
    return groups;
  }

  private getDominantMarketCondition(conditions: MarketCondition[]): string {
    const conditionCounts: Record<string, number> = {};
    
    conditions.forEach(condition => {
      conditionCounts[condition.condition] = (conditionCounts[condition.condition] || 0) + 1;
    });
    
    return Object.entries(conditionCounts).reduce((a, b) => 
      conditionCounts[a[0]] > conditionCounts[b[0]] ? a : b
    )[0];
  }

  private getConditionRecommendations(condition: string): string[] {
    const recommendations: Record<string, string[]> = {
      bull: ['Avoid fighting the trend', 'Use smaller position sizes in strong trends'],
      bear: ['Implement tighter stop losses', 'Consider short strategies'],
      sideways: ['Use range trading strategies', 'Avoid momentum strategies'],
      volatile: ['Reduce position sizes significantly', 'Use wider stops or no stops'],
      crash: ['Exit all positions immediately', 'Wait for stabilization']
    };
    
    return recommendations[condition] || ['Monitor market conditions closely'];
  }

  private identifyRiskFactors(streaks: LossStreak[]): RiskFactor[] {
    // Simplified risk factor analysis
    return [
      {
        factor: 'High Volatility Periods',
        correlationStrength: 0.7,
        description: 'Streaks more likely during high volatility',
        mitigation: 'Reduce position sizes when volatility exceeds 5%'
      },
      {
        factor: 'Overconfidence After Wins',
        correlationStrength: 0.6,
        description: 'Streaks often follow periods of high confidence',
        mitigation: 'Implement confidence-based position sizing'
      },
      {
        factor: 'Market Condition Changes',
        correlationStrength: 0.5,
        description: 'Strategy fails when market conditions shift',
        mitigation: 'Implement regime detection and strategy switching'
      }
    ];
  }

  private resolveStreakAlerts(entity: string): void {
    this.alerts.forEach((alert, alertId) => {
      if (alert.entity === entity && !alert.isResolved) {
        alert.isResolved = true;
        alert.resolvedAt = new Date();
        console.log(`✅ Resolved streak alert for ${entity}: ${alert.message}`);
      }
    });
  }

  private startMonitoring(): void {
    // Clean up old data and update statistics periodically
    setInterval(() => {
      this.performHousekeeping();
    }, 60 * 60 * 1000); // Every hour
  }

  private performHousekeeping(): void {
    // Remove old alerts
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.alerts.forEach((alert, alertId) => {
      if (alert.isResolved && alert.resolvedAt && alert.resolvedAt < oneDayAgo) {
        this.alerts.delete(alertId);
      }
    });

    // Update statistics for all entities
    this.entityStatistics.forEach((_, entity) => {
      this.updateEntityStatistics(entity);
    });

    // End expired adaptive actions
    this.activeStreaks.forEach(streak => {
      streak.adaptiveActions.forEach(action => {
        if (action.isActive && action.duration) {
          const elapsed = Date.now() - action.timestamp.getTime();
          if (elapsed > action.duration * 60 * 1000) { // Convert minutes to ms
            action.isActive = false;
            console.log(`⏰ Expired adaptive action for ${streak.entity}: ${action.description}`);
          }
        }
      });
    });
  }

  public getEntityStatistics(entity: string): StreakStatistics | undefined {
    return this.entityStatistics.get(entity);
  }

  public getActiveStreaks(): LossStreak[] {
    return Array.from(this.activeStreaks.values());
  }

  public getActiveAlerts(entity?: string): StreakAlert[] {
    const alerts = Array.from(this.alerts.values()).filter(a => !a.isResolved);
    return entity ? alerts.filter(a => a.entity === entity) : alerts;
  }

  public getStreakHistory(entity?: string, days: number = 30): LossStreak[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    let streaks = this.streakHistory.filter(s => s.startTime >= cutoffDate);
    return entity ? streaks.filter(s => s.entity === entity) : streaks;
  }

  public getOverallStatistics(): {
    totalActiveStreaks: number;
    totalActiveAlerts: number;
    entitiesAffected: string[];
    longestCurrentStreak: number;
    totalLossesFromActiveStreaks: number;
    averageRecoveryTime: number;
  } {
    
    const activeStreaks = Array.from(this.activeStreaks.values());
    const activeAlerts = Array.from(this.alerts.values()).filter(a => !a.isResolved);
    const entitiesAffected = Array.from(new Set(activeStreaks.map(s => s.entity)));
    const longestStreak = Math.max(...activeStreaks.map(s => s.consecutiveLosses), 0);
    const totalLosses = activeStreaks.reduce((sum, s) => sum + s.totalLossAmount, 0);
    
    const allStats = Array.from(this.entityStatistics.values());
    const avgRecovery = allStats.reduce((sum, stat) => sum + stat.timeToRecovery, 0) / allStats.length;

    return {
      totalActiveStreaks: activeStreaks.length,
      totalActiveAlerts: activeAlerts.length,
      entitiesAffected,
      longestCurrentStreak: longestStreak,
      totalLossesFromActiveStreaks: totalLosses,
      averageRecoveryTime: avgRecovery
    };
  }
}

// Export singleton instance
let lossStreakTrackerInstance: LossStreakTracker | null = null;

export function getLossStreakTracker(): LossStreakTracker {
  if (!lossStreakTrackerInstance) {
    lossStreakTrackerInstance = new LossStreakTracker();
  }
  return lossStreakTrackerInstance;
}