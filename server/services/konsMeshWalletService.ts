/**
 * KonsMesh Wallet Service - Single Source of Truth for All Wallet Operations
 * Provides atomic transactions, real-time synchronization, and secure bot funding
 */

import { db } from '../storage';
import { wallets, walletLedger, konsMeshConversionHistory, botFunding } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { KonsAiMeshControlCenter } from './konsaiMeshControlCenter';
import crypto from 'crypto';

export interface WalletSnapshot {
  id: number;
  userId: number;
  accountType: 'demo' | 'real';
  usdBalance: string;
  smaiSikaBalance: string;
  conversionRate: string;
  lastUpdated: Date;
}

export interface ConversionRequest {
  userId: number;
  usdAmount: number;
  rate: number;
  requestId: string;
}

export interface BotFundingRequest {
  userId: number;
  botId: string;
  smaiSikaAmount: number;
  requestId: string;
}

export interface WalletUpdatedEvent {
  type: 'wallet.updated';
  wallet: WalletSnapshot;
}

export interface ConversionCompletedEvent {
  type: 'conversion.completed';
  conversion: any;
  wallet: WalletSnapshot;
}

export interface BotFundedEvent {
  type: 'bot.funded';
  botId: string;
  fundingRecord: any;
  wallet: WalletSnapshot;
}

export interface AccountModeChangedEvent {
  type: 'account.mode.changed';
  wallet: WalletSnapshot;
  previousMode: 'demo' | 'real';
}

export class KonsMeshWalletService {
  private static instance: KonsMeshWalletService;
  private meshControlCenter: KonsAiMeshControlCenter;
  private operationCache: Map<string, any> = new Map();

  constructor() {
    this.meshControlCenter = new KonsAiMeshControlCenter();
  }

  public static getInstance(): KonsMeshWalletService {
    if (!KonsMeshWalletService.instance) {
      KonsMeshWalletService.instance = new KonsMeshWalletService();
    }
    return KonsMeshWalletService.instance;
  }

  /**
   * Get wallet data for user - canonical source of truth
   */
  async getWallet(userId: number): Promise<{ success: boolean; wallet?: WalletSnapshot; error?: string }> {
    try {
      const walletResult = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, userId))
        .limit(1);

      if (walletResult.length === 0) {
        // Create default demo wallet
        const newWallet = await this.createDefaultWallet(userId);
        if (!newWallet.success) {
          return { success: false, error: 'Failed to create wallet' };
        }
        return { success: true, wallet: newWallet.wallet };
      }

      const wallet = walletResult[0];
      const snapshot: WalletSnapshot = {
        id: wallet.id,
        userId: wallet.userId,
        accountType: (wallet.accountType as 'demo' | 'real') || 'demo',
        usdBalance: wallet.usdBalance || '10000.00',
        smaiSikaBalance: wallet.smaiBalance || '0.00',
        conversionRate: wallet.smaiConversionRate || '1.000000',
        lastUpdated: wallet.updatedAt || new Date()
      };

