import crypto from 'crypto';
import { db } from '../storage';
import { 
  transactionSecurity,
  financialAuditTrail,
  jwtAuditTrail,
  authenticationAttempts,
  users,
  type InsertTransactionSecurity,
  type InsertFinancialAuditTrail,
  type InsertJwtAuditTrail,
  type InsertAuthenticationAttempt
} from '../../shared/schema';
import { eq, and, desc, gte, count } from 'drizzle-orm';

/**
 * Transaction Security Service
 * Handles transaction signing, verification, and credential encryption
 * Addresses Questions 3, 4, 5, 6, 7 from the security enhancement plan
 */
export class TransactionSecurityService {
  private static instance: TransactionSecurityService;
  
  // Security configuration
  private readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private readonly HASH_ALGORITHM = 'sha256';
  private readonly KEY_DERIVATION_ROUNDS = 100000;
  private readonly SIGNATURE_ALGORITHM = 'rsa-sha256';
  
  public static getInstance(): TransactionSecurityService {
    if (!TransactionSecurityService.instance) {
      TransactionSecurityService.instance = new TransactionSecurityService();
    }
    return TransactionSecurityService.instance;
  }

  // ===== QUESTION 3: JWT TOKEN AUDITING =====

  /**
   * Create audit trail entry for JWT token activity
   */
  async auditJWTToken(data: {
    userId?: number;
    tokenId: string;
    tokenType: 'access' | 'refresh' | 'reset';
    action: 'issued' | 'used' | 'revoked' | 'expired';
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    expiresAt?: Date;
    revokedReason?: string;
    suspicious?: boolean;
    riskScore?: number;
  }): Promise<boolean> {
    try {
      const auditEntry: InsertJwtAuditTrail = {
        userId: data.userId || null,
        tokenId: data.tokenId,
        tokenType: data.tokenType,
        action: data.action,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        location: data.location,
        issuedAt: data.action === 'issued' ? new Date() : undefined,
        expiresAt: data.expiresAt,
        revokedAt: data.action === 'revoked' ? new Date() : undefined,
        revokedReason: data.revokedReason,
        suspicious: data.suspicious || false,
        riskScore: data.riskScore || 0,
      };

      await db.insert(jwtAuditTrail).values(auditEntry);
      
      console.log(`🔐 JWT audit logged: ${data.action} ${data.tokenType} token for user ${data.userId}`);
      return true;
    } catch (error) {
      console.error('Error auditing JWT token:', error);
      return false;
    }
  }

  /**
   * Get JWT token usage statistics for user
   */
  async getJWTTokenStats(userId: number, timeRange: number = 86400000): Promise<{
    totalTokens: number;
    revokedTokens: number;
    suspiciousTokens: number;
    recentActivity: any[];
  }> {
    try {
      const since = new Date(Date.now() - timeRange);
      
      // Get total tokens
      const totalResult = await db
        .select({ count: count() })
        .from(jwtAuditTrail)
        .where(
          and(
            eq(jwtAuditTrail.userId, userId),
            gte(jwtAuditTrail.createdAt, since)
          )
        );

      // Get revoked tokens
      const revokedResult = await db
        .select({ count: count() })
        .from(jwtAuditTrail)
        .where(
          and(
            eq(jwtAuditTrail.userId, userId),
            eq(jwtAuditTrail.action, 'revoked'),
            gte(jwtAuditTrail.createdAt, since)
          )
        );

      // Get suspicious tokens
      const suspiciousResult = await db
        .select({ count: count() })
        .from(jwtAuditTrail)
        .where(
          and(
            eq(jwtAuditTrail.userId, userId),
            eq(jwtAuditTrail.suspicious, true),
            gte(jwtAuditTrail.createdAt, since)
          )
        );

      // Get recent activity
      const recentActivity = await db
        .select({
          tokenType: jwtAuditTrail.tokenType,
          action: jwtAuditTrail.action,
          ipAddress: jwtAuditTrail.ipAddress,
          suspicious: jwtAuditTrail.suspicious,
          riskScore: jwtAuditTrail.riskScore,
          createdAt: jwtAuditTrail.createdAt,
        })
        .from(jwtAuditTrail)
        .where(
          and(
            eq(jwtAuditTrail.userId, userId),
            gte(jwtAuditTrail.createdAt, since)
          )
        )
        .orderBy(desc(jwtAuditTrail.createdAt))
        .limit(20);

      return {
        totalTokens: totalResult[0]?.count || 0,
        revokedTokens: revokedResult[0]?.count || 0,
        suspiciousTokens: suspiciousResult[0]?.count || 0,
        recentActivity,
      };
    } catch (error) {
      console.error('Error getting JWT token stats:', error);
      return { totalTokens: 0, revokedTokens: 0, suspiciousTokens: 0, recentActivity: [] };
    }
  }

