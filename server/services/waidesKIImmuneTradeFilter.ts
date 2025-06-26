/**
 * STEP 48: Waides KI Immune Trade Filter
 * Injects immunity check into trading decisions before execution
 * Creates biological-like protection layer against harmful patterns
 */

import { waidesKIImmunityCore, type ImmuneResponse } from './waidesKIImmunityCore.js';
import { waidesKIPatternDNASequencer } from './waidesKIPatternDNASequencer.js';

interface TradeDecision {
  action: 'BUY' | 'SELL' | 'HOLD' | 'BLOCKED';
  confidence: number;
  reasoning: string;
  pattern_dna?: string;
  immune_status?: ImmuneResponse;
  konslang_warning?: string;
  safety_override?: boolean;
}

interface TradingContext {
  indicators: any;
  market_conditions: any;
  vision_data?: any;
  heart_assessment?: any;
  emergency_override?: boolean;
}

export class WaidesKIImmuneTradeFilter {
  private blockedPatterns: Set<string> = new Set();
  private lastImmunityCheck: Date = new Date();
  private immunityBypassCode: string = '';

  /**
   * Perform immune check before any trading decision
   */
  immuneCheck(context: TradingContext): TradeDecision {
    try {
      // Extract indicators for pattern analysis
      const { indicators } = context;
      
      // Generate pattern DNA
      const pattern_data = waidesKIPatternDNASequencer.sequence(indicators);
      const pattern_dna = pattern_data.dna_string;

      // Check for direct immunity
      const immune_response = waidesKIImmunityCore.checkImmunity(indicators);
      
      // Check for similar pattern immunity (fuzzy matching)
      const similar_immunity = waidesKIImmunityCore.checkSimilarPatternImmunity(indicators, 0.75);

      // Emergency override check
      if (context.emergency_override && this.validateEmergencyOverride()) {
        return {
          action: 'HOLD',
          confidence: 50,
          reasoning: 'Emergency override activated - immunity bypassed',
          pattern_dna,
          immune_status: immune_response,
          konslang_warning: 'Emergency bypass active',
          safety_override: true
        };
      }

      // Primary immunity check
      if (immune_response.is_immune && immune_response.recommended_action === 'BLOCK') {
        this.blockedPatterns.add(pattern_dna);
        
        return {
          action: 'BLOCKED',
          confidence: 0,
          reasoning: `Immune system blocked trade - ${immune_response.konslang_warning}`,
          pattern_dna,
          immune_status: immune_response,
          konslang_warning: immune_response.konslang_warning,
          safety_override: false
        };
      }

      // Similar pattern immunity check
      if (similar_immunity.is_immune) {
        return {
          action: 'BLOCKED',
          confidence: 0,
          reasoning: `Similar pattern immunity triggered - ${similar_immunity.konslang_warning}`,
          pattern_dna,
          immune_status: similar_immunity,
          konslang_warning: similar_immunity.konslang_warning,
          safety_override: false
        };
      }

      // Warning level immunity
      if (immune_response.recommended_action === 'WARN') {
        return {
          action: 'HOLD',
          confidence: Math.max(20, 100 - immune_response.immune_strength),
          reasoning: `Immunity warning - proceed with extreme caution`,
          pattern_dna,
          immune_status: immune_response,
          konslang_warning: immune_response.konslang_warning || 'Partial immunity detected',
          safety_override: false
        };
      }

      // Pattern cleared - allow trade decision to proceed
      this.lastImmunityCheck = new Date();
      
      return {
        action: 'HOLD', // Neutral - let other systems decide
        confidence: 100,
        reasoning: 'Pattern cleared by immune system',
        pattern_dna,
        immune_status: immune_response,
        konslang_warning: '',
        safety_override: false
      };

    } catch (error) {
      console.error('Error in immune trade filter:', error);
      
      // Fail-safe: block trade on system error
      return {
        action: 'BLOCKED',
        confidence: 0,
        reasoning: 'Immune system error - trade blocked for safety',
        konslang_warning: 'System protection activated',
        safety_override: false
      };
    }
  }

  /**
   * Record trade loss to strengthen immunity
   */
  recordTradeLoss(indicators: any, loss_amount: number, context: string): void {
    try {
      const antibody = waidesKIImmunityCore.registerLoss(indicators, loss_amount, context);
      console.log(`🛡️ Immunity strengthened: ${antibody.konslang_echo} (${antibody.loss_count} losses)`);
    } catch (error) {
      console.error('Error recording trade loss for immunity:', error);
    }
  }

