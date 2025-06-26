/**
 * WAIDES KI STRATEGY AUTO-TUNER
 * Automatically adjusts strategy parameters based on performance feedback
 */

import { WaidesKIPerformanceTracker, StrategyPerformance } from './waidesKIPerformanceTracker';
import { WaidesKIStopLossManager, StopLossConfig } from './waidesKIStopLossManager';

export interface TuningParameters {
  stop_loss_pct: number;
  trail_pct: number;
  confidence_threshold: number;
  risk_multiplier: number;
  position_size_multiplier: number;
  volatility_adjustment: number;
}

export interface TuningRule {
  condition: 'WIN_RATE_LOW' | 'WIN_RATE_HIGH' | 'PROFIT_FACTOR_LOW' | 'PROFIT_FACTOR_HIGH' | 
           'DRAWDOWN_HIGH' | 'CONSECUTIVE_LOSSES' | 'VOLATILITY_HIGH' | 'TREND_DECLINING';
  threshold: number;
  adjustment: Partial<TuningParameters>;
  description: string;
}

export interface TuningSession {
  session_id: string;
  timestamp: number;
  strategy_name: string;
  before_params: TuningParameters;
  after_params: TuningParameters;
  trigger_reason: string;
  performance_before: StrategyPerformance;
  trades_evaluated: number;
  confidence_score: number;
}

export class WaidesKIStrategyTuner {
  private tracker: WaidesKIPerformanceTracker;
  private stopLossManager: WaidesKIStopLossManager;
  private tuningInterval: number = 50; // Evaluate after every 50 trades
  private minTradesForTuning: number = 20;
  private tuningSessions: TuningSession[] = [];
  private strategyParameters: Map<string, TuningParameters> = new Map();
  private tuningRules: TuningRule[] = [];

  constructor(tracker: WaidesKIPerformanceTracker, stopLossManager: WaidesKIStopLossManager) {
    this.tracker = tracker;
    this.stopLossManager = stopLossManager;
    this.initializeTuningRules();
    this.initializeDefaultParameters();
  }

  /**
   * Initialize default tuning rules
   */
  private initializeTuningRules(): void {
    this.tuningRules = [
      {
        condition: 'WIN_RATE_LOW',
        threshold: 0.45,
        adjustment: {
          stop_loss_pct: 0.002,  // Tighten stop loss
          confidence_threshold: 0.05, // Increase confidence requirement
          risk_multiplier: -0.1 // Reduce risk
        },
        description: 'Low win rate detected - tightening risk controls'
      },
      {
        condition: 'WIN_RATE_HIGH',
        threshold: 0.65,
        adjustment: {
          stop_loss_pct: -0.001, // Loosen stop loss slightly
          risk_multiplier: 0.05,  // Increase risk slightly
          position_size_multiplier: 0.1 // Increase position size
        },
        description: 'High win rate - optimizing for better returns'
      },
      {
        condition: 'PROFIT_FACTOR_LOW',
        threshold: 0.8,
        adjustment: {
          stop_loss_pct: 0.003,
          trail_pct: 0.001,
          confidence_threshold: 0.1
        },
        description: 'Poor profit factor - implementing stricter controls'
      },
      {
        condition: 'PROFIT_FACTOR_HIGH',
        threshold: 2.0,
        adjustment: {
          stop_loss_pct: -0.002,
          position_size_multiplier: 0.15,
          risk_multiplier: 0.1
        },
        description: 'Excellent profit factor - capitalizing on performance'
      },
      {
        condition: 'DRAWDOWN_HIGH',
        threshold: 15.0,
        adjustment: {
          stop_loss_pct: 0.005,
          risk_multiplier: -0.2,
          position_size_multiplier: -0.3,
          confidence_threshold: 0.15
        },
        description: 'High drawdown detected - implementing emergency controls'
      },
      {
        condition: 'CONSECUTIVE_LOSSES',
        threshold: 5,
        adjustment: {
          stop_loss_pct: 0.003,
          confidence_threshold: 0.2,
          risk_multiplier: -0.15
        },
        description: 'Consecutive losses - reducing risk exposure'
      },
      {
        condition: 'VOLATILITY_HIGH',
        threshold: 3.0,
        adjustment: {
          stop_loss_pct: 0.004,
          trail_pct: 0.002,
          volatility_adjustment: 0.1
        },
        description: 'High volatility - adjusting for market conditions'
      }
    ];
  }

  /**
   * Initialize default parameters for strategies
   */
  private initializeDefaultParameters(): void {
    const defaultParams: TuningParameters = {
      stop_loss_pct: 0.01,
      trail_pct: 0.005,
      confidence_threshold: 0.7,
      risk_multiplier: 1.0,
      position_size_multiplier: 1.0,
      volatility_adjustment: 0.0
    };

    const strategies = [
      'DIVINE_QUANTUM_FLUX',
      'NEURAL_QUANTUM_SINGULARITY',
      'TRINITY_BRAIN_CONSENSUS',
      'STOP_LOSS_MANAGER',
      'AUTO_TUNED_STRATEGY'
    ];

    strategies.forEach(strategy => {
      this.strategyParameters.set(strategy, { ...defaultParams });
    });
  }

