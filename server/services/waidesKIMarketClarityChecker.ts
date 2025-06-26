/**
 * STEP 44: Waides KI Market Clarity Checker
 * Truth Scan system that detects market manipulation, fake volume, and trading traps
 */

interface MarketIndicators {
  fakeouts: number;
  confirming_indicators: boolean;
  volume_authenticity: number;
  price_action_coherence: number;
  support_resistance_validity: number;
  institutional_flow_alignment: boolean;
  manipulation_signals: string[];
  whipsaw_frequency: number;
  breakout_failure_rate: number;
  volume_price_divergence: boolean;
}

interface ClarityAnalysis {
  market_transparency: number;
  manipulation_risk: number;
  signal_reliability: number;
  institutional_alignment: number;
  retail_trap_probability: number;
  overall_clarity_score: number;
  clarity_warnings: string[];
  truth_verdict: 'CRYSTAL_CLEAR' | 'MOSTLY_CLEAR' | 'CLOUDY' | 'HEAVILY_MANIPULATED' | 'DECEPTIVE';
  safe_to_trade: boolean;
}

export class WaidesKIMarketClarityChecker {
  private readonly CLARITY_THRESHOLDS = {
    CRYSTAL_CLEAR_MINIMUM: 0.85,
    MOSTLY_CLEAR_MINIMUM: 0.7,
    CLOUDY_MINIMUM: 0.5,
    HEAVILY_MANIPULATED_MINIMUM: 0.3,
    MAX_FAKEOUTS_TOLERATED: 2,
    MIN_VOLUME_AUTHENTICITY: 0.6,
    MAX_WHIPSAW_FREQUENCY: 3,
    MAX_BREAKOUT_FAILURE_RATE: 0.4
  };

  private readonly MANIPULATION_PATTERNS = {
    WASH_TRADING: 'Artificial volume without price movement',
    PUMP_AND_DUMP: 'Rapid price rise followed by immediate sell-off',
    STOP_HUNTING: 'Price spikes to trigger stops then reversal',
    FAKE_BREAKOUTS: 'Multiple failed breakouts indicating manipulation',
    VOLUME_SPOOFING: 'Large orders placed and cancelled to create false demand',
    PRICE_SUPPRESSION: 'Consistent selling pressure at key resistance levels',
    COORDINATED_SELLING: 'Synchronized large sells across multiple exchanges',
    LIQUIDITY_TRAPS: 'False liquidity creation to trap retail traders'
  };

  private readonly AUTHENTICITY_INDICATORS = {
    ORGANIC_VOLUME: 'Volume increases naturally with price movement',
    INSTITUTIONAL_FLOW: 'Large block trades aligned with trend direction',
    GRADUAL_ACCUMULATION: 'Steady buying without dramatic spikes',
    CLEAN_BREAKOUTS: 'Breakouts with sustained follow-through',
    CONSISTENT_PATTERNS: 'Technical patterns that resolve as expected',
    FUNDAMENTAL_ALIGNMENT: 'Price action aligns with fundamental developments'
  };

  constructor() {
    console.log('🔍 Waides KI Market Clarity Checker initialized - Truth scan active');
  }