      return { success: true, wallet: snapshot };
    } catch (error) {
      console.error('❌ KonsMesh Wallet Error - getWallet:', error);
      return { success: false, error: 'Database error' };
    }
  }

  /**
   * Create default demo wallet for new users
   */
  private async createDefaultWallet(userId: number): Promise<{ success: boolean; wallet?: WalletSnapshot; error?: string }> {
    try {
      const txId = this.generateTxId();
      
      const newWalletResult = await db
        .insert(wallets)
        .values({
          userId,
          accountType: 'demo',
          usdBalance: '10000.00000000',
          smaiBalance: '0.00000000',
          smaiConversionRate: '1.000000'
        })
        .returning();

      const wallet = newWalletResult[0];

      // Record initial ledger entry
      await db.insert(walletLedger).values({
        walletId: wallet.id,
        changeUsd: '10000.00000000',
        changeSmaisika: '0.00000000',
        reason: 'Initial demo wallet creation',
        meta: { source: 'KonsMeshWalletService', userId },
        txId
      });

      const snapshot: WalletSnapshot = {
        id: wallet.id,
        userId: wallet.userId,
        accountType: 'demo',
        usdBalance: '10000.00000000',
        smaiSikaBalance: '0.00000000',
        conversionRate: '1.000000',
        lastUpdated: new Date()
      };

      // Broadcast wallet creation
      await this.broadcastWalletUpdate(snapshot);

      console.log(`💰 KonsMesh: Created demo wallet for user ${userId}`);
      return { success: true, wallet: snapshot };
    } catch (error) {
      console.error('❌ KonsMesh Wallet Error - createDefaultWallet:', error);
      return { success: false, error: 'Failed to create wallet' };
    }
  }

  /**
   * Atomic USD → SmaiSika conversion with database locking
   */
  async convertToSmaiSika(request: ConversionRequest): Promise<{ success: boolean; conversion?: any; wallet?: WalletSnapshot; error?: string }> {
    // Check for duplicate request
    if (this.operationCache.has(request.requestId)) {
      return this.operationCache.get(request.requestId);
    }

    try {
      return await db.transaction(async (tx) => {
        // Lock wallet for update
        const walletResult = await tx
          .select()
          .from(wallets)
          .where(eq(wallets.userId, request.userId))
          .for('update')
          .limit(1);

        if (walletResult.length === 0) {
          throw new Error('Wallet not found');
        }

        const wallet = walletResult[0];
        const currentUsdBalance = parseFloat(wallet.usdBalance || '0');
        
        // Validate sufficient balance
        if (currentUsdBalance < request.usdAmount) {
          throw new Error('Insufficient USD balance');
        }

        const smaiSikaAmount = request.usdAmount * request.rate;
        const newUsdBalance = currentUsdBalance - request.usdAmount;
        const newSmaiSikaBalance = parseFloat(wallet.smaiBalance || '0') + smaiSikaAmount;

        // Update wallet balances
        await tx
          .update(wallets)
          .set({
            usdBalance: newUsdBalance.toFixed(8),
            smaiBalance: newSmaiSikaBalance.toFixed(8),
            smaiConversionRate: request.rate.toFixed(6),
            lastConversionAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(wallets.id, wallet.id));

        const txId = this.generateTxId();

        // Record ledger entries
        await tx.insert(walletLedger).values({
          walletId: wallet.id,
          changeUsd: (-request.usdAmount).toFixed(8),
          changeSmaisika: smaiSikaAmount.toFixed(8),
          reason: 'USD to SmaiSika conversion',
          meta: { rate: request.rate, requestId: request.requestId },
          txId
        });

        // Record conversion history
        const conversionRecord = await tx.insert(konsMeshConversionHistory).values({
          walletId: wallet.id,
          usdAmount: request.usdAmount.toFixed(8),
          smaiSikaAmount: smaiSikaAmount.toFixed(8),
          rate: request.rate.toFixed(6),
          txId,
          performedBy: request.userId,
          requestId: request.requestId
        }).returning();

        const updatedWallet: WalletSnapshot = {
          id: wallet.id,
          userId: wallet.userId,
          accountType: (wallet.accountType as 'demo' | 'real') || 'demo',
          usdBalance: newUsdBalance.toFixed(8),
          smaiSikaBalance: newSmaiSikaBalance.toFixed(8),
          conversionRate: request.rate.toFixed(6),
          lastUpdated: new Date()
        };

        const result = {
          success: true,
          conversion: conversionRecord[0],
          wallet: updatedWallet
        };

        // Cache result for idempotency
        this.operationCache.set(request.requestId, result);
        
        // Broadcast conversion event
        await this.broadcastConversionCompleted(conversionRecord[0], updatedWallet);
        
        console.log(`💱 KonsMesh: Converted $${request.usdAmount} to ${smaiSikaAmount} SmaiSika for user ${request.userId}`);
        
        return result;
      });
    } catch (error) {
      console.error('❌ KonsMesh Conversion Error:', error);
      const errorResult = { success: false, error: error instanceof Error ? error.message : 'Conversion failed' };
      this.operationCache.set(request.requestId, errorResult);
      return errorResult;
    }
  }

  /**
   * Secure bot funding with SmaiSika balance
   */
  async fundBot(request: BotFundingRequest): Promise<{ success: boolean; funding?: any; wallet?: WalletSnapshot; error?: string }> {
    // Check for duplicate request
    if (this.operationCache.has(request.requestId)) {
      return this.operationCache.get(request.requestId);
    }

    try {
      return await db.transaction(async (tx) => {
        // Lock wallet for update
        const walletResult = await tx
          .select()
          .from(wallets)
          .where(eq(wallets.userId, request.userId))
          .for('update')
          .limit(1);

        if (walletResult.length === 0) {
          throw new Error('Wallet not found');
        }

        const wallet = walletResult[0];
        const currentSmaiSikaBalance = parseFloat(wallet.smaiBalance || '0');
        
        // Validate sufficient SmaiSika balance
        if (currentSmaiSikaBalance < request.smaiSikaAmount) {
          throw new Error('Insufficient SmaiSika balance');
        }

        const newSmaiSikaBalance = currentSmaiSikaBalance - request.smaiSikaAmount;

        // Update wallet balance
        await tx
          .update(wallets)
          .set({
            smaiBalance: newSmaiSikaBalance.toFixed(8),
            updatedAt: new Date()
          })
          .where(eq(wallets.id, wallet.id));

        const txId = this.generateTxId();

        // Record ledger entry
        await tx.insert(walletLedger).values({
          walletId: wallet.id,
          changeUsd: '0.00000000',
          changeSmaisika: (-request.smaiSikaAmount).toFixed(8),
          reason: `Bot funding for ${request.botId}`,
          meta: { botId: request.botId, requestId: request.requestId },
          txId
        });

        // Record bot funding
        const fundingRecord = await tx.insert(botFunding).values({
          walletId: wallet.id,
          botId: request.botId,
          smaiSikaAmount: request.smaiSikaAmount.toFixed(8),
          fundingType: 'allocation',
          txId,
          requestId: request.requestId
        }).returning();

        const updatedWallet: WalletSnapshot = {
          id: wallet.id,
          userId: wallet.userId,
          accountType: (wallet.accountType as 'demo' | 'real') || 'demo',
          usdBalance: wallet.usdBalance || '0.00',
          smaiSikaBalance: newSmaiSikaBalance.toFixed(8),
          conversionRate: wallet.smaiConversionRate || '1.000000',
          lastUpdated: new Date()
        };

        const result = {
          success: true,
          funding: fundingRecord[0],
          wallet: updatedWallet
        };

        // Cache result for idempotency
        this.operationCache.set(request.requestId, result);
        
        // Broadcast bot funded event
        await this.broadcastBotFunded(request.botId, fundingRecord[0], updatedWallet);
        
        console.log(`🤖 KonsMesh: Funded bot ${request.botId} with ${request.smaiSikaAmount} SmaiSika for user ${request.userId}`);
        
        return result;
      });
    } catch (error) {
      console.error('❌ KonsMesh Bot Funding Error:', error);
      const errorResult = { success: false, error: error instanceof Error ? error.message : 'Bot funding failed' };
      this.operationCache.set(request.requestId, errorResult);
      return errorResult;
    }
  }

  /**
   * Switch account mode between demo and real
   */
  async switchAccountMode(userId: number, targetMode: 'demo' | 'real', mfaToken?: string): Promise<{ success: boolean; wallet?: WalletSnapshot; error?: string }> {
    try {
      // TODO: Add MFA validation for real account switches
      if (targetMode === 'real' && !mfaToken) {
        return { success: false, error: 'MFA token required for real account access' };
      }

      const walletResult = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, userId))
        .limit(1);

      if (walletResult.length === 0) {
        return { success: false, error: 'Wallet not found' };
      }

      const wallet = walletResult[0];
      const previousMode = (wallet.accountType as 'demo' | 'real') || 'demo';

      if (previousMode === targetMode) {
        // No change needed
        const snapshot: WalletSnapshot = {
          id: wallet.id,
          userId: wallet.userId,
          accountType: targetMode,
          usdBalance: wallet.usdBalance || '0.00',
          smaiSikaBalance: wallet.smaiBalance || '0.00',
          conversionRate: wallet.smaiConversionRate || '1.000000',
          lastUpdated: new Date()
        };
        return { success: true, wallet: snapshot };
      }

      // Update account mode
      await db
        .update(wallets)
        .set({
          accountType: targetMode,
          updatedAt: new Date()
        })
        .where(eq(wallets.id, wallet.id));

      const txId = this.generateTxId();

      // Record ledger entry
      await db.insert(walletLedger).values({
        walletId: wallet.id,
        changeUsd: '0.00000000',
        changeSmaisika: '0.00000000',
        reason: `Account mode switched from ${previousMode} to ${targetMode}`,
        meta: { previousMode, targetMode, userId },
        txId
      });

      const updatedWallet: WalletSnapshot = {
        id: wallet.id,
        userId: wallet.userId,
        accountType: targetMode,
        usdBalance: wallet.usdBalance || '0.00',
        smaiSikaBalance: wallet.smaiBalance || '0.00',
        conversionRate: wallet.smaiConversionRate || '1.000000',
        lastUpdated: new Date()
      };

      // Broadcast account mode change
      await this.broadcastAccountModeChanged(updatedWallet, previousMode);

      console.log(`🔄 KonsMesh: Switched account mode for user ${userId} from ${previousMode} to ${targetMode}`);
      
      return { success: true, wallet: updatedWallet };
    } catch (error) {
      console.error('❌ KonsMesh Account Mode Switch Error:', error);
      return { success: false, error: 'Failed to switch account mode' };
    }
  }

  /**
   * Generate unique transaction ID
   */
  private generateTxId(): string {
    return `konsmesh_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Broadcast wallet update to all connected clients
   */
  private async broadcastWalletUpdate(wallet: WalletSnapshot): Promise<void> {
    try {
      const event: WalletUpdatedEvent = {
        type: 'wallet.updated',
        wallet
      };
      
      // Use KonsMesh to broadcast the event
      // Implementation will depend on existing WebSocket infrastructure
      console.log(`📡 KonsMesh: Broadcasting wallet update for user ${wallet.userId}`);
    } catch (error) {
      console.error('❌ KonsMesh Broadcast Error - wallet update:', error);
    }
  }

  /**
   * Broadcast conversion completed event
   */
  private async broadcastConversionCompleted(conversion: any, wallet: WalletSnapshot): Promise<void> {
    try {
      const event: ConversionCompletedEvent = {
        type: 'conversion.completed',
        conversion,
        wallet
      };
      
      console.log(`📡 KonsMesh: Broadcasting conversion completed for user ${wallet.userId}`);
    } catch (error) {
      console.error('❌ KonsMesh Broadcast Error - conversion:', error);
    }
  }

  /**
   * Broadcast bot funded event
   */
  private async broadcastBotFunded(botId: string, fundingRecord: any, wallet: WalletSnapshot): Promise<void> {
    try {
      const event: BotFundedEvent = {
        type: 'bot.funded',
        botId,
        fundingRecord,
        wallet
      };
      
      console.log(`📡 KonsMesh: Broadcasting bot funded ${botId} for user ${wallet.userId}`);
    } catch (error) {
      console.error('❌ KonsMesh Broadcast Error - bot funding:', error);
    }
  }

  /**
   * Broadcast account mode changed event
   */
  private async broadcastAccountModeChanged(wallet: WalletSnapshot, previousMode: 'demo' | 'real'): Promise<void> {
    try {
      const event: AccountModeChangedEvent = {
        type: 'account.mode.changed',
        wallet,
        previousMode
      };
      
      console.log(`📡 KonsMesh: Broadcasting account mode changed for user ${wallet.userId}`);
    } catch (error) {
      console.error('❌ KonsMesh Broadcast Error - account mode:', error);
    }
  }

  /**
   * Clear operation cache (for memory management)
   */
  public clearOperationCache(): void {
    this.operationCache.clear();
    console.log('🧹 KonsMesh: Operation cache cleared');
  }
}

export const konsMeshWalletService = KonsMeshWalletService.getInstance();