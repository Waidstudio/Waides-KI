/**
 * STEP 42: Waides KI Symbol Time Trainer
 * Analyzes patterns and builds sigils from historical memory data
 */

import { WaidesKIMemorySigilVault } from './waidesKIMemorySigilVault';

interface SigilStrength {
  symbol: string;
  strength: 'weak' | 'unstable' | 'strong' | 'immortal sigil';
  win_rate: number;
  sample_size: number;
  total_profit: number;
  avg_profit: number;
  confidence_score: number;
  last_seen: string;
  spiritual_power: 'dormant' | 'awakening' | 'active' | 'transcendent';
}

interface PatternAnalysis {
  symbol: string;
  trend_patterns: {
    up_trades: { count: number; win_rate: number; avg_profit: number };
    down_trades: { count: number; win_rate: number; avg_profit: number };
    sideways_trades: { count: number; win_rate: number; avg_profit: number };
  };
  time_patterns: {
    best_time_of_day: string;
    best_day_of_week: string;
    worst_time_of_day: string;
    worst_day_of_week: string;
  };
  market_condition_patterns: {
    best_volatility: string;
    best_volume: string;
    optimal_conditions: string;
  };
  spiritual_patterns: {
    lucky_moon_phase: string;
    optimal_energy_range: { min: number; max: number };
    confidence_threshold: number;
  };
}

interface TrainingStats {
  total_symbols_analyzed: number;
  immortal_sigils_found: number;
  strong_sigils_found: number;
  weak_sigils_filtered: number;
  last_training_session: string;
  training_sessions_completed: number;
}

export class WaidesKISymbolTimeTrainer {
  private memorySigilVault: WaidesKIMemorySigilVault;
  private trainingStats: TrainingStats = {
    total_symbols_analyzed: 0,
    immortal_sigils_found: 0,
    strong_sigils_found: 0,
    weak_sigils_filtered: 0,
    last_training_session: new Date().toISOString(),
    training_sessions_completed: 0
  };

  // Sigil strength thresholds
  private readonly STRENGTH_THRESHOLDS = {
    IMMORTAL_WIN_RATE: 0.75,
    IMMORTAL_MIN_TRADES: 10,
    STRONG_WIN_RATE: 0.60,
    STRONG_MIN_TRADES: 5,
    WEAK_MIN_TRADES: 3
  };

  constructor(memorySigilVault: WaidesKIMemorySigilVault) {
    this.memorySigilVault = memorySigilVault;
    console.log('🧬 Symbol Time Trainer initialized - ready to analyze patterns and build sigils');
  }

  /**
   * Get sigil strength analysis for a specific symbol
   */
  getSigilStrength(symbol: string): SigilStrength {
    const history = this.memorySigilVault.getSymbolHistory(symbol);
    
    if (!history || history.length === 0) {
      return {
        symbol,
        strength: 'weak',
        win_rate: 0.0,
        sample_size: 0,
        total_profit: 0,
        avg_profit: 0,
        confidence_score: 0,
        last_seen: 'Never',
        spiritual_power: 'dormant'
      };
    }

    const wins = history.filter(h => h.result === 'profit').length;
    const winRate = wins / history.length;
    const totalProfit = history.reduce((sum, h) => sum + h.profit, 0);
    const avgProfit = totalProfit / history.length;
    const lastSeen = history[history.length - 1].timestamp;

    // Determine strength
    let strength: SigilStrength['strength'] = 'weak';
    let spiritualPower: SigilStrength['spiritual_power'] = 'dormant';

    if (history.length >= this.STRENGTH_THRESHOLDS.IMMORTAL_MIN_TRADES && 
        winRate >= this.STRENGTH_THRESHOLDS.IMMORTAL_WIN_RATE) {
      strength = 'immortal sigil';
      spiritualPower = 'transcendent';
    } else if (history.length >= this.STRENGTH_THRESHOLDS.STRONG_MIN_TRADES && 
               winRate >= this.STRENGTH_THRESHOLDS.STRONG_WIN_RATE) {
      strength = 'strong';
      spiritualPower = 'active';
    } else if (history.length >= this.STRENGTH_THRESHOLDS.WEAK_MIN_TRADES) {
      strength = 'unstable';
      spiritualPower = 'awakening';
    }

    // Calculate confidence score based on multiple factors
    const confidenceScore = this.calculateConfidenceScore(winRate, history.length, avgProfit, history);

    return {
      symbol,
      strength,
      win_rate: winRate,
      sample_size: history.length,
      total_profit: totalProfit,
      avg_profit: avgProfit,
      confidence_score: confidenceScore,
      last_seen: lastSeen,
      spiritual_power: spiritualPower
    };
  }

