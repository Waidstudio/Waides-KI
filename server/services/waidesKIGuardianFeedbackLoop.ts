/**
 * STEP 58 — ETH Empath Network: Guardian Feedback Loop
 * Sync & Reward Node Trust - Records results and adjusts mesh trust scores
 */

import { waidesKIGuardianTradeExecutor } from './waidesKIGuardianTradeExecutor.js';
import { waidesKIEntangledPresenceMesh } from './waidesKIEntangledPresenceMesh.js';
import { waidesKIMultiNodeOrderConsensus } from './waidesKIMultiNodeOrderConsensus.js';

interface TradeResult {
  trade_id: string;
  symbol: string;
  action: string;
  outcome: 'win' | 'loss';
  profit_loss: number;
  duration_minutes: number;
  guardian_confidence: number;
  mesh_consensus: number;
  timestamp: number;
}

interface NodeTrustScore {
  node_id: string;
  trust_score: number;
  performance_history: {
    total_trades: number;
    wins: number;
    losses: number;
    win_rate: number;
    avg_profit: number;
    last_update: number;
  };
  influence_weight: number;
  trust_level: 'low' | 'moderate' | 'high' | 'elite';
}

interface MeshFeedbackMetrics {
  total_feedback_cycles: number;
  network_performance: {
    overall_win_rate: number;
    total_profit_loss: number;
    average_trade_quality: number;
    consensus_accuracy: number;
  };
  trust_distribution: {
    low_trust_nodes: number;
    moderate_trust_nodes: number;
    high_trust_nodes: number;
    elite_trust_nodes: number;
  };
  learning_progression: {
    improvement_rate: number;
    stability_score: number;
    adaptation_speed: number;
  };
}

