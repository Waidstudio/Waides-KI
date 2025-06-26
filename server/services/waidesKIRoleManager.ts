/**
 * WAIDES META-GUARDIAN NETWORK: Dynamic Role Manager
 * Assigns operational roles based on node performance and network needs
 */

interface NodePerformance {
  node_id: string;
  uptime_percentage: number;
  response_time_avg: number;
  successful_trades: number;
  failed_trades: number;
  consensus_accuracy: number;
  last_seen: number;
  reliability_score: number;
}

interface RoleAssignment {
  node_id: string;
  role: NodeRole;
  assigned_at: number;
  performance_threshold: number;
  role_specific_metrics: Record<string, any>;
}

type NodeRole = 'leader' | 'validator' | 'mediator' | 'observer' | 'sentinel' | 'guardian';

interface RoleRequirements {
  min_uptime: number;
  min_reliability: number;
  min_trades: number;
  max_response_time: number;
  special_requirements?: Record<string, any>;
}

export class WaidesKIRoleManager {
  private roleAssignments: Map<string, RoleAssignment> = new Map();
  private nodePerformance: Map<string, NodePerformance> = new Map();
  private roleRequirements: Map<NodeRole, RoleRequirements> = new Map();
  
  constructor() {
    this.initializeRoleRequirements();
    this.startPerformanceMonitoring();
  }

  /**
   * Initialize role requirements and thresholds
   */
  private initializeRoleRequirements(): void {
    this.roleRequirements.set('leader', {
      min_uptime: 95,
      min_reliability: 90,
      min_trades: 100,
      max_response_time: 200,
      special_requirements: { leadership_score: 85 }
    });

    this.roleRequirements.set('validator', {
      min_uptime: 90,
      min_reliability: 85,
      min_trades: 50,
      max_response_time: 300,
      special_requirements: { consensus_accuracy: 80 }
    });

    this.roleRequirements.set('mediator', {
      min_uptime: 85,
      min_reliability: 80,
      min_trades: 25,
      max_response_time: 400,
      special_requirements: { conflict_resolution: 75 }
    });

    this.roleRequirements.set('guardian', {
      min_uptime: 88,
      min_reliability: 82,
      min_trades: 30,
      max_response_time: 350,
      special_requirements: { protection_efficiency: 78 }
    });

    this.roleRequirements.set('sentinel', {
      min_uptime: 92,
      min_reliability: 87,
      min_trades: 40,
      max_response_time: 250,
      special_requirements: { monitoring_accuracy: 85 }
    });

    this.roleRequirements.set('observer', {
      min_uptime: 70,
      min_reliability: 60,
      min_trades: 0,
      max_response_time: 1000
    });
  }

  /**
   * Assign role to a node based on performance
   */
  async assignRole(nodeId: string, suggestedRole?: NodeRole): Promise<{ 
    success: boolean; 
    assigned_role?: NodeRole; 
    previous_role?: NodeRole;
    error?: string;
  }> {
    try {
      const performance = this.nodePerformance.get(nodeId);
      
      if (!performance) {
        // New node starts as observer
        const assignment: RoleAssignment = {
          node_id: nodeId,
          role: 'observer',
          assigned_at: Date.now(),
          performance_threshold: 60,
          role_specific_metrics: {}
        };
        
        this.roleAssignments.set(nodeId, assignment);
        console.log(`🎭 Role Manager: Assigned observer role to new node ${nodeId}`);
        
        return { success: true, assigned_role: 'observer' };
      }

      const currentAssignment = this.roleAssignments.get(nodeId);
      const previousRole = currentAssignment?.role;
      
      // Determine best role based on performance
      const bestRole = suggestedRole || this.determineBestRole(performance);
      
      if (this.meetsRoleRequirements(performance, bestRole)) {
        const assignment: RoleAssignment = {
          node_id: nodeId,
          role: bestRole,
          assigned_at: Date.now(),
          performance_threshold: this.roleRequirements.get(bestRole)?.min_reliability || 60,
          role_specific_metrics: this.calculateRoleMetrics(performance, bestRole)
        };
        
        this.roleAssignments.set(nodeId, assignment);
        
        if (previousRole !== bestRole) {
          console.log(`🎭 Role Manager: ${nodeId} promoted from ${previousRole} to ${bestRole}`);
        }
        
        return { 
          success: true, 
          assigned_role: bestRole, 
          previous_role: previousRole 
        };
      } else {
        return { 
          success: false, 
          error: `Node ${nodeId} does not meet requirements for ${bestRole} role` 
        };
      }
    } catch (error) {
      return { success: false, error: `Failed to assign role: ${error}` };
    }
  }

  /**
   * Determine the best role for a node based on performance
   */
  private determineBestRole(performance: NodePerformance): NodeRole {
    // Sort roles by requirements (highest to lowest)
    const roleHierarchy: NodeRole[] = ['leader', 'sentinel', 'validator', 'guardian', 'mediator', 'observer'];
    
    for (const role of roleHierarchy) {
      if (this.meetsRoleRequirements(performance, role)) {
        return role;
      }
    }
    
    return 'observer';
  }

