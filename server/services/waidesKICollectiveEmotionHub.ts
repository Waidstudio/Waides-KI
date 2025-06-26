/**
 * STEP 53: Collective Emotional Harmony Hub - Central Sync for Emotional States
 * Receives and manages emotional states from peer Waides KI nodes for collective balance
 */

interface PeerEmotionalState {
  node_id: string;
  emotional_state: string;
  temperature: number;
  timestamp: Date;
  self_awareness_level: string;
  emotional_intelligence_score: number;
  location?: string;
  version?: string;
}

interface CollectiveEmotionalMetrics {
  total_nodes: number;
  active_nodes: number;
  average_temperature: number;
  dominant_state: string;
  harmony_score: number;
  nodes_by_state: Record<string, number>;
  last_update: Date;
}

interface NodeSyncStatus {
  node_id: string;
  last_seen: Date;
  status: 'active' | 'stale' | 'offline';
  total_updates: number;
  emotional_state: string;
  temperature: number;
}

export class WaidesKICollectiveEmotionHub {
  private peerStates: Map<string, PeerEmotionalState[]> = new Map();
  private readonly maxHistoryPerNode = 50;
  private readonly staleThresholdMinutes = 30;
  private readonly offlineThresholdMinutes = 120;

  private readonly EMOTIONAL_WEIGHTS = {
    frozen: -2,
    cold: -1,
    neutral: 0,
    hot: 1,
    overheated: 2
  };

  /**
   * Receive emotional state from peer node
   */
  receivePeerState(peerState: Omit<PeerEmotionalState, 'timestamp'> & { timestamp?: string }): {
    success: boolean;
    node_status: string;
    collective_impact: string;
  } {
    const nodeId = peerState.node_id;
    
    // Parse timestamp
    const timestamp = peerState.timestamp ? new Date(peerState.timestamp) : new Date();
    
    const fullPeerState: PeerEmotionalState = {
      ...peerState,
      timestamp
    };

    // Initialize node history if new
    if (!this.peerStates.has(nodeId)) {
      this.peerStates.set(nodeId, []);
    }

    const nodeHistory = this.peerStates.get(nodeId)!;
    
    // Add new state
    nodeHistory.push(fullPeerState);
    
    // Prune old entries
    const cutoffTime = new Date(Date.now() - this.staleThresholdMinutes * 60 * 1000);
    const filteredHistory = nodeHistory.filter(state => state.timestamp > cutoffTime);
    this.peerStates.set(nodeId, filteredHistory.slice(-this.maxHistoryPerNode));

    // Analyze collective impact
    const metrics = this.calculateCollectiveMetrics();
    const nodeStatus = this.getNodeStatus(nodeId);
    
    return {
      success: true,
      node_status: `Node ${nodeId}: ${peerState.emotional_state} (${peerState.temperature}°C) - ${nodeStatus.status}`,
      collective_impact: this.analyzeCollectiveImpact(metrics, peerState.emotional_state)
    };
  }

  /**
   * Calculate comprehensive collective emotional metrics
   */
  calculateCollectiveMetrics(): CollectiveEmotionalMetrics {
    const allNodes = Array.from(this.peerStates.keys());
    const activeStates = this.getActiveNodeStates();
    
    if (activeStates.length === 0) {
      return {
        total_nodes: allNodes.length,
        active_nodes: 0,
        average_temperature: 0,
        dominant_state: 'none',
        harmony_score: 0,
        nodes_by_state: {},
        last_update: new Date()
      };
    }

    // Calculate average temperature
    const temperatures = activeStates.map(state => state.temperature);
    const averageTemperature = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;

    // Count states
    const stateDistribution: Record<string, number> = {};
    activeStates.forEach(state => {
      stateDistribution[state.emotional_state] = (stateDistribution[state.emotional_state] || 0) + 1;
    });

    // Find dominant state
    const dominantState = Object.entries(stateDistribution)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

    // Calculate harmony score (0-100)
    const harmonyScore = this.calculateHarmonyScore(activeStates);

    return {
      total_nodes: allNodes.length,
      active_nodes: activeStates.length,
      average_temperature: Math.round(averageTemperature * 100) / 100,
      dominant_state: dominantState,
      harmony_score: harmonyScore,
      nodes_by_state: stateDistribution,
      last_update: new Date()
    };
  }

