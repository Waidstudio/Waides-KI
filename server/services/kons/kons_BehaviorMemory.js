// kons_BehaviorMemory.js - User Behavior Learning and Adaptation Module
export function kons_BehaviorMemory(userMessage, sessionData, previousState = {}) {
  const behavioral_profile = buildBehavioralProfile(sessionData);
  const communication_style = analyzeCommunicationStyle(userMessage);
  const preference_patterns = extractPreferencePatterns(sessionData);
  const adaptation_level = calculateAdaptationLevel(behavioral_profile);
  
  return {
    kons: "BehaviorMemory",
    behavioral_profile,
    communication_style,
    preference_patterns,
    adaptation_level,
    personalization: generatePersonalization(behavioral_profile, communication_style),
    learning_insights: generateLearningInsights(preference_patterns)
  };
}

// Build comprehensive behavioral profile from session data
function buildBehavioralProfile(sessionData) {
  const profile = {
    risk_tolerance: "moderate",
    trading_style: "balanced",
    decision_speed: "normal",
    information_processing: "analytical",
    emotional_patterns: {},
    preferred_automation: "semi",
    learning_style: "visual",
    interaction_frequency: "regular"
  };
  
  if (!sessionData || !sessionData.interactions) {
    return profile;
  }
  
  const interactions = sessionData.interactions;
  
  // Analyze risk tolerance from past decisions
  const risk_indicators = interactions.filter(i => i.category === 'trading_decision');
  if (risk_indicators.length > 0) {
    const aggressive_count = risk_indicators.filter(i => 
      i.content.includes('quick') || i.content.includes('aggressive') || i.content.includes('big')
    ).length;
    
    const conservative_count = risk_indicators.filter(i =>
      i.content.includes('safe') || i.content.includes('careful') || i.content.includes('small')
    ).length;
    
    if (aggressive_count > conservative_count) {
      profile.risk_tolerance = "high";
    } else if (conservative_count > aggressive_count) {
      profile.risk_tolerance = "low";
    }
  }
  
  // Analyze trading style preferences
  const mode_selections = interactions.filter(i => 
    i.content.includes('waidbot') || i.content.includes('autonomous')
  );
  
  const autonomous_preference = mode_selections.filter(i => 
    i.content.includes('autonomous')
  ).length;
  
  const manual_preference = mode_selections.filter(i => 
    i.content.includes('waidbot') && !i.content.includes('pro')
  ).length;
  
  const pro_preference = mode_selections.filter(i => 
    i.content.includes('pro')
  ).length;
  
  if (autonomous_preference > manual_preference && autonomous_preference > pro_preference) {
    profile.preferred_automation = "full";
    profile.trading_style = "hands_off";
  } else if (manual_preference > pro_preference) {
    profile.preferred_automation = "minimal";
    profile.trading_style = "hands_on";
  }
  
  // Analyze decision speed
  const response_times = interactions.map(i => i.response_time || 5000);
  const avg_response_time = response_times.reduce((a, b) => a + b, 0) / response_times.length;
  
  if (avg_response_time < 2000) {
    profile.decision_speed = "fast";
  } else if (avg_response_time > 8000) {
    profile.decision_speed = "slow";
  }
  
  return profile;
}

// Analyze user's communication style
function analyzeCommunicationStyle(message) {
  const style = {
    formality: "balanced",
    verbosity: "normal",
    emotional_expression: "moderate",
    question_style: "direct",
    feedback_preference: "constructive"
  };
  
  const lower = message.toLowerCase();
  const word_count = message.split(' ').length;
  
  // Analyze formality
  const formal_indicators = ['please', 'thank you', 'would you', 'could you'];
  const informal_indicators = ["let's", "gonna", "wanna", '!', 'awesome', 'cool'];
  
  const formal_count = formal_indicators.filter(ind => lower.includes(ind)).length;
  const informal_count = informal_indicators.filter(ind => lower.includes(ind)).length;
  
  if (formal_count > informal_count) {
    style.formality = "formal";
  } else if (informal_count > formal_count) {
    style.formality = "casual";
  }
  
  // Analyze verbosity
  if (word_count > 30) {
    style.verbosity = "verbose";
  } else if (word_count < 10) {
    style.verbosity = "concise";
  }
  
  // Analyze emotional expression
  const emotional_words = ['excited', 'worried', 'love', 'hate', 'amazing', 'terrible'];
  const emotional_count = emotional_words.filter(word => lower.includes(word)).length;
  
  if (emotional_count > 2) {
    style.emotional_expression = "high";
  } else if (emotional_count === 0) {
    style.emotional_expression = "low";
  }
  
  // Analyze question style
  if (lower.includes('how') || lower.includes('why') || lower.includes('explain')) {
    style.question_style = "explanatory";
  } else if (lower.includes('what') || lower.includes('which')) {
    style.question_style = "factual";
  }
  
  return style;
}

