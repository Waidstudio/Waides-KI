/**
 * STEP 45: Waides KI Vision Memory Map
 * Stores and recalls repeating patterns from ETH history for pre-cognition
 */

import crypto from 'crypto';

interface PatternMemory {
  key: string;
  pattern: number[];
  timestamp: Date;
  outcome: 'UP' | 'DOWN' | 'NEUTRAL';
  confidence: number;
  timeframe: '5m' | '15m' | '1h' | '4h' | '1d';
  market_context: {
    volume_profile: 'HIGH' | 'NORMAL' | 'LOW';
    volatility: number;
    trend_strength: number;
  };
}

interface EchoMatch {
  pattern: PatternMemory;
  similarity: number;
  prediction_strength: number;
}

interface VisionStats {
  total_patterns: number;
  successful_predictions: number;
  accuracy_rate: number;
  strongest_echo_types: string[];
  memory_utilization: number;
}

export class WaidesKIVisionMemoryMap {
  private memory: PatternMemory[] = [];
  private readonly maxMemorySize = 5000;
  private readonly similarityThreshold = 0.03; // 3% difference threshold
  private readonly minPatternLength = 5;
  private readonly maxPatternLength = 20;

  /**
   * Store a new pattern in vision memory
   */
  storePattern(
    pattern: number[], 
    outcome: 'UP' | 'DOWN' | 'NEUTRAL',
    timeframe: '5m' | '15m' | '1h' | '4h' | '1d',
    marketContext: PatternMemory['market_context']
  ): string {
    // Normalize pattern to relative changes
    const normalizedPattern = this.normalizePattern(pattern);
    
    // Generate unique key for pattern
    const key = crypto.createHash('sha256')
      .update(JSON.stringify({ pattern: normalizedPattern, timeframe }))
      .digest('hex');

    // Calculate confidence based on pattern clarity
    const confidence = this.calculatePatternConfidence(normalizedPattern, marketContext);

    const patternMemory: PatternMemory = {
      key,
      pattern: normalizedPattern,
      timestamp: new Date(),
      outcome,
      confidence,
      timeframe,
      market_context: marketContext
    };

    // Add to memory
    this.memory.push(patternMemory);

    // Maintain memory size limit
    if (this.memory.length > this.maxMemorySize) {
      // Remove oldest patterns with lowest confidence
      this.memory.sort((a, b) => b.confidence - a.confidence || b.timestamp.getTime() - a.timestamp.getTime());
      this.memory = this.memory.slice(0, this.maxMemorySize);
    }

    return key;
  }

  /**
   * Find similar patterns for prediction
   */
  findSimilarPatterns(currentPattern: number[], timeframe: '5m' | '15m' | '1h' | '4h' | '1d'): EchoMatch[] {
    const normalizedCurrent = this.normalizePattern(currentPattern);
    const matches: EchoMatch[] = [];

    for (const memory of this.memory) {
      // Only match same timeframe patterns
      if (memory.timeframe !== timeframe) continue;

      const similarity = this.calculateSimilarity(normalizedCurrent, memory.pattern);
      
      if (similarity >= (1 - this.similarityThreshold)) {
        const predictionStrength = this.calculatePredictionStrength(memory, similarity);
        
        matches.push({
          pattern: memory,
          similarity,
          prediction_strength: predictionStrength
        });
      }
    }

    // Sort by prediction strength
    return matches.sort((a, b) => b.prediction_strength - a.prediction_strength);
  }

  /**
   * Get echo analysis for multiple timeframes
   */
  getMultiTimeframeEchoes(patterns: { [key: string]: number[] }): { [key: string]: EchoMatch[] } {
    const results: { [key: string]: EchoMatch[] } = {};

    for (const [timeframe, pattern] of Object.entries(patterns)) {
      results[timeframe] = this.findSimilarPatterns(
        pattern, 
        timeframe as '5m' | '15m' | '1h' | '4h' | '1d'
      );
    }

    return results;
  }

  /**
   * Generate vision consensus from echo matches
   */
  generateVisionConsensus(echoMatches: { [key: string]: EchoMatch[] }): {
    prediction: 'UP' | 'DOWN' | 'NEUTRAL';
    confidence: number;
    strength_by_timeframe: { [key: string]: number };
    supporting_echoes: number;
    vision_clarity: 'CRYSTAL_CLEAR' | 'CLEAR' | 'MODERATE' | 'UNCLEAR' | 'CHAOTIC';
  } {
    const visionScore = { UP: 0, DOWN: 0, NEUTRAL: 0 };
    const strengthByTimeframe: { [key: string]: number } = {};
    let totalEchoes = 0;

    // Weight different timeframes
    const timeframeWeights = {
      '5m': 1.0,
      '15m': 1.5,
      '1h': 2.0,
      '4h': 2.5,
      '1d': 3.0
    };

    for (const [timeframe, matches] of Object.entries(echoMatches)) {
      let timeframeStrength = 0;
      const weight = timeframeWeights[timeframe as keyof typeof timeframeWeights] || 1.0;

      for (const match of matches) {
        const weightedStrength = match.prediction_strength * weight;
        visionScore[match.pattern.outcome] += weightedStrength;
        timeframeStrength += weightedStrength;
        totalEchoes++;
      }

      strengthByTimeframe[timeframe] = timeframeStrength;
    }

    // Determine strongest prediction
    const totalVisionPower = visionScore.UP + visionScore.DOWN + visionScore.NEUTRAL;
    let prediction: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
    let confidence = 0;

    if (totalVisionPower > 0) {
      const strongest = Object.entries(visionScore).reduce((a, b) => 
        visionScore[a[0] as keyof typeof visionScore] > visionScore[b[0] as keyof typeof visionScore] ? a : b
      );
      
      prediction = strongest[0] as 'UP' | 'DOWN' | 'NEUTRAL';
      confidence = strongest[1] / totalVisionPower;
    }

    // Determine vision clarity
    const visionClarity = this.determineVisionClarity(confidence, totalEchoes);

    return {
      prediction,
      confidence,
      strength_by_timeframe: strengthByTimeframe,
      supporting_echoes: totalEchoes,
      vision_clarity: visionClarity
    };
  }

