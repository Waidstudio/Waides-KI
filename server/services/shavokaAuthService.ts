import { db } from '../db.js';
import { users, wallets } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { SpiritualBridge } from './spiritualBridge.js';

// Create instance for use in this service  
const spiritualBridge = new SpiritualBridge();

/**
 * Shavoka Authentication - Karmic & Moral Verification System
 * Divine judgment layer that ensures spiritual alignment before access
 */

export interface ShavokaProfile {
  userId: number;
  karmicFootprint: number; // -100 to +100 (positive = good karma)
  moralAlignment: number; // 0-100 spiritual morality
  temporalValidation: Date[]; // Blessed time windows
  integrityScore: number; // 0-100 spiritual integrity
  divineStatus: 'BLESSED' | 'APPROVED' | 'NEUTRAL' | 'QUESTIONED' | 'BLOCKED';
  lastKarmicUpdate: Date;
  totalActions: number;
  positiveActions: number;
  negativeActions: number;
}

export interface ShavokaVerification {
  accessGranted: boolean;
  divineJudgment: 'BLESSED' | 'APPROVED' | 'NEUTRAL' | 'QUESTIONED' | 'BLOCKED';
  karmicScore: number;
  moralAlignmentLevel: number;
  integrityVerification: number;
  temporalAlignment: boolean;
  spiritualWarnings: string[];
  divineGuidance: string;
  accessLevel: 'FULL' | 'LIMITED' | 'RESTRICTED' | 'DENIED';
  waitCondition?: string;
}

export interface KarmicAction {
  userId: number;
  actionType: 'TRADING' | 'WALLET' | 'SYSTEM' | 'SOCIAL' | 'LEARNING';
  actionDescription: string;
  karmicImpact: number; // -10 to +10
  moralWeight: number; // 0-10 (importance)
  timestamp: Date;
  divineAssessment: string;
}

export class ShavokaAuthService {
  private shavokaProfiles: Map<number, ShavokaProfile> = new Map();
  private karmicHistory: Map<number, KarmicAction[]> = new Map();
  
  // Sacred time windows for heightened spiritual access
  private readonly SACRED_HOURS = [1, 2, 3, 4, 17, 18, 19, 20, 21]; // 1-4 AM, 5-9 PM
  
  /**
   * Initialize Shavoka profile using existing morality and spiritual data
   */
  async initializeShavoka(userId: number): Promise<ShavokaProfile> {
    try {
      // Get existing user data including wallet karma
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
      
      if (!user) throw new Error('User not found for Shavoka initialization');

      // Calculate karmic footprint from existing data
      const baseKarma = user.moralityScore || 100;
      const walletKarma = wallet?.karmaScore || 100;
      const karmicFootprint = Math.round((baseKarma + walletKarma) / 2) - 50; // Convert to -50 to +50 range

      // Determine divine status based on scores
      const divineStatus = this.calculateDivineStatus(
        user.moralityScore || 100,
        user.spiritualAlignment || 100,
        karmicFootprint
      );

      // Generate temporal validation windows
      const temporalValidation = this.generateTemporalWindows();

      const shavokaProfile: ShavokaProfile = {
        userId,
        karmicFootprint,
        moralAlignment: user.spiritualAlignment || 100,
        temporalValidation,
        integrityScore: user.moralityScore || 100,
        divineStatus,
        lastKarmicUpdate: new Date(),
        totalActions: 0,
        positiveActions: 0,
        negativeActions: 0
      };

      // Store profile
      this.shavokaProfiles.set(userId, shavokaProfile);
      this.karmicHistory.set(userId, []);

      // Update user spiritual alignment if needed
      if (user.spiritualAlignment !== shavokaProfile.moralAlignment) {
        await db.update(users)
          .set({ spiritualAlignment: shavokaProfile.moralAlignment })
          .where(eq(users.id, userId));
      }

      console.log(`🔱 Shavoka initialized for user ${userId} with divine status: ${divineStatus}`);
      return shavokaProfile;

    } catch (error) {
      console.error('Shavoka initialization error:', error);
      throw error;
    }
  }

