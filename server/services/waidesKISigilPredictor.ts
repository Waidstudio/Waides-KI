/**
 * STEP 42: Waides KI Sigil Predictor
 * Detects known sigils and suggests trade direction based on historical patterns
 */

import { WaidesKISymbolTimeTrainer } from './waidesKISymbolTimeTrainer';

interface PredictionResult {
  symbol: string;
  recommendation: 'CONFIRMED_TRADE' | 'AVOID_TRADE' | 'PROCEED_WITH_CAUTION' | 'WAIT_FOR_BETTER_SIGNAL';
  confidence: number;
  strength: string;
  reason: string;
  historical_context: {
    sample_size: number;
    win_rate: number;
    avg_profit: number;
    spiritual_power: string;
  };
  market_alignment: {
    current_conditions_score: number;
    optimal_timing: boolean;
    risk_assessment: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  };
  prediction_metadata: {
    predicted_at: string;
    predictor_version: string;
    confidence_factors: string[];
  };
}

interface MarketConditions {
  time_of_day: string;
  day_of_week: string;
  volatility: string;
  volume: string;
  trend_momentum: number;
  spiritual_energy: number;
}

interface PredictorStats {
  total_predictions_made: number;
  confirmed_trades_suggested: number;
  avoided_trades_suggested: number;
  accuracy_rate: number;
  last_prediction: string;
  immortal_sigils_detected: number;
  strong_sigils_detected: number;
}

export class WaidesKISigilPredictor {
  private symbolTimeTrainer: WaidesKISymbolTimeTrainer;
  private predictionHistory: PredictionResult[] = [];
  private maxHistorySize = 500;
  
  private predictorStats: PredictorStats = {
    total_predictions_made: 0,
    confirmed_trades_suggested: 0,
    avoided_trades_suggested: 0,
    accuracy_rate: 0.0,
    last_prediction: new Date().toISOString(),
    immortal_sigils_detected: 0,
    strong_sigils_detected: 0
  };

  // Prediction thresholds
  private readonly PREDICTION_THRESHOLDS = {
    CONFIRMED_TRADE_MIN_CONFIDENCE: 75,
    CONFIRMED_TRADE_MIN_WIN_RATE: 0.65,
    AVOID_TRADE_MAX_WIN_RATE: 0.45,
    CAUTION_WIN_RATE_RANGE: [0.45, 0.65],
    IMMORTAL_CONFIDENCE_BOOST: 20,
    STRONG_CONFIDENCE_BOOST: 10,
    MIN_SAMPLE_SIZE: 3
  };

  constructor(symbolTimeTrainer: WaidesKISymbolTimeTrainer) {
    this.symbolTimeTrainer = symbolTimeTrainer;
    console.log('🔮 Sigil Predictor initialized - ready to forecast from historical patterns');
  }

  /**
   * Predict trade recommendation for a specific symbol
   */
  predictBySymbol(
    symbol: string, 
    currentMarketConditions?: Partial<MarketConditions>
  ): PredictionResult {
    const sigilStrength = this.symbolTimeTrainer.getSigilStrength(symbol);
    const marketConditions = this.normalizeMarketConditions(currentMarketConditions);
    
    // Analyze market alignment
    const marketAlignment = this.analyzeMarketAlignment(symbol, marketConditions);
    
    // Calculate base confidence from historical data
    let baseConfidence = sigilStrength.confidence_score;
    
    // Apply strength-based confidence boosts
    if (sigilStrength.strength === 'immortal sigil') {
      baseConfidence += this.PREDICTION_THRESHOLDS.IMMORTAL_CONFIDENCE_BOOST;
    } else if (sigilStrength.strength === 'strong') {
      baseConfidence += this.PREDICTION_THRESHOLDS.STRONG_CONFIDENCE_BOOST;
    }

    // Apply market alignment adjustments
    const alignmentAdjustment = (marketAlignment.current_conditions_score - 50) * 0.3;
    const finalConfidence = Math.max(0, Math.min(100, baseConfidence + alignmentAdjustment));

    // Determine recommendation
    const recommendation = this.determineRecommendation(
      sigilStrength,
      finalConfidence,
      marketAlignment
    );

    // Generate reasoning
    const reason = this.generateReasoning(sigilStrength, marketAlignment, recommendation);

    // Build confidence factors
    const confidenceFactors = this.buildConfidenceFactors(sigilStrength, marketAlignment);

    const prediction: PredictionResult = {
      symbol,
      recommendation,
      confidence: Math.round(finalConfidence),
      strength: sigilStrength.strength,
      reason,
      historical_context: {
        sample_size: sigilStrength.sample_size,
        win_rate: sigilStrength.win_rate,
        avg_profit: sigilStrength.avg_profit,
        spiritual_power: sigilStrength.spiritual_power
      },
      market_alignment: marketAlignment,
      prediction_metadata: {
        predicted_at: new Date().toISOString(),
        predictor_version: '1.0.0',
        confidence_factors: confidenceFactors
      }
    };

    // Store prediction and update stats
    this.storePrediction(prediction);
    this.updatePredictorStats(prediction);

    console.log(`🎯 Predicted ${symbol}: ${recommendation} (${finalConfidence}% confidence) - ${sigilStrength.strength}`);

    return prediction;
  }

