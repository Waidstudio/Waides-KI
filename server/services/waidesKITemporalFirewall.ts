export interface TemporalWindow {
  name: string;
  startHour: number;
  endHour: number;
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  timezone: string;
  isActive: boolean;
  priority: number;
  description: string;
}

export interface TemporalRule {
  id: string;
  name: string;
  condition: string;
  action: 'ALLOW' | 'BLOCK' | 'RESTRICT';
  windows: string[];
  weight: number;
  isEnabled: boolean;
  createdAt: Date;
}

export interface TemporalContext {
  currentTime: Date;
  activeWindows: TemporalWindow[];
  sacredHours: boolean;
  energyLevel: number;
  timeZone: string;
}

export class WaidesKITemporalFirewall {
  private temporalWindows: Map<string, TemporalWindow> = new Map();
  private temporalRules: Map<string, TemporalRule> = new Map();
  private activationHistory: Array<{
    timestamp: Date;
    action: string;
    reason: string;
    windowsActive: string[];
  }> = [];

  constructor() {
    this.initializeDefaultWindows();
    this.initializeDefaultRules();
  }

  /**
   * Initialize default sacred time windows
   */
  private initializeDefaultWindows(): void {
    const defaultWindows: TemporalWindow[] = [
      {
        name: 'Sacred_Morning',
        startHour: 6,
        endHour: 9,
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        timezone: 'UTC',
        isActive: true,
        priority: 9,
        description: 'Morning sacred hours for high-energy trading'
      },
      {
        name: 'Power_Midday',
        startHour: 11,
        endHour: 14,
        daysOfWeek: [1, 2, 3, 4],
        timezone: 'UTC',
        isActive: true,
        priority: 8,
        description: 'Midday power window for momentum trades'
      },
      {
        name: 'Evening_Vision',
        startHour: 18,
        endHour: 21,
        daysOfWeek: [1, 2, 3, 4, 5],
        timezone: 'UTC',
        isActive: true,
        priority: 7,
        description: 'Evening vision window for trend analysis'
      },
      {
        name: 'Night_Meditation',
        startHour: 22,
        endHour: 4,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        timezone: 'UTC',
        isActive: false,
        priority: 3,
        description: 'Night meditation - restricted trading'
      },
      {
        name: 'Weekend_Rest',
        startHour: 0,
        endHour: 23,
        daysOfWeek: [0, 6], // Sunday and Saturday
        timezone: 'UTC',
        isActive: false,
        priority: 2,
        description: 'Weekend rest period - minimal trading'
      }
    ];

    defaultWindows.forEach(window => {
      this.temporalWindows.set(window.name, window);
    });
  }

  /**
   * Initialize default temporal rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: TemporalRule[] = [
      {
        id: 'RULE_001',
        name: 'Sacred_Hours_Only',
        condition: 'sacred_hours_active',
        action: 'ALLOW',
        windows: ['Sacred_Morning', 'Power_Midday', 'Evening_Vision'],
        weight: 1.0,
        isEnabled: true,
        createdAt: new Date()
      },
      {
        id: 'RULE_002',
        name: 'Night_Restriction',
        condition: 'night_meditation_active',
        action: 'BLOCK',
        windows: ['Night_Meditation'],
        weight: 0.9,
        isEnabled: true,
        createdAt: new Date()
      },
      {
        id: 'RULE_003',
        name: 'Weekend_Caution',
        condition: 'weekend_active',
        action: 'RESTRICT',
        windows: ['Weekend_Rest'],
        weight: 0.3,
        isEnabled: true,
        createdAt: new Date()
      }
    ];

    defaultRules.forEach(rule => {
      this.temporalRules.set(rule.id, rule);
    });
  }

  /**
   * Check if current time allows trading
   */
  isActivationAllowed(): boolean {
    const context = this.getCurrentTemporalContext();
    
    // Check if any sacred windows are active
    const sacredWindowsActive = context.activeWindows.some(window => 
      window.priority >= 7 && window.isActive
    );

    // Check temporal rules
    const allowingRules = this.getApplicableRules('ALLOW', context);
    const blockingRules = this.getApplicableRules('BLOCK', context);

    // Blocking rules have priority
    if (blockingRules.length > 0) {
      this.logActivation('BLOCKED', `Blocked by rules: ${blockingRules.map(r => r.name).join(', ')}`, context);
      return false;
    }

    // Check if allowing rules are present
    if (allowingRules.length > 0 || sacredWindowsActive) {
      this.logActivation('ALLOWED', `Allowed by sacred windows or rules`, context);
      return true;
    }

    // Default to restricted
    this.logActivation('RESTRICTED', 'No specific allowance - default restriction', context);
    return false;
  }

  /**
   * Get current temporal context
   */
  getCurrentTemporalContext(): TemporalContext {
    const now = new Date();
    const activeWindows = this.getActiveWindows(now);
    
    return {
      currentTime: now,
      activeWindows,
      sacredHours: activeWindows.some(w => w.priority >= 7),
      energyLevel: this.calculateEnergyLevel(now, activeWindows),
      timeZone: 'UTC'
    };
  }

  /**
   * Get active temporal windows for given time
   */
  getActiveWindows(time: Date): TemporalWindow[] {
    const hour = time.getUTCHours();
    const dayOfWeek = time.getUTCDay();
    
    return Array.from(this.temporalWindows.values()).filter(window => {
      if (!window.isActive) return false;
      if (!window.daysOfWeek.includes(dayOfWeek)) return false;
      
      // Handle windows that span midnight
      if (window.startHour > window.endHour) {
        return hour >= window.startHour || hour <= window.endHour;
      } else {
        return hour >= window.startHour && hour <= window.endHour;
      }
    });
  }

