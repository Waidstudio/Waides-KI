/**
 * STEP 45: Waides KI Self-Optimizing Risk Management System
 * Advanced AI-driven risk management that automatically adjusts parameters based on market conditions
 */

interface RiskParameters {
  max_position_size: number; // Percentage of capital per trade
  stop_loss_percentage: number; // Dynamic stop loss
  take_profit_ratio: number; // Risk:reward ratio
  max_daily_drawdown: number; // Maximum daily loss limit
  max_open_positions: number; // Maximum concurrent trades
  volatility_adjustment: number; // Risk reduction during high volatility
  correlation_limit: number; // Maximum correlation between positions
  var_confidence: number; // Value at Risk confidence level
}

interface MarketVolatility {
  current_volatility: number;
  volatility_trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  volatility_regime: 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME';
  implied_volatility: number;
  realized_volatility: number;
  volatility_skew: number;
}

interface PortfolioRisk {
  current_exposure: number;
  portfolio_var: number; // Value at Risk
  portfolio_cvar: number; // Conditional Value at Risk
  beta: number; // Market beta
  correlation_risk: number;
  concentration_risk: number;
  liquidity_risk: number;
  tail_risk: number;
}

interface RiskAdjustment {
  parameter_name: string;
  old_value: number;
  new_value: number;
  adjustment_reason: string;
  confidence: number;
  effective_immediately: boolean;
}

interface RiskEvent {
  event_type: 'VOLATILITY_SPIKE' | 'DRAWDOWN_BREACH' | 'CORRELATION_SURGE' | 'LIQUIDITY_CRISIS' | 'TAIL_EVENT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  trigger_value: number;
  threshold_value: number;
  timestamp: Date;
  protective_actions: string[];
}

interface RiskMetrics {
  sharpe_ratio: number;
  sortino_ratio: number;
  calmar_ratio: number;
  max_drawdown: number;
  var_95: number;
  var_99: number;
  expected_shortfall: number;
  win_rate: number;
  profit_factor: number;
  recovery_factor: number;
}

export class WaidesKISelfOptimizingRiskManager {
  private riskParameters: RiskParameters;
  private riskHistory: any[] = [];
  private volatilityWindow: number[] = [];
  private drawdownPeaks: number[] = [];
  private correlationMatrix: Map<string, Map<string, number>> = new Map();
  private riskEvents: RiskEvent[] = [];
  private adaptationRate = 0.1; // How quickly to adapt to new conditions

  private readonly DEFAULT_RISK_PARAMS: RiskParameters = {
    max_position_size: 2.0, // 2% per trade
    stop_loss_percentage: 1.0, // 1% stop loss
    take_profit_ratio: 2.0, // 1:2 risk reward
    max_daily_drawdown: 5.0, // 5% daily limit
    max_open_positions: 8,
    volatility_adjustment: 0.5, // 50% reduction in high vol
    correlation_limit: 0.7, // Max 70% correlation
    var_confidence: 0.95 // 95% VaR confidence
  };

  private readonly VOLATILITY_THRESHOLDS = {
    LOW: 0.15,
    NORMAL: 0.30,
    HIGH: 0.50,
    EXTREME: 0.80
  };

  private readonly RISK_LIMITS = {
    EMERGENCY_STOP: 0.15, // Stop all trading at 15% drawdown
    PORTFOLIO_VAR_LIMIT: 0.10, // 10% portfolio VaR limit
    CORRELATION_ALARM: 0.85, // 85% correlation triggers alarm
    VOLATILITY_CIRCUIT_BREAKER: 1.0 // 100% volatility circuit breaker
  };

  constructor() {
    this.riskParameters = { ...this.DEFAULT_RISK_PARAMS };
    this.startRiskMonitoring();
  }

