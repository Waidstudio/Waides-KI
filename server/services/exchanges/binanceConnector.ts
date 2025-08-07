import { UniversalExchangeInterface, type ExchangeCredentials, type MarketData, type OrderBook, type Balance, type Order, type Trade, type ExchangeConnectionStatus } from './universalExchangeInterface';
import crypto from 'crypto';
import WS from 'ws';

export class BinanceConnector extends UniversalExchangeInterface {
  private websocket?: WS;
  private baseUrl: string;
  private lastPing: number = 0;
  private errorCount: number = 0;

  constructor(credentials: ExchangeCredentials) {
    super('BIN', credentials);
    this.baseUrl = credentials.sandbox ? 'https://testnet.binance.vision' : 'https://api.binance.com';
    this.initializeWebSocket();
  }

  // Connection Management
  async connect(): Promise<boolean> {
    try {
      await this.checkRateLimit();
      
      // Test connection by getting server time
      const response = await fetch(`${this.baseUrl}/api/v3/time`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Connected to Binance. Server time: ${new Date(data.serverTime)}`);
      
      this.lastPing = Date.now();
      return true;
    } catch (error) {
      console.error('Binance connection failed:', error);
      this.errorCount++;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = undefined;
    }
    await this.cleanup();
  }

  async getConnectionStatus(): Promise<ExchangeConnectionStatus> {
    try {
      const start = Date.now();
      await this.checkRateLimit();
      
      const response = await fetch(`${this.baseUrl}/api/v3/ping`);
      const latency = Date.now() - start;
      
      if (response.ok) {
        this.lastPing = Date.now();
        return {
          connected: true,
          lastPing: this.lastPing,
          latency,
          errorCount: this.errorCount,
          rateLimit: {
            remaining: 1200 - this.rateLimitCounter.size, // Binance allows 1200 requests per minute
            resetTime: Date.now() + 60000
          }
        };
      } else {
        this.errorCount++;
        throw new Error(`Ping failed: ${response.status}`);
      }
    } catch (error) {
      this.errorCount++;
      return {
        connected: false,
        lastPing: this.lastPing,
        latency: 0,
        errorCount: this.errorCount,
        rateLimit: {
          remaining: 0,
          resetTime: Date.now() + 60000
        }
      };
    }
  }

  // Market Data Methods
  async getMarketData(symbol: string): Promise<MarketData> {
    await this.checkRateLimit();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}`);
      if (!response.ok) {
        throw this.handleError(new Error(`HTTP ${response.status}`), 'getMarketData');
      }

      const data = await response.json();
      return {
        symbol: data.symbol,
        price: parseFloat(data.lastPrice),
        volume: parseFloat(data.volume),
        change24h: parseFloat(data.priceChangePercent),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        timestamp: Date.now()
      };
    } catch (error) {
      throw this.handleError(error, 'getMarketData');
    }
  }

