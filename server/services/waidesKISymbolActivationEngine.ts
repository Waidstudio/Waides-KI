import { WaidesKIKonsealSymbolTree, KonsealSymbol } from './waidesKIKonsealSymbolTree';
import { WaidesKITemporalFirewall } from './waidesKITemporalFirewall';

export interface ActivationContext {
  momentum: number;
  volatility: number;
  trend_strength: number;
  spiritual_energy: number;
  chaos_level: number;
  price_change_24h: number;
  volume_strength: number;
  market_phase: 'bullish' | 'bearish' | 'sideways' | 'volatile';
}

export interface InjectedSymbol {
  symbol: KonsealSymbol;
  injectionReason: string;
  injectionWeight: number;
  activatedAt: Date;
  context: ActivationContext;
}

export interface ActivationResult {
  injectedSymbols: InjectedSymbol[];
  blockedSymbols: Array<{
    symbol: KonsealSymbol;
    blockReason: string;
  }>;
  activationSummary: {
    totalEvaluated: number;
    totalInjected: number;
    totalBlocked: number;
    averageWeight: number;
    strongestSymbol?: KonsealSymbol;
  };
}

export class WaidesKISymbolActivationEngine {
  private konsealTree: WaidesKIKonsealSymbolTree;
  private temporalFirewall: WaidesKITemporalFirewall;
  private injectionHistory: InjectedSymbol[] = [];
  private activationCooldowns: Map<string, Date> = new Map();
  private maxHistorySize: number = 200;

  constructor(
    konsealTree: WaidesKIKonsealSymbolTree, 
    temporalFirewall: WaidesKITemporalFirewall
  ) {
    this.konsealTree = konsealTree;
    this.temporalFirewall = temporalFirewall;
  }

  /**
   * Main injection logic - inject symbols into trading context
   */
  injectIntoLogic(context: ActivationContext): ActivationResult {
    // Check temporal firewall
    if (!this.temporalFirewall.isActivationAllowed()) {
      return this.createEmptyResult('Temporal firewall blocked activation');
    }

    const activeSymbols = this.konsealTree.getActiveSymbols();
    const injectedSymbols: InjectedSymbol[] = [];
    const blockedSymbols: Array<{ symbol: KonsealSymbol; blockReason: string }> = [];

    // Evaluate each active symbol
    for (const symbol of activeSymbols) {
      const evaluation = this.evaluateSymbolForInjection(symbol, context);
      
      if (evaluation.shouldInject) {
        const injectedSymbol: InjectedSymbol = {
          symbol,
          injectionReason: evaluation.reason,
          injectionWeight: evaluation.weight,
          activatedAt: new Date(),
          context: { ...context }
        };

        injectedSymbols.push(injectedSymbol);
        this.konsealTree.activateSymbol(symbol.id);
        this.addToInjectionHistory(injectedSymbol);
        this.setCooldown(symbol.id);
      } else {
        blockedSymbols.push({
          symbol,
          blockReason: evaluation.reason
        });
      }
    }

    return this.createActivationResult(activeSymbols, injectedSymbols, blockedSymbols);
  }

  /**
   * Evaluate if symbol should be injected based on context
   */
  private evaluateSymbolForInjection(
    symbol: KonsealSymbol, 
    context: ActivationContext
  ): {
    shouldInject: boolean;
    reason: string;
    weight: number;
  } {
    // Check cooldown
    if (this.isOnCooldown(symbol.id)) {
      return {
        shouldInject: false,
        reason: 'Symbol on cooldown',
        weight: 0
      };
    }

    // Check symbol weight threshold
    if (symbol.weight < 0.3) {
      return {
        shouldInject: false,
        reason: 'Symbol weight too low',
        weight: 0
      };
    }

    // Vision-based evaluation
    const visionMatch = this.evaluateVisionMatch(symbol, context);
    if (!visionMatch.matches) {
      return {
        shouldInject: false,
        reason: visionMatch.reason,
        weight: 0
      };
    }

    // Calculate injection weight
    const injectionWeight = this.calculateInjectionWeight(symbol, context, visionMatch.strength);

    return {
      shouldInject: injectionWeight >= 0.5,
      reason: visionMatch.reason,
      weight: injectionWeight
    };
  }

