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

  const handleQuickAction = (action: string) => {
    setShowWelcome(false);
    const actionMessages: { [key: string]: string } = {
      'generate-strategy': 'Generate a new trading strategy for ETH',
      'command-bots': 'Start all trading bots (WaidBot, WaidBot Pro, Waides Full Engine, SmaiSika Autonomous)',
      'fund-account': 'How do I fund my account with USDT?',
      'market-analysis': 'Provide current market analysis and trading insights',
      'live-trading': 'Show me current live trading status and performance',
      'ask-anything': 'I have a question about trading'
    };
    
    const message = actionMessages[action] || 'Help me with trading';
    sendMessage(message);
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
              onClick={() => handleSuggestionClick("Generate a bullish ETH strategy")}
              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/20 transition-all duration-200 font-medium hover:scale-105 hover:shadow-sm hover:shadow-emerald-500/20 backdrop-blur-sm"
            >
              ⚡ Generate Strategy
            </button>
            <button 
              onClick={() => handleSuggestionClick("Start all trading bots")}
              className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/20 transition-all duration-200 font-medium hover:scale-105 hover:shadow-sm hover:shadow-blue-500/20 backdrop-blur-sm"
            >
              🤖 Start Bots
            </button>
            <button 
              onClick={() => handleSuggestionClick("How do I fund my account?")}
              className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/20 transition-all duration-200 font-medium hover:scale-105 hover:shadow-sm hover:shadow-purple-500/20 backdrop-blur-sm"
            >
              💰 Fund Account
            </button>
            <button 
              onClick={() => handleSuggestionClick("Show me current trading performance")}
              className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/20 transition-all duration-200 font-medium hover:scale-105 hover:shadow-sm hover:shadow-cyan-500/20 backdrop-blur-sm"
            >
              📊 Trading Status
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