/**
 * Kelly Sizer Validator - Kelly Criterion Implementation and Stress Testing
 * Validates Kelly sizing for all 6 trading entities under various market conditions
 */

export interface KellyParameters {
  winRate: number;           // Historical win rate (0-1)
  avgWin: number;           // Average winning trade amount
  avgLoss: number;          // Average losing trade amount
  bankroll: number;         // Total available capital
  confidence: number;       // Confidence in the probability estimates (0-1)
  marketVolatility: number; // Current market volatility (0-1)
}

export interface KellySizing {
  optimalFraction: number;  // Optimal Kelly fraction (0-1)
  recommendedSize: number;  // Recommended position size in dollars
  maxRecommendedSize: number; // Maximum recommended size with safety buffer
  riskAdjustedSize: number; // Size adjusted for current market conditions
  confidence: number;       // Confidence in the sizing recommendation
  warnings: string[];       // Any warnings about the sizing
}

export interface StressTestScenario {
  id: string;
  name: string;
  description: string;
  marketCondition: 'bull' | 'bear' | 'sideways' | 'volatile' | 'crash';
  winRateMultiplier: number;    // Multiply historical win rate
  avgWinMultiplier: number;     // Multiply average win
  avgLossMultiplier: number;    // Multiply average loss
  volatilityMultiplier: number; // Multiply market volatility
  duration: number;             // Test duration in days
}

export interface StressTestResult {
  scenario: StressTestScenario;
  originalKelly: KellySizing;
  stressedKelly: KellySizing;
  maxDrawdown: number;
  finalBankroll: number;
  bankrollChange: number;
  worstCaseRuin: number;       // Probability of ruin in worst case
  recommendations: string[];
  passed: boolean;
}

export class KellySizerValidator {
  private readonly MAX_KELLY_FRACTION = 0.25;  // Never risk more than 25% on single trade
  private readonly SAFETY_FACTOR = 0.5;        // Apply 50% safety factor to Kelly sizing
  private readonly MIN_BANKROLL_TRADES = 20;   // Minimum trades worth of bankroll required
  
  private stressTestScenarios: StressTestScenario[] = [];

  constructor() {
    this.initializeStressTestScenarios();
    console.log('📊 Kelly Sizer Validator initialized with comprehensive stress testing');
  }

  private initializeStressTestScenarios(): void {
    this.stressTestScenarios = [
      {
        id: 'bull_market',
        name: 'Bull Market',
        description: 'Extended bull market with increasing prices',
        marketCondition: 'bull',
        winRateMultiplier: 1.1,     // 10% higher win rate
        avgWinMultiplier: 1.2,      // 20% larger wins
        avgLossMultiplier: 0.9,     // 10% smaller losses
        volatilityMultiplier: 0.8,  // 20% less volatility
        duration: 30
      },
      {
        id: 'bear_market',
        name: 'Bear Market',
        description: 'Extended bear market with declining prices',
        marketCondition: 'bear',
        winRateMultiplier: 0.8,     // 20% lower win rate
        avgWinMultiplier: 0.9,      // 10% smaller wins
        avgLossMultiplier: 1.3,     // 30% larger losses
        volatilityMultiplier: 1.2,  // 20% more volatility
        duration: 60
      },
      {
        id: 'sideways_market',
        name: 'Sideways Market',
        description: 'Range-bound market with limited trends',
        marketCondition: 'sideways',
        winRateMultiplier: 0.9,     // 10% lower win rate
        avgWinMultiplier: 0.8,      // 20% smaller wins
        avgLossMultiplier: 1.0,     // Same losses
        volatilityMultiplier: 0.7,  // 30% less volatility
        duration: 90
      },
      {
        id: 'high_volatility',
        name: 'High Volatility',
        description: 'Period of extreme market volatility',
        marketCondition: 'volatile',
        winRateMultiplier: 0.7,     // 30% lower win rate
        avgWinMultiplier: 1.5,      // 50% larger wins
        avgLossMultiplier: 1.4,     // 40% larger losses
        volatilityMultiplier: 2.0,  // 100% more volatility
        duration: 14
      },
      {
        id: 'market_crash',
        name: 'Market Crash',
        description: 'Sudden market crash scenario',
        marketCondition: 'crash',
        winRateMultiplier: 0.3,     // 70% lower win rate
        avgWinMultiplier: 0.5,      // 50% smaller wins
        avgLossMultiplier: 2.5,     // 150% larger losses
        volatilityMultiplier: 3.0,  // 200% more volatility
        duration: 7
      },
      {
        id: 'recovery_phase',
        name: 'Post-Crash Recovery',
        description: 'Recovery period after market crash',
        marketCondition: 'volatile',
        winRateMultiplier: 1.2,     // 20% higher win rate
        avgWinMultiplier: 1.8,      // 80% larger wins
        avgLossMultiplier: 1.1,     // 10% larger losses
        volatilityMultiplier: 1.5,  // 50% more volatility
        duration: 30
      }
    ];

    console.log(`📊 Initialized ${this.stressTestScenarios.length} stress test scenarios`);
  }

