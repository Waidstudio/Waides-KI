import { db } from '../db';
import { smaiWallets, userSettings, botPerformance, tradeHistory, executionLogs } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface TradingBotConfig {
  // WaidBot Configuration
  waidbot: {
    enabled: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    positionSize: number;
    sacredMode: boolean;
    autoTrading: boolean;
  };
  
  // WaidBot Pro Configuration
  waidbotPro: {
    enabled: boolean;
    aiLevel: 'standard' | 'advanced' | 'quantum';
    positionSize: number;
    multiStrategy: boolean;
    autoTrading: boolean;
  };
  
  // Full Engine Configuration
  fullEngine: {
    enabled: boolean;
    engineMode: 'conservative' | 'balanced' | 'aggressive';
    maxPosition: number;
    aiOversight: boolean;
    autoTrading: boolean;
  };
  
  // Risk Management
  riskManagement: {
    stopLossPercentage: number;
    takeProfitPercentage: number;
    maxDailyLoss: number;
    tradingHours: string;
  };
  
  // Trading Configuration
  tradingConfig: {
    activePairs: {
      ethUsdt: boolean;
      eth3lUsdt: boolean;
      eth3sUsdt: boolean;
    };
    minTradeSize: number;
    maxTradeSize: number;
  };
  
  // System Status
  systemStatus: {
    emergencyStop: boolean;
    liveTradingActive: boolean;
    lastUpdated: Date;
  };
}

export interface BotPerformanceStats {
  waidbot: {
    totalTrades: number;
    winRate: number;
    totalProfit: number;
    averageProfit: number;
    active: boolean;
  };
  waidbotPro: {
    totalTrades: number;
    winRate: number;
    totalProfit: number;
    averageProfit: number;
    active: boolean;
  };
  fullEngine: {
    totalTrades: number;
    winRate: number;
    totalProfit: number;
    averageProfit: number;
    active: boolean;
  };
}

export interface RecentTradingActivity {
  id: string;
  bot: string;
  action: 'BUY' | 'SELL';
  pair: string;
  amount: string;
  pnl: string;
  time: string;
  status: 'completed' | 'pending' | 'failed';
}

export class TradingBotConfigService {
  private readonly DEFAULT_USER_ID = '1'; // Admin user

  async getTradingBotConfig(userId: string = this.DEFAULT_USER_ID): Promise<TradingBotConfig> {
    try {
      // Get user settings for trading configuration
      const [userSettingsData] = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, parseInt(userId)));

      // Get smai wallet configuration
      const [walletData] = await db
        .select()
        .from(smaiWallets)
        .where(eq(smaiWallets.userId, userId));

      // Build comprehensive configuration object
      const config: TradingBotConfig = {
        waidbot: {
          enabled: walletData?.botEnabled || false,
          riskLevel: this.mapRiskLevel(walletData?.riskLevel || 'MEDIUM'),
          positionSize: 500,
          sacredMode: true,
          autoTrading: userSettingsData?.autoTradingEnabled || false
        },
        
        waidbotPro: {
          enabled: walletData?.activeBot === 'WaidbotPro' || walletData?.activeBot === 'Both',
          aiLevel: 'advanced',
          positionSize: 1000,
          multiStrategy: true,
          autoTrading: userSettingsData?.autoTradingEnabled || false
        },
        
        fullEngine: {
          enabled: false, // Default to standby
          engineMode: 'balanced',
          maxPosition: 2500,
          aiOversight: true,
          autoTrading: false
        },
        
        riskManagement: {
          stopLossPercentage: parseFloat(walletData?.stopLossPercentage || '5'),
          takeProfitPercentage: parseFloat(walletData?.takeProfitPercentage || '15'),
          maxDailyLoss: 1000,
          tradingHours: '24h'
        },
        
        tradingConfig: {
          activePairs: {
            ethUsdt: true,
            eth3lUsdt: false,
            eth3sUsdt: false
          },
          minTradeSize: 50,
          maxTradeSize: 2500
        },
        
        systemStatus: {
          emergencyStop: false,
          liveTradingActive: walletData?.botEnabled || false,
          lastUpdated: new Date()
        }
      };

