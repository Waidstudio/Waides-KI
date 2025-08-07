/**
 * KonsAi Mesh Control Center - Unified Interface for All Mesh Systems
 * Orchestrates security, reliability, broadcasting, and communication protocols
 */

import { getKonsAiMeshSecurity, AuthenticationResult } from './konsaiMeshSecurityLayer';
import { getKonsAiMeshReliability, HeartbeatStatus, LatencyMetrics, LoadBalancingStatus } from './konsaiMeshReliabilityLayer';
import { getKonsAiAdvancedBroadcast, SystemWideAlert, InterventionAction, BotRedeployment, ProfitBroadcast } from './konsaiAdvancedBroadcastSystem';
import { getKonsAiMeshCommunicationContracts, MessageEnvelope } from './konsaiMeshCommunicationContracts';
import { EventEmitter } from 'events';

export interface MeshSystemStatus {
  security: {
    activeSessions: number;
    authenticatedEntities: string[];
    encryptionStatus: string;
    securityLevel: string;
  };
  reliability: {
    systemHealth: number;
    heartbeatStatuses: Record<string, HeartbeatStatus>;
    latencyMetrics: Record<string, LatencyMetrics>;
    loadBalancing: LoadBalancingStatus;
  };
  broadcasting: {
    activeAlerts: number;
    activeInterventions: number;
    recentProfitBroadcasts: ProfitBroadcast[];
    systemCapabilities: any;
  };
  contracts: {
    totalContracts: number;
    activeProtocols: number;
    messageLog: MessageEnvelope[];
  };
  overall: {
    meshHealth: number;
    spiritualAlignment: number;
    operationalStatus: 'optimal' | 'degraded' | 'critical' | 'offline';
    lastHealthCheck: number;
  };
}

export interface EntityCommunicationRequest {
  fromEntity: string;
  toEntity: string;
  messageType: string;
  payload: any;
  priority: 'low' | 'normal' | 'high' | 'critical' | 'divine';
  requiresAuth: boolean;
  contractName?: string;
}

export interface SystemWideOperation {
  type: 'alert' | 'intervention' | 'redeployment' | 'governance_update';
  initiator: string;
  targetEntities: string[];
  parameters: any;
  spiritualJustification: string;
  requiresConsensus: boolean;
}

export class KonsAiMeshControlCenter extends EventEmitter {
  private securityLayer = getKonsAiMeshSecurity();
  private reliabilityLayer = getKonsAiMeshReliability();
  private broadcastSystem = getKonsAiAdvancedBroadcast();
  private communicationContracts = getKonsAiMeshCommunicationContracts();
  
  private isInitialized = false;
  private lastHealthCheck = Date.now();
  private healthCheckInterval = 60000; // 1 minute

  constructor() {
    super();
    this.initializeControlCenter();
  }

  /**
   * Initialize mesh control center
   */
  private initializeControlCenter(): void {
    if (this.isInitialized) return;

    // Setup event forwarding from subsystems
    this.setupEventForwarding();
    
    // Start health monitoring
    this.startHealthMonitoring();
    
    this.isInitialized = true;
    console.log('🎛️ KonsAi Mesh Control Center initialized - Unified mesh management active');
  }

  /**
   * Authenticate entity with comprehensive validation
   */
  public async authenticateEntity(entityId: string, spiritualAlignment: number, karmaScore: number): Promise<AuthenticationResult> {
    try {
      const authResult = await this.securityLayer.authenticateBot(entityId, spiritualAlignment, karmaScore);
      
      if (authResult.authenticated) {
        // Start heartbeat monitoring for authenticated entity
        this.reliabilityLayer.receiveHeartbeat(entityId, 0);
        
        // Broadcast authentication success
        await this.broadcastSystem.broadcastSystemAlert({
          type: 'security',
          severity: 'info',
          title: 'Entity Authentication',
          message: `${entityId} authenticated successfully with ${authResult.authLevel} access`,
          affectedEntities: [entityId],
          spiritualImplication: 'Positive spiritual alignment maintained',
          karmaImpact: 0.1
        });
      }

      return authResult;
    } catch (error) {
      console.error(`Authentication error for ${entityId}:`, error);
      throw error;
    }
  }

  /**
   * Send secure message between entities
   */
  public async sendSecureMessage(request: EntityCommunicationRequest): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Validate authentication if required
      if (request.requiresAuth) {
        const securityStatus = this.securityLayer.getSecurityStatus();
        if (!securityStatus.authenticatedEntities.includes(request.fromEntity)) {
          return { success: false, error: 'Sender not authenticated' };
        }
      }

      // Create message envelope using communication contracts
      const contractName = request.contractName || 'EntityTradingProtocol';
      const envelope = this.communicationContracts.createMessageEnvelope(
        contractName,
        request.messageType,
        request.fromEntity,
        request.toEntity,
        request.payload
      );

