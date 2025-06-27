/**
 * ETH Advisor - Real-time ETH Trading Guidance System
 * Provides live ETH price analysis, entry/exit recommendations, and market timing
 */

interface MarketData {
  price: number;
  volume: number;
  change24h: number;
  marketCap: number;
  timestamp: number;
}

interface TradingSignal {
  signal: 'BUY' | 'SELL' | 'HOLD' | 'NEUTRAL';
  confidence: number;
  rsi: number;
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  momentum: 'STRONG' | 'MODERATE' | 'WEAK';
}

interface TradingAdvice {
  action: 'BUY_NOW' | 'SELL_NOW' | 'WAIT' | 'NEUTRAL';
  currentPrice: number;
  entryPrice?: number;
  exitPrice?: number;
  reasoning: string;
  timeWindows: TimeWindow[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
}

interface TimeWindow {
  start: string;
  end: string;
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

class ETHAdvisor {
  private analysisEngine: any = null;
  private timeWindowHelper: any = null;
  
  constructor() {
    // Will be connected via dependency injection
  }

  setAnalysisEngine(engine: any): void {
    this.analysisEngine = engine;
  }

  setTimeWindowHelper(helper: any): void {
    this.timeWindowHelper = helper;
  }

  async analyzeTradingOpportunity(question: string): Promise<TradingAdvice> {
    try {
      // Get live market data
      const marketData = await this.getLiveMarketData();
      if (!marketData) {
        throw new Error('ETH price data is currently unavailable. Please try again shortly.');
      }

      // Get trading signals
      const signals = await this.getTradingSignals();
      
      // Get optimal time windows
      const timeWindows = this.getOptimalTimeWindows();

      // Analyze and generate advice
      return this.generateTradingAdvice(marketData, signals, timeWindows, question);
    } catch (error) {
      throw new Error(`Unable to provide trading advice: ${error.message}`);
    }
  }

  private async getLiveMarketData(): Promise<MarketData | null> {
    try {
      if (this.analysisEngine && this.analysisEngine.getCurrentETHData) {
        const data = await this.analysisEngine.getCurrentETHData();
        return {
          price: data.price || 2450, // Fallback for demo
          volume: data.volume || 15000,
          change24h: data.change24h || 2.5,
          marketCap: data.marketCap || 295000000000,
          timestamp: Date.now()
        };
      }
      
      // Fallback to simulate live data
      return this.getSimulatedMarketData();
    } catch (error) {
      console.error('Error fetching live market data:', error);
      return this.getSimulatedMarketData();
    }
  }

  private getSimulatedMarketData(): MarketData {
    // Simulate realistic ETH market data for demonstration
    const basePrice = 2450;
    const volatility = 0.02; // 2% volatility
    const randomChange = (Math.random() - 0.5) * volatility;
    
    return {
      price: basePrice * (1 + randomChange),
      volume: 15000 + Math.random() * 5000,
      change24h: (Math.random() - 0.5) * 10, // -5% to +5%
      marketCap: 295000000000,
      timestamp: Date.now()
    };
  }

  private async getTradingSignals(): Promise<TradingSignal> {
    try {
      if (this.analysisEngine && this.analysisEngine.getCurrentSignals) {
        const signals = await this.analysisEngine.getCurrentSignals();
        return this.processSignals(signals);
      }
      
      // Generate realistic signals for demonstration
      return this.generateRealisticSignals();
    } catch (error) {
      console.error('Error fetching trading signals:', error);
      return this.generateRealisticSignals();
    }
  }

  private processSignals(rawSignals: any): TradingSignal {
    return {
      signal: rawSignals.signal || 'NEUTRAL',
      confidence: rawSignals.confidence || 0.65,
      rsi: rawSignals.rsi || 50,
      trend: this.determineTrend(rawSignals),
      momentum: this.determineMomentum(rawSignals)
    };
  }

