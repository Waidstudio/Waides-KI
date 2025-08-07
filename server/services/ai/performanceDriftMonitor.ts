/**
 * Performance Drift Monitor - Detects Model Performance Degradation
 * Monitors all 6 trading entities for performance drift and triggers alerts
 */

import { AIModel, ModelPerformance } from './modelTrainer';
import { getModelTrainer } from './modelTrainer';

export interface DriftAlert {
  id: string;
  modelId: string;
  entity: string;
  alertType: 'accuracy_drift' | 'profitability_drift' | 'volume_drift' | 'behavior_change' | 'critical_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  currentValue: number;
  baselineValue: number;
  thresholdBreached: number;
  driftPercentage: number;
  recommendation: string;
  isResolved: boolean;
  resolvedAt?: Date;
  metadata: Record<string, any>;
}

export interface PerformanceSnapshot {
  modelId: string;
  entity: string;
  timestamp: Date;
  metrics: ModelPerformance;
  tradingVolume: number;
  marketCondition: string;
  sessionId: string;
}

export interface DriftThresholds {
  accuracyDrift: number;        // % drop in accuracy that triggers alert
  profitabilityDrift: number;   // % drop in profitability
  sharpeRatioDrift: number;     // Drop in Sharpe ratio
  drawdownIncrease: number;     // % increase in max drawdown
  volumeDropThreshold: number;  // % drop in trading volume
  consecutiveFailures: number;  // Number of consecutive failed trades
  timeWindow: number;           // Time window for drift detection (hours)
}

export class PerformanceDriftMonitor {
  private performanceHistory = new Map<string, PerformanceSnapshot[]>();
  private activeAlerts = new Map<string, DriftAlert[]>();
  private monitoringInterval?: NodeJS.Timeout;
  private modelTrainer = getModelTrainer();

  private readonly defaultThresholds: DriftThresholds = {
    accuracyDrift: 0.05,        // 5% accuracy drop
    profitabilityDrift: 0.10,   // 10% profitability drop
    sharpeRatioDrift: 0.3,      // 0.3 point Sharpe drop
    drawdownIncrease: 0.05,     // 5% increase in drawdown
    volumeDropThreshold: 0.30,  // 30% volume drop
    consecutiveFailures: 5,     // 5 consecutive failures
    timeWindow: 24              // 24 hour window
  };

  private entityThresholds = new Map<string, Partial<DriftThresholds>>();

  constructor() {
    this.initializeEntityThresholds();
    this.startMonitoring();
    console.log('📊 Performance Drift Monitor initialized for all entities');
  }

  private initializeEntityThresholds(): void {
    // Different entities have different sensitivity thresholds
    this.entityThresholds.set('alpha', {
      accuracyDrift: 0.08,       // More tolerant for basic bot
      profitabilityDrift: 0.15
    });
    
    this.entityThresholds.set('beta', {
      accuracyDrift: 0.06,
      profitabilityDrift: 0.12
    });
    
    this.entityThresholds.set('gamma', {
      accuracyDrift: 0.04,       // Less tolerant for advanced trader
      profitabilityDrift: 0.08,
      consecutiveFailures: 3
    });
    
    this.entityThresholds.set('omega', {
      accuracyDrift: 0.03,       // Very strict for full engine
      profitabilityDrift: 0.06,
      sharpeRatioDrift: 0.2,
      consecutiveFailures: 3
    });
    
    this.entityThresholds.set('delta', {
      accuracyDrift: 0.05,
      profitabilityDrift: 0.09,
      volumeDropThreshold: 0.25  // Energy distribution sensitive to volume
    });
    
    this.entityThresholds.set('epsilon', {
      accuracyDrift: 0.10,       // More tolerant for backup system
      profitabilityDrift: 0.20,
      consecutiveFailures: 8
    });
  }

