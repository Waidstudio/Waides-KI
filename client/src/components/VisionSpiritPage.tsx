import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Eye, BarChart3, History, Send, Mic, MicOff, Sparkles, 
  TrendingUp, TrendingDown, Clock, Target, Shield, Zap
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface VisionData {
  direction: string;
  energy: number;
  confidence: number;
  accuracy: number;
  message: string;
  timestamp: number;
}

interface VisionStats {
  totalVisions: number;
  confirmedVisions: number;
  rejectedVisions: number;
  accuracy: number;
  averageConfidence: number;
  bestPerformingType: string;
}

interface Message {
  id: string;
  message: string;
  sender: 'user' | 'konsai';
  timestamp: number;
  source?: string;
  confidence?: number;
  reasoning?: Array<{
    step: string;
    analysis: string;
    confidence: number;
    data?: any;
  }>;
  konslangProcessing?: string;
  visionData?: VisionData;
  isContextualSuggestion?: boolean;
}

// Contextual Vision Suggestions
const getContextualSuggestions = (currentVision?: VisionData, stats?: VisionStats) => {
  const suggestions = [
    {
      icon: <Eye className="h-4 w-4" />,
      text: "Should I generate a vision about ETH trade in the next 4 hours?",
      action: "generate_4h_vision",
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      text: "What do the spirits see for ETH direction today?",
      action: "daily_direction_vision",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      icon: <Target className="h-4 w-4" />,
      text: "Should I enter a position now based on current energy?",
      action: "position_timing_vision",
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      icon: <Shield className="h-4 w-4" />,
      text: "Are there any warning signs I should be aware of?",
      action: "risk_warning_vision",
      color: "bg-red-600 hover:bg-red-700"
    }
  ];

  // Add dynamic suggestions based on current vision
  if (currentVision?.direction === 'BULLISH') {
    suggestions.push({
      icon: <Zap className="h-4 w-4" />,
      text: "How long will this bullish energy last?",
      action: "bullish_duration_vision",
      color: "bg-emerald-600 hover:bg-emerald-700"
    });
  } else if (currentVision?.direction === 'BEARISH') {
    suggestions.push({
      icon: <TrendingDown className="h-4 w-4" />,
      text: "When will this bearish phase end?",
      action: "bearish_recovery_vision",
      color: "bg-orange-600 hover:bg-orange-700"
    });
  }

  // Add accuracy-based suggestions
  if (stats?.accuracy && stats.accuracy > 75) {
    suggestions.push({
      icon: <BarChart3 className="h-4 w-4" />,
      text: "My accuracy is high - what's the next high-confidence trade?",
      action: "high_confidence_trade",
      color: "bg-indigo-600 hover:bg-indigo-700"
    });
  }

  return suggestions.slice(0, 6); // Limit to 6 suggestions
};

