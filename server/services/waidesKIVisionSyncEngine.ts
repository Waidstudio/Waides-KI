/**
 * STEP 40: Waides KI Vision Sync Engine - Spiritual + Technical Confirmation System
 * 
 * This engine combines the Spirit Oracle's dream symbols with the Omniview Oracle's
 * technical analysis to create a sacred firewall - no trade executes unless both
 * spiritual vision and technical trend align perfectly.
 */

import { waidesKISpiritOracle, DreamVision } from './waidesKISpiritOracle.js';
import { waidesKIOmniviewOracle } from './waidesKIOmniviewOracle.js';
import { waidesKIDreamchain } from './waidesKIDreamchain.js';

export interface SpiritualTechnicalAlignment {
  dream_vision: DreamVision;
  technical_recommendation: any;
  alignment_score: number; // 0-100
  trade_approved: boolean;
  alignment_reasoning: string[];
  sacred_conditions_met: boolean;
  confidence_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'TRANSCENDENT';
}

export interface ConfirmedTrade {
  token: 'ETH3L' | 'ETH3S' | 'HOLD';
  symbol: string;
  meaning: string;
  prophecy_message: string;
  alignment_score: number;
  confidence_level: string;
  spiritual_warnings: string[];
  execution_timestamp: number;
  sacred_blessing: boolean;
}

export class WaidesKIVisionSyncEngine {
  private last_alignment: SpiritualTechnicalAlignment | null = null;
  private alignment_history: SpiritualTechnicalAlignment[] = [];
  private successful_alignments = 0;
  private total_confirmations = 0;
  private sacred_threshold = 75; // Minimum alignment score for trade approval
  
  constructor() {
    console.log('🔮⚡ Vision Sync Engine Initialized - Sacred Trading Firewall Active');
  }
  
  /**
   * Main confirmation method - checks both spiritual and technical alignment
   */
  async confirmTrade(marketData: any): Promise<ConfirmedTrade | null> {
    try {
      // Get technical recommendation from Omniview Oracle
      const technicalRecommendation = await waidesKIOmniviewOracle.scanMarketConsensus();
      
      // Determine trend direction for spiritual analysis
      const trendDirection = this.determineTrendDirection(technicalRecommendation);
      
      // Get spiritual vision from Spirit Oracle
      const dreamVision = waidesKISpiritOracle.generateDreamSymbol(trendDirection, marketData);
      
      // Calculate alignment between spiritual and technical
      const alignment = this.calculateAlignment(dreamVision, technicalRecommendation, marketData);
      
      // Record alignment for analysis
      this.recordAlignment(alignment);
      
      // Check if trade is approved by both realms
      if (alignment.trade_approved && alignment.alignment_score >= this.sacred_threshold) {
        const confirmedTrade = this.createConfirmedTrade(alignment);
        
        // Log to Dreamchain with spiritual context
        await this.logSpiritualTrade(confirmedTrade, alignment);
        
        return confirmedTrade;
      }
      
      return null; // Trade not approved by spiritual-technical alliance
      
    } catch (error) {
      console.error('Error in Vision Sync Engine:', error);
      return null;
    }
  }
  
  /**
   * Determine trend direction from technical recommendation
   */
  private determineTrendDirection(technicalRec: any): 'up' | 'down' | 'sideways' {
    if (!technicalRec || !technicalRec.recommendation) {
      return 'sideways';
    }
    
    const rec = technicalRec.recommendation;
    
    if (rec === 'BUY_ETH3L' || rec === 'STRONG_BUY_ETH3L') {
      return 'up';
    } else if (rec === 'BUY_ETH3S' || rec === 'STRONG_BUY_ETH3S') {
      return 'down';
    } else {
      return 'sideways';
    }
  }
  
