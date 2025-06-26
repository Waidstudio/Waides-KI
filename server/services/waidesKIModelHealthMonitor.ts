/**
 * Waides KI Model Health Monitor - ML Drift Detection and Model Evaluation System
 * Monitors model performance degradation and data drift for continuous model health
 */

interface DriftMetrics {
  statistical_distance: number;
  p_value: number;
  drift_detected: boolean;
  drift_severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affected_features: string[];
  drift_timestamp: number;
}

interface ModelHealthStats {
  overall_health: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  health_score: number; // 0-100
  accuracy_trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  last_drift_check: number;
  consecutive_drift_alerts: number;
  model_age_days: number;
  recommendation: string;
}

interface PerformanceWindow {
  window_start: number;
  window_end: number;
  predictions: number[];
  actual_outcomes: number[];
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
}

export class WaidesKIModelHealthMonitor {
  private performanceHistory: PerformanceWindow[] = [];
  private baselineDistribution: number[] = [];
  private recentPredictions: number[] = [];
  private driftAlerts: DriftMetrics[] = [];
  private healthStats: ModelHealthStats;
  private monitoringEnabled: boolean = true;

  constructor() {
    this.healthStats = {
      overall_health: 'GOOD',
      health_score: 75,
      accuracy_trend: 'STABLE',
      last_drift_check: Date.now(),
      consecutive_drift_alerts: 0,
      model_age_days: 7,
      recommendation: 'Model performing within acceptable parameters'
    };

    this.initializeBaselineDistribution();
    this.startDriftMonitoring();
  }

  /**
   * Initialize baseline distribution for drift detection
   */
  private initializeBaselineDistribution(): void {
    // Simulate baseline prediction distribution
    for (let i = 0; i < 1000; i++) {
      this.baselineDistribution.push(Math.random());
    }
    console.log('📊 Initialized baseline distribution for drift detection');
  }

  /**
   * Record new prediction for drift monitoring
   */
  public recordPrediction(probability: number, actualOutcome?: number): void {
    this.recentPredictions.push(probability);

    // Keep only recent predictions (last 500)
    if (this.recentPredictions.length > 500) {
      this.recentPredictions = this.recentPredictions.slice(-500);
    }

    // If we have actual outcome, update performance window
    if (actualOutcome !== undefined) {
      this.updatePerformanceWindow(probability, actualOutcome);
    }
  }

  /**
   * Update performance window with actual outcomes
   */
  private updatePerformanceWindow(prediction: number, actualOutcome: number): void {
    const now = Date.now();
    const windowDuration = 24 * 60 * 60 * 1000; // 24 hours

    // Find or create current window
    let currentWindow = this.performanceHistory.find(
      window => now - window.window_start < windowDuration
    );

    if (!currentWindow) {
      currentWindow = {
        window_start: now,
        window_end: now + windowDuration,
        predictions: [],
        actual_outcomes: [],
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1_score: 0
      };
      this.performanceHistory.push(currentWindow);
    }

    currentWindow.predictions.push(prediction);
    currentWindow.actual_outcomes.push(actualOutcome);

    // Recalculate metrics
    this.calculateWindowMetrics(currentWindow);

    // Keep only last 30 windows
    if (this.performanceHistory.length > 30) {
      this.performanceHistory = this.performanceHistory.slice(-30);
    }
  }

