/**
 * Time Window Helper - Optimal Trading Time Analysis
 * Calculates the best time windows for ETH trading based on market sessions and liquidity
 */

interface TimeWindow {
  start: string;
  end: string;
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  session: 'ASIAN' | 'EUROPEAN' | 'US' | 'OVERLAP';
  volatilityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface SessionInfo {
  name: string;
  timezone: string;
  openHour: number;  // Hour in WAT
  closeHour: number; // Hour in WAT
  characteristics: string[];
}

class TimeWindowHelper {
  private readonly tradingSessions: SessionInfo[] = [
    {
      name: 'Asian Session',
      timezone: 'WAT',
      openHour: 0,   // 12:00 AM WAT
      closeHour: 8,  // 8:00 AM WAT
      characteristics: ['Lower volatility', 'Thin liquidity', 'Range-bound movement']
    },
    {
      name: 'European Session', 
      timezone: 'WAT',
      openHour: 7,   // 7:00 AM WAT
      closeHour: 16, // 4:00 PM WAT
      characteristics: ['High liquidity', 'Strong trends', 'Economic news impact']
    },
    {
      name: 'US Session',
      timezone: 'WAT', 
      openHour: 14,  // 2:00 PM WAT
      closeHour: 23, // 11:00 PM WAT
      characteristics: ['Highest volatility', 'Maximum volume', 'Breakout potential']
    }
  ];

  constructor() {
    // Initialize with WAT timezone calculations
  }

  getOptimalWindows(): TimeWindow[] {
    const currentHour = this.getCurrentWATHour();
    
    return [
      // European Morning Opening - High Priority
      {
        start: "6:30 AM WAT",
        end: "9:30 AM WAT",
        reason: "European market opening creates high liquidity and volatility. Institutional traders enter positions.",
        priority: 'HIGH',
        session: 'EUROPEAN',
        volatilityLevel: 'HIGH'
      },
      
      // European-US Overlap - Highest Priority  
      {
        start: "2:00 PM WAT",
        end: "5:00 PM WAT", 
        reason: "European-US session overlap provides maximum liquidity and strongest trends. Best execution conditions.",
        priority: 'HIGH',
        session: 'OVERLAP',
        volatilityLevel: 'HIGH'
      },
      
      // US Afternoon Session - High Priority
      {
        start: "5:00 PM WAT", 
        end: "8:00 PM WAT",
        reason: "US afternoon trading creates momentum moves and breakout opportunities with high volume.",
        priority: 'HIGH',
        session: 'US',
        volatilityLevel: 'HIGH'
      },
      
      // Late US Session - Medium Priority
      {
        start: "9:00 PM WAT",
        end: "11:00 PM WAT", 
        reason: "Late US session can provide continuation moves, but lower liquidity increases slippage risk.",
        priority: 'MEDIUM',
        session: 'US',
        volatilityLevel: 'MEDIUM'
      },
      
      // Asian Session - Low Priority
      {
        start: "11:30 PM WAT",
        end: "2:00 AM WAT",
        reason: "Asian session opening may provide opportunities but typically lower volatility and thin liquidity.",
        priority: 'LOW', 
        session: 'ASIAN',
        volatilityLevel: 'LOW'
      }
    ].filter(window => this.isRelevantWindow(window, currentHour));
  }

  getCurrentOptimalWindow(): TimeWindow | null {
    const currentHour = this.getCurrentWATHour();
    const windows = this.getOptimalWindows();
    
    return windows.find(window => this.isCurrentlyInWindow(window, currentHour)) || null;
  }

  getNextOptimalWindow(): TimeWindow | null {
    const currentHour = this.getCurrentWATHour();
    const allWindows = this.getAllTimeWindows();
    
    // Find next window starting after current time
    const upcomingWindows = allWindows.filter(window => {
      const startHour = this.parseTimeToHour(window.start);
      return startHour > currentHour;
    });
    
    if (upcomingWindows.length === 0) {
      // Return first window of next day
      return allWindows.find(w => w.priority === 'HIGH') || allWindows[0];
    }
    
    return upcomingWindows[0];
  }

  isOptimalTradingTime(): boolean {
    const currentWindow = this.getCurrentOptimalWindow();
    return currentWindow !== null && currentWindow.priority === 'HIGH';
  }

  getSessionAnalysis(): any {
    const currentHour = this.getCurrentWATHour(); 
    const currentSession = this.getCurrentSession(currentHour);
    const nextSession = this.getNextSession(currentHour);
    
    return {
      current: {
        session: currentSession?.name || 'Transition Period',
        characteristics: currentSession?.characteristics || ['Low activity', 'Reduced liquidity'],
        recommendation: this.getSessionRecommendation(currentSession)
      },
      next: {
        session: nextSession?.name || 'Asian Session', 
        startsIn: this.getTimeUntilNextSession(currentHour),
        characteristics: nextSession?.characteristics || ['Varies by session']
      },
      optimalForTrading: this.isOptimalTradingTime()
    };
  }

