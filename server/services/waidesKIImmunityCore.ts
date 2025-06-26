/**
 * STEP 48: Waides KI Immunity Core (WAIS)
 * Biological-like immunity system that learns from trading losses
 * Creates pattern antibodies to block harmful setups automatically
 */

import { waidesKIPatternDNASequencer, type PatternDNA } from './waidesKIPatternDNASequencer.js';

interface PatternAntibody {
  pattern_dna: string;
  loss_count: number;
  total_loss_amount: number;
  first_loss_date: Date;
  last_loss_date: Date;
  severity_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  konslang_echo: string;
  pattern_family: string;
  immunity_strength: number; // 0-100, higher = stronger immunity
  notes: string[];
}

export interface ImmuneResponse {
  is_immune: boolean;
  antibody?: PatternAntibody;
  immune_strength: number;
  konslang_warning: string;
  recommended_action: 'BLOCK' | 'WARN' | 'ALLOW';
  pattern_dna: string;
}

interface ImmunityStats {
  total_antibodies: number;
  active_immunities: number;
  total_losses_prevented: number;
  immunity_effectiveness: number;
  strongest_antibody: string;
  weakest_immunity: string;
  recent_blocks: number;
  pattern_families: Record<string, number>;
}

export class WaidesKIImmunityCore {
  private antibodies: Map<string, PatternAntibody> = new Map();
  private immunityThresholds = {
    MIN_LOSSES_FOR_IMMUNITY: 2,
    MIN_LOSS_AMOUNT: 100,
    IMMUNITY_DECAY_DAYS: 30,
    CRITICAL_LOSS_THRESHOLD: 1000
  };

  private konslangEchoes = {
    'sar\'tan': 'Wound remembered',
    'shakar': 'Cycle broken', 
    'el\'darion': 'Pattern of death',
    'lythal': 'Not again',
    'mor\'thak': 'Shadow of loss',
    'vel\'karan': 'Forbidden path',
    'zeth\'mor': 'Memory of pain',
    'tal\'vex': 'Curse learned'
  };

  /**
   * Register a trading loss to create or strengthen immunity
   */
  registerLoss(indicators: any, loss_amount: number, context: string = ''): PatternAntibody {
    const pattern_data = waidesKIPatternDNASequencer.sequence(indicators);
    const pattern_dna = pattern_data.dna_string;
    const existing_antibody = this.antibodies.get(pattern_dna);

    if (existing_antibody) {
      // Strengthen existing antibody
      existing_antibody.loss_count++;
      existing_antibody.total_loss_amount += loss_amount;
      existing_antibody.last_loss_date = new Date();
      existing_antibody.immunity_strength = this.calculateImmunityStrength(existing_antibody);
      existing_antibody.severity_level = this.calculateSeverityLevel(existing_antibody);
      existing_antibody.notes.push(`Loss #${existing_antibody.loss_count}: $${loss_amount} - ${context}`);
      
      console.log(`🛡️ Strengthened antibody for pattern: ${pattern_dna} (${existing_antibody.loss_count} losses)`);
      return existing_antibody;
    } else {
      // Create new antibody
      const konslang_echo = this.selectKonslangEcho(pattern_data);
      const new_antibody: PatternAntibody = {
        pattern_dna,
        loss_count: 1,
        total_loss_amount: loss_amount,
        first_loss_date: new Date(),
        last_loss_date: new Date(),
        severity_level: this.calculateSeverityLevel({ total_loss_amount: loss_amount, loss_count: 1 } as PatternAntibody),
        konslang_echo,
        pattern_family: waidesKIPatternDNASequencer.getPatternFamily(pattern_data),
        immunity_strength: this.calculateImmunityStrength({ loss_count: 1, total_loss_amount: loss_amount } as PatternAntibody),
        notes: [`Initial loss: $${loss_amount} - ${context}`]
      };

      this.antibodies.set(pattern_dna, new_antibody);
      console.log(`⚠️ New antibody created for pattern: ${pattern_dna} - ${konslang_echo}`);
      return new_antibody;
    }
  }

