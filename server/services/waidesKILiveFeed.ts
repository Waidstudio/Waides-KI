import { storage } from '../storage';
import { waidesKIObserver } from './waidesKIObserver';

interface LiveETHData {
  price: number;
  ema50: number;
  ema200: number;
  vwap: number;
  rsi: number;
  volume: number;
  trend: 'UPTREND' | 'DOWNTREND' | 'RANGING';
  vwap_status: 'ABOVE' | 'BELOW';
  timestamp: number;
  source: 'BINANCE_WS' | 'BINANCE_API' | 'DATABASE';
}

interface MarketStats {
  dailyChange: number;
  dailyChangePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  priceChange1h: number;
  priceChange4h: number;
}

export class WaidesKILiveFeed {
  private lastUpdate: number = 0;
  private updateInterval: number = 15000; // 15 seconds
  private fallbackMode: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor() {
    this.initializeLiveFeed();
  }

  private async initializeLiveFeed(): Promise<void> {
    // Start continuous live data monitoring
    setInterval(async () => {
      await this.updateLiveData();
    }, this.updateInterval);
  }

  // MAIN LIVE DATA FETCHER
  async fetchLiveETHData(): Promise<LiveETHData | null> {
    try {
      // Primary source: Use observer's current data (powered by Binance WS)
      const observerAssessment = waidesKIObserver.getCurrentAssessment();
      
      if (observerAssessment.indicators) {
        return {
          price: observerAssessment.indicators.price,
          ema50: observerAssessment.indicators.ema50,
          ema200: observerAssessment.indicators.ema200,
          vwap: observerAssessment.indicators.vwap,
          rsi: observerAssessment.indicators.rsi,
          volume: observerAssessment.indicators.volume,
          trend: observerAssessment.indicators.trend,
          vwap_status: observerAssessment.indicators.vwap_status,
          timestamp: observerAssessment.indicators.timestamp,
          source: 'BINANCE_WS'
        };
      }

      // Fallback 1: Direct Binance API call
      const binanceData = await this.fetchFromBinanceAPI();
      if (binanceData) {
        return binanceData;
      }

      // Fallback 2: Latest database data
      const dbData = await this.fetchFromDatabase();
      if (dbData) {
        return dbData;
      }

      return null;
    } catch (error) {
      this.retryCount++;
      if (this.retryCount <= this.maxRetries) {
        // Retry with exponential backoff
        setTimeout(() => this.fetchLiveETHData(), this.retryCount * 2000);
      }
      return null;
    }
  }

  // BINANCE API FALLBACK
  private async fetchFromBinanceAPI(): Promise<LiveETHData | null> {
    try {
      // Fetch recent candlesticks for calculations
      const klinesResponse = await fetch(
        'https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1m&limit=200'
      );
      
      if (!klinesResponse.ok) {
        throw new Error(`Binance API error: ${klinesResponse.status}`);
      }
      
      const klines = await klinesResponse.json();
      
      if (!klines || klines.length < 50) {
        throw new Error('Insufficient kline data');
      }

      // Extract OHLCV data
      const closes = klines.map((k: any) => parseFloat(k[4]));
      const highs = klines.map((k: any) => parseFloat(k[2]));
      const lows = klines.map((k: any) => parseFloat(k[3]));
      const volumes = klines.map((k: any) => parseFloat(k[5]));

      const currentPrice = closes[closes.length - 1];
      const ema50 = this.calculateEMA(closes, 50);
      const ema200 = this.calculateEMA(closes, 200);
      const vwap = this.calculateVWAP(highs, lows, closes, volumes);
      const rsi = this.calculateRSI(closes);
      const volume = volumes[volumes.length - 1];

      const trend = this.determineTrend(currentPrice, ema50, ema200);
      const vwap_status = currentPrice > vwap ? 'ABOVE' : 'BELOW';

      this.fallbackMode = false;
      this.retryCount = 0;

      return {
        price: currentPrice,
        ema50,
        ema200,
        vwap,
        rsi,
        volume,
        trend,
        vwap_status,
        timestamp: Date.now(),
        source: 'BINANCE_API'
      };

    } catch (error) {
      this.fallbackMode = true;
      return null;
    }
  }

  // DATABASE FALLBACK
  private async fetchFromDatabase(): Promise<LiveETHData | null> {
    try {
      const latestEthData = await storage.getLatestEthData();
      const candlesticks = await storage.getCandlestickHistory('ETHUSDT', '1m', 200);
      
      if (!latestEthData || !candlesticks || candlesticks.length < 50) {
        return null;
      }

      const closes = candlesticks.map(c => c.close);
      const highs = candlesticks.map(c => c.high);
      const lows = candlesticks.map(c => c.low);
      const volumes = candlesticks.map(c => c.volume);

      const ema50 = this.calculateEMA(closes, 50);
      const ema200 = this.calculateEMA(closes, 200);
      const vwap = this.calculateVWAP(highs, lows, closes, volumes);
      const rsi = this.calculateRSI(closes);

      const trend = this.determineTrend(latestEthData.price, ema50, ema200);
      const vwap_status = latestEthData.price > vwap ? 'ABOVE' : 'BELOW';

      return {
        price: latestEthData.price,
        ema50,
        ema200,
        vwap,
        rsi,
        volume: latestEthData.volume,
        trend,
        vwap_status,
        timestamp: Date.now(),
        source: 'DATABASE'
      };

    } catch (error) {
      return null;
    }
  }