  public recordPerformanceSnapshot(
    modelId: string,
    entity: string,
    metrics: ModelPerformance,
    tradingVolume: number = 0,
    marketCondition: string = 'normal'
  ): void {
    const snapshot: PerformanceSnapshot = {
      modelId,
      entity,
      timestamp: new Date(),
      metrics,
      tradingVolume,
      marketCondition,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Get or create history for this model
    if (!this.performanceHistory.has(modelId)) {
      this.performanceHistory.set(modelId, []);
    }

    const history = this.performanceHistory.get(modelId)!;
    history.push(snapshot);

    // Keep only last 168 hours (7 days) of data
    const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const filteredHistory = history.filter(h => h.timestamp > cutoffTime);
    this.performanceHistory.set(modelId, filteredHistory);

    // Check for drift immediately after recording
    this.checkForDrift(modelId, entity);
  }

  private checkForDrift(modelId: string, entity: string): void {
    const history = this.performanceHistory.get(modelId);
    if (!history || history.length < 10) return; // Need at least 10 snapshots

    const thresholds = this.getThresholdsForEntity(entity);
    const recentSnapshots = this.getRecentSnapshots(history, thresholds.timeWindow);
    const baselineSnapshots = this.getBaselineSnapshots(history, thresholds.timeWindow);

    if (recentSnapshots.length < 5 || baselineSnapshots.length < 5) return;

    const recentMetrics = this.calculateAverageMetrics(recentSnapshots);
    const baselineMetrics = this.calculateAverageMetrics(baselineSnapshots);

    // Check each type of drift
    this.checkAccuracyDrift(modelId, entity, recentMetrics, baselineMetrics, thresholds);
    this.checkProfitabilityDrift(modelId, entity, recentMetrics, baselineMetrics, thresholds);
    this.checkSharpeRatioDrift(modelId, entity, recentMetrics, baselineMetrics, thresholds);
    this.checkDrawdownIncrease(modelId, entity, recentMetrics, baselineMetrics, thresholds);
    this.checkVolumeDrift(modelId, entity, recentSnapshots, baselineSnapshots, thresholds);
    this.checkConsecutiveFailures(modelId, entity, recentSnapshots, thresholds);
  }

  private getThresholdsForEntity(entity: string): DriftThresholds {
    const entitySpecific = this.entityThresholds.get(entity) || {};
    return { ...this.defaultThresholds, ...entitySpecific };
  }

  private getRecentSnapshots(history: PerformanceSnapshot[], timeWindowHours: number): PerformanceSnapshot[] {
    const cutoffTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
    return history.filter(h => h.timestamp >= cutoffTime);
  }

  private getBaselineSnapshots(history: PerformanceSnapshot[], timeWindowHours: number): PerformanceSnapshot[] {
    const recentCutoff = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
    const baselineCutoff = new Date(Date.now() - 2 * timeWindowHours * 60 * 60 * 1000);
    return history.filter(h => h.timestamp >= baselineCutoff && h.timestamp < recentCutoff);
  }

  private calculateAverageMetrics(snapshots: PerformanceSnapshot[]): ModelPerformance {
    const count = snapshots.length;
    if (count === 0) throw new Error('No snapshots to average');

    const sum = snapshots.reduce((acc, snapshot) => {
      Object.keys(snapshot.metrics).forEach(key => {
        const typedKey = key as keyof ModelPerformance;
        if (typeof snapshot.metrics[typedKey] === 'number') {
          acc[typedKey] = (acc[typedKey] || 0) + snapshot.metrics[typedKey] as number;
        }
      });
      return acc;
    }, {} as Partial<ModelPerformance>);

    const averaged = {} as ModelPerformance;
    Object.keys(sum).forEach(key => {
      const typedKey = key as keyof ModelPerformance;
      averaged[typedKey] = (sum[typedKey] as number) / count;
    });

    return averaged;
  }

  private checkAccuracyDrift(
    modelId: string,
    entity: string,
    recent: ModelPerformance,
    baseline: ModelPerformance,
    thresholds: DriftThresholds
  ): void {
    const drift = baseline.accuracy - recent.accuracy;
    const driftPercentage = (drift / baseline.accuracy) * 100;

    if (drift > thresholds.accuracyDrift) {
      const severity = drift > thresholds.accuracyDrift * 2 ? 'critical' : 
                     drift > thresholds.accuracyDrift * 1.5 ? 'high' : 'medium';

      this.createDriftAlert({
        modelId,
        entity,
        alertType: 'accuracy_drift',
        severity,
        currentValue: recent.accuracy,
        baselineValue: baseline.accuracy,
        thresholdBreached: thresholds.accuracyDrift,
        driftPercentage,
        recommendation: this.getAccuracyDriftRecommendation(severity, driftPercentage)
      });
    }
  }

  private checkProfitabilityDrift(
    modelId: string,
    entity: string,
    recent: ModelPerformance,
    baseline: ModelPerformance,
    thresholds: DriftThresholds
  ): void {
    const drift = baseline.profitability - recent.profitability;
    const driftPercentage = baseline.profitability !== 0 ? (drift / Math.abs(baseline.profitability)) * 100 : 0;

    if (drift > thresholds.profitabilityDrift) {
      const severity = drift > thresholds.profitabilityDrift * 2 ? 'critical' : 'high';

      this.createDriftAlert({
        modelId,
        entity,
        alertType: 'profitability_drift',
        severity,
        currentValue: recent.profitability,
        baselineValue: baseline.profitability,
        thresholdBreached: thresholds.profitabilityDrift,
        driftPercentage,
        recommendation: this.getProfitabilityDriftRecommendation(severity, recent.profitability)
      });
    }
  }

  private checkSharpeRatioDrift(
    modelId: string,
    entity: string,
    recent: ModelPerformance,
    baseline: ModelPerformance,
    thresholds: DriftThresholds
  ): void {
    const drift = baseline.sharpeRatio - recent.sharpeRatio;

    if (drift > thresholds.sharpeRatioDrift) {
      const severity = drift > thresholds.sharpeRatioDrift * 1.5 ? 'high' : 'medium';

      this.createDriftAlert({
        modelId,
        entity,
        alertType: 'behavior_change',
        severity,
        currentValue: recent.sharpeRatio,
        baselineValue: baseline.sharpeRatio,
        thresholdBreached: thresholds.sharpeRatioDrift,
        driftPercentage: (drift / Math.abs(baseline.sharpeRatio)) * 100,
        recommendation: 'Sharpe ratio decline indicates risk-adjusted returns are deteriorating. Review risk management parameters.'
      });
    }
  }

  private checkDrawdownIncrease(
    modelId: string,
    entity: string,
    recent: ModelPerformance,
    baseline: ModelPerformance,
    thresholds: DriftThresholds
  ): void {
    const increase = recent.maxDrawdown - baseline.maxDrawdown;
    const increasePercentage = (increase / baseline.maxDrawdown) * 100;

    if (increase > thresholds.drawdownIncrease) {
      const severity = increase > thresholds.drawdownIncrease * 2 ? 'critical' : 'high';

      this.createDriftAlert({
        modelId,
        entity,
        alertType: 'behavior_change',
        severity,
        currentValue: recent.maxDrawdown,
        baselineValue: baseline.maxDrawdown,
        thresholdBreached: thresholds.drawdownIncrease,
        driftPercentage: increasePercentage,
        recommendation: 'Maximum drawdown has increased significantly. Consider tightening stop-losses or reducing position sizes.'
      });
    }
  }

  private checkVolumeDrift(
    modelId: string,
    entity: string,
    recentSnapshots: PerformanceSnapshot[],
    baselineSnapshots: PerformanceSnapshot[],
    thresholds: DriftThresholds
  ): void {
    const recentVolume = recentSnapshots.reduce((sum, s) => sum + s.tradingVolume, 0) / recentSnapshots.length;
    const baselineVolume = baselineSnapshots.reduce((sum, s) => sum + s.tradingVolume, 0) / baselineSnapshots.length;

    if (baselineVolume === 0) return;

    const volumeChange = (baselineVolume - recentVolume) / baselineVolume;

    if (volumeChange > thresholds.volumeDropThreshold) {
      this.createDriftAlert({
        modelId,
        entity,
        alertType: 'volume_drift',
        severity: volumeChange > 0.5 ? 'high' : 'medium',
        currentValue: recentVolume,
        baselineValue: baselineVolume,
        thresholdBreached: thresholds.volumeDropThreshold,
        driftPercentage: volumeChange * 100,
        recommendation: 'Trading volume has dropped significantly. Check if model is properly identifying opportunities.'
      });
    }
  }

  private checkConsecutiveFailures(
    modelId: string,
    entity: string,
    recentSnapshots: PerformanceSnapshot[],
    thresholds: DriftThresholds
  ): void {
    // Check for consecutive losing trades (simplified - would need actual trade data)
    const recentFailures = recentSnapshots.filter(s => s.metrics.profitability < 0).length;
    
    if (recentFailures >= thresholds.consecutiveFailures && recentSnapshots.length >= thresholds.consecutiveFailures) {
      this.createDriftAlert({
        modelId,
        entity,
        alertType: 'critical_failure',
        severity: 'critical',
        currentValue: recentFailures,
        baselineValue: 0,
        thresholdBreached: thresholds.consecutiveFailures,
        driftPercentage: 100,
        recommendation: 'Multiple consecutive failures detected. Consider halting trading and retraining the model immediately.'
      });
    }
  }

  private createDriftAlert(alertData: Omit<DriftAlert, 'id' | 'detectedAt' | 'isResolved' | 'metadata'>): void {
    const alert: DriftAlert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      detectedAt: new Date(),
      isResolved: false,
      metadata: {
        detectionMethod: 'statistical_drift',
        timeWindow: this.getThresholdsForEntity(alertData.entity).timeWindow,
        marketCondition: 'unknown' // Would be determined from market data
      }
    };

    // Add to active alerts
    if (!this.activeAlerts.has(alertData.modelId)) {
      this.activeAlerts.set(alertData.modelId, []);
    }
    
    const modelAlerts = this.activeAlerts.get(alertData.modelId)!;
    
    // Check if similar alert already exists
    const existingSimilar = modelAlerts.find(a => 
      a.alertType === alert.alertType && 
      !a.isResolved && 
      Math.abs(a.detectedAt.getTime() - alert.detectedAt.getTime()) < 60 * 60 * 1000 // 1 hour
    );

    if (!existingSimilar) {
      modelAlerts.push(alert);
      console.log(`🚨 DRIFT ALERT [${alert.severity.toUpperCase()}] for ${alert.entity}: ${alert.alertType} - ${alert.recommendation}`);
      
      // Trigger automatic actions based on severity
      this.handleDriftAlert(alert);
    }
  }

