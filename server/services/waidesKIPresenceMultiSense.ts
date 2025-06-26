/**
 * ETH Presence Engine Enhanced: Multi-Sense Integration
 * Not just sensing ETH's mood — interpreting its language, emotions, and long-term intent
 */

import WebSocket from 'ws';

interface KlineData {
  k: {
    x: boolean; // closed candle
    c: string;  // close price
    o: string;  // open price
    h: string;  // high price
    l: string;  // low price
    v: string;  // volume
    t: number;  // start time
    T: number;  // close time
  };
}

interface PresenceState {
  price_trend: 'rising' | 'falling' | 'sideways' | 'unknown';
  volatility: number;
  volume_trend: 'increasing' | 'decreasing' | 'stable' | 'unknown';
  sentiment: number;
  emotional_intensity: number;
  trend_strength: number;
}

export class WaidesKIPresenceMultiSense {
  private prices: number[] = [];
  private volumes: number[] = [];
  private sentimentScores: number[] = [];
  private windowSize: number = 5;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 5000;
  private isConnecting = false;

  private state: PresenceState = {
    price_trend: 'unknown',
    volatility: 0.0,
    volume_trend: 'unknown',
    sentiment: 0.0,
    emotional_intensity: 0.0,
    trend_strength: 0.0
  };

  constructor(windowSize: number = 5) {
    this.windowSize = windowSize;
    this.initializeConnection();
  }

