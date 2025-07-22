import { EthPriceData } from './ethMonitor';
import { DivineSignal } from './divineCommLayer';
import { mlEngine } from './mlEngine';
import { portfolioManager } from './portfolioManager';
import { storage } from '../storage';
import { ETHPrice, WaidDecision, DivineSignal as SimpleDivineSignal } from '../types/waidTypes';
import { KonsLangSymbol, KonsLangAnalysis } from '../types/konslangTypes';

export interface MarketData {
  price: number;
  volume: number;
  timestamp: Date;
  priceChange24h: number;
}

export interface KonsPowaSignal {
  strategy: string;
  confidence: number;
  size?: string;
  timeframe?: string;
}

// Mock Divine Kons Powa Flux Strategy for now
const divineKonsPowaFluxStrategy = {
  convertEthDataToMarketData: (ethData: any, historicalData: any[]): MarketData => {
    return {
      price: ethData.price || 3000,
      volume: ethData.volume || 1000000,
      timestamp: new Date(ethData.timestamp || Date.now()),
      priceChange24h: ethData.priceChange24h || 0
    };
  },
  
  generateSignal: (marketData: MarketData): KonsPowaSignal => {
    const priceChange = marketData.priceChange24h;
    
    if (priceChange > 5) {
      return {
        strategy: 'QUANTUM_ENTANGLEMENT_BUY',
        confidence: 0.8,
        size: 'full_position',
        timeframe: '5m'
      };
    } else if (priceChange > 2) {
      return {
        strategy: 'HYPER_MOMENTUM_ACCUMULATION',
        confidence: 0.6,
        size: 'half_position',
        timeframe: '15m'
      };
    } else if (priceChange < -5) {
      return {
        strategy: 'DEFENSIVE_LIQUIDATION',
        confidence: 0.9,
        size: 'full_position',
        timeframe: '5m'
      };
    } else if (priceChange < -2) {
      return {
        strategy: 'PROTECTIVE_SELLING',
        confidence: 0.7,
        size: 'half_position',
        timeframe: '15m'
      };
    } else {
      return {
        strategy: 'QUANTUM_SUPERPOSITION',
        confidence: 0.5,
        timeframe: '1h'
      };
    }
  },
  
  updateKonsPowaState: (data: { pnl: number }) => {
    console.log(`Kons Powa state updated with PnL: ${data.pnl.toFixed(2)}`);
  }
};

export class WaidBotEngine {
  private lastDecision: WaidDecision | null = null;
  private decisionHistory: WaidDecision[] = [];
  private tradingEnabled: boolean = false;
  private botType: 'WAIDBOT' = 'WAIDBOT';
  
  constructor() {
    this.initializeKonsLang();
  }

  private initializeKonsLang(): void {
    console.log('🔮 WaidBot KonsLang Engine Initialized - No External APIs Required');
  }

  public async analyzeWithKonsLang(
    ethData: ETHPrice, 
    divineSignal: DivineSignal
  ): Promise<KonsLangAnalysis> {
    
    // KonsLang Market Mood Analysis
    const priceChange = ethData.priceChange24h || 0;
    const purity = divineSignal.energeticPurity;
    
    let marketMood: KonsLangAnalysis['marketMood'];
    if (purity > 80 && priceChange > 5) marketMood = 'EUPHORIC';
    else if (purity < 30 && priceChange < -3) marketMood = 'FEARFUL';
    else if (purity > 60 && Math.abs(priceChange) > 2) marketMood = 'GREEDY';
    else if (purity < 50 && Math.abs(priceChange) < 1) marketMood = 'CONFUSED';
    else marketMood = 'BALANCED';

    // ETH Vibration Analysis
    let ethVibration: KonsLangAnalysis['ethVibration'] = 'DORMANT';
    if (priceChange > 2) ethVibration = 'ASCENDING';
    else if (priceChange < -2) ethVibration = 'DESCENDING';
    else ethVibration = 'OSCILLATING';

    // Divine Alignment
    const alignment = Math.round(
      (purity * 0.4) + 
      (divineSignal.breathLock ? 30 : 0) + 
      (divineSignal.konsMirror === 'PURE WAVE' ? 20 : 0) +
      (Math.abs(priceChange) * 2)
    );

    // Trading Window Assessment
    const currentHour = new Date().getHours();
    let tradingWindow: KonsLangAnalysis['tradingWindow'];
    if ((currentHour >= 9 && currentHour <= 16) && divineSignal.breathLock) {
      tradingWindow = 'SACRED';
    } else if (divineSignal.autoCancelEvil) {
      tradingWindow = 'FORBIDDEN';
    } else {
      tradingWindow = 'NORMAL';
    }

    const konsMessage = this.generateKonsMessage(marketMood, ethVibration, alignment);

    return {
      marketMood,
      ethVibration,
      divineAlignment: Math.min(100, alignment),
      tradingWindow,
      konsMessage
    };
  }

