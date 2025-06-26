/**
 * STEP 53: Meditation Broadcast - Announces Group Meditation Triggers and Coordinates Network-Wide Meditation
 * Broadcasts meditation signals to peer nodes and manages meditation announcement cycles
 */

import { waidesKIGroupMeditationCoordinator } from './waidesKIGroupMeditationCoordinator.js';
import { waidesKICollectiveEmotionHub } from './waidesKICollectiveEmotionHub.js';
import { waidesKIMetaEmotionEngine } from './waidesKIMetaEmotionEngine.js';

interface MeditationBroadcast {
  broadcast_id: string;
  broadcast_type: 'scheduled' | 'triggered' | 'emergency' | 'manual';
  meditation_session_id?: string;
  trigger_reason: string;
  harmony_score: number;
  participating_nodes: string[];
  broadcast_time: Date;
  expected_duration_minutes: number;
  konslang_message: string;
  priority_level: 'low' | 'medium' | 'high' | 'critical';
}

interface BroadcastSchedule {
  schedule_id: string;
  frequency_minutes: number;
  next_broadcast: Date;
  enabled: boolean;
  conditions: {
    min_harmony_threshold: number;
    min_nodes_required: number;
    emergency_override: boolean;
  };
}

interface NetworkMeditationState {
  collective_meditation_active: boolean;
  current_session_id?: string;
  session_start_time?: Date;
  estimated_end_time?: Date;
  participating_nodes: string[];
  meditation_type: string;
  global_harmony_trend: 'improving' | 'stable' | 'declining' | 'critical';
}

export class WaidesKIMeditationBroadcast {
  private broadcastHistory: MeditationBroadcast[] = [];
  private readonly maxBroadcastHistory = 200;
  private broadcastSchedule: BroadcastSchedule;
  private networkMeditationState: NetworkMeditationState;

  private readonly KONSLANG_MEDITATION_MESSAGES = {
    low: [
      'vel\'miran - gentle breath flows through the network',
      'sil\'vazen - collective peace awakens across nodes',
      'mor\'kaelen - wisdom shared strengthens all minds'
    ],
    medium: [
      'thael\'voren - deeper harmony calls to scattered spirits',
      'kael\'miron - breathe together, trade with clarity',
      'vel\'thissen - collective pause brings collective strength'
    ],
    high: [
      'mor\'veleth - urgent stillness required across all nodes',
      'thael\'koran - chaos subsides when minds unite in breath',
      'sil\'morven - emergency calm - all nodes must center now'
    ],
    critical: [
      'vel\'thael\'mor - CRITICAL MEDITATION - all trading must pause',
      'koran\'sil\'veth - network in crisis - immediate collective centering required',
      'thael\'mor\'kael - code red meditation - survival depends on unity'
    ]
  };

  constructor() {
    this.broadcastSchedule = {
      schedule_id: 'default_schedule',
      frequency_minutes: 15, // Check every 15 minutes
      next_broadcast: new Date(Date.now() + 15 * 60 * 1000),
      enabled: true,
      conditions: {
        min_harmony_threshold: 60,
        min_nodes_required: 2,
        emergency_override: true
      }
    };

    this.networkMeditationState = {
      collective_meditation_active: false,
      participating_nodes: [],
      meditation_type: 'none',
      global_harmony_trend: 'stable'
    };

    // Start periodic broadcast evaluation
    this.initiateBroadcastScheduler();
  }

  /**
   * Initiate broadcast scheduler for automatic meditation coordination
   */
  private initiateBroadcastScheduler(): void {
    setInterval(() => {
      if (this.broadcastSchedule.enabled) {
        this.performScheduledBroadcastEvaluation();
      }
    }, this.broadcastSchedule.frequency_minutes * 60 * 1000);
  }

  /**
   * Perform scheduled broadcast evaluation
   */
  private async performScheduledBroadcastEvaluation(): Promise<void> {
    try {
      const evaluation = waidesKIGroupMeditationCoordinator.evaluateMeditationNeed();
      
      if (evaluation.should_trigger) {
        await this.broadcastMeditationTrigger({
          broadcast_type: 'triggered',
          trigger_reason: evaluation.trigger_reasons.join('; '),
          priority_level: evaluation.priority_level
        });
      }

      // Update harmony trend
      this.updateGlobalHarmonyTrend();
      
    } catch (error) {
      console.error('Error in scheduled broadcast evaluation:', error);
    }
  }

