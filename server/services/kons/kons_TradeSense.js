// kons_TradeSense.js - Trade Intent Detection Module
export function kons_TradeSense(userMessage, previousState = {}) {
  const tradeTriggers = [
    "open trade", 
    "start trading", 
    "i want to trade",
    "let's trade",
    "begin trading",
    "activate trading",
    "trade now",
    "buy eth",
    "sell eth",
    "trading mode",
    "start bot"
  ];
  
  const triggered = tradeTriggers.some(trigger => 
    userMessage.toLowerCase().includes(trigger)
  );

  if (triggered) {
    return {
      kons: "TradeSense",
      response: "🔥 **Trade Intent Detected** 🔥\n\nI sense your trading energy awakening. Choose your path:\n\n• **Waidbot** - Manual guidance with my wisdom\n• **Waidbot Pro** - Semi-autonomous with intelligent timing\n• **Autonomous** - Full AI-based trading like a skilled expert\n\nWhich trading mode calls to your spirit?",
      nextAction: "await_user_mode_selection",
      intent: "trade_selection",
      confidence: 0.95,
      metadata: {
        detected_triggers: tradeTriggers.filter(trigger => 
          userMessage.toLowerCase().includes(trigger)
        ),
        timestamp: Date.now(),
        user_energy: "active"
      }
    };
  }
  
  return null;
}

// Enhanced trade context detection
export function detectTradeContext(userMessage) {
  const contexts = {
    aggressive: ["quick", "fast", "now", "immediate", "urgent"],
    conservative: ["safe", "careful", "slow", "gradual", "steady"],
    learning: ["teach", "learn", "explain", "understand", "show me"],
    profit: ["money", "profit", "gain", "earn", "rich"],
    risk: ["risk", "danger", "safe", "protect", "loss"]
  };
  
  const detectedContexts = {};
  
  Object.keys(contexts).forEach(context => {
    const matches = contexts[context].filter(word => 
      userMessage.toLowerCase().includes(word)
    );
    if (matches.length > 0) {
      detectedContexts[context] = matches;
    }
  });
  
  return detectedContexts;
}