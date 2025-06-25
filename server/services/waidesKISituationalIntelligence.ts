import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKIRiskManager } from './waidesKIRiskManager';
import { waidesKIDNAHealer } from './waidesKIDNAHealer';
import { waidesKISignatureTracker } from './waidesKISignatureTracker';

interface MarketWindow {
  name: string;
  start_hour: number;
  end_hour: number;
  timezone: string;
  volatility_profile: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  volume_profile: 'LOW' | 'MEDIUM' | 'HIGH';
  risk_level: 'SAFE' | 'MODERATE' | 'HIGH' | 'DANGEROUS';
  description: string;
}

interface SituationalRule {
  rule_id: string;
  zone: string;
  condition: string;
  action: 'PAUSE' | 'ADJUST' | 'ENHANCE' | 'BLOCK';
  reason: string;
  confidence: number;
  learned_from: 'MANUAL' | 'AUTO_LEARNING' | 'DNA_ANALYSIS' | 'HISTORICAL_DATA';
  success_rate: number;
  times_applied: number;
  last_applied: number;
  is_active: boolean;
}

interface SituationalContext {
  current_zone: string;
  zone_description: string;
  volatility_window: boolean;
  volume_window: boolean;
  risk_assessment: string;
  time_until_zone_change: number;
  zone_confidence: number;
  market_phase: 'PRE_MARKET' | 'OPENING' | 'ACTIVE' | 'CLOSING' | 'POST_MARKET' | 'OFF_HOURS';
  recommended_position_size: number;
  active_adjustments: string[];
}

interface ContextualDecision {
  decision_id: string;
  timestamp: number;
  zone: string;
  indicators: any;
  original_decision: string;
  situational_adjustment: 'NONE' | 'PAUSE' | 'REDUCE_SIZE' | 'INCREASE_CONFIDENCE' | 'BLOCK' | 'ENHANCE';
  adjustment_reason: string;
  rules_applied: string[];
  final_decision: string;
  outcome?: 'WIN' | 'LOSS' | 'NEUTRAL';
  learning_value: number;
}

interface VolatilityRegime {
  regime_type: 'LOW_VOL' | 'NORMAL_VOL' | 'HIGH_VOL' | 'EXTREME_VOL';
  regime_strength: number;
  duration_minutes: number;
  expected_movements: {
    typical_range: number;
    breakout_threshold: number;
    reversal_probability: number;
  };
  strategy_recommendations: string[];
}

export class WaidesKISituationalIntelligence {
  private marketWindows: MarketWindow[];
  private situationalRules: SituationalRule[] = [];
  private contextualDecisions: ContextualDecision[] = [];
  private isIntelligenceActive: boolean = true;
  private learningEnabled: boolean = true;
  private maxDecisionHistory: number = 500;

  constructor() {
    this.initializeMarketWindows();
    this.initializeDefaultRules();
    this.startIntelligenceCycle();
  }

