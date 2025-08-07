import crypto from 'crypto';
import { db } from '../../db';
import { eq, and } from 'drizzle-orm';

export interface EncryptedCredentials {
  apiKeyEncrypted: string;
  apiSecretEncrypted: string;
  passphraseEncrypted?: string;
}

export interface DecryptedCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
}

export interface APIKeyPermissions {
  canRead: boolean;
  canTrade: boolean;
  canWithdraw: boolean;
  canTransfer: boolean;
  ipRestrictions?: string[];
}

export class APIKeyManager {
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;

  private static getEncryptionKey(): Buffer {
    const key = process.env.API_KEY_ENCRYPTION_KEY;
    if (!key) {
      throw new Error('API_KEY_ENCRYPTION_KEY environment variable is required');
    }
    return crypto.scryptSync(key, 'waides-ki-salt', APIKeyManager.KEY_LENGTH);
  }

  public static encrypt(plaintext: string): string {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const cipher = crypto.createCipher(this.ENCRYPTION_ALGORITHM, key);
      cipher.setAAD(Buffer.from('waides-ki-aad'));

      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // Combine iv + authTag + encrypted data
      return iv.toString('hex') + authTag.toString('hex') + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt API key');
    }
  }

  public static decrypt(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey();
      
      // Extract components
      const iv = Buffer.from(encryptedData.slice(0, this.IV_LENGTH * 2), 'hex');
      const authTag = Buffer.from(encryptedData.slice(this.IV_LENGTH * 2, (this.IV_LENGTH + this.TAG_LENGTH) * 2), 'hex');
      const encrypted = encryptedData.slice((this.IV_LENGTH + this.TAG_LENGTH) * 2);
      
      const decipher = crypto.createDecipher(this.ENCRYPTION_ALGORITHM, key);
      decipher.setAAD(Buffer.from('waides-ki-aad'));
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt API key');
    }
  }

  public static async storeCredentials(
    userId: string,
    exchangeCode: string,
    credentials: DecryptedCredentials,
    permissions: APIKeyPermissions
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Validate that the credentials are trade-only
      if (permissions.canWithdraw) {
        return {
          success: false,
          error: 'Withdrawal permissions are not allowed for security reasons'
        };
      }

      // Encrypt the credentials
      const encrypted: EncryptedCredentials = {
        apiKeyEncrypted: this.encrypt(credentials.apiKey),
        apiSecretEncrypted: this.encrypt(credentials.apiSecret),
      };

      if (credentials.passphrase) {
        encrypted.passphraseEncrypted = this.encrypt(credentials.passphrase);
      }

      // Import at function level to avoid circular dependency
      const { exchangeConnections } = await import('../../../shared/schema');
      
      // Check if connection already exists
      const existing = await db
        .select()
        .from(exchangeConnections)
        .where(
          and(
            eq(exchangeConnections.userId, userId),
            eq(exchangeConnections.exchangeCode, exchangeCode)
          )
        );

      if (existing.length > 0) {
        // Update existing connection
        await db
          .update(exchangeConnections)
          .set({
            ...encrypted,
            permissions: permissions,
            lastVerified: new Date(),
            updatedAt: new Date(),
            isActive: true
          })
          .where(eq(exchangeConnections.id, existing[0].id));

        return { success: true, id: existing[0].id };
      } else {
        // Create new connection
        const result = await db
          .insert(exchangeConnections)
          .values({
            userId,
            exchangeCode,
            exchangeName: this.getExchangeName(exchangeCode),
            ...encrypted,
            permissions: permissions,
            lastVerified: new Date(),
            isActive: true
          })
          .returning();

        return { success: true, id: result[0].id };
      }
    } catch (error) {
      console.error('Error storing credentials:', error);
      return {
        success: false,
        error: 'Failed to store exchange credentials'
      };
    }
  }

  public static async getCredentials(
    userId: string,
    exchangeCode: string
  ): Promise<DecryptedCredentials | null> {
    try {
      // Import at function level to avoid circular dependency
      const { exchangeConnections } = await import('../../../shared/schema');
      
      const connection = await db
        .select()
        .from(exchangeConnections)
        .where(
          and(
            eq(exchangeConnections.userId, userId),
            eq(exchangeConnections.exchangeCode, exchangeCode),
            eq(exchangeConnections.isActive, true)
          )
        );

      if (connection.length === 0) {
        return null;
      }

      const conn = connection[0];
      const credentials: DecryptedCredentials = {
        apiKey: this.decrypt(conn.apiKeyEncrypted),
        apiSecret: this.decrypt(conn.apiSecretEncrypted),
      };

      if (conn.passphraseEncrypted) {
        credentials.passphrase = this.decrypt(conn.passphraseEncrypted);
      }

      return credentials;
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return null;
    }
  }

  public static async getUserExchanges(userId: string): Promise<Array<{
    id: string;
    exchangeCode: string;
    exchangeName: string;
    isActive: boolean;
    lastVerified: Date | null;
    permissions: APIKeyPermissions;
  }>> {
    try {
      // Import at function level to avoid circular dependency
      const { exchangeConnections } = await import('../../../shared/schema');
      
      const connections = await db
        .select({
          id: exchangeConnections.id,
          exchangeCode: exchangeConnections.exchangeCode,
          exchangeName: exchangeConnections.exchangeName,
          isActive: exchangeConnections.isActive,
          lastVerified: exchangeConnections.lastVerified,
          permissions: exchangeConnections.permissions
        })
        .from(exchangeConnections)
        .where(eq(exchangeConnections.userId, userId));

      return connections.map(conn => ({
        ...conn,
        permissions: conn.permissions as APIKeyPermissions
      }));
    } catch (error) {
      console.error('Error getting user exchanges:', error);
      return [];
    }
  }

  public static async verifyAPIKeyPermissions(
    exchangeCode: string,
    credentials: DecryptedCredentials
  ): Promise<{ valid: boolean; permissions: APIKeyPermissions; error?: string }> {
    try {
      // This would typically make API calls to the exchange to verify permissions
      // For now, we'll implement basic validation based on exchange requirements
      
      if (!credentials.apiKey || !credentials.apiSecret) {
        return {
          valid: false,
          permissions: { canRead: false, canTrade: false, canWithdraw: false, canTransfer: false },
          error: 'API key and secret are required'
        };
      }

      // Basic format validation (exchange-specific)
      const isValidFormat = this.validateAPIKeyFormat(exchangeCode, credentials.apiKey);
      if (!isValidFormat) {
        return {
          valid: false,
          permissions: { canRead: false, canTrade: false, canWithdraw: false, canTransfer: false },
          error: 'Invalid API key format for this exchange'
        };
      }

      // For production, implement actual API calls to verify permissions
      // For now, assume trade-only permissions
      const permissions: APIKeyPermissions = {
        canRead: true,
        canTrade: true,
        canWithdraw: false, // Always false for security
        canTransfer: false // Always false for security
      };

      return { valid: true, permissions };
    } catch (error) {
      console.error('Error verifying API key permissions:', error);
      return {
        valid: false,
        permissions: { canRead: false, canTrade: false, canWithdraw: false, canTransfer: false },
        error: 'Failed to verify API key permissions'
      };
    }
  }

  public static async revokeConnection(userId: string, exchangeCode: string): Promise<boolean> {
    try {
      // Import at function level to avoid circular dependency
      const { exchangeConnections } = await import('../../../shared/schema');
      
      await db
        .update(exchangeConnections)
        .set({ isActive: false, updatedAt: new Date() })
        .where(
          and(
            eq(exchangeConnections.userId, userId),
            eq(exchangeConnections.exchangeCode, exchangeCode)
          )
        );
      return true;
    } catch (error) {
      console.error('Error revoking connection:', error);
      return false;
    }
  }

  public static async deleteConnection(userId: string, exchangeCode: string): Promise<boolean> {
    try {
      // Import at function level to avoid circular dependency
      const { exchangeConnections } = await import('../../../shared/schema');
      
      await db
        .delete(exchangeConnections)
        .where(
          and(
            eq(exchangeConnections.userId, userId),
            eq(exchangeConnections.exchangeCode, exchangeCode)
          )
        );
      return true;
    } catch (error) {
      console.error('Error deleting connection:', error);
      return false;
    }
  }

  private static validateAPIKeyFormat(exchangeCode: string, apiKey: string): boolean {
    // Exchange-specific API key format validation
    switch (exchangeCode) {
      case 'BIN': // Binance
        return /^[a-zA-Z0-9]{64}$/.test(apiKey);
      case 'COI': // Coinbase
        return /^[a-f0-9]{32}$/.test(apiKey);
      case 'KRA': // Kraken
        return /^[a-zA-Z0-9+/]{56}$/.test(apiKey);
      case 'BYB': // Bybit
        return /^[a-zA-Z0-9]{20}$/.test(apiKey);
      case 'KUC': // KuCoin
        return /^[a-f0-9]{24}$/.test(apiKey);
      default:
        // Generic validation for other exchanges
        return apiKey.length >= 16 && apiKey.length <= 128;
    }
  }

  private static getExchangeName(exchangeCode: string): string {
    const exchanges: Record<string, string> = {
      'BIN': 'Binance',
      'COI': 'Coinbase',
      'KRA': 'Kraken',
      'BYB': 'Bybit',
      'KUC': 'KuCoin',
      'HUO': 'Huobi',
      'OKX': 'OKX',
      'BIT': 'Bitget',
      'GAT': 'Gate.io',
      'MEX': 'MEXC',
      'PHE': 'Phemex',
      'DER': 'Deribit'
    };
    return exchanges[exchangeCode] || exchangeCode;
  }
}