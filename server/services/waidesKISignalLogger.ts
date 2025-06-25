interface SignalLogEntry {
  id: string;
  timestamp: number;
  strategy_id: string;
  signal_strength: number;
  confidence: number;
  indicators: {
    price: number;
    ema50: number;
    ema200: number;
    vwap: number;
    rsi: number;
    volume: number;
    trend: string;
    vwap_status: string;
  };
  reasoning: string[];
  recommendation: string;
  shouldTrade: boolean;
  outcome?: 'EXECUTED' | 'IGNORED' | 'BLOCKED';
  execution_reason?: string;
}

interface SignalAnalytics {
  totalSignals: number;
  strongSignals: number;
  weakSignals: number;
  executedSignals: number;
  successRate: number;
  averageStrength: number;
  trendingConditions: {
    uptrend: number;
    downtrend: number;
    ranging: number;
  };
  topStrategies: { strategy: string; count: number; avgStrength: number }[];
}

export class WaidesKISignalLogger {
  private signalLog: SignalLogEntry[] = [];
  private maxLogSize: number = 1000; // Keep last 1000 signals

  constructor() {
    this.loadPreviousLogs();
  }

  // LOG SIGNAL WITH COMPREHENSIVE DATA
  logSignal(
    strategyId: string,
    signalStrength: number,
    confidence: number,
    indicators: any,
    reasoning: string[],
    recommendation: string,
    shouldTrade: boolean
  ): string {
    const signalId = `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const logEntry: SignalLogEntry = {
      id: signalId,
      timestamp: Date.now(),
      strategy_id: strategyId,
      signal_strength: signalStrength,
      confidence,
      indicators: {
        price: indicators.price,
        ema50: indicators.ema50,
        ema200: indicators.ema200,
        vwap: indicators.vwap,
        rsi: indicators.rsi,
        volume: indicators.volume,
        trend: indicators.trend,
        vwap_status: indicators.vwap_status
      },
      reasoning,
      recommendation,
      shouldTrade
    };

    this.signalLog.push(logEntry);
    this.maintainLogSize();
    this.saveLogs();

    return signalId;
  }

  // UPDATE SIGNAL OUTCOME
  updateSignalOutcome(
    signalId: string, 
    outcome: 'EXECUTED' | 'IGNORED' | 'BLOCKED', 
    reason?: string
  ): void {
    const signal = this.signalLog.find(s => s.id === signalId);
    if (signal) {
      signal.outcome = outcome;
      signal.execution_reason = reason;
      this.saveLogs();
    }
  }

  // SIGNAL ANALYTICS AND INSIGHTS
  getSignalAnalytics(timeframe?: number): SignalAnalytics {
    let signals = this.signalLog;
    
    if (timeframe) {
      const cutoff = Date.now() - timeframe;
      signals = signals.filter(s => s.timestamp > cutoff);
    }

    const totalSignals = signals.length;
    const strongSignals = signals.filter(s => s.confidence >= 75).length;
    const weakSignals = signals.filter(s => s.confidence < 50).length;
    const executedSignals = signals.filter(s => s.outcome === 'EXECUTED').length;

    // Calculate success rate (signals that were strong and should trade)
    const qualitySignals = signals.filter(s => s.shouldTrade && s.confidence >= 70);
    const successRate = qualitySignals.length > 0 ? 
      (qualitySignals.filter(s => s.outcome === 'EXECUTED').length / qualitySignals.length) : 0;

    const averageStrength = signals.length > 0 ? 
      signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length : 0;

    // Trend analysis
    const trendingConditions = {
      uptrend: signals.filter(s => s.indicators.trend === 'UPTREND').length,
      downtrend: signals.filter(s => s.indicators.trend === 'DOWNTREND').length,
      ranging: signals.filter(s => s.indicators.trend === 'RANGING').length
    };

    // Top strategies analysis
    const strategyMap = new Map<string, { count: number; totalStrength: number }>();
    signals.forEach(signal => {
      const existing = strategyMap.get(signal.strategy_id);
      if (existing) {
        existing.count++;
        existing.totalStrength += signal.confidence;
      } else {
        strategyMap.set(signal.strategy_id, { count: 1, totalStrength: signal.confidence });
      }
    });

    const topStrategies = Array.from(strategyMap.entries())
      .map(([strategy, data]) => ({
        strategy: this.maskStrategyId(strategy),
        count: data.count,
        avgStrength: data.totalStrength / data.count
      }))
      .sort((a, b) => b.avgStrength - a.avgStrength)
      .slice(0, 5);

    return {
      totalSignals,
      strongSignals,
      weakSignals,
      executedSignals,
      successRate: Math.round(successRate * 100),
      averageStrength: Math.round(averageStrength),
      trendingConditions,
      topStrategies
    };
  }

  // GET RECENT SIGNALS
  getRecentSignals(limit: number = 20): Partial<SignalLogEntry>[] {
    return this.signalLog
      .slice(-limit)
      .reverse()
      .map(signal => ({
        id: signal.id,
        timestamp: signal.timestamp,
        strategy_id: this.maskStrategyId(signal.strategy_id),
        confidence: signal.confidence,
        recommendation: signal.recommendation,
        outcome: signal.outcome,
        trend: signal.indicators.trend,
        price: signal.indicators.price
      }));
  }

  // SIGNAL STRENGTH PATTERNS
  analyzeSignalPatterns(): {
    strongestTimeOfDay: string;
    bestTrendConditions: string;
    optimalRSIRange: string;
    volumePreference: string;
  } {
    if (this.signalLog.length < 50) {
      return {
        strongestTimeOfDay: 'Insufficient data',
        bestTrendConditions: 'Insufficient data',
        optimalRSIRange: 'Insufficient data',
        volumePreference: 'Insufficient data'
      };
    }

    const strongSignals = this.signalLog.filter(s => s.confidence >= 80);

    // Time of day analysis
    const hourlyStrength = new Map<number, number[]>();
    strongSignals.forEach(signal => {
      const hour = new Date(signal.timestamp).getHours();
      if (!hourlyStrength.has(hour)) {
        hourlyStrength.set(hour, []);
      }
      hourlyStrength.get(hour)!.push(signal.confidence);
    });

    let bestHour = 0;
    let bestAvgStrength = 0;
    for (const [hour, strengths] of hourlyStrength.entries()) {
      const avg = strengths.reduce((a, b) => a + b, 0) / strengths.length;
      if (avg > bestAvgStrength) {
        bestAvgStrength = avg;
        bestHour = hour;
      }
    }

    // Trend conditions
    const trendStrengths = {
      UPTREND: strongSignals.filter(s => s.indicators.trend === 'UPTREND'),
      DOWNTREND: strongSignals.filter(s => s.indicators.trend === 'DOWNTREND'),
      RANGING: strongSignals.filter(s => s.indicators.trend === 'RANGING')
    };

    const bestTrend = Object.entries(trendStrengths)
      .sort(([,a], [,b]) => b.length - a.length)[0][0];

    // RSI analysis
    const rsiRanges = {
      'Oversold (30-40)': strongSignals.filter(s => s.indicators.rsi >= 30 && s.indicators.rsi <= 40),
      'Neutral (40-60)': strongSignals.filter(s => s.indicators.rsi > 40 && s.indicators.rsi < 60),
      'Overbought (60-70)': strongSignals.filter(s => s.indicators.rsi >= 60 && s.indicators.rsi <= 70)
    };

    const bestRSIRange = Object.entries(rsiRanges)
      .sort(([,a], [,b]) => b.length - a.length)[0][0];

    return {
      strongestTimeOfDay: `${bestHour}:00 UTC`,
      bestTrendConditions: bestTrend,
      optimalRSIRange: bestRSIRange,
      volumePreference: 'Above average volume preferred'
    };
  }

  // SIGNAL QUALITY METRICS
  getSignalQualityMetrics(): {
    signalAccuracy: number;
    falsePositiveRate: number;
    signalReliability: number;
    strengthDistribution: { weak: number; moderate: number; strong: number };
  } {
    const totalSignals = this.signalLog.length;
    if (totalSignals === 0) {
      return {
        signalAccuracy: 0,
        falsePositiveRate: 0,
        signalReliability: 0,
        strengthDistribution: { weak: 0, moderate: 0, strong: 0 }
      };
    }

    const executedSignals = this.signalLog.filter(s => s.outcome === 'EXECUTED');
    const shouldTradeSignals = this.signalLog.filter(s => s.shouldTrade);
    const falsePositives = this.signalLog.filter(s => s.shouldTrade && s.outcome === 'IGNORED');

    const signalAccuracy = shouldTradeSignals.length > 0 ? 
      (executedSignals.length / shouldTradeSignals.length) * 100 : 0;

    const falsePositiveRate = shouldTradeSignals.length > 0 ? 
      (falsePositives.length / shouldTradeSignals.length) * 100 : 0;

    const strongSignalsExecuted = executedSignals.filter(s => s.confidence >= 80).length;
    const signalReliability = executedSignals.length > 0 ? 
      (strongSignalsExecuted / executedSignals.length) * 100 : 0;

    const strengthDistribution = {
      weak: this.signalLog.filter(s => s.confidence < 50).length,
      moderate: this.signalLog.filter(s => s.confidence >= 50 && s.confidence < 80).length,
      strong: this.signalLog.filter(s => s.confidence >= 80).length
    };

    return {
      signalAccuracy: Math.round(signalAccuracy),
      falsePositiveRate: Math.round(falsePositiveRate),
      signalReliability: Math.round(signalReliability),
      strengthDistribution
    };
  }

  // PRIVATE HELPER METHODS
  private maintainLogSize(): void {
    if (this.signalLog.length > this.maxLogSize) {
      this.signalLog = this.signalLog.slice(-this.maxLogSize);
    }
  }

  private saveLogs(): void {
    try {
      // In production, this would save to database
      // For now, keep in memory with periodic cleanup
    } catch (error) {
      // Silent error handling
    }
  }

  private loadPreviousLogs(): void {
    try {
      // In production, this would load from database
    } catch (error) {
      // Start fresh if no previous data
    }
  }

  private maskStrategyId(strategyId: string): string {
    if (!strategyId) return 'Unknown';
    
    // Convert internal strategy ID to user-friendly name
    const parts = strategyId.split('_');
    const trend = parts[0] || 'MIXED';
    const vwap = parts[1] || 'NEUTRAL';
    
    return `${trend}_${vwap}_Strategy`;
  }

  // PUBLIC INTERFACE
  getLogStats(): {
    totalLogs: number;
    memoryUsage: string;
    oldestLog: number;
    newestLog: number;
  } {
    return {
      totalLogs: this.signalLog.length,
      memoryUsage: `${Math.round(JSON.stringify(this.signalLog).length / 1024)}KB`,
      oldestLog: this.signalLog[0]?.timestamp || 0,
      newestLog: this.signalLog[this.signalLog.length - 1]?.timestamp || 0
    };
  }

  clearOldLogs(daysToKeep: number = 7): number {
    const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const initialLength = this.signalLog.length;
    this.signalLog = this.signalLog.filter(signal => signal.timestamp > cutoff);
    const cleared = initialLength - this.signalLog.length;
    
    if (cleared > 0) {
      this.saveLogs();
    }
    
    return cleared;
  }
}

export const waidesKISignalLogger = new WaidesKISignalLogger();