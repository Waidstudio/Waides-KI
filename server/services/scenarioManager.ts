/**
 * WAIDES KI SCENARIO MANAGER
 * Manages multiple backtesting scenarios and risk analysis
 */

import { waidesKIBacktestEngine } from './backtestEngine.js';
import { waidesKIHistoricalDataLoader } from './historicalDataLoader.js';

interface BacktestScenario {
  id: string;
  name: string;
  description: string;
  symbol: string;
  interval: string;
  strategy: 'waides_full' | 'oracle_trend' | 'custom';
  startingBalance: number;
  lookbackPeriod: number;
  stopLoss?: number;
  takeProfit?: number;
  maxPosition?: number;
}

interface ScenarioResult {
  scenario: BacktestScenario;
  result: any; // BacktestResult from backtestEngine
  riskMetrics: RiskMetrics;
  completedAt: Date;
  duration: number; // milliseconds
}

interface RiskMetrics {
  totalTrades: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  sortinRatio: number;
  calmarRatio: number;
  profitFactor: number;
  payoffRatio: number;
  recoveryFactor: number;
  ulcerIndex: number;
  valueAtRisk: number; // VaR 95%
  conditionalVaR: number; // CVaR 95%
  marketExposure: number;
  volatility: number;
  beta: number;
  alpha: number;
}

export class WaidesKIScenarioManager {
  private predefinedScenarios: BacktestScenario[];
  private scenarioResults: Map<string, ScenarioResult>;
  private isRunning: boolean = false;

  constructor() {
    this.scenarioResults = new Map();
    this.predefinedScenarios = this.createPredefinedScenarios();
    console.log('🧪 Waides KI Scenario Manager initialized with', this.predefinedScenarios.length, 'predefined scenarios');
  }

  /**
   * Create predefined scenario configurations
   */
  private createPredefinedScenarios(): BacktestScenario[] {
    return [
      {
        id: 'eth_2y_hourly',
        name: 'ETH 2-Year Hourly',
        description: 'Long-term ETH analysis using hourly data over 2 years',
        symbol: 'ETHUSDT',
        interval: '1h',
        strategy: 'waides_full',
        startingBalance: 10000,
        lookbackPeriod: 50,
        stopLoss: 2,
        takeProfit: 5,
        maxPosition: 1000
      },
      {
        id: 'eth_1y_15m',
        name: 'ETH 1-Year 15min Scalping',
        description: 'High-frequency scalping strategy on 15-minute timeframe',
        symbol: 'ETHUSDT',
        interval: '15m',
        strategy: 'oracle_trend',
        startingBalance: 10000,
        lookbackPeriod: 96, // 24 hours of 15min candles
        stopLoss: 1,
        takeProfit: 2,
        maxPosition: 500
      },
      {
        id: 'eth_3m_4h',
        name: 'ETH 3-Month 4-Hour',
        description: 'Medium-term swing trading on 4-hour timeframe',
        symbol: 'ETHUSDT',
        interval: '4h',
        strategy: 'waides_full',
        startingBalance: 10000,
        lookbackPeriod: 30,
        stopLoss: 3,
        takeProfit: 8,
        maxPosition: 2000
      },
      {
        id: 'eth_1y_daily',
        name: 'ETH 1-Year Daily',
        description: 'Long-term position trading using daily candles',
        symbol: 'ETHUSDT',
        interval: '1d',
        strategy: 'custom',
        startingBalance: 10000,
        lookbackPeriod: 20,
        stopLoss: 5,
        takeProfit: 15,
        maxPosition: 3000
      },
      {
        id: 'btc_comparison',
        name: 'BTC Comparison Study',
        description: 'Compare strategy performance on BTC vs ETH',
        symbol: 'BTCUSDT',
        interval: '1h',
        strategy: 'waides_full',
        startingBalance: 10000,
        lookbackPeriod: 50,
        stopLoss: 2,
        takeProfit: 5,
        maxPosition: 1000
      },
      {
        id: 'volatile_market',
        name: 'High Volatility Test',
        description: 'Test strategy performance during high volatility periods',
        symbol: 'ETHUSDT',
        interval: '5m',
        strategy: 'oracle_trend',
        startingBalance: 10000,
        lookbackPeriod: 288, // 24 hours of 5min candles
        stopLoss: 0.5,
        takeProfit: 1.5,
        maxPosition: 300
      }
    ];
  }

  /**
   * Run a single scenario
   */
  async runScenario(scenarioId: string): Promise<ScenarioResult> {
    const scenario = this.predefinedScenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      throw new Error(`Scenario not found: ${scenarioId}`);
    }

    console.log(`🚀 Running scenario: ${scenario.name}`);
    const startTime = Date.now();

