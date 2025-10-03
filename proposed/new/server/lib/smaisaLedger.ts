import { db } from '@db';
import { eq, and, desc } from 'drizzle-orm';
import { 
  smaisaTransactions, 
  smaisaBalances, 
  smaisaConversionRates,
  InsertSmaisaTransaction,
  SmaisaTransaction,
  SmaisaBalance,
  SMAISA_TRANSACTION_TYPES,
  SUPPORTED_CURRENCIES
} from '../../shared/smaisika-schema';

export interface CreditSmaisaParams {
  userId: number;
  amount: string | number;
  description: string;
  type?: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: any;
}

export interface DebitSmaisaParams {
  userId: number;
  amount: string | number;
  description: string;
  type?: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: any;
}

export interface ConvertToSmaisaParams {
  userId: number;
  fromCurrency: string;
  fromAmount: string | number;
  description?: string;
  metadata?: any;
}

export interface ConvertFromSmaisaParams {
  userId: number;
  toCurrency: string;
  smaisaAmount: string | number;
  description?: string;
  metadata?: any;
}

export class SmaisaLedger {
  /**
   * Get or create user's Smaisa balance
   */
  async getOrCreateBalance(userId: number): Promise<SmaisaBalance> {
    const existing = await db
      .select()
      .from(smaisaBalances)
      .where(eq(smaisaBalances.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const newBalance = await db
      .insert(smaisaBalances)
      .values({
        userId,
        balance: '0',
        lockedBalance: '0',
        totalEarned: '0',
        totalSpent: '0'
      })
      .returning();

    return newBalance[0];
  }

  /**
   * Get user's current Smaisa balance
   */
  async getBalance(userId: number): Promise<string> {
    const balance = await this.getOrCreateBalance(userId);
    return balance.balance;
  }

  /**
   * Credit Smaisa to user account
   */
  async creditSmaisa(params: CreditSmaisaParams): Promise<SmaisaTransaction> {
    const { userId, amount, description, type, referenceId, referenceType, metadata } = params;

    return await db.transaction(async (tx) => {
      // Get current balance
      const balanceRecord = await this.getOrCreateBalance(userId);
      const currentBalance = parseFloat(balanceRecord.balance);
      const creditAmount = parseFloat(amount.toString());
      const newBalance = currentBalance + creditAmount;

      // Create transaction record
      const transaction = await tx
        .insert(smaisaTransactions)
        .values({
          userId,
          type: type || SMAISA_TRANSACTION_TYPES.CREDIT,
          amount: creditAmount.toString(),
          currency: SUPPORTED_CURRENCIES.SMAISA,
          balanceBefore: currentBalance.toString(),
          balanceAfter: newBalance.toString(),
          description,
          referenceId,
          referenceType,
          metadata,
          isReversed: false
        })
        .returning();

      // Update balance
      await tx
        .update(smaisaBalances)
        .set({
          balance: newBalance.toString(),
          totalEarned: (parseFloat(balanceRecord.totalEarned) + creditAmount).toString(),
          lastUpdated: new Date()
        })
        .where(eq(smaisaBalances.userId, userId));

      console.log(`✅ Credited ${creditAmount} SMAISA to user ${userId}. New balance: ${newBalance}`);

      return transaction[0];
    });
  }

  /**
   * Debit Smaisa from user account
   */
  async debitSmaisa(params: DebitSmaisaParams): Promise<SmaisaTransaction> {
    const { userId, amount, description, type, referenceId, referenceType, metadata } = params;

    return await db.transaction(async (tx) => {
      // Get current balance
      const balanceRecord = await this.getOrCreateBalance(userId);
      const currentBalance = parseFloat(balanceRecord.balance);
      const debitAmount = parseFloat(amount.toString());

      // Check sufficient balance
      if (currentBalance < debitAmount) {
        throw new Error(`Insufficient Smaisa balance. Available: ${currentBalance}, Required: ${debitAmount}`);
      }

      const newBalance = currentBalance - debitAmount;

      // Create transaction record
      const transaction = await tx
        .insert(smaisaTransactions)
        .values({
          userId,
          type: type || SMAISA_TRANSACTION_TYPES.DEBIT,
          amount: debitAmount.toString(),
          currency: SUPPORTED_CURRENCIES.SMAISA,
          balanceBefore: currentBalance.toString(),
          balanceAfter: newBalance.toString(),
          description,
          referenceId,
          referenceType,
          metadata,
          isReversed: false
        })
        .returning();

      // Update balance
      await tx
        .update(smaisaBalances)
        .set({
          balance: newBalance.toString(),
          totalSpent: (parseFloat(balanceRecord.totalSpent) + debitAmount).toString(),
          lastUpdated: new Date()
        })
        .where(eq(smaisaBalances.userId, userId));

      console.log(`✅ Debited ${debitAmount} SMAISA from user ${userId}. New balance: ${newBalance}`);

      return transaction[0];
    });
  }

  /**
   * Convert cryptocurrency to Smaisa
   */
  async convertToSmaisa(params: ConvertToSmaisaParams): Promise<SmaisaTransaction> {
    const { userId, fromCurrency, fromAmount, description, metadata } = params;

    // Get conversion rate
    const rate = await this.getConversionRate(fromCurrency, SUPPORTED_CURRENCIES.SMAISA);
    const cryptoAmount = parseFloat(fromAmount.toString());
    const smaisaAmount = cryptoAmount * parseFloat(rate.rate);

    // Credit Smaisa
    return await this.creditSmaisa({
      userId,
      amount: smaisaAmount,
      description: description || `Converted ${cryptoAmount} ${fromCurrency} to ${smaisaAmount} SMAISA`,
      type: SMAISA_TRANSACTION_TYPES.CONVERT_TO,
      referenceType: 'conversion',
      metadata: {
        ...metadata,
        fromCurrency,
        fromAmount: cryptoAmount,
        conversionRate: rate.rate,
        rateId: rate.id
      }
    });
  }

  /**
   * Convert Smaisa to cryptocurrency
   */
  async convertFromSmaisa(params: ConvertFromSmaisaParams): Promise<{ transaction: SmaisaTransaction; cryptoAmount: number }> {
    const { userId, toCurrency, smaisaAmount, description, metadata } = params;

    // Get conversion rate
    const rate = await this.getConversionRate(SUPPORTED_CURRENCIES.SMAISA, toCurrency);
    const smaisaAmountNum = parseFloat(smaisaAmount.toString());
    const cryptoAmount = smaisaAmountNum * parseFloat(rate.rate);

    // Debit Smaisa
    const transaction = await this.debitSmaisa({
      userId,
      amount: smaisaAmountNum,
      description: description || `Converted ${smaisaAmountNum} SMAISA to ${cryptoAmount} ${toCurrency}`,
      type: SMAISA_TRANSACTION_TYPES.CONVERT_FROM,
      referenceType: 'conversion',
      metadata: {
        ...metadata,
        toCurrency,
        toAmount: cryptoAmount,
        conversionRate: rate.rate,
        rateId: rate.id
      }
    });

    return { transaction, cryptoAmount };
  }

  /**
   * Get conversion rate between currencies
   */
  async getConversionRate(fromCurrency: string, toCurrency: string) {
    const rate = await db
      .select()
      .from(smaisaConversionRates)
      .where(
        and(
          eq(smaisaConversionRates.fromCurrency, fromCurrency),
          eq(smaisaConversionRates.toCurrency, toCurrency),
          eq(smaisaConversionRates.isActive, true)
        )
      )
      .orderBy(desc(smaisaConversionRates.effectiveAt))
      .limit(1);

    if (rate.length === 0) {
      throw new Error(`No conversion rate found for ${fromCurrency} to ${toCurrency}`);
    }

    return rate[0];
  }

  /**
   * Get user's transaction history
   */
  async getTransactionHistory(userId: number, limit: number = 50): Promise<SmaisaTransaction[]> {
    return await db
      .select()
      .from(smaisaTransactions)
      .where(eq(smaisaTransactions.userId, userId))
      .orderBy(desc(smaisaTransactions.createdAt))
      .limit(limit);
  }

  /**
   * Record trade profit (with automatic profit sharing)
   */
  async recordTradeProfit(params: {
    userId: number;
    grossProfit: number;
    profitShareRate: number; // e.g., 0.5 for 50%
    tradeId: string;
    metadata?: any;
  }): Promise<{ userTransaction: SmaisaTransaction; treasuryTransaction: SmaisaTransaction | null }> {
    const { userId, grossProfit, profitShareRate, tradeId, metadata } = params;

    const treasuryShare = grossProfit * profitShareRate;
    const userShare = grossProfit - treasuryShare;

    // Credit user's share
    const userTransaction = await this.creditSmaisa({
      userId,
      amount: userShare,
      description: `Trade profit (${(1 - profitShareRate) * 100}% share)`,
      type: SMAISA_TRANSACTION_TYPES.TRADE_PROFIT,
      referenceId: tradeId,
      referenceType: 'trade',
      metadata: {
        ...metadata,
        grossProfit,
        profitShareRate,
        treasuryShare,
        userShare
      }
    });

    // Credit treasury share (userId: 1 for admin/treasury)
    let treasuryTransaction = null;
    if (treasuryShare > 0) {
      treasuryTransaction = await this.creditSmaisa({
        userId: 1, // Treasury user ID
        amount: treasuryShare,
        description: `Profit share from user ${userId} trade`,
        type: SMAISA_TRANSACTION_TYPES.PROFIT_SHARE,
        referenceId: tradeId,
        referenceType: 'trade',
        metadata: {
          ...metadata,
          sourceUserId: userId,
          grossProfit,
          profitShareRate,
          treasuryShare
        }
      });
    }

    console.log(`✅ Trade profit recorded: User ${userId} gets ${userShare}, Treasury gets ${treasuryShare}`);

    return { userTransaction, treasuryTransaction };
  }

  /**
   * Record trade loss
   */
  async recordTradeLoss(params: {
    userId: number;
    lossAmount: number;
    tradeId: string;
    metadata?: any;
  }): Promise<SmaisaTransaction> {
    const { userId, lossAmount, tradeId, metadata } = params;

    return await this.debitSmaisa({
      userId,
      amount: lossAmount,
      description: `Trade loss`,
      type: SMAISA_TRANSACTION_TYPES.TRADE_LOSS,
      referenceId: tradeId,
      referenceType: 'trade',
      metadata
    });
  }

  /**
   * Audit: Verify balance integrity
   */
  async verifyBalanceIntegrity(userId: number): Promise<{
    isValid: boolean;
    expectedBalance: number;
    actualBalance: number;
    discrepancy: number;
  }> {
    const transactions = await db
      .select()
      .from(smaisaTransactions)
      .where(eq(smaisaTransactions.userId, userId))
      .orderBy(smaisaTransactions.createdAt);

    let calculatedBalance = 0;
    
    for (const tx of transactions) {
      const amount = parseFloat(tx.amount);
      if (tx.type === SMAISA_TRANSACTION_TYPES.CREDIT || 
          tx.type === SMAISA_TRANSACTION_TYPES.CONVERT_TO ||
          tx.type === SMAISA_TRANSACTION_TYPES.TRADE_PROFIT ||
          tx.type === SMAISA_TRANSACTION_TYPES.PROFIT_SHARE ||
          tx.type === SMAISA_TRANSACTION_TYPES.MINING ||
          tx.type === SMAISA_TRANSACTION_TYPES.REFERRAL_BONUS ||
          tx.type === SMAISA_TRANSACTION_TYPES.ACHIEVEMENT_REWARD) {
        calculatedBalance += amount;
      } else {
        calculatedBalance -= amount;
      }
    }

    const balanceRecord = await this.getOrCreateBalance(userId);
    const actualBalance = parseFloat(balanceRecord.balance);
    const discrepancy = Math.abs(calculatedBalance - actualBalance);

    return {
      isValid: discrepancy < 0.00000001, // Allow for floating point precision
      expectedBalance: calculatedBalance,
      actualBalance,
      discrepancy
    };
  }
}

// Export singleton instance
export const smaisaLedger = new SmaisaLedger();
