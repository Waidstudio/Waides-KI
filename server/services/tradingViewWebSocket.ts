import WebSocket from 'ws';

export interface TradingViewCandlestickData {
  symbol: string;
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  interval: string;
  timestamp: number;
}

export interface TradingViewMessage {
  m: string; // method
  p: any[]; // parameters
}

export class TradingViewWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private isConnected: boolean = false;
  private candlestickListeners: ((data: TradingViewCandlestickData) => void)[] = [];
  private baseUrl: string = 'wss://data.tradingview.com/socket.io/websocket';
  private symbol: string = 'BINANCE:ETHUSDT';
  private interval: string = '1';
  private sessionId: string = this.generateSessionId();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.connect();
  }

  private generateSessionId(): string {
    return 'qs_' + Math.random().toString(36).substring(2, 15);
  }

  private connect(): void {
    try {
      this.ws = new WebSocket(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      this.ws.on('open', () => {
        console.log('✅ TradingView WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.authenticate();
        this.setupHeartbeat();
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const message = data.toString();
          this.handleMessage(message);
        } catch (error) {
          console.error('TradingView WebSocket message parsing error:', error);
        }
      });

      this.ws.on('close', () => {
        console.log('TradingView WebSocket disconnected');
        this.isConnected = false;
        this.cleanup();
        this.handleReconnect();
      });

      this.ws.on('error', (error: Error) => {
        console.error('TradingView WebSocket error:', error);
        this.isConnected = false;
      });

    } catch (error) {
      console.error('TradingView WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  private authenticate(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // Send authentication and setup messages
    this.sendMessage('set_auth_token', ['unauthorized_user_token']);
    this.sendMessage('chart_create_session', [this.sessionId, '']);
    this.sendMessage('quote_create_session', [this.sessionId]);
    
    // Request candlestick data
    this.subscribeToCandlesticks();
  }

  private subscribeToCandlesticks(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const seriesId = 'sds_1';
    this.sendMessage('quote_set_fields', [
      this.sessionId,
      'base-currency-logoid',
      'ch',
      'chp',
      'currency-logoid',
      'currency_code',
      'currency_id',
      'base_currency_id',
      'format',
      'fractional',
      'is_tradable',
      'language',
      'local_description',
      'listed_exchange',
      'logoid',
      'lp',
      'lp_time',
      'minmov',
      'minmove2',
      'original_name',
      'pricescale',
      'pro_name',
      'short_name',
      'type',
      'typespecs',
      'update_mode',
      'volume',
      'variable_tick_size'
    ]);

    this.sendMessage('quote_add_symbols', [this.sessionId, this.symbol]);
    
    // Create chart session for candlestick data
    this.sendMessage('resolve_symbol', [
      this.sessionId,
      seriesId,
      `={\"symbol\":\"${this.symbol}\",\"adjustment\":\"splits\",\"session\":\"extended\"}`
    ]);

    this.sendMessage('create_series', [
      this.sessionId,
      seriesId,
      's1',
      seriesId,
      this.interval,
      50
    ]);
  }

  private sendMessage(method: string, params: any[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message = JSON.stringify({
      m: method,
      p: params
    });

    this.ws.send(`~m~${message.length}~m~${message}`);
  }

  private handleMessage(data: string): void {
    // TradingView uses a specific message format: ~m~{length}~m~{message}
    const messages = data.split('~m~').filter(msg => msg && !msg.match(/^\d+$/));
    
    messages.forEach(msgStr => {
      try {
        const message: TradingViewMessage = JSON.parse(msgStr);
        this.processMessage(message);
      } catch (error) {
        // Ignore parsing errors for non-JSON messages
      }
    });
  }

  private processMessage(message: TradingViewMessage): void {
    if (!message.m || !message.p) return;

    switch (message.m) {
      case 'timescale_update':
        this.handleCandlestickUpdate(message.p);
        break;
      case 'du':
        this.handleDataUpdate(message.p);
        break;
      case 'quote_data':
        this.handleQuoteData(message.p);
        break;
    }
  }

  private handleCandlestickUpdate(params: any[]): void {
    try {
      if (params.length >= 2 && params[1] && params[1].sds_1) {
        const candleData = params[1].sds_1.s;
        if (candleData && candleData.length >= 6) {
          const [time, open, high, low, close, volume] = candleData[candleData.length - 1];
          
          const candlestickData: TradingViewCandlestickData = {
            symbol: this.symbol,
            time: time * 1000, // Convert to milliseconds
            open: parseFloat(open),
            high: parseFloat(high),
            low: parseFloat(low),
            close: parseFloat(close),
            volume: parseFloat(volume || 0),
            interval: this.interval,
            timestamp: Date.now()
          };

          this.notifyCandlestickListeners(candlestickData);
        }
      }
    } catch (error) {
      console.error('TradingView candlestick update error:', error);
    }
  }

  private handleDataUpdate(params: any[]): void {
    // Handle real-time data updates
    this.handleCandlestickUpdate(params);
  }

  private handleQuoteData(params: any[]): void {
    // Handle quote data updates (price, volume, etc.)
    console.log('TradingView quote data received');
  }

  private setupHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 30000); // 30 seconds
  }

  private cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`TradingView WebSocket reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    } else {
      console.error('TradingView WebSocket max reconnection attempts reached');
    }
  }

  private notifyCandlestickListeners(data: TradingViewCandlestickData): void {
    this.candlestickListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('TradingView candlestick listener error:', error);
      }
    });
  }

  public onCandlestickUpdate(callback: (data: TradingViewCandlestickData) => void): void {
    this.candlestickListeners.push(callback);
  }

  public removeCandlestickListener(callback: (data: TradingViewCandlestickData) => void): void {
    const index = this.candlestickListeners.indexOf(callback);
    if (index > -1) {
      this.candlestickListeners.splice(index, 1);
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public changeSymbol(symbol: string): void {
    this.symbol = symbol;
    if (this.isConnected) {
      this.subscribeToCandlesticks();
    }
  }

  public changeInterval(interval: string): void {
    this.interval = interval;
    if (this.isConnected) {
      this.subscribeToCandlesticks();
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.cleanup();
    this.isConnected = false;
  }
}