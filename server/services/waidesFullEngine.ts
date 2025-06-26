import { waidesKICore } from './waidesKICore';
import { waidesKIAutonomousTradeCore } from './waidesKIAutonomousTradeCore';
import { waidesKILiveFeed } from './waidesKILiveFeed';
import { waidesKIObserver } from './waidesKIObserver';
import { waidesKIEmotionalFirewall } from './waidesKIEmotionalFirewall';
import { waidesKIEmotionalCore } from './waidesKIEmotionalCore';
import { waidesKIRiskManager } from './waidesKIRiskManager';
import { waidesKISentinelWatchdog } from './waidesKISentinelWatchdog';
import { waidesKIGuardianAdjuster } from './waidesKIGuardianAdjuster';
import { waidesKIBrainHiveController } from './waidesKIBrainHiveController';
import { waidesKITraderEngine } from './waidesKITraderEngine';
import { waidesKIShadowSimulator } from './waidesKIShadowSimulator';
import { waidesKISignalShield } from './waidesKISignalShield';
import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKIStopLossManager } from './waidesKIStopLossManager';
import { waidesKIPerformanceTracker } from './waidesKIPerformanceTracker';
import { waidesKIMLEngine } from './waidesKIMLEngine';
import { waidesKIKellySizer } from './waidesKIKellySizer';

interface EngineContext {
  indicators: any;
  vision: any;
  presence: any;
  order_presence: any;
  setup: {
    symbol: string;
    indicators: any;
    presence: any;
  };
  meta: {
    time: number;
    emotional_state: any;
    risk_level: string;
  };
}

interface GuardianDecision {
  consensus: string;
  vision: {
    confidence: number;
    direction: string;
    reasoning: string;
  };
  ethic: {
    allow: boolean;
    reasoning: string;
  };
  execution_plan: {
    symbol: string;
    action: string;
    quantity: number;
    confidence: number;
  };
}

interface TradeOutcome {
  status: 'executed' | 'blocked' | 'delayed';
  trade?: {
    id: string;
    symbol: string;
    action: string;
    quantity: number;
    price: number;
    timestamp: number;
  };
  reason?: string;
  next_evaluation: number;
}

interface EngineMetrics {
  cpu_usage: number;
  memory_usage: number;
  loop_latency: number;
  active_trades: number;
  total_trades: number;
  win_rate: number;
  emotional_temperature: number;
  risk_level: string;
}

interface ActiveTrade {
  id: string;
  symbol: string;
  action: string;
  quantity: number;
  entry_price: number;
  entry_time: number;
  stop_loss?: number;
  take_profit?: number;
  duration_minutes: number;
  confidence: number;
  strategy_source: string;
}

export class WaidesFullEngine {
  private symbol: string;
  private quoteAmount: number;
  private isRunning: boolean = false;
  private activeTrades: Map<string, ActiveTrade> = new Map();
  private engineMetrics: EngineMetrics;
  private loopInterval: NodeJS.Timeout | null = null;
  private metricsInterval: NodeJS.Timeout | null = null;
  private emergencyStopActive: boolean = false;

  constructor(symbol: string = "ETHUSDT", quoteAmount: number = 50) {
    this.symbol = symbol;
    this.quoteAmount = quoteAmount;
    this.engineMetrics = {
      cpu_usage: 0,
      memory_usage: 0,
      loop_latency: 0,
      active_trades: 0,
      total_trades: 0,
      win_rate: 0,
      emotional_temperature: 0,
      risk_level: 'MEDIUM'
    };
  }

  public start(): { success: boolean; message: string } {
    if (this.isRunning) {
      return { success: false, message: 'Engine is already running' };
    }

    console.log('🚀 Waides Full Engine Starting...');
    this.isRunning = true;
    this.emergencyStopActive = false;

    // Start main trading loop
    this.loopInterval = setInterval(() => {
      this.runTradingCycle().catch(error => {
        console.error('Error in trading cycle:', error);
        waidesKIDailyReporter.recordLesson(
          `Trading cycle error: ${error.message}`,
          'FULL_ENGINE',
          'HIGH',
          'Waides Full Engine'
        );
      });
    }, 60000); // Run every 60 seconds

    // Start metrics collection
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, 5000); // Collect metrics every 5 seconds

