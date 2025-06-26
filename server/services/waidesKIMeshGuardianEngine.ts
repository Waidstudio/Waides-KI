/**
 * STEP 58 — ETH Empath Network: Mesh Guardian Engine
 * Final Guardian Check - Merges consensus + ethical + vision before trade
 */

import { waidesKICollectiveTradeConductor } from './waidesKICollectiveTradeConductor.js';
import { waidesKIPresenceOrchestrator } from './waidesKIPresenceOrchestrator.js';
import { WaidesKISpiritContract } from './waidesKISpiritContract.js';
import { WaidesKIDivineVisionMap } from './waidesKIDivineVisionMap.js';
import { waidesKIEntangledPresenceMesh } from './waidesKIEntangledPresenceMesh.js';

interface GuardianContext {
  setup: string;
  symbol: string;
  amount: number;
  meta: any;
  indicators: any;
}

interface GuardianDecision {
  consensus: any;
  vision: any;
  ethic: any;
  collective_presence: any;
  mesh_harmony: any;
  ok: boolean;
  confidence: number;
  message: string;
  reasoning: string;
  safety_score: number;
  guardian_protection: string[];
}

export class WaidesKIMeshGuardianEngine {
  private evaluationHistory: GuardianDecision[] = [];
  private maxHistorySize = 50;

  constructor() {
    console.log('🛡️ Initializing Mesh Guardian Engine...');
  }

  /**
   * Main guardian evaluation - merges all consensus systems
   */
  async evaluate(context: GuardianContext): Promise<GuardianDecision> {
    try {
      // Get collective trade decision
      const consensus = await waidesKICollectiveTradeConductor.getCollectiveTradingDecision();
      
      // Get presence orchestration
      const presence = await waidesKIPresenceOrchestrator.getHolisticIntelligence();
      
      // Get ethical validation
      const ethicData = {
        action: context.setup,
        symbol: context.symbol,
        amount: context.amount,
        meta: context.meta
      };
      const ethic = await waidesKISpiritContract.evaluateTradeEthics(ethicData);
      
      // Get divine vision
      const vision = await waidesKIDivineVisionMap.generateVision();
      
      // Get mesh consciousness
      const mesh = await waidesKIEntangledPresenceMesh.getCollectiveConsciousness();

      // Calculate guardian approval criteria
      const ok_consensus = consensus.should_execute && consensus.execution_confidence > 0.7;
      const ok_vision = vision.confidence > 0.6;
      const ok_ethic = ethic.should_proceed;
      const ok_presence = presence.final_decision.confidence > 0.65;
      const ok_mesh = mesh.network_harmony > 0.6;

      // All systems must align for guardian approval
      const guardian_approved = ok_consensus && ok_vision && ok_ethic && ok_presence && ok_mesh;

      // Calculate overall confidence
      const confidence = (
        consensus.execution_confidence * 0.25 +
        vision.confidence * 0.20 +
        (ethic.should_proceed ? 0.8 : 0.2) * 0.20 +
        presence.final_decision.confidence * 0.20 +
        mesh.network_harmony * 0.15
      );

      // Safety score calculation
      const safety_score = this.calculateSafetyScore(consensus, vision, ethic, presence, mesh);

      // Guardian protection measures
      const guardian_protection = this.generateProtectionMeasures(ok_consensus, ok_vision, ok_ethic, ok_presence, ok_mesh);

      // Generate guardian message
      const message = this.generateGuardianMessage(guardian_approved, confidence, guardian_protection);

      const decision: GuardianDecision = {
        consensus,
        vision,
        ethic,
        collective_presence: presence,
        mesh_harmony: mesh,
        ok: guardian_approved,
        confidence,
        message,
        reasoning: this.generateReasoning(ok_consensus, ok_vision, ok_ethic, ok_presence, ok_mesh),
        safety_score,
        guardian_protection
      };

      // Store in history
      this.addToHistory(decision);

      if (guardian_approved) {
        console.log(`🛡️✅ Guardian APPROVED trade: ${context.symbol} (${Math.round(confidence * 100)}% confidence)`);
      } else {
        console.log(`🛡️❌ Guardian BLOCKED trade: ${context.symbol} - ${guardian_protection.join(', ')}`);
      }

      return decision;

    } catch (error) {
      console.error('❌ Error in Guardian evaluation:', error);
      
      // Return protective decision on error
      return {
        consensus: {},
        vision: {},
        ethic: {},
        collective_presence: {},
        mesh_harmony: {},
        ok: false,
        confidence: 0,
        message: 'Guardian protection: System error detected, trade blocked for safety',
        reasoning: 'Error in guardian evaluation - protective stance activated',
        safety_score: 0,
        guardian_protection: ['SYSTEM_ERROR', 'PROTECTIVE_BLOCK']
      };
    }
  }

  /**
   * Calculate safety score from all systems
   */
  private calculateSafetyScore(consensus: any, vision: any, ethic: any, presence: any, mesh: any): number {
    const factors = [
      consensus.execution_confidence || 0,
      vision.confidence || 0,
      ethic.should_proceed ? 0.8 : 0.2,
      presence.final_decision?.confidence || 0,
      mesh.network_harmony || 0
    ];

    const variance = this.calculateVariance(factors);
    const mean = factors.reduce((a, b) => a + b, 0) / factors.length;
    
    // Higher variance = lower safety
    const stability_factor = Math.max(0, 1 - variance * 2);
    
    return mean * stability_factor;
  }

