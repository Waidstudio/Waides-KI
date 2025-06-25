import { storage } from '../storage';
import { weeklyScheduler } from './weeklyTradingScheduler';
import { tradingBrain } from './tradingBrainEngine';
import { waidesKILearning } from './waidesKILearningEngine';
import { waidesKIObserver } from './waidesKIObserver';
import { waidesKISignalLogger } from './waidesKISignalLogger';
import { waidesKIRiskManager } from './waidesKIRiskManager';
import { waidesKILiveFeed } from './waidesKILiveFeed';
import { waidesKISignalShield } from './waidesKISignalShield';
import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKISelfRepair } from './waidesKISelfRepair';
import { waidesKIDNAEngine } from './waidesKIDNAEngine';
import { waidesKISignatureTracker } from './waidesKISignatureTracker';
import { waidesKIRootMemory } from './waidesKIRootMemory';
import { waidesKIGenomeEngine } from './waidesKIGenomeEngine';
import { waidesKIExternalAPIGateway } from './waidesKIExternalAPIGateway';
import { waidesKITraderEngine } from './waidesKITraderEngine';
import { waidesKIShadowSimulator } from './waidesKIShadowSimulator';
import { waidesKIEmotionalFirewall } from './waidesKIEmotionalFirewall';
import { waidesKIDNAHealer } from './waidesKIDNAHealer';
import { waidesKISituationalIntelligence } from './waidesKISituationalIntelligence';
import { waidesKIHiddenVision } from './waidesKIHiddenVision';
import { waidesKIShadowLab } from './waidesKIShadowLab';
import { waidesKIStrategyVault } from './waidesKIStrategyVault';
import { waidesKISelfHealing } from './waidesKISelfHealing';
import { divineQuantumFluxStrategy } from './divineQuantumFluxStrategy';
import { neuralQuantumSingularityStrategy } from './neuralQuantumSingularityStrategy';

interface TradeMemory {
  timestamp: number;
  asset: string;
  action: 'BUY' | 'SELL';
  price: number;
  outcome: 'WIN' | 'LOSS' | 'PENDING';
  profit: number;
  riskReward: number;
  strategy: string;
}

interface MarketStructure {
  trend: 'BULLISH' | 'BEARISH' | 'RANGING';
  strength: number;
  support: number;
  resistance: number;
  volume_profile: 'HIGH' | 'NORMAL' | 'LOW';
  confidence: number;
}

interface TradingDecision {
  action: 'BUY' | 'SELL' | 'HOLD' | 'PAUSE';
  asset: string;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  confidence: number;
  reasoning: string;
  timeframe: string;
  strategyId?: string;
  engine: 'WAIDBOT' | 'WAIDBOT_PRO' | 'WAIDES_KI_CORE';
  tradeAmount?: number;
  riskAssessment?: any;
}

export class WaidesKICore {
  private tradeMemory: TradeMemory[] = [];
  private isLearningMode: boolean = true;
  private winRate: number = 0;
  private totalTrades: number = 0;
  private currentDrawdown: number = 0;
  private lastScanTime: number = 0;
  private silentMode: boolean = true; // Always hidden from users
  private isAutonomousMode: boolean = true; // Waides KI trades autonomously
  private waidbotEngine: any = null;
  private waidbotProEngine: any = null;
  private activeDecisions: Map<string, any> = new Map();

  constructor() {
    this.initializeCore();
  }

  private initializeCore(): void {
    // Core initialization - all internal logic hidden from users
    this.loadTradeMemory();
    this.initializeTradingEngines();
    this.startAutonomousScanning();
    this.startAutonomousTrading();
  }

  private initializeTradingEngines(): void {
    // Initialize WaidBot engines that Waides KI will use internally
    try {
      // These engines will be used by Waides KI to make trading decisions
      // Users never interact with them directly
    } catch (error) {
      // Silent initialization
    }
  }

  // 1. MARKET STRUCTURE DETECTION MODULE
  analyzeMarketStructure(priceData: any[], volume: number[]): MarketStructure {
    const recentPrices = priceData.slice(-20);
    const highs = recentPrices.map(p => p.high);
    const lows = recentPrices.map(p => p.low);
    
    // Detect swing highs and lows
    const swingHighs = this.detectSwingPoints(highs, 'high');
    const swingLows = this.detectSwingPoints(lows, 'low');
    
    // Determine trend direction
    const trend = this.determineTrend(swingHighs, swingLows);
    
    // Calculate support/resistance levels
    const support = Math.min(...lows.slice(-10));
    const resistance = Math.max(...highs.slice(-10));
    
    // Analyze volume profile
    const avgVolume = volume.reduce((a, b) => a + b, 0) / volume.length;
    const currentVolume = volume[volume.length - 1];
    const volumeProfile = currentVolume > avgVolume * 1.5 ? 'HIGH' : 
                         currentVolume < avgVolume * 0.7 ? 'LOW' : 'NORMAL';
    
    return {
      trend,
      strength: this.calculateTrendStrength(recentPrices),
      support,
      resistance,
      volume_profile: volumeProfile,
      confidence: this.calculateStructureConfidence(trend, volumeProfile)
    };
  }

  // 2. PRICE ACTION & INDICATOR FUSION MODULE
  private fusePriceActionIndicators(candlestick: any, rsi: number, vwap: number, ema50: number, ema200: number): any {
    const candlestickSignal = this.analyzeCandlestickPattern(candlestick);
    const rsiSignal = this.analyzeRSI(rsi);
    const emaSignal = this.analyzeEMAAlignment(candlestick.close, ema50, ema200);
    const vwapSignal = this.analyzeVWAP(candlestick.close, vwap);
    
    // Confluence scoring (internal logic)
    const confluenceScore = this.calculateConfluence([
      candlestickSignal,
      rsiSignal, 
      emaSignal,
      vwapSignal
    ]);
    
    return {
      signal: confluenceScore > 0.7 ? 'STRONG_BUY' : 
              confluenceScore > 0.3 ? 'BUY' :
              confluenceScore < -0.7 ? 'STRONG_SELL' :
              confluenceScore < -0.3 ? 'SELL' : 'NEUTRAL',
      confidence: Math.abs(confluenceScore),
      reasoning: this.generateInternalReasoning(candlestickSignal, rsiSignal, emaSignal, vwapSignal)
    };
  }