  private getCurrentWATHour(): number {
    const now = new Date();
    // Convert UTC to WAT (UTC+1)
    return (now.getUTCHours() + 1) % 24;
  }

  private getAllTimeWindows(): TimeWindow[] {
    // Return all windows without filtering for current relevance
    return [
      {
        start: "6:30 AM WAT",
        end: "9:30 AM WAT", 
        reason: "European market opening creates high liquidity and volatility",
        priority: 'HIGH',
        session: 'EUROPEAN',
        volatilityLevel: 'HIGH'
      },
      {
        start: "2:00 PM WAT",
        end: "5:00 PM WAT",
        reason: "European-US session overlap provides maximum liquidity", 
        priority: 'HIGH',
        session: 'OVERLAP',
        volatilityLevel: 'HIGH'
      },
      {
        start: "5:00 PM WAT",
        end: "8:00 PM WAT",
        reason: "US afternoon trading creates momentum moves",
        priority: 'HIGH', 
        session: 'US',
        volatilityLevel: 'HIGH'
      },
      {
        start: "9:00 PM WAT",
        end: "11:00 PM WAT",
        reason: "Late US session continuation moves",
        priority: 'MEDIUM',
        session: 'US', 
        volatilityLevel: 'MEDIUM'
      }
    ];
  }

  private isRelevantWindow(window: TimeWindow, currentHour: number): boolean {
    // Show upcoming high priority windows and current windows
    const startHour = this.parseTimeToHour(window.start);
    const endHour = this.parseTimeToHour(window.end);
    
    // If we're in the window or it's starting within 4 hours
    return this.isCurrentlyInWindow(window, currentHour) || 
           (startHour > currentHour && startHour <= currentHour + 4) ||
           window.priority === 'HIGH';
  }

  private isCurrentlyInWindow(window: TimeWindow, currentHour: number): boolean {
    const startHour = this.parseTimeToHour(window.start);
    const endHour = this.parseTimeToHour(window.end);
    
    if (startHour <= endHour) {
      return currentHour >= startHour && currentHour < endHour;
    } else {
      // Handles windows that cross midnight
      return currentHour >= startHour || currentHour < endHour;
    }
  }

  private parseTimeToHour(timeString: string): number {
    // Parse "6:30 AM WAT" format to hour number
    const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
    if (!match) return 0;
    
    let hour = parseInt(match[1]);
    const period = match[3];
    
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return hour;
  }

  private getCurrentSession(hour: number): SessionInfo | null {
    return this.tradingSessions.find(session => 
      hour >= session.openHour && hour < session.closeHour
    ) || null;
  }

  private getNextSession(hour: number): SessionInfo | null {
    // Find next session that starts after current hour
    const upcoming = this.tradingSessions.filter(session => session.openHour > hour);
    if (upcoming.length > 0) {
      return upcoming[0];
    }
    // If no upcoming sessions today, return first session of tomorrow
    return this.tradingSessions[0];
  }

  private getTimeUntilNextSession(currentHour: number): string {
    const nextSession = this.getNextSession(currentHour);
    if (!nextSession) return 'Unknown';
    
    let hoursUntil = nextSession.openHour - currentHour;
    if (hoursUntil <= 0) {
      hoursUntil += 24; // Next day
    }
    
    if (hoursUntil === 1) return '1 hour';
    return `${hoursUntil} hours`;
  }

  private getSessionRecommendation(session: SessionInfo | null): string {
    if (!session) {
      return 'Market transition period - wait for clear session opening';
    }
    
    switch (session.name) {
      case 'Asian Session':
        return 'Lower volatility - suitable for range trading or preparation';
      case 'European Session': 
        return 'Good liquidity - favorable for trend following strategies';
      case 'US Session':
        return 'Highest volatility - optimal for breakout and momentum trading';
      default:
        return 'Monitor market conditions for opportunities';
    }
  }

  // Helper method to get time until next optimal window
  getTimeUntilOptimal(): string {
    const nextWindow = this.getNextOptimalWindow();
    if (!nextWindow) return 'Unknown';
    
    const currentHour = this.getCurrentWATHour();
    const nextHour = this.parseTimeToHour(nextWindow.start);
    
    let hoursUntil = nextHour - currentHour;
    if (hoursUntil <= 0) {
      hoursUntil += 24;
    }
    
    if (hoursUntil < 1) return 'Less than 1 hour';
    if (hoursUntil === 1) return '1 hour';
    return `${hoursUntil} hours`;
  }

  // Method to get formatted time windows for display
  getFormattedTimeWindows(): string {
    const windows = this.getOptimalWindows().filter(w => w.priority === 'HIGH');
    
    if (windows.length === 0) {
      return 'No optimal windows currently identified. Check back during market hours.';
    }
    
    let formatted = '⏰ **Optimal Trading Windows**:\n';
    windows.forEach((window, index) => {
      formatted += `${index + 1}. **${window.start} - ${window.end}** (${window.priority} priority)\n`;
      formatted += `   ${window.reason}\n`;
    });
    
    return formatted;
  }
}

export const timeWindowHelper = new TimeWindowHelper();