import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Send, Plus, Zap, TrendingUp, Eye, Sparkles, Brain, Wallet, Bot, BarChart3, MicOff, Volume2, Heart, Settings } from 'lucide-react';
import { WaidesKICoreEnginePanel } from './WaidesKICoreEnginePanel';

interface ChatMessage {
  id: string;
  sender: 'user' | 'waides';
  message: string;
  timestamp: Date;
  personality?: string;
  source?: 'incite' | 'chatgpt' | 'konslang' | 'combined';
  confidence?: number;
  konslangProcessing?: string;
}

interface OracleResponse {
  answer: string;
  source: 'incite' | 'chatgpt' | 'konslang' | 'combined';
  confidence: number;
  konslangProcessing?: string;
}

interface OracleStatus {
  api_status: {
    chatgpt: boolean;
    incite: boolean;
    konslang: boolean;
  };
  dual_ai_ready: boolean;
  message: string;
}

export default function WaidesKIVisionPortal() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingMessage, setCurrentTypingMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [oracleEnabled, setOracleEnabled] = useState(false);
  const [reasoningMode, setReasoningMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAudioIcon, setShowAudioIcon] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'core'>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const queryClient = useQueryClient();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: oracleStatus } = useQuery({
    queryKey: ['/api/chat/oracle/status'],
    refetchInterval: 30000,
  });

  const { data: divineReading, isLoading: isDivineLoading } = useQuery({
    queryKey: ['/api/divine-reading'],
    refetchInterval: 12000,
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      let endpoint = '/api/chat';
      if (reasoningMode) {
        endpoint = '/api/chat/reasoning';
      } else if (oracleEnabled) {
        endpoint = '/api/chat/oracle';
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: (data: any) => {
      // Handle reasoning responses
      if (data.reasoning && Array.isArray(data.reasoning)) {
        typeMessage(data.answer, 'reasoning', data.confidence, undefined, data.reasoning);
      } else {
        // Handle oracle/standard responses
        typeMessage(data.answer, data.source, data.confidence, data.konslangProcessing);
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setIsProcessing(false);
    },
  });

  // Command execution mutation
  const commandMutation = useMutation({
    mutationFn: async (command: string) => {
      const response = await fetch('/api/commands/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      if (!response.ok) throw new Error('Failed to execute command');
      return response.json();
    },
    onSuccess: (data) => {
      typeMessage(data.response, 'combined', 95);
    },
  });

  const typeMessage = (message: string, source?: string, confidence?: number, konslangProcessing?: string, reasoning?: any[]) => {
    setIsTyping(true);
    setCurrentTypingMessage('');
    
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < message.length) {
        setCurrentTypingMessage(prev => prev + message[index]);
        index++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'waides',
          message,
          timestamp: new Date(),
          source,
          confidence,
          konslangProcessing,
          reasoning
        };
        
        setMessages(prev => [...prev, newMessage]);
        setCurrentTypingMessage('');
        setIsProcessing(false);
        setShowAudioIcon(true);
        setTimeout(() => setShowAudioIcon(false), 3000);
      }
    }, 30);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: currentMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Check if it's a command
    const commandPrefixes = ['activate', 'start', 'stop', 'predict', 'analyze', 'get', 'show', 'enable', 'disable'];
    const isCommand = commandPrefixes.some(prefix => currentMessage.toLowerCase().startsWith(prefix));

    if (isCommand) {
      commandMutation.mutate(currentMessage);
    } else {
      chatMutation.mutate(currentMessage);
    }

    setCurrentMessage('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
    setTimeout(() => sendMessage(), 100);
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCurrentMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const suggestions = [
    "Create strategy",
    "Predict ETH now", 
    "Ask vision",
    "Market analysis",
    "Auto trade",
    "Check balance"
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getMemoryStatus = () => {
    if (isDivineLoading) return "🧠 Waides KI Loading...";
    if (divineReading?.ethData) return "🧠 Waides KI Memory Full";
    return "🧠 Waides KI Offline";
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTypingMessage]);

  return (
    <div className="min-h-screen bg-black text-white font-inter relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.1),transparent_50%)]"></div>
      </div>

      {/* Top Status Bar */}
      <div className="relative z-10 flex justify-between items-center p-4 bg-gray-900/50 backdrop-blur-sm border-b border-purple-500/20">
        <span className="text-lg font-bold text-purple-300">{formatTime(currentTime)}</span>
        <div className="flex items-center gap-4">
          {/* Tab Navigation */}
          <div className="flex bg-gray-800/60 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Chat
              </div>
            </button>
            <button
              onClick={() => setActiveTab('core')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'core'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Heart of Waides Ki
              </div>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{getMemoryStatus()}</span>
          
          {/* Chat Mode Selection */}
          <div className="flex items-center gap-1 bg-gray-800/60 rounded-lg p-1">
            <Button
              onClick={() => {
                setOracleEnabled(false);
                setReasoningMode(false);
              }}
              variant="ghost"
              size="sm"
              className={`text-xs px-2 py-1 ${
                !oracleEnabled && !reasoningMode
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              Standard
            </Button>
            <Button
              onClick={() => {
                setOracleEnabled(true);
                setReasoningMode(false);
              }}
              variant="ghost"
              size="sm"
              className={`text-xs px-2 py-1 ${
                oracleEnabled && !reasoningMode
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              Oracle ✦
            </Button>
            <Button
              onClick={() => {
                setOracleEnabled(false);
                setReasoningMode(true);
              }}
              variant="ghost"
              size="sm"
              className={`text-xs px-2 py-1 ${
                reasoningMode
                  ? 'bg-cyan-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              Reasoning 🧠
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' && (
        <>
          {/* Chat Suggestions */}
          <div className="relative z-10 flex flex-wrap gap-2 p-4">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="bg-gray-800/60 border-gray-600 text-gray-300 hover:bg-gray-700/60 hover:text-white text-xs rounded-lg backdrop-blur-sm"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="relative z-10 flex-1 mx-4 mb-4 bg-black/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 h-[calc(100vh-300px)] overflow-hidden">
        <div className="h-full overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4 animate-pulse">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-300 mb-2">Welcome to Waides KI</h3>
              <p className="text-gray-400 max-w-md mb-4">
                Your next-generation AI trading oracle. Ask anything about markets, strategies, or trading insights.
              </p>
              <div className="text-sm text-gray-500">
                {reasoningMode && (
                  <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-300 font-medium">Advanced Reasoning Mode Active</span>
                    </div>
                    <p className="text-cyan-200/80">
                      I'll think step-by-step, gather information from all connected systems, and provide comprehensive analysis.
                    </p>
                  </div>
                )}
                {oracleEnabled && !reasoningMode && (
                  <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-300 font-medium">Oracle Mode Active</span>
                    </div>
                    <p className="text-purple-200/80">
                      Connected to dual AI systems for enhanced mystical and technical insights.
                    </p>
                  </div>
                )}
                {!oracleEnabled && !reasoningMode && (
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300 font-medium">Standard Chat Mode</span>
                    </div>
                    <p className="text-blue-200/80">
                      Basic spiritual chat interface with KonsLang wisdom and trading guidance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800/60 border border-purple-500/20 text-gray-100'
              }`}>
                {message.sender === 'waides' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Brain className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-purple-300 font-medium">
                      Waides KI {message.source && `• ${message.source.toUpperCase()}`}
                      {message.confidence && ` • ${message.confidence}%`}
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{message.message}</p>
                {message.konslangProcessing && (
                  <div className="mt-2 text-xs text-purple-400 italic">
                    🔮 {message.konslangProcessing}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-4 rounded-2xl bg-gray-800/60 border border-purple-500/20 text-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center animate-pulse">
                    <Brain className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs text-purple-300 font-medium">Waides KI is thinking...</span>
                  {showAudioIcon && <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" />}
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {currentTypingMessage}
                  <span className="animate-pulse">|</span>
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

          {/* Chat Input */}
          <div className="relative z-10 p-4">
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
                  isListening 
                    ? 'bg-red-500/20 text-red-400 animate-pulse' 
                    : 'hover:bg-purple-500/20 text-purple-400'
                }`}
                onClick={startVoiceRecognition}
                disabled={isProcessing}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
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
        </>
      )}

      {/* Heart of Waides Ki Core Engine */}
      {activeTab === 'core' && (
        <div className="relative z-10 flex-1 mx-4 mb-4 h-[calc(100vh-200px)] overflow-hidden">
          <WaidesKICoreEnginePanel />
        </div>
      )}

      {/* Action Menu */}
      <div className="relative z-10 mx-4 mb-4">
        <Card className="bg-gray-900/60 backdrop-blur-sm border-purple-500/30 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-purple-300 text-sm">Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                className="h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => handleSuggestionClick("Predict ETH price for next hour")}
              >
                <TrendingUp className="w-5 h-5 mb-1" />
                <span>Predict ETH</span>
              </button>
              
              <button
                className="h-16 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => handleSuggestionClick("Activate autonomous trading mode")}
              >
                <Zap className="w-5 h-5 mb-1" />
                <span>Auto Trade</span>
              </button>
              
              <button
                className="h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/autonomous-wealth'}
              >
                <Wallet className="w-5 h-5 mb-1" />
                <span>SmaiWallet</span>
              </button>
              
              <button
                className="h-16 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/dashboard'}
              >
                <BarChart3 className="w-5 h-5 mb-1" />
                <span>Dashboard</span>
              </button>
              
              <button
                className="h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/waidbot'}
              >
                <Bot className="w-5 h-5 mb-1" />
                <span>WaidBot</span>
              </button>
              
              <button
                className="h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/waidbot-pro'}
              >
                <Brain className="w-5 h-5 mb-1" />
                <span>WaidBot Pro</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}