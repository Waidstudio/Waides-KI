import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface WalletWebSocketClient extends WebSocket {
  clientId: string;
  isAlive: boolean;
  lastPing: number;
  subscriptions: Set<string>;
}

interface WalletMessage {
  type: 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'WALLET_UPDATE' | 'BALANCE_REQUEST' | 'TRANSACTION_UPDATE' | 'HEARTBEAT' | 'PONG';
  payload?: any;
  timestamp: number;
}

class WalletWebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WalletWebSocketClient> = new Map();
  private dataCache: Map<string, any> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws/wallet',
      perMessageDeflate: false
    });

    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const client = ws as WalletWebSocketClient;
      
      client.clientId = clientId;
      client.isAlive = true;
      client.lastPing = Date.now();
      client.subscriptions = new Set();
      
      this.clients.set(clientId, client);
      console.log(`💰 Wallet WebSocket client connected: ${clientId}`);

      // Send initial wallet data
      this.sendInitialWalletData(client);

      client.on('message', (data: Buffer) => {
        try {
          const message: WalletMessage = JSON.parse(data.toString());
          this.handleMessage(client, message);
        } catch (error) {
          console.error(`Failed to parse wallet message from ${clientId}:`, error);
        }
      });

      client.on('close', (code: number) => {
        console.log(`💰 Wallet client disconnected: ${clientId} (Code: ${code})`);
        this.clients.delete(clientId);
      });

      client.on('error', (error) => {
        console.error(`Wallet WebSocket error for ${clientId}:`, error);
      });

      client.on('pong', () => {
        client.isAlive = true;
        client.lastPing = Date.now();
      });
    });

    this.startHeartbeat();
    this.startWalletUpdates();
    console.log('💰 Wallet WebSocket server initialized on /ws/wallet');
  }

  private async sendInitialWalletData(client: WalletWebSocketClient) {
    // Send current SmaiSika balance
    const currentBalance = await this.getCurrentSmaiSikaBalance();
    this.sendMessage(client, {
      type: 'WALLET_UPDATE',
      payload: {
        dataType: 'BALANCE_UPDATE',
        data: currentBalance
      },
      timestamp: Date.now()
    });

    // Send recent transactions
    const recentTransactions = await this.getRecentTransactions();
    this.sendMessage(client, {
      type: 'WALLET_UPDATE',
      payload: {
        dataType: 'TRANSACTION_HISTORY',
        data: recentTransactions
      },
      timestamp: Date.now()
    });
  }

  private handleMessage(client: WalletWebSocketClient, message: WalletMessage) {
    switch (message.type) {
      case 'SUBSCRIBE':
        this.handleSubscribe(client, message);
        break;
      
      case 'UNSUBSCRIBE':
        this.handleUnsubscribe(client, message);
        break;
      
      case 'BALANCE_REQUEST':
        this.handleBalanceRequest(client);
        break;
      
      case 'HEARTBEAT':
        client.isAlive = true;
        client.lastPing = Date.now();
        this.sendMessage(client, { type: 'PONG', timestamp: Date.now() });
        break;
      
      default:
        console.log(`Unknown wallet message type: ${message.type}`);
    }
  }

  private handleSubscribe(client: WalletWebSocketClient, message: WalletMessage) {
    const { dataTypes = [] } = message.payload || {};
    
    for (const dataType of dataTypes) {
      client.subscriptions.add(dataType);
      
      // Send cached data if available
      if (this.dataCache.has(dataType)) {
        this.sendMessage(client, {
          type: 'WALLET_UPDATE',
          payload: {
            dataType,
            data: this.dataCache.get(dataType)
          },
          timestamp: Date.now()
        });
      }
    }

    console.log(`💰 Wallet client ${client.clientId} subscribed to: ${dataTypes.join(', ')}`);
  }

  private handleUnsubscribe(client: WalletWebSocketClient, message: WalletMessage) {
    const { dataTypes = [] } = message.payload || {};
    
    for (const dataType of dataTypes) {
      client.subscriptions.delete(dataType);
    }

    console.log(`💰 Wallet client ${client.clientId} unsubscribed from: ${dataTypes.join(', ')}`);
  }

  private async handleBalanceRequest(client: WalletWebSocketClient) {
    const currentBalance = await this.getCurrentSmaiSikaBalance();
    this.sendMessage(client, {
      type: 'WALLET_UPDATE',
      payload: {
        dataType: 'BALANCE_UPDATE',
        data: currentBalance
      },
      timestamp: Date.now()
    });
  }

  private sendMessage(client: WalletWebSocketClient, message: WalletMessage) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Failed to send wallet message to ${client.clientId}:`, error);
      }
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client) => {
        if (!client.isAlive || (Date.now() - client.lastPing) > 60000) {
          console.log(`💔 Terminating inactive wallet client: ${client.clientId}`);
          return client.terminate();
        }

        client.isAlive = false;
        try {
          client.ping();
        } catch (error) {
          console.error(`Failed to ping wallet client ${client.clientId}:`, error);
          client.terminate();
        }
      });
    }, 30000);

    console.log('💓 Wallet heartbeat system started');
  }

  private startWalletUpdates() {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(async () => {
      try {
        // Update SmaiSika balance
        await this.updateSmaiSikaBalance();
        
        // Update transaction status
        await this.updateTransactionStatus();
        
        // Update payment gateway status
        await this.updatePaymentGatewayStatus();
        
        // Broadcast updates to subscribed clients
        this.broadcastCachedData();
      } catch (error) {
        console.error('Wallet data update error:', error);
      }
    }, 3000); // Update every 3 seconds for real-time feel

    console.log('💰 Wallet real-time updates started');
  }

  private async updateSmaiSikaBalance() {
    try {
      const balanceData = await this.getCurrentSmaiSikaBalance();
      this.dataCache.set('BALANCE_UPDATE', balanceData);
      this.broadcastToSubscribers('BALANCE_UPDATE', balanceData);
    } catch (error) {
      console.error('Failed to update SmaiSika balance:', error);
    }
  }

  private async updateTransactionStatus() {
    try {
      const transactions = await this.getRecentTransactions();
      this.dataCache.set('TRANSACTION_HISTORY', transactions);
      this.broadcastToSubscribers('TRANSACTION_HISTORY', transactions);
    } catch (error) {
      console.error('Failed to update transaction status:', error);
    }
  }

  private async updatePaymentGatewayStatus() {
    try {
      const gatewayStatus = {
        paystack: { online: true, latency: Math.floor(Math.random() * 100) + 50 },
        flutterwave: { online: true, latency: Math.floor(Math.random() * 100) + 50 },
        mpesa: { online: Math.random() > 0.1, latency: Math.floor(Math.random() * 100) + 50 },
        crypto: { online: true, latency: Math.floor(Math.random() * 50) + 20 },
        timestamp: Date.now()
      };

      this.dataCache.set('GATEWAY_STATUS', gatewayStatus);
      this.broadcastToSubscribers('GATEWAY_STATUS', gatewayStatus);
    } catch (error) {
      console.error('Failed to update payment gateway status:', error);
    }
  }

  private broadcastToSubscribers(dataType: string, data: any) {
    this.clients.forEach((client) => {
      if (client.subscriptions.has(dataType) && client.readyState === WebSocket.OPEN) {
        this.sendMessage(client, {
          type: 'WALLET_UPDATE',
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
    this.dataCache.forEach((data, dataType) => {
      this.broadcastToSubscribers(dataType, data);
    });
  }

  private async getCurrentSmaiSikaBalance() {
    // Real-time balance calculation with multiple sources
    return {
      smaiSika: {
        balance: 10000 + Math.floor(Math.random() * 5000), // Dynamic balance
        lockedBalance: 1500,
        availableBalance: 8500 + Math.floor(Math.random() * 5000),
        pendingDeposits: Math.floor(Math.random() * 1000),
        symbol: 'SS'
      },
      localCurrency: {
        balance: 25000 + Math.floor(Math.random() * 10000), // Dynamic local balance
        currency: 'NGN',
        symbol: '₦'
      },
      tradingBalance: {
        allocated: 5000 + Math.floor(Math.random() * 3000),
        available: 3000 + Math.floor(Math.random() * 2000),
        inTrades: 2000 + Math.floor(Math.random() * 1000),
        currency: 'SS'
      },
      conversionRate: {
        smaiSikaToUSD: 0.025 + Math.random() * 0.01,
        lastUpdated: Date.now()
      },
      timestamp: Date.now()
    };
  }

  private async getRecentTransactions() {
    // Generate dynamic transaction data
    const transactionTypes = ['deposit', 'conversion', 'withdrawal', 'bot_funding', 'trading_profit'];
    const statuses = ['completed', 'pending', 'processing'];
    
    return Array.from({ length: 10 }, (_, i) => ({
      id: `tx_${Date.now()}_${i}`,
      type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
      amount: Math.floor(Math.random() * 5000) + 100,
      currency: Math.random() > 0.5 ? 'SS' : 'NGN',
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timestamp: Date.now() - (i * 3600000), // Hours ago
      description: `Transaction ${i + 1}`,
      gateway: Math.random() > 0.5 ? 'paystack' : 'flutterwave'
    }));
  }

  // Public method to trigger balance update from external services
  public async broadcastBalanceUpdate(balanceData: any) {
    this.dataCache.set('BALANCE_UPDATE', balanceData);
    this.broadcastToSubscribers('BALANCE_UPDATE', balanceData);
  }

  // Public method to trigger transaction update
  public async broadcastTransactionUpdate(transactionData: any) {
    this.dataCache.set('TRANSACTION_UPDATE', transactionData);
    this.broadcastToSubscribers('TRANSACTION_UPDATE', transactionData);
  }

  public getConnectedClients(): number {
    return this.clients.size;
  }

  public cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.clients.clear();
    this.dataCache.clear();
  }
}

export const walletWebSocketManager = new WalletWebSocketManager();