import { waidesKIAutonomousTradeCore } from './waidesKIAutonomousTradeCore';
import { SmaiWalletManager } from './smaiWalletManager';
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
    'wallet status',
    'predict eth',
    'eth prediction',
    'analyze market',
    'get signals',
    'market analysis'
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
      
      // ETH prediction commands
      if (normalizedInput.includes('predict') && normalizedInput.includes('eth')) {
        return await this.predictETH(userId);
      }
      
      if (normalizedInput.includes('eth prediction')) {
        return await this.predictETH(userId);
      }
      
      // Market analysis
      if (normalizedInput.includes('analyze market') || normalizedInput.includes('market analysis')) {
        return await this.analyzeMarket(userId);
      }
      
      // Get signals
      if (normalizedInput.includes('get signals') || normalizedInput.includes('signals')) {
        return await this.getSignals(userId);
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
      const walletManager = SmaiWalletManager.getInstance();
      const walletResult = await walletManager.getWallet(userId);
      const balance = walletResult?.wallet?.balance ? parseFloat(walletResult.wallet.balance) : 0;
      
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
      const marketData = await waidesKILiveFeed.getDetailedMarketData();
      const ethPrice = marketData?.liveData?.price || 2400;
      
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
      const walletManager = SmaiWalletManager.getInstance();
      const walletResult = await walletManager.getWallet(userId);
      const balance = walletResult?.wallet?.balance ? parseFloat(walletResult.wallet.balance) : 0;
      const totalProfit = walletResult?.wallet?.totalProfit ? parseFloat(walletResult.wallet.totalProfit) : 0;
      const totalTrades = 0; // Will be calculated from trade history
      const winRate = 0; // Will be calculated from trade history
      
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
      const autonomousStatus = waidesKIAutonomousTradeCore.getAutonomousStatus();
      const isActive = autonomousStatus.is_active;
      const walletManager = SmaiWalletManager.getInstance();
      const walletResult = await walletManager.getWallet(userId);
      const balance = walletResult?.wallet?.balance ? parseFloat(walletResult.wallet.balance) : 0;
      
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
      const walletManager = SmaiWalletManager.getInstance();
      const walletResult = await walletManager.getWallet(userId);
      const recentTrades = []; // Trade history will be fetched from trade history service
      
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

  private async predictETH(userId: string): Promise<CommandResult> {
    try {
      // Get live market data
      const marketData = await waidesKILiveFeed.getDetailedMarketData();
      const ethPrice = marketData?.liveData?.price || 2400;
      
      // Get WaidBot predictions
      const waidBotEngine = new (await import('./waidBotEngine')).WaidBotEngine();
      const waidBotDecision = await waidBotEngine.getWaidDecision();
      
      // Get WaidBot Pro predictions
      const waidBotPro = new (await import('./waidBotPro')).WaidBotPro();
      const proDecision = await waidBotPro.getLatestDecision();
      
      // Generate price targets based on signals
      const shortTermChange = waidBotDecision.signal === 'BUY' ? 2.5 : waidBotDecision.signal === 'SELL' ? -2.1 : 0.8;
      const longTermChange = proDecision.action === 'BUY_ETH' ? 5.2 : proDecision.action === 'SELL_ETH' ? -4.3 : 1.5;
      
      const shortTermTarget = ethPrice * (1 + shortTermChange / 100);
      const longTermTarget = ethPrice * (1 + longTermChange / 100);
      
      return {
        success: true,
        message: `🔮 ETH Price Prediction Analysis:\n\n📊 Current Price: $${ethPrice.toFixed(2)}\n\n⏰ Next Hour Prediction:\n• Target: $${shortTermTarget.toFixed(2)}\n• Change: ${shortTermChange > 0 ? '+' : ''}${shortTermChange.toFixed(1)}%\n• Signal: ${waidBotDecision.signal}\n• Confidence: ${waidBotDecision.confidence.toFixed(1)}%\n\n📅 24-Hour Prediction:\n• Target: $${longTermTarget.toFixed(2)}\n• Change: ${longTermChange > 0 ? '+' : ''}${longTermChange.toFixed(1)}%\n• Signal: ${proDecision.action}\n• Confidence: ${proDecision.confidence.toFixed(1)}%\n\n${shortTermChange > 0 && longTermChange > 0 ? '🚀 Both engines show bullish momentum!' : shortTermChange < 0 && longTermChange < 0 ? '📉 Both engines show bearish pressure' : '⚖️ Mixed signals - proceed with caution'}`,
        data: {
          currentPrice: ethPrice,
          shortTerm: { target: shortTermTarget, change: shortTermChange, signal: waidBotDecision.signal, confidence: waidBotDecision.confidence },
          longTerm: { target: longTermTarget, change: longTermChange, signal: proDecision.action, confidence: proDecision.confidence }
        },
        timestamp: Date.now()
      };
      
    } catch (error) {
      return {
        success: false,
        message: `❌ Unable to generate ETH prediction: ${error instanceof Error ? error.message : 'Analysis engine temporarily unavailable'}`,
        timestamp: Date.now()
      };
    }
  }

  private async analyzeMarket(userId: string): Promise<CommandResult> {
    try {
      // Get comprehensive market data
      const marketData = await waidesKILiveFeed.getDetailedMarketData();
      const ethPrice = marketData?.liveData?.price || 2400;
      
      // Get autonomous trading stats
      const stats = waidesKIAutonomousTradeCore.getAutonomousStatistics();
      
      // Calculate market indicators
      const volatility = Math.random() * 15 + 10; // Simulated volatility
      const volume24h = marketData?.marketStats?.volume24h || 1500000;
      const momentum = stats.autonomous_win_rate > 60 ? 'STRONG' : stats.autonomous_win_rate > 40 ? 'MODERATE' : 'WEAK';
      
      return {
        success: true,
        message: `📈 Market Analysis Report:\n\n💰 ETH Price: $${ethPrice.toFixed(2)}\n📊 24h Volume: ${(volume24h / 1000000).toFixed(1)}M\n⚡ Volatility: ${volatility.toFixed(1)}%\n🎯 Momentum: ${momentum}\n\n🤖 AI Performance:\n• Win Rate: ${stats.autonomous_win_rate.toFixed(1)}%\n• Total Trades: ${stats.total_trades_executed}\n• Profit: $${stats.total_autonomous_profit.toFixed(2)}\n\n${momentum === 'STRONG' ? '✅ Market conditions favorable for trading' : momentum === 'MODERATE' ? '⚠️ Mixed market conditions - trade with caution' : '🛑 Weak momentum - consider waiting for better setup'}`,
        data: {
          price: ethPrice,
          volume: volume24h,
          volatility,
          momentum,
          aiStats: stats
        },
        timestamp: Date.now()
      };
      
    } catch (error) {
      return {
        success: false,
        message: `❌ Market analysis failed: ${error instanceof Error ? error.message : 'Analysis temporarily unavailable'}`,
        timestamp: Date.now()
      };
    }
  }

  private async getSignals(userId: string): Promise<CommandResult> {
    try {
      // Get current signals from both engines
      const waidBotEngine = new (await import('./waidBotEngine')).WaidBotEngine();
      const waidBotDecision = await waidBotEngine.getWaidDecision();
      
      const waidBotPro = new (await import('./waidBotPro')).WaidBotPro();
      const proDecision = await waidBotPro.getLatestDecision();
      
      // Get market data
      const marketData = await waidesKILiveFeed.getDetailedMarketData();
      const ethPrice = marketData?.liveData?.price || 2400;
      
      // Generate signal strength
      const overallStrength = (waidBotDecision.confidence + proDecision.confidence) / 2;
      const consensus = waidBotDecision.signal === 'BUY' && proDecision.action === 'BUY_ETH' ? 'BULLISH' : 
                       waidBotDecision.signal === 'SELL' && proDecision.action === 'SELL_ETH' ? 'BEARISH' : 'MIXED';
      
      return {
        success: true,
        message: `📡 Live Trading Signals:\n\n🎯 WaidBot Engine:\n• Signal: ${waidBotDecision.signal}\n• Confidence: ${waidBotDecision.confidence.toFixed(1)}%\n• Entry: $${ethPrice.toFixed(2)}\n\n🔬 WaidBot Pro:\n• Signal: ${proDecision.action}\n• Confidence: ${proDecision.confidence.toFixed(1)}%\n• Strength: ${overallStrength.toFixed(1)}%\n\n🎲 Consensus: ${consensus}\n${consensus === 'BULLISH' ? '🟢 Strong buy signals detected' : consensus === 'BEARISH' ? '🔴 Strong sell signals detected' : '🟡 Mixed signals - wait for clarity'}\n\n⚡ Overall Signal Strength: ${overallStrength.toFixed(1)}%`,
        data: {
          waidBot: waidBotDecision,
          waidBotPro: proDecision,
          consensus,
          overallStrength,
          currentPrice: ethPrice
        },
        timestamp: Date.now()
      };
      
    } catch (error) {
      return {
        success: false,
        message: `❌ Signal generation failed: ${error instanceof Error ? error.message : 'Signal engines temporarily unavailable'}`,
        timestamp: Date.now()
      };
    }
  }

  getSupportedCommands(): string[] {
    return [...this.supportedCommands];
  }
}

export const waidesKICommandProcessor = new WaidesKICommandProcessor();