  /**
   * Get predictions for multiple symbols
   */
  predictMultipleSymbols(
    symbols: string[],
    currentMarketConditions?: Partial<MarketConditions>
  ): PredictionResult[] {
    return symbols.map(symbol => 
      this.predictBySymbol(symbol, currentMarketConditions)
    ).sort((a, b) => {
      // Sort by recommendation priority, then by confidence
      const recommendationOrder = {
        'CONFIRMED_TRADE': 4,
        'PROCEED_WITH_CAUTION': 3,
        'WAIT_FOR_BETTER_SIGNAL': 2,
        'AVOID_TRADE': 1
      };
      
      const aOrder = recommendationOrder[a.recommendation];
      const bOrder = recommendationOrder[b.recommendation];
      
      if (aOrder !== bOrder) return bOrder - aOrder;
      return b.confidence - a.confidence;
    });
  }

  /**
   * Get best trading opportunities based on current conditions
   */
  getBestTradingOpportunities(
    currentMarketConditions?: Partial<MarketConditions>,
    limit: number = 5
  ): PredictionResult[] {
    const allSigils = this.symbolTimeTrainer.analyzeAllSigils();
    const symbols = allSigils
      .filter(sigil => ['immortal sigil', 'strong'].includes(sigil.strength))
      .map(sigil => sigil.symbol);

    const predictions = this.predictMultipleSymbols(symbols, currentMarketConditions);
    
    return predictions
      .filter(p => p.recommendation === 'CONFIRMED_TRADE')
      .slice(0, limit);
  }

  /**
   * Analyze symbol suitability for current market conditions
   */
  analyzeSymbolSuitability(
    symbol: string,
    currentMarketConditions: Partial<MarketConditions>
  ): {
    suitability_score: number;
    optimal_factors: string[];
    risk_factors: string[];
    recommendation: string;
  } {
    const patterns = this.symbolTimeTrainer.analyzeSymbolPatterns(symbol);
    const marketConditions = this.normalizeMarketConditions(currentMarketConditions);
    
    let suitabilityScore = 50; // Base score
    const optimalFactors: string[] = [];
    const riskFactors: string[] = [];

    // Analyze time patterns
    if (patterns.time_patterns.best_time_of_day === marketConditions.time_of_day) {
      suitabilityScore += 15;
      optimalFactors.push(`Optimal time of day (${marketConditions.time_of_day})`);
    } else if (patterns.time_patterns.worst_time_of_day === marketConditions.time_of_day) {
      suitabilityScore -= 15;
      riskFactors.push(`Poor time of day (${marketConditions.time_of_day})`);
    }

    if (patterns.time_patterns.best_day_of_week === marketConditions.day_of_week) {
      suitabilityScore += 10;
      optimalFactors.push(`Favorable day (${marketConditions.day_of_week})`);
    } else if (patterns.time_patterns.worst_day_of_week === marketConditions.day_of_week) {
      suitabilityScore -= 10;
      riskFactors.push(`Unfavorable day (${marketConditions.day_of_week})`);
    }

    // Analyze market conditions
    if (patterns.market_condition_patterns.best_volatility === marketConditions.volatility) {
      suitabilityScore += 12;
      optimalFactors.push(`Optimal volatility (${marketConditions.volatility})`);
    }

    if (patterns.market_condition_patterns.best_volume === marketConditions.volume) {
      suitabilityScore += 8;
      optimalFactors.push(`Optimal volume (${marketConditions.volume})`);
    }

    // Spiritual energy factor
    if (marketConditions.spiritual_energy >= 70) {
      suitabilityScore += 10;
      optimalFactors.push('High spiritual energy');
    } else if (marketConditions.spiritual_energy <= 30) {
      suitabilityScore -= 10;
      riskFactors.push('Low spiritual energy');
    }

    suitabilityScore = Math.max(0, Math.min(100, suitabilityScore));

    let recommendation = 'NEUTRAL';
    if (suitabilityScore >= 70) recommendation = 'HIGHLY_SUITABLE';
    else if (suitabilityScore >= 55) recommendation = 'SUITABLE';
    else if (suitabilityScore <= 35) recommendation = 'UNSUITABLE';

    return {
      suitability_score: Math.round(suitabilityScore),
      optimal_factors: optimalFactors,
      risk_factors: riskFactors,
      recommendation
    };
  }

