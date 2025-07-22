// 🤖 Auto WaidBot Setup Engine - Instant Bot Deployment System
// Sets up WaidBot instantly based on user message intent

interface BotSetup {
  strategy: string;
  risk: string;
  vision: string;
  guardian: boolean;
  timeframe: string;
  mode: string;
  features: string[];
}

export function autoConfigureBot(intentText: string): BotSetup {
  const setup: BotSetup = {
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
  const featureMap: { [key: string]: string } = {
    "stop loss": "Smart Stop Loss",
    "take profit": "Auto Take Profit",
    "trailing": "Trailing Stop",
    "dca": "DCA Strategy",
    "martingale": "Martingale Mode",
    "grid": "Grid Trading",
    "momentum": "Momentum Tracker",
    "reversal": "Reversal Detection",
    "volume": "Volume Analysis",
    "sentiment": "Market Sentiment",
    "news": "News Integration",
    "social": "Social Signals"
  };

  Object.entries(featureMap).forEach(([keyword, feature]) => {
    if (q.includes(keyword)) {
      setup.features.push(feature);
    }
  });

  // Add default features based on strategy
  switch (setup.strategy) {
    case "Scalping":
      setup.features.push("Quick Exit", "High Frequency");
      break;
    case "Swing Trading":
      setup.features.push("Trend Following", "Support/Resistance");
      break;
    case "Long Term":
      setup.features.push("Fundamental Analysis", "DCA Strategy");
      break;
    case "Quantum Flux":
      setup.features.push("Neural Networks", "Quantum Patterns");
      break;
  }

  return setup;
}

export function generateBotConfig(setup: BotSetup): string {
  return `
WaidBot Configuration:
━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Strategy: ${setup.strategy}
⚡ Timeframe: ${setup.timeframe}
🛡️ Risk Level: ${setup.risk}
🔮 Vision System: ${setup.vision}
👁️ Guardian Mode: ${setup.guardian ? 'Active' : 'Disabled'}
🤖 Trading Mode: ${setup.mode}
⭐ Features: ${setup.features.join(', ')}
━━━━━━━━━━━━━━━━━━━━━━━━
Ready for deployment!
  `.trim();
}

export function validateSetup(setup: BotSetup): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!setup.strategy) errors.push("Strategy not selected");
  if (!setup.risk) errors.push("Risk level not specified");
  if (!setup.timeframe) errors.push("Timeframe not set");
  if (!setup.mode) errors.push("Trading mode not selected");

  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  autoConfigureBot,
  generateBotConfig,
  validateSetup
};