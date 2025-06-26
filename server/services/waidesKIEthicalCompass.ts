/**
 * STEP 44: Waides KI Ethical Compass
 * Core moral analysis system that calculates ethical scores for trading setups
 */

interface TradingSetup {
  rsi: number;
  volume_spike: boolean;
  volume_tied_to_news: boolean;
  time_of_day: string;
  price_movement: number;
  trend_strength: number;
  market_volatility: number;
  reversal_signals: number;
}

interface EthicalAnalysis {
  manipulation_risk: number;
  emotional_trading_risk: number;
  liquidity_risk: number;
  timing_risk: number;
  trend_exploitation_risk: number;
  overall_ethics_score: number;
  ethical_warnings: string[];
  moral_judgment: 'CLEAN' | 'QUESTIONABLE' | 'UNETHICAL';
}

export class WaidesKIEthicalCompass {
  private readonly ETHICAL_THRESHOLDS = {
    RSI_EXTREME_HIGH: 85,
    RSI_EXTREME_LOW: 15,
    VOLUME_SPIKE_THRESHOLD: 2.0,
    VOLATILITY_EXTREME: 0.8,
    CLEAN_SCORE_MINIMUM: 0.75,
    QUESTIONABLE_SCORE_MINIMUM: 0.5
  };

  private readonly ILLIQUID_ZONES = [
    'late_night', 'early_morning', 'weekend', 'holiday',
    'pre_market_low', 'post_market_low'
  ];

  private readonly TIME_ZONE_ETHICS = {
    'asia_open': 0.9,     // Clean institutional flow
    'london_open': 0.95,  // Most ethical trading window
    'us_open': 0.85,      // High volume but more retail emotion
    'overlap_asia_london': 0.92,
    'overlap_london_us': 0.88,
    'illiquid_zone': 0.6, // Higher manipulation risk
    'weekend': 0.4,       // Crypto-only, higher manipulation
    'holiday': 0.5        // Thin liquidity
  };

  constructor() {
    console.log('🧭 Waides KI Ethical Compass initialized - Moral trading analysis active');
  }

  /**
   * Evaluate the ethical score of a trading setup
   */
  evaluateEthics(setup: TradingSetup): EthicalAnalysis {
    let ethicsScore = 1.0;
    const warnings: string[] = [];

    // 1. Extreme RSI Analysis (Emotional vs Rational)
    const rsiRisk = this.analyzeRSIEthics(setup.rsi);
    ethicsScore -= rsiRisk.penalty;
    if (rsiRisk.warning) warnings.push(rsiRisk.warning);

    // 2. Volume Manipulation Detection
    const volumeRisk = this.analyzeVolumeEthics(setup.volume_spike, setup.volume_tied_to_news);
    ethicsScore -= volumeRisk.penalty;
    if (volumeRisk.warning) warnings.push(volumeRisk.warning);

    // 3. Market Timing Ethics
    const timingRisk = this.analyzeTimingEthics(setup.time_of_day);
    ethicsScore -= timingRisk.penalty;
    if (timingRisk.warning) warnings.push(timingRisk.warning);

    // 4. Trend Exploitation Analysis
    const trendRisk = this.analyzeTrendEthics(setup.trend_strength, setup.reversal_signals);
    ethicsScore -= trendRisk.penalty;
    if (trendRisk.warning) warnings.push(trendRisk.warning);

    // 5. Volatility Exploitation Check
    const volatilityRisk = this.analyzeVolatilityEthics(setup.market_volatility);
    ethicsScore -= volatilityRisk.penalty;
    if (volatilityRisk.warning) warnings.push(volatilityRisk.warning);

    const finalScore = Math.max(0, Math.min(1, ethicsScore));

    return {
      manipulation_risk: this.calculateManipulationRisk(setup),
      emotional_trading_risk: this.calculateEmotionalRisk(setup),
      liquidity_risk: this.calculateLiquidityRisk(setup.time_of_day),
      timing_risk: this.calculateTimingRisk(setup.time_of_day),
      trend_exploitation_risk: this.calculateTrendExploitationRisk(setup),
      overall_ethics_score: Number(finalScore.toFixed(3)),
      ethical_warnings: warnings,
      moral_judgment: this.getMoralJudgment(finalScore)
    };
  }

  /**
   * Quick ethics check for time-sensitive decisions
   */
  quickEthicsCheck(rsi: number, volumeSpike: boolean, timeZone: string): boolean {
    const baseScore = 1.0;
    let penalties = 0;

    if (rsi > this.ETHICAL_THRESHOLDS.RSI_EXTREME_HIGH || rsi < this.ETHICAL_THRESHOLDS.RSI_EXTREME_LOW) {
      penalties += 0.2;
    }

    if (volumeSpike) {
      penalties += 0.25;
    }

    if (this.ILLIQUID_ZONES.includes(timeZone)) {
      penalties += 0.15;
    }

    return (baseScore - penalties) >= this.ETHICAL_THRESHOLDS.QUESTIONABLE_SCORE_MINIMUM;
  }

