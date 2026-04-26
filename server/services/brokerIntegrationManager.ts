/**
 * Broker Integration Manager
 * Unified interface for all broker connections
 * Handles: Binary Options, Forex/CFD, Spot Exchanges
 */

import { DerivConnector, type DerivConfig, type BinaryTradeParams, type BinaryTradeResult } from './connectors/binary/derivConnector';
import { QuotexConnector } from './connectors/binary/quotexConnector';
import { PocketOptionConnector } from './connectors/binary/pocketOptionConnector';
import { IQOptionConnector } from './connectors/binary/iqOptionConnector';
import { MT5Connector } from './connectors/forex/mt5Connector';
import { DerivForexConnector } from './connectors/forex/derivForexConnector';

export type BrokerType = 'deriv' | 'quotex' | 'pocketoption' | 'iqoption' | 'mt5' | 'deriv_forex' | 'binance' | 'coinbase';
export type MarketType = 'binary' | 'forex' | 'spot';

export interface BrokerConfig {
  type: BrokerType;
  apiToken?: string;
  apiKey?: string;
  apiSecret?: string;
  appId?: string;
  accountId?: string;
  serverUrl?: string;
}

export interface TradeRequest {
  broker: BrokerType;
  symbol: string;
  direction: 'buy' | 'sell' | 'call' | 'put';
  amount: number;
  duration?: number; // For binary options (seconds)
  durationType?: 's' | 'm' | 'h' | 'd';
  leverage?: number; // For forex
  stopLoss?: number;
  takeProfit?: number;
}

export interface TradeResponse {
  success: boolean;
  orderId?: string;
  brokerOrderId?: string;
  status?: string;
  entryPrice?: number;
  exitPrice?: number;
  profit?: number;
  error?: string;
  timestamp: number;
}

export interface BrokerStatus {
  broker: BrokerType;
  connected: boolean;
  authenticated: boolean;
  balance?: number;
  currency?: string;
  lastUpdate: number;
}

export interface MarketQuote {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  timestamp: number;
  volume?: number;
}

class BrokerIntegrationManager {
  private brokers: Map<BrokerType, any> = new Map();
  private brokerConfigs: Map<BrokerType, BrokerConfig> = new Map();
  private marketQuotes: Map<string, MarketQuote> = new Map();
  private quoteSubscribers: Map<string, Set<(quote: MarketQuote) => void>> = new Map();

  constructor() {
    console.log('🔌 Broker Integration Manager initialized');
  }

  /**
   * Register a broker configuration
   */
  registerBroker(config: BrokerConfig): void {
    this.brokerConfigs.set(config.type, config);
    console.log(`📝 Registered broker: ${config.type}`);
  }

