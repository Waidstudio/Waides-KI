import { db } from '../storage';
import { memories, wallets, trades, users } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface KonsLangMemoryData {
  lastTradeTime?: number;
  lastResult?: 'profit' | 'loss' | 'neutral';
  consecutiveLosses?: number;
  consecutiveWins?: number;
  emotionalState?: 'calm' | 'excited' | 'fearful' | 'greedy';
  tradingPatterns?: string[];
  riskTolerance?: number;
  moralityScore?: number;
  spiritualAlignment?: number;
  lastKonsMessage?: string;
  tradingBehavior?: {
    averageHoldTime: number;
    preferredTimeOfDay: string;
    riskPerTrade: number;
    successRate: number;
  };
}

export interface BiometricMemoryData {
  lastAuthTime: number;
  authCount: number;
  deviceFingerprint?: string;
  securityLevel: 'low' | 'medium' | 'high';
  suspiciousActivity?: boolean;
}

export interface DecisionMemoryData {
  decisionType: string;
  outcome: 'success' | 'failure' | 'pending';
  confidence: number;
  reasoning: string;
  timestamp: number;
  context?: any;
}

export class KonsLangMemoryController {
  // Append memory to existing user memory data
  async appendMemory(userId: number, memoryType: 'trade' | 'decision' | 'konslang' | 'biometric', memoryObj: any): Promise<void> {
    try {
      await db.insert(memories).values({
        userId,
        memoryType,
        memoryData: memoryObj
      });
    } catch (error) {
      console.error('Error appending memory:', error);
      throw new Error('Failed to append memory');
    }
  }

  // Fetch consolidated memory for a user
  async fetchMemory(userId: number, memoryType?: string): Promise<any> {
    try {
      let query = db.select().from(memories).where(eq(memories.userId, userId));
      
      if (memoryType) {
        query = query.where(and(eq(memories.userId, userId), eq(memories.memoryType, memoryType)));
      }
      
      const userMemories = await query.orderBy(desc(memories.createdAt)).limit(100);
      
      // Consolidate memories by type
      const consolidatedMemory: any = {
        trade: {},
        decision: [],
        konslang: {},
        biometric: {}
      };

      userMemories.forEach(memory => {
        if (memory.memoryType === 'trade') {
          consolidatedMemory.trade = { ...consolidatedMemory.trade, ...memory.memoryData };
        } else if (memory.memoryType === 'decision') {
          consolidatedMemory.decision.push(memory.memoryData);
        } else if (memory.memoryType === 'konslang') {
          consolidatedMemory.konslang = { ...consolidatedMemory.konslang, ...memory.memoryData };
        } else if (memory.memoryType === 'biometric') {
          consolidatedMemory.biometric = { ...consolidatedMemory.biometric, ...memory.memoryData };
        }
      });

      return consolidatedMemory;
    } catch (error) {
      console.error('Error fetching memory:', error);
      return {};
    }
  }

