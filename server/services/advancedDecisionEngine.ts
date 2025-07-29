import { signalAggregatorService, type SignalAggregationResult, type TradingSignal } from "./signalAggregator.js";

// Advanced Decision-Making Engine for 6 Individual Trading Entities
// Each entity has independent decision-making with secure trade execution

export interface TradingEntity {
  id: string;
  name: string;
  strategy: string;
  riskProfile: 'conservative' | 'balanced' | 'aggressive';
  timeframe: string;
  maxPositionSize: number;
  stopLossThreshold: number;
  takeProfitThreshold: number;
  enabled: boolean;
}

export interface RiskAssessment {
  riskScore: number; // 0-100 scale
  riskLevel: 'low' | 'medium' | 'high';
  maxPositionSize: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  shouldProceed: boolean;
  reasoning: string[];
}

export interface TradeDecision {
  entityId: string;
  action: 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
  confidence: number;
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  timeframe: string;
  reasoning: string[];
  riskAssessment: RiskAssessment;
  signalStrength: number;
  marketAlignment: number;
  timestamp: number;
  waitUntil?: number; // Timestamp to wait until for better conditions
}

export interface DecisionContext {
  currentPrice: number;
  marketConditions: any;
  entityBalance: number;
  existingPositions: any[];
  recentPerformance: any;
}

class AdvancedDecisionEngine {
  private entities: Map<string, TradingEntity> = new Map();
  private decisionHistory: Map<string, TradeDecision[]> = new Map();
  private readonly DECISION_HISTORY_LIMIT = 100;
  private readonly SAFE_THRESHOLD = 70; // Risk score threshold for safe trades

  constructor() {
    this.initializeEntities();
    this.startDecisionCleanup();
  }

  // Initialize the 6 trading entities with distinct configurations
  private initializeEntities(): void {
    const entities: TradingEntity[] = [
      {
        id: 'waidbot_alpha',
        name: 'WaidBot α',
        strategy: 'ETH Uptrend Momentum Specialist',
        riskProfile: 'conservative',
        timeframe: '1h',
        maxPositionSize: 1000,
        stopLossThreshold: 0.03, // 3%
        takeProfitThreshold: 0.08, // 8%
        enabled: true
      },
      {
        id: 'waidbot_pro_beta',
        name: 'WaidBot Pro β',
        strategy: 'Bidirectional Multi-Strategy',
        riskProfile: 'aggressive',
        timeframe: '4h',
        maxPositionSize: 1500,
        stopLossThreshold: 0.05, // 5%
        takeProfitThreshold: 0.12, // 12%
        enabled: true
      },
      {
        id: 'autonomous_gamma',
        name: 'Autonomous Trader γ',
        strategy: '24/7 Multi-Asset Scanner',
        riskProfile: 'balanced',
        timeframe: 'real-time',
        maxPositionSize: 2000,
        stopLossThreshold: 0.04, // 4%
        takeProfitThreshold: 0.10, // 10%
        enabled: true
      },
      {
        id: 'full_engine_omega',
        name: 'Full Engine Ω',
        strategy: 'ML Risk Management + Kelly Sizing',
        riskProfile: 'balanced',
        timeframe: 'adaptive',
        maxPositionSize: 2500,
        stopLossThreshold: 0.035, // 3.5%
        takeProfitThreshold: 0.09, // 9%
        enabled: true
      },
      {
        id: 'smai_chinnikstah_delta',
        name: 'Smai Chinnikstah δ',
        strategy: 'Divine Energy Distribution',
        riskProfile: 'conservative',
        timeframe: 'sacred-timing',
        maxPositionSize: 1200,
        stopLossThreshold: 0.025, // 2.5%
        takeProfitThreshold: 0.07, // 7%
        enabled: true
      },
      {
        id: 'nwaora_chigozie_epsilon',
        name: 'Nwaora Chigozie ε',
        strategy: 'Backup Operations & Risk Guardian',
        riskProfile: 'conservative',
        timeframe: '12h',
        maxPositionSize: 800,
        stopLossThreshold: 0.02, // 2%
        takeProfitThreshold: 0.06, // 6%
        enabled: true
      }
    ];

    entities.forEach(entity => {
      this.entities.set(entity.id, entity);
      this.decisionHistory.set(entity.id, []);
    });
  }

