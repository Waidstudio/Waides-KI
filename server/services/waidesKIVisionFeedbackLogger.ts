/**
 * STEP 35: Vision Feedback Logger + Accuracy Evolution Module
 * 
 * Waides KI Vision Feedback Logger that tracks every vision prediction against actual market outcomes,
 * learns from successes and failures, and evolves the spiritual accuracy over time through intelligent
 * pattern recognition and adaptive learning algorithms.
 */

export interface VisionPrediction {
  vision_id: string;
  vision: 'rise' | 'fall' | 'choppy';
  timestamp: Date;
  confidence: number;
  energy_level: number;
  market_context: {
    rsi: number;
    ema_50: number;
    ema_200: number;
    current_price: number;
    volume?: number;
    volatility?: number;
  };
  validation_strength: number;
  prediction_timeframe: '15m' | '1h' | '4h' | '1d';
}

export interface VisionOutcome {
  vision_id: string;
  actual_direction: 'rise' | 'fall' | 'choppy';
  price_change_percent: number;
  outcome_timestamp: Date;
  accuracy_score: number; // 0-1 scale
  learning_weight: number; // How much this outcome affects learning
  market_conditions: {
    volatility_during: number;
    volume_during: number;
    external_events?: string[];
  };
}

export interface AccuracyMetrics {
  overall_accuracy: number;
  accuracy_by_vision: {
    rise: number;
    fall: number;
    choppy: number;
  };
  accuracy_by_timeframe: {
    '15m': number;
    '1h': number;
    '4h': number;
    '1d': number;
  };
  confidence_correlation: number; // How well confidence predicts accuracy
  recent_trend: 'improving' | 'declining' | 'stable';
  total_predictions: number;
  learning_progression: number; // 0-1 scale of learning maturity
}

export interface LearningPattern {
  pattern_id: string;
  pattern_type: 'market_condition' | 'rsi_range' | 'price_pattern' | 'volume_spike' | 'volatility_regime';
  description: string;
  success_rate: number;
  sample_size: number;
  confidence_modifier: number; // How this pattern affects future confidence
  discovery_date: Date;
  last_updated: Date;
  pattern_data: any; // Flexible pattern-specific data
}

export class WaidesKIVisionFeedbackLogger {
  private predictions: Map<string, VisionPrediction> = new Map();
  private outcomes: Map<string, VisionOutcome> = new Map();
  private learningPatterns: Map<string, LearningPattern> = new Map();
  private accuracyHistory: Array<{ date: Date; accuracy: number }> = [];
  private maxHistorySize: number = 1000;
  private learningRate: number = 0.1;
  private currentAccuracy: number = 0.65; // Starting spiritual accuracy
  private confidenceEvolutionFactor: number = 0.05;

  constructor() {
    this.initializeLearningPatterns();
    this.startAccuracyTracking();
  }

  /**
   * Log a new vision prediction for future outcome tracking
   */
  logVisionPrediction(
    visionId: string,
    vision: 'rise' | 'fall' | 'choppy',
    confidence: number,
    energyLevel: number,
    marketContext: any,
    validationStrength: number,
    timeframe: '15m' | '1h' | '4h' | '1d' = '1h'
  ): void {
    const prediction: VisionPrediction = {
      vision_id: visionId,
      vision,
      timestamp: new Date(),
      confidence,
      energy_level: energyLevel,
      market_context: marketContext,
      validation_strength: validationStrength,
      prediction_timeframe: timeframe
    };

    this.predictions.set(visionId, prediction);
    this.trimHistoryIfNeeded();
  }