  /**
   * Check if node meets requirements for a specific role
   */
  private meetsRoleRequirements(performance: NodePerformance, role: NodeRole): boolean {
    const requirements = this.roleRequirements.get(role);
    if (!requirements) return false;

    return (
      performance.uptime_percentage >= requirements.min_uptime &&
      performance.reliability_score >= requirements.min_reliability &&
      performance.successful_trades >= requirements.min_trades &&
      performance.response_time_avg <= requirements.max_response_time
    );
  }

  /**
   * Calculate role-specific metrics
   */
  private calculateRoleMetrics(performance: NodePerformance, role: NodeRole): Record<string, any> {
    const baseMetrics = {
      performance_score: performance.reliability_score,
      trade_success_rate: performance.successful_trades / Math.max(1, performance.successful_trades + performance.failed_trades),
      responsiveness: Math.max(0, 100 - (performance.response_time_avg / 10))
    };

    switch (role) {
      case 'leader':
        return {
          ...baseMetrics,
          leadership_capability: this.calculateLeadershipScore(performance),
          decision_authority: 95,
          network_influence: 90
        };
        
      case 'validator':
        return {
          ...baseMetrics,
          validation_accuracy: performance.consensus_accuracy,
          verification_speed: Math.max(0, 100 - (performance.response_time_avg / 5)),
          trust_level: 85
        };
        
      case 'guardian':
        return {
          ...baseMetrics,
          protection_strength: this.calculateProtectionScore(performance),
          threat_detection: 80,
          response_readiness: 88
        };
        
      default:
        return baseMetrics;
    }
  }

  /**
   * Calculate leadership capability score
   */
  private calculateLeadershipScore(performance: NodePerformance): number {
    const uptimeWeight = performance.uptime_percentage * 0.3;
    const reliabilityWeight = performance.reliability_score * 0.4;
    const responsivenessWeight = Math.max(0, 100 - performance.response_time_avg / 2) * 0.3;
    
    return Math.min(100, uptimeWeight + reliabilityWeight + responsivenessWeight);
  }

  /**
   * Calculate protection capability score
   */
  private calculateProtectionScore(performance: NodePerformance): number {
    const consensusWeight = performance.consensus_accuracy * 0.4;
    const reliabilityWeight = performance.reliability_score * 0.3;
    const responsivenessWeight = Math.max(0, 100 - performance.response_time_avg / 3) * 0.3;
    
    return Math.min(100, consensusWeight + reliabilityWeight + responsivenessWeight);
  }

  /**
   * Update node performance metrics
   */
  updateNodePerformance(
    nodeId: string, 
    metrics: Partial<NodePerformance>
  ): void {
    const existing = this.nodePerformance.get(nodeId) || {
      node_id: nodeId,
      uptime_percentage: 0,
      response_time_avg: 1000,
      successful_trades: 0,
      failed_trades: 0,
      consensus_accuracy: 0,
      last_seen: Date.now(),
      reliability_score: 0
    };

    const updated: NodePerformance = {
      ...existing,
      ...metrics,
      last_seen: Date.now(),
      reliability_score: this.calculateReliabilityScore({ ...existing, ...metrics })
    };

    this.nodePerformance.set(nodeId, updated);
    
    // Trigger role reassessment if significant change
    if (Math.abs(updated.reliability_score - existing.reliability_score) > 10) {
      this.assignRole(nodeId);
    }
  }

  /**
   * Calculate overall reliability score
   */
  private calculateReliabilityScore(performance: NodePerformance): number {
    const uptimeWeight = performance.uptime_percentage * 0.25;
    const successRateWeight = (performance.successful_trades / Math.max(1, performance.successful_trades + performance.failed_trades)) * 100 * 0.3;
    const responsivenessWeight = Math.max(0, 100 - performance.response_time_avg / 10) * 0.25;
    const consensusWeight = performance.consensus_accuracy * 0.2;
    
    return Math.min(100, uptimeWeight + successRateWeight + responsivenessWeight + consensusWeight);
  }

  /**
   * Get role assignment for a node
   */
  getRole(nodeId: string): NodeRole {
    const assignment = this.roleAssignments.get(nodeId);
    return assignment?.role || 'observer';
  }

  /**
   * Get detailed role assignment information
   */
  getRoleAssignment(nodeId: string): RoleAssignment | null {
    return this.roleAssignments.get(nodeId) || null;
  }

  /**
   * Get all role assignments
   */
  getAllRoleAssignments(): { assignments: RoleAssignment[]; role_distribution: Record<NodeRole, number> } {
    const assignments = Array.from(this.roleAssignments.values());
    
    const roleDistribution: Record<NodeRole, number> = {
      leader: 0,
      validator: 0,
      mediator: 0,
      observer: 0,
      sentinel: 0,
      guardian: 0
    };
    
    assignments.forEach(assignment => {
      roleDistribution[assignment.role]++;
    });
    
    return { assignments, role_distribution: roleDistribution };
  }

