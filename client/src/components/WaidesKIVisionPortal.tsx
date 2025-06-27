import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Main KonsAi Vision Portal - Pure chat interface
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mic, Send, Plus, Zap, TrendingUp, Eye, Sparkles, Brain, Wallet, Bot, BarChart3, 
  MicOff, Volume2, VolumeX, Heart, Settings, MessageCircle, User, Activity, 
  Moon, Sun, Waves, Star, Circle, Triangle, Square, Shield, Database, Globe,
  Lock, Code, Fingerprint, Lightbulb, Target, Clock, Gamepad2, Layers,
  TreePine, RefreshCw, Skull, Crosshair, Users, Network, GitBranch,
  FlaskConical, TestTube, Router, Command, FileText, Cog
} from 'lucide-react';
import { WaidesKICoreEnginePanel } from './WaidesKICoreEnginePanel';
import { WaidBotSummonPanel } from './WaidBotSummonPanel';
import KonsaiChat from './KonsaiChat';

import { useLocation } from 'wouter';
import getSmartAnswer, { detectCommandTrigger, detectPageRecommendation } from './WaidesKI_MemoryEngine.js';
import { useSmaiWallet } from '@/context/SmaiWalletContext';
import { useToast } from '@/hooks/use-toast';

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
}

interface DivineSignal {
  action: 'BUY LONG' | 'SELL SHORT' | 'NO TRADE' | 'OBSERVE';
  timeframe: string;
  reason: string;
  moralPulse: 'CLEAN' | 'FEARFUL' | 'GREEDY' | 'DECEPTIVE';
  strategy: 'SCALP' | 'MOMENTUM' | 'HOLD' | 'WAIT';
  signalCode: string;
  receivedAt: string;
  konsTitle: string;
  energeticPurity: number;
  konsMirror: 'PURE WAVE' | 'SHADOW WAVE';
  breathLock: boolean;
  ethWhisperMode: boolean;
  autoCancelEvil: boolean;
  smaiPredict: {
    nextHourDirection: 'UP' | 'DOWN' | 'SIDEWAYS';
    confidence: number;
    predictedPriceRange: { min: number; max: number };
  };
}

interface DivineResponse {
  divineSignal: DivineSignal;
  hierarchyStatus: any;
  ethPrice: number;
  timestamp: string;
  dual_ai_ready: boolean;
  message: string;
}

