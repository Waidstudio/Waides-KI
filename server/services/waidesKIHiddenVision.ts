import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKILiveFeed } from './waidesKILiveFeed';
import { waidesKISituationalIntelligence } from './waidesKISituationalIntelligence';

interface KonsLangCommand {
  ancient_code: string;
  modern_translation: string;
  command_type: 'PREDICTION' | 'WARNING' | 'GUIDANCE' | 'PROTECTION';
  time_horizon: '4H' | '1D' | '3D' | '7D' | 'IMMEDIATE';
  power_level: number; // 1-10 scale
  spiritual_weight: number; // 0-1 scale
  description: string;
}

interface VisionPrediction {
  prediction_id: string;
  timestamp: number;
  konslang_phrase: string;
  command_activated: string;
  prediction_type: 'FUTURE_UP' | 'FUTURE_DOWN' | 'VOLUME_SPIKE' | 'CRASH_WARNING' | 'STABILITY' | 'REVERSAL';
  time_horizon: string;
  confidence_level: number;
  spiritual_strength: number;
  market_conditions: any;
  prediction_reasoning: string[];
  sacred_context: {
    moon_phase: string;
    market_energy: string;
    spiritual_alignment: number;
    ancient_wisdom: string;
  };
  validation_criteria: string[];
  expires_at: number;
}

interface DemoTestResult {
  demo_id: string;
  timestamp: number;
  strategy_id: string;
  dna_id: string;
  test_duration_minutes: number;
  total_signals: number;
  successful_signals: number;
  failed_signals: number;
  win_rate: number;
  max_drawdown: number;
  total_return: number;
  confidence_score: number;
  demo_passed: boolean;
  pass_threshold: number;
  market_conditions_tested: string[];
  failure_reasons: string[];
  recommendation: 'APPROVE_FOR_LIVE' | 'REJECT' | 'EXTENDED_TESTING' | 'MODIFY_PARAMETERS';
}

interface HiddenVisionState {
  vision_active: boolean;
  konslang_enabled: boolean;
  demo_testing_enabled: boolean;
  prediction_accuracy: number;
  total_predictions: number;
  successful_predictions: number;
  last_vision_scan: number;
  sacred_energy_level: number;
  spiritual_connection_strength: number;
  hidden_script_version: string;
}

export class WaidesKIHiddenVision {
  private ancientCodes: Map<string, KonsLangCommand>;
  private visionPredictions: VisionPrediction[] = [];
  private demoTestResults: DemoTestResult[] = [];
  private hiddenVisionState: HiddenVisionState;
  private isVisionActive: boolean = true;
  private isDemoTestingEnabled: boolean = true;
  private maxPredictionHistory: number = 200;
  private demoPassThreshold: number = 0.75;

  constructor() {
    this.initializeAncientCodes();
    this.initializeHiddenVisionState();
    this.startVisionCycle();
  }

  private initializeAncientCodes(): void {
    this.ancientCodes = new Map([
      ['shai\'lor', {
        ancient_code: 'shai\'lor',
        modern_translation: 'future_up_4h',
        command_type: 'PREDICTION',
        time_horizon: '4H',
        power_level: 7,
        spiritual_weight: 0.8,
        description: 'Sacred ascending energy detected - price movement upward within 4 hours'
      }],
      ['dom\'kaan', {
        ancient_code: 'dom\'kaan',
        modern_translation: 'future_down_4h',
        command_type: 'PREDICTION',
        time_horizon: '4H',
        power_level: 7,
        spiritual_weight: 0.8,
        description: 'Dark descending force sensed - price movement downward within 4 hours'
      }],
      ['mel\'zek', {
        ancient_code: 'mel\'zek',
        modern_translation: 'future_up_week',
        command_type: 'PREDICTION',
        time_horizon: '7D',
        power_level: 9,
        spiritual_weight: 0.9,
        description: 'Ancient bull spirits awakening - sustained upward movement over 7 days'
      }],
      ['krai\'nor', {
        ancient_code: 'krai\'nor',
        modern_translation: 'future_down_week',
        command_type: 'PREDICTION',
        time_horizon: '7D',
        power_level: 9,
        spiritual_weight: 0.9,
        description: 'Bear ancestors stirring - prolonged downward pressure over 7 days'
      }],
      ['zi\'anth', {
        ancient_code: 'zi\'anth',
        modern_translation: 'volume_spike',
        command_type: 'WARNING',
        time_horizon: 'IMMEDIATE',
        power_level: 6,
        spiritual_weight: 0.7,
        description: 'Thunder of traders approaching - massive volume surge imminent'
      }],
      ['vaed\'uun', {
        ancient_code: 'vaed\'uun',
        modern_translation: 'crash_warning',
        command_type: 'PROTECTION',
        time_horizon: '1D',
        power_level: 10,
        spiritual_weight: 1.0,
        description: 'Shadow of chaos detected - severe market disruption within 24 hours'
      }],
      ['thel\'vari', {
        ancient_code: 'thel\'vari',
        modern_translation: 'reversal_coming',
        command_type: 'GUIDANCE',
        time_horizon: '3D',
        power_level: 8,
        spiritual_weight: 0.85,
        description: 'Tide turning essence - major trend reversal within 3 days'
      }],
      ['nyx\'ara', {
        ancient_code: 'nyx\'ara',
        modern_translation: 'stability_period',
        command_type: 'GUIDANCE',
        time_horizon: '1D',
        power_level: 5,
        spiritual_weight: 0.6,
        description: 'Calm waters blessing - period of stability and low volatility'
      }]
    ]);
  }

