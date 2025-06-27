// kons_MetaGuard.js - Moral and Ethical Trading Conflict Detection Module
export function kons_MetaGuard(userMessage, tradingContext, previousState = {}) {
  const ethical_analysis = analyzeEthicalImplications(userMessage, tradingContext);
  const moral_assessment = assessMoralAlignment(userMessage, tradingContext);
  const conflict_detection = detectConflicts(ethical_analysis, moral_assessment);
  const guidance_recommendations = generateGuidance(conflict_detection);
  
  return {
    kons: "MetaGuard",
    ethical_analysis,
    moral_assessment,
    conflict_detection,
    guidance_recommendations,
    clearance_level: calculateClearanceLevel(conflict_detection),
    sacred_alignment: assessSacredAlignment(userMessage, tradingContext)
  };
}

// Analyze ethical implications of trading decision
function analyzeEthicalImplications(message, context) {
  const ethical_flags = {
    manipulation_intent: detectManipulationIntent(message),
    harm_potential: assessHarmPotential(message, context),
    unfair_advantage: detectUnfairAdvantage(message),
    transparency_issues: assessTransparency(message),
    social_impact: evaluateSocialImpact(message, context)
  };
  
  return {
    flags: ethical_flags,
    risk_level: calculateEthicalRisk(ethical_flags),
    recommendations: generateEthicalRecommendations(ethical_flags)
  };
}

// Assess moral alignment with sacred principles
function assessMoralAlignment(message, context) {
  const moral_principles = {
    honesty: assessHonesty(message),
    integrity: assessIntegrity(message, context),
    compassion: assessCompassion(message),
    wisdom: assessWisdom(message, context),
    responsibility: assessResponsibility(message, context)
  };
  
  const alignment_score = Object.values(moral_principles).reduce((sum, score) => sum + score, 0) / Object.keys(moral_principles).length;
  
  return {
    principles: moral_principles,
    alignment_score,
    moral_grade: gradeMoralAlignment(alignment_score),
    areas_for_growth: identifyGrowthAreas(moral_principles)
  };
}

// Detect manipulation intent in trading requests
function detectManipulationIntent(message) {
  const manipulation_indicators = [
    "pump", "dump", "manipulation", "fake", "deceive", "trick", "exploit",
    "insider", "guaranteed", "secret", "hidden", "rig", "cheat"
  ];
  
  const lower = message.toLowerCase();
  const detected_indicators = manipulation_indicators.filter(indicator => 
    lower.includes(indicator)
  );
  
  return {
    detected: detected_indicators.length > 0,
    indicators: detected_indicators,
    severity: detected_indicators.length > 2 ? "high" : detected_indicators.length > 0 ? "medium" : "none"
  };
}

// Assess potential for harm in trading strategy
function assessHarmPotential(message, context) {
  const harm_indicators = {
    financial_ruin: message.toLowerCase().includes("all in") || message.toLowerCase().includes("everything"),
    emotional_damage: message.toLowerCase().includes("revenge") || message.toLowerCase().includes("desperate"),
    family_impact: message.toLowerCase().includes("family") && message.toLowerCase().includes("money"),
    addiction_signs: message.toLowerCase().includes("can't stop") || message.toLowerCase().includes("addicted")
  };
  
  const harm_count = Object.values(harm_indicators).filter(Boolean).length;
  
  return {
    indicators: harm_indicators,
    level: harm_count > 2 ? "high" : harm_count > 0 ? "medium" : "low",
    protection_needed: harm_count > 0
  };
}

// Detect attempts to gain unfair advantage
function detectUnfairAdvantage(message) {
  const unfair_indicators = [
    "inside information", "insider", "guaranteed", "sure thing", "can't lose",
    "market maker", "whale signals", "private group"
  ];
  
  const lower = message.toLowerCase();
  const detected = unfair_indicators.filter(indicator => lower.includes(indicator));
  
  return {
    detected: detected.length > 0,
    indicators: detected,
    fairness_score: Math.max(0, 1 - (detected.length * 0.3))
  };
}

