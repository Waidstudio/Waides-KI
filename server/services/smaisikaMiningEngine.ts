import { db } from '../db.js';
import { smaisikaMining, smaiPins, smaiSikaSwaps, userReputation, wallets } from '../../shared/schema.js';
import { eq, and, desc, sum, avg } from 'drizzle-orm';

interface MiningSession {
  sessionId: string;
  userId: number;
  miningType: 'cpu' | 'gpu' | 'quiz' | 'puzzle';
  difficulty: number;
  isActive: boolean;
  startTime: Date;
  hashRate: number;
  smaiOnyixScore: number;
}

interface SmaiPin {
  pinCode: string;
  amount: number;
  creatorId: number;
  expiryTime: Date;
  message?: string;
}

interface UserStats {
  totalSmaiSika: number;
  miningEfficiency: number;
  smaiOnyixScore: number;
  totalMiningTime: number;
  achievementsUnlocked: string[];
}

class SmaisikaMiningEngine {
  private activeSessions: Map<string, MiningSession> = new Map();
  private puzzleBank: Array<{ question: string; answer: string; difficulty: number; reward: number }> = [];
  private quizBank: Array<{ question: string; options: string[]; correctAnswer: number; difficulty: number; reward: number }> = [];

  constructor() {
    this.initializePuzzleBank();
    this.initializeQuizBank();
    console.log('🔮 Smaisika Mining Engine initialized');
  }

  private initializePuzzleBank() {
    this.puzzleBank = [
      { question: "What is 2^8?", answer: "256", difficulty: 1, reward: 0.1 },
      { question: "Complete the sequence: 1, 1, 2, 3, 5, 8, ?", answer: "13", difficulty: 2, reward: 0.2 },
      { question: "What is the square root of 144?", answer: "12", difficulty: 1, reward: 0.15 },
      { question: "If f(x) = x^2 + 3x + 2, what is f(5)?", answer: "42", difficulty: 3, reward: 0.3 },
      { question: "What is the next prime number after 17?", answer: "19", difficulty: 2, reward: 0.25 },
      { question: "Solve: 3x + 7 = 22", answer: "5", difficulty: 2, reward: 0.2 },
      { question: "What is 15! / 13!?", answer: "210", difficulty: 4, reward: 0.4 },
      { question: "Binary: What is 1101 in decimal?", answer: "13", difficulty: 3, reward: 0.35 },
    ];
  }

  private initializeQuizBank() {
    this.quizBank = [
      {
        question: "What is the primary benefit of blockchain technology?",
        options: ["Speed", "Decentralization", "Graphics", "Sound"],
        correctAnswer: 1,
        difficulty: 1,
        reward: 0.1
      },
      {
        question: "Which consensus mechanism does Bitcoin use?",
        options: ["Proof of Stake", "Proof of Work", "Delegated PoS", "Proof of Authority"],
        correctAnswer: 1,
        difficulty: 2,
        reward: 0.2
      },
      {
        question: "What does 'HODL' mean in crypto?",
        options: ["Hold On for Dear Life", "High Order Digital Logic", "Hybrid Online Data Link", "Hold On, Don't Leave"],
        correctAnswer: 0,
        difficulty: 1,
        reward: 0.15
      },
      {
        question: "Which algorithm is commonly used in mining?",
        options: ["SHA-256", "AES-128", "RSA-2048", "MD5"],
        correctAnswer: 0,
        difficulty: 3,
        reward: 0.3
      }
    ];
  }