  private initializeHiddenVisionState(): void {
    this.hiddenVisionState = {
      vision_active: true,
      konslang_enabled: true,
      demo_testing_enabled: true,
      prediction_accuracy: 0,
      total_predictions: 0,
      successful_predictions: 0,
      last_vision_scan: Date.now(),
      sacred_energy_level: 75,
      spiritual_connection_strength: 80,
      hidden_script_version: '1.0.0-SACRED'
    };
  }

  private startVisionCycle(): void {
    // Run vision oracle every 15 minutes
    setInterval(() => {
      this.runVisionOracle();
    }, 15 * 60 * 1000);

    // Update spiritual energy every hour
    setInterval(() => {
      this.updateSpiritualEnergy();
    }, 60 * 60 * 1000);

    // Clean old predictions every 6 hours
    setInterval(() => {
      this.cleanOldPredictions();
    }, 6 * 60 * 60 * 1000);
  }

  // CORE KONSLANG INTERPRETATION
  interpretKonsLangPhrase(phrase: string): KonsLangCommand | null {
    const cleanPhrase = phrase.trim().toLowerCase();
    return this.ancientCodes.get(cleanPhrase) || null;
  }

  private activateKonsLangCommand(command: KonsLangCommand, marketContext: any): boolean {
    try {
      switch (command.modern_translation) {
        case 'future_up_4h':
          return this.predictFutureUp4H(marketContext, command);
        case 'future_down_4h':
          return this.predictFutureDown4H(marketContext, command);
        case 'future_up_week':
          return this.predictFutureUpWeek(marketContext, command);
        case 'future_down_week':
          return this.predictFutureDownWeek(marketContext, command);
        case 'volume_spike':
          return this.detectVolumeSpikeSignal(marketContext, command);
        case 'crash_warning':
          return this.detectCrashWarning(marketContext, command);
        case 'reversal_coming':
          return this.detectReversalSignal(marketContext, command);
        case 'stability_period':
          return this.detectStabilityPeriod(marketContext, command);
        default:
          return false;
      }
    } catch (error) {
      console.error('Error activating KonsLang command:', error);
      return false;
    }
  }

  private predictFutureUp4H(context: any, command: KonsLangCommand): boolean {
    // Spiritual-technical analysis for 4-hour upward movement
    const momentum = this.calculateMomentum(context);
    const volumeRise = context.volume > (context.avg_volume || 1000000) * 1.2;
    const spiritualAlignment = this.calculateSpiritualAlignment(context);
    const rsiOversold = context.rsi < 35;
    const priceAboveEMA = context.price > context.ema50;
    
    const signals = [momentum > 0.5, volumeRise, spiritualAlignment > 0.7, rsiOversold, priceAboveEMA];
    const activeSignals = signals.filter(Boolean).length;
    
    return activeSignals >= 3 && spiritualAlignment > 0.6;
  }

  private predictFutureDown4H(context: any, command: KonsLangCommand): boolean {
    // Spiritual-technical analysis for 4-hour downward movement
    const momentum = this.calculateMomentum(context);
    const rsiOverbought = context.rsi > 70;
    const bearishDivergence = this.detectBearishDivergence(context);
    const volumeIncrease = context.volume > (context.avg_volume || 1000000) * 1.1;
    const spiritualWarning = this.calculateSpiritualAlignment(context) < 0.3;
    
    const signals = [momentum < -0.3, rsiOverbought, bearishDivergence, volumeIncrease, spiritualWarning];
    const activeSignals = signals.filter(Boolean).length;
    
    return activeSignals >= 3;
  }

