/**
 * STEP 36: Waides KI Spiritual Recall + Broken Strategy Rewriter
 * 
 * This system detects when strategies have failed (3+ failed trades) and sends them
 * for spiritual recall, rewriting their DNA using ancient Konslang patterns from the dream tree.
 */

export interface FailedStrategy {
  strategy_id: string;
  failure_count: number;
  last_failure: Date;
  original_dna: any;
  failure_reasons: string[];
}

export interface RewrittenStrategy {
  strategy_id: string;
  original_dna: any;
  rewritten_dna: any;
  symbolic_patch: string;
  recall_reason: string;
  rewrite_timestamp: Date;
  konslang_wisdom: string;
}

export interface RecallStats {
  total_recalls: number;
  total_rewrites: number;
  active_failures: number;
  spiritual_protection_rate: number;
  konslang_patterns_used: string[];
  most_common_failure: string;
  recall_success_rate: number;
}

export class WaidesKISpiritualRecall {
  private failureTracker: Map<string, FailedStrategy> = new Map();
  private rewriteHistory: Map<string, RewrittenStrategy> = new Map();
  private konslangSymbols: string[] = ["NA'VEL", "ZUNTH", "AL'MIR", "TALOR", "SHAI", "KORVEX", "THALAR", "ZEPHYR"];
  private recallThreshold: number = 3;
  private totalRecalls: number = 0;
  private totalRewrites: number = 0;

  constructor() {
    console.log('🔄 Waides KI Spiritual Recall System Initialized');
    this.startRecallMonitoring();
  }

  /**
   * Record a strategy result for failure tracking
   */
  recordStrategyResult(strategyId: string, success: boolean, reason?: string): void {
    if (!this.failureTracker.has(strategyId)) {
      this.failureTracker.set(strategyId, {
        strategy_id: strategyId,
        failure_count: 0,
        last_failure: new Date(),
        original_dna: null,
        failure_reasons: []
      });
    }

    const strategy = this.failureTracker.get(strategyId)!;

    if (success) {
      // Reset failure count on success
      strategy.failure_count = 0;
      strategy.failure_reasons = [];
    } else {
      // Increment failure count and record reason
      strategy.failure_count++;
      strategy.last_failure = new Date();
      if (reason) {
        strategy.failure_reasons.push(reason);
      }

      console.log(`⚠️ Strategy ${strategyId} failed: ${strategy.failure_count}/${this.recallThreshold} failures`);

      // Trigger recall if threshold reached
      if (strategy.failure_count >= this.recallThreshold) {
        this.triggerSpiritualRecall(strategyId);
      }
    }
  }

  /**
   * Trigger spiritual recall for a failing strategy
   */
  private triggerSpiritualRecall(strategyId: string): void {
    const failedStrategy = this.failureTracker.get(strategyId);
    if (!failedStrategy) return;

    console.log(`🔮 SPIRITUAL RECALL TRIGGERED for strategy ${strategyId}`);
    
    // Generate Konslang wisdom for this failure
    const konslangWisdom = this.generateKonslangWisdom(failedStrategy.failure_reasons);
    
    // Rewrite the strategy using symbolic patterns
    const rewrittenStrategy = this.rewriteStrategyDNA(failedStrategy, konslangWisdom);
    
    // Store the rewrite
    this.rewriteHistory.set(strategyId, rewrittenStrategy);
    
    // Reset failure tracker
    this.failureTracker.delete(strategyId);
    
    this.totalRecalls++;
    this.totalRewrites++;
    
    console.log(`✨ Strategy ${strategyId} REWRITTEN with Konslang pattern: ${rewrittenStrategy.symbolic_patch}`);
  }

  /**
   * Rewrite strategy DNA using Konslang symbolic insight
   */
  private rewriteStrategyDNA(failedStrategy: FailedStrategy, konslangWisdom: string): RewrittenStrategy {
    const selectedSymbol = this.konslangSymbols[Math.floor(Math.random() * this.konslangSymbols.length)];
    
    // Create symbolic modifications based on failure patterns
    const rewrittenDNA = this.applySymbolicPatches(failedStrategy, selectedSymbol);
    
    return {
      strategy_id: failedStrategy.strategy_id,
      original_dna: failedStrategy.original_dna,
      rewritten_dna: rewrittenDNA,
      symbolic_patch: selectedSymbol,
      recall_reason: `${failedStrategy.failure_count} consecutive failures: ${failedStrategy.failure_reasons.join(', ')}`,
      rewrite_timestamp: new Date(),
      konslang_wisdom: konslangWisdom
    };
  }

