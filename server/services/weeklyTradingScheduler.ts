import { format, getDay, getHours, getMinutes } from 'date-fns';

export interface TradingDayInfo {
  day: string;
  rating: 'OPTIMAL' | 'GOOD' | 'CAUTION' | 'AVOID';
  behavior: string;
  recommendation: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  tradingActions: string[];
  volumeExpectation: 'LOW' | 'NORMAL' | 'HIGH';
  volatilityExpectation: 'STABLE' | 'MODERATE' | 'CHAOTIC';
}

export interface TradingTimeInfo {
  timeWindow: string;
  isOptimal: boolean;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface WeeklyTradingPlan {
  currentDay: TradingDayInfo;
  currentTime: TradingTimeInfo;
  weeklySchedule: TradingDayInfo[];
  overallRecommendation: string;
  activeStrategy: string;
}

export class WeeklyTradingScheduler {
  private tradingDays: { [key: number]: TradingDayInfo } = {
    0: { // Sunday
      day: 'Sunday',
      rating: 'AVOID',
      behavior: 'Fake direction setup day - often reverses hard Monday',
      recommendation: 'Monitor only - don\'t trust breakouts until Monday confirms',
      riskLevel: 'HIGH',
      tradingActions: ['Monitor only', 'No new positions', 'Observe for Monday setup'],
      volumeExpectation: 'LOW',
      volatilityExpectation: 'CHAOTIC'
    },
    1: { // Monday
      day: 'Monday',
      rating: 'CAUTION',
      behavior: 'Often choppy and unclear - weekend move retrace or sideways',
      recommendation: 'Watch only. No trading. Observe structure and direction',
      riskLevel: 'HIGH',
      tradingActions: ['Observe market structure', 'Identify weekly direction', 'No heavy positions'],
      volumeExpectation: 'NORMAL',
      volatilityExpectation: 'CHAOTIC'
    },
    2: { // Tuesday
      day: 'Tuesday',
      rating: 'GOOD',
      behavior: 'Clean trend setups start forming. Monday noise is out. Volume stabilizes',
      recommendation: 'Trade small - look for clean trend. Activate grid/scalp setups',
      riskLevel: 'MEDIUM',
      tradingActions: ['Small position entries', 'Grid bot activation', 'Trend confirmation trades'],
      volumeExpectation: 'NORMAL',
      volatilityExpectation: 'STABLE'
    },
    3: { // Wednesday
      day: 'Wednesday',
      rating: 'OPTIMAL',
      behavior: 'Mid-week continuation or reversal. Strong institutional volume often comes in',
      recommendation: 'Best day - trade full setup if trend confirms',
      riskLevel: 'LOW',
      tradingActions: ['Full position scaling', 'Maximum bot activity', 'Trend following strategies'],
      volumeExpectation: 'HIGH',
      volatilityExpectation: 'MODERATE'
    },
    4: { // Thursday
      day: 'Thursday',
      rating: 'OPTIMAL',
      behavior: 'Breakout day. Most bots + traders finalize positions before weekend risk',
      recommendation: 'Also strong - take partial profits. Watch for fakeouts near U.S. close',
      riskLevel: 'LOW',
      tradingActions: ['Breakout trades', 'Partial profit taking', 'Position optimization'],
      volumeExpectation: 'HIGH',
      volatilityExpectation: 'MODERATE'
    },
    5: { // Friday
      day: 'Friday',
      rating: 'CAUTION',
      behavior: 'Exit day - big players close positions to avoid weekend exposure',
      recommendation: 'Small scalp if needed, but close all bots before U.S. close',
      riskLevel: 'HIGH',
      tradingActions: ['Quick scalps only', 'Close long-term positions', 'Weekend risk management'],
      volumeExpectation: 'NORMAL',
      volatilityExpectation: 'CHAOTIC'
    },
    6: { // Saturday
      day: 'Saturday',
      rating: 'AVOID',
      behavior: 'Volume is thin. Bots dominate the market',
      recommendation: 'No trading unless it\'s for long-term swing',
      riskLevel: 'EXTREME',
      tradingActions: ['Swing trades only', 'No scalping', 'Weekend monitoring'],
      volumeExpectation: 'LOW',
      volatilityExpectation: 'CHAOTIC'
    }
  };

  getCurrentDayInfo(): TradingDayInfo {
    const now = new Date();
    const dayOfWeek = getDay(now);
    return this.tradingDays[dayOfWeek];
  }

