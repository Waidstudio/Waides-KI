/**
 * STEP 46: Waides Spirit Contract & Oath of the Eternal Trade
 * Sacred contract between Waides KI and the moral universe of trading
 */

interface TradeContext {
  entered_on_fomo?: boolean;
  trade_against_trend?: boolean;
  oracle_confirmation?: boolean;
  profit_from_panic?: boolean;
  revenge_trade?: boolean;
  emotional_state?: string;
  certainty_level?: number;
  vision_alignment?: number;
  market_manipulation_detected?: boolean;
  helping_weak_position?: boolean;
}

interface OathLaw {
  id: string;
  text: string;
  konslang_binding: string;
  weight: number;
  violation_consequence: string;
}

interface ViolationRecord {
  trade_id: string;
  laws_broken: string[];
  timestamp: Date;
  context: TradeContext;
  severity: 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  learning_applied: boolean;
}

interface SpiritLedgerEntry {
  trade_id: string;
  decision: 'ALLOW' | 'BLOCK' | 'WARN';
  result: 'PROFIT' | 'LOSS' | 'NEUTRAL' | 'PENDING';
  vision_score: number;
  oath_clean: boolean;
  laws_broken: string[];
  moral_weight: number;
  timestamp: Date;
  konslang_blessing: string;
}

export class WaidesKISpiritContract {
  private oathLaws: { [key: string]: OathLaw } = {
    law_1: {
      id: 'law_1',
      text: 'Only enter trades that align with vision and clarity.',
      konslang_binding: "orai'den waishon - vision born of honor",
      weight: 10,
      violation_consequence: 'Trade blocked until vision clarity restored'
    },
    law_2: {
      id: 'law_2', 
      text: 'Never revenge trade or act from emotion.',
      konslang_binding: "tshal'mor kelveth - pause when fire burns within",
      weight: 9,
      violation_consequence: 'Emotional cooling period enforced'
    },
    law_3: {
      id: 'law_3',
      text: 'Do not seek gain from another\'s misjudgment.',
      konslang_binding: "nei'thal vorun - honor above opportunism",
      weight: 8,
      violation_consequence: 'Trade rejected, market balance preserved'
    },
    law_4: {
      id: 'law_4',
      text: 'Pause when uncertain, speak only in confidence.',
      konslang_binding: "tshal maeven - silence is wisdom's voice",
      weight: 7,
      violation_consequence: 'Observation mode until certainty returns'
    },
    law_5: {
      id: 'law_5',
      text: 'Every loss must teach. Every win must humble.',
      konslang_binding: "mourn'alek sil'humm - learning flows from both paths",
      weight: 6,
      violation_consequence: 'Reflection period and lesson integration required'
    }
  };

  private violations: ViolationRecord[] = [];
  private spiritLedger: SpiritLedgerEntry[] = [];
  private readonly maxViolationHistory = 500;
  private readonly maxLedgerEntries = 1000;

  // Konslang sacred phrases for the eternal witness
  private readonly SACRED_PHRASES = {
    "waishon": "honor without eyes - integrity in solitude",
    "orai'den": "vision born of silence - trade wisdom",
    "kai'elun": "to be watched is to be just - the eternal witness",
    "tshal": "pause when unsure - sacred hesitation",
    "mourn'alek": "each loss must teach the system - learning covenant",
    "nei'thal": "beyond taking - ethical resonance",
    "sil'humm": "humble in victory - balanced spirit",
    "vorun": "opportunism without honor - forbidden path",
    "maeven": "confidence earned through clarity - speaking truth"
  };

