/**
 * WAIDES KI HISTORICAL DATA LOADER
 * Downloads past OHLCV data for comprehensive backtesting and scenario analysis
 */

interface CandleData {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  symbol: string;
  interval: string;
}

interface HistoricalDataRequest {
  symbol: string;
  interval: string;
  limit: number;
  startTime?: number;
  endTime?: number;
}

export class WaidesKIHistoricalDataLoader {
  private baseUrl = 'https://api.binance.com/api/v3/klines';
  private cache = new Map<string, CandleData[]>();
  private maxCacheAge = 300000; // 5 minutes
  private cacheTimestamps = new Map<string, number>();

  constructor() {
    console.log('🔄 Waides KI Historical Data Loader initialized');
  }

  /**
   * Load historical OHLCV data from Binance
   */
  async loadHistoricalData(request: HistoricalDataRequest): Promise<CandleData[]> {
    const cacheKey = this.generateCacheKey(request);
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      console.log(`📊 Using cached historical data for ${request.symbol}`);
      return this.cache.get(cacheKey)!;
    }

    try {
      console.log(`📡 Fetching historical data: ${request.symbol} ${request.interval} (${request.limit} candles)`);
      
      const url = this.buildUrl(request);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }

      const rawData = await response.json();
      const candleData = this.processRawData(rawData, request.symbol, request.interval);
      
      // Cache the results
      this.cache.set(cacheKey, candleData);
      this.cacheTimestamps.set(cacheKey, Date.now());
      