  /**
   * Initialize WebSocket connection to Binance stream
   */
  private async initializeConnection(): Promise<void> {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;

    try {
      const wsUrl = 'wss://stream.binance.com:9443/ws/ethusdt@kline_1m';
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        console.log('🧬 ETH Multi-Sense Presence connected to Binance');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const message: KlineData = JSON.parse(data.toString());
          if (message.k?.x) { // Only process closed candles
            this.onCandle(message.k);
          }
        } catch (error) {
          console.error('Error parsing multi-sense presence data:', error);
        }
      });

      this.ws.on('error', (error) => {
        console.error('❌ ETH Multi-Sense Presence WebSocket error:', error);
        this.scheduleReconnect();
      });

      this.ws.on('close', (code, reason) => {
        console.log('🔌 ETH Multi-Sense Presence WebSocket closed:', code, reason.toString());
        this.ws = null;
        this.isConnecting = false;
        this.scheduleReconnect();
      });

    } catch (error) {
      console.error('Failed to initialize multi-sense presence connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Process new candle data and update multi-sense state
   */
  private onCandle(candle: any): void {
    const close = parseFloat(candle.c);
    const volume = parseFloat(candle.v);
    
    this.prices.push(close);
    this.volumes.push(volume);
    
    // Keep only window size data points
    if (this.prices.length > this.windowSize) {
      this.prices.shift();
    }
    if (this.volumes.length > this.windowSize) {
      this.volumes.shift();
    }
    
    this.updateState();
    console.log(`🧬 Multi-Sense Update: ${this.getHumanDescription()} | Volatility: ${this.state.volatility}`);
  }

  /**
   * Update presence state based on multi-sensory analysis
   */
  private updateState(): void {
    if (this.prices.length < 2 || this.volumes.length < 2) {
      return;
    }

    // Price trend analysis
    const priceStart = this.prices[0];
    const priceEnd = this.prices[this.prices.length - 1];
    const priceDiff = priceEnd - priceStart;
    const pricePct = priceDiff / priceStart;
    
    if (pricePct > 0.002) {
      this.state.price_trend = 'rising';
    } else if (pricePct < -0.002) {
      this.state.price_trend = 'falling';
    } else {
      this.state.price_trend = 'sideways';
    }

    // Volatility calculation
    const maxPrice = Math.max(...this.prices);
    const minPrice = Math.min(...this.prices);
    this.state.volatility = Math.round((maxPrice - minPrice) * 10000) / 10000;

    // Volume trend analysis
    const volumeStart = this.volumes[0];
    const volumeEnd = this.volumes[this.volumes.length - 1];
    const volumeDiff = volumeEnd - volumeStart;
    const volumePct = volumeDiff / (volumeStart || 1);
    
    if (volumePct > 0.3) {
      this.state.volume_trend = 'increasing';
    } else if (volumePct < -0.3) {
      this.state.volume_trend = 'decreasing';
    } else {
      this.state.volume_trend = 'stable';
    }

    // Sentiment scoring (price movement + volume correlation)
    this.state.sentiment = Math.round(pricePct * volumePct * 10000) / 10000;

    // Emotional intensity (based on volatility and volume)
    this.state.emotional_intensity = Math.min(this.state.volatility * Math.abs(volumePct) * 100, 100);

    // Trend strength (consistency of direction)
    this.state.trend_strength = this.calculateTrendStrength();
  }

  /**
   * Calculate trend strength based on price consistency
   */
  private calculateTrendStrength(): number {
    if (this.prices.length < 3) return 0;
    
    let consistentMoves = 0;
    const totalMoves = this.prices.length - 1;
    
    for (let i = 1; i < this.prices.length; i++) {
      const prevMove = i > 1 ? this.prices[i-1] - this.prices[i-2] : 0;
      const currentMove = this.prices[i] - this.prices[i-1];
      
      if ((prevMove > 0 && currentMove > 0) || (prevMove < 0 && currentMove < 0)) {
        consistentMoves++;
      }
    }
    
    return Math.round((consistentMoves / totalMoves) * 100);
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ ETH Multi-Sense Presence: Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`🔄 Attempting to reconnect ETH Multi-Sense Presence (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      this.initializeConnection();
    }, delay);
  }

  /**
   * Get current multi-sense presence state
   */
  getPresenceState(): PresenceState {
    return { ...this.state };
  }

  /**
   * Get human-readable description of ETH's current emotional state
   */
  getHumanDescription(): string {
    const { price_trend, volume_trend, emotional_intensity } = this.state;
    
    if (price_trend === 'rising' && volume_trend === 'increasing') {
      return emotional_intensity > 50 ? 'preparing for a big night out' : 'getting excited about something';
    }
    
    if (price_trend === 'falling' && volume_trend === 'increasing') {
      return emotional_intensity > 50 ? 'readying for a long sleep' : 'feeling a bit tired';
    }
    
    if (price_trend === 'sideways' && volume_trend === 'stable') {
      return emotional_intensity < 20 ? 'lounging in a calm room' : 'quietly contemplating';
    }
    
    if (price_trend === 'rising' && volume_trend === 'decreasing') {
      return 'cautiously optimistic but hesitant';
    }
    
    if (price_trend === 'falling' && volume_trend === 'decreasing') {
      return 'quietly withdrawing from attention';
    }
    
    return 'pondering quietly';
  }

  /**
   * Check if ETH presence indicates favorable trading conditions
   */
  isTradingFavorable(): boolean {
    const { price_trend, volume_trend, emotional_intensity, trend_strength } = this.state;
    
    // Require clear trend with volume confirmation
    if (price_trend === 'sideways' || volume_trend === 'unknown') {
      return false;
    }
    
    // Require moderate emotional intensity (not too calm, not too chaotic)
    if (emotional_intensity < 10 || emotional_intensity > 80) {
      return false;
    }
    
    // Require reasonable trend strength
    if (trend_strength < 30) {
      return false;
    }
    
    return true;
  }

  /**
   * Get trading recommendation based on multi-sense presence
   */
  getTradingRecommendation(): {
    action: string;
    confidence: number;
    reasoning: string;
    emotional_context: string;
  } {
    const { price_trend, volume_trend, sentiment, emotional_intensity, trend_strength } = this.state;
    const description = this.getHumanDescription();
    
    if (!this.isTradingFavorable()) {
      return {
        action: 'WAIT',
        confidence: 0,
        reasoning: 'ETH presence indicates unfavorable conditions',
        emotional_context: description
      };
    }
    
    let action = 'HOLD';
    let confidence = 0;
    let reasoning = '';
    
    if (price_trend === 'rising' && volume_trend === 'increasing') {
      action = 'BUY';
      confidence = Math.min(trend_strength + emotional_intensity, 95);
      reasoning = 'Strong bullish presence with volume confirmation';
    } else if (price_trend === 'falling' && volume_trend === 'increasing') {
      action = 'SELL';
      confidence = Math.min(trend_strength + emotional_intensity, 95);
      reasoning = 'Strong bearish presence with volume confirmation';
    } else {
      confidence = 25;
      reasoning = 'Mixed signals from ETH presence';
    }
    
    return {
      action,
      confidence,
      reasoning,
      emotional_context: description
    };
  }

  /**
   * Get comprehensive multi-sense analytics
   */
  getMultiSenseAnalytics(): {
    current_state: PresenceState;
    human_description: string;
    trading_favorable: boolean;
    recommendation: any;
    connection_health: any;
    data_points: number;
  } {
    return {
      current_state: this.getPresenceState(),
      human_description: this.getHumanDescription(),
      trading_favorable: this.isTradingFavorable(),
      recommendation: this.getTradingRecommendation(),
      connection_health: this.getConnectionHealth(),
      data_points: this.prices.length
    };
  }

  /**
   * Reset multi-sense presence state
   */
  resetPresence(): void {
    this.prices = [];
    this.volumes = [];
    this.sentimentScores = [];
    this.state = {
      price_trend: 'unknown',
      volatility: 0.0,
      volume_trend: 'unknown',
      sentiment: 0.0,
      emotional_intensity: 0.0,
      trend_strength: 0.0
    };
    console.log('🔄 ETH Multi-Sense Presence reset');
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    console.log('🔌 ETH Multi-Sense Presence disconnected');
  }

  /**
   * Check connection health
   */
  getConnectionHealth(): {
    connected: boolean;
    reconnect_attempts: number;
    last_update: Date;
    data_quality: string;
  } {
    return {
      connected: this.ws?.readyState === WebSocket.OPEN,
      reconnect_attempts: this.reconnectAttempts,
      last_update: new Date(),
      data_quality: this.prices.length >= this.windowSize ? 'good' : 'limited'
    };
  }
}

export const waidesKIPresenceMultiSense = new WaidesKIPresenceMultiSense();