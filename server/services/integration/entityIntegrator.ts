/**
 * Entity Integrator - Coordinates All 6 Trading Entities
 * Central integration point for AI model interactions across all entities
 */

import { getTestDataManager, TestDataset } from '../ai/testDataManager';
import { getInputValidator, ValidationResult } from '../ai/inputValidator';
import { getModelTrainer, AIModel } from '../ai/modelTrainer';
import { getPerformanceDriftMonitor, DriftAlert } from '../ai/performanceDriftMonitor';
import { getModelTraceability, TraceabilityRecord } from '../ai/modelTraceability';
import { getEthicalDecisionEngine, TradingDecision, EthicalAssessment } from '../risk/ethicalDecisionEngine';
import { getKellySizerValidator, KellyParameters } from '../risk/kellySizerValidator';
import { getPositionWatchdog, Position } from '../risk/positionWatchdog';
import { getPsychologyIndicators, FearGreedIndex, MarketSentiment } from '../analysis/psychologyIndicators';
import { getABTestRunner, ABTest } from '../testing/abTestRunner';
import { getIntuitionLayer, SpiritualReading, DivineSignal } from '../spiritual/intuitionLayer';
import { getLossStreakTracker, LossStreak } from '../monitoring/lossStreakTracker';

export interface EntityConfiguration {
  id: string;
  name: string;
  type: 'alpha' | 'beta' | 'gamma' | 'omega' | 'delta' | 'epsilon';
  status: 'active' | 'paused' | 'disabled' | 'maintenance';
  aiModelsEnabled: boolean;
  ethicalChecksEnabled: boolean;
  spiritualGuidanceEnabled: boolean;
  riskManagementLevel: 'conservative' | 'moderate' | 'aggressive';
  maxPositionSize: number;
  confidenceThreshold: number;
  lastUpdated: Date;
}

export interface IntegratedTradingSignal {
  entityId: string;
  signal: TradingDecision;
  validationResult: ValidationResult;
  ethicalAssessment: EthicalAssessment;
  kellySizing: any;
  psychologyFactors: {
    fearGreed: FearGreedIndex;
    sentiment: MarketSentiment;
    riskAdjustment: number;
  };
  spiritualGuidance?: {
    reading: SpiritualReading;
    divineSignal: DivineSignal;
  };
  traceabilityRecord: TraceabilityRecord;
  finalRecommendation: 'EXECUTE' | 'MODIFY' | 'REJECT' | 'DELAY';
  modificationSuggestions: string[];
  confidence: number;
  timestamp: Date;
}

export interface EntityStatus {
  entity: string;
  isActive: boolean;
  currentModel: AIModel;
  activePositions: number;
  totalValue: number;
  recentPerformance: {
    winRate: number;
    profitLoss: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  activeAlerts: number;
  lossStreak?: LossStreak;
  spiritualAlignment: number;
  lastActivity: Date;
}

export interface SystemHealthReport {
  timestamp: Date;
  overallHealth: number; // 0-100
  entitiesStatus: EntityStatus[];
  systemWideAlerts: {
    drift: DriftAlert[];
    ethical: any[];
    psychological: any[];
    spiritual: any[];
    lossStreaks: any[];
  };
  performanceMetrics: {
    totalTrades: number;
    systemWinRate: number;
    totalProfitLoss: number;
    averageConfidence: number;
  };
  recommendations: string[];
}

export interface CrossEntityAnalysis {
  correlations: Record<string, Record<string, number>>;
  systemicRisks: string[];
  opportunityAlignment: string[];
  resourceOptimization: string[];
  coordinatedActions: string[];
}

export class EntityIntegrator {
  private entities = new Map<string, EntityConfiguration>();
  private testDataManager = getTestDataManager();
  private inputValidator = getInputValidator();
  private modelTrainer = getModelTrainer();
  private driftMonitor = getPerformanceDriftMonitor();
  private traceability = getModelTraceability();
  private ethicalEngine = getEthicalDecisionEngine();
  private kellySizer = getKellySizerValidator();
  private positionWatchdog = getPositionWatchdog();
  private psychologyIndicators = getPsychologyIndicators();
  private abTestRunner = getABTestRunner();
  private intuitionLayer = getIntuitionLayer();
  private lossStreakTracker = getLossStreakTracker();

  constructor() {
    this.initializeEntities();
    this.startCrossEntityMonitoring();
    console.log('🔗 Entity Integrator initialized - coordinating all 6 trading entities');
  }

