// 📚 Page Knowledge - Smart Navigation and Intent Recognition System

interface PageInfo {
  description: string;
  keywords: string[];
  route: string;
}

type PageKnowledgeMap = { [pageName: string]: PageInfo };

const PageKnowledge: PageKnowledgeMap = {
  "Trading Academy": {
    description: "Learn how to trade ETH and master strategies through courses and guides.",
    keywords: ["learn", "academy", "study", "lessons", "education", "how to trade", "teach me", "tutorial", "course"],
    route: "trading-academy"
  },
  "Dream Vision": {
    description: "See ETH trends through symbolic dream interpretation and time-based patterns.",
    keywords: ["dream", "predict", "vision", "night", "intuition", "symbolic", "future", "prophecy"],
    route: "dream-vision"
  },
  "Vision Spirit": {
    description: "Understand the spiritual energy behind trades and decisions.",
    keywords: ["spirit", "energy", "soul", "alignment", "vibes", "spiritual", "divine", "sacred"],
    route: "vision-spirit"
  },
  "Spiritual Recall": {
    description: "Recall past trade energies, emotions, and Smai-based patterns.",
    keywords: ["past", "recall", "memory", "previous", "flashback", "history", "remember"],
    route: "spiritual-recall"
  },
  "Seasonal Rebirth": {
    description: "Reset and refresh your trading journey with spiritual rituals.",
    keywords: ["reset", "rebirth", "fresh", "new season", "renewal", "restart", "refresh"],
    route: "seasonal-rebirth"
  },
  "Sigil Layer": {
    description: "Access symbolic protection for your trades and ETH decisions.",
    keywords: ["sigil", "symbol", "protect", "shield", "protection", "rune", "glyph"],
    route: "sigil-layer"
  },
  "Shadow Defense": {
    description: "Defend against unseen trading risks and malicious bot activity.",
    keywords: ["defense", "shadow", "dark", "protection", "danger", "threat", "security", "defend"],
    route: "shadow-defense"
  },
  "Reincarnation Loop": {
    description: "Reactivate past strategies with new energy and divine tuning.",
    keywords: ["reincarnation", "return", "resurrect", "again", "old", "loop", "cycle", "rebirth"],
    route: "reincarnation"
  },
  "WaidBot Engine": {
    description: "Your personal ETH trading bot with autonomous decision-making capabilities.",
    keywords: ["waidbot", "bot", "trading bot", "automated", "trade", "eth bot", "engine"],
    route: "waidbot-engine"
  },
  "WaidBot Pro": {
    description: "Advanced professional trading system with quantum strategies and neural networks.",
    keywords: ["waidbot pro", "professional", "advanced", "quantum", "neural", "pro trading"],
    route: "waidbot-pro"
  },
  "Strategy Autogen": {
    description: "Autonomous strategy generation laboratory that creates and evolves trading algorithms.",
    keywords: ["strategy", "autogen", "generate", "algorithm", "lab", "create strategies"],
    route: "strategy-autogen"
  },
  "Voice Interface": {
    description: "Control Waides KI through voice commands and spoken interactions.",
    keywords: ["voice", "speak", "talk", "command", "verbal", "audio", "microphone"],
    route: "voice"
  },
  "Charts & Data": {
    description: "Real-time ETH charts, candlestick data, and market analysis.",
    keywords: ["chart", "data", "graph", "candlestick", "price", "market data", "analysis"],
    route: "charts"
  },
  "Live Data Feed": {
    description: "Monitor real-time ETH price updates and market movements.",
    keywords: ["live", "real-time", "feed", "monitor", "watch", "track", "updates"],
    route: "live-data"
  },
  "Admin Control": {
    description: "System administration, configuration, and advanced controls.",
    keywords: ["admin", "control", "configuration", "settings", "manage", "system"],
    route: "admin"
  },
  "API Gateway": {
    description: "Connect external systems and manage API integrations.",
    keywords: ["api", "gateway", "integration", "connect", "external", "webhook"],
    route: "gateway"
  },
  "Waides Core": {
    description: "Central hub accessing all Waides KI systems and capabilities.",
    keywords: ["core", "central", "hub", "main", "waides", "everything"],
    route: "/"
  }
};

export function findPageByIntent(userText: string): { page: string; confidence: number } | null {
  const query = userText.toLowerCase();
  let bestMatch: { page: string; confidence: number } | null = null;
  let maxScore = 0;

  Object.entries(PageKnowledge).forEach(([pageName, pageInfo]) => {
    let score = 0;
    
    // Direct page name match
    if (query.includes(pageName.toLowerCase())) {
      score += 10;
    }
    
    // Keyword matches
    pageInfo.keywords.forEach(keyword => {
      if (query.includes(keyword)) {
        score += 2;
      }
    });
    
    // Partial keyword matches
    pageInfo.keywords.forEach(keyword => {
      if (keyword.length > 3) {
        const words = query.split(' ');
        words.forEach(word => {
          if (word.length > 2 && keyword.includes(word)) {
            score += 1;
          }
        });
      }
    });

    if (score > maxScore) {
      maxScore = score;
      bestMatch = {
        page: pageName,
        confidence: Math.min(score * 10, 100) // Convert to percentage
      };
    }
  });

  // Only return matches with reasonable confidence
  return bestMatch && bestMatch.confidence >= 20 ? bestMatch : null;

  return null;
}

export function getPageInfo(pageName: string): PageInfo | null {
  return PageKnowledge[pageName] || null;
}

export function getAllPages(): string[] {
  return Object.keys(PageKnowledge);
}

export function searchPages(query: string): Array<{ page: string; info: PageInfo; relevance: number }> {
  const q = query.toLowerCase();
  const results: Array<{ page: string; info: PageInfo; relevance: number }> = [];

  Object.entries(PageKnowledge).forEach(([pageName, pageInfo]) => {
    let relevance = 0;

    // Name match
    if (pageName.toLowerCase().includes(q)) {
      relevance += 5;
    }

    // Description match
    if (pageInfo.description.toLowerCase().includes(q)) {
      relevance += 3;
    }

    // Keyword match
    pageInfo.keywords.forEach(keyword => {
      if (keyword.includes(q) || q.includes(keyword)) {
        relevance += 2;
      }
    });

    if (relevance > 0) {
      results.push({ page: pageName, info: pageInfo, relevance });
    }
  });

  return results.sort((a, b) => b.relevance - a.relevance);
}

export function getRouteForPage(pageName: string): string | null {
  const pageInfo = PageKnowledge[pageName];
  return pageInfo ? `/${pageInfo.route}` : null;
}

export default {
  findPageByIntent,
  getPageInfo,
  getAllPages,
  searchPages,
  getRouteForPage,
  PageKnowledge
};