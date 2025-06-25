import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKILearning } from './waidesKILearningEngine';
import { waidesKISignalShield } from './waidesKISignalShield';

interface FailedStrategy {
  strategy_id: string;
  failure_timestamp: number;
  indicators: {
    price: number;
    rsi: number;
    vwap_status: string;
    ema50: number;
    ema200: number;
    volume: number;
    trend: string;
  };
  failure_reason: string;
  loss_amount: number;
  original_confidence: number;
  market_conditions: any;
}

interface RepairSuggestion {
  strategy_id: string;
  improvements: {
    rsi_cap?: number;
    rsi_floor?: number;
    avoid_vwap_dips?: boolean;
    tighten_price_range?: boolean;
    volume_threshold?: number;
    confidence_boost?: number;
    time_filter?: string;
    risk_reduction?: number;
  };
  repair_confidence: number;
  repair_reasoning: string[];
  estimated_improvement: number;
}

interface SimulationResult {
  original_performance: {
    wins: number;
    losses: number;
    win_rate: number;
    total_return: number;
  };
  repaired_performance: {
    wins: number;
    losses: number;
    win_rate: number;
    total_return: number;
  };
  improvement: {
    win_rate_delta: number;
    return_delta: number;
    risk_reduction: number;
  };
  tested_strategies: number;
  simulation_confidence: number;
}

export class WaidesKISelfRepair {
  private failedStrategies: Map<string, FailedStrategy[]> = new Map();
  private repairSuggestions: Map<string, RepairSuggestion> = new Map();
  private simulationHistory: SimulationResult[] = [];
  private learningCycles: number = 0;
  private maxFailureHistory: number = 100;
  private repairSuccess: Map<string, number> = new Map();

  constructor() {
    this.startAutonomousLearningLoop();
  }

  // FAILURE RECORDING AND ANALYSIS
  recordFailure(
    strategyId: string, 
    indicators: any, 
    reason: string, 
    lossAmount: number, 
    originalConfidence: number,
    marketConditions: any
  ): void {
    const failure: FailedStrategy = {
      strategy_id: strategyId,
      failure_timestamp: Date.now(),
      indicators: {
        price: indicators.price,
        rsi: indicators.rsi,
        vwap_status: indicators.vwap_status,
        ema50: indicators.ema50,
        ema200: indicators.ema200,
        volume: indicators.volume,
        trend: indicators.trend
      },
      failure_reason: reason,
      loss_amount: lossAmount,
      original_confidence: originalConfidence,
      market_conditions: marketConditions
    };

    // Add to failure history
    if (!this.failedStrategies.has(strategyId)) {
      this.failedStrategies.set(strategyId, []);
    }
    
    const failures = this.failedStrategies.get(strategyId)!;
    failures.push(failure);
    
    // Keep only recent failures
    if (failures.length > this.maxFailureHistory) {
      failures.splice(0, failures.length - this.maxFailureHistory);
    }

    // Log emotional response to failure
    waidesKIDailyReporter.logEmotionalState(
      'PATIENT',
      `Strategy failure recorded: ${reason}`,
      indicators.trend,
      Math.max(20, originalConfidence - 30)
    );

    // Record lesson about the failure
    waidesKIDailyReporter.recordLesson(
      `Strategy ${strategyId} failed: ${reason} - Loss: ${lossAmount.toFixed(2)}`,
      'STRATEGY',
      lossAmount > 50 ? 'HIGH' : 'MEDIUM',
      'Self-Repair System'
    );

    // Generate immediate repair suggestion
    this.generateRepairSuggestion(strategyId);
  }

