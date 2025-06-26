/**
 * STEP 47: Waides KI Logic Brain
 * Pure calculation, indicators, chart patterns - "linar" consciousness
 */

interface LogicBrainData {
  ema_50: number;
  ema_200: number;
  rsi: number;
  price: number;
  volume: number;
  macd?: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger?: {
    upper: number;
    middle: number;
    lower: number;
  };
}

interface LogicBrainVote {
  vote: 'yes' | 'no' | 'neutral';
  confidence: number;
  sigil: string;
  reasoning: string;
  technical_analysis: {
    trend_direction: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
    momentum: 'STRONG' | 'MODERATE' | 'WEAK';
    support_resistance: string;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

interface LogicBrainStats {
  total_scans: number;
  yes_votes: number;
  no_votes: number;
  neutral_votes: number;
  average_confidence: number;
  accuracy_rate: number;
  last_scan_time: Date;
  pattern_recognition: {
    bullish_patterns: number;
    bearish_patterns: number;
    neutral_patterns: number;
  };
}

export class WaidesKILogicBrain {
  private stats: LogicBrainStats = {
    total_scans: 0,
    yes_votes: 0,
    no_votes: 0,
    neutral_votes: 0,
    average_confidence: 0,
    accuracy_rate: 0.7,
    last_scan_time: new Date(),
    pattern_recognition: {
      bullish_patterns: 0,
      bearish_patterns: 0,
      neutral_patterns: 0
    }
  };

  private readonly KONSLANG_SIGILS = {
    LINAR_YES: 'linar-yes',
    LINAR_NO: 'linar-no',
    LINAR_OVERBOUGHT: 'linar-overbought',
    LINAR_OVERSOLD: 'linar-oversold',
    LINAR_BREAKOUT: 'linar-breakout',
    LINAR_BREAKDOWN: 'linar-breakdown',
    LINAR_WAIT: 'linar-wait',
    LINAR_MOMENTUM: 'linar-momentum',
    LINAR_REVERSAL: 'linar-reversal'
  };

  /**
   * Main scan method - analyzes technical indicators and returns vote
   */
  scan(data: LogicBrainData): LogicBrainVote {
    try {
      this.stats.total_scans++;
      this.stats.last_scan_time = new Date();

      // Core technical analysis
      const trendAnalysis = this.analyzeTrend(data);
      const momentumAnalysis = this.analyzeMomentum(data);
      const volatilityAnalysis = this.analyzeVolatility(data);
      const supportResistance = this.analyzeSupportResistance(data);

      // Generate vote based on combined analysis
      const vote = this.generateVote(data, {
        trend: trendAnalysis,
        momentum: momentumAnalysis,
        volatility: volatilityAnalysis,
        support_resistance: supportResistance
      });

      // Update statistics
      this.updateStats(vote);

      return vote;
    } catch (error) {
      console.error('Error in Logic Brain scan:', error);
      return this.generateEmergencyVote();
    }
  }

  /**
   * Analyze trend direction using EMAs
   */
  private analyzeTrend(data: LogicBrainData): 'BULLISH' | 'BEARISH' | 'SIDEWAYS' {
    const { price, ema_50, ema_200 } = data;

    if (price > ema_50 && ema_50 > ema_200) {
      return 'BULLISH';
    } else if (price < ema_50 && ema_50 < ema_200) {
      return 'BEARISH';
    } else {
      return 'SIDEWAYS';
    }
  }

  /**
   * Analyze momentum using RSI and MACD
   */
  private analyzeMomentum(data: LogicBrainData): 'STRONG' | 'MODERATE' | 'WEAK' {
    const { rsi, macd } = data;

    let momentumScore = 0;

    // RSI momentum analysis
    if (rsi > 70) {
      momentumScore -= 2; // Overbought
    } else if (rsi < 30) {
      momentumScore += 2; // Oversold
    } else if (rsi >= 45 && rsi <= 65) {
      momentumScore += 1; // Healthy momentum
    }

    // MACD momentum analysis
    if (macd) {
      if (macd.macd > macd.signal && macd.histogram > 0) {
        momentumScore += 2; // Bullish momentum
      } else if (macd.macd < macd.signal && macd.histogram < 0) {
        momentumScore -= 2; // Bearish momentum
      }
    }

    if (momentumScore >= 2) return 'STRONG';
    if (momentumScore <= -2) return 'WEAK';
    return 'MODERATE';
  }

  /**
   * Analyze volatility using Bollinger Bands
   */
  private analyzeVolatility(data: LogicBrainData): 'LOW' | 'MEDIUM' | 'HIGH' {
    const { price, bollinger } = data;

    if (!bollinger) return 'MEDIUM';

    const bandWidth = (bollinger.upper - bollinger.lower) / bollinger.middle;
    const pricePosition = (price - bollinger.lower) / (bollinger.upper - bollinger.lower);

    if (bandWidth > 0.1) return 'HIGH';
    if (bandWidth < 0.05) return 'LOW';
    return 'MEDIUM';
  }

  /**
   * Analyze support and resistance levels
   */
  private analyzeSupportResistance(data: LogicBrainData): string {
    const { price, ema_50, ema_200, bollinger } = data;

    let analysis = '';

    if (bollinger) {
      if (price <= bollinger.lower) {
        analysis += 'Near lower Bollinger Band (support). ';
      } else if (price >= bollinger.upper) {
        analysis += 'Near upper Bollinger Band (resistance). ';
      }
    }

    if (price > ema_50) {
      analysis += `EMA-50 (${ema_50.toFixed(2)}) acting as support. `;
    } else {
      analysis += `EMA-50 (${ema_50.toFixed(2)}) acting as resistance. `;
    }

    return analysis.trim() || 'Price in neutral zone.';
  }

  /**
   * Generate final vote based on all analysis
   */
  private generateVote(data: LogicBrainData, analysis: any): LogicBrainVote {
    const { price, ema_50, ema_200, rsi } = data;
    
    let score = 0;
    let confidence = 0.5;
    let sigil = this.KONSLANG_SIGILS.LINAR_WAIT;
    let reasoning = '';

    // Trend scoring
    if (analysis.trend === 'BULLISH') {
      score += 3;
      reasoning += 'Bullish trend confirmed. ';
      this.stats.pattern_recognition.bullish_patterns++;
    } else if (analysis.trend === 'BEARISH') {
      score -= 3;
      reasoning += 'Bearish trend confirmed. ';
      this.stats.pattern_recognition.bearish_patterns++;
    } else {
      this.stats.pattern_recognition.neutral_patterns++;
    }

    // RSI scoring
    if (rsi >= 45 && rsi <= 70) {
      score += 2;
      reasoning += 'RSI in healthy range. ';
    } else if (rsi > 70) {
      score -= 2;
      reasoning += 'RSI overbought. ';
      sigil = this.KONSLANG_SIGILS.LINAR_OVERBOUGHT;
    } else if (rsi < 30) {
      score += 1;
      reasoning += 'RSI oversold (potential reversal). ';
      sigil = this.KONSLANG_SIGILS.LINAR_OVERSOLD;
    }

    // Momentum scoring
    if (analysis.momentum === 'STRONG') {
      score += analysis.trend === 'BULLISH' ? 2 : -2;
      reasoning += 'Strong momentum detected. ';
      sigil = this.KONSLANG_SIGILS.LINAR_MOMENTUM;
    }

    // Volume confirmation
    if (data.volume > 1000000) { // High volume threshold
      score += analysis.trend === 'BULLISH' ? 1 : -1;
      reasoning += 'High volume confirmation. ';
    }

    // Calculate confidence based on score magnitude
    confidence = Math.min(0.95, Math.max(0.3, Math.abs(score) / 10));

    // Generate final vote
    if (score >= 4) {
      sigil = this.KONSLANG_SIGILS.LINAR_YES;
      return {
        vote: 'yes',
        confidence,
        sigil,
        reasoning: 'Strong bullish signals: ' + reasoning,
        technical_analysis: {
          trend_direction: analysis.trend,
          momentum: analysis.momentum,
          support_resistance: analysis.support_resistance,
          risk_level: confidence > 0.7 ? 'LOW' : 'MEDIUM'
        }
      };
    } else if (score <= -4) {
      sigil = this.KONSLANG_SIGILS.LINAR_NO;
      return {
        vote: 'no',
        confidence,
        sigil,
        reasoning: 'Strong bearish signals: ' + reasoning,
        technical_analysis: {
          trend_direction: analysis.trend,
          momentum: analysis.momentum,
          support_resistance: analysis.support_resistance,
          risk_level: confidence > 0.7 ? 'LOW' : 'MEDIUM'
        }
      };
    } else {
      return {
        vote: 'neutral',
        confidence: Math.max(0.3, confidence),
        sigil: this.KONSLANG_SIGILS.LINAR_WAIT,
        reasoning: 'Mixed signals, waiting for clarity: ' + reasoning,
        technical_analysis: {
          trend_direction: analysis.trend,
          momentum: analysis.momentum,
          support_resistance: analysis.support_resistance,
          risk_level: 'MEDIUM'
        }
      };
    }
  }

  /**
   * Update internal statistics
   */
  private updateStats(vote: LogicBrainVote): void {
    if (vote.vote === 'yes') this.stats.yes_votes++;
    else if (vote.vote === 'no') this.stats.no_votes++;
    else this.stats.neutral_votes++;

    // Update average confidence
    const totalVotes = this.stats.yes_votes + this.stats.no_votes + this.stats.neutral_votes;
    this.stats.average_confidence = 
      (this.stats.average_confidence * (totalVotes - 1) + vote.confidence) / totalVotes;
  }

  /**
   * Generate emergency vote when scan fails
   */
  private generateEmergencyVote(): LogicBrainVote {
    return {
      vote: 'neutral',
      confidence: 0.3,
      sigil: this.KONSLANG_SIGILS.LINAR_WAIT,
      reasoning: 'Logic Brain malfunction - defaulting to neutral',
      technical_analysis: {
        trend_direction: 'SIDEWAYS',
        momentum: 'WEAK',
        support_resistance: 'Unable to analyze',
        risk_level: 'HIGH'
      }
    };
  }

  /**
   * Get brain statistics
   */
  getStats(): LogicBrainStats {
    return { ...this.stats };
  }

  /**
   * Record vote outcome for accuracy tracking
   */
  recordOutcome(voteId: string, actualOutcome: 'profit' | 'loss' | 'neutral'): void {
    // Update accuracy based on outcomes
    // This would be enhanced with proper vote tracking
  }

  /**
   * Reset brain statistics
   */
  resetStats(): void {
    this.stats = {
      total_scans: 0,
      yes_votes: 0,
      no_votes: 0,
      neutral_votes: 0,
      average_confidence: 0,
      accuracy_rate: 0.7,
      last_scan_time: new Date(),
      pattern_recognition: {
        bullish_patterns: 0,
        bearish_patterns: 0,
        neutral_patterns: 0
      }
    };
  }

  /**
   * Get Konslang sigil meanings
   */
  getSigilMeanings(): { [key: string]: string } {
    return {
      [this.KONSLANG_SIGILS.LINAR_YES]: 'Logic brain approves - strong technical signals',
      [this.KONSLANG_SIGILS.LINAR_NO]: 'Logic brain rejects - bearish technical signals',
      [this.KONSLANG_SIGILS.LINAR_OVERBOUGHT]: 'Market technically overbought',
      [this.KONSLANG_SIGILS.LINAR_OVERSOLD]: 'Market technically oversold',
      [this.KONSLANG_SIGILS.LINAR_BREAKOUT]: 'Technical breakout pattern detected',
      [this.KONSLANG_SIGILS.LINAR_BREAKDOWN]: 'Technical breakdown pattern detected',
      [this.KONSLANG_SIGILS.LINAR_WAIT]: 'Mixed technical signals - await clarity',
      [this.KONSLANG_SIGILS.LINAR_MOMENTUM]: 'Strong momentum confirmation',
      [this.KONSLANG_SIGILS.LINAR_REVERSAL]: 'Potential trend reversal detected'
    };
  }
}