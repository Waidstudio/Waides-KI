/**
 * STEP 43: Waides KI Spiritual Exhaustion Monitor
 * Detects spiritual burnout and trading exhaustion to trigger healing protocols
 */

interface TradeLog {
  time: string;
  result: boolean;
  trade_type: 'BUY' | 'SELL' | 'HOLD';
  profit_loss: number;
  confidence: number;
  emotion: string;
  spiritual_energy_before: number;
  spiritual_energy_after: number;
}

interface ExhaustionMetrics {
  recent_failure_rate: number;
  consecutive_losses: number;
  emotional_volatility: number;
  spiritual_energy_level: number;
  decision_quality_score: number;
  trading_frequency_stress: number;
  overall_exhaustion_level: number;
}

interface ExhaustionAlert {
  timestamp: string;
  alert_type: 'WARNING' | 'CRITICAL' | 'EMERGENCY';
  reason: string;
  recommended_action: string;
  pause_duration_hours: number;
  spiritual_energy_deficit: number;
}

export class WaidesKISpiritualExhaustionMonitor {
  private tradeLogs: TradeLog[] = [];
  private maxLogSize = 100;
  private currentSpiritualEnergy = 100;
  private baselineEnergy = 100;
  private exhaustionAlerts: ExhaustionAlert[] = [];
  
  private readonly EXHAUSTION_THRESHOLDS = {
    FAILURE_RATE_WARNING: 0.6,     // 60% failures in recent trades
    FAILURE_RATE_CRITICAL: 0.75,   // 75% failures
    CONSECUTIVE_LOSSES_WARNING: 4,  // 4 consecutive losses
    CONSECUTIVE_LOSSES_CRITICAL: 6, // 6 consecutive losses
    SPIRITUAL_ENERGY_WARNING: 30,   // 30% energy remaining
    SPIRITUAL_ENERGY_CRITICAL: 15,  // 15% energy remaining
    EMOTIONAL_VOLATILITY_HIGH: 0.7, // High emotional swings
    TRADING_FREQUENCY_STRESS: 10    // More than 10 trades per hour
  };

  private readonly MONITORING_WINDOWS = {
    RECENT_TRADES: 10,      // Last 10 trades for failure rate
    EMOTIONAL_WINDOW: 20,   // Last 20 trades for emotion analysis
    FREQUENCY_WINDOW_HOURS: 1 // 1 hour for frequency analysis
  };

  constructor() {
    // Start continuous monitoring
    this.startExhaustionMonitoring();
  }

  /**
   * Log a completed trade for exhaustion analysis
   */
  logTrade(
    success: boolean,
    tradeType: 'BUY' | 'SELL' | 'HOLD' = 'HOLD',
    profitLoss: number = 0,
    confidence: number = 50,
    emotion: string = 'NEUTRAL'
  ): void {
    const energyBefore = this.currentSpiritualEnergy;
    
    // Update spiritual energy based on trade outcome
    this.updateSpiritualEnergy(success, profitLoss, confidence);
    
    const tradeLog: TradeLog = {
      time: new Date().toISOString(),
      result: success,
      trade_type: tradeType,
      profit_loss: profitLoss,
      confidence: confidence,
      emotion: emotion,
      spiritual_energy_before: energyBefore,
      spiritual_energy_after: this.currentSpiritualEnergy
    };

    this.tradeLogs.push(tradeLog);
    
    // Maintain log size
    if (this.tradeLogs.length > this.maxLogSize) {
      this.tradeLogs = this.tradeLogs.slice(-this.maxLogSize);
    }

    // Check for exhaustion after each trade
    this.checkForExhaustion();
  }