  /**
   * Start continuous risk monitoring and optimization
   */
  private startRiskMonitoring(): void {
    // Real-time risk monitoring every 30 seconds
    setInterval(() => {
      this.monitorRealTimeRisk();
    }, 30000);

    // Risk parameter optimization every 5 minutes
    setInterval(() => {
      this.optimizeRiskParameters();
    }, 300000);

    // Portfolio rebalancing check every 15 minutes
    setInterval(() => {
      this.checkPortfolioRebalancing();
    }, 900000);

    // Daily risk assessment
    setInterval(() => {
      this.performDailyRiskAssessment();
    }, 86400000); // 24 hours
  }

  /**
   * Calculate optimal position size based on market conditions and strategy
   */
  calculateOptimalPositionSize(
    strategyName: string,
    marketVolatility: MarketVolatility,
    portfolioRisk: PortfolioRisk,
    strategyConfidence: number
  ): number {
    let basePositionSize = this.riskParameters.max_position_size;

    // Volatility adjustment
    const volAdjustment = this.calculateVolatilityAdjustment(marketVolatility);
    
    // Portfolio risk adjustment
    const portfolioAdjustment = this.calculatePortfolioRiskAdjustment(portfolioRisk);
    
    // Strategy confidence adjustment
    const confidenceAdjustment = strategyConfidence / 100;
    
    // Kelly criterion adjustment
    const kellyAdjustment = this.calculateKellyFraction(strategyName);
    
    // Correlation adjustment
    const correlationAdjustment = this.calculateCorrelationAdjustment(strategyName);

    // Combine all adjustments
    const adjustedPositionSize = basePositionSize * 
      volAdjustment * 
      portfolioAdjustment * 
      confidenceAdjustment * 
      kellyAdjustment * 
      correlationAdjustment;

    // Apply absolute limits
    return Math.max(0.1, Math.min(this.riskParameters.max_position_size, adjustedPositionSize));
  }

  /**
   * Calculate volatility-based position size adjustment
   */
  private calculateVolatilityAdjustment(marketVolatility: MarketVolatility): number {
    const currentVol = marketVolatility.current_volatility;
    
    if (currentVol > this.VOLATILITY_THRESHOLDS.EXTREME) {
      return 0.2; // Reduce to 20% of normal size
    } else if (currentVol > this.VOLATILITY_THRESHOLDS.HIGH) {
      return 0.5; // Reduce to 50% of normal size
    } else if (currentVol > this.VOLATILITY_THRESHOLDS.NORMAL) {
      return 0.8; // Reduce to 80% of normal size
    } else {
      return 1.0; // Full size in low volatility
    }
  }

  /**
   * Calculate portfolio risk-based adjustment
   */
  private calculatePortfolioRiskAdjustment(portfolioRisk: PortfolioRisk): number {
    let adjustment = 1.0;

    // VaR adjustment
    if (portfolioRisk.portfolio_var > this.RISK_LIMITS.PORTFOLIO_VAR_LIMIT) {
      adjustment *= 0.5; // Reduce position sizes when VaR is high
    }

    // Concentration risk adjustment
    if (portfolioRisk.concentration_risk > 0.8) {
      adjustment *= 0.6; // Reduce when portfolio is concentrated
    }

    // Correlation risk adjustment
    if (portfolioRisk.correlation_risk > this.riskParameters.correlation_limit) {
      adjustment *= 0.7; // Reduce when correlations are high
    }

    return Math.max(0.1, adjustment);
  }

  /**
   * Calculate Kelly fraction for optimal position sizing
   */
  private calculateKellyFraction(strategyName: string): number {
    const strategyHistory = this.riskHistory.filter(h => h.strategy === strategyName);
    
    if (strategyHistory.length < 10) {
      return 0.5; // Conservative default
    }

    const wins = strategyHistory.filter(h => h.profit > 0);
    const losses = strategyHistory.filter(h => h.profit <= 0);
    
    if (wins.length === 0 || losses.length === 0) {
      return 0.5;
    }

    const winProbability = wins.length / strategyHistory.length;
    const avgWin = wins.reduce((sum, w) => sum + w.profit, 0) / wins.length;
    const avgLoss = Math.abs(losses.reduce((sum, l) => sum + l.profit, 0) / losses.length);

    // Kelly fraction = (bp - q) / b
    // where b = odds received (avgWin/avgLoss), p = win probability, q = loss probability
    const b = avgWin / avgLoss;
    const p = winProbability;
    const q = 1 - p;

    const kellyFraction = (b * p - q) / b;
    
    // Cap Kelly fraction to prevent over-leveraging
    return Math.max(0.1, Math.min(1.0, kellyFraction));
  }

