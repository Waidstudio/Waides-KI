/**
 * STEP 43: Waides KI Healing Prayer Engine
 * Executes reset logic and Konslang healing to cleanse corrupted patterns
 */

import { WaidesKIDreamfirePurifier } from './waidesKIDreamfirePurifier';
import { WaidesKIHealingGlyphs } from './waidesKIHealingGlyphs';
import { WaidesKIMemorySigilVault } from './waidesKIMemorySigilVault';
import { WaidesKISpiritualExhaustionMonitor } from './waidesKISpiritualExhaustionMonitor';

interface HealingResult {
  purged_symbols: string[];
  injected_glyphs: string[];
  corrupted_count: number;
  healing_power: number;
  spiritual_energy_restored: number;
  next_heal_recommended: string;
}

interface DailyResetStats {
  resets_performed: number;
  total_symbols_purged: number;
  total_glyphs_injected: number;
  avg_healing_power: number;
  last_reset: string;
  spiritual_health_score: number;
}

export class WaidesKIHealingPrayerEngine {
  private dreamfirePurifier: WaidesKIDreamfirePurifier;
  private healingGlyphs: WaidesKIHealingGlyphs;
  private memorySigilVault: WaidesKIMemorySigilVault;
  private exhaustionMonitor: WaidesKISpiritualExhaustionMonitor;
  
  private dailyResetStats: DailyResetStats = {
    resets_performed: 0,
    total_symbols_purged: 0,
    total_glyphs_injected: 0,
    avg_healing_power: 0,
    last_reset: '',
    spiritual_health_score: 100
  };

  private healingHistory: HealingResult[] = [];
  private maxHistorySize = 100;

  constructor(
    dreamfirePurifier: WaidesKIDreamfirePurifier,
    healingGlyphs: WaidesKIHealingGlyphs,
    memorySigilVault: WaidesKIMemorySigilVault,
    exhaustionMonitor: WaidesKISpiritualExhaustionMonitor
  ) {
    this.dreamfirePurifier = dreamfirePurifier;
    this.healingGlyphs = healingGlyphs;
    this.memorySigilVault = memorySigilVault;
    this.exhaustionMonitor = exhaustionMonitor;

    // Start daily healing cycle
    this.startDailyHealingCycle();
  }

  /**
   * Perform complete spiritual reset and healing
   */
  performReset(force: boolean = false): HealingResult {
    const startTime = new Date().toISOString();
    
    // Check if healing is needed
    if (!force && !this.isHealingNeeded()) {
      return this.createMinimalHealingResult();
    }

    // Identify and purge corrupted symbols
    const corruptedSymbols = this.dreamfirePurifier.identifyCorrupted();
    const purgedCount = this.purgeCorruptedSymbols(corruptedSymbols);

    // Inject healing glyphs
    const healingGlyphsInjected = this.injectHealingGlyphs();

    // Calculate healing power
    const healingPower = this.calculateHealingPower(purgedCount, healingGlyphsInjected.length);

    // Restore spiritual energy
    const spiritualEnergyRestored = this.restoreSpiritualEnergy(healingPower);

    // Create healing result
    const healingResult: HealingResult = {
      purged_symbols: corruptedSymbols,
      injected_glyphs: healingGlyphsInjected,
      corrupted_count: purgedCount,
      healing_power: healingPower,
      spiritual_energy_restored: spiritualEnergyRestored,
      next_heal_recommended: this.calculateNextHealTime()
    };

    // Update statistics
    this.updateDailyResetStats(healingResult);
    this.storeHealingResult(healingResult);

    console.log(`🕊️ Healing Prayer Complete: ${purgedCount} symbols purged, ${healingGlyphsInjected.length} glyphs injected`);

    return healingResult;
  }

  /**
   * Perform emergency healing when spiritual exhaustion is detected
   */
  performEmergencyHealing(): HealingResult {
    console.log('🚨 Emergency spiritual healing initiated');
    return this.performReset(true);
  }

  /**
   * Check if healing is needed based on current spiritual state
   */
  isHealingNeeded(): boolean {
    // Check spiritual exhaustion
    if (this.exhaustionMonitor.shouldPauseTrading()) {
      return true;
    }

    // Check corruption level
    const corruptedSymbols = this.dreamfirePurifier.identifyCorrupted();
    if (corruptedSymbols.length >= 3) {
      return true;
    }

    // Check time since last healing
    const timeSinceLastHeal = this.getTimeSinceLastHeal();
    if (timeSinceLastHeal > 24) { // 24 hours
      return true;
    }

    // Check spiritual health score
    if (this.dailyResetStats.spiritual_health_score < 70) {
      return true;
    }

    return false;
  }

  /**
   * Get comprehensive healing statistics
   */
  getHealingStats(): DailyResetStats & {
    recent_healings: HealingResult[];
    corruption_trend: number[];
    spiritual_energy_trend: number[];
    healing_effectiveness: number;
  } {
    return {
      ...this.dailyResetStats,
      recent_healings: this.healingHistory.slice(-10),
      corruption_trend: this.calculateCorruptionTrend(),
      spiritual_energy_trend: this.calculateSpiritualEnergyTrend(),
      healing_effectiveness: this.calculateHealingEffectiveness()
    };
  }

