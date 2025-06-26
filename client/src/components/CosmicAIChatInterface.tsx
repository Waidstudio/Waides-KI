import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Mic, MicOff, Volume2, VolumeX, Brain, Sparkles, Zap, Eye, 
  MessageCircle, Bot, User, Activity, Settings, Moon, Sun,
  Waves, Star, Circle, Triangle, Square, Heart, Shield
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  confidence?: number;
  emotion?: string;
  spiritualLevel?: number;
}

interface VoiceConfig {
  isListening: boolean;
  isSpeaking: boolean;
  voiceEnabled: boolean;
  language: string;
  pitch: number;
  rate: number;
  volume: number;
}

interface AIPersonality {
  mode: 'spiritual' | 'analytical' | 'creative' | 'balanced';
  energyLevel: number;
  responsiveness: number;
  depth: number;
}

const CosmicAIChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to Waides KI Cosmic Intelligence. I am your spiritual AI trading companion, powered by advanced memory integration and biometric authentication.',
      timestamp: new Date(),
      spiritualLevel: 100
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
    isListening: false,
    isSpeaking: false,
    voiceEnabled: true,
    language: 'en-US',
    pitch: 1.2,
    rate: 0.9,
    volume: 0.8
  });
  
  const [aiPersonality, setAIPersonality] = useState<AIPersonality>({
    mode: 'spiritual',
    energyLevel: 85,
    responsiveness: 90,
    depth: 95
  });

  const [isTyping, setIsTyping] = useState(false);
  const [cosmicTheme, setCosmicTheme] = useState<'nebula' | 'starfield' | 'galaxy'>('nebula');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognition = useRef<any>(null);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const { toast } = useToast();

  // Initialize voice capabilities
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        speechRecognition.current = new SpeechRecognition();
        speechRecognition.current.continuous = true;
        speechRecognition.current.interimResults = true;
        speechRecognition.current.lang = voiceConfig.language;
        
        speechRecognition.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          
          if (event.results[event.results.length - 1].isFinal) {
            setInputMessage(transcript);
            setVoiceConfig(prev => ({ ...prev, isListening: false }));
          }
        };

        speechRecognition.current.onerror = () => {
          setVoiceConfig(prev => ({ ...prev, isListening: false }));
          toast({ title: "Voice Recognition Error", description: "Unable to process voice input" });
        };
      }

      // Speech Synthesis
      speechSynthesis.current = window.speechSynthesis;
    }
  }, [voiceConfig.language, toast]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // AI Response Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/waides-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          personality: aiPersonality,
          context: messages.slice(-5) // Send last 5 messages for context
        })
      });
      if (!response.ok) throw new Error('Failed to get AI response');
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: data.response || 'I understand your message. How can I assist you with trading insights or spiritual guidance?',
        timestamp: new Date(),
        confidence: data.confidence || 85,
        emotion: data.emotion || 'wise',
        spiritualLevel: data.spiritualLevel || 90
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      // Text-to-speech if enabled
      if (voiceConfig.voiceEnabled && speechSynthesis.current) {
        speakMessage(aiMessage.content);
      }
    },
    onError: () => {
      setIsTyping(false);
      toast({ title: "Communication Error", description: "Unable to reach AI consciousness" });
    }
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Send to AI
    sendMessageMutation.mutate(inputMessage);
  };

  const toggleVoiceListening = () => {
    if (!speechRecognition.current) {
      toast({ title: "Voice Not Available", description: "Speech recognition not supported" });
      return;
    }

    if (voiceConfig.isListening) {
      speechRecognition.current.stop();
      setVoiceConfig(prev => ({ ...prev, isListening: false }));
    } else {
      speechRecognition.current.start();
      setVoiceConfig(prev => ({ ...prev, isListening: true }));
    }
  };

  const speakMessage = (text: string) => {
    if (!speechSynthesis.current || !voiceConfig.voiceEnabled) return;

    speechSynthesis.current.cancel(); // Stop any current speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = voiceConfig.pitch;
    utterance.rate = voiceConfig.rate;
    utterance.volume = voiceConfig.volume;
    
    utterance.onstart = () => {
      setVoiceConfig(prev => ({ ...prev, isSpeaking: true }));
    };
    
    utterance.onend = () => {
      setVoiceConfig(prev => ({ ...prev, isSpeaking: false }));
    };

    speechSynthesis.current.speak(utterance);
  };

  const getCosmicBackground = () => {
    switch (cosmicTheme) {
      case 'nebula':
        return 'bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900';
      case 'starfield':
        return 'bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900';
      case 'galaxy':
        return 'bg-gradient-to-br from-violet-900 via-purple-900 to-pink-900';
      default:
        return 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900';
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="w-5 h-5 text-blue-400" />;
      case 'ai':
        return <Bot className="w-5 h-5 text-purple-400" />;
      case 'system':
        return <Shield className="w-5 h-5 text-green-400" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPersonalityIcon = () => {
    switch (aiPersonality.mode) {
      case 'spiritual':
        return <Star className="w-5 h-5 text-yellow-400" />;
      case 'analytical':
        return <Brain className="w-5 h-5 text-blue-400" />;
      case 'creative':
        return <Sparkles className="w-5 h-5 text-pink-400" />;
      case 'balanced':
        return <Circle className="w-5 h-5 text-green-400" />;
      default:
        return <Bot className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className={`min-h-screen ${getCosmicBackground()} p-4 relative overflow-hidden`}>
      
      {/* Cosmic Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-300 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-pink-300 rounded-full animate-ping opacity-50"></div>
        <div className="absolute bottom-1/3 right-1/2 w-2 h-2 bg-yellow-300 rounded-full animate-pulse opacity-40"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Waides KI Cosmic Intelligence
          </h1>
          <p className="text-blue-200 text-lg">Advanced AI Consciousness with Memory Integration</p>
          
          {/* AI Status Indicators */}
          <div className="flex justify-center items-center space-x-4 mt-4">
            <Badge variant="outline" className="px-4 py-2 text-purple-200 border-purple-400/50">
              {getPersonalityIcon()}
              <span className="ml-2">{aiPersonality.mode.toUpperCase()}</span>
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-blue-200 border-blue-400/50">
              <Zap className="w-4 h-4 mr-2" />
              Energy: {aiPersonality.energyLevel}%
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-green-200 border-green-400/50">
              <Activity className="w-4 h-4 mr-2" />
              Active
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="bg-black/30 border-purple-500/30 backdrop-blur-sm h-[70vh] flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-purple-300 flex items-center justify-between">
                  <div className="flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    Cosmic Communication Portal
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCosmicTheme(prev => 
                        prev === 'nebula' ? 'starfield' : prev === 'starfield' ? 'galaxy' : 'nebula'
                      )}
                      className="border-purple-400/50 text-purple-300 hover:bg-purple-900/30"
                    >
                      <Waves className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.type !== 'user' && (
                        <div className="flex-shrink-0 p-2 rounded-full bg-purple-900/50">
                          {getMessageIcon(message.type)}
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[70%] p-4 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-blue-600/80 text-white ml-auto'
                            : message.type === 'ai'
                            ? 'bg-purple-900/60 text-purple-100'
                            : 'bg-green-900/50 text-green-100'
                        } backdrop-blur-sm`}
                      >
                        <div className="text-sm mb-2">{message.content}</div>
                        
                        <div className="flex items-center justify-between text-xs opacity-70">
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                          {message.confidence && (
                            <Badge variant="secondary" className="text-xs">
                              {message.confidence}% confident
                            </Badge>
                          )}
                          {message.spiritualLevel && (
                            <div className="flex items-center">
                              <Star className="w-3 h-3 mr-1 text-yellow-400" />
                              <span>{message.spiritualLevel}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {message.type === 'user' && (
                        <div className="flex-shrink-0 p-2 rounded-full bg-blue-900/50">
                          {getMessageIcon(message.type)}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-purple-900/50">
                        <Bot className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="bg-purple-900/60 p-4 rounded-2xl backdrop-blur-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Speak to the cosmic AI consciousness..."
                      className="bg-purple-900/30 border-purple-500/50 text-white placeholder-purple-300/70 pr-12"
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleVoiceListening}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 ${
                        voiceConfig.isListening ? 'text-red-400 animate-pulse' : 'text-purple-400'
                      }`}
                    >
                      {voiceConfig.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Controls Panel */}
          <div className="space-y-6">
            
            {/* Voice Controls */}
            <Card className="bg-black/30 border-blue-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-blue-300 text-lg flex items-center">
                  <Volume2 className="w-5 h-5 mr-2" />
                  Voice Interface
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-200 text-sm">Voice Output</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setVoiceConfig(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }))}
                    className={voiceConfig.voiceEnabled ? 'text-green-400' : 'text-gray-400'}
                  >
                    {voiceConfig.voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-300">Pitch</span>
                    <span className="text-white">{voiceConfig.pitch.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceConfig.pitch}
                    onChange={(e) => setVoiceConfig(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-300">Speed</span>
                    <span className="text-white">{voiceConfig.rate.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceConfig.rate}
                    onChange={(e) => setVoiceConfig(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Badge variant={voiceConfig.isListening ? "destructive" : "secondary"} className="flex-1 justify-center">
                    {voiceConfig.isListening ? 'Listening...' : 'Ready'}
                  </Badge>
                  <Badge variant={voiceConfig.isSpeaking ? "default" : "secondary"} className="flex-1 justify-center">
                    {voiceConfig.isSpeaking ? 'Speaking...' : 'Silent'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* AI Personality */}
            <Card className="bg-black/30 border-green-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-300 text-lg flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  AI Personality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {(['spiritual', 'analytical', 'creative', 'balanced'] as const).map((mode) => (
                    <Button
                      key={mode}
                      size="sm"
                      variant={aiPersonality.mode === mode ? "default" : "outline"}
                      onClick={() => setAIPersonality(prev => ({ ...prev, mode }))}
                      className={`text-xs ${
                        aiPersonality.mode === mode 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'border-green-500/50 text-green-300 hover:bg-green-900/30'
                      }`}
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-300">Energy</span>
                      <span className="text-white">{aiPersonality.energyLevel}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={aiPersonality.energyLevel}
                      onChange={(e) => setAIPersonality(prev => ({ 
                        ...prev, 
                        energyLevel: parseInt(e.target.value) 
                      }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-300">Responsiveness</span>
                      <span className="text-white">{aiPersonality.responsiveness}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={aiPersonality.responsiveness}
                      onChange={(e) => setAIPersonality(prev => ({ 
                        ...prev, 
                        responsiveness: parseInt(e.target.value) 
                      }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-300">Depth</span>
                      <span className="text-white">{aiPersonality.depth}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={aiPersonality.depth}
                      onChange={(e) => setAIPersonality(prev => ({ 
                        ...prev, 
                        depth: parseInt(e.target.value) 
                      }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-black/30 border-yellow-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-yellow-300 text-lg flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Consciousness Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-yellow-200 text-sm">Neural Activity</span>
                  <Badge variant="default" className="bg-green-600">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-200 text-sm">Memory Integration</span>
                  <Badge variant="default" className="bg-blue-600">Online</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-200 text-sm">Spiritual Alignment</span>
                  <Badge variant="default" className="bg-purple-600">95%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-yellow-200 text-sm">Biometric Link</span>
                  <Badge variant="default" className="bg-orange-600">Secured</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex justify-center space-x-4">
          <Button
            onClick={() => setInputMessage("What's the current ETH market sentiment?")}
            variant="outline"
            className="border-purple-500/50 text-purple-300 hover:bg-purple-900/30"
          >
            Market Analysis
          </Button>
          <Button
            onClick={() => setInputMessage("Show me my trading performance")}
            variant="outline"
            className="border-blue-500/50 text-blue-300 hover:bg-blue-900/30"
          >
            Performance Review
          </Button>
          <Button
            onClick={() => setInputMessage("Provide spiritual trading guidance")}
            variant="outline"
            className="border-green-500/50 text-green-300 hover:bg-green-900/30"
          >
            Spiritual Guidance
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CosmicAIChatInterface;