  /**
   * Calculate correlation-based adjustment
   */
  private calculateCorrelationAdjustment(strategyName: string): number {
    const strategyCorrelations = this.correlationMatrix.get(strategyName);
    
    if (!strategyCorrelations) {
      return 1.0;
    }

    const avgCorrelation = Array.from(strategyCorrelations.values()).reduce((sum, corr) => sum + Math.abs(corr), 0) / strategyCorrelations.size;
    
    if (avgCorrelation > this.riskParameters.correlation_limit) {
      return 0.6; // Reduce position when highly correlated
    } else if (avgCorrelation > 0.5) {
      return 0.8;
    } else {
      return 1.0;
    }
  }

  /**
   * Generate dynamic stop loss and take profit levels
   */
  generateDynamicStopLoss(
    entryPrice: number,
    direction: 'LONG' | 'SHORT',
    marketVolatility: MarketVolatility,
    strategyType: string
  ): { stopLoss: number; takeProfit: number; reasoning: string[] } {
    const reasoning: string[] = [];
    
    // Base stop loss from risk parameters
    let stopLossPercentage = this.riskParameters.stop_loss_percentage;
    
    // Volatility adjustment
    const volMultiplier = this.calculateVolatilityStopMultiplier(marketVolatility);
    stopLossPercentage *= volMultiplier;
    reasoning.push(`Volatility adjustment: ${volMultiplier.toFixed(2)}x (${marketVolatility.volatility_regime})`);
    
    // Strategy-specific adjustments
    const strategyMultiplier = this.getStrategyStopMultiplier(strategyType);
    stopLossPercentage *= strategyMultiplier;
    reasoning.push(`Strategy adjustment: ${strategyMultiplier.toFixed(2)}x (${strategyType})`);
    
    // ATR-based adjustment (simulated)
    const atrMultiplier = 1.5; // Typically 1.5x ATR
    stopLossPercentage *= atrMultiplier;
    reasoning.push(`ATR-based adjustment: ${atrMultiplier}x`);

    // Calculate actual levels
    const stopLossDistance = entryPrice * (stopLossPercentage / 100);
    const takeProfitDistance = stopLossDistance * this.riskParameters.take_profit_ratio;

    let stopLoss: number;
    let takeProfit: number;

    if (direction === 'LONG') {
      stopLoss = entryPrice - stopLossDistance;
      takeProfit = entryPrice + takeProfitDistance;
    } else {
      stopLoss = entryPrice + stopLossDistance;
      takeProfit = entryPrice - takeProfitDistance;
    }

    reasoning.push(`Final stop loss: ${stopLossPercentage.toFixed(2)}% from entry`);
    reasoning.push(`Risk:reward ratio: 1:${this.riskParameters.take_profit_ratio}`);

    return { stopLoss, takeProfit, reasoning };
  }

  /**
   * Calculate volatility-based stop loss multiplier
   */
  private calculateVolatilityStopMultiplier(marketVolatility: MarketVolatility): number {
    const currentVol = marketVolatility.current_volatility;
    
    if (currentVol > this.VOLATILITY_THRESHOLDS.EXTREME) {
      return 2.5; // Much wider stops in extreme volatility
    } else if (currentVol > this.VOLATILITY_THRESHOLDS.HIGH) {
      return 2.0;
    } else if (currentVol > this.VOLATILITY_THRESHOLDS.NORMAL) {
      return 1.5;
    } else {
      return 1.0; // Normal stops in low volatility
    }
  }

