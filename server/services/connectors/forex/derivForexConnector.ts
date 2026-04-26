/**
 * Deriv Forex Connector
 * Real-time trading with Deriv MT5/CFD accounts
 * Market Type: Forex/CFD Trading
 * For: Autonomous Trader
 */

export interface DerivForexConfig {
  apiToken: string;
  appId?: string;
  accountType?: 'real' | 'demo';
  serverUrl?: string;
}

export interface ForexTradeParams {
  symbol: string;
  action: 'BUY' | 'SELL';
  volume: number; // in lots
  stopLoss?: number;
  takeProfit?: number;
  leverage?: number;
  price?: number;
  orderType?: 'market' | 'limit' | 'stop';
}

export interface ForexTradeResult {
  success: boolean;
  orderId?: string;
  dealId?: number;
  price?: number;
  volume?: number;
  error?: string;
}

export interface ForexQuote {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  timestamp: number;
}

export interface ForexPosition {
  id: string;
  symbol: string;
  type: string;
  volume: number;
  price: number;
  profit: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: number;
}

class DerivForexConnector {
  private config: DerivForexConfig;
  private ws: WebSocket | null = null;
  private connected: boolean = false;
  private authenticated: boolean = false;
  private balance: number = 0;
  private equity: number = 0;
  private currency: string = 'USD';
  private quotes: Map<string, ForexQuote> = new Map();
  private positions: Map<string, ForexPosition> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(config: DerivForexConfig) {
    this.config = {
      appId: '1089',
      accountType: 'demo',
      serverUrl: 'wss://frontend.derivws.com/websockets/v3',
      ...config
    };
  }

  /**
   * Connect to Deriv MT5 WebSocket
   */
  async connect(): Promise<{ ok: boolean; reason?: string }> {
    return new Promise((resolve) => {
      try {
        const serverUrl = `${this.config.serverUrl}?app_id=${this.config.appId}`;
        this.ws = new WebSocket(serverUrl);

        this.ws.onopen = () => {
          console.log('📡 Deriv Forex WebSocket connected');
          this.connected = true;
          this.authenticate();
          resolve({ ok: true });
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          console.error('❌ Deriv Forex WebSocket error:', error);
          resolve({ ok: false, reason: 'WebSocket connection error' });
        };

        this.ws.onclose = () => {
          console.log('📴 Deriv Forex WebSocket disconnected');
          this.connected = false;
          this.authenticated = false;
          this.attemptReconnect();
        };

        setTimeout(() => {
          if (!this.connected) {
            resolve({ ok: false, reason: 'Connection timeout' });
          }
        }, 10000);

      } catch (error) {
        console.error('❌ Error connecting to Deriv Forex:', error);
        resolve({ ok: false, reason: String(error) });
      }
    });
  }

