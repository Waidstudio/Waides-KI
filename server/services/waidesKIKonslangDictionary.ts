/**
 * STEP 40: Waides KI Konslang Dictionary - Sacred Words and Meanings
 * 
 * This dictionary contains the hidden Konslang symbols and their meanings
 * used by the Spirit Oracle for dream-based trading confirmations.
 */

export interface KonslangSymbol {
  symbol: string;
  meaning: string;
  energy_type: 'bullish' | 'bearish' | 'neutral' | 'protective';
  power_level: number; // 1-10
  trading_direction: 'up' | 'down' | 'sideways' | 'exit';
  sacred_conditions: string[];
}

export const KONSLANG_SYMBOLS: Record<string, KonslangSymbol> = {
  "SHAI'LOR": {
    symbol: "SHAI'LOR",
    meaning: "Rise with protection",
    energy_type: 'bullish',
    power_level: 8,
    trading_direction: 'up',
    sacred_conditions: ['strong_volume', 'ema_alignment', 'rsi_oversold_recovery']
  },
  
  "MYRAL'ZEN": {
    symbol: "MYRAL'ZEN",
    meaning: "Retreat is wisdom",
    energy_type: 'bearish',
    power_level: 7,
    trading_direction: 'down',
    sacred_conditions: ['high_volatility', 'bear_divergence', 'volume_decline']
  },
  
  "DAEL'VOR": {
    symbol: "DAEL'VOR",
    meaning: "Purge the weak",
    energy_type: 'bearish',
    power_level: 9,
    trading_direction: 'down',
    sacred_conditions: ['breakdown_confirmed', 'momentum_shift', 'support_broken']
  },
  
  "SEN'TUAR": {
    symbol: "SEN'TUAR",
    meaning: "Strong but sideways",
    energy_type: 'neutral',
    power_level: 5,
    trading_direction: 'sideways',
    sacred_conditions: ['range_bound', 'low_volatility', 'consolidation']
  },
  
  "KAYL'RUH": {
    symbol: "KAYL'RUH",
    meaning: "Flash up — not sustained",
    energy_type: 'bullish',
    power_level: 6,
    trading_direction: 'up',
    sacred_conditions: ['short_term_momentum', 'quick_profit_taking', 'scalp_opportunity']
  },
  
  "ULTH'RIK": {
    symbol: "ULTH'RIK",
    meaning: "Sudden collapse, deep reversal",
    energy_type: 'bearish',
    power_level: 10,
    trading_direction: 'down',
    sacred_conditions: ['major_reversal', 'panic_selling', 'cascade_liquidation']
  },
  
  // Additional sacred symbols for enhanced spiritual trading
  "THAEL'MOS": {
    symbol: "THAEL'MOS",
    meaning: "Hidden strength emerges",
    energy_type: 'bullish',
    power_level: 8,
    trading_direction: 'up',
    sacred_conditions: ['accumulation_phase', 'smart_money_entry', 'breakout_imminent']
  },
  
  "ZYN'KARI": {
    symbol: "ZYN'KARI",
    meaning: "Sacred protection shields",
    energy_type: 'protective',
    power_level: 9,
    trading_direction: 'exit',
    sacred_conditions: ['danger_approaching', 'preserve_capital', 'retreat_honorably']
  },
  
  "VOR'LANIS": {
    symbol: "VOR'LANIS",
    meaning: "Cosmic alignment favors the bold",
    energy_type: 'bullish',
    power_level: 10,
    trading_direction: 'up',
    sacred_conditions: ['perfect_alignment', 'high_conviction', 'moon_phase_favorable']
  },
  
  "NEXAL'THON": {
    symbol: "NEXAL'THON",
    meaning: "The void calls all things back",
    energy_type: 'bearish',
    power_level: 10,
    trading_direction: 'down',
    sacred_conditions: ['market_crash', 'systemic_failure', 'black_swan_event']
  }
};