  // Enhanced trading decision logic with memory integration
  async shouldAllowTrade(userId: number, tradeAmount: number, tradeType: 'BUY' | 'SELL'): Promise<{
    allowed: boolean;
    reason: string;
    confidence: number;
    konsAdvice: string;
  }> {
    try {
      const memory = await this.fetchMemory(userId, 'trade') as { trade: KonsLangMemoryData };
      const tradeMemory = memory.trade || {};
      
      // Get user wallet for balance checks
      const userWallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
      if (!userWallet.length) {
        return {
          allowed: false,
          reason: 'No wallet found',
          confidence: 0,
          konsAdvice: 'Zeth\'mah kolan - The path requires foundation first'
        };
      }

      const wallet = userWallet[0];
      const currentTime = Date.now();
      
      // Check consecutive losses threshold
      if (tradeMemory.consecutiveLosses && tradeMemory.consecutiveLosses >= 3) {
        const timeSinceLastLoss = currentTime - (tradeMemory.lastTradeTime || 0);
        const coolingPeriod = 30 * 60 * 1000; // 30 minutes
        
        if (timeSinceLastLoss < coolingPeriod) {
          return {
            allowed: false,
            reason: 'Cooling period active after consecutive losses',
            confidence: 95,
            konsAdvice: 'Mel\'thara vash - The spirit must rest before battle returns'
          };
        }
      }

      // Check emotional state
      if (tradeMemory.emotionalState === 'fearful' || tradeMemory.emotionalState === 'greedy') {
        return {
          allowed: false,
          reason: `Emotional trading detected: ${tradeMemory.emotionalState}`,
          confidence: 80,
          konsAdvice: tradeMemory.emotionalState === 'fearful' 
            ? 'Keth\'nara shai - Fear clouds the vision of truth'
            : 'Dom\'thalar wei - Greed devours the wise trader'
        };
      }

      // Check balance requirements
      const requiredBalance = parseFloat(tradeAmount.toString());
      const availableBalance = parseFloat(wallet.smaiBalance.toString()) - parseFloat(wallet.locked.toString());
      
      if (availableBalance < requiredBalance) {
        return {
          allowed: false,
          reason: 'Insufficient balance',
          confidence: 100,
          konsAdvice: 'Vel\'thara koms - The treasure must exist before the quest begins'
        };
      }

      // Check divine approval and karma
      if (!wallet.divineApproval || wallet.karmaScore < 50) {
        return {
          allowed: false,
          reason: 'Divine approval or karma insufficient',
          confidence: 90,
          konsAdvice: 'Shai\'melor thek - The cosmic balance must be restored first'
        };
      }

      // All checks passed
      return {
        allowed: true,
        reason: 'All conditions favorable',
        confidence: tradeMemory.successRate || 75,
        konsAdvice: 'Nal\'thara vos - The path is clear for the worthy trader'
      };

    } catch (error) {
      console.error('Error in trade decision logic:', error);
      return {
        allowed: false,
        reason: 'System error during evaluation',
        confidence: 0,
        konsAdvice: 'Keth\'salar mor - The cosmic forces are in chaos'
      };
    }
  }

  // Record trade outcome and update memory
  async recordTradeOutcome(userId: number, tradeId: number, outcome: 'profit' | 'loss' | 'neutral', amount: number): Promise<void> {
    try {
      const currentMemory = await this.fetchMemory(userId, 'trade') as { trade: KonsLangMemoryData };
      const tradeMemory = currentMemory.trade || {};
      
      const updatedMemory: KonsLangMemoryData = {
        ...tradeMemory,
        lastTradeTime: Date.now(),
        lastResult: outcome,
        consecutiveLosses: outcome === 'loss' ? (tradeMemory.consecutiveLosses || 0) + 1 : 0,
        consecutiveWins: outcome === 'profit' ? (tradeMemory.consecutiveWins || 0) + 1 : 0,
        emotionalState: this.calculateEmotionalState(outcome, tradeMemory),
      };

      // Update trading behavior analytics
      if (updatedMemory.tradingBehavior) {
        const behavior = updatedMemory.tradingBehavior;
        const totalTrades = (behavior.successRate * 10) || 1; // Estimate based on success rate
        const successfulTrades = outcome === 'profit' ? totalTrades + 1 : totalTrades;
        
        updatedMemory.tradingBehavior = {
          ...behavior,
          successRate: (successfulTrades / (totalTrades + 1)) * 100,
          riskPerTrade: Math.abs(amount)
        };
      } else {
        updatedMemory.tradingBehavior = {
          averageHoldTime: 3600, // 1 hour default
          preferredTimeOfDay: new Date().getHours() > 12 ? 'afternoon' : 'morning',
          riskPerTrade: Math.abs(amount),
          successRate: outcome === 'profit' ? 100 : 0
        };
      }

      await this.appendMemory(userId, 'trade', updatedMemory);

      // Update wallet karma and energy based on outcome
      const karmaChange = outcome === 'profit' ? 5 : -3;
      const energyChange = outcome === 'profit' ? 10 : -5;
      
      await db.update(wallets)
        .set({
          karmaScore: Math.max(0, Math.min(200, karmaChange)),
          tradeEnergy: Math.max(0, Math.min(100, energyChange)),
          updatedAt: new Date()
        })
        .where(eq(wallets.userId, userId));

    } catch (error) {
      console.error('Error recording trade outcome:', error);
      throw new Error('Failed to record trade outcome');
    }
  }

