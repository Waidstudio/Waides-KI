// STEP 65: Kelly Position Sizing Engine - Clinical-Grade Risk Management
// Scales position smartly based on performance stats and win rate optimization

interface KellyParameters {
  win_rate: number;
  avg_win: number;
  avg_loss: number;
  total_trades: number;
  confidence_factor: number;
}

interface PositionSizeResult {
  kelly_fraction: number;
  recommended_amount: number;
  max_safe_amount: number;
  risk_assessment: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  reasoning: string[];
}

export class WaidesKIKellySizer {
  private performanceHistory: Array<{
    outcome: 'win' | 'loss';
    profit_loss: number;
    timestamp: number;
    amount: number;
  }> = [];

  private baseCapital: number = 10000;
  private maxKellyFraction: number = 0.25; // Cap at 25% for safety
  private minKellyFraction: number = 0.01; // Minimum 1% position
  private conservativeFactor: number = 0.5; // Use half Kelly for safety

  constructor(initialCapital: number = 10000) {
    this.baseCapital = initialCapital;
    console.log('📏 Kelly Sizing Engine initialized with clinical-grade risk management');
  }

  public calculatePositionSize(
    accountBalance: number,
    maxTradeAmount: number,
    mlConfidence?: number
  ): PositionSizeResult {
    const kellyParams = this.calculateKellyParameters();
    const kellyFraction = this.getKellyFraction(kellyParams);
    
    // Apply ML confidence adjustment if available
    const adjustedFraction = mlConfidence ? 
      this.adjustForMLConfidence(kellyFraction, mlConfidence) : 
      kellyFraction;

    // Calculate position amounts
    const theoreticalAmount = accountBalance * adjustedFraction;
    const cappedAmount = Math.min(theoreticalAmount, maxTradeAmount);
    const safeAmount = Math.min(cappedAmount, accountBalance * this.maxKellyFraction);

    // Risk assessment
    const riskLevel = this.assessRisk(adjustedFraction, kellyParams);
    const reasoning = this.generateReasoning(kellyParams, adjustedFraction, mlConfidence);

    return {
      kelly_fraction: adjustedFraction,
      recommended_amount: Math.max(safeAmount, accountBalance * this.minKellyFraction),
      max_safe_amount: accountBalance * this.maxKellyFraction,
      risk_assessment: riskLevel,
      reasoning
    };
  }

  private calculateKellyParameters(): KellyParameters {
    if (this.performanceHistory.length < 10) {
      // Use conservative defaults for insufficient data
      return {
        win_rate: 0.55,
        avg_win: 0.02,
        avg_loss: 0.015,
        total_trades: this.performanceHistory.length,
        confidence_factor: 0.3
      };
    }

    const wins = this.performanceHistory.filter(trade => trade.outcome === 'win');
    const losses = this.performanceHistory.filter(trade => trade.outcome === 'loss');

    const winRate = wins.length / this.performanceHistory.length;
    const avgWin = wins.length > 0 ? 
      wins.reduce((sum, trade) => sum + Math.abs(trade.profit_loss), 0) / wins.length / this.baseCapital :
      0.02;
    const avgLoss = losses.length > 0 ?
      losses.reduce((sum, trade) => sum + Math.abs(trade.profit_loss), 0) / losses.length / this.baseCapital :
      0.015;

    // Confidence factor based on sample size and consistency
    const confidenceFactor = Math.min(1, this.performanceHistory.length / 100) * 
      this.calculateConsistencyFactor();

    return {
      win_rate: winRate,
      avg_win: avgWin,
      avg_loss: avgLoss,
      total_trades: this.performanceHistory.length,
      confidence_factor: confidenceFactor
    };
  }

  private getKellyFraction(params: KellyParameters): number {
    // Kelly formula: f = (bp - q) / b
    // where: b = avg_win/avg_loss, p = win_rate, q = 1 - win_rate
    
    if (params.avg_loss === 0) return this.minKellyFraction;

    const b = params.avg_win / params.avg_loss; // Win/loss ratio
    const p = params.win_rate;
    const q = 1 - p;

    const kellyFraction = (b * p - q) / b;

    // Apply conservative factor and confidence adjustment
    const adjustedFraction = Math.max(0, kellyFraction) * 
      this.conservativeFactor * 
      params.confidence_factor;

    // Enforce bounds
    return Math.max(
      this.minKellyFraction,
      Math.min(this.maxKellyFraction, adjustedFraction)
    );
  }

  private adjustForMLConfidence(kellyFraction: number, mlConfidence: number): number {
    // Scale Kelly fraction based on ML prediction confidence
    // Higher ML confidence = larger position size
    const confidenceMultiplier = 0.5 + (mlConfidence * 1.5); // 0.5x to 2.0x
    return Math.min(
      this.maxKellyFraction,
      kellyFraction * confidenceMultiplier
    );
  }

  private calculateConsistencyFactor(): number {
    if (this.performanceHistory.length < 20) return 0.5;

    // Calculate consistency over recent trades
    const recentTrades = this.performanceHistory.slice(-20);
    const segments = [];
    const segmentSize = 5;

    for (let i = 0; i < recentTrades.length; i += segmentSize) {
      const segment = recentTrades.slice(i, i + segmentSize);
      const winRate = segment.filter(t => t.outcome === 'win').length / segment.length;
      segments.push(winRate);
    }

    // Calculate variance in win rates across segments
    const avgWinRate = segments.reduce((a, b) => a + b, 0) / segments.length;
    const variance = segments.reduce((sum, rate) => sum + Math.pow(rate - avgWinRate, 2), 0) / segments.length;
    
    // Lower variance = higher consistency = higher confidence
    return Math.max(0.2, 1 - variance * 4);
  }

