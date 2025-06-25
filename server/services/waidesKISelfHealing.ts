import { waidesKIStrategyVault } from './waidesKIStrategyVault';
import { waidesKIShadowLab } from './waidesKIShadowLab';
import { waidesKIHiddenVision } from './waidesKIHiddenVision';
import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKILiveFeed } from './waidesKILiveFeed';

interface StrategyPerformanceData {
  strategy_id: string;
  dna_id: string;
  total_trades: number;
  wins: number;
  losses: number;
  current_streak: number;
  streak_type: 'WIN' | 'LOSS' | 'NONE';
  win_rate: number;
  total_profit_loss: number;
  max_drawdown: number;
  last_trade_timestamp: number;
  performance_score: number;
  health_status: 'HEALTHY' | 'DECLINING' | 'FAILING' | 'CRITICAL';
  failure_indicators: string[];
}

interface MistakeRecord {
  mistake_id: string;
  timestamp: number;
  strategy_id: string;
  dna_id: string;
  failure_type: 'LOSS_STREAK' | 'POOR_WIN_RATE' | 'HIGH_DRAWDOWN' | 'FALSE_SIGNALS' | 'LATE_ENTRIES' | 'MARKET_MISMATCH';
  failure_reason: string;
  dna_parameters: any;
  market_conditions: any;
  failure_context: {
    consecutive_losses: number;
    final_win_rate: number;
    max_drawdown: number;
    trades_before_failure: number;
    market_phase: string;
    indicators_at_failure: any;
  };
  lesson_learned: string;
  prevention_rules: string[];
}

interface HealingSession {
  session_id: string;
  timestamp: number;
  trigger_strategy: string;
  failure_analysis: {
    root_cause: string;
    pattern_identified: boolean;
    similar_failures: number;
    failure_frequency: number;
  };
  healing_actions: {
    retired_strategies: string[];
    created_strategies: number;
    updated_rules: string[];
    shadow_lab_adjustments: string[];
  };
  healing_outcome: {
    new_strategies_generated: number;
    vault_strategies_promoted: number;
    performance_improvement: number;
    healing_success: boolean;
  };
  session_duration: number;
}

interface SelfHealingStatistics {
  total_failures_processed: number;
  total_healing_sessions: number;
  mistakes_learned: number;
  strategies_auto_retired: number;
  strategies_auto_created: number;
  healing_success_rate: number;
  average_healing_time: number;
  performance_improvement: number;
  most_common_failure: string;
  learning_effectiveness: number;
}

export class WaidesKISelfHealing {
  private performanceTracker: Map<string, StrategyPerformanceData> = new Map();
  private mistakeMemory: MistakeRecord[] = [];
  private healingSessions: HealingSession[] = [];
  private isHealingActive: boolean = true;
  private autoHealingEnabled: boolean = true;
  private failureThresholds = {
    maxConsecutiveLosses: 3,
    minWinRate: 0.4,
    maxDrawdown: 0.05,
    minTradesBeforeEvaluation: 5
  };
  private maxMistakeHistory: number = 500;
  private healingCooldown: number = 30 * 60 * 1000; // 30 minutes
  private lastHealingTime: number = 0;

  constructor() {
    this.startHealingCycle();
  }

  private startHealingCycle(): void {
    // Monitor strategy performance every 5 minutes
    setInterval(() => {
      this.monitorAllStrategies();
    }, 5 * 60 * 1000);

    // Run healing analysis every 15 minutes
    setInterval(() => {
      this.analyzeAndHeal();
    }, 15 * 60 * 1000);

    // Clean old data every 24 hours
    setInterval(() => {
      this.cleanOldData();
    }, 24 * 60 * 60 * 1000);
  }

