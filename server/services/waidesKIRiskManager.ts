interface RiskProfile {
  baseCapital: number;
  currentCapital: number;
  maxRiskPercent: number;
  confidenceMultiplier: number;
  drawdownLimit: number;
  winStreak: number;
  lossStreak: number;
  totalTrades: number;
  winningTrades: number;
}

interface TradeRiskAssessment {
  recommendedAmount: number;
  confidenceWeight: number;
  riskPercent: number;
  reasoning: string[];
  approved: boolean;
  maxLoss: number;
  expectedReward: number;
}

interface CapitalUpdate {
  previousCapital: number;
  newCapital: number;
  pnl: number;
  tradeResult: 'WIN' | 'LOSS';
  newRiskProfile: RiskProfile;
}

export class WaidesKIRiskManager {
  private riskProfile: RiskProfile;
  private recentTrades: any[] = [];
  private blockedStrategies: Set<string> = new Set();
  private strategyPerformance: Map<string, { wins: number; losses: number; lastUsed: number }> = new Map();

  constructor(initialCapital: number = 10000) {
    this.riskProfile = {
      baseCapital: initialCapital,
      currentCapital: initialCapital,
      maxRiskPercent: 1.0, // Start conservative at 1%
      confidenceMultiplier: 1.5,
      drawdownLimit: 0.15, // 15% maximum drawdown
      winStreak: 0,
      lossStreak: 0,
      totalTrades: 0,
      winningTrades: 0
    };
  }

  // CONFIDENCE-BASED POSITION SIZING
  calculateTradeAmount(
    signalStrength: number,
    confidence: number,
    strategyId: string,
    marketConditions: any
  ): TradeRiskAssessment {
    const reasoning: string[] = [];
    
    // Check if strategy is blocked
    if (this.isStrategyBlocked(strategyId)) {
      return {
        recommendedAmount: 0,
        confidenceWeight: 0,
        riskPercent: 0,
        reasoning: ['Strategy blocked due to recent poor performance'],
        approved: false,
        maxLoss: 0,
        expectedReward: 0
      };
    }

    // Base risk calculation
    let baseRiskPercent = this.riskProfile.maxRiskPercent;
    reasoning.push(`Base risk: ${baseRiskPercent}% of capital`);

    // Confidence weighting (0.5x to 2.0x multiplier)
    const confidenceWeight = Math.max(0.5, Math.min(2.0, confidence / 50));
    reasoning.push(`Confidence weight: ${confidenceWeight.toFixed(2)}x (${confidence}% confidence)`);

    // Dynamic risk adjustment based on recent performance
    const performanceMultiplier = this.getPerformanceMultiplier();
    reasoning.push(`Performance adjustment: ${performanceMultiplier.toFixed(2)}x`);

    // Market condition risk adjustment
    const marketRiskMultiplier = this.getMarketRiskMultiplier(marketConditions);
    reasoning.push(`Market risk adjustment: ${marketRiskMultiplier.toFixed(2)}x`);

    // Calculate final risk percent
    const finalRiskPercent = Math.min(
      baseRiskPercent * confidenceWeight * performanceMultiplier * marketRiskMultiplier,
      this.riskProfile.maxRiskPercent * 2 // Never exceed 2x base risk
    );

    // Calculate trade amount
    const recommendedAmount = (this.riskProfile.currentCapital * finalRiskPercent) / 100;
    
    // Safety checks
    const approved = this.validateTradeRisk(recommendedAmount, finalRiskPercent);
    
    const maxLoss = recommendedAmount; // Assuming 1:1 stop loss
    const expectedReward = recommendedAmount * 2; // Assuming 1:2 risk/reward

    return {
      recommendedAmount: approved ? recommendedAmount : 0,
      confidenceWeight,
      riskPercent: finalRiskPercent,
      reasoning,
      approved,
      maxLoss,
      expectedReward
    };
  }

  // STRATEGY FILTERING AND BLOCKING
  private isStrategyBlocked(strategyId: string): boolean {
    return this.blockedStrategies.has(strategyId);
  }

  blockStrategy(strategyId: string, reason: string): void {
    this.blockedStrategies.add(strategyId);
    
    // Auto-unblock after 24 hours
    setTimeout(() => {
      this.blockedStrategies.delete(strategyId);
    }, 24 * 60 * 60 * 1000);
  }

  unblockStrategy(strategyId: string): void {
    this.blockedStrategies.delete(strategyId);
  }

  // PERFORMANCE-BASED RISK ADJUSTMENT
  private getPerformanceMultiplier(): number {
    const winRate = this.riskProfile.totalTrades > 0 ? 
      this.riskProfile.winningTrades / this.riskProfile.totalTrades : 0.5;

    // Reduce risk after losses, increase after wins (within limits)
    if (this.riskProfile.lossStreak >= 3) {
      return 0.5; // Cut risk in half after 3 losses
    } else if (this.riskProfile.lossStreak >= 2) {
      return 0.75; // Reduce risk after 2 losses
    } else if (this.riskProfile.winStreak >= 3 && winRate > 0.6) {
      return 1.25; // Slight increase after 3 wins with good win rate
    } else if (winRate > 0.7 && this.riskProfile.totalTrades > 10) {
      return 1.1; // Small boost for proven good performance
    }
    
    return 1.0; // Normal risk
  }

