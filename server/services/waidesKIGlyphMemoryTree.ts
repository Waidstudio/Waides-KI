import { waidesKIKonsigilEngine } from './waidesKIKonsigilEngine';

interface GlyphNode {
  konsigil: string;
  origin_pattern: string;
  emotion_shade: string;
  strategy_essence: string;
  spiritual_signature: string;
  power_level: number;
  protection_runes: string[];
  timestamp: number;
  
  // Trade outcome data
  result: number; // Profit/loss amount
  success: boolean;
  duration_ms: number;
  exit_reason: string;
  
  // Analysis data
  power_score: number; // -1.0 to 1.0 based on result
  spiritual_evolution: number; // How much this trade taught us
  reincarnation_count: number; // How many times this pattern has been reborn
  
  // Memory connections
  parent_glyph?: string; // Evolved from this glyph
  child_glyphs: string[]; // Spawned these glyphs
  similar_patterns: string[]; // Related glyph patterns
  
  // Metadata
  notes: string;
  last_accessed: number;
  access_count: number;
  memory_strength: number; // How important this memory is (0-100)
}

interface GlyphCluster {
  cluster_id: string;
  pattern_signature: string;
  emotion_signature: string;
  member_glyphs: string[];
  cluster_power: number;
  success_rate: number;
  total_profit: number;
  dominant_protection: string;
  evolution_path: string[];
}

interface MemoryTreeStats {
  total_glyphs: number;
  active_clusters: number;
  powerful_glyphs: number;
  failed_glyphs: number;
  evolved_glyphs: number;
  memory_depth: number;
  strongest_glyph: string;
  most_profitable_pattern: string;
  tree_health_score: number;
}

export class WaidesKIGlyphMemoryTree {
  private memory_tree: Map<string, GlyphNode> = new Map();
  private glyph_clusters: Map<string, GlyphCluster> = new Map();
  private pattern_index: Map<string, string[]> = new Map(); // pattern -> glyph IDs
  private emotion_index: Map<string, string[]> = new Map(); // emotion -> glyph IDs
  private strategy_index: Map<string, string[]> = new Map(); // strategy -> glyph IDs
  
  private tree_stats: MemoryTreeStats = {
    total_glyphs: 0,
    active_clusters: 0,
    powerful_glyphs: 0,
    failed_glyphs: 0,
    evolved_glyphs: 0,
    memory_depth: 0,
    strongest_glyph: '',
    most_profitable_pattern: '',
    tree_health_score: 100
  };

  constructor() {
    this.initializeMemoryTree();
    console.log('🌳 Glyph Memory Tree Initialized - Trade Memory Crystal Storage Active');
  }

  private initializeMemoryTree(): void {
    // Start memory pruning cycle (every 6 hours)
    setInterval(() => {
      this.pruneWeakMemories();
    }, 6 * 60 * 60 * 1000);
    
    // Start cluster analysis cycle (every 2 hours)
    setInterval(() => {
      this.analyzeGlyphClusters();
    }, 2 * 60 * 60 * 1000);
  }

