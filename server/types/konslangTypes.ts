export interface KonsLangSymbol {
  symbol: string;
  meaning: string;
  power: number;
  alignment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  timestamp: number;
}

export interface KonsLangAnalysis {
  marketMood: 'EUPHORIC' | 'FEARFUL' | 'GREEDY' | 'CONFUSED' | 'BALANCED';
  ethVibration: 'ASCENDING' | 'DESCENDING' | 'OSCILLATING' | 'DORMANT';
  divineAlignment: number;
  tradingWindow: 'SACRED' | 'NORMAL' | 'FORBIDDEN';
  konsMessage: string;
}