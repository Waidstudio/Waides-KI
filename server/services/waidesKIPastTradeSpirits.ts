/**
 * STEP 50: Past Trade Spirits - Ancient Trade Log
 * Stores and retrieves past trading decisions with their wisdom and outcomes
 * Creates a spiritual database of trading memory for ancestral consultation
 */

interface TradeSpirit {
  id: string;
  context_hash: string;
  context_data: any;
  feedback: string;
  result: 'win' | 'loss';
  profit_loss: number;
  timestamp: Date;
  market_conditions: string;
  emotional_state: string;
  konslang_echo: string;
  wisdom_weight: number; // 0-100 based on accuracy over time
  spirit_strength: number; // how often this advice proved correct
}

interface SpiritQuery {
  context_hash: string;
  similar_spirits: TradeSpirit[];
  total_count: number;
  success_rate: number;
  dominant_feedback: string;
  konslang_wisdom: string;
}

export class WaidesKIPastTradeSpirits {
  private spirits: TradeSpirit[] = [];
  private maxSpirits = 1000; // Keep last 1000 trade spirits
  
  private konslangSpiritWords = {
    'ael\'kor': 'from past voices',
    'ri\'saal': 'echo of decision', 
    'eth\'valen': 'wisdom born in trial',
    'nou\'mar': 'return path of learning',
    'vel\'thara': 'ancient guidance speaks',
    'mor\'keleth': 'shadow of old mistake',
    'sil\'varien': 'light of past success',
    'dun\'morogh': 'deep memory stirs'
  };

  /**
   * Record a new trade spirit with context and outcome
   */
  recordSpirit(
    trade_id: string,
    context_hash: string,
    context_data: any,
    feedback: string,
    result: 'win' | 'loss',
    profit_loss: number = 0,
    market_conditions: string = '',
    emotional_state: string = 'neutral'
  ): void {
    const konslang_echo = this.selectKonslangEcho(result, feedback);
    
    const spirit: TradeSpirit = {
      id: trade_id,
      context_hash,
      context_data,
      feedback,
      result,
      profit_loss,
      timestamp: new Date(),
      market_conditions,
      emotional_state,
      konslang_echo,
      wisdom_weight: result === 'win' ? 75 : 25, // Initial weight
      spirit_strength: 1
    };

    this.spirits.push(spirit);
    this.updateSpiritStrengths(context_hash, result);
    this.pruneOldSpirits();
    
    console.log(`👻 Spirit recorded: ${trade_id} - ${konslang_echo}`);
  }

  /**
   * Query spirits with similar trading context
   */
  querySimilarSpirits(context_hash: string): SpiritQuery {
    const similarSpirits = this.spirits.filter(s => s.context_hash === context_hash);
    
    if (similarSpirits.length === 0) {
      return {
        context_hash,
        similar_spirits: [],
        total_count: 0,
        success_rate: 0,
        dominant_feedback: '',
        konslang_wisdom: 'nou\'mar - no echoes from the past'
      };
    }

    const successCount = similarSpirits.filter(s => s.result === 'win').length;
    const successRate = (successCount / similarSpirits.length) * 100;
    
    // Find most common feedback weighted by spirit strength
    const feedbackCounts = new Map<string, number>();
    similarSpirits.forEach(spirit => {
      const currentCount = feedbackCounts.get(spirit.feedback) || 0;
      feedbackCounts.set(spirit.feedback, currentCount + spirit.spirit_strength);
    });

    const dominantFeedback = Array.from(feedbackCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // Select konslang wisdom based on success rate
    let konslangWisdom: string;
    if (successRate >= 70) {
      konslangWisdom = 'sil\'varien - light of past success guides you';
    } else if (successRate <= 30) {
      konslangWisdom = 'mor\'keleth - shadow of old mistake warns you';
    } else {
      konslangWisdom = 'vel\'thara - ancient guidance speaks with mixed voice';
    }

    return {
      context_hash,
      similar_spirits: similarSpirits.sort((a, b) => b.spirit_strength - a.spirit_strength),
      total_count: similarSpirits.length,
      success_rate: successRate,
      dominant_feedback: dominantFeedback,
      konslang_wisdom
    };
  }

  /**
   * Get all trade spirits with filtering options
   */
  getAllSpirits(filter?: {
    result?: 'win' | 'loss';
    min_wisdom_weight?: number;
    days_back?: number;
  }): TradeSpirit[] {
    let filteredSpirits = [...this.spirits];

    if (filter) {
      if (filter.result) {
        filteredSpirits = filteredSpirits.filter(s => s.result === filter.result);
      }
      
      if (filter.min_wisdom_weight) {
        filteredSpirits = filteredSpirits.filter(s => s.wisdom_weight >= filter.min_wisdom_weight);
      }
      
      if (filter.days_back) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filter.days_back);
        filteredSpirits = filteredSpirits.filter(s => s.timestamp >= cutoffDate);
      }
    }

