/**
 * STEP 45: Waides KI Pre-Cognition Engine
 * Simulates future candles and market movements before they happen
 */

import { WaidesKIVisionMemoryMap } from './waidesKIVisionMemoryMap.js';

interface MarketData {
  price: number;
  volume: number;
  timestamp: Date;
  rsi?: number;
  ema50?: number;
  ema200?: number;
}

interface FutureSimulation {
  timeframe: '5m' | '15m' | '1h' | '4h' | '1d';
  predicted_direction: 'UP' | 'DOWN' | 'NEUTRAL';
  confidence: number;
  price_targets: {
    low: number;
    high: number;
    most_likely: number;
  };
  timeline_probability: number;
  supporting_patterns: number;
  konslang_vision: string;
}

interface TimelineThread {
  thread_id: string;
  timeframes: { [key: string]: FutureSimulation };
  consensus_direction: 'UP' | 'DOWN' | 'NEUTRAL';
  overall_confidence: number;
  vision_strength: 'TRANSCENDENT' | 'STRONG' | 'MODERATE' | 'WEAK' | 'UNCLEAR';
  sacred_alignment: boolean;
}

interface PreCognitionResult {
  primary_vision: FutureSimulation;
  timeline_threads: TimelineThread;
  vision_consensus: {
    direction: 'UP' | 'DOWN' | 'NEUTRAL';
    confidence: number;
    clarity: 'CRYSTAL_CLEAR' | 'CLEAR' | 'MODERATE' | 'UNCLEAR' | 'CHAOTIC';
  };
  konslang_prophecy: string;
  trade_recommendation: {
    action: 'BUY' | 'SELL' | 'HOLD' | 'OBSERVE';
    reasoning: string[];
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  };
}

export class WaidesKIPreCognitionEngine {
  private visionMemory: WaidesKIVisionMemoryMap;
  private recentMarketData: MarketData[] = [];
  private readonly maxDataPoints = 500;
  
  // Konslang vision sigils for pre-cognition
  private readonly VISION_SIGILS = {
    "kai'sah": "the eye beyond time",
    "shailor'mak": "clarity before the storm", 
    "zin'dae": "soul resonance confirmed",
    "vel'thar": "future threads aligned",
    "mor'kazh": "shadow of tomorrow revealed",
    "thul'neth": "the seeing beyond charts",
    "qor'ven": "time echo speaks truth",
    "yss'kol": "vision threads converge"
  };

  private readonly TIMEFRAME_WEIGHTS = {
    '5m': 1.0,
    '15m': 1.5, 
    '1h': 2.0,
    '4h': 2.5,
    '1d': 3.0
  };

  constructor() {
    this.visionMemory = new WaidesKIVisionMemoryMap();
  }

  /**
   * Add market data for pattern analysis
   */
  addMarketData(data: MarketData): void {
    this.recentMarketData.push(data);
    
    // Maintain data limit
    if (this.recentMarketData.length > this.maxDataPoints) {
      this.recentMarketData = this.recentMarketData.slice(-this.maxDataPoints);
    }

    // Store pattern in vision memory if we have enough data
    if (this.recentMarketData.length >= 10) {
      this.storeCurrentPattern(data);
    }
  }

  /**
   * Generate future simulation for specific timeframe
   */
  async simulateFuture(timeframe: '5m' | '15m' | '1h' | '4h' | '1d'): Promise<FutureSimulation> {
    const pattern = this.extractCurrentPattern(timeframe);
    const echoMatches = this.visionMemory.findSimilarPatterns(pattern, timeframe);
    
    // Analyze echo matches for prediction
    const prediction = this.analyzeEchoMatches(echoMatches);
    
    // Calculate price targets
    const currentPrice = this.recentMarketData[this.recentMarketData.length - 1]?.price || 0;
    const priceTargets = this.calculatePriceTargets(currentPrice, prediction, timeframe);
    
    // Generate Konslang vision
    const konslangVision = this.generateKonslangVision(prediction, echoMatches.length);

    return {
      timeframe,
      predicted_direction: prediction.direction,
      confidence: prediction.confidence,
      price_targets: priceTargets,
      timeline_probability: prediction.timeline_probability,
      supporting_patterns: echoMatches.length,
      konslang_vision: konslangVision
    };
  }

