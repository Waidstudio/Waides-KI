import { waidesKIAutonomousTradeCore } from './waidesKIAutonomousTradeCore';
import { smaiWalletManager } from './smaiWalletManager';
import { waidesKILiveFeed } from './waidesKILiveFeed';

interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
  timestamp: number;
  executionTime?: number;
}

interface TradingStatus {
  isActive: boolean;
  balance: number;
  activeTrades: number;
  totalTrades: number;
  profit: number;
  nextTradeTime?: string;
  takeProfitSet?: boolean;
  stopLossSet?: boolean;
  riskLevel: string;
}

export class WaidesKICommandProcessor {
  private supportedCommands = [
    'activate autonomous trading',
    'deactivate autonomous trading', 
    'start trading',
    'stop trading',
    'check balance',
    'trading status',
    'set take profit',
    'set stop loss',
    'close all trades',
    'trading performance',
    'wallet status'
  ];

  async processCommand(input: string, userId: string = 'user123'): Promise<CommandResult> {
    const startTime = Date.now();
    const normalizedInput = input.toLowerCase().trim();
    
    try {
      // Activate autonomous trading mode
      if (normalizedInput.includes('activate') && normalizedInput.includes('autonomous')) {
        return await this.activateAutonomousTrading(userId);
      }
      
      // Deactivate autonomous trading
      if (normalizedInput.includes('deactivate') && normalizedInput.includes('autonomous')) {
        return await this.deactivateAutonomousTrading(userId);
      }
      
      // Start trading (general)
      if (normalizedInput.includes('start trading')) {
        return await this.activateAutonomousTrading(userId);
      }
      
      // Stop trading
      if (normalizedInput.includes('stop trading')) {
        return await this.deactivateAutonomousTrading(userId);
      }
      
      // Check balance
      if (normalizedInput.includes('balance')) {
        return await this.checkBalance(userId);
      }
      
      // Trading status
      if (normalizedInput.includes('status')) {
        return await this.getTradingStatus(userId);
      }
      
      // Close all trades
      if (normalizedInput.includes('close') && normalizedInput.includes('trade')) {
        return await this.closeAllTrades(userId);
      }
      
      // Performance check
      if (normalizedInput.includes('performance')) {
        return await this.getTradingPerformance(userId);
      }
      
      // Default response for unrecognized commands
      return {
        success: false,
        message: `Command not recognized. Available commands:\n${this.supportedCommands.join('\n')}`,
        timestamp: Date.now(),
        executionTime: Date.now() - startTime
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        executionTime: Date.now() - startTime
      };
    }
  }

  private async activateAutonomousTrading(userId: string): Promise<CommandResult> {
    try {
      // Check wallet balance first
      const walletStats = await smaiWalletManager.getUserWalletStats(userId);
      const balance = walletStats?.wallet?.balance || 0;
      
      if (balance < 100) {
        return {
          success: false,
          message: `❌ Insufficient balance for autonomous trading.\n💰 Current balance: $${balance.toFixed(2)}\n📋 Minimum required: $100.00\n\nPlease deposit funds to start trading.`,
          data: { balance, required: 100 },
          timestamp: Date.now()
        };
      }
      
      // Enable autonomous trading
      waidesKIAutonomousTradeCore.enableAutonomousTrading();
      
      // Get current market data
      const marketData = await waidesKILiveFeed.getUnifiedMarketData();
      const ethPrice = marketData?.price || 2400;
      
      // Calculate trading parameters
      const riskAmount = balance * 0.02; // 2% risk per trade
      const ethAmount = (riskAmount / ethPrice).toFixed(4);
      const takeProfitPrice = (ethPrice * 1.03).toFixed(2); // 3% target
      const stopLossPrice = (ethPrice * 0.98).toFixed(2); // 2% stop loss
      
      const nextScanTime = new Date(Date.now() + 30000); // Next scan in 30 seconds
      
      return {
        success: true,
        message: `✅ Autonomous trading activated successfully!\n\n📊 Trading Parameters:\n💰 Available balance: $${balance.toFixed(2)}\n🎯 Risk per trade: $${riskAmount.toFixed(2)} (2%)\n📈 ETH amount per trade: ${ethAmount} ETH\n🔥 Take profit: $${takeProfitPrice}\n🛡️ Stop loss: $${stopLossPrice}\n\n⏰ Next market scan: ${nextScanTime.toLocaleTimeString()}\n🚀 System is now actively monitoring markets for trading opportunities...`,
        data: {
          balance,
          riskAmount,
          ethAmount,
          takeProfitPrice,
          stopLossPrice,
          nextScanTime: nextScanTime.toISOString()
        },
        timestamp: Date.now()
      };
      
    } catch (error) {
      return {
        success: false,
        message: `❌ Failed to activate autonomous trading: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };
    }
  }

  private async deactivateAutonomousTrading(userId: string): Promise<CommandResult> {
    try {
      // Get current status before disabling
      const stats = waidesKIAutonomousTradeCore.getAutonomousStatistics();
      const activeTrades = stats.total_trades_executed || 0;
      
      // Disable autonomous trading
      waidesKIAutonomousTradeCore.disableAutonomousTrading();
      
      return {
        success: true,
        message: `🛑 Autonomous trading deactivated.\n\n📊 Session Summary:\n🔢 Total trades executed: ${activeTrades}\n💰 Session profit: $${stats.total_autonomous_profit.toFixed(2)}\n📈 Win rate: ${stats.autonomous_win_rate.toFixed(1)}%\n\n⚠️ All active positions remain open. Use "close all trades" to exit positions.`,
        data: {
          totalTrades: activeTrades,
          profit: stats.total_autonomous_profit,
          winRate: stats.autonomous_win_rate
        },
        timestamp: Date.now()
      };
      
    } catch (error) {
      return {
        success: false,
        message: `❌ Failed to deactivate trading: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };
    }
  }

