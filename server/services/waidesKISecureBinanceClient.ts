/**
 * STEP 54: Secure Binance Client - Production-Ready Trading Integration
 * Unified API client for Binance with security, rate limiting, and error handling
 */

import crypto from 'crypto';

interface BinanceCredentials {
  apiKey: string;
  apiSecret: string;
  testnet?: boolean;
}

interface OrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  quantity?: string;
  quoteOrderQty?: string;
  price?: string;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

interface OrderResponse {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  fills: Array<{
    price: string;
    qty: string;
    commission: string;
    commissionAsset: string;
  }>;
}

interface AccountInfo {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  accountType: string;
  balances: Array<{
    asset: string;
    free: string;
    locked: string;
  }>;
  permissions: string[];
}

interface KlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

interface TickerPrice {
  symbol: string;
  price: string;
}

interface MarketDepth {
  lastUpdateId: number;
  bids: Array<[string, string]>; // [price, quantity]
  asks: Array<[string, string]>; // [price, quantity]
}

export class WaidesKISecureBinanceClient {
  private baseURL: string;
  private credentials: BinanceCredentials | null = null;
  private rateLimitWindow = new Map<string, number[]>();
  private readonly maxRequestsPerMinute = 1200; // Binance limit
  private readonly maxOrdersPerSecond = 10;
  private readonly requestTimeout = 10000; // 10 seconds

  constructor(testnet: boolean = false) {
    this.baseURL = testnet 
      ? 'https://testnet.binance.vision'
      : 'https://api.binance.com';
    
    this.initializeCredentials();
  }

  /**
   * Initialize secure credentials from environment
   */
  private initializeCredentials(): void {
    const apiKey = process.env.BINANCE_API_KEY;
    const apiSecret = process.env.BINANCE_API_SECRET;
    const testnet = process.env.BINANCE_TESTNET === 'true';

    if (apiKey && apiSecret) {
      this.credentials = {
        apiKey,
        apiSecret,
        testnet
      };
      console.log('🔐 Binance credentials loaded from environment');
    } else {
      console.warn('⚠️ Binance credentials not found in environment variables');
    }
  }

  /**
   * Check rate limits before making requests
   */
  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window

    if (!this.rateLimitWindow.has(endpoint)) {
      this.rateLimitWindow.set(endpoint, []);
    }