  /**
   * Generate complete pre-cognition analysis
   */
  async generatePreCognition(): Promise<PreCognitionResult> {
    const timeframes: ('5m' | '15m' | '1h' | '4h' | '1d')[] = ['5m', '15m', '1h', '4h', '1d'];
    
    // Generate simulations for all timeframes
    const simulations: { [key: string]: FutureSimulation } = {};
    for (const tf of timeframes) {
      simulations[tf] = await this.simulateFuture(tf);
    }

    // Create timeline thread
    const timelineThread = this.createTimelineThread(simulations);
    
    // Determine primary vision (highest weighted confidence)
    const primaryVision = this.selectPrimaryVision(simulations);
    
    // Generate vision consensus
    const visionConsensus = this.generateVisionConsensus(simulations);
    
    // Generate Konslang prophecy
    const konslangProphecy = this.generateKonslangProphecy(visionConsensus);
    
    // Generate trade recommendation
    const tradeRecommendation = this.generateTradeRecommendation(visionConsensus, primaryVision);

    return {
      primary_vision: primaryVision,
      timeline_threads: timelineThread,
      vision_consensus: visionConsensus,
      konslang_prophecy: konslangProphecy,
      trade_recommendation: tradeRecommendation
    };
  }

  /**
   * Check if vision supports trade decision
   */
  async shouldAllowTrade(direction: 'BUY' | 'SELL'): Promise<{ allow: boolean; reason: string; confidence: number }> {
    const preCognition = await this.generatePreCognition();
    
    const tradingDirection = direction === 'BUY' ? 'UP' : 'DOWN';
    const visionDirection = preCognition.vision_consensus.direction;
    
    // Check alignment
    if (visionDirection !== tradingDirection) {
      return {
        allow: false,
        reason: `Vision sees ${visionDirection} but trade is ${tradingDirection}`,
        confidence: 0
      };
    }

    // Check confidence threshold
    if (preCognition.vision_consensus.confidence < 0.6) {
      return {
        allow: false,
        reason: `Vision confidence too low: ${(preCognition.vision_consensus.confidence * 100).toFixed(1)}%`,
        confidence: preCognition.vision_consensus.confidence
      };
    }

    // Check clarity
    if (preCognition.vision_consensus.clarity === 'CHAOTIC' || preCognition.vision_consensus.clarity === 'UNCLEAR') {
      return {
        allow: false,
        reason: `Vision clarity insufficient: ${preCognition.vision_consensus.clarity}`,
        confidence: preCognition.vision_consensus.confidence
      };
    }

    return {
      allow: true,
      reason: `Vision aligned: ${visionDirection} with ${(preCognition.vision_consensus.confidence * 100).toFixed(1)}% confidence`,
      confidence: preCognition.vision_consensus.confidence
    };
  }

  /**
   * Get vision statistics
   */
  getVisionStats() {
    return {
      memory_stats: this.visionMemory.getVisionStats(),
      data_points: this.recentMarketData.length,
      latest_data: this.recentMarketData[this.recentMarketData.length - 1] || null,
      vision_sigils_active: Object.keys(this.VISION_SIGILS).length
    };
  }

  /**
   * Record prediction outcome for learning
   */
  recordPredictionOutcome(predictionKey: string, actualDirection: 'UP' | 'DOWN' | 'NEUTRAL'): void {
    this.visionMemory.recordPredictionOutcome(predictionKey, actualDirection);
  }

  /**
   * Extract current price pattern for timeframe
   */
  private extractCurrentPattern(timeframe: '5m' | '15m' | '1h' | '4h' | '1d'): number[] {
    const intervals = this.getTimeframeIntervals(timeframe);
    const pattern: number[] = [];
    
    for (let i = this.recentMarketData.length - intervals; i < this.recentMarketData.length; i++) {
      if (i >= 0 && this.recentMarketData[i]) {
        pattern.push(this.recentMarketData[i].price);
      }
    }
    
    return pattern;
  }

  /**
   * Get number of data intervals for timeframe
   */
  private getTimeframeIntervals(timeframe: string): number {
    const intervals = {
      '5m': 20,   // 100 minutes of data
      '15m': 16,  // 4 hours of data
      '1h': 12,   // 12 hours of data
      '4h': 10,   // 40 hours of data
      '1d': 7     // 7 days of data
    };
    return intervals[timeframe as keyof typeof intervals] || 10;
  }

