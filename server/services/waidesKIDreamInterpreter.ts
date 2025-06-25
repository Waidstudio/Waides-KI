import { WaidesKIKonsealSymbolTree } from './waidesKIKonsealSymbolTree';

export interface DreamVision {
  symbol: string;
  vision: 'rise' | 'fall' | 'volatile' | 'stable' | 'chaos';
  confidence: number;
  timeframe: '4h' | '1d' | '3d';
  source: 'dream' | 'subconscious' | 'vision' | 'prophecy';
  weight: number;
}

export interface MarketDreamState {
  momentum: number;
  volatility: number;
  trend_strength: number;
  spiritual_energy: number;
  chaos_level: number;
}

export class WaidesKIDreamInterpreter {
  private konsealTree: WaidesKIKonsealSymbolTree;
  private dreamHistory: DreamVision[] = [];
  private lastDreamTime: Date = new Date(0);
  private dreamCooldown: number = 15 * 60 * 1000; // 15 minutes

  constructor(konsealTree: WaidesKIKonsealSymbolTree) {
    this.konsealTree = konsealTree;
  }

  /**
   * Generate dream vision based on market state
   */
  generateDream(marketState: MarketDreamState): DreamVision | null {
    const now = new Date();
    if (now.getTime() - this.lastDreamTime.getTime() < this.dreamCooldown) {
      return null;
    }

    // Dream logic based on market conditions
    const vision = this.interpretMarketDream(marketState);
    const symbol = this.generateKonsealSymbol(vision);
    const timeframe = this.selectTimeframe(marketState);
    const weight = this.calculateSpiritualWeight(vision, marketState);

    const dreamVision: DreamVision = {
      symbol,
      vision,
      confidence: this.calculateConfidence(marketState),
      timeframe,
      source: this.selectSource(marketState),
      weight
    };

    // Store in Konseal Symbol Tree
    const tag = `vision:${vision}:${timeframe}`;
    const expiryHours = timeframe === '4h' ? 4 : timeframe === '1d' ? 24 : 72;
    
    this.konsealTree.addSymbol(
      symbol,
      'DreamLayer',
      tag,
      expiryHours,
      weight
    );

    this.dreamHistory.push(dreamVision);
    this.lastDreamTime = now;

    // Keep only last 50 dreams
    if (this.dreamHistory.length > 50) {
      this.dreamHistory = this.dreamHistory.slice(-50);
    }

    return dreamVision;
  }

  /**
   * Interpret market conditions into dream vision
   */
  private interpretMarketDream(marketState: MarketDreamState): DreamVision['vision'] {
    const { momentum, volatility, trend_strength, spiritual_energy, chaos_level } = marketState;

    // High chaos = volatile vision
    if (chaos_level > 0.8) {
      return 'chaos';
    }

    // Strong momentum up = rise vision
    if (momentum > 0.7 && trend_strength > 0.6) {
      return 'rise';
    }

    // Strong momentum down = fall vision
    if (momentum < 0.3 && trend_strength > 0.6) {
      return 'fall';
    }

    // High volatility = volatile vision
    if (volatility > 0.8) {
      return 'volatile';
    }

    // Low energy = stable vision
    if (spiritual_energy < 0.3 && volatility < 0.4) {
      return 'stable';
    }

    // Default based on momentum
    return momentum > 0.5 ? 'rise' : 'fall';
  }

  /**
   * Generate sacred Konseal symbol
   */
  private generateKonsealSymbol(vision: DreamVision['vision']): string {
    const visionPrefixes = {
      rise: ['KAL', 'ZEN', 'LUM'],
      fall: ['NAX', 'VOR', 'SHD'],
      volatile: ['CHO', 'FLX', 'WVE'],
      stable: ['GRD', 'ROK', 'STL'],
      chaos: ['ERR', 'VID', 'CHA']
    };

    const konslangChars = 'KDNALXMEIJORVWSTHBFGPQYZ';
    const prefix = visionPrefixes[vision][Math.floor(Math.random() * visionPrefixes[vision].length)];
    
    let suffix = '';
    for (let i = 0; i < 3; i++) {
      suffix += konslangChars[Math.floor(Math.random() * konslangChars.length)];
    }

    return `${prefix}${suffix}`;
  }

  /**
   * Select timeframe based on market conditions
   */
  private selectTimeframe(marketState: MarketDreamState): DreamVision['timeframe'] {
    if (marketState.volatility > 0.8) return '4h';
    if (marketState.trend_strength > 0.7) return '1d';
    return Math.random() > 0.6 ? '3d' : '1d';
  }

  /**
   * Calculate spiritual weight of vision
   */
  private calculateSpiritualWeight(vision: DreamVision['vision'], marketState: MarketDreamState): number {
    let weight = 0.5;

    // Vision-specific weights
    const visionWeights = {
      rise: 0.7,
      fall: 0.6,
      volatile: 0.8,
      stable: 0.4,
      chaos: 0.9
    };

    weight = visionWeights[vision];

    // Adjust based on spiritual energy
    weight += marketState.spiritual_energy * 0.3;

    // Adjust based on trend strength
    weight += marketState.trend_strength * 0.2;

    return Math.min(Math.max(weight, 0.1), 1.0);
  }

  /**
   * Calculate confidence in dream vision
   */
  private calculateConfidence(marketState: MarketDreamState): number {
    let confidence = 0.5;

    // Higher confidence with stronger signals
    confidence += marketState.trend_strength * 0.3;
    confidence += marketState.spiritual_energy * 0.2;
    
    // Lower confidence with high chaos
    confidence -= marketState.chaos_level * 0.2;

    return Math.min(Math.max(confidence, 0.1), 1.0);
  }

  /**
   * Select dream source based on market conditions
   */
  private selectSource(marketState: MarketDreamState): DreamVision['source'] {
    if (marketState.spiritual_energy > 0.8) return 'prophecy';
    if (marketState.chaos_level > 0.7) return 'vision';
    if (marketState.momentum > 0.7) return 'subconscious';
    return 'dream';
  }

  /**
   * Get recent dream history
   */
  getDreamHistory(limit: number = 20): DreamVision[] {
    return this.dreamHistory.slice(-limit);
  }

  /**
   * Get dream statistics
   */
  getDreamStats(): {
    totalDreams: number;
    averageConfidence: number;
    visionDistribution: Record<string, number>;
    averageWeight: number;
  } {
    if (this.dreamHistory.length === 0) {
      return {
        totalDreams: 0,
        averageConfidence: 0,
        visionDistribution: {},
        averageWeight: 0
      };
    }

    const visionCounts: Record<string, number> = {};
    let totalConfidence = 0;
    let totalWeight = 0;

    this.dreamHistory.forEach(dream => {
      visionCounts[dream.vision] = (visionCounts[dream.vision] || 0) + 1;
      totalConfidence += dream.confidence;
      totalWeight += dream.weight;
    });

    return {
      totalDreams: this.dreamHistory.length,
      averageConfidence: totalConfidence / this.dreamHistory.length,
      visionDistribution: visionCounts,
      averageWeight: totalWeight / this.dreamHistory.length
    };
  }

  /**
   * Check if ready to dream again
   */
  canDream(): boolean {
    const now = new Date();
    return now.getTime() - this.lastDreamTime.getTime() >= this.dreamCooldown;
  }
}