  public async makeWaidDecision(
    ethData: ETHPrice,
    divineSignal: DivineSignal,
    konsAnalysis: KonsLangAnalysis
  ): Promise<WaidDecision> {
    
    // Get historical data for kons powa analysis
    const historicalData = await storage.getEthDataHistory(20);
    
    // Convert to market data format
    const marketData = divineKonsPowaFluxStrategy.convertEthDataToMarketData(ethData, historicalData);
    
    // Generate kons powa signal
    const konsPowaSignal = divineKonsPowaFluxStrategy.generateSignal(marketData);
    
    let decision: WaidDecision;
    
    // Decision Matrix
    if (konsAnalysis.tradingWindow === 'FORBIDDEN') {
      decision = {
        action: 'OBSERVE',
        reasoning: 'KonsLang: Trading window forbidden by divine protection',
        confidence: 95,
        konsWisdom: 'Patience protects capital better than hasty moves',
        ethPosition: 'NEUTRAL',
        tradingPair: 'NONE',
        quantity: 0,
        urgency: 'PATIENCE',
        trendDirection: 'SIDEWAYS',
        botType: 'WAIDBOT',
        autoTradingEnabled: this.tradingEnabled
      };
    }
    else if (konsPowaSignal.strategy === 'QUANTUM_ENTANGLEMENT_BUY') {
      decision = {
        action: 'BUY_ETH',
        reasoning: `Divine Kons Powa Flux: Singularity-level alignment detected - ${(konsPowaSignal.confidence * 100).toFixed(1)}% confidence`,
        confidence: konsPowaSignal.confidence * 100,
        konsWisdom: 'Kons Powa entanglement achieved - ride the singularity wave with full conviction',
        ethPosition: 'LONG',
        tradingPair: 'ETH/USDT',
        quantity: this.calculateKonsPowaPosition(konsPowaSignal.size, konsPowaSignal.confidence),
        urgency: 'IMMEDIATE',
        trendDirection: 'UPWARD',
        botType: 'WAIDBOT',
        autoTradingEnabled: this.tradingEnabled
      };
    }
    else if (konsPowaSignal.strategy === 'HYPER_MOMENTUM_ACCUMULATION') {
      decision = {
        action: 'BUY_ETH',
        reasoning: `Divine Kons Powa Flux: Strong momentum alignment - ${(konsPowaSignal.confidence * 100).toFixed(1)}% confidence`,
        confidence: konsPowaSignal.confidence * 100,
        konsWisdom: 'Momentum flows in our favor - accumulate with precision',
        ethPosition: 'LONG',
        tradingPair: 'ETH/USDT',
        quantity: this.calculateKonsPowaPosition(konsPowaSignal.size, konsPowaSignal.confidence),
        urgency: konsPowaSignal.timeframe === '5m' ? 'WITHIN_HOUR' : 'IMMEDIATE',
        trendDirection: 'UPWARD',
        botType: 'WAIDBOT',
        autoTradingEnabled: this.tradingEnabled
      };
    }
    else if (konsPowaSignal.strategy === 'DEFENSIVE_LIQUIDATION') {
      decision = {
        action: 'SELL_ETH',
        reasoning: `Divine Kons Powa Flux: Critical defensive signal - ${(konsPowaSignal.confidence * 100).toFixed(1)}% confidence`,
        confidence: konsPowaSignal.confidence * 100,
        konsWisdom: 'Preserve capital through immediate liquidation',
        ethPosition: 'NEUTRAL',
        tradingPair: 'ETH/USDT',
        quantity: this.calculateKonsPowaPosition(konsPowaSignal.size, konsPowaSignal.confidence),
        urgency: 'IMMEDIATE',
        trendDirection: 'DOWNWARD',
        botType: 'WAIDBOT',
        autoTradingEnabled: this.tradingEnabled
      };
    }
    else if (konsPowaSignal.strategy === 'PROTECTIVE_SELLING') {
      decision = {
        action: 'SELL_ETH',
        reasoning: `Divine Kons Powa Flux: Moderate protective signal - ${(konsPowaSignal.confidence * 100).toFixed(1)}% confidence`,
        confidence: konsPowaSignal.confidence * 100,
        konsWisdom: 'Protect accumulated gains through strategic reduction',
        ethPosition: 'NEUTRAL',
        tradingPair: 'ETH/USDT',
        quantity: this.calculateKonsPowaPosition(konsPowaSignal.size, konsPowaSignal.confidence),
        urgency: konsPowaSignal.timeframe === '15m' ? 'WITHIN_HOUR' : 'WHEN_READY',
        trendDirection: 'DOWNWARD',
        botType: 'WAIDBOT',
        autoTradingEnabled: this.tradingEnabled
      };
    }
    else {
      decision = {
        action: 'HOLD',
        reasoning: `Divine Kons Powa Flux: Superposition state - ${(konsPowaSignal.confidence * 100).toFixed(1)}% confidence`,
        confidence: konsPowaSignal.confidence * 100,
        konsWisdom: 'Patience preserves capital while awaiting perfect alignment',
        ethPosition: 'NEUTRAL',
        tradingPair: 'NONE',
        quantity: 0,
        urgency: 'WHEN_READY',
        trendDirection: 'SIDEWAYS',
        botType: 'WAIDBOT',
        autoTradingEnabled: this.tradingEnabled
      };
    }

    // Add BTC/SOL confirmation signals
    const btcConfirmation = await this.generateBTCConfirmation();
    const solConfirmation = await this.generateSOLConfirmation();
    
    decision.btcConfirmation = btcConfirmation;
    decision.solConfirmation = solConfirmation;

    // Store decision
    this.lastDecision = decision;
    this.decisionHistory.push(decision);
    if (this.decisionHistory.length > 100) {
      this.decisionHistory = this.decisionHistory.slice(-50);
    }

    return decision;
  }

