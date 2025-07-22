/**
 * RealTimeResolver.ts - Real-Time Data Resolution and Processing Engine
 * Handles live market data, price feeds, and real-time trading decisions
 */

import { waidesKIWebSocketTracker } from './waidesKIWebSocketTracker';
import { resilientDataFetcher } from './resilientDataFetcher';

export interface RealTimeMarketData {
  price: number;
  volume: number;
  timestamp: number;
  source: 'websocket' | 'api' | 'fallback';
  confidence: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface RealTimeBotDecision {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  timestamp: number;
  price: number;
}

class RealTimeResolverEngine {
  private priceHistory: RealTimeMarketData[] = [];
  private botDecisions: RealTimeBotDecision[] = [];
  private isActive: boolean = true;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startRealTimeProcessing();
    this.subscribeToWebSocketUpdates();
  }

  /**
   * Start real-time data processing and decision making
   */
  private startRealTimeProcessing(): void {
    console.log('🚀 RealTimeResolver: Starting live data processing...');
    
    this.updateInterval = setInterval(async () => {
      try {
        const marketData = await this.resolveRealTimeMarketData();
        const botDecision = await this.generateBotDecision(marketData);
        
        // Store in history
        this.priceHistory.push(marketData);
        this.botDecisions.push(botDecision);
        
        // Keep only last 1000 entries
        if (this.priceHistory.length > 1000) {
          this.priceHistory = this.priceHistory.slice(-1000);
        }
        if (this.botDecisions.length > 1000) {
          this.botDecisions = this.botDecisions.slice(-1000);
        }

        console.log(`🔍 RealTimeResolver: Price $${marketData.price} | Decision: ${botDecision.action} | Confidence: ${botDecision.confidence}%`);
        
      } catch (error) {
        console.error('❌ RealTimeResolver processing error:', error);
      }
    }, 10000); // Process every 10 seconds for real-time responsiveness
  }

  /**
   * Subscribe to WebSocket price updates for immediate data
   */
  private subscribeToWebSocketUpdates(): void {
    waidesKIWebSocketTracker.onPriceUpdate((priceUpdate) => {
      const marketData: RealTimeMarketData = {
        price: priceUpdate.price,
        volume: priceUpdate.volume,
        timestamp: priceUpdate.timestamp,
        source: 'websocket',
        confidence: 95,
        trend: this.calculateTrend(priceUpdate.price)
      };

      // Add to history immediately for WebSocket updates
      this.priceHistory.push(marketData);
      if (this.priceHistory.length > 1000) {
        this.priceHistory = this.priceHistory.slice(-1000);
      }

      console.log(`⚡ RealTimeResolver: WebSocket update - $${priceUpdate.price}`);
    });
  }

  /**
   * Resolve real-time market data from multiple sources
   */
  private async resolveRealTimeMarketData(): Promise<RealTimeMarketData> {
    try {
      // Try to get live data from resilient fetcher
      const ethData = await resilientDataFetcher.fetchETHData();
      
      return {
        price: ethData.price,
        volume: ethData.volume24h || 0,
        timestamp: Date.now(),
        source: 'api',
        confidence: 90,
        trend: this.calculateTrend(ethData.price)
      };
    } catch (error) {
      console.warn('⚠️ RealTimeResolver: Falling back to simulated data');
      
      // Generate realistic fallback data
      const lastPrice = this.priceHistory.length > 0 ? 
        this.priceHistory[this.priceHistory.length - 1].price : 3700;
      
      const variation = (Math.random() - 0.5) * 20; // ±$10 variation
      const newPrice = Math.max(lastPrice + variation, 100); // Minimum $100
      
      return {
        price: newPrice,
        volume: 15000000000 + Math.random() * 5000000000,
        timestamp: Date.now(),
        source: 'fallback',
        confidence: 60,
        trend: this.calculateTrend(newPrice)
      };
    }
  }