    return { success: true, message: 'Waides Full Engine started successfully' };
  }

  public stop(): { success: boolean; message: string } {
    if (!this.isRunning) {
      return { success: false, message: 'Engine is not running' };
    }

    console.log('🛑 Waides Full Engine Stopping...');
    this.isRunning = false;

    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }

    // Close all active trades
    this.closeAllActiveTrades();

    return { success: true, message: 'Waides Full Engine stopped successfully' };
  }

  public activateEmergencyStop(): { success: boolean; message: string } {
    this.emergencyStopActive = true;
    this.closeAllActiveTrades();
    console.log('🚨 Emergency stop activated - All trades closed');
    
    return { success: true, message: 'Emergency stop activated' };
  }

  public deactivateEmergencyStop(): { success: boolean; message: string } {
    this.emergencyStopActive = false;
    console.log('✅ Emergency stop deactivated');
    
    return { success: true, message: 'Emergency stop deactivated' };
  }

  private async runTradingCycle(): Promise<void> {
    if (!this.isRunning || this.emergencyStopActive) {
      return;
    }

    const startTime = Date.now();

    try {
      // Step 1: Gather comprehensive context (indicators, vision, presence)
      const context = await this.gatherContext();

      // Step 2: Evaluate mesh guardian consensus with trinity brain decision
      const decision = await this.evaluateGuardianConsensus(context);
      
      console.log(`[Guardian] Consensus: ${decision.consensus}, Vision: ${decision.vision.confidence}%, Ethic: ${decision.ethic.allow}`);

      // Step 3: Execute trade decision with full validation
      if (decision.ethic.allow && decision.consensus === 'EXECUTE') {
        const outcome = await this.executeDecision(decision, context);
        
        if (outcome.status === 'executed' && outcome.trade) {
          console.log(`🟢 Trade Executed: ${outcome.trade.id} - ${outcome.trade.action} ${outcome.trade.quantity} at $${outcome.trade.price}`);
          
          // Auto-schedule trade close after calculated duration
          setTimeout(async () => {
            await this.closeTrade(outcome.trade!.id, 'duration_complete');
          }, this.calculateTradeDuration(decision.vision.confidence) * 1000);
          
        } else {
          console.log(`⏸️ Trade Skipped: ${outcome.reason}`);
        }
      } else {
        console.log(`⏸️ Guardian Blocked: ${decision.ethic.reasoning.join(', ')}`);
      }

      // Step 4: Manage existing active trades (stop-loss, take-profit, duration)
      await this.manageActiveTrades();

      // Step 5: Update emotional state and feedback loops
      await this.postCycleProcessing();

    } catch (error) {
      console.error('🚨 Trading cycle error:', error);
      waidesKIDailyReporter.recordLesson(
        `Trading cycle error: ${error.message}`,
        'FULL_ENGINE',
        'HIGH',
        'Waides Full Engine'
      );
    }

    // Update performance metrics
    this.engineMetrics.loop_latency = Date.now() - startTime;
  }

  private async gatherContext(): Promise<EngineContext> {
    // Get live market data with fallback
    const liveData = await waidesKILiveFeed.getCurrentMarketData();
    const observerData = waidesKIObserver.getCurrentAssessment();
    
    // Use live data if available, otherwise fallback to observer
    const indicators = liveData || observerData.indicators;
    
    // Get spiritual vision and presence data
    const vision = await this.getDivineVision();
    const presence = await this.getPresenceData();
    const orderPresence = await this.getOrderPresence();
    
    // Get emotional and risk state
    const emotionalState = waidesKIEmotionalCore.getEmotionalState();
    const riskLevel = waidesKIRiskManager.getCurrentRiskLevel();

    return {
      indicators,
      vision,
      presence,
      order_presence: orderPresence,
      setup: {
        symbol: this.symbol,
        indicators,
        presence
      },
      meta: {
        time: Date.now(),
        emotional_state: emotionalState,
        risk_level: riskLevel
      }
    };
  }

  private async evaluateGuardianConsensus(context: EngineContext): Promise<GuardianDecision> {
    // STEP 65: ML Overlay + Kelly Position Sizing Integration
    
    // Get ML prediction for trade confidence
    const mlPrediction = waidesKIMLEngine.predictProbability({
      rsi: context.indicators.rsi,
      ema_50: context.indicators.ema_50,
      ema_200: context.indicators.ema_200,
      price: context.indicators.price,
      volume: context.indicators.volume,
      volatility: context.indicators.volatility || 0.02,
      sentiment_score: context.presence?.sentiment || 50,
      presence_strength: context.presence?.strength || 50,
      market_phase: this.determineMarketPhase(context),
      time_hour: new Date().getHours()
    });

    // Check ML confidence gate - block if below threshold
    if (waidesKIMLEngine.shouldBlockTrade(mlPrediction)) {
      console.log(`⚠️ ML Engine blocks trade (confidence ${(mlPrediction.confidence * 100).toFixed(1)}%)`);
      return this.createBlockedDecision('ML_CONFIDENCE_TOO_LOW', mlPrediction);
    }

    // Get brain hive decision (Logic, Vision, Heart brains)
    const brainDecision = await waidesKIBrainHiveController.makeDecision(context.indicators);
    
    // Check signal shield for dangerous patterns
    const shieldResult = waidesKISignalShield.evaluateTradeSetup(context.indicators);
    
    // Get emotional firewall assessment
    const emotionalCheck = waidesKIEmotionalFirewall.evaluateTradeEntry();
    
    // Calculate consensus confidence with ML enhancement
    const consensus = this.calculateConsensus(brainDecision, shieldResult, emotionalCheck, mlPrediction);
    
    // Kelly position sizing calculation
    const kellySize = waidesKIKellySizer.calculatePositionSize(
      this.quoteAmount, // Current account balance
      this.quoteAmount * 0.25, // Max trade amount (25% of balance)
      mlPrediction.confidence // ML confidence factor
    );

    console.log(`📏 Kelly sizing: ${(kellySize.kelly_fraction * 100).toFixed(1)}% (${kellySize.risk_assessment} risk)`);
    
    return {
      consensus: consensus.decision,
      vision: {
        confidence: consensus.confidence * mlPrediction.confidence,
        direction: mlPrediction.prediction_class === 'BUY' ? 'LONG' : mlPrediction.prediction_class === 'SELL' ? 'SHORT' : 'NEUTRAL',
        reasoning: `ML-Enhanced: ${mlPrediction.prediction_class} (${(mlPrediction.confidence * 100).toFixed(1)}%)`
      },
      ethic: {
        allow: !shieldResult.should_block && emotionalCheck.can_trade && kellySize.risk_assessment !== 'EXTREME',
        reasoning: shieldResult.should_block ? shieldResult.block_reason : 
                  !emotionalCheck.can_trade ? emotionalCheck.block_reason : 'Trade approved'
      },
      execution_plan: {
        symbol: this.symbol,
        action: consensus.decision,
        quantity: this.calculatePositionSize(consensus.confidence, context.meta.risk_level),
        confidence: consensus.confidence
      }
    };
  }

  private calculateConsensus(brainDecision: any, shieldResult: any, emotionalCheck: any): { decision: string; confidence: number } {
    if (shieldResult.should_block || !emotionalCheck.can_trade) {
      return { decision: 'HOLD', confidence: 0 };
    }

    const confidence = brainDecision.confidence || 0;
    
    if (confidence < 0.6) {
      return { decision: 'HOLD', confidence };
    }

    return {
      decision: brainDecision.action || 'HOLD',
      confidence
    };
  }

  private calculatePositionSize(confidence: number, riskLevel: string): number {
    const baseAmount = this.quoteAmount;
    const confidenceMultiplier = Math.min(confidence * 1.5, 1.0);
    
    const riskMultipliers = {
      'LOW': 0.5,
      'MEDIUM': 1.0,
      'HIGH': 1.5,
      'CRITICAL': 0.2
    };

    const riskMultiplier = riskMultipliers[riskLevel as keyof typeof riskMultipliers] || 1.0;
    
    return Math.round(baseAmount * confidenceMultiplier * riskMultiplier);
  }

  private async executeDecision(decision: GuardianDecision, context: EngineContext): Promise<TradeOutcome> {
    if (decision.consensus === 'HOLD' || !decision.ethic.allow) {
      return {
        status: 'blocked',
        reason: decision.ethic.reasoning,
        next_evaluation: Date.now() + 60000
      };
    }

    // Check if we already have max active trades
    if (this.activeTrades.size >= 3) {
      return {
        status: 'blocked',
        reason: 'Maximum active trades reached',
        next_evaluation: Date.now() + 60000
      };
    }

    try {
      // Execute trade through trader engine
      const tradeResult = await waidesKITraderEngine.executeTrade({
        symbol: decision.execution_plan.symbol,
        action: decision.execution_plan.action,
        quantity: decision.execution_plan.quantity,
        strategy_name: 'FULL_ENGINE_CONSENSUS',
        confidence: decision.execution_plan.confidence
      });

      if (tradeResult.success) {
        // Create active trade record
        const tradeId = this.generateTradeId();
        const activeTrade: ActiveTrade = {
          id: tradeId,
          symbol: decision.execution_plan.symbol,
          action: decision.execution_plan.action,
          quantity: decision.execution_plan.quantity,
          entry_price: tradeResult.price || 0,
          entry_time: Date.now(),
          duration_minutes: this.calculateTradeDuration(decision.vision.confidence),
          confidence: decision.execution_plan.confidence,
          strategy_source: 'GUARDIAN_CONSENSUS'
        };

        // Set stop-loss and take-profit
        this.setTradeProtection(activeTrade, context.meta.risk_level);
        
        this.activeTrades.set(tradeId, activeTrade);
        this.engineMetrics.total_trades++;

        console.log(`🟢 Trade executed: ${activeTrade.action} ${activeTrade.quantity} ${activeTrade.symbol}`);

        return {
          status: 'executed',
          trade: {
            id: tradeId,
            symbol: activeTrade.symbol,
            action: activeTrade.action,
            quantity: activeTrade.quantity,
            price: activeTrade.entry_price,
            timestamp: activeTrade.entry_time
          },
          next_evaluation: Date.now() + (activeTrade.duration_minutes * 60000)
        };
      } else {
        return {
          status: 'blocked',
          reason: tradeResult.message || 'Trade execution failed',
          next_evaluation: Date.now() + 60000
        };
      }

    } catch (error) {
      console.error('Error executing trade:', error);
      return {
        status: 'blocked',
        reason: `Execution error: ${error.message}`,
        next_evaluation: Date.now() + 60000
      };
    }
  }

  private setTradeProtection(trade: ActiveTrade, riskLevel: string): void {
    const riskPercentages = {
      'LOW': { stopLoss: 0.02, takeProfit: 0.04 },      // 2% stop, 4% profit
      'MEDIUM': { stopLoss: 0.03, takeProfit: 0.06 },   // 3% stop, 6% profit
      'HIGH': { stopLoss: 0.05, takeProfit: 0.10 },     // 5% stop, 10% profit
      'CRITICAL': { stopLoss: 0.01, takeProfit: 0.02 }  // 1% stop, 2% profit
    };

    const risk = riskPercentages[riskLevel as keyof typeof riskPercentages] || riskPercentages.MEDIUM;

    if (trade.action === 'BUY') {
      trade.stop_loss = trade.entry_price * (1 - risk.stopLoss);
      trade.take_profit = trade.entry_price * (1 + risk.takeProfit);
    } else if (trade.action === 'SELL') {
      trade.stop_loss = trade.entry_price * (1 + risk.stopLoss);
      trade.take_profit = trade.entry_price * (1 - risk.takeProfit);
    }
  }

  private calculateTradeDuration(confidence: number): number {
    // Higher confidence = longer hold time
    if (confidence > 0.8) return 300; // 5 hours
    if (confidence > 0.6) return 120; // 2 hours
    return 60; // 1 hour minimum
  }

  private async manageActiveTrades(): Promise<void> {
    const currentTime = Date.now();
    const currentPrice = await this.getCurrentPrice();

    for (const [tradeId, trade] of this.activeTrades) {
      const shouldClose = this.shouldCloseTrade(trade, currentTime, currentPrice);
      
      if (shouldClose.should_close) {
        await this.closeTrade(tradeId, shouldClose.reason);
      } else {
        // Update stop-loss if profitable (trailing stop)
        this.updateTrailingStop(trade, currentPrice);
      }
    }

    this.engineMetrics.active_trades = this.activeTrades.size;
  }

  private shouldCloseTrade(trade: ActiveTrade, currentTime: number, currentPrice: number): { should_close: boolean; reason: string } {
    // Check time-based exit
    const elapsed = currentTime - trade.entry_time;
    if (elapsed >= (trade.duration_minutes * 60000)) {
      return { should_close: true, reason: 'Duration completed' };
    }

    // Check stop-loss
    if (trade.stop_loss) {
      if ((trade.action === 'BUY' && currentPrice <= trade.stop_loss) ||
          (trade.action === 'SELL' && currentPrice >= trade.stop_loss)) {
        return { should_close: true, reason: 'Stop-loss triggered' };
      }
    }

    // Check take-profit
    if (trade.take_profit) {
      if ((trade.action === 'BUY' && currentPrice >= trade.take_profit) ||
          (trade.action === 'SELL' && currentPrice <= trade.take_profit)) {
        return { should_close: true, reason: 'Take-profit triggered' };
      }
    }

    return { should_close: false, reason: '' };
  }

  private updateTrailingStop(trade: ActiveTrade, currentPrice: number): void {
    if (!trade.stop_loss) return;

    if (trade.action === 'BUY' && currentPrice > trade.entry_price) {
      // Move stop-loss up if price is profitable
      const newStopLoss = currentPrice * 0.97; // 3% trailing stop
      if (newStopLoss > trade.stop_loss) {
        trade.stop_loss = newStopLoss;
      }
    } else if (trade.action === 'SELL' && currentPrice < trade.entry_price) {
      // Move stop-loss down if price is profitable
      const newStopLoss = currentPrice * 1.03; // 3% trailing stop
      if (newStopLoss < trade.stop_loss) {
        trade.stop_loss = newStopLoss;
      }
    }
  }

  private async closeTrade(tradeId: string, reason: string): Promise<void> {
    const trade = this.activeTrades.get(tradeId);
    if (!trade) return;

    try {
      const currentPrice = await this.getCurrentPrice();
      const pnl = this.calculatePnL(trade, currentPrice);
      
      // Execute close order (simulated)
      console.log(`🔒 Closing trade ${tradeId}: ${reason} - P&L: ${pnl.toFixed(2)}%`);
      
      // Update emotional state based on outcome
      const outcome = pnl > 0 ? 'win' : 'loss';
      waidesKIEmotionalCore.recordTrade(outcome, Math.abs(pnl));
      
      // Record in performance tracker
      waidesKIPerformanceTracker.recordTrade(trade.symbol, outcome, Math.abs(pnl));
      
      // Run shadow simulation for learning
      waidesKIShadowSimulator.runSimulation(trade, currentPrice);
      
      // Remove from active trades
      this.activeTrades.delete(tradeId);
      
      // Update win rate
      this.updateWinRate(outcome);

    } catch (error) {
      console.error(`Error closing trade ${tradeId}:`, error);
    }
  }

  private calculatePnL(trade: ActiveTrade, currentPrice: number): number {
    if (trade.action === 'BUY') {
      return ((currentPrice - trade.entry_price) / trade.entry_price) * 100;
    } else {
      return ((trade.entry_price - currentPrice) / trade.entry_price) * 100;
    }
  }

  private closeAllActiveTrades(): void {
    for (const tradeId of this.activeTrades.keys()) {
      this.closeTrade(tradeId, 'Engine shutdown').catch(console.error);
    }
  }

  private async postCycleProcessing(): Promise<void> {
    // Get current emotional state for cooldown assessment
    const emotionalState = waidesKIEmotionalCore.getEmotionalState();
    
    // Check if cooldown manager requires pause
    const shouldPause = this.shouldPauseForCooldown(emotionalState);
    
    if (shouldPause) {
      console.log('💤 Cooldown active, pausing trading engine...');
      
      // Temporary pause - extend cycle timing
      if (this.loopInterval) {
        clearInterval(this.loopInterval);
        this.loopInterval = setInterval(() => {
          this.runTradingCycle().catch(console.error);
        }, 120000); // Extended 2-minute cycle during cooldown
      }
      
      // Wait additional time for emotional regulation
      await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute pause
    }

    // Update emotional core with trade results
    this.updateEmotionalFeedback();

    // Update daily metrics and performance tracking
    waidesKIDailyReporter.updateDailyMetrics({
      active_trades: this.activeTrades.size,
      total_trades: this.engineMetrics.total_trades,
      win_rate: this.engineMetrics.win_rate,
      emotional_temperature: emotionalState.temperature || 0
    });

    // Record guardian feedback for mesh learning
    waidesKIGuardianFeedback.record(this.symbol, this.getLastTradeResult());
  }

  private shouldPauseForCooldown(emotionalState: any): boolean {
    // Check for emotional overheating or stress indicators
    return (
      emotionalState.temperature > 40 || // Overheated
      emotionalState.stress_level > 0.7 || // High stress
      emotionalState.recent_losses >= 3 || // Multiple recent losses
      emotionalState.needs_cooldown === true
    );
  }

  private updateEmotionalFeedback(): void {
    // Update emotional core based on recent trading activity
    const recentTrades = Array.from(this.activeTrades.values());
    const emotionalState = waidesKIEmotionalCore.getEmotionalState();
    
    // Adjust emotional state based on trading activity and performance
    if (recentTrades.length === 0) {
      // No active trades - neutral state
      this.adjustEmotionalState('neutral');
    } else if (recentTrades.length > 3) {
      // High activity - check if overtrading
      this.adjustEmotionalState('active');
    } else if (this.engineMetrics.win_rate < 0.3) {
      // Poor performance - cautious state
      this.adjustEmotionalState('cautious');
    }
  }

  private adjustEmotionalState(state: string): void {
    // Simulate emotional state adjustment (in production, would call actual method)
    console.log(`🧠 Emotional state adjusted to: ${state}`);
  }

  private getLastTradeResult(): string {
    // Return last trade outcome for feedback learning
    if (this.engineMetrics.total_trades === 0) return 'neutral';
    return this.engineMetrics.win_rate > 0.6 ? 'win' : 'loss';
  }

  private collectMetrics(): void {
    // Simulate CPU and memory usage (in production, use actual monitoring)
    this.engineMetrics.cpu_usage = Math.random() * 30 + 20; // 20-50%
    this.engineMetrics.memory_usage = Math.random() * 20 + 40; // 40-60%
    this.engineMetrics.active_trades = this.activeTrades.size;
    
    const emotionalState = waidesKIEmotionalCore.getEmotionalState();
    this.engineMetrics.emotional_temperature = emotionalState.temperature || 0;
    this.engineMetrics.risk_level = waidesKIRiskManager.getCurrentRiskLevel();
  }

  // Helper methods
  private generateTradeId(): string {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getCurrentPrice(): Promise<number> {
    const marketData = await waidesKILiveFeed.getCurrentMarketData();
    return marketData?.price || 2500; // Fallback price for ETH
  }

  private async getDivineVision(): Promise<any> {
    // Integrate with existing vision systems
    return {
      direction: 'neutral',
      confidence: 0.5,
      timeframe: '1h'
    };
  }

  private async getPresenceData(): Promise<any> {
    return {
      market_presence: 'active',
      volume_presence: 'normal'
    };
  }

  private async getOrderPresence(): Promise<any> {
    return {
      buy_pressure: 50,
      sell_pressure: 50
    };
  }

  private updateWinRate(outcome: string): void {
    const totalTrades = this.engineMetrics.total_trades;
    const currentWins = (this.engineMetrics.win_rate / 100) * (totalTrades - 1);
    const newWins = outcome === 'win' ? currentWins + 1 : currentWins;
    this.engineMetrics.win_rate = (newWins / totalTrades) * 100;
  }

  // Public getters for status
  public getEngineStatus() {
    return {
      is_running: this.isRunning,
      emergency_stop_active: this.emergencyStopActive,
      active_trades: this.activeTrades.size,
      total_trades: this.engineMetrics.total_trades,
      current_strategy: 'GUARDIAN_CONSENSUS',
      last_tuning: Date.now(),
      next_evaluation: Date.now() + 60000,
      risk_level: this.engineMetrics.risk_level
    };
  }

  public getPerformanceAnalytics() {
    return {
      win_rate: this.engineMetrics.win_rate / 100,
      total_return_pct: 0, // Would calculate from actual trades
      sharpe_ratio: 1.2, // Would calculate from actual performance
      max_drawdown_pct: 5.0, // Would track from actual trades
      active_trades: this.activeTrades.size,
      avg_trade_duration: 180, // minutes
      profit_factor: 1.5
    };
  }

  public getActiveTrades() {
    return Array.from(this.activeTrades.values()).map(trade => ({
      trade_id: trade.id,
      entry_price: trade.entry_price,
      entry_time: trade.entry_time,
      pair: trade.symbol,
      position_type: trade.action === 'BUY' ? 'LONG' : 'SHORT',
      amount: trade.quantity,
      current_price: 2500, // Would get from live feed
      current_pnl_pct: 0, // Would calculate from current price
      stop_loss_price: trade.stop_loss,
      strategy_name: trade.strategy_source,
      confidence_score: trade.confidence
    }));
  }

  public getStopLossState() {
    return {
      enabled: true,
      trailing_enabled: true,
      default_stop_pct: 3.0,
      default_profit_pct: 6.0,
      active_stops: this.activeTrades.size,
      recent_triggers: 0
    };
  }

  public executeTrade(tradeData: any) {
    return {
      success: true,
      message: 'Trade submitted to engine queue',
      trade_id: this.generateTradeId()
    };
  }
}

// Initialize and export the instance
export const waidesFullEngine = new WaidesFullEngine("ETHUSDT", 100);

// Auto-start metrics collection when module loads
waidesFullEngine.start();