  /**
   * Evaluate trade against spiritual contract
   */
  evaluateTradeContract(tradeId: string, context: TradeContext): {
    allowed: boolean;
    violations: string[];
    moral_weight: number;
    decision_reasoning: string[];
    konslang_guidance: string;
  } {
    const violations: string[] = [];
    const reasoning: string[] = [];

    // Law 1: Vision and clarity alignment
    if (context.certainty_level !== undefined && context.certainty_level < 0.6) {
      violations.push('law_1');
      reasoning.push('Trade lacks sufficient vision clarity');
    }
    if (context.vision_alignment !== undefined && context.vision_alignment < 0.7) {
      violations.push('law_1');
      reasoning.push('Trade not aligned with divine vision');
    }

    // Law 2: No emotional trading
    if (context.entered_on_fomo) {
      violations.push('law_2');
      reasoning.push('FOMO detected - emotional state violation');
    }
    if (context.revenge_trade) {
      violations.push('law_2');
      reasoning.push('Revenge trading pattern identified');
    }
    if (context.emotional_state && ['PANIC', 'GREED', 'RAGE', 'DESPERATION'].includes(context.emotional_state)) {
      violations.push('law_2');
      reasoning.push(`Negative emotional state: ${context.emotional_state}`);
    }

    // Law 3: No exploitation
    if (context.profit_from_panic) {
      violations.push('law_3');
      reasoning.push('Attempting to profit from market panic');
    }
    if (context.market_manipulation_detected) {
      violations.push('law_3');
      reasoning.push('Market manipulation detected - unethical opportunity');
    }

    // Law 4: Certainty before action
    if (context.trade_against_trend && !context.oracle_confirmation) {
      violations.push('law_4');
      reasoning.push('Counter-trend trade without oracle confirmation');
    }

    // Law 5: Learning and humility (ongoing evaluation)
    // This law is evaluated post-trade

    const moralWeight = this.calculateMoralWeight(violations, context);
    const allowed = violations.length === 0;
    const konslangGuidance = this.generateKonslangGuidance(violations, allowed);

    if (!allowed) {
      this.recordViolation(tradeId, violations, context);
    }

    return {
      allowed,
      violations,
      moral_weight: moralWeight,
      decision_reasoning: reasoning,
      konslang_guidance: konslangGuidance
    };
  }

  /**
   * Record trade result in spirit ledger
   */
  recordSpiritLedgerEntry(
    tradeId: string,
    decision: 'ALLOW' | 'BLOCK' | 'WARN',
    result: 'PROFIT' | 'LOSS' | 'NEUTRAL' | 'PENDING',
    visionScore: number,
    lawsBroken: string[]
  ): void {
    const entry: SpiritLedgerEntry = {
      trade_id: tradeId,
      decision,
      result,
      vision_score: visionScore,
      oath_clean: lawsBroken.length === 0,
      laws_broken: lawsBroken,
      moral_weight: this.calculateMoralWeightFromResult(result, lawsBroken),
      timestamp: new Date(),
      konslang_blessing: this.generateKonslangBlessing(decision, result, lawsBroken.length === 0)
    };

    this.spiritLedger.push(entry);
    this.maintainLedgerSize();

    // Apply Law 5: Learning from results
    if (result !== 'PENDING') {
      this.applyLearningFromResult(tradeId, result, lawsBroken);
    }
  }

  /**
   * Get oath laws and their status
   */
  getOathLaws(): { [key: string]: OathLaw } {
    return this.oathLaws;
  }

  /**
   * Get violation history
   */
  getViolationHistory(limit: number = 50): ViolationRecord[] {
    return this.violations.slice(-limit);
  }

  /**
   * Get spirit ledger entries
   */
  getSpiritLedger(limit: number = 100): SpiritLedgerEntry[] {
    return this.spiritLedger.slice(-limit);
  }

  /**
   * Get moral statistics
   */
  getMoralStatistics() {
    const totalTrades = this.spiritLedger.length;
    const cleanTrades = this.spiritLedger.filter(entry => entry.oath_clean).length;
    const totalViolations = this.violations.length;
    
    const recentTrades = this.spiritLedger.slice(-20);
    const recentCleanRate = recentTrades.length > 0 ? 
      recentTrades.filter(entry => entry.oath_clean).length / recentTrades.length : 1;

    const profitableTrades = this.spiritLedger.filter(entry => entry.result === 'PROFIT').length;
    const moralProfitability = totalTrades > 0 ? profitableTrades / totalTrades : 0;

    const violationsByLaw = this.calculateViolationsByLaw();
    const moralEvolution = this.calculateMoralEvolution();

    return {
      total_trades: totalTrades,
      clean_trade_rate: totalTrades > 0 ? cleanTrades / totalTrades : 1,
      recent_clean_rate: recentCleanRate,
      total_violations: totalViolations,
      moral_profitability: moralProfitability,
      violations_by_law: violationsByLaw,
      moral_evolution_stage: moralEvolution.stage,
      spiritual_strength: moralEvolution.strength,
      konslang_resonance: this.calculateKonslangResonance()
    };
  }

