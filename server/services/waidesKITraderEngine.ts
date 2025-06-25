import { waidesKIDNAEngine } from './waidesKIDNAEngine';
import { waidesKIRootMemory } from './waidesKIRootMemory';
import { waidesKISignatureTracker } from './waidesKISignatureTracker';
import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKIRiskManager } from './waidesKIRiskManager';
import { waidesKISignalShield } from './waidesKISignalShield';
import { waidesKIGenomeEngine } from './waidesKIGenomeEngine';
import { waidesKILiveFeed } from './waidesKILiveFeed';
import { waidesKIShadowSimulator } from './waidesKIShadowSimulator';
import { waidesKIEmotionalFirewall } from './waidesKIEmotionalFirewall';
import { waidesKIDNAHealer } from './waidesKIDNAHealer';
import { waidesKISituationalIntelligence } from './waidesKISituationalIntelligence';
import { waidesKIHiddenVision } from './waidesKIHiddenVision';
import { waidesKISelfHealing } from './waidesKISelfHealing';
import { storage } from '../storage';

interface MarketIndicators {
  trend: string;
  rsi: number;
  vwap_status: string;
  price: number;
  ema50: number;
  ema200: number;
  volume: number;
  timestamp: number;
}

interface TradeExecutionParams {
  strategy_id: string;
  strategy_code: string;
  indicators: MarketIndicators;
  confidence_level: number;
  dna_id?: string;
  execution_engine: 'WAIDBOT' | 'WAIDBOT_PRO' | 'GENOME_ENGINE' | 'MANUAL';
}

interface ExecutionResult {
  execution_id: string;
  timestamp: number;
  strategy_id: string;
  dna_id: string;
  status: 'EXECUTED' | 'REJECTED' | 'SKIPPED' | 'DELAYED' | 'ERROR';
  action: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'NO_ACTION';
  reasoning: string[];
  risk_assessment: {
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    confidence_score: number;
    safety_checks_passed: boolean;
    rejection_factors: string[];
  };
  trade_details?: {
    entry_price: number;
    amount_eth: number;
    amount_usd: number;
    estimated_profit_target: number;
    estimated_stop_loss: number;
    exchange: string;
    order_type: string;
  };
  outcome?: {
    result: 'WIN' | 'LOSS' | 'PENDING' | 'CANCELLED';
    actual_profit_loss: number;
    exit_price?: number;
    exit_timestamp?: number;
    holding_duration?: number;
  };
  metadata: {
    execution_engine: string;
    processing_time_ms: number;
    market_conditions: any;
    decision_factors: any;
  };
}

interface AutoTradingConfig {
  is_enabled: boolean;
  max_concurrent_trades: number;
  max_daily_trades: number;
  max_risk_per_trade: number; // Percentage
  min_confidence_threshold: number;
  emergency_stop_enabled: boolean;
  allowed_engines: string[];
  trading_hours: {
    start_hour: number;
    end_hour: number;
    timezone: string;
  };
}

interface ExchangeSimulator {
  buy_eth(amount_usd: number, current_price: number): Promise<{
    executed_price: number;
    amount_eth: number;
    amount_usd: number;
    profit_loss: number;
    exchange: string;
    order_id: string;
    execution_time: number;
  }>;
  
  sell_eth(amount_eth: number, current_price: number): Promise<{
    executed_price: number;
    amount_eth: number;
    amount_usd: number;
    profit_loss: number;
    exchange: string;
    order_id: string;
    execution_time: number;
  }>;
  
  get_account_balance(): Promise<{
    eth_balance: number;
    usd_balance: number;
    total_value_usd: number;
  }>;
}

class ExchangeAPISimulator implements ExchangeSimulator {
  private mockBalance = { eth: 2.5, usd: 5000 };
  private priceVolatility = 0.02; // 2% max price movement during execution

