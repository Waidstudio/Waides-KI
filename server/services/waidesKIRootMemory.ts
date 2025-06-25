import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKIDNAEngine } from './waidesKIDNAEngine';

interface StrategyNode {
  strategy_id: string;
  dna_id: string;
  creation_timestamp: number;
  last_updated: number;
  wins: number;
  losses: number;
  total_trades: number;
  win_rate: number;
  color: 'green' | 'red' | 'yellow' | 'gray' | 'blue' | 'purple';
  status: 'ACTIVE' | 'DORMANT' | 'RETIRED' | 'EVOLVING' | 'MUTATING';
  confidence_level: number;
  evolution_stage: number;
  parent_nodes: string[];
  child_nodes: string[];
  history: StrategyTradeHistory[];
  metadata: {
    category: string;
    risk_level: string;
    avg_profit: number;
    max_drawdown: number;
    consistency_score: number;
    emotional_signature: string;
    birth_conditions: any;
  };
  visual_properties: {
    position: { x: number; y: number };
    size: number;
    connections: string[];
    growth_rate: number;
    pulse_intensity: number;
  };
}

interface StrategyTradeHistory {
  timestamp: number;
  result: 'WIN' | 'LOSS' | 'PENDING';
  profit_loss: number;
  confidence: number;
  market_conditions: any;
  emotional_state: string;
}

interface MemoryTreeCluster {
  cluster_id: string;
  cluster_type: 'MOMENTUM' | 'REVERSAL' | 'BREAKOUT' | 'CONSOLIDATION' | 'EXPERIMENTAL';
  nodes: string[];
  cluster_performance: {
    avg_win_rate: number;
    total_trades: number;
    cluster_strength: number;
  };
  visual_center: { x: number; y: number };
  cluster_color: string;
}

interface MemoryEvolution {
  timestamp: number;
  evolution_type: 'BIRTH' | 'MUTATION' | 'MERGE' | 'SPLIT' | 'DEATH' | 'REVIVAL';
  affected_nodes: string[];
  trigger_event: string;
  success_probability: number;
}

export class WaidesKIRootMemory {
  private memoryTree: Map<string, StrategyNode> = new Map();
  private memoryClusters: Map<string, MemoryTreeCluster> = new Map();
  private evolutionHistory: MemoryEvolution[] = [];
  private treeStatistics: any = {};
  private maxTreeSize: number = 1000;
  private visualCanvas: { width: number; height: number } = { width: 1000, height: 1000 };

  constructor() {
    this.initializeRootMemory();
    this.startEvolutionCycle();
  }

