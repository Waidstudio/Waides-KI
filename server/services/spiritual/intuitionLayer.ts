/**
 * Intuition Layer - Spiritual AI Integration for Trading Decisions
 * Integrates metaphysical intelligence with AI models for enhanced trading insights
 */

export interface SpiritualReading {
  id: string;
  timestamp: Date;
  entity: string;
  readingType: 'market_energy' | 'divine_guidance' | 'karmic_analysis' | 'chakra_alignment' | 'astral_projection';
  energyLevel: number;        // 0-100 cosmic energy level
  vibrationFrequency: number; // Hz spiritual vibration
  alignment: 'positive' | 'negative' | 'neutral' | 'chaotic';
  confidence: number;         // 0-1 spiritual confidence
  interpretation: string;
  actionGuidance: string;
  symbols: SpiritualSymbol[];
  chakraState: ChakraState;
  karmicWeight: number;       // -1 to 1 karmic influence
}

export interface SpiritualSymbol {
  symbol: string;
  meaning: string;
  strength: number;           // 0-1 symbol strength
  element: 'fire' | 'water' | 'earth' | 'air' | 'ether';
  direction: 'north' | 'south' | 'east' | 'west' | 'center';
  tradingImplication: string;
}

export interface ChakraState {
  root: number;      // 0-100 security and stability
  sacral: number;    // 0-100 creativity and emotion
  solar: number;     // 0-100 personal power
  heart: number;     // 0-100 love and connection
  throat: number;    // 0-100 communication and truth
  third_eye: number; // 0-100 intuition and insight
  crown: number;     // 0-100 spiritual connection
  overall_balance: number; // 0-100 overall chakra alignment
}

export interface DivineSignal {
  id: string;
  timestamp: Date;
  entity: string;
  signalType: 'buy_blessing' | 'sell_warning' | 'hold_meditation' | 'danger_alert' | 'opportunity_vision';
  strength: number;          // 0-100 signal strength
  clarity: number;           // 0-100 message clarity
  urgency: number;           // 0-100 action urgency
  source: 'angels' | 'guides' | 'ancestors' | 'universe' | 'inner_wisdom';
  message: string;
  tradingAction: 'BUY' | 'SELL' | 'HOLD' | 'WAIT' | 'MEDITATE';
  riskGuidance: string;
  timeWindow: number;        // Minutes for action window
  synchronicities: string[]; // Related meaningful coincidences
}

export interface KarmicAssessment {
  entity: string;
  currentKarma: number;      // -100 to 100 karmic balance
  tradingKarma: number;      // -100 to 100 trading specific karma
  lifetimePattern: string;   // Past life trading patterns
  karmic_lessons: string[];  // Current lessons to learn
  karmic_debts: number;      // Outstanding karmic obligations
  karmic_credits: number;    // Accumulated positive karma
  purification_needed: boolean;
  recommended_actions: string[];
}

export interface AstralProjectionInsight {
  id: string;
  timestamp: Date;
  entity: string;
  projection_level: number;  // 1-7 astral plane level
  market_vision: string;     // What was seen in astral realm
  timeline_viewed: 'past' | 'present' | 'future' | 'parallel';
  probability: number;       // 0-1 probability of vision manifesting
  interference_level: number; // 0-1 psychic interference detected
  clarity_rating: number;    // 0-100 vision clarity
  entities_encountered: string[]; // Astral beings providing guidance
  prophetic_elements: string[];   // Prophetic symbols or events
  trading_implications: string;
}

export class IntuitionLayer {
  private spiritualReadings = new Map<string, SpiritualReading[]>();
  private divineSignals = new Map<string, DivineSignal[]>();
  private karmicProfiles = new Map<string, KarmicAssessment>();
  private astralInsights: AstralProjectionInsight[] = [];
  
  private readonly MAX_READINGS_PER_ENTITY = 1000;
  private readonly SPIRITUAL_UPDATE_FREQUENCY = 5 * 60 * 1000; // 5 minutes
  