  /**
   * Evaluate strategy performance and apply tuning if needed
   */
  evaluate(strategyName: string): {
    tuning_applied: boolean;
    session?: TuningSession;
    new_parameters?: TuningParameters;
    trigger_reason?: string;
  } {
    const performance = this.tracker.getStrategyPerformance(strategyName);
    
    // Check if we have enough trades for evaluation
    if (performance.metrics.total_trades < this.minTradesForTuning) {
      return { tuning_applied: false };
    }

    // Check if we've reached the tuning interval
    const lastSession = this.getLastTuningSession(strategyName);
    const tradesSinceLastTuning = lastSession 
      ? performance.metrics.total_trades - lastSession.trades_evaluated
      : performance.metrics.total_trades;

    if (tradesSinceLastTuning < this.tuningInterval) {
      return { tuning_applied: false };
    }

    // Evaluate tuning rules
    const triggeredRules = this.evaluateTuningRules(performance);
    
    if (triggeredRules.length === 0) {
      return { tuning_applied: false };
    }

    // Apply tuning
    const currentParams = this.strategyParameters.get(strategyName) || this.getDefaultParameters();
    const newParams = this.applyTuningRules(currentParams, triggeredRules);
    
    // Create tuning session
    const session: TuningSession = {
      session_id: this.generateSessionId(),
      timestamp: Date.now(),
      strategy_name: strategyName,
      before_params: { ...currentParams },
      after_params: { ...newParams },
      trigger_reason: triggeredRules.map(r => r.description).join('; '),
      performance_before: performance,
      trades_evaluated: performance.metrics.total_trades,
      confidence_score: performance.confidence_score
    };

    // Update parameters
    this.strategyParameters.set(strategyName, newParams);
    this.tuningSessions.push(session);

    // Apply to stop loss manager if it's the active strategy
    this.updateStopLossManager(newParams);

    // Keep only last 100 sessions
    if (this.tuningSessions.length > 100) {
      this.tuningSessions.shift();
    }

    return {
      tuning_applied: true,
      session,
      new_parameters: newParams,
      trigger_reason: session.trigger_reason
    };
  }

  /**
   * Evaluate which tuning rules should be triggered
   */
  private evaluateTuningRules(performance: StrategyPerformance): TuningRule[] {
    const triggeredRules: TuningRule[] = [];
    const metrics = performance.metrics;

    for (const rule of this.tuningRules) {
      let triggered = false;

      switch (rule.condition) {
        case 'WIN_RATE_LOW':
          triggered = metrics.win_rate < rule.threshold;
          break;
        case 'WIN_RATE_HIGH':
          triggered = metrics.win_rate > rule.threshold;
          break;
        case 'PROFIT_FACTOR_LOW':
          triggered = metrics.profit_factor < rule.threshold;
          break;
        case 'PROFIT_FACTOR_HIGH':
          triggered = metrics.profit_factor > rule.threshold;
          break;
        case 'DRAWDOWN_HIGH':
          triggered = metrics.max_drawdown_pct > rule.threshold;
          break;
        case 'CONSECUTIVE_LOSSES':
          triggered = metrics.max_consecutive_losses >= rule.threshold;
          break;
        case 'VOLATILITY_HIGH':
          // Calculate recent volatility from performance data
          const recentVolatility = this.calculateRecentVolatility(performance.recent_performance);
          triggered = recentVolatility > rule.threshold;
          break;
        case 'TREND_DECLINING':
          triggered = performance.performance_trend === 'DECLINING';
          break;
      }

      if (triggered) {
        triggeredRules.push(rule);
      }
    }

    return triggeredRules;
  }

  /**
   * Apply tuning rules to parameters
   */
  private applyTuningRules(currentParams: TuningParameters, rules: TuningRule[]): TuningParameters {
    const newParams = { ...currentParams };

    for (const rule of rules) {
      if (rule.adjustment.stop_loss_pct !== undefined) {
        newParams.stop_loss_pct = Math.max(0.005, Math.min(0.05, 
          newParams.stop_loss_pct + rule.adjustment.stop_loss_pct));
      }
      
      if (rule.adjustment.trail_pct !== undefined) {
        newParams.trail_pct = Math.max(0.002, Math.min(0.02, 
          newParams.trail_pct + rule.adjustment.trail_pct));
      }
      
      if (rule.adjustment.confidence_threshold !== undefined) {
        newParams.confidence_threshold = Math.max(0.5, Math.min(0.95, 
          newParams.confidence_threshold + rule.adjustment.confidence_threshold));
      }
      
      if (rule.adjustment.risk_multiplier !== undefined) {
        newParams.risk_multiplier = Math.max(0.1, Math.min(2.0, 
          newParams.risk_multiplier + rule.adjustment.risk_multiplier));
      }
      
      if (rule.adjustment.position_size_multiplier !== undefined) {
        newParams.position_size_multiplier = Math.max(0.1, Math.min(2.0, 
          newParams.position_size_multiplier + rule.adjustment.position_size_multiplier));
      }
      
      if (rule.adjustment.volatility_adjustment !== undefined) {
        newParams.volatility_adjustment = Math.max(-0.5, Math.min(0.5, 
          newParams.volatility_adjustment + rule.adjustment.volatility_adjustment));
      }
    }

    return newParams;
  }

