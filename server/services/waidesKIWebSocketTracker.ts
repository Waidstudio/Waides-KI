import WebSocket from 'ws';

interface ETHPriceUpdate {
  price: number;
  timestamp: number;
  volume: number;
  symbol: string;
}

interface TradeData {
  e: string;      // Event type
  E: number;      // Event time
  s: string;      // Symbol
  t: number;      // Trade ID
  p: string;      // Price
  q: string;      // Quantity
  b: number;      // Buyer order ID
  a: number;      // Seller order ID
  T: number;      // Trade time
  m: boolean;     // Is buyer market maker?
  M: boolean;     // Ignore
}

export class WaidesKIWebSocketTracker {
  private ws: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private priceUpdateListeners: ((update: ETHPriceUpdate) => void)[] = [];
  private lastPrice: number = 0;
  private lastUpdate: number = 0;
  private connectionAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private isConnected: boolean = false;
  private priceHistory: ETHPriceUpdate[] = [];
  private maxHistorySize: number = 1000;

  // WebSocket URL for ETH/USDT trades
  private readonly wsUrl = 'wss://stream.binance.com:9443/ws/ethusdt@trade';

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      if (this.ws) {
        this.ws.terminate();
      }

      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.on('open', () => {
        this.isConnected = true;
        this.connectionAttempts = 0;
        console.log('🔄 Waides KI WebSocket tracker connected to Binance ETH stream');
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const trade: TradeData = JSON.parse(data.toString());
          this.handleTradeUpdate(trade);
        } catch (error) {
          console.error('Error parsing trade data:', error);
        }
      });

      this.ws.on('close', (code: number, reason: Buffer) => {
        this.isConnected = false;
        console.log(`🔌 Waides KI WebSocket closed: ${code} - ${reason.toString()}`);
        this.handleReconnect();
      });

      this.ws.on('error', (error: Error) => {
        this.isConnected = false;
        console.error('❌ Waides KI WebSocket error:', error);
        this.handleReconnect();
      });

      // Send ping every 30 seconds to keep connection alive
      this.startHeartbeat();

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleReconnect();
    }
  }

  private handleTradeUpdate(trade: TradeData): void {
    const price = parseFloat(trade.p);
    const quantity = parseFloat(trade.q);
    const timestamp = trade.T;

    if (price > 0) {
      this.lastPrice = price;
      this.lastUpdate = timestamp;

      const priceUpdate: ETHPriceUpdate = {
        price,
        timestamp,
        volume: quantity,
        symbol: trade.s
      };

      // Add to price history
      this.addToPriceHistory(priceUpdate);

      // Notify all listeners
      this.notifyPriceUpdateListeners(priceUpdate);
    }
  }

  private addToPriceHistory(update: ETHPriceUpdate): void {
    this.priceHistory.push(update);
    
    // Keep only latest updates
    if (this.priceHistory.length > this.maxHistorySize) {
      this.priceHistory = this.priceHistory.slice(-this.maxHistorySize);
    }
  }

  private notifyPriceUpdateListeners(update: ETHPriceUpdate): void {
    this.priceUpdateListeners.forEach(listener => {
      try {
        listener(update);
      } catch (error) {
        console.error('Error in price update listener:', error);
      }
    });
  }

  private handleReconnect(): void {
    if (this.connectionAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached for WebSocket tracker');
      return;
    }

    this.connectionAttempts++;
    const delay = Math.min(5000 * Math.pow(2, this.connectionAttempts - 1), 30000);
    
    console.log(`🔄 Attempting to reconnect WebSocket tracker (${this.connectionAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    this.reconnectInterval = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    // Send ping every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      } else {
        clearInterval(heartbeatInterval);
      }
    }, 30000);
  }

  // PUBLIC INTERFACE METHODS

  // Get current ETH price
  getCurrentPrice(): number {
    return this.lastPrice;
  }

  // Get last update timestamp
  getLastUpdate(): number {
    return this.lastUpdate;
  }

  // Get connection status
  getConnectionStatus(): {
    isConnected: boolean;
    lastPrice: number;
    lastUpdate: number;
    connectionAttempts: number;
    priceHistorySize: number;
  } {
    return {
      isConnected: this.isConnected,
      lastPrice: this.lastPrice,
      lastUpdate: this.lastUpdate,
      connectionAttempts: this.connectionAttempts,
      priceHistorySize: this.priceHistory.length
    };
  }

  // Get recent price history
  getRecentPrices(count: number = 50): ETHPriceUpdate[] {
    return this.priceHistory.slice(-count);
  }

  // Calculate price change over time period
  getPriceChange(minutes: number = 5): {
    priceChange: number;
    priceChangePercent: number;
    startPrice: number;
    currentPrice: number;
  } {
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    const historicalPrices = this.priceHistory.filter(p => p.timestamp >= cutoffTime);
    
    if (historicalPrices.length === 0) {
      return {
        priceChange: 0,
        priceChangePercent: 0,
        startPrice: this.lastPrice,
        currentPrice: this.lastPrice
      };
    }

    const startPrice = historicalPrices[0].price;
    const currentPrice = this.lastPrice;
    const priceChange = currentPrice - startPrice;
    const priceChangePercent = startPrice > 0 ? (priceChange / startPrice) * 100 : 0;

    return {
      priceChange,
      priceChangePercent,
      startPrice,
      currentPrice
    };
  }

  // Calculate average volume over time period
  getAverageVolume(minutes: number = 5): number {
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    const recentTrades = this.priceHistory.filter(p => p.timestamp >= cutoffTime);
    
    if (recentTrades.length === 0) return 0;
    
    const totalVolume = recentTrades.reduce((sum, trade) => sum + trade.volume, 0);
    return totalVolume / recentTrades.length;
  }

  // Get trading activity analysis
  getTradingActivity(): {
    tradesLastMinute: number;
    tradesLast5Minutes: number;
    avgVolumeLastMinute: number;
    priceVolatility: number;
  } {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const fiveMinutesAgo = now - 300000;

    const tradesLastMinute = this.priceHistory.filter(p => p.timestamp >= oneMinuteAgo).length;
    const tradesLast5Minutes = this.priceHistory.filter(p => p.timestamp >= fiveMinutesAgo).length;
    
    const lastMinuteTrades = this.priceHistory.filter(p => p.timestamp >= oneMinuteAgo);
    const avgVolumeLastMinute = lastMinuteTrades.length > 0 ? 
      lastMinuteTrades.reduce((sum, t) => sum + t.volume, 0) / lastMinuteTrades.length : 0;

    // Calculate price volatility (standard deviation of last 50 prices)
    const recentPrices = this.priceHistory.slice(-50).map(p => p.price);
    const avgPrice = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
    const variance = recentPrices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / recentPrices.length;
    const priceVolatility = Math.sqrt(variance);

    return {
      tradesLastMinute,
      tradesLast5Minutes,
      avgVolumeLastMinute,
      priceVolatility
    };
  }

  // Subscribe to price updates
  onPriceUpdate(callback: (update: ETHPriceUpdate) => void): void {
    this.priceUpdateListeners.push(callback);
  }

  // Unsubscribe from price updates
  removePriceUpdateListener(callback: (update: ETHPriceUpdate) => void): void {
    const index = this.priceUpdateListeners.indexOf(callback);
    if (index > -1) {
      this.priceUpdateListeners.splice(index, 1);
    }
  }

  // Force reconnection
  forceReconnect(): void {
    this.connectionAttempts = 0;
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
    }
    this.connect();
  }

  // Get live market data summary
  getMarketSummary(): {
    currentPrice: number;
    priceChange24h: number;
    priceChangePercent24h: number;
    volume24h: number;
    high24h: number;
    low24h: number;
    lastUpdate: string;
    isLive: boolean;
  } {
    const priceChange5min = this.getPriceChange(5);
    const activity = this.getTradingActivity();
    
    // Calculate 24h stats from available data
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const dayTrades = this.priceHistory.filter(p => p.timestamp >= dayAgo);
    
    const prices = dayTrades.map(t => t.price);
    const high24h = prices.length > 0 ? Math.max(...prices) : this.lastPrice;
    const low24h = prices.length > 0 ? Math.min(...prices) : this.lastPrice;
    const volume24h = dayTrades.reduce((sum, t) => sum + t.volume, 0);

    return {
      currentPrice: this.lastPrice,
      priceChange24h: priceChange5min.priceChange, // Using 5min as approximation
      priceChangePercent24h: priceChange5min.priceChangePercent,
      volume24h,
      high24h,
      low24h,
      lastUpdate: new Date(this.lastUpdate).toISOString(),
      isLive: this.isConnected && (Date.now() - this.lastUpdate) < 10000 // Live if updated within 10 seconds
    };
  }

  // Cleanup method
  disconnect(): void {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
    }
    
    if (this.ws) {
      this.ws.terminate();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.priceUpdateListeners = [];
  }
}

export const waidesKIWebSocketTracker = new WaidesKIWebSocketTracker();