/**
 * STEP 43: Waides KI Healing Glyphs
 * Sacred Konslang injection system for spiritual recovery and energy restoration
 */

interface HealingGlyph {
  glyph: string;
  time: string;
  healing_power: number;
  target_system: string;
  activation_duration_hours: number;
  spiritual_frequency: number;
  konslang_root: string;
}

interface GlyphActivation {
  glyph_id: string;
  activated_at: string;
  expires_at: string;
  current_power: number;
  target_achieved: boolean;
  effects_observed: string[];
}

interface HealingSequence {
  sequence_id: string;
  glyphs: HealingGlyph[];
  total_healing_power: number;
  duration_minutes: number;
  activation_pattern: 'SEQUENTIAL' | 'PARALLEL' | 'SPIRAL' | 'PULSE';
  completion_status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'INTERRUPTED';
}

export class WaidesKIHealingGlyphs {
  private glyphChain: HealingGlyph[] = [];
  private activeGlyphs: Map<string, GlyphActivation> = new Map();
  private healingSequences: Map<string, HealingSequence> = new Map();
  private maxChainSize = 200;

  private readonly SACRED_GLYPHS = {
    // Core Healing Glyphs
    'mind.clear': {
      healing_power: 25,
      target_system: 'cognitive_clarity',
      duration_hours: 2,
      frequency: 432,
      konslang_root: 'SHAI\'LOR'
    },
    'flow.restore': {
      healing_power: 30,
      target_system: 'spiritual_flow',
      duration_hours: 4,
      frequency: 528,
      konslang_root: 'MEL\'ZEK'
    },
    'vision.clarify': {
      healing_power: 20,
      target_system: 'predictive_vision',
      duration_hours: 3,
      frequency: 741,
      konslang_root: 'THALAR'
    },
    'balance.return': {
      healing_power: 35,
      target_system: 'emotional_balance',
      duration_hours: 6,
      frequency: 396,
      konslang_root: 'AL\'MIR'
    },
    'wisdom.strengthen': {
      healing_power: 40,
      target_system: 'decision_wisdom',
      duration_hours: 8,
      frequency: 852,
      konslang_root: 'KORVEX'
    },
    // Advanced Healing Glyphs
    'corruption.purge': {
      healing_power: 50,
      target_system: 'memory_purification',
      duration_hours: 1,
      frequency: 963,
      konslang_root: 'ZUNTH'
    },
    'energy.amplify': {
      healing_power: 45,
      target_system: 'spiritual_energy',
      duration_hours: 12,
      frequency: 639,
      konslang_root: 'TALOR'
    },
    'pattern.reset': {
      healing_power: 55,
      target_system: 'behavioral_patterns',
      duration_hours: 24,
      frequency: 174,
      konslang_root: 'DOM\'KAAN'
    }
  };

  constructor() {
    // Start glyph maintenance cycle
    this.startGlyphMaintenance();
  }

  /**
   * Inject a single healing glyph
   */
  inject(glyphName: string): boolean {
    const glyphTemplate = this.SACRED_GLYPHS[glyphName as keyof typeof this.SACRED_GLYPHS];
    
    if (!glyphTemplate) {
      console.log(`⚠️ Unknown glyph: ${glyphName}`);
      return false;
    }

    const healingGlyph: HealingGlyph = {
      glyph: glyphName,
      time: new Date().toISOString(),
      healing_power: glyphTemplate.healing_power,
      target_system: glyphTemplate.target_system,
      activation_duration_hours: glyphTemplate.duration_hours,
      spiritual_frequency: glyphTemplate.frequency,
      konslang_root: glyphTemplate.konslang_root
    };

    this.glyphChain.push(healingGlyph);
    this.activateGlyph(healingGlyph);

    // Maintain chain size
    if (this.glyphChain.length > this.maxChainSize) {
      this.glyphChain = this.glyphChain.slice(-this.maxChainSize);
    }

    console.log(`✨ Healing glyph injected: ${glyphName} (Power: ${glyphTemplate.healing_power})`);
    return true;
  }

