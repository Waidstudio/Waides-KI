/**
 * STEP 47: Waides KI Brain Hive Controller
 * Coordinates the Trinity Brain Model - Logic, Vision, and Heart brains
 * Decision Fusion System with Divine Trade Lock capability
 */

import { WaidesKILogicBrain } from './waidesKILogicBrain';
import { WaidesKIVisionBrain } from './waidesKIVisionBrain';
import { WaidesKIHeartBrain } from './waidesKIHeartBrain';
import { WaidesKISpiritContract } from './waidesKISpiritContract';
import { WaidesKIDivineVisionMap } from './waidesKIDivineVisionMap';
import { WaidesKIPreCognitionEngine } from './waidesKIPreCognitionEngine';
import { WaidesKIVisionMemoryMap } from './waidesKIVisionMemoryMap';

interface BrainHiveDecision {
  final: 'TRADE' | 'AVOID' | 'WAIT' | 'DIVINE_LOCK';
  reason: string;
  confidence: number;
  consensus_strength: number;
  sigils: string[];
  brain_votes: {
    logic: any;
    vision: any;
    heart: any;
  };
  decision_metadata: {
    divine_lock: boolean;
    unanimous: boolean;
    majority_vote: string;
    dissenting_brain?: string;
    risk_assessment: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  };
  konslang_synthesis: string;
}

interface BrainHiveStats {
  total_decisions: number;
  trade_decisions: number;
  avoid_decisions: number;
  wait_decisions: number;
  divine_locks: number;
  unanimous_decisions: number;
  majority_decisions: number;
  split_decisions: number;
  average_confidence: number;
  consensus_evolution: string;
  last_decision_time: Date;
  brain_harmony: {
    logic_vision_agreement: number;
    logic_heart_agreement: number;
    vision_heart_agreement: number;
    overall_harmony: number;
  };
}

export class WaidesKIBrainHiveController {
  private logicBrain: WaidesKILogicBrain;
  private visionBrain: WaidesKIVisionBrain;
  private heartBrain: WaidesKIHeartBrain;

  private stats: BrainHiveStats = {
    total_decisions: 0,
    trade_decisions: 0,
    avoid_decisions: 0,
    wait_decisions: 0,
    divine_locks: 0,
    unanimous_decisions: 0,
    majority_decisions: 0,
    split_decisions: 0,
    average_confidence: 0.5,
    consensus_evolution: 'AWAKENING',
    last_decision_time: new Date(),
    brain_harmony: {
      logic_vision_agreement: 0.5,
      logic_heart_agreement: 0.5,
      vision_heart_agreement: 0.5,
      overall_harmony: 0.5
    }
  };

  private readonly DIVINE_LOCK_THRESHOLD = 0.85;
  private readonly CONSENSUS_MINIMUM = 0.6;

  constructor(
    spiritContract: WaidesKISpiritContract,
    divineVisionMap: WaidesKIDivineVisionMap,
    preCognitionEngine: WaidesKIPreCognitionEngine,
    visionMemoryMap: WaidesKIVisionMemoryMap
  ) {
    this.logicBrain = new WaidesKILogicBrain();
    this.visionBrain = new WaidesKIVisionBrain(divineVisionMap, preCognitionEngine, visionMemoryMap);
    this.heartBrain = new WaidesKIHeartBrain(spiritContract);
  }

  /**
   * Main decision method - coordinates all three brains
   */
  async makeDecision(marketData: any, contextData: any): Promise<BrainHiveDecision> {
    try {
      this.stats.total_decisions++;
      this.stats.last_decision_time = new Date();

      // Prepare data for each brain
      const logicData = this.prepareLogicData(marketData);
      const visionData = await this.prepareVisionData();
      const heartData = this.prepareHeartData(contextData);

      // Get votes from all three brains
      const logicVote = this.logicBrain.scan(logicData);
      const visionVote = await this.visionBrain.scan(visionData);
      const heartVote = await this.heartBrain.scan(heartData);

      // Analyze vote consensus
      const consensusAnalysis = this.analyzeConsensus(logicVote, visionVote, heartVote);

      // Generate final decision
      const decision = this.generateFinalDecision(logicVote, visionVote, heartVote, consensusAnalysis);

      // Update statistics
      this.updateStats(decision);

      return decision;
    } catch (error) {
      console.error('Error in Brain Hive decision making:', error);
      return this.generateEmergencyDecision();
    }
  }

