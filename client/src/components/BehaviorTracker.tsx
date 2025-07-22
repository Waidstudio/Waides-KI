// 🧠 Behavior Tracker - User Memory + Page Log System
// Learns what each user interacts with and suggests tools over time

interface PageVisit {
  page: string;
  time: number;
  timestamp: string;
}

interface UserHistory {
  [userId: string]: PageVisit[];
}

interface SessionStats {
  totalVisits: number;
  uniquePages: number;
  favoritePages: Array<{ page: string; count: number }>;
}

interface PreferenceRecommendation {
  page: string;
  visits: number;
  message: string;
}

class BehaviorTrackerClass {
  private userHistory: UserHistory = {};
  public sessionId: string = 'default_user';

  logPageAccess(userId: string, pageName: string): void {
    if (!this.userHistory[userId]) this.userHistory[userId] = [];
    this.userHistory[userId].push({ 
      page: pageName, 
      time: Date.now(),
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 entries per user to prevent memory bloat
    if (this.userHistory[userId].length > 50) {
      this.userHistory[userId] = this.userHistory[userId].slice(-50);
    }
    
    // Store in localStorage for persistence
    this.saveToStorage();
  }

  getTopUsedPages(userId: string): Array<{ page: string; count: number }> {
    const history = this.userHistory[userId] || [];
    const frequency: { [page: string]: number } = {};

    history.forEach(h => {
      frequency[h.page] = (frequency[h.page] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .map(([page, count]) => ({ page, count }));
  }

  getRecentPages(userId: string, limit: number = 5): string[] {
    const history = this.userHistory[userId] || [];
    return history
      .slice(-limit)
      .reverse()
      .map(h => h.page);
  }

  getUserPreferenceRecommendation(userId: string): PreferenceRecommendation | null {
    const topPages = this.getTopUsedPages(userId);
    if (topPages.length === 0) return null;

    const mostUsed = topPages[0];
    if (mostUsed.count < 2) return null; // Need at least 2 visits to recommend

    return {
      page: mostUsed.page,
      visits: mostUsed.count,
      message: `💡 You've used "${mostUsed.page}" ${mostUsed.count} times. Would you like to open it again?`
    };
  }

  getSessionStats(userId: string): SessionStats {
    const history = this.userHistory[userId] || [];
    const pageSet = new Set(history.map(h => h.page));
    const uniquePages = Array.from(pageSet);
    
    return {
      totalVisits: history.length,
      uniquePages: uniquePages.length,
      favoritePages: this.getTopUsedPages(userId).slice(0, 3)
    };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('waides_behavior_history', JSON.stringify(this.userHistory));
    } catch (e) {
      console.warn('Failed to save behavior history to localStorage:', e);
    }
  }

  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('waides_behavior_history');
      if (stored) {
        this.userHistory = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load behavior history from localStorage:', e);
    }
  }

  clearUserHistory(userId: string): void {
    delete this.userHistory[userId];
    this.saveToStorage();
  }

  exportUserData(userId: string): PageVisit[] {
    return this.userHistory[userId] || [];
  }
}

// Create singleton instance
const BehaviorTracker = new BehaviorTrackerClass();

export default BehaviorTracker;