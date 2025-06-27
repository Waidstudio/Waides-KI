/**
 * Kons_PlanBuilder - Intelligent Trading Plan Construction System
 * Creates step-by-step trading plans based on goals and market conditions
 */

export function kons_PlanBuilder(userMessage, marketData, previousState = {}) {
  const currentTime = Date.now();
  const planHistory = previousState.plan_history || [];
  
  function analyzePlanIntent(message) {
    const planPatterns = {
      PROFIT_TARGET: {
        keywords: ['profit', 'gain', 'target', 'goal', 'make money', 'earn'],
        focus: 'PROFIT_OPTIMIZATION',
        timeframe: 'MEDIUM_TERM'
      },
      RISK_MANAGEMENT: {
        keywords: ['safe', 'protect', 'minimize risk', 'stop loss', 'hedge'],
        focus: 'CAPITAL_PRESERVATION',
        timeframe: 'ONGOING'
      },
      QUICK_TRADE: {
        keywords: ['quick', 'fast', 'scalp', 'short term', 'immediate'],
        focus: 'SHORT_TERM_GAINS',
        timeframe: 'SHORT_TERM'
      },
      LONG_TERM: {
        keywords: ['hold', 'invest', 'long term', 'accumulate', 'build'],
        focus: 'WEALTH_BUILDING',
        timeframe: 'LONG_TERM'
      },
      LEARNING: {
        keywords: ['learn', 'practice', 'understand', 'improve', 'study'],
        focus: 'SKILL_DEVELOPMENT',
        timeframe: 'EDUCATIONAL'
      }
    };
    
    const lowerMessage = message.toLowerCase();
    let detectedIntent = null;
    let maxMatches = 0;
    
    for (const [intent, config] of Object.entries(planPatterns)) {
      const matches = config.keywords.filter(keyword => lowerMessage.includes(keyword));
      if (matches.length > maxMatches) {
        maxMatches = matches.length;
        detectedIntent = { intent, ...config, matched_keywords: matches };
      }
    }
    
    return detectedIntent || {
      intent: 'GENERAL_TRADING',
      focus: 'BALANCED_APPROACH',
      timeframe: 'MEDIUM_TERM',
      matched_keywords: []
    };
  }
  
  function generateTradingPlan(intent, marketData, userContext = {}) {
    const planTemplates = {
      PROFIT_TARGET: {
        title: "Profit-Focused Trading Plan",
        phases: [
          {
            step: 1,
            action: "Market Analysis",
            details: "Analyze current ETH trends, support/resistance levels",
            duration: "15-30 minutes",
            tools: ["Charts", "Technical indicators", "Volume analysis"]
          },
          {
            step: 2,
            action: "Entry Strategy",
            details: "Identify optimal entry points with high probability setups",
            duration: "Variable",
            tools: ["Price alerts", "Order placement", "Position sizing"]
          },
          {
            step: 3,
            action: "Profit Taking",
            details: "Set multiple profit targets at key resistance levels",
            duration: "Active monitoring",
            tools: ["Limit orders", "Trail stops", "Profit alerts"]
          }
        ],
        risk_level: "MODERATE",
        success_metrics: ["Profit percentage", "Win rate", "Risk-reward ratio"]
      },
      
      RISK_MANAGEMENT: {
        title: "Capital Preservation Plan",
        phases: [
          {
            step: 1,
            action: "Risk Assessment",
            details: "Calculate maximum acceptable loss per trade",
            duration: "10 minutes",
            tools: ["Position calculator", "Risk analyzer"]
          },
          {
            step: 2,
            action: "Protection Setup",
            details: "Set stop losses and position limits",
            duration: "5 minutes per trade",
            tools: ["Stop loss orders", "Position limits"]
          },
          {
            step: 3,
            action: "Monitoring",
            details: "Continuous monitoring and adjustment",
            duration: "Ongoing",
            tools: ["Alerts", "Portfolio tracker"]
          }
        ],
        risk_level: "LOW",
        success_metrics: ["Drawdown control", "Capital preservation", "Consistency"]
      },
      
      QUICK_TRADE: {
        title: "Short-Term Trading Plan",
        phases: [
          {
            step: 1,
            action: "Quick Setup",
            details: "Rapid market scan for immediate opportunities",
            duration: "5 minutes",
            tools: ["Real-time data", "Quick charts"]
          },
          {
            step: 2,
            action: "Fast Execution",
            details: "Quick entry with tight stops",
            duration: "Immediate",
            tools: ["Market orders", "Tight stops"]
          },
          {
            step: 3,
            action: "Quick Exit",
            details: "Take profits quickly or cut losses fast",
            duration: "Minutes to hours",
            tools: ["Quick alerts", "Fast execution"]
          }
        ],
        risk_level: "HIGH",
        success_metrics: ["Speed of execution", "Quick profits", "Loss minimization"]
      }
    };
    
    const template = planTemplates[intent.focus] || planTemplates.PROFIT_TARGET;
    
    // Customize based on market conditions
    const marketAdjustments = addMarketConditionAdjustments(template, marketData);
    
    return {
      ...template,
      ...marketAdjustments,
      created_at: currentTime,
      intent_analysis: intent,
      customizations: generateCustomizations(intent, marketData)
    };
  }
  
  function addMarketConditionAdjustments(template, marketData) {
    const adjustments = {
      market_context: "NORMAL",
      recommended_adjustments: []
    };
    
    if (marketData?.change24h) {
      if (Math.abs(marketData.change24h) > 10) {
        adjustments.market_context = "HIGH_VOLATILITY";
        adjustments.recommended_adjustments.push({
          type: "POSITION_SIZE",
          recommendation: "Reduce position sizes by 50% due to high volatility",
          reason: "High price volatility detected"
        });
      }
      
      if (marketData.change24h > 5) {
        adjustments.market_context = "BULLISH";
        adjustments.recommended_adjustments.push({
          type: "STRATEGY",
          recommendation: "Consider trend-following strategies",
          reason: "Strong upward momentum"
        });
      } else if (marketData.change24h < -5) {
        adjustments.market_context = "BEARISH";
        adjustments.recommended_adjustments.push({
          type: "STRATEGY",
          recommendation: "Focus on defensive strategies or short positions",
          reason: "Strong downward momentum"
        });
      }
    }
    
    if (marketData?.volume && marketData.volume > 1000000000) {
      adjustments.recommended_adjustments.push({
        type: "TIMING",
        recommendation: "High volume detected - good for plan execution",
        reason: "Increased liquidity and market activity"
      });
    }
    
    return adjustments;
  }
  
  function generateCustomizations(intent, marketData) {
    const customizations = [];
    
    // Time-based customizations
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      customizations.push({
        type: "TIMING",
        suggestion: "Off-hours trading - consider reduced activity",
        impact: "MEDIUM"
      });
    }
    
    // Risk customizations based on intent
    if (intent.timeframe === 'SHORT_TERM') {
      customizations.push({
        type: "MONITORING",
        suggestion: "Increase monitoring frequency for short-term trades",
        impact: "HIGH"
      });
    }
    
    // Market price level customizations
    if (marketData?.price) {
      const priceLevel = Math.round(marketData.price / 100) * 100;
      customizations.push({
        type: "LEVELS",
        suggestion: `Watch key level at $${priceLevel} for breakout/breakdown`,
        impact: "MEDIUM"
      });
    }
    
    return customizations;
  }
  
  function generatePlanChecklist(plan) {
    const checklist = [];
    
    plan.phases.forEach((phase, index) => {
      checklist.push({
        phase: index + 1,
        task: phase.action,
        status: "PENDING",
        priority: index === 0 ? "HIGH" : "NORMAL",
        estimated_time: phase.duration,
        required_tools: phase.tools
      });
    });
    
    // Add general checklist items
    checklist.push({
      phase: "GENERAL",
      task: "Review risk management settings",
      status: "PENDING",
      priority: "HIGH",
      estimated_time: "5 minutes",
      required_tools: ["Risk calculator"]
    });
    
    return checklist;
  }
  
  function calculatePlanScore(plan, marketConditions) {
    let score = 70; // Base score
    
    // Adjust based on market alignment
    if (plan.market_context === 'BULLISH' && marketConditions?.change24h > 0) {
      score += 15;
    }
    
    if (plan.risk_level === 'LOW' && marketConditions?.volatility === 'HIGH') {
      score += 10; // Conservative approach in volatile times
    }
    
    // Adjust based on plan complexity
    const phaseCount = plan.phases?.length || 0;
    if (phaseCount >= 3 && phaseCount <= 5) {
      score += 10; // Optimal complexity
    }
    
    // Time appropriateness
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 16) {
      score += 5; // Active trading hours
    }
    
    return {
      score: Math.min(100, score),
      rating: score >= 85 ? 'EXCELLENT' : score >= 70 ? 'GOOD' : score >= 55 ? 'FAIR' : 'POOR',
      confidence: Math.min(95, score + 10)
    };
  }
  
  function updatePlanHistory(plan) {
    const historyEntry = {
      timestamp: currentTime,
      intent: plan.intent_analysis.intent,
      focus: plan.intent_analysis.focus,
      market_context: plan.market_context,
      phase_count: plan.phases.length,
      risk_level: plan.risk_level
    };
    
    planHistory.push(historyEntry);
    
    // Keep only last 20 plans
    if (planHistory.length > 20) {
      planHistory.splice(0, planHistory.length - 20);
    }
    
    return historyEntry;
  }
  
  const intent = analyzePlanIntent(userMessage);
  const plan = generateTradingPlan(intent, marketData);
  const checklist = generatePlanChecklist(plan);
  const planScore = calculatePlanScore(plan, marketData);
  const historyEntry = updatePlanHistory(plan);
  
  return {
    kons: "PlanBuilder",
    timestamp: currentTime,
    intent_analysis: intent,
    trading_plan: plan,
    plan_checklist: checklist,
    plan_score: planScore,
    execution_guidance: {
      start_immediately: intent.timeframe === 'SHORT_TERM',
      preparation_time: plan.phases[0]?.duration || "15 minutes",
      monitoring_level: intent.focus === 'QUICK_TRADE' ? 'INTENSIVE' : 'STANDARD',
      success_probability: planScore.confidence
    },
    history_entry: historyEntry,
    state_update: {
      plan_history: planHistory
    }
  };
}