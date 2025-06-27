/**
 * MODULE 3 — Shared Order Presence Registry
 * Mirrors order book pressure across nodes for consensus
 */

import { waidesKIOrderBookSentry } from './waidesKIOrderBookSentry.js';
import { waidesKIOrderBookInterpreter } from './waidesKIOrderBookInterpreter.js';

interface OrderPresenceState {
  pressure: string;
  strength: number;
  description: string;
  crowd_behavior: string;
  trading_implication: string;
  confidence: number;
  last_update: Date;
  analytics: any;
  narrative: string;
}

export class WaidesKIETHOrderPresenceRegistry {
  private currentState: OrderPresenceState;
  private updateInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor() {
    this.currentState = {
      pressure: 'neutral',
      strength: 50,
      description: 'mute signal',
      crowd_behavior: 'Insufficient data to determine crowd behavior',
      trading_implication: 'Avoid trading until order flow becomes clear',
      confidence: 20,
      last_update: new Date(),
      analytics: {},
      narrative: 'Order book presence initializing...'
    };
    
    this.startAutoUpdate();
  }

  /**
   * Start automatic order presence updates (DISABLED to prevent constant reloading)
   */
  private startAutoUpdate(): void {
    if (this.isRunning) return;
    
    this.isRunning = false; // Keep disabled to prevent API spam
    console.log('🔄 ETH Order Presence auto-update disabled to prevent constant reloading');
    
    // DISABLED: Update every 100ms - causes constant reloading
    // this.updateInterval = setInterval(() => {
    //   this.updateFromSentry();
    // }, 100);
  }

  /**
   * Update presence state from order book sentry
   */
  private updateFromSentry(): void {
    try {
      const pressure = waidesKIOrderBookSentry.getPressure();
      const analytics = waidesKIOrderBookSentry.getOrderBookAnalytics();
      const enhanced = waidesKIOrderBookInterpreter.interpretEnhanced(pressure, analytics);
      const narrative = waidesKIOrderBookInterpreter.generateOrderBookNarrative(pressure, analytics);

      this.currentState = {
        pressure,
        strength: enhanced.confidence || 50,
        description: enhanced.basic_description,
        crowd_behavior: enhanced.crowd_behavior,
        trading_implication: enhanced.trading_implication,
        confidence: enhanced.confidence,
        last_update: new Date(),
        analytics,
        narrative
      };

      // Log significant changes with high confidence
      if (enhanced.confidence > 70 && this.shouldLogChange()) {
        console.log(`📊 Order Presence Update: ${pressure} - ${enhanced.basic_description} (${enhanced.confidence}% confidence)`);
      }

    } catch (error) {
      console.error('❌ Error updating order presence:', error);
    }
  }

  /**
   * Check if we should log this change (avoid spam)
   */
  private shouldLogChange(): boolean {
    // Log if it's been more than 5 seconds since last update
    const timeSinceUpdate = Date.now() - this.currentState.last_update.getTime();
    return timeSinceUpdate > 5000;
  }

  /**
   * Get current order presence state
   */
  get(): OrderPresenceState {
    return { ...this.currentState };
  }

  /**
   * Update presence state manually (for external sync)
   */
  update(pressure: string, description: string, additionalData?: any): void {
    const analytics = additionalData?.analytics || this.currentState.analytics;
    const enhanced = waidesKIOrderBookInterpreter.interpretEnhanced(pressure, analytics);
    
    this.currentState = {
      pressure,
      strength: enhanced.confidence || 50,
      description,
      crowd_behavior: enhanced.crowd_behavior,
      trading_implication: enhanced.trading_implication,
      confidence: enhanced.confidence,
      last_update: new Date(),
      analytics,
      narrative: waidesKIOrderBookInterpreter.generateOrderBookNarrative(pressure, analytics)
    };

    console.log(`📡 Order Presence manually updated: ${pressure} - ${description}`);
  }

  /**
   * Check if current order book supports a trading action
   */
  checkTradeAlignment(intendedAction: string): {
    aligned: boolean;
    confidence: number;
    recommendation: string;
    should_proceed: boolean;
  } {
    const alignment = waidesKIOrderBookInterpreter.checkOrderBookAlignment(
      intendedAction, 
      this.currentState.pressure
    );

    const should_proceed = alignment.aligned && this.currentState.confidence > 50;

    return {
      ...alignment,
      should_proceed
    };
  }

