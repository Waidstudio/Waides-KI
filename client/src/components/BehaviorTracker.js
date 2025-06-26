// 🧠 Behavior Tracker - User Memory + Page Log System
// Learns what each user interacts with and suggests tools over time

const BehaviorTracker = {
  userHistory: {},
  sessionId: 'default_user', // Simple session-based tracking
  
  logPageAccess(userId, pageName) {
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
  },

  getTopUsedPages(userId) {
    const history = this.userHistory[userId] || [];
    const frequency = {};

    history.forEach(h => {
      frequency[h.page] = (frequency[h.page] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .map(([page, count]) => ({ page, count }));
  },

  getRecentPages(userId, limit = 5) {
    const history = this.userHistory[userId] || [];
    return history
      .slice(-limit)
      .reverse()
      .map(h => h.page);
  },

  getUserPreferenceRecommendation(userId) {
    const topPages = this.getTopUsedPages(userId);
    if (topPages.length === 0) return null;

    const mostUsed = topPages[0];
    if (mostUsed.count < 2) return null; // Need at least 2 visits to recommend

    return {
      page: mostUsed.page,
      visits: mostUsed.count,
      message: `💡 You've used "${mostUsed.page}" ${mostUsed.count} times. Would you like to open it again?`
    };
  },

  getSessionStats(userId) {
    const history = this.userHistory[userId] || [];
    const uniquePages = [...new Set(history.map(h => h.page))];
    
    return {
      totalVisits: history.length,
      uniquePages: uniquePages.length,
      favoritePages: this.getTopUsedPages(userId).slice(0, 3)
    };
  },

  saveToStorage() {
    try {
      localStorage.setItem('waides_behavior_history', JSON.stringify(this.userHistory));
    } catch (e) {
      console.warn('Failed to save behavior history to localStorage:', e);
    }
  },

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('waides_behavior_history');
      if (stored) {
        this.userHistory = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load behavior history from localStorage:', e);
    }
  },

  clearHistory(userId) {
    if (userId) {
      delete this.userHistory[userId];
    } else {
      this.userHistory = {};
    }
    this.saveToStorage();
  }
};

// Initialize from storage on load
BehaviorTracker.loadFromStorage();

export default BehaviorTracker;