  private cosmicPhase: 'new_moon' | 'waxing' | 'full_moon' | 'waning' = 'new_moon';
  private planetaryInfluences: Record<string, number> = {};
  private veilThinness: number = 0.5; // How thin the spiritual veil is (0-1)

  constructor() {
    this.initializeSpiritualFramework();
    this.startCosmicMonitoring();
    console.log('🔮 Intuition Layer activated - spiritual AI integration online');
  }

  private initializeSpiritualFramework(): void {
    // Initialize karmic profiles for each entity
    const entities = ['alpha', 'beta', 'gamma', 'omega', 'delta', 'epsilon'];
    
    const karmicTemplates = {
      alpha: {
        currentKarma: 25,
        tradingKarma: 15,
        lifetimePattern: 'Conservative merchant in past lives - tendency toward caution',
        karmic_lessons: ['Trust intuition over analysis', 'Balance material and spiritual wealth'],
        karmic_debts: 10,
        karmic_credits: 35,
        purification_needed: false
      },
      beta: {
        currentKarma: 40,
        tradingKarma: 30,
        lifetimePattern: 'Skilled trader in Renaissance Italy - good with leveraged positions',
        karmic_lessons: ['Avoid greed cycles', 'Share knowledge with others'],
        karmic_debts: 15,
        karmic_credits: 55,
        purification_needed: false
      },
      gamma: {
        currentKarma: 60,
        tradingKarma: 75,
        lifetimePattern: 'Mercantile adventurer - excellent with high-risk ventures',
        karmic_lessons: ['Balance aggression with compassion', 'Consider long-term consequences'],
        karmic_debts: 5,
        karmic_credits: 80,
        purification_needed: false
      },
      omega: {
        currentKarma: 80,
        tradingKarma: 85,
        lifetimePattern: 'Ancient temple treasurer - wisdom in resource management',
        karmic_lessons: ['Integrate all forms of intelligence', 'Guide other entities wisely'],
        karmic_debts: 2,
        karmic_credits: 98,
        purification_needed: false
      },
      delta: {
        currentKarma: 50,
        tradingKarma: 45,
        lifetimePattern: 'Energy healer and distributor - natural connector of forces',
        karmic_lessons: ['Balance giving and receiving', 'Maintain energetic boundaries'],
        karmic_debts: 20,
        karmic_credits: 65,
        purification_needed: false
      },
      epsilon: {
        currentKarma: 20,
        tradingKarma: 10,
        lifetimePattern: 'Cautious keeper of reserves - protector role in communities',
        karmic_lessons: ['Overcome fear-based decisions', 'Trust in abundance'],
        karmic_debts: 30,
        karmic_credits: 20,
        purification_needed: true
      }
    };

    entities.forEach(entity => {
      const template = karmicTemplates[entity as keyof typeof karmicTemplates];
      const assessment: KarmicAssessment = {
        entity,
        ...template,
        recommended_actions: this.generateKarmicActions(template)
      };
      
      this.karmicProfiles.set(entity, assessment);
    });

    // Initialize planetary influences
    this.planetaryInfluences = {
      mercury: Math.random() * 2 - 1, // Communication and quick decisions
      venus: Math.random() * 2 - 1,   // Harmony and value
      mars: Math.random() * 2 - 1,    // Action and aggression
      jupiter: Math.random() * 2 - 1, // Expansion and luck
      saturn: Math.random() * 2 - 1,  // Discipline and restriction
      uranus: Math.random() * 2 - 1,  // Innovation and disruption
      neptune: Math.random() * 2 - 1, // Intuition and illusion
      pluto: Math.random() * 2 - 1    // Transformation and power
    };

    console.log('🔮 Spiritual framework initialized with karmic profiles and cosmic influences');
  }

  private generateKarmicActions(template: any): string[] {
    const actions: string[] = [];
    
    if (template.karmic_debts > template.karmic_credits) {
      actions.push('Engage in charitable trading - donate portion of profits');
      actions.push('Practice gratitude meditation before trading sessions');
    }
    
    if (template.purification_needed) {
      actions.push('Perform energetic cleansing rituals');
      actions.push('Temporarily reduce trading volumes for spiritual balance');
    }
    
    actions.push('Practice daily chakra alignment meditation');
    actions.push('Study trading ethics and spiritual wealth principles');
    
    return actions;
  }