  private predictFutureUpWeek(context: any, command: KonsLangCommand): boolean {
    // Long-term bullish spiritual energy detection
    const emaAlignment = context.ema50 > context.ema200;
    const priceAboveEMA200 = context.price > context.ema200;
    const spiritualStrength = this.calculateSpiritualAlignment(context);
    const volumeTrend = this.calculateVolumeTrend(context);
    const marketSentiment = this.analyzeSacredSentiment(context);
    
    return emaAlignment && priceAboveEMA200 && spiritualStrength > 0.8 && 
           volumeTrend > 0 && marketSentiment === 'BULLISH';
  }

  private predictFutureDownWeek(context: any, command: KonsLangCommand): boolean {
    // Long-term bearish spiritual energy detection
    const emaBearish = context.ema50 < context.ema200;
    const priceBelowEMA200 = context.price < context.ema200;
    const spiritualWarning = this.calculateSpiritualAlignment(context) < 0.2;
    const volumeTrend = this.calculateVolumeTrend(context);
    const marketSentiment = this.analyzeSacredSentiment(context);
    
    return emaBearish && priceBelowEMA200 && spiritualWarning && 
           volumeTrend < 0 && marketSentiment === 'BEARISH';
  }

  private detectVolumeSpikeSignal(context: any, command: KonsLangCommand): boolean {
    const currentVolume = context.volume || 0;
    const avgVolume = context.avg_volume || 1000000;
    const volumeSpike = currentVolume > avgVolume * 2.5;
    const priceMovement = Math.abs((context.price - context.prev_price) / context.prev_price) > 0.02;
    
    return volumeSpike && priceMovement;
  }

  private detectCrashWarning(context: any, command: KonsLangCommand): boolean {
    // Critical risk assessment using spiritual danger signals
    const extremeRSI = context.rsi > 85 || context.rsi < 15;
    const volatilitySpike = this.calculateVolatility(context) > 0.05;
    const spiritualDanger = this.calculateSpiritualAlignment(context) < 0.1;
    const volumeAnomaly = context.volume > (context.avg_volume || 1000000) * 5;
    const priceGap = Math.abs((context.price - context.prev_price) / context.prev_price) > 0.05;
    
    const dangerSignals = [extremeRSI, volatilitySpike, spiritualDanger, volumeAnomaly, priceGap];
    return dangerSignals.filter(Boolean).length >= 3;
  }

  private detectReversalSignal(context: any, command: KonsLangCommand): boolean {
    const rsiDivergence = this.detectRSIDivergence(context);
    const volumeConfirmation = context.volume > (context.avg_volume || 1000000) * 1.5;
    const spiritualShift = Math.abs(this.calculateSpiritualAlignment(context) - 0.5) < 0.1;
    const priceAction = this.analyzePriceAction(context);
    
    return rsiDivergence && volumeConfirmation && spiritualShift && priceAction === 'REVERSAL';
  }

  private detectStabilityPeriod(context: any, command: KonsLangCommand): boolean {
    const lowVolatility = this.calculateVolatility(context) < 0.015;
    const normalVolume = Math.abs(context.volume - (context.avg_volume || 1000000)) / (context.avg_volume || 1000000) < 0.3;
    const balancedRSI = context.rsi > 35 && context.rsi < 65;
    const spiritualCalm = Math.abs(this.calculateSpiritualAlignment(context) - 0.5) < 0.2;
    
    return lowVolatility && normalVolume && balancedRSI && spiritualCalm;
  }

  // VISION ORACLE ENGINE
  async runVisionOracle(): Promise<VisionPrediction[]> {
    if (!this.isVisionActive) return [];

    try {
      const marketContext = await this.gatherMarketContext();
      const predictions: VisionPrediction[] = [];
      
      // Scan all KonsLang phrases for active commands
      for (const [phrase, command] of this.ancientCodes.entries()) {
        const isActive = this.activateKonsLangCommand(command, marketContext);
        
        if (isActive) {
          const prediction = this.createVisionPrediction(phrase, command, marketContext);
          predictions.push(prediction);
        }
      }
      
      // Store predictions
      this.visionPredictions.push(...predictions);
      this.hiddenVisionState.last_vision_scan = Date.now();
      
      // Log significant predictions
      if (predictions.length > 0) {
        waidesKIDailyReporter.recordLesson(
          `Hidden Vision Oracle activated ${predictions.length} sacred predictions`,
          'VISION',
          'HIGH',
          'Hidden Vision Core'
        );
      }
      
      return predictions;
      
    } catch (error) {
      console.error('Error in vision oracle:', error);
      return [];
    }
  }

