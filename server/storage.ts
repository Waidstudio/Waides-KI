import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { users, apiKeys, ethData, signals, candlesticks, type User, type InsertUser, type ApiKey, type InsertApiKey, type EthData, type InsertEthData, type Signal, type InsertSignal, type Candlestick, type InsertCandlestick } from "@shared/schema";

// Export db for use in other services
export { db };

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  getApiKey(service: string): Promise<ApiKey | undefined>;
  upsertApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  getAllApiKeys(): Promise<ApiKey[]>;
  
  getLatestEthData(): Promise<EthData | undefined>;
  createEthData(data: InsertEthData): Promise<EthData>;
  getEthDataHistory(limit?: number): Promise<EthData[]>;
  
  getActiveSignal(): Promise<Signal | undefined>;
  createSignal(signal: InsertSignal): Promise<Signal>;
  getSignalHistory(limit?: number): Promise<Signal[]>;
  deactivateSignals(): Promise<void>;
  
  createCandlestick(candlestick: InsertCandlestick): Promise<Candlestick>;
  getCandlestickHistory(symbol: string, interval: string, limit?: number): Promise<Candlestick[]>;
  getLatestCandlestick(symbol: string, interval: string): Promise<Candlestick | undefined>;

  // Wallet methods
  createDeposit(deposit: any): Promise<any>;
  updateDepositStatus(id: string, status: string): Promise<void>;
  addToUserBalance(userId: string, amount: number, currency: string): Promise<void>;
  deductFromUserBalance(userId: string, amount: number, currency: string): Promise<void>;
  getUserBalance(userId: string, currency: string): Promise<number>;
  addToSmaiSikaBalance(userId: string, amount: number): Promise<void>;
  getSmaiSikaBalance(userId: string): Promise<number>;
  createConversion(conversion: any): Promise<any>;
  getUserTransactions(userId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getApiKey(service: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.service, service));
    return apiKey || undefined;
  }

  async upsertApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const existing = await this.getApiKey(insertApiKey.service);
    if (existing) {
      const [updated] = await db
        .update(apiKeys)
        .set(insertApiKey)
        .where(eq(apiKeys.service, insertApiKey.service))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(apiKeys)
        .values(insertApiKey)
        .returning();
      return created;
    }
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    return await db.select().from(apiKeys);
  }

  async getLatestEthData(): Promise<EthData | undefined> {
    const [latest] = await db.select().from(ethData).orderBy(desc(ethData.timestamp));
    return latest || undefined;
  }

  async createEthData(insertData: InsertEthData): Promise<EthData> {
    const [data] = await db
      .insert(ethData)
      .values(insertData)
      .returning();
    return data;
  }

  async getEthDataHistory(limit: number = 50): Promise<EthData[]> {
    return await db.select().from(ethData).orderBy(desc(ethData.timestamp)).limit(limit);
  }

  async getActiveSignal(): Promise<Signal | undefined> {
    const [signal] = await db.select().from(signals).where(eq(signals.isActive, true)).orderBy(desc(signals.timestamp));
    return signal || undefined;
  }

  async createSignal(insertSignal: InsertSignal): Promise<Signal> {
    const [signal] = await db
      .insert(signals)
      .values(insertSignal)
      .returning();
    return signal;
  }

  async getSignalHistory(limit: number = 20): Promise<Signal[]> {
    return await db.select().from(signals).orderBy(desc(signals.timestamp)).limit(limit);
  }

  async deactivateSignals(): Promise<void> {
    await db.update(signals).set({ isActive: false }).where(eq(signals.isActive, true));
  }

  async createCandlestick(insertCandlestick: InsertCandlestick): Promise<Candlestick> {
    const [candlestick] = await db
      .insert(candlesticks)
      .values(insertCandlestick)
      .returning();
    return candlestick;
  }

  async getCandlestickHistory(symbol: string, interval: string, limit: number = 100): Promise<Candlestick[]> {
    return await db
      .select()
      .from(candlesticks)
      .where(and(eq(candlesticks.symbol, symbol), eq(candlesticks.interval, interval)))
      .orderBy(desc(candlesticks.openTime))
      .limit(limit);
  }

  async getLatestCandlestick(symbol: string, interval: string): Promise<Candlestick | undefined> {
    const [candlestick] = await db
      .select()
      .from(candlesticks)
      .where(and(eq(candlesticks.symbol, symbol), eq(candlesticks.interval, interval)))
      .orderBy(desc(candlesticks.openTime))
      .limit(1);
    return candlestick || undefined;
  }

  // In-memory wallet storage for real payment gateway integration
  private walletData: Map<string, any> = new Map();

  async createDeposit(deposit: any): Promise<any> {
    const deposits = this.walletData.get('deposits') || [];
    deposits.push({
      ...deposit,
      createdAt: new Date()
    });
    this.walletData.set('deposits', deposits);
    console.log(`💾 Deposit created: ${deposit.id} - ${deposit.amount} ${deposit.currency}`);
    return deposit;
  }

  async updateDepositStatus(id: string, status: string): Promise<void> {
    const deposits = this.walletData.get('deposits') || [];
    const depositIndex = deposits.findIndex((d: any) => d.id === id);
    if (depositIndex !== -1) {
      deposits[depositIndex].status = status;
      deposits[depositIndex].updatedAt = new Date();
      this.walletData.set('deposits', deposits);
      console.log(`💾 Deposit status updated: ${id} → ${status}`);
    }
  }

  async addToUserBalance(userId: string, amount: number, currency: string): Promise<void> {
    const balances = this.walletData.get('balances') || {};
    const userKey = `${userId}_${currency}`;
    const currentBalance = balances[userKey] || 0;
    balances[userKey] = currentBalance + amount;
    this.walletData.set('balances', balances);
    
    // Record transaction
    const transactions = this.walletData.get('transactions') || [];
    transactions.push({
      id: `tx_${Date.now()}`,
      userId,
      type: 'deposit',
      amount,
      currency,
      status: 'completed',
      timestamp: new Date(),
      description: `Deposit of ${amount} ${currency}`
    });
    this.walletData.set('transactions', transactions);
    
    console.log(`💰 Balance added: ${userId} +${amount} ${currency} (Total: ${balances[userKey]})`);
  }

  async deductFromUserBalance(userId: string, amount: number, currency: string): Promise<void> {
    const balances = this.walletData.get('balances') || {};
    const userKey = `${userId}_${currency}`;
    const currentBalance = balances[userKey] || 0;
    
    if (currentBalance < amount) {
      throw new Error(`Insufficient ${currency} balance`);
    }
    
    balances[userKey] = currentBalance - amount;
    this.walletData.set('balances', balances);
    
    // Record transaction
    const transactions = this.walletData.get('transactions') || [];
    transactions.push({
      id: `tx_${Date.now()}`,
      userId,
      type: 'withdrawal',
      amount: -amount,
      currency,
      status: 'completed',
      timestamp: new Date(),
      description: `Withdrawal of ${amount} ${currency}`
    });
    this.walletData.set('transactions', transactions);
    
    console.log(`💸 Balance deducted: ${userId} -${amount} ${currency} (Remaining: ${balances[userKey]})`);
  }

  async getUserBalance(userId: string, currency: string): Promise<number> {
    const balances = this.walletData.get('balances') || {};
    const userKey = `${userId}_${currency}`;
    return balances[userKey] || 0;
  }

  async addToSmaiSikaBalance(userId: string, amount: number): Promise<void> {
    const smaiBalances = this.walletData.get('smaiBalances') || {};
    const currentBalance = smaiBalances[userId] || 0;
    smaiBalances[userId] = currentBalance + amount;
    this.walletData.set('smaiBalances', smaiBalances);
    
    // Record transaction
    const transactions = this.walletData.get('transactions') || [];
    transactions.push({
      id: `tx_${Date.now()}`,
      userId,
      type: 'conversion',
      amount,
      currency: 'SS',
      status: 'completed',
      timestamp: new Date(),
      description: `Converted to ${amount.toFixed(4)} SmaiSika`
    });
    this.walletData.set('transactions', transactions);
    
    console.log(`🪙 SmaiSika added: ${userId} +${amount.toFixed(4)} SS (Total: ${smaiBalances[userId].toFixed(4)} SS)`);
  }

  async getSmaiSikaBalance(userId: string): Promise<number> {
    const smaiBalances = this.walletData.get('smaiBalances') || {};
    return smaiBalances[userId] || 0;
  }

  async addWalletTransaction(transaction: any): Promise<void> {
    const transactions = this.walletData.get('transactions') || [];
    transactions.push({
      ...transaction,
      timestamp: transaction.timestamp || new Date().toISOString()
    });
    this.walletData.set('transactions', transactions);
    console.log(`📝 Transaction recorded: ${transaction.id} - ${transaction.description}`);
  }

  async createConversion(conversion: any): Promise<any> {
    const conversions = this.walletData.get('conversions') || [];
    conversions.push({
      ...conversion,
      createdAt: new Date()
    });
    this.walletData.set('conversions', conversions);
    console.log(`🔄 Conversion created: ${conversion.id} - ${conversion.fromAmount} ${conversion.fromCurrency} → ${conversion.toAmount} ${conversion.toCurrency}`);
    return conversion;
  }

  async getUserTransactions(userId: string): Promise<any[]> {
    const transactions = this.walletData.get('transactions') || [];
    return transactions
      .filter((tx: any) => tx.userId === userId)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50); // Last 50 transactions
  }
}

export const storage = new DatabaseStorage();