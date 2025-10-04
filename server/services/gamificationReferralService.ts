/**
 * 🎮 Waides KI Gamification & Referral System
 * User engagement, rewards, and referral tracking
 */

import { db } from '../db';
import { wallets } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { smaisikaMiningEngine } from './smaisikaMiningEngine';

export interface UserLevel {
  level: number;
  name: string;
  xpRequired: number;
  xpCurrent: number;
  badge: string;
  rewards: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  smaiSikaReward: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: {
    xp: number;
    smaiSika: number;
  };
  expiresAt: Date;
  completed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  totalXP: number;
  totalProfit: number;
  winRate: number;
  level: number;
  badge: string;
}

export interface ReferralStats {
  code: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number; // In Smaisika
  pendingRewards: number;
  referralList: {
    username: string;
    joinedAt: Date;
    status: 'active' | 'inactive';
    earnedFromReferral: number;
  }[];
}

// Level definitions
const LEVELS = [
  { level: 1, name: 'Bronze Trader', xpRequired: 0, badge: '🥉' },
  { level: 2, name: 'Bronze Pro', xpRequired: 100, badge: '🥉⭐' },
  { level: 3, name: 'Silver Trader', xpRequired: 300, badge: '🥈' },
  { level: 4, name: 'Silver Pro', xpRequired: 600, badge: '🥈⭐' },
  { level: 5, name: 'Gold Trader', xpRequired: 1000, badge: '🥇' },
  { level: 6, name: 'Gold Pro', xpRequired: 1500, badge: '🥇⭐' },
  { level: 7, name: 'Diamond Trader', xpRequired: 2500, badge: '💎' },
  { level: 8, name: 'Diamond Elite', xpRequired: 4000, badge: '💎⭐' },
  { level: 9, name: 'Master Trader', xpRequired: 6000, badge: '👑' },
  { level: 10, name: 'Legendary Cosmic', xpRequired: 10000, badge: '🌟' }
];

