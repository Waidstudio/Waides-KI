/**
 * STEP 43: Waides KI Dreamfire Purifier
 * Burns corrupted symbols from memory using sacred dreamfire protocols
 */

import { WaidesKIMemorySigilVault } from './waidesKIMemorySigilVault';

interface CorruptionAnalysis {
  symbol: string;
  total_outcomes: number;
  loss_count: number;
  loss_percentage: number;
  corruption_level: 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  spiritual_weight: number;
  last_outcome: string;
  recommended_action: 'MONITOR' | 'PURGE' | 'QUARANTINE' | 'BURN';
}

interface DreamfireStats {
  total_scans_performed: number;
  symbols_identified_corrupted: number;
  symbols_burned: number;
  avg_corruption_rate: number;
  last_purification: string;
  dreamfire_intensity: number;
}

export class WaidesKIDreamfirePurifier {
  private memorySigilVault: WaidesKIMemorySigilVault;
  private burnedSymbols: Set<string> = new Set();
  private quarantinedSymbols: Map<string, Date> = new Map();
  
  private dreamfireStats: DreamfireStats = {
    total_scans_performed: 0,
    symbols_identified_corrupted: 0,
    symbols_burned: 0,
    avg_corruption_rate: 0,
    last_purification: '',
    dreamfire_intensity: 50
  };

  private readonly CORRUPTION_THRESHOLDS = {
    MINOR: 0.4,      // 40% loss rate
    MODERATE: 0.55,  // 55% loss rate  
    SEVERE: 0.7,     // 70% loss rate
    CRITICAL: 0.85   // 85% loss rate
  };

  private readonly MINIMUM_OUTCOMES = 5; // Minimum outcomes to consider for corruption

  constructor(memorySigilVault: WaidesKIMemorySigilVault) {
    this.memorySigilVault = memorySigilVault;
  }

  /**
   * Identify corrupted symbols that need purification
   */
  identifyCorrupted(): string[] {
    this.dreamfireStats.total_scans_performed++;
    
    const corruptedSymbols: string[] = [];
    const allSymbols = this.memorySigilVault.getAllSymbols();
    
    for (const symbol of allSymbols) {
      const analysis = this.analyzeSymbolCorruption(symbol);
      
      if (analysis && this.isCorrupted(analysis)) {
        corruptedSymbols.push(symbol);
      }
    }

    this.dreamfireStats.symbols_identified_corrupted += corruptedSymbols.length;
    this.updateCorruptionRate(corruptedSymbols.length, allSymbols.length);

    console.log(`🔥 Dreamfire scan complete: ${corruptedSymbols.length} corrupted symbols identified`);

    return corruptedSymbols;
  }

  /**
   * Perform detailed corruption analysis on a specific symbol
   */
  analyzeSymbolCorruption(symbol: string): CorruptionAnalysis | null {
    const outcomes = this.memorySigilVault.getSymbolOutcomes(symbol);
    
    if (!outcomes || outcomes.length < this.MINIMUM_OUTCOMES) {
      return null; // Not enough data for analysis
    }

    const lossCount = outcomes.filter(outcome => outcome.result === 'loss').length;
    const lossPercentage = lossCount / outcomes.length;
    const lastOutcome = outcomes[outcomes.length - 1];

    const corruptionLevel = this.determineCorruptionLevel(lossPercentage);
    const spiritualWeight = this.calculateSpiritualWeight(outcomes);
    const recommendedAction = this.determineRecommendedAction(corruptionLevel, spiritualWeight);

    return {
      symbol,
      total_outcomes: outcomes.length,
      loss_count: lossCount,
      loss_percentage: lossPercentage,
      corruption_level: corruptionLevel,
      spiritual_weight: spiritualWeight,
      last_outcome: lastOutcome.result,
      recommended_action: recommendedAction
    };
  }

  /**
   * Burn corrupted symbol using dreamfire protocol
   */
  burnCorruptedSymbol(symbol: string): boolean {
    const analysis = this.analyzeSymbolCorruption(symbol);
    
    if (!analysis || !this.shouldBurnSymbol(analysis)) {
      return false;
    }

    // Perform the burning ritual
    const burnSuccess = this.executeDreamfireBurn(symbol, analysis);
    
    if (burnSuccess) {
      this.burnedSymbols.add(symbol);
      this.dreamfireStats.symbols_burned++;
      this.dreamfireStats.last_purification = new Date().toISOString();
      
      console.log(`🔥 Symbol burned: ${symbol} (Corruption: ${analysis.corruption_level})`);
    }

    return burnSuccess;
  }

  /**
   * Quarantine a symbol instead of burning (for monitoring)
   */
  quarantineSymbol(symbol: string, durationHours: number = 24): boolean {
    const quarantineUntil = new Date();
    quarantineUntil.setHours(quarantineUntil.getHours() + durationHours);
    
    this.quarantinedSymbols.set(symbol, quarantineUntil);
    
    console.log(`🔒 Symbol quarantined: ${symbol} until ${quarantineUntil.toISOString()}`);
    return true;
  }

  /**
   * Check if a symbol is currently quarantined
   */
  isSymbolQuarantined(symbol: string): boolean {
    const quarantineUntil = this.quarantinedSymbols.get(symbol);
    
    if (!quarantineUntil) return false;
    
    const now = new Date();
    if (now > quarantineUntil) {
      this.quarantinedSymbols.delete(symbol);
      return false;
    }
    
    return true;
  }