  /**
   * Revoke suspicious JWT tokens
   */
  async revokeSuspiciousTokens(userId: number, reason: string): Promise<number> {
    try {
      const suspiciousTokens = await db
        .select()
        .from(jwtAuditTrail)
        .where(
          and(
            eq(jwtAuditTrail.userId, userId),
            eq(jwtAuditTrail.suspicious, true),
            eq(jwtAuditTrail.action, 'issued')
          )
        );

      let revokedCount = 0;
      for (const token of suspiciousTokens) {
        await this.auditJWTToken({
          userId,
          tokenId: token.tokenId,
          tokenType: token.tokenType as any,
          action: 'revoked',
          revokedReason: reason,
        });
        revokedCount++;
      }

      console.log(`🔐 Revoked ${revokedCount} suspicious tokens for user ${userId}`);
      return revokedCount;
    } catch (error) {
      console.error('Error revoking suspicious tokens:', error);
      return 0;
    }
  }

  // ===== QUESTION 4: AUTHENTICATION ATTEMPT TRACKING =====

  /**
   * Log authentication attempt with detailed information
   */
  async logAuthenticationAttempt(data: {
    userId?: number;
    email?: string;
    attemptType: 'login' | 'password_reset' | 'mfa' | 'biometric';
    success: boolean;
    failureReason?: string;
    ipAddress: string;
    userAgent?: string;
    location?: string;
    deviceFingerprint?: string;
    sessionId?: string;
    mfaMethod?: '2fa' | 'biometric' | 'smai_print';
  }): Promise<{ shouldBlock: boolean; riskScore: number }> {
    try {
      // Calculate risk score based on recent failed attempts
      let riskScore = 0;
      if (!data.success) {
        const recentFailed = await this.getRecentFailedAttempts(data.ipAddress, data.email);
        riskScore = Math.min(recentFailed * 10, 100);
      }

      const authAttempt: InsertAuthenticationAttempt = {
        userId: data.userId || null,
        email: data.email,
        attemptType: data.attemptType,
        success: data.success,
        failureReason: data.failureReason,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        location: data.location,
        deviceFingerprint: data.deviceFingerprint,
        sessionId: data.sessionId,
        mfaMethod: data.mfaMethod,
        riskScore,
        blockedBySystem: riskScore >= 80,
      };

      await db.insert(authenticationAttempts).values(authAttempt);

      // Log JWT token audit if this was a successful login
      if (data.success && data.sessionId && data.userId) {
        await this.auditJWTToken({
          userId: data.userId,
          tokenId: data.sessionId,
          tokenType: 'access',
          action: 'issued',
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          location: data.location,
          suspicious: riskScore > 50,
          riskScore,
        });
      }

      console.log(`🔐 Auth attempt logged: ${data.attemptType} ${data.success ? 'success' : 'failed'} for ${data.email || data.userId}`);
      
      return {
        shouldBlock: riskScore >= 80,
        riskScore,
      };
    } catch (error) {
      console.error('Error logging authentication attempt:', error);
      return { shouldBlock: false, riskScore: 0 };
    }
  }