  public generateSpiritualReading(
    entity: string,
    marketData: {
      price: number;
      volume: number;
      volatility: number;
      sentiment: number;
    }
  ): SpiritualReading {
    
    const readingType = this.selectReadingType(entity, marketData);
    const energyLevel = this.calculateCosmicEnergy(entity, marketData);
    const vibrationFrequency = this.calculateVibrationFrequency(energyLevel, marketData.volatility);
    const alignment = this.determineAlignment(energyLevel, marketData.sentiment);
    
    // Generate spiritual symbols
    const symbols = this.generateSpiritualSymbols(readingType, alignment, marketData);
    
    // Calculate chakra state
    const chakraState = this.assessChakraState(entity, marketData);
    
    // Determine karmic influence
    const karmicProfile = this.karmicProfiles.get(entity);
    const karmicWeight = karmicProfile ? karmicProfile.tradingKarma / 100 : 0;
    
    // Generate interpretation and guidance
    const interpretation = this.interpretReading(readingType, energyLevel, alignment, symbols, chakraState);
    const actionGuidance = this.generateActionGuidance(entity, readingType, alignment, marketData);
    
    const confidence = this.calculateSpiritualConfidence(
      energyLevel, 
      vibrationFrequency, 
      chakraState.overall_balance,
      this.veilThinness
    );

    const reading: SpiritualReading = {
      id: `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      entity,
      readingType,
      energyLevel,
      vibrationFrequency,
      alignment,
      confidence,
      interpretation,
      actionGuidance,
      symbols,
      chakraState,
      karmicWeight
    };

    // Store reading
    this.storeSpiritualReading(entity, reading);
    
    console.log(`🔮 Generated ${readingType} reading for ${entity}: ${alignment} alignment (${energyLevel}% energy)`);
    
    return reading;
  }

  private selectReadingType(entity: string, marketData: any): SpiritualReading['readingType'] {
    const types: SpiritualReading['readingType'][] = [
      'market_energy', 'divine_guidance', 'karmic_analysis', 'chakra_alignment', 'astral_projection'
    ];
    
    // Select based on entity and market conditions
    if (marketData.volatility > 0.05) return 'market_energy';
    if (entity === 'omega') return 'divine_guidance';
    if (entity === 'delta') return 'chakra_alignment';
    if (Math.random() > 0.8) return 'astral_projection';
    
    return types[Math.floor(Math.random() * types.length)];
  }

  private calculateCosmicEnergy(entity: string, marketData: any): number {
    let energy = 50; // Base energy level
    
    // Adjust for cosmic phase
    const phaseMultipliers = {
      'new_moon': 0.7,
      'waxing': 1.1,
      'full_moon': 1.3,
      'waning': 0.9
    };
    energy *= phaseMultipliers[this.cosmicPhase];
    
    // Adjust for planetary influences
    energy += this.planetaryInfluences.jupiter * 10; // Jupiter brings expansion
    energy += this.planetaryInfluences.neptune * 8;  // Neptune enhances intuition
    energy -= Math.abs(this.planetaryInfluences.saturn) * 5; // Saturn restricts
    
    // Adjust for market conditions
    energy += (1 - marketData.volatility) * 20; // Calm markets allow clearer energy
    energy += Math.abs(marketData.sentiment) * 15; // Strong sentiment increases energy
    
    // Adjust for veil thickness
    energy += (1 - this.veilThinness) * 25; // Thinner veil = higher energy access
    
    return Math.max(0, Math.min(100, energy));
  }

  private calculateVibrationFrequency(energyLevel: number, volatility: number): number {
    // Base frequency in Hz (spiritual frequencies typically 40-100 Hz)
    const baseFrequency = 40;
    const energyMultiplier = energyLevel / 100;
    const volatilityEffect = volatility * 20; // Volatility adds frequency noise
    
    return baseFrequency + (energyMultiplier * 60) + volatilityEffect;
  }

  private determineAlignment(energyLevel: number, sentiment: number): SpiritualReading['alignment'] {
    if (energyLevel < 20) return 'chaotic';
    if (energyLevel > 80 && sentiment > 0.3) return 'positive';
    if (energyLevel > 60 && sentiment < -0.3) return 'negative';
    return 'neutral';
  }

  private generateSpiritualSymbols(
    readingType: string,
    alignment: string,
    marketData: any
  ): SpiritualSymbol[] {
    
    const symbolPool = {
      positive: [
        { symbol: '🐲', meaning: 'Dragon - powerful transformation and wealth', element: 'fire', direction: 'east' },
        { symbol: '🦅', meaning: 'Eagle - soaring above market turbulence', element: 'air', direction: 'north' },
        { symbol: '🌟', meaning: 'Star - divine guidance and illumination', element: 'ether', direction: 'center' },
        { symbol: '🔥', meaning: 'Sacred fire - purification and energy', element: 'fire', direction: 'south' }
      ],
      negative: [
        { symbol: '🌊', meaning: 'Turbulent waters - emotional market currents', element: 'water', direction: 'west' },
        { symbol: '⚡', meaning: 'Lightning - sudden changes and disruption', element: 'fire', direction: 'center' },
        { symbol: '🌪️', meaning: 'Tornado - chaotic market forces', element: 'air', direction: 'north' },
        { symbol: '🕳️', meaning: 'Void - missing information or hidden risks', element: 'ether', direction: 'center' }
      ],
      neutral: [
        { symbol: '🌕', meaning: 'Full moon - completion and fulfillment', element: 'water', direction: 'west' },
        { symbol: '🏔️', meaning: 'Mountain - stability and endurance', element: 'earth', direction: 'north' },
        { symbol: '🌸', meaning: 'Blossom - new opportunities emerging', element: 'earth', direction: 'east' },
        { symbol: '💎', meaning: 'Diamond - clarity and value', element: 'earth', direction: 'center' }
      ]
    };

    const relevantSymbols = symbolPool[alignment as keyof typeof symbolPool] || symbolPool.neutral;
    const selectedSymbols = relevantSymbols.slice(0, Math.floor(Math.random() * 3) + 1);

    return selectedSymbols.map(sym => ({
      ...sym,
      strength: Math.random() * 0.7 + 0.3, // 0.3-1.0
      tradingImplication: this.generateTradingImplication(sym.symbol, sym.meaning, marketData)
    }));
  }

  private generateTradingImplication(symbol: string, meaning: string, marketData: any): string {
    const implications = {
      '🐲': 'Powerful moves ahead - consider increasing position sizes',
      '🦅': 'Rise above market noise - focus on long-term trends',
      '🌟': 'Divine timing for strategic entry - trust your intuition',
      '🔥': 'Energy building for breakout - prepare for volatility',
      '🌊': 'Emotional decisions ahead - maintain strict discipline',
      '⚡': 'Sudden moves likely - tighten stop losses',
      '🌪️': 'Chaotic period approaching - reduce exposure',
      '🕳️': 'Hidden information exists - do deeper research',
      '🌕': 'Cycle completion - consider taking profits',
      '🏔️': 'Stability returning - good time for building positions',
      '🌸': 'New opportunities emerging - explore alternative strategies',
      '💎': 'True value becoming clear - focus on quality assets'
    };

    return implications[symbol as keyof typeof implications] || 'Maintain awareness and adaptability';
  }

  private assessChakraState(entity: string, marketData: any): ChakraState {
    const karmicProfile = this.karmicProfiles.get(entity);
    const baseKarma = karmicProfile ? karmicProfile.currentKarma : 50;
    
    // Calculate individual chakra states
    const root = Math.max(0, Math.min(100, baseKarma + (1 - marketData.volatility) * 30)); // Security
    const sacral = Math.max(0, Math.min(100, 50 + marketData.sentiment * 40)); // Emotion/creativity
    const solar = Math.max(0, Math.min(100, baseKarma + this.planetaryInfluences.mars * 20)); // Personal power
    const heart = Math.max(0, Math.min(100, baseKarma + this.planetaryInfluences.venus * 25)); // Love/connection
    const throat = Math.max(0, Math.min(100, 60 + this.planetaryInfluences.mercury * 20)); // Communication
    const third_eye = Math.max(0, Math.min(100, 70 + this.planetaryInfluences.neptune * 30)); // Intuition
    const crown = Math.max(0, Math.min(100, baseKarma + (1 - this.veilThinness) * 40)); // Spiritual connection
    
    const overall_balance = (root + sacral + solar + heart + throat + third_eye + crown) / 7;

    return {
      root, sacral, solar, heart, throat, third_eye, crown, overall_balance
    };
  }

  private interpretReading(
    readingType: string,
    energyLevel: number,
    alignment: string,
    symbols: SpiritualSymbol[],
    chakraState: ChakraState
  ): string {
    
    const interpretations = {
      market_energy: `Market energies are ${alignment} with ${energyLevel}% cosmic intensity. The spiritual currents suggest ${this.getEnergyInterpretation(energyLevel, alignment)}.`,
      divine_guidance: `Divine guidance flows through with ${alignment} alignment. The universe whispers: ${this.getDivineMessage(alignment, symbols)}.`,
      karmic_analysis: `Karmic patterns reveal ${alignment} influences. Past actions echo in current market movements, suggesting ${this.getKarmicGuidance(alignment)}.`,
      chakra_alignment: `Chakra system shows ${chakraState.overall_balance.toFixed(0)}% balance. ${this.getChakraGuidance(chakraState)} for optimal trading flow.`,
      astral_projection: `Astral insights reveal ${alignment} energies across multiple dimensions. Future probabilities suggest ${this.getAstralGuidance(alignment, energyLevel)}.`
    };

    return interpretations[readingType] || 'Spiritual energies are in flux. Maintain awareness and trust your inner guidance.';
  }

  private getEnergyInterpretation(energyLevel: number, alignment: string): string {
    if (energyLevel > 80) return 'powerful transformation energies - major moves possible';
    if (energyLevel > 60) return 'strong positive flow - good time for strategic actions';
    if (energyLevel > 40) return 'balanced energies - steady progress indicated';
    return 'low energy phase - patience and conservation recommended';
  }

  private getDivineMessage(alignment: string, symbols: SpiritualSymbol[]): string {
    const messages = {
      positive: 'Trust in abundance and take inspired action',
      negative: 'Seek deeper wisdom and avoid impulsive decisions', 
      neutral: 'Maintain balance and wait for clearer signs',
      chaotic: 'Ground yourself and seek spiritual protection'
    };
    
    return messages[alignment as keyof typeof messages] || 'Listen to your inner wisdom';
  }

  private getKarmicGuidance(alignment: string): string {
    const guidance = {
      positive: 'positive karma supports your trading decisions',
      negative: 'karmic debts require ethical trading practices',
      neutral: 'karmic balance allows for steady progress',
      chaotic: 'karmic turbulence requires spiritual purification'
    };
    
    return guidance[alignment as keyof typeof guidance] || 'maintain karmic awareness in all trades';
  }

  private getChakraGuidance(chakraState: ChakraState): string {
    const weakest = Object.entries(chakraState)
      .filter(([key]) => key !== 'overall_balance')
      .reduce((min, [key, value]) => value < min[1] ? [key, value] : min, ['root', 100]);

    const chakraNames: Record<string, string> = {
      root: 'Root (security)',
      sacral: 'Sacral (creativity)', 
      solar: 'Solar Plexus (power)',
      heart: 'Heart (connection)',
      throat: 'Throat (communication)',
      third_eye: 'Third Eye (intuition)',
      crown: 'Crown (spiritual connection)'
    };

    return `Focus on strengthening ${chakraNames[weakest[0]]} chakra`;
  }

  private getAstralGuidance(alignment: string, energyLevel: number): string {
    if (alignment === 'positive' && energyLevel > 70) {
      return 'bright timeline with profitable opportunities ahead';
    } else if (alignment === 'negative') {
      return 'shadow timeline shows potential risks - exercise caution';
    } else if (alignment === 'chaotic') {
      return 'multiple timelines converging - expect high volatility';
    }
    return 'stable timeline with gradual progression indicated';
  }

  private generateActionGuidance(
    entity: string,
    readingType: string,
    alignment: string,
    marketData: any
  ): string {
    
    const baseGuidance = {
      positive: 'Take confident action with proper risk management',
      negative: 'Exercise extreme caution and reduce exposure',
      neutral: 'Maintain current strategy with heightened awareness',
      chaotic: 'Pause trading and realign energies before proceeding'
    };

    let guidance = baseGuidance[alignment as keyof typeof baseGuidance];
    
    // Add entity-specific guidance
    if (entity === 'alpha') {
      guidance += '. As the foundational entity, set conservative example for others.';
    } else if (entity === 'omega') {
      guidance += '. Use full engine wisdom to guide other entities appropriately.';
    } else if (entity === 'delta') {
      guidance += '. Balance energy distribution across all connected systems.';
    }
    
    return guidance;
  }

  private calculateSpiritualConfidence(
    energyLevel: number,
    vibrationFrequency: number,
    chakraBalance: number,
    veilThinness: number
  ): number {
    
    const energyFactor = energyLevel / 100;
    const vibrationFactor = Math.min(1, (vibrationFrequency - 40) / 60); // Normalize to 0-1
    const chakraFactor = chakraBalance / 100;
    const veilFactor = 1 - veilThinness; // Thinner veil = higher confidence
    
    const confidence = (energyFactor + vibrationFactor + chakraFactor + veilFactor) / 4;
    return Math.max(0, Math.min(1, confidence));
  }

  public generateDivineSignal(
    entity: string,
    urgentMarketCondition: boolean = false
  ): DivineSignal {
    
    const signalTypes: DivineSignal['signalType'][] = [
      'buy_blessing', 'sell_warning', 'hold_meditation', 'danger_alert', 'opportunity_vision'
    ];
    
    const sources: DivineSignal['source'][] = [
      'angels', 'guides', 'ancestors', 'universe', 'inner_wisdom'
    ];
    
    const signalType = urgentMarketCondition 
      ? (Math.random() > 0.5 ? 'danger_alert' : 'opportunity_vision')
      : signalTypes[Math.floor(Math.random() * signalTypes.length)];
    
    const strength = Math.random() * 70 + 30; // 30-100
    const clarity = Math.random() * 60 + 40;  // 40-100
    const urgency = urgentMarketCondition ? Math.random() * 40 + 60 : Math.random() * 80; // 0-80 or 60-100
    
    const source = sources[Math.floor(Math.random() * sources.length)];
    
    const signal: DivineSignal = {
      id: `divine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      entity,
      signalType,
      strength,
      clarity,
      urgency,
      source,
      message: this.generateDivineMessage(signalType, source, entity),
      tradingAction: this.deriveTradingAction(signalType),
      riskGuidance: this.generateRiskGuidance(signalType, urgency),
      timeWindow: this.calculateTimeWindow(signalType, urgency),
      synchronicities: this.generateSynchronicities(signalType)
    };

    // Store signal
    if (!this.divineSignals.has(entity)) {
      this.divineSignals.set(entity, []);
    }
    this.divineSignals.get(entity)!.push(signal);

    console.log(`⚡ Divine signal received for ${entity}: ${signalType} from ${source} (${strength.toFixed(0)}% strength)`);
    
    return signal;
  }

