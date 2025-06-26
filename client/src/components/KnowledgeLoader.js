// 🔁 Knowledge Loader - Dynamic Knowledge Injection System
// Allows runtime addition of new knowledge to UKC

import UKC from "./UKC";

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

// Initialize knowledge loader
loadStoredKnowledge();