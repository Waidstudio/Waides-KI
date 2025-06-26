/**
 * ETH Presence Engine: Real-Time Sentient Vision System
 * Maintains live connection to interpret ETH's "mood" like body language
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

interface ETHPresenceState {
  state: 'rising' | 'falling' | 'sideways' | 'unknown';
  description: string;
  confidence: number;
  lastUpdate: Date;
  priceData: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  };
}

export class WaidesKIETHPresenceListener {
  private ws: WebSocket | null = null;
  private prices: number[] = [];
  private readonly windowSize = 5;
  private currentState: ETHPresenceState;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 5000;
  private isConnecting = false;

  constructor() {
    this.currentState = {
      state: 'unknown',
      description: 'unknown mood',
      confidence: 0,
      lastUpdate: new Date(),
      priceData: {
        current: 0,
        previous: 0,
        change: 0,
        changePercent: 0
      }
    };
    this.initializeConnection();
  }

  /**
   * Initialize WebSocket connection to Binance stream
   */
  private async initializeConnection(): Promise<void> {
    if (this.isConnecting) return;
    
    try {
      this.isConnecting = true;
      console.log('🧬 Initializing ETH Presence Listener...');
      
      this.ws = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@kline_1m');
      
      this.ws.on('open', () => {
        console.log('🌐 ETH Presence WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const message: KlineData = JSON.parse(data.toString());
          if (message.k && message.k.x) { // closed candle
            this.processNewPrice(parseFloat(message.k.c));
          }
        } catch (error) {
          console.error('❌ Error processing ETH presence message:', error);
        }
      });

      this.ws.on('close', () => {
        console.log('🔌 ETH Presence WebSocket closed');
        this.isConnecting = false;
        this.scheduleReconnect();
      });

      this.ws.on('error', (error) => {
        console.error('❌ ETH Presence WebSocket error:', error);
        this.isConnecting = false;
        this.scheduleReconnect();
      });

    } catch (error) {
      console.error('❌ Failed to initialize ETH Presence connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Process new price data and update presence state
   */
  private processNewPrice(price: number): void {
    const previousPrice = this.prices.length > 0 ? this.prices[this.prices.length - 1] : price;
    
    this.prices.push(price);
    if (this.prices.length > this.windowSize) {
      this.prices.shift();
    }

    this.updatePresenceState(price, previousPrice);
    
    console.log(`💫 ETH Presence Update: ${this.currentState.state} - ${this.currentState.description} (${price})`);
  }

  /**
   * Update presence state based on price movement
   */
  private updatePresenceState(currentPrice: number, previousPrice: number): void {
    if (this.prices.length < 2) return;

    const startPrice = this.prices[0];
    const endPrice = currentPrice;
    const change = endPrice - startPrice;
    const changePercent = (change / startPrice) * 100;
    
    let state: 'rising' | 'falling' | 'sideways' = 'sideways';
    let description = 'sitting down in a room';
    let confidence = 0;

    // Determine trend based on percentage change
    if (changePercent > 0.2) {
      state = 'rising';
      description = 'dressing up to go out';
      confidence = Math.min(Math.abs(changePercent) * 10, 100);
    } else if (changePercent < -0.2) {
      state = 'falling';
      description = 'getting ready to sleep';
      confidence = Math.min(Math.abs(changePercent) * 10, 100);
    } else {
      // Check for more subtle movements
      const volatility = this.calculateVolatility();
      if (volatility > 0.1) {
        if (changePercent > 0) {
          state = 'rising';
          description = 'stretching and looking around';
        } else {
          state = 'falling';
          description = 'settling down quietly';
        }
        confidence = volatility * 50;
      } else {
        confidence = 100 - Math.abs(changePercent) * 20;
      }
    }

    this.currentState = {
      state,
      description,
      confidence: Math.round(confidence),
      lastUpdate: new Date(),
      priceData: {
        current: currentPrice,
        previous: previousPrice,
        change: currentPrice - previousPrice,
        changePercent: ((currentPrice - previousPrice) / previousPrice) * 100
      }
    };
  }

  /**
   * Calculate price volatility
   */
  private calculateVolatility(): number {
    if (this.prices.length < 3) return 0;
    
    const changes = [];
    for (let i = 1; i < this.prices.length; i++) {
      const change = Math.abs((this.prices[i] - this.prices[i-1]) / this.prices[i-1]);
      changes.push(change);
    }
    
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    return avgChange;
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached for ETH Presence');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`🔄 Attempting to reconnect ETH Presence (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      this.initializeConnection();
    }, delay);
  }

  /**
   * Get current ETH presence state
   */
  getPresenceState(): ETHPresenceState {
    return { ...this.currentState };
  }

  /**
   * Check if presence indicates favorable trading conditions
   */
  isTradingFavorable(): boolean {
    return this.currentState.state !== 'unknown' && this.currentState.confidence > 30;
  }

  /**
   * Get trading recommendation based on presence
   */
  getTradingRecommendation(): {
    action: 'BUY_ETH3L' | 'BUY_ETH3S' | 'HOLD' | 'WAIT';
    reason: string;
    confidence: number;
  } {
    const { state, confidence, description } = this.currentState;
    
    if (state === 'unknown' || confidence < 20) {
      return {
        action: 'WAIT',
        reason: 'ETH presence unclear, waiting for clearer signals',
        confidence: 0
      };
    }

    if (state === 'sideways') {
      return {
        action: 'HOLD',
        reason: `ETH is ${description} - no directional momentum`,
        confidence: confidence
      };
    }

    if (state === 'rising') {
      return {
        action: 'BUY_ETH3L',
        reason: `ETH is ${description} - bullish momentum detected`,
        confidence: confidence
      };
    }

    if (state === 'falling') {
      return {
        action: 'BUY_ETH3S',
        reason: `ETH is ${description} - bearish momentum detected`,
        confidence: confidence
      };
    }

    return {
      action: 'WAIT',
      reason: 'Unable to determine clear direction',
      confidence: 0
    };
  }

  /**
   * Get detailed presence analytics
   */
  getPresenceAnalytics(): {
    current_state: ETHPresenceState;
    price_window: number[];
    volatility: number;
    trend_strength: number;
    market_mood: string;
    connection_status: boolean;
  } {
    const volatility = this.calculateVolatility();
    const trendStrength = Math.abs(this.currentState.priceData.changePercent);
    
    let marketMood = 'neutral';
    if (this.currentState.confidence > 70) {
      marketMood = this.currentState.state === 'rising' ? 'bullish' : 
                   this.currentState.state === 'falling' ? 'bearish' : 'consolidating';
    } else if (this.currentState.confidence > 40) {
      marketMood = 'cautious';
    }

    return {
      current_state: this.currentState,
      price_window: [...this.prices],
      volatility: volatility,
      trend_strength: trendStrength,
      market_mood: marketMood,
      connection_status: this.ws?.readyState === WebSocket.OPEN
    };
  }

  /**
   * Reset presence state
   */
  resetPresence(): void {
    this.prices = [];
    this.currentState = {
      state: 'unknown',
      description: 'unknown mood',
      confidence: 0,
      lastUpdate: new Date(),
      priceData: {
        current: 0,
        previous: 0,
        change: 0,
        changePercent: 0
      }
    };
    console.log('🔄 ETH Presence state reset');
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    console.log('🔌 ETH Presence Listener disconnected');
  }

  /**
   * Check connection health
   */
  getConnectionHealth(): {
    connected: boolean;
    reconnect_attempts: number;
    last_update: Date;
    data_points: number;
  } {
    return {
      connected: this.ws?.readyState === WebSocket.OPEN,
      reconnect_attempts: this.reconnectAttempts,
      last_update: this.currentState.lastUpdate,
      data_points: this.prices.length
    };
  }
}

export const waidesKIETHPresenceListener = new WaidesKIETHPresenceListener();