/**
 * MODULE 4 — Order Presence Updater
 * Listens to depth & trade websockets, saves human description
 * 
 * MODULE 5 — Integration with Waides Intelligence  
 * Check orderbook presence before every trade
 */

import { waidesKIOrderBookSentry } from './waidesKIOrderBookSentry.js';
import { waidesKIOrderBookInterpreter } from './waidesKIOrderBookInterpreter.js';
import { waidesKIETHOrderPresenceRegistry } from './waidesKIETHOrderPresenceRegistry.js';

export class WaidesKIOrderPresenceService {
  private isInitialized: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the complete order presence system
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🔄 Initializing ETH Order Presence Service...');
    
    try {
      // The components auto-initialize themselves
      // OrderBookSentry - connects to WebSockets automatically
      // OrderBookInterpreter - ready for interpretation
      // ETHOrderPresenceRegistry - starts auto-update loop
      
      this.isInitialized = true;
      this.startIntegrationChecks();
      
      console.log('✅ ETH Order Presence Service initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Order Presence Service:', error);
    }
  }

  /**
   * Start integration checks for trading decisions
   */
  private startIntegrationChecks(): void {
    // Periodic check for system health and integration status
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds
  }

  /**
   * Perform system health check
   */
  private performHealthCheck(): void {
    const registryHealth = waidesKIETHOrderPresenceRegistry.getHealthStatus();
    const sentryHealth = waidesKIOrderBookSentry.getConnectionHealth();
    
    if (!registryHealth.auto_update_running || registryHealth.connection_quality === 'poor') {
      console.log('⚠️ Order Presence System health degraded, attempting recovery...');
      waidesKIETHOrderPresenceRegistry.restart();
    }
  }

  /**
   * Check order book presence before trading decision
   * This is the main integration point for all trading logic
   */
  checkBeforeTrade(intendedAction: string): {
    should_proceed: boolean;
    order_book_advice: any;
    crowd_sentiment: string;
    confidence: number;
    reasoning: string;
  } {
    const presenceState = waidesKIETHOrderPresenceRegistry.get();
    const alignment = waidesKIETHOrderPresenceRegistry.checkTradeAlignment(intendedAction);
    const decisionSupport = waidesKIETHOrderPresenceRegistry.getTradingDecisionSupport();
    
    // Log the order book consultation
    console.log(`🔍 Depth feels like: ${presenceState.description}`);
    
    let reasoning = '';
    let should_proceed = alignment.should_proceed;

    if (!alignment.aligned) {
      console.log(`🚫 Contrarian to crowd — skipping ${intendedAction}`);
      reasoning = `Order book pressure (${presenceState.pressure}) opposes ${intendedAction}. ${alignment.recommendation}`;
      should_proceed = false;
    } else if (presenceState.confidence < 50) {
      console.log(`⚠️ Low confidence in order book signals — reducing position or waiting`);
      reasoning = `Order book confidence too low (${presenceState.confidence}%) for reliable ${intendedAction}`;
      should_proceed = false;
    } else {
      reasoning = `Order book supports ${intendedAction}: ${presenceState.description} with ${presenceState.confidence}% confidence`;
    }

    return {
      should_proceed,
      order_book_advice: decisionSupport.trading_advice,
      crowd_sentiment: decisionSupport.crowd_sentiment,
      confidence: presenceState.confidence,
      reasoning
    };
  }

  /**
   * Get comprehensive order book analysis for trading systems
   */
  getComprehensiveAnalysis(): {
    current_pressure: any;
    trading_decision_support: any;
    pressure_strength: any;
    health_status: any;
    integration_ready: boolean;
  } {
    const pressure = waidesKIETHOrderPresenceRegistry.get();
    const decisionSupport = waidesKIETHOrderPresenceRegistry.getTradingDecisionSupport();
    const pressureStrength = waidesKIETHOrderPresenceRegistry.getPressureStrength();
    const healthStatus = waidesKIETHOrderPresenceRegistry.getHealthStatus();

    const integration_ready = this.isInitialized && 
                             healthStatus.auto_update_running && 
                             healthStatus.connection_quality !== 'poor';

    return {
      current_pressure: pressure,
      trading_decision_support: decisionSupport,
      pressure_strength: pressureStrength,
      health_status: healthStatus,
      integration_ready
    };
  }

  /**
   * Get order book sentiment for external systems
   */
  getOrderBookSentiment(): {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    strength: number;
    description: string;
    confidence: number;
    last_update: Date;
  } {
    const state = waidesKIETHOrderPresenceRegistry.get();
    
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (state.pressure === 'buy_pressure') sentiment = 'bullish';
    if (state.pressure === 'sell_pressure') sentiment = 'bearish';

    const pressureStrength = waidesKIETHOrderPresenceRegistry.getPressureStrength();

    return {
      sentiment,
      strength: pressureStrength.strength,
      description: state.description,
      confidence: state.confidence,
      last_update: state.last_update
    };
  }

  /**
   * Validate trading action against order book
   */
  validateTradingAction(action: string, amount?: number): {
    validated: boolean;
    recommendation: string;
    risk_level: 'low' | 'medium' | 'high';
    suggested_amount_multiplier: number;
  } {
    const check = this.checkBeforeTrade(action);
    
    let risk_level: 'low' | 'medium' | 'high' = 'medium';
    let suggested_amount_multiplier = 1.0;

    if (check.confidence > 80 && check.should_proceed) {
      risk_level = 'low';
      suggested_amount_multiplier = 1.2; // Increase position size
    } else if (check.confidence < 50 || !check.should_proceed) {
      risk_level = 'high';
      suggested_amount_multiplier = 0.5; // Reduce position size
    }

    return {
      validated: check.should_proceed,
      recommendation: check.reasoning,
      risk_level,
      suggested_amount_multiplier
    };
  }

  /**
   * Get real-time order flow insights
   */
  getOrderFlowInsights(): {
    recent_trades_bias: string;
    liquidity_distribution: any;
    crowd_behavior_analysis: string;
    trading_opportunities: string[];
  } {
    const analytics = waidesKIOrderBookSentry.getOrderBookAnalytics();
    const state = waidesKIETHOrderPresenceRegistry.get();

    let recent_trades_bias = 'neutral';
    if (analytics.flow_bias > 0.2) recent_trades_bias = 'buying_dominant';
    if (analytics.flow_bias < -0.2) recent_trades_bias = 'selling_dominant';

    const trading_opportunities = [];
    if (state.confidence > 70) {
      if (state.pressure === 'buy_pressure') {
        trading_opportunities.push('Long entries favored by crowd accumulation');
      }
      if (state.pressure === 'sell_pressure') {
        trading_opportunities.push('Short entries favored by crowd distribution');
      }
    }
    if (state.pressure === 'balanced' && state.confidence > 60) {
      trading_opportunities.push('Range trading opportunities in balanced conditions');
    }

    return {
      recent_trades_bias,
      liquidity_distribution: {
        bid_ask_ratio: analytics.liquidity_ratio || 1,
        recent_bids: analytics.recent_bids || [],
        recent_asks: analytics.recent_asks || []
      },
      crowd_behavior_analysis: state.crowd_behavior,
      trading_opportunities
    };
  }

  /**
   * Export current state for peer synchronization (MODULE 6)
   */
  exportForPeerSync(): any {
    return waidesKIETHOrderPresenceRegistry.exportForSync();
  }

  /**
   * Import state from peer synchronization (MODULE 6)
   */
  importFromPeerSync(syncData: any): boolean {
    return waidesKIETHOrderPresenceRegistry.importFromSync(syncData);
  }

  /**
   * Get system status and statistics
   */
  getSystemStatus(): {
    service_initialized: boolean;
    components_status: any;
    recent_activity: any;
    performance_metrics: any;
  } {
    const sentryHealth = waidesKIOrderBookSentry.getConnectionHealth();
    const registryHealth = waidesKIETHOrderPresenceRegistry.getHealthStatus();
    const analytics = waidesKIOrderBookSentry.getOrderBookAnalytics();

    return {
      service_initialized: this.isInitialized,
      components_status: {
        order_book_sentry: sentryHealth,
        presence_registry: registryHealth,
        interpreter: 'operational'
      },
      recent_activity: {
        current_pressure: waidesKIETHOrderPresenceRegistry.get().pressure,
        trade_flow_summary: analytics.trade_flow_summary || {},
        last_pressure_change: registryHealth.last_update_ago
      },
      performance_metrics: {
        data_quality: sentryHealth.data_quality,
        connection_stability: sentryHealth.depth_connected && sentryHealth.trade_connected,
        update_frequency: registryHealth.data_freshness
      }
    };
  }

  /**
   * Shutdown the service
   */
  shutdown(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    waidesKIETHOrderPresenceRegistry.stop();
    waidesKIOrderBookSentry.disconnect();
    
    this.isInitialized = false;
    console.log('🛑 ETH Order Presence Service shutdown complete');
  }
}

export const waidesKIOrderPresenceService = new WaidesKIOrderPresenceService();