  /**
   * Perform Shavoka karmic and moral verification
   */
  async performShavokaVerification(
    userId: number,
    requestedAction: string,
    accessLevel: 'BASIC' | 'ADVANCED' | 'ADMIN' = 'BASIC'
  ): Promise<ShavokaVerification> {
    try {
      // Get or initialize Shavoka profile
      let profile = this.shavokaProfiles.get(userId);
      if (!profile) {
        profile = await this.initializeShavoka(userId);
      }

      // Get spiritual reading for current moment
      const spiritualReading = spiritualBridge.generateReading(3200, 'shavoka_verify');
      
      // Check temporal alignment (sacred times)
      const currentHour = new Date().getHours();
      const temporalAlignment = this.SACRED_HOURS.includes(currentHour);

      // Calculate karmic assessment for requested action
      const actionKarma = this.assessActionKarma(requestedAction, profile);
      
      // Divine judgment calculation
      const karmicScore = Math.max(0, Math.min(100, profile.karmicFootprint + 50)); // Convert to 0-100
      const moralAlignmentLevel = profile.moralAlignment;
      const integrityVerification = profile.integrityScore;

      // Overall divine assessment
      const divineScore = Math.round(
        (karmicScore * 0.35) + 
        (moralAlignmentLevel * 0.30) + 
        (integrityVerification * 0.25) + 
        (spiritualReading.confidenceAmplifier * 0.10)
      );

      // Determine divine judgment
      const divineJudgment = this.calculateDivineJudgment(divineScore, actionKarma, temporalAlignment);
      
      // Access decision
      const accessGranted = this.determineAccess(divineJudgment, accessLevel, temporalAlignment);
      const accessLevelGranted = this.determineAccessLevel(divineJudgment, accessLevel);

      // Generate spiritual warnings and guidance
      const spiritualWarnings = this.generateSpiritualWarnings(profile, actionKarma, divineScore);
      const divineGuidance = this.generateDivineGuidance(divineJudgment, requestedAction, spiritualReading);

      // Wait condition for denied access
      const waitCondition = !accessGranted ? this.generateWaitCondition(divineJudgment, temporalAlignment) : undefined;

      // Record this verification attempt
      await this.recordKarmicAction(userId, {
        actionType: this.categorizeAction(requestedAction),
        actionDescription: `Shavoka verification: ${requestedAction}`,
        karmicImpact: actionKarma,
        moralWeight: accessLevel === 'ADMIN' ? 8 : accessLevel === 'ADVANCED' ? 5 : 3,
        timestamp: new Date(),
        divineAssessment: divineGuidance
      });

      console.log(`🔱 Shavoka verification for user ${userId}: ${divineJudgment} (${divineScore}% divine score)`);

      return {
        accessGranted,
        divineJudgment,
        karmicScore,
        moralAlignmentLevel,
        integrityVerification,
        temporalAlignment,
        spiritualWarnings,
        divineGuidance,
        accessLevel: accessLevelGranted,
        waitCondition
      };

    } catch (error) {
      console.error('Shavoka verification error:', error);
      return {
        accessGranted: false,
        divineJudgment: 'BLOCKED',
        karmicScore: 0,
        moralAlignmentLevel: 0,
        integrityVerification: 0,
        temporalAlignment: false,
        spiritualWarnings: ['Shavoka verification system error'],
        divineGuidance: 'System error - please try again in a moment',
        accessLevel: 'DENIED'
      };
    }
  }

  /**
   * Record karmic action and update user's karmic profile
   */
  async recordKarmicAction(userId: number, action: Omit<KarmicAction, 'userId'>): Promise<void> {
    const karmicAction: KarmicAction = { userId, ...action };
    
    // Add to history
    if (!this.karmicHistory.has(userId)) {
      this.karmicHistory.set(userId, []);
    }
    this.karmicHistory.get(userId)!.push(karmicAction);

    // Update profile karma
    const profile = this.shavokaProfiles.get(userId);
    if (profile) {
      profile.karmicFootprint += action.karmicImpact;
      profile.totalActions++;
      
      if (action.karmicImpact > 0) {
        profile.positiveActions++;
      } else if (action.karmicImpact < 0) {
        profile.negativeActions++;
      }

      // Recalculate divine status
      profile.divineStatus = this.calculateDivineStatus(
        profile.integrityScore,
        profile.moralAlignment,
        profile.karmicFootprint
      );

      profile.lastKarmicUpdate = new Date();

      // Update database if significant karma change
      if (Math.abs(action.karmicImpact) >= 5) {
        await this.updateDatabaseKarma(userId, profile);
      }
    }
  }

  /**
   * Calculate divine status based on spiritual metrics
   */
  private calculateDivineStatus(
    moralityScore: number,
    spiritualAlignment: number,
    karmicFootprint: number
  ): 'BLESSED' | 'APPROVED' | 'NEUTRAL' | 'QUESTIONED' | 'BLOCKED' {
    const overallScore = (moralityScore + spiritualAlignment) / 2 + karmicFootprint;
    
    if (overallScore >= 140) return 'BLESSED';
    if (overallScore >= 110) return 'APPROVED';
    if (overallScore >= 80) return 'NEUTRAL';
    if (overallScore >= 50) return 'QUESTIONED';
    return 'BLOCKED';
  }

