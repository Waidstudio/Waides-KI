import { storage } from '../storage.js';

export class ModeService {
  private static instance: ModeService;
  private currentMode: 'demo' | 'real' = 'demo';
  private userModes: Map<number, 'demo' | 'real'> = new Map();

  static getInstance(): ModeService {
    if (!ModeService.instance) {
      ModeService.instance = new ModeService();
    }
    return ModeService.instance;
  }

  // Set mode for specific user
  setUserMode(userId: number, mode: 'demo' | 'real'): void {
    this.userModes.set(userId, mode);
    console.log(`🔄 User ${userId} switched to ${mode.toUpperCase()} mode`);
  }

  // Get mode for specific user
  getUserMode(userId: number): 'demo' | 'real' {
    return this.userModes.get(userId) || 'demo';
  }

  // Get wallet data based on mode
  async getWalletData(userId: number): Promise<{
    balance: number;
    currency: string;
    usdValue: number;
    localBalance: number;
    localCurrency: string;
    smaiBalance: number;
    totalUsdValue: number;
    hasConverted: boolean;
  }> {
    const mode = this.getUserMode(userId);
    
    if (mode === 'demo') {
      // Demo mode: return simulated data
      return {
        balance: 10000,
        currency: 'USD',
        usdValue: 10000,
        localBalance: 10000,
        localCurrency: 'USD',
        smaiBalance: 0,
        totalUsdValue: 10000,
        hasConverted: false
      };
    } else {
      // Real mode: return actual user data or empty if new user
      try {
        const realData = await storage.getWalletBalance(userId.toString());
        
        // If user has no real trading activity, return empty/minimal data
        if (!realData || realData.localBalance <= 0) {
          return {
            balance: 0,
            currency: 'USD',
            usdValue: 0,
            localBalance: 0,
            localCurrency: 'USD',
            smaiBalance: 0,
            totalUsdValue: 0,
            hasConverted: false
          };
        }
        
        return realData;
      } catch (error) {
        // New user in real mode - start with empty wallet
        return {
          balance: 0,
          currency: 'USD',
          usdValue: 0,
          localBalance: 0,
          localCurrency: 'USD',
          smaiBalance: 0,
          totalUsdValue: 0,
          hasConverted: false
        };
      }
    }
  }

  // Get bot performance data based on mode
  getBotPerformanceData(userId: number, botId: string): {
    successRate: number;
    winRate: number;
    totalTrades: number;
    profit: number;
    isActive: boolean;
  } {
    const mode = this.getUserMode(userId);
    
    if (mode === 'demo') {
      // Demo mode: return simulated performance data
      const demoData = {
        waidbot_alpha: { successRate: 87.5, winRate: 78.2, totalTrades: 156, profit: 2847.50 },
        waidbot_pro_beta: { successRate: 91.3, winRate: 82.4, totalTrades: 98, profit: 3421.75 },
        autonomous_gamma: { successRate: 89.1, winRate: 80.6, totalTrades: 203, profit: 4123.25 },
        full_engine_omega: { successRate: 94.2, winRate: 86.8, totalTrades: 67, profit: 5867.90 },
        smai_chinnikstah_delta: { successRate: 85.7, winRate: 75.3, totalTrades: 134, profit: 2156.80 },
        nwaora_chigozie_epsilon: { successRate: 92.8, winRate: 84.1, totalTrades: 89, profit: 3789.45 }
      };
      
      const data = demoData[botId as keyof typeof demoData] || demoData.waidbot_alpha;
      return {
        ...data,
        isActive: false
      };
    } else {
      // Real mode: return actual user trading data or zeros for new users
      return {
        successRate: 0,
        winRate: 0,
        totalTrades: 0,
        profit: 0,
        isActive: false
      };
    }
  }

  // Get trading history based on mode
  getTradingHistory(userId: number): any[] {
    const mode = this.getUserMode(userId);
    
    if (mode === 'demo') {
      // Demo mode: return simulated trading history
      return [
        {
          id: 1,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'BUY',
          pair: 'ETH/USDT',
          amount: 1.5,
          price: 2486.75,
          profit: 147.82,
          status: 'completed',
          bot: 'WaidBot Pro'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          type: 'SELL',
          pair: 'ETH/USDT',
          amount: 0.8,
          price: 2501.20,
          profit: 89.15,
          status: 'completed',
          bot: 'Autonomous Gamma'
        }
      ];
    } else {
      // Real mode: return empty array for new users
      return [];
    }
  }

  // Get portfolio data based on mode
  getPortfolioData(userId: number): any {
    const mode = this.getUserMode(userId);
    
    if (mode === 'demo') {
      // Demo mode: return simulated portfolio
      return {
        totalValue: 10000,
        currency: "USD",
        allocation: [
          {
            asset: "USDT",
            amount: 5000,
            value: 5000,
            percentage: 50,
            change24h: 0.1
          },
          {
            asset: "ETH",
            amount: 1.5,
            value: 3708,
            percentage: 37,
            change24h: 2.3
          },
          {
            asset: "BTC",
            amount: 0.05,
            value: 1292,
            percentage: 13,
            change24h: 1.8
          }
        ]
      };
    } else {
      // Real mode: return empty portfolio for new users
      return {
        totalValue: 0,
        currency: "USD",
        allocation: []
      };
    }
  }

  // Get user statistics based on mode
  getUserStats(userId: number): any {
    const mode = this.getUserMode(userId);
    
    if (mode === 'demo') {
      // Demo mode: return simulated stats
      return {
        totalSmaiSika: 2456.78901234,
        miningEfficiency: 87.5,
        smaiOnyixScore: 1247,
        totalMiningTime: 156780,
        achievementsUnlocked: [
          "First Mining Session",
          "SmaiSika Collector",
          "Mining Enthusiast",
          "Puzzle Master"
        ]
      };
    } else {
      // Real mode: return actual user stats or zeros
      return {
        totalSmaiSika: 0,
        miningEfficiency: 0,
        smaiOnyixScore: 100,
        totalMiningTime: 0,
        achievementsUnlocked: []
      };
    }
  }
}

export const modeService = ModeService.getInstance();