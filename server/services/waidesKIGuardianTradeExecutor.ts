/**
 * STEP 58 — ETH Empath Network: Guardian Trade Executor
 * Execute trades based on Guardian Decision with safety protocols
 */

import { waidesKIMeshGuardianEngine } from './waidesKIMeshGuardianEngine.js';
import { waidesKIDualTokenExecutor } from './waidesKIDualTokenExecutor.js';
import { waidesKIEmotionalCore } from './waidesKIEmotionalCore.js';

interface GuardianTradeContext {
  symbol: string;
  action: 'BUY' | 'SELL';
  amount: number;
  setup: string;
  meta: any;
  indicators: any;
}

interface GuardianExecutionResult {
  status: 'executed' | 'skipped' | 'blocked' | 'error';
  trade_id?: string;
  reason: string;
  guardian_decision: any;
  execution_details?: any;
  safety_measures: string[];
  timestamp: number;
}

interface TradeRecord {
  trade_id: string;
  symbol: string;
  action: string;
  amount: number;
  timestamp: number;
  guardian_decision: any;
  execution_result: any;
  outcome?: 'pending' | 'win' | 'loss';
  profit_loss?: number;
}

export class WaidesKIGuardianTradeExecutor {
  private executionHistory: GuardianExecutionResult[] = [];
  private tradeRecords: TradeRecord[] = [];
  private lastTrade: TradeRecord | null = null;
  private maxHistorySize = 100;
  private isExecutionEnabled = true;
  private safetyLockUntil: number = 0;

  constructor() {
    console.log('🛡️⚡ Initializing Guardian Trade Executor...');
  }