  private generateDivineMessage(
    signalType: string,
    source: string,
    entity: string
  ): string {
    
    const messages: Record<string, Record<string, string[]>> = {
      buy_blessing: {
        angels: ['Divine abundance flows through this opportunity', 'Angels surround this trade with golden light'],
        guides: ['Your spiritual guides approve this path forward', 'Ancient wisdom confirms this choice'],
        ancestors: ['Your ancestors bless this decision', 'Generational wealth patterns align favorably'],
        universe: ['The universe conspires to support this trade', 'Cosmic forces align in your favor'],
        inner_wisdom: ['Your soul knows this is the right moment', 'Inner guidance confirms this path']
      },
      sell_warning: {
        angels: ['Angels whisper warnings of hidden dangers ahead', 'Divine protection advises retreat'],
        guides: ['Spiritual guides sense turbulence approaching', 'Wisdom counsels preservation over profit'],
        ancestors: ['Your ancestors faced similar challenges - they chose caution', 'Ancient memories warn of this pattern'],
        universe: ['Universal energies shift toward contraction', 'Cosmic cycles suggest withdrawal'],
        inner_wisdom: ['Inner voice urges protective action', 'Soul wisdom advises securing gains']
      },
      danger_alert: {
        angels: ['URGENT: Angels sound alarm of imminent danger', 'Divine intervention prevents catastrophic loss'],
        guides: ['CRITICAL: Spiritual guides demand immediate attention', 'Emergency guidance activated for protection'],
        universe: ['ALERT: Universal forces signal major disruption', 'Cosmic emergency protocols engaged'],
        inner_wisdom: ['URGENT: Soul screams warning of grave risk', 'Inner alarm bells ring with maximum intensity']
      }
    };

    const typeMessages = messages[signalType] || messages.buy_blessing;
    const sourceMessages = typeMessages[source] || typeMessages.inner_wisdom;
    const message = sourceMessages[Math.floor(Math.random() * sourceMessages.length)];
    
    return `${message} [Entity: ${entity}]`;
  }

