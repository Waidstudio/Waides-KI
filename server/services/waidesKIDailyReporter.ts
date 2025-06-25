import { waidesKISignalShield } from './waidesKISignalShield';
import { waidesKILearning } from './waidesKILearningEngine';
import { waidesKIObserver } from './waidesKIObserver';
import { waidesKIRiskManager } from './waidesKIRiskManager';
import { waidesKI } from './waidesKICore';

interface DailyEmotionalState {
  timestamp: number;
  emotion: 'CONFIDENT' | 'CAUTIOUS' | 'AGGRESSIVE' | 'PATIENT' | 'UNCERTAIN' | 'FOCUSED' | 'STRESSED';
  trigger: string;
  market_condition: string;
  confidence_level: number;
}

interface DailyLesson {
  timestamp: number;
  lesson: string;
  category: 'STRATEGY' | 'RISK' | 'MARKET' | 'TECHNICAL' | 'EMOTIONAL' | 'PATTERN';
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
}

interface DailyTradingStats {
  total_signals: number;
  approved_signals: number;
  blocked_signals: number;
  traps_detected: number;
  strategies_banned: number;
  win_rate: number;
  total_return: number;
  risk_events: number;
}

interface DailyJournalEntry {
  date: string;
  emotional_state: DailyEmotionalState[];
  lessons_learned: DailyLesson[];
  trading_stats: DailyTradingStats;
  market_summary: any;
  key_insights: string[];
  tomorrow_focus: string[];
  self_assessment: {
    discipline_score: number;
    learning_progress: number;
    emotional_control: number;
    risk_management: number;
    overall_performance: number;
  };
}

export class WaidesKIDailyReporter {
  private emotionalLog: DailyEmotionalState[] = [];
  private lessonLog: DailyLesson[] = [];
  private dailyEntries: DailyJournalEntry[] = [];
  private lastReportDate: string = '';

  constructor() {
    this.initializeDailyReporting();
  }

