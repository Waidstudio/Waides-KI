import crypto from 'crypto';
import { waidesKIDailyReporter } from './waidesKIDailyReporter';

interface SignalData {
  trend: string;
  rsi: number;
  vwap_status: string;
  ema50: number;
  ema200: number;
  volume: number;
  price: number;
  timestamp?: number;
}

interface DNAInfo {
  dna_id: string;
  first_seen: number;
  signal_fingerprint: {
    trend: string;
    rsi_range: string;
    vwap_status: string;
    ema_divergence: string;
    volume_level: string;
  };
  strategy_category: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  creation_context: string;
  mutation_count: number;
  parent_dna?: string;
}

interface DNAMutation {
  original_dna: string;
  mutated_dna: string;
  mutation_type: 'SLIGHT' | 'MODERATE' | 'MAJOR' | 'COMPLETE';
  mutation_factors: string[];
  similarity_score: number;
  timestamp: number;
}

export class WaidesKIDNAEngine {
  private registeredDNA: Map<string, DNAInfo> = new Map();
  private dnaHistory: Map<string, any[]> = new Map();
  private mutationTracker: DNAMutation[] = [];
  private maxHistorySize: number = 1000;

  constructor() {
    this.initializeDNAEngine();
  }

  private initializeDNAEngine(): void {
    // Clean up old DNA records periodically
    setInterval(() => {
      this.cleanupOldDNA();
    }, 60 * 60 * 1000); // Every hour
  }

  // CORE DNA GENERATION
  generateDNA(signalData: SignalData): string {
    // Create consistent fingerprint for signal characteristics
    const normalizedData = this.normalizeSignalData(signalData);
    
    // Generate unique DNA string from normalized characteristics
    const uniqueString = [
      normalizedData.trend,
      normalizedData.rsi_range,
      normalizedData.vwap_status,
      normalizedData.ema_divergence,
      normalizedData.volume_level
    ].join('|');
    
    // Create SHA-256 hash and take first 16 characters as DNA ID
    const dnaId = crypto.createHash('sha256').update(uniqueString).digest('hex').substring(0, 16);
    
    // Register DNA if new
    if (!this.registeredDNA.has(dnaId)) {
      this.registerNewDNA(dnaId, signalData, normalizedData);
    } else {
      // Check for mutations
      this.checkForMutations(dnaId, signalData);
    }
    
    return dnaId;
  }

  private normalizeSignalData(signalData: SignalData): DNAInfo['signal_fingerprint'] {
    // Normalize RSI into ranges
    let rsiRange: string;
    if (signalData.rsi < 30) rsiRange = 'OVERSOLD';
    else if (signalData.rsi < 40) rsiRange = 'LOW';
    else if (signalData.rsi < 60) rsiRange = 'NEUTRAL';
    else if (signalData.rsi < 70) rsiRange = 'HIGH';
    else rsiRange = 'OVERBOUGHT';
    
    // Normalize EMA divergence
    const ema50Divergence = Math.abs(signalData.price - signalData.ema50) / signalData.price;
    let emaDivergence: string;
    if (ema50Divergence < 0.01) emaDivergence = 'TIGHT';
    else if (ema50Divergence < 0.03) emaDivergence = 'NORMAL';
    else if (ema50Divergence < 0.05) emaDivergence = 'WIDE';
    else emaDivergence = 'EXTREME';
    
    // Normalize volume level (relative to average)
    const avgVolume = 1500000; // Default average volume
    let volumeLevel: string;
    if (signalData.volume < avgVolume * 0.5) volumeLevel = 'LOW';
    else if (signalData.volume < avgVolume * 1.5) volumeLevel = 'NORMAL';
    else if (signalData.volume < avgVolume * 2.5) volumeLevel = 'HIGH';
    else volumeLevel = 'EXTREME';
    
    return {
      trend: signalData.trend.toUpperCase(),
      rsi_range: rsiRange,
      vwap_status: signalData.vwap_status,
      ema_divergence: emaDivergence,
      volume_level: volumeLevel
    };
  }

