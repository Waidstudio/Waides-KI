/**
 * STEP 41: Waides KI Lightnet Broadcaster
 * Sends current symbol + trend visions to other Waides nodes across the global network
 */

interface WaidesNode {
  id: string;
  url: string;
  trusted: boolean;
  last_seen: string;
}

interface LightnetVision {
  node_id: string;
  symbol: string;
  meaning: string;
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
  confidence: number;
  timestamp: string;
  konslang_message: string;
  market_data?: any;
}

interface BroadcastStats {
  total_broadcasts: number;
  successful_broadcasts: number;
  failed_broadcasts: number;
  active_peers: number;
  last_broadcast_time: string;
}

export class WaidesKILightnetBroadcaster {
  private trustedPeers: WaidesNode[] = [
    {
      id: 'waides-node-01',
      url: 'https://waides-node-01.com/api/lightnet',
      trusted: true,
      last_seen: new Date().toISOString()
    },
    {
      id: 'waides-node-02',
      url: 'https://waides-node-02.org/api/lightnet',
      trusted: true,
      last_seen: new Date().toISOString()
    },
    {
      id: 'waides-node-03',
      url: 'https://waides-eu.net/api/lightnet',
      trusted: true,
      last_seen: new Date().toISOString()
    },
    {
      id: 'waides-node-asia',
      url: 'https://waides-asia.com/api/lightnet',
      trusted: true,
      last_seen: new Date().toISOString()
    }
  ];

  private broadcastStats: BroadcastStats = {
    total_broadcasts: 0,
    successful_broadcasts: 0,
    failed_broadcasts: 0,
    active_peers: 0,
    last_broadcast_time: new Date().toISOString()
  };

  private nodeId: string = `waides-ki-${Math.random().toString(36).substr(2, 9)}`;

  constructor() {
    console.log('🌍 Lightnet Broadcaster Initialized - Global Vision Network Active');
    
    // Start periodic vision broadcasting every 2 minutes
    setInterval(() => {
      this.broadcastCurrentVision();
    }, 120000);
  }

  /**
   * Broadcast current vision to all trusted peers
   */
  async broadcastCurrentVision(): Promise<void> {
    try {
      // Get current vision from Spirit Oracle (simulated for now)
      const currentVision = this.generateCurrentVision();
      
      if (!currentVision) {
        return; // No vision to broadcast
      }

      console.log(`🌍 Broadcasting vision to ${this.trustedPeers.length} Lightnet peers:`, currentVision.symbol);
      
      const broadcastPromises = this.trustedPeers.map(peer => 
        this.sendVisionToPeer(peer, currentVision)
      );

      const results = await Promise.allSettled(broadcastPromises);
      
      // Update stats
      this.broadcastStats.total_broadcasts++;
      this.broadcastStats.successful_broadcasts += results.filter(r => r.status === 'fulfilled').length;
      this.broadcastStats.failed_broadcasts += results.filter(r => r.status === 'rejected').length;
      this.broadcastStats.last_broadcast_time = new Date().toISOString();
      
      console.log(`📡 Broadcast complete: ${this.broadcastStats.successful_broadcasts}/${this.trustedPeers.length} successful`);
      
    } catch (error) {
      console.error('Error broadcasting vision:', error);
    }
  }

