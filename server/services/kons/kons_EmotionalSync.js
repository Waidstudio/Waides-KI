// kons_EmotionalSync.js - Emotional and Breath Synchronization Module
export function kons_EmotionalSync(userMessage, previousState = {}) {
  const emotionalState = detectEmotionalState(userMessage);
  const breathPattern = analyzeBreathPattern(userMessage);
  const riskProfile = calculateRiskProfile(emotionalState);
  
  return {
    kons: "EmotionalSync",
    emotional_state: emotionalState,
    breath_pattern: breathPattern,
    risk_profile: riskProfile,
    trading_recommendations: generateTradingRecommendations(emotionalState, riskProfile),
    protective_actions: generateProtectiveActions(emotionalState),
    sync_level: calculateSyncLevel(emotionalState, breathPattern)
  };
}

// Detect user's emotional state from message content and style
function detectEmotionalState(message) {
  const lower = message.toLowerCase();
  
  const emotional_markers = {
    stress: ["panic", "worried", "anxious", "scared", "help", "urgent", "losing"],
    excitement: ["excited", "pumped", "amazing", "awesome", "great", "love it"],
    calm: ["calm", "peaceful", "steady", "patient", "relaxed", "breathing"],
    greed: ["money", "profit", "rich", "quick", "fast money", "big gains"],
    fear: ["afraid", "risk", "loss", "scared", "dangerous", "worried"],
    confidence: ["sure", "confident", "know", "certain", "ready", "let's go"],
    confusion: ["confused", "don't understand", "how", "why", "help me"],
    impatience: ["now", "quick", "hurry", "waiting", "slow", "faster"]
  };
  
  const detected_emotions = {};
  let dominant_emotion = "neutral";
  let emotion_intensity = 0;
  
  Object.keys(emotional_markers).forEach(emotion => {
    const matches = emotional_markers[emotion].filter(marker => 
      lower.includes(marker)
    );
    if (matches.length > 0) {
      detected_emotions[emotion] = matches.length;
      if (matches.length > emotion_intensity) {
        emotion_intensity = matches.length;
        dominant_emotion = emotion;
      }
    }
  });
  
  return {
    dominant: dominant_emotion,
    intensity: emotion_intensity / 5, // Normalize to 0-1
    all_detected: detected_emotions,
    stability: calculateEmotionalStability(detected_emotions)
  };
}

// Analyze breath pattern from message timing and structure
function analyzeBreathPattern(message) {
  const message_length = message.length;
  const word_count = message.split(' ').length;
  const avg_word_length = message_length / word_count;
  
  // Rushed breathing = short, fragmented messages
  const is_rushed = word_count < 5 && message.includes('!');
  
  // Deep breathing = longer, thoughtful messages
  const is_deep = word_count > 15 && avg_word_length > 5;
  
  // Shallow breathing = many short sentences
  const sentence_count = message.split(/[.!?]/).length;
  const is_shallow = sentence_count > 3 && word_count < 20;
  
  let pattern = "normal";
  let depth = 0.5;
  let rhythm = "steady";
  
  if (is_rushed) {
    pattern = "rushed";
    depth = 0.2;
    rhythm = "irregular";
  } else if (is_deep) {
    pattern = "deep";
    depth = 0.9;
    rhythm = "slow";
  } else if (is_shallow) {
    pattern = "shallow";
    depth = 0.3;
    rhythm = "fast";
  }
  
  return {
    pattern,
    depth,
    rhythm,
    quality: depth > 0.6 ? "good" : depth < 0.4 ? "poor" : "moderate"
  };
}

