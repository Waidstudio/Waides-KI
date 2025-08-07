import { db } from '../db';
import { adminExchangePool } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

export interface AdminExchangeCredentials {
  exchangeName: string;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  sandbox: boolean;
  maxUsersPerKey: number;
  isActive: boolean;
}

export interface ExchangeAssignment {
  userId: string;
  exchangeName: string;
  assignedCredentials: {
    apiKey: string;
    apiSecret: string;
    passphrase?: string;
    sandbox: boolean;
  };
  assignedAt: Date;
}

class AdminExchangePoolService {
  private encryptionKey = process.env.EXCHANGE_ENCRYPTION_KEY || 'default-fallback-key-change-in-production';

  // Encrypt sensitive data
  private encrypt(text: string): string {
    try {
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return text; // Fallback to plain text if encryption fails
    }
  }

  // Decrypt sensitive data
  private decrypt(encryptedText: string): string {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedText; // Return as-is if decryption fails
    }
  }

  // Add admin exchange credentials to pool
  async addExchangeCredentials(credentials: AdminExchangeCredentials) {
    try {
      const encryptedCredentials = {
        ...credentials,
        apiKey: this.encrypt(credentials.apiKey),
        apiSecret: this.encrypt(credentials.apiSecret),
        passphrase: credentials.passphrase ? this.encrypt(credentials.passphrase) : null,
      };

      const [newCredential] = await db
        .insert(adminExchangePool)
        .values(encryptedCredentials)
        .returning();

      return {
        success: true,
        credential: {
          ...newCredential,
          apiKey: '***ENCRYPTED***',
          apiSecret: '***ENCRYPTED***',
          passphrase: newCredential.passphrase ? '***ENCRYPTED***' : null,
        }
      };
    } catch (error) {
      console.error('Error adding exchange credentials:', error);
      return {
        success: false,
        message: 'Failed to add exchange credentials'
      };
    }
  }

  // Get available exchange credentials for assignment
  async getAvailableCredentials(exchangeName: string) {
    try {
      const credentials = await db
        .select()
        .from(adminExchangePool)
        .where(eq(adminExchangePool.exchangeName, exchangeName))
        .orderBy(desc(adminExchangePool.createdAt));

      return credentials.map(cred => ({
        ...cred,
        apiKey: this.decrypt(cred.apiKey),
        apiSecret: this.decrypt(cred.apiSecret),
        passphrase: cred.passphrase ? this.decrypt(cred.passphrase) : null,
      }));
    } catch (error) {
      console.error('Error getting available credentials:', error);
      return [];
    }
  }

  // Assign exchange credentials to user
  async assignCredentialsToUser(userId: string, exchangeName: string): Promise<ExchangeAssignment | null> {
    try {
      // Get available credentials for this exchange
      const availableCredentials = await this.getAvailableCredentials(exchangeName);
      
      if (availableCredentials.length === 0) {
        console.log(`No credentials available for exchange: ${exchangeName}`);
        return null;
      }

      // Find credentials with available slots
      const suitableCredentials = availableCredentials.find(cred => 
        cred.isActive && cred.currentUsers < cred.maxUsersPerKey
      );

      if (!suitableCredentials) {
        console.log(`No available slots for exchange: ${exchangeName}`);
        return null;
      }

      // Update usage count
      await db
        .update(adminExchangePool)
        .set({ 
          currentUsers: suitableCredentials.currentUsers + 1,
          updatedAt: new Date()
        })
        .where(eq(adminExchangePool.id, suitableCredentials.id));

      return {
        userId,
        exchangeName,
        assignedCredentials: {
          apiKey: suitableCredentials.apiKey,
          apiSecret: suitableCredentials.apiSecret,
          passphrase: suitableCredentials.passphrase,
          sandbox: suitableCredentials.sandbox,
        },
        assignedAt: new Date()
      };
    } catch (error) {
      console.error('Error assigning credentials to user:', error);
      return null;
    }
  }

  // Remove user assignment and free up slot
  async unassignUserCredentials(userId: string, exchangeName: string) {
    try {
      const credentials = await db
        .select()
        .from(adminExchangePool)
        .where(eq(adminExchangePool.exchangeName, exchangeName));

      // Find the credentials being used by this user and decrement count
      for (const cred of credentials) {
        if (cred.currentUsers > 0) {
          await db
            .update(adminExchangePool)
            .set({ 
              currentUsers: Math.max(0, cred.currentUsers - 1),
              updatedAt: new Date()
            })
            .where(eq(adminExchangePool.id, cred.id));
          break;
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error unassigning user credentials:', error);
      return { success: false };
    }
  }

  // Get all exchange credentials for admin management
  async getAllCredentials() {
    try {
      const credentials = await db
        .select()
        .from(adminExchangePool)
        .orderBy(desc(adminExchangePool.createdAt));

      return credentials.map(cred => ({
        ...cred,
        apiKey: '***ENCRYPTED***',
        apiSecret: '***ENCRYPTED***',
        passphrase: cred.passphrase ? '***ENCRYPTED***' : null,
      }));
    } catch (error) {
      console.error('Error getting all credentials:', error);
      return [];
    }
  }

  // Update exchange credentials
  async updateCredentials(id: number, updates: Partial<AdminExchangeCredentials>) {
    try {
      const encryptedUpdates = { ...updates };
      
      if (updates.apiKey) {
        encryptedUpdates.apiKey = this.encrypt(updates.apiKey);
      }
      if (updates.apiSecret) {
        encryptedUpdates.apiSecret = this.encrypt(updates.apiSecret);
      }
      if (updates.passphrase) {
        encryptedUpdates.passphrase = this.encrypt(updates.passphrase);
      }

      const [updated] = await db
        .update(adminExchangePool)
        .set({ ...encryptedUpdates, updatedAt: new Date() })
        .where(eq(adminExchangePool.id, id))
        .returning();

      return {
        success: true,
        credential: {
          ...updated,
          apiKey: '***ENCRYPTED***',
          apiSecret: '***ENCRYPTED***',
          passphrase: updated.passphrase ? '***ENCRYPTED***' : null,
        }
      };
    } catch (error) {
      console.error('Error updating credentials:', error);
      return {
        success: false,
        message: 'Failed to update credentials'
      };
    }
  }

  // Delete exchange credentials
  async deleteCredentials(id: number) {
    try {
      await db
        .delete(adminExchangePool)
        .where(eq(adminExchangePool.id, id));

      return { success: true };
    } catch (error) {
      console.error('Error deleting credentials:', error);
      return { success: false };
    }
  }

  // Get usage statistics
  async getUsageStats() {
    try {
      const allCredentials = await db.select().from(adminExchangePool);
      
      const stats = allCredentials.reduce((acc, cred) => {
        if (!acc[cred.exchangeName]) {
          acc[cred.exchangeName] = {
            totalCredentials: 0,
            activeCredentials: 0,
            totalSlots: 0,
            usedSlots: 0,
            availableSlots: 0
          };
        }
        
        acc[cred.exchangeName].totalCredentials++;
        if (cred.isActive) {
          acc[cred.exchangeName].activeCredentials++;
        }
        acc[cred.exchangeName].totalSlots += cred.maxUsersPerKey;
        acc[cred.exchangeName].usedSlots += cred.currentUsers;
        acc[cred.exchangeName].availableSlots += (cred.maxUsersPerKey - cred.currentUsers);
        
        return acc;
      }, {} as Record<string, any>);

      return stats;
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {};
    }
  }
}

export const adminExchangePoolService = new AdminExchangePoolService();