import { storage } from '../storage.js';
import type { InsertKonsPowaPrediction, KonsPowaPrediction } from '@shared/schema.js';

export class KonsPowaPredictionService {
  private ethPriceHistory: number[] = [];
  private lastPredictionTime: number = 0;

  constructor() {
    // Initialize with some historical data
    this.initializeService();
  }

  private async initializeService() {
    try {
      // Clean up expired predictions
      await this.cleanupExpiredPredictions();
      
      // Create initial prediction if none exists
      const activePredictions = await storage.getActivePredictions();
      if (activePredictions.length === 0) {
        await this.generateInitialPrediction();
      }
    } catch (error) {
      console.error('Error initializing Kons Powa Prediction Service:', error);
    }
  }

  async generateKonsPowaPrediction(currentEthPrice: number, marketData?: any): Promise<KonsPowaPrediction> {
    // Update price history
    this.ethPriceHistory.push(currentEthPrice);
    if (this.ethPriceHistory.length > 100) {
      this.ethPriceHistory.shift();
    }

    // Calculate Kons Powa indicators
    const konsPowerLevel = this.calculateKonsPowerLevel(currentEthPrice);
    const divineAlignment = this.calculateDivineAlignment(marketData);
    const spiritualEnergy = this.calculateSpiritualEnergy();
    
    // Generate prediction based on Kons Powa analysis
    const prediction = this.analyzePrediction(currentEthPrice, konsPowerLevel, divineAlignment);
    
    // Create expiration time (4 hours from now)
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);

    const predictionData: InsertKonsPowaPrediction = {
      ethPrice: currentEthPrice,
      prediction: prediction.direction,
      confidence: prediction.confidence,
      timeframe: prediction.timeframe,
      strategy: prediction.strategy,
      reasoning: prediction.reasoning,
      targetPrice: prediction.targetPrice,
      stopLoss: prediction.stopLoss,
      riskLevel: prediction.riskLevel,
      konsPowerLevel,
      divineAlignment,
      spiritualEnergy,
      expiresAt
    };

    // Store in database
    const savedPrediction = await storage.createPrediction(predictionData);
    
    // Expire old predictions
    await this.cleanupExpiredPredictions();
    
