// kons_TimelineAwareness.js - Memory and Learning Module
export function kons_TimelineAwareness(userMessage, previousState = {}) {
  const relevant_memories = recallRelevantMemories(userMessage);
  const learning_insights = extractLearningInsights(relevant_memories);
  const pattern_recognition = recognizePatterns(userMessage, relevant_memories);
  const adaptation_suggestions = generateAdaptationSuggestions(learning_insights);
  
  return {
    kons: "TimelineAwareness",
    relevant_memories,
    learning_insights,
    pattern_recognition,
    adaptation_suggestions,
    memory_depth: calculateMemoryDepth(relevant_memories),
    learning_confidence: calculateLearningConfidence(learning_insights)
  };
}

// Recall memories relevant to current context
function recallRelevantMemories(userMessage) {
  const memory_bank = getMemoryBank();
  const message_keywords = extractKeywords(userMessage);
  const relevant_memories = [];
  
  memory_bank.forEach(memory => {
    const relevance_score = calculateRelevanceScore(memory, message_keywords);
    if (relevance_score > 0.3) {
      relevant_memories.push({
        ...memory,
        relevance_score
      });
    }
  });
  
  // Sort by relevance and recency
  return relevant_memories
    .sort((a, b) => (b.relevance_score * 0.7) + (b.recency * 0.3) - ((a.relevance_score * 0.7) + (a.recency * 0.3)))
    .slice(0, 10); // Top 10 most relevant
}

// Extract learning insights from memories
function extractLearningInsights(memories) {
  const insights = {
    successful_patterns: [],
    failed_patterns: [],
    user_preferences: {},
    behavioral_trends: {},
    improvement_areas: []
  };
  
  memories.forEach(memory => {
    if (memory.outcome === 'successful') {
      insights.successful_patterns.push({
        context: memory.context,
        approach: memory.approach,
        success_factor: memory.success_factor
      });
    } else if (memory.outcome === 'failed') {
      insights.failed_patterns.push({
        context: memory.context,
        mistake: memory.mistake,
        lesson: memory.lesson_learned
      });
    }
    
    // Extract user preferences
    if (memory.user_preference) {
      const pref_key = memory.preference_category;
      if (!insights.user_preferences[pref_key]) {
        insights.user_preferences[pref_key] = [];
      }
      insights.user_preferences[pref_key].push(memory.user_preference);
    }
  });
  
  return insights;
}

// Recognize patterns in current message vs historical data
function recognizePatterns(userMessage, memories) {
  const patterns = {
    recurring_themes: [],
    emotional_patterns: [],
    timing_patterns: [],
    decision_patterns: []
  };
  
  const current_context = analyzeCurrentContext(userMessage);
  
  memories.forEach(memory => {
    // Check for recurring themes
    if (hasThematicSimilarity(current_context, memory.context)) {
      patterns.recurring_themes.push({
        theme: memory.theme,
        frequency: memory.frequency,
        last_occurrence: memory.timestamp,
        typical_outcome: memory.typical_outcome
      });
    }
    
    // Check for emotional patterns
    if (memory.emotional_state && current_context.emotional_state) {
      if (memory.emotional_state === current_context.emotional_state) {
        patterns.emotional_patterns.push({
          emotion: memory.emotional_state,
          previous_action: memory.action_taken,
          previous_result: memory.outcome,
          recommendation: memory.learned_approach
        });
      }
    }
  });
  
  return patterns;
}

// Generate adaptation suggestions based on learning
function generateAdaptationSuggestions(learningInsights) {
  const suggestions = [];
  
  // Analyze successful patterns
  learningInsights.successful_patterns.forEach(pattern => {
    suggestions.push({
      type: "repeat_success",
      suggestion: `Last time in ${pattern.context}, ${pattern.approach} worked well because of ${pattern.success_factor}. Consider similar approach.`,
      confidence: 0.8,
      priority: "high"
    });
  });
  
  // Learn from failures
  learningInsights.failed_patterns.forEach(pattern => {
    suggestions.push({
      type: "avoid_mistake",
      suggestion: `Previously, ${pattern.mistake} in ${pattern.context} led to problems. ${pattern.lesson}`,
      confidence: 0.9,
      priority: "critical"
    });
  });
  
  // User preference adaptation
  Object.keys(learningInsights.user_preferences).forEach(category => {
    const preferences = learningInsights.user_preferences[category];
    const dominant_preference = findDominantPreference(preferences);
    
    suggestions.push({
      type: "honor_preference",
      suggestion: `User typically prefers ${dominant_preference} in ${category} situations.`,
      confidence: 0.7,
      priority: "medium"
    });
  });
  
  return suggestions.sort((a, b) => {
    const priority_order = { critical: 3, high: 2, medium: 1 };
    return priority_order[b.priority] - priority_order[a.priority];
  });
}

