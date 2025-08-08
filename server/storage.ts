import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { users, apiKeys, ethData, signals, candlesticks, adminUsers, konsPowaPredictions, marketAnalyses, tradingStrategies, strategiesTradingHistory, waidesMemoryCore, strategySacredVault, spiritualRecall, timelineAwareness, konsSymbolTree, neuralEvolutionLogs, type User, type InsertUser, type ApiKey, type InsertApiKey, type EthData, type InsertEthData, type Signal, type InsertSignal, type Candlestick, type InsertCandlestick, type AdminUser, type InsertAdminUser, type KonsPowaPrediction, type InsertKonsPowaPrediction, type MarketAnalysis, type InsertMarketAnalysis, type TradingStrategy, type InsertTradingStrategy, type StrategyTradingHistory, type InsertStrategyTradingHistory, type WaidesMemoryCore, type InsertWaidesMemoryCore, type StrategySacredVault, type InsertStrategySacredVault, type SpiritualRecall, type InsertSpiritualRecall, type TimelineAwareness, type InsertTimelineAwareness, type KonsSymbolTree, type InsertKonsSymbolTree, type NeuralEvolutionLog, type InsertNeuralEvolutionLog } from "@shared/schema";

// Export db for use in other services
export { db };

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Admin user methods
  getAdminUser(id: number): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  getAllAdminUsers(): Promise<AdminUser[]>;
  
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
  getWalletBalance(userId: string): Promise<{ balance: number; currency: string; usdValue: number }>;
  addToSmaiSikaBalance(userId: string, amount: number): Promise<void>;
  getSmaiSikaBalance(userId: string): Promise<number>;
  createConversion(conversion: any): Promise<any>;
  getUserTransactions(userId: string): Promise<any[]>;

  // Kons Powa Predictions
  getActivePredictions(): Promise<KonsPowaPrediction[]>;
  createPrediction(prediction: InsertKonsPowaPrediction): Promise<KonsPowaPrediction>;
  getPredictionHistory(limit?: number): Promise<KonsPowaPrediction[]>;
  expirePredictions(): Promise<void>;

  // Market Analysis
  getLatestMarketAnalysis(): Promise<MarketAnalysis | undefined>;
  createMarketAnalysis(analysis: InsertMarketAnalysis): Promise<MarketAnalysis>;
  getMarketAnalysisHistory(limit?: number): Promise<MarketAnalysis[]>;

  // Trading Strategies
  getActiveStrategies(): Promise<TradingStrategy[]>;
  createStrategy(strategy: InsertTradingStrategy): Promise<TradingStrategy>;
  getStrategyById(id: number): Promise<TradingStrategy | undefined>;
  updateStrategy(id: number, updates: Partial<TradingStrategy>): Promise<TradingStrategy>;
  getStrategyHistory(strategyId: number, limit?: number): Promise<StrategyTradingHistory[]>;
  recordStrategyTrade(trade: InsertStrategyTradingHistory): Promise<StrategyTradingHistory>;

  // Advanced Memory System Methods
  createMemoryCore(memory: InsertWaidesMemoryCore): Promise<WaidesMemoryCore>;
  getMemoryByType(memoryType: string, userId?: number): Promise<WaidesMemoryCore[]>;
  getMemoryByTags(tags: string[], userId?: number): Promise<WaidesMemoryCore[]>;
  updateMemoryRecall(memoryId: number): Promise<void>;
  expireOldMemories(): Promise<void>;
  
  // Strategy Sacred Vault Methods  
  upsertStrategySacredVault(strategy: InsertStrategySacredVault): Promise<StrategySacredVault>;
  getStrategySacredVault(strategyId: string): Promise<StrategySacredVault | undefined>;
  getAllSacredStrategies(): Promise<StrategySacredVault[]>;
  markStrategyMistake(strategyId: string, isMistake: boolean): Promise<void>;
  updateStrategyPerformance(strategyId: string, tradeResult: any): Promise<void>;
  
  // Spiritual Recall Methods
  createSpiritualRecall(recall: InsertSpiritualRecall): Promise<SpiritualRecall>;
  getSpiritualRecallHistory(userId?: number, limit?: number): Promise<SpiritualRecall[]>;
  validateSpiritualRecall(recallId: number, isValid: boolean, outcome?: any): Promise<void>;
  
  // Timeline Awareness Methods
  createTimelinePattern(pattern: InsertTimelineAwareness): Promise<TimelineAwareness>;
  getActiveTimelinePatterns(userId?: number): Promise<TimelineAwareness[]>;
  matchTimelinePattern(currentContext: any): Promise<TimelineAwareness[]>;
  updatePatternSuccess(patternId: number, success: boolean): Promise<void>;
  
  // Kons Symbol Tree Methods
  upsertKonsSymbol(symbol: InsertKonsSymbolTree): Promise<KonsSymbolTree>;
  getKonsSymbol(symbolName: string): Promise<KonsSymbolTree | undefined>;
  updateSymbolUsage(symbolName: string, success: boolean): Promise<void>;
  getActiveSymbols(): Promise<KonsSymbolTree[]>;
  
  // Neural Evolution Methods
  logNeuralEvolution(evolution: InsertNeuralEvolutionLog): Promise<NeuralEvolutionLog>;
  getEvolutionHistory(limit?: number): Promise<NeuralEvolutionLog[]>;
  revertEvolution(evolutionId: number): Promise<void>;

  // ===== WALLET SECURITY ENHANCEMENT METHODS =====

  // User Permission Management (Question 1)
  createUserPermissionRole(role: InsertUserPermissionRole): Promise<UserPermissionRole>;
  grantWalletPermission(permission: InsertWalletPermission): Promise<WalletPermission>;
  revokeWalletPermission(userId: number, walletId: number): Promise<void>;
  checkWalletAccess(userId: number, walletId: number, accessType: 'read' | 'write' | 'trade' | 'admin'): Promise<boolean>;

  // Multi-Factor Authentication (Question 2)
  upsertUserMfaSettings(settings: InsertUserMfaSetting): Promise<UserMfaSetting>;
  getUserMfaSettings(userId: number): Promise<UserMfaSetting | undefined>;
  updateMfaFailedAttempts(userId: number, attempts: number, lockUntil?: Date): Promise<void>;

  // JWT Token Auditing (Question 3)
  logJwtAudit(audit: InsertJwtAuditTrail): Promise<JwtAuditTrail>;
  getJwtAuditHistory(userId: number, limit?: number): Promise<JwtAuditTrail[]>;
  revokeSuspiciousTokens(userId: number, reason: string): Promise<number>;

  // Authentication Monitoring (Question 4)
  logAuthenticationAttempt(attempt: InsertAuthenticationAttempt): Promise<AuthenticationAttempt>;
  getFailedAuthAttempts(ipAddress: string, timeRange: number): Promise<AuthenticationAttempt[]>;
  getAuthStatistics(timeRange: number): Promise<any>;

  // Transaction Security (Question 5)
  createTransactionSecurity(security: InsertTransactionSecurity): Promise<TransactionSecurity>;
  verifyTransactionSignature(transactionId: string): Promise<TransactionSecurity | undefined>;
  getTransactionSecurityHistory(userId: number, limit?: number): Promise<TransactionSecurity[]>;

  // Financial Audit Trail (Question 6)
  createFinancialAudit(audit: InsertFinancialAuditTrail): Promise<FinancialAuditTrail>;
  getFinancialAuditTrail(userId: number, auditType?: string, limit?: number): Promise<FinancialAuditTrail[]>;
  verifyAuditIntegrity(userId: number, timeRange: number): Promise<any>;

  // Trading Controls (Question 9)
  upsertTradingControls(controls: InsertTradingControl): Promise<TradingControl>;
  getUserTradingControls(userId: number): Promise<TradingControl | undefined>;
  freezeUserTrading(userId: number, reason: string, freezeBy: number): Promise<void>;
  unfreezeUserTrading(userId: number): Promise<void>;

  // Bot Fund Isolation (Question 10)
  upsertBotFundIsolation(isolation: InsertBotFundIsolation): Promise<BotFundIsolation>;
  getBotFundIsolation(userId: number, botId: string): Promise<BotFundIsolation | undefined>;
  triggerBotIsolation(userId: number, botId: string, reason: string): Promise<void>;

  // Fraud Detection (Question 12)
  logFraudDetection(log: InsertFraudDetectionLog): Promise<FraudDetectionLog>;
  getPendingFraudCases(): Promise<any[]>;
  resolveFraudCase(caseId: number, reviewedBy: number, outcome: string, actionTaken?: string): Promise<void>;

  // Cold Storage Management (Question 20)
  createColdStorageVault(vault: InsertColdStorageVault): Promise<ColdStorageVault>;
  getUserColdStorageVaults(userId: number): Promise<ColdStorageVault[]>;
  updateColdStorageBalance(vaultId: number, newBalance: string): Promise<void>;
  lockColdStorageVault(vaultId: number, reason: string): Promise<void>;
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

  // Admin user methods
  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user || undefined;
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return user || undefined;
  }

  async createAdminUser(insertUser: InsertAdminUser): Promise<AdminUser> {
    const [user] = await db
      .insert(adminUsers)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    return await db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));
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

  async getWalletBalance(userId: string): Promise<{ 
    localBalance: number; 
    localCurrency: string; 
    smaiBalance: number;
    totalUsdValue: number;
    hasConverted: boolean;
  }> {
    try {
      // Try database first
      const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, parseInt(userId)));
      
      if (wallet) {
        const localBalance = parseFloat(wallet.localBalance || '0');
        const smaiBalance = parseFloat(wallet.smaiBalance || '0');
        const conversionRate = parseFloat(wallet.smaiConversionRate || '1.0');
        
        return {
          localBalance,
          localCurrency: wallet.localCurrency || 'USD',
          smaiBalance,
          totalUsdValue: localBalance + (smaiBalance * conversionRate),
          hasConverted: smaiBalance > 0
        };
      }
    } catch (error) {
      console.log('Database wallet not found, using fallback storage');
    }
    
    // Fallback to in-memory storage
    const balances = this.walletData.get('balances') || {};
    const smaiBalances = this.walletData.get('smaiBalances') || {};
    
    // Get primary balance (default 10000 USD)
    const localBalance = balances[`${userId}_USD`] || 10000;
    const smaiBalance = smaiBalances[userId] || 0;
    
    return {
      localBalance,
      localCurrency: 'USD',
      smaiBalance,
      totalUsdValue: localBalance + smaiBalance,
      hasConverted: smaiBalance > 0
    };
  }

  async convertToSmaiSika(userId: string, amount: number, fromCurrency: string): Promise<{
    success: boolean;
    smaiAmount: number;
    transactionId: string;
    exchangeRate: number;
  }> {
    try {
      const transactionId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const exchangeRate = 1.0; // 1:1 conversion rate for all currencies to SS
      const smaiAmount = amount * exchangeRate;
      
      // Update database if available
      try {
        const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, parseInt(userId)));
        
        if (wallet) {
          // Update existing wallet
          await db.update(wallets)
            .set({
              localBalance: (parseFloat(wallet.localBalance || '0') - amount).toString(),
              smaiBalance: (parseFloat(wallet.smaiBalance || '0') + smaiAmount).toString(),
              lastConversionAt: new Date(),
              updatedAt: new Date()
            })
            .where(eq(wallets.userId, parseInt(userId)));
            
          // Record conversion history
          await db.insert(conversionHistory).values({
            userId: parseInt(userId),
            transactionId,
            fromCurrency,
            toCurrency: 'SS',
            fromAmount: amount.toString(),
            toAmount: smaiAmount.toString(),
            exchangeRate: exchangeRate.toString(),
            netAmount: smaiAmount.toString(),
            conversionType: 'manual'
          });
          
          return {
            success: true,
            smaiAmount,
            transactionId,
            exchangeRate
          };
        }
      } catch (error) {
        console.log('Database conversion failed, using fallback storage');
      }
      
      // Fallback to in-memory storage
      const balances = this.walletData.get('balances') || {};
      const smaiBalances = this.walletData.get('smaiBalances') || {};
      
      balances[`${userId}_${fromCurrency}`] = (balances[`${userId}_${fromCurrency}`] || 10000) - amount;
      smaiBalances[userId] = (smaiBalances[userId] || 0) + smaiAmount;
      
      this.walletData.set('balances', balances);
      this.walletData.set('smaiBalances', smaiBalances);
      
      return {
        success: true,
        smaiAmount,
        transactionId,
        exchangeRate
      };
    } catch (error) {
      return {
        success: false,
        smaiAmount: 0,
        transactionId: '',
        exchangeRate: 0
      };
    }
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

  // Kons Powa Predictions
  async getActivePredictions(): Promise<KonsPowaPrediction[]> {
    return await db.select().from(konsPowaPredictions).where(eq(konsPowaPredictions.isActive, true)).orderBy(desc(konsPowaPredictions.createdAt));
  }

  async createPrediction(insertPrediction: InsertKonsPowaPrediction): Promise<KonsPowaPrediction> {
    const [prediction] = await db
      .insert(konsPowaPredictions)
      .values(insertPrediction)
      .returning();
    return prediction;
  }

  async getPredictionHistory(limit: number = 50): Promise<KonsPowaPrediction[]> {
    return await db.select().from(konsPowaPredictions).orderBy(desc(konsPowaPredictions.createdAt)).limit(limit);
  }

  async expirePredictions(): Promise<void> {
    await db.update(konsPowaPredictions).set({ isActive: false }).where(eq(konsPowaPredictions.isActive, true));
  }

  // Market Analysis
  async getLatestMarketAnalysis(): Promise<MarketAnalysis | undefined> {
    const [analysis] = await db.select().from(marketAnalyses).orderBy(desc(marketAnalyses.createdAt));
    return analysis || undefined;
  }

  async createMarketAnalysis(insertAnalysis: InsertMarketAnalysis): Promise<MarketAnalysis> {
    const [analysis] = await db
      .insert(marketAnalyses)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async getMarketAnalysisHistory(limit: number = 50): Promise<MarketAnalysis[]> {
    return await db.select().from(marketAnalyses).orderBy(desc(marketAnalyses.createdAt)).limit(limit);
  }

  // Trading Strategies
  async getActiveStrategies(): Promise<TradingStrategy[]> {
    return await db.select().from(tradingStrategies).where(eq(tradingStrategies.isActive, true)).orderBy(desc(tradingStrategies.createdAt));
  }

  async createStrategy(insertStrategy: InsertTradingStrategy): Promise<TradingStrategy> {
    const [strategy] = await db
      .insert(tradingStrategies)
      .values(insertStrategy)
      .returning();
    return strategy;
  }

  async getStrategyById(id: number): Promise<TradingStrategy | undefined> {
    const [strategy] = await db.select().from(tradingStrategies).where(eq(tradingStrategies.id, id));
    return strategy || undefined;
  }

  async updateStrategy(id: number, updates: Partial<TradingStrategy>): Promise<TradingStrategy> {
    const [strategy] = await db
      .update(tradingStrategies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tradingStrategies.id, id))
      .returning();
    return strategy;
  }

  async getStrategyHistory(strategyId: number, limit: number = 50): Promise<StrategyTradingHistory[]> {
    return await db.select().from(strategiesTradingHistory).where(eq(strategiesTradingHistory.strategyId, strategyId)).orderBy(desc(strategiesTradingHistory.executedAt)).limit(limit);
  }

  async recordStrategyTrade(insertTrade: InsertStrategyTradingHistory): Promise<StrategyTradingHistory> {
    const [trade] = await db
      .insert(strategiesTradingHistory)
      .values(insertTrade)
      .returning();
    return trade;
  }

  // Advanced Memory System Implementation
  async createMemoryCore(memory: InsertWaidesMemoryCore): Promise<WaidesMemoryCore> {
    const [result] = await db.insert(waidesMemoryCore).values(memory).returning();
    return result;
  }

  async getMemoryByType(memoryType: string, userId?: number): Promise<WaidesMemoryCore[]> {
    let query = db.select().from(waidesMemoryCore).where(eq(waidesMemoryCore.memoryType, memoryType));
    if (userId) {
      query = query.where(eq(waidesMemoryCore.userId, userId));
    }
    return await query.orderBy(desc(waidesMemoryCore.createdAt));
  }

  async getMemoryByTags(tags: string[], userId?: number): Promise<WaidesMemoryCore[]> {
    const memories = await db.select().from(waidesMemoryCore).orderBy(desc(waidesMemoryCore.createdAt));
    return memories.filter(memory => {
      const memoryTags = Array.isArray(memory.tags) ? memory.tags : [];
      return tags.some(tag => memoryTags.includes(tag));
    });
  }

  async updateMemoryRecall(memoryId: number): Promise<void> {
    const [memory] = await db.select().from(waidesMemoryCore).where(eq(waidesMemoryCore.id, memoryId));
    if (memory) {
      await db.update(waidesMemoryCore)
        .set({ 
          recallFrequency: memory.recallFrequency + 1,
          lastRecalled: new Date() 
        })
        .where(eq(waidesMemoryCore.id, memoryId));
    }
  }

  async expireOldMemories(): Promise<void> {
    await db.delete(waidesMemoryCore)
      .where(and(
        eq(waidesMemoryCore.importance, 25)
      ));
  }

  // Strategy Sacred Vault Implementation
  async upsertStrategySacredVault(strategy: InsertStrategySacredVault): Promise<StrategySacredVault> {
    const existing = await this.getStrategySacredVault(strategy.strategyId);
    if (existing) {
      const [result] = await db.update(strategySacredVault)
        .set({
          ...strategy,
          updatedAt: new Date()
        })
        .where(eq(strategySacredVault.strategyId, strategy.strategyId))
        .returning();
      return result;
    } else {
      const [result] = await db.insert(strategySacredVault).values(strategy).returning();
      return result;
    }
  }

  async getStrategySacredVault(strategyId: string): Promise<StrategySacredVault | undefined> {
    const result = await db.select().from(strategySacredVault)
      .where(eq(strategySacredVault.strategyId, strategyId))
      .limit(1);
    return result[0];
  }

  async getAllSacredStrategies(): Promise<StrategySacredVault[]> {
    return await db.select().from(strategySacredVault)
      .orderBy(desc(strategySacredVault.winRate), desc(strategySacredVault.profitFactor));
  }

  async markStrategyMistake(strategyId: string, isMistake: boolean): Promise<void> {
    await db.update(strategySacredVault)
      .set({ 
        isMarkedMistake: isMistake,
        divineApproval: !isMistake,
        updatedAt: new Date()
      })
      .where(eq(strategySacredVault.strategyId, strategyId));
  }

  async updateStrategyPerformance(strategyId: string, tradeResult: any): Promise<void> {
    const strategy = await this.getStrategySacredVault(strategyId);
    if (!strategy) return;

    const newTotalTrades = strategy.totalTrades + 1;
    const isWin = tradeResult.result === 'WIN';
    const newWins = strategy.wins + (isWin ? 1 : 0);
    const newLosses = strategy.losses + (isWin ? 0 : 1);
    const newWinRate = newWins / newTotalTrades;

    await db.update(strategySacredVault)
      .set({
        totalTrades: newTotalTrades,
        wins: newWins,
        losses: newLosses,
        winRate: newWinRate,
        avgProfit: isWin ? ((strategy.avgProfit * strategy.wins) + tradeResult.profit_loss) / newWins : strategy.avgProfit,
        avgLoss: !isWin ? ((strategy.avgLoss * strategy.losses) + Math.abs(tradeResult.profit_loss)) / newLosses : strategy.avgLoss,
        lastUsed: new Date(),
        updatedAt: new Date()
      })
      .where(eq(strategySacredVault.strategyId, strategyId));
  }

  // Spiritual Recall Implementation
  async createSpiritualRecall(recall: InsertSpiritualRecall): Promise<SpiritualRecall> {
    const [result] = await db.insert(spiritualRecall).values(recall).returning();
    return result;
  }

  async getSpiritualRecallHistory(userId?: number, limit = 50): Promise<SpiritualRecall[]> {
    let query = db.select().from(spiritualRecall);
    if (userId) {
      query = query.where(eq(spiritualRecall.userId, userId));
    }
    return await query.orderBy(desc(spiritualRecall.createdAt)).limit(limit);
  }

  async validateSpiritualRecall(recallId: number, isValid: boolean, outcome?: any): Promise<void> {
    await db.update(spiritualRecall)
      .set({
        isValidated: isValid,
        validationDate: new Date(),
        tradeOutcome: outcome?.result,
        profitLoss: outcome?.profit_loss,
        divineAccuracy: isValid ? 95 : 45
      })
      .where(eq(spiritualRecall.id, recallId));
  }

  // Timeline Awareness Implementation
  async createTimelinePattern(pattern: InsertTimelineAwareness): Promise<TimelineAwareness> {
    const [result] = await db.insert(timelineAwareness).values(pattern).returning();
    return result;
  }

  async getActiveTimelinePatterns(userId?: number): Promise<TimelineAwareness[]> {
    let query = db.select().from(timelineAwareness)
      .where(eq(timelineAwareness.isActivePattern, true));
    if (userId) {
      query = query.where(eq(timelineAwareness.userId, userId));
    }
    return await query.orderBy(desc(timelineAwareness.patternStrength));
  }

  async matchTimelinePattern(currentContext: any): Promise<TimelineAwareness[]> {
    const patterns = await this.getActiveTimelinePatterns();
    return patterns.filter(pattern => pattern.patternStrength > 70);
  }

  async updatePatternSuccess(patternId: number, success: boolean): Promise<void> {
    const pattern = await db.select().from(timelineAwareness)
      .where(eq(timelineAwareness.id, patternId)).limit(1);
    
    if (pattern[0]) {
      const newMatchCount = pattern[0].matchCount + 1;
      const newSuccessRate = success ? 
        ((pattern[0].successRate * pattern[0].matchCount) + 1) / newMatchCount :
        (pattern[0].successRate * pattern[0].matchCount) / newMatchCount;

      await db.update(timelineAwareness)
        .set({
          matchCount: newMatchCount,
          successRate: newSuccessRate,
          lastMatched: new Date(),
          updatedAt: new Date()
        })
        .where(eq(timelineAwareness.id, patternId));
    }
  }

  // Kons Symbol Tree Implementation
  async upsertKonsSymbol(symbol: InsertKonsSymbolTree): Promise<KonsSymbolTree> {
    const existing = await this.getKonsSymbol(symbol.symbolName);
    if (existing) {
      const [result] = await db.update(konsSymbolTree)
        .set({
          ...symbol,
          updatedAt: new Date()
        })
        .where(eq(konsSymbolTree.symbolName, symbol.symbolName))
        .returning();
      return result;
    } else {
      const [result] = await db.insert(konsSymbolTree).values(symbol).returning();
      return result;
    }
  }

  async getKonsSymbol(symbolName: string): Promise<KonsSymbolTree | undefined> {
    const result = await db.select().from(konsSymbolTree)
      .where(eq(konsSymbolTree.symbolName, symbolName))
      .limit(1);
    return result[0];
  }

  async updateSymbolUsage(symbolName: string, success: boolean): Promise<void> {
    const symbol = await this.getKonsSymbol(symbolName);
    if (!symbol) return;

    await db.update(konsSymbolTree)
      .set({
        usageCount: symbol.usageCount + 1,
        successCount: symbol.successCount + (success ? 1 : 0),
        failureCount: symbol.failureCount + (success ? 0 : 1),
        lastManifested: new Date(),
        symbolPower: Math.min(100, symbol.symbolPower + (success ? 2 : -1)),
        updatedAt: new Date()
      })
      .where(eq(konsSymbolTree.symbolName, symbolName));
  }

  async getActiveSymbols(): Promise<KonsSymbolTree[]> {
    return await db.select().from(konsSymbolTree)
      .where(eq(konsSymbolTree.isActiveSymbol, true))
      .orderBy(desc(konsSymbolTree.symbolPower));
  }

  // Neural Evolution Implementation
  async logNeuralEvolution(evolution: InsertNeuralEvolutionLog): Promise<NeuralEvolutionLog> {
    const [result] = await db.insert(neuralEvolutionLogs).values(evolution).returning();
    return result;
  }

  async getEvolutionHistory(limit = 100): Promise<NeuralEvolutionLog[]> {
    return await db.select().from(neuralEvolutionLogs)
      .orderBy(desc(neuralEvolutionLogs.createdAt))
      .limit(limit);
  }

  async revertEvolution(evolutionId: number): Promise<void> {
    await db.update(neuralEvolutionLogs)
      .set({
        revertedAt: new Date(),
        isStableEvolution: false
      })
      .where(eq(neuralEvolutionLogs.id, evolutionId));
  }

  // ===== WALLET SECURITY ENHANCEMENT IMPLEMENTATIONS =====

  // User Permission Management (Question 1)
  async createUserPermissionRole(role: InsertUserPermissionRole): Promise<UserPermissionRole> {
    try {
      const [newRole] = await db
        .insert(userPermissionRoles)
        .values(role)
        .returning();
      return newRole;
    } catch (error) {
      console.error("Error creating user permission role:", error);
      throw error;
    }
  }

  async grantWalletPermission(permission: InsertWalletPermission): Promise<WalletPermission> {
    try {
      const [newPermission] = await db
        .insert(walletPermissions)
        .values(permission)
        .returning();
      return newPermission;
    } catch (error) {
      console.error("Error granting wallet permission:", error);
      throw error;
    }
  }

  async revokeWalletPermission(userId: number, walletId: number): Promise<void> {
    try {
      await db.update(walletPermissions)
        .set({ 
          isActive: false,
          revokedAt: new Date(),
          updatedAt: new Date()
        })
        .where(
          and(
            eq(walletPermissions.userId, userId),
            eq(walletPermissions.walletId, walletId),
            eq(walletPermissions.isActive, true)
          )
        );
    } catch (error) {
      console.error("Error revoking wallet permission:", error);
      throw error;
    }
  }

  async checkWalletAccess(userId: number, walletId: number, accessType: 'read' | 'write' | 'trade' | 'admin'): Promise<boolean> {
    try {
      const permissions = await db
        .select()
        .from(walletPermissions)
        .innerJoin(
          userPermissionRoles,
          eq(walletPermissions.roleId, userPermissionRoles.id)
        )
        .where(
          and(
            eq(walletPermissions.userId, userId),
            eq(walletPermissions.walletId, walletId),
            eq(walletPermissions.isActive, true),
            or(
              eq(walletPermissions.expiresAt, null),
              gt(walletPermissions.expiresAt, new Date())
            )
          )
        );

      if (permissions.length === 0) return false;

      // Check if any role has the required permission
      return permissions.some(permission => {
        const role = permission.user_permission_roles;
        switch (accessType) {
          case 'read': return role.canRead;
          case 'write': return role.canWrite;
          case 'trade': return role.canTrade;
          case 'admin': return role.canAdmin;
          default: return false;
        }
      });
    } catch (error) {
      console.error("Error checking wallet access:", error);
      return false;
    }
  }

  // Multi-Factor Authentication (Question 2)
  async upsertUserMfaSettings(settings: InsertUserMfaSetting): Promise<UserMfaSetting> {
    try {
      const [upsertedSettings] = await db
        .insert(userMfaSettings)
        .values(settings)
        .onConflictDoUpdate({
          target: userMfaSettings.userId,
          set: {
            ...settings,
            updatedAt: new Date()
          }
        })
        .returning();
      return upsertedSettings;
    } catch (error) {
      console.error("Error upserting MFA settings:", error);
      throw error;
    }
  }

  async getUserMfaSettings(userId: number): Promise<UserMfaSetting | undefined> {
    try {
      const [settings] = await db
        .select()
        .from(userMfaSettings)
        .where(eq(userMfaSettings.userId, userId));
      return settings;
    } catch (error) {
      console.error("Error getting MFA settings:", error);
      throw error;
    }
  }

  async updateMfaFailedAttempts(userId: number, attempts: number, lockUntil?: Date): Promise<void> {
    try {
      await db.update(userMfaSettings)
        .set({ 
          mfaFailedAttempts: attempts,
          mfaLockUntil: lockUntil,
          updatedAt: new Date()
        })
        .where(eq(userMfaSettings.userId, userId));
    } catch (error) {
      console.error("Error updating MFA failed attempts:", error);
      throw error;
    }
  }

  // JWT Token Auditing (Question 3)
  async logJwtAudit(audit: InsertJwtAuditTrail): Promise<JwtAuditTrail> {
    try {
      const [newAudit] = await db
        .insert(jwtAuditTrails)
        .values(audit)
        .returning();
      return newAudit;
    } catch (error) {
      console.error("Error logging JWT audit:", error);
      throw error;
    }
  }

  async getJwtAuditHistory(userId: number, limit?: number): Promise<JwtAuditTrail[]> {
    try {
      return await db
        .select()
        .from(jwtAuditTrails)
        .where(eq(jwtAuditTrails.userId, userId))
        .orderBy(desc(jwtAuditTrails.createdAt))
        .limit(limit || 50);
    } catch (error) {
      console.error("Error getting JWT audit history:", error);
      throw error;
    }
  }

  async revokeSuspiciousTokens(userId: number, reason: string): Promise<number> {
    try {
      const result = await db.update(jwtAuditTrails)
        .set({ 
          isRevoked: true,
          revokeReason: reason,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(jwtAuditTrails.userId, userId),
            eq(jwtAuditTrails.isRevoked, false),
            or(
              eq(jwtAuditTrails.suspiciousActivity, true),
              ne(jwtAuditTrails.ipAddress, "127.0.0.1") // Example: revoke non-local tokens
            )
          )
        );

      return result.rowCount || 0;
    } catch (error) {
      console.error("Error revoking suspicious tokens:", error);
      throw error;
    }
  }

  // Authentication Monitoring (Question 4)
  async logAuthenticationAttempt(attempt: InsertAuthenticationAttempt): Promise<AuthenticationAttempt> {
    try {
      const [newAttempt] = await db
        .insert(authenticationAttempts)
        .values(attempt)
        .returning();
      return newAttempt;
    } catch (error) {
      console.error("Error logging authentication attempt:", error);
      throw error;
    }
  }

  async getFailedAuthAttempts(ipAddress: string, timeRange: number): Promise<AuthenticationAttempt[]> {
    try {
      const timeThreshold = new Date(Date.now() - timeRange);
      return await db
        .select()
        .from(authenticationAttempts)
        .where(
          and(
            eq(authenticationAttempts.ipAddress, ipAddress),
            eq(authenticationAttempts.isSuccess, false),
            gt(authenticationAttempts.attemptedAt, timeThreshold)
          )
        )
        .orderBy(desc(authenticationAttempts.attemptedAt));
    } catch (error) {
      console.error("Error getting failed auth attempts:", error);
      throw error;
    }
  }

  async getAuthStatistics(timeRange: number): Promise<any> {
    try {
      const timeThreshold = new Date(Date.now() - timeRange);
      
      // Get total attempts, successful and failed
      const stats = await db
        .select({
          totalAttempts: sql<number>`COUNT(*)`,
          successfulAttempts: sql<number>`SUM(CASE WHEN is_success = true THEN 1 ELSE 0 END)`,
          failedAttempts: sql<number>`SUM(CASE WHEN is_success = false THEN 1 ELSE 0 END)`,
          uniqueIps: sql<number>`COUNT(DISTINCT ip_address)`,
          uniqueUsers: sql<number>`COUNT(DISTINCT user_id)`
        })
        .from(authenticationAttempts)
        .where(gt(authenticationAttempts.attemptedAt, timeThreshold));

      return stats[0] || {};
    } catch (error) {
      console.error("Error getting auth statistics:", error);
      throw error;
    }
  }

  // Transaction Security (Question 5)
  async createTransactionSecurity(security: InsertTransactionSecurity): Promise<TransactionSecurity> {
    try {
      const [newSecurity] = await db
        .insert(transactionSecurities)
        .values(security)
        .returning();
      return newSecurity;
    } catch (error) {
      console.error("Error creating transaction security:", error);
      throw error;
    }
  }

  async verifyTransactionSignature(transactionId: string): Promise<TransactionSecurity | undefined> {
    try {
      const [security] = await db
        .select()
        .from(transactionSecurities)
        .where(eq(transactionSecurities.transactionId, transactionId));
      return security;
    } catch (error) {
      console.error("Error verifying transaction signature:", error);
      throw error;
    }
  }

  async getTransactionSecurityHistory(userId: number, limit?: number): Promise<TransactionSecurity[]> {
    try {
      return await db
        .select()
        .from(transactionSecurities)
        .where(eq(transactionSecurities.userId, userId))
        .orderBy(desc(transactionSecurities.createdAt))
        .limit(limit || 50);
    } catch (error) {
      console.error("Error getting transaction security history:", error);
      throw error;
    }
  }

  // Financial Audit Trail (Question 6)
  async createFinancialAudit(audit: InsertFinancialAuditTrail): Promise<FinancialAuditTrail> {
    try {
      const [newAudit] = await db
        .insert(financialAuditTrails)
        .values(audit)
        .returning();
      return newAudit;
    } catch (error) {
      console.error("Error creating financial audit:", error);
      throw error;
    }
  }

  async getFinancialAuditTrail(userId: number, auditType?: string, limit?: number): Promise<FinancialAuditTrail[]> {
    try {
      let query = db
        .select()
        .from(financialAuditTrails)
        .where(eq(financialAuditTrails.userId, userId));

      if (auditType) {
        query = query.where(eq(financialAuditTrails.auditType, auditType));
      }

      return await query
        .orderBy(desc(financialAuditTrails.createdAt))
        .limit(limit || 100);
    } catch (error) {
      console.error("Error getting financial audit trail:", error);
      throw error;
    }
  }

  async verifyAuditIntegrity(userId: number, timeRange: number): Promise<any> {
    try {
      const timeThreshold = new Date(Date.now() - timeRange);
      
      // Get audit statistics for integrity verification
      const integrity = await db
        .select({
          totalAudits: sql<number>`COUNT(*)`,
          auditTypes: sql<number>`COUNT(DISTINCT audit_type)`,
          integrityScore: sql<number>`AVG(CASE WHEN is_verified = true THEN 100 ELSE 0 END)`,
          lastAudit: sql<string>`MAX(created_at)`
        })
        .from(financialAuditTrails)
        .where(
          and(
            eq(financialAuditTrails.userId, userId),
            gt(financialAuditTrails.createdAt, timeThreshold)
          )
        );

      return integrity[0] || {};
    } catch (error) {
      console.error("Error verifying audit integrity:", error);
      throw error;
    }
  }

  // Trading Controls (Question 9)
  async upsertTradingControls(controls: InsertTradingControl): Promise<TradingControl> {
    try {
      const [upsertedControls] = await db
        .insert(tradingControls)
        .values(controls)
        .onConflictDoUpdate({
          target: tradingControls.userId,
          set: {
            ...controls,
            updatedAt: new Date()
          }
        })
        .returning();
      return upsertedControls;
    } catch (error) {
      console.error("Error upserting trading controls:", error);
      throw error;
    }
  }

  async getUserTradingControls(userId: number): Promise<TradingControl | undefined> {
    try {
      const [controls] = await db
        .select()
        .from(tradingControls)
        .where(eq(tradingControls.userId, userId));
      return controls;
    } catch (error) {
      console.error("Error getting user trading controls:", error);
      throw error;
    }
  }

  async freezeUserTrading(userId: number, reason: string, freezeBy: number): Promise<void> {
    try {
      await db.update(tradingControls)
        .set({ 
          isTradingFrozen: true,
          freezeReason: reason,
          frozenBy: freezeBy,
          frozenAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(tradingControls.userId, userId));
    } catch (error) {
      console.error("Error freezing user trading:", error);
      throw error;
    }
  }

  async unfreezeUserTrading(userId: number): Promise<void> {
    try {
      await db.update(tradingControls)
        .set({ 
          isTradingFrozen: false,
          freezeReason: null,
          frozenBy: null,
          frozenAt: null,
          updatedAt: new Date()
        })
        .where(eq(tradingControls.userId, userId));
    } catch (error) {
      console.error("Error unfreezing user trading:", error);
      throw error;
    }
  }

  // Bot Fund Isolation (Question 10)
  async upsertBotFundIsolation(isolation: InsertBotFundIsolation): Promise<BotFundIsolation> {
    try {
      const [upsertedIsolation] = await db
        .insert(botFundIsolations)
        .values(isolation)
        .onConflictDoUpdate({
          target: [botFundIsolations.userId, botFundIsolations.botId],
          set: {
            ...isolation,
            updatedAt: new Date()
          }
        })
        .returning();
      return upsertedIsolation;
    } catch (error) {
      console.error("Error upserting bot fund isolation:", error);
      throw error;
    }
  }

  async getBotFundIsolation(userId: number, botId: string): Promise<BotFundIsolation | undefined> {
    try {
      const [isolation] = await db
        .select()
        .from(botFundIsolations)
        .where(
          and(
            eq(botFundIsolations.userId, userId),
            eq(botFundIsolations.botId, botId)
          )
        );
      return isolation;
    } catch (error) {
      console.error("Error getting bot fund isolation:", error);
      throw error;
    }
  }

  async triggerBotIsolation(userId: number, botId: string, reason: string): Promise<void> {
    try {
      await db.update(botFundIsolations)
        .set({ 
          isIsolated: true,
          isolationReason: reason,
          isolatedAt: new Date(),
          updatedAt: new Date()
        })
        .where(
          and(
            eq(botFundIsolations.userId, userId),
            eq(botFundIsolations.botId, botId)
          )
        );
    } catch (error) {
      console.error("Error triggering bot isolation:", error);
      throw error;
    }
  }

  // Fraud Detection (Question 12)
  async logFraudDetection(log: InsertFraudDetectionLog): Promise<FraudDetectionLog> {
    try {
      const [newLog] = await db
        .insert(fraudDetectionLogs)
        .values(log)
        .returning();
      return newLog;
    } catch (error) {
      console.error("Error logging fraud detection:", error);
      throw error;
    }
  }

  async getPendingFraudCases(): Promise<any[]> {
    try {
      return await db
        .select()
        .from(fraudDetectionLogs)
        .where(
          and(
            eq(fraudDetectionLogs.isResolved, false),
            gt(fraudDetectionLogs.riskScore, 70) // High risk cases
          )
        )
        .orderBy(desc(fraudDetectionLogs.riskScore), desc(fraudDetectionLogs.detectedAt));
    } catch (error) {
      console.error("Error getting pending fraud cases:", error);
      throw error;
    }
  }

  async resolveFraudCase(caseId: number, reviewedBy: number, outcome: string, actionTaken?: string): Promise<void> {
    try {
      await db.update(fraudDetectionLogs)
        .set({ 
          isResolved: true,
          outcome,
          actionTaken: actionTaken || null,
          reviewedBy,
          resolvedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(fraudDetectionLogs.id, caseId));
    } catch (error) {
      console.error("Error resolving fraud case:", error);
      throw error;
    }
  }

  // Cold Storage Management (Question 20)
  async createColdStorageVault(vault: InsertColdStorageVault): Promise<ColdStorageVault> {
    try {
      const [newVault] = await db
        .insert(coldStorageVaults)
        .values(vault)
        .returning();
      return newVault;
    } catch (error) {
      console.error("Error creating cold storage vault:", error);
      throw error;
    }
  }

  async getUserColdStorageVaults(userId: number): Promise<ColdStorageVault[]> {
    try {
      return await db
        .select()
        .from(coldStorageVaults)
        .where(eq(coldStorageVaults.userId, userId))
        .orderBy(desc(coldStorageVaults.createdAt));
    } catch (error) {
      console.error("Error getting user cold storage vaults:", error);
      throw error;
    }
  }

  async updateColdStorageBalance(vaultId: number, newBalance: string): Promise<void> {
    try {
      await db.update(coldStorageVaults)
        .set({ 
          balance: newBalance,
          lastTransactionAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(coldStorageVaults.id, vaultId));
    } catch (error) {
      console.error("Error updating cold storage balance:", error);
      throw error;
    }
  }

  async lockColdStorageVault(vaultId: number, reason: string): Promise<void> {
    try {
      await db.update(coldStorageVaults)
        .set({ 
          isLocked: true,
          lockReason: reason,
          lockedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(coldStorageVaults.id, vaultId));
    } catch (error) {
      console.error("Error locking cold storage vault:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();