  /**
   * Get strategy-specific stop loss multiplier
   */
  private getStrategyStopMultiplier(strategyType: string): number {
    const multipliers: { [key: string]: number } = {
      'SCALPING': 0.5,      // Tight stops for scalping
      'MOMENTUM': 1.2,      // Slightly wider for momentum
      'MEAN_REVERSION': 0.8, // Tighter for mean reversion
      'BREAKOUT': 1.5,      // Wider for breakouts
      'GRID': 0.6,          // Tight for grid trading
      'DCA': 2.0,           // Wide for DCA
      'SWING': 1.8,         // Wide for swing trading
      'ARBITRAGE': 0.3      // Very tight for arbitrage
    };

    return multipliers[strategyType] || 1.0;
  }

  /**
   * Monitor real-time risk and trigger protective actions
   */
  private monitorRealTimeRisk(): void {
    // Simulate current portfolio metrics (in real implementation, this would use actual data)
    const currentDrawdown = this.calculateCurrentDrawdown();
    const currentVolatility = this.estimateCurrentVolatility();
    const portfolioCorrelation = this.calculatePortfolioCorrelation();

    // Check for risk events
    this.checkVolatilitySpike(currentVolatility);
    this.checkDrawdownBreach(currentDrawdown);
    this.checkCorrelationSurge(portfolioCorrelation);
    this.checkLiquidityRisk();

    // Update volatility window
    this.volatilityWindow.push(currentVolatility);
    if (this.volatilityWindow.length > 100) {
      this.volatilityWindow = this.volatilityWindow.slice(-100);
    }
  }

  /**
   * Optimize risk parameters based on recent performance
   */
  private optimizeRiskParameters(): void {
    const recentPerformance = this.analyzeRecentPerformance();
    const adjustments: RiskAdjustment[] = [];

    // Optimize stop loss based on win rate
    if (recentPerformance.win_rate < 0.4) {
      const newStopLoss = this.riskParameters.stop_loss_percentage * 0.9; // Tighten stops
      adjustments.push({
        parameter_name: 'stop_loss_percentage',
        old_value: this.riskParameters.stop_loss_percentage,
        new_value: newStopLoss,
        adjustment_reason: 'Low win rate detected, tightening stops',
        confidence: 0.8,
        effective_immediately: true
      });
      this.riskParameters.stop_loss_percentage = newStopLoss;
    } else if (recentPerformance.win_rate > 0.7) {
      const newStopLoss = this.riskParameters.stop_loss_percentage * 1.1; // Widen stops
      adjustments.push({
        parameter_name: 'stop_loss_percentage',
        old_value: this.riskParameters.stop_loss_percentage,
        new_value: newStopLoss,
        adjustment_reason: 'High win rate detected, widening stops to capture more profit',
        confidence: 0.7,
        effective_immediately: true
      });
      this.riskParameters.stop_loss_percentage = Math.min(newStopLoss, 3.0); // Cap at 3%
    }

    // Optimize position size based on Sharpe ratio
    if (recentPerformance.sharpe_ratio > 1.5) {
      const newPositionSize = this.riskParameters.max_position_size * 1.1;
      adjustments.push({
        parameter_name: 'max_position_size',
        old_value: this.riskParameters.max_position_size,
        new_value: newPositionSize,
        adjustment_reason: 'High Sharpe ratio, increasing position size',
        confidence: 0.9,
        effective_immediately: false
      });
      this.riskParameters.max_position_size = Math.min(newPositionSize, 5.0); // Cap at 5%
    } else if (recentPerformance.sharpe_ratio < 0.5) {
      const newPositionSize = this.riskParameters.max_position_size * 0.9;
      adjustments.push({
        parameter_name: 'max_position_size',
        old_value: this.riskParameters.max_position_size,
        new_value: newPositionSize,
        adjustment_reason: 'Low Sharpe ratio, reducing position size',
        confidence: 0.85,
        effective_immediately: true
      });
      this.riskParameters.max_position_size = Math.max(newPositionSize, 0.5); // Min 0.5%
    }

    // Log adjustments
    adjustments.forEach(adj => {
      console.log(`🔧 Risk parameter adjusted: ${adj.parameter_name} ${adj.old_value} → ${adj.new_value} (${adj.adjustment_reason})`);
    });
  }

