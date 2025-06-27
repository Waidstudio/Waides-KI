/**
 * Kons_FatigueAlert - Mental Fatigue Detection and Alert System
 * Monitors trading behavior patterns to detect fatigue and recommend breaks
 */

export function kons_FatigueAlert(userMessage, marketData, previousState = {}) {
  const currentTime = Date.now();
  const recentActions = previousState.recent_actions || [];
  const errorCount = previousState.error_count || 0;
  const decisionSpeed = previousState.decision_speed || [];
  
  // Add current action to tracking
  recentActions.push({
    timestamp: currentTime,
    message: userMessage,
    type: detectActionType(userMessage)
  });
  
  // Keep only last 50 actions
  if (recentActions.length > 50) {
    recentActions.splice(0, recentActions.length - 50);
  }
  
  function detectActionType(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('buy') || lowerMessage.includes('sell')) return 'TRADE';
    if (lowerMessage.includes('chart') || lowerMessage.includes('analysis')) return 'ANALYSIS';
    if (lowerMessage.includes('what') || lowerMessage.includes('how')) return 'QUESTION';
    return 'GENERAL';
  }
  
  function calculateFatigueScore() {
    const now = Date.now();
    const lastHour = recentActions.filter(action => now - action.timestamp < 3600000);
    const lastTenMinutes = recentActions.filter(action => now - action.timestamp < 600000);
    
    // High activity indicator
    const actionFrequency = lastTenMinutes.length / 10; // actions per minute
    
    // Repetitive behavior indicator
    const repetitiveScore = calculateRepetitiveScore(lastHour);
    
    // Speed degradation
    const speedScore = calculateSpeedDegradation();
    
    const totalScore = Math.min(100, (actionFrequency * 15) + (repetitiveScore * 25) + (speedScore * 30) + (errorCount * 10));
    
    return {
      total_score: Math.round(totalScore),
      action_frequency: actionFrequency,
      repetitive_score: repetitiveScore,
      speed_degradation: speedScore,
      error_factor: errorCount
    };
  }
  
  function calculateRepetitiveScore(actions) {
    if (actions.length < 5) return 0;
    
    const types = actions.map(a => a.type);
    const uniqueTypes = [...new Set(types)];
    
    return Math.max(0, (types.length - uniqueTypes.length * 2) / types.length * 100);
  }
  
  function calculateSpeedDegradation() {
    if (decisionSpeed.length < 3) return 0;
    
    const recent = decisionSpeed.slice(-5);
    const earlier = decisionSpeed.slice(-15, -10);
    
    if (earlier.length === 0) return 0;
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    return Math.max(0, ((recentAvg - earlierAvg) / earlierAvg) * 100);
  }
  
  const fatigueAnalysis = calculateFatigueScore();
  
  let alertLevel = 'NORMAL';
  let recommendation = 'Continue with current pace';
  let immediateAction = false;
  
  if (fatigueAnalysis.total_score >= 80) {
    alertLevel = 'CRITICAL';
    recommendation = 'STOP TRADING - Take a 2-hour break immediately. Fatigue compromises judgment';
    immediateAction = true;
  } else if (fatigueAnalysis.total_score >= 60) {
    alertLevel = 'HIGH';
    recommendation = 'Take a 30-minute break. Pattern shows declining performance';
    immediateAction = true;
  } else if (fatigueAnalysis.total_score >= 40) {
    alertLevel = 'MODERATE';
    recommendation = 'Consider a 10-minute break and check your hydration';
    immediateAction = false;
  }
  
  return {
    kons: "FatigueAlert",
    timestamp: currentTime,
    fatigue_analysis: fatigueAnalysis,
    alert_system: {
      level: alertLevel,
      immediate_action: immediateAction,
      recommendation: recommendation,
      confidence: Math.min(95, fatigueAnalysis.total_score + 15)
    },
    monitoring: {
      recent_actions: recentActions.length,
      tracking_window: '1 hour',
      next_check_in: 600000 // 10 minutes
    },
    state_update: {
      recent_actions: recentActions,
      error_count: errorCount,
      decision_speed: decisionSpeed
    }
  };
}