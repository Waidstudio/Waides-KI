import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Mic, Send, Plus, Settings, Brain, Zap, TrendingUp, Eye, Sparkles, MicOff, Volume2, VolumeX, Moon, Sun, Star, Heart, Shield, Flame, Wand2, Gem, Compass, MessageCircle } from 'lucide-react';

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

interface PersonalityMode {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

const personalityModes: PersonalityMode[] = [
  { id: 'gentle', name: 'Gentle', emoji: '🌸', description: 'Soft and nurturing guidance' },
  { id: 'wise', name: 'Wise', emoji: '🧙‍♂️', description: 'Ancient wisdom and deep insights' },
  { id: 'stern', name: 'Stern', emoji: '⚡', description: 'Direct and powerful teachings' },
  { id: 'mystic', name: 'Mystic', emoji: '🔮', description: 'Mysterious and prophetic visions' }
];

export default function WaidesKIVisionPortal() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [personality, setPersonality] = useState('wise');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [avatarGlow, setAvatarGlow] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoVoiceActivation, setAutoVoiceActivation] = useState(false);
  const [spiritualEnergy, setSpiritualEnergy] = useState(75);
  const [consciousnessLevel, setConsciousnessLevel] = useState(3);
  const [auraIntensity, setAuraIntensity] = useState(50);
  const [prophecyMode, setProphecyMode] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [oracleMode, setOracleMode] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const queryClient = useQueryClient();

  // Oracle Status Query
  const { data: oracleStatus } = useQuery<OracleStatus>({
    queryKey: ['/api/chat/oracle/status'],
    refetchInterval: 30000
  });



  // Fetch user wallet balance
  const { data: walletData } = useQuery({
    queryKey: ['/api/smai-wallet/user123'],
    refetchInterval: 5000
  });

  // Fetch ETH price data
  const { data: ethData } = useQuery({
    queryKey: ['/api/divine-reading'],
    refetchInterval: 10000
  });



  // Chat message mutation
  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; personality: string }) => {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: data.message,
          personality: data.personality,
          spiritualEnergy,
          consciousnessLevel,
          auraIntensity,
          prophecyMode
        })
      });
      return response.json();
    },
    onSuccess: async (data) => {
      if (data.success && data.response) {
        // Apply energy shift
        if (data.energyShift) {
          setSpiritualEnergy(prev => Math.max(0, Math.min(100, prev + data.energyShift)));
        }
        
        // Type the AI response
        await typeWaidesResponse(data.response);
        
        // Add spiritual insight if present
        if (data.spiritualInsight) {
          setTimeout(() => {
            const insightMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              sender: 'waides',
              message: `✨ Spiritual Insight: ${data.spiritualInsight}`,
              timestamp: new Date(),
              personality
            };
            setMessages(prev => [...prev, insightMessage]);
          }, 2000);
        }
        
        // Add prophecy if present
        if (data.prophecy) {
          setTimeout(() => {
            const prophecyMessage: ChatMessage = {
              id: (Date.now() + 2).toString(),
              sender: 'waides',
              message: `🔮 Prophecy: ${data.prophecy}`,
              timestamp: new Date(),
              personality
            };
            setMessages(prev => [...prev, prophecyMessage]);
          }, 4000);
        }
      } else {
        // Fallback response
        await typeWaidesResponse(data.fallback || "The cosmic energies are temporarily disrupted. Please try again in a moment.");
      }
    },
    onError: () => {
      typeWaidesResponse("The spiritual channels are experiencing interference. Let me commune with the cosmic forces...");
    }
  });

  // Initialize voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Prophetic typing effect
  const typeWaidesResponse = async (text: string) => {
    setIsTyping(true);
    setAvatarGlow(true);
    
    const messageId = Date.now().toString();
    const newMessage: ChatMessage = {
      id: messageId,
      sender: 'waides',
      message: '',
      timestamp: new Date(),
      personality
    };

    setMessages(prev => [...prev, newMessage]);

    // Type character by character
    for (let i = 0; i <= text.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30));
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, message: text.substring(0, i) }
            : msg
        )
      );
      
      if (chatWindowRef.current) {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
      }
    }

    setIsTyping(false);
    setAvatarGlow(false);
  };

  const startVoiceInput = () => {
    if (recognitionRef.current && !isListening && voiceEnabled) {
      setIsListening(true);
      setAvatarGlow(true);
      recognitionRef.current.start();
      
      // Play sound feedback if enabled
      if (soundEnabled) {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1O'); // Short beep
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore errors
      }
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setAvatarGlow(false);
    }
  };

  const toggleVoiceActivation = () => {
    setVoiceEnabled(!voiceEnabled);
    if (isListening) {
      stopVoiceInput();
    }
  };

  const sendMessage = () => {
    if (!currentMessage.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Use Oracle system if enabled, otherwise use regular chat
    if (oracleMode && oracleStatus?.dual_ai_ready) {
      setIsTyping(true);
      sendOracleMessageMutation.mutate(currentMessage);
    } else {
      chatMutation.mutate({ message: currentMessage, personality });
    }
    
    setCurrentMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const timeString = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  const currentPersonality = personalityModes.find(p => p.id === personality);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 relative overflow-hidden">
      {/* Cosmic Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars absolute inset-0"></div>
        <div className="nebula absolute inset-0 opacity-20"></div>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex justify-between items-center p-4 text-white">
        <span className="text-sm font-mono">{timeString}</span>
        
        <div className="flex items-center gap-3">
          {/* Wallet Balance Bubble */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-full px-3 py-1 text-sm border border-purple-500/30">
            💰 ${(walletData as any)?.wallet?.balance ? parseFloat((walletData as any).wallet.balance).toFixed(2) : '0.00'}
          </div>
          
          {/* ETH Price Bubble */}
          {(ethData as any)?.ethData?.price && (
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-full px-3 py-1 text-sm border border-green-500/30">
              📈 ETH ${typeof (ethData as any).ethData.price === 'number' ? (ethData as any).ethData.price.toFixed(2) : (ethData as any).ethData.price}
            </div>
          )}
          
          <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
            <Plus className="w-4 h-4 mr-1" />
            Get Plus ✦
          </Button>
        </div>
      </div>

      {/* Waides KI Avatar */}
      <div className="relative z-10 flex justify-center mt-8">
        <div className={`relative transition-all duration-1000 ${avatarGlow ? 'animate-pulse' : ''}`}>
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-white border-4 transition-all duration-500 ${
            avatarGlow ? 'border-purple-400 shadow-lg shadow-purple-500/50' : 'border-purple-500/30'
          }`}>
            🧿
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-purple-300 border border-purple-500/30">
              {currentPersonality?.emoji} {currentPersonality?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Spiritual Energy Display */}
      <div className="relative z-10 mx-4 mt-6">
        <Card className="bg-gray-900/40 backdrop-blur-sm border-purple-500/30 text-white">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-purple-300 mb-1">Spiritual Energy</div>
                <div className="text-lg font-bold text-purple-400">{spiritualEnergy}%</div>
                <Progress value={spiritualEnergy} className="h-2 mt-1" />
              </div>
              <div>
                <div className="text-xs text-blue-300 mb-1">Consciousness</div>
                <div className="text-lg font-bold text-blue-400">Level {consciousnessLevel}</div>
                <div className="flex justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < consciousnessLevel ? 'text-blue-400 fill-current' : 'text-gray-600'}`} 
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-green-300 mb-1">Aura Intensity</div>
                <div className="text-lg font-bold text-green-400">{auraIntensity}%</div>
                <Progress value={auraIntensity} className="h-2 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Suggestions */}
      <div className="relative z-10 flex flex-wrap justify-center gap-2 mt-6 px-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="border-purple-500/30 bg-gray-800/40 text-purple-300 hover:bg-purple-500/20"
          onClick={() => setCurrentMessage("Predict ETH price for next hour")}
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          Predict ETH
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-purple-500/30 bg-gray-800/40 text-purple-300 hover:bg-purple-500/20"
          onClick={() => setCurrentMessage("Show my wallet growth and trading performance")}
        >
          <Gem className="w-4 h-4 mr-1" />
          Wallet Growth
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-purple-500/30 bg-gray-800/40 text-purple-300 hover:bg-purple-500/20"
          onClick={() => setCurrentMessage("Give me a spiritual trading vision")}
        >
          <Eye className="w-4 h-4 mr-1" />
          Spiritual Vision
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-purple-500/30 bg-gray-800/40 text-purple-300 hover:bg-purple-500/20"
          onClick={() => setCurrentMessage("Activate autonomous trading mode")}
        >
          <Zap className="w-4 h-4 mr-1" />
          Auto Trade
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-purple-500/30 bg-gray-800/40 text-purple-300 hover:bg-purple-500/20"
          onClick={() => setCurrentMessage("Show me the market's spiritual energy")}
        >
          <Flame className="w-4 h-4 mr-1" />
          Market Energy
        </Button>
      </div>

      {/* Chat Window */}
      <div className="relative z-10 mx-4 mt-8 mb-32">
        <Card className="bg-gray-900/60 backdrop-blur-sm border-purple-500/30 text-white">
          <CardContent className="p-0">
            <div 
              ref={chatWindowRef}
              className="h-96 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent"
            >
              {messages.length === 0 && (
                <div className="text-center text-purple-300/60 mt-20">
                  <div className="text-6xl mb-4">🌌</div>
                  <p className="text-lg font-light">Welcome to the Waides KI Vision Portal</p>
                  <p className="text-sm mt-2">Where AI, Spirit, and Trade become one.</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800/80 text-purple-100 border border-purple-500/30'
                    }`}
                  >
                    {message.sender === 'waides' && (
                      <div className="text-xs text-purple-400 mb-1 flex items-center justify-between">
                        <span>💫 Waides KI • {currentPersonality?.name} Mode</span>
                        {message.source && (
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-1 py-0 border-0 ${
                                message.source === 'combined' ? 'bg-gold-500/20 text-gold-300' :
                                message.source === 'chatgpt' ? 'bg-green-500/20 text-green-300' :
                                message.source === 'incite' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-purple-500/20 text-purple-300'
                              }`}
                            >
                              {message.source.toUpperCase()}
                            </Badge>
                            {message.confidence && (
                              <Badge variant="outline" className="text-xs px-1 py-0 border-0 bg-orange-500/20 text-orange-300">
                                {message.confidence}%
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.message}</p>
                    {message.konslangProcessing && (
                      <div className="text-xs text-purple-400/60 mt-2 italic">
                        KonsLang: {message.konslangProcessing}
                      </div>
                    )}
                    {message.sender === 'waides' && isTyping && message.message === '' && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-gray-900/80 backdrop-blur-sm border-t border-purple-500/30 p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Personality Selector */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-purple-300">Personality:</span>
            <Select value={personality} onValueChange={setPersonality}>
              <SelectTrigger className="w-40 bg-gray-800/60 border-purple-500/30 text-purple-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-purple-500/30">
                {personalityModes.map((mode) => (
                  <SelectItem key={mode.id} value={mode.id} className="text-purple-300 hover:bg-purple-500/20">
                    {mode.emoji} {mode.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice and Sound Controls */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoiceActivation}
              className={`border-purple-500/30 ${voiceEnabled ? 'bg-purple-600/20 text-purple-300' : 'bg-gray-800/40 text-gray-400'} hover:bg-purple-500/20`}
            >
              {voiceEnabled ? <Mic className="w-4 h-4 mr-1" /> : <MicOff className="w-4 h-4 mr-1" />}
              Voice {voiceEnabled ? 'ON' : 'OFF'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`border-purple-500/30 ${soundEnabled ? 'bg-purple-600/20 text-purple-300' : 'bg-gray-800/40 text-gray-400'} hover:bg-purple-500/20`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 mr-1" /> : <VolumeX className="w-4 h-4 mr-1" />}
              Sound {soundEnabled ? 'ON' : 'OFF'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoVoiceActivation(!autoVoiceActivation)}
              className={`border-purple-500/30 ${autoVoiceActivation ? 'bg-blue-600/20 text-blue-300' : 'bg-gray-800/40 text-gray-400'} hover:bg-blue-500/20`}
            >
              <Brain className="w-4 h-4 mr-1" />
              Auto-Voice {autoVoiceActivation ? 'ON' : 'OFF'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setOracleMode(!oracleMode)}
              className={`border-orange-500/30 ${oracleMode ? 'bg-orange-600/20 text-orange-300' : 'bg-gray-800/40 text-gray-400'} hover:bg-orange-500/20`}
            >
              <Eye className="w-4 h-4 mr-1" />
              Oracle {oracleMode ? 'ON' : 'OFF'}
              {oracleMode && oracleStatus?.dual_ai_ready && (
                <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
              )}
            </Button>
          </div>

          {/* Input Row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening..." : voiceEnabled ? "Speak or type your message..." : "Type your message..."}
                className="bg-gray-800/60 border-purple-500/30 text-white placeholder-purple-300/50 pr-20"
                disabled={isTyping || isListening}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                {voiceEnabled && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={isListening ? stopVoiceInput : startVoiceInput}
                    disabled={isTyping}
                    className={`p-2 h-8 w-8 ${isListening ? 'text-red-400 animate-pulse bg-red-500/20' : 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/20'}`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isTyping || isListening}
                  className="p-2 h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .stars {
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cdefs%3E%3CradialGradient id='star' cx='50%25' cy='50%25' r='1px'%3E%3Cstop offset='0%25' stop-color='%23ffffff' stop-opacity='1'/%3E%3Cstop offset='100%25' stop-color='%23ffffff' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='25' cy='25' r='1' fill='url(%23star)'/%3E%3Ccircle cx='75' cy='75' r='0.5' fill='url(%23star)'/%3E%3Ccircle cx='50' cy='10' r='0.5' fill='url(%23star)'/%3E%3Ccircle cx='10' cy='50' r='0.5' fill='url(%23star)'/%3E%3Ccircle cx='90' cy='30' r='0.5' fill='url(%23star)'/%3E%3C/svg%3E") repeat;
          animation: twinkle 3s infinite;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .nebula {
          background: radial-gradient(ellipse at 30% 40%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 60%, rgba(75, 0, 130, 0.1) 0%, transparent 50%);
          animation: drift 20s infinite linear;
        }
        
        @keyframes drift {
          0% { transform: translateX(-100px) translateY(-100px); }
          100% { transform: translateX(100px) translateY(100px); }
        }
      `}</style>
    </div>
  );
}