  // Start mining session
  async startMining(userId: number, miningType: 'cpu' | 'gpu' | 'quiz' | 'puzzle', difficulty: number = 1): Promise<{ success: boolean; sessionId?: string; message: string }> {
    try {
      // Check user reputation and mining efficiency
      const userRep = await this.getUserReputation(userId);
      const sessionId = `mining_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const session: MiningSession = {
        sessionId,
        userId,
        miningType,
        difficulty: Math.min(Math.max(difficulty, 1), 10),
        isActive: true,
        startTime: new Date(),
        hashRate: this.calculateHashRate(miningType, userRep.miningEfficiency),
        smaiOnyixScore: userRep.smaiOnyixScore
      };

      this.activeSessions.set(sessionId, session);

      // Insert into database
      await db.insert(smaisikaMining).values({
        userId,
        sessionId,
        miningType,
        startTime: session.startTime,
        difficulty: session.difficulty,
        hashRate: session.hashRate.toString(),
        smaiOnyixScore: session.smaiOnyixScore,
        isActive: true
      });

      console.log(`⛏️ Mining session started: ${sessionId} for user ${userId}`);
      
      return {
        success: true,
        sessionId,
        message: `Mining session started with ${miningType} at difficulty ${difficulty}`
      };
    } catch (error) {
      console.error('❌ Failed to start mining session:', error);
      return { success: false, message: 'Failed to start mining session' };
    }
  }

  // Stop mining and calculate rewards
  async stopMining(sessionId: string): Promise<{ success: boolean; smaiSikaEarned: number; message: string }> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || !session.isActive) {
        return { success: false, smaiSikaEarned: 0, message: 'No active mining session found' };
      }

      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);
      const smaiSikaEarned = this.calculateReward(session, duration);

      // Update database
      await db.update(smaisikaMining)
        .set({
          endTime,
          duration,
          smaiSikaEarned: smaiSikaEarned.toString(),
          isActive: false
        })
        .where(eq(smaisikaMining.sessionId, sessionId));

      // Update user wallet with SmaiSika
      await this.addSmaiSikaToWallet(session.userId, smaiSikaEarned);

      // Update user reputation based on mining activity
      await this.updateUserReputation(session.userId, duration, smaiSikaEarned);

      session.isActive = false;
      this.activeSessions.delete(sessionId);

      console.log(`⛏️ Mining session completed: ${sessionId}, earned: ${smaiSikaEarned} SmaiSika`);

      return {
        success: true,
        smaiSikaEarned,
        message: `Mining completed! Earned ${smaiSikaEarned.toFixed(8)} SmaiSika`
      };
    } catch (error) {
      console.error('❌ Failed to stop mining session:', error);
      return { success: false, smaiSikaEarned: 0, message: 'Failed to stop mining session' };
    }
  }

  // Calculate mining reward based on session parameters
  private calculateReward(session: MiningSession, duration: number): number {
    const baseReward = 0.001; // Base SmaiSika per second
    const difficultyMultiplier = session.difficulty * 0.5;
    const typeMultiplier = this.getMiningTypeMultiplier(session.miningType);
    const reputationMultiplier = session.smaiOnyixScore / 100;
    
    const totalReward = baseReward * duration * difficultyMultiplier * typeMultiplier * reputationMultiplier;
    return Math.max(totalReward, 0.00001); // Minimum reward
  }

  private getMiningTypeMultiplier(type: string): number {
    const multipliers = {
      'cpu': 1.0,
      'gpu': 2.5,
      'quiz': 1.5,
      'puzzle': 2.0
    };
    return multipliers[type] || 1.0;
  }

  private calculateHashRate(type: string, efficiency: number): number {
    const baseRates = {
      'cpu': 1000,
      'gpu': 5000,
      'quiz': 2000,
      'puzzle': 3000
    };
    return (baseRates[type] || 1000) * efficiency;
  }

  // Create SmaiPin for transfers
  async createSmaiPin(userId: number, amount: number, validityHours: number = 24, message?: string): Promise<{ success: boolean; pinCode?: string; message: string }> {
    try {
      // Check user's SmaiSika balance
      const userWallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
      
      if (!userWallet[0] || parseFloat(userWallet[0].smaiBalance || '0') < amount) {
        return { success: false, message: 'Insufficient SmaiSika balance' };
      }

      // Generate unique pin code
      const pinCode = this.generatePinCode();
      const validityPeriod = validityHours * 3600; // Convert to seconds
      const expiryTime = new Date(Date.now() + validityPeriod * 1000);

      // Insert SmaiPin
      await db.insert(smaiPins).values({
        pinCode,
        creatorId: userId,
        smaiSikaAmount: amount.toString(),
        validityPeriod,
        expiryTime,
        transferMessage: message || null
      });

      // Deduct amount from user's wallet
      const currentBalance = parseFloat(userWallet[0].smaiBalance || '0');
      await db.update(wallets)
        .set({ smaiBalance: (currentBalance - amount).toString() })
        .where(eq(wallets.userId, userId));

      console.log(`📌 SmaiPin created: ${pinCode} for ${amount} SmaiSika`);

      return {
        success: true,
        pinCode,
        message: `SmaiPin created successfully. Code: ${pinCode}`
      };
    } catch (error) {
      console.error('❌ Failed to create SmaiPin:', error);
      return { success: false, message: 'Failed to create SmaiPin' };
    }
  }

  // Redeem SmaiPin
  async redeemSmaiPin(userId: number, pinCode: string): Promise<{ success: boolean; amount?: number; message: string }> {
    try {
      // Get pin details
      const pin = await db.select().from(smaiPins).where(eq(smaiPins.pinCode, pinCode)).limit(1);
      
      if (!pin[0]) {
        return { success: false, message: 'Invalid SmaiPin code' };
      }

      if (pin[0].isRedeemed) {
        return { success: false, message: 'SmaiPin already redeemed' };
      }

      if (new Date() > pin[0].expiryTime) {
        await db.update(smaiPins).set({ isExpired: true }).where(eq(smaiPins.pinCode, pinCode));
        return { success: false, message: 'SmaiPin has expired' };
      }

      const amount = parseFloat(pin[0].smaiSikaAmount);

      // Add SmaiSika to user's wallet
      await this.addSmaiSikaToWallet(userId, amount);

      // Mark pin as redeemed
      await db.update(smaiPins)
        .set({ 
          isRedeemed: true, 
          redeemedAt: new Date(),
          recipientId: userId 
        })
        .where(eq(smaiPins.pinCode, pinCode));

      console.log(`📌 SmaiPin redeemed: ${pinCode} for ${amount} SmaiSika by user ${userId}`);

      return {
        success: true,
        amount,
        message: `Successfully redeemed ${amount} SmaiSika`
      };
    } catch (error) {
      console.error('❌ Failed to redeem SmaiPin:', error);
      return { success: false, message: 'Failed to redeem SmaiPin' };
    }
  }

  // Get quiz/puzzle for interactive mining
  async getMiningChallenge(type: 'quiz' | 'puzzle', difficulty: number = 1): Promise<any> {
    if (type === 'quiz') {
      const filteredQuizzes = this.quizBank.filter(q => q.difficulty <= difficulty);
      return filteredQuizzes[Math.floor(Math.random() * filteredQuizzes.length)];
    } else {
      const filteredPuzzles = this.puzzleBank.filter(p => p.difficulty <= difficulty);
      return filteredPuzzles[Math.floor(Math.random() * filteredPuzzles.length)];
    }
  }

  // Submit quiz/puzzle answer
  async submitChallengeAnswer(sessionId: string, answer: string, challengeId?: string): Promise<{ success: boolean; correct: boolean; reward: number; message: string }> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || !session.isActive) {
        return { success: false, correct: false, reward: 0, message: 'No active session found' };
      }

      // Simulate checking answer (in real implementation, you'd verify against stored challenge)
      const isCorrect = Math.random() > 0.3; // 70% success rate for demo
      const reward = isCorrect ? 0.1 : 0.02;

      if (isCorrect) {
        await this.addSmaiSikaToWallet(session.userId, reward);
        
        // Update mining record
        await db.update(smaisikaMining)
          .set({
            [session.miningType === 'quiz' ? 'quizzesCompleted' : 'puzzlesSolved']: 
            (session.miningType === 'quiz' ? 1 : 1)
          })
          .where(eq(smaisikaMining.sessionId, sessionId));
      }

      return {
        success: true,
        correct: isCorrect,
        reward,
        message: isCorrect ? `Correct! Earned ${reward} SmaiSika` : `Incorrect. Small consolation reward: ${reward} SmaiSika`
      };
    } catch (error) {
      console.error('❌ Failed to submit challenge answer:', error);
      return { success: false, correct: false, reward: 0, message: 'Failed to submit answer' };
    }
  }

  // Swap SmaiSika for real cryptocurrencies
  async swapSmaiSika(userId: number, amount: number, toCurrency: 'MONERO' | 'USDT' | 'BTC' | 'ETH', walletAddress: string): Promise<{ success: boolean; swapId?: string; message: string }> {
    try {
      // Check user balance
      const userWallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
      
      if (!userWallet[0] || parseFloat(userWallet[0].smaiBalance || '0') < amount) {
        return { success: false, message: 'Insufficient SmaiSika balance for swap' };
      }

      const exchangeRate = this.getExchangeRate(toCurrency);
      const toAmount = amount * exchangeRate;
      const fees = toAmount * 0.01; // 1% fee
      const netAmount = toAmount - fees;

      const swapId = `swap_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Insert swap record
      await db.insert(smaiSikaSwaps).values({
        userId,
        swapId,
        fromAmount: amount.toString(),
        toAmount: netAmount.toString(),
        toCurrency,
        exchangeRate: exchangeRate.toString(),
        fees: fees.toString(),
        toWalletAddress: walletAddress,
        status: 'pending'
      });

      // Deduct SmaiSika from wallet
      const currentBalance = parseFloat(userWallet[0].smaiBalance || '0');
      await db.update(wallets)
        .set({ smaiBalance: (currentBalance - amount).toString() })
        .where(eq(wallets.userId, userId));

      console.log(`💱 Swap initiated: ${swapId} - ${amount} SmaiSika to ${netAmount} ${toCurrency}`);

      // In real implementation, this would trigger actual blockchain transactions
      // For now, we'll mark as completed after a delay
      setTimeout(async () => {
        await db.update(smaiSikaSwaps)
          .set({ 
            status: 'completed', 
            completedAt: new Date(),
            transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
          })
          .where(eq(smaiSikaSwaps.swapId, swapId));
      }, 5000);

      return {
        success: true,
        swapId,
        message: `Swap initiated. You will receive ${netAmount.toFixed(8)} ${toCurrency} at ${walletAddress}`
      };
    } catch (error) {
      console.error('❌ Failed to initiate swap:', error);
      return { success: false, message: 'Failed to initiate swap' };
    }
  }

