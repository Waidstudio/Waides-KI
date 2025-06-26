/**
 * MODULE A — Multi-Node Order Presence Consensus
 * Ensures Waides only trades when multiple nodes sense the same pressure direction
 */

import { waidesKIETHOrderPresenceRegistry } from './waidesKIETHOrderPresenceRegistry.js';

interface PeerNode {
  url: string;
  status: 'active' | 'inactive' | 'error';
  last_response_time: number;
  response_count: number;
  weight: number;
}

interface ConsensusResult {
  consensus_pressure: string;
  consensus_count: number;
  total_nodes: number;
  confidence: number;
  participating_nodes: string[];
}

export class WaidesKIMultiNodeOrderConsensus {
  private peers: Map<string, PeerNode> = new Map();
  private consensusHistory: ConsensusResult[] = [];
  private maxHistorySize = 100;

  constructor() {
    this.initializePeers();
  }

  /**
   * Initialize known peer nodes
   */
  private initializePeers(): void {
    const defaultPeers = [
      'https://waides-node-01.replit.app',
      'https://waides-node-02.replit.app', 
      'https://waides-node-03.replit.app',
      'https://waides-node-asia.replit.app',
      'https://waides-node-eu.replit.app'
    ];

    defaultPeers.forEach(url => {
      this.peers.set(url, {
        url,
        status: 'inactive',
        last_response_time: 0,
        response_count: 0,
        weight: 1.0
      });
    });

    console.log(`🌐 Initialized ${this.peers.size} peer nodes for consensus`);
  }