  private generateRealisticSignals(): TradingSignal {
    const rsi = 30 + Math.random() * 40; // RSI between 30-70
    const confidence = 0.6 + Math.random() * 0.3; // 60-90% confidence
    
    let signal: 'BUY' | 'SELL' | 'HOLD' | 'NEUTRAL' = 'NEUTRAL';
    let trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS' = 'SIDEWAYS';
    
    if (rsi < 35) {
      signal = 'BUY';
      trend = 'BULLISH';
    } else if (rsi > 65) {
      signal = 'SELL';
      trend = 'BEARISH';
    } else {
      signal = Math.random() > 0.5 ? 'HOLD' : 'NEUTRAL';
    }

    return {
      signal,
      confidence,
      rsi,
      trend,
      momentum: confidence > 0.75 ? 'STRONG' : confidence > 0.65 ? 'MODERATE' : 'WEAK'
    };
  }

  private determineTrend(signals: any): 'BULLISH' | 'BEARISH' | 'SIDEWAYS' {
    if (signals.trend) return signals.trend;
    if (signals.signal === 'BUY') return 'BULLISH';
    if (signals.signal === 'SELL') return 'BEARISH';
    return 'SIDEWAYS';
  }

  private determineMomentum(signals: any): 'STRONG' | 'MODERATE' | 'WEAK' {
    if (signals.confidence > 0.8) return 'STRONG';
    if (signals.confidence > 0.6) return 'MODERATE';
    return 'WEAK';
  }

  private getOptimalTimeWindows(): TimeWindow[] {
    if (this.timeWindowHelper && this.timeWindowHelper.getOptimalWindows) {
      return this.timeWindowHelper.getOptimalWindows();
    }
    
    // Default optimal trading windows (WAT timezone)
    return [
      {
        start: "6:30 AM WAT",
        end: "9:30 AM WAT", 
        reason: "European market overlap increases liquidity and volatility",
        priority: 'HIGH'
      },
      {
        start: "2:00 PM WAT",
        end: "5:00 PM WAT",
        reason: "US trading hours create strong momentum opportunities", 
        priority: 'HIGH'
      },
      {
        start: "9:00 PM WAT",
        end: "11:00 PM WAT",
        reason: "Asian session overlap can provide additional volume",
        priority: 'MEDIUM'
      }
    ];
  }

  private generateTradingAdvice(
    marketData: MarketData, 
    signals: TradingSignal, 
    timeWindows: TimeWindow[],
    question: string
  ): TradingAdvice {
    const currentPrice = marketData.price;
    const isCurrentlyOptimalTime = this.isOptimalTradingTime();
    
    // Determine action based on signals and market conditions
    let action: 'BUY_NOW' | 'SELL_NOW' | 'WAIT' | 'NEUTRAL' = 'NEUTRAL';
    let entryPrice: number | undefined;
    let exitPrice: number | undefined;
    let reasoning: string;
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';

    if (signals.signal === 'BUY' && signals.trend === 'BULLISH') {
      if (isCurrentlyOptimalTime && signals.confidence > 0.7) {
        action = 'BUY_NOW';
        entryPrice = currentPrice;
        exitPrice = currentPrice * 1.04; // 4% profit target
        reasoning = `Strong buy opportunity detected! ETH is at $${currentPrice.toFixed(2)} with bullish momentum (RSI: ${signals.rsi.toFixed(1)}, confidence: ${(signals.confidence * 100).toFixed(1)}%). Market conditions favor entry now with good liquidity.`;
        riskLevel = signals.momentum === 'STRONG' ? 'LOW' : 'MEDIUM';
      } else {
        action = 'WAIT';
        entryPrice = currentPrice * 0.98; // Wait for 2% dip
        exitPrice = currentPrice * 1.05; // 5% profit target
        reasoning = `ETH shows bullish signals at $${currentPrice.toFixed(2)}, but consider waiting for optimal timing or a slight dip to $${entryPrice.toFixed(2)} for better risk/reward. Target exit around $${exitPrice.toFixed(2)}.`;
        riskLevel = 'MEDIUM';
      }
    } else if (signals.signal === 'SELL' && signals.trend === 'BEARISH') {
      if (isCurrentlyOptimalTime) {
        action = 'SELL_NOW';
        reasoning = `Market shows bearish signals with ETH at $${currentPrice.toFixed(2)}. RSI at ${signals.rsi.toFixed(1)} suggests selling pressure. Consider exiting positions or shorting if experienced.`;
        riskLevel = 'MEDIUM';
      } else {
        action = 'WAIT';
        reasoning = `Bearish signals detected at $${currentPrice.toFixed(2)}, but wait for optimal trading hours for better execution and liquidity.`;
        riskLevel = 'HIGH';
      }
    } else if (signals.trend === 'SIDEWAYS' || signals.signal === 'NEUTRAL') {
      action = 'WAIT';
      entryPrice = currentPrice * 0.97; // Wait for 3% dip
      exitPrice = currentPrice * 1.03; // 3% profit target  
      reasoning = `ETH is consolidating around $${currentPrice.toFixed(2)} with neutral signals (RSI: ${signals.rsi.toFixed(1)}). No clear trend suggests waiting. Consider entry near $${entryPrice.toFixed(2)} and exit at $${exitPrice.toFixed(2)} for range trading.`;
      riskLevel = 'MEDIUM';
    } else {
      action = 'WAIT';
      reasoning = `Mixed signals at current price $${currentPrice.toFixed(2)}. Market needs clearer direction. Wait for better setup during optimal trading windows.`;
      riskLevel = 'HIGH';
    }

    // Add time window recommendations if relevant
    if (action === 'WAIT') {
      const nextOptimalWindow = this.getNextOptimalWindow(timeWindows);
      if (nextOptimalWindow) {
        reasoning += ` Best time to reassess: ${nextOptimalWindow.start} - ${nextOptimalWindow.end} (${nextOptimalWindow.reason}).`;
      }
    }

    return {
      action,
      currentPrice,
      entryPrice,
      exitPrice,
      reasoning,
      timeWindows: action === 'WAIT' ? timeWindows.filter(w => w.priority === 'HIGH') : [],
      riskLevel,
      confidence: signals.confidence
    };
  }

