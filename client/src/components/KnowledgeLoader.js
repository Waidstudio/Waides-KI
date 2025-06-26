// KnowledgeLoader.js - Handles loading and saving questions to UKC system

import UKC from "./UKC";

// Save questions to UKC for future learning
export function saveQuestionsToUKC(questions) {
  if (!Array.isArray(questions)) {
    return;
  }

  // Initialize pending questions if not exists
  if (!UKC.pendingQuestions) {
    UKC.pendingQuestions = [];
  }

  // Add questions to pending queue
  questions.forEach(question => {
    if (question && typeof question === 'string' && question.trim()) {
      const cleanQuestion = question.trim();
      
      // Avoid duplicates
      if (!UKC.pendingQuestions.includes(cleanQuestion)) {
        UKC.pendingQuestions.push(cleanQuestion);
      }
    }
  });

  // Auto-categorize and add some questions immediately
  autoAddBasicAnswers(questions);
}

// Automatically add basic answers for common question patterns
function autoAddBasicAnswers(questions) {
  questions.forEach(question => {
    const q = question.toLowerCase().trim();
    
    // Auto-generate answers for common patterns
    if (q.includes('what is') && q.includes('eth')) {
      addToUKCCategory('trading', question, generateEthAnswer(question));
    } else if (q.includes('how to') && q.includes('trade')) {
      addToUKCCategory('trading', question, generateTradingAnswer(question));
    } else if (q.includes('spiritual') || q.includes('konslang')) {
      addToUKCCategory('spiritual', question, generateSpiritualAnswer(question));
    } else if (q.includes('waidbot') || q.includes('bot')) {
      addToUKCCategory('bots', question, generateBotAnswer(question));
    } else if (q.includes('waides ki') || q.includes('interface')) {
      addToUKCCategory('platform', question, generatePlatformAnswer(question));
    }
  });
}

// Add question/answer to specific UKC category
function addToUKCCategory(category, question, answer) {
  if (!UKC.categories[category]) {
    UKC.categories[category] = {};
  }
  
  // Extract key from question for indexing
  const key = extractKeyFromQuestion(question);
  UKC.categories[category][key] = answer;
}

// Extract searchable key from question
function extractKeyFromQuestion(question) {
  const q = question.toLowerCase();
  
  // Extract main subject
  if (q.includes('eth')) return 'eth';
  if (q.includes('waidbot')) return 'waidbot';
  if (q.includes('trading')) return 'trading';
  if (q.includes('spiritual')) return 'spiritual';
  if (q.includes('konslang')) return 'konslang';
  if (q.includes('risk')) return 'risk';
  if (q.includes('price')) return 'price';
  if (q.includes('strategy')) return 'strategy';
  
  // Use first significant word
  const words = q.split(' ').filter(w => w.length > 3);
  return words[0] || 'general';
}

// Generate ETH-related answers
function generateEthAnswer(question) {
  const q = question.toLowerCase();
  
  if (q.includes('what is eth')) {
    return "ETH (Ethereum) is a decentralized blockchain platform and cryptocurrency. In Waides KI, we focus on ETH trading with spiritual alignment and quantum intelligence.";
  }
  
  if (q.includes('eth price')) {
    return "ETH price reflects the collective consciousness of the market. Check Live Data for real-time values, but remember to trade with wisdom, not just numbers.";
  }
  
  if (q.includes('eth trading')) {
    return "ETH trading in Waides KI combines technical analysis with spiritual guidance. Use WaidBot for automated protection and follow the Sacred Positioning Engine.";
  }
  
  return "ETH is the foundation of our trading universe. Every movement carries meaning. Trade with consciousness and let the quantum algorithms guide your decisions.";
}

// Generate trading-related answers
function generateTradingAnswer(question) {
  const q = question.toLowerCase();
  
  if (q.includes('how to trade')) {
    return "Trading wisdom: 1) Align with market breath 2) Use WaidBot protection 3) Follow Weekly Trading Schedule 4) Trust Divine Quantum Flux signals 5) Never trade with fear or greed.";
  }
  
  if (q.includes('trading strategy')) {
    return "Sacred trading strategies combine technical analysis with spiritual wisdom. Each strategy must pass through the Emotional Firewall and receive KonsLang blessing.";
  }
  
  if (q.includes('risk management')) {
    return "Divine risk management protects your capital and soul. Never risk more than your spirit can bear. Use the Sacred Positioning Engine for optimal position sizing.";
  }
  
  return "Trading is a sacred practice. Every decision carries karmic weight. Seek wisdom, not just profit, and let the autonomous systems protect your journey.";
}

