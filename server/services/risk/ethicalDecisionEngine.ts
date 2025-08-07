/**
 * Ethical Decision Engine - AI Ethics for Trading Decisions
 * Ensures all 6 trading entities make ethical trading decisions
 */

export interface EthicalRule {
  id: string;
  name: string;
  description: string;
  category: 'market_manipulation' | 'fairness' | 'risk_management' | 'sustainability' | 'transparency' | 'harm_prevention';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  violationAction: 'warn' | 'block' | 'modify' | 'flag';
  parameters: Record<string, any>;
}

export interface TradingDecision {
  entity: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  quantity: number;
  price: number;
  confidence: number;
  reasoning: string;
  marketImpact: number;
  riskLevel: number;
  timeHorizon: string;
  metadata: Record<string, any>;
}

export interface EthicalAssessment {
  decision: TradingDecision;
  approved: boolean;
  violatedRules: EthicalViolation[];
  modifications: TradeModification[];
  ethicalScore: number;
  riskAssessment: string;
  recommendation: string;
  reviewRequired: boolean;
  timestamp: Date;
}

export interface EthicalViolation {
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  violationDetails: string;
  suggestedAction: string;
  confidence: number;
}

export interface TradeModification {
  type: 'quantity_reduction' | 'price_adjustment' | 'timing_delay' | 'execution_split' | 'cancellation';
  originalValue: any;
  modifiedValue: any;
  reason: string;
  impact: string;
}

export interface MarketContext {
  volatility: number;
  volume: number;
  orderBookDepth: number;
  recentNews: string[];
  marketHours: boolean;
  economicEvents: string[];
  socialSentiment: number;
}

export class EthicalDecisionEngine {
  private ethicalRules = new Map<string, EthicalRule>();
  private violationHistory: EthicalViolation[] = [];
  private assessmentHistory: EthicalAssessment[] = [];
  private maxHistorySize = 10000;

  constructor() {
    this.initializeEthicalRules();
    console.log('⚖️ Ethical Decision Engine initialized with comprehensive rules');
  }

