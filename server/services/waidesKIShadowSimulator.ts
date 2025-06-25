import { waidesKIDNAEngine } from './waidesKIDNAEngine';
import { waidesKISignatureTracker } from './waidesKISignatureTracker';
import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKIGenomeEngine } from './waidesKIGenomeEngine';
import { waidesKIRootMemory } from './waidesKIRootMemory';
import { waidesKILiveFeed } from './waidesKILiveFeed';

interface MarketIndicators {
  trend: string;
  rsi: number;
  vwap_status: string;
  price: number;
  ema50: number;
  ema200: number;
  volume: number;
  timestamp: number;
}

interface ShadowVariant {
  variant_id: string;
  variant_type: 'RSI_SHIFT' | 'VWAP_FLIP' | 'PRICE_ADJUST' | 'VOLUME_CHANGE' | 'TREND_ALTERNATE' | 'EMA_DEVIATION';
  original_indicators: MarketIndicators;
  modified_indicators: MarketIndicators;
  dna_id: string;
  strategy_code: string;
  simulated_decision: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'NO_ACTION';
  confidence_level: number;
  risk_assessment: string;
}

interface ShadowSimulationResult {
  shadow_id: string;
  timestamp: number;
  real_trade_id?: string;
  real_dna_id: string;
  variants: ShadowVariant[];
  simulation_outcomes: ShadowOutcome[];
  comparison_analysis: {
    better_alternatives: number;
    worse_alternatives: number;
    similar_alternatives: number;
    best_alternative: ShadowOutcome | null;
    missed_opportunity_score: number;
    judgment_accuracy: number;
  };
  learning_insights: string[];
  metadata: {
    market_conditions: MarketIndicators;
    simulation_duration_ms: number;
    variant_count: number;
    real_decision: string;
  };
}

interface ShadowOutcome {
  variant_id: string;
  simulated_result: 'WIN' | 'LOSS' | 'NEUTRAL';
  simulated_profit_loss: number;
  simulated_exit_price: number;
  simulated_holding_duration: number;
  confidence_score: number;
  risk_score: number;
  outcome_reasoning: string[];
  market_impact_factors: string[];
}

interface ShadowLearning {
  pattern_type: string;
  real_vs_shadow_performance: {
    real_outcome: number;
    best_shadow_outcome: number;
    performance_delta: number;
  };
  decision_quality: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'MISSED_OPPORTUNITY';
  learning_weight: number;
  improvement_suggestions: string[];
}

export class WaidesKIShadowSimulator {
  private shadowLog: ShadowSimulationResult[] = [];
  private shadowLearnings: ShadowLearning[] = [];
  private isSimulationActive: boolean = true;
  private maxLogSize: number = 1000;
  private simulationIntensity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';

  constructor() {
    this.startMaintenanceCycle();
  }

  private startMaintenanceCycle(): void {
    // Clean old shadow logs every hour
    setInterval(() => {
      this.cleanOldShadowLogs();
    }, 60 * 60 * 1000);
  }

