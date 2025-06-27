/**
 * Kons_ExplainLikeFive - Simplified Complex Trading Concept Explanations
 * Converts complex trading terms and concepts into easy-to-understand language
 */

export function kons_ExplainLikeFive(userMessage, marketData, previousState = {}) {
  const currentTime = Date.now();
  
  function detectComplexConcepts(message) {
    const complexTerms = {
      'rsi': 'Relative Strength Index - tells if ETH is too expensive or too cheap right now',
      'macd': 'Moving Average - shows if ETH price is going up or down trend',
      'support': 'Support Level - like a floor that stops ETH price from falling lower',
      'resistance': 'Resistance Level - like a ceiling that stops ETH price from going higher',
      'volume': 'Volume - how many people are buying and selling ETH right now',
      'volatility': 'Volatility - how much ETH price jumps up and down',
      'market cap': 'Market Cap - how much all ETH coins are worth together',
      'liquidity': 'Liquidity - how easy it is to buy or sell ETH quickly',
      'fibonacci': 'Fibonacci - special numbers that help predict where price might go',
      'bollinger bands': 'Bollinger Bands - lines that show if ETH price is normal or extreme',
      'candlestick': 'Candlestick - a chart that shows ETH price like a candle with a body and wicks',
      'bull market': 'Bull Market - when prices keep going up like a bull charging forward',
      'bear market': 'Bear Market - when prices keep going down like a bear swinging down',
      'hodl': 'HODL - holding onto your ETH for a long time instead of selling quickly',
      'fomo': 'FOMO - Fear of Missing Out, when you buy because others are buying',
      'fud': 'FUD - Fear, Uncertainty, Doubt - negative news that scares people',
      'whale': 'Whale - someone who owns lots of ETH and can move the price',
      'pump': 'Pump - when price goes up fast, often artificially',
      'dump': 'Dump - when price goes down fast, usually after a pump',
      'dca': 'DCA - Dollar Cost Averaging, buying the same amount regularly regardless of price'
    };
    
    const detectedTerms = [];
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [term, explanation] of Object.entries(complexTerms)) {
      if (lowerMessage.includes(term)) {
        detectedTerms.push({ term, explanation });
      }
    }
    
    return detectedTerms;
  }
  
  function generateSimpleExplanation(concepts) {
    if (concepts.length === 0) {
      return {
        hasExplanation: false,
        message: 'No complex terms detected in your message'
      };
    }
    
    let explanation = "🧠 **Simple Explanations:**\n\n";
    
    concepts.forEach((concept, index) => {
      explanation += `**${concept.term.toUpperCase()}:** ${concept.explanation}\n\n`;
    });
    
    explanation += "*Think of trading like buying and selling toys - you want to buy when they're cheap and sell when they're expensive!*";
    
    return {
      hasExplanation: true,
      message: explanation,
      conceptCount: concepts.length
    };
  }
  
  function generateAnalogy(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('chart') || lowerMessage.includes('technical')) {
      return "📊 **Charts are like a thermometer for ETH** - they show if the 'temperature' (price) is hot (high) or cold (low), and if it's getting hotter or colder!";
    }
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('stop loss')) {
      return "🛡️ **Risk management is like wearing a seatbelt** - it protects you when things go wrong. A stop-loss is like an emergency brake that automatically stops your losses!";
    }
    
    if (lowerMessage.includes('strategy') || lowerMessage.includes('plan')) {
      return "🎯 **Trading strategy is like a recipe** - you follow specific steps to cook up profits. Without a recipe, you might burn your dinner (lose money)!";
    }
    
    if (lowerMessage.includes('market') || lowerMessage.includes('trend')) {
      return "🌊 **The market is like the ocean** - it has waves (price movements) that go up and down. Trends are like the tide - the overall direction the waves are moving!";
    }
    
    return null;
  }
  
  const detectedConcepts = detectComplexConcepts(userMessage);
  const simpleExplanation = generateSimpleExplanation(detectedConcepts);
  const analogy = generateAnalogy(userMessage);
  
  return {
    kons: "ExplainLikeFive",
    timestamp: currentTime,
    detected_concepts: detectedConcepts,
    simple_explanation: simpleExplanation,
    helpful_analogy: analogy,
    learning_support: {
      complexity_level: detectedConcepts.length > 0 ? 'SIMPLIFIED' : 'NORMAL',
      educational_mode: true,
      encouragement: "Learning trading step by step is smart! Every expert started as a beginner. 🌟"
    },
    next_steps: {
      suggestion: detectedConcepts.length > 0 ? 
        "Try asking specific questions about these concepts to learn more!" :
        "Feel free to ask about any trading term you don't understand",
      confidence_boost: "You're building your trading knowledge perfectly!"
    }
  };
}