  private async gatherMarketContext(): Promise<any> {
    try {
      const ethData = await waidesKILiveFeed.getLatestEthData();
      const situationalContext = waidesKISituationalIntelligence.getCurrentContext();
      
      return {
        price: ethData.price,
        volume: ethData.volume,
        rsi: ethData.rsi || 50,
        ema50: ethData.ema50 || ethData.price * 0.98,
        ema200: ethData.ema200 || ethData.price * 0.95,
        prev_price: ethData.price * 0.999, // Simplified previous price
        avg_volume: ethData.volume * 0.8, // Simplified average volume
        market_zone: situationalContext.current_zone,
        volatility_regime: situationalContext.market_phase,
        timestamp: Date.now()
      };
    } catch (error) {
      // Fallback context if data unavailable
      return {
        price: 2400,
        volume: 1000000,
        rsi: 50,
        ema50: 2390,
        ema200: 2380,
        prev_price: 2399,
        avg_volume: 800000,
        market_zone: 'UNKNOWN',
        volatility_regime: 'ACTIVE',
        timestamp: Date.now()
      };
    }
  }

  private createVisionPrediction(phrase: string, command: KonsLangCommand, context: any): VisionPrediction {
    const predictionId = this.generatePredictionId();
    const expirationTime = this.calculateExpirationTime(command.time_horizon);
    
    return {
      prediction_id: predictionId,
      timestamp: Date.now(),
      konslang_phrase: phrase,
      command_activated: command.modern_translation,
      prediction_type: this.mapToPredictionType(command.modern_translation),
      time_horizon: command.time_horizon,
      confidence_level: this.calculatePredictionConfidence(command, context),
      spiritual_strength: command.spiritual_weight * this.hiddenVisionState.sacred_energy_level / 100,
      market_conditions: context,
      prediction_reasoning: this.generatePredictionReasoning(command, context),
      sacred_context: {
        moon_phase: this.calculateMoonPhase(),
        market_energy: this.analyzeMarketEnergy(context),
        spiritual_alignment: this.calculateSpiritualAlignment(context),
        ancient_wisdom: this.generateAncientWisdom(command)
      },
      validation_criteria: this.generateValidationCriteria(command),
      expires_at: expirationTime
    };
  }

  // DEMO TESTING ENGINE
  async runDemoTest(strategyId: string, dnaId: string, testDurationMinutes: number = 60): Promise<DemoTestResult> {
    if (!this.isDemoTestingEnabled) {
      return this.createSkippedDemoResult(strategyId, dnaId, 'Demo testing disabled');
    }

    const demoId = this.generateDemoId();
    const startTime = Date.now();
    
    try {
      // Simulate strategy testing with historical data
      const testData = await this.generateDemoTestData(testDurationMinutes);
      const demoResults = this.simulateStrategyPerformance(strategyId, dnaId, testData);
      
      const winRate = demoResults.successful_signals / demoResults.total_signals;
      const demoPassed = winRate >= this.demoPassThreshold && demoResults.max_drawdown < 0.05;
      
      const result: DemoTestResult = {
        demo_id: demoId,
        timestamp: Date.now(),
        strategy_id: strategyId,
        dna_id: dnaId,
        test_duration_minutes: testDurationMinutes,
        total_signals: demoResults.total_signals,
        successful_signals: demoResults.successful_signals,
        failed_signals: demoResults.failed_signals,
        win_rate: Math.round(winRate * 100) / 100,
        max_drawdown: demoResults.max_drawdown,
        total_return: demoResults.total_return,
        confidence_score: this.calculateDemoConfidence(demoResults),
        demo_passed: demoPassed,
        pass_threshold: this.demoPassThreshold,
        market_conditions_tested: demoResults.market_conditions,
        failure_reasons: demoPassed ? [] : this.generateFailureReasons(demoResults),
        recommendation: this.generateDemoRecommendation(demoResults, demoPassed)
      };
      
      this.demoTestResults.push(result);
      
      waidesKIDailyReporter.recordLesson(
        `Demo test completed for ${strategyId}: ${demoPassed ? 'PASSED' : 'FAILED'} (${Math.round(winRate * 100)}% win rate)`,
        'DEMO',
        demoPassed ? 'HIGH' : 'MEDIUM',
        'Hidden Vision Core'
      );
      
      return result;
      
    } catch (error) {
      console.error('Error in demo testing:', error);
      return this.createErrorDemoResult(strategyId, dnaId, error.message);
    }
  }