  // CORE SHADOW SIMULATION ENGINE
  async simulateAlternatives(
    currentIndicators: MarketIndicators, 
    realDnaId: string, 
    realDecision: string,
    realTradeId?: string
  ): Promise<ShadowSimulationResult> {
    if (!this.isSimulationActive) {
      return this.createEmptySimulation(currentIndicators, realDnaId, realDecision);
    }

    const shadowId = this.generateShadowId();
    const startTime = Date.now();

    try {
      // 1. Generate shadow variants
      const variants = this.generateShadowVariants(currentIndicators, realDnaId);
      
      // 2. Simulate outcomes for each variant
      const outcomes = await this.simulateVariantOutcomes(variants, currentIndicators);
      
      // 3. Analyze comparisons
      const analysis = this.analyzeComparisons(outcomes, realDecision);
      
      // 4. Extract learning insights
      const insights = this.extractLearningInsights(variants, outcomes, analysis);
      
      // 5. Create simulation result
      const simulationResult: ShadowSimulationResult = {
        shadow_id: shadowId,
        timestamp: Date.now(),
        real_trade_id: realTradeId,
        real_dna_id: realDnaId,
        variants,
        simulation_outcomes: outcomes,
        comparison_analysis: analysis,
        learning_insights: insights,
        metadata: {
          market_conditions: currentIndicators,
          simulation_duration_ms: Date.now() - startTime,
          variant_count: variants.length,
          real_decision: realDecision
        }
      };
      
      // 6. Store in shadow log
      this.shadowLog.push(simulationResult);
      
      // 7. Update learning systems
      await this.updateShadowLearning(simulationResult);
      
      // 8. Log significant discoveries
      if (analysis.missed_opportunity_score > 70) {
        waidesKIDailyReporter.recordLesson(
          `Shadow simulation detected significant missed opportunity (${analysis.missed_opportunity_score}% better alternative)`,
          'SHADOW',
          'HIGH',
          'Shadow Simulator'
        );
      }
      
      return simulationResult;
      
    } catch (error) {
      console.error('Error in shadow simulation:', error);
      return this.createErrorSimulation(currentIndicators, realDnaId, realDecision, error.message);
    }
  }

  private generateShadowVariants(originalIndicators: MarketIndicators, realDnaId: string): ShadowVariant[] {
    const variants: ShadowVariant[] = [];
    const variantCount = this.simulationIntensity === 'HIGH' ? 8 : this.simulationIntensity === 'MEDIUM' ? 5 : 3;
    
    for (let i = 0; i < variantCount; i++) {
      const variant = this.createShadowVariant(originalIndicators, realDnaId, i);
      if (variant && variant.dna_id !== realDnaId) {
        variants.push(variant);
      }
    }
    
    return variants;
  }

  private createShadowVariant(originalIndicators: MarketIndicators, realDnaId: string, index: number): ShadowVariant | null {
    const variantTypes: ShadowVariant['variant_type'][] = [
      'RSI_SHIFT', 'VWAP_FLIP', 'PRICE_ADJUST', 'VOLUME_CHANGE', 'TREND_ALTERNATE', 'EMA_DEVIATION'
    ];
    
    const variantType = variantTypes[index % variantTypes.length];
    const modifiedIndicators = this.applyVariantModification(originalIndicators, variantType, index);
    
    // Generate DNA for modified indicators
    const dnaId = waidesKIDNAEngine.generateDNA(modifiedIndicators);
    
    // Skip if same as real DNA
    if (dnaId === realDnaId) {
      return null;
    }
    
    // Generate strategy code
    const strategyCode = this.generateStrategyCodeFromIndicators(modifiedIndicators);
    
    // Simulate decision making
    const decision = this.simulateDecisionMaking(modifiedIndicators);
    
    return {
      variant_id: `SHADOW_${Date.now()}_${index}`,
      variant_type: variantType,
      original_indicators: originalIndicators,
      modified_indicators: modifiedIndicators,
      dna_id: dnaId,
      strategy_code: strategyCode,
      simulated_decision: decision.action,
      confidence_level: decision.confidence,
      risk_assessment: decision.riskLevel
    };
  }

  private applyVariantModification(indicators: MarketIndicators, variantType: ShadowVariant['variant_type'], index: number): MarketIndicators {
    const modified = { ...indicators };
    
    switch (variantType) {
      case 'RSI_SHIFT':
        const rsiShift = (index - 2) * 3; // -6, -3, 0, +3, +6
        modified.rsi = Math.max(5, Math.min(95, indicators.rsi + rsiShift));
        break;
        
      case 'VWAP_FLIP':
        modified.vwap_status = indicators.vwap_status === 'ABOVE' ? 'BELOW' : 'ABOVE';
        break;
        
      case 'PRICE_ADJUST':
        const priceAdjust = (index - 2) * 0.01; // -2%, -1%, 0%, +1%, +2%
        modified.price = indicators.price * (1 + priceAdjust);
        break;
        
      case 'VOLUME_CHANGE':
        const volumeMultiplier = 1 + (index - 2) * 0.2; // 0.6x, 0.8x, 1x, 1.2x, 1.4x
        modified.volume = indicators.volume * volumeMultiplier;
        break;
        
      case 'TREND_ALTERNATE':
        const trends = ['UPTREND', 'DOWNTREND', 'RANGING'];
        const currentTrendIndex = trends.indexOf(indicators.trend);
        modified.trend = trends[(currentTrendIndex + 1 + index) % trends.length];
        break;
        
      case 'EMA_DEVIATION':
        const emaShift = (index - 2) * 10; // Shift EMA50 by ±10, ±20
        modified.ema50 = indicators.ema50 + emaShift;
        break;
    }
    
    return modified;
  }