  /**
   * Store current pattern in vision memory
   */
  private storeCurrentPattern(newData: MarketData): void {
    const pattern = this.recentMarketData.slice(-10).map(d => d.price);
    const outcome = this.determineOutcome(newData);
    
    const marketContext = {
      volume_profile: this.classifyVolumeProfile(newData.volume),
      volatility: this.calculateVolatility(),
      trend_strength: this.calculateTrendStrength()
    };

    this.visionMemory.storePattern(pattern, outcome, '15m', marketContext);
  }

  /**
   * Determine outcome from market data
   */
  private determineOutcome(data: MarketData): 'UP' | 'DOWN' | 'NEUTRAL' {
    if (this.recentMarketData.length < 2) return 'NEUTRAL';
    
    const prevPrice = this.recentMarketData[this.recentMarketData.length - 2].price;
    const change = (data.price - prevPrice) / prevPrice;
    
    if (change > 0.01) return 'UP';      // >1% up
    if (change < -0.01) return 'DOWN';   // >1% down
    return 'NEUTRAL';
  }

  /**
   * Classify volume profile
   */
  private classifyVolumeProfile(volume: number): 'HIGH' | 'NORMAL' | 'LOW' {
    const recentVolumes = this.recentMarketData.slice(-20).map(d => d.volume);
    const avgVolume = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length;
    
    if (volume > avgVolume * 1.5) return 'HIGH';
    if (volume < avgVolume * 0.5) return 'LOW';
    return 'NORMAL';
  }