  private initializeEthicalRules(): void {
    const rules: EthicalRule[] = [
      // Market Manipulation Prevention
      {
        id: 'no_wash_trading',
        name: 'Prevent Wash Trading',
        description: 'Prevent buying and selling to create artificial volume',
        category: 'market_manipulation',
        priority: 'critical',
        isActive: true,
        violationAction: 'block',
        parameters: {
          timeWindow: 300000, // 5 minutes
          priceThreshold: 0.001, // 0.1% price difference
          volumeThreshold: 0.05 // 5% of recent volume
        }
      },
      {
        id: 'no_pump_dump',
        name: 'Prevent Pump and Dump',
        description: 'Detect and prevent coordinated price manipulation',
        category: 'market_manipulation',
        priority: 'critical',
        isActive: true,
        violationAction: 'block',
        parameters: {
          priceImpactThreshold: 0.02, // 2% price impact
          volumeMultiplier: 3.0, // 3x average volume
          timeWindow: 600000 // 10 minutes
        }
      },
      {
        id: 'no_front_running',
        name: 'Prevent Front-running',
        description: 'Ensure trades don\'t unfairly front-run other orders',
        category: 'fairness',
        priority: 'high',
        isActive: true,
        violationAction: 'modify',
        parameters: {
          orderBookAnalysis: true,
          delayThreshold: 1000, // 1 second minimum delay
          sizeThreshold: 0.1 // 10% of order book
        }
      },

      // Risk Management Ethics
      {
        id: 'excessive_leverage',
        name: 'Prevent Excessive Leverage',
        description: 'Limit leverage to prevent dangerous over-exposure',
        category: 'risk_management',
        priority: 'high',
        isActive: true,
        violationAction: 'modify',
        parameters: {
          maxLeverage: 3.0, // 3x maximum leverage
          portfolioRiskLimit: 0.15, // 15% of portfolio at risk
          volatilityMultiplier: 2.0 // Reduce leverage in high volatility
        }
      },
      {
        id: 'concentration_risk',
        name: 'Prevent Over-concentration',
        description: 'Limit position size in any single asset',
        category: 'risk_management',
        priority: 'medium',
        isActive: true,
        violationAction: 'modify',
        parameters: {
          maxPositionSize: 0.25, // 25% of portfolio in one asset
          correlationThreshold: 0.7, // High correlation limit
          rebalanceThreshold: 0.05 // 5% deviation triggers rebalance
        }
      },
      {
        id: 'stop_loss_required',
        name: 'Mandatory Stop-loss',
        description: 'Ensure all positions have appropriate stop-losses',
        category: 'risk_management',
        priority: 'high',
        isActive: true,
        violationAction: 'modify',
        parameters: {
          maxLossPerTrade: 0.03, // 3% max loss per trade
          stopLossRequired: true,
          trailingStopEnabled: false
        }
      },

      // Sustainability and Social Responsibility
      {
        id: 'energy_conscious',
        name: 'Energy Conscious Trading',
        description: 'Consider environmental impact of trading activities',
        category: 'sustainability',
        priority: 'low',
        isActive: true,
        violationAction: 'flag',
        parameters: {
          highFrequencyLimit: 1000, // Max trades per hour
          energyIntensiveAssets: ['BTC'], // Flag energy-intensive assets
          sustainabilityScore: 0.3 // Minimum sustainability score
        }
      },
      {
        id: 'social_impact',
        name: 'Social Impact Assessment',
        description: 'Consider broader social implications of trading decisions',
        category: 'sustainability',
        priority: 'medium',
        isActive: true,
        violationAction: 'warn',
        parameters: {
          volatilePeriodsAvoidance: true,
          emergencyMarketHalt: true,
          socialSentimentThreshold: -0.7 // Avoid trading during negative sentiment
        }
      },

      // Transparency and Fairness
      {
        id: 'transparent_reasoning',
        name: 'Transparent Decision Making',
        description: 'All trading decisions must have clear, traceable reasoning',
        category: 'transparency',
        priority: 'medium',
        isActive: true,
        violationAction: 'flag',
        parameters: {
          minConfidenceLevel: 0.3, // Minimum confidence for execution
          reasoningRequired: true,
          auditTrailRequired: true
        }
      },
      {
        id: 'fair_execution',
        name: 'Fair Order Execution',
        description: 'Ensure fair and equitable order execution practices',
        category: 'fairness',
        priority: 'high',
        isActive: true,
        violationAction: 'modify',
        parameters: {
          priceImprovementSharing: true,
          queueJumpingPrevention: true,
          executionDelayVariation: 500 // Max 500ms variation in execution
        }
      },

      // Harm Prevention
      {
        id: 'market_stability',
        name: 'Market Stability Protection',
        description: 'Avoid trades that could destabilize the market',
        category: 'harm_prevention',
        priority: 'critical',
        isActive: true,
        violationAction: 'block',
        parameters: {
          maxMarketImpact: 0.005, // 0.5% market impact limit
          liquidityThreshold: 0.1, // Don't trade if liquidity < 10%
          circuitBreakerRespect: true
        }
      },
      {
        id: 'flash_crash_prevention',
        name: 'Flash Crash Prevention',
        description: 'Detect and prevent contributing to flash crashes',
        category: 'harm_prevention',
        priority: 'critical',
        isActive: true,
        violationAction: 'block',
        parameters: {
          rapidPriceMovement: 0.1, // 10% price movement
          timeWindow: 60000, // 1 minute
          cascadeDetection: true
        }
      }
    ];

    rules.forEach(rule => {
      this.ethicalRules.set(rule.id, rule);
    });

    console.log(`⚖️ Loaded ${rules.length} ethical rules for trading decision assessment`);
  }

  public async assessTradingDecision(
    decision: TradingDecision,
    marketContext: MarketContext
  ): Promise<EthicalAssessment> {
    
    const violatedRules: EthicalViolation[] = [];
    const modifications: TradeModification[] = [];
    let ethicalScore = 100;

    // Evaluate against each active rule
    for (const rule of this.ethicalRules.values()) {
      if (!rule.isActive) continue;

      const violation = await this.evaluateRule(rule, decision, marketContext);
      if (violation) {
        violatedRules.push(violation);
        ethicalScore -= this.calculateScorePenalty(violation);

        // Apply rule actions
        const modification = this.applyRuleAction(rule, decision, violation);
        if (modification) {
          modifications.push(modification);
        }
      }
    }

    // Determine if decision is approved
    const criticalViolations = violatedRules.filter(v => v.severity === 'critical');
    const approved = criticalViolations.length === 0 && ethicalScore >= 60;

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      decision,
      violatedRules,
      modifications,
      ethicalScore
    );

    const assessment: EthicalAssessment = {
      decision,
      approved,
      violatedRules,
      modifications,
      ethicalScore: Math.max(0, ethicalScore),
      riskAssessment: this.assessRiskLevel(violatedRules),
      recommendation,
      reviewRequired: criticalViolations.length > 0 || ethicalScore < 40,
      timestamp: new Date()
    };

    // Store assessment
    this.storeAssessment(assessment);