export default function WaidesKIVisionPortal() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingMessage, setCurrentTypingMessage] = useState('');
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [konsaiInput, setKonsaiInput] = useState('');

  // Konsai chat handlers
  const handleQuickAction = (action: string) => {
    setShowWelcomeMessage(false);
    const actionMessages: { [key: string]: string } = {
      'generate-strategy': 'Generate a new trading strategy for ETH',
      'command-bots': 'Start all trading bots (WaidBot, WaidBot Pro, Waides Full Engine, SmaiSika Autonomous)',
      'fund-account': 'How do I fund my account with USDT?',
      'market-analysis': 'Provide current market analysis and trading insights',
      'live-trading': 'Show me current live trading status and performance',
      'ask-anything': 'I have a question about trading'
    };
    
    const message = actionMessages[action] || 'Help me with trading';
    handleSendKonsaiMessage(message);
  };

  const handleSendMessage = () => {
    if (!konsaiInput.trim()) return;
    setShowWelcomeMessage(false);
    handleSendKonsaiMessage(konsaiInput);
    setKonsaiInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setShowWelcomeMessage(false);
    handleSendKonsaiMessage(suggestion);
  };

  const handleSendKonsaiMessage = async (messageText: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Simulate AI response for now
      setTimeout(() => {
        const konsaiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'waides',
          message: `I understand you want: "${messageText}". I'm here to help with all your trading needs including strategy generation, bot management, account funding, and market analysis. How can I assist you further?`,
          timestamp: new Date(),
          source: 'incite'
        };
        
        setMessages(prev => [...prev, konsaiResponse]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      setIsTyping(false);
      console.error('Error sending message:', error);
    }
  };
  const [isListening, setIsListening] = useState(false);
  const [oracleEnabled, setOracleEnabled] = useState(false);
  const [reasoningMode, setReasoningMode] = useState(false);
  
  // Wallet context integration
  const walletContext = useSmaiWallet();
  const [chatMode, setChatMode] = useState<'auto' | 'openai' | 'spiritual' | 'oracle'>('auto');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAudioIcon, setShowAudioIcon] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'core' | 'konsai'>('chat');
  const [showWaidBotSummon, setShowWaidBotSummon] = useState(false);
  const [lastSummonCommand, setLastSummonCommand] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  
  // Pure KonsAi chat interface
  
  // Cosmic AI Enhancement States
  const [aiPersonality, setAiPersonality] = useState({
    mode: 'spiritual' as 'spiritual' | 'analytical' | 'creative' | 'balanced',
    energyLevel: 85,
    responsiveness: 90,
    depth: 95
  });
  const [voiceSettings, setVoiceSettings] = useState({
    pitch: 1,
    rate: 1,
    volume: 1,
    enabled: false
  });
  const [cosmicMode, setCosmicMode] = useState(false);
  const [cosmicTheme, setCosmicTheme] = useState<'nebula' | 'starfield' | 'galaxy'>('nebula');
  const [energyLevel, setEnergyLevel] = useState(75);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [showKonsPrediction, setShowKonsPrediction] = useState(false);
  
  // Autonomous Trading State
  const [isAutonomousActive, setIsAutonomousActive] = useState(false);
  const [autonomousStats, setAutonomousStats] = useState<any>(null);
  const [showAutonomousPanel, setShowAutonomousPanel] = useState(false);
  
  const [botState, setBotState] = useState<{
    action?: 'wallet' | 'trade' | 'price' | 'open-page' | 'behavior-suggestion' | 'flow' | 'bot-setup';
    page?: string;
    route?: string;
    description?: string;
    flow?: any;
    steps?: string[];
    config?: any;
    recommendations?: string[];
  }>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const queryClient = useQueryClient();

  const { smaiBalance, localBalance, transactions, canAffordTrade } = useSmaiWallet();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Handle page navigation from recommendations
  const handlePageNavigation = (route: string) => {
    setLocation(route);
  };

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Initialize speech synthesis and recognition
  useEffect(() => {
    // Speech synthesis initialization
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }

    // Speech recognition initialization  
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceCommand('');
      };

      recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript;
        setVoiceCommand(command);
        setCurrentMessage(command);
        setIsVoiceProcessing(true);
        
        // Process voice command
        voiceProcessingMutation.mutate(command);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsVoiceProcessing(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Cosmic AI speech synthesis function
  const speakMessage = (text: string) => {
    if (!speechSynthesis || !voiceSettings.enabled) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = voiceSettings.pitch;
    utterance.rate = voiceSettings.rate;
    utterance.volume = voiceSettings.volume;
    
    // Choose voice based on AI personality
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || voice.name.includes('Google')
      ) || voices[0];
      utterance.voice = preferredVoice;
    }
    
    speechSynthesis.speak(utterance);
  };

  // Enhanced typeMessage with cosmic features
  const typeMessageCosmic = (message: string, source?: string, confidence?: number, konslangProcessing?: string, reasoning?: any[]) => {
    // Safety check for undefined message
    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.warn('typeMessage called with invalid message:', message);
      message = 'I am here to assist you with ETH trading and spiritual guidance. How may I help you?';
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
          source: source as any,
          confidence,
          konslangProcessing,
          reasoning
        };
        
        setMessages(prev => [...prev, newMessage]);
        setCurrentTypingMessage('');
        setIsProcessing(false);
        setShowAudioIcon(true);
        setTimeout(() => setShowAudioIcon(false), 3000);

        // Speak message if voice is enabled
        if (voiceSettings.enabled) {
          speakMessage(message);
        }
      }
    }, cosmicMode ? 15 : 30); // Faster typing in cosmic mode
  };

  const { data: oracleStatus } = useQuery({
    queryKey: ['/api/chat/oracle/status'],
    refetchInterval: 30000,
  });

  const { data: divineReading, isLoading: isDivineLoading } = useQuery({
    queryKey: ['/api/divine-reading'],
    refetchInterval: 12000,
  });

  // Kons Powa ETH Prediction Query - fetched only when needed
  const { data: konsPrediction, isLoading: isKonsPredictionLoading, refetch: refetchKonsPrediction } = useQuery<DivineResponse>({
    queryKey: ['/api/divine-signal'],
    enabled: false, // Only fetch when explicitly requested
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
        typeMessage('I understand your message. How may I assist you with ETH trading, market analysis, or spiritual guidance?', 'enhanced_bot_memory', 85);
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error('Question answering error:', error);
      typeMessage('I am here to help you. Please ask me about ETH trading, price predictions, wallet management, or spiritual guidance.', 'enhanced_bot_memory', 80);
      setIsProcessing(false);
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
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error('Reasoning error:', error);
      typeMessage('I understand your request. Let me help you with ETH analysis and trading insights.', 'enhanced_bot_memory', 80);
      setIsProcessing(false);
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
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error('Oracle error:', error);
      typeMessage('I am here to provide spiritual and technical guidance. How may I assist you with ETH trading or market insights?', 'enhanced_bot_memory', 85);
      setIsProcessing(false);
    },
  });

  // Command execution mutation
  const commandMutation = useMutation({
    mutationFn: async (command: string) => {
      // Check if this is a local command first (wallet navigation)
      const commandResponse = detectCommandTrigger(command.toLowerCase(), setBotState);
      if (commandResponse) {
        return { message: commandResponse, success: true, local: true };
      }
      
      // Otherwise, send to server
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
      } else {
        typeMessage('Command processed', 'waidbot_summon', 75);
      }
    },
    onError: (error) => {
      console.error('Command error:', error);
      typeMessage('Failed to execute command', 'error', 0);
      setIsProcessing(false);
    }
  });

  // Voice command processing mutation with cosmic AI features
  const voiceProcessingMutation = useMutation({
    mutationFn: async (command: string) => {
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command,
          personality: aiPersonality,
          cosmicMode: cosmicMode
        }),
      });
      if (!response.ok) throw new Error('Failed to process voice command');
      return response.json();
    },
    onSuccess: (data) => {
      setIsVoiceProcessing(false);
      if (data && data.response) {
        typeMessage(data.response, 'enhanced_bot_memory', data.confidence || 95);
      }
    },
    onError: (error) => {
      console.error('Voice processing error:', error);
      setIsVoiceProcessing(false);
      typeMessage('Voice command processing failed. Please try again.', 'error', 0);
    },
  });

  // KonsAi enhanced reasoning mutation
  const konsAiMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await fetch('/api/konsai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question,
          personality: aiPersonality,
          cosmicMode: cosmicMode,
          context: {
            walletBalance: walletContext?.balance || 0,
            tradingEnabled: true,
            moralFilters: true
          }
        }),
      });
      if (!response.ok) throw new Error('Failed to get KonsAi response');
      return response.json();
    },
    onSuccess: (data) => {
      if (data && data.answer) {
        typeMessage(data.answer, 'reasoning', data.confidence || 98, data.konslangProcessing, data.reasoning);
      } else {
        typeMessage('KonsAi divine intelligence engaged. How may I assist you with advanced reasoning and universal wisdom?', 'reasoning', 95);
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error('KonsAi error:', error);
      typeMessage('KonsAi divine intelligence is processing your request. Please allow a moment for deep reasoning.', 'reasoning', 85);
      setIsProcessing(false);
    },
  });

  // Voice processing mutation for cosmic AI features
  const voiceCommandMutation = useMutation({
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
      setIsProcessing(false);
    },
    onError: () => {
      typeMessage('I am here to help with ETH trading, market analysis, and spiritual guidance. What would you like to know?', 'enhanced_bot_memory', 85);
      setIsProcessing(false);
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
    // Use cosmic enhanced version
    typeMessageCosmic(message, source, confidence, konslangProcessing, reasoning);
  };

  // Kons Powa ETH Prediction Handler
  const handleKonsPowaPrediction = async () => {
    setIsProcessing(true);
    setShowKonsPrediction(true);
    
    try {
      const result = await refetchKonsPrediction();
      const prediction = result.data;
      
      if (prediction && prediction.divineSignal) {
        const signal = prediction.divineSignal;
        
        // Create formatted prediction message
        const predictionMessage = `🔮 **Kons Powa ETH Prediction**

**Direction:** ${signal.action}
**Confidence:** ${signal.smaiPredict.confidence}%
**Next Hour:** ${signal.smaiPredict.nextHourDirection}
**Price Range:** $${signal.smaiPredict.predictedPriceRange.min.toFixed(2)} - $${signal.smaiPredict.predictedPriceRange.max.toFixed(2)}

**Strategy:** ${signal.strategy}
**Energy Purity:** ${signal.energeticPurity}%
**Kons Mirror:** ${signal.konsMirror}

**Spiritual Guidance:** ${signal.reason}

*From ${signal.konsTitle} through sacred Kons Powa channel*`;

        // Add prediction to chat
        const predictionChatMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'waides',
          message: predictionMessage,
          timestamp: new Date(),
          source: 'oracle',
          confidence: signal.smaiPredict.confidence,
          konslangProcessing: `Divine Channel: ${signal.signalCode}`
        };
        
        setMessages(prev => [...prev, predictionChatMessage]);
        
        // Speak prediction if voice is enabled
        if (voiceSettings.enabled) {
          const spokenText = `ETH prediction from Kons Powa: ${signal.action}, ${signal.smaiPredict.nextHourDirection} direction with ${signal.smaiPredict.confidence}% confidence. ${signal.reason}`;
          speakMessage(spokenText);
        }
      }
    } catch (error) {
      console.error('Kons Powa prediction error:', error);
      typeMessageCosmic('Unable to connect to Kons Powa divine channel. Please try again.', 'error', 0);
    }
    
    setIsProcessing(false);
    setShowKonsPrediction(false);
  };

  // Autonomous Trading Functions
  const startAutonomousTrading = async () => {
    try {
      const response = await fetch('/api/waides-ki/kons-powa/start-autonomous', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setIsAutonomousActive(true);
        typeMessageCosmic(`🚀 Kons Powa Autonomous Trading ACTIVATED! 
        
Initial prediction: ${data.initialPrediction?.action || 'OBSERVE'}
System is now monitoring ETH and executing trades based on divine signals.
All trades will be logged and tracked automatically.`, 'oracle', 95);
        
        // Fetch initial stats
        fetchAutonomousStats();
      } else {
        typeMessageCosmic('Failed to start autonomous trading. Please try again.', 'error', 0);
      }
    } catch (error) {
      console.error('Autonomous trading start error:', error);
      typeMessageCosmic('Error starting autonomous trading. Please check your connection.', 'error', 0);
    }
  };

  const stopAutonomousTrading = async () => {
    try {
      const response = await fetch('/api/waides-ki/kons-powa/stop-autonomous', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setIsAutonomousActive(false);
        typeMessageCosmic('⏹️ Kons Powa Autonomous Trading STOPPED. Returning to manual trading mode.', 'oracle', 85);
      } else {
        typeMessageCosmic('Failed to stop autonomous trading.', 'error', 0);
      }
    } catch (error) {
      console.error('Autonomous trading stop error:', error);
      typeMessageCosmic('Error stopping autonomous trading.', 'error', 0);
    }
  };

  const fetchAutonomousStats = async () => {
    try {
      const response = await fetch('/api/waides-ki/kons-powa/status');
      const data = await response.json();
      setAutonomousStats(data);
    } catch (error) {
      console.error('Failed to fetch autonomous stats:', error);
    }
  };

  const forceExecuteTrade = async (direction: 'BUY' | 'SELL') => {
    try {
      const response = await fetch('/api/waides-ki/kons-powa/force-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, amount: 0.01 })
      });
      const data = await response.json();
      
      if (data.success) {
        typeMessageCosmic(`⚡ Force ${direction} trade executed! Trade ID: ${data.tradeId}`, 'oracle', 90);
        fetchAutonomousStats(); // Refresh stats after force trade
      } else {
        typeMessageCosmic(`❌ Failed to execute force ${direction} trade: ${data.error}`, 'error', 0);
      }
    } catch (error) {
      console.error('Force trade error:', error);
      typeMessageCosmic(`❌ Error executing force ${direction} trade.`, 'error', 0);
    }
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
    
    // First, check for page recommendations
    const pageRecommendation = detectPageRecommendation(currentMessage, setBotState);
    if (pageRecommendation) {
      typeMessage(pageRecommendation, 'enhanced_bot_memory', 95);
      setCurrentMessage('');
      return;
    }
    
    // Check for command triggers  
    const commandResponse = detectCommandTrigger(currentMessage, setBotState);
    if (commandResponse) {
      typeMessage(commandResponse, 'enhanced_bot_memory', 95);
      setCurrentMessage('');
      return;
    }
    
    // Check for WaidBot summoning commands
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

    // KonsAi activation patterns
    const konsAiPatterns = [
      'konsai', 'kons ai', 'higher intelligence', 'divine reasoning', 
      'advanced reasoning', 'universal wisdom', 'deep analysis'
    ];
    const isKonsAiRequest = konsAiPatterns.some(pattern => message.includes(pattern));

    // Kons Powa ETH prediction patterns
    const konsPredictionPatterns = [
      'kons powa', 'konspowa', 'eth prediction', 'price prediction', 'divine signal',
      'market prediction', 'divine reading', 'prediction', 'forecast', 'signal'
    ];
    const isKonsPredictionRequest = konsPredictionPatterns.some(pattern => message.includes(pattern));

    // Enhanced routing with chat mode support and KonsAi integration
    if (isCommand) {
      commandMutation.mutate(currentMessage);
    } else if (isKonsPredictionRequest) {
      // Handle Kons Powa ETH prediction requests
      handleKonsPowaPrediction();
    } else if (isKonsAiRequest && aiPersonality === 'cosmic') {
      // Route to KonsAi for higher divine intelligence
      konsAiMutation.mutate(currentMessage);
    } else {
      // Route based on chat mode
      switch (chatMode) {
        case 'openai':
          openAIChatMutation.mutate(currentMessage);
          break;
        case 'spiritual':
          // Use local Memory Engine for instant responses with plugin support and wallet context
          const memoryResponse = getSmartAnswer(currentMessage, setBotState, walletContext);
          if (memoryResponse) {
            typeMessage(memoryResponse, 'enhanced_bot_memory', 95);
            setIsProcessing(false);
          } else {
            // Fallback to server-side spiritual intelligence
            questionMutation.mutate(currentMessage);
          }
          break;
        case 'konsai':
          // Route directly to KonsAi for higher divine intelligence
          konsAiMutation.mutate(currentMessage);
          break;
        case 'oracle':
          if (oracleEnabled) {
            oracleMutation.mutate(currentMessage);
          } else {
            // Fallback to spiritual mode if oracle not available
            questionMutation.mutate(currentMessage);
          }
          break;
        default: // 'auto' mode
          // Check for complex reasoning requests and route to KonsAi if needed
          const complexPatterns = [
            'explain', 'analyze', 'philosophy', 'ethics', 'moral', 'wisdom', 
            'meaning', 'purpose', 'consciousness', 'reality', 'truth'
          ];
          const isComplexQuestion = complexPatterns.some(pattern => message.includes(pattern));
          
          if (isComplexQuestion && aiPersonality === 'cosmic') {
            // Route complex questions to KonsAi in cosmic mode
            konsAiMutation.mutate(currentMessage);
          } else {
            // Always try Memory Engine first for instant responses with full wallet context
            const smartResponse = getSmartAnswer(currentMessage, setBotState, walletContext);
            if (smartResponse) {
              typeMessage(smartResponse, 'enhanced_bot_memory', 95);
              setIsProcessing(false);
            } else {
              // Always fallback to spiritual intelligence for any message
              questionMutation.mutate(currentMessage);
            }
          }
          break;
      }
    }

    setCurrentMessage('');
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
    <div className={cosmicMode ? 
      (cosmicTheme === 'nebula' ? "min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 text-white font-inter relative overflow-hidden" :
       cosmicTheme === 'starfield' ? "min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white font-inter relative overflow-hidden" :
       cosmicTheme === 'galaxy' ? "min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-pink-900 text-white font-inter relative overflow-hidden" :
       "min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white font-inter relative overflow-hidden") :
      "min-h-screen bg-black text-white font-inter relative overflow-hidden"}>
      
      {/* Enhanced Cosmic Background Effects */}
      {cosmicMode ? (
        <div className="absolute inset-0 pointer-events-none">
          {/* Starfield Animation */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-ping opacity-40"></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-300 rounded-full animate-pulse opacity-30"></div>
          <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-pink-300 rounded-full animate-ping opacity-50"></div>
          <div className="absolute bottom-1/3 right-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-pulse opacity-40"></div>
          <div className="absolute top-2/3 left-1/5 w-1 h-1 bg-cyan-300 rounded-full animate-ping opacity-35"></div>
          <div className="absolute bottom-1/5 right-1/5 w-2.5 h-2.5 bg-violet-300 rounded-full animate-pulse opacity-45"></div>
          <div className="absolute top-3/4 right-2/3 w-1 h-1 bg-emerald-300 rounded-full animate-ping opacity-30"></div>
          <div className="absolute top-1/6 left-2/3 w-1.5 h-1.5 bg-rose-300 rounded-full animate-pulse opacity-40"></div>
          <div className="absolute bottom-2/3 left-1/6 w-1 h-1 bg-amber-300 rounded-full animate-ping opacity-45"></div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.1),transparent_50%)]"></div>
        </div>
      )}

      {/* Top Status Bar - Minimal Scrollable */}
      <div className="relative z-10 flex items-center justify-center px-4 py-0.5 bg-gray-900/30 backdrop-blur-sm border-b border-purple-500/10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-purple-300 font-medium">{formatTime(currentTime)}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-blue-300 font-medium">Konsmik Intelligence</span>
          <span className="text-xs text-gray-400">|</span>
          
          {/* Tab Navigation - Minimal */}
          <div className="flex bg-gray-800/40 rounded-sm p-0.5">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-2 py-0.5 rounded-sm text-xs transition-all ${
                activeTab === 'chat'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-1">
                <Brain className="w-2.5 h-2.5" />
                <span>AI Chat</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('core')}
              className={`px-2 py-0.5 rounded-sm text-xs transition-all ${
                activeTab === 'core'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-1">
                <Heart className="w-2.5 h-2.5" />
                <span>Heart of Waides Ki</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('konsai')}
              className={`px-2 py-0.5 rounded-sm text-xs transition-all ${
                activeTab === 'konsai'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-1">
                <Eye className="w-2.5 h-2.5" />
                <span>Konsai</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' && (
        <>
          {/* Chat Suggestions */}
          <div className="relative z-10 flex flex-wrap gap-2 p-4 max-w-6xl mx-auto">
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
      <div className={`relative z-10 flex-1 mx-4 mb-4 bg-black/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 overflow-hidden max-w-6xl mx-auto ${
        activeTab === 'chat' ? 'h-[calc(100vh-35px)]' : 'h-[calc(100vh-235px)]'
      }`}>
        <div className="h-full overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-purple-600/80 scrollbar-track-gray-800/50 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4 animate-pulse">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-300 mb-2">Welcome to Waides KI</h3>
              <p className="text-gray-400 max-w-md mb-4">
                Your next-generation AI trading oracle. Ask anything about markets, strategies, or trading insights.
              </p>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                <Button
                  onClick={handleKonsPowaPrediction}
                  disabled={isProcessing || showKonsPrediction || isKonsPredictionLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {showKonsPrediction || isKonsPredictionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Kons Powa ETH Prediction
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => setCurrentMessage("What's the market outlook for ETH?")}
                  variant="outline"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 px-4 py-2 text-sm flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Market Analysis
                </Button>
                
                <Button
                  onClick={() => setCurrentMessage("Show me ETH trading strategies")}
                  variant="outline"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 px-4 py-2 text-sm flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  Trading Strategies
                </Button>
              </div>
              
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
                {chatMode === 'konsai' && (
                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-300 font-medium">KonsAi Divine Intelligence Active</span>
                    </div>
                    <p className="text-yellow-200/80">
                      Higher divine intelligence with advanced reasoning, universal wisdom, and comprehensive analysis capabilities.
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
                      {message.source === 'reasoning' ? 'KonsAi Divine Intelligence' : 'Waides KI'} 
                      {message.source && message.source !== 'reasoning' && `• ${message.source.toUpperCase()}`}
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
                
                {/* Display page recommendation button */}
                {message.sender === 'waides' && botState.action === 'open-page' && botState.page && botState.route && (
                  <div className="mt-3">
                    <button
                      onClick={() => handlePageNavigation(botState.route!)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <span>Open {botState.page}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Behavior Suggestion Enhancement */}
                {message.sender === 'waides' && botState.action === 'behavior-suggestion' && botState.recommendations && (
                  <div className="mt-3 p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-green-400" />
                      <span className="text-green-300 font-medium">Smart Recommendations</span>
                    </div>
                    <div className="space-y-2">
                      {botState.recommendations.map((rec, index) => (
                        <div key={index} className="text-green-200 text-sm bg-green-900/20 p-2 rounded">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flow Composer Enhancement */}
                {message.sender === 'waides' && botState.action === 'flow' && botState.flow && (
                  <div className="mt-3 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300 font-medium">Optimized Flow</span>
                    </div>
                    <p className="text-blue-200 text-sm mb-2">{botState.flow.message}</p>
                    {botState.steps && botState.steps.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-blue-300 text-xs font-medium">Suggested Steps:</span>
                        {botState.steps.map((step, index) => (
                          <div key={index} className="text-blue-200 text-xs bg-blue-900/20 p-1 rounded">
                            {index + 1}. {step}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bot Setup Enhancement */}
                {message.sender === 'waides' && botState.action === 'bot-setup' && botState.config && (
                  <div className="mt-3 p-3 bg-orange-900/30 border border-orange-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-300 font-medium">Auto Bot Configuration</span>
                    </div>
                    <p className="text-orange-200 text-sm mb-2">{botState.config.message}</p>
                    {botState.recommendations && botState.recommendations.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-orange-300 text-xs font-medium">Configuration:</span>
                        {botState.recommendations.map((rec, index) => (
                          <div key={index} className="text-orange-200 text-xs bg-orange-900/20 p-1 rounded">
                            • {rec}
                          </div>
                        ))}
                      </div>
                    )}
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
          <div className="relative z-10 p-4 max-w-6xl mx-auto">
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

      {/* Action Menu - Only show when not in chat or konsai tab */}
      {activeTab !== 'chat' && activeTab !== 'konsai' && (
        <div className="relative z-10 mx-4 mb-4">
        <Card className="bg-gray-900/60 backdrop-blur-sm border-purple-500/30 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-purple-300 text-sm">System Components</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div 
              className="grid grid-rows-2 grid-flow-col gap-2 max-w-full overflow-x-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800 pb-2"
              style={{ 
                scrollSnapType: 'x mandatory',
                scrollbarWidth: 'thin',
                scrollbarColor: '#9333ea #1f2937',
                gridAutoColumns: 'minmax(140px, 1fr)'
              }}
            >
              {/* Quick Actions */}
              <button
                className="h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => handleSuggestionClick("Predict ETH price for next hour")}
              >
                <TrendingUp className="w-5 h-5 mb-1" />
                <span>Predict ETH</span>
              </button>
              
              <button
                className={`h-16 rounded-xl ${isAutonomousActive 
                  ? 'bg-gradient-to-br from-red-500 to-red-600' 
                  : 'bg-gradient-to-br from-green-500 to-green-600'
                } text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105`}
                onClick={() => isAutonomousActive ? stopAutonomousTrading() : startAutonomousTrading()}
              >
                <Zap className="w-5 h-5 mb-1" />
                <span>{isAutonomousActive ? 'Stop Auto' : 'Start Auto'}</span>
              </button>
              
              <button
                className="h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/autonomous-wealth'}
              >
                <Wallet className="w-5 h-5 mb-1" />
                <span>SmaiWallet</span>
              </button>

              {/* Core Trading */}
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

              {/* Advanced Trading */}
              <button
                className="h-16 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/strategy-autogen'}
              >
                <Lightbulb className="w-5 h-5 mb-1" />
                <span>Strategy Gen</span>
              </button>

              <button
                className="h-16 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/enhanced-waidbot'}
              >
                <Target className="w-5 h-5 mb-1" />
                <span>Enhanced Bot</span>
              </button>

              <button
                className="h-16 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/full-engine'}
              >
                <Gamepad2 className="w-5 h-5 mb-1" />
                <span>Full Engine</span>
              </button>

              {/* Biometric & Security */}
              <button
                className="h-16 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/biometric-trading'}
              >
                <Fingerprint className="w-5 h-5 mb-1" />
                <span>Biometric</span>
              </button>

              <button
                className="h-16 rounded-xl bg-gradient-to-br from-gray-500 to-slate-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/gateway'}
              >
                <Lock className="w-5 h-5 mb-1" />
                <span>Gateway</span>
              </button>

              <button
                className="h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/voice-command'}
              >
                <Mic className="w-5 h-5 mb-1" />
                <span>Voice Cmd</span>
              </button>

              {/* Spiritual & Vision */}
              <button
                className="h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/vision-spirit'}
              >
                <Eye className="w-5 h-5 mb-1" />
                <span>Vision Spirit</span>
              </button>

              <button
                className="h-16 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/dream-vision'}
              >
                <Moon className="w-5 h-5 mb-1" />
                <span>Dream Vision</span>
              </button>

              <button
                className="h-16 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/spiritual-recall'}
              >
                <RefreshCw className="w-5 h-5 mb-1" />
                <span>Spiritual Recall</span>
              </button>

              <button
                className="h-16 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/seasonal-rebirth'}
              >
                <TreePine className="w-5 h-5 mb-1" />
                <span>Rebirth</span>
              </button>

              <button
                className="h-16 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/sigil-layer'}
              >
                <Star className="w-5 h-5 mb-1" />
                <span>Sigil Layer</span>
              </button>

              <button
                className="h-16 rounded-xl bg-gradient-to-br from-slate-600 to-gray-700 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/shadow-defense'}
              >
                <Shield className="w-5 h-5 mb-1" />
                <span>Shadow Defense</span>
              </button>

              <button
                className="h-16 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/reincarnation'}
              >
                <RefreshCw className="w-5 h-5 mb-1" />
                <span>Reincarnation</span>
              </button>

              {/* Guardian Systems */}
              <button
                className="h-16 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-700 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/eth-empath-guardian'}
              >
                <Heart className="w-5 h-5 mb-1" />
                <span>ETH Guardian</span>
              </button>

              <button
                className="h-16 rounded-xl bg-gradient-to-br from-indigo-700 to-purple-700 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/meta-guardian'}
              >
                <Users className="w-5 h-5 mb-1" />
                <span>Meta Guardian</span>
              </button>

              {/* Data & Analysis */}
              <button
                className="h-16 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/live-data'}
              >
                <Database className="w-5 h-5 mb-1" />
                <span>Live Data</span>
              </button>

              <button
                className="h-16 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/learning'}
              >
                <Lightbulb className="w-5 h-5 mb-1" />
                <span>Trading Academy</span>
              </button>

              <button
                className="h-16 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/risk-backtesting'}
              >
                <TestTube className="w-5 h-5 mb-1" />
                <span>Risk Testing</span>
              </button>

              {/* ML & Development */}
              <button
                className="h-16 rounded-xl bg-gradient-to-br from-purple-700 to-pink-700 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/ml-lifecycle'}
              >
                <FlaskConical className="w-5 h-5 mb-1" />
                <span>ML Lifecycle</span>
              </button>

              {/* Admin & Configuration */}
              <button
                className="h-16 rounded-xl bg-gradient-to-br from-gray-600 to-slate-700 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/admin'}
              >
                <Settings className="w-5 h-5 mb-1" />
                <span>Admin</span>
              </button>

              <button
                className="h-16 rounded-xl bg-gradient-to-br from-slate-700 to-gray-800 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/config'}
              >
                <Cog className="w-5 h-5 mb-1" />
                <span>Configuration</span>
              </button>

              <button
                className="h-16 rounded-xl bg-gradient-to-br from-blue-800 to-indigo-800 text-white text-xs font-medium flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                onClick={() => window.location.href = '/api-docs'}
              >
                <FileText className="w-5 h-5 mb-1" />
                <span>API Docs</span>
              </button>
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Autonomous Trading Status Panel */}
      {isAutonomousActive && (
        <div className="mb-4 p-4 bg-gradient-to-br from-green-900/40 to-blue-900/40 border border-green-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 font-semibold">Kons Powa Autonomous Trading Active</span>
            </div>
            <button
              onClick={() => setShowAutonomousPanel(!showAutonomousPanel)}
              className="text-green-400 hover:text-green-300 transition-colors text-sm"
            >
              {showAutonomousPanel ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          {showAutonomousPanel && autonomousStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-xs text-green-400/70">Total Trades</div>
                <div className="text-lg font-bold text-green-300">{autonomousStats.totalTrades || 0}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-xs text-green-400/70">Win Rate</div>
                <div className="text-lg font-bold text-green-300">{(autonomousStats.winRate || 0).toFixed(1)}%</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-xs text-green-400/70">P&L</div>
                <div className={`text-lg font-bold ${(autonomousStats.totalPnL || 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  ${(autonomousStats.totalPnL || 0).toFixed(2)}
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-xs text-green-400/70">Last Signal</div>
                <div className="text-lg font-bold text-green-300">{autonomousStats.lastSignal || 'OBSERVE'}</div>
              </div>
            </div>
          )}
          
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => forceExecuteTrade('BUY')}
              className="px-3 py-1 bg-green-600/50 hover:bg-green-600/70 text-green-200 text-xs rounded transition-colors"
            >
              Force BUY
            </button>
            <button
              onClick={() => forceExecuteTrade('SELL')}
              className="px-3 py-1 bg-red-600/50 hover:bg-red-600/70 text-red-200 text-xs rounded transition-colors"
            >
              Force SELL
            </button>
            <button
              onClick={fetchAutonomousStats}
              className="px-3 py-1 bg-blue-600/50 hover:bg-blue-600/70 text-blue-200 text-xs rounded transition-colors"
            >
              Refresh Stats
            </button>
          </div>
        </div>
      )}

      {/* Konsai Tab Content */}
      {activeTab === 'konsai' && (
        <div className="relative z-10 flex-1 overflow-hidden w-full h-full">
          <KonsaiChat />
        </div>
      )}
    </div>
  );
}