class GamificationReferralService {
  // Calculate user level from XP
  calculateLevel(totalXP: number): UserLevel {
    let currentLevel = LEVELS[0];
    
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalXP >= LEVELS[i].xpRequired) {
        currentLevel = LEVELS[i];
        break;
      }
    }

    const nextLevel = LEVELS[currentLevel.level] || currentLevel;
    const xpForNext = nextLevel.xpRequired - currentLevel.xpRequired;
    const xpProgress = totalXP - currentLevel.xpRequired;

    return {
      level: currentLevel.level,
      name: currentLevel.name,
      xpRequired: nextLevel.xpRequired,
      xpCurrent: totalXP,
      badge: currentLevel.badge,
      rewards: this.getLevelRewards(currentLevel.level)
    };
  }

  private getLevelRewards(level: number): string[] {
    const rewards: string[] = [];
    
    if (level >= 3) rewards.push('Access to Silver Challenges');
    if (level >= 5) rewards.push('10% XP Boost');
    if (level >= 7) rewards.push('Priority Support');
    if (level >= 9) rewards.push('VIP Dashboard Access');
    if (level >= 10) rewards.push('Legendary Trader Badge', 'Cosmic Trading Insights');
    
    return rewards;
  }

  // Award XP for trade
  async awardTradeXP(userId: number, tradeOutcome: 'win' | 'loss', profitAmount: number): Promise<{ xp: number; levelUp: boolean; newLevel?: UserLevel }> {
    let xp = 0;
    
    if (tradeOutcome === 'win') {
      xp = 10; // Base XP per winning trade
      // Bonus XP for larger profits
      if (profitAmount > 100) xp += 5;
      if (profitAmount > 500) xp += 10;
      if (profitAmount > 1000) xp += 20;
    } else {
      xp = 2; // Small XP even for losses (learning experience)
    }

    const currentXP = await this.getUserTotalXP(userId);
    const oldLevel = this.calculateLevel(currentXP);
    const newXP = currentXP + xp;
    const newLevel = this.calculateLevel(newXP);

    await this.updateUserXP(userId, newXP);

    return {
      xp,
      levelUp: newLevel.level > oldLevel.level,
      newLevel: newLevel.level > oldLevel.level ? newLevel : undefined
    };
  }

  // Get user total XP (stored in memory or database)
  private async getUserTotalXP(userId: number): Promise<number> {
    // In production, this would fetch from database
    // For now, return a simulated value
    return 450; // Example XP
  }

  // Update user XP
  private async updateUserXP(userId: number, newXP: number): Promise<void> {
    // In production, this would update database
    console.log(`User ${userId} XP updated to ${newXP}`);
  }

  // Get user achievements
  async getUserAchievements(userId: number): Promise<Achievement[]> {
    // Simulated achievements
    return [
      {
        id: 'first_trade',
        name: 'First Trade',
        description: 'Complete your first trade',
        icon: '🎯',
        xpReward: 10,
        smaiSikaReward: 5,
        unlocked: true,
        unlockedAt: new Date('2024-10-01')
      },
      {
        id: 'ten_wins',
        name: '10 Winning Trades',
        description: 'Win 10 trades in a row',
        icon: '🔥',
        xpReward: 50,
        smaiSikaReward: 25,
        unlocked: true,
        unlockedAt: new Date('2024-10-03')
      },
      {
        id: 'profitable_week',
        name: 'Profitable Week',
        description: 'End the week with profit',
        icon: '💰',
        xpReward: 100,
        smaiSikaReward: 50,
        unlocked: false
      },
      {
        id: 'master_binary',
        name: 'Binary Master',
        description: 'Complete 100 binary options trades',
        icon: '🎓',
        xpReward: 200,
        smaiSikaReward: 100,
        unlocked: false
      },
      {
        id: 'referral_king',
        name: 'Referral King',
        description: 'Refer 10 active traders',
        icon: '👑',
        xpReward: 300,
        smaiSikaReward: 150,
        unlocked: false
      }
    ];
  }

  // Get daily challenges
  async getDailyChallenges(userId: number): Promise<DailyChallenge[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return [
      {
        id: 'daily_trades',
        title: 'Complete 5 Trades',
        description: 'Execute 5 trades today',
        target: 5,
        progress: 3,
        reward: { xp: 25, smaiSika: 10 },
        expiresAt: tomorrow,
        completed: false
      },
      {
        id: 'daily_profit',
        title: 'Earn $50 Profit',
        description: 'Make at least $50 profit today',
        target: 50,
        progress: 32,
        reward: { xp: 40, smaiSika: 20 },
        expiresAt: tomorrow,
        completed: false
      },
      {
        id: 'daily_streak',
        title: '3 Winning Trades',
        description: 'Win 3 trades in a row',
        target: 3,
        progress: 2,
        reward: { xp: 30, smaiSika: 15 },
        expiresAt: tomorrow,
        completed: false
      }
    ];
  }

  // Get leaderboard
  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    // Simulated leaderboard data
    // In production, this would query from database
    return [
      {
        rank: 1,
        userId: 5,
        username: 'CosmicTrader',
        totalXP: 8500,
        totalProfit: 45678.90,
        winRate: 92.5,
        level: 9,
        badge: '👑'
      },
      {
        rank: 2,
        userId: 12,
        username: 'DiamondHands',
        totalXP: 6800,
        totalProfit: 38234.50,
        winRate: 88.3,
        level: 8,
        badge: '💎⭐'
      },
      {
        rank: 3,
        userId: 2,
        username: 'Nwaora Chigozie',
        totalXP: 5200,
        totalProfit: 32145.75,
        winRate: 94.2,
        level: 7,
        badge: '💎'
      }
    ];
  }

  // Generate referral code
  generateReferralCode(userId: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'WAI-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Get referral stats
  async getReferralStats(userId: number): Promise<ReferralStats> {
    // In production, fetch from database
    const referralCode = this.generateReferralCode(userId);
    
    return {
      code: referralCode,
      totalReferrals: 8,
      activeReferrals: 5,
      totalEarned: 247.50, // In Smaisika
      pendingRewards: 82.50,
      referralList: [
        {
          username: 'Trader_A',
          joinedAt: new Date('2024-09-15'),
          status: 'active',
          earnedFromReferral: 45.00
        },
        {
          username: 'Trader_B',
          joinedAt: new Date('2024-09-20'),
          status: 'active',
          earnedFromReferral: 62.50
        },
        {
          username: 'Trader_C',
          joinedAt: new Date('2024-09-28'),
          status: 'inactive',
          earnedFromReferral: 15.00
        }
      ]
    };
  }

  // Process referral reward
  async processReferralReward(referrerId: number, refereeId: number, eventType: 'signup' | 'first_trade' | 'subscription'): Promise<{ success: boolean; reward: number }> {
    let reward = 0;
    
    switch (eventType) {
      case 'signup':
        reward = 10; // 10 Smaisika for signup
        break;
      case 'first_trade':
        reward = 25; // 25 Smaisika for first trade
        break;
      case 'subscription':
        reward = 50; // 50 Smaisika for subscription
        break;
    }

    // Award to referrer
    await smaisikaMiningEngine.addSmaiSikaToWallet(referrerId, reward);
    
    console.log(`💰 Referral reward: User ${referrerId} earned ${reward} Smaisika from User ${refereeId} (${eventType})`);

    return {
      success: true,
      reward
    };
  }

  // Calculate referral bonus (5% of referred user's profits)
  async calculateReferralBonus(referrerId: number, refereeProfit: number): Promise<number> {
    const bonusPercent = 0.05; // 5%
    const bonus = refereeProfit * bonusPercent;
    
    // Award bonus to referrer
    await smaisikaMiningEngine.addSmaiSikaToWallet(referrerId, bonus);
    
    console.log(`🎁 Referral bonus: User ${referrerId} earned ${bonus.toFixed(2)} Smaisika (5% of ${refereeProfit})`);
    
    return bonus;
  }
}

// Export singleton instance
export const gamificationReferral = new GamificationReferralService();