  /**
   * Analyze all symbols and return sigil strengths
   */
  analyzeAllSigils(): SigilStrength[] {
    const histories = this.memorySigilVault.getAllSigilHistories();
    const results: SigilStrength[] = [];

    for (const history of histories) {
      const strength = this.getSigilStrength(history.symbol);
      results.push(strength);
    }

    // Update training stats
    this.updateTrainingStats(results);

    return results.sort((a, b) => {
      // Sort by strength priority, then by confidence score
      const strengthOrder = { 'immortal sigil': 4, 'strong': 3, 'unstable': 2, 'weak': 1 };
      const aOrder = strengthOrder[a.strength];
      const bOrder = strengthOrder[b.strength];
      
      if (aOrder !== bOrder) return bOrder - aOrder;
      return b.confidence_score - a.confidence_score;
    });
  }

  /**
   * Get immortal sigils (highest tier)
   */
  getImmortalSigils(): SigilStrength[] {
    return this.analyzeAllSigils().filter(sigil => sigil.strength === 'immortal sigil');
  }

  /**
   * Get strong sigils (reliable tier)
   */
  getStrongSigils(): SigilStrength[] {
    return this.analyzeAllSigils().filter(sigil => sigil.strength === 'strong');
  }

  /**
   * Get weak/unstable sigils (avoid these)
   */
  getWeakSigils(): SigilStrength[] {
    return this.analyzeAllSigils().filter(sigil => ['weak', 'unstable'].includes(sigil.strength));
  }

  /**
   * Perform deep pattern analysis for a specific symbol
   */
  analyzeSymbolPatterns(symbol: string): PatternAnalysis {
    const history = this.memorySigilVault.getSymbolHistory(symbol);
    const marketPatterns = this.memorySigilVault.getSymbolMarketPatterns(symbol);

    // Analyze trend patterns
    const upTrades = history.filter(h => h.trend === 'UP');
    const downTrades = history.filter(h => h.trend === 'DOWN');
    const sidewaysTrades = history.filter(h => h.trend === 'SIDEWAYS');

    const trendPatterns = {
      up_trades: this.calculateTrendStats(upTrades),
      down_trades: this.calculateTrendStats(downTrades),
      sideways_trades: this.calculateTrendStats(sidewaysTrades)
    };

    // Find best/worst time patterns
    const timePatterns = this.findOptimalTimePatterns(marketPatterns);

    // Find best market conditions
    const marketConditionPatterns = this.findOptimalMarketConditions(marketPatterns);

    // Analyze spiritual patterns
    const spiritualPatterns = this.findSpiritualPatterns(history);

    return {
      symbol,
      trend_patterns: trendPatterns,
      time_patterns: timePatterns,
      market_condition_patterns: marketConditionPatterns,
      spiritual_patterns: spiritualPatterns
    };
  }

  /**
   * Get sigils suitable for current market conditions
   */
  getSigilsForConditions(
    timeOfDay: string,
    dayOfWeek: string,
    volatility: string,
    volume: string
  ): SigilStrength[] {
    const strongSigils = [...this.getImmortalSigils(), ...this.getStrongSigils()];
    const suitableSigils: (SigilStrength & { suitability_score: number })[] = [];

    for (const sigil of strongSigils) {
      const patterns = this.analyzeSymbolPatterns(sigil.symbol);
      let suitabilityScore = 0;

      // Score based on time patterns
      if (patterns.time_patterns.best_time_of_day === timeOfDay) suitabilityScore += 30;
      if (patterns.time_patterns.best_day_of_week === dayOfWeek) suitabilityScore += 25;

      // Score based on market conditions
      if (patterns.market_condition_patterns.best_volatility === volatility) suitabilityScore += 25;
      if (patterns.market_condition_patterns.best_volume === volume) suitabilityScore += 20;

      // Avoid worst conditions
      if (patterns.time_patterns.worst_time_of_day === timeOfDay) suitabilityScore -= 20;
      if (patterns.time_patterns.worst_day_of_week === dayOfWeek) suitabilityScore -= 15;

      if (suitabilityScore > 0) {
        suitableSigils.push({ ...sigil, suitability_score: suitabilityScore });
      }
    }

    return suitableSigils
      .sort((a, b) => b.suitability_score - a.suitability_score)
      .slice(0, 10) // Top 10 most suitable
      .map(({ suitability_score, ...sigil }) => sigil);
  }

