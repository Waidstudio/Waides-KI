/**
 * Kons_DecisionWebBuilder - Strategic Intelligence Layer
 * Maps out all trade paths visibly for comprehensive decision analysis
 */

export function kons_DecisionWebBuilder(userMessage, marketData, previousState = {}) {
  const currentTime = Date.now();
  const decisionState = previousState.decision_state || {
    active_decision_trees: [],
    path_analytics: {},
    decision_history: []
  };
  
  function buildDecisionTree(userMessage, marketData) {
    const decisionContext = analyzeDecisionContext(userMessage, marketData);
    const availablePaths = generateTradePaths(decisionContext);
    const pathAnalytics = analyzePaths(availablePaths, marketData);
    
    return {
      id: `decision_${currentTime}`,
      timestamp: currentTime,
      context: decisionContext,
      paths: availablePaths,
      analytics: pathAnalytics,
      recommended_path: selectOptimalPath(pathAnalytics),
      confidence_level: calculateOverallConfidence(pathAnalytics)
    };
  }
  
  function analyzeDecisionContext(message, marketData) {
    const lowerMessage = message.toLowerCase();
    const context = {
      decision_type: 'GENERAL',
      urgency_level: 'NORMAL',
      market_condition: 'NEUTRAL',
      user_intent: 'EXPLORE',
      constraints: [],
      opportunities: []
    };
    
    // Determine decision type
    if (lowerMessage.includes('buy') || lowerMessage.includes('long')) {
      context.decision_type = 'BUY_DECISION';
    } else if (lowerMessage.includes('sell') || lowerMessage.includes('short')) {
      context.decision_type = 'SELL_DECISION';
    } else if (lowerMessage.includes('hold') || lowerMessage.includes('wait')) {
      context.decision_type = 'HOLD_DECISION';
    } else if (lowerMessage.includes('strategy') || lowerMessage.includes('plan')) {
      context.decision_type = 'STRATEGY_DECISION';
    }
    
    // Assess urgency
    const urgencyKeywords = ['urgent', 'quickly', 'now', 'immediately', 'asap'];
    if (urgencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
      context.urgency_level = 'HIGH';
    } else if (lowerMessage.includes('eventually') || lowerMessage.includes('later')) {
      context.urgency_level = 'LOW';
    }
    
    // Analyze market condition
    if (marketData) {
      const change = marketData.change24h || 0;
      if (change > 5) context.market_condition = 'BULLISH';
      else if (change < -5) context.market_condition = 'BEARISH';
      else if (Math.abs(change) > 2) context.market_condition = 'VOLATILE';
      else context.market_condition = 'STABLE';
    }
    
    // Detect user intent
    if (lowerMessage.includes('learn') || lowerMessage.includes('understand')) {
      context.user_intent = 'LEARN';
    } else if (lowerMessage.includes('profit') || lowerMessage.includes('money')) {
      context.user_intent = 'PROFIT';
    } else if (lowerMessage.includes('safe') || lowerMessage.includes('protect')) {
      context.user_intent = 'PROTECT';
    } else if (lowerMessage.includes('risk') || lowerMessage.includes('gamble')) {
      context.user_intent = 'RISK';
    }
    
    return context;
  }
  
  function generateTradePaths(context) {
    const basePaths = {
      BUY_DECISION: [
        {
          id: 'immediate_buy',
          name: 'Immediate Market Buy',
          actions: ['market_buy', 'set_stop_loss', 'monitor_position'],
          risk_level: 'MEDIUM',
          time_horizon: 'SHORT',
          success_probability: 0.65
        },
        {
          id: 'limit_buy',
          name: 'Strategic Limit Buy',
          actions: ['set_limit_order', 'wait_for_fill', 'adjust_if_needed'],
          risk_level: 'LOW',
          time_horizon: 'MEDIUM',
          success_probability: 0.75
        },
        {
          id: 'dca_buy',
          name: 'Dollar Cost Average',
          actions: ['split_order', 'buy_in_stages', 'track_average_price'],
          risk_level: 'LOW',
          time_horizon: 'LONG',
          success_probability: 0.80
        }
      ],
      
      SELL_DECISION: [
        {
          id: 'immediate_sell',
          name: 'Immediate Market Sell',
          actions: ['market_sell', 'close_position', 'realize_pnl'],
          risk_level: 'LOW',
          time_horizon: 'SHORT',
          success_probability: 0.85
        },
        {
          id: 'limit_sell',
          name: 'Target Price Sell',
          actions: ['set_limit_order', 'wait_for_target', 'trail_stop'],
          risk_level: 'MEDIUM',
          time_horizon: 'MEDIUM',
          success_probability: 0.70
        },
        {
          id: 'staged_sell',
          name: 'Staged Exit Strategy',
          actions: ['sell_portion', 'lock_profits', 'let_rest_ride'],
          risk_level: 'MEDIUM',
          time_horizon: 'LONG',
          success_probability: 0.75
        }
      ],
      
      HOLD_DECISION: [
        {
          id: 'passive_hold',
          name: 'Passive Hold & Monitor',
          actions: ['maintain_position', 'set_alerts', 'periodic_review'],
          risk_level: 'LOW',
          time_horizon: 'LONG',
          success_probability: 0.70
        },
        {
          id: 'active_hold',
          name: 'Active Hold & Optimize',
          actions: ['rebalance_position', 'adjust_stops', 'hedge_if_needed'],
          risk_level: 'MEDIUM',
          time_horizon: 'MEDIUM',
          success_probability: 0.65
        }
      ],
      
      STRATEGY_DECISION: [
        {
          id: 'conservative_strategy',
          name: 'Conservative Approach',
          actions: ['risk_assessment', 'position_sizing', 'gradual_entry'],
          risk_level: 'LOW',
          time_horizon: 'LONG',
          success_probability: 0.85
        },
        {
          id: 'aggressive_strategy',
          name: 'Aggressive Approach',
          actions: ['technical_analysis', 'momentum_entry', 'tight_stops'],
          risk_level: 'HIGH',
          time_horizon: 'SHORT',
          success_probability: 0.55
        },
        {
          id: 'balanced_strategy',
          name: 'Balanced Approach',
          actions: ['mixed_analysis', 'moderate_sizing', 'flexible_timeframe'],
          risk_level: 'MEDIUM',
          time_horizon: 'MEDIUM',
          success_probability: 0.70
        }
      ]
    };
    
    const paths = basePaths[context.decision_type] || basePaths.STRATEGY_DECISION;
    
    // Customize paths based on context
    return paths.map(path => ({
      ...path,
      context_adjustments: applyContextAdjustments(path, context),
      market_compatibility: assessMarketCompatibility(path, context.market_condition)
    }));
  }
  
  function applyContextAdjustments(path, context) {
    const adjustments = [];
    
    // Urgency adjustments
    if (context.urgency_level === 'HIGH' && path.time_horizon === 'LONG') {
      adjustments.push({
        type: 'URGENCY_CONFLICT',
        impact: 'NEGATIVE',
        adjustment: 'Consider shorter timeframe alternatives'
      });
    }
    
    // Intent adjustments
    if (context.user_intent === 'PROTECT' && path.risk_level === 'HIGH') {
      adjustments.push({
        type: 'INTENT_MISMATCH',
        impact: 'NEGATIVE',
        adjustment: 'High risk conflicts with protection intent'
      });
    }
    
    if (context.user_intent === 'PROFIT' && path.risk_level === 'LOW') {
      adjustments.push({
        type: 'CONSERVATIVE_PROFIT',
        impact: 'NEUTRAL',
        adjustment: 'Low risk may limit profit potential'
      });
    }
    
    // Market condition adjustments
    if (context.market_condition === 'VOLATILE' && path.time_horizon === 'SHORT') {
      adjustments.push({
        type: 'VOLATILITY_RISK',
        impact: 'NEGATIVE',
        adjustment: 'High volatility increases short-term risk'
      });
    }
    
    return adjustments;
  }
  
  function assessMarketCompatibility(path, marketCondition) {
    const compatibilityMatrix = {
      'BULLISH': {
        'immediate_buy': 0.9,
        'limit_buy': 0.7,
        'dca_buy': 0.8,
        'immediate_sell': 0.4,
        'limit_sell': 0.6,
        'passive_hold': 0.9,
        'aggressive_strategy': 0.8
      },
      'BEARISH': {
        'immediate_buy': 0.3,
        'limit_buy': 0.5,
        'immediate_sell': 0.9,
        'staged_sell': 0.8,
        'passive_hold': 0.4,
        'conservative_strategy': 0.8
      },
      'VOLATILE': {
        'immediate_buy': 0.5,
        'immediate_sell': 0.5,
        'limit_buy': 0.8,
        'limit_sell': 0.8,
        'active_hold': 0.7
      },
      'STABLE': {
        'dca_buy': 0.9,
        'passive_hold': 0.9,
        'conservative_strategy': 0.9,
        'balanced_strategy': 0.8
      }
    };
    
    const compatibility = compatibilityMatrix[marketCondition]?.[path.id] || 0.6;
    
    return {
      score: compatibility,
      rating: compatibility > 0.8 ? 'EXCELLENT' : 
              compatibility > 0.6 ? 'GOOD' : 
              compatibility > 0.4 ? 'FAIR' : 'POOR',
      reason: generateCompatibilityReason(path, marketCondition, compatibility)
    };
  }
  
  function generateCompatibilityReason(path, marketCondition, score) {
    if (score > 0.8) {
      return `${path.name} is well-suited for ${marketCondition.toLowerCase()} markets`;
    } else if (score > 0.6) {
      return `${path.name} works reasonably well in ${marketCondition.toLowerCase()} conditions`;
    } else if (score > 0.4) {
      return `${path.name} has mixed compatibility with ${marketCondition.toLowerCase()} markets`;
    } else {
      return `${path.name} may not be optimal for ${marketCondition.toLowerCase()} conditions`;
    }
  }
  
  function analyzePaths(paths, marketData) {
    return paths.map(path => {
      const analytics = {
        path_id: path.id,
        strength_score: calculatePathStrength(path, marketData),
        weakness_analysis: identifyWeaknesses(path),
        opportunity_score: assessOpportunities(path, marketData),
        risk_analysis: analyzeRisks(path, marketData),
        execution_complexity: assessComplexity(path),
        resource_requirements: calculateResources(path),
        success_factors: identifySuccessFactors(path),
        failure_points: identifyFailurePoints(path)
      };
      
      analytics.overall_score = calculateOverallPathScore(analytics);
      
      return analytics;
    });
  }
  
  function calculatePathStrength(path, marketData) {
    let strength = path.success_probability * 100;
    
    // Adjust for market compatibility
    strength *= path.market_compatibility.score;
    
    // Adjust for context adjustments
    const negativeAdjustments = path.context_adjustments.filter(adj => adj.impact === 'NEGATIVE').length;
    strength -= negativeAdjustments * 15;
    
    // Risk-adjusted strength
    const riskMultiplier = { 'LOW': 1.1, 'MEDIUM': 1.0, 'HIGH': 0.85 };
    strength *= riskMultiplier[path.risk_level];
    
    return Math.max(20, Math.min(100, strength));
  }
  
  function identifyWeaknesses(path) {
    const weaknesses = [];
    
    if (path.risk_level === 'HIGH') {
      weaknesses.push('High risk exposure');
    }
    
    if (path.time_horizon === 'SHORT') {
      weaknesses.push('Limited time for position development');
    }
    
    if (path.context_adjustments.some(adj => adj.impact === 'NEGATIVE')) {
      weaknesses.push('Context misalignment');
    }
    
    if (path.market_compatibility.score < 0.5) {
      weaknesses.push('Poor market compatibility');
    }
    
    return weaknesses;
  }
  
  function assessOpportunities(path, marketData) {
    let score = 50;
    
    if (path.market_compatibility.score > 0.8) score += 20;
    if (path.risk_level === 'LOW' && marketData?.change24h > 0) score += 15;
    if (path.time_horizon === 'LONG' && marketData?.volume > 30000000) score += 10;
    
    return Math.min(100, score);
  }
  
  function analyzeRisks(path, marketData) {
    const risks = [];
    
    if (path.risk_level === 'HIGH') {
      risks.push({ type: 'POSITION_RISK', severity: 'HIGH', description: 'High position risk' });
    }
    
    if (marketData?.change24h && Math.abs(marketData.change24h) > 10) {
      risks.push({ type: 'VOLATILITY_RISK', severity: 'MEDIUM', description: 'High market volatility' });
    }
    
    if (path.time_horizon === 'SHORT') {
      risks.push({ type: 'TIME_RISK', severity: 'MEDIUM', description: 'Limited time for recovery' });
    }
    
    return risks;
  }
  
  function assessComplexity(path) {
    const actionCount = path.actions.length;
    const adjustmentCount = path.context_adjustments.length;
    
    const complexity = actionCount + adjustmentCount;
    
    if (complexity <= 3) return 'LOW';
    if (complexity <= 6) return 'MEDIUM';
    return 'HIGH';
  }
  
  function calculateResources(path) {
    return {
      time_required: path.time_horizon,
      attention_level: path.risk_level === 'HIGH' ? 'HIGH' : 'MEDIUM',
      technical_knowledge: path.actions.includes('technical_analysis') ? 'HIGH' : 'MEDIUM',
      capital_efficiency: path.risk_level === 'LOW' ? 'HIGH' : 'MEDIUM'
    };
  }
  
  function identifySuccessFactors(path) {
    const factors = [];
    
    if (path.market_compatibility.score > 0.7) {
      factors.push('Strong market alignment');
    }
    
    if (path.risk_level === 'LOW') {
      factors.push('Conservative risk profile');
    }
    
    if (path.time_horizon === 'LONG') {
      factors.push('Adequate time for development');
    }
    
    if (path.success_probability > 0.7) {
      factors.push('High historical success rate');
    }
    
    return factors;
  }
  
  function identifyFailurePoints(path) {
    const failures = [];
    
    if (path.context_adjustments.some(adj => adj.type === 'URGENCY_CONFLICT')) {
      failures.push('Timeframe mismatch with urgency');
    }
    
    if (path.market_compatibility.score < 0.5) {
      failures.push('Poor market timing');
    }
    
    if (path.risk_level === 'HIGH') {
      failures.push('Risk tolerance exceeded');
    }
    
    return failures;
  }
  
  function calculateOverallPathScore(analytics) {
    const weights = {
      strength_score: 0.3,
      opportunity_score: 0.2,
      market_compatibility: 0.2,
      risk_penalty: 0.15,
      complexity_penalty: 0.15
    };
    
    let score = analytics.strength_score * weights.strength_score;
    score += analytics.opportunity_score * weights.opportunity_score;
    score += (analytics.path_id ? 70 : 50) * weights.market_compatibility;
    score -= analytics.risk_analysis.length * 10 * weights.risk_penalty;
    score -= (analytics.execution_complexity === 'HIGH' ? 20 : 0) * weights.complexity_penalty;
    
    return Math.max(20, Math.min(100, score));
  }
  
  function selectOptimalPath(pathAnalytics) {
    return pathAnalytics.reduce((best, current) => 
      current.overall_score > best.overall_score ? current : best
    );
  }
  
  function calculateOverallConfidence(pathAnalytics) {
    const topPath = selectOptimalPath(pathAnalytics);
    const avgScore = pathAnalytics.reduce((sum, p) => sum + p.overall_score, 0) / pathAnalytics.length;
    const spread = Math.max(...pathAnalytics.map(p => p.overall_score)) - 
                  Math.min(...pathAnalytics.map(p => p.overall_score));
    
    // High confidence if top path is clearly better and scores are high
    if (topPath.overall_score > 75 && spread > 20) return 'HIGH';
    if (topPath.overall_score > 60 && avgScore > 55) return 'MEDIUM';
    return 'LOW';
  }
  
  const decisionTree = buildDecisionTree(userMessage, marketData);
  
  // Update decision history
  decisionState.decision_history.unshift(decisionTree);
  if (decisionState.decision_history.length > 10) {
    decisionState.decision_history = decisionState.decision_history.slice(0, 10);
  }
  
  return {
    kons: "DecisionWebBuilder",
    timestamp: currentTime,
    decision_tree: decisionTree,
    path_comparison: generatePathComparison(decisionTree.analytics),
    strategic_insights: generateStrategicInsights(decisionTree),
    execution_roadmap: buildExecutionRoadmap(decisionTree.recommended_path),
    alternative_scenarios: generateAlternativeScenarios(decisionTree),
    decision_quality: assessDecisionQuality(decisionTree),
    state_update: {
      decision_state: decisionState
    }
  };
  
  function generatePathComparison(analytics) {
    return analytics.map((path, index) => ({
      rank: index + 1,
      path_id: path.path_id,
      score: path.overall_score,
      strengths: path.success_factors,
      weaknesses: path.weakness_analysis,
      recommendation: path.overall_score > 70 ? 'RECOMMENDED' : 
                     path.overall_score > 50 ? 'VIABLE' : 'NOT_RECOMMENDED'
    })).sort((a, b) => b.score - a.score);
  }
  
  function generateStrategicInsights(tree) {
    return {
      primary_insight: `${tree.context.decision_type} in ${tree.context.market_condition} market with ${tree.confidence_level} confidence`,
      key_considerations: tree.analytics.slice(0, 3).map(a => a.success_factors).flat(),
      warning_signals: tree.analytics.map(a => a.failure_points).flat(),
      optimal_timing: tree.context.urgency_level === 'HIGH' ? 'IMMEDIATE' : 'STRATEGIC'
    };
  }
  
  function buildExecutionRoadmap(recommendedPath) {
    return {
      path_id: recommendedPath.path_id,
      execution_steps: recommendedPath.success_factors.map((factor, index) => ({
        step: index + 1,
        action: factor,
        priority: index < 2 ? 'HIGH' : 'MEDIUM'
      })),
      checkpoints: ['Initial execution', 'Mid-point review', 'Final assessment'],
      success_metrics: ['Path adherence', 'Risk management', 'Goal achievement']
    };
  }
  
  function generateAlternativeScenarios(tree) {
    return tree.analytics.slice(1, 3).map(alt => ({
      scenario: alt.path_id,
      condition: 'If primary path encounters difficulties',
      activation_trigger: alt.failure_points[0] || 'Performance degradation',
      expected_outcome: alt.overall_score > 60 ? 'POSITIVE' : 'NEUTRAL'
    }));
  }
  
  function assessDecisionQuality(tree) {
    const qualityFactors = {
      context_clarity: tree.context.decision_type !== 'GENERAL' ? 1 : 0.5,
      path_diversity: tree.paths.length >= 3 ? 1 : 0.7,
      analysis_depth: tree.analytics.every(a => a.success_factors.length > 0) ? 1 : 0.8,
      confidence_level: tree.confidence_level === 'HIGH' ? 1 : tree.confidence_level === 'MEDIUM' ? 0.7 : 0.4
    };
    
    const avgQuality = Object.values(qualityFactors).reduce((sum, val) => sum + val, 0) / Object.keys(qualityFactors).length;
    
    return {
      overall_quality: avgQuality > 0.8 ? 'EXCELLENT' : avgQuality > 0.6 ? 'GOOD' : 'FAIR',
      quality_score: (avgQuality * 100).toFixed(1),
      improvement_areas: Object.entries(qualityFactors).filter(([_, val]) => val < 0.8).map(([key, _]) => key)
    };
  }
}