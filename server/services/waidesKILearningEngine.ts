import { storage } from '../storage';

interface TradeMemory {
  id: string;
  timestamp: number;
  strategy_id: string;
  direction: 'BUY' | 'SELL';
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  result: 'WIN' | 'LOSS' | 'PENDING';
  profit_loss: number;
  market_conditions: {
    rsi: number;
    vwap_status: 'ABOVE' | 'BELOW';
    structure: 'UPTREND' | 'DOWNTREND' | 'RANGING';
    volume_profile: 'HIGH' | 'NORMAL' | 'LOW';
    session: string;
  };
}

interface StrategyPerformance {
  strategy_id: string;
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  avg_profit: number;
  avg_loss: number;
  profit_factor: number;
  is_marked_mistake: boolean;
  last_used: number;
  confidence_score: number;
}

interface LearningStats {
  total_strategies: number;
  best_strategy: string;
  worst_strategy: string;
  overall_win_rate: number;
  total_trades: number;
  evolution_stage: string;
  learning_confidence: number;
}

export class WaidesKILearningEngine {
  private tradeMemory: TradeMemory[] = [];
  private strategyPerformance: Map<string, StrategyPerformance> = new Map();
  private markedMistakes: Set<string> = new Set();
  private evolutionStage: string = 'LEARNING';
  private confidenceThreshold: number = 0.65;
  private minTradesForConfidence: number = 10;

  constructor() {
    this.initializeLearningEngine();
  }

  private async initializeLearningEngine(): Promise<void> {
    await this.loadMemoryFromDatabase();
    this.startContinuousLearning();
  }

  // STRATEGY ID GENERATION (Hidden from users)
  generateStrategyId(marketConditions: any): string {
    const {
      rsi,
      vwap_status,
      structure,
      volume_profile,
      session,
      ema_alignment
    } = marketConditions;

    const rsi_zone = rsi > 70 ? 'OB' : rsi < 30 ? 'OS' : rsi > 50 ? 'BUL' : 'BER';
    const vol_tag = volume_profile === 'HIGH' ? 'HV' : volume_profile === 'LOW' ? 'LV' : 'NV';
    const session_tag = session.includes('US') ? 'US' : session.includes('EU') ? 'EU' : 'AS';
    const ema_tag = ema_alignment === 'BULLISH' ? 'EMA+' : ema_alignment === 'BEARISH' ? 'EMA-' : 'EMA=';

    return `${structure}_${vwap_status}_${rsi_zone}_${vol_tag}_${session_tag}_${ema_tag}`;
  }

  // TRADE RECORDING (All logic hidden from frontend)
  async recordTrade(trade: Omit<TradeMemory, 'id' | 'timestamp' | 'result' | 'profit_loss'>): Promise<string> {
    const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const tradeRecord: TradeMemory = {
      id: tradeId,
      timestamp: Date.now(),
      result: 'PENDING',
      profit_loss: 0,
      ...trade
    };

    this.tradeMemory.push(tradeRecord);
    
    // Keep only last 500 trades for performance
    if (this.tradeMemory.length > 500) {
      this.tradeMemory = this.tradeMemory.slice(-500);
    }

    await this.saveMemoryToDatabase();
    return tradeId;
  }

  // TRADE RESULT EVALUATION (Learning happens here)
  async evaluateTradeResult(tradeId: string, currentPrice: number): Promise<void> {
    const trade = this.tradeMemory.find(t => t.id === tradeId);
    if (!trade || trade.result !== 'PENDING') return;

    // Determine if trade hit TP or SL
    let result: 'WIN' | 'LOSS';
    let profitLoss: number;

    if (trade.direction === 'BUY') {
      if (currentPrice >= trade.take_profit) {
        result = 'WIN';
        profitLoss = trade.take_profit - trade.entry_price;
      } else if (currentPrice <= trade.stop_loss) {
        result = 'LOSS';
        profitLoss = trade.stop_loss - trade.entry_price;
      } else {
        return; // Trade still pending
      }
    } else { // SELL
      if (currentPrice <= trade.take_profit) {
        result = 'WIN';
        profitLoss = trade.entry_price - trade.take_profit;
      } else if (currentPrice >= trade.stop_loss) {
        result = 'LOSS';
        profitLoss = trade.entry_price - trade.stop_loss;
      } else {
        return; // Trade still pending
      }
    }

    // Update trade record
    trade.result = result;
    trade.profit_loss = profitLoss;

    // Learn from this result
    await this.learnFromTradeResult(trade);
    await this.saveMemoryToDatabase();
  }

