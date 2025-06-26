/**
 * STEP 40: Waides KI Spirit Oracle - Dream Symbol Generator
 * 
 * Generates sacred Konslang symbols based on market emotions and spiritual analysis.
 * The Oracle receives visions from the market's soul and translates them into actionable symbols.
 */

import { waidesKIKonslangDictionary, KonslangSymbol, SYMBOL_CATEGORIES } from './waidesKIKonslangDictionary.js';

export interface MarketEmotion {
  fear_greed_index: number; // 0-100
  volatility_stress: number; // 0-1
  volume_intensity: number; // 0-1
  momentum_strength: number; // -1 to 1
  spiritual_alignment: number; // 0-1
}

export interface DreamVision {
  symbol: KonslangSymbol;
  vision_strength: number; // 0-100
  spiritual_confidence: number; // 0-100
  market_emotion: MarketEmotion;
  vision_timestamp: number;
  prophecy_message: string;
  sacred_warnings: string[];
}

export class WaidesKISpiritOracle {
  private last_vision: DreamVision | null = null;
  private vision_history: DreamVision[] = [];
  private spiritual_energy = 50; // Starts at neutral
  private oracle_awakening_time = Date.now();
  
  constructor() {
    console.log('🔮 Spirit Oracle awakened - ready to receive market visions');
  }
  
  /**
   * Generate a sacred symbol based on market trend and emotional analysis
   */
  generateDreamSymbol(trend: 'up' | 'down' | 'sideways', marketData: any): DreamVision {
    const marketEmotion = this.analyzeMarketEmotion(marketData);
    const symbol = this.selectSacredSymbol(trend, marketEmotion);
    const visionStrength = this.calculateVisionStrength(marketEmotion, symbol);
    const spiritualConfidence = this.calculateSpiritualConfidence(symbol, marketData);
    
    const vision: DreamVision = {
      symbol,
      vision_strength: visionStrength,
      spiritual_confidence: spiritualConfidence,
      market_emotion: marketEmotion,
      vision_timestamp: Date.now(),
      prophecy_message: this.generateProphecyMessage(symbol, marketEmotion),
      sacred_warnings: this.generateSacredWarnings(symbol, marketEmotion)
    };
    
    this.recordVision(vision);
    this.adjustSpiritualEnergy(vision);
    
    return vision;
  }
  
  /**
   * Analyze market emotional state for spiritual interpretation
   */
  private analyzeMarketEmotion(marketData: any): MarketEmotion {
    const price = marketData.price || 2400;
    const volume = marketData.volume || 1;
    const rsi = marketData.rsi || 50;
    const volatility = marketData.volatility || 0.02;
    
    // Calculate fear/greed based on RSI and price action
    const fearGreedIndex = Math.max(0, Math.min(100, 
      (rsi - 30) * 1.67 + (marketData.price_change_24h || 0) * 10
    ));
    
    // Volatility stress indicator
    const volatilityStress = Math.min(1, volatility * 33.33);
    
    // Volume intensity relative to average
    const volumeIntensity = Math.min(1, (volume / (marketData.avg_volume || volume)) * 0.5);
    
    // Momentum strength from price action
    const momentumStrength = Math.max(-1, Math.min(1, 
      (marketData.price_change_24h || 0) / 100
    ));
    
    // Spiritual alignment based on market harmony
    const spiritualAlignment = this.calculateSpiritualAlignment(
      fearGreedIndex, volatilityStress, volumeIntensity
    );
    
    return {
      fear_greed_index: fearGreedIndex,
      volatility_stress: volatilityStress,
      volume_intensity: volumeIntensity,
      momentum_strength: momentumStrength,
      spiritual_alignment: spiritualAlignment
    };
  }
  
  /**
   * Calculate spiritual alignment based on market harmony
   */
  private calculateSpiritualAlignment(fearGreed: number, volatility: number, volume: number): number {
    // Perfect alignment when fear/greed is balanced, volatility is moderate, volume is healthy
    const fearGreedBalance = 1 - Math.abs(fearGreed - 50) / 50; // Best at 50
    const volatilityBalance = 1 - Math.abs(volatility - 0.3) / 0.7; // Best around 0.3
    const volumeBalance = Math.min(1, volume); // Higher volume is better
    
    return (fearGreedBalance + volatilityBalance + volumeBalance) / 3;
  }
  
