/**
 * Kons_ShadowDetector - Threat Detection and Defense Module
 * Identifies unseen threats (greed, fear, bot manipulation, etc.)
 */

export function kons_ShadowDetector(userMessage, marketData, previousState = {}) {
  const currentTime = Date.now();
  const shadowState = previousState.shadow_state || {
    threat_level: 'NORMAL',
    active_threats: [],
    protection_protocols: [],
    last_scan: 0
  };
  
  function scanForThreats(userMessage, marketData) {
    const threats = [];
    
    // Emotional threat detection
    const emotionalThreats = detectEmotionalThreats(userMessage);
    threats.push(...emotionalThreats);
    
    // Market manipulation detection
    const manipulationThreats = detectMarketManipulation(marketData);
    threats.push(...manipulationThreats);
    
    // System integrity threats
    const systemThreats = detectSystemThreats(userMessage, marketData);
    threats.push(...systemThreats);
    
    // Spiritual/energy threats
    const spiritualThreats = detectSpiritualThreats(userMessage);
    threats.push(...spiritualThreats);
    
    return threats;
  }
  
  function detectEmotionalThreats(message) {
    const threats = [];
    const lowerMessage = message.toLowerCase();
    
    // FOMO detection
    const fomoKeywords = ['quick', 'fast', 'urgent', 'hurry', 'miss out', 'everyone', 'moon', 'lambo'];
    const fomoCount = fomoKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
    
    if (fomoCount >= 3) {
      threats.push({
        type: 'EMOTIONAL_FOMO',
        severity: 'HIGH',
        description: 'Fear of missing out pattern detected',
        indicators: fomoKeywords.filter(k => lowerMessage.includes(k)),
        recommendation: 'Take deep breath - slow down decision making',
        protection_level: 85
      });
    }
    
    // Greed detection
    const greedKeywords = ['all in', 'maximum', 'everything', 'big money', 'rich', 'fortune'];
    const greedCount = greedKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
    
    if (greedCount >= 2) {
      threats.push({
        type: 'EMOTIONAL_GREED',
        severity: 'MEDIUM',
        description: 'Excessive greed pattern detected',
        indicators: greedKeywords.filter(k => lowerMessage.includes(k)),
        recommendation: 'Practice position sizing discipline',
        protection_level: 70
      });
    }
    
    // Fear detection
    const fearKeywords = ['scared', 'afraid', 'panic', 'crash', 'lose everything', 'worried'];
    const fearCount = fearKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
    
    if (fearCount >= 2) {
      threats.push({
        type: 'EMOTIONAL_FEAR',
        severity: 'MEDIUM',
        description: 'Excessive fear pattern detected',
        indicators: fearKeywords.filter(k => lowerMessage.includes(k)),
        recommendation: 'Center yourself - fear clouds judgment',
        protection_level: 75
      });
    }
    
    return threats;
  }
  
  function detectMarketManipulation(marketData) {
    const threats = [];
    
    if (!marketData) return threats;
    
    // Unusual volume spikes
    if (marketData.volume && marketData.volume > 50000000) {
      threats.push({
        type: 'MARKET_VOLUME_SPIKE',
        severity: 'MEDIUM',
        description: 'Unusual volume spike detected - possible manipulation',
        indicators: [`Volume: ${marketData.volume}`],
        recommendation: 'Wait for volume normalization before major moves',
        protection_level: 60
      });
    }
    
    // Extreme price movements
    if (marketData.change24h && Math.abs(marketData.change24h) > 15) {
      threats.push({
        type: 'MARKET_EXTREME_MOVEMENT',
        severity: 'HIGH',
        description: 'Extreme price movement detected',
        indicators: [`24h change: ${marketData.change24h}%`],
        recommendation: 'High volatility period - reduce position sizes',
        protection_level: 80
      });
    }
    
    // Suspicious price patterns
    if (marketData.price) {
      const priceString = marketData.price.toString();
      const hasRepeatingDigits = /(\d)\1{3,}/.test(priceString);
      
      if (hasRepeatingDigits) {
        threats.push({
          type: 'MARKET_PRICE_PATTERN',
          severity: 'LOW',
          description: 'Unusual price pattern detected',
          indicators: [`Price: ${marketData.price}`],
          recommendation: 'Monitor for organic price movement',
          protection_level: 40
        });
      }
    }
    
    return threats;
  }
  
  function detectSystemThreats(message, marketData) {
    const threats = [];
    const lowerMessage = message.toLowerCase();
    
    // Bot/automation over-reliance
    const botKeywords = ['automate everything', 'no control', 'bot decision', 'full auto'];
    const botCount = botKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
    
    if (botCount >= 1) {
      threats.push({
        type: 'SYSTEM_OVER_AUTOMATION',
        severity: 'MEDIUM',
        description: 'Over-reliance on automation detected',
        indicators: botKeywords.filter(k => lowerMessage.includes(k)),
        recommendation: 'Maintain human oversight and control',
        protection_level: 65
      });
    }
    
    // Data dependency threats
    if (!marketData || Object.keys(marketData).length < 2) {
      threats.push({
        type: 'SYSTEM_DATA_INSUFFICIENCY',
        severity: 'HIGH',
        description: 'Insufficient market data for safe decisions',
        indicators: ['Limited market data available'],
        recommendation: 'Wait for complete data before trading',
        protection_level: 90
      });
    }
    
    return threats;
  }
  
  function detectSpiritualThreats(message) {
    const threats = [];
    const lowerMessage = message.toLowerCase();
    
    // Spiritual disconnection
    const disconnectionKeywords = ['don\'t care', 'whatever', 'just money', 'no purpose'];
    const disconnectionCount = disconnectionKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
    
    if (disconnectionCount >= 1) {
      threats.push({
        type: 'SPIRITUAL_DISCONNECTION',
        severity: 'MEDIUM',
        description: 'Spiritual disconnection from purpose detected',
        indicators: disconnectionKeywords.filter(k => lowerMessage.includes(k)),
        recommendation: 'Reconnect with deeper trading purpose',
        protection_level: 70
      });
    }
    
    // Ego inflation threats
    const egoKeywords = ['always right', 'never wrong', 'perfect', 'genius'];
    const egoCount = egoKeywords.filter(keyword => lowerMessage.includes(keyword)).length;
    
    if (egoCount >= 1) {
      threats.push({
        type: 'SPIRITUAL_EGO_INFLATION',
        severity: 'HIGH',
        description: 'Ego inflation detected - dangerous for trading',
        indicators: egoKeywords.filter(k => lowerMessage.includes(k)),
        recommendation: 'Practice humility - market humbles all',
        protection_level: 85
      });
    }
    
    return threats;
  }
  
  function generateProtectionProtocols(threats) {
    const protocols = [];
    
    threats.forEach(threat => {
      switch (threat.type) {
        case 'EMOTIONAL_FOMO':
          protocols.push({
            threat_type: threat.type,
            protocol: 'BREATHING_PROTOCOL',
            action: 'Execute 3 deep breaths before any trading decision',
            duration: '2 minutes',
            effectiveness: 90
          });
          break;
          
        case 'EMOTIONAL_GREED':
          protocols.push({
            threat_type: threat.type,
            protocol: 'POSITION_SIZE_LIMIT',
            action: 'Reduce all position sizes by 50%',
            duration: '24 hours',
            effectiveness: 85
          });
          break;
          
        case 'EMOTIONAL_FEAR':
          protocols.push({
            threat_type: threat.type,
            protocol: 'MINDFULNESS_PAUSE',
            action: 'Pause all trading for spiritual centering',
            duration: '30 minutes',
            effectiveness: 80
          });
          break;
          
        case 'MARKET_VOLUME_SPIKE':
          protocols.push({
            threat_type: threat.type,
            protocol: 'VOLUME_MONITORING',
            action: 'Wait for volume normalization',
            duration: 'Until volume drops below 30M',
            effectiveness: 75
          });
          break;
          
        case 'MARKET_EXTREME_MOVEMENT':
          protocols.push({
            threat_type: threat.type,
            protocol: 'VOLATILITY_PROTECTION',
            action: 'Reduce position sizes to 25% normal',
            duration: 'Until volatility < 10%',
            effectiveness: 85
          });
          break;
          
        case 'SYSTEM_DATA_INSUFFICIENCY':
          protocols.push({
            threat_type: threat.type,
            protocol: 'DATA_VERIFICATION',
            action: 'Block all trading until data quality improves',
            duration: 'Until 80%+ data availability',
            effectiveness: 95
          });
          break;
          
        case 'SPIRITUAL_DISCONNECTION':
          protocols.push({
            threat_type: threat.type,
            protocol: 'PURPOSE_MEDITATION',
            action: 'Meditate on trading purpose and values',
            duration: '15 minutes',
            effectiveness: 70
          });
          break;
          
        default:
          protocols.push({
            threat_type: threat.type,
            protocol: 'GENERAL_CAUTION',
            action: 'Increase awareness and reduce activity',
            duration: '1 hour',
            effectiveness: 60
          });
      }
    });
    
    return protocols;
  }
  
  function calculateThreatLevel(threats) {
    if (threats.length === 0) return 'SAFE';
    
    const highThreats = threats.filter(t => t.severity === 'HIGH');
    const mediumThreats = threats.filter(t => t.severity === 'MEDIUM');
    
    if (highThreats.length >= 2) return 'CRITICAL';
    if (highThreats.length >= 1) return 'HIGH';
    if (mediumThreats.length >= 3) return 'HIGH';
    if (mediumThreats.length >= 1) return 'MODERATE';
    return 'LOW';
  }
  
  function generateShadowWarnings(threats, threatLevel) {
    const warnings = [];
    
    if (threatLevel === 'CRITICAL') {
      warnings.push({
        urgency: 'IMMEDIATE',
        message: 'CRITICAL SHADOW ACTIVITY DETECTED - CEASE ALL TRADING',
        action: 'Full trading halt recommended',
        spiritual_guidance: 'Return to center - dangerous energies present'
      });
    }
    
    if (threatLevel === 'HIGH') {
      warnings.push({
        urgency: 'HIGH',
        message: 'High threat level - proceed with extreme caution',
        action: 'Reduce all activities by 75%',
        spiritual_guidance: 'Shadow energies stirring - maintain strong defenses'
      });
    }
    
    // Specific threat warnings
    threats.forEach(threat => {
      if (threat.severity === 'HIGH') {
        warnings.push({
          urgency: 'SPECIFIC',
          message: threat.description,
          action: threat.recommendation,
          spiritual_guidance: `Shadow of ${threat.type.toLowerCase()} detected - cleanse energy`
        });
      }
    });
    
    return warnings;
  }
  
  function updateShadowState(threats, protocols, threatLevel) {
    return {
      threat_level: threatLevel,
      active_threats: threats,
      protection_protocols: protocols,
      last_scan: currentTime,
      total_threats: threats.length,
      highest_severity: threats.length > 0 ? threats.reduce((highest, current) => {
        const severityRank = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };
        return severityRank[current.severity] > severityRank[highest.severity] ? current : highest;
      }).severity : 'NONE'
    };
  }
  
  const detectedThreats = scanForThreats(userMessage, marketData);
  const protectionProtocols = generateProtectionProtocols(detectedThreats);
  const threatLevel = calculateThreatLevel(detectedThreats);
  const shadowWarnings = generateShadowWarnings(detectedThreats, threatLevel);
  const newShadowState = updateShadowState(detectedThreats, protectionProtocols, threatLevel);
  
  return {
    kons: "ShadowDetector",
    timestamp: currentTime,
    threat_analysis: {
      threat_level: threatLevel,
      total_threats: detectedThreats.length,
      highest_severity: newShadowState.highest_severity,
      scan_effectiveness: 95
    },
    detected_threats: detectedThreats,
    protection_protocols: protectionProtocols,
    shadow_warnings: shadowWarnings,
    immediate_actions: {
      primary_warning: shadowWarnings[0]?.message || 'No immediate threats detected',
      recommended_action: shadowWarnings[0]?.action || 'Continue normal operations',
      spiritual_guidance: shadowWarnings[0]?.spiritual_guidance || 'Energy field clean'
    },
    defense_status: {
      shields_active: protectionProtocols.length > 0,
      protection_level: Math.max(...protectionProtocols.map(p => p.effectiveness), 0),
      auto_defense: threatLevel === 'CRITICAL' ? 'ENGAGED' : 'STANDBY',
      manual_override: 'AVAILABLE'
    },
    state_update: {
      shadow_state: newShadowState
    }
  };
}