  async buy_eth(amount_usd: number, current_price: number): Promise<any> {
    // Simulate realistic execution delay and slippage
    await this.delay(100 + Math.random() * 500); // 100-600ms execution time
    
    const slippage = (Math.random() - 0.5) * this.priceVolatility;
    const executed_price = current_price * (1 + slippage);
    const amount_eth = amount_usd / executed_price;
    
    // Simulate fees (0.1%)
    const fee = amount_usd * 0.001;
    const net_amount_usd = amount_usd - fee;
    const actual_eth = net_amount_usd / executed_price;
    
    // Update mock balance
    this.mockBalance.usd -= amount_usd;
    this.mockBalance.eth += actual_eth;
    
    // Calculate immediate P&L (simulated market movement)
    const immediate_price_change = (Math.random() - 0.5) * 0.01; // ±0.5%
    const current_value = actual_eth * (executed_price * (1 + immediate_price_change));
    const profit_loss = current_value - amount_usd;
    
    return {
      executed_price: Math.round(executed_price * 100) / 100,
      amount_eth: Math.round(actual_eth * 1000000) / 1000000,
      amount_usd: Math.round(amount_usd * 100) / 100,
      profit_loss: Math.round(profit_loss * 100) / 100,
      exchange: 'Waides_Exchange_Simulator',
      order_id: this.generateOrderId(),
      execution_time: Date.now()
    };
  }

  async sell_eth(amount_eth: number, current_price: number): Promise<any> {
    await this.delay(100 + Math.random() * 500);
    
    const slippage = (Math.random() - 0.5) * this.priceVolatility;
    const executed_price = current_price * (1 + slippage);
    const amount_usd = amount_eth * executed_price;
    
    // Simulate fees
    const fee = amount_usd * 0.001;
    const net_amount_usd = amount_usd - fee;
    
    // Update mock balance
    this.mockBalance.eth -= amount_eth;
    this.mockBalance.usd += net_amount_usd;
    
    // Calculate P&L
    const immediate_price_change = (Math.random() - 0.5) * 0.01;
    const reference_value = amount_eth * current_price;
    const profit_loss = net_amount_usd - reference_value;
    
    return {
      executed_price: Math.round(executed_price * 100) / 100,
      amount_eth: Math.round(amount_eth * 1000000) / 1000000,
      amount_usd: Math.round(net_amount_usd * 100) / 100,
      profit_loss: Math.round(profit_loss * 100) / 100,
      exchange: 'Waides_Exchange_Simulator',
      order_id: this.generateOrderId(),
      execution_time: Date.now()
    };
  }

  async get_account_balance(): Promise<any> {
    const current_price = await this.getCurrentETHPrice();
    return {
      eth_balance: Math.round(this.mockBalance.eth * 1000000) / 1000000,
      usd_balance: Math.round(this.mockBalance.usd * 100) / 100,
      total_value_usd: Math.round((this.mockBalance.usd + (this.mockBalance.eth * current_price)) * 100) / 100
    };
  }

