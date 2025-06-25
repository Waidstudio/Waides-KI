interface FailedTrade {
  id: string;
  timestamp: number;
  context: {
    reason: string;
    loss: number;
    entry_price: number;
    exit_price: number;
    volatility: 'low' | 'normal' | 'high' | 'extreme';
    pattern: string;
    market_phase: string;
    rsi_at_entry: number;
    volume_ratio: number;
    timeframe: string;
    strategy_used: string;
    confidence_score: number;
    risk_reward_ratio: number;
    market_conditions: any;
  };
  lesson: string;
  konslang_code: string;
  reincarnation_count: number;
  last_analyzed: number;
  evolved_strategies: string[];
  spiritual_weight: number; // How much this failure taught us (1-100)
}

interface ReincarnationStats {
  total_failures_processed: number;
  total_reincarnations: number;
  lessons_learned: number;
  strategies_evolved: number;
  spiritual_wisdom_gained: number;
  most_common_failure: string;
  deepest_lesson: string;
  reincarnation_success_rate: number;
}

export class WaidesKILossMemoryVault {
  private failed_trades: Map<string, FailedTrade> = new Map();
  private konslang_lessons: any = {};
  private reincarnation_stats: ReincarnationStats = {
    total_failures_processed: 0,
    total_reincarnations: 0,
    lessons_learned: 0,
    strategies_evolved: 0,
    spiritual_wisdom_gained: 0,
    most_common_failure: '',
    deepest_lesson: '',
    reincarnation_success_rate: 0
  };

  constructor() {
    this.loadKonslangLessons();
  }

  private loadKonslangLessons(): void {
    try {
      const fs = require('fs');
      const path = require('path');
      const lessonsPath = path.join(__dirname, '../data/konslang_lessons.json');
      this.konslang_lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
    } catch (error) {
      console.log('📜 Konslang lessons initialized with built-in wisdom');
      this.konslang_lessons = {
        "greed_loss": "Umbrai'tesh — Greed blinds the flame.",
        "impatience_exit": "Ner'valo — The river flows, even if the swimmer hurries.",
        "false_breakout": "Orin'sha — Not every door leads outside."
      };
    }
  }

  // 🔥 CORE REINCARNATION: Log a failed trade for eternal learning
  logFailure(
    trade_id: string, 
    context: any, 
    reason: string,
    loss_amount: number,
    market_data: any
  ): void {
    const konslang_code = this.getKonslangLesson(reason);
    const spiritual_weight = this.calculateSpiritualWeight(loss_amount, context);

    const failed_trade: FailedTrade = {
      id: trade_id,
      timestamp: Date.now(),
      context: {
        reason,
        loss: loss_amount,
        entry_price: context.entry_price || 0,
        exit_price: context.exit_price || 0,
        volatility: this.assessVolatility(market_data),
        pattern: context.pattern || 'unknown',
        market_phase: context.market_phase || 'unknown',
        rsi_at_entry: context.rsi || 50,
        volume_ratio: context.volume_ratio || 1.0,
        timeframe: context.timeframe || '5m',
        strategy_used: context.strategy || 'unknown',
        confidence_score: context.confidence || 0,
        risk_reward_ratio: context.risk_reward || 0,
        market_conditions: market_data
      },
      lesson: konslang_code,
      konslang_code,
      reincarnation_count: 0,
      last_analyzed: Date.now(),
      evolved_strategies: [],
      spiritual_weight
    };

    this.failed_trades.set(trade_id, failed_trade);
    this.reincarnation_stats.total_failures_processed++;
    this.reincarnation_stats.lessons_learned++;

    console.log(`💀➡️🔥 Trade ${trade_id} entered the reincarnation vault: ${konslang_code}`);
  }

  // 🧬 SPIRITUAL ANALYSIS: Calculate how much wisdom this failure offers
  private calculateSpiritualWeight(loss_amount: number, context: any): number {
    let weight = Math.min(Math.abs(loss_amount) * 10, 50); // Base weight from loss size
    
    // Add weight for confidence failures (more painful = more learning)
    if (context.confidence > 80 && loss_amount < 0) weight += 20;
    
    // Add weight for repeated pattern failures
    if (context.pattern === 'false_breakout') weight += 15;
    
    // Add weight for emotional failures
    if (context.reason?.includes('greed') || context.reason?.includes('fear')) weight += 25;
    
    return Math.min(weight, 100);
  }