  /**
   * Calculate metrics for performance window
   */
  private calculateWindowMetrics(window: PerformanceWindow): void {
    const predictions = window.predictions.map(p => p > 0.5 ? 1 : 0);
    const actuals = window.actual_outcomes;

    let correct = 0;
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i] === actuals[i]) correct++;
      if (predictions[i] === 1 && actuals[i] === 1) truePositives++;
      if (predictions[i] === 1 && actuals[i] === 0) falsePositives++;
      if (predictions[i] === 0 && actuals[i] === 1) falseNegatives++;
    }

    window.accuracy = correct / predictions.length;
    window.precision = truePositives / (truePositives + falsePositives) || 0;
    window.recall = truePositives / (truePositives + falseNegatives) || 0;
    window.f1_score = 2 * (window.precision * window.recall) / (window.precision + window.recall) || 0;
  }

  /**
   * Perform Kolmogorov-Smirnov test for drift detection
   */
  public checkDataDrift(): DriftMetrics {
    if (this.recentPredictions.length < 100) {
      return {
        statistical_distance: 0,
        p_value: 1.0,
        drift_detected: false,
        drift_severity: 'LOW',
        affected_features: [],
        drift_timestamp: Date.now()
      };
    }

    // Simplified KS test implementation
    const ksStatistic = this.calculateKSStatistic(
      this.baselineDistribution.slice(0, this.recentPredictions.length),
      this.recentPredictions
    );

    const pValue = this.calculateKSPValue(ksStatistic, this.recentPredictions.length);
    const driftDetected = pValue < 0.05; // 5% significance level
    
    let driftSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (pValue < 0.001) driftSeverity = 'CRITICAL';
    else if (pValue < 0.01) driftSeverity = 'HIGH';
    else if (pValue < 0.05) driftSeverity = 'MEDIUM';

    const driftMetrics: DriftMetrics = {
      statistical_distance: ksStatistic,
      p_value: pValue,
      drift_detected: driftDetected,
      drift_severity: driftSeverity,
      affected_features: driftDetected ? ['prediction_distribution'] : [],
      drift_timestamp: Date.now()
    };

    if (driftDetected) {
      this.driftAlerts.push(driftMetrics);
      this.healthStats.consecutive_drift_alerts++;
      console.log(`🚨 Data drift detected: ${driftSeverity} severity (p=${pValue.toFixed(4)})`);
    } else {
      this.healthStats.consecutive_drift_alerts = 0;
    }

    this.healthStats.last_drift_check = Date.now();
    return driftMetrics;
  }

  /**
   * Calculate Kolmogorov-Smirnov statistic
   */
  private calculateKSStatistic(baseline: number[], recent: number[]): number {
    const sortedBaseline = [...baseline].sort((a, b) => a - b);
    const sortedRecent = [...recent].sort((a, b) => a - b);
    
    let maxDistance = 0;
    let i = 0, j = 0;
    
    while (i < sortedBaseline.length && j < sortedRecent.length) {
      const baselineCDF = (i + 1) / sortedBaseline.length;
      const recentCDF = (j + 1) / sortedRecent.length;
      const distance = Math.abs(baselineCDF - recentCDF);
      
      maxDistance = Math.max(maxDistance, distance);
      
      if (sortedBaseline[i] <= sortedRecent[j]) {
        i++;
      } else {
        j++;
      }
    }
    
    return maxDistance;
  }

  /**
   * Calculate approximate p-value for KS test
   */
  private calculateKSPValue(ksStatistic: number, sampleSize: number): number {
    // Simplified p-value calculation
    const lambda = ksStatistic * Math.sqrt(sampleSize);
    return 2 * Math.exp(-2 * lambda * lambda);
  }

  /**
   * Evaluate overall model health
   */
  public evaluateModelHealth(): ModelHealthStats {
    let healthScore = 100;
    let overallHealth: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL' = 'EXCELLENT';
    let recommendation = 'Model performing excellently';

    // Check recent performance
    if (this.performanceHistory.length > 0) {
      const recentWindows = this.performanceHistory.slice(-5);
      const avgAccuracy = recentWindows.reduce((sum, w) => sum + w.accuracy, 0) / recentWindows.length;
      
      if (avgAccuracy < 0.5) {
        healthScore -= 40;
        recommendation = 'Critical: Model accuracy below random chance - immediate retraining required';
      } else if (avgAccuracy < 0.6) {
        healthScore -= 30;
        recommendation = 'Poor performance: Schedule retraining within 24 hours';
      } else if (avgAccuracy < 0.7) {
        healthScore -= 20;
        recommendation = 'Fair performance: Monitor closely and consider retraining';
      } else if (avgAccuracy < 0.8) {
        healthScore -= 10;
        recommendation = 'Good performance: Continue monitoring';
      }

      // Determine accuracy trend
      if (recentWindows.length >= 3) {
        const firstHalf = recentWindows.slice(0, Math.floor(recentWindows.length / 2));
        const secondHalf = recentWindows.slice(Math.floor(recentWindows.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, w) => sum + w.accuracy, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, w) => sum + w.accuracy, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 0.02) {
          this.healthStats.accuracy_trend = 'IMPROVING';
        } else if (secondAvg < firstAvg - 0.02) {
          this.healthStats.accuracy_trend = 'DECLINING';
          healthScore -= 15;
        } else {
          this.healthStats.accuracy_trend = 'STABLE';
        }
      }
    }

    // Check drift alerts
    if (this.healthStats.consecutive_drift_alerts > 0) {
      healthScore -= this.healthStats.consecutive_drift_alerts * 10;
      if (this.healthStats.consecutive_drift_alerts > 3) {
        recommendation = 'Multiple drift alerts detected - immediate retraining recommended';
      }
    }

    // Check model age
    if (this.healthStats.model_age_days > 30) {
      healthScore -= Math.min(20, (this.healthStats.model_age_days - 30) * 2);
      if (this.healthStats.model_age_days > 60) {
        recommendation = 'Model is aging - schedule retraining to maintain performance';
      }
    }

    // Determine overall health
    if (healthScore >= 90) overallHealth = 'EXCELLENT';
    else if (healthScore >= 70) overallHealth = 'GOOD';
    else if (healthScore >= 50) overallHealth = 'FAIR';
    else if (healthScore >= 30) overallHealth = 'POOR';
    else overallHealth = 'CRITICAL';

    this.healthStats = {
      ...this.healthStats,
      overall_health: overallHealth,
      health_score: Math.max(0, healthScore),
      recommendation
    };

    return { ...this.healthStats };
  }

  /**
   * Get drift detection history
   */
  public getDriftHistory(): DriftMetrics[] {
    return [...this.driftAlerts];
  }

  /**
   * Get performance trend data
   */
  public getPerformanceTrend() {
    const windows = this.performanceHistory.slice(-10);
    return {
      windows: windows.map(w => ({
        timestamp: w.window_start,
        accuracy: w.accuracy,
        precision: w.precision,
        recall: w.recall,
        f1_score: w.f1_score,
        sample_count: w.predictions.length
      })),
      trend_direction: this.healthStats.accuracy_trend,
      avg_accuracy: windows.length > 0 
        ? windows.reduce((sum, w) => sum + w.accuracy, 0) / windows.length 
        : 0
    };
  }

  /**
   * Start automated drift monitoring
   */
  private startDriftMonitoring(): void {
    setInterval(() => {
      if (this.monitoringEnabled && this.recentPredictions.length >= 100) {
        this.checkDataDrift();
        this.evaluateModelHealth();
      }
    }, 4 * 60 * 60 * 1000); // Check every 4 hours
  }

  /**
   * Get comprehensive health report
   */
  public getHealthReport() {
    const latestDrift = this.checkDataDrift();
    const healthStats = this.evaluateModelHealth();
    const performanceTrend = this.getPerformanceTrend();

    return {
      health_stats: healthStats,
      latest_drift: latestDrift,
      performance_trend: performanceTrend,
      monitoring_status: {
        enabled: this.monitoringEnabled,
        recent_predictions_count: this.recentPredictions.length,
        baseline_samples: this.baselineDistribution.length,
        last_check: this.healthStats.last_drift_check
      },
      alerts: {
        active_drift_alerts: this.driftAlerts.filter(
          alert => Date.now() - alert.drift_timestamp < 24 * 60 * 60 * 1000
        ).length,
        total_drift_alerts: this.driftAlerts.length,
        consecutive_alerts: this.healthStats.consecutive_drift_alerts
      }
    };
  }

  /**
   * Reset drift detection baseline
   */
  public resetBaseline(): void {
    this.baselineDistribution = [...this.recentPredictions];
    this.driftAlerts = [];
    this.healthStats.consecutive_drift_alerts = 0;
    console.log('🔄 Reset drift detection baseline with current predictions');
  }

  /**
   * Toggle monitoring
   */
  public setMonitoring(enabled: boolean): void {
    this.monitoringEnabled = enabled;
    console.log(`📊 Model health monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Clear performance history
   */
  public clearPerformanceHistory(): void {
    this.performanceHistory = [];
    console.log('🗑️ Cleared performance history');
  }
}

export const waidesKIModelHealthMonitor = new WaidesKIModelHealthMonitor();