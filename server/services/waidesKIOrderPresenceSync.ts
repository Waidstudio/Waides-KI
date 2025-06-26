/**
 * MODULE 6 — Distributed Sync for Order Presence
 * Broadcast & gather peer presence for consensus decisions
 */

import { waidesKIETHOrderPresenceRegistry } from './waidesKIETHOrderPresenceRegistry.js';

interface PeerNode {
  url: string;
  last_sync: Date;
  status: 'active' | 'inactive' | 'error';
  sync_count: number;
}

export class WaidesKIOrderPresenceSync {
  private peers: Map<string, PeerNode> = new Map();
  private broadcastInterval: NodeJS.Timeout | null = null;
  private syncHistory: any[] = [];
  private maxSyncHistory = 100;
  private isRunning = false;

  constructor() {
    this.initializePeers();
    this.startPeriodicBroadcast();
  }

  /**
   * Initialize peer node list
   */
  private initializePeers(): void {
    // Example peer nodes - in production, these would be actual Waides KI nodes
    const defaultPeers = [
      'https://waides-node-01.replit.app/api/order_presence',
      'https://waides-node-02.replit.app/api/order_presence',
      'https://waides-node-03.replit.app/api/order_presence'
    ];

    defaultPeers.forEach(url => {
      this.peers.set(url, {
        url,
        last_sync: new Date(0),
        status: 'inactive',
        sync_count: 0
      });
    });

    console.log(`📡 Initialized ${this.peers.size} peer nodes for order presence sync`);
  }

  /**
   * Start periodic broadcasting to peers
   */
  private startPeriodicBroadcast(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Broadcast every 5 seconds
    this.broadcastInterval = setInterval(() => {
      this.broadcastOrderPresence();
    }, 5000);

    console.log('🔄 Started periodic order presence broadcasting');
  }

  /**
   * Broadcast current order presence to all peers
   */
  private async broadcastOrderPresence(): Promise<void> {
    const data = waidesKIETHOrderPresenceRegistry.exportForSync();
    
    // Add broadcast metadata
    const broadcastData = {
      ...data,
      broadcast_time: Date.now(),
      source_node: 'waides-ki-main',
      sync_version: '1.0'
    };

    const promises = Array.from(this.peers.keys()).map(peerUrl => 
      this.sendToPeer(peerUrl, broadcastData)
    );

    // Execute all broadcasts in parallel
    const results = await Promise.allSettled(promises);
    
    // Update peer statuses based on results
    results.forEach((result, index) => {
      const peerUrl = Array.from(this.peers.keys())[index];
      const peer = this.peers.get(peerUrl);
      
      if (peer) {
        if (result.status === 'fulfilled') {
          peer.status = 'active';
          peer.sync_count++;
          peer.last_sync = new Date();
        } else {
          peer.status = 'error';
        }
        this.peers.set(peerUrl, peer);
      }
    });

    // Log successful syncs
    const activePeers = Array.from(this.peers.values()).filter(p => p.status === 'active').length;
    if (activePeers > 0) {
      console.log(`📡 Broadcasted order presence to ${activePeers} active peers`);
    }
  }

  /**
   * Send data to individual peer
   */
  private async sendToPeer(peerUrl: string, data: any): Promise<any> {
    try {
      const response = await fetch(peerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WaidesKI-OrderPresence-Sync/1.0'
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`📡 Peer sync failed for ${peerUrl}: ${error}`);
      throw error;
    }
  }

  /**
   * Receive order presence from peer (for API endpoint)
   */
  receiveOrderPresence(peerData: any): {
    status: string;
    imported: boolean;
    message: string;
  } {
    try {
      // Validate peer data
      if (!peerData || !peerData.pressure || !peerData.node_id) {
        return {
          status: 'error',
          imported: false,
          message: 'Invalid peer data format'
        };
      }

      // Import if newer
      const imported = waidesKIETHOrderPresenceRegistry.importFromSync(peerData);
      
      // Record sync event
      this.syncHistory.push({
        timestamp: new Date(),
        source_node: peerData.node_id,
        pressure: peerData.pressure,
        imported,
        confidence: peerData.confidence || 0
      });

      // Keep history manageable
      if (this.syncHistory.length > this.maxSyncHistory) {
        this.syncHistory.shift();
      }

      return {
        status: 'ok',
        imported,
        message: imported ? 'Order presence updated from peer' : 'Local data is newer'
      };

    } catch (error) {
      console.error('❌ Error receiving peer order presence:', error);
      return {
        status: 'error',
        imported: false,
        message: 'Failed to process peer data'
      };
    }
  }

