import { WaidesKIDreamInterpreter, MarketDreamState, DreamVision } from './waidesKIDreamInterpreter';
import { WaidesKIKonsealSymbolTree } from './waidesKIKonsealSymbolTree';
import { WaidesKITemporalFirewall } from './waidesKITemporalFirewall';
import { WaidesKISymbolActivationEngine, ActivationContext } from './waidesKISymbolActivationEngine';

export interface PreCognitiveVision {
  id: string;
  timestamp: Date;
  timeframe: '4h' | '1d' | '3d';
  direction: 'up' | 'down' | 'sideways' | 'volatile';
  confidence: number;
  priceTarget?: number;
  symbolsInvolved: string[];
  visionSource: 'dream' | 'temporal' | 'konseal' | 'hybrid';
  manifestationTime?: Date;
  accuracy?: number;
}

export interface SymbolLifecycle {
  symbolId: string;
  birthTime: Date;
  activationRules: string[];
  expiryTime: Date;
  sourceOrigin: string;
  spiritualWeight: number;
  currentPhase: 'dormant' | 'awakening' | 'active' | 'fading' | 'expired';
  performanceHistory: Array<{
    timestamp: Date;
    action: string;
    outcome: 'success' | 'failure' | 'neutral';
    contextSnapshot: ActivationContext;
  }>;
}

export interface DreamLayerState {
  dreamingActive: boolean;
  visionCount: number;
  symbolLifecycles: number;
  temporalAlignment: number;
  precognitiveAccuracy: number;
  lastDreamCycle: Date;
}

export class WaidesKIDreamLayerVision {
  private dreamInterpreter: WaidesKIDreamInterpreter;
  private konsealTree: WaidesKIKonsealSymbolTree;
  private temporalFirewall: WaidesKITemporalFirewall;
  private activationEngine: WaidesKISymbolActivationEngine;
  
  private precognitiveVisions: Map<string, PreCognitiveVision> = new Map();
  private symbolLifecycles: Map<string, SymbolLifecycle> = new Map();
  private dreamCycleActive: boolean = false;
  private lastDreamCycle: Date = new Date();
  private visionAccuracyHistory: Array<{ vision: PreCognitiveVision; actualOutcome: any }> = [];

  constructor() {
    this.konsealTree = new WaidesKIKonsealSymbolTree();
    this.temporalFirewall = new WaidesKITemporalFirewall();
    this.dreamInterpreter = new WaidesKIDreamInterpreter(this.konsealTree);
    this.activationEngine = new WaidesKISymbolActivationEngine(this.konsealTree, this.temporalFirewall);
    
    this.initializeDreamCycle();
  }

  /**
   * Initialize dream cycle with automatic processing
   */
  private initializeDreamCycle(): void {
    // Start dream processing every 15 minutes
    setInterval(() => {
      this.processDreamCycle();
    }, 15 * 60 * 1000);
    
    // Symbol lifecycle management every 5 minutes
    setInterval(() => {
      this.updateSymbolLifecycles();
    }, 5 * 60 * 1000);
    
    // Vision validation every hour
    setInterval(() => {
      this.validatePrecognitiveVisions();
    }, 60 * 60 * 1000);
  }

  /**
   * Main dream cycle processing
   */
  async processDreamCycle(): Promise<void> {
    if (!this.temporalFirewall.isActivationAllowed()) {
      return;
    }

    this.dreamCycleActive = true;
    this.lastDreamCycle = new Date();

    try {
      // Generate market dream state
      const marketState = await this.generateMarketDreamState();
      
      // Create dream vision
      const dreamVision = this.dreamInterpreter.generateDream(marketState);
      
      if (dreamVision) {
        // Convert dream to precognitive vision
        const precognitiveVision = this.convertDreamToPrecognitive(dreamVision, marketState);
        this.precognitiveVisions.set(precognitiveVision.id, precognitiveVision);
        
        // Create symbol lifecycle
        const lifecycle = this.createSymbolLifecycle(dreamVision.symbol, dreamVision);
        this.symbolLifecycles.set(dreamVision.symbol, lifecycle);
        
        // Inject symbols into trading logic
        const activationContext = this.convertMarketStateToActivation(marketState);
        await this.activationEngine.injectIntoLogic(activationContext);
      }
      
    } catch (error) {
      console.error('Dream cycle processing error:', error);
    } finally {
      this.dreamCycleActive = false;
    }
  }

