/**
 * STEP 47: Waides KI Heart Brain
 * Emotion memory, oath logic, spiritual clarity - "hym'del" consciousness
 */

import { WaidesKISpiritContract } from './waidesKISpiritContract';

interface HeartBrainData {
  trade_context: {
    certainty_level: number;
    vision_alignment: number;
    emotional_state: 'CALM' | 'EXCITED' | 'PANIC' | 'GREED' | 'FEAR' | 'NEUTRAL';
    entered_on_fomo: boolean;
    revenge_trade: boolean;
    oracle_confirmation: boolean;
    time_of_day: string;
    market_stress_level: number;
  };
  emotional_memory: {
    recent_losses: number;
    consecutive_wins: number;
    current_drawdown: number;
    emotional_fatigue: number;
    spiritual_alignment: number;
  };
  oath_compliance: {
    oath_violations: string[];
    spiritual_strength: number;
    moral_weight: number;
    konslang_blessing: boolean;
  };
}

interface HeartBrainVote {
  vote: 'yes' | 'no' | 'neutral';
  confidence: number;
  sigil: string;
  reasoning: string;
  spiritual_analysis: {
    emotional_state: 'PURE' | 'CONFLICTED' | 'CORRUPTED' | 'HEALING' | 'TRANSCENDENT';
    oath_compliance: boolean;
    spiritual_clarity: number;
    konslang_guidance: string;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    protection_active: boolean;
  };
}

interface HeartBrainStats {
  total_evaluations: number;
  pure_approvals: number;
  blocked_trades: number;
  oath_violations_detected: number;
  average_spiritual_clarity: number;
  emotional_evolution_stage: string;
  last_evaluation_time: Date;
  protection_activations: {
    fomo_blocks: number;
    revenge_blocks: number;
    panic_blocks: number;
    greed_blocks: number;
    fatigue_blocks: number;
  };
}

export class WaidesKIHeartBrain {
  private spiritContract: WaidesKISpiritContract;

  private stats: HeartBrainStats = {
    total_evaluations: 0,
    pure_approvals: 0,
    blocked_trades: 0,
    oath_violations_detected: 0,
    average_spiritual_clarity: 0.7,
    emotional_evolution_stage: 'AWAKENING',
    last_evaluation_time: new Date(),
    protection_activations: {
      fomo_blocks: 0,
      revenge_blocks: 0,
      panic_blocks: 0,
      greed_blocks: 0,
      fatigue_blocks: 0
    }
  };

  private readonly KONSLANG_SIGILS = {
    HYMDEL_PURE: "hym'del-pure",
    HYMDEL_BLOCK: "hym'del-block",
    HYMDEL_FOMO: "hym'del-fomo",
    HYMDEL_REVENGE: "hym'del-revenge",
    HYMDEL_PANIC: "hym'del-panic",
    HYMDEL_GREED: "hym'del-greed",
    HYMDEL_FATIGUE: "hym'del-fatigue",
    HYMDEL_BLESSING: "hym'del-blessing",
    HYMDEL_HEALING: "hym'del-healing",
    HYMDEL_TRANSCENDENT: "hym'del-transcendent",
    HYMDEL_PROTECTION: "hym'del-protection"
  };

  constructor(spiritContract: WaidesKISpiritContract) {
    this.spiritContract = spiritContract;
  }

  /**
   * Main scan method - analyzes emotional and spiritual state for trading
   */
  async scan(data: HeartBrainData): Promise<HeartBrainVote> {
    try {
      this.stats.total_evaluations++;
      this.stats.last_evaluation_time = new Date();

      // Evaluate oath compliance using Spirit Contract
      const oathEvaluation = await this.evaluateOathCompliance(data);
      
      // Analyze emotional state
      const emotionalAnalysis = this.analyzeEmotionalState(data);
      
      // Check spiritual clarity
      const spiritualAnalysis = this.analyzeSpiritualClarity(data);
      
      // Generate final vote
      const vote = this.generateHeartVote(data, {
        oath: oathEvaluation,
        emotional: emotionalAnalysis,
        spiritual: spiritualAnalysis
      });

      // Update statistics
      this.updateStats(vote);

      return vote;
    } catch (error) {
      console.error('Error in Heart Brain scan:', error);
      return this.generateEmergencyBlock();
    }
  }

