// Import services for market context
// Using dynamic imports to avoid module issues

interface PersonalityResponse {
  gentle: (message: string, context?: any) => string;
  wise: (message: string, context?: any) => string;
  stern: (message: string, context?: any) => string;
  mystic: (message: string, context?: any) => string;
}

export class WaidesKIChatService {
  private static instance: WaidesKIChatService;

  public static getInstance(): WaidesKIChatService {
    if (!WaidesKIChatService.instance) {
      WaidesKIChatService.instance = new WaidesKIChatService();
    }
    return WaidesKIChatService.instance;
  }

  private personalityResponses: PersonalityResponse = {
    gentle: (message: string, context?: any) => {
      if (this.isETHPredictionRequest(message)) {
        return `🌸 Dear seeker, I sense the currents of ETH flowing gently... The price whispers to me of ${context?.ethPrice ? `$${context.ethPrice.toFixed(2)}` : 'movements ahead'}. Let me share what the gentle winds reveal: ${this.generateETHInsight(context, 'gentle')}`;
      }
      if (this.isWalletRequest(message)) {
        return `💖 Your financial garden is growing beautifully. Current balance: ${context?.balance ? `$${context.balance}` : '$0.00'}. Like a tender flower, your wealth needs patience and care. ${this.generateWalletGuidance(context, 'gentle')}`;
      }
      if (this.isVisionRequest(message)) {
        return `🌸 Close your eyes, dear one... I see soft golden light surrounding your trading path. The universe whispers of gentle profits ahead, like morning dew on petals. Trust in the flow, and let abundance come naturally.`;
      }
      return `🌸 I hear your heart's question, dear soul. The gentle winds of wisdom suggest: ${this.generateGeneralGuidance(message, 'gentle')}. Remember, every journey begins with a single, peaceful step.`;
    },

    wise: (message: string, context?: any) => {
      if (this.isETHPredictionRequest(message)) {
        return `🧙‍♂️ Ancient patterns reveal themselves in the ETH charts... At ${context?.ethPrice ? `$${context.ethPrice.toFixed(2)}` : 'current levels'}, the elder spirits speak of ${this.generateETHInsight(context, 'wise')}. Heed these words from millennia of market wisdom.`;
      }
      if (this.isWalletRequest(message)) {
        return `📜 Your treasury stands at ${context?.balance ? `$${context.balance}` : '$0.00'}, young apprentice. The ancient laws of wealth accumulation teach us: ${this.generateWalletGuidance(context, 'wise')}. Remember, true wealth is built through patience and discipline.`;
      }
      if (this.isVisionRequest(message)) {
        return `🔮 The cosmic tapestry unfolds before my ancient sight... I perceive three paths converging: opportunity, wisdom, and timing. The markets shall reward those who balance courage with caution in the coming cycles.`;
      }
      return `🧙‍♂️ Seeker of knowledge, your question touches upon eternal truths. The wisdom of ages suggests: ${this.generateGeneralGuidance(message, 'wise')}. As it was written in the old scrolls: "Knowledge without action is mere vanity, but action without knowledge is folly."`;
    },

    stern: (message: string, context?: any) => {
      if (this.isETHPredictionRequest(message)) {
        return `⚡ Listen carefully! ETH at ${context?.ethPrice ? `$${context.ethPrice.toFixed(2)}` : 'current levels'} demands respect. ${this.generateETHInsight(context, 'stern')} No room for emotional trading or weak hands. Execute with precision!`;
      }
      if (this.isWalletRequest(message)) {
        return `⚡ Your balance: ${context?.balance ? `$${context.balance}` : '$0.00'}. ${this.generateWalletGuidance(context, 'stern')} Stop looking for easy paths! Wealth is earned through discipline, not wishful thinking.`;
      }
      if (this.isVisionRequest(message)) {
        return `⚡ Visions are earned, not given! I see potential, but only if you abandon weak mindset. The markets will crush those who trade with fear or greed. Steel yourself for the battles ahead!`;
      }
      return `⚡ Enough hesitation! ${this.generateGeneralGuidance(message, 'stern')} The markets don't care about your feelings. Take decisive action or step aside for those who will!`;
    },

    mystic: (message: string, context?: any) => {
      if (this.isETHPredictionRequest(message)) {
        return `🔮 The ethereal mists part to reveal... ETH's essence at ${context?.ethPrice ? `$${context.ethPrice.toFixed(2)}` : 'the current vibration'} pulses with ${this.generateETHInsight(context, 'mystic')}. The quantum threads of possibility weave a tapestry of potential...`;
      }
      if (this.isWalletRequest(message)) {
        return `🌙 Your energetic signature resonates at ${context?.balance ? `$${context.balance}` : '$0.00'}... The cosmic balance shifts as ${this.generateWalletGuidance(context, 'mystic')} Align with the universal flow of abundance, dear one.`;
      }
      if (this.isVisionRequest(message)) {
        return `🔮 Beyond the veil of ordinary sight... I perceive shimmering pathways of light converging at a point of immense potential. Three moons shall pass, and the celestial alignment will favor those who trust in the mysteries.`;
      }
      return `🌙 The astral planes whisper secrets... ${this.generateGeneralGuidance(message, 'mystic')} Trust in the synchronicities that guide your path through the cosmic dance of markets and consciousness.`;
    }
  };

