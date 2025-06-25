import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKIRiskManager } from './waidesKIRiskManager';

interface TradeRecord {
  timestamp: number;
  result: 'WIN' | 'LOSS' | 'NEUTRAL';
  profit_loss: number;
  confidence: number;
  market_conditions: any;
  emotional_state: string;
  strategy_type: string;
}

interface EmotionalPattern {
  pattern_name: string;
  detection_threshold: number;
  cooldown_minutes: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  prevention_message: string;
}

interface EmotionalBlock {
  block_id: string;
  timestamp: number;
  pattern_triggered: string;
  block_reason: string;
  cooldown_until: number;
  severity: string;
  trades_blocked: number;
  is_active: boolean;
}

interface ReflectionEntry {
  reflection_id: string;
  timestamp: number;
  trade_result: 'WIN' | 'LOSS' | 'NEUTRAL';
  market_indicators: any;
  emotional_analysis: {
    detected_emotion: string;
    confidence_level: number;
    bias_indicators: string[];
    decision_quality: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'EMOTIONAL';
  };
  self_coaching_notes: string[];
  lesson_learned: string;
  improvement_suggestions: string[];
  psychological_insights: string[];
}

export class WaidesKIEmotionalFirewall {
  private recentTrades: TradeRecord[] = [];
  private emotionalBlocks: EmotionalBlock[] = [];
  private reflectionEntries: ReflectionEntry[] = [];
  private emotionalPatterns: EmotionalPattern[];
  private isFirewallActive: boolean = true;
  private maxTradeHistory: number = 100;

  constructor() {
    this.initializeEmotionalPatterns();
    this.startMaintenanceCycle();
  }

  private initializeEmotionalPatterns(): void {
    this.emotionalPatterns = [
      {
        pattern_name: 'REVENGE_TRADING',
        detection_threshold: 3, // 3 losses in succession
        cooldown_minutes: 15,
        severity: 'HIGH',
        description: 'Multiple consecutive losses detected - high risk of revenge trading',
        prevention_message: 'Taking a break to prevent emotional revenge trading'
      },
      {
        pattern_name: 'OVERCONFIDENCE_SPIKE',
        detection_threshold: 5, // 5 wins in succession
        cooldown_minutes: 10,
        severity: 'MEDIUM',
        description: 'Consecutive wins detected - risk of overconfidence and larger position sizing',
        prevention_message: 'Cooling down to maintain discipline after winning streak'
      },
      {
        pattern_name: 'RAPID_FIRE_TRADING',
        detection_threshold: 4, // 4 trades in 5 minutes
        cooldown_minutes: 20,
        severity: 'HIGH',
        description: 'Excessive trading frequency detected - emotional decision making likely',
        prevention_message: 'Rapid trading detected - enforcing cooling period for clarity'
      },
      {
        pattern_name: 'DRAWDOWN_PANIC',
        detection_threshold: 2, // 2% portfolio drawdown
        cooldown_minutes: 30,
        severity: 'CRITICAL',
        description: 'Significant drawdown detected - risk of panic decisions',
        prevention_message: 'Portfolio protection mode activated due to drawdown'
      },
      {
        pattern_name: 'FOMO_PATTERN',
        detection_threshold: 3, // 3 trades above normal confidence threshold
        cooldown_minutes: 12,
        severity: 'MEDIUM',
        description: 'FOMO trading pattern detected - entering trades with unusually high confidence',
        prevention_message: 'FOMO prevention - taking time to reassess market objectively'
      },
      {
        pattern_name: 'LATE_NIGHT_TRADING',
        detection_threshold: 1, // After 10 PM or before 6 AM
        cooldown_minutes: 480, // 8 hours
        severity: 'MEDIUM',
        description: 'Trading outside optimal hours - decision quality may be compromised',
        prevention_message: 'Late night trading blocked - wait for optimal decision hours'
      }
    ];
  }

  private startMaintenanceCycle(): void {
    // Clean old data every hour
    setInterval(() => {
      this.cleanOldData();
      this.updateEmotionalBlocks();
    }, 60 * 60 * 1000);
  }