    try {
      // Run the backtest
      const result = await waidesKIBacktestEngine.runBacktest({
        symbol: scenario.symbol,
        interval: scenario.interval,
        startingBalance: scenario.startingBalance,
        lookbackPeriod: scenario.lookbackPeriod,
        strategy: scenario.strategy,
        stopLoss: scenario.stopLoss,
        takeProfit: scenario.takeProfit,
        maxPosition: scenario.maxPosition
      });

      // Calculate advanced risk metrics
      const riskMetrics = this.calculateRiskMetrics(result);

      const scenarioResult: ScenarioResult = {
        scenario,
        result,
        riskMetrics,
        completedAt: new Date(),
        duration: Date.now() - startTime
      };

      // Store result
      this.scenarioResults.set(scenarioId, scenarioResult);

      console.log(`✅ Scenario completed: ${scenario.name} (${(scenarioResult.duration / 1000).toFixed(1)}s)`);
      return scenarioResult;
    } catch (error) {
      console.error(`❌ Scenario failed: ${scenario.name}:`, error);
      throw error;
    }
  }

  /**
   * Run multiple scenarios in sequence
   */
  async runMultipleScenarios(scenarioIds: string[]): Promise<Map<string, ScenarioResult>> {
    console.log(`🔄 Running ${scenarioIds.length} scenarios in sequence...`);
    this.isRunning = true;

    const results = new Map<string, ScenarioResult>();

    try {
      for (const scenarioId of scenarioIds) {
        const result = await this.runScenario(scenarioId);
        results.set(scenarioId, result);
        
        // Small delay between scenarios to prevent overwhelming the system
        await this.delay(1000);
      }

      console.log(`✅ All scenarios completed: ${results.size}/${scenarioIds.length} successful`);
    } catch (error) {
      console.error('❌ Multi-scenario run failed:', error);
    } finally {
      this.isRunning = false;
    }

    return results;
  }

  /**
   * Run all predefined scenarios
   */
  async runAllScenarios(): Promise<Map<string, ScenarioResult>> {
    const scenarioIds = this.predefinedScenarios.map(s => s.id);
    return this.runMultipleScenarios(scenarioIds);
  }

  /**
   * Calculate advanced risk metrics
   */
  private calculateRiskMetrics(backtestResult: any): RiskMetrics {
    const trades = backtestResult.trades || [];
    const equity = backtestResult.equity || [];
    const performance = backtestResult.performance || {};

    if (trades.length === 0 || equity.length === 0) {
      return this.getEmptyRiskMetrics();
    }

    // Extract returns and values
    const returns = trades
      .filter((t: any) => t.pnlPercent !== undefined)
      .map((t: any) => t.pnlPercent / 100);
    
    const equityValues = equity.map((e: any) => e.balance);
    const drawdowns = equity.map((e: any) => e.drawdown / 100);

    // Basic metrics
    const totalTrades = trades.length;
    const winRate = performance.winRate || 0;
    const maxDrawdown = performance.maxDrawdown || 0;
    const sharpeRatio = performance.sharpeRatio || 0;

    // Advanced risk calculations
    const volatility = this.calculateVolatility(returns);
    const sortinRatio = this.calculateSortinRatio(returns);
    const calmarRatio = this.calculateCalmarRatio(returns, maxDrawdown);
    const ulcerIndex = this.calculateUlcerIndex(drawdowns);
    const valueAtRisk = this.calculateVaR(returns, 0.95);
    const conditionalVaR = this.calculateCVaR(returns, 0.95);
    const recoveryFactor = this.calculateRecoveryFactor(performance.totalReturn || 0, maxDrawdown);
    const payoffRatio = this.calculatePayoffRatio(trades);

    // Market metrics (simplified for crypto)
    const beta = this.calculateBeta(returns);
    const alpha = this.calculateAlpha(returns, beta);
    const marketExposure = this.calculateMarketExposure(trades);

    return {
      totalTrades,
      winRate,
      maxDrawdown,
      sharpeRatio,
      sortinRatio,
      calmarRatio,
      profitFactor: performance.profitFactor || 0,
      payoffRatio,
      recoveryFactor,
      ulcerIndex,
      valueAtRisk,
      conditionalVaR,
      marketExposure,
      volatility,
      beta,
      alpha
    };
  }

  /**
   * Risk calculation helper methods
   */
  private calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    return Math.sqrt(variance) * Math.sqrt(252); // Annualized
  }

  private calculateSortinRatio(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const downside = returns.filter(r => r < 0);
    
    if (downside.length === 0) return meanReturn > 0 ? 999 : 0;
    
    const downsideDeviation = Math.sqrt(
      downside.reduce((sum, r) => sum + Math.pow(r, 2), 0) / downside.length
    );
    
    return downsideDeviation > 0 ? (meanReturn / downsideDeviation) * Math.sqrt(252) : 0;
  }

  private calculateCalmarRatio(returns: number[], maxDrawdown: number): number {
    if (maxDrawdown === 0 || returns.length === 0) return 0;
    
    const annualizedReturn = (returns.reduce((sum, r) => sum + r, 0) / returns.length) * 252;
    return annualizedReturn / (maxDrawdown / 100);
  }

  private calculateUlcerIndex(drawdowns: number[]): number {
    if (drawdowns.length === 0) return 0;
    
    const squaredDrawdowns = drawdowns.map(dd => Math.pow(dd, 2));
    const meanSquaredDrawdown = squaredDrawdowns.reduce((sum, sq) => sum + sq, 0) / squaredDrawdowns.length;
    return Math.sqrt(meanSquaredDrawdown) * 100;
  }

  private calculateVaR(returns: number[], confidence: number): number {
    if (returns.length === 0) return 0;
    
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    return Math.abs(sortedReturns[index] || 0) * 100;
  }

  private calculateCVaR(returns: number[], confidence: number): number {
    if (returns.length === 0) return 0;
    
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const cutoffIndex = Math.floor((1 - confidence) * sortedReturns.length);
    const tailReturns = sortedReturns.slice(0, cutoffIndex);
    
    if (tailReturns.length === 0) return 0;
    
    const avgTailReturn = tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length;
    return Math.abs(avgTailReturn) * 100;
  }

  private calculateRecoveryFactor(totalReturn: number, maxDrawdown: number): number {
    return maxDrawdown > 0 ? totalReturn / maxDrawdown : totalReturn > 0 ? 999 : 0;
  }

  private calculatePayoffRatio(trades: any[]): number {
    const winners = trades.filter(t => (t.pnl || 0) > 0);
    const losers = trades.filter(t => (t.pnl || 0) < 0);
    
    if (winners.length === 0 || losers.length === 0) return 0;
    
    const avgWin = winners.reduce((sum, t) => sum + (t.pnl || 0), 0) / winners.length;
    const avgLoss = Math.abs(losers.reduce((sum, t) => sum + (t.pnl || 0), 0) / losers.length);
    
    return avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 999 : 0;
  }

  private calculateBeta(returns: number[]): number {
    // Simplified beta calculation (assumes market return = 8% annually)
    if (returns.length === 0) return 1;
    
    const marketReturn = 0.08 / 252; // Daily market return assumption
    const portfolioVariance = this.calculateVolatility(returns) / Math.sqrt(252);
    const marketVariance = 0.20 / Math.sqrt(252); // Assume 20% market volatility
    
    return portfolioVariance / marketVariance;
  }

  private calculateAlpha(returns: number[], beta: number): number {
    if (returns.length === 0) return 0;
    
    const portfolioReturn = (returns.reduce((sum, r) => sum + r, 0) / returns.length) * 252;
    const riskFreeRate = 0.02; // 2% risk-free rate assumption
    const marketReturn = 0.08; // 8% market return assumption
    
    return portfolioReturn - (riskFreeRate + beta * (marketReturn - riskFreeRate));
  }

  private calculateMarketExposure(trades: any[]): number {
    if (trades.length === 0) return 0;
    
    // Calculate percentage of time in market
    const totalPositionTime = trades.reduce((sum, t) => sum + (t.duration || 0), 0);
    const backtestDuration = trades.length > 0 ? 
      trades[trades.length - 1].entryTime.getTime() - trades[0].entryTime.getTime() : 0;
    
    return backtestDuration > 0 ? (totalPositionTime / backtestDuration) * 100 : 0;
  }

  private getEmptyRiskMetrics(): RiskMetrics {
    return {
      totalTrades: 0,
      winRate: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      sortinRatio: 0,
      calmarRatio: 0,
      profitFactor: 0,
      payoffRatio: 0,
      recoveryFactor: 0,
      ulcerIndex: 0,
      valueAtRisk: 0,
      conditionalVaR: 0,
      marketExposure: 0,
      volatility: 0,
      beta: 0,
      alpha: 0
    };
  }

  /**
   * Get scenario comparison analysis
   */
  getScenarioComparison(): {
    scenarios: ScenarioResult[];
    bestPerforming: ScenarioResult | null;
    worstPerforming: ScenarioResult | null;
    averageMetrics: RiskMetrics;
    riskAdjustedRanking: { scenario: string; score: number }[];
  } {
    const scenarios = Array.from(this.scenarioResults.values());
    
    if (scenarios.length === 0) {
      return {
        scenarios: [],
        bestPerforming: null,
        worstPerforming: null,
        averageMetrics: this.getEmptyRiskMetrics(),
        riskAdjustedRanking: []
      };
    }

    // Find best and worst by total return
    let bestPerforming = scenarios[0];
    let worstPerforming = scenarios[0];
    
    for (const scenario of scenarios) {
      const currentReturn = scenario.result.performance?.totalReturn || 0;
      const bestReturn = bestPerforming.result.performance?.totalReturn || 0;
      const worstReturn = worstPerforming.result.performance?.totalReturn || 0;
      
      if (currentReturn > bestReturn) {
        bestPerforming = scenario;
      }
      if (currentReturn < worstReturn) {
        worstPerforming = scenario;
      }
    }

    // Calculate average metrics
    const averageMetrics = this.calculateAverageMetrics(scenarios);

    // Risk-adjusted ranking (using Sharpe ratio as primary metric)
    const riskAdjustedRanking = scenarios
      .map(s => ({
        scenario: s.scenario.name,
        score: s.riskMetrics.sharpeRatio
      }))
      .sort((a, b) => b.score - a.score);

    return {
      scenarios,
      bestPerforming,
      worstPerforming,
      averageMetrics,
      riskAdjustedRanking
    };
  }

  private calculateAverageMetrics(scenarios: ScenarioResult[]): RiskMetrics {
    if (scenarios.length === 0) return this.getEmptyRiskMetrics();

    const totals = scenarios.reduce((acc, s) => {
      const metrics = s.riskMetrics;
      return {
        totalTrades: acc.totalTrades + metrics.totalTrades,
        winRate: acc.winRate + metrics.winRate,
        maxDrawdown: acc.maxDrawdown + metrics.maxDrawdown,
        sharpeRatio: acc.sharpeRatio + metrics.sharpeRatio,
        sortinRatio: acc.sortinRatio + metrics.sortinRatio,
        calmarRatio: acc.calmarRatio + metrics.calmarRatio,
        profitFactor: acc.profitFactor + metrics.profitFactor,
        payoffRatio: acc.payoffRatio + metrics.payoffRatio,
        recoveryFactor: acc.recoveryFactor + metrics.recoveryFactor,
        ulcerIndex: acc.ulcerIndex + metrics.ulcerIndex,
        valueAtRisk: acc.valueAtRisk + metrics.valueAtRisk,
        conditionalVaR: acc.conditionalVaR + metrics.conditionalVaR,
        marketExposure: acc.marketExposure + metrics.marketExposure,
        volatility: acc.volatility + metrics.volatility,
        beta: acc.beta + metrics.beta,
        alpha: acc.alpha + metrics.alpha
      };
    }, this.getEmptyRiskMetrics());

    // Calculate averages
    const count = scenarios.length;
    return {
      totalTrades: Math.round(totals.totalTrades / count),
      winRate: totals.winRate / count,
      maxDrawdown: totals.maxDrawdown / count,
      sharpeRatio: totals.sharpeRatio / count,
      sortinRatio: totals.sortinRatio / count,
      calmarRatio: totals.calmarRatio / count,
      profitFactor: totals.profitFactor / count,
      payoffRatio: totals.payoffRatio / count,
      recoveryFactor: totals.recoveryFactor / count,
      ulcerIndex: totals.ulcerIndex / count,
      valueAtRisk: totals.valueAtRisk / count,
      conditionalVaR: totals.conditionalVaR / count,
      marketExposure: totals.marketExposure / count,
      volatility: totals.volatility / count,
      beta: totals.beta / count,
      alpha: totals.alpha / count
    };
  }

  /**
   * Utility methods
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get available scenarios
   */
  getAvailableScenarios(): BacktestScenario[] {
    return [...this.predefinedScenarios];
  }

  /**
   * Get scenario result by ID
   */
  getScenarioResult(scenarioId: string): ScenarioResult | null {
    return this.scenarioResults.get(scenarioId) || null;
  }

  /**
   * Get all scenario results
   */
  getAllScenarioResults(): ScenarioResult[] {
    return Array.from(this.scenarioResults.values());
  }

  /**
   * Clear all results
   */
  clearResults(): void {
    this.scenarioResults.clear();
    console.log('🗑️ All scenario results cleared');
  }

  /**
   * Get current status
   */
  getStatus(): {
    isRunning: boolean;
    totalScenarios: number;
    completedScenarios: number;
    availableScenarios: string[];
  } {
    return {
      isRunning: this.isRunning,
      totalScenarios: this.predefinedScenarios.length,
      completedScenarios: this.scenarioResults.size,
      availableScenarios: this.predefinedScenarios.map(s => s.id)
    };
  }
}

// Global instance
export const waidesKIScenarioManager = new WaidesKIScenarioManager();