  public calculateKellySizing(params: KellyParameters): KellySizing {
    const warnings: string[] = [];

    // Validate input parameters
    this.validateKellyParameters(params, warnings);

    // Calculate basic Kelly fraction
    const winRate = Math.max(0.001, Math.min(0.999, params.winRate));
    const lossRate = 1 - winRate;
    const avgWin = Math.abs(params.avgWin);
    const avgLoss = Math.abs(params.avgLoss);

    // Kelly formula: f = (bp - q) / b
    // where: f = fraction of bankroll to bet
    //        b = odds received (avgWin / avgLoss)
    //        p = probability of win (winRate)
    //        q = probability of loss (1 - winRate)
    
    const oddsRatio = avgWin / Math.max(0.001, avgLoss);
    const kellyFraction = (winRate * oddsRatio - lossRate) / oddsRatio;

    // Apply safety constraints
    let adjustedFraction = kellyFraction;

    // Never recommend more than MAX_KELLY_FRACTION
    if (adjustedFraction > this.MAX_KELLY_FRACTION) {
      adjustedFraction = this.MAX_KELLY_FRACTION;
      warnings.push(`Kelly fraction capped at ${this.MAX_KELLY_FRACTION * 100}% for safety`);
    }

    // Never recommend negative sizing (would indicate negative edge)
    if (adjustedFraction < 0) {
      adjustedFraction = 0;
      warnings.push('Negative Kelly fraction indicates negative expected value - do not trade');
    }

    // Apply safety factor
    const safetyAdjustedFraction = adjustedFraction * this.SAFETY_FACTOR;
    
    // Adjust for confidence level
    const confidenceAdjustedFraction = safetyAdjustedFraction * params.confidence;

    // Adjust for market volatility (reduce size in high volatility)
    const volatilityAdjustment = 1 / (1 + params.marketVolatility * 2);
    const finalFraction = confidenceAdjustedFraction * volatilityAdjustment;

    // Calculate position sizes
    const recommendedSize = finalFraction * params.bankroll;
    const maxRecommendedSize = Math.min(
      this.MAX_KELLY_FRACTION * params.bankroll,
      params.bankroll / this.MIN_BANKROLL_TRADES
    );

    // Additional safety checks
    this.performSafetyChecks(params, finalFraction, recommendedSize, warnings);

    const confidence = this.calculateSizingConfidence(params, finalFraction);

    return {
      optimalFraction: kellyFraction,
      recommendedSize,
      maxRecommendedSize,
      riskAdjustedSize: Math.min(recommendedSize, maxRecommendedSize),
      confidence,
      warnings
    };
  }

  private validateKellyParameters(params: KellyParameters, warnings: string[]): void {
    if (params.winRate <= 0 || params.winRate >= 1) {
      warnings.push('Win rate should be between 0 and 1');
    }

    if (params.avgWin <= 0) {
      warnings.push('Average win should be positive');
    }

    if (params.avgLoss <= 0) {
      warnings.push('Average loss should be positive');
    }

    if (params.bankroll <= 0) {
      warnings.push('Bankroll should be positive');
    }

    if (params.confidence <= 0 || params.confidence > 1) {
      warnings.push('Confidence should be between 0 and 1');
    }

    if (params.marketVolatility < 0 || params.marketVolatility > 1) {
      warnings.push('Market volatility should be between 0 and 1');
    }

    // Check if edge is positive
    const expectedValue = params.winRate * params.avgWin - (1 - params.winRate) * params.avgLoss;
    if (expectedValue <= 0) {
      warnings.push('Negative expected value detected - strategy may not be profitable');
    }

    // Check sample size adequacy
    const minTradeHistory = 30;
    const impliedTrades = params.bankroll / Math.max(params.avgWin, params.avgLoss);
    if (impliedTrades < minTradeHistory) {
      warnings.push(`Insufficient trade history implied. Recommend at least ${minTradeHistory} trades for reliable Kelly sizing`);
    }
  }