  private initializeDailyReporting(): void {
    // Generate daily report at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeToMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.generateDailyReport();
      
      // Then generate daily reports every 24 hours
      setInterval(() => {
        this.generateDailyReport();
      }, 24 * 60 * 60 * 1000);
    }, timeToMidnight);
  }

  // EMOTIONAL STATE TRACKING
  logEmotionalState(
    emotion: DailyEmotionalState['emotion'], 
    trigger: string, 
    marketCondition: string, 
    confidenceLevel: number
  ): void {
    this.emotionalLog.push({
      timestamp: Date.now(),
      emotion,
      trigger,
      market_condition: marketCondition,
      confidence_level: confidenceLevel
    });

    // Keep only last 50 emotional states
    if (this.emotionalLog.length > 50) {
      this.emotionalLog = this.emotionalLog.slice(-50);
    }
  }

  // LESSON LEARNING SYSTEM
  recordLesson(
    lesson: string, 
    category: DailyLesson['category'], 
    importance: DailyLesson['importance'], 
    source: string
  ): void {
    this.lessonLog.push({
      timestamp: Date.now(),
      lesson,
      category,
      importance,
      source
    });

    // Keep only last 100 lessons
    if (this.lessonLog.length > 100) {
      this.lessonLog = this.lessonLog.slice(-100);
    }
  }

  // DAILY REPORT GENERATION
  async generateDailyReport(): Promise<DailyJournalEntry> {
    const today = new Date().toISOString().split('T')[0];
    
    if (this.lastReportDate === today) {
      // Already generated today's report
      return this.dailyEntries[this.dailyEntries.length - 1];
    }

    // Gather data from all systems
    const shieldReport = waidesKISignalShield.generateDailyReport();
    const learningStats = waidesKILearning.getLearningStats();
    const observerStats = waidesKIObserver.getObservationStats();
    const capitalStats = waidesKIRiskManager.getCapitalStats();
    const kiStatus = waidesKI.getPublicInterface();

    // Generate emotional summary
    const todayEmotions = this.getTodayEmotions();
    const todayLessons = this.getTodayLessons();

    // Calculate trading stats
    const tradingStats: DailyTradingStats = {
      total_signals: shieldReport.shield_performance.total_signals_processed,
      approved_signals: shieldReport.shield_performance.total_signals_processed - shieldReport.shield_performance.signals_blocked,
      blocked_signals: shieldReport.shield_performance.signals_blocked,
      traps_detected: shieldReport.shield_performance.traps_detected,
      strategies_banned: shieldReport.shield_performance.banned_strategies,
      win_rate: capitalStats.winRate,
      total_return: capitalStats.totalReturnPercent,
      risk_events: shieldReport.banned_strategies.length
    };

    // Generate market summary
    const marketSummary = {
      observations: observerStats.totalObservations,
      signal_quality: observerStats.patterns.marketPhase,
      trend_consistency: observerStats.patterns.trendConsistency || 0,
      volatility: observerStats.patterns.volatility || 0
    };

    // Generate insights
    const keyInsights = this.generateKeyInsights(tradingStats, shieldReport, learningStats);
    const tomorrowFocus = this.generateTomorrowFocus(tradingStats, todayLessons);

    // Self-assessment
    const selfAssessment = this.calculateSelfAssessment(tradingStats, todayEmotions, todayLessons);

    const dailyEntry: DailyJournalEntry = {
      date: today,
      emotional_state: todayEmotions,
      lessons_learned: todayLessons,
      trading_stats: tradingStats,
      market_summary: marketSummary,
      key_insights: keyInsights,
      tomorrow_focus: tomorrowFocus,
      self_assessment: selfAssessment
    };

    this.dailyEntries.push(dailyEntry);
    this.lastReportDate = today;

    // Keep only last 30 days
    if (this.dailyEntries.length > 30) {
      this.dailyEntries = this.dailyEntries.slice(-30);
    }

    // Auto-generate lessons based on performance
    this.autoGenerateLessons(dailyEntry);

    return dailyEntry;
  }

  // INSIGHT GENERATION
  private generateKeyInsights(
    stats: DailyTradingStats, 
    shieldReport: any, 
    learningStats: any
  ): string[] {
    const insights: string[] = [];

    // Shield effectiveness insights
    if (stats.blocked_signals > stats.approved_signals * 0.3) {
      insights.push('High signal rejection rate indicates volatile market conditions requiring extra caution');
    }

    // Learning progress insights
    if (learningStats.evolution_stage === 'EXPERIENCED' || learningStats.evolution_stage === 'MASTER') {
      insights.push('AI has reached advanced learning stage - strategies becoming more sophisticated');
    }

    // Performance insights
    if (stats.win_rate > 70) {
      insights.push('Excellent trading performance today - strategies are well-aligned with market conditions');
    } else if (stats.win_rate < 50) {
      insights.push('Below-average performance suggests need for strategy adjustment or market reassessment');
    }

    // Risk management insights
    if (stats.risk_events === 0) {
      insights.push('Clean trading day with no major risk events - shield system operating effectively');
    } else if (stats.risk_events > 3) {
      insights.push('Multiple risk events detected - heightened market volatility requiring defensive approach');
    }

    // Trap detection insights
    if (shieldReport.top_traps.length > 0) {
      const topTrap = shieldReport.top_traps[0];
      insights.push(`Primary market trap today: ${topTrap.type} (${topTrap.count} instances) - adjust strategy accordingly`);
    }

    return insights.slice(0, 5);
  }

  private generateTomorrowFocus(stats: DailyTradingStats, lessons: DailyLesson[]): string[] {
    const focus: string[] = [];

    // Focus based on performance
    if (stats.win_rate < 60) {
      focus.push('Improve signal quality assessment and entry timing');
    }

    if (stats.blocked_signals > stats.total_signals * 0.4) {
      focus.push('Monitor market volatility and adjust risk parameters');
    }

    // Focus based on lessons
    const criticalLessons = lessons.filter(l => l.importance === 'CRITICAL');
    if (criticalLessons.length > 0) {
      focus.push(`Address critical lesson: ${criticalLessons[0].lesson.substring(0, 60)}...`);
    }

    // General focus areas
    if (stats.strategies_banned > 2) {
      focus.push('Review and refine strategy generation algorithms');
    }

    focus.push('Continue monitoring shield effectiveness and trap detection accuracy');
    focus.push('Maintain emotional discipline and systematic approach to trading decisions');

    return focus.slice(0, 4);
  }

  // SELF-ASSESSMENT CALCULATION
  private calculateSelfAssessment(
    stats: DailyTradingStats, 
    emotions: DailyEmotionalState[], 
    lessons: DailyLesson[]
  ): DailyJournalEntry['self_assessment'] {
    // Discipline score based on signal quality and adherence to rules
    const disciplineScore = Math.min(100, 
      50 + (stats.approved_signals > 0 ? (stats.win_rate - 50) : 0) + 
      (stats.blocked_signals > 0 ? 20 : 0) // Bonus for using shield
    );

    // Learning progress based on lessons and evolution
    const learningProgress = Math.min(100, 
      30 + (lessons.length * 10) + 
      (lessons.filter(l => l.importance === 'HIGH' || l.importance === 'CRITICAL').length * 15)
    );

    // Emotional control based on emotional states
    const stressedStates = emotions.filter(e => e.emotion === 'STRESSED' || e.emotion === 'UNCERTAIN').length;
    const emotionalControl = Math.max(20, 100 - (stressedStates * 15));

    // Risk management based on trap detection and bans
    const riskManagement = Math.min(100, 
      60 + (stats.traps_detected > 0 ? 20 : 0) + 
      (stats.risk_events === 0 ? 20 : -stats.risk_events * 5)
    );

    // Overall performance
    const overallPerformance = (disciplineScore + learningProgress + emotionalControl + riskManagement) / 4;

    return {
      discipline_score: Math.round(disciplineScore),
      learning_progress: Math.round(learningProgress),
      emotional_control: Math.round(emotionalControl),
      risk_management: Math.round(riskManagement),
      overall_performance: Math.round(overallPerformance)
    };
  }

  // AUTO-LESSON GENERATION
  private autoGenerateLessons(dailyEntry: DailyJournalEntry): void {
    const stats = dailyEntry.trading_stats;

    // Generate lessons based on performance
    if (stats.win_rate < 50) {
      this.recordLesson(
        'Poor win rate indicates need for better signal filtering and market timing',
        'STRATEGY',
        'HIGH',
        'Daily Performance Analysis'
      );
    }

    if (stats.blocked_signals > stats.total_signals * 0.5) {
      this.recordLesson(
        'High signal rejection rate suggests market conditions require more conservative approach',
        'MARKET',
        'MEDIUM',
        'Shield System Analysis'
      );
    }

    if (stats.strategies_banned > 3) {
      this.recordLesson(
        'Multiple strategy bans indicate need for improved strategy validation before deployment',
        'RISK',
        'CRITICAL',
        'Risk Management Review'
      );
    }

    // Emotional lessons
    const stressedStates = dailyEntry.emotional_state.filter(e => e.emotion === 'STRESSED');
    if (stressedStates.length > 3) {
      this.recordLesson(
        'High stress levels detected - implement better emotional regulation techniques',
        'EMOTIONAL',
        'HIGH',
        'Emotional State Analysis'
      );
    }
  }

  // HELPER METHODS
  private getTodayEmotions(): DailyEmotionalState[] {
    const today = new Date().toDateString();
    return this.emotionalLog.filter(emotion => 
      new Date(emotion.timestamp).toDateString() === today
    );
  }

  private getTodayLessons(): DailyLesson[] {
    const today = new Date().toDateString();
    return this.lessonLog.filter(lesson => 
      new Date(lesson.timestamp).toDateString() === today
    );
  }

  // PUBLIC INTERFACE METHODS
  getCurrentEmotionalState(): DailyEmotionalState | null {
    return this.emotionalLog.length > 0 ? this.emotionalLog[this.emotionalLog.length - 1] : null;
  }

  getRecentLessons(count: number = 10): DailyLesson[] {
    return this.lessonLog.slice(-count);
  }

  getLastReport(): DailyJournalEntry | null {
    return this.dailyEntries.length > 0 ? this.dailyEntries[this.dailyEntries.length - 1] : null;
  }

  getAllReports(days: number = 7): DailyJournalEntry[] {
    return this.dailyEntries.slice(-days);
  }

  // MANUAL REPORT GENERATION
  async generateManualReport(): Promise<DailyJournalEntry> {
    this.lastReportDate = ''; // Reset to force generation
    return await this.generateDailyReport();
  }

  // CONSOLE OUTPUT FOR ADMIN
  printDailyReport(): string {
    const report = this.getLastReport();
    if (!report) return 'No daily report available';

    let output = '\n=== 🧠 WAIDES KI DAILY REPORT ===\n';
    output += `📅 Date: ${report.date}\n\n`;

    output += '📘 Emotional States Today:\n';
    report.emotional_state.slice(-5).forEach(emotion => {
      output += `- [${new Date(emotion.timestamp).toLocaleTimeString()}] ${emotion.emotion} (${emotion.confidence_level}% confidence) - ${emotion.trigger}\n`;
    });

    output += '\n📗 Lessons Learned:\n';
    report.lessons_learned.slice(-5).forEach(lesson => {
      output += `- [${lesson.category}] ${lesson.lesson} (${lesson.importance} priority)\n`;
    });

    output += '\n📊 Trading Performance:\n';
    output += `- Signals Processed: ${report.trading_stats.total_signals}\n`;
    output += `- Signals Approved: ${report.trading_stats.approved_signals}\n`;
    output += `- Signals Blocked: ${report.trading_stats.blocked_signals}\n`;
    output += `- Win Rate: ${report.trading_stats.win_rate}%\n`;
    output += `- Total Return: ${report.trading_stats.total_return.toFixed(2)}%\n`;

    output += '\n🔍 Key Insights:\n';
    report.key_insights.forEach(insight => {
      output += `- ${insight}\n`;
    });

    output += '\n🎯 Tomorrow\'s Focus:\n';
    report.tomorrow_focus.forEach(focus => {
      output += `- ${focus}\n`;
    });

    output += '\n📈 Self-Assessment:\n';
    output += `- Discipline: ${report.self_assessment.discipline_score}/100\n`;
    output += `- Learning: ${report.self_assessment.learning_progress}/100\n`;
    output += `- Emotional Control: ${report.self_assessment.emotional_control}/100\n`;
    output += `- Risk Management: ${report.self_assessment.risk_management}/100\n`;
    output += `- Overall Performance: ${report.self_assessment.overall_performance}/100\n`;

    return output;
  }

  exportReportData(): any {
    return {
      emotional_log: this.emotionalLog,
      lesson_log: this.lessonLog,
      daily_entries: this.dailyEntries,
      current_emotional_state: this.getCurrentEmotionalState(),
      recent_lessons: this.getRecentLessons(),
      timestamp: new Date().toISOString()
    };
  }
}

export const waidesKIDailyReporter = new WaidesKIDailyReporter();