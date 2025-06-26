// 🔁 Knowledge Loader - Dynamic Knowledge Injection System
// Allows runtime addition of new knowledge to UKC
// Enhanced with Divine Expansion Phase: Autonomous Question Generation

import UKC from "./UKC";
import { generateQuestions, generateTargetedQuestions, generateDailyQuestionBatch } from "./QuestionSeeder";

// Add new knowledge in runtime
export function teachNewFact(category, question, answer) {
  if (!UKC.categories[category]) {
    UKC.categories[category] = {};
  }

  UKC.categories[category][question.toLowerCase()] = answer;
  
  // Store in localStorage for persistence
  try {
    localStorage.setItem('ukc_knowledge', JSON.stringify(UKC.categories));
  } catch (error) {
    console.log('Could not save to localStorage:', error);
  }
}

// Load saved knowledge from localStorage
export function loadStoredKnowledge() {
  try {
    const stored = localStorage.getItem('ukc_knowledge');
    if (stored) {
      const knowledge = JSON.parse(stored);
      // Merge with existing UKC categories
      Object.keys(knowledge).forEach(category => {
        if (!UKC.categories[category]) {
          UKC.categories[category] = {};
        }
        Object.assign(UKC.categories[category], knowledge[category]);
      });
    }
  } catch (error) {
    console.log('Could not load from localStorage:', error);
  }
}

// Auto-teach from conversation patterns
export function autoTeachFromConversation(question, answer) {
  const q = question.toLowerCase();
  
  // Categorize based on keywords
  let category = 'general';
  
  if (q.includes('eth') || q.includes('ethereum') || q.includes('crypto')) {
    category = 'ethereum';
  } else if (q.includes('trade') || q.includes('trading') || q.includes('price')) {
    category = 'trading';
  } else if (q.includes('ai') || q.includes('artificial intelligence') || q.includes('machine learning')) {
    category = 'ai';
  } else if (q.includes('life') || q.includes('purpose') || q.includes('meaning')) {
    category = 'life';
  } else if (q.includes('money') || q.includes('invest') || q.includes('financial')) {
    category = 'money';
  } else if (q.includes('health') || q.includes('exercise') || q.includes('nutrition')) {
    category = 'health';
  } else if (q.includes('relationship') || q.includes('love') || q.includes('friend')) {
    category = 'relationships';
  } else if (q.includes('kons') || q.includes('waides') || q.includes('spiritual')) {
    category = 'konsmia';
  }
  
  teachNewFact(category, q, answer);
}

// Get pending questions that need answers
let pendingQuestions = [];

export function addPendingQuestion(question) {
  if (!pendingQuestions.includes(question)) {
    pendingQuestions.push(question);
  }
}

export function getPendingQuestions() {
  return [...pendingQuestions];
}

export function clearPendingQuestions() {
  pendingQuestions = [];
}

// ✨ DIVINE EXPANSION PHASE: Autonomous Knowledge Generation

// Save generated questions to UKC with seed answers
export function saveQuestionsToUKC(questions) {
  try {
    let savedCount = 0;
    
    for (let q of questions) {
      const lower = q.toLowerCase();
      const topic = extractAdvancedCategory(lower);
      
      if (!UKC.categories[topic]) {
        UKC.categories[topic] = {};
      }
      
      // Only add if question doesn't already exist
      if (!UKC.categories[topic][lower]) {
        UKC.categories[topic][lower] = "🌱 This is a seed question. Divine answer coming soon...";
        savedCount++;
      }
    }
    
    // Save to localStorage
    try {
      localStorage.setItem('ukc_knowledge', JSON.stringify(UKC.categories));
    } catch (error) {
      console.log('Could not save expanded knowledge to localStorage:', error);
    }
    
    console.log(`🌌 Divine Expansion: Saved ${savedCount} new questions to UKC`);
    return savedCount;
  } catch (error) {
    console.error('Error saving questions to UKC:', error);
    return 0;
  }
}

// Enhanced category extraction for autonomous expansion
function extractAdvancedCategory(q) {
  const categoryKeywords = {
    'ethereum': ['ethereum', 'eth', 'smart contract', 'blockchain', 'defi', 'gas', 'wei', 'gwei'],
    'trading': ['trading', 'market', 'price', 'buy', 'sell', 'strategy', 'analysis', 'chart', 'signal'],
    'money': ['money', 'wealth', 'rich', 'finance', 'investment', 'profit', 'income', 'abundance'],
    'ai': ['ai', 'artificial', 'machine', 'neural', 'algorithm', 'bot', 'automation', 'intelligence'],
    'konsmia': ['konsmia', 'waides', 'kons', 'sacred', 'divine', 'spiritual', 'mystical'],
    'health': ['health', 'wellness', 'fitness', 'nutrition', 'exercise', 'mental', 'healing'],
    'relationships': ['relationship', 'love', 'family', 'friend', 'partner', 'marriage', 'connection'],
    'life': ['life', 'purpose', 'meaning', 'goal', 'happiness', 'success', 'growth', 'wisdom'],
    'emotions': ['emotion', 'feel', 'mood', 'anxiety', 'stress', 'joy', 'fear', 'anger'],
    'spirit': ['spirit', 'soul', 'consciousness', 'meditation', 'prayer', 'energy', 'aura'],
    'technology': ['technology', 'tech', 'innovation', 'digital', 'software', 'hardware'],
    'future': ['future', 'prediction', 'forecast', 'tomorrow', 'next', 'upcoming', 'evolution']
  };
  
  // Check each category for keyword matches
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => q.includes(keyword))) {
      return category;
    }
  }
  
  // Default fallback
  return 'general';
}