  private registerNewDNA(dnaId: string, signalData: SignalData, fingerprint: DNAInfo['signal_fingerprint']): void {
    const strategyCategory = this.categorizeStrategy(fingerprint);
    const riskLevel = this.assessRiskLevel(fingerprint);
    
    const dnaInfo: DNAInfo = {
      dna_id: dnaId,
      first_seen: Date.now(),
      signal_fingerprint: fingerprint,
      strategy_category: strategyCategory,
      risk_level: riskLevel,
      creation_context: `Auto-generated from ${fingerprint.trend} signal`,
      mutation_count: 0
    };
    
    this.registeredDNA.set(dnaId, dnaInfo);
    
    // Log DNA creation
    waidesKIDailyReporter.recordLesson(
      `New signal DNA created: ${dnaId} (${strategyCategory}, ${riskLevel} risk)`,
      'PATTERN',
      riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
      'DNA Engine'
    );
  }

  private categorizeStrategy(fingerprint: DNAInfo['signal_fingerprint']): string {
    // Categorize based on fingerprint characteristics
    if (fingerprint.trend === 'UPTREND' && fingerprint.rsi_range === 'LOW' && fingerprint.vwap_status === 'ABOVE') {
      return 'MOMENTUM_BREAKOUT';
    } else if (fingerprint.trend === 'UPTREND' && fingerprint.rsi_range === 'OVERBOUGHT') {
      return 'OVERBOUGHT_CONTINUATION';
    } else if (fingerprint.trend === 'DOWNTREND' && fingerprint.rsi_range === 'HIGH' && fingerprint.vwap_status === 'BELOW') {
      return 'BEARISH_BREAKDOWN';
    } else if (fingerprint.rsi_range === 'NEUTRAL' && fingerprint.ema_divergence === 'TIGHT') {
      return 'CONSOLIDATION_PLAY';
    } else if (fingerprint.volume_level === 'EXTREME') {
      return 'VOLUME_SPIKE_TRADE';
    } else if (fingerprint.ema_divergence === 'EXTREME') {
      return 'MEAN_REVERSION';
    } else {
      return 'GENERIC_SIGNAL';
    }
  }

  private assessRiskLevel(fingerprint: DNAInfo['signal_fingerprint']): DNAInfo['risk_level'] {
    let riskScore = 0;
    
    // Risk factors
    if (fingerprint.rsi_range === 'OVERBOUGHT' || fingerprint.rsi_range === 'OVERSOLD') riskScore += 2;
    if (fingerprint.ema_divergence === 'EXTREME') riskScore += 3;
    if (fingerprint.volume_level === 'LOW') riskScore += 2;
    if (fingerprint.volume_level === 'EXTREME') riskScore += 1;
    if (fingerprint.vwap_status === 'BELOW' && fingerprint.trend === 'UPTREND') riskScore += 2;
    
    if (riskScore >= 6) return 'CRITICAL';
    if (riskScore >= 4) return 'HIGH';
    if (riskScore >= 2) return 'MEDIUM';
    return 'LOW';
  }

  // MUTATION DETECTION
  private checkForMutations(dnaId: string, currentSignalData: SignalData): void {
    const existingDNA = this.registeredDNA.get(dnaId);
    if (!existingDNA) return;
    
    const currentFingerprint = this.normalizeSignalData(currentSignalData);
    const originalFingerprint = existingDNA.signal_fingerprint;
    
    // Check for mutations in characteristics
    const mutations = this.detectMutations(originalFingerprint, currentFingerprint);
    
    if (mutations.length > 0) {
      existingDNA.mutation_count++;
      
      // Log mutation
      waidesKIDailyReporter.recordLesson(
        `DNA mutation detected in ${dnaId}: ${mutations.join(', ')}`,
        'PATTERN',
        'MEDIUM',
        'DNA Engine'
      );
      
      // Track mutation
      const similarity = this.calculateSimilarity(originalFingerprint, currentFingerprint);
      const mutationType = this.classifyMutation(mutations.length, similarity);
      
      this.mutationTracker.push({
        original_dna: dnaId,
        mutated_dna: dnaId, // Same DNA with mutations
        mutation_type: mutationType,
        mutation_factors: mutations,
        similarity_score: similarity,
        timestamp: Date.now()
      });
    }
  }