  /**
   * Get comprehensive ethical guidelines
   */
  getEthicalGuidelines(): {
    core_principles: string[];
    forbidden_patterns: string[];
    preferred_conditions: string[];
    risk_factors: string[];
  } {
    return {
      core_principles: [
        'Trade only when market conditions are transparent and fair',
        'Avoid exploiting emotional extremes in other traders',
        'Respect market liquidity and avoid manipulation zones',
        'Align with natural market flows rather than forcing trades',
        'Maintain transparency in all trading decisions'
      ],
      forbidden_patterns: [
        'Trading during extreme RSI conditions (>85 or <15)',
        'Exploiting volume spikes without fundamental backing',
        'Trading in illiquid zones with high manipulation risk',
        'Following obvious market traps or false breakouts',
        'Chasing trends near exhaustion points'
      ],
      preferred_conditions: [
        'Clear trend confirmation with multiple indicators',
        'Healthy volume supporting price movements',
        'Trading during liquid market hours',
        'Well-defined support and resistance levels',
        'Fundamental alignment with technical signals'
      ],
      risk_factors: [
        'Unusual volume patterns suggesting manipulation',
        'Extreme volatility indicating emotional trading',
        'Trading outside major market sessions',
        'Reversal signals near trend extremes',
        'Lack of confirmation from multiple timeframes'
      ]
    };
  }