  /**
   * Check for volatility spike events
   */
  private checkVolatilitySpike(currentVolatility: number): void {
    if (currentVolatility > this.VOLATILITY_THRESHOLDS.EXTREME) {
      const event: RiskEvent = {
        event_type: 'VOLATILITY_SPIKE',
        severity: 'CRITICAL',
        trigger_value: currentVolatility,
        threshold_value: this.VOLATILITY_THRESHOLDS.EXTREME,
        timestamp: new Date(),
        protective_actions: [
          'Reduce all position sizes by 50%',
          'Tighten stop losses',
          'Pause new position openings',
          'Increase monitoring frequency'
        ]
      };

      this.riskEvents.push(event);
      this.executeProtectiveActions(event);
    }
  }

  /**
   * Check for drawdown breach events
   */
  private checkDrawdownBreach(currentDrawdown: number): void {
    if (currentDrawdown > this.riskParameters.max_daily_drawdown) {
      const severity = currentDrawdown > this.RISK_LIMITS.EMERGENCY_STOP ? 'CRITICAL' : 'HIGH';
      
      const event: RiskEvent = {
        event_type: 'DRAWDOWN_BREACH',
        severity: severity,
        trigger_value: currentDrawdown,
        threshold_value: this.riskParameters.max_daily_drawdown,
        timestamp: new Date(),
        protective_actions: severity === 'CRITICAL' ? 
          ['Emergency stop - close all positions', 'Suspend all trading', 'Alert administrators'] :
          ['Reduce position sizes', 'Pause new trades', 'Review strategies']
      };

      this.riskEvents.push(event);
      this.executeProtectiveActions(event);
    }
  }

  /**
   * Execute protective actions based on risk events
   */
  private executeProtectiveActions(event: RiskEvent): void {
    console.log(`🚨 Risk event detected: ${event.event_type} (${event.severity})`);
    
    event.protective_actions.forEach(action => {
      console.log(`🛡️ Executing protective action: ${action}`);
      
      switch (action) {
        case 'Reduce all position sizes by 50%':
          this.riskParameters.max_position_size *= 0.5;
          break;
        case 'Tighten stop losses':
          this.riskParameters.stop_loss_percentage *= 0.8;
          break;
        case 'Emergency stop - close all positions':
          // In real implementation, this would close all open positions
          console.log('🛑 Emergency stop activated');
          break;
        // Add more protective actions as needed
      }
    });
  }

  /**
   * Calculate portfolio correlation
   */
  private calculatePortfolioCorrelation(): number {
    // Simplified correlation calculation
    let totalCorrelation = 0;
    let pairCount = 0;

    this.correlationMatrix.forEach((strategyCorr, strategy1) => {
      strategyCorr.forEach((correlation, strategy2) => {
        if (strategy1 !== strategy2) {
          totalCorrelation += Math.abs(correlation);
          pairCount++;
        }
      });
    });

    return pairCount > 0 ? totalCorrelation / pairCount : 0;
  }