      console.log(`✅ Loaded ${candleData.length} historical candles for ${request.symbol}`);
      return candleData;
    } catch (error) {
      console.error('❌ Error loading historical data:', error);
      throw error;
    }
  }

  /**
   * Load multiple symbols for comparison analysis
   */
  async loadMultipleSymbols(symbols: string[], interval: string, limit: number): Promise<Map<string, CandleData[]>> {
    const results = new Map<string, CandleData[]>();
    
    console.log(`📊 Loading historical data for ${symbols.length} symbols`);
    
    const promises = symbols.map(async (symbol) => {
      try {
        const data = await this.loadHistoricalData({ symbol, interval, limit });
        results.set(symbol, data);
      } catch (error) {
        console.error(`❌ Failed to load data for ${symbol}:`, error);
        results.set(symbol, []);
      }
    });

    await Promise.all(promises);
    
    console.log(`✅ Completed loading data for ${results.size} symbols`);
    return results;
  }

  /**
   * Load data for specific time range
   */
  async loadTimeRange(
    symbol: string, 
    interval: string, 
    startTime: Date, 
    endTime: Date
  ): Promise<CandleData[]> {
    const startTs = startTime.getTime();
    const endTs = endTime.getTime();
    
    console.log(`📅 Loading time range data: ${symbol} from ${startTime.toISOString()} to ${endTime.toISOString()}`);
    
    return this.loadHistoricalData({
      symbol,
      interval,
      limit: 1000, // Will be limited by time range
      startTime: startTs,
      endTime: endTs
    });
  }

  /**
   * Get data for common backtesting scenarios
   */
  async loadBacktestingScenarios(symbol: string): Promise<Map<string, CandleData[]>> {
    const scenarios = new Map<string, CandleData[]>();
    
    const scenarioConfigs = [
      { key: 'last_month_1h', interval: '1h', limit: 744 }, // ~1 month hourly
      { key: 'last_week_15m', interval: '15m', limit: 672 }, // ~1 week 15min
      { key: 'last_3_months_4h', interval: '4h', limit: 540 }, // ~3 months 4h
      { key: 'last_year_1d', interval: '1d', limit: 365 }, // ~1 year daily
    ];

    console.log(`🧪 Loading backtesting scenarios for ${symbol}`);
    
    for (const config of scenarioConfigs) {
      try {
        const data = await this.loadHistoricalData({
          symbol,
          interval: config.interval,
          limit: config.limit
        });
        scenarios.set(config.key, data);
        console.log(`✅ Loaded scenario: ${config.key} (${data.length} candles)`);
      } catch (error) {
        console.error(`❌ Failed to load scenario ${config.key}:`, error);
        scenarios.set(config.key, []);
      }
      
      // Small delay to avoid rate limiting
      await this.delay(100);
    }
    
    return scenarios;
  }

  /**
   * Build API URL with parameters
   */
  private buildUrl(request: HistoricalDataRequest): string {
    const params = new URLSearchParams({
      symbol: request.symbol,
      interval: request.interval,
      limit: request.limit.toString()
    });

    if (request.startTime) {
      params.append('startTime', request.startTime.toString());
    }
    
    if (request.endTime) {
      params.append('endTime', request.endTime.toString());
    }

    return `${this.baseUrl}?${params.toString()}`;
  }

  /**
   * Process raw Binance API data into structured format
   */
  private processRawData(rawData: any[], symbol: string, interval: string): CandleData[] {
    return rawData.map(candle => ({
      time: new Date(candle[0]),
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5]),
      symbol,
      interval
    }));
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(request: HistoricalDataRequest): string {
    return `${request.symbol}_${request.interval}_${request.limit}_${request.startTime || ''}_${request.endTime || ''}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(cacheKey: string): boolean {
    if (!this.cache.has(cacheKey) || !this.cacheTimestamps.has(cacheKey)) {
      return false;
    }
    
    const cacheTime = this.cacheTimestamps.get(cacheKey)!;
    return (Date.now() - cacheTime) < this.maxCacheAge;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
    console.log('🗑️ Historical data cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { entries: number; totalCandles: number; oldestEntry: Date | null } {
    let totalCandles = 0;
    let oldestTimestamp = Date.now();
    
    for (const data of this.cache.values()) {
      totalCandles += data.length;
    }
    
    for (const timestamp of this.cacheTimestamps.values()) {
      if (timestamp < oldestTimestamp) {
        oldestTimestamp = timestamp;
      }
    }

    return {
      entries: this.cache.size,
      totalCandles,
      oldestEntry: this.cache.size > 0 ? new Date(oldestTimestamp) : null
    };
  }

  /**
   * Extract specific time windows from data
   */
  extractTimeWindow(data: CandleData[], startDate: Date, endDate: Date): CandleData[] {
    return data.filter(candle => 
      candle.time >= startDate && candle.time <= endDate
    );
  }

  /**
   * Calculate basic statistics for loaded data
   */
  calculateDataStats(data: CandleData[]): {
    count: number;
    timeRange: { start: Date; end: Date } | null;
    priceRange: { min: number; max: number; avg: number };
    volumeStats: { total: number; avg: number; max: number };
  } {
    if (data.length === 0) {
      return {
        count: 0,
        timeRange: null,
        priceRange: { min: 0, max: 0, avg: 0 },
        volumeStats: { total: 0, avg: 0, max: 0 }
      };
    }

    const prices = data.map(d => d.close);
    const volumes = data.map(d => d.volume);
    
    return {
      count: data.length,
      timeRange: {
        start: data[0].time,
        end: data[data.length - 1].time
      },
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: prices.reduce((a, b) => a + b, 0) / prices.length
      },
      volumeStats: {
        total: volumes.reduce((a, b) => a + b, 0),
        avg: volumes.reduce((a, b) => a + b, 0) / volumes.length,
        max: Math.max(...volumes)
      }
    };
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Export data to JSON format
   */
  exportData(data: CandleData[]): string {
    return JSON.stringify({
      exported_at: new Date().toISOString(),
      candle_count: data.length,
      data: data
    }, null, 2);
  }

  /**
   * Get supported intervals
   */
  getSupportedIntervals(): string[] {
    return [
      '1m', '3m', '5m', '15m', '30m',
      '1h', '2h', '4h', '6h', '8h', '12h',
      '1d', '3d', '1w', '1M'
    ];
  }

  /**
   * Validate interval format
   */
  isValidInterval(interval: string): boolean {
    return this.getSupportedIntervals().includes(interval);
  }
}

// Global instance
export const waidesKIHistoricalDataLoader = new WaidesKIHistoricalDataLoader();