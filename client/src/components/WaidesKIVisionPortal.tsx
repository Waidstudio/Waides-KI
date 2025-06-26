import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Send, Plus, Zap, TrendingUp, Eye, Sparkles, Brain, Wallet, Bot, BarChart3, MicOff, Volume2, Heart, Settings, MessageCircle } from 'lucide-react';
import { WaidesKICoreEnginePanel } from './WaidesKICoreEnginePanel';
import { WaidBotSummonPanel } from './WaidBotSummonPanel';
import getSmartAnswer, { detectCommandTrigger } from './WaidesKI_MemoryEngine';

interface ChatMessage {
  id: string;
  sender: 'user' | 'waides';
  message: string;
  timestamp: Date;
  personality?: string;
  source?: 'incite' | 'chatgpt' | 'konslang' | 'combined' | 'reasoning' | 'enhanced_bot_memory' | 'waidbot_summon' | 'oracle' | 'error';
  confidence?: number;
  konslangProcessing?: string;
  reasoning?: any[];
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
  const [chatMode, setChatMode] = useState<'auto' | 'openai' | 'spiritual' | 'oracle'>('auto');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAudioIcon, setShowAudioIcon] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'core'>('chat');
  const [showWaidBotSummon, setShowWaidBotSummon] = useState(false);
  const [lastSummonCommand, setLastSummonCommand] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [botState, setBotState] = useState<{action?: 'wallet' | 'trade' | 'price'}>({});
  
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
      // Handle reasoning responses with safety checks
      if (data && data.reasoning && Array.isArray(data.reasoning)) {
        typeMessage(data.answer || 'No response received', 'reasoning', data.confidence, undefined, data.reasoning);
      } else if (data) {
        // Handle oracle/standard responses
        typeMessage(data.answer || data.response || 'No response received', data.source, data.confidence, data.konslangProcessing);
      } else {
        typeMessage('Error: No response data received', 'error', 0);
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setIsProcessing(false);
    },
  });



  // Enhanced question answering mutation
  const questionMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await fetch('/api/waides-ki/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (!response.ok) throw new Error('Failed to answer question');
      return response.json();
    },
    onSuccess: (data) => {
      if (data && data.answer) {
        typeMessage(data.answer, 'enhanced_bot_memory', 98);
      } else {
        typeMessage('No answer received from enhanced bot memory', 'enhanced_bot_memory', 50);
      }
    },
  });

  // Reasoning mutation
  const reasoningMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/chat/reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error('Failed to get reasoning response');
      return response.json();
    },
    onSuccess: (data) => {
      if (data && data.reasoning && Array.isArray(data.reasoning)) {
        typeMessage(data.answer || 'Reasoning complete', 'reasoning', data.confidence, undefined, data.reasoning);
      } else {
        typeMessage('Reasoning analysis complete', 'reasoning', 75);
      }
    },
  });

  // Oracle mutation
  const oracleMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/chat/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error('Failed to get oracle response');
      return response.json();
    },
    onSuccess: (data) => {
      if (data && data.answer) {
        const validSource = ['incite', 'chatgpt', 'konslang', 'combined', 'reasoning'].includes(data.source) 
          ? data.source as 'incite' | 'chatgpt' | 'konslang' | 'combined' | 'reasoning' 
          : 'combined';
        typeMessage(data.answer, validSource, data.confidence, data.konslangProcessing);
      } else {
        typeMessage('Oracle consultation complete', 'combined', 80);
      }
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
      if (data && data.message) {
        typeMessage(data.message, 'waidbot_summon', data.success ? 95 : 50);
        
        // Handle navigation suggestion for WaidBot activation
        if (data.data?.navigationSuggestion === '/waidbot' && data.data?.waidbotActivated) {
          setTimeout(() => {
            typeMessage("Navigate to WaidBot interface? Type 'yes' to proceed or continue chatting here.", 'waidbot_summon', 100);
          }, 2000);
        }
      }
    },
  });

  // Voice command processing mutation
  const voiceProcessingMutation = useMutation({
    mutationFn: async (command: string) => {
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, sessionId: 'main-portal' }),
      });
      if (!response.ok) throw new Error('Failed to process voice command');
      return response.json();
    },
    onSuccess: (data) => {
      setIsVoiceProcessing(false);
      if (data.success && data.response) {
        typeMessage(`🎤 ${data.response.text}`, 'konslang', data.response.confidence || 80);
        
        // Execute action if provided
        if (data.response.action) {
          setTimeout(() => {
            typeMessage(`⚡ Executing: ${data.response.action}`, 'waidbot_summon', 90);
          }, 1000);
        }
      } else {
        typeMessage('🎤 Voice command processed', 'konslang', 70);
      }
    },
    onError: () => {
      setIsVoiceProcessing(false);
      typeMessage('🎤 Voice processing error - please try again', 'error', 0);
    }
  });

  // OpenAI Chat mutation for universal answers
  const openAIChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/chat/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error('Failed to get OpenAI response');
      return response.json();
    },
    onSuccess: (data) => {
      if (data && data.answer) {
        typeMessage(data.answer, 'chatgpt', data.confidence || 90);
      } else if (data && data.fallback) {
        typeMessage(data.fallback, 'error', 50);
      } else {
        typeMessage('AI processing complete', 'chatgpt', 85);
      }
    },
    onError: () => {
      typeMessage('Unable to access universal knowledge at the moment. Please try again.', 'error', 0);
    }
  });

  // WaidBot summon check mutation
  const summonCheckMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/chat/check-summon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error('Failed to check summon command');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.isWaidBotSummon) {
        setLastSummonCommand(data.matchedCommand);
        setShowWaidBotSummon(true);
        typeMessage(data.summonResponse, 'waidbot_summon', 100);
      }
    },
  });

  const typeMessage = (message: string, source?: 'incite' | 'chatgpt' | 'konslang' | 'combined' | 'reasoning' | 'enhanced_bot_memory' | 'waidbot_summon' | 'oracle' | 'error', confidence?: number, konslangProcessing?: string, reasoning?: any[]) => {
    // Safety check for undefined message
    if (!message || typeof message !== 'string') {
      console.warn('typeMessage called with invalid message:', message);
      return;
    }
    
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

    // Enhanced intelligent routing logic
    const message = currentMessage.toLowerCase();
    
    // First, check for WaidBot summoning commands
    summonCheckMutation.mutate(currentMessage);
    
    // WaidBot activation patterns
    const waidbotActivationPatterns = [
      'activate waidbot', 'summon waidbot', 'start waidbot', 
      'activate waid bot', 'summon waid bot', 'start waid bot'
    ];
    const isWaidbotActivation = waidbotActivationPatterns.some(pattern => message.includes(pattern));
    
    // Command patterns
    const commandPrefixes = ['activate', 'start', 'stop', 'predict', 'analyze', 'get', 'show', 'enable', 'disable'];
    const isCommand = commandPrefixes.some(prefix => message.startsWith(prefix)) || isWaidbotActivation;
    
    // Waides KI self-knowledge patterns
    const selfKnowledgePatterns = [
      'who are you', 'what are you', 'tell me about yourself', 'about waides',
      'your capabilities', 'what can you do', 'how do you work', 'your features',
      'waides ki', 'consciousness', 'spiritual', 'layers', 'brain', 'intelligence'
    ];
    const isSelfKnowledge = selfKnowledgePatterns.some(pattern => message.includes(pattern));
    
    // ETH-based question patterns
    const ethPatterns = [
      'eth', 'ethereum', 'trading', 'market', 'price', 'strategy', 'buy', 'sell',
      'investment', 'portfolio', 'blockchain', 'crypto', 'technical analysis'
    ];
    const isETHQuestion = ethPatterns.some(pattern => message.includes(pattern));

    // Enhanced routing with chat mode support
    if (isCommand) {
      commandMutation.mutate(currentMessage);
    } else {
      // Route based on chat mode
      switch (chatMode) {
        case 'openai':
          openAIChatMutation.mutate(currentMessage);
          break;
        case 'spiritual':
          // Use local Memory Engine for instant responses
          const memoryResponse = getSmartAnswer(currentMessage);
          if (memoryResponse) {
            typeMessage(memoryResponse, 'enhanced_bot_memory', 95);
          } else {
            // Fallback to server-side spiritual intelligence
            questionMutation.mutate(currentMessage);
          }
          break;
        case 'oracle':
          if (oracleEnabled) {
            oracleMutation.mutate(currentMessage);
          } else {
            openAIChatMutation.mutate(currentMessage);
          }
          break;
        default: // 'auto' mode
          // First try UKC and Memory Engine for instant responses
          const smartResponse = getSmartAnswer(currentMessage);
          if (smartResponse) {
            typeMessage(smartResponse, 'enhanced_bot_memory', 95);
          } else if (isSelfKnowledge || isETHQuestion) {
            questionMutation.mutate(currentMessage);
          } else if (reasoningMode) {
            reasoningMutation.mutate(currentMessage);
          } else if (oracleEnabled) {
            oracleMutation.mutate(currentMessage);
          } else {
            openAIChatMutation.mutate(currentMessage);
          }
          break;
      }
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
    "Who are you?",
    "What can you do?", 
    "Tell me about ETH trading",
    "Your capabilities",
    "Predict ETH now",
    "Market analysis"
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
    if (divineReading && typeof divineReading === 'object') {
      return "🧠 Waides KI Memory Full";
    }
    return "🧠 Waides KI Offline";
  };

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

  // Enhanced voice recognition for command processing
  const startVoiceCommandRecognition = () => {
    if (!speechSupported) {
      typeMessage('🎤 Voice recognition not supported in this browser', 'error', 0);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setVoiceEnabled(true);
      setIsVoiceProcessing(true);
      typeMessage('🎤 Listening for Konsmik voice command...', 'konslang', 90);
    };

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript;
      setVoiceCommand(command);
      typeMessage(`🎤 Voice detected: "${command}"`, 'konslang', 95);
      
      // Process the voice command through Waides KI
      voiceProcessingMutation.mutate(command);
    };

    recognition.onerror = (event: any) => {
      setVoiceEnabled(false);
      setIsVoiceProcessing(false);
      typeMessage(`🎤 Voice recognition error: ${event.error}`, 'error', 0);
    };

    recognition.onend = () => {
      setVoiceEnabled(false);
      if (!isVoiceProcessing) {
        typeMessage('🎤 Voice recognition complete', 'konslang', 70);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setVoiceEnabled(false);
      setIsVoiceProcessing(false);
    }
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
          
          {/* Enhanced Chat Mode Selection */}
          <div className="flex items-center gap-1 bg-gray-800/60 rounded-lg p-1">
            <Button
              onClick={() => {
                setChatMode('auto');
                setOracleEnabled(false);
                setReasoningMode(false);
              }}
              variant="ghost"
              size="sm"
              className={`text-xs px-2 py-1 ${
                chatMode === 'auto'
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              🔄 Auto
            </Button>
            <Button
              onClick={() => {
                setChatMode('openai');
                setOracleEnabled(false);
                setReasoningMode(false);
              }}
              variant="ghost"
              size="sm"
              className={`text-xs px-2 py-1 ${
                chatMode === 'openai'
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              🧠 Universal
            </Button>
            <Button
              onClick={() => {
                setChatMode('spiritual');
                setOracleEnabled(false);
                setReasoningMode(false);
              }}
              variant="ghost"
              size="sm"
              className={`text-xs px-2 py-1 ${
                chatMode === 'spiritual'
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              ✨ Spiritual
            </Button>
            <Button
              onClick={() => {
                setChatMode('oracle');
                setOracleEnabled(true);
                setReasoningMode(false);
              }}
              variant="ghost"
              size="sm"
              className={`text-xs px-2 py-1 ${
                chatMode === 'oracle'
                  ? 'bg-cyan-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              🔮 Oracle
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

          {/* Voice Control Module */}
          <div className="flex items-center gap-2 bg-gray-800/60 rounded-lg p-1">
            <Button
              onClick={voiceEnabled ? stopVoiceRecognition : startVoiceCommandRecognition}
              variant="ghost"
              size="sm"
              className={`text-xs px-3 py-1 transition-all ${
                voiceEnabled
                  ? 'bg-red-600 text-white animate-pulse'
                  : speechSupported
                  ? 'bg-green-600/80 text-white hover:bg-green-600'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!speechSupported}
            >
              {voiceEnabled ? '🎤 Listening...' : speechSupported ? '🎤 Voice' : '🎤 Not Supported'}
            </Button>
            {isVoiceProcessing && (
              <div className="text-xs text-purple-300 animate-pulse">
                Processing voice command...
              </div>
            )}
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
                {chatMode === 'auto' && (
                  <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">Auto Mode Active</span>
                    </div>
                    <p className="text-emerald-200/80">
                      Intelligent routing based on question type - spiritual, trading, or universal knowledge.
                    </p>
                  </div>
                )}
                {chatMode === 'openai' && (
                  <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300 font-medium">Universal Mode Active</span>
                    </div>
                    <p className="text-blue-200/80">
                      Direct access to universal knowledge via ChatGPT for any question or topic.
                    </p>
                  </div>
                )}
                {chatMode === 'spiritual' && (
                  <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-300 font-medium">Spiritual Mode Active</span>
                    </div>
                    <p className="text-purple-200/80">
                      Local Memory Engine providing instant spiritual responses with KonsLang wisdom and ETH trading guidance.
                    </p>
                  </div>
                )}
                {chatMode === 'oracle' && (
                  <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-300 font-medium">Oracle Mode Active</span>
                    </div>
                    <p className="text-cyan-200/80">
                      Advanced dual-AI oracle with enhanced reasoning and mystical insights.
                    </p>
                  </div>
                )}
                {reasoningMode && (
                  <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg p-3 mb-2 mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-300 font-medium">Advanced Reasoning Active</span>
                    </div>
                    <p className="text-cyan-200/80">
                      Step-by-step analysis with comprehensive system integration.
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
                
                {/* Display reasoning steps for reasoning mode */}
                {message.reasoning && message.reasoning.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs text-purple-300 font-semibold flex items-center gap-2">
                      <Brain className="w-3 h-3" />
                      Reasoning Process
                    </div>
                    {message.reasoning.map((step, index) => (
                      <div key={index} className="bg-gray-900/40 border border-purple-500/10 rounded-lg p-3">
                        <div className="text-xs text-purple-400 font-medium mb-1">
                          Step {index + 1}: {step.step}
                        </div>
                        <div className="text-sm text-gray-300 mb-2">
                          {step.analysis}
                        </div>
                        {step.data && Object.keys(step.data).length > 0 && (
                          <div className="text-xs text-gray-400 bg-gray-800/60 rounded p-2">
                            <strong>Data:</strong> {JSON.stringify(step.data, null, 2)}
                          </div>
                        )}
                        <div className="text-xs text-purple-300 mt-1">
                          Confidence: {step.confidence}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
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
                  voiceEnabled 
                    ? 'bg-red-500/20 text-red-400 animate-pulse' 
                    : speechSupported
                    ? 'hover:bg-purple-500/20 text-purple-400'
                    : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                }`}
                onClick={voiceEnabled ? stopVoiceRecognition : startVoiceCommandRecognition}
                disabled={isProcessing || !speechSupported}
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

      {/* WaidBot Summoning Panel */}
      <WaidBotSummonPanel
        isVisible={showWaidBotSummon}
        summonCommand={lastSummonCommand}
        onClose={() => setShowWaidBotSummon(false)}
      />
    </div>
  );
}