  /**
   * Get training statistics
   */
  getTrainingStats(): TrainingStats & { 
    current_sigil_count: number;
    immortal_percentage: number;
    strong_percentage: number;
  } {
    const currentAnalysis = this.analyzeAllSigils();
    const immortalCount = currentAnalysis.filter(s => s.strength === 'immortal sigil').length;
    const strongCount = currentAnalysis.filter(s => s.strength === 'strong').length;
    const totalCount = currentAnalysis.length;

    return {
      ...this.trainingStats,
      current_sigil_count: totalCount,
      immortal_percentage: totalCount > 0 ? (immortalCount / totalCount) * 100 : 0,
      strong_percentage: totalCount > 0 ? (strongCount / totalCount) * 100 : 0
    };
  }

  /**
   * Force a complete training session
   */
  forceTrainingSession(): {
    sigils_analyzed: SigilStrength[];
    patterns_discovered: number;
    immortal_sigils: string[];
    strong_sigils: string[];
    training_summary: string;
  } {
    const allSigils = this.analyzeAllSigils();
    const immortalSigils = allSigils.filter(s => s.strength === 'immortal sigil').map(s => s.symbol);
    const strongSigils = allSigils.filter(s => s.strength === 'strong').map(s => s.symbol);

    this.trainingStats.training_sessions_completed++;
    this.trainingStats.last_training_session = new Date().toISOString();

    const trainingSummary = `Training completed: ${allSigils.length} sigils analyzed, ${immortalSigils.length} immortal sigils found, ${strongSigils.length} strong sigils identified`;

    console.log(`🎯 ${trainingSummary}`);

    return {
      sigils_analyzed: allSigils,
      patterns_discovered: allSigils.length,
      immortal_sigils: immortalSigils,
      strong_sigils: strongSigils,
      training_summary: trainingSummary
    };
  }

  /**
   * Reset training data (admin function)
   */
  resetTraining(): void {
    this.trainingStats = {
      total_symbols_analyzed: 0,
      immortal_sigils_found: 0,
      strong_sigils_found: 0,
      weak_sigils_filtered: 0,
      last_training_session: new Date().toISOString(),
      training_sessions_completed: 0
    };
    console.log('🔄 Symbol Time Trainer reset - all training data cleared');
  }

  /**
   * Calculate confidence score based on multiple factors
   */
  private calculateConfidenceScore(
    winRate: number,
    sampleSize: number,
    avgProfit: number,
    history: any[]
  ): number {
    let score = 0;

    // Win rate score (0-40 points)
    score += winRate * 40;

    // Sample size score (0-25 points)
    const sampleScore = Math.min(sampleSize / 20, 1) * 25;
    score += sampleScore;

    // Profit consistency score (0-20 points)
    const profitConsistency = avgProfit > 0 ? Math.min(avgProfit / 100, 1) * 20 : 0;
    score += profitConsistency;

    // Recent performance score (0-15 points)
    const recentTrades = history.slice(-5);
    const recentWins = recentTrades.filter(h => h.result === 'profit').length;
    const recentScore = recentTrades.length > 0 ? (recentWins / recentTrades.length) * 15 : 0;
    score += recentScore;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calculate trend statistics
   */
  private calculateTrendStats(trades: any[]): { count: number; win_rate: number; avg_profit: number } {
    if (trades.length === 0) {
      return { count: 0, win_rate: 0, avg_profit: 0 };
    }

    const wins = trades.filter(t => t.result === 'profit').length;
    const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);

    return {
      count: trades.length,
      win_rate: wins / trades.length,
      avg_profit: totalProfit / trades.length
    };
  }

