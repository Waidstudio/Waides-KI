import { serviceRegistry } from "../serviceRegistry.js";

// Advanced Signal Verification System for 6 Trading Entities
// Implements multi-layered signal confirmation with market condition alignment

export interface TradingSignal {
  id: string;
  source: string;
  type: 'technical' | 'sentiment' | 'trend' | 'volume' | 'momentum' | 'risk';
  strength: number; // 0-1 scale
  confidence: number; // 0-1 scale  
  direction: 'bullish' | 'bearish' | 'neutral';
  timeframe: string;
  timestamp: number;
  data: any;
}

export interface MarketCondition {
  trend: 'uptrend' | 'downtrend' | 'sideways';
  volatility: 'low' | 'medium' | 'high';
  volume: 'low' | 'medium' | 'high';  
  sentiment: 'bullish' | 'bearish' | 'neutral';
  alignment: number; // 0-1 scale for overall market alignment
}

export interface SignalAggregationResult {
  overallStrength: number;
  confidence: number;
  direction: 'bullish' | 'bearish' | 'neutral';
  greenLight: boolean; // Clear signal confirmation
  riskLevel: 'low' | 'medium' | 'high';
  marketAlignment: number;
  signalConsistency: number;
  waitState: boolean; // Should wait for better signals
  reasoning: string[];
  signals: TradingSignal[];
}

class SignalAggregatorService {
  private activeSignals: Map<string, TradingSignal[]> = new Map();
  private marketConditions: MarketCondition | null = null;
  private readonly SIGNAL_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
  private readonly MIN_SIGNAL_THRESHOLD = 0.6;
  private readonly MIN_CONSISTENCY_THRESHOLD = 0.7;

  constructor() {
    this.startSignalCleanup();
    this.startMarketMonitoring();
  }

  // Main Signal Aggregation Function
  async aggregateSignals(entityId: string, newSignals: TradingSignal[]): Promise<SignalAggregationResult> {
    try {
      // Store new signals
      this.storeSignals(entityId, newSignals);
      
      // Get all current signals for this entity
      const currentSignals = this.getActiveSignals(entityId);
      
      // Update market conditions
      await this.updateMarketConditions();
      
      // Perform multi-layered analysis
      const technicalAnalysis = this.analyzeTechnicalSignals(currentSignals);
      const sentimentAnalysis = this.analyzeSentimentSignals(currentSignals);
      const trendAnalysis = this.analyzeTrendSignals(currentSignals);
      
      // Calculate signal consistency
      const consistency = this.calculateSignalConsistency(currentSignals);
      
      // Check market condition alignment
      const marketAlignment = this.checkMarketAlignment(currentSignals, this.marketConditions);
      
      // Determine overall strength and confidence
      const overallStrength = this.calculateOverallStrength([
        technicalAnalysis.strength,
        sentimentAnalysis.strength,
        trendAnalysis.strength
      ]);
      
      const confidence = this.calculateConfidence(consistency, marketAlignment, overallStrength);
      
      // Determine direction
      const direction = this.determineDirection(currentSignals);
      
      // Calculate risk level
      const riskLevel = this.calculateRiskLevel(overallStrength, consistency, marketAlignment);
      
      // Determine if we have a "green light" for trading
      const greenLight = this.determineGreenLight(overallStrength, consistency, marketAlignment, confidence);
      
      // Determine if we should wait for better signals
      const waitState = !greenLight && (consistency < this.MIN_CONSISTENCY_THRESHOLD || overallStrength < this.MIN_SIGNAL_THRESHOLD);
      
      // Generate reasoning
      const reasoning = this.generateReasoning(
        technicalAnalysis, sentimentAnalysis, trendAnalysis, 
        consistency, marketAlignment, greenLight, waitState
      );

      return {
        overallStrength,
        confidence,
        direction,
        greenLight,
        riskLevel,
        marketAlignment,
        signalConsistency: consistency,
        waitState,
        reasoning,
        signals: currentSignals
      };

    } catch (error) {
      console.error(`Signal aggregation error for ${entityId}:`, error);
      return this.createFallbackResult(entityId);
    }
  }

  // Store signals with automatic expiry
  private storeSignals(entityId: string, signals: TradingSignal[]): void {
    const existing = this.activeSignals.get(entityId) || [];
    const currentTime = Date.now();
    
    // Add new signals
    const updatedSignals = [...existing, ...signals];
    
    // Remove expired signals
    const activeSignals = updatedSignals.filter(
      signal => (currentTime - signal.timestamp) < this.SIGNAL_EXPIRY_MS
    );
    
    this.activeSignals.set(entityId, activeSignals);
  }

  // Get active signals for an entity
  private getActiveSignals(entityId: string): TradingSignal[] {
    return this.activeSignals.get(entityId) || [];
  }

