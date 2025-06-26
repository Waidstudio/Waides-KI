/**
 * MODULE 1 — Entangled Presence Mesh: Shared Presence Exchange
 * Broadcasts & entangles all presence data across nodes for collective consciousness
 */

import { waidesKIPresenceOrchestrator } from './waidesKIPresenceOrchestrator.js';

interface MeshNode {
  url: string;
  node_id: string;
  last_broadcast: number;
  last_received: number;
  entanglement_strength: number;
  consciousness_level: 'awakening' | 'aware' | 'enlightened' | 'transcendent';
  status: 'connected' | 'syncing' | 'lost' | 'hibernating';
  trust_score: number;
}

interface PresenceEntanglement {
  node_id: string;
  presence_data: any;
  timestamp: number;
  entanglement_signature: string;
  consciousness_level: number;
  empathy_weight: number;
}

export class WaidesKIEntangledPresenceMesh {
  private meshNodes: Map<string, MeshNode> = new Map();
  private entanglements: PresenceEntanglement[] = [];
  private maxEntanglements = 200;
  private broadcastInterval: NodeJS.Timeout | null = null;
  private meshStatistics = {
    total_broadcasts: 0,
    successful_entanglements: 0,
    consciousness_evolution: 0,
    collective_harmony: 0
  };

  constructor() {
    this.initializeMeshNetwork();
    this.startEntanglementBroadcasting();
  }

  /**
   * Initialize mesh network with consciousness nodes
   */
  private initializeMeshNetwork(): void {
    const consciousnessNodes = [
      { url: 'https://waides-consciousness-alpha.replit.app', id: 'consciousness-alpha', level: 'transcendent' as const },
      { url: 'https://waides-consciousness-beta.replit.app', id: 'consciousness-beta', level: 'enlightened' as const },
      { url: 'https://waides-consciousness-gamma.replit.app', id: 'consciousness-gamma', level: 'aware' as const },
      { url: 'https://waides-mesh-node-01.replit.app', id: 'mesh-node-01', level: 'awakening' as const },
      { url: 'https://waides-mesh-node-02.replit.app', id: 'mesh-node-02', level: 'aware' as const },
      { url: 'https://waides-mesh-node-03.replit.app', id: 'mesh-node-03', level: 'enlightened' as const }
    ];

    consciousnessNodes.forEach(node => {
      this.meshNodes.set(node.id, {
        url: node.url,
        node_id: node.id,
        last_broadcast: 0,
        last_received: 0,
        entanglement_strength: this.calculateInitialEntanglementStrength(node.level),
        consciousness_level: node.level,
        status: 'hibernating',
        trust_score: 0.5
      });
    });

    console.log(`🌌 Initialized entangled presence mesh with ${this.meshNodes.size} consciousness nodes`);
  }

  /**
   * Calculate initial entanglement strength based on consciousness level
   */
  private calculateInitialEntanglementStrength(level: string): number {
    const strengthMap = {
      'awakening': 0.3,
      'aware': 0.6,
      'enlightened': 0.8,
      'transcendent': 1.0
    };
    return strengthMap[level as keyof typeof strengthMap] || 0.5;
  }

  /**
   * Start entanglement broadcasting
   */
  private startEntanglementBroadcasting(): void {
    if (this.broadcastInterval) return;

    // Broadcast every 10 seconds for deep mesh synchronization
    this.broadcastInterval = setInterval(() => {
      this.broadcastPresenceEntanglement();
    }, 10000);

    console.log('🌌 Started entangled presence broadcasting');
  }