  async getOrderBook(symbol: string, limit: number = 100): Promise<OrderBook> {
    await this.checkRateLimit();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v3/depth?symbol=${symbol.toUpperCase()}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        symbol: data.symbol || symbol,
        bids: data.bids.map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
        asks: data.asks.map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])]),
        timestamp: Date.now()
      };
    } catch (error) {
      throw this.handleError(error, 'getOrderBook');
    }
  }

  async getKlines(symbol: string, interval: string, limit: number = 500): Promise<Array<[number, number, number, number, number, number]>> {
    await this.checkRateLimit();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.map((kline: any[]) => [
        kline[0], // Open time
        parseFloat(kline[1]), // Open
        parseFloat(kline[2]), // High
        parseFloat(kline[3]), // Low
        parseFloat(kline[4]), // Close
        parseFloat(kline[5])  // Volume
      ]);
    } catch (error) {
      throw this.handleError(error, 'getKlines');
    }
  }

  // Account Methods
  async getBalances(): Promise<Balance[]> {
    try {
      const timestamp = Date.now();
      const params = `timestamp=${timestamp}`;
      const signature = this.generateSignature(params, this.credentials.apiSecret);
      
      await this.checkRateLimit();
      const response = await fetch(`${this.baseUrl}/api/v3/account?${params}&signature=${signature}`, {
        headers: this.createHeaders({
          'X-MBX-APIKEY': this.credentials.apiKey
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.balances.map((balance: any) => ({
        asset: balance.asset,
        free: parseFloat(balance.free),
        locked: parseFloat(balance.locked),
        total: parseFloat(balance.free) + parseFloat(balance.locked)
      })).filter((balance: Balance) => balance.total > 0);
    } catch (error) {
      throw this.handleError(error, 'getBalances');
    }
  }

  async getBalance(asset: string): Promise<Balance> {
    const balances = await this.getBalances();
    const balance = balances.find(b => b.asset === asset.toUpperCase());
    return balance || {
      asset: asset.toUpperCase(),
      free: 0,
      locked: 0,
      total: 0
    };
  }

  // Trading Methods
  async createOrder(symbol: string, side: 'buy' | 'sell', type: string, amount: number, price?: number, params?: any): Promise<Order> {
    try {
      const timestamp = Date.now();
      let orderParams = `symbol=${symbol.toUpperCase()}&side=${side.toUpperCase()}&type=${type.toUpperCase()}&quantity=${amount}&timestamp=${timestamp}`;
      
      if (type.toLowerCase() === 'limit' && price) {
        orderParams += `&price=${price}&timeInForce=GTC`;
      }

      const signature = this.generateSignature(orderParams, this.credentials.apiSecret);
      
      await this.checkRateLimit();
      const response = await fetch(`${this.baseUrl}/api/v3/order`, {
        method: 'POST',
        headers: this.createHeaders({
          'X-MBX-APIKEY': this.credentials.apiKey
        }),
        body: `${orderParams}&signature=${signature}`
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Order failed: ${errorData.msg || response.statusText}`);
      }

      const data = await response.json();
      return this.mapBinanceOrderToStandard(data);
    } catch (error) {
      throw this.handleError(error, 'createOrder');
    }
  }

  async cancelOrder(orderId: string, symbol: string): Promise<Order> {
    try {
      const timestamp = Date.now();
      const params = `symbol=${symbol.toUpperCase()}&orderId=${orderId}&timestamp=${timestamp}`;
      const signature = this.generateSignature(params, this.credentials.apiSecret);
      
      await this.checkRateLimit();
      const response = await fetch(`${this.baseUrl}/api/v3/order?${params}&signature=${signature}`, {
        method: 'DELETE',
        headers: this.createHeaders({
          'X-MBX-APIKEY': this.credentials.apiKey
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return this.mapBinanceOrderToStandard(data);
    } catch (error) {
      throw this.handleError(error, 'cancelOrder');
    }
  }

  async getOrder(orderId: string, symbol: string): Promise<Order> {
    try {
      const timestamp = Date.now();
      const params = `symbol=${symbol.toUpperCase()}&orderId=${orderId}&timestamp=${timestamp}`;
      const signature = this.generateSignature(params, this.credentials.apiSecret);
      
      await this.checkRateLimit();
      const response = await fetch(`${this.baseUrl}/api/v3/order?${params}&signature=${signature}`, {
        headers: this.createHeaders({
          'X-MBX-APIKEY': this.credentials.apiKey
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return this.mapBinanceOrderToStandard(data);
    } catch (error) {
      throw this.handleError(error, 'getOrder');
    }
  }

  async getOrders(symbol?: string, since?: number, limit: number = 500): Promise<Order[]> {
    try {
      const timestamp = Date.now();
      let params = `timestamp=${timestamp}`;
      
      if (symbol) params += `&symbol=${symbol.toUpperCase()}`;
      if (since) params += `&startTime=${since}`;
      if (limit) params += `&limit=${limit}`;
      
      const signature = this.generateSignature(params, this.credentials.apiSecret);
      
      await this.checkRateLimit();
      const response = await fetch(`${this.baseUrl}/api/v3/allOrders?${params}&signature=${signature}`, {
        headers: this.createHeaders({
          'X-MBX-APIKEY': this.credentials.apiKey
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.map((order: any) => this.mapBinanceOrderToStandard(order));
    } catch (error) {
      throw this.handleError(error, 'getOrders');
    }
  }

  async getOpenOrders(symbol?: string): Promise<Order[]> {
    try {
      const timestamp = Date.now();
      let params = `timestamp=${timestamp}`;
      if (symbol) params += `&symbol=${symbol.toUpperCase()}`;
      
      const signature = this.generateSignature(params, this.credentials.apiSecret);
      
      await this.checkRateLimit();
      const response = await fetch(`${this.baseUrl}/api/v3/openOrders?${params}&signature=${signature}`, {
        headers: this.createHeaders({
          'X-MBX-APIKEY': this.credentials.apiKey
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.map((order: any) => this.mapBinanceOrderToStandard(order));
    } catch (error) {
      throw this.handleError(error, 'getOpenOrders');
    }
  }

  async getTrades(symbol?: string, since?: number, limit: number = 500): Promise<Trade[]> {
    try {
      const timestamp = Date.now();
      let params = `timestamp=${timestamp}`;
      
      if (symbol) params += `&symbol=${symbol.toUpperCase()}`;
      if (since) params += `&startTime=${since}`;
      if (limit) params += `&limit=${limit}`;
      
      const signature = this.generateSignature(params, this.credentials.apiSecret);
      
      await this.checkRateLimit();
      const response = await fetch(`${this.baseUrl}/api/v3/myTrades?${params}&signature=${signature}`, {
        headers: this.createHeaders({
          'X-MBX-APIKEY': this.credentials.apiKey
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.map((trade: any) => ({
        id: trade.id.toString(),
        orderId: trade.orderId.toString(),
        symbol: trade.symbol,
        side: trade.isBuyer ? 'buy' : 'sell',
        amount: parseFloat(trade.qty),
        price: parseFloat(trade.price),
        cost: parseFloat(trade.quoteQty),
        fee: parseFloat(trade.commission),
        timestamp: trade.time
      }));
    } catch (error) {
      throw this.handleError(error, 'getTrades');
    }
  }

  // WebSocket Methods
  public async subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): Promise<void> {
    if (!this.websocket) {
      this.initializeWebSocket();
    }

    const stream = `${symbol.toLowerCase()}@ticker`;
    const subscribeMessage = {
      method: "SUBSCRIBE",
      params: [stream],
      id: Date.now()
    };

    if (this.websocket && this.websocket.readyState === WS.OPEN) {
      this.websocket.send(JSON.stringify(subscribeMessage));
      
      this.websocket.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.stream === stream && message.data) {
            const ticker = message.data;
            callback({
              symbol: ticker.s,
              price: parseFloat(ticker.c),
              volume: parseFloat(ticker.v),
              change24h: parseFloat(ticker.P),
              high24h: parseFloat(ticker.h),
              low24h: parseFloat(ticker.l),
              timestamp: ticker.E
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
    }
  }

  // Private Helper Methods
  private mapBinanceOrderToStandard(binanceOrder: any): Order {
    return {
      id: binanceOrder.orderId.toString(),
      symbol: binanceOrder.symbol,
      side: binanceOrder.side.toLowerCase(),
      type: binanceOrder.type.toLowerCase(),
      amount: parseFloat(binanceOrder.origQty),
      price: parseFloat(binanceOrder.price || '0'),
      stopPrice: parseFloat(binanceOrder.stopPrice || '0'),
      status: this.mapBinanceStatus(binanceOrder.status),
      filled: parseFloat(binanceOrder.executedQty),
      remaining: parseFloat(binanceOrder.origQty) - parseFloat(binanceOrder.executedQty),
      cost: parseFloat(binanceOrder.cummulativeQuoteQty || '0'),
      fee: 0, // Would need separate call to get fees
      timestamp: binanceOrder.time || binanceOrder.transactTime || Date.now(),
      lastTradeTimestamp: binanceOrder.updateTime
    };
  }

  private mapBinanceStatus(status: string): 'pending' | 'open' | 'closed' | 'cancelled' | 'failed' {
    switch (status) {
      case 'NEW':
      case 'PENDING_CANCEL':
        return 'pending';
      case 'PARTIALLY_FILLED':
        return 'open';
      case 'FILLED':
        return 'closed';
      case 'CANCELED':
      case 'REJECTED':
      case 'EXPIRED':
        return 'cancelled';
      default:
        return 'failed';
    }
  }

  protected initializeWebSocket(): void {
    if (this.config.websocketUrl) {
      this.websocket = new WS(this.config.websocketUrl + '/ws/');
      
      this.websocket.on('open', () => {
        console.log('Binance WebSocket connected');
      });

      this.websocket.on('error', (error) => {
        console.error('Binance WebSocket error:', error);
        this.errorCount++;
      });

      this.websocket.on('close', () => {
        console.log('Binance WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (!this.websocket || this.websocket.readyState === WS.CLOSED) {
            this.initializeWebSocket();
          }
        }, 5000);
      });
    }
  }
}