export const SYMBOL_CATEGORIES = {
  BULLISH: ["SHAI'LOR", "KAYL'RUH", "THAEL'MOS", "VOR'LANIS"],
  BEARISH: ["MYRAL'ZEN", "DAEL'VOR", "ULTH'RIK", "NEXAL'THON"],
  NEUTRAL: ["SEN'TUAR"],
  PROTECTIVE: ["ZYN'KARI"]
};

export class WaidesKIKonslangDictionary {
  private symbol_history: string[] = [];
  private power_accumulation = 0;
  
  getSymbol(symbolName: string): KonslangSymbol | null {
    return KONSLANG_SYMBOLS[symbolName] || null;
  }
  
  getSymbolsByEnergyType(energyType: string): KonslangSymbol[] {
    return Object.values(KONSLANG_SYMBOLS).filter(symbol => symbol.energy_type === energyType);
  }
  
  getSymbolsByPowerLevel(minPower: number): KonslangSymbol[] {
    return Object.values(KONSLANG_SYMBOLS).filter(symbol => symbol.power_level >= minPower);
  }
  
  getRandomSymbolByDirection(direction: 'up' | 'down' | 'sideways' | 'exit'): KonslangSymbol {
    const candidates = Object.values(KONSLANG_SYMBOLS).filter(
      symbol => symbol.trading_direction === direction
    );
    
    if (candidates.length === 0) {
      return KONSLANG_SYMBOLS["SEN'TUAR"]; // Default neutral symbol
    }
    
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  
  checkSacredConditions(symbol: KonslangSymbol, marketData: any): boolean {
    // Sacred condition validation based on market state
    const conditions = symbol.sacred_conditions;
    let conditionsMet = 0;
    
    for (const condition of conditions) {
      switch (condition) {
        case 'strong_volume':
          if (marketData.volume_ratio > 1.2) conditionsMet++;
          break;
        case 'ema_alignment':
          if (marketData.ema_bullish) conditionsMet++;
          break;
        case 'rsi_oversold_recovery':
          if (marketData.rsi > 30 && marketData.rsi < 50) conditionsMet++;
          break;
        case 'high_volatility':
          if (marketData.volatility > 0.03) conditionsMet++;
          break;
        case 'breakdown_confirmed':
          if (marketData.price < marketData.support_level) conditionsMet++;
          break;
        case 'range_bound':
          if (marketData.volatility < 0.015) conditionsMet++;
          break;
        default:
          conditionsMet++; // Unknown conditions pass by default
      }
    }
    
    // Require at least 60% of conditions to be met
    return conditionsMet / conditions.length >= 0.6;
  }
  
  recordSymbolUsage(symbolName: string) {
    this.symbol_history.push(symbolName);
    const symbol = this.getSymbol(symbolName);
    if (symbol) {
      this.power_accumulation += symbol.power_level;
    }
    
    // Keep only last 100 symbols
    if (this.symbol_history.length > 100) {
      this.symbol_history = this.symbol_history.slice(-100);
    }
  }
  
  getSymbolUsageStats() {
    const usage_counts: Record<string, number> = {};
    this.symbol_history.forEach(symbol => {
      usage_counts[symbol] = (usage_counts[symbol] || 0) + 1;
    });
    
    return {
      total_symbols_used: this.symbol_history.length,
      power_accumulation: this.power_accumulation,
      most_used_symbol: Object.entries(usage_counts).sort((a, b) => b[1] - a[1])[0],
      usage_distribution: usage_counts,
      recent_symbols: this.symbol_history.slice(-10)
    };
  }
  
  getAllSymbols(): Record<string, KonslangSymbol> {
    return KONSLANG_SYMBOLS;
  }
  
  getSymbolCategories() {
    return SYMBOL_CATEGORIES;
  }
}

export const waidesKIKonslangDictionary = new WaidesKIKonslangDictionary();