  /**
   * Analyze market clarity and detect manipulation
   */
  analyzeClarityScore(indicators: MarketIndicators): ClarityAnalysis {
    let clarityScore = 1.0;
    const warnings: string[] = [];

    // 1. Fakeout Analysis
    const fakeoutImpact = this.analyzeFakeouts(indicators.fakeouts);
    clarityScore -= fakeoutImpact.penalty;
    warnings.push(...fakeoutImpact.warnings);

    // 2. Indicator Confirmation Assessment
    if (!indicators.confirming_indicators) {
      clarityScore -= 0.3;
      warnings.push('Lack of confirming indicators suggests unclear market direction');
    }

    // 3. Volume Authenticity Check
    const volumeImpact = this.analyzeVolumeAuthenticity(indicators.volume_authenticity);
    clarityScore -= volumeImpact.penalty;
    warnings.push(...volumeImpact.warnings);

    // 4. Price Action Coherence
    const priceActionImpact = this.analyzePriceActionCoherence(indicators.price_action_coherence);
    clarityScore -= priceActionImpact.penalty;
    warnings.push(...priceActionImpact.warnings);

    // 5. Support/Resistance Validity
    const srImpact = this.analyzeSupportResistance(indicators.support_resistance_validity);
    clarityScore -= srImpact.penalty;
    warnings.push(...srImpact.warnings);

    // 6. Manipulation Signal Detection
    const manipulationImpact = this.analyzeManipulationSignals(indicators.manipulation_signals);
    clarityScore -= manipulationImpact.penalty;
    warnings.push(...manipulationImpact.warnings);

    // 7. Whipsaw and Breakout Failure Analysis
    const volatilityImpact = this.analyzeVolatilityPatterns(
      indicators.whipsaw_frequency,
      indicators.breakout_failure_rate
    );
    clarityScore -= volatilityImpact.penalty;
    warnings.push(...volatilityImpact.warnings);

    const finalScore = Math.max(0, Math.min(1, clarityScore));

    return {
      market_transparency: this.calculateTransparency(indicators),
      manipulation_risk: this.calculateManipulationRisk(indicators),
      signal_reliability: this.calculateSignalReliability(indicators),
      institutional_alignment: indicators.institutional_flow_alignment ? 0.8 : 0.3,
      retail_trap_probability: this.calculateRetailTrapProbability(indicators),
      overall_clarity_score: Number(finalScore.toFixed(3)),
      clarity_warnings: warnings,
      truth_verdict: this.getTruthVerdict(finalScore),
      safe_to_trade: this.isSafeToTrade(finalScore, indicators)
    };
  }

  /**
   * Quick clarity check for time-sensitive decisions
   */
  quickClarityCheck(fakeouts: number, volumeAuth: number, manipSignals: number): boolean {
    if (fakeouts > this.CLARITY_THRESHOLDS.MAX_FAKEOUTS_TOLERATED) return false;
    if (volumeAuth < this.CLARITY_THRESHOLDS.MIN_VOLUME_AUTHENTICITY) return false;
    if (manipSignals > 2) return false;
    return true;
  }

  /**
   * Detect specific manipulation patterns
   */
  detectManipulationPatterns(marketData: {
    price_changes: number[];
    volume_changes: number[];
    large_orders: { size: number; cancelled: boolean }[];
    breakout_attempts: { success: boolean; follow_through: number }[];
  }): {
    detected_patterns: string[];
    manipulation_probability: number;
    evidence_strength: 'WEAK' | 'MODERATE' | 'STRONG' | 'OVERWHELMING';
  } {
    const detectedPatterns: string[] = [];
    let manipulationScore = 0;

    // Wash Trading Detection
    const washTradingSignal = this.detectWashTrading(marketData.price_changes, marketData.volume_changes);
    if (washTradingSignal.detected) {
      detectedPatterns.push(this.MANIPULATION_PATTERNS.WASH_TRADING);
      manipulationScore += 0.3;
    }

    // Pump and Dump Detection
    const pumpDumpSignal = this.detectPumpAndDump(marketData.price_changes);
    if (pumpDumpSignal.detected) {
      detectedPatterns.push(this.MANIPULATION_PATTERNS.PUMP_AND_DUMP);
      manipulationScore += 0.4;
    }

    // Volume Spoofing Detection
    const spoofingSignal = this.detectVolumeSpoofing(marketData.large_orders);
    if (spoofingSignal.detected) {
      detectedPatterns.push(this.MANIPULATION_PATTERNS.VOLUME_SPOOFING);
      manipulationScore += 0.25;
    }

    // Fake Breakout Detection
    const fakeBreakoutSignal = this.detectFakeBreakouts(marketData.breakout_attempts);
    if (fakeBreakoutSignal.detected) {
      detectedPatterns.push(this.MANIPULATION_PATTERNS.FAKE_BREAKOUTS);
      manipulationScore += 0.35;
    }

    const evidenceStrength = this.getEvidenceStrength(manipulationScore);

    return {
      detected_patterns: detectedPatterns,
      manipulation_probability: Number(Math.min(1, manipulationScore).toFixed(3)),
      evidence_strength: evidenceStrength
    };
  }

