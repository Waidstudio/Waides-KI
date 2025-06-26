/**
 * STEP 50: Whisper Context Analyzer - Hash Current Context
 * Analyzes trading context and generates unique hashes for spirit consultation
 * Enables pattern matching with historical trading decisions
 */

import * as crypto from 'crypto';
import { waidesKIPastTradeSpirits } from './waidesKIPastTradeSpirits.js';

interface TradingContext {
  price: number;
  rsi: number;
  ema50: number;
  ema200: number;
  volume: number;
  market_trend: string;
  emotional_state: string;
  time_window: string;
  volatility: number;
  position_type?: string;
}

interface ContextAdvice {
  advice: string | null;
  count: number;
  success_rate: number;
  konslang_wisdom: string;
  spirit_strength: number;
  confidence: number;
}

export class WaidesKIWhisperContextAnalyzer {
  private contextNormalizer = {
    price_bucket_size: 50,      // Group prices in $50 buckets
    rsi_bucket_size: 5,         // Group RSI in 5-point buckets  
    volume_bucket_size: 1000,   // Group volume in 1000 buckets
    volatility_bucket_size: 0.5 // Group volatility in 0.5% buckets
  };

  /**
   * Generate context hash for pattern matching
   */
  getContextHash(context: TradingContext): string {
    // Normalize context for pattern matching
    const normalizedContext = {
      price_bucket: Math.floor(context.price / this.contextNormalizer.price_bucket_size),
      rsi_bucket: Math.floor(context.rsi / this.contextNormalizer.rsi_bucket_size),
      ema_alignment: this.getEMAAlignment(context.price, context.ema50, context.ema200),
      volume_bucket: Math.floor(context.volume / this.contextNormalizer.volume_bucket_size),
      market_trend: context.market_trend,
      emotional_state: context.emotional_state,
      time_window: context.time_window,
      volatility_bucket: Math.floor(context.volatility / this.contextNormalizer.volatility_bucket_size),
      position_type: context.position_type || 'unknown'
    };

    // Create deterministic hash
    const contextString = JSON.stringify(normalizedContext, Object.keys(normalizedContext).sort());
    return crypto.createHash('sha256').update(contextString).digest('hex');
  }

  /**
   * Get ancestral advice for current context
   */
  getAdvice(context: TradingContext): ContextAdvice {
    const contextHash = this.getContextHash(context);
    const spiritQuery = waidesKIPastTradeSpirits.querySimilarSpirits(contextHash);
    
    if (spiritQuery.total_count === 0) {
      return {
        advice: null,
        count: 0,
        success_rate: 0,
        konslang_wisdom: 'nou\'mar - no echoes from the past',
        spirit_strength: 0,
        confidence: 0
      };
    }

    // Calculate weighted advice based on spirit strength
    const adviceWeights = new Map<string, number>();
    let totalWeight = 0;

    spiritQuery.similar_spirits.forEach(spirit => {
      const weight = spirit.spirit_strength * spirit.wisdom_weight;
      const currentWeight = adviceWeights.get(spirit.feedback) || 0;
      adviceWeights.set(spirit.feedback, currentWeight + weight);
      totalWeight += weight;
    });

    // Find dominant advice
    const dominantAdvice = Array.from(adviceWeights.entries())
      .sort((a, b) => b[1] - a[1])[0];

    const advice = dominantAdvice ? dominantAdvice[0] : spiritQuery.dominant_feedback;
    const adviceWeight = dominantAdvice ? dominantAdvice[1] : 0;
    
    // Calculate confidence based on consensus and spirit strength
    const consensus = totalWeight > 0 ? (adviceWeight / totalWeight) * 100 : 0;
    const avgSpiritStrength = spiritQuery.similar_spirits.reduce(
      (sum, s) => sum + s.spirit_strength, 0
    ) / spiritQuery.similar_spirits.length;

    const confidence = Math.min(100, (consensus * 0.7) + (avgSpiritStrength * 10 * 0.3));

    return {
      advice,
      count: spiritQuery.total_count,
      success_rate: spiritQuery.success_rate,
      konslang_wisdom: spiritQuery.konslang_wisdom,
      spirit_strength: avgSpiritStrength,
      confidence
    };
  }

  /**
   * Get detailed context analysis with pattern insights
   */
  getDetailedContextAnalysis(context: TradingContext): any {
    const contextHash = this.getContextHash(context);
    const advice = this.getAdvice(context);
    
    // Analyze similar contexts with slight variations
    const relatedContexts = this.findRelatedContexts(context);
    
    return {
      context_hash: contextHash,
      current_context: context,
      ancestral_advice: advice,
      related_patterns: relatedContexts,
      pattern_strength: this.calculatePatternStrength(context),
      risk_warning: this.generateRiskWarning(advice),
      suggested_action: this.suggestAction(advice, context)
    };
  }