  /**
   * Update stop loss manager with new parameters
   */
  private updateStopLossManager(params: TuningParameters): void {
    const newConfig: Partial<StopLossConfig> = {
      initial_sl_pct: params.stop_loss_pct,
      trail_pct: params.trail_pct,
      max_sl_pct: Math.min(0.1, params.stop_loss_pct * 5),
      min_sl_pct: Math.max(0.002, params.stop_loss_pct * 0.5)
    };

    this.stopLossManager.updateConfig(newConfig);
  }

  /**
   * Calculate recent volatility from trade records
   */
  private calculateRecentVolatility(recentTrades: any[]): number {
    if (recentTrades.length < 5) return 0;

    const returns = recentTrades.slice(-10).map(trade => trade.profit_loss_pct);
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Get last tuning session for strategy
   */
  private getLastTuningSession(strategyName: string): TuningSession | null {
    const sessions = this.tuningSessions
      .filter(s => s.strategy_name === strategyName)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    return sessions[0] || null;
  }

  /**
   * Get current parameters for strategy
   */
  getParameters(strategyName: string): TuningParameters {
    return this.strategyParameters.get(strategyName) || this.getDefaultParameters();
  }

  /**
   * Get default parameters
   */
  private getDefaultParameters(): TuningParameters {
    return {
      stop_loss_pct: 0.01,
      trail_pct: 0.005,
      confidence_threshold: 0.7,
      risk_multiplier: 1.0,
      position_size_multiplier: 1.0,
      volatility_adjustment: 0.0
    };
  }

  /**
   * Get tuning statistics
   */
  getTuningStats(): {
    total_sessions: number;
    strategies_tuned: number;
    most_tuned_strategy: string;
    recent_sessions: TuningSession[];
    parameter_evolution: Record<string, TuningParameters[]>;
  } {
    const strategiesTuned = new Set(this.tuningSessions.map(s => s.strategy_name)).size;
    
    const strategySessionCounts = this.tuningSessions.reduce((counts, session) => {
      counts[session.strategy_name] = (counts[session.strategy_name] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const mostTunedStrategy = Object.entries(strategySessionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
    
    const recentSessions = this.tuningSessions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
    
    // Build parameter evolution for each strategy
    const parameterEvolution: Record<string, TuningParameters[]> = {};
    for (const [strategy] of this.strategyParameters) {
      const strategySessions = this.tuningSessions
        .filter(s => s.strategy_name === strategy)
        .sort((a, b) => a.timestamp - b.timestamp);
      
      parameterEvolution[strategy] = strategySessions.map(s => s.after_params);
    }

    return {
      total_sessions: this.tuningSessions.length,
      strategies_tuned: strategiesTuned,
      most_tuned_strategy: mostTunedStrategy,
      recent_sessions: recentSessions,
      parameter_evolution: parameterEvolution
    };
  }

  /**
   * Manual parameter override
   */
  setParameters(strategyName: string, params: Partial<TuningParameters>): void {
    const currentParams = this.getParameters(strategyName);
    const newParams = { ...currentParams, ...params };
    
    this.strategyParameters.set(strategyName, newParams);
    
    // Update stop loss manager if needed
    this.updateStopLossManager(newParams);
  }

  /**
   * Reset parameters to defaults
   */
  resetParameters(strategyName?: string): void {
    if (strategyName) {
      this.strategyParameters.set(strategyName, this.getDefaultParameters());
    } else {
      this.initializeDefaultParameters();
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `tune_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export tuning data for analysis
   */
  exportTuningData(): {
    sessions: TuningSession[];
    current_parameters: Record<string, TuningParameters>;
    tuning_rules: TuningRule[];
    statistics: any;
  } {
    return {
      sessions: this.tuningSessions,
      current_parameters: Object.fromEntries(this.strategyParameters),
      tuning_rules: this.tuningRules,
      statistics: this.getTuningStats()
    };
  }

  /**
   * Add custom tuning rule
   */
  addTuningRule(rule: TuningRule): void {
    this.tuningRules.push(rule);
  }

  /**
   * Remove tuning rule
   */
  removeTuningRule(description: string): boolean {
    const index = this.tuningRules.findIndex(r => r.description === description);
    if (index >= 0) {
      this.tuningRules.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Global instance will be created when integrated with other services
export let waidesKIStrategyTuner: WaidesKIStrategyTuner;