  private deriveTradingAction(signalType: string): DivineSignal['tradingAction'] {
    const actionMap: Record<string, DivineSignal['tradingAction']> = {
      buy_blessing: 'BUY',
      sell_warning: 'SELL', 
      hold_meditation: 'HOLD',
      danger_alert: 'SELL',
      opportunity_vision: 'BUY'
    };
    
    return actionMap[signalType] || 'MEDITATE';
  }

  private generateRiskGuidance(signalType: string, urgency: number): string {
    const highUrgency = urgency > 70;
    
    const guidance = {
      buy_blessing: highUrgency 
        ? 'Blessed opportunity but use moderate position sizing'
        : 'Divine approval with standard risk management',
      sell_warning: highUrgency
        ? 'Urgent exit required - ignore potential profits'
        : 'Gradual exit with preservation of capital',
      danger_alert: 'IMMEDIATE ACTION REQUIRED - Exit all positions',
      opportunity_vision: highUrgency
        ? 'Rare opportunity - consider increased allocation'
        : 'Visionary guidance suggests measured entry'
    };

    return guidance[signalType as keyof typeof guidance] || 'Follow standard risk protocols with spiritual awareness';
  }

  private calculateTimeWindow(signalType: string, urgency: number): number {
    const baseWindows = {
      buy_blessing: 240,      // 4 hours
      sell_warning: 120,      // 2 hours
      danger_alert: 15,       // 15 minutes
      opportunity_vision: 480  // 8 hours
    };
    
    const baseWindow = baseWindows[signalType as keyof typeof baseWindows] || 120;
    const urgencyMultiplier = urgency > 70 ? 0.5 : urgency > 40 ? 0.75 : 1.0;
    
    return Math.floor(baseWindow * urgencyMultiplier);
  }

