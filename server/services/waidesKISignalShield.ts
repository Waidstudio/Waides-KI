interface SignalData {
  strategy_id: string;
  price: number;
  rsi: number;
  vwap_status: 'ABOVE' | 'BELOW';
  volume: number;
  ema50: number;
  ema200: number;
  trend: string;
  timestamp: number;
}

interface BannedSignal {
  strategy_id: string;
  timestamp: number;
  reason: string;
  ban_duration: number; // milliseconds
  violation_count: number;
}

interface TrapDetection {
  type: 'FAKEOUT' | 'VOLATILITY_SPIKE' | 'LOW_VOLUME_SPIKE' | 'EXTREME_DIVERGENCE' | 'WHIPSAW' | 'CONSOLIDATION_BREAK';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  reason: string;
  metrics: any;
}

interface ShieldStats {
  total_signals_processed: number;
  signals_blocked: number;
  traps_detected: number;
  banned_strategies: number;
  accuracy_improvement: number;
}

export class WaidesKISignalShield {
  private bannedSignals: Map<string, BannedSignal> = new Map();
  private signalLog: SignalData[] = [];
  private trapHistory: TrapDetection[] = [];
  private maxLogSize: number = 5000;
  private maxBanDuration: number = 24 * 60 * 60 * 1000; // 24 hours
  private shieldStats: ShieldStats;

  constructor() {
    this.shieldStats = {
      total_signals_processed: 0,
      signals_blocked: 0,
      traps_detected: 0,
      banned_strategies: 0,
      accuracy_improvement: 0
    };
    
    this.startCleanupInterval();
  }

  // MAIN SHIELD ANALYSIS - COMPREHENSIVE TRAP DETECTION
  analyzeAndFilter(signalData: SignalData): {
    approved: boolean;
    traps_detected: TrapDetection[];
    risk_score: number;
    shield_reasoning: string[];
  } {
    this.shieldStats.total_signals_processed++;
    
    const traps = this.detectTraps(signalData);
    const riskScore = this.calculateRiskScore(signalData, traps);
    const shieldReasoning: string[] = [];
    
    // Check if strategy is banned
    if (this.isStrategyBanned(signalData.strategy_id)) {
      this.shieldStats.signals_blocked++;
      return {
        approved: false,
        traps_detected: traps,
        risk_score: 100,
        shield_reasoning: ['Strategy is temporarily banned due to poor performance']
      };
    }
    
    // Analyze trap severity
    const criticalTraps = traps.filter(trap => trap.severity === 'CRITICAL');
    const highRiskTraps = traps.filter(trap => trap.severity === 'HIGH');
    
    if (criticalTraps.length > 0) {
      // Auto-ban strategy for critical traps
      this.banStrategy(signalData.strategy_id, `Critical trap detected: ${criticalTraps[0].type}`, 24 * 60 * 60 * 1000);
      this.shieldStats.signals_blocked++;
      shieldReasoning.push('Critical market trap detected - strategy auto-banned');
      
      return {
        approved: false,
        traps_detected: traps,
        risk_score: riskScore,
        shield_reasoning: shieldReasoning
      };
    }
    
    if (highRiskTraps.length >= 2 || riskScore > 80) {
      this.shieldStats.signals_blocked++;
      shieldReasoning.push('Multiple high-risk traps detected');
      
      return {
        approved: false,
        traps_detected: traps,
        risk_score: riskScore,
        shield_reasoning: shieldReasoning
      };
    }
    
    // Log approved signal
    this.logSignal(signalData);
    
    if (traps.length > 0) {
      shieldReasoning.push(`${traps.length} potential trap(s) detected but risk acceptable`);
    } else {
      shieldReasoning.push('Signal passed all shield checks');
    }
    
    return {
      approved: true,
      traps_detected: traps,
      risk_score: riskScore,
      shield_reasoning: shieldReasoning
    };
  }