  /**
   * Evaluate if symbol's vision matches current market context
   */
  private evaluateVisionMatch(
    symbol: KonsealSymbol, 
    context: ActivationContext
  ): {
    matches: boolean;
    reason: string;
    strength: number;
  } {
    const vision = symbol.metadata.vision;
    
    switch (vision) {
      case 'rise':
        if (context.momentum > 0.6 && context.trend_strength > 0.5) {
          return {
            matches: true,
            reason: 'Strong bullish momentum aligns with rise vision',
            strength: context.momentum * context.trend_strength
          };
        }
        return {
          matches: false,
          reason: 'Insufficient bullish momentum for rise vision',
          strength: 0
        };

      case 'fall':
        if (context.momentum < 0.4 && context.trend_strength > 0.5) {
          return {
            matches: true,
            reason: 'Strong bearish momentum aligns with fall vision',
            strength: (1 - context.momentum) * context.trend_strength
          };
        }
        return {
          matches: false,
          reason: 'Insufficient bearish momentum for fall vision',
          strength: 0
        };

      case 'volatile':
        if (context.volatility > 0.7 || context.chaos_level > 0.6) {
          return {
            matches: true,
            reason: 'High volatility/chaos aligns with volatile vision',
            strength: Math.max(context.volatility, context.chaos_level)
          };
        }
        return {
          matches: false,
          reason: 'Market too stable for volatile vision',
          strength: 0
        };

      case 'stable':
        if (context.volatility < 0.4 && context.chaos_level < 0.3) {
          return {
            matches: true,
            reason: 'Low volatility/chaos aligns with stable vision',
            strength: 1 - Math.max(context.volatility, context.chaos_level)
          };
        }
        return {
          matches: false,
          reason: 'Market too volatile for stable vision',
          strength: 0
        };

      case 'chaos':
        if (context.chaos_level > 0.8) {
          return {
            matches: true,
            reason: 'Extreme chaos aligns with chaos vision',
            strength: context.chaos_level
          };
        }
        return {
          matches: false,
          reason: 'Insufficient chaos for chaos vision',
          strength: 0
        };

      default:
        return {
          matches: false,
          reason: 'Unknown vision type',
          strength: 0
        };
    }
  }

  /**
   * Calculate injection weight based on multiple factors
   */
  private calculateInjectionWeight(
    symbol: KonsealSymbol,
    context: ActivationContext,
    visionStrength: number
  ): number {
    let weight = symbol.weight * 0.4; // Base symbol weight (40%)
    
    // Vision alignment strength (30%)
    weight += visionStrength * 0.3;
    
    // Spiritual energy bonus (15%)
    weight += context.spiritual_energy * 0.15;
    
    // Trend strength bonus (10%)
    weight += context.trend_strength * 0.1;
    
    // Symbol usage history penalty/bonus (5%)
    const usageBonus = this.calculateUsageBonus(symbol);
    weight += usageBonus * 0.05;

    return Math.min(Math.max(weight, 0), 1);
  }

  /**
   * Calculate usage bonus/penalty based on symbol history
   */
  private calculateUsageBonus(symbol: KonsealSymbol): number {
    const activationCount = symbol.metadata.activationCount;
    
    // Moderate usage is best
    if (activationCount >= 2 && activationCount <= 8) {
      return 0.5; // Bonus for proven symbols
    } else if (activationCount === 0) {
      return 0.2; // Small bonus for new symbols
    } else if (activationCount > 15) {
      return -0.3; // Penalty for overused symbols
    }
    
    return 0; // Neutral
  }

  /**
   * Check if symbol is on cooldown
   */
  private isOnCooldown(symbolId: string): boolean {
    const cooldownEnd = this.activationCooldowns.get(symbolId);
    if (!cooldownEnd) return false;
    
    return new Date() < cooldownEnd;
  }

  /**
   * Set cooldown for symbol
   */
  private setCooldown(symbolId: string, cooldownMinutes: number = 30): void {
    const cooldownEnd = new Date();
    cooldownEnd.setMinutes(cooldownEnd.getMinutes() + cooldownMinutes);
    this.activationCooldowns.set(symbolId, cooldownEnd);
  }