  /**
   * Main execution method with guardian validation
   */
  async execute(context: GuardianTradeContext): Promise<GuardianExecutionResult> {
    try {
      const timestamp = Date.now();

      // Check safety lock
      if (this.safetyLockUntil > timestamp) {
        return this.createBlockedResult('SAFETY_LOCK_ACTIVE', null, timestamp);
      }

      // Check execution enabled
      if (!this.isExecutionEnabled) {
        return this.createBlockedResult('EXECUTION_DISABLED', null, timestamp);
      }

      // Get guardian decision
      const guardianContext = {
        setup: context.setup,
        symbol: context.symbol,
        amount: context.amount,
        meta: context.meta,
        indicators: context.indicators
      };

      const guardianDecision = await waidesKIMeshGuardianEngine.evaluate(guardianContext);

      // If guardian blocks trade
      if (!guardianDecision.ok) {
        const result = this.createBlockedResult('GUARDIAN_BLOCKED', guardianDecision, timestamp);
        this.addToHistory(result);
        return result;
      }

      // Check emotional state
      const emotionalState = await waidesKIEmotionalCore.getEmotionalState();
      if (emotionalState.emotion_state === 'frozen' || emotionalState.emotion_state === 'overheated') {
        const result = this.createBlockedResult('EMOTIONAL_PROTECTION', guardianDecision, timestamp);
        this.addToHistory(result);
        return result;
      }

      // Apply safety measures based on guardian confidence
      const safetyMeasures = this.calculateSafetyMeasures(guardianDecision, emotionalState);
      const adjustedAmount = this.applySafetyPositionSizing(context.amount, guardianDecision.confidence, safetyMeasures);

      // Execute the trade
      const executionResult = await this.executeWithSafety(context, adjustedAmount, safetyMeasures);

      // Create trade record
      const tradeRecord: TradeRecord = {
        trade_id: this.generateTradeId(),
        symbol: context.symbol,
        action: context.action,
        amount: adjustedAmount,
        timestamp,
        guardian_decision: guardianDecision,
        execution_result: executionResult,
        outcome: 'pending'
      };

      this.tradeRecords.unshift(tradeRecord);
      this.lastTrade = tradeRecord;

      // Trim trade records
      if (this.tradeRecords.length > this.maxHistorySize) {
        this.tradeRecords = this.tradeRecords.slice(0, this.maxHistorySize);
      }

      const result: GuardianExecutionResult = {
        status: executionResult.success ? 'executed' : 'error',
        trade_id: tradeRecord.trade_id,
        reason: executionResult.success ? 'Guardian approved execution completed' : executionResult.error || 'Execution failed',
        guardian_decision: guardianDecision,
        execution_details: executionResult,
        safety_measures: safetyMeasures,
        timestamp
      };

      this.addToHistory(result);

      if (executionResult.success) {
        console.log(`🛡️⚡✅ Guardian executed trade: ${context.symbol} ${context.action} ${adjustedAmount} (${Math.round(guardianDecision.confidence * 100)}% confidence)`);
      } else {
        console.log(`🛡️⚡❌ Guardian execution failed: ${context.symbol} - ${result.reason}`);
      }

      return result;

    } catch (error) {
      console.error('❌ Error in Guardian execution:', error);
      
      const result: GuardianExecutionResult = {
        status: 'error',
        reason: `Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        guardian_decision: null,
        safety_measures: ['ERROR_PROTECTION'],
        timestamp: Date.now()
      };

      this.addToHistory(result);
      return result;
    }
  }

  /**
   * Create blocked result
   */
  private createBlockedResult(reason: string, guardianDecision: any, timestamp: number): GuardianExecutionResult {
    const reasonMessages = {
      'SAFETY_LOCK_ACTIVE': 'Safety lock active - trading temporarily suspended',
      'EXECUTION_DISABLED': 'Trade execution disabled by administrator',
      'GUARDIAN_BLOCKED': `Guardian protection: ${guardianDecision?.guardian_protection?.join(', ') || 'Multiple safeguards triggered'}`,
      'EMOTIONAL_PROTECTION': 'Emotional protection active - emotional state unsafe for trading'
    };

    return {
      status: 'blocked',
      reason: reasonMessages[reason as keyof typeof reasonMessages] || reason,
      guardian_decision: guardianDecision,
      safety_measures: [reason],
      timestamp
    };
  }

  /**
   * Calculate safety measures based on guardian decision
   */
  private calculateSafetyMeasures(guardianDecision: any, emotionalState: any): string[] {
    const measures: string[] = [];

    if (guardianDecision.confidence < 0.8) {
      measures.push('REDUCED_POSITION_SIZE');
    }

    if (guardianDecision.safety_score < 0.7) {
      measures.push('ENHANCED_MONITORING');
    }

    if (emotionalState.temperature > 30) {
      measures.push('EMOTIONAL_COOLING');
    }

    if (guardianDecision.mesh_harmony?.network_harmony < 0.7) {
      measures.push('MESH_PROTECTION');
    }

    if (measures.length === 0) {
      measures.push('STANDARD_EXECUTION');
    }

    return measures;
  }

  /**
   * Apply safety position sizing
   */
  private applySafetyPositionSizing(originalAmount: number, confidence: number, safetyMeasures: string[]): number {
    let multiplier = 1.0;

    // Confidence-based adjustment
    if (confidence < 0.8) multiplier *= 0.7;
    if (confidence < 0.7) multiplier *= 0.5;

    // Safety measure adjustments
    if (safetyMeasures.includes('REDUCED_POSITION_SIZE')) multiplier *= 0.6;
    if (safetyMeasures.includes('EMOTIONAL_COOLING')) multiplier *= 0.8;
    if (safetyMeasures.includes('MESH_PROTECTION')) multiplier *= 0.7;

    return Math.max(originalAmount * multiplier, originalAmount * 0.1); // Minimum 10% of original
  }

  /**
   * Execute trade with safety protocols
   */
  private async executeWithSafety(context: GuardianTradeContext, amount: number, safetyMeasures: string[]): Promise<any> {
    try {
      // For this implementation, we'll create a simulated execution
      // In production, this would interface with actual exchange APIs
      
      const simulatedResult = {
        success: true,
        trade_id: this.generateTradeId(),
        symbol: context.symbol,
        action: context.action,
        amount: amount,
        price: 2480.50, // Simulated ETH price
        fee: amount * 0.001, // 0.1% fee
        timestamp: Date.now(),
        safety_measures: safetyMeasures
      };

      // Apply safety delay for enhanced monitoring
      if (safetyMeasures.includes('ENHANCED_MONITORING')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return simulatedResult;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown execution error'
      };
    }
  }

  /**
   * Generate unique trade ID
   */
  private generateTradeId(): string {
    return `GT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add result to execution history
   */
  private addToHistory(result: GuardianExecutionResult): void {
    this.executionHistory.unshift(result);
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Record trade outcome for feedback
   */
  recordTradeOutcome(tradeId: string, outcome: 'win' | 'loss', profitLoss: number): void {
    const trade = this.tradeRecords.find(t => t.trade_id === tradeId);
    if (trade) {
      trade.outcome = outcome;
      trade.profit_loss = profitLoss;
      
      console.log(`🛡️📊 Trade outcome recorded: ${tradeId} - ${outcome} (${profitLoss > 0 ? '+' : ''}${profitLoss})`);
    }
  }

  /**
   * Get execution statistics
   */
  getExecutionStatistics(): {
    total_executions: number;
    execution_rate: number;
    success_rate: number;
    average_guardian_confidence: number;
    safety_measure_frequency: { [key: string]: number };
    trade_outcomes: {
      total_trades: number;
      wins: number;
      losses: number;
      pending: number;
      win_rate: number;
      total_pnl: number;
    };
    recent_executions: GuardianExecutionResult[];
  } {
    const totalAttempts = this.executionHistory.length;
    const executed = this.executionHistory.filter(r => r.status === 'executed').length;
    const successful = this.executionHistory.filter(r => r.status === 'executed' && r.execution_details?.success).length;

    const execution_rate = totalAttempts > 0 ? executed / totalAttempts : 0;
    const success_rate = executed > 0 ? successful / executed : 0;

    const avgConfidence = this.executionHistory
      .filter(r => r.guardian_decision?.confidence)
      .reduce((sum, r) => sum + r.guardian_decision.confidence, 0) / 
      Math.max(1, this.executionHistory.filter(r => r.guardian_decision?.confidence).length);

    const safety_measure_frequency: { [key: string]: number } = {};
    this.executionHistory.forEach(result => {
      result.safety_measures.forEach(measure => {
        safety_measure_frequency[measure] = (safety_measure_frequency[measure] || 0) + 1;
      });
    });

    // Trade outcome analysis
    const completedTrades = this.tradeRecords.filter(t => t.outcome !== 'pending');
    const wins = completedTrades.filter(t => t.outcome === 'win').length;
    const losses = completedTrades.filter(t => t.outcome === 'loss').length;
    const pending = this.tradeRecords.filter(t => t.outcome === 'pending').length;
    const win_rate = completedTrades.length > 0 ? wins / completedTrades.length : 0;
    const total_pnl = completedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);

    return {
      total_executions: totalAttempts,
      execution_rate,
      success_rate,
      average_guardian_confidence: avgConfidence,
      safety_measure_frequency,
      trade_outcomes: {
        total_trades: this.tradeRecords.length,
        wins,
        losses,
        pending,
        win_rate,
        total_pnl
      },
      recent_executions: this.executionHistory.slice(0, 10)
    };
  }

  /**
   * Enable/disable execution
   */
  setExecutionEnabled(enabled: boolean): void {
    this.isExecutionEnabled = enabled;
    console.log(`🛡️⚡ Guardian execution ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Activate safety lock
   */
  activateSafetyLock(durationMs: number): void {
    this.safetyLockUntil = Date.now() + durationMs;
    console.log(`🛡️🔒 Safety lock activated for ${Math.round(durationMs / 1000)} seconds`);
  }

  /**
   * Get last trade
   */
  getLastTrade(): TradeRecord | null {
    return this.lastTrade;
  }

  /**
   * Get all trade records
   */
  getTradeRecords(): TradeRecord[] {
    return [...this.tradeRecords];
  }

  /**
   * Get execution health status
   */
  getExecutionHealth(): {
    status: 'healthy' | 'degraded' | 'critical';
    execution_enabled: boolean;
    safety_lock_active: boolean;
    recent_success_rate: number;
    guardian_trust_level: string;
  } {
    const recentExecutions = this.executionHistory.slice(0, 10);
    const recentSuccessful = recentExecutions.filter(r => r.status === 'executed' && r.execution_details?.success).length;
    const recent_success_rate = recentExecutions.length > 0 ? recentSuccessful / recentExecutions.length : 0;

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (recent_success_rate < 0.3) status = 'critical';
    else if (recent_success_rate < 0.7) status = 'degraded';

    const guardian_trust_level = recent_success_rate > 0.8 ? 'high' : recent_success_rate > 0.5 ? 'moderate' : 'low';

    return {
      status,
      execution_enabled: this.isExecutionEnabled,
      safety_lock_active: this.safetyLockUntil > Date.now(),
      recent_success_rate,
      guardian_trust_level
    };
  }
}

export const waidesKIGuardianTradeExecutor = new WaidesKIGuardianTradeExecutor();