  // ADVANCED TRAP DETECTION ALGORITHMS
  private detectTraps(signalData: SignalData): TrapDetection[] {
    const traps: TrapDetection[] = [];
    
    // 1. Fakeout Detection (RSI overbought/oversold with low volume)
    const fakeoutTrap = this.detectFakeout(signalData);
    if (fakeoutTrap) traps.push(fakeoutTrap);
    
    // 2. Volatility Spike Detection
    const volatilityTrap = this.detectVolatilitySpike(signalData);
    if (volatilityTrap) traps.push(volatilityTrap);
    
    // 3. Low Volume Spike Detection
    const volumeTrap = this.detectLowVolumeSpike(signalData);
    if (volumeTrap) traps.push(volumeTrap);
    
    // 4. Extreme Price-EMA Divergence
    const divergenceTrap = this.detectExtremeDivergence(signalData);
    if (divergenceTrap) traps.push(divergenceTrap);
    
    // 5. Whipsaw Pattern Detection
    const whipsawTrap = this.detectWhipsaw(signalData);
    if (whipsawTrap) traps.push(whipsawTrap);
    
    // 6. False Consolidation Break
    const consolidationTrap = this.detectFalseConsolidationBreak(signalData);
    if (consolidationTrap) traps.push(consolidationTrap);
    
    // Store trap history
    traps.forEach(trap => {
      this.trapHistory.push(trap);
      this.shieldStats.traps_detected++;
    });
    
    // Maintain trap history size
    if (this.trapHistory.length > 1000) {
      this.trapHistory = this.trapHistory.slice(-1000);
    }
    
    return traps;
  }

  private detectFakeout(signal: SignalData): TrapDetection | null {
    const { rsi, volume, price, vwap_status } = signal;
    
    // RSI extreme with unusually low volume
    const rsiExtreme = rsi > 75 || rsi < 25;
    const lowVolume = volume < this.getAverageVolume() * 0.6;
    const priceVwapConflict = (price > signal.ema50 && vwap_status === 'BELOW') || 
                             (price < signal.ema50 && vwap_status === 'ABOVE');
    
    if (rsiExtreme && lowVolume) {
      return {
        type: 'FAKEOUT',
        severity: priceVwapConflict ? 'CRITICAL' : 'HIGH',
        confidence: 85,
        reason: `RSI extreme (${rsi.toFixed(1)}) with low volume (${volume.toFixed(0)})`,
        metrics: { rsi, volume, avgVolume: this.getAverageVolume() }
      };
    }
    
    return null;
  }

  private detectVolatilitySpike(signal: SignalData): TrapDetection | null {
    const { price, ema50, ema200 } = signal;
    
    // Sudden large price movement away from moving averages
    const ema50Divergence = Math.abs(price - ema50) / price;
    const ema200Divergence = Math.abs(price - ema200) / price;
    
    if (ema50Divergence > 0.05 || ema200Divergence > 0.08) { // 5% from EMA50 or 8% from EMA200
      return {
        type: 'VOLATILITY_SPIKE',
        severity: ema50Divergence > 0.08 ? 'CRITICAL' : 'HIGH',
        confidence: 90,
        reason: `Extreme price divergence from EMAs (${(ema50Divergence * 100).toFixed(2)}% from EMA50)`,
        metrics: { ema50Divergence, ema200Divergence, price, ema50, ema200 }
      };
    }
    
    return null;
  }

  private detectLowVolumeSpike(signal: SignalData): TrapDetection | null {
    const { volume, rsi, trend } = signal;
    const avgVolume = this.getAverageVolume();
    
    // Strong signal with suspiciously low volume
    const strongSignal = (trend === 'UPTREND' && rsi > 60) || (trend === 'DOWNTREND' && rsi < 40);
    const veryLowVolume = volume < avgVolume * 0.4;
    
    if (strongSignal && veryLowVolume) {
      return {
        type: 'LOW_VOLUME_SPIKE',
        severity: 'MEDIUM',
        confidence: 75,
        reason: `Strong ${trend.toLowerCase()} signal with very low volume (${(volume / avgVolume * 100).toFixed(0)}% of average)`,
        metrics: { volume, avgVolume, volumeRatio: volume / avgVolume }
      };
    }
    
    return null;
  }

