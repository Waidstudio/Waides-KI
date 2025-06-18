import WebSocket from 'ws';

export interface CandlestickData {
  symbol: string;
  openTime: number;
  closeTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  interval: string;
  isFinal: boolean;
  timestamp: number;
}

export interface BinanceKlineData {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  k: {
    t: number; // Kline start time
    T: number; // Kline close time
    s: string; // Symbol
    i: string; // Interval
    f: number; // First trade ID
    L: number; // Last trade ID
    o: string; // Open price
    c: string; // Close price
    h: string; // High price
    l: string; // Low price
    v: string; // Base asset volume
    n: number; // Number of trades
    x: boolean; // Is this kline closed?
    q: string; // Quote asset volume
    V: string; // Taker buy base asset volume
    Q: string; // Taker buy quote asset volume
    B: string; // Ignore
  };
}

export class BinanceWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 5000; // 5 seconds
  private isConnected: boolean = false;
  private candlestickListeners: ((data: CandlestickData) => void)[] = [];
  private baseUrl: string = 'wss://stream.binance.com:9443/ws/';
  private symbol: string = 'ethusdt'; // ETH/USDT pair
  private interval: string = '1m'; // 1-minute candlesticks

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      const streamName = `${this.symbol}@kline_${this.interval}`;
      this.ws = new WebSocket(`${this.baseUrl}${streamName}`);

      this.ws.on('open', () => {
        console.log('✅ Binance WebSocket connected for ETH/USDT candlesticks');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message: BinanceKlineData = JSON.parse(data.toString());
          if (message.e === 'kline') {
            const candlestick = this.parseCandlestickData(message);
            this.notifyCandlestickListeners(candlestick);
          }
        } catch (error) {
          console.error('Error parsing Binance WebSocket message:', error);
        }
      });

      this.ws.on('close', (code, reason) => {
        console.log(`🔌 Binance WebSocket closed: ${code} - ${reason}`);
        this.isConnected = false;
        this.handleReconnect();
      });

      this.ws.on('error', (error) => {
        console.error('❌ Binance WebSocket error:', error);
        this.isConnected = false;
      });

      this.ws.on('ping', (data) => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.pong(data);
        }
      });

    } catch (error) {
      console.error('Failed to connect to Binance WebSocket:', error);
      this.handleReconnect();
    }
  }

  private parseCandlestickData(message: BinanceKlineData): CandlestickData {
    const kline = message.k;
    return {
      symbol: kline.s,
      openTime: kline.t,
      closeTime: kline.T,
      open: parseFloat(kline.o),
      high: parseFloat(kline.h),
      low: parseFloat(kline.l),
      close: parseFloat(kline.c),
      volume: parseFloat(kline.v),
      interval: kline.i,
      isFinal: kline.x, // True when the kline is closed
      timestamp: Date.now()
    };
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect to Binance WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached for Binance WebSocket');
    }
  }

  private notifyCandlestickListeners(data: CandlestickData): void {
    this.candlestickListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in candlestick listener:', error);
      }
    });
  }

  public onCandlestickUpdate(callback: (data: CandlestickData) => void): void {
    this.candlestickListeners.push(callback);
  }

  public removeCandlestickListener(callback: (data: CandlestickData) => void): void {
    const index = this.candlestickListeners.indexOf(callback);
    if (index > -1) {
      this.candlestickListeners.splice(index, 1);
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  public changeSymbol(symbol: string): void {
    this.symbol = symbol.toLowerCase();
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  public changeInterval(interval: string): void {
    this.interval = interval;
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.candlestickListeners = [];
  }

  public ping(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.ping();
    }
  }

  // Get current market statistics from REST API
  public async getMarketStats(): Promise<any> {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${this.symbol.toUpperCase()}`);
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch Binance market stats:', error);
      throw error;
    }
  }

  // Get historical klines data
  public async getHistoricalKlines(limit: number = 100): Promise<any[]> {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${this.symbol.toUpperCase()}&interval=${this.interval}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      
      return data.map((kline: any[]) => ({
        openTime: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
        closeTime: kline[6],
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to fetch historical klines:', error);
      throw error;
    }
  }
}