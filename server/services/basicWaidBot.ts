import { EthPriceData } from './ethMonitor';

export interface BasicWaidDecision {
  action: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'OBSERVE';
  reasoning: string;
  confidence: number;
  ethPosition: 'LONG' | 'NEUTRAL';
  tradingPair: 'ETH/USDT' | 'NONE';
  quantity: number;
  trendDirection: 'UPWARD' | 'DOWNWARD' | 'SIDEWAYS';
  autoTradingEnabled: boolean;
  timestamp: number;
}

/**
 * Basic WaidBot - Simple Long-Only ETH Trading Bot
 * 
 * Features:
 * - Only trades ETH when price is going up (upward trends)
 * - Long positions only - no short selling
 * - Designed for steady profits during bull markets
 * - Automatic trading - humans just turn it on and let it run
 */
export class BasicWaidBot {
  private autoTradingEnabled: boolean = false;
  private lastDecision: BasicWaidDecision | null = null;
  private decisionHistory: BasicWaidDecision[] = [];
  private positionSize: number = 0.1; // 10% of available capital per trade

  constructor() {
    console.log('🤖 Basic WaidBot initialized - Long-only ETH trading bot ready');
  }

  /**
   * Enable/disable automatic trading
   */
  public setAutoTrading(enabled: boolean): void {
    this.autoTradingEnabled = enabled;
    console.log(`🤖 Basic WaidBot auto-trading ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Get current bot status
   */
  public getStatus(): { 
    autoTradingEnabled: boolean; 
    currentPosition: 'LONG' | 'NEUTRAL';
    lastDecision: BasicWaidDecision | null;
  } {
    return {
      autoTradingEnabled: this.autoTradingEnabled,
      currentPosition: this.lastDecision?.ethPosition || 'NEUTRAL',
      lastDecision: this.lastDecision
    };
  }

  /**
   * Analyze trend direction - core logic for WaidBot
   * Only trades during UPWARD trends
   */
  private analyzeTrendDirection(ethData: EthPriceData): 'UPWARD' | 'DOWNWARD' | 'SIDEWAYS' {
    const priceChange24h = ethData.priceChange24h || 0;
    const volumeThreshold = 1000000; // Minimum volume for reliable signals
    
    // Need sufficient volume for reliable trend analysis
    if (ethData.volume < volumeThreshold) {
      return 'SIDEWAYS';
    }

    // Upward trend: positive 24h change and growing momentum
    if (priceChange24h > 2) {
      return 'UPWARD';
    }
    
    // Downward trend: negative 24h change
    if (priceChange24h < -1) {
      return 'DOWNWARD';
    }
    
    // Otherwise sideways
    return 'SIDEWAYS';
  }

  /**
   * Calculate confidence for upward trend trades
   */
  private calculateUpwardTrendConfidence(ethData: EthPriceData): number {
    let confidence = 60; // Base confidence
    
    const priceChange24h = ethData.priceChange24h || 0;
    
    // Strong upward momentum increases confidence
    if (priceChange24h > 5) confidence += 20;
    else if (priceChange24h > 3) confidence += 15;
    else if (priceChange24h > 2) confidence += 10;
    
    // High volume increases confidence
    if (ethData.volume > 2000000) confidence += 10;
    else if (ethData.volume > 1500000) confidence += 5;
    
    // Price above psychological levels
    if (ethData.price > 2500) confidence += 5;
    
    return Math.min(confidence, 95); // Cap at 95%
  }

  /**
   * Calculate position size based on confidence
   */
  private calculatePositionSize(confidence: number): number {
    const baseSize = this.positionSize;
    
    if (confidence > 90) return baseSize * 1.5; // Increase position for high confidence
    if (confidence > 80) return baseSize * 1.2;
    return baseSize;
  }

  /**
   * Generate trading decision - main bot logic
   */
  public async generateDecision(ethData: EthPriceData): Promise<BasicWaidDecision> {
    const trendDirection = this.analyzeTrendDirection(ethData);
    
    let decision: BasicWaidDecision;
    
    // Core WaidBot logic: Only trade during UPWARD trends
    if (trendDirection !== 'UPWARD') {
      decision = {
        action: 'HOLD',
        reasoning: `WaidBot: Waiting for upward trend (current: ${trendDirection.toLowerCase()}) - only trades ETH when price is rising`,
        confidence: 85,
        ethPosition: 'NEUTRAL',
        tradingPair: 'NONE',
        quantity: 0,
        trendDirection,
        autoTradingEnabled: this.autoTradingEnabled,
        timestamp: Date.now()
      };
    } else {
      // Upward trend detected - analyze if we should buy
      const confidence = this.calculateUpwardTrendConfidence(ethData);
      
      if (confidence > 75 && this.autoTradingEnabled) {
        const quantity = this.calculatePositionSize(confidence);
        
        decision = {
          action: 'BUY_ETH',
          reasoning: `WaidBot: Strong upward trend detected (${confidence.toFixed(1)}% confidence) - executing long position for ${(quantity * 100).toFixed(1)}% of capital`,
          confidence,
          ethPosition: 'LONG',
          tradingPair: 'ETH/USDT',
          quantity,
          trendDirection,
          autoTradingEnabled: this.autoTradingEnabled,
          timestamp: Date.now()
        };
        
        console.log(`🤖 WaidBot BUY signal: ${ethData.price} ETH (${confidence.toFixed(1)}% confidence)`);
      } else {
        decision = {
          action: 'OBSERVE',
          reasoning: this.autoTradingEnabled 
            ? `WaidBot: Upward trend confidence too low (${confidence.toFixed(1)}%) - waiting for stronger signal`
            : 'WaidBot: Auto-trading disabled - manual control required',
          confidence,
          ethPosition: 'NEUTRAL',
          tradingPair: 'NONE',
          quantity: 0,
          trendDirection,
          autoTradingEnabled: this.autoTradingEnabled,
          timestamp: Date.now()
        };
      }
    }
    
    // Store decision
    this.lastDecision = decision;
    this.decisionHistory.push(decision);
    
    // Keep only last 100 decisions
    if (this.decisionHistory.length > 100) {
      this.decisionHistory.shift();
    }
    
    return decision;
  }

  /**
   * Get decision history
   */
  public getDecisionHistory(): BasicWaidDecision[] {
    return this.decisionHistory.slice(-20); // Return last 20 decisions
  }

  /**
   * Execute trade automatically (if auto-trading is enabled)
   */
  public async executeTrade(decision: BasicWaidDecision): Promise<boolean> {
    if (!this.autoTradingEnabled) {
      console.log('🤖 WaidBot: Auto-trading disabled, skipping execution');
      return false;
    }

    if (decision.action === 'BUY_ETH') {
      console.log(`🤖 WaidBot executing BUY: ${decision.quantity * 100}% position at $${decision.reasoning.includes('ETH') ? 'current price' : 'N/A'}`);
      // In production, this would connect to an exchange API
      return true;
    }

    if (decision.action === 'SELL_ETH') {
      console.log(`🤖 WaidBot executing SELL: ${decision.quantity * 100}% position`);
      // In production, this would connect to an exchange API
      return true;
    }

    return false;
  }
}

// Create singleton instance
export const basicWaidBot = new BasicWaidBot();