  // Calculate emotional state based on recent trading history
  private calculateEmotionalState(latestOutcome: 'profit' | 'loss' | 'neutral', memory: KonsLangMemoryData): 'calm' | 'excited' | 'fearful' | 'greedy' {
    const consecutiveLosses = memory.consecutiveLosses || 0;
    const consecutiveWins = memory.consecutiveWins || 0;
    
    if (consecutiveLosses >= 2) return 'fearful';
    if (consecutiveWins >= 3) return 'greedy';
    if (latestOutcome === 'profit' && consecutiveWins >= 1) return 'excited';
    
    return 'calm';
  }

  // Get memory statistics for analysis
  async getMemoryStatistics(userId: number): Promise<{
    totalTrades: number;
    successRate: number;
    averageHoldTime: number;
    riskLevel: string;
    emotionalStability: number;
    karmaScore: number;
    memoryHealth: 'excellent' | 'good' | 'fair' | 'poor';
  }> {
    try {
      const memory = await this.fetchMemory(userId);
      const tradeMemory = memory.trade as KonsLangMemoryData || {};
      const decisions = memory.decision || [];
      
      const userWallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
      const wallet = userWallet[0];
      
      const totalDecisions = decisions.length;
      const successfulDecisions = decisions.filter((d: DecisionMemoryData) => d.outcome === 'success').length;
      const successRate = totalDecisions > 0 ? (successfulDecisions / totalDecisions) * 100 : 0;
      
      const emotionalStability = this.calculateEmotionalStability(tradeMemory);
      const memoryHealth = this.assessMemoryHealth(successRate, emotionalStability, wallet?.karmaScore || 0);
      
      return {
        totalTrades: totalDecisions,
        successRate,
        averageHoldTime: tradeMemory.tradingBehavior?.averageHoldTime || 0,
        riskLevel: tradeMemory.riskTolerance ? (tradeMemory.riskTolerance > 0.7 ? 'high' : tradeMemory.riskTolerance > 0.4 ? 'medium' : 'low') : 'medium',
        emotionalStability,
        karmaScore: wallet?.karmaScore || 0,
        memoryHealth
      };
    } catch (error) {
      console.error('Error getting memory statistics:', error);
      return {
        totalTrades: 0,
        successRate: 0,
        averageHoldTime: 0,
        riskLevel: 'unknown',
        emotionalStability: 0,
        karmaScore: 0,
        memoryHealth: 'poor'
      };
    }
  }

  private calculateEmotionalStability(memory: KonsLangMemoryData): number {
    const losses = memory.consecutiveLosses || 0;
    const wins = memory.consecutiveWins || 0;
    const emotionalState = memory.emotionalState || 'calm';
    
    let stability = 100;
    stability -= losses * 15; // Each loss reduces stability
    stability += Math.min(wins * 5, 20); // Wins improve stability (capped)
    
    if (emotionalState === 'fearful') stability -= 25;
    if (emotionalState === 'greedy') stability -= 20;
    if (emotionalState === 'excited') stability -= 5;
    
    return Math.max(0, Math.min(100, stability));
  }

  private assessMemoryHealth(successRate: number, emotionalStability: number, karmaScore: number): 'excellent' | 'good' | 'fair' | 'poor' {
    const overallScore = (successRate + emotionalStability + karmaScore) / 3;
    
    if (overallScore >= 80) return 'excellent';
    if (overallScore >= 65) return 'good';
    if (overallScore >= 45) return 'fair';
    return 'poor';
  }

  // Clear old memories to prevent data bloat
  async pruneOldMemories(userId: number, daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      await db.delete(memories)
        .where(and(
          eq(memories.userId, userId),
          // Add date comparison when available
        ));
    } catch (error) {
      console.error('Error pruning old memories:', error);
    }
  }
}

export const konsLangMemoryController = new KonsLangMemoryController();