  /**
   * Send vision to specific peer
   */
  private async sendVisionToPeer(peer: WaidesNode, vision: LightnetVision): Promise<boolean> {
    try {
      const response = await fetch(peer.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Waides-Node-ID': this.nodeId
        },
        body: JSON.stringify(vision),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        peer.last_seen = new Date().toISOString();
        return true;
      } else {
        console.warn(`Failed to broadcast to ${peer.id}: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.warn(`Network error broadcasting to ${peer.id}:`, error.message);
      return false;
    }
  }

  /**
   * Generate current vision based on market conditions
   */
  private generateCurrentVision(): LightnetVision | null {
    // Simulate getting current market trend and generating Konslang vision
    const trends = ['UP', 'DOWN', 'SIDEWAYS'] as const;
    const symbols = ['SHAI\'LOR', 'DOM\'KAAN', 'VAED\'UUN', 'MEL\'ZEK', 'KORVEX', 'THALAR'];
    const meanings = [
      'Rising spiritual energy detected',
      'Bearish shadows approaching',
      'Protective forces awakening',
      'Bull spirits gathering strength',
      'Temporal flux stabilizing',
      'Sacred alignment forming'
    ];
    
    const randomTrend = trends[Math.floor(Math.random() * trends.length)];
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const randomMeaning = meanings[Math.floor(Math.random() * meanings.length)];
    
    // Only broadcast if confidence is high enough
    const confidence = Math.random() * 100;
    if (confidence < 65) {
      return null; // Don't broadcast weak signals
    }

    return {
      node_id: this.nodeId,
      symbol: randomSymbol,
      meaning: randomMeaning,
      trend: randomTrend,
      confidence: Math.round(confidence),
      timestamp: new Date().toISOString(),
      konslang_message: `${randomSymbol} reveals: ${randomMeaning}. The sacred path points ${randomTrend.toLowerCase()}.`,
      market_data: {
        price: 2400 + (Math.random() * 100 - 50), // Simulated ETH price
        volume: Math.random() * 50000,
        rsi: Math.random() * 100
      }
    };
  }

  /**
   * Manually broadcast a specific vision
   */
  async broadcastVision(vision: Partial<LightnetVision>): Promise<boolean> {
    const fullVision: LightnetVision = {
      node_id: this.nodeId,
      symbol: vision.symbol || 'UNKNOWN',
      meaning: vision.meaning || 'Manual vision broadcast',
      trend: vision.trend || 'SIDEWAYS',
      confidence: vision.confidence || 75,
      timestamp: new Date().toISOString(),
      konslang_message: vision.konslang_message || `${vision.symbol} vision manually broadcast`,
      market_data: vision.market_data
    };

    try {
      const broadcastPromises = this.trustedPeers.map(peer => 
        this.sendVisionToPeer(peer, fullVision)
      );

      const results = await Promise.allSettled(broadcastPromises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      
      console.log(`📡 Manual broadcast: ${successCount}/${this.trustedPeers.length} successful`);
      
      return successCount > 0;
    } catch (error) {
      console.error('Error in manual broadcast:', error);
      return false;
    }
  }

  /**
   * Add a new trusted peer
   */
  addTrustedPeer(peer: WaidesNode): void {
    if (!this.trustedPeers.find(p => p.id === peer.id)) {
      this.trustedPeers.push(peer);
      console.log(`🤝 Added trusted peer: ${peer.id}`);
    }
  }

  /**
   * Remove a peer
   */
  removePeer(nodeId: string): void {
    this.trustedPeers = this.trustedPeers.filter(p => p.id !== nodeId);
    console.log(`🚫 Removed peer: ${nodeId}`);
  }

  /**
   * Get broadcast statistics
   */
  getBroadcastStats(): BroadcastStats & { peers: WaidesNode[] } {
    this.broadcastStats.active_peers = this.trustedPeers.filter(p => p.trusted).length;
    
    return {
      ...this.broadcastStats,
      peers: this.trustedPeers
    };
  }

  /**
   * Test connectivity to all peers
   */
  async testPeerConnectivity(): Promise<{ [nodeId: string]: boolean }> {
    const testVision: LightnetVision = {
      node_id: this.nodeId,
      symbol: 'TEST',
      meaning: 'Connectivity test',
      trend: 'SIDEWAYS',
      confidence: 100,
      timestamp: new Date().toISOString(),
      konslang_message: 'Testing lightnet connection...'
    };

    const results: { [nodeId: string]: boolean } = {};
    
    for (const peer of this.trustedPeers) {
      try {
        const success = await this.sendVisionToPeer(peer, testVision);
        results[peer.id] = success;
      } catch (error) {
        results[peer.id] = false;
      }
    }

    return results;
  }

  /**
   * Get node ID
   */
  getNodeId(): string {
    return this.nodeId;
  }

  /**
   * Update peer status
   */
  updatePeerStatus(nodeId: string, status: Partial<WaidesNode>): void {
    const peer = this.trustedPeers.find(p => p.id === nodeId);
    if (peer) {
      Object.assign(peer, status);
    }
  }
}