  /**
   * Get applicable rules for given action and context
   */
  private getApplicableRules(action: string, context: TemporalContext): TemporalRule[] {
    return Array.from(this.temporalRules.values()).filter(rule => {
      if (!rule.isEnabled || rule.action !== action) return false;
      
      // Check if any of the rule's windows are currently active
      return rule.windows.some(windowName => 
        context.activeWindows.some(activeWindow => activeWindow.name === windowName)
      );
    });
  }

  /**
   * Calculate energy level based on time and active windows
   */
  private calculateEnergyLevel(time: Date, activeWindows: TemporalWindow[]): number {
    let energyLevel = 0.5; // Base energy level
    
    // Add energy from active windows
    activeWindows.forEach(window => {
      const windowBonus = window.priority / 10;
      energyLevel += windowBonus;
    });

    // Time-based adjustments
    const hour = time.getUTCHours();
    if (hour >= 6 && hour <= 10) energyLevel += 0.2; // Morning boost
    if (hour >= 22 || hour <= 4) energyLevel -= 0.3; // Night reduction
    
    return Math.min(Math.max(energyLevel, 0), 1);
  }

  /**
   * Add new temporal window
   */
  addTemporalWindow(window: TemporalWindow): void {
    this.temporalWindows.set(window.name, window);
  }

  /**
   * Add new temporal rule
   */
  addTemporalRule(rule: TemporalRule): void {
    this.temporalRules.set(rule.id, rule);
  }

  /**
   * Update temporal window
   */
  updateTemporalWindow(name: string, updates: Partial<TemporalWindow>): boolean {
    const window = this.temporalWindows.get(name);
    if (!window) return false;
    
    Object.assign(window, updates);
    return true;
  }

  /**
   * Enable/disable temporal window
   */
  toggleTemporalWindow(name: string, isActive: boolean): boolean {
    const window = this.temporalWindows.get(name);
    if (!window) return false;
    
    window.isActive = isActive;
    return true;
  }

  /**
   * Get temporal firewall statistics
   */
  getTemporalStats(): {
    totalWindows: number;
    activeWindows: number;
    totalRules: number;
    enabledRules: number;
    recentActivations: number;
    energyLevel: number;
  } {
    const context = this.getCurrentTemporalContext();
    const recentActivations = this.activationHistory.filter(
      entry => Date.now() - entry.timestamp.getTime() < 60 * 60 * 1000 // Last hour
    ).length;

    return {
      totalWindows: this.temporalWindows.size,
      activeWindows: context.activeWindows.length,
      totalRules: this.temporalRules.size,
      enabledRules: Array.from(this.temporalRules.values()).filter(r => r.isEnabled).length,
      recentActivations,
      energyLevel: context.energyLevel
    };
  }

  /**
   * Get activation history
   */
  getActivationHistory(limit: number = 50): Array<{
    timestamp: Date;
    action: string;
    reason: string;
    windowsActive: string[];
  }> {
    return this.activationHistory
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Check if specific time window is currently active
   */
  isWindowActive(windowName: string): boolean {
    const context = this.getCurrentTemporalContext();
    return context.activeWindows.some(window => window.name === windowName);
  }

  /**
   * Get next sacred window
   */
  getNextSacredWindow(): { window: TemporalWindow; timeUntil: number } | null {
    const now = new Date();
    const sacredWindows = Array.from(this.temporalWindows.values())
      .filter(w => w.priority >= 7 && w.isActive);

    let nextWindow: TemporalWindow | null = null;
    let minTimeUntil = Infinity;

    sacredWindows.forEach(window => {
      const timeUntil = this.calculateTimeUntilWindow(now, window);
      if (timeUntil < minTimeUntil) {
        minTimeUntil = timeUntil;
        nextWindow = window;
      }
    });

    return nextWindow ? { window: nextWindow, timeUntil: minTimeUntil } : null;
  }

  /**
   * Calculate time until specific window opens
   */
  private calculateTimeUntilWindow(now: Date, window: TemporalWindow): number {
    const currentHour = now.getUTCHours();
    const currentDay = now.getUTCDay();

    // If window is active on current day
    if (window.daysOfWeek.includes(currentDay)) {
      if (currentHour < window.startHour) {
        return (window.startHour - currentHour) * 60 * 60 * 1000;
      }
    }

    // Find next day when window is active
    let daysAhead = 1;
    while (daysAhead <= 7) {
      const futureDay = (currentDay + daysAhead) % 7;
      if (window.daysOfWeek.includes(futureDay)) {
        const msUntilNextDay = daysAhead * 24 * 60 * 60 * 1000;
        const msFromMidnightToStart = window.startHour * 60 * 60 * 1000;
        const msFromNowToMidnight = (24 - currentHour) * 60 * 60 * 1000;
        
        return msFromNowToMidnight + msFromMidnightToStart + (daysAhead - 1) * 24 * 60 * 60 * 1000;
      }
      daysAhead++;
    }

    return Infinity;
  }

  /**
   * Log activation event
   */
  private logActivation(action: string, reason: string, context: TemporalContext): void {
    this.activationHistory.push({
      timestamp: new Date(),
      action,
      reason,
      windowsActive: context.activeWindows.map(w => w.name)
    });

    // Keep history manageable
    if (this.activationHistory.length > 200) {
      this.activationHistory = this.activationHistory.slice(-200);
    }
  }

  /**
   * Get all temporal windows
   */
  getAllWindows(): TemporalWindow[] {
    return Array.from(this.temporalWindows.values());
  }

  /**
   * Get all temporal rules
   */
  getAllRules(): TemporalRule[] {
    return Array.from(this.temporalRules.values());
  }
}