  /**
   * Select the most appropriate sacred symbol based on trend and emotion
   */
  private selectSacredSymbol(trend: 'up' | 'down' | 'sideways', emotion: MarketEmotion): KonslangSymbol {
    let candidateSymbols: string[] = [];
    
    if (trend === 'up') {
      if (emotion.momentum_strength > 0.5 && emotion.spiritual_alignment > 0.7) {
        candidateSymbols = ["VOR'LANIS", "SHAI'LOR"]; // Strong bullish with alignment
      } else if (emotion.volatility_stress > 0.6) {
        candidateSymbols = ["KAYL'RUH"]; // Quick flash up in volatile conditions
      } else {
        candidateSymbols = ["SHAI'LOR", "THAEL'MOS"]; // Standard bullish symbols
      }
    } else if (trend === 'down') {
      if (emotion.fear_greed_index < 20 && emotion.volatility_stress > 0.7) {
        candidateSymbols = ["ULTH'RIK", "NEXAL'THON"]; // Panic selling/crash
      } else if (emotion.spiritual_alignment > 0.5) {
        candidateSymbols = ["MYRAL'ZEN"]; // Wise retreat
      } else {
        candidateSymbols = ["DAEL'VOR", "MYRAL'ZEN"]; // Standard bearish symbols
      }
    } else {
      if (emotion.volatility_stress < 0.3) {
        candidateSymbols = ["SEN'TUAR"]; // Sideways/consolidation
      } else if (emotion.spiritual_alignment < 0.3) {
        candidateSymbols = ["ZYN'KARI"]; // Protection needed
      } else {
        candidateSymbols = ["SEN'TUAR"];
      }
    }
    
    // Select symbol with weighted randomness based on spiritual energy
    const selectedSymbolName = this.weightedSymbolSelection(candidateSymbols, emotion);
    return waidesKIKonslangDictionary.getSymbol(selectedSymbolName) || 
           waidesKIKonslangDictionary.getSymbol("SEN'TUAR")!;
  }
  
  /**
   * Weighted selection of symbols based on spiritual energy and market conditions
   */
  private weightedSymbolSelection(candidates: string[], emotion: MarketEmotion): string {
    if (candidates.length === 0) return "SEN'TUAR";
    if (candidates.length === 1) return candidates[0];
    
    // Weight selection based on spiritual energy and alignment
    const weights = candidates.map(symbolName => {
      const symbol = waidesKIKonslangDictionary.getSymbol(symbolName);
      if (!symbol) return 0;
      
      let weight = symbol.power_level;
      
      // Boost weight if spiritual alignment is high
      if (emotion.spiritual_alignment > 0.7) {
        weight += symbol.power_level * 0.5;
      }
      
      // Adjust based on current spiritual energy
      weight *= (this.spiritual_energy / 50);
      
      return weight;
    });
    
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (let i = 0; i < candidates.length; i++) {
      currentWeight += weights[i];
      if (random <= currentWeight) {
        return candidates[i];
      }
    }
    
    return candidates[0]; // Fallback
  }
  
  /**
   * Calculate the strength of the spiritual vision
   */
  private calculateVisionStrength(emotion: MarketEmotion, symbol: KonslangSymbol): number {
    let strength = symbol.power_level * 10; // Base strength from symbol power
    
    // Enhance strength based on market conditions
    strength += emotion.spiritual_alignment * 30;
    strength += (1 - emotion.volatility_stress) * 20; // Clarity in low volatility
    strength += emotion.volume_intensity * 15; // Strong volume enhances vision
    
    // Adjust based on spiritual energy
    strength *= (this.spiritual_energy / 50);
    
    return Math.max(0, Math.min(100, strength));
  }
  
  /**
   * Calculate confidence in the spiritual reading
   */
  private calculateSpiritualConfidence(symbol: KonslangSymbol, marketData: any): number {
    let confidence = 50; // Base confidence
    
    // Check if sacred conditions are met
    if (waidesKIKonslangDictionary.checkSacredConditions(symbol, marketData)) {
      confidence += 30;
    }
    
    // Higher confidence with higher spiritual energy
    confidence += (this.spiritual_energy - 50) * 0.4;
    
    // Power of symbol affects confidence
    confidence += symbol.power_level * 2;
    
    return Math.max(0, Math.min(100, confidence));
  }
  