  // Technical Signal Analysis
  private analyzeTechnicalSignals(signals: TradingSignal[]): { strength: number; reliability: number } {
    const technicalSignals = signals.filter(s => s.type === 'technical');
    if (technicalSignals.length === 0) return { strength: 0.5, reliability: 0.3 };
    
    const avgStrength = technicalSignals.reduce((sum, s) => sum + s.strength, 0) / technicalSignals.length;
    const avgConfidence = technicalSignals.reduce((sum, s) => sum + s.confidence, 0) / technicalSignals.length;
    
    return {
      strength: avgStrength,
      reliability: avgConfidence
    };
  }

  // Sentiment Signal Analysis  
  private analyzeSentimentSignals(signals: TradingSignal[]): { strength: number; reliability: number } {
    const sentimentSignals = signals.filter(s => s.type === 'sentiment');
    if (sentimentSignals.length === 0) return { strength: 0.5, reliability: 0.3 };
    
    const avgStrength = sentimentSignals.reduce((sum, s) => sum + s.strength, 0) / sentimentSignals.length;
    const avgConfidence = sentimentSignals.reduce((sum, s) => sum + s.confidence, 0) / sentimentSignals.length;
    
    return {
      strength: avgStrength,
      reliability: avgConfidence
    };
  }

  // Trend Signal Analysis
  private analyzeTrendSignals(signals: TradingSignal[]): { strength: number; reliability: number } {
    const trendSignals = signals.filter(s => s.type === 'trend');
    if (trendSignals.length === 0) return { strength: 0.5, reliability: 0.3 };
    
    const avgStrength = trendSignals.reduce((sum, s) => sum + s.strength, 0) / trendSignals.length;
    const avgConfidence = trendSignals.reduce((sum, s) => sum + s.confidence, 0) / trendSignals.length;
    
    return {
      strength: avgStrength,
      reliability: avgConfidence
    };
  }

  // Calculate signal consistency across all signals
  private calculateSignalConsistency(signals: TradingSignal[]): number {
    if (signals.length < 2) return 0.3;
    
    const bullishSignals = signals.filter(s => s.direction === 'bullish').length;
    const bearishSignals = signals.filter(s => s.direction === 'bearish').length;
    const neutralSignals = signals.filter(s => s.direction === 'neutral').length;
    
    const total = signals.length;
    const maxDirection = Math.max(bullishSignals, bearishSignals, neutralSignals);
    
    return maxDirection / total;
  }

  // Check alignment with current market conditions
  private checkMarketAlignment(signals: TradingSignal[], conditions: MarketCondition | null): number {
    if (!conditions) return 0.5;
    
    let alignmentScore = 0;
    let checks = 0;
    
    // Check trend alignment
    const trendSignals = signals.filter(s => s.type === 'trend');
    if (trendSignals.length > 0) {
      const bullishTrend = trendSignals.filter(s => s.direction === 'bullish').length;
      const bearishTrend = trendSignals.filter(s => s.direction === 'bearish').length;
      
      if (conditions.trend === 'uptrend' && bullishTrend > bearishTrend) alignmentScore += 1;
      else if (conditions.trend === 'downtrend' && bearishTrend > bullishTrend) alignmentScore += 1;
      else if (conditions.trend === 'sideways') alignmentScore += 0.5;
      
      checks++;
    }
    
    // Check sentiment alignment
    const sentimentSignals = signals.filter(s => s.type === 'sentiment');
    if (sentimentSignals.length > 0) {
      const bullishSentiment = sentimentSignals.filter(s => s.direction === 'bullish').length;
      const bearishSentiment = sentimentSignals.filter(s => s.direction === 'bearish').length;
      
      if (conditions.sentiment === 'bullish' && bullishSentiment > bearishSentiment) alignmentScore += 1;
      else if (conditions.sentiment === 'bearish' && bearishSentiment > bullishSentiment) alignmentScore += 1;
      else if (conditions.sentiment === 'neutral') alignmentScore += 0.5;
      
      checks++;
    }
    
    return checks > 0 ? alignmentScore / checks : 0.5;
  }

  // Calculate overall signal strength
  private calculateOverallStrength(strengths: number[]): number {
    return strengths.reduce((sum, s) => sum + s, 0) / strengths.length;
  }

  // Calculate confidence based on multiple factors
  private calculateConfidence(consistency: number, alignment: number, strength: number): number {
    return (consistency * 0.4 + alignment * 0.3 + strength * 0.3);
  }

  // Determine overall signal direction
  private determineDirection(signals: TradingSignal[]): 'bullish' | 'bearish' | 'neutral' {
    const bullishCount = signals.filter(s => s.direction === 'bullish').length;
    const bearishCount = signals.filter(s => s.direction === 'bearish').length;
    
    if (bullishCount > bearishCount) return 'bullish';
    if (bearishCount > bullishCount) return 'bearish';
    return 'neutral';
  }

  // Calculate risk level
  private calculateRiskLevel(strength: number, consistency: number, alignment: number): 'low' | 'medium' | 'high' {
    const riskScore = (strength + consistency + alignment) / 3;
    
    if (riskScore > 0.7) return 'low';
    if (riskScore > 0.4) return 'medium';
    return 'high';
  }

