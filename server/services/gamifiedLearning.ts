interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  category: 'BASICS' | 'TECHNICAL_ANALYSIS' | 'RISK_MANAGEMENT' | 'PSYCHOLOGY' | 'STRATEGY' | 'ADVANCED';
  estimatedTime: number; // minutes
  prerequisites: string[];
  lessons: Lesson[];
  isCompleted: boolean;
  score: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'TEXT' | 'QUIZ' | 'SIMULATION' | 'VIDEO' | 'INTERACTIVE';
  questions?: QuizQuestion[];
  isCompleted: boolean;
  score: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'LEARNING' | 'TRADING' | 'STREAK' | 'MASTERY' | 'SPECIAL';
  requirement: {
    type: 'COMPLETE_MODULES' | 'QUIZ_STREAK' | 'PERFECT_SCORE' | 'TIME_SPENT' | 'TRADING_PERFORMANCE';
    value: number;
    target?: string;
  };
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  points: number;
  unlockedAt?: number;
  isUnlocked: boolean;
}

interface UserProgress {
  userId: string;
  level: number;
  totalXP: number;
  currentXP: number;
  xpToNextLevel: number;
  completedModules: string[];
  currentModule?: string;
  streak: {
    current: number;
    longest: number;
    lastActivity: number;
  };
  achievements: Achievement[];
  stats: {
    totalLearningTime: number;
    modulesCompleted: number;
    averageScore: number;
    perfectScores: number;
    quizzesCompleted: number;
  };
  preferences: {
    dailyGoal: number; // minutes
    reminderTime?: string;
    difficulty: 'ADAPTIVE' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  };
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIAL';
  category: string;
  requirement: {
    type: string;
    value: number;
    timeframe?: number;
  };
  reward: {
    xp: number;
    achievement?: string;
    badge?: string;
  };
  startDate: number;
  endDate: number;
  isActive: boolean;
  participants: number;
  completions: number;
}

export class GamifiedLearningSystem {
  private learningModules: Map<string, LearningModule> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private challenges: Map<string, Challenge> = new Map();
  private leaderboard: Array<{userId: string, username: string, level: number, totalXP: number}> = [];

  constructor() {
    this.initializeLearningModules();
    this.initializeAchievements();
    this.initializeChallenges();
  }

  private initializeLearningModules(): void {
    const modules: LearningModule[] = [
      {
        id: 'trading-basics',
        title: 'Trading Fundamentals',
        description: 'Learn the essential concepts of cryptocurrency trading',
        difficulty: 'BEGINNER',
        category: 'BASICS',
        estimatedTime: 45,
        prerequisites: [],
        isCompleted: false,
        score: 0,
        lessons: [
          {
            id: 'what-is-trading',
            title: 'What is Cryptocurrency Trading?',
            content: 'Trading involves buying and selling cryptocurrencies to profit from price movements...',
            type: 'TEXT',
            isCompleted: false,
            score: 0,
            questions: [
              {
                id: 'q1',
                question: 'What is the primary goal of cryptocurrency trading?',
                options: ['To collect cryptocurrencies', 'To profit from price movements', 'To support blockchain technology', 'To mine new coins'],
                correctAnswer: 1,
                explanation: 'Trading aims to profit from buying low and selling high.',
                points: 10
              }
            ]
          },
          {
            id: 'market-basics',
            title: 'Understanding Market Basics',
            content: 'Markets are driven by supply and demand, creating price movements...',
            type: 'TEXT',
            isCompleted: false,
            score: 0,
            questions: [
              {
                id: 'q2',
                question: 'What causes cryptocurrency prices to move?',
                options: ['Government decisions only', 'Supply and demand', 'Mining difficulty', 'Internet speed'],
                correctAnswer: 1,
                explanation: 'Price movements are primarily driven by supply and demand dynamics.',
                points: 10
              }
            ]
          }
        ]
      },
      {
        id: 'technical-analysis-intro',
        title: 'Introduction to Technical Analysis',
        description: 'Learn to read charts and identify trading patterns',
        difficulty: 'INTERMEDIATE',
        category: 'TECHNICAL_ANALYSIS',
        estimatedTime: 60,
        prerequisites: ['trading-basics'],
        isCompleted: false,
        score: 0,
        lessons: [
          {
            id: 'candlestick-patterns',
            title: 'Understanding Candlestick Patterns',
            content: 'Candlesticks show open, high, low, and close prices in a visual format...',
            type: 'INTERACTIVE',
            isCompleted: false,
            score: 0,
            questions: [
              {
                id: 'q3',
                question: 'What does a green/white candlestick indicate?',
                options: ['Price went down', 'Price went up', 'No price movement', 'High volume'],
                correctAnswer: 1,
                explanation: 'Green or white candlesticks indicate the closing price was higher than the opening price.',
                points: 15
              }
            ]
          }
        ]
      },
      {
        id: 'risk-management',
        title: 'Risk Management Essentials',
        description: 'Learn how to protect your capital and manage trading risks',
        difficulty: 'INTERMEDIATE',
        category: 'RISK_MANAGEMENT',
        estimatedTime: 50,
        prerequisites: ['trading-basics'],
        isCompleted: false,
        score: 0,
        lessons: [
          {
            id: 'position-sizing',
            title: 'Position Sizing Strategies',
            content: 'Never risk more than you can afford to lose. Learn proper position sizing...',
            type: 'SIMULATION',
            isCompleted: false,
            score: 0,
            questions: [
              {
                id: 'q4',
                question: 'What percentage of your portfolio should you risk on a single trade?',
                options: ['50%', '25%', '1-2%', '10%'],
                correctAnswer: 2,
                explanation: 'Professional traders typically risk 1-2% of their portfolio per trade.',
                points: 20
              }
            ]
          }
        ]
      }
    ];

    modules.forEach(module => {
      this.learningModules.set(module.id, module);
    });
  }