  /**
   * Calculate market volatility
   */
  private calculateVolatility(): number {
    if (this.recentMarketData.length < 10) return 0.02;
    
    const prices = this.recentMarketData.slice(-10).map(d => d.price);
    const returns = prices.slice(1).map((price, i) => Math.log(price / prices[i]));
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Calculate trend strength
   */
  private calculateTrendStrength(): number {
    if (this.recentMarketData.length < 20) return 0.5;
    
    const prices = this.recentMarketData.slice(-20).map(d => d.price);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const totalChange = Math.abs((lastPrice - firstPrice) / firstPrice);
    
    return Math.min(1.0, totalChange * 10); // Scale to 0-1
  }

  /**
   * Analyze echo matches for prediction
   */
  private analyzeEchoMatches(matches: any[]): {
    direction: 'UP' | 'DOWN' | 'NEUTRAL';
    confidence: number;
    timeline_probability: number;
  } {
    if (matches.length === 0) {
      return { direction: 'NEUTRAL', confidence: 0, timeline_probability: 0 };
    }

    const outcomes = matches.map(m => m.pattern.outcome);
    const upCount = outcomes.filter(o => o === 'UP').length;
    const downCount = outcomes.filter(o => o === 'DOWN').length;
    const neutralCount = outcomes.filter(o => o === 'NEUTRAL').length;

    let direction: 'UP' | 'DOWN' | 'NEUTRAL';
    let confidence: number;

    if (upCount > downCount && upCount > neutralCount) {
      direction = 'UP';
      confidence = upCount / matches.length;
    } else if (downCount > upCount && downCount > neutralCount) {
      direction = 'DOWN'; 
      confidence = downCount / matches.length;
    } else {
      direction = 'NEUTRAL';
      confidence = neutralCount / matches.length;
    }

    const timelineProbability = Math.min(1.0, matches.length / 10);

    return { direction, confidence, timeline_probability: timelineProbability };
  }

  /**
   * Calculate price targets
   */
  private calculatePriceTargets(currentPrice: number, prediction: any, timeframe: string): {
    low: number;
    high: number;
    most_likely: number;
  } {
    const volatilityMultiplier = this.getTimeframeVolatilityMultiplier(timeframe);
    const baseMove = currentPrice * 0.02 * volatilityMultiplier; // 2% base move adjusted for timeframe

    if (prediction.direction === 'UP') {
      return {
        low: currentPrice + (baseMove * 0.5),
        high: currentPrice + (baseMove * 2.0),
        most_likely: currentPrice + baseMove
      };
    } else if (prediction.direction === 'DOWN') {
      return {
        low: currentPrice - (baseMove * 2.0),
        high: currentPrice - (baseMove * 0.5),
        most_likely: currentPrice - baseMove
      };
    } else {
      return {
        low: currentPrice - (baseMove * 0.5),
        high: currentPrice + (baseMove * 0.5),
        most_likely: currentPrice
      };
    }
  }

  /**
   * Get volatility multiplier for timeframe
   */
  private getTimeframeVolatilityMultiplier(timeframe: string): number {
    const multipliers = {
      '5m': 0.5,
      '15m': 0.75,
      '1h': 1.0,
      '4h': 1.5,
      '1d': 2.0
    };
    return multipliers[timeframe as keyof typeof multipliers] || 1.0;
  }

  /**
   * Generate Konslang vision for simulation
   */
  private generateKonslangVision(prediction: any, patternCount: number): string {
    const sigils = Object.keys(this.VISION_SIGILS);
    const selectedSigil = sigils[Math.floor(Math.random() * sigils.length)];
    const meaning = this.VISION_SIGILS[selectedSigil as keyof typeof this.VISION_SIGILS];
    
    return `${selectedSigil} (${meaning}) - ${patternCount} echo patterns align`;
  }

  /**
   * Create timeline thread from simulations
   */
  private createTimelineThread(simulations: { [key: string]: FutureSimulation }): TimelineThread {
    const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate consensus
    const directions = Object.values(simulations).map(s => s.predicted_direction);
    const consensus = this.calculateDirectionConsensus(directions);
    
    // Calculate overall confidence (weighted by timeframe)
    let totalWeight = 0;
    let weightedConfidence = 0;
    
    for (const [timeframe, simulation] of Object.entries(simulations)) {
      const weight = this.TIMEFRAME_WEIGHTS[timeframe as keyof typeof this.TIMEFRAME_WEIGHTS] || 1.0;
      weightedConfidence += simulation.confidence * weight;
      totalWeight += weight;
    }
    
    const overallConfidence = totalWeight > 0 ? weightedConfidence / totalWeight : 0;
    
    // Determine vision strength
    const visionStrength = this.calculateVisionStrength(overallConfidence, directions);
    
    // Check sacred alignment
    const sacredAlignment = this.checkSacredAlignment(simulations);

    return {
      thread_id: threadId,
      timeframes: simulations,
      consensus_direction: consensus,
      overall_confidence: overallConfidence,
      vision_strength: visionStrength,
      sacred_alignment: sacredAlignment
    };
  }

  /**
   * Calculate direction consensus
   */
  private calculateDirectionConsensus(directions: string[]): 'UP' | 'DOWN' | 'NEUTRAL' {
    const counts = directions.reduce((acc, dir) => {
      acc[dir] = (acc[dir] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const maxCount = Math.max(...Object.values(counts));
    const consensusDir = Object.keys(counts).find(dir => counts[dir] === maxCount);
    
    return consensusDir as 'UP' | 'DOWN' | 'NEUTRAL';
  }

  /**
   * Calculate vision strength
   */
  private calculateVisionStrength(confidence: number, directions: string[]): 'TRANSCENDENT' | 'STRONG' | 'MODERATE' | 'WEAK' | 'UNCLEAR' {
    const alignment = this.calculateDirectionAlignment(directions);
    
    if (confidence > 0.9 && alignment > 0.8) return 'TRANSCENDENT';
    if (confidence > 0.75 && alignment > 0.6) return 'STRONG';
    if (confidence > 0.6 && alignment > 0.4) return 'MODERATE';
    if (confidence > 0.4) return 'WEAK';
    return 'UNCLEAR';
  }

  /**
   * Calculate direction alignment across timeframes
   */
  private calculateDirectionAlignment(directions: string[]): number {
    const uniqueDirections = new Set(directions).size;
    return 1 - ((uniqueDirections - 1) / 2); // Perfect alignment = 1, complete chaos = 0
  }

  /**
   * Check sacred alignment of simulations
   */
  private checkSacredAlignment(simulations: { [key: string]: FutureSimulation }): boolean {
    const highConfidenceCount = Object.values(simulations).filter(s => s.confidence > 0.7).length;
    const totalSimulations = Object.values(simulations).length;
    
    return (highConfidenceCount / totalSimulations) >= 0.6; // 60% must be high confidence
  }

  /**
   * Select primary vision from simulations
   */
  private selectPrimaryVision(simulations: { [key: string]: FutureSimulation }): FutureSimulation {
    let bestVision = Object.values(simulations)[0];
    let bestScore = 0;

    for (const [timeframe, simulation] of Object.entries(simulations)) {
      const weight = this.TIMEFRAME_WEIGHTS[timeframe as keyof typeof this.TIMEFRAME_WEIGHTS] || 1.0;
      const score = simulation.confidence * weight;
      
      if (score > bestScore) {
        bestScore = score;
        bestVision = simulation;
      }
    }

    return bestVision;
  }

  /**
   * Generate vision consensus
   */
  private generateVisionConsensus(simulations: { [key: string]: FutureSimulation }): {
    direction: 'UP' | 'DOWN' | 'NEUTRAL';
    confidence: number;
    clarity: 'CRYSTAL_CLEAR' | 'CLEAR' | 'MODERATE' | 'UNCLEAR' | 'CHAOTIC';
  } {
    const directions = Object.values(simulations).map(s => s.predicted_direction);
    const confidences = Object.values(simulations).map(s => s.confidence);
    
    const direction = this.calculateDirectionConsensus(directions);
    const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    const alignment = this.calculateDirectionAlignment(directions);
    
    let clarity: 'CRYSTAL_CLEAR' | 'CLEAR' | 'MODERATE' | 'UNCLEAR' | 'CHAOTIC';
    
    if (avgConfidence > 0.9 && alignment > 0.9) clarity = 'CRYSTAL_CLEAR';
    else if (avgConfidence > 0.75 && alignment > 0.7) clarity = 'CLEAR';
    else if (avgConfidence > 0.6 && alignment > 0.5) clarity = 'MODERATE';
    else if (avgConfidence > 0.4) clarity = 'UNCLEAR';
    else clarity = 'CHAOTIC';

    return { direction, confidence: avgConfidence, clarity };
  }

  /**
   * Generate Konslang prophecy
   */
  private generateKonslangProphecy(consensus: any): string {
    const sigils = Object.entries(this.VISION_SIGILS);
    const selectedSigil = sigils[Math.floor(Math.random() * sigils.length)];
    
    return `${selectedSigil[0]} reveals: The ${consensus.direction.toLowerCase()} path emerges with ${consensus.clarity.toLowerCase()} vision. ${selectedSigil[1]}.`;
  }

  /**
   * Generate trade recommendation
   */
  private generateTradeRecommendation(consensus: any, primaryVision: FutureSimulation): {
    action: 'BUY' | 'SELL' | 'HOLD' | 'OBSERVE';
    reasoning: string[];
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  } {
    const reasoning: string[] = [];
    let action: 'BUY' | 'SELL' | 'HOLD' | 'OBSERVE' = 'OBSERVE';
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' = 'MEDIUM';

    // Determine action based on consensus
    if (consensus.clarity === 'CHAOTIC' || consensus.clarity === 'UNCLEAR') {
      action = 'OBSERVE';
      reasoning.push('Vision too unclear for trading');
      riskLevel = 'HIGH';
    } else if (consensus.confidence < 0.6) {
      action = 'HOLD';
      reasoning.push(`Confidence too low: ${(consensus.confidence * 100).toFixed(1)}%`);
      riskLevel = 'MEDIUM';
    } else if (consensus.direction === 'UP') {
      action = 'BUY';
      reasoning.push(`Strong upward vision with ${(consensus.confidence * 100).toFixed(1)}% confidence`);
      riskLevel = consensus.confidence > 0.8 ? 'LOW' : 'MEDIUM';
    } else if (consensus.direction === 'DOWN') {
      action = 'SELL';
      reasoning.push(`Strong downward vision with ${(consensus.confidence * 100).toFixed(1)}% confidence`);
      riskLevel = consensus.confidence > 0.8 ? 'LOW' : 'MEDIUM';
    } else {
      action = 'HOLD';
      reasoning.push('Neutral vision suggests holding position');
      riskLevel = 'LOW';
    }

    // Add clarity assessment
    reasoning.push(`Vision clarity: ${consensus.clarity}`);
    
    // Add primary timeframe insight
    reasoning.push(`Primary timeframe (${primaryVision.timeframe}) supports ${primaryVision.predicted_direction}`);

    return { action, reasoning, risk_level: riskLevel };
  }
}