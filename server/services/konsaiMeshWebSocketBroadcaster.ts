/**
 * KonsAi Mesh WebSocket Broadcaster - Real-time Client Communication
 * Broadcasts KonsMesh data updates to all connected web clients via WebSocket
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { getKonsAiMeshDataDistributor, MeshDataUpdate } from './konsaiMeshDataDistributor';
import { v4 as uuidv4 } from 'uuid';

export interface WebSocketClient {
  id: string;
  socket: WebSocket;
  subscriptions: string[];
  lastSeen: number;
  isAlive: boolean;
}

export interface ClientSubscription {
  clientId: string;
  dataTypes: string[];
  filters?: {
    minPriceChange?: number;
    maxUpdateFrequency?: number;
  };
}

export class KonsAiMeshWebSocketBroadcaster {
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, WebSocketClient>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private meshDataDistributor = getKonsAiMeshDataDistributor();
  private isInitialized = false;

  /**
   * Initialize WebSocket broadcaster with HTTP server
   */
  public initialize(server: Server): void {
    if (this.isInitialized) return;

    this.wss = new WebSocketServer({ server, path: '/ws' });
    
    this.wss.on('connection', (ws, req) => {
      this.handleNewConnection(ws, req);
    });

    // Setup mesh data subscription
    this.setupMeshDataSubscription();
    
    // Start heartbeat monitoring
    this.startHeartbeatMonitoring();
    
    this.isInitialized = true;
    console.log('🔌 KonsAi Mesh WebSocket Broadcaster initialized');
  }

  /**
   * Handle new WebSocket connection
   */
  private handleNewConnection(ws: WebSocket, req: any): void {
    const clientId = uuidv4();
    
    const client: WebSocketClient = {
      id: clientId,
      socket: ws,
      subscriptions: ['ETH_PRICE', 'SYSTEM_ALERT'], // Default subscriptions
      lastSeen: Date.now(),
      isAlive: true
    };

    this.clients.set(clientId, client);
    
    // Setup client message handlers
    ws.on('message', (data) => {
      this.handleClientMessage(clientId, data);
    });

    ws.on('close', () => {
      this.handleClientDisconnection(clientId);
    });

    ws.on('error', (error) => {
      console.error(`❌ WebSocket error for client ${clientId}:`, error);
      this.handleClientDisconnection(clientId);
    });

    // Setup heartbeat for this client
    ws.on('pong', () => {
      const client = this.clients.get(clientId);
      if (client) {
        client.isAlive = true;
        client.lastSeen = Date.now();
      }
    });

    // Send current ETH price immediately
    const currentEthPrice = this.meshDataDistributor.getCurrentEthPrice();
    if (currentEthPrice) {
      this.sendToClient(clientId, {
        type: 'ETH_PRICE',
        timestamp: Date.now(),
        data: currentEthPrice,
        source: 'initial',
        priority: 'normal',
        requiresBroadcast: false
      });
    }

    console.log(`🔗 New WebSocket client connected: ${clientId} (${req.socket.remoteAddress})`);
  }

  /**
   * Handle client disconnection
   */
  private handleClientDisconnection(clientId: string): void {
    this.clients.delete(clientId);
    console.log(`🔌 WebSocket client disconnected: ${clientId}`);
  }

  /**
   * Handle messages from clients
   */
  private handleClientMessage(clientId: string, data: any): void {
    try {
      const message = JSON.parse(data.toString());
      const client = this.clients.get(clientId);
      
      if (!client) return;

      switch (message.type) {
        case 'SUBSCRIBE':
          this.handleClientSubscription(clientId, message.payload);
          break;
          
        case 'UNSUBSCRIBE':
          this.handleClientUnsubscription(clientId, message.payload);
          break;
          
        case 'PING':
          client.lastSeen = Date.now();
          this.sendToClient(clientId, { type: 'PONG', timestamp: Date.now() });
          break;
          
        default:
          console.warn(`❓ Unknown message type from client ${clientId}: ${message.type}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to parse message from client ${clientId}:`, error);
    }
  }

  /**
   * Handle client subscription requests
   */
  private handleClientSubscription(clientId: string, subscription: ClientSubscription): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Update client subscriptions
    const existingSet = new Set(client.subscriptions);
    subscription.dataTypes.forEach(dataType => existingSet.add(dataType));
    client.subscriptions = Array.from(existingSet);
    
    console.log(`📡 Client ${clientId} subscribed to: ${subscription.dataTypes.join(', ')}`);
  }

  /**
   * Handle client unsubscription requests
   */
  private handleClientUnsubscription(clientId: string, dataTypes: string[]): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.subscriptions = client.subscriptions.filter(sub => !dataTypes.includes(sub));
    
    console.log(`📡 Client ${clientId} unsubscribed from: ${dataTypes.join(', ')}`);
  }

  /**
   * Setup subscription to mesh data updates
   */
  private setupMeshDataSubscription(): void {
    this.meshDataDistributor.subscribe('websocketBroadcaster', {
      dataTypes: ['ETH_PRICE', 'MARKET_DATA', 'SYSTEM_ALERT', 'BOT_STATUS', 'TRADING_SIGNAL']
    });

    this.meshDataDistributor.on('dataUpdate', (subscriptionId: string, update: MeshDataUpdate) => {
      if (subscriptionId === 'websocketBroadcaster') {
        this.broadcastToClients(update);
      }
    });

    console.log('📡 Mesh data subscription established');
  }

  /**
   * Broadcast update to all relevant clients
   */
  private broadcastToClients(update: MeshDataUpdate): void {
    let broadcastCount = 0;

    this.clients.forEach((client, clientId) => {
      if (client.subscriptions.includes(update.type)) {
        this.sendToClient(clientId, update);
        broadcastCount++;
      }
    });

    console.log(`📢 Broadcasted ${update.type} to ${broadcastCount} WebSocket clients`);
  }

  /**
   * Send data to specific client
   */
  private sendToClient(clientId: string, data: any): void {
    const client = this.clients.get(clientId);
    if (!client || client.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      client.socket.send(JSON.stringify(data));
    } catch (error) {
      console.error(`❌ Failed to send data to client ${clientId}:`, error);
      this.handleClientDisconnection(clientId);
    }
  }

  /**
   * Start heartbeat monitoring for all clients
   */
  private startHeartbeatMonitoring(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          console.log(`💔 Terminating inactive client: ${clientId}`);
          client.socket.terminate();
          this.clients.delete(clientId);
          return;
        }

        client.isAlive = false;
        client.socket.ping();
      });
    }, 30000); // 30 seconds

    console.log('💓 WebSocket heartbeat monitoring started');
  }

  /**
   * Get connected clients count
   */
  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  /**
   * Get client statistics
   */
  public getClientStatistics() {
    const stats = {
      totalClients: this.clients.size,
      subscriptionBreakdown: {} as Record<string, number>
    };

    this.clients.forEach((client) => {
      client.subscriptions.forEach((subscription) => {
        stats.subscriptionBreakdown[subscription] = (stats.subscriptionBreakdown[subscription] || 0) + 1;
      });
    });

    return stats;
  }

  /**
   * Broadcast system alert to all clients
   */
  public broadcastSystemAlert(alert: {
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    data?: any;
  }): void {
    const update: MeshDataUpdate = {
      type: 'SYSTEM_ALERT',
      timestamp: Date.now(),
      data: alert,
      source: 'webSocketBroadcaster',
      priority: alert.severity === 'critical' ? 'critical' : 'high',
      requiresBroadcast: false
    };

    this.broadcastToClients(update);
  }

  /**
   * Shutdown the broadcaster
   */
  public shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Close all client connections
    this.clients.forEach((client) => {
      client.socket.close();
    });
    this.clients.clear();

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }

    this.isInitialized = false;
    console.log('🔌 KonsAi Mesh WebSocket Broadcaster shutdown complete');
  }
}

// Export singleton instance
let webSocketBroadcaster: KonsAiMeshWebSocketBroadcaster | null = null;

export function getKonsAiMeshWebSocketBroadcaster(): KonsAiMeshWebSocketBroadcaster {
  if (!webSocketBroadcaster) {
    webSocketBroadcaster = new KonsAiMeshWebSocketBroadcaster();
  }
  return webSocketBroadcaster;
}

export { webSocketBroadcaster };