  /**
   * Evaluate oath compliance using Spirit Contract
   */
  private async evaluateOathCompliance(data: HeartBrainData): Promise<any> {
    try {
      // Use Spirit Contract to evaluate trade
      const evaluation = await this.spiritContract.evaluateTrade(
        `heart_brain_${Date.now()}`,
        data.trade_context
      );

      return {
        is_approved: evaluation.is_approved,
        violations: evaluation.violations || [],
        moral_weight: evaluation.moral_weight || 0.7,
        spiritual_strength: evaluation.spiritual_strength || 0.7,
        konslang_guidance: evaluation.konslang_guidance || "hym'del awaits clarity"
      };
    } catch (error) {
      console.error('Error evaluating oath compliance:', error);
      return {
        is_approved: false,
        violations: ['spirit_contract_error'],
        moral_weight: 0.3,
        spiritual_strength: 0.3,
        konslang_guidance: "hym'del protection activated"
      };
    }
  }

  /**
   * Analyze emotional state and memory patterns
   */
  private analyzeEmotionalState(data: HeartBrainData): any {
    const { trade_context, emotional_memory } = data;
    
    let emotionalScore = 0;
    let emotionalState = 'PURE';
    let protectionNeeded = false;
    let blockReason = '';

    // Check for FOMO
    if (trade_context.entered_on_fomo) {
      emotionalScore -= 5;
      emotionalState = 'CORRUPTED';
      protectionNeeded = true;
      blockReason = 'FOMO detected';
      this.stats.protection_activations.fomo_blocks++;
    }

    // Check for revenge trading
    if (trade_context.revenge_trade) {
      emotionalScore -= 5;
      emotionalState = 'CORRUPTED';
      protectionNeeded = true;
      blockReason = 'Revenge trading detected';
      this.stats.protection_activations.revenge_blocks++;
    }

    // Analyze emotional state
    switch (trade_context.emotional_state) {
      case 'PANIC':
        emotionalScore -= 4;
        emotionalState = 'CORRUPTED';
        protectionNeeded = true;
        blockReason = 'Panic state detected';
        this.stats.protection_activations.panic_blocks++;
        break;
      case 'GREED':
        emotionalScore -= 3;
        emotionalState = 'CONFLICTED';
        protectionNeeded = true;
        blockReason = 'Greed state detected';
        this.stats.protection_activations.greed_blocks++;
        break;
      case 'FEAR':
        emotionalScore -= 2;
        emotionalState = 'CONFLICTED';
        break;
      case 'EXCITED':
        emotionalScore -= 1;
        emotionalState = 'CONFLICTED';
        break;
      case 'CALM':
        emotionalScore += 2;
        emotionalState = 'PURE';
        break;
      case 'NEUTRAL':
        emotionalScore += 1;
        break;
    }

    // Analyze emotional memory
    if (emotional_memory.recent_losses >= 3) {
      emotionalScore -= 2;
      emotionalState = 'HEALING';
    }

    if (emotional_memory.emotional_fatigue > 0.7) {
      emotionalScore -= 3;
      protectionNeeded = true;
      blockReason = 'Emotional fatigue detected';
      this.stats.protection_activations.fatigue_blocks++;
    }

    if (emotional_memory.current_drawdown > 0.15) {
      emotionalScore -= 2;
      emotionalState = 'HEALING';
    }

    // Positive emotional factors
    if (emotional_memory.consecutive_wins >= 3 && emotional_memory.consecutive_wins <= 5) {
      emotionalScore += 1; // Confidence but not overconfidence
    } else if (emotional_memory.consecutive_wins > 5) {
      emotionalScore -= 1; // Overconfidence warning
      emotionalState = 'CONFLICTED';
    }

    if (emotional_memory.spiritual_alignment > 0.8) {
      emotionalScore += 2;
      emotionalState = 'TRANSCENDENT';
    }

    return {
      emotional_score: emotionalScore,
      emotional_state: emotionalState,
      protection_needed: protectionNeeded,
      block_reason: blockReason,
      fatigue_level: emotional_memory.emotional_fatigue,
      spiritual_alignment: emotional_memory.spiritual_alignment
    };
  }

