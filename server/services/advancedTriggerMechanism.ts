import { advancedDecisionEngine, type TradeDecision, type TradingEntity } from "./advancedDecisionEngine.js";
import { signalAggregatorService, type TradingSignal } from "./signalAggregator.js";

// Advanced Trigger Mechanism with Timing and Event-Driven Execution
// Ensures entities execute trades only at optimal moments after comprehensive analysis

export interface TimeTrigger {
  id: string;
  entityId: string;
  triggerTime: number;
  decision: TradeDecision;
  timeWindow: number; // milliseconds
  conditions: TriggerCondition[];
  status: 'pending' | 'executed' | 'expired' | 'cancelled';
  createdAt: number;
}

export interface TriggerCondition {
  type: 'price' | 'volume' | 'time' | 'event' | 'market_stability';
  operator: 'greater_than' | 'less_than' | 'equals' | 'within_range';
  value: number | string;
  currentValue?: number | string;
  satisfied: boolean;
}

export interface EventTrigger {
  id: string;
  entityId: string;
  eventType: 'news' | 'price_movement' | 'volume_spike' | 'market_shift';
  conditions: any;
  decision: TradeDecision;
  isActive: boolean;
  expiresAt: number;
}

export interface ExecutionResult {
  success: boolean;
  entityId: string;
  triggerId: string;
  executedAt: number;
  actualPrice: number;
  positionSize: number;
  message: string;
  tradeId?: string;
}

class AdvancedTriggerMechanism {
  private timeTriggers: Map<string, TimeTrigger> = new Map();
  private eventTriggers: Map<string, EventTrigger> = new Map();
  private executionHistory: ExecutionResult[] = [];
  private readonly MAX_HISTORY = 1000;
  private readonly TRIGGER_CHECK_INTERVAL = 5000; // 5 seconds
  private readonly MAX_TIME_WINDOW = 30 * 60 * 1000; // 30 minutes max window
  
