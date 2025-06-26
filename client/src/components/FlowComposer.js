// 🧩 Flow Composer - Multi-Page Strategy Path System
// Combines multiple pages into flow recommendations based on user intent

const flows = [
  {
    name: "Dream Rebirth Defense",
    when: ["dream", "predict", "reset", "protect", "vision", "spiritual", "future", "prophecy"],
    steps: ["Dream Vision", "Seasonal Rebirth", "Shadow Defense"],
    description: "Complete spiritual trading journey from vision to protection"
  },
  {
    name: "ETH Wealth Setup",
    when: ["wealth", "grow", "academy", "bot", "trading", "learn", "education", "profit"],
    steps: ["Trading Academy", "WaidBot Engine", "Charts & Data"],
    description: "Full trading education and automation setup"
  },
  {
    name: "Smai Recall Cycle",
    when: ["memory", "past", "rebirth", "spirit", "recall", "history", "remember"],
    steps: ["Spiritual Recall", "Reincarnation Loop", "Vision Spirit"],
    description: "Deep spiritual memory and energy work cycle"
  },
  {
    name: "Advanced Trading Intelligence",
    when: ["advanced", "professional", "quantum", "strategy", "pro", "neural", "sophisticated"],
    steps: ["WaidBot Pro", "Strategy Autogen", "Trading Brain"],
    description: "Professional-grade trading systems and AI strategy generation"
  },
  {
    name: "Voice Command Setup",
    when: ["voice", "speak", "talk", "command", "audio", "microphone", "hands-free"],
    steps: ["Voice Interface", "Admin Control", "API Gateway"],
    description: "Complete voice control and system administration"
  },
  {
    name: "Mystical Trading Oracle",
    when: ["oracle", "mystical", "sacred", "sigil", "symbol", "divine", "spiritual guidance"],
    steps: ["Vision Spirit", "Sigil Layer", "Dream Vision"],
    description: "Sacred symbol-based trading guidance system"
  },
  {
    name: "Market Analysis Flow",
    when: ["analysis", "market", "data", "chart", "price", "trend", "technical"],
    steps: ["Live Data Feed", "Charts & Data", "Trading Brain"],
    description: "Comprehensive market data and analysis workflow"
  },
  {
    name: "Complete System Mastery",
    when: ["everything", "all", "complete", "master", "full", "entire", "comprehensive"],
    steps: ["Waides Core", "WaidBot Pro", "Strategy Autogen", "Trading Brain"],
    description: "Master all systems for complete trading intelligence"
  }
];

export function getFlowRecommendation(userText) {
  const q = userText.toLowerCase();

  // Find the best matching flow based on keyword matches
  let bestMatch = null;
  let maxMatches = 0;

  for (let flow of flows) {
    const matches = flow.when.filter(keyword => q.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = flow;
    }
  }

  // Return flow only if we have at least one keyword match
  if (maxMatches > 0) {
    return bestMatch;
  }

  return null;
}

export function generateFlowMessage(flow) {
  if (!flow) return null;

  return `🔁 **Flow Recommendation: ${flow.name}**\n\n` +
    `${flow.description}\n\n` +
    flow.steps.map((step, i) => `➡️ **Step ${i + 1}:** ${step}`).join("\n") +
    `\n\n💡 Click any step below to begin your journey.`;
}

export function getFlowStepRoute(stepName) {
  // Map step names to their corresponding routes
  const routeMap = {
    "Dream Vision": "/dream-vision",
    "Seasonal Rebirth": "/seasonal-rebirth", 
    "Shadow Defense": "/shadow-defense",
    "Trading Academy": "/trading-academy",
    "WaidBot Engine": "/waidbot",
    "Charts & Data": "/charts",
    "Spiritual Recall": "/spiritual-recall",
    "Reincarnation Loop": "/reincarnation",
    "Vision Spirit": "/vision-spirit",
    "WaidBot Pro": "/waidbot-pro",
    "Strategy Autogen": "/strategy-autogen",
    "Trading Brain": "/trading-brain",
    "Voice Interface": "/voice",
    "Admin Control": "/admin",
    "API Gateway": "/gateway",
    "Sigil Layer": "/sigil-layer",
    "Live Data Feed": "/live-data",
    "Waides Core": "/waides-core"
  };

  return routeMap[stepName] || `/${stepName.toLowerCase().replace(/ /g, "-")}`;
}

export default {
  flows,
  getFlowRecommendation,
  generateFlowMessage,
  getFlowStepRoute
};