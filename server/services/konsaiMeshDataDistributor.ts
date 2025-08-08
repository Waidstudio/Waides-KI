/**
 * KonsAi Mesh Data Distributor - Real-time Data Broadcasting
 * Manages real-time distribution of ETH price, market data, and system updates to all connected entities
 */

import { EventEmitter } from 'events';
import { ethMonitor, EthPriceData } from './ethMonitor';
import { getKonsAiMeshControlCenter } from './konsaiMeshControlCenter';

export interface MeshDataUpdate {
  type: 'ETH_PRICE' | 'MARKET_DATA' | 'SYSTEM_ALERT' | 'BOT_STATUS' | 'TRADING_SIGNAL';
  timestamp: number;
  data: any;
  source: string;
  priority: 'low' | 'normal' | 'high' | 'critical' | 'divine';
  targetEntities?: string[];
  requiresBroadcast: boolean;
}

export interface SubscriptionFilter {
  dataTypes: string[];
  entityId?: string;
  priority?: string;
  customFilter?: (update: MeshDataUpdate) => boolean;
}

export class KonsAiMeshDataDistributor extends EventEmitter {
  private activeSubscriptions = new Map<string, SubscriptionFilter>();
  private lastEthPrice: EthPriceData | null = null;
  private ethPriceUpdateInterval: NodeJS.Timeout | null = null;
  private dataUpdateHistory = new Map<string, MeshDataUpdate[]>();
  private maxHistorySize = 100;
  private isActive = false;

  constructor() {
    super();
    this.initializeDistributor();
  }

  /**
   * Initialize the data distributor
   */
  private initializeDistributor(): void {
    if (this.isActive) return;

    console.log('🌐 KonsAi Mesh Data Distributor initializing...');
    
    // Start ETH price monitoring and distribution
    this.startEthPriceMonitoring();
    
    // Setup mesh integration
    this.setupMeshIntegration();
    
    this.isActive = true;
    console.log('🌐 KonsAi Mesh Data Distributor active - Real-time data distribution enabled');
  }

  /**
   * Start continuous ETH price monitoring
   */
  private startEthPriceMonitoring(): void {
    // Initial fetch
    this.fetchAndDistributeEthPrice();

    // Set up continuous monitoring (every 10 seconds)
    this.ethPriceUpdateInterval = setInterval(async () => {
      await this.fetchAndDistributeEthPrice();
    }, 10000);

    console.log('📊 ETH price monitoring started - Updates every 10 seconds');
  }

  /**
   * Fetch and distribute ETH price data
   */
  private async fetchAndDistributeEthPrice(): Promise<void> {
    try {
      const ethData = await ethMonitor.fetchEthData();
      
      // Check if price actually changed
      if (this.lastEthPrice && Math.abs(ethData.price - this.lastEthPrice.price) < 0.01) {
        return; // No significant change, skip update
      }

      this.lastEthPrice = ethData;

      // Create mesh data update
      const update: MeshDataUpdate = {
        type: 'ETH_PRICE',
        timestamp: Date.now(),
        data: ethData,
        source: 'ethMonitor',
        priority: 'high',
        requiresBroadcast: true
      };

      // Distribute to all subscribers
      await this.distributeUpdate(update);
      
      // Store in history
      this.addToHistory('ETH_PRICE', update);

      console.log(`💰 ETH price distributed: $${ethData.price.toFixed(2)} (${ethData.priceChange24h?.toFixed(2)}%)`);
      
    } catch (error) {
      console.error('❌ Failed to fetch and distribute ETH price:', error);
    }
  }

  /**
   * Setup integration with KonsMesh Control Center
   */
  private setupMeshIntegration(): void {
    try {
      const meshControlCenter = getKonsAiMeshControlCenter();
      
      // Listen for system-wide operations
      meshControlCenter.on('systemOperation', (operation) => {
        const update: MeshDataUpdate = {
          type: 'SYSTEM_ALERT',
          timestamp: Date.now(),
          data: operation,
          source: 'meshControlCenter',
          priority: 'critical',
          requiresBroadcast: true
        };
        
        this.distributeUpdate(update);
      });

      console.log('🔗 Mesh integration established');
    } catch (error) {
      console.error('❌ Failed to setup mesh integration:', error);
    }
  }

