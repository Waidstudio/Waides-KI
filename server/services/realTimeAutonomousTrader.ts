import { EventEmitter } from 'events';

interface DemoBalance {
  usdt: number;
  eth: number;
  btc: number;
  sol: number;
  totalValue: number;
  availableForTrading: number;
}

interface Trade {
  id: string;
  timestamp: number;
  action: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  price: number;
  quantity: number;
  amount: number;
  confidence: number;
  reason: string;
  strategy: string;
}

interface AutonomousTraderState {
  isActive: boolean;
  isRunning: boolean;
  currentBalance: DemoBalance;
  trades: Trade[];
  performance: {
    totalTrades: number;
    winRate: number;
    profit: number;
    todayTrades: number;
  };
  currentAction: string;
  nextAction: string;
  confidence: number;
  startTime?: number;
  tradingInterval?: NodeJS.Timeout;
  activeStrategies: string[];
  scanningPairs: string[];
}

export class RealTimeAutonomousTrader extends EventEmitter {
  private state: AutonomousTraderState;
  private readonly DEMO_STARTING_BALANCE = 20000; // $20,000 USDT
  private readonly MIN_TRADE_AMOUNT = 150; // Minimum $150 per trade
  private readonly MAX_TRADE_PERCENTAGE = 0.08; // Max 8% of balance per trade
  private readonly TRADING_INTERVAL = 30000; // 30 second intervals
  private readonly STRATEGIES = ['Trend Following', 'Mean Reversion', 'Breakout', 'Momentum', 'Volume Profile'];
  private readonly TRADING_PAIRS = ['ETH/USDT', 'BTC/USDT', 'SOL/USDT'];

  constructor() {
    super();
    this.state = this.initializeState();
  }

  private initializeState(): AutonomousTraderState {
    return {
      isActive: false,
      isRunning: false,
      currentBalance: {
        usdt: this.DEMO_STARTING_BALANCE,
        eth: 0,
        btc: 0,
        sol: 0,
        totalValue: this.DEMO_STARTING_BALANCE,
        availableForTrading: this.DEMO_STARTING_BALANCE
      },
      trades: [],
      performance: {
        totalTrades: 0,
        winRate: 0,
        profit: 0,
        todayTrades: 0
      },
      currentAction: 'New account - Ready for first activation',
      nextAction: 'Begin 24/7 autonomous market scanning',
      confidence: 0,
      activeStrategies: [],
      scanningPairs: []
    };
  }

  public async start(): Promise<{ success: boolean; message: string }> {
    if (this.state.isRunning) {
      return { success: false, message: 'Autonomous Trader is already running' };
    }

    try {
      this.state.isActive = true;
      this.state.isRunning = true;
      this.state.startTime = Date.now();
      this.state.currentAction = 'Initializing 24/7 autonomous trading system...';
      this.state.nextAction = 'Multi-strategy market analysis across ETH, BTC, SOL';
      this.state.activeStrategies = [...this.STRATEGIES];
      this.state.scanningPairs = [...this.TRADING_PAIRS];

      // Start the trading loop
      this.state.tradingInterval = setInterval(() => {
        this.executeTradeDecision();
      }, this.TRADING_INTERVAL);

      // Execute first decision immediately
      setTimeout(() => {
        this.executeTradeDecision();
      }, 5000);

      this.emit('started', this.getStatus());
      
      console.log('🤖 Autonomous Trader started with 24/7 multi-strategy scanning');
      return { 
        success: true, 
        message: `Autonomous Trader started - 24/7 market scanning with $${this.state.currentBalance.usdt.toLocaleString()} demo balance` 
      };
    } catch (error) {
      console.error('❌ Error starting Autonomous Trader:', error);
      return { success: false, message: 'Failed to start Autonomous Trader' };
    }
  }

  public async stop(): Promise<{ success: boolean; message: string }> {
    if (!this.state.isRunning) {
      return { success: false, message: 'Autonomous Trader is not running' };
    }

    try {
      this.state.isActive = false;
      this.state.isRunning = false;
      this.state.currentAction = 'Stopped - 24/7 scanning disabled';
      this.state.nextAction = 'Awaiting manual restart';
      this.state.activeStrategies = [];
      this.state.scanningPairs = [];

      if (this.state.tradingInterval) {
        clearInterval(this.state.tradingInterval);
        this.state.tradingInterval = undefined;
      }

      this.emit('stopped', this.getStatus());
      
      console.log('🛑 Autonomous Trader stopped');
      return { success: true, message: 'Autonomous Trader stopped successfully' };
    } catch (error) {
      console.error('❌ Error stopping Autonomous Trader:', error);
      return { success: false, message: 'Failed to stop Autonomous Trader' };
    }
  }

