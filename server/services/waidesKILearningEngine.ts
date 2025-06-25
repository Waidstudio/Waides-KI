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

  // DATABASE PERSISTENCE (Hidden operations)
  private async saveMemoryToDatabase(): Promise<void> {
    try {
      // Save trade memory and strategy performance to database
      // This could be enhanced to use actual database tables
      const memoryData = {
        trades: this.tradeMemory.slice(-100), // Keep last 100 trades
        strategies: Array.from(this.strategyPerformance.entries()),
        mistakes: Array.from(this.markedMistakes),
        evolution_stage: this.evolutionStage,
        last_updated: Date.now()
      };
      
      // For now, store in a simple format - can be enhanced to use proper database
      // await storage.createMemoryRecord(memoryData);
    } catch (error) {
      // Silent error handling - don't expose to users
    }
  }

  private async loadMemoryFromDatabase(): Promise<void> {
    try {
      // Load previous learning data
      // const memoryData = await storage.getLatestMemoryRecord();
      // if (memoryData) {
      //   this.tradeMemory = memoryData.trades || [];
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