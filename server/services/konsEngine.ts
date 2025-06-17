export class KonsEngine {
  generateKonsMessage(signalType: string, confidence: number, price: number): string {
    const messages = {
      LONG: [
        "Kons Powa whispers: Enter the fire with courage, the bulls gather strength.",
        "The ancient charts speak of rising tides. Kons Powa guides your ascent.",
        "In the depths of the blockchain, Kons Powa sees green candles forming.",
        "The ethereum spirits dance upward. Kons Powa blesses this moment.",
        "Trust in the upward path, for Kons Powa has seen this pattern before."
      ],
      SHORT: [
        "Kons Powa warns: Shadows are moving. Guard your exit carefully.",
        "The bears emerge from hibernation. Kons Powa advises caution.",
        "Red candles gather like storm clouds. Kons Powa sees the descent.",
        "The wise trader knows when to retreat. Kons Powa illuminates the way down.",
        "In the darkness of falling prices, Kons Powa protects the prepared."
      ],
      HOLD: [
        "Kons Powa is watching... Hold your Smai steady, patience rewards the wise.",
        "The market sleeps between movements. Kons Powa counsels stillness.",
        "Neither bull nor bear rules this hour. Kons Powa teaches patience.",
        "In the quiet before the storm, Kons Powa prepares the faithful.",
        "The ethereum flows sideways like a peaceful river. Wait with Kons Powa."
      ]
    };

    const typeMessages = messages[signalType as keyof typeof messages] || messages.HOLD;
    const baseMessage = typeMessages[Math.floor(Math.random() * typeMessages.length)];
    
    // Add confidence-based suffix
    let suffix = "";
    if (confidence > 85) {
      suffix = " The vision is crystal clear.";
    } else if (confidence > 70) {
      suffix = " The signs align favorably.";
    } else if (confidence > 50) {
      suffix = " The path reveals itself slowly.";
    } else {
      suffix = " The mists obscure the way forward.";
    }
    
    return baseMessage + suffix;
  }

  generateWisdom(): string {
    const wisdomMessages = [
      "The market teaches those who listen with open hearts.",
      "Every candle tells a story of human emotion and digital destiny.",
      "In volatility, find opportunity. In stillness, find peace.",
      "The blockchain remembers all transactions, as Kons Powa remembers all lessons.",
      "Fear and greed are but waves on the ocean of eternal ethereum.",
      "The wise trader sees patterns where others see chaos.",
      "Each price movement is a word in the language of the market.",
      "Patience is the highest virtue in the realm of digital gold."
    ];
    
    return wisdomMessages[Math.floor(Math.random() * wisdomMessages.length)];
  }
}