    const requests = this.rateLimitWindow.get(endpoint)!;
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= this.maxRequestsPerMinute) {
      return false;
    }

    recentRequests.push(now);
    this.rateLimitWindow.set(endpoint, recentRequests);
    return true;
  }

  /**
   * Create secure signature for authenticated requests
   */
  private createSignature(queryString: string): string {
    if (!this.credentials?.apiSecret) {
      throw new Error('API secret not configured');
    }
    
    return crypto
      .createHmac('sha256', this.credentials.apiSecret)
      .update(queryString)
      .digest('hex');
  }

  /**
   * Make secure HTTP request to Binance API
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    params: Record<string, any> = {},
    requiresAuth: boolean = false
  ): Promise<any> {
    
    // Check rate limits
    if (!this.checkRateLimit(endpoint)) {
      throw new Error(`Rate limit exceeded for endpoint: ${endpoint}`);
    }

    // Prepare query parameters
    const queryParams = new URLSearchParams();
    
    if (requiresAuth) {
      if (!this.credentials) {
        throw new Error('Authentication required but credentials not configured');
      }
      
      params.timestamp = Date.now();
      params.recvWindow = 60000; // 60 seconds
    }

    // Add parameters to query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    let url = `${this.baseURL}${endpoint}`;

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-MBX-APIKEY': this.credentials?.apiKey || ''
    };

    // Add signature for authenticated requests
    if (requiresAuth && this.credentials) {
      const signature = this.createSignature(queryString);
      url += `?${queryString}&signature=${signature}`;
    } else if (queryString) {
      url += `?${queryString}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

      const response = await fetch(url, {
        method,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Binance API error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown request error');
    }
  }

  /**
   * Get current server time (for synchronization)
   */
  async getServerTime(): Promise<{ serverTime: number }> {
    return this.makeRequest('/api/v3/time');
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<AccountInfo> {
    return this.makeRequest('/api/v3/account', 'GET', {}, true);
  }

  /**
   * Get current price for a symbol
   */
  async getPrice(symbol: string): Promise<TickerPrice> {
    return this.makeRequest('/api/v3/ticker/price', 'GET', { symbol });
  }

  /**
   * Get 24hr ticker price change statistics
   */
  async get24hrTicker(symbol: string): Promise<any> {
    return this.makeRequest('/api/v3/ticker/24hr', 'GET', { symbol });
  }

  /**
   * Get order book depth
   */
  async getOrderBook(symbol: string, limit: number = 100): Promise<MarketDepth> {
    return this.makeRequest('/api/v3/depth', 'GET', { symbol, limit });
  }

  /**
   * Get kline/candlestick data
   */
  async getKlines(
    symbol: string,
    interval: string = '1h',
    limit: number = 500,
    startTime?: number,
    endTime?: number
  ): Promise<KlineData[]> {
    const params: any = { symbol, interval, limit };
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const response = await this.makeRequest('/api/v3/klines', 'GET', params);
    
    return response.map((kline: any[]) => ({
      openTime: kline[0],
      open: kline[1],
      high: kline[2],
      low: kline[3],
      close: kline[4],
      volume: kline[5],
      closeTime: kline[6],
      quoteAssetVolume: kline[7],
      numberOfTrades: kline[8],
      takerBuyBaseAssetVolume: kline[9],
      takerBuyQuoteAssetVolume: kline[10]
    }));
  }

  /**
   * Place a new order
   */
  async placeOrder(orderRequest: OrderRequest): Promise<OrderResponse> {
    if (!this.credentials) {
      throw new Error('Authentication required for placing orders');
    }

    // Validate order parameters
    this.validateOrderRequest(orderRequest);

    return this.makeRequest('/api/v3/order', 'POST', orderRequest, true);
  }

  /**
   * Place a market buy order
   */
  async marketBuy(symbol: string, quoteOrderQty: string): Promise<OrderResponse> {
    return this.placeOrder({
      symbol,
      side: 'BUY',
      type: 'MARKET',
      quoteOrderQty
    });
  }

  /**
   * Place a market sell order
   */
  async marketSell(symbol: string, quantity: string): Promise<OrderResponse> {
    return this.placeOrder({
      symbol,
      side: 'SELL',
      type: 'MARKET',
      quantity
    });
  }

  /**
   * Place a limit order
   */
  async limitOrder(
    symbol: string,
    side: 'BUY' | 'SELL',
    quantity: string,
    price: string,
    timeInForce: 'GTC' | 'IOC' | 'FOK' = 'GTC'
  ): Promise<OrderResponse> {
    return this.placeOrder({
      symbol,
      side,
      type: 'LIMIT',
      quantity,
      price,
      timeInForce
    });
  }

  /**
   * Cancel an order
   */
  async cancelOrder(symbol: string, orderId: number): Promise<any> {
    return this.makeRequest('/api/v3/order', 'DELETE', { symbol, orderId }, true);
  }

  /**
   * Get order status
   */
  async getOrder(symbol: string, orderId: number): Promise<any> {
    return this.makeRequest('/api/v3/order', 'GET', { symbol, orderId }, true);
  }

  /**
   * Get all open orders
   */
  async getOpenOrders(symbol?: string): Promise<any[]> {
    const params = symbol ? { symbol } : {};
    return this.makeRequest('/api/v3/openOrders', 'GET', params, true);
  }

  /**
   * Get trade history
   */
  async getMyTrades(symbol: string, limit: number = 500): Promise<any[]> {
    return this.makeRequest('/api/v3/myTrades', 'GET', { symbol, limit }, true);
  }

  /**
   * Validate order request parameters
   */
  private validateOrderRequest(orderRequest: OrderRequest): void {
    if (!orderRequest.symbol) {
      throw new Error('Symbol is required');
    }

    if (!['BUY', 'SELL'].includes(orderRequest.side)) {
      throw new Error('Invalid order side');
    }

    if (!['MARKET', 'LIMIT'].includes(orderRequest.type)) {
      throw new Error('Invalid order type');
    }

    if (orderRequest.type === 'MARKET') {
      if (!orderRequest.quantity && !orderRequest.quoteOrderQty) {
        throw new Error('Market orders require either quantity or quoteOrderQty');
      }
    }

    if (orderRequest.type === 'LIMIT') {
      if (!orderRequest.quantity || !orderRequest.price) {
        throw new Error('Limit orders require both quantity and price');
      }
    }
  }

  /**
   * Check if credentials are configured
   */
  isAuthenticated(): boolean {
    return this.credentials !== null;
  }

  /**
   * Test connectivity and authentication
   */
  async testConnectivity(): Promise<{
    connectivity: boolean;
    authentication: boolean;
    serverTime?: number;
    accountStatus?: string;
    error?: string;
  }> {
    try {
      // Test basic connectivity
      const timeResult = await this.getServerTime();
      
      if (!this.credentials) {
        return {
          connectivity: true,
          authentication: false,
          serverTime: timeResult.serverTime,
          error: 'No credentials configured'
        };
      }

      // Test authentication
      const accountInfo = await this.getAccountInfo();
      
      return {
        connectivity: true,
        authentication: true,
        serverTime: timeResult.serverTime,
        accountStatus: accountInfo.canTrade ? 'active' : 'restricted'
      };
    } catch (error) {
      return {
        connectivity: false,
        authentication: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get comprehensive market data for a symbol
   */
  async getMarketData(symbol: string): Promise<{
    price: TickerPrice;
    ticker24hr: any;
    orderBook: MarketDepth;
    recentKlines: KlineData[];
  }> {
    const [price, ticker24hr, orderBook, recentKlines] = await Promise.all([
      this.getPrice(symbol),
      this.get24hrTicker(symbol),
      this.getOrderBook(symbol, 20),
      this.getKlines(symbol, '1h', 24) // Last 24 hours
    ]);

    return {
      price,
      ticker24hr,
      orderBook,
      recentKlines
    };
  }

  /**
   * Calculate technical indicators from kline data
   */
  calculateIndicators(klines: KlineData[]): {
    sma20: number;
    ema20: number;
    rsi14: number;
    currentPrice: number;
    volume24h: number;
  } {
    if (klines.length === 0) {
      throw new Error('No kline data provided');
    }

    const closes = klines.map(k => parseFloat(k.close));
    const volumes = klines.map(k => parseFloat(k.volume));
    const currentPrice = closes[closes.length - 1];

    // Simple Moving Average (20 periods)
    const sma20 = closes.slice(-20).reduce((sum, price) => sum + price, 0) / Math.min(20, closes.length);

    // Exponential Moving Average (20 periods)
    const multiplier = 2 / (20 + 1);
    let ema20 = closes[0];
    for (let i = 1; i < closes.length; i++) {
      ema20 = (closes[i] * multiplier) + (ema20 * (1 - multiplier));
    }

    // RSI (14 periods)
    let rsi14 = 50; // Default neutral RSI
    if (closes.length >= 15) {
      const changes = [];
      for (let i = 1; i < closes.length; i++) {
        changes.push(closes[i] - closes[i - 1]);
      }
      
      const gains = changes.slice(-14).filter(change => change > 0);
      const losses = changes.slice(-14).filter(change => change < 0).map(loss => Math.abs(loss));
      
      const avgGain = gains.length > 0 ? gains.reduce((sum, gain) => sum + gain, 0) / 14 : 0;
      const avgLoss = losses.length > 0 ? losses.reduce((sum, loss) => sum + loss, 0) / 14 : 0;
      
      if (avgLoss !== 0) {
        const rs = avgGain / avgLoss;
        rsi14 = 100 - (100 / (1 + rs));
      }
    }

    // 24h volume
    const volume24h = volumes.reduce((sum, volume) => sum + volume, 0);

    return {
      sma20: Number(sma20.toFixed(8)),
      ema20: Number(ema20.toFixed(8)),
      rsi14: Number(rsi14.toFixed(2)),
      currentPrice: Number(currentPrice.toFixed(8)),
      volume24h: Number(volume24h.toFixed(8))
    };
  }

  /**
   * Get exchange info (trading rules, filters, etc.)
   */
  async getExchangeInfo(symbol?: string): Promise<any> {
    const params = symbol ? { symbol } : {};
    return this.makeRequest('/api/v3/exchangeInfo', 'GET', params);
  }

  /**
   * Get rate limit usage
   */
  getRateLimitUsage(): Record<string, number> {
    const usage: Record<string, number> = {};
    const now = Date.now();
    const windowStart = now - 60000;

    this.rateLimitWindow.forEach((requests, endpoint) => {
      const recentRequests = requests.filter(time => time > windowStart);
      usage[endpoint] = recentRequests.length;
    });

    return usage;
  }
}

export const waidesKISecureBinanceClient = new WaidesKISecureBinanceClient(
  process.env.BINANCE_TESTNET === 'true'
);