  // 🪬 CORE STAMPING: Store glyph with trade result
  stampGlyph(
    konsigil_data: any,
    trade_result: number,
    success: boolean,
    duration_ms: number,
    exit_reason: string,
    notes: string = ""
  ): void {
    const power_score = this.calculatePowerScore(trade_result, success, konsigil_data.power_level);
    const spiritual_evolution = this.calculateSpiritualEvolution(trade_result, konsigil_data);
    const memory_strength = this.calculateMemoryStrength(konsigil_data, trade_result);

    const glyph_node: GlyphNode = {
      konsigil: konsigil_data.konsigil,
      origin_pattern: konsigil_data.origin_pattern,
      emotion_shade: konsigil_data.emotion_shade,
      strategy_essence: konsigil_data.strategy_essence,
      spiritual_signature: konsigil_data.spiritual_signature,
      power_level: konsigil_data.power_level,
      protection_runes: konsigil_data.protection_runes,
      timestamp: konsigil_data.timestamp,
      
      result: trade_result,
      success,
      duration_ms,
      exit_reason,
      
      power_score,
      spiritual_evolution,
      reincarnation_count: 0,
      
      child_glyphs: [],
      similar_patterns: [],
      
      notes,
      last_accessed: Date.now(),
      access_count: 1,
      memory_strength
    };

    // Store in main tree
    this.memory_tree.set(konsigil_data.konsigil, glyph_node);
    
    // Update indices
    this.updateIndices(glyph_node);
    
    // Find similar patterns and create connections
    this.connectSimilarPatterns(glyph_node);
    
    // Update statistics
    this.updateTreeStats();
    
    console.log(`🌳 Glyph Stamped: ${konsigil_data.konsigil} | Result: ${trade_result.toFixed(2)} | Power Score: ${power_score.toFixed(2)}`);
  }

  // 📊 POWER SCORE: Calculate glyph effectiveness
  private calculatePowerScore(result: number, success: boolean, original_power: number): number {
    let score = 0;
    
    // Base score from result
    if (success && result > 0) {
      score = Math.min(1.0, result / 100); // Normalize to 1.0 for $100 profit
    } else if (!success && result < 0) {
      score = Math.max(-1.0, result / 100); // Normalize to -1.0 for $100 loss
    } else {
      score = 0; // Breakeven
    }
    
    // Boost score if original power was high and result was good
    if (original_power > 0.7 && success) {
      score *= 1.2;
    }
    
    // Penalize if original power was high but result was poor
    if (original_power > 0.7 && !success) {
      score *= 1.5; // Make the negative score more negative
    }
    
    return Math.max(-1.0, Math.min(1.0, score));
  }

  // ✨ SPIRITUAL EVOLUTION: How much wisdom this trade provided
  private calculateSpiritualEvolution(result: number, konsigil_data: any): number {
    let evolution = 0;
    
    // Loss teaches more than profit (pain = growth)
    if (result < 0) {
      evolution = Math.min(50, Math.abs(result) / 2); // Bigger losses = more learning
    } else if (result > 0) {
      evolution = Math.min(25, result / 4); // Modest learning from wins
    }
    
    // High confidence failures teach the most
    if (result < 0 && konsigil_data.power_level > 0.8) {
      evolution += 25;
    }
    
    // Emotional trades provide learning opportunities
    if (['GREEDY', 'FEARFUL', 'IMPATIENT'].includes(konsigil_data.emotion_shade)) {
      evolution += 15;
    }
    
    return Math.min(100, evolution);
  }

  // 🧠 MEMORY STRENGTH: Calculate importance of this memory
  private calculateMemoryStrength(konsigil_data: any, result: number): number {
    let strength = 50; // Base strength
    
    // High-impact results are more memorable
    strength += Math.min(30, Math.abs(result) / 2);
    
    // High confidence trades are more memorable
    strength += konsigil_data.power_level * 20;
    
    // Emotional trades are very memorable
    if (['GREEDY', 'FEARFUL', 'EUPHORIC'].includes(konsigil_data.emotion_shade)) {
      strength += 15;
    }
    
    // Strong protection makes memories less traumatic but still important
    if (konsigil_data.protection_runes.length >= 3) {
      strength += 10;
    }
    
    return Math.min(100, strength);
  }

  // 🔗 INDICES: Update search indices
  private updateIndices(glyph: GlyphNode): void {
    // Pattern index
    const pattern_glyphs = this.pattern_index.get(glyph.origin_pattern) || [];
    pattern_glyphs.push(glyph.konsigil);
    this.pattern_index.set(glyph.origin_pattern, pattern_glyphs);
    
    // Emotion index
    const emotion_glyphs = this.emotion_index.get(glyph.emotion_shade) || [];
    emotion_glyphs.push(glyph.konsigil);
    this.emotion_index.set(glyph.emotion_shade, emotion_glyphs);
    
    // Strategy index
    const strategy_glyphs = this.strategy_index.get(glyph.strategy_essence) || [];
    strategy_glyphs.push(glyph.konsigil);
    this.strategy_index.set(glyph.strategy_essence, strategy_glyphs);
  }

