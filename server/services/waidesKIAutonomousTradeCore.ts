import { waidesKIVirtualEyeScanner } from './waidesKIVirtualEyeScanner';
import { waidesKIEmotionalFirewall } from './waidesKIEmotionalFirewall';
import { waidesKITraderEngine } from './waidesKITraderEngine';
import { waidesKILiveFeed } from './waidesKILiveFeed';
import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKISelfHealing } from './waidesKISelfHealing';

interface TradeDuration {
  duration_type: '5m' | '4h' | '1d';
  timeframe_minutes: number;
  description: string;
  strategy_type: 'SCALPING' | 'MICRO_TREND' | 'MACRO_TREND';
}

interface AutonomousTrade {
  trade_id: string;
  open_timestamp: number;
  close_timestamp?: number;
  duration_selected: TradeDuration;
  direction: 'LONG' | 'SHORT';
  entry_price: number;
  exit_price?: number;
  current_pnl: number;
  target_profit: number;
  stop_loss: number;
  trade_status: 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  close_reason?: 'TARGET_HIT' | 'STOP_LOSS' | 'TIME_EXPIRED' | 'EMOTION_OVERRIDE' | 'MANUAL_CLOSE';
  scan_data_at_entry: any;
  emotional_state_at_entry: any;
  autonomous_decisions: string[];
}

interface AutonomousSession {
  session_id: string;
  start_time: number;
  end_time?: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  total_profit_loss: number;
  max_drawdown: number;
  session_duration_hours: number;
  trades_per_hour: number;
  win_rate: number;
  average_trade_duration: number;
  emotional_interventions: number;
  scan_accuracy: number;
  session_status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'TERMINATED';
}

interface AutonomousStatistics {
  total_autonomous_hours: number;
  total_trades_executed: number;
  autonomous_win_rate: number;
  total_autonomous_profit: number;
  average_trades_per_hour: number;
  best_trading_session: string;
  most_successful_duration: '5m' | '4h' | '1d';
  emotional_firewall_saves: number;
  scan_prediction_accuracy: number;
  autonomy_effectiveness: number;
  uptime_percentage: number;
  last_autonomous_trade: number;
}

export class WaidesKIAutonomousTradeCore {
  private isAutonomousActive: boolean = false;
  private currentSession: AutonomousSession | null = null;
  private activeTrades: Map<string, AutonomousTrade> = new Map();
  private completedTrades: AutonomousTrade[] = [];
  private autonomousSessions: AutonomousSession[] = [];
  private autonomousStatistics: AutonomousStatistics = {
    total_autonomous_hours: 0,
    total_trades_executed: 0,
    autonomous_win_rate: 0,
    total_autonomous_profit: 0,
    average_trades_per_hour: 0,
    best_trading_session: '',
    most_successful_duration: '4h',
    emotional_firewall_saves: 0,
    scan_prediction_accuracy: 0,
    autonomy_effectiveness: 85,
    uptime_percentage: 0,
    last_autonomous_trade: 0
  };
  
  private scanInterval: NodeJS.Timeout | null = null;
  private tradeMonitorInterval: NodeJS.Timeout | null = null;
  private maxActiveTradesCount: number = 3;
  private maxTradeHistory: number = 1000;
  private autonomousStartTime: number = 0;

  constructor() {
    // Start with autonomous mode enabled by default
    this.enableAutonomousTrading();
  }

  private startAutonomousLoop(): void {
    // Main autonomous scanning and decision loop - every 15 minutes
    this.scanInterval = setInterval(() => {
      if (this.isAutonomousActive) {
        this.executeAutonomousCycle();
      }
    }, 15 * 60 * 1000); // 15 minutes

    // Trade monitoring loop - every 2 minutes
    this.tradeMonitorInterval = setInterval(() => {
      if (this.isAutonomousActive) {
        this.monitorActiveTrades();
      }
    }, 2 * 60 * 1000); // 2 minutes

    // Initial execution after 30 seconds
    setTimeout(() => {
      if (this.isAutonomousActive) {
        this.executeAutonomousCycle();
      }
    }, 30000);
  }