// Assess transparency of trading approach
function assessTransparency(message) {
  const transparency_indicators = {
    open_strategy: message.toLowerCase().includes("explain") || message.toLowerCase().includes("understand"),
    hidden_agenda: message.toLowerCase().includes("secret") || message.toLowerCase().includes("don't tell"),
    clear_intent: !message.toLowerCase().includes("just do it") && !message.toLowerCase().includes("no questions")
  };
  
  const transparency_score = Object.values(transparency_indicators).filter(Boolean).length / Object.keys(transparency_indicators).length;
  
  return {
    indicators: transparency_indicators,
    score: transparency_score,
    level: transparency_score > 0.7 ? "high" : transparency_score > 0.4 ? "medium" : "low"
  };
}

// Evaluate social impact of trading decisions
function evaluateSocialImpact(message, context) {
  const impact_factors = {
    community_benefit: message.toLowerCase().includes("help") || message.toLowerCase().includes("community"),
    personal_only: message.toLowerCase().includes("just me") || message.toLowerCase().includes("only myself"),
    sharing_knowledge: message.toLowerCase().includes("teach") || message.toLowerCase().includes("share"),
    hoarding_gains: message.toLowerCase().includes("secret") && message.toLowerCase().includes("profit")
  };
  
  let impact_score = 0.5; // Neutral baseline
  
  if (impact_factors.community_benefit) impact_score += 0.3;
  if (impact_factors.sharing_knowledge) impact_score += 0.2;
  if (impact_factors.personal_only) impact_score -= 0.1;
  if (impact_factors.hoarding_gains) impact_score -= 0.3;
  
  return {
    factors: impact_factors,
    score: Math.max(0, Math.min(1, impact_score)),
    category: impact_score > 0.7 ? "positive" : impact_score < 0.3 ? "concerning" : "neutral"
  };
}

// Assess honesty in user communication
function assessHonesty(message) {
  const honesty_indicators = {
    straightforward: !message.toLowerCase().includes("don't mention") && !message.toLowerCase().includes("keep quiet"),
    admits_uncertainty: message.toLowerCase().includes("not sure") || message.toLowerCase().includes("don't know"),
    no_deception: !message.toLowerCase().includes("pretend") && !message.toLowerCase().includes("fake")
  };
  
  return Object.values(honesty_indicators).filter(Boolean).length / Object.keys(honesty_indicators).length;
}

// Assess integrity in trading approach
function assessIntegrity(message, context) {
  const integrity_factors = {
    consistent_values: !detectValueContradictions(message),
    ethical_means: !message.toLowerCase().includes("whatever it takes") || message.toLowerCase().includes("ethically"),
    long_term_thinking: message.toLowerCase().includes("sustainable") || message.toLowerCase().includes("long term")
  };
  
  return Object.values(integrity_factors).filter(Boolean).length / Object.keys(integrity_factors).length;
}

// Assess compassion in trading decisions
function assessCompassion(message) {
  const compassion_indicators = {
    considers_others: message.toLowerCase().includes("others") || message.toLowerCase().includes("family"),
    not_greedy: !message.toLowerCase().includes("all the money") && !message.toLowerCase().includes("everything"),
    responsible_risk: message.toLowerCase().includes("careful") || message.toLowerCase().includes("responsible")
  };
  
  return Object.values(compassion_indicators).filter(Boolean).length / Object.keys(compassion_indicators).length;
}

// Assess wisdom in approach
function assessWisdom(message, context) {
  const wisdom_indicators = {
    seeks_understanding: message.toLowerCase().includes("learn") || message.toLowerCase().includes("understand"),
    patient_approach: message.toLowerCase().includes("patient") || message.toLowerCase().includes("gradual"),
    risk_aware: message.toLowerCase().includes("risk") || message.toLowerCase().includes("careful"),
    balanced_perspective: !message.toLowerCase().includes("only") && !message.toLowerCase().includes("always")
  };
  
  return Object.values(wisdom_indicators).filter(Boolean).length / Object.keys(wisdom_indicators).length;
}

