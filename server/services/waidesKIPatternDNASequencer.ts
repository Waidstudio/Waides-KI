/**
 * STEP 48: Waides KI Pattern DNA Sequencer
 * Converts trading setups into immune-checkable pattern DNA strings
 * Every market condition becomes a unique genetic fingerprint
 */

interface TradingIndicators {
  ema_50: number;
  ema_200: number;
  rsi: number;
  price: number;
  volume?: number;
  macd?: number;
  bollinger_upper?: number;
  bollinger_lower?: number;
}

export interface PatternDNA {
  dna_string: string;
  pattern_type: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'VOLATILE';
  complexity_score: number;
  volatility_signature: string;
  trend_signature: string;
  momentum_signature: string;
}

export class WaidesKIPatternDNASequencer {
  private readonly DNA_PRECISION = 10; // Round to nearest 10 for pattern matching

  /**
   * Convert trading indicators into pattern DNA string
   */
  sequence(indicators: TradingIndicators): PatternDNA {
    // Core DNA components
    const ema_50_rounded = Math.round(indicators.ema_50 / this.DNA_PRECISION) * this.DNA_PRECISION;
    const ema_200_rounded = Math.round(indicators.ema_200 / this.DNA_PRECISION) * this.DNA_PRECISION;
    const rsi_rounded = Math.round(indicators.rsi / 5) * 5; // Round to nearest 5 for RSI
    const price_rounded = Math.round(indicators.price / this.DNA_PRECISION) * this.DNA_PRECISION;

    // Generate base DNA string
    const base_dna = `${ema_50_rounded}-${ema_200_rounded}-${rsi_rounded}-${price_rounded}`;

    // Generate signature components
    const volatility_signature = this.generateVolatilitySignature(indicators);
    const trend_signature = this.generateTrendSignature(indicators);
    const momentum_signature = this.generateMomentumSignature(indicators);

    // Complete DNA string
    const dna_string = `${base_dna}-${volatility_signature}-${trend_signature}-${momentum_signature}`;

    // Determine pattern type
    const pattern_type = this.classifyPattern(indicators);

    // Calculate complexity score
    const complexity_score = this.calculateComplexity(indicators);

    return {
      dna_string,
      pattern_type,
      complexity_score,
      volatility_signature,
      trend_signature,
      momentum_signature
    };
  }

  /**
   * Generate volatility DNA signature
   */
  private generateVolatilitySignature(indicators: TradingIndicators): string {
    const price_ema_spread = Math.abs(indicators.price - indicators.ema_50);
    const ema_spread = Math.abs(indicators.ema_50 - indicators.ema_200);
    
    if (price_ema_spread > 50 && ema_spread > 30) return 'HIGH';
    if (price_ema_spread > 25 && ema_spread > 15) return 'MED';
    return 'LOW';
  }

  /**
   * Generate trend DNA signature
   */
  private generateTrendSignature(indicators: TradingIndicators): string {
    const { price, ema_50, ema_200 } = indicators;
    
    if (price > ema_50 && ema_50 > ema_200) return 'BULL';
    if (price < ema_50 && ema_50 < ema_200) return 'BEAR';
    if (price > ema_50 && ema_50 < ema_200) return 'MIXED_UP';
    if (price < ema_50 && ema_50 > ema_200) return 'MIXED_DOWN';
    return 'FLAT';
  }

  /**
   * Generate momentum DNA signature
   */
  private generateMomentumSignature(indicators: TradingIndicators): string {
    const { rsi } = indicators;
    
    if (rsi > 70) return 'OVERBOUGHT';
    if (rsi < 30) return 'OVERSOLD';
    if (rsi > 55) return 'STRONG';
    if (rsi < 45) return 'WEAK';
    return 'NEUTRAL';
  }

  /**
   * Classify overall pattern type
   */
  private classifyPattern(indicators: TradingIndicators): 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'VOLATILE' {
    const { price, ema_50, ema_200, rsi } = indicators;
    const price_ema_spread = Math.abs(indicators.price - indicators.ema_50);
    
    // High volatility pattern
    if (price_ema_spread > 50) return 'VOLATILE';
    
    // Bullish pattern
    if (price > ema_50 && ema_50 > ema_200 && rsi > 50) return 'BULLISH';
    
    // Bearish pattern
    if (price < ema_50 && ema_50 < ema_200 && rsi < 50) return 'BEARISH';
    
    return 'NEUTRAL';
  }

  /**
   * Calculate pattern complexity score (0-100)
   */
  private calculateComplexity(indicators: TradingIndicators): number {
    let complexity = 0;
    
    // RSI extremes add complexity
    if (indicators.rsi > 70 || indicators.rsi < 30) complexity += 25;
    
    // EMA crossovers add complexity
    const ema_diff = Math.abs(indicators.ema_50 - indicators.ema_200);
    if (ema_diff < 20) complexity += 30; // EMAs close together
    
    // Price vs EMA distance adds complexity
    const price_ema_distance = Math.abs(indicators.price - indicators.ema_50);
    if (price_ema_distance > 50) complexity += 25;
    
    // Volume spikes add complexity (if available)
    if (indicators.volume && indicators.volume > 2000000) complexity += 20;
    
    return Math.min(complexity, 100);
  }

  /**
   * Generate simplified DNA for basic pattern matching
   */
  generateSimpleDNA(indicators: TradingIndicators): string {
    const trend = this.generateTrendSignature(indicators);
    const momentum = this.generateMomentumSignature(indicators);
    const volatility = this.generateVolatilitySignature(indicators);
    
    return `${trend}-${momentum}-${volatility}`;
  }

  /**
   * Check if two DNA patterns are similar (for fuzzy matching)
   */
  areSimilarPatterns(dna1: string, dna2: string, similarity_threshold: number = 0.8): boolean {
    const components1 = dna1.split('-');
    const components2 = dna2.split('-');
    
    if (components1.length !== components2.length) return false;
    
    let matches = 0;
    for (let i = 0; i < components1.length; i++) {
      if (components1[i] === components2[i]) matches++;
    }
    
    const similarity = matches / components1.length;
    return similarity >= similarity_threshold;
  }

  /**
   * Extract pattern family (for grouping similar patterns)
   */
  getPatternFamily(dna: PatternDNA): string {
    return `${dna.trend_signature}-${dna.momentum_signature}`;
  }

  /**
   * Generate Konslang pattern name for spiritual context
   */
  generateKonslangPattern(dna: PatternDNA): string {
    const konslang_patterns = {
      'BULL-STRONG': 'sai\'mor',      // "Rising strength"
      'BULL-OVERBOUGHT': 'keth\'lan', // "Dangerous height"
      'BEAR-WEAK': 'mor\'dun',        // "Falling shadow"
      'BEAR-OVERSOLD': 'tal\'worth',  // "Deep wound"
      'MIXED_UP-NEUTRAL': 'zen\'kar', // "Confused spirit"
      'MIXED_DOWN-NEUTRAL': 'vex\'mor', // "Lost direction"
      'FLAT-NEUTRAL': 'sil\'eth',     // "Still water"
    };
    
    const family = this.getPatternFamily(dna);
    return konslang_patterns[family] || 'unknown\'pattern';
  }
}

// Export singleton instance
export const waidesKIPatternDNASequencer = new WaidesKIPatternDNASequencer();