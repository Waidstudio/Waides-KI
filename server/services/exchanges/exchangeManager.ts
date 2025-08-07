import { UniversalExchangeInterface, type ExchangeCredentials, type Balance, type Order, type MarketData } from './universalExchangeInterface';
import { APIKeyManager, type DecryptedCredentials, type APIKeyPermissions } from './apiKeyManager';
import { getExchangeConfig, validateExchangeCode, getAllExchangeCodes } from './exchangeConfig';

export interface ExchangeManagerConfig {
  userId: string;
  maxConcurrentConnections?: number;
  enableFailover?: boolean;
  rateLimitBuffer?: number; // percentage buffer for rate limits (default: 20%)
}

export interface ExchangeStatus {
  exchangeCode: string;
  exchangeName: string;
  connected: boolean;
  lastPing: number;
  latency: number;
  errorCount: number;
  activeOrders: number;
  availableBalance: number;
}

export interface CrossExchangeArbitrageOpportunity {
  buyExchange: string;
  sellExchange: string;
  symbol: string;
  buyPrice: number;
  sellPrice: number;
  profitMargin: number;
  maxQuantity: number;
  estimatedProfit: number;
}

export class ExchangeManager {
  private connectedExchanges: Map<string, UniversalExchangeInterface> = new Map();
  private exchangeStatus: Map<string, ExchangeStatus> = new Map();
  private config: ExchangeManagerConfig;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(config: ExchangeManagerConfig) {
    this.config = {
      maxConcurrentConnections: 5,
      enableFailover: true,
      rateLimitBuffer: 20,
      ...config
    };
  }