  private async executeTradeDecision(): Promise<void> {
    if (!this.state.isRunning) return;

    try {
      // Simulate scanning multiple markets
      const marketData = await this.getMultiMarketData();
      const bestOpportunity = this.analyzeBestOpportunity(marketData);

      this.state.currentAction = `Scanning ${this.state.scanningPairs.length} pairs - Best: ${bestOpportunity.symbol}`;
      this.state.confidence = bestOpportunity.confidence;

      if (bestOpportunity.action === 'BUY' && this.shouldExecuteTrade(bestOpportunity)) {
        await this.executeBuyOrder(bestOpportunity);
      } else if (bestOpportunity.action === 'SELL' && this.hasPositionFor(bestOpportunity.symbol)) {
        await this.executeSellOrder(bestOpportunity);
      } else if (bestOpportunity.action === 'HOLD') {
        this.state.nextAction = `Monitoring ${this.getActivePositionsCount()} positions - next scan in 30s`;
      } else {
        this.state.nextAction = `Waiting for ${bestOpportunity.strategy} signal - scanning continues`;
      }

      this.emit('decision', { decision: bestOpportunity, marketData, status: this.getStatus() });
    } catch (error) {
      console.error('❌ Error in Autonomous Trader decision:', error);
      this.state.currentAction = 'Error in multi-market analysis - retrying...';
    }
  }

  private async getMultiMarketData() {
    // Simulate real-time data for ETH, BTC, SOL
    const baseTime = Date.now();
    const trendCycle = Math.sin(baseTime / 180000) * 100; // 3-minute trend cycle
    
    return {
      ETH: {
        price: 3200 + trendCycle + (Math.random() - 0.5) * 50,
        volume: 25000000000 + Math.random() * 15000000000,
        change24h: (Math.random() - 0.5) * 8,
        rsi: 30 + Math.random() * 40,
        ma_20: 3180 + trendCycle * 0.8
      },
      BTC: {
        price: 65000 + trendCycle * 200 + (Math.random() - 0.5) * 1000,
        volume: 18000000000 + Math.random() * 10000000000,
        change24h: (Math.random() - 0.5) * 6,
        rsi: 35 + Math.random() * 30,
        ma_20: 64500 + trendCycle * 150
      },
      SOL: {
        price: 180 + trendCycle * 5 + (Math.random() - 0.5) * 15,
        volume: 2000000000 + Math.random() * 1500000000,
        change24h: (Math.random() - 0.5) * 12,
        rsi: 25 + Math.random() * 50,
        ma_20: 175 + trendCycle * 3
      },
      timestamp: baseTime
    };
  }

  private analyzeBestOpportunity(marketData: any) {
    const opportunities = [];

    // Analyze each market with different strategies
    for (const symbol of ['ETH', 'BTC', 'SOL']) {
      const data = marketData[symbol];
      const strategies = this.analyzeMarketStrategies(symbol, data);
      opportunities.push(...strategies);
    }

    // Sort by confidence and return best opportunity
    opportunities.sort((a, b) => b.confidence - a.confidence);
    
    return opportunities[0] || {
      action: 'HOLD' as const,
      symbol: 'ETH/USDT',
      confidence: 60,
      reason: 'No high-confidence opportunities detected',
      strategy: 'Market Scanning',
      price: marketData.ETH.price
    };
  }

