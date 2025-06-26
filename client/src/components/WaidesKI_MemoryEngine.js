import BotMemory from "./BotMemory";
import getVisionProphecy, { timeMood, detectEmotion } from './VisionFlowEngine';
import UKC from './UKC';
import { addPendingQuestion, autoTeachFromConversation } from './KnowledgeLoader';

// Dynamic memory for auto-learning - lives in runtime memory only
let dynamicMemory = {};

// Command Router Module - detects when user wants to open tools
export function detectCommandTrigger(q, setBotState) {
  if (q.includes("open wallet") || q.includes("smaiwallet")) {
    setBotState({ action: "wallet" });
    return "🔐 Opening your SmaiWallet...";
  }

  if (q.includes("start trading") || q.includes("waidbot")) {
    setBotState({ action: "trade" });
    return "🤖 Activating WaidBot now...";
  }

  if (q.includes("check eth price") || q.includes("eth live")) {
    setBotState({ action: "price" });
    return "📡 Connecting to ETH Live Tracker...";
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

// ✨ Very simple smart match function
export default function getSmartAnswer(userInput) {
  const q = userInput.toLowerCase().trim();

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

  // ✅ SECOND: Search inside key topics
  if (q.includes("wallet")) return "Your SmaiWallet holds your ETH and spiritual funds.";
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

  // If no match found, add to pending questions for learning
  addPendingQuestion(userInput);
  
  // Return null to allow fallback to server-side intelligence
  return null;
}