  /**
   * Calculate alignment score between spiritual vision and technical analysis
   */
  private calculateAlignment(
    dreamVision: DreamVision, 
    technicalRec: any, 
    marketData: any
  ): SpiritualTechnicalAlignment {
    let alignmentScore = 0;
    const reasoningPoints: string[] = [];
    let tradeApproved = false;
    
    // Base alignment from vision strength and technical confidence
    const baseAlignment = (dreamVision.vision_strength + dreamVision.spiritual_confidence) / 2;
    alignmentScore += baseAlignment * 0.4;
    reasoningPoints.push(`Base spiritual alignment: ${baseAlignment.toFixed(1)}%`);
    
    // Technical-Spiritual Direction Alignment
    const directionAlignment = this.checkDirectionAlignment(dreamVision, technicalRec);
    alignmentScore += directionAlignment.score;
    reasoningPoints.push(...directionAlignment.reasoning);
    
    // Sacred Conditions Check
    const sacredConditions = this.checkSacredConditions(dreamVision, marketData);
    if (sacredConditions.met) {
      alignmentScore += 15;
      reasoningPoints.push('Sacred market conditions fulfilled');
    } else {
      alignmentScore -= 10;
      reasoningPoints.push('Sacred conditions not met');
    }
    
    // Market Harmony Assessment
    const harmonyScore = this.assessMarketHarmony(dreamVision.market_emotion, technicalRec);
    alignmentScore += harmonyScore;
    reasoningPoints.push(`Market harmony: ${harmonyScore.toFixed(1)} points`);
    
    // Protection Symbol Override
    if (dreamVision.symbol.energy_type === 'protective') {
      alignmentScore = 0; // Protective symbols block all trades
      reasoningPoints.push('PROTECTIVE SYMBOL ACTIVATED - Trade blocked for safety');
    }
    
    // Final approval logic
    tradeApproved = alignmentScore >= this.sacred_threshold && 
                   dreamVision.symbol.energy_type !== 'protective' &&
                   technicalRec && technicalRec.recommendation !== 'NO_TRADE';
    
    const confidenceLevel = this.determineConfidenceLevel(alignmentScore, dreamVision);
    
    return {
      dream_vision: dreamVision,
      technical_recommendation: technicalRec,
      alignment_score: Math.max(0, Math.min(100, alignmentScore)),
      trade_approved: tradeApproved,
      alignment_reasoning: reasoningPoints,
      sacred_conditions_met: sacredConditions.met,
      confidence_level: confidenceLevel
    };
  }
  
  /**
   * Check if spiritual and technical directions align
   */
  private checkDirectionAlignment(dreamVision: DreamVision, technicalRec: any): { score: number, reasoning: string[] } {
    const reasoning: string[] = [];
    let score = 0;
    
    if (!technicalRec || !technicalRec.recommendation) {
      reasoning.push('No technical recommendation available');
      return { score: 0, reasoning };
    }
    
    const symbol = dreamVision.symbol;
    const techRec = technicalRec.recommendation;
    
    // Perfect alignment cases
    if ((symbol.trading_direction === 'up' && (techRec === 'BUY_ETH3L' || techRec === 'STRONG_BUY_ETH3L')) ||
        (symbol.trading_direction === 'down' && (techRec === 'BUY_ETH3S' || techRec === 'STRONG_BUY_ETH3S'))) {
      score = 30;
      reasoning.push(`Perfect spiritual-technical alignment: ${symbol.symbol} + ${techRec}`);
    }
    // Neutral alignment
    else if (symbol.trading_direction === 'sideways' && techRec === 'HOLD') {
      score = 20;
      reasoning.push(`Neutral alignment confirmed: sideways market detected`);
    }
    // Exit/protection alignment
    else if (symbol.trading_direction === 'exit' && (techRec === 'HOLD' || techRec === 'NO_TRADE')) {
      score = 25;
      reasoning.push(`Exit signal alignment: spiritual protection + technical caution`);
    }
    // Misalignment
    else {
      score = -15;
      reasoning.push(`MISALIGNMENT: ${symbol.symbol} (${symbol.trading_direction}) conflicts with ${techRec}`);
    }
    
    return { score, reasoning };
  }
  