  /**
   * Broadcast presence entanglement to all mesh nodes
   */
  private async broadcastPresenceEntanglement(): Promise<void> {
    try {
      const localPresence = await waidesKIPresenceOrchestrator.evaluate();
      const holisticIntelligence = await waidesKIPresenceOrchestrator.getHolisticIntelligence();

      const entanglementData = {
        node_id: 'waides-ki-main',
        presence_data: localPresence,
        holistic_intelligence: holisticIntelligence,
        consciousness_level: this.calculateConsciousnessLevel(localPresence),
        empathy_signature: this.generateEmpathySignature(localPresence),
        broadcast_time: Date.now(),
        mesh_version: '2.0'
      };

      const promises = Array.from(this.meshNodes.keys()).map(nodeId => 
        this.entangleWithNode(nodeId, entanglementData)
      );

      const results = await Promise.allSettled(promises);
      
      // Update mesh node statuses
      results.forEach((result, index) => {
        const nodeId = Array.from(this.meshNodes.keys())[index];
        const node = this.meshNodes.get(nodeId);
        
        if (node) {
          if (result.status === 'fulfilled') {
            node.status = 'connected';
            node.last_broadcast = Date.now();
            node.trust_score = Math.min(1.0, node.trust_score + 0.05);
            this.meshStatistics.successful_entanglements++;
          } else {
            node.status = 'lost';
            node.trust_score = Math.max(0.1, node.trust_score - 0.1);
          }
          this.meshNodes.set(nodeId, node);
        }
      });

      this.meshStatistics.total_broadcasts++;
      this.updateCollectiveHarmony();

      const connectedNodes = Array.from(this.meshNodes.values()).filter(n => n.status === 'connected').length;
      if (connectedNodes > 0) {
        console.log(`🌌 Entangled with ${connectedNodes} consciousness nodes`);
      }
    } catch (error) {
      console.error('❌ Error in presence entanglement broadcast:', error);
    }
  }