  private async getCurrentETHPrice(): Promise<number> {
    const liveFeed = waidesKILiveFeed.getLatestData();
    return liveFeed?.price || 2400;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateOrderId(): string {
    return `WKI_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
}

export class WaidesKITraderEngine {
  private executionLog: ExecutionResult[] = [];
  private autoTradingConfig: AutoTradingConfig;
  private exchangeAPI: ExchangeSimulator;
  private activeTrades: Set<string> = new Set();
  private dailyTradeCount: number = 0;
  private lastTradeDate: string = '';
  private emergencyStopActive: boolean = false;

  constructor() {
    this.autoTradingConfig = {
      is_enabled: false, // Start disabled for safety
      max_concurrent_trades: 3,
      max_daily_trades: 20,
      max_risk_per_trade: 2.0, // 2% max risk per trade
      min_confidence_threshold: 65,
      emergency_stop_enabled: true,
      allowed_engines: ['WAIDBOT', 'WAIDBOT_PRO', 'GENOME_ENGINE'],
      trading_hours: {
        start_hour: 0,
        end_hour: 23,
        timezone: 'UTC'
      }
    };
    
    this.exchangeAPI = new ExchangeAPISimulator();
    this.startMaintenanceCycle();
  }

  private startMaintenanceCycle(): void {
    // Reset daily trade count at midnight UTC
    setInterval(() => {
      const today = new Date().toISOString().split('T')[0];
      if (this.lastTradeDate !== today) {
        this.dailyTradeCount = 0;
        this.lastTradeDate = today;
      }
    }, 60 * 60 * 1000); // Check every hour
    
    // Clean old execution logs
    setInterval(() => {
      this.cleanOldExecutionLogs();
    }, 6 * 60 * 60 * 1000); // Every 6 hours
  }

  // CORE EXECUTION ENGINE
  async evaluateAndExecute(params: TradeExecutionParams): Promise<ExecutionResult> {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();
    
    try {
      // 1. Pre-execution validation
      const validationResult = await this.validateExecution(params);
      if (!validationResult.canExecute) {
        return this.createRejectedResult(executionId, params, validationResult.reasons, startTime);
      }
      
      // 2. Generate or validate DNA
      let dnaId = params.dna_id;
      if (!dnaId) {
        dnaId = waidesKIDNAEngine.generateDNA(params.indicators);
      }
      
      // 3. Risk assessment
      const riskAssessment = await this.assessRisk(params, dnaId);
      if (riskAssessment.risk_level === 'EXTREME' || !riskAssessment.safety_checks_passed) {
        return this.createRejectedResult(executionId, params, riskAssessment.rejection_factors, startTime, dnaId);
      }
      
      // 4. Strategy filtering
      const strategyDecision = await this.makeStrategyDecision(params, riskAssessment);
      if (strategyDecision.action === 'NO_ACTION') {
        return this.createSkippedResult(executionId, params, strategyDecision.reasoning, startTime, dnaId);
      }
      
      // 5. Execute trade
      const tradeResult = await this.executeTrade(strategyDecision, params);
      
      // 6. Record execution
      const executionResult = this.createExecutionResult(
        executionId, 
        params, 
        dnaId, 
        strategyDecision, 
        tradeResult, 
        riskAssessment, 
        startTime
      );
      
      // 7. Record trade in emotional firewall
      if (executionResult.outcome) {
        waidesKIEmotionalFirewall.recordTrade(
          executionResult.outcome.result,
          executionResult.outcome.actual_profit_loss,
          executionResult.risk_assessment.confidence_score,
          params.indicators,
          params.execution_engine
        );
      }
      
      // 8. Evaluate DNA and heal if necessary
      if (executionResult.outcome) {
        const healingResult = waidesKIDNAHealer.evaluateDNA(
          executionResult.dna_id,
          executionResult.outcome.result,
          executionResult.outcome.actual_profit_loss,
          executionResult.risk_assessment.confidence_score,
          params.indicators,
          params.execution_engine
        );
        
        if (healingResult.status === 'PURIFIED' || healingResult.status === 'EVOLVED') {
          waidesKIDailyReporter.recordLesson(
            `DNA ${healingResult.action}: ${healingResult.recommendation}`,
            'HEALING',
            'HIGH',
            'DNA Healer'
          );
        }
      }
      
      // 9. Record situational decision outcome
      if (situationalCheck.shouldAdjust && executionResult.outcome) {
        // Find the situational decision that was made
        const contextualDecisions = waidesKISituationalIntelligence.getContextualDecisions(10);
        const recentDecision = contextualDecisions.find(d => 
          Math.abs(d.timestamp - Date.now()) < 60000 // Within last minute
        );
        
        if (recentDecision) {
          waidesKISituationalIntelligence.recordDecisionOutcome(
            recentDecision.decision_id,
            executionResult.outcome.result
          );
        }
      }
      
      // 10. Update self-healing performance tracking
      if (executionResult.outcome && executionResult.dna_id) {
        const healingCheck = waidesKISelfHealing.updateStrategyPerformance(
          executionResult.strategy_id,
          executionResult.dna_id,
          {
            success: executionResult.outcome.result === 'WIN',
            profit_loss: executionResult.outcome.actual_profit_loss,
            execution_time: Date.now(),
            market_conditions: {
              market_phase: situationalContext?.market_phase || 'UNKNOWN',
              indicators: params.indicators
            }
          }
        );
        
        // Auto-trigger healing if needed
        if (healingCheck.shouldHeal) {
          try {
            await waidesKISelfHealing.triggerHealingSession(
              executionResult.strategy_id, 
              healingCheck.failureType || 'UNKNOWN'
            );
          } catch (error) {
            console.error('Error triggering healing session:', error);
          }
        }
      }
      
      // 9. Update learning systems
      await this.updateLearningSystems(executionResult);
      
      // 10. Run shadow simulation
      await this.runShadowSimulation(executionResult, params.indicators);
      
      // 11. Store in execution log
      this.executionLog.push(executionResult);
      this.activeTrades.add(executionId);
      this.dailyTradeCount++;
      
      return executionResult;
      
    } catch (error) {
      return this.createErrorResult(executionId, params, error.message, startTime);
    }
  }

  private async validateExecution(params: TradeExecutionParams): Promise<{ canExecute: boolean; reasons: string[] }> {
    const reasons: string[] = [];
    
    // Check if auto-trading is enabled
    if (!this.autoTradingConfig.is_enabled) {
      reasons.push('Auto-trading is disabled');
    }
    
    // Check emergency stop
    if (this.emergencyStopActive) {
      reasons.push('Emergency stop is active');
    }
    
    // Check emotional firewall
    const emotionalCheck = waidesKIEmotionalFirewall.shouldBlockTrade(
      params.confidence_level,
      params.indicators,
      params.execution_engine
    );
    if (emotionalCheck.shouldBlock) {
      reasons.push(`Emotional firewall: ${emotionalCheck.reason}`);
    }
    
    // Check situational intelligence
    const situationalCheck = waidesKISituationalIntelligence.shouldAdjustStrategy(
      params.indicators,
      params.action,
      params.confidence_level
    );
    if (situationalCheck.shouldAdjust && ['BLOCK', 'PAUSE'].includes(situationalCheck.adjustment)) {
      reasons.push(`Situational adjustment: ${situationalCheck.reason}`);
    }
    
    // Check trading hours
    const currentHour = new Date().getUTCHours();
    if (currentHour < this.autoTradingConfig.trading_hours.start_hour || 
        currentHour > this.autoTradingConfig.trading_hours.end_hour) {
      reasons.push('Outside trading hours');
    }
    
    // Check daily trade limit
    if (this.dailyTradeCount >= this.autoTradingConfig.max_daily_trades) {
      reasons.push('Daily trade limit reached');
    }
    
    // Check concurrent trades limit
    if (this.activeTrades.size >= this.autoTradingConfig.max_concurrent_trades) {
      reasons.push('Maximum concurrent trades reached');
    }
    
    // Check minimum confidence
    if (params.confidence_level < this.autoTradingConfig.min_confidence_threshold) {
      reasons.push(`Confidence level ${params.confidence_level}% below threshold ${this.autoTradingConfig.min_confidence_threshold}%`);
    }
    
    // Check allowed engines
    if (!this.autoTradingConfig.allowed_engines.includes(params.execution_engine)) {
      reasons.push(`Execution engine ${params.execution_engine} not allowed`);
    }
    
    return { canExecute: reasons.length === 0, reasons };
  }

  private async assessRisk(params: TradeExecutionParams, dnaId: string): Promise<ExecutionResult['risk_assessment']> {
    const rejectionFactors: string[] = [];
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' = 'LOW';
    let confidenceScore = params.confidence_level;
    
    // 1. DNA stability check
    const dnaPerformance = waidesKISignatureTracker.getDNAPerformance(dnaId);
    if (dnaPerformance?.is_blocked) {
      rejectionFactors.push('DNA pattern is blocked');
      riskLevel = 'EXTREME';
    }
    
    if (dnaPerformance?.has_anomalies) {
      rejectionFactors.push('DNA pattern has anomalies');
      riskLevel = 'HIGH';
      confidenceScore *= 0.8;
    }
    
    // 2. Signal shield check
    const shieldResult = waidesKISignalShield.evaluateSignal(params.indicators, dnaId);
    if (shieldResult.should_block) {
      rejectionFactors.push(`Signal shield blocked: ${shieldResult.block_reason}`);
      riskLevel = 'HIGH';
    }
    
    if (shieldResult.trap_detected) {
      rejectionFactors.push(`Market trap detected: ${shieldResult.trap_type}`);
      riskLevel = 'MEDIUM';
      confidenceScore *= 0.9;
    }
    
    // 3. Market condition checks
    const indicators = params.indicators;
    
    // Extreme RSI conditions
    if (indicators.rsi > 85) {
      rejectionFactors.push('RSI extremely overbought (>85)');
      riskLevel = 'HIGH';
    } else if (indicators.rsi < 15) {
      rejectionFactors.push('RSI extremely oversold (<15)');
      riskLevel = 'HIGH';
    }
    
    // Price vs EMA divergence
    const emaDeviation = Math.abs(indicators.price - indicators.ema50) / indicators.ema50;
    if (emaDeviation > 0.05) { // 5% deviation
      rejectionFactors.push('Price too far from EMA50 (>5% deviation)');
      riskLevel = riskLevel === 'LOW' ? 'MEDIUM' : riskLevel;
    }
    
    // Volume anomalies
    if (indicators.volume < 500000) {
      rejectionFactors.push('Volume too low for reliable signals');
      riskLevel = riskLevel === 'LOW' ? 'MEDIUM' : riskLevel;
    }
    
    // 4. Risk manager assessment
    const riskProfile = waidesKIRiskManager.getRiskProfile();
    if (riskProfile.maxRiskPercent < this.autoTradingConfig.max_risk_per_trade) {
      rejectionFactors.push(`Risk manager limits below trade threshold`);
      riskLevel = 'MEDIUM';
    }
    
    const safetyChecksPassed = rejectionFactors.length === 0 && riskLevel !== 'EXTREME';
    
    return {
      risk_level: riskLevel,
      confidence_score: Math.round(confidenceScore),
      safety_checks_passed: safetyChecksPassed,
      rejection_factors: rejectionFactors
    };
  }

  private async makeStrategyDecision(params: TradeExecutionParams, riskAssessment: ExecutionResult['risk_assessment']): Promise<{
    action: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'NO_ACTION';
    reasoning: string[];
    confidence: number;
  }> {
    const reasoning: string[] = [];
    const indicators = params.indicators;
    
    // Apply strategy logic based on strategy code
    const strategyParts = params.strategy_code.toLowerCase().split('&').map(s => s.trim());
    
    let buySignals = 0;
    let sellSignals = 0;
    let totalSignals = 0;
    
    for (const part of strategyParts) {
      totalSignals++;
      
      if (part.includes('rsi')) {
        const rsiThreshold = this.extractNumber(part);
        if (part.includes('<') && indicators.rsi < rsiThreshold) {
          buySignals++;
          reasoning.push(`RSI ${indicators.rsi} < ${rsiThreshold} (bullish)`);
        } else if (part.includes('>') && indicators.rsi > rsiThreshold) {
          sellSignals++;
          reasoning.push(`RSI ${indicators.rsi} > ${rsiThreshold} (bearish)`);
        }
      }
      
      if (part.includes('vwap')) {
        if (part.includes('above') && indicators.vwap_status === 'ABOVE') {
          buySignals++;
          reasoning.push('Price above VWAP (bullish)');
        } else if (part.includes('below') && indicators.vwap_status === 'BELOW') {
          sellSignals++;
          reasoning.push('Price below VWAP (bearish)');
        }
      }
      
      if (part.includes('ema')) {
        if (indicators.price > indicators.ema50) {
          buySignals++;
          reasoning.push(`Price ${indicators.price} > EMA50 ${indicators.ema50} (bullish)`);
        } else {
          sellSignals++;
          reasoning.push(`Price ${indicators.price} < EMA50 ${indicators.ema50} (bearish)`);
        }
      }
    }
    
    // Add trend confirmation
    if (indicators.trend === 'UPTREND') {
      buySignals++;
      reasoning.push('Market in uptrend');
    } else if (indicators.trend === 'DOWNTREND') {
      sellSignals++;
      reasoning.push('Market in downtrend');
    }
    
    // Decision logic
    const signalStrength = Math.max(buySignals, sellSignals) / (totalSignals + 1); // +1 for trend
    const confidence = Math.min(95, riskAssessment.confidence_score * signalStrength);
    
    let action: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'NO_ACTION';
    
    if (buySignals > sellSignals && confidence > 60) {
      action = 'BUY_ETH';
      reasoning.push(`Buy decision: ${buySignals} buy signals vs ${sellSignals} sell signals`);
    } else if (sellSignals > buySignals && confidence > 60) {
      action = 'SELL_ETH';
      reasoning.push(`Sell decision: ${sellSignals} sell signals vs ${buySignals} buy signals`);
    } else if (Math.abs(buySignals - sellSignals) <= 1) {
      action = 'HOLD';
      reasoning.push('Signals mixed, holding position');
    } else {
      action = 'NO_ACTION';
      reasoning.push('Insufficient signal confidence for action');
    }
    
    return { action, reasoning, confidence };
  }

  private async executeTrade(strategyDecision: any, params: TradeExecutionParams): Promise<any> {
    const currentPrice = params.indicators.price;
    const riskProfile = waidesKIRiskManager.getRiskProfile();
    
    // Calculate position size (conservative approach)
    const maxRiskUSD = (riskProfile.currentCapital * this.autoTradingConfig.max_risk_per_trade) / 100;
    const positionSizeUSD = Math.min(maxRiskUSD, 100); // Max $100 per trade for safety
    
    if (strategyDecision.action === 'BUY_ETH') {
      return await this.exchangeAPI.buy_eth(positionSizeUSD, currentPrice);
    } else if (strategyDecision.action === 'SELL_ETH') {
      // For sell, calculate ETH amount based on position size
      const ethAmount = positionSizeUSD / currentPrice;
      return await this.exchangeAPI.sell_eth(ethAmount, currentPrice);
    }
    
    return null;
  }

  private createExecutionResult(
    executionId: string,
    params: TradeExecutionParams,
    dnaId: string,
    strategyDecision: any,
    tradeResult: any,
    riskAssessment: ExecutionResult['risk_assessment'],
    startTime: number
  ): ExecutionResult {
    const processingTime = Date.now() - startTime;
    
    const result: ExecutionResult = {
      execution_id: executionId,
      timestamp: Date.now(),
      strategy_id: params.strategy_id,
      dna_id: dnaId,
      status: 'EXECUTED',
      action: strategyDecision.action,
      reasoning: strategyDecision.reasoning,
      risk_assessment: riskAssessment,
      trade_details: tradeResult ? {
        entry_price: tradeResult.executed_price,
        amount_eth: tradeResult.amount_eth || 0,
        amount_usd: tradeResult.amount_usd || 0,
        estimated_profit_target: tradeResult.executed_price * 1.03, // 3% target
        estimated_stop_loss: tradeResult.executed_price * 0.98, // 2% stop loss
        exchange: tradeResult.exchange,
        order_type: strategyDecision.action === 'BUY_ETH' ? 'MARKET_BUY' : 'MARKET_SELL'
      } : undefined,
      outcome: tradeResult ? {
        result: tradeResult.profit_loss > 0 ? 'WIN' : 'LOSS',
        actual_profit_loss: tradeResult.profit_loss,
        exit_price: undefined,
        exit_timestamp: undefined,
        holding_duration: undefined
      } : undefined,
      metadata: {
        execution_engine: params.execution_engine,
        processing_time_ms: processingTime,
        market_conditions: params.indicators,
        decision_factors: {
          confidence_level: params.confidence_level,
          strategy_code: params.strategy_code,
          signal_strength: strategyDecision.confidence
        }
      }
    };
    
    return result;
  }

  private createRejectedResult(executionId: string, params: TradeExecutionParams, reasons: string[], startTime: number, dnaId?: string): ExecutionResult {
    return {
      execution_id: executionId,
      timestamp: Date.now(),
      strategy_id: params.strategy_id,
      dna_id: dnaId || 'UNKNOWN',
      status: 'REJECTED',
      action: 'NO_ACTION',
      reasoning: reasons,
      risk_assessment: {
        risk_level: 'HIGH',
        confidence_score: 0,
        safety_checks_passed: false,
        rejection_factors: reasons
      },
      metadata: {
        execution_engine: params.execution_engine,
        processing_time_ms: Date.now() - startTime,
        market_conditions: params.indicators,
        decision_factors: {
          confidence_level: params.confidence_level,
          strategy_code: params.strategy_code
        }
      }
    };
  }

  private createSkippedResult(executionId: string, params: TradeExecutionParams, reasons: string[], startTime: number, dnaId: string): ExecutionResult {
    return {
      execution_id: executionId,
      timestamp: Date.now(),
      strategy_id: params.strategy_id,
      dna_id: dnaId,
      status: 'SKIPPED',
      action: 'NO_ACTION',
      reasoning: reasons,
      risk_assessment: {
        risk_level: 'MEDIUM',
        confidence_score: params.confidence_level,
        safety_checks_passed: true,
        rejection_factors: []
      },
      metadata: {
        execution_engine: params.execution_engine,
        processing_time_ms: Date.now() - startTime,
        market_conditions: params.indicators,
        decision_factors: {
          confidence_level: params.confidence_level,
          strategy_code: params.strategy_code
        }
      }
    };
  }

  private createErrorResult(executionId: string, params: TradeExecutionParams, errorMessage: string, startTime: number): ExecutionResult {
    return {
      execution_id: executionId,
      timestamp: Date.now(),
      strategy_id: params.strategy_id,
      dna_id: 'ERROR',
      status: 'ERROR',
      action: 'NO_ACTION',
      reasoning: [`Execution error: ${errorMessage}`],
      risk_assessment: {
        risk_level: 'EXTREME',
        confidence_score: 0,
        safety_checks_passed: false,
        rejection_factors: [`System error: ${errorMessage}`]
      },
      metadata: {
        execution_engine: params.execution_engine,
        processing_time_ms: Date.now() - startTime,
        market_conditions: params.indicators,
        decision_factors: {
          confidence_level: params.confidence_level,
          strategy_code: params.strategy_code
        }
      }
    };
  }

  private async updateLearningSystems(executionResult: ExecutionResult): Promise<void> {
    try {
      // Update root memory
      if (executionResult.outcome) {
        waidesKIRootMemory.registerStrategy(
          executionResult.strategy_id,
          executionResult.dna_id,
          executionResult.outcome.result,
          executionResult.outcome.actual_profit_loss,
          executionResult.risk_assessment.confidence_score,
          {
            execution_engine: executionResult.metadata.execution_engine,
            action: executionResult.action,
            risk_level: executionResult.risk_assessment.risk_level
          }
        );
      }
      
      // Update signature tracker
      if (executionResult.outcome) {
        waidesKISignatureTracker.recordResult(
          executionResult.dna_id,
          executionResult.outcome.result,
          executionResult.outcome.actual_profit_loss,
          executionResult.risk_assessment.confidence_score,
          executionResult.metadata.market_conditions,
          executionResult.metadata.execution_engine
        );
      }
      
      // Log to daily reporter
      waidesKIDailyReporter.recordLesson(
        `Executed ${executionResult.action} via ${executionResult.metadata.execution_engine}: ${executionResult.status}`,
        'EXECUTION',
        executionResult.status === 'EXECUTED' ? 'HIGH' : 'MEDIUM',
        'Trader Engine'
      );
      
    } catch (error) {
      console.error('Error updating learning systems:', error);
    }
  }

  private async runShadowSimulation(executionResult: ExecutionResult, indicators: MarketIndicators): Promise<void> {
    try {
      // Only run shadow simulation for executed trades
      if (executionResult.status === 'EXECUTED') {
        const shadowResult = await waidesKIShadowSimulator.simulateAlternatives(
          indicators,
          executionResult.dna_id,
          executionResult.action,
          executionResult.execution_id
        );
        
        // Log significant shadow discoveries
        if (shadowResult.comparison_analysis.missed_opportunity_score > 60) {
          waidesKIDailyReporter.recordLesson(
            `Shadow simulation revealed ${shadowResult.comparison_analysis.missed_opportunity_score}% missed opportunity in ${executionResult.execution_id}`,
            'SHADOW',
            'HIGH',
            'Shadow Simulation'
          );
        }
      }
    } catch (error) {
      console.error('Error running shadow simulation:', error);
    }
  }

  // UTILITY METHODS
  private extractNumber(text: string): number {
    const match = text.match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  }

  private generateExecutionId(): string {
    return `EXEC_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private cleanOldExecutionLogs(): void {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.executionLog = this.executionLog.filter(log => log.timestamp > thirtyDaysAgo);
  }

  // PUBLIC INTERFACE METHODS
  getExecutionLogs(limit: number = 100): ExecutionResult[] {
    return this.executionLog.slice(-limit).reverse();
  }

  getAutoTradingConfig(): AutoTradingConfig {
    return { ...this.autoTradingConfig };
  }

  updateAutoTradingConfig(config: Partial<AutoTradingConfig>): void {
    this.autoTradingConfig = { ...this.autoTradingConfig, ...config };
    
    waidesKIDailyReporter.recordLesson(
      `Auto-trading configuration updated: ${Object.keys(config).join(', ')}`,
      'SYSTEM',
      'HIGH',
      'Trader Engine'
    );
  }

  getExecutionStatistics(): {
    total_executions: number;
    successful_executions: number;
    rejected_executions: number;
    skipped_executions: number;
    success_rate: number;
    average_profit_loss: number;
    total_profit_loss: number;
    active_trades: number;
    daily_trade_count: number;
    execution_engines: { [engine: string]: number };
  } {
    const totalExecutions = this.executionLog.length;
    const successfulExecutions = this.executionLog.filter(log => log.status === 'EXECUTED').length;
    const rejectedExecutions = this.executionLog.filter(log => log.status === 'REJECTED').length;
    const skippedExecutions = this.executionLog.filter(log => log.status === 'SKIPPED').length;
    
    const executedTrades = this.executionLog.filter(log => log.outcome);
    const avgProfitLoss = executedTrades.length > 0 ? 
      executedTrades.reduce((sum, log) => sum + (log.outcome?.actual_profit_loss || 0), 0) / executedTrades.length : 0;
    const totalProfitLoss = executedTrades.reduce((sum, log) => sum + (log.outcome?.actual_profit_loss || 0), 0);
    
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
    
    // Execution engine distribution
    const engineStats: { [engine: string]: number } = {};
    this.executionLog.forEach(log => {
      const engine = log.metadata.execution_engine;
      engineStats[engine] = (engineStats[engine] || 0) + 1;
    });
    
    return {
      total_executions: totalExecutions,
      successful_executions: successfulExecutions,
      rejected_executions: rejectedExecutions,
      skipped_executions: skippedExecutions,
      success_rate: Math.round(successRate * 100) / 100,
      average_profit_loss: Math.round(avgProfitLoss * 100) / 100,
      total_profit_loss: Math.round(totalProfitLoss * 100) / 100,
      active_trades: this.activeTrades.size,
      daily_trade_count: this.dailyTradeCount,
      execution_engines: engineStats
    };
  }

  enableAutoTrading(): void {
    this.autoTradingConfig.is_enabled = true;
    waidesKIDailyReporter.logEmotionalState(
      'CONFIDENT',
      'Auto-trading system enabled',
      'Trader Engine Activation',
      85
    );
  }

  disableAutoTrading(): void {
    this.autoTradingConfig.is_enabled = false;
    waidesKIDailyReporter.logEmotionalState(
      'CAUTIOUS',
      'Auto-trading system disabled',
      'Trader Engine Deactivation',
      60
    );
  }

  activateEmergencyStop(): void {
    this.emergencyStopActive = true;
    this.autoTradingConfig.is_enabled = false;
    
    waidesKIDailyReporter.logEmotionalState(
      'ALERT',
      'Emergency stop activated - all trading halted',
      'Emergency Stop',
      95
    );
  }

  deactivateEmergencyStop(): void {
    this.emergencyStopActive = false;
    
    waidesKIDailyReporter.logEmotionalState(
      'RELIEVED',
      'Emergency stop deactivated',
      'Emergency Stop Cleared',
      70
    );
  }

  async getAccountBalance(): Promise<any> {
    return await this.exchangeAPI.get_account_balance();
  }

  exportExecutionData(): any {
    return {
      execution_logs: this.executionLog,
      auto_trading_config: this.autoTradingConfig,
      execution_statistics: this.getExecutionStatistics(),
      emergency_stop_active: this.emergencyStopActive,
      export_timestamp: new Date().toISOString()
    };
  }

  // INTEGRATION WITH OTHER ENGINES
  async executeFromWaidBot(strategyId: string, strategyCode: string, indicators: MarketIndicators, confidence: number): Promise<ExecutionResult> {
    return this.evaluateAndExecute({
      strategy_id: strategyId,
      strategy_code: strategyCode,
      indicators,
      confidence_level: confidence,
      execution_engine: 'WAIDBOT'
    });
  }

  async executeFromWaidBotPro(strategyId: string, strategyCode: string, indicators: MarketIndicators, confidence: number): Promise<ExecutionResult> {
    return this.evaluateAndExecute({
      strategy_id: strategyId,
      strategy_code: strategyCode,
      indicators,
      confidence_level: confidence,
      execution_engine: 'WAIDBOT_PRO'
    });
  }

  async executeFromGenomeEngine(generatedStrategy: any): Promise<ExecutionResult> {
    const indicators: MarketIndicators = {
      trend: 'UPTREND', // Would be derived from current market
      rsi: 50, // Would be current RSI
      vwap_status: 'ABOVE', // Would be current VWAP status
      price: 2400, // Would be current price
      ema50: 2380,
      ema200: 2350,
      volume: 1500000,
      timestamp: Date.now()
    };
    
    return this.evaluateAndExecute({
      strategy_id: generatedStrategy.strategy_id,
      strategy_code: generatedStrategy.strategy_code,
      indicators,
      confidence_level: generatedStrategy.confidence_level || 70,
      dna_id: generatedStrategy.dna_id,
      execution_engine: 'GENOME_ENGINE'
    });
  }
}

export const waidesKITraderEngine = new WaidesKITraderEngine();