  /**
   * Check if pattern is currently blocked
   */
  isPatternBlocked(indicators: any): boolean {
    const pattern_data = waidesKIPatternDNASequencer.sequence(indicators);
    return this.blockedPatterns.has(pattern_data.dna_string);
  }

  /**
   * Get immunity status for pattern
   */
  getImmunityStatus(indicators: any): ImmuneResponse {
    return waidesKIImmunityCore.checkImmunity(indicators);
  }

  /**
   * Get all active antibodies
   */
  getActiveAntibodies() {
    return waidesKIImmunityCore.getAllAntibodies();
  }

  /**
   * Get immunity statistics
   */
  getImmunityStats() {
    return waidesKIImmunityCore.getImmunityStats();
  }

  /**
   * Manually inject antibody for dangerous pattern
   */
  injectAntibody(pattern_dna: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', reason: string): void {
    waidesKIImmunityCore.injectAntibody(pattern_dna, severity, reason);
    this.blockedPatterns.add(pattern_dna);
    console.log(`💉 Manual antibody injection: ${pattern_dna}`);
  }

  /**
   * Emergency immunity reset (use with extreme caution)
   */
  emergencyImmunityReset(authorization_code: string): boolean {
    if (authorization_code !== 'RESET_IMMUNITY_EMERGENCY_2025') {
      console.log('⚠️ Unauthorized immunity reset attempt');
      return false;
    }

    waidesKIImmunityCore.resetImmunity();
    this.blockedPatterns.clear();
    this.immunityBypassCode = '';
    
    console.log('⚡ EMERGENCY: All immunity data reset');
    return true;
  }

  /**
   * Purge old antibodies to prevent immunity system from becoming too restrictive
   */
  performImmunityMaintenance(): number {
    const purged = waidesKIImmunityCore.purgeOldAntibodies();
    
    // Clear blocked patterns that no longer have active antibodies
    const active_antibodies = waidesKIImmunityCore.getAllAntibodies();
    const active_patterns = new Set(active_antibodies.map(ab => ab.pattern_dna));
    
    for (const blocked_pattern of this.blockedPatterns) {
      if (!active_patterns.has(blocked_pattern)) {
        this.blockedPatterns.delete(blocked_pattern);
      }
    }

    if (purged > 0) {
      console.log(`🧹 Immunity maintenance: purged ${purged} old antibodies`);
    }

    return purged;
  }

  /**
   * Generate immunity report for debugging
   */
  generateImmunityReport(): any {
    const stats = this.getImmunityStats();
    const antibodies = this.getActiveAntibodies();
    
    return {
      summary: {
        total_antibodies: stats.total_antibodies,
        active_immunities: stats.active_immunities,
        blocked_patterns: this.blockedPatterns.size,
        last_check: this.lastImmunityCheck,
        effectiveness: stats.immunity_effectiveness
      },
      antibodies: antibodies.map(ab => ({
        pattern: ab.pattern_dna,
        losses: ab.loss_count,
        amount: ab.total_loss_amount,
        severity: ab.severity_level,
        konslang: ab.konslang_echo,
        strength: ab.immunity_strength
      })),
      pattern_families: stats.pattern_families,
      recent_activity: {
        recent_blocks: stats.recent_blocks,
        losses_prevented: stats.total_losses_prevented
      }
    };
  }

  /**
   * Validate emergency override authorization
   */
  private validateEmergencyOverride(): boolean {
    // In production, this would check proper authorization
    // For demo, we'll allow emergency overrides during development
    return true;
  }

  /**
   * Get pattern risk assessment
   */
  assessPatternRisk(indicators: any): {
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    immunity_factor: number;
    recommendation: string;
  } {
    const immune_response = this.getImmunityStatus(indicators);
    const pattern_data = waidesKIPatternDNASequencer.sequence(indicators);
    
    let risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let recommendation = 'Pattern appears safe for trading';

    if (immune_response.is_immune) {
      risk_level = immune_response.antibody?.severity_level || 'HIGH';
      recommendation = `High risk pattern - ${immune_response.konslang_warning}`;
    } else if (immune_response.immune_strength > 50) {
      risk_level = 'MEDIUM';
      recommendation = 'Moderate risk - pattern has some immunity history';
    } else if (pattern_data.complexity_score > 80) {
      risk_level = 'MEDIUM';
      recommendation = 'Complex pattern - proceed with caution';
    }

    return {
      risk_level,
      immunity_factor: immune_response.immune_strength,
      recommendation
    };
  }
}

// Export singleton instance
export const waidesKIImmuneTradeFilter = new WaidesKIImmuneTradeFilter();