  /**
   * Generate temporal validation windows (blessed times)
   */
  private generateTemporalWindows(): Date[] {
    const windows: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Add sacred hours for each day
      this.SACRED_HOURS.forEach(hour => {
        const window = new Date(date);
        window.setHours(hour, 0, 0, 0);
        windows.push(window);
      });
    }
    return windows;
  }

  /**
   * Assess karmic impact of requested action
   */
  private assessActionKarma(action: string, profile: ShavokaProfile): number {
    const lowerAction = action.toLowerCase();
    
    // Positive karma actions
    if (lowerAction.includes('learn') || lowerAction.includes('education')) return 2;
    if (lowerAction.includes('help') || lowerAction.includes('support')) return 3;
    if (lowerAction.includes('share') || lowerAction.includes('teach')) return 2;
    if (lowerAction.includes('donate') || lowerAction.includes('charity')) return 5;
    
    // Neutral actions
    if (lowerAction.includes('view') || lowerAction.includes('read')) return 0;
    if (lowerAction.includes('login') || lowerAction.includes('access')) return 0;
    
    // Potentially negative actions (require higher scrutiny)
    if (lowerAction.includes('delete') || lowerAction.includes('remove')) return -1;
    if (lowerAction.includes('admin') && profile.divineStatus !== 'BLESSED') return -2;
    if (lowerAction.includes('override') && profile.divineStatus === 'BLOCKED') return -5;
    
    return 0; // Default neutral
  }

  /**
   * Calculate divine judgment based on scores and conditions
   */
  private calculateDivineJudgment(
    divineScore: number,
    actionKarma: number,
    temporalAlignment: boolean
  ): 'BLESSED' | 'APPROVED' | 'NEUTRAL' | 'QUESTIONED' | 'BLOCKED' {
    const adjustedScore = divineScore + actionKarma + (temporalAlignment ? 10 : 0);
    
    if (adjustedScore >= 90) return 'BLESSED';
    if (adjustedScore >= 75) return 'APPROVED';
    if (adjustedScore >= 60) return 'NEUTRAL';
    if (adjustedScore >= 40) return 'QUESTIONED';
    return 'BLOCKED';
  }

  /**
   * Determine access based on divine judgment and requested level
   */
  private determineAccess(
    judgment: 'BLESSED' | 'APPROVED' | 'NEUTRAL' | 'QUESTIONED' | 'BLOCKED',
    requestedLevel: 'BASIC' | 'ADVANCED' | 'ADMIN',
    temporalAlignment: boolean
  ): boolean {
    switch (requestedLevel) {
      case 'BASIC':
        return judgment !== 'BLOCKED';
      case 'ADVANCED':
        return ['BLESSED', 'APPROVED', 'NEUTRAL'].includes(judgment) || 
               (judgment === 'QUESTIONED' && temporalAlignment);
      case 'ADMIN':
        return ['BLESSED', 'APPROVED'].includes(judgment) && temporalAlignment;
      default:
        return false;
    }
  }

  /**
   * Determine granted access level
   */
  private determineAccessLevel(
    judgment: 'BLESSED' | 'APPROVED' | 'NEUTRAL' | 'QUESTIONED' | 'BLOCKED',
    requestedLevel: 'BASIC' | 'ADVANCED' | 'ADMIN'
  ): 'FULL' | 'LIMITED' | 'RESTRICTED' | 'DENIED' {
    if (judgment === 'BLOCKED') return 'DENIED';
    if (judgment === 'QUESTIONED') return 'RESTRICTED';
    if (judgment === 'NEUTRAL' && requestedLevel === 'ADMIN') return 'LIMITED';
    if (['BLESSED', 'APPROVED'].includes(judgment)) return 'FULL';
    return 'LIMITED';
  }

  /**
   * Generate spiritual warnings based on profile and action
   */
  private generateSpiritualWarnings(
    profile: ShavokaProfile,
    actionKarma: number,
    divineScore: number
  ): string[] {
    const warnings: string[] = [];
    
    if (profile.karmicFootprint < -20) {
      warnings.push('Heavy karmic debt detected - consider positive actions');
    }
    if (profile.moralAlignment < 60) {
      warnings.push('Spiritual alignment needs attention - meditation recommended');
    }
    if (actionKarma < -2) {
      warnings.push('This action may have negative karmic consequences');
    }
    if (divineScore < 50) {
      warnings.push('Overall spiritual state requires improvement');
    }
    if (profile.negativeActions > profile.positiveActions * 2) {
      warnings.push('Pattern of negative actions detected - seek spiritual guidance');
    }
    
    return warnings;
  }

  /**
   * Generate divine guidance message
   */
  private generateDivineGuidance(
    judgment: string,
    action: string,
    spiritualReading: any
  ): string {
    const guidanceMap = {
      'BLESSED': [
        'Your spiritual light shines bright - proceed with divine blessing',
        'The universe aligns with your pure intentions',
        'Sacred wisdom guides your path forward'
      ],
      'APPROVED': [
        'Your actions honor the divine path - continue with grace',
        'Spiritual alignment supports your journey',
        'The cosmos approves your righteous intentions'
      ],
      'NEUTRAL': [
        'Balance your actions with spiritual awareness',
        'Seek harmony between desire and divine will',
        'Meditate on the deeper purpose of your actions'
      ],
      'QUESTIONED': [
        'Reflect on your spiritual alignment before proceeding',
        'The divine asks you to consider your motivations',
        'Seek wisdom through prayer or meditation'
      ],
      'BLOCKED': [
        'Your current spiritual state blocks this path',
        'Engage in spiritual purification before proceeding',
        'The divine protects you from karmic consequences'
      ]
    };
    
    const messages = guidanceMap[judgment as keyof typeof guidanceMap] || guidanceMap['NEUTRAL'];
    const baseMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Add spiritual reading guidance
    const spiritualGuidance = spiritualReading.spiritMessage || 'Seek inner wisdom';
    
    return `${baseMessage} | Spiritual insight: ${spiritualGuidance}`;
  }

  /**
   * Generate wait condition for denied access
   */
  private generateWaitCondition(
    judgment: string,
    temporalAlignment: boolean
  ): string {
    if (judgment === 'BLOCKED') {
      return 'Perform positive karmic actions and seek spiritual purification';
    }
    if (judgment === 'QUESTIONED' && !temporalAlignment) {
      return 'Wait for sacred hours (1-4 AM or 5-9 PM) for enhanced spiritual access';
    }
    return 'Improve spiritual alignment through meditation and positive actions';
  }

  /**
   * Categorize action type for karmic tracking
   */
  private categorizeAction(action: string): 'TRADING' | 'WALLET' | 'SYSTEM' | 'SOCIAL' | 'LEARNING' {
    const lowerAction = action.toLowerCase();
    
    if (lowerAction.includes('trade') || lowerAction.includes('buy') || lowerAction.includes('sell')) {
      return 'TRADING';
    }
    if (lowerAction.includes('wallet') || lowerAction.includes('balance') || lowerAction.includes('transfer')) {
      return 'WALLET';
    }
    if (lowerAction.includes('admin') || lowerAction.includes('system') || lowerAction.includes('config')) {
      return 'SYSTEM';
    }
    if (lowerAction.includes('chat') || lowerAction.includes('forum') || lowerAction.includes('social')) {
      return 'SOCIAL';
    }
    return 'LEARNING';
  }

  /**
   * Update database with karmic changes
   */
  private async updateDatabaseKarma(userId: number, profile: ShavokaProfile): Promise<void> {
    try {
      // Update user spiritual alignment
      await db.update(users)
        .set({ spiritualAlignment: profile.moralAlignment })
        .where(eq(users.id, userId));
      
      // Update wallet karma score
      const walletKarma = Math.max(0, Math.min(100, profile.karmicFootprint + 50));
      await db.update(wallets)
        .set({ karmaScore: walletKarma })
        .where(eq(wallets.userId, userId));
        
    } catch (error) {
      console.error('Database karma update error:', error);
    }
  }

  /**
   * Get Shavoka status for user
   */
  getShavokaStatus(userId: number): {
    hasShavoka: boolean;
    divineStatus: string;
    karmicFootprint: number;
    moralAlignment: number;
    integrityScore: number;
    totalActions: number;
    lastUpdate: Date | null;
  } {
    const profile = this.shavokaProfiles.get(userId);
    return {
      hasShavoka: !!profile,
      divineStatus: profile?.divineStatus || 'UNKNOWN',
      karmicFootprint: profile?.karmicFootprint || 0,
      moralAlignment: profile?.moralAlignment || 0,
      integrityScore: profile?.integrityScore || 0,
      totalActions: profile?.totalActions || 0,
      lastUpdate: profile?.lastKarmicUpdate || null
    };
  }

  /**
   * Get karmic history for user
   */
  getKarmicHistory(userId: number, limit: number = 10): KarmicAction[] {
    const history = this.karmicHistory.get(userId) || [];
    return history.slice(-limit).reverse(); // Most recent first
  }
}

export const shavokaAuthService = new ShavokaAuthService();