  private generateStrategyCodeFromIndicators(indicators: MarketIndicators): string {
    const parts: string[] = [];
    
    if (indicators.rsi > 50) {
      parts.push(`RSI<${indicators.rsi.toFixed(1)}`);
    } else {
      parts.push(`RSI>${indicators.rsi.toFixed(1)}`);
    }
    
    parts.push(`VWAP_${indicators.vwap_status}`);
    parts.push(`EMA_GAP<=${Math.abs(indicators.price - indicators.ema50).toFixed(0)}`);
    parts.push(`TREND_${indicators.trend}`);
    
    return parts.join(' & ');
  }

  private simulateDecisionMaking(indicators: MarketIndicators): { action: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'NO_ACTION'; confidence: number; riskLevel: string } {
    let buySignals = 0;
    let sellSignals = 0;
    let totalSignals = 0;
    
    // RSI analysis
    totalSignals++;
    if (indicators.rsi < 40) {
      buySignals++;
    } else if (indicators.rsi > 60) {
      sellSignals++;
    }
    
    // VWAP analysis
    totalSignals++;
    if (indicators.vwap_status === 'ABOVE') {
      buySignals++;
    } else {
      sellSignals++;
    }
    
    // Trend analysis
    totalSignals++;
    if (indicators.trend === 'UPTREND') {
      buySignals++;
    } else if (indicators.trend === 'DOWNTREND') {
      sellSignals++;
    }
    
    // EMA analysis
    totalSignals++;
    if (indicators.price > indicators.ema50) {
      buySignals++;
    } else {
      sellSignals++;
    }
    
    const signalStrength = Math.max(buySignals, sellSignals) / totalSignals;
    const confidence = Math.round(signalStrength * 100);
    
    let action: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'NO_ACTION';
    let riskLevel: string;
    
    if (buySignals > sellSignals && confidence > 60) {
      action = 'BUY_ETH';
      riskLevel = confidence > 80 ? 'LOW' : 'MEDIUM';
    } else if (sellSignals > buySignals && confidence > 60) {
      action = 'SELL_ETH';
      riskLevel = confidence > 80 ? 'LOW' : 'MEDIUM';
    } else if (Math.abs(buySignals - sellSignals) <= 1) {
      action = 'HOLD';
      riskLevel = 'LOW';
    } else {
      action = 'NO_ACTION';
      riskLevel = 'HIGH';
    }
    
    return { action, confidence, riskLevel };
  }

  private async simulateVariantOutcomes(variants: ShadowVariant[], marketConditions: MarketIndicators): Promise<ShadowOutcome[]> {
    const outcomes: ShadowOutcome[] = [];
    
    for (const variant of variants) {
      const outcome = await this.simulateSingleVariantOutcome(variant, marketConditions);
      outcomes.push(outcome);
    }
    
    return outcomes;
  }