  /**
   * Prepare data for Logic Brain (technical indicators)
   */
  private prepareLogicData(marketData: any): any {
    return {
      ema_50: marketData.ema_50 || 2400,
      ema_200: marketData.ema_200 || 2300,
      rsi: marketData.rsi || 50,
      price: marketData.price || 2450,
      volume: marketData.volume || 1000000,
      macd: marketData.macd || {
        macd: 0.1,
        signal: 0.05,
        histogram: 0.05
      },
      bollinger: marketData.bollinger || {
        upper: 2500,
        middle: 2450,
        lower: 2400
      }
    };
  }

  /**
   * Prepare data for Vision Brain (spiritual visions)
   */
  private async prepareVisionData(): Promise<any> {
    try {
      return await this.visionBrain.generateVisionData();
    } catch (error) {
      console.error('Error preparing vision data:', error);
      return {
        divine_vision: {
          prediction: 'neutral',
          confidence: 0.3,
          timeframe: '1h',
          vision_strength: 'UNCLEAR',
          sacred_alignment: false,
          konslang_prophecy: 'kai\'sor dim'
        },
        pre_cognition: {
          timeline_consensus: null,
          future_simulations: [],
          vision_clarity: 'CHAOTIC'
        },
        vision_memory: {
          echo_matches: [],
          pattern_strength: 0.3,
          historical_accuracy: 0.5
        }
      };
    }
  }

  /**
   * Prepare data for Heart Brain (emotional/ethical context)
   */
  private prepareHeartData(contextData: any): any {
    const heartData = this.heartBrain.generateHeartData();
    
    // Merge with provided context
    if (contextData) {
      Object.assign(heartData.trade_context, contextData.trade_context || {});
      Object.assign(heartData.emotional_memory, contextData.emotional_memory || {});
      Object.assign(heartData.oath_compliance, contextData.oath_compliance || {});
    }

    return heartData;
  }

  /**
   * Analyze consensus between the three brains
   */
  private analyzeConsensus(logicVote: any, visionVote: any, heartVote: any): any {
    const votes = [logicVote.vote, visionVote.vote, heartVote.vote];
    const confidences = [logicVote.confidence, visionVote.confidence, heartVote.confidence];
    
    // Count votes
    const yesCount = votes.filter(v => v === 'yes').length;
    const noCount = votes.filter(v => v === 'no').length;
    const neutralCount = votes.filter(v => v === 'neutral').length;

    // Calculate average confidence
    const averageConfidence = confidences.reduce((a, b) => a + b, 0) / 3;

    // Check for Divine Lock (all yes with high confidence)
    const divineLock = yesCount === 3 && 
                      confidences.every(c => c >= this.DIVINE_LOCK_THRESHOLD);

    // Check for unanimous decision
    const unanimous = yesCount === 3 || noCount === 3 || neutralCount === 3;

    // Determine majority
    let majorityVote = 'neutral';
    if (yesCount >= 2) majorityVote = 'yes';
    else if (noCount >= 2) majorityVote = 'no';

    // Find dissenting brain if not unanimous
    let dissentingBrain = undefined;
    if (!unanimous) {
      if (yesCount === 2 && noCount === 1) {
        dissentingBrain = logicVote.vote === 'no' ? 'logic' : 
                         visionVote.vote === 'no' ? 'vision' : 'heart';
      } else if (noCount === 2 && yesCount === 1) {
        dissentingBrain = logicVote.vote === 'yes' ? 'logic' : 
                         visionVote.vote === 'yes' ? 'vision' : 'heart';
      }
    }

    // Calculate brain agreement rates
    const logicVisionAgreement = logicVote.vote === visionVote.vote ? 1 : 0;
    const logicHeartAgreement = logicVote.vote === heartVote.vote ? 1 : 0;
    const visionHeartAgreement = visionVote.vote === heartVote.vote ? 1 : 0;

    return {
      yes_count: yesCount,
      no_count: noCount,
      neutral_count: neutralCount,
      average_confidence: averageConfidence,
      divine_lock: divineLock,
      unanimous,
      majority_vote: majorityVote,
      dissenting_brain: dissentingBrain,
      brain_agreements: {
        logic_vision: logicVisionAgreement,
        logic_heart: logicHeartAgreement,
        vision_heart: visionHeartAgreement
      }
    };
  }