  /**
   * Get nodes by role
   */
  getNodesByRole(role: NodeRole): string[] {
    return Array.from(this.roleAssignments.values())
      .filter(assignment => assignment.role === role)
      .map(assignment => assignment.node_id);
  }

  /**
   * Demote node due to poor performance
   */
  async demoteNode(nodeId: string, reason: string): Promise<{ success: boolean; new_role?: NodeRole; error?: string }> {
    try {
      const currentAssignment = this.roleAssignments.get(nodeId);
      if (!currentAssignment) {
        return { success: false, error: 'Node not found' };
      }

      const roleHierarchy: NodeRole[] = ['leader', 'sentinel', 'validator', 'guardian', 'mediator', 'observer'];
      const currentIndex = roleHierarchy.indexOf(currentAssignment.role);
      
      if (currentIndex < roleHierarchy.length - 1) {
        const newRole = roleHierarchy[currentIndex + 1];
        
        const result = await this.assignRole(nodeId, newRole);
        if (result.success) {
          console.log(`⬇️ Role Manager: Demoted ${nodeId} from ${currentAssignment.role} to ${newRole} - Reason: ${reason}`);
          return { success: true, new_role: newRole };
        }
      }
      
      return { success: false, error: 'Cannot demote further' };
    } catch (error) {
      return { success: false, error: `Demotion failed: ${error}` };
    }
  }

  /**
   * Get network role health statistics
   */
  getNetworkRoleHealth(): any {
    const assignments = Array.from(this.roleAssignments.values());
    const totalNodes = assignments.length;
    
    if (totalNodes === 0) {
      return { status: 'empty', message: 'No nodes registered' };
    }
    
    const roleDistribution = this.getAllRoleAssignments().role_distribution;
    const leaderCount = roleDistribution.leader;
    const validatorCount = roleDistribution.validator;
    
    let healthStatus = 'excellent';
    const issues = [];
    
    if (leaderCount === 0) {
      healthStatus = 'critical';
      issues.push('No leader nodes available');
    } else if (leaderCount > 3) {
      healthStatus = 'warning';
      issues.push('Too many leader nodes');
    }
    
    if (validatorCount < 2) {
      healthStatus = 'warning';
      issues.push('Insufficient validator nodes');
    }
    
    const observerRatio = roleDistribution.observer / totalNodes;
    if (observerRatio > 0.6) {
      healthStatus = 'degraded';
      issues.push('Too many observer nodes');
    }
    
    return {
      status: healthStatus,
      total_nodes: totalNodes,
      role_distribution: roleDistribution,
      issues,
      network_capability: this.calculateNetworkCapability()
    };
  }

  /**
   * Calculate overall network capability
   */
  private calculateNetworkCapability(): number {
    const assignments = Array.from(this.roleAssignments.values());
    if (assignments.length === 0) return 0;
    
    const roleWeights = {
      leader: 20,
      sentinel: 15,
      validator: 12,
      guardian: 10,
      mediator: 8,
      observer: 3
    };
    
    const totalCapability = assignments.reduce((sum, assignment) => {
      const performance = this.nodePerformance.get(assignment.node_id);
      const roleWeight = roleWeights[assignment.role];
      const nodeCapability = performance ? performance.reliability_score : 50;
      
      return sum + (roleWeight * nodeCapability / 100);
    }, 0);
    
    const maxPossibleCapability = assignments.length * 20; // All leaders at 100% performance
    return Math.min(100, (totalCapability / maxPossibleCapability) * 100);
  }

  /**
   * Start periodic performance monitoring and role reassessment
   */
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.performRoleReassessment();
      this.cleanupInactiveNodes();
    }, 60000); // Check every minute
  }

  /**
   * Perform periodic role reassessment
   */
  private performRoleReassessment(): void {
    for (const [nodeId, performance] of this.nodePerformance.entries()) {
      const currentRole = this.getRole(nodeId);
      const optimalRole = this.determineBestRole(performance);
      
      if (currentRole !== optimalRole) {
        this.assignRole(nodeId, optimalRole);
      }
    }
  }

  /**
   * Remove inactive nodes
   */
  private cleanupInactiveNodes(): void {
    const now = Date.now();
    const inactiveThreshold = 10 * 60 * 1000; // 10 minutes
    
    for (const [nodeId, performance] of this.nodePerformance.entries()) {
      if (now - performance.last_seen > inactiveThreshold) {
        this.nodePerformance.delete(nodeId);
        this.roleAssignments.delete(nodeId);
        console.log(`🗑️ Role Manager: Removed inactive node ${nodeId}`);
      }
    }
  }
}

export const waidesKIRoleManager = new WaidesKIRoleManager();