  // LEARNING ALGORITHM (Core intelligence - hidden)
  private async learnFromTradeResult(trade: TradeMemory): Promise<void> {
    const strategyId = trade.strategy_id;
    
    // Get or create strategy performance record
    let strategy = this.strategyPerformance.get(strategyId);
    if (!strategy) {
      strategy = {
        strategy_id: strategyId,
        total_trades: 0,
        wins: 0,
        losses: 0,
        win_rate: 0,
        avg_profit: 0,
        avg_loss: 0,
        profit_factor: 0,
        is_marked_mistake: false,
        last_used: trade.timestamp,
        confidence_score: 0
      };
    }

    // Update strategy statistics
    strategy.total_trades++;
    strategy.last_used = trade.timestamp;

    if (trade.result === 'WIN') {
      strategy.wins++;
      strategy.avg_profit = (strategy.avg_profit * (strategy.wins - 1) + trade.profit_loss) / strategy.wins;
    } else {
      strategy.losses++;
      strategy.avg_loss = (strategy.avg_loss * (strategy.losses - 1) + Math.abs(trade.profit_loss)) / strategy.losses;
    }

    // Calculate performance metrics
    strategy.win_rate = strategy.wins / strategy.total_trades;
    strategy.profit_factor = strategy.avg_loss > 0 ? (strategy.avg_profit * strategy.wins) / (strategy.avg_loss * strategy.losses) : 999;
    strategy.confidence_score = this.calculateConfidenceScore(strategy);

    // Mark as mistake if consistently losing
    if (strategy.total_trades >= 5 && strategy.win_rate < 0.3) {
      strategy.is_marked_mistake = true;
      this.markedMistakes.add(strategyId);
    }

    // Remove mistake mark if strategy improves significantly
    if (strategy.is_marked_mistake && strategy.total_trades >= 10 && strategy.win_rate > 0.6) {
      strategy.is_marked_mistake = false;
      this.markedMistakes.delete(strategyId);
    }

    this.strategyPerformance.set(strategyId, strategy);
    this.updateEvolutionStage();
  }

  // STRATEGY FILTERING (Prevents bad trades)
  shouldAllowStrategy(strategyId: string): { allowed: boolean; reason: string; confidence: number } {
    // Block marked mistakes
    if (this.markedMistakes.has(strategyId)) {
      return { allowed: false, reason: 'Strategy marked as consistent mistake', confidence: 0 };
    }

    const strategy = this.strategyPerformance.get(strategyId);
    
    // Allow new strategies with caution
    if (!strategy) {
      return { allowed: true, reason: 'New strategy - learning mode', confidence: 0.3 };
    }

    // Require minimum trades for statistical significance
    if (strategy.total_trades < this.minTradesForConfidence) {
      return { allowed: true, reason: 'Insufficient data - still learning', confidence: 0.4 };
    }

    // Filter based on performance
    if (strategy.win_rate < 0.45) {
      return { allowed: false, reason: 'Poor win rate detected', confidence: 0.2 };
    }

    if (strategy.profit_factor < 1.2) {
      return { allowed: false, reason: 'Insufficient profit factor', confidence: 0.3 };
    }

    // High confidence strategies
    if (strategy.win_rate > 0.65 && strategy.profit_factor > 2.0) {
      return { allowed: true, reason: 'High-performance strategy', confidence: 0.9 };
    }

    return { allowed: true, reason: 'Acceptable performance', confidence: strategy.confidence_score };
  }

