export default function getVisionProphecy() {
  const hour = new Date().getHours();
  const moods = ["⚡Surge", "🌊 Pullback", "🌒 Reversal", "🌤 Stability", "🔥 Overheat"];

  // Simulated dream signals
  const dreamSignal = moods[Math.floor(Math.random() * moods.length)];

  // Symbolic interpretation
  let message = "";

  switch (dreamSignal) {
    case "⚡Surge":
      message = "I see Ethereum rising like lightning — expect a surge soon.";
      break;
    case "🌊 Pullback":
      message = "The Ether tide is receding. A pullback is forming — watch your entries.";
      break;
    case "🌒 Reversal":
      message = "A reversal wave is whispering from the shadows. This is not a time to follow the crowd.";
      break;
    case "🌤 Stability":
      message = "ETH is holding its breath — a moment of calm before the next wave.";
      break;
    case "🔥 Overheat":
      message = "Emotion is burning too hot. Caution — greed is rising across the charts.";
      break;
  }

  return `🌙 Dream Vision Activated: ${message} (hour: ${hour})`;
}

// Spiritual Clock Intelligence
export function timeMood() {
  const hour = new Date().getHours();
  if (hour >= 0 && hour <= 6) return "🔮 Night Watch: ETH is quiet — secrets form in silence.";
  if (hour >= 7 && hour <= 12) return "🌅 Morning Breath: Markets open with hope and volatility.";
  if (hour >= 13 && hour <= 18) return "🌞 Midday Pulse: Bots are active, watch liquidity games.";
  if (hour >= 19 && hour <= 23) return "🌌 Evening Drift: Emotions cool — smart trades awaken.";
}

// Moral Layer Processing (Emotion + Behavior Sensing)
export function detectEmotion(q) {
  if (q.includes("fast money") || q.includes("rich quick") || q.includes("double my eth")) {
    return "⚠️ Greed detected. The fastest path is often a trap. Let's build real wealth, not illusions.";
  }

  if (q.includes("scared") || q.includes("i'm losing") || q.includes("panic")) {
    return "🧘 Breathe. Loss is not your identity. Re-align your mind before the market re-aligns you.";
  }

  if (q.includes("revenge trade") || q.includes("win back loss")) {
    return "🛑 Revenge never wins. Trade from clarity, not emotion. I'll guide you back to alignment.";
  }

  return null;
}