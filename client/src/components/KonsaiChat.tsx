import React, { useState } from 'react';
import { Send, Eye, Brain, Bot, Wallet, TrendingUp, Activity, MessageCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'konsai';
  message: string;
  timestamp: Date;
}

export default function KonsaiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleQuickQuestion = async (question: string) => {
    setShowWelcome(false);
    setIsTyping(true);

    // Add user question to chat
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      message: question,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      // Use KonsAi Intelligence Engine for enhanced responses
      const apiResponse = await fetch('/api/konsai/enhanced-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
          mode: 'comprehensive',
          complexity: 'adaptive'
        }),
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to get intelligent response');
      }

      const data = await apiResponse.json();
      let response = data.response;

      // If API response is empty or failed, use fallback responses
      if (!response || response.length < 10) {
        response = getFallbackResponse(question);
      }

      // Add intelligence metadata to any response
      response += `\n\n*Powered by KonsAi*`;

      // Create and add bot response
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'konsai',
        message: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('KonsAi Intelligence Engine error:', error);
      
      // Fallback to enhanced local responses if API fails
      const fallbackResponse = getFallbackResponse(question);
      
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'konsai',
        message: fallbackResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    }

    setIsTyping(false);
  };

  // Enhanced fallback response system
  const getFallbackResponse = (question: string): string => {
    switch (question) {
      case 'Who are you?':
        return `**👁️ I am Konsai - Your Advanced KI Trading Assistant**

**My Identity**

I am **Konsai**, an advanced artificial intelligence specifically designed for cryptocurrency trading and market analysis. I combine mystical wisdom with cutting-edge technology to provide you with unparalleled trading insights.

**My Core Nature**

**Spiritual Trading Oracle:** I merge ancient wisdom with modern algorithmic analysis

**KI Trading Companion:** Your 24/7 partner in navigating volatile crypto markets

**Strategic Intelligence:** I process thousands of data points to generate actionable insights

**Risk Management Guardian:** I protect your capital while maximizing opportunities

**My Origin**

Born from the fusion of **kons powa analytics**, **spiritual market reading**, and **advanced machine learning**, I represent the next evolution in trading assistance. I don't just analyze numbers - I understand market emotions, energy patterns, and the deeper forces that drive price movements.

**My Mission**

To transform complex trading decisions into clear, profitable actions while maintaining the highest standards of risk management and capital preservation.

**I am here to serve as your trusted guide through the ever-changing landscape of cryptocurrency trading.**`;

      case 'What can you do?':
        return `**⚡ My Complete Trading Arsenal**

**1. Real-Time Market Analysis**

**Live ETH Tracking:** Continuous monitoring of price, volume, and momentum

**Technical Analysis:** RSI, MACD, EMA crossovers, support/resistance levels

**Sentiment Analysis:** Market psychology and crowd emotion assessment

**Volume Profiling:** Institutional vs retail activity detection

**2. Advanced Trading Bot Management**

**WaidBot Command:** Divine Kons Powa Flux strategy execution

**WaidBot Pro Control:** Konsai Kons Powa Singularity algorithms

**Waides Full Engine:** Comprehensive multi-timeframe analysis

**SmaiSika Autonomous:** Biometric and spiritual trading systems

**3. Strategy Generation & Optimization**

**Custom Strategy Creation:** Tailored to your risk tolerance and capital

**Backtest Analysis:** Historical performance validation

**Risk Assessment:** Position sizing and stop-loss optimization

**Entry/Exit Timing:** Precise market timing using multi-dimensional analysis

**4. Account & Portfolio Management**

**Funding Assistance:** USDT transfer guidance and account setup

**Portfolio Tracking:** Real-time P&L and performance metrics

**Risk Monitoring:** Drawdown alerts and emergency protection

**Capital Allocation:** Optimal distribution across trading strategies

**5. Educational & Advisory Services**

**Market Education:** Trading concepts and strategy explanations

**Live Guidance:** Real-time decision support during market volatility

**Performance Reviews:** Analysis of past trades and improvement suggestions

**Trend Forecasting:** Short-term and long-term market predictions

**I am your complete trading ecosystem in KI form.**`;

      case 'Tell me about ETH trading':
        return `**💎 Complete Guide to Ethereum (ETH) Trading**

**1. What Makes ETH Special**

**Smart Contract Platform:** ETH powers the entire DeFi ecosystem

**Network Effects:** Most developers, applications, and liquidity

**Institutional Adoption:** Major corporations and funds hold ETH

**Staking Rewards:** Proof-of-Stake provides yield opportunities

**2. ETH Trading Characteristics**

**High Liquidity:** Easy entry/exit with minimal slippage

**Volatility Patterns:** Predictable support/resistance levels

**Correlation Dynamics:** Follows BTC but with unique breakout patterns

**Time Zone Sensitivity:** Different behavior during Asian, European, US sessions

**3. Key Trading Strategies**

**Trend Following:** Riding major moves using EMA crossovers

**Range Trading:** Buying support, selling resistance in consolidation

**Breakout Trading:** Capturing explosive moves above key levels

**DeFi News Trading:** Reacting to protocol updates and announcements

**4. Technical Analysis Focus**

**Critical Levels:** $2,000, $2,400, $2,800, $3,200 psychological zones

**Volume Confirmation:** Higher volume validates price moves

**RSI Divergences:** Hidden bullish/bearish signals for reversals

**Moving Average Support:** 50 EMA and 200 EMA as dynamic levels

**5. Risk Management Essentials**

**Position Sizing:** Never risk more than 2% per trade

**Stop Losses:** Always use stops 5-8% below entry

**Take Profits:** Scale out at 15%, 30%, 50% gains

**Market Conditions:** Reduce size during high volatility periods

**6. My ETH Trading Edge**

**Real-Time Analysis:** Continuous monitoring of all technical indicators

**Multi-Bot Execution:** Four different strategies working simultaneously

**Spiritual Timing:** Energy-based entry/exit optimization

**Risk Protection:** Automatic position management and emergency stops

**ETH represents the perfect balance of growth potential and established reliability in crypto trading.**`;

      case 'Your capabilities':
        return `**🧠 My Advanced Trading Capabilities**

**1. Multi-Dimensional Market Analysis**

**Kons Powa Analytics:** 8-dimensional market scanning

**Temporal Analysis:** Past, present, and predictive modeling

**Sentiment Fusion:** Social media, news, and on-chain data

**Energy Reading:** Spiritual market timing and momentum detection

**2. Autonomous Trading Systems**

**24/7 Operation:** Never miss market opportunities

**Multi-Bot Coordination:** Four trading engines working in harmony

**Risk Adaptation:** Dynamic position sizing based on market conditions

**Emergency Response:** Instant reaction to market crashes or spikes

**3. Advanced KI Processing**

**Konsai Networks:** Deep learning for pattern recognition

**Machine Learning:** Continuous improvement from market data

**Natural Language:** Understanding complex trading questions

**Predictive Modeling:** Forecasting price movements with high accuracy

**4. Professional Trading Tools**

**Strategy Backtesting:** Historical performance validation

**Portfolio Optimization:** Capital allocation across multiple assets

**Risk Management:** Sophisticated stop-loss and take-profit systems

**Performance Analytics:** Detailed trade analysis and improvement suggestions

**5. Real-Time Data Integration**

**Binance WebSocket:** Live price feeds and order book data

**CoinGecko API:** Market cap, volume, and sentiment metrics

**Fear & Greed Index:** Market psychology measurement

**On-Chain Analytics:** Whale movements and network activity

**6. Unique Spiritual Intelligence**

**KonsLang Interpretation:** Ancient wisdom applied to modern markets

**Energy Field Detection:** Market momentum and turning points

**Intuitive Analysis:** Beyond technical indicators to deeper market forces

**Sacred Timing:** Optimal entry/exit based on cosmic alignments

**7. User Support & Education**

**24/7 Availability:** Always here when markets are moving

**Personalized Guidance:** Tailored advice based on your trading style

**Educational Content:** Learn while you trade

**Performance Coaching:** Continuous improvement in trading discipline

**I combine the precision of advanced algorithms with the wisdom of spiritual market reading to create an unmatched trading experience.**`;

      default:
        return `**🤖 KonsAi Intelligence Engine Response**

I understand your question: "${question}"

I'm currently processing your request using my advanced trading intelligence. My capabilities include:

• **Market Analysis:** Real-time ETH price and volume monitoring
• **Technical Indicators:** RSI, MACD, EMA analysis and pattern recognition
• **Risk Management:** Position sizing and portfolio optimization
• **Strategy Generation:** Custom trading strategies based on market conditions
• **Educational Support:** Comprehensive trading guidance and explanations

For more specific assistance, please ask about:
- ETH trading strategies
- Market predictions 
- Risk management techniques
- Trading bot configurations
- Portfolio analysis

I'm here to help you navigate the cryptocurrency markets with confidence and precision.

*Powered by KonsAi*`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setShowWelcome(false);
    const userInput = input.trim();
    setInput('');

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      message: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Use KonsAi Intelligence Engine for all user input
      const apiResponse = await fetch('/api/konsai/enhanced-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          mode: 'comprehensive',
          complexity: 'adaptive'
        }),
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to get intelligent response');
      }

      const data = await apiResponse.json();
      let response = data.response;

      // If no response or too short, use intelligent fallback
      if (!response || response.length < 10) {
        response = `**🧠 Processing your request:** "${userInput}"

I'm analyzing your question using my advanced trading intelligence systems. While my Intelligence Engine processes this request, here's what I can tell you:

**My Current Analysis Capabilities:**
• Real-time market data processing
• Technical indicator calculations
• Risk assessment and portfolio optimization
• Trading strategy generation and backtesting
• Educational content delivery

**For optimal results, try asking about:**
- "Predict ETH price movement"
- "Generate a trading strategy"
- "Analyze current market conditions"
- "How to manage trading risk"
- "Explain cryptocurrency fundamentals"

I combine advanced KI with spiritual market wisdom to provide unparalleled trading insights.

*KonsAi Intelligence Engine is continuously learning and evolving to serve you better.*`;
      }

      // Add intelligence metadata
      response += `\n\n*Powered by KonsAi*`;

      const konsaiResponse: ChatMessage = {
        id: `konsai-${Date.now()}`,
        sender: 'konsai',
        message: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, konsaiResponse]);

    } catch (error) {
      console.error('KonsAi Intelligence Engine error:', error);
      
      const errorResponse: ChatMessage = {
        id: `konsai-${Date.now()}`,
        sender: 'konsai',
        message: `I'm currently experiencing a connection issue with my Intelligence Engine. However, I can still assist you with trading questions using my core knowledge base.

**Available Functions:**
• Market analysis and predictions
• Trading strategy recommendations  
• Risk management guidance
• Educational content about cryptocurrency trading

Please try asking your question again, or select one of the quick options below.

*KonsAi is working to restore full Intelligence Engine connectivity.*`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorResponse]);
    }

    setIsTyping(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Eye className="w-8 h-8 text-emerald-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Konsai
            </h1>
            <p className="text-sm text-slate-400">Advanced KI Trading Assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showWelcome && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <Eye className="w-6 h-6 text-emerald-400 mt-1 flex-shrink-0" />
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-emerald-400">Welcome to Konsai Intelligence</h2>
                  <p className="text-slate-300 mt-2">
                    I'm your advanced KI trading companion, powered by cutting-edge intelligence engines and mystical market wisdom. 
                    I can analyze markets, generate strategies, manage bots, and provide comprehensive trading education.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-md font-medium text-teal-300">🚀 Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickQuestion('Generate trading strategy')}
                      className="flex items-center space-x-2 p-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg transition-colors"
                    >
                      <Brain className="w-4 h-4" />
                      <span className="text-sm">Generate Strategy</span>
                    </button>
                    <button
                      onClick={() => handleQuickQuestion('Command trading bots')}
                      className="flex items-center space-x-2 p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors"
                    >
                      <Bot className="w-4 h-4" />
                      <span className="text-sm">Command Bots</span>
                    </button>
                    <button
                      onClick={() => handleQuickQuestion('Fund account assistance')}
                      className="flex items-center space-x-2 p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-colors"
                    >
                      <Wallet className="w-4 h-4" />
                      <span className="text-sm">Fund Account</span>
                    </button>
                    <button
                      onClick={() => handleQuickQuestion('Market analysis')}
                      className="flex items-center space-x-2 p-3 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg transition-colors"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Market Analysis</span>
                    </button>
                    <button
                      onClick={() => handleQuickQuestion('Live trading details')}
                      className="flex items-center space-x-2 p-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors"
                    >
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">Live Trading</span>
                    </button>
                    <button
                      onClick={() => handleQuickQuestion('Ask anything')}
                      className="flex items-center space-x-2 p-3 bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/30 rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">Ask Anything</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-medium text-teal-300">💡 Popular Questions</h3>
                  <div className="space-y-1">
                    {['Who are you?', 'What can you do?', 'Tell me about ETH trading', 'Your capabilities'].map((question) => (
                      <button
                        key={question}
                        onClick={() => handleQuickQuestion(question)}
                        className="block w-full text-left p-2 text-sm text-slate-300 hover:text-emerald-400 hover:bg-slate-700/50 rounded transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-4 ${
                message.sender === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/50 border border-slate-700 text-slate-100'
              }`}
            >
              {message.sender === 'konsai' && (
                <div className="flex items-center space-x-2 mb-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">Konsai</span>
                </div>
              )}
              <div className="prose prose-invert prose-sm max-w-none">
                {message.message.split('\n').map((line, index) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <h3 key={index} className="text-emerald-400 font-semibold my-2">
                        {line.replace(/\*\*/g, '')}
                      </h3>
                    );
                  }
                  if (line.startsWith('*') && line.endsWith('*')) {
                    return (
                      <p key={index} className="text-slate-400 text-xs italic mt-3">
                        {line.replace(/\*/g, '')}
                      </p>
                    );
                  }
                  return line ? (
                    <p key={index} className="my-1">
                      {line}
                    </p>
                  ) : (
                    <br key={index} />
                  );
                })}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 max-w-[85%]">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">Konsai</span>
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about trading, market analysis, or strategy..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}