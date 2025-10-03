/**
 * Binary Options Connectors Index
 * Exports all binary options broker connectors
 * For: WaidBot, WaidBot Pro, Maibot
 */

export { DerivConnector } from './derivConnector';
export { QuotexConnector } from './quotexConnector';
export { PocketOptionConnector } from './pocketOptionConnector';
export { IQOptionConnector } from './iqOptionConnector';

// Simplified connectors for other brokers
export const BINARY_BROKERS = {
  DERIV: 'deriv',
  QUOTEX: 'quotex',
  POCKET_OPTION: 'pocketOption',
  IQ_OPTION: 'iqOption',
  OLYMP_TRADE: 'olympTrade',
  EXPERT_OPTION: 'expertOption',
  BINOMO: 'binomo',
  SPECTRE: 'spectre',
  NADEX: 'nadex'
} as const;

export interface BinaryBrokerInfo {
  code: string;
  name: string;
  minTrade: number;
  maxPayout: number; // percentage
  minDuration: number; // seconds
  maxDuration: number; // seconds
  supportedAssets: string[];
}

export const BINARY_BROKER_CONFIGS: Record<string, BinaryBrokerInfo> = {
  DERIV: {
    code: 'DERIV',
    name: 'Deriv',
    minTrade: 0.35,
    maxPayout: 95,
    minDuration: 5,
    maxDuration: 365 * 24 * 3600,
    supportedAssets: ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'R_10', 'R_25', 'R_50', 'R_75', 'R_100']
  },
  QUOTEX: {
    code: 'QUOTEX',
    name: 'Quotex',
    minTrade: 1,
    maxPayout: 95,
    minDuration: 60,
    maxDuration: 4 * 3600,
    supportedAssets: ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'GOLD', 'OIL']
  },
  POCKET_OPTION: {
    code: 'POCKET_OPTION',
    name: 'PocketOption',
    minTrade: 1,
    maxPayout: 92,
    minDuration: 60,
    maxDuration: 4 * 3600,
    supportedAssets: ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD']
  },
  IQ_OPTION: {
    code: 'IQ_OPTION',
    name: 'IQOption',
    minTrade: 1,
    maxPayout: 95,
    minDuration: 60,
    maxDuration: 4 * 3600,
    supportedAssets: ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'AAPL', 'GOOGL']
  },
  OLYMP_TRADE: {
    code: 'OLYMP_TRADE',
    name: 'OlympTrade',
    minTrade: 1,
    maxPayout: 92,
    minDuration: 60,
    maxDuration: 23 * 3600,
    supportedAssets: ['EURUSD', 'GBPUSD', 'USDJPY', 'GOLD', 'OIL']
  },
  EXPERT_OPTION: {
    code: 'EXPERT_OPTION',
    name: 'ExpertOption',
    minTrade: 1,
    maxPayout: 95,
    minDuration: 60,
    maxDuration: 5 * 60,
    supportedAssets: ['EURUSD', 'GBPUSD', 'BTCUSD', 'ETHUSD']
  },
  BINOMO: {
    code: 'BINOMO',
    name: 'Binomo',
    minTrade: 1,
    maxPayout: 90,
    minDuration: 60,
    maxDuration: 60 * 60,
    supportedAssets: ['EURUSD', 'GBPUSD', 'USDJPY', 'GOLD']
  },
  SPECTRE: {
    code: 'SPECTRE',
    name: 'Spectre.ai',
    minTrade: 1,
    maxPayout: 90,
    minDuration: 60,
    maxDuration: 5 * 60,
    supportedAssets: ['ETHUSD', 'BTCUSD']
  },
  NADEX: {
    code: 'NADEX',
    name: 'Nadex',
    minTrade: 1,
    maxPayout: 100,
    minDuration: 5 * 60,
    maxDuration: 24 * 3600,
    supportedAssets: ['EURUSD', 'GBPUSD', 'USDJPY', 'US500', 'GOLD']
  }
};
