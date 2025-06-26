/**
 * STEP 41: Waides KI Lightnet Listener
 * Receives signals and visions from global Waides nodes
 */

interface IncomingVision {
  node_id: string;
  symbol: string;
  meaning: string;
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
  confidence: number;
  timestamp: string;
  konslang_message: string;
  market_data?: any;
}

interface GlobalSignal {
  id: string;
  vision: IncomingVision;
  received_at: string;
  processed: boolean;
  alignment_score?: number;
}

interface ListenerStats {
  total_signals_received: number;
  signals_processed: number;
  unique_nodes: Set<string>;
  last_signal_time: string;
  active_signals: number;
}

export class WaidesKILightnetListener {
  private globalSignals: GlobalSignal[] = [];
  private maxSignalHistory = 1000;
  
  private listenerStats: ListenerStats = {
    total_signals_received: 0,
    signals_processed: 0,
    unique_nodes: new Set(),
    last_signal_time: new Date().toISOString(),
    active_signals: 0
  };

  private signalCleanupInterval: NodeJS.Timeout;

  constructor() {
    console.log('🌍 Lightnet Listener Initialized - Receiving Global Visions');
    
    // Clean up old signals every 30 minutes
    this.signalCleanupInterval = setInterval(() => {
      this.cleanupOldSignals();
    }, 30 * 60 * 1000);
  }

  /**
   * Receive a vision from another Waides node
   */
  receiveVision(vision: IncomingVision): { status: string; message: string; signal_id?: string } {
    try {
      // Validate incoming vision
      if (!this.isValidVision(vision)) {
        return {
          status: 'rejected',
          message: 'Invalid vision format'
        };
      }

      // Check if this is a duplicate signal (same node, symbol, and timestamp)
      const isDuplicate = this.globalSignals.some(signal => 
        signal.vision.node_id === vision.node_id &&
        signal.vision.symbol === vision.symbol &&
        Math.abs(new Date(signal.vision.timestamp).getTime() - new Date(vision.timestamp).getTime()) < 60000 // Within 1 minute
      );

      if (isDuplicate) {
        return {
          status: 'duplicate',
          message: 'Signal already received'
        };
      }

      // Create new global signal
      const globalSignal: GlobalSignal = {
        id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        vision,
        received_at: new Date().toISOString(),
        processed: false,
        alignment_score: this.calculateAlignmentScore(vision)
      };

      // Add to signal collection
      this.globalSignals.push(globalSignal);

      // Update stats
      this.listenerStats.total_signals_received++;
      this.listenerStats.unique_nodes.add(vision.node_id);
      this.listenerStats.last_signal_time = new Date().toISOString();
      this.listenerStats.active_signals = this.getActiveSignals().length;

      // Process the signal
      this.processSignal(globalSignal);

      console.log(`📡 Received vision from ${vision.node_id}: ${vision.symbol} (${vision.trend})`);

      // Maintain signal history limit
      if (this.globalSignals.length > this.maxSignalHistory) {
        this.globalSignals = this.globalSignals.slice(-this.maxSignalHistory);
      }

      return {
        status: 'received',
        message: 'Vision accepted and processed',
        signal_id: globalSignal.id
      };

    } catch (error) {
      console.error('Error receiving vision:', error);
      return {
        status: 'error',
        message: 'Failed to process vision'
      };
    }
  }

  /**
   * Validate incoming vision format
   */
  private isValidVision(vision: IncomingVision): boolean {
    return !!(
      vision.node_id &&
      vision.symbol &&
      vision.meaning &&
      vision.trend &&
      ['UP', 'DOWN', 'SIDEWAYS'].includes(vision.trend) &&
      typeof vision.confidence === 'number' &&
      vision.confidence >= 0 &&
      vision.confidence <= 100 &&
      vision.timestamp &&
      vision.konslang_message
    );
  }

