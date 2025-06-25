import { waidesKIDailyReporter } from './waidesKIDailyReporter';

interface EmotionalState {
  fear_level: number; // 0-100
  greed_level: number; // 0-100
  panic_level: number; // 0-100
  revenge_level: number; // 0-100
  confidence_level: number; // 0-100
  patience_level: number; // 0-100
  discipline_level: number; // 0-100
  overall_emotional_health: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' | 'CRITICAL';
}

interface TradeEmotionAnalysis {
  trade_id: string;
  open_time: number;
  current_pnl: number;
  time_held_minutes: number;
  emotional_triggers: {
    panic_exit_risk: boolean;
    revenge_trade_risk: boolean;
    greed_hold_risk: boolean;
    fear_close_risk: boolean;
  };
  firewall_recommendations: {
    allow_exit: boolean;
    allow_entry: boolean;
    suggested_action: 'HOLD' | 'EXIT' | 'REDUCE' | 'WAIT' | 'FORCE_EXIT';
    reasoning: string[];
  };
  emotion_override_active: boolean;
}

interface EmotionalFirewallRule {
  rule_id: string;
  rule_name: string;
  rule_type: 'PANIC_PROTECTION' | 'REVENGE_PREVENTION' | 'GREED_CONTROL' | 'FEAR_MANAGEMENT' | 'DISCIPLINE_ENFORCEMENT';
  conditions: {
    min_time_held?: number; // minutes
    max_loss_percent?: number;
    max_profit_percent?: number;
    consecutive_losses?: number;
    emotional_threshold?: number;
  };
  action: 'BLOCK_EXIT' | 'BLOCK_ENTRY' | 'FORCE_EXIT' | 'REDUCE_SIZE' | 'DELAY_ACTION';
  description: string;
  is_active: boolean;
  trigger_count: number;
  success_rate: number;
}

interface EmotionalFirewallStatistics {
  total_interventions: number;
  panic_exits_prevented: number;
  revenge_trades_blocked: number;
  greed_holds_corrected: number;
  fear_paralysis_overcome: number;
  successful_interventions: number;
  firewall_success_rate: number;
  average_emotional_health: number;
  emotional_stability_trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  most_common_emotion: string;
  firewall_effectiveness: number;
}

export class WaidesKIEmotionalFirewall {
  private currentEmotionalState: EmotionalState = {
    fear_level: 30,
    greed_level: 25,
    panic_level: 15,
    revenge_level: 10,
    confidence_level: 70,
    patience_level: 80,
    discipline_level: 85,
    overall_emotional_health: 'GOOD'
  };
  
  private activeTrades: Map<string, TradeEmotionAnalysis> = new Map();
  private firewallRules: EmotionalFirewallRule[] = [];
  private emotionalHistory: Array<{ timestamp: number; state: EmotionalState }> = [];
  private interventionLog: Array<{
    timestamp: number;
    trade_id: string;
    intervention_type: string;
    reasoning: string;
    outcome: 'SUCCESS' | 'FAILURE' | 'PENDING';
  }> = [];
  
  private firewallStatistics: EmotionalFirewallStatistics = {
    total_interventions: 0,
    panic_exits_prevented: 0,
    revenge_trades_blocked: 0,
    greed_holds_corrected: 0,
    fear_paralysis_overcome: 0,
    successful_interventions: 0,
    firewall_success_rate: 0,
    average_emotional_health: 75,
    emotional_stability_trend: 'STABLE',
    most_common_emotion: 'CONFIDENCE',
    firewall_effectiveness: 85
  };
  
  private isFirewallActive: boolean = true;
  private maxHistorySize: number = 1000;
  private consecutiveLosses: number = 0;
  private lastTradeResult: 'WIN' | 'LOSS' | null = null;

  constructor() {
    this.initializeFirewallRules();
    this.startEmotionalMonitoring();
  }

