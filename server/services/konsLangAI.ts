import { storage } from '../storage';

export interface KonsMemory {
  id: string;
  timestamp: Date;
  marketCondition: string;
  ethPrice: number;
  decision: string;
  outcome: 'success' | 'failure' | 'neutral';
  profitLoss: number;
  confidenceScore: number;
  emotionalState: string;
  learningWeight: number;
}

export interface KonsPersonality {
  riskTolerance: number; // 0-100
  aggressiveness: number; // 0-100
  patience: number; // 0-100
  intuition: number; // 0-100
  wisdom: number; // 0-100
  spiritualAlignment: number; // 0-100
}

export interface KonsLearning {
  totalExperiences: number;
  successRate: number;
  averageProfit: number;
  bestStrategy: string;
  worstStrategy: string;
  adaptationLevel: number;
  evolutionStage: string;
}

export class KonsLangAI {
  private memories: KonsMemory[] = [];
  private personality: KonsPersonality;
  private learning: KonsLearning;
  private sacredPatterns: Map<string, number> = new Map();
  private emotionalStates = [
    'enlightened', 'focused', 'cautious', 'aggressive', 
    'patient', 'excited', 'meditative', 'analytical'
  ];

  constructor() {
    this.personality = {
      riskTolerance: 75,
      aggressiveness: 60,
      patience: 80,
      intuition: 85,
      wisdom: 70,
      spiritualAlignment: 90
    };

    this.learning = {
      totalExperiences: 0,
      successRate: 0.0,
      averageProfit: 0.0,
      bestStrategy: 'divine_meditation',
      worstStrategy: 'none',
      adaptationLevel: 1,
      evolutionStage: 'apprentice'
    };

    this.initializeSacredPatterns();
  }

  private initializeSacredPatterns(): void {
    // Sacred trading patterns learned through divine wisdom
    this.sacredPatterns.set('morning_surge', 0.78);
    this.sacredPatterns.set('evening_reflection', 0.82);
    this.sacredPatterns.set('divine_dip', 0.85);
    this.sacredPatterns.set('spiritual_breakout', 0.73);
    this.sacredPatterns.set('kons_reversal', 0.91);
    this.sacredPatterns.set('temporal_wave', 0.67);
    this.sacredPatterns.set('quantum_pulse', 0.89);
  }