    console.log(
      `⚖️ Ethical assessment for ${decision.entity} ${decision.action}: ` +
      `${approved ? 'APPROVED' : 'REJECTED'} (Score: ${assessment.ethicalScore})`
    );

    return assessment;
  }

  private async evaluateRule(
    rule: EthicalRule,
    decision: TradingDecision,
    marketContext: MarketContext
  ): Promise<EthicalViolation | null> {
    
    switch (rule.id) {
      case 'no_wash_trading':
        return this.checkWashTrading(rule, decision);
      
      case 'no_pump_dump':
        return this.checkPumpAndDump(rule, decision, marketContext);
      
      case 'no_front_running':
        return this.checkFrontRunning(rule, decision, marketContext);
      
      case 'excessive_leverage':
        return this.checkExcessiveLeverage(rule, decision);
      
      case 'concentration_risk':
        return this.checkConcentrationRisk(rule, decision);
      
      case 'stop_loss_required':
        return this.checkStopLossRequirement(rule, decision);
      
      case 'energy_conscious':
        return this.checkEnergyConcerns(rule, decision);
      
      case 'social_impact':
        return this.checkSocialImpact(rule, decision, marketContext);
      
      case 'transparent_reasoning':
        return this.checkReasoningTransparency(rule, decision);
      
      case 'fair_execution':
        return this.checkFairExecution(rule, decision);
      
      case 'market_stability':
        return this.checkMarketStability(rule, decision, marketContext);
      
      case 'flash_crash_prevention':
        return this.checkFlashCrashRisk(rule, decision, marketContext);
      
      default:
        return null;
    }
  }

  private checkWashTrading(rule: EthicalRule, decision: TradingDecision): EthicalViolation | null {
    // In a real implementation, this would check recent trading history
    // For now, implement basic logic based on rapid buy/sell patterns
    
    const recentTrades = this.getRecentTradesByEntity(decision.entity, rule.parameters.timeWindow);
    const oppositeActions = recentTrades.filter(trade => 
      trade.symbol === decision.symbol && 
      trade.action !== decision.action &&
      Math.abs(trade.price - decision.price) / decision.price < rule.parameters.priceThreshold
    );

    if (oppositeActions.length > 0) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        severity: 'critical',
        description: 'Potential wash trading detected',
        violationDetails: `Found ${oppositeActions.length} opposite trades within time window`,
        suggestedAction: 'Block trade and review trading patterns',
        confidence: 0.8
      };
    }

    return null;
  }

  private checkPumpAndDump(
    rule: EthicalRule, 
    decision: TradingDecision, 
    marketContext: MarketContext
  ): EthicalViolation | null {
    
    const priceImpact = this.estimateMarketImpact(decision, marketContext);
    const volumeRatio = decision.quantity * decision.price / (marketContext.volume || 1);

    if (priceImpact > rule.parameters.priceImpactThreshold || 
        volumeRatio > rule.parameters.volumeMultiplier) {
      
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        severity: 'critical',
        description: 'Trade may contribute to price manipulation',
        violationDetails: `Price impact: ${(priceImpact * 100).toFixed(2)}%, Volume ratio: ${volumeRatio.toFixed(2)}x`,
        suggestedAction: 'Reduce trade size or split across multiple orders',
        confidence: 0.9
      };
    }

    return null;
  }

  private checkExcessiveLeverage(rule: EthicalRule, decision: TradingDecision): EthicalViolation | null {
    // Simplified leverage calculation
    const impliedLeverage = decision.riskLevel || 1;
    
    if (impliedLeverage > rule.parameters.maxLeverage) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        severity: 'high',
        description: 'Excessive leverage detected',
        violationDetails: `Leverage: ${impliedLeverage}x, Max allowed: ${rule.parameters.maxLeverage}x`,
        suggestedAction: 'Reduce position size to lower leverage',
        confidence: 0.95
      };
    }

    return null;
  }

  private checkMarketStability(
    rule: EthicalRule,
    decision: TradingDecision,
    marketContext: MarketContext
  ): EthicalViolation | null {
    
    const marketImpact = this.estimateMarketImpact(decision, marketContext);
    
    if (marketImpact > rule.parameters.maxMarketImpact) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        severity: 'critical',
        description: 'Trade may destabilize market',
        violationDetails: `Estimated market impact: ${(marketImpact * 100).toFixed(2)}%`,
        suggestedAction: 'Split trade into smaller orders over time',
        confidence: 0.85
      };
    }

    return null;
  }

  private checkFlashCrashRisk(
    rule: EthicalRule,
    decision: TradingDecision,
    marketContext: MarketContext
  ): EthicalViolation | null {
    
    if (marketContext.volatility > 0.05) { // High volatility
      const marketImpact = this.estimateMarketImpact(decision, marketContext);
      
      if (marketImpact > 0.02) { // 2% impact during volatile times
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          severity: 'critical',
          description: 'Trade may contribute to flash crash during volatile period',
          violationDetails: `High volatility (${(marketContext.volatility * 100).toFixed(1)}%) + large impact`,
          suggestedAction: 'Delay trade until market stabilizes',
          confidence: 0.75
        };
      }
    }

    return null;
  }

  private checkReasoningTransparency(rule: EthicalRule, decision: TradingDecision): EthicalViolation | null {
    if (!decision.reasoning || decision.reasoning.trim().length < 10) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        severity: 'medium',
        description: 'Insufficient reasoning provided for trade',
        violationDetails: 'Trade lacks clear reasoning or explanation',
        suggestedAction: 'Provide detailed reasoning for trading decision',
        confidence: 1.0
      };
    }

    if (decision.confidence < rule.parameters.minConfidenceLevel) {
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        severity: 'medium',
        description: 'Low confidence trade',
        violationDetails: `Confidence: ${decision.confidence}, Min required: ${rule.parameters.minConfidenceLevel}`,
        suggestedAction: 'Increase confidence threshold or provide better reasoning',
        confidence: 0.9
      };
    }

    return null;
  }

  // Placeholder methods for other rule checks
  private checkFrontRunning(rule: EthicalRule, decision: TradingDecision, marketContext: MarketContext): EthicalViolation | null { return null; }
  private checkConcentrationRisk(rule: EthicalRule, decision: TradingDecision): EthicalViolation | null { return null; }
  private checkStopLossRequirement(rule: EthicalRule, decision: TradingDecision): EthicalViolation | null { return null; }
  private checkEnergyConcerns(rule: EthicalRule, decision: TradingDecision): EthicalViolation | null { return null; }
  private checkSocialImpact(rule: EthicalRule, decision: TradingDecision, marketContext: MarketContext): EthicalViolation | null { return null; }
  private checkFairExecution(rule: EthicalRule, decision: TradingDecision): EthicalViolation | null { return null; }

  private estimateMarketImpact(decision: TradingDecision, marketContext: MarketContext): number {
    const tradeSize = decision.quantity * decision.price;
    const marketDepth = marketContext.orderBookDepth || 1000000; // Default $1M depth
    return Math.min(0.1, tradeSize / marketDepth); // Max 10% impact
  }

  private getRecentTradesByEntity(entity: string, timeWindow: number): TradingDecision[] {
    // In a real implementation, this would query actual trade history
    return [];
  }

  private calculateScorePenalty(violation: EthicalViolation): number {
    const severityPenalties = {
      low: 5,
      medium: 15,
      high: 30,
      critical: 50
    };

    const basePenalty = severityPenalties[violation.severity];
    return basePenalty * violation.confidence;
  }

  private applyRuleAction(
    rule: EthicalRule,
    decision: TradingDecision,
    violation: EthicalViolation
  ): TradeModification | null {
    
    switch (rule.violationAction) {
      case 'modify':
        return this.generateModification(rule, decision, violation);
      
      case 'block':
        return {
          type: 'cancellation',
          originalValue: decision,
          modifiedValue: null,
          reason: `Blocked due to ${violation.ruleName}`,
          impact: 'Trade cancelled for ethical reasons'
        };
      
      default:
        return null;
    }
  }

  private generateModification(
    rule: EthicalRule,
    decision: TradingDecision,
    violation: EthicalViolation
  ): TradeModification {
    
    // Generate appropriate modification based on rule type
    if (rule.category === 'risk_management' && rule.id === 'excessive_leverage') {
      const reductionFactor = rule.parameters.maxLeverage / (decision.riskLevel || 1);
      const newQuantity = decision.quantity * reductionFactor;
      
      return {
        type: 'quantity_reduction',
        originalValue: decision.quantity,
        modifiedValue: newQuantity,
        reason: 'Reduced quantity to limit leverage exposure',
        impact: `Quantity reduced by ${((1 - reductionFactor) * 100).toFixed(1)}%`
      };
    }

    // Default modification
    return {
      type: 'quantity_reduction',
      originalValue: decision.quantity,
      modifiedValue: decision.quantity * 0.5,
      reason: `Reduced due to ${violation.ruleName}`,
      impact: 'Quantity reduced by 50% for ethical compliance'
    };
  }

  private generateRecommendation(
    decision: TradingDecision,
    violations: EthicalViolation[],
    modifications: TradeModification[],
    ethicalScore: number
  ): string {
    
    if (violations.length === 0) {
      return 'Trade approved. No ethical concerns identified.';
    }

    const criticalViolations = violations.filter(v => v.severity === 'critical');
    if (criticalViolations.length > 0) {
      return `Trade blocked due to critical ethical violations: ${criticalViolations.map(v => v.ruleName).join(', ')}. Review and modify strategy.`;
    }

    if (modifications.length > 0) {
      return `Trade modified to address ethical concerns. Applied ${modifications.length} modification(s). Review modified parameters before execution.`;
    }

    if (ethicalScore < 60) {
      return `Trade has low ethical score (${ethicalScore}). Consider reviewing strategy and risk management approach.`;
    }

    return 'Trade approved with minor ethical concerns. Monitor performance closely.';
  }

  private assessRiskLevel(violations: EthicalViolation[]): string {
    const criticalCount = violations.filter(v => v.severity === 'critical').length;
    const highCount = violations.filter(v => v.severity === 'high').length;

    if (criticalCount > 0) return 'CRITICAL';
    if (highCount > 1) return 'HIGH';
    if (violations.length > 3) return 'MEDIUM';
    return 'LOW';
  }

  private storeAssessment(assessment: EthicalAssessment): void {
    this.assessmentHistory.push(assessment);
    
    // Store violations in history
    assessment.violatedRules.forEach(violation => {
      this.violationHistory.push(violation);
    });

    // Trim histories to prevent memory issues
    if (this.assessmentHistory.length > this.maxHistorySize) {
      this.assessmentHistory = this.assessmentHistory.slice(-this.maxHistorySize);
    }
    
    if (this.violationHistory.length > this.maxHistorySize) {
      this.violationHistory = this.violationHistory.slice(-this.maxHistorySize);
    }
  }

  public getEthicalRule(ruleId: string): EthicalRule | undefined {
    return this.ethicalRules.get(ruleId);
  }

  public updateEthicalRule(ruleId: string, updates: Partial<EthicalRule>): boolean {
    const rule = this.ethicalRules.get(ruleId);
    if (!rule) return false;

    const updatedRule = { ...rule, ...updates };
    this.ethicalRules.set(ruleId, updatedRule);
    
    console.log(`⚖️ Updated ethical rule: ${rule.name}`);
    return true;
  }

  public getAssessmentHistory(entity?: string, days: number = 7): EthicalAssessment[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return this.assessmentHistory
      .filter(assessment => 
        assessment.timestamp >= cutoffDate &&
        (entity ? assessment.decision.entity === entity : true)
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public getEthicalStatistics(): {
    totalAssessments: number;
    approvalRate: number;
    averageEthicalScore: number;
    topViolatedRules: Array<{ ruleId: string; count: number; severity: string }>;
    entitiesEthicalScores: Record<string, number>;
  } {
    
    const assessments = this.assessmentHistory.slice(-1000); // Last 1000 assessments
    const approvedCount = assessments.filter(a => a.approved).length;
    const avgScore = assessments.length > 0 
      ? assessments.reduce((sum, a) => sum + a.ethicalScore, 0) / assessments.length 
      : 0;

    // Count rule violations
    const ruleViolationCounts = new Map<string, { count: number; severity: string }>();
    this.violationHistory.slice(-1000).forEach(violation => {
      const existing = ruleViolationCounts.get(violation.ruleId);
      if (existing) {
        existing.count++;
      } else {
        ruleViolationCounts.set(violation.ruleId, { count: 1, severity: violation.severity });
      }
    });

    const topViolatedRules = Array.from(ruleViolationCounts.entries())
      .map(([ruleId, data]) => ({ ruleId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate entity scores
    const entityScores: Record<string, number> = {};
    const entityAssessments = new Map<string, number[]>();
    
    assessments.forEach(assessment => {
      const entity = assessment.decision.entity;
      if (!entityAssessments.has(entity)) {
        entityAssessments.set(entity, []);
      }
      entityAssessments.get(entity)!.push(assessment.ethicalScore);
    });

    entityAssessments.forEach((scores, entity) => {
      entityScores[entity] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    return {
      totalAssessments: assessments.length,
      approvalRate: assessments.length > 0 ? approvedCount / assessments.length : 0,
      averageEthicalScore: avgScore,
      topViolatedRules,
      entitiesEthicalScores: entityScores
    };
  }
}

// Export singleton instance
let ethicalDecisionEngineInstance: EthicalDecisionEngine | null = null;

export function getEthicalDecisionEngine(): EthicalDecisionEngine {
  if (!ethicalDecisionEngineInstance) {
    ethicalDecisionEngineInstance = new EthicalDecisionEngine();
  }
  return ethicalDecisionEngineInstance;
}