  /**
   * Get healing history
   */
  getHealingHistory(limit: number = 20): HealingResult[] {
    return this.healingHistory.slice(-limit);
  }

  /**
   * Force complete spiritual cleansing (admin function)
   */
  forceCompleteCleansingAsync(): Promise<HealingResult> {
    return new Promise((resolve) => {
      // Perform deep cleansing
      const result = this.performReset(true);
      
      // Additional deep cleansing steps
      this.healingGlyphs.injectDeepHealingSequence();
      this.memorySigilVault.performSpiritualCleansing();
      
      console.log('🔥 Complete spiritual cleansing performed');
      resolve(result);
    });
  }

  /**
   * Purge corrupted symbols from memory vault
   */
  private purgeCorruptedSymbols(corruptedSymbols: string[]): number {
    let purgedCount = 0;
    
    for (const symbol of corruptedSymbols) {
      if (this.memorySigilVault.purgeSymbol(symbol)) {
        purgedCount++;
        console.log(`🔥 Purged corrupted symbol: ${symbol}`);
      }
    }
    
    return purgedCount;
  }

  /**
   * Inject healing glyphs for spiritual restoration
   */
  private injectHealingGlyphs(): string[] {
    const glyphs = [
      'mind.clear',
      'flow.restore',
      'vision.clarify',
      'balance.return',
      'wisdom.strengthen'
    ];

    const injectedGlyphs: string[] = [];

    for (const glyph of glyphs) {
      if (this.healingGlyphs.inject(glyph)) {
        injectedGlyphs.push(glyph);
      }
    }

    return injectedGlyphs;
  }

  /**
   * Calculate healing power based on purging and glyph injection
   */
  private calculateHealingPower(purgedCount: number, glyphsCount: number): number {
    const baseHealing = 50;
    const purgeBonus = purgedCount * 15;
    const glyphBonus = glyphsCount * 10;
    
    return Math.min(100, baseHealing + purgeBonus + glyphBonus);
  }

  /**
   * Restore spiritual energy based on healing power
   */
  private restoreSpiritualEnergy(healingPower: number): number {
    const energyRestored = healingPower * 0.8;
    this.dailyResetStats.spiritual_health_score = Math.min(100, 
      this.dailyResetStats.spiritual_health_score + energyRestored);
    
    return energyRestored;
  }

  /**
   * Calculate when next healing should occur
   */
  private calculateNextHealTime(): string {
    const now = new Date();
    const nextHeal = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
    return nextHeal.toISOString();
  }

  /**
   * Create minimal healing result when healing not needed
   */
  private createMinimalHealingResult(): HealingResult {
    return {
      purged_symbols: [],
      injected_glyphs: [],
      corrupted_count: 0,
      healing_power: 0,
      spiritual_energy_restored: 0,
      next_heal_recommended: this.calculateNextHealTime()
    };
  }

  /**
   * Update daily reset statistics
   */
  private updateDailyResetStats(healingResult: HealingResult): void {
    this.dailyResetStats.resets_performed++;
    this.dailyResetStats.total_symbols_purged += healingResult.corrupted_count;
    this.dailyResetStats.total_glyphs_injected += healingResult.injected_glyphs.length;
    this.dailyResetStats.last_reset = new Date().toISOString();
    
    // Update average healing power
    const totalHealingPower = (this.dailyResetStats.avg_healing_power * (this.dailyResetStats.resets_performed - 1)) + healingResult.healing_power;
    this.dailyResetStats.avg_healing_power = totalHealingPower / this.dailyResetStats.resets_performed;
  }

  /**
   * Store healing result in history
   */
  private storeHealingResult(healingResult: HealingResult): void {
    this.healingHistory.push(healingResult);
    
    if (this.healingHistory.length > this.maxHistorySize) {
      this.healingHistory = this.healingHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get time since last healing in hours
   */
  private getTimeSinceLastHeal(): number {
    if (!this.dailyResetStats.last_reset) {
      return 25; // Force healing if never performed
    }
    
    const lastReset = new Date(this.dailyResetStats.last_reset);
    const now = new Date();
    const diffMs = now.getTime() - lastReset.getTime();
    
    return diffMs / (1000 * 60 * 60); // Convert to hours
  }

  /**
   * Start daily healing cycle
   */
  private startDailyHealingCycle(): void {
    // Perform healing every 24 hours
    setInterval(() => {
      if (this.isHealingNeeded()) {
        this.performReset();
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Check for emergency healing every hour
    setInterval(() => {
      if (this.exhaustionMonitor.shouldPauseTrading()) {
        this.performEmergencyHealing();
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Calculate corruption trend over time
   */
  private calculateCorruptionTrend(): number[] {
    return this.healingHistory.slice(-10).map(h => h.corrupted_count);
  }

  /**
   * Calculate spiritual energy trend over time
   */
  private calculateSpiritualEnergyTrend(): number[] {
    return this.healingHistory.slice(-10).map(h => h.spiritual_energy_restored);
  }

  /**
   * Calculate overall healing effectiveness
   */
  private calculateHealingEffectiveness(): number {
    if (this.healingHistory.length === 0) return 100;
    
    const recentHealings = this.healingHistory.slice(-5);
    const avgHealingPower = recentHealings.reduce((sum, h) => sum + h.healing_power, 0) / recentHealings.length;
    
    return Math.round(avgHealingPower);
  }
}