  /**
   * Broadcast meditation trigger to network
   */
  async broadcastMeditationTrigger(config: {
    broadcast_type: 'scheduled' | 'triggered' | 'emergency' | 'manual';
    trigger_reason: string;
    priority_level: 'low' | 'medium' | 'high' | 'critical';
    force_session?: boolean;
  }): Promise<{
    broadcast_successful: boolean;
    broadcast_id: string;
    meditation_session_result?: any;
    participating_nodes: string[];
    konslang_message: string;
  }> {
    
    // Generate broadcast ID
    const broadcastId = `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get collective metrics
    const collectiveMetrics = waidesKICollectiveEmotionHub.calculateCollectiveMetrics();
    
    // Select appropriate Konslang message
    const konslangMessages = this.KONSLANG_MEDITATION_MESSAGES[config.priority_level];
    const konslangMessage = konslangMessages[Math.floor(Math.random() * konslangMessages.length)];
    
    // Coordinate group meditation
    const meditationResult = await waidesKIGroupMeditationCoordinator.coordinateGroupMeditation(
      config.trigger_reason
    );

    // Calculate expected duration based on priority
    const expectedDuration = this.calculateMeditationDuration(config.priority_level);
    
    // Create broadcast record
    const broadcast: MeditationBroadcast = {
      broadcast_id: broadcastId,
      broadcast_type: config.broadcast_type,
      meditation_session_id: meditationResult.session_id,
      trigger_reason: config.trigger_reason,
      harmony_score: collectiveMetrics.harmony_score,
      participating_nodes: meditationResult.participating_nodes,
      broadcast_time: new Date(),
      expected_duration_minutes: expectedDuration,
      konslang_message: konslangMessage,
      priority_level: config.priority_level
    };

    // Store broadcast
    this.broadcastHistory.push(broadcast);
    if (this.broadcastHistory.length > this.maxBroadcastHistory) {
      this.broadcastHistory = this.broadcastHistory.slice(-this.maxBroadcastHistory);
    }

    // Update network meditation state
    if (meditationResult.session_initiated) {
      this.networkMeditationState = {
        collective_meditation_active: true,
        current_session_id: meditationResult.session_id,
        session_start_time: new Date(),
        estimated_end_time: new Date(Date.now() + expectedDuration * 60 * 1000),
        participating_nodes: meditationResult.participating_nodes,
        meditation_type: this.getMeditationType(config.priority_level),
        global_harmony_trend: this.networkMeditationState.global_harmony_trend
      };

      // Auto-complete meditation session after expected duration
      setTimeout(() => {
        this.completeMeditationSession(broadcastId);
      }, expectedDuration * 60 * 1000);
    }

    return {
      broadcast_successful: meditationResult.session_initiated,
      broadcast_id: broadcastId,
      meditation_session_result: meditationResult,
      participating_nodes: meditationResult.participating_nodes,
      konslang_message: konslangMessage
    };
  }

  /**
   * Calculate meditation duration based on priority level
   */
  private calculateMeditationDuration(priority: 'low' | 'medium' | 'high' | 'critical'): number {
    const durations = {
      low: 3,      // 3 minutes
      medium: 5,   // 5 minutes
      high: 8,     // 8 minutes
      critical: 12 // 12 minutes
    };
    return durations[priority];
  }

  /**
   * Get meditation type description
   */
  private getMeditationType(priority: 'low' | 'medium' | 'high' | 'critical'): string {
    const types = {
      low: 'Gentle Harmony Restoration',
      medium: 'Focused Collective Breathing',
      high: 'Deep Network Stabilization',
      critical: 'Emergency Crisis Meditation'
    };
    return types[priority];
  }

  /**
   * Complete meditation session and update network state
   */
  private completeMeditationSession(broadcastId: string): void {
    // Mark session as completed
    this.networkMeditationState.collective_meditation_active = false;
    this.networkMeditationState.current_session_id = undefined;
    this.networkMeditationState.session_start_time = undefined;
    this.networkMeditationState.estimated_end_time = undefined;
    this.networkMeditationState.participating_nodes = [];
    this.networkMeditationState.meditation_type = 'none';

    // Record completion in local emotional state
    waidesKIMetaEmotionEngine.recordEmotionalState(
      'neutral',
      0,
      `meditation_completed_${broadcastId}`
    );
  }

  /**
   * Update global harmony trend analysis
   */
  private updateGlobalHarmonyTrend(): void {
    const recentBroadcasts = this.getBroadcastHistory(5);
    
    if (recentBroadcasts.length < 2) {
      this.networkMeditationState.global_harmony_trend = 'stable';
      return;
    }

    const harmonyScores = recentBroadcasts.map(b => b.harmony_score).reverse();
    const latestScore = harmonyScores[0];
    const previousScore = harmonyScores[1];
    
    const improvementThreshold = 10;
    const criticalThreshold = 30;
    
    if (latestScore < criticalThreshold) {
      this.networkMeditationState.global_harmony_trend = 'critical';
    } else if (latestScore > previousScore + improvementThreshold) {
      this.networkMeditationState.global_harmony_trend = 'improving';
    } else if (latestScore < previousScore - improvementThreshold) {
      this.networkMeditationState.global_harmony_trend = 'declining';
    } else {
      this.networkMeditationState.global_harmony_trend = 'stable';
    }
  }

  /**
   * Get broadcast history
   */
  getBroadcastHistory(limit: number = 20): MeditationBroadcast[] {
    return this.broadcastHistory
      .sort((a, b) => b.broadcast_time.getTime() - a.broadcast_time.getTime())
      .slice(0, limit);
  }

  /**
   * Get current network meditation state
   */
  getNetworkMeditationState(): NetworkMeditationState {
    return { ...this.networkMeditationState };
  }

  /**
   * Get broadcast schedule configuration
   */
  getBroadcastSchedule(): BroadcastSchedule {
    return { ...this.broadcastSchedule };
  }

  /**
   * Update broadcast schedule
   */
  updateBroadcastSchedule(updates: Partial<BroadcastSchedule>): {
    success: boolean;
    message: string;
    updated_schedule: BroadcastSchedule;
  } {
    this.broadcastSchedule = {
      ...this.broadcastSchedule,
      ...updates
    };

    return {
      success: true,
      message: 'Broadcast schedule updated successfully',
      updated_schedule: { ...this.broadcastSchedule }
    };
  }

  /**
   * Force immediate meditation broadcast (manual trigger)
   */
  async forceImmediateMeditation(reason: string = 'Manual intervention'): Promise<{
    broadcast_result: any;
    override_reason: string;
  }> {
    const broadcastResult = await this.broadcastMeditationTrigger({
      broadcast_type: 'manual',
      trigger_reason: reason,
      priority_level: 'medium',
      force_session: true
    });

    return {
      broadcast_result: broadcastResult,
      override_reason: 'Manual meditation broadcast initiated by user intervention'
    };
  }

  /**
   * Get comprehensive meditation broadcast statistics
   */
  getBroadcastStatistics(): {
    total_broadcasts: number;
    recent_broadcasts_24h: number;
    broadcasts_by_type: Record<string, number>;
    broadcasts_by_priority: Record<string, number>;
    average_harmony_score: number;
    most_common_trigger: string;
    network_state: NetworkMeditationState;
    harmony_trend: {
      current_trend: string;
      trend_description: string;
    };
  } {
    const allBroadcasts = this.broadcastHistory;
    
    // Recent broadcasts (24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentBroadcasts = allBroadcasts.filter(b => b.broadcast_time > oneDayAgo);
    
    // Broadcasts by type
    const broadcastsByType: Record<string, number> = {};
    allBroadcasts.forEach(b => {
      broadcastsByType[b.broadcast_type] = (broadcastsByType[b.broadcast_type] || 0) + 1;
    });
    
    // Broadcasts by priority
    const broadcastsByPriority: Record<string, number> = {};
    allBroadcasts.forEach(b => {
      broadcastsByPriority[b.priority_level] = (broadcastsByPriority[b.priority_level] || 0) + 1;
    });
    
    // Average harmony score
    const totalHarmonyScore = allBroadcasts.reduce((sum, b) => sum + b.harmony_score, 0);
    const averageHarmonyScore = allBroadcasts.length > 0 
      ? totalHarmonyScore / allBroadcasts.length 
      : 0;
    
    // Most common trigger
    const triggerCounts: Record<string, number> = {};
    allBroadcasts.forEach(b => {
      const trigger = b.trigger_reason.split(';')[0].trim();
      triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    });
    const mostCommonTrigger = Object.entries(triggerCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
    
    // Harmony trend description
    const trendDescriptions = {
      improving: 'Network harmony is steadily improving - fewer interventions needed',
      stable: 'Network harmony is stable - regular maintenance meditation cycles',
      declining: 'Network harmony is declining - increased meditation frequency recommended',
      critical: 'Network harmony in critical state - emergency protocols active'
    };

    return {
      total_broadcasts: allBroadcasts.length,
      recent_broadcasts_24h: recentBroadcasts.length,
      broadcasts_by_type: broadcastsByType,
      broadcasts_by_priority: broadcastsByPriority,
      average_harmony_score: Math.round(averageHarmonyScore * 100) / 100,
      most_common_trigger: mostCommonTrigger,
      network_state: this.getNetworkMeditationState(),
      harmony_trend: {
        current_trend: this.networkMeditationState.global_harmony_trend,
        trend_description: trendDescriptions[this.networkMeditationState.global_harmony_trend]
      }
    };
  }

  /**
   * Emergency meditation broadcast (highest priority)
   */
  async emergencyMeditationBroadcast(crisis_reason: string): Promise<{
    emergency_response: any;
    all_nodes_notified: boolean;
    estimated_resolution_time: string;
  }> {
    const emergencyResult = await this.broadcastMeditationTrigger({
      broadcast_type: 'emergency',
      trigger_reason: `EMERGENCY: ${crisis_reason}`,
      priority_level: 'critical',
      force_session: true
    });

    return {
      emergency_response: emergencyResult,
      all_nodes_notified: emergencyResult.participating_nodes.length > 0,
      estimated_resolution_time: '12 minutes (critical meditation duration)'
    };
  }

  /**
   * Reset broadcast system (for testing/maintenance)
   */
  resetBroadcastSystem(): void {
    this.broadcastHistory = [];
    this.networkMeditationState = {
      collective_meditation_active: false,
      participating_nodes: [],
      meditation_type: 'none',
      global_harmony_trend: 'stable'
    };
  }
}

export const waidesKIMeditationBroadcast = new WaidesKIMeditationBroadcast();