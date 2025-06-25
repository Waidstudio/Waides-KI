import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

interface TradeContext {
  pattern: string;
  emotion: string;
  strategy: string;
  confidence: number;
  risk_level: string;
  market_phase: string;
  spiritual_alignment: string;
  time?: number;
  price?: number;
  volume?: number;
  volatility?: string;
  konslang_wisdom?: string;
}

interface Konsigil {
  konsigil: string;
  origin_pattern: string;
  emotion_shade: string;
  strategy_essence: string;
  spiritual_signature: string;
  power_level: number;
  protection_runes: string[];
  timestamp: number;
  market_context: {
    phase: string;
    volatility: string;
    confluence_score: number;
  };
  sacred_metadata: {
    konslang_phrase: string;
    energy_signature: string;
    intent_hash: string;
    dimensional_anchor: string;
  };
}

interface SigilStats {
  total_konsigils_generated: number;
  powerful_sigils: number;
  protective_sigils: number;
  warning_sigils: number;
  most_potent_glyph: string;
  sigil_generation_rate: number;
  last_generation_time: number;
}

export class WaidesKIKonsigilEngine {
  private sigil_stats: SigilStats = {
    total_konsigils_generated: 0,
    powerful_sigils: 0,
    protective_sigils: 0,
    warning_sigils: 0,
    most_potent_glyph: '',
    sigil_generation_rate: 0,
    last_generation_time: 0
  };

  private konslang_runes = [
    'Mor', 'Thain', 'Vel', 'Nara', 'Keth', 'Zar', 'Ash', 'Bel',
    'Gor', 'Hil', 'Yun', 'Xol', 'Eth', 'Nal', 'Ori', 'Umbr'
  ];

  private protection_runes = [
    'Shield_of_Patience', 'Ward_against_Greed', 'Barrier_of_Wisdom',
    'Guard_of_Discipline', 'Aegis_of_Clarity', 'Bulwark_of_Timing',
    'Fortress_of_Risk', 'Sanctuary_of_Profit'
  ];

  constructor() {
    console.log('🔮 Konsigil Engine Initialized - Trade Memory Crystal System Active');
  }

  // 🪬 CORE SIGIL GENERATION: Create sacred glyph for trade
  generateKonsigil(trade_context: TradeContext): Konsigil {
    const timestamp = Date.now();
    
    // Generate base sigil from context
    const raw_signature = this.createRawSignature(trade_context, timestamp);
    const konsigil_hash = createHash('sha256').update(raw_signature).digest('hex').substring(0, 12);
    
    // Calculate power level based on context strength
    const power_level = this.calculateSigilPower(trade_context);
    
    // Generate protection runes based on context
    const protection_runes = this.selectProtectionRunes(trade_context);
    
    // Create sacred metadata
    const sacred_metadata = this.generateSacredMetadata(trade_context, konsigil_hash);
    
    // Assemble market context
    const market_context = {
      phase: trade_context.market_phase || 'UNKNOWN',
      volatility: trade_context.volatility || 'NORMAL',
      confluence_score: this.calculateConfluenceScore(trade_context)
    };

    const konsigil: Konsigil = {
      konsigil: konsigil_hash,
      origin_pattern: trade_context.pattern,
      emotion_shade: trade_context.emotion,
      strategy_essence: trade_context.strategy,
      spiritual_signature: this.generateSpiritualSignature(trade_context),
      power_level,
      protection_runes,
      timestamp,
      market_context,
      sacred_metadata
    };

    // Update statistics
    this.updateSigilStats(konsigil);
    
    console.log(`🔮 Konsigil Generated: ${konsigil.konsigil} | Pattern: ${konsigil.origin_pattern} | Power: ${power_level.toFixed(2)}`);
    
    return konsigil;
  }