  /**
   * Get all corrupted symbols with detailed analysis
   */
  getCorruptionAnalysis(): CorruptionAnalysis[] {
    const allSymbols = this.memorySigilVault.getAllSymbols();
    const analyses: CorruptionAnalysis[] = [];
    
    for (const symbol of allSymbols) {
      const analysis = this.analyzeSymbolCorruption(symbol);
      if (analysis) {
        analyses.push(analysis);
      }
    }
    
    return analyses.sort((a, b) => b.loss_percentage - a.loss_percentage);
  }

  /**
   * Get dreamfire purification statistics
   */
  getDreamfireStats(): DreamfireStats & {
    burned_symbols: string[];
    quarantined_symbols: string[];
    corruption_severity_distribution: { [key: string]: number };
  } {
    const corruptionAnalysis = this.getCorruptionAnalysis();
    const severityDistribution = this.calculateSeverityDistribution(corruptionAnalysis);
    
    return {
      ...this.dreamfireStats,
      burned_symbols: Array.from(this.burnedSymbols),
      quarantined_symbols: Array.from(this.quarantinedSymbols.keys()),
      corruption_severity_distribution: severityDistribution
    };
  }

  /**
   * Adjust dreamfire intensity based on corruption levels
   */
  adjustDreamfireIntensity(newIntensity: number): void {
    this.dreamfireStats.dreamfire_intensity = Math.max(0, Math.min(100, newIntensity));
    console.log(`🔥 Dreamfire intensity adjusted to: ${this.dreamfireStats.dreamfire_intensity}%`);
  }

  /**
   * Reset all burned and quarantined symbols (admin function)
   */
  resetDreamfirePurification(): void {
    this.burnedSymbols.clear();
    this.quarantinedSymbols.clear();
    this.dreamfireStats.symbols_burned = 0;
    this.dreamfireStats.symbols_identified_corrupted = 0;
    
    console.log('🔥 Dreamfire purification reset complete');
  }

  /**
   * Check if a symbol is corrupted based on analysis
   */
  private isCorrupted(analysis: CorruptionAnalysis): boolean {
    return analysis.loss_percentage >= this.CORRUPTION_THRESHOLDS.SEVERE;
  }

  /**
   * Determine corruption level based on loss percentage
   */
  private determineCorruptionLevel(lossPercentage: number): CorruptionAnalysis['corruption_level'] {
    if (lossPercentage >= this.CORRUPTION_THRESHOLDS.CRITICAL) return 'CRITICAL';
    if (lossPercentage >= this.CORRUPTION_THRESHOLDS.SEVERE) return 'SEVERE';
    if (lossPercentage >= this.CORRUPTION_THRESHOLDS.MODERATE) return 'MODERATE';
    return 'MINOR';
  }

  /**
   * Calculate spiritual weight of outcomes
   */
  private calculateSpiritualWeight(outcomes: any[]): number {
    let weight = 0;
    
    for (const outcome of outcomes) {
      if (outcome.result === 'profit') {
        weight += outcome.profit_amount || 10;
      } else if (outcome.result === 'loss') {
        weight -= Math.abs(outcome.profit_amount || 10);
      }
    }
    
    return weight / outcomes.length;
  }

  /**
   * Determine recommended action based on analysis
   */
  private determineRecommendedAction(
    corruptionLevel: CorruptionAnalysis['corruption_level'],
    spiritualWeight: number
  ): CorruptionAnalysis['recommended_action'] {
    if (corruptionLevel === 'CRITICAL') return 'BURN';
    if (corruptionLevel === 'SEVERE' && spiritualWeight < -20) return 'BURN';
    if (corruptionLevel === 'SEVERE') return 'QUARANTINE';
    if (corruptionLevel === 'MODERATE') return 'PURGE';
    return 'MONITOR';
  }

  /**
   * Check if symbol should be burned based on analysis
   */
  private shouldBurnSymbol(analysis: CorruptionAnalysis): boolean {
    return analysis.recommended_action === 'BURN' || 
           (analysis.corruption_level === 'CRITICAL' && analysis.spiritual_weight < -30);
  }

  /**
   * Execute dreamfire burning ritual
   */
  private executeDreamfireBurn(symbol: string, analysis: CorruptionAnalysis): boolean {
    // Intensity affects burn success rate
    const intensityFactor = this.dreamfireStats.dreamfire_intensity / 100;
    const corruptionFactor = analysis.loss_percentage;
    
    // Higher intensity and higher corruption = higher burn success rate
    const burnProbability = intensityFactor * (0.7 + corruptionFactor * 0.3);
    
    const burnSuccess = Math.random() < burnProbability;
    
    if (burnSuccess) {
      // Remove from memory vault
      this.memorySigilVault.purgeSymbol(symbol);
    }
    
    return burnSuccess;
  }

  /**
   * Update average corruption rate
   */
  private updateCorruptionRate(corruptedCount: number, totalSymbols: number): void {
    if (totalSymbols === 0) return;
    
    const currentRate = corruptedCount / totalSymbols;
    const scans = this.dreamfireStats.total_scans_performed;
    
    this.dreamfireStats.avg_corruption_rate = 
      ((this.dreamfireStats.avg_corruption_rate * (scans - 1)) + currentRate) / scans;
  }

  /**
   * Calculate severity distribution
   */
  private calculateSeverityDistribution(analyses: CorruptionAnalysis[]): { [key: string]: number } {
    const distribution = {
      MINOR: 0,
      MODERATE: 0,
      SEVERE: 0,
      CRITICAL: 0
    };
    
    for (const analysis of analyses) {
      distribution[analysis.corruption_level]++;
    }
    
    return distribution;
  }
}