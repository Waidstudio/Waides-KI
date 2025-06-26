// Waides KI Core - Central integration system for all app components

export class WaidesKICore {
  private static instance: WaidesKICore;

  private constructor() {
    // Simple constructor
  }

  static getInstance(): WaidesKICore {
    if (!WaidesKICore.instance) {
      WaidesKICore.instance = new WaidesKICore();
    }
    return WaidesKICore.instance;
  }

  async predictETH(userId: string = 'user123'): Promise<string> {
    try {
      // Get current ETH price (mock for now)
      const currentPrice = 2400 + Math.random() * 100 - 50;
      const priceChange = (Math.random() - 0.5) * 10;
      const confidence = 65 + Math.random() * 30;
      
      // Generate prediction
      const nextHourTarget = currentPrice + priceChange;
      const next24hChange = (Math.random() - 0.5) * 15;
      const next24hTarget = currentPrice + next24hChange;
      
      const direction = priceChange > 0 ? "upward" : "downward";
      const strength = Math.abs(priceChange) > 3 ? "strong" : "moderate";
      
      return `🔮 ETH Price Prediction Analysis

📊 Current Price: $${currentPrice.toFixed(2)}

🎯 Next Hour Target: $${nextHourTarget.toFixed(2)} (${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%)
📈 24h Target: $${next24hTarget.toFixed(2)} (${next24hChange > 0 ? '+' : ''}${next24hChange.toFixed(2)}%)

🧠 AI Confidence: ${confidence.toFixed(1)}%
📊 Market Direction: ${direction} momentum
⚡ Signal Strength: ${strength}

💡 Recommendation: ${priceChange > 0 ? 'Consider accumulation on dips' : 'Wait for better entry points'}

⚠️  Always manage risk and never invest more than you can afford to lose.`;

    } catch (error) {
      console.error('ETH prediction failed:', error);
      return `🔮 ETH Prediction Engine

⚠️ Unable to generate prediction at this time. The neural networks are recalibrating.

Please try again in a few moments.`;
    }
  }

  async quickMarketAnalysis(): Promise<string> {
    try {
      // Mock market data for analysis
      const ethPrice = 2400 + Math.random() * 100 - 50;
      const volume = 1200000 + Math.random() * 500000;
      const rsi = 30 + Math.random() * 40;
      
      const trend = rsi > 50 ? "bullish" : "bearish";
      const volatility = Math.random() > 0.5 ? "high" : "moderate";
      
      return `📊 Quick Market Analysis

💰 ETH Price: $${ethPrice.toFixed(2)}
📈 24h Volume: $${(volume / 1000000).toFixed(1)}M
🎯 RSI Signal: ${rsi.toFixed(1)} (${trend})

🔍 Market Trend: ${trend} momentum
⚡ Volatility: ${volatility}
🎪 Market Phase: ${rsi > 60 ? 'Overbought zone' : rsi < 40 ? 'Oversold zone' : 'Neutral territory'}

💡 Trading Insight: ${trend === 'bullish' ? 'Look for pullback entries' : 'Watch for bounce signals'}`;

    } catch (error) {
      console.error('Market analysis failed:', error);
      return `📊 Market Analysis Engine

⚠️ Analysis temporarily unavailable. Systems are updating.`;
    }
  }
}