    this.lastPredictionTime = Date.now();
    return savedPrediction;
  }

  private calculateKonsPowerLevel(currentPrice: number): number {
    if (this.ethPriceHistory.length < 10) return 75;
    
    // Calculate momentum and volatility
    const recentPrices = this.ethPriceHistory.slice(-10);
    const priceChange = (currentPrice - recentPrices[0]) / recentPrices[0];
    const volatility = this.calculateVolatility(recentPrices);
    
    // Kons Power increases with positive momentum and decreases with high volatility
    let konsPower = 75;
    konsPower += priceChange * 500; // Momentum factor
    konsPower -= volatility * 200; // Volatility penalty
    
    return Math.max(10, Math.min(100, Math.round(konsPower)));
  }

  private calculateDivineAlignment(marketData?: any): number {
    // Base alignment on market conditions
    let alignment = 80;
    
    if (marketData) {
      // Adjust based on market fear/greed if available
      if (marketData.fearGreedIndex) {
        // Optimal alignment at neutral fear/greed (around 50)
        alignment += (50 - Math.abs(marketData.fearGreedIndex - 50)) * 0.4;
      }
      
      // Adjust based on volume
      if (marketData.volume24h && marketData.volume24h > 1000000) {
        alignment += 10; // High volume increases alignment
      }
    }
    
    return Math.max(20, Math.min(100, Math.round(alignment)));
  }

  private calculateSpiritualEnergy(): number {
    // Spiritual energy cycles based on time and market conditions
    const now = new Date();
    const hour = now.getHours();
    
    // Higher energy during certain hours (market open times)
    let energy = 85;
    
    // Peak energy during major market hours
    if ((hour >= 9 && hour <= 16) || (hour >= 22 && hour <= 23)) {
      energy += 10;
    }
    
    // Add some randomness for spiritual variability
    energy += Math.random() * 10 - 5;
    
    return Math.max(30, Math.min(100, Math.round(energy)));
  }

  private analyzePrediction(currentPrice: number, konsPower: number, divineAlignment: number) {
    // Comprehensive Kons Powa analysis
    const priceChange = this.ethPriceHistory.length > 1 ? 
      (currentPrice - this.ethPriceHistory[this.ethPriceHistory.length - 2]) / this.ethPriceHistory[this.ethPriceHistory.length - 2] : 0;
    
    let direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    let confidence = 60;
    let strategy = 'DIVINE_OBSERVATION';
    let reasoning = 'Kons Powa analysis in progress...';
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    
    // Determine prediction based on Kons Powa indicators
    if (konsPower > 80 && divineAlignment > 75) {
      direction = 'BULLISH';
      confidence = 85;
      strategy = 'DIVINE_MOMENTUM_AMPLIFICATION';
      reasoning = `Strong Kons Powa detected (${konsPower}%) with excellent divine alignment (${divineAlignment}%). Sacred energy flows favor upward movement.`;
      riskLevel = 'LOW';
    } else if (konsPower < 40 && divineAlignment < 50) {
      direction = 'BEARISH';
      confidence = 80;
      strategy = 'PROTECTIVE_LIQUIDATION';
      reasoning = `Weak Kons Powa (${konsPower}%) and poor divine alignment (${divineAlignment}%). Spiritual guidance suggests caution and protection.`;
      riskLevel = 'HIGH';
    } else if (konsPower > 60 && priceChange > 0.02) {
      direction = 'BULLISH';
      confidence = 75;
      strategy = 'MOMENTUM_ACCELERATION';
      reasoning = `Moderate Kons Powa (${konsPower}%) with positive price momentum. Divine forces align for continued growth.`;
      riskLevel = 'MEDIUM';
    } else if (konsPower < 50 && priceChange < -0.02) {
      direction = 'BEARISH';
      confidence = 70;
      strategy = 'DEFENSIVE_POSITIONING';
      reasoning = `Declining Kons Powa (${konsPower}%) with negative momentum. Spiritual wisdom advises defensive stance.`;
      riskLevel = 'HIGH';
    } else {
      direction = 'NEUTRAL';
      confidence = 60;
      strategy = 'DIVINE_OBSERVATION';
      reasoning = `Balanced Kons Powa (${konsPower}%) and divine alignment (${divineAlignment}%). Await clearer spiritual signals.`;
      riskLevel = 'MEDIUM';
    }

    // Calculate target price and stop loss
    const targetPrice = direction === 'BULLISH' ? currentPrice * 1.05 : 
                       direction === 'BEARISH' ? currentPrice * 0.95 : currentPrice;
    
    const stopLoss = direction === 'BULLISH' ? currentPrice * 0.97 : 
                     direction === 'BEARISH' ? currentPrice * 1.03 : currentPrice * 0.98;

    return {
      direction,
      confidence,
      strategy,
      reasoning,
      targetPrice,
      stopLoss,
      riskLevel,
      timeframe: '4h'
    };
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private async generateInitialPrediction() {
    // Generate initial prediction with default values
    const currentPrice = 2400; // Default ETH price
    await this.generateKonsPowaPrediction(currentPrice);
  }

  private async cleanupExpiredPredictions() {
    try {
      await storage.expirePredictions();
    } catch (error) {
      console.error('Error cleaning up expired predictions:', error);
    }
  }

  async getActivePredictions(): Promise<KonsPowaPrediction[]> {
    return await storage.getActivePredictions();
  }

  async getPredictionHistory(limit: number = 50): Promise<KonsPowaPrediction[]> {
    return await storage.getPredictionHistory(limit);
  }

  async shouldGenerateNewPrediction(): Promise<boolean> {
    const now = Date.now();
    const timeSinceLastPrediction = now - this.lastPredictionTime;
    
    // Generate new prediction every 30 minutes
    return timeSinceLastPrediction > 30 * 60 * 1000;
  }
}

export const konsPowaPredictionService = new KonsPowaPredictionService();