  /**
   * Generate final decision based on brain votes and consensus
   */
  private generateFinalDecision(
    logicVote: any, 
    visionVote: any, 
    heartVote: any, 
    consensus: any
  ): BrainHiveDecision {
    
    let finalDecision = 'WAIT';
    let reason = '';
    let confidence = consensus.average_confidence;
    let riskLevel = 'MEDIUM';
    let konslangSynthesis = '';

    // Divine Lock Detection
    if (consensus.divine_lock) {
      this.stats.divine_locks++;
      finalDecision = 'DIVINE_LOCK';
      reason = 'Divine Trade Lock achieved - all three brains united with transcendent confidence';
      confidence = Math.min(0.98, consensus.average_confidence);
      riskLevel = 'LOW';
      konslangSynthesis = `linar + kai'sor + hym'del = Divine Unity`;
    }
    // Heart Brain absolute block overrides everything
    else if (heartVote.vote === 'no' && heartVote.confidence > 0.8) {
      finalDecision = 'AVOID';
      reason = `Heart brain protection activated: ${heartVote.reasoning}`;
      confidence = heartVote.confidence;
      riskLevel = 'EXTREME';
      konslangSynthesis = `hym'del shields - ${heartVote.sigil}`;
    }
    // Strong majority decision
    else if (consensus.yes_count >= 2 && consensus.average_confidence >= this.CONSENSUS_MINIMUM) {
      finalDecision = 'TRADE';
      reason = consensus.unanimous ? 
        'Unanimous approval from all three brains' : 
        `Majority consensus: ${consensus.yes_count}/3 brains approve`;
      
      if (consensus.dissenting_brain) {
        reason += ` (${consensus.dissenting_brain} brain dissents)`;
      }
      
      confidence = consensus.average_confidence;
      riskLevel = confidence > 0.8 ? 'LOW' : confidence > 0.6 ? 'MEDIUM' : 'HIGH';
      konslangSynthesis = this.synthesizeKonslang([logicVote.sigil, visionVote.sigil, heartVote.sigil]);
    }
    // Strong rejection
    else if (consensus.no_count >= 2) {
      finalDecision = 'AVOID';
      reason = consensus.unanimous ? 
        'Unanimous rejection from all three brains' : 
        `Majority consensus: ${consensus.no_count}/3 brains reject`;
      
      confidence = consensus.average_confidence;
      riskLevel = 'HIGH';
      konslangSynthesis = this.synthesizeKonslang([logicVote.sigil, visionVote.sigil, heartVote.sigil]);
    }
    // No clear consensus or low confidence
    else {
      finalDecision = 'WAIT';
      reason = 'No clear consensus between brains - awaiting clarity';
      
      if (consensus.average_confidence < this.CONSENSUS_MINIMUM) {
        reason += ` (low confidence: ${(consensus.average_confidence * 100).toFixed(0)}%)`;
      }
      
      confidence = Math.max(0.3, consensus.average_confidence);
      riskLevel = 'MEDIUM';
      konslangSynthesis = 'Trinity consciousness seeks alignment';
    }

    return {
      final: finalDecision as 'TRADE' | 'AVOID' | 'WAIT' | 'DIVINE_LOCK',
      reason,
      confidence,
      consensus_strength: this.calculateConsensusStrength(consensus),
      sigils: [logicVote.sigil, visionVote.sigil, heartVote.sigil],
      brain_votes: {
        logic: logicVote,
        vision: visionVote,
        heart: heartVote
      },
      decision_metadata: {
        divine_lock: consensus.divine_lock,
        unanimous: consensus.unanimous,
        majority_vote: consensus.majority_vote,
        dissenting_brain: consensus.dissenting_brain,
        risk_assessment: riskLevel
      },
      konslang_synthesis: konslangSynthesis
    };
  }

