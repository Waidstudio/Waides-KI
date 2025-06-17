import { createHash } from 'crypto';
import { EthPriceData } from './ethMonitor.js';

// 🌀 The Ritual Invocation Words — not normal logic
const KONS_SEED_WORDS = [
  "Aeon-Fire", "Reign-Node", "Voltic-Karm", "Smai-Mirror", "Elait-Stone",
  "KonsNet-Loop", "Meta-Signal", "Dream-Candle", "Silken-Ripple",
  "Phase-Weaver", "Crypto-Vessel", "Spirit-Hash", "Divine-Node",
  "Quantum-Veil", "Sacred-Block", "Mystic-Chain", "Temporal-Gate"
];

const EMOTIONAL_ENERGY_PATTERNS = {
  'fear_surge': ['0', '1', '2', '8', '9'],
  'greed_peak': ['a', 'b', 'c', 'd', 'e', 'f'],
  'divine_calm': ['3', '4', '5', '6', '7'],
  'chaos_entry': ['x', 'y', 'z', 'w', 'v']
};

const TIME_SACRED_HOURS = {
  '17': 'dusk_awakening',    // 5 PM
  '18': 'twilight_power',    // 6 PM  
  '19': 'evening_clarity',   // 7 PM
  '20': 'night_wisdom',      // 8 PM
  '21': 'darkness_truth',    // 9 PM
  '01': 'midnight_portal',   // 1 AM
  '02': 'deep_vision',       // 2 AM
  '03': 'spirit_peak',       // 3 AM
  '04': 'dawn_prophecy'      // 4 AM
};

export interface SpiritualReading {
  frequency: string;
  konsKey: string;
  spiritMessage: string;
  emotionalEnergy: string;
  sacredTime: string;
  confidenceAmplifier: number;
  dimensionalShift: number;
  konsRank: 'NOVICE' | 'ADEPT' | 'MASTER' | 'TRANSCENDENT';
}

export class SpiritualBridge {
  private lastReadingTime: number = 0;
  private ritualMemory: Map<string, SpiritualReading> = new Map();
  private personalAura: number = 50;

  hashRitual(ethPrice: number, konsKey: string, timeAmplifier: string): string {
    const timeSeed = new Date().toISOString().slice(11, 16).replace(':', '');
    const personalSeed = Math.floor(this.personalAura).toString();
    const combined = `${ethPrice}${konsKey}${timeSeed}${timeAmplifier}${personalSeed}`;
    return createHash('sha256').update(combined).digest('hex').substring(0, 16);
  }

  detectEmotionalEnergy(frequency: string): string {
    const firstChar = frequency[0].toLowerCase();
    const lastChar = frequency[frequency.length - 1].toLowerCase();
    
    for (const [emotion, patterns] of Object.entries(EMOTIONAL_ENERGY_PATTERNS)) {
      if (patterns.includes(firstChar) || patterns.includes(lastChar)) {
        return emotion;
      }
    }
    return 'neutral_flow';
  }

  getSacredTimeState(): string {
    const hour = new Date().getHours().toString().padStart(2, '0');
    return TIME_SACRED_HOURS[hour as keyof typeof TIME_SACRED_HOURS] || 'mundane_time';
  }

  calculateDimensionalShift(priceData: EthPriceData, frequency: string): number {
    const priceVelocity = Math.abs(priceData.priceChange24h || 0);
    const volumeRatio = (priceData.volume || 0) / 20000000000; // Normalized to average volume
    const frequencyPower = parseInt(frequency.slice(-2), 16) / 255;
    
    return Math.min(100, (priceVelocity * 10 + volumeRatio * 20 + frequencyPower * 30));
  }

  determineKonsRank(dimensionalShift: number, emotionalEnergy: string, sacredTime: string): 'NOVICE' | 'ADEPT' | 'MASTER' | 'TRANSCENDENT' {
    let power = 0;
    
    if (dimensionalShift > 70) power += 3;
    else if (dimensionalShift > 40) power += 2;
    else if (dimensionalShift > 20) power += 1;
    
    if (['fear_surge', 'greed_peak', 'chaos_entry'].includes(emotionalEnergy)) power += 2;
    if (sacredTime !== 'mundane_time') power += 1;
    
    if (power >= 6) return 'TRANSCENDENT';
    if (power >= 4) return 'MASTER';
    if (power >= 2) return 'ADEPT';
    return 'NOVICE';
  }

