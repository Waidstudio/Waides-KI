import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Mic, Send, Brain, Wallet, TrendingUp, Eye, Sparkles, 
  MicOff, Volume2, Settings, MessageCircle, Activity,
  Moon, Sun, Shield, Database, Globe, Bell
} from 'lucide-react';
import KonsaiChat from './KonsaiChat';
import { WaidesKICoreEnginePanel } from './WaidesKICoreEnginePanel';
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
  const [activeTab, setActiveTab] = useState('chat');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 text-white font-inter relative overflow-hidden">
      
      {/* Background Effects - Original Design */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-pink-300 rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-300 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-ping opacity-50"></div>
        <div className="absolute bottom-1/3 left-1/5 w-2 h-2 bg-violet-300 rounded-full animate-pulse opacity-40"></div>
      </div>

      {/* Top Status Bar - Original Purple Theme */}
      <div className="relative z-10 flex items-center justify-center px-4 py-0.5 bg-purple-900/40 backdrop-blur-sm border-b border-pink-500/30">
        <div className="flex items-center gap-2">
          <span className="text-xs text-pink-300 font-medium">{formatTime(currentTime)}</span>
          <span className="text-xs text-indigo-400">•</span>
          <span className="text-xs text-green-400">System Health: {98.7}%</span>
          <span className="text-xs text-indigo-400">•</span>
          <span className="text-xs text-pink-400">ꠄ{smaiBalance?.toLocaleString() || '0'} SmaiSika</span>
        </div>
      </div>

      {/* Navigation Tabs - Original Purple/Pink Theme */}
      <div className="relative z-10 px-2 py-2">
        <div className="flex items-center justify-between bg-purple-900/40 backdrop-blur-sm rounded-xl border border-pink-500/30 p-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white'
                  : 'text-pink-300 hover:text-white hover:bg-purple-700/50'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              KI Chat
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                activeTab === 'wallet'
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white'
                  : 'text-pink-300 hover:text-white hover:bg-purple-700/50'
              }`}
            >
              <Wallet className="w-4 h-4 inline mr-2" />
              Heart of Waides KI
            </button>
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

      {/* Main Content Area - Flexible Full Screen Layout */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        {activeTab === 'chat' ? (
          selectedChatMode === 'konsai' ? (
            <div className="flex-1 min-h-0">
              <KonsaiChat />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Messages Area - Full Height Flexible */}
              <div className="flex-1 overflow-y-auto space-y-4 px-4 py-4 min-h-0">
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

              {/* Input Area - Fixed at Bottom */}
              <div className="flex-shrink-0 p-4 border-t border-purple-500/20">
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
          )
        ) : (
          /* Heart of Waides KI - Full Screen Flexible Interface */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Core Engine Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-pink-500/30 bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-indigo-900/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center animate-pulse">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-pink-300">Heart of Waides KI</h2>
                  <p className="text-xs text-indigo-300">Core Engine System</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-400 border-green-400 text-xs">Active</Badge>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Core Engine Content - Full Height */}
            <div className="flex-1 min-h-0">
              <WaidesKICoreEnginePanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}