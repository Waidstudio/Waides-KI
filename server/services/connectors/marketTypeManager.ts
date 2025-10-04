/**
 * Market Type Manager
 * Routes trading bots to their correct market-type connectors
 * 
 * Market Types:
 * - BINARY: Binary options brokers (Deriv, Quotex, PocketOption, IQOption, etc.)
 * - FOREX: Forex/CFD platforms (Deriv MT5, MT4, OANDA, FXCM, IC Markets)
 * - SPOT: Cryptocurrency spot exchanges (Binance, KuCoin, OKX, Bybit, etc.)
 */

import { BINARY_BROKERS, BINARY_BROKER_CONFIGS } from './binary';
import { FOREX_PLATFORMS, FOREX_PLATFORM_CONFIGS } from './forex';
import { SPOT_EXCHANGES, EXCHANGE_CONFIGS } from './spot';

export enum MarketType {
  BINARY = 'BINARY',
  FOREX = 'FOREX',
  SPOT = 'SPOT'
}

export enum BotType {
  WAIDBOT = 'WAIDBOT',           // WaidBot α - Binary Options
  WAIDBOT_PRO = 'WAIDBOT_PRO',   // WaidBot Pro β - Binary Options
  MAIBOT = 'MAIBOT',             // Maibot - Binary Options (learning/demo)
  AUTONOMOUS = 'AUTONOMOUS',      // Autonomous Trader γ - Forex
  FULL_ENGINE = 'FULL_ENGINE'    // Full Engine Ω - Spot Exchanges
}

// Bot-to-Market mapping
export const BOT_MARKET_MAPPING: Record<BotType, MarketType> = {
  [BotType.WAIDBOT]: MarketType.BINARY,
  [BotType.WAIDBOT_PRO]: MarketType.BINARY,
  [BotType.MAIBOT]: MarketType.BINARY,
  [BotType.AUTONOMOUS]: MarketType.FOREX,
  [BotType.FULL_ENGINE]: MarketType.SPOT
};

// Bot strategies by market type
export const MARKET_STRATEGIES = {
  [MarketType.BINARY]: {
    name: 'Binary Options Strategy',
    description: 'Short-term directional prediction (60s-5m expiry)',
    indicators: ['RSI', 'Bollinger Bands', 'Moving Averages', 'Candlestick Patterns'],
    riskManagement: 'Fixed stake per trade (1-5% of balance)',
    profitTarget: '75-95% payout per winning trade',
    tradeTypes: ['CALL', 'PUT', 'RISE', 'FALL'],
    recommendedBrokers: ['DERIV', 'QUOTEX', 'POCKET_OPTION']
  },
  [MarketType.FOREX]: {
    name: 'Forex/CFD Strategy',
    description: 'Medium-term trend following with leverage (15m-4h timeframes)',
    indicators: ['EMA Crossover', 'MACD', 'Fibonacci', 'Support/Resistance'],
    riskManagement: 'Stop Loss/Take Profit, Max 2% risk per trade',
    profitTarget: '1:2 to 1:3 risk/reward ratio',
    tradeTypes: ['BUY', 'SELL', 'PENDING ORDERS'],
    recommendedPlatforms: ['DERIV', 'MT5', 'IC_MARKETS']
  },
  [MarketType.SPOT]: {
    name: 'Spot Exchange Strategy',
    description: 'Long-term accumulation and swing trading (4h-1d timeframes)',
    indicators: ['Volume Profile', 'On-Balance Volume', 'Ichimoku', 'Market Structure'],
    riskManagement: 'Position sizing, dollar-cost averaging',
    profitTarget: '10-50% per trade over weeks/months',
    tradeTypes: ['LIMIT', 'MARKET', 'STOP-LIMIT', 'OCO'],
    recommendedExchanges: ['BINANCE', 'KUCOIN', 'OKX']
  }
};

export class MarketTypeManager {
  /**
   * Get market type for a specific bot
   */
  static getMarketTypeForBot(botType: BotType): MarketType {
    return BOT_MARKET_MAPPING[botType];
  }