  // Main decision-making function for an entity
  async makeDecision(
    entityId: string, 
    signals: TradingSignal[], 
    context: DecisionContext
  ): Promise<TradeDecision> {
    try {
      const entity = this.entities.get(entityId);
      if (!entity || !entity.enabled) {
        return this.createNoActionDecision(entityId, 'Entity disabled or not found');
      }

      // Step 1: Aggregate and verify signals
      const signalResult = await signalAggregatorService.aggregateSignals(entityId, signals);
      
      // Step 2: Assess market conditions and timing
      const marketAlignment = await this.assessMarketAlignment(signalResult, entity);
      
      // Step 3: Perform risk assessment
      const riskAssessment = await this.performRiskAssessment(
        entity, signalResult, context
      );
      
      // Step 4: Check if we should wait for better conditions
      const shouldWait = this.shouldWaitForBetterConditions(
        signalResult, riskAssessment, entity
      );
      
      if (shouldWait.wait) {
        return this.createWaitDecision(entityId, shouldWait.reason, shouldWait.waitUntil);
      }
      
      // Step 5: Determine trade action based on entity strategy
      const action = this.determineTradeAction(entity, signalResult, riskAssessment);
      
      // Step 6: Calculate position sizing
      const positionSize = this.calculatePositionSize(
        entity, riskAssessment, context.entityBalance
      );
      
      // Step 7: Set entry and exit prices
      const prices = this.calculateEntryExitPrices(
        entity, action, context.currentPrice, riskAssessment
      );
      
      // Step 8: Generate comprehensive reasoning
      const reasoning = this.generateDecisionReasoning(
        entity, signalResult, riskAssessment, action, marketAlignment
      );
      
      const decision: TradeDecision = {
        entityId,
        action,
        confidence: this.calculateOverallConfidence(signalResult, riskAssessment, marketAlignment),
        entryPrice: prices.entry,
        exitPrice: prices.exit,
        positionSize,
        timeframe: entity.timeframe,
        reasoning,
        riskAssessment,
        signalStrength: signalResult.overallStrength,
        marketAlignment: signalResult.marketAlignment,
        timestamp: Date.now()
      };
      
      // Store decision in history
      this.storeDecision(entityId, decision);
      
      return decision;

    } catch (error) {
      console.error(`Decision-making error for ${entityId}:`, error);
      return this.createErrorDecision(entityId, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Assess market alignment specific to entity strategy
  private async assessMarketAlignment(
    signalResult: SignalAggregationResult, 
    entity: TradingEntity
  ): Promise<number> {
    let alignmentScore = signalResult.marketAlignment;
    
    // Apply entity-specific market alignment logic
    switch (entity.riskProfile) {
      case 'conservative':
        // Conservative entities need higher market stability
        if (signalResult.riskLevel === 'high') alignmentScore *= 0.5;
        break;
      case 'aggressive':
        // Aggressive entities can handle more volatility
        if (signalResult.riskLevel === 'high') alignmentScore *= 1.1;
        break;
      case 'balanced':
        // Balanced entities maintain standard alignment
        break;
    }
    
    return Math.min(1, Math.max(0, alignmentScore));
  }

  // Comprehensive risk assessment before trade execution
  private async performRiskAssessment(
    entity: TradingEntity,
    signalResult: SignalAggregationResult,
    context: DecisionContext
  ): Promise<RiskAssessment> {
    // Calculate base risk score
    let riskScore = 0;
    
    // Factor 1: Signal strength and consistency (40% weight)
    const signalRisk = (1 - signalResult.overallStrength) * 40;
    const consistencyRisk = (1 - signalResult.signalConsistency) * 20;
    
    // Factor 2: Market alignment (30% weight)
    const marketRisk = (1 - signalResult.marketAlignment) * 30;
    
    // Factor 3: Entity-specific risk (10% weight)
    const entityRisk = entity.riskProfile === 'aggressive' ? 5 : 
                      entity.riskProfile === 'balanced' ? 7 : 10;
    
    riskScore = signalRisk + consistencyRisk + marketRisk + entityRisk;
    
    // Determine risk level
    const riskLevel: 'low' | 'medium' | 'high' = 
      riskScore < 30 ? 'low' : riskScore < 60 ? 'medium' : 'high';
    
    // Calculate position sizing based on risk
    const riskAdjustedPosition = this.calculateRiskAdjustedPosition(
      entity.maxPositionSize, riskScore, context.entityBalance
    );
    
    // Calculate stop loss and take profit
    const stopLossPrice = context.currentPrice * (1 - entity.stopLossThreshold);
    const takeProfitPrice = context.currentPrice * (1 + entity.takeProfitThreshold);
    
    // Determine if we should proceed
    const shouldProceed = riskScore < this.SAFE_THRESHOLD && signalResult.greenLight;
    
    const reasoning = [
      `Risk score: ${riskScore.toFixed(1)}/100`,
      `Signal strength: ${(signalResult.overallStrength * 100).toFixed(1)}%`,
      `Market alignment: ${(signalResult.marketAlignment * 100).toFixed(1)}%`,
      `Entity profile: ${entity.riskProfile}`,
      shouldProceed ? 'Risk within acceptable limits' : 'Risk too high for safe execution'
    ];
    
    return {
      riskScore,
      riskLevel,
      maxPositionSize: riskAdjustedPosition,
      stopLossPrice,
      takeProfitPrice,
      shouldProceed,
      reasoning
    };
  }

  // Calculate risk-adjusted position size
  private calculateRiskAdjustedPosition(
    maxPosition: number, 
    riskScore: number, 
    balance: number
  ): number {
    const riskFactor = Math.max(0.1, 1 - (riskScore / 100));
    const balanceLimit = balance * 0.1; // Never risk more than 10% of balance
    
    return Math.min(maxPosition * riskFactor, balanceLimit);
  }

  // Check if entity should wait for better trading conditions
  private shouldWaitForBetterConditions(
    signalResult: SignalAggregationResult,
    riskAssessment: RiskAssessment,
    entity: TradingEntity
  ): { wait: boolean; reason: string; waitUntil?: number } {
    // Wait if signals are inconsistent
    if (signalResult.signalConsistency < 0.6) {
      return {
        wait: true,
        reason: 'Waiting for more consistent signals',
        waitUntil: Date.now() + (5 * 60 * 1000) // Wait 5 minutes
      };
    }
    
    // Wait if risk is too high
    if (riskAssessment.riskScore > this.SAFE_THRESHOLD) {
      return {
        wait: true,
        reason: 'Risk assessment indicates unsafe conditions',
        waitUntil: Date.now() + (10 * 60 * 1000) // Wait 10 minutes
      };
    }
    
    // Wait if market alignment is poor
    if (signalResult.marketAlignment < 0.5) {
      return {
        wait: true,
        reason: 'Poor market condition alignment',
        waitUntil: Date.now() + (15 * 60 * 1000) // Wait 15 minutes
      };
    }
    
    // Conservative entities wait for higher confidence
    if (entity.riskProfile === 'conservative' && signalResult.confidence < 0.8) {
      return {
        wait: true,
        reason: 'Conservative profile requires higher confidence',
        waitUntil: Date.now() + (20 * 60 * 1000) // Wait 20 minutes
      };
    }
    
    return { wait: false, reason: 'Conditions suitable for trading' };
  }

  // Determine trade action based on entity strategy and signals
  private determineTradeAction(
    entity: TradingEntity,
    signalResult: SignalAggregationResult,
    riskAssessment: RiskAssessment
  ): 'BUY' | 'SELL' | 'HOLD' | 'WAIT' {
    if (!riskAssessment.shouldProceed) return 'WAIT';
    if (!signalResult.greenLight) return 'HOLD';
    
    // Entity-specific action logic
    switch (entity.id) {
      case 'waidbot_alpha':
        // ETH Uptrend specialist - only buys on strong uptrends
        return signalResult.direction === 'bullish' && signalResult.overallStrength > 0.7 ? 'BUY' : 'HOLD';
        
      case 'waidbot_pro_beta':
        // Bidirectional - can buy or sell based on signals
        return signalResult.direction === 'bullish' ? 'BUY' : 
               signalResult.direction === 'bearish' ? 'SELL' : 'HOLD';
        
      case 'autonomous_gamma':
        // 24/7 scanner - dynamic based on real-time conditions
        return signalResult.overallStrength > 0.6 ? 
               (signalResult.direction === 'bullish' ? 'BUY' : 'SELL') : 'HOLD';
        
      case 'full_engine_omega':
        // ML Risk Management - sophisticated decision making
        const mlScore = signalResult.overallStrength * signalResult.confidence;
        return mlScore > 0.5 ? (signalResult.direction === 'bullish' ? 'BUY' : 'SELL') : 'HOLD';
        
      case 'smai_chinnikstah_delta':
        // Divine timing - very conservative
        return signalResult.confidence > 0.85 && signalResult.direction === 'bullish' ? 'BUY' : 'HOLD';
        
      case 'nwaora_chigozie_epsilon':
        // Backup guardian - extremely conservative
        return signalResult.confidence > 0.9 && riskAssessment.riskLevel === 'low' ? 'BUY' : 'HOLD';
        
      default:
        return 'HOLD';
    }
  }

  // Calculate position size based on entity rules and risk
  private calculatePositionSize(
    entity: TradingEntity,
    riskAssessment: RiskAssessment,
    balance: number
  ): number {
    const baseSize = Math.min(riskAssessment.maxPositionSize, balance * 0.05);
    
    // Apply entity-specific sizing rules
    switch (entity.riskProfile) {
      case 'conservative':
        return baseSize * 0.5;
      case 'aggressive':
        return baseSize * 1.5;
      default:
        return baseSize;
    }
  }

  // Calculate entry and exit prices
  private calculateEntryExitPrices(
    entity: TradingEntity,
    action: 'BUY' | 'SELL' | 'HOLD' | 'WAIT',
    currentPrice: number,
    riskAssessment: RiskAssessment
  ): { entry: number; exit: number } {
    if (action === 'HOLD' || action === 'WAIT') {
      return { entry: currentPrice, exit: currentPrice };
    }
    
    const entryPrice = currentPrice;
    const exitPrice = action === 'BUY' ? 
      riskAssessment.takeProfitPrice : riskAssessment.stopLossPrice;
    
    return { entry: entryPrice, exit: exitPrice };
  }

  // Calculate overall confidence score
  private calculateOverallConfidence(
    signalResult: SignalAggregationResult,
    riskAssessment: RiskAssessment,
    marketAlignment: number
  ): number {
    return (
      signalResult.confidence * 0.4 +
      (1 - riskAssessment.riskScore / 100) * 0.3 +
      marketAlignment * 0.3
    );
  }

  // Generate comprehensive reasoning for the decision
  private generateDecisionReasoning(
    entity: TradingEntity,
    signalResult: SignalAggregationResult,
    riskAssessment: RiskAssessment,
    action: string,
    marketAlignment: number
  ): string[] {
    const reasoning = [
      `Entity: ${entity.name} (${entity.strategy})`,
      `Signal strength: ${(signalResult.overallStrength * 100).toFixed(1)}%`,
      `Market alignment: ${(marketAlignment * 100).toFixed(1)}%`,
      `Risk level: ${riskAssessment.riskLevel} (${riskAssessment.riskScore.toFixed(1)}/100)`,
      `Action: ${action}`,
      ...signalResult.reasoning
    ];
    
    return reasoning;
  }

  // Store decision in history
  private storeDecision(entityId: string, decision: TradeDecision): void {
    const history = this.decisionHistory.get(entityId) || [];
    history.unshift(decision);
    
    if (history.length > this.DECISION_HISTORY_LIMIT) {
      history.splice(this.DECISION_HISTORY_LIMIT);
    }
    
    this.decisionHistory.set(entityId, history);
  }

  // Helper functions for creating different types of decisions
  private createNoActionDecision(entityId: string, reason: string): TradeDecision {
    return {
      entityId,
      action: 'HOLD',
      confidence: 0,
      entryPrice: 0,
      exitPrice: 0,
      positionSize: 0,
      timeframe: '0',
      reasoning: [reason],
      riskAssessment: {
        riskScore: 100,
        riskLevel: 'high',
        maxPositionSize: 0,
        stopLossPrice: 0,
        takeProfitPrice: 0,
        shouldProceed: false,
        reasoning: [reason]
      },
      signalStrength: 0,
      marketAlignment: 0,
      timestamp: Date.now()
    };
  }

  private createWaitDecision(entityId: string, reason: string, waitUntil?: number): TradeDecision {
    return {
      entityId,
      action: 'WAIT',
      confidence: 0.3,
      entryPrice: 0,
      exitPrice: 0,
      positionSize: 0,
      timeframe: 'waiting',
      reasoning: [reason],
      riskAssessment: {
        riskScore: 70,
        riskLevel: 'medium',
        maxPositionSize: 0,
        stopLossPrice: 0,
        takeProfitPrice: 0,
        shouldProceed: false,
        reasoning: [reason]
      },
      signalStrength: 0.3,
      marketAlignment: 0.3,
      timestamp: Date.now(),
      waitUntil
    };
  }

  private createErrorDecision(entityId: string, error: string): TradeDecision {
    return {
      entityId,
      action: 'HOLD',
      confidence: 0,
      entryPrice: 0,
      exitPrice: 0,
      positionSize: 0,
      timeframe: 'error',
      reasoning: [`Error: ${error}`],
      riskAssessment: {
        riskScore: 100,
        riskLevel: 'high',
        maxPositionSize: 0,
        stopLossPrice: 0,
        takeProfitPrice: 0,
        shouldProceed: false,
        reasoning: [`Error: ${error}`]
      },
      signalStrength: 0,
      marketAlignment: 0,
      timestamp: Date.now()
    };
  }

  // Background cleanup of old decisions
  private startDecisionCleanup(): void {
    setInterval(() => {
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
      
      for (const [entityId, history] of this.decisionHistory.entries()) {
        const filteredHistory = history.filter(
          decision => decision.timestamp > cutoffTime
        );
        
        if (filteredHistory.length !== history.length) {
          this.decisionHistory.set(entityId, filteredHistory);
        }
      }
    }, 60 * 60 * 1000); // Run every hour
  }

  // Public methods for external access
  getEntity(entityId: string): TradingEntity | undefined {
    return this.entities.get(entityId);
  }

  getAllEntities(): TradingEntity[] {
    return Array.from(this.entities.values());
  }

  getDecisionHistory(entityId: string, limit: number = 10): TradeDecision[] {
    const history = this.decisionHistory.get(entityId) || [];
    return history.slice(0, limit);
  }

  updateEntityConfig(entityId: string, updates: Partial<TradingEntity>): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;
    
    Object.assign(entity, updates);
    this.entities.set(entityId, entity);
    return true;
  }
}

export const advancedDecisionEngine = new AdvancedDecisionEngine();