  private initializeEntities(): void {
    const entityConfigs: Omit<EntityConfiguration, 'lastUpdated'>[] = [
      {
        id: 'waidbot_alpha',
        name: 'WaidBot Alpha',
        type: 'alpha',
        status: 'active',
        aiModelsEnabled: true,
        ethicalChecksEnabled: true,
        spiritualGuidanceEnabled: false,
        riskManagementLevel: 'conservative',
        maxPositionSize: 0.05, // 5% max position size
        confidenceThreshold: 0.6
      },
      {
        id: 'waidbot_pro_beta',
        name: 'WaidBot Pro Beta',
        type: 'beta',
        status: 'active',
        aiModelsEnabled: true,
        ethicalChecksEnabled: true,
        spiritualGuidanceEnabled: false,
        riskManagementLevel: 'moderate',
        maxPositionSize: 0.1, // 10% max position size
        confidenceThreshold: 0.65
      },
      {
        id: 'autonomous_trader_gamma',
        name: 'Autonomous Trader Gamma',
        type: 'gamma',
        status: 'active',
        aiModelsEnabled: true,
        ethicalChecksEnabled: true,
        spiritualGuidanceEnabled: false,
        riskManagementLevel: 'aggressive',
        maxPositionSize: 0.15, // 15% max position size
        confidenceThreshold: 0.7
      },
      {
        id: 'full_engine_omega',
        name: 'Full Engine Omega',
        type: 'omega',
        status: 'active',
        aiModelsEnabled: true,
        ethicalChecksEnabled: true,
        spiritualGuidanceEnabled: true,
        riskManagementLevel: 'moderate',
        maxPositionSize: 0.2, // 20% max position size
        confidenceThreshold: 0.75
      },
      {
        id: 'smai_chinnikstah_delta',
        name: 'Smai Chinnikstah Delta',
        type: 'delta',
        status: 'active',
        aiModelsEnabled: true,
        ethicalChecksEnabled: true,
        spiritualGuidanceEnabled: true,
        riskManagementLevel: 'moderate',
        maxPositionSize: 0.12, // 12% max position size
        confidenceThreshold: 0.7
      },
      {
        id: 'nwaora_chigozie_epsilon',
        name: 'Nwaora Chigozie Epsilon',
        type: 'epsilon',
        status: 'active',
        aiModelsEnabled: true,
        ethicalChecksEnabled: true,
        spiritualGuidanceEnabled: false,
        riskManagementLevel: 'conservative',
        maxPositionSize: 0.03, // 3% max position size (backup system)
        confidenceThreshold: 0.8
      }
    ];

    entityConfigs.forEach(config => {
      const entity: EntityConfiguration = {
        ...config,
        lastUpdated: new Date()
      };
      this.entities.set(entity.id, entity);
    });

    console.log(`🔗 Initialized ${this.entities.size} trading entities`);
  }