  /**
   * Check if pattern triggers immunity response
   */
  checkImmunity(indicators: any): ImmuneResponse {
    const pattern_data = waidesKIPatternDNASequencer.sequence(indicators);
    const pattern_dna = pattern_data.dna_string;
    const antibody = this.antibodies.get(pattern_dna);

    if (!antibody) {
      return {
        is_immune: false,
        immune_strength: 0,
        konslang_warning: '',
        recommended_action: 'ALLOW',
        pattern_dna
      };
    }

    // Check if immunity has decayed
    const days_since_loss = (Date.now() - antibody.last_loss_date.getTime()) / (1000 * 60 * 60 * 24);
    if (days_since_loss > this.immunityThresholds.IMMUNITY_DECAY_DAYS) {
      return {
        is_immune: false,
        antibody,
        immune_strength: 0,
        konslang_warning: 'Ancient wound, immunity faded',
        recommended_action: 'WARN',
        pattern_dna
      };
    }

    // Check immunity thresholds
    const is_immune = antibody.loss_count >= this.immunityThresholds.MIN_LOSSES_FOR_IMMUNITY ||
                     antibody.total_loss_amount >= this.immunityThresholds.CRITICAL_LOSS_THRESHOLD;

    if (is_immune) {
      return {
        is_immune: true,
        antibody,
        immune_strength: antibody.immunity_strength,
        konslang_warning: `${antibody.konslang_echo} - Pattern blocked by immunity`,
        recommended_action: antibody.severity_level === 'CRITICAL' ? 'BLOCK' : 'WARN',
        pattern_dna
      };
    }

    return {
      is_immune: false,
      antibody,
      immune_strength: antibody.immunity_strength,
      konslang_warning: `Partial immunity: ${antibody.konslang_echo}`,
      recommended_action: 'WARN',
      pattern_dna
    };
  }

  /**
   * Check for similar pattern immunity (fuzzy matching)
   */
  checkSimilarPatternImmunity(indicators: any, similarity_threshold: number = 0.8): ImmuneResponse {
    const pattern_data = waidesKIPatternDNASequencer.sequence(indicators);
    const pattern_dna = pattern_data.dna_string;

    for (const [stored_dna, antibody] of this.antibodies) {
      if (waidesKIPatternDNASequencer.areSimilarPatterns(pattern_dna, stored_dna, similarity_threshold)) {
        const days_since_loss = (Date.now() - antibody.last_loss_date.getTime()) / (1000 * 60 * 60 * 24);
        
        if (days_since_loss <= this.immunityThresholds.IMMUNITY_DECAY_DAYS && 
            antibody.loss_count >= this.immunityThresholds.MIN_LOSSES_FOR_IMMUNITY) {
          return {
            is_immune: true,
            antibody,
            immune_strength: antibody.immunity_strength * 0.8, // Reduced for similar patterns
            konslang_warning: `Similar pattern detected: ${antibody.konslang_echo}`,
            recommended_action: 'WARN',
            pattern_dna
          };
        }
      }
    }

    return {
      is_immune: false,
      immune_strength: 0,
      konslang_warning: '',
      recommended_action: 'ALLOW',
      pattern_dna
    };
  }

  /**
   * Get all active antibodies
   */
  getAllAntibodies(): PatternAntibody[] {
    return Array.from(this.antibodies.values());
  }

  /**
   * Get immunity statistics
   */
  getImmunityStats(): ImmunityStats {
    const antibodies = this.getAllAntibodies();
    const active_immunities = antibodies.filter(ab => {
      const days_since_loss = (Date.now() - ab.last_loss_date.getTime()) / (1000 * 60 * 60 * 24);
      return days_since_loss <= this.immunityThresholds.IMMUNITY_DECAY_DAYS && 
             ab.loss_count >= this.immunityThresholds.MIN_LOSSES_FOR_IMMUNITY;
    });

    const pattern_families: Record<string, number> = {};
    antibodies.forEach(ab => {
      pattern_families[ab.pattern_family] = (pattern_families[ab.pattern_family] || 0) + 1;
    });

    const strongest_antibody = antibodies.reduce((strongest, current) => 
      current.immunity_strength > strongest.immunity_strength ? current : strongest,
      antibodies[0] || { immunity_strength: 0, konslang_echo: 'none' } as PatternAntibody
    );

    const weakest_immunity = active_immunities.reduce((weakest, current) =>
      current.immunity_strength < weakest.immunity_strength ? current : weakest,
      active_immunities[0] || { immunity_strength: 100, konslang_echo: 'none' } as PatternAntibody
    );

    return {
      total_antibodies: antibodies.length,
      active_immunities: active_immunities.length,
      total_losses_prevented: this.calculateLossesPrevented(),
      immunity_effectiveness: this.calculateImmunityEffectiveness(),
      strongest_antibody: strongest_antibody.konslang_echo,
      weakest_immunity: weakest_immunity.konslang_echo,
      recent_blocks: this.countRecentBlocks(),
      pattern_families
    };
  }