  /**
   * Record the actual market outcome for a vision prediction
   */
  recordVisionOutcome(
    visionId: string,
    actualDirection: 'rise' | 'fall' | 'choppy',
    priceChangePercent: number,
    marketConditions?: any
  ): boolean {
    const prediction = this.predictions.get(visionId);
    if (!prediction) {
      return false;
    }

    const accuracyScore = this.calculateAccuracyScore(
      prediction.vision,
      actualDirection,
      priceChangePercent,
      prediction.confidence
    );

    const learningWeight = this.calculateLearningWeight(
      accuracyScore,
      prediction.confidence,
      prediction.validation_strength
    );

    const outcome: VisionOutcome = {
      vision_id: visionId,
      actual_direction: actualDirection,
      price_change_percent: priceChangePercent,
      outcome_timestamp: new Date(),
      accuracy_score: accuracyScore,
      learning_weight: learningWeight,
      market_conditions: marketConditions || {
        volatility_during: 0.5,
        volume_during: 1.0
      }
    };

    this.outcomes.set(visionId, outcome);
    
    // Trigger learning from this outcome
    this.learnFromOutcome(prediction, outcome);
    this.updateAccuracyMetrics();
    
    return true;
  }

  /**
   * Calculate how accurate a vision was compared to reality
   */
  private calculateAccuracyScore(
    predictedVision: string,
    actualDirection: string,
    priceChangePercent: number,
    confidence: number
  ): number {
    // Perfect match gets full score
    if (predictedVision === actualDirection) {
      return Math.min(1.0, 0.8 + (confidence * 0.2));
    }

    // Partial credit for related predictions
    if ((predictedVision === 'rise' && priceChangePercent > 0.5) ||
        (predictedVision === 'fall' && priceChangePercent < -0.5)) {
      return 0.6;
    }

    if (predictedVision === 'choppy' && Math.abs(priceChangePercent) < 1.0) {
      return 0.7;
    }

    // Wrong direction gets low score
    return 0.1;
  }

  /**
   * Calculate how much weight this outcome should have in learning
   */
  private calculateLearningWeight(
    accuracyScore: number,
    confidence: number,
    validationStrength: number
  ): number {
    // High confidence wrong predictions get more learning weight
    if (accuracyScore < 0.5 && confidence > 0.8) {
      return 1.5;
    }

    // Strong validation gets higher weight
    const baseWeight = 0.5 + (validationStrength * 0.5);
    
    // Extreme outcomes (very right or very wrong) get more weight
    const extremeBonus = Math.abs(accuracyScore - 0.5) * 0.5;
    
    return Math.min(2.0, baseWeight + extremeBonus);
  }

  /**
   * Learn from a prediction outcome to improve future accuracy
   */
  private learnFromOutcome(prediction: VisionPrediction, outcome: VisionOutcome): void {
    // Update overall accuracy with exponential moving average
    this.currentAccuracy = (this.currentAccuracy * (1 - this.learningRate)) + 
                          (outcome.accuracy_score * this.learningRate * outcome.learning_weight);

    // Discover new patterns from this outcome
    this.discoverPatternsFromOutcome(prediction, outcome);

    // Update existing patterns
    this.updatePatternSuccessRates(prediction, outcome);

    // Record accuracy progression
    this.accuracyHistory.push({
      date: new Date(),
      accuracy: this.currentAccuracy
    });

    if (this.accuracyHistory.length > 100) {
      this.accuracyHistory.shift();
    }
  }