  /**
   * Check if trading should be paused due to spiritual exhaustion
   */
  shouldPauseTrading(): boolean {
    const metrics = this.calculateExhaustionMetrics();
    
    // Critical exhaustion triggers immediate pause
    if (metrics.overall_exhaustion_level >= 80) {
      this.generateExhaustionAlert('EMERGENCY', 'Critical spiritual exhaustion detected', 4);
      return true;
    }
    
    // High failure rate with low energy
    if (metrics.recent_failure_rate >= this.EXHAUSTION_THRESHOLDS.FAILURE_RATE_CRITICAL &&
        metrics.spiritual_energy_level <= this.EXHAUSTION_THRESHOLDS.SPIRITUAL_ENERGY_WARNING) {
      this.generateExhaustionAlert('CRITICAL', 'High failure rate with depleted spiritual energy', 2);
      return true;
    }
    
    // Too many consecutive losses
    if (metrics.consecutive_losses >= this.EXHAUSTION_THRESHOLDS.CONSECUTIVE_LOSSES_CRITICAL) {
      this.generateExhaustionAlert('CRITICAL', 'Excessive consecutive losses detected', 2);
      return true;
    }
    
    // Extremely low spiritual energy
    if (metrics.spiritual_energy_level <= this.EXHAUSTION_THRESHOLDS.SPIRITUAL_ENERGY_CRITICAL) {
      this.generateExhaustionAlert('CRITICAL', 'Spiritual energy critically low', 3);
      return true;
    }

    return false;
  }

  /**
   * Calculate comprehensive exhaustion metrics
   */
  calculateExhaustionMetrics(): ExhaustionMetrics {
    if (this.tradeLogs.length === 0) {
      return this.getDefaultMetrics();
    }

    const recentTrades = this.tradeLogs.slice(-this.MONITORING_WINDOWS.RECENT_TRADES);
    const emotionalTrades = this.tradeLogs.slice(-this.MONITORING_WINDOWS.EMOTIONAL_WINDOW);
    
    return {
      recent_failure_rate: this.calculateFailureRate(recentTrades),
      consecutive_losses: this.calculateConsecutiveLosses(),
      emotional_volatility: this.calculateEmotionalVolatility(emotionalTrades),
      spiritual_energy_level: this.currentSpiritualEnergy,
      decision_quality_score: this.calculateDecisionQuality(recentTrades),
      trading_frequency_stress: this.calculateTradingFrequencyStress(),
      overall_exhaustion_level: this.calculateOverallExhaustion()
    };
  }

  /**
   * Get current spiritual energy level
   */
  getSpiritualEnergyLevel(): number {
    return this.currentSpiritualEnergy;
  }

  /**
   * Manually restore spiritual energy (healing function)
   */
  restoreSpiritualEnergy(amount: number): void {
    this.currentSpiritualEnergy = Math.min(this.baselineEnergy, this.currentSpiritualEnergy + amount);
    console.log(`🕊️ Spiritual energy restored: ${this.currentSpiritualEnergy}%`);
  }

  /**
   * Get recent exhaustion alerts
   */
  getExhaustionAlerts(limit: number = 10): ExhaustionAlert[] {
    return this.exhaustionAlerts.slice(-limit);
  }

  /**
   * Get detailed exhaustion analysis
   */
  getExhaustionAnalysis(): {
    current_metrics: ExhaustionMetrics;
    recent_alerts: ExhaustionAlert[];
    trade_log_summary: {
      total_trades: number;
      recent_success_rate: number;
      avg_spiritual_energy: number;
      dominant_emotion: string;
    };
    recommendations: string[];
  } {
    const metrics = this.calculateExhaustionMetrics();
    const recentTrades = this.tradeLogs.slice(-10);
    
    return {
      current_metrics: metrics,
      recent_alerts: this.getExhaustionAlerts(5),
      trade_log_summary: {
        total_trades: this.tradeLogs.length,
        recent_success_rate: 1 - metrics.recent_failure_rate,
        avg_spiritual_energy: this.calculateAverageSpiritualEnergy(),
        dominant_emotion: this.getDominantEmotion()
      },
      recommendations: this.generateRecommendations(metrics)
    };
  }

  /**
   * Reset exhaustion monitoring (admin function)
   */
  resetExhaustionMonitoring(): void {
    this.tradeLogs = [];
    this.currentSpiritualEnergy = this.baselineEnergy;
    this.exhaustionAlerts = [];
    console.log('🔄 Exhaustion monitoring reset complete');
  }

