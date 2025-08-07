import { getExchangeConfig, type ExchangeConfig } from './exchangeConfig';
import crypto from 'crypto';

export interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase?: string; // For exchanges like OKX
  sandbox?: boolean;
}

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  change24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

export interface OrderBook {
  symbol: string;
  bids: Array<[number, number]>; // [price, quantity]
  asks: Array<[number, number]>;
  timestamp: number;
}

export interface Balance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  amount: number;
  price?: number;
  stopPrice?: number;
  status: 'pending' | 'open' | 'closed' | 'cancelled' | 'failed';
  filled: number;
  remaining: number;
  cost: number;
  fee: number;
  timestamp: number;
  lastTradeTimestamp?: number;
}

export interface Trade {
  id: string;
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  cost: number;
  fee: number;
  timestamp: number;
}

export interface ExchangeConnectionStatus {
  connected: boolean;
  lastPing: number;
  latency: number;
  errorCount: number;
  rateLimit: {
    remaining: number;
    resetTime: number;
  };
}

export abstract class UniversalExchangeInterface {
  protected config: ExchangeConfig;
  protected credentials: ExchangeCredentials;
  protected rateLimitCounter: Map<string, number> = new Map();
  protected lastRequestTime: number = 0;

  constructor(exchangeCode: string, credentials: ExchangeCredentials) {
    const config = getExchangeConfig(exchangeCode);
    if (!config) {
      throw new Error(`Unsupported exchange: ${exchangeCode}`);
    }
    this.config = config;
    this.credentials = credentials;
  }

  // Abstract methods that each exchange connector must implement
  abstract connect(): Promise<boolean>;
  abstract disconnect(): Promise<void>;
  abstract getConnectionStatus(): Promise<ExchangeConnectionStatus>;
  
  // Market data methods
  abstract getMarketData(symbol: string): Promise<MarketData>;
  abstract getOrderBook(symbol: string, limit?: number): Promise<OrderBook>;
  abstract getKlines(symbol: string, interval: string, limit?: number): Promise<Array<[number, number, number, number, number, number]>>;
  
  // Account methods
  abstract getBalances(): Promise<Balance[]>;
  abstract getBalance(asset: string): Promise<Balance>;
  
  // Trading methods
  abstract createOrder(symbol: string, side: 'buy' | 'sell', type: string, amount: number, price?: number, params?: any): Promise<Order>;
  abstract cancelOrder(orderId: string, symbol: string): Promise<Order>;
  abstract getOrder(orderId: string, symbol: string): Promise<Order>;
  abstract getOrders(symbol?: string, since?: number, limit?: number): Promise<Order[]>;
  abstract getOpenOrders(symbol?: string): Promise<Order[]>;
  abstract getTrades(symbol?: string, since?: number, limit?: number): Promise<Trade[]>;

  // Utility methods
  public getExchangeInfo(): ExchangeConfig {
    return this.config;
  }

  public getExchangeCode(): string {
    return this.config.code;
  }

  public getExchangeName(): string {
    return this.config.name;
  }

  public getSupportedPairs(): string[] {
    return this.config.tradingPairs;
  }

  public getMinOrderSize(symbol: string): number {
    return this.config.minOrderSizes[symbol] || 0;
  }

  public getFees(): { maker: number; taker: number } {
    return this.config.fees;
  }

  public supportsFeature(feature: keyof ExchangeConfig['features']): boolean {
    return this.config.features[feature];
  }

  // Rate limiting
  protected async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.config.rateLimit.window;
    
    // Clean old entries
    for (const [timestamp] of Array.from(this.rateLimitCounter.entries())) {
      if (parseInt(timestamp) < windowStart) {
        this.rateLimitCounter.delete(timestamp);
      }
    }

    // Check if we're within limits
    if (this.rateLimitCounter.size >= this.config.rateLimit.requests) {
      const oldestRequest = Math.min(...Array.from(this.rateLimitCounter.keys()).map(k => parseInt(k)));
      const waitTime = oldestRequest + this.config.rateLimit.window - now;
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // Add current request
    this.rateLimitCounter.set(now.toString(), now);
    this.lastRequestTime = now;
  }

  // Authentication helpers
  protected generateSignature(message: string, secret: string, algorithm: string = 'sha256'): string {
    return crypto.createHmac(algorithm, secret).update(message).digest('hex');
  }

  protected generateTimestamp(): number {
    return Date.now();
  }

  protected createHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'User-Agent': 'WaidesKI/1.0',
      ...additionalHeaders
    };
  }

  // Error handling
  protected handleError(error: any, context: string): Error {
    console.error(`${this.config.name} error in ${context}:`, error);
    
    if (error.response?.status === 429) {
      return new Error(`Rate limit exceeded for ${this.config.name}`);
    }
    
    if (error.response?.status === 401) {
      return new Error(`Authentication failed for ${this.config.name}. Check API credentials.`);
    }
    
    if (error.response?.status === 403) {
      return new Error(`Insufficient permissions for ${this.config.name}. Check API key permissions.`);
    }
    
    return new Error(`${this.config.name} API error: ${error.message || 'Unknown error'}`);
  }

  // WebSocket support
  protected websocketUrl?: string;
  protected websocket?: WebSocket;

  protected initializeWebSocket(): void {
    if (!this.config.websocketUrl) {
      console.warn(`WebSocket not supported for ${this.config.name}`);
      return;
    }
    
    this.websocketUrl = this.config.websocketUrl;
  }

  public async subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): Promise<void> {
    // Default implementation - should be overridden by specific exchanges
    throw new Error(`WebSocket market data subscription not implemented for ${this.config.name}`);
  }

  public async subscribeToOrderBook(symbol: string, callback: (data: OrderBook) => void): Promise<void> {
    // Default implementation - should be overridden by specific exchanges
    throw new Error(`WebSocket order book subscription not implemented for ${this.config.name}`);
  }

  public async subscribeToTrades(symbol: string, callback: (data: Trade) => void): Promise<void> {
    // Default implementation - should be overridden by specific exchanges
    throw new Error(`WebSocket trades subscription not implemented for ${this.config.name}`);
  }

  // Cleanup
  public async cleanup(): Promise<void> {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = undefined;
    }
    this.rateLimitCounter.clear();
  }
}