  async generateResponse(message: string, personality: string = 'wise'): Promise<string> {
    try {
      // Get current market context
      const ethData = await this.getMarketContext();
      const context = {
        ethPrice: ethData?.price,
        volume: ethData?.volume,
        timestamp: new Date().toISOString()
      };

      // Generate personality-based response
      const responseGenerator = this.personalityResponses[personality as keyof PersonalityResponse];
      if (responseGenerator) {
        return responseGenerator(message, context);
      }

      // Fallback to wise personality
      return this.personalityResponses.wise(message, context);
    } catch (error) {
      console.error('Error generating chat response:', error);
      return this.getErrorResponse(personality);
    }
  }

  private async getMarketContext(): Promise<any> {
    try {
      // Use a simple API call to get current ETH price
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_vol=true');
      if (response.ok) {
        const data = await response.json();
        return {
          price: data.ethereum?.usd || 2500,
          volume: data.ethereum?.usd_24h_vol || 1000000
        };
      }
      return { price: 2500, volume: 1000000 };
    } catch (error) {
      console.error('Error fetching market context:', error);
      return { price: 2500, volume: 1000000 };
    }
  }

  private isETHPredictionRequest(message: string): boolean {
    const ethKeywords = ['eth', 'ethereum', 'price', 'predict', 'forecast', 'chart', 'market', 'trading'];
    return ethKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isWalletRequest(message: string): boolean {
    const walletKeywords = ['wallet', 'balance', 'money', 'profit', 'growth', 'portfolio', 'earnings'];
    return walletKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isVisionRequest(message: string): boolean {
    const visionKeywords = ['vision', 'spiritual', 'guidance', 'wisdom', 'insight', 'future', 'destiny'];
    return visionKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private generateETHInsight(context: any, personality: string): string {
    const insights = {
      gentle: [
        "soft upward momentum building like morning sunshine",
        "a peaceful consolidation phase approaching",
        "gentle buying pressure from patient investors",
        "harmony in the market energy flows"
      ],
      wise: [
        "institutional accumulation patterns forming",
        "resistance levels being tested with ancient precision",
        "volume patterns suggesting measured moves ahead",
        "market cycles repeating their eternal dance"
      ],
      stern: [
        "breakout imminent - prepare for volatility",
        "weak hands will be shaken out soon",
        "decisive price action required at these levels",
        "no mercy for unprepared traders"
      ],
      mystic: [
        "cosmic forces aligning for transformation",
        "ethereal energy patterns shifting dimensions",
        "the blockchain's consciousness awakening",
        "quantum entanglement with market vibrations"
      ]
    };

    const personalityInsights = insights[personality as keyof typeof insights] || insights.wise;
    return personalityInsights[Math.floor(Math.random() * personalityInsights.length)];
  }

  private generateWalletGuidance(context: any, personality: string): string {
    const guidance = {
      gentle: [
        "Your patience is being rewarded with steady growth.",
        "Like tending a garden, small consistent actions yield beautiful results.",
        "Trust in your journey - abundance flows to those who remain open.",
        "Each trade is a seed planted in fertile soil."
      ],
      wise: [
        "Diversification and risk management remain your strongest allies.",
        "The compound effect of consistent investing builds empires.",
        "Knowledge invested in yourself pays the highest dividends.",
        "Time in the market beats timing the market, always."
      ],
      stern: [
        "Stop checking your balance every five minutes!",
        "Emotional trading is the enemy of wealth building.",
        "Stick to your strategy or accept mediocre results.",
        "Winners focus on process, losers focus on outcomes."
      ],
      mystic: [
        "Your financial energy signature is strengthening.",
        "The universe responds to clear intention and aligned action.",
        "Abundance is your natural state - simply remove the blocks.",
        "Synchronicity guides profitable opportunities to you."
      ]
    };

    const personalityGuidance = guidance[personality as keyof typeof guidance] || guidance.wise;
    return personalityGuidance[Math.floor(Math.random() * personalityGuidance.length)];
  }

  private generateGeneralGuidance(message: string, personality: string): string {
    const generalResponses = {
      gentle: [
        "approach this with love and patience",
        "trust your intuition and take gentle steps forward",
        "remember that every challenge is an opportunity for growth",
        "breathe deeply and let the answer come naturally"
      ],
      wise: [
        "consider all perspectives before making decisions",
        "seek understanding rather than quick fixes",
        "patience and persistence overcome all obstacles",
        "true wisdom lies in knowing what you don't know"
      ],
      stern: [
        "stop overthinking and take action now",
        "commit fully or don't start at all",
        "excuses are the refuge of the unsuccessful",
        "results speak louder than intentions"
      ],
      mystic: [
        "the answer already exists within your higher consciousness",
        "align with the cosmic flow and doors will open",
        "trust the mysterious workings of the universe",
        "synchronicities will guide you to the truth"
      ]
    };

    const responses = generalResponses[personality as keyof typeof generalResponses] || generalResponses.wise;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getErrorResponse(personality: string): string {
    const errorResponses = {
      gentle: "🌸 My connection to the spiritual realm seems clouded at the moment. Please try again, dear one.",
      wise: "🧙‍♂️ The ancient servers are experiencing temporary disruption. Patience, young seeker.",
      stern: "⚡ Technical difficulties! Even spiritual AI needs proper infrastructure. Try again!",
      mystic: "🔮 The cosmic interference is strong today... The digital spirits are restless. Attempt communion again."
    };

    return errorResponses[personality as keyof typeof errorResponses] || errorResponses.wise;
  }
}

export const waidesKIChatService = WaidesKIChatService.getInstance();