  // MARKET CONDITION RISK ADJUSTMENT
  private getMarketRiskMultiplier(marketConditions: any): number {
    let multiplier = 1.0;
    
    // Reduce risk in volatile markets
    if (marketConditions.volatility && marketConditions.volatility > 0.03) {
      multiplier *= 0.8;
    }
    
    // Reduce risk in ranging markets
    if (marketConditions.trend === 'RANGING') {
      multiplier *= 0.9;
    }
    
    // Reduce risk during off-hours
    if (marketConditions.session === 'OFF_HOURS') {
      multiplier *= 0.85;
    }
    
    // Reduce risk with low volume
    if (marketConditions.volume_profile === 'LOW') {
      multiplier *= 0.9;
    }
    
    return multiplier;
  }

  // TRADE VALIDATION
  private validateTradeRisk(amount: number, riskPercent: number): boolean {
    // Check maximum single trade risk
    if (riskPercent > this.riskProfile.maxRiskPercent * 2) {
      return false;
    }
    
    // Check drawdown limit
    const currentDrawdown = (this.riskProfile.baseCapital - this.riskProfile.currentCapital) / this.riskProfile.baseCapital;
    if (currentDrawdown > this.riskProfile.drawdownLimit) {
      return false;
    }
    
    // Check minimum trade size
    if (amount < this.riskProfile.currentCapital * 0.001) { // Less than 0.1%
      return false;
    }
    
    return true;
  }

  // CAPITAL MANAGEMENT
  updateCapital(tradeResult: 'WIN' | 'LOSS', pnl: number, strategyId: string): CapitalUpdate {
    const previousCapital = this.riskProfile.currentCapital;
    
    // Update capital
    this.riskProfile.currentCapital += pnl;
    this.riskProfile.totalTrades++;
    
    // Update streaks and win rate
    if (tradeResult === 'WIN') {
      this.riskProfile.winningTrades++;
      this.riskProfile.winStreak++;
      this.riskProfile.lossStreak = 0;
      
      // Update strategy performance
      this.updateStrategyPerformance(strategyId, 'WIN');
      
    } else {
      this.riskProfile.lossStreak++;
      this.riskProfile.winStreak = 0;
      
      // Update strategy performance and potentially block it
      this.updateStrategyPerformance(strategyId, 'LOSS');
      this.checkAndBlockStrategy(strategyId);
    }
    
    // Adjust risk profile based on performance
    this.adjustRiskProfile();
    
    // Track recent trades
    this.recentTrades.push({
      timestamp: Date.now(),
      result: tradeResult,
      pnl,
      strategyId,
      capital: this.riskProfile.currentCapital
    });
    
    // Keep only last 50 trades
    if (this.recentTrades.length > 50) {
      this.recentTrades = this.recentTrades.slice(-50);
    }
    
    return {
      previousCapital,
      newCapital: this.riskProfile.currentCapital,
      pnl,
      tradeResult,
      newRiskProfile: { ...this.riskProfile }
    };
  }

  // STRATEGY PERFORMANCE TRACKING
  private updateStrategyPerformance(strategyId: string, result: 'WIN' | 'LOSS'): void {
    const performance = this.strategyPerformance.get(strategyId) || { wins: 0, losses: 0, lastUsed: 0 };
    
    if (result === 'WIN') {
      performance.wins++;
    } else {
      performance.losses++;
    }
    
    performance.lastUsed = Date.now();
    this.strategyPerformance.set(strategyId, performance);
  }

  private checkAndBlockStrategy(strategyId: string): void {
    const performance = this.strategyPerformance.get(strategyId);
    if (!performance) return;
    
    const totalTrades = performance.wins + performance.losses;
    const winRate = performance.wins / totalTrades;
    
    // Block strategy if it has poor recent performance
    if (totalTrades >= 5 && winRate < 0.3) {
      this.blockStrategy(strategyId, `Poor performance: ${winRate.toFixed(2)} win rate over ${totalTrades} trades`);
    }
  }

  // DYNAMIC RISK PROFILE ADJUSTMENT
  private adjustRiskProfile(): void {
    const winRate = this.riskProfile.totalTrades > 0 ? 
      this.riskProfile.winningTrades / this.riskProfile.totalTrades : 0;
    
    const currentDrawdown = (this.riskProfile.baseCapital - this.riskProfile.currentCapital) / this.riskProfile.baseCapital;
    
    // Adjust max risk based on performance and drawdown
    if (currentDrawdown > 0.1) { // 10% drawdown
      this.riskProfile.maxRiskPercent = Math.max(0.5, this.riskProfile.maxRiskPercent * 0.8);
    } else if (winRate > 0.65 && this.riskProfile.totalTrades > 20) {
      this.riskProfile.maxRiskPercent = Math.min(2.0, this.riskProfile.maxRiskPercent * 1.05);
    }
    
    // Reset to conservative settings if major losses
    if (currentDrawdown > this.riskProfile.drawdownLimit * 0.8) {
      this.riskProfile.maxRiskPercent = 0.5; // Very conservative
    }
  }