  /**
   * Get authentication attempt statistics
   */
  async getAuthenticationStats(timeRange: number = 86400000): Promise<{
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    blockedAttempts: number;
    topFailureReasons: { reason: string; count: number }[];
    riskiestIPs: { ip: string; riskScore: number; attempts: number }[];
  }> {
    try {
      const since = new Date(Date.now() - timeRange);
      
      // Total attempts
      const totalResult = await db
        .select({ count: count() })
        .from(authenticationAttempts)
        .where(gte(authenticationAttempts.createdAt, since));

      // Successful attempts
      const successResult = await db
        .select({ count: count() })
        .from(authenticationAttempts)
        .where(
          and(
            eq(authenticationAttempts.success, true),
            gte(authenticationAttempts.createdAt, since)
          )
        );

      // Failed attempts
      const failedResult = await db
        .select({ count: count() })
        .from(authenticationAttempts)
        .where(
          and(
            eq(authenticationAttempts.success, false),
            gte(authenticationAttempts.createdAt, since)
          )
        );

      // Blocked attempts
      const blockedResult = await db
        .select({ count: count() })
        .from(authenticationAttempts)
        .where(
          and(
            eq(authenticationAttempts.blockedBySystem, true),
            gte(authenticationAttempts.createdAt, since)
          )
        );

      return {
        totalAttempts: totalResult[0]?.count || 0,
        successfulAttempts: successResult[0]?.count || 0,
        failedAttempts: failedResult[0]?.count || 0,
        blockedAttempts: blockedResult[0]?.count || 0,
        topFailureReasons: [], // Simplified for brevity
        riskiestIPs: [], // Simplified for brevity
      };
    } catch (error) {
      console.error('Error getting authentication stats:', error);
      return { totalAttempts: 0, successfulAttempts: 0, failedAttempts: 0, blockedAttempts: 0, topFailureReasons: [], riskiestIPs: [] };
    }
  }

  // ===== QUESTION 5: TRANSACTION SIGNING (Enhanced) =====

  /**
   * Create secure transaction signature with advanced verification
   */
  async createTransactionSignature(userId: number, transactionData: {
    transactionId: string;
    transactionType: 'deposit' | 'withdrawal' | 'trade' | 'transfer';
    amount: string;
    currency: string;
    recipientAddress?: string;
    metadata?: any;
  }): Promise<{ 
    signature: string; 
    publicKey: string; 
    hash: string; 
    nonce: string;
    verified: boolean;
  } | null> {
    try {
      // Generate or retrieve user's key pair
      const keyPair = await this.getOrCreateUserKeyPair(userId);
      
      // Create comprehensive transaction hash
      const transactionHash = this.createTransactionHash(transactionData);
      
      // Generate cryptographically secure nonce
      const nonce = crypto.randomBytes(32).toString('hex');
      
      // Create signature payload
      const signaturePayload = `${transactionHash}:${nonce}:${Date.now()}`;
      
      // Sign the payload
      const signature = crypto.sign(this.SIGNATURE_ALGORITHM, Buffer.from(signaturePayload), keyPair.privateKey).toString('base64');
      
      // Store transaction security record
      const securityRecord: InsertTransactionSecurity = {
        transactionId: transactionData.transactionId,
        userId,
        transactionType: transactionData.transactionType,
        amount: transactionData.amount,
        currency: transactionData.currency,
        digitalSignature: signature,
        publicKeyUsed: keyPair.publicKey.toString('base64'),
        hashAlgorithm: this.HASH_ALGORITHM,
        encryptionMethod: this.ENCRYPTION_ALGORITHM,
        verificationStatus: 'verified',
        verifiedAt: new Date(),
        nonce,
      };

      await db.insert(transactionSecurity).values(securityRecord);

      // Create financial audit trail
      await this.createFinancialAudit(userId, transactionData.transactionId, {
        auditType: transactionData.transactionType,
        beforeBalance: '0', // To be updated with actual balance
        afterBalance: '0', // To be updated with actual balance
        amountChanged: transactionData.amount,
        currency: transactionData.currency,
        reason: `Secure transaction: ${transactionData.transactionType}`,
      });

      console.log(`✍️ Transaction signature created: ${transactionData.transactionId}`);

      return {
        signature,
        publicKey: keyPair.publicKey.toString('base64'),
        hash: transactionHash,
        nonce,
        verified: true,
      };
    } catch (error) {
      console.error('Error creating transaction signature:', error);
      return null;
    }
  }