  /**
   * Generate bot trading decision based on market data
   */
  private async generateBotDecision(marketData: RealTimeMarketData): Promise<RealTimeBotDecision> {
    try {
      // Simple momentum-based decision logic
      const recentPrices = this.priceHistory.slice(-5).map(data => data.price);
      
      if (recentPrices.length < 3) {
        return this.createHoldDecision(marketData, "Insufficient historical data");
      }

      // Calculate moving averages
      const shortMA = this.calculateMovingAverage(recentPrices.slice(-3));
      const longMA = this.calculateMovingAverage(recentPrices);

      // Decision logic
      if (shortMA > longMA * 1.002) { // 0.2% threshold
        return {
          action: 'BUY',
          confidence: Math.min(85, marketData.confidence),
          reasoning: `Short MA ($${shortMA.toFixed(2)}) above Long MA ($${longMA.toFixed(2)}) - Uptrend detected`,
          timestamp: Date.now(),
          price: marketData.price
        };
      } else if (shortMA < longMA * 0.998) { // 0.2% threshold
        return {
          action: 'SELL',
          confidence: Math.min(85, marketData.confidence),
          reasoning: `Short MA ($${shortMA.toFixed(2)}) below Long MA ($${longMA.toFixed(2)}) - Downtrend detected`,
          timestamp: Date.now(),
          price: marketData.price
        };
      } else {
        return this.createHoldDecision(marketData, "Market in consolidation phase");
      }
    } catch (error) {
      console.error('❌ RealTimeResolver: Decision generation error:', error);
      return this.createHoldDecision(marketData, "Error in decision analysis");
    }
  }

  /**
   * Calculate price trend
   */
  private calculateTrend(currentPrice: number): 'up' | 'down' | 'neutral' {
    if (this.priceHistory.length < 2) return 'neutral';
    
    const previousPrice = this.priceHistory[this.priceHistory.length - 1].price;
    const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;
    
    if (changePercent > 0.1) return 'up';
    if (changePercent < -0.1) return 'down';
    return 'neutral';
  }

  /**
   * Calculate moving average
   */
  private calculateMovingAverage(prices: number[]): number {
    return prices.reduce((sum, price) => sum + price, 0) / prices.length;
  }

  /**
   * Create HOLD decision
   */
  private createHoldDecision(marketData: RealTimeMarketData, reason: string): RealTimeBotDecision {
    return {
      action: 'HOLD',
      confidence: marketData.confidence,
      reasoning: reason,
      timestamp: Date.now(),
      price: marketData.price
    };
  }

  /**
   * Get current market data
   */
  public getCurrentMarketData(): RealTimeMarketData | null {
    return this.priceHistory.length > 0 ? this.priceHistory[this.priceHistory.length - 1] : null;
  }

  /**
   * Get latest bot decision
   */
  public getLatestBotDecision(): RealTimeBotDecision | null {
    return this.botDecisions.length > 0 ? this.botDecisions[this.botDecisions.length - 1] : null;
  }

  /**
   * Get price history
   */
  public getPriceHistory(limit: number = 100): RealTimeMarketData[] {
    return this.priceHistory.slice(-limit);
  }

  /**
   * Get decision history
   */
  public getDecisionHistory(limit: number = 50): RealTimeBotDecision[] {
    return this.botDecisions.slice(-limit);
  }

  /**
   * Get real-time status
   */
  public getStatus(): {
    isActive: boolean;
    lastUpdate: number;
    totalPriceUpdates: number;
    totalDecisions: number;
    websocketConnected: boolean;
  } {
    return {
      isActive: this.isActive,
      lastUpdate: this.priceHistory.length > 0 ? this.priceHistory[this.priceHistory.length - 1].timestamp : 0,
      totalPriceUpdates: this.priceHistory.length,
      totalDecisions: this.botDecisions.length,
      websocketConnected: waidesKIWebSocketTracker.getConnectionStatus().isConnected
    };
  }

  /**
   * Stop real-time processing
   */
  public stop(): void {
    this.isActive = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    console.log('🔴 RealTimeResolver: Stopped real-time processing');
  }
}

// Create and export singleton instance
export const realTimeResolver = new RealTimeResolverEngine();

// Export for backwards compatibility
export default realTimeResolver;