  private initializeFirewallRules(): void {
    this.firewallRules = [
      {
        rule_id: 'PANIC_EXIT_PROTECTION',
        rule_name: 'Panic Exit Protection',
        rule_type: 'PANIC_PROTECTION',
        conditions: {
          min_time_held: 10, // Must hold for at least 10 minutes
          max_loss_percent: -5, // When loss is greater than 5%
          emotional_threshold: 70 // High panic level
        },
        action: 'BLOCK_EXIT',
        description: 'Prevents panic exits during temporary drawdowns',
        is_active: true,
        trigger_count: 0,
        success_rate: 0
      },
      {
        rule_id: 'REVENGE_TRADE_BLOCKER',
        rule_name: 'Revenge Trade Blocker',
        rule_type: 'REVENGE_PREVENTION',
        conditions: {
          consecutive_losses: 2,
          emotional_threshold: 60 // High revenge level
        },
        action: 'BLOCK_ENTRY',
        description: 'Blocks new trades after consecutive losses when revenge emotions are high',
        is_active: true,
        trigger_count: 0,
        success_rate: 0
      },
      {
        rule_id: 'GREED_PROFIT_TAKER',
        rule_name: 'Greed Profit Taker',
        rule_type: 'GREED_CONTROL',
        conditions: {
          max_profit_percent: 15, // When profit exceeds 15%
          emotional_threshold: 70 // High greed level
        },
        action: 'FORCE_EXIT',
        description: 'Forces profit taking when greed prevents logical exits',
        is_active: true,
        trigger_count: 0,
        success_rate: 0
      },
      {
        rule_id: 'FEAR_PARALYSIS_BREAKER',
        rule_name: 'Fear Paralysis Breaker',
        rule_type: 'FEAR_MANAGEMENT',
        conditions: {
          emotional_threshold: 75, // High fear level
          min_time_held: 60 // Held too long due to fear
        },
        action: 'FORCE_EXIT',
        description: 'Forces action when fear causes trading paralysis',
        is_active: true,
        trigger_count: 0,
        success_rate: 0
      },
      {
        rule_id: 'DISCIPLINE_ENFORCER',
        rule_name: 'Discipline Enforcer',
        rule_type: 'DISCIPLINE_ENFORCEMENT',
        conditions: {
          emotional_threshold: 40 // Low discipline level
        },
        action: 'DELAY_ACTION',
        description: 'Adds cooling-off period when discipline is compromised',
        is_active: true,
        trigger_count: 0,
        success_rate: 0
      }
    ];
  }

  private startEmotionalMonitoring(): void {
    // Update emotional state every 5 minutes
    setInterval(() => {
      this.updateEmotionalState();
      this.monitorActiveTradesForEmotions();
    }, 5 * 60 * 1000);

    // Clean old data every hour
    setInterval(() => {
      this.cleanOldData();
    }, 60 * 60 * 1000);
  }

  private updateEmotionalState(): void {
    // Simulate emotional state changes based on trading activity and market conditions
    const previousState = { ...this.currentEmotionalState };
    
    // Factor in recent trade results
    if (this.consecutiveLosses >= 2) {
      this.currentEmotionalState.revenge_level = Math.min(100, this.currentEmotionalState.revenge_level + 15);
      this.currentEmotionalState.confidence_level = Math.max(0, this.currentEmotionalState.confidence_level - 10);
    } else if (this.lastTradeResult === 'WIN') {
      this.currentEmotionalState.confidence_level = Math.min(100, this.currentEmotionalState.confidence_level + 5);
      this.currentEmotionalState.revenge_level = Math.max(0, this.currentEmotionalState.revenge_level - 10);
    }
    
    // Natural emotional decay towards neutral
    this.currentEmotionalState.fear_level = this.decayTowards(this.currentEmotionalState.fear_level, 30, 0.1);
    this.currentEmotionalState.greed_level = this.decayTowards(this.currentEmotionalState.greed_level, 25, 0.1);
    this.currentEmotionalState.panic_level = this.decayTowards(this.currentEmotionalState.panic_level, 15, 0.15);
    this.currentEmotionalState.revenge_level = this.decayTowards(this.currentEmotionalState.revenge_level, 10, 0.2);
    
    // Patience and discipline slowly improve with good behavior
    if (this.firewallStatistics.firewall_success_rate > 70) {
      this.currentEmotionalState.patience_level = Math.min(100, this.currentEmotionalState.patience_level + 1);
      this.currentEmotionalState.discipline_level = Math.min(100, this.currentEmotionalState.discipline_level + 1);
    }
    
    // Calculate overall emotional health
    this.currentEmotionalState.overall_emotional_health = this.calculateOverallHealth();
    
    // Store emotional history
    this.emotionalHistory.push({
      timestamp: Date.now(),
      state: { ...this.currentEmotionalState }
    });
    
    // Maintain history size
    if (this.emotionalHistory.length > this.maxHistorySize) {
      this.emotionalHistory = this.emotionalHistory.slice(-this.maxHistorySize);
    }
  }