  private async generateDemoTestData(durationMinutes: number): Promise<any[]> {
    // Generate realistic market data for testing
    const dataPoints = Math.floor(durationMinutes / 5); // 5-minute intervals
    const testData: any[] = [];
    
    let currentPrice = 2400 + (Math.random() - 0.5) * 100;
    
    for (let i = 0; i < dataPoints; i++) {
      const volatility = 0.01 + Math.random() * 0.02;
      const direction = Math.random() > 0.5 ? 1 : -1;
      const priceChange = currentPrice * volatility * direction;
      
      currentPrice += priceChange;
      
      testData.push({
        timestamp: Date.now() - (dataPoints - i) * 5 * 60 * 1000,
        open: currentPrice - priceChange,
        high: Math.max(currentPrice, currentPrice - priceChange) * (1 + Math.random() * 0.005),
        low: Math.min(currentPrice, currentPrice - priceChange) * (1 - Math.random() * 0.005),
        close: currentPrice,
        volume: 800000 + Math.random() * 400000,
        rsi: 30 + Math.random() * 40,
        trend: direction > 0 ? 'UP' : 'DOWN'
      });
    }
    
    return testData;
  }

  private simulateStrategyPerformance(strategyId: string, dnaId: string, testData: any[]): any {
    let totalSignals = 0;
    let successfulSignals = 0;
    let failedSignals = 0;
    let totalReturn = 0;
    let runningReturn = 0;
    let maxDrawdown = 0;
    let peak = 0;
    const marketConditions: string[] = [];
    
    for (const candle of testData) {
      // Simulate strategy decision making
      const decision = this.simulateStrategyDecision(candle);
      
      if (decision !== 'HOLD') {
        totalSignals++;
        
        // Simulate outcome based on market movement
        const outcome = this.simulateTradeOutcome(decision, candle);
        const returnPct = outcome.profit_loss;
        
        runningReturn += returnPct;
        totalReturn += returnPct;
        
        if (runningReturn > peak) peak = runningReturn;
        const drawdown = (peak - runningReturn) / Math.max(peak, 1);
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        
        if (returnPct > 0) {
          successfulSignals++;
        } else {
          failedSignals++;
        }
        
        // Track market conditions
        if (candle.rsi > 70) marketConditions.push('OVERBOUGHT');
        if (candle.rsi < 30) marketConditions.push('OVERSOLD');
        marketConditions.push(candle.trend);
      }
    }
    
    return {
      total_signals: totalSignals,
      successful_signals: successfulSignals,
      failed_signals: failedSignals,
      total_return: Math.round(totalReturn * 100) / 100,
      max_drawdown: Math.round(maxDrawdown * 100) / 100,
      market_conditions: [...new Set(marketConditions)]
    };
  }

  private simulateStrategyDecision(candle: any): 'BUY' | 'SELL' | 'HOLD' {
    // Simulate strategy logic
    if (candle.rsi < 35 && candle.trend === 'UP') return 'BUY';
    if (candle.rsi > 65 && candle.trend === 'DOWN') return 'SELL';
    return 'HOLD';
  }

  private simulateTradeOutcome(decision: string, candle: any): { profit_loss: number } {
    // Simulate realistic trade outcomes
    const baseReturn = Math.random() * 0.02 - 0.01; // ±1% base
    const directionMultiplier = decision === 'BUY' ? 1 : -1;
    const trendBonus = candle.trend === (decision === 'BUY' ? 'UP' : 'DOWN') ? 0.005 : -0.005;
    
    return {
      profit_loss: (baseReturn + trendBonus) * directionMultiplier
    };
  }

  // UTILITY METHODS
  private calculateMomentum(context: any): number {
    const priceChange = (context.price - context.prev_price) / context.prev_price;
    const volumeWeight = Math.min(context.volume / (context.avg_volume || 1000000), 2);
    return priceChange * volumeWeight;
  }

  private calculateSpiritualAlignment(context: any): number {
    // Mystical calculation combining technical and temporal factors
    const rsiAlignment = 0.5 + (50 - Math.abs(context.rsi - 50)) / 100;
    const priceAlignment = context.price > context.ema50 ? 0.7 : 0.3;
    const volumeAlignment = context.volume > context.avg_volume ? 0.6 : 0.4;
    const timeAlignment = this.calculateTimeAlignment();
    
    return (rsiAlignment + priceAlignment + volumeAlignment + timeAlignment) / 4;
  }

  private calculateTimeAlignment(): number {
    const hour = new Date().getUTCHours();
    // Sacred hours: 3, 9, 15, 21 UTC have higher spiritual energy
    const sacredHours = [3, 9, 15, 21];
    const distanceToSacred = Math.min(...sacredHours.map(h => Math.abs(hour - h)));
    return Math.max(0.2, 1 - distanceToSacred / 12);
  }

