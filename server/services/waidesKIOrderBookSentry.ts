/**
 * MODULE 1 — Order Book Sentries
 * Tracks ETHUSDT orderbook depth & recent trade aggressor direction to sense buying or selling pressure
 */

import WebSocket from 'ws';

interface OrderBookData {
  bids: number[][];
  asks: number[][];
}

interface AggTradeData {
  m: boolean; // true = buyer is market maker (sell order), false = seller is market maker (buy order)
  q: string;  // quantity
  p: string;  // price
}

export class WaidesKIOrderBookSentry {
  private bids: number[] = [];
  private asks: number[] = [];
  private tradeFlow: string[] = [];
  private depthSize: number = 10;
  private tradeFlowSize: number = 50;
  private pressure: string = 'neutral';
  
  private depthWs: WebSocket | null = null;
  private tradeWs: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 5000;
  private isConnecting = false;

  constructor(depthSize: number = 10) {
    this.depthSize = depthSize;
    this.initializeConnections();
  }

  /**
   * Initialize WebSocket connections for depth and trade data
   */
  private async initializeConnections(): Promise<void> {
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      // Depth stream - 20 levels, 100ms updates
      const depthUri = 'wss://stream.binance.com:9443/ws/ethusdt@depth20@100ms';
      this.depthWs = new WebSocket(depthUri);

      this.depthWs.on('open', () => {
        console.log('📊 Order Book Sentry: Depth stream connected');
      });

      this.depthWs.on('message', (data: Buffer) => {
        try {
          const message: OrderBookData = JSON.parse(data.toString());
          this.processDepthUpdate(message);
        } catch (error) {
          console.error('Error processing depth data:', error);
        }
      });

      this.depthWs.on('error', (error) => {
        console.error('❌ Order Book Depth WebSocket error:', error);
        this.scheduleReconnect();
      });

      this.depthWs.on('close', () => {
        console.log('🔌 Order Book Depth WebSocket closed');
        this.scheduleReconnect();
      });

      // Trade stream - aggTrade for buy/sell pressure
      const tradeUri = 'wss://stream.binance.com:9443/ws/ethusdt@aggTrade';
      this.tradeWs = new WebSocket(tradeUri);

      this.tradeWs.on('open', () => {
        console.log('💹 Order Book Sentry: Trade stream connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      });

      this.tradeWs.on('message', (data: Buffer) => {
        try {
          const message: AggTradeData = JSON.parse(data.toString());
          this.processTradeUpdate(message);
        } catch (error) {
          console.error('Error processing trade data:', error);
        }
      });

      this.tradeWs.on('error', (error) => {
        console.error('❌ Order Book Trade WebSocket error:', error);
        this.scheduleReconnect();
      });

      this.tradeWs.on('close', () => {
        console.log('🔌 Order Book Trade WebSocket closed');
        this.scheduleReconnect();
      });

    } catch (error) {
      console.error('Failed to initialize order book connections:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Process depth update and calculate liquidity
   */
  private processDepthUpdate(data: OrderBookData): void {
    // Calculate total bid and ask liquidity for top levels
    const bidLiquidity = data.bids
      .slice(0, this.depthSize)
      .reduce((sum, [price, quantity]) => sum + parseFloat(quantity), 0);
      
    const askLiquidity = data.asks
      .slice(0, this.depthSize)
      .reduce((sum, [price, quantity]) => sum + parseFloat(quantity), 0);

    // Store recent liquidity data
    this.bids.push(bidLiquidity);
    this.asks.push(askLiquidity);

    // Keep only recent data
    if (this.bids.length > 20) this.bids.shift();
    if (this.asks.length > 20) this.asks.shift();

    this.updatePressure();
  }

  /**
   * Process trade update to determine aggressor direction
   */
  private processTradeUpdate(data: AggTradeData): void {
    // m = true means buyer is market maker (sell order filled)
    // m = false means seller is market maker (buy order filled) 
    const side = data.m ? 'sell' : 'buy';
    
    this.tradeFlow.push(side);
    
    // Keep only recent trades
    if (this.tradeFlow.length > this.tradeFlowSize) {
      this.tradeFlow.shift();
    }

    this.updatePressure();
  }

  /**
   * Calculate market pressure from depth and trade flow
   */
  private updatePressure(): void {
    if (this.bids.length === 0 || this.asks.length === 0 || this.tradeFlow.length === 0) {
      return;
    }

    const lastBid = this.bids[this.bids.length - 1];
    const lastAsk = this.asks[this.asks.length - 1];

    // Calculate liquidity imbalance
    const liquidityImbalance = (lastBid - lastAsk) / (lastBid + lastAsk + 1);

    // Calculate trade flow bias
    const buyCount = this.tradeFlow.filter(side => side === 'buy').length;
    const sellCount = this.tradeFlow.filter(side => side === 'sell').length;
    const flowBias = (buyCount - sellCount) / (this.tradeFlow.length + 1);

    // Combine liquidity and flow for pressure index
    const pressureIndex = liquidityImbalance + flowBias;

    // Determine pressure state
    if (pressureIndex > 0.2) {
      this.pressure = 'buy_pressure';
    } else if (pressureIndex < -0.2) {
      this.pressure = 'sell_pressure';
    } else {
      this.pressure = 'balanced';
    }

    console.log(`📊 Order Book Pressure: ${this.pressure} (index: ${pressureIndex.toFixed(3)})`);
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Order Book Sentry: Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`🔄 Attempting to reconnect Order Book Sentry (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      this.initializeConnections();
    }, delay);
  }

  /**
   * Get current market pressure
   */
  getPressure(): string {
    return this.pressure;
  }

  /**
   * Get detailed order book analytics
   */
  getOrderBookAnalytics(): {
    pressure: string;
    recent_bids: number[];
    recent_asks: number[];
    trade_flow_summary: any;
    liquidity_ratio: number;
    flow_bias: number;
  } {
    const buyCount = this.tradeFlow.filter(side => side === 'buy').length;
    const sellCount = this.tradeFlow.filter(side => side === 'sell').length;
    
    const lastBid = this.bids[this.bids.length - 1] || 0;
    const lastAsk = this.asks[this.asks.length - 1] || 0;
    
    return {
      pressure: this.pressure,
      recent_bids: this.bids.slice(-5),
      recent_asks: this.asks.slice(-5),
      trade_flow_summary: {
        total_trades: this.tradeFlow.length,
        buy_trades: buyCount,
        sell_trades: sellCount,
        recent_flow: this.tradeFlow.slice(-10)
      },
      liquidity_ratio: lastBid / (lastAsk + 1),
      flow_bias: (buyCount - sellCount) / (this.tradeFlow.length + 1)
    };
  }

  /**
   * Check connection health
   */
  getConnectionHealth(): {
    depth_connected: boolean;
    trade_connected: boolean;
    reconnect_attempts: number;
    data_quality: string;
  } {
    return {
      depth_connected: this.depthWs?.readyState === WebSocket.OPEN,
      trade_connected: this.tradeWs?.readyState === WebSocket.OPEN,
      reconnect_attempts: this.reconnectAttempts,
      data_quality: (this.bids.length > 5 && this.tradeFlow.length > 10) ? 'good' : 'limited'
    };
  }

  /**
   * Reset sentry data
   */
  reset(): void {
    this.bids = [];
    this.asks = [];
    this.tradeFlow = [];
    this.pressure = 'neutral';
    console.log('🔄 Order Book Sentry reset');
  }

  /**
   * Disconnect all WebSocket connections
   */
  disconnect(): void {
    if (this.depthWs) {
      this.depthWs.close();
      this.depthWs = null;
    }
    if (this.tradeWs) {
      this.tradeWs.close();
      this.tradeWs = null;
    }
    console.log('🔌 Order Book Sentry disconnected');
  }
}

export const waidesKIOrderBookSentry = new WaidesKIOrderBookSentry();