  /**
   * Discover new learning patterns from prediction outcomes
   */
  private discoverPatternsFromOutcome(prediction: VisionPrediction, outcome: VisionOutcome): void {
    const { market_context } = prediction;

    // RSI range patterns
    if (outcome.accuracy_score > 0.8) {
      const rsiRange = this.getRSIRange(market_context.rsi);
      const patternId = `rsi_${rsiRange}_${prediction.vision}`;
      
      if (!this.learningPatterns.has(patternId)) {
        this.learningPatterns.set(patternId, {
          pattern_id: patternId,
          pattern_type: 'rsi_range',
          description: `${prediction.vision.toUpperCase()} visions when RSI is ${rsiRange}`,
          success_rate: outcome.accuracy_score,
          sample_size: 1,
          confidence_modifier: outcome.accuracy_score > 0.8 ? 0.1 : -0.05,
          discovery_date: new Date(),
          last_updated: new Date(),
          pattern_data: { rsi_range: rsiRange, vision_type: prediction.vision }
        });
      }
    }

    // EMA alignment patterns
    const emaAlignment = market_context.ema_50 > market_context.ema_200 ? 'bullish' : 'bearish';
    const emaPatternId = `ema_${emaAlignment}_${prediction.vision}`;
    
    if (!this.learningPatterns.has(emaPatternId) && outcome.accuracy_score > 0.7) {
      this.learningPatterns.set(emaPatternId, {
        pattern_id: emaPatternId,
        pattern_type: 'market_condition',
        description: `${prediction.vision.toUpperCase()} visions in ${emaAlignment} EMA alignment`,
        success_rate: outcome.accuracy_score,
        sample_size: 1,
        confidence_modifier: 0.08,
        discovery_date: new Date(),
        last_updated: new Date(),
        pattern_data: { ema_alignment: emaAlignment, vision_type: prediction.vision }
      });
    }

    // Validation strength patterns
    if (prediction.validation_strength > 0.8 && outcome.accuracy_score > 0.8) {
      const strongValidationId = `strong_validation_${prediction.vision}`;
      if (!this.learningPatterns.has(strongValidationId)) {
        this.learningPatterns.set(strongValidationId, {
          pattern_id: strongValidationId,
          pattern_type: 'market_condition',
          description: `High validation strength for ${prediction.vision.toUpperCase()} visions`,
          success_rate: outcome.accuracy_score,
          sample_size: 1,
          confidence_modifier: 0.15,
          discovery_date: new Date(),
          last_updated: new Date(),
          pattern_data: { min_validation: 0.8, vision_type: prediction.vision }
        });
      }
    }
  }

  /**
   * Update existing pattern success rates with new data
   */
  private updatePatternSuccessRates(prediction: VisionPrediction, outcome: VisionOutcome): void {
    for (const [patternId, pattern] of this.learningPatterns) {
      if (this.patternMatchesPrediction(pattern, prediction)) {
        // Update success rate with exponential moving average
        const alpha = Math.min(0.3, 1.0 / pattern.sample_size);
        pattern.success_rate = (pattern.success_rate * (1 - alpha)) + (outcome.accuracy_score * alpha);
        pattern.sample_size += 1;
        pattern.last_updated = new Date();

        // Update confidence modifier based on success rate
        if (pattern.success_rate > 0.8) {
          pattern.confidence_modifier = Math.min(0.2, pattern.success_rate - 0.5);
        } else if (pattern.success_rate < 0.4) {
          pattern.confidence_modifier = Math.max(-0.15, pattern.success_rate - 0.5);
        }
      }
    }
  }

  /**
   * Check if a pattern matches a prediction context
   */
  private patternMatchesPrediction(pattern: LearningPattern, prediction: VisionPrediction): boolean {
    const { market_context } = prediction;
    const { pattern_data } = pattern;

    switch (pattern.pattern_type) {
      case 'rsi_range':
        return pattern_data.rsi_range === this.getRSIRange(market_context.rsi) &&
               pattern_data.vision_type === prediction.vision;

      case 'market_condition':
        if (pattern_data.ema_alignment) {
          const currentAlignment = market_context.ema_50 > market_context.ema_200 ? 'bullish' : 'bearish';
          return pattern_data.ema_alignment === currentAlignment &&
                 pattern_data.vision_type === prediction.vision;
        }
        if (pattern_data.min_validation) {
          return prediction.validation_strength >= pattern_data.min_validation &&
                 pattern_data.vision_type === prediction.vision;
        }
        break;

      default:
        return false;
    }

    return false;
  }