  // 🕸️ PATTERN CONNECTIONS: Find and connect similar patterns
  private connectSimilarPatterns(glyph: GlyphNode): void {
    const similar_patterns: string[] = [];
    
    // Find glyphs with same pattern but different emotions
    const pattern_matches = this.pattern_index.get(glyph.origin_pattern) || [];
    for (const other_konsigil of pattern_matches) {
      if (other_konsigil !== glyph.konsigil) {
        const other_glyph = this.memory_tree.get(other_konsigil);
        if (other_glyph && other_glyph.emotion_shade !== glyph.emotion_shade) {
          similar_patterns.push(other_konsigil);
        }
      }
    }
    
    // Find glyphs with same emotion but different patterns
    const emotion_matches = this.emotion_index.get(glyph.emotion_shade) || [];
    for (const other_konsigil of emotion_matches) {
      if (other_konsigil !== glyph.konsigil && !similar_patterns.includes(other_konsigil)) {
        const other_glyph = this.memory_tree.get(other_konsigil);
        if (other_glyph && other_glyph.origin_pattern !== glyph.origin_pattern) {
          similar_patterns.push(other_konsigil);
        }
      }
    }
    
    glyph.similar_patterns = similar_patterns.slice(0, 5); // Keep top 5 similar patterns
  }

  // 🔍 GLYPH SEARCH: Find specific glyph
  findGlyph(konsigil: string): GlyphNode | null {
    const glyph = this.memory_tree.get(konsigil);
    if (glyph) {
      glyph.last_accessed = Date.now();
      glyph.access_count++;
    }
    return glyph || null;
  }

  // 🎯 PATTERN SEARCH: Find glyphs by pattern and emotion
  findByPatternAndEmotion(pattern: string, emotion: string): GlyphNode[] {
    const pattern_glyphs = this.pattern_index.get(pattern) || [];
    const matching_glyphs: GlyphNode[] = [];
    
    for (const konsigil of pattern_glyphs) {
      const glyph = this.memory_tree.get(konsigil);
      if (glyph && glyph.emotion_shade === emotion) {
        glyph.last_accessed = Date.now();
        glyph.access_count++;
        matching_glyphs.push(glyph);
      }
    }
    
    return matching_glyphs.sort((a, b) => b.power_score - a.power_score);
  }

  // 🏆 BEST PERFORMERS: Get highest scoring glyphs
  getBestPerformingGlyphs(count: number = 10): GlyphNode[] {
    return Array.from(this.memory_tree.values())
      .filter(glyph => glyph.success && glyph.power_score > 0)
      .sort((a, b) => b.power_score - a.power_score)
      .slice(0, count);
  }

  // 💀 WORST PERFORMERS: Get lowest scoring glyphs
  getWorstPerformingGlyphs(count: number = 10): GlyphNode[] {
    return Array.from(this.memory_tree.values())
      .filter(glyph => !glyph.success && glyph.power_score < 0)
      .sort((a, b) => a.power_score - b.power_score)
      .slice(0, count);
  }

