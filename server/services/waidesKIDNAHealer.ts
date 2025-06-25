import { waidesKIDNAEngine } from './waidesKIDNAEngine';
import { waidesKIRootMemory } from './waidesKIRootMemory';
import { waidesKISignatureTracker } from './waidesKISignatureTracker';
import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKIGenomeEngine } from './waidesKIGenomeEngine';

interface DNAScore {
  dna_id: string;
  total_score: number;
  win_count: number;
  loss_count: number;
  total_trades: number;
  win_rate: number;
  avg_profit_loss: number;
  last_used: number;
  first_seen: number;
  purification_count: number;
  is_toxic: boolean;
  performance_trend: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'UNKNOWN';
  strategy_category: string;
  confidence_avg: number;
}

interface PurificationRecord {
  purification_id: string;
  timestamp: number;
  original_dna: string;
  purified_dna: string;
  purification_reason: string;
  original_score: number;
  mutation_type: 'THRESHOLD_ADJUSTMENT' | 'INDICATOR_SWAP' | 'LOGIC_INVERSION' | 'HYBRID_CREATION' | 'COMPLETE_REBUILD';
  mutation_details: string[];
  healing_strategy: string;
  expected_improvement: string[];
}

interface DNAEvolution {
  evolution_id: string;
  timestamp: number;
  parent_dna: string;
  evolved_dna: string;
  evolution_trigger: 'POOR_PERFORMANCE' | 'MUTATION_OPPORTUNITY' | 'HYBRID_EXPERIMENT' | 'GENETIC_HEALING';
  evolution_method: string;
  performance_delta: number;
  generation_number: number;
  survival_probability: number;
}

interface HealingSession {
  session_id: string;
  timestamp: number;
  dnas_evaluated: number;
  dnas_purified: number;
  dnas_evolved: number;
  dnas_eliminated: number;
  healing_insights: string[];
  overall_improvement: number;
  session_duration_ms: number;
}