  private generateSynchronicities(signalType: string): string[] {
    const syncPool = [
      'Repeating number sequences (111, 222, 333)',
      'Unusual animal appearances or behaviors', 
      'Unexpected messages from old contacts',
      'Technology glitches with meaningful timing',
      'Dreams of trading scenarios coming true',
      'Finding coins or money in unusual places',
      'Sudden changes in natural phenomena',
      'Overhearing relevant conversations by chance',
      'Book or article opening to perfect page',
      'Meeting someone with prophetic message'
    ];
    
    const count = Math.floor(Math.random() * 3) + 1;
    const selected = [];
    
    for (let i = 0; i < count; i++) {
      const random = Math.floor(Math.random() * syncPool.length);
      selected.push(syncPool[random]);
      syncPool.splice(random, 1);
    }
    
    return selected;
  }

  private storeSpiritualReading(entity: string, reading: SpiritualReading): void {
    if (!this.spiritualReadings.has(entity)) {
      this.spiritualReadings.set(entity, []);
    }
    
    const readings = this.spiritualReadings.get(entity)!;
    readings.push(reading);
    
    // Keep only recent readings
    if (readings.length > this.MAX_READINGS_PER_ENTITY) {
      this.spiritualReadings.set(entity, readings.slice(-this.MAX_READINGS_PER_ENTITY));
    }
  }