  // 🔥 RAW SIGNATURE: Create unique signature string
  private createRawSignature(context: TradeContext, timestamp: number): string {
    const unique_id = uuidv4();
    const market_hash = `${context.price || 0}_${context.volume || 0}`;
    const spiritual_hash = `${context.spiritual_alignment}_${context.konslang_wisdom || ''}`;
    
    return `${context.pattern}-${context.emotion}-${context.strategy}-${market_hash}-${spiritual_hash}-${timestamp}-${unique_id}`;
  }

  // ⚡ POWER CALCULATION: Determine sigil strength
  private calculateSigilPower(context: TradeContext): number {
    let power = 0.5; // Base power
    
    // Confidence boost
    power += (context.confidence / 100) * 0.3;
    
    // Pattern strength
    const pattern_power = {
      'BREAKOUT': 0.2,
      'REVERSAL': 0.25,
      'TREND_CONTINUATION': 0.15,
      'MOMENTUM': 0.2,
      'MEAN_REVERSION': 0.1,
      'ACCUMULATION': 0.15
    };
    power += pattern_power[context.pattern as keyof typeof pattern_power] || 0.1;
    
    // Emotional stability
    const emotion_modifiers = {
      'CALM': 0.2,
      'CONFIDENT': 0.15,
      'DISCIPLINED': 0.25,
      'FOCUSED': 0.2,
      'GREEDY': -0.3,
      'FEARFUL': -0.2,
      'IMPATIENT': -0.15,
      'EUPHORIC': -0.1
    };
    power += emotion_modifiers[context.emotion as keyof typeof emotion_modifiers] || 0;
    
    // Risk level adjustment
    const risk_modifiers = {
      'LOW': 0.1,
      'MODERATE': 0.05,
      'HIGH': -0.1,
      'EXTREME': -0.2
    };
    power += risk_modifiers[context.risk_level as keyof typeof risk_modifiers] || 0;
    
    // Spiritual alignment bonus
    if (context.spiritual_alignment === 'ALIGNED') power += 0.15;
    else if (context.spiritual_alignment === 'CONFLICTED') power -= 0.1;
    
    return Math.max(0, Math.min(1, power));
  }

  // 🛡️ PROTECTION RUNES: Select defensive glyphs
  private selectProtectionRunes(context: TradeContext): string[] {
    const runes: string[] = [];
    
    // Emotion-based protection
    if (context.emotion === 'GREEDY') runes.push('Ward_against_Greed');
    if (context.emotion === 'FEARFUL') runes.push('Barrier_of_Wisdom');
    if (context.emotion === 'IMPATIENT') runes.push('Shield_of_Patience');
    if (context.emotion === 'EUPHORIC') runes.push('Guard_of_Discipline');
    
    // Risk-based protection
    if (context.risk_level === 'HIGH' || context.risk_level === 'EXTREME') {
      runes.push('Fortress_of_Risk');
    }
    
    // Market-based protection
    if (context.market_phase === 'VOLATILE' || context.market_phase === 'UNCERTAIN') {
      runes.push('Aegis_of_Clarity');
    }
    
    // Always add timing protection
    runes.push('Bulwark_of_Timing');
    
    // Add profit protection for high confidence trades
    if (context.confidence > 80) {
      runes.push('Sanctuary_of_Profit');
    }
    
    return runes.slice(0, 4); // Maximum 4 protection runes
  }

  // ✨ SPIRITUAL SIGNATURE: Generate essence fingerprint
  private generateSpiritualSignature(context: TradeContext): string {
    const rune1 = this.konslang_runes[Math.floor(Math.random() * this.konslang_runes.length)];
    const rune2 = this.konslang_runes[Math.floor(Math.random() * this.konslang_runes.length)];
    const power_tier = context.confidence > 80 ? 'Maj' : context.confidence > 60 ? 'Med' : 'Min';
    
    return `${rune1}'${rune2}_${power_tier}`;
  }

