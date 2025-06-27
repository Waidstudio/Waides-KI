/**
 * Kons_SessionTimer - Session Duration Management and Break Recommendations
 * Tracks trading session time and suggests optimal break periods
 */

export function kons_SessionTimer(userMessage, marketData, previousState = {}) {
  const sessionStart = previousState.session_start || Date.now();
  const currentTime = Date.now();
  const sessionDuration = currentTime - sessionStart;
  
  // Session analysis
  function analyzeSessionDuration() {
    const hours = sessionDuration / (1000 * 60 * 60);
    const minutes = Math.floor((sessionDuration % (1000 * 60 * 60)) / (1000 * 60));
    
    let status = 'OPTIMAL';
    let recommendation = 'Continue trading with current focus';
    let break_needed = false;
    
    if (hours >= 4) {
      status = 'FATIGUE_RISK';
      recommendation = 'Take a 30-minute break - extended sessions reduce decision quality';
      break_needed = true;
    } else if (hours >= 2) {
      status = 'ATTENTION_CHECK';
      recommendation = 'Consider a 10-minute break to maintain sharp focus';
      break_needed = false;
    } else if (hours >= 1) {
      status = 'HEALTHY_FLOW';
      recommendation = 'Good trading rhythm - stay hydrated and maintain posture';
      break_needed = false;
    }
    
    return {
      status,
      hours: Math.floor(hours),
      minutes,
      recommendation,
      break_needed,
      next_break_in: break_needed ? 0 : Math.max(0, 120 - minutes - (hours * 60))
    };
  }
  
  // Productivity scoring
  function calculateProductivityScore() {
    const optimalRange = sessionDuration >= (1000 * 60 * 30) && sessionDuration <= (1000 * 60 * 150); // 30min to 2.5h
    const baseScore = optimalRange ? 85 : Math.max(40, 85 - Math.abs(sessionDuration - (1000 * 60 * 90)) / (1000 * 60 * 10));
    
    return {
      score: Math.round(baseScore),
      optimal_range: optimalRange,
      efficiency: baseScore > 75 ? 'HIGH' : baseScore > 60 ? 'MEDIUM' : 'LOW'
    };
  }
  
  const sessionAnalysis = analyzeSessionDuration();
  const productivity = calculateProductivityScore();
  
  return {
    kons: "SessionTimer",
    timestamp: currentTime,
    session_duration: {
      total_ms: sessionDuration,
      hours: sessionAnalysis.hours,
      minutes: sessionAnalysis.minutes,
      status: sessionAnalysis.status,
      recommendation: sessionAnalysis.recommendation
    },
    break_management: {
      break_needed: sessionAnalysis.break_needed,
      next_break_in: sessionAnalysis.next_break_in,
      break_type: sessionAnalysis.break_needed ? 'MANDATORY' : 'OPTIONAL'
    },
    productivity: productivity,
    session_state: {
      session_start: sessionStart,
      focus_level: productivity.score,
      energy_estimate: Math.max(20, 100 - (sessionDuration / (1000 * 60 * 3))) // Decreases over 3h
    }
  };
}