  private detectExtremeDivergence(signal: SignalData): TrapDetection | null {
    const { price, ema50, ema200 } = signal;
    
    // Price is way too far from both EMAs
    const ema50Distance = Math.abs(price - ema50);
    const ema200Distance = Math.abs(price - ema200);
    const priceThreshold = price * 0.06; // 6% of current price
    
    if (ema50Distance > priceThreshold && ema200Distance > priceThreshold) {
      return {
        type: 'EXTREME_DIVERGENCE',
        severity: 'HIGH',
        confidence: 80,
        reason: `Price extremely divergent from both EMAs (${ema50Distance.toFixed(2)} from EMA50, ${ema200Distance.toFixed(2)} from EMA200)`,
        metrics: { ema50Distance, ema200Distance, priceThreshold }
      };
    }
    
    return null;
  }

  private detectWhipsaw(signal: SignalData): TrapDetection | null {
    const recentSignals = this.getRecentSignals(10);
    if (recentSignals.length < 5) return null;
    
    // Check for rapid trend changes in recent signals
    const trends = recentSignals.map(s => s.trend);
    const trendChanges = trends.filter((trend, i) => i > 0 && trend !== trends[i - 1]).length;
    
    if (trendChanges >= 3) {
      return {
        type: 'WHIPSAW',
        severity: 'MEDIUM',
        confidence: 70,
        reason: `${trendChanges} trend changes detected in last ${recentSignals.length} signals`,
        metrics: { trendChanges, recentTrends: trends.slice(-5) }
      };
    }
    
    return null;
  }

  private detectFalseConsolidationBreak(signal: SignalData): TrapDetection | null {
    const recentPrices = this.getRecentSignals(20).map(s => s.price);
    if (recentPrices.length < 10) return null;
    
    // Check if price was in consolidation and just broke out
    const priceRange = Math.max(...recentPrices) - Math.min(...recentPrices);
    const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const consolidationThreshold = avgPrice * 0.02; // 2% range
    
    const wasConsolidating = priceRange < consolidationThreshold;
    const currentBreakout = Math.abs(signal.price - avgPrice) > consolidationThreshold;
    
    if (wasConsolidating && currentBreakout && signal.volume < this.getAverageVolume() * 0.8) {
      return {
        type: 'CONSOLIDATION_BREAK',
        severity: 'MEDIUM',
        confidence: 65,
        reason: `Potential false breakout from consolidation with low volume`,
        metrics: { priceRange, avgPrice, consolidationThreshold, currentBreakout: Math.abs(signal.price - avgPrice) }
      };
    }
    
    return null;
  }

  // RISK SCORING SYSTEM
  private calculateRiskScore(signal: SignalData, traps: TrapDetection[]): number {
    let riskScore = 0;
    
    // Base risk from traps
    traps.forEach(trap => {
      switch (trap.severity) {
        case 'CRITICAL': riskScore += 40; break;
        case 'HIGH': riskScore += 25; break;
        case 'MEDIUM': riskScore += 15; break;
        case 'LOW': riskScore += 5; break;
      }
    });
    
    // Additional risk factors
    if (signal.rsi > 80 || signal.rsi < 20) riskScore += 10;
    if (signal.volume < this.getAverageVolume() * 0.5) riskScore += 15;
    
    // Strategy history risk
    const strategyHistory = this.getStrategyHistory(signal.strategy_id);
    if (strategyHistory.violations > 2) riskScore += 20;
    
    return Math.min(100, riskScore);
  }

  // STRATEGY BANNING SYSTEM
  banStrategy(strategyId: string, reason: string, duration: number = 24 * 60 * 60 * 1000): void {
    const existingBan = this.bannedSignals.get(strategyId);
    const violationCount = existingBan ? existingBan.violation_count + 1 : 1;
    
    // Increase ban duration for repeat offenders
    const adjustedDuration = duration * Math.min(violationCount, 3);
    
    this.bannedSignals.set(strategyId, {
      strategy_id: strategyId,
      timestamp: Date.now(),
      reason,
      ban_duration: adjustedDuration,
      violation_count: violationCount
    });
    
    this.shieldStats.banned_strategies++;
  }

