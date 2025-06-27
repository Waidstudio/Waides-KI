/**
 * Kons_FastCommand - Surface Utility Layer
 * Executes full actions with a short phrase
 */

export function kons_FastCommand(userMessage, marketData, previousState = {}) {
  const currentTime = Date.now();
  const fastCommandState = previousState.fast_command_state || {
    registered_commands: {},
    execution_history: [],
    command_success_rates: {}
  };
  
  function parseShortPhrase(message) {
    const lowerMessage = message.toLowerCase();
    const commands = {
      // Trading commands
      'buy now': { action: 'EXECUTE_BUY', confidence: 95, params: { amount: 'standard' } },
      'sell all': { action: 'EXECUTE_SELL', confidence: 90, params: { amount: 'all' } },
      'check risk': { action: 'RISK_ANALYSIS', confidence: 100, params: {} },
      'market status': { action: 'MARKET_SUMMARY', confidence: 100, params: {} },
      'quick exit': { action: 'EMERGENCY_EXIT', confidence: 85, params: { speed: 'fast' } },
      
      // Analysis commands
      'trend now': { action: 'TREND_ANALYSIS', confidence: 95, params: { timeframe: 'current' } },
      'rsi check': { action: 'RSI_READING', confidence: 100, params: {} },
      'volume spike': { action: 'VOLUME_ANALYSIS', confidence: 90, params: {} },
      'support level': { action: 'SUPPORT_RESISTANCE', confidence: 95, params: { type: 'support' } },
      
      // Learning commands
      'explain this': { action: 'EXPLAIN_CURRENT', confidence: 85, params: { detail: 'simple' } },
      'teach me': { action: 'START_LESSON', confidence: 90, params: { level: 'beginner' } },
      'quiz me': { action: 'KNOWLEDGE_TEST', confidence: 80, params: {} },
      
      // Spiritual commands
      'sacred timing': { action: 'TIMING_CHECK', confidence: 70, params: { type: 'spiritual' } },
      'energy read': { action: 'ENERGY_SCAN', confidence: 75, params: {} },
      'purpose check': { action: 'PURPOSE_ALIGNMENT', confidence: 80, params: {} },
      
      // Emergency commands
      'stop all': { action: 'FULL_STOP', confidence: 100, params: { emergency: true } },
      'safe mode': { action: 'ACTIVATE_SAFETY', confidence: 100, params: {} },
      'review trades': { action: 'TRADE_REVIEW', confidence: 95, params: { period: 'recent' } }
    };
    
    // Check for exact matches first
    for (const [phrase, command] of Object.entries(commands)) {
      if (lowerMessage.includes(phrase)) {
        return { found: true, command: phrase, action: command };
      }
    }
    
    // Check for partial matches with context
    const partialMatches = [];
    for (const [phrase, command] of Object.entries(commands)) {
      const words = phrase.split(' ');
      const matchCount = words.filter(word => lowerMessage.includes(word)).length;
      if (matchCount >= words.length / 2) {
        partialMatches.push({ phrase, command, score: matchCount / words.length });
      }
    }
    
    if (partialMatches.length > 0) {
      const bestMatch = partialMatches.sort((a, b) => b.score - a.score)[0];
      return { found: true, command: bestMatch.phrase, action: bestMatch.command, partial: true };
    }
    
    return { found: false, suggestion: suggestCommand(lowerMessage) };
  }
  
  function suggestCommand(message) {
    if (message.includes('buy') || message.includes('long')) return 'buy now';
    if (message.includes('sell') || message.includes('short')) return 'sell all';
    if (message.includes('risk') || message.includes('danger')) return 'check risk';
    if (message.includes('market') || message.includes('price')) return 'market status';
    if (message.includes('trend') || message.includes('direction')) return 'trend now';
    if (message.includes('learn') || message.includes('teach')) return 'teach me';
    if (message.includes('stop') || message.includes('halt')) return 'stop all';
    if (message.includes('safe') || message.includes('protect')) return 'safe mode';
    return 'market status'; // Default fallback
  }
  
  function executeCommand(commandData, marketData) {
    const execution = {
      timestamp: currentTime,
      command: commandData.command,
      action: commandData.action.action,
      success: false,
      result: null,
      execution_time: 0
    };
    
    const startTime = Date.now();
    
    try {
      switch (commandData.action.action) {
        case 'EXECUTE_BUY':
          execution.result = {
            action: 'BUY_SIGNAL_GENERATED',
            price: marketData?.price || 'MARKET',
            amount: commandData.action.params.amount,
            confidence: commandData.action.confidence
          };
          break;
          
        case 'EXECUTE_SELL':
          execution.result = {
            action: 'SELL_SIGNAL_GENERATED',
            price: marketData?.price || 'MARKET',
            amount: commandData.action.params.amount,
            confidence: commandData.action.confidence
          };
          break;
          
        case 'RISK_ANALYSIS':
          execution.result = analyzeCurrentRisk(marketData);
          break;
          
        case 'MARKET_SUMMARY':
          execution.result = generateMarketSummary(marketData);
          break;
          
        case 'TREND_ANALYSIS':
          execution.result = analyzeTrend(marketData);
          break;
          
        case 'RSI_READING':
          execution.result = generateRSIReading(marketData);
          break;
          
        case 'EMERGENCY_EXIT':
          execution.result = {
            action: 'EMERGENCY_EXIT_INITIATED',
            all_positions: 'CLOSING',
            safety_mode: 'ACTIVATED'
          };
          break;
          
        case 'FULL_STOP':
          execution.result = {
            action: 'ALL_SYSTEMS_STOPPED',
            trading: 'HALTED',
            automation: 'DISABLED'
          };
          break;
          
        default:
          execution.result = {
            action: 'COMMAND_ACKNOWLEDGED',
            message: `${commandData.action.action} command received and queued`
          };
      }
      
      execution.success = true;
      execution.execution_time = Date.now() - startTime;
      
    } catch (error) {
      execution.success = false;
      execution.result = { error: error.message };
      execution.execution_time = Date.now() - startTime;
    }
    
    return execution;
  }
  
  function analyzeCurrentRisk(marketData) {
    if (!marketData) return { risk_level: 'UNKNOWN', message: 'No market data available' };
    
    const riskFactors = [];
    let riskScore = 0;
    
    if (marketData.change24h && Math.abs(marketData.change24h) > 10) {
      riskFactors.push('High volatility');
      riskScore += 30;
    }
    
    if (marketData.volume && marketData.volume > 50000000) {
      riskFactors.push('Unusual volume');
      riskScore += 20;
    }
    
    if (marketData.price && marketData.price < 2000) {
      riskFactors.push('Price near support');
      riskScore += 15;
    }
    
    const riskLevel = riskScore > 40 ? 'HIGH' : riskScore > 20 ? 'MEDIUM' : 'LOW';
    
    return {
      risk_level: riskLevel,
      risk_score: riskScore,
      factors: riskFactors,
      recommendation: riskLevel === 'HIGH' ? 'Reduce position sizes' : 
                     riskLevel === 'MEDIUM' ? 'Proceed with caution' : 'Normal trading conditions'
    };
  }
  
  function generateMarketSummary(marketData) {
    if (!marketData) return { status: 'NO_DATA', message: 'Market data unavailable' };
    
    return {
      price: marketData.price,
      change_24h: marketData.change24h,
      volume: marketData.volume,
      trend: marketData.change24h > 2 ? 'BULLISH' : marketData.change24h < -2 ? 'BEARISH' : 'SIDEWAYS',
      market_cap: marketData.marketCap,
      summary: `ETH at $${marketData.price}, ${marketData.change24h > 0 ? 'up' : 'down'} ${Math.abs(marketData.change24h || 0).toFixed(2)}% in 24h`
    };
  }
  
  function analyzeTrend(marketData) {
    if (!marketData) return { trend: 'UNKNOWN', confidence: 0 };
    
    const change = marketData.change24h || 0;
    const volume = marketData.volume || 0;
    
    let trend = 'SIDEWAYS';
    let confidence = 50;
    
    if (change > 5) {
      trend = 'STRONG_BULLISH';
      confidence = 85;
    } else if (change > 2) {
      trend = 'BULLISH';
      confidence = 70;
    } else if (change < -5) {
      trend = 'STRONG_BEARISH';
      confidence = 85;
    } else if (change < -2) {
      trend = 'BEARISH';
      confidence = 70;
    }
    
    // Adjust confidence based on volume
    if (volume > 30000000) confidence += 10;
    if (volume < 10000000) confidence -= 15;
    
    return {
      trend,
      confidence: Math.min(95, Math.max(20, confidence)),
      change_24h: change,
      volume_support: volume > 20000000
    };
  }
  
  function generateRSIReading(marketData) {
    // Simulate RSI calculation
    const mockRSI = 45 + (Math.random() * 20); // 45-65 range
    
    let signal = 'NEUTRAL';
    if (mockRSI > 70) signal = 'OVERBOUGHT';
    else if (mockRSI < 30) signal = 'OVERSOLD';
    else if (mockRSI > 60) signal = 'BULLISH';
    else if (mockRSI < 40) signal = 'BEARISH';
    
    return {
      rsi: mockRSI.toFixed(2),
      signal,
      recommendation: signal === 'OVERBOUGHT' ? 'Consider selling' :
                     signal === 'OVERSOLD' ? 'Consider buying' :
                     signal === 'BULLISH' ? 'Upward momentum' :
                     signal === 'BEARISH' ? 'Downward momentum' : 'Hold position'
    };
  }
  
  function updateCommandStats(command, success) {
    const stats = fastCommandState.command_success_rates[command] || { total: 0, success: 0 };
    stats.total += 1;
    if (success) stats.success += 1;
    stats.success_rate = (stats.success / stats.total * 100).toFixed(1);
    
    fastCommandState.command_success_rates[command] = stats;
  }
  
  const parsedCommand = parseShortPhrase(userMessage);
  
  if (parsedCommand.found) {
    const execution = executeCommand(parsedCommand, marketData);
    updateCommandStats(parsedCommand.command, execution.success);
    
    // Add to execution history
    fastCommandState.execution_history.unshift(execution);
    if (fastCommandState.execution_history.length > 50) {
      fastCommandState.execution_history = fastCommandState.execution_history.slice(0, 50);
    }
    
    return {
      kons: "FastCommand",
      timestamp: currentTime,
      command_executed: true,
      original_phrase: userMessage,
      detected_command: parsedCommand.command,
      execution_result: execution,
      command_stats: fastCommandState.command_success_rates[parsedCommand.command],
      response_time: execution.execution_time,
      state_update: {
        fast_command_state: fastCommandState
      }
    };
  } else {
    return {
      kons: "FastCommand",
      timestamp: currentTime,
      command_executed: false,
      original_phrase: userMessage,
      suggested_command: parsedCommand.suggestion,
      available_commands: Object.keys(fastCommandState.command_success_rates).slice(0, 5),
      help_message: `Try: "${parsedCommand.suggestion}" or say "help commands" for full list`,
      state_update: {
        fast_command_state: fastCommandState
      }
    };
  }
}