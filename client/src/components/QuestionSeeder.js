// QuestionSeeder.js - Generates learning questions for knowledge expansion

export function generateQuestions(count = 5) {
  const questionTemplates = [
    // ETH Trading Questions
    "What is the best ETH trading strategy for beginners?",
    "How do I set stop losses for ETH trades?",
    "When is the optimal time to buy ETH?",
    "What are the key ETH price indicators?",
    "How does ETH volatility affect trading decisions?",
    "What is the relationship between BTC and ETH prices?",
    "How do I calculate ETH position sizes?",
    "What are the most reliable ETH technical indicators?",
    "How do news events impact ETH price movements?",
    "What is the best ETH trading timeframe?",
    
    // Spiritual Trading Questions
    "How do I align my trading with spiritual principles?",
    "What is the role of intuition in trading?",
    "How do I overcome fear and greed in trading?",
    "What are the karmic implications of trading?",
    "How do I maintain emotional balance while trading?",
    "What is the spiritual meaning of market cycles?",
    "How do I trade with conscious awareness?",
    "What is the connection between meditation and trading?",
    "How do I find purpose in trading beyond profit?",
    "What are the ethical considerations in trading?",
    
    // KonsLang and Symbolic Questions
    "What does the sacred symbol NA'VEL mean?",
    "How do I interpret KonsLang messages?",
    "What is the significance of ZUNTH in trading?",
    "How do sacred symbols influence market movements?",
    "What is the meaning of AL'MIR in spiritual trading?",
    "How do I activate TALOR energy in trades?",
    "What does SHAI represent in the cosmic order?",
    "How do I connect with KORVEX wisdom?",
    "What is the power of THALAR in market analysis?",
    "How does ZEPHYR guide trading decisions?",
    
    // WaidBot Configuration Questions
    "How do I configure WaidBot for maximum profits?",
    "What are the best WaidBot settings for beginners?",
    "How do I customize WaidBot risk parameters?",
    "What trading strategies does WaidBot support?",
    "How do I monitor WaidBot performance?",
    "What is the difference between WaidBot and WaidBot Pro?",
    "How do I set up automated ETH trading?",
    "What safety features does WaidBot have?",
    "How do I optimize WaidBot for current market conditions?",
    "What are the WaidBot emergency stop procedures?",
    
    // Advanced Trading Concepts
    "What is quantum trading theory?",
    "How do I use the Divine Quantum Flux strategy?",
    "What is the Sacred Positioning Engine?",
    "How does the Reincarnation Loop work?",
    "What is the Neural Quantum Singularity approach?",
    "How do I access the Shadow Override Defense?",
    "What is the Emotional Firewall system?",
    "How does the DNA Healer strategy function?",
    "What is Situational Intelligence in trading?",
    "How do I activate the Hidden Vision Core?",
    
    // Market Analysis Questions
    "How do I read ETH candlestick patterns?",
    "What are the key support and resistance levels for ETH?",
    "How do I analyze ETH volume patterns?",
    "What market indicators predict ETH price reversals?",
    "How do I identify ETH trend continuations?",
    "What are the signs of ETH market manipulation?",
    "How do I spot ETH breakout opportunities?",
    "What role does market sentiment play in ETH trading?",
    "How do I use moving averages for ETH analysis?",
    "What are the best ETH chart timeframes for analysis?",
    
    // Risk Management Questions
    "How much capital should I risk per ETH trade?",
    "What is the optimal portfolio allocation for ETH?",
    "How do I calculate risk-reward ratios?",
    "What are the signs to exit losing trades?",
    "How do I manage emotions during drawdowns?",
    "What is proper position sizing for ETH trades?",
    "How do I diversify my cryptocurrency portfolio?",
    "What are the psychological aspects of risk management?",
    "How do I set realistic profit targets?",
    "What is the importance of trading journals?",
    
    // Platform and Tools Questions
    "How do I navigate the Waides KI interface?",
    "What features are available in the Charts section?",
    "How do I access Live Data in real-time?",
    "What is the Admin Control Center used for?",
    "How do I use the API Documentation?",
    "What is the Gateway management system?",
    "How do I monitor trading performance?",
    "What are the voice command capabilities?",
    "How do I customize my trading dashboard?",
    "What security features protect my trading data?"
  ];
  
  // Randomly select questions
  const selectedQuestions = [];
  const usedIndices = new Set();
  
  while (selectedQuestions.length < count && selectedQuestions.length < questionTemplates.length) {
    const randomIndex = Math.floor(Math.random() * questionTemplates.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      selectedQuestions.push(questionTemplates[randomIndex]);
    }
  }
  
  return selectedQuestions;
}

// Generate questions by category
export function generateQuestionsByCategory(category, count = 3) {
  const categories = {
    trading: [
      "What is the best ETH trading strategy for beginners?",
      "How do I set stop losses for ETH trades?",
      "When is the optimal time to buy ETH?",
      "What are the key ETH price indicators?",
      "How does ETH volatility affect trading decisions?"
    ],
    spiritual: [
      "How do I align my trading with spiritual principles?",
      "What is the role of intuition in trading?",
      "How do I overcome fear and greed in trading?",
      "What are the karmic implications of trading?",
      "How do I maintain emotional balance while trading?"
    ],
    konslang: [
      "What does the sacred symbol NA'VEL mean?",
      "How do I interpret KonsLang messages?",
      "What is the significance of ZUNTH in trading?",
      "How do sacred symbols influence market movements?",
      "What is the meaning of AL'MIR in spiritual trading?"
    ],
    bots: [
      "How do I configure WaidBot for maximum profits?",
      "What are the best WaidBot settings for beginners?",
      "How do I customize WaidBot risk parameters?",
      "What trading strategies does WaidBot support?",
      "How do I monitor WaidBot performance?"
    ],
    analysis: [
      "How do I read ETH candlestick patterns?",
      "What are the key support and resistance levels for ETH?",
      "How do I analyze ETH volume patterns?",
      "What market indicators predict ETH price reversals?",
      "How do I identify ETH trend continuations?"
    ]
  };
  
  const categoryQuestions = categories[category] || categories.trading;
  return categoryQuestions.slice(0, count);
}

// Generate personalized questions based on user behavior
export function generatePersonalizedQuestions(userBehavior, count = 3) {
  const personalizedTemplates = {
    frequent_trader: [
      "How can I optimize my high-frequency ETH trading strategy?",
      "What are the best scalping techniques for ETH?",
      "How do I manage emotions during rapid trading?"
    ],
    beginner: [
      "What are the basics of ETH trading?",
      "How do I start trading with small amounts?",
      "What are the most important things to learn first?"
    ],
    spiritual_seeker: [
      "How do I integrate meditation into my trading routine?",
      "What is the spiritual significance of market patterns?",
      "How do I trade with conscious awareness?"
    ],
    technical_analyst: [
      "What are the most advanced ETH technical indicators?",
      "How do I combine multiple analysis methods?",
      "What are the latest developments in crypto analysis?"
    ]
  };
  
  const behaviorType = userBehavior || 'beginner';
  const questions = personalizedTemplates[behaviorType] || personalizedTemplates.beginner;
  return questions.slice(0, count);
}