  private async handleDriftAlert(alert: DriftAlert): Promise<void> {
    switch (alert.severity) {
      case 'critical':
        console.log(`🔴 CRITICAL ALERT: Attempting automatic remediation for ${alert.entity}`);
        // In a real system, this might:
        // - Halt trading for the model
        // - Trigger emergency retraining
        // - Switch to backup model
        // - Send notifications to administrators
        break;
        
      case 'high':
        console.log(`🟠 HIGH ALERT: Scheduling retraining for ${alert.entity}`);
        // Schedule immediate retraining
        try {
          await this.modelTrainer.retrain(alert.modelId);
        } catch (error) {
          console.error(`Failed to retrain model ${alert.modelId}:`, error);
        }
        break;
        
      case 'medium':
      case 'low':
        console.log(`🟡 ${alert.severity.toUpperCase()} ALERT: Monitoring ${alert.entity} closely`);
        // Increase monitoring frequency
        break;
    }
  }

  private getAccuracyDriftRecommendation(severity: string, driftPercentage: number): string {
    if (severity === 'critical') {
      return `Critical accuracy drop of ${driftPercentage.toFixed(1)}%. Stop trading and retrain immediately with fresh data.`;
    } else if (severity === 'high') {
      return `Significant accuracy decline of ${driftPercentage.toFixed(1)}%. Schedule immediate retraining and review feature selection.`;
    } else {
      return `Moderate accuracy drift detected. Monitor closely and prepare for retraining if trend continues.`;
    }
  }