  /**
   * Get confidence modifier based on learned patterns for a new prediction
   */
  getConfidenceModifier(
    vision: 'rise' | 'fall' | 'choppy',
    marketContext: any,
    validationStrength: number
  ): number {
    let totalModifier = 0;
    let patternCount = 0;

    // Create a temporary prediction to test pattern matching
    const tempPrediction: VisionPrediction = {
      vision_id: 'temp',
      vision,
      timestamp: new Date(),
      confidence: 0.5,
      energy_level: 0.5,
      market_context: marketContext,
      validation_strength: validationStrength,
      prediction_timeframe: '1h'
    };

    for (const pattern of this.learningPatterns.values()) {
      if (this.patternMatchesPrediction(pattern, tempPrediction) && pattern.sample_size >= 3) {
        // Weight the modifier by pattern reliability
        const reliability = Math.min(1.0, pattern.sample_size / 10);
        totalModifier += pattern.confidence_modifier * reliability;
        patternCount++;
      }
    }

    return patternCount > 0 ? totalModifier / patternCount : 0;
  }

  /**
   * Get current accuracy metrics and learning statistics
   */
  getAccuracyMetrics(): AccuracyMetrics {
    const totalPredictions = this.outcomes.size;
    
    if (totalPredictions === 0) {
      return {
        overall_accuracy: this.currentAccuracy,
        accuracy_by_vision: { rise: 0, fall: 0, choppy: 0 },
        accuracy_by_timeframe: { '15m': 0, '1h': 0, '4h': 0, '1d': 0 },
        confidence_correlation: 0,
        recent_trend: 'stable',
        total_predictions: 0,
        learning_progression: 0
      };
    }

    const visionAccuracy = { rise: 0, fall: 0, choppy: 0 };
    const visionCounts = { rise: 0, fall: 0, choppy: 0 };
    const timeframeAccuracy = { '15m': 0, '1h': 0, '4h': 0, '1d': 0 };
    const timeframeCounts = { '15m': 0, '1h': 0, '4h': 0, '1d': 0 };

    let totalAccuracy = 0;
    let confidenceSum = 0;
    let confidenceAccuracySum = 0;

    for (const [visionId, outcome] of this.outcomes) {
      const prediction = this.predictions.get(visionId);
      if (!prediction) continue;

      totalAccuracy += outcome.accuracy_score;
      
      // Vision type accuracy
      visionAccuracy[prediction.vision] += outcome.accuracy_score;
      visionCounts[prediction.vision]++;

      // Timeframe accuracy
      timeframeAccuracy[prediction.prediction_timeframe] += outcome.accuracy_score;
      timeframeCounts[prediction.prediction_timeframe]++;

      // Confidence correlation
      confidenceSum += prediction.confidence;
      confidenceAccuracySum += prediction.confidence * outcome.accuracy_score;
    }

    // Calculate averages
    for (const vision of ['rise', 'fall', 'choppy'] as const) {
      if (visionCounts[vision] > 0) {
        visionAccuracy[vision] /= visionCounts[vision];
      }
    }

    for (const timeframe of ['15m', '1h', '4h', '1d'] as const) {
      if (timeframeCounts[timeframe] > 0) {
        timeframeAccuracy[timeframe] /= timeframeCounts[timeframe];
      }
    }

    const overallAccuracy = totalAccuracy / totalPredictions;
    const confidenceCorrelation = confidenceSum > 0 ? 
      (confidenceAccuracySum / confidenceSum - 0.5) * 2 : 0;

    // Determine recent trend
    let recentTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (this.accuracyHistory.length >= 10) {
      const recent = this.accuracyHistory.slice(-5).reduce((sum, h) => sum + h.accuracy, 0) / 5;
      const earlier = this.accuracyHistory.slice(-10, -5).reduce((sum, h) => sum + h.accuracy, 0) / 5;
      
      if (recent > earlier + 0.05) recentTrend = 'improving';
      else if (recent < earlier - 0.05) recentTrend = 'declining';
    }

    // Learning progression based on pattern discovery and accuracy improvement
    const learningProgression = Math.min(1.0, 
      (this.learningPatterns.size / 20) * 0.5 + 
      Math.max(0, (overallAccuracy - 0.5)) * 1.0
    );

    return {
      overall_accuracy: overallAccuracy,
      accuracy_by_vision: visionAccuracy,
      accuracy_by_timeframe: timeframeAccuracy,
      confidence_correlation: confidenceCorrelation,
      recent_trend: recentTrend,
      total_predictions: totalPredictions,
      learning_progression: learningProgression
    };
  }