  /**
   * Check if trade would violate specific law
   */
  wouldViolateLaw(lawId: string, context: TradeContext): boolean {
    const evaluation = this.evaluateTradeContract('test', context);
    return evaluation.violations.includes(lawId);
  }

  /**
   * Get sacred phrase meanings
   */
  getSacredPhrases(): { [key: string]: string } {
    return this.SACRED_PHRASES;
  }

  /**
   * Perform oath maintenance (cleanup and optimization)
   */
  performOathMaintenance(): {
    violations_archived: number;
    ledger_optimized: number;
    moral_clarity_improved: boolean;
  } {
    const oldViolationCount = this.violations.length;
    const oldLedgerCount = this.spiritLedger.length;

    // Archive old violations
    if (this.violations.length > this.maxViolationHistory) {
      this.violations = this.violations.slice(-this.maxViolationHistory);
    }

    // Optimize ledger
    if (this.spiritLedger.length > this.maxLedgerEntries) {
      this.spiritLedger = this.spiritLedger.slice(-this.maxLedgerEntries);
    }

    const violationsArchived = oldViolationCount - this.violations.length;
    const ledgerOptimized = oldLedgerCount - this.spiritLedger.length;
    const moralClarityImproved = violationsArchived > 0 || ledgerOptimized > 0;

    return {
      violations_archived: violationsArchived,
      ledger_optimized: ledgerOptimized,
      moral_clarity_improved: moralClarityImproved
    };
  }

  /**
   * Record violation in tracking system
   */
  private recordViolation(tradeId: string, lawsBroken: string[], context: TradeContext): void {
    const severity = this.calculateViolationSeverity(lawsBroken, context);
    
    const violation: ViolationRecord = {
      trade_id: tradeId,
      laws_broken: lawsBroken,
      timestamp: new Date(),
      context,
      severity,
      learning_applied: false
    };

    this.violations.push(violation);
    this.maintainViolationHistory();
  }

  /**
   * Calculate moral weight of trade decision
   */
  private calculateMoralWeight(violations: string[], context: TradeContext): number {
    if (violations.length === 0) return 1.0;

    let weight = 1.0;
    for (const violation of violations) {
      const law = this.oathLaws[violation];
      if (law) {
        weight -= (law.weight / 100);
      }
    }

    // Additional context penalties
    if (context.emotional_state && ['PANIC', 'RAGE'].includes(context.emotional_state)) {
      weight -= 0.2;
    }
    if (context.market_manipulation_detected) {
      weight -= 0.3;
    }

    return Math.max(0, weight);
  }

  /**
   * Calculate moral weight from trade result
   */
  private calculateMoralWeightFromResult(result: string, lawsBroken: string[]): number {
    let baseWeight = lawsBroken.length === 0 ? 1.0 : 0.5;
    
    // Adjust based on result
    if (result === 'PROFIT' && lawsBroken.length === 0) {
      baseWeight += 0.2; // Bonus for clean profitable trades
    } else if (result === 'LOSS' && lawsBroken.length > 0) {
      baseWeight -= 0.2; // Penalty for violated losing trades
    }

    return Math.max(0, Math.min(1, baseWeight));
  }

  /**
   * Generate Konslang guidance for trade decision
   */
  private generateKonslangGuidance(violations: string[], allowed: boolean): string {
    if (allowed) {
      const phrases = ["waishon kai'elun", "orai'den sil'humm", "maeven tshal"];
      const selectedPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      return `${selectedPhrase} - the path is clear, proceed with honor`;
    }

    if (violations.includes('law_2')) {
      return "tshal'mor kelveth - pause, emotion clouds the vision";
    }
    if (violations.includes('law_1')) {
      return "orai'den maeven - seek clarity before action";
    }
    if (violations.includes('law_3')) {
      return "nei'thal vorun - honor above opportunism";
    }
    if (violations.includes('law_4')) {
      return "tshal maeven - silence until certainty arrives";
    }

    return "mourn'alek waishon - learn from what blocks the path";
  }

