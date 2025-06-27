/**
 * Kons_PriorityFilter - Intelligent Task and Alert Prioritization System
 * Filters and ranks incoming information based on urgency and importance
 */

export function kons_PriorityFilter(userMessage, marketData, previousState = {}) {
  const currentTime = Date.now();
  const filterHistory = previousState.filter_history || [];
  
  function analyzePriority(message) {
    const priorityIndicators = {
      CRITICAL: {
        keywords: ['emergency', 'urgent', 'critical', 'stop loss', 'liquidation', 'crash', 'danger'],
        weight: 100,
        color: '#FF0000',
        action: 'IMMEDIATE'
      },
      HIGH: {
        keywords: ['important', 'high', 'alert', 'warning', 'risk', 'profit', 'opportunity'],
        weight: 80,
        color: '#FF6600',
        action: 'PRIORITY'
      },
      MEDIUM: {
        keywords: ['medium', 'moderate', 'consider', 'check', 'review', 'analyze'],
        weight: 60,
        color: '#FFAA00',
        action: 'NORMAL'
      },
      LOW: {
        keywords: ['low', 'minor', 'info', 'fyi', 'note', 'reminder', 'casual'],
        weight: 40,
        color: '#00AA00',
        action: 'QUEUE'
      },
      MINIMAL: {
        keywords: ['trivial', 'later', 'eventually', 'someday', 'maybe'],
        weight: 20,
        color: '#888888',
        action: 'DEFER'
      }
    };
    
    const lowerMessage = message.toLowerCase();
    let highestPriority = 'MINIMAL';
    let maxWeight = 0;
    let matchedKeywords = [];
    
    for (const [level, config] of Object.entries(priorityIndicators)) {
      const matches = config.keywords.filter(keyword => lowerMessage.includes(keyword));
      if (matches.length > 0) {
        const totalWeight = config.weight + (matches.length * 5);
        if (totalWeight > maxWeight) {
          maxWeight = totalWeight;
          highestPriority = level;
          matchedKeywords = matches;
        }
      }
    }
    
    return {
      level: highestPriority,
      weight: maxWeight,
      matched_keywords: matchedKeywords,
      config: priorityIndicators[highestPriority],
      confidence: Math.min(95, 50 + (matchedKeywords.length * 15))
    };
  }
  
  function analyzeMarketUrgency(marketData) {
    if (!marketData) return { urgency: 'NORMAL', factors: [] };
    
    const urgencyFactors = [];
    let urgencyLevel = 'NORMAL';
    
    // Price volatility analysis
    if (marketData.change24h && Math.abs(marketData.change24h) > 10) {
      urgencyFactors.push('High price volatility');
      urgencyLevel = 'HIGH';
    }
    
    // Volume spike detection
    if (marketData.volume && marketData.volume > 1000000000) {
      urgencyFactors.push('Unusual volume spike');
      if (urgencyLevel !== 'HIGH') urgencyLevel = 'MEDIUM';
    }
    
    // Price level analysis
    if (marketData.price) {
      const priceString = marketData.price.toString();
      if (priceString.includes('000') || priceString.includes('500')) {
        urgencyFactors.push('Key psychological price level');
        if (urgencyLevel === 'NORMAL') urgencyLevel = 'MEDIUM';
      }
    }
    
    return {
      urgency: urgencyLevel,
      factors: urgencyFactors,
      market_attention_required: urgencyFactors.length > 0
    };
  }
  
  function createPriorityScore(messagePriority, marketUrgency, userContext = {}) {
    const baseScore = messagePriority.weight;
    
    // Market urgency multiplier
    const urgencyMultiplier = {
      'CRITICAL': 1.5,
      'HIGH': 1.3,
      'MEDIUM': 1.1,
      'NORMAL': 1.0,
      'LOW': 0.9
    };
    
    const marketBoost = urgencyMultiplier[marketUrgency.urgency] || 1.0;
    
    // Time-based urgency (trading hours)
    const hour = new Date().getHours();
    const timeBoost = (hour >= 6 && hour <= 22) ? 1.1 : 0.9; // Active trading hours
    
    // User activity pattern boost
    const activityBoost = userContext.recent_activity ? 1.2 : 1.0;
    
    const finalScore = Math.min(100, baseScore * marketBoost * timeBoost * activityBoost);
    
    return {
      final_score: Math.round(finalScore),
      base_score: baseScore,
      market_boost: marketBoost,
      time_boost: timeBoost,
      activity_boost: activityBoost,
      rank: finalScore >= 90 ? 'URGENT' : 
            finalScore >= 70 ? 'HIGH' : 
            finalScore >= 50 ? 'NORMAL' : 'LOW'
    };
  }
  
  function generateFilterActions(priority, marketUrgency, score) {
    const actions = [];
    
    if (score.rank === 'URGENT') {
      actions.push({
        type: 'NOTIFY_IMMEDIATELY',
        message: 'Push notification required',
        color: '#FF0000'
      });
    }
    
    if (priority.level === 'CRITICAL' || marketUrgency.urgency === 'HIGH') {
      actions.push({
        type: 'HIGHLIGHT_UI',
        message: 'Prominent display in interface',
        color: '#FF6600'
      });
    }
    
    if (score.final_score >= 60) {
      actions.push({
        type: 'PRIORITY_QUEUE',
        message: 'Move to front of processing queue',
        color: '#FFAA00'
      });
    } else {
      actions.push({
        type: 'STANDARD_QUEUE',
        message: 'Process in normal order',
        color: '#00AA00'
      });
    }
    
    return actions;
  }
  
  function updateFilterHistory(priority, marketUrgency, score) {
    const entry = {
      timestamp: currentTime,
      message_priority: priority.level,
      market_urgency: marketUrgency.urgency,
      final_score: score.final_score,
      rank: score.rank,
      processing_time: Date.now()
    };
    
    filterHistory.push(entry);
    
    // Keep only last 50 entries
    if (filterHistory.length > 50) {
      filterHistory.splice(0, filterHistory.length - 50);
    }
    
    return entry;
  }
  
  function generateFilterAnalytics() {
    if (filterHistory.length < 5) {
      return {
        trend: 'INSUFFICIENT_DATA',
        avg_priority: 0,
        recent_urgency: 'NORMAL'
      };
    }
    
    const recent = filterHistory.slice(-10);
    const avgScore = recent.reduce((sum, entry) => sum + entry.final_score, 0) / recent.length;
    
    const urgentCount = recent.filter(entry => entry.rank === 'URGENT').length;
    const urgencyTrend = urgentCount > 3 ? 'INCREASING' : urgentCount > 1 ? 'STABLE' : 'DECREASING';
    
    return {
      trend: urgencyTrend,
      avg_priority: Math.round(avgScore),
      recent_urgency: recent[recent.length - 1]?.rank || 'NORMAL',
      processing_efficiency: recent.length > 0 ? 'OPTIMAL' : 'SLOW',
      total_processed: filterHistory.length
    };
  }
  
  const messagePriority = analyzePriority(userMessage);
  const marketUrgency = analyzeMarketUrgency(marketData);
  const priorityScore = createPriorityScore(messagePriority, marketUrgency, { recent_activity: true });
  const filterActions = generateFilterActions(messagePriority, marketUrgency, priorityScore);
  const historyEntry = updateFilterHistory(messagePriority, marketUrgency, priorityScore);
  const analytics = generateFilterAnalytics();
  
  return {
    kons: "PriorityFilter",
    timestamp: currentTime,
    message_analysis: messagePriority,
    market_urgency: marketUrgency,
    priority_score: priorityScore,
    filter_actions: filterActions,
    history_entry: historyEntry,
    analytics: analytics,
    recommendations: {
      processing_order: priorityScore.rank,
      attention_level: messagePriority.config.action,
      ui_treatment: priorityScore.final_score >= 80 ? 'HIGHLIGHTED' : 'STANDARD',
      notification_required: priorityScore.rank === 'URGENT'
    },
    state_update: {
      filter_history: filterHistory
    }
  };
}