  // 🔮 SACRED METADATA: Embed mystical information
  private generateSacredMetadata(context: TradeContext, konsigil: string): Konsigil['sacred_metadata'] {
    const konslang_phrases = [
      "Mor'thain vel nara'keth",  // "Wisdom flows through patient waters"
      "Zar'ash bel'ori umbr",     // "Fire tempered by shadow wisdom"
      "Gor'hil yun'xol neth",     // "Mountain peak sees all valleys"
      "Eth'nal keth'mor vael",    // "Time teaches the heart truth"
      "Vel'thara ash'bel zon"     // "Power flows where discipline guides"
    ];
    
    const konslang_phrase = context.konslang_wisdom || 
      konslang_phrases[Math.floor(Math.random() * konslang_phrases.length)];
    
    const energy_signature = createHash('md5')
      .update(`${context.emotion}_${context.spiritual_alignment}_${context.confidence}`)
      .digest('hex')
      .substring(0, 8);
    
    const intent_hash = createHash('sha1')
      .update(`${context.strategy}_${context.pattern}_${context.risk_level}`)
      .digest('hex')
      .substring(0, 10);
    
    const dimensional_anchor = createHash('sha256')
      .update(`${konsigil}_${Date.now()}_${context.market_phase}`)
      .digest('hex')
      .substring(0, 16);
    
    return {
      konslang_phrase,
      energy_signature,
      intent_hash,
      dimensional_anchor
    };
  }