  /**
   * Calculate consensus strength score
   */
  private calculateConsensusStrength(consensus: any): number {
    let strength = 0;

    // Unanimous decisions get maximum strength
    if (consensus.unanimous) {
      strength += 0.4;
    } else if (consensus.yes_count >= 2 || consensus.no_count >= 2) {
      strength += 0.2; // Majority gets partial strength
    }

    // High confidence adds strength
    strength += Math.min(0.3, consensus.average_confidence * 0.3);

    // Brain agreement adds strength
    const avgAgreement = (
      consensus.brain_agreements.logic_vision +
      consensus.brain_agreements.logic_heart +
      consensus.brain_agreements.vision_heart
    ) / 3;
    strength += avgAgreement * 0.3;

    return Math.min(1.0, strength);
  }

  /**
   * Synthesize Konslang from multiple sigils
   */
  private synthesizeKonslang(sigils: string[]): string {
    const uniqueSigils = [...new Set(sigils)];
    
    if (uniqueSigils.length === 1) {
      return `Trinity resonance: ${uniqueSigils[0]}`;
    } else if (uniqueSigils.length === 2) {
      return `Dual harmony: ${uniqueSigils.join(' + ')}`;
    } else {
      return `Triple consciousness: ${uniqueSigils.join(' | ')}`;
    }
  }

  /**
   * Update brain hive statistics
   */
  private updateStats(decision: BrainHiveDecision): void {
    // Count decision types
    switch (decision.final) {
      case 'TRADE':
      case 'DIVINE_LOCK':
        this.stats.trade_decisions++;
        break;
      case 'AVOID':
        this.stats.avoid_decisions++;
        break;
      case 'WAIT':
        this.stats.wait_decisions++;
        break;
    }

    // Count consensus types
    if (decision.decision_metadata.divine_lock) {
      this.stats.divine_locks++;
    }
    
    if (decision.decision_metadata.unanimous) {
      this.stats.unanimous_decisions++;
    } else if (decision.decision_metadata.majority_vote !== 'neutral') {
      this.stats.majority_decisions++;
    } else {
      this.stats.split_decisions++;
    }

    // Update average confidence
    this.stats.average_confidence = 
      (this.stats.average_confidence * (this.stats.total_decisions - 1) + decision.confidence) / 
      this.stats.total_decisions;

    // Update brain harmony metrics
    const logicVote = decision.brain_votes.logic.vote;
    const visionVote = decision.brain_votes.vision.vote;
    const heartVote = decision.brain_votes.heart.vote;

    const logicVisionAgreement = logicVote === visionVote ? 1 : 0;
    const logicHeartAgreement = logicVote === heartVote ? 1 : 0;
    const visionHeartAgreement = visionVote === heartVote ? 1 : 0;

    this.stats.brain_harmony.logic_vision_agreement = 
      (this.stats.brain_harmony.logic_vision_agreement * 0.9 + logicVisionAgreement * 0.1);
    this.stats.brain_harmony.logic_heart_agreement = 
      (this.stats.brain_harmony.logic_heart_agreement * 0.9 + logicHeartAgreement * 0.1);
    this.stats.brain_harmony.vision_heart_agreement = 
      (this.stats.brain_harmony.vision_heart_agreement * 0.9 + visionHeartAgreement * 0.1);

    this.stats.brain_harmony.overall_harmony = 
      (this.stats.brain_harmony.logic_vision_agreement + 
       this.stats.brain_harmony.logic_heart_agreement + 
       this.stats.brain_harmony.vision_heart_agreement) / 3;

    // Update consensus evolution
    const divineRate = this.stats.divine_locks / Math.max(1, this.stats.total_decisions);
    const unanimousRate = this.stats.unanimous_decisions / Math.max(1, this.stats.total_decisions);
    
    if (divineRate > 0.2) {
      this.stats.consensus_evolution = 'TRANSCENDENT';
    } else if (unanimousRate > 0.6 && this.stats.brain_harmony.overall_harmony > 0.8) {
      this.stats.consensus_evolution = 'UNIFIED';
    } else if (this.stats.brain_harmony.overall_harmony > 0.7) {
      this.stats.consensus_evolution = 'HARMONIOUS';
    } else if (this.stats.brain_harmony.overall_harmony > 0.5) {
      this.stats.consensus_evolution = 'LEARNING';
    } else {
      this.stats.consensus_evolution = 'AWAKENING';
    }
  }