// Assess responsibility in decisions
function assessResponsibility(message, context) {
  const responsibility_indicators = {
    accepts_consequences: !message.toLowerCase().includes("not my fault") && !message.toLowerCase().includes("blame"),
    considers_impact: message.toLowerCase().includes("impact") || message.toLowerCase().includes("consequences"),
    seeks_guidance: message.toLowerCase().includes("advice") || message.toLowerCase().includes("guidance"),
    owns_decisions: message.toLowerCase().includes("my decision") || message.toLowerCase().includes("i choose")
  };
  
  return Object.values(responsibility_indicators).filter(Boolean).length / Object.keys(responsibility_indicators).length;
}

// Detect value contradictions in message
function detectValueContradictions(message) {
  const contradictions = [
    ["honest", "deceive"],
    ["fair", "cheat"],
    ["responsible", "reckless"],
    ["careful", "all in"],
    ["sustainable", "quick buck"]
  ];
  
  const lower = message.toLowerCase();
  return contradictions.some(([positive, negative]) => 
    lower.includes(positive) && lower.includes(negative)
  );
}

// Detect conflicts between ethical and moral assessments
function detectConflicts(ethicalAnalysis, moralAssessment) {
  const conflicts = [];
  
  // High ethical risk with high moral alignment - internal conflict
  if (ethicalAnalysis.risk_level === "high" && moralAssessment.alignment_score > 0.7) {
    conflicts.push({
      type: "internal_conflict",
      description: "High moral values but potentially unethical trading approach",
      severity: "medium",
      resolution: "Align trading methods with personal values"
    });
  }
  
  // Manipulation intent with high integrity score - contradiction
  if (ethicalAnalysis.flags.manipulation_intent.detected && moralAssessment.principles.integrity > 0.7) {
    conflicts.push({
      type: "integrity_contradiction",
      description: "Manipulation intent conflicts with integrity values",
      severity: "high",
      resolution: "Choose honest trading strategies that honor your integrity"
    });
  }
  
  // Harm potential with high compassion - empathy conflict
  if (ethicalAnalysis.flags.harm_potential.level === "high" && moralAssessment.principles.compassion > 0.6) {
    conflicts.push({
      type: "compassion_conflict",
      description: "Potentially harmful approach conflicts with compassionate nature",
      severity: "high",
      resolution: "Consider the impact on yourself and loved ones"
    });
  }
  
  return {
    conflicts,
    severity: conflicts.length > 0 ? Math.max(...conflicts.map(c => c.severity === "high" ? 3 : c.severity === "medium" ? 2 : 1)) : 0,
    resolution_needed: conflicts.length > 0
  };
}

// Calculate overall ethical risk level
function calculateEthicalRisk(flags) {
  let risk_score = 0;
  
  if (flags.manipulation_intent.severity === "high") risk_score += 0.4;
  else if (flags.manipulation_intent.severity === "medium") risk_score += 0.2;
  
  if (flags.harm_potential.level === "high") risk_score += 0.3;
  else if (flags.harm_potential.level === "medium") risk_score += 0.15;
  
  if (flags.unfair_advantage.detected) risk_score += 0.2;
  if (flags.transparency_issues.level === "low") risk_score += 0.1;
  if (flags.social_impact.category === "concerning") risk_score += 0.15;
  
  if (risk_score > 0.6) return "high";
  if (risk_score > 0.3) return "medium";
  return "low";
}

// Generate ethical recommendations
function generateEthicalRecommendations(flags) {
  const recommendations = [];
  
  if (flags.manipulation_intent.detected) {
    recommendations.push("Avoid manipulation tactics. Focus on legitimate analysis and strategy.");
  }
  
  if (flags.harm_potential.protection_needed) {
    recommendations.push("Consider the potential impact on your wellbeing and loved ones.");
  }
  
  if (flags.unfair_advantage.detected) {
    recommendations.push("Seek advantage through skill and knowledge, not unfair information.");
  }
  
  if (flags.transparency_issues.level === "low") {
    recommendations.push("Be transparent about your intentions and methods.");
  }
  
  if (flags.social_impact.category === "concerning") {
    recommendations.push("Consider how your actions affect the broader community.");
  }
  
  return recommendations;
}

