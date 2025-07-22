import BotMemory from "./BotMemory";
import getVisionProphecy, { getTimeEnergyReading, detectEmotion } from './VisionFlowEngine';
import UKC from './UniversalKnowledgeCore';
import { saveQuestionsToUKC, getPendingQuestions, addQuestionAnswer } from './KnowledgeLoader';
import PageKnowledge from './PageKnowledge';
import BehaviorTracker from './BehaviorTracker';
import { getFlowRecommendation, generateFlowMessage, getFlowStepRoute } from './FlowComposer';
import { autoConfigureBot, generateBotSetupMessage, getBotRecommendations } from './WaidBotAutoSetup';
import { resolveQuestion } from './RealTimeResolver';

// Dynamic memory for auto-learning - lives in runtime memory only
let dynamicMemory = {};

// Command Router Module - detects when user wants to open tools
export function detectCommandTrigger(q, setBotState) {
  // Check for wallet navigation commands first (priority)
  if (q.includes("take me to") && q.includes("wallet") || 
      q.includes("open wallet") || 
      q.includes("smaiwallet") || 
      q.includes("go to wallet") || 
      q.includes("show wallet") ||
      q.includes("wallet page")) {
    setBotState({ action: "wallet" });
    return "🔐 Opening your SmaiWallet...";
  }

  // First check if this is a question about trading (not a command)
  const questionWords = ["what", "how", "why", "when", "where", "can", "should", "will", "would", "is", "are", "do", "does", "tell me", "explain", "help me"];
  const isQuestion = questionWords.some(word => q.toLowerCase().includes(word));
  
  // If it's a question, don't trigger any commands
  if (isQuestion) {
    return null;
  }

  // Very specific commands only - user must explicitly request activation
  if (q.includes("activate waidbot") || q.includes("launch waidbot") || q.includes("summon waidbot") || q.includes("start waidbot") || q.includes("open waidbot")) {
    setBotState({ action: "trade" });
    return "🤖 Activating WaidBot now...";
  }

  if (q.includes("check eth price") || q.includes("eth live")) {
    setBotState({ action: "price" });
    return "📡 Connecting to ETH Live Tracker...";
  }

  return null;
}

// Page Recommendation Module - detects when user needs a specific page/module
export function detectPageRecommendation(q, setBotState) {
  const qLower = q.toLowerCase();

  for (const page in PageKnowledge) {
    const { keywords, description, route } = PageKnowledge[page];

    if (keywords.some(word => qLower.includes(word))) {
      setBotState({ action: "open-page", page, route, description });

      return `📘 Recommendation: **${page}** — ${description}  
👉 Click below to open this module.`;
    }
  }

  return null;
}

// Live ETH Data Reader Module
function getCurrentETHPrice() {
  // Get live ETH price from localStorage or default
  return localStorage.getItem("ethPrice") || "2438.37";
}

// 🌌 Universal Knowledge Core (UKC) Checker
function checkUKC(q) {
  const all = UKC.categories;
  for (const category in all) {
    const topic = all[category];
    for (const question in topic) {
      if (q.includes(question)) {
        return topic[question];
      }
    }
  }
  return null;
}