  /**
   * Find related trading contexts with slight variations
   */
  private findRelatedContexts(context: TradingContext): any[] {
    const relatedContexts = [];
    
    // Check contexts with similar RSI but different price levels
    const rsiVariation = {
      ...context,
      price: context.price * 0.95 // 5% price difference
    };
    const rsiAdvice = this.getAdvice(rsiVariation);
    if (rsiAdvice.count > 0) {
      relatedContexts.push({
        variation: 'price_lower',
        advice: rsiAdvice,
        difference: '5% lower price'
      });
    }

    // Check contexts with different emotional states
    const emotionalVariation = {
      ...context,
      emotional_state: context.emotional_state === 'neutral' ? 'hot' : 'neutral'
    };
    const emotionalAdvice = this.getAdvice(emotionalVariation);
    if (emotionalAdvice.count > 0) {
      relatedContexts.push({
        variation: 'emotional_state',
        advice: emotionalAdvice,
        difference: 'different emotional state'
      });
    }

    // Check contexts with different market trends
    const trendVariation = {
      ...context,
      market_trend: context.market_trend === 'bullish' ? 'bearish' : 'bullish'
    };
    const trendAdvice = this.getAdvice(trendVariation);
    if (trendAdvice.count > 0) {
      relatedContexts.push({
        variation: 'market_trend',
        advice: trendAdvice,
        difference: 'opposite market trend'
      });
    }

    return relatedContexts;
  }

  /**
   * Calculate overall pattern strength
   */
  private calculatePatternStrength(context: TradingContext): string {
    const advice = this.getAdvice(context);
    
    if (advice.count === 0) return 'UNKNOWN';
    
    if (advice.confidence >= 80 && advice.spirit_strength >= 7) return 'VERY_STRONG';
    if (advice.confidence >= 60 && advice.spirit_strength >= 5) return 'STRONG';
    if (advice.confidence >= 40 && advice.spirit_strength >= 3) return 'MODERATE';
    if (advice.count >= 3) return 'WEAK';
    
    return 'INSUFFICIENT_DATA';
  }

  /**
   * Generate risk warning based on ancestral advice
   */
  private generateRiskWarning(advice: ContextAdvice): string | null {
    if (!advice.advice) return null;
    
    if (advice.success_rate <= 30 && advice.confidence >= 60) {
      return `HIGH RISK: Ancestral spirits warn against this pattern (${advice.success_rate.toFixed(1)}% success rate)`;
    }
    
    if (advice.advice.includes('never') || advice.advice.includes('avoid')) {
      return `DANGER: Strong ancestral warning - ${advice.advice}`;
    }
    
    if (advice.success_rate <= 50 && advice.count >= 5) {
      return `CAUTION: This pattern has mixed historical results (${advice.success_rate.toFixed(1)}% success)`;
    }
    
    return null;
  }

  /**
   * Suggest action based on ancestral wisdom
   */
  private suggestAction(advice: ContextAdvice, context: TradingContext): string {
    if (!advice.advice) {
      return 'PROCEED_WITH_CAUTION - No ancestral guidance available';
    }
    
    if (advice.success_rate >= 70 && advice.confidence >= 60) {
      return `PROCEED - Strong ancestral support (${advice.success_rate.toFixed(1)}% success rate)`;
    }
    
    if (advice.success_rate <= 30 && advice.confidence >= 60) {
      return `AVOID - Ancestral spirits strongly warn against this pattern`;
    }
    
    if (advice.advice.includes('hold') || advice.advice.includes('patience')) {
      return 'WAIT - Ancestral wisdom suggests patience';
    }
    
    if (advice.advice.includes('never') || advice.advice.includes('avoid')) {
      return 'BLOCK - Direct ancestral prohibition';
    }
    
    return `EVALUATE - Mixed ancestral signals (${advice.success_rate.toFixed(1)}% success, ${advice.count} experiences)`;
  }

  /**
   * Determine EMA alignment category
   */
  private getEMAAlignment(price: number, ema50: number, ema200: number): string {
    const priceAbove50 = price > ema50;
    const priceAbove200 = price > ema200;
    const ema50Above200 = ema50 > ema200;
    
    if (priceAbove50 && priceAbove200 && ema50Above200) return 'BULLISH_ALIGNED';
    if (!priceAbove50 && !priceAbove200 && !ema50Above200) return 'BEARISH_ALIGNED';
    if (priceAbove50 && ema50Above200) return 'BULLISH_TRENDING';
    if (!priceAbove50 && !ema50Above200) return 'BEARISH_TRENDING';
    
    return 'MIXED_SIGNALS';
  }

  /**
   * Record trade outcome for learning
   */
  recordTradeOutcome(
    trade_id: string,
    context: TradingContext,
    feedback: string,
    result: 'win' | 'loss',
    profit_loss: number = 0
  ): void {
    const contextHash = this.getContextHash(context);
    
    waidesKIPastTradeSpirits.recordSpirit(
      trade_id,
      contextHash,
      context,
      feedback,
      result,
      profit_loss,
      context.market_trend,
      context.emotional_state
    );
    
    console.log(`🕯️ Trade spirit recorded: ${trade_id} - ${feedback} (${result})`);
  }

  /**
   * Bulk import historical context patterns
   */
  importHistoricalPatterns(patterns: any[]): void {
    patterns.forEach((pattern, index) => {
      const trade_id = `historical_${index}_${Date.now()}`;
      this.recordTradeOutcome(
        trade_id,
        pattern.context,
        pattern.feedback,
        pattern.result,
        pattern.profit_loss || 0
      );
    });
    
    console.log(`📚 Imported ${patterns.length} historical trading patterns`);
  }
}

export const waidesKIWhisperContextAnalyzer = new WaidesKIWhisperContextAnalyzer();