  /**
   * Generate market truth report
   */
  generateTruthReport(recentAnalyses: ClarityAnalysis[]): {
    average_clarity_score: number;
    clean_market_percentage: number;
    most_common_warnings: string[];
    manipulation_trend: 'INCREASING' | 'STABLE' | 'DECREASING';
    trading_safety_rating: 'SAFE' | 'CAUTION' | 'DANGEROUS';
  } {
    if (recentAnalyses.length === 0) {
      return {
        average_clarity_score: 0,
        clean_market_percentage: 0,
        most_common_warnings: [],
        manipulation_trend: 'STABLE',
        trading_safety_rating: 'DANGEROUS'
      };
    }

    const avgClarity = recentAnalyses.reduce((sum, analysis) => sum + analysis.overall_clarity_score, 0) / recentAnalyses.length;
    
    const cleanMarkets = recentAnalyses.filter(a => 
      a.truth_verdict === 'CRYSTAL_CLEAR' || a.truth_verdict === 'MOSTLY_CLEAR'
    ).length;
    const cleanPercentage = (cleanMarkets / recentAnalyses.length) * 100;

    // Count warning frequency
    const warningCounts: { [key: string]: number } = {};
    recentAnalyses.forEach(analysis => {
      analysis.clarity_warnings.forEach(warning => {
        warningCounts[warning] = (warningCounts[warning] || 0) + 1;
      });
    });

    const mostCommonWarnings = Object.entries(warningCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([warning]) => warning);

    // Determine manipulation trend
    const recentScores = recentAnalyses.slice(-10).map(a => a.overall_clarity_score);
    const firstHalf = recentScores.slice(0, Math.floor(recentScores.length / 2));
    const secondHalf = recentScores.slice(Math.floor(recentScores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    let trend: 'INCREASING' | 'STABLE' | 'DECREASING' = 'STABLE';
    if (secondAvg > firstAvg + 0.1) trend = 'DECREASING'; // Higher clarity = less manipulation
    else if (secondAvg < firstAvg - 0.1) trend = 'INCREASING';

    // Safety rating
    let safetyRating: 'SAFE' | 'CAUTION' | 'DANGEROUS' = 'DANGEROUS';
    if (avgClarity >= 0.7) safetyRating = 'SAFE';
    else if (avgClarity >= 0.5) safetyRating = 'CAUTION';

    return {
      average_clarity_score: Number(avgClarity.toFixed(3)),
      clean_market_percentage: Number(cleanPercentage.toFixed(1)),
      most_common_warnings: mostCommonWarnings,
      manipulation_trend: trend,
      trading_safety_rating: safetyRating
    };
  }

  /**
   * Analyze fakeout frequency and impact
   */
  private analyzeFakeouts(fakeouts: number): { penalty: number; warnings: string[] } {
    const warnings: string[] = [];
    let penalty = 0;

    if (fakeouts > this.CLARITY_THRESHOLDS.MAX_FAKEOUTS_TOLERATED) {
      penalty = Math.min(0.4, fakeouts * 0.1);
      warnings.push(`Excessive fakeouts detected (${fakeouts}) - market manipulation likely`);
    } else if (fakeouts > 1) {
      penalty = 0.1;
      warnings.push(`Multiple fakeouts present (${fakeouts}) - exercise caution`);
    }

    return { penalty, warnings };
  }

  /**
   * Analyze volume authenticity
   */
  private analyzeVolumeAuthenticity(volumeAuth: number): { penalty: number; warnings: string[] } {
    const warnings: string[] = [];
    let penalty = 0;

    if (volumeAuth < this.CLARITY_THRESHOLDS.MIN_VOLUME_AUTHENTICITY) {
      penalty = (this.CLARITY_THRESHOLDS.MIN_VOLUME_AUTHENTICITY - volumeAuth) * 0.5;
      warnings.push(`Low volume authenticity (${(volumeAuth * 100).toFixed(1)}%) - potential wash trading`);
    }

    return { penalty, warnings };
  }

  /**
   * Analyze price action coherence
   */
  private analyzePriceActionCoherence(coherence: number): { penalty: number; warnings: string[] } {
    const warnings: string[] = [];
    let penalty = 0;

    if (coherence < 0.6) {
      penalty = (0.6 - coherence) * 0.4;
      warnings.push(`Incoherent price action (${(coherence * 100).toFixed(1)}%) - mixed signals present`);
    }

    return { penalty, warnings };
  }

  /**
   * Analyze support and resistance validity
   */
  private analyzeSupportResistance(validity: number): { penalty: number; warnings: string[] } {
    const warnings: string[] = [];
    let penalty = 0;

    if (validity < 0.5) {
      penalty = (0.5 - validity) * 0.3;
      warnings.push(`Weak support/resistance levels (${(validity * 100).toFixed(1)}%) - unreliable reference points`);
    }

    return { penalty, warnings };
  }

  /**
   * Analyze manipulation signals
   */
  private analyzeManipulationSignals(signals: string[]): { penalty: number; warnings: string[] } {
    const warnings: string[] = [];
    const penalty = Math.min(0.5, signals.length * 0.15);

    if (signals.length > 0) {
      warnings.push(`Manipulation signals detected: ${signals.join(', ')}`);
    }

    return { penalty, warnings };
  }

  /**
   * Analyze volatility patterns (whipsaws and breakout failures)
   */
  private analyzeVolatilityPatterns(whipsaws: number, breakoutFailureRate: number): { penalty: number; warnings: string[] } {
    const warnings: string[] = [];
    let penalty = 0;

    if (whipsaws > this.CLARITY_THRESHOLDS.MAX_WHIPSAW_FREQUENCY) {
      penalty += 0.2;
      warnings.push(`Excessive whipsaw activity (${whipsaws}) - unstable market conditions`);
    }

    if (breakoutFailureRate > this.CLARITY_THRESHOLDS.MAX_BREAKOUT_FAILURE_RATE) {
      penalty += 0.25;
      warnings.push(`High breakout failure rate (${(breakoutFailureRate * 100).toFixed(1)}%) - false signals common`);
    }

    return { penalty, warnings };
  }

  /**
   * Calculate market transparency score
   */
  private calculateTransparency(indicators: MarketIndicators): number {
    let transparency = 1.0;
    
    transparency -= indicators.fakeouts * 0.1;
    transparency -= (1 - indicators.volume_authenticity) * 0.3;
    transparency -= indicators.manipulation_signals.length * 0.1;
    
    if (!indicators.confirming_indicators) transparency -= 0.2;
    if (indicators.volume_price_divergence) transparency -= 0.15;

    return Number(Math.max(0, Math.min(1, transparency)).toFixed(3));
  }

  /**
   * Calculate manipulation risk
   */
  private calculateManipulationRisk(indicators: MarketIndicators): number {
    let risk = 0;
    
    risk += indicators.fakeouts * 0.15;
    risk += (1 - indicators.volume_authenticity) * 0.4;
    risk += indicators.manipulation_signals.length * 0.2;
    risk += indicators.whipsaw_frequency * 0.05;
    risk += indicators.breakout_failure_rate * 0.3;

    return Number(Math.min(1, risk).toFixed(3));
  }

  /**
   * Calculate signal reliability
   */
  private calculateSignalReliability(indicators: MarketIndicators): number {
    let reliability = 1.0;
    
    if (!indicators.confirming_indicators) reliability -= 0.4;
    reliability -= indicators.fakeouts * 0.1;
    reliability -= indicators.breakout_failure_rate * 0.3;
    reliability *= indicators.price_action_coherence;
    reliability *= indicators.support_resistance_validity;

    return Number(Math.max(0, Math.min(1, reliability)).toFixed(3));
  }

  /**
   * Calculate retail trap probability
   */
  private calculateRetailTrapProbability(indicators: MarketIndicators): number {
    let trapProb = 0;
    
    trapProb += indicators.fakeouts * 0.2;
    trapProb += indicators.manipulation_signals.length * 0.15;
    trapProb += (1 - indicators.volume_authenticity) * 0.25;
    trapProb += indicators.breakout_failure_rate * 0.4;

    return Number(Math.min(1, trapProb).toFixed(3));
  }

  /**
   * Detect wash trading patterns
   */
  private detectWashTrading(priceChanges: number[], volumeChanges: number[]): { detected: boolean; confidence: number } {
    let suspiciousPatterns = 0;
    
    for (let i = 0; i < Math.min(priceChanges.length, volumeChanges.length); i++) {
      if (Math.abs(priceChanges[i]) < 0.01 && volumeChanges[i] > 2.0) {
        suspiciousPatterns++;
      }
    }

    const confidence = Math.min(1, suspiciousPatterns / 5);
    return { detected: confidence > 0.3, confidence };
  }

  /**
   * Detect pump and dump patterns
   */
  private detectPumpAndDump(priceChanges: number[]): { detected: boolean; confidence: number } {
    let pumpDumpSignals = 0;
    
    for (let i = 1; i < priceChanges.length; i++) {
      if (priceChanges[i-1] > 5 && priceChanges[i] < -3) {
        pumpDumpSignals++;
      }
    }

    const confidence = Math.min(1, pumpDumpSignals / 3);
    return { detected: confidence > 0.4, confidence };
  }

  /**
   * Detect volume spoofing
   */
  private detectVolumeSpoofing(largeOrders: { size: number; cancelled: boolean }[]): { detected: boolean; confidence: number } {
    const totalOrders = largeOrders.length;
    const cancelledOrders = largeOrders.filter(order => order.cancelled).length;
    
    if (totalOrders === 0) return { detected: false, confidence: 0 };
    
    const cancellationRate = cancelledOrders / totalOrders;
    const confidence = Math.min(1, cancellationRate);
    
    return { detected: cancellationRate > 0.6, confidence };
  }

  /**
   * Detect fake breakouts
   */
  private detectFakeBreakouts(breakouts: { success: boolean; follow_through: number }[]): { detected: boolean; confidence: number } {
    if (breakouts.length === 0) return { detected: false, confidence: 0 };
    
    const failedBreakouts = breakouts.filter(b => !b.success || b.follow_through < 0.3).length;
    const failureRate = failedBreakouts / breakouts.length;
    
    return { detected: failureRate > 0.6, confidence: failureRate };
  }

  /**
   * Get evidence strength based on manipulation score
   */
  private getEvidenceStrength(score: number): 'WEAK' | 'MODERATE' | 'STRONG' | 'OVERWHELMING' {
    if (score >= 0.8) return 'OVERWHELMING';
    if (score >= 0.6) return 'STRONG';
    if (score >= 0.3) return 'MODERATE';
    return 'WEAK';
  }

  /**
   * Determine truth verdict based on clarity score
   */
  private getTruthVerdict(score: number): ClarityAnalysis['truth_verdict'] {
    if (score >= this.CLARITY_THRESHOLDS.CRYSTAL_CLEAR_MINIMUM) return 'CRYSTAL_CLEAR';
    if (score >= this.CLARITY_THRESHOLDS.MOSTLY_CLEAR_MINIMUM) return 'MOSTLY_CLEAR';
    if (score >= this.CLARITY_THRESHOLDS.CLOUDY_MINIMUM) return 'CLOUDY';
    if (score >= this.CLARITY_THRESHOLDS.HEAVILY_MANIPULATED_MINIMUM) return 'HEAVILY_MANIPULATED';
    return 'DECEPTIVE';
  }

  /**
   * Determine if market is safe for trading
   */
  private isSafeToTrade(clarityScore: number, indicators: MarketIndicators): boolean {
    if (clarityScore < this.CLARITY_THRESHOLDS.CLOUDY_MINIMUM) return false;
    if (indicators.fakeouts > this.CLARITY_THRESHOLDS.MAX_FAKEOUTS_TOLERATED) return false;
    if (indicators.volume_authenticity < this.CLARITY_THRESHOLDS.MIN_VOLUME_AUTHENTICITY) return false;
    if (indicators.manipulation_signals.length > 2) return false;
    return true;
  }
}