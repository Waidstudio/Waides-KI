import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Mic, Send, Brain, Wallet, Eye, Sparkles, 
  MicOff, Volume2, MessageCircle,
  Moon, Sun, Shield, Database, Globe, Bell
} from 'lucide-react';
import KonsaiChat from './KonsaiChat';
import { useLocation, Link } from 'wouter';
import { useSmaiWallet } from '@/context/SmaiWalletContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface ChatMessage {
  id: number;
  content: string;
  type: string;
  timestamp: Date;
  isBot: boolean;
  confidence?: number;
}

export default function WaidesKIVisionPortal() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedChatMode, setSelectedChatMode] = useState('waides');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [konsmikMode, setKonsmikMode] = useState(false);
  
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const walletContext = useSmaiWallet();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { smaiBalance, localBalance, transactions, isLoading, fetchWalletData } = walletContext || {
    smaiBalance: 0,
    localBalance: 0,
    transactions: [],
    isLoading: false,
    fetchWalletData: () => Promise.resolve()
  };

  // Utility functions
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      content: currentMessage,
      type: 'user',
      timestamp: new Date(),
      isBot: false
    }]);
    setCurrentMessage('');
  };

  const startVoiceCommandRecognition = () => {
    setVoiceEnabled(true);
  };

  const stopVoiceRecognition = () => {
    setVoiceEnabled(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={konsmikMode ? 
      "min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 text-white font-inter relative overflow-hidden" :
      "min-h-screen bg-black text-white font-inter relative overflow-hidden"}>
      
      {/* Background Effects */}
      {konsmikMode ? (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-ping opacity-40"></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-300 rounded-full animate-pulse opacity-30"></div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.1),transparent_50%)]"></div>
        </div>
      )}

      {/* Top Status Bar */}
      <div className="relative z-10 flex items-center justify-center px-4 py-0.5 bg-gray-900/30 backdrop-blur-sm border-b border-purple-500/10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-purple-300 font-medium">{formatTime(currentTime)}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-green-400">System Health: {98.7}%</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-blue-400">ꠄ{smaiBalance?.toLocaleString() || '0'} SmaiSika</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="relative z-10 px-2 py-2">
        <div className="flex items-center justify-between bg-gray-900/30 backdrop-blur-sm rounded-xl border border-purple-500/20 p-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                activeTab === 'chat'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Chat
            </button>
            <Link 
              href="/wallet"
              className="px-4 py-2 text-sm rounded-lg transition-all text-gray-400 hover:text-white hover:bg-gray-700/50 flex items-center"
            >
              <Wallet className="w-4 h-4 inline mr-2" />
              Heart of Waides KI
            </Link>
          </div>
          
          {/* Chat Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setSelectedChatMode('waides')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                selectedChatMode === 'waides'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                <span>Waides KI</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedChatMode('konsai')}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                selectedChatMode === 'konsai'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>KonsAI</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 mx-2 mb-2 bg-black/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-4 overflow-hidden h-[calc(100vh-140px)]">
        {selectedChatMode === 'konsai' ? (
          <KonsaiChat />
        ) : (
          <div className="h-full flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-purple-600/80 scrollbar-track-gray-800/50 scroll-smooth mb-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4 animate-pulse">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-300 mb-2">Welcome to Waides KI</h3>
                  <p className="text-gray-400 max-w-md mb-4">
                    Your next-generation KI trading oracle. Ask anything about markets, strategies, or trading insights.
                  </p>
                </div>
              )}
              
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    message.isBot 
                      ? 'bg-gray-800/60 border border-purple-500/20 text-gray-100'
                      : 'bg-purple-600/80 text-white'
                  }`}>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative z-10 p-2 w-full">
              <div className="flex items-center gap-3 bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-3">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 focus:outline-none text-base"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isProcessing}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 rounded-full transition-all ${
                    voiceEnabled 
                      ? 'bg-red-500/20 text-red-400 animate-pulse' 
                      : 'hover:bg-purple-500/20 text-purple-400'
                  }`}
                  onClick={voiceEnabled ? stopVoiceRecognition : startVoiceCommandRecognition}
                  disabled={isProcessing}
                >
                  {voiceEnabled ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-all disabled:opacity-50"
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isProcessing}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}