  private async simulateSingleVariantOutcome(variant: ShadowVariant, marketConditions: MarketIndicators): Promise<ShadowOutcome> {
    // Simulate market movement and outcome
    const basePrice = marketConditions.price;
    
    // Simulate price movement based on variant characteristics
    const priceVolatility = this.calculatePriceVolatility(variant, marketConditions);
    const priceDirection = this.predictPriceDirection(variant);
    
    // Simulate holding duration (1-120 minutes)
    const holdingDuration = 15 + Math.random() * 105;
    
    // Calculate simulated exit price
    const priceMovement = priceDirection * priceVolatility * (holdingDuration / 60); // Scale by time
    const exitPrice = basePrice * (1 + priceMovement);
    
    // Calculate profit/loss
    let profitLoss = 0;
    if (variant.simulated_decision === 'BUY_ETH') {
      profitLoss = ((exitPrice - basePrice) / basePrice) * 100; // Percentage gain/loss
    } else if (variant.simulated_decision === 'SELL_ETH') {
      profitLoss = ((basePrice - exitPrice) / basePrice) * 100; // Inverse for short
    }
    
    // Apply realistic constraints (fees, slippage)
    profitLoss = profitLoss - 0.2; // 0.2% fees + slippage
    
    const result: 'WIN' | 'LOSS' | 'NEUTRAL' = 
      profitLoss > 0.5 ? 'WIN' : 
      profitLoss < -0.5 ? 'LOSS' : 'NEUTRAL';
    
    // Generate reasoning
    const reasoning = this.generateOutcomeReasoning(variant, profitLoss, marketConditions);
    
    return {
      variant_id: variant.variant_id,
      simulated_result: result,
      simulated_profit_loss: Math.round(profitLoss * 100) / 100,
      simulated_exit_price: Math.round(exitPrice * 100) / 100,
      simulated_holding_duration: Math.round(holdingDuration),
      confidence_score: variant.confidence_level,
      risk_score: this.calculateRiskScore(variant),
      outcome_reasoning: reasoning,
      market_impact_factors: this.identifyMarketFactors(variant, marketConditions)
    };
  }

  private calculatePriceVolatility(variant: ShadowVariant, marketConditions: MarketIndicators): number {
    // Base volatility
    let volatility = 0.02; // 2% base
    
    // Adjust based on variant type
    switch (variant.variant_type) {
      case 'RSI_SHIFT':
        volatility *= Math.abs(variant.modified_indicators.rsi - variant.original_indicators.rsi) / 10;
        break;
      case 'VOLUME_CHANGE':
        volatility *= variant.modified_indicators.volume / variant.original_indicators.volume;
        break;
      case 'TREND_ALTERNATE':
        volatility *= 1.5; // Trend changes increase volatility
        break;
    }
    
    // Market conditions adjustment
    if (marketConditions.volume < 1000000) volatility *= 1.3; // Low volume = higher volatility
    if (marketConditions.rsi > 80 || marketConditions.rsi < 20) volatility *= 1.4; // Extreme RSI
    
    return Math.min(0.05, volatility); // Cap at 5%
  }

  private predictPriceDirection(variant: ShadowVariant): number {
    let direction = 0;
    
    // RSI influence
    if (variant.modified_indicators.rsi < 30) direction += 0.3;
    if (variant.modified_indicators.rsi > 70) direction -= 0.3;
    
    // VWAP influence
    if (variant.modified_indicators.vwap_status === 'ABOVE') direction += 0.2;
    else direction -= 0.2;
    
    // Trend influence
    if (variant.modified_indicators.trend === 'UPTREND') direction += 0.4;
    else if (variant.modified_indicators.trend === 'DOWNTREND') direction -= 0.4;
    
    // EMA influence
    if (variant.modified_indicators.price > variant.modified_indicators.ema50) direction += 0.1;
    else direction -= 0.1;
    
    // Add some randomness (±0.3)
    direction += (Math.random() - 0.5) * 0.6;
    
    return Math.max(-1, Math.min(1, direction));
  }

  private calculateRiskScore(variant: ShadowVariant): number {
    let riskScore = 50; // Base risk
    
    // Confidence adjustment
    riskScore -= (variant.confidence_level - 50) * 0.5;
    
    // Variant type risk
    switch (variant.variant_type) {
      case 'RSI_SHIFT':
        const rsiExtreme = Math.max(0, Math.abs(variant.modified_indicators.rsi - 50) - 20);
        riskScore += rsiExtreme;
        break;
      case 'TREND_ALTERNATE':
        riskScore += 15; // Trend changes are risky
        break;
      case 'VOLUME_CHANGE':
        if (variant.modified_indicators.volume < 500000) riskScore += 20;
        break;
    }
    
    return Math.max(10, Math.min(90, Math.round(riskScore)));
  }