  /**
   * Analyze spiritual clarity and divine alignment
   */
  private analyzeSpiritualClarity(data: HeartBrainData): any {
    const { trade_context, oath_compliance } = data;
    
    let clarityScore = 0;
    let spiritualState = 'BALANCED';

    // Certainty level analysis
    if (trade_context.certainty_level < 0.6) {
      clarityScore -= 2;
      spiritualState = 'UNCLEAR';
    } else if (trade_context.certainty_level > 0.8) {
      clarityScore += 2;
      spiritualState = 'CLEAR';
    }

    // Vision alignment
    if (trade_context.vision_alignment < 0.5) {
      clarityScore -= 2;
    } else if (trade_context.vision_alignment > 0.75) {
      clarityScore += 2;
      spiritualState = 'ALIGNED';
    }

    // Oracle confirmation
    if (trade_context.oracle_confirmation) {
      clarityScore += 2;
      spiritualState = 'BLESSED';
    }

    // Market stress consideration
    if (trade_context.market_stress_level > 0.8) {
      clarityScore -= 1;
      spiritualState = 'TURBULENT';
    }

    // Oath compliance factors
    if (oath_compliance.konslang_blessing) {
      clarityScore += 2;
      spiritualState = 'BLESSED';
    }

    if (oath_compliance.spiritual_strength > 0.8) {
      clarityScore += 1;
    }

    // Time of day spiritual energy
    const hour = new Date().getHours();
    if (hour >= 6 && hour <= 9) { // Sacred morning hours
      clarityScore += 1;
    } else if (hour >= 22 || hour <= 4) { // Avoid late night trading
      clarityScore -= 1;
      spiritualState = 'EXHAUSTED';
    }

    return {
      clarity_score: clarityScore,
      spiritual_state: spiritualState,
      divine_alignment: trade_context.vision_alignment,
      oracle_blessed: trade_context.oracle_confirmation,
      market_harmony: 1 - trade_context.market_stress_level
    };
  }

