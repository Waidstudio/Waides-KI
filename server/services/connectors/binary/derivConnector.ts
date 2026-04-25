/**
 * Deriv Binary Options Connector
 * Market Type: Binary Options
 * For: WaidBot, WaidBot Pro, Maibot
 * 
 * Implements real Deriv WebSocket API for live trading
 * API Docs: https://developers.deriv.com/docs
 */

import WebSocket from 'ws';

export interface DerivConfig {
  apiToken: string;
  appId: string;
  serverUrl?: string;
}

export interface BinaryTradeParams {
  symbol: string;
  tradeType: 'CALL' | 'PUT' | 'RISE' | 'FALL' | 'RISE_EQUAL' | 'FALL_EQUAL';
  stake: number;
  duration: number; // in seconds
  durationType: 's' | 'm' | 'h' | 'd'; // seconds, minutes, hours, days
  basis?: 'stake' | 'payout';
}

export interface BinaryTradeResult {
  success: boolean;
  contractId?: string;
  buyPrice?: number;
  payout?: number;
  expiryTime?: number;
  error?: string;
  transactionId?: string;
}

export interface MarketData {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  timestamp: number;
}

export interface Proposal {
  id: string;
  symbol: string;
  type: string;
  payout: number;
  cost: number;
  dateExpiry: number;
}

type MessageHandler = (data: any) => void;

export class DerivConnector {
  private config: DerivConfig;
  private ws: WebSocket | null = null;
  private connected: boolean = false;
  private authenticated: boolean = false;
  private messageHandlers: Map<string, MessageHandler> = new Map();
  private pendingRequests: Map<string, { resolve: Function; reject: Function }> = new Map();
  private proposals: Map<string, Proposal> = new Map();
  private subscriptions: Set<string> = new Set();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private pingInterval: NodeJS.Timeout | null = null;
  private serverUrl: string;

  constructor(config: DerivConfig) {
    this.config = config;
    this.serverUrl = config.serverUrl || 'wss://ws.binaryws.com/websockets/v3?app_id=' + config.appId;
  }

  /**
   * Connect to Deriv WebSocket API
   */
  async connect(): Promise<{ ok: boolean; reason?: string }> {
    if (!this.config.apiToken) {
      return { ok: false, reason: 'Missing API token' };
    }

    return new Promise((resolve) => {
      try {
        console.log('📈 Connecting to Deriv WebSocket...');
        this.ws = new WebSocket(this.serverUrl);

        this.ws.on('open', () => {
          console.log('📈 Deriv WebSocket connected');
          this.connected = true;
          this.reconnectAttempts = 0;
          this.authenticate();
          
          // Start ping interval to keep connection alive
          this.startPingInterval();
          
          resolve({ ok: true });
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          this.handleMessage(data.toString());
        });

        this.ws.on('error', (error) => {
          console.error('❌ Deriv WebSocket error:', error.message);
          if (!this.connected) {
            resolve({ ok: false, reason: error.message });
          }
        });

        this.ws.on('close', () => {
          console.log('📈 Deriv WebSocket disconnected');
          this.connected = false;
          this.authenticated = false;
          this.stopPingInterval();
          this.attemptReconnect();
        });

        // Timeout for connection
        setTimeout(() => {
          if (!this.connected) {
            resolve({ ok: false, reason: 'Connection timeout' });
          }
        }, 10000);

      } catch (error) {
        console.error('❌ Deriv connection error:', error);
        resolve({ ok: false, reason: String(error) });
      }
    });
  }

  /**
   * Authenticate with Deriv API
   */
  private authenticate(): void {
    this.sendRequest('authorize', { authorize: this.config.apiToken })
      .then((response) => {
        if (response.authorize) {
          this.authenticated = true;
          console.log('✅ Deriv authentication successful');
          console.log(`   Account: ${response.authorize.loginid}`);
          console.log(`   Currency: ${response.authorize.currency}`);
        }
      })
      .catch((error) => {
        console.error('❌ Deriv authentication failed:', error);
      });
  }

