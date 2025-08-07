/**
 * Position Watchdog - Orphan Position Monitoring and Management
 * Monitors all positions across the 6 trading entities to prevent orphan positions
 */

export interface Position {
  id: string;
  entity: 'alpha' | 'beta' | 'gamma' | 'omega' | 'delta' | 'epsilon';
  symbol: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  entryTime: Date;
  lastUpdateTime: Date;
  stopLoss?: number;
  takeProfit?: number;
  unrealizedPnL: number;
  status: 'active' | 'closing' | 'orphaned' | 'stale' | 'emergency';
  parentTradeId?: string;
  metadata: PositionMetadata;
}

export interface PositionMetadata {
  originalStrategy: string;
  riskLevel: string;
  maxHoldTime: number;        // Maximum time to hold position (minutes)
  lastHeartbeat: Date;        // Last activity from managing entity
  monitoringFlags: string[];  // Any special monitoring requirements
  emergencyContacts: string[]; // Entities that can manage this position
  executionEngine: string;    // Which engine created this position
}

export interface PositionAlert {
  id: string;
  positionId: string;
  alertType: 'orphaned' | 'stale' | 'no_stop_loss' | 'excessive_loss' | 'max_hold_exceeded' | 'heartbeat_lost' | 'emergency_stop';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  actionTaken: string;
  isResolved: boolean;
  resolvedAt?: Date;
}