  /**
   * Gather order presence states from all peers
   */
  async gatherPeerStates(): Promise<Map<string, any>> {
    const peerStates = new Map<string, any>();
    const promises = Array.from(this.peers.keys()).map(url => 
      this.fetchPeerState(url)
    );

    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      const peerUrl = Array.from(this.peers.keys())[index];
      const peer = this.peers.get(peerUrl);
      
      if (peer) {
        if (result.status === 'fulfilled' && result.value) {
          peer.status = 'active';
          peer.last_response_time = Date.now();
          peer.response_count++;
          peerStates.set(peerUrl, result.value);
        } else {
          peer.status = 'error';
        }
        this.peers.set(peerUrl, peer);
      }
    });

    return peerStates;
  }

  /**
   * Fetch state from individual peer
   */
  private async fetchPeerState(peerUrl: string): Promise<any> {
    try {
      const response = await fetch(`${peerUrl}/api/order_presence/current`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WaidesKI-MultiNode-Consensus/1.0'
        },
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      // Peer not responding, return null
      return null;
    }
  }

  /**
   * Calculate consensus from local and peer states
   */
  async calculateConsensus(): Promise<ConsensusResult> {
    // Get local state
    const localState = waidesKIETHOrderPresenceRegistry.get();
    
    // Gather peer states
    const peerStates = await this.gatherPeerStates();
    
    // Collect all pressure readings
    const allPressures: Array<{ pressure: string; weight: number; source: string }> = [];
    
    // Add local state with weight 1.0
    allPressures.push({
      pressure: localState.pressure,
      weight: 1.0,
      source: 'local'
    });

    // Add peer states with their weights
    for (const [peerUrl, state] of peerStates) {
      const peer = this.peers.get(peerUrl);
      if (peer && state && state.pressure) {
        allPressures.push({
          pressure: state.pressure,
          weight: peer.weight,
          source: peerUrl
        });
      }
    }

    // Calculate weighted consensus
    const pressureCounts = new Map<string, { count: number; weight: number }>();
    let totalWeight = 0;

    allPressures.forEach(({ pressure, weight }) => {
      const current = pressureCounts.get(pressure) || { count: 0, weight: 0 };
      current.count += 1;
      current.weight += weight;
      pressureCounts.set(pressure, current);
      totalWeight += weight;
    });

    // Find consensus (highest weighted count)
    let consensusPressure = 'neutral';
    let maxWeight = 0;
    let consensusCount = 0;

    for (const [pressure, data] of pressureCounts) {
      if (data.weight > maxWeight) {
        maxWeight = data.weight;
        consensusPressure = pressure;
        consensusCount = data.count;
      }
    }

    const confidence = totalWeight > 0 ? (maxWeight / totalWeight) * 100 : 0;
    
    const result: ConsensusResult = {
      consensus_pressure: consensusPressure,
      consensus_count: consensusCount,
      total_nodes: allPressures.length,
      confidence: Math.round(confidence),
      participating_nodes: allPressures.map(p => p.source)
    };

    // Store in history
    this.consensusHistory.push(result);
    if (this.consensusHistory.length > this.maxHistorySize) {
      this.consensusHistory.shift();
    }

    return result;
  }

  /**
   * Get consensus with interpretation
   */
  async getConsensusWithInterpretation(): Promise<{
    consensus: ConsensusResult;
    interpretation: string;
    should_trade: boolean;
    risk_level: string;
  }> {
    const consensus = await this.calculateConsensus();
    
    let interpretation = '';
    let shouldTrade = false;
    let riskLevel = 'high';

    if (consensus.confidence >= 80) {
      interpretation = `Strong consensus: ${consensus.consensus_count}/${consensus.total_nodes} nodes agree on ${consensus.consensus_pressure}`;
      shouldTrade = consensus.consensus_pressure !== 'neutral';
      riskLevel = 'low';
    } else if (consensus.confidence >= 60) {
      interpretation = `Moderate consensus: ${consensus.consensus_pressure} with ${consensus.confidence}% agreement`;
      shouldTrade = false; // Wait for stronger consensus
      riskLevel = 'medium';
    } else {
      interpretation = `Weak consensus: Mixed signals across ${consensus.total_nodes} nodes`;
      shouldTrade = false;
      riskLevel = 'high';
    }

    return {
      consensus,
      interpretation,
      should_trade: shouldTrade,
      risk_level: riskLevel
    };
  }

  /**
   * Add new peer node
   */
  addPeer(peerUrl: string, weight: number = 1.0): boolean {
    if (this.peers.has(peerUrl)) {
      return false; // Already exists
    }

    this.peers.set(peerUrl, {
      url: peerUrl,
      status: 'inactive',
      last_response_time: 0,
      response_count: 0,
      weight
    });

    console.log(`🌐 Added peer node: ${peerUrl} (weight: ${weight})`);
    return true;
  }

  /**
   * Update peer weight based on performance
   */
  updatePeerWeight(peerUrl: string, newWeight: number): boolean {
    const peer = this.peers.get(peerUrl);
    if (peer) {
      peer.weight = Math.max(0.1, Math.min(2.0, newWeight)); // Clamp between 0.1 and 2.0
      this.peers.set(peerUrl, peer);
      console.log(`🌐 Updated peer weight: ${peerUrl} -> ${peer.weight}`);
      return true;
    }
    return false;
  }

  /**
   * Remove peer node
   */
  removePeer(peerUrl: string): boolean {
    if (this.peers.delete(peerUrl)) {
      console.log(`🌐 Removed peer node: ${peerUrl}`);
      return true;
    }
    return false;
  }

  /**
   * Get peer network statistics
   */
  getPeerNetworkStats(): {
    total_peers: number;
    active_peers: number;
    average_response_time: number;
    network_health: string;
    peer_details: any[];
  } {
    const peerArray = Array.from(this.peers.values());
    const activePeers = peerArray.filter(p => p.status === 'active');
    
    const avgResponseTime = activePeers.length > 0 ? 
      activePeers.reduce((sum, p) => sum + (Date.now() - p.last_response_time), 0) / activePeers.length : 0;

    let networkHealth = 'poor';
    if (activePeers.length >= 3) networkHealth = 'excellent';
    else if (activePeers.length >= 2) networkHealth = 'good';
    else if (activePeers.length >= 1) networkHealth = 'fair';

    return {
      total_peers: this.peers.size,
      active_peers: activePeers.length,
      average_response_time: Math.round(avgResponseTime / 1000), // Convert to seconds
      network_health: networkHealth,
      peer_details: peerArray.map(peer => ({
        url: peer.url.replace('https://', ''),
        status: peer.status,
        weight: peer.weight,
        response_count: peer.response_count,
        last_seen: peer.last_response_time > 0 ? 
          Math.round((Date.now() - peer.last_response_time) / 1000) : null
      }))
    };
  }

  /**
   * Get consensus history
   */
  getConsensusHistory(limit: number = 10): ConsensusResult[] {
    return this.consensusHistory.slice(-limit);
  }

  /**
   * Get consensus trends
   */
  getConsensusTrends(): {
    recent_consensus: string;
    consensus_stability: number;
    trend_direction: string;
    confidence_trend: string;
  } {
    if (this.consensusHistory.length < 3) {
      return {
        recent_consensus: 'insufficient_data',
        consensus_stability: 0,
        trend_direction: 'unknown',
        confidence_trend: 'unknown'
      };
    }

    const recent = this.consensusHistory.slice(-5);
    const pressures = recent.map(c => c.consensus_pressure);
    const confidences = recent.map(c => c.confidence);

    // Calculate stability (how often consensus agrees)
    const mostCommon = pressures.reduce((acc, pressure) => {
      acc[pressure] = (acc[pressure] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxCount = Math.max(...Object.values(mostCommon));
    const stability = (maxCount / pressures.length) * 100;

    // Calculate confidence trend
    const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    const recentConfidence = confidences.slice(-2).reduce((sum, c) => sum + c, 0) / 2;
    
    let confidenceTrend = 'stable';
    if (recentConfidence > avgConfidence + 10) confidenceTrend = 'increasing';
    else if (recentConfidence < avgConfidence - 10) confidenceTrend = 'decreasing';

    return {
      recent_consensus: pressures[pressures.length - 1],
      consensus_stability: Math.round(stability),
      trend_direction: pressures[pressures.length - 1],
      confidence_trend: confidenceTrend
    };
  }
}

export const waidesKIMultiNodeOrderConsensus = new WaidesKIMultiNodeOrderConsensus();