  isStrategyBanned(strategyId: string): boolean {
    const banData = this.bannedSignals.get(strategyId);
    if (!banData) return false;
    
    const isExpired = Date.now() - banData.timestamp > banData.ban_duration;
    if (isExpired) {
      this.bannedSignals.delete(strategyId);
      return false;
    }
    
    return true;
  }

  unbanStrategy(strategyId: string): boolean {
    return this.bannedSignals.delete(strategyId);
  }

  // SIGNAL LOGGING AND HISTORY
  private logSignal(signal: SignalData): void {
    this.signalLog.push({
      ...signal,
      timestamp: Date.now()
    });
    
    // Maintain log size
    if (this.signalLog.length > this.maxLogSize) {
      this.signalLog = this.signalLog.slice(-this.maxLogSize);
    }
  }

  private getRecentSignals(count: number): SignalData[] {
    return this.signalLog.slice(-count);
  }

  private getAverageVolume(): number {
    const recentSignals = this.getRecentSignals(50);
    if (recentSignals.length === 0) return 1000000; // Default fallback
    
    const totalVolume = recentSignals.reduce((sum, signal) => sum + signal.volume, 0);
    return totalVolume / recentSignals.length;
  }

  private getStrategyHistory(strategyId: string): { violations: number; lastViolation: number } {
    const violations = this.trapHistory.filter(trap => 
      this.signalLog.some(signal => 
        signal.strategy_id === strategyId && 
        Math.abs(signal.timestamp - trap.metrics?.timestamp || 0) < 60000
      )
    ).length;
    
    const lastViolation = this.bannedSignals.get(strategyId)?.timestamp || 0;
    
    return { violations, lastViolation };
  }

  // DAILY REPORTING AND ANALYTICS
  generateDailyReport(): {
    date: string;
    shield_performance: ShieldStats;
    top_traps: { type: string; count: number }[];
    banned_strategies: { strategy_id: string; reason: string; ban_remaining: number }[];
    signal_quality_improvement: number;
    recommendations: string[];
  } {
    const today = new Date().toISOString().split('T')[0];
    
    // Analyze trap types
    const trapCounts = new Map<string, number>();
    this.trapHistory.forEach(trap => {
      trapCounts.set(trap.type, (trapCounts.get(trap.type) || 0) + 1);
    });
    
    const topTraps = Array.from(trapCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Current banned strategies
    const bannedStrategies = Array.from(this.bannedSignals.values())
      .map(ban => ({
        strategy_id: this.maskStrategyId(ban.strategy_id),
        reason: ban.reason,
        ban_remaining: Math.max(0, ban.ban_duration - (Date.now() - ban.timestamp))
      }));
    
    // Calculate quality improvement
    const totalSignals = this.shieldStats.total_signals_processed;
    const blockedSignals = this.shieldStats.signals_blocked;
    const qualityImprovement = totalSignals > 0 ? (blockedSignals / totalSignals) * 100 : 0;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(topTraps, qualityImprovement);
    
    return {
      date: today,
      shield_performance: { ...this.shieldStats },
      top_traps: topTraps,
      banned_strategies: bannedStrategies,
      signal_quality_improvement: qualityImprovement,
      recommendations
    };
  }

  private generateRecommendations(topTraps: { type: string; count: number }[], qualityImprovement: number): string[] {
    const recommendations: string[] = [];
    
    if (qualityImprovement > 20) {
      recommendations.push('Shield system is highly effective - continue current settings');
    } else if (qualityImprovement < 5) {
      recommendations.push('Consider tightening shield parameters for better trap detection');
    }
    
    topTraps.forEach(trap => {
      if (trap.count > 10) {
        recommendations.push(`High frequency of ${trap.type} traps detected - review market conditions`);
      }
    });
    
    if (this.bannedSignals.size > 5) {
      recommendations.push('Multiple strategies banned - consider reviewing strategy generation logic');
    }
    
    return recommendations.slice(0, 5);
  }

  // SHIELD STATISTICS AND MONITORING
  getShieldStats(): ShieldStats & {
    active_bans: number;
    recent_traps: number;
    shield_effectiveness: number;
  } {
    const recentTraps = this.trapHistory.filter(trap => 
      Date.now() - (trap.metrics?.timestamp || 0) < 24 * 60 * 60 * 1000
    ).length;
    
    const effectiveness = this.shieldStats.total_signals_processed > 0 ? 
      (this.shieldStats.signals_blocked / this.shieldStats.total_signals_processed) * 100 : 0;
    
    return {
      ...this.shieldStats,
      active_bans: this.bannedSignals.size,
      recent_traps: recentTraps,
      shield_effectiveness: effectiveness
    };
  }

  getTrapAnalytics(): {
    trap_distribution: { type: string; count: number; severity_breakdown: any }[];
    trend_analysis: string;
    risk_patterns: string[];
  } {
    const trapDistribution = new Map<string, { count: number; severities: Map<string, number> }>();
    
    this.trapHistory.forEach(trap => {
      if (!trapDistribution.has(trap.type)) {
        trapDistribution.set(trap.type, { count: 0, severities: new Map() });
      }
      
      const data = trapDistribution.get(trap.type)!;
      data.count++;
      data.severities.set(trap.severity, (data.severities.get(trap.severity) || 0) + 1);
    });
    
    const distribution = Array.from(trapDistribution.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      severity_breakdown: Object.fromEntries(data.severities)
    }));
    
