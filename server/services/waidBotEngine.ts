import { EthPriceData } from './ethMonitor';
import { DivineSignal } from './divineCommLayer';
import { mlEngine } from './mlEngine';
import { portfolioManager } from './portfolioManager';
import { storage } from '../storage';

export interface WaidDecision {
  action: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'OBSERVE';
  reasoning: string;
  confidence: number;
  konsWisdom: string;
  ethPosition: 'LONG' | 'NEUTRAL';
  tradingPair: 'ETH/USDT' | 'NONE';
  quantity: number;
  urgency: 'IMMEDIATE' | 'WITHIN_HOUR' | 'WHEN_READY' | 'PATIENCE';
  mlPrediction?: any;
  portfolioRisk?: string;
  executionStatus?: 'PENDING' | 'EXECUTED' | 'FAILED' | 'CANCELLED';
  microMovementCapture?: boolean;
  nextGenStrategy?: string;
  // Confirmation signals from other assets for analysis only
  btcConfirmation?: {
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    strength: number;
    supportLevel: number;
  };
  solConfirmation?: {
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    strength: number;
    momentum: number;
  };
}

export interface KonsLangAnalysis {
  marketMood: 'EUPHORIC' | 'FEARFUL' | 'GREEDY' | 'CONFUSED' | 'BALANCED';
  ethVibration: 'ASCENDING' | 'DESCENDING' | 'OSCILLATING' | 'DORMANT';
  divineAlignment: number; // 0-100
  tradingWindow: 'SACRED' | 'NORMAL' | 'FORBIDDEN';
  konsMessage: string;
}

export class WaidBotEngine {
  private lastDecision: WaidDecision | null = null;
  private decisionHistory: WaidDecision[] = [];
  private tradingEnabled: boolean = false;
  
  constructor() {
    this.initializeKonsLang();
  }

  private initializeKonsLang(): void {
    console.log('🔮 WaidBot KonsLang Engine Initialized - No External APIs Required');
  }