  /**
   * Record prediction outcome for learning
   */
  recordPredictionOutcome(patternKey: string, actualOutcome: 'UP' | 'DOWN' | 'NEUTRAL'): void {
    const pattern = this.memory.find(p => p.key === patternKey);
    if (pattern) {
      // Update pattern confidence based on accuracy
      if (pattern.outcome === actualOutcome) {
        pattern.confidence = Math.min(1.0, pattern.confidence + 0.1);
      } else {
        pattern.confidence = Math.max(0.1, pattern.confidence - 0.05);
      }
    }
  }

  /**
   * Get vision memory statistics
   */
  getVisionStats(): VisionStats {
    const totalPatterns = this.memory.length;
    const successfulPredictions = this.memory.filter(p => p.confidence > 0.7).length;
    const accuracyRate = totalPatterns > 0 ? successfulPredictions / totalPatterns : 0;

    // Analyze strongest echo types
    const echoTypes = this.memory.reduce((acc, pattern) => {
      const type = `${pattern.timeframe}_${pattern.outcome}`;
      acc[type] = (acc[type] || 0) + pattern.confidence;
      return acc;
    }, {} as { [key: string]: number });

    const strongestEchoTypes = Object.entries(echoTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type);

    return {
      total_patterns: totalPatterns,
      successful_predictions: successfulPredictions,
      accuracy_rate: accuracyRate,
      strongest_echo_types: strongestEchoTypes,
      memory_utilization: totalPatterns / this.maxMemorySize
    };
  }

  /**
   * Clear low-confidence memories (cleanup)
   */
  clearWeakMemories(confidenceThreshold: number = 0.3): number {
    const beforeCount = this.memory.length;
    this.memory = this.memory.filter(p => p.confidence > confidenceThreshold);
    return beforeCount - this.memory.length;
  }

  /**
   * Get strongest pattern matches for analysis
   */
  getStrongestPatterns(limit: number = 10): PatternMemory[] {
    return [...this.memory]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  /**
   * Normalize pattern to relative changes
   */
  private normalizePattern(pattern: number[]): number[] {
    if (pattern.length < 2) return pattern;

    const normalized: number[] = [];
    for (let i = 1; i < pattern.length; i++) {
      const change = (pattern[i] - pattern[i-1]) / pattern[i-1];
      normalized.push(Math.round(change * 10000) / 10000); // 4 decimal precision
    }

    return normalized;
  }

  /**
   * Calculate similarity between two patterns
   */
  private calculateSimilarity(pattern1: number[], pattern2: number[]): number {
    if (pattern1.length !== pattern2.length) return 0;

    const differences = pattern1.map((val, idx) => Math.abs(val - pattern2[idx]));
    const avgDifference = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
    
    return Math.max(0, 1 - avgDifference);
  }

  /**
   * Calculate pattern confidence based on clarity and context
   */
  private calculatePatternConfidence(pattern: number[], context: PatternMemory['market_context']): number {
    let confidence = 0.5; // Base confidence

    // Pattern clarity bonus
    const patternVariance = this.calculateVariance(pattern);
    if (patternVariance > 0.001) confidence += 0.2; // Clear directional pattern

    // Volume confirmation
    if (context.volume_profile === 'HIGH') confidence += 0.15;
    if (context.volume_profile === 'LOW') confidence -= 0.1;

    // Volatility context
    if (context.volatility > 0.05) confidence += 0.1; // High volatility = clearer signals
    if (context.volatility < 0.02) confidence -= 0.05; // Low volatility = less reliable

    // Trend strength
    confidence += context.trend_strength * 0.2;

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Calculate prediction strength from match
   */
  private calculatePredictionStrength(memory: PatternMemory, similarity: number): number {
    const recencyFactor = this.calculateRecencyFactor(memory.timestamp);
    const confidenceFactor = memory.confidence;
    const similarityFactor = similarity;

    return (confidenceFactor * 0.4) + (similarityFactor * 0.4) + (recencyFactor * 0.2);
  }

  /**
   * Calculate recency factor (newer patterns weighted higher)
   */
  private calculateRecencyFactor(timestamp: Date): number {
    const hoursAgo = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
    return Math.max(0.1, Math.min(1.0, 1 - (hoursAgo / (24 * 30)))); // Decay over 30 days
  }

  /**
   * Calculate variance of a pattern
   */
  private calculateVariance(pattern: number[]): number {
    if (pattern.length === 0) return 0;
    
    const mean = pattern.reduce((sum, val) => sum + val, 0) / pattern.length;
    const variance = pattern.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pattern.length;
    
    return variance;
  }

  /**
   * Determine vision clarity level
   */
  private determineVisionClarity(confidence: number, echoCount: number): 'CRYSTAL_CLEAR' | 'CLEAR' | 'MODERATE' | 'UNCLEAR' | 'CHAOTIC' {
    if (confidence > 0.9 && echoCount >= 10) return 'CRYSTAL_CLEAR';
    if (confidence > 0.75 && echoCount >= 5) return 'CLEAR';
    if (confidence > 0.6 && echoCount >= 3) return 'MODERATE';
    if (confidence > 0.4) return 'UNCLEAR';
    return 'CHAOTIC';
  }
}