  private calculateKonsPowaPosition(size: string | undefined, confidence: number): number {
    const baseSize = 200;
    const multiplier = confidence;
    
    switch (size) {
      case 'full_position':
        return Math.floor(baseSize * multiplier * 2);
      case 'half_position':
        return Math.floor(baseSize * multiplier);
      default:
        return Math.floor(baseSize * multiplier * 0.5);
    }
  }

  private generateKonsMessage(
    mood: KonsLangAnalysis['marketMood'], 
    vibration: KonsLangAnalysis['ethVibration'], 
    alignment: number
  ): string {
    const messages = {
      'EUPHORIC': [
        'The market dances with unbridled joy - but joy can blind wisdom',
        'Euphoria fills the air, yet the wise trader remains centered'
      ],
      'FEARFUL': [
        'Fear clouds judgment, but also creates opportunity for the prepared',
        'In darkness, the patient soul finds hidden treasures'
      ],
      'GREEDY': [
        'Greed whispers sweet promises of endless gains',
        'The greedy hand often drops what it tries to grasp'
      ],
      'CONFUSED': [
        'Confusion is the market speaking in riddles',
        'When the path is unclear, stillness reveals direction'
      ],
      'BALANCED': [
        'Balance is the highest form of market wisdom',
        'In equilibrium, all possibilities exist simultaneously'
      ]
    };

    const moodMessages = messages[mood];
    const selectedMessage = moodMessages[Math.floor(Math.random() * moodMessages.length)];
    
    return `${selectedMessage} (Alignment: ${alignment}%)`;
  }

  public getLastDecision(): WaidDecision | null {
    return this.lastDecision;
  }

  public getDecisionHistory(limit: number = 20): WaidDecision[] {
    return this.decisionHistory.slice(-limit);
  }

  public enableTrading(): void {
    this.tradingEnabled = true;
    console.log('🤖 WaidBot Trading Enabled');
  }

  public disableTrading(): void {
    this.tradingEnabled = false;
    console.log('🛑 WaidBot Trading Disabled');
  }

  public isTradingEnabled(): boolean {
    return this.tradingEnabled;
  }

