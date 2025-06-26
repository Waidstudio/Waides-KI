import { db } from "../storage";
import { InsertProphecyLog, ProphecyLog } from "../../shared/schema";
import { eq, desc, and, like } from "drizzle-orm";
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
}

  // Save prophecy to log
  async saveProphecy(prophecyData: InsertProphecyLog): Promise<ProphecyLog> {
    try {
      // Generate share token if needed
      const shareToken = prophecyData.shared 
        ? crypto.randomBytes(16).toString('hex')
        : null;

      const prophecy = await this.storage.db.insert(prophecyLogs).values({
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

  // Get user's prophecy log with filters
  async getUserProphecies(
    userId: string, 
    filters: ProphecySearchFilters = {},
    limit: number = 50,
    offset: number = 0
  ): Promise<ProphecyLog[]> {
    try {
      let whereConditions = [eq(prophecyLogs.userId, userId)];

      // Apply filters
      if (filters.category) {
        whereConditions.push(eq(prophecyLogs.category, filters.category));
      }
      if (filters.source) {
        whereConditions.push(eq(prophecyLogs.source, filters.source));
      }
      if (filters.pinned !== undefined) {
        whereConditions.push(eq(prophecyLogs.pinned, filters.pinned));
      }
      if (filters.shared !== undefined) {
        whereConditions.push(eq(prophecyLogs.shared, filters.shared));
      }
      if (filters.searchText) {
        whereConditions.push(like(prophecyLogs.content, `%${filters.searchText}%`));
      }

      const prophecies = await this.storage.db
        .select()
        .from(prophecyLogs)
        .where(and(...whereConditions))
        .orderBy(desc(prophecyLogs.pinned), desc(prophecyLogs.createdAt))
        .limit(limit)
        .offset(offset);

      return prophecies;
    } catch (error) {
      console.error('Error fetching prophecies:', error);
      throw new Error('Failed to fetch prophecies');
    }
  }

  // Get prophecy by ID
  async getProphecyById(id: number, userId?: string): Promise<ProphecyLog | null> {
    try {
      const whereConditions = userId 
        ? [eq(prophecyLogs.id, id), eq(prophecyLogs.userId, userId)]
        : [eq(prophecyLogs.id, id)];

      const prophecy = await this.storage.db
        .select()
        .from(prophecyLogs)
        .where(and(...whereConditions))
        .limit(1);

      return prophecy[0] || null;
    } catch (error) {
      console.error('Error fetching prophecy by ID:', error);
      return null;
    }
  }

  // Get shared prophecy by token
  async getSharedProphecy(shareToken: string): Promise<ProphecyLog | null> {
    try {
      const prophecy = await this.storage.db
        .select()
        .from(prophecyLogs)
        .where(and(
          eq(prophecyLogs.shareToken, shareToken),
          eq(prophecyLogs.shared, true)
        ))
        .limit(1);

      return prophecy[0] || null;
    } catch (error) {
      console.error('Error fetching shared prophecy:', error);
      return null;
    }
  }

  // Update prophecy
  async updateProphecy(
    id: number, 
    userId: string, 
    updates: Partial<ProphecyLog>
  ): Promise<ProphecyLog | null> {
    try {
      // Generate new share token if sharing is enabled
      if (updates.shared && !updates.shareToken) {
        updates.shareToken = crypto.randomBytes(16).toString('hex');
      }

      updates.updatedAt = new Date();

      const updatedProphecy = await this.storage.db
        .update(prophecyLogs)
        .set(updates)
        .where(and(
          eq(prophecyLogs.id, id),
          eq(prophecyLogs.userId, userId)
        ))
        .returning();

      return updatedProphecy[0] || null;
    } catch (error) {
      console.error('Error updating prophecy:', error);
      throw new Error('Failed to update prophecy');
    }
  }

  // Delete prophecy
  async deleteProphecy(id: number, userId: string): Promise<boolean> {
    try {
      const result = await this.storage.db
        .delete(prophecyLogs)
        .where(and(
          eq(prophecyLogs.id, id),
          eq(prophecyLogs.userId, userId)
        ));

      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting prophecy:', error);
      return false;
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
      return null;
    }
  }

  // Get prophecy statistics
  async getProphecyStats(userId: string): Promise<ProphecyLogStats> {
    try {
      const prophecies = await this.getUserProphecies(userId, {}, 1000);

      const stats: ProphecyLogStats = {
        totalProphecies: prophecies.length,
        pinnedProphecies: prophecies.filter(p => p.pinned).length,
        sharedProphecies: prophecies.filter(p => p.shared).length,
        categoryCounts: {},
        recentActivity: prophecies.filter(p => {
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return new Date(p.createdAt!) > dayAgo;
        }).length,
        averageConfidence: 0
      };

      // Calculate category counts
      prophecies.forEach(p => {
        const category = p.category || 'general';
        stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + 1;
      });

      // Calculate average confidence
      const confidenceValues = prophecies
        .filter(p => p.confidence !== null)
        .map(p => p.confidence!);
      
      if (confidenceValues.length > 0) {
        stats.averageConfidence = confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length;
      }

      return stats;
    } catch (error) {
      console.error('Error calculating prophecy stats:', error);
      throw new Error('Failed to calculate prophecy statistics');
    }
  }

  // Get prophecy of the day
  async getProphecyOfTheDay(userId: string): Promise<ProphecyOfTheDay | null> {
    try {
      const prophecies = await this.getUserProphecies(userId, {}, 100);
      if (prophecies.length === 0) return null;

      // Select prophecy based on various criteria
      const pinnedProphecies = prophecies.filter(p => p.pinned);
      const highConfidenceProphecies = prophecies.filter(p => p.confidence && p.confidence > 0.8);
      const tradingProphecies = prophecies.filter(p => p.category === 'trading');

      let selectedProphecy: ProphecyLog;
      let reason: string;

      if (pinnedProphecies.length > 0) {
        selectedProphecy = pinnedProphecies[Math.floor(Math.random() * pinnedProphecies.length)];
        reason = "This is one of your pinned prophecies - clearly important to you.";
      } else if (highConfidenceProphecies.length > 0) {
        selectedProphecy = highConfidenceProphecies[Math.floor(Math.random() * highConfidenceProphecies.length)];
        reason = "This prophecy had high confidence when it was created.";
      } else if (tradingProphecies.length > 0) {
        selectedProphecy = tradingProphecies[Math.floor(Math.random() * tradingProphecies.length)];
        reason = "This trading insight might be relevant for today's market.";
      } else {
        selectedProphecy = prophecies[Math.floor(Math.random() * prophecies.length)];
        reason = "A random prophecy from your collection to inspire your day.";
      }

      const reflectionMessage = this.generateReflectionMessage(selectedProphecy);

      return {
        prophecy: selectedProphecy,
        reason,
        reflectionMessage
      };
    } catch (error) {
      console.error('Error getting prophecy of the day:', error);
      return null;
    }
  }

  // Generate reflection message
  private generateReflectionMessage(prophecy: ProphecyLog): string {
    const timeSince = Date.now() - new Date(prophecy.createdAt!).getTime();
    const daysSince = Math.floor(timeSince / (1000 * 60 * 60 * 24));

    const reflections = [
      `This wisdom from ${daysSince} days ago still resonates. How has your understanding evolved?`,
      `Looking back at this ${prophecy.source} insight, what new patterns do you see?`,
      `This ${prophecy.category} guidance from your past self - what would you add to it now?`,
      `${daysSince} days later, how accurate was this prediction? What did you learn?`,
      `This insight carries ${prophecy.confidence ? Math.round(prophecy.confidence * 100) : 'unknown'}% confidence. Time to validate it.`
    ];

    return reflections[Math.floor(Math.random() * reflections.length)];
  }

  // Export prophecies as formatted text
  async exportProphecies(userId: string, format: 'json' | 'text' = 'json'): Promise<string> {
    try {
      const prophecies = await this.getUserProphecies(userId, {}, 1000);
      
      if (format === 'json') {
        return JSON.stringify(prophecies, null, 2);
      }

      // Text format
      let exportText = `🔮 WAIDES KI PROPHECY LOG\n`;
      exportText += `📅 Generated: ${new Date().toLocaleDateString()}\n`;
      exportText += `📊 Total Prophecies: ${prophecies.length}\n\n`;
      exportText += `${'='.repeat(50)}\n\n`;

      prophecies.forEach((prophecy, index) => {
        exportText += `📜 PROPHECY #${index + 1}\n`;
        exportText += `🕐 Date: ${new Date(prophecy.createdAt!).toLocaleDateString()}\n`;
        exportText += `🔍 Source: ${prophecy.source}\n`;
        exportText += `📂 Category: ${prophecy.category}\n`;
        if (prophecy.confidence) {
          exportText += `🎯 Confidence: ${Math.round(prophecy.confidence * 100)}%\n`;
        }
        if (prophecy.pinned) {
          exportText += `📌 PINNED\n`;
        }
        exportText += `\n💭 Content:\n${prophecy.content}\n\n`;
        if (prophecy.konslangProcessing) {
          exportText += `🔮 KonsLang Processing: ${prophecy.konslangProcessing}\n\n`;
        }
        exportText += `${'-'.repeat(30)}\n\n`;
      });

      return exportText;
    } catch (error) {
      console.error('Error exporting prophecies:', error);
      throw new Error('Failed to export prophecies');
    }
  }

  // Bulk operations
  async bulkUpdateProphecies(
    userId: string, 
    prophecyIds: number[], 
    updates: Partial<ProphecyLog>
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

      const existingTags = (prophecy.tags as string[]) || [];
      const newTags = Array.from(new Set([...existingTags, ...tags]));

      return await this.updateProphecy(id, userId, { tags: newTags });
    } catch (error) {
      console.error('Error adding tags:', error);
      return null;
    }
  }

  // Get all tags for user
  async getUserTags(userId: string): Promise<string[]> {
    try {
      const prophecies = await this.getUserProphecies(userId, {}, 1000);
      const allTags = new Set<string>();

      prophecies.forEach(prophecy => {
        const tags = (prophecy.tags as string[]) || [];
        tags.forEach(tag => allTags.add(tag));
      });

      return Array.from(allTags).sort();
    } catch (error) {
      console.error('Error getting user tags:', error);
      return [];
    }
  }
}