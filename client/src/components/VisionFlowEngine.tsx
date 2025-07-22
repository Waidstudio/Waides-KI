// 🌙 Vision Flow Engine - TypeScript migrated from legacy JS
// Enhanced with proper types and additional functionality

export interface VisionSignal {
  mood: string;
  message: string;
  hour: number;
  confidence: number;
  timestamp: Date;
}

export interface EmotionDetection {
  type: 'greed' | 'fear' | 'revenge' | 'neutral';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface TimeEnergyReading {
  phase: string;
  message: string;
  energy: number;
}

const VISION_MOODS = [
  { key: "⚡Surge", message: "I see Ethereum rising like lightning — expect a surge soon.", confidence: 85 },
  { key: "🌊 Pullback", message: "The Ether tide is receding. A pullback is forming — watch your entries.", confidence: 80 },
  { key: "🌒 Reversal", message: "A reversal wave is whispering from the shadows. This is not a time to follow the crowd.", confidence: 75 },
  { key: "🌤 Stability", message: "ETH is holding its breath — a moment of calm before the next wave.", confidence: 70 },
  { key: "🔥 Overheat", message: "Emotion is burning too hot. Caution — greed is rising across the charts.", confidence: 90 }
];

// Enhanced vision prophecy with more sophisticated logic
export default function getVisionProphecy(ethPrice?: number, volume?: number): VisionSignal {
  const hour = new Date().getHours();
  const timestamp = new Date();
  
  // More sophisticated mood selection based on time and market data
  let selectedMood;
  
  if (ethPrice && volume) {
    // Use market data to influence mood selection
    const priceMovement = Math.sin(ethPrice / 1000) * 100;
    const volumeInfluence = Math.log(volume / 1000000) * 10;
    const timeInfluence = Math.sin((hour / 24) * Math.PI * 2) * 50;
    
    const combinedScore = priceMovement + volumeInfluence + timeInfluence;
    const moodIndex = Math.abs(Math.floor(combinedScore)) % VISION_MOODS.length;
    selectedMood = VISION_MOODS[moodIndex];
  } else {
    // Fallback to time-based selection with some randomness
    const baseIndex = hour % VISION_MOODS.length;
    const randomOffset = Math.floor(Math.random() * 2) - 1; // -1, 0, or 1
    const finalIndex = Math.abs(baseIndex + randomOffset) % VISION_MOODS.length;
    selectedMood = VISION_MOODS[finalIndex];
  }

  return {
    mood: selectedMood.key,
    message: `🌙 Dream Vision Activated: ${selectedMood.message}`,
    hour,
    confidence: selectedMood.confidence,
    timestamp
  };
}

// Enhanced spiritual clock intelligence
export function getTimeEnergyReading(): TimeEnergyReading {
  const hour = new Date().getHours();
  
  if (hour >= 0 && hour <= 6) {
    return {
      phase: "Night Watch",
      message: "🔮 Night Watch: ETH is quiet — secrets form in silence.",
      energy: 20
    };
  }
  
  if (hour >= 7 && hour <= 12) {
    return {
      phase: "Morning Breath",
      message: "🌅 Morning Breath: Markets open with hope and volatility.",
      energy: 80
    };
  }
  
  if (hour >= 13 && hour <= 18) {
    return {
      phase: "Midday Pulse",
      message: "🌞 Midday Pulse: Bots are active, watch liquidity games.",
      energy: 95
    };
  }
  
  return {
    phase: "Evening Drift",
    message: "🌌 Evening Drift: Emotions cool — smart trades awaken.",
    energy: 60
  };
}

// Enhanced emotion detection with more patterns
export function detectEmotion(query: string): EmotionDetection | null {
  const q = query.toLowerCase();
  
  // Greed patterns
  const greedPatterns = [
    "fast money", "rich quick", "double my eth", "triple my money",
    "get rich", "easy money", "guaranteed profit", "100x gains"
  ];
  
  for (const pattern of greedPatterns) {
    if (q.includes(pattern)) {
      return {
        type: 'greed',
        message: "⚠️ Greed detected. The fastest path is often a trap. Let's build real wealth, not illusions.",
        severity: 'high'
      };
    }
  }
  
  // Fear patterns
  const fearPatterns = [
    "scared", "i'm losing", "panic", "afraid", "terrified",
    "market crash", "losing money", "help me", "what do i do"
  ];
  
  for (const pattern of fearPatterns) {
    if (q.includes(pattern)) {
      return {
        type: 'fear',
        message: "🧘 Breathe. Loss is not your identity. Re-align your mind before the market re-aligns you.",
        severity: 'medium'
      };
    }
  }
  
  // Revenge trading patterns
  const revengePatterns = [
    "revenge trade", "win back loss", "get my money back",
    "make up for losses", "recover my losses"
  ];
  
  for (const pattern of revengePatterns) {
    if (q.includes(pattern)) {
      return {
        type: 'revenge',
        message: "🛑 Revenge never wins. Trade from clarity, not emotion. I'll guide you back to alignment.",
        severity: 'high'
      };
    }
  }
  
  return {
    type: 'neutral',
    message: "",
    severity: 'low'
  };
}

// Generate symbolic market interpretation
export function generateSymbolicReading(ethPrice: number, volume: number): string {
  const priceEnergy = ethPrice > 3500 ? "ascending" : "grounding";
  const volumeEnergy = volume > 1000000 ? "active" : "quiet";
  
  const symbols = {
    ascending: "🚀",
    grounding: "🌱",
    active: "⚡",
    quiet: "🤫"
  };
  
  return `${symbols[priceEnergy]} ETH energy is ${priceEnergy} with ${symbols[volumeEnergy]} ${volumeEnergy} volume flow. The spiritual currents suggest ${priceEnergy === "ascending" ? "upward momentum" : "consolidation phase"}.`;
}

// Get current market phase based on time and price
export function getCurrentMarketPhase(ethPrice?: number): {
  phase: string;
  description: string;
  recommendation: string;
} {
  const timeReading = getTimeEnergyReading();
  const visionSignal = getVisionProphecy(ethPrice);
  
  return {
    phase: `${timeReading.phase} + ${visionSignal.mood}`,
    description: `${timeReading.message} ${visionSignal.message}`,
    recommendation: timeReading.energy > 80 ? 
      "High energy phase - consider active trading" : 
      "Low energy phase - focus on patience and observation"
  };
}