  private detectMutations(original: DNAInfo['signal_fingerprint'], current: DNAInfo['signal_fingerprint']): string[] {
    const mutations: string[] = [];
    
    if (original.trend !== current.trend) mutations.push('TREND_SHIFT');
    if (original.rsi_range !== current.rsi_range) mutations.push('RSI_RANGE_CHANGE');
    if (original.vwap_status !== current.vwap_status) mutations.push('VWAP_STATUS_FLIP');
    if (original.ema_divergence !== current.ema_divergence) mutations.push('EMA_DIVERGENCE_CHANGE');
    if (original.volume_level !== current.volume_level) mutations.push('VOLUME_LEVEL_SHIFT');
    
    return mutations;
  }

  private calculateSimilarity(original: DNAInfo['signal_fingerprint'], current: DNAInfo['signal_fingerprint']): number {
    let matches = 0;
    const totalFields = 5;
    
    if (original.trend === current.trend) matches++;
    if (original.rsi_range === current.rsi_range) matches++;
    if (original.vwap_status === current.vwap_status) matches++;
    if (original.ema_divergence === current.ema_divergence) matches++;
    if (original.volume_level === current.volume_level) matches++;
    
    return (matches / totalFields) * 100;
  }

  private classifyMutation(mutationCount: number, similarity: number): DNAMutation['mutation_type'] {
    if (similarity < 20) return 'COMPLETE';
    if (similarity < 50) return 'MAJOR';
    if (similarity < 80) return 'MODERATE';
    return 'SLIGHT';
  }

  // DNA CLONING DETECTION
  detectClones(newDNA: string, threshold: number = 90): string[] {
    const clones: string[] = [];
    const newDNAInfo = this.registeredDNA.get(newDNA);
    if (!newDNAInfo) return clones;
    
    for (const [existingDNA, existingInfo] of this.registeredDNA.entries()) {
      if (existingDNA === newDNA) continue;
      
      const similarity = this.calculateSimilarity(newDNAInfo.signal_fingerprint, existingInfo.signal_fingerprint);
      
      if (similarity >= threshold) {
        clones.push(existingDNA);
        
        // Log clone detection
        waidesKIDailyReporter.recordLesson(
          `DNA clone detected: ${newDNA} is ${similarity.toFixed(1)}% similar to ${existingDNA}`,
          'PATTERN',
          'HIGH',
          'DNA Clone Detection'
        );
      }
    }
    
    return clones;
  }

  // DNA GENEALOGY TRACKING
  createDNALineage(parentDNA: string, childDNA: string): void {
    const childInfo = this.registeredDNA.get(childDNA);
    if (childInfo) {
      childInfo.parent_dna = parentDNA;
      
      waidesKIDailyReporter.recordLesson(
        `DNA lineage established: ${childDNA} evolved from ${parentDNA}`,
        'PATTERN',
        'MEDIUM',
        'DNA Genealogy'
      );
    }
  }

  getDNALineage(dnaId: string): string[] {
    const lineage: string[] = [dnaId];
    let currentDNA = dnaId;
    
    // Trace back to parent DNA
    while (currentDNA) {
      const dnaInfo = this.registeredDNA.get(currentDNA);
      if (dnaInfo && dnaInfo.parent_dna) {
        lineage.unshift(dnaInfo.parent_dna);
        currentDNA = dnaInfo.parent_dna;
      } else {
        break;
      }
    }
    
    return lineage;
  }

  // PUBLIC INTERFACE METHODS
  getDNAInfo(dnaId: string): DNAInfo | null {
    return this.registeredDNA.get(dnaId) || null;
  }

  getAllRegisteredDNA(): DNAInfo[] {
    return Array.from(this.registeredDNA.values());
  }

  getDNAByCategory(category: string): DNAInfo[] {
    return Array.from(this.registeredDNA.values())
      .filter(dna => dna.strategy_category === category);
  }