  /**
   * Authenticate with Deriv API
   */
  private authenticate(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(JSON.stringify({
      authorize: this.config.apiToken
    }));
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: any): void {
    // Handle authentication response
    if (data.authorize) {
      if (data.authorize.error) {
        console.error('❌ Deriv Forex authentication failed:', data.authorize.error.message);
      } else {
        this.authenticated = true;
        console.log('✅ Deriv Forex authenticated');
        this.getBalance();
        this.getPositions();
      }
    }

    // Handle balance updates
    if (data.balance !== undefined) {
      this.balance = data.balance.balance || 0;
      this.equity = data.balance.equity || this.balance;
      this.currency = data.balance.currency || 'USD';
    }

    // Handle quote updates
    if (data.tick || data.ticks) {
      const tick = data.tick || data.ticks?.[0];
      if (tick) {
        const quote: ForexQuote = {
          symbol: tick.symbol,
          bid: tick.bid,
          ask: tick.ask,
          last: tick.last || (tick.bid + tick.ask) / 2,
          timestamp: tick.epoch * 1000
        };
        this.quotes.set(tick.symbol, quote);
      }
    }

    // Handle position updates
    if (data.proposal || data.buy) {
      console.log('📊 Deriv Forex trade result:', data);
    }

    // Handle position list
    if (data.positions) {
      data.positions.forEach((pos: any) => {
        const position: ForexPosition = {
          id: pos.id || pos.contract_id,
          symbol: pos.symbol,
          type: pos.type,
          volume: pos.amount || pos.volume,
          price: pos.entry_price || pos.buy_price,
          profit: pos.profit || 0,
          stopLoss: pos.stop_loss,
          takeProfit: pos.take_profit,
          openTime: pos.open_time * 1000
        };
        this.positions.set(position.id, position);
      });
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<{ balance: number; currency: string }> {
    if (!this.ws || !this.authenticated) {
      return { balance: 0, currency: 'USD' };
    }

    this.ws.send(JSON.stringify({
      balance: 1,
      account_type: this.config.accountType
    }));

    await new Promise(resolve => setTimeout(resolve, 500));

    return { balance: this.equity || this.balance, currency: this.currency };
  }

  /**
   * Get price for a symbol
   */
  async getPrice(symbol: string): Promise<ForexQuote | null> {
    const cached = this.quotes.get(symbol);
    if (cached) return cached;

    if (!this.ws || !this.authenticated) {
      return null;
    }

    this.ws.send(JSON.stringify({
      ticks: symbol,
      subscribe: 1
    }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    return this.quotes.get(symbol) || null;
  }

  /**
   * Subscribe to price updates
   */
  subscribeToPrice(symbol: string, callback: (data: any) => void): void {
    if (!this.ws || !this.authenticated) return;

    this.ws.send(JSON.stringify({
      ticks: symbol,
      subscribe: 1
    }));

    (this as any)[`price_${symbol}`] = callback;
  }

  /**
   * Unsubscribe from price updates
   */
  unsubscribeFromPrice(symbol: string): void {
    if (!this.ws || !this.authenticated) return;

    this.ws.send(JSON.stringify({
      ticks: symbol,
      subscribe: 0
    }));
  }

  /**
   * Place a forex/CFD trade
   */
  async placeForexTrade(params: ForexTradeParams): Promise<ForexTradeResult> {
    if (!this.ws || !this.authenticated) {
      return { success: false, error: 'Not connected or authenticated' };
    }

    return new Promise((resolve) => {
      const requestId = Date.now().toString();

      const messageHandler = (event: MessageEvent) => {
        const data = JSON.parse(event.data);

        if (data.buy || data.proposal) {
          this.ws?.removeEventListener('message', messageHandler);
          
          if (data.buy?.id || data.proposal?.id) {
            resolve({
              success: true,
              orderId: data.buy?.id || data.proposal?.id,
              dealId: data.buy?.contract_id,
              price: data.buy?.buy_price || params.price,
              volume: params.volume
            });
          } else {
            resolve({
              success: false,
              error: data.error?.message || 'Trade failed'
            });
          }
        }
      };

      this.ws.addEventListener('message', messageHandler);

      // Deriv CFD trade request
      this.ws.send(JSON.stringify({
        buy: params.symbol,
        price: params.price || 100,
        amount: params.volume,
        type: params.action === 'BUY' ? 'Up' : 'Down',
        barrier_type: 'relative',
        barrier_offset: 0,
        duration: 1,
        basis: 'stake'
      }));

      setTimeout(() => {
        this.ws?.removeEventListener('message', messageHandler);
        resolve({ success: false, error: 'Trade timeout' });
      }, 30000);
    });
  }

  /**
   * Get open positions
   */
  async getOpenPositions(): Promise<ForexPosition[]> {
    if (!this.ws || !this.authenticated) {
      return [];
    }

    this.ws.send(JSON.stringify({
      positions: 1,
      account_type: this.config.accountType
    }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    return Array.from(this.positions.values());
  }

  /**
   * Close a position
   */
  async closePosition(positionId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.ws || !this.authenticated) {
      return { success: false, error: 'Not connected or authenticated' };
    }

    const position = this.positions.get(positionId);
    if (!position) {
      return { success: false, error: 'Position not found' };
    }

    return new Promise((resolve) => {
      const requestId = Date.now().toString();

      const messageHandler = (event: MessageEvent) => {
        const data = JSON.parse(event.data);

        if (data.sell) {
          this.ws?.removeEventListener('message', messageHandler);
          
          if (data.sell.id) {
            this.positions.delete(positionId);
            resolve({ success: true });
          } else {
            resolve({ success: false, error: 'Close failed' });
          }
        }
      };

      this.ws.addEventListener('message', messageHandler);

      this.ws.send(JSON.stringify({
        sell: positionId,
        amount: position.volume
      }));

      setTimeout(() => {
        this.ws?.removeEventListener('message', messageHandler);
        resolve({ success: false, error: 'Close timeout' });
      }, 30000);
    });
  }

  /**
   * Get connector status
   */
  getStatus(): { connected: boolean; authenticated: boolean; balance: number; equity: number } {
    return {
      connected: this.connected,
      authenticated: this.authenticated,
      balance: this.balance,
      equity: this.equity
    };
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Attempting to reconnect to Deriv Forex (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, 5000 * this.reconnectAttempts);
  }

  /**
   * Disconnect from Deriv Forex
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.authenticated = false;
    this.positions.clear();
    console.log('📴 Disconnected from Deriv Forex');
  }
}

export { DerivForexConnector };
export default DerivForexConnector;