  /**
   * Calculate alignment score for incoming vision
   */
  private calculateAlignmentScore(vision: IncomingVision): number {
    let score = 0;

    // Base confidence score
    score += vision.confidence * 0.4;

    // Symbol strength bonus
    const strongSymbols = ['SHAI\'LOR', 'DOM\'KAAN', 'VAED\'UUN'];
    if (strongSymbols.includes(vision.symbol)) {
      score += 20;
    }

    // Trend clarity bonus
    if (vision.trend !== 'SIDEWAYS') {
      score += 15;
    }

    // Recent signal bonus (signals within last 10 minutes get boost)
    const signalAge = Date.now() - new Date(vision.timestamp).getTime();
    if (signalAge < 10 * 60 * 1000) { // 10 minutes
      score += 10;
    }

    // Node trust bonus (simulated)
    if (vision.node_id.includes('node-01') || vision.node_id.includes('node-02')) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Process a received signal
   */
  private processSignal(signal: GlobalSignal): void {
    try {
      // Mark as processed
      signal.processed = true;
      this.listenerStats.signals_processed++;

      // Log significant signals
      if (signal.alignment_score && signal.alignment_score > 75) {
        console.log(`⚡ High-alignment signal detected: ${signal.vision.symbol} (Score: ${signal.alignment_score})`);
      }

      // Here you could integrate with other Waides KI systems
      // For example, feed into Vision Alignment Index or Symbol Convergence analysis

    } catch (error) {
      console.error('Error processing signal:', error);
    }
  }

  /**
   * Get all active signals (within last hour)
   */
  getActiveSignals(): GlobalSignal[] {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return this.globalSignals.filter(signal => 
      new Date(signal.received_at).getTime() > oneHourAgo
    );
  }

  /**
   * Get signals by trend
   */
  getSignalsByTrend(trend: 'UP' | 'DOWN' | 'SIDEWAYS'): GlobalSignal[] {
    return this.getActiveSignals().filter(signal => 
      signal.vision.trend === trend
    );
  }

  /**
   * Get signals by symbol
   */
  getSignalsBySymbol(symbol: string): GlobalSignal[] {
    return this.getActiveSignals().filter(signal => 
      signal.vision.symbol === symbol
    );
  }

  /**
   * Get top symbols by frequency
   */
  getTopSymbols(limit: number = 5): { symbol: string; count: number; avg_confidence: number }[] {
    const activeSignals = this.getActiveSignals();
    const symbolMap = new Map<string, { count: number; total_confidence: number }>();

    activeSignals.forEach(signal => {
      const symbol = signal.vision.symbol;
      const existing = symbolMap.get(symbol) || { count: 0, total_confidence: 0 };
      symbolMap.set(symbol, {
        count: existing.count + 1,
        total_confidence: existing.total_confidence + signal.vision.confidence
      });
    });

    return Array.from(symbolMap.entries())
      .map(([symbol, data]) => ({
        symbol,
        count: data.count,
        avg_confidence: Math.round(data.total_confidence / data.count)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get consensus trend based on recent signals
   */
  getConsensusTrend(): { trend: string; confidence: number; signal_count: number } {
    const activeSignals = this.getActiveSignals();
    
    if (activeSignals.length === 0) {
      return { trend: 'UNKNOWN', confidence: 0, signal_count: 0 };
    }

    const trendCounts = { UP: 0, DOWN: 0, SIDEWAYS: 0 };
    let totalConfidence = 0;

    activeSignals.forEach(signal => {
      trendCounts[signal.vision.trend]++;
      totalConfidence += signal.vision.confidence;
    });

    const dominantTrend = Object.entries(trendCounts)
      .sort(([,a], [,b]) => b - a)[0][0];

    const consensus_confidence = Math.round(
      (trendCounts[dominantTrend as keyof typeof trendCounts] / activeSignals.length) * 
      (totalConfidence / activeSignals.length) / 100 * 100
    );

    return {
      trend: dominantTrend,
      confidence: consensus_confidence,
      signal_count: activeSignals.length
    };
  }

  /**
   * Get listener statistics
   */
  getListenerStats(): ListenerStats & { recent_signals: GlobalSignal[] } {
    return {
      ...this.listenerStats,
      unique_nodes: this.listenerStats.unique_nodes,
      recent_signals: this.getActiveSignals().slice(-10) // Last 10 signals
    };
  }

  /**
   * Clean up old signals
   */
  private cleanupOldSignals(): void {
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    const beforeCount = this.globalSignals.length;
    
    this.globalSignals = this.globalSignals.filter(signal => 
      new Date(signal.received_at).getTime() > twentyFourHoursAgo
    );

    const cleanedCount = beforeCount - this.globalSignals.length;
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old signals from Lightnet`);
    }
  }

  /**
   * Get signal by ID
   */
  getSignalById(signalId: string): GlobalSignal | undefined {
    return this.globalSignals.find(signal => signal.id === signalId);
  }

  /**
   * Get all signals (for debugging/admin)
   */
  getAllSignals(): GlobalSignal[] {
    return [...this.globalSignals];
  }

  /**
   * Clear all signals
   */
  clearAllSignals(): void {
    this.globalSignals = [];
    this.listenerStats.total_signals_received = 0;
    this.listenerStats.signals_processed = 0;
    this.listenerStats.unique_nodes.clear();
    this.listenerStats.active_signals = 0;
    console.log('🗑️ All Lightnet signals cleared');
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    if (this.signalCleanupInterval) {
      clearInterval(this.signalCleanupInterval);
    }
  }
}