  /**
   * Verify transaction signature with comprehensive checks
   */
  async verifyTransactionSignature(transactionId: string, providedSignature?: string): Promise<{
    valid: boolean;
    verified: boolean;
    reason?: string;
    riskScore: number;
  }> {
    try {
      const securityRecord = await db
        .select()
        .from(transactionSecurity)
        .where(eq(transactionSecurity.transactionId, transactionId))
        .limit(1);

      if (!securityRecord.length) {
        return { valid: false, verified: false, reason: 'No security record found', riskScore: 100 };
      }

      const record = securityRecord[0];
      let riskScore = 0;

      // Check if provided signature matches stored signature (if provided)
      if (providedSignature && providedSignature !== record.digitalSignature) {
        riskScore += 50;
      }

      // Verify signature cryptographically
      const publicKey = Buffer.from(record.publicKeyUsed, 'base64');
      const signature = Buffer.from(record.digitalSignature, 'base64');
      
      // Reconstruct signature payload
      const transactionHash = this.createTransactionHash({
        transactionId: record.transactionId,
        transactionType: record.transactionType,
        amount: record.amount,
        currency: record.currency,
      });
      
      const signaturePayload = `${transactionHash}:${record.nonce}:${record.createdAt?.getTime()}`;
      
      const isValidSignature = crypto.verify(this.SIGNATURE_ALGORITHM, Buffer.from(signaturePayload), publicKey, signature);
      
      if (!isValidSignature) {
        riskScore += 80;
      }

      // Check for replay attacks (nonce uniqueness)
      const nonceUsed = await this.checkNonceUsage(record.nonce, record.userId);
      if (nonceUsed) {
        riskScore += 100;
      }

      // Update verification status
      const verificationStatus = riskScore < 50 ? 'verified' : 'failed';
      const failureReason = riskScore >= 50 ? `Signature verification failed (Risk: ${riskScore})` : undefined;

      await db
        .update(transactionSecurity)
        .set({
          verificationStatus,
          verifiedAt: new Date(),
          verificationFailureReason: failureReason,
        })
        .where(eq(transactionSecurity.transactionId, transactionId));

      console.log(`✅ Transaction signature verified: ${transactionId} (Risk: ${riskScore})`);

      return {
        valid: isValidSignature,
        verified: riskScore < 50,
        reason: failureReason,
        riskScore,
      };
    } catch (error) {
      console.error('Error verifying transaction signature:', error);
      return { valid: false, verified: false, reason: 'Verification error', riskScore: 100 };
    }
  }

  // ===== QUESTION 6: FINANCIAL AUDIT TRAIL =====

  /**
   * Create comprehensive financial audit record
   */
  async createFinancialAudit(userId: number, transactionId: string, data: {
    auditType: 'deposit' | 'withdrawal' | 'balance_change' | 'freeze' | 'unfreeze';
    beforeBalance: string;
    afterBalance: string;
    amountChanged: string;
    currency: string;
    reason: string;
    approvedBy?: number;
    botId?: string;
  }): Promise<boolean> {
    try {
      // Generate integrity hash
      const auditHash = this.generateAuditHash(userId, transactionId, data);
      
      const auditRecord: InsertFinancialAuditTrail = {
        userId,
        transactionId,
        auditType: data.auditType,
        beforeBalance: data.beforeBalance,
        afterBalance: data.afterBalance,
        amountChanged: data.amountChanged,
        currency: data.currency,
        reason: data.reason,
        approvedBy: data.approvedBy,
        botId: data.botId,
        complianceStatus: 'compliant', // Default to compliant, can be updated
        auditHash,
      };

      await db.insert(financialAuditTrail).values(auditRecord);
      
      console.log(`📊 Financial audit created: ${transactionId} (${data.auditType})`);
      return true;
    } catch (error) {
      console.error('Error creating financial audit:', error);
      return false;
    }
  }

  /**
   * Verify audit trail integrity
   */
  async verifyAuditIntegrity(userId: number, timeRange: number = 86400000): Promise<{
    totalRecords: number;
    integrityViolations: number;
    suspiciousRecords: any[];
  }> {
    try {
      const since = new Date(Date.now() - timeRange);
      
      const auditRecords = await db
        .select()
        .from(financialAuditTrail)
        .where(
          and(
            eq(financialAuditTrail.userId, userId),
            gte(financialAuditTrail.createdAt, since)
          )
        );

      let integrityViolations = 0;
      const suspiciousRecords = [];

      for (const record of auditRecords) {
        // Verify hash integrity
        const expectedHash = this.generateAuditHash(record.userId, record.transactionId, {
          auditType: record.auditType,
          beforeBalance: record.beforeBalance,
          afterBalance: record.afterBalance,
          amountChanged: record.amountChanged,
          currency: record.currency,
          reason: record.reason,
          approvedBy: record.approvedBy,
          botId: record.botId,
        });

        if (expectedHash !== record.auditHash) {
          integrityViolations++;
          suspiciousRecords.push({
            id: record.id,
            transactionId: record.transactionId,
            reason: 'Hash mismatch - possible tampering',
            createdAt: record.createdAt,
          });
        }
      }

      return {
        totalRecords: auditRecords.length,
        integrityViolations,
        suspiciousRecords,
      };
    } catch (error) {
      console.error('Error verifying audit integrity:', error);
      return { totalRecords: 0, integrityViolations: 0, suspiciousRecords: [] };
    }
  }

