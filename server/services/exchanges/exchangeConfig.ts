export interface ExchangeConfig {
  code: string;
  name: string;
  baseUrl: string;
  websocketUrl?: string;
  rateLimit: {
    requests: number;
    window: number; // milliseconds
  };
  features: {
    spot: boolean;
    futures: boolean;
    options: boolean;
    lending: boolean;
    staking: boolean;
  };
  apiVersion: string;
  fees: {
    maker: number;
    taker: number;
  };
  tradingPairs: string[];
  supportedOrderTypes: string[];
  minOrderSizes: Record<string, number>;
  withdrawalLimits: Record<string, number>;
}

export const EXCHANGE_CONFIGS: Record<string, ExchangeConfig> = {
  BIN: {
    code: 'BIN',
    name: 'Binance',
    baseUrl: 'https://api.binance.com',
    websocketUrl: 'wss://stream.binance.com:9443',
    rateLimit: {
      requests: 1200,
      window: 60000 // 1 minute
    },
    features: {
      spot: true,
      futures: true,
      options: true,
      lending: true,
      staking: true
    },
    apiVersion: 'v3',
    fees: {
      maker: 0.001, // 0.1%
      taker: 0.001
    },
    tradingPairs: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOTUSDT'],
    supportedOrderTypes: ['MARKET', 'LIMIT', 'STOP_LOSS', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT', 'TAKE_PROFIT_LIMIT'],
    minOrderSizes: {
      'BTCUSDT': 0.00001,
      'ETHUSDT': 0.0001,
      'BNBUSDT': 0.001
    },
    withdrawalLimits: {
      'BTC': 100,
      'ETH': 1000,
      'USDT': 1000000
    }
  },
  
  COI: {
    code: 'COI',
    name: 'Coinbase',
    baseUrl: 'https://api.coinbase.com',
    websocketUrl: 'wss://ws-feed.exchange.coinbase.com',
    rateLimit: {
      requests: 1000,
      window: 60000
    },
    features: {
      spot: true,
      futures: false,
      options: false,
      lending: false,
      staking: true
    },
    apiVersion: 'v2',
    fees: {
      maker: 0.005, // 0.5%
      taker: 0.005
    },
    tradingPairs: ['BTC-USD', 'ETH-USD', 'LTC-USD', 'BCH-USD'],
    supportedOrderTypes: ['MARKET', 'LIMIT', 'STOP'],
    minOrderSizes: {
      'BTC-USD': 0.001,
      'ETH-USD': 0.01,
      'LTC-USD': 0.1
    },
    withdrawalLimits: {
      'BTC': 50,
      'ETH': 500,
      'USD': 50000
    }
  },

  KRA: {
    code: 'KRA',
    name: 'Kraken',
    baseUrl: 'https://api.kraken.com',
    websocketUrl: 'wss://ws.kraken.com',
    rateLimit: {
      requests: 900,
      window: 60000
    },
    features: {
      spot: true,
      futures: true,
      options: false,
      lending: false,
      staking: true
    },
    apiVersion: '0',
    fees: {
      maker: 0.0016, // 0.16%
      taker: 0.0026
    },
    tradingPairs: ['XXBTZUSD', 'XETHZUSD', 'XLTCZUSD', 'ADAUSD'],
    supportedOrderTypes: ['market', 'limit', 'stop-loss', 'take-profit'],
    minOrderSizes: {
      'XXBTZUSD': 0.0001,
      'XETHZUSD': 0.001,
      'XLTCZUSD': 0.01
    },
    withdrawalLimits: {
      'XBT': 10,
      'ETH': 100,
      'USD': 25000
    }
  },

  BYB: {
    code: 'BYB',
    name: 'Bybit',
    baseUrl: 'https://api.bybit.com',
    websocketUrl: 'wss://stream.bybit.com',
    rateLimit: {
      requests: 600,
      window: 60000
    },
    features: {
      spot: true,
      futures: true,
      options: true,
      lending: false,
      staking: false
    },
    apiVersion: 'v5',
    fees: {
      maker: 0.001,
      taker: 0.0006
    },
    tradingPairs: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT'],
    supportedOrderTypes: ['Market', 'Limit', 'Stop', 'StopLimit'],
    minOrderSizes: {
      'BTCUSDT': 0.00001,
      'ETHUSDT': 0.0001,
      'SOLUSDT': 0.01
    },
    withdrawalLimits: {
      'BTC': 50,
      'ETH': 500,
      'USDT': 500000
    }
  },

  KUC: {
    code: 'KUC',
    name: 'KuCoin',
    baseUrl: 'https://api.kucoin.com',
    websocketUrl: 'wss://ws-api.kucoin.com',
    rateLimit: {
      requests: 1800,
      window: 60000
    },
    features: {
      spot: true,
      futures: true,
      options: false,
      lending: true,
      staking: true
    },
    apiVersion: 'v1',
    fees: {
      maker: 0.001,
      taker: 0.001
    },
    tradingPairs: ['BTC-USDT', 'ETH-USDT', 'KCS-USDT', 'DOGE-USDT'],
    supportedOrderTypes: ['market', 'limit', 'stop'],
    minOrderSizes: {
      'BTC-USDT': 0.00001,
      'ETH-USDT': 0.0001,
      'KCS-USDT': 0.1
    },
    withdrawalLimits: {
      'BTC': 100,
      'ETH': 1000,
      'USDT': 1000000
    }
  },

  HUO: {
    code: 'HUO',
    name: 'Huobi',
    baseUrl: 'https://api.huobi.pro',
    websocketUrl: 'wss://api.huobi.pro/ws',
    rateLimit: {
      requests: 1000,
      window: 60000
    },
    features: {
      spot: true,
      futures: true,
      options: false,
      lending: true,
      staking: false
    },
    apiVersion: 'v1',
    fees: {
      maker: 0.002,
      taker: 0.002
    },
    tradingPairs: ['btcusdt', 'ethusdt', 'htusdt', 'ltcusdt'],
    supportedOrderTypes: ['buy-market', 'sell-market', 'buy-limit', 'sell-limit', 'buy-stop-limit', 'sell-stop-limit'],
    minOrderSizes: {
      'btcusdt': 0.0001,
      'ethusdt': 0.001,
      'htusdt': 1
    },
    withdrawalLimits: {
      'btc': 10,
      'eth': 100,
      'usdt': 200000
    }
  },

  OKX: {
    code: 'OKX',
    name: 'OKX',
    baseUrl: 'https://www.okx.com',
    websocketUrl: 'wss://ws.okx.com:8443',
    rateLimit: {
      requests: 600,
      window: 60000
    },
    features: {
      spot: true,
      futures: true,
      options: true,
      lending: true,
      staking: true
    },
    apiVersion: 'v5',
    fees: {
      maker: 0.0008,
      taker: 0.001
    },
    tradingPairs: ['BTC-USDT', 'ETH-USDT', 'OKB-USDT', 'LTC-USDT'],
    supportedOrderTypes: ['market', 'limit', 'post_only', 'fok', 'ioc'],
    minOrderSizes: {
      'BTC-USDT': 0.00001,
      'ETH-USDT': 0.0001,
      'OKB-USDT': 0.1
    },
    withdrawalLimits: {
      'BTC': 100,
      'ETH': 1000,
      'USDT': 1000000
    }
  },

  BIT: {
    code: 'BIT',
    name: 'Bitget',
    baseUrl: 'https://api.bitget.com',
    websocketUrl: 'wss://ws.bitget.com',
    rateLimit: {
      requests: 1200,
      window: 60000
    },
    features: {
      spot: true,
      futures: true,
      options: false,
      lending: false,
      staking: false
    },
    apiVersion: 'v1',
    fees: {
      maker: 0.001,
      taker: 0.001
    },
    tradingPairs: ['BTCUSDT', 'ETHUSDT', 'BGBUSDT', 'SOLUSDT'],
    supportedOrderTypes: ['market', 'limit', 'stop_limit'],
    minOrderSizes: {
      'BTCUSDT': 0.00001,
      'ETHUSDT': 0.0001,
      'BGBUSDT': 1
    },
    withdrawalLimits: {
      'BTC': 50,
      'ETH': 500,
      'USDT': 500000
    }
  },

  GAT: {
    code: 'GAT',
    name: 'Gate.io',
    baseUrl: 'https://api.gateio.ws',
    websocketUrl: 'wss://api.gateio.ws/ws/v4/',
    rateLimit: {
      requests: 900,
      window: 60000
    },
    features: {
      spot: true,
      futures: true,
      options: true,
      lending: true,
      staking: false
    },
    apiVersion: 'v4',
    fees: {
      maker: 0.002,
      taker: 0.002
    },
    tradingPairs: ['BTC_USDT', 'ETH_USDT', 'GT_USDT', 'DOT_USDT'],
    supportedOrderTypes: ['limit', 'market'],
    minOrderSizes: {
      'BTC_USDT': 0.0001,
      'ETH_USDT': 0.001,
      'GT_USDT': 1
    },
    withdrawalLimits: {
      'BTC': 10,
      'ETH': 100,
      'USDT': 200000
    }
  },

  MEX: {
    code: 'MEX',
    name: 'MEXC',
    baseUrl: 'https://api.mexc.com',
    websocketUrl: 'wss://ws.mexc.com/ws',
    rateLimit: {
      requests: 1200,
      window: 60000
    },
    features: {
      spot: true,
      futures: true,
      options: false,
      lending: false,
      staking: false
    },
    apiVersion: 'v3',
    fees: {
      maker: 0.002,
      taker: 0.002
    },
    tradingPairs: ['BTCUSDT', 'ETHUSDT', 'MXUSDT', 'BNBUSDT'],
    supportedOrderTypes: ['LIMIT', 'MARKET', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT_LIMIT'],
    minOrderSizes: {
      'BTCUSDT': 0.00001,
      'ETHUSDT': 0.0001,
      'MXUSDT': 10
    },
    withdrawalLimits: {
      'BTC': 50,
      'ETH': 500,
      'USDT': 500000
    }
  },

  PHE: {
    code: 'PHE',
    name: 'Phemex',
    baseUrl: 'https://api.phemex.com',
    websocketUrl: 'wss://phemex.com/ws',
    rateLimit: {
      requests: 600,
      window: 60000
    },
    features: {
      spot: true,
      futures: true,
      options: false,
      lending: false,
      staking: false
    },
    apiVersion: 'v1',
    fees: {
      maker: 0.001,
      taker: 0.001
    },
    tradingPairs: ['BTCUSD', 'ETHUSD', 'XRPUSD', 'LINKUSD'],
    supportedOrderTypes: ['Market', 'Limit', 'Stop', 'StopLimit'],
    minOrderSizes: {
      'BTCUSD': 1, // USD value
      'ETHUSD': 1,
      'XRPUSD': 1
    },
    withdrawalLimits: {
      'BTC': 10,
      'ETH': 100,
      'USD': 100000
    }
  },

  DER: {
    code: 'DER',
    name: 'Deribit',
    baseUrl: 'https://www.deribit.com/api',
    websocketUrl: 'wss://www.deribit.com/ws/api/v2',
    rateLimit: {
      requests: 20,
      window: 1000 // 1 second - very strict
    },
    features: {
      spot: false,
      futures: true,
      options: true,
      lending: false,
      staking: false
    },
    apiVersion: 'v2',
    fees: {
      maker: 0.0003,
      taker: 0.0005
    },
    tradingPairs: ['BTC-PERPETUAL', 'ETH-PERPETUAL', 'BTC-29MAR24', 'ETH-29MAR24'],
    supportedOrderTypes: ['market', 'limit', 'stop_market', 'stop_limit'],
    minOrderSizes: {
      'BTC-PERPETUAL': 1, // Contract size
      'ETH-PERPETUAL': 1,
      'BTC-29MAR24': 1
    },
    withdrawalLimits: {
      'BTC': 100,
      'ETH': 1000
    }
  }
};

export function getExchangeConfig(code: string): ExchangeConfig | null {
  return EXCHANGE_CONFIGS[code] || null;
}

export function getAllExchangeConfigs(): ExchangeConfig[] {
  return Object.values(EXCHANGE_CONFIGS);
}

export function getAllExchangeCodes(): string[] {
  return Object.keys(EXCHANGE_CONFIGS);
}

export function getExchangesByFeature(feature: keyof ExchangeConfig['features']): ExchangeConfig[] {
  return Object.values(EXCHANGE_CONFIGS).filter(config => config.features[feature]);
}

export function validateExchangeCode(code: string): boolean {
  return code in EXCHANGE_CONFIGS;
}

export function getDefaultTradingPair(exchangeCode: string): string | null {
  const config = getExchangeConfig(exchangeCode);
  return config?.tradingPairs[0] || null;
}

export function getExchangeRateLimit(exchangeCode: string): { requests: number; window: number } | null {
  const config = getExchangeConfig(exchangeCode);
  return config?.rateLimit || null;
}