  private generateOutcomeReasoning(variant: ShadowVariant, profitLoss: number, marketConditions: MarketIndicators): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`${variant.variant_type} modification applied`);
    reasoning.push(`Decision: ${variant.simulated_decision} with ${variant.confidence_level}% confidence`);
    
    if (profitLoss > 0) {
      reasoning.push(`Profitable due to favorable ${variant.variant_type.toLowerCase()} conditions`);
    } else {
      reasoning.push(`Loss attributed to unfavorable market response to ${variant.variant_type.toLowerCase()}`);
    }
    
    // Add specific reasoning based on variant type
    switch (variant.variant_type) {
      case 'RSI_SHIFT':
        reasoning.push(`RSI at ${variant.modified_indicators.rsi} provided ${profitLoss > 0 ? 'good' : 'poor'} entry timing`);
        break;
      case 'VWAP_FLIP':
        reasoning.push(`VWAP position ${variant.modified_indicators.vwap_status} ${profitLoss > 0 ? 'supported' : 'hindered'} the trade`);
        break;
      case 'TREND_ALTERNATE':
        reasoning.push(`Trend assumption ${variant.modified_indicators.trend} ${profitLoss > 0 ? 'aligned' : 'conflicted'} with market movement`);
        break;
    }
    
    return reasoning;
  }

  private identifyMarketFactors(variant: ShadowVariant, marketConditions: MarketIndicators): string[] {
    const factors: string[] = [];
    
    if (marketConditions.volume < 1000000) factors.push('Low volume environment');
    if (marketConditions.rsi > 75) factors.push('Overbought conditions');
    if (marketConditions.rsi < 25) factors.push('Oversold conditions');
    if (Math.abs(marketConditions.price - marketConditions.ema50) / marketConditions.ema50 > 0.03) {
      factors.push('Significant EMA deviation');
    }
    
    factors.push(`${marketConditions.trend} market phase`);
    factors.push(`Price ${marketConditions.vwap_status} VWAP`);
    
    return factors;
  }

  private analyzeComparisons(outcomes: ShadowOutcome[], realDecision: string): ShadowSimulationResult['comparison_analysis'] {
    if (outcomes.length === 0) {
      return {
        better_alternatives: 0,
        worse_alternatives: 0,
        similar_alternatives: 0,
        best_alternative: null,
        missed_opportunity_score: 0,
        judgment_accuracy: 100
      };
    }
    
    // Assume real decision would have neutral outcome for comparison baseline
    const realOutcomeEstimate = 0; // We don't have the real outcome yet
    
    let betterCount = 0;
    let worseCount = 0;
    let similarCount = 0;
    let bestAlternative: ShadowOutcome | null = null;
    let bestProfitLoss = -Infinity;
    
    for (const outcome of outcomes) {
      const profitLoss = outcome.simulated_profit_loss;
      
      if (profitLoss > realOutcomeEstimate + 0.5) {
        betterCount++;
      } else if (profitLoss < realOutcomeEstimate - 0.5) {
        worseCount++;
      } else {
        similarCount++;
      }
      
      if (profitLoss > bestProfitLoss) {
        bestProfitLoss = profitLoss;
        bestAlternative = outcome;
      }
    }
    
    // Calculate missed opportunity score
    const missedOpportunityScore = bestAlternative ? 
      Math.max(0, Math.min(100, (bestProfitLoss - realOutcomeEstimate) * 10)) : 0;
    
    // Calculate judgment accuracy
    const judgmentAccuracy = Math.max(0, 100 - (betterCount / outcomes.length) * 100);
    
    return {
      better_alternatives: betterCount,
      worse_alternatives: worseCount,
      similar_alternatives: similarCount,
      best_alternative: bestAlternative,
      missed_opportunity_score: Math.round(missedOpportunityScore),
      judgment_accuracy: Math.round(judgmentAccuracy)
    };
  }

  private extractLearningInsights(variants: ShadowVariant[], outcomes: ShadowOutcome[], analysis: ShadowSimulationResult['comparison_analysis']): string[] {
    const insights: string[] = [];
    
    // Overall performance insights
    if (analysis.better_alternatives > analysis.worse_alternatives) {
      insights.push(`${analysis.better_alternatives} variants performed better - review decision criteria`);
    } else {
      insights.push(`Original decision likely optimal - ${analysis.worse_alternatives} alternatives performed worse`);
    }
    
    // Best performing variant insights
    if (analysis.best_alternative) {
      const bestVariant = variants.find(v => v.variant_id === analysis.best_alternative!.variant_id);
      if (bestVariant) {
        insights.push(`Best alternative: ${bestVariant.variant_type} with ${analysis.best_alternative.simulated_profit_loss}% return`);
      }
    }
    
    // Pattern-specific insights
    const variantPerformance = new Map<string, number[]>();
    outcomes.forEach(outcome => {
      const variant = variants.find(v => v.variant_id === outcome.variant_id);
      if (variant) {
        if (!variantPerformance.has(variant.variant_type)) {
          variantPerformance.set(variant.variant_type, []);
        }
        variantPerformance.get(variant.variant_type)!.push(outcome.simulated_profit_loss);
      }
    });
    
    for (const [variantType, profits] of variantPerformance.entries()) {
      const avgProfit = profits.reduce((sum, p) => sum + p, 0) / profits.length;
      if (avgProfit > 1) {
        insights.push(`${variantType} modifications show promise (avg: ${avgProfit.toFixed(2)}%)`);
      } else if (avgProfit < -1) {
        insights.push(`${variantType} modifications performed poorly (avg: ${avgProfit.toFixed(2)}%)`);
      }
    }
    
    // Missed opportunity insights
    if (analysis.missed_opportunity_score > 50) {
      insights.push(`High missed opportunity detected - consider adjusting thresholds`);
    }
    
    return insights;
  }

  private async updateShadowLearning(simulationResult: ShadowSimulationResult): Promise<void> {
    try {
      // Create learning record
      const learning: ShadowLearning = {
        pattern_type: this.identifyPatternType(simulationResult),
        real_vs_shadow_performance: {
          real_outcome: 0, // Will be updated when real trade completes
          best_shadow_outcome: simulationResult.comparison_analysis.best_alternative?.simulated_profit_loss || 0,
          performance_delta: simulationResult.comparison_analysis.missed_opportunity_score
        },
        decision_quality: this.assessDecisionQuality(simulationResult.comparison_analysis),
        learning_weight: this.calculateLearningWeight(simulationResult),
        improvement_suggestions: this.generateImprovementSuggestions(simulationResult)
      };
      
      this.shadowLearnings.push(learning);
      
      // Update signature tracker with shadow results
      for (const outcome of simulationResult.simulation_outcomes) {
        const variant = simulationResult.variants.find(v => v.variant_id === outcome.variant_id);
        if (variant) {
          waidesKISignatureTracker.recordResult(
            variant.dna_id,
            outcome.simulated_result,
            outcome.simulated_profit_loss,
            outcome.confidence_score,
            simulationResult.metadata.market_conditions,
            'SHADOW_SIMULATION'
          );
        }
      }
      
    } catch (error) {
      console.error('Error updating shadow learning:', error);
    }
  }

  private identifyPatternType(simulationResult: ShadowSimulationResult): string {
    const marketConditions = simulationResult.metadata.market_conditions;
    
    if (marketConditions.rsi > 70) return 'OVERBOUGHT';
    if (marketConditions.rsi < 30) return 'OVERSOLD';
    if (marketConditions.trend === 'UPTREND') return 'TRENDING_UP';
    if (marketConditions.trend === 'DOWNTREND') return 'TRENDING_DOWN';
    if (marketConditions.vwap_status === 'ABOVE') return 'ABOVE_VWAP';
    return 'NEUTRAL';
  }

  private assessDecisionQuality(analysis: ShadowSimulationResult['comparison_analysis']): ShadowLearning['decision_quality'] {
    if (analysis.judgment_accuracy > 85) return 'EXCELLENT';
    if (analysis.judgment_accuracy > 70) return 'GOOD';
    if (analysis.judgment_accuracy > 50) return 'AVERAGE';
    if (analysis.missed_opportunity_score > 70) return 'MISSED_OPPORTUNITY';
    return 'POOR';
  }

  private calculateLearningWeight(simulationResult: ShadowSimulationResult): number {
    let weight = 1.0;
    
    // Higher weight for significant missed opportunities
    weight += simulationResult.comparison_analysis.missed_opportunity_score / 100;
    
    // Higher weight for high-confidence variants
    const avgConfidence = simulationResult.variants.reduce((sum, v) => sum + v.confidence_level, 0) / simulationResult.variants.length;
    weight += (avgConfidence - 50) / 100;
    
    // Higher weight for diverse variant types
    const uniqueTypes = new Set(simulationResult.variants.map(v => v.variant_type)).size;
    weight += (uniqueTypes - 1) * 0.1;
    
    return Math.max(0.1, Math.min(3.0, weight));
  }

  private generateImprovementSuggestions(simulationResult: ShadowSimulationResult): string[] {
    const suggestions: string[] = [];
    const analysis = simulationResult.comparison_analysis;
    
    if (analysis.missed_opportunity_score > 50) {
      suggestions.push('Consider relaxing entry criteria to capture more opportunities');
    }
    
    if (analysis.better_alternatives > 2) {
      suggestions.push('Review indicator thresholds - multiple better alternatives exist');
    }
    
    // Variant-specific suggestions
    const bestVariant = simulationResult.variants.find(v => v.variant_id === analysis.best_alternative?.variant_id);
    if (bestVariant) {
      switch (bestVariant.variant_type) {
        case 'RSI_SHIFT':
          suggestions.push(`Consider adjusting RSI threshold to ${bestVariant.modified_indicators.rsi}`);
          break;
        case 'VWAP_FLIP':
          suggestions.push('Consider opposite VWAP position strategy');
          break;
        case 'TREND_ALTERNATE':
          suggestions.push('Review trend detection accuracy');
          break;
      }
    }
    
    return suggestions;
  }

  // UTILITY METHODS
  private generateShadowId(): string {
    return `SHADOW_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private createEmptySimulation(indicators: MarketIndicators, realDnaId: string, realDecision: string): ShadowSimulationResult {
    return {
      shadow_id: this.generateShadowId(),
      timestamp: Date.now(),
      real_dna_id: realDnaId,
      variants: [],
      simulation_outcomes: [],
      comparison_analysis: {
        better_alternatives: 0,
        worse_alternatives: 0,
        similar_alternatives: 0,
        best_alternative: null,
        missed_opportunity_score: 0,
        judgment_accuracy: 100
      },
      learning_insights: ['Shadow simulation disabled'],
      metadata: {
        market_conditions: indicators,
        simulation_duration_ms: 0,
        variant_count: 0,
        real_decision: realDecision
      }
    };
  }

  private createErrorSimulation(indicators: MarketIndicators, realDnaId: string, realDecision: string, errorMessage: string): ShadowSimulationResult {
    return {
      shadow_id: this.generateShadowId(),
      timestamp: Date.now(),
      real_dna_id: realDnaId,
      variants: [],
      simulation_outcomes: [],
      comparison_analysis: {
        better_alternatives: 0,
        worse_alternatives: 0,
        similar_alternatives: 0,
        best_alternative: null,
        missed_opportunity_score: 0,
        judgment_accuracy: 50
      },
      learning_insights: [`Shadow simulation error: ${errorMessage}`],
      metadata: {
        market_conditions: indicators,
        simulation_duration_ms: 0,
        variant_count: 0,
        real_decision: realDecision
      }
    };
  }

  private cleanOldShadowLogs(): void {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.shadowLog = this.shadowLog.filter(log => log.timestamp > sevenDaysAgo);
    
    // Keep only recent learnings
    if (this.shadowLearnings.length > 500) {
      this.shadowLearnings = this.shadowLearnings.slice(-500);
    }
    
    // Maintain max log size
    if (this.shadowLog.length > this.maxLogSize) {
      this.shadowLog = this.shadowLog.slice(-this.maxLogSize);
    }
  }

  // PUBLIC INTERFACE METHODS
  getShadowLog(limit: number = 50): ShadowSimulationResult[] {
    return this.shadowLog.slice(-limit).reverse();
  }

  getShadowLearnings(limit: number = 100): ShadowLearning[] {
    return this.shadowLearnings.slice(-limit).reverse();
  }

  getShadowStatistics(): {
    total_simulations: number;
    total_variants_tested: number;
    avg_missed_opportunity: number;
    avg_judgment_accuracy: number;
    pattern_performance: { [pattern: string]: number };
    variant_type_performance: { [type: string]: number };
    learning_insights_count: number;
    simulation_activity: boolean;
  } {
    const totalSimulations = this.shadowLog.length;
    const totalVariants = this.shadowLog.reduce((sum, log) => sum + log.variants.length, 0);
    
    const avgMissedOpportunity = totalSimulations > 0 ? 
      this.shadowLog.reduce((sum, log) => sum + log.comparison_analysis.missed_opportunity_score, 0) / totalSimulations : 0;
    
    const avgJudgmentAccuracy = totalSimulations > 0 ?
      this.shadowLog.reduce((sum, log) => sum + log.comparison_analysis.judgment_accuracy, 0) / totalSimulations : 0;
    
    // Pattern performance analysis
    const patternPerformance: { [pattern: string]: number } = {};
    const variantTypePerformance: { [type: string]: number } = {};
    
    this.shadowLearnings.forEach(learning => {
      patternPerformance[learning.pattern_type] = 
        (patternPerformance[learning.pattern_type] || 0) + learning.real_vs_shadow_performance.performance_delta;
    });
    
    this.shadowLog.forEach(log => {
      log.variants.forEach(variant => {
        const outcome = log.simulation_outcomes.find(o => o.variant_id === variant.variant_id);
        if (outcome) {
          variantTypePerformance[variant.variant_type] = 
            (variantTypePerformance[variant.variant_type] || 0) + outcome.simulated_profit_loss;
        }
      });
    });
    
    return {
      total_simulations: totalSimulations,
      total_variants_tested: totalVariants,
      avg_missed_opportunity: Math.round(avgMissedOpportunity * 100) / 100,
      avg_judgment_accuracy: Math.round(avgJudgmentAccuracy * 100) / 100,
      pattern_performance: patternPerformance,
      variant_type_performance: variantTypePerformance,
      learning_insights_count: this.shadowLearnings.length,
      simulation_activity: this.isSimulationActive
    };
  }

  setSimulationIntensity(intensity: 'LOW' | 'MEDIUM' | 'HIGH'): void {
    this.simulationIntensity = intensity;
    waidesKIDailyReporter.recordLesson(
      `Shadow simulation intensity set to ${intensity}`,
      'SYSTEM',
      'MEDIUM',
      'Shadow Simulator'
    );
  }

  enableSimulation(): void {
    this.isSimulationActive = true;
    waidesKIDailyReporter.logEmotionalState(
      'CURIOUS',
      'Shadow simulation system activated',
      'Shadow Simulator Enabled',
      80
    );
  }

  disableSimulation(): void {
    this.isSimulationActive = false;
    waidesKIDailyReporter.logEmotionalState(
      'FOCUSED',
      'Shadow simulation system deactivated',
      'Shadow Simulator Disabled',
      70
    );
  }

  exportShadowData(): any {
    return {
      shadow_log: this.shadowLog,
      shadow_learnings: this.shadowLearnings,
      shadow_statistics: this.getShadowStatistics(),
      simulation_config: {
        is_active: this.isSimulationActive,
        intensity: this.simulationIntensity,
        max_log_size: this.maxLogSize
      },
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKIShadowSimulator = new WaidesKIShadowSimulator();