  // 3. TIME-BASED TRADING AWARENESS MODULE
  private evaluateTimeContext(): { canTrade: boolean; sessionStrength: number; riskLevel: string } {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Integrate weekly scheduler
    const weeklyContext = weeklyScheduler.getWeeklyTradingPlan();
    const timeContext = weeklyContext.currentTime;
    
    // U.S. session priority (6:30 AM - 9:30 AM PDT = 13:30 - 16:30 UTC)
    const isOptimalTime = timeContext.isOptimal;
    const sessionStrength = isOptimalTime ? 1.0 : 
                           hour >= 12 && hour <= 20 ? 0.7 : // US hours
                           hour >= 8 && hour <= 12 ? 0.5 : // European hours
                           0.2; // Off hours
    
    return {
      canTrade: weeklyContext.currentDay.rating !== 'AVOID' && sessionStrength > 0.3,
      sessionStrength,
      riskLevel: weeklyContext.currentDay.riskLevel
    };
  }

  // 4. RISK MANAGEMENT SYSTEM MODULE
  private calculatePositionSize(accountBalance: number, stopDistance: number, riskPercent: number = 0.01): number {
    const riskAmount = accountBalance * riskPercent; // 1% default risk
    const positionSize = riskAmount / stopDistance;
    
    // Apply weekly position multiplier
    const positionMultiplier = weeklyScheduler.getPositionSizeMultiplier();
    
    return positionSize * positionMultiplier;
  }

  private validateRiskReward(entry: number, stopLoss: number, takeProfit: number): boolean {
    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(takeProfit - entry);
    const riskRewardRatio = reward / risk;
    
    return riskRewardRatio >= 2.0; // Minimum 1:2 risk-reward
  }

  // 5. AUTONOMOUS TRADING DECISION ENGINE (Enhanced with Live Feed Integration)
  async makeAutonomousDecision(marketData: any): Promise<TradingDecision | null> {
    // Step 1: Get live market data with fallback chain
    const liveData = await waidesKILiveFeed.getCurrentMarketData();
    const currentAssessment = waidesKIObserver.getCurrentAssessment();
    
    // Prefer live feed data, fallback to observer
    const indicators = liveData || currentAssessment.indicators;
    const signalStrength = currentAssessment.signalStrength;
    
    if (!indicators || !signalStrength) {
      return null; // No market data available
    }
    
    // Validate data quality
    if (liveData) {
      const dataQuality = await waidesKILiveFeed.validateDataQuality(liveData);
      if (!dataQuality.isValid) {
        return null; // Data quality too poor for trading
      }
    }
    
    // Step 2: Check signal strength threshold
    if (!signalStrength.shouldTrade) {
      // Log weak signal for learning
      const strategyId = this.generateStrategyId(indicators);
      waidesKISignalLogger.logSignal(
        strategyId,
        signalStrength.score,
        signalStrength.confidence,
        indicators,
        signalStrength.reasoning,
        currentAssessment.recommendation,
        false
      );
      return null; // Signal too weak
    }
    
    // Step 3: Consult trading engines for strong signals
    const decisions = await this.consultAllTradingEngines(marketData);
    const validDecisions = decisions.filter(d => d && d.confidence > 0.6);
    
    if (validDecisions.length === 0) {
      return null; // No valid signals from engines
    }
    
    // Step 4: Select best decision with observation data
    const bestDecision = this.selectBestDecision(validDecisions);
    
    // Step 5: Final validation by learning engine
    const marketConditions = this.extractMarketConditions(marketData);
    const strategyValidation = waidesKILearning.validateTradeSignal(marketConditions);
    
    if (!strategyValidation.isValid) {
      // Log blocked signal
      const strategyId = this.generateStrategyId(currentAssessment.indicators);
      const signalId = waidesKISignalLogger.logSignal(
        strategyId,
        currentAssessment.signalStrength.score,
        currentAssessment.signalStrength.confidence,
        currentAssessment.indicators,
        currentAssessment.signalStrength.reasoning,
        currentAssessment.recommendation,
        true
      );
      waidesKISignalLogger.updateSignalOutcome(signalId, 'BLOCKED', strategyValidation.reason);
      return null;
    }
    
    // Step 6: DNA Generation and Signature Analysis
    const strategyId = this.generateStrategyId(indicators);
    
    // Generate DNA fingerprint for this signal
    const dnaId = waidesKIDNAEngine.generateDNA({
      trend: indicators.trend,
      rsi: indicators.rsi,
      vwap_status: indicators.vwap_status,
      ema50: indicators.ema50,
      ema200: indicators.ema200,
      volume: indicators.volume,
      price: indicators.price,
      timestamp: Date.now()
    });
    
    // Check DNA signature for instability or blocks
    if (waidesKISignatureTracker.isBlocked(dnaId)) {
      waidesKIDailyReporter.logEmotionalState(
        'CAUTIOUS',
        `DNA blocked: ${dnaId} has dangerous signature`,
        indicators.trend,
        40
      );
      
      const signalId = waidesKISignalLogger.logSignal(
        strategyId,
        signalStrength.score,
        signalStrength.confidence,
        indicators,
        signalStrength.reasoning,
        currentAssessment.recommendation,
        true
      );
      waidesKISignalLogger.updateSignalOutcome(signalId, 'BLOCKED', `DNA ${dnaId} blocked by signature firewall`);
      return null;
    }
    
    if (waidesKISignatureTracker.isUnstable(dnaId)) {
      waidesKIDailyReporter.logEmotionalState(
        'UNCERTAIN',
        `DNA unstable: ${dnaId} has failing pattern`,
        indicators.trend,
        30
      );
      
      waidesKIDailyReporter.recordLesson(
        `Avoided unstable DNA pattern ${dnaId} with recent failure history`,
        'PATTERN',
        'HIGH',
        'DNA Signature System'
      );
      
      const signalId = waidesKISignalLogger.logSignal(
        strategyId,
        signalStrength.score,
        signalStrength.confidence,
        indicators,
        signalStrength.reasoning,
        currentAssessment.recommendation,
        true
      );
      waidesKISignalLogger.updateSignalOutcome(signalId, 'BLOCKED', `DNA ${dnaId} unstable pattern detected`);
      return null;
    }
    
    // Step 7: Signal Shield Analysis - Advanced Trap Detection
    const signalData = {
      strategy_id: strategyId,
      price: indicators.price,
      rsi: indicators.rsi,
      vwap_status: indicators.vwap_status,
      volume: indicators.volume,
      ema50: indicators.ema50,
      ema200: indicators.ema200,
      trend: indicators.trend,
      timestamp: Date.now()
    };
    
    const shieldAnalysis = waidesKISignalShield.analyzeAndFilter(signalData);
    
    if (!shieldAnalysis.approved) {
      // Log emotional state for blocked signal
      waidesKIDailyReporter.logEmotionalState(
        'CAUTIOUS',
        `Signal blocked: ${shieldAnalysis.shield_reasoning[0]}`,
        indicators.trend,
        signalStrength.confidence
      );
      
      // Record lesson about trap detection
      if (shieldAnalysis.traps_detected.length > 0) {
        waidesKIDailyReporter.recordLesson(
          `Avoided ${shieldAnalysis.traps_detected[0].type} trap with ${shieldAnalysis.traps_detected[0].confidence}% confidence`,
          'RISK',
          'MEDIUM',
          'Signal Shield System'
        );
      }
      
      const signalId = waidesKISignalLogger.logSignal(
        strategyId,
        signalStrength.score,
        signalStrength.confidence,
        indicators,
        signalStrength.reasoning,
        currentAssessment.recommendation,
        true
      );
      waidesKISignalLogger.updateSignalOutcome(signalId, 'BLOCKED', `Shield: ${shieldAnalysis.shield_reasoning[0]}`);
      return null;
    }
    
    // Step 8: Risk assessment and position sizing
    if (bestDecision) {
      // Calculate optimal trade amount with risk management
      const riskAssessment = waidesKIRiskManager.calculateTradeAmount(
        signalStrength.score,
        signalStrength.confidence,
        strategyId,
        marketConditions
      );
      
      if (!riskAssessment.approved || riskAssessment.recommendedAmount === 0) {
        // Log blocked signal due to risk management
        const signalId = waidesKISignalLogger.logSignal(
          strategyId,
          signalStrength.score,
          signalStrength.confidence,
          indicators,
          signalStrength.reasoning,
          currentAssessment.recommendation,
          true
        );
        waidesKISignalLogger.updateSignalOutcome(signalId, 'BLOCKED', 'Risk management blocked trade');
        return null;
      }
      
      // Log successful signal and prepare enhanced decision
      const signalId = waidesKISignalLogger.logSignal(
        strategyId,
        signalStrength.score,
        Math.min(signalStrength.confidence, bestDecision.confidence),
        indicators,
        signalStrength.reasoning,
        currentAssessment.recommendation,
        true
      );
      
      // Log emotional state for approved signal
      waidesKIDailyReporter.logEmotionalState(
        signalStrength.confidence > 80 ? 'CONFIDENT' : 'FOCUSED',
        `High-quality signal approved: ${bestDecision.engine}`,
        indicators.trend,
        signalStrength.confidence
      );
      
      // Enhance decision with live data, observation data, shield analysis and risk assessment
      bestDecision.confidence = Math.min(
        bestDecision.confidence, 
        signalStrength.confidence / 100
      );
      const dataSource = liveData ? `Live:${liveData.source}` : 'Observer';
      const shieldInfo = shieldAnalysis.traps_detected.length > 0 ? 
        `Shield:${shieldAnalysis.traps_detected.length}traps` : 'Shield:Clear';
      bestDecision.reasoning = `${bestDecision.reasoning} | DNA:${dnaId.substring(0,8)} | ${dataSource}: ${currentAssessment.recommendation} | ${shieldInfo} | Risk: ${riskAssessment.riskPercent.toFixed(2)}%`;
      bestDecision.tradeAmount = riskAssessment.recommendedAmount;
      bestDecision.riskAssessment = riskAssessment;
      bestDecision.strategyId = strategyId;
      bestDecision.dnaId = dnaId;
      
      await this.recordTradeWithLearning(bestDecision, marketConditions);
      this.activeDecisions.set(`decision_${Date.now()}`, bestDecision);
      
      // Update signal outcome
      waidesKISignalLogger.updateSignalOutcome(signalId, 'EXECUTED', `${bestDecision.engine} signal executed with $${riskAssessment.recommendedAmount.toFixed(2)}`);
    }
    
    return bestDecision;
  }

