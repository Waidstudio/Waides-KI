// Component-specific type definitions

export interface KonsPowaPrediction {
  id: number;
  ethPrice: number;
  prediction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  strategy: string;
  timeframe: string;
  konsPowerLevel: number;
  divineAlignment: number;
  spiritualEnergy: number;
  reasoning: string[];
  targetPrice?: number;
  stopLoss?: number;
  createdAt: Date;
}

export interface MarketAnalysisData {
  id: number;
  ethPrice: number;
  volume24h: number;
  marketCap: number;
  priceChange24h: number;
  trendDirection: 'up' | 'down' | 'sideways';
  macdSignal: 'buy' | 'sell' | 'neutral';
  rsiValue: number;
  fearGreedIndex: number;
  indicators: {
    bullish: string[];
    bearish: string[];
    neutral: string[];
  };
  createdAt: Date;
}

export interface EnhancedDashboardData {
  ethData: {
    price: number;
    volume24h: number;
    marketCap: number;
    priceChange24h: number;
    dominance: number;
  };
  konsPowaPrediction: KonsPowaPrediction;
  marketAnalysis: MarketAnalysisData;
  portfolioData: {
    totalValue: number;
    dayChange: number;
    dayChangePercent: number;
  };
  tradingSignals: TradingSignal[];
}

export interface TradingSignal {
  id: string;
  type: 'buy' | 'sell' | 'hold';
  confidence: number;
  price: number;
  timestamp: Date;
  source: string;
  reasoning: string;
}

export interface AdminSystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  memory_usage: number;
  cpu_usage: number;
  uptime: number;
  database_status: 'connected' | 'disconnected';
  api_status: Record<string, boolean>;
  errors: string[];
  warnings: string[];
}

export interface AdminConfigData {
  system: {
    maintenance_mode: boolean;
    debug_logging: boolean;
    rate_limiting: boolean;
    max_requests_per_minute: number;
    api_timeout: number;
    cache_ttl: number;
  };
  trading: {
    auto_trading_enabled: boolean;
    max_position_size: number;
    risk_level: number;
    stop_loss_percentage: number;
    take_profit_percentage: number;
  };
  wallet: {
    min_deposit: number;
    max_deposit: number;
    withdrawal_fee: number;
    default_currency: string;
  };
  notifications: {
    email_enabled: boolean;
    sms_enabled: boolean;
    slack_enabled: boolean;
    webhook_url: string;
  };
}

export interface BinanceOrderData {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'PENDING_CANCEL' | 'REJECTED' | 'EXPIRED';
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  type: 'LIMIT' | 'MARKET' | 'STOP_LOSS' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT' | 'TAKE_PROFIT_LIMIT';
  side: 'BUY' | 'SELL';
  stopPrice?: string;
  icebergQty?: string;
  time: number;
  updateTime: number;
  isWorking: boolean;
  workingTime: number;
  origQuoteOrderQty: string;
}

export interface BiometricData {
  heartRate: number;
  stressLevel: number;
  focusLevel: number;
  emotionalState: 'calm' | 'excited' | 'stressed' | 'focused';
  recommendedAction: 'trade' | 'wait' | 'stop';
  timestamp: Date;
}

export interface DivineCommandData {
  command: string;
  parameters: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
  timestamp: Date;
}

// Chat and AI types
export interface ChatMessage {
  id: string;
  sender: 'user' | 'waides';
  message: string;
  timestamp: Date;
  personality?: string;
  source?: 'incite' | 'chatgpt' | 'konslang' | 'combined' | 'reasoning' | 'enhanced_bot_memory' | 'waidbot_summon' | 'oracle' | 'error';
  confidence?: number;
  konslangProcessing?: string;
  reasoning?: any[];
}

export interface OracleResponse {
  answer: string;
  source: 'incite' | 'chatgpt' | 'konslang' | 'combined';
  confidence: number;
  konslangProcessing?: string;
}

export interface VisionSettings {
  mode: 'spiritual' | 'analytical' | 'creative' | 'balanced';
  energyLevel: number;
  responsiveness: number;
  depth: number;
}

export interface WaidesSettings {
  selectedOracle: 'oracle' | 'auto' | 'openai' | 'spiritual';
  visionSettings: VisionSettings;
  autoResponses: boolean;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  micPermission: boolean;
  selectedPersonality: string;
  divineMode: boolean;
}