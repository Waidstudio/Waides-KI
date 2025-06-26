/**
 * MODULE 2 — Collective Trade Conductor: Consensus Vote Engine
 * Elects trade proposals through mesh consensus with empathy weighting
 */

import { waidesKIPresenceOrchestrator } from './waidesKIPresenceOrchestrator.js';
import { waidesKIEntangledPresenceMesh } from './waidesKIEntangledPresenceMesh.js';

interface TradeProposal {
  action: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'WAIT';
  confidence: number;
  reasoning: string;
  votes: Array<{
    node_id: string;
    vote: string;
    weight: number;
    consciousness_level: number;
  }>;
  consensus_strength: number;
  collective_harmony: number;
  proposal_id: string;
  timestamp: number;
}

interface EmpathyWeightManager {
  node_scores: Map<string, number>;
  performance_history: Map<string, Array<{ timestamp: number; success: boolean; score: number }>>;
}

export class WaidesKICollectiveTradeConductor {
  private empathyManager: EmpathyWeightManager;
  private proposalHistory: TradeProposal[] = [];
  private maxProposalHistory = 100;
  private conductorInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.empathyManager = {
      node_scores: new Map(),
      performance_history: new Map()
    };
    this.initializeEmpathyWeights();
    this.startCollectiveConducting();
  }

  /**
   * Initialize empathy weights for known nodes
   */
  private initializeEmpathyWeights(): void {
    const defaultNodes = [
      { id: 'waides-ki-main', score: 1.0 },
      { id: 'consciousness-alpha', score: 0.9 },
      { id: 'consciousness-beta', score: 0.8 },
      { id: 'consciousness-gamma', score: 0.7 },
      { id: 'mesh-node-01', score: 0.6 },
      { id: 'mesh-node-02', score: 0.7 },
      { id: 'mesh-node-03', score: 0.8 }
    ];

    defaultNodes.forEach(node => {
      this.empathyManager.node_scores.set(node.id, node.score);
      this.empathyManager.performance_history.set(node.id, []);
    });

    console.log('🎭 Initialized empathy weight manager with collective trust scores');
  }

  /**
   * Start collective conducting
   */
  private startCollectiveConducting(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Generate proposals every 30 seconds
    this.conductorInterval = setInterval(() => {
      this.proposeCollectiveTrade();
    }, 30000);

    console.log('🎭 Started collective trade conducting');
  }

  /**
   * Propose trade through collective consensus
   */
  async proposeCollectiveTrade(): Promise<TradeProposal> {
    try {
      // Get local presence evaluation
      const localEvaluation = await waidesKIPresenceOrchestrator.getHolisticIntelligence();
      
      // Get collective presence from mesh
      const collectivePresence = waidesKIEntangledPresenceMesh.gatherCollectivePresence();
      
      // Get collective consciousness state
      const consciousnessState = waidesKIEntangledPresenceMesh.getCollectiveConsciousness();

      // Prepare votes from all sources
      const votes: Array<{
        node_id: string;
        vote: string;
        weight: number;
        consciousness_level: number;
      }> = [];

      // Local vote
      votes.push({
        node_id: 'waides-ki-main',
        vote: localEvaluation.final_decision.action,
        weight: this.getEmpathyWeight('waides-ki-main'),
        consciousness_level: this.calculateNodeConsciousness(localEvaluation)
      });

      // Add entangled node votes
      collectivePresence.entangled_presences.forEach(presence => {
        const nodeAction = this.deriveActionFromPresence(presence.presence);
        votes.push({
          node_id: presence.node_id,
          vote: nodeAction,
          weight: this.getEmpathyWeight(presence.node_id) * presence.empathy_weight,
          consciousness_level: presence.consciousness_level
        });
      });

      // Calculate weighted consensus
      const consensusResult = this.calculateWeightedConsensus(votes);
      
      // Generate proposal
      const proposal: TradeProposal = {
        action: consensusResult.action as 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'WAIT',
        confidence: consensusResult.confidence,
        reasoning: consensusResult.reasoning,
        votes: votes,
        consensus_strength: consensusResult.strength,
        collective_harmony: consciousnessState.network_harmony,
        proposal_id: this.generateProposalId(),
        timestamp: Date.now()
      };

      // Store proposal
      this.proposalHistory.push(proposal);
      if (this.proposalHistory.length > this.maxProposalHistory) {
        this.proposalHistory.shift();
      }

      return proposal;
    } catch (error) {
      console.error('❌ Error in collective trade proposal:', error);
      return this.getDefaultProposal();
    }
  }

  /**
   * Calculate weighted consensus from votes
   */
  private calculateWeightedConsensus(votes: Array<{
    node_id: string;
    vote: string;
    weight: number;
    consciousness_level: number;
  }>): {
    action: string;
    confidence: number;
    strength: number;
    reasoning: string;
  } {
    if (votes.length === 0) {
      return {
        action: 'WAIT',
        confidence: 0,
        strength: 0,
        reasoning: 'No votes available for consensus'
      };
    }

    // Weighted voting tally
    const voteTally = new Map<string, { weight: number; consciousness: number; count: number }>();
    let totalWeight = 0;
    let totalConsciousness = 0;

    votes.forEach(vote => {
      const current = voteTally.get(vote.vote) || { weight: 0, consciousness: 0, count: 0 };
      current.weight += vote.weight;
      current.consciousness += vote.consciousness_level * vote.weight;
      current.count += 1;
      voteTally.set(vote.vote, current);
      
      totalWeight += vote.weight;
      totalConsciousness += vote.consciousness_level * vote.weight;
    });

    // Find winning action
    let winningAction = 'WAIT';
    let maxWeight = 0;
    let winningData = { weight: 0, consciousness: 0, count: 0 };

    for (const [action, data] of voteTally) {
      if (data.weight > maxWeight) {
        maxWeight = data.weight;
        winningAction = action;
        winningData = data;
      }
    }

    const strength = totalWeight > 0 ? Math.round((maxWeight / totalWeight) * 100) : 0;
    const avgConsciousness = winningData.weight > 0 ? winningData.consciousness / winningData.weight : 0;
    
    // Confidence based on strength and consciousness
    const confidence = Math.min(95, Math.round(strength * 0.7 + avgConsciousness * 30));
    
    const reasoning = `Collective consensus: ${winningAction} (${strength}% strength, ${winningData.count}/${votes.length} nodes, avg consciousness: ${Math.round(avgConsciousness * 100)}%)`;

    return {
      action: winningAction,
      confidence,
      strength,
      reasoning
    };
  }

  /**
   * Derive trading action from presence data
   */
  private deriveActionFromPresence(presence: any): string {
    if (!presence || !presence.overall_alignment) return 'WAIT';

    switch (presence.overall_alignment) {
      case 'strong_bullish':
        return 'BUY_ETH';
      case 'moderate_bullish':
        return presence.alignment_score > 50 ? 'BUY_ETH' : 'HOLD';
      case 'strong_bearish':
        return 'SELL_ETH';
      case 'moderate_bearish':
        return presence.alignment_score < -50 ? 'SELL_ETH' : 'HOLD';
      case 'neutral':
        return 'HOLD';
      default:
        return 'WAIT';
    }
  }

  /**
   * Calculate node consciousness level
   */
  private calculateNodeConsciousness(intelligence: any): number {
    let consciousness = 0.5; // Base level

    // Decision confidence contributes
    if (intelligence.final_decision?.confidence) {
      consciousness += (intelligence.final_decision.confidence / 100) * 0.3;
    }

    // Conditions met vs failed ratio
    const conditionsMet = intelligence.final_decision?.conditions_met?.length || 0;
    const conditionsFailed = intelligence.final_decision?.conditions_failed?.length || 0;
    const totalConditions = conditionsMet + conditionsFailed;
    
    if (totalConditions > 0) {
      consciousness += (conditionsMet / totalConditions) * 0.2;
    }

    return Math.min(1.0, consciousness);
  }

  /**
   * Get empathy weight for node
   */
  private getEmpathyWeight(nodeId: string): number {
    return this.empathyManager.node_scores.get(nodeId) || 0.5;
  }

  /**
   * Update node empathy score based on performance
   */
  updateNodeScore(nodeId: string, success: boolean, performance: number): void {
    const currentScore = this.empathyManager.node_scores.get(nodeId) || 0.5;
    const history = this.empathyManager.performance_history.get(nodeId) || [];

    // Add to history
    history.push({
      timestamp: Date.now(),
      success,
      score: performance
    });

    // Keep last 50 entries
    if (history.length > 50) {
      history.shift();
    }
    this.empathyManager.performance_history.set(nodeId, history);

    // Calculate new score based on recent performance
    const recentHistory = history.slice(-10); // Last 10 trades
    if (recentHistory.length > 0) {
      const successRate = recentHistory.filter(h => h.success).length / recentHistory.length;
      const avgPerformance = recentHistory.reduce((sum, h) => sum + h.score, 0) / recentHistory.length;
      
      // New score based on success rate and average performance
      const newScore = (successRate * 0.6) + (avgPerformance * 0.4);
      
      // Smooth transition (don't change too quickly)
      const smoothedScore = (currentScore * 0.7) + (newScore * 0.3);
      
      // Clamp between 0.1 and 1.0
      const clampedScore = Math.max(0.1, Math.min(1.0, smoothedScore));
      
      this.empathyManager.node_scores.set(nodeId, clampedScore);
      
      console.log(`🎭 Updated empathy weight for ${nodeId}: ${currentScore.toFixed(3)} → ${clampedScore.toFixed(3)}`);
    }
  }

  /**
   * Generate unique proposal ID
   */
  private generateProposalId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `prop-${timestamp}-${random}`;
  }

  /**
   * Get current collective proposal
   */
  getCurrentProposal(): TradeProposal {
    if (this.proposalHistory.length === 0) {
      return this.getDefaultProposal();
    }
    return this.proposalHistory[this.proposalHistory.length - 1];
  }

  /**
   * Get collective trading decision with confidence filtering
   */
  getCollectiveTradingDecision(): {
    proposal: TradeProposal;
    should_execute: boolean;
    execution_confidence: number;
    collective_support: string;
    risk_assessment: string;
  } {
    const proposal = this.getCurrentProposal();
    
    // Execution criteria
    let shouldExecute = false;
    let executionConfidence = 0;
    let collectiveSupport = 'insufficient';
    let riskAssessment = 'high';

    // High confidence collective decisions
    if (proposal.confidence >= 80 && proposal.consensus_strength >= 70) {
      shouldExecute = true;
      executionConfidence = proposal.confidence;
      collectiveSupport = 'strong';
      riskAssessment = 'low';
    } else if (proposal.confidence >= 60 && proposal.consensus_strength >= 60) {
      shouldExecute = proposal.action !== 'WAIT';
      executionConfidence = proposal.confidence * 0.8; // Reduce confidence for moderate consensus
      collectiveSupport = 'moderate';
      riskAssessment = 'medium';
    } else {
      shouldExecute = false;
      executionConfidence = 0;
      collectiveSupport = 'weak';
      riskAssessment = 'high';
    }

    return {
      proposal,
      should_execute: shouldExecute,
      execution_confidence: Math.round(executionConfidence),
      collective_support: collectiveSupport,
      risk_assessment: riskAssessment
    };
  }

  /**
   * Get conductor statistics
   */
  getConductorStatistics(): {
    total_proposals: number;
    recent_consensus_strength: number;
    average_confidence: number;
    empathy_distribution: Record<string, number>;
    proposal_breakdown: Record<string, number>;
    collective_performance: any;
  } {
    const recentProposals = this.proposalHistory.slice(-20);
    
    const avgConsensusStrength = recentProposals.length > 0 ?
      Math.round(recentProposals.reduce((sum, p) => sum + p.consensus_strength, 0) / recentProposals.length) : 0;
    
    const avgConfidence = recentProposals.length > 0 ?
      Math.round(recentProposals.reduce((sum, p) => sum + p.confidence, 0) / recentProposals.length) : 0;

    // Empathy distribution
    const empathyDistribution: Record<string, number> = {};
    for (const [nodeId, weight] of this.empathyManager.node_scores) {
      empathyDistribution[nodeId] = Math.round(weight * 100) / 100;
    }

    // Proposal action breakdown
    const proposalBreakdown = recentProposals.reduce((acc, proposal) => {
      acc[proposal.action] = (acc[proposal.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_proposals: this.proposalHistory.length,
      recent_consensus_strength: avgConsensusStrength,
      average_confidence: avgConfidence,
      empathy_distribution: empathyDistribution,
      proposal_breakdown: proposalBreakdown,
      collective_performance: {
        nodes_tracked: this.empathyManager.node_scores.size,
        avg_empathy_weight: Array.from(this.empathyManager.node_scores.values()).reduce((sum, w) => sum + w, 0) / this.empathyManager.node_scores.size
      }
    };
  }

  /**
   * Get proposal trends
   */
  getProposalTrends(): {
    trend_direction: 'bullish' | 'bearish' | 'neutral';
    consensus_stability: number;
    confidence_trend: 'rising' | 'falling' | 'stable';
    collective_evolution: string;
  } {
    if (this.proposalHistory.length < 5) {
      return {
        trend_direction: 'neutral',
        consensus_stability: 0,
        confidence_trend: 'stable',
        collective_evolution: 'insufficient_data'
      };
    }

    const recent = this.proposalHistory.slice(-10);
    
    // Calculate trend direction
    const bullishCount = recent.filter(p => p.action === 'BUY_ETH').length;
    const bearishCount = recent.filter(p => p.action === 'SELL_ETH').length;
    
    let trendDirection: 'bullish' | 'bearish' | 'neutral';
    if (bullishCount > bearishCount + 2) trendDirection = 'bullish';
    else if (bearishCount > bullishCount + 2) trendDirection = 'bearish';
    else trendDirection = 'neutral';

    // Calculate consensus stability
    const strengthVariance = this.calculateVariance(recent.map(p => p.consensus_strength));
    const consensusStability = Math.max(0, 100 - strengthVariance);

    // Calculate confidence trend
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    
    const firstAvgConf = firstHalf.reduce((sum, p) => sum + p.confidence, 0) / firstHalf.length;
    const secondAvgConf = secondHalf.reduce((sum, p) => sum + p.confidence, 0) / secondHalf.length;
    
    let confidenceTrend: 'rising' | 'falling' | 'stable';
    if (secondAvgConf > firstAvgConf + 5) confidenceTrend = 'rising';
    else if (secondAvgConf < firstAvgConf - 5) confidenceTrend = 'falling';
    else confidenceTrend = 'stable';

    // Determine collective evolution
    const avgHarmony = recent.reduce((sum, p) => sum + p.collective_harmony, 0) / recent.length;
    let collectiveEvolution = 'developing';
    if (avgHarmony >= 80) collectiveEvolution = 'transcendent';
    else if (avgHarmony >= 60) collectiveEvolution = 'enlightened';
    else if (avgHarmony >= 40) collectiveEvolution = 'aware';

    return {
      trend_direction: trendDirection,
      consensus_stability: Math.round(consensusStability),
      confidence_trend: confidenceTrend,
      collective_evolution: collectiveEvolution
    };
  }

  /**
   * Calculate variance for stability scoring
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 100;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Get default proposal when no data available
   */
  private getDefaultProposal(): TradeProposal {
    return {
      action: 'WAIT',
      confidence: 0,
      reasoning: 'No collective consensus available',
      votes: [],
      consensus_strength: 0,
      collective_harmony: 0,
      proposal_id: 'default-proposal',
      timestamp: Date.now()
    };
  }

  /**
   * Stop collective conducting
   */
  stop(): void {
    if (this.conductorInterval) {
      clearInterval(this.conductorInterval);
      this.conductorInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Collective trade conductor stopped');
  }

  /**
   * Restart collective conducting
   */
  restart(): void {
    this.stop();
    this.startCollectiveConducting();
  }
}

export const waidesKICollectiveTradeConductor = new WaidesKICollectiveTradeConductor();