/**
 * MetaTrader 5 Forex Connector
 * Real-time trading with MT5 broker
 * Market Type: Forex/CFD Trading
 * For: Autonomous Trader
 */

export interface MT5Config {
  login: number;
  password: string;
  server: string;
  brokerName?: string;
  apiUrl?: string;
}

export interface MT5TradeParams {
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  leverage?: number;
  stopLoss?: number;
  takeProfit?: number;
  price?: number;
  orderType?: 'market' | 'limit' | 'stop';
}

export interface MT5TradeResult {
  success: boolean;
  orderId?: string;
  dealId?: number;
  price?: number;
  volume?: number;
  error?: string;
}

export interface MT5Position {
  ticket: number;
  symbol: string;
  type: string;
  volume: number;
  price: number;
  profit: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: number;
}

export interface MT5Quote {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  timestamp: number;
}

class MT5Connector {
  private config: MT5Config;
  private ws: WebSocket | null = null;
  private connected: boolean = false;
  private authenticated: boolean = false;
  private balance: number = 0;
  private equity: number = 0;
  private currency: string = 'USD';
  private quotes: Map<string, MT5Quote> = new Map();
  private positions: Map<number, MT5Position> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private accountId: string | null = null;

  constructor(config: MT5Config) {
    this.config = {
      server: 'MetaQuotes-Demo',
      apiUrl: 'wss://mt5-api.metaquotes.cloud/ws',
      ...config
    };
  }