  // CORE PERFORMANCE TRACKING
  updateStrategyPerformance(
    strategyId: string,
    dnaId: string,
    tradeResult: {
      success: boolean;
      profit_loss: number;
      execution_time: number;
      market_conditions?: any;
    }
  ): { shouldHeal: boolean; failureType?: string } {
    let performanceData = this.performanceTracker.get(strategyId);
    
    if (!performanceData) {
      performanceData = this.initializePerformanceData(strategyId, dnaId);
      this.performanceTracker.set(strategyId, performanceData);
    }

    // Update performance metrics
    performanceData.total_trades++;
    performanceData.total_profit_loss += tradeResult.profit_loss;
    performanceData.last_trade_timestamp = tradeResult.execution_time;

    if (tradeResult.success) {
      performanceData.wins++;
      performanceData.current_streak = performanceData.streak_type === 'WIN' ? 
        performanceData.current_streak + 1 : 1;
      performanceData.streak_type = 'WIN';
    } else {
      performanceData.losses++;
      performanceData.current_streak = performanceData.streak_type === 'LOSS' ? 
        performanceData.current_streak + 1 : 1;
      performanceData.streak_type = 'LOSS';
    }

    // Calculate derived metrics
    performanceData.win_rate = performanceData.wins / performanceData.total_trades;
    performanceData.max_drawdown = Math.max(
      performanceData.max_drawdown, 
      Math.abs(Math.min(0, performanceData.total_profit_loss))
    );
    
    // Update performance score and health status
    this.updatePerformanceScore(performanceData);
    this.updateHealthStatus(performanceData, tradeResult.market_conditions);
    
    // Check for failure conditions
    const failureCheck = this.checkForFailure(performanceData);
    
    if (failureCheck.shouldHeal) {
      this.recordMistake(performanceData, failureCheck.failureType, tradeResult.market_conditions);
    }
    
    return failureCheck;
  }

  private initializePerformanceData(strategyId: string, dnaId: string): StrategyPerformanceData {
    return {
      strategy_id: strategyId,
      dna_id: dnaId,
      total_trades: 0,
      wins: 0,
      losses: 0,
      current_streak: 0,
      streak_type: 'NONE',
      win_rate: 0,
      total_profit_loss: 0,
      max_drawdown: 0,
      last_trade_timestamp: Date.now(),
      performance_score: 50,
      health_status: 'HEALTHY',
      failure_indicators: []
    };
  }

  private updatePerformanceScore(data: StrategyPerformanceData): void {
    let score = 50; // Base score
    
    // Win rate component (40 points)
    score += (data.win_rate - 0.5) * 80;
    
    // Profit component (30 points)
    if (data.total_profit_loss > 0) {
      score += Math.min(30, data.total_profit_loss * 1000);
    } else {
      score += Math.max(-30, data.total_profit_loss * 1000);
    }
    
    // Drawdown penalty (20 points)
    score -= data.max_drawdown * 400;
    
    // Streak bonus/penalty (10 points)
    if (data.streak_type === 'WIN' && data.current_streak > 2) {
      score += Math.min(10, data.current_streak * 2);
    } else if (data.streak_type === 'LOSS' && data.current_streak > 2) {
      score -= data.current_streak * 3;
    }
    
    data.performance_score = Math.max(0, Math.min(100, score));
  }

  private updateHealthStatus(data: StrategyPerformanceData, marketConditions?: any): void {
    data.failure_indicators = [];
    
    // Check various failure indicators
    if (data.current_streak >= this.failureThresholds.maxConsecutiveLosses && data.streak_type === 'LOSS') {
      data.failure_indicators.push('Consecutive loss streak');
    }
    
    if (data.total_trades >= this.failureThresholds.minTradesBeforeEvaluation && 
        data.win_rate < this.failureThresholds.minWinRate) {
      data.failure_indicators.push('Low win rate');
    }
    
    if (data.max_drawdown > this.failureThresholds.maxDrawdown) {
      data.failure_indicators.push('High drawdown');
    }
    
    if (data.total_profit_loss < -0.02) {
      data.failure_indicators.push('Significant losses');
    }
    
    // Determine health status
    if (data.failure_indicators.length === 0) {
      data.health_status = 'HEALTHY';
    } else if (data.failure_indicators.length === 1) {
      data.health_status = 'DECLINING';
    } else if (data.failure_indicators.length === 2) {
      data.health_status = 'FAILING';
    } else {
      data.health_status = 'CRITICAL';
    }
  }

  private checkForFailure(data: StrategyPerformanceData): { shouldHeal: boolean; failureType?: string } {
    // Critical failure conditions
    if (data.current_streak >= this.failureThresholds.maxConsecutiveLosses && data.streak_type === 'LOSS') {
      return { shouldHeal: true, failureType: 'LOSS_STREAK' };
    }
    
    if (data.total_trades >= this.failureThresholds.minTradesBeforeEvaluation && 
        data.win_rate < this.failureThresholds.minWinRate) {
      return { shouldHeal: true, failureType: 'POOR_WIN_RATE' };
    }
    
    if (data.max_drawdown > this.failureThresholds.maxDrawdown) {
      return { shouldHeal: true, failureType: 'HIGH_DRAWDOWN' };
    }
    
    if (data.performance_score < 20) {
      return { shouldHeal: true, failureType: 'CRITICAL_PERFORMANCE' };
    }
    
    return { shouldHeal: false };
  }