// Autonomous Knowledge Expansion Engine
export function expandKnowledgeAutonomously(userInput = null, expansionSize = 50) {
  try {
    let newQuestions;
    
    if (userInput) {
      // Generate targeted questions based on user input
      newQuestions = generateTargetedQuestions(userInput, expansionSize);
    } else {
      // Generate general questions with mixed focus
      newQuestions = generateQuestions(expansionSize, 'mixed');
    }
    
    const savedCount = saveQuestionsToUKC(newQuestions);
    
    // Update expansion statistics
    updateExpansionStats(savedCount);
    
    return {
      generated: newQuestions.length,
      saved: savedCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in autonomous knowledge expansion:', error);
    return { generated: 0, saved: 0, timestamp: new Date().toISOString() };
  }
}

// Daily Knowledge Seeding for continuous growth
export function performDailyKnowledgeSeeding() {
  try {
    const dailyBatch = generateDailyQuestionBatch();
    const savedCount = saveQuestionsToUKC(dailyBatch.questions);
    
    const expansionLog = {
      date: dailyBatch.date,
      focus: dailyBatch.focus,
      generated: dailyBatch.questions.length,
      saved: savedCount,
      metadata: dailyBatch.metadata
    };
    
    // Save expansion log
    const expansionHistory = JSON.parse(localStorage.getItem('waides_expansion_history') || '[]');
    expansionHistory.push(expansionLog);
    
    // Keep only last 30 days
    if (expansionHistory.length > 30) {
      expansionHistory.splice(0, expansionHistory.length - 30);
    }
    
    localStorage.setItem('waides_expansion_history', JSON.stringify(expansionHistory));
    
    console.log(`🌟 Daily Knowledge Seeding Complete: ${savedCount} questions added with focus on ${dailyBatch.focus}`);
    
    return expansionLog;
  } catch (error) {
    console.error('Error in daily knowledge seeding:', error);
    return null;
  }
}

// Update expansion statistics
function updateExpansionStats(newQuestions) {
  try {
    const stats = JSON.parse(localStorage.getItem('waides_expansion_stats') || '{}');
    
    const today = new Date().toISOString().split('T')[0];
    
    if (!stats[today]) {
      stats[today] = {
        totalExpansions: 0,
        questionsAdded: 0,
        firstExpansion: new Date().toISOString(),
        lastExpansion: new Date().toISOString()
      };
    }
    
    stats[today].totalExpansions += 1;
    stats[today].questionsAdded += newQuestions;
    stats[today].lastExpansion = new Date().toISOString();
    
    // Overall stats
    stats.lifetime = stats.lifetime || { totalQuestions: 0, totalExpansions: 0 };
    stats.lifetime.totalQuestions += newQuestions;
    stats.lifetime.totalExpansions += 1;
    
    localStorage.setItem('waides_expansion_stats', JSON.stringify(stats));
  } catch (error) {
    console.error('Error updating expansion stats:', error);
  }
}

// Get expansion statistics
export function getExpansionStats() {
  try {
    const stats = JSON.parse(localStorage.getItem('waides_expansion_stats') || '{}');
    const history = JSON.parse(localStorage.getItem('waides_expansion_history') || '[]');
    
    return {
      stats,
      history,
      totalKnowledgeItems: Object.values(UKC.categories).reduce((total, cat) => total + Object.keys(cat).length, 0)
    };
  } catch (error) {
    console.error('Error getting expansion stats:', error);
    return { stats: {}, history: [], totalKnowledgeItems: 0 };
  }
}

// Initialize knowledge loader and perform startup expansion
loadStoredKnowledge();

// Perform initial knowledge seeding on startup (only once per day)
const today = new Date().toISOString().split('T')[0];
const lastSeeding = localStorage.getItem('last_knowledge_seeding');

if (lastSeeding !== today) {
  // Delay seeding by 3 seconds to allow UI to load
  setTimeout(() => {
    performDailyKnowledgeSeeding();
    localStorage.setItem('last_knowledge_seeding', today);
  }, 3000);
}