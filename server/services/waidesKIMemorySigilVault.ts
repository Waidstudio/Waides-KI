/**
 * STEP 42: Waides KI Memory Sigil Vault
 * Time-storing memory system that logs historical symbol + trade outcomes
 */

interface SigilOutcome {
  timestamp: string;
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
  result: 'profit' | 'loss' | 'neutral';
  profit: number;
  market_conditions: {
    volatility: string;
    volume: string;
    time_of_day: string;
    day_of_week: string;
  };
  spiritual_context: {
    moon_phase: string;
    energy_level: number;
    confidence: number;
  };
}

interface SigilHistory {
  symbol: string;
  outcomes: SigilOutcome[];
  first_seen: string;
  last_seen: string;
  total_trades: number;
}

interface VaultStats {
  total_symbols: number;
  total_trades: number;
  immortal_sigils: number;
  strong_sigils: number;
  unstable_sigils: number;
  last_update: string;
}

export class WaidesKIMemorySigilVault {
  private sigilHistory: Map<string, SigilOutcome[]> = new Map();
  private maxHistoryPerSymbol = 1000;
  
  private vaultStats: VaultStats = {
    total_symbols: 0,
    total_trades: 0,
    immortal_sigils: 0,
    strong_sigils: 0,
    unstable_sigils: 0,
    last_update: new Date().toISOString()
  };

  constructor() {
    console.log('🧠 Memory Sigil Vault initialized - ready to store time-layered trading memories');
  }

  /**
   * Log a symbol outcome to build historical memory
   */
  logSymbolOutcome(
    symbol: string,
    trend: 'UP' | 'DOWN' | 'SIDEWAYS',
    result: 'profit' | 'loss' | 'neutral',
    profit: number,
    additionalContext?: any
  ): void {
    const outcome: SigilOutcome = {
      timestamp: new Date().toISOString(),
      trend,
      result,
      profit,
      market_conditions: {
        volatility: this.calculateVolatilityContext(),
        volume: this.calculateVolumeContext(),
        time_of_day: this.getTimeOfDayContext(),
        day_of_week: new Date().toLocaleDateString('en-US', { weekday: 'long' })
      },
      spiritual_context: {
        moon_phase: this.getMoonPhaseContext(),
        energy_level: Math.floor(Math.random() * 100) + 1,
        confidence: additionalContext?.confidence || 75
      }
    };

    // Initialize symbol history if not exists
    if (!this.sigilHistory.has(symbol)) {
      this.sigilHistory.set(symbol, []);
    }

    const history = this.sigilHistory.get(symbol)!;
    history.push(outcome);

    // Maintain max history limit
    if (history.length > this.maxHistoryPerSymbol) {
      history.shift(); // Remove oldest outcome
    }

    this.updateVaultStats();
    
    console.log(`🔮 Logged ${symbol} outcome: ${result} (${profit > 0 ? '+' : ''}${profit.toFixed(2)}) - Total memory: ${history.length} trades`);
  }

  /**
   * Get complete symbol history
   */
  getSymbolHistory(symbol: string): SigilOutcome[] {
    return this.sigilHistory.get(symbol) || [];
  }

  /**
   * Get all symbols with their historical data
   */
  getAllSigilHistories(): SigilHistory[] {
    const histories: SigilHistory[] = [];
    
    for (const [symbol, outcomes] of this.sigilHistory.entries()) {
      if (outcomes.length > 0) {
        histories.push({
          symbol,
          outcomes,
          first_seen: outcomes[0].timestamp,
          last_seen: outcomes[outcomes.length - 1].timestamp,
          total_trades: outcomes.length
        });
      }
    }

    return histories.sort((a, b) => b.total_trades - a.total_trades);
  }

