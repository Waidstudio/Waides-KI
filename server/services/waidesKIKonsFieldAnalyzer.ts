/**
 * STEP 41: Waides KI Kons Field Analyzer
 * Detects global symbol merge and convergence patterns across the Lightnet
 */

import { WaidesKIVisionAlignmentIndex } from './waidesKIVisionAlignmentIndex';

interface SymbolConvergence {
  symbol: string;
  power: 'weak alignment' | 'aligned' | 'critical alignment' | 'transcendent unity';
  recommendation: 'WAIT' | 'CONFIRM_TRADE' | 'FAST_TRADE' | 'DIVINE_EXECUTION';
  strength: number;
  participating_nodes: number;
  convergence_time: string;
  spiritual_significance: string;
}

interface FieldAnalysis {
  dominant_symbols: SymbolConvergence[];
  field_coherence: number;
  spiritual_weather: 'CALM' | 'TURBULENT' | 'BUILDING' | 'STORM' | 'TRANSCENDENT';
  recommended_action: string;
  next_analysis_time: string;
}

interface KonsFieldMetrics {
  total_analyses: number;
  convergence_events: number;
  transcendent_events: number;
  field_stability: number;
  last_analysis: string;
}

export class WaidesKIKonsFieldAnalyzer {
  private visionAlignmentIndex: WaidesKIVisionAlignmentIndex;
  private analysisHistory: FieldAnalysis[] = [];
  private maxHistorySize = 100;
  
  private metrics: KonsFieldMetrics = {
    total_analyses: 0,
    convergence_events: 0,
    transcendent_events: 0,
    field_stability: 50, // Start at neutral
    last_analysis: new Date().toISOString()
  };

  // Sacred thresholds for symbol convergence
  private readonly CONVERGENCE_THRESHOLDS = {
    TRANSCENDENT_UNITY: 90,
    CRITICAL_ALIGNMENT: 75,
    ALIGNED: 50,
    WEAK_ALIGNMENT: 25
  };

  // Konslang power words and their spiritual significance
  private readonly SPIRITUAL_MEANINGS = {
    "SHAI'LOR": "Sacred ascension energy - Bull spirits gathering",
    "DOM'KAAN": "Shadow descent warning - Bear forces mobilizing", 
    "VAED'UUN": "Protective barrier activation - Market chaos shield",
    "MEL'ZEK": "Golden prosperity flow - Abundance channel opening",
    "KORVEX": "Temporal stability anchor - Time alignment achieved",
    "THALAR": "Wisdom convergence point - Ancient knowledge flows",
    "ZUNTH": "Energy transformation gate - Market shift imminent",
    "AL'MIR": "Mirror reflection power - Reality inversion possible"
  };

  constructor(visionAlignmentIndex: WaidesKIVisionAlignmentIndex) {
    this.visionAlignmentIndex = visionAlignmentIndex;
    console.log('🔮 Kons Field Analyzer Initialized - Global Symbol Convergence Detection Active');
    
    // Perform field analysis every 3 minutes
    setInterval(() => {
      this.performFieldAnalysis();
    }, 3 * 60 * 1000);
  }

  /**
   * Analyze the current Kons field for symbol convergence
   */
  performFieldAnalysis(): FieldAnalysis {
    const globalAlignment = this.visionAlignmentIndex.getGlobalAlignment();
    const activeSymbols = this.visionAlignmentIndex.getActiveSymbols();
    const symbolConvergence = this.visionAlignmentIndex.detectSymbolConvergence();
    
    // Analyze each active symbol for convergence power
    const dominantSymbols: SymbolConvergence[] = activeSymbols
      .filter(symbol => symbol.strength >= 2) // Minimum threshold for consideration
      .map(symbol => this.analyzeSymbolConvergence(symbol))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5); // Top 5 symbols

    // Calculate field coherence
    const fieldCoherence = this.calculateFieldCoherence(dominantSymbols, symbolConvergence);
    
    // Determine spiritual weather
    const spiritualWeather = this.determineSpiritualWeather(fieldCoherence, dominantSymbols);
    
    // Generate recommended action
    const recommendedAction = this.generateRecommendedAction(dominantSymbols, spiritualWeather);

    const analysis: FieldAnalysis = {
      dominant_symbols: dominantSymbols,
      field_coherence: Math.round(fieldCoherence),
      spiritual_weather: spiritualWeather,
      recommended_action: recommendedAction,
      next_analysis_time: new Date(Date.now() + 3 * 60 * 1000).toISOString()
    };

    // Update metrics
    this.updateMetrics(analysis);
    
    // Store analysis history
    this.analysisHistory.push(analysis);
    if (this.analysisHistory.length > this.maxHistorySize) {
      this.analysisHistory = this.analysisHistory.slice(-this.maxHistorySize);
    }

