/**
 * Spot Exchange Connectors Index
 * Exports all cryptocurrency spot exchange connectors
 * For: Full Engine Ω
 */

export { EXCHANGE_CONFIGS } from './exchangeConfig';
export type { ExchangeConfig } from './exchangeConfig';

export const SPOT_EXCHANGES = {
  BINANCE: 'BIN',
  COINBASE: 'COI',
  KRAKEN: 'KRA',
  KUCOIN: 'KUC',
  BYBIT: 'BYB',
  BITFINEX: 'BIT',
  OKX: 'OKX',
  GATE_IO: 'GAT',
  GEMINI: 'GEM'
} as const;

export type SpotExchangeCode = typeof SPOT_EXCHANGES[keyof typeof SPOT_EXCHANGES];