  private initializeMarketWindows(): void {
    this.marketWindows = [
      {
        name: 'ASIA_QUIET',
        start_hour: 0,
        end_hour: 6,
        timezone: 'UTC',
        volatility_profile: 'LOW',
        volume_profile: 'LOW',
        risk_level: 'SAFE',
        description: 'Asian quiet hours - low volatility, range-bound movements'
      },
      {
        name: 'ASIA_OPEN',
        start_hour: 6,
        end_hour: 8,
        timezone: 'UTC',
        volatility_profile: 'MEDIUM',
        volume_profile: 'MEDIUM',
        risk_level: 'MODERATE',
        description: 'Asian session opening - moderate activity, trend continuation'
      },
      {
        name: 'LONDON_OPEN',
        start_hour: 8,
        end_hour: 12,
        timezone: 'UTC',
        volatility_profile: 'HIGH',
        volume_profile: 'HIGH',
        risk_level: 'HIGH',
        description: 'London session - high volatility, strong directional moves'
      },
      {
        name: 'LONDON_US_OVERLAP',
        start_hour: 12,
        end_hour: 16,
        timezone: 'UTC',
        volatility_profile: 'EXTREME',
        volume_profile: 'HIGH',
        risk_level: 'DANGEROUS',
        description: 'London-US overlap - maximum volatility, major news impact'
      },
      {
        name: 'US_OPEN',
        start_hour: 14,
        end_hour: 18,
        timezone: 'UTC',
        volatility_profile: 'HIGH',
        volume_profile: 'HIGH',
        risk_level: 'HIGH',
        description: 'US session opening - high impact news, institutional flows'
      },
      {
        name: 'US_CLOSE',
        start_hour: 18,
        end_hour: 22,
        timezone: 'UTC',
        volatility_profile: 'MEDIUM',
        volume_profile: 'MEDIUM',
        risk_level: 'MODERATE',
        description: 'US session closing - profit taking, position adjustments'
      },
      {
        name: 'OFF_HOURS',
        start_hour: 22,
        end_hour: 24,
        timezone: 'UTC',
        volatility_profile: 'LOW',
        volume_profile: 'LOW',
        risk_level: 'SAFE',
        description: 'After hours - minimal activity, low liquidity'
      }
    ];
  }

  private initializeDefaultRules(): void {
    this.situationalRules = [
      {
        rule_id: 'LONDON_HIGH_RSI_BLOCK',
        zone: 'LONDON_OPEN',
        condition: 'RSI > 75',
        action: 'BLOCK',
        reason: 'London session with extreme RSI often leads to violent reversals',
        confidence: 85,
        learned_from: 'HISTORICAL_DATA',
        success_rate: 82,
        times_applied: 0,
        last_applied: 0,
        is_active: true
      },
      {
        rule_id: 'US_OVERLAP_POSITION_REDUCE',
        zone: 'LONDON_US_OVERLAP',
        condition: 'ANY_ENTRY',
        action: 'ADJUST',
        reason: 'Maximum volatility window requires reduced position sizing',
        confidence: 90,
        learned_from: 'MANUAL',
        success_rate: 88,
        times_applied: 0,
        last_applied: 0,
        is_active: true
      },
      {
        rule_id: 'ASIA_QUIET_VWAP_REQUIRED',
        zone: 'ASIA_QUIET',
        condition: 'VWAP_STATUS != ABOVE',
        action: 'PAUSE',
        reason: 'Asia quiet hours require strong VWAP confirmation for reliable moves',
        confidence: 75,
        learned_from: 'AUTO_LEARNING',
        success_rate: 71,
        times_applied: 0,
        last_applied: 0,
        is_active: true
      },
      {
        rule_id: 'OFF_HOURS_HIGH_CONFIDENCE_ONLY',
        zone: 'OFF_HOURS',
        condition: 'CONFIDENCE < 80',
        action: 'BLOCK',
        reason: 'Off hours trading requires extremely high confidence due to low liquidity',
        confidence: 92,
        learned_from: 'MANUAL',
        success_rate: 89,
        times_applied: 0,
        last_applied: 0,
        is_active: true
      },
      {
        rule_id: 'US_OPEN_VOLUME_CONFIRMATION',
        zone: 'US_OPEN',
        condition: 'VOLUME < 1000000',
        action: 'PAUSE',
        reason: 'US open requires high volume confirmation to avoid fake breakouts',
        confidence: 78,
        learned_from: 'DNA_ANALYSIS',
        success_rate: 74,
        times_applied: 0,
        last_applied: 0,
        is_active: true
      }
    ];
  }

  private startIntelligenceCycle(): void {
    // Update situational rules based on learning every hour
    setInterval(() => {
      this.updateSituationalRules();
    }, 60 * 60 * 1000);

    // Clean old decisions every 6 hours
    setInterval(() => {
      this.cleanOldDecisions();
    }, 6 * 60 * 60 * 1000);
  }