  private async executeAutonomousCycle(): Promise<void> {
    try {
      // Step 1: Perform virtual eye scan
      const scanResult = await waidesKIVirtualEyeScanner.performVirtualScan();
      
      // Step 2: Check emotional state for trade entry
      const emotionalCheck = waidesKIEmotionalFirewall.evaluateTradeEntry();
      
      // Step 3: Determine if conditions are right for new trade
      const shouldTrade = this.evaluateAutonomousTradingConditions(scanResult, emotionalCheck);
      
      if (shouldTrade.can_trade) {
        // Step 4: Select optimal trade duration
        const selectedDuration = this.selectTradeDuration(scanResult);
        
        // Step 5: Execute autonomous trade
        await this.executeAutonomousTrade(scanResult, selectedDuration, shouldTrade.reasoning);
      }
      
      // Step 6: Update session statistics
      this.updateSessionStatistics();
      
    } catch (error) {
      console.error('Error in autonomous trading cycle:', error);
      
      waidesKIDailyReporter.recordLesson(
        `Autonomous trading cycle error: ${error.message}`,
        'AUTONOMOUS_CORE',
        'HIGH',
        'Autonomous Trade Core'
      );
    }
  }

  private evaluateAutonomousTradingConditions(scanResult: any, emotionalCheck: any): {
    can_trade: boolean;
    reasoning: string[];
    confidence: number;
  } {
    const reasoning: string[] = [];
    let canTrade = true;
    let confidence = 50;
    
    // Check if we have too many active trades
    if (this.activeTrades.size >= this.maxActiveTradesCount) {
      canTrade = false;
      reasoning.push(`Maximum active trades reached (${this.maxActiveTradesCount})`);
    }
    
    // Check emotional firewall
    if (!emotionalCheck.allowed) {
      canTrade = false;
      reasoning.push(`Emotional firewall blocked entry: ${emotionalCheck.reasoning.join(', ')}`);
    }
    
    // Check scan quality
    if (scanResult.alignment_score < 40) {
      canTrade = false;
      reasoning.push(`Low trend alignment score: ${scanResult.alignment_score}%`);
    }
    
    // Check safe trading zones
    if (scanResult.safe_trade_zones.risk_level === 'EXTREME' || scanResult.safe_trade_zones.risk_level === 'HIGH') {
      canTrade = false;
      reasoning.push(`High risk market conditions: ${scanResult.safe_trade_zones.risk_level}`);
    }
    
    // Calculate confidence based on multiple factors
    confidence = this.calculateTradingConfidence(scanResult, emotionalCheck);
    
    // Require minimum confidence for autonomous trading
    if (confidence < 60) {
      canTrade = false;
      reasoning.push(`Insufficient trading confidence: ${confidence}%`);
    }
    
    if (canTrade) {
      reasoning.push(`Autonomous trading conditions met - confidence: ${confidence}%`);
    }
    
    return {
      can_trade: canTrade,
      reasoning: reasoning,
      confidence: confidence
    };
  }

  private calculateTradingConfidence(scanResult: any, emotionalCheck: any): number {
    let confidence = 0;
    
    // Scan result confidence (40% weight)
    confidence += scanResult.alignment_score * 0.4;
    
    // Safe trading zones (25% weight)
    const safeZoneScore = scanResult.safe_trade_zones.risk_level === 'VERY_LOW' ? 100 :
                         scanResult.safe_trade_zones.risk_level === 'LOW' ? 80 :
                         scanResult.safe_trade_zones.risk_level === 'MEDIUM' ? 60 :
                         scanResult.safe_trade_zones.risk_level === 'HIGH' ? 30 : 10;
    confidence += safeZoneScore * 0.25;
    
    // Emotional state (20% weight)
    const emotionalScore = emotionalCheck.emotional_state === 'EXCELLENT' ? 100 :
                          emotionalCheck.emotional_state === 'GOOD' ? 80 :
                          emotionalCheck.emotional_state === 'MODERATE' ? 60 :
                          emotionalCheck.emotional_state === 'POOR' ? 40 : 20;
    confidence += emotionalScore * 0.2;
    
    // Market momentum (15% weight)
    const momentumScore = (scanResult.momentum_indicators.rsi_15m > 30 && scanResult.momentum_indicators.rsi_15m < 70) ? 80 : 50;
    confidence += momentumScore * 0.15;
    
    return Math.round(Math.max(0, Math.min(100, confidence)));
  }