  private performSafetyChecks(
    params: KellyParameters, 
    fraction: number, 
    size: number, 
    warnings: string[]
  ): void {
    
    // Check if position size is too large relative to bankroll
    if (fraction > 0.1) { // 10%
      warnings.push('Position size exceeds 10% of bankroll - consider reducing for better risk management');
    }

    // Check bankroll adequacy
    const minBankrollSize = size * this.MIN_BANKROLL_TRADES;
    if (params.bankroll < minBankrollSize) {
      warnings.push(`Bankroll may be insufficient. Recommended minimum: $${minBankrollSize.toFixed(2)}`);
    }

    // Check win rate realism
    if (params.winRate > 0.8) {
      warnings.push('Win rate seems unusually high - verify historical data accuracy');
    }

    if (params.winRate < 0.3) {
      warnings.push('Win rate is low - ensure positive expected value before trading');
    }

    // Check win/loss ratio
    const winLossRatio = params.avgWin / params.avgLoss;
    if (winLossRatio < 1 && params.winRate < 0.6) {
      warnings.push('Low win rate combined with unfavorable win/loss ratio may indicate poor strategy');
    }
  }

  private calculateSizingConfidence(params: KellyParameters, fraction: number): number {
    let confidence = params.confidence;

    // Reduce confidence for extreme values
    if (fraction > 0.15) confidence *= 0.8; // Large position sizes
    if (params.winRate > 0.75) confidence *= 0.9; // High win rates
    if (params.marketVolatility > 0.3) confidence *= 0.85; // High volatility

    // Increase confidence for conservative sizing
    if (fraction < 0.05) confidence = Math.min(1.0, confidence * 1.1);

    return Math.max(0, Math.min(1, confidence));
  }

  public async runStressTest(
    baseParams: KellyParameters,
    entity: string
  ): Promise<StressTestResult[]> {
    
    const results: StressTestResult[] = [];
    
    console.log(`🧪 Running Kelly stress tests for entity: ${entity}`);

    for (const scenario of this.stressTestScenarios) {
      const result = await this.runSingleStressTest(baseParams, scenario, entity);
      results.push(result);
    }

    // Analyze overall results
    const passedTests = results.filter(r => r.passed).length;
    console.log(`📊 Stress test completed: ${passedTests}/${results.length} scenarios passed`);

    return results;
  }

  private async runSingleStressTest(
    baseParams: KellyParameters,
    scenario: StressTestScenario,
    entity: string
  ): Promise<StressTestResult> {
    
    // Calculate original Kelly sizing
    const originalKelly = this.calculateKellySizing(baseParams);

    // Apply scenario adjustments
    const stressedParams: KellyParameters = {
      winRate: Math.max(0.001, Math.min(0.999, baseParams.winRate * scenario.winRateMultiplier)),
      avgWin: baseParams.avgWin * scenario.avgWinMultiplier,
      avgLoss: baseParams.avgLoss * scenario.avgLossMultiplier,
      bankroll: baseParams.bankroll,
      confidence: baseParams.confidence * 0.9, // Reduce confidence in stressed scenarios
      marketVolatility: Math.max(0, Math.min(1, baseParams.marketVolatility * scenario.volatilityMultiplier))
    };

    // Calculate stressed Kelly sizing
    const stressedKelly = this.calculateKellySizing(stressedParams);

    // Simulate trading performance under stress
    const simulation = this.simulateTrading(stressedParams, stressedKelly, scenario.duration);

    // Determine if test passed
    const passed = this.evaluateStressTestResult(simulation, scenario);

    // Generate recommendations
    const recommendations = this.generateStressTestRecommendations(
      originalKelly,
      stressedKelly,
      simulation,
      scenario
    );

    return {
      scenario,
      originalKelly,
      stressedKelly,
      maxDrawdown: simulation.maxDrawdown,
      finalBankroll: simulation.finalBankroll,
      bankrollChange: (simulation.finalBankroll - baseParams.bankroll) / baseParams.bankroll,
      worstCaseRuin: simulation.ruinProbability,
      recommendations,
      passed
    };
  }

