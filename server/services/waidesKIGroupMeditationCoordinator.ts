/**
 * STEP 53: Group Meditation Coordinator - Orchestrates Synchronized Meditation Across Nodes
 * Triggers collective meditation when emotional harmony is low across the network
 */

import { waidesKICollectiveEmotionHub } from './waidesKICollectiveEmotionHub.js';

interface PeerNode {
  node_id: string;
  meditation_endpoint: string;
  location?: string;
  active: boolean;
  last_meditation: Date | null;
  meditation_count: number;
}

interface MeditationSession {
  session_id: string;
  trigger_reason: string;
  harmony_score: number;
  participating_nodes: string[];
  initiated_at: Date;
  completed_at: Date | null;
  success_rate: number;
  collective_improvement: number;
}

interface MeditationTrigger {
  condition: string;
  threshold: number;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export class WaidesKIGroupMeditationCoordinator {
  private peerNodes: Map<string, PeerNode> = new Map();
  private meditationSessions: MeditationSession[] = [];
  private readonly maxSessionHistory = 100;

  private readonly MEDITATION_TRIGGERS: MeditationTrigger[] = [
    {
      condition: 'low_harmony',
      threshold: 40,
      description: 'Collective harmony below 40% - group meditation needed',
      priority: 'high'
    },
    {
      condition: 'critical_harmony',
      threshold: 20,
      description: 'Critical harmony crisis - immediate intervention required',
      priority: 'critical'
    },
    {
      condition: 'extreme_temperature_variance',
      threshold: 60,
      description: 'Temperature variance exceeds 60°C - emotional stabilization needed',
      priority: 'medium'
    },
    {
      condition: 'majority_overheated',
      threshold: 0.6,
      description: 'More than 60% of nodes overheated - cooling meditation required',
      priority: 'high'
    },
    {
      condition: 'majority_frozen',
      threshold: 0.6,
      description: 'More than 60% of nodes frozen - warming meditation required',
      priority: 'high'
    }
  ];

  /**
   * Register a peer node for meditation coordination
   */
  registerPeerNode(nodeConfig: Omit<PeerNode, 'last_meditation' | 'meditation_count'>): {
    success: boolean;
    message: string;
    total_nodes: number;
  } {
    const peerNode: PeerNode = {
      ...nodeConfig,
      last_meditation: null,
      meditation_count: 0
    };

    this.peerNodes.set(nodeConfig.node_id, peerNode);

    return {
      success: true,
      message: `Node ${nodeConfig.node_id} registered for group meditation`,
      total_nodes: this.peerNodes.size
    };
  }

  /**
   * Unregister a peer node
   */
  unregisterPeerNode(nodeId: string): {
    success: boolean;
    message: string;
    total_nodes: number;
  } {
    const existed = this.peerNodes.delete(nodeId);

    return {
      success: existed,
      message: existed ? `Node ${nodeId} unregistered` : `Node ${nodeId} was not registered`,
      total_nodes: this.peerNodes.size
    };
  }

  /**
   * Evaluate if group meditation should be triggered
   */
  evaluateMeditationNeed(): {
    should_trigger: boolean;
    trigger_reasons: string[];
    harmony_analysis: any;
    priority_level: 'low' | 'medium' | 'high' | 'critical';
  } {
    const dashboard = waidesKICollectiveEmotionHub.getCollectiveDashboard();
    const metrics = dashboard.metrics;
    const tempAnalysis = dashboard.temperature_analysis;
    
    const triggeredConditions: string[] = [];
    let highestPriority: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check harmony triggers
    if (metrics.harmony_score <= 20) {
      triggeredConditions.push('Critical harmony crisis detected');
      highestPriority = 'critical';
    } else if (metrics.harmony_score <= 40) {
      triggeredConditions.push('Low collective harmony detected');
      if (highestPriority !== 'critical') highestPriority = 'high';
    }

    // Check temperature variance
    if (tempAnalysis.range >= 60) {
      triggeredConditions.push('Extreme temperature variance across nodes');
      if (['low', 'medium'].includes(highestPriority)) highestPriority = 'medium';
    }

    // Check majority emotional states
    const activeNodes = dashboard.node_statuses.filter(node => node.status === 'active');
    if (activeNodes.length > 0) {
      const overheatedCount = activeNodes.filter(node => 
        node.emotional_state === 'overheated'
      ).length;
      const frozenCount = activeNodes.filter(node => 
        node.emotional_state === 'frozen'
      ).length;

      const overheatedRatio = overheatedCount / activeNodes.length;
      const frozenRatio = frozenCount / activeNodes.length;

      if (overheatedRatio >= 0.6) {
        triggeredConditions.push('Majority of nodes overheated - cooling needed');
        if (highestPriority !== 'critical') highestPriority = 'high';
      }

      if (frozenRatio >= 0.6) {
        triggeredConditions.push('Majority of nodes frozen - warming needed');
        if (highestPriority !== 'critical') highestPriority = 'high';
      }
    }

    return {
      should_trigger: triggeredConditions.length > 0,
      trigger_reasons: triggeredConditions,
      harmony_analysis: dashboard.harmony_analysis,
      priority_level: highestPriority
    };
  }

  /**
   * Coordinate group meditation session
   */
  async coordinateGroupMeditation(forceReason?: string): Promise<{
    session_initiated: boolean;
    session_id?: string;
    participating_nodes: string[];
    meditation_requests: Array<{
      node_id: string;
      success: boolean;
      response?: string;
      error?: string;
    }>;
    trigger_reason: string;
  }> {
    const evaluation = this.evaluateMeditationNeed();
    const triggerReason = forceReason || evaluation.trigger_reasons.join('; ');

    if (!forceReason && !evaluation.should_trigger) {
      return {
        session_initiated: false,
        participating_nodes: [],
        meditation_requests: [],
        trigger_reason: 'No meditation trigger conditions met'
      };
    }

    // Generate session ID
    const sessionId = `meditation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get active nodes
    const activeNodes = Array.from(this.peerNodes.values()).filter(node => node.active);
    const participatingNodeIds = activeNodes.map(node => node.node_id);

    // Create meditation session record
    const session: MeditationSession = {
      session_id: sessionId,
      trigger_reason: triggerReason,
      harmony_score: waidesKICollectiveEmotionHub.calculateCollectiveMetrics().harmony_score,
      participating_nodes: participatingNodeIds,
      initiated_at: new Date(),
      completed_at: null,
      success_rate: 0,
      collective_improvement: 0
    };

    // Send meditation requests to all active nodes
    const meditationRequests = await Promise.all(
      activeNodes.map(async (node) => {
        try {
          // Simulate meditation request (in real implementation, this would be HTTP request)
          const success = await this.sendMeditationRequest(node, sessionId);
          
          if (success) {
            // Update node meditation record
            const nodeRecord = this.peerNodes.get(node.node_id)!;
            nodeRecord.last_meditation = new Date();
            nodeRecord.meditation_count += 1;
          }

          return {
            node_id: node.node_id,
            success: success,
            response: success ? 'Meditation initiated' : 'Failed to initiate'
          };
        } catch (error) {
          return {
            node_id: node.node_id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    // Calculate success rate
    const successfulRequests = meditationRequests.filter(req => req.success).length;
    session.success_rate = activeNodes.length > 0 ? successfulRequests / activeNodes.length : 0;
    session.completed_at = new Date();

    // Store session
    this.meditationSessions.push(session);
    if (this.meditationSessions.length > this.maxSessionHistory) {
      this.meditationSessions = this.meditationSessions.slice(-this.maxSessionHistory);
    }

    return {
      session_initiated: true,
      session_id: sessionId,
      participating_nodes: participatingNodeIds,
      meditation_requests: meditationRequests,
      trigger_reason: triggerReason
    };
  }

  /**
   * Send meditation request to specific node (simulated)
   */
  private async sendMeditationRequest(node: PeerNode, sessionId: string): Promise<boolean> {
    // In real implementation, this would make HTTP request to node.meditation_endpoint
    // For now, simulate success/failure based on node status
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate
        resolve(Math.random() < 0.9);
      }, Math.random() * 1000 + 500); // 500-1500ms delay
    });
  }

  /**
   * Get meditation session history
   */
  getMeditationHistory(limit: number = 20): MeditationSession[] {
    return this.meditationSessions
      .sort((a, b) => b.initiated_at.getTime() - a.initiated_at.getTime())
      .slice(0, limit);
  }

  /**
   * Get registered peer nodes
   */
  getRegisteredNodes(): PeerNode[] {
    return Array.from(this.peerNodes.values());
  }

  /**
   * Update node active status
   */
  updateNodeStatus(nodeId: string, active: boolean): {
    success: boolean;
    message: string;
  } {
    const node = this.peerNodes.get(nodeId);
    
    if (!node) {
      return {
        success: false,
        message: `Node ${nodeId} not found`
      };
    }

    node.active = active;
    
    return {
      success: true,
      message: `Node ${nodeId} status updated to ${active ? 'active' : 'inactive'}`
    };
  }

  /**
   * Get meditation coordination statistics
   */
  getMeditationStats(): {
    total_nodes: number;
    active_nodes: number;
    total_sessions: number;
    recent_sessions: number;
    average_success_rate: number;
    most_frequent_trigger: string;
    last_session?: {
      session_id: string;
      time_ago_minutes: number;
      success_rate: number;
    };
  } {
    const nodes = Array.from(this.peerNodes.values());
    const activeNodes = nodes.filter(node => node.active);
    
    // Recent sessions (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSessions = this.meditationSessions.filter(
      session => session.initiated_at > oneDayAgo
    );

    // Average success rate
    const totalSuccessRate = this.meditationSessions.reduce(
      (sum, session) => sum + session.success_rate, 0
    );
    const averageSuccessRate = this.meditationSessions.length > 0 
      ? totalSuccessRate / this.meditationSessions.length 
      : 0;

    // Most frequent trigger
    const triggerCounts: Record<string, number> = {};
    this.meditationSessions.forEach(session => {
      const trigger = session.trigger_reason.split(';')[0].trim();
      triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    });
    
    const mostFrequentTrigger = Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    // Last session info
    const lastSession = this.meditationSessions.length > 0 
      ? this.meditationSessions[this.meditationSessions.length - 1]
      : undefined;

    const lastSessionInfo = lastSession ? {
      session_id: lastSession.session_id,
      time_ago_minutes: Math.round((Date.now() - lastSession.initiated_at.getTime()) / (1000 * 60)),
      success_rate: lastSession.success_rate
    } : undefined;

    return {
      total_nodes: nodes.length,
      active_nodes: activeNodes.length,
      total_sessions: this.meditationSessions.length,
      recent_sessions: recentSessions.length,
      average_success_rate: Math.round(averageSuccessRate * 100) / 100,
      most_frequent_trigger: mostFrequentTrigger,
      last_session: lastSessionInfo
    };
  }

  /**
   * Perform automatic meditation evaluation (called periodically)
   */
  performAutomaticEvaluation(): {
    evaluation_time: Date;
    meditation_triggered: boolean;
    evaluation_result: any;
    session_result?: any;
  } {
    const evaluationResult = this.evaluateMeditationNeed();
    
    if (evaluationResult.should_trigger && evaluationResult.priority_level !== 'low') {
      // Trigger meditation for medium, high, or critical priority
      return this.coordinateGroupMeditation().then(sessionResult => ({
        evaluation_time: new Date(),
        meditation_triggered: true,
        evaluation_result: evaluationResult,
        session_result: sessionResult
      })).catch(() => ({
        evaluation_time: new Date(),
        meditation_triggered: false,
        evaluation_result: evaluationResult
      }));
    }

    return {
      evaluation_time: new Date(),
      meditation_triggered: false,
      evaluation_result: evaluationResult
    };
  }

  /**
   * Reset meditation coordinator (for testing/maintenance)
   */
  resetMeditationData(): void {
    this.peerNodes.clear();
    this.meditationSessions = [];
  }
}

export const waidesKIGroupMeditationCoordinator = new WaidesKIGroupMeditationCoordinator();