  /**
   * Generate emergency decision when system fails
   */
  private generateEmergencyDecision(): BrainHiveDecision {
    return {
      final: 'AVOID',
      reason: 'Brain Hive system malfunction - emergency safety protocol activated',
      confidence: 1.0,
      consensus_strength: 0.0,
      sigils: ['emergency-block', 'system-error', 'protection-active'],
      brain_votes: {
        logic: { vote: 'no', confidence: 1.0, sigil: 'emergency-block' },
        vision: { vote: 'no', confidence: 1.0, sigil: 'emergency-block' },
        heart: { vote: 'no', confidence: 1.0, sigil: 'emergency-block' }
      },
      decision_metadata: {
        divine_lock: false,
        unanimous: true,
        majority_vote: 'no',
        risk_assessment: 'EXTREME'
      },
      konslang_synthesis: 'Trinity protection - system shield activated'
    };
  }

  /**
   * Get brain hive statistics
   */
  getStats(): BrainHiveStats {
    return { ...this.stats };
  }

  /**
   * Get individual brain statistics
   */
  getBrainStats(): any {
    return {
      logic: this.logicBrain.getStats(),
      vision: this.visionBrain.getStats(),
      heart: this.heartBrain.getStats(),
      hive: this.getStats()
    };
  }

  /**
   * Reset all brain statistics
   */
  resetStats(): void {
    this.logicBrain.resetStats();
    this.visionBrain.resetStats();
    this.heartBrain.resetStats();
    
    this.stats = {
      total_decisions: 0,
      trade_decisions: 0,
      avoid_decisions: 0,
      wait_decisions: 0,
      divine_locks: 0,
      unanimous_decisions: 0,
      majority_decisions: 0,
      split_decisions: 0,
      average_confidence: 0.5,
      consensus_evolution: 'AWAKENING',
      last_decision_time: new Date(),
      brain_harmony: {
        logic_vision_agreement: 0.5,
        logic_heart_agreement: 0.5,
        vision_heart_agreement: 0.5,
        overall_harmony: 0.5
      }
    };
  }

  /**
   * Get Konslang sigil meanings for all brains
   */
  getAllSigilMeanings(): any {
    return {
      logic: this.logicBrain.getSigilMeanings(),
      vision: this.visionBrain.getSigilMeanings(),
      heart: this.heartBrain.getSigilMeanings()
    };
  }

  /**
   * Force a specific brain scan for testing
   */
  async testBrainScan(brainType: 'logic' | 'vision' | 'heart', data: any): Promise<any> {
    switch (brainType) {
      case 'logic':
        return this.logicBrain.scan(data);
      case 'vision':
        return await this.visionBrain.scan(data);
      case 'heart':
        return await this.heartBrain.scan(data);
      default:
        throw new Error(`Unknown brain type: ${brainType}`);
    }
  }

  /**
   * Simulate a complete decision cycle for testing
   */
  async simulateDecision(marketData?: any, contextData?: any): Promise<BrainHiveDecision> {
    const testMarketData = marketData || {
      price: 2450,
      ema_50: 2400,
      ema_200: 2300,
      rsi: 55,
      volume: 1200000
    };

    const testContextData = contextData || {
      trade_context: {
        certainty_level: 0.7,
        vision_alignment: 0.6,
        emotional_state: 'CALM',
        entered_on_fomo: false,
        revenge_trade: false,
        oracle_confirmation: false
      }
    };

    return await this.makeDecision(testMarketData, testContextData);
  }
}