  private analyzeMarketStrategies(symbol: string, data: any) {
    const strategies = [];
    const pair = `${symbol}/USDT`;

    // Trend Following Strategy
    const trendConfidence = this.calculateTrendConfidence(data);
    if (trendConfidence > 75 && data.price > data.ma_20) {
      strategies.push({
        action: 'BUY' as const,
        symbol: pair,
        confidence: trendConfidence,
        reason: `Trend Following: ${symbol} above MA20, strong uptrend detected`,
        strategy: 'Trend Following',
        price: data.price
      });
    }

    // Mean Reversion Strategy
    if (data.rsi < 30 && data.change24h < -4) {
      strategies.push({
        action: 'BUY' as const,
        symbol: pair,
        confidence: 70 + Math.random() * 15,
        reason: `Mean Reversion: ${symbol} oversold (RSI: ${data.rsi.toFixed(1)})`,
        strategy: 'Mean Reversion',
        price: data.price
      });
    }

    // Momentum Strategy
    if (data.change24h > 5 && data.volume > 20000000000) {
      strategies.push({
        action: 'BUY' as const,
        symbol: pair,
        confidence: 80 + Math.random() * 10,
        reason: `Momentum: ${symbol} strong momentum (+${data.change24h.toFixed(1)}%) with high volume`,
        strategy: 'Momentum',
        price: data.price
      });
    }

    // Exit Strategy
    if (this.hasPositionFor(pair) && (data.rsi > 70 || data.change24h < -6)) {
      strategies.push({
        action: 'SELL' as const,
        symbol: pair,
        confidence: 85,
        reason: `Exit: ${symbol} overbought or stop-loss triggered`,
        strategy: 'Risk Management',
        price: data.price
      });
    }

    return strategies;
  }

  private calculateTrendConfidence(data: any): number {
    let confidence = 60;
    
    if (data.price > data.ma_20) confidence += 15;
    if (data.change24h > 0) confidence += 10;
    if (data.volume > 20000000000) confidence += 10;
    if (data.rsi > 40 && data.rsi < 70) confidence += 10;
    
    return Math.min(95, confidence + (Math.random() - 0.5) * 10);
  }

  private shouldExecuteTrade(opportunity: any): boolean {
    return opportunity.confidence > 75 && 
           this.state.currentBalance.usdt >= this.MIN_TRADE_AMOUNT &&
           this.state.currentBalance.availableForTrading >= this.MIN_TRADE_AMOUNT;
  }

  private hasPositionFor(symbol: string): boolean {
    if (symbol.includes('ETH')) return this.state.currentBalance.eth > 0.01;
    if (symbol.includes('BTC')) return this.state.currentBalance.btc > 0.001;
    if (symbol.includes('SOL')) return this.state.currentBalance.sol > 0.1;
    return false;
  }

  private getActivePositionsCount(): number {
    let count = 0;
    if (this.state.currentBalance.eth > 0.01) count++;
    if (this.state.currentBalance.btc > 0.001) count++;
    if (this.state.currentBalance.sol > 0.1) count++;
    return count;
  }

  private async executeBuyOrder(opportunity: any): Promise<void> {
    try {
      const tradeAmount = Math.min(
        this.state.currentBalance.availableForTrading * this.MAX_TRADE_PERCENTAGE,
        this.state.currentBalance.usdt * 0.4 // Max 40% of USDT balance
      );

      if (tradeAmount < this.MIN_TRADE_AMOUNT) return;

      const quantity = tradeAmount / opportunity.price;
      
      // Execute trade
      this.state.currentBalance.usdt -= tradeAmount;
      
      // Add to appropriate balance
      if (opportunity.symbol.includes('ETH')) {
        this.state.currentBalance.eth += quantity;
      } else if (opportunity.symbol.includes('BTC')) {
        this.state.currentBalance.btc += quantity;
      } else if (opportunity.symbol.includes('SOL')) {
        this.state.currentBalance.sol += quantity;
      }
      
      this.state.currentBalance.availableForTrading = this.state.currentBalance.usdt;

      const trade: Trade = {
        id: `BUY_${opportunity.symbol.replace('/', '')}_${Date.now()}`,
        timestamp: Date.now(),
        action: 'BUY',
        symbol: opportunity.symbol,
        price: opportunity.price,
        quantity,
        amount: tradeAmount,
        confidence: opportunity.confidence,
        reason: opportunity.reason,
        strategy: opportunity.strategy
      };

      this.state.trades.unshift(trade);
      this.state.performance.totalTrades++;
      this.state.performance.todayTrades++;
      
      this.updateTotalValue();
      
      this.state.currentAction = `Bought ${quantity.toFixed(6)} ${opportunity.symbol.split('/')[0]} at $${opportunity.price.toFixed(2)}`;
      this.state.nextAction = 'Continuing 24/7 market scanning for next opportunity';

      console.log(`🟢 Autonomous Trader BUY: ${quantity.toFixed(6)} ${opportunity.symbol} at $${opportunity.price.toFixed(2)} (${opportunity.strategy})`);
      
      this.emit('trade', trade);
    } catch (error) {
      console.error('❌ Error executing Autonomous Trader buy order:', error);
    }
  }