  /**
   * Subscribe to data updates
   */
  public subscribe(subscriptionId: string, filter: SubscriptionFilter): void {
    this.activeSubscriptions.set(subscriptionId, filter);
    
    // Send current ETH price immediately to new subscriber
    if (filter.dataTypes.includes('ETH_PRICE') && this.lastEthPrice) {
      const update: MeshDataUpdate = {
        type: 'ETH_PRICE',
        timestamp: Date.now(),
        data: this.lastEthPrice,
        source: 'ethMonitor',
        priority: 'normal',
        requiresBroadcast: false
      };
      
      this.emit('dataUpdate', subscriptionId, update);
    }

    console.log(`📡 Subscription added: ${subscriptionId} for ${filter.dataTypes.join(', ')}`);
  }

  /**
   * Unsubscribe from data updates
   */
  public unsubscribe(subscriptionId: string): void {
    this.activeSubscriptions.delete(subscriptionId);
    console.log(`📡 Subscription removed: ${subscriptionId}`);
  }

  /**
   * Distribute update to all matching subscribers
   */
  private async distributeUpdate(update: MeshDataUpdate): Promise<void> {
    const matchingSubscriptions: string[] = [];

    for (const [subscriptionId, filter] of this.activeSubscriptions) {
      if (this.matchesFilter(update, filter)) {
        matchingSubscriptions.push(subscriptionId);
        this.emit('dataUpdate', subscriptionId, update);
      }
    }

    // Broadcast to mesh network if required
    if (update.requiresBroadcast) {
      await this.broadcastToMesh(update);
    }

    console.log(`📢 Update distributed to ${matchingSubscriptions.length} subscribers`);
  }

  /**
   * Check if update matches subscription filter
   */
  private matchesFilter(update: MeshDataUpdate, filter: SubscriptionFilter): boolean {
    // Check data type
    if (!filter.dataTypes.includes(update.type)) {
      return false;
    }

    // Check priority if specified
    if (filter.priority && update.priority !== filter.priority) {
      return false;
    }

    // Check custom filter
    if (filter.customFilter && !filter.customFilter(update)) {
      return false;
    }

    return true;
  }

  /**
   * Broadcast update to mesh network
   */
  private async broadcastToMesh(update: MeshDataUpdate): Promise<void> {
    try {
      const meshControlCenter = getKonsAiMeshControlCenter();
      
      const entities = [
        'waidbot_alpha',
        'waidbot_pro_beta', 
        'autonomous_gamma',
        'full_engine_omega',
        'smai_chinnikstah_delta',
        'nwaora_chigozie_epsilon'
      ];

      for (const entityId of entities) {
        await meshControlCenter.sendSecureMessage({
          fromEntity: 'meshDataDistributor',
          toEntity: entityId,
          messageType: 'DATA_UPDATE',
          payload: update,
          priority: update.priority,
          requiresAuth: false,
          contractName: 'EntityTradingProtocol'
        });
      }

    } catch (error) {
      console.error('❌ Failed to broadcast to mesh:', error);
    }
  }

  /**
   * Add update to history
   */
  private addToHistory(type: string, update: MeshDataUpdate): void {
    if (!this.dataUpdateHistory.has(type)) {
      this.dataUpdateHistory.set(type, []);
    }

    const history = this.dataUpdateHistory.get(type)!;
    history.push(update);

    // Keep only recent updates
    if (history.length > this.maxHistorySize) {
      history.splice(0, history.length - this.maxHistorySize);
    }
  }

  /**
   * Get current ETH price
   */
  public getCurrentEthPrice(): EthPriceData | null {
    return this.lastEthPrice;
  }

  /**
   * Get data update history
   */
  public getUpdateHistory(type?: string): MeshDataUpdate[] {
    if (type) {
      return this.dataUpdateHistory.get(type) || [];
    }
    
    const allUpdates: MeshDataUpdate[] = [];
    for (const updates of this.dataUpdateHistory.values()) {
      allUpdates.push(...updates);
    }
    
    return allUpdates.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get active subscriptions count
   */
  public getSubscriptionCount(): number {
    return this.activeSubscriptions.size;
  }

  /**
   * Shutdown the distributor
   */
  public shutdown(): void {
    if (this.ethPriceUpdateInterval) {
      clearInterval(this.ethPriceUpdateInterval);
      this.ethPriceUpdateInterval = null;
    }

    this.activeSubscriptions.clear();
    this.isActive = false;
    
    console.log('🌐 KonsAi Mesh Data Distributor shutdown complete');
  }
}

// Export singleton instance
let meshDataDistributor: KonsAiMeshDataDistributor | null = null;

export function getKonsAiMeshDataDistributor(): KonsAiMeshDataDistributor {
  if (!meshDataDistributor) {
    meshDataDistributor = new KonsAiMeshDataDistributor();
  }
  return meshDataDistributor;
}

export { meshDataDistributor };