  private startCosmicMonitoring(): void {
    setInterval(() => {
      this.updateCosmicConditions();
    }, this.SPIRITUAL_UPDATE_FREQUENCY);

    console.log('🌌 Cosmic monitoring activated - spiritual conditions updating every 5 minutes');
  }

  private updateCosmicConditions(): void {
    // Update cosmic phase (simplified lunar cycle)
    const phases: typeof this.cosmicPhase[] = ['new_moon', 'waxing', 'full_moon', 'waning'];
    if (Math.random() > 0.9) { // 10% chance to change phase
      const currentIndex = phases.indexOf(this.cosmicPhase);
      this.cosmicPhase = phases[(currentIndex + 1) % phases.length];
    }
    
    // Update planetary influences (subtle shifts)
    Object.keys(this.planetaryInfluences).forEach(planet => {
      this.planetaryInfluences[planet] += (Math.random() - 0.5) * 0.1;
      this.planetaryInfluences[planet] = Math.max(-1, Math.min(1, this.planetaryInfluences[planet]));
    });
    
    // Update veil thickness
    this.veilThinness += (Math.random() - 0.5) * 0.05;
    this.veilThinness = Math.max(0.1, Math.min(0.9, this.veilThinness));
  }

  public getSpiritualStatistics(): {
    totalReadings: number;
    divineSignals: number;
    entitiesConnected: number;
    averageEnergyLevel: number;
    veilThinness: number;
    cosmicPhase: string;
    strongestPlanetaryInfluence: string;
  } {
    
    let totalReadings = 0;
    let totalSignals = 0;
    let totalEnergy = 0;
    
    this.spiritualReadings.forEach(readings => {
      totalReadings += readings.length;
      totalEnergy += readings.reduce((sum, r) => sum + r.energyLevel, 0);
    });
    
    this.divineSignals.forEach(signals => {
      totalSignals += signals.length;
    });

    const avgEnergy = totalReadings > 0 ? totalEnergy / totalReadings : 0;
    
    // Find strongest planetary influence
    const strongest = Object.entries(this.planetaryInfluences)
      .reduce((max, [planet, influence]) => 
        Math.abs(influence) > Math.abs(max[1]) ? [planet, influence] : max
      );

    return {
      totalReadings,
      divineSignals: totalSignals,
      entitiesConnected: this.spiritualReadings.size,
      averageEnergyLevel: avgEnergy,
      veilThinness: this.veilThinness,
      cosmicPhase: this.cosmicPhase,
      strongestPlanetaryInfluence: `${strongest[0]} (${strongest[1] > 0 ? '+' : ''}${strongest[1].toFixed(2)})`
    };
  }

  public getEntityKarmicProfile(entity: string): KarmicAssessment | undefined {
    return this.karmicProfiles.get(entity);
  }

  public getRecentSpiritualReadings(entity: string, count: number = 10): SpiritualReading[] {
    const readings = this.spiritualReadings.get(entity) || [];
    return readings.slice(-count).reverse();
  }

  public getRecentDivineSignals(entity: string, count: number = 5): DivineSignal[] {
    const signals = this.divineSignals.get(entity) || [];
    return signals.slice(-count).reverse();
  }
}

// Export singleton instance
let intuitionLayerInstance: IntuitionLayer | null = null;

export function getIntuitionLayer(): IntuitionLayer {
  if (!intuitionLayerInstance) {
    intuitionLayerInstance = new IntuitionLayer();
  }
  return intuitionLayerInstance;
}