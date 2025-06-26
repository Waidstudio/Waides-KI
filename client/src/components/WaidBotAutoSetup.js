// 🤖 Auto WaidBot Setup Engine - Instant Bot Deployment System
// Sets up WaidBot instantly based on user message intent

export function autoConfigureBot(intentText) {
  const setup = {
    strategy: "",
    risk: "",
    vision: "",
    guardian: false,
    timeframe: "",
    mode: "",
    features: []
  };

  const q = intentText.toLowerCase();

  // Strategy Detection
  if (q.includes("scalp") || q.includes("quick") || q.includes("fast")) {
    setup.strategy = "Scalping";
    setup.timeframe = "5min";
  } else if (q.includes("swing") || q.includes("medium") || q.includes("daily")) {
    setup.strategy = "Swing Trading";
    setup.timeframe = "4h";
  } else if (q.includes("long term") || q.includes("hold") || q.includes("invest")) {
    setup.strategy = "Long Term";
    setup.timeframe = "1d";
  } else if (q.includes("quantum") || q.includes("advanced") || q.includes("neural")) {
    setup.strategy = "Quantum Flux";
    setup.timeframe = "15min";
  } else {
    setup.strategy = "Adaptive";
    setup.timeframe = "1h";
  }

  // Risk Detection
  if (q.includes("safe") || q.includes("conservative") || q.includes("low risk")) {
    setup.risk = "Low";
  } else if (q.includes("aggressive") || q.includes("high risk") || q.includes("maximum")) {
    setup.risk = "High";
  } else if (q.includes("balanced") || q.includes("moderate")) {
    setup.risk = "Medium";
  } else {
    setup.risk = "Auto";
  }

  // Vision Layer Detection
  if (q.includes("rebirth") || q.includes("seasonal")) {
    setup.vision = "Seasonal Rebirth";
  } else if (q.includes("dream") || q.includes("oracle") || q.includes("vision")) {
    setup.vision = "Dream Oracle";
  } else if (q.includes("spirit") || q.includes("spiritual") || q.includes("mystical")) {
    setup.vision = "Spirit Vision";
  } else if (q.includes("sigil") || q.includes("symbol") || q.includes("sacred")) {
    setup.vision = "Sigil Layer";
  } else {
    setup.vision = "Technical Only";
  }

  // Guardian Detection
  if (q.includes("guardian") || q.includes("protect") || q.includes("defense") || q.includes("shield")) {
    setup.guardian = true;
  }

  // Mode Detection
  if (q.includes("autonomous") || q.includes("auto") || q.includes("hands-free")) {
    setup.mode = "Autonomous";
  } else if (q.includes("manual") || q.includes("control") || q.includes("supervised")) {
    setup.mode = "Manual";
  } else if (q.includes("demo") || q.includes("test") || q.includes("simulation")) {
    setup.mode = "Demo";
  } else {
    setup.mode = "Semi-Auto";
  }

  // Feature Detection
  if (q.includes("voice") || q.includes("speak")) setup.features.push("Voice Control");
  if (q.includes("alert") || q.includes("notification")) setup.features.push("Smart Alerts");
  if (q.includes("learning") || q.includes("adapt")) setup.features.push("AI Learning");
  if (q.includes("social") || q.includes("community")) setup.features.push("Social Trading");
  if (q.includes("mobile") || q.includes("phone")) setup.features.push("Mobile Sync");

  return setup;
}

export function generateBotSetupMessage(config) {
  if (!config) return null;

  const featuresList = config.features.length > 0 
    ? `\n📋 **Features:** ${config.features.join(", ")}`
    : "";

  return `🤖 **WaidBot Auto-Configuration Complete**\n\n` +
    `⚡ **Strategy:** ${config.strategy}\n` +
    `🛡️ **Risk Level:** ${config.risk}\n` +
    `🔮 **Vision Layer:** ${config.vision}\n` +
    `👁️ **Guardian Mode:** ${config.guardian ? "✅ Enabled" : "❌ Disabled"}\n` +
    `⏱️ **Timeframe:** ${config.timeframe}\n` +
    `🎯 **Mode:** ${config.mode}${featuresList}\n\n` +
    `💡 Your bot is configured and ready to launch!`;
}

export function getBotRecommendations(intentText) {
  const q = intentText.toLowerCase();
  const recommendations = [];

  // Based on user intent, suggest complementary features
  if (q.includes("beginner") || q.includes("new") || q.includes("start")) {
    recommendations.push("Enable Demo Mode for safe learning");
    recommendations.push("Start with Low Risk settings");
    recommendations.push("Use Trading Academy for education");
  }

  if (q.includes("profit") || q.includes("money") || q.includes("earn")) {
    recommendations.push("Enable AI Learning for better performance");
    recommendations.push("Consider Quantum Flux strategy");
    recommendations.push("Activate Guardian Mode for protection");
  }

  if (q.includes("spiritual") || q.includes("mystical") || q.includes("divine")) {
    recommendations.push("Enable Spirit Vision layer");
    recommendations.push("Activate Sigil Layer for sacred guidance");
    recommendations.push("Use Dream Oracle for mystical insights");
  }

  return recommendations;
}

export default {
  autoConfigureBot,
  generateBotSetupMessage,
  getBotRecommendations
};