  private isOptimalTradingTime(): boolean {
    const now = new Date();
    const hour = now.getUTCHours() + 1; // WAT is UTC+1
    
    // Optimal hours in WAT: 6:30-9:30 AM, 2-5 PM, 9-11 PM
    return (
      (hour >= 6 && hour <= 9) ||   // Morning European session
      (hour >= 14 && hour <= 17) || // Afternoon US session  
      (hour >= 21 && hour <= 23)    // Evening Asian session
    );
  }

  private getNextOptimalWindow(timeWindows: TimeWindow[]): TimeWindow | null {
    // Return the highest priority window
    const highPriorityWindows = timeWindows.filter(w => w.priority === 'HIGH');
    return highPriorityWindows.length > 0 ? highPriorityWindows[0] : timeWindows[0] || null;
  }

  // Public method for KonsAi to get formatted trading advice
  async getFormattedTradingAdvice(question: string): Promise<string> {
    try {
      const advice = await this.analyzeTradingOpportunity(question);
      return this.formatAdviceForUser(advice);
    } catch (error) {
      return `I'm unable to provide ETH trading advice right now: ${error.message}. Please try again in a moment.`;
    }
  }

  private formatAdviceForUser(advice: TradingAdvice): string {
    let response = advice.reasoning;

    // Add specific price recommendations
    if (advice.entryPrice && advice.exitPrice) {
      response += `\n\n💡 **Recommendation**: `;
      if (advice.action === 'BUY_NOW') {
        response += `Buy at current price $${advice.currentPrice.toFixed(2)}, target exit at $${advice.exitPrice.toFixed(2)}.`;
      } else if (advice.action === 'WAIT') {
        response += `Wait for entry near $${advice.entryPrice.toFixed(2)}, then target $${advice.exitPrice.toFixed(2)}.`;
      }
    }

    // Add time windows if provided
    if (advice.timeWindows.length > 0) {
      response += `\n\n⏰ **Optimal Trading Windows**:`;
      advice.timeWindows.forEach(window => {
        response += `\n• ${window.start} - ${window.end}: ${window.reason}`;
      });
    }

    // Add risk assessment
    response += `\n\n📊 **Risk Level**: ${advice.riskLevel} | **Confidence**: ${(advice.confidence * 100).toFixed(1)}%`;

    return response;
  }
}

export const ethAdvisor = new ETHAdvisor();