  private selectTradeDuration(scanResult: any): TradeDuration {
    // Duration selection logic based on trend alignment and timeframe strength
    const trends = scanResult;
    
    // If all timeframes align strongly - use 1-day macro trend
    if (trends.trend_15m === trends.trend_4h && 
        trends.trend_4h === trends.trend_1d && 
        trends.alignment_score > 80) {
      return {
        duration_type: '1d',
        timeframe_minutes: 1440, // 24 hours
        description: 'Macro trend - all timeframes aligned',
        strategy_type: 'MACRO_TREND'
      };
    }
    
    // If 4h and 15m align - use 4-hour micro trend
    if (trends.trend_15m === trends.trend_4h && trends.confidence_4h > 65) {
      return {
        duration_type: '4h',
        timeframe_minutes: 240, // 4 hours
        description: 'Micro trend - short and medium timeframes aligned',
        strategy_type: 'MICRO_TREND'
      };
    }
    
    // Default to scalping for quick moves
    return {
      duration_type: '5m',
      timeframe_minutes: 5,
      description: 'Scalping - quick momentum capture',
      strategy_type: 'SCALPING'
    };
  }

  private async executeAutonomousTrade(
    scanResult: any, 
    duration: TradeDuration, 
    reasoning: string[]
  ): Promise<void> {
    try {
      const tradeId = this.generateTradeId();
      const currentPrice = await waidesKILiveFeed.getCurrentETHPrice();
      const emotionalState = waidesKIEmotionalFirewall.getCurrentEmotionalState();
      
      // Determine trade direction based on trend
      const direction: 'LONG' | 'SHORT' = scanResult.trend_4h === 'UP' ? 'LONG' : 'SHORT';
      
      // Calculate trade parameters
      const entryPrice = currentPrice;
      const stopLoss = direction === 'LONG' ? 
        entryPrice * 0.98 : // 2% stop loss for long
        entryPrice * 1.02;  // 2% stop loss for short
      
      const targetProfit = direction === 'LONG' ?
        entryPrice * (1 + (duration.duration_type === '5m' ? 0.005 : duration.duration_type === '4h' ? 0.02 : 0.05)) :
        entryPrice * (1 - (duration.duration_type === '5m' ? 0.005 : duration.duration_type === '4h' ? 0.02 : 0.05));
      
      // Create autonomous trade
      const autonomousTrade: AutonomousTrade = {
        trade_id: tradeId,
        open_timestamp: Date.now(),
        duration_selected: duration,
        direction: direction,
        entry_price: entryPrice,
        current_pnl: 0,
        target_profit: targetProfit,
        stop_loss: stopLoss,
        trade_status: 'ACTIVE',
        scan_data_at_entry: scanResult,
        emotional_state_at_entry: emotionalState,
        autonomous_decisions: [
          `Trade opened autonomously: ${direction} ETH at ${entryPrice}`,
          `Duration selected: ${duration.description}`,
          `Reasoning: ${reasoning.join(', ')}`
        ]
      };
      
      // Execute trade through trader engine
      const executionResult = await waidesKITraderEngine.executeFromGenomeEngine({
        strategy_id: `AUTONOMOUS_${tradeId}`,
        dna_id: `AUTO_DNA_${Date.now()}`,
        action: direction === 'LONG' ? 'BUY_ETH' : 'SELL_ETH',
        confidence: scanResult.alignment_score,
        entry_price: entryPrice,
        target_profit: targetProfit,
        stop_loss: stopLoss,
        timeframe: duration.duration_type,
        reasoning: reasoning
      });
      
      if (executionResult.status === 'EXECUTED') {
        this.activeTrades.set(tradeId, autonomousTrade);
        
        // Register with emotional firewall
        waidesKIEmotionalFirewall.registerActiveTrade(tradeId, Date.now());
        
        // Update session statistics
        if (this.currentSession) {
          this.currentSession.total_trades++;
        }
        
        this.autonomousStatistics.total_trades_executed++;
        this.autonomousStatistics.last_autonomous_trade = Date.now();
        
        waidesKIDailyReporter.recordLesson(
          `Autonomous trade executed: ${direction} ETH ${duration.duration_type} - ${executionResult.trade_details?.amount_eth} ETH`,
          'AUTONOMOUS_CORE',
          'HIGH',
          'Autonomous Trade Core'
        );
      }
      
    } catch (error) {
      console.error('Error executing autonomous trade:', error);
    }
  }