  private assessRisk(fraction: number, params: KellyParameters): 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' {
    if (fraction > 0.2) return 'EXTREME';
    if (fraction > 0.1) return 'HIGH';
    if (fraction > 0.05) return 'MODERATE';
    return 'LOW';
  }

  private generateReasoning(
    params: KellyParameters, 
    fraction: number, 
    mlConfidence?: number
  ): string[] {
    const reasoning = [];

    reasoning.push(`Win rate: ${(params.win_rate * 100).toFixed(1)}% (${params.total_trades} trades)`);
    reasoning.push(`Win/Loss ratio: ${(params.avg_win / params.avg_loss).toFixed(2)}:1`);
    reasoning.push(`Kelly fraction: ${(fraction * 100).toFixed(1)}%`);
    reasoning.push(`Confidence: ${(params.confidence_factor * 100).toFixed(0)}%`);

    if (mlConfidence) {
      reasoning.push(`ML confidence boost: ${(mlConfidence * 100).toFixed(0)}%`);
    }

    if (params.total_trades < 20) {
      reasoning.push('Limited data: using conservative sizing');
    }

    if (fraction >= this.maxKellyFraction) {
      reasoning.push('Position capped at maximum safe limit');
    }

    return reasoning;
  }

  public recordTrade(outcome: 'win' | 'loss', profitLoss: number, amount: number): void {
    this.performanceHistory.push({
      outcome,
      profit_loss: profitLoss,
      timestamp: Date.now(),
      amount
    });

    // Maintain performance history size
    if (this.performanceHistory.length > 200) {
      this.performanceHistory = this.performanceHistory.slice(-100);
    }

    console.log(`📏 Kelly Engine updated: ${outcome} ${profitLoss > 0 ? '+' : ''}${profitLoss.toFixed(2)}`);
  }

  public updateCapital(newCapital: number): void {
    this.baseCapital = newCapital;
    console.log(`📏 Kelly base capital updated: $${newCapital.toFixed(2)}`);
  }

  public getPerformanceStats() {
    const params = this.calculateKellyParameters();
    const recentTrades = this.performanceHistory.slice(-20);
    
    return {
      kelly_parameters: params,
      recent_performance: {
        total_trades: recentTrades.length,
        wins: recentTrades.filter(t => t.outcome === 'win').length,
        losses: recentTrades.filter(t => t.outcome === 'loss').length,
        total_pnl: recentTrades.reduce((sum, t) => sum + t.profit_loss, 0),
        avg_trade_size: recentTrades.length > 0 ? 
          recentTrades.reduce((sum, t) => sum + t.amount, 0) / recentTrades.length : 0
      },
      sizing_parameters: {
        max_kelly_fraction: this.maxKellyFraction,
        min_kelly_fraction: this.minKellyFraction,
        conservative_factor: this.conservativeFactor,
        base_capital: this.baseCapital
      },
      current_kelly_fraction: this.getKellyFraction(params)
    };
  }

  public adjustRiskParameters(
    maxFraction?: number,
    conservativeFactor?: number,
    minFraction?: number
  ): void {
    if (maxFraction !== undefined) {
      this.maxKellyFraction = Math.max(0.01, Math.min(0.5, maxFraction));
    }
    if (conservativeFactor !== undefined) {
      this.conservativeFactor = Math.max(0.1, Math.min(1, conservativeFactor));
    }
    if (minFraction !== undefined) {
      this.minKellyFraction = Math.max(0.001, Math.min(0.1, minFraction));
    }

    console.log('📏 Kelly risk parameters adjusted');
  }

  public simulatePosition(
    scenarios: Array<{ outcome: 'win' | 'loss'; probability: number }>,
    currentBalance: number,
    proposedFraction: number
  ): { expected_return: number; risk_of_ruin: number; max_drawdown: number } {
    let expectedReturn = 0;
    let maxDrawdown = 0;
    let ruinCount = 0;
    const simulations = 1000;

    for (let sim = 0; sim < simulations; sim++) {
      let balance = currentBalance;
      let minBalance = balance;

      for (let i = 0; i < 100; i++) { // 100 trades simulation
        const positionSize = balance * proposedFraction;
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        if (scenario.outcome === 'win') {
          balance += positionSize * this.calculateKellyParameters().avg_win;
        } else {
          balance -= positionSize * this.calculateKellyParameters().avg_loss;
        }

        minBalance = Math.min(minBalance, balance);
        
        if (balance <= currentBalance * 0.1) { // 90% loss = ruin
          ruinCount++;
          break;
        }
      }

      expectedReturn += (balance - currentBalance) / currentBalance;
      maxDrawdown = Math.max(maxDrawdown, (currentBalance - minBalance) / currentBalance);
    }

    return {
      expected_return: expectedReturn / simulations,
      risk_of_ruin: ruinCount / simulations,
      max_drawdown: maxDrawdown
    };
  }
}

export const waidesKIKellySizer = new WaidesKIKellySizer();