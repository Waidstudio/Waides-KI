// Kons_RiskSensePulse - Senses real-time risk levels and adapts
export function kons_RiskSensePulse(userMessage, marketData, previousState = {}) {
  const state = {
    risk_level: 'moderate',
    pulse_intensity: 0.5,
    adaptation_mode: 'auto',
    risk_factors: [],
    ...previousState
  };

  function calculateRiskPulse(message, market) {
    let riskScore = 0.5; // baseline moderate risk
    const riskFactors = [];

    // Market volatility risk
    if (market && market.price) {
      const volatilityIndicator = Math.random() * 0.3; // Simulated volatility
      if (volatilityIndicator > 0.2) {
        riskScore += 0.2;
        riskFactors.push({ type: 'volatility', impact: volatilityIndicator, severity: 'high' });
      }
    }

    // Message sentiment risk
    const highRiskWords = ['leverage', 'margin', 'all-in', 'yolo', 'moon', 'crash'];
    const mediumRiskWords = ['quick', 'fast', 'urgent', 'big', 'maximum'];
    
    highRiskWords.forEach(word => {
      if (message.toLowerCase().includes(word)) {
        riskScore += 0.25;
        riskFactors.push({ type: 'sentiment', trigger: word, severity: 'high' });
      }
    });

    mediumRiskWords.forEach(word => {
      if (message.toLowerCase().includes(word)) {
        riskScore += 0.1;
        riskFactors.push({ type: 'sentiment', trigger: word, severity: 'medium' });
      }
    });

    // Time-based risk (simulated market hours)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) { // Late night/early morning
      riskScore += 0.15;
      riskFactors.push({ type: 'timing', reason: 'off_hours_trading', severity: 'medium' });
    }

    return { riskScore: Math.min(1.0, riskScore), riskFactors };
  }

  function determineRiskLevel(riskScore) {
    if (riskScore < 0.3) return 'low';
    if (riskScore < 0.6) return 'moderate';
    if (riskScore < 0.8) return 'high';
    return 'extreme';
  }

  function generateAdaptations(riskLevel, factors) {
    const adaptations = [];

    switch (riskLevel) {
      case 'low':
        adaptations.push('Normal position sizing allowed');
        adaptations.push('Standard risk management protocols');
        break;
      
      case 'moderate':
        adaptations.push('Reduce position size by 25%');
        adaptations.push('Implement tighter stop losses');
        break;
      
      case 'high':
        adaptations.push('Reduce position size by 50%');
        adaptations.push('Require additional confirmation signals');
        adaptations.push('Implement emergency exit protocols');
        break;
      
      case 'extreme':
        adaptations.push('Trading suspended for safety');
        adaptations.push('Manual review required for any positions');
        adaptations.push('Risk assessment mandatory before proceeding');
        break;
    }

    // Factor-specific adaptations
    factors.forEach(factor => {
      if (factor.type === 'volatility' && factor.severity === 'high') {
        adaptations.push('Widen stop losses for volatility');
      }
      if (factor.type === 'sentiment' && factor.severity === 'high') {
        adaptations.push('Cool-down period recommended');
      }
      if (factor.type === 'timing') {
        adaptations.push('Consider delaying trades until market open');
      }
    });

    return adaptations;
  }

  const { riskScore, riskFactors } = calculateRiskPulse(userMessage, marketData);
  const riskLevel = determineRiskLevel(riskScore);
  const adaptations = generateAdaptations(riskLevel, riskFactors);
  
  state.risk_level = riskLevel;
  state.pulse_intensity = riskScore;
  state.risk_factors = riskFactors;

  return {
    kons: 'RiskSensePulse',
    risk_pulse: {
      level: riskLevel,
      intensity: riskScore,
      status: riskLevel === 'extreme' ? 'CRITICAL' : riskLevel === 'high' ? 'WARNING' : 'NORMAL'
    },
    risk_factors: riskFactors,
    adaptive_measures: adaptations,
    protection_active: riskLevel === 'high' || riskLevel === 'extreme',
    recommendations: riskLevel === 'extreme' ? 
      ['Immediate pause recommended', 'Review risk management plan', 'Reassess market conditions'] :
      ['Monitor risk factors closely', 'Apply recommended adaptations', 'Stay within risk limits']
  };
}