  /**
   * Send request to Deriv API and wait for response
   */
  private sendRequest(requestType: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const requestId = `${requestType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const request = { ...data, req_id: requestId };
      
      this.pendingRequests.set(requestId, { resolve, reject });
      
      this.ws.send(JSON.stringify(request));
      
      // Timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error(`Request ${requestType} timed out`));
        }
      }, 30000);
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      // Handle response to pending requests
      if (message.req_id && this.pendingRequests.has(message.req_id)) {
        const { resolve, reject } = this.pendingRequests.get(message.req_id)!;
        this.pendingRequests.delete(message.req_id);
        
        if (message.error) {
          reject(new Error(message.error.message));
        } else {
          resolve(message);
        }
        return;
      }

      // Handle subscription updates
      if (message.subscription) {
        const handler = this.messageHandlers.get(message.subscription);
        if (handler) {
          handler(message);
        }
      }

      // Handle proposal responses (for trading)
      if (message.proposal) {
        const proposal = message.proposal;
        this.proposals.set(proposal.id, {
          id: proposal.id,
          symbol: proposal.symbol,
          type: proposal.type,
          payout: proposal.payout,
          cost: proposal.cost,
          dateExpiry: proposal.date_expiry
        });
      }

      // Handle buy response
      if (message.buy) {
        const handler = this.messageHandlers.get('buy');
        if (handler) {
          handler(message);
        }
      }

      // Handle transaction updates
      if (message.transaction) {
        const handler = this.messageHandlers.get('transaction');
        if (handler) {
          handler(message);
        }
      }

    } catch (error) {
      console.error('❌ Error parsing Deriv message:', error);
    }
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 30000);
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Attempt to reconnect after disconnect
   */
  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`📈 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Get available symbols/markets
   */
  async getActiveSymbols(): Promise<any[]> {
    const response = await this.sendRequest('active_symbols', {
      active_symbols: 'brief',
      product_type: 'basic'
    });
    return response.active_symbols || [];
  }

  /**
   * Get current price for a symbol
   */
  async getPrice(symbol: string): Promise<MarketData | null> {
    try {
      const response = await this.sendRequest('ticks', {
        ticks: [symbol]
      });
      
      if (response.tick) {
        return {
          symbol: response.tick.symbol,
          bid: response.tick.bid,
          ask: response.tick.ask,
          last: response.tick.last,
          timestamp: response.tick.epoch
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting price:', error);
      return null;
    }
  }

  /**
   * Subscribe to price updates for a symbol
   */
  subscribeToPrice(symbol: string, handler: MessageHandler): string {
    const subscriptionId = `price_${symbol}`;
    
    if (!this.subscriptions.has(subscriptionId)) {
      this.sendRequest('subscribe', { ticks: [symbol] });
      this.subscriptions.add(subscriptionId);
    }
    
    this.messageHandlers.set(subscriptionId, handler);
    return subscriptionId;
  }

  /**
   * Unsubscribe from price updates
   */
  unsubscribeFromPrice(symbol: string): void {
    const subscriptionId = `price_${symbol}`;
    
    if (this.subscriptions.has(subscriptionId)) {
      this.sendRequest('unsubscribe', { ticks: [symbol] });
      this.subscriptions.delete(subscriptionId);
    }
    
    this.messageHandlers.delete(subscriptionId);
  }

  /**
   * Get contract proposals (before buying)
   */
  async getProposal(params: BinaryTradeParams): Promise<Proposal | null> {
    try {
      const proposalParams = {
        proposal: 1,
        amount: params.stake,
        basis: params.basis || 'stake',
        contract_type: params.tradeType,
        currency: 'USD',
        symbol: params.symbol,
        duration: params.duration,
        duration_unit: params.durationType
      };

      const response = await this.sendRequest('proposal', proposalParams);
      
      if (response.proposal) {
        return {
          id: response.proposal.id,
          symbol: response.proposal.symbol,
          type: response.proposal.type,
          payout: response.proposal.payout,
          cost: response.proposal.cost,
          dateExpiry: response.proposal.date_expiry
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting proposal:', error);
      return null;
    }
  }

  /**
   * Place a binary options trade
   */
  async placeBinaryTrade(params: BinaryTradeParams): Promise<BinaryTradeResult> {
    if (!this.connected || !this.authenticated) {
      return { success: false, error: 'Not connected to Deriv' };
    }

    try {
      // First, get a proposal to confirm the trade details
      const proposal = await this.getProposal(params);
      
      if (!proposal) {
        return { success: false, error: 'Failed to get contract proposal' };
      }

      // Buy the contract
      const response = await this.sendRequest('buy', {
        buy: proposal.id,
        price: proposal.cost
      });

      if (response.buy) {
        return {
          success: true,
          contractId: response.buy.contract_id,
          buyPrice: response.buy.buy_price,
          payout: proposal.payout,
          expiryTime: proposal.dateExpiry,
          transactionId: response.buy.transaction_id
        };
      }

      return { success: false, error: 'Trade execution failed' };
    } catch (error) {
      console.error('❌ Error placing trade:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get contract details
   */
  async getContractInfo(contractId: string): Promise<any> {
    try {
      const response = await this.sendRequest('contract_info', {
        contract_id: parseInt(contractId)
      });
      return response.contract_info;
    } catch (error) {
      console.error('❌ Error getting contract info:', error);
      return null;
    }
  }

  /**
   * Get open positions
   */
  async getOpenPositions(): Promise<any[]> {
    try {
      const response = await this.sendRequest('proposal_open_contract', {
        proposal_open_contract: 1,
        limit: 100
      });
      return response.proposal_open_contract?.contracts || [];
    } catch (error) {
      console.error('❌ Error getting open positions:', error);
      return [];
    }
  }

  /**
   * Sell a contract before expiry
   */
  async sellContract(contractId: string, price: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.sendRequest('sell', {
        sell: contractId,
        price: price
      });

      if (response.sell) {
        return { success: true };
      }
      return { success: false, error: 'Sell failed' };
    } catch (error) {
      console.error('❌ Error selling contract:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<{ balance: number; currency: string } | null> {
    try {
      const response = await this.sendRequest('balance', {
        balance: 1,
        account: 'all'
      });
      
      if (response.balance) {
        return {
          balance: response.balance.balance,
          currency: response.balance.currency
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting balance:', error);
      return null;
    }
  }

  /**
   * Disconnect from Deriv
   */
  disconnect(): void {
    this.stopPingInterval();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.connected = false;
    this.authenticated = false;
    this.subscriptions.clear();
    this.proposals.clear();
    this.messageHandlers.clear();
    
    console.log('📈 Deriv connector disconnected');
  }

  /**
   * Check if connected and authenticated
   */
  isReady(): boolean {
    return this.connected && this.authenticated;
  }

  /**
   * Get connection status
   */
  getStatus(): { connected: boolean; authenticated: boolean } {
    return {
      connected: this.connected,
      authenticated: this.authenticated
    };
  }
}

export default DerivConnector;
        buyPrice: params.stake,
        payout: params.stake * 1.85, // 85% payout typical
        expiryTime: Date.now() + (params.duration * 1000)
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async testConnection(): Promise<{ ok: boolean; reason?: string }> {
    return this.connect();
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }
}

export default DerivConnector;
