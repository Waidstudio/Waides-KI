import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Eye, BarChart3, History, Settings, Send, Mic, MicOff, Sparkles } from 'lucide-react';
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
}

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
  
  // Vision Spirit state
  const [activeVisionPanel, setActiveVisionPanel] = useState<'current' | 'validation' | 'stats' | 'history' | 'controls'>('current');
  const [showVisionSpirit, setShowVisionSpirit] = useState(true);
  
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

  const { data: visionHistory } = useQuery({
    queryKey: ['/api/waides-ki/vision-spirit/history'],
    refetchInterval: 20000,
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

  // Vision Spirit mutations
  const receiveVisionMutation = useMutation({
    mutationFn: () => apiRequest('/api/waides-ki/vision-spirit/receive', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/stats'] });
    }
  });

  const verifyVisionMutation = useMutation({
    mutationFn: () => apiRequest('/api/waides-ki/vision-spirit/verify', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/history'] });
    }
  });

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typewriterMessage]);

  // Typewriter effect
  const typeMessage = (message: string, type: 'konsai' | 'error' | 'konslang', confidence: number) => {
    setIsTyping(true);
    setTypewriterMessage('');
    
    let index = 0;
    const interval = setInterval(() => {
      setTypewriterMessage(message.slice(0, index + 1));
      index++;
      
      if (index >= message.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);
  };

  const sendMessage = () => {
    if (!currentMessage.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      message: currentMessage,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    chatMutation.mutate(currentMessage);
    setCurrentMessage('');
  };

  const startVoiceRecognition = () => {
    if (!speechSupported) {
      typeMessage('Voice recognition not supported in this browser', 'error', 0);
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
      typeMessage('Listening for spiritual command...', 'konslang', 90);
    };

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript;
      typeMessage(`Voice detected: "${command}"`, 'konslang', 95);
      voiceProcessingMutation.mutate(command);
    };

    recognition.onerror = (event: any) => {
      setVoiceEnabled(false);
      setIsVoiceProcessing(false);
      typeMessage(`Voice recognition error: ${event.error}`, 'error', 0);
    };

    recognition.onend = () => {
      setVoiceEnabled(false);
      if (!isVoiceProcessing) {
        typeMessage('Voice recognition complete', 'konslang', 70);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceEnabled(false);
    setIsVoiceProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Cosmic Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Vision Spirit
                  </h1>
                  <p className="text-sm text-gray-400">KonsAi Enhanced with Vision Intelligence</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                <span className="text-sm text-purple-300">Spiritual Mode Active</span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-semibold text-purple-300 mb-2">Welcome to Vision Spirit</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Experience KonsAi enhanced with spiritual vision intelligence. Ask about markets, visions, or seek divine guidance.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  message.sender === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800/60 border border-purple-500/20 text-gray-100'
                }`}>
                  {message.sender === 'konsai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Brain className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs text-purple-300 font-medium">
                        KonsAi Vision Spirit
                        {message.confidence && ` • ${message.confidence}%`}
                      </span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{message.message}</p>
                  
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
                          <div className="text-xs text-purple-300">
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
                <div className="max-w-[80%] rounded-2xl p-4 bg-gray-800/60 border border-purple-500/20 text-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Brain className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-purple-300 font-medium">KonsAi Vision Spirit</span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{typewriterMessage}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-purple-500/20">
            <div className="flex items-center gap-3 bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-3">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask KonsAi Vision Spirit..."
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
                onClick={voiceEnabled ? stopVoiceRecognition : startVoiceRecognition}
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
        </div>

        {/* Vision Spirit Floating Panels */}
        {showVisionSpirit && (
          <div className="w-96 border-l border-purple-500/20 bg-gray-900/40 backdrop-blur-sm">
            <div className="p-4 border-b border-purple-500/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-purple-300">Vision Spirit Panels</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVisionSpirit(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
            </div>

            <Tabs value={activeVisionPanel} onValueChange={(value) => setActiveVisionPanel(value as any)} className="h-full">
              <TabsList className="grid grid-cols-5 w-full bg-gray-800/60 border-b border-purple-500/20">
                <TabsTrigger value="current" className="text-xs"><Eye className="w-3 h-3" /></TabsTrigger>
                <TabsTrigger value="validation" className="text-xs"><Sparkles className="w-3 h-3" /></TabsTrigger>
                <TabsTrigger value="stats" className="text-xs"><BarChart3 className="w-3 h-3" /></TabsTrigger>
                <TabsTrigger value="history" className="text-xs"><History className="w-3 h-3" /></TabsTrigger>
                <TabsTrigger value="controls" className="text-xs"><Settings className="w-3 h-3" /></TabsTrigger>
              </TabsList>

              <div className="p-4 h-full overflow-y-auto">
                <TabsContent value="current" className="space-y-4">
                  <Card className="bg-gray-800/60 border-purple-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-purple-300">Current Vision</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {currentVision?.success && currentVision.current ? (
                        <>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white mb-1">
                              {currentVision.current.direction}
                            </div>
                            <div className="text-sm text-gray-400">
                              Energy: {(currentVision.current.energy * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Confidence:</span>
                              <span className="text-purple-300">{(currentVision.current.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Accuracy:</span>
                              <span className="text-blue-300">{(currentVision.current.accuracy * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="bg-gray-900/60 rounded-lg p-3">
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {currentVision.current.message}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No current vision</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Button
                      onClick={() => receiveVisionMutation.mutate()}
                      disabled={receiveVisionMutation.isPending}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {receiveVisionMutation.isPending ? 'Receiving...' : 'Receive Vision'}
                    </Button>
                    <Button
                      onClick={() => verifyVisionMutation.mutate()}
                      disabled={verifyVisionMutation.isPending}
                      variant="outline"
                      className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                    >
                      {verifyVisionMutation.isPending ? 'Verifying...' : 'Verify Vision'}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="validation" className="space-y-4">
                  <Card className="bg-gray-800/60 border-purple-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-purple-300">Vision Validation</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-gray-400 py-8">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Validation system active</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                  <Card className="bg-gray-800/60 border-purple-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-purple-300">Vision Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {visionStats?.success ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-gray-400">Total Visions</div>
                              <div className="text-white font-semibold">{visionStats.stats.totalVisions}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Confirmed</div>
                              <div className="text-green-400 font-semibold">{visionStats.stats.confirmedVisions}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Accuracy</div>
                              <div className="text-blue-400 font-semibold">{(visionStats.stats.accuracy * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Confidence</div>
                              <div className="text-purple-400 font-semibold">{(visionStats.stats.averageConfidence * 100).toFixed(1)}%</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No statistics available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <Card className="bg-gray-800/60 border-purple-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-purple-300">Vision History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {visionHistory?.success && visionHistory.history?.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {visionHistory.history.slice(0, 5).map((vision: any, index: number) => (
                            <div key={index} className="bg-gray-900/60 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-white">{vision.direction}</span>
                                <span className="text-xs text-gray-400">
                                  {new Date(vision.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400">
                                Confidence: {(vision.confidence * 100).toFixed(1)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No vision history</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="controls" className="space-y-4">
                  <Card className="bg-gray-800/60 border-purple-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-purple-300">Vision Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-gray-400 py-8">
                      <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Control panel active</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}

        {/* Floating Action Button to show panels if hidden */}
        {!showVisionSpirit && (
          <div className="fixed bottom-6 right-6">
            <Button
              onClick={() => setShowVisionSpirit(true)}
              className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg"
              title="Show Vision Spirit Panels"
            >
              <Eye className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}