import { users, apiKeys, ethData, signals, type User, type InsertUser, type ApiKey, type InsertApiKey, type EthData, type InsertEthData, type Signal, type InsertSignal } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apiKeys: Map<string, ApiKey>;
  private ethDataList: EthData[];
  private signalsList: Signal[];
  private currentId: { users: number, apiKeys: number, ethData: number, signals: number };

  constructor() {
    this.users = new Map();
    this.apiKeys = new Map();
    this.ethDataList = [];
    this.signalsList = [];
    this.currentId = { users: 1, apiKeys: 1, ethData: 1, signals: 1 };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getApiKey(service: string): Promise<ApiKey | undefined> {
    return this.apiKeys.get(service);
  }

  async upsertApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const existing = this.apiKeys.get(insertApiKey.service);
    if (existing) {
      const updated = { ...existing, key: insertApiKey.key, createdAt: new Date() };
      this.apiKeys.set(insertApiKey.service, updated);
      return updated;
    } else {
      const id = this.currentId.apiKeys++;
      const apiKey: ApiKey = { 
        id, 
        ...insertApiKey, 
        createdAt: new Date() 
      };
      this.apiKeys.set(insertApiKey.service, apiKey);
      return apiKey;
    }
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values());
  }

  async getLatestEthData(): Promise<EthData | undefined> {
    return this.ethDataList[this.ethDataList.length - 1];
  }

  async createEthData(insertData: InsertEthData): Promise<EthData> {
    const id = this.currentId.ethData++;
    const data: EthData = { 
      id, 
      ...insertData, 
      timestamp: new Date() 
    };
    this.ethDataList.push(data);
    return data;
  }

  async getEthDataHistory(limit: number = 50): Promise<EthData[]> {
    return this.ethDataList.slice(-limit);
  }

  async getActiveSignal(): Promise<Signal | undefined> {
    return this.signalsList.find(signal => signal.isActive);
  }

  async createSignal(insertSignal: InsertSignal): Promise<Signal> {
    const id = this.currentId.signals++;
    const signal: Signal = { 
      id, 
      ...insertSignal, 
      timestamp: new Date() 
    };
    this.signalsList.push(signal);
    return signal;
  }

  async getSignalHistory(limit: number = 20): Promise<Signal[]> {
    return this.signalsList.slice(-limit).reverse();
  }

  async deactivateSignals(): Promise<void> {
    this.signalsList.forEach(signal => {
      signal.isActive = false;
    });
  }
}

export const storage = new MemStorage();