  private async monitorActiveTrades(): Promise<void> {
    const currentPrice = await waidesKILiveFeed.getCurrentETHPrice();
    
    for (const [tradeId, trade] of this.activeTrades.entries()) {
      try {
        // Calculate current P&L
        const pnlPercent = trade.direction === 'LONG' ?
          ((currentPrice - trade.entry_price) / trade.entry_price) * 100 :
          ((trade.entry_price - currentPrice) / trade.entry_price) * 100;
        
        trade.current_pnl = pnlPercent;
        
        // Update emotional firewall
        waidesKIEmotionalFirewall.updateTradeProgress(tradeId, pnlPercent);
        
        // Check for exit conditions
        const shouldExit = await this.evaluateTradeExit(trade, currentPrice);
        
        if (shouldExit.should_exit) {
          await this.closeAutonomousTrade(tradeId, currentPrice, shouldExit.reason);
        }
        
        // Check for duration expiry
        const timeHeld = (Date.now() - trade.open_timestamp) / (60 * 1000); // minutes
        if (timeHeld >= trade.duration_selected.timeframe_minutes) {
          await this.closeAutonomousTrade(tradeId, currentPrice, 'TIME_EXPIRED');
        }
        
      } catch (error) {
        console.error(`Error monitoring trade ${tradeId}:`, error);
      }
    }
  }

  private async evaluateTradeExit(trade: AutonomousTrade, currentPrice: number): Promise<{
    should_exit: boolean;
    reason: string;
  }> {
    // Check profit target
    const targetHit = trade.direction === 'LONG' ?
      currentPrice >= trade.target_profit :
      currentPrice <= trade.target_profit;
    
    if (targetHit) {
      return { should_exit: true, reason: 'TARGET_HIT' };
    }
    
    // Check stop loss
    const stopHit = trade.direction === 'LONG' ?
      currentPrice <= trade.stop_loss :
      currentPrice >= trade.stop_loss;
    
    if (stopHit) {
      return { should_exit: true, reason: 'STOP_LOSS' };
    }
    
    // Check emotional firewall
    const timeHeld = (Date.now() - trade.open_timestamp) / (60 * 1000);
    const emotionalEvaluation = waidesKIEmotionalFirewall.evaluateTradeExit(
      trade.trade_id, 
      trade.current_pnl, 
      timeHeld
    );
    
    if (!emotionalEvaluation.allowed && emotionalEvaluation.suggested_action === 'FORCE_EXIT') {
      return { should_exit: true, reason: 'EMOTION_OVERRIDE' };
    }
    
    return { should_exit: false, reason: 'CONTINUE_HOLDING' };
  }

  private async closeAutonomousTrade(tradeId: string, exitPrice: number, reason: string): Promise<void> {
    const trade = this.activeTrades.get(tradeId);
    if (!trade) return;
    
    try {
      // Update trade with exit information
      trade.close_timestamp = Date.now();
      trade.exit_price = exitPrice;
      trade.trade_status = 'CLOSED';
      trade.close_reason = reason as any;
      
      // Calculate final P&L
      const finalPnL = trade.direction === 'LONG' ?
        ((exitPrice - trade.entry_price) / trade.entry_price) * 100 :
        ((trade.entry_price - exitPrice) / trade.entry_price) * 100;
      
      trade.current_pnl = finalPnL;
      
      // Record with emotional firewall
      const tradeResult = finalPnL > 0 ? 'WIN' : 'LOSS';
      waidesKIEmotionalFirewall.recordTradeResult(tradeId, tradeResult, finalPnL);
      
      // Update session statistics
      if (this.currentSession) {
        if (tradeResult === 'WIN') {
          this.currentSession.winning_trades++;
        } else {
          this.currentSession.losing_trades++;
        }
        this.currentSession.total_profit_loss += finalPnL;
      }
      
      // Move to completed trades
      this.completedTrades.push(trade);
      this.activeTrades.delete(tradeId);
      
      // Maintain history size
      if (this.completedTrades.length > this.maxTradeHistory) {
        this.completedTrades = this.completedTrades.slice(-this.maxTradeHistory);
      }
      
      // Update overall statistics
      this.updateAutonomousStatistics();
      
      waidesKIDailyReporter.recordLesson(
        `Autonomous trade closed: ${trade.direction} ETH - P&L: ${finalPnL.toFixed(2)}% - Reason: ${reason}`,
        'AUTONOMOUS_CORE',
        finalPnL > 0 ? 'HIGH' : 'MEDIUM',
        'Autonomous Trade Core'
      );
      
    } catch (error) {
      console.error(`Error closing autonomous trade ${tradeId}:`, error);
    }
  }