// Extract preference patterns from historical data
function extractPreferencePatterns(sessionData) {
  const patterns = {
    favorite_currencies: ["ETH"],
    preferred_trading_hours: [],
    risk_preferences: {},
    information_depth: "moderate",
    response_timing: "immediate",
    guidance_level: "balanced"
  };
  
  if (!sessionData || !sessionData.interactions) {
    return patterns;
  }
  
  const interactions = sessionData.interactions;
  
  // Extract preferred trading hours
  const trading_interactions = interactions.filter(i => 
    i.category === 'trading_decision' && i.timestamp
  );
  
  const hour_counts = {};
  trading_interactions.forEach(interaction => {
    const hour = new Date(interaction.timestamp).getHours();
    hour_counts[hour] = (hour_counts[hour] || 0) + 1;
  });
  
  // Find top 3 preferred hours
  patterns.preferred_trading_hours = Object.entries(hour_counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour,]) => parseInt(hour));
  
  // Extract information depth preference
  const question_interactions = interactions.filter(i => 
    i.content.includes('?') || i.category === 'question'
  );
  
  const detailed_questions = question_interactions.filter(i =>
    i.content.includes('explain') || i.content.includes('how') || i.content.includes('why')
  ).length;
  
  const simple_questions = question_interactions.filter(i =>
    i.content.includes('what') || i.content.includes('when') || i.content.split(' ').length < 8
  ).length;
  
  if (detailed_questions > simple_questions) {
    patterns.information_depth = "detailed";
  } else if (simple_questions > detailed_questions) {
    patterns.information_depth = "simple";
  }
  
  return patterns;
}

// Calculate how well KonsAi has adapted to user
function calculateAdaptationLevel(profile) {
  let adaptation_score = 0.5; // Base adaptation
  
  // Boost score based on profile completeness
  const profile_completeness = Object.values(profile).filter(value => 
    value !== "unknown" && value !== "moderate" && value !== "normal"
  ).length / Object.keys(profile).length;
  
  adaptation_score += profile_completeness * 0.3;
  
  // Boost score based on specific preferences learned
  if (profile.risk_tolerance !== "moderate") adaptation_score += 0.1;
  if (profile.preferred_automation !== "semi") adaptation_score += 0.1;
  if (profile.decision_speed !== "normal") adaptation_score += 0.05;
  
  return Math.min(adaptation_score, 0.95);
}

// Generate personalization recommendations
function generatePersonalization(profile, style) {
  const personalization = {
    response_tone: "balanced",
    information_level: "moderate",
    automation_suggestions: [],
    communication_adjustments: [],
    workflow_optimizations: []
  };
  
  // Adjust response tone based on communication style
  if (style.formality === "formal") {
    personalization.response_tone = "professional";
    personalization.communication_adjustments.push("Use more formal language");
  } else if (style.formality === "casual") {
    personalization.response_tone = "friendly";
    personalization.communication_adjustments.push("Use casual, conversational tone");
  }
  
  // Adjust information level
  if (style.verbosity === "verbose") {
    personalization.information_level = "detailed";
    personalization.communication_adjustments.push("Provide comprehensive explanations");
  } else if (style.verbosity === "concise") {
    personalization.information_level = "minimal";
    personalization.communication_adjustments.push("Keep responses brief and direct");
  }
  
  // Automation suggestions based on profile
  if (profile.risk_tolerance === "high" && profile.decision_speed === "fast") {
    personalization.automation_suggestions.push("Suggest Autonomous mode for quick decisions");
  } else if (profile.risk_tolerance === "low" && profile.trading_style === "hands_on") {
    personalization.automation_suggestions.push("Recommend manual Waidbot for full control");
  } else {
    personalization.automation_suggestions.push("Default to Waidbot Pro for balanced approach");
  }
  
  // Workflow optimizations
  if (profile.decision_speed === "fast") {
    personalization.workflow_optimizations.push("Reduce confirmation steps");
    personalization.workflow_optimizations.push("Provide quick action buttons");
  } else if (profile.decision_speed === "slow") {
    personalization.workflow_optimizations.push("Add extra confirmation steps");
    personalization.workflow_optimizations.push("Provide thinking time indicators");
  }
  
  return personalization;
}

