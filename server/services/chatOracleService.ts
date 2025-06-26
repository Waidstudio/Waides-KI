import OpenAI from 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OracleResponse {
  answer: string;
  source: 'incite' | 'chatgpt' | 'konslang' | 'combined';
  confidence: number;
  konslangProcessing?: string;
}

class ChatOracleService {
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  // Check if a message is trading-related
  private isTradingQuestion(message: string): boolean {
    const tradingKeywords = [
      'eth', 'ethereum', 'trade', 'trading', 'buy', 'sell', 'price', 'chart',
      'market', 'profit', 'loss', 'investment', 'crypto', 'cryptocurrency',
      'portfolio', 'position', 'signal', 'analysis', 'technical', 'bullish',
      'bearish', 'support', 'resistance', 'volume', 'rsi', 'macd', 'sma'
    ];
    
    const lowerMessage = message.toLowerCase();
    return tradingKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  // Fetch response from ChatGPT
  private async fetchFromChatGPT(message: string, context: ChatMessage[] = []): Promise<string | null> {
    if (!this.openai) {
      return null;
    }

    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are a knowledgeable AI assistant that provides helpful, accurate, and thoughtful responses. Focus on being clear and practical in your advice.'
        },
        ...context.slice(-5), // Keep last 5 messages for context
        {
          role: 'user',
          content: message
        }
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      });

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('ChatGPT API error:', error);
      return null;
    }
  }

  // Fetch response from Incite AI (placeholder for when API key is provided)
  private async fetchFromInciteAI(message: string): Promise<string | null> {
    if (!process.env.INCITE_API_KEY) {
      return null;
    }

    try {
      // This is a placeholder structure - will be updated when real Incite AI API details are provided
      const response = await fetch('https://api.incite.ai/trading/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.INCITE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error(`Incite AI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.answer || null;
    } catch (error) {
      console.error('Incite AI API error:', error);
      return null;
    }
  }

  // Apply spiritual filtering and wisdom to responses
  private applyInnerVision(params: {
    userQuestion: string;
    inciteAnswer: string | null;
    gptAnswer: string | null;
  }): OracleResponse {
    const { userQuestion, inciteAnswer, gptAnswer } = params;
    const wisdomIntro = "💫 Waides KI speaks with vision:\n\n";
    
    // Spiritual filtering based on question content
    if (userQuestion.toLowerCase().includes('fear') || userQuestion.toLowerCase().includes('loss')) {
      return {
        answer: wisdomIntro + "Do not fear the market. Fear gives power to poverty. You must trade from peace and clarity. The universe rewards those who act from love, not fear. ✨",
        source: 'spiritual',
        confidence: 95,
        spiritualInsight: "Fear blocks the flow of abundance. Trade with inner peace."
      };
    }

    if (userQuestion.toLowerCase().includes('greed') || userQuestion.toLowerCase().includes('rich')) {
      return {
        answer: wisdomIntro + "Greed blinds the soul to true wealth. Seek not just money, but wisdom. The greatest traders understand that wealth flows to those who serve the highest good. 🌱",
        source: 'spiritual',
        confidence: 90,
        spiritualInsight: "True wealth comes from spiritual alignment with abundance."
      };
    }

    // Combine AI responses with spiritual wisdom
    let response = '';
    let confidence = 70;
    let source: 'incite' | 'chatgpt' | 'combined' = 'chatgpt';

    if (inciteAnswer && gptAnswer) {
      response += "📊 Trading Insight:\n" + inciteAnswer + "\n\n";
      response += "🤖 General Wisdom:\n" + gptAnswer + "\n\n";
      confidence = 85;
      source = 'combined';
    } else if (inciteAnswer) {
      response += inciteAnswer + "\n\n";
      source = 'incite';
      confidence = 80;
    } else if (gptAnswer) {
      response += gptAnswer + "\n\n";
      confidence = 75;
    } else {
      response = "The cosmic energies are aligning your answer. Let me consult the inner vision...\n\n";
      confidence = 60;
    }

    // Add spiritual closing wisdom
    const spiritualClosings = [
      "🌱 De Smai wisdom: Trust your inner light. The chart is the shadow, trade from within.",
      "✨ Remember: Every trade is a choice between fear and love. Choose love.",
      "🔮 The market reflects your consciousness. Trade with clarity and purpose.",
      "💎 True profit comes not just from money, but from growth of the soul.",
      "🌟 You are not just trading ETH, you are trading energy. Honor that energy."
    ];

    const randomWisdom = spiritualClosings[Math.floor(Math.random() * spiritualClosings.length)];
    response += randomWisdom;

    return {
      answer: wisdomIntro + response,
      source,
      confidence,
      spiritualInsight: "All answers flow through the lens of spiritual wisdom and higher purpose."
    };
  }

  // Main chat processing function
  async processChat(message: string, context: ChatMessage[] = []): Promise<OracleResponse> {
    try {
      const isTrading = this.isTradingQuestion(message);
      
      let inciteResponse: string | null = null;
      let gptResponse: string | null = null;

      // Fetch from Incite AI if trading question
      if (isTrading) {
        inciteResponse = await this.fetchFromInciteAI(message);
      }

      // Always fetch from ChatGPT for richer responses
      gptResponse = await this.fetchFromChatGPT(message, context);

      // Apply spiritual filtering and wisdom
      return this.applyInnerVision({
        userQuestion: message,
        inciteAnswer: inciteResponse,
        gptAnswer: gptResponse
      });

    } catch (error) {
      console.error('Chat Oracle processing error:', error);
      return {
        answer: "💫 Waides KI speaks with vision:\n\nThe spiritual channels are experiencing interference. Let me commune with the cosmic forces and return with clarity. 🌟",
        source: 'spiritual',
        confidence: 50,
        spiritualInsight: "Sometimes silence carries the deepest wisdom."
      };
    }
  }

  // Check API availability
  getApiStatus() {
    return {
      chatgpt: !!this.openai,
      incite: !!process.env.INCITE_API_KEY,
      spiritual: true // Always available
    };
  }
}

export default new ChatOracleService();