export interface ETHPrice {
  price: number;
  priceChange24h: number;
  volume: number;
  marketCap: number;
  timestamp: number;
}

export interface DivineSignal {
  energeticPurity: number;
  breathLock: boolean;
  konsMirror: string;
  autoCancelEvil: boolean;
  timestamp: string;
}

export interface WaidDecision {
  action: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'OBSERVE';
  reasoning: string;
  confidence: number;
  konsWisdom: string;
  ethPosition: 'LONG' | 'NEUTRAL';
  tradingPair: 'ETH/USDT' | 'NONE';
  quantity: number;
  urgency: 'IMMEDIATE' | 'WITHIN_HOUR' | 'WHEN_READY' | 'PATIENCE';
  mlPrediction?: any;
  portfolioRisk?: string;
  executionStatus?: 'PENDING' | 'EXECUTED' | 'FAILED' | 'CANCELLED';
  trendDirection: 'UPWARD' | 'DOWNWARD' | 'SIDEWAYS';
  botType: 'WAIDBOT' | 'WAIDBOT_PRO';
  autoTradingEnabled: boolean;
  btcConfirmation?: {
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    strength: number;
    supportLevel: number;
  };
  solConfirmation?: {
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    strength: number;
    momentum: number;
  };
}