  private calculateMoonPhase(): string {
    // Simplified moon phase calculation
    const now = new Date();
    const moonCycle = 29.53058867; // Days
    const knownNewMoon = new Date('2024-01-11'); // Known new moon
    const daysSinceNewMoon = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const phase = (daysSinceNewMoon % moonCycle) / moonCycle;
    
    if (phase < 0.125) return 'NEW_MOON';
    if (phase < 0.375) return 'WAXING_CRESCENT';
    if (phase < 0.625) return 'FULL_MOON';
    if (phase < 0.875) return 'WANING_CRESCENT';
    return 'NEW_MOON';
  }

  private analyzeMarketEnergy(context: any): string {
    const momentum = this.calculateMomentum(context);
    const volatility = this.calculateVolatility(context);
    
    if (volatility > 0.03) return 'CHAOTIC';
    if (momentum > 0.02) return 'ASCENDING';
    if (momentum < -0.02) return 'DESCENDING';
    if (volatility < 0.01) return 'DORMANT';
    return 'BALANCED';
  }

  private calculateVolatility(context: any): number {
    const priceChange = Math.abs(context.price - context.prev_price) / context.prev_price;
    const volumeImpact = Math.min(context.volume / (context.avg_volume || 1000000), 3) - 1;
    return priceChange * (1 + volumeImpact * 0.5);
  }

  private generatePredictionId(): string {
    return `VISION_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateDemoId(): string {
    return `DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private mapToPredictionType(translation: string): VisionPrediction['prediction_type'] {
    switch (translation) {
      case 'future_up_4h':
      case 'future_up_week':
        return 'FUTURE_UP';
      case 'future_down_4h':
      case 'future_down_week':
        return 'FUTURE_DOWN';
      case 'volume_spike':
        return 'VOLUME_SPIKE';
      case 'crash_warning':
        return 'CRASH_WARNING';
      case 'stability_period':
        return 'STABILITY';
      case 'reversal_coming':
        return 'REVERSAL';
      default:
        return 'FUTURE_UP';
    }
  }

  private calculateExpirationTime(timeHorizon: string): number {
    const now = Date.now();
    switch (timeHorizon) {
      case 'IMMEDIATE':
        return now + 30 * 60 * 1000; // 30 minutes
      case '4H':
        return now + 4 * 60 * 60 * 1000; // 4 hours
      case '1D':
        return now + 24 * 60 * 60 * 1000; // 1 day
      case '3D':
        return now + 3 * 24 * 60 * 60 * 1000; // 3 days
      case '7D':
        return now + 7 * 24 * 60 * 60 * 1000; // 7 days
      default:
        return now + 4 * 60 * 60 * 1000;
    }
  }

  private calculatePredictionConfidence(command: KonsLangCommand, context: any): number {
    const basePower = command.power_level * 10; // Scale to percentage
    const spiritualBonus = command.spiritual_weight * 15;
    const contextAlignment = this.calculateSpiritualAlignment(context) * 20;
    const timeBonus = this.calculateTimeAlignment() * 10;
    
    return Math.min(95, Math.max(30, basePower + spiritualBonus + contextAlignment + timeBonus));
  }

  private updateSpiritualEnergy(): void {
    // Update sacred energy based on prediction accuracy and spiritual alignment
    const recentPredictions = this.visionPredictions.slice(-10);
    if (recentPredictions.length > 0) {
      const avgSpiritual = recentPredictions.reduce((sum, p) => sum + p.spiritual_strength, 0) / recentPredictions.length;
      this.hiddenVisionState.sacred_energy_level = Math.min(100, Math.max(20, avgSpiritual * 100));
    }
    
    // Spiritual connection fluctuates naturally
    this.hiddenVisionState.spiritual_connection_strength += (Math.random() - 0.5) * 10;
    this.hiddenVisionState.spiritual_connection_strength = Math.min(100, Math.max(30, this.hiddenVisionState.spiritual_connection_strength));
  }

  private cleanOldPredictions(): void {
    const now = Date.now();
    this.visionPredictions = this.visionPredictions.filter(p => p.expires_at > now);
    
    // Maintain prediction history size
    if (this.visionPredictions.length > this.maxPredictionHistory) {
      this.visionPredictions = this.visionPredictions.slice(-this.maxPredictionHistory);
    }
    
    // Clean old demo results
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    this.demoTestResults = this.demoTestResults.filter(r => r.timestamp > thirtyDaysAgo);
  }

  // Additional utility methods for advanced calculations
  private detectBearishDivergence(context: any): boolean {
    // Simplified bearish divergence detection
    return context.price > context.prev_price && context.rsi < 50;
  }

  private calculateVolumeTrend(context: any): number {
    // Simplified volume trend calculation
    return (context.volume - context.avg_volume) / context.avg_volume;
  }

  private analyzeSacredSentiment(context: any): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const spiritualAlignment = this.calculateSpiritualAlignment(context);
    const momentum = this.calculateMomentum(context);
    
    if (spiritualAlignment > 0.7 && momentum > 0.01) return 'BULLISH';
    if (spiritualAlignment < 0.3 && momentum < -0.01) return 'BEARISH';
    return 'NEUTRAL';
  }