  /**
   * Generate market dream state from current conditions
   */
  private async generateMarketDreamState(): Promise<MarketDreamState> {
    // This would integrate with live market data in production
    // For now, using realistic market simulation
    
    const momentum = Math.random() * 0.4 + 0.3; // 0.3-0.7
    const volatility = Math.random() * 0.6 + 0.2; // 0.2-0.8
    const trend_strength = Math.random() * 0.8 + 0.1; // 0.1-0.9
    const spiritual_energy = Math.random() * 0.7 + 0.15; // 0.15-0.85
    const chaos_level = Math.random() * 0.5 + 0.1; // 0.1-0.6

    return {
      momentum,
      volatility,
      trend_strength,
      spiritual_energy,
      chaos_level
    };
  }

  /**
   * Convert dream vision to precognitive vision
   */
  private convertDreamToPrecognitive(
    dreamVision: DreamVision, 
    marketState: MarketDreamState
  ): PreCognitiveVision {
    const direction = this.mapVisionToDirection(dreamVision.vision);
    const manifestationTime = this.calculateManifestationTime(dreamVision.timeframe);
    
    return {
      id: `PCV_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
      timeframe: dreamVision.timeframe,
      direction,
      confidence: dreamVision.confidence,
      symbolsInvolved: [dreamVision.symbol],
      visionSource: 'dream',
      manifestationTime
    };
  }

  /**
   * Map dream vision to market direction
   */
  private mapVisionToDirection(vision: DreamVision['vision']): PreCognitiveVision['direction'] {
    switch (vision) {
      case 'rise': return 'up';
      case 'fall': return 'down';
      case 'stable': return 'sideways';
      case 'volatile':
      case 'chaos': return 'volatile';
      default: return 'sideways';
    }
  }

  /**
   * Calculate when vision should manifest
   */
  private calculateManifestationTime(timeframe: DreamVision['timeframe']): Date {
    const now = new Date();
    const hours = timeframe === '4h' ? 4 : timeframe === '1d' ? 24 : 72;
    return new Date(now.getTime() + hours * 60 * 60 * 1000);
  }

  /**
   * Create symbol lifecycle tracking
   */
  private createSymbolLifecycle(symbol: string, dreamVision: DreamVision): SymbolLifecycle {
    const now = new Date();
    const expiryHours = dreamVision.timeframe === '4h' ? 6 : dreamVision.timeframe === '1d' ? 30 : 80;
    
    return {
      symbolId: symbol,
      birthTime: now,
      activationRules: [`vision:${dreamVision.vision}`, `timeframe:${dreamVision.timeframe}`],
      expiryTime: new Date(now.getTime() + expiryHours * 60 * 60 * 1000),
      sourceOrigin: dreamVision.source,
      spiritualWeight: dreamVision.weight,
      currentPhase: 'awakening',
      performanceHistory: []
    };
  }

  /**
   * Convert market state to activation context
   */
  private convertMarketStateToActivation(marketState: MarketDreamState): ActivationContext {
    return {
      momentum: marketState.momentum,
      volatility: marketState.volatility,
      trend_strength: marketState.trend_strength,
      spiritual_energy: marketState.spiritual_energy,
      chaos_level: marketState.chaos_level,
      price_change_24h: (marketState.momentum - 0.5) * 10, // Simulate price change
      volume_strength: marketState.trend_strength,
      market_phase: marketState.momentum > 0.6 ? 'bullish' : 
                   marketState.momentum < 0.4 ? 'bearish' : 'sideways'
    };
  }

  /**
   * Update symbol lifecycles
   */
  private updateSymbolLifecycles(): void {
    const now = new Date();
    
    for (const [symbolId, lifecycle] of this.symbolLifecycles.entries()) {
      // Update phase based on time and activity
      const ageHours = (now.getTime() - lifecycle.birthTime.getTime()) / (1000 * 60 * 60);
      const timeToExpiry = lifecycle.expiryTime.getTime() - now.getTime();
      
      if (timeToExpiry <= 0) {
        lifecycle.currentPhase = 'expired';
      } else if (timeToExpiry <= 60 * 60 * 1000) { // 1 hour to expiry
        lifecycle.currentPhase = 'fading';
      } else if (ageHours >= 2) {
        lifecycle.currentPhase = 'active';
      } else if (ageHours >= 0.5) {
        lifecycle.currentPhase = 'awakening';
      }
      
      // Clean up expired lifecycles
      if (lifecycle.currentPhase === 'expired' && timeToExpiry < -24 * 60 * 60 * 1000) {
        this.symbolLifecycles.delete(symbolId);
      }
    }
  }

  /**
   * Validate precognitive visions against actual outcomes
   */
  private validatePrecognitiveVisions(): void {
    const now = new Date();
    
    for (const [visionId, vision] of this.precognitiveVisions.entries()) {
      if (vision.manifestationTime && now >= vision.manifestationTime && !vision.accuracy) {
        // Simulate accuracy validation - in production this would use real market data
        const accuracy = Math.random() * 0.6 + 0.4; // 40%-100% accuracy
        vision.accuracy = accuracy;
        
        // Record in history
        this.visionAccuracyHistory.push({
          vision,
          actualOutcome: { accuracy, timestamp: now }
        });
        
        // Clean up old visions
        if (now.getTime() - vision.timestamp.getTime() > 7 * 24 * 60 * 60 * 1000) {
          this.precognitiveVisions.delete(visionId);
        }
      }
    }
  }

  /**
   * Get current dream layer state
   */
  getDreamLayerState(): DreamLayerState {
    const activeVisions = Array.from(this.precognitiveVisions.values())
      .filter(v => !v.accuracy);
    
    const activeLifecycles = Array.from(this.symbolLifecycles.values())
      .filter(l => l.currentPhase !== 'expired');
    
    const temporalContext = this.temporalFirewall.getCurrentTemporalContext();
    
    const accuracySum = this.visionAccuracyHistory
      .slice(-20)
      .reduce((sum, entry) => sum + (entry.actualOutcome.accuracy || 0), 0);
    const avgAccuracy = this.visionAccuracyHistory.length > 0 
      ? accuracySum / Math.min(this.visionAccuracyHistory.length, 20)
      : 0;

    return {
      dreamingActive: this.dreamCycleActive,
      visionCount: activeVisions.length,
      symbolLifecycles: activeLifecycles.length,
      temporalAlignment: temporalContext.energyLevel,
      precognitiveAccuracy: avgAccuracy,
      lastDreamCycle: this.lastDreamCycle
    };
  }

  /**
   * Get active precognitive visions
   */
  getActivePrecognitiveVisions(): PreCognitiveVision[] {
    return Array.from(this.precognitiveVisions.values())
      .filter(v => !v.accuracy)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get symbol lifecycles by phase
   */
  getSymbolLifecyclesByPhase(phase?: SymbolLifecycle['currentPhase']): SymbolLifecycle[] {
    const lifecycles = Array.from(this.symbolLifecycles.values());
    return phase ? lifecycles.filter(l => l.currentPhase === phase) : lifecycles;
  }

  /**
   * Get dream vision statistics
   */
  getDreamVisionStats(): {
    totalVisions: number;
    averageAccuracy: number;
    visionsByTimeframe: Record<string, number>;
    visionsByDirection: Record<string, number>;
    symbolLifecycleStats: Record<string, number>;
  } {
    const allVisions = Array.from(this.precognitiveVisions.values());
    const validatedVisions = allVisions.filter(v => v.accuracy !== undefined);
    
    const avgAccuracy = validatedVisions.length > 0
      ? validatedVisions.reduce((sum, v) => sum + (v.accuracy || 0), 0) / validatedVisions.length
      : 0;

    const timeframeCounts: Record<string, number> = {};
    const directionCounts: Record<string, number> = {};
    
    allVisions.forEach(vision => {
      timeframeCounts[vision.timeframe] = (timeframeCounts[vision.timeframe] || 0) + 1;
      directionCounts[vision.direction] = (directionCounts[vision.direction] || 0) + 1;
    });

    const phaseCounts: Record<string, number> = {};
    Array.from(this.symbolLifecycles.values()).forEach(lifecycle => {
      phaseCounts[lifecycle.currentPhase] = (phaseCounts[lifecycle.currentPhase] || 0) + 1;
    });

    return {
      totalVisions: allVisions.length,
      averageAccuracy: avgAccuracy,
      visionsByTimeframe: timeframeCounts,
      visionsByDirection: directionCounts,
      symbolLifecycleStats: phaseCounts
    };
  }

  /**
   * Force trigger dream cycle (for testing/manual activation)
   */
  async forceDreamCycle(): Promise<boolean> {
    try {
      await this.processDreamCycle();
      return true;
    } catch (error) {
      console.error('Force dream cycle error:', error);
      return false;
    }
  }

  /**
   * Get Konseal Symbol Tree (for external access)
   */
  getKonsealSymbolTree(): WaidesKIKonsealSymbolTree {
    return this.konsealTree;
  }

  /**
   * Get Temporal Firewall (for external access)
   */
  getTemporalFirewall(): WaidesKITemporalFirewall {
    return this.temporalFirewall;
  }

  /**
   * Get Symbol Activation Engine (for external access)
   */
  getSymbolActivationEngine(): WaidesKISymbolActivationEngine {
    return this.activationEngine;
  }

  /**
   * Get Dream Interpreter (for external access)
   */
  getDreamInterpreter(): WaidesKIDreamInterpreter {
    return this.dreamInterpreter;
  }
}