  // CORE FIREWALL FUNCTIONS
  recordTrade(
    result: 'WIN' | 'LOSS' | 'NEUTRAL',
    profitLoss: number,
    confidence: number,
    marketConditions: any,
    strategyType: string = 'UNKNOWN'
  ): void {
    const emotionalState = this.detectCurrentEmotionalState(result, profitLoss);
    
    const tradeRecord: TradeRecord = {
      timestamp: Date.now(),
      result,
      profit_loss: profitLoss,
      confidence,
      market_conditions: marketConditions,
      emotional_state: emotionalState,
      strategy_type: strategyType
    };
    
    this.recentTrades.push(tradeRecord);
    
    // Maintain trade history size
    if (this.recentTrades.length > this.maxTradeHistory) {
      this.recentTrades = this.recentTrades.slice(-this.maxTradeHistory);
    }
    
    // Generate reflection
    this.generateReflection(tradeRecord);
    
    // Log significant emotional states
    if (['STRESSED', 'OVERCONFIDENT', 'PANICKED'].includes(emotionalState)) {
      waidesKIDailyReporter.logEmotionalState(
        emotionalState as any,
        `Trade ${result} detected emotional state: ${emotionalState}`,
        'Emotional Firewall',
        result === 'LOSS' ? 30 : 85
      );
    }
  }

  shouldBlockTrade(
    confidence: number,
    marketConditions: any,
    strategyType: string = 'UNKNOWN'
  ): { shouldBlock: boolean; reason: string; blockType?: string; severity?: string } {
    if (!this.isFirewallActive) {
      return { shouldBlock: false, reason: 'Firewall disabled' };
    }

    // Check active blocks
    const activeBlock = this.getActiveBlock();
    if (activeBlock) {
      const timeRemaining = Math.ceil((activeBlock.cooldown_until - Date.now()) / 60000);
      return {
        shouldBlock: true,
        reason: `${activeBlock.block_reason} (${timeRemaining} minutes remaining)`,
        blockType: activeBlock.pattern_triggered,
        severity: activeBlock.severity
      };
    }

    // Check for emotional patterns
    const patternViolation = this.detectEmotionalPatterns(confidence, marketConditions, strategyType);
    if (patternViolation) {
      this.activateEmotionalBlock(patternViolation);
      return {
        shouldBlock: true,
        reason: patternViolation.prevention_message,
        blockType: patternViolation.pattern_name,
        severity: patternViolation.severity
      };
    }

    return { shouldBlock: false, reason: 'Safe to trade' };
  }

  private detectEmotionalPatterns(
    confidence: number,
    marketConditions: any,
    strategyType: string
  ): EmotionalPattern | null {
    const now = Date.now();
    const recentTrades = this.recentTrades.filter(trade => now - trade.timestamp < 30 * 60 * 1000); // Last 30 minutes

    // Check revenge trading pattern
    const recentLosses = recentTrades.filter(trade => trade.result === 'LOSS');
    const consecutiveLosses = this.getConsecutiveLosses();
    if (consecutiveLosses >= this.emotionalPatterns.find(p => p.pattern_name === 'REVENGE_TRADING')!.detection_threshold) {
      return this.emotionalPatterns.find(p => p.pattern_name === 'REVENGE_TRADING')!;
    }

    // Check overconfidence pattern
    const consecutiveWins = this.getConsecutiveWins();
    if (consecutiveWins >= this.emotionalPatterns.find(p => p.pattern_name === 'OVERCONFIDENCE_SPIKE')!.detection_threshold) {
      return this.emotionalPatterns.find(p => p.pattern_name === 'OVERCONFIDENCE_SPIKE')!;
    }

    // Check rapid fire trading
    const tradesLast5Min = recentTrades.filter(trade => now - trade.timestamp < 5 * 60 * 1000);
    if (tradesLast5Min.length >= this.emotionalPatterns.find(p => p.pattern_name === 'RAPID_FIRE_TRADING')!.detection_threshold) {
      return this.emotionalPatterns.find(p => p.pattern_name === 'RAPID_FIRE_TRADING')!;
    }

    // Check drawdown panic
    const portfolioDrawdown = this.calculateCurrentDrawdown();
    if (portfolioDrawdown >= 2.0) { // 2% drawdown
      return this.emotionalPatterns.find(p => p.pattern_name === 'DRAWDOWN_PANIC')!;
    }

    // Check FOMO pattern
    if (confidence > 90) { // Unusually high confidence
      const highConfidenceTrades = recentTrades.filter(trade => trade.confidence > 85);
      if (highConfidenceTrades.length >= this.emotionalPatterns.find(p => p.pattern_name === 'FOMO_PATTERN')!.detection_threshold) {
        return this.emotionalPatterns.find(p => p.pattern_name === 'FOMO_PATTERN')!;
      }
    }

    // Check late night trading
    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour <= 6) { // 10 PM to 6 AM
      return this.emotionalPatterns.find(p => p.pattern_name === 'LATE_NIGHT_TRADING')!;
    }