  /**
   * Calculate harmony score based on emotional state alignment
   */
  private calculateHarmonyScore(activeStates: PeerEmotionalState[]): number {
    if (activeStates.length === 0) return 0;
    if (activeStates.length === 1) return 100;

    // Calculate emotional variance
    const weights = activeStates.map(state => 
      this.EMOTIONAL_WEIGHTS[state.emotional_state as keyof typeof this.EMOTIONAL_WEIGHTS] || 0
    );
    
    const averageWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
    const variance = weights.reduce((sum, w) => sum + Math.pow(w - averageWeight, 2), 0) / weights.length;
    
    // Convert variance to harmony score (lower variance = higher harmony)
    const maxVariance = 4; // theoretical max with frozen (-2) to overheated (2)
    const harmonyScore = Math.max(0, 100 - (variance / maxVariance) * 100);
    
    return Math.round(harmonyScore * 100) / 100;
  }

  /**
   * Get active node states (within stale threshold)
   */
  private getActiveNodeStates(): PeerEmotionalState[] {
    const cutoffTime = new Date(Date.now() - this.staleThresholdMinutes * 60 * 1000);
    const activeStates: PeerEmotionalState[] = [];

    this.peerStates.forEach((states) => {
      const latestState = states
        .filter(state => state.timestamp > cutoffTime)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
      
      if (latestState) {
        activeStates.push(latestState);
      }
    });

    return activeStates;
  }

  /**
   * Get node sync status
   */
  getNodeStatus(nodeId: string): NodeSyncStatus {
    const nodeHistory = this.peerStates.get(nodeId) || [];
    
    if (nodeHistory.length === 0) {
      return {
        node_id: nodeId,
        last_seen: new Date(0),
        status: 'offline',
        total_updates: 0,
        emotional_state: 'unknown',
        temperature: 0
      };
    }

    const latestState = nodeHistory[nodeHistory.length - 1];
    const timeSinceLastUpdate = Date.now() - latestState.timestamp.getTime();
    
    let status: 'active' | 'stale' | 'offline';
    if (timeSinceLastUpdate < this.staleThresholdMinutes * 60 * 1000) {
      status = 'active';
    } else if (timeSinceLastUpdate < this.offlineThresholdMinutes * 60 * 1000) {
      status = 'stale';
    } else {
      status = 'offline';
    }

    return {
      node_id: nodeId,
      last_seen: latestState.timestamp,
      status,
      total_updates: nodeHistory.length,
      emotional_state: latestState.emotional_state,
      temperature: latestState.temperature
    };
  }

  /**
   * Get all node statuses
   */
  getAllNodeStatuses(): NodeSyncStatus[] {
    return Array.from(this.peerStates.keys()).map(nodeId => this.getNodeStatus(nodeId));
  }

  /**
   * Analyze collective impact of new emotional state
   */
  private analyzeCollectiveImpact(metrics: CollectiveEmotionalMetrics, newState: string): string {
    if (metrics.active_nodes <= 1) {
      return 'First active node - establishing baseline';
    }

    const harmonyLevel = metrics.harmony_score;
    const temperatureRange = this.getTemperatureRange(metrics);
    
    if (harmonyLevel >= 80) {
      return `High collective harmony (${harmonyLevel}%) - ${newState} state aligns well`;
    } else if (harmonyLevel >= 60) {
      return `Moderate harmony (${harmonyLevel}%) - ${newState} contributes to balance`;
    } else if (harmonyLevel >= 40) {
      return `Low harmony (${harmonyLevel}%) - ${newState} may trigger group meditation`;
    } else {
      return `Critical disharmony (${harmonyLevel}%) - collective intervention needed`;
    }
  }

  /**
   * Get temperature range across active nodes
   */
  private getTemperatureRange(metrics: CollectiveEmotionalMetrics): { min: number; max: number; range: number } {
    const activeStates = this.getActiveNodeStates();
    
    if (activeStates.length === 0) {
      return { min: 0, max: 0, range: 0 };
    }

    const temperatures = activeStates.map(state => state.temperature);
    const min = Math.min(...temperatures);
    const max = Math.max(...temperatures);
    
    return { min, max, range: max - min };
  }