  public async processIntegratedTradingSignal(
    entityId: string,
    rawSignal: Omit<TradingDecision, 'entity'>,
    marketData: {
      price: number;
      volume: number;
      volatility: number;
      sentiment: number;
    }
  ): Promise<IntegratedTradingSignal> {
    
    const entity = this.entities.get(entityId);
    if (!entity || entity.status !== 'active') {
      throw new Error(`Entity ${entityId} is not active`);
    }

    const signal: TradingDecision = {
      ...rawSignal,
      entity: entity.type
    };

    console.log(`🔗 Processing integrated signal for ${entity.name}: ${signal.action} ${signal.symbol}`);

    // Step 1: Input Validation
    const validationResult = this.inputValidator.validateTradingSignal({
      ...signal,
      timestamp: Date.now()
    });

    if (!validationResult.isValid) {
      console.warn(`❌ Signal validation failed for ${entityId}:`, validationResult.errors);
    }

    // Step 2: Ethical Assessment
    let ethicalAssessment: EthicalAssessment | null = null;
    if (entity.ethicalChecksEnabled) {
      ethicalAssessment = await this.ethicalEngine.assessTradingDecision(signal, {
        volatility: marketData.volatility,
        volume: marketData.volume,
        orderBookDepth: marketData.volume * marketData.price,
        recentNews: [],
        marketHours: true,
        economicEvents: [],
        socialSentiment: marketData.sentiment
      });
    }

    // Step 3: Kelly Sizing
    const kellySizing = this.calculateKellyPositionSize(entity, signal);

    // Step 4: Psychology Analysis
    const fearGreed = this.psychologyIndicators.calculateFearGreedIndex(marketData);
    const sentiment = this.psychologyIndicators.calculateMarketSentiment(marketData);
    const psychologyAnalysis = this.psychologyIndicators.analyzeEntityPsychology(
      entity.type,
      [] // Would pass recent trades in production
    );

    const psychologyFactors = {
      fearGreed,
      sentiment,
      riskAdjustment: psychologyAnalysis.riskAdjustment
    };

    // Step 5: Spiritual Guidance (if enabled)
    let spiritualGuidance: IntegratedTradingSignal['spiritualGuidance'];
    if (entity.spiritualGuidanceEnabled) {
      const reading = this.intuitionLayer.generateSpiritualReading(entity.type, marketData);
      const divineSignal = this.intuitionLayer.generateDivineSignal(entity.type);
      spiritualGuidance = { reading, divineSignal };
    }

    // Step 6: Model Traceability
    const traceabilityRecord = this.traceability.traceModelOutput(
      `${entityId}_model`,
      entity.type,
      '1.0.0',
      {
        price: marketData.price,
        volume: marketData.volume,
        volatility: marketData.volatility,
        sentiment: marketData.sentiment
      },
      signal.confidence,
      signal.confidence,
      `signal_${Date.now()}`,
      {
        marketSymbol: signal.symbol,
        marketPrice: signal.price,
        tradingAction: signal.action,
        riskLevel: entity.riskManagementLevel
      }
    );

    // Step 7: Generate Final Recommendation
    const { finalRecommendation, modificationSuggestions, finalConfidence } = 
      this.generateFinalRecommendation(
        signal,
        validationResult,
        ethicalAssessment,
        psychologyFactors,
        spiritualGuidance,
        entity
      );

    const integratedSignal: IntegratedTradingSignal = {
      entityId,
      signal,
      validationResult,
      ethicalAssessment: ethicalAssessment!,
      kellySizing,
      psychologyFactors,
      spiritualGuidance,
      traceabilityRecord,
      finalRecommendation,
      modificationSuggestions,
      confidence: finalConfidence,
      timestamp: new Date()
    };

    console.log(`✅ Integrated signal processed for ${entity.name}: ${finalRecommendation} (${(finalConfidence * 100).toFixed(1)}% confidence)`);

    return integratedSignal;
  }

  private calculateKellyPositionSize(entity: EntityConfiguration, signal: TradingDecision): any {
    // Simplified Kelly calculation - would use real trading history in production
    const mockParams: KellyParameters = {
      winRate: 0.6, // 60% win rate assumption
      avgWin: 0.03, // 3% average win
      avgLoss: 0.02, // 2% average loss
      bankroll: 10000, // $10k bankroll assumption
      confidence: signal.confidence,
      marketVolatility: signal.riskLevel || 0.02
    };

    return this.kellySizer.calculateKellySizing(mockParams);
  }

  private generateFinalRecommendation(
    signal: TradingDecision,
    validation: ValidationResult,
    ethical: EthicalAssessment | null,
    psychology: any,
    spiritual: any,
    entity: EntityConfiguration
  ): {
    finalRecommendation: 'EXECUTE' | 'MODIFY' | 'REJECT' | 'DELAY';
    modificationSuggestions: string[];
    finalConfidence: number;
  } {
    
    const suggestions: string[] = [];
    let confidence = signal.confidence;

    // Check validation
    if (!validation.isValid) {
      return {
        finalRecommendation: 'REJECT',
        modificationSuggestions: ['Fix validation errors: ' + validation.errors.join(', ')],
        finalConfidence: 0
      };
    }

    // Check ethical assessment
    if (ethical && !ethical.approved) {
      if (ethical.ethicalScore < 40) {
        return {
          finalRecommendation: 'REJECT',
          modificationSuggestions: ['Ethical violations: ' + ethical.recommendation],
          finalConfidence: 0
        };
      } else {
        suggestions.push('Apply ethical modifications: ' + ethical.recommendation);
        confidence *= 0.8;
      }
    }

    // Check confidence threshold
    if (confidence < entity.confidenceThreshold) {
      return {
        finalRecommendation: 'REJECT',
        modificationSuggestions: [`Confidence ${(confidence * 100).toFixed(1)}% below threshold ${(entity.confidenceThreshold * 100).toFixed(1)}%`],
        finalConfidence: confidence
      };
    }

    // Check psychology factors
    if (psychology.fearGreed.level === 'extreme_fear' || psychology.fearGreed.level === 'extreme_greed') {
      suggestions.push(`Extreme market psychology detected: ${psychology.fearGreed.level}`);
      confidence *= psychology.riskAdjustment;
    }

    // Check spiritual guidance
    if (spiritual?.divineSignal) {
      if (spiritual.divineSignal.signalType === 'danger_alert') {
        return {
          finalRecommendation: 'REJECT',
          modificationSuggestions: ['Spiritual guidance warns of danger: ' + spiritual.divineSignal.message],
          finalConfidence: 0
        };
      } else if (spiritual.divineSignal.tradingAction !== signal.action) {
        suggestions.push(`Spiritual guidance suggests ${spiritual.divineSignal.tradingAction} instead of ${signal.action}`);
      }
    }

    // Determine final recommendation
    let recommendation: 'EXECUTE' | 'MODIFY' | 'REJECT' | 'DELAY' = 'EXECUTE';
    
    if (suggestions.length > 2) {
      recommendation = 'MODIFY';
    } else if (confidence < entity.confidenceThreshold * 1.2) {
      recommendation = 'DELAY';
      suggestions.push('Wait for higher confidence or better market conditions');
    }

    return {
      finalRecommendation: recommendation,
      modificationSuggestions: suggestions,
      finalConfidence: confidence
    };
  }