  /**
   * Analyze recent performance for optimization
   */
  private analyzeRecentPerformance(): RiskMetrics {
    const recentTrades = this.riskHistory.slice(-100); // Last 100 trades
    
    if (recentTrades.length === 0) {
      return {
        sharpe_ratio: 0,
        sortino_ratio: 0,
        calmar_ratio: 0,
        max_drawdown: 0,
        var_95: 0,
        var_99: 0,
        expected_shortfall: 0,
        win_rate: 0.5,
        profit_factor: 1,
        recovery_factor: 0
      };
    }

    const profits = recentTrades.map(t => t.profit);
    const winningTrades = profits.filter(p => p > 0);
    const losingTrades = profits.filter(p => p <= 0);

    const totalReturn = profits.reduce((sum, p) => sum + p, 0);
    const avgReturn = totalReturn / profits.length;
    const returnStd = Math.sqrt(profits.reduce((sum, p) => sum + Math.pow(p - avgReturn, 2), 0) / profits.length);

    return {
      sharpe_ratio: returnStd > 0 ? avgReturn / returnStd : 0,
      sortino_ratio: this.calculateSortinoRatio(profits),
      calmar_ratio: this.calculateCalmarRatio(profits),
      max_drawdown: this.calculateMaxDrawdown(profits),
      var_95: this.calculateVaR(profits, 0.95),
      var_99: this.calculateVaR(profits, 0.99),
      expected_shortfall: this.calculateExpectedShortfall(profits, 0.95),
      win_rate: winningTrades.length / profits.length,
      profit_factor: this.calculateProfitFactor(winningTrades, losingTrades),
      recovery_factor: this.calculateRecoveryFactor(profits)
    };
  }

  /**
   * Calculate Value at Risk
   */
  private calculateVaR(returns: number[], confidence: number): number {
    const sortedReturns = returns.slice().sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    return Math.abs(sortedReturns[index] || 0);
  }

  /**
   * Calculate expected shortfall (CVaR)
   */
  private calculateExpectedShortfall(returns: number[], confidence: number): number {
    const valueAtRisk = this.calculateVaR(returns, confidence);
    const tailReturns = returns.filter(r => r <= -valueAtRisk);
    return tailReturns.length > 0 ? Math.abs(tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length) : 0;
  }

  /**
   * Calculate Sortino ratio
   */
  private calculateSortinoRatio(returns: number[]): number {
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const negativeReturns = returns.filter(r => r < 0);
    
    if (negativeReturns.length === 0) return avgReturn > 0 ? Infinity : 0;
    
    const downwardDeviation = Math.sqrt(negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length);
    return downwardDeviation > 0 ? avgReturn / downwardDeviation : 0;
  }

  /**
   * Calculate Calmar ratio
   */
  private calculateCalmarRatio(returns: number[]): number {
    const totalReturn = returns.reduce((sum, r) => sum + r, 0);
    const maxDrawdown = this.calculateMaxDrawdown(returns);
    return maxDrawdown > 0 ? totalReturn / maxDrawdown : 0;
  }