  getDNAByRiskLevel(riskLevel: DNAInfo['risk_level']): DNAInfo[] {
    return Array.from(this.registeredDNA.values())
      .filter(dna => dna.risk_level === riskLevel);
  }

  getMutationHistory(): DNAMutation[] {
    return [...this.mutationTracker];
  }

  getDNAStatistics(): {
    total_dna_registered: number;
    dna_by_category: { [key: string]: number };
    dna_by_risk_level: { [key: string]: number };
    mutation_count: number;
    clone_families: number;
  } {
    const categoryCount: { [key: string]: number } = {};
    const riskLevelCount: { [key: string]: number } = {};
    let cloneFamilies = 0;
    
    for (const dnaInfo of this.registeredDNA.values()) {
      categoryCount[dnaInfo.strategy_category] = (categoryCount[dnaInfo.strategy_category] || 0) + 1;
      riskLevelCount[dnaInfo.risk_level] = (riskLevelCount[dnaInfo.risk_level] || 0) + 1;
      
      if (dnaInfo.parent_dna) cloneFamilies++;
    }
    
    return {
      total_dna_registered: this.registeredDNA.size,
      dna_by_category: categoryCount,
      dna_by_risk_level: riskLevelCount,
      mutation_count: this.mutationTracker.length,
      clone_families: cloneFamilies
    };
  }

  // ADVANCED DNA ANALYSIS
  analyzeDNAEvolution(): {
    most_mutated_dna: { dna_id: string; mutation_count: number } | null;
    stable_dna_patterns: string[];
    emerging_patterns: string[];
    extinction_candidates: string[];
  } {
    let mostMutatedDNA: { dna_id: string; mutation_count: number } | null = null;
    const stablePatterns: string[] = [];
    const emergingPatterns: string[] = [];
    const extinctionCandidates: string[] = [];
    
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const [dnaId, dnaInfo] of this.registeredDNA.entries()) {
      // Find most mutated
      if (!mostMutatedDNA || dnaInfo.mutation_count > mostMutatedDNA.mutation_count) {
        mostMutatedDNA = { dna_id: dnaId, mutation_count: dnaInfo.mutation_count };
      }
      
      // Classify patterns
      if (dnaInfo.mutation_count === 0 && dnaInfo.first_seen < oneWeekAgo) {
        stablePatterns.push(dnaId);
      } else if (dnaInfo.first_seen > oneWeekAgo) {
        emergingPatterns.push(dnaId);
      } else if (dnaInfo.mutation_count > 10) {
        extinctionCandidates.push(dnaId);
      }
    }
    
    return {
      most_mutated_dna: mostMutatedDNA,
      stable_dna_patterns: stablePatterns.slice(0, 10),
      emerging_patterns: emergingPatterns.slice(0, 10),
      extinction_candidates: extinctionCandidates.slice(0, 5)
    };
  }

  // CLEANUP AND MAINTENANCE
  private cleanupOldDNA(): void {
    const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);
    const toDelete: string[] = [];
    
    for (const [dnaId, dnaInfo] of this.registeredDNA.entries()) {
      if (dnaInfo.first_seen < sixMonthsAgo && dnaInfo.mutation_count === 0) {
        // Mark stable, old DNA for deletion
        toDelete.push(dnaId);
      }
    }
    
    // Remove old DNA
    toDelete.forEach(dnaId => {
      this.registeredDNA.delete(dnaId);
    });
    
    // Clean up mutation history
    if (this.mutationTracker.length > 500) {
      this.mutationTracker = this.mutationTracker.slice(-500);
    }
  }

  exportDNADatabase(): any {
    return {
      registered_dna: Object.fromEntries(this.registeredDNA),
      mutation_history: this.mutationTracker,
      statistics: this.getDNAStatistics(),
      evolution_analysis: this.analyzeDNAEvolution(),
      export_timestamp: new Date().toISOString()
    };
  }

  resetDNAEngine(): void {
    this.registeredDNA.clear();
    this.dnaHistory.clear();
    this.mutationTracker.length = 0;
  }
}

export const waidesKIDNAEngine = new WaidesKIDNAEngine();