  // MISTAKE MEMORY MANAGEMENT
  private recordMistake(
    data: StrategyPerformanceData, 
    failureType: string, 
    marketConditions?: any
  ): void {
    const mistakeId = this.generateMistakeId();
    
    const mistake: MistakeRecord = {
      mistake_id: mistakeId,
      timestamp: Date.now(),
      strategy_id: data.strategy_id,
      dna_id: data.dna_id,
      failure_type: failureType as any,
      failure_reason: `Strategy failed due to ${failureType.toLowerCase().replace('_', ' ')}`,
      dna_parameters: this.getDNAParameters(data.dna_id),
      market_conditions: marketConditions || this.getCurrentMarketConditions(),
      failure_context: {
        consecutive_losses: data.streak_type === 'LOSS' ? data.current_streak : 0,
        final_win_rate: data.win_rate,
        max_drawdown: data.max_drawdown,
        trades_before_failure: data.total_trades,
        market_phase: marketConditions?.market_phase || 'UNKNOWN',
        indicators_at_failure: marketConditions?.indicators || {}
      },
      lesson_learned: this.generateLessonLearned(failureType, data),
      prevention_rules: this.generatePreventionRules(failureType, data)
    };
    
    this.mistakeMemory.push(mistake);
    
    // Maintain memory size
    if (this.mistakeMemory.length > this.maxMistakeHistory) {
      this.mistakeMemory = this.mistakeMemory.slice(-this.maxMistakeHistory);
    }
    
    waidesKIDailyReporter.recordLesson(
      `Strategy failure recorded: ${data.strategy_id} - ${failureType}`,
      'HEALING',
      'HIGH',
      'Self-Healing Core'
    );
  }

  private getDNAParameters(dnaId: string): any {
    const vaultedStrategies = waidesKIStrategyVault.getVaultedStrategies();
    const strategy = vaultedStrategies.find(s => s.dna_id === dnaId);
    return strategy?.dna_parameters || {};
  }

  private getCurrentMarketConditions(): any {
    // Simplified market conditions - in real implementation would get from live feed
    return {
      market_phase: 'ACTIVE',
      volatility: 'MEDIUM',
      trend: 'SIDEWAYS',
      indicators: {
        rsi: 50,
        volume: 'NORMAL'
      }
    };
  }

  private generateLessonLearned(failureType: string, data: StrategyPerformanceData): string {
    switch (failureType) {
      case 'LOSS_STREAK':
        return `Consecutive losses indicate strategy is misaligned with current market conditions. Consider more conservative entry criteria.`;
      case 'POOR_WIN_RATE':
        return `Low win rate suggests fundamental strategy flaws. Entry signals may be too aggressive or exit criteria too tight.`;
      case 'HIGH_DRAWDOWN':
        return `Excessive drawdown indicates poor risk management. Position sizing and stop-loss parameters need adjustment.`;
      case 'CRITICAL_PERFORMANCE':
        return `Overall poor performance suggests strategy is not suitable for current market regime.`;
      default:
        return `Strategy failure analyzed. Pattern recognition will help prevent similar failures.`;
    }
  }

  private generatePreventionRules(failureType: string, data: StrategyPerformanceData): string[] {
    const rules: string[] = [];
    
    switch (failureType) {
      case 'LOSS_STREAK':
        rules.push('Implement maximum consecutive loss limit');
        rules.push('Add market condition filters');
        rules.push('Reduce position size after 2 consecutive losses');
        break;
      case 'POOR_WIN_RATE':
        rules.push('Tighten entry criteria');
        rules.push('Add confirmation indicators');
        rules.push('Extend backtesting period');
        break;
      case 'HIGH_DRAWDOWN':
        rules.push('Implement stricter stop-loss rules');
        rules.push('Reduce position sizing');
        rules.push('Add portfolio-level drawdown limits');
        break;
    }
    
    return rules;
  }