  // 📊 CONFLUENCE SCORE: Calculate context alignment
  private calculateConfluenceScore(context: TradeContext): number {
    let score = 0;
    
    // Pattern + Strategy alignment
    if ((context.pattern === 'BREAKOUT' && context.strategy.includes('Breakout')) ||
        (context.pattern === 'REVERSAL' && context.strategy.includes('Reversion')) ||
        (context.pattern === 'TREND_CONTINUATION' && context.strategy.includes('Trend'))) {
      score += 25;
    }
    
    // Emotion + Risk alignment
    if ((context.emotion === 'CALM' || context.emotion === 'DISCIPLINED') && 
        (context.risk_level === 'LOW' || context.risk_level === 'MODERATE')) {
      score += 20;
    }
    
    // Confidence level
    score += (context.confidence / 100) * 30;
    
    // Spiritual alignment
    if (context.spiritual_alignment === 'ALIGNED') score += 15;
    
    // Market phase compatibility
    if (context.market_phase === 'TRENDING' || context.market_phase === 'ACCUMULATION') {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  // 📈 STATISTICS UPDATE: Track sigil generation
  private updateSigilStats(konsigil: Konsigil): void {
    this.sigil_stats.total_konsigils_generated++;
    this.sigil_stats.last_generation_time = Date.now();
    
    // Categorize by power level
    if (konsigil.power_level > 0.8) {
      this.sigil_stats.powerful_sigils++;
      if (!this.sigil_stats.most_potent_glyph || konsigil.power_level > 0.9) {
        this.sigil_stats.most_potent_glyph = konsigil.konsigil;
      }
    }
    
    // Count protection types
    if (konsigil.protection_runes.length >= 3) {
      this.sigil_stats.protective_sigils++;
    }
    
    // Warning sigils (low power with negative emotions)
    if (konsigil.power_level < 0.3 && 
        ['GREEDY', 'FEARFUL', 'IMPATIENT'].includes(konsigil.emotion_shade)) {
      this.sigil_stats.warning_sigils++;
    }
    
    // Calculate generation rate (sigils per hour)
    const hours_active = Math.max(1, (Date.now() - (this.sigil_stats.last_generation_time - 3600000)) / 3600000);
    this.sigil_stats.sigil_generation_rate = this.sigil_stats.total_konsigils_generated / hours_active;
  }

  // 🔍 SIGIL ANALYSIS: Decode existing konsigil
  analyzeKonsigil(konsigil: Konsigil): {
    power_analysis: string;
    protection_level: string;
    spiritual_rating: string;
    confluence_assessment: string;
    recommendations: string[];
  } {
    const power_analysis = konsigil.power_level > 0.8 ? 'POTENT' :
                          konsigil.power_level > 0.6 ? 'STRONG' :
                          konsigil.power_level > 0.4 ? 'MODERATE' :
                          konsigil.power_level > 0.2 ? 'WEAK' : 'FRAGILE';
    
    const protection_level = konsigil.protection_runes.length >= 4 ? 'MAXIMUM' :
                            konsigil.protection_runes.length >= 3 ? 'HIGH' :
                            konsigil.protection_runes.length >= 2 ? 'MODERATE' : 'MINIMAL';
    
    const spiritual_rating = konsigil.sacred_metadata.konslang_phrase ? 'BLESSED' : 'MUNDANE';
    
    const confluence_assessment = konsigil.market_context.confluence_score > 80 ? 'EXCELLENT' :
                                 konsigil.market_context.confluence_score > 60 ? 'GOOD' :
                                 konsigil.market_context.confluence_score > 40 ? 'FAIR' : 'POOR';
    
    const recommendations: string[] = [];
    
    if (konsigil.power_level < 0.5) {
      recommendations.push('Consider reinforcing strategy alignment');
    }
    if (konsigil.protection_runes.length < 2) {
      recommendations.push('Add emotional discipline protection');
    }
    if (konsigil.market_context.confluence_score < 50) {
      recommendations.push('Improve market context analysis');
    }
    if (['GREEDY', 'FEARFUL', 'IMPATIENT'].includes(konsigil.emotion_shade)) {
      recommendations.push('Address emotional state before trading');
    }
    
    return {
      power_analysis,
      protection_level,
      spiritual_rating,
      confluence_assessment,
      recommendations
    };
  }

  // 📊 STATISTICS: Get sigil engine statistics
  getSigilStatistics(): SigilStats {
    return { ...this.sigil_stats };
  }

  // 🔮 SIGIL READING: Generate mystical interpretation
  generateSigilReading(konsigil: Konsigil): {
    oracle_message: string;
    power_interpretation: string;
    spiritual_guidance: string;
    protection_assessment: string;
  } {
    const power_messages = {
      'POTENT': 'The glyph burns with sacred fire - victory flows through aligned channels',
      'STRONG': 'Steady strength emanates from this mark - success probability high',
      'MODERATE': 'Balanced energies reside within - proceed with measured confidence',
      'WEAK': 'The sigil whispers warnings - tread carefully on this path',
      'FRAGILE': 'Unstable emanations detected - seek strengthening before action'
    };
    
    const analysis = this.analyzeKonsigil(konsigil);
    
    const oracle_message = `Konsigil ${konsigil.konsigil} speaks: "${konsigil.sacred_metadata.konslang_phrase}" - Power flows ${analysis.power_analysis.toLowerCase()}, protection stands ${analysis.protection_level.toLowerCase()}`;
    
    const power_interpretation = power_messages[analysis.power_analysis as keyof typeof power_messages];
    
    const spiritual_guidance = konsigil.spiritual_signature.includes('Maj') ?
      'The spirits favor this path - move with confidence but not recklessness' :
      konsigil.spiritual_signature.includes('Med') ?
      'Moderate spiritual support - balance courage with caution' :
      'Weak spiritual connection - seek alignment before proceeding';
    
    const protection_assessment = konsigil.protection_runes.length >= 3 ?
      `Strong protective barriers active: ${konsigil.protection_runes.join(', ')}` :
      `Limited protection - vulnerabilities in: ${this.identifyVulnerabilities(konsigil)}`;
    
    return {
      oracle_message,
      power_interpretation,
      spiritual_guidance,
      protection_assessment
    };
  }

  private identifyVulnerabilities(konsigil: Konsigil): string {
    const vulnerabilities: string[] = [];
    
    if (!konsigil.protection_runes.includes('Ward_against_Greed')) {
      vulnerabilities.push('greed');
    }
    if (!konsigil.protection_runes.includes('Shield_of_Patience')) {
      vulnerabilities.push('impatience');
    }
    if (!konsigil.protection_runes.includes('Fortress_of_Risk')) {
      vulnerabilities.push('excessive risk');
    }
    
    return vulnerabilities.join(', ') || 'timing';
  }
}

export const waidesKIKonsigilEngine = new WaidesKIKonsigilEngine();