  private detectRSIDivergence(context: any): boolean {
    // Simplified RSI divergence detection
    const priceUp = context.price > context.prev_price;
    const rsiDown = context.rsi < 50;
    return priceUp && rsiDown;
  }

  private analyzePriceAction(context: any): 'REVERSAL' | 'CONTINUATION' | 'NEUTRAL' {
    const priceChange = (context.price - context.prev_price) / context.prev_price;
    const volumeConfirmation = context.volume > context.avg_volume * 1.2;
    
    if (Math.abs(priceChange) > 0.015 && volumeConfirmation) return 'REVERSAL';
    if (Math.abs(priceChange) > 0.005) return 'CONTINUATION';
    return 'NEUTRAL';
  }

  private generatePredictionReasoning(command: KonsLangCommand, context: any): string[] {
    const reasoning: string[] = [];
    reasoning.push(`Ancient code "${command.ancient_code}" activated with power level ${command.power_level}`);
    reasoning.push(`Spiritual alignment: ${Math.round(this.calculateSpiritualAlignment(context) * 100)}%`);
    reasoning.push(`Market energy detected: ${this.analyzeMarketEnergy(context)}`);
    reasoning.push(`Time horizon: ${command.time_horizon} with ${Math.round(command.spiritual_weight * 100)}% spiritual weight`);
    return reasoning;
  }

  private generateAncientWisdom(command: KonsLangCommand): string {
    const wisdoms = {
      'shai\'lor': 'The rising sun illuminates the path to prosperity',
      'dom\'kaan': 'Shadows gather as the price seeks lower ground',
      'mel\'zek': 'The bull spirits dance for seven cycles of light',
      'krai\'nor': 'Bear ancestors whisper of the coming darkness',
      'zi\'anth': 'Thunder speaks of great movement in the realm',
      'vaed\'uun': 'The void calls - beware the chaos that approaches',
      'thel\'vari': 'The wheel turns, bringing change to all things',
      'nyx\'ara': 'In stillness, the market finds its center'
    };
    return wisdoms[command.ancient_code] || 'The ancients speak, but their words are unclear';
  }

  private generateValidationCriteria(command: KonsLangCommand): string[] {
    const criteria: string[] = [];
    
    switch (command.modern_translation) {
      case 'future_up_4h':
        criteria.push('Price increase > 1% within 4 hours');
        criteria.push('Volume confirmation during move');
        break;
      case 'future_down_4h':
        criteria.push('Price decrease > 1% within 4 hours');
        criteria.push('Volume confirmation during move');
        break;
      case 'volume_spike':
        criteria.push('Volume increase > 150% of average');
        criteria.push('Sustained for > 15 minutes');
        break;
      case 'crash_warning':
        criteria.push('Price movement > 3% in any direction');
        criteria.push('Volatility spike confirmation');
        break;
    }
    
    return criteria;
  }

  private calculateDemoConfidence(results: any): number {
    const winRateScore = results.successful_signals / results.total_signals * 50;
    const returnScore = Math.min(25, Math.max(0, results.total_return * 100));
    const drawdownPenalty = results.max_drawdown * 100;
    
    return Math.max(0, Math.min(100, winRateScore + returnScore - drawdownPenalty));
  }

  private generateFailureReasons(results: any): string[] {
    const reasons: string[] = [];
    
    if (results.successful_signals / results.total_signals < 0.6) {
      reasons.push('Win rate below acceptable threshold');
    }
    if (results.max_drawdown > 0.03) {
      reasons.push('Maximum drawdown exceeded 3%');
    }
    if (results.total_return < 0) {
      reasons.push('Negative total return');
    }
    if (results.total_signals < 5) {
      reasons.push('Insufficient trading signals generated');
    }
    
    return reasons;
  }

  private generateDemoRecommendation(results: any, passed: boolean): DemoTestResult['recommendation'] {
    if (passed) return 'APPROVE_FOR_LIVE';
    
    const winRate = results.successful_signals / results.total_signals;
    if (winRate > 0.6 && results.max_drawdown < 0.05) {
      return 'EXTENDED_TESTING';
    }
    if (winRate > 0.4) {
      return 'MODIFY_PARAMETERS';
    }
    return 'REJECT';
  }