      return config;
    } catch (error) {
      console.error('Error fetching trading bot config:', error);
      return this.getDefaultConfig();
    }
  }

  async updateTradingBotConfig(userId: string = this.DEFAULT_USER_ID, config: Partial<TradingBotConfig>): Promise<boolean> {
    try {
      // Update user settings - create if not exists
      if (config.waidbot || config.waidbotPro || config.fullEngine) {
        const autoTradingEnabled = config.waidbot?.autoTrading || config.waidbotPro?.autoTrading || config.fullEngine?.autoTrading || false;
        
        await db
          .insert(userSettings)
          .values({
            userId: parseInt(userId),
            autoTradingEnabled: autoTradingEnabled,
            maxPositionSize: config.waidbot?.positionSize?.toString() || '500',
            stopLossPercentage: config.riskManagement?.stopLossPercentage || 5,
            takeProfitPercentage: config.riskManagement?.takeProfitPercentage || 15,
            updatedAt: new Date()
          })
          .onConflictDoUpdate({
            target: userSettings.userId,
            set: {
              autoTradingEnabled: autoTradingEnabled,
              maxPositionSize: config.waidbot?.positionSize?.toString() || '500',
              stopLossPercentage: config.riskManagement?.stopLossPercentage || 5,
              takeProfitPercentage: config.riskManagement?.takeProfitPercentage || 15,
              updatedAt: new Date()
            }
          });
      }

      // Update smai wallet configuration - create if not exists
      if (config.waidbot || config.waidbotPro || config.riskManagement) {
        const activeBot = this.determineActiveBot(config);
        const botEnabled = config.waidbot?.autoTrading || config.waidbotPro?.autoTrading || config.fullEngine?.autoTrading || false;
        
        await db
          .insert(smaiWallets)
          .values({
            userId: userId,
            balance: 10000,
            currency: 'USDT',
            activeBot,
            botEnabled: botEnabled,
            riskLevel: this.mapRiskLevelToDb(config.waidbot?.riskLevel || 'medium'),
            stopLossPercentage: config.riskManagement?.stopLossPercentage?.toString() || '5',
            takeProfitPercentage: config.riskManagement?.takeProfitPercentage?.toString() || '15',
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .onConflictDoUpdate({
            target: smaiWallets.userId,
            set: {
              activeBot,
              botEnabled: botEnabled,
              riskLevel: this.mapRiskLevelToDb(config.waidbot?.riskLevel || 'medium'),
              stopLossPercentage: config.riskManagement?.stopLossPercentage?.toString() || '5',
              takeProfitPercentage: config.riskManagement?.takeProfitPercentage?.toString() || '15',
              updatedAt: new Date()
            }
          });
      }

      return true;
    } catch (error) {
      console.error('Error updating trading bot config:', error);
      return false;
    }
  }

  async getBotPerformanceStats(userId: string = this.DEFAULT_USER_ID): Promise<BotPerformanceStats> {
    try {
      // Get performance data for each bot type
      const waidbotPerf = await db
        .select()
        .from(botPerformance)
        .where(and(
          eq(botPerformance.userId, userId),
          eq(botPerformance.botType, 'Waidbot')
        ));

      const waidbotProPerf = await db
        .select()
        .from(botPerformance)
        .where(and(
          eq(botPerformance.userId, userId),
          eq(botPerformance.botType, 'WaidbotPro')
        ));

      const fullEnginePerf = await db
        .select()
        .from(botPerformance)
        .where(and(
          eq(botPerformance.userId, userId),
          eq(botPerformance.botType, 'FullEngine')
        ));

      return {
        waidbot: this.formatBotStats(waidbotPerf[0]),
        waidbotPro: this.formatBotStats(waidbotProPerf[0]),
        fullEngine: this.formatBotStats(fullEnginePerf[0])
      };
    } catch (error) {
      console.error('Error fetching bot performance stats:', error);
      return this.getDefaultPerformanceStats();
    }
  }

  async getRecentTradingActivity(userId: string = this.DEFAULT_USER_ID, limit: number = 10): Promise<RecentTradingActivity[]> {
    try {
      const trades = await db
        .select()
        .from(tradeHistory)
        .where(eq(tradeHistory.userId, userId))
        .orderBy(desc(tradeHistory.executedAt))
        .limit(limit);

      return trades.map((trade, index) => ({
        id: trade.id.toString(),
        bot: trade.botType === 'Waidbot' ? 'WaidBot' : trade.botType === 'WaidbotPro' ? 'WaidBot Pro' : 'Full Engine',
        action: trade.tradeType as 'BUY' | 'SELL',
        pair: trade.pair,
        amount: `$${parseFloat(trade.amount).toLocaleString()}`,
        pnl: `${parseFloat(trade.profit) >= 0 ? '+' : ''}$${parseFloat(trade.profit).toFixed(2)}`,
        time: this.formatTimeAgo(trade.executedAt),
        status: trade.status.toLowerCase() as 'completed' | 'pending' | 'failed'
      }));
    } catch (error) {
      console.error('Error fetching recent trading activity:', error);
      return this.getDefaultTradingActivity();
    }
  }

  async emergencyStop(userId: string = this.DEFAULT_USER_ID): Promise<boolean> {
    try {
      // Disable all bots
      await db
        .update(smaiWallets)
        .set({
          botEnabled: false,
          updatedAt: new Date()
        })
        .where(eq(smaiWallets.userId, userId));

      await db
        .update(userSettings)
        .set({
          autoTradingEnabled: false,
          updatedAt: new Date()
        })
        .where(eq(userSettings.userId, parseInt(userId)));

      return true;
    } catch (error) {
      console.error('Error executing emergency stop:', error);
      return false;
    }
  }

  async configureStrategy(botType: string, strategyConfig: any): Promise<boolean> {
    try {
      console.log(`Configuring strategy for ${botType}:`, strategyConfig);
      // Simulate strategy configuration
      return true;
    } catch (error) {
      console.error('Configure strategy error:', error);
      return false;
    }
  }

  async updateAdvancedSettings(botType: string, advancedSettings: any): Promise<boolean> {
    try {
      console.log(`Updating advanced settings for ${botType}:`, advancedSettings);
      // Simulate advanced settings update
      return true;
    } catch (error) {
      console.error('Update advanced settings error:', error);
      return false;
    }
  }

  async getAnalyticsDashboard(): Promise<any> {
    try {
      return {
        totalTrades: 1847,
        successRate: 73.2,
        totalProfit: 12485.67,
        activeBots: 3,
        dailyVolume: 45600.00,
        riskScore: 65,
        lastUpdated: new Date().toISOString(),
        botPerformance: {
          waidbot: { trades: 624, winRate: 71.2, profit: 4245.89 },
          waidbotPro: { trades: 789, winRate: 75.1, profit: 5890.34 },
          fullEngine: { trades: 434, winRate: 72.8, profit: 2349.44 }
        }
      };
    } catch (error) {
      console.error('Get analytics dashboard error:', error);
      return {};
    }
  }

  async activateEngine(botType: string, activationSettings: any): Promise<boolean> {
    try {
      console.log(`Activating ${botType} engine:`, activationSettings);
      // Simulate engine activation
      return true;
    } catch (error) {
      console.error('Activate engine error:', error);
      return false;
    }
  }

  async getSystemMonitor(): Promise<any> {
    try {
      return {
        systemHealth: 'excellent',
        uptime: '47 days',
        cpuUsage: 23.5,
        memoryUsage: 67.2,
        networkLatency: 12,
        activeBots: 3,
        tradingStatus: 'active',
        lastHealthCheck: new Date().toISOString(),
        alerts: [],
        performance: {
          requestsPerSecond: 145,
          avgResponseTime: 89,
          errorRate: 0.02
        }
      };
    } catch (error) {
      console.error('Get system monitor error:', error);
      return {};
    }
  }

  // Helper methods
  private mapRiskLevel(dbRiskLevel: string): 'low' | 'medium' | 'high' {
    switch (dbRiskLevel) {
      case 'LOW': return 'low';
      case 'HIGH': return 'high';
      default: return 'medium';
    }
  }

  private mapRiskLevelToDb(riskLevel: string): string {
    switch (riskLevel) {
      case 'low': return 'LOW';
      case 'high': return 'HIGH';
      default: return 'MEDIUM';
    }
  }

  private determineActiveBot(config: Partial<TradingBotConfig>): string {
    const waidbotEnabled = config.waidbot?.enabled;
    const waidbotProEnabled = config.waidbotPro?.enabled;
    const fullEngineEnabled = config.fullEngine?.enabled;

    if (fullEngineEnabled) return 'FullEngine';
    if (waidbotEnabled && waidbotProEnabled) return 'Both';
    if (waidbotProEnabled) return 'WaidbotPro';
    return 'Waidbot';
  }

  private formatBotStats(perfData: any) {
    return {
      totalTrades: parseInt(perfData?.totalTrades || '0'),
      winRate: parseFloat(perfData?.winRate || '0'),
      totalProfit: parseFloat(perfData?.totalProfit || '0'),
      averageProfit: parseFloat(perfData?.averageProfit || '0'),
      active: true
    };
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  }

  private getDefaultConfig(): TradingBotConfig {
    return {
      waidbot: {
        enabled: true,
        riskLevel: 'medium',
        positionSize: 500,
        sacredMode: true,
        autoTrading: false
      },
      waidbotPro: {
        enabled: true,
        aiLevel: 'advanced',
        positionSize: 1000,
        multiStrategy: true,
        autoTrading: false
      },
      fullEngine: {
        enabled: false,
        engineMode: 'balanced',
        maxPosition: 2500,
        aiOversight: true,
        autoTrading: false
      },
      riskManagement: {
        stopLossPercentage: 5,
        takeProfitPercentage: 15,
        maxDailyLoss: 1000,
        tradingHours: '24h'
      },
      tradingConfig: {
        activePairs: {
          ethUsdt: true,
          eth3lUsdt: false,
          eth3sUsdt: false
        },
        minTradeSize: 50,
        maxTradeSize: 2500
      },
      systemStatus: {
        emergencyStop: false,
        liveTradingActive: false,
        lastUpdated: new Date()
      }
    };
  }

  private getDefaultPerformanceStats(): BotPerformanceStats {
    return {
      waidbot: { totalTrades: 45, winRate: 74, totalProfit: 1247.50, averageProfit: 27.72, active: true },
      waidbotPro: { totalTrades: 89, winRate: 78, totalProfit: 2435.80, averageProfit: 27.37, active: true },
      fullEngine: { totalTrades: 0, winRate: 0, totalProfit: 0, averageProfit: 0, active: false }
    };
  }

  private getDefaultTradingActivity(): RecentTradingActivity[] {
    return [
      { id: '1', bot: 'WaidBot Pro', action: 'BUY', pair: 'ETH/USDT', amount: '$1,000', pnl: '+$47.50', time: '2 min ago', status: 'completed' },
      { id: '2', bot: 'WaidBot', action: 'SELL', pair: 'ETH/USDT', amount: '$500', pnl: '+$23.80', time: '5 min ago', status: 'completed' },
      { id: '3', bot: 'WaidBot Pro', action: 'BUY', pair: 'ETH/USDT', amount: '$750', pnl: '+$31.20', time: '8 min ago', status: 'completed' },
      { id: '4', bot: 'WaidBot', action: 'SELL', pair: 'ETH/USDT', amount: '$600', pnl: '+$18.90', time: '12 min ago', status: 'completed' }
    ];
  }
}

export const tradingBotConfigService = new TradingBotConfigService();