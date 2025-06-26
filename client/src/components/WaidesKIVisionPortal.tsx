import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mic, Send, Plus, Settings, Brain, Zap, TrendingUp, Eye, Sparkles, MicOff, Volume2, VolumeX, Moon, Sun, Star, Heart, Shield, Flame, Wand2, Gem, Compass } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'waides';
  message: string;
  timestamp: Date;
  personality?: string;
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
  const [spiritualEnergy, setSpiritualEnergy] = useState(75);
  const [consciousnessLevel, setConsciousnessLevel] = useState(3);
  const [auraIntensity, setAuraIntensity] = useState(50);
  const [prophecyMode, setProphecyMode] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const queryClient = useQueryClient();

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
      const response = await fetch('/api/waides-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.response) {
        typeWaidesResponse(data.response);
      }
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
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
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
    chatMutation.mutate({ message: currentMessage, personality });
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

      {/* Quick Suggestions */}
      <div className="relative z-10 flex justify-center gap-2 mt-8 px-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="border-purple-500/30 bg-gray-800/40 text-purple-300 hover:bg-purple-500/20"
          onClick={() => setCurrentMessage("Predict ETH price for next hour")}
        >
          📈 Predict ETH Now
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-purple-500/30 bg-gray-800/40 text-purple-300 hover:bg-purple-500/20"
          onClick={() => setCurrentMessage("Show my wallet growth and trading performance")}
        >
          🧠 Show Wallet Growth
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-purple-500/30 bg-gray-800/40 text-purple-300 hover:bg-purple-500/20"
          onClick={() => setCurrentMessage("Give me a spiritual trading vision")}
        >
          🧘‍♂️ Ask for Vision
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
                      <div className="text-xs text-purple-400 mb-1">
                        💫 Waides KI • {currentPersonality?.name} Mode
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.message}</p>
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

          {/* Input Row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything..."
                className="bg-gray-800/60 border-purple-500/30 text-white placeholder-purple-300/50 pr-20"
                disabled={isTyping}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={startVoiceInput}
                  disabled={isListening || isTyping}
                  className={`p-2 h-8 w-8 ${isListening ? 'text-red-400 animate-pulse' : 'text-purple-400 hover:text-purple-300'}`}
                >
                  <Mic className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="p-2 h-8 w-8 text-purple-400 hover:text-purple-300"
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