    // Analyze trends
    const recentTraps = this.trapHistory.slice(-50);
    const trendAnalysis = recentTraps.length > 20 ? 
      'Increasing trap frequency detected' : 
      'Normal trap detection levels';
    
    // Risk patterns
    const riskPatterns: string[] = [];
    if (recentTraps.filter(t => t.type === 'FAKEOUT').length > 10) {
      riskPatterns.push('High fakeout activity in current market');
    }
    if (recentTraps.filter(t => t.severity === 'CRITICAL').length > 5) {
      riskPatterns.push('Multiple critical traps detected - high risk period');
    }
    
    return {
      trap_distribution: distribution,
      trend_analysis: trendAnalysis,
      risk_patterns: riskPatterns
    };
  }

  // CLEANUP AND MAINTENANCE
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredBans();
      this.maintainLogSizes();
    }, 60 * 60 * 1000); // Every hour
  }

  private cleanupExpiredBans(): void {
    const now = Date.now();
    for (const [strategyId, ban] of this.bannedSignals.entries()) {
      if (now - ban.timestamp > ban.ban_duration) {
        this.bannedSignals.delete(strategyId);
      }
    }
  }

  private maintainLogSizes(): void {
    if (this.signalLog.length > this.maxLogSize) {
      this.signalLog = this.signalLog.slice(-this.maxLogSize);
    }
    
    if (this.trapHistory.length > 1000) {
      this.trapHistory = this.trapHistory.slice(-1000);
    }
  }

  private maskStrategyId(strategyId: string): string {
    return strategyId.substring(0, 8) + '...';
  }

  // PUBLIC INTERFACE METHODS
  resetShield(): void {
    this.bannedSignals.clear();
    this.signalLog = [];
    this.trapHistory = [];
    this.shieldStats = {
      total_signals_processed: 0,
      signals_blocked: 0,
      traps_detected: 0,
      banned_strategies: 0,
      accuracy_improvement: 0
    };
  }

  exportShieldData(): any {
    return {
      stats: this.getShieldStats(),
      daily_report: this.generateDailyReport(),
      trap_analytics: this.getTrapAnalytics(),
      timestamp: new Date().toISOString()
    };
  }
}

export const waidesKISignalShield = new WaidesKISignalShield();