export function VisionSpiritPage() {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [typewriterMessage, setTypewriterMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Voice state
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Vision Spirit API queries
  const { data: currentVision } = useQuery({
    queryKey: ['/api/waides-ki/vision-spirit/current'],
    refetchInterval: 10000,
  });

  const { data: visionStats } = useQuery({
    queryKey: ['/api/waides-ki/vision-spirit/stats'],
    refetchInterval: 15000,
  });

  // Chat mutations
  const chatMutation = useMutation({
    mutationFn: (message: string) => 
      apiRequest('/api/chat/konsai', {
        method: 'POST',
        body: { message, mode: 'konsai', reasoning: true }
      }),
    onSuccess: (data) => {
      const response: Message = {
        id: Date.now().toString(),
        message: data.response || data.message || 'No response received',
        sender: 'konsai',
        timestamp: Date.now(),
        source: data.source || 'konsai',
        confidence: data.confidence,
        reasoning: data.reasoning,
        konslangProcessing: data.konslangProcessing
      };
      
      typeMessage(response.message, 'konsai', response.confidence || 85);
      setMessages(prev => [...prev, response]);
      setIsProcessing(false);
    },
    onError: () => {
      typeMessage('Connection to KonsAi temporarily unavailable. Spiritual channels are being realigned...', 'error', 0);
      setIsProcessing(false);
    }
  });

  // Vision Spirit mutations
  const receiveVisionMutation = useMutation({
    mutationFn: (visionType: string) => 
      apiRequest('/api/waides-ki/vision-spirit/receive', { 
        method: 'POST',
        body: { visionType }
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/stats'] });
      
      // Add vision response to chat
      const visionResponse: Message = {
        id: Date.now().toString(),
        message: data.message || 'Vision received from the spirits...',
        sender: 'konsai',
        timestamp: Date.now(),
        source: 'vision_spirit',
        confidence: data.confidence || 80,
        visionData: data.vision
      };
      
      typeMessage(visionResponse.message, 'konsai', visionResponse.confidence || 80);
      setMessages(prev => [...prev, visionResponse]);
    }
  });

  // Voice processing mutation
  const voiceProcessingMutation = useMutation({
    mutationFn: (command: string) => 
      apiRequest('/api/chat/voice-process', {
        method: 'POST',
        body: { command }
      }),
    onSuccess: (data) => {
      setIsVoiceProcessing(false);
      const response: Message = {
        id: Date.now().toString(),
        message: data.response || 'Voice command processed',
        sender: 'konsai',
        timestamp: Date.now(),
        source: 'voice',
        confidence: data.confidence || 80
      };
      
      typeMessage(response.message, 'konsai', response.confidence || 80);
      setMessages(prev => [...prev, response]);
    },
    onError: () => {
      setIsVoiceProcessing(false);
      typeMessage('Voice processing error. Please try again.', 'error', 0);
    }
  });

  // Initialize welcome message with contextual suggestions
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      message: `Welcome to Vision Spirit - where KonsAi meets trading prophecy.

I can help you:
🔮 Generate trading visions for specific timeframes
📊 Analyze current market spiritual energy
⚡ Provide real-time ETH direction insights
🛡️ Warn about potential market risks
🎯 Time your entry and exit points

Try the contextual suggestions below or ask me anything about ETH trading visions.`,
      sender: 'konsai',
      timestamp: Date.now(),
      source: 'system',
      confidence: 100,
      isContextualSuggestion: true
    };
    
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typewriterMessage]);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const command = event.results[0][0].transcript;
          setCurrentMessage(command);
          setIsVoiceProcessing(true);
          voiceProcessingMutation.mutate(command);
        };

        recognition.onerror = () => {
          setVoiceEnabled(false);
          setIsVoiceProcessing(false);
        };

        recognition.onend = () => {
          setVoiceEnabled(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Typewriter effect
  const typeMessage = (message: string, sender: 'konsai' | 'error', confidence: number) => {
    setIsTyping(true);
    setTypewriterMessage('');
    
    let index = 0;
    const interval = setInterval(() => {
      setTypewriterMessage(prev => prev + message[index]);
      index++;
      if (index === message.length) {
        clearInterval(interval);
        setIsTyping(false);
        setTypewriterMessage('');
      }
    }, 30);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      message: currentMessage,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    const messageToSend = currentMessage;
    setCurrentMessage('');
    
    chatMutation.mutate(messageToSend);
  };

  const handleContextualAction = (action: string) => {
    let message = '';
    let visionType = 'general';

    switch (action) {
      case 'generate_4h_vision':
        message = 'Generate a vision about ETH trade in the next 4 hours';
        visionType = '4h_trade';
        break;
      case 'daily_direction_vision':
        message = 'What do the spirits see for ETH direction today?';
        visionType = 'daily_direction';
        break;
      case 'position_timing_vision':
        message = 'Should I enter a position now based on current energy?';
        visionType = 'position_timing';
        break;
      case 'risk_warning_vision':
        message = 'Are there any warning signs I should be aware of?';
        visionType = 'risk_warning';
        break;
      case 'bullish_duration_vision':
        message = 'How long will this bullish energy last?';
        visionType = 'bullish_duration';
        break;
      case 'bearish_recovery_vision':
        message = 'When will this bearish phase end?';
        visionType = 'bearish_recovery';
        break;
      case 'high_confidence_trade':
        message = 'My accuracy is high - what\'s the next high-confidence trade?';
        visionType = 'high_confidence';
        break;
      default:
        message = 'Generate a general trading vision';
        visionType = 'general';
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      message,
      sender: 'user',
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);

    // Trigger vision generation
    receiveVisionMutation.mutate(visionType);
  };

  const toggleVoiceRecognition = () => {
    if (!speechSupported) return;
    
    if (voiceEnabled) {
      recognitionRef.current?.stop();
      setVoiceEnabled(false);
    } else {
      recognitionRef.current?.start();
      setVoiceEnabled(true);
    }
  };

  const contextualSuggestions = getContextualSuggestions(currentVision, visionStats);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      {/* Main Chat Container */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header with Vision Status */}
        <div className="p-4 border-b border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Vision Spirit
              </h1>
            </div>
            
            {/* Current Vision Status */}
            {currentVision && (
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`${
                    currentVision.direction === 'BULLISH' ? 'border-green-500 text-green-400' :
                    currentVision.direction === 'BEARISH' ? 'border-red-500 text-red-400' :
                    'border-yellow-500 text-yellow-400'
                  }`}
                >
                  {currentVision.direction}
                </Badge>
                <Badge variant="outline" className="border-purple-500 text-purple-400">
                  {currentVision.confidence}% confidence
                </Badge>
              </div>
            )}
          </div>

          {/* Stats */}
          {visionStats && (
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Total Visions: {visionStats.totalVisions}</span>
              <span>Accuracy: {visionStats.accuracy.toFixed(1)}%</span>
              <span>Avg Confidence: {visionStats.averageConfidence.toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card 
                className={`max-w-[80%] ${
                  message.sender === 'user' 
                    ? 'bg-blue-600/20 border-blue-500/30' 
                    : 'bg-purple-600/20 border-purple-500/30'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {message.sender === 'konsai' && (
                      <div className="flex-shrink-0">
                        {message.source === 'vision_spirit' ? (
                          <Eye className="h-5 w-5 text-purple-400" />
                        ) : message.source === 'voice' ? (
                          <Mic className="h-5 w-5 text-blue-400" />
                        ) : (
                          <Brain className="h-5 w-5 text-purple-400" />
                        )}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="prose prose-invert max-w-none">
                        <p className="whitespace-pre-wrap text-sm">{message.message}</p>
                      </div>
                      
                      {message.visionData && (
                        <div className="mt-3 p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-purple-400" />
                            <span className="text-sm font-semibold text-purple-400">Vision Details</span>
                          </div>
                          <div className="text-xs space-y-1 text-gray-300">
                            <div>Direction: <span className="text-purple-400">{message.visionData.direction}</span></div>
                            <div>Energy Level: <span className="text-purple-400">{message.visionData.energy}%</span></div>
                            <div>Confidence: <span className="text-purple-400">{message.visionData.confidence}%</span></div>
                          </div>
                        </div>
                      )}
                      
                      {message.confidence && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                          <span>Confidence: {message.confidence}%</span>
                          {message.source && <span>• Source: {message.source}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {/* Typewriter effect */}
          {isTyping && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] bg-purple-600/20 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-purple-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{typewriterMessage}<span className="animate-pulse">|</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Contextual Suggestions */}
        {!isProcessing && contextualSuggestions.length > 0 && (
          <div className="p-4 border-t border-purple-500/30">
            <div className="mb-2 text-sm text-gray-400">Contextual Suggestions:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {contextualSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleContextualAction(suggestion.action)}
                  className={`${suggestion.color} border-transparent text-white text-left justify-start h-auto p-3`}
                  disabled={receiveVisionMutation.isPending}
                >
                  <div className="flex items-center gap-2">
                    {suggestion.icon}
                    <span className="text-xs">{suggestion.text}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-purple-500/30">
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about trading visions, market energy, or ETH insights..."
              disabled={isProcessing || isVoiceProcessing}
              className="flex-1 bg-black/20 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-400"
            />
            
            {speechSupported && (
              <Button
                onClick={toggleVoiceRecognition}
                disabled={isProcessing || isVoiceProcessing}
                className={`${
                  voiceEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {voiceEnabled ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            
            <Button 
              onClick={handleSendMessage}
              disabled={isProcessing || !currentMessage.trim() || isVoiceProcessing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {isVoiceProcessing && (
            <div className="mt-2 text-sm text-blue-400 flex items-center gap-2">
              <Mic className="h-4 w-4 animate-pulse" />
              Processing voice command...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}