  private decayTowards(current: number, target: number, rate: number): number {
    return current + (target - current) * rate;
  }

  private calculateOverallHealth(): 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' | 'CRITICAL' {
    const healthScore = 
      (100 - this.currentEmotionalState.fear_level) * 0.2 +
      (100 - this.currentEmotionalState.greed_level) * 0.15 +
      (100 - this.currentEmotionalState.panic_level) * 0.25 +
      (100 - this.currentEmotionalState.revenge_level) * 0.15 +
      this.currentEmotionalState.confidence_level * 0.1 +
      this.currentEmotionalState.patience_level * 0.075 +
      this.currentEmotionalState.discipline_level * 0.075;
    
    if (healthScore >= 85) return 'EXCELLENT';
    if (healthScore >= 70) return 'GOOD';
    if (healthScore >= 55) return 'MODERATE';
    if (healthScore >= 40) return 'POOR';
    return 'CRITICAL';
  }

  private monitorActiveTradesForEmotions(): void {
    for (const [tradeId, analysis] of this.activeTrades.entries()) {
      const updatedAnalysis = this.analyzeTradeEmotions(analysis);
      this.activeTrades.set(tradeId, updatedAnalysis);
      
      // Check for firewall interventions
      this.checkFirewallRules(updatedAnalysis);
    }
  }

  // CORE EMOTIONAL ANALYSIS METHODS
  analyzeTradeEmotions(trade: {
    trade_id: string;
    open_time: number;
    current_pnl: number;
    time_held_minutes?: number;
  }): TradeEmotionAnalysis {
    const timeHeld = trade.time_held_minutes || Math.floor((Date.now() - trade.open_time) / (60 * 1000));
    const pnlPercent = trade.current_pnl;
    
    // Detect emotional triggers
    const panicExitRisk = pnlPercent < -3 && timeHeld < 15 && this.currentEmotionalState.panic_level > 60;
    const revengeTradeRisk = this.consecutiveLosses >= 2 && this.currentEmotionalState.revenge_level > 50;
    const greedHoldRisk = pnlPercent > 10 && this.currentEmotionalState.greed_level > 60;
    const fearCloseRisk = this.currentEmotionalState.fear_level > 70;
    
    // Generate firewall recommendations
    const recommendations = this.generateFirewallRecommendations({
      trade_id: trade.trade_id,
      pnl_percent: pnlPercent,
      time_held: timeHeld,
      panic_risk: panicExitRisk,
      revenge_risk: revengeTradeRisk,
      greed_risk: greedHoldRisk,
      fear_risk: fearCloseRisk
    });
    
    return {
      trade_id: trade.trade_id,
      open_time: trade.open_time,
      current_pnl: pnlPercent,
      time_held_minutes: timeHeld,
      emotional_triggers: {
        panic_exit_risk: panicExitRisk,
        revenge_trade_risk: revengeTradeRisk,
        greed_hold_risk: greedHoldRisk,
        fear_close_risk: fearCloseRisk
      },
      firewall_recommendations: recommendations,
      emotion_override_active: recommendations.allow_exit === false || recommendations.allow_entry === false
    };
  }

  private generateFirewallRecommendations(context: {
    trade_id: string;
    pnl_percent: number;
    time_held: number;
    panic_risk: boolean;
    revenge_risk: boolean;
    greed_risk: boolean;
    fear_risk: boolean;
  }): TradeEmotionAnalysis['firewall_recommendations'] {
    const reasoning: string[] = [];
    let allowExit = true;
    let allowEntry = true;
    let suggestedAction: 'HOLD' | 'EXIT' | 'REDUCE' | 'WAIT' | 'FORCE_EXIT' = 'HOLD';
    
    // Panic exit protection
    if (context.panic_risk && context.time_held < 10) {
      allowExit = false;
      reasoning.push('Panic exit blocked - insufficient time to assess true trend');
      suggestedAction = 'HOLD';
    }
    
    // Revenge trade prevention
    if (context.revenge_risk) {
      allowEntry = false;
      reasoning.push('New trade entry blocked - revenge trading pattern detected');
      suggestedAction = 'WAIT';
    }
    
    // Greed control
    if (context.greed_risk && context.pnl_percent > 15) {
      reasoning.push('High profit target reached - greed override suggests taking profits');
      suggestedAction = 'FORCE_EXIT';
    }
    
    // Fear management
    if (context.fear_risk && context.time_held > 60) {
      reasoning.push('Fear paralysis detected - consider position management');
      if (context.pnl_percent > 0) {
        suggestedAction = 'EXIT';
      } else {
        suggestedAction = 'REDUCE';
      }
    }
    
    // Default reasoning if no emotions triggered
    if (reasoning.length === 0) {
      reasoning.push('No emotional triggers detected - normal trading behavior');
    }
    
    return {
      allow_exit: allowExit,
      allow_entry: allowEntry,
      suggested_action: suggestedAction,
      reasoning: reasoning
    };
  }

  private checkFirewallRules(analysis: TradeEmotionAnalysis): void {
    if (!this.isFirewallActive) return;
    
    for (const rule of this.firewallRules) {
      if (!rule.is_active) continue;
      
      const shouldTrigger = this.evaluateFirewallRule(rule, analysis);
      
      if (shouldTrigger) {
        this.triggerFirewallIntervention(rule, analysis);
      }
    }
  }

  private evaluateFirewallRule(rule: EmotionalFirewallRule, analysis: TradeEmotionAnalysis): boolean {
    const conditions = rule.conditions;
    const state = this.currentEmotionalState;
    
    switch (rule.rule_type) {
      case 'PANIC_PROTECTION':
        return analysis.current_pnl < (conditions.max_loss_percent || -5) &&
               analysis.time_held_minutes < (conditions.min_time_held || 10) &&
               state.panic_level > (conditions.emotional_threshold || 70);
               
      case 'REVENGE_PREVENTION':
        return this.consecutiveLosses >= (conditions.consecutive_losses || 2) &&
               state.revenge_level > (conditions.emotional_threshold || 60);
               
      case 'GREED_CONTROL':
        return analysis.current_pnl > (conditions.max_profit_percent || 15) &&
               state.greed_level > (conditions.emotional_threshold || 70);
               
      case 'FEAR_MANAGEMENT':
        return state.fear_level > (conditions.emotional_threshold || 75) &&
               analysis.time_held_minutes > (conditions.min_time_held || 60);
               
      case 'DISCIPLINE_ENFORCEMENT':
        return state.discipline_level < (conditions.emotional_threshold || 40);
        
      default:
        return false;
    }
  }

  private triggerFirewallIntervention(rule: EmotionalFirewallRule, analysis: TradeEmotionAnalysis): void {
    rule.trigger_count++;
    
    const intervention = {
      timestamp: Date.now(),
      trade_id: analysis.trade_id,
      intervention_type: rule.rule_name,
      reasoning: `${rule.description} - ${rule.action}`,
      outcome: 'PENDING' as const
    };
    
    this.interventionLog.push(intervention);
    this.firewallStatistics.total_interventions++;
    
    // Update specific intervention counters
    switch (rule.rule_type) {
      case 'PANIC_PROTECTION':
        this.firewallStatistics.panic_exits_prevented++;
        break;
      case 'REVENGE_PREVENTION':
        this.firewallStatistics.revenge_trades_blocked++;
        break;
      case 'GREED_CONTROL':
        this.firewallStatistics.greed_holds_corrected++;
        break;
      case 'FEAR_MANAGEMENT':
        this.firewallStatistics.fear_paralysis_overcome++;
        break;
    }
    
    waidesKIDailyReporter.recordLesson(
      `Emotional firewall intervention: ${rule.rule_name} triggered for trade ${analysis.trade_id}`,
      'EMOTIONAL_FIREWALL',
      'HIGH',
      'Emotional Firewall'
    );
  }

  private cleanOldData(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    // Clean emotional history
    this.emotionalHistory = this.emotionalHistory.filter(h => h.timestamp > cutoffTime);
    
    // Clean intervention log
    this.interventionLog = this.interventionLog.filter(i => i.timestamp > cutoffTime);
  }

  // PUBLIC INTERFACE METHODS
  evaluateTradeExit(tradeId: string, currentPnL: number, timeHeldMinutes: number): {
    allowed: boolean;
    reasoning: string[];
    suggested_action: string;
    emotional_state: string;
  } {
    if (!this.isFirewallActive) {
      return {
        allowed: true,
        reasoning: ['Emotional firewall disabled - exit allowed'],
        suggested_action: 'EXIT',
        emotional_state: 'NEUTRAL'
      };
    }
    
    const analysis = this.analyzeTradeEmotions({
      trade_id: tradeId,
      open_time: Date.now() - (timeHeldMinutes * 60 * 1000),
      current_pnl: currentPnL,
      time_held_minutes: timeHeldMinutes
    });
    
    return {
      allowed: analysis.firewall_recommendations.allow_exit,
      reasoning: analysis.firewall_recommendations.reasoning,
      suggested_action: analysis.firewall_recommendations.suggested_action,
      emotional_state: this.currentEmotionalState.overall_emotional_health
    };
  }

  evaluateTradeEntry(): {
    allowed: boolean;
    reasoning: string[];
    emotional_state: string;
    wait_time_minutes?: number;
  } {
    if (!this.isFirewallActive) {
      return {
        allowed: true,
        reasoning: ['Emotional firewall disabled - entry allowed'],
        emotional_state: 'NEUTRAL'
      };
    }
    
    const revengeRisk = this.consecutiveLosses >= 2 && this.currentEmotionalState.revenge_level > 50;
    const disciplineLow = this.currentEmotionalState.discipline_level < 40;
    
    if (revengeRisk) {
      return {
        allowed: false,
        reasoning: ['Revenge trading pattern detected - cooling off period required'],
        emotional_state: this.currentEmotionalState.overall_emotional_health,
        wait_time_minutes: 30
      };
    }
    
    if (disciplineLow) {
      return {
        allowed: false,
        reasoning: ['Low discipline level - discipline enforcement active'],
        emotional_state: this.currentEmotionalState.overall_emotional_health,
        wait_time_minutes: 15
      };
    }
    
    return {
      allowed: true,
      reasoning: ['Emotional state stable - entry allowed'],
      emotional_state: this.currentEmotionalState.overall_emotional_health
    };
  }

  recordTradeResult(tradeId: string, result: 'WIN' | 'LOSS', finalPnL: number): void {
    this.lastTradeResult = result;
    
    if (result === 'LOSS') {
      this.consecutiveLosses++;
      // Increase negative emotions
      this.currentEmotionalState.fear_level = Math.min(100, this.currentEmotionalState.fear_level + 10);
      this.currentEmotionalState.confidence_level = Math.max(0, this.currentEmotionalState.confidence_level - 5);
    } else {
      this.consecutiveLosses = 0;
      // Reduce negative emotions
      this.currentEmotionalState.fear_level = Math.max(0, this.currentEmotionalState.fear_level - 5);
      this.currentEmotionalState.confidence_level = Math.min(100, this.currentEmotionalState.confidence_level + 5);
    }
    
    // Remove from active trades
    this.activeTrades.delete(tradeId);
    
    // Update firewall rule success rates
    this.updateRuleSuccessRates(tradeId, result);
  }

  private updateRuleSuccessRates(tradeId: string, result: 'WIN' | 'LOSS'): void {
    // Find interventions for this trade
    const tradeInterventions = this.interventionLog.filter(i => i.trade_id === tradeId);
    
    for (const intervention of tradeInterventions) {
      intervention.outcome = result === 'WIN' ? 'SUCCESS' : 'FAILURE';
      
      if (result === 'WIN') {
        this.firewallStatistics.successful_interventions++;
      }
    }
    
    // Update overall success rate
    if (this.firewallStatistics.total_interventions > 0) {
      this.firewallStatistics.firewall_success_rate = 
        Math.round((this.firewallStatistics.successful_interventions / this.firewallStatistics.total_interventions) * 100);
    }
  }

  registerActiveTrade(tradeId: string, openTime: number): void {
    const analysis = this.analyzeTradeEmotions({
      trade_id: tradeId,
      open_time: openTime,
      current_pnl: 0
    });
    
    this.activeTrades.set(tradeId, analysis);
  }

  updateTradeProgress(tradeId: string, currentPnL: number): void {
    const existingTrade = this.activeTrades.get(tradeId);
    if (existingTrade) {
      const updatedAnalysis = this.analyzeTradeEmotions({
        trade_id: tradeId,
        open_time: existingTrade.open_time,
        current_pnl: currentPnL
      });
      
      this.activeTrades.set(tradeId, updatedAnalysis);
    }
  }

  getCurrentEmotionalState(): EmotionalState {
    return { ...this.currentEmotionalState };
  }

  getEmotionalFirewallStatistics(): EmotionalFirewallStatistics {
    return { ...this.firewallStatistics };
  }

  getFirewallRules(): EmotionalFirewallRule[] {
    return [...this.firewallRules];
  }

  getInterventionHistory(limit: number = 50): typeof this.interventionLog {
    return this.interventionLog.slice(-limit).reverse();
  }

  enableFirewall(): void {
    this.isFirewallActive = true;
    
    waidesKIDailyReporter.logEmotionalState(
      'CONFIDENT',
      'Emotional firewall activated - protecting against emotional trading mistakes',
      'Firewall Activation',
      90
    );
  }

  disableFirewall(): void {
    this.isFirewallActive = false;
    
    waidesKIDailyReporter.logEmotionalState(
      'NEUTRAL',
      'Emotional firewall deactivated - manual emotional control required',
      'Firewall Deactivation',
      70
    );
  }

  exportEmotionalFirewallData(): any {
    return {
      emotional_firewall_statistics: this.getEmotionalFirewallStatistics(),
      current_emotional_state: this.getCurrentEmotionalState(),
      firewall_rules: this.getFirewallRules(),
      intervention_history: this.getInterventionHistory(100),
      active_trades: Array.from(this.activeTrades.values()),
      emotional_history: this.emotionalHistory.slice(-100),
      firewall_config: {
        is_active: this.isFirewallActive,
        consecutive_losses: this.consecutiveLosses,
        max_history_size: this.maxHistorySize
      },
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKIEmotionalFirewall = new WaidesKIEmotionalFirewall();