  /**
   * Get consensus from multiple peers
   */
  async gatherPeerConsensus(): Promise<{
    consensus_pressure: string;
    peer_count: number;
    confidence_average: number;
    agreement_level: number;
    peer_responses: any[];
  }> {
    const peerResponses = [];
    const activePeers = Array.from(this.peers.entries())
      .filter(([_, peer]) => peer.status === 'active');

    // Query each active peer for their current state
    for (const [url, peer] of activePeers) {
      try {
        const queryUrl = url.replace('/order_presence', '/order_presence/current');
        const response = await fetch(queryUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(1500)
        });

        if (response.ok) {
          const peerState = await response.json();
          peerResponses.push({
            node_url: url,
            pressure: peerState.pressure,
            confidence: peerState.confidence || 50,
            timestamp: peerState.timestamp
          });
        }
      } catch (error) {
        // Peer not responding, skip
      }
    }

    // Calculate consensus
    if (peerResponses.length === 0) {
      return {
        consensus_pressure: 'unknown',
        peer_count: 0,
        confidence_average: 0,
        agreement_level: 0,
        peer_responses: []
      };
    }

    // Find most common pressure
    const pressureCounts = peerResponses.reduce((counts, response) => {
      counts[response.pressure] = (counts[response.pressure] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const consensus_pressure = Object.keys(pressureCounts)
      .reduce((a, b) => pressureCounts[a] > pressureCounts[b] ? a : b);

    const confidence_average = peerResponses
      .reduce((sum, r) => sum + r.confidence, 0) / peerResponses.length;

    const agreement_level = (pressureCounts[consensus_pressure] / peerResponses.length) * 100;

    return {
      consensus_pressure,
      peer_count: peerResponses.length,
      confidence_average: Math.round(confidence_average),
      agreement_level: Math.round(agreement_level),
      peer_responses: peerResponses
    };
  }

  /**
   * Add new peer node
   */
  addPeer(peerUrl: string): boolean {
    try {
      if (this.peers.has(peerUrl)) {
        return false; // Already exists
      }

      this.peers.set(peerUrl, {
        url: peerUrl,
        last_sync: new Date(0),
        status: 'inactive',
        sync_count: 0
      });

      console.log(`📡 Added new peer: ${peerUrl}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to add peer ${peerUrl}:`, error);
      return false;
    }
  }

  /**
   * Remove peer node
   */
  removePeer(peerUrl: string): boolean {
    if (this.peers.delete(peerUrl)) {
      console.log(`📡 Removed peer: ${peerUrl}`);
      return true;
    }
    return false;
  }

  /**
   * Get peer network status
   */
  getPeerNetworkStatus(): {
    total_peers: number;
    active_peers: number;
    sync_health: string;
    recent_syncs: any[];
    peer_details: any[];
  } {
    const peerArray = Array.from(this.peers.values());
    const activePeers = peerArray.filter(p => p.status === 'active');
    
    let sync_health = 'poor';
    if (activePeers.length > 0) sync_health = 'good';
    if (activePeers.length >= 2) sync_health = 'excellent';

    return {
      total_peers: this.peers.size,
      active_peers: activePeers.length,
      sync_health,
      recent_syncs: this.syncHistory.slice(-10),
      peer_details: peerArray.map(peer => ({
        url: peer.url,
        status: peer.status,
        sync_count: peer.sync_count,
        last_sync: peer.last_sync,
        minutes_since_sync: Math.round((Date.now() - peer.last_sync.getTime()) / 60000)
      }))
    };
  }

  /**
   * Get sync statistics
   */
  getSyncStatistics(): {
    broadcasting_active: boolean;
    total_broadcasts: number;
    successful_syncs: number;
    failed_syncs: number;
    consensus_history: any[];
    sync_performance: any;
  } {
    const totalBroadcasts = Array.from(this.peers.values())
      .reduce((sum, peer) => sum + peer.sync_count, 0);

    const successfulSyncs = this.syncHistory.filter(s => s.imported).length;
    const failedSyncs = this.syncHistory.length - successfulSyncs;

    // Recent consensus analysis
    const recentConsensus = this.syncHistory.slice(-10).map(sync => ({
      timestamp: sync.timestamp,
      source: sync.source_node,
      pressure: sync.pressure,
      confidence: sync.confidence
    }));

    return {
      broadcasting_active: this.isRunning,
      total_broadcasts: totalBroadcasts,
      successful_syncs: successfulSyncs,
      failed_syncs: failedSyncs,
      consensus_history: recentConsensus,
      sync_performance: {
        success_rate: this.syncHistory.length > 0 ? 
          Math.round((successfulSyncs / this.syncHistory.length) * 100) : 0,
        average_peers_responding: this.peers.size > 0 ? 
          Array.from(this.peers.values()).filter(p => p.status === 'active').length : 0
      }
    };
  }

  /**
   * Stop peer synchronization
   */
  stop(): void {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Order presence peer sync stopped');
  }

  /**
   * Restart peer synchronization
   */
  restart(): void {
    this.stop();
    this.startPeriodicBroadcast();
  }
}

export const waidesKIOrderPresenceSync = new WaidesKIOrderPresenceSync();