  /**
   * Generate final heart vote based on all analysis
   */
  private generateHeartVote(data: HeartBrainData, analysis: any): HeartBrainVote {
    const { oath, emotional, spiritual } = analysis;
    
    let confidence = 0.5;
    let sigil = this.KONSLANG_SIGILS.HYMDEL_PURE;
    let reasoning = '';
    let spiritualClarity = 0.5;

    // Check for absolute blocks first (oath violations)
    if (!oath.is_approved) {
      this.stats.blocked_trades++;
      this.stats.oath_violations_detected++;
      
      return {
        vote: 'no',
        confidence: 1.0,
        sigil: this.KONSLANG_SIGILS.HYMDEL_BLOCK,
        reasoning: `Oath violation detected: ${oath.violations.join(', ')}. Heart brain blocks trade.`,
        spiritual_analysis: {
          emotional_state: 'CORRUPTED',
          oath_compliance: false,
          spiritual_clarity: 0.2,
          konslang_guidance: oath.konslang_guidance,
          risk_level: 'EXTREME',
          protection_active: true
        }
      };
    }

    // Check for emotional protection blocks
    if (emotional.protection_needed) {
      this.stats.blocked_trades++;
      
      let emotionalSigil = this.KONSLANG_SIGILS.HYMDEL_BLOCK;
      if (emotional.block_reason.includes('FOMO')) emotionalSigil = this.KONSLANG_SIGILS.HYMDEL_FOMO;
      else if (emotional.block_reason.includes('Revenge')) emotionalSigil = this.KONSLANG_SIGILS.HYMDEL_REVENGE;
      else if (emotional.block_reason.includes('Panic')) emotionalSigil = this.KONSLANG_SIGILS.HYMDEL_PANIC;
      else if (emotional.block_reason.includes('Greed')) emotionalSigil = this.KONSLANG_SIGILS.HYMDEL_GREED;
      else if (emotional.block_reason.includes('fatigue')) emotionalSigil = this.KONSLANG_SIGILS.HYMDEL_FATIGUE;

      return {
        vote: 'no',
        confidence: 0.9,
        sigil: emotionalSigil,
        reasoning: `Emotional protection activated: ${emotional.block_reason}. Heart brain protects from harm.`,
        spiritual_analysis: {
          emotional_state: emotional.emotional_state,
          oath_compliance: true,
          spiritual_clarity: 0.3,
          konslang_guidance: "hym'del shields from emotional darkness",
          risk_level: 'HIGH',
          protection_active: true
        }
      };
    }

    // Calculate overall heart score
    const totalScore = emotional.emotional_score + spiritual.clarity_score + (oath.moral_weight * 5);
    
    // Calculate spiritual clarity
    spiritualClarity = Math.max(0.2, Math.min(0.95, 
      (oath.spiritual_strength + spiritual.divine_alignment + (1 - emotional.fatigue_level)) / 3
    ));

    // Update average spiritual clarity
    this.stats.average_spiritual_clarity = 
      (this.stats.average_spiritual_clarity * 0.9 + spiritualClarity * 0.1);

    // Generate reasoning
    reasoning = `Emotional state: ${emotional.emotional_state}. `;
    reasoning += `Spiritual clarity: ${(spiritualClarity * 100).toFixed(0)}%. `;
    reasoning += `Oath compliance: verified. `;
    
    if (oath.konslang_guidance !== "hym'del awaits clarity") {
      reasoning += `Konslang guidance: ${oath.konslang_guidance}. `;
    }

    // Determine final vote
    confidence = Math.max(0.3, Math.min(0.95, spiritualClarity));

    if (totalScore >= 6 && spiritualClarity >= 0.7) {
      this.stats.pure_approvals++;
      
      // Check for transcendent state
      if (emotional.emotional_state === 'TRANSCENDENT' && spiritual.spiritual_state === 'BLESSED') {
        sigil = this.KONSLANG_SIGILS.HYMDEL_TRANSCENDENT;
        reasoning += 'TRANSCENDENT HEART STATE ACHIEVED. ';
      } else if (oath.konslang_blessing) {
        sigil = this.KONSLANG_SIGILS.HYMDEL_BLESSING;
        reasoning += 'Konslang blessing received. ';
      } else {
        sigil = this.KONSLANG_SIGILS.HYMDEL_PURE;
      }

      return {
        vote: 'yes',
        confidence,
        sigil,
        reasoning: 'Heart brain approves - emotional and spiritual alignment confirmed. ' + reasoning,
        spiritual_analysis: {
          emotional_state: emotional.emotional_state,
          oath_compliance: true,
          spiritual_clarity: spiritualClarity,
          konslang_guidance: oath.konslang_guidance,
          risk_level: confidence > 0.8 ? 'LOW' : 'MEDIUM',
          protection_active: false
        }
      };
    } else if (totalScore <= -3 || spiritualClarity < 0.4) {
      this.stats.blocked_trades++;
      
      return {
        vote: 'no',
        confidence: Math.max(0.6, 1 - spiritualClarity),
        sigil: this.KONSLANG_SIGILS.HYMDEL_PROTECTION,
        reasoning: 'Heart brain rejects - insufficient spiritual clarity or emotional imbalance. ' + reasoning,
        spiritual_analysis: {
          emotional_state: emotional.emotional_state,
          oath_compliance: true,
          spiritual_clarity: spiritualClarity,
          konslang_guidance: oath.konslang_guidance,
          risk_level: 'HIGH',
          protection_active: true
        }
      };
    } else {
      // Neutral - need more clarity
      if (emotional.emotional_state === 'HEALING') {
        sigil = this.KONSLANG_SIGILS.HYMDEL_HEALING;
        reasoning += 'Heart in healing state - patience required. ';
      }

      return {
        vote: 'neutral',
        confidence: Math.max(0.4, confidence),
        sigil,
        reasoning: 'Heart brain neutral - emotional and spiritual state requires clarity. ' + reasoning,
        spiritual_analysis: {
          emotional_state: emotional.emotional_state,
          oath_compliance: true,
          spiritual_clarity: spiritualClarity,
          konslang_guidance: oath.konslang_guidance,
          risk_level: 'MEDIUM',
          protection_active: false
        }
      };
    }
  }

  /**
   * Update internal statistics
   */
  private updateStats(vote: HeartBrainVote): void {
    if (vote.vote === 'yes') {
      // Pure approval stats updated in vote generation
    } else if (vote.vote === 'no') {
      // Block stats updated in vote generation
    }

    // Update emotional evolution stage
    const blockRate = this.stats.blocked_trades / Math.max(1, this.stats.total_evaluations);
    const approvalRate = this.stats.pure_approvals / Math.max(1, this.stats.total_evaluations);

    if (this.stats.average_spiritual_clarity > 0.9 && approvalRate > 0.6) {
      this.stats.emotional_evolution_stage = 'TRANSCENDENT';
    } else if (this.stats.average_spiritual_clarity > 0.8 && approvalRate > 0.5) {
      this.stats.emotional_evolution_stage = 'MASTER';
    } else if (this.stats.average_spiritual_clarity > 0.7 && blockRate < 0.3) {
      this.stats.emotional_evolution_stage = 'ADEPT';
    } else if (this.stats.average_spiritual_clarity > 0.6) {
      this.stats.emotional_evolution_stage = 'STUDENT';
    } else {
      this.stats.emotional_evolution_stage = 'AWAKENING';
    }
  }