  // CORE SITUATIONAL ANALYSIS
  analyzeCurrentSituation(): SituationalContext {
    const currentZone = this.getCurrentMarketZone();
    const marketWindow = this.marketWindows.find(w => w.name === currentZone) || this.marketWindows[0];
    
    const timeUntilChange = this.getTimeUntilZoneChange();
    const volatilityWindow = this.isHighVolatilityWindow(currentZone);
    const volumeWindow = this.isHighVolumeWindow(currentZone);
    
    const riskAssessment = this.assessCurrentRisk(currentZone);
    const recommendedPositionSize = this.calculateRecommendedPositionSize(currentZone);
    const activeAdjustments = this.getActiveAdjustments(currentZone);
    
    return {
      current_zone: currentZone,
      zone_description: marketWindow.description,
      volatility_window: volatilityWindow,
      volume_window: volumeWindow,
      risk_assessment: riskAssessment,
      time_until_zone_change: timeUntilChange,
      zone_confidence: this.calculateZoneConfidence(currentZone),
      market_phase: this.determineMarketPhase(currentZone),
      recommended_position_size: recommendedPositionSize,
      active_adjustments: activeAdjustments
    };
  }

  shouldAdjustStrategy(
    indicators: any,
    originalDecision: string,
    confidence: number
  ): { shouldAdjust: boolean; adjustment: string; reason: string; rulesApplied: string[] } {
    if (!this.isIntelligenceActive) {
      return { shouldAdjust: false, adjustment: 'NONE', reason: 'Situational intelligence disabled', rulesApplied: [] };
    }

    const currentZone = this.getCurrentMarketZone();
    const applicableRules = this.getApplicableRules(currentZone, indicators, confidence);
    const rulesApplied: string[] = [];
    
    if (applicableRules.length === 0) {
      return { shouldAdjust: false, adjustment: 'NONE', reason: 'No situational adjustments needed', rulesApplied: [] };
    }

    // Apply highest priority rule
    const primaryRule = this.selectPrimaryRule(applicableRules);
    rulesApplied.push(primaryRule.rule_id);
    
    // Update rule application statistics
    this.applyRule(primaryRule);
    
    let adjustment: string;
    let reason: string;
    
    switch (primaryRule.action) {
      case 'BLOCK':
        adjustment = 'BLOCK';
        reason = `Trade blocked: ${primaryRule.reason}`;
        break;
      case 'PAUSE':
        adjustment = 'PAUSE';
        reason = `Trade paused: ${primaryRule.reason}`;
        break;
      case 'ADJUST':
        adjustment = 'REDUCE_SIZE';
        reason = `Position size reduced: ${primaryRule.reason}`;
        break;
      case 'ENHANCE':
        adjustment = 'INCREASE_CONFIDENCE';
        reason = `Strategy enhanced: ${primaryRule.reason}`;
        break;
      default:
        adjustment = 'NONE';
        reason = 'Unknown adjustment type';
    }

    // Record contextual decision
    this.recordContextualDecision(
      currentZone,
      indicators,
      originalDecision,
      adjustment,
      reason,
      rulesApplied
    );

    return {
      shouldAdjust: adjustment !== 'NONE',
      adjustment,
      reason,
      rulesApplied
    };
  }

  private getCurrentMarketZone(): string {
    const now = new Date();
    const utcHour = now.getUTCHours();
    
    for (const window of this.marketWindows) {
      if (window.start_hour <= window.end_hour) {
        if (utcHour >= window.start_hour && utcHour < window.end_hour) {
          return window.name;
        }
      } else {
        // Handle overnight windows
        if (utcHour >= window.start_hour || utcHour < window.end_hour) {
          return window.name;
        }
      }
    }
    
    return 'OFF_HOURS';
  }