  public async generateSystemHealthReport(): Promise<SystemHealthReport> {
    const entitiesStatus: EntityStatus[] = [];
    const systemWideAlerts = {
      drift: this.driftMonitor.getActiveAlerts(),
      ethical: [],
      psychological: [],
      spiritual: [],
      lossStreaks: []
    };

    let totalTrades = 0;
    let totalProfitLoss = 0;
    let totalConfidence = 0;
    let systemWinRate = 0;

    // Collect status for each entity
    for (const [entityId, entity] of this.entities) {
      const positions = this.positionWatchdog.getAllPositions(entity.type);
      const activeLossStreak = this.lossStreakTracker.getActiveStreaks()
        .find(streak => streak.entity === entity.type);
      
      // Get current model (simplified)
      const models = this.modelTrainer.getModelsByEntity(entity.type);
      const currentModel = models[0]; // Get first model
      
      const status: EntityStatus = {
        entity: entityId,
        isActive: entity.status === 'active',
        currentModel: currentModel!,
        activePositions: positions.length,
        totalValue: positions.reduce((sum, pos) => sum + pos.quantity * pos.currentPrice, 0),
        recentPerformance: {
          winRate: 0.65, // Would calculate from real data
          profitLoss: Math.random() * 1000 - 500, // Simulated
          sharpeRatio: Math.random() * 2,
          maxDrawdown: Math.random() * 0.1
        },
        activeAlerts: this.driftMonitor.getActiveAlerts(currentModel?.id).length,
        lossStreak: activeLossStreak,
        spiritualAlignment: entity.spiritualGuidanceEnabled 
          ? Math.random() * 40 + 60 // 60-100 when enabled
          : 0,
        lastActivity: new Date()
      };

      entitiesStatus.push(status);

      // Accumulate system metrics
      totalTrades += 100; // Simulated
      totalProfitLoss += status.recentPerformance.profitLoss;
      totalConfidence += 0.75; // Simulated
      systemWinRate += status.recentPerformance.winRate;
    }

    systemWinRate /= this.entities.size;
    const averageConfidence = totalConfidence / this.entities.size;

    // Calculate overall health
    const healthFactors = entitiesStatus.map(status => {
      let health = 100;
      if (!status.isActive) health -= 30;
      if (status.activeAlerts > 0) health -= status.activeAlerts * 5;
      if (status.lossStreak && status.lossStreak.consecutiveLosses > 3) health -= 20;
      if (status.recentPerformance.profitLoss < 0) health -= 10;
      return Math.max(0, health);
    });

    const overallHealth = healthFactors.reduce((sum, h) => sum + h, 0) / healthFactors.length;

    // Generate recommendations
    const recommendations = this.generateSystemRecommendations(entitiesStatus, overallHealth);

    return {
      timestamp: new Date(),
      overallHealth,
      entitiesStatus,
      systemWideAlerts,
      performanceMetrics: {
        totalTrades,
        systemWinRate,
        totalProfitLoss,
        averageConfidence
      },
      recommendations
    };
  }

  private generateSystemRecommendations(statuses: EntityStatus[], health: number): string[] {
    const recommendations: string[] = [];

    if (health < 70) {
      recommendations.push('System health below 70% - implement emergency protocols');
    }

    const inactiveEntities = statuses.filter(s => !s.isActive);
    if (inactiveEntities.length > 0) {
      recommendations.push(`Reactivate ${inactiveEntities.length} inactive entities`);
    }

    const lossStreakEntities = statuses.filter(s => s.lossStreak && s.lossStreak.consecutiveLosses > 3);
    if (lossStreakEntities.length > 0) {
      recommendations.push(`Address loss streaks in ${lossStreakEntities.length} entities`);
    }

    const lowPerformanceEntities = statuses.filter(s => s.recentPerformance.profitLoss < -100);
    if (lowPerformanceEntities.length > 0) {
      recommendations.push(`Review strategies for ${lowPerformanceEntities.length} underperforming entities`);
    }

    if (recommendations.length === 0) {
      recommendations.push('System operating within normal parameters');
    }

    return recommendations;
  }