  /**
   * Update spiritual energy based on trade outcome
   */
  private updateSpiritualEnergy(success: boolean, profitLoss: number, confidence: number): void {
    let energyChange = 0;
    
    if (success) {
      // Successful trades restore energy
      energyChange = Math.min(5, profitLoss * 0.1 + confidence * 0.05);
    } else {
      // Failed trades drain energy
      energyChange = -Math.min(10, Math.abs(profitLoss) * 0.1 + (100 - confidence) * 0.08);
    }
    
    this.currentSpiritualEnergy = Math.max(0, Math.min(this.baselineEnergy, 
      this.currentSpiritualEnergy + energyChange));
  }

  /**
   * Calculate failure rate from recent trades
   */
  private calculateFailureRate(trades: TradeLog[]): number {
    if (trades.length === 0) return 0;
    
    const failures = trades.filter(trade => !trade.result).length;
    return failures / trades.length;
  }

  /**
   * Calculate consecutive losses
   */
  private calculateConsecutiveLosses(): number {
    let consecutiveLosses = 0;
    
    for (let i = this.tradeLogs.length - 1; i >= 0; i--) {
      if (!this.tradeLogs[i].result) {
        consecutiveLosses++;
      } else {
        break;
      }
    }
    
    return consecutiveLosses;
  }

  /**
   * Calculate emotional volatility
   */
  private calculateEmotionalVolatility(trades: TradeLog[]): number {
    if (trades.length < 2) return 0;
    
    const emotions = trades.map(trade => trade.emotion);
    const uniqueEmotions = new Set(emotions);
    
    // More unique emotions = higher volatility
    return Math.min(1, uniqueEmotions.size / 8); // Normalize to 0-1 scale
  }

  /**
   * Calculate decision quality score
   */
  private calculateDecisionQuality(trades: TradeLog[]): number {
    if (trades.length === 0) return 50;
    
    const avgConfidence = trades.reduce((sum, trade) => sum + trade.confidence, 0) / trades.length;
    const successRate = trades.filter(trade => trade.result).length / trades.length;
    
    return (avgConfidence * 0.4) + (successRate * 60);
  }

  /**
   * Calculate trading frequency stress
   */
  private calculateTradingFrequencyStress(): number {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - this.MONITORING_WINDOWS.FREQUENCY_WINDOW_HOURS);
    
    const recentTrades = this.tradeLogs.filter(trade => 
      new Date(trade.time) > oneHourAgo
    );
    