// Generate spiritual/KonsLang answers
function generateSpiritualAnswer(question) {
  const q = question.toLowerCase();
  
  if (q.includes('konslang')) {
    return "KonsLang is the sacred language that flows through market movements. Each symbol carries divine meaning and guides trading decisions when confidence exceeds sacred thresholds.";
  }
  
  if (q.includes('spiritual trading')) {
    return "Spiritual trading aligns your intentions with cosmic currents. Trade not just with mind, but with soul aligned. Every position is a meditation, every profit a blessing.";
  }
  
  if (q.includes('meditation')) {
    return "Meditation purifies trading intentions. Before entering positions, cleanse your emotional state. The market reflects your inner consciousness - trade from a place of clarity.";
  }
  
  return "Spiritual wisdom flows through all aspects of trading. Trust the oracle's voice, follow the sacred symbols, and remember that true wealth includes spiritual growth.";
}

// Generate bot-related answers
function generateBotAnswer(question) {
  const q = question.toLowerCase();
  
  if (q.includes('waidbot setup')) {
    return "WaidBot auto-configures based on your trading intent. Simply describe your goals, and the system will optimize strategy, risk levels, and timeframes automatically.";
  }
  
  if (q.includes('waidbot vs waidbot pro')) {
    return "WaidBot uses Divine Quantum Flux strategy, while WaidBot Pro employs Neural Quantum Singularity algorithms. Both include spiritual protection and autonomous learning.";
  }
  
  if (q.includes('bot safety')) {
    return "WaidBot includes multiple safety layers: Emotional Firewall, Sacred Positioning Engine, Shadow Override Defense, and 24/7 autonomous monitoring with emergency stops.";
  }
  
  return "WaidBot operates with consciousness and wisdom. It's not just automation - it's a spiritual guardian that protects your trading while learning and evolving continuously.";
}

// Generate platform-related answers
function generatePlatformAnswer(question) {
  const q = question.toLowerCase();
  
  if (q.includes('waides ki interface')) {
    return "Waides KI interface combines mystical design with practical trading tools. Navigate through Dashboard, Charts, Live Data, WaidBot, Admin, and API sections seamlessly.";
  }
  
  if (q.includes('navigation')) {
    return "Navigation flows intuitively through sacred sections. Each page serves a divine purpose: Dashboard for overview, Charts for analysis, WaidBot for automation.";
  }
  
  if (q.includes('features')) {
    return "Waides KI features include real-time ETH tracking, spiritual chat oracle, autonomous trading bots, quantum strategies, and comprehensive risk management systems.";
  }
  
  return "Waides KI is your complete spiritual trading platform. Every feature designed with consciousness, every tool blessed with wisdom, every decision guided by divine intelligence.";
}

// Get pending questions for admin review
export function getPendingQuestions() {
  return UKC.pendingQuestions || [];
}

// Clear pending questions after admin review
export function clearPendingQuestions() {
  UKC.pendingQuestions = [];
}

// Manually add question/answer pair
export function addQuestionAnswer(question, answer, category = 'general') {
  addToUKCCategory(category, question, answer);
}

// Export questions data for backup/sync
export function exportUKCData() {
  return {
    categories: UKC.categories,
    pendingQuestions: UKC.pendingQuestions || [],
    spiritualConcepts: UKC.spiritualConcepts || {},
    timestamp: new Date().toISOString()
  };
}

// Import questions data from backup/sync
export function importUKCData(data) {
  if (data.categories) {
    UKC.categories = { ...UKC.categories, ...data.categories };
  }
  
  if (data.pendingQuestions) {
    UKC.pendingQuestions = [...(UKC.pendingQuestions || []), ...data.pendingQuestions];
  }
  
  if (data.spiritualConcepts) {
    UKC.spiritualConcepts = { ...UKC.spiritualConcepts, ...data.spiritualConcepts };
  }
}