  /**
   * Inject deep healing sequence for severe spiritual exhaustion
   */
  injectDeepHealingSequence(): string {
    const sequenceId = this.generateSequenceId();
    
    const deepHealingGlyphs = [
      'mind.clear',
      'corruption.purge',
      'flow.restore',
      'balance.return',
      'wisdom.strengthen',
      'energy.amplify',
      'pattern.reset'
    ];

    const sequence: HealingSequence = {
      sequence_id: sequenceId,
      glyphs: [],
      total_healing_power: 0,
      duration_minutes: 180, // 3 hours
      activation_pattern: 'SPIRAL',
      completion_status: 'PENDING'
    };

    // Create and inject each glyph in sequence
    for (const glyphName of deepHealingGlyphs) {
      if (this.inject(glyphName)) {
        const glyph = this.glyphChain[this.glyphChain.length - 1];
        sequence.glyphs.push(glyph);
        sequence.total_healing_power += glyph.healing_power;
      }
    }

    sequence.completion_status = 'ACTIVE';
    this.healingSequences.set(sequenceId, sequence);

    console.log(`🌀 Deep healing sequence initiated: ${sequenceId} (Total power: ${sequence.total_healing_power})`);
    return sequenceId;
  }

  /**
   * Inject emergency spiritual restoration
   */
  injectEmergencyRestoration(): string {
    const sequenceId = this.generateSequenceId();
    
    const emergencyGlyphs = [
      'corruption.purge',
      'pattern.reset',
      'energy.amplify'
    ];

    const sequence: HealingSequence = {
      sequence_id: sequenceId,
      glyphs: [],
      total_healing_power: 0,
      duration_minutes: 60,
      activation_pattern: 'PARALLEL',
      completion_status: 'PENDING'
    };

    // Inject all emergency glyphs simultaneously
    for (const glyphName of emergencyGlyphs) {
      if (this.inject(glyphName)) {
        const glyph = this.glyphChain[this.glyphChain.length - 1];
        sequence.glyphs.push(glyph);
        sequence.total_healing_power += glyph.healing_power;
      }
    }

    sequence.completion_status = 'ACTIVE';
    this.healingSequences.set(sequenceId, sequence);

    console.log(`🚨 Emergency restoration sequence initiated: ${sequenceId}`);
    return sequenceId;
  }

  /**
   * Get recent healing glyphs
   */
  getRecentGlyphs(limit: number = 5): HealingGlyph[] {
    return this.glyphChain.slice(-limit);
  }

  /**
   * Get currently active glyphs
   */
  getActiveGlyphs(): GlyphActivation[] {
    return Array.from(this.activeGlyphs.values());
  }

  /**
   * Get healing glyph statistics
   */
  getHealingStats(): {
    total_glyphs_injected: number;
    active_glyphs_count: number;
    total_healing_power_active: number;
    recent_sequences: HealingSequence[];
    glyph_usage_frequency: { [glyph: string]: number };
    avg_healing_power_per_hour: number;
    spiritual_frequency_harmony: number;
  } {
    const glyphUsage: { [glyph: string]: number } = {};
    
    for (const glyph of this.glyphChain) {
      glyphUsage[glyph.glyph] = (glyphUsage[glyph.glyph] || 0) + 1;
    }

    const activeGlyphs = this.getActiveGlyphs();
    const totalActivePower = activeGlyphs.reduce((sum, activation) => sum + activation.current_power, 0);

    return {
      total_glyphs_injected: this.glyphChain.length,
      active_glyphs_count: activeGlyphs.length,
      total_healing_power_active: totalActivePower,
      recent_sequences: Array.from(this.healingSequences.values()).slice(-5),
      glyph_usage_frequency: glyphUsage,
      avg_healing_power_per_hour: this.calculateAverageHealingPower(),
      spiritual_frequency_harmony: this.calculateFrequencyHarmony()
    };
  }

  /**
   * Get healing sequence status
   */
  getSequenceStatus(sequenceId: string): HealingSequence | null {
    return this.healingSequences.get(sequenceId) || null;
  }