  /**
   * Generate ethical trading report
   */
  generateEthicalReport(recentAnalyses: EthicalAnalysis[]): {
    average_ethics_score: number;
    clean_trades_percentage: number;
    most_common_warnings: string[];
    ethical_improvement_suggestions: string[];
    moral_trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  } {
    if (recentAnalyses.length === 0) {
      return {
        average_ethics_score: 0,
        clean_trades_percentage: 0,
        most_common_warnings: [],
        ethical_improvement_suggestions: ['Begin ethical trading analysis'],
        moral_trend: 'STABLE'
      };
    }

    const avgScore = recentAnalyses.reduce((sum, analysis) => sum + analysis.overall_ethics_score, 0) / recentAnalyses.length;
    const cleanTrades = recentAnalyses.filter(a => a.moral_judgment === 'CLEAN').length;
    const cleanPercentage = (cleanTrades / recentAnalyses.length) * 100;

    // Count warning frequency
    const warningCounts: { [key: string]: number } = {};
    recentAnalyses.forEach(analysis => {
      analysis.ethical_warnings.forEach(warning => {
        warningCounts[warning] = (warningCounts[warning] || 0) + 1;
      });
    });

    const mostCommonWarnings = Object.entries(warningCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([warning]) => warning);

    // Determine trend
    const recentScores = recentAnalyses.slice(-10).map(a => a.overall_ethics_score);
    const firstHalf = recentScores.slice(0, Math.floor(recentScores.length / 2));
    const secondHalf = recentScores.slice(Math.floor(recentScores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    let trend: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
    if (secondAvg > firstAvg + 0.05) trend = 'IMPROVING';
    else if (secondAvg < firstAvg - 0.05) trend = 'DECLINING';

    return {
      average_ethics_score: Number(avgScore.toFixed(3)),
      clean_trades_percentage: Number(cleanPercentage.toFixed(1)),
      most_common_warnings: mostCommonWarnings,
      ethical_improvement_suggestions: this.generateImprovementSuggestions(warningCounts),
      moral_trend: trend
    };
  }

  /**
   * RSI-based emotional trading risk analysis
   */
  private analyzeRSIEthics(rsi: number): { penalty: number; warning?: string } {
    if (rsi > this.ETHICAL_THRESHOLDS.RSI_EXTREME_HIGH) {
      return {
        penalty: 0.2,
        warning: `Extreme overbought condition (RSI: ${rsi}) - potential emotional trading zone`
      };
    }
    
    if (rsi < this.ETHICAL_THRESHOLDS.RSI_EXTREME_LOW) {
      return {
        penalty: 0.2,
        warning: `Extreme oversold condition (RSI: ${rsi}) - potential panic selling zone`
      };
    }

    if (rsi > 75 || rsi < 25) {
      return {
        penalty: 0.1,
        warning: `Elevated RSI condition (${rsi}) - increased emotional trading risk`
      };
    }

    return { penalty: 0 };
  }

  /**
   * Volume manipulation detection
   */
  private analyzeVolumeEthics(volumeSpike: boolean, tiedToNews: boolean): { penalty: number; warning?: string } {
    if (volumeSpike && !tiedToNews) {
      return {
        penalty: 0.3,
        warning: 'Unusual volume spike without fundamental backing - manipulation risk'
      };
    }

    if (volumeSpike && tiedToNews) {
      return {
        penalty: 0.05,
        warning: 'High volume with news - proceed with caution'
      };
    }

    return { penalty: 0 };
  }

  /**
   * Market timing ethics analysis
   */
  private analyzeTimingEthics(timeOfDay: string): { penalty: number; warning?: string } {
    const ethicsMultiplier = this.TIME_ZONE_ETHICS[timeOfDay] || 0.7;
    const penalty = (1 - ethicsMultiplier) * 0.4;

    if (this.ILLIQUID_ZONES.includes(timeOfDay)) {
      return {
        penalty,
        warning: `Trading during ${timeOfDay} - increased manipulation and gap risk`
      };
    }

    if (ethicsMultiplier < 0.8) {
      return {
        penalty,
        warning: `Suboptimal trading window (${timeOfDay}) - reduced market fairness`
      };
    }

    return { penalty };
  }

  /**
   * Trend exploitation ethics
   */
  private analyzeTrendEthics(trendStrength: number, reversalSignals: number): { penalty: number; warning?: string } {
    if (trendStrength > 0.9 && reversalSignals > 2) {
      return {
        penalty: 0.25,
        warning: 'Trend exhaustion with reversal signals - avoid exploiting late followers'
      };
    }

    if (trendStrength < 0.3) {
      return {
        penalty: 0.15,
        warning: 'Weak trend - trading may exploit market confusion'
      };
    }

    return { penalty: 0 };
  }

  /**
   * Volatility exploitation analysis
   */
  private analyzeVolatilityEthics(volatility: number): { penalty: number; warning?: string } {
    if (volatility > this.ETHICAL_THRESHOLDS.VOLATILITY_EXTREME) {
      return {
        penalty: 0.2,
        warning: 'Extreme volatility - may exploit emotional trading'
      };
    }

    return { penalty: 0 };
  }

  /**
   * Calculate various risk factors
   */
  private calculateManipulationRisk(setup: TradingSetup): number {
    let risk = 0;
    if (setup.volume_spike && !setup.volume_tied_to_news) risk += 0.4;
    if (this.ILLIQUID_ZONES.includes(setup.time_of_day)) risk += 0.3;
    if (setup.market_volatility > 0.8) risk += 0.2;
    return Math.min(1, risk);
  }

  private calculateEmotionalRisk(setup: TradingSetup): number {
    let risk = 0;
    if (setup.rsi > 85 || setup.rsi < 15) risk += 0.5;
    if (setup.market_volatility > 0.7) risk += 0.3;
    if (setup.reversal_signals > 2) risk += 0.2;
    return Math.min(1, risk);
  }

  private calculateLiquidityRisk(timeOfDay: string): number {
    if (this.ILLIQUID_ZONES.includes(timeOfDay)) return 0.8;
    const ethicsScore = this.TIME_ZONE_ETHICS[timeOfDay] || 0.5;
    return 1 - ethicsScore;
  }

  private calculateTimingRisk(timeOfDay: string): number {
    return this.calculateLiquidityRisk(timeOfDay);
  }

  private calculateTrendExploitationRisk(setup: TradingSetup): number {
    let risk = 0;
    if (setup.trend_strength > 0.9) risk += 0.3;
    if (setup.reversal_signals > 1) risk += 0.4;
    if (setup.price_movement > 5) risk += 0.2; // Large moves may indicate exhaustion
    return Math.min(1, risk);
  }

  /**
   * Determine moral judgment based on score
   */
  private getMoralJudgment(score: number): 'CLEAN' | 'QUESTIONABLE' | 'UNETHICAL' {
    if (score >= this.ETHICAL_THRESHOLDS.CLEAN_SCORE_MINIMUM) return 'CLEAN';
    if (score >= this.ETHICAL_THRESHOLDS.QUESTIONABLE_SCORE_MINIMUM) return 'QUESTIONABLE';
    return 'UNETHICAL';
  }

  /**
   * Generate improvement suggestions based on common warnings
   */
  private generateImprovementSuggestions(warningCounts: { [key: string]: number }): string[] {
    const suggestions = [];
    
    if (warningCounts['Extreme overbought condition'] || warningCounts['Extreme oversold condition']) {
      suggestions.push('Avoid trading during extreme RSI conditions - wait for market balance');
    }
    
    if (warningCounts['Unusual volume spike without fundamental backing']) {
      suggestions.push('Implement news correlation analysis before trading volume spikes');
    }
    
    if (warningCounts['Trading during illiquid zones']) {
      suggestions.push('Focus trading during major market session overlaps');
    }
    
    if (warningCounts['Trend exhaustion with reversal signals']) {
      suggestions.push('Exit positions early when trend exhaustion signals appear');
    }

    if (suggestions.length === 0) {
      suggestions.push('Continue maintaining high ethical standards in trading decisions');
    }

    return suggestions;
  }
}