  /**
   * Get all learned patterns with their statistics
   */
  getLearningPatterns(): LearningPattern[] {
    return Array.from(this.learningPatterns.values())
      .sort((a, b) => b.success_rate - a.success_rate);
  }

  /**
   * Get prediction and outcome history for analysis
   */
  getPredictionHistory(limit: number = 50): Array<{
    prediction: VisionPrediction;
    outcome?: VisionOutcome;
  }> {
    const history: Array<{ prediction: VisionPrediction; outcome?: VisionOutcome }> = [];

    for (const [visionId, prediction] of this.predictions) {
      const outcome = this.outcomes.get(visionId);
      history.push({ prediction, outcome });
    }

    return history
      .sort((a, b) => b.prediction.timestamp.getTime() - a.prediction.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get evolved spiritual accuracy based on learning
   */
  getEvolvedAccuracy(): number {
    return this.currentAccuracy;
  }

  /**
   * Force retrain accuracy from all historical data
   */
  retrainAccuracy(): void {
    if (this.outcomes.size === 0) return;

    let totalAccuracy = 0;
    let totalWeight = 0;

    for (const outcome of this.outcomes.values()) {
      totalAccuracy += outcome.accuracy_score * outcome.learning_weight;
      totalWeight += outcome.learning_weight;
    }

    if (totalWeight > 0) {
      this.currentAccuracy = totalAccuracy / totalWeight;
    }
  }

  /**
   * Clear all learning data for reset
   */
  clearLearningData(): void {
    this.predictions.clear();
    this.outcomes.clear();
    this.learningPatterns.clear();
    this.accuracyHistory = [];
    this.currentAccuracy = 0.65;
    this.initializeLearningPatterns();
  }

  /**
   * Get RSI range category for pattern recognition
   */
  private getRSIRange(rsi: number): string {
    if (rsi < 20) return 'oversold';
    if (rsi < 30) return 'weak';
    if (rsi < 50) return 'bearish';
    if (rsi < 70) return 'bullish';
    if (rsi < 80) return 'strong';
    return 'overbought';
  }

  /**
   * Initialize basic learning patterns
   */
  private initializeLearningPatterns(): void {
    // Add some foundational patterns that will be refined with real data
    this.learningPatterns.set('high_confidence_boost', {
      pattern_id: 'high_confidence_boost',
      pattern_type: 'market_condition',
      description: 'High confidence visions tend to be more accurate',
      success_rate: 0.75,
      sample_size: 5,
      confidence_modifier: 0.1,
      discovery_date: new Date(),
      last_updated: new Date(),
      pattern_data: { min_confidence: 0.8 }
    });
  }

  /**
   * Start accuracy tracking timer
   */
  private startAccuracyTracking(): void {
    // Record accuracy snapshot every hour
    setInterval(() => {
      if (this.outcomes.size > 0) {
        this.accuracyHistory.push({
          date: new Date(),
          accuracy: this.currentAccuracy
        });

        if (this.accuracyHistory.length > 100) {
          this.accuracyHistory.shift();
        }
      }
    }, 3600000); // 1 hour
  }

  /**
   * Trim history to prevent memory issues
   */
  private trimHistoryIfNeeded(): void {
    if (this.predictions.size > this.maxHistorySize) {
      const entries = Array.from(this.predictions.entries())
        .sort(([,a], [,b]) => a.timestamp.getTime() - b.timestamp.getTime());
      
      const toRemove = entries.slice(0, this.predictions.size - this.maxHistorySize + 100);
      
      for (const [visionId] of toRemove) {
        this.predictions.delete(visionId);
        this.outcomes.delete(visionId);
      }
    }
  }

  /**
   * Update accuracy metrics calculation
   */
  private updateAccuracyMetrics(): void {
    // This method can be expanded to perform additional calculations
    // Currently, accuracy is updated in learnFromOutcome
  }
}

// Export singleton instance
export const waidesKIVisionFeedbackLogger = new WaidesKIVisionFeedbackLogger();