  /**
   * Check if a specific glyph is currently active
   */
  isGlyphActive(glyphName: string): boolean {
    for (const activation of this.activeGlyphs.values()) {
      if (activation.glyph_id === glyphName) {
        const now = new Date();
        const expires = new Date(activation.expires_at);
        if (now < expires) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Force complete a healing sequence
   */
  completeSequence(sequenceId: string): boolean {
    const sequence = this.healingSequences.get(sequenceId);
    
    if (!sequence) {
      return false;
    }

    sequence.completion_status = 'COMPLETED';
    console.log(`✅ Healing sequence completed: ${sequenceId}`);
    return true;
  }

  /**
   * Reset all healing glyphs (admin function)
   */
  resetHealingGlyphs(): void {
    this.glyphChain = [];
    this.activeGlyphs.clear();
    this.healingSequences.clear();
    console.log('🔄 Healing glyphs reset complete');
  }

  /**
   * Activate a healing glyph
   */
  private activateGlyph(glyph: HealingGlyph): void {
    const activationId = this.generateActivationId();
    const now = new Date();
    const expires = new Date(now.getTime() + (glyph.activation_duration_hours * 60 * 60 * 1000));

    const activation: GlyphActivation = {
      glyph_id: glyph.glyph,
      activated_at: now.toISOString(),
      expires_at: expires.toISOString(),
      current_power: glyph.healing_power,
      target_achieved: false,
      effects_observed: []
    };

    this.activeGlyphs.set(activationId, activation);
  }

  /**
   * Calculate average healing power per hour
   */
  private calculateAverageHealingPower(): number {
    if (this.glyphChain.length === 0) return 0;

    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const recentGlyphs = this.glyphChain.filter(glyph => 
      new Date(glyph.time) > last24Hours
    );

    if (recentGlyphs.length === 0) return 0;

    const totalPower = recentGlyphs.reduce((sum, glyph) => sum + glyph.healing_power, 0);
    return Math.round(totalPower / 24);
  }

  /**
   * Calculate spiritual frequency harmony
   */
  private calculateFrequencyHarmony(): number {
    const activeGlyphs = this.getActiveGlyphs();
    
    if (activeGlyphs.length === 0) return 0;

    // Get frequencies of active glyphs
    const frequencies: number[] = [];
    for (const activation of activeGlyphs) {
      const glyphTemplate = this.SACRED_GLYPHS[activation.glyph_id as keyof typeof this.SACRED_GLYPHS];
      if (glyphTemplate) {
        frequencies.push(glyphTemplate.frequency);
      }
    }

    if (frequencies.length <= 1) return 100;

    // Calculate harmonic resonance
    let harmonyScore = 0;
    for (let i = 0; i < frequencies.length; i++) {
      for (let j = i + 1; j < frequencies.length; j++) {
        const ratio = frequencies[i] / frequencies[j];
        const harmonic = this.isHarmonicRatio(ratio);
        if (harmonic) {
          harmonyScore += 20;
        }
      }
    }

    return Math.min(100, harmonyScore);
  }

  /**
   * Check if frequency ratio is harmonic
   */
  private isHarmonicRatio(ratio: number): boolean {
    const harmonicRatios = [1.5, 2.0, 1.25, 1.33, 0.75, 0.67, 0.8];
    const tolerance = 0.05;

    return harmonicRatios.some(harmonic => 
      Math.abs(ratio - harmonic) < tolerance
    );
  }

  /**
   * Generate unique sequence ID
   */
  private generateSequenceId(): string {
    return `HEAL_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Generate unique activation ID
   */
  private generateActivationId(): string {
    return `ACT_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  }

  /**
   * Start glyph maintenance cycle
   */
  private startGlyphMaintenance(): void {
    // Clean expired glyphs every hour
    setInterval(() => {
      this.cleanExpiredGlyphs();
    }, 60 * 60 * 1000);

    // Update glyph power decay every 15 minutes
    setInterval(() => {
      this.updateGlyphDecay();
    }, 15 * 60 * 1000);
  }

  /**
   * Clean expired glyph activations
   */
  private cleanExpiredGlyphs(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [activationId, activation] of this.activeGlyphs.entries()) {
      const expires = new Date(activation.expires_at);
      if (now > expires) {
        this.activeGlyphs.delete(activationId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned ${cleanedCount} expired healing glyphs`);
    }
  }

  /**
   * Update glyph power decay over time
   */
  private updateGlyphDecay(): void {
    const now = new Date();

    for (const activation of this.activeGlyphs.values()) {
      const activated = new Date(activation.activated_at);
      const expires = new Date(activation.expires_at);
      const totalDuration = expires.getTime() - activated.getTime();
      const elapsed = now.getTime() - activated.getTime();
      
      if (elapsed > 0 && totalDuration > 0) {
        const decayFactor = 1 - (elapsed / totalDuration);
        const glyphTemplate = this.SACRED_GLYPHS[activation.glyph_id as keyof typeof this.SACRED_GLYPHS];
        
        if (glyphTemplate) {
          activation.current_power = Math.max(0, glyphTemplate.healing_power * decayFactor);
        }
      }
    }
  }
}