  private initializeAchievements(): void {
    const achievements: Achievement[] = [
      {
        id: 'first-steps',
        title: 'First Steps',
        description: 'Complete your first learning module',
        icon: '🎯',
        category: 'LEARNING',
        requirement: { type: 'COMPLETE_MODULES', value: 1 },
        rarity: 'COMMON',
        points: 100,
        isUnlocked: false
      },
      {
        id: 'knowledge-seeker',
        title: 'Knowledge Seeker',
        description: 'Complete 5 learning modules',
        icon: '📚',
        category: 'LEARNING',
        requirement: { type: 'COMPLETE_MODULES', value: 5 },
        rarity: 'RARE',
        points: 500,
        isUnlocked: false
      },
      {
        id: 'quiz-master',
        title: 'Quiz Master',
        description: 'Get perfect scores on 10 quizzes in a row',
        icon: '🧠',
        category: 'MASTERY',
        requirement: { type: 'QUIZ_STREAK', value: 10 },
        rarity: 'EPIC',
        points: 1000,
        isUnlocked: false
      },
      {
        id: 'dedicated-learner',
        title: 'Dedicated Learner',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        category: 'STREAK',
        requirement: { type: 'TIME_SPENT', value: 7 },
        rarity: 'RARE',
        points: 750,
        isUnlocked: false
      },
      {
        id: 'trading-legend',
        title: 'Trading Legend',
        description: 'Complete all available modules with perfect scores',
        icon: '👑',
        category: 'MASTERY',
        requirement: { type: 'PERFECT_SCORE', value: 100 },
        rarity: 'LEGENDARY',
        points: 2500,
        isUnlocked: false
      }
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  private initializeChallenges(): void {
    const now = Date.now();
    const challenges: Challenge[] = [
      {
        id: 'daily-learner',
        title: 'Daily Learner',
        description: 'Complete at least 15 minutes of learning today',
        type: 'DAILY',
        category: 'LEARNING',
        requirement: { type: 'LEARNING_TIME', value: 15, timeframe: 24 * 60 * 60 * 1000 },
        reward: { xp: 50 },
        startDate: now,
        endDate: now + 24 * 60 * 60 * 1000,
        isActive: true,
        participants: 0,
        completions: 0
      },
      {
        id: 'weekly-warrior',
        title: 'Weekly Warrior',
        description: 'Complete 3 learning modules this week',
        type: 'WEEKLY',
        category: 'LEARNING',
        requirement: { type: 'COMPLETE_MODULES', value: 3, timeframe: 7 * 24 * 60 * 60 * 1000 },
        reward: { xp: 300, badge: 'weekly-champion' },
        startDate: now,
        endDate: now + 7 * 24 * 60 * 60 * 1000,
        isActive: true,
        participants: 0,
        completions: 0
      }
    ];

    challenges.forEach(challenge => {
      this.challenges.set(challenge.id, challenge);
    });
  }

  // User Progress Management
  public getUserProgress(userId: string): UserProgress {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, this.createNewUserProgress(userId));
    }
    return this.userProgress.get(userId)!;
  }