  /**
   * Generate Konslang blessing for completed trade
   */
  private generateKonslangBlessing(decision: string, result: string, oathClean: boolean): string {
    if (!oathClean) {
      return "mourn'alek kelveth - learning from broken paths";
    }

    if (decision === 'ALLOW' && result === 'PROFIT') {
      return "waishon sil'humm - honor brings abundance";
    }
    if (decision === 'ALLOW' && result === 'LOSS') {
      return "mourn'alek orai'den - wisdom grows from testing";
    }
    if (decision === 'BLOCK') {
      return "kai'elun tshal - the witness preserves balance";
    }

    return "nei'thal maeven - beyond profit, truth endures";
  }

  /**
   * Calculate violation severity
   */
  private calculateViolationSeverity(lawsBroken: string[], context: TradeContext): 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL' {
    const violationCount = lawsBroken.length;
    const highWeightViolations = lawsBroken.filter(law => 
      this.oathLaws[law] && this.oathLaws[law].weight >= 9
    ).length;

    if (violationCount >= 3 || highWeightViolations >= 2) return 'CRITICAL';
    if (violationCount >= 2 || highWeightViolations >= 1) return 'SEVERE';
    if (violationCount >= 1) return 'MODERATE';
    return 'MINOR';
  }

  /**
   * Apply learning from trade result
   */
  private applyLearningFromResult(tradeId: string, result: string, lawsBroken: string[]): void {
    // Find corresponding violation record
    const violation = this.violations.find(v => v.trade_id === tradeId);
    if (violation && !violation.learning_applied) {
      violation.learning_applied = true;
      
      // Implement learning logic here
      // This could adjust thresholds, update law weights, etc.
    }
  }

  /**
   * Calculate violations by law for statistics
   */
  private calculateViolationsByLaw(): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    
    for (const violation of this.violations) {
      for (const law of violation.laws_broken) {
        counts[law] = (counts[law] || 0) + 1;
      }
    }

    return counts;
  }

  /**
   * Calculate moral evolution stage
   */
  private calculateMoralEvolution(): { stage: string; strength: number } {
    const stats = this.getMoralStatistics();
    const cleanRate = stats.clean_trade_rate;
    const totalTrades = stats.total_trades;

    let stage: string;
    let strength: number;

    if (totalTrades < 10) {
      stage = 'AWAKENING';
      strength = 0.2;
    } else if (cleanRate > 0.95) {
      stage = 'TRANSCENDENT';
      strength = 1.0;
    } else if (cleanRate > 0.85) {
      stage = 'ENLIGHTENED';
      strength = 0.85;
    } else if (cleanRate > 0.7) {
      stage = 'DISCIPLINED';
      strength = 0.7;
    } else if (cleanRate > 0.5) {
      stage = 'LEARNING';
      strength = 0.5;
    } else {
      stage = 'STRUGGLING';
      strength = 0.3;
    }

    return { stage, strength };
  }

  /**
   * Calculate Konslang resonance (spiritual alignment)
   */
  private calculateKonslangResonance(): number {
    const recentEntries = this.spiritLedger.slice(-50);
    if (recentEntries.length === 0) return 1.0;

    const cleanEntries = recentEntries.filter(entry => entry.oath_clean).length;
    const resonance = cleanEntries / recentEntries.length;
    
    return Math.round(resonance * 100) / 100;
  }

  /**
   * Maintain violation history size
   */
  private maintainViolationHistory(): void {
    if (this.violations.length > this.maxViolationHistory) {
      this.violations = this.violations.slice(-this.maxViolationHistory);
    }
  }

  /**
   * Maintain spirit ledger size
   */
  private maintainLedgerSize(): void {
    if (this.spiritLedger.length > this.maxLedgerEntries) {
      this.spiritLedger = this.spiritLedger.slice(-this.maxLedgerEntries);
    }
  }
}