  private getProfitabilityDriftRecommendation(severity: string, currentProfitability: number): string {
    if (currentProfitability < -0.1) {
      return 'Model is showing significant losses. Halt trading immediately and investigate root cause.';
    } else if (currentProfitability < 0) {
      return 'Model profitability has turned negative. Reduce position sizes and expedite retraining.';
    } else {
      return 'Profitability has declined but remains positive. Monitor risk management and consider parameter tuning.';
    }
  }

  private startMonitoring(): void {
    // Run drift detection every 15 minutes
    this.monitoringInterval = setInterval(() => {
      this.runPeriodicDriftCheck();
    }, 15 * 60 * 1000);

    console.log('⏰ Drift monitoring scheduled every 15 minutes');
  }

  private runPeriodicDriftCheck(): void {
    // Check all models for drift
    this.performanceHistory.forEach((history, modelId) => {
      if (history.length > 0) {
        const latestSnapshot = history[history.length - 1];
        this.checkForDrift(modelId, latestSnapshot.entity);
      }
    });

    // Clean up resolved alerts older than 7 days
    this.cleanupOldAlerts();
  }

  private cleanupOldAlerts(): void {
    const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    this.activeAlerts.forEach((alerts, modelId) => {
      const filteredAlerts = alerts.filter(alert => 
        !alert.isResolved || 
        (alert.resolvedAt && alert.resolvedAt > cutoffTime) ||
        alert.detectedAt > cutoffTime
      );
      
      if (filteredAlerts.length !== alerts.length) {
        this.activeAlerts.set(modelId, filteredAlerts);
      }
    });
  }