  // Helper methods
  private generatePinCode(): string {
    return Math.random().toString(36).substr(2, 12).toUpperCase();
  }

  private getExchangeRate(currency: string): number {
    const rates = {
      'MONERO': 0.00001,
      'USDT': 0.001,
      'BTC': 0.000000001,
      'ETH': 0.0000001
    };
    return rates[currency] || 0.001;
  }

  private async addSmaiSikaToWallet(userId: number, amount: number): Promise<void> {
    const userWallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
    
    if (userWallet[0]) {
      const currentBalance = parseFloat(userWallet[0].smaiBalance || '0');
      await db.update(wallets)
        .set({ smaiBalance: (currentBalance + amount).toString() })
        .where(eq(wallets.userId, userId));
    }
  }

  private async getUserReputation(userId: number): Promise<{ smaiOnyixScore: number; miningEfficiency: number }> {
    const reputation = await db.select().from(userReputation).where(eq(userReputation.userId, userId)).limit(1);
    
    if (reputation[0]) {
      return {
        smaiOnyixScore: reputation[0].smaiOnyixScore || 100,
        miningEfficiency: parseFloat(reputation[0].miningEfficiency?.toString() || '1.0')
      };
    }

    // Create default reputation
    await db.insert(userReputation).values({
      userId,
      smaiOnyixScore: 100,
      miningEfficiency: '1.00'
    });

    return { smaiOnyixScore: 100, miningEfficiency: 1.0 };
  }

