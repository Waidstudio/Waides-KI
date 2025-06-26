import { db } from "../storage";
import { InsertProphecyLog, ProphecyLog } from "../../shared/schema";
import { eq, desc, and, like, gte } from "drizzle-orm";
import { prophecyLogs } from "../../shared/schema";
import crypto from "crypto";

export interface ProphecyLogStats {
  totalProphecies: number;
  pinnedProphecies: number;
  sharedProphecies: number;
  categoryCounts: Record<string, number>;
  recentActivity: number;
  averageConfidence: number;
}

export interface ProphecySearchFilters {
  category?: string;
  source?: string;
  pinned?: boolean;
  shared?: boolean;
  minConfidence?: number;
  searchText?: string;
  tags?: string[];
}

export interface ProphecyOfTheDay {
  prophecy: ProphecyLog;
  reason: string;
  reflectionMessage: string;
}

export class WaidesKIProphecyLogService {
  constructor() {}

  // Save prophecy to log
  async saveProphecy(prophecyData: InsertProphecyLog): Promise<ProphecyLog> {
    try {
      // Generate share token if needed
      const shareToken = prophecyData.shared 
        ? crypto.randomBytes(16).toString('hex')
        : null;

      const prophecy = await db.insert(prophecyLogs).values({
        ...prophecyData,
        shareToken,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      return prophecy[0];
    } catch (error) {
      console.error('Error saving prophecy:', error);
      throw new Error('Failed to save prophecy');
    }
  }

  // Get user prophecies with filtering and pagination
  async getUserProphecies(
    userId: string,
    filters: ProphecySearchFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ prophecies: ProphecyLog[], total: number }> {
    try {
      const offset = (page - 1) * limit;
      let whereCondition = eq(prophecyLogs.userId, userId);

      // Apply filters
      if (filters.category) {
        whereCondition = and(whereCondition, eq(prophecyLogs.category, filters.category));
      }
      if (filters.source) {
        whereCondition = and(whereCondition, eq(prophecyLogs.source, filters.source));
      }
      if (filters.pinned !== undefined) {
        whereCondition = and(whereCondition, eq(prophecyLogs.pinned, filters.pinned));
      }
      if (filters.shared !== undefined) {
        whereCondition = and(whereCondition, eq(prophecyLogs.shared, filters.shared));
      }
      if (filters.minConfidence) {
        whereCondition = and(whereCondition, gte(prophecyLogs.confidence, filters.minConfidence));
      }
      if (filters.searchText) {
        whereCondition = and(whereCondition, like(prophecyLogs.content, `%${filters.searchText}%`));
      }

      const prophecies = await db
        .select()
        .from(prophecyLogs)
        .where(whereCondition)
        .orderBy(desc(prophecyLogs.createdAt))
        .limit(limit)
        .offset(offset);

      const totalResult = await db
        .select()
        .from(prophecyLogs)
        .where(whereCondition);

      return {
        prophecies,
        total: totalResult.length
      };
    } catch (error) {
      console.error('Error getting user prophecies:', error);
      throw new Error('Failed to get prophecies');
    }
  }

  // Get prophecy by ID
  async getProphecyById(id: number, userId?: string): Promise<ProphecyLog | null> {
    try {
      let whereCondition = eq(prophecyLogs.id, id);
      
      if (userId) {
        whereCondition = and(whereCondition, eq(prophecyLogs.userId, userId));
      }

      const prophecy = await db
        .select()
        .from(prophecyLogs)
        .where(whereCondition)
        .limit(1);

      return prophecy[0] || null;
    } catch (error) {
      console.error('Error getting prophecy by ID:', error);
      throw new Error('Failed to get prophecy');
    }
  }

  // Get shared prophecy by token
  async getSharedProphecy(shareToken: string): Promise<ProphecyLog | null> {
    try {
      const prophecy = await db
        .select()
        .from(prophecyLogs)
        .where(and(
          eq(prophecyLogs.shareToken, shareToken),
          eq(prophecyLogs.shared, true)
        ))
        .limit(1);

      return prophecy[0] || null;
    } catch (error) {
      console.error('Error getting shared prophecy:', error);
      throw new Error('Failed to get shared prophecy');
    }
  }

  // Update prophecy
  async updateProphecy(
    id: number,
    userId: string,
    updates: Partial<InsertProphecyLog>
  ): Promise<ProphecyLog | null> {
    try {
      const prophecy = await db
        .update(prophecyLogs)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(and(
          eq(prophecyLogs.id, id),
          eq(prophecyLogs.userId, userId)
        ))
        .returning();

      return prophecy[0] || null;
    } catch (error) {
      console.error('Error updating prophecy:', error);
      throw new Error('Failed to update prophecy');
    }
  }

  // Delete prophecy
  async deleteProphecy(id: number, userId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(prophecyLogs)
        .where(and(
          eq(prophecyLogs.id, id),
          eq(prophecyLogs.userId, userId)
        ));

      return true;
    } catch (error) {
      console.error('Error deleting prophecy:', error);
      throw new Error('Failed to delete prophecy');
    }
  }

  // Toggle pin status
  async togglePin(id: number, userId: string): Promise<ProphecyLog | null> {
    try {
      const prophecy = await this.getProphecyById(id, userId);
      if (!prophecy) return null;

      return await this.updateProphecy(id, userId, {
        pinned: !prophecy.pinned
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
      throw new Error('Failed to toggle pin');
    }
  }

  // Get prophecy statistics
  async getProphecyStats(userId: string): Promise<ProphecyLogStats> {
    try {
      const userProphecies = await db
        .select()
        .from(prophecyLogs)
        .where(eq(prophecyLogs.userId, userId));

      const categoryCounts: Record<string, number> = {};
      let totalConfidence = 0;
      let pinnedCount = 0;
      let sharedCount = 0;

      userProphecies.forEach(prophecy => {
        // Category counts
        categoryCounts[prophecy.category] = (categoryCounts[prophecy.category] || 0) + 1;
        
        // Confidence sum
        totalConfidence += prophecy.confidence;
        
        // Pin and share counts
        if (prophecy.pinned) pinnedCount++;
        if (prophecy.shared) sharedCount++;
      });

      // Recent activity (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentProphecies = userProphecies.filter(p => 
        new Date(p.createdAt) > weekAgo
      );

      const stats: ProphecyLogStats = {
        totalProphecies: userProphecies.length,
        pinnedProphecies: pinnedCount,
        sharedProphecies: sharedCount,
        categoryCounts,
        recentActivity: recentProphecies.length,
        averageConfidence: userProphecies.length > 0 ? totalConfidence / userProphecies.length : 0
      };

      return stats;
    } catch (error) {
      console.error('Error getting prophecy stats:', error);
      throw new Error('Failed to get prophecy statistics');
    }
  }

  // Get prophecy of the day
  async getProphecyOfTheDay(userId: string): Promise<ProphecyOfTheDay | null> {
    try {
      const userProphecies = await db
        .select()
        .from(prophecyLogs)
        .where(eq(prophecyLogs.userId, userId))
        .orderBy(desc(prophecyLogs.confidence));

      if (userProphecies.length === 0) return null;

      // Select highest confidence prophecy or random high-confidence one
      let selectedProphecy: ProphecyLog;
      const highConfidenceProphecies = userProphecies.filter(p => p.confidence >= 80);
      
      if (highConfidenceProphecies.length > 0) {
        const randomIndex = Math.floor(Math.random() * highConfidenceProphecies.length);
        selectedProphecy = highConfidenceProphecies[randomIndex];
      } else {
        selectedProphecy = userProphecies[0];
      }

      const reason = selectedProphecy.confidence >= 80 
        ? "Selected for its exceptional spiritual clarity and high confidence"
        : "Chosen as your most confident prophecy for guidance";

      return {
        prophecy: selectedProphecy,
        reason,
        reflectionMessage: this.generateReflectionMessage(selectedProphecy)
      };
    } catch (error) {
      console.error('Error getting prophecy of the day:', error);
      throw new Error('Failed to get prophecy of the day');
    }
  }

  private generateReflectionMessage(prophecy: ProphecyLog): string {
    const messages = [
      `The spirits spoke through "${prophecy.source}" with profound wisdom.`,
      `This ${prophecy.category} prophecy carries ${prophecy.confidence}% certainty from the divine realm.`,
      `Meditate upon these words and let their truth guide your path.`,
      `The universe has aligned to bring you this message at the perfect time.`,
      `Trust in the wisdom that flows through this sacred prophecy.`
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Export prophecies
  async exportProphecies(userId: string, format: 'json' | 'text' = 'json'): Promise<string> {
    try {
      const prophecies = await db
        .select()
        .from(prophecyLogs)
        .where(eq(prophecyLogs.userId, userId))
        .orderBy(desc(prophecyLogs.createdAt));

      if (format === 'json') {
        return JSON.stringify(prophecies, null, 2);
      } else {
        return prophecies.map(p => 
          `[${p.createdAt}] ${p.category} - ${p.source}\n${p.content}\n(Confidence: ${p.confidence}%)\n${'='.repeat(50)}\n`
        ).join('\n');
      }
    } catch (error) {
      console.error('Error exporting prophecies:', error);
      throw new Error('Failed to export prophecies');
    }
  }

  // Bulk update prophecies
  async bulkUpdateProphecies(
    prophecyIds: number[],
    userId: string,
    updates: Partial<InsertProphecyLog>
  ): Promise<number> {
    try {
      let updatedCount = 0;
      
      for (const id of prophecyIds) {
        const result = await this.updateProphecy(id, userId, updates);
        if (result) updatedCount++;
      }
      
      return updatedCount;
    } catch (error) {
      console.error('Error bulk updating prophecies:', error);
      throw new Error('Failed to bulk update prophecies');
    }
  }

  // Add tags to prophecy
  async addTags(id: number, userId: string, tags: string[]): Promise<ProphecyLog | null> {
    try {
      const prophecy = await this.getProphecyById(id, userId);
      if (!prophecy) return null;

      const existingTags = prophecy.tags || [];
      const newTags = [...new Set([...existingTags, ...tags])];

      return await this.updateProphecy(id, userId, { tags: newTags });
    } catch (error) {
      console.error('Error adding tags:', error);
      throw new Error('Failed to add tags');
    }
  }

  // Get all user tags
  async getUserTags(userId: string): Promise<string[]> {
    try {
      const prophecies = await db
        .select()
        .from(prophecyLogs)
        .where(eq(prophecyLogs.userId, userId));

      const allTags = new Set<string>();

      prophecies.forEach(prophecy => {
        if (prophecy.tags) {
          prophecy.tags.forEach(tag => allTags.add(tag));
        }
      });

      return Array.from(allTags);
    } catch (error) {
      console.error('Error getting user tags:', error);
      return [];
    }
  }
}

// Export singleton instance
export const prophecyLogService = new WaidesKIProphecyLogService();