  private async checkBalance(userId: string): Promise<CommandResult> {
    try {
      const walletStats = await smaiWalletManager.getUserWalletStats(userId);
      const balance = walletStats?.wallet?.balance || 0;
      const totalProfit = walletStats?.wallet?.totalProfit || 0;
      const totalTrades = walletStats?.wallet?.totalTrades || 0;
      const winRate = walletStats?.wallet?.winRate || 0;
      
      return {
        success: true,
        message: `💰 Wallet Balance: $${balance.toFixed(2)}\n📈 Total profit: $${totalProfit.toFixed(2)}\n🔢 Total trades: ${totalTrades}\n🎯 Win rate: ${winRate.toFixed(1)}%\n\n${balance >= 100 ? '✅ Balance sufficient for trading' : '⚠️ Minimum $100 required for autonomous trading'}`,
        data: {
          balance,
          totalProfit,
          totalTrades,
          winRate,
          canTrade: balance >= 100
        },
        timestamp: Date.now()
      };
      
    } catch (error) {
      return {
        success: false,
        message: `❌ Failed to check balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };
    }
  }

  private async getTradingStatus(userId: string): Promise<CommandResult> {
    try {
      const stats = waidesKIAutonomousTradeCore.getAutonomousStatistics();
      const isActive = waidesKIAutonomousTradeCore.isAutonomousActive();
      const walletStats = await smaiWalletManager.getUserWalletStats(userId);
      const balance = walletStats?.wallet?.balance || 0;
      
      const activeTradesCount = waidesKIAutonomousTradeCore.getActiveTrades().length;
      const lastTradeTime = stats.last_autonomous_trade ? new Date(stats.last_autonomous_trade) : null;
      
      return {
        success: true,
        message: `📊 Trading Status Report:\n\n🔄 Autonomous mode: ${isActive ? '✅ ACTIVE' : '❌ INACTIVE'}\n💰 Balance: $${balance.toFixed(2)}\n🔢 Active trades: ${activeTradesCount}\n📈 Total trades: ${stats.total_trades_executed}\n💵 Total profit: $${stats.total_autonomous_profit.toFixed(2)}\n🎯 Win rate: ${stats.autonomous_win_rate.toFixed(1)}%\n⏰ Last trade: ${lastTradeTime ? lastTradeTime.toLocaleString() : 'None'}\n\n${isActive ? '🚀 System actively monitoring markets...' : '⏸️ Trading paused - use "activate autonomous trading" to resume'}`,
        data: {
          isActive,
          balance,
          activeTradesCount,
          totalTrades: stats.total_trades_executed,
          profit: stats.total_autonomous_profit,
          winRate: stats.autonomous_win_rate,
          lastTrade: lastTradeTime?.toISOString()
        },
        timestamp: Date.now()
      };
      
    } catch (error) {
      return {
        success: false,
        message: `❌ Failed to get trading status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };
    }
  }

  private async closeAllTrades(userId: string): Promise<CommandResult> {
    try {
      const closedCount = await waidesKIAutonomousTradeCore.forceCloseAllTrades();
      
      return {
        success: true,
        message: `🔒 Closed ${closedCount} active trades.\n\n${closedCount > 0 ? '💰 All positions have been liquidated and profits/losses realized.' : '📝 No active trades to close.'}`,
        data: {
          closedTrades: closedCount
        },
        timestamp: Date.now()
      };
      
    } catch (error) {
      return {
        success: false,
        message: `❌ Failed to close trades: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };
    }
  }

  private async getTradingPerformance(userId: string): Promise<CommandResult> {
    try {
      const stats = waidesKIAutonomousTradeCore.getAutonomousStatistics();
      const walletStats = await smaiWalletManager.getUserWalletStats(userId);
      const recentTrades = walletStats?.recentTrades || [];
      
      const last24h = recentTrades.filter(trade => 
        Date.now() - new Date(trade.timestamp).getTime() < 24 * 60 * 60 * 1000
      );
      
      const todayProfit = last24h.reduce((sum, trade) => sum + trade.profit, 0);
      const todayTrades = last24h.length;
      
      return {
        success: true,
        message: `📊 Trading Performance:\n\n🏆 Overall Stats:\n💰 Total profit: $${stats.total_autonomous_profit.toFixed(2)}\n🔢 Total trades: ${stats.total_trades_executed}\n🎯 Win rate: ${stats.autonomous_win_rate.toFixed(1)}%\n📈 Effectiveness: ${stats.autonomy_effectiveness}%\n\n📅 Today's Performance:\n💵 Profit: $${todayProfit.toFixed(2)}\n🔢 Trades: ${todayTrades}\n⏰ Uptime: ${stats.uptime_percentage.toFixed(1)}%`,
        data: {
          totalProfit: stats.total_autonomous_profit,
          totalTrades: stats.total_trades_executed,
          winRate: stats.autonomous_win_rate,
          effectiveness: stats.autonomy_effectiveness,
          todayProfit,
          todayTrades,
          uptime: stats.uptime_percentage
        },
        timestamp: Date.now()
      };
      
    } catch (error) {
      return {
        success: false,
        message: `❌ Failed to get performance data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };
    }
  }

  getSupportedCommands(): string[] {
    return [...this.supportedCommands];
  }
}

export const waidesKICommandProcessor = new WaidesKICommandProcessor();