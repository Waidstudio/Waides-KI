import { EthPriceData } from './ethMonitor.js';

export interface SignalResult {
  type: 'LONG' | 'SHORT' | 'HOLD';
  confidence: number;
  entryPoint: number;
  targetPrice: number;
  stopLoss: number;
  description: string;
  technicalStrength: number;
  volumeStrength: number;
  sentimentStrength: number;
}

export class SignalAnalyzer {
  private priceHistory: EthPriceData[] = [];

  updatePriceHistory(data: EthPriceData) {
    this.priceHistory.push(data);
    // Keep only last 100 data points
    if (this.priceHistory.length > 100) {
      this.priceHistory = this.priceHistory.slice(-100);
    }
  }

  analyzeSignal(currentData: EthPriceData, fearGreedIndex: number = 50): SignalResult {
    const price = currentData.price;
    const priceChange = currentData.priceChange24h || 0;
    
    // Technical Analysis
    const technicalStrength = this.calculateTechnicalStrength(price, priceChange);
    
    // Volume Analysis
    const volumeStrength = this.calculateVolumeStrength(currentData);
    
    // Sentiment Analysis
    const sentimentStrength = this.calculateSentimentStrength(fearGreedIndex, priceChange);
    
    // Overall confidence
    const confidence = (technicalStrength + volumeStrength + sentimentStrength) / 3;
    
    let signal: SignalResult;
    
    if (confidence >= 70 && priceChange > 2) {
      signal = {
        type: 'LONG',
        confidence,
        entryPoint: price,
        targetPrice: price * 1.04, // 4% target
        stopLoss: price * 0.975, // 2.5% stop loss
        description: '🟢 Go Long — Strong Uptrend Detected',
        technicalStrength,
        volumeStrength,
        sentimentStrength
      };
    } else if (confidence >= 70 && priceChange < -2) {
      signal = {
        type: 'SHORT',
        confidence,
        entryPoint: price,
        targetPrice: price * 0.96, // 4% target (inverse)
        stopLoss: price * 1.025, // 2.5% stop loss
        description: '🔴 Consider Short — Downward Pressure',
        technicalStrength,
        volumeStrength,
        sentimentStrength
      };
    } else {
      signal = {
        type: 'HOLD',
        confidence,
        entryPoint: price,
        targetPrice: price,
        stopLoss: price,
        description: '🟡 Sideways — Wait for Clear Breakout',
        technicalStrength,
        volumeStrength,
        sentimentStrength
      };
    }
    
    return signal;
  }

  private calculateTechnicalStrength(price: number, priceChange: number): number {
    let strength = 50; // Base neutral
    
    // Price momentum
    if (priceChange > 3) strength += 25;
    else if (priceChange > 1) strength += 15;
    else if (priceChange < -3) strength -= 25;
    else if (priceChange < -1) strength -= 15;
    
    // Price level analysis (simplified)
    if (price > 2500) strength += 10; // Above key resistance
    else if (price < 2400) strength -= 10; // Below key support
    
    return Math.max(0, Math.min(100, strength));
  }

  private calculateVolumeStrength(data: EthPriceData): number {
    const volume = data.volume || 0;
    const avgVolume = 15000000000; // Approximate average ETH 24h volume
    
    let strength = 50; // Base neutral
    
    if (volume > avgVolume * 1.5) strength += 30;
    else if (volume > avgVolume * 1.2) strength += 20;
    else if (volume < avgVolume * 0.8) strength -= 20;
    else if (volume < avgVolume * 0.5) strength -= 30;
    
    return Math.max(0, Math.min(100, strength));
  }

  private calculateSentimentStrength(fearGreedIndex: number, priceChange: number): number {
    let strength = fearGreedIndex; // Use fear & greed as base
    
    // Adjust based on price momentum
    if (priceChange > 0 && fearGreedIndex > 60) strength += 10;
    else if (priceChange < 0 && fearGreedIndex < 40) strength -= 10;
    
    return Math.max(0, Math.min(100, strength));
  }
}
