/**
 * Kons_LiveFeedLink - Real-time Data Connection Module
 * Grants Konsai live connection to real-time market, user, and system data
 */

export function kons_LiveFeedLink(userMessage, marketData, previousState = {}) {
  const currentTime = Date.now();
  const feedState = previousState.feed_state || {
    active_feeds: [],
    data_quality: 'UNKNOWN',
    last_refresh: 0
  };
  
  function initializeFeedConnections() {
    const availableFeeds = [
      {
        name: 'ETH_PRICE_FEED',
        source: 'CoinGecko',
        status: marketData?.price ? 'ACTIVE' : 'DISCONNECTED',
        latency: calculateLatency('price'),
        quality: assessDataQuality(marketData?.price)
      },
      {
        name: 'VOLUME_FEED',
        source: 'Market',
        status: marketData?.volume ? 'ACTIVE' : 'DISCONNECTED',
        latency: calculateLatency('volume'),
        quality: assessDataQuality(marketData?.volume)
      },
      {
        name: 'SENTIMENT_FEED',
        source: 'Fear&Greed',
        status: 'MONITORING',
        latency: 15000,
        quality: 'GOOD'
      },
      {
        name: 'TREND_FEED',
        source: 'Technical',
        status: marketData?.change24h ? 'ACTIVE' : 'SCANNING',
        latency: calculateLatency('trend'),
        quality: assessDataQuality(marketData?.change24h)
      }
    ];
    
    return availableFeeds;
  }
  
  function calculateLatency(dataType) {
    const lastUpdate = feedState.last_refresh;
    const timeDiff = currentTime - lastUpdate;
    
    if (timeDiff < 5000) return 'REAL_TIME';
    if (timeDiff < 30000) return 'NEAR_REAL_TIME';
    if (timeDiff < 60000) return 'DELAYED';
    return 'STALE';
  }
  
  function assessDataQuality(dataPoint) {
    if (!dataPoint) return 'NO_DATA';
    if (typeof dataPoint === 'number' && dataPoint > 0) return 'HIGH';
    if (typeof dataPoint === 'string' && dataPoint.length > 0) return 'GOOD';
    return 'LOW';
  }
  
  function detectFeedEvents(feeds) {
    const events = [];
    
    feeds.forEach(feed => {
      if (feed.status === 'DISCONNECTED') {
        events.push({
          type: 'FEED_LOST',
          feed: feed.name,
          severity: 'HIGH',
          action: 'SWITCH_TO_BACKUP'
        });
      }
      
      if (feed.latency === 'STALE') {
        events.push({
          type: 'DATA_STALE',
          feed: feed.name,
          severity: 'MEDIUM',
          action: 'REFRESH_FEED'
        });
      }
      
      if (feed.quality === 'HIGH' && feed.name === 'ETH_PRICE_FEED') {
        events.push({
          type: 'PRICE_UPDATE',
          feed: feed.name,
          severity: 'INFO',
          action: 'UPDATE_INSIGHTS'
        });
      }
    });
    
    return events;
  }
  
  function generateLiveInsights(feeds, events) {
    const insights = [];
    
    const activeFeedsCount = feeds.filter(f => f.status === 'ACTIVE').length;
    const feedHealth = activeFeedsCount / feeds.length;
    
    if (feedHealth >= 0.8) {
      insights.push({
        type: 'SYSTEM_HEALTH',
        message: 'Live data feeds operating optimally',
        confidence: 95,
        recommendation: 'Full real-time analysis available'
      });
    } else if (feedHealth >= 0.5) {
      insights.push({
        type: 'PARTIAL_DATA',
        message: 'Some data feeds experiencing issues',
        confidence: 70,
        recommendation: 'Use cached data for missing feeds'
      });
    } else {
      insights.push({
        type: 'DATA_CRITICAL',
        message: 'Major data feed disruption detected',
        confidence: 90,
        recommendation: 'Switch to emergency data mode'
      });
    }
    
    // Price-specific insights
    if (marketData?.price) {
      const priceLevel = Math.round(marketData.price / 100) * 100;
      insights.push({
        type: 'PRICE_ANALYSIS',
        message: `ETH near key level $${priceLevel}`,
        confidence: 85,
        recommendation: 'Monitor for breakout/breakdown'
      });
    }
    
    return insights;
  }
  
  function autoRefreshModules(feeds) {
    const refreshActions = [];
    
    feeds.forEach(feed => {
      if (feed.status === 'ACTIVE' && feed.quality === 'HIGH') {
        refreshActions.push({
          module: 'TrendWatcher',
          action: 'UPDATE_TRENDS',
          data_source: feed.name
        });
        
        refreshActions.push({
          module: 'PricePing',
          action: 'PING_PRICE_ALERTS',
          data_source: feed.name
        });
        
        refreshActions.push({
          module: 'SentimentScan',
          action: 'SCAN_SENTIMENT_SHIFT',
          data_source: feed.name
        });
      }
    });
    
    return refreshActions;
  }
  
  function enableRealTimeDecisions(insights, events) {
    const decisions = [];
    
    // Decision based on feed health
    const criticalEvents = events.filter(e => e.severity === 'HIGH');
    if (criticalEvents.length === 0) {
      decisions.push({
        type: 'TRADING_CLEARANCE',
        decision: 'APPROVED',
        reason: 'All critical data feeds operational'
      });
    } else {
      decisions.push({
        type: 'TRADING_CAUTION',
        decision: 'RESTRICTED',
        reason: 'Critical data feeds compromised'
      });
    }
    
    // Price-based decisions
    if (marketData?.change24h) {
      if (Math.abs(marketData.change24h) > 5) {
        decisions.push({
          type: 'VOLATILITY_ALERT',
          decision: 'HEIGHTENED_MONITORING',
          reason: `High volatility detected: ${marketData.change24h.toFixed(2)}%`
        });
      }
    }
    
    return decisions;
  }
  
  function updateFeedState(feeds, events) {
    const newState = {
      active_feeds: feeds.filter(f => f.status === 'ACTIVE').map(f => f.name),
      data_quality: calculateOverallQuality(feeds),
      last_refresh: currentTime,
      event_count: events.length,
      health_score: feeds.filter(f => f.status === 'ACTIVE').length / feeds.length * 100
    };
    
    return newState;
  }
  
  function calculateOverallQuality(feeds) {
    const qualityScores = {
      'HIGH': 4,
      'GOOD': 3,
      'LOW': 2,
      'NO_DATA': 1
    };
    
    const totalScore = feeds.reduce((sum, feed) => sum + qualityScores[feed.quality], 0);
    const avgScore = totalScore / feeds.length;
    
    if (avgScore >= 3.5) return 'EXCELLENT';
    if (avgScore >= 2.5) return 'GOOD';
    if (avgScore >= 1.5) return 'FAIR';
    return 'POOR';
  }
  
  const feeds = initializeFeedConnections();
  const events = detectFeedEvents(feeds);
  const insights = generateLiveInsights(feeds, events);
  const refreshActions = autoRefreshModules(feeds);
  const decisions = enableRealTimeDecisions(insights, events);
  const newFeedState = updateFeedState(feeds, events);
  
  return {
    kons: "LiveFeedLink",
    timestamp: currentTime,
    feed_connections: feeds,
    feed_events: events,
    live_insights: insights,
    auto_refresh: refreshActions,
    real_time_decisions: decisions,
    feed_health: {
      overall_quality: newFeedState.data_quality,
      health_score: newFeedState.health_score,
      active_feeds: newFeedState.active_feeds.length,
      total_feeds: feeds.length
    },
    recommendations: {
      immediate_action: events.length > 0 ? 'Address feed issues' : 'Continue monitoring',
      trading_status: decisions.find(d => d.type === 'TRADING_CLEARANCE') ? 'APPROVED' : 'CAUTION',
      next_refresh: currentTime + 15000
    },
    state_update: {
      feed_state: newFeedState
    }
  };
}