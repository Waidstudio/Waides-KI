/**
 * Kons_FeelShiftDetector - Emotional Consciousness Layer
 * Detects user's emotional energy shift in real-time
 */

export function kons_FeelShiftDetector(userMessage, marketData, previousState = {}) {
  const currentTime = Date.now();
  const emotionalState = previousState.emotional_state || {
    baseline_emotion: 'neutral',
    emotion_history: [],
    shift_patterns: [],
    sensitivity_level: 'medium'
  };
  
  function analyzeEmotionalContent(message) {
    const lowerMessage = message.toLowerCase();
    const emotionalMarkers = {
      // Excitement/Euphoria
      excitement: {
        keywords: ['amazing', 'incredible', 'fantastic', 'moon', 'rocket', 'pumping', 'bullish', 'lets go'],
        intensity_modifiers: ['very', 'extremely', 'super', 'really', 'so', 'totally'],
        base_score: 7
      },
      
      // Fear/Anxiety
      fear: {
        keywords: ['scared', 'worried', 'nervous', 'panic', 'crash', 'dump', 'bearish', 'afraid'],
        intensity_modifiers: ['very', 'extremely', 'really', 'so', 'totally', 'completely'],
        base_score: 3
      },
      
      // Greed/FOMO
      greed: {
        keywords: ['more', 'all in', 'maximum', 'leverage', 'quick', 'fast', 'miss out', 'everyone'],
        intensity_modifiers: ['need', 'want', 'must', 'have to', 'should'],
        base_score: 8
      },
      
      // Anger/Frustration
      anger: {
        keywords: ['stupid', 'damn', 'hate', 'angry', 'pissed', 'frustrated', 'ridiculous', 'unfair'],
        intensity_modifiers: ['so', 'really', 'extremely', 'totally', 'completely'],
        base_score: 2
      },
      
      // Confidence
      confidence: {
        keywords: ['sure', 'certain', 'confident', 'know', 'guaranteed', 'definite', 'positive'],
        intensity_modifiers: ['very', 'extremely', 'completely', 'absolutely', 'totally'],
        base_score: 7
      },
      
      // Doubt/Uncertainty
      doubt: {
        keywords: ['maybe', 'perhaps', 'unsure', 'doubt', 'confused', 'uncertain', 'dont know'],
        intensity_modifiers: ['really', 'very', 'quite', 'somewhat', 'kind of'],
        base_score: 4
      },
      
      // Calm/Peaceful
      calm: {
        keywords: ['calm', 'peaceful', 'relaxed', 'steady', 'patient', 'zen', 'balanced'],
        intensity_modifiers: ['very', 'quite', 'really', 'completely'],
        base_score: 6
      },
      
      // Stress/Pressure
      stress: {
        keywords: ['stress', 'pressure', 'overwhelmed', 'tired', 'exhausted', 'burned out'],
        intensity_modifiers: ['very', 'extremely', 'really', 'so', 'completely'],
        base_score: 3
      }
    };
    
    const detectedEmotions = [];
    
    for (const [emotion, config] of Object.entries(emotionalMarkers)) {
      let score = 0;
      let foundKeywords = [];
      let intensity = 1.0;
      
      // Check for keywords
      config.keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          foundKeywords.push(keyword);
          score += config.base_score;
        }
      });
      
      if (foundKeywords.length > 0) {
        // Check for intensity modifiers
        config.intensity_modifiers.forEach(modifier => {
          if (lowerMessage.includes(modifier)) {
            intensity += 0.3;
          }
        });
        
        // Check for multiple exclamation marks or caps
        const exclamationCount = (message.match(/!/g) || []).length;
        const capsWords = (message.match(/[A-Z]{3,}/g) || []).length;
        
        if (exclamationCount > 1) intensity += 0.4;
        if (capsWords > 0) intensity += 0.5;
        
        const finalScore = Math.min(10, score * intensity);
        
        detectedEmotions.push({
          emotion,
          score: finalScore,
          keywords: foundKeywords,
          intensity,
          confidence: Math.min(95, foundKeywords.length * 25 + intensity * 20)
        });
      }
    }
    
    return detectedEmotions.sort((a, b) => b.score - a.score);
  }
  
  function detectEmotionalShift(currentEmotions, previousEmotions) {
    if (!previousEmotions || previousEmotions.length === 0) {
      return {
        shift_detected: false,
        shift_type: 'BASELINE_ESTABLISHMENT',
        primary_emotion: currentEmotions[0]?.emotion || 'neutral',
        shift_magnitude: 0
      };
    }
    
    const currentPrimary = currentEmotions[0];
    const previousPrimary = previousEmotions[0];
    
    if (!currentPrimary || !previousPrimary) {
      return { shift_detected: false, shift_type: 'NO_DATA' };
    }
    
    const emotionChanged = currentPrimary.emotion !== previousPrimary.emotion;
    const scoreDifference = Math.abs(currentPrimary.score - previousPrimary.score);
    const significantChange = scoreDifference > 2.0;
    
    if (emotionChanged || significantChange) {
      const shiftType = determineShiftType(previousPrimary, currentPrimary);
      
      return {
        shift_detected: true,
        shift_type: shiftType,
        from_emotion: previousPrimary.emotion,
        to_emotion: currentPrimary.emotion,
        from_score: previousPrimary.score,
        to_score: currentPrimary.score,
        shift_magnitude: scoreDifference,
        shift_direction: currentPrimary.score > previousPrimary.score ? 'INTENSIFYING' : 'DIMINISHING',
        timestamp: currentTime
      };
    }
    
    return { shift_detected: false, shift_type: 'STABLE' };
  }
  
  function determineShiftType(from, to) {
    const emotionalTransitions = {
      'fear_to_excitement': ['fear', 'excitement'],
      'excitement_to_fear': ['excitement', 'fear'],
      'calm_to_stress': ['calm', 'stress'],
      'stress_to_calm': ['stress', 'calm'],
      'doubt_to_confidence': ['doubt', 'confidence'],
      'confidence_to_doubt': ['confidence', 'doubt'],
      'greed_spike': ['calm', 'greed'],
      'fear_spike': ['calm', 'fear'],
      'emotional_crash': ['excitement', 'anger']
    };
    
    for (const [transitionType, [fromEmotion, toEmotion]] of Object.entries(emotionalTransitions)) {
      if (from.emotion === fromEmotion && to.emotion === toEmotion) {
        return transitionType.toUpperCase();
      }
    }
    
    // Check for intensity changes within same emotion
    if (from.emotion === to.emotion) {
      const intensityChange = to.score - from.score;
      if (intensityChange > 2) return 'INTENSITY_SPIKE';
      if (intensityChange < -2) return 'INTENSITY_DROP';
    }
    
    return 'GENERAL_SHIFT';
  }
  
  function generateEmotionalGuidance(emotions, shift) {
    if (!emotions || emotions.length === 0) {
      return {
        guidance_type: 'NEUTRAL',
        message: 'Emotional state appears balanced',
        recommended_action: 'Continue with current approach'
      };
    }
    
    const primaryEmotion = emotions[0];
    
    const guidanceMap = {
      excitement: {
        guidance_type: 'CAUTION',
        message: 'High excitement detected - be aware of potential overconfidence',
        recommended_action: 'Take a moment to review risk management before major decisions'
      },
      fear: {
        guidance_type: 'SUPPORT',
        message: 'Fear present - this is normal in trading, breathe and center yourself',
        recommended_action: 'Consider reducing position sizes until clarity returns'
      },
      greed: {
        guidance_type: 'WARNING',
        message: 'Greed patterns detected - this can lead to poor decisions',
        recommended_action: 'Step back and review your original trading plan'
      },
      anger: {
        guidance_type: 'PAUSE',
        message: 'Anger can cloud judgment - take time to cool down',
        recommended_action: 'Avoid making trading decisions until emotional state stabilizes'
      },
      confidence: {
        guidance_type: 'BALANCE',
        message: 'Confidence is good but stay humble to market forces',
        recommended_action: 'Proceed with structured approach, avoid overleverage'
      },
      doubt: {
        guidance_type: 'CLARITY',
        message: 'Uncertainty is present - seek additional information or guidance',
        recommended_action: 'Consider paper trading or smaller positions until confidence builds'
      },
      calm: {
        guidance_type: 'OPTIMAL',
        message: 'Excellent emotional state for trading decisions',
        recommended_action: 'This is an ideal time for strategic planning and execution'
      },
      stress: {
        guidance_type: 'RECOVERY',
        message: 'Stress levels elevated - prioritize well-being',
        recommended_action: 'Consider taking a break or reducing trading activity'
      }
    };
    
    const guidance = guidanceMap[primaryEmotion.emotion] || guidanceMap.calm;
    
    // Add shift-specific guidance
    if (shift.shift_detected) {
      guidance.shift_warning = generateShiftWarning(shift);
    }
    
    return guidance;
  }
  
  function generateShiftWarning(shift) {
    const warningMap = {
      'FEAR_TO_EXCITEMENT': 'Rapid emotional swing detected - ensure this excitement is based on analysis, not just relief',
      'EXCITEMENT_TO_FEAR': 'Emotional reversal detected - stay grounded and avoid panic reactions',
      'CALM_TO_STRESS': 'Stress levels rising - take steps to manage pressure before it affects decisions',
      'GREED_SPIKE': 'Sudden greed spike - this is often when traders make costly mistakes',
      'FEAR_SPIKE': 'Fear spike detected - market volatility affecting emotions',
      'INTENSITY_SPIKE': 'Emotional intensity increasing rapidly - monitor for decision quality',
      'EMOTIONAL_CRASH': 'Emotional crash pattern - consider stepping away temporarily'
    };
    
    return warningMap[shift.shift_type] || 'Emotional state changing - maintain awareness';
  }
  
  function updateEmotionalHistory(emotions, shift) {
    const newEntry = {
      timestamp: currentTime,
      primary_emotion: emotions[0]?.emotion || 'neutral',
      emotion_score: emotions[0]?.score || 5,
      all_emotions: emotions,
      shift_data: shift
    };
    
    emotionalState.emotion_history.unshift(newEntry);
    
    // Keep last 20 entries
    if (emotionalState.emotion_history.length > 20) {
      emotionalState.emotion_history = emotionalState.emotion_history.slice(0, 20);
    }
    
    // Update baseline if stable pattern
    if (emotionalState.emotion_history.length >= 5) {
      const recentEmotions = emotionalState.emotion_history.slice(0, 5);
      const stableEmotion = recentEmotions.every(entry => 
        entry.primary_emotion === recentEmotions[0].primary_emotion
      );
      
      if (stableEmotion) {
        emotionalState.baseline_emotion = recentEmotions[0].primary_emotion;
      }
    }
    
    return emotionalState;
  }
  
  const currentEmotions = analyzeEmotionalContent(userMessage);
  const previousEmotions = emotionalState.emotion_history[0]?.all_emotions || [];
  const emotionalShift = detectEmotionalShift(currentEmotions, previousEmotions);
  const guidance = generateEmotionalGuidance(currentEmotions, emotionalShift);
  const updatedState = updateEmotionalHistory(currentEmotions, emotionalShift);
  
  return {
    kons: "FeelShiftDetector",
    timestamp: currentTime,
    emotional_analysis: {
      current_emotions: currentEmotions,
      primary_emotion: currentEmotions[0]?.emotion || 'neutral',
      emotion_intensity: currentEmotions[0]?.score || 5,
      confidence_level: currentEmotions[0]?.confidence || 50
    },
    shift_detection: emotionalShift,
    emotional_guidance: guidance,
    emotional_trends: {
      baseline_emotion: updatedState.baseline_emotion,
      recent_pattern: updatedState.emotion_history.slice(0, 3).map(e => e.primary_emotion),
      stability_score: calculateEmotionalStability(updatedState.emotion_history),
      volatility_level: calculateEmotionalVolatility(updatedState.emotion_history)
    },
    immediate_recommendations: {
      trading_readiness: assessTradingReadiness(currentEmotions, emotionalShift),
      emotional_action: guidance.recommended_action,
      warning_level: determineWarningLevel(currentEmotions, emotionalShift)
    },
    state_update: {
      emotional_state: updatedState
    }
  };
  
  function calculateEmotionalStability(history) {
    if (history.length < 3) return 50;
    
    const recentEntries = history.slice(0, 5);
    const emotionChanges = recentEntries.reduce((changes, entry, index) => {
      if (index > 0 && entry.primary_emotion !== recentEntries[index - 1].primary_emotion) {
        changes++;
      }
      return changes;
    }, 0);
    
    return Math.max(20, 100 - (emotionChanges * 25));
  }
  
  function calculateEmotionalVolatility(history) {
    if (history.length < 3) return 'LOW';
    
    const recentScores = history.slice(0, 5).map(e => e.emotion_score);
    const variance = recentScores.reduce((sum, score) => {
      const mean = recentScores.reduce((a, b) => a + b) / recentScores.length;
      return sum + Math.pow(score - mean, 2);
    }, 0) / recentScores.length;
    
    if (variance > 4) return 'HIGH';
    if (variance > 2) return 'MEDIUM';
    return 'LOW';
  }
  
  function assessTradingReadiness(emotions, shift) {
    if (!emotions || emotions.length === 0) return 'NEUTRAL';
    
    const primary = emotions[0];
    const problematicEmotions = ['fear', 'greed', 'anger', 'stress'];
    const goodEmotions = ['calm', 'confidence'];
    
    if (shift.shift_detected && shift.shift_magnitude > 3) return 'NOT_READY';
    if (problematicEmotions.includes(primary.emotion) && primary.score > 7) return 'NOT_READY';
    if (goodEmotions.includes(primary.emotion) && primary.score > 6) return 'READY';
    
    return 'CAUTIOUS';
  }
  
  function determineWarningLevel(emotions, shift) {
    if (!emotions || emotions.length === 0) return 'GREEN';
    
    const primary = emotions[0];
    
    if (shift.shift_detected && ['GREED_SPIKE', 'FEAR_SPIKE', 'EMOTIONAL_CRASH'].includes(shift.shift_type)) {
      return 'RED';
    }
    
    if (primary.emotion === 'anger' && primary.score > 7) return 'RED';
    if (['fear', 'greed', 'stress'].includes(primary.emotion) && primary.score > 6) return 'YELLOW';
    
    return 'GREEN';
  }
}