// Get simulated memory bank (in real implementation, this would be from database)
function getMemoryBank() {
  return [
    {
      id: 1,
      timestamp: Date.now() - 86400000, // 1 day ago
      context: "trading_request",
      theme: "eth_trading",
      emotional_state: "excited",
      action_taken: "recommended_waidbot_pro",
      outcome: "successful",
      approach: "semi_autonomous_with_guidance",
      success_factor: "user_felt_confident_but_protected",
      recency: 0.9,
      frequency: 3,
      user_preference: "guided_automation",
      preference_category: "trading_style"
    },
    {
      id: 2,
      timestamp: Date.now() - 172800000, // 2 days ago
      context: "market_volatility",
      theme: "risk_management",
      emotional_state: "stressed",
      action_taken: "halted_trading",
      outcome: "successful",
      approach: "emotional_protection",
      success_factor: "prevented_stress_trading",
      recency: 0.8,
      frequency: 2
    },
    {
      id: 3,
      timestamp: Date.now() - 259200000, // 3 days ago
      context: "trading_request",
      theme: "eth_trading",
      emotional_state: "calm",
      action_taken: "recommended_autonomous",
      outcome: "failed",
      approach: "full_automation",
      mistake: "user_wanted_more_control",
      lesson_learned: "check_user_comfort_with_automation_level",
      recency: 0.7,
      frequency: 1,
      user_preference: "maintain_some_control",
      preference_category: "automation_level"
    },
    {
      id: 4,
      timestamp: Date.now() - 345600000, // 4 days ago
      context: "smaisika_question",
      theme: "currency_education",
      emotional_state: "curious",
      action_taken: "explained_dual_mode",
      outcome: "successful",
      approach: "practical_explanation_first",
      success_factor: "started_with_normal_mode",
      recency: 0.6,
      frequency: 4,
      user_preference: "practical_then_spiritual",
      preference_category: "explanation_style"
    }
  ];
}

// Extract keywords from user message
function extractKeywords(message) {
  const keywords = [];
  const words = message.toLowerCase().split(/\s+/);
  
  const important_words = words.filter(word => 
    word.length > 3 && 
    !['this', 'that', 'what', 'when', 'where', 'how', 'why', 'the', 'and', 'or', 'but'].includes(word)
  );
  
  return important_words;
}

// Calculate relevance score between memory and current message
function calculateRelevanceScore(memory, keywords) {
  let score = 0;
  
  // Keyword matching
  const memory_text = `${memory.context} ${memory.theme} ${memory.action_taken}`.toLowerCase();
  keywords.forEach(keyword => {
    if (memory_text.includes(keyword)) {
      score += 0.2;
    }
  });
  
  // Context similarity bonus
  if (keywords.includes('trade') && memory.context.includes('trading')) score += 0.3;
  if (keywords.includes('smaisika') && memory.context.includes('smaisika')) score += 0.3;
  
  // Recency bonus
  score += memory.recency * 0.1;
  
  // Frequency bonus (more frequent = more important)
  score += Math.min(memory.frequency * 0.05, 0.2);
  
  return Math.min(score, 1.0);
}

// Analyze current context from user message
function analyzeCurrentContext(message) {
  const lower = message.toLowerCase();
  
  let context = "general";
  if (lower.includes('trade')) context = "trading_request";
  if (lower.includes('smaisika')) context = "smaisika_question";
  if (lower.includes('help')) context = "help_request";
  
  let emotional_state = "neutral";
  if (lower.includes('excited') || lower.includes('pumped')) emotional_state = "excited";
  if (lower.includes('worried') || lower.includes('scared')) emotional_state = "stressed";
  if (lower.includes('calm') || lower.includes('ready')) emotional_state = "calm";
  
  return { context, emotional_state };
}

// Check thematic similarity between contexts
function hasThematicSimilarity(context1, context2) {
  const theme_groups = {
    trading: ["trading_request", "market_analysis", "trade_execution"],
    education: ["smaisika_question", "currency_education", "help_request"],
    emotional: ["stress_management", "emotional_support", "calming"]
  };
  
  for (const group of Object.values(theme_groups)) {
    if (group.includes(context1.context) && group.includes(context2)) {
      return true;
    }
  }
  
  return false;
}

// Find dominant preference in array of preferences
function findDominantPreference(preferences) {
  const counts = {};
  preferences.forEach(pref => {
    counts[pref] = (counts[pref] || 0) + 1;
  });
  
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

// Calculate memory depth based on relevance and quantity
function calculateMemoryDepth(memories) {
  if (memories.length === 0) return 0.1;
  
  const avg_relevance = memories.reduce((sum, mem) => sum + mem.relevance_score, 0) / memories.length;
  const memory_count_factor = Math.min(memories.length / 10, 1); // Normalize to 0-1
  
  return (avg_relevance * 0.7) + (memory_count_factor * 0.3);
}

// Calculate learning confidence based on insights quality
function calculateLearningConfidence(insights) {
  let confidence = 0.5; // Base confidence
  
  // Successful patterns boost confidence
  confidence += Math.min(insights.successful_patterns.length * 0.1, 0.3);
  
  // Learning from failures boosts confidence
  confidence += Math.min(insights.failed_patterns.length * 0.15, 0.3);
  
  // User preference knowledge boosts confidence
  const pref_categories = Object.keys(insights.user_preferences).length;
  confidence += Math.min(pref_categories * 0.05, 0.2);
  
  return Math.min(confidence, 0.95);
}

// Store new memory (to be called after interactions)
export function storeMemory(context, theme, emotionalState, actionTaken, outcome, details = {}) {
  const memory = {
    id: Date.now(),
    timestamp: Date.now(),
    context,
    theme,
    emotional_state: emotionalState,
    action_taken: actionTaken,
    outcome,
    recency: 1.0,
    frequency: 1,
    ...details
  };
  
  // In real implementation, this would save to database
  console.log("💾 Storing memory:", memory);
  
  return memory;
}