  public performCrossEntityAnalysis(): CrossEntityAnalysis {
    const entities = Array.from(this.entities.values());
    
    // Calculate correlations (simplified)
    const correlations: Record<string, Record<string, number>> = {};
    entities.forEach(entity1 => {
      correlations[entity1.id] = {};
      entities.forEach(entity2 => {
        if (entity1.id !== entity2.id) {
          // Simplified correlation calculation
          correlations[entity1.id][entity2.id] = Math.random() * 0.6 + 0.2; // 0.2 to 0.8
        }
      });
    });

    // Identify systemic risks
    const systemicRisks = [
      'High correlation between alpha and beta entities may increase systemic risk',
      'Multiple entities using similar models could amplify losses in certain market conditions',
      'Concentration in ETH trading across entities increases single-asset risk'
    ];

    // Identify opportunity alignments
    const opportunityAlignment = [
      'Gamma and Omega entities show complementary risk profiles for portfolio balance',
      'Delta entity energy distribution can optimize resource allocation across entities',
      'Spiritual guidance in Omega can provide early warning signals for all entities'
    ];

    // Resource optimization suggestions
    const resourceOptimization = [
      'Consolidate overlapping AI models to reduce computational overhead',
      'Share risk management insights across entities for improved efficiency',
      'Coordinate position sizing to optimize overall portfolio Kelly fraction'
    ];

    // Coordinated actions
    const coordinatedActions = [
      'Implement system-wide risk reduction when multiple entities show stress signals',
      'Coordinate entry timing when spiritual and technical signals align',
      'Share successful trading patterns across entities with similar market conditions'
    ];

    return {
      correlations,
      systemicRisks,
      opportunityAlignment,
      resourceOptimization,
      coordinatedActions
    };
  }

  private startCrossEntityMonitoring(): void {
    // Monitor cross-entity interactions every 5 minutes
    setInterval(() => {
      this.performCrossEntityHealthCheck();
    }, 5 * 60 * 1000);

    console.log('🔗 Cross-entity monitoring started - analyzing system interactions every 5 minutes');
  }

  private async performCrossEntityHealthCheck(): Promise<void> {
    // Check for systemic risks
    const activeStreaks = this.lossStreakTracker.getActiveStreaks();
    const systemicLosses = activeStreaks.length;

    if (systemicLosses >= 3) {
      console.warn(`🚨 Systemic risk detected: ${systemicLosses} entities in loss streaks`);
      // Would trigger system-wide risk reduction
    }

    // Check for opportunity coordination
    const highConfidenceEntities = Array.from(this.entities.values())
      .filter(entity => entity.status === 'active'); // Simplified check

    if (highConfidenceEntities.length >= 4) {
      console.log(`🎯 Opportunity alignment: ${highConfidenceEntities.length} entities showing high confidence`);
      // Would trigger coordinated position taking
    }
  }

  public getEntityConfiguration(entityId: string): EntityConfiguration | undefined {
    return this.entities.get(entityId);
  }

  public updateEntityConfiguration(
    entityId: string,
    updates: Partial<EntityConfiguration>
  ): boolean {
    const entity = this.entities.get(entityId);
    if (!entity) return false;

    Object.assign(entity, updates, { lastUpdated: new Date() });
    console.log(`🔗 Updated configuration for ${entity.name}`);
    
    return true;
  }

  public getIntegrationStatistics(): {
    totalEntities: number;
    activeEntities: number;
    totalSignalsProcessed: number;
    systemHealthScore: number;
    crossEntityCorrelation: number;
    lastSystemUpdate: Date;
  } {
    
    const totalEntities = this.entities.size;
    const activeEntities = Array.from(this.entities.values()).filter(e => e.status === 'active').length;
    
    return {
      totalEntities,
      activeEntities,
      totalSignalsProcessed: 0, // Would track in production
      systemHealthScore: 85, // Would calculate from actual data
      crossEntityCorrelation: 0.45, // Would calculate from actual correlations
      lastSystemUpdate: new Date()
    };
  }
}

// Export singleton instance
let entityIntegratorInstance: EntityIntegrator | null = null;

export function getEntityIntegrator(): EntityIntegrator {
  if (!entityIntegratorInstance) {
    entityIntegratorInstance = new EntityIntegrator();
  }
  return entityIntegratorInstance;
}