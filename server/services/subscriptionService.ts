/**
 * Subscription Service - Phase 2: Subscription-Based Access Control Implementation
 * Complete bot hierarchy management with subscription validation and access control
 */

import { db } from '../db';
import { 
  userSubscriptions, 
  botAccessControl, 
  subscriptionHistory, 
  botPerformanceTracking,
  BotTier,
  SubscriptionStatus,
  botTierDefinitions,
  type UserSubscription,
  type InsertUserSubscription,
  type BotAccessControl,
  type InsertBotAccessControl
} from '@shared/subscriptions';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export class SubscriptionService {
  
  /**
   * Get user's active subscription
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const [subscription] = await db
        .select()
        .from(userSubscriptions)
        .where(
          and(
            eq(userSubscriptions.userId, userId),
            eq(userSubscriptions.status, SubscriptionStatus.ACTIVE)
          )
        )
        .limit(1);

      return subscription || null;
    } catch (error) {
      console.error('❌ Error fetching user subscription:', error);
      return null;
    }
  }

  /**
   * Create new subscription for user
   */
  async createSubscription(subscriptionData: Omit<InsertUserSubscription, 'id'>): Promise<UserSubscription | null> {
    try {
      const subscriptionId = uuidv4();
      
      const [newSubscription] = await db
        .insert(userSubscriptions)
        .values({
          id: subscriptionId,
          ...subscriptionData
        })
        .returning();

      // Create corresponding access control entry
      await this.createBotAccessControl(subscriptionData.userId, subscriptionData.botTier as BotTier);

      // Log subscription history
      await this.logSubscriptionAction(
        subscriptionData.userId,
        'upgrade',
        'free',
        subscriptionData.botTier,
        subscriptionData.monthlyPrice || '0'
      );

      return newSubscription;
    } catch (error) {
      console.error('❌ Error creating subscription:', error);
      return null;
    }
  }

  /**
   * Upgrade/downgrade user subscription
   */
  async upgradeSubscription(
    userId: string, 
    newTier: BotTier, 
    paymentMethod: string = 'stripe'
  ): Promise<{ success: boolean; message: string; subscription?: UserSubscription }> {
    try {
      // Get current subscription
      const currentSubscription = await this.getUserSubscription(userId);
      const currentTier = currentSubscription?.botTier || BotTier.FREE;

      // Get tier definitions
      const newTierDef = botTierDefinitions[newTier];
      if (!newTierDef) {
        return { success: false, message: 'Invalid bot tier selected' };
      }

      // Calculate new subscription details
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

      const subscriptionData: Omit<InsertUserSubscription, 'id'> = {
        userId,
        botTier: newTier,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate,
        monthlyPrice: newTierDef.monthlyPrice.toString(),
        platformFeeRate: newTierDef.platformFeeRate.toString(),
        paymentMethod,
        features: JSON.stringify(newTierDef.features)
      };

      // Deactivate current subscription if exists
      if (currentSubscription) {
        await db
          .update(userSubscriptions)
          .set({ 
            status: SubscriptionStatus.CANCELLED,
            updatedAt: new Date()
          })
          .where(eq(userSubscriptions.id, currentSubscription.id));
      }

      // Create new subscription
      const newSubscription = await this.createSubscription(subscriptionData);
      
      if (!newSubscription) {
        return { success: false, message: 'Failed to create new subscription' };
      }

      // Update bot access control
      await this.updateBotAccessControl(userId, newTier);

      // Log the upgrade
      await this.logSubscriptionAction(
        userId,
        currentTier === BotTier.FREE ? 'upgrade' : 'change_tier',
        currentTier,
        newTier,
        newTierDef.monthlyPrice.toString()
      );

      return {
        success: true,
        message: `Successfully upgraded to ${newTierDef.displayName}`,
        subscription: newSubscription
      };

    } catch (error) {
      console.error('❌ Error upgrading subscription:', error);
      return { success: false, message: 'Subscription upgrade failed' };
    }
  }

  /**
   * Cancel user subscription
   */
  async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        return { success: false, message: 'No active subscription found' };
      }

      // Update subscription status
      await db
        .update(userSubscriptions)
        .set({ 
          status: SubscriptionStatus.CANCELLED,
          updatedAt: new Date()
        })
        .where(eq(userSubscriptions.id, subscription.id));

      // Downgrade to free tier access
      await this.updateBotAccessControl(userId, BotTier.FREE);

      // Log cancellation
      await this.logSubscriptionAction(
        userId,
        'cancel',
        subscription.botTier,
        BotTier.FREE,
        '0'
      );

      return { success: true, message: 'Subscription cancelled successfully' };

    } catch (error) {
      console.error('❌ Error cancelling subscription:', error);
      return { success: false, message: 'Subscription cancellation failed' };
    }
  }

  /**
   * Check if user has access to specific bot tier
   */
  async hasAccessToBotTier(userId: string, requiredTier: BotTier): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        // Only free tier access without subscription
        return requiredTier === BotTier.FREE;
      }

      // Check if subscription is still valid
      const now = new Date();
      if (subscription.endDate && new Date(subscription.endDate) < now) {
        // Subscription expired
        await this.expireSubscription(subscription.id);
        return requiredTier === BotTier.FREE;
      }

      // Get tier hierarchy levels for comparison
      const tierLevels = {
        [BotTier.FREE]: 0,
        [BotTier.BASIC]: 1,
        [BotTier.PRO]: 2,
        [BotTier.ELITE]: 3,
        [BotTier.MASTER]: 4,
        [BotTier.DIVINE_DELTA]: 5,
        [BotTier.COSMIC_EPSILON]: 6
      };

      const userTierLevel = tierLevels[subscription.botTier as BotTier] || 0;
      const requiredTierLevel = tierLevels[requiredTier] || 0;

      return userTierLevel >= requiredTierLevel;

    } catch (error) {
      console.error('❌ Error checking bot tier access:', error);
      return false;
    }
  }

  /**
   * Get bot access control settings for user
   */
  async getBotAccessControl(userId: string, botTier: BotTier): Promise<BotAccessControl | null> {
    try {
      const [accessControl] = await db
        .select()
        .from(botAccessControl)
        .where(
          and(
            eq(botAccessControl.userId, userId),
            eq(botAccessControl.botTier, botTier)
          )
        )
        .limit(1);

      return accessControl || null;
    } catch (error) {
      console.error('❌ Error fetching bot access control:', error);
      return null;
    }
  }

  /**
   * Create bot access control entry
   */
  async createBotAccessControl(userId: string, botTier: BotTier): Promise<void> {
    try {
      const tierDef = botTierDefinitions[botTier];
      
      const accessControlData: Omit<InsertBotAccessControl, 'id'> = {
        userId,
        botTier,
        isEnabled: true,
        dailyTradingLimit: (tierDef.maxPositionSize * 10).toString(), // 10x position size for daily limit
        monthlyTradingLimit: (tierDef.maxPositionSize * 100).toString(), // 100x for monthly
        maxPositionSize: tierDef.maxPositionSize.toString(),
        automationLevel: tierDef.automationLevel,
        strategiesEnabled: JSON.stringify(tierDef.features),
        usageCount: '0'
      };

      await db
        .insert(botAccessControl)
        .values({
          id: uuidv4(),
          ...accessControlData
        });

    } catch (error) {
      console.error('❌ Error creating bot access control:', error);
    }
  }

  /**
   * Update bot access control settings
   */
  async updateBotAccessControl(userId: string, botTier: BotTier): Promise<void> {
    try {
      const tierDef = botTierDefinitions[botTier];

      // Check if access control exists
      const existing = await this.getBotAccessControl(userId, botTier);
      
      if (existing) {
        // Update existing
        await db
          .update(botAccessControl)
          .set({
            maxPositionSize: tierDef.maxPositionSize.toString(),
            automationLevel: tierDef.automationLevel,
            strategiesEnabled: JSON.stringify(tierDef.features),
            updatedAt: new Date()
          })
          .where(eq(botAccessControl.id, existing.id));
      } else {
        // Create new
        await this.createBotAccessControl(userId, botTier);
      }

    } catch (error) {
      console.error('❌ Error updating bot access control:', error);
    }
  }

  /**
   * Log subscription action to history
   */
  async logSubscriptionAction(
    userId: string,
    action: string,
    fromTier: string,
    toTier: string,
    amount: string,
    reason?: string
  ): Promise<void> {
    try {
      await db.insert(subscriptionHistory).values({
        id: uuidv4(),
        userId,
        action,
        fromTier,
        toTier,
        amount,
        reason,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('❌ Error logging subscription action:', error);
    }
  }

  /**
   * Expire subscription
   */
  async expireSubscription(subscriptionId: string): Promise<void> {
    try {
      await db
        .update(userSubscriptions)
        .set({ 
          status: SubscriptionStatus.EXPIRED,
          updatedAt: new Date()
        })
        .where(eq(userSubscriptions.id, subscriptionId));
    } catch (error) {
      console.error('❌ Error expiring subscription:', error);
    }
  }

  /**
   * Get subscription history for user
   */
  async getSubscriptionHistory(userId: string, limit = 10) {
    try {
      return await db
        .select()
        .from(subscriptionHistory)
        .where(eq(subscriptionHistory.userId, userId))
        .orderBy(desc(subscriptionHistory.timestamp))
        .limit(limit);
    } catch (error) {
      console.error('❌ Error fetching subscription history:', error);
      return [];
    }
  }

  /**
   * Get all available bot tiers with pricing
   */
  getBotTierDefinitions() {
    return Object.entries(botTierDefinitions).map(([tier, definition]) => ({
      tier,
      ...definition
    }));
  }

  /**
   * Start free trial for user
   */
  async startFreeTrial(userId: string, botTier: BotTier, trialDays = 7): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user already had a trial
      const existingTrial = await db
        .select()
        .from(userSubscriptions)
        .where(
          and(
            eq(userSubscriptions.userId, userId),
            eq(userSubscriptions.isTrialActive, true)
          )
        )
        .limit(1);

      if (existingTrial.length > 0) {
        return { success: false, message: 'Trial already used for this account' };
      }

      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + trialDays);

      const tierDef = botTierDefinitions[botTier];
      
      const trialSubscription = await this.createSubscription({
        userId,
        botTier,
        status: SubscriptionStatus.TRIAL,
        startDate: new Date(),
        endDate: trialEndDate,
        monthlyPrice: '0',
        platformFeeRate: tierDef.platformFeeRate.toString(),
        isTrialActive: true,
        trialEndDate,
        paymentMethod: 'trial',
        features: JSON.stringify(tierDef.features)
      });

      if (!trialSubscription) {
        return { success: false, message: 'Failed to create trial subscription' };
      }

      await this.logSubscriptionAction(
        userId,
        'trial_start',
        BotTier.FREE,
        botTier,
        '0',
        `${trialDays} day trial`
      );

      return { 
        success: true, 
        message: `${trialDays}-day free trial started for ${tierDef.displayName}` 
      };

    } catch (error) {
      console.error('❌ Error starting free trial:', error);
      return { success: false, message: 'Failed to start free trial' };
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();