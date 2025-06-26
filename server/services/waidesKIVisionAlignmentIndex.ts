/**
 * STEP 41: Waides KI Vision Alignment Index
 * Scores incoming signals for alignment or warning - Are We All Seeing the Same Thing?
 */

interface SymbolOccurrence {
  timestamp: Date;
  node_id: string;
  confidence: number;
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
  alignment_score: number;
}

interface AlignmentMetrics {
  symbol: string;
  occurrences: SymbolOccurrence[];
  strength: number;
  consensus_trend: string;
  avg_confidence: number;
  last_seen: string;
  node_count: number;
}

interface GlobalAlignment {
  top_symbol: string;
  alignment_strength: number;
  consensus_confidence: number;
  participating_nodes: number;
  recommendation: 'FAST_TRADE' | 'CONFIRM_TRADE' | 'WAIT' | 'AVOID';
  warning_level: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class WaidesKIVisionAlignmentIndex {
  private symbolOccurrences: Map<string, SymbolOccurrence[]> = new Map();
  private alignmentThreshold = 30; // minutes
  private maxHistoryPerSymbol = 100;

  private alignmentStats = {
    total_signals_analyzed: 0,
    alignment_events: 0,
    warning_events: 0,
    last_analysis_time: new Date().toISOString()
  };

  constructor() {
    console.log('🎯 Vision Alignment Index Initialized - Global Signal Convergence Analysis Active');
    
    // Clean up old occurrences every 15 minutes
    setInterval(() => {
      this.cleanupOldOccurrences();
    }, 15 * 60 * 1000);
  }

  /**
   * Add a new signal occurrence for analysis
   */
  addSignalOccurrence(signal: {
    symbol: string;
    node_id: string;
    confidence: number;
    trend: 'UP' | 'DOWN' | 'SIDEWAYS';
    timestamp: string;
    alignment_score?: number;
  }): void {
    const occurrence: SymbolOccurrence = {
      timestamp: new Date(signal.timestamp),
      node_id: signal.node_id,
      confidence: signal.confidence,
      trend: signal.trend,
      alignment_score: signal.alignment_score || 0
    };

    // Get or create symbol occurrence array
    if (!this.symbolOccurrences.has(signal.symbol)) {
      this.symbolOccurrences.set(signal.symbol, []);
    }

    const occurrences = this.symbolOccurrences.get(signal.symbol)!;
    occurrences.push(occurrence);

    // Maintain history limit
    if (occurrences.length > this.maxHistoryPerSymbol) {
      occurrences.splice(0, occurrences.length - this.maxHistoryPerSymbol);
    }

    this.alignmentStats.total_signals_analyzed++;
    this.alignmentStats.last_analysis_time = new Date().toISOString();

    console.log(`🎯 Added signal occurrence: ${signal.symbol} from ${signal.node_id}`);
  }

  /**
   * Get the top symbol with highest alignment in recent timeframe
   */
  getTopSymbolAlignment(): { symbol: string | null; occurrences: SymbolOccurrence[] } {
    const thresholdTime = new Date(Date.now() - (this.alignmentThreshold * 60 * 1000));
    let topSymbol: string | null = null;
    let maxOccurrences: SymbolOccurrence[] = [];

    for (const [symbol, occurrences] of this.symbolOccurrences.entries()) {
      const recentOccurrences = occurrences.filter(occ => occ.timestamp >= thresholdTime);
      
      if (recentOccurrences.length > maxOccurrences.length) {
        topSymbol = symbol;
        maxOccurrences = recentOccurrences;
      }
    }

    return { symbol: topSymbol, occurrences: maxOccurrences };
  }

  /**
   * Calculate comprehensive alignment metrics for a symbol
   */
  getSymbolAlignmentMetrics(symbol: string): AlignmentMetrics | null {
    const occurrences = this.symbolOccurrences.get(symbol);
    if (!occurrences || occurrences.length === 0) {
      return null;
    }

    const thresholdTime = new Date(Date.now() - (this.alignmentThreshold * 60 * 1000));
    const recentOccurrences = occurrences.filter(occ => occ.timestamp >= thresholdTime);

    if (recentOccurrences.length === 0) {
      return null;
    }

    // Calculate trend consensus
    const trendCounts = { UP: 0, DOWN: 0, SIDEWAYS: 0 };
    let totalConfidence = 0;
    const uniqueNodes = new Set<string>();

    recentOccurrences.forEach(occ => {
      trendCounts[occ.trend]++;
      totalConfidence += occ.confidence;
      uniqueNodes.add(occ.node_id);
    });

    const consensusTrend = Object.entries(trendCounts)
      .sort(([,a], [,b]) => b - a)[0][0];

    return {
      symbol,
      occurrences: recentOccurrences,
      strength: recentOccurrences.length,
      consensus_trend: consensusTrend,
      avg_confidence: Math.round(totalConfidence / recentOccurrences.length),
      last_seen: recentOccurrences[recentOccurrences.length - 1].timestamp.toISOString(),
      node_count: uniqueNodes.size
    };
  }

  /**
   * Get global alignment analysis
   */
  getGlobalAlignment(): GlobalAlignment {
    const { symbol: topSymbol, occurrences } = this.getTopSymbolAlignment();
    
    if (!topSymbol || occurrences.length === 0) {
      return {
        top_symbol: 'NONE',
        alignment_strength: 0,
        consensus_confidence: 0,
        participating_nodes: 0,
        recommendation: 'WAIT',
        warning_level: 'NONE'
      };
    }

    const metrics = this.getSymbolAlignmentMetrics(topSymbol)!;
    const uniqueNodes = new Set(occurrences.map(occ => occ.node_id));
    
    // Calculate alignment strength based on multiple factors
    let alignmentStrength = 0;
    
    // Base strength from occurrence count
    alignmentStrength += Math.min(occurrences.length * 10, 50);
    
    // Node diversity bonus
    alignmentStrength += uniqueNodes.size * 5;
    
    // Confidence bonus
    alignmentStrength += (metrics.avg_confidence - 50) * 0.3;
    
    // Recent activity bonus (signals within last 10 minutes)
    const recentActivity = occurrences.filter(occ => 
      Date.now() - occ.timestamp.getTime() < 10 * 60 * 1000
    ).length;
    alignmentStrength += recentActivity * 5;

    alignmentStrength = Math.max(0, Math.min(100, alignmentStrength));

    // Determine recommendation and warning level
    let recommendation: GlobalAlignment['recommendation'] = 'WAIT';
    let warningLevel: GlobalAlignment['warning_level'] = 'NONE';

    if (alignmentStrength >= 80 && uniqueNodes.size >= 3) {
      recommendation = 'FAST_TRADE';
      this.alignmentStats.alignment_events++;
    } else if (alignmentStrength >= 60 && uniqueNodes.size >= 2) {
      recommendation = 'CONFIRM_TRADE';
    } else if (alignmentStrength < 30) {
      recommendation = 'AVOID';
      warningLevel = 'MEDIUM';
      this.alignmentStats.warning_events++;
    }

    // Check for conflicting signals (warning detection)
    const trendVariance = this.calculateTrendVariance(occurrences);
    if (trendVariance > 0.6) {
      warningLevel = 'HIGH';
      recommendation = 'AVOID';
      this.alignmentStats.warning_events++;
    }

    return {
      top_symbol: topSymbol,
      alignment_strength: Math.round(alignmentStrength),
      consensus_confidence: metrics.avg_confidence,
      participating_nodes: uniqueNodes.size,
      recommendation,
      warning_level: warningLevel
    };
  }

  /**
   * Calculate trend variance to detect conflicting signals
   */
  private calculateTrendVariance(occurrences: SymbolOccurrence[]): number {
    if (occurrences.length === 0) return 0;

    const trendCounts = { UP: 0, DOWN: 0, SIDEWAYS: 0 };
    occurrences.forEach(occ => trendCounts[occ.trend]++);

    const total = occurrences.length;
    const proportions = [
      trendCounts.UP / total,
      trendCounts.DOWN / total,
      trendCounts.SIDEWAYS / total
    ];

    // Calculate variance - higher means more disagreement
    const mean = 1 / 3; // Equal distribution would be 1/3 each
    const variance = proportions.reduce((sum, prop) => sum + Math.pow(prop - mean, 2), 0) / 3;
    
    return variance;
  }

  /**
   * Get all symbols with recent activity
   */
  getActiveSymbols(): AlignmentMetrics[] {
    const activeSymbols: AlignmentMetrics[] = [];
    
    for (const symbol of this.symbolOccurrences.keys()) {
      const metrics = this.getSymbolAlignmentMetrics(symbol);
      if (metrics && metrics.strength > 0) {
        activeSymbols.push(metrics);
      }
    }

    return activeSymbols.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Check for symbol convergence (multiple symbols aligning)
   */
  detectSymbolConvergence(): {
    converging_symbols: string[];
    convergence_strength: number;
    unified_trend: string;
    recommendation: string;
  } {
    const activeSymbols = this.getActiveSymbols();
    const strongSymbols = activeSymbols.filter(s => s.strength >= 2);

    if (strongSymbols.length < 2) {
      return {
        converging_symbols: [],
        convergence_strength: 0,
        unified_trend: 'NONE',
        recommendation: 'INSUFFICIENT_DATA'
      };
    }

    // Check for trend alignment across symbols
    const trendGroups = {
      UP: strongSymbols.filter(s => s.consensus_trend === 'UP'),
      DOWN: strongSymbols.filter(s => s.consensus_trend === 'DOWN'),
      SIDEWAYS: strongSymbols.filter(s => s.consensus_trend === 'SIDEWAYS')
    };

    const dominantTrendGroup = Object.entries(trendGroups)
      .sort(([,a], [,b]) => b.length - a.length)[0];

    const [unifiedTrend, convergingSymbols] = dominantTrendGroup;
    
    if (convergingSymbols.length < 2) {
      return {
        converging_symbols: [],
        convergence_strength: 0,
        unified_trend: 'CONFLICTED',
        recommendation: 'WAIT_FOR_CLARITY'
      };
    }

    const convergenceStrength = Math.min(100, 
      (convergingSymbols.length * 20) + 
      (convergingSymbols.reduce((sum, s) => sum + s.avg_confidence, 0) / convergingSymbols.length * 0.4)
    );

    let recommendation = 'WAIT';
    if (convergenceStrength >= 70 && convergingSymbols.length >= 3) {
      recommendation = 'STRONG_CONVERGENCE_TRADE';
    } else if (convergenceStrength >= 50) {
      recommendation = 'MODERATE_CONVERGENCE_CONFIRM';
    }

    return {
      converging_symbols: convergingSymbols.map(s => s.symbol),
      convergence_strength: Math.round(convergenceStrength),
      unified_trend: unifiedTrend,
      recommendation
    };
  }

  /**
   * Get alignment statistics
   */
  getAlignmentStats(): typeof this.alignmentStats & { 
    active_symbols: number; 
    total_occurrences: number;
    current_global_alignment: GlobalAlignment;
  } {
    const totalOccurrences = Array.from(this.symbolOccurrences.values())
      .reduce((sum, occs) => sum + occs.length, 0);

    return {
      ...this.alignmentStats,
      active_symbols: this.symbolOccurrences.size,
      total_occurrences: totalOccurrences,
      current_global_alignment: this.getGlobalAlignment()
    };
  }

  /**
   * Clean up old occurrences beyond threshold
   */
  private cleanupOldOccurrences(): void {
    const cutoffTime = new Date(Date.now() - (this.alignmentThreshold * 60 * 1000 * 2)); // Keep 2x threshold
    let cleanedCount = 0;

    for (const [symbol, occurrences] of this.symbolOccurrences.entries()) {
      const originalLength = occurrences.length;
      const filtered = occurrences.filter(occ => occ.timestamp >= cutoffTime);
      
      if (filtered.length === 0) {
        this.symbolOccurrences.delete(symbol);
      } else {
        this.symbolOccurrences.set(symbol, filtered);
      }
      
      cleanedCount += originalLength - filtered.length;
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Vision Alignment Index cleaned ${cleanedCount} old occurrences`);
    }
  }

  /**
   * Reset all alignment data
   */
  resetAlignment(): void {
    this.symbolOccurrences.clear();
    this.alignmentStats = {
      total_signals_analyzed: 0,
      alignment_events: 0,
      warning_events: 0,
      last_analysis_time: new Date().toISOString()
    };
    console.log('🔄 Vision Alignment Index reset');
  }

  /**
   * Set alignment threshold (in minutes)
   */
  setAlignmentThreshold(minutes: number): void {
    this.alignmentThreshold = Math.max(5, Math.min(120, minutes));
    console.log(`⏱️ Alignment threshold set to ${this.alignmentThreshold} minutes`);
  }
}