  public resolveAlert(alertId: string): boolean {
    for (const alerts of this.activeAlerts.values()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.isResolved = true;
        alert.resolvedAt = new Date();
        console.log(`✅ Resolved drift alert: ${alert.alertType} for ${alert.entity}`);
        return true;
      }
    }
    return false;
  }

  public getActiveAlerts(modelId?: string): DriftAlert[] {
    if (modelId) {
      return this.activeAlerts.get(modelId)?.filter(a => !a.isResolved) || [];
    }
    
    const allAlerts: DriftAlert[] = [];
    this.activeAlerts.forEach(alerts => {
      allAlerts.push(...alerts.filter(a => !a.isResolved));
    });
    
    return allAlerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  public getPerformanceHistory(modelId: string, hours: number = 24): PerformanceSnapshot[] {
    const history = this.performanceHistory.get(modelId) || [];
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return history.filter(h => h.timestamp >= cutoffTime);
  }

  public getDriftStatistics(): {
    totalAlerts: number;
    activeAlerts: number;
    criticalAlerts: number;
    entitiesWithAlerts: string[];
    mostCommonAlertType: string;
    averageResolutionTime: number; // in hours
  } {
    const allAlerts: DriftAlert[] = [];
    this.activeAlerts.forEach(alerts => allAlerts.push(...alerts));

    const activeAlerts = allAlerts.filter(a => !a.isResolved);
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
    const entitiesWithAlerts = [...new Set(activeAlerts.map(a => a.entity))];

    // Find most common alert type
    const alertTypeCounts = allAlerts.reduce((counts, alert) => {
      counts[alert.alertType] = (counts[alert.alertType] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const mostCommonAlertType = Object.entries(alertTypeCounts).reduce((a, b) => 
      alertTypeCounts[a[0]] > alertTypeCounts[b[0]] ? a : b
    )[0] || 'none';

    // Calculate average resolution time
    const resolvedAlerts = allAlerts.filter(a => a.isResolved && a.resolvedAt);
    const avgResolutionTime = resolvedAlerts.length > 0 
      ? resolvedAlerts.reduce((sum, alert) => {
          const resolutionTimeMs = alert.resolvedAt!.getTime() - alert.detectedAt.getTime();
          return sum + (resolutionTimeMs / (60 * 60 * 1000)); // Convert to hours
        }, 0) / resolvedAlerts.length
      : 0;

    return {
      totalAlerts: allAlerts.length,
      activeAlerts: activeAlerts.length,
      criticalAlerts: criticalAlerts.length,
      entitiesWithAlerts,
      mostCommonAlertType,
      averageResolutionTime: avgResolutionTime
    };
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      console.log('📊 Drift monitoring stopped');
    }
  }
}

// Export singleton instance
let performanceDriftMonitorInstance: PerformanceDriftMonitor | null = null;

export function getPerformanceDriftMonitor(): PerformanceDriftMonitor {
  if (!performanceDriftMonitorInstance) {
    performanceDriftMonitorInstance = new PerformanceDriftMonitor();
  }
  return performanceDriftMonitorInstance;
}