  // 🧬 GLYPH CLUSTERS: Analyze pattern clusters
  private analyzeGlyphClusters(): void {
    this.glyph_clusters.clear();
    
    // Group by pattern-emotion combinations
    const cluster_map = new Map<string, GlyphNode[]>();
    
    for (const glyph of this.memory_tree.values()) {
      const cluster_key = `${glyph.origin_pattern}_${glyph.emotion_shade}`;
      const cluster_glyphs = cluster_map.get(cluster_key) || [];
      cluster_glyphs.push(glyph);
      cluster_map.set(cluster_key, cluster_glyphs);
    }
    
    // Create cluster objects
    for (const [cluster_key, glyphs] of cluster_map.entries()) {
      if (glyphs.length >= 2) { // Only clusters with 2+ members
        const cluster_id = `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const successful_trades = glyphs.filter(g => g.success);
        const total_profit = glyphs.reduce((sum, g) => sum + g.result, 0);
        
        // Find dominant protection rune
        const protection_count = new Map<string, number>();
        glyphs.forEach(g => {
          g.protection_runes.forEach(rune => {
            protection_count.set(rune, (protection_count.get(rune) || 0) + 1);
          });
        });
        const dominant_protection = Array.from(protection_count.entries())
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
        
        const cluster: GlyphCluster = {
          cluster_id,
          pattern_signature: cluster_key,
          emotion_signature: glyphs[0].emotion_shade,
          member_glyphs: glyphs.map(g => g.konsigil),
          cluster_power: glyphs.reduce((sum, g) => sum + g.power_score, 0) / glyphs.length,
          success_rate: (successful_trades.length / glyphs.length) * 100,
          total_profit,
          dominant_protection,
          evolution_path: this.traceEvolutionPath(glyphs)
        };
        
        this.glyph_clusters.set(cluster_id, cluster);
      }
    }
    
    console.log(`🧬 Analyzed ${this.glyph_clusters.size} glyph clusters`);
  }

  // 🌱 EVOLUTION PATH: Trace how patterns evolved
  private traceEvolutionPath(glyphs: GlyphNode[]): string[] {
    return glyphs
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((g, index) => `${index + 1}:${g.konsigil.substring(0, 6)}`)
      .slice(0, 10); // Show evolution steps
  }

  // 🧹 MEMORY PRUNING: Remove weak or old memories
  private pruneWeakMemories(): void {
    const current_time = Date.now();
    const one_month = 30 * 24 * 60 * 60 * 1000;
    let pruned_count = 0;
    
    for (const [konsigil, glyph] of this.memory_tree.entries()) {
      const should_prune = 
        (glyph.memory_strength < 20 && current_time - glyph.last_accessed > one_month) ||
        (glyph.power_score < -0.8 && glyph.access_count <= 1) ||
        (current_time - glyph.timestamp > one_month * 6 && glyph.memory_strength < 40);
      
      if (should_prune) {
        this.memory_tree.delete(konsigil);
        this.removeFromIndices(glyph);
        pruned_count++;
      }
    }
    
    if (pruned_count > 0) {
      console.log(`🧹 Pruned ${pruned_count} weak memories from glyph tree`);
      this.updateTreeStats();
    }
  }

  private removeFromIndices(glyph: GlyphNode): void {
    // Remove from pattern index
    const pattern_glyphs = this.pattern_index.get(glyph.origin_pattern) || [];
    const updated_pattern = pattern_glyphs.filter(k => k !== glyph.konsigil);
    if (updated_pattern.length > 0) {
      this.pattern_index.set(glyph.origin_pattern, updated_pattern);
    } else {
      this.pattern_index.delete(glyph.origin_pattern);
    }
    
    // Remove from emotion index
    const emotion_glyphs = this.emotion_index.get(glyph.emotion_shade) || [];
    const updated_emotion = emotion_glyphs.filter(k => k !== glyph.konsigil);
    if (updated_emotion.length > 0) {
      this.emotion_index.set(glyph.emotion_shade, updated_emotion);
    } else {
      this.emotion_index.delete(glyph.emotion_shade);
    }
    
    // Remove from strategy index
    const strategy_glyphs = this.strategy_index.get(glyph.strategy_essence) || [];
    const updated_strategy = strategy_glyphs.filter(k => k !== glyph.konsigil);
    if (updated_strategy.length > 0) {
      this.strategy_index.set(glyph.strategy_essence, updated_strategy);
    } else {
      this.strategy_index.delete(glyph.strategy_essence);
    }
  }

  // 📊 STATISTICS UPDATE: Update tree statistics
  private updateTreeStats(): void {
    const glyphs = Array.from(this.memory_tree.values());
    
    this.tree_stats.total_glyphs = glyphs.length;
    this.tree_stats.active_clusters = this.glyph_clusters.size;
    this.tree_stats.powerful_glyphs = glyphs.filter(g => g.power_score > 0.6).length;
    this.tree_stats.failed_glyphs = glyphs.filter(g => g.power_score < 0).length;
    this.tree_stats.evolved_glyphs = glyphs.filter(g => g.reincarnation_count > 0).length;
    
    // Calculate memory depth (average connections per glyph)
    this.tree_stats.memory_depth = glyphs.length > 0 ? 
      glyphs.reduce((sum, g) => sum + g.similar_patterns.length, 0) / glyphs.length : 0;
    
    // Find strongest glyph
    const strongest = glyphs.reduce((max, g) => g.power_score > max.power_score ? g : max, 
      { power_score: -2, konsigil: '' });
    this.tree_stats.strongest_glyph = strongest.konsigil;
    
    // Find most profitable pattern
    const pattern_profits = new Map<string, number>();
    glyphs.forEach(g => {
      const current = pattern_profits.get(g.origin_pattern) || 0;
      pattern_profits.set(g.origin_pattern, current + g.result);
    });
    const most_profitable = Array.from(pattern_profits.entries())
      .sort(([,a], [,b]) => b - a)[0];
    this.tree_stats.most_profitable_pattern = most_profitable ? most_profitable[0] : '';
    
    // Calculate tree health (percentage of successful glyphs)
    const successful_glyphs = glyphs.filter(g => g.success).length;
    this.tree_stats.tree_health_score = glyphs.length > 0 ? 
      (successful_glyphs / glyphs.length) * 100 : 100;
  }

  // 📊 PUBLIC INTERFACE: Get memory tree statistics
  getMemoryTreeStats(): MemoryTreeStats {
    return { ...this.tree_stats };
  }

  // 🌳 GET ALL GLYPHS: Return all stored glyphs
  getAllGlyphs(): GlyphNode[] {
    return Array.from(this.memory_tree.values());
  }

  // 🧬 GET CLUSTERS: Return all glyph clusters
  getGlyphClusters(): GlyphCluster[] {
    return Array.from(this.glyph_clusters.values());
  }

  // 🔍 SEARCH INTERFACE: Search glyphs by various criteria
  searchGlyphs(criteria: {
    pattern?: string;
    emotion?: string;
    strategy?: string;
    min_power?: number;
    max_power?: number;
    success_only?: boolean;
    min_memory_strength?: number;
  }): GlyphNode[] {
    let glyphs = Array.from(this.memory_tree.values());
    
    if (criteria.pattern) {
      glyphs = glyphs.filter(g => g.origin_pattern === criteria.pattern);
    }
    if (criteria.emotion) {
      glyphs = glyphs.filter(g => g.emotion_shade === criteria.emotion);
    }
    if (criteria.strategy) {
      glyphs = glyphs.filter(g => g.strategy_essence.includes(criteria.strategy));
    }
    if (criteria.min_power !== undefined) {
      glyphs = glyphs.filter(g => g.power_score >= criteria.min_power);
    }
    if (criteria.max_power !== undefined) {
      glyphs = glyphs.filter(g => g.power_score <= criteria.max_power);
    }
    if (criteria.success_only) {
      glyphs = glyphs.filter(g => g.success);
    }
    if (criteria.min_memory_strength) {
      glyphs = glyphs.filter(g => g.memory_strength >= criteria.min_memory_strength);
    }
    
    return glyphs.sort((a, b) => b.power_score - a.power_score);
  }
}

export const waidesKIGlyphMemoryTree = new WaidesKIGlyphMemoryTree();