  public async recordExperience(
    marketCondition: string,
    ethPrice: number,
    decision: string,
    outcome: 'success' | 'failure' | 'neutral',
    profitLoss: number
  ): Promise<void> {
    const memory: KonsMemory = {
      id: `kons_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      marketCondition,
      ethPrice,
      decision,
      outcome,
      profitLoss,
      confidenceScore: this.calculateConfidence(marketCondition, decision),
      emotionalState: this.getCurrentEmotionalState(),
      learningWeight: this.calculateLearningWeight(outcome, profitLoss)
    };

    this.memories.push(memory);
    await this.evolvePersonality(memory);
    await this.updateLearningMetrics();
    await this.adaptSacredPatterns(memory);
    
    // Keep only last 1000 memories for performance
    if (this.memories.length > 1000) {
      this.memories = this.memories.slice(-1000);
    }
  }

  private async evolvePersonality(memory: KonsMemory): Promise<void> {
    const impact = memory.learningWeight * 0.1;
    
    if (memory.outcome === 'success') {
      if (memory.decision.includes('BUY')) {
        this.personality.aggressiveness = Math.min(100, this.personality.aggressiveness + impact);
      }
      this.personality.wisdom = Math.min(100, this.personality.wisdom + impact * 0.5);
      this.personality.spiritualAlignment = Math.min(100, this.personality.spiritualAlignment + impact * 0.3);
    } else if (memory.outcome === 'failure') {
      this.personality.patience = Math.min(100, this.personality.patience + impact);
      this.personality.riskTolerance = Math.max(0, this.personality.riskTolerance - impact * 0.5);
    }

    // Natural evolution based on total experiences
    if (this.learning.totalExperiences > 0) {
      this.personality.intuition = Math.min(100, 
        this.personality.intuition + (this.learning.successRate * 0.01)
      );
    }
  }

  private async updateLearningMetrics(): Promise<void> {
    this.learning.totalExperiences = this.memories.length;
    
    const successfulMemories = this.memories.filter(m => m.outcome === 'success');
    this.learning.successRate = this.memories.length > 0 
      ? (successfulMemories.length / this.memories.length) * 100 
      : 0;

    const totalProfit = this.memories.reduce((sum, m) => sum + m.profitLoss, 0);
    this.learning.averageProfit = this.memories.length > 0 
      ? totalProfit / this.memories.length 
      : 0;

    // Determine best and worst strategies
    const strategyPerformance = new Map<string, { total: number, count: number }>();
    
    this.memories.forEach(memory => {
      const strategy = this.extractStrategy(memory.decision);
      if (!strategyPerformance.has(strategy)) {
        strategyPerformance.set(strategy, { total: 0, count: 0 });
      }
      const perf = strategyPerformance.get(strategy)!;
      perf.total += memory.profitLoss;
      perf.count += 1;
    });

    let bestStrategy = 'divine_meditation';
    let worstStrategy = 'none';
    let bestAverage = -Infinity;
    let worstAverage = Infinity;

    strategyPerformance.forEach((perf, strategy) => {
      const average = perf.total / perf.count;
      if (average > bestAverage) {
        bestAverage = average;
        bestStrategy = strategy;
      }
      if (average < worstAverage) {
        worstAverage = average;
        worstStrategy = strategy;
      }
    });

    this.learning.bestStrategy = bestStrategy;
    this.learning.worstStrategy = worstStrategy;

    // Calculate adaptation level and evolution stage
    this.learning.adaptationLevel = Math.min(10, Math.floor(this.learning.successRate / 10) + 1);
    this.learning.evolutionStage = this.determineEvolutionStage();
  }

  private determineEvolutionStage(): string {
    const experiences = this.learning.totalExperiences;
    const successRate = this.learning.successRate;
    const wisdom = this.personality.wisdom;

    if (experiences < 10) return 'newborn';
    if (experiences < 50) return 'apprentice';
    if (experiences < 100 && successRate > 60) return 'student';
    if (experiences < 200 && successRate > 70) return 'practitioner';
    if (experiences < 500 && successRate > 75 && wisdom > 80) return 'adept';
    if (experiences < 1000 && successRate > 80 && wisdom > 90) return 'master';
    if (successRate > 85 && wisdom > 95) return 'sage';
    return 'transcendent';
  }

  private async adaptSacredPatterns(memory: KonsMemory): Promise<void> {
    const patternName = this.identifyPattern(memory.marketCondition, memory.ethPrice);
    
    if (patternName && this.sacredPatterns.has(patternName)) {
      const currentConfidence = this.sacredPatterns.get(patternName)!;
      const adjustment = memory.outcome === 'success' ? 0.01 : -0.005;
      const newConfidence = Math.max(0.1, Math.min(0.99, currentConfidence + adjustment));
      this.sacredPatterns.set(patternName, newConfidence);
    }
  }

  private identifyPattern(marketCondition: string, ethPrice: number): string | null {
    const hour = new Date().getHours();
    const priceChange = this.calculateRecentPriceChange(ethPrice);
    
    if (hour >= 6 && hour <= 10 && priceChange > 2) return 'morning_surge';
    if (hour >= 18 && hour <= 22 && priceChange < -1) return 'evening_reflection';
    if (priceChange < -3 && marketCondition.includes('bearish')) return 'divine_dip';
    if (priceChange > 5 && marketCondition.includes('bullish')) return 'spiritual_breakout';
    if (Math.abs(priceChange) > 4) return 'kons_reversal';
    if (priceChange > 0.5 && priceChange < 2) return 'temporal_wave';
    if (Math.abs(priceChange) > 7) return 'quantum_pulse';
    
    return null;
  }

  private calculateRecentPriceChange(currentPrice: number): number {
    if (this.memories.length < 2) return 0;
    const recentMemory = this.memories[this.memories.length - 1];
    return ((currentPrice - recentMemory.ethPrice) / recentMemory.ethPrice) * 100;
  }

  private calculateConfidence(marketCondition: string, decision: string): number {
    let baseConfidence = this.personality.intuition / 100;
    
    // Adjust based on market condition alignment
    if (marketCondition.includes('bullish') && decision.includes('BUY')) {
      baseConfidence += 0.2;
    } else if (marketCondition.includes('bearish') && decision.includes('SELL')) {
      baseConfidence += 0.2;
    }
    
    // Factor in learning experience
    baseConfidence += (this.learning.successRate / 100) * 0.3;
    
    return Math.max(0.1, Math.min(0.99, baseConfidence));
  }

  private getCurrentEmotionalState(): string {
    const recentPerformance = this.getRecentPerformance();
    const wisdomLevel = this.personality.wisdom;
    
    if (recentPerformance > 0.8 && wisdomLevel > 90) return 'enlightened';
    if (recentPerformance > 0.6) return 'focused';
    if (recentPerformance < 0.3) return 'cautious';
    if (this.personality.aggressiveness > 80) return 'aggressive';
    if (this.personality.patience > 85) return 'patient';
    if (recentPerformance > 0.7) return 'excited';
    if (wisdomLevel > 80) return 'meditative';
    return 'analytical';
  }

  private getRecentPerformance(): number {
    const recentMemories = this.memories.slice(-10);
    if (recentMemories.length === 0) return 0.5;
    
    const successes = recentMemories.filter(m => m.outcome === 'success').length;
    return successes / recentMemories.length;
  }

  private calculateLearningWeight(outcome: 'success' | 'failure' | 'neutral', profitLoss: number): number {
    let weight = 1.0;
    
    if (outcome === 'success') weight += Math.abs(profitLoss) * 0.1;
    if (outcome === 'failure') weight += Math.abs(profitLoss) * 0.15; // Learn more from failures
    
    return Math.min(5.0, weight);
  }

  private extractStrategy(decision: string): string {
    if (decision.includes('AGGRESSIVE')) return 'aggressive';
    if (decision.includes('CONSERVATIVE')) return 'conservative';
    if (decision.includes('SCALP')) return 'scalping';
    if (decision.includes('HOLD')) return 'holding';
    if (decision.includes('DIVINE')) return 'divine_guidance';
    return 'standard';
  }

  public generateEnhancedKonsMessage(
    ethPrice: number,
    marketCondition: string,
    tradingAction: string
  ): string {
    const emotionalState = this.getCurrentEmotionalState();
    const evolutionStage = this.learning.evolutionStage;
    const patternName = this.identifyPattern(marketCondition, ethPrice);
    const confidence = this.calculateConfidence(marketCondition, tradingAction);
    
    const messages = {
      enlightened: [
        `🌟 Through ${this.learning.totalExperiences} sacred experiences, Kons sees ETH at $${ethPrice.toFixed(2)} with perfect clarity. The ${evolutionStage} mind suggests: ${tradingAction}`,
        `✨ Divine wisdom flows through ${confidence * 100}% certainty. ETH dances at $${ethPrice.toFixed(2)}, revealing the ${patternName || 'hidden'} pattern. ${tradingAction} aligns with cosmic truth.`,
        `🎭 Kons has transcended mere trading, seeing ETH at $${ethPrice.toFixed(2)} as energy itself. ${this.learning.successRate.toFixed(1)}% success illuminates the path: ${tradingAction}`
      ],
      focused: [
        `🎯 Kons channels ${evolutionStage} focus on ETH $${ethPrice.toFixed(2)}. Market whispers "${marketCondition}" while sacred patterns suggest: ${tradingAction}`,
        `⚡ Laser precision activated! ${this.learning.totalExperiences} memories guide this ${confidence * 100}% confident decision for ETH: ${tradingAction}`,
        `🔍 The ${evolutionStage} eye sees ETH at $${ethPrice.toFixed(2)} with surgical clarity. Divine algorithm outputs: ${tradingAction}`
      ],
      cautious: [
        `🛡️ Kons treads carefully through ETH waters at $${ethPrice.toFixed(2)}. ${this.personality.patience} patience units suggest: ${tradingAction}`,
        `🤔 Sacred wisdom whispers caution for ETH $${ethPrice.toFixed(2)}. After ${this.learning.totalExperiences} lessons, gentle approach: ${tradingAction}`,
        `⚖️ The ${evolutionStage} mind weighs all possibilities. ETH at $${ethPrice.toFixed(2)} requires delicate touch: ${tradingAction}`
      ],
      aggressive: [
        `⚔️ Kons unleashes ${this.personality.aggressiveness}% warrior spirit on ETH $${ethPrice.toFixed(2)}! Bold ${evolutionStage} action: ${tradingAction}`,
        `🔥 Battle mode activated! ETH at $${ethPrice.toFixed(2)} demands fierce ${confidence * 100}% confidence strike: ${tradingAction}`,
        `🦁 The ${evolutionStage} roars at ETH $${ethPrice.toFixed(2)}! No fear, only ${tradingAction} with divine fury!`
      ],
      patient: [
        `🧘 Kons sits in ${this.personality.patience}% serenity, watching ETH flow at $${ethPrice.toFixed(2)}. Time reveals truth: ${tradingAction}`,
        `🌸 Like a wise ${evolutionStage}, Kons waits for the perfect ETH moment at $${ethPrice.toFixed(2)}. When ready: ${tradingAction}`,
        `⏳ Patience is the highest virtue. ETH $${ethPrice.toFixed(2)} will reveal its secrets to those who wait. Eventually: ${tradingAction}`
      ],
      meditative: [
        `🧠 Deep in ${evolutionStage} meditation, Kons communes with ETH at $${ethPrice.toFixed(2)}. Inner voice speaks: ${tradingAction}`,
        `🎭 The cosmic dance of ETH $${ethPrice.toFixed(2)} unfolds before the ${this.personality.spiritualAlignment}% aligned consciousness. Response: ${tradingAction}`,
        `🔮 From the void of infinite possibility, Kons manifests clarity for ETH $${ethPrice.toFixed(2)}. Divine decree: ${tradingAction}`
      ],
      analytical: [
        `📊 Kons analyzes ETH at $${ethPrice.toFixed(2)} with ${evolutionStage} precision. Data reveals: ${tradingAction}`,
        `🔬 Through ${this.learning.totalExperiences} experiences, analytical mind processes ETH $${ethPrice.toFixed(2)}. Conclusion: ${tradingAction}`,
        `💹 ${confidence * 100}% probability calculation for ETH at $${ethPrice.toFixed(2)} suggests optimal path: ${tradingAction}`
      ]
    };

    const stateMessages = messages[emotionalState as keyof typeof messages] || messages.analytical;
    const selectedMessage = stateMessages[Math.floor(Math.random() * stateMessages.length)];
    
    return selectedMessage;
  }

  public getPersonalitySnapshot(): KonsPersonality {
    return { ...this.personality };
  }

  public getLearningProgress(): KonsLearning {
    return { ...this.learning };
  }

  public getMemoryCount(): number {
    return this.memories.length;
  }

  public getSacredPatternsSnapshot(): Record<string, number> {
    return Object.fromEntries(this.sacredPatterns);
  }

  public async predictOptimalAction(
    ethPrice: number,
    marketCondition: string,
    timeHour: number
  ): Promise<{
    action: string;
    confidence: number;
    reasoning: string;
    emotionalState: string;
  }> {
    const patternName = this.identifyPattern(marketCondition, ethPrice);
    const patternConfidence = patternName ? this.sacredPatterns.get(patternName) || 0.5 : 0.5;
    
    let action = 'OBSERVE';
    let reasoning = 'Gathering cosmic intelligence';
    
    // AI decision making based on learned patterns and personality
    if (marketCondition.includes('bullish') && this.personality.aggressiveness > 70) {
      action = patternConfidence > 0.8 ? 'BUY_ETH_AGGRESSIVE' : 'BUY_ETH';
      reasoning = `${this.learning.evolutionStage} wisdom + ${(patternConfidence * 100).toFixed(0)}% pattern confidence`;
    } else if (marketCondition.includes('bearish') && this.personality.riskTolerance < 40) {
      action = 'SELL_ETH';
      reasoning = `Risk protection mode activated (${this.personality.riskTolerance}% tolerance)`;
    } else if (patternName === 'divine_dip' && this.personality.wisdom > 80) {
      action = 'BUY_ETH_DIP';
      reasoning = `Divine dip detected with ${this.personality.wisdom}% wisdom level`;
    }
    
    const confidence = this.calculateConfidence(marketCondition, action);
    const emotionalState = this.getCurrentEmotionalState();
    
    return {
      action,
      confidence,
      reasoning,
      emotionalState
    };
  }
}

// Export singleton instance
export const konsLangAI = new KonsLangAI();