  /**
   * Calculate maximum drawdown
   */
  private calculateMaxDrawdown(returns: number[]): number {
    let peak = 0;
    let maxDrawdown = 0;
    let cumulative = 0;

    for (const ret of returns) {
      cumulative += ret;
      peak = Math.max(peak, cumulative);
      const drawdown = peak - cumulative;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown;
  }

  /**
   * Calculate profit factor
   */
  private calculateProfitFactor(winningTrades: number[], losingTrades: number[]): number {
    const totalProfit = winningTrades.reduce((sum, p) => sum + p, 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, l) => sum + l, 0));
    return totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;
  }

  /**
   * Calculate recovery factor
   */
  private calculateRecoveryFactor(returns: number[]): number {
    const totalReturn = returns.reduce((sum, r) => sum + r, 0);
    const maxDrawdown = this.calculateMaxDrawdown(returns);
    return maxDrawdown > 0 ? totalReturn / maxDrawdown : 0;
  }

  /**
   * Simulate current portfolio calculations
   */
  private calculateCurrentDrawdown(): number {
    return Math.random() * 0.05; // Simulate 0-5% drawdown
  }

  private estimateCurrentVolatility(): number {
    return 0.2 + (Math.random() * 0.6); // Simulate 20-80% volatility
  }

  private checkCorrelationSurge(correlation: number): void {
    if (correlation > this.RISK_LIMITS.CORRELATION_ALARM) {
      const event: RiskEvent = {
        event_type: 'CORRELATION_SURGE',
        severity: 'HIGH',
        trigger_value: correlation,
        threshold_value: this.RISK_LIMITS.CORRELATION_ALARM,
        timestamp: new Date(),
        protective_actions: ['Reduce correlated positions', 'Diversify strategies', 'Monitor closely']
      };
      this.riskEvents.push(event);
    }
  }

  private checkLiquidityRisk(): void {
    // Simplified liquidity check
    const liquidityScore = 0.8 + (Math.random() * 0.2); // 80-100% liquidity
    
    if (liquidityScore < 0.5) {
      const event: RiskEvent = {
        event_type: 'LIQUIDITY_CRISIS',
        severity: 'HIGH',
        trigger_value: liquidityScore,
        threshold_value: 0.5,
        timestamp: new Date(),
        protective_actions: ['Reduce position sizes', 'Focus on liquid markets', 'Prepare for quick exits']
      };
      this.riskEvents.push(event);
    }
  }

  private checkPortfolioRebalancing(): void {
    // Check if portfolio needs rebalancing based on risk metrics
    const recentMetrics = this.analyzeRecentPerformance();
    
    if (recentMetrics.max_drawdown > 0.1) { // 10% drawdown triggers rebalancing
      console.log('📊 Portfolio rebalancing recommended due to high drawdown');
    }
  }

  private performDailyRiskAssessment(): void {
    const metrics = this.analyzeRecentPerformance();
    console.log('📈 Daily Risk Assessment:', {
      sharpe_ratio: metrics.sharpe_ratio.toFixed(2),
      max_drawdown: `${(metrics.max_drawdown * 100).toFixed(1)}%`,
      win_rate: `${(metrics.win_rate * 100).toFixed(1)}%`,
      var_95: `${(metrics.var_95 * 100).toFixed(1)}%`
    });
  }

  /**
   * Get current risk parameters
   */
  getRiskParameters(): RiskParameters {
    return { ...this.riskParameters };
  }

  /**
   * Get recent risk events
   */
  getRecentRiskEvents(hours: number = 24): RiskEvent[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.riskEvents.filter(event => event.timestamp.getTime() > cutoff);
  }

  /**
   * Get comprehensive risk metrics
   */
  getRiskMetrics(): RiskMetrics {
    return this.analyzeRecentPerformance();
  }

  /**
   * Update risk parameters manually
   */
  updateRiskParameters(updates: Partial<RiskParameters>): void {
    Object.assign(this.riskParameters, updates);
    console.log('🔧 Risk parameters updated:', updates);
  }

  /**
   * Record trade result for risk analysis
   */
  recordTradeResult(tradeResult: any): void {
    this.riskHistory.push({
      ...tradeResult,
      timestamp: Date.now()
    });

    // Keep only last 1000 trades
    if (this.riskHistory.length > 1000) {
      this.riskHistory = this.riskHistory.slice(-1000);
    }
  }

  /**
   * Emergency stop all trading
   */
  emergencyStop(): void {
    console.log('🚨 EMERGENCY STOP ACTIVATED');
    
    // Reset to ultra-conservative parameters
    this.riskParameters = {
      max_position_size: 0.1,
      stop_loss_percentage: 0.5,
      take_profit_ratio: 1.0,
      max_daily_drawdown: 1.0,
      max_open_positions: 1,
      volatility_adjustment: 0.1,
      correlation_limit: 0.3,
      var_confidence: 0.99
    };

    const event: RiskEvent = {
      event_type: 'TAIL_EVENT',
      severity: 'CRITICAL',
      trigger_value: 1.0,
      threshold_value: 0.15,
      timestamp: new Date(),
      protective_actions: ['Emergency stop activated', 'All parameters set to ultra-conservative']
    };

    this.riskEvents.push(event);
  }
}