  /**
   * Get prediction history
   */
  getPredictionHistory(limit: number = 50): PredictionResult[] {
    return this.predictionHistory
      .sort((a, b) => new Date(b.prediction_metadata.predicted_at).getTime() - 
                     new Date(a.prediction_metadata.predicted_at).getTime())
      .slice(0, limit);
  }

  /**
   * Get predictor statistics
   */
  getPredictorStats(): PredictorStats & {
    recent_accuracy: number;
    prediction_distribution: Record<string, number>;
  } {
    const recentPredictions = this.predictionHistory.slice(-20);
    const recentAccuracy = recentPredictions.length > 0 ? 
      recentPredictions.filter(p => p.confidence >= 70).length / recentPredictions.length : 0;

    const distribution: Record<string, number> = {
      'CONFIRMED_TRADE': 0,
      'AVOID_TRADE': 0,
      'PROCEED_WITH_CAUTION': 0,
      'WAIT_FOR_BETTER_SIGNAL': 0
    };

    this.predictionHistory.forEach(p => {
      distribution[p.recommendation]++;
    });

    return {
      ...this.predictorStats,
      recent_accuracy: Math.round(recentAccuracy * 100),
      prediction_distribution: distribution
    };
  }

  /**
   * Reset predictor data (admin function)
   */
  resetPredictor(): void {
    this.predictionHistory = [];
    this.predictorStats = {
      total_predictions_made: 0,
      confirmed_trades_suggested: 0,
      avoided_trades_suggested: 0,
      accuracy_rate: 0.0,
      last_prediction: new Date().toISOString(),
      immortal_sigils_detected: 0,
      strong_sigils_detected: 0
    };
    console.log('🔄 Sigil Predictor reset - all prediction data cleared');
  }

  /**
   * Normalize market conditions with defaults
   */
  private normalizeMarketConditions(conditions?: Partial<MarketConditions>): MarketConditions {
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay = 'MORNING';
    if (hour >= 12 && hour < 18) timeOfDay = 'AFTERNOON';
    else if (hour >= 18 && hour < 24) timeOfDay = 'EVENING';
    else if (hour >= 0 && hour < 6) timeOfDay = 'NIGHT';

    return {
      time_of_day: conditions?.time_of_day || timeOfDay,
      day_of_week: conditions?.day_of_week || now.toLocaleDateString('en-US', { weekday: 'long' }),
      volatility: conditions?.volatility || 'MEDIUM',
      volume: conditions?.volume || 'MEDIUM',
      trend_momentum: conditions?.trend_momentum || 50,
      spiritual_energy: conditions?.spiritual_energy || Math.floor(Math.random() * 40) + 60
    };
  }

  /**
   * Analyze market alignment for symbol
   */
  private analyzeMarketAlignment(symbol: string, conditions: MarketConditions): PredictionResult['market_alignment'] {
    const suitability = this.analyzeSymbolSuitability(symbol, conditions);
    
    const optimalTiming = suitability.optimal_factors.length > suitability.risk_factors.length;
    
    let riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' = 'MEDIUM';
    if (suitability.suitability_score >= 75) riskAssessment = 'LOW';
    else if (suitability.suitability_score >= 55) riskAssessment = 'MEDIUM';
    else if (suitability.suitability_score >= 35) riskAssessment = 'HIGH';
    else riskAssessment = 'EXTREME';

    return {
      current_conditions_score: suitability.suitability_score,
      optimal_timing: optimalTiming,
      risk_assessment: riskAssessment
    };
  }