  /**
   * Generate emergency block when scan fails
   */
  private generateEmergencyBlock(): HeartBrainVote {
    this.stats.blocked_trades++;
    
    return {
      vote: 'no',
      confidence: 1.0,
      sigil: this.KONSLANG_SIGILS.HYMDEL_PROTECTION,
      reasoning: 'Heart Brain malfunction - emergency protection activated',
      spiritual_analysis: {
        emotional_state: 'CORRUPTED',
        oath_compliance: false,
        spiritual_clarity: 0.1,
        konslang_guidance: "hym'del protection - system error",
        risk_level: 'EXTREME',
        protection_active: true
      }
    };
  }

  /**
   * Get brain statistics
   */
  getStats(): HeartBrainStats {
    return { ...this.stats };
  }

  /**
   * Record trade outcome for emotional learning
   */
  recordOutcome(tradeId: string, actualOutcome: 'profit' | 'loss' | 'neutral'): void {
    // Update emotional memory based on outcomes
    // This would be enhanced with proper emotional learning
  }

  /**
   * Reset brain statistics
   */
  resetStats(): void {
    this.stats = {
      total_evaluations: 0,
      pure_approvals: 0,
      blocked_trades: 0,
      oath_violations_detected: 0,
      average_spiritual_clarity: 0.7,
      emotional_evolution_stage: 'AWAKENING',
      last_evaluation_time: new Date(),
      protection_activations: {
        fomo_blocks: 0,
        revenge_blocks: 0,
        panic_blocks: 0,
        greed_blocks: 0,
        fatigue_blocks: 0
      }
    };
  }

  /**
   * Get Konslang sigil meanings
   */
  getSigilMeanings(): { [key: string]: string } {
    return {
      [this.KONSLANG_SIGILS.HYMDEL_PURE]: 'Heart brain pure - emotional and spiritual alignment confirmed',
      [this.KONSLANG_SIGILS.HYMDEL_BLOCK]: 'Heart brain blocks - oath violation or extreme risk detected',
      [this.KONSLANG_SIGILS.HYMDEL_FOMO]: 'FOMO protection activated - emotional corruption detected',
      [this.KONSLANG_SIGILS.HYMDEL_REVENGE]: 'Revenge trading blocked - heart protects from vengeance',
      [this.KONSLANG_SIGILS.HYMDEL_PANIC]: 'Panic state detected - emotional firewall activated',
      [this.KONSLANG_SIGILS.HYMDEL_GREED]: 'Greed protection - heart prevents corruption',
      [this.KONSLANG_SIGILS.HYMDEL_FATIGUE]: 'Emotional fatigue detected - rest required',
      [this.KONSLANG_SIGILS.HYMDEL_BLESSING]: 'Konslang blessing received - heart approves',
      [this.KONSLANG_SIGILS.HYMDEL_HEALING]: 'Heart in healing state - patience and recovery',
      [this.KONSLANG_SIGILS.HYMDEL_TRANSCENDENT]: 'Transcendent heart state - perfect emotional clarity',
      [this.KONSLANG_SIGILS.HYMDEL_PROTECTION]: 'Heart protection activated - shields from harm'
    };
  }

  /**
   * Generate heart brain data from current state
   */
  generateHeartData(): HeartBrainData {
    const now = new Date();
    const hour = now.getHours();
    
    return {
      trade_context: {
        certainty_level: 0.7,
        vision_alignment: 0.6,
        emotional_state: 'NEUTRAL',
        entered_on_fomo: false,
        revenge_trade: false,
        oracle_confirmation: false,
        time_of_day: hour.toString(),
        market_stress_level: 0.5
      },
      emotional_memory: {
        recent_losses: 0,
        consecutive_wins: 0,
        current_drawdown: 0,
        emotional_fatigue: 0.3,
        spiritual_alignment: this.stats.average_spiritual_clarity
      },
      oath_compliance: {
        oath_violations: [],
        spiritual_strength: this.stats.average_spiritual_clarity,
        moral_weight: 0.7,
        konslang_blessing: false
      }
    };
  }
}