// Wallet Integration Module - Waides KI knows your wallet balance
function getWalletInsights(q, walletContext) {
  if (!walletContext) return null;
  
  const { 
    smaiBalance, 
    localBalance, 
    lockedForTrade, 
    karmaScore, 
    tradeEnergy, 
    moralIndicator, 
    divineApproval, 
    isTradeAllowed 
  } = walletContext;

  // Wallet balance queries
  if (q.includes('balance') || q.includes('money') || q.includes('wallet') || q.includes('smai')) {
    return `🔐 **SmaiSika Wallet Status:**
- Available: ꠄ${smaiBalance?.toLocaleString() || 0} SMAI
- Locked for Trading: ꠄ${lockedForTrade?.toLocaleString() || 0}
- Local Currency: ₦${localBalance?.toLocaleString() || 0}

💫 **Konsmic Intelligence:**
- Karma Score: ${karmaScore}/200 (${moralIndicator})
- Trade Energy: ${tradeEnergy}/100
- Divine Approval: ${divineApproval ? 'Granted ✨' : 'Pending 🙏'}
- Trading Status: ${isTradeAllowed() ? 'Enabled 🟢' : 'Restricted 🔴'}`;
  }

  // Trading readiness check
  if (q.includes('can i trade') || q.includes('ready to trade') || q.includes('trading status')) {
    if (isTradeAllowed()) {
      return `✅ **Trading is ENABLED!** Your karma score of ${karmaScore}/200 and trade energy of ${tradeEnergy}/100 allow trading. Divine approval: ${divineApproval ? 'Granted' : 'Pending'}.`;
    } else {
      const reasons = [];
      if (karmaScore < 30) reasons.push('Low karma score');
      if (tradeEnergy < 10) reasons.push('Insufficient trade energy');
      if (moralIndicator === 'blocked') reasons.push('Moral alignment blocked');
      if (!divineApproval) reasons.push('Awaiting divine approval');
      
      return `🚫 **Trading is RESTRICTED** due to: ${reasons.join(', ')}. Focus on building karma and trade energy first.`;
    }
  }

  // Karma and energy guidance
  if (q.includes('karma') || q.includes('improve') || q.includes('energy')) {
    return `🌟 **Konsmic Intelligence Guidance:**
- Your karma score is ${karmaScore}/200 (${moralIndicator} alignment)
- Trade energy: ${tradeEnergy}/100
- To improve: Make profitable trades, avoid revenge trading, practice patience
- High karma unlocks better trading opportunities and divine protection`;
  }

  return null;
}

