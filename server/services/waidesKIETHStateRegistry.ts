/**
 * ETH State Registry: Central hub for ETH presence state management
 * Stores and shares ETH's current presence across all trading systems
 */

import { waidesKIETHPresenceListener } from './waidesKIETHPresenceListener';
import { waidesKIPresenceInterpreter } from './waidesKIPresenceInterpreter';
import { waidesKIPresenceMultiSense } from './waidesKIPresenceMultiSense';
import { waidesKIPresenceSynthesizer } from './waidesKIPresenceSynthesizer';

interface ETHRegistryState {
  state: 'rising' | 'falling' | 'sideways' | 'unknown';
  description: string;
  enhanced_presence: any;
  narrative: string;
  trading_advice: any;
  confidence: number;
  last_update: Date;
  connection_health: any;
  analytics: any;
}

export class WaidesKIETHStateRegistry {
  private currentState: ETHRegistryState;
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_FREQUENCY = 5000; // 5 seconds

  constructor() {
    this.currentState = {
      state: 'unknown',
      description: 'unknown mood',
      enhanced_presence: null,
      narrative: '',
      trading_advice: null,
      confidence: 0,
      last_update: new Date(),
      connection_health: null,
      analytics: null
    };
    
    this.startPresenceUpdater();
  }

  /**
   * Start the presence updater loop
   */
  private startPresenceUpdater(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updatePresenceState();
    }, this.UPDATE_FREQUENCY);

    console.log('🧬 ETH State Registry: Presence updater started');
    
    // Initial update
    this.updatePresenceState();
  }

  /**
   * Update presence state from multi-sense integration
   */
  private updatePresenceState(): void {
    try {
      // Get multi-sense presence data
      const multiSenseState = waidesKIPresenceMultiSense.getPresenceState();
      const multiSenseAnalytics = waidesKIPresenceMultiSense.getMultiSenseAnalytics();
      
      // Synthesize into human metaphors
      const synthesizedPresence = waidesKIPresenceSynthesizer.translate(multiSenseState);
      const comprehensiveAnalysis = waidesKIPresenceSynthesizer.getComprehensiveAnalysis(multiSenseState);
      
      // Get fallback from listener
      const presenceState = waidesKIETHPresenceListener.getPresenceState();
      const analytics = waidesKIETHPresenceListener.getPresenceAnalytics();
      const connectionHealth = waidesKIETHPresenceListener.getConnectionHealth();
      
      // Determine final state using multi-sense priority
      let finalState = multiSenseState.price_trend;
      let finalConfidence = synthesizedPresence.confidence;
      let finalDescription = synthesizedPresence.description;
      let enhancedPresence = comprehensiveAnalysis.metaphor;
      
      // Use listener as fallback if multi-sense data is insufficient
      if (multiSenseAnalytics.data_points < 3 && presenceState) {
        finalState = presenceState.state;
        finalConfidence = Math.max(presenceState.confidence, synthesizedPresence.confidence);
        
        // Generate traditional interpretation for blending
        const report = waidesKIPresenceInterpreter.generatePresenceReport(
          presenceState.state,
          presenceState.confidence,
          analytics?.volatility || multiSenseState.volatility,
          presenceState.priceData?.changePercent || Math.abs(multiSenseState.sentiment),
          presenceState.priceData
        );
        
        finalDescription = `${synthesizedPresence.description} (${report.enhanced_presence.description})`;
        enhancedPresence = {
          ...synthesizedPresence,
          traditional_presence: report.enhanced_presence,
          blend_reason: 'Multi-sense data limited, using listener fallback'
        };
      }

      this.currentState = {
        state: finalState,
        description: finalDescription,
        enhanced_presence: {
          ...enhancedPresence,
          multi_sense_state: multiSenseState,
          emotional_context: comprehensiveAnalysis.emotional_context,
          risk_assessment: comprehensiveAnalysis.risk_assessment,
          timeframe_recommendation: waidesKIPresenceSynthesizer.getTimeframeRecommendation(multiSenseState)
        },
        narrative: comprehensiveAnalysis.emotional_context,
        trading_advice: comprehensiveAnalysis.trading_advice,
        confidence: finalConfidence,
        last_update: new Date(),
        connection_health: waidesKIPresenceMultiSense.getConnectionHealth(),
        analytics: {
          multi_sense: multiSenseAnalytics,
          traditional: analytics,
          listener_state: presenceState,
          timeframe_rec: waidesKIPresenceSynthesizer.getTimeframeRecommendation(multiSenseState)
        }
      };

      // Log significant state changes with multi-sense context
      if (finalConfidence > 60) {
        console.log(`🧬 ETH Multi-Sense Update: ${finalState} - ${finalDescription} (${finalConfidence}% confidence)`);
      }

    } catch (error) {
      console.error('❌ Error updating multi-sense presence state:', error);
    }
  }

  /**
   * Get current ETH presence state
   */
  getPresenceState(): ETHRegistryState {
    return { ...this.currentState };
  }

  /**
   * Get simplified presence for trading decisions
   */
  getSimplePresence(): {
    state: string;
    description: string;
    confidence: number;
    is_trading_favorable: boolean;
  } {
    return {
      state: this.currentState.state,
      description: this.currentState.description,
      confidence: this.currentState.confidence,
      is_trading_favorable: this.currentState.confidence > 30 && this.currentState.state !== 'unknown'
    };
  }

  /**
   * Get trading recommendation from presence
   */
  getTradingRecommendation(): {
    action: 'BUY_ETH3L' | 'BUY_ETH3S' | 'HOLD' | 'WAIT';
    reason: string;
    confidence: number;
    risk_level?: string;
    time_horizon?: string;
  } {
    const recommendation = waidesKIETHPresenceListener.getTradingRecommendation();
    
    if (this.currentState.trading_advice) {
      return {
        action: recommendation.action,
        reason: recommendation.reason,
        confidence: recommendation.confidence,
        risk_level: this.currentState.trading_advice.risk_level,
        time_horizon: this.currentState.trading_advice.time_horizon
      };
    }

    return recommendation;
  }

  /**
   * Check if ETH presence aligns with intended trade direction
   */
  checkPresenceAlignment(intendedAction: string): {
    aligned: boolean;
    alignment_score: number;
    presence_suggestion: string;
    should_proceed: boolean;
  } {
    const { state, confidence } = this.currentState;
    let aligned = false;
    let alignmentScore = 0;
    let presenceSuggestion = '';
    let shouldProceed = false;

    // Check alignment based on intended action
    if (intendedAction.includes('ETH3L') || intendedAction.includes('BUY_ETH')) {
      // Bullish action
      if (state === 'rising') {
        aligned = true;
        alignmentScore = confidence;
        presenceSuggestion = `ETH is ${this.currentState.description} - favorable for bullish trades`;
        shouldProceed = confidence > 40;
      } else if (state === 'sideways') {
        aligned = false;
        alignmentScore = confidence * 0.5;
        presenceSuggestion = `ETH is ${this.currentState.description} - neutral, consider waiting for clearer direction`;
        shouldProceed = false;
      } else {
        aligned = false;
        alignmentScore = 0;
        presenceSuggestion = `ETH is ${this.currentState.description} - not favorable for bullish trades`;
        shouldProceed = false;
      }
    } else if (intendedAction.includes('ETH3S') || intendedAction.includes('SELL_ETH')) {
      // Bearish action
      if (state === 'falling') {
        aligned = true;
        alignmentScore = confidence;
        presenceSuggestion = `ETH is ${this.currentState.description} - favorable for bearish trades`;
        shouldProceed = confidence > 40;
      } else if (state === 'sideways') {
        aligned = false;
        alignmentScore = confidence * 0.5;
        presenceSuggestion = `ETH is ${this.currentState.description} - neutral, consider waiting for clearer direction`;
        shouldProceed = false;
      } else {
        aligned = false;
        alignmentScore = 0;
        presenceSuggestion = `ETH is ${this.currentState.description} - not favorable for bearish trades`;
        shouldProceed = false;
      }
    } else if (intendedAction.includes('HOLD')) {
      // Hold action
      aligned = true;
      alignmentScore = state === 'sideways' ? confidence : confidence * 0.7;
      presenceSuggestion = `ETH is ${this.currentState.description} - holding is appropriate`;
      shouldProceed = true;
    } else {
      // Unknown action
      alignmentScore = 0;
      presenceSuggestion = `Unknown action - unable to assess presence alignment`;
      shouldProceed = false;
    }

    return {
      aligned,
      alignment_score: Math.round(alignmentScore),
      presence_suggestion: presenceSuggestion,
      should_proceed: shouldProceed
    };
  }

  /**
   * Get comprehensive presence report
   */
  getPresenceReport(): {
    current_state: ETHRegistryState;
    connection_status: string;
    data_freshness: string;
    trading_readiness: string;
  } {
    const { connection_health } = this.currentState;
    const timeSinceUpdate = Date.now() - this.currentState.last_update.getTime();
    
    let connectionStatus = 'unknown';
    if (connection_health) {
      connectionStatus = connection_health.connected ? 'connected' : 'disconnected';
    }

    let dataFreshness = 'stale';
    if (timeSinceUpdate < 10000) {
      dataFreshness = 'fresh';
    } else if (timeSinceUpdate < 30000) {
      dataFreshness = 'recent';
    }

    let tradingReadiness = 'not_ready';
    if (this.currentState.confidence > 60 && connectionStatus === 'connected' && dataFreshness === 'fresh') {
      tradingReadiness = 'ready';
    } else if (this.currentState.confidence > 30) {
      tradingReadiness = 'cautious';
    }

    return {
      current_state: this.currentState,
      connection_status: connectionStatus,
      data_freshness: dataFreshness,
      trading_readiness: tradingReadiness
    };
  }

  /**
   * Reset presence state (for testing/maintenance)
   */
  resetPresence(): void {
    waidesKIETHPresenceListener.resetPresence();
    this.currentState = {
      state: 'unknown',
      description: 'unknown mood',
      enhanced_presence: null,
      narrative: '',
      trading_advice: null,
      confidence: 0,
      last_update: new Date(),
      connection_health: null,
      analytics: null
    };
    console.log('🔄 ETH State Registry: Presence state reset');
  }

  /**
   * Stop presence updater
   */
  stopUpdater(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    console.log('⏹️ ETH State Registry: Presence updater stopped');
  }

  /**
   * Restart presence updater
   */
  restartUpdater(): void {
    this.stopUpdater();
    this.startPresenceUpdater();
    console.log('🔄 ETH State Registry: Presence updater restarted');
  }

  /**
   * Get presence statistics
   */
  getPresenceStatistics(): {
    uptime: number;
    update_frequency: number;
    average_confidence: number;
    state_distribution: Record<string, number>;
    connection_uptime: number;
  } {
    // This would typically track statistics over time
    // For now, return current state information
    return {
      uptime: Date.now() - this.currentState.last_update.getTime(),
      update_frequency: this.UPDATE_FREQUENCY,
      average_confidence: this.currentState.confidence,
      state_distribution: {
        [this.currentState.state]: 1
      },
      connection_uptime: this.currentState.connection_health?.connected ? 100 : 0
    };
  }
}

export const waidesKIETHStateRegistry = new WaidesKIETHStateRegistry();