  getCurrentTimeInfo(): TradingTimeInfo {
    const now = new Date();
    const hour = getHours(now);
    const minute = getMinutes(now);
    const currentTime = hour + minute / 60;

    // Optimal trading window: 6:30 AM - 9:30 AM PDT (13:30 - 16:30 UTC)
    const isOptimalTime = currentTime >= 13.5 && currentTime <= 16.5;

    if (isOptimalTime) {
      return {
        timeWindow: '6:30 AM - 9:30 AM PDT (Optimal)',
        isOptimal: true,
        description: 'Peak institutional volume and clarity of direction',
        riskLevel: 'LOW'
      };
    } else if (currentTime >= 12 && currentTime <= 20) {
      return {
        timeWindow: 'U.S. Trading Hours',
        isOptimal: false,
        description: 'Active trading but higher volatility',
        riskLevel: 'MEDIUM'
      };
    } else if (currentTime >= 8 && currentTime <= 12) {
      return {
        timeWindow: 'European Hours',
        isOptimal: false,
        description: 'Moderate activity, trend continuation',
        riskLevel: 'MEDIUM'
      };
    } else {
      return {
        timeWindow: 'Off-Hours',
        isOptimal: false,
        description: 'Low volume, bot-dominated trading',
        riskLevel: 'HIGH'
      };
    }
  }

  getWeeklySchedule(): TradingDayInfo[] {
    return Object.values(this.tradingDays);
  }

  calculateOverallRecommendation(): string {
    const currentDay = this.getCurrentDayInfo();
    const currentTime = this.getCurrentTimeInfo();

    if (currentDay.rating === 'OPTIMAL' && currentTime.isOptimal) {
      return 'MAXIMUM TRADING - Perfect conditions for full position scaling';
    } else if (currentDay.rating === 'OPTIMAL') {
      return 'STRONG TRADING - Good day but suboptimal time window';
    } else if (currentDay.rating === 'GOOD' && currentTime.isOptimal) {
      return 'MODERATE TRADING - Good time, moderate day conditions';
    } else if (currentDay.rating === 'GOOD') {
      return 'LIGHT TRADING - Proceed with small positions';
    } else if (currentDay.rating === 'CAUTION') {
      return 'MINIMAL TRADING - Observe and analyze only';
    } else {
      return 'NO TRADING - Avoid all active trading';
    }
  }

  getActiveStrategy(): string {
    const currentDay = this.getCurrentDayInfo();
    const currentTime = this.getCurrentTimeInfo();

    switch (currentDay.rating) {
      case 'OPTIMAL':
        return currentTime.isOptimal 
          ? 'Aggressive Trend Following + Grid Bots'
          : 'Moderate Trend Following';
      case 'GOOD':
        return currentTime.isOptimal
          ? 'Conservative Trend Following'
          : 'Scalping + Small Positions';
      case 'CAUTION':
        return 'Observation + Market Analysis';
      case 'AVOID':
        return 'Weekend Risk Management';
      default:
        return 'Conservative Monitoring';
    }
  }

  getWeeklyTradingPlan(): WeeklyTradingPlan {
    return {
      currentDay: this.getCurrentDayInfo(),
      currentTime: this.getCurrentTimeInfo(),
      weeklySchedule: this.getWeeklySchedule(),
      overallRecommendation: this.calculateOverallRecommendation(),
      activeStrategy: this.getActiveStrategy()
    };
  }

  shouldAllowTrading(): boolean {
    const currentDay = this.getCurrentDayInfo();
    return currentDay.rating !== 'AVOID';
  }

  getPositionSizeMultiplier(): number {
    const currentDay = this.getCurrentDayInfo();
    const currentTime = this.getCurrentTimeInfo();

    if (currentDay.rating === 'OPTIMAL' && currentTime.isOptimal) {
      return 1.0; // Full position sizing
    } else if (currentDay.rating === 'OPTIMAL') {
      return 0.7; // Reduced position sizing
    } else if (currentDay.rating === 'GOOD' && currentTime.isOptimal) {
      return 0.5; // Half position sizing
    } else if (currentDay.rating === 'GOOD') {
      return 0.3; // Small position sizing
    } else if (currentDay.rating === 'CAUTION') {
      return 0.1; // Minimal position sizing
    } else {
      return 0.0; // No trading
    }
  }
}

export const weeklyScheduler = new WeeklyTradingScheduler();