// Kons_BreathScanEngine - Reads breath rhythm to assess emotional readiness
export function kons_BreathScanEngine(userMessage, marketData, previousState = {}) {
  const state = {
    breath_rhythm: 'normal',
    emotional_state: 'stable',
    readiness_score: 0.8,
    stress_level: 0.2,
    ...previousState
  };

  function analyzeBreathPattern(message) {
    // Analyze typing patterns and language for breath indicators
    const urgentWords = ['quick', 'fast', 'now', 'urgent', 'hurry'];
    const calmWords = ['wait', 'think', 'consider', 'maybe', 'perhaps'];
    const stressWords = ['worried', 'scared', 'nervous', 'panic', 'fear'];
    
    const urgentCount = urgentWords.filter(word => message.toLowerCase().includes(word)).length;
    const calmCount = calmWords.filter(word => message.toLowerCase().includes(word)).length;
    const stressCount = stressWords.filter(word => message.toLowerCase().includes(word)).length;
    
    let breathRhythm = 'normal';
    let stressLevel = 0.2;
    
    if (urgentCount > calmCount) {
      breathRhythm = 'rapid';
      stressLevel = Math.min(0.8, 0.3 + urgentCount * 0.1);
    } else if (calmCount > urgentCount) {
      breathRhythm = 'calm';
      stressLevel = Math.max(0.1, 0.2 - calmCount * 0.05);
    }
    
    if (stressCount > 0) {
      breathRhythm = 'erratic';
      stressLevel = Math.min(0.9, stressLevel + stressCount * 0.2);
    }
    
    return { breathRhythm, stressLevel };
  }

  function assessEmotionalReadiness(breathRhythm, stressLevel) {
    let emotionalState = 'stable';
    let readinessScore = 0.8;
    
    switch (breathRhythm) {
      case 'calm':
        emotionalState = 'centered';
        readinessScore = 0.95;
        break;
      case 'rapid':
        emotionalState = 'excited';
        readinessScore = 0.6;
        break;
      case 'erratic':
        emotionalState = 'unstable';
        readinessScore = 0.3;
        break;
      default:
        emotionalState = 'stable';
        readinessScore = 0.8;
    }
    
    // Adjust based on stress level
    readinessScore = Math.max(0.1, readinessScore - stressLevel);
    
    return { emotionalState, readinessScore };
  }

  const { breathRhythm, stressLevel } = analyzeBreathPattern(userMessage);
  const { emotionalState, readinessScore } = assessEmotionalReadiness(breathRhythm, stressLevel);
  
  state.breath_rhythm = breathRhythm;
  state.emotional_state = emotionalState;
  state.readiness_score = readinessScore;
  state.stress_level = stressLevel;

  return {
    kons: 'BreathScanEngine',
    breath_analysis: {
      rhythm: state.breath_rhythm,
      emotional_state: state.emotional_state,
      readiness_score: state.readiness_score,
      stress_level: state.stress_level
    },
    trading_recommendation: readinessScore > 0.7 ? 'proceed_with_caution' : 'recommend_pause',
    breath_guidance: readinessScore < 0.5 ? 'Take 3 deep breaths before trading' : 'Emotional state suitable for trading'
  };
}