  /**
   * Find optimal time patterns
   */
  private findOptimalTimePatterns(marketPatterns: any): PatternAnalysis['time_patterns'] {
    let bestTimeOfDay = 'MORNING';
    let bestDayOfWeek = 'Monday';
    let worstTimeOfDay = 'NIGHT';
    let worstDayOfWeek = 'Friday';

    let bestTimeScore = 0;
    let bestDayScore = 0;
    let worstTimeScore = 100;
    let worstDayScore = 100;

    // Analyze time of day patterns
    for (const [time, stats] of Object.entries(marketPatterns.by_time_of_day || {})) {
      const score = (stats as any).win_rate * 100;
      if (score > bestTimeScore) {
        bestTimeScore = score;
        bestTimeOfDay = time;
      }
      if (score < worstTimeScore) {
        worstTimeScore = score;
        worstTimeOfDay = time;
      }
    }

    // Analyze day of week patterns
    for (const [day, stats] of Object.entries(marketPatterns.by_day_of_week || {})) {
      const score = (stats as any).win_rate * 100;
      if (score > bestDayScore) {
        bestDayScore = score;
        bestDayOfWeek = day;
      }
      if (score < worstDayScore) {
        worstDayScore = score;
        worstDayOfWeek = day;
      }
    }

    return {
      best_time_of_day: bestTimeOfDay,
      best_day_of_week: bestDayOfWeek,
      worst_time_of_day: worstTimeOfDay,
      worst_day_of_week: worstDayOfWeek
    };
  }

  /**
   * Find optimal market conditions
   */
  private findOptimalMarketConditions(marketPatterns: any): PatternAnalysis['market_condition_patterns'] {
    let bestVolatility = 'MEDIUM';
    let bestVolume = 'MEDIUM';

    let bestVolScore = 0;
    let bestVolumeScore = 0;

    // Analyze volatility patterns
    for (const [vol, stats] of Object.entries(marketPatterns.by_volatility || {})) {
      const score = (stats as any).win_rate * 100;
      if (score > bestVolScore) {
        bestVolScore = score;
        bestVolatility = vol;
      }
    }

    // This is a simplified analysis - in practice would be more complex
    return {
      best_volatility: bestVolatility,
      best_volume: bestVolume,
      optimal_conditions: `${bestVolatility} volatility with ${bestVolume} volume`
    };
  }

  /**
   * Find spiritual patterns
   */
  private findSpiritualPatterns(history: any[]): PatternAnalysis['spiritual_patterns'] {
    const moonPhases: Record<string, number> = {};
    const energyLevels: number[] = [];
    const confidenceLevels: number[] = [];

    history.forEach(h => {
      const phase = h.spiritual_context?.moon_phase || 'UNKNOWN';
      if (!moonPhases[phase]) moonPhases[phase] = 0;
      if (h.result === 'profit') moonPhases[phase]++;

      if (h.spiritual_context?.energy_level) energyLevels.push(h.spiritual_context.energy_level);
      if (h.spiritual_context?.confidence) confidenceLevels.push(h.spiritual_context.confidence);
    });

    const luckyMoonPhase = Object.entries(moonPhases).sort((a, b) => b[1] - a[1])[0]?.[0] || 'FULL_MOON';
    
    const minEnergy = energyLevels.length > 0 ? Math.min(...energyLevels) : 60;
    const maxEnergy = energyLevels.length > 0 ? Math.max(...energyLevels) : 90;
    const avgConfidence = confidenceLevels.length > 0 ? confidenceLevels.reduce((a, b) => a + b) / confidenceLevels.length : 75;

    return {
      lucky_moon_phase: luckyMoonPhase,
      optimal_energy_range: { min: minEnergy, max: maxEnergy },
      confidence_threshold: Math.round(avgConfidence)
    };
  }

  /**
   * Update training statistics
   */
  private updateTrainingStats(results: SigilStrength[]): void {
    this.trainingStats.total_symbols_analyzed = results.length;
    this.trainingStats.immortal_sigils_found = results.filter(r => r.strength === 'immortal sigil').length;
    this.trainingStats.strong_sigils_found = results.filter(r => r.strength === 'strong').length;
    this.trainingStats.weak_sigils_filtered = results.filter(r => ['weak', 'unstable'].includes(r.strength)).length;
    this.trainingStats.last_training_session = new Date().toISOString();
  }
}