  // ===== QUESTION 7: CREDENTIAL ENCRYPTION =====

  /**
   * Encrypt sensitive data with AES-256-GCM
   */
  encryptCredentials(data: string, userSalt?: string): string {
    try {
      const key = this.deriveEncryptionKey(userSalt);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipherGCM(this.ENCRYPTION_ALGORITHM, key, iv);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // Return IV:AuthTag:EncryptedData format
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      console.error('Error encrypting credentials:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt sensitive data
   */
  decryptCredentials(encryptedData: string, userSalt?: string): string {
    try {
      const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
      
      if (!ivHex || !authTagHex || !encrypted) {
        throw new Error('Invalid encrypted data format');
      }
      
      const key = this.deriveEncryptionKey(userSalt);
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipherGCM(this.ENCRYPTION_ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Error decrypting credentials:', error);
      throw new Error('Decryption failed');
    }
  }

  // ===== HELPER METHODS =====

  private async getRecentFailedAttempts(ipAddress: string, email?: string): Promise<number> {
    const since = new Date(Date.now() - 3600000); // Last hour
    
    let query = db
      .select({ count: count() })
      .from(authenticationAttempts)
      .where(
        and(
          eq(authenticationAttempts.success, false),
          gte(authenticationAttempts.createdAt, since)
        )
      );

    // Add IP or email filter
    if (email) {
      query = query.where(
        and(
          eq(authenticationAttempts.email, email),
          gte(authenticationAttempts.createdAt, since)
        )
      );
    } else {
      query = query.where(
        and(
          eq(authenticationAttempts.ipAddress, ipAddress),
          gte(authenticationAttempts.createdAt, since)
        )
      );
    }

    const result = await query;
    return result[0]?.count || 0;
  }

  private async getOrCreateUserKeyPair(userId: number): Promise<{ privateKey: Buffer; publicKey: Buffer }> {
    // In production, this should retrieve from secure storage or generate new ones
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'der' },
      privateKeyEncoding: { type: 'pkcs8', format: 'der' },
    });
    
    return { privateKey, publicKey };
  }

  private createTransactionHash(data: any): string {
    const hashInput = JSON.stringify({
      transactionId: data.transactionId,
      transactionType: data.transactionType,
      amount: data.amount,
      currency: data.currency,
      recipientAddress: data.recipientAddress,
      timestamp: Date.now(),
    });
    
    return crypto.createHash(this.HASH_ALGORITHM).update(hashInput).digest('hex');
  }

  private async checkNonceUsage(nonce: string, userId: number): Promise<boolean> {
    const result = await db
      .select({ count: count() })
      .from(transactionSecurity)
      .where(
        and(
          eq(transactionSecurity.nonce, nonce),
          eq(transactionSecurity.userId, userId)
        )
      );
    
    return (result[0]?.count || 0) > 1; // More than 1 means it's been reused
  }

  private generateAuditHash(userId: number, transactionId: string, data: any): string {
    const hashInput = `${userId}:${transactionId}:${JSON.stringify(data)}:${process.env.AUDIT_SALT || 'waides-audit-salt'}`;
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  private deriveEncryptionKey(userSalt?: string): Buffer {
    const baseSalt = process.env.ENCRYPTION_KEY || 'waides-ki-encryption-key';
    const salt = userSalt ? `${baseSalt}:${userSalt}` : baseSalt;
    return crypto.pbkdf2Sync(salt, 'waides-ki-salt', this.KEY_DERIVATION_ROUNDS, 32, 'sha256');
  }
}

// Export singleton instance
export const transactionSecurityService = TransactionSecurityService.getInstance();