/**
 * IQOption Binary Options Connector
 * Real-time trading with IQOption broker
 * Market Type: Binary Options
 * For: WaidBot, WaidBot Pro, Maibot
 */

export interface IQOptionConfig {
  token: string;
  demo?: boolean;
  serverUrl?: string;
}

export interface IQOptionTradeParams {
  symbol: string;
  direction: 'call' | 'put';
  amount: number;
  duration: number; // in seconds
}

export interface IQOptionTradeResult {
  success: boolean;
  optionId?: string;
  buyPrice?: number;
  payout?: number;
  error?: string;
}

export interface IQOptionQuote {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  timestamp: number;
}

class IQOptionConnector {
  private config: IQOptionConfig;
  private ws: WebSocket | null = null;
  private connected: boolean = false;
  private authenticated: boolean = false;
  private balance: number = 0;
  private currency: string = 'USD';
  private quotes: Map<string, IQOptionQuote> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private ssid: string | null = null;

  constructor(config: IQOptionConfig) {
    this.config = {
      demo: true,
      serverUrl: 'wss://iqoption.com/echo/websocket',
      ...config
    };
  }

  /**
   * Connect to IQOption WebSocket
   */
  async connect(): Promise<{ ok: boolean; reason?: string }> {
    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(this.config.serverUrl!);

        this.ws.onopen = () => {
          console.log('📡 IQOption WebSocket connected');
          this.connected = true;
          this.authenticate();
          resolve({ ok: true });
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          console.error('❌ IQOption WebSocket error:', error);
          resolve({ ok: false, reason: 'WebSocket connection error' });
        };

        this.ws.onclose = () => {
          console.log('📴 IQOption WebSocket disconnected');
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
        console.error('❌ Error connecting to IQOption:', error);
        resolve({ ok: false, reason: String(error) });
      }
    });
  }

  /**
   * Authenticate with IQOption
   */
  private authenticate(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // IQOption uses a specific message format for authentication
    this.ws.send(JSON.stringify({
      name: 'auth',
      msg: {
        email: this.config.token,
        token: this.config.token,
        demo: this.config.demo ? 1 : 0
      }
    }));
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: any): void {
    // Handle authentication response
    if (data.name === 'auth' || data.auth) {
      if (data.success) {
        this.authenticated = true;
        this.ssid = data.ssid;
        console.log('✅ IQOption authenticated');
        this.getBalance();
      } else {
        console.error('❌ IQOption authentication failed:', data.message);
      }
    }

    // Handle profile/balance data
    if (data.name === 'profile') {
      this.balance = data.balance || 0;
      this.currency = data.currency || 'USD';
    }

    // Handle price updates (candles)
    if (data.name === 'candle' || data.name === 'batch-candle') {
      const symbol = data.params?.name || data.asset || 'UNKNOWN';
      const candle = data.data || {};
      
      const quote: IQOptionQuote = {
        symbol,
        bid: candle.close || 0,
        ask: candle.close || 0,
        last: candle.close || 0,
        timestamp: candle.time || Date.now()
      };
      this.quotes.set(symbol, quote);
    }

    // Handle option results
    if (data.name === 'option' || data.result) {
      console.log('📊 IQOption trade result:', data);
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
      name: 'profile',
      msg: true
    }));

    await new Promise(resolve => setTimeout(resolve, 500));

    return { balance: this.balance, currency: this.currency };
  }

  /**
   * Get price for a symbol
   */
  async getPrice(symbol: string): Promise<IQOptionQuote | null> {
    const cached = this.quotes.get(symbol);
    if (cached) return cached;

    if (!this.ws || !this.authenticated) {
      return null;
    }

    // Request candle data
    this.ws.send(JSON.stringify({
      name: 'candle',
      params: {
        asset: symbol,
        size: 1,
        count: 1
      }
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
      name: 'subscribe',
      params: {
        asset: symbol
      }
    }));

    (this as any)[`price_${symbol}`] = callback;
  }

  /**
   * Unsubscribe from price updates
   */
  unsubscribeFromPrice(symbol: string): void {
    if (!this.ws || !this.authenticated) return;

    this.ws.send(JSON.stringify({
      name: 'unsubscribe',
      params: {
        asset: symbol
      }
    }));
  }

  /**
   * Place a binary option trade
   */
  async placeBinaryTrade(params: IQOptionTradeParams): Promise<IQOptionTradeResult> {
    if (!this.ws || !this.authenticated) {
      return { success: false, error: 'Not connected or authenticated' };
    }

    return new Promise((resolve) => {
      const requestId = Date.now().toString();

      const messageHandler = (event: MessageEvent) => {
        const data = JSON.parse(event.data);

        if (data.name === 'option' && data.requestId === requestId) {
          this.ws?.removeEventListener('message', messageHandler);
          
          if (data.success) {
            resolve({
              success: true,
              optionId: data.id,
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

      // IQOption binary options trade format
      this.ws.send(JSON.stringify({
        name: 'binary-options',
        msg: {
          requestId,
          active: params.symbol,
          direction: params.direction,
          amount: params.amount,
          expiry: Math.floor(Date.now() / 1000) + params.duration,
          type: 'binary-option'
        }
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
      name: 'get-options',
      msg: {
        open: true
      }
    }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    return [];
  }

  /**
   * Sell a contract before expiry
   */
  async sellContract(optionId: string, amount: number = 0): Promise<{ success: boolean; error?: string }> {
    if (!this.ws || !this.authenticated) {
      return { success: false, error: 'Not connected or authenticated' };
    }

    this.ws.send(JSON.stringify({
      name: 'sell-binary-option',
      msg: {
        optionId,
        amount
      }
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
    console.log(`🔄 Attempting to reconnect to IQOption (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, 5000 * this.reconnectAttempts);
  }

  /**
   * Disconnect from IQOption
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.authenticated = false;
    this.ssid = null;
    console.log('📴 Disconnected from IQOption');
  }
}

export { IQOptionConnector };
export default IQOptionConnector;
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async testConnection(): Promise<{ ok: boolean; reason?: string }> {
    return this.connect();
  }

  disconnect(): void {
    this.connected = false;
    this.ssid = null;
  }
}

export default IQOptionConnector;