  /**
   * Determine recommendation based on analysis
   */
  private determineRecommendation(
    sigilStrength: any,
    confidence: number,
    marketAlignment: PredictionResult['market_alignment']
  ): PredictionResult['recommendation'] {
    // Check minimum sample size
    if (sigilStrength.sample_size < this.PREDICTION_THRESHOLDS.MIN_SAMPLE_SIZE) {
      return 'WAIT_FOR_BETTER_SIGNAL';
    }

    // High-confidence immortal sigils
    if (sigilStrength.strength === 'immortal sigil' && 
        confidence >= this.PREDICTION_THRESHOLDS.CONFIRMED_TRADE_MIN_CONFIDENCE &&
        marketAlignment.risk_assessment !== 'EXTREME') {
      return 'CONFIRMED_TRADE';
    }

    // Strong sigils with good conditions
    if (sigilStrength.strength === 'strong' && 
        confidence >= this.PREDICTION_THRESHOLDS.CONFIRMED_TRADE_MIN_CONFIDENCE &&
        sigilStrength.win_rate >= this.PREDICTION_THRESHOLDS.CONFIRMED_TRADE_MIN_WIN_RATE &&
        marketAlignment.optimal_timing) {
      return 'CONFIRMED_TRADE';
    }

    // Poor historical performance
    if (sigilStrength.win_rate <= this.PREDICTION_THRESHOLDS.AVOID_TRADE_MAX_WIN_RATE ||
        sigilStrength.strength === 'weak' ||
        marketAlignment.risk_assessment === 'EXTREME') {
      return 'AVOID_TRADE';
    }

    // Moderate performance with caution
    if (sigilStrength.win_rate >= this.PREDICTION_THRESHOLDS.CAUTION_WIN_RATE_RANGE[0] &&
        sigilStrength.win_rate <= this.PREDICTION_THRESHOLDS.CAUTION_WIN_RATE_RANGE[1]) {
      return 'PROCEED_WITH_CAUTION';
    }

    return 'WAIT_FOR_BETTER_SIGNAL';
  }

  /**
   * Generate reasoning for prediction
   */
  private generateReasoning(
    sigilStrength: any,
    marketAlignment: PredictionResult['market_alignment'],
    recommendation: PredictionResult['recommendation']
  ): string {
    const reasons: string[] = [];

    // Historical performance
    reasons.push(`${sigilStrength.strength.toUpperCase()} with ${(sigilStrength.win_rate * 100).toFixed(1)}% win rate over ${sigilStrength.sample_size} trades`);

    // Market alignment
    if (marketAlignment.optimal_timing) {
      reasons.push('Optimal market timing detected');
    } else {
      reasons.push('Suboptimal market conditions');
    }

    // Risk assessment
    reasons.push(`${marketAlignment.risk_assessment} risk environment`);

    // Recommendation-specific reasoning
    switch (recommendation) {
      case 'CONFIRMED_TRADE':
        reasons.push('Historical pattern strongly supports trade execution');
        break;
      case 'AVOID_TRADE':
        reasons.push('Historical data indicates high probability of loss');
        break;
      case 'PROCEED_WITH_CAUTION':
        reasons.push('Mixed signals require careful position sizing');
        break;
      case 'WAIT_FOR_BETTER_SIGNAL':
        reasons.push('Insufficient data or unfavorable conditions suggest waiting');
        break;
    }

    return reasons.join('. ');
  }

  /**
   * Build confidence factors list
   */
  private buildConfidenceFactors(
    sigilStrength: any,
    marketAlignment: PredictionResult['market_alignment']
  ): string[] {
    const factors: string[] = [];

    factors.push(`${sigilStrength.sample_size} historical trades`);
    factors.push(`${(sigilStrength.win_rate * 100).toFixed(1)}% historical win rate`);
    factors.push(`${sigilStrength.strength} strength classification`);
    factors.push(`${marketAlignment.current_conditions_score}% market alignment`);
    factors.push(`${marketAlignment.risk_assessment} risk assessment`);

    if (marketAlignment.optimal_timing) {
      factors.push('Optimal timing detected');
    }

    return factors;
  }

  /**
   * Store prediction in history
   */
  private storePrediction(prediction: PredictionResult): void {
    this.predictionHistory.push(prediction);
    
    // Maintain history size limit
    if (this.predictionHistory.length > this.maxHistorySize) {
      this.predictionHistory.shift();
    }
  }

  /**
   * Update predictor statistics
   */
  private updatePredictorStats(prediction: PredictionResult): void {
    this.predictorStats.total_predictions_made++;
    this.predictorStats.last_prediction = prediction.prediction_metadata.predicted_at;

    if (prediction.recommendation === 'CONFIRMED_TRADE') {
      this.predictorStats.confirmed_trades_suggested++;
    } else if (prediction.recommendation === 'AVOID_TRADE') {
      this.predictorStats.avoided_trades_suggested++;
    }

    if (prediction.strength === 'immortal sigil') {
      this.predictorStats.immortal_sigils_detected++;
    } else if (prediction.strength === 'strong') {
      this.predictorStats.strong_sigils_detected++;
    }

    // Calculate accuracy rate (simplified - based on high confidence predictions)
    const highConfidencePredictions = this.predictionHistory.filter(p => p.confidence >= 70);
    this.predictorStats.accuracy_rate = highConfidencePredictions.length / this.predictionHistory.length;
  }
}