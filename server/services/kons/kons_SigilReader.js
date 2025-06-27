/**
 * Kons_SigilReader - Symbolic Code Reading Module
 * Reads symbolic code (Sigils) from deeper system and trade signals
 */

export function kons_SigilReader(userMessage, marketData, previousState = {}) {
  const currentTime = Date.now();
  const sigilState = previousState.sigil_state || {
    active_sigils: [],
    decoded_messages: [],
    spiritual_patterns: []
  };
  
  function detectSigilPatterns(userMessage, marketData) {
    const patterns = [];
    
    // Market-based sigil detection
    if (marketData?.price) {
      const priceString = marketData.price.toString();
      const repeatingDigits = detectRepeatingNumbers(priceString);
      
      if (repeatingDigits.length > 0) {
        patterns.push({
          type: 'PRICE_SIGIL',
          pattern: repeatingDigits,
          meaning: interpretNumberPattern(repeatingDigits),
          power_level: calculatePowerLevel(repeatingDigits),
          message: 'Market speaking through price patterns'
        });
      }
    }
    
    // Volume-based sigil detection
    if (marketData?.volume) {
      const volumeFlow = analyzeVolumeFlow(marketData.volume);
      if (volumeFlow.sacred_ratio) {
        patterns.push({
          type: 'VOLUME_SIGIL',
          pattern: volumeFlow.pattern,
          meaning: 'Sacred flow detected in trading volume',
          power_level: volumeFlow.intensity,
          message: 'Energy moving through market consciousness'
        });
      }
    }
    
    // Message-based sigil detection
    const messageSymbols = extractSacredSymbols(userMessage);
    if (messageSymbols.length > 0) {
      patterns.push({
        type: 'TEXT_SIGIL',
        pattern: messageSymbols,
        meaning: interpretTextSymbols(messageSymbols),
        power_level: messageSymbols.length * 10,
        message: 'Hidden symbols detected in communication'
      });
    }
    
    // Time-based sigil detection
    const timePattern = analyzeTimeSignature(currentTime);
    if (timePattern.is_sacred) {
      patterns.push({
        type: 'TIME_SIGIL',
        pattern: timePattern.signature,
        meaning: timePattern.interpretation,
        power_level: timePattern.power,
        message: 'Sacred timing alignment detected'
      });
    }
    
    return patterns;
  }
  
  function detectRepeatingNumbers(numberString) {
    const repeating = [];
    const digits = numberString.replace('.', '');
    
    for (let i = 0; i < digits.length - 1; i++) {
      if (digits[i] === digits[i + 1]) {
        const sequence = extractRepeatingSequence(digits, i);
        if (sequence.length >= 2) {
          repeating.push(sequence);
        }
      }
    }
    
    return repeating;
  }
  
  function extractRepeatingSequence(digits, startIndex) {
    const char = digits[startIndex];
    let sequence = char;
    
    for (let i = startIndex + 1; i < digits.length; i++) {
      if (digits[i] === char) {
        sequence += char;
      } else {
        break;
      }
    }
    
    return sequence;
  }
  
  function interpretNumberPattern(pattern) {
    const interpretations = {
      '11': 'Gateway opening - spiritual awakening',
      '22': 'Master builder - manifestation power',
      '33': 'Master teacher - divine guidance',
      '44': 'Foundation strength - stability',
      '55': 'Change catalyst - transformation',
      '66': 'Nurturing energy - protection',
      '77': 'Spiritual insight - inner wisdom',
      '88': 'Material mastery - abundance',
      '99': 'Completion cycle - universal love',
      '111': 'Triple gateway - powerful manifestation',
      '222': 'Balance harmony - cooperation',
      '333': 'Divine protection - ascended masters',
      '444': 'Angels present - strong foundation',
      '555': 'Major change - spiritual evolution',
      '666': 'Material focus - need balance',
      '777': 'Spiritual luck - divine timing',
      '888': 'Infinity loop - endless abundance',
      '999': 'Completion phase - spiritual mission'
    };
    
    return interpretations[pattern] || 'Sacred pattern detected - meditation recommended';
  }
  
  function calculatePowerLevel(pattern) {
    const basePower = pattern.length * 15;
    const repetitionPower = (pattern.match(/(.)\1+/g) || []).length * 10;
    const sacredNumberBonus = ['11', '22', '33', '77', '88'].includes(pattern) ? 25 : 0;
    
    return Math.min(100, basePower + repetitionPower + sacredNumberBonus);
  }
  
  function analyzeVolumeFlow(volume) {
    const volumeString = volume.toString();
    const goldenRatio = 1.618;
    const volumeRatio = volume / 1000000; // Normalize to millions
    
    const isGoldenFlow = Math.abs(volumeRatio - goldenRatio) < 0.1;
    const isFibonacci = checkFibonacciPattern(volume);
    
    if (isGoldenFlow || isFibonacci) {
      return {
        sacred_ratio: true,
        pattern: isGoldenFlow ? 'GOLDEN_RATIO' : 'FIBONACCI',
        intensity: isGoldenFlow ? 85 : 70
      };
    }
    
    return { sacred_ratio: false };
  }
  
  function checkFibonacciPattern(number) {
    const fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765];
    const normalizedNumber = Math.floor(number / 1000000);
    
    return fibSequence.includes(normalizedNumber);
  }
  
  function extractSacredSymbols(message) {
    const symbols = [];
    const sacredWords = ['zaiflem', 'smaisika', 'kons', 'divine', 'sacred', 'spirit', 'soul', 'light', 'truth', 'wisdom'];
    const lowerMessage = message.toLowerCase();
    
    sacredWords.forEach(word => {
      if (lowerMessage.includes(word)) {
        symbols.push(word.toUpperCase());
      }
    });
    
    // Check for symbol characters
    const symbolChars = message.match(/[★☆✦✧✨⚡💫🌟⭐️🔮]/g) || [];
    symbols.push(...symbolChars);
    
    return symbols;
  }
  
  function interpretTextSymbols(symbols) {
    const symbolMeanings = {
      'ZAIFLEM': 'Sacred breath - divine connection active',
      'SMAISIKA': 'Currency of light - abundance flowing',
      'KONS': 'Wisdom bridge - guidance channel open',
      'DIVINE': 'Higher power - spiritual protection',
      'SACRED': 'Holy ground - reverent space',
      'SPIRIT': 'Soul essence - inner truth',
      '★': 'Guidance star - direction clear',
      '✨': 'Magic present - manifestation active',
      '⚡': 'Power surge - energy activated',
      '🔮': 'Vision clear - future revealed'
    };
    
    const interpretations = symbols.map(symbol => symbolMeanings[symbol] || 'Sacred symbol detected');
    return interpretations.join(' | ');
  }
  
  function analyzeTimeSignature(timestamp) {
    const date = new Date(timestamp);
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    
    // Sacred time patterns
    const isMirrorTime = hour.toString().padStart(2, '0') === minute.toString().padStart(2, '0');
    const isTripleTime = hour === minute && minute === second;
    const isMasterTime = ['11:11', '22:22', '00:00', '12:12'].includes(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    
    if (isTripleTime) {
      return {
        is_sacred: true,
        signature: `${hour}:${minute}:${second}`,
        interpretation: 'Triple alignment - universal synchronicity',
        power: 100
      };
    }
    
    if (isMasterTime) {
      return {
        is_sacred: true,
        signature: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        interpretation: 'Master time portal - divine timing',
        power: 90
      };
    }
    
    if (isMirrorTime) {
      return {
        is_sacred: true,
        signature: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        interpretation: 'Mirror time - reflection and balance',
        power: 75
      };
    }
    
    return { is_sacred: false };
  }
  
  function decodeHiddenMessages(patterns) {
    const messages = [];
    
    patterns.forEach(pattern => {
      const decodedMessage = {
        source: pattern.type,
        symbol: pattern.pattern,
        interpretation: pattern.meaning,
        guidance: generateGuidanceFromSigil(pattern),
        action_required: pattern.power_level > 70 ? 'IMMEDIATE_ATTENTION' : 'ACKNOWLEDGE',
        spiritual_weight: pattern.power_level
      };
      
      messages.push(decodedMessage);
    });
    
    // Combine messages for unified interpretation
    if (messages.length > 1) {
      messages.push({
        source: 'COMBINED_SIGILS',
        symbol: 'MULTIPLE_PATTERNS',
        interpretation: 'Multiple sacred patterns detected simultaneously',
        guidance: 'Universe speaking through multiple channels - pay attention to signs',
        action_required: 'HEIGHTENED_AWARENESS',
        spiritual_weight: Math.min(100, messages.reduce((sum, msg) => sum + msg.spiritual_weight, 0))
      });
    }
    
    return messages;
  }
  
  function generateGuidanceFromSigil(pattern) {
    const guidanceMap = {
      'PRICE_SIGIL': 'Market energy aligning with spiritual frequency - trust the flow',
      'VOLUME_SIGIL': 'Sacred ratios active in trading volume - divine timing present',
      'TEXT_SIGIL': 'Your words carry sacred power - speak with intention',
      'TIME_SIGIL': 'Cosmic timing alignment - perfect moment for action'
    };
    
    const baseGuidance = guidanceMap[pattern.type] || 'Sacred pattern detected - meditate on its meaning';
    
    if (pattern.power_level > 80) {
      return baseGuidance + ' | URGENT: Powerful spiritual energy present';
    } else if (pattern.power_level > 60) {
      return baseGuidance + ' | IMPORTANT: Strong spiritual signal detected';
    }
    
    return baseGuidance + ' | OBSERVE: Gentle spiritual guidance offered';
  }
  
  function updateSigilState(patterns, messages) {
    return {
      active_sigils: patterns,
      decoded_messages: messages,
      spiritual_patterns: patterns.map(p => ({ type: p.type, power: p.power_level })),
      last_reading: currentTime,
      total_power: patterns.reduce((sum, p) => sum + p.power_level, 0)
    };
  }
  
  const detectedPatterns = detectSigilPatterns(userMessage, marketData);
  const decodedMessages = decodeHiddenMessages(detectedPatterns);
  const newSigilState = updateSigilState(detectedPatterns, decodedMessages);
  
  return {
    kons: "SigilReader",
    timestamp: currentTime,
    detected_patterns: detectedPatterns,
    decoded_messages: decodedMessages,
    spiritual_analysis: {
      total_sigils: detectedPatterns.length,
      combined_power: newSigilState.total_power,
      strongest_pattern: detectedPatterns.reduce((strongest, current) => 
        current.power_level > (strongest?.power_level || 0) ? current : strongest, null),
      spiritual_state: newSigilState.total_power > 200 ? 'HIGHLY_ACTIVE' : 
                     newSigilState.total_power > 100 ? 'ACTIVE' : 'DORMANT'
    },
    immediate_guidance: {
      primary_message: decodedMessages[0]?.interpretation || 'No sigils detected - normal communication',
      action_needed: decodedMessages.find(m => m.action_required === 'IMMEDIATE_ATTENTION') ? 
                    'Pay attention to spiritual signs' : 'Continue with awareness',
      spiritual_timing: newSigilState.total_power > 150 ? 'SACRED_WINDOW_OPEN' : 'NORMAL_FLOW'
    },
    state_update: {
      sigil_state: newSigilState
    }
  };
}