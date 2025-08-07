/**
 * KonsMesh Reliability Layer - Heartbeat, Retry, Timeout & Monitoring
 * Ensures robust mesh communication with fault tolerance
 */

import { EventEmitter } from 'events';

export interface HeartbeatStatus {
  entityId: string;
  lastHeartbeat: number;
  status: 'alive' | 'warning' | 'dead' | 'recovering';
  consecutiveFailures: number;
  averageLatency: number;
  networkHealth: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  timeoutMs: number;
}

export interface MeshMessage {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: 'signal' | 'heartbeat' | 'broadcast' | 'response';
  payload: any;
  timestamp: number;
  retryCount: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  requiresAck: boolean;
}

export interface LatencyMetrics {
  entityId: string;
  averageLatency: number;
  minLatency: number;
  maxLatency: number;
  p95Latency: number;
  p99Latency: number;
  measurementCount: number;
  lastUpdated: number;
}

export interface LoadBalancingStatus {
  totalLoad: number;
  entityLoads: Map<string, number>;
  overloadThreshold: number;
  isOverloaded: boolean;
  balancingStrategy: 'round_robin' | 'least_loaded' | 'spiritual_weight';
}

export class KonsAiMeshReliabilityLayer extends EventEmitter {
  private heartbeatStatuses = new Map<string, HeartbeatStatus>();
  private pendingMessages = new Map<string, MeshMessage>();
  private messageQueue = new Map<string, MeshMessage[]>();
  private latencyMetrics = new Map<string, LatencyMetrics>();
  private loadMetrics = new Map<string, number>();
  