export interface WatchdogAction {
  id: string;
  positionId: string;
  actionType: 'alert' | 'emergency_close' | 'transfer_ownership' | 'add_stop_loss' | 'reduce_size' | 'extend_monitoring';
  executedAt: Date;
  executedBy: string;
  parameters: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

export class PositionWatchdog {
  private positions = new Map<string, Position>();
  private alerts = new Map<string, PositionAlert>();
  private actionHistory: WatchdogAction[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  
  private readonly CONFIG = {
    HEARTBEAT_TIMEOUT: 5 * 60 * 1000,      // 5 minutes
    STALE_POSITION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    ORPHAN_TIMEOUT: 10 * 60 * 1000,        // 10 minutes
    MAX_UNREALIZED_LOSS: 0.15,             // 15% max loss
    EMERGENCY_LOSS_THRESHOLD: 0.25,        // 25% emergency stop
    DEFAULT_MAX_HOLD_TIME: 24 * 60,        // 24 hours
    MONITORING_FREQUENCY: 30 * 1000,       // 30 seconds
  };

  constructor() {
    this.startMonitoring();
    console.log('👁️ Position Watchdog initialized - monitoring all entity positions');
  }

  public registerPosition(position: Omit<Position, 'id' | 'lastUpdateTime' | 'status'>): string {
    const positionId = `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullPosition: Position = {
      ...position,
      id: positionId,
      lastUpdateTime: new Date(),
      status: 'active'
    };

    this.positions.set(positionId, fullPosition);
    
    console.log(`👁️ Registered position ${positionId} for ${position.entity}: ${position.side} ${position.quantity} ${position.symbol}`);
    
    // Perform immediate safety checks
    this.performPositionSafetyCheck(fullPosition);
    
    return positionId;
  }

  public updatePosition(
    positionId: string,
    updates: Partial<Pick<Position, 'currentPrice' | 'quantity' | 'stopLoss' | 'takeProfit' | 'unrealizedPnL'>>
  ): boolean {
    
    const position = this.positions.get(positionId);
    if (!position) {
      console.warn(`⚠️ Attempted to update non-existent position: ${positionId}`);
      return false;
    }

    // Update position data
    Object.assign(position, updates);
    position.lastUpdateTime = new Date();
    position.metadata.lastHeartbeat = new Date();

    // Recalculate unrealized PnL if current price updated
    if (updates.currentPrice) {
      const priceDiff = position.side === 'LONG' 
        ? updates.currentPrice - position.entryPrice
        : position.entryPrice - updates.currentPrice;
      
      position.unrealizedPnL = (priceDiff / position.entryPrice) * position.quantity;
    }

    // Check for alerts after update
    this.performPositionSafetyCheck(position);

    return true;
  }

  public heartbeat(positionId: string, entity: string): boolean {
    const position = this.positions.get(positionId);
    if (!position) return false;

    if (position.entity !== entity) {
      console.warn(`⚠️ Entity ${entity} attempted heartbeat for position owned by ${position.entity}`);
      return false;
    }

    position.metadata.lastHeartbeat = new Date();
    position.lastUpdateTime = new Date();

    // Clear stale/orphan status if heartbeat received
    if (position.status === 'stale' || position.status === 'orphaned') {
      position.status = 'active';
      console.log(`✅ Position ${positionId} restored to active status after heartbeat`);
    }

    return true;
  }

  public closePosition(positionId: string, entity: string, reason: string = 'normal close'): boolean {
    const position = this.positions.get(positionId);
    if (!position) return false;

    // Verify entity has permission to close
    if (position.entity !== entity && !position.metadata.emergencyContacts.includes(entity)) {
      console.warn(`⚠️ Entity ${entity} not authorized to close position ${positionId}`);
      return false;
    }

    position.status = 'closing';
    
    console.log(`🔒 Position ${positionId} marked for closure by ${entity}: ${reason}`);

    // Record action
    this.recordAction({
      positionId,
      actionType: 'emergency_close',
      executedBy: entity,
      parameters: { reason },
      success: true
    });

    // Remove from active monitoring after a delay (simulate close execution time)
    setTimeout(() => {
      this.positions.delete(positionId);
      console.log(`✅ Position ${positionId} closed and removed from monitoring`);
    }, 5000);

    return true;
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.runMonitoringCycle();
    }, this.CONFIG.MONITORING_FREQUENCY);

    console.log(`⏰ Position monitoring started (${this.CONFIG.MONITORING_FREQUENCY/1000}s intervals)`);
  }

  private runMonitoringCycle(): void {
    const now = new Date();
    
    this.positions.forEach((position, positionId) => {
      this.checkForOrphanedPosition(position, now);
      this.checkForStalePosition(position, now);
      this.checkForExcessiveLoss(position, now);
      this.checkForMaxHoldTime(position, now);
      this.checkForMissingStopLoss(position, now);
      this.checkHeartbeat(position, now);
    });

    // Clean up resolved alerts
    this.cleanupResolvedAlerts();
  }

  private checkForOrphanedPosition(position: Position, now: Date): void {
    const timeSinceHeartbeat = now.getTime() - position.metadata.lastHeartbeat.getTime();
    
    if (timeSinceHeartbeat > this.CONFIG.ORPHAN_TIMEOUT && position.status === 'active') {
      position.status = 'orphaned';
      
      this.createAlert({
        positionId: position.id,
        alertType: 'orphaned',
        severity: 'high',
        description: `Position orphaned - no heartbeat from ${position.entity} for ${Math.round(timeSinceHeartbeat/60000)} minutes`
      });

      // Attempt to transfer to emergency contact
      this.attemptEmergencyTransfer(position);
    }
  }

  private checkForStalePosition(position: Position, now: Date): void {
    const timeSinceUpdate = now.getTime() - position.lastUpdateTime.getTime();
    
    if (timeSinceUpdate > this.CONFIG.STALE_POSITION_TIMEOUT && position.status === 'active') {
      position.status = 'stale';
      
      this.createAlert({
        positionId: position.id,
        alertType: 'stale',
        severity: 'medium',
        description: `Position stale - no updates for ${Math.round(timeSinceUpdate/60000)} minutes`
      });
    }
  }

  private checkForExcessiveLoss(position: Position, now: Date): void {
    const lossRatio = Math.abs(position.unrealizedPnL) / (position.quantity * position.entryPrice);
    
    if (lossRatio > this.CONFIG.EMERGENCY_LOSS_THRESHOLD) {
      position.status = 'emergency';
      
      this.createAlert({
        positionId: position.id,
        alertType: 'emergency_stop',
        severity: 'critical',
        description: `Emergency loss threshold exceeded: ${(lossRatio * 100).toFixed(1)}%`
      });

      // Execute emergency stop
      this.executeEmergencyStop(position, `Loss exceeded ${this.CONFIG.EMERGENCY_LOSS_THRESHOLD * 100}%`);
      
    } else if (lossRatio > this.CONFIG.MAX_UNREALIZED_LOSS) {
      this.createAlert({
        positionId: position.id,
        alertType: 'excessive_loss',
        severity: 'high',
        description: `High unrealized loss: ${(lossRatio * 100).toFixed(1)}%`
      });
    }
  }

  private checkForMaxHoldTime(position: Position, now: Date): void {
    const holdTime = now.getTime() - position.entryTime.getTime();
    const maxHoldTime = position.metadata.maxHoldTime * 60 * 1000; // Convert minutes to ms
    
    if (holdTime > maxHoldTime) {
      this.createAlert({
        positionId: position.id,
        alertType: 'max_hold_exceeded',
        severity: 'medium',
        description: `Position held longer than maximum allowed time (${Math.round(holdTime/3600000)} hours)`
      });

      // Suggest position review
      this.suggestPositionReview(position);
    }
  }

  private checkForMissingStopLoss(position: Position, now: Date): void {
    if (!position.stopLoss && position.metadata.riskLevel === 'high') {
      this.createAlert({
        positionId: position.id,
        alertType: 'no_stop_loss',
        severity: 'medium',
        description: 'High-risk position lacks stop-loss protection'
      });

      // Auto-add stop loss if enabled
      if (position.metadata.monitoringFlags.includes('auto_stop_loss')) {
        this.addEmergencyStopLoss(position);
      }
    }
  }

  private checkHeartbeat(position: Position, now: Date): void {
    const timeSinceHeartbeat = now.getTime() - position.metadata.lastHeartbeat.getTime();
    
    if (timeSinceHeartbeat > this.CONFIG.HEARTBEAT_TIMEOUT) {
      this.createAlert({
        positionId: position.id,
        alertType: 'heartbeat_lost',
        severity: 'medium',
        description: `Heartbeat lost from ${position.entity} for ${Math.round(timeSinceHeartbeat/60000)} minutes`
      });
    }
  }

  private performPositionSafetyCheck(position: Position): void {
    const now = new Date();
    
    // Immediate safety checks
    this.checkForExcessiveLoss(position, now);
    this.checkForMissingStopLoss(position, now);
    
    // Validate position parameters
    if (position.quantity <= 0) {
      console.warn(`⚠️ Invalid position quantity: ${position.quantity} for ${position.id}`);
    }
    
    if (position.entryPrice <= 0) {
      console.warn(`⚠️ Invalid entry price: ${position.entryPrice} for ${position.id}`);
    }
  }

  private createAlert(alertData: Omit<PositionAlert, 'id' | 'detectedAt' | 'actionTaken' | 'isResolved'>): void {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: PositionAlert = {
      ...alertData,
      id: alertId,
      detectedAt: new Date(),
      actionTaken: 'none',
      isResolved: false
    };

    this.alerts.set(alertId, alert);
    
    console.log(`🚨 Position alert [${alert.severity.toUpperCase()}]: ${alert.description}`);
  }

  private attemptEmergencyTransfer(position: Position): void {
    const emergencyContacts = position.metadata.emergencyContacts;
    
    if (emergencyContacts.length === 0) {
      console.warn(`⚠️ No emergency contacts available for orphaned position ${position.id}`);
      return;
    }

    // Try to transfer to first available emergency contact
    const newOwner = emergencyContacts[0];
    
    console.log(`🔄 Attempting to transfer orphaned position ${position.id} to ${newOwner}`);
    
    // Update position ownership
    position.entity = newOwner as any; // Type assertion for entity type
    position.metadata.lastHeartbeat = new Date();
    position.status = 'active';
    
    this.recordAction({
      positionId: position.id,
      actionType: 'transfer_ownership',
      executedBy: 'watchdog',
      parameters: { oldOwner: position.entity, newOwner },
      success: true
    });
  }

  private executeEmergencyStop(position: Position, reason: string): void {
    console.log(`🛑 Executing emergency stop for position ${position.id}: ${reason}`);
    
    // Mark position for emergency closure
    position.status = 'emergency';
    
    // In a real system, this would trigger immediate market order to close position
    this.closePosition(position.id, 'watchdog', `Emergency stop: ${reason}`);
    
    this.recordAction({
      positionId: position.id,
      actionType: 'emergency_close',
      executedBy: 'watchdog',
      parameters: { reason, lossRatio: Math.abs(position.unrealizedPnL) / (position.quantity * position.entryPrice) },
      success: true
    });
  }

  private addEmergencyStopLoss(position: Position): void {
    // Calculate reasonable stop loss (5% below entry for long, 5% above for short)
    const stopLossDistance = 0.05;
    const stopLossPrice = position.side === 'LONG'
      ? position.entryPrice * (1 - stopLossDistance)
      : position.entryPrice * (1 + stopLossDistance);

    position.stopLoss = stopLossPrice;
    
    console.log(`🛡️ Added emergency stop loss at ${stopLossPrice} for position ${position.id}`);
    
    this.recordAction({
      positionId: position.id,
      actionType: 'add_stop_loss',
      executedBy: 'watchdog',
      parameters: { stopLossPrice, distance: stopLossDistance },
      success: true
    });
  }

  private suggestPositionReview(position: Position): void {
    console.log(`📋 Position ${position.id} requires review - held for ${Math.round((Date.now() - position.entryTime.getTime()) / 3600000)} hours`);
    
    // In a real system, this might trigger notifications to traders/administrators
  }

  private recordAction(actionData: Omit<WatchdogAction, 'id' | 'executedAt'>): void {
    const action: WatchdogAction = {
      ...actionData,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      executedAt: new Date()
    };

    this.actionHistory.push(action);
    
    // Keep only last 1000 actions
    if (this.actionHistory.length > 1000) {
      this.actionHistory = this.actionHistory.slice(-1000);
    }
  }

  private cleanupResolvedAlerts(): void {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    this.alerts.forEach((alert, alertId) => {
      if (alert.isResolved && alert.resolvedAt && alert.resolvedAt < cutoffTime) {
        this.alerts.delete(alertId);
      }
    });
  }

  public getPositionStatus(positionId: string): Position | undefined {
    return this.positions.get(positionId);
  }

  public getAllPositions(entity?: string): Position[] {
    const positions = Array.from(this.positions.values());
    return entity ? positions.filter(p => p.entity === entity) : positions;
  }

  public getActiveAlerts(positionId?: string): PositionAlert[] {
    const alerts = Array.from(this.alerts.values()).filter(a => !a.isResolved);
    return positionId ? alerts.filter(a => a.positionId === positionId) : alerts;
  }

  public resolveAlert(alertId: string, actionTaken: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.isResolved = true;
    alert.resolvedAt = new Date();
    alert.actionTaken = actionTaken;

    console.log(`✅ Resolved alert ${alertId}: ${actionTaken}`);
    return true;
  }

  public getWatchdogStatistics(): {
    totalPositions: number;
    activePositions: number;
    orphanedPositions: number;
    stalePositions: number;
    emergencyPositions: number;
    totalAlerts: number;
    activeAlerts: number;
    actionsToday: number;
    entitiesMonitored: string[];
  } {
    
    const positions = Array.from(this.positions.values());
    const alerts = Array.from(this.alerts.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const actionsToday = this.actionHistory.filter(a => a.executedAt >= today).length;
    const entities = Array.from(new Set(positions.map(p => p.entity)));

    return {
      totalPositions: positions.length,
      activePositions: positions.filter(p => p.status === 'active').length,
      orphanedPositions: positions.filter(p => p.status === 'orphaned').length,
      stalePositions: positions.filter(p => p.status === 'stale').length,
      emergencyPositions: positions.filter(p => p.status === 'emergency').length,
      totalAlerts: alerts.length,
      activeAlerts: alerts.filter(a => !a.isResolved).length,
      actionsToday,
      entitiesMonitored: entities
    };
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      console.log('👁️ Position watchdog monitoring stopped');
    }
  }
}

// Export singleton instance
let positionWatchdogInstance: PositionWatchdog | null = null;

export function getPositionWatchdog(): PositionWatchdog {
  if (!positionWatchdogInstance) {
    positionWatchdogInstance = new PositionWatchdog();
  }
  return positionWatchdogInstance;
}