  private triggerTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startTriggerMonitoring();
  }

  // Set up a time-based trigger for trade execution
  async setupTimeTrigger(
    entityId: string,
    decision: TradeDecision,
    delayMinutes: number = 5,
    timeWindowMinutes: number = 10
  ): Promise<string> {
    const triggerId = `time_${entityId}_${Date.now()}`;
    const triggerTime = Date.now() + (delayMinutes * 60 * 1000);
    const timeWindow = Math.min(timeWindowMinutes * 60 * 1000, this.MAX_TIME_WINDOW);
    
    // Generate conditions based on decision requirements
    const conditions = this.generateTriggerConditions(decision);
    
    const trigger: TimeTrigger = {
      id: triggerId,
      entityId,
      triggerTime,
      decision,
      timeWindow,
      conditions,
      status: 'pending',
      createdAt: Date.now()
    };
    
    this.timeTriggers.set(triggerId, trigger);
    
    console.log(`⏰ Time trigger set for ${entityId}: Execute in ${delayMinutes} minutes`);
    
    return triggerId;
  }

  // Set up an event-driven trigger
  async setupEventTrigger(
    entityId: string,
    decision: TradeDecision,
    eventType: 'news' | 'price_movement' | 'volume_spike' | 'market_shift',
    eventConditions: any,
    expirationHours: number = 24
  ): Promise<string> {
    const triggerId = `event_${entityId}_${Date.now()}`;
    const expiresAt = Date.now() + (expirationHours * 60 * 60 * 1000);
    
    const trigger: EventTrigger = {
      id: triggerId,
      entityId,
      eventType,
      conditions: eventConditions,
      decision,
      isActive: true,
      expiresAt
    };
    
    this.eventTriggers.set(triggerId, trigger);
    
    console.log(`📡 Event trigger set for ${entityId}: ${eventType} monitoring active`);
    
    return triggerId;
  }

  // Generate comprehensive trigger conditions based on trade decision
  private generateTriggerConditions(decision: TradeDecision): TriggerCondition[] {
    const conditions: TriggerCondition[] = [];
    
    // Price stability condition
    conditions.push({
      type: 'price',
      operator: 'within_range',
      value: `${decision.entryPrice * 0.99}-${decision.entryPrice * 1.01}`, // 1% range
      satisfied: false
    });
    
    // Market stability condition
    conditions.push({
      type: 'market_stability',
      operator: 'greater_than',
      value: 0.6, // Stability score
      satisfied: false
    });
    
    // Time window condition
    conditions.push({
      type: 'time',
      operator: 'greater_than',
      value: Date.now() + (2 * 60 * 1000), // At least 2 minutes from now
      satisfied: false
    });
    
    return conditions;
  }

  // Check and execute pending triggers
  private async checkAndExecuteTriggers(): Promise<void> {
    const currentTime = Date.now();
    
    // Check time triggers
    for (const [id, trigger] of this.timeTriggers.entries()) {
      if (trigger.status !== 'pending') continue;
      
      // Check if trigger time has passed
      if (currentTime >= trigger.triggerTime) {
        await this.evaluateTimeTrigger(trigger);
      }
      
      // Check if trigger has expired
      if (currentTime > trigger.triggerTime + trigger.timeWindow) {
        trigger.status = 'expired';
        console.log(`⏰ Time trigger ${id} expired for ${trigger.entityId}`);
      }
    }
    
    // Check event triggers
    for (const [id, trigger] of this.eventTriggers.entries()) {
      if (!trigger.isActive) continue;
      
      // Check if trigger has expired
      if (currentTime > trigger.expiresAt) {
        trigger.isActive = false;
        console.log(`📡 Event trigger ${id} expired for ${trigger.entityId}`);
        continue;
      }
      
      await this.evaluateEventTrigger(trigger);
    }
    
    // Clean up old triggers
    this.cleanupOldTriggers();
  }

  // Evaluate time trigger conditions and execute if ready
  private async evaluateTimeTrigger(trigger: TimeTrigger): Promise<void> {
    try {
      // Check all conditions
      const allConditionsMet = await this.checkTriggerConditions(trigger.conditions);
      
      if (allConditionsMet) {
        const result = await this.executeTrade(trigger.entityId, trigger.decision, trigger.id);
        trigger.status = result.success ? 'executed' : 'cancelled';
        
        this.executionHistory.unshift(result);
        this.limitExecutionHistory();
        
        console.log(`⚡ Time trigger executed for ${trigger.entityId}: ${result.message}`);
      } else {
        // Re-evaluate conditions in next cycle
        console.log(`⏳ Time trigger conditions not yet met for ${trigger.entityId}`);
      }
    } catch (error) {
      console.error(`Error evaluating time trigger for ${trigger.entityId}:`, error);
      trigger.status = 'cancelled';
    }
  }

  // Evaluate event trigger and execute if conditions are met
  private async evaluateEventTrigger(trigger: EventTrigger): Promise<void> {
    try {
      const eventDetected = await this.checkEventConditions(trigger);
      
      if (eventDetected) {
        const result = await this.executeTrade(trigger.entityId, trigger.decision, trigger.id);
        trigger.isActive = false;
        
        this.executionHistory.unshift(result);
        this.limitExecutionHistory();
        
        console.log(`📡 Event trigger executed for ${trigger.entityId}: ${result.message}`);
      }
    } catch (error) {
      console.error(`Error evaluating event trigger for ${trigger.entityId}:`, error);
      trigger.isActive = false;
    }
  }

  // Check if all trigger conditions are satisfied
  private async checkTriggerConditions(conditions: TriggerCondition[]): Promise<boolean> {
    for (const condition of conditions) {
      switch (condition.type) {
        case 'price':
          condition.satisfied = await this.checkPriceCondition(condition);
          break;
        case 'market_stability':
          condition.satisfied = await this.checkMarketStabilityCondition(condition);
          break;
        case 'time':
          condition.satisfied = await this.checkTimeCondition(condition);
          break;
        case 'volume':
          condition.satisfied = await this.checkVolumeCondition(condition);
          break;
      }
      
      if (!condition.satisfied) {
        return false;
      }
    }
    
    return true;
  }

  // Check price-based conditions
  private async checkPriceCondition(condition: TriggerCondition): Promise<boolean> {
    try {
      // Get current price from market service
      const currentPrice = await this.getCurrentPrice();
      condition.currentValue = currentPrice;
      
      switch (condition.operator) {
        case 'greater_than':
          return currentPrice > (condition.value as number);
        case 'less_than':
          return currentPrice < (condition.value as number);
        case 'within_range':
          const [min, max] = (condition.value as string).split('-').map(Number);
          return currentPrice >= min && currentPrice <= max;
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  // Check market stability conditions
  private async checkMarketStabilityCondition(condition: TriggerCondition): Promise<boolean> {
    try {
      const marketConditions = signalAggregatorService.getMarketConditions();
      if (!marketConditions) return false;
      
      const stabilityScore = marketConditions.alignment;
      condition.currentValue = stabilityScore;
      
      return stabilityScore >= (condition.value as number);
    } catch {
      return false;
    }
  }

  // Check time-based conditions
  private async checkTimeCondition(condition: TriggerCondition): Promise<boolean> {
    const currentTime = Date.now();
    condition.currentValue = currentTime;
    
    switch (condition.operator) {
      case 'greater_than':
        return currentTime > (condition.value as number);
      case 'less_than':
        return currentTime < (condition.value as number);
      default:
        return false;
    }
  }

  // Check volume conditions
  private async checkVolumeCondition(condition: TriggerCondition): Promise<boolean> {
    // Simplified volume check - would integrate with real volume data
    return true; // Default to true for now
  }

  // Check event-specific conditions
  private async checkEventConditions(trigger: EventTrigger): Promise<boolean> {
    switch (trigger.eventType) {
      case 'price_movement':
        return await this.checkPriceMovementEvent(trigger.conditions);
      case 'volume_spike':
        return await this.checkVolumeSpike(trigger.conditions);
      case 'market_shift':
        return await this.checkMarketShift(trigger.conditions);
      case 'news':
        return await this.checkNewsEvent(trigger.conditions);
      default:
        return false;
    }
  }

  // Check for significant price movements
  private async checkPriceMovementEvent(conditions: any): Promise<boolean> {
    try {
      const currentPrice = await this.getCurrentPrice();
      const threshold = conditions.threshold || 0.02; // 2% default
      const basePrice = conditions.basePrice || currentPrice;
      
      const change = Math.abs(currentPrice - basePrice) / basePrice;
      return change >= threshold;
    } catch {
      return false;
    }
  }

  // Check for volume spikes
  private async checkVolumeSpike(conditions: any): Promise<boolean> {
    // Simplified - would integrate with real volume data
    return Math.random() > 0.8; // 20% chance for demo
  }

  // Check for market regime shifts
  private async checkMarketShift(conditions: any): Promise<boolean> {
    try {
      const marketConditions = signalAggregatorService.getMarketConditions();
      if (!marketConditions) return false;
      
      // Check if trend has changed significantly
      const expectedTrend = conditions.expectedTrend;
      return marketConditions.trend !== expectedTrend;
    } catch {
      return false;
    }
  }

  // Check for news events
  private async checkNewsEvent(conditions: any): Promise<boolean> {
    // Simplified news monitoring - would integrate with news API
    return Math.random() > 0.9; // 10% chance for demo
  }

  // Execute the actual trade
  private async executeTrade(
    entityId: string,
    decision: TradeDecision,
    triggerId: string
  ): Promise<ExecutionResult> {
    try {
      const entity = advancedDecisionEngine.getEntity(entityId);
      if (!entity) {
        throw new Error(`Entity ${entityId} not found`);
      }
      
      const currentPrice = await this.getCurrentPrice();
      
      // Simulate trade execution
      const result: ExecutionResult = {
        success: true,
        entityId,
        triggerId,
        executedAt: Date.now(),
        actualPrice: currentPrice,
        positionSize: decision.positionSize,
        message: `${decision.action} executed for ${entity.name} at $${currentPrice.toFixed(2)}`,
        tradeId: `trade_${entityId}_${Date.now()}`
      };
      
      console.log(`🎯 Trade executed: ${result.message}`);
      
      return result;
      
    } catch (error) {
      return {
        success: false,
        entityId,
        triggerId,
        executedAt: Date.now(),
        actualPrice: 0,
        positionSize: 0,
        message: `Trade execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Get current market price
  private async getCurrentPrice(): Promise<number> {
    try {
      // This would integrate with your existing price service
      // For now, return a mock price
      return 3500 + (Math.random() - 0.5) * 100; // ETH price around $3500 ± $50
    } catch {
      return 3500; // Fallback price
    }
  }

  // Start background trigger monitoring
  private startTriggerMonitoring(): void {
    this.triggerTimer = setInterval(() => {
      this.checkAndExecuteTriggers();
    }, this.TRIGGER_CHECK_INTERVAL);
    
    console.log('🔍 Advanced trigger monitoring started');
  }

  // Stop trigger monitoring
  stopTriggerMonitoring(): void {
    if (this.triggerTimer) {
      clearInterval(this.triggerTimer);
      this.triggerTimer = null;
      console.log('🛑 Advanced trigger monitoring stopped');
    }
  }

  // Clean up old triggers
  private cleanupOldTriggers(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    // Clean time triggers
    for (const [id, trigger] of this.timeTriggers.entries()) {
      if (trigger.createdAt < cutoffTime && trigger.status !== 'pending') {
        this.timeTriggers.delete(id);
      }
    }
    
    // Clean event triggers
    for (const [id, trigger] of this.eventTriggers.entries()) {
      if (trigger.expiresAt < Date.now()) {
        this.eventTriggers.delete(id);
      }
    }
  }

  // Limit execution history size
  private limitExecutionHistory(): void {
    if (this.executionHistory.length > this.MAX_HISTORY) {
      this.executionHistory = this.executionHistory.slice(0, this.MAX_HISTORY);
    }
  }

  // Cancel a specific trigger
  cancelTrigger(triggerId: string): boolean {
    // Check time triggers
    const timeTrigger = this.timeTriggers.get(triggerId);
    if (timeTrigger) {
      timeTrigger.status = 'cancelled';
      console.log(`❌ Time trigger ${triggerId} cancelled`);
      return true;
    }
    
    // Check event triggers
    const eventTrigger = this.eventTriggers.get(triggerId);
    if (eventTrigger) {
      eventTrigger.isActive = false;
      console.log(`❌ Event trigger ${triggerId} cancelled`);
      return true;
    }
    
    return false;
  }

  // Get trigger status
  getTriggerStatus(triggerId: string): any {
    const timeTrigger = this.timeTriggers.get(triggerId);
    if (timeTrigger) {
      return {
        type: 'time',
        ...timeTrigger,
        timeRemaining: Math.max(0, timeTrigger.triggerTime - Date.now())
      };
    }
    
    const eventTrigger = this.eventTriggers.get(triggerId);
    if (eventTrigger) {
      return {
        type: 'event',
        ...eventTrigger,
        timeRemaining: Math.max(0, eventTrigger.expiresAt - Date.now())
      };
    }
    
    return null;
  }

  // Get all active triggers for an entity
  getEntityTriggers(entityId: string): any[] {
    const triggers = [];
    
    // Get time triggers
    for (const trigger of this.timeTriggers.values()) {
      if (trigger.entityId === entityId && trigger.status === 'pending') {
        triggers.push({
          type: 'time',
          ...trigger,
          timeRemaining: Math.max(0, trigger.triggerTime - Date.now())
        });
      }
    }
    
    // Get event triggers
    for (const trigger of this.eventTriggers.values()) {
      if (trigger.entityId === entityId && trigger.isActive) {
        triggers.push({
          type: 'event',
          ...trigger,
          timeRemaining: Math.max(0, trigger.expiresAt - Date.now())
        });
      }
    }
    
    return triggers;
  }

  // Get execution history for an entity
  getExecutionHistory(entityId: string, limit: number = 20): ExecutionResult[] {
    return this.executionHistory
      .filter(result => result.entityId === entityId)
      .slice(0, limit);
  }

  // Get system statistics
  getSystemStats(): any {
    const activeTriggers = Array.from(this.timeTriggers.values()).filter(t => t.status === 'pending').length +
                          Array.from(this.eventTriggers.values()).filter(t => t.isActive).length;
    
    const totalExecutions = this.executionHistory.length;
    const successfulExecutions = this.executionHistory.filter(r => r.success).length;
    
    return {
      activeTriggers,
      totalExecutions,
      successfulExecutions,
      successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
      entitiesWithTriggers: new Set([
        ...Array.from(this.timeTriggers.values()).map(t => t.entityId),
        ...Array.from(this.eventTriggers.values()).map(t => t.entityId)
      ]).size
    };
  }
}

export const advancedTriggerMechanism = new AdvancedTriggerMechanism();