  private heartbeatInterval = 30000; // 30 seconds
  private heartbeatTimeout = 90000;  // 90 seconds
  private maxQueueSize = 1000;
  private overloadThreshold = 0.8;
  
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    timeoutMs: 10000
  };

  constructor() {
    super();
    this.initializeReliability();
    console.log('💪 KonsAi Mesh Reliability Layer initialized - Fault tolerance active');
  }

  /**
   * Initialize reliability systems
   */
  private initializeReliability(): void {
    const entities = [
      'waidbot_alpha',
      'waidbot_pro_beta', 
      'autonomous_gamma',
      'full_engine_omega',
      'smai_chinnikstah_delta',
      'nwaora_chigozie_epsilon'
    ];

    // Initialize heartbeat tracking for all entities
    entities.forEach(entityId => {
      this.heartbeatStatuses.set(entityId, {
        entityId,
        lastHeartbeat: Date.now(),
        status: 'alive',
        consecutiveFailures: 0,
        averageLatency: 0,
        networkHealth: 1.0
      });

      this.messageQueue.set(entityId, []);
      this.loadMetrics.set(entityId, 0);
      
      this.latencyMetrics.set(entityId, {
        entityId,
        averageLatency: 0,
        minLatency: 0,
        maxLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        measurementCount: 0,
        lastUpdated: Date.now()
      });
    });

    this.startHeartbeatMonitoring();
    this.startLoadMonitoring();
    this.startMessageProcessing();
  }

  /**
   * Start heartbeat monitoring across mesh peers
   */
  private startHeartbeatMonitoring(): void {
    setInterval(() => {
      this.checkAllHeartbeats();
      this.sendHeartbeats();
    }, this.heartbeatInterval);

    console.log('💓 Heartbeat monitoring started');
  }

  /**
   * Check heartbeat status for all entities
   */
  private checkAllHeartbeats(): void {
    const now = Date.now();
    
    for (const [entityId, status] of Array.from(this.heartbeatStatuses.entries())) {
      const timeSinceLastHeartbeat = now - status.lastHeartbeat;
      
      if (timeSinceLastHeartbeat > this.heartbeatTimeout) {
        if (status.status !== 'dead') {
          status.consecutiveFailures++;
          
          if (status.consecutiveFailures >= 3) {
            status.status = 'dead';
            this.emit('entityDead', { entityId, lastSeen: status.lastHeartbeat });
            console.log(`💔 Entity marked as dead: ${entityId}`);
          } else {
            status.status = 'warning';
            this.emit('entityWarning', { entityId, consecutiveFailures: status.consecutiveFailures });
          }
        }
      } else if (timeSinceLastHeartbeat < this.heartbeatInterval * 1.5) {
        if (status.status !== 'alive') {
          status.status = 'alive';
          status.consecutiveFailures = 0;
          this.emit('entityRecovered', { entityId });
          console.log(`💚 Entity recovered: ${entityId}`);
        }
      }

      // Update network health score
      status.networkHealth = this.calculateNetworkHealth(status);
    }
  }

  /**
   * Send heartbeats to all entities
   */
  private sendHeartbeats(): void {
    for (const entityId of Array.from(this.heartbeatStatuses.keys())) {
      const heartbeatMessage: MeshMessage = {
        id: this.generateMessageId(),
        fromEntityId: 'mesh_reliability',
        toEntityId: entityId,
        type: 'heartbeat',
        payload: { timestamp: Date.now() },
        timestamp: Date.now(),
        retryCount: 0,
        priority: 'high',
        requiresAck: true
      };

      this.sendMessageWithRetry(heartbeatMessage);
    }
  }

  /**
   * Receive heartbeat from entity
   */
  public receiveHeartbeat(entityId: string, latency: number): void {
    const status = this.heartbeatStatuses.get(entityId);
    if (status) {
      status.lastHeartbeat = Date.now();
      status.consecutiveFailures = 0;
      status.averageLatency = (status.averageLatency * 0.9) + (latency * 0.1); // Moving average
      
      if (status.status === 'dead' || status.status === 'warning') {
        status.status = 'recovering';
      } else {
        status.status = 'alive';
      }

      this.updateLatencyMetrics(entityId, latency);
    }
  }

  /**
   * Send message with retry mechanism
   */
  public async sendMessageWithRetry(message: MeshMessage, customConfig?: Partial<RetryConfig>): Promise<boolean> {
    const config = { ...this.defaultRetryConfig, ...customConfig };
    const startTime = Date.now();
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        message.retryCount = attempt;
        const success = await this.attemptSend(message, config.timeoutMs);
        
        if (success) {
          const latency = Date.now() - startTime;
          this.updateLatencyMetrics(message.toEntityId, latency);
          this.emit('messageSent', { messageId: message.id, entityId: message.toEntityId, latency });
          return true;
        }
      } catch (error) {
        console.log(`🔄 Message send attempt ${attempt + 1}/${config.maxRetries + 1} failed: ${message.id}`);
        
        if (attempt < config.maxRetries) {
          const delay = Math.min(
            config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
            config.maxDelay
          );
          await this.delay(delay);
        }
      }
    }

    this.emit('messageFailed', { messageId: message.id, entityId: message.toEntityId });
    console.log(`❌ Message failed after all retries: ${message.id}`);
    return false;
  }

  /**
   * Attempt to send single message with timeout
   */
  private async attemptSend(message: MeshMessage, timeoutMs: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Message timeout: ${message.id}`));
      }, timeoutMs);

      // Simulate message sending (replace with actual implementation)
      const entityStatus = this.heartbeatStatuses.get(message.toEntityId);
      const simulatedLatency = entityStatus?.averageLatency || 100;
      
      setTimeout(() => {
        clearTimeout(timeout);
        
        // Success probability based on entity health
        const successProbability = entityStatus?.networkHealth || 0.5;
        const success = Math.random() < successProbability;
        
        if (success) {
          resolve(true);
        } else {
          reject(new Error(`Send failed: ${message.id}`));
        }
      }, simulatedLatency);
    });
  }

  /**
   * Detect mesh timeouts for specific entity
   */
  public detectMeshTimeout(entityId: string): boolean {
    const status = this.heartbeatStatuses.get(entityId);
    if (!status) return true;

    const now = Date.now();
    const timeSinceLastHeartbeat = now - status.lastHeartbeat;
    
    return timeSinceLastHeartbeat > this.heartbeatTimeout;
  }

  /**
   * Update latency metrics
   */
  private updateLatencyMetrics(entityId: string, latency: number): void {
    const metrics = this.latencyMetrics.get(entityId);
    if (!metrics) return;

    metrics.measurementCount++;
    metrics.lastUpdated = Date.now();
    
    // Update min/max
    if (metrics.measurementCount === 1) {
      metrics.minLatency = metrics.maxLatency = latency;
    } else {
      metrics.minLatency = Math.min(metrics.minLatency, latency);
      metrics.maxLatency = Math.max(metrics.maxLatency, latency);
    }

    // Update moving average
    metrics.averageLatency = (metrics.averageLatency * 0.9) + (latency * 0.1);

    // Update percentiles (simplified calculation)
    metrics.p95Latency = metrics.averageLatency * 1.5;
    metrics.p99Latency = metrics.averageLatency * 2.0;
  }

  /**
   * Track signal latencies across mesh
   */
  public getSignalLatencies(): Map<string, LatencyMetrics> {
    return new Map(this.latencyMetrics);
  }

  /**
   * Handle mesh overload gracefully
   */
  private handleMeshOverload(): void {
    const loadStatus = this.getLoadBalancingStatus();
    
    if (loadStatus.isOverloaded) {
      console.log('⚠️ Mesh overload detected - implementing graceful degradation');
      
      // Prioritize critical messages
      this.prioritizeMessages();
      
      // Reduce heartbeat frequency
      this.heartbeatInterval = 60000; // Increase to 60 seconds
      
      // Drop low-priority messages
      this.dropLowPriorityMessages();
      
      this.emit('meshOverload', { loadStatus, timestamp: Date.now() });
    } else {
      // Restore normal operations
      this.heartbeatInterval = 30000; // Back to 30 seconds
    }
  }

  /**
   * Get load balancing status
   */
  public getLoadBalancingStatus(): LoadBalancingStatus {
    const totalLoad = Array.from(this.loadMetrics.values()).reduce((sum, load) => sum + load, 0);
    const avgLoad = totalLoad / this.loadMetrics.size;
    
    return {
      totalLoad,
      entityLoads: new Map(this.loadMetrics),
      overloadThreshold: this.overloadThreshold,
      isOverloaded: avgLoad > this.overloadThreshold,
      balancingStrategy: 'least_loaded'
    };
  }

  /**
   * Get comprehensive reliability status
   */
  public getReliabilityStatus(): any {
    return {
      heartbeatStatuses: Object.fromEntries(this.heartbeatStatuses),
      latencyMetrics: Object.fromEntries(this.latencyMetrics),
      loadBalancing: this.getLoadBalancingStatus(),
      pendingMessages: this.pendingMessages.size,
      queueSizes: Object.fromEntries(
        Array.from(this.messageQueue.entries()).map(([id, queue]) => [id, queue.length])
      ),
      systemHealth: this.calculateSystemHealth()
    };
  }

  // Helper methods
  private calculateNetworkHealth(status: HeartbeatStatus): number {
    const failurePenalty = status.consecutiveFailures * 0.1;
    const latencyPenalty = Math.max(0, (status.averageLatency - 100) / 1000);
    return Math.max(0, 1.0 - failurePenalty - latencyPenalty);
  }

  private calculateSystemHealth(): number {
    const healthScores = Array.from(this.heartbeatStatuses.values())
      .map(status => status.networkHealth);
    return healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
  }

  private startLoadMonitoring(): void {
    setInterval(() => {
      this.updateLoadMetrics();
      this.handleMeshOverload();
    }, 10000); // Every 10 seconds
  }

  private startMessageProcessing(): void {
    setInterval(() => {
      this.processMessageQueues();
    }, 1000); // Every second
  }

  private updateLoadMetrics(): void {
    for (const [entityId, queue] of Array.from(this.messageQueue.entries())) {
      const load = queue.length / this.maxQueueSize;
      this.loadMetrics.set(entityId, load);
    }
  }

  private processMessageQueues(): void {
    for (const [entityId, queue] of Array.from(this.messageQueue.entries())) {
      if (queue.length > 0) {
        const message = queue.shift()!;
        this.sendMessageWithRetry(message);
      }
    }
  }

  private prioritizeMessages(): void {
    for (const queue of Array.from(this.messageQueue.values())) {
      queue.sort((a: MeshMessage, b: MeshMessage) => {
        const priorityOrder: Record<string, number> = { 'critical': 4, 'high': 3, 'normal': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    }
  }

  private dropLowPriorityMessages(): void {
    for (const queue of Array.from(this.messageQueue.values())) {
      const originalLength = queue.length;
      const filteredQueue = queue.filter((msg: MeshMessage) => msg.priority !== 'low');
      if (filteredQueue.length < originalLength) {
        queue.length = 0;
        queue.push(...filteredQueue);
      }
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
let meshReliabilityInstance: KonsAiMeshReliabilityLayer | null = null;

export function getKonsAiMeshReliability(): KonsAiMeshReliabilityLayer {
  if (!meshReliabilityInstance) {
    meshReliabilityInstance = new KonsAiMeshReliabilityLayer();
  }
  return meshReliabilityInstance;
}