  private async executeSellOrder(opportunity: any): Promise<void> {
    try {
      let quantity = 0;
      if (opportunity.symbol.includes('ETH')) {
        quantity = this.state.currentBalance.eth;
        this.state.currentBalance.eth = 0;
      } else if (opportunity.symbol.includes('BTC')) {
        quantity = this.state.currentBalance.btc;
        this.state.currentBalance.btc = 0;
      } else if (opportunity.symbol.includes('SOL')) {
        quantity = this.state.currentBalance.sol;
        this.state.currentBalance.sol = 0;
      }

      const tradeAmount = quantity * opportunity.price;
      
      // Calculate profit/loss
      const lastBuyTrade = this.state.trades.find(t => 
        t.action === 'BUY' && t.symbol === opportunity.symbol
      );
      const profitLoss = lastBuyTrade ? tradeAmount - lastBuyTrade.amount : 0;
      
      // Execute trade
      this.state.currentBalance.usdt += tradeAmount;
      this.state.currentBalance.availableForTrading = this.state.currentBalance.usdt;

      const trade: Trade = {
        id: `SELL_${opportunity.symbol.replace('/', '')}_${Date.now()}`,
        timestamp: Date.now(),
        action: 'SELL',
        symbol: opportunity.symbol,
        price: opportunity.price,
        quantity,
        amount: tradeAmount,
        confidence: opportunity.confidence,
        reason: opportunity.reason,
        strategy: opportunity.strategy
      };

      this.state.trades.unshift(trade);
      this.state.performance.totalTrades++;
      this.state.performance.todayTrades++;
      this.state.performance.profit += profitLoss;
      
      // Update win rate
      if (profitLoss > 0) {
        const sellTrades = this.state.trades.filter(t => t.action === 'SELL');
        const winningTrades = sellTrades.filter(t => {
          const buyTrade = this.state.trades.find(bt => bt.action === 'BUY' && bt.symbol === t.symbol && bt.timestamp < t.timestamp);
          return buyTrade && t.amount > buyTrade.amount;
        });
        this.state.performance.winRate = Math.round((winningTrades.length / Math.max(1, sellTrades.length)) * 100);
      }
      
      this.updateTotalValue();
      
      this.state.currentAction = `Sold ${quantity.toFixed(6)} ${opportunity.symbol.split('/')[0]} at $${opportunity.price.toFixed(2)} (${profitLoss > 0 ? '+' : ''}$${profitLoss.toFixed(2)})`;
      this.state.nextAction = 'Continuing autonomous market scanning';

      console.log(`🔴 Autonomous Trader SELL: ${quantity.toFixed(6)} ${opportunity.symbol} at $${opportunity.price.toFixed(2)} (${opportunity.strategy}) PnL: $${profitLoss.toFixed(2)}`);
      
      this.emit('trade', trade);
    } catch (error) {
      console.error('❌ Error executing Autonomous Trader sell order:', error);
    }
  }

  private updateTotalValue(): void {
    // Use estimated current prices for total value calculation
    const ethPrice = 3200;
    const btcPrice = 65000;
    const solPrice = 180;
    
    this.state.currentBalance.totalValue = 
      this.state.currentBalance.usdt + 
      (this.state.currentBalance.eth * ethPrice) + 
      (this.state.currentBalance.btc * btcPrice) + 
      (this.state.currentBalance.sol * solPrice);
  }

  public getStatus() {
    return {
      id: 'autonomous',
      name: 'Autonomous Trader',
      isActive: this.state.isActive,
      isRunning: this.state.isRunning,
      currentBalance: this.state.currentBalance,
      performance: {
        ...this.state.performance,
        profit: this.state.currentBalance.totalValue - this.DEMO_STARTING_BALANCE
      },
      currentAction: this.state.currentAction,
      nextAction: this.state.nextAction,
      confidence: this.state.confidence,
      recentTrades: this.state.trades.slice(0, 5),
      uptime: this.state.startTime ? Date.now() - this.state.startTime : 0,
      activeStrategies: this.state.activeStrategies,
      scanningPairs: this.state.scanningPairs,
      activePositions: this.getActivePositionsCount()
    };
  }

  public getTradeHistory(): Trade[] {
    return this.state.trades;
  }

  public reset(): void {
    if (this.state.tradingInterval) {
      clearInterval(this.state.tradingInterval);
    }
    this.state = this.initializeState();
  }
}

// Create singleton instance
export const realTimeAutonomousTrader = new RealTimeAutonomousTrader();