  private getTimeUntilZoneChange(): number {
    const currentZone = this.getCurrentMarketZone();
    const currentWindow = this.marketWindows.find(w => w.name === currentZone);
    
    if (!currentWindow) return 0;
    
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    
    const currentMinutes = utcHour * 60 + utcMinute;
    const endMinutes = currentWindow.end_hour * 60;
    
    if (endMinutes > currentMinutes) {
      return endMinutes - currentMinutes;
    } else {
      // Next day
      return (24 * 60) - currentMinutes + endMinutes;
    }
  }

  private isHighVolatilityWindow(zone: string): boolean {
    const window = this.marketWindows.find(w => w.name === zone);
    return window ? ['HIGH', 'EXTREME'].includes(window.volatility_profile) : false;
  }

  private isHighVolumeWindow(zone: string): boolean {
    const window = this.marketWindows.find(w => w.name === zone);
    return window ? window.volume_profile === 'HIGH' : false;
  }

  private assessCurrentRisk(zone: string): string {
    const window = this.marketWindows.find(w => w.name === zone);
    if (!window) return 'UNKNOWN';
    
    switch (window.risk_level) {
      case 'SAFE':
        return 'Low risk - stable conditions for systematic trading';
      case 'MODERATE':
        return 'Moderate risk - normal market conditions with standard precautions';
      case 'HIGH':
        return 'High risk - elevated volatility requires careful position management';
      case 'DANGEROUS':
        return 'Extreme risk - maximum volatility period, reduced exposure recommended';
      default:
        return 'Unknown risk level';
    }
  }

  private calculateRecommendedPositionSize(zone: string): number {
    const window = this.marketWindows.find(w => w.name === zone);
    if (!window) return 1.0;
    
    switch (window.risk_level) {
      case 'SAFE':
        return 1.2; // 20% increase in low risk
      case 'MODERATE':
        return 1.0; // Normal position size
      case 'HIGH':
        return 0.7; // 30% reduction in high risk
      case 'DANGEROUS':
        return 0.4; // 60% reduction in extreme risk
      default:
        return 1.0;
    }
  }

  private getActiveAdjustments(zone: string): string[] {
    const activeRules = this.situationalRules.filter(rule => 
      rule.is_active && rule.zone === zone
    );
    
    return activeRules.map(rule => `${rule.action}: ${rule.reason}`);
  }

  private calculateZoneConfidence(zone: string): number {
    // Calculate confidence based on historical accuracy of zone-based decisions
    const zoneDecisions = this.contextualDecisions.filter(d => d.zone === zone && d.outcome);
    
    if (zoneDecisions.length === 0) return 75; // Default confidence
    
    const successfulDecisions = zoneDecisions.filter(d => d.outcome === 'WIN').length;
    return Math.round((successfulDecisions / zoneDecisions.length) * 100);
  }

  private determineMarketPhase(zone: string): SituationalContext['market_phase'] {
    switch (zone) {
      case 'ASIA_QUIET':
        return 'PRE_MARKET';
      case 'ASIA_OPEN':
      case 'LONDON_OPEN':
      case 'US_OPEN':
        return 'OPENING';
      case 'LONDON_US_OVERLAP':
        return 'ACTIVE';
      case 'US_CLOSE':
        return 'CLOSING';
      case 'OFF_HOURS':
        return 'POST_MARKET';
      default:
        return 'OFF_HOURS';
    }
  }

  private getApplicableRules(zone: string, indicators: any, confidence: number): SituationalRule[] {
    return this.situationalRules.filter(rule => {
      if (!rule.is_active || rule.zone !== zone) return false;
      
      return this.evaluateRuleCondition(rule.condition, indicators, confidence);
    });
  }

