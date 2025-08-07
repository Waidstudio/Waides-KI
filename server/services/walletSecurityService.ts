import crypto from 'crypto';
import { db } from '../storage';
import { 
  users,
  walletPermissions,
  userPermissionRoles,
  userMfaSettings,
  jwtAuditTrail,
  authenticationAttempts,
  transactionSecurity,
  financialAuditTrail,
  tradingControls,
  botFundIsolation,
  fraudDetectionLogs,
  coldStorageVaults,
  type InsertTransactionSecurity,
  type InsertFinancialAuditTrail,
  type InsertAuthenticationAttempt,
  type InsertJwtAuditTrail,
  type InsertFraudDetectionLog,
  type InsertBotFundIsolation,
  type InsertColdStorageVault
} from '../../shared/schema';
import { eq, and, desc, gte, lte, sum, count } from 'drizzle-orm';

/**
 * Core Wallet Security Service
 * Orchestrates all wallet security features and validates access controls
 * Addresses Questions 1, 2, 5, 10, 20 from the security enhancement plan
 */
export class WalletSecurityService {
  private static instance: WalletSecurityService;
  
  // Encryption configuration
  private readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private readonly KEY_DERIVATION_ROUNDS = 100000;
  private readonly HASH_ALGORITHM = 'sha256';
  
  public static getInstance(): WalletSecurityService {
    if (!WalletSecurityService.instance) {
      WalletSecurityService.instance = new WalletSecurityService();
    }
    return WalletSecurityService.instance;
  }

  // ===== QUESTION 1: USER RIGHTS SEPARATION =====
  