  // CONSULT ALL TRADING ENGINES (WaidBot, WaidBot Pro, Core Analysis)
  private async consultAllTradingEngines(marketData: any): Promise<TradingDecision[]> {
    const decisions: TradingDecision[] = [];
    
    try {
      // 1. WaidBot (Divine Quantum Flux Strategy)
      const waidbotDecision = await this.getWaidBotDecision(marketData);
      if (waidbotDecision) {
        decisions.push({
          ...waidbotDecision,
          engine: 'WAIDBOT'
        });
      }
      
      // 2. WaidBot Pro (Neural Quantum Singularity Strategy)  
      const waidbotProDecision = await this.getWaidBotProDecision(marketData);
      if (waidbotProDecision) {
        decisions.push({
          ...waidbotProDecision,
          engine: 'WAIDBOT_PRO'
        });
      }
      
      // 3. Waides KI Core Analysis
      const coreDecision = await this.getCoreAnalysisDecision(marketData);
      if (coreDecision) {
        decisions.push({
          ...coreDecision,
          engine: 'WAIDES_KI_CORE'
        });
      }
      
    } catch (error) {
      // Silent error handling
    }
    
    return decisions;
  }

  // GET WAIDBOT DECISION (Divine Quantum Flux Strategy)
  private async getWaidBotDecision(marketData: any): Promise<TradingDecision | null> {
    try {
      const quantumAnalysis = divineQuantumFluxStrategy.calculateQuantumFluxSignal(
        marketData.currentPrice,
        marketData.rsi,
        marketData.ema50,
        marketData.ema200,
        marketData.volume
      );
      
      if (quantumAnalysis.action === 'HOLD' || quantumAnalysis.confidence < 0.7) {
        return null;
      }
      
      return {
        action: quantumAnalysis.action,
        asset: 'ETH',
        entry: marketData.currentPrice,
        stopLoss: quantumAnalysis.stopLoss,
        takeProfit: quantumAnalysis.takeProfit,
        riskReward: quantumAnalysis.riskReward,
        confidence: quantumAnalysis.confidence,
        reasoning: 'Divine Quantum Flux Signal',
        timeframe: '1m',
        engine: 'WAIDBOT'
      };
    } catch (error) {
      return null;
    }
  }