  // INTELLIGENT REPAIR SUGGESTION GENERATION
  private generateRepairSuggestion(strategyId: string): RepairSuggestion | null {
    const failures = this.failedStrategies.get(strategyId);
    if (!failures || failures.length === 0) return null;

    const recentFailures = failures.slice(-10); // Analyze last 10 failures
    const improvements: RepairSuggestion['improvements'] = {};
    const reasoning: string[] = [];
    let repairConfidence = 60;

    // Analyze RSI patterns in failures
    const highRSIFailures = recentFailures.filter(f => f.indicators.rsi > 70).length;
    const lowRSIFailures = recentFailures.filter(f => f.indicators.rsi < 30).length;
    
    if (highRSIFailures > recentFailures.length * 0.6) {
      improvements.rsi_cap = 68;
      reasoning.push(`RSI cap at 68 (${highRSIFailures} high RSI failures detected)`);
      repairConfidence += 15;
    }
    
    if (lowRSIFailures > recentFailures.length * 0.6) {
      improvements.rsi_floor = 32;
      reasoning.push(`RSI floor at 32 (${lowRSIFailures} low RSI failures detected)`);
      repairConfidence += 15;
    }

    // Analyze VWAP patterns
    const vwapBelowFailures = recentFailures.filter(f => f.indicators.vwap_status === 'BELOW').length;
    if (vwapBelowFailures > recentFailures.length * 0.7) {
      improvements.avoid_vwap_dips = true;
      reasoning.push(`Avoid trades when price below VWAP (${vwapBelowFailures} VWAP-below failures)`);
      repairConfidence += 20;
    }

    // Analyze price-EMA divergence
    const largeDivergenceFailures = recentFailures.filter(f => 
      Math.abs(f.indicators.price - f.indicators.ema50) > f.indicators.price * 0.05
    ).length;
    
    if (largeDivergenceFailures > recentFailures.length * 0.5) {
      improvements.tighten_price_range = true;
      reasoning.push(`Tighten price-EMA range (${largeDivergenceFailures} large divergence failures)`);
      repairConfidence += 10;
    }

    // Analyze volume patterns
    const avgVolume = recentFailures.reduce((sum, f) => sum + f.indicators.volume, 0) / recentFailures.length;
    const lowVolumeFailures = recentFailures.filter(f => f.indicators.volume < avgVolume * 0.7).length;
    
    if (lowVolumeFailures > recentFailures.length * 0.5) {
      improvements.volume_threshold = avgVolume * 0.8;
      reasoning.push(`Require higher volume threshold (${lowVolumeFailures} low volume failures)`);
      repairConfidence += 12;
    }

    // Calculate confidence boost based on failure analysis
    const avgOriginalConfidence = recentFailures.reduce((sum, f) => sum + f.original_confidence, 0) / recentFailures.length;
    if (avgOriginalConfidence > 75) {
      improvements.confidence_boost = -10; // Reduce overconfidence
      reasoning.push('Reduce confidence for this strategy type (overconfidence detected)');
    }

    // Risk reduction based on loss amounts
    const avgLoss = recentFailures.reduce((sum, f) => sum + f.loss_amount, 0) / recentFailures.length;
    if (avgLoss > 30) {
      improvements.risk_reduction = 0.7; // Reduce position size to 70%
      reasoning.push(`Reduce position size due to significant losses (avg: ${avgLoss.toFixed(2)})`);
      repairConfidence += 25;
    }

    // Time-based patterns
    const timeFailures = this.analyzeTimePatterns(recentFailures);
    if (timeFailures.avoid_times.length > 0) {
      improvements.time_filter = timeFailures.avoid_times.join(',');
      reasoning.push(`Avoid trading during: ${timeFailures.avoid_times.join(', ')}`);
      repairConfidence += 15;
    }

    if (Object.keys(improvements).length === 0) {
      reasoning.push('No clear improvement patterns detected - requires more failure data');
      repairConfidence = 30;
    }

    const suggestion: RepairSuggestion = {
      strategy_id: strategyId,
      improvements,
      repair_confidence: Math.min(95, repairConfidence),
      repair_reasoning: reasoning,
      estimated_improvement: this.estimateImprovement(improvements, recentFailures)
    };

    this.repairSuggestions.set(strategyId, suggestion);

    // Log repair suggestion
    waidesKIDailyReporter.recordLesson(
      `Generated repair for ${strategyId}: ${reasoning[0] || 'Multiple improvements identified'}`,
      'STRATEGY',
      repairConfidence > 80 ? 'HIGH' : 'MEDIUM',
      'Self-Repair Engine'
    );

    return suggestion;
  }