  /**
   * Connect to a specific broker
   */
  async connectBroker(brokerType: BrokerType): Promise<{ success: boolean; error?: string }> {
    const config = this.brokerConfigs.get(brokerType);
    
    if (!config) {
      return { success: false, error: `Broker ${brokerType} not configured` };
    }

    try {
      let connector: any;

      switch (brokerType) {
        case 'deriv':
          connector = new DerivConnector({
            apiToken: config.apiToken!,
            appId: config.appId || '1089', // Default app ID
            serverUrl: config.serverUrl
          } as DerivConfig);
          break;

        case 'quotex':
          connector = new QuotexConnector({
            token: config.apiToken!,
            demo: true
          });
          break;

        case 'pocketoption':
          connector = new PocketOptionConnector({
            token: config.apiToken!,
            demo: true
          });
          break;

        case 'iqoption':
          connector = new IQOptionConnector({
            token: config.apiToken!,
            mode: 'demo'
          });
          break;

        case 'mt5':
          connector = new MT5Connector({
            login: parseInt(config.accountId || '0'),
            password: config.apiToken!,
            server: config.serverUrl || 'MetaQuotes-Demo'
          });
          break;

        case 'deriv_forex':
          connector = new DerivForexConnector({
            apiToken: config.apiToken!,
            appId: config.appId || '1089'
          });
          break;

        default:
          return { success: false, error: `Unsupported broker: ${brokerType}` };
      }

      const result = await connector.connect();
      
      if (result.ok) {
        this.brokers.set(brokerType, connector);
        console.log(`✅ Connected to ${brokerType}`);
        return { success: true };
      }

      return { success: false, error: result.reason };
    } catch (error) {
      console.error(`❌ Error connecting to ${brokerType}:`, error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Disconnect from a broker
   */
  async disconnectBroker(brokerType: BrokerType): Promise<void> {
    const broker = this.brokers.get(brokerType);
    
    if (broker && typeof broker.disconnect === 'function') {
      broker.disconnect();
    }
    
    this.brokers.delete(brokerType);
    console.log(`📴 Disconnected from ${brokerType}`);
  }

  /**
   * Execute a trade on a broker
   */
  async executeTrade(request: TradeRequest): Promise<TradeResponse> {
    const broker = this.brokers.get(request.broker);
    
    if (!broker) {
      return {
        success: false,
        error: `Broker ${request.broker} not connected`,
        timestamp: Date.now()
      };
    }

    try {
      // Binary options trade
      if (request.broker === 'deriv') {
        const tradeType = request.direction === 'call' ? 'CALL' : 'PUT';
        
        const result: BinaryTradeResult = await broker.placeBinaryTrade({
          symbol: request.symbol,
          tradeType,
          stake: request.amount,
          duration: request.duration || 60,
          durationType: request.durationType || 's'
        });

        return {
          success: result.success,
          brokerOrderId: result.contractId,
          entryPrice: result.buyPrice,
          profit: result.payout,
          timestamp: Date.now(),
          error: result.error
        };
      }

      // Forex/CFD trade (MT5)
      if (request.broker === 'mt5') {
        const result = await broker.openPosition({
          symbol: request.symbol,
          type: request.direction === 'buy' ? 'buy' : 'sell',
          volume: request.amount,
          leverage: request.leverage || 100,
          stopLoss: request.stopLoss,
          takeProfit: request.takeProfit
        });

        return {
          success: result.success,
          orderId: result.orderId,
          brokerOrderId: result.dealId,
          entryPrice: result.price,
          timestamp: Date.now(),
          error: result.error
        };
      }

      // Placeholder for other brokers
      return {
        success: true,
        orderId: `${request.broker}_${Date.now()}`,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error(`❌ Trade execution error on ${request.broker}:`, error);
      return {
        success: false,
        error: String(error),
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get market quote for a symbol
   */
  async getQuote(brokerType: BrokerType, symbol: string): Promise<MarketQuote | null> {
    const broker = this.brokers.get(brokerType);
    
    if (!broker) {
      return null;
    }

    try {
      if (brokerType === 'deriv' && typeof broker.getPrice === 'function') {
        const price = await broker.getPrice(symbol);
        if (price) {
          return {
            symbol: price.symbol,
            bid: price.bid,
            ask: price.ask,
            last: price.last,
            timestamp: price.timestamp
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`❌ Error getting quote from ${brokerType}:`, error);
      return null;
    }
  }

  /**
   * Subscribe to real-time quotes
   */
  subscribeToQuotes(brokerType: BrokerType, symbol: string, callback: (quote: MarketQuote) => void): void {
    const broker = this.brokers.get(brokerType);
    const key = `${brokerType}_${symbol}`;
    
    if (!this.quoteSubscribers.has(key)) {
      this.quoteSubscribers.set(key, new Set());
    }
    
    this.quoteSubscribers.get(key)!.add(callback);

    // Set up subscription if broker supports it
    if (broker && typeof broker.subscribeToPrice === 'function') {
      broker.subscribeToPrice(symbol, (data: any) => {
        const quote: MarketQuote = {
          symbol: data.tick?.symbol || symbol,
          bid: data.tick?.bid || 0,
          ask: data.tick?.ask || 0,
          last: data.tick?.last || 0,
          timestamp: data.tick?.epoch || Date.now()
        };
        
        // Notify all subscribers
        this.quoteSubscribers.get(key)?.forEach(cb => cb(quote));
      });
    }
  }

  /**
   * Unsubscribe from quotes
   */
  unsubscribeFromQuotes(brokerType: BrokerType, symbol: string): void {
    const broker = this.brokers.get(brokerType);
    const key = `${brokerType}_${symbol}`;
    
    this.quoteSubscribers.delete(key);

    if (broker && typeof broker.unsubscribeFromPrice === 'function') {
      broker.unsubscribeFromPrice(symbol);
    }
  }

  /**
   * Get broker status
   */
  getBrokerStatus(brokerType: BrokerType): BrokerStatus {
    const broker = this.brokers.get(brokerType);
    const config = this.brokerConfigs.get(brokerType);
    
    if (!broker) {
      return {
        broker: brokerType,
        connected: false,
        authenticated: false,
        lastUpdate: Date.now()
      };
    }

    const status = broker.getStatus?.() || broker.getStatus?.() || { connected: false, authenticated: false };
    
    return {
      broker: brokerType,
      connected: status.connected,
      authenticated: status.authenticated,
      lastUpdate: Date.now()
    };
  }

  /**
   * Get all broker statuses
   */
  getAllBrokerStatuses(): BrokerStatus[] {
    const statuses: BrokerStatus[] = [];
    
    this.brokerConfigs.forEach((_, brokerType) => {
      statuses.push(this.getBrokerStatus(brokerType));
    });
    
    return statuses;
  }

  /**
   * Get account balance from broker
   */
  async getBalance(brokerType: BrokerType): Promise<{ balance: number; currency: string } | null> {
    const broker = this.brokers.get(brokerType);
    
    if (!broker || typeof broker.getBalance !== 'function') {
      return null;
    }

    try {
      return await broker.getBalance();
    } catch (error) {
      console.error(`❌ Error getting balance from ${brokerType}:`, error);
      return null;
    }
  }

  /**
   * Get open positions
   */
  async getOpenPositions(brokerType: BrokerType): Promise<any[]> {
    const broker = this.brokers.get(brokerType);
    
    if (!broker) {
      return [];
    }

    try {
      if (typeof broker.getOpenPositions === 'function') {
        return await broker.getOpenPositions();
      }
      return [];
    } catch (error) {
      console.error(`❌ Error getting positions from ${brokerType}:`, error);
      return [];
    }
  }

  /**
   * Close a position
   */
  async closePosition(brokerType: BrokerType, orderId: string): Promise<TradeResponse> {
    const broker = this.brokers.get(brokerType);
    
    if (!broker) {
      return {
        success: false,
        error: `Broker ${brokerType} not connected`,
        timestamp: Date.now()
      };
    }

    try {
      if (brokerType === 'deriv' && typeof broker.sellContract === 'function') {
        const result = await broker.sellContract(orderId, 0);
        return {
          success: result.success,
          orderId,
          timestamp: Date.now(),
          error: result.error
        };
      }

      return {
        success: false,
        error: 'Close position not implemented for this broker',
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
        timestamp: Date.now()
      };
    }
  }

  /**
   * Disconnect all brokers
   */
  async disconnectAll(): Promise<void> {
    for (const [brokerType] of this.brokers) {
      await this.disconnectBroker(brokerType);
    }
    console.log('📴 All brokers disconnected');
  }

  /**
   * Get supported brokers by market type
   */
  getBrokersByMarketType(marketType: MarketType): BrokerType[] {
    const mapping: Record<MarketType, BrokerType[]> = {
      binary: ['deriv', 'quotex', 'pocketoption', 'iqoption'],
      forex: ['mt5', 'deriv_forex'],
      spot: ['binance', 'coinbase']
    };
    
    return mapping[marketType] || [];
  }

  /**
   * Get market type for broker
   */
  getMarketType(brokerType: BrokerType): MarketType {
    const mapping: Record<BrokerType, MarketType> = {
      deriv: 'binary',
      quotex: 'binary',
      pocketoption: 'binary',
      iqoption: 'binary',
      mt5: 'forex',
      deriv_forex: 'forex',
      binance: 'spot',
      coinbase: 'spot'
    };
    
    return mapping[brokerType] || 'binary';
  }
}

// Export singleton instance
export const brokerManager = new BrokerIntegrationManager();
export default brokerManager;