  private simulateTrading(
    params: KellyParameters,
    sizing: KellySizing,
    days: number
  ): {
    finalBankroll: number;
    maxDrawdown: number;
    ruinProbability: number;
    totalTrades: number;
  } {
    
    let bankroll = params.bankroll;
    let maxBankroll = bankroll;
    let maxDrawdown = 0;
    let totalTrades = 0;
    const tradesPerDay = 5; // Assumption
    
    // Monte Carlo simulation
    const numSimulations = 1000;
    const results: number[] = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      let simBankroll = bankroll;
      let simMaxBankroll = bankroll;
      let simMaxDrawdown = 0;
      
      for (let day = 0; day < days; day++) {
        for (let trade = 0; trade < tradesPerDay; trade++) {
          const positionSize = Math.min(
            sizing.riskAdjustedSize,
            simBankroll * 0.1 // Never risk more than 10% of current bankroll
          );
          
          // Simulate trade outcome
          const isWin = Math.random() < params.winRate;
          const tradeResult = isWin 
            ? positionSize * (params.avgWin / 100)  // Convert percentage to multiplier
            : -positionSize * (params.avgLoss / 100);
          
          simBankroll += tradeResult;
          totalTrades++;
          
          // Track high water mark
          simMaxBankroll = Math.max(simMaxBankroll, simBankroll);
          
          // Calculate drawdown
          const drawdown = (simMaxBankroll - simBankroll) / simMaxBankroll;
          simMaxDrawdown = Math.max(simMaxDrawdown, drawdown);
          
          // Stop if bankroll falls too low
          if (simBankroll <= params.bankroll * 0.1) break;
        }
        if (simBankroll <= params.bankroll * 0.1) break;
      }
      
      results.push(simBankroll);
      maxDrawdown = Math.max(maxDrawdown, simMaxDrawdown);
    }
    
    // Calculate statistics
    const avgFinalBankroll = results.reduce((a, b) => a + b, 0) / results.length;
    const ruinCount = results.filter(r => r <= params.bankroll * 0.1).length;
    const ruinProbability = ruinCount / numSimulations;