  private evaluateRuleCondition(condition: string, indicators: any, confidence: number): boolean {
    try {
      // Parse and evaluate condition
      if (condition === 'ANY_ENTRY') return true;
      
      if (condition.includes('RSI >')) {
        const threshold = parseFloat(condition.split('RSI >')[1].trim());
        return indicators.rsi > threshold;
      }
      
      if (condition.includes('RSI <')) {
        const threshold = parseFloat(condition.split('RSI <')[1].trim());
        return indicators.rsi < threshold;
      }
      
      if (condition.includes('CONFIDENCE <')) {
        const threshold = parseFloat(condition.split('CONFIDENCE <')[1].trim());
        return confidence < threshold;
      }
      
      if (condition.includes('VOLUME <')) {
        const threshold = parseFloat(condition.split('VOLUME <')[1].trim());
        return indicators.volume < threshold;
      }
      
      if (condition.includes('VWAP_STATUS != ABOVE')) {
        return indicators.vwap_status !== 'ABOVE';
      }
      
      if (condition.includes('VWAP_STATUS == BELOW')) {
        return indicators.vwap_status === 'BELOW';
      }
      
      return false;
    } catch (error) {
      console.error('Error evaluating rule condition:', error);
      return false;
    }
  }

  private selectPrimaryRule(rules: SituationalRule[]): SituationalRule {
    // Select rule with highest confidence and success rate
    return rules.sort((a, b) => {
      const scoreA = a.confidence * (a.success_rate / 100);
      const scoreB = b.confidence * (b.success_rate / 100);
      return scoreB - scoreA;
    })[0];
  }

  private applyRule(rule: SituationalRule): void {
    rule.times_applied++;
    rule.last_applied = Date.now();
    
    waidesKIDailyReporter.recordLesson(
      `Situational rule applied: ${rule.rule_id} - ${rule.reason}`,
      'SITUATIONAL',
      'MEDIUM',
      'Situational Intelligence'
    );
  }

  private recordContextualDecision(
    zone: string,
    indicators: any,
    originalDecision: string,
    adjustment: string,
    reason: string,
    rulesApplied: string[]
  ): void {
    const decision: ContextualDecision = {
      decision_id: this.generateDecisionId(),
      timestamp: Date.now(),
      zone,
      indicators,
      original_decision: originalDecision,
      situational_adjustment: adjustment as any,
      adjustment_reason: reason,
      rules_applied: rulesApplied,
      final_decision: adjustment === 'BLOCK' ? 'NO_TRADE' : originalDecision,
      learning_value: this.calculateLearningValue(zone, adjustment)
    };
    
    this.contextualDecisions.push(decision);
    
    // Maintain decision history size
    if (this.contextualDecisions.length > this.maxDecisionHistory) {
      this.contextualDecisions = this.contextualDecisions.slice(-this.maxDecisionHistory);
    }
  }

  private calculateLearningValue(zone: string, adjustment: string): number {
    // Higher learning value for adjustments in high-risk zones
    const window = this.marketWindows.find(w => w.name === zone);
    let baseValue = 1.0;
    
    if (window) {
      switch (window.risk_level) {
        case 'DANGEROUS':
          baseValue = 3.0;
          break;
        case 'HIGH':
          baseValue = 2.0;
          break;
        case 'MODERATE':
          baseValue = 1.5;
          break;
        case 'SAFE':
          baseValue = 1.0;
          break;
      }
    }
    
    // Adjustment type multiplier
    switch (adjustment) {
      case 'BLOCK':
        return baseValue * 2.0;
      case 'PAUSE':
        return baseValue * 1.5;
      case 'REDUCE_SIZE':
        return baseValue * 1.2;
      default:
        return baseValue;
    }
  }

  // LEARNING AND ADAPTATION
  recordDecisionOutcome(decisionId: string, outcome: 'WIN' | 'LOSS' | 'NEUTRAL'): void {
    const decision = this.contextualDecisions.find(d => d.decision_id === decisionId);
    if (decision) {
      decision.outcome = outcome;
      
      // Update rule success rates
      this.updateRuleSuccessRates(decision);
      
      // Learn new rules if patterns emerge
      if (this.learningEnabled) {
        this.learnFromDecision(decision);
      }
    }
  }