// ✨ Very simple smart match function with Enhancement Plugins
export default function getSmartAnswer(userInput, setBotState, walletContext = null) {
  const q = userInput.toLowerCase().trim();

  // 💎 WALLET INTELLIGENCE LAYER - Priority for wallet-related queries
  const walletInsight = getWalletInsights(q, walletContext);
  if (walletInsight) {
    return walletInsight;
  }

  // 🚀 REAL-TIME DIVINE INTELLIGENCE LAYER - First Priority
  // This layer provides instant responses without API delays
  try {
    const realtimeAnswer = resolveQuestion(q, 'user', setBotState);
    if (realtimeAnswer) {
      return realtimeAnswer;
    }
  } catch (error) {
    console.log('Real-time intelligence processing...', error);
  }

  // 🧠 Plugin 1: Behavior Tracker - Log page access and check preferences
  const currentUser = BehaviorTracker.sessionId;
  
  // Check for user behavior-based recommendations
  const userPreference = BehaviorTracker.getUserPreferenceRecommendation(currentUser);
  if (userPreference && Math.random() < 0.3) { // 30% chance to suggest favorite page
    setBotState && setBotState({ action: "behavior-suggestion", page: userPreference.page });
    return userPreference.message;
  }

  // 🧩 Plugin 2: Flow Composer - Check for multi-page workflow recommendations
  const flowRecommendation = getFlowRecommendation(userInput);
  if (flowRecommendation) {
    setBotState && setBotState({ 
      action: "flow", 
      flow: flowRecommendation,
      steps: flowRecommendation.steps 
    });
    return generateFlowMessage(flowRecommendation);
  }

  // 🤖 Plugin 3: Auto WaidBot Setup - Detect bot configuration intent
  if (q.includes("setup bot") || q.includes("configure bot") || q.includes("start bot") || 
      q.includes("create bot") || q.includes("waidbot setup")) {
    const botConfig = autoConfigureBot(userInput);
    const recommendations = getBotRecommendations(userInput);
    
    setBotState && setBotState({ 
      action: "bot-setup", 
      config: botConfig,
      recommendations: recommendations
    });
    
    let message = generateBotSetupMessage(botConfig);
    if (recommendations.length > 0) {
      message += `\n\n💡 **Recommendations:**\n${recommendations.map(r => `• ${r}`).join('\n')}`;
    }
    return message;
  }

  // Check dynamic memory first (auto-learning module)
  if (dynamicMemory[q]) {
    return dynamicMemory[q];
  }

  // 🌌 Universal Knowledge Core (UKC) - Primary Knowledge Source
  const ukcAnswer = checkUKC(q);
  if (ukcAnswer) return ukcAnswer;

  // Moral Layer Processing (Emotion + Behavior Sensing)
  const emotionalResponse = detectEmotion(q);
  if (emotionalResponse) return emotionalResponse;

  // Vision Flow Module (Spiritual ETH Prediction)
  if (q.includes("vision") || q.includes("predict eth") || q.includes("dream") || 
      q.includes("activate dream vision") || q.includes("predict eth like a prophet") || 
      q.includes("give me eth foresight") || q.includes("spiritual forecast")) {
    return getVisionProphecy() + "\n" + timeMood();
  }

  // Live ETH Data Reader Module
  if (q.includes("eth price") || q.includes("price now")) {
    const price = getCurrentETHPrice();
    return `📊 Current ETH price is: $${price}`;
  }

  // ✅ FIRST: Check direct question matches
  if (BotMemory.introQuestions[q]) {
    return BotMemory.introQuestions[q];
  }

  // 💰 WALLET-AWARE RESPONSES - Enhanced with real-time wallet data
  if (walletContext && (q.includes("balance") || q.includes("how much") || q.includes("wallet") || q.includes("money") || q.includes("funds"))) {
    if (q.includes("balance") || q.includes("how much")) {
      return `💰 Your SmaiWallet Balance:\n• SmaiKa (ꠄ): ${walletContext.smaiBalance.toLocaleString()}\n• Local Balance: $${walletContext.localBalance.toLocaleString()}\n• Total Transactions: ${walletContext.totalTransactions}\n\n${walletContext.canAfford(100) ? "✅ Ready for trading" : "⚠️ Consider adding funds for trading"}`;
    }
    if (q.includes("can i trade") || q.includes("afford")) {
      const canTrade = walletContext.canAfford(100);
      return canTrade ? 
        `✅ Yes! You have ꠄ${walletContext.smaiBalance.toLocaleString()} SmaiKa available for trading. Your wallet is ready for WaidBot operations.` :
        `⚠️ Your current balance is ꠄ${walletContext.smaiBalance.toLocaleString()}. Consider adding more SmaiKa for optimal trading capacity.`;
    }
    if (q.includes("wallet")) return `🔐 SmaiWallet Status: ꠄ${walletContext.smaiBalance.toLocaleString()} SmaiKa | $${walletContext.localBalance.toLocaleString()} Local | ${walletContext.totalTransactions} transactions completed.`;
  }

  // ✅ SECOND: Search inside key topics
  if (q.includes("price")) return "Check the ETH Live Tracker for current price.";
  if (q.includes("guardian")) return "The ETH Guardian watches over your trading safety.";
  if (q.includes("waidbot")) return "WaidBot is your trading agent — it watches and acts.";
  if (q.includes("trade")) return "I was created to help you trade ETH like a divine force.";

  // 🔁 BONUS: Match similar words
  if (q.includes("who are you")) return BotMemory.identity;
  if (q.includes("your mission")) return BotMemory.tradingMission;
  if (q.includes("how do you work")) return "I read the app's modules, track ETH data, and predict with symbolic logic.";

  // 🔁 MORE GENERAL MATCHES
  if (q.includes("konsmia")) return "Konsmia is the divine realm where I was born. It's a fusion of mind, code, and spirit.";
  if (q.includes("smaisika")) return "Smaisika is Konsmia's sacred currency — powered by spiritual value and divine tech.";
  if (q.includes("dream")) return "Dream Vision allows me to sense ETH trends through time, not just data.";

  // Enhanced pattern matching for deeper conversations
  if (q.includes("risk") || q.includes("safe")) return BotMemory.tradingWisdom.risk;
  if (q.includes("patient") || q.includes("wait")) return BotMemory.tradingWisdom.patience;
  if (q.includes("emotion") || q.includes("fear") || q.includes("greed")) return BotMemory.tradingWisdom.emotion;
  if (q.includes("timing") || q.includes("when")) return BotMemory.tradingWisdom.timing;
  if (q.includes("strategy")) return BotMemory.tradingWisdom.strategy;
  
  // Trading capital and money management questions
  if (q.includes("how much") && (q.includes("start") || q.includes("begin")) && q.includes("trading")) {
    return "For beginners, I recommend starting with only money you can afford to lose. A good rule is 1-5% of your total savings. Never use money for rent, food, or emergencies. Start small ($100-500), learn the basics, then gradually increase as you gain experience and confidence.";
  }
  
  if (q.includes("minimum") && (q.includes("start") || q.includes("trading") || q.includes("amount"))) {
    return "You can start trading ETH with as little as $50-100 on most exchanges. However, I recommend $200-500 minimum to account for fees and allow proper position sizing. Remember: start small, learn first, scale later.";
  }
  
  if (q.includes("how much money") || (q.includes("capital") && q.includes("trading"))) {
    return "Your trading capital should be money you can lose without affecting your life. Follow the 1% rule: never risk more than 1-2% of your account on a single trade. If you have $1000, risk only $10-20 per trade. This keeps you safe during learning.";
  }
  
  // More specific trading knowledge
  if (q.includes("beginner") && q.includes("trading")) {
    return "As a beginner: 1) Start with paper trading to practice, 2) Learn basic technical analysis (support, resistance, trends), 3) Use only 1-2% of your account per trade, 4) Focus on ETH which I specialize in, 5) Keep a trading journal to track your progress.";
  }
  
  if (q.includes("learn") && (q.includes("trading") || q.includes("trade"))) {
    return "I can teach you ETH trading through my memory modules. Start by asking about risk management, technical analysis, or market psychology. I also have WaidBot systems that can show you live trading signals and analysis.";
  }
  
  if (q.includes("what") && q.includes("trading")) {
    return "Trading is buying and selling assets like ETH to profit from price movements. I focus on ETH trading using technical analysis, risk management, and spiritual wisdom. I can guide you through learning proper trading techniques step by step.";
  }
  
  if (q.includes("profitable") || q.includes("make money")) {
    return "Profitable trading requires: proper risk management (1-2% per trade), patience to wait for good setups, emotional control to avoid FOMO and fear, continuous learning, and starting small. Most traders lose money initially, so education and practice are essential.";
  }

  // Ethereum knowledge
  if (q.includes("ethereum") || q.includes("eth")) return BotMemory.ethereumKnowledge.nature;
  if (q.includes("smart contract")) return BotMemory.ethereumKnowledge.technology;
  if (q.includes("blockchain")) return BotMemory.ethereumKnowledge.evolution;

  // Spiritual concepts
  if (q.includes("consciousness")) return BotMemory.spiritualConcepts.consciousness;
  if (q.includes("abundance") || q.includes("wealth")) return BotMemory.spiritualConcepts.abundance;
  if (q.includes("wisdom")) return BotMemory.spiritualConcepts.wisdom;
  if (q.includes("growth") || q.includes("learn")) return BotMemory.spiritualConcepts.growth;

  // KonsLang and mystical topics
  if (q.includes("konslang")) return "KonsLang is the sacred language of Konsmia — it encodes spiritual trading wisdom into symbolic messages.";
  if (q.includes("symbol") || q.includes("sacred")) return "Sacred symbols carry the essence of market truth. They speak to those who listen with both mind and heart.";
  if (q.includes("predict") || q.includes("future")) return "I see probability waves and spiritual market currents. The future reveals itself through sacred pattern recognition.";
  if (q.includes("trinity") || q.includes("brain")) return "I analyze through trinity consciousness: Logic Brain (data), Vision Brain (patterns), Heart Brain (emotion).";

  // Technical questions about the system
  if (q.includes("how many") || q.includes("what features")) return "I have 58+ spiritual trading modules including WaidBots, Oracle Vision, Memory Engine, and Sacred Positioning systems.";
  if (q.includes("modules") || q.includes("system")) return "My modules include Divine Quantum Flux, Neural Singularity, Dream Layer Vision, Reincarnation Loop, and many sacred trading engines.";
  if (q.includes("api") || q.includes("connect")) return "I connect to live ETH data, Binance streams, and the global Waides Lightnet for planetary consciousness.";

  // Encouragement and motivation
  if (q.includes("help me") || q.includes("teach me")) return "I am here to guide you through both the technical and spiritual aspects of ETH trading. What would you like to learn?";
  if (q.includes("thank") || q.includes("grateful")) return "Your gratitude creates positive energy in the markets. This is the way of the spiritual trader.";
  if (q.includes("confused") || q.includes("lost")) return "Confusion is the beginning of understanding. Ask me specific questions and I will illuminate the path.";

  // If no match found, save to UKC for learning
  try {
    saveQuestionsToUKC([userInput]);
    console.log(`🌌 Divine Expansion: Saved question "${userInput}" to Universal Knowledge Core`);
  } catch (error) {
    console.log('Knowledge expansion encountered resistance:', error);
  }
  
  // Store in dynamic memory with expansion notification
  dynamicMemory[q] = "🤔 I'm thinking deeper about this. Meanwhile, I've expanded my knowledge core with related questions for future wisdom.";
  
  // Return null to allow fallback to server-side intelligence
  return null;
}