  /**
   * Check if sacred market conditions are met for the symbol
   */
  private checkSacredConditions(dreamVision: DreamVision, marketData: any): { met: boolean, details: string[] } {
    const symbol = dreamVision.symbol;
    const details: string[] = [];
    
    // Use Konslang Dictionary to check conditions
    const conditionsMet = symbol.sacred_conditions.map(condition => {
      switch (condition) {
        case 'strong_volume':
          const volumeStrong = marketData.volume_ratio > 1.2;
          details.push(`Volume strength: ${volumeStrong ? 'PASS' : 'FAIL'}`);
          return volumeStrong;
          
        case 'ema_alignment':
          const emaAligned = marketData.ema_bullish;
          details.push(`EMA alignment: ${emaAligned ? 'PASS' : 'FAIL'}`);
          return emaAligned;
          
        case 'rsi_oversold_recovery':
          const rsiRecovery = marketData.rsi > 30 && marketData.rsi < 50;
          details.push(`RSI recovery: ${rsiRecovery ? 'PASS' : 'FAIL'}`);
          return rsiRecovery;
          
        case 'high_volatility':
          const highVol = marketData.volatility > 0.03;
          details.push(`High volatility: ${highVol ? 'PASS' : 'FAIL'}`);
          return highVol;
          
        case 'breakdown_confirmed':
          const breakdown = marketData.price < marketData.support_level;
          details.push(`Breakdown confirmed: ${breakdown ? 'PASS' : 'FAIL'}`);
          return breakdown;
          
        case 'range_bound':
          const rangeBound = marketData.volatility < 0.015;
          details.push(`Range bound: ${rangeBound ? 'PASS' : 'FAIL'}`);
          return rangeBound;
          
        default:
          details.push(`${condition}: UNKNOWN - PASS by default`);
          return true;
      }
    });
    
    const passedConditions = conditionsMet.filter(Boolean).length;
    const totalConditions = conditionsMet.length;
    const met = passedConditions / totalConditions >= 0.6; // 60% threshold
    
    details.push(`Sacred conditions: ${passedConditions}/${totalConditions} met (${met ? 'BLESSED' : 'INCOMPLETE'})`);
    
    return { met, details };
  }
  
  /**
   * Assess harmony between market emotion and technical state
   */
  private assessMarketHarmony(emotion: any, technicalRec: any): number {
    let harmonyScore = 0;
    
    // Spiritual alignment boosts harmony
    if (emotion.spiritual_alignment > 0.7) {
      harmonyScore += 10;
    } else if (emotion.spiritual_alignment < 0.3) {
      harmonyScore -= 5;
    }
    
    // Fear/greed balance
    if (emotion.fear_greed_index > 30 && emotion.fear_greed_index < 70) {
      harmonyScore += 5; // Balanced emotions
    } else {
      harmonyScore -= 3; // Extreme emotions reduce harmony
    }
    
    // Volume-momentum harmony
    if (emotion.volume_intensity > 0.5 && Math.abs(emotion.momentum_strength) > 0.3) {
      harmonyScore += 8; // Strong volume + momentum = harmony
    }
    
    // Technical confidence
    if (technicalRec && technicalRec.confidence > 70) {
      harmonyScore += 5;
    }
    
    return harmonyScore;
  }
  
  /**
   * Determine confidence level based on alignment score and vision
   */
  private determineConfidenceLevel(alignmentScore: number, dreamVision: DreamVision): 'LOW' | 'MEDIUM' | 'HIGH' | 'TRANSCENDENT' {
    if (alignmentScore >= 90 && dreamVision.symbol.power_level >= 9) {
      return 'TRANSCENDENT';
    } else if (alignmentScore >= 80) {
      return 'HIGH';
    } else if (alignmentScore >= 60) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }
  