  public async analyzeWithKonsLang(
    ethData: EthPriceData, 
    divineSignal: DivineSignal,
    recentCandlesticks: any[]
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

    // ETH Vibration Analysis using candlestick patterns
    let ethVibration: KonsLangAnalysis['ethVibration'] = 'DORMANT';
    if (recentCandlesticks.length >= 3) {
      const recent = recentCandlesticks.slice(-3);
      const upCandles = recent.filter(c => c.close > c.open).length;
      const downCandles = recent.filter(c => c.close < c.open).length;
      
      if (upCandles >= 2) ethVibration = 'ASCENDING';
      else if (downCandles >= 2) ethVibration = 'DESCENDING';
      else ethVibration = 'OSCILLATING';
    }

    // Divine Alignment (combination of multiple factors)
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
    ethData: EthPriceData,
    divineSignal: DivineSignal,
    konsAnalysis: KonsLangAnalysis
  ): Promise<WaidDecision> {
    
    let decision: WaidDecision;
    
    // KonsLang Decision Matrix
    if (konsAnalysis.tradingWindow === 'FORBIDDEN') {
      decision = {
        action: 'OBSERVE',
        reasoning: 'KonsLang: Trading window forbidden by divine protection',
        confidence: 95,
        konsWisdom: 'Patience protects capital better than hasty moves',
        ethPosition: 'NEUTRAL',
        tradingPair: 'NONE',
        quantity: 0,
        urgency: 'PATIENCE'
      };
    }
    else if (konsAnalysis.divineAlignment > 85 && konsAnalysis.ethVibration === 'ASCENDING') {
      decision = {
        action: 'BUY_ETH',
        reasoning: `KonsLang: Ultra-strong bullish alignment - ETH ascending with ${konsAnalysis.divineAlignment}% divine confirmation. Maximum ETH accumulation strategy`,
        confidence: Math.min(98, konsAnalysis.divineAlignment),
        konsWisdom: 'Ride the ascending wave with full conviction - accumulate ETH at optimal entry',
        ethPosition: 'LONG',
        tradingPair: 'ETH/USDT',
        quantity: this.calculatePosition(konsAnalysis.divineAlignment, 'LONG'),
        urgency: 'IMMEDIATE',
        microMovementCapture: true,
        nextGenStrategy: 'HYPER_MOMENTUM_ACCUMULATION'
      };
    }
    else if (konsAnalysis.divineAlignment > 75 && konsAnalysis.ethVibration === 'ASCENDING') {
      decision = {
        action: 'BUY_ETH',
        reasoning: `KonsLang: Strong bullish alignment - ETH ascending with ${konsAnalysis.divineAlignment}% divine confirmation`,
        confidence: Math.min(95, konsAnalysis.divineAlignment),
        konsWisdom: 'Buy ETH spot during ascending wave with conviction',
        ethPosition: 'LONG',
        tradingPair: 'ETH/USDT',
        quantity: this.calculatePosition(konsAnalysis.divineAlignment, 'LONG'),
        urgency: konsAnalysis.marketMood === 'EUPHORIC' ? 'IMMEDIATE' : 'WITHIN_HOUR',
        microMovementCapture: false,
        nextGenStrategy: 'SPOT_ACCUMULATION'
      };
    }
    else if (konsAnalysis.divineAlignment > 85 && konsAnalysis.ethVibration === 'DESCENDING') {
      decision = {
        action: 'SELL_ETH',
        reasoning: `KonsLang: Ultra-strong bearish alignment - ETH descending with ${konsAnalysis.divineAlignment}% divine confirmation. Protective ETH liquidation`,
        confidence: Math.min(98, konsAnalysis.divineAlignment),
        konsWisdom: 'Protect capital from descending energy - preservation over profit',
        ethPosition: 'NEUTRAL',
        tradingPair: 'ETH/USDT',
        quantity: this.calculatePosition(konsAnalysis.divineAlignment, 'NEUTRAL'),
        urgency: 'IMMEDIATE',
        microMovementCapture: true,
        nextGenStrategy: 'DEFENSIVE_LIQUIDATION'
      };
    }
    else if (konsAnalysis.divineAlignment > 70 && konsAnalysis.ethVibration === 'DESCENDING') {
      decision = {
        action: 'SELL_ETH',
        reasoning: `KonsLang: Strong bearish alignment - ETH descending with ${konsAnalysis.divineAlignment}% divine confirmation`,
        confidence: Math.min(90, konsAnalysis.divineAlignment),
        konsWisdom: 'Sell ETH spot to preserve capital during descent',
        ethPosition: 'NEUTRAL',
        tradingPair: 'ETH/USDT',
        quantity: this.calculatePosition(konsAnalysis.divineAlignment, 'LONG'),
        urgency: konsAnalysis.marketMood === 'FEARFUL' ? 'IMMEDIATE' : 'WITHIN_HOUR',
        microMovementCapture: false,
        nextGenStrategy: 'CAPITAL_PRESERVATION'
      };
    }
    else if (konsAnalysis.marketMood === 'BALANCED' && konsAnalysis.ethVibration === 'OSCILLATING') {
      decision = {
        action: 'HOLD',
        reasoning: 'KonsLang: Market in balanced oscillation - maintaining current positions',
        confidence: 60,
        konsWisdom: 'In balance, the wise trader waits for clarity',
        ethPosition: 'NEUTRAL',
        tradingPair: 'NONE',
        quantity: 0,
        urgency: 'WHEN_READY'
      };
    }
    else {
      decision = {
        action: 'OBSERVE',
        reasoning: `KonsLang: Insufficient alignment (${konsAnalysis.divineAlignment}%) for confident trading`,
        confidence: 45,
        konsWisdom: 'Observation sharpens future decisions',
        ethPosition: 'NEUTRAL',
        tradingPair: 'NONE',
        quantity: 0,
        urgency: 'PATIENCE'
      };
    }

    // Add BTC/SOL confirmation signals for analysis only (not for trading)
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

  private calculatePosition(alignment: number, direction: 'LONG' | 'NEUTRAL'): number {
    // Position size based on divine alignment for ETH-only trading
    const baseSize = 100; // Base USDT amount
    const multiplier = alignment / 100;
    
    if (direction === 'NEUTRAL') {
      return Math.round(baseSize * multiplier * 0.3); // Conservative selling for protection
    }
    
    return Math.round(baseSize * multiplier); // Full position for ETH accumulation
  }

  private generateKonsMessage(
    mood: KonsLangAnalysis['marketMood'], 
    vibration: KonsLangAnalysis['ethVibration'], 
    alignment: number
  ): string {
    const messages = {
      'EUPHORIC': [
        'The market dances with unbridled joy - but joy can blind wisdom',
        'Euphoria fills the air, yet the wise trader remains centered',
        'In great excitement, find the calm eye of the storm'
      ],
      'FEARFUL': [
        'Fear clouds judgment, but also creates opportunity for the prepared',
        'In darkness, the patient soul finds hidden treasures',
        'Fear sells what wisdom would hold'
      ],
      'GREEDY': [
        'Greed whispers sweet promises of endless gains',
        'The greedy hand often drops what it tries to grasp',
        'In greed, find moderation; in moderation, find profit'
      ],
      'CONFUSED': [
        'Confusion is the market speaking in riddles',
        'When the path is unclear, stillness reveals direction',
        'In uncertainty, patience becomes profit'
      ],
      'BALANCED': [
        'Balance is the highest form of market wisdom',
        'In equilibrium, all possibilities exist simultaneously',
        'The balanced trader moves with market rhythms'
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

    // Here you would integrate with actual exchange APIs
    // For now, we'll simulate the execution
    console.log(`🚀 WaidBot executing: ${decision.action} ${decision.quantity} USDT on ${decision.tradingPair}`);
    
    return {
      success: true,
      message: `Executed ${decision.action} for ${decision.quantity} USDT on ${decision.tradingPair}`
    };
  }

  private async generateBTCConfirmation(): Promise<{
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    strength: number;
    supportLevel: number;
  }> {
    try {
      // Fetch BTC data for confirmation signals only (not for trading)
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true');
      const btcData = await response.json();
      
      const priceChange = btcData.bitcoin.usd_24h_change || 0;
      const volume = btcData.bitcoin.usd_24h_vol || 0;
      
      // Analyze BTC trend for ETH confirmation
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
      // Fetch SOL data for confirmation signals only (not for trading)
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true');
      const solData = await response.json();
      
      const priceChange = solData.solana.usd_24h_change || 0;
      const volume = solData.solana.usd_24h_vol || 0;
      
      // Analyze SOL trend for ETH confirmation
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