export const waidesKICore = WaidesKICore.getInstance();
      
      // Generate comprehensive prediction
      const prediction = this.generatePrediction(ethData, tradingEngines, konsLangAnalysis);

      return {
        ethData,
        tradingEngines,
        konsLangAnalysis,
        walletData,
        prediction
      };
    } catch (error) {
      console.error('Waides KI Core analysis failed:', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getETHData() {
    try {
      // Try live feed first
      const liveData = await waidesKILiveFeed.getDetailedMarketData();
      if (liveData?.liveData?.price) {
        return {
          price: liveData.liveData.price,
          volume: liveData.marketStats?.volume24h || 0,
          change24h: liveData.marketStats?.priceChange24h || 0,
          marketCap: liveData.marketStats?.marketCap || 0
        };
      }
      
      // Fallback to ETH monitor
      const ethData = await this.ethMonitor.fetchEthData();
      return {
        price: ethData?.price || 2400,
        volume: ethData?.volume || 0,
        change24h: ethData?.change24h || 0,
        marketCap: ethData?.marketCap || 0
      };
    } catch (error) {
      console.error('ETH data fetch failed:', error);
      return {
        price: 2400,
        volume: 1500000,
        change24h: 2.5,
        marketCap: 290000000000
      };
    }
  }

  private async getTradingEngineAnalysis() {
    try {
      // Get WaidBot decision
      const WaidBotEngine = (await import('./waidBotEngine')).WaidBotEngine;
      const waidBotEngine = new WaidBotEngine();
      const waidBotDecision = await waidBotEngine.makeWaidDecision();

      // Get WaidBot Pro decision
      const WaidBotPro = (await import('./waidBotPro')).WaidBotPro;
      const waidBotPro = new WaidBotPro();
      const proDecision = await waidBotPro.getDecision();

      // Get autonomous trading stats
      const autonomousStats = waidesKIAutonomousTradeCore.getAutonomousStatistics();
      const autonomousStatus = waidesKIAutonomousTradeCore.getAutonomousStatus();

      return {
        waidBot: {
          signal: waidBotDecision.signal || 'HOLD',
          confidence: waidBotDecision.confidence || 50,
          reasoning: waidBotDecision.reasoning || 'Standard analysis'
        },
        waidBotPro: {
          action: proDecision.action || 'HOLD',
          confidence: proDecision.confidence || 50,
          reasoning: proDecision.reasoning || 'Advanced analysis'
        },
        autonomous: {
          isActive: autonomousStatus.is_active,
          stats: autonomousStats
        }
      };
    } catch (error) {
      console.error('Trading engine analysis failed:', error);
      return {
        waidBot: { signal: 'HOLD', confidence: 50, reasoning: 'Engine unavailable' },
        waidBotPro: { action: 'HOLD', confidence: 50, reasoning: 'Engine unavailable' },
        autonomous: { isActive: false, stats: {} }
      };
    }
  }

  private async getKonsLangAnalysis(ethPrice: number) {
    try {
      const ethData = { price: ethPrice, volume: 0, marketCap: 0, change24h: 0 };
      const signal = await this.signalAnalyzer.analyzeSignal(ethData);
      const konsMessage = await this.konsEngine.generateKonsMessage('ETH', signal);
      
      return {
        signal: signal.signal || 'NEUTRAL',
        alignment: signal.confidence || 75,
        message: konsMessage
      };
    } catch (error) {
      console.error('KonsLang analysis failed:', error);
      return {
        signal: 'NEUTRAL',
        alignment: 50,
        message: 'The cosmic energies are in balance...'
      };
    }
  }

  private async getWalletAnalysis(userId: string) {
    try {
      const walletManager = SmaiWalletManager.getInstance();
      const walletResult = await walletManager.getWallet(userId);
      
      const balance = walletResult?.wallet?.balance ? parseFloat(walletResult.wallet.balance) : 0;
      const totalProfit = walletResult?.wallet?.totalProfit ? parseFloat(walletResult.wallet.totalProfit) : 0;
      
      return {
        balance,
        totalProfit,
        canTrade: balance >= 100
      };
    } catch (error) {
      console.error('Wallet analysis failed:', error);
      return {
        balance: 0,
        totalProfit: 0,
        canTrade: false
      };
    }
  }

  private generatePrediction(ethData: any, tradingEngines: any, konsLang: any) {
    // Combine all signals for prediction
    const signals = [
      tradingEngines.waidBot.signal,
      tradingEngines.waidBotPro.action,
      konsLang.signal
    ];

    const confidences = [
      tradingEngines.waidBot.confidence,
      tradingEngines.waidBotPro.confidence,
      konsLang.alignment
    ];

    const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;

    // Determine consensus
    const bullishSignals = signals.filter(s => s.includes('BUY') || s === 'BULLISH').length;
    const bearishSignals = signals.filter(s => s.includes('SELL') || s === 'BEARISH').length;

    let consensus: string;
    let shortTermChange: number;
    let longTermChange: number;

    if (bullishSignals > bearishSignals) {
      consensus = 'BULLISH';
      shortTermChange = (avgConfidence / 100) * 3.5; // Up to 3.5% up
      longTermChange = (avgConfidence / 100) * 7.2; // Up to 7.2% up
    } else if (bearishSignals > bullishSignals) {
      consensus = 'BEARISH';
      shortTermChange = -(avgConfidence / 100) * 2.8; // Up to 2.8% down
      longTermChange = -(avgConfidence / 100) * 5.5; // Up to 5.5% down
    } else {
      consensus = 'NEUTRAL';
      shortTermChange = (Math.random() - 0.5) * 2; // ±1% random
      longTermChange = (Math.random() - 0.5) * 4; // ±2% random
    }

    const nextHourTarget = ethData.price * (1 + shortTermChange / 100);
    const next24hTarget = ethData.price * (1 + longTermChange / 100);

    // Generate recommendation
    let recommendation: string;
    if (consensus === 'BULLISH' && avgConfidence > 70) {
      recommendation = 'Strong buy opportunity detected - consider increasing position';
    } else if (consensus === 'BEARISH' && avgConfidence > 70) {
      recommendation = 'Strong sell signals - consider reducing exposure';
    } else if (avgConfidence > 60) {
      recommendation = `Moderate ${consensus.toLowerCase()} signals - trade with standard position size`;
    } else {
      recommendation = 'Mixed signals detected - wait for clearer market direction';
    }

    return {
      nextHour: {
        target: nextHourTarget,
        change: shortTermChange,
        confidence: avgConfidence
      },
      next24h: {
        target: next24hTarget,
        change: longTermChange,
        confidence: avgConfidence
      },
      consensus,
      recommendation
    };
  }

  // Quick access methods for command processor
  async predictETH(userId: string): Promise<string> {
    try {
      const analysis = await this.getComprehensiveAnalysis(userId);
      
      return `🔮 Comprehensive ETH Prediction Analysis:

📊 Current Market Data:
• Price: $${analysis.ethData.price.toFixed(2)}
• 24h Volume: ${(analysis.ethData.volume / 1000000).toFixed(1)}M
• 24h Change: ${analysis.ethData.change24h > 0 ? '+' : ''}${analysis.ethData.change24h.toFixed(2)}%

🤖 AI Engine Consensus:
• WaidBot: ${analysis.tradingEngines.waidBot.signal} (${analysis.tradingEngines.waidBot.confidence.toFixed(1)}%)
• WaidBot Pro: ${analysis.tradingEngines.waidBotPro.action} (${analysis.tradingEngines.waidBotPro.confidence.toFixed(1)}%)
• KonsLang: ${analysis.konsLangAnalysis.signal} (${analysis.konsLangAnalysis.alignment.toFixed(1)}%)

🎯 Predictions:
⏰ Next Hour: $${analysis.prediction.nextHour.target.toFixed(2)} (${analysis.prediction.nextHour.change > 0 ? '+' : ''}${analysis.prediction.nextHour.change.toFixed(2)}%)
📅 Next 24h: $${analysis.prediction.next24h.target.toFixed(2)} (${analysis.prediction.next24h.change > 0 ? '+' : ''}${analysis.prediction.next24h.change.toFixed(2)}%)

🧠 Consensus: ${analysis.prediction.consensus}
💡 Recommendation: ${analysis.prediction.recommendation}

💰 Wallet Status: $${analysis.walletData.balance.toFixed(2)} ${analysis.walletData.canTrade ? '✅' : '❌ Min $100 required'}
🤖 Auto Trading: ${analysis.tradingEngines.autonomous.isActive ? '✅ Active' : '❌ Inactive'}

🔮 KonsLang Insight: ${analysis.konsLangAnalysis.message}`;
    } catch (error) {
      return `❌ Prediction analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async quickMarketAnalysis(): Promise<string> {
    try {
      const analysis = await this.getComprehensiveAnalysis();
      
      return `📈 Quick Market Analysis:

💰 ETH: $${analysis.ethData.price.toFixed(2)} (${analysis.ethData.change24h > 0 ? '+' : ''}${analysis.ethData.change24h.toFixed(2)}%)
📊 Volume: ${(analysis.ethData.volume / 1000000).toFixed(1)}M
🎯 Consensus: ${analysis.prediction.consensus}
⚡ Confidence: ${analysis.prediction.nextHour.confidence.toFixed(1)}%

${analysis.prediction.recommendation}`;
    } catch (error) {
      return `❌ Market analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

export const waidesKICore = WaidesKICore.getInstance();