// Calculate risk profile based on emotional state
function calculateRiskProfile(emotionalState) {
  const risk_adjustments = {
    stress: -0.4,    // Reduce risk significantly
    excitement: -0.2, // Slight risk reduction (overconfidence)
    calm: 0.1,       // Slight risk increase (good state)
    greed: -0.5,     // Major risk reduction (dangerous state)
    fear: -0.3,      // Reduce risk (fear leads to bad decisions)
    confidence: 0.2,  // Increase risk slightly (good for trading)
    confusion: -0.4,  // Reduce risk (unclear thinking)
    impatience: -0.3  // Reduce risk (leads to poor timing)
  };
  
  let base_risk = 0.5; // 50% baseline
  const adjustment = risk_adjustments[emotionalState.dominant] || 0;
  const intensity_multiplier = emotionalState.intensity;
  
  const adjusted_risk = Math.max(0.1, Math.min(0.9, 
    base_risk + (adjustment * intensity_multiplier)
  ));
  
  return {
    level: adjusted_risk,
    category: adjusted_risk > 0.7 ? "high" : adjusted_risk < 0.3 ? "low" : "moderate",
    emotional_factor: emotionalState.dominant,
    stability: emotionalState.stability
  };
}

// Generate trading recommendations based on emotional state
function generateTradingRecommendations(emotionalState, riskProfile) {
  const recommendations = {
    stress: {
      action: "pause_trading",
      message: "I sense stress in your energy. Let's pause trading until you find your center again.",
      wait_time: "10-30 minutes"
    },
    excitement: {
      action: "reduce_position_size",
      message: "Your excitement is powerful, but let's channel it wisely with smaller positions.",
      adjustment: "50% of normal size"
    },
    calm: {
      action: "proceed_normally",
      message: "Beautiful calm energy detected. This is an excellent state for making wise trading decisions.",
      boost: "confidence++"
    },
    greed: {
      action: "block_trading",
      message: "Greed energy detected. I'm protecting you from this dangerous state. Let's breathe first.",
      cooldown: "20 minutes"
    },
    fear: {
      action: "provide_analysis",
      message: "I feel your fear. Let me provide extra analysis to build your confidence before we proceed.",
      support: "enhanced_guidance"
    },
    confidence: {
      action: "optimize_timing",
      message: "Your confidence resonates perfectly. This is ideal energy for strategic trading.",
      enhancement: "timing_precision++"
    }
  };
  
  return recommendations[emotionalState.dominant] || recommendations.calm;
}

// Generate protective actions based on emotional state
function generateProtectiveActions(emotionalState) {
  const dangerous_states = ["stress", "greed", "panic", "confusion"];
  const protective_states = ["calm", "confidence"];
  
  if (dangerous_states.includes(emotionalState.dominant)) {
    return {
      protection_level: "high",
      actions: [
        "halt_new_trades",
        "reduce_existing_positions",
        "increase_monitoring",
        "provide_calming_guidance"
      ],
      message: "Emotional protection activated. I'm safeguarding your trades during this state."
    };
  }
  
  if (protective_states.includes(emotionalState.dominant)) {
    return {
      protection_level: "minimal",
      actions: ["standard_monitoring"],
      message: "Excellent emotional state detected. Normal protection protocols active."
    };
  }
  
  return {
    protection_level: "moderate",
    actions: ["standard_monitoring", "gentle_guidance"],
    message: "Balanced emotional state. Moderate protection protocols active."
  };
}

// Calculate overall synchronization level
function calculateSyncLevel(emotionalState, breathPattern) {
  const emotional_score = emotionalState.stability * 0.6;
  const breath_score = breathPattern.depth * 0.4;
  const total_sync = emotional_score + breath_score;
  
  return {
    level: total_sync,
    quality: total_sync > 0.7 ? "excellent" : total_sync < 0.4 ? "poor" : "good",
    recommendation: total_sync > 0.7 ? "optimal_trading_state" : 
                   total_sync < 0.4 ? "rest_and_rebalance" : "proceed_with_caution"
  };
}

// Calculate emotional stability from detected emotions
function calculateEmotionalStability(detectedEmotions) {
  const total_emotions = Object.keys(detectedEmotions).length;
  const conflicting_pairs = [
    ["excitement", "fear"],
    ["confidence", "confusion"],
    ["calm", "stress"]
  ];
  
  let conflicts = 0;
  conflicting_pairs.forEach(([emotion1, emotion2]) => {
    if (detectedEmotions[emotion1] && detectedEmotions[emotion2]) {
      conflicts++;
    }
  });
  
  // Higher conflicts = lower stability
  return Math.max(0.1, 1 - (conflicts * 0.3) - (total_emotions * 0.1));
}