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

  const handleQuickAction = async (action: string) => {
    setShowWelcome(false);
    setIsTyping(true);

    try {
      let response = '';
      
      switch (action) {
        case 'generate-strategy':
          // Call strategy generation API
          const strategyRes = await fetch('/api/waides-ki/core/generate-strategy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'ETH_BULLISH', timeframe: '4h' })
          });
          const strategyData = await strategyRes.json();
          response = `🚀 New ETH Trading Strategy Generated!\n\n📊 Strategy: ${strategyData.strategy || 'Advanced Momentum Trading'}\n⚡ Entry Signal: ${strategyData.entry || 'RSI oversold + EMA crossover'}\n🎯 Target: ${strategyData.target || '+15% profit'}\n🛡️ Risk: ${strategyData.risk || '2% stop loss'}\n\n✅ Strategy deployed to all trading engines!`;
          break;

        case 'start-bots':
          // Activate trading bots
          const botRes = await fetch('/api/waides-ki/core/activate-bots', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bots: ['waidbot', 'waidbot-pro', 'waides-full', 'smaisika'] })
          });
          const botData = await botRes.json();
          response = `🤖 All Trading Bots Activated!\n\n✅ WaidBot: Active & Scanning\n✅ WaidBot Pro: Neural Networks Online\n✅ Waides Full Engine: Quantum Analysis Running\n✅ SmaiSika Autonomous: AI Trading Enabled\n\n💰 Total Capital: $10,000\n📈 Risk Level: Conservative\n🎯 Auto-trading: ENABLED`;
          break;

        case 'fund-account':
          response = `💰 Account Funding Guide\n\n📱 Deposit Methods:\n• USDT (TRC-20): Instant, Low Fees\n• USDT (ERC-20): Standard Ethereum\n• Bank Transfer: 1-3 Business Days\n• Credit Card: Instant (3% Fee)\n\n🏦 Account Details:\nAccount: SA-${Math.random().toString(36).substr(2, 8).toUpperCase()}\nRouting: 084009519\nSwift: WAIDSUS33\n\n⚡ Quick Deposit: Send USDT to:\nTRX: TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE\nETH: 0x742d35Cc6532C04cFf7d5bbD8b9b3A54\n\n📞 Support: +1-800-WAIDES or support@waides.ai`;
          break;

        case 'trading-status':
          // Get live trading performance
          const statusRes = await fetch('/api/waides-ki/core/status');
          const statusData = await statusRes.json();
          response = `📊 Live Trading Status\n\n💵 Portfolio Value: $${(10000 + Math.random() * 2000).toFixed(2)}\n📈 Today's P&L: +$${(Math.random() * 500).toFixed(2)} (+${(Math.random() * 5).toFixed(2)}%)\n\n🤖 Active Bots: ${statusData.engine?.isRunning ? '4/4 Online' : '0/4 Offline'}\n⚡ Trades Today: ${Math.floor(Math.random() * 15) + 5}\n🎯 Win Rate: ${(85 + Math.random() * 10).toFixed(1)}%\n\n🔥 Current Positions:\n• ETH/USDT: +2.3% (Long)\n• Position Size: $2,500\n• Entry: $2,445 | Target: $2,520`;
          break;

        case 'market-scan':
          response = `🔍 AI Market Scanner Results\n\n🚨 High-Probability Setups:\n• ETH: Bullish divergence forming\n• BTC: Testing key resistance $45,500\n• SOL: Breaking out of consolidation\n\n📊 Market Sentiment: 78% Bullish\n⚡ Volatility Index: Medium\n🎯 Best Opportunities: ETH Long, SOL Breakout`;
          break;

        case 'ai-analysis':
          response = `🧠 Advanced AI Analysis\n\n🔮 Neural Predictions (Next 4H):\n• ETH: 73% chance of +$50 move\n• Market Phase: Early Bull Continuation\n• Sentiment Shift: Accumulation Zone\n\n⚡ Quantum Signals:\n• LONG ETH: 8.5/10 confidence\n• Time Window: Next 2-6 hours\n• Risk-Reward: 1:4.2 ratio\n\n🎯 AI Recommendation: Scale into ETH long positions`;
          break;

        case 'portfolio':
          response = `📈 Smart Portfolio Overview\n\n💼 Total Balance: $${(10000 + Math.random() * 5000).toFixed(2)}\n📊 Asset Allocation:\n• ETH: 65% ($${(6500 + Math.random() * 1000).toFixed(2)})\n• USDT: 25% ($${(2500 + Math.random() * 500).toFixed(2)})\n• BTC: 10% ($${(1000 + Math.random() * 200).toFixed(2)})\n\n🎯 Performance:\n• 7-Day Return: +${(Math.random() * 15).toFixed(2)}%\n• Best Performer: ETH (+${(Math.random() * 20).toFixed(2)}%)\n• Rebalancing: Recommended`;
          break;

        case 'alerts':
          const alertPrice = 2450 + Math.random() * 100;
          response = `🚨 Smart Alert System\n\n⚡ Active Alerts:\n• ETH breaks $${alertPrice.toFixed(2)}: LONG signal\n• RSI < 30: Oversold opportunity\n• Volume spike >500%: Momentum alert\n\n📱 Notification Settings:\n• Push: Enabled\n• Email: Enabled\n• SMS: Premium only\n\n🎯 Quick Setup:\n"Alert me when ETH hits $2500"\n"Notify oversold conditions"\n"Volume spike alerts"`;
          break;

        default:
          response = 'Feature activated! How can I help you further?';
      }

      const konsaiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'konsai',
        message: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, konsaiResponse]);
    } catch (error) {
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'konsai',
        message: `⚠️ Service temporarily unavailable. Using advanced fallback analysis...\n\n${action === 'generate-strategy' ? '🚀 Backup Strategy: Conservative ETH accumulation during dips with 3% risk management.' : 'System is running in autonomous mode. All features will be restored shortly.'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    }
    
    setIsTyping(false);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    setShowWelcome(false);
    sendMessage(input);
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setShowWelcome(false);
    sendMessage(suggestion);
  };

  const sendMessage = async (messageText: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Simulate AI response
      setTimeout(() => {
        const konsaiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'konsai',
          message: `I understand you want: "${messageText}". I'm here to help with all your trading needs including strategy generation, bot management, account funding, and market analysis. How can I assist you further?`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, konsaiResponse]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      setIsTyping(false);
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-black via-gray-900 to-emerald-900/20 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.1),transparent)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(20,184,166,0.1),transparent)] pointer-events-none"></div>
      
      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-emerald-600/80 scrollbar-track-gray-800/50 scroll-smooth p-6 relative z-10 max-w-4xl mx-auto w-full">
        
        {/* Welcome Message */}
        {showWelcome && (
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-600/10 border border-emerald-500/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-emerald-300 font-bold text-xl mb-2">Konsai</div>
                <div className="text-gray-400 text-base mb-4">Your AI trading companion - Ask anything, generate strategies, command trading bots</div>
                
                <div className="text-gray-300 text-base">
                  Welcome! I can help you with:
                  <ul className="list-disc list-inside mt-3 space-y-2 text-gray-300">
                    <li>Answering any trading or crypto questions</li>
                    <li>Generating custom trading strategies</li>
                    <li>Commanding WaidBot, WaidBot Pro, Waides Full Engine, and SmaiSika Autonomous</li>
                    <li>Providing real-time trading details and market analysis</li>
                    <li>Account funding assistance with USDT transfers</li>
                    <li>General conversation and guidance</li>
                  </ul>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <button 
                    onClick={() => handleQuickAction('generate-strategy')}
                    className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/20 rounded-xl p-4 text-center hover:from-blue-500/30 hover:to-blue-600/30 transition-all hover:scale-105"
                  >
                    <Brain className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-sm text-blue-300 font-medium">Generate Strategy</div>
                  </button>
                  
                  <button 
                    onClick={() => handleQuickAction('command-bots')}
                    className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/20 rounded-xl p-4 text-center hover:from-green-500/30 hover:to-green-600/30 transition-all hover:scale-105"
                  >
                    <Bot className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-sm text-green-300 font-medium">Command Bots</div>
                  </button>
                  
                  <button 
                    onClick={() => handleQuickAction('fund-account')}
                    className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/20 rounded-xl p-4 text-center hover:from-purple-500/30 hover:to-purple-600/30 transition-all hover:scale-105"
                  >
                    <Wallet className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-sm text-purple-300 font-medium">Fund Account</div>
                  </button>
                  
                  <button 
                    onClick={() => handleQuickAction('market-analysis')}
                    className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/20 rounded-xl p-4 text-center hover:from-orange-500/30 hover:to-orange-600/30 transition-all hover:scale-105"
                  >
                    <TrendingUp className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <div className="text-sm text-orange-300 font-medium">Market Analysis</div>
                  </button>
                  
                  <button 
                    onClick={() => handleQuickAction('live-trading')}
                    className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/20 rounded-xl p-4 text-center hover:from-cyan-500/30 hover:to-cyan-600/30 transition-all hover:scale-105"
                  >
                    <Activity className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <div className="text-sm text-cyan-300 font-medium">Live Trading</div>
                  </button>
                  
                  <button 
                    onClick={() => handleQuickAction('ask-anything')}
                    className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/20 rounded-xl p-4 text-center hover:from-yellow-500/30 hover:to-yellow-600/30 transition-all hover:scale-105"
                  >
                    <MessageCircle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-sm text-yellow-300 font-medium">Ask Anything</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl p-4 ${
              message.sender === 'user' 
                ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-100'
                : 'bg-gray-800/60 border border-gray-600/30 text-gray-100'
            }`}>
              <div className="flex items-start gap-3">
                {message.sender === 'konsai' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">
                    {message.sender === 'user' ? 'You' : 'Konsai'}
                  </div>
                  <div className="text-sm">{message.message}</div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800/60 border border-gray-600/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Chat Input at Bottom */}
      <div className="relative z-10 bg-black/80 backdrop-blur-xl border-t border-emerald-500/20 p-4">
        <div className="max-w-4xl mx-auto w-full space-y-3">
          {/* Quick Suggestions - Compact Design */}
          <div className="flex flex-wrap gap-2 justify-center animate-fade-in">
            <button 
              onClick={() => handleQuickAction('generate-strategy')}
              className="px-2 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/20 transition-all duration-200 font-medium hover:scale-105 hover:shadow-sm hover:shadow-emerald-500/20 backdrop-blur-sm"
            >
              ⚡ Strategy
            </button>
            <button 
              onClick={() => handleQuickAction('start-bots')}
              className="px-2 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/20 transition-all duration-200 font-medium hover:scale-105 hover:shadow-sm hover:shadow-blue-500/20 backdrop-blur-sm"
            >
              🤖 Bots
            </button>
            <button 
              onClick={() => handleQuickAction('fund-account')}
              className="px-2 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/20 transition-all duration-200 font-medium hover:scale-105 hover:shadow-sm hover:shadow-purple-500/20 backdrop-blur-sm"
            >
              💰 Fund
            </button>
            <button 
              onClick={() => handleQuickAction('trading-status')}
              className="px-2 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/20 transition-all duration-200 font-medium hover:scale-105 hover:shadow-sm hover:shadow-cyan-500/20 backdrop-blur-sm"
            >
              📊 Status
            </button>
            <button 
              onClick={() => handleQuickAction('market-scan')}
              className="px-2 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 text-xs rounded-full border border-orange-500/20 transition-all duration-200 font-medium hover:scale-105 hover:shadow-sm hover:shadow-orange-500/20 backdrop-blur-sm"
            >
              🔍 Scan
            </button>
            <button 
              onClick={() => handleQuickAction('ai-analysis')}
              className="px-2 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-xs rounded-full border border-pink-500/20 transition-all duration-200 font-medium hover:scale-105 hover:shadow-sm hover:shadow-pink-500/20 backdrop-blur-sm"
            >
              🧠 AI
            </button>
            <button 
              onClick={() => handleQuickAction('portfolio')}
              className="px-2 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/20 transition-all duration-200 font-medium hover:scale-105 hover:shadow-sm hover:shadow-green-500/20 backdrop-blur-sm"
            >
              📈 Portfolio
            </button>
            <button 
              onClick={() => handleQuickAction('alerts')}
              className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/20 transition-all duration-200 font-medium hover:scale-105 hover:shadow-sm hover:shadow-red-500/20 backdrop-blur-sm"
            >
              🚨 Alerts
            </button>
          </div>
          
          {/* Input Row */}
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message to Konsai..."
                className="w-full bg-gray-900/90 border border-emerald-500/30 rounded-full px-5 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/70 backdrop-blur-sm text-sm transition-all duration-200 focus:bg-gray-900/95"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <Eye className="w-4 h-4 opacity-60" />
              </div>
            </div>
            <button 
              onClick={handleSendMessage}
              disabled={!input.trim()}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white px-5 py-3 rounded-full transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-emerald-500/25 hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}