    return filteredSpirits.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get spirit statistics and wisdom insights
   */
  getSpiritStatistics(): any {
    const totalSpirits = this.spirits.length;
    const winSpirits = this.spirits.filter(s => s.result === 'win').length;
    const successRate = totalSpirits > 0 ? (winSpirits / totalSpirits) * 100 : 0;
    
    const avgWisdomWeight = totalSpirits > 0 
      ? this.spirits.reduce((sum, s) => sum + s.wisdom_weight, 0) / totalSpirits 
      : 0;

    // Find most common feedback patterns
    const feedbackPatterns = new Map<string, number>();
    this.spirits.forEach(spirit => {
      const count = feedbackPatterns.get(spirit.feedback) || 0;
      feedbackPatterns.set(spirit.feedback, count + 1);
    });

    const topFeedback = Array.from(feedbackPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Context diversity
    const uniqueContexts = new Set(this.spirits.map(s => s.context_hash)).size;
    const contextDiversity = totalSpirits > 0 ? (uniqueContexts / totalSpirits) * 100 : 0;

    return {
      total_spirits: totalSpirits,
      win_spirits: winSpirits,
      loss_spirits: totalSpirits - winSpirits,
      success_rate: successRate,
      avg_wisdom_weight: avgWisdomWeight,
      context_diversity: contextDiversity,
      top_feedback_patterns: topFeedback,
      spirit_memory_health: this.calculateMemoryHealth(),
      konslang_summary: this.generateKonslangSummary()
    };
  }

  /**
   * Update spirit strengths based on new outcomes
   */
  private updateSpiritStrengths(context_hash: string, actual_result: 'win' | 'loss'): void {
    this.spirits
      .filter(s => s.context_hash === context_hash)
      .forEach(spirit => {
        // Increase strength if the spirit's advice would have predicted this outcome
        const predictedCorrectly = (
          (spirit.result === 'win' && actual_result === 'win') ||
          (spirit.result === 'loss' && actual_result === 'loss')
        );
        
        if (predictedCorrectly) {
          spirit.spirit_strength = Math.min(10, spirit.spirit_strength + 0.5);
          spirit.wisdom_weight = Math.min(100, spirit.wisdom_weight + 5);
        } else {
          spirit.spirit_strength = Math.max(0.1, spirit.spirit_strength - 0.2);
          spirit.wisdom_weight = Math.max(0, spirit.wisdom_weight - 2);
        }
      });
  }

  /**
   * Select appropriate konslang echo for the trade spirit
   */
  private selectKonslangEcho(result: 'win' | 'loss', feedback: string): string {
    if (result === 'win') {
      if (feedback.includes('hold') || feedback.includes('patience')) {
        return 'eth\'valen';
      } else {
        return 'sil\'varien';
      }
    } else {
      if (feedback.includes('never') || feedback.includes('avoid')) {
        return 'mor\'keleth';
      } else {
        return 'ri\'saal';
      }
    }
  }

  /**
   * Prune old spirits to maintain performance
   */
  private pruneOldSpirits(): void {
    if (this.spirits.length > this.maxSpirits) {
      // Keep the most recent spirits and highest wisdom weight spirits
      const sortedSpirits = this.spirits.sort((a, b) => {
        // Combine recency and wisdom weight for sorting
        const aScore = (Date.now() - a.timestamp.getTime()) / 86400000 + (100 - a.wisdom_weight);
        const bScore = (Date.now() - b.timestamp.getTime()) / 86400000 + (100 - b.wisdom_weight);
        return aScore - bScore;
      });
      
      this.spirits = sortedSpirits.slice(0, this.maxSpirits);
      console.log(`🧹 Pruned spirits to ${this.maxSpirits}, keeping strongest memories`);
    }
  }

  /**
   * Calculate overall memory health
   */
  private calculateMemoryHealth(): string {
    const totalSpirits = this.spirits.length;
    const highWisdomSpirits = this.spirits.filter(s => s.wisdom_weight >= 70).length;
    const recentSpirits = this.spirits.filter(s => 
      Date.now() - s.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000 // 7 days
    ).length;

    const healthScore = totalSpirits > 0 
      ? ((highWisdomSpirits / totalSpirits) * 0.6 + (recentSpirits / totalSpirits) * 0.4) * 100
      : 0;

    if (healthScore >= 80) return 'EXCELLENT';
    if (healthScore >= 60) return 'GOOD';
    if (healthScore >= 40) return 'MODERATE';
    if (healthScore >= 20) return 'WEAK';
    return 'POOR';
  }

  /**
   * Generate konslang summary of spirit wisdom
   */
  private generateKonslangSummary(): string {
    const stats = this.getSpiritStatistics();
    
    if (stats.total_spirits === 0) {
      return 'nou\'mar - the memory vault awaits first whispers';
    }
    
    if (stats.success_rate >= 70) {
      return 'sil\'varien - the ancestors smile upon your path';
    } else if (stats.success_rate <= 30) {
      return 'mor\'keleth - shadows of old mistakes linger in memory';
    } else {
      return 'vel\'thara - spirits speak with voices both light and shadow';
    }
  }

  /**
   * Clear all spirits (admin function)
   */
  clearAllSpirits(): void {
    this.spirits = [];
    console.log('🔥 All trade spirits cleared from memory');
  }

  /**
   * Export spirits for backup/analysis
   */
  exportSpirits(): any {
    return {
      spirits: this.spirits,
      export_timestamp: new Date(),
      total_count: this.spirits.length,
      konslang_dictionary: this.konslangSpiritWords
    };
  }

  /**
   * Import spirits from backup
   */
  importSpirits(spiritData: any): void {
    if (spiritData.spirits && Array.isArray(spiritData.spirits)) {
      this.spirits = spiritData.spirits.map(s => ({
        ...s,
        timestamp: new Date(s.timestamp)
      }));
      console.log(`👻 Imported ${this.spirits.length} trade spirits from backup`);
    }
  }
}

export const waidesKIPastTradeSpirits = new WaidesKIPastTradeSpirits();