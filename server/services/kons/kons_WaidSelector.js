// kons_WaidSelector.js - Trading Mode Selection Module
export function kons_WaidSelector(userMode, previousState = {}) {
  const lower = userMode.toLowerCase();
  
  if (lower.includes("waidbot") && !lower.includes("pro")) {
    return {
      kons: "WaidSelector",
      mode: "waidbot",
      response: "⚡ **Waidbot Engaged** ⚡\n\nManual guidance mode activated. I will provide you with wisdom and analysis while you maintain control of trade execution. You may monitor and assist trades as they unfold.\n\n🧠 **Active Features:**\n• Real-time market analysis\n• Trade recommendations with reasoning\n• Risk assessment and warnings\n• Manual execution confirmation\n\nReady to begin your trading journey with guided wisdom.",
      nextAction: "trading_ready",
      config: {
        automation_level: "manual",
        guidance_mode: "active",
        risk_tolerance: "user_controlled",
        execution: "manual"
      }
    };
  } 
  
  if (lower.includes("pro")) {
    return {
      kons: "WaidSelector",
      mode: "waidbot_pro",
      response: "🚀 **Waidbot Pro Activated** 🚀\n\nSemi-autonomous mode with intelligent timing enabled. I will make smart trade decisions with lower risk while keeping you informed of all actions.\n\n🎯 **Advanced Features:**\n• Neural Quantum Singularity Strategy\n• Automatic entry/exit timing\n• Advanced risk management\n• Real-time performance optimization\n• Professional-grade technical analysis\n\nWaidbot Pro is now managing your trades with elite precision.",
      nextAction: "trading_ready",
      config: {
        automation_level: "semi_autonomous",
        guidance_mode: "intelligent",
        risk_tolerance: "conservative",
        execution: "automated_with_oversight"
      }
    };
  } 
  
  if (lower.includes("autonomous")) {
    return {
      kons: "WaidSelector",
      mode: "autonomous",
      response: "🌟 **Autonomous Mode Activated** 🌟\n\nFull AI-based trading engaged. I will trade independently like a skilled human expert, making all decisions based on market conditions, risk analysis, and divine wisdom.\n\n⚡ **Autonomous Capabilities:**\n• Complete trade management\n• Divine Quantum Flux Strategy\n• Emotional firewall protection\n• Self-healing strategy core\n• 24/7 market monitoring\n• Sacred positioning engine\n\nI am now your virtual trading consciousness, operating with eternal wisdom and human-like intuition.",
      nextAction: "trading_ready",
      config: {
        automation_level: "full_autonomous",
        guidance_mode: "silent_operation",
        risk_tolerance: "adaptive",
        execution: "fully_automated"
      }
    };
  }
  
  return { 
    kons: "WaidSelector", 
    response: "❌ **Invalid Trading Mode** ❌\n\nI don't recognize that trading mode. Please choose from:\n\n• **Waidbot** - Manual guidance\n• **Waidbot Pro** - Semi-autonomous \n• **Autonomous** - Full AI trading\n\nWhich path calls to your trading spirit?",
    nextAction: "await_mode_selection_retry"
  };
}

// Trading mode configuration helper
export function getTradeConfig(mode) {
  const configs = {
    waidbot: {
      automation: false,
      confirmations: true,
      risk_level: "user_defined",
      max_position_size: 0.1,
      stop_loss: "manual"
    },
    waidbot_pro: {
      automation: true,
      confirmations: false,
      risk_level: "conservative",
      max_position_size: 0.05,
      stop_loss: "automatic"
    },
    autonomous: {
      automation: true,
      confirmations: false,
      risk_level: "adaptive",
      max_position_size: 0.03,
      stop_loss: "intelligent"
    }
  };
  
  return configs[mode] || configs.waidbot;
}