  // PUBLIC INTERFACE METHODS
  getRiskProfile(): RiskProfile {
    return { ...this.riskProfile };
  }

  getCapitalStats(): {
    currentCapital: number;
    totalReturn: number;
    totalReturnPercent: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
    blockedStrategies: number;
  } {
    const totalReturn = this.riskProfile.currentCapital - this.riskProfile.baseCapital;
    const totalReturnPercent = (totalReturn / this.riskProfile.baseCapital) * 100;
    const maxDrawdown = (this.riskProfile.baseCapital - this.riskProfile.currentCapital) / this.riskProfile.baseCapital;
    const winRate = this.riskProfile.totalTrades > 0 ? 
      (this.riskProfile.winningTrades / this.riskProfile.totalTrades) * 100 : 0;
    
    return {
      currentCapital: this.riskProfile.currentCapital,
      totalReturn,
      totalReturnPercent,
      maxDrawdown: Math.max(0, maxDrawdown) * 100,
      winRate,
      totalTrades: this.riskProfile.totalTrades,
      blockedStrategies: this.blockedStrategies.size
    };
  }

  getRecentPerformance(days: number = 7): {
    trades: number;
    winRate: number;
    totalPnL: number;
    averageTrade: number;
  } {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const recentTrades = this.recentTrades.filter(trade => trade.timestamp > cutoff);
    
    if (recentTrades.length === 0) {
      return { trades: 0, winRate: 0, totalPnL: 0, averageTrade: 0 };
    }
    
    const wins = recentTrades.filter(trade => trade.result === 'WIN').length;
    const totalPnL = recentTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    
    return {
      trades: recentTrades.length,
      winRate: (wins / recentTrades.length) * 100,
      totalPnL,
      averageTrade: totalPnL / recentTrades.length
    };
  }

  getStrategyBlacklist(): { strategyId: string; reason: string }[] {
    return Array.from(this.blockedStrategies).map(strategyId => ({
      strategyId: this.maskStrategyId(strategyId),
      reason: 'Poor recent performance'
    }));
  }

  // RISK CONTROL METHODS
  emergencyStop(): void {
    this.riskProfile.maxRiskPercent = 0; // Stop all trading
  }

  resetRiskProfile(): void {
    this.riskProfile.maxRiskPercent = 1.0;
    this.blockedStrategies.clear();
  }

  adjustMaxRisk(newMaxRisk: number): void {
    this.riskProfile.maxRiskPercent = Math.max(0.1, Math.min(5.0, newMaxRisk));
  }

  private maskStrategyId(strategyId: string): string {
    if (!strategyId) return 'Unknown';
    const parts = strategyId.split('_');
    return parts.slice(0, 2).join('_') + '_Strategy';
  }
}

export const waidesKIRiskManager = new WaidesKIRiskManager();

/**
 * SafeExecuteTrade - Loss-proof trading wrapper
 * Validates trade before execution and ensures risk management
 */
export async function SafeExecuteTrade(tradeData: any): Promise<{ 
  status: 'success' | 'failed'; 
  pnl?: number; 
  reason?: string;
  timestamp: string;
}> {
  try {
    // Pre-trade validation
    if (!tradeData || !tradeData.amount || tradeData.amount <= 0) {
      return { 
        status: 'failed', 
        reason: 'Invalid trade amount',
        timestamp: new Date().toISOString()
      };
    }

    if (!tradeData.botId || !tradeData.userId) {
      return { 
        status: 'failed', 
        reason: 'Missing required trade parameters',
        timestamp: new Date().toISOString()
      };
    }

    // Risk assessment
    const riskAssessment = waidesKIRiskManager.calculateTradeAmount(
      tradeData.signalStrength || 70,
      tradeData.confidence || 75,
      tradeData.strategyId || 'default',
      tradeData.marketConditions || {}
    );

    if (!riskAssessment.approved) {
      return { 
        status: 'failed', 
        reason: riskAssessment.reasoning.join('; '),
        timestamp: new Date().toISOString()
      };
    }

    // Execute trade (simulated for demo - replace with actual trading logic)
    const winProbability = Math.min(0.9, (tradeData.confidence || 75) / 100);
    const isWin = Math.random() < winProbability;
    
    const pnl = isWin 
      ? tradeData.amount * 0.03  // +3% profit
      : -tradeData.amount * 0.02; // -2% loss

    // Update risk manager with result
    waidesKIRiskManager.updateCapital(tradeData.amount, pnl, isWin ? 'WIN' : 'LOSS');

    console.log(`✅ SafeExecuteTrade: ${isWin ? 'WIN' : 'LOSS'} | P/L: $${pnl.toFixed(2)}`);

    return {
      status: 'success',
      pnl,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ SafeExecuteTrade error:', error);
    return {
      status: 'failed',
      reason: `Trade execution error: ${error}`,
      timestamp: new Date().toISOString()
    };
  }
}