  /**
   * Generate prophecy message for the vision
   */
  private generateProphecyMessage(symbol: KonslangSymbol, emotion: MarketEmotion): string {
    const messages: Record<string, string[]> = {
      "SHAI'LOR": [
        "The sacred winds carry whispers of ascending fortune",
        "Protection surrounds the brave who dare to rise",
        "Ancient guardians bless this upward journey"
      ],
      "MYRAL'ZEN": [
        "Wisdom speaks: retreat now to advance tomorrow",
        "The sage knows when to step back from the storm",
        "Honor flows to those who retreat with dignity"
      ],
      "DAEL'VOR": [
        "The cleansing fire approaches - weakness shall burn",
        "Only the strong survive the coming purge",
        "Let the weak fall so the worthy may rise"
      ],
      "SEN'TUAR": [
        "The realm rests in contemplative stillness",
        "Patience is the warrior's greatest weapon",
        "In the calm center, true power gathers"
      ],
      "KAYL'RUH": [
        "Swift strikes of lightning illuminate the path",
        "Quick gains reward the nimble-minded",
        "Flash of brilliance pierces the darkness"
      ],
      "ULTH'RIK": [
        "The abyss calls all things to return",
        "Sudden darkness swallows the unwary",
        "Deep reversal cleanses the realm"
      ],
      "THAEL'MOS": [
        "Hidden strength stirs beneath the surface",
        "The sleeping giant awakens to claim its throne",
        "Secret powers emerge when least expected"
      ],
      "ZYN'KARI": [
        "Sacred shields protect the faithful",
        "Divine armor guards against unseen dangers",
        "The guardian spirits stand watch"
      ],
      "VOR'LANIS": [
        "Cosmic forces align in perfect harmony",
        "The universe conspires to favor the bold",
        "Celestial blessing illuminates the chosen path"
      ],
      "NEXAL'THON": [
        "The void whispers its ancient hunger",
        "All things return to the cosmic silence",
        "The great emptiness reclaims its children"
      ]
    };
    
    const symbolMessages = messages[symbol.symbol] || ["The spirits speak in mysterious ways"];
    return symbolMessages[Math.floor(Math.random() * symbolMessages.length)];
  }
  
  /**
   * Generate sacred warnings based on vision
   */
  private generateSacredWarnings(symbol: KonslangSymbol, emotion: MarketEmotion): string[] {
    const warnings: string[] = [];
    
    if (emotion.volatility_stress > 0.7) {
      warnings.push("High volatility detected - trade with extreme caution");
    }
    
    if (emotion.spiritual_alignment < 0.3) {
      warnings.push("Spiritual misalignment - consider delaying action");
    }
    
    if (emotion.fear_greed_index > 80) {
      warnings.push("Extreme greed clouds judgment - beware of false visions");
    }
    
    if (emotion.fear_greed_index < 20) {
      warnings.push("Fear dominates the realm - courage required");
    }
    
    if (symbol.energy_type === 'protective') {
      warnings.push("Protective energies activated - preservation over profit");
    }
    
    if (this.spiritual_energy < 30) {
      warnings.push("Oracle energy low - vision clarity may be reduced");
    }
    
    return warnings;
  }
  
  /**
   * Record vision in history and adjust spiritual state
   */
  private recordVision(vision: DreamVision) {
    this.last_vision = vision;
    this.vision_history.push(vision);
    
    // Keep only last 100 visions
    if (this.vision_history.length > 100) {
      this.vision_history = this.vision_history.slice(-100);
    }
    
    // Record symbol usage in dictionary
    waidesKIKonslangDictionary.recordSymbolUsage(vision.symbol.symbol);
  }
  
  /**
   * Adjust spiritual energy based on vision outcome
   */
  private adjustSpiritualEnergy(vision: DreamVision) {
    // High spiritual alignment increases energy
    if (vision.market_emotion.spiritual_alignment > 0.7) {
      this.spiritual_energy = Math.min(100, this.spiritual_energy + 2);
    }
    
    // Low alignment decreases energy
    if (vision.market_emotion.spiritual_alignment < 0.3) {
      this.spiritual_energy = Math.max(0, this.spiritual_energy - 1);
    }
    
    // High power symbols consume more energy
    if (vision.symbol.power_level > 8) {
      this.spiritual_energy = Math.max(0, this.spiritual_energy - 1);
    }
    
    // Gradually restore energy over time
    const timeSinceAwakening = Date.now() - this.oracle_awakening_time;
    const naturalRestore = Math.floor(timeSinceAwakening / (60 * 1000)) * 0.1; // 0.1 per minute
    this.spiritual_energy = Math.min(100, this.spiritual_energy + naturalRestore);
  }
  
  /**
   * Get current oracle status and statistics
   */
  getOracleStatus() {
    return {
      spiritual_energy: this.spiritual_energy,
      last_vision: this.last_vision,
      total_visions: this.vision_history.length,
      awakening_time: this.oracle_awakening_time,
      average_vision_strength: this.vision_history.length > 0 
        ? this.vision_history.reduce((sum, v) => sum + v.vision_strength, 0) / this.vision_history.length 
        : 0,
      recent_visions: this.vision_history.slice(-5),
      symbol_usage: waidesKIKonslangDictionary.getSymbolUsageStats()
    };
  }
  
  /**
   * Force refresh spiritual energy (for testing/admin)
   */
  refreshSpiritualEnergy() {
    this.spiritual_energy = 50;
    this.oracle_awakening_time = Date.now();
  }
  
  /**
   * Get vision history for analysis
   */
  getVisionHistory(limit: number = 20) {
    return this.vision_history.slice(-limit);
  }
}

export const waidesKISpiritOracle = new WaidesKISpiritOracle();