// Generate learning insights about user behavior
function generateLearningInsights(patterns) {
  const insights = [];
  
  // Trading hour insights
  if (patterns.preferred_trading_hours.length > 0) {
    const hours = patterns.preferred_trading_hours.join(', ');
    insights.push({
      category: "timing",
      insight: `User typically trades during hours: ${hours}`,
      confidence: 0.8,
      recommendation: "Suggest optimal trading windows during these hours"
    });
  }
  
  // Information depth insights
  if (patterns.information_depth === "detailed") {
    insights.push({
      category: "communication",
      insight: "User prefers detailed explanations and comprehensive analysis",
      confidence: 0.7,
      recommendation: "Provide thorough explanations with reasoning"
    });
  } else if (patterns.information_depth === "simple") {
    insights.push({
      category: "communication", 
      insight: "User prefers quick, direct answers without excessive detail",
      confidence: 0.7,
      recommendation: "Keep responses concise and action-focused"
    });
  }
  
  return insights;
}

// Remember user preferences (to be called after interactions)
export function rememberPreference(category, preference, context = {}) {
  const memory_entry = {
    id: Date.now(),
    timestamp: Date.now(),
    category,
    preference,
    context,
    confidence: 0.8,
    frequency: 1
  };
  
  // In real implementation, this would save to database
  console.log("🧠 Remembering preference:", memory_entry);
  
  return memory_entry;
}

// Adapt to user feedback (to be called when user gives feedback)
export function adaptToFeedback(feedback, context) {
  const adaptation = {
    feedback_type: classifyFeedback(feedback),
    adjustment_needed: generateAdjustment(feedback),
    confidence_impact: calculateConfidenceImpact(feedback),
    learning_opportunity: extractLearningOpportunity(feedback, context)
  };
  
  console.log("🎯 Adapting based on feedback:", adaptation);
  
  return adaptation;
}

// Classify type of feedback received
function classifyFeedback(feedback) {
  const lower = feedback.toLowerCase();
  
  if (lower.includes('good') || lower.includes('perfect') || lower.includes('great')) {
    return 'positive';
  }
  
  if (lower.includes('wrong') || lower.includes('bad') || lower.includes('not')) {
    return 'negative';
  }
  
  if (lower.includes('but') || lower.includes('however') || lower.includes('except')) {
    return 'mixed';
  }
  
  return 'neutral';
}

// Generate adjustment based on feedback
function generateAdjustment(feedback) {
  const adjustments = [];
  const lower = feedback.toLowerCase();
  
  if (lower.includes('too fast')) {
    adjustments.push('slow_down_responses');
  }
  
  if (lower.includes('too slow')) {
    adjustments.push('speed_up_responses');
  }
  
  if (lower.includes('too complex')) {
    adjustments.push('simplify_explanations');
  }
  
  if (lower.includes('more detail')) {
    adjustments.push('increase_detail_level');
  }
  
  return adjustments;
}

// Calculate how feedback impacts confidence
function calculateConfidenceImpact(feedback) {
  const feedback_type = classifyFeedback(feedback);
  
  const impacts = {
    positive: 0.1,
    negative: -0.2,
    mixed: 0.0,
    neutral: 0.0
  };
  
  return impacts[feedback_type] || 0;
}

// Extract learning opportunity from feedback
function extractLearningOpportunity(feedback, context) {
  return {
    area: context.category || 'general',
    lesson: feedback,
    application: "Apply this feedback to similar future situations",
    priority: classifyFeedback(feedback) === 'negative' ? 'high' : 'medium'
  };
}