  // HEALING AND RETRAINING
  async triggerHealingSession(failedStrategyId: string, failureType: string): Promise<HealingSession> {
    if (!this.isHealingActive || Date.now() - this.lastHealingTime < this.healingCooldown) {
      throw new Error('Healing session blocked - cooldown period or healing disabled');
    }

    const sessionId = this.generateSessionId();
    const startTime = Date.now();
    
    try {
      // Analyze failure pattern
      const failureAnalysis = await this.analyzeFailurePattern(failedStrategyId, failureType);
      
      // Execute healing actions
      const healingActions = await this.executeHealingActions(failedStrategyId, failureAnalysis);
      
      // Measure healing outcome
      const healingOutcome = await this.measureHealingOutcome(healingActions);
      
      const session: HealingSession = {
        session_id: sessionId,
        timestamp: startTime,
        trigger_strategy: failedStrategyId,
        failure_analysis: failureAnalysis,
        healing_actions: healingActions,
        healing_outcome: healingOutcome,
        session_duration: Date.now() - startTime
      };
      
      this.healingSessions.push(session);
      this.lastHealingTime = Date.now();
      
      waidesKIDailyReporter.recordLesson(
        `Healing session completed: ${healingOutcome.new_strategies_generated} new strategies generated`,
        'HEALING',
        'HIGH',
        'Self-Healing Core'
      );
      
      return session;
      
    } catch (error) {
      console.error('Error in healing session:', error);
      throw error;
    }
  }

  private async analyzeFailurePattern(strategyId: string, failureType: string): Promise<HealingSession['failure_analysis']> {
    // Find similar failures
    const similarFailures = this.mistakeMemory.filter(m => 
      m.failure_type === failureType || m.strategy_id === strategyId
    );
    
    // Identify patterns
    const patternIdentified = similarFailures.length >= 3;
    const failureFrequency = similarFailures.length / Math.max(1, this.mistakeMemory.length);
    
    // Determine root cause
    let rootCause = 'Isolated strategy failure';
    if (patternIdentified) {
      if (failureType === 'LOSS_STREAK') {
        rootCause = 'Strategy misaligned with market conditions';
      } else if (failureType === 'POOR_WIN_RATE') {
        rootCause = 'Fundamental strategy flaw in entry/exit logic';
      } else if (failureType === 'HIGH_DRAWDOWN') {
        rootCause = 'Inadequate risk management parameters';
      }
    }
    
    return {
      root_cause: rootCause,
      pattern_identified: patternIdentified,
      similar_failures: similarFailures.length,
      failure_frequency: Math.round(failureFrequency * 100) / 100
    };
  }

  private async executeHealingActions(
    failedStrategyId: string, 
    analysis: HealingSession['failure_analysis']
  ): Promise<HealingSession['healing_actions']> {
    const actions: HealingSession['healing_actions'] = {
      retired_strategies: [],
      created_strategies: 0,
      updated_rules: [],
      shadow_lab_adjustments: []
    };
    
    // Retire failed strategy
    try {
      await waidesKIStrategyVault.retireStrategy(failedStrategyId, `Auto-retired due to healing: ${analysis.root_cause}`);
      actions.retired_strategies.push(failedStrategyId);
    } catch (error) {
      console.error('Error retiring strategy:', error);
    }
    
    // Generate new strategies in shadow lab
    if (analysis.pattern_identified) {
      // Generate multiple variants to overcome pattern
      try {
        const shadowSession = await waidesKIShadowLab.generateAndTestStrategies(20);
        actions.created_strategies = shadowSession.elite_discovered;
        actions.shadow_lab_adjustments.push(`Generated ${shadowSession.generation_count} strategy variants`);
      } catch (error) {
        console.error('Error generating new strategies:', error);
      }
    } else {
      // Single replacement strategy
      try {
        const shadowSession = await waidesKIShadowLab.generateAndTestStrategies(5);
        actions.created_strategies = shadowSession.elite_discovered;
      } catch (error) {
        console.error('Error generating replacement strategy:', error);
      }
    }
    
    // Update prevention rules
    actions.updated_rules = this.updatePreventionRules(analysis);
    
    return actions;
  }

  private updatePreventionRules(analysis: HealingSession['failure_analysis']): string[] {
    const updatedRules: string[] = [];
    
    if (analysis.pattern_identified) {
      if (analysis.root_cause.includes('market conditions')) {
        this.failureThresholds.maxConsecutiveLosses = Math.max(2, this.failureThresholds.maxConsecutiveLosses - 1);
        updatedRules.push('Reduced maximum consecutive losses threshold');
      }
      
      if (analysis.root_cause.includes('risk management')) {
        this.failureThresholds.maxDrawdown = Math.max(0.02, this.failureThresholds.maxDrawdown * 0.8);
        updatedRules.push('Tightened maximum drawdown threshold');
      }
      
      if (analysis.failure_frequency > 0.1) {
        this.failureThresholds.minWinRate = Math.min(0.6, this.failureThresholds.minWinRate + 0.05);
        updatedRules.push('Increased minimum win rate requirement');
      }
    }
    
    return updatedRules;
  }