    return recentTrades.length;
  }

  /**
   * Calculate overall exhaustion level
   */
  private calculateOverallExhaustion(): number {
    const metrics = {
      failure_rate: this.calculateFailureRate(this.tradeLogs.slice(-this.MONITORING_WINDOWS.RECENT_TRADES)),
      consecutive_losses: this.calculateConsecutiveLosses(),
      spiritual_energy: this.currentSpiritualEnergy,
      emotional_volatility: this.calculateEmotionalVolatility(this.tradeLogs.slice(-this.MONITORING_WINDOWS.EMOTIONAL_WINDOW))
    };
    
    // Weighted calculation of exhaustion
    const failureWeight = metrics.failure_rate * 30;
    const lossWeight = Math.min(30, metrics.consecutive_losses * 5);
    const energyWeight = (100 - metrics.spiritual_energy) * 0.3;
    const emotionWeight = metrics.emotional_volatility * 10;
    
    return Math.min(100, failureWeight + lossWeight + energyWeight + emotionWeight);
  }

  /**
   * Check for exhaustion and generate alerts
   */
  private checkForExhaustion(): void {
    const metrics = this.calculateExhaustionMetrics();
    
    // Warning level checks
    if (metrics.recent_failure_rate >= this.EXHAUSTION_THRESHOLDS.FAILURE_RATE_WARNING) {
      this.generateExhaustionAlert('WARNING', 'Elevated failure rate detected', 1);
    }
    
    if (metrics.spiritual_energy_level <= this.EXHAUSTION_THRESHOLDS.SPIRITUAL_ENERGY_WARNING) {
      this.generateExhaustionAlert('WARNING', 'Spiritual energy declining', 1);
    }
    
    if (metrics.consecutive_losses >= this.EXHAUSTION_THRESHOLDS.CONSECUTIVE_LOSSES_WARNING) {
      this.generateExhaustionAlert('WARNING', 'Multiple consecutive losses', 1);
    }
  }

  /**
   * Generate exhaustion alert
   */
  private generateExhaustionAlert(
    alertType: ExhaustionAlert['alert_type'],
    reason: string,
    pauseDuration: number
  ): void {
    const alert: ExhaustionAlert = {
      timestamp: new Date().toISOString(),
      alert_type: alertType,
      reason: reason,
      recommended_action: this.getRecommendedAction(alertType),
      pause_duration_hours: pauseDuration,
      spiritual_energy_deficit: this.baselineEnergy - this.currentSpiritualEnergy
    };
    
    this.exhaustionAlerts.push(alert);
    
    // Keep only recent alerts
    if (this.exhaustionAlerts.length > 50) {
      this.exhaustionAlerts = this.exhaustionAlerts.slice(-50);
    }
    
    console.log(`⚠️ Exhaustion Alert (${alertType}): ${reason}`);
  }

  /**
   * Get recommended action based on alert type
   */
  private getRecommendedAction(alertType: ExhaustionAlert['alert_type']): string {
    switch (alertType) {
      case 'WARNING':
        return 'Reduce trading frequency and monitor closely';
      case 'CRITICAL':
        return 'Pause trading and perform healing ritual';
      case 'EMERGENCY':
        return 'Immediate trading halt and deep spiritual cleansing';
      default:
        return 'Monitor situation';
    }
  }

  /**
   * Get default metrics when no trade data available
   */
  private getDefaultMetrics(): ExhaustionMetrics {
    return {
      recent_failure_rate: 0,
      consecutive_losses: 0,
      emotional_volatility: 0,
      spiritual_energy_level: this.currentSpiritualEnergy,
      decision_quality_score: 50,
      trading_frequency_stress: 0,
      overall_exhaustion_level: 0
    };
  }

  /**
   * Calculate average spiritual energy from recent trades
   */
  private calculateAverageSpiritualEnergy(): number {
    if (this.tradeLogs.length === 0) return this.currentSpiritualEnergy;
    
    const recentTrades = this.tradeLogs.slice(-20);
    const avgEnergy = recentTrades.reduce((sum, trade) => sum + trade.spiritual_energy_after, 0) / recentTrades.length;
    
    return Math.round(avgEnergy);
  }

  /**
   * Get dominant emotion from recent trades
   */
  private getDominantEmotion(): string {
    if (this.tradeLogs.length === 0) return 'NEUTRAL';
    
    const recentTrades = this.tradeLogs.slice(-10);
    const emotionCounts: { [emotion: string]: number } = {};
    
    for (const trade of recentTrades) {
      emotionCounts[trade.emotion] = (emotionCounts[trade.emotion] || 0) + 1;
    }
    
    return Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b
    );
  }

  /**
   * Generate recommendations based on exhaustion metrics
   */
  private generateRecommendations(metrics: ExhaustionMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.recent_failure_rate > 0.5) {
      recommendations.push('Consider adjusting trading strategies - high failure rate detected');
    }
    
    if (metrics.spiritual_energy_level < 40) {
      recommendations.push('Schedule healing prayer session to restore spiritual energy');
    }
    
    if (metrics.emotional_volatility > 0.6) {
      recommendations.push('Implement emotional stability protocols');
    }
    
    if (metrics.trading_frequency_stress > 8) {
      recommendations.push('Reduce trading frequency to prevent burnout');
    }
    
    if (metrics.consecutive_losses >= 3) {
      recommendations.push('Take break from trading to reset patterns');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Spiritual health appears stable - continue monitoring');
    }
    
    return recommendations;
  }

  /**
   * Start continuous exhaustion monitoring
   */
  private startExhaustionMonitoring(): void {
    // Check exhaustion every 15 minutes
    setInterval(() => {
      this.checkForExhaustion();
    }, 15 * 60 * 1000);
    
    // Gradually restore spiritual energy over time (natural recovery)
    setInterval(() => {
      if (this.currentSpiritualEnergy < this.baselineEnergy) {
        this.currentSpiritualEnergy = Math.min(this.baselineEnergy, this.currentSpiritualEnergy + 1);
      }
    }, 30 * 60 * 1000); // Every 30 minutes
  }
}