  // Determine if we have a green light for trading
  private determineGreenLight(strength: number, consistency: number, alignment: number, confidence: number): boolean {
    return (
      strength >= this.MIN_SIGNAL_THRESHOLD &&
      consistency >= this.MIN_CONSISTENCY_THRESHOLD &&
      alignment >= 0.6 &&
      confidence >= 0.65
    );
  }

  // Generate human-readable reasoning
  private generateReasoning(
    technical: { strength: number; reliability: number },
    sentiment: { strength: number; reliability: number },
    trend: { strength: number; reliability: number },
    consistency: number,
    alignment: number,
    greenLight: boolean,
    waitState: boolean
  ): string[] {
    const reasoning: string[] = [];
    
    if (technical.strength > 0.7) {
      reasoning.push(`Strong technical indicators (${(technical.strength * 100).toFixed(1)}%)`);
    }
    
    if (sentiment.strength > 0.7) {
      reasoning.push(`Positive sentiment analysis (${(sentiment.strength * 100).toFixed(1)}%)`);
    }
    
    if (trend.strength > 0.7) {
      reasoning.push(`Clear trend direction (${(trend.strength * 100).toFixed(1)}%)`);
    }
    
    if (consistency >= this.MIN_CONSISTENCY_THRESHOLD) {
      reasoning.push(`High signal consistency (${(consistency * 100).toFixed(1)}%)`);
    } else {
      reasoning.push(`Inconsistent signals detected (${(consistency * 100).toFixed(1)}%)`);
    }
    
    if (alignment >= 0.6) {
      reasoning.push(`Good market condition alignment (${(alignment * 100).toFixed(1)}%)`);
    } else {
      reasoning.push(`Poor market alignment (${(alignment * 100).toFixed(1)}%)`);
    }
    
    if (greenLight) {
      reasoning.push('✅ All conditions met for trade execution');
    } else if (waitState) {
      reasoning.push('⏳ Waiting for clearer signals before proceeding');
    } else {
      reasoning.push('❌ Insufficient signal strength for safe trading');
    }
    
    return reasoning;
  }

  // Update market conditions
  private async updateMarketConditions(): Promise<void> {
    try {
      // Get market data from existing services
      const ethMonitor = await (serviceRegistry as any).getService?.('ethMonitor');
      if (ethMonitor && ethMonitor.getCurrentPrice) {
        const priceData = await ethMonitor.getCurrentPrice();
        
        // Simplified market condition assessment
        this.marketConditions = {
          trend: priceData.change24h > 2 ? 'uptrend' : priceData.change24h < -2 ? 'downtrend' : 'sideways',
          volatility: Math.abs(priceData.change24h) > 5 ? 'high' : Math.abs(priceData.change24h) > 2 ? 'medium' : 'low',
          volume: 'medium', // Default as we don't have volume data readily available
          sentiment: priceData.change24h > 0 ? 'bullish' : priceData.change24h < 0 ? 'bearish' : 'neutral',
          alignment: 0.7 // Default alignment
        };
      }
    } catch (error) {
      console.error('Error updating market conditions:', error);
      // Keep existing conditions or set defaults
      if (!this.marketConditions) {
        this.marketConditions = {
          trend: 'sideways',
          volatility: 'medium',
          volume: 'medium',
          sentiment: 'neutral',
          alignment: 0.5
        };
      }
    }
  }

  // Create fallback result when there are errors
  private createFallbackResult(entityId: string): SignalAggregationResult {
    return {
      overallStrength: 0.3,
      confidence: 0.2,
      direction: 'neutral',
      greenLight: false,
      riskLevel: 'high',
      marketAlignment: 0.3,
      signalConsistency: 0.2,
      waitState: true,
      reasoning: [`Signal aggregation temporarily unavailable for ${entityId}`, 'System will retry automatically'],
      signals: []
    };
  }

  // Background signal cleanup
  private startSignalCleanup(): void {
    setInterval(() => {
      const currentTime = Date.now();
      
      for (const [entityId, signals] of Array.from(this.activeSignals.entries())) {
        const activeSignals = signals.filter(
          (signal: TradingSignal) => (currentTime - signal.timestamp) < this.SIGNAL_EXPIRY_MS
        );
        
        if (activeSignals.length !== signals.length) {
          this.activeSignals.set(entityId, activeSignals);
        }
      }
    }, 60000); // Clean up every minute
  }

  // Background market monitoring
  private startMarketMonitoring(): void {
    setInterval(() => {
      this.updateMarketConditions();
    }, 30000); // Update market conditions every 30 seconds
  }

  // Get current market conditions (for external access)
  getMarketConditions(): MarketCondition | null {
    return this.marketConditions;
  }

  // Get signal statistics for an entity
  getSignalStats(entityId: string): { total: number; byType: Record<string, number>; avgStrength: number } {
    const signals = this.getActiveSignals(entityId);
    const byType = signals.reduce((acc, signal) => {
      acc[signal.type] = (acc[signal.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const avgStrength = signals.length > 0 
      ? signals.reduce((sum, s) => sum + s.strength, 0) / signals.length 
      : 0;
    
    return {
      total: signals.length,
      byType,
      avgStrength
    };
  }
}

export const signalAggregatorService = new SignalAggregatorService();