import OpenAI from 'openai';

export interface GeneratedStrategy {
  id: string;
  name: string;
  code: string;
  description: string;
  profit: number;
  winRate: number;
  totalTrades: number;
  createdAt: Date;
  lastTestedAt: Date;
  performanceTrend: number;
  riskScore: number;
  isActive: boolean;
  backtestResults: BacktestResult[];
}

export interface BacktestResult {
  initialBalance: number;
  finalBalance: number;
  profit: number;
  trades: TradeLog[];
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  testedAt: Date;
}

export interface TradeLog {
  timestamp: Date;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  balance: number;
  reason: string;
}

export class WaidesKIStrategyAutogen {
  private openai: OpenAI;
  private strategies: GeneratedStrategy[] = [];
  private isGenerating = false;
  private profitThreshold = 50; // Minimum $50 profit to keep strategy

  constructor() {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
  }

  async generateStrategyWithAI(): Promise<string> {
    try {
      const prompt = `
Create a JavaScript function called "generatedStrategy" that implements an ETH trading strategy.

Requirements:
- Function signature: function generatedStrategy(ethData, initialBalance = 1000)
- ethData is array of {timestamp, price, volume} objects
- Must track balance, position, and trades
- Return {finalBalance, trades, maxDrawdown, reason}
- Use only technical indicators: moving averages, RSI, volume analysis
- Be conservative with risk management
- Include stop-loss and take-profit logic

Example strategy ideas:
- Buy on 3% dip with volume spike, sell on 5% gain
- Moving average crossover with volume confirmation
- RSI oversold/overbought with price action
- Support/resistance breakouts with volume

Make the strategy unique and profitable. Include detailed comments explaining the logic.
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 1000
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Strategy generation failed:', error);
      throw new Error('Failed to generate strategy with AI');
    }
  }

  async runBacktest(strategyCode: string, ethData: any[]): Promise<BacktestResult> {
    try {
      // Create a safe sandbox for strategy execution
      const sandbox = {
        Math: Math,
        console: { log: () => {} }, // Disable console output
        Date: Date
      };

      // Create function with limited scope
      const func = new Function(
        'ethData', 'initialBalance', 'sandbox',
        `
        with (sandbox) {
          ${strategyCode}
          return generatedStrategy(ethData, initialBalance);
        }
        `
      );

      const result = func(ethData, 1000, sandbox);

      return {
        initialBalance: 1000,
        finalBalance: result.finalBalance || 1000,
        profit: (result.finalBalance || 1000) - 1000,
        trades: result.trades || [],
        maxDrawdown: result.maxDrawdown || 0,
        sharpeRatio: this.calculateSharpeRatio(result.trades || []),
        winRate: this.calculateWinRate(result.trades || []),
        testedAt: new Date()
      };
    } catch (error) {
      console.error('Backtest execution failed:', error);
      return {
        initialBalance: 1000,
        finalBalance: 1000,
        profit: 0,
        trades: [],
        maxDrawdown: 0,
        sharpeRatio: 0,
        winRate: 0,
        testedAt: new Date()
      };
    }
  }

  async generateAndTestStrategy(ethData: any[]): Promise<GeneratedStrategy | null> {
    if (this.isGenerating) {
      return null;
    }

    this.isGenerating = true;

    try {
      // Generate strategy code
      const strategyCode = await this.generateStrategyWithAI();
      
      // Run backtest
      const backtestResult = await this.runBacktest(strategyCode, ethData);
      
      // Only keep profitable strategies
      if (backtestResult.profit >= this.profitThreshold) {
        const strategy: GeneratedStrategy = {
          id: `autogen_${Date.now()}`,
          name: `AutoGen Strategy #${this.strategies.length + 1}`,
          code: strategyCode,
          description: this.extractStrategyDescription(strategyCode),
          profit: backtestResult.profit,
          winRate: backtestResult.winRate,
          totalTrades: backtestResult.trades.length,
          createdAt: new Date(),
          lastTestedAt: new Date(),
          performanceTrend: 0,
          riskScore: this.calculateRiskScore(backtestResult),
          isActive: true,
          backtestResults: [backtestResult]
        };

        this.strategies.push(strategy);
        console.log(`✅ Generated profitable strategy: ${strategy.name} (Profit: $${strategy.profit.toFixed(2)})`);
        return strategy;
      } else {
        console.log(`❌ Discarded unprofitable strategy (Profit: $${backtestResult.profit.toFixed(2)})`);
        return null;
      }
    } catch (error) {
      console.error('Strategy generation and testing failed:', error);
      return null;
    } finally {
      this.isGenerating = false;
    }
  }

  async evolveStrategies(newEthData: any[]): Promise<void> {
    console.log(`🧬 Evolving ${this.strategies.length} strategies with new data...`);

    for (const strategy of this.strategies) {
      try {
        const newBacktest = await this.runBacktest(strategy.code, newEthData);
        
        // Update performance trend
        const oldProfit = strategy.profit;
        strategy.performanceTrend = newBacktest.profit - oldProfit;
        strategy.profit = newBacktest.profit;
        strategy.winRate = newBacktest.winRate;
        strategy.totalTrades = newBacktest.trades.length;
        strategy.lastTestedAt = new Date();
        strategy.backtestResults.push(newBacktest);
        
        // Keep only last 10 backtest results
        if (strategy.backtestResults.length > 10) {
          strategy.backtestResults = strategy.backtestResults.slice(-10);
        }

        // Deactivate consistently poor performers
        if (strategy.backtestResults.length >= 3) {
          const recentLosses = strategy.backtestResults.slice(-3).filter(r => r.profit < 0).length;
          if (recentLosses >= 2) {
            strategy.isActive = false;
            console.log(`🛑 Deactivated poor performer: ${strategy.name}`);
          }
        }

        console.log(`📊 ${strategy.name}: $${strategy.profit.toFixed(2)} (Trend: ${strategy.performanceTrend >= 0 ? '+' : ''}${strategy.performanceTrend.toFixed(2)})`);
      } catch (error) {
        console.error(`Evolution failed for ${strategy.name}:`, error);
      }
    }

    // Remove inactive strategies older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.strategies = this.strategies.filter(s => 
      s.isActive || s.lastTestedAt > sevenDaysAgo
    );
  }

  private calculateSharpeRatio(trades: TradeLog[]): number {
    if (trades.length < 2) return 0;
    
    const returns = trades.slice(1).map((trade, i) => 
      (trade.balance - trades[i].balance) / trades[i].balance
    );
    
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev === 0 ? 0 : meanReturn / stdDev;
  }

  private calculateWinRate(trades: TradeLog[]): number {
    if (trades.length < 2) return 0;
    
    let wins = 0;
    for (let i = 1; i < trades.length; i++) {
      if (trades[i].balance > trades[i - 1].balance) {
        wins++;
      }
    }
    
    return (wins / (trades.length - 1)) * 100;
  }

  private calculateRiskScore(result: BacktestResult): number {
    // Risk score based on max drawdown and volatility
    const drawdownRisk = Math.min(result.maxDrawdown / 100, 1) * 50;
    const volatilityRisk = Math.abs(result.sharpeRatio) < 0.5 ? 30 : 0;
    return Math.min(drawdownRisk + volatilityRisk, 100);
  }

  private extractStrategyDescription(code: string): string {
    // Extract first comment or create description from code analysis
    const commentMatch = code.match(/\/\*\*(.*?)\*\//s) || code.match(/\/\/(.*)/);
    if (commentMatch) {
      return commentMatch[1].trim().substring(0, 200);
    }
    
    // Fallback: analyze code for key patterns
    if (code.includes('RSI')) return 'RSI-based momentum strategy';
    if (code.includes('moving') || code.includes('average')) return 'Moving average strategy';
    if (code.includes('volume')) return 'Volume-based breakout strategy';
    if (code.includes('support') || code.includes('resistance')) return 'Support/resistance strategy';
    
    return 'Custom algorithmic trading strategy';
  }

  // Public getters
  getStrategies(): GeneratedStrategy[] {
    return [...this.strategies];
  }

  getActiveStrategies(): GeneratedStrategy[] {
    return this.strategies.filter(s => s.isActive);
  }

  getTopPerformers(limit = 5): GeneratedStrategy[] {
    return this.strategies
      .filter(s => s.isActive)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, limit);
  }

  getStrategyById(id: string): GeneratedStrategy | undefined {
    return this.strategies.find(s => s.id === id);
  }

  deleteStrategy(id: string): boolean {
    const index = this.strategies.findIndex(s => s.id === id);
    if (index !== -1) {
      this.strategies.splice(index, 1);
      return true;
    }
    return false;
  }

  getGenerationStats() {
    const active = this.strategies.filter(s => s.isActive).length;
    const totalProfit = this.strategies.reduce((sum, s) => sum + s.profit, 0);
    const avgProfit = this.strategies.length > 0 ? totalProfit / this.strategies.length : 0;
    
    return {
      totalStrategies: this.strategies.length,
      activeStrategies: active,
      totalProfit: totalProfit,
      averageProfit: avgProfit,
      isGenerating: this.isGenerating,
      profitThreshold: this.profitThreshold
    };
  }
}

export const waidesKIStrategyAutogen = new WaidesKIStrategyAutogen();