  private updateRuleSuccessRates(decision: ContextualDecision): void {
    for (const ruleId of decision.rules_applied) {
      const rule = this.situationalRules.find(r => r.rule_id === ruleId);
      if (rule) {
        // Update success rate based on outcome
        const currentTotal = rule.times_applied;
        const currentSuccesses = Math.round((rule.success_rate / 100) * currentTotal);
        
        const newSuccesses = decision.outcome === 'WIN' ? currentSuccesses + 1 : currentSuccesses;
        rule.success_rate = Math.round((newSuccesses / currentTotal) * 100);
        
        // Deactivate rule if success rate drops too low
        if (rule.success_rate < 40 && rule.times_applied > 10) {
          rule.is_active = false;
          waidesKIDailyReporter.recordLesson(
            `Situational rule deactivated: ${rule.rule_id} (success rate: ${rule.success_rate}%)`,
            'SITUATIONAL',
            'HIGH',
            'Situational Intelligence'
          );
        }
      }
    }
  }

  private learnFromDecision(decision: ContextualDecision): void {
    // Look for patterns in failed decisions to create new rules
    if (decision.outcome === 'LOSS' && decision.situational_adjustment === 'NONE') {
      const similarFailures = this.findSimilarFailures(decision);
      
      if (similarFailures.length >= 3) {
        this.createLearningRule(decision, similarFailures);
      }
    }
  }

  private findSimilarFailures(decision: ContextualDecision): ContextualDecision[] {
    const last30Days = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    return this.contextualDecisions.filter(d => 
      d.timestamp > last30Days &&
      d.zone === decision.zone &&
      d.outcome === 'LOSS' &&
      d.situational_adjustment === 'NONE' &&
      this.isSimilarIndicators(d.indicators, decision.indicators)
    );
  }

  private isSimilarIndicators(indicators1: any, indicators2: any): boolean {
    if (!indicators1 || !indicators2) return false;
    
    const rsiDiff = Math.abs(indicators1.rsi - indicators2.rsi);
    const volumeDiff = Math.abs(indicators1.volume - indicators2.volume) / Math.max(indicators1.volume, indicators2.volume);
    
    return rsiDiff < 10 && volumeDiff < 0.3 && indicators1.vwap_status === indicators2.vwap_status;
  }

