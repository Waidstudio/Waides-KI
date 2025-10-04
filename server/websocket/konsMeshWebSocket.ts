import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface KonsMeshClient extends WebSocket {
  isAlive: boolean;
  clientId: string;
  subscriptions: Set<string>;
  lastPing: number;
}

interface KonsMeshMessage {
  type: 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'DATA_UPDATE' | 'HEARTBEAT' | 'PING' | 'PONG';
  payload?: any;
  clientId?: string;
  timestamp?: number;
}

class KonsMeshWebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, KonsMeshClient>();
  private dataCache = new Map<string, any>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private dataUpdateInterval: NodeJS.Timeout | null = null;

  initialize(server: Server) {
    this.wss = new WebSocketServer({
      server,
      path: '/ws',
      perMessageDeflate: false,
      // Enhanced connection settings to prevent 1006 errors
      maxPayload: 16 * 1024, // 16KB max payload
      skipUTF8Validation: false
    });

    this.wss.on('connection', (ws: KonsMeshClient, request) => {
      const clientId = this.generateClientId();
      ws.clientId = clientId;
      ws.isAlive = true;
      ws.subscriptions = new Set();
      ws.lastPing = Date.now();

      this.clients.set(clientId, ws);
      console.log(`🌐 KonsMesh client connected: ${clientId}`);

      // TODO: Send connection acknowledgment once frontend schema is aligned
      // this.sendMessage(ws, {
      //   type: 'DATA_UPDATE',
      //   payload: {
      //     connectionId: clientId,
      //     status: 'connected',
      //     serverTime: new Date().toISOString()
      //   },
      //   timestamp: Date.now()
      // });

      // Handle incoming messages
      ws.on('message', async (data: Buffer) => {
        try {
          const message: KonsMeshMessage = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('KonsMesh message parsing error:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      // Handle client disconnect
      ws.on('close', (code, reason) => {
        console.log(`🔌 KonsMesh client disconnected: ${clientId} (Code: ${code})`);
        this.handleDisconnect(ws);
      });

      // Handle connection errors
      ws.on('error', (error) => {
        console.error(`❌ KonsMesh WebSocket error for client ${clientId}:`, error);
        // Don't immediately close, try to recover
      });

      // Enhanced heartbeat with ping/pong
      ws.on('pong', () => {
        ws.isAlive = true;
        ws.lastPing = Date.now();
      });

      // Handle custom ping messages
      ws.on('ping', () => {
        ws.pong();
        ws.isAlive = true;
        ws.lastPing = Date.now();
      });
    });

    // Setup enhanced heartbeat system
    this.startHeartbeat();
    
    // Setup real-time data broadcasting
    this.startDataBroadcasting();

    console.log('🌐 Enhanced KonsMesh WebSocket server initialized on /ws');
  }

  private generateClientId(): string {
    return `konsmesh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async handleMessage(ws: KonsMeshClient, message: KonsMeshMessage) {
    switch (message.type) {
      case 'SUBSCRIBE':
        await this.handleSubscribe(ws, message);
        break;
      
      case 'UNSUBSCRIBE':
        await this.handleUnsubscribe(ws, message);
        break;
      
      case 'HEARTBEAT':
      case 'PING':
        ws.isAlive = true;
        ws.lastPing = Date.now();
        this.sendMessage(ws, { type: 'PONG', timestamp: Date.now() });
        break;
      
      default:
        console.log(`Unknown KonsMesh message type: ${message.type}`);
    }
  }

  private async handleSubscribe(ws: KonsMeshClient, message: KonsMeshMessage) {
    const { dataTypes = [] } = message.payload || {};
    
    for (const dataType of dataTypes) {
      ws.subscriptions.add(dataType);
      
      // Send cached data if available
      if (this.dataCache.has(dataType)) {
        this.sendMessage(ws, {
          type: 'DATA_UPDATE',
          payload: {
            dataType,
            data: this.dataCache.get(dataType)
          },
          timestamp: Date.now()
        });
      }
    }

    console.log(`📡 Client ${ws.clientId} subscribed to: ${dataTypes.join(', ')}`);
  }

  private async handleUnsubscribe(ws: KonsMeshClient, message: KonsMeshMessage) {
    const { dataTypes = [] } = message.payload || {};
    
    for (const dataType of dataTypes) {
      ws.subscriptions.delete(dataType);
    }

    console.log(`📡 Client ${ws.clientId} unsubscribed from: ${dataTypes.join(', ')}`);
  }

  private handleDisconnect(ws: KonsMeshClient) {
    this.clients.delete(ws.clientId);
    console.log(`🔌 KonsMesh client ${ws.clientId} removed from manager`);
  }

  private sendMessage(ws: KonsMeshClient, message: KonsMeshMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Failed to send message to client ${ws.clientId}:`, error);
      }
    }
  }

  private sendError(ws: KonsMeshClient, error: string) {
    this.sendMessage(ws, {
      type: 'DATA_UPDATE',
      payload: {
        error,
        severity: 'warning'
      },
      timestamp: Date.now()
    });
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(() => {
      this.wss?.clients.forEach((ws) => {
        const client = ws as KonsMeshClient;
        
        // Check if client is still alive
        if (!client.isAlive || (Date.now() - client.lastPing) > 60000) {
          console.log(`💔 Terminating inactive KonsMesh client: ${client.clientId}`);
          return client.terminate();
        }

        // Send ping to check connection
        client.isAlive = false;
        try {
          client.ping();
        } catch (error) {
          console.error(`Failed to ping client ${client.clientId}:`, error);
          client.terminate();
        }
      });
    }, 30000); // Check every 30 seconds

    console.log('💓 KonsMesh heartbeat system started');
  }

  private startDataBroadcasting() {
    if (this.dataUpdateInterval) return;

    this.dataUpdateInterval = setInterval(async () => {
      try {
        // Fetch fresh data
        await this.updateEthPrice();
        await this.updateSystemStatus();
        await this.updateBotStatuses();
        
        // Broadcast to subscribed clients
        this.broadcastCachedData();
      } catch (error) {
        console.error('KonsMesh data broadcasting error:', error);
      }
    }, 5000); // Update every 5 seconds

    console.log('📡 KonsMesh data broadcasting started');
  }

  private async updateEthPrice() {
    try {
      // Simulate ETH price data (in real app, this would fetch from external API)
      const ethPrice = {
        price: 3500 + Math.random() * 1000, // Random price between 3500-4500
        change24h: (Math.random() - 0.5) * 20, // Random change ±10%
        volume: Math.random() * 1000000000, // Random volume
        timestamp: Date.now()
      };

      this.dataCache.set('ETH_PRICE', ethPrice);
      this.broadcastToSubscribers('ETH_PRICE', ethPrice);
    } catch (error) {
      console.error('Failed to update ETH price:', error);
    }
  }

  private async updateSystemStatus() {
    try {
      const systemStatus = {
        konsPowa: {
          tasksCompleted: Math.floor(Math.random() * 10) + 95,
          totalTasks: 106,
          healthScore: Math.floor(Math.random() * 20) + 80
        },
        konsAI: {
          status: 'active',
          queries: Math.floor(Math.random() * 100) + 500,
          accuracy: Math.floor(Math.random() * 10) + 90
        },
        shavoka: {
          status: 'active',
          authentications: Math.floor(Math.random() * 50) + 200
        },
        timestamp: Date.now()
      };

      this.dataCache.set('SYSTEM_STATUS', systemStatus);
      this.broadcastToSubscribers('SYSTEM_STATUS', systemStatus);
    } catch (error) {
      console.error('Failed to update system status:', error);
    }
  }

  private async updateBotStatuses() {
    try {
      const botStatuses = {
        waidbot: { isActive: Math.random() > 0.5, profit: Math.random() * 1000 },
        maibot: { isActive: Math.random() > 0.5, profit: Math.random() * 500 },
        autonomous: { isActive: Math.random() > 0.5, profit: Math.random() * 2000 },
        timestamp: Date.now()
      };

      this.dataCache.set('BOT_STATUS', botStatuses);
      this.broadcastToSubscribers('BOT_STATUS', botStatuses);
    } catch (error) {
      console.error('Failed to update bot statuses:', error);
    }
  }

  private broadcastToSubscribers(dataType: string, data: any) {
    this.clients.forEach((client) => {
      if (client.subscriptions.has(dataType) && client.readyState === WebSocket.OPEN) {
        this.sendMessage(client, {
          type: 'DATA_UPDATE',
          payload: {
            dataType,
            data
          },
          timestamp: Date.now()
        });
      }
    });
  }

  private broadcastCachedData() {
    // Only broadcast if we have active clients
    if (this.clients.size === 0) return;

    this.dataCache.forEach((data, dataType) => {
      this.broadcastToSubscribers(dataType, data);
    });
  }

  // Public methods for external systems
  public broadcastAlert(alert: any) {
    this.broadcastToSubscribers('SYSTEM_ALERT', alert);
  }

  public getConnectedClients(): number {
    return this.clients.size;
  }

  public getActiveSubscriptions(): Record<string, number> {
    const subscriptions: Record<string, number> = {};
    
    this.clients.forEach((client) => {
      client.subscriptions.forEach((sub) => {
        subscriptions[sub] = (subscriptions[sub] || 0) + 1;
      });
    });

    return subscriptions;
  }

  public shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.dataUpdateInterval) {
      clearInterval(this.dataUpdateInterval);
      this.dataUpdateInterval = null;
    }

    this.wss?.close();
    console.log('🔄 KonsMesh WebSocket server shutdown');
  }
}

// Global instance
export const konsMeshManager = new KonsMeshWebSocketManager();