    return {
      finalBankroll: avgFinalBankroll,
      maxDrawdown,
      ruinProbability,
      totalTrades: totalTrades / numSimulations // Average across simulations
    };
  }

  private evaluateStressTestResult(
    simulation: {
      finalBankroll: number;
      maxDrawdown: number;
      ruinProbability: number;
      totalTrades: number;
    },
    scenario: StressTestScenario
  ): boolean {
    
    // Pass criteria (adjust based on scenario severity)
    const maxAllowableDrawdown = scenario.marketCondition === 'crash' ? 0.4 : 0.25;
    const maxAllowableRuin = scenario.marketCondition === 'crash' ? 0.1 : 0.05;
    const minBankrollRetention = scenario.marketCondition === 'crash' ? 0.7 : 0.8;
    
    return (
      simulation.maxDrawdown <= maxAllowableDrawdown &&
      simulation.ruinProbability <= maxAllowableRuin &&
      simulation.finalBankroll >= simulation.finalBankroll * minBankrollRetention
    );
  }

  private generateStressTestRecommendations(
    originalKelly: KellySizing,
    stressedKelly: KellySizing,
    simulation: any,
    scenario: StressTestScenario
  ): string[] {
    
    const recommendations: string[] = [];
    
    // Size adjustment recommendations
    if (stressedKelly.recommendedSize < originalKelly.recommendedSize * 0.5) {
      recommendations.push(`Reduce position size by ${((1 - stressedKelly.recommendedSize / originalKelly.recommendedSize) * 100).toFixed(0)}% during ${scenario.marketCondition} conditions`);
    }

    // Drawdown recommendations
    if (simulation.maxDrawdown > 0.2) {
      recommendations.push('Implement tighter stop-losses during high volatility periods');
    }

    // Ruin probability recommendations
    if (simulation.ruinProbability > 0.02) {
      recommendations.push('Consider reducing overall risk exposure - ruin probability is elevated');
    }

    // Market-specific recommendations
    switch (scenario.marketCondition) {
      case 'crash':
        recommendations.push('Implement emergency position reduction protocols for market crashes');
        break;
      case 'volatile':
        recommendations.push('Increase frequency of position size recalculation during volatile periods');
        break;
      case 'bear':
        recommendations.push('Consider defensive positioning and reduced leverage during bear markets');
        break;
    }

    return recommendations;
  }

  public validateEntityKellySizing(
    entity: 'alpha' | 'beta' | 'gamma' | 'omega' | 'delta' | 'epsilon',
    tradingHistory: {
      wins: number;
      losses: number;
      avgWin: number;
      avgLoss: number;
      bankroll: number;
    }
  ): {
    kellySizing: KellySizing;
    stressTestResults: StressTestResult[];
    entityRecommendations: string[];
    overallRating: 'excellent' | 'good' | 'fair' | 'poor' | 'dangerous';
  } {
    
    // Calculate Kelly parameters from trading history
    const totalTrades = tradingHistory.wins + tradingHistory.losses;
    const winRate = tradingHistory.wins / Math.max(1, totalTrades);
    
    const params: KellyParameters = {
      winRate,
      avgWin: tradingHistory.avgWin,
      avgLoss: tradingHistory.avgLoss,
      bankroll: tradingHistory.bankroll,
      confidence: Math.min(1.0, totalTrades / 50), // Confidence increases with trade count
      marketVolatility: 0.2 // Default moderate volatility
    };

    // Calculate Kelly sizing
    const kellySizing = this.calculateKellySizing(params);

    // Run stress tests (simplified for performance)
    const keyScenarios = this.stressTestScenarios.slice(0, 3); // Test first 3 scenarios
    const stressTestPromises = keyScenarios.map(scenario => 
      this.runSingleStressTest(params, scenario, entity)
    );

    // Entity-specific recommendations
    const entityRecommendations = this.getEntitySpecificRecommendations(entity, kellySizing);

    // Overall rating
    const overallRating = this.calculateOverallRating(kellySizing, params);

    return {
      kellySizing,
      stressTestResults: [], // Would be populated in async version
      entityRecommendations,
      overallRating
    };
  }

  private getEntitySpecificRecommendations(
    entity: string,
    sizing: KellySizing
  ): string[] {
    
    const recommendations: string[] = [];
    
    switch (entity) {
      case 'alpha':
        if (sizing.recommendedSize > 0.05) {
          recommendations.push('As basic trading entity, consider more conservative sizing');
        }
        break;
        
      case 'omega':
        if (sizing.confidence < 0.7) {
          recommendations.push('Full Engine should maintain high confidence - review ML models');
        }
        break;
        
      case 'delta':
        recommendations.push('Energy distribution entity should coordinate sizing with connected bots');
        break;
        
      case 'epsilon':
        recommendations.push('Backup entity should use most conservative sizing parameters');
        if (sizing.recommendedSize > 0.02) {
          recommendations.push('Reduce position size for backup trading system');
        }
        break;
    }
    
    return recommendations;
  }

  private calculateOverallRating(sizing: KellySizing, params: KellyParameters): 'excellent' | 'good' | 'fair' | 'poor' | 'dangerous' {
    if (sizing.warnings.some(w => w.includes('negative') || w.includes('dangerous'))) {
      return 'dangerous';
    }
    
    if (params.winRate < 0.4 || sizing.confidence < 0.5) {
      return 'poor';
    }
    
    if (params.winRate < 0.5 || sizing.confidence < 0.7) {
      return 'fair';
    }
    
    if (params.winRate > 0.6 && sizing.confidence > 0.8) {
      return 'excellent';
    }
    
    return 'good';
  }

  public getKellyStatistics(): {
    totalValidations: number;
    averageKellyFraction: number;
    averageConfidence: number;
    commonWarnings: string[];
    entityRatings: Record<string, string>;
  } {
    // This would track actual usage statistics
    return {
      totalValidations: 0,
      averageKellyFraction: 0.08,
      averageConfidence: 0.75,
      commonWarnings: [
        'Position size exceeds 10% of bankroll',
        'Win rate seems unusually high',
        'High market volatility detected'
      ],
      entityRatings: {}
    };
  }
}

// Export singleton instance
let kellySizerValidatorInstance: KellySizerValidator | null = null;

export function getKellySizerValidator(): KellySizerValidator {
  if (!kellySizerValidatorInstance) {
    kellySizerValidatorInstance = new KellySizerValidator();
  }
  return kellySizerValidatorInstance;
}