  // MARKET STATISTICS
  async getMarketStats(): Promise<MarketStats | null> {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT');
      
      if (!response.ok) {
        throw new Error(`Binance 24hr ticker error: ${response.status}`);
      }
      
      const ticker = await response.json();
      
      return {
        dailyChange: parseFloat(ticker.priceChange),
        dailyChangePercent: parseFloat(ticker.priceChangePercent),
        high24h: parseFloat(ticker.highPrice),
        low24h: parseFloat(ticker.lowPrice),
        volume24h: parseFloat(ticker.volume),
        priceChange1h: 0, // Would need additional API call
        priceChange4h: 0  // Would need additional API call
      };

    } catch (error) {
      return null;
    }
  }

  // REAL-TIME DATA VALIDATION
  async validateDataQuality(data: LiveETHData): Promise<{
    isValid: boolean;
    quality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'CRITICAL';
    issues: string[];
  }> {
    const issues: string[] = [];
    let quality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'CRITICAL' = 'EXCELLENT';

    // Check data freshness
    const ageMs = Date.now() - data.timestamp;
    if (ageMs > 60000) { // Older than 1 minute
      issues.push('Data is stale (>1 minute old)');
      quality = 'POOR';
    } else if (ageMs > 30000) { // Older than 30 seconds
      issues.push('Data is somewhat stale (>30 seconds old)');
      quality = 'GOOD';
    }

    // Check for realistic price values
    if (data.price < 1000 || data.price > 10000) {
      issues.push('Price appears unrealistic');
      quality = 'CRITICAL';
    }

    // Check RSI bounds
    if (data.rsi < 0 || data.rsi > 100) {
      issues.push('RSI value out of bounds');
      quality = 'CRITICAL';
    }

    // Check EMA relationships
    if (Math.abs(data.ema50 - data.price) > data.price * 0.1) {
      issues.push('EMA50 too far from current price');
      quality = 'POOR';
    }

    // Check volume validity
    if (data.volume <= 0) {
      issues.push('Invalid volume data');
      quality = 'POOR';
    }

    const isValid = quality !== 'CRITICAL' && issues.length < 3;

    return { isValid, quality, issues };
  }

  // LIVE DATA STREAM STATUS
  getDataStreamStatus(): {
    isLive: boolean;
    source: string;
    lastUpdate: number;
    dataAge: number;
    fallbackMode: boolean;
    quality: string;
  } {
    const dataAge = Date.now() - this.lastUpdate;
    
    return {
      isLive: dataAge < 30000, // Consider live if updated within 30 seconds
      source: this.fallbackMode ? 'BINANCE_API' : 'BINANCE_WS',
      lastUpdate: this.lastUpdate,
      dataAge,
      fallbackMode: this.fallbackMode,
      quality: dataAge < 15000 ? 'EXCELLENT' : dataAge < 30000 ? 'GOOD' : 'POOR'
    };
  }

  // TECHNICAL INDICATOR CALCULATIONS
  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;
    
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateVWAP(highs: number[], lows: number[], closes: number[], volumes: number[]): number {
    let volumeSum = 0;
    let priceVolumeSum = 0;
    
    for (let i = 0; i < closes.length; i++) {
      const typicalPrice = (highs[i] + lows[i] + closes[i]) / 3;
      priceVolumeSum += typicalPrice * volumes[i];
      volumeSum += volumes[i];
    }
    
    return volumeSum > 0 ? priceVolumeSum / volumeSum : 0;
  }

  private determineTrend(price: number, ema50: number, ema200: number): 'UPTREND' | 'DOWNTREND' | 'RANGING' {
    if (price > ema50 && ema50 > ema200) return 'UPTREND';
    if (price < ema50 && ema50 < ema200) return 'DOWNTREND';
    return 'RANGING';
  }

  private async updateLiveData(): Promise<void> {
    const data = await this.fetchLiveETHData();
    if (data) {
      this.lastUpdate = Date.now();
    }
  }

  // PUBLIC INTERFACE
  async getCurrentPrice(): Promise<number> {
    const marketData = await this.fetchLiveETHData();
    return marketData?.price || 0;
  }

  async getCurrentMarketData(): Promise<LiveETHData | null> {
    return await this.fetchLiveETHData();
  }

  async getMarketData(): Promise<LiveETHData | null> {
    return await this.fetchLiveETHData();
  }

  async getDetailedMarketData(): Promise<{
    liveData: LiveETHData | null;
    marketStats: MarketStats | null;
    streamStatus: any;
    dataQuality: any;
  }> {
    const liveData = await this.fetchLiveETHData();
    const marketStats = await this.getMarketStats();
    const streamStatus = this.getDataStreamStatus();
    const dataQuality = liveData ? await this.validateDataQuality(liveData) : null;

    return {
      liveData,
      marketStats,
      streamStatus,
      dataQuality
    };
  }

  // CONFIGURATION METHODS
  setUpdateInterval(intervalMs: number): void {
    this.updateInterval = Math.max(5000, Math.min(60000, intervalMs)); // 5s to 60s
  }

  forceFallbackMode(enabled: boolean): void {
    this.fallbackMode = enabled;
  }

  resetRetryCount(): void {
    this.retryCount = 0;
  }
}

export const waidesKILiveFeed = new WaidesKILiveFeed();