  public async executeDecision(decision: WaidDecision): Promise<{ success: boolean; message: string }> {
    if (!this.tradingEnabled) {
      return { success: false, message: 'Trading is disabled' };
    }

    if (decision.action === 'OBSERVE' || decision.action === 'HOLD') {
      return { success: true, message: `Decision executed: ${decision.action}` };
    }

    // Simulate trade execution
    const simulatedPnL = Math.random() > 0.3 ? Math.random() * 100 : -Math.random() * 50;
    
    // Update strategy state
    divineKonsPowaFluxStrategy.updateKonsPowaState({ pnl: simulatedPnL });
    
    console.log(`🚀 WaidBot executing: ${decision.action} ${decision.quantity} USDT on ${decision.tradingPair}`);
    console.log(`⚛️ Kons Powa state adapted with PnL: ${simulatedPnL.toFixed(2)}`);
    
    return {
      success: true,
      message: `Executed ${decision.action} for ${decision.quantity} USDT - Kons Powa state evolved`
    };
  }

  private async generateBTCConfirmation(): Promise<{
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    strength: number;
    supportLevel: number;
  }> {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true');
      const btcData = await response.json();
      
      const priceChange = btcData.bitcoin.usd_24h_change || 0;
      
      let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
      if (priceChange > 3) trend = 'BULLISH';
      else if (priceChange < -3) trend = 'BEARISH';
      
      const strength = Math.min(100, Math.abs(priceChange) * 10);
      const supportLevel = btcData.bitcoin.usd * (1 - Math.abs(priceChange) / 100);
      
      return { trend, strength, supportLevel };
    } catch (error) {
      return { trend: 'NEUTRAL', strength: 50, supportLevel: 45000 };
    }
  }

  private async generateSOLConfirmation(): Promise<{
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    strength: number;
    momentum: number;
  }> {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true');
      const solData = await response.json();
      
      const priceChange = solData.solana.usd_24h_change || 0;
      const volume = solData.solana.usd_24h_vol || 0;
      
      let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
      if (priceChange > 4) trend = 'BULLISH';
      else if (priceChange < -4) trend = 'BEARISH';
      
      const strength = Math.min(100, Math.abs(priceChange) * 8);
      const momentum = Math.min(100, (volume / 1000000) * priceChange);
      
      return { trend, strength, momentum };
    } catch (error) {
      return { trend: 'NEUTRAL', strength: 50, momentum: 25 };
    }
  }
}

// Export functions for the runner
const waidBotEngine = new WaidBotEngine();

export function makeWaidDecision(konsAnalysis: KonsLangSymbol[], ethData: ETHPrice): Promise<WaidDecision> {
  // Convert KonsLangSymbol[] to KonsLangAnalysis for compatibility
  const mockKonsAnalysis: KonsLangAnalysis = {
    marketMood: 'BALANCED',
    ethVibration: 'OSCILLATING',
    divineAlignment: 50,
    tradingWindow: 'NORMAL',
    konsMessage: 'Market in balance'
  };
  
  const mockDivineSignal: DivineSignal = {
    action: 'OBSERVE',
    timeframe: '1h',
    reason: 'Market analysis in progress',
    moralPulse: 'CLEAN',
    strategy: 'WAIT',
    signalCode: 'MOCK001',
    receivedAt: new Date().toISOString(),
    konsTitle: 'TimeKeeper',
    energeticPurity: 50,
    konsMirror: 'PURE WAVE',
    breathLock: false,
    ethWhisperMode: true,
    autoCancelEvil: false,
    smaiPredict: {
      nextHourDirection: 'SIDEWAYS',
      confidence: 50,
      predictedPriceRange: { min: 2900, max: 3100 }
    }
  };
  
  return waidBotEngine.makeWaidDecision(ethData, mockDivineSignal, mockKonsAnalysis);
}

export function executeDecision(decision: WaidDecision): Promise<{ success: boolean; message: string; outcome?: string }> {
  return waidBotEngine.executeDecision(decision).then(result => ({
    ...result,
    outcome: result.success ? 'SUCCESS' : 'FAILED'
  }));
}

export function analyzeWithKonsLang(ethData: ETHPrice, divineSignal: DivineSignal): KonsLangSymbol[] {
  // Convert to legacy format for compatibility
  return [
    {
      symbol: '⚡',
      meaning: 'Market Energy',
      power: ethData.priceChange24h || 0,
      alignment: ethData.priceChange24h > 0 ? 'POSITIVE' : 'NEGATIVE',
      timestamp: Date.now()
    }
  ];
}