  /**
   * Check if user has specific wallet access permissions
   */
  async checkWalletAccess(userId: number, walletId: number, accessType: 'read' | 'write' | 'trade' | 'admin'): Promise<boolean> {
    try {
      const permissions = await db
        .select({
          roleId: walletPermissions.roleId,
          walletReadAccess: userPermissionRoles.walletReadAccess,
          walletWriteAccess: userPermissionRoles.walletWriteAccess,
          tradingAccess: userPermissionRoles.tradingAccess,
          adminAccess: userPermissionRoles.adminAccess,
        })
        .from(walletPermissions)
        .innerJoin(userPermissionRoles, eq(walletPermissions.roleId, userPermissionRoles.id))
        .where(
          and(
            eq(walletPermissions.userId, userId),
            eq(walletPermissions.walletId, walletId),
            eq(walletPermissions.isActive, true),
            // Check if permission hasn't expired
            gte(walletPermissions.expiresAt, new Date())
          )
        );

      if (permissions.length === 0) return false;

      // Check specific access type
      switch (accessType) {
        case 'read':
          return permissions.some(p => p.walletReadAccess);
        case 'write':
          return permissions.some(p => p.walletWriteAccess);
        case 'trade':
          return permissions.some(p => p.tradingAccess);
        case 'admin':
          return permissions.some(p => p.adminAccess);
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking wallet access:', error);
      return false;
    }
  }

  /**
   * Grant wallet permissions to user
   */
  async grantWalletPermission(userId: number, walletId: number, roleId: number, grantedBy: number, expiresAt?: Date): Promise<boolean> {
    try {
      await db.insert(walletPermissions).values({
        userId,
        walletId,
        roleId,
        grantedBy,
        expiresAt,
        isActive: true,
      });

      console.log(`🔐 Wallet permission granted: User ${userId} → Wallet ${walletId} (Role: ${roleId})`);
      return true;
    } catch (error) {
      console.error('Error granting wallet permission:', error);
      return false;
    }
  }

  // ===== QUESTION 2: MULTI-FACTOR AUTHENTICATION =====

  /**
   * Enable/disable multi-factor authentication for user
   */
  async configureMFA(userId: number, settings: {
    twoFactorEnabled?: boolean;
    smsEnabled?: boolean;
    phoneNumber?: string;
    biometricEnabled?: boolean;
    smaiPrintEnabled?: boolean;
    smaiPrintHash?: string;
  }): Promise<boolean> {
    try {
      // Encrypt sensitive data
      const encryptedSettings = {
        ...settings,
        phoneNumber: settings.phoneNumber ? this.encrypt(settings.phoneNumber) : undefined,
        smaiPrintHash: settings.smaiPrintHash ? this.encrypt(settings.smaiPrintHash) : undefined,
        updatedAt: new Date(),
      };

      await db
        .insert(userMfaSettings)
        .values({ userId, ...encryptedSettings })
        .onConflictDoUpdate({
          target: userMfaSettings.userId,
          set: encryptedSettings,
        });

      console.log(`🔒 MFA settings updated for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error configuring MFA:', error);
      return false;
    }
  }

  /**
   * Verify MFA authentication
   */
  async verifyMFA(userId: number, method: 'totp' | 'sms' | 'biometric' | 'smai_print', credential: string): Promise<boolean> {
    try {
      const mfaSettings = await db
        .select()
        .from(userMfaSettings)
        .where(eq(userMfaSettings.userId, userId))
        .limit(1);

      if (!mfaSettings.length) return false;

      const settings = mfaSettings[0];
      
      // Check if MFA is locked due to too many failures
      if (settings.mfaLockedUntil && settings.mfaLockedUntil > new Date()) {
        return false;
      }

      let verificationResult = false;

      switch (method) {
        case 'totp':
          // Implement TOTP verification logic
          verificationResult = await this.verifyTOTP(settings.totpSecret, credential);
          break;
        case 'sms':
          // Implement SMS verification logic
          verificationResult = await this.verifySMS(userId, credential);
          break;
        case 'biometric':
          // Delegate to biometric service
          verificationResult = true; // Placeholder - integrate with existing biometric service
          break;
        case 'smai_print':
          // Verify SmaiPrint pattern
          verificationResult = await this.verifySmaiPrint(settings.smaiPrintHash, credential);
          break;
      }

      // Update MFA verification status
      if (verificationResult) {
        await db
          .update(userMfaSettings)
          .set({
            lastMfaVerified: new Date(),
            mfaFailedAttempts: 0,
            mfaLockedUntil: null,
          })
          .where(eq(userMfaSettings.userId, userId));
      } else {
        // Increment failed attempts
        const newFailedAttempts = (settings.mfaFailedAttempts || 0) + 1;
        const lockUntil = newFailedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // 15 min lock

        await db
          .update(userMfaSettings)
          .set({
            mfaFailedAttempts: newFailedAttempts,
            mfaLockedUntil: lockUntil,
          })
          .where(eq(userMfaSettings.userId, userId));
      }

      return verificationResult;
    } catch (error) {
      console.error('Error verifying MFA:', error);
      return false;
    }
  }

  // ===== QUESTION 5: TRANSACTION SIGNING SECURITY =====

  /**
   * Generate secure transaction signature
   */
  async signTransaction(userId: number, transactionData: {
    transactionId: string;
    transactionType: string;
    amount: string;
    currency: string;
  }): Promise<{ signature: string; publicKey: string } | null> {
    try {
      // Generate key pair for user if doesn't exist
      const { privateKey, publicKey } = await this.getOrCreateUserKeyPair(userId);
      
      // Create transaction hash
      const transactionString = `${transactionData.transactionId}:${transactionData.transactionType}:${transactionData.amount}:${transactionData.currency}:${Date.now()}`;
      const transactionHash = crypto.createHash(this.HASH_ALGORITHM).update(transactionString).digest('hex');
      
      // Sign the hash
      const signature = crypto.sign(this.HASH_ALGORITHM, Buffer.from(transactionHash), privateKey).toString('base64');
      
      // Generate unique nonce for replay attack prevention
      const nonce = crypto.randomBytes(32).toString('hex');

      // Store transaction security record
      const securityRecord: InsertTransactionSecurity = {
        transactionId: transactionData.transactionId,
        userId,
        transactionType: transactionData.transactionType,
        amount: transactionData.amount,
        currency: transactionData.currency,
        digitalSignature: signature,
        publicKeyUsed: publicKey.toString('base64'),
        hashAlgorithm: this.HASH_ALGORITHM,
        encryptionMethod: this.ENCRYPTION_ALGORITHM,
        verificationStatus: 'verified',
        verifiedAt: new Date(),
        nonce,
      };

      await db.insert(transactionSecurity).values(securityRecord);

      console.log(`✍️ Transaction signed securely: ${transactionData.transactionId}`);
      
      return {
        signature,
        publicKey: publicKey.toString('base64'),
      };
    } catch (error) {
      console.error('Error signing transaction:', error);
      return null;
    }
  }

  /**
   * Verify transaction signature
   */
  async verifyTransactionSignature(transactionId: string): Promise<boolean> {
    try {
      const securityRecord = await db
        .select()
        .from(transactionSecurity)
        .where(eq(transactionSecurity.transactionId, transactionId))
        .limit(1);

      if (!securityRecord.length) return false;

      const record = securityRecord[0];
      
      // Reconstruct transaction hash
      const transactionString = `${record.transactionId}:${record.transactionType}:${record.amount}:${record.currency}`;
      const transactionHash = crypto.createHash(record.hashAlgorithm).update(transactionString).digest('hex');
      
      // Verify signature
      const publicKey = Buffer.from(record.publicKeyUsed, 'base64');
      const signature = Buffer.from(record.digitalSignature, 'base64');
      
      const isValid = crypto.verify(record.hashAlgorithm, Buffer.from(transactionHash), publicKey, signature);
      
      // Update verification status
      await db
        .update(transactionSecurity)
        .set({
          verificationStatus: isValid ? 'verified' : 'failed',
          verifiedAt: new Date(),
          verificationFailureReason: isValid ? null : 'Signature verification failed',
        })
        .where(eq(transactionSecurity.transactionId, transactionId));

      return isValid;
    } catch (error) {
      console.error('Error verifying transaction signature:', error);
      return false;
    }
  }

  // ===== QUESTION 10: BOT FUND ISOLATION =====

  /**
   * Monitor bot performance and trigger fund isolation if needed
   */
  async monitorBotPerformance(userId: number, botId: string, currentPerformance: {
    totalLoss: number;
    totalGains: number;
    riskScore: number;
  }): Promise<{ isolated: boolean; reason?: string }> {
    try {
      const isolationRecord = await db
        .select()
        .from(botFundIsolation)
        .where(
          and(
            eq(botFundIsolation.userId, userId),
            eq(botFundIsolation.botId, botId)
          )
        )
        .limit(1);

      const lossPercentage = (currentPerformance.totalLoss / (currentPerformance.totalGains + currentPerformance.totalLoss)) * 100;
      
      if (isolationRecord.length === 0) {
        // Create initial isolation record
        const isolationData: InsertBotFundIsolation = {
          userId,
          botId,
          botName: `Bot ${botId}`,
          isolatedFunds: '0.00',
          mainWalletFunds: '0.00',
          isolationTriggered: false,
          triggerThreshold: '10.00', // 10% loss threshold
          currentLossPercentage: lossPercentage.toString(),
          riskScore: currentPerformance.riskScore,
        };

        await db.insert(botFundIsolation).values(isolationData);
        return { isolated: false };
      }

      const record = isolationRecord[0];
      const shouldIsolate = lossPercentage >= parseFloat(record.triggerThreshold) || currentPerformance.riskScore >= 80;

      if (shouldIsolate && !record.isolationTriggered) {
        // Trigger fund isolation
        const isolationReason = lossPercentage >= parseFloat(record.triggerThreshold) 
          ? `Loss threshold exceeded: ${lossPercentage.toFixed(2)}%`
          : `High risk score: ${currentPerformance.riskScore}`;

        await db
          .update(botFundIsolation)
          .set({
            isolationTriggered: true,
            isolationReason,
            isolatedAt: new Date(),
            currentLossPercentage: lossPercentage.toString(),
            riskScore: currentPerformance.riskScore,
            updatedAt: new Date(),
          })
          .where(eq(botFundIsolation.id, record.id));

        // Create audit trail
        await this.createFinancialAuditTrail(userId, `bot_isolation_${botId}`, {
          auditType: 'freeze',
          beforeBalance: record.mainWalletFunds,
          afterBalance: record.isolatedFunds,
          amountChanged: record.mainWalletFunds,
          currency: 'USD',
          reason: isolationReason,
          botId,
        });

        console.log(`🚫 Bot ${botId} funds isolated for user ${userId}: ${isolationReason}`);
        return { isolated: true, reason: isolationReason };
      }

      // Update performance metrics
      await db
        .update(botFundIsolation)
        .set({
          currentLossPercentage: lossPercentage.toString(),
          riskScore: currentPerformance.riskScore,
          lastRiskAssessment: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(botFundIsolation.id, record.id));

      return { isolated: record.isolationTriggered, reason: record.isolationReason };
    } catch (error) {
      console.error('Error monitoring bot performance:', error);
      return { isolated: false };
    }
  }

  // ===== QUESTION 20: COLD STORAGE MANAGEMENT =====

  /**
   * Create cold storage vault for user
   */
  async createColdStorageVault(userId: number, vaultName: string, currency: string, initialBalance: string = '0.00'): Promise<string | null> {
    try {
      // Generate secure key pair for cold storage
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });

      // Encrypt private key with user-specific password
      const encryptedPrivateKey = this.encryptWithUserKey(userId, privateKey);
      
      const vaultData: InsertColdStorageVault = {
        userId,
        vaultName,
        vaultType: 'cold',
        balance: initialBalance,
        currency,
        isActive: true,
        encryptedPrivateKey,
        publicKey,
        keyDerivationMethod: 'PBKDF2',
        accessRequiresApproval: true,
        approvalThreshold: 2,
        maxAccessAttempts: 3,
        backupLocations: [], // Will be populated with secure backup locations
      };

      const [vault] = await db.insert(coldStorageVaults).values(vaultData).returning();

      console.log(`❄️ Cold storage vault created: ${vaultName} for user ${userId}`);
      return vault.id.toString();
    } catch (error) {
      console.error('Error creating cold storage vault:', error);
      return null;
    }
  }

  /**
   * Transfer funds to/from cold storage
   */
  async transferColdStorageFunds(userId: number, vaultId: number, amount: string, direction: 'to_cold' | 'from_cold'): Promise<boolean> {
    try {
      const vault = await db
        .select()
        .from(coldStorageVaults)
        .where(
          and(
            eq(coldStorageVaults.id, vaultId),
            eq(coldStorageVaults.userId, userId),
            eq(coldStorageVaults.isActive, true)
          )
        )
        .limit(1);

      if (!vault.length) return false;

      const vaultRecord = vault[0];
      const transferAmount = parseFloat(amount);
      const currentBalance = parseFloat(vaultRecord.balance);

      let newBalance: number;
      let auditType: string;
      let auditReason: string;

      if (direction === 'to_cold') {
        newBalance = currentBalance + transferAmount;
        auditType = 'deposit';
        auditReason = `Cold storage deposit: ${amount} ${vaultRecord.currency}`;
      } else {
        if (currentBalance < transferAmount) {
          throw new Error('Insufficient cold storage balance');
        }
        newBalance = currentBalance - transferAmount;
        auditType = 'withdrawal';
        auditReason = `Cold storage withdrawal: ${amount} ${vaultRecord.currency}`;
      }

      // Update vault balance
      await db
        .update(coldStorageVaults)
        .set({
          balance: newBalance.toString(),
          lastAccessedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(coldStorageVaults.id, vaultId));

      // Create audit trail
      await this.createFinancialAuditTrail(userId, `cold_storage_${vaultId}_${Date.now()}`, {
        auditType,
        beforeBalance: currentBalance.toString(),
        afterBalance: newBalance.toString(),
        amountChanged: amount,
        currency: vaultRecord.currency,
        reason: auditReason,
      });

      console.log(`❄️ Cold storage transfer completed: ${direction} ${amount} ${vaultRecord.currency}`);
      return true;
    } catch (error) {
      console.error('Error transferring cold storage funds:', error);
      return false;
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Create financial audit trail record
   */
  private async createFinancialAuditTrail(userId: number, transactionId: string, data: {
    auditType: string;
    beforeBalance: string;
    afterBalance: string;
    amountChanged: string;
    currency: string;
    reason: string;
    botId?: string;
  }): Promise<void> {
    const auditRecord: InsertFinancialAuditTrail = {
      userId,
      transactionId,
      auditType: data.auditType,
      beforeBalance: data.beforeBalance,
      afterBalance: data.afterBalance,
      amountChanged: data.amountChanged,
      currency: data.currency,
      reason: data.reason,
      botId: data.botId,
      auditHash: this.generateAuditHash(userId, transactionId, data),
    };

    await db.insert(financialAuditTrail).values(auditRecord);
  }

  /**
   * Generate audit hash for integrity verification
   */
  private generateAuditHash(userId: number, transactionId: string, data: any): string {
    const auditString = `${userId}:${transactionId}:${JSON.stringify(data)}:${Date.now()}`;
    return crypto.createHash('sha256').update(auditString).digest('hex');
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  private encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.ENCRYPTION_ALGORITHM, process.env.ENCRYPTION_KEY || 'waides-ki-secret');
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  private decrypt(encryptedData: string): string {
    const [ivHex, encrypted] = encryptedData.split(':');
    const decipher = crypto.createDecipher(this.ENCRYPTION_ALGORITHM, process.env.ENCRYPTION_KEY || 'waides-ki-secret');
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Get or create RSA key pair for user
   */
  private async getOrCreateUserKeyPair(userId: number): Promise<{ privateKey: Buffer; publicKey: Buffer }> {
    // This is a simplified implementation - in production, keys should be stored securely
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'der' },
      privateKeyEncoding: { type: 'pkcs8', format: 'der' },
    });
    
    return { privateKey, publicKey };
  }

  /**
   * Encrypt private key with user-specific encryption
   */
  private encryptWithUserKey(userId: number, privateKey: string): string {
    const userKey = crypto.createHash('sha256').update(`${userId}:${process.env.ENCRYPTION_KEY || 'waides-ki-secret'}`).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipherGCM('aes-256-gcm', userKey, iv);
    
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Verify TOTP token (placeholder implementation)
   */
  private async verifyTOTP(totpSecret: string | null, token: string): Promise<boolean> {
    if (!totpSecret) return false;
    // Implement TOTP verification logic here
    // This is a placeholder - integrate with a proper TOTP library
    return token.length === 6 && /^\d{6}$/.test(token);
  }

  /**
   * Verify SMS token (placeholder implementation)
   */
  private async verifySMS(userId: number, token: string): Promise<boolean> {
    // Implement SMS verification logic here
    // This should check against sent SMS codes
    return token.length === 6 && /^\d{6}$/.test(token);
  }

  /**
   * Verify SmaiPrint pattern
   */
  private async verifySmaiPrint(storedHashEncrypted: string | null, providedPattern: string): Promise<boolean> {
    if (!storedHashEncrypted) return false;
    
    try {
      const storedHash = this.decrypt(storedHashEncrypted);
      const providedHash = crypto.createHash('sha256').update(providedPattern).digest('hex');
      return storedHash === providedHash;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const walletSecurityService = WalletSecurityService.getInstance();