  private updateSessionStatistics(): void {
    if (!this.currentSession) return;
    
    const now = Date.now();
    this.currentSession.session_duration_hours = (now - this.currentSession.start_time) / (60 * 60 * 1000);
    
    if (this.currentSession.session_duration_hours > 0) {
      this.currentSession.trades_per_hour = this.currentSession.total_trades / this.currentSession.session_duration_hours;
    }
    
    if (this.currentSession.total_trades > 0) {
      this.currentSession.win_rate = (this.currentSession.winning_trades / this.currentSession.total_trades) * 100;
    }
    
    // Calculate average trade duration
    const completedTradesInSession = this.completedTrades.filter(t => 
      t.open_timestamp >= this.currentSession.start_time
    );
    
    if (completedTradesInSession.length > 0) {
      const totalDuration = completedTradesInSession.reduce((sum, trade) => {
        if (trade.close_timestamp) {
          return sum + (trade.close_timestamp - trade.open_timestamp);
        }
        return sum;
      }, 0);
      
      this.currentSession.average_trade_duration = totalDuration / completedTradesInSession.length / (60 * 1000); // minutes
    }
  }

  private updateAutonomousStatistics(): void {
    if (this.completedTrades.length === 0) return;
    
    const winningTrades = this.completedTrades.filter(t => t.current_pnl > 0);
    this.autonomousStatistics.autonomous_win_rate = (winningTrades.length / this.completedTrades.length) * 100;
    
    this.autonomousStatistics.total_autonomous_profit = this.completedTrades.reduce((sum, trade) => {
      return sum + trade.current_pnl;
    }, 0);
    
    // Calculate uptime
    if (this.autonomousStartTime > 0) {
      const totalTime = Date.now() - this.autonomousStartTime;
      const activeTime = this.autonomousSessions.reduce((sum, session) => {
        const endTime = session.end_time || Date.now();
        return sum + (endTime - session.start_time);
      }, 0);
      
      this.autonomousStatistics.uptime_percentage = (activeTime / totalTime) * 100;
      this.autonomousStatistics.total_autonomous_hours = activeTime / (60 * 60 * 1000);
    }
    
    // Find most successful duration
    const durationStats = this.completedTrades.reduce((stats, trade) => {
      const duration = trade.duration_selected.duration_type;
      if (!stats[duration]) {
        stats[duration] = { wins: 0, total: 0 };
      }
      stats[duration].total++;
      if (trade.current_pnl > 0) stats[duration].wins++;
      return stats;
    }, {} as any);
    
    let bestDuration: '5m' | '4h' | '1d' = '4h';
    let bestWinRate = 0;
    
    for (const [duration, stats] of Object.entries(durationStats) as any) {
      const winRate = (stats.wins / stats.total) * 100;
      if (winRate > bestWinRate) {
        bestWinRate = winRate;
        bestDuration = duration;
      }
    }
    
    this.autonomousStatistics.most_successful_duration = bestDuration;
  }

