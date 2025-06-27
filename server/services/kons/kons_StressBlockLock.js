// Kons_StressBlockLock - Blocks impulsive trades when stress is detected
export function kons_StressBlockLock(userMessage, marketData, previousState = {}) {
  const state = {
    stress_level: 0.3,
    block_active: false,
    lockdown_reason: '',
    cooldown_time: 0,
    ...previousState
  };

  function detectStressSignals(message) {
    const stressIndicators = {
      high: ['panic', 'emergency', 'urgent', 'crisis', 'disaster', 'falling', 'crashing'],
      medium: ['worried', 'nervous', 'scared', 'anxious', 'stressed', 'pressure'],
      low: ['concerned', 'uncertain', 'unsure', 'doubt', 'hesitant']
    };

    let stressScore = 0;
    let indicators = [];

    // Check for high stress words
    stressIndicators.high.forEach(word => {
      if (message.toLowerCase().includes(word)) {
        stressScore += 0.3;
        indicators.push({ word, level: 'high' });
      }
    });

    // Check for medium stress words
    stressIndicators.medium.forEach(word => {
      if (message.toLowerCase().includes(word)) {
        stressScore += 0.2;
        indicators.push({ word, level: 'medium' });
      }
    });

    // Check for low stress words
    stressIndicators.low.forEach(word => {
      if (message.toLowerCase().includes(word)) {
        stressScore += 0.1;
        indicators.push({ word, level: 'low' });
      }
    });

    // Check for impulsive patterns
    const impulsivePatterns = ['sell everything', 'buy now', 'all in', 'quick trade', 'fast money'];
    impulsivePatterns.forEach(pattern => {
      if (message.toLowerCase().includes(pattern)) {
        stressScore += 0.4;
        indicators.push({ word: pattern, level: 'impulsive' });
      }
    });

    return { stressScore: Math.min(1.0, stressScore), indicators };
  }

  function shouldActivateLock(stressScore, indicators) {
    if (stressScore > 0.7) {
      return {
        activate: true,
        reason: 'High stress detected - protecting from impulsive decisions',
        cooldown: 30 // minutes
      };
    }
    
    if (stressScore > 0.5 && indicators.some(i => i.level === 'impulsive')) {
      return {
        activate: true,
        reason: 'Impulsive trading pattern detected',
        cooldown: 15
      };
    }

    if (stressScore > 0.4 && indicators.length >= 3) {
      return {
        activate: true,
        reason: 'Multiple stress indicators detected',
        cooldown: 10
      };
    }

    return { activate: false, reason: '', cooldown: 0 };
  }

  const { stressScore, indicators } = detectStressSignals(userMessage);
  const lockDecision = shouldActivateLock(stressScore, indicators);
  
  state.stress_level = stressScore;
  state.block_active = lockDecision.activate;
  state.lockdown_reason = lockDecision.reason;
  state.cooldown_time = lockDecision.cooldown;

  if (state.block_active) {
    return {
      kons: 'StressBlockLock',
      block_status: 'ACTIVE',
      stress_analysis: {
        level: stressScore,
        indicators: indicators,
        risk_assessment: 'HIGH'
      },
      lockdown: {
        active: true,
        reason: state.lockdown_reason,
        cooldown_minutes: state.cooldown_time,
        safety_message: 'Trading blocked for your protection. Take time to breathe and reassess.'
      },
      recommendations: [
        'Take 5 deep breaths',
        'Step away from charts for 10 minutes',
        'Review your trading plan when calm',
        'Consider your long-term goals'
      ]
    };
  }

  return {
    kons: 'StressBlockLock',
    block_status: 'MONITORING',
    stress_analysis: {
      level: stressScore,
      indicators: indicators,
      risk_assessment: stressScore > 0.3 ? 'MEDIUM' : 'LOW'
    },
    safety_status: 'Clear to trade with normal caution'
  };
}