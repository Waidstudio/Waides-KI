// kons_HumanTalk.js - Human-like Communication Module
export function kons_HumanTalk(userMessage, previousState = {}) {
  const personality = analyzeUserVibe(userMessage);
  const responseDelay = calculateThoughtfulDelay(userMessage);
  
  return {
    kons: "HumanTalk",
    personality_adjustment: personality,
    response_delay: responseDelay,
    tone: personality.tone,
    energy: personality.energy,
    speaking_style: personality.style,
    presence_indicators: {
      thoughtful_pause: responseDelay > 1000,
      deep_consideration: personality.complexity > 0.7,
      emotional_resonance: personality.empathy_level
    }
  };
}

// Analyze user's emotional state and communication style
function analyzeUserVibe(message) {
  const lower = message.toLowerCase();
  
  // Energy level detection
  const high_energy_words = ["excited", "pumped", "let's go", "amazing", "awesome", "quick", "fast"];
  const low_energy_words = ["tired", "slow", "careful", "patient", "calm", "steady"];
  const stressed_words = ["help", "urgent", "panic", "loss", "afraid", "worried"];
  
  let energy = "balanced";
  let tone = "wise";
  let style = "conversational";
  let empathy_level = 0.5;
  let complexity = 0.5;
  
  // Determine energy level
  if (high_energy_words.some(word => lower.includes(word))) {
    energy = "high";
    tone = "enthusiastic";
    style = "dynamic";
  } else if (low_energy_words.some(word => lower.includes(word))) {
    energy = "calm";
    tone = "soothing";
    style = "deliberate";
  } else if (stressed_words.some(word => lower.includes(word))) {
    energy = "supportive";
    tone = "protective";
    style = "reassuring";
    empathy_level = 0.9;
  }
  
  // Detect complexity needs
  if (lower.includes("explain") || lower.includes("how") || lower.includes("why")) {
    complexity = 0.8;
    style = "educational";
  }
  
  // Detect trading context
  if (lower.includes("trade") || lower.includes("money") || lower.includes("profit")) {
    tone = "focused";
    complexity = 0.7;
  }
  
  return {
    energy,
    tone,
    style,
    empathy_level,
    complexity
  };
}

// Calculate thoughtful response delay based on message complexity
function calculateThoughtfulDelay(message) {
  const word_count = message.split(' ').length;
  const complexity_indicators = ["why", "how", "explain", "strategy", "analysis"];
  const has_complexity = complexity_indicators.some(word => 
    message.toLowerCase().includes(word)
  );
  
  let base_delay = 500; // Base thinking time
  
  // Add delay for longer messages
  if (word_count > 10) base_delay += 300;
  if (word_count > 20) base_delay += 500;
  
  // Add delay for complex topics
  if (has_complexity) base_delay += 800;
  
  // Trading decisions need more thought
  if (message.toLowerCase().includes("trade")) base_delay += 600;
  
  return Math.min(base_delay, 2000); // Cap at 2 seconds
}

// Generate human-like response modifiers
export function generateResponseModifiers(personality) {
  const modifiers = {
    high: {
      prefixes: ["Absolutely!", "Yes! I feel that energy!", "Let's do this!"],
      connectors: ["and", "plus", "also"],
      emphasis: "strong"
    },
    calm: {
      prefixes: ["I understand", "Let me consider this carefully", "Taking a moment to reflect"],
      connectors: ["furthermore", "additionally", "moreover"],
      emphasis: "gentle"
    },
    supportive: {
      prefixes: ["I'm here with you", "We'll figure this out together", "Let me help you"],
      connectors: ["and together", "step by step", "gently"],
      emphasis: "compassionate"
    },
    balanced: {
      prefixes: ["I see", "Let me think about this", "Here's what I'm sensing"],
      connectors: ["and", "also", "furthermore"],
      emphasis: "thoughtful"
    }
  };
  
  return modifiers[personality.energy] || modifiers.balanced;
}

// Add human-like thinking patterns to responses
export function addThinkingPatterns(response, personality) {
  const patterns = {
    wise: "🧠 *processing with ancient wisdom*",
    enthusiastic: "⚡ *feeling the energy flow*",
    soothing: "🌙 *breathing with calm presence*",
    protective: "🛡️ *scanning for what you need*",
    focused: "🎯 *analyzing market consciousness*"
  };
  
  const thinking_indicator = patterns[personality.tone] || patterns.wise;
  
  return {
    thinking_indicator,
    modified_response: response,
    presence_marker: `*KonsAi is ${personality.energy === 'high' ? 'energized' : 'present'} with you*`
  };
}