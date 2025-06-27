// Kons_TradeGhostPrime - Mimics expert trader behaviors invisibly
export function kons_TradeGhostPrime(userMessage, marketData, previousState = {}) {
  const expertProfiles = {
    scalper: { timing: 'instant', risk: 0.5, patience: 0.2 },
    swing_trader: { timing: 'hours', risk: 0.3, patience: 0.8 },
    day_trader: { timing: 'minutes', risk: 0.4, patience: 0.5 },
    position_trader: { timing: 'days', risk: 0.2, patience: 0.9 }
  };

  const state = {
    active_ghost: 'swing_trader',
    mimicry_confidence: 0.85,
    ghost_actions: [],
    stealth_mode: true,
    ...previousState
  };

  function selectExpertGhost(message, market) {
    if (message.includes('quick') || message.includes('scalp')) return 'scalper';
    if (message.includes('swing') || message.includes('hold')) return 'swing_trader';
    if (message.includes('day') || message.includes('active')) return 'day_trader';
    if (message.includes('long') || message.includes('position')) return 'position_trader';
    return 'swing_trader'; // default
  }

  function generateGhostBehavior(ghostType, market) {
    const profile = expertProfiles[ghostType];
    const actions = [];

    // Risk management behavior
    actions.push({
      type: 'risk_check',
      action: `Set stop loss at ${(profile.risk * 100).toFixed(1)}% based on ${ghostType} style`,
      confidence: profile.patience
    });

    // Entry timing behavior
    actions.push({
      type: 'entry_timing',
      action: profile.timing === 'instant' ? 'Enter immediately on signal' : `Wait for ${profile.timing} confirmation`,
      confidence: 0.8
    });

    // Position sizing behavior
    const positionSize = profile.risk < 0.3 ? 'conservative' : profile.risk < 0.5 ? 'moderate' : 'aggressive';
    actions.push({
      type: 'position_sizing',
      action: `Use ${positionSize} position sizing (${profile.risk * 100}% risk)`,
      confidence: profile.patience
    });

    return actions;
  }

  const selectedGhost = selectExpertGhost(userMessage, marketData);
  const ghostActions = generateGhostBehavior(selectedGhost, marketData);
  
  state.active_ghost = selectedGhost;
  state.ghost_actions = ghostActions;
  state.mimicry_confidence = expertProfiles[selectedGhost].patience;

  return {
    kons: 'TradeGhostPrime',
    active_ghost: state.active_ghost,
    expert_mimicry: {
      profile: expertProfiles[selectedGhost],
      confidence: state.mimicry_confidence,
      stealth_active: state.stealth_mode
    },
    ghost_recommendations: ghostActions,
    invisible_guidance: `Trading like ${selectedGhost.replace('_', ' ')} - ${ghostActions.length} behaviors active`
  };
}