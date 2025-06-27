/**
 * Kons_TradeHistorySearch - Intelligent Trade History Analysis and Search System
 * Searches and analyzes trade history for patterns, performance, and insights
 */

export function kons_TradeHistorySearch(userMessage, marketData, previousState = {}) {
  const currentTime = Date.now();
  const searchHistory = previousState.search_history || [];
  const tradeDatabase = previousState.trade_database || generateSampleTradeData();
  
  function generateSampleTradeData() {
    // Generate realistic sample trade data for demonstration
    const trades = [];
    const basePrice = 2400;
    
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const price = basePrice + (Math.random() - 0.5) * 200;
      const amount = 0.1 + Math.random() * 2;
      const isProfit = Math.random() > 0.4; // 60% profitable trades
      
      trades.push({
        id: `trade_${i + 1}`,
        timestamp: currentTime - (daysAgo * 24 * 60 * 60 * 1000),
        type: Math.random() > 0.5 ? 'BUY' : 'SELL',
        asset: 'ETH',
        price: price,
        amount: amount,
        total: price * amount,
        profit_loss: isProfit ? (Math.random() * 200 - 100) : -(Math.random() * 150),
        status: 'COMPLETED',
        strategy: ['scalping', 'swing', 'hodl', 'dca'][Math.floor(Math.random() * 4)],
        market_condition: ['bullish', 'bearish', 'sideways'][Math.floor(Math.random() * 3)]
      });
    }
    
    return trades.sort((a, b) => b.timestamp - a.timestamp);
  }
  
  function parseSearchQuery(message) {
    const queries = {
      TIME_BASED: {
        patterns: ['last week', 'yesterday', 'today', 'last month', 'this week'],
        type: 'TIME_FILTER'
      },
      PROFIT_BASED: {
        patterns: ['profitable', 'profit', 'winning', 'gains', 'successful'],
        type: 'PROFIT_FILTER'
      },
      LOSS_BASED: {
        patterns: ['losing', 'losses', 'failed', 'unsuccessful', 'red'],
        type: 'LOSS_FILTER'
      },
      STRATEGY_BASED: {
        patterns: ['scalping', 'swing', 'hodl', 'dca', 'strategy'],
        type: 'STRATEGY_FILTER'
      },
      AMOUNT_BASED: {
        patterns: ['large', 'big', 'small', 'amount', 'size'],
        type: 'AMOUNT_FILTER'
      },
      BEST_WORST: {
        patterns: ['best', 'worst', 'top', 'bottom', 'highest', 'lowest'],
        type: 'PERFORMANCE_FILTER'
      }
    };
    
    const lowerMessage = message.toLowerCase();
    const detectedQueries = [];
    
    for (const [category, config] of Object.entries(queries)) {
      const matches = config.patterns.filter(pattern => lowerMessage.includes(pattern));
      if (matches.length > 0) {
        detectedQueries.push({
          category,
          type: config.type,
          matched_patterns: matches
        });
      }
    }
    
    return detectedQueries.length > 0 ? detectedQueries : [{
      category: 'GENERAL',
      type: 'ALL_TRADES',
      matched_patterns: ['general search']
    }];
  }
  
  function executeSearch(queries, tradeData) {
    let filteredTrades = [...tradeData];
    const searchFilters = [];
    
    queries.forEach(query => {
      switch (query.type) {
        case 'TIME_FILTER':
          const timeFilter = applyTimeFilter(query.matched_patterns, filteredTrades);
          filteredTrades = timeFilter.trades;
          searchFilters.push(timeFilter.filter);
          break;
          
        case 'PROFIT_FILTER':
          filteredTrades = filteredTrades.filter(trade => trade.profit_loss > 0);
          searchFilters.push({ type: 'PROFIT', criteria: 'Profitable trades only' });
          break;
          
        case 'LOSS_FILTER':
          filteredTrades = filteredTrades.filter(trade => trade.profit_loss < 0);
          searchFilters.push({ type: 'LOSS', criteria: 'Losing trades only' });
          break;
          
        case 'STRATEGY_FILTER':
          const strategy = query.matched_patterns.find(p => ['scalping', 'swing', 'hodl', 'dca'].includes(p));
          if (strategy) {
            filteredTrades = filteredTrades.filter(trade => trade.strategy === strategy);
            searchFilters.push({ type: 'STRATEGY', criteria: `${strategy} strategy only` });
          }
          break;
          
        case 'AMOUNT_FILTER':
          const amountFilter = applyAmountFilter(query.matched_patterns, filteredTrades);
          filteredTrades = amountFilter.trades;
          searchFilters.push(amountFilter.filter);
          break;
          
        case 'PERFORMANCE_FILTER':
          const perfFilter = applyPerformanceFilter(query.matched_patterns, filteredTrades);
          filteredTrades = perfFilter.trades;
          searchFilters.push(perfFilter.filter);
          break;
      }
    });
    
    return {
      trades: filteredTrades,
      filters_applied: searchFilters,
      total_found: filteredTrades.length,
      search_effectiveness: filteredTrades.length / tradeData.length
    };
  }
  
  function applyTimeFilter(patterns, trades) {
    const now = Date.now();
    const timeFrames = {
      'today': now - (24 * 60 * 60 * 1000),
      'yesterday': now - (2 * 24 * 60 * 60 * 1000),
      'last week': now - (7 * 24 * 60 * 60 * 1000),
      'this week': now - (7 * 24 * 60 * 60 * 1000),
      'last month': now - (30 * 24 * 60 * 60 * 1000)
    };
    
    let filterTime = null;
    let filterDescription = '';
    
    for (const pattern of patterns) {
      if (timeFrames[pattern]) {
        filterTime = timeFrames[pattern];
        filterDescription = pattern;
        break;
      }
    }
    
    const filteredTrades = filterTime ? 
      trades.filter(trade => trade.timestamp >= filterTime) : trades;
    
    return {
      trades: filteredTrades,
      filter: { 
        type: 'TIME', 
        criteria: filterDescription || 'All time',
        cutoff: filterTime
      }
    };
  }
  
  function applyAmountFilter(patterns, trades) {
    const avgAmount = trades.reduce((sum, trade) => sum + trade.amount, 0) / trades.length;
    
    let filteredTrades = trades;
    let criteria = 'All amounts';
    
    if (patterns.includes('large') || patterns.includes('big')) {
      filteredTrades = trades.filter(trade => trade.amount > avgAmount);
      criteria = 'Large positions only';
    } else if (patterns.includes('small')) {
      filteredTrades = trades.filter(trade => trade.amount <= avgAmount);
      criteria = 'Small positions only';
    }
    
    return {
      trades: filteredTrades,
      filter: { type: 'AMOUNT', criteria }
    };
  }
  
  function applyPerformanceFilter(patterns, trades) {
    let filteredTrades = trades;
    let criteria = 'All performance levels';
    
    if (patterns.includes('best') || patterns.includes('top') || patterns.includes('highest')) {
      filteredTrades = trades
        .sort((a, b) => b.profit_loss - a.profit_loss)
        .slice(0, Math.min(10, Math.ceil(trades.length * 0.2)));
      criteria = 'Top 20% best performing trades';
    } else if (patterns.includes('worst') || patterns.includes('bottom') || patterns.includes('lowest')) {
      filteredTrades = trades
        .sort((a, b) => a.profit_loss - b.profit_loss)
        .slice(0, Math.min(10, Math.ceil(trades.length * 0.2)));
      criteria = 'Bottom 20% worst performing trades';
    }
    
    return {
      trades: filteredTrades,
      filter: { type: 'PERFORMANCE', criteria }
    };
  }
  
  function analyzeSearchResults(searchResults) {
    const trades = searchResults.trades;
    
    if (trades.length === 0) {
      return {
        summary: 'No trades found matching search criteria',
        insights: [],
        recommendations: ['Try broader search terms', 'Check time range']
      };
    }
    
    const totalProfit = trades.reduce((sum, trade) => sum + trade.profit_loss, 0);
    const profitableTrades = trades.filter(trade => trade.profit_loss > 0);
    const winRate = (profitableTrades.length / trades.length) * 100;
    
    const analysis = {
      summary: `Found ${trades.length} trades`,
      total_profit_loss: totalProfit,
      win_rate: winRate,
      profitable_trades: profitableTrades.length,
      losing_trades: trades.length - profitableTrades.length,
      avg_trade_size: trades.reduce((sum, trade) => sum + trade.amount, 0) / trades.length,
      date_range: {
        earliest: new Date(Math.min(...trades.map(t => t.timestamp))),
        latest: new Date(Math.max(...trades.map(t => t.timestamp)))
      }
    };
    
    const insights = generateInsights(analysis, trades);
    const recommendations = generateRecommendations(analysis);
    
    return {
      ...analysis,
      insights,
      recommendations
    };
  }
  
  function generateInsights(analysis, trades) {
    const insights = [];
    
    if (analysis.win_rate > 70) {
      insights.push({
        type: 'POSITIVE',
        message: `Excellent win rate of ${analysis.win_rate.toFixed(1)}%`,
        confidence: 90
      });
    } else if (analysis.win_rate < 40) {
      insights.push({
        type: 'WARNING',
        message: `Low win rate of ${analysis.win_rate.toFixed(1)}% needs attention`,
        confidence: 85
      });
    }
    
    if (analysis.total_profit_loss > 0) {
      insights.push({
        type: 'POSITIVE',
        message: `Net profit of $${analysis.total_profit_loss.toFixed(2)}`,
        confidence: 95
      });
    } else {
      insights.push({
        type: 'NEGATIVE',
        message: `Net loss of $${Math.abs(analysis.total_profit_loss).toFixed(2)}`,
        confidence: 95
      });
    }
    
    // Strategy analysis
    const strategies = {};
    trades.forEach(trade => {
      strategies[trade.strategy] = (strategies[trade.strategy] || 0) + 1;
    });
    
    const mostUsedStrategy = Object.keys(strategies).reduce((a, b) => 
      strategies[a] > strategies[b] ? a : b
    );
    
    insights.push({
      type: 'INFO',
      message: `Most used strategy: ${mostUsedStrategy} (${strategies[mostUsedStrategy]} trades)`,
      confidence: 80
    });
    
    return insights;
  }
  
  function generateRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.win_rate < 50) {
      recommendations.push('Review losing trades for pattern identification');
      recommendations.push('Consider adjusting risk management strategy');
    }
    
    if (analysis.total_profit_loss < 0) {
      recommendations.push('Focus on capital preservation strategies');
      recommendations.push('Reduce position sizes until profitability improves');
    }
    
    if (analysis.profitable_trades > 0) {
      recommendations.push('Analyze profitable trades to identify success patterns');
    }
    
    recommendations.push('Set up alerts for similar market conditions');
    
    return recommendations;
  }
  
  function updateSearchHistory(query, results) {
    const searchEntry = {
      timestamp: currentTime,
      query: query,
      results_count: results.total_found,
      filters_applied: results.filters_applied.length,
      search_effectiveness: results.search_effectiveness
    };
    
    searchHistory.push(searchEntry);
    
    // Keep only last 20 searches
    if (searchHistory.length > 20) {
      searchHistory.splice(0, searchHistory.length - 20);
    }
    
    return searchEntry;
  }
  
  const searchQueries = parseSearchQuery(userMessage);
  const searchResults = executeSearch(searchQueries, tradeDatabase);
  const analysis = analyzeSearchResults(searchResults);
  const historyEntry = updateSearchHistory(userMessage, searchResults);
  
  return {
    kons: "TradeHistorySearch",
    timestamp: currentTime,
    search_queries: searchQueries,
    search_results: searchResults,
    analysis: analysis,
    quick_stats: {
      trades_found: searchResults.total_found,
      search_effectiveness: Math.round(searchResults.search_effectiveness * 100),
      filters_used: searchResults.filters_applied.length,
      win_rate: analysis.win_rate ? `${analysis.win_rate.toFixed(1)}%` : 'N/A'
    },
    history_entry: historyEntry,
    state_update: {
      search_history: searchHistory,
      trade_database: tradeDatabase
    }
  };
}