  /**
   * Get appropriate strategy for market type
   */
  static getStrategyForMarket(marketType: MarketType) {
    return MARKET_STRATEGIES[marketType];
  }

  /**
   * Get available connectors for market type
   */
  static getConnectorsForMarket(marketType: MarketType) {
    switch (marketType) {
      case MarketType.BINARY:
        return {
          type: 'binary',
          brokers: BINARY_BROKER_CONFIGS,
          codes: BINARY_BROKERS
        };
      case MarketType.FOREX:
        return {
          type: 'forex',
          platforms: FOREX_PLATFORM_CONFIGS,
          codes: FOREX_PLATFORMS
        };
      case MarketType.SPOT:
        return {
          type: 'spot',
          exchanges: EXCHANGE_CONFIGS,
          codes: SPOT_EXCHANGES
        };
    }
  }

  /**
   * Validate if a bot can use a specific connector
   */
  static validateBotConnector(botType: BotType, connectorCode: string): {
    valid: boolean;
    reason?: string;
    marketType?: MarketType;
  } {
    const requiredMarket = this.getMarketTypeForBot(botType);
    const connectors = this.getConnectorsForMarket(requiredMarket);

    let isValid = false;

    if (requiredMarket === MarketType.BINARY) {
      isValid = Object.values(BINARY_BROKERS).includes(connectorCode as any);
    } else if (requiredMarket === MarketType.FOREX) {
      isValid = Object.values(FOREX_PLATFORMS).includes(connectorCode as any);
    } else if (requiredMarket === MarketType.SPOT) {
      isValid = Object.values(SPOT_EXCHANGES).includes(connectorCode as any);
    }

    return {
      valid: isValid,
      reason: isValid ? undefined : `Bot ${botType} requires ${requiredMarket} market connector, but ${connectorCode} doesn't match`,
      marketType: requiredMarket
    };
  }

  /**
   * Get configuration summary for all market types
   */
  static getMarketSummary() {
    // Convert binary broker configs to connector list
    const binaryConnectors = Object.entries(BINARY_BROKER_CONFIGS).map(([code, config]) => ({
      code,
      name: config.name,
      status: config.status || 'operational',
      description: config.description || `Binary options trading on ${config.name}`
    }));

    // Convert forex platform configs to connector list
    const forexConnectors = Object.entries(FOREX_PLATFORM_CONFIGS).map(([code, config]) => ({
      code,
      name: config.name,
      status: config.status || 'operational',
      description: config.description || `Forex/CFD trading on ${config.name}`
    }));

    // Convert spot exchange configs to connector list
    const spotConnectors = Object.entries(EXCHANGE_CONFIGS).map(([code, config]) => ({
      code,
      name: config.name,
      status: config.status || 'operational',
      description: config.description || `Cryptocurrency trading on ${config.name}`
    }));

    return {
      binary: {
        total: binaryConnectors.length,
        operational: binaryConnectors.filter(c => c.status === 'operational').length,
        connectors: binaryConnectors,
        marketType: MarketType.BINARY,
        bots: [BotType.WAIDBOT, BotType.WAIDBOT_PRO, BotType.MAIBOT],
        strategy: MARKET_STRATEGIES[MarketType.BINARY]
      },
      forex: {
        total: forexConnectors.length,
        operational: forexConnectors.filter(c => c.status === 'operational').length,
        connectors: forexConnectors,
        marketType: MarketType.FOREX,
        bots: [BotType.AUTONOMOUS],
        strategy: MARKET_STRATEGIES[MarketType.FOREX]
      },
      spot: {
        total: spotConnectors.length,
        operational: spotConnectors.filter(c => c.status === 'operational').length,
        connectors: spotConnectors,
        marketType: MarketType.SPOT,
        bots: [BotType.FULL_ENGINE],
        strategy: MARKET_STRATEGIES[MarketType.SPOT]
      }
    };
  }
}

export default MarketTypeManager;