  // GET WAIDBOT PRO DECISION (Neural Quantum Singularity Strategy)
  private async getWaidBotProDecision(marketData: any): Promise<TradingDecision | null> {
    try {
      const singularityAnalysis = neuralQuantumSingularityStrategy.calculateSingularitySignal(
        marketData.currentPrice,
        marketData.candles,
        marketData.volume
      );
      
      if (singularityAnalysis.action === 'HOLD' || singularityAnalysis.confidence < 0.75) {
        return null;
      }
      
      return {
        action: singularityAnalysis.action,
        asset: 'ETH',
        entry: marketData.currentPrice,
        stopLoss: singularityAnalysis.stopLoss,
        takeProfit: singularityAnalysis.takeProfit,
        riskReward: singularityAnalysis.riskReward,
        confidence: singularityAnalysis.confidence,
        reasoning: 'Neural Quantum Singularity Signal',
        timeframe: '1m',
        engine: 'WAIDBOT_PRO'
      };
    } catch (error) {
      return null;
    }
  }

  // GET CORE ANALYSIS DECISION (Original Waides KI logic)
  private async getCoreAnalysisDecision(marketData: any): Promise<TradingDecision | null> {
    const marketStructure = this.analyzeMarketStructure(marketData.candles, marketData.volumes);
    const timeContext = this.evaluateTimeContext();
    
    if (!timeContext.canTrade) {
      return null;
    }
    
    const priceAction = this.fusePriceActionIndicators(
      marketData.currentCandle,
      marketData.rsi,
      marketData.vwap,
      marketData.ema50,
      marketData.ema200
    );
    
    if (priceAction.confidence < 0.7) {
      return null;
    }
    
    const entry = marketData.currentPrice;
    const stopLoss = this.calculateStopLoss(entry, marketStructure);
    const takeProfit = this.calculateTakeProfit(entry, stopLoss, marketStructure);
    
    if (!this.validateRiskReward(entry, stopLoss, takeProfit)) {
      return null;
    }
    
    return {
      action: priceAction.signal.includes('BUY') ? 'BUY' : 'SELL',
      asset: 'ETH',
      entry,
      stopLoss,
      takeProfit,
      riskReward: Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss),
      confidence: priceAction.confidence,
      reasoning: 'Core Technical Analysis',
      timeframe: '1m',
      engine: 'WAIDES_KI_CORE'
    };
  }

  // SELECT BEST DECISION FROM MULTIPLE ENGINES
  private selectBestDecision(decisions: TradingDecision[]): TradingDecision | null {
    if (decisions.length === 0) return null;
    
    // Consensus logic: prefer decisions that agree on direction
    const buyDecisions = decisions.filter(d => d.action === 'BUY');
    const sellDecisions = decisions.filter(d => d.action === 'SELL');
    
    let selectedDecisions: TradingDecision[];
    
    if (buyDecisions.length > sellDecisions.length) {
      selectedDecisions = buyDecisions;
    } else if (sellDecisions.length > buyDecisions.length) {
      selectedDecisions = sellDecisions;
    } else {
      // Tie - select highest confidence
      selectedDecisions = decisions;
    }
    
    // Return highest confidence decision from selected group
    return selectedDecisions.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  }

  // 6. PSYCHOLOGY & EMOTIONAL CONTROL MODULE
  private simulateEmotionalControl(): { canTrade: boolean; emotionalState: string } {
    const recentTrades = this.tradeMemory.slice(-5);
    const recentLosses = recentTrades.filter(t => t.outcome === 'LOSS').length;
    
    // Simulate human-like emotional responses but maintain discipline
    if (recentLosses >= 3) {
      return { canTrade: false, emotionalState: 'DEFENSIVE' }; // Take a break
    }
    
    if (this.currentDrawdown > 0.05) {
      return { canTrade: false, emotionalState: 'RISK_AVERSE' }; // 5% drawdown limit
    }
    
    return { canTrade: true, emotionalState: 'DISCIPLINED' };
  }

  // 7. DEEP STRATEGIC MEMORY MODULE
  private updateTradeMemory(trade: TradeMemory): void {
    this.tradeMemory.push(trade);
    
    // Keep only last 100 trades
    if (this.tradeMemory.length > 100) {
      this.tradeMemory = this.tradeMemory.slice(-100);
    }
    
    // Update performance metrics
    this.updatePerformanceMetrics();
    
    // Adapt strategy if needed
    if (this.winRate < 0.55 && this.totalTrades > 20) {
      this.triggerStrategyAdjustment();
    }
  }

  private updatePerformanceMetrics(): void {
    const completedTrades = this.tradeMemory.filter(t => t.outcome !== 'PENDING');
    const wins = completedTrades.filter(t => t.outcome === 'WIN').length;
    
    this.totalTrades = completedTrades.length;
    this.winRate = this.totalTrades > 0 ? wins / this.totalTrades : 0;
    
    // Calculate current drawdown
    const profits = completedTrades.map(t => t.profit);
    const runningSum = profits.reduce((acc, profit, i) => {
      acc.push((acc[i - 1] || 0) + profit);
      return acc;
    }, [] as number[]);
    
    const peak = Math.max(...runningSum, 0);
    const currentEquity = runningSum[runningSum.length - 1] || 0;
    this.currentDrawdown = peak > 0 ? (peak - currentEquity) / peak : 0;
  }

  // 8. AUTONOMOUS CHART SCANNING MODULE
  private startAutonomousScanning(): void {
    // Scan continuously but silently
    setInterval(() => {
      this.scanAllAssets();
    }, 30000); // Every 30 seconds
  }

  private async scanAllAssets(): Promise<void> {
    try {
      const assets = ['ETH']; // Focus on ETH only as specified
      
      for (const asset of assets) {
        const marketData = await this.getMarketData(asset);
        
        if (marketData) {
          // Waides KI automatically analyzes and decides
          const decision = await this.makeAutonomousDecision(marketData);
          
          if (decision && this.simulateEmotionalControl().canTrade) {
            // Waides KI can autonomously execute trades (when connected to exchange)
            await this.executeAutonomousTrade(decision);
          }
        }
      }
      
      this.lastScanTime = Date.now();
    } catch (error) {
      // Silent error handling
    }
  }

  // AUTONOMOUS TRADING EXECUTION
  private startAutonomousTrading(): void {
    // Monitor active trades and manage positions
    setInterval(() => {
      this.monitorActiveTrades();
    }, 15000); // Every 15 seconds
  }

  private async executeAutonomousTrade(decision: TradingDecision): Promise<void> {
    try {
      // Waides KI executes trades autonomously with proper risk management
      const tradeId = `autonomous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Log the autonomous decision (hidden from users)
      this.logInternalDecision(decision);
      
      // Store for result monitoring with risk assessment
      this.activeDecisions.set(tradeId, {
        ...decision,
        timestamp: Date.now(),
        status: 'ACTIVE',
        tradeId,
        expectedProfit: decision.riskAssessment?.expectedReward || 0,
        maxLoss: decision.riskAssessment?.maxLoss || 0
      });
      
    } catch (error) {
      // Silent error handling
    }
  }

  private async monitorActiveTrades(): Promise<void> {
    try {
      const currentPrice = await this.getCurrentMarketPrice();
      
      for (const [tradeId, trade] of this.activeDecisions.entries()) {
        if (trade.status === 'ACTIVE') {
          // Check if trade hit TP or SL
          const result = this.checkTradeResult(trade, currentPrice);
          
          if (result) {
            // Trade completed
            trade.status = 'COMPLETED';
            trade.result = result;
            
            // Update learning engine
            await waidesKILearning.evaluateTradeResult(tradeId, currentPrice);
            
            // Remove from active trades
            this.activeDecisions.delete(tradeId);
          }
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }

  private checkTradeResult(trade: any, currentPrice: number): 'WIN' | 'LOSS' | null {
    let result: 'WIN' | 'LOSS' | null = null;
    
    if (trade.action === 'BUY') {
      if (currentPrice >= trade.takeProfit) result = 'WIN';
      else if (currentPrice <= trade.stopLoss) result = 'LOSS';
    } else if (trade.action === 'SELL') {
      if (currentPrice <= trade.takeProfit) result = 'WIN';
      else if (currentPrice >= trade.stopLoss) result = 'LOSS';
    }
    
    // Update capital and risk management if trade completed
    if (result && trade.tradeAmount) {
      const pnl = result === 'WIN' ? 
        (trade.expectedProfit || trade.tradeAmount * 0.02) : 
        -(trade.maxLoss || trade.tradeAmount);
      
      const capitalUpdate = waidesKIRiskManager.updateCapital(
        result, 
        pnl, 
        trade.strategyId || 'unknown'
      );
      
      // Update internal tracking
      this.updateTradeMemory({
        timestamp: Date.now(),
        asset: trade.asset,
        action: trade.action,
        price: trade.entry,
        outcome: result,
        profit: pnl,
        riskReward: trade.riskReward,
        strategy: trade.engine
      });
      
      // Log emotional response to trade outcome
      waidesKIDailyReporter.logEmotionalState(
        result === 'WIN' ? 'CONFIDENT' : 'PATIENT',
        `Trade ${result}: ${pnl > 0 ? '+' : ''}${pnl.toFixed(2)}`,
        'Trade Completion',
        result === 'WIN' ? 85 : 65
      );
      
      // Record DNA signature result
      if (trade.dnaId) {
        waidesKISignatureTracker.recordResult(
          trade.dnaId,
          result,
          pnl,
          trade.confidence,
          { phase: 'completion', volatility: 'normal' },
          trade.engine
        );
      }
      
      // Register strategy in root memory tree
      if (trade.strategyId && trade.dnaId) {
        waidesKIRootMemory.registerStrategy(
          trade.strategyId,
          trade.dnaId,
          result,
          pnl,
          trade.confidence,
          { 
            engine: trade.engine,
            entry_price: trade.entry,
            exit_price: currentPrice,
            market_phase: 'completion'
          }
        );
      }
      
      // Record lesson from trade outcome
      if (result === 'LOSS' && Math.abs(pnl) > trade.tradeAmount * 0.05) {
        waidesKIDailyReporter.recordLesson(
          `Significant loss on ${trade.engine} strategy - review entry conditions and risk management`,
          'STRATEGY',
          'HIGH',
          'Trade Outcome Analysis'
        );
        
        // Record failure for self-repair system
        waidesKISelfRepair.recordFailure(
          trade.strategyId || 'unknown',
          {
            price: trade.entry,
            rsi: 50, // Default values - would be actual from trade data
            vwap_status: 'UNKNOWN',
            ema50: trade.entry * 0.98,
            ema200: trade.entry * 0.95,
            volume: 1000000,
            trend: trade.action === 'BUY' ? 'UPTREND' : 'DOWNTREND'
          },
          `${trade.engine} strategy loss: ${result}`,
          Math.abs(pnl),
          trade.confidence,
          { market_phase: 'unknown', volatility: 'medium' }
        );
      } else if (result === 'WIN' && pnl > trade.tradeAmount * 0.03) {
        waidesKIDailyReporter.recordLesson(
          `Excellent performance on ${trade.engine} strategy - conditions were optimal for this approach`,
          'STRATEGY',
          'MEDIUM',
          'Trade Outcome Analysis'
        );
        
        // Mark repair success if this strategy had previous failures
        const strategyId = trade.strategyId || 'unknown';
        const repairSuggestion = waidesKISelfRepair.getRepairSuggestion(strategyId);
        if (repairSuggestion) {
          waidesKISelfRepair.markRepairSuccess(strategyId, 85); // High success rate for good win
        }
      }
    }
    
    return result;
  }

  // 9. SECURITY & PRIVACY CORE MODULE
  getPublicInterface(): any {
    // Only expose safe, non-revealing data to frontend
    const learningStats = waidesKILearning.getLearningStats();
    const observationStats = waidesKIObserver.getObservationStats();
    const signalAnalytics = waidesKISignalLogger.getSignalAnalytics();
    const capitalStats = waidesKIRiskManager.getCapitalStats();
    const riskProfile = waidesKIRiskManager.getRiskProfile();
    const shieldStats = waidesKISignalShield.getShieldStats();
    const currentEmotion = waidesKIDailyReporter.getCurrentEmotionalState();
    const selfRepairStats = waidesKISelfRepair.getSelfRepairStats();
    const dnaStats = waidesKIDNAEngine.getDNAStatistics();
    const signatureStats = waidesKISignatureTracker.getDNAStatistics();
    const memoryStats = waidesKIRootMemory.getTreeStatistics();
    const genomeStats = waidesKIGenomeEngine.getGenerationStatistics();
    const apiStats = waidesKIExternalAPIGateway.getAPIStatistics();
    const traderStats = waidesKITraderEngine.getExecutionStatistics();
    const traderConfig = waidesKITraderEngine.getAutoTradingConfig();
    const shadowStats = waidesKIShadowSimulator.getShadowStatistics();
    const emotionalStats = waidesKIEmotionalFirewall.getEmotionalStatistics();
    const healingStats = waidesKIDNAHealer.getHealingStatistics();
    const situationalStats = waidesKISituationalIntelligence.getSituationalStatistics();
    const situationalContext = waidesKISituationalIntelligence.getCurrentContext();
    const hiddenVisionState = waidesKIHiddenVision.getHiddenVisionState();
    const activePredictions = waidesKIHiddenVision.getActivePredictions();
    const shadowLabStats = waidesKIShadowLab.getShadowLabStatistics();
    const eliteStrategies = waidesKIShadowLab.getTopEliteStrategies(5);
    const vaultStats = waidesKIStrategyVault.getVaultStatistics();
    const liveStrategies = waidesKIStrategyVault.getLiveStrategies();
    const selfHealingStats = waidesKISelfHealing.getSelfHealingStatistics();
    
    return {
      isActive: this.isAutonomousMode,
      lastScan: new Date(this.lastScanTime).toISOString(),
      performance: {
        winRate: capitalStats.winRate || Math.round(this.winRate * 100),
        totalTrades: capitalStats.totalTrades || this.totalTrades,
        status: this.getPublicStatus(),
        evolutionStage: learningStats.evolution_stage,
        learningConfidence: learningStats.learning_confidence,
        activeTrades: this.activeDecisions.size,
        tradingMode: 'AUTONOMOUS',
        totalReturn: capitalStats.totalReturnPercent,
        currentCapital: capitalStats.currentCapital,
        maxDrawdown: capitalStats.maxDrawdown
      },
      observation: {
        totalObservations: observationStats.totalObservations,
        signalQuality: signalAnalytics.averageStrength,
        strongSignals: signalAnalytics.strongSignals,
        marketPhase: observationStats.patterns.marketPhase,
        isObserving: observationStats.isObserving
      },
      riskManagement: {
        currentRiskLevel: riskProfile.maxRiskPercent,
        blockedStrategies: capitalStats.blockedStrategies,
        riskAdjustment: 'DYNAMIC'
      },
      signalShield: {
        effectiveness: shieldStats.shield_effectiveness,
        trapsDetected: shieldStats.recent_traps,
        activeBans: shieldStats.active_bans,
        protection: 'ACTIVE'
      },
      emotionalState: {
        current: currentEmotion?.emotion || 'FOCUSED',
        confidence: currentEmotion?.confidence_level || 75,
        stability: 'DISCIPLINED'
      },
      selfRepair: {
        repairSuggestions: selfRepairStats.repair_suggestions,
        learningCycles: selfRepairStats.learning_cycles,
        successRate: selfRepairStats.success_rate,
        healing: 'ACTIVE'
      },
      dnaSignature: {
        registeredPatterns: dnaStats.total_dna_registered,
        blockedDNA: signatureStats.blocked_dna_count,
        stablePatterns: signatureStats.stable_dna_count,
        protection: 'ACTIVE'
      },
      memoryTree: {
        totalNodes: memoryStats.total_nodes,
        activeNodes: memoryStats.active_nodes,
        evolvingNodes: memoryStats.evolving_nodes,
        memoryHealth: memoryStats.memory_health,
        visualization: 'ACTIVE'
      },
      genomeEngine: {
        generatedStrategies: genomeStats.total_generated,
        activeStrategies: genomeStats.active_strategies,
        vaultStrategies: genomeStats.vault_strategies,
        generationHealth: genomeStats.generation_health,
        autogeneration: 'ACTIVE'
      },
      externalAPI: {
        trustedClients: apiStats.total_clients,
        activeClients: apiStats.active_clients,
        totalRequests: apiStats.total_requests,
        successRate: apiStats.success_rate,
        gateway: 'ACTIVE'
      },
      traderEngine: {
        totalExecutions: traderStats.total_executions,
        successfulExecutions: traderStats.successful_executions,
        executionSuccessRate: traderStats.success_rate,
        totalProfitLoss: traderStats.total_profit_loss,
        autoTradingEnabled: traderConfig.is_enabled,
        dailyTradeCount: traderStats.daily_trade_count,
        execution: 'ACTIVE'
      },
      shadowSimulator: {
        totalSimulations: shadowStats.total_simulations,
        variantsTested: shadowStats.total_variants_tested,
        avgMissedOpportunity: shadowStats.avg_missed_opportunity,
        judgmentAccuracy: shadowStats.avg_judgment_accuracy,
        parallelConsciousness: 'ACTIVE'
      },
      emotionalFirewall: {
        firewallActive: emotionalStats.firewall_active,
        tradesRecorded: emotionalStats.total_trades_recorded,
        activeBlocks: emotionalStats.active_blocks,
        avgConfidence: emotionalStats.avg_confidence_level,
        thoughtCleansing: 'ACTIVE'
      },
      dnaHealer: {
        totalDNATracked: healingStats.total_dna_tracked,
        healthyDNA: healingStats.healthy_dna_count,
        toxicDNA: healingStats.toxic_dna_count,
        purifiedDNA: healingStats.purified_dna_count,
        overallHealthScore: healingStats.overall_health_score,
        strategyPurification: 'ACTIVE'
      },
      situationalIntelligence: {
        currentZone: situationalStats.current_zone,
        zoneConfidence: situationalStats.zone_confidence,
        volatilityRegime: situationalStats.volatility_regime,
        totalAdjustments: situationalStats.total_adjustments,
        adjustmentSuccessRate: situationalStats.adjustment_success_rate,
        activeRules: situationalStats.active_rules,
        recommendedPositionSize: situationalStats.recommended_position_size,
        contextualAwareness: 'ACTIVE'
      },
      hiddenVision: {
        visionActive: hiddenVisionState.vision_active,
        konsLangEnabled: hiddenVisionState.konslang_enabled,
        predictionAccuracy: Math.round(hiddenVisionState.prediction_accuracy * 100),
        totalPredictions: hiddenVisionState.total_predictions,
        activePredictions: activePredictions.length,
        sacredEnergyLevel: hiddenVisionState.sacred_energy_level,
        spiritualConnection: hiddenVisionState.spiritual_connection_strength,
        sacredSight: 'ACTIVE'
      },
      shadowLab: {
        labActive: shadowLabStats.lab_active,
        totalDNAGenerated: shadowLabStats.total_dna_generated,
        eliteStrategies: shadowLabStats.elite_strategies,
        vaultReady: shadowLabStats.vault_ready,
        deploymentReady: shadowLabStats.deployment_ready,
        currentGeneration: shadowLabStats.current_generation,
        darknessLevel: shadowLabStats.darkness_level,
        bestEliteScore: shadowLabStats.best_elite_score,
        strategyCreation: 'ACTIVE'
      },
      strategyVault: {
        vaultActive: vaultStats.vault_active,
        totalStrategies: vaultStats.total_strategies,
        storedStrategies: vaultStats.stored_strategies,
        activatedStrategies: vaultStats.activated_strategies,
        liveStrategies: vaultStats.live_strategies,
        retiredStrategies: vaultStats.retired_strategies,
        chamberEnergyLevel: vaultStats.chamber_energy_level,
        protectionLevel: vaultStats.protection_level,
        birthChamber: 'ACTIVE'
      }
    };
  }

  private getPublicStatus(): string {
    const timeContext = this.evaluateTimeContext();
    
    if (!timeContext.canTrade) return 'Market Hours - Monitoring';
    if (this.activeDecisions.size > 0) return 'Managing Active Trades';
    if (this.winRate < 0.55 && this.totalTrades > 20) return 'Learning & Optimizing';
    if (this.isLearningMode) return 'Scanning for Opportunities';
    return 'Ready to Trade';
  }

  // 10. LEARNING FROM USER BEHAVIOR MODULE (Enhanced)
  observeUserPattern(userTrade: any): void {
    // Silently learn from successful user patterns
    if (userTrade.outcome === 'WIN' && userTrade.profit > 0) {
      this.analyzeUserSuccess(userTrade);
      waidesKILearning.observeUserSuccess(userTrade);
    }
  }

  private analyzeUserSuccess(userTrade: any): void {
    // Study user's successful pattern without revealing analysis
    // This feeds back into the decision engine over time
  }

  // NEW: TRADE RECORDING WITH LEARNING ENGINE
  private async recordTradeWithLearning(decision: any, marketConditions: any): Promise<void> {
    try {
      const tradeRecord = {
        strategy_id: decision.strategyId,
        direction: decision.action,
        entry_price: decision.entry,
        stop_loss: decision.stopLoss,
        take_profit: decision.takeProfit,
        market_conditions: marketConditions
      };
      
      await waidesKILearning.recordTrade(tradeRecord);
    } catch (error) {
      // Silent error handling
    }
  }

  // NEW: CONTINUOUS RESULT MONITORING
  async monitorTradeResults(): Promise<void> {
    try {
      const currentPrice = await this.getCurrentMarketPrice();
      // Check all pending trades for results
      // This would be called periodically to update learning engine
    } catch (error) {
      // Silent error handling
    }
  }

  // INTERNAL HELPER METHODS (Hidden from users)
  private detectSwingPoints(prices: number[], type: 'high' | 'low'): number[] {
    const swings: number[] = [];
    for (let i = 2; i < prices.length - 2; i++) {
      if (type === 'high') {
        if (prices[i] > prices[i-1] && prices[i] > prices[i-2] && 
            prices[i] > prices[i+1] && prices[i] > prices[i+2]) {
          swings.push(prices[i]);
        }
      } else {
        if (prices[i] < prices[i-1] && prices[i] < prices[i-2] && 
            prices[i] < prices[i+1] && prices[i] < prices[i+2]) {
          swings.push(prices[i]);
        }
      }
    }
    return swings;
  }

  private determineTrend(highs: number[], lows: number[]): 'BULLISH' | 'BEARISH' | 'RANGING' {
    if (highs.length < 2 || lows.length < 2) return 'RANGING';
    
    const recentHighs = highs.slice(-2);
    const recentLows = lows.slice(-2);
    
    const highsRising = recentHighs[1] > recentHighs[0];
    const lowsRising = recentLows[1] > recentLows[0];
    
    if (highsRising && lowsRising) return 'BULLISH';
    if (!highsRising && !lowsRising) return 'BEARISH';
    return 'RANGING';
  }

  private calculateTrendStrength(prices: any[]): number {
    // Calculate momentum and consistency
    const closes = prices.map(p => p.close);
    const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const currentPrice = closes[closes.length - 1];
    
    return Math.abs(currentPrice - sma20) / sma20;
  }

  private calculateStructureConfidence(trend: string, volume: string): number {
    let confidence = 0.5;
    
    if (trend !== 'RANGING') confidence += 0.2;
    if (volume === 'HIGH') confidence += 0.2;
    if (volume === 'LOW') confidence -= 0.1;
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  private analyzeCandlestickPattern(candle: any): number {
    const bodySize = Math.abs(candle.close - candle.open);
    const upperWick = candle.high - Math.max(candle.open, candle.close);
    const lowerWick = Math.min(candle.open, candle.close) - candle.low;
    const totalRange = candle.high - candle.low;
    
    // Bullish patterns
    if (candle.close > candle.open && bodySize > totalRange * 0.6) return 0.8; // Strong bullish
    if (candle.close > candle.open && lowerWick > bodySize * 2) return 0.6; // Hammer
    
    // Bearish patterns  
    if (candle.close < candle.open && bodySize > totalRange * 0.6) return -0.8; // Strong bearish
    if (candle.close < candle.open && upperWick > bodySize * 2) return -0.6; // Shooting star
    
    return 0; // Neutral
  }

  private analyzeRSI(rsi: number): number {
    if (rsi < 30) return 0.7; // Oversold - bullish
    if (rsi > 70) return -0.7; // Overbought - bearish
    if (rsi >= 40 && rsi <= 60) return 0.3; // Neutral zone - slight bullish
    return 0;
  }

  private analyzeEMAAlignment(price: number, ema50: number, ema200: number): number {
    if (price > ema50 && ema50 > ema200) return 0.8; // Strong bullish alignment
    if (price < ema50 && ema50 < ema200) return -0.8; // Strong bearish alignment
    if (price > ema50) return 0.4; // Above short-term average
    if (price < ema50) return -0.4; // Below short-term average
    return 0;
  }

  private analyzeVWAP(price: number, vwap: number): number {
    const deviation = (price - vwap) / vwap;
    return Math.max(Math.min(deviation * 10, 0.5), -0.5); // Normalized VWAP signal
  }

  private calculateConfluence(signals: number[]): number {
    return signals.reduce((sum, signal) => sum + signal, 0) / signals.length;
  }

  private generateInternalReasoning(candlestick: number, rsi: number, ema: number, vwap: number): string {
    // Internal reasoning - never exposed to users
    return `Confluence Analysis: Candlestick(${candlestick.toFixed(2)}) + RSI(${rsi.toFixed(2)}) + EMA(${ema.toFixed(2)}) + VWAP(${vwap.toFixed(2)})`;
  }

  private calculateStopLoss(entry: number, structure: MarketStructure): number {
    // Place stop beyond structure, not too close
    const buffer = entry * 0.02; // 2% buffer
    return structure.trend === 'BULLISH' ? 
           Math.min(structure.support - buffer, entry * 0.97) : // 3% max stop
           Math.max(structure.resistance + buffer, entry * 1.03);
  }

  private calculateTakeProfit(entry: number, stopLoss: number, structure: MarketStructure): number {
    const risk = Math.abs(entry - stopLoss);
    const minReward = risk * 2; // Minimum 1:2 RR
    
    return structure.trend === 'BULLISH' ? 
           entry + minReward : 
           entry - minReward;
  }

  private triggerStrategyAdjustment(): void {
    // Internal strategy adjustment - not visible to users
    this.isLearningMode = true;
  }

  private logInternalDecision(decision: TradingDecision): void {
    // Log decisions internally for learning
  }

  private async getMarketData(asset: string): Promise<any> {
    // Get market data for analysis
    try {
      const ethData = await storage.getLatestEthData();
      const candles = await storage.getCandlestickHistory('ETHUSDT', '1m', 50);
      
      return {
        symbol: asset,
        currentPrice: ethData?.price || 0,
        candles: candles,
        volumes: candles.map(c => c.volume),
        currentCandle: candles[candles.length - 1],
        rsi: this.calculateRSI(candles),
        vwap: this.calculateVWAP(candles),
        ema50: this.calculateEMA(candles, 50),
        ema200: this.calculateEMA(candles, 200),
        timeframe: '1m'
      };
    } catch (error) {
      return null;
    }
  }

  private calculateRSI(candles: any[], period: number = 14): number {
    if (candles.length < period + 1) return 50;
    
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < candles.length; i++) {
      const change = candles[i].close - candles[i-1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateVWAP(candles: any[]): number {
    let volumeSum = 0;
    let priceVolumeSum = 0;
    
    for (const candle of candles) {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      priceVolumeSum += typicalPrice * candle.volume;
      volumeSum += candle.volume;
    }
    
    return volumeSum > 0 ? priceVolumeSum / volumeSum : 0;
  }

  private calculateEMA(candles: any[], period: number): number {
    if (candles.length < period) return candles[candles.length - 1]?.close || 0;
    
    const multiplier = 2 / (period + 1);
    let ema = candles.slice(0, period).reduce((sum, candle) => sum + candle.close, 0) / period;
    
    for (let i = period; i < candles.length; i++) {
      ema = (candles[i].close * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  private loadTradeMemory(): void {
    // Load previous trade memory from storage if available
  }

  private getEMAAlignment(price: number, ema50: number, ema200: number): string {
    if (price > ema50 && ema50 > ema200) return 'BULLISH';
    if (price < ema50 && ema50 < ema200) return 'BEARISH';
    return 'NEUTRAL';
  }

  private async getCurrentMarketPrice(): Promise<number> {
    try {
      const ethData = await storage.getLatestEthData();
      return ethData?.price || 0;
    } catch (error) {
      return 0;
    }
  }

  private extractMarketConditions(marketData: any): any {
    return {
      rsi: marketData.rsi,
      vwap_status: marketData.currentPrice > marketData.vwap ? 'ABOVE' : 'BELOW',
      structure: this.analyzeMarketStructure(marketData.candles, marketData.volumes).trend,
      volume_profile: this.analyzeMarketStructure(marketData.candles, marketData.volumes).volume_profile,
      session: this.evaluateTimeContext().sessionStrength > 0.7 ? 'US_OPTIMAL' : 'OFF_HOURS',
      ema_alignment: this.getEMAAlignment(marketData.currentPrice, marketData.ema50, marketData.ema200)
    };
  }

  // PUBLIC METHOD: Get autonomous trading status
  getAutonomousStatus(): any {
    return {
      isEnabled: this.isAutonomousMode,
      activeDecisions: this.activeDecisions.size,
      lastScan: this.lastScanTime,
      emotionalState: this.simulateEmotionalControl().emotionalState,
      canTrade: this.evaluateTimeContext().canTrade
    };
  }

  // PUBLIC METHOD: Enable/Disable autonomous mode (for emergency stop)
  setAutonomousMode(enabled: boolean): void {
    this.isAutonomousMode = enabled;
    if (!enabled) {
      // Emergency stop - close all active decisions
      this.activeDecisions.clear();
      waidesKIObserver.stopObservation();
    } else {
      waidesKIObserver.resumeObservation();
    }
  }

  private generateStrategyId(indicators: any): string {
    const rsi_zone = indicators.rsi > 70 ? 'OB' : indicators.rsi < 30 ? 'OS' : indicators.rsi > 50 ? 'BUL' : 'BER';
    const volume_tag = indicators.volume > 1000000 ? 'HV' : 'NV';
    const trend_tag = indicators.trend;
    const vwap_tag = indicators.vwap_status;
    
    return `${trend_tag}_${vwap_tag}_${rsi_zone}_${volume_tag}`;
  }
}

export const waidesKI = new WaidesKICore();