  /**
   * Get comprehensive trading decision support
   */
  getTradingDecisionSupport(): {
    current_state: OrderPresenceState;
    trading_advice: any;
    crowd_sentiment: string;
    risk_assessment: string;
  } {
    const trading_advice = waidesKIOrderBookInterpreter.getTradingAdvice(
      this.currentState.pressure, 
      this.currentState.analytics
    );

    let crowd_sentiment = 'neutral';
    if (this.currentState.pressure === 'buy_pressure') crowd_sentiment = 'bullish';
    if (this.currentState.pressure === 'sell_pressure') crowd_sentiment = 'bearish';

    let risk_assessment = 'moderate';
    if (this.currentState.confidence > 80) risk_assessment = 'low';
    if (this.currentState.confidence < 40) risk_assessment = 'high';

    return {
      current_state: this.get(),
      trading_advice,
      crowd_sentiment,
      risk_assessment
    };
  }

  /**
   * Get order book pressure strength
   */
  getPressureStrength(): {
    pressure_type: string;
    strength: number;
    direction: string;
    quality: string;
  } {
    const analytics = this.currentState.analytics;
    
    let strength = 0;
    if (analytics.flow_bias) {
      strength = Math.abs(analytics.flow_bias) * 100;
    }
    
    let direction = 'neutral';
    if (this.currentState.pressure === 'buy_pressure') direction = 'bullish';
    if (this.currentState.pressure === 'sell_pressure') direction = 'bearish';

    let quality = 'poor';
    if (this.currentState.confidence > 60) quality = 'good';
    if (this.currentState.confidence > 80) quality = 'excellent';

    return {
      pressure_type: this.currentState.pressure,
      strength: Math.round(strength),
      direction,
      quality
    };
  }

  /**
   * Get connection and data health status
   */
  getHealthStatus(): {
    auto_update_running: boolean;
    data_freshness: string;
    connection_quality: string;
    last_update_ago: number;
  } {
    const now = Date.now();
    const lastUpdateMs = now - this.currentState.last_update.getTime();
    
    let data_freshness = 'stale';
    if (lastUpdateMs < 1000) data_freshness = 'fresh';
    else if (lastUpdateMs < 5000) data_freshness = 'recent';

    const connectionHealth = waidesKIOrderBookSentry.getConnectionHealth();
    let connection_quality = 'poor';
    if (connectionHealth.depth_connected && connectionHealth.trade_connected) {
      connection_quality = connectionHealth.data_quality === 'good' ? 'excellent' : 'good';
    }

    return {
      auto_update_running: this.isRunning,
      data_freshness,
      connection_quality,
      last_update_ago: lastUpdateMs
    };
  }

  /**
   * Export state for peer synchronization
   */
  exportForSync(): {
    pressure: string;
    description: string;
    confidence: number;
    timestamp: number;
    node_id: string;
  } {
    return {
      pressure: this.currentState.pressure,
      description: this.currentState.description,
      confidence: this.currentState.confidence,
      timestamp: this.currentState.last_update.getTime(),
      node_id: 'waides-ki-main'
    };
  }

  /**
   * Import state from peer synchronization
   */
  importFromSync(syncData: any): boolean {
    try {
      // Only accept newer data
      const syncTimestamp = syncData.timestamp;
      const currentTimestamp = this.currentState.last_update.getTime();
      
      if (syncTimestamp > currentTimestamp) {
        this.update(syncData.pressure, syncData.description, {
          confidence: syncData.confidence,
          source: 'peer_sync',
          peer_node: syncData.node_id
        });
        
        console.log(`📡 Imported order presence from peer: ${syncData.node_id}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error importing sync data:', error);
      return false;
    }
  }

  /**
   * Stop auto-update loop
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 ETH Order Presence auto-update stopped');
  }

  /**
   * Restart auto-update loop
   */
  restart(): void {
    this.stop();
    this.startAutoUpdate();
  }
}

export const waidesKIETHOrderPresenceRegistry = new WaidesKIETHOrderPresenceRegistry();