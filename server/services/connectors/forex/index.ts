/**
 * Forex Connectors Index
 * Exports all forex trading platform connectors
 * For: Autonomous Trader
 */

export { DerivForexConnector } from './derivForexConnector';
export { MT5Connector } from './mt5Connector';
export { MT4Connector } from './mt4Connector';

export const FOREX_PLATFORMS = {
  DERIV: 'deriv',
  MT5: 'mt5',
  MT4: 'mt4',
  OANDA: 'oanda',
  FXCM: 'fxcm',
  IC_MARKETS: 'icMarkets'
} as const;

export interface ForexPlatformInfo {
  code: string;
  name: string;
  minLot: number;
  maxLeverage: number;
  spreads: {
    EURUSD: number;
    GBPUSD: number;
    USDJPY: number;
  };
  supportedPairs: string[];
  regulators: string[];
}

export const FOREX_PLATFORM_CONFIGS: Record<string, ForexPlatformInfo> = {
  DERIV: {
    code: 'DERIV',
    name: 'Deriv MT5',
    minLot: 0.01,
    maxLeverage: 1000,
    spreads: {
      EURUSD: 0.7,
      GBPUSD: 1.0,
      USDJPY: 0.8
    },
    supportedPairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD'],
    regulators: ['MFSA', 'LFSA', 'BVI FSC']
  },
  MT5: {
    code: 'MT5',
    name: 'MetaTrader 5',
    minLot: 0.01,
    maxLeverage: 500,
    spreads: {
      EURUSD: 0.6,
      GBPUSD: 0.9,
      USDJPY: 0.7
    },
    supportedPairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'EURGBP', 'EURJPY', 'GBPJPY'],
    regulators: ['Varies by broker']
  },
  MT4: {
    code: 'MT4',
    name: 'MetaTrader 4',
    minLot: 0.01,
    maxLeverage: 500,
    spreads: {
      EURUSD: 0.8,
      GBPUSD: 1.1,
      USDJPY: 0.9
    },
    supportedPairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'],
    regulators: ['Varies by broker']
  },
  OANDA: {
    code: 'OANDA',
    name: 'OANDA',
    minLot: 0.01,
    maxLeverage: 50,
    spreads: {
      EURUSD: 0.9,
      GBPUSD: 1.2,
      USDJPY: 1.0
    },
    supportedPairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'NZDUSD', 'USDCAD'],
    regulators: ['FCA', 'ASIC', 'NFA']
  },
  FXCM: {
    code: 'FXCM',
    name: 'FXCM',
    minLot: 0.01,
    maxLeverage: 400,
    spreads: {
      EURUSD: 0.7,
      GBPUSD: 1.0,
      USDJPY: 0.8
    },
    supportedPairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'EURGBP'],
    regulators: ['FCA', 'ASIC']
  },
  IC_MARKETS: {
    code: 'IC_MARKETS',
    name: 'IC Markets',
    minLot: 0.01,
    maxLeverage: 500,
    spreads: {
      EURUSD: 0.6,
      GBPUSD: 0.8,
      USDJPY: 0.7
    },
    supportedPairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'NZDUSD', 'USDCAD', 'EURGBP'],
    regulators: ['ASIC', 'CySEC', 'FSA']
  }
};