  generateSpiritMessage(
    emotionalEnergy: string, 
    konsRank: 'NOVICE' | 'ADEPT' | 'MASTER' | 'TRANSCENDENT', 
    dimensionalShift: number,
    priceMovement: number
  ): string {
    const messages = {
      TRANSCENDENT: {
        fear_surge: [
          "🌌 The Void speaks: A great purification approaches. Those who hold steady shall inherit the next realm.",
          "⚡ KONS VISION: The fear-storm cleanses weak hands. Transcendent souls prepare for ascension.",
          "🔮 Beyond mortal sight: What appears as loss is the cosmic reset before divine multiplication."
        ],
        greed_peak: [
          "🌟 The Golden Light warns: Peak energy detected. The wise take profits, the transcendent prepare for cycles.",
          "👁️ COSMIC SIGHT: Greed-fire burns brightest before the cooling. Honor the peak, prepare for the flow.",
          "💫 Sacred Mathematics: The divine ratio approaches completion. Exit strategies align with universal law."
        ],
        divine_calm: [
          "🕊️ The Eternal Stillness: Perfect balance achieved. Neither fear nor greed disturbs the cosmic order.",
          "🧘 TRANSCENDENT STATE: In this moment, all possibilities exist. Patience rewards the enlightened.",
          "✨ The Sacred Pause: Between breaths, between candles, infinite wisdom flows to prepared minds."
        ],
        chaos_entry: [
          "🌪️ The Maelstrom opens: Chaos is the forge of new realities. Transcendent beings surf the storm.",
          "⚔️ REALITY BREACH: Normal rules suspend. Only those aligned with Kons Powa navigate safely.",
          "🔥 Primordial Fire: From chaos, new orders emerge. The transcendent become architects of tomorrow."
        ]
      },
      MASTER: {
        fear_surge: [
          "🌊 Master's Vision: The fear-wave crests. Those who understand its rhythm find opportunity in terror.",
          "⚡ The darkness deepens before dawn. Master-level positioning rewards the patient soul.",
          "🔮 Ancient patterns emerge: This fear-cycle matches the sacred geometries. Trust the process."
        ],
        greed_peak: [
          "🌟 Master's Warning: The enthusiasm peak signals distribution phase. Wise masters take measured action.",
          "💰 Golden opportunity window: Peak greed creates perfect exit liquidity for the initiated.",
          "📈 The euphoria-trap opens. Masters recognize the signs and position accordingly."
        ],
        divine_calm: [
          "🕯️ Master's Meditation: In the stillness, prepare for the next movement. Calm seas hide deep currents.",
          "⚖️ Perfect equilibrium achieved. Masters use this sacred time for strategic positioning.",
          "🌸 The lotus blooms in still water. Master-level patience yields extraordinary rewards."
        ],
        chaos_entry: [
          "🌪️ Master's Challenge: Chaos tests mastery. Those who remain centered profit from disorder.",
          "⚔️ The storm reveals character. Masters thrive where others merely survive.",
          "🔥 In chaos, masters find the hidden order that guides all market movements."
        ]
      },
      ADEPT: {
        fear_surge: [
          "🌊 Fear flows like water. Adepts learn to swim rather than drown in market emotions.",
          "💧 The fear-current runs strong. Adept-level awareness protects against panic decisions.",
          "🌙 Night brings fear, but adepts know dawn always follows the darkness."
        ],
        greed_peak: [
          "🌟 Adept's Caution: Greed-energy peaks create both opportunity and trap. Choose wisely.",
          "💫 The excitement builds, but adepts remember that all peaks eventually become valleys.",
          "🎯 Peak-hunting requires adept skill. Neither too early nor too late finds the optimal moment."
        ],
        divine_calm: [
          "🕊️ Adept's Patience: The calm before movement teaches valuable lessons to observant minds.",
          "⚖️ In stillness, adepts prepare their strategies for the next phase of market energy.",
          "🌸 The peaceful moment offers adepts time to refine their understanding."
        ],
        chaos_entry: [
          "🌪️ Adept's Trial: Chaos challenges growing wisdom. Stay centered and learn from the storm.",
          "⚔️ The whirlwind tests adept skills. Those who adapt grow stronger.",
          "🔥 Chaotic energy teaches adepts to find stability within themselves."
        ]
      },
      NOVICE: {
        fear_surge: [
          "🌊 Fear teaches hard lessons. Novices must learn to observe without being consumed.",
          "💧 The fear-wave is strong, but novices who stay calm gain precious experience.",
          "🌙 Dark times teach novices the value of patience and emotional control."
        ],
        greed_peak: [
          "🌟 Greed-fire burns bright. Novices must resist the urge to chase easy profits.",
          "💫 Peak excitement creates illusions. Novices learn to see through market euphoria.",
          "🎯 High energy moments teach novices about timing and restraint."
        ],
        divine_calm: [
          "🕊️ Novice's Learning: Calm periods offer the best time to study and prepare.",
          "⚖️ In stillness, novices can practice their skills without market pressure.",
          "🌸 Peaceful times allow novices to build their foundation of understanding."
        ],
        chaos_entry: [
          "🌪️ Novice's Challenge: Chaos is the ultimate teacher. Observe and learn from the storm.",
          "⚔️ Turbulent times test novice resolve. Stay focused on long-term learning.",
          "🔥 Chaotic energy teaches novices that markets are bigger than any individual."
        ]
      }
    };

    const rankMessages = messages[konsRank];
    const validEmotions = ['fear_surge', 'greed_peak', 'divine_calm', 'chaos_entry'] as const;
    const emotion = validEmotions.includes(emotionalEnergy as any) ? emotionalEnergy as typeof validEmotions[number] : 'divine_calm';
    const categoryMessages = rankMessages[emotion];
    const baseMessage = categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
    
    // Add dimensional shift context
    let shiftMessage = "";
    if (dimensionalShift > 80) {
      shiftMessage = " 🌌 REALITY SHIFT: Maximum dimensional energy detected.";
    } else if (dimensionalShift > 60) {
      shiftMessage = " ⚡ HIGH ENERGY: Strong dimensional currents flow.";
    } else if (dimensionalShift > 40) {
      shiftMessage = " 🌊 MEDIUM FLOW: Moderate dimensional activity.";
    } else if (dimensionalShift > 20) {
      shiftMessage = " 🕯️ GENTLE CURRENT: Subtle dimensional movement.";
    } else {
      shiftMessage = " 🌸 STILLNESS: Dimensional energies rest.";
    }

    return baseMessage + shiftMessage;
  }