  private createNewUserProgress(userId: string): UserProgress {
    return {
      userId,
      level: 1,
      totalXP: 0,
      currentXP: 0,
      xpToNextLevel: 100,
      completedModules: [],
      streak: {
        current: 0,
        longest: 0,
        lastActivity: 0
      },
      achievements: [],
      stats: {
        totalLearningTime: 0,
        modulesCompleted: 0,
        averageScore: 0,
        perfectScores: 0,
        quizzesCompleted: 0
      },
      preferences: {
        dailyGoal: 30,
        difficulty: 'ADAPTIVE'
      }
    };
  }

  // Learning Module Management
  public getAllModules(): LearningModule[] {
    return Array.from(this.learningModules.values());
  }

  public getModulesByCategory(category: string): LearningModule[] {
    return Array.from(this.learningModules.values())
      .filter(module => module.category === category);
  }

  public getAvailableModules(userId: string): LearningModule[] {
    const userProgress = this.getUserProgress(userId);
    return Array.from(this.learningModules.values())
      .filter(module => {
        return module.prerequisites.every(prereq => 
          userProgress.completedModules.includes(prereq)
        );
      });
  }

  public startModule(userId: string, moduleId: string): boolean {
    const userProgress = this.getUserProgress(userId);
    const module = this.learningModules.get(moduleId);
    
    if (!module) return false;
    
    // Check prerequisites
    const hasPrerequisites = module.prerequisites.every(prereq => 
      userProgress.completedModules.includes(prereq)
    );
    
    if (!hasPrerequisites) return false;
    
    userProgress.currentModule = moduleId;
    this.updateUserActivity(userId);
    
    return true;
  }

  // Quiz and Assessment
  public submitQuizAnswer(userId: string, moduleId: string, lessonId: string, questionId: string, answer: number): {
    correct: boolean;
    explanation: string;
    points: number;
    xpGained: number;
  } {
    const module = this.learningModules.get(moduleId);
    const lesson = module?.lessons.find(l => l.id === lessonId);
    const question = lesson?.questions?.find(q => q.id === questionId);
    
    if (!question) {
      return { correct: false, explanation: '', points: 0, xpGained: 0 };
    }
    
    const correct = answer === question.correctAnswer;
    const points = correct ? question.points : 0;
    const xpGained = correct ? question.points * 2 : 0;
    
    if (correct) {
      this.addXP(userId, xpGained);
      this.updateQuizStats(userId, true);
    } else {
      this.updateQuizStats(userId, false);
    }
    
    return {
      correct,
      explanation: question.explanation,
      points,
      xpGained
    };
  }

  public completeLesson(userId: string, moduleId: string, lessonId: string): void {
    const userProgress = this.getUserProgress(userId);
    const module = this.learningModules.get(moduleId);
    const lesson = module?.lessons.find(l => l.id === lessonId);
    
    if (lesson && !lesson.isCompleted) {
      lesson.isCompleted = true;
      this.addXP(userId, 25); // Base XP for lesson completion
      this.updateUserActivity(userId);
      
      // Check if module is complete
      if (module && module.lessons.every(l => l.isCompleted)) {
        this.completeModule(userId, moduleId);
      }
    }
  }

  private completeModule(userId: string, moduleId: string): void {
    const userProgress = this.getUserProgress(userId);
    const module = this.learningModules.get(moduleId);
    
    if (module && !userProgress.completedModules.includes(moduleId)) {
      userProgress.completedModules.push(moduleId);
      userProgress.stats.modulesCompleted++;
      module.isCompleted = true;
      
      // Award XP based on module difficulty
      const xpReward = this.getModuleXPReward(module.difficulty);
      this.addXP(userId, xpReward);
      
      // Check for achievements
      this.checkAchievements(userId);
      
      this.updateUserActivity(userId);
    }
  }

  private getModuleXPReward(difficulty: string): number {
    switch (difficulty) {
      case 'BEGINNER': return 100;
      case 'INTERMEDIATE': return 200;
      case 'ADVANCED': return 350;
      case 'EXPERT': return 500;
      default: return 100;
    }
  }

  // XP and Level Management
  private addXP(userId: string, xp: number): void {
    const userProgress = this.getUserProgress(userId);
    userProgress.totalXP += xp;
    userProgress.currentXP += xp;
    
    // Check for level up
    while (userProgress.currentXP >= userProgress.xpToNextLevel) {
      this.levelUp(userId);
    }
  }

  private levelUp(userId: string): void {
    const userProgress = this.getUserProgress(userId);
    userProgress.level++;
    userProgress.currentXP -= userProgress.xpToNextLevel;
    userProgress.xpToNextLevel = this.calculateXPForNextLevel(userProgress.level);
    
    // Award level up bonus
    this.addXP(userId, userProgress.level * 10);
  }