    return null;
  }

  private getConsecutiveLosses(): number {
    let count = 0;
    for (let i = this.recentTrades.length - 1; i >= 0; i--) {
      if (this.recentTrades[i].result === 'LOSS') {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  private getConsecutiveWins(): number {
    let count = 0;
    for (let i = this.recentTrades.length - 1; i >= 0; i--) {
      if (this.recentTrades[i].result === 'WIN') {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  private calculateCurrentDrawdown(): number {
    if (this.recentTrades.length === 0) return 0;
    
    let runningPnL = 0;
    let peak = 0;
    let maxDrawdown = 0;
    
    for (const trade of this.recentTrades) {
      runningPnL += trade.profit_loss;
      if (runningPnL > peak) peak = runningPnL;
      const drawdown = ((peak - runningPnL) / Math.abs(peak)) * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }
    
    return maxDrawdown;
  }

  private detectCurrentEmotionalState(result: 'WIN' | 'LOSS' | 'NEUTRAL', profitLoss: number): string {
    const recentResults = this.recentTrades.slice(-5).map(t => t.result);
    const consecutiveLosses = this.getConsecutiveLosses();
    const consecutiveWins = this.getConsecutiveWins();
    
    if (consecutiveLosses >= 3) return 'STRESSED';
    if (consecutiveLosses >= 2 && profitLoss < -2) return 'PANICKED';
    if (consecutiveWins >= 4) return 'OVERCONFIDENT';
    if (consecutiveWins >= 2 && profitLoss > 3) return 'EUPHORIC';
    if (result === 'LOSS' && profitLoss < -1) return 'DISAPPOINTED';
    if (result === 'WIN' && profitLoss > 2) return 'SATISFIED';
    
    return 'NEUTRAL';
  }

  private activateEmotionalBlock(pattern: EmotionalPattern): void {
    const blockId = this.generateBlockId();
    const cooldownUntil = Date.now() + (pattern.cooldown_minutes * 60 * 1000);
    
    const block: EmotionalBlock = {
      block_id: blockId,
      timestamp: Date.now(),
      pattern_triggered: pattern.pattern_name,
      block_reason: pattern.prevention_message,
      cooldown_until: cooldownUntil,
      severity: pattern.severity,
      trades_blocked: 0,
      is_active: true
    };
    
    this.emotionalBlocks.push(block);
    
    waidesKIDailyReporter.recordLesson(
      `Emotional firewall activated: ${pattern.pattern_name} (${pattern.cooldown_minutes} min cooldown)`,
      'EMOTIONAL',
      pattern.severity as any,
      'Emotional Firewall'
    );
  }

  private getActiveBlock(): EmotionalBlock | null {
    const now = Date.now();
    const activeBlock = this.emotionalBlocks.find(block => 
      block.is_active && block.cooldown_until > now
    );
    
    if (activeBlock) {
      activeBlock.trades_blocked++;
    }
    
    return activeBlock || null;
  }

  private updateEmotionalBlocks(): void {
    const now = Date.now();
    this.emotionalBlocks.forEach(block => {
      if (block.cooldown_until <= now) {
        block.is_active = false;
      }
    });
  }

  // THOUGHT CLEANSER AND REFLECTION
  private generateReflection(tradeRecord: TradeRecord): void {
    const reflectionId = this.generateReflectionId();
    const marketIndicators = tradeRecord.market_conditions;
    
    const emotionalAnalysis = this.analyzeEmotionalFactors(tradeRecord);
    const selfCoachingNotes = this.generateSelfCoaching(tradeRecord, emotionalAnalysis);
    const lessonLearned = this.extractLesson(tradeRecord, marketIndicators);
    const improvementSuggestions = this.generateImprovementSuggestions(tradeRecord);
    const psychologicalInsights = this.generatePsychologicalInsights(tradeRecord);
    
    const reflection: ReflectionEntry = {
      reflection_id: reflectionId,
      timestamp: Date.now(),
      trade_result: tradeRecord.result,
      market_indicators: marketIndicators,
      emotional_analysis: emotionalAnalysis,
      self_coaching_notes: selfCoachingNotes,
      lesson_learned: lessonLearned,
      improvement_suggestions: improvementSuggestions,
      psychological_insights: psychologicalInsights
    };
    
    this.reflectionEntries.push(reflection);
    
    // Maintain reflection history
    if (this.reflectionEntries.length > 200) {
      this.reflectionEntries = this.reflectionEntries.slice(-200);
    }
  }

  private analyzeEmotionalFactors(tradeRecord: TradeRecord): ReflectionEntry['emotional_analysis'] {
    const biasIndicators: string[] = [];
    let decisionQuality: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'EMOTIONAL' = 'AVERAGE';
    
    // Analyze confidence levels
    if (tradeRecord.confidence > 95) {
      biasIndicators.push('Overconfidence bias detected');
      decisionQuality = 'POOR';
    } else if (tradeRecord.confidence < 30) {
      biasIndicators.push('Under-confidence or hesitation detected');
    }
    
    // Analyze market conditions vs result
    const indicators = tradeRecord.market_conditions;
    if (indicators) {
      if (indicators.rsi > 75 && tradeRecord.result === 'LOSS') {
        biasIndicators.push('Ignored overbought conditions');
        decisionQuality = 'POOR';
      }
      
      if (indicators.rsi < 25 && tradeRecord.result === 'WIN') {
        biasIndicators.push('Good contrarian timing');
        decisionQuality = 'EXCELLENT';
      }
      
      if (indicators.price < indicators.ema50 && tradeRecord.result === 'LOSS') {
        biasIndicators.push('Traded against trend');
        decisionQuality = 'EMOTIONAL';
      }
    }
    
    // Analyze emotional state impact
    if (['STRESSED', 'PANICKED', 'OVERCONFIDENT'].includes(tradeRecord.emotional_state)) {
      biasIndicators.push(`Emotional state: ${tradeRecord.emotional_state}`);
      decisionQuality = 'EMOTIONAL';
    }
    
    return {
      detected_emotion: tradeRecord.emotional_state,
      confidence_level: tradeRecord.confidence,
      bias_indicators: biasIndicators,
      decision_quality: decisionQuality
    };
  }

  private generateSelfCoaching(tradeRecord: TradeRecord, emotionalAnalysis: any): string[] {
    const notes: string[] = [];
    const result = tradeRecord.result;
    const profitLoss = tradeRecord.profit_loss;
    
    if (result === 'LOSS') {
      if (emotionalAnalysis.decision_quality === 'EMOTIONAL') {
        notes.push('This loss appears emotionally driven - take time to center before next trade');
      } else if (profitLoss < -2) {
        notes.push('Significant loss - review position sizing and risk management');
      } else {
        notes.push('Acceptable loss within risk parameters - part of trading process');
      }
      
      if (emotionalAnalysis.bias_indicators.length > 0) {
        notes.push(`Bias analysis: ${emotionalAnalysis.bias_indicators.join(', ')}`);
      }
    } else if (result === 'WIN') {
      if (profitLoss > 3) {
        notes.push('Excellent profit - remember this setup for future reference');
      } else {
        notes.push('Good profitable trade - consistent execution');
      }
      
      if (emotionalAnalysis.decision_quality === 'EXCELLENT') {
        notes.push('High-quality decision making - reinforce this approach');
      }
    }
    
    // Add emotional coaching
    switch (tradeRecord.emotional_state) {
      case 'STRESSED':
        notes.push('Stress detected - consider reducing position sizes temporarily');
        break;
      case 'OVERCONFIDENT':
        notes.push('Overconfidence warning - maintain disciplined approach');
        break;
      case 'PANICKED':
        notes.push('Panic state detected - step away and reassess when calm');
        break;
    }
    
    return notes;
  }

  private extractLesson(tradeRecord: TradeRecord, marketIndicators: any): string {
    const result = tradeRecord.result;
    
    if (!marketIndicators) {
      return `${result} trade completed - insufficient market data for detailed analysis`;
    }
    
    if (result === 'LOSS') {
      if (marketIndicators.rsi > 70) {
        return 'Lesson: Respect overbought conditions - avoid buying into strong resistance';
      } else if (marketIndicators.price < marketIndicators.ema50) {
        return 'Lesson: Trading against the trend is high risk - wait for trend confirmation';
      } else {
        return 'Lesson: Market conditions were reasonable - loss is part of normal trading variance';
      }
    } else if (result === 'WIN') {
      if (marketIndicators.rsi < 40 && marketIndicators.price > marketIndicators.ema50) {
        return 'Lesson: Excellent timing - oversold conditions with trend support provide good entries';
      } else {
        return 'Lesson: Good execution of trading plan - maintain consistency';
      }
    }
    
    return 'Lesson: Neutral outcome - continue following systematic approach';
  }

  private generateImprovementSuggestions(tradeRecord: TradeRecord): string[] {
    const suggestions: string[] = [];
    
    if (tradeRecord.confidence < 50 && tradeRecord.result === 'LOSS') {
      suggestions.push('Consider skipping trades with confidence below 60%');
    }
    
    if (tradeRecord.confidence > 90) {
      suggestions.push('High confidence trades warrant review - ensure not overriding risk management');
    }
    
    if (Math.abs(tradeRecord.profit_loss) > 3) {
      suggestions.push('Large P&L movements suggest reviewing position sizing strategy');
    }
    
    const consecutiveLosses = this.getConsecutiveLosses();
    if (consecutiveLosses >= 2) {
      suggestions.push('Multiple losses detected - consider reducing trade frequency temporarily');
    }
    
    return suggestions;
  }

  private generatePsychologicalInsights(tradeRecord: TradeRecord): string[] {
    const insights: string[] = [];
    
    const emotionalState = tradeRecord.emotional_state;
    
    switch (emotionalState) {
      case 'STRESSED':
        insights.push('Stress can lead to poor decision making - implement stress management techniques');
        insights.push('Consider meditation or breathing exercises before trading sessions');
        break;
      case 'OVERCONFIDENT':
        insights.push('Overconfidence is often followed by significant losses - maintain humility');
        insights.push('Success can breed complacency - stay disciplined with risk management');
        break;
      case 'PANICKED':
        insights.push('Panic leads to impulsive decisions - develop emotional regulation skills');
        insights.push('Fear-based trading often results in buying high and selling low');
        break;
      case 'EUPHORIC':
        insights.push('Euphoria can cloud judgment - avoid increasing position sizes during wins');
        break;
    }
    
    // Add general psychological principles
    if (tradeRecord.result === 'LOSS') {
      insights.push('Losses are information, not failures - focus on learning rather than regret');
    }
    
    return insights;
  }

  // UTILITY METHODS
  private generateBlockId(): string {
    return `BLOCK_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateReflectionId(): string {
    return `REFLECT_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private cleanOldData(): void {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    // Clean old trades
    this.recentTrades = this.recentTrades.filter(trade => trade.timestamp > thirtyDaysAgo);
    
    // Clean old blocks
    this.emotionalBlocks = this.emotionalBlocks.filter(block => block.timestamp > thirtyDaysAgo);
    
    // Clean old reflections
    this.reflectionEntries = this.reflectionEntries.filter(reflection => reflection.timestamp > thirtyDaysAgo);
  }

  // PUBLIC INTERFACE METHODS
  getEmotionalStatistics(): {
    firewall_active: boolean;
    total_trades_recorded: number;
    total_blocks_activated: number;
    active_blocks: number;
    emotional_state_distribution: { [state: string]: number };
    decision_quality_distribution: { [quality: string]: number };
    pattern_trigger_frequency: { [pattern: string]: number };
    reflection_count: number;
    avg_confidence_level: number;
  } {
    const totalTrades = this.recentTrades.length;
    const activeBlocks = this.emotionalBlocks.filter(block => block.is_active).length;
    
    // Emotional state distribution
    const emotionalStates: { [state: string]: number } = {};
    this.recentTrades.forEach(trade => {
      emotionalStates[trade.emotional_state] = (emotionalStates[trade.emotional_state] || 0) + 1;
    });
    
    // Decision quality distribution
    const decisionQuality: { [quality: string]: number } = {};
    this.reflectionEntries.forEach(reflection => {
      const quality = reflection.emotional_analysis.decision_quality;
      decisionQuality[quality] = (decisionQuality[quality] || 0) + 1;
    });
    
    // Pattern trigger frequency
    const patternFrequency: { [pattern: string]: number } = {};
    this.emotionalBlocks.forEach(block => {
      patternFrequency[block.pattern_triggered] = (patternFrequency[block.pattern_triggered] || 0) + 1;
    });
    
    // Average confidence
    const avgConfidence = totalTrades > 0 ? 
      this.recentTrades.reduce((sum, trade) => sum + trade.confidence, 0) / totalTrades : 0;
    
    return {
      firewall_active: this.isFirewallActive,
      total_trades_recorded: totalTrades,
      total_blocks_activated: this.emotionalBlocks.length,
      active_blocks: activeBlocks,
      emotional_state_distribution: emotionalStates,
      decision_quality_distribution: decisionQuality,
      pattern_trigger_frequency: patternFrequency,
      reflection_count: this.reflectionEntries.length,
      avg_confidence_level: Math.round(avgConfidence * 100) / 100
    };
  }

  getReflectionLog(limit: number = 50): ReflectionEntry[] {
    return this.reflectionEntries.slice(-limit).reverse();
  }

  getEmotionalBlocks(limit: number = 20): EmotionalBlock[] {
    return this.emotionalBlocks.slice(-limit).reverse();
  }

  getRecentTrades(limit: number = 50): TradeRecord[] {
    return this.recentTrades.slice(-limit).reverse();
  }

  enableFirewall(): void {
    this.isFirewallActive = true;
    waidesKIDailyReporter.logEmotionalState(
      'CONFIDENT',
      'Emotional firewall activated for trading protection',
      'Firewall Activation',
      85
    );
  }

  disableFirewall(): void {
    this.isFirewallActive = false;
    waidesKIDailyReporter.logEmotionalState(
      'NEUTRAL',
      'Emotional firewall deactivated',
      'Firewall Deactivation',
      70
    );
  }

  clearActiveBlocks(): void {
    this.emotionalBlocks.forEach(block => {
      block.is_active = false;
    });
    
    waidesKIDailyReporter.recordLesson(
      'All active emotional blocks cleared manually',
      'EMOTIONAL',
      'MEDIUM',
      'Emotional Firewall'
    );
  }

  updatePatternThreshold(patternName: string, newThreshold: number): boolean {
    const pattern = this.emotionalPatterns.find(p => p.pattern_name === patternName);
    if (pattern) {
      pattern.detection_threshold = newThreshold;
      return true;
    }
    return false;
  }

  exportEmotionalData(): any {
    return {
      emotional_statistics: this.getEmotionalStatistics(),
      recent_trades: this.recentTrades,
      emotional_blocks: this.emotionalBlocks,
      reflection_entries: this.reflectionEntries,
      emotional_patterns: this.emotionalPatterns,
      firewall_config: {
        is_active: this.isFirewallActive,
        max_trade_history: this.maxTradeHistory
      },
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKIEmotionalFirewall = new WaidesKIEmotionalFirewall();