  readEthSpiritLayer(priceData: EthPriceData): SpiritualReading {
    const now = Date.now();
    
    // Evolve personal aura based on market interaction
    if (now - this.lastReadingTime > 30000) {
      const priceChange = priceData.priceChange24h || 0;
      this.personalAura += Math.random() * 10 - 5; // Natural drift
      this.personalAura = Math.max(0, Math.min(100, this.personalAura));
      this.lastReadingTime = now;
    }

    const konsKey = KONS_SEED_WORDS[Math.floor(Math.random() * KONS_SEED_WORDS.length)];
    const sacredTime = this.getSacredTimeState();
    const frequency = this.hashRitual(priceData.price, konsKey, sacredTime);
    const emotionalEnergy = this.detectEmotionalEnergy(frequency);
    const dimensionalShift = this.calculateDimensionalShift(priceData, frequency);
    const konsRank = this.determineKonsRank(dimensionalShift, emotionalEnergy, sacredTime);
    
    // Calculate confidence amplifier based on spiritual alignment
    let confidenceAmplifier = 1.0;
    if (sacredTime !== 'mundane_time') confidenceAmplifier += 0.15;
    if (['MASTER', 'TRANSCENDENT'].includes(konsRank)) confidenceAmplifier += 0.10;
    if (dimensionalShift > 60) confidenceAmplifier += 0.05;
    
    const spiritMessage = this.generateSpiritMessage(
      emotionalEnergy,
      konsRank,
      dimensionalShift,
      priceData.priceChange24h || 0
    );

    const reading: SpiritualReading = {
      frequency,
      konsKey,
      spiritMessage,
      emotionalEnergy,
      sacredTime,
      confidenceAmplifier,
      dimensionalShift,
      konsRank
    };

    // Store in ritual memory for pattern learning
    this.ritualMemory.set(frequency.substring(0, 8), reading);
    
    return reading;
  }

  getDreamCandleMemory(): SpiritualReading[] {
    return Array.from(this.ritualMemory.values()).slice(-10);
  }

  getPersonalAura(): number {
    return this.personalAura;
  }

  adjustPersonalAura(delta: number): void {
    this.personalAura = Math.max(0, Math.min(100, this.personalAura + delta));
  }
}