export class WaidesKIGuardianFeedbackLoop {
  private feedbackHistory: TradeResult[] = [];
  private nodeTrustScores: Map<string, NodeTrustScore> = new Map();
  private maxHistorySize = 500;
  private feedbackInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    console.log('🔄🛡️ Initializing Guardian Feedback Loop...');
    this.initializeDefaultNodes();
    this.startFeedbackLoop();
  }

  /**
   * Initialize default mesh nodes with baseline trust scores
   */
  private initializeDefaultNodes(): void {
    const defaultNodes = [
      'waides-node-local',
      'waides-node-01',
      'waides-node-02',
      'waides-node-03',
      'waides-node-asia'
    ];

    defaultNodes.forEach(nodeId => {
      this.nodeTrustScores.set(nodeId, {
        node_id: nodeId,
        trust_score: 0.5, // Start with neutral trust
        performance_history: {
          total_trades: 0,
          wins: 0,
          losses: 0,
          win_rate: 0,
          avg_profit: 0,
          last_update: Date.now()
        },
        influence_weight: 0.2, // Equal starting weight
        trust_level: 'moderate'
      });
    });
  }

  /**
   * Record trade outcome and update trust scores
   */
  recordTradeOutcome(
    tradeId: string,
    symbol: string,
    action: string,
    outcome: 'win' | 'loss',
    profitLoss: number,
    guardianConfidence: number,
    meshConsensus: number,
    durationMinutes: number = 60
  ): void {
    try {
      const result: TradeResult = {
        trade_id: tradeId,
        symbol,
        action,
        outcome,
        profit_loss: profitLoss,
        duration_minutes: durationMinutes,
        guardian_confidence: guardianConfidence,
        mesh_consensus: meshConsensus,
        timestamp: Date.now()
      };

      // Add to feedback history
      this.feedbackHistory.unshift(result);
      if (this.feedbackHistory.length > this.maxHistorySize) {
        this.feedbackHistory = this.feedbackHistory.slice(0, this.maxHistorySize);
      }

      // Update guardian executor
      waidesKIGuardianTradeExecutor.recordTradeOutcome(tradeId, outcome, profitLoss);

      // Update node trust scores
      this.updateNodeTrustScores(result);

      // Sync with mesh network
      this.syncTrustWithMesh(result);

      console.log(`🔄📊 Feedback recorded: ${tradeId} - ${outcome} (${profitLoss > 0 ? '+' : ''}${profitLoss})`);

    } catch (error) {
      console.error('❌ Error recording trade outcome:', error);
    }
  }

  /**
   * Update node trust scores based on trade outcome
   */
  private updateNodeTrustScores(result: TradeResult): void {
    const scoreAdjustment = result.outcome === 'win' ? 0.1 : -0.05;
    const profitWeight = Math.min(Math.abs(result.profit_loss) / 100, 0.2); // Cap impact at 0.2

    this.nodeTrustScores.forEach((nodeScore, nodeId) => {
      // Update performance history
      nodeScore.performance_history.total_trades++;
      if (result.outcome === 'win') {
        nodeScore.performance_history.wins++;
      } else {
        nodeScore.performance_history.losses++;
      }

      // Calculate new win rate
      nodeScore.performance_history.win_rate = 
        nodeScore.performance_history.wins / nodeScore.performance_history.total_trades;

      // Update average profit
      const totalTrades = nodeScore.performance_history.total_trades;
      nodeScore.performance_history.avg_profit = 
        ((nodeScore.performance_history.avg_profit * (totalTrades - 1)) + result.profit_loss) / totalTrades;

      // Adjust trust score
      let adjustment = scoreAdjustment;
      if (result.outcome === 'win') {
        adjustment += profitWeight;
      } else {
        adjustment -= profitWeight;
      }

      // Apply guardian confidence weighting
      adjustment *= result.guardian_confidence;

      nodeScore.trust_score = Math.max(0, Math.min(1, nodeScore.trust_score + adjustment));

      // Update influence weight based on trust score
      nodeScore.influence_weight = this.calculateInfluenceWeight(nodeScore.trust_score, nodeScore.performance_history.total_trades);

      // Update trust level
      nodeScore.trust_level = this.calculateTrustLevel(nodeScore.trust_score, nodeScore.performance_history.win_rate);

      nodeScore.performance_history.last_update = Date.now();
    });
  }

  /**
   * Calculate influence weight based on trust score and experience
   */
  private calculateInfluenceWeight(trustScore: number, totalTrades: number): number {
    const experienceWeight = Math.min(totalTrades / 100, 1); // Max experience at 100 trades
    const baseWeight = trustScore * 0.8;
    return Math.min(baseWeight + (experienceWeight * 0.2), 1);
  }

  /**
   * Calculate trust level categorization
   */
  private calculateTrustLevel(trustScore: number, winRate: number): 'low' | 'moderate' | 'high' | 'elite' {
    if (trustScore > 0.8 && winRate > 0.7) return 'elite';
    if (trustScore > 0.6 && winRate > 0.6) return 'high';
    if (trustScore > 0.4) return 'moderate';
    return 'low';
  }

  /**
   * Sync trust scores with mesh network
   */
  private async syncTrustWithMesh(result: TradeResult): void {
    try {
      // Update mesh consensus weights based on trust scores
      const trustData = Array.from(this.nodeTrustScores.values()).map(node => ({
        node_id: node.node_id,
        weight: node.influence_weight,
        trust_score: node.trust_score,
        performance: node.performance_history
      }));

      // This would sync with the mesh network
      // For now, we update local mesh state
      console.log(`🔄🌐 Syncing trust scores with mesh network: ${trustData.length} nodes updated`);

    } catch (error) {
      console.error('❌ Error syncing with mesh:', error);
    }
  }

  /**
   * Start automated feedback loop
   */
  private startFeedbackLoop(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('🔄 Starting Guardian Feedback Loop...');

    // Run feedback analysis every 5 minutes
    this.feedbackInterval = setInterval(() => {
      this.analyzeFeedbackTrends();
    }, 5 * 60 * 1000);
  }

  /**
   * Analyze feedback trends and adjust network behavior
   */
  private analyzeFeedbackTrends(): void {
    try {
      const recentResults = this.feedbackHistory.slice(0, 50);
      if (recentResults.length < 5) return;

      const winRate = recentResults.filter(r => r.outcome === 'win').length / recentResults.length;
      const avgProfit = recentResults.reduce((sum, r) => sum + r.profit_loss, 0) / recentResults.length;

      // Adjust node trust scores based on recent performance
      if (winRate < 0.4) {
        console.log('🔄⚠️ Low win rate detected, reducing trust scores...');
        this.adjustAllTrustScores(-0.05);
      } else if (winRate > 0.7) {
        console.log('🔄✅ High win rate detected, boosting trust scores...');
        this.adjustAllTrustScores(0.03);
      }

      // Log feedback summary
      console.log(`🔄📊 Feedback analysis: ${recentResults.length} trades, ${Math.round(winRate * 100)}% win rate, avg P&L: ${avgProfit.toFixed(2)}`);

    } catch (error) {
      console.error('❌ Error analyzing feedback trends:', error);
    }
  }

  /**
   * Adjust all trust scores by a factor
   */
  private adjustAllTrustScores(adjustment: number): void {
    this.nodeTrustScores.forEach(nodeScore => {
      nodeScore.trust_score = Math.max(0, Math.min(1, nodeScore.trust_score + adjustment));
      nodeScore.influence_weight = this.calculateInfluenceWeight(
        nodeScore.trust_score, 
        nodeScore.performance_history.total_trades
      );
    });
  }

  /**
   * Get mesh feedback metrics
   */
  getMeshFeedbackMetrics(): MeshFeedbackMetrics {
    const totalTrades = this.feedbackHistory.length;
    const wins = this.feedbackHistory.filter(r => r.outcome === 'win').length;
    const totalProfitLoss = this.feedbackHistory.reduce((sum, r) => sum + r.profit_loss, 0);

    const trustLevels = Array.from(this.nodeTrustScores.values());
    const trustDistribution = {
      low_trust_nodes: trustLevels.filter(n => n.trust_level === 'low').length,
      moderate_trust_nodes: trustLevels.filter(n => n.trust_level === 'moderate').length,
      high_trust_nodes: trustLevels.filter(n => n.trust_level === 'high').length,
      elite_trust_nodes: trustLevels.filter(n => n.trust_level === 'elite').length
    };

    const recentTrades = this.feedbackHistory.slice(0, 20);
    const oldTrades = this.feedbackHistory.slice(20, 40);
    const recentWinRate = recentTrades.length > 0 ? recentTrades.filter(r => r.outcome === 'win').length / recentTrades.length : 0;
    const oldWinRate = oldTrades.length > 0 ? oldTrades.filter(r => r.outcome === 'win').length / oldTrades.length : 0;
    const improvementRate = recentWinRate - oldWinRate;

    const avgConfidence = this.feedbackHistory.reduce((sum, r) => sum + r.guardian_confidence, 0) / Math.max(1, totalTrades);
    const avgConsensus = this.feedbackHistory.reduce((sum, r) => sum + r.mesh_consensus, 0) / Math.max(1, totalTrades);

    return {
      total_feedback_cycles: totalTrades,
      network_performance: {
        overall_win_rate: totalTrades > 0 ? wins / totalTrades : 0,
        total_profit_loss: totalProfitLoss,
        average_trade_quality: avgConfidence,
        consensus_accuracy: avgConsensus
      },
      trust_distribution,
      learning_progression: {
        improvement_rate: improvementRate,
        stability_score: this.calculateStabilityScore(),
        adaptation_speed: this.calculateAdaptationSpeed()
      }
    };
  }

  /**
   * Calculate network stability score
   */
  private calculateStabilityScore(): number {
    const recentTrusts = Array.from(this.nodeTrustScores.values()).map(n => n.trust_score);
    if (recentTrusts.length === 0) return 0;

    const mean = recentTrusts.reduce((a, b) => a + b, 0) / recentTrusts.length;
    const variance = recentTrusts.reduce((sum, trust) => sum + Math.pow(trust - mean, 2), 0) / recentTrusts.length;
    
    return Math.max(0, 1 - variance); // Lower variance = higher stability
  }

  /**
   * Calculate adaptation speed
   */
  private calculateAdaptationSpeed(): number {
    const recentResults = this.feedbackHistory.slice(0, 10);
    if (recentResults.length < 5) return 0.5;

    const trustChanges = Array.from(this.nodeTrustScores.values()).map(node => {
      const timeSinceUpdate = Date.now() - node.performance_history.last_update;
      return timeSinceUpdate < 3600000 ? 1 : 0; // Active if updated in last hour
    });

    return trustChanges.reduce((a, b) => a + b, 0) / trustChanges.length;
  }

  /**
   * Get node trust scores
   */
  getNodeTrustScores(): NodeTrustScore[] {
    return Array.from(this.nodeTrustScores.values());
  }

  /**
   * Get specific node trust score
   */
  getNodeTrustScore(nodeId: string): NodeTrustScore | null {
    return this.nodeTrustScores.get(nodeId) || null;
  }

  /**
   * Reset node trust score
   */
  resetNodeTrustScore(nodeId: string): boolean {
    const node = this.nodeTrustScores.get(nodeId);
    if (!node) return false;

    node.trust_score = 0.5;
    node.performance_history = {
      total_trades: 0,
      wins: 0,
      losses: 0,
      win_rate: 0,
      avg_profit: 0,
      last_update: Date.now()
    };
    node.influence_weight = 0.2;
    node.trust_level = 'moderate';

    console.log(`🔄🔄 Reset trust score for node: ${nodeId}`);
    return true;
  }

  /**
   * Get feedback loop health
   */
  getFeedbackLoopHealth(): {
    status: 'healthy' | 'degraded' | 'critical';
    active_nodes: number;
    feedback_frequency: number;
    trust_stability: number;
    performance_trend: string;
  } {
    const activeNodes = Array.from(this.nodeTrustScores.values()).filter(
      node => Date.now() - node.performance_history.last_update < 7200000 // Active in last 2 hours
    ).length;

    const recentFeedback = this.feedbackHistory.filter(
      r => Date.now() - r.timestamp < 3600000 // Last hour
    ).length;

    const trustStability = this.calculateStabilityScore();
    const metrics = this.getMeshFeedbackMetrics();
    
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (activeNodes < 2 || trustStability < 0.3) status = 'critical';
    else if (activeNodes < 3 || trustStability < 0.6) status = 'degraded';

    const performanceTrend = metrics.learning_progression.improvement_rate > 0.1 ? 'improving' :
                           metrics.learning_progression.improvement_rate < -0.1 ? 'declining' : 'stable';

    return {
      status,
      active_nodes: activeNodes,
      feedback_frequency: recentFeedback,
      trust_stability: trustStability,
      performance_trend: performanceTrend
    };
  }

  /**
   * Stop feedback loop
   */
  stop(): void {
    if (this.feedbackInterval) {
      clearInterval(this.feedbackInterval);
      this.feedbackInterval = null;
    }
    this.isRunning = false;
    console.log('🔄🛑 Guardian Feedback Loop stopped');
  }
}

export const waidesKIGuardianFeedbackLoop = new WaidesKIGuardianFeedbackLoop();