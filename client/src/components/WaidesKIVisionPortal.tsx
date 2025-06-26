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
  Moon, Sun, Waves, Star, Circle, Triangle, Square, Shield
} from 'lucide-react';
import { WaidesKICoreEnginePanel } from './WaidesKICoreEnginePanel';
import { WaidBotSummonPanel } from './WaidBotSummonPanel';
import VisionSpirit from './VisionSpirit';
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
  
  // Wallet context integration
  const walletContext = useSmaiWallet();
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
  const [, setLocation] = useLocation();
  const { smaiBalance, localBalance, transactions, canAffordTrade } = useSmaiWallet();
  const { toast } = useToast();

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
            walletBalance: walletState.balance,
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

    // Enhanced routing with chat mode support and KonsAi integration
    if (isCommand) {
      commandMutation.mutate(currentMessage);
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
          
          {/* Cosmic AI Controls */}
          <div className="flex items-center gap-2">
            {/* Cosmic Mode Toggle */}
            <Button
              onClick={() => setCosmicMode(!cosmicMode)}
              variant="ghost"
              size="sm"
              className={`h-8 px-3 text-xs font-medium ${
                cosmicMode
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-purple-400/50' 
                  : 'text-gray-400 hover:bg-gray-700/50 border border-gray-600'
              }`}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Cosmic
            </Button>

            {/* Cosmic Theme Selector (only visible when cosmic mode is on) */}
            {cosmicMode && (
              <Select value={cosmicTheme} onValueChange={(value: any) => setCosmicTheme(value)}>
                <SelectTrigger className="w-20 h-8 bg-gray-800/60 border-purple-400/50 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-purple-400">
                  <SelectItem value="nebula">Nebula</SelectItem>
                  <SelectItem value="starfield">Starfield</SelectItem>
                  <SelectItem value="galaxy">Galaxy</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* AI Personality Selector */}
            <Select value={aiPersonality.mode} onValueChange={(value: any) => setAiPersonality(prev => ({ ...prev, mode: value }))}>
              <SelectTrigger className="w-24 h-8 bg-gray-800/60 border-gray-600 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="spiritual">
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3" />
                    Spiritual
                  </div>
                </SelectItem>
                <SelectItem value="analytical">
                  <div className="flex items-center gap-2">
                    <Brain className="w-3 h-3" />
                    Analytical
                  </div>
                </SelectItem>
                <SelectItem value="creative">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Creative
                  </div>
                </SelectItem>
                <SelectItem value="balanced">
                  <div className="flex items-center gap-2">
                    <Circle className="w-3 h-3" />
                    Balanced
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Voice Controls */}
            <Button
              onClick={() => setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              variant="ghost"
              size="sm"
              className={`w-8 h-8 p-0 ${
                voiceSettings.enabled
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {voiceSettings.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>

            {/* Cosmic Mode Toggle */}
            <Button
              onClick={() => setCosmicMode(!cosmicMode)}
              variant="ghost"
              size="sm"
              className={`w-8 h-8 p-0 ${
                cosmicMode
                  ? 'bg-purple-600 text-white animate-pulse' 
                  : 'text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
          
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
                setChatMode('konsai');
                setOracleEnabled(false);
                setReasoningMode(true);
              }}
              variant="ghost"
              size="sm"
              className={`text-xs px-2 py-1 ${
                chatMode === 'konsai'
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              🧬 KonsAi
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

      {/* Vision Spirit Floating Panels - Only show on /vision-spirit route */}
      {isVisionSpiritRoute && (
        <>
          <VisionSpirit
            isFloatingVisible={showVisionSpirit}
            activeFloatingPanel={activeVisionPanel}
            onCloseFloating={() => setShowVisionSpirit(false)}
          />

          {/* Floating Action Buttons for Vision Spirit */}
          {!showVisionSpirit && (
            <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
              <Button
                onClick={() => {
                  setActiveVisionPanel('current');
                  setShowVisionSpirit(true);
                }}
                className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg"
                title="Vision Spirit - Current Vision"
              >
                <Eye className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => {
                  setActiveVisionPanel('stats');
                  setShowVisionSpirit(true);
                }}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
                title="Vision Spirit - Statistics"
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => {
                  setActiveVisionPanel('history');
                  setShowVisionSpirit(true);
                }}
                className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                title="Vision Spirit - History"
              >
                <Brain className="h-5 w-5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}