  /**
   * Add to injection history
   */
  private addToInjectionHistory(injectedSymbol: InjectedSymbol): void {
    this.injectionHistory.push(injectedSymbol);
    
    // Keep history manageable
    if (this.injectionHistory.length > this.maxHistorySize) {
      this.injectionHistory = this.injectionHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Create empty activation result
   */
  private createEmptyResult(reason: string): ActivationResult {
    return {
      injectedSymbols: [],
      blockedSymbols: [],
      activationSummary: {
        totalEvaluated: 0,
        totalInjected: 0,
        totalBlocked: 0,
        averageWeight: 0
      }
    };
  }

  /**
   * Create activation result from evaluation
   */
  private createActivationResult(
    evaluatedSymbols: KonsealSymbol[],
    injectedSymbols: InjectedSymbol[],
    blockedSymbols: Array<{ symbol: KonsealSymbol; blockReason: string }>
  ): ActivationResult {
    const averageWeight = injectedSymbols.length > 0 
      ? injectedSymbols.reduce((sum, s) => sum + s.injectionWeight, 0) / injectedSymbols.length
      : 0;

    const strongestSymbol = injectedSymbols.length > 0
      ? injectedSymbols.reduce((strongest, current) => 
          current.injectionWeight > strongest.injectionWeight ? current : strongest
        ).symbol
      : undefined;

    return {
      injectedSymbols,
      blockedSymbols,
      activationSummary: {
        totalEvaluated: evaluatedSymbols.length,
        totalInjected: injectedSymbols.length,
        totalBlocked: blockedSymbols.length,
        averageWeight,
        strongestSymbol
      }
    };
  }

  /**
   * Get injection history
   */
  getInjectionHistory(limit: number = 50): InjectedSymbol[] {
    return this.injectionHistory
      .slice(-limit)
      .sort((a, b) => b.activatedAt.getTime() - a.activatedAt.getTime());
  }

  /**
   * Get activation statistics
   */
  getActivationStats(): {
    totalInjections: number;
    averageWeight: number;
    visionDistribution: Record<string, number>;
    recentInjectionRate: number;
    cooldownCount: number;
  } {
    if (this.injectionHistory.length === 0) {
      return {
        totalInjections: 0,
        averageWeight: 0,
        visionDistribution: {},
        recentInjectionRate: 0,
        cooldownCount: this.activationCooldowns.size
      };
    }

    const visionCounts: Record<string, number> = {};
    let totalWeight = 0;

    this.injectionHistory.forEach(injection => {
      const vision = injection.symbol.metadata.vision || 'unknown';
      visionCounts[vision] = (visionCounts[vision] || 0) + 1;
      totalWeight += injection.injectionWeight;
    });

    // Calculate recent injection rate (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentInjections = this.injectionHistory.filter(
      injection => injection.activatedAt > oneHourAgo
    ).length;

    return {
      totalInjections: this.injectionHistory.length,
      averageWeight: totalWeight / this.injectionHistory.length,
      visionDistribution: visionCounts,
      recentInjectionRate: recentInjections,
      cooldownCount: this.activationCooldowns.size
    };
  }

  /**
   * Clear expired cooldowns
   */
  clearExpiredCooldowns(): number {
    const now = new Date();
    let clearedCount = 0;

    for (const [symbolId, cooldownEnd] of this.activationCooldowns.entries()) {
      if (now >= cooldownEnd) {
        this.activationCooldowns.delete(symbolId);
        clearedCount++;
      }
    }

    return clearedCount;
  }

  /**
   * Force activate symbol (bypass normal checks)
   */
  forceActivateSymbol(symbolId: string, context: ActivationContext): boolean {
    const symbol = this.konsealTree.getSymbolById(symbolId);
    if (!symbol) return false;

    const injectedSymbol: InjectedSymbol = {
      symbol,
      injectionReason: 'Force activation',
      injectionWeight: symbol.weight,
      activatedAt: new Date(),
      context: { ...context }
    };

    this.addToInjectionHistory(injectedSymbol);
    this.konsealTree.activateSymbol(symbol.id);
    
    return true;
  }

  /**
   * Get symbols by injection weight threshold
   */
  getSymbolsByInjectionThreshold(minWeight: number): KonsealSymbol[] {
    return this.konsealTree.getActiveSymbols().filter(symbol => {
      // Estimate injection weight based on symbol properties
      const estimatedWeight = symbol.weight * 0.6 + (symbol.metadata.confidence || 0.5) * 0.4;
      return estimatedWeight >= minWeight;
    });
  }
}