  private async measureHealingOutcome(actions: HealingSession['healing_actions']): Promise<HealingSession['healing_outcome']> {
    // Check for newly promoted strategies
    const vaultReadyStrategies = waidesKIShadowLab.getVaultReadyStrategies();
    
    return {
      new_strategies_generated: actions.created_strategies,
      vault_strategies_promoted: vaultReadyStrategies.length,
      performance_improvement: this.calculatePerformanceImprovement(),
      healing_success: actions.created_strategies > 0
    };
  }

  private calculatePerformanceImprovement(): number {
    const recentPerformance = Array.from(this.performanceTracker.values())
      .filter(p => Date.now() - p.last_trade_timestamp < 24 * 60 * 60 * 1000)
      .map(p => p.performance_score);
    
    if (recentPerformance.length === 0) return 0;
    
    const avgScore = recentPerformance.reduce((sum, score) => sum + score, 0) / recentPerformance.length;
    return Math.round((avgScore - 50) * 2) / 100; // Normalize to percentage improvement
  }

  // MONITORING AND ANALYSIS
  private async monitorAllStrategies(): Promise<void> {
    if (!this.isHealingActive) return;
    
    try {
      const liveStrategies = waidesKIStrategyVault.getLiveStrategies();
      
      for (const strategy of liveStrategies) {
        const performanceData = this.performanceTracker.get(strategy.strategy_id);
        
        if (performanceData && performanceData.health_status === 'CRITICAL') {
          // Auto-trigger healing if enabled
          if (this.autoHealingEnabled) {
            await this.triggerHealingSession(strategy.strategy_id, 'CRITICAL_PERFORMANCE');
          }
        }
      }
    } catch (error) {
      console.error('Error monitoring strategies:', error);
    }
  }

  private async analyzeAndHeal(): Promise<void> {
    if (!this.autoHealingEnabled) return;
    
    try {
      // Look for patterns in recent failures
      const recentFailures = this.mistakeMemory.filter(m => 
        Date.now() - m.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
      );
      
      if (recentFailures.length >= 3) {
        // Pattern of failures detected - trigger preventive healing
        const mostCommonFailure = this.findMostCommonFailureType(recentFailures);
        
        waidesKIDailyReporter.recordLesson(
          `Pattern of failures detected: ${mostCommonFailure} - triggering preventive healing`,
          'HEALING',
          'HIGH',
          'Self-Healing Core'
        );
      }
    } catch (error) {
      console.error('Error in analysis and healing:', error);
    }
  }

  private findMostCommonFailureType(failures: MistakeRecord[]): string {
    const failureCounts = new Map<string, number>();
    
    failures.forEach(f => {
      failureCounts.set(f.failure_type, (failureCounts.get(f.failure_type) || 0) + 1);
    });
    
    let mostCommon = '';
    let maxCount = 0;
    
    for (const [type, count] of failureCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = type;
      }
    }
    