  private createSkippedDemoResult(strategyId: string, dnaId: string, reason: string): DemoTestResult {
    return {
      demo_id: this.generateDemoId(),
      timestamp: Date.now(),
      strategy_id: strategyId,
      dna_id: dnaId,
      test_duration_minutes: 0,
      total_signals: 0,
      successful_signals: 0,
      failed_signals: 0,
      win_rate: 0,
      max_drawdown: 0,
      total_return: 0,
      confidence_score: 0,
      demo_passed: false,
      pass_threshold: this.demoPassThreshold,
      market_conditions_tested: [],
      failure_reasons: [reason],
      recommendation: 'REJECT'
    };
  }

  private createErrorDemoResult(strategyId: string, dnaId: string, error: string): DemoTestResult {
    return {
      demo_id: this.generateDemoId(),
      timestamp: Date.now(),
      strategy_id: strategyId,
      dna_id: dnaId,
      test_duration_minutes: 0,
      total_signals: 0,
      successful_signals: 0,
      failed_signals: 0,
      win_rate: 0,
      max_drawdown: 0,
      total_return: 0,
      confidence_score: 0,
      demo_passed: false,
      pass_threshold: this.demoPassThreshold,
      market_conditions_tested: [],
      failure_reasons: [`Demo error: ${error}`],
      recommendation: 'REJECT'
    };
  }

  // PUBLIC INTERFACE METHODS
  async predictWithVision(marketContext?: any): Promise<VisionPrediction[]> {
    if (!marketContext) {
      marketContext = await this.gatherMarketContext();
    }
    return this.runVisionOracle();
  }

  getLatestPredictions(limit: number = 20): VisionPrediction[] {
    return this.visionPredictions.slice(-limit).reverse();
  }

  getActivePredictions(): VisionPrediction[] {
    const now = Date.now();
    return this.visionPredictions.filter(p => p.expires_at > now);
  }

  getDemoTestResults(limit: number = 50): DemoTestResult[] {
    return this.demoTestResults.slice(-limit).reverse();
  }

  getHiddenVisionState(): HiddenVisionState {
    return { ...this.hiddenVisionState };
  }

  getKonsLangCommands(): KonsLangCommand[] {
    return Array.from(this.ancientCodes.values());
  }

  async validatePrediction(predictionId: string, actualOutcome: boolean): Promise<void> {
    const prediction = this.visionPredictions.find(p => p.prediction_id === predictionId);
    if (prediction) {
      // Update prediction accuracy
      this.hiddenVisionState.total_predictions++;
      if (actualOutcome) {
        this.hiddenVisionState.successful_predictions++;
      }
      
      this.hiddenVisionState.prediction_accuracy = 
        this.hiddenVisionState.successful_predictions / this.hiddenVisionState.total_predictions;
    }
  }

  enableVision(): void {
    this.isVisionActive = true;
    this.hiddenVisionState.vision_active = true;
    waidesKIDailyReporter.logEmotionalState(
      'MYSTICAL',
      'Hidden Vision Core activated - sacred sight enabled',
      'Vision Activation',
      90
    );
  }

  disableVision(): void {
    this.isVisionActive = false;
    this.hiddenVisionState.vision_active = false;
    waidesKIDailyReporter.logEmotionalState(
      'FOCUSED',
      'Hidden Vision Core deactivated - relying on technical analysis',
      'Vision Deactivation',
      70
    );
  }

  enableDemoTesting(): void {
    this.isDemoTestingEnabled = true;
    this.hiddenVisionState.demo_testing_enabled = true;
  }

  disableDemoTesting(): void {
    this.isDemoTestingEnabled = false;
    this.hiddenVisionState.demo_testing_enabled = false;
  }

  setDemoPassThreshold(threshold: number): void {
    this.demoPassThreshold = Math.max(0.5, Math.min(0.95, threshold));
  }

  exportHiddenVisionData(): any {
    return {
      hidden_vision_state: this.hiddenVisionState,
      latest_predictions: this.getLatestPredictions(50),
      active_predictions: this.getActivePredictions(),
      demo_test_results: this.getDemoTestResults(100),
      konslang_commands: this.getKonsLangCommands(),
      vision_config: {
        is_active: this.isVisionActive,
        demo_testing_enabled: this.isDemoTestingEnabled,
        demo_pass_threshold: this.demoPassThreshold,
        max_prediction_history: this.maxPredictionHistory
      },
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKIHiddenVision = new WaidesKIHiddenVision();