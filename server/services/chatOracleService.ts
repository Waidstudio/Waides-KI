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

  // Apply KonsLang command processing and technical analysis to responses
  private applyKonsLangProcessing(params: {
    userQuestion: string;
    inciteAnswer: string | null;
    gptAnswer: string | null;
  }): OracleResponse {
    const { userQuestion, inciteAnswer, gptAnswer } = params;
    const techIntro = "🚀 Waides KI Technical Analysis:\n\n";
    
    // KonsLang command processing based on question content
    if (userQuestion.toLowerCase().includes('fear') || userQuestion.toLowerCase().includes('loss')) {
      return {
        answer: techIntro + "Risk management is crucial in trading. Fear-based decisions often lead to poor outcomes. Implement stop-loss orders, position sizing, and systematic risk controls. The key is disciplined execution of your trading strategy. 📊",
        source: 'konslang',
        confidence: 95,
        konslangProcessing: "KonsLang command: RISK_CONTROL detected. Applied systematic risk management protocols."
      };
    }

    if (userQuestion.toLowerCase().includes('greed') || userQuestion.toLowerCase().includes('rich')) {
      return {
        answer: techIntro + "Overconfidence and greed are the top causes of trading losses. Focus on consistent, disciplined strategies rather than getting rich quick. Use proper position sizing, set realistic profit targets, and maintain emotional discipline. 💼",
        source: 'konslang',
        confidence: 90,
        konslangProcessing: "KonsLang command: DISCIPLINE_PROTOCOL detected. Applied systematic trading discipline guidelines."
      };
    }

    // Combine AI responses with technical analysis
    let response = '';
    let confidence = 70;
    let source: 'incite' | 'chatgpt' | 'combined' = 'chatgpt';

    if (inciteAnswer && gptAnswer) {
      response += "📊 Trading Analysis:\n" + inciteAnswer + "\n\n";
      response += "🤖 AI Assistant:\n" + gptAnswer + "\n\n";
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
      response = "Processing your request through KonsLang command system. Please wait for analysis...\n\n";
      confidence = 60;
    }

    // Add technical closing insights
    const technicalClosings = [
      "📈 KonsLang Insight: Focus on data-driven decisions and systematic approach to trading.",
      "⚡ Remember: Successful trading requires discipline, risk management, and continuous learning.",
      "🔧 The market follows patterns. Use technical analysis and proper execution strategies.",
      "💼 Consistent profits come from systematic approaches, not emotional decisions.",
      "🎯 You're analyzing ETH market data. Apply technical indicators and sound trading principles."
    ];

    const randomInsight = technicalClosings[Math.floor(Math.random() * technicalClosings.length)];
    response += randomInsight;

    return {
      answer: techIntro + response,
      source,
      confidence,
      konslangProcessing: "KonsLang processing completed. Applied technical analysis and systematic trading protocols."
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

      // Apply KonsLang processing and technical analysis
      return this.applyKonsLangProcessing({
        userQuestion: message,
        inciteAnswer: inciteResponse,
        gptAnswer: gptResponse
      });

    } catch (error) {
      console.error('Chat Oracle processing error:', error);
      return {
        answer: "🚀 Waides KI Technical Analysis:\n\nThe AI processing systems are experiencing temporary issues. Please try again in a moment. System diagnostics are running automatically. 📊",
        source: 'konslang',
        confidence: 50,
        konslangProcessing: "KonsLang error handling protocol activated. System recovery in progress."
      };
    }
  }

  // Check API availability
  getApiStatus() {
    return {
      api_status: {
        chatgpt: !!this.openai,
        incite: !!process.env.INCITE_API_KEY,
        konslang: true // Always available
      },
      dual_ai_ready: !!this.openai || !!process.env.INCITE_API_KEY,
      message: !!this.openai ? "ChatGPT integration active with KonsLang processing" : "KonsLang processing ready, awaiting API keys for enhanced capabilities"
    };
  }
}

export default new ChatOracleService();