  private async updateUserReputation(userId: number, miningDuration: number, smaiSikaEarned: number): Promise<void> {
    const efficiency = smaiSikaEarned / (miningDuration / 3600); // SmaiSika per hour
    const bonusScore = Math.floor(efficiency * 10);

    await db.update(userReputation)
      .set({
        smaiOnyixScore: Math.min(200, (userReputation.smaiOnyixScore || 100) + bonusScore),
        lastUpdated: new Date()
      })
      .where(eq(userReputation.userId, userId));
  }

  // Get user mining statistics
  async getUserStats(userId: number): Promise<UserStats> {
    try {
      const userWallet = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
      const reputation = await db.select().from(userReputation).where(eq(userReputation.userId, userId)).limit(1);
      
      const miningHistory = await db.select()
        .from(smaisikaMining)
        .where(eq(smaisikaMining.userId, userId))
        .orderBy(desc(smaisikaMining.createdAt));

      const totalMiningTime = miningHistory.reduce((total, session) => total + (session.duration || 0), 0);
      const totalSmaiSika = parseFloat(userWallet[0]?.smaiBalance || '0');
      
      return {
        totalSmaiSika,
        miningEfficiency: parseFloat(reputation[0]?.miningEfficiency?.toString() || '1.0'),
        smaiOnyixScore: reputation[0]?.smaiOnyixScore || 100,
        totalMiningTime,
        achievementsUnlocked: JSON.parse(reputation[0]?.achievements?.toString() || '[]')
      };
    } catch (error) {
      console.error('❌ Failed to get user stats:', error);
      return {
        totalSmaiSika: 0,
        miningEfficiency: 1.0,
        smaiOnyixScore: 100,
        totalMiningTime: 0,
        achievementsUnlocked: []
      };
    }
  }

  // Get active mining session
  getMiningSession(sessionId: string): MiningSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  // Get all active sessions for user
  getUserActiveSessions(userId: number): MiningSession[] {
    return Array.from(this.activeSessions.values()).filter(session => session.userId === userId);
  }
}

export const smaisikaMiningEngine = new SmaisikaMiningEngine();