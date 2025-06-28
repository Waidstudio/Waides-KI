import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { users, apiKeys, ethData, signals, candlesticks, type User, type InsertUser, type ApiKey, type InsertApiKey, type EthData, type InsertEthData, type Signal, type InsertSignal, type Candlestick, type InsertCandlestick } from "@shared/schema";

// Export db for use in other services
export { db };

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export const storage = new DatabaseStorage();