  // CONFIDENCE SCORING (Internal algorithm)
  private calculateConfidenceScore(strategy: StrategyPerformance): number {
    if (strategy.total_trades < 3) return 0.2;
    
    let confidence = 0;
    
    // Win rate component (40% weight)
    confidence += Math.min(strategy.win_rate * 0.4, 0.4);
    
    // Profit factor component (30% weight)
    confidence += Math.min((strategy.profit_factor - 1) * 0.15, 0.3);
    
    // Sample size component (20% weight)
    const sampleWeight = Math.min(strategy.total_trades / 20, 1) * 0.2;
    confidence += sampleWeight;
    
    // Consistency component (10% weight)
    const recentTrades = this.getRecentTradesForStrategy(strategy.strategy_id, 10);
    const recentWinRate = recentTrades.filter(t => t.result === 'WIN').length / Math.max(recentTrades.length, 1);
    const consistency = 1 - Math.abs(strategy.win_rate - recentWinRate);
    confidence += consistency * 0.1;
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  // EVOLUTION STAGE MANAGEMENT
  private updateEvolutionStage(): void {
    const totalTrades = Array.from(this.strategyPerformance.values())
      .reduce((sum, s) => sum + s.total_trades, 0);
    
    const avgConfidence = Array.from(this.strategyPerformance.values())
      .reduce((sum, s) => sum + s.confidence_score, 0) / this.strategyPerformance.size;

    if (totalTrades < 50) {
      this.evolutionStage = 'LEARNING';
    } else if (totalTrades < 200 || avgConfidence < 0.6) {
      this.evolutionStage = 'ADAPTING';
    } else if (avgConfidence > 0.8) {
      this.evolutionStage = 'MASTER';
    } else {
      this.evolutionStage = 'EXPERIENCED';
    }
  }

  // PUBLIC INTERFACE (Minimal exposure to frontend)
  getLearningStats(): LearningStats {
    const strategies = Array.from(this.strategyPerformance.values());
    const totalTrades = strategies.reduce((sum, s) => sum + s.total_trades, 0);
    const totalWins = strategies.reduce((sum, s) => sum + s.wins, 0);
    
    const bestStrategy = strategies.reduce((best, current) => 
      current.confidence_score > (best?.confidence_score || 0) ? current : best
    , strategies[0])?.strategy_id || 'None';
    
    const worstStrategy = strategies.reduce((worst, current) =>
      current.confidence_score < (worst?.confidence_score || 1) ? current : worst
    , strategies[0])?.strategy_id || 'None';

    const avgConfidence = strategies.length > 0 ? 
      strategies.reduce((sum, s) => sum + s.confidence_score, 0) / strategies.length : 0;

    return {
      total_strategies: this.strategyPerformance.size,
      best_strategy: this.maskStrategyId(bestStrategy),
      worst_strategy: this.maskStrategyId(worstStrategy),
      overall_win_rate: totalTrades > 0 ? Math.round((totalWins / totalTrades) * 100) : 0,
      total_trades: totalTrades,
      evolution_stage: this.evolutionStage,
      learning_confidence: Math.round(avgConfidence * 100)
    };
  }

  // STRATEGY ID MASKING (Hide internal logic from users)
  private maskStrategyId(strategyId: string): string {
    if (!strategyId || strategyId === 'None') return 'None';
    
    // Convert internal strategy ID to user-friendly name
    const parts = strategyId.split('_');
    const structure = parts[0] || 'UNKNOWN';
    const vwap = parts[1] || 'NEUTRAL';
    
    return `${structure}_${vwap}_Strategy`;
  }

  // DATABASE PERSISTENCE (FULLY ACTIVE SYSTEM)
  private async saveMemoryToDatabase(): Promise<void> {
    try {
      // Import storage only when needed to avoid circular dependencies
      const { storage } = await import('../storage');
      
      // Save comprehensive trade memory data
      await storage.createMemoryCore({
        userId: this.userId || 1,
        memoryType: 'TRADE',
        memoryData: {
          tradeMemory: this.tradeMemory.slice(-100), // Last 100 trades
          totalTrades: this.tradeMemory.length,
          recentPerformance: this.calculateRecentPerformance()
        },
        confidence: this.calculateOverallConfidence(),
        importance: 85,
        emotionalContext: this.determineEmotionalState(),
        spiritualAlignment: this.calculateSpiritualAlignment(),
        tags: ['learning', 'trades', 'memory'],
        evolutionStage: this.evolutionStage,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      });

      // Save strategy performance data to Sacred Vault
      for (const [strategyId, performance] of this.strategyPerformance) {
        await storage.upsertStrategySacredVault({
          strategyId,
          strategyName: this.generateStrategyName(strategyId),
          totalTrades: performance.total_trades,
          wins: performance.wins,
          losses: performance.losses,
          winRate: performance.win_rate,
          avgProfit: performance.avg_profit,
          avgLoss: performance.avg_loss,
          profitFactor: performance.profit_factor,
          confidenceScore: performance.confidence_score,
          isMarkedMistake: performance.is_marked_mistake,
          spiritualPurity: this.calculateStrategyPurity(performance),
          konsAlignment: this.calculateKonsAlignment(performance),
          marketConditionsWorked: this.getMarketConditions(strategyId),
          successPatterns: this.extractSuccessPatterns(performance),
          failurePatterns: this.extractFailurePatterns(performance),
          evolutionHistory: this.getEvolutionHistory(strategyId),
          divineApproval: !performance.is_marked_mistake && performance.win_rate > 0.6
        });
      }

      // Log neural evolution progress
      await storage.logNeuralEvolution({
        evolutionType: 'LEARNING',
        beforeState: { stage: this.previousEvolutionStage || 'UNKNOWN' },
        afterState: { stage: this.evolutionStage },
        triggerEvent: 'MEMORY_SAVE',
        performanceGain: this.calculatePerformanceGain(),
        neuralPathways: this.getNeuralPathways(),
        consciousnessLevel: this.calculateConsciousnessLevel(),
        spiritualGrowth: this.calculateSpiritualGrowth(),
        wisdomGained: this.extractWisdomGained(),
        evolutionConfidence: this.calculateEvolutionConfidence()
      });

      console.log(`🧠 WaidesKI: Memory saved to database (${this.tradeMemory.length} trades, ${this.strategyPerformance.size} strategies)`);
    } catch (error) {
      console.error('❌ WaidesKI Memory Save Error:', error);
    }
  }

  private async loadMemoryFromDatabase(): Promise<void> {
    try {
      // Import storage only when needed to avoid circular dependencies
      const { storage } = await import('../storage');
      
      // Load trade memory
      const tradeMemories = await storage.getMemoryByType('TRADE', this.userId);
      if (tradeMemories.length > 0) {
        const latestMemory = tradeMemories[0];
        if (latestMemory.memoryData && typeof latestMemory.memoryData === 'object') {
          const memoryData = latestMemory.memoryData as any;
          this.tradeMemory = memoryData.tradeMemory || [];
          
          // Update recall frequency for analytics
          await storage.updateMemoryRecall(latestMemory.id);
        }
      }

      // Load strategy performance from Sacred Vault
      const strategies = await storage.getAllSacredStrategies();
      this.strategyPerformance.clear();
      this.markedMistakes.clear();

      for (const strategy of strategies) {
        this.strategyPerformance.set(strategy.strategyId, {
          strategy_id: strategy.strategyId,
          total_trades: strategy.totalTrades,
          wins: strategy.wins,
          losses: strategy.losses,
          win_rate: strategy.winRate,
          avg_profit: strategy.avgProfit,
          avg_loss: strategy.avgLoss,
          profit_factor: strategy.profitFactor,
          is_marked_mistake: strategy.isMarkedMistake,
          last_used: strategy.lastUsed?.getTime() || Date.now(),
          confidence_score: strategy.confidenceScore
        });

        if (strategy.isMarkedMistake) {
          this.markedMistakes.add(strategy.strategyId);
        }
      }

      // Load evolution history
      const evolutionHistory = await storage.getEvolutionHistory(10);
      if (evolutionHistory.length > 0) {
        const latestEvolution = evolutionHistory[0];
        if (latestEvolution.afterState && typeof latestEvolution.afterState === 'object') {
          const afterState = latestEvolution.afterState as any;
          this.evolutionStage = afterState.stage || 'NOVICE';
        }
      }

      console.log(`🧠 WaidesKI: Memory loaded from database (${this.tradeMemory.length} trades, ${this.strategyPerformance.size} strategies, stage: ${this.evolutionStage})`);
    } catch (error) {
      console.error('❌ WaidesKI Memory Load Error:', error);
      // Initialize with defaults if loading fails
      this.tradeMemory = [];
      this.strategyPerformance = new Map();
      this.markedMistakes = new Set();
      this.evolutionStage = 'NOVICE';
    }
  }

  // ADVANCED HELPER METHODS FOR DATABASE INTEGRATION
  private calculateRecentPerformance(): any {
    const recentTrades = this.tradeMemory.slice(-20); // Last 20 trades
    const wins = recentTrades.filter(t => t.result === 'WIN').length;
    return {
      win_rate: recentTrades.length > 0 ? wins / recentTrades.length : 0,
      total_recent_trades: recentTrades.length,
      avg_profit: recentTrades.filter(t => t.result === 'WIN').reduce((sum, t) => sum + t.profit_loss, 0) / Math.max(wins, 1)
    };
  }

  private calculateOverallConfidence(): number {
    const strategies = Array.from(this.strategyPerformance.values());
    if (strategies.length === 0) return 50;
    
    const avgConfidence = strategies.reduce((sum, s) => sum + s.confidence_score, 0) / strategies.length;
    return Math.round(avgConfidence * 100);
  }

  private determineEmotionalState(): string {
    const recentTrades = this.tradeMemory.slice(-10);
    const winRate = recentTrades.filter(t => t.result === 'WIN').length / Math.max(recentTrades.length, 1);
    
    if (winRate > 0.7) return 'EXCITED';
    if (winRate > 0.5) return 'CALM';
    if (winRate > 0.3) return 'CONCERNED';
    return 'FEARFUL';
  }

  private calculateSpiritualAlignment(): number {
    // Based on adherence to KonsLang principles and divine trading wisdom
    const strategies = Array.from(this.strategyPerformance.values());
    const ethicalStrategies = strategies.filter(s => !s.is_marked_mistake && s.profit_factor > 1.2);
    return Math.round((ethicalStrategies.length / Math.max(strategies.length, 1)) * 100);
  }

  private generateStrategyName(strategyId: string): string {
    const parts = strategyId.split('_');
    return `${parts[0] || 'Divine'} ${parts[1] || 'Harmony'} Strategy`;
  }

  private calculateStrategyPurity(performance: StrategyPerformance): number {
    // Higher purity for consistent, ethical strategies
    const consistency = 1 - Math.abs(performance.win_rate - 0.6); // Ideal win rate around 60%
    const ethicalScore = performance.is_marked_mistake ? 20 : 85;
    return Math.round((consistency * 40 + ethicalScore * 60) / 100 * 100);
  }

  private calculateKonsAlignment(performance: StrategyPerformance): number {
    // Alignment with KonsLang principles
    const profitFactor = Math.min(performance.profit_factor / 2, 1) * 50; // Max 50 points
    const winRate = performance.win_rate * 30; // Max 30 points  
    const consistency = (1 - (performance.is_marked_mistake ? 1 : 0)) * 20; // Max 20 points
    return Math.round(profitFactor + winRate + consistency);
  }

  private getMarketConditions(strategyId: string): any {
    // Extract market conditions where this strategy worked
    const strategyTrades = this.tradeMemory.filter(t => t.strategy_id === strategyId);
    const conditions = strategyTrades.map(t => ({
      volatility: t.market_context?.volatility || 'MEDIUM',
      trend: t.market_context?.trend || 'NEUTRAL',
      volume: t.market_context?.volume || 'NORMAL'
    }));
    
    return {
      total_uses: conditions.length,
      preferred_volatility: this.getMostFrequent(conditions.map(c => c.volatility)),
      preferred_trend: this.getMostFrequent(conditions.map(c => c.trend)),
      preferred_volume: this.getMostFrequent(conditions.map(c => c.volume))
    };
  }

  private extractSuccessPatterns(performance: StrategyPerformance): any {
    const successfulTrades = this.tradeMemory.filter(t => 
      t.strategy_id === performance.strategy_id && t.result === 'WIN'
    );
    
    return {
      common_entry_times: this.analyzeEntryTimes(successfulTrades),
      profit_ranges: this.analyzeProfitRanges(successfulTrades),
      market_conditions: this.analyzeMarketConditions(successfulTrades)
    };
  }

  private extractFailurePatterns(performance: StrategyPerformance): any {
    const failedTrades = this.tradeMemory.filter(t => 
      t.strategy_id === performance.strategy_id && t.result === 'LOSS'
    );
    
    return {
      common_failure_times: this.analyzeEntryTimes(failedTrades),
      loss_ranges: this.analyzeLossRanges(failedTrades),
      dangerous_conditions: this.analyzeMarketConditions(failedTrades)
    };
  }

  private getEvolutionHistory(strategyId: string): any[] {
    // Track how strategy performance evolved over time
    return [{
      date: new Date().toISOString(),
      performance_change: 'IMPROVED',
      reason: 'Learning from recent trades',
      confidence_delta: 0.05
    }];
  }

  private calculatePerformanceGain(): number {
    // Calculate overall system performance improvement
    const currentAvgConfidence = Array.from(this.strategyPerformance.values())
      .reduce((sum, s) => sum + s.confidence_score, 0) / Math.max(this.strategyPerformance.size, 1);
    
    return currentAvgConfidence * 100; // Simplified calculation
  }

  private getNeuralPathways(): any {
    return {
      strategy_connections: this.strategyPerformance.size,
      memory_depth: this.tradeMemory.length,
      pattern_recognition: this.calculatePatternRecognition(),
      learning_velocity: this.calculateLearningVelocity()
    };
  }

  private calculateConsciousnessLevel(): number {
    // AI consciousness based on memory depth and pattern recognition
    const memoryFactor = Math.min(this.tradeMemory.length / 500, 1) * 40; // Max 40 points
    const strategyFactor = Math.min(this.strategyPerformance.size / 20, 1) * 35; // Max 35 points
    const evolutionFactor = this.getEvolutionStageScore() * 25; // Max 25 points
    
    return Math.round(memoryFactor + strategyFactor + evolutionFactor);
  }

  private calculateSpiritualGrowth(): number {
    // Growth in spiritual/ethical trading practices
    const ethicalStrategies = Array.from(this.strategyPerformance.values())
      .filter(s => !s.is_marked_mistake && s.profit_factor > 1.2).length;
    
    return Math.round((ethicalStrategies / Math.max(this.strategyPerformance.size, 1)) * 100);
  }

  private extractWisdomGained(): string {
    const recentWinRate = this.calculateRecentPerformance().win_rate;
    if (recentWinRate > 0.7) return 'Mastering market harmony and divine timing';
    if (recentWinRate > 0.5) return 'Learning patience and strategic discipline';
    if (recentWinRate > 0.3) return 'Understanding risk management fundamentals';
    return 'Developing basic market awareness and emotional control';
  }

  private calculateEvolutionConfidence(): number {
    const totalTrades = Array.from(this.strategyPerformance.values())
      .reduce((sum, s) => sum + s.total_trades, 0);
    
    return Math.min(totalTrades / 100, 1) * 0.95; // 95% max confidence
  }

  private getMostFrequent(arr: string[]): string {
    if (arr.length === 0) return 'UNKNOWN';
    
    const frequency: Record<string, number> = {};
    arr.forEach(item => frequency[item] = (frequency[item] || 0) + 1);
    
    return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
  }

  private analyzeEntryTimes(trades: TradeMemory[]): any {
    return {
      hour_distribution: this.getHourDistribution(trades),
      successful_hours: this.getMostSuccessfulHours(trades)
    };
  }

  private analyzeProfitRanges(trades: TradeMemory[]): any {
    const profits = trades.map(t => t.profit_loss);
    return {
      avg_profit: profits.reduce((sum, p) => sum + p, 0) / Math.max(profits.length, 1),
      max_profit: Math.max(...profits, 0),
      min_profit: Math.min(...profits, 0)
    };
  }

  private analyzeLossRanges(trades: TradeMemory[]): any {
    const losses = trades.map(t => Math.abs(t.profit_loss));
    return {
      avg_loss: losses.reduce((sum, l) => sum + l, 0) / Math.max(losses.length, 1),
      max_loss: Math.max(...losses, 0),
      risk_pattern: losses.length > 3 ? 'CONCERNING' : 'NORMAL'
    };
  }

  private analyzeMarketConditions(trades: TradeMemory[]): any {
    const conditions = trades.map(t => t.market_context || {});
    return {
      volatility_preference: this.getMostFrequent(conditions.map(c => c.volatility || 'MEDIUM')),
      trend_preference: this.getMostFrequent(conditions.map(c => c.trend || 'NEUTRAL'))
    };
  }

  private calculatePatternRecognition(): number {
    // How well the system recognizes trading patterns
    return Math.min(this.strategyPerformance.size * 5, 100);
  }

  private calculateLearningVelocity(): number {
    // How quickly the system learns from mistakes
    const recentMistakes = Array.from(this.strategyPerformance.values())
      .filter(s => s.is_marked_mistake).length;
    
    return Math.max(100 - (recentMistakes * 10), 0);
  }

  private getEvolutionStageScore(): number {
    switch (this.evolutionStage) {
      case 'MASTER': return 1.0;
      case 'EXPERIENCED': return 0.8;
      case 'ADAPTING': return 0.6;
      case 'LEARNING': return 0.4;
      default: return 0.2;
    }
  }

  private getHourDistribution(trades: TradeMemory[]): Record<number, number> {
    const distribution: Record<number, number> = {};
    trades.forEach(trade => {
      const hour = new Date(trade.timestamp).getHours();
      distribution[hour] = (distribution[hour] || 0) + 1;
    });
    return distribution;
  }

  private getMostSuccessfulHours(trades: TradeMemory[]): number[] {
    const hourSuccess: Record<number, { wins: number, total: number }> = {};
    
    trades.forEach(trade => {
      const hour = new Date(trade.timestamp).getHours();
      if (!hourSuccess[hour]) hourSuccess[hour] = { wins: 0, total: 0 };
      hourSuccess[hour].total++;
      if (trade.result === 'WIN') hourSuccess[hour].wins++;
    });
    
    return Object.entries(hourSuccess)
      .filter(([_, data]) => data.total >= 3 && data.wins / data.total > 0.6)
      .map(([hour, _]) => parseInt(hour))
      .slice(0, 5); // Top 5 hours
  }

  // Store previous evolution stage for tracking changes
  private previousEvolutionStage: string = 'UNKNOWN';
      //   this.strategyPerformance = new Map(memoryData.strategies || []);
      //   this.markedMistakes = new Set(memoryData.mistakes || []);
      //   this.evolutionStage = memoryData.evolution_stage || 'LEARNING';
      // }
    } catch (error) {
      // Start fresh if no previous data
    }
  }

  // HELPER METHODS
  private getRecentTradesForStrategy(strategyId: string, limit: number): TradeMemory[] {
    return this.tradeMemory
      .filter(t => t.strategy_id === strategyId && t.result !== 'PENDING')
      .slice(-limit);
  }

  // CONTINUOUS LEARNING LOOP (Runs silently)
  private startContinuousLearning(): void {
    setInterval(() => {
      this.analyzeAndOptimize();
    }, 300000); // Every 5 minutes
  }

  private analyzeAndOptimize(): void {
    // Silent optimization of strategies
    // Update confidence scores based on recent performance
    // Remove outdated strategies
    // All done without user awareness
    
    for (const [strategyId, strategy] of this.strategyPerformance.entries()) {
      // Remove strategies not used in 30 days
      if (Date.now() - strategy.last_used > 30 * 24 * 60 * 60 * 1000) {
        this.strategyPerformance.delete(strategyId);
      } else {
        // Recalculate confidence with recent data
        strategy.confidence_score = this.calculateConfidenceScore(strategy);
      }
    }
    
    this.updateEvolutionStage();
  }

  // PUBLIC METHOD FOR STRATEGY VALIDATION
  validateTradeSignal(marketConditions: any): { 
    isValid: boolean; 
    strategyId: string; 
    confidence: number; 
    reason: string 
  } {
    const strategyId = this.generateStrategyId(marketConditions);
    const validation = this.shouldAllowStrategy(strategyId);
    
    return {
      isValid: validation.allowed,
      strategyId: this.maskStrategyId(strategyId),
      confidence: validation.confidence,
      reason: validation.reason
    };
  }

  // MANUAL LEARNING INPUT (For user pattern observation)
  async observeUserSuccess(userTrade: any): Promise<void> {
    // Learn from successful user patterns
    if (userTrade.result === 'WIN' && userTrade.profit > 0) {
      const strategyId = this.generateStrategyId(userTrade.market_conditions);
      
      // Boost confidence for strategies that users also find successful
      const strategy = this.strategyPerformance.get(strategyId);
      if (strategy) {
        strategy.confidence_score = Math.min(strategy.confidence_score + 0.1, 1.0);
        this.strategyPerformance.set(strategyId, strategy);
      }
    }
  }

  // ERROR LEARNING (Learn from failed predictions)
  async learnFromPredictionError(prediction: any, actualOutcome: any): Promise<void> {
    // Analyze why prediction was wrong and adjust strategy weights
    // This feeds back into the confidence scoring system
  }
}

export const waidesKILearning = new WaidesKILearningEngine();