  private assessVolatility(market_data: any): 'low' | 'normal' | 'high' | 'extreme' {
    const price_change = Math.abs(market_data?.price_change_24h || 0);
    if (price_change > 10) return 'extreme';
    if (price_change > 5) return 'high';
    if (price_change > 2) return 'normal';
    return 'low';
  }

  private getKonslangLesson(reason: string): string {
    return this.konslang_lessons[reason] || "Mor'thain — Every fall teaches the soul to rise.";
  }

  // 🔄 REINCARNATION CYCLE: Get all failed trades ready for rebirth
  getAllFailures(): FailedTrade[] {
    return Array.from(this.failed_trades.values());
  }

  // 🌅 REBIRTH TRACKING: Mark a trade as reincarnated
  markReincarnated(trade_id: string, evolved_strategy: string): void {
    const trade = this.failed_trades.get(trade_id);
    if (trade) {
      trade.reincarnation_count++;
      trade.last_analyzed = Date.now();
      trade.evolved_strategies.push(evolved_strategy);
      this.reincarnation_stats.total_reincarnations++;
      this.reincarnation_stats.strategies_evolved++;
      
      console.log(`🔥➡️🌅 Trade ${trade_id} has been reincarnated ${trade.reincarnation_count} times`);
    }
  }

  // 📊 WISDOM ANALYSIS: Get insights from all failures
  getReincarnationWisdom(): {
    total_souls_processed: number;
    most_painful_lesson: FailedTrade | null;
    most_reincarnated: FailedTrade | null;
    failure_patterns: { [key: string]: number };
    spiritual_growth: number;
    konslang_wisdom: string[];
  } {
    const failures = this.getAllFailures();
    const failure_patterns: { [key: string]: number } = {};
    
    let most_painful: FailedTrade | null = null;
    let most_reincarnated: FailedTrade | null = null;
    let total_spiritual_weight = 0;

    failures.forEach(trade => {
      // Track failure patterns
      const reason = trade.context.reason;
      failure_patterns[reason] = (failure_patterns[reason] || 0) + 1;
      
      // Find most painful lesson
      if (!most_painful || trade.spiritual_weight > most_painful.spiritual_weight) {
        most_painful = trade;
      }
      
      // Find most reincarnated
      if (!most_reincarnated || trade.reincarnation_count > most_reincarnated.reincarnation_count) {
        most_reincarnated = trade;
      }
      
      total_spiritual_weight += trade.spiritual_weight;
    });

    // Extract unique Konslang wisdom
    const konslang_wisdom = [...new Set(failures.map(t => t.konslang_code))];

    return {
      total_souls_processed: failures.length,
      most_painful_lesson: most_painful,
      most_reincarnated: most_reincarnated,
      failure_patterns,
      spiritual_growth: total_spiritual_weight,
      konslang_wisdom
    };
  }

  // 🔍 SOUL SEARCH: Find trades that need reincarnation
  getTradesReadyForReincarnation(): FailedTrade[] {
    const now = Date.now();
    const hour_ago = now - (60 * 60 * 1000);
    
    return this.getAllFailures().filter(trade => 
      trade.last_analyzed < hour_ago || 
      trade.reincarnation_count === 0 ||
      trade.spiritual_weight > 70 // High-impact failures get priority
    );
  }

  // 📈 STATS: Get reincarnation statistics
  getReincarnationStats(): ReincarnationStats {
    const failures = this.getAllFailures();
    const patterns = failures.reduce((acc, trade) => {
      const reason = trade.context.reason;
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Find most common failure
    const most_common = Object.entries(patterns)
      .sort(([,a], [,b]) => b - a)[0];
    
    this.reincarnation_stats.most_common_failure = most_common ? most_common[0] : '';
    
    // Calculate success rate (trades that evolved strategies)
    const evolved_count = failures.filter(t => t.evolved_strategies.length > 0).length;
    this.reincarnation_stats.reincarnation_success_rate = 
      failures.length > 0 ? (evolved_count / failures.length) * 100 : 0;

    return this.reincarnation_stats;
  }

  // 🧹 SOUL CLEANSING: Clear old, less impactful failures
  cleanseAncientSouls(keep_count: number = 100): void {
    const failures = this.getAllFailures()
      .sort((a, b) => b.spiritual_weight - a.spiritual_weight)
      .slice(0, keep_count);
    
    this.failed_trades.clear();
    failures.forEach(trade => {
      this.failed_trades.set(trade.id, trade);
    });
    
    console.log(`🧹 Soul cleansing complete. Kept ${failures.length} most impactful lessons.`);
  }
}

export const waidesKILossMemoryVault = new WaidesKILossMemoryVault();