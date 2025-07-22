// 🌱 Question Seeder - Smart AI Question Generation System
// Generates contextual questions to guide user interactions

interface QuestionSet {
  category: string;
  questions: string[];
  context: string;
  priority: number;
}

interface GeneratedQuestion {
  question: string;
  category: string;
  context: string;
  relevance: number;
}

const questionSets: QuestionSet[] = [
  {
    category: "Trading Strategy",
    questions: [
      "What's your preferred trading timeframe?",
      "How much risk are you comfortable with?",
      "Do you prefer automated or manual trading?",
      "What's your target profit percentage?",
      "Have you used trading bots before?"
    ],
    context: "User showing interest in trading or bots",
    priority: 9
  },
  {
    category: "Spiritual Trading",
    questions: [
      "Are you interested in spiritual trading guidance?",
      "Do you want dream-based market predictions?",
      "Would you like to activate divine trading protection?",
      "Should we include energy readings in your analysis?",
      "Do you practice meditation or mindfulness?"
    ],
    context: "User mentioning spiritual, divine, or mystical concepts",
    priority: 8
  },
  {
    category: "Technical Setup",
    questions: [
      "Do you need help setting up your wallet?",
      "Would you like to configure API connections?",
      "Should we enable voice control features?",
      "Do you want real-time price alerts?",
      "Would you like to customize your dashboard?"
    ],
    context: "User asking about configuration or setup",
    priority: 7
  },
  {
    category: "Learning & Education",
    questions: [
      "Are you new to cryptocurrency trading?",
      "Would you like to start with a trading course?",
      "Do you want to understand market analysis?",
      "Should we explain the different trading strategies?",
      "Would you like hands-on practice with demo trading?"
    ],
    context: "User expressing learning interest or asking basic questions",
    priority: 8
  },
  {
    category: "Advanced Features",
    questions: [
      "Do you want to try quantum trading algorithms?",
      "Are you interested in neural network strategies?",
      "Would you like to access the strategy autogen lab?",
      "Should we enable advanced risk management?",
      "Do you want multi-dimensional market analysis?"
    ],
    context: "User showing advanced knowledge or asking about sophisticated features",
    priority: 6
  },
  {
    category: "System Navigation",
    questions: [
      "Would you like a tour of the main features?",
      "Should I help you find a specific tool?",
      "Do you want to see your trading history?",
      "Would you like to check your portfolio balance?",
      "Should we review your current bot settings?"
    ],
    context: "User seems lost or asking for general help",
    priority: 9
  }
];

export function generateQuestions(userText: string, context: string = ""): GeneratedQuestion[] {
  const query = userText.toLowerCase();
  const contextQuery = context.toLowerCase();
  const questions: GeneratedQuestion[] = [];

  questionSets.forEach(set => {
    let relevance = 0;

    // Check if user text matches category context
    const contextWords = set.context.toLowerCase().split(/\s+/);
    contextWords.forEach(word => {
      if (query.includes(word) || contextQuery.includes(word)) {
        relevance += 2;
      }
    });

    // Specific keyword matching
    const categoryKeywords: { [key: string]: string[] } = {
      "Trading Strategy": ["trade", "bot", "strategy", "profit", "money", "eth", "buy", "sell"],
      "Spiritual Trading": ["spiritual", "divine", "dream", "energy", "mystical", "oracle", "vision"],
      "Technical Setup": ["setup", "configure", "install", "connect", "api", "wallet", "settings"],
      "Learning & Education": ["learn", "teach", "how", "tutorial", "course", "guide", "help", "new"],
      "Advanced Features": ["advanced", "quantum", "neural", "professional", "sophisticated", "complex"],
      "System Navigation": ["where", "how to", "find", "navigate", "lost", "confused", "show me"]
    };

    const keywords = categoryKeywords[set.category] || [];
    keywords.forEach(keyword => {
      if (query.includes(keyword)) {
        relevance += 1;
      }
    });

    // Add questions if relevant
    if (relevance > 0) {
      set.questions.forEach(question => {
        questions.push({
          question,
          category: set.category,
          context: set.context,
          relevance: relevance + set.priority
        });
      });
    }
  });

  // Sort by relevance and return top questions
  return questions
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5); // Return top 5 most relevant questions
}

export function getQuestionsByCategory(category: string): string[] {
  const set = questionSets.find(s => s.category === category);
  return set ? set.questions : [];
}

export function getAllCategories(): string[] {
  return questionSets.map(set => set.category);
}

export function getRandomQuestion(category?: string): string | null {
  let availableSets = questionSets;
  
  if (category) {
    availableSets = questionSets.filter(set => set.category === category);
  }

  if (availableSets.length === 0) return null;

  const randomSet = availableSets[Math.floor(Math.random() * availableSets.length)];
  const randomQuestion = randomSet.questions[Math.floor(Math.random() * randomSet.questions.length)];
  
  return randomQuestion;
}

export function suggestFollowUpQuestions(userResponse: string): string[] {
  const response = userResponse.toLowerCase();
  const followUps: string[] = [];

  // Based on user response, suggest relevant follow-ups
  if (response.includes("yes") || response.includes("interested")) {
    followUps.push("Would you like me to set that up for you?");
    followUps.push("Should we start with basic settings or advanced configuration?");
  }

  if (response.includes("no") || response.includes("not")) {
    followUps.push("Is there something else you'd prefer to focus on?");
    followUps.push("Would you like to explore different options?");
  }

  if (response.includes("help") || response.includes("confused")) {
    followUps.push("Would you like a step-by-step guide?");
    followUps.push("Should I explain this in simpler terms?");
  }

  return followUps;
}

export default {
  generateQuestions,
  getQuestionsByCategory,
  getAllCategories,
  getRandomQuestion,
  suggestFollowUpQuestions
};