  private analyzeTimePatterns(failures: FailedStrategy[]): { avoid_times: string[] } {
    const timeFailures = new Map<string, number>();
    
    failures.forEach(failure => {
      const hour = new Date(failure.failure_timestamp).getHours();
      let timeKey = '';
      
      if (hour >= 0 && hour < 6) timeKey = 'early_morning';
      else if (hour >= 6 && hour < 12) timeKey = 'morning';
      else if (hour >= 12 && hour < 18) timeKey = 'afternoon';
      else timeKey = 'evening';
      
      timeFailures.set(timeKey, (timeFailures.get(timeKey) || 0) + 1);
    });

    const avoidTimes: string[] = [];
    const totalFailures = failures.length;
    
    for (const [time, count] of timeFailures.entries()) {
      if (count > totalFailures * 0.4) { // If more than 40% of failures in this time
        avoidTimes.push(time);
      }
    }
    
    return { avoid_times: avoidTimes };
  }

  private estimateImprovement(improvements: RepairSuggestion['improvements'], failures: FailedStrategy[]): number {
    let estimatedImprovement = 0;
    
    if (improvements.rsi_cap || improvements.rsi_floor) {
      estimatedImprovement += 15; // RSI filtering typically improves by 15%
    }
    
    if (improvements.avoid_vwap_dips) {
      estimatedImprovement += 20; // VWAP filtering highly effective
    }
    
    if (improvements.volume_threshold) {
      estimatedImprovement += 10; // Volume filtering moderately effective
    }
    
    if (improvements.risk_reduction) {
      estimatedImprovement += 25; // Risk reduction very effective for loss prevention
    }
    
    return Math.min(60, estimatedImprovement); // Cap at 60% improvement estimate
  }

  // TRADE SIMULATION ENGINE
  async simulateStrategyRepairs(historicalData: any[]): Promise<SimulationResult> {
    if (historicalData.length < 10) {
      throw new Error('Insufficient historical data for simulation');
    }

    let originalWins = 0;
    let originalLosses = 0;
    let originalReturn = 0;
    
    let repairedWins = 0;
    let repairedLosses = 0;
    let repairedReturn = 0;

    const testedStrategies = new Set<string>();

    // Simulate trades with original logic
    for (const dataPoint of historicalData) {
      const strategyId = this.generateStrategyId(dataPoint);
      testedStrategies.add(strategyId);
      
      const originalDecision = this.simulateOriginalDecision(dataPoint);
      const repairedDecision = this.simulateRepairedDecision(dataPoint, strategyId);
      
      // Simulate outcomes (based on next period price movement)
      const outcome = dataPoint.actual_outcome || (Math.random() > 0.6 ? 'win' : 'loss');
      const returnAmount = dataPoint.return_amount || (outcome === 'win' ? 25 : -15);
      
      // Original performance
      if (originalDecision !== 'WAIT') {
        if (outcome === 'win') {
          originalWins++;
          originalReturn += returnAmount;
        } else {
          originalLosses++;
          originalReturn += returnAmount;
        }
      }
      
      // Repaired performance
      if (repairedDecision !== 'WAIT') {
        if (outcome === 'win') {
          repairedWins++;
          repairedReturn += returnAmount * (repairedDecision === 'REDUCED_RISK' ? 0.7 : 1);
        } else {
          repairedLosses++;
          repairedReturn += returnAmount * (repairedDecision === 'REDUCED_RISK' ? 0.7 : 1);
        }
      }
    }

    const originalTotal = originalWins + originalLosses;
    const repairedTotal = repairedWins + repairedLosses;
    
    const originalWinRate = originalTotal > 0 ? (originalWins / originalTotal) * 100 : 0;
    const repairedWinRate = repairedTotal > 0 ? (repairedWins / repairedTotal) * 100 : 0;

    const result: SimulationResult = {
      original_performance: {
        wins: originalWins,
        losses: originalLosses,
        win_rate: originalWinRate,
        total_return: originalReturn
      },
      repaired_performance: {
        wins: repairedWins,
        losses: repairedLosses,
        win_rate: repairedWinRate,
        total_return: repairedReturn
      },
      improvement: {
        win_rate_delta: repairedWinRate - originalWinRate,
        return_delta: repairedReturn - originalReturn,
        risk_reduction: this.calculateRiskReduction(originalLosses, repairedLosses)
      },
      tested_strategies: testedStrategies.size,
      simulation_confidence: Math.min(95, historicalData.length * 2) // Higher confidence with more data
    };

    this.simulationHistory.push(result);
    
    // Keep only last 10 simulations
    if (this.simulationHistory.length > 10) {
      this.simulationHistory = this.simulationHistory.slice(-10);
    }

    // Log simulation results
    waidesKIDailyReporter.recordLesson(
      `Simulation showed ${result.improvement.win_rate_delta.toFixed(1)}% win rate improvement with repairs`,
      'STRATEGY',
      result.improvement.win_rate_delta > 10 ? 'HIGH' : 'MEDIUM',
      'Trade Simulation Engine'
    );

    return result;
  }

