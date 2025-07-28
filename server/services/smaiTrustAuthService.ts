import { db } from '../db.js';
import { users, userSessions } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { SpiritualBridge } from './spiritualBridge.js';

// Create instance for use in this service
const spiritualBridge = new SpiritualBridge();

/**
 * SmaiTrust Authentication - Metaphysical Identity Verification
 * Extends existing authentication with essence-based behavioral biometrics
 */

export interface SmaiTrustProfile {
  userId: number;
  essencePattern: string; // Unique behavioral fingerprint
  breathSignature: number[]; // Breathing rhythm pattern
  motionFingerprint: string; // Movement/typing behavior
  consciousnessLevel: number; // 0-100 spiritual awareness
  lastEssenceUpdate: Date;
}

export interface SmaiTrustVerification {
  isAuthentic: boolean;
  confidenceScore: number; // 0-100
  essenceMatch: number; // 0-100
  spiritualAlignment: number; // 0-100
  behavioralConsistency: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  warnings: string[];
}

export class SmaiTrustAuthService {
  private smaiTrustProfiles: Map<number, SmaiTrustProfile> = new Map();

  /**
   * Initialize SmaiTrust profile for new user
   * Integrates with existing user.moralityScore and user.spiritualAlignment
   */
  async initializeSmaiTrust(
    userId: number, 
    initialBehaviorData: {
      typingPattern?: number[];
      breathingRhythm?: number[];
      motionSignature?: string;
      deviceMetrics?: any;
    }
  ): Promise<SmaiTrustProfile> {
    try {
      // Get user's existing spiritual data
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) throw new Error('User not found for SmaiTrust initialization');

      // Generate essence pattern from behavior + spiritual alignment
      const essencePattern = this.generateEssencePattern(
        initialBehaviorData,
        user.spiritualAlignment || 100,
        user.moralityScore || 100
      );

      // Create breath signature from rhythm data
      const breathSignature = initialBehaviorData.breathingRhythm || this.generateDefaultBreathPattern(userId);

      // Create motion fingerprint from device interactions
      const motionFingerprint = this.createMotionFingerprint(
        initialBehaviorData.typingPattern || [],
        initialBehaviorData.motionSignature || '',
        initialBehaviorData.deviceMetrics
      );

      // Calculate consciousness level based on spiritual alignment
      const consciousnessLevel = this.calculateConsciousnessLevel(
        user.spiritualAlignment || 100,
        user.moralityScore || 100
      );

      const smaiTrustProfile: SmaiTrustProfile = {
        userId,
        essencePattern,
        breathSignature,
        motionFingerprint,
        consciousnessLevel,
        lastEssenceUpdate: new Date()
      };

      // Store in memory cache and update user biometric fields
      this.smaiTrustProfiles.set(userId, smaiTrustProfile);
      
      // Update existing biometric fields with SmaiTrust data
      await db.update(users)
        .set({
          biometricHash: essencePattern,
          biometricPublicKey: JSON.stringify({
            breathSignature: breathSignature.slice(0, 5), // First 5 values for verification
            motionFingerprint: motionFingerprint.substring(0, 32),
            consciousnessLevel
          }),
          lastBiometricAuth: new Date()
        })
        .where(eq(users.id, userId));

      console.log(`✨ SmaiTrust initialized for user ${userId} with consciousness level ${consciousnessLevel}`);
      return smaiTrustProfile;

    } catch (error) {
      console.error('SmaiTrust initialization error:', error);
      throw error;
    }
  }

  /**
   * Verify user identity using SmaiTrust behavioral biometrics
   * Integrates with existing authentication flow
   */
  async verifySmaiTrust(
    userId: number,
    currentBehaviorData: {
      typingPattern?: number[];
      breathingRhythm?: number[];
      motionSignature?: string;
      deviceMetrics?: any;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<SmaiTrustVerification> {
    try {
      // Get stored SmaiTrust profile
      let profile = this.smaiTrustProfiles.get(userId);
      
      if (!profile) {
        // Load from database biometric fields
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user || !user.biometricHash) {
          return {
            isAuthentic: false,
            confidenceScore: 0,
            essenceMatch: 0,
            spiritualAlignment: 0,
            behavioralConsistency: 0,
            riskLevel: 'CRITICAL',
            warnings: ['SmaiTrust profile not found - requires initialization']
          };
        }

        // Reconstruct profile from database
        const biometricData = user.biometricPublicKey ? JSON.parse(user.biometricPublicKey) : {};
        profile = {
          userId,
          essencePattern: user.biometricHash,
          breathSignature: biometricData.breathSignature || [],
          motionFingerprint: biometricData.motionFingerprint || '',
          consciousnessLevel: biometricData.consciousnessLevel || 50,
          lastEssenceUpdate: user.lastBiometricAuth || new Date()
        };
        this.smaiTrustProfiles.set(userId, profile);
      }

      // Generate current essence pattern
      const currentEssence = this.generateEssencePattern(
        currentBehaviorData,
        profile.consciousnessLevel,
        100 // Default morality for verification
      );

      // Calculate matching scores
      const essenceMatch = this.compareEssencePatterns(profile.essencePattern, currentEssence);
      const breathMatch = this.compareBreathSignatures(profile.breathSignature, currentBehaviorData.breathingRhythm || []);
      const motionMatch = this.compareMotionFingerprints(profile.motionFingerprint, currentBehaviorData.motionSignature || '');

      // Get spiritual reading for current verification attempt
      const spiritualReading = spiritualBridge.generateReading(3200, 'smaitrust_verify');
      const spiritualAlignment = spiritualReading.confidenceAmplifier;

      // Calculate behavioral consistency
      const behavioralConsistency = Math.round((essenceMatch + breathMatch + motionMatch) / 3);

      // Overall confidence score
      const confidenceScore = Math.round(
        (essenceMatch * 0.4) + 
        (behavioralConsistency * 0.3) + 
        (spiritualAlignment * 0.2) + 
        (motionMatch * 0.1)
      );

      // Determine risk level and warnings
      const warnings: string[] = [];
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

      if (essenceMatch < 60) {
        warnings.push('Essence pattern variation detected');
        riskLevel = 'MEDIUM';
      }
      if (behavioralConsistency < 50) {
        warnings.push('Behavioral pattern inconsistency');
        riskLevel = 'HIGH';
      }
      if (confidenceScore < 40) {
        warnings.push('Low overall confidence in identity verification');
        riskLevel = 'CRITICAL';
      }

      // Consider authentication successful if confidence > 65%
      const isAuthentic = confidenceScore >= 65 && riskLevel !== 'CRITICAL';

      console.log(`🔮 SmaiTrust verification for user ${userId}: ${isAuthentic ? 'AUTHENTIC' : 'SUSPICIOUS'} (${confidenceScore}% confidence)`);

      return {
        isAuthentic,
        confidenceScore,
        essenceMatch,
        spiritualAlignment,
        behavioralConsistency,
        riskLevel,
        warnings
      };

    } catch (error) {
      console.error('SmaiTrust verification error:', error);
      return {
        isAuthentic: false,
        confidenceScore: 0,
        essenceMatch: 0,
        spiritualAlignment: 0,
        behavioralConsistency: 0,
        riskLevel: 'CRITICAL',
        warnings: ['SmaiTrust verification system error']
      };
    }
  }

  /**
   * Generate unique essence pattern from behavioral data and spiritual metrics
   */
  private generateEssencePattern(
    behaviorData: any,
    spiritualAlignment: number,
    moralityScore: number
  ): string {
    const timestamp = Date.now();
    const behaviorHash = JSON.stringify(behaviorData).length;
    const spiritualSeed = Math.floor(spiritualAlignment * moralityScore / 100);
    
    // Create unique pattern combining behavior, spirituality, and timing
    const pattern = `${behaviorHash}-${spiritualSeed}-${timestamp % 10000}`;
    return Buffer.from(pattern).toString('base64').substring(0, 32);
  }

  /**
   * Generate default breath pattern for users without breath data
   */
  private generateDefaultBreathPattern(userId: number): number[] {
    const seed = userId * 7; // Unique seed per user
    return Array.from({ length: 10 }, (_, i) => 
      Math.floor(((seed + i) % 100) / 10) + 3 // 3-12 range for breath intervals
    );
  }

  /**
   * Create motion fingerprint from typing and device interaction patterns
   */
  private createMotionFingerprint(
    typingPattern: number[],
    motionSignature: string,
    deviceMetrics: any
  ): string {
    const typingHash = typingPattern.reduce((sum, val) => sum + val, 0) || 100;
    const motionHash = motionSignature.length || 50;
    const deviceHash = deviceMetrics ? JSON.stringify(deviceMetrics).length : 25;
    
    return `${typingHash}-${motionHash}-${deviceHash}`.padEnd(32, '0');
  }

  /**
   * Calculate consciousness level based on spiritual metrics
   */
  private calculateConsciousnessLevel(spiritualAlignment: number, moralityScore: number): number {
    return Math.min(100, Math.floor((spiritualAlignment + moralityScore) / 2));
  }

  /**
   * Compare two essence patterns for similarity
   */
  private compareEssencePatterns(stored: string, current: string): number {
    if (!stored || !current) return 0;
    
    const similarity = stored.split('').reduce((matches, char, index) => {
      return matches + (char === current[index] ? 1 : 0);
    }, 0);
    
    return Math.round((similarity / Math.max(stored.length, current.length)) * 100);
  }

  /**
   * Compare breath signatures for authenticity
   */
  private compareBreathSignatures(stored: number[], current: number[]): number {
    if (!stored.length || !current.length) return 50; // Default if no data
    
    const maxLength = Math.max(stored.length, current.length);
    let matches = 0;
    
    for (let i = 0; i < maxLength; i++) {
      const storedVal = stored[i] || stored[stored.length - 1];
      const currentVal = current[i] || current[current.length - 1];
      
      // Allow 20% variance in breath patterns
      if (Math.abs(storedVal - currentVal) <= storedVal * 0.2) {
        matches++;
      }
    }
    
    return Math.round((matches / maxLength) * 100);
  }

  /**
   * Compare motion fingerprints for consistency
   */
  private compareMotionFingerprints(stored: string, current: string): number {
    if (!stored || !current) return 30; // Default if no data
    
    const storedParts = stored.split('-');
    const currentParts = current.split('-');
    let matches = 0;
    
    for (let i = 0; i < Math.max(storedParts.length, currentParts.length); i++) {
      const storedVal = parseInt(storedParts[i]) || 0;
      const currentVal = parseInt(currentParts[i]) || 0;
      
      // Allow 30% variance in motion patterns
      if (Math.abs(storedVal - currentVal) <= Math.max(storedVal, currentVal) * 0.3) {
        matches++;
      }
    }
    
    return Math.round((matches / Math.max(storedParts.length, currentParts.length)) * 100);
  }

  /**
   * Update SmaiTrust profile with new behavioral data (learning system)
   */
  async updateSmaiTrustProfile(userId: number, newBehaviorData: any): Promise<void> {
    const profile = this.smaiTrustProfiles.get(userId);
    if (!profile) return;

    // Update essence pattern with new data
    profile.essencePattern = this.generateEssencePattern(
      newBehaviorData,
      profile.consciousnessLevel,
      100
    );
    profile.lastEssenceUpdate = new Date();

    // Update database
    await db.update(users)
      .set({
        biometricHash: profile.essencePattern,
        lastBiometricAuth: new Date()
      })
      .where(eq(users.id, userId));

    console.log(`🔄 SmaiTrust profile updated for user ${userId}`);
  }

  /**
   * Get SmaiTrust status for user
   */
  getSmaiTrustStatus(userId: number): { 
    hasSmaiTrust: boolean; 
    consciousnessLevel: number; 
    lastUpdate: Date | null 
  } {
    const profile = this.smaiTrustProfiles.get(userId);
    return {
      hasSmaiTrust: !!profile,
      consciousnessLevel: profile?.consciousnessLevel || 0,
      lastUpdate: profile?.lastEssenceUpdate || null
    };
  }
}

export const smaiTrustAuthService = new SmaiTrustAuthService();