export class WaidesKIDNAHealer {
  private dnaScores: Map<string, DNAScore> = new Map();
  private purificationRecords: PurificationRecord[] = [];
  private evolutionHistory: DNAEvolution[] = [];
  private healingSessions: HealingSession[] = [];
  private isHealingActive: boolean = true;
  private purificationThreshold: number = -3;
  private toxicThreshold: number = -5;
  private maxDNAAge: number = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    this.startHealingCycle();
  }

  private startHealingCycle(): void {
    // Run full healing session every 4 hours
    setInterval(() => {
      this.runFullHealingSession();
    }, 4 * 60 * 60 * 1000);

    // Quick purification check every 30 minutes
    setInterval(() => {
      this.quickPurificationCheck();
    }, 30 * 60 * 1000);
  }

  // CORE DNA EVALUATION
  evaluateDNA(
    dnaId: string,
    result: 'WIN' | 'LOSS' | 'NEUTRAL',
    profitLoss: number,
    confidence: number,
    marketConditions: any,
    strategyCategory: string = 'UNKNOWN'
  ): { status: string; action: string; score: number; recommendation?: string } {
    if (!this.isHealingActive) {
      return { status: 'HEALING_DISABLED', action: 'NONE', score: 0 };
    }

    // Get or create DNA score record
    let dnaScore = this.dnaScores.get(dnaId);
    if (!dnaScore) {
      dnaScore = this.createNewDNAScore(dnaId, strategyCategory);
      this.dnaScores.set(dnaId, dnaScore);
    }

    // Update score based on result
    this.updateDNAScore(dnaScore, result, profitLoss, confidence);

    // Check if purification is needed
    if (dnaScore.total_score <= this.purificationThreshold && !dnaScore.is_toxic) {
      return this.initiatePurification(dnaScore);
    }

    // Check if DNA has become toxic
    if (dnaScore.total_score <= this.toxicThreshold) {
      return this.markAsToxicAndEliminate(dnaScore);
    }

    // Check for evolution opportunity
    if (this.shouldEvolve(dnaScore)) {
      return this.initiateEvolution(dnaScore);
    }

    return {
      status: 'EVALUATED',
      action: 'KEPT',
      score: dnaScore.total_score,
      recommendation: this.generateRecommendation(dnaScore)
    };
  }

  private createNewDNAScore(dnaId: string, strategyCategory: string): DNAScore {
    const now = Date.now();
    return {
      dna_id: dnaId,
      total_score: 0,
      win_count: 0,
      loss_count: 0,
      total_trades: 0,
      win_rate: 0,
      avg_profit_loss: 0,
      last_used: now,
      first_seen: now,
      purification_count: 0,
      is_toxic: false,
      performance_trend: 'UNKNOWN',
      strategy_category: strategyCategory,
      confidence_avg: 0
    };
  }

  private updateDNAScore(dnaScore: DNAScore, result: 'WIN' | 'LOSS' | 'NEUTRAL', profitLoss: number, confidence: number): void {
    const now = Date.now();
    
    // Update basic counts
    dnaScore.total_trades++;
    dnaScore.last_used = now;
    
    if (result === 'WIN') {
      dnaScore.win_count++;
      dnaScore.total_score += 1;
    } else if (result === 'LOSS') {
      dnaScore.loss_count++;
      dnaScore.total_score -= 1;
    }
    // NEUTRAL doesn't affect score
    
    // Update calculated metrics
    dnaScore.win_rate = dnaScore.total_trades > 0 ? (dnaScore.win_count / dnaScore.total_trades) * 100 : 0;
    
    // Update average profit/loss
    const totalPnL = (dnaScore.avg_profit_loss * (dnaScore.total_trades - 1)) + profitLoss;
    dnaScore.avg_profit_loss = totalPnL / dnaScore.total_trades;
    
    // Update average confidence
    const totalConfidence = (dnaScore.confidence_avg * (dnaScore.total_trades - 1)) + confidence;
    dnaScore.confidence_avg = totalConfidence / dnaScore.total_trades;
    
    // Update performance trend
    dnaScore.performance_trend = this.calculatePerformanceTrend(dnaScore);
  }

  private calculatePerformanceTrend(dnaScore: DNAScore): 'IMPROVING' | 'DECLINING' | 'STABLE' | 'UNKNOWN' {
    if (dnaScore.total_trades < 5) return 'UNKNOWN';
    
    const recentWinRate = dnaScore.win_rate;
    const recentScore = dnaScore.total_score;
    
    if (recentWinRate > 60 && recentScore > 0) return 'IMPROVING';
    if (recentWinRate < 40 && recentScore < -2) return 'DECLINING';
    if (recentWinRate >= 45 && recentWinRate <= 55) return 'STABLE';
    
    return 'UNKNOWN';
  }

  private initiatePurification(dnaScore: DNAScore): { status: string; action: string; score: number; recommendation?: string } {
    try {
      const purificationResult = this.purifyDNA(dnaScore);
      
      waidesKIDailyReporter.recordLesson(
        `DNA ${dnaScore.dna_id} purified due to poor performance (score: ${dnaScore.total_score})`,
        'HEALING',
        'HIGH',
        'DNA Healer'
      );
      
      return {
        status: 'PURIFIED',
        action: 'DNA_PURIFIED',
        score: dnaScore.total_score,
        recommendation: `Original DNA purified. New DNA: ${purificationResult.purified_dna}`
      };
    } catch (error) {
      console.error('Error during DNA purification:', error);
      return {
        status: 'PURIFICATION_FAILED',
        action: 'KEPT',
        score: dnaScore.total_score,
        recommendation: 'Purification failed - monitoring for manual intervention'
      };
    }
  }

  private purifyDNA(dnaScore: DNAScore): PurificationRecord {
    const purificationId = this.generatePurificationId();
    const originalDNA = dnaScore.dna_id;
    
    // Determine purification strategy based on failure pattern
    const mutationType = this.determineMutationType(dnaScore);
    const purifiedDNA = this.mutateDNA(originalDNA, mutationType);
    
    const purificationRecord: PurificationRecord = {
      purification_id: purificationId,
      timestamp: Date.now(),
      original_dna: originalDNA,
      purified_dna: purifiedDNA,
      purification_reason: this.generatePurificationReason(dnaScore),
      original_score: dnaScore.total_score,
      mutation_type: mutationType,
      mutation_details: this.generateMutationDetails(originalDNA, purifiedDNA, mutationType),
      healing_strategy: this.generateHealingStrategy(dnaScore),
      expected_improvement: this.generateExpectedImprovements(mutationType)
    };
    
    this.purificationRecords.push(purificationRecord);
    
    // Update original DNA to mark as purified
    dnaScore.purification_count++;
    dnaScore.is_toxic = true; // Mark original as toxic to prevent reuse
    
    // Register new DNA with clean slate
    const newDNAScore = this.createNewDNAScore(purifiedDNA, dnaScore.strategy_category);
    this.dnaScores.set(purifiedDNA, newDNAScore);
    
    // Update memory systems
    waidesKIRootMemory.forgetDNA(originalDNA);
    waidesKIRootMemory.registerStrategy(
      `PURIFIED_${purificationId}`,
      purifiedDNA,
      'WIN', // Start with positive expectation
      0, // Initial profit
      70, // Moderate confidence
      {
        purification_source: originalDNA,
        healing_type: mutationType,
        generation: 'PURIFIED'
      }
    );
    
    return purificationRecord;
  }

  private determineMutationType(dnaScore: DNAScore): PurificationRecord['mutation_type'] {
    if (dnaScore.win_rate < 20) return 'COMPLETE_REBUILD';
    if (dnaScore.avg_profit_loss < -1.5) return 'THRESHOLD_ADJUSTMENT';
    if (dnaScore.confidence_avg < 40) return 'LOGIC_INVERSION';
    if (dnaScore.performance_trend === 'DECLINING') return 'INDICATOR_SWAP';
    return 'HYBRID_CREATION';
  }

  private mutateDNA(originalDNA: string, mutationType: PurificationRecord['mutation_type']): string {
    try {
      // Extract pattern from original DNA (simplified approach)
      const dnaComponents = this.parseDNAComponents(originalDNA);
      let mutatedComponents = { ...dnaComponents };
      
      switch (mutationType) {
        case 'THRESHOLD_ADJUSTMENT':
          mutatedComponents = this.adjustThresholds(mutatedComponents);
          break;
        case 'INDICATOR_SWAP':
          mutatedComponents = this.swapIndicators(mutatedComponents);
          break;
        case 'LOGIC_INVERSION':
          mutatedComponents = this.invertLogic(mutatedComponents);
          break;
        case 'HYBRID_CREATION':
          mutatedComponents = this.createHybrid(mutatedComponents);
          break;
        case 'COMPLETE_REBUILD':
          mutatedComponents = this.completeRebuild(mutatedComponents);
          break;
      }
      
      return this.assembleDNA(mutatedComponents);
    } catch (error) {
      // Fallback: generate completely new DNA
      return waidesKIDNAEngine.generateDNA({
        trend: 'UPTREND',
        rsi: 50,
        vwap_status: 'ABOVE',
        price: 2400,
        ema50: 2390,
        ema200: 2380,
        volume: 1000000,
        timestamp: Date.now()
      });
    }
  }

  private parseDNAComponents(dna: string): any {
    // Simplified DNA parsing - in reality this would be more sophisticated
    return {
      hash: dna,
      rsi_threshold: 50,
      vwap_logic: 'ABOVE',
      ema_gap: 10,
      volume_min: 500000,
      confidence_base: 60
    };
  }

  private adjustThresholds(components: any): any {
    return {
      ...components,
      rsi_threshold: components.rsi_threshold + (Math.random() - 0.5) * 20,
      ema_gap: components.ema_gap * (0.8 + Math.random() * 0.4),
      volume_min: components.volume_min * (0.7 + Math.random() * 0.6),
      confidence_base: Math.max(40, Math.min(80, components.confidence_base + (Math.random() - 0.5) * 30))
    };
  }

  private swapIndicators(components: any): any {
    return {
      ...components,
      vwap_logic: components.vwap_logic === 'ABOVE' ? 'BELOW' : 'ABOVE',
      rsi_threshold: 100 - components.rsi_threshold
    };
  }

  private invertLogic(components: any): any {
    return {
      ...components,
      rsi_threshold: components.rsi_threshold > 50 ? components.rsi_threshold - 30 : components.rsi_threshold + 30,
      confidence_base: Math.max(30, 100 - components.confidence_base)
    };
  }

  private createHybrid(components: any): any {
    // Combine with successful DNA patterns from genome engine
    const successfulStrategies = waidesKIGenomeEngine.getTopPerformingStrategies(3);
    if (successfulStrategies.length > 0) {
      const randomSuccessful = successfulStrategies[Math.floor(Math.random() * successfulStrategies.length)];
      return {
        ...components,
        rsi_threshold: (components.rsi_threshold + 60) / 2, // Blend with moderate value
        confidence_base: Math.max(components.confidence_base, 65)
      };
    }
    return this.adjustThresholds(components);
  }

  private completeRebuild(components: any): any {
    return {
      hash: 'REBUILT_' + Date.now(),
      rsi_threshold: 30 + Math.random() * 40, // 30-70 range
      vwap_logic: Math.random() > 0.5 ? 'ABOVE' : 'BELOW',
      ema_gap: 5 + Math.random() * 20,
      volume_min: 300000 + Math.random() * 1000000,
      confidence_base: 50 + Math.random() * 30
    };
  }

  private assembleDNA(components: any): string {
    // Generate new DNA hash based on components
    const componentString = JSON.stringify(components);
    return waidesKIDNAEngine.generateDNA({
      trend: 'UPTREND',
      rsi: components.rsi_threshold,
      vwap_status: components.vwap_logic,
      price: 2400,
      ema50: 2400 - components.ema_gap,
      ema200: 2400 - components.ema_gap * 2,
      volume: components.volume_min,
      timestamp: Date.now()
    });
  }

  private generatePurificationReason(dnaScore: DNAScore): string {
    const reasons: string[] = [];
    
    if (dnaScore.total_score <= -5) reasons.push('Severe negative score');
    if (dnaScore.win_rate < 30) reasons.push('Poor win rate');
    if (dnaScore.avg_profit_loss < -1) reasons.push('Consistent losses');
    if (dnaScore.performance_trend === 'DECLINING') reasons.push('Declining performance');
    if (dnaScore.total_trades > 10 && dnaScore.total_score < 0) reasons.push('Sustained underperformance');
    
    return reasons.length > 0 ? reasons.join(', ') : 'Automatic purification threshold reached';
  }

  private generateMutationDetails(originalDNA: string, purifiedDNA: string, mutationType: PurificationRecord['mutation_type']): string[] {
    const details: string[] = [];
    
    details.push(`Original DNA: ${originalDNA.substring(0, 12)}...`);
    details.push(`Purified DNA: ${purifiedDNA.substring(0, 12)}...`);
    details.push(`Mutation type: ${mutationType}`);
    
    switch (mutationType) {
      case 'THRESHOLD_ADJUSTMENT':
        details.push('Adjusted RSI and volume thresholds for better market timing');
        break;
      case 'INDICATOR_SWAP':
        details.push('Swapped VWAP logic and inverted RSI conditions');
        break;
      case 'LOGIC_INVERSION':
        details.push('Inverted decision logic to contrarian approach');
        break;
      case 'HYBRID_CREATION':
        details.push('Blended with successful strategy patterns');
        break;
      case 'COMPLETE_REBUILD':
        details.push('Completely rebuilt strategy from optimized components');
        break;
    }
    
    return details;
  }

  private generateHealingStrategy(dnaScore: DNAScore): string {
    if (dnaScore.win_rate < 20) return 'Aggressive reconstruction needed';
    if (dnaScore.avg_profit_loss < -1.5) return 'Focus on loss minimization';
    if (dnaScore.confidence_avg < 40) return 'Improve signal confidence';
    return 'General optimization and fine-tuning';
  }

  private generateExpectedImprovements(mutationType: PurificationRecord['mutation_type']): string[] {
    const improvements: string[] = [];
    
    switch (mutationType) {
      case 'THRESHOLD_ADJUSTMENT':
        improvements.push('Better entry/exit timing');
        improvements.push('Reduced false signals');
        break;
      case 'INDICATOR_SWAP':
        improvements.push('Alternative market perspective');
        improvements.push('Contrarian advantage');
        break;
      case 'LOGIC_INVERSION':
        improvements.push('Inverted bias correction');
        improvements.push('Counter-trend opportunities');
        break;
      case 'HYBRID_CREATION':
        improvements.push('Best-of-breed characteristics');
        improvements.push('Enhanced robustness');
        break;
      case 'COMPLETE_REBUILD':
        improvements.push('Fresh approach');
        improvements.push('Elimination of systemic flaws');
        break;
    }
    
    improvements.push('Improved risk-reward ratio');
    improvements.push('Higher confidence signals');
    
    return improvements;
  }

  private markAsToxicAndEliminate(dnaScore: DNAScore): { status: string; action: string; score: number; recommendation?: string } {
    dnaScore.is_toxic = true;
    
    // Remove from memory systems
    waidesKIRootMemory.forgetDNA(dnaScore.dna_id);
    waidesKISignatureTracker.blockDNA(dnaScore.dna_id, 'TOXIC_PERFORMANCE');
    
    waidesKIDailyReporter.recordLesson(
      `DNA ${dnaScore.dna_id} marked as toxic and eliminated (score: ${dnaScore.total_score})`,
      'HEALING',
      'CRITICAL',
      'DNA Healer'
    );
    
    return {
      status: 'ELIMINATED',
      action: 'DNA_BLOCKED',
      score: dnaScore.total_score,
      recommendation: 'DNA permanently blocked due to toxic performance'
    };
  }

  private shouldEvolve(dnaScore: DNAScore): boolean {
    // Evolution criteria for moderately performing DNA
    return dnaScore.total_trades >= 8 && 
           dnaScore.total_score >= -1 && 
           dnaScore.total_score <= 2 &&
           dnaScore.win_rate >= 40 &&
           dnaScore.win_rate <= 60;
  }

  private initiateEvolution(dnaScore: DNAScore): { status: string; action: string; score: number; recommendation?: string } {
    try {
      const evolutionResult = this.evolveDNA(dnaScore);
      
      return {
        status: 'EVOLVED',
        action: 'DNA_EVOLVED',
        score: dnaScore.total_score,
        recommendation: `DNA evolved for optimization. New variant: ${evolutionResult.evolved_dna}`
      };
    } catch (error) {
      return {
        status: 'EVOLUTION_FAILED',
        action: 'KEPT',
        score: dnaScore.total_score,
        recommendation: 'Evolution failed - continuing with original DNA'
      };
    }
  }

  private evolveDNA(dnaScore: DNAScore): DNAEvolution {
    const evolutionId = this.generateEvolutionId();
    const evolvedDNA = this.generateEvolvedDNA(dnaScore);
    
    const evolution: DNAEvolution = {
      evolution_id: evolutionId,
      timestamp: Date.now(),
      parent_dna: dnaScore.dna_id,
      evolved_dna: evolvedDNA,
      evolution_trigger: 'MUTATION_OPPORTUNITY',
      evolution_method: 'Optimized threshold adjustment',
      performance_delta: 0, // Will be measured over time
      generation_number: 1,
      survival_probability: 0.7
    };
    
    this.evolutionHistory.push(evolution);
    
    // Register evolved DNA
    const evolvedDNAScore = this.createNewDNAScore(evolvedDNA, dnaScore.strategy_category);
    this.dnaScores.set(evolvedDNA, evolvedDNAScore);
    
    return evolution;
  }

  private generateEvolvedDNA(dnaScore: DNAScore): string {
    // Light mutation for evolution (less aggressive than purification)
    const components = this.parseDNAComponents(dnaScore.dna_id);
    
    // Minor adjustments for optimization
    const evolvedComponents = {
      ...components,
      rsi_threshold: components.rsi_threshold + (Math.random() - 0.5) * 10,
      ema_gap: components.ema_gap * (0.9 + Math.random() * 0.2),
      confidence_base: Math.max(50, Math.min(85, components.confidence_base + (Math.random() - 0.5) * 15))
    };
    
    return this.assembleDNA(evolvedComponents);
  }

  // HEALING SESSIONS
  private async runFullHealingSession(): Promise<void> {
    if (!this.isHealingActive) return;
    
    const sessionId = this.generateSessionId();
    const startTime = Date.now();
    let dnasPurified = 0;
    let dnasEvolved = 0;
    let dnasEliminated = 0;
    const healingInsights: string[] = [];
    
    try {
      // Evaluate all DNA
      for (const [dnaId, dnaScore] of this.dnaScores.entries()) {
        if (dnaScore.is_toxic) continue;
        
        // Check for purification needs
        if (dnaScore.total_score <= this.purificationThreshold) {
          this.purifyDNA(dnaScore);
          dnasPurified++;
        }
        
        // Check for toxic elimination
        if (dnaScore.total_score <= this.toxicThreshold) {
          this.markAsToxicAndEliminate(dnaScore);
          dnasEliminated++;
        }
        
        // Check for evolution opportunities
        if (this.shouldEvolve(dnaScore)) {
          this.evolveDNA(dnaScore);
          dnasEvolved++;
        }
      }
      
      // Generate healing insights
      healingInsights.push(`Processed ${this.dnaScores.size} DNA patterns`);
      if (dnasPurified > 0) healingInsights.push(`Purified ${dnasPurified} underperforming strategies`);
      if (dnasEvolved > 0) healingInsights.push(`Evolved ${dnasEvolved} strategies for optimization`);
      if (dnasEliminated > 0) healingInsights.push(`Eliminated ${dnasEliminated} toxic patterns`);
      
      // Clean old DNA
      this.cleanOldDNA();
      
      const session: HealingSession = {
        session_id: sessionId,
        timestamp: Date.now(),
        dnas_evaluated: this.dnaScores.size,
        dnas_purified: dnasPurified,
        dnas_evolved: dnasEvolved,
        dnas_eliminated: dnasEliminated,
        healing_insights: healingInsights,
        overall_improvement: this.calculateOverallImprovement(),
        session_duration_ms: Date.now() - startTime
      };
      
      this.healingSessions.push(session);
      
      waidesKIDailyReporter.recordLesson(
        `DNA healing session completed: ${dnasPurified} purified, ${dnasEvolved} evolved, ${dnasEliminated} eliminated`,
        'HEALING',
        'HIGH',
        'DNA Healer'
      );
      
    } catch (error) {
      console.error('Error during full healing session:', error);
      healingInsights.push(`Healing session encountered errors: ${error.message}`);
    }
  }

  private quickPurificationCheck(): void {
    if (!this.isHealingActive) return;
    
    // Quick check for critically bad DNA
    for (const [dnaId, dnaScore] of this.dnaScores.entries()) {
      if (dnaScore.total_score <= this.toxicThreshold && !dnaScore.is_toxic) {
        this.markAsToxicAndEliminate(dnaScore);
      }
    }
  }

  private cleanOldDNA(): void {
    const now = Date.now();
    const cutoffTime = now - this.maxDNAAge;
    
    for (const [dnaId, dnaScore] of this.dnaScores.entries()) {
      if (dnaScore.last_used < cutoffTime && dnaScore.total_score < 0) {
        this.dnaScores.delete(dnaId);
        waidesKIRootMemory.forgetDNA(dnaId);
      }
    }
    
    // Clean old records
    this.purificationRecords = this.purificationRecords.filter(record => 
      record.timestamp > cutoffTime
    );
    
    this.evolutionHistory = this.evolutionHistory.filter(evolution => 
      evolution.timestamp > cutoffTime
    );
    
    this.healingSessions = this.healingSessions.filter(session => 
      session.timestamp > cutoffTime
    );
  }

  private calculateOverallImprovement(): number {
    const totalDNA = this.dnaScores.size;
    if (totalDNA === 0) return 0;
    
    let positiveScores = 0;
    let totalScore = 0;
    
    for (const dnaScore of this.dnaScores.values()) {
      if (!dnaScore.is_toxic) {
        totalScore += dnaScore.total_score;
        if (dnaScore.total_score > 0) positiveScores++;
      }
    }
    
    const avgScore = totalScore / totalDNA;
    const positiveRatio = positiveScores / totalDNA;
    
    return Math.round((avgScore + positiveRatio * 100) / 2);
  }

  private generateRecommendation(dnaScore: DNAScore): string {
    if (dnaScore.win_rate > 70) return 'Excellent DNA - reinforce usage';
    if (dnaScore.win_rate > 55) return 'Good DNA - continue monitoring';
    if (dnaScore.win_rate > 40) return 'Average DNA - consider optimization';
    if (dnaScore.win_rate > 25) return 'Poor DNA - purification candidate';
    return 'Critical DNA - immediate attention required';
  }

  // UTILITY METHODS
  private generatePurificationId(): string {
    return `PURIFY_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateEvolutionId(): string {
    return `EVOLVE_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateSessionId(): string {
    return `HEAL_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  // PUBLIC INTERFACE METHODS
  getDNAScores(): { [dnaId: string]: DNAScore } {
    const scores: { [dnaId: string]: DNAScore } = {};
    for (const [dnaId, score] of this.dnaScores.entries()) {
      scores[dnaId] = { ...score };
    }
    return scores;
  }

  getHealingStatistics(): {
    total_dna_tracked: number;
    healthy_dna_count: number;
    toxic_dna_count: number;
    purified_dna_count: number;
    evolved_dna_count: number;
    avg_dna_score: number;
    avg_win_rate: number;
    healing_sessions: number;
    last_healing_session: number;
    overall_health_score: number;
  } {
    const totalDNA = this.dnaScores.size;
    let healthyCount = 0;
    let toxicCount = 0;
    let totalScore = 0;
    let totalWinRate = 0;
    
    for (const dnaScore of this.dnaScores.values()) {
      if (dnaScore.is_toxic) {
        toxicCount++;
      } else {
        healthyCount++;
      }
      totalScore += dnaScore.total_score;
      totalWinRate += dnaScore.win_rate;
    }
    
    const avgScore = totalDNA > 0 ? totalScore / totalDNA : 0;
    const avgWinRate = totalDNA > 0 ? totalWinRate / totalDNA : 0;
    const lastSession = this.healingSessions.length > 0 ? 
      this.healingSessions[this.healingSessions.length - 1].timestamp : 0;
    
    return {
      total_dna_tracked: totalDNA,
      healthy_dna_count: healthyCount,
      toxic_dna_count: toxicCount,
      purified_dna_count: this.purificationRecords.length,
      evolved_dna_count: this.evolutionHistory.length,
      avg_dna_score: Math.round(avgScore * 100) / 100,
      avg_win_rate: Math.round(avgWinRate * 100) / 100,
      healing_sessions: this.healingSessions.length,
      last_healing_session: lastSession,
      overall_health_score: this.calculateOverallImprovement()
    };
  }

  getPurificationHistory(limit: number = 50): PurificationRecord[] {
    return this.purificationRecords.slice(-limit).reverse();
  }

  getEvolutionHistory(limit: number = 50): DNAEvolution[] {
    return this.evolutionHistory.slice(-limit).reverse();
  }

  getHealingSessions(limit: number = 20): HealingSession[] {
    return this.healingSessions.slice(-limit).reverse();
  }

  enableHealing(): void {
    this.isHealingActive = true;
    waidesKIDailyReporter.logEmotionalState(
      'FOCUSED',
      'DNA healing system activated for strategy purification',
      'DNA Healer Activation',
      85
    );
  }

  disableHealing(): void {
    this.isHealingActive = false;
    waidesKIDailyReporter.logEmotionalState(
      'NEUTRAL',
      'DNA healing system deactivated',
      'DNA Healer Deactivation',
      70
    );
  }

  updatePurificationThreshold(newThreshold: number): void {
    this.purificationThreshold = newThreshold;
    waidesKIDailyReporter.recordLesson(
      `DNA purification threshold updated to ${newThreshold}`,
      'HEALING',
      'MEDIUM',
      'DNA Healer'
    );
  }

  updateToxicThreshold(newThreshold: number): void {
    this.toxicThreshold = newThreshold;
    waidesKIDailyReporter.recordLesson(
      `DNA toxic elimination threshold updated to ${newThreshold}`,
      'HEALING',
      'MEDIUM',
      'DNA Healer'
    );
  }

  forgetDNA(dnaId: string): boolean {
    const dnaScore = this.dnaScores.get(dnaId);
    if (dnaScore) {
      this.dnaScores.delete(dnaId);
      waidesKIRootMemory.forgetDNA(dnaId);
      return true;
    }
    return false;
  }

  exportHealingData(): any {
    return {
      dna_scores: this.getDNAScores(),
      purification_records: this.purificationRecords,
      evolution_history: this.evolutionHistory,
      healing_sessions: this.healingSessions,
      healing_statistics: this.getHealingStatistics(),
      healing_config: {
        is_active: this.isHealingActive,
        purification_threshold: this.purificationThreshold,
        toxic_threshold: this.toxicThreshold,
        max_dna_age: this.maxDNAAge
      },
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKIDNAHealer = new WaidesKIDNAHealer();