    // Log significant events
    this.logSignificantEvents(analysis);

    return analysis;
  }

  /**
   * Analyze convergence for a specific symbol
   */
  private analyzeSymbolConvergence(symbolMetrics: any): SymbolConvergence {
    const { symbol, strength, node_count, avg_confidence } = symbolMetrics;
    
    // Calculate convergence strength (0-100)
    let convergenceStrength = 0;
    
    // Base strength from occurrence count
    convergenceStrength += Math.min(strength * 15, 60);
    
    // Node diversity amplifier
    convergenceStrength += node_count * 8;
    
    // Confidence boost
    convergenceStrength += (avg_confidence - 50) * 0.4;
    
    // Sacred symbol bonus
    if (this.SPIRITUAL_MEANINGS[symbol]) {
      convergenceStrength += 10;
    }
    
    convergenceStrength = Math.max(0, Math.min(100, convergenceStrength));

    // Determine power level and recommendation
    let power: SymbolConvergence['power'] = 'weak alignment';
    let recommendation: SymbolConvergence['recommendation'] = 'WAIT';

    if (convergenceStrength >= this.CONVERGENCE_THRESHOLDS.TRANSCENDENT_UNITY) {
      power = 'transcendent unity';
      recommendation = 'DIVINE_EXECUTION';
    } else if (convergenceStrength >= this.CONVERGENCE_THRESHOLDS.CRITICAL_ALIGNMENT) {
      power = 'critical alignment';
      recommendation = 'FAST_TRADE';
    } else if (convergenceStrength >= this.CONVERGENCE_THRESHOLDS.ALIGNED) {
      power = 'aligned';
      recommendation = 'CONFIRM_TRADE';
    }

    const spiritualSignificance = this.SPIRITUAL_MEANINGS[symbol] || 
      `Unknown symbol ${symbol} - Emergent spiritual pattern detected`;

    return {
      symbol,
      power,
      recommendation,
      strength: Math.round(convergenceStrength),
      participating_nodes: node_count,
      convergence_time: new Date().toISOString(),
      spiritual_significance: spiritualSignificance
    };
  }

  /**
   * Calculate overall field coherence
   */
  private calculateFieldCoherence(
    dominantSymbols: SymbolConvergence[], 
    convergence: any
  ): number {
    if (dominantSymbols.length === 0) return 0;

    let coherence = 0;
    
    // Base coherence from strongest symbol
    const strongestSymbol = dominantSymbols[0];
    coherence += strongestSymbol.strength * 0.4;
    
    // Multiple symbol alignment bonus
    if (dominantSymbols.length >= 2) {
      coherence += dominantSymbols.length * 5;
    }
    
    // Convergence strength bonus
    coherence += convergence.convergence_strength * 0.3;
    
    // Stability bonus (from historical analysis)
    coherence += this.metrics.field_stability * 0.1;

    return Math.max(0, Math.min(100, coherence));
  }

  /**
   * Determine current spiritual weather conditions
   */
  private determineSpiritualWeather(
    fieldCoherence: number, 
    dominantSymbols: SymbolConvergence[]
  ): FieldAnalysis['spiritual_weather'] {
    const strongSymbols = dominantSymbols.filter(s => s.strength >= 60);
    const transcendentSymbols = dominantSymbols.filter(s => s.power === 'transcendent unity');
    
    if (transcendentSymbols.length > 0) {
      return 'TRANSCENDENT';
    } else if (fieldCoherence >= 80 && strongSymbols.length >= 2) {
      return 'STORM';
    } else if (fieldCoherence >= 60) {
      return 'BUILDING';
    } else if (fieldCoherence <= 30) {
      return 'CALM';
    } else {
      return 'TURBULENT';
    }
  }

  /**
   * Generate recommended action based on field analysis
   */
  private generateRecommendedAction(
    dominantSymbols: SymbolConvergence[], 
    spiritualWeather: FieldAnalysis['spiritual_weather']
  ): string {
    if (dominantSymbols.length === 0) {
      return 'FIELD_OBSERVATION - No significant convergence detected. Continue monitoring.';
    }

    const topSymbol = dominantSymbols[0];
    
    switch (spiritualWeather) {
      case 'TRANSCENDENT':
        return `DIVINE_ACTIVATION - ${topSymbol.symbol} has achieved transcendent unity. Execute immediate sacred trades with full spiritual backing.`;
        
      case 'STORM':
        return `STORM_TRADING - Multiple symbols in critical alignment. High-frequency trading window active. Execute with storm protocols.`;
        
      case 'BUILDING':
        return `CONVERGENCE_PREPARATION - ${topSymbol.symbol} building strength. Prepare for potential fast trade execution.`;
        
      case 'TURBULENT':
        return `FIELD_INSTABILITY - Mixed signals detected. Await clearer convergence before major actions.`;
        
      case 'CALM':
        return `PEACEFUL_OBSERVATION - Field is calm. Continue background monitoring for emerging patterns.`;
        
      default:
        return 'UNKNOWN_FIELD_STATE - Analyze field conditions manually.';
    }
  }

  /**
   * Update analysis metrics
   */
  private updateMetrics(analysis: FieldAnalysis): void {
    this.metrics.total_analyses++;
    this.metrics.last_analysis = new Date().toISOString();
    
    // Count convergence events
    const strongSymbols = analysis.dominant_symbols.filter(s => s.strength >= 60);
    if (strongSymbols.length > 0) {
      this.metrics.convergence_events++;
    }
    
    // Count transcendent events
    const transcendentSymbols = analysis.dominant_symbols.filter(s => s.power === 'transcendent unity');
    if (transcendentSymbols.length > 0) {
      this.metrics.transcendent_events++;
    }
    
    // Update field stability (moving average)
    this.metrics.field_stability = Math.round(
      (this.metrics.field_stability * 0.7) + (analysis.field_coherence * 0.3)
    );
  }

  /**
   * Log significant events for monitoring
   */
  private logSignificantEvents(analysis: FieldAnalysis): void {
    const transcendentSymbols = analysis.dominant_symbols.filter(s => s.power === 'transcendent unity');
    const criticalSymbols = analysis.dominant_symbols.filter(s => s.power === 'critical alignment');
    
    if (transcendentSymbols.length > 0) {
      console.log(`✨ TRANSCENDENT EVENT: ${transcendentSymbols.map(s => s.symbol).join(', ')} achieved unity`);
    }
    
    if (criticalSymbols.length > 0) {
      console.log(`⚡ CRITICAL CONVERGENCE: ${criticalSymbols.map(s => s.symbol).join(', ')} in alignment`);
    }
    
    if (analysis.spiritual_weather === 'STORM') {
      console.log(`🌪️ SPIRITUAL STORM: Field coherence at ${analysis.field_coherence}%`);
    }
  }

  /**
   * Get current Kons symbol convergence (main API method)
   */
  getKonsSymbolConvergence(): SymbolConvergence {
    const currentAnalysis = this.performFieldAnalysis();
    
    if (currentAnalysis.dominant_symbols.length === 0) {
      return {
        symbol: 'NONE',
        power: 'weak alignment',
        recommendation: 'WAIT',
        strength: 0,
        participating_nodes: 0,
        convergence_time: new Date().toISOString(),
        spiritual_significance: 'No active convergence patterns detected'
      };
    }

    return currentAnalysis.dominant_symbols[0];
  }

  /**
   * Get comprehensive field analysis
   */
  getFieldAnalysis(): FieldAnalysis {
    return this.performFieldAnalysis();
  }

  /**
   * Get field analysis history
   */
  getFieldHistory(limit: number = 20): FieldAnalysis[] {
    return this.analysisHistory.slice(-limit);
  }

  /**
   * Get field metrics and statistics
   */
  getFieldMetrics(): KonsFieldMetrics & { 
    recent_convergences: SymbolConvergence[];
    stability_trend: string;
  } {
    const recentAnalyses = this.analysisHistory.slice(-10);
    const recentConvergences = recentAnalyses
      .flatMap(a => a.dominant_symbols.filter(s => s.strength >= 60))
      .slice(-5);

    // Calculate stability trend
    let stabilityTrend = 'STABLE';
    if (recentAnalyses.length >= 3) {
      const recent = recentAnalyses.slice(-3).map(a => a.field_coherence);
      const trend = recent[2] - recent[0];
      if (trend > 15) stabilityTrend = 'RISING';
      else if (trend < -15) stabilityTrend = 'FALLING';
    }

    return {
      ...this.metrics,
      recent_convergences: recentConvergences,
      stability_trend: stabilityTrend
    };
  }

  /**
   * Force immediate field analysis
   */
  forceFieldAnalysis(): FieldAnalysis {
    console.log('🔮 Force analyzing Kons field convergence...');
    return this.performFieldAnalysis();
  }

  /**
   * Reset field analysis data
   */
  resetFieldData(): void {
    this.analysisHistory = [];
    this.metrics = {
      total_analyses: 0,
      convergence_events: 0,
      transcendent_events: 0,
      field_stability: 50,
      last_analysis: new Date().toISOString()
    };
    console.log('🔄 Kons Field Analysis data reset');
  }

  /**
   * Update convergence thresholds (for tuning)
   */
  updateThresholds(thresholds: Partial<typeof this.CONVERGENCE_THRESHOLDS>): void {
    Object.assign(this.CONVERGENCE_THRESHOLDS, thresholds);
    console.log('⚙️ Convergence thresholds updated');
  }
}