  // Connection Management
  public async connectExchange(exchangeCode: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate exchange code
      if (!validateExchangeCode(exchangeCode)) {
        return { success: false, error: `Invalid exchange code: ${exchangeCode}` };
      }

      // Check if already connected
      if (this.connectedExchanges.has(exchangeCode)) {
        return { success: true };
      }

      // Get credentials
      const credentials = await APIKeyManager.getCredentials(this.config.userId, exchangeCode);
      if (!credentials) {
        return { 
          success: false, 
          error: `No credentials found for ${exchangeCode}. Please connect your exchange account first.` 
        };
      }

      // Create exchange connector (this would need to be implemented for each exchange)
      const connector = await this.createExchangeConnector(exchangeCode, credentials);
      if (!connector) {
        return { success: false, error: `Failed to create connector for ${exchangeCode}` };
      }

      // Connect to exchange
      const connected = await connector.connect();
      if (!connected) {
        return { success: false, error: `Failed to connect to ${exchangeCode}` };
      }

      // Store connection
      this.connectedExchanges.set(exchangeCode, connector);
      
      // Initialize status monitoring
      await this.updateExchangeStatus(exchangeCode);

      console.log(`✅ Successfully connected to ${exchangeCode}`);
      return { success: true };

    } catch (error) {
      console.error(`Error connecting to ${exchangeCode}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public async disconnectExchange(exchangeCode: string): Promise<void> {
    const connector = this.connectedExchanges.get(exchangeCode);
    if (connector) {
      await connector.disconnect();
      this.connectedExchanges.delete(exchangeCode);
      this.exchangeStatus.delete(exchangeCode);
      console.log(`🔌 Disconnected from ${exchangeCode}`);
    }
  }

  public async connectAllUserExchanges(): Promise<{ connected: string[]; failed: string[] }> {
    const userExchanges = await APIKeyManager.getUserExchanges(this.config.userId);
    const results = { connected: [], failed: [] };

    for (const exchange of userExchanges) {
      if (!exchange.isActive) continue;
      
      const result = await this.connectExchange(exchange.exchangeCode);
      if (result.success) {
        results.connected.push(exchange.exchangeCode);
      } else {
        results.failed.push(exchange.exchangeCode);
        console.error(`Failed to connect ${exchange.exchangeCode}: ${result.error}`);
      }
    }

    return results;
  }

  // Market Data Operations
  public async getMarketData(symbol: string, exchangeCode?: string): Promise<MarketData | null> {
    try {
      if (exchangeCode) {
        const connector = this.connectedExchanges.get(exchangeCode);
        if (!connector) {
          throw new Error(`Exchange ${exchangeCode} is not connected`);
        }
        return await connector.getMarketData(symbol);
      } else {
        // Get from the first available exchange
        for (const [code, connector] of this.connectedExchanges) {
          try {
            return await connector.getMarketData(symbol);
          } catch (error) {
            console.warn(`Failed to get market data from ${code}, trying next...`);
            continue;
          }
        }
        throw new Error('No connected exchanges available for market data');
      }
    } catch (error) {
      console.error('Error getting market data:', error);
      return null;
    }
  }

  public async getAggregatedMarketData(symbol: string): Promise<{
    prices: Record<string, number>;
    volumes: Record<string, number>;
    averagePrice: number;
    priceSpread: number;
  }> {
    const prices: Record<string, number> = {};
    const volumes: Record<string, number> = {};

    for (const [exchangeCode, connector] of this.connectedExchanges) {
      try {
        const data = await connector.getMarketData(symbol);
        if (data) {
          prices[exchangeCode] = data.price;
          volumes[exchangeCode] = data.volume;
        }
      } catch (error) {
        console.warn(`Failed to get market data from ${exchangeCode}:`, error);
      }
    }

    const priceValues = Object.values(prices);
    const averagePrice = priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;
    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);
    const priceSpread = ((maxPrice - minPrice) / averagePrice) * 100;

    return { prices, volumes, averagePrice, priceSpread };
  }

  // Trading Operations
  public async executeOrder(
    symbol: string,
    side: 'buy' | 'sell',
    type: string,
    amount: number,
    price?: number,
    exchangeCode?: string,
    params?: any
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      let targetExchange: string;

      if (exchangeCode) {
        targetExchange = exchangeCode;
      } else {
        // Select best exchange for execution based on liquidity and fees
        targetExchange = await this.selectBestExchangeForTrade(symbol, side, amount);
      }

      const connector = this.connectedExchanges.get(targetExchange);
      if (!connector) {
        return { success: false, error: `Exchange ${targetExchange} is not connected` };
      }

      // Check minimum order size
      const minOrderSize = connector.getMinOrderSize(symbol);
      if (amount < minOrderSize) {
        return { 
          success: false, 
          error: `Order amount ${amount} is below minimum ${minOrderSize} for ${targetExchange}` 
        };
      }

      // Execute the order
      const order = await connector.createOrder(symbol, side, type, amount, price, params);
      
      // Update exchange status
      await this.updateExchangeStatus(targetExchange);

      console.log(`📊 Order executed on ${targetExchange}: ${JSON.stringify(order)}`);
      return { success: true, order };

    } catch (error) {
      console.error('Error executing order:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  public async routeSignal(signal: {
    type: 'BUY' | 'SELL' | 'HOLD';
    symbol: string;
    amount: number;
    confidence: number;
    exchangePreference?: string;
    strategy?: string;
  }): Promise<{ success: boolean; executedOrders: Order[]; errors: string[] }> {
    const executedOrders: Order[] = [];
    const errors: string[] = [];

    if (signal.type === 'HOLD') {
      return { success: true, executedOrders, errors };
    }

    try {
      const side = signal.type === 'BUY' ? 'buy' : 'sell';
      const result = await this.executeOrder(
        signal.symbol,
        side,
        'market', // Default to market order for signals
        signal.amount,
        undefined, // No price for market orders
        signal.exchangePreference
      );

      if (result.success && result.order) {
        executedOrders.push(result.order);
      } else {
        errors.push(result.error || 'Unknown execution error');
      }

    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return { 
      success: executedOrders.length > 0, 
      executedOrders, 
      errors 
    };
  }

  // Portfolio Management
  public async getAggregatedBalances(): Promise<Record<string, Balance>> {
    const aggregatedBalances: Record<string, Balance> = {};

    for (const [exchangeCode, connector] of this.connectedExchanges) {
      try {
        const balances = await connector.getBalances();
        
        for (const balance of balances) {
          if (!aggregatedBalances[balance.asset]) {
            aggregatedBalances[balance.asset] = {
              asset: balance.asset,
              free: 0,
              locked: 0,
              total: 0
            };
          }

          aggregatedBalances[balance.asset].free += balance.free;
          aggregatedBalances[balance.asset].locked += balance.locked;
          aggregatedBalances[balance.asset].total += balance.total;
        }
      } catch (error) {
        console.error(`Error getting balances from ${exchangeCode}:`, error);
      }
    }

    return aggregatedBalances;
  }

  // Cross-Exchange Arbitrage
  public async findArbitrageOpportunities(symbols: string[]): Promise<CrossExchangeArbitrageOpportunity[]> {
    const opportunities: CrossExchangeArbitrageOpportunity[] = [];

    if (this.connectedExchanges.size < 2) {
      return opportunities; // Need at least 2 exchanges for arbitrage
    }

    for (const symbol of symbols) {
      try {
        const marketData = await this.getAggregatedMarketData(symbol);
        const exchanges = Object.keys(marketData.prices);

        // Compare prices between exchanges
        for (let i = 0; i < exchanges.length; i++) {
          for (let j = i + 1; j < exchanges.length; j++) {
            const exchange1 = exchanges[i];
            const exchange2 = exchanges[j];
            const price1 = marketData.prices[exchange1];
            const price2 = marketData.prices[exchange2];

            // Check if there's a profitable arbitrage opportunity
            if (Math.abs(price1 - price2) / Math.min(price1, price2) > 0.005) { // 0.5% minimum spread
              const buyExchange = price1 < price2 ? exchange1 : exchange2;
              const sellExchange = price1 < price2 ? exchange2 : exchange1;
              const buyPrice = Math.min(price1, price2);
              const sellPrice = Math.max(price1, price2);
              const profitMargin = ((sellPrice - buyPrice) / buyPrice) * 100;

              opportunities.push({
                buyExchange,
                sellExchange,
                symbol,
                buyPrice,
                sellPrice,
                profitMargin,
                maxQuantity: 0, // Would need to calculate based on order book depth
                estimatedProfit: 0 // Would need to calculate based on fees and amount
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error finding arbitrage for ${symbol}:`, error);
      }
    }

    // Sort by profit margin
    return opportunities.sort((a, b) => b.profitMargin - a.profitMargin);
  }

  // Status and Monitoring
  public async updateExchangeStatus(exchangeCode: string): Promise<void> {
    const connector = this.connectedExchanges.get(exchangeCode);
    if (!connector) return;

    try {
      const connectionStatus = await connector.getConnectionStatus();
      const config = getExchangeConfig(exchangeCode);
      
      this.exchangeStatus.set(exchangeCode, {
        exchangeCode,
        exchangeName: config?.name || exchangeCode,
        connected: connectionStatus.connected,
        lastPing: connectionStatus.lastPing,
        latency: connectionStatus.latency,
        errorCount: connectionStatus.errorCount,
        activeOrders: 0, // Would need to fetch from exchange
        availableBalance: 0 // Would need to calculate from balances
      });
    } catch (error) {
      console.error(`Error updating status for ${exchangeCode}:`, error);
    }
  }

  public getExchangeStatuses(): ExchangeStatus[] {
    return Array.from(this.exchangeStatus.values());
  }

  public getConnectedExchanges(): string[] {
    return Array.from(this.connectedExchanges.keys());
  }

  public isConnected(exchangeCode: string): boolean {
    return this.connectedExchanges.has(exchangeCode);
  }

  // Private Helper Methods
  private async createExchangeConnector(
    exchangeCode: string, 
    credentials: DecryptedCredentials
  ): Promise<UniversalExchangeInterface | null> {
    // This would need to be implemented to create specific exchange connectors
    // For now, return null as we haven't implemented specific connectors yet
    console.log(`📝 Creating connector for ${exchangeCode} (implementation needed)`);
    return null;
  }

  private async selectBestExchangeForTrade(
    symbol: string,
    side: 'buy' | 'sell',
    amount: number
  ): Promise<string> {
    // Simple implementation: return first connected exchange
    // In production, this should consider liquidity, fees, and order book depth
    const connected = this.getConnectedExchanges();
    if (connected.length === 0) {
      throw new Error('No exchanges connected');
    }
    return connected[0];
  }

  // Cleanup
  public async shutdown(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    for (const exchangeCode of this.connectedExchanges.keys()) {
      await this.disconnectExchange(exchangeCode);
    }

    console.log('🔌 Exchange Manager shutdown complete');
  }

  // Start monitoring (optional)
  public startMonitoring(intervalMs: number = 30000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      for (const exchangeCode of this.connectedExchanges.keys()) {
        await this.updateExchangeStatus(exchangeCode);
      }
    }, intervalMs);

    console.log('📊 Exchange monitoring started');
  }
}

// Singleton instance for global access
let globalExchangeManager: ExchangeManager | null = null;

export function getExchangeManager(config?: ExchangeManagerConfig): ExchangeManager {
  if (!globalExchangeManager && config) {
    globalExchangeManager = new ExchangeManager(config);
  }
  
  if (!globalExchangeManager) {
    throw new Error('Exchange Manager not initialized. Please provide config on first call.');
  }
  
  return globalExchangeManager;
}

export function resetExchangeManager(): void {
  if (globalExchangeManager) {
    globalExchangeManager.shutdown();
    globalExchangeManager = null;
  }
}