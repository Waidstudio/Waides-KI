/**
 * PocketOption Binary Options Connector
 * Real-time trading with PocketOption broker
 * Market Type: Binary Options
 * For: WaidBot, WaidBot Pro, Maibot
 */

export interface PocketOptionConfig {
  token: string;
  ssid?: string;
  demo?: boolean;
  serverUrl?: string;
}

export interface PocketOptionTradeParams {
  symbol: string;
  direction: 'call' | 'put';
  amount: number;
  duration: number; // in seconds
}

export interface PocketOptionTradeResult {
  success: boolean;
  contractId?: string;
  buyPrice?: number;
  payout?: number;
  error?: string;
}

export interface PocketOptionQuote {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  timestamp: number;
}

class PocketOptionConnector {
  private config: PocketOptionConfig;
  private ws: WebSocket | null = null;
  private connected: boolean = false;
  private authenticated: boolean = false;
  private balance: number = 0;
  private currency: string = 'USD';
  private quotes: Map<string, PocketOptionQuote> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(config: PocketOptionConfig) {
    this.config = {
      demo: true,
      serverUrl: 'wss://pocketoption.com/ws',
      ...config
    };
  }

  /**
   * Connect to PocketOption WebSocket
   */
  async connect(): Promise<{ ok: boolean; reason?: string }> {
    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(this.config.serverUrl!);

        this.ws.onopen = () => {
          console.log('📡 PocketOption WebSocket connected');
          this.connected = true;
          this.authenticate();
          resolve({ ok: true });
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          console.error('❌ PocketOption WebSocket error:', error);
          resolve({ ok: false, reason: 'WebSocket connection error' });
        };

        this.ws.onclose = () => {
          console.log('📴 PocketOption WebSocket disconnected');
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
        console.error('❌ Error connecting to PocketOption:', error);
        resolve({ ok: false, reason: String(error) });
      }
    });
  }

  /**
   * Authenticate with PocketOption
   */
  private authenticate(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(JSON.stringify({
      method: 'auth',
      token: this.config.token,
      ssid: this.config.ssid,
      demo: this.config.demo ? 1 : 0
    }));
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: any): void {
    if (data.method === 'auth') {
      if (data.success) {
        this.authenticated = true;
        console.log('✅ PocketOption authenticated');
        this.getBalance();
      } else {
        console.error('❌ PocketOption authentication failed:', data.message);
      }
    }

    if (data.method === 'profile') {
      this.balance = data.balance || 0;
      this.currency = data.currency || 'USD';
    }

    if (data.method === 'tick') {
      const quote: PocketOptionQuote = {
        symbol: data.asset,
        bid: data.bid,
        ask: data.ask,
        last: data.price,
        timestamp: data.time
      };
      this.quotes.set(data.asset, quote);
    }

    if (data.method === 'option' || data.type === 'result') {
      console.log('📊 PocketOption trade result:', data);
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
      method: 'getProfile'
    }));

    await new Promise(resolve => setTimeout(resolve, 500));

    return { balance: this.balance, currency: this.currency };
  }

  /**
   * Get price for a symbol
   */
  async getPrice(symbol: string): Promise<PocketOptionQuote | null> {
    const cached = this.quotes.get(symbol);
    if (cached) return cached;

    if (!this.ws || !this.authenticated) {
      return null;
    }

    this.ws.send(JSON.stringify({
      method: 'getAsset',
      asset: symbol
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
      method: 'subscribe',
      asset: symbol
    }));

    (this as any)[`price_${symbol}`] = callback;
  }

  /**
   * Unsubscribe from price updates
   */
  unsubscribeFromPrice(symbol: string): void {
    if (!this.ws || !this.authenticated) return;

    this.ws.send(JSON.stringify({
      method: 'unsubscribe',
      asset: symbol
    }));
  }

  /**
   * Place a binary option trade
   */
  async placeBinaryTrade(params: PocketOptionTradeParams): Promise<PocketOptionTradeResult> {
    if (!this.ws || !this.authenticated) {
      return { success: false, error: 'Not connected or authenticated' };
    }

    return new Promise((resolve) => {
      const tradeId = Date.now().toString();

      const messageHandler = (event: MessageEvent) => {
        const data = JSON.parse(event.data);

        if ((data.method === 'option' || data.id === tradeId) && data.success !== undefined) {
          this.ws?.removeEventListener('message', messageHandler);
          
          if (data.success) {
            resolve({
              success: true,
              contractId: data.id,
              buyPrice: data.price,
              payout: data.payout
            });
          } else {
            resolve({
              success: false,
              error: data.message || 'Trade failed'
            });
          }
        }
      };

      this.ws.addEventListener('message', messageHandler);

      this.ws.send(JSON.stringify({
        method: 'openOption',
        id: tradeId,
        asset: params.symbol,
        direction: params.direction === 'call' ? 1 : 0,
        amount: params.amount,
        duration: params.duration,
        expiry: Math.floor(Date.now() / 1000) + params.duration
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
  async getOpenPositions(): Promise<any[]> {
    if (!this.ws || !this.authenticated) {
      return [];
    }

    this.ws.send(JSON.stringify({
      method: 'getOptions'
    }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    return [];
  }

  /**
   * Sell a contract before expiry
   */
  async sellContract(contractId: string, amount: number = 0): Promise<{ success: boolean; error?: string }> {
    if (!this.ws || !this.authenticated) {
      return { success: false, error: 'Not connected or authenticated' };
    }

    this.ws.send(JSON.stringify({
      method: 'closeOption',
      id: contractId,
      amount
    }));

    return { success: true };
  }

  /**
   * Get connector status
   */
  getStatus(): { connected: boolean; authenticated: boolean } {
    return {
      connected: this.connected,
      authenticated: this.authenticated
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
    console.log(`🔄 Attempting to reconnect to PocketOption (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, 5000 * this.reconnectAttempts);
  }

  /**
   * Disconnect from PocketOption
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.authenticated = false;
    console.log('📴 Disconnected from PocketOption');
  }
}

export { PocketOptionConnector };
export default PocketOptionConnector;