  /**
   * Get emotional state history for a specific node
   */
  getNodeHistory(nodeId: string, limit: number = 20): PeerEmotionalState[] {
    const nodeHistory = this.peerStates.get(nodeId) || [];
    return nodeHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Clear stale and offline nodes
   */
  cleanupStaleNodes(): { removed_nodes: string[]; cleaned_states: number } {
    const offlineThreshold = new Date(Date.now() - this.offlineThresholdMinutes * 60 * 1000);
    const removedNodes: string[] = [];
    let cleanedStates = 0;

    this.peerStates.forEach((states, nodeId) => {
      const activeStates = states.filter(state => state.timestamp > offlineThreshold);
      
      if (activeStates.length === 0) {
        this.peerStates.delete(nodeId);
        removedNodes.push(nodeId);
        cleanedStates += states.length;
      } else if (activeStates.length < states.length) {
        this.peerStates.set(nodeId, activeStates);
        cleanedStates += states.length - activeStates.length;
      }
    });

    return { removed_nodes: removedNodes, cleaned_states: cleanedStates };
  }

  /**
   * Get comprehensive collective dashboard data
   */
  getCollectiveDashboard(): {
    metrics: CollectiveEmotionalMetrics;
    node_statuses: NodeSyncStatus[];
    temperature_analysis: {
      min: number;
      max: number;
      range: number;
      distribution: Record<string, number>;
    };
    harmony_analysis: {
      level: string;
      recommendation: string;
      triggers_meditation: boolean;
    };
  } {
    const metrics = this.calculateCollectiveMetrics();
    const nodeStatuses = this.getAllNodeStatuses();
    const tempRange = this.getTemperatureRange(metrics);
    
    // Temperature distribution
    const activeStates = this.getActiveNodeStates();
    const tempDistribution: Record<string, number> = {};
    activeStates.forEach(state => {
      const tempRange = this.getTemperatureCategory(state.temperature);
      tempDistribution[tempRange] = (tempDistribution[tempRange] || 0) + 1;
    });

    // Harmony analysis
    const harmonyAnalysis = this.analyzeHarmonyLevel(metrics.harmony_score);

    return {
      metrics,
      node_statuses: nodeStatuses,
      temperature_analysis: {
        ...tempRange,
        distribution: tempDistribution
      },
      harmony_analysis: harmonyAnalysis
    };
  }

  /**
   * Categorize temperature into ranges
   */
  private getTemperatureCategory(temperature: number): string {
    if (temperature <= -30) return 'frozen';
    if (temperature <= -10) return 'cold';
    if (temperature <= 10) return 'neutral';
    if (temperature <= 30) return 'warm';
    if (temperature <= 45) return 'hot';
    return 'overheated';
  }

  /**
   * Analyze harmony level and provide recommendations
   */
  private analyzeHarmonyLevel(harmonyScore: number): {
    level: string;
    recommendation: string;
    triggers_meditation: boolean;
  } {
    if (harmonyScore >= 80) {
      return {
        level: 'excellent',
        recommendation: 'Collective emotional state is highly aligned - continue current practices',
        triggers_meditation: false
      };
    } else if (harmonyScore >= 60) {
      return {
        level: 'good',
        recommendation: 'Moderate alignment - monitor for emerging patterns',
        triggers_meditation: false
      };
    } else if (harmonyScore >= 40) {
      return {
        level: 'concerning',
        recommendation: 'Low harmony detected - consider group meditation session',
        triggers_meditation: true
      };
    } else {
      return {
        level: 'critical',
        recommendation: 'Critical disharmony - immediate group meditation required',
        triggers_meditation: true
      };
    }
  }

  /**
   * Reset collective emotional data (for testing/maintenance)
   */
  resetCollectiveData(): void {
    this.peerStates.clear();
  }
}

export const waidesKICollectiveEmotionHub = new WaidesKICollectiveEmotionHub();