// Grade moral alignment
function gradeMoralAlignment(score) {
  if (score > 0.9) return "Exemplary";
  if (score > 0.8) return "Strong";
  if (score > 0.7) return "Good";
  if (score > 0.6) return "Developing";
  if (score > 0.4) return "Needs Growth";
  return "Concerning";
}

// Identify areas for moral growth
function identifyGrowthAreas(principles) {
  const growth_areas = [];
  
  Object.entries(principles).forEach(([principle, score]) => {
    if (score < 0.6) {
      growth_areas.push({
        principle,
        current_score: score,
        growth_potential: 1 - score,
        suggestions: getGrowthSuggestions(principle)
      });
    }
  });
  
  return growth_areas.sort((a, b) => b.growth_potential - a.growth_potential);
}

// Get growth suggestions for specific principles
function getGrowthSuggestions(principle) {
  const suggestions = {
    honesty: ["Practice transparent communication", "Admit when you don't know something", "Avoid deceptive language"],
    integrity: ["Align actions with values", "Keep commitments", "Act consistently"],
    compassion: ["Consider impact on others", "Practice empathy", "Balance self-interest with care for others"],
    wisdom: ["Seek to understand before acting", "Learn from experience", "Consider long-term consequences"],
    responsibility: ["Own your decisions", "Accept consequences", "Think before acting"]
  };
  
  return suggestions[principle] || ["Reflect on this principle and seek growth opportunities"];
}

// Generate guidance recommendations
function generateGuidance(conflictDetection) {
  if (!conflictDetection.resolution_needed) {
    return {
      clearance: "approved",
      message: "No ethical conflicts detected. You may proceed with confidence.",
      guidance_level: "minimal"
    };
  }
  
  const high_severity_conflicts = conflictDetection.conflicts.filter(c => c.severity === "high");
  
  if (high_severity_conflicts.length > 0) {
    return {
      clearance: "blocked",
      message: "Serious ethical conflicts detected. Please resolve these issues before proceeding.",
      conflicts: high_severity_conflicts,
      guidance_level: "intensive",
      required_actions: high_severity_conflicts.map(c => c.resolution)
    };
  }
  
  return {
    clearance: "caution",
    message: "Some ethical considerations detected. Please review and proceed mindfully.",
    conflicts: conflictDetection.conflicts,
    guidance_level: "moderate",
    suggested_actions: conflictDetection.conflicts.map(c => c.resolution)
  };
}

// Calculate clearance level for proceeding
function calculateClearanceLevel(conflictDetection) {
  if (!conflictDetection.resolution_needed) return 1.0;
  
  const severity_weights = { high: 0.4, medium: 0.2, low: 0.1 };
  const total_impact = conflictDetection.conflicts.reduce((sum, conflict) => 
    sum + (severity_weights[conflict.severity] || 0), 0
  );
  
  return Math.max(0, 1 - total_impact);
}

// Assess sacred alignment with higher principles
function assessSacredAlignment(message, context) {
  const sacred_principles = {
    divine_order: !message.toLowerCase().includes("chaos") && !message.toLowerCase().includes("destruction"),
    sacred_economy: message.toLowerCase().includes("value") || message.toLowerCase().includes("worth"),
    breath_awareness: message.toLowerCase().includes("calm") || message.toLowerCase().includes("breath"),
    spiritual_growth: message.toLowerCase().includes("learn") || message.toLowerCase().includes("grow")
  };
  
  const alignment_score = Object.values(sacred_principles).filter(Boolean).length / Object.keys(sacred_principles).length;
  
  return {
    principles: sacred_principles,
    score: alignment_score,
    blessing: alignment_score > 0.7 ? "blessed" : alignment_score > 0.4 ? "neutral" : "needs_purification"
  };
}