  private simulateOriginalDecision(dataPoint: any): string {
    // Simulate original decision logic
    if (dataPoint.rsi < 65 && dataPoint.vwap_status === 'ABOVE' && dataPoint.trend === 'UPTREND') {
      return 'BUY';
    } else if (dataPoint.rsi > 35 && dataPoint.vwap_status === 'BELOW' && dataPoint.trend === 'DOWNTREND') {
      return 'SELL';
    }
    return 'WAIT';
  }

  private simulateRepairedDecision(dataPoint: any, strategyId: string): string {
    const repairSuggestion = this.repairSuggestions.get(strategyId);
    if (!repairSuggestion) {
      return this.simulateOriginalDecision(dataPoint);
    }

    const improvements = repairSuggestion.improvements;
    
    // Apply repair filters
    if (improvements.rsi_cap && dataPoint.rsi > improvements.rsi_cap) return 'WAIT';
    if (improvements.rsi_floor && dataPoint.rsi < improvements.rsi_floor) return 'WAIT';
    if (improvements.avoid_vwap_dips && dataPoint.vwap_status === 'BELOW') return 'WAIT';
    if (improvements.volume_threshold && dataPoint.volume < improvements.volume_threshold) return 'WAIT';
    
    if (improvements.tighten_price_range) {
      const divergence = Math.abs(dataPoint.price - dataPoint.ema50) / dataPoint.price;
      if (divergence > 0.03) return 'WAIT'; // 3% max divergence
    }

    const originalDecision = this.simulateOriginalDecision(dataPoint);
    
    // Apply risk reduction
    if (improvements.risk_reduction && originalDecision !== 'WAIT') {
      return 'REDUCED_RISK';
    }
    
    return originalDecision;
  }

  private calculateRiskReduction(originalLosses: number, repairedLosses: number): number {
    if (originalLosses === 0) return 0;
    return ((originalLosses - repairedLosses) / originalLosses) * 100;
  }

  private generateStrategyId(dataPoint: any): string {
    const trendCode = dataPoint.trend?.substring(0, 3).toUpperCase() || 'UNK';
    const rsiCode = dataPoint.rsi > 70 ? 'H' : dataPoint.rsi < 30 ? 'L' : 'M';
    const vwapCode = dataPoint.vwap_status === 'ABOVE' ? 'A' : 'B';
    return `${trendCode}_${rsiCode}${vwapCode}_${Date.now().toString().slice(-3)}`;
  }

  // AUTONOMOUS LEARNING LOOP
  private startAutonomousLearningLoop(): void {
    // Run learning cycle every 10 minutes
    setInterval(() => {
      this.runLearningCycle();
    }, 10 * 60 * 1000);

    // Initial cycle after 1 minute
    setTimeout(() => {
      this.runLearningCycle();
    }, 60 * 1000);
  }

  private async runLearningCycle(): Promise<void> {
    this.learningCycles++;
    
    try {
      // Log emotional state for learning cycle
      waidesKIDailyReporter.logEmotionalState(
        'FOCUSED',
        'Running autonomous learning cycle',
        'Learning Phase',
        70
      );

      // Generate repair suggestions for all failed strategies
      let repairsGenerated = 0;
      for (const strategyId of this.failedStrategies.keys()) {
        const suggestion = this.generateRepairSuggestion(strategyId);
        if (suggestion && suggestion.repair_confidence > 60) {
          repairsGenerated++;
        }
      }

      // Apply successful repairs to learning system
      this.applySuccessfulRepairs();

      // Clean up old failure data
      this.cleanupOldFailures();

      if (repairsGenerated > 0) {
        waidesKIDailyReporter.recordLesson(
          `Learning cycle ${this.learningCycles}: Generated ${repairsGenerated} repair suggestions`,
          'STRATEGY',
          'MEDIUM',
          'Autonomous Learning Loop'
        );
      }

    } catch (error) {
      console.error('Error in learning cycle:', error);
      
      waidesKIDailyReporter.logEmotionalState(
        'UNCERTAIN',
        'Learning cycle encountered error',
        'Error Recovery',
        40
      );
    }
  }