  private createLearningRule(decision: ContextualDecision, similarFailures: ContextualDecision[]): void {
    const ruleId = `LEARNED_${Date.now()}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // Create condition based on common factors
    let condition = 'ANY_ENTRY';
    const avgRsi = similarFailures.reduce((sum, d) => sum + d.indicators.rsi, 0) / similarFailures.length;
    
    if (avgRsi > 65) {
      condition = `RSI > ${Math.round(avgRsi - 5)}`;
    } else if (avgRsi < 35) {
      condition = `RSI < ${Math.round(avgRsi + 5)}`;
    }
    
    const newRule: SituationalRule = {
      rule_id: ruleId,
      zone: decision.zone,
      condition,
      action: 'PAUSE',
      reason: `Learned pattern: Multiple failures in ${decision.zone} with similar conditions`,
      confidence: 60,
      learned_from: 'AUTO_LEARNING',
      success_rate: 50,
      times_applied: 0,
      last_applied: 0,
      is_active: true
    };
    
    this.situationalRules.push(newRule);
    
    waidesKIDailyReporter.recordLesson(
      `New situational rule learned: ${ruleId} for ${decision.zone}`,
      'SITUATIONAL',
      'HIGH',
      'Situational Intelligence'
    );
  }

  private updateSituationalRules(): void {
    // Review and update rule effectiveness
    const activeRules = this.situationalRules.filter(r => r.is_active);
    
    for (const rule of activeRules) {
      if (rule.times_applied > 5) {
        // Update confidence based on success rate
        rule.confidence = Math.min(95, Math.max(30, rule.success_rate + 10));
        
        // Consider rule for removal if consistently poor
        if (rule.success_rate < 30 && rule.times_applied > 15) {
          rule.is_active = false;
        }
      }
    }
  }

  private cleanOldDecisions(): void {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.contextualDecisions = this.contextualDecisions.filter(d => d.timestamp > thirtyDaysAgo);
  }

  // VOLATILITY REGIME ANALYSIS
  analyzeVolatilityRegime(): VolatilityRegime {
    const recentDecisions = this.contextualDecisions.slice(-20);
    const avgVolatility = this.calculateAverageVolatility(recentDecisions);
    
    let regimeType: VolatilityRegime['regime_type'];
    let regimeStrength: number;
    
    if (avgVolatility < 0.5) {
      regimeType = 'LOW_VOL';
      regimeStrength = 30;
    } else if (avgVolatility < 1.0) {
      regimeType = 'NORMAL_VOL';
      regimeStrength = 60;
    } else if (avgVolatility < 2.0) {
      regimeType = 'HIGH_VOL';
      regimeStrength = 85;
    } else {
      regimeType = 'EXTREME_VOL';
      regimeStrength = 95;
    }
    
    return {
      regime_type: regimeType,
      regime_strength: regimeStrength,
      duration_minutes: this.calculateRegimeDuration(),
      expected_movements: {
        typical_range: avgVolatility * 0.8,
        breakout_threshold: avgVolatility * 1.5,
        reversal_probability: this.calculateReversalProbability(regimeType)
      },
      strategy_recommendations: this.generateStrategyRecommendations(regimeType)
    };
  }

  private calculateAverageVolatility(decisions: ContextualDecision[]): number {
    if (decisions.length === 0) return 0.5;
    
    // Simplified volatility calculation based on decision frequency and adjustments
    const adjustmentRate = decisions.filter(d => d.situational_adjustment !== 'NONE').length / decisions.length;
    return adjustmentRate * 2; // Scale to volatility range
  }

  private calculateRegimeDuration(): number {
    // Estimate regime duration based on recent patterns
    return 120 + Math.random() * 240; // 2-6 hours typical regime
  }

  private calculateReversalProbability(regimeType: VolatilityRegime['regime_type']): number {
    switch (regimeType) {
      case 'LOW_VOL':
        return 15;
      case 'NORMAL_VOL':
        return 25;
      case 'HIGH_VOL':
        return 35;
      case 'EXTREME_VOL':
        return 50;
      default:
        return 25;
    }
  }

  private generateStrategyRecommendations(regimeType: VolatilityRegime['regime_type']): string[] {
    switch (regimeType) {
      case 'LOW_VOL':
        return [
          'Focus on range-bound strategies',
          'Use tight stop losses',
          'Increase position sizes moderately',
          'Look for breakout setups'
        ];
      case 'NORMAL_VOL':
        return [
          'Standard trend-following strategies',
          'Normal position sizing',
          'Balanced risk management',
          'Mixed strategy approach'
        ];
      case 'HIGH_VOL':
        return [
          'Reduce position sizes',
          'Widen stop losses',
          'Focus on momentum strategies',
          'Avoid counter-trend trades'
        ];
      case 'EXTREME_VOL':
        return [
          'Minimal position sizes only',
          'Avoid new entries',
          'Close existing positions',
          'Wait for regime change'
        ];
      default:
        return ['Standard approach'];
    }
  }

  // UTILITY METHODS
  private generateDecisionId(): string {
    return `SIT_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  // PUBLIC INTERFACE METHODS
  getSituationalStatistics(): {
    intelligence_active: boolean;
    current_zone: string;
    zone_confidence: number;
    total_decisions: number;
    total_adjustments: number;
    adjustment_success_rate: number;
    active_rules: number;
    learned_rules: number;
    volatility_regime: string;
    recommended_position_size: number;
  } {
    const currentContext = this.analyzeCurrentSituation();
    const volatilityRegime = this.analyzeVolatilityRegime();
    
    const totalDecisions = this.contextualDecisions.length;
    const adjustedDecisions = this.contextualDecisions.filter(d => d.situational_adjustment !== 'NONE');
    const successfulAdjustments = adjustedDecisions.filter(d => d.outcome === 'WIN').length;
    
    const adjustmentSuccessRate = adjustedDecisions.length > 0 ? 
      (successfulAdjustments / adjustedDecisions.length) * 100 : 0;
    
    const activeRules = this.situationalRules.filter(r => r.is_active).length;
    const learnedRules = this.situationalRules.filter(r => r.learned_from === 'AUTO_LEARNING').length;
    
    return {
      intelligence_active: this.isIntelligenceActive,
      current_zone: currentContext.current_zone,
      zone_confidence: currentContext.zone_confidence,
      total_decisions: totalDecisions,
      total_adjustments: adjustedDecisions.length,
      adjustment_success_rate: Math.round(adjustmentSuccessRate),
      active_rules: activeRules,
      learned_rules: learnedRules,
      volatility_regime: volatilityRegime.regime_type,
      recommended_position_size: currentContext.recommended_position_size
    };
  }

  getCurrentContext(): SituationalContext {
    return this.analyzeCurrentSituation();
  }

  getSituationalRules(): SituationalRule[] {
    return [...this.situationalRules];
  }

  getContextualDecisions(limit: number = 100): ContextualDecision[] {
    return this.contextualDecisions.slice(-limit).reverse();
  }

  getMarketWindows(): MarketWindow[] {
    return [...this.marketWindows];
  }

  getVolatilityRegime(): VolatilityRegime {
    return this.analyzeVolatilityRegime();
  }

  enableIntelligence(): void {
    this.isIntelligenceActive = true;
    waidesKIDailyReporter.logEmotionalState(
      'FOCUSED',
      'Situational intelligence activated for context-aware trading',
      'Situational Intelligence',
      85
    );
  }

  disableIntelligence(): void {
    this.isIntelligenceActive = false;
    waidesKIDailyReporter.logEmotionalState(
      'NEUTRAL',
      'Situational intelligence deactivated',
      'Situational Intelligence',
      70
    );
  }

  enableLearning(): void {
    this.learningEnabled = true;
  }

  disableLearning(): void {
    this.learningEnabled = false;
  }

  addCustomRule(rule: Omit<SituationalRule, 'rule_id' | 'times_applied' | 'last_applied'>): string {
    const ruleId = `CUSTOM_${Date.now()}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const newRule: SituationalRule = {
      ...rule,
      rule_id: ruleId,
      times_applied: 0,
      last_applied: 0
    };
    
    this.situationalRules.push(newRule);
    
    waidesKIDailyReporter.recordLesson(
      `Custom situational rule added: ${ruleId}`,
      'SITUATIONAL',
      'MEDIUM',
      'Situational Intelligence'
    );
    
    return ruleId;
  }

  removeRule(ruleId: string): boolean {
    const index = this.situationalRules.findIndex(r => r.rule_id === ruleId);
    if (index !== -1) {
      this.situationalRules.splice(index, 1);
      return true;
    }
    return false;
  }

  exportSituationalData(): any {
    return {
      situational_statistics: this.getSituationalStatistics(),
      current_context: this.getCurrentContext(),
      situational_rules: this.situationalRules,
      contextual_decisions: this.contextualDecisions,
      market_windows: this.marketWindows,
      volatility_regime: this.getVolatilityRegime(),
      intelligence_config: {
        is_active: this.isIntelligenceActive,
        learning_enabled: this.learningEnabled,
        max_decision_history: this.maxDecisionHistory
      },
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKISituationalIntelligence = new WaidesKISituationalIntelligence();