  /**
   * Get recent symbol activity across all sigils
   */
  getRecentActivity(limit: number = 20): SigilOutcome[] {
    const allOutcomes: (SigilOutcome & { symbol: string })[] = [];
    
    for (const [symbol, outcomes] of this.sigilHistory.entries()) {
      outcomes.forEach(outcome => {
        allOutcomes.push({ ...outcome, symbol });
      });
    }

    return allOutcomes
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get symbols by profitability
   */
  getSymbolsByProfitability(): { symbol: string; total_profit: number; avg_profit: number; trade_count: number }[] {
    const profitability: { symbol: string; total_profit: number; avg_profit: number; trade_count: number }[] = [];
    
    for (const [symbol, outcomes] of this.sigilHistory.entries()) {
      const totalProfit = outcomes.reduce((sum, outcome) => sum + outcome.profit, 0);
      const avgProfit = outcomes.length > 0 ? totalProfit / outcomes.length : 0;
      
      profitability.push({
        symbol,
        total_profit: totalProfit,
        avg_profit: avgProfit,
        trade_count: outcomes.length
      });
    }

    return profitability.sort((a, b) => b.total_profit - a.total_profit);
  }

  /**
   * Analyze symbol patterns by market conditions
   */
  getSymbolMarketPatterns(symbol: string): {
    by_volatility: Record<string, { count: number; win_rate: number; avg_profit: number }>;
    by_time_of_day: Record<string, { count: number; win_rate: number; avg_profit: number }>;
    by_day_of_week: Record<string, { count: number; win_rate: number; avg_profit: number }>;
  } {
    const outcomes = this.getSymbolHistory(symbol);
    
    const analyzeByCategory = (categoryFn: (outcome: SigilOutcome) => string) => {
      const categories: Record<string, SigilOutcome[]> = {};
      
      outcomes.forEach(outcome => {
        const category = categoryFn(outcome);
        if (!categories[category]) categories[category] = [];
        categories[category].push(outcome);
      });

      const result: Record<string, { count: number; win_rate: number; avg_profit: number }> = {};
      
      for (const [category, categoryOutcomes] of Object.entries(categories)) {
        const wins = categoryOutcomes.filter(o => o.result === 'profit').length;
        const totalProfit = categoryOutcomes.reduce((sum, o) => sum + o.profit, 0);
        
        result[category] = {
          count: categoryOutcomes.length,
          win_rate: categoryOutcomes.length > 0 ? wins / categoryOutcomes.length : 0,
          avg_profit: categoryOutcomes.length > 0 ? totalProfit / categoryOutcomes.length : 0
        };
      }
      
      return result;
    };

    return {
      by_volatility: analyzeByCategory(o => o.market_conditions.volatility),
      by_time_of_day: analyzeByCategory(o => o.market_conditions.time_of_day),
      by_day_of_week: analyzeByCategory(o => o.market_conditions.day_of_week)
    };
  }

  /**
   * Get vault statistics
   */
  getVaultStats(): VaultStats {
    return { ...this.vaultStats };
  }

  /**
   * Get memory summary for all sigils
   */
  getMemorySummary(): {
    total_symbols: number;
    total_trades: number;
    most_profitable_symbol: string;
    most_active_symbol: string;
    recent_activity: SigilOutcome[];
    immortal_sigils: string[];
  } {
    const profitability = this.getSymbolsByProfitability();
    const histories = this.getAllSigilHistories();
    
    return {
      total_symbols: this.sigilHistory.size,
      total_trades: this.vaultStats.total_trades,
      most_profitable_symbol: profitability[0]?.symbol || 'None',
      most_active_symbol: histories[0]?.symbol || 'None',
      recent_activity: this.getRecentActivity(10),
      immortal_sigils: this.getImmortalSigils()
    };
  }

  /**
   * Get symbols with immortal status (>75% win rate, >10 trades)
   */
  getImmortalSigils(): string[] {
    const immortals: string[] = [];
    
    for (const [symbol, outcomes] of this.sigilHistory.entries()) {
      if (outcomes.length >= 10) {
        const wins = outcomes.filter(o => o.result === 'profit').length;
        const winRate = wins / outcomes.length;
        
        if (winRate >= 0.75) {
          immortals.push(symbol);
        }
      }
    }
    
    return immortals;
  }

  /**
   * Clear old memories (admin function)
   */
  clearOldMemories(daysOld: number = 90): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    let clearedCount = 0;
    
    for (const [symbol, outcomes] of this.sigilHistory.entries()) {
      const filteredOutcomes = outcomes.filter(outcome => 
        new Date(outcome.timestamp) > cutoffDate
      );
      
      clearedCount += outcomes.length - filteredOutcomes.length;
      
      if (filteredOutcomes.length === 0) {
        this.sigilHistory.delete(symbol);
      } else {
        this.sigilHistory.set(symbol, filteredOutcomes);
      }
    }

    this.updateVaultStats();
    console.log(`🧹 Cleared ${clearedCount} old memories (older than ${daysOld} days)`);
    
    return clearedCount;
  }

  /**
   * Reset vault (admin function)
   */
  resetVault(): void {
    this.sigilHistory.clear();
    this.updateVaultStats();
    console.log('🔄 Memory Sigil Vault reset - all memories cleared');
  }

  /**
   * Update vault statistics
   */
  private updateVaultStats(): void {
    let totalTrades = 0;
    let immortalCount = 0;
    let strongCount = 0;
    let unstableCount = 0;

    for (const [symbol, outcomes] of this.sigilHistory.entries()) {
      totalTrades += outcomes.length;
      
      if (outcomes.length >= 3) {
        const wins = outcomes.filter(o => o.result === 'profit').length;
        const winRate = wins / outcomes.length;
        
        if (winRate >= 0.75) immortalCount++;
        else if (winRate >= 0.55) strongCount++;
        else unstableCount++;
      }
    }

    this.vaultStats = {
      total_symbols: this.sigilHistory.size,
      total_trades: totalTrades,
      immortal_sigils: immortalCount,
      strong_sigils: strongCount,
      unstable_sigils: unstableCount,
      last_update: new Date().toISOString()
    };
  }

  /**
   * Helper methods for context calculation
   */
  private calculateVolatilityContext(): string {
    // Simulate volatility calculation
    const vol = Math.random() * 100;
    if (vol > 70) return 'HIGH';
    if (vol > 40) return 'MEDIUM';
    return 'LOW';
  }

  private calculateVolumeContext(): string {
    // Simulate volume calculation
    const vol = Math.random() * 100;
    if (vol > 70) return 'HIGH';
    if (vol > 40) return 'MEDIUM';
    return 'LOW';
  }

  private getTimeOfDayContext(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'MORNING';
    if (hour >= 12 && hour < 18) return 'AFTERNOON';
    if (hour >= 18 && hour < 24) return 'EVENING';
    return 'NIGHT';
  }

  private getMoonPhaseContext(): string {
    const phases = ['NEW_MOON', 'WAXING_CRESCENT', 'FIRST_QUARTER', 'WAXING_GIBBOUS', 'FULL_MOON', 'WANING_GIBBOUS', 'LAST_QUARTER', 'WANING_CRESCENT'];
    return phases[Math.floor(Math.random() * phases.length)];
  }
}