  /**
   * Connect to MT5 via WebSocket API
   */
  async connect(): Promise<{ ok: boolean; reason?: string }> {
    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(this.config.apiUrl!);

        this.ws.onopen = () => {
          console.log('📡 MT5 WebSocket connected');
          this.connected = true;
          this.authenticate();
          resolve({ ok: true });
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          console.error('❌ MT5 WebSocket error:', error);
          resolve({ ok: false, reason: 'WebSocket connection error' });
        };

        this.ws.onclose = () => {
          console.log('📴 MT5 WebSocket disconnected');
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
        console.error('❌ Error connecting to MT5:', error);
        resolve({ ok: false, reason: String(error) });
      }
    });
  }

  /**
   * Authenticate with MT5
   */
  private authenticate(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(JSON.stringify({
      action: 'auth',
      login: this.config.login,
      password: this.config.password,
      server: this.config.server
    }));
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: any): void {
    // Handle authentication response
    if (data.auth) {
      if (data.auth === true || data.auth === 'true') {
        this.authenticated = true;
        this.accountId = data.login || String(this.config.login);
        console.log('✅ MT5 authenticated');
        this.getBalance();
        this.getPositions();
      } else {
        console.error('❌ MT5 authentication failed:', data.error);
      }
    }

    // Handle account info
    if (data.type === 'account' || data.name === 'account') {
      this.balance = data.balance || 0;
      this.equity = data.equity || data.balance || 0;
      this.currency = data.currency || 'USD';
    }

    // Handle quote updates
    if (data.type === 'quote' || data.symbol) {
      const quote: MT5Quote = {
        symbol: data.symbol,
        bid: data.bid || 0,
        ask: data.ask || 0,
        last: data.last || data.bid || 0,
        timestamp: data.time || Date.now()
      };
      this.quotes.set(data.symbol, quote);
    }

    // Handle position updates
    if (data.type === 'position' || data.name === 'position') {
      const position: MT5Position = {
        ticket: data.ticket || data.order || 0,
        symbol: data.symbol,
        type: data.type || (data.cmd === 0 ? 'buy' : 'sell'),
        volume: data.volume || 0,
        price: data.price || data.openPrice || 0,
        profit: data.profit || 0,
        stopLoss: data.sl,
        takeProfit: data.tp,
        openTime: data.openTime || data.time || Date.now()
      };
      this.positions.set(position.ticket, position);
    }

    // Handle trade results
    if (data.type === 'trade' || data.name === 'order') {
      console.log('📊 MT5 trade result:', data);
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
      action: 'getAccount',
      login: this.config.login
    }));

    await new Promise(resolve => setTimeout(resolve, 500));

    return { balance: this.balance || this.equity, currency: this.currency };
  }

  /**
   * Get price for a symbol
   */
  async getPrice(symbol: string): Promise<MT5Quote | null> {
    const cached = this.quotes.get(symbol);
    if (cached) return cached;

    if (!this.ws || !this.authenticated) {
      return null;
    }

    this.ws.send(JSON.stringify({
      action: 'getSymbol',
      symbol
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
      action: 'subscribe',
      symbol
    }));

    (this as any)[`price_${symbol}`] = callback;
  }

  /**
   * Unsubscribe from price updates
   */
  unsubscribeFromPrice(symbol: string): void {
    if (!this.ws || !this.authenticated) return;

    this.ws.send(JSON.stringify({
      action: 'unsubscribe',
      symbol
    }));
  }

  /**
   * Open a position (market order)
   */
  async openPosition(params: MT5TradeParams): Promise<MT5TradeResult> {
    if (!this.ws || !this.authenticated) {
      return { success: false, error: 'Not connected or authenticated' };
    }

    return new Promise((resolve) => {
      const requestId = Date.now().toString();

      const messageHandler = (event: MessageEvent) => {
        const data = JSON.parse(event.data);

        if ((data.type === 'trade' || data.order) && data.requestId === requestId) {
          this.ws?.removeEventListener('message', messageHandler);
          
          if (data.retcode === 0 || data.success) {
            resolve({
              success: true,
              orderId: data.order || data.orderId,
              dealId: data.deal || data.dealId,
              price: data.price || data.request?.price,
              volume: params.volume
            });
          } else {
            resolve({
              success: false,
              error: data.error || data.retcode || 'Trade failed'
            });
          }
        }
      };

      this.ws.addEventListener('message', messageHandler);

      // MT5 trade request format
      this.ws.send(JSON.stringify({
        action: 'trade',
        requestId,
        order: {
          action: params.type === 'buy' ? 'TRADE_ACTION_DEAL' : 'TRADE_ACTION_DEAL',
          symbol: params.symbol,
          volume: params.volume,
          type: params.type === 'buy' ? 'ORDER_TYPE_BUY' : 'ORDER_TYPE_SELL',
          price: params.price || 0,
          sl: params.stopLoss || 0,
          tp: params.takeProfit || 0,
          deviation: 10,
          magic: 234000,
          comment: 'Waides KI Trade'
        }
      }));

      setTimeout(() => {
        this.ws?.removeEventListener('message', messageHandler);
        resolve({ success: false, error: 'Trade timeout' });
      }, 30000);
    });
  }

  /**
   * Close a position
   */
  async closePosition(ticket: number): Promise<{ success: boolean; error?: string }> {
    if (!this.ws || !this.authenticated) {
      return { success: false, error: 'Not connected or authenticated' };
    }

    const position = this.positions.get(ticket);
    if (!position) {
      return { success: false, error: 'Position not found' };
    }

    return new Promise((resolve) => {
      const requestId = Date.now().toString();

      const messageHandler = (event: MessageEvent) => {
        const data = JSON.parse(event.data);

        if (data.type === 'trade' && data.requestId === requestId) {
          this.ws?.removeEventListener('message', messageHandler);
          
          if (data.retcode === 0 || data.success) {
            this.positions.delete(ticket);
            resolve({ success: true });
          } else {
            resolve({ success: false, error: data.error || 'Close failed' });
          }
        }
      };

      this.ws.addEventListener('message', messageHandler);

      // Close position by opening opposite
      this.ws.send(JSON.stringify({
        action: 'trade',
        requestId,
        order: {
          action: 'TRADE_ACTION_DEAL',
          symbol: position.symbol,
          volume: position.volume,
          type: position.type === 'buy' ? 'ORDER_TYPE_SELL' : 'ORDER_TYPE_BUY',
          position: ticket,
          deviation: 10,
          magic: 234000,
          comment: 'Waides KI Close'
        }
      }));

      setTimeout(() => {
        this.ws?.removeEventListener('message', messageHandler);
        resolve({ success: false, error: 'Close timeout' });
      }, 30000);
    });
  }

  /**
   * Get open positions
   */
  async getOpenPositions(): Promise<MT5Position[]> {
    if (!this.ws || !this.authenticated) {
      return [];
    }

    this.ws.send(JSON.stringify({
      action: 'getPositions'
    }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    return Array.from(this.positions.values());
  }

  /**
   * Modify position (update SL/TP)
   */
  async modifyPosition(ticket: number, stopLoss?: number, takeProfit?: number): Promise<{ success: boolean; error?: string }> {
    if (!this.ws || !this.authenticated) {
      return { success: false, error: 'Not connected or authenticated' };
    }

    return new Promise((resolve) => {
      const requestId = Date.now().toString();

      const messageHandler = (event: MessageEvent) => {
        const data = JSON.parse(event.data);

        if (data.type === 'trade' && data.requestId === requestId) {
          this.ws?.removeEventListener('message', messageHandler);
          
          if (data.retcode === 0 || data.success) {
            const position = this.positions.get(ticket);
            if (position) {
              position.stopLoss = stopLoss;
              position.takeProfit = takeProfit;
            }
            resolve({ success: true });
          } else {
            resolve({ success: false, error: data.error || 'Modify failed' });
          }
        }
      };

      this.ws.addEventListener('message', messageHandler);

      this.ws.send(JSON.stringify({
        action: 'trade',
        requestId,
        order: {
          action: 'TRADE_ACTION_SL_TP',
          position: ticket,
          sl: stopLoss || 0,
          tp: takeProfit || 0,
          magic: 234000
        }
      }));

      setTimeout(() => {
        this.ws?.removeEventListener('message', messageHandler);
        resolve({ success: false, error: 'Modify timeout' });
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

  async testConnection(): Promise<{ ok: boolean; reason?: string }> {
    return this.connect();
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
    console.log(`🔄 Attempting to reconnect to MT5 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, 5000 * this.reconnectAttempts);
  }

  /**
   * Disconnect from MT5
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.authenticated = false;
    this.positions.clear();
    console.log('📴 Disconnected from MT5');
  }
}

export { MT5Connector };
export default MT5Connector;