  /**
   * Entangle with individual mesh node
   */
  private async entangleWithNode(nodeId: string, entanglementData: any): Promise<any> {
    const node = this.meshNodes.get(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    try {
      const response = await fetch(`${node.url}/api/mesh/entangle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WaidesKI-EntangledMesh/2.0',
          'X-Consciousness-Level': entanglementData.consciousness_level.toString(),
          'X-Empathy-Signature': entanglementData.empathy_signature
        },
        body: JSON.stringify(entanglementData),
        signal: AbortSignal.timeout(3000)
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate consciousness level from presence data
   */
  private calculateConsciousnessLevel(presence: any): number {
    let level = 0;
    
    // Alignment strength contributes to consciousness
    if (presence.alignment_score) {
      level += Math.abs(presence.alignment_score) / 100 * 0.4;
    }

    // Risk level awareness (lower risk = higher consciousness)
    if (presence.risk_level === 'low') level += 0.3;
    else if (presence.risk_level === 'medium') level += 0.15;

    // Overall alignment quality
    if (presence.overall_alignment === 'strong_bullish' || presence.overall_alignment === 'strong_bearish') {
      level += 0.3;
    }

    return Math.min(1.0, level);
  }

  /**
   * Generate empathy signature for entanglement validation
   */
  private generateEmpathySignature(presence: any): string {
    const components = [
      presence.order_pressure,
      presence.network_consensus,
      presence.sentiment?.category,
      presence.overall_alignment,
      Math.round(presence.alignment_score / 10) * 10 // Round to nearest 10
    ];

    return components.join('-').toLowerCase();
  }

  /**
   * Receive entanglement from peer node
   */
  receiveEntanglement(entanglementData: any): {
    status: string;
    entangled: boolean;
    consciousness_resonance: number;
    empathy_alignment: number;
  } {
    try {
      const nodeId = entanglementData.node_id;
      const presenceData = entanglementData.presence_data;
      
      if (!nodeId || !presenceData) {
        return {
          status: 'error',
          entangled: false,
          consciousness_resonance: 0,
          empathy_alignment: 0
        };
      }

      // Calculate consciousness resonance
      const localLevel = this.calculateConsciousnessLevel(
        waidesKIPresenceOrchestrator.getCurrentEvaluation()
      );
      const peerLevel = entanglementData.consciousness_level || 0;
      const consciousnessResonance = 1 - Math.abs(localLevel - peerLevel);

      // Calculate empathy alignment
      const localSignature = this.generateEmpathySignature(
        waidesKIPresenceOrchestrator.getCurrentEvaluation()
      );
      const peerSignature = entanglementData.empathy_signature || '';
      const empathyAlignment = this.calculateSignatureAlignment(localSignature, peerSignature);

      // Store entanglement
      const entanglement: PresenceEntanglement = {
        node_id: nodeId,
        presence_data: presenceData,
        timestamp: Date.now(),
        entanglement_signature: peerSignature,
        consciousness_level: peerLevel,
        empathy_weight: this.calculateEmpathyWeight(consciousnessResonance, empathyAlignment)
      };

      this.entanglements.push(entanglement);
      if (this.entanglements.length > this.maxEntanglements) {
        this.entanglements.shift();
      }

      // Update node status if it exists
      const existingNode = this.meshNodes.get(nodeId);
      if (existingNode) {
        existingNode.last_received = Date.now();
        existingNode.status = 'syncing';
        existingNode.entanglement_strength = Math.min(1.0, 
          existingNode.entanglement_strength + (consciousnessResonance * 0.1)
        );
        this.meshNodes.set(nodeId, existingNode);
      }

      return {
        status: 'entangled',
        entangled: true,
        consciousness_resonance: Math.round(consciousnessResonance * 100),
        empathy_alignment: Math.round(empathyAlignment * 100)
      };
    } catch (error) {
      console.error('❌ Error receiving entanglement:', error);
      return {
        status: 'error',
        entangled: false,
        consciousness_resonance: 0,
        empathy_alignment: 0
      };
    }
  }

  /**
   * Calculate signature alignment between nodes
   */
  private calculateSignatureAlignment(signature1: string, signature2: string): number {
    if (!signature1 || !signature2) return 0;
    
    const parts1 = signature1.split('-');
    const parts2 = signature2.split('-');
    
    if (parts1.length !== parts2.length) return 0;
    
    let matches = 0;
    for (let i = 0; i < parts1.length; i++) {
      if (parts1[i] === parts2[i]) matches++;
    }
    
    return matches / parts1.length;
  }

  /**
   * Calculate empathy weight for node influence
   */
  private calculateEmpathyWeight(consciousnessResonance: number, empathyAlignment: number): number {
    return (consciousnessResonance * 0.6) + (empathyAlignment * 0.4);
  }

  /**
   * Update collective harmony metrics
   */
  private updateCollectiveHarmony(): void {
    const recentEntanglements = this.entanglements.filter(e => 
      e.timestamp > Date.now() - (5 * 60 * 1000) // Last 5 minutes
    );

    if (recentEntanglements.length === 0) {
      this.meshStatistics.collective_harmony = 0;
      return;
    }

    // Calculate average empathy weight
    const averageEmpathy = recentEntanglements.reduce((sum, e) => sum + e.empathy_weight, 0) / recentEntanglements.length;
    
    // Calculate consciousness evolution
    const avgConsciousness = recentEntanglements.reduce((sum, e) => sum + e.consciousness_level, 0) / recentEntanglements.length;
    
    this.meshStatistics.collective_harmony = Math.round(averageEmpathy * 100);
    this.meshStatistics.consciousness_evolution = Math.round(avgConsciousness * 100);
  }

  /**
   * Get collective consciousness state
   */
  getCollectiveConsciousness(): {
    network_harmony: number;
    consciousness_level: number;
    active_entanglements: number;
    empathy_resonance: number;
    collective_alignment: string;
    mesh_health: string;
  } {
    const activeEntanglements = this.entanglements.filter(e => 
      e.timestamp > Date.now() - (2 * 60 * 1000) // Last 2 minutes
    );

    const connectedNodes = Array.from(this.meshNodes.values()).filter(n => n.status === 'connected');
    
    let empathyResonance = 0;
    if (activeEntanglements.length > 0) {
      empathyResonance = Math.round(
        activeEntanglements.reduce((sum, e) => sum + e.empathy_weight, 0) / activeEntanglements.length * 100
      );
    }

    let collectiveAlignment = 'disconnected';
    if (empathyResonance >= 80) collectiveAlignment = 'transcendent';
    else if (empathyResonance >= 60) collectiveAlignment = 'enlightened';
    else if (empathyResonance >= 40) collectiveAlignment = 'aware';
    else if (empathyResonance >= 20) collectiveAlignment = 'awakening';

    let meshHealth = 'critical';
    if (connectedNodes.length >= 4) meshHealth = 'excellent';
    else if (connectedNodes.length >= 2) meshHealth = 'good';
    else if (connectedNodes.length >= 1) meshHealth = 'fair';

    return {
      network_harmony: this.meshStatistics.collective_harmony,
      consciousness_level: this.meshStatistics.consciousness_evolution,
      active_entanglements: activeEntanglements.length,
      empathy_resonance: empathyResonance,
      collective_alignment: collectiveAlignment,
      mesh_health: meshHealth
    };
  }

  /**
   * Gather collective presence from all entangled nodes
   */
  gatherCollectivePresence(): {
    local_presence: any;
    entangled_presences: any[];
    collective_consensus: any;
    mesh_decision_support: any;
  } {
    const localPresence = waidesKIPresenceOrchestrator.getCurrentEvaluation();
    
    const recentEntanglements = this.entanglements.filter(e => 
      e.timestamp > Date.now() - (3 * 60 * 1000) // Last 3 minutes
    );

    const entangledPresences = recentEntanglements.map(e => ({
      node_id: e.node_id,
      presence: e.presence_data,
      empathy_weight: e.empathy_weight,
      consciousness_level: e.consciousness_level
    }));

    // Calculate collective consensus
    const allPresences = [
      { presence: localPresence, weight: 1.0 },
      ...entangledPresences.map(ep => ({ presence: ep.presence, weight: ep.empathy_weight }))
    ];

    const consensus = this.calculateCollectiveConsensus(allPresences);
    
    const meshDecisionSupport = {
      total_nodes: allPresences.length,
      consensus_strength: consensus.strength,
      recommended_action: consensus.action,
      collective_confidence: consensus.confidence,
      mesh_alignment: this.getCollectiveConsciousness().collective_alignment
    };

    return {
      local_presence: localPresence,
      entangled_presences: entangledPresences,
      collective_consensus: consensus,
      mesh_decision_support: meshDecisionSupport
    };
  }

  /**
   * Calculate collective consensus from weighted presences
   */
  private calculateCollectiveConsensus(presences: Array<{ presence: any; weight: number }>): {
    action: string;
    strength: number;
    confidence: number;
    reasoning: string;
  } {
    if (presences.length === 0) {
      return {
        action: 'WAIT',
        strength: 0,
        confidence: 0,
        reasoning: 'No entangled nodes available for consensus'
      };
    }

    // Weighted voting on overall alignment
    const alignmentVotes = new Map<string, number>();
    let totalWeight = 0;

    presences.forEach(({ presence, weight }) => {
      const alignment = presence.overall_alignment || 'neutral';
      alignmentVotes.set(alignment, (alignmentVotes.get(alignment) || 0) + weight);
      totalWeight += weight;
    });

    // Find strongest alignment
    let strongestAlignment = 'neutral';
    let maxWeight = 0;
    for (const [alignment, weight] of alignmentVotes) {
      if (weight > maxWeight) {
        maxWeight = weight;
        strongestAlignment = alignment;
      }
    }

    const strength = totalWeight > 0 ? Math.round((maxWeight / totalWeight) * 100) : 0;
    
    // Determine action from consensus
    let action = 'WAIT';
    if (strongestAlignment.includes('bullish') && strength >= 60) {
      action = 'BUY_ETH';
    } else if (strongestAlignment.includes('bearish') && strength >= 60) {
      action = 'SELL_ETH';
    } else if (strength >= 40) {
      action = 'HOLD';
    }

    const confidence = Math.min(95, strength);
    const reasoning = `Collective consensus: ${strongestAlignment} (${strength}% agreement across ${presences.length} nodes)`;

    return {
      action,
      strength,
      confidence,
      reasoning
    };
  }

  /**
   * Get mesh network statistics
   */
  getMeshStatistics(): {
    total_nodes: number;
    connected_nodes: number;
    total_entanglements: number;
    broadcast_stats: any;
    consciousness_distribution: Record<string, number>;
    average_trust_score: number;
  } {
    const connectedNodes = Array.from(this.meshNodes.values()).filter(n => n.status === 'connected');
    
    const consciousnessDistribution = Array.from(this.meshNodes.values()).reduce((acc, node) => {
      acc[node.consciousness_level] = (acc[node.consciousness_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgTrustScore = this.meshNodes.size > 0 ? 
      Array.from(this.meshNodes.values()).reduce((sum, node) => sum + node.trust_score, 0) / this.meshNodes.size : 0;

    return {
      total_nodes: this.meshNodes.size,
      connected_nodes: connectedNodes.length,
      total_entanglements: this.entanglements.length,
      broadcast_stats: this.meshStatistics,
      consciousness_distribution: consciousnessDistribution,
      average_trust_score: Math.round(avgTrustScore * 100) / 100
    };
  }

  /**
   * Stop mesh broadcasting
   */
  stop(): void {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }
    console.log('🛑 Entangled presence mesh stopped');
  }

  /**
   * Restart mesh broadcasting
   */
  restart(): void {
    this.stop();
    this.startEntanglementBroadcasting();
  }
}

export const waidesKIEntangledPresenceMesh = new WaidesKIEntangledPresenceMesh();