      // Send with retry mechanism
      const meshMessage = {
        id: envelope.header.messageId,
        fromEntityId: request.fromEntity,
        toEntityId: request.toEntity,
        type: request.messageType as any,
        payload: request.payload,
        timestamp: Date.now(),
        retryCount: 0,
        priority: request.priority,
        requiresAck: true
      };

      const success = await this.reliabilityLayer.sendMessageWithRetry(meshMessage);
      
      if (success) {
        return { success: true, messageId: envelope.header.messageId };
      } else {
        return { success: false, error: 'Message delivery failed after retries' };
      }
    } catch (error) {
      console.error('Secure message error:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Execute system-wide operation
   */
  public async executeSystemWideOperation(operation: SystemWideOperation): Promise<{ success: boolean; operationId?: string; results?: any[] }> {
    try {
      let operationId: string;
      const results: any[] = [];

      switch (operation.type) {
        case 'alert':
          operationId = await this.broadcastSystem.broadcastSystemAlert({
            type: operation.parameters.type,
            severity: operation.parameters.severity,
            title: operation.parameters.title,
            message: operation.parameters.message,
            affectedEntities: operation.targetEntities,
            actionRequired: operation.parameters.actionRequired,
            suggestedActions: operation.parameters.suggestedActions,
            spiritualImplication: operation.spiritualJustification,
            karmaImpact: operation.parameters.karmaImpact
          });
          results.push({ type: 'alert_broadcast', id: operationId });
          break;

        case 'intervention':
          for (const entityId of operation.targetEntities) {
            const success = await this.broadcastSystem.interventMidTrade(
              entityId,
              operation.parameters.interventionType,
              operation.parameters.reason,
              operation.parameters
            );
            results.push({ entityId, intervention: success });
          }
          operationId = `intervention_${Date.now()}`;
          break;

        case 'redeployment':
          const deploymentPromises = operation.targetEntities.map(entityId => 
            this.broadcastSystem.redeployBot(entityId, operation.parameters.reason, operation.parameters.targetVersion)
          );
          const deploymentIds = await Promise.all(deploymentPromises);
          results.push(...deploymentIds.map((id, index) => ({ 
            entityId: operation.targetEntities[index], 
            deploymentId: id 
          })));
          operationId = `redeployment_${Date.now()}`;
          break;

        case 'governance_update':
          operationId = await this.broadcastSystem.updateMeshGovernance(
            operation.parameters.changes,
            operation.parameters.spiritualEnhancements,
            operation.parameters.securityUpdates
          );
          results.push({ type: 'governance_update', version: operationId });
          break;

        default:
          throw new Error(`Unknown operation type: ${operation.type}`);
      }

      this.emit('systemWideOperation', { operation, operationId, results });
      return { success: true, operationId, results };
    } catch (error) {
      console.error('System-wide operation error:', error);
      return { success: false };
    }
  }

  /**
   * Check if entity should be isolated
   */
  public checkEntityIsolation(entityId: string): { shouldIsolate: boolean; reason?: string } {
    return this.securityLayer.checkBotIsolation(entityId);
  }

  /**
   * Detect mesh timeout for entity
   */
  public detectMeshTimeout(entityId: string): boolean {
    return this.reliabilityLayer.detectMeshTimeout(entityId);
  }

  /**
   * Get comprehensive mesh status
   */
  public getMeshSystemStatus(): MeshSystemStatus {
    const securityStatus = this.securityLayer.getSecurityStatus();
    const reliabilityStatus = this.reliabilityLayer.getReliabilityStatus();
    const broadcastStatus = this.broadcastSystem.getBroadcastSystemStatus();
    const contractStatus = this.communicationContracts.getContractStatus();

    const meshHealth = this.calculateOverallMeshHealth(securityStatus, reliabilityStatus, broadcastStatus);
    const spiritualAlignment = broadcastStatus.spiritualStatus || 0.8;
    const operationalStatus = this.determineOperationalStatus(meshHealth);

    return {
      security: {
        activeSessions: securityStatus.activeSessions,
        authenticatedEntities: securityStatus.authenticatedEntities,
        encryptionStatus: securityStatus.encryptionStatus,
        securityLevel: securityStatus.securityLevel
      },
      reliability: {
        systemHealth: reliabilityStatus.systemHealth,
        heartbeatStatuses: reliabilityStatus.heartbeatStatuses,
        latencyMetrics: reliabilityStatus.latencyMetrics,
        loadBalancing: reliabilityStatus.loadBalancing
      },
      broadcasting: {
        activeAlerts: broadcastStatus.activeAlerts,
        activeInterventions: broadcastStatus.activeInterventions,
        recentProfitBroadcasts: broadcastStatus.recentProfitBroadcasts,
        systemCapabilities: broadcastStatus.systemCapabilities
      },
      contracts: {
        totalContracts: contractStatus.totalContracts,
        activeProtocols: contractStatus.activeProtocols,
        messageLog: contractStatus.messageLog
      },
      overall: {
        meshHealth,
        spiritualAlignment,
        operationalStatus,
        lastHealthCheck: this.lastHealthCheck
      }
    };
  }

  /**
   * Handle emergency mesh shutdown
   */
  public async emergencyMeshShutdown(reason: string, initiator: string): Promise<void> {
    console.log(`🚨 EMERGENCY MESH SHUTDOWN: ${reason} (Initiated by: ${initiator})`);
    
    // Broadcast emergency alert
    await this.broadcastSystem.broadcastSystemAlert({
      type: 'emergency',
      severity: 'critical',
      title: 'Emergency Mesh Shutdown',
      message: `Mesh shutdown initiated: ${reason}`,
      affectedEntities: [],
      actionRequired: true,
      suggestedActions: ['Contact system administrator', 'Check system logs', 'Prepare for manual intervention'],
      spiritualImplication: 'System protection activated - cosmic balance preserved',
      karmaImpact: 0.0
    });

    // Emergency stop all entities
    const authenticatedEntities = this.securityLayer.getSecurityStatus().authenticatedEntities;
    for (const entityId of authenticatedEntities) {
      await this.broadcastSystem.interventMidTrade(entityId, 'emergency_stop', reason);
    }

    this.emit('emergencyShutdown', { reason, initiator, timestamp: Date.now() });
  }

  /**
   * Restore mesh operations after emergency
   */
  public async restoreMeshOperations(approvedBy: string): Promise<void> {
    console.log(`🔄 MESH RESTORATION: Operations restored by ${approvedBy}`);
    
    await this.broadcastSystem.broadcastSystemAlert({
      type: 'system',
      severity: 'info',
      title: 'Mesh Operations Restored',
      message: `Normal operations resumed under authorization of ${approvedBy}`,
      affectedEntities: [],
      spiritualImplication: 'System harmony restored - divine order maintained',
      karmaImpact: 0.2
    });

    this.emit('meshRestored', { approvedBy, timestamp: Date.now() });
  }

  // Private helper methods
  private setupEventForwarding(): void {
    // Forward important events from subsystems
    this.securityLayer.on('botAuthenticated', (data) => this.emit('entityAuthenticated', data));
    this.securityLayer.on('botIsolated', (data) => this.emit('entityIsolated', data));
    
    this.reliabilityLayer.on('entityDead', (data) => this.emit('entityFailure', data));
    this.reliabilityLayer.on('entityRecovered', (data) => this.emit('entityRecovered', data));
    this.reliabilityLayer.on('meshOverload', (data) => this.emit('meshOverload', data));
    
    this.broadcastSystem.on('alertBroadcast', (data) => this.emit('alertBroadcast', data));
    this.broadcastSystem.on('profitBroadcast', (data) => this.emit('profitBroadcast', data));
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthCheck();
    }, this.healthCheckInterval);
  }

  private performHealthCheck(): void {
    this.lastHealthCheck = Date.now();
    const status = this.getMeshSystemStatus();
    
    // Check for critical conditions
    if (status.overall.operationalStatus === 'critical') {
      this.emit('criticalHealthStatus', status);
    }
    
    // Check for degraded performance
    if (status.overall.meshHealth < 0.5) {
      this.emit('degradedPerformance', status);
    }

    this.emit('healthCheckComplete', status);
  }

  private calculateOverallMeshHealth(security: any, reliability: any, broadcast: any): number {
    const securityHealth = security.encryptionStatus === 'ACTIVE' ? 1.0 : 0.5;
    const reliabilityHealth = reliability.systemHealth || 0.0;
    const broadcastHealth = broadcast.systemCapabilities ? 1.0 : 0.0;
    
    return (securityHealth * 0.3 + reliabilityHealth * 0.5 + broadcastHealth * 0.2);
  }

  private determineOperationalStatus(meshHealth: number): 'optimal' | 'degraded' | 'critical' | 'offline' {
    if (meshHealth >= 0.9) return 'optimal';
    if (meshHealth >= 0.6) return 'degraded';
    if (meshHealth >= 0.3) return 'critical';
    return 'offline';
  }
}

// Singleton instance
let meshControlCenterInstance: KonsAiMeshControlCenter | null = null;

export function getKonsAiMeshControlCenter(): KonsAiMeshControlCenter {
  if (!meshControlCenterInstance) {
    meshControlCenterInstance = new KonsAiMeshControlCenter();
  }
  return meshControlCenterInstance;
}