  private initializeRootMemory(): void {
    // Initialize memory tree statistics
    this.updateTreeStatistics();
    
    // Start periodic memory reorganization
    setInterval(() => {
      this.reorganizeMemoryTree();
      this.pruneWeakMemories();
      this.updateVisualProperties();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // CORE MEMORY REGISTRATION
  registerStrategy(strategyId: string, dnaId: string, result: 'WIN' | 'LOSS' | 'PENDING', profitLoss: number, confidence: number, marketConditions: any): void {
    let node = this.memoryTree.get(strategyId);
    
    if (!node) {
      // Create new memory node
      node = this.createNewStrategyNode(strategyId, dnaId, marketConditions);
      this.memoryTree.set(strategyId, node);
      
      // Log memory birth
      waidesKIDailyReporter.recordLesson(
        `New strategy memory node born: ${strategyId}`,
        'PATTERN',
        'MEDIUM',
        'Root Memory System'
      );
      
      this.recordEvolution('BIRTH', [strategyId], 'Strategy creation', 70);
    }
    
    // Add trade history
    const tradeRecord: StrategyTradeHistory = {
      timestamp: Date.now(),
      result,
      profit_loss: profitLoss,
      confidence,
      market_conditions: marketConditions,
      emotional_state: this.getCurrentEmotionalSignature()
    };
    
    node.history.push(tradeRecord);
    
    // Update statistics
    if (result === 'WIN') {
      node.wins++;
    } else if (result === 'LOSS') {
      node.losses++;
    }
    
    node.total_trades = node.wins + node.losses;
    node.win_rate = node.total_trades > 0 ? (node.wins / node.total_trades) * 100 : 0;
    node.last_updated = Date.now();
    
    // Update node properties
    this.updateNodeColor(node);
    this.updateNodeStatus(node);
    this.updateNodeMetadata(node, profitLoss);
    
    // Maintain history size
    if (node.history.length > 100) {
      node.history = node.history.slice(-100);
    }
    
    // Update tree statistics
    this.updateTreeStatistics();
    
    // Check for evolution opportunities
    this.checkEvolutionOpportunities(strategyId);
  }

  private createNewStrategyNode(strategyId: string, dnaId: string, marketConditions: any): StrategyNode {
    const dnaInfo = waidesKIDNAEngine.getDNAInfo(dnaId);
    
    return {
      strategy_id: strategyId,
      dna_id: dnaId,
      creation_timestamp: Date.now(),
      last_updated: Date.now(),
      wins: 0,
      losses: 0,
      total_trades: 0,
      win_rate: 0,
      color: 'gray',
      status: 'ACTIVE',
      confidence_level: 50,
      evolution_stage: 1,
      parent_nodes: [],
      child_nodes: [],
      history: [],
      metadata: {
        category: dnaInfo?.strategy_category || 'UNKNOWN',
        risk_level: dnaInfo?.risk_level || 'MEDIUM',
        avg_profit: 0,
        max_drawdown: 0,
        consistency_score: 50,
        emotional_signature: this.getCurrentEmotionalSignature(),
        birth_conditions: marketConditions
      },
      visual_properties: {
        position: this.generateRandomPosition(),
        size: 10,
        connections: [],
        growth_rate: 1.0,
        pulse_intensity: 0.5
      }
    };
  }

  private updateNodeColor(node: StrategyNode): void {
    const total = node.total_trades;
    
    if (total < 3) {
      node.color = 'gray'; // Insufficient data
    } else if (node.win_rate > 80) {
      node.color = 'green'; // Strong performer
    } else if (node.win_rate > 60) {
      node.color = 'blue'; // Good performer
    } else if (node.win_rate > 40) {
      node.color = 'yellow'; // Unstable
    } else if (node.win_rate > 20) {
      node.color = 'purple'; // Poor but might recover
    } else {
      node.color = 'red'; // Failing
    }
    
    // Special colors for evolving strategies
    if (node.status === 'EVOLVING') {
      node.color = 'blue';
    } else if (node.status === 'MUTATING') {
      node.color = 'purple';
    }
  }

  private updateNodeStatus(node: StrategyNode): void {
    const daysSinceLastTrade = (Date.now() - node.last_updated) / (24 * 60 * 60 * 1000);
    
    if (daysSinceLastTrade > 7) {
      node.status = 'DORMANT';
    } else if (daysSinceLastTrade > 30) {
      node.status = 'RETIRED';
    } else if (node.evolution_stage > 3) {
      node.status = 'EVOLVING';
    } else if (node.child_nodes.length > 0) {
      node.status = 'MUTATING';
    } else {
      node.status = 'ACTIVE';
    }
  }

  private updateNodeMetadata(node: StrategyNode, profitLoss: number): void {
    // Update average profit
    const totalPnL = node.history.reduce((sum, trade) => sum + trade.profit_loss, 0);
    node.metadata.avg_profit = node.total_trades > 0 ? totalPnL / node.total_trades : 0;
    
    // Calculate max drawdown
    let runningPnL = 0;
    let peak = 0;
    let maxDrawdown = 0;
    
    for (const trade of node.history) {
      runningPnL += trade.profit_loss;
      if (runningPnL > peak) peak = runningPnL;
      const drawdown = peak - runningPnL;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }
    
    node.metadata.max_drawdown = maxDrawdown;
    
    // Update consistency score
    if (node.history.length >= 5) {
      const profits = node.history.map(t => t.profit_loss);
      const mean = profits.reduce((sum, p) => sum + p, 0) / profits.length;
      const variance = profits.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / profits.length;
      const stdDev = Math.sqrt(variance);
      node.metadata.consistency_score = Math.max(0, 100 - (stdDev / Math.abs(mean)) * 100);
    }
    
    // Update confidence level
    node.confidence_level = Math.min(95, 30 + node.win_rate * 0.7 + node.metadata.consistency_score * 0.3);
  }

  // MEMORY TREE CLUSTERING
  private reorganizeMemoryTree(): void {
    this.memoryClusters.clear();
    
    const categoryGroups = new Map<string, string[]>();
    
    // Group strategies by category
    for (const [strategyId, node] of this.memoryTree.entries()) {
      const category = node.metadata.category;
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)!.push(strategyId);
    }
    
    // Create clusters
    for (const [category, nodeIds] of categoryGroups.entries()) {
      if (nodeIds.length > 0) {
        const cluster = this.createMemoryCluster(category, nodeIds);
        this.memoryClusters.set(cluster.cluster_id, cluster);
      }
    }
  }

  private createMemoryCluster(category: string, nodeIds: string[]): MemoryTreeCluster {
    const nodes = nodeIds.map(id => this.memoryTree.get(id)!).filter(n => n);
    
    const totalTrades = nodes.reduce((sum, n) => sum + n.total_trades, 0);
    const avgWinRate = nodes.length > 0 ? 
      nodes.reduce((sum, n) => sum + n.win_rate, 0) / nodes.length : 0;
    
    const clusterStrength = this.calculateClusterStrength(nodes);
    
    return {
      cluster_id: `CLUSTER_${category}_${Date.now()}`,
      cluster_type: this.mapCategoryToClusterType(category),
      nodes: nodeIds,
      cluster_performance: {
        avg_win_rate: avgWinRate,
        total_trades: totalTrades,
        cluster_strength: clusterStrength
      },
      visual_center: this.calculateClusterCenter(nodes),
      cluster_color: this.getClusterColor(avgWinRate)
    };
  }

  private calculateClusterStrength(nodes: StrategyNode[]): number {
    if (nodes.length === 0) return 0;
    
    const avgWinRate = nodes.reduce((sum, n) => sum + n.win_rate, 0) / nodes.length;
    const avgConsistency = nodes.reduce((sum, n) => sum + n.metadata.consistency_score, 0) / nodes.length;
    const totalTrades = nodes.reduce((sum, n) => sum + n.total_trades, 0);
    
    // Strength based on performance, consistency, and experience
    return Math.min(100, (avgWinRate * 0.5 + avgConsistency * 0.3 + Math.min(50, totalTrades) * 0.2));
  }

  private mapCategoryToClusterType(category: string): MemoryTreeCluster['cluster_type'] {
    switch (category) {
      case 'MOMENTUM_BREAKOUT': return 'MOMENTUM';
      case 'MEAN_REVERSION': return 'REVERSAL';
      case 'VOLUME_SPIKE_TRADE': return 'BREAKOUT';
      case 'CONSOLIDATION_PLAY': return 'CONSOLIDATION';
      default: return 'EXPERIMENTAL';
    }
  }

  // MEMORY EVOLUTION SYSTEM
  private startEvolutionCycle(): void {
    // Run evolution checks every 10 minutes
    setInterval(() => {
      this.evolveMemoryTree();
    }, 10 * 60 * 1000);
  }

  private evolveMemoryTree(): void {
    // Find evolution opportunities
    const strongNodes = this.findStrongNodes();
    const weakNodes = this.findWeakNodes();
    
    // Evolve strong nodes
    strongNodes.forEach(nodeId => {
      this.evolveNode(nodeId);
    });
    
    // Consider retiring weak nodes
    weakNodes.forEach(nodeId => {
      this.considerNodeRetirement(nodeId);
    });
    
    // Look for merge opportunities
    this.findMergeOpportunities();
  }

  private checkEvolutionOpportunities(strategyId: string): void {
    const node = this.memoryTree.get(strategyId);
    if (!node) return;
    
    // Check if node is ready for evolution
    if (node.total_trades >= 10 && node.win_rate > 70 && node.evolution_stage < 5) {
      this.evolveNode(strategyId);
    }
    
    // Check for mutation opportunities
    if (node.total_trades >= 5 && node.win_rate < 40) {
      this.considerNodeMutation(strategyId);
    }
  }

  private evolveNode(strategyId: string): void {
    const node = this.memoryTree.get(strategyId);
    if (!node) return;
    
    node.evolution_stage++;
    node.visual_properties.size = Math.min(25, 10 + node.evolution_stage * 2);
    node.visual_properties.pulse_intensity = Math.min(1.0, 0.3 + node.evolution_stage * 0.1);
    
    waidesKIDailyReporter.recordLesson(
      `Strategy ${strategyId} evolved to stage ${node.evolution_stage}`,
      'STRATEGY',
      'HIGH',
      'Memory Evolution'
    );
    
    this.recordEvolution('MUTATION', [strategyId], 'Performance-based evolution', 85);
  }

  private considerNodeMutation(strategyId: string): void {
    const node = this.memoryTree.get(strategyId);
    if (!node) return;
    
    // Create mutated child node
    const childId = `${strategyId}_MUT_${Date.now()}`;
    const childNode = { ...node };
    childNode.strategy_id = childId;
    childNode.parent_nodes = [strategyId];
    childNode.wins = 0;
    childNode.losses = 0;
    childNode.total_trades = 0;
    childNode.history = [];
    childNode.color = 'purple';
    childNode.status = 'MUTATING';
    childNode.creation_timestamp = Date.now();
    
    this.memoryTree.set(childId, childNode);
    node.child_nodes.push(childId);
    
    this.recordEvolution('SPLIT', [strategyId, childId], 'Mutation due to poor performance', 60);
  }

  private findStrongNodes(): string[] {
    return Array.from(this.memoryTree.entries())
      .filter(([_, node]) => node.win_rate > 70 && node.total_trades >= 5)
      .map(([id, _]) => id);
  }

  private findWeakNodes(): string[] {
    return Array.from(this.memoryTree.entries())
      .filter(([_, node]) => node.win_rate < 30 && node.total_trades >= 10)
      .map(([id, _]) => id);
  }

  private findMergeOpportunities(): void {
    // Find similar performing nodes that could be merged
    const activeClusters = Array.from(this.memoryClusters.values())
      .filter(cluster => cluster.nodes.length >= 2);
    
    for (const cluster of activeClusters) {
      if (cluster.cluster_performance.avg_win_rate > 60) {
        // Consider merging successful similar strategies
        const topNodes = cluster.nodes
          .map(id => this.memoryTree.get(id)!)
          .filter(n => n && n.win_rate > 60)
          .slice(0, 2);
        
        if (topNodes.length === 2) {
          this.considerNodeMerge(topNodes[0].strategy_id, topNodes[1].strategy_id);
        }
      }
    }
  }

  private considerNodeMerge(nodeId1: string, nodeId2: string): void {
    // Create merged node concept (conceptual for now)
    this.recordEvolution('MERGE', [nodeId1, nodeId2], 'Similar high-performance patterns', 75);
  }

  // VISUAL PROPERTIES MANAGEMENT
  private updateVisualProperties(): void {
    for (const [_, node] of this.memoryTree.entries()) {
      // Update size based on performance and activity
      const baseSize = 8;
      const performanceSize = (node.win_rate / 100) * 10;
      const activitySize = Math.min(7, node.total_trades * 0.5);
      node.visual_properties.size = baseSize + performanceSize + activitySize;
      
      // Update pulse intensity based on recent activity
      const daysSinceLastTrade = (Date.now() - node.last_updated) / (24 * 60 * 60 * 1000);
      node.visual_properties.pulse_intensity = Math.max(0.1, 1.0 - (daysSinceLastTrade * 0.1));
      
      // Update growth rate
      node.visual_properties.growth_rate = node.win_rate > 50 ? 1.2 : 0.8;
    }
  }

  private generateRandomPosition(): { x: number; y: number } {
    return {
      x: Math.random() * this.visualCanvas.width,
      y: Math.random() * this.visualCanvas.height
    };
  }

  private calculateClusterCenter(nodes: StrategyNode[]): { x: number; y: number } {
    if (nodes.length === 0) return { x: 500, y: 500 };
    
    const totalX = nodes.reduce((sum, n) => sum + n.visual_properties.position.x, 0);
    const totalY = nodes.reduce((sum, n) => sum + n.visual_properties.position.y, 0);
    
    return {
      x: totalX / nodes.length,
      y: totalY / nodes.length
    };
  }

  private getClusterColor(avgWinRate: number): string {
    if (avgWinRate > 70) return '#00FF00'; // Green
    if (avgWinRate > 50) return '#0080FF'; // Blue
    if (avgWinRate > 30) return '#FFFF00'; // Yellow
    return '#FF4040'; // Red
  }

  // MEMORY MAINTENANCE
  private pruneWeakMemories(): void {
    const cutoffDate = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago
    const toDelete: string[] = [];
    
    for (const [strategyId, node] of this.memoryTree.entries()) {
      // Remove old, inactive, poor-performing memories
      if (node.last_updated < cutoffDate && 
          node.win_rate < 20 && 
          node.total_trades < 5) {
        toDelete.push(strategyId);
      }
    }
    
    toDelete.forEach(id => {
      this.memoryTree.delete(id);
      this.recordEvolution('DEATH', [id], 'Memory pruning: poor performance + inactivity', 90);
    });
    
    // Maintain tree size
    if (this.memoryTree.size > this.maxTreeSize) {
      const sortedNodes = Array.from(this.memoryTree.entries())
        .sort((a, b) => a[1].last_updated - b[1].last_updated);
      
      const excess = this.memoryTree.size - this.maxTreeSize;
      for (let i = 0; i < excess; i++) {
        this.memoryTree.delete(sortedNodes[i][0]);
      }
    }
  }

  private updateTreeStatistics(): void {
    const nodes = Array.from(this.memoryTree.values());
    
    this.treeStatistics = {
      total_nodes: nodes.length,
      active_nodes: nodes.filter(n => n.status === 'ACTIVE').length,
      dormant_nodes: nodes.filter(n => n.status === 'DORMANT').length,
      evolving_nodes: nodes.filter(n => n.status === 'EVOLVING').length,
      avg_win_rate: nodes.length > 0 ? nodes.reduce((sum, n) => sum + n.win_rate, 0) / nodes.length : 0,
      total_trades: nodes.reduce((sum, n) => sum + n.total_trades, 0),
      evolution_events: this.evolutionHistory.length,
      cluster_count: this.memoryClusters.size,
      memory_health: this.calculateMemoryHealth(nodes)
    };
  }

  private calculateMemoryHealth(nodes: StrategyNode[]): number {
    if (nodes.length === 0) return 0;
    
    const activeNodes = nodes.filter(n => n.status === 'ACTIVE').length;
    const strongNodes = nodes.filter(n => n.win_rate > 60).length;
    const evolvingNodes = nodes.filter(n => n.evolution_stage > 1).length;
    
    const activityScore = (activeNodes / nodes.length) * 40;
    const performanceScore = (strongNodes / nodes.length) * 40;
    const evolutionScore = (evolvingNodes / nodes.length) * 20;
    
    return Math.min(100, activityScore + performanceScore + evolutionScore);
  }

  private recordEvolution(type: MemoryEvolution['evolution_type'], nodeIds: string[], trigger: string, probability: number): void {
    this.evolutionHistory.push({
      timestamp: Date.now(),
      evolution_type: type,
      affected_nodes: nodeIds,
      trigger_event: trigger,
      success_probability: probability
    });
    
    // Keep only recent evolution history
    if (this.evolutionHistory.length > 200) {
      this.evolutionHistory = this.evolutionHistory.slice(-200);
    }
  }

  private getCurrentEmotionalSignature(): string {
    const currentEmotion = waidesKIDailyReporter.getCurrentEmotionalState();
    return currentEmotion?.emotion || 'NEUTRAL';
  }

  // PUBLIC INTERFACE METHODS
  getMemoryTree(): { [key: string]: StrategyNode } {
    return Object.fromEntries(this.memoryTree);
  }

  getMemoryClusters(): { [key: string]: MemoryTreeCluster } {
    return Object.fromEntries(this.memoryClusters);
  }

  getTreeStatistics(): any {
    return { ...this.treeStatistics };
  }

  getEvolutionHistory(): MemoryEvolution[] {
    return [...this.evolutionHistory];
  }

  getNodeInfo(strategyId: string): StrategyNode | null {
    return this.memoryTree.get(strategyId) || null;
  }

  getVisualTreeData(): any {
    const nodes = Array.from(this.memoryTree.values()).map(node => ({
      id: node.strategy_id,
      dna: node.dna_id,
      color: node.color,
      size: node.visual_properties.size,
      position: node.visual_properties.position,
      wins: node.wins,
      losses: node.losses,
      winRate: node.win_rate,
      status: node.status,
      evolutionStage: node.evolution_stage,
      pulseIntensity: node.visual_properties.pulse_intensity,
      connections: node.visual_properties.connections
    }));
    
    const clusters = Array.from(this.memoryClusters.values()).map(cluster => ({
      id: cluster.cluster_id,
      type: cluster.cluster_type,
      center: cluster.visual_center,
      color: cluster.cluster_color,
      strength: cluster.cluster_performance.cluster_strength,
      nodeCount: cluster.nodes.length
    }));
    
    return {
      nodes,
      clusters,
      statistics: this.treeStatistics,
      canvas: this.visualCanvas
    };
  }

  // ADMIN CONTROLS
  forceNodeEvolution(strategyId: string): boolean {
    const node = this.memoryTree.get(strategyId);
    if (node) {
      this.evolveNode(strategyId);
      return true;
    }
    return false;
  }

  retireNode(strategyId: string): boolean {
    const node = this.memoryTree.get(strategyId);
    if (node) {
      node.status = 'RETIRED';
      this.recordEvolution('DEATH', [strategyId], 'Manual retirement', 100);
      return true;
    }
    return false;
  }

  reviveNode(strategyId: string): boolean {
    const node = this.memoryTree.get(strategyId);
    if (node && node.status === 'RETIRED') {
      node.status = 'ACTIVE';
      this.recordEvolution('REVIVAL', [strategyId], 'Manual revival', 50);
      return true;
    }
    return false;
  }

  resetMemoryTree(): void {
    this.memoryTree.clear();
    this.memoryClusters.clear();
    this.evolutionHistory.length = 0;
    this.updateTreeStatistics();
  }

  exportMemoryData(): any {
    return {
      memory_tree: Object.fromEntries(this.memoryTree),
      memory_clusters: Object.fromEntries(this.memoryClusters),
      evolution_history: this.evolutionHistory,
      tree_statistics: this.treeStatistics,
      visual_tree_data: this.getVisualTreeData(),
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKIRootMemory = new WaidesKIRootMemory();