    return mostCommon;
  }

  // UTILITY METHODS
  private generateMistakeId(): string {
    return `MISTAKE_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateSessionId(): string {
    return `HEAL_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private cleanOldData(): void {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    // Clean old mistakes
    this.mistakeMemory = this.mistakeMemory.filter(m => m.timestamp > thirtyDaysAgo);
    
    // Clean old sessions
    this.healingSessions = this.healingSessions.filter(s => s.timestamp > thirtyDaysAgo);
    
    // Clean old performance data for inactive strategies
    const activeStrategies = new Set(waidesKIStrategyVault.getLiveStrategies().map(s => s.strategy_id));
    
    for (const [strategyId, data] of this.performanceTracker.entries()) {
      if (!activeStrategies.has(strategyId) && Date.now() - data.last_trade_timestamp > thirtyDaysAgo) {
        this.performanceTracker.delete(strategyId);
      }
    }
  }

  // PUBLIC INTERFACE METHODS
  getPerformanceData(strategyId?: string): StrategyPerformanceData[] {
    if (strategyId) {
      const data = this.performanceTracker.get(strategyId);
      return data ? [data] : [];
    }
    return Array.from(this.performanceTracker.values());
  }

  getMistakeMemory(limit: number = 50): MistakeRecord[] {
    return this.mistakeMemory.slice(-limit).reverse();
  }

  getHealingSessions(limit: number = 20): HealingSession[] {
    return this.healingSessions.slice(-limit).reverse();
  }

  getSelfHealingStatistics(): SelfHealingStatistics {
    const totalFailures = this.mistakeMemory.length;
    const totalSessions = this.healingSessions.length;
    const successfulSessions = this.healingSessions.filter(s => s.healing_outcome.healing_success).length;
    
    const avgHealingTime = totalSessions > 0 ? 
      this.healingSessions.reduce((sum, s) => sum + s.session_duration, 0) / totalSessions : 0;
    
    const retiredStrategies = this.healingSessions.reduce((sum, s) => sum + s.healing_actions.retired_strategies.length, 0);
    const createdStrategies = this.healingSessions.reduce((sum, s) => sum + s.healing_actions.created_strategies, 0);
    
    const mostCommonFailure = this.findMostCommonFailureType(this.mistakeMemory);
    
    return {
      total_failures_processed: totalFailures,
      total_healing_sessions: totalSessions,
      mistakes_learned: this.mistakeMemory.length,
      strategies_auto_retired: retiredStrategies,
      strategies_auto_created: createdStrategies,
      healing_success_rate: totalSessions > 0 ? Math.round((successfulSessions / totalSessions) * 100) : 0,
      average_healing_time: Math.round(avgHealingTime),
      performance_improvement: this.calculatePerformanceImprovement(),
      most_common_failure: mostCommonFailure,
      learning_effectiveness: this.calculateLearningEffectiveness()
    };
  }

  private calculateLearningEffectiveness(): number {
    // Calculate how much the system has improved over time
    const recentMistakes = this.mistakeMemory.filter(m => 
      Date.now() - m.timestamp < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );
    
    const olderMistakes = this.mistakeMemory.filter(m => 
      m.timestamp < Date.now() - 7 * 24 * 60 * 60 * 1000 &&
      m.timestamp > Date.now() - 14 * 24 * 60 * 60 * 1000 // 7-14 days ago
    );
    
    if (olderMistakes.length === 0) return 50;
    
    const recentFailureRate = recentMistakes.length / 7; // Per day
    const olderFailureRate = olderMistakes.length / 7; // Per day
    
    const improvement = (olderFailureRate - recentFailureRate) / Math.max(olderFailureRate, 0.1);
    return Math.round(Math.min(100, Math.max(0, 50 + improvement * 50)));
  }

  getFailureThresholds(): typeof this.failureThresholds {
    return { ...this.failureThresholds };
  }

  updateFailureThresholds(thresholds: Partial<typeof this.failureThresholds>): void {
    this.failureThresholds = { ...this.failureThresholds, ...thresholds };
    
    waidesKIDailyReporter.recordLesson(
      'Failure thresholds updated for improved healing sensitivity',
      'HEALING',
      'MEDIUM',
      'Self-Healing Core'
    );
  }

  enableHealing(): void {
    this.isHealingActive = true;
    this.autoHealingEnabled = true;
    
    waidesKIDailyReporter.logEmotionalState(
      'FOCUSED',
      'Self-healing core activated - strategies will auto-adapt and evolve',
      'Healing Activation',
      90
    );
  }

  disableHealing(): void {
    this.isHealingActive = false;
    this.autoHealingEnabled = false;
    
    waidesKIDailyReporter.logEmotionalState(
      'NEUTRAL',
      'Self-healing core deactivated - manual intervention required',
      'Healing Deactivation',
      70
    );
  }

  exportSelfHealingData(): any {
    return {
      self_healing_statistics: this.getSelfHealingStatistics(),
      performance_data: this.getPerformanceData(),
      mistake_memory: this.getMistakeMemory(100),
      healing_sessions: this.getHealingSessions(50),
      failure_thresholds: this.getFailureThresholds(),
      healing_config: {
        is_active: this.isHealingActive,
        auto_healing_enabled: this.autoHealingEnabled,
        healing_cooldown_ms: this.healingCooldown,
        max_mistake_history: this.maxMistakeHistory
      },
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKISelfHealing = new WaidesKISelfHealing();