  private generateTradeId(): string {
    return `AUTO_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateSessionId(): string {
    return `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  // PUBLIC INTERFACE METHODS
  enableAutonomousTrading(): void {
    if (this.isAutonomousActive) return;
    
    this.isAutonomousActive = true;
    this.autonomousStartTime = Date.now();
    
    // Start new session
    this.currentSession = {
      session_id: this.generateSessionId(),
      start_time: Date.now(),
      total_trades: 0,
      winning_trades: 0,
      losing_trades: 0,
      total_profit_loss: 0,
      max_drawdown: 0,
      session_duration_hours: 0,
      trades_per_hour: 0,
      win_rate: 0,
      average_trade_duration: 0,
      emotional_interventions: 0,
      scan_accuracy: 0,
      session_status: 'ACTIVE'
    };
    
    this.startAutonomousLoop();
    
    waidesKIDailyReporter.logEmotionalState(
      'FOCUSED',
      'Autonomous trade core activated - fully autonomous trading enabled',
      'Autonomous Trading Activation',
      95
    );
  }

  disableAutonomousTrading(): void {
    if (!this.isAutonomousActive) return;
    
    this.isAutonomousActive = false;
    
    // Clear intervals
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    
    if (this.tradeMonitorInterval) {
      clearInterval(this.tradeMonitorInterval);
      this.tradeMonitorInterval = null;
    }
    
    // Close current session
    if (this.currentSession) {
      this.currentSession.end_time = Date.now();
      this.currentSession.session_status = 'COMPLETED';
      this.autonomousSessions.push(this.currentSession);
      this.currentSession = null;
    }
    
    waidesKIDailyReporter.logEmotionalState(
      'NEUTRAL',
      'Autonomous trade core deactivated - manual trading mode',
      'Autonomous Trading Deactivation',
      70
    );
  }

  getAutonomousStatus(): {
    is_active: boolean;
    active_trades: number;
    current_session?: AutonomousSession;
    last_scan_time: number;
    next_scan_in_minutes: number;
    emotional_state: string;
    trading_safety: any;
  } {
    const lastScanResult = waidesKIVirtualEyeScanner.getLastScanResult();
    const tradingSafety = waidesKIVirtualEyeScanner.getTradingSafety();
    const emotionalState = waidesKIEmotionalFirewall.getCurrentEmotionalState();
    
    return {
      is_active: this.isAutonomousActive,
      active_trades: this.activeTrades.size,
      current_session: this.currentSession || undefined,
      last_scan_time: lastScanResult?.scan_timestamp || 0,
      next_scan_in_minutes: this.isAutonomousActive ? 15 : 0, // Fixed 15-minute interval
      emotional_state: emotionalState.overall_emotional_health,
      trading_safety: tradingSafety
    };
  }

  getActiveTrades(): AutonomousTrade[] {
    return Array.from(this.activeTrades.values());
  }

  getTradeHistory(limit: number = 50): AutonomousTrade[] {
    return this.completedTrades.slice(-limit).reverse();
  }

  getAutonomousStatistics(): AutonomousStatistics {
    return { ...this.autonomousStatistics };
  }

  getAutonomousSessions(limit: number = 10): AutonomousSession[] {
    return this.autonomousSessions.slice(-limit).reverse();
  }

  async forceCloseAllTrades(): Promise<number> {
    const currentPrice = await waidesKILiveFeed.getCurrentETHPrice();
    const closedCount = this.activeTrades.size;
    
    for (const [tradeId] of this.activeTrades.entries()) {
      await this.closeAutonomousTrade(tradeId, currentPrice, 'MANUAL_CLOSE');
    }
    
    return closedCount;
  }

  exportAutonomousTradeData(): any {
    return {
      autonomous_statistics: this.getAutonomousStatistics(),
      autonomous_status: this.getAutonomousStatus(),
      active_trades: this.getActiveTrades(),
      trade_history: this.getTradeHistory(100),
      autonomous_sessions: this.getAutonomousSessions(20),
      virtual_eye_data: waidesKIVirtualEyeScanner.exportVirtualEyeData(),
      emotional_firewall_data: waidesKIEmotionalFirewall.exportEmotionalFirewallData(),
      autonomous_config: {
        max_active_trades: this.maxActiveTradesCount,
        max_trade_history: this.maxTradeHistory,
        scan_interval_minutes: 15,
        monitor_interval_minutes: 2
      },
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKIAutonomousTradeCore = new WaidesKIAutonomousTradeCore();