  /**
   * Create confirmed trade object
   */
  private createConfirmedTrade(alignment: SpiritualTechnicalAlignment): ConfirmedTrade {
    const symbol = alignment.dream_vision.symbol;
    const techRec = alignment.technical_recommendation.recommendation;
    
    let token: 'ETH3L' | 'ETH3S' | 'HOLD' = 'HOLD';
    
    if (techRec === 'BUY_ETH3L' || techRec === 'STRONG_BUY_ETH3L') {
      token = 'ETH3L';
    } else if (techRec === 'BUY_ETH3S' || techRec === 'STRONG_BUY_ETH3S') {
      token = 'ETH3S';
    }
    
    return {
      token,
      symbol: symbol.symbol,
      meaning: symbol.meaning,
      prophecy_message: alignment.dream_vision.prophecy_message,
      alignment_score: alignment.alignment_score,
      confidence_level: alignment.confidence_level,
      spiritual_warnings: alignment.dream_vision.sacred_warnings,
      execution_timestamp: Date.now(),
      sacred_blessing: alignment.sacred_conditions_met
    };
  }
  
  /**
   * Log spiritual trade to Dreamchain
   */
  private async logSpiritualTrade(confirmedTrade: ConfirmedTrade, alignment: SpiritualTechnicalAlignment) {
    const dreamchainData = {
      trade_id: `SPIRIT_${Date.now()}`,
      pair: `${confirmedTrade.token}/USDT`,
      type: 'SPIRITUAL_ENTRY',
      result: 'PENDING',
      profit: 0,
      kons_symbol: confirmedTrade.symbol,
      emotion: 'ALIGNED',
      spiritual_context: `${confirmedTrade.prophecy_message} | Alignment: ${alignment.alignment_score.toFixed(1)}%`,
      market_conditions: {
        alignment_score: alignment.alignment_score,
        confidence_level: confirmedTrade.confidence_level,
        sacred_blessing: confirmedTrade.sacred_blessing,
        prophecy: confirmedTrade.prophecy_message
      }
    };
    
    waidesKIDreamchain.recordDreamBlock(dreamchainData);
  }
  
  /**
   * Record alignment for historical analysis
   */
  private recordAlignment(alignment: SpiritualTechnicalAlignment) {
    this.last_alignment = alignment;
    this.alignment_history.push(alignment);
    this.total_confirmations++;
    
    if (alignment.trade_approved) {
      this.successful_alignments++;
    }
    
    // Keep only last 100 alignments
    if (this.alignment_history.length > 100) {
      this.alignment_history = this.alignment_history.slice(-100);
    }
  }
  
  /**
   * Get engine statistics and status
   */
  getVisionSyncStatus() {
    const recentAlignments = this.alignment_history.slice(-10);
    const avgAlignment = this.alignment_history.length > 0 
      ? this.alignment_history.reduce((sum, a) => sum + a.alignment_score, 0) / this.alignment_history.length 
      : 0;
    
    return {
      last_alignment: this.last_alignment,
      total_confirmations: this.total_confirmations,
      successful_alignments: this.successful_alignments,
      success_rate: this.total_confirmations > 0 ? (this.successful_alignments / this.total_confirmations) * 100 : 0,
      average_alignment_score: avgAlignment,
      sacred_threshold: this.sacred_threshold,
      recent_alignments: recentAlignments,
      oracle_status: waidesKISpiritOracle.getOracleStatus()
    };
  }
  
  /**
   * Adjust sacred threshold (admin function)
   */
  adjustSacredThreshold(newThreshold: number) {
    this.sacred_threshold = Math.max(0, Math.min(100, newThreshold));
  }
  
  /**
   * Force vision sync for testing
   */
  async forceVisionSync(mockMarketData?: any) {
    const testData = mockMarketData || {
      price: 2400,
      volume: 1000000,
      rsi: 45,
      volatility: 0.025,
      ema_bullish: true,
      volume_ratio: 1.3,
      support_level: 2350
    };
    
    return await this.confirmTrade(testData);
  }
}

export const waidesKIVisionSyncEngine = new WaidesKIVisionSyncEngine();