  private calculateXPForNextLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.2, level - 1));
  }

  // Achievement System
  private checkAchievements(userId: string): Achievement[] {
    const userProgress = this.getUserProgress(userId);
    const newAchievements: Achievement[] = [];
    
    for (const achievement of Array.from(this.achievements.values())) {
      if (!achievement.isUnlocked && !userProgress.achievements.find(a => a.id === achievement.id)) {
        if (this.checkAchievementRequirement(userProgress, achievement)) {
          achievement.isUnlocked = true;
          achievement.unlockedAt = Date.now();
          userProgress.achievements.push(achievement);
          this.addXP(userId, achievement.points);
          newAchievements.push(achievement);
        }
      }
    }
    
    return newAchievements;
  }

  private checkAchievementRequirement(userProgress: UserProgress, achievement: Achievement): boolean {
    switch (achievement.requirement.type) {
      case 'COMPLETE_MODULES':
        return userProgress.stats.modulesCompleted >= achievement.requirement.value;
      case 'QUIZ_STREAK':
        return userProgress.streak.current >= achievement.requirement.value;
      case 'PERFECT_SCORE':
        return userProgress.stats.perfectScores >= achievement.requirement.value;
      case 'TIME_SPENT':
        return userProgress.stats.totalLearningTime >= achievement.requirement.value * 60000; // minutes to ms
      default:
        return false;
    }
  }

  // Activity and Streak Management
  private updateUserActivity(userId: string): void {
    const userProgress = this.getUserProgress(userId);
    const now = Date.now();
    const lastActivity = userProgress.streak.lastActivity;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    if (lastActivity === 0 || lastActivity < oneDayAgo) {
      // New streak or broken streak
      userProgress.streak.current = 1;
    } else if (lastActivity >= oneDayAgo) {
      // Continue streak
      userProgress.streak.current++;
      if (userProgress.streak.current > userProgress.streak.longest) {
        userProgress.streak.longest = userProgress.streak.current;
      }
    }
    
    userProgress.streak.lastActivity = now;
  }

  private updateQuizStats(userId: string, correct: boolean): void {
    const userProgress = this.getUserProgress(userId);
    userProgress.stats.quizzesCompleted++;
    
    if (correct) {
      userProgress.stats.perfectScores++;
    }
    
    // Recalculate average score
    userProgress.stats.averageScore = 
      (userProgress.stats.perfectScores / userProgress.stats.quizzesCompleted) * 100;
  }

  // Challenge System
  public getActiveChallenges(): Challenge[] {
    const now = Date.now();
    return Array.from(this.challenges.values())
      .filter(challenge => challenge.isActive && challenge.endDate > now);
  }

  public joinChallenge(userId: string, challengeId: string): boolean {
    const challenge = this.challenges.get(challengeId);
    if (!challenge || !challenge.isActive) return false;
    
    challenge.participants++;
    return true;
  }

  // Leaderboard
  public getLeaderboard(limit: number = 10): Array<{userId: string, username: string, level: number, totalXP: number}> {
    return this.leaderboard
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, limit);
  }

  public updateLeaderboard(userId: string, username: string): void {
    const userProgress = this.getUserProgress(userId);
    const existingEntry = this.leaderboard.find(entry => entry.userId === userId);
    
    if (existingEntry) {
      existingEntry.level = userProgress.level;
      existingEntry.totalXP = userProgress.totalXP;
    } else {
      this.leaderboard.push({
        userId,
        username,
        level: userProgress.level,
        totalXP: userProgress.totalXP
      });
    }
  }

  // Statistics and Analytics
  public getLearningStats(userId: string): {
    totalTime: number;
    modulesCompleted: number;
    averageScore: number;
    currentStreak: number;
    longestStreak: number;
    achievementsUnlocked: number;
    level: number;
    totalXP: number;
  } {
    const userProgress = this.getUserProgress(userId);
    
    return {
      totalTime: userProgress.stats.totalLearningTime,
      modulesCompleted: userProgress.stats.modulesCompleted,
      averageScore: userProgress.stats.averageScore,
      currentStreak: userProgress.streak.current,
      longestStreak: userProgress.streak.longest,
      achievementsUnlocked: userProgress.achievements.length,
      level: userProgress.level,
      totalXP: userProgress.totalXP
    };
  }

  public getRecommendedModules(userId: string): LearningModule[] {
    const userProgress = this.getUserProgress(userId);
    const availableModules = this.getAvailableModules(userId);
    
    // Sort by difficulty preference and category variety
    return availableModules
      .sort((a, b) => {
        if (a.difficulty === userProgress.preferences.difficulty) return -1;
        if (b.difficulty === userProgress.preferences.difficulty) return 1;
        return 0;
      })
      .slice(0, 3);
  }
}