  /**
   * Manually inject antibody for specific pattern
   */
  injectAntibody(pattern_dna: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', reason: string): void {
    const konslang_echo = Object.keys(this.konslangEchoes)[Math.floor(Math.random() * Object.keys(this.konslangEchoes).length)];
    
    const injected_antibody: PatternAntibody = {
      pattern_dna,
      loss_count: severity === 'CRITICAL' ? 5 : severity === 'HIGH' ? 3 : 2,
      total_loss_amount: severity === 'CRITICAL' ? 2000 : severity === 'HIGH' ? 1000 : 500,
      first_loss_date: new Date(),
      last_loss_date: new Date(),
      severity_level: severity,
      konslang_echo,
      pattern_family: 'MANUAL_INJECTION',
      immunity_strength: severity === 'CRITICAL' ? 100 : severity === 'HIGH' ? 80 : 60,
      notes: [`Manual injection: ${reason}`]
    };

    this.antibodies.set(pattern_dna, injected_antibody);
    console.log(`💉 Manually injected antibody: ${pattern_dna} - ${konslang_echo}`);
  }

  /**
   * Purge old or weak antibodies
   */
  purgeOldAntibodies(): number {
    let purged = 0;
    const cutoff_date = new Date(Date.now() - this.immunityThresholds.IMMUNITY_DECAY_DAYS * 24 * 60 * 60 * 1000);

    for (const [pattern_dna, antibody] of this.antibodies) {
      if (antibody.last_loss_date < cutoff_date && antibody.immunity_strength < 30) {
        this.antibodies.delete(pattern_dna);
        purged++;
        console.log(`🧹 Purged old antibody: ${pattern_dna}`);
      }
    }

    return purged;
  }

  /**
   * Reset all immunity data (emergency use only)
   */
  resetImmunity(): void {
    this.antibodies.clear();
    console.log('⚡ All immunity data reset');
  }

  // Private helper methods

  private calculateImmunityStrength(antibody: PatternAntibody): number {
    const loss_factor = Math.min(antibody.loss_count * 20, 60);
    const amount_factor = Math.min(antibody.total_loss_amount / 50, 30);
    const recency_factor = this.calculateRecencyFactor(antibody.last_loss_date);
    
    return Math.min(loss_factor + amount_factor + recency_factor, 100);
  }

  private calculateSeverityLevel(antibody: PatternAntibody): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (antibody.total_loss_amount >= this.immunityThresholds.CRITICAL_LOSS_THRESHOLD || antibody.loss_count >= 5) {
      return 'CRITICAL';
    }
    if (antibody.total_loss_amount >= 500 || antibody.loss_count >= 3) {
      return 'HIGH';
    }
    if (antibody.total_loss_amount >= 200 || antibody.loss_count >= 2) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  private calculateRecencyFactor(last_loss_date: Date): number {
    if (!last_loss_date) return 0.5; // Default factor if no date
    const days_ago = (Date.now() - last_loss_date.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 10 - days_ago);
  }

  private selectKonslangEcho(pattern_data: PatternDNA): string {
    const echoes = Object.keys(this.konslangEchoes);
    
    // Select echo based on pattern characteristics
    if (pattern_data.pattern_type === 'VOLATILE') return 'mor\'thak';
    if (pattern_data.complexity_score > 80) return 'el\'darion';
    if (pattern_data.pattern_type === 'BEARISH') return 'zeth\'mor';
    
    return echoes[Math.floor(Math.random() * echoes.length)];
  }

  private calculateLossesPrevented(): number {
    // This would track actual prevented losses in a real implementation
    return this.getAllAntibodies().reduce((total, ab) => total + ab.total_loss_amount * 0.5, 0);
  }

  private calculateImmunityEffectiveness(): number {
    const active_antibodies = this.getAllAntibodies().filter(ab => {
      const days_since_loss = (Date.now() - ab.last_loss_date.getTime()) / (1000 * 60 * 60 * 24);
      return days_since_loss <= this.immunityThresholds.IMMUNITY_DECAY_DAYS;
    });

    if (active_antibodies.length === 0) return 0;
    
    const avg_strength = active_antibodies.reduce((sum, ab) => sum + ab.immunity_strength, 0) / active_antibodies.length;
    return Math.round(avg_strength);
  }

  private countRecentBlocks(): number {
    const recent_cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    return this.getAllAntibodies().filter(ab => ab.last_loss_date > recent_cutoff).length;
  }
}

// Export singleton instance
export const waidesKIImmunityCore = new WaidesKIImmunityCore();