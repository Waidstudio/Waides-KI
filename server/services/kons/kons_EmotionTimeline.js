/**
 * Kons_EmotionTimeline - Emotional State Tracking and Pattern Analysis
 * Tracks emotional patterns throughout trading sessions for better decision-making
 */

export function kons_EmotionTimeline(userMessage, marketData, previousState = {}) {
  const currentTime = Date.now();
  const emotionHistory = previousState.emotion_history || [];
  
  function detectEmotionalState(message) {
    const emotions = {
      excitement: ['excited', 'pumped', 'amazing', 'moon', 'rocket', '🚀', 'bullish', 'love'],
      fear: ['scared', 'afraid', 'worried', 'nervous', 'panic', 'crash', 'dump', 'bear'],
      greed: ['buy more', 'all in', 'yolo', 'maximum', 'everything', 'huge profit'],
      frustration: ['frustrated', 'angry', 'stupid', 'hate', 'wrong', 'loss', 'damn'],
      confidence: ['sure', 'certain', 'know', 'confident', 'easy', 'obvious', 'guaranteed'],
      uncertainty: ['unsure', 'maybe', 'think', 'hope', 'guess', 'confused', 'unclear'],
      regret: ['should have', 'wish', 'missed', 'regret', 'stupid me', 'why did'],
      neutral: ['analyze', 'check', 'look', 'consider', 'evaluate', 'study']
    };
    
    const lowerMessage = message.toLowerCase();
    const detectedEmotions = [];
    
    for (const [emotion, keywords] of Object.entries(emotions)) {
      const intensity = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
      if (intensity > 0) {
        detectedEmotions.push({ emotion, intensity });
      }
    }
    
    // Return strongest emotion or neutral
    if (detectedEmotions.length === 0) {
      return { primary: 'neutral', intensity: 1, confidence: 70 };
    }
    
    const strongest = detectedEmotions.reduce((prev, current) => 
      current.intensity > prev.intensity ? current : prev
    );
    
    return {
      primary: strongest.emotion,
      intensity: Math.min(10, strongest.intensity * 2),
      confidence: Math.min(95, 60 + (strongest.intensity * 15)),
      all_detected: detectedEmotions
    };
  }
  
  function addToEmotionHistory(emotion) {
    const emotionEntry = {
      timestamp: currentTime,
      emotion: emotion.primary,
      intensity: emotion.intensity,
      confidence: emotion.confidence,
      market_price: marketData?.price || null,
      market_change: marketData?.change24h || null
    };
    
    emotionHistory.push(emotionEntry);
    
    // Keep only last 100 entries
    if (emotionHistory.length > 100) {
      emotionHistory.splice(0, emotionHistory.length - 100);
    }
    
    return emotionEntry;
  }
  
  function analyzeEmotionalPatterns() {
    if (emotionHistory.length < 3) {
      return {
        trend: 'INSUFFICIENT_DATA',
        pattern: 'Building emotional baseline',
        volatility: 0
      };
    }
    
    const recent = emotionHistory.slice(-10);
    const emotionValues = {
      excitement: 8, fear: 2, greed: 9, frustration: 1,
      confidence: 7, uncertainty: 3, regret: 2, neutral: 5
    };
    
    const recentScores = recent.map(entry => emotionValues[entry.emotion] || 5);
    const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    
    const volatility = Math.sqrt(
      recentScores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / recentScores.length
    );
    
    let trend = 'STABLE';
    if (recentScores.length >= 5) {
      const firstHalf = recentScores.slice(0, Math.floor(recentScores.length / 2));
      const secondHalf = recentScores.slice(Math.floor(recentScores.length / 2));
      
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondAvg - firstAvg > 1) trend = 'IMPROVING';
      else if (firstAvg - secondAvg > 1) trend = 'DECLINING';
    }
    
    return {
      trend,
      average_emotional_state: avgScore,
      volatility: Math.round(volatility * 100) / 100,
      dominant_emotion: recent[recent.length - 1]?.emotion || 'neutral',
      pattern: volatility > 2 ? 'High emotional volatility detected' : 'Stable emotional state'
    };
  }
  
  function generateEmotionalGuidance(patterns, currentEmotion) {
    const guidance = [];
    
    if (currentEmotion.primary === 'fear' && currentEmotion.intensity > 6) {
      guidance.push({
        type: 'WARNING',
        message: 'High fear detected - avoid panic selling. Take deep breaths and review your strategy.'
      });
    }
    
    if (currentEmotion.primary === 'greed' && currentEmotion.intensity > 7) {
      guidance.push({
        type: 'CAUTION',
        message: 'Greed spike detected - resist FOMO and stick to your position sizing rules.'
      });
    }
    
    if (patterns.volatility > 2.5) {
      guidance.push({
        type: 'STABILITY',
        message: 'High emotional volatility - consider taking a break to regain clarity.'
      });
    }
    
    if (currentEmotion.primary === 'regret') {
      guidance.push({
        type: 'LEARNING',
        message: 'Regret is a teacher - analyze what happened and learn for next time.'
      });
    }
    
    if (patterns.trend === 'DECLINING') {
      guidance.push({
        type: 'SUPPORT',
        message: 'Emotional state declining - remember that trading is a marathon, not a sprint.'
      });
    }
    
    return guidance;
  }
  
  function calculateEmotionalRisk() {
    const currentEmotion = detectEmotionalState(userMessage);
    const patterns = analyzeEmotionalPatterns();
    
    let riskScore = 0;
    
    // High-risk emotions
    if (['fear', 'greed', 'frustration'].includes(currentEmotion.primary)) {
      riskScore += currentEmotion.intensity * 5;
    }
    
    // Emotional volatility risk
    riskScore += patterns.volatility * 10;
    
    // Trend risk
    if (patterns.trend === 'DECLINING') riskScore += 15;
    
    return {
      score: Math.min(100, riskScore),
      level: riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MODERATE' : 'LOW',
      recommendation: riskScore > 70 ? 'Pause trading until emotions stabilize' :
                     riskScore > 40 ? 'Proceed with extra caution' : 'Emotional state supports trading'
    };
  }
  
  const currentEmotion = detectEmotionalState(userMessage);
  const emotionEntry = addToEmotionHistory(currentEmotion);
  const patterns = analyzeEmotionalPatterns();
  const guidance = generateEmotionalGuidance(patterns, currentEmotion);
  const riskAssessment = calculateEmotionalRisk();
  
  return {
    kons: "EmotionTimeline",
    timestamp: currentTime,
    current_emotion: currentEmotion,
    emotion_entry: emotionEntry,
    patterns: patterns,
    emotional_guidance: guidance,
    risk_assessment: riskAssessment,
    timeline_stats: {
      total_entries: emotionHistory.length,
      session_duration: emotionHistory.length > 0 ? 
        currentTime - emotionHistory[0].timestamp : 0,
      emotional_consistency: patterns.volatility < 1.5 ? 'HIGH' : 'MODERATE'
    },
    state_update: {
      emotion_history: emotionHistory
    }
  };
}