  private applySuccessfulRepairs(): void {
    // Check which repairs have been successful
    for (const [strategyId, suggestion] of this.repairSuggestions.entries()) {
      const successRate = this.repairSuccess.get(strategyId) || 0;
      
      if (successRate > 70 && suggestion.repair_confidence > 75) {
        // Apply successful repair patterns to learning engine
        waidesKILearning.recordExperience(
          strategyId,
          'REPAIR_SUCCESS',
          suggestion.estimated_improvement,
          {
            improvements: suggestion.improvements,
            success_rate: successRate
          }
        );
      }
    }
  }

  private cleanupOldFailures(): void {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const [strategyId, failures] of this.failedStrategies.entries()) {
      const recentFailures = failures.filter(f => f.failure_timestamp > oneWeekAgo);
      
      if (recentFailures.length === 0) {
        this.failedStrategies.delete(strategyId);
        this.repairSuggestions.delete(strategyId);
        this.repairSuccess.delete(strategyId);
      } else {
        this.failedStrategies.set(strategyId, recentFailures);
      }
    }
  }

  // PUBLIC INTERFACE METHODS
  getRepairSuggestion(strategyId: string): RepairSuggestion | null {
    return this.repairSuggestions.get(strategyId) || null;
  }

  getAllRepairSuggestions(): RepairSuggestion[] {
    return Array.from(this.repairSuggestions.values());
  }

  getFailureHistory(strategyId: string): FailedStrategy[] {
    return this.failedStrategies.get(strategyId) || [];
  }

  getSimulationHistory(): SimulationResult[] {
    return [...this.simulationHistory];
  }

  getSelfRepairStats(): {
    total_failures: number;
    strategies_with_failures: number;
    repair_suggestions: number;
    learning_cycles: number;
    avg_repair_confidence: number;
    success_rate: number;
  } {
    const totalFailures = Array.from(this.failedStrategies.values())
      .reduce((sum, failures) => sum + failures.length, 0);
    
    const avgRepairConfidence = this.repairSuggestions.size > 0 ?
      Array.from(this.repairSuggestions.values())
        .reduce((sum, suggestion) => sum + suggestion.repair_confidence, 0) / this.repairSuggestions.size : 0;
    
    const avgSuccessRate = this.repairSuccess.size > 0 ?
      Array.from(this.repairSuccess.values())
        .reduce((sum, rate) => sum + rate, 0) / this.repairSuccess.size : 0;

    return {
      total_failures: totalFailures,
      strategies_with_failures: this.failedStrategies.size,
      repair_suggestions: this.repairSuggestions.size,
      learning_cycles: this.learningCycles,
      avg_repair_confidence: avgRepairConfidence,
      success_rate: avgSuccessRate
    };
  }

  markRepairSuccess(strategyId: string, successRate: number): void {
    this.repairSuccess.set(strategyId, successRate);
  }

  generateTestData(days: number = 7): any[] {
    const testData: any[] = [];
    const basePrice = 2400;
    
    for (let i = 0; i < days * 24; i++) { // Hourly data
      const trend = Math.random() > 0.5 ? 'UPTREND' : 'DOWNTREND';
      const rsi = 20 + Math.random() * 60;
      const price = basePrice + (Math.random() - 0.5) * 200;
      const ema50 = price + (Math.random() - 0.5) * 50;
      
      testData.push({
        timestamp: Date.now() - (days * 24 - i) * 60 * 60 * 1000,
        trend,
        rsi,
        vwap_status: Math.random() > 0.5 ? 'ABOVE' : 'BELOW',
        price,
        ema50,
        ema200: ema50 + (Math.random() - 0.5) * 20,
        volume: 1000000 + Math.random() * 2000000,
        actual_outcome: Math.random() > 0.4 ? 'win' : 'loss',
        return_amount: Math.random() > 0.4 ? (10 + Math.random() * 30) : -(5 + Math.random() * 25)
      });
    }
    
    return testData;
  }

  resetSelfRepair(): void {
    this.failedStrategies.clear();
    this.repairSuggestions.clear();
    this.simulationHistory.length = 0;
    this.repairSuccess.clear();
    this.learningCycles = 0;
  }
}

export const waidesKISelfRepair = new WaidesKISelfRepair();