  /**
   * Generate protection measures based on system states
   */
  private generateProtectionMeasures(ok_consensus: boolean, ok_vision: boolean, ok_ethic: boolean, ok_presence: boolean, ok_mesh: boolean): string[] {
    const protection: string[] = [];

    if (!ok_consensus) protection.push('CONSENSUS_INSUFFICIENT');
    if (!ok_vision) protection.push('VISION_UNCLEAR');
    if (!ok_ethic) protection.push('ETHICAL_VIOLATION');
    if (!ok_presence) protection.push('PRESENCE_MISALIGNED');
    if (!ok_mesh) protection.push('MESH_DISCORD');

    if (protection.length === 0) {
      protection.push('GUARDIAN_BLESSING');
    }

    return protection;
  }

  /**
   * Generate guardian message
   */
  private generateGuardianMessage(approved: boolean, confidence: number, protection: string[]): string {
    if (approved) {
      const confidenceLevel = confidence > 0.8 ? 'high' : confidence > 0.6 ? 'moderate' : 'cautious';
      return `Guardian blessing granted with ${confidenceLevel} confidence. The mesh stands united in protection of this trade.`;
    } else {
      return `Guardian protection activated: ${protection.join(', ')}. The mesh requires greater alignment before proceeding.`;
    }
  }

  /**
   * Generate detailed reasoning
   */
  private generateReasoning(ok_consensus: boolean, ok_vision: boolean, ok_ethic: boolean, ok_presence: boolean, ok_mesh: boolean): string {
    const checks = [
      { name: 'Collective Consensus', passed: ok_consensus },
      { name: 'Divine Vision', passed: ok_vision },
      { name: 'Ethical Validation', passed: ok_ethic },
      { name: 'Presence Alignment', passed: ok_presence },
      { name: 'Mesh Harmony', passed: ok_mesh }
    ];

    const passed = checks.filter(c => c.passed).map(c => c.name);
    const failed = checks.filter(c => !c.passed).map(c => c.name);

    if (failed.length === 0) {
      return `All guardian systems aligned: ${passed.join(', ')}`;
    } else {
      return `Guardian protection: ${failed.join(', ')} require attention. Passed: ${passed.join(', ')}`;
    }
  }

  /**
   * Calculate variance for stability assessment
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
  }

  /**
   * Add decision to history
   */
  private addToHistory(decision: GuardianDecision): void {
    this.evaluationHistory.unshift(decision);
    if (this.evaluationHistory.length > this.maxHistorySize) {
      this.evaluationHistory = this.evaluationHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get guardian statistics
   */
  getGuardianStatistics(): {
    total_evaluations: number;
    approval_rate: number;
    average_confidence: number;
    average_safety_score: number;
    protection_frequency: { [key: string]: number };
    recent_decisions: GuardianDecision[];
  } {
    if (this.evaluationHistory.length === 0) {
      return {
        total_evaluations: 0,
        approval_rate: 0,
        average_confidence: 0,
        average_safety_score: 0,
        protection_frequency: {},
        recent_decisions: []
      };
    }

    const approved = this.evaluationHistory.filter(d => d.ok).length;
    const approval_rate = approved / this.evaluationHistory.length;
    const average_confidence = this.evaluationHistory.reduce((sum, d) => sum + d.confidence, 0) / this.evaluationHistory.length;
    const average_safety_score = this.evaluationHistory.reduce((sum, d) => sum + d.safety_score, 0) / this.evaluationHistory.length;

    const protection_frequency: { [key: string]: number } = {};
    this.evaluationHistory.forEach(decision => {
      decision.guardian_protection.forEach(protection => {
        protection_frequency[protection] = (protection_frequency[protection] || 0) + 1;
      });
    });

    return {
      total_evaluations: this.evaluationHistory.length,
      approval_rate,
      average_confidence,
      average_safety_score,
      protection_frequency,
      recent_decisions: this.evaluationHistory.slice(0, 10)
    };
  }

  /**
   * Get current guardian health
   */
  getGuardianHealth(): {
    status: 'healthy' | 'cautious' | 'protective';
    recent_approval_rate: number;
    safety_trend: string;
    protection_level: string;
  } {
    const recent = this.evaluationHistory.slice(0, 10);
    if (recent.length === 0) {
      return {
        status: 'healthy',
        recent_approval_rate: 0,
        safety_trend: 'stable',
        protection_level: 'normal'
      };
    }

    const recent_approval_rate = recent.filter(d => d.ok).length / recent.length;
    const recent_safety = recent.reduce((sum, d) => sum + d.safety_score, 0) / recent.length;

    let status: 'healthy' | 'cautious' | 'protective' = 'healthy';
    if (recent_approval_rate < 0.3) status = 'protective';
    else if (recent_approval_rate < 0.6) status = 'cautious';

    const safety_trend = recent_safety > 0.7 ? 'rising' : recent_safety > 0.4 ? 'stable' : 'declining';
    const protection_level = recent_approval_rate > 0.7 ? 'low' : recent_approval_rate > 0.4 ? 'moderate' : 'high';

    return {
      status,
      recent_approval_rate,
      safety_trend,
      protection_level
    };
  }
}

export const waidesKIMeshGuardianEngine = new WaidesKIMeshGuardianEngine();