  /**
   * Apply symbolic patches using Konslang patterns
   */
  private applySymbolicPatches(failedStrategy: FailedStrategy, symbol: string): any {
    const baseDNA = {
      id: failedStrategy.strategy_id + '_RECALLED',
      type: 'SPIRITUALLY_REWRITTEN',
      symbolic_patch: symbol,
      parameters: {
        entry_threshold: 0.7,
        exit_threshold: 0.3,
        risk_multiplier: 0.5,
        confidence_minimum: 0.6
      },
      konslang_enhancement: true,
      spiritual_protection: true,
      rewrite_generation: (this.rewriteHistory.size + 1)
    };

    // Apply symbol-specific modifications
    switch (symbol) {
      case "NA'VEL": // Stability and grounding
        baseDNA.parameters.risk_multiplier *= 0.8;
        baseDNA.parameters.confidence_minimum += 0.1;
        break;
      case "ZUNTH": // Aggressive growth
        baseDNA.parameters.entry_threshold *= 0.9;
        baseDNA.parameters.exit_threshold *= 1.1;
        break;
      case "AL'MIR": // Wisdom and patience
        baseDNA.parameters.entry_threshold += 0.1;
        baseDNA.parameters.confidence_minimum += 0.15;
        break;
      case "TALOR": // Quick adaptation
        baseDNA.parameters.exit_threshold *= 0.8;
        baseDNA.parameters.risk_multiplier *= 1.1;
        break;
      case "SHAI": // Protective barriers
        baseDNA.parameters.risk_multiplier *= 0.6;
        baseDNA.parameters.entry_threshold += 0.05;
        break;
      default:
        // Random beneficial modification
        baseDNA.parameters.entry_threshold *= (0.95 + Math.random() * 0.1);
        baseDNA.parameters.exit_threshold *= (0.95 + Math.random() * 0.1);
    }

    return baseDNA;
  }

  /**
   * Generate Konslang wisdom based on failure patterns
   */
  private generateKonslangWisdom(failureReasons: string[]): string {
    const wisdomTemplates = [
      "The path of {symbol} teaches patience in the storm of loss",
      "Through {symbol}, we learn that failure is but a teacher in disguise",
      "The ancient {symbol} pattern reveals hidden strength in repeated trials",
      "By {symbol}'s guidance, what was broken shall be made stronger",
      "The sacred {symbol} transforms defeat into divine opportunity"
    ];

    const selectedSymbol = this.konslangSymbols[Math.floor(Math.random() * this.konslangSymbols.length)];
    const template = wisdomTemplates[Math.floor(Math.random() * wisdomTemplates.length)];
    
    return template.replace('{symbol}', selectedSymbol);
  }

  /**
   * Get comprehensive recall statistics
   */
  getRecallStats(): RecallStats {
    const failureReasons = Array.from(this.failureTracker.values())
      .flatMap(s => s.failure_reasons);
    
    const reasonCounts = failureReasons.reduce((acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonFailure = Object.keys(reasonCounts).reduce((a, b) => 
      reasonCounts[a] > reasonCounts[b] ? a : b, 'No failures recorded'
    );

    const usedPatterns = Array.from(this.rewriteHistory.values())
      .map(r => r.symbolic_patch);

    return {
      total_recalls: this.totalRecalls,
      total_rewrites: this.totalRewrites,
      active_failures: this.failureTracker.size,
      spiritual_protection_rate: this.totalRecalls > 0 ? (this.totalRewrites / this.totalRecalls) * 100 : 0,
      konslang_patterns_used: [...new Set(usedPatterns)],
      most_common_failure: mostCommonFailure,
      recall_success_rate: this.totalRewrites > 0 ? ((this.totalRewrites - this.failureTracker.size) / this.totalRewrites) * 100 : 0
    };
  }

  /**
   * Get all failed strategies awaiting recall
   */
  getFailedStrategies(): FailedStrategy[] {
    return Array.from(this.failureTracker.values());
  }

  /**
   * Get rewrite history
   */
  getRewriteHistory(limit: number = 50): RewrittenStrategy[] {
    return Array.from(this.rewriteHistory.values())
      .sort((a, b) => b.rewrite_timestamp.getTime() - a.rewrite_timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Manually recall a strategy
   */
  manualRecall(strategyId: string, reason: string = 'Manual recall'): boolean {
    if (!this.failureTracker.has(strategyId)) {
      // Create a failure entry for manual recall
      this.failureTracker.set(strategyId, {
        strategy_id: strategyId,
        failure_count: this.recallThreshold,
        last_failure: new Date(),
        original_dna: null,
        failure_reasons: [reason]
      });
    }

    this.triggerSpiritualRecall(strategyId);
    return true;
  }

  /**
   * Clear all recall data
   */
  clearRecallData(): void {
    this.failureTracker.clear();
    this.rewriteHistory.clear();
    this.totalRecalls = 0;
    this.totalRewrites = 0;
    console.log('🧹 Spiritual recall data cleared');
  }

  /**
   * Start background monitoring for automatic recalls
   */
  private startRecallMonitoring(): void {
    setInterval(() => {
      const activeFailures = this.failureTracker.size;
      if (activeFailures > 0) {
        console.log(`🔍 Monitoring ${activeFailures} strategies for spiritual recall`);
      }
    }, 60000); // Check every minute
  }

  /**
   * Get strategy by ID for external systems
   */
  getRewrittenStrategy(strategyId: string): RewrittenStrategy | null {
    return this.rewriteHistory.get(strategyId) || null;
  }

  /**
   * Check if strategy is under spiritual protection
   */
  isUnderSpiritualProtection(strategyId: string): boolean {
    return this.rewriteHistory.has(strategyId);
  }
}

// Export singleton instance
export const waidesKISpiritualRecall = new WaidesKISpiritualRecall();