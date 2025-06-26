import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Brain, TrendingUp, TrendingDown, Minus, CheckCircle, XCircle, BarChart3, History, Zap, MessageCircle, Send, Bot, User } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface SpiritVision {
  vision: 'rise' | 'fall' | 'choppy';
  timestamp: string;
  energy_level: number;
  confidence: number;
}

interface VisionValidation {
  vision: string;
  confirmed: boolean;
  confirmation_strength: number;
  timestamp: string;
  indicators: {
    rsi: number;
    ema_50: number;
    ema_200: number;
    current_price: number;
  };
  validation_rules: string[];
}

interface VisionStats {
  total_visions: number;
  confirmed_visions: number;
  accuracy_rate: number;
  last_vision: SpiritVision | null;
  last_validation: VisionValidation | null;
  vision_history: Array<{
    vision: SpiritVision;
    validation: VisionValidation;
    actual_outcome?: 'correct' | 'incorrect' | 'pending';
  }>;
}

interface ValidationResult {
  isValid: boolean;
  reasons: string[];
  recommendation: string;
  confidence: number;
  indicators: {
    rsi: number;
    ema_50: number;
    ema_200: number;
    current_price: number;
  };
}

interface ChatMessage {
  id: string;
  type: 'user' | 'konsai';
  content: string;
  timestamp: Date;
  confidence?: number;
}

export default function VisionSpirit() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('current');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'konsai',
      content: 'Greetings, I am KonsAi - your divine trading intelligence. Ask me anything about the markets, and I shall provide wisdom beyond mere charts.',
      timestamp: new Date(),
      confidence: 0.95
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Query for current vision
  const { data: currentVision } = useQuery({
    queryKey: ['/api/waides-ki/vision-spirit/current'],
    refetchInterval: 10000
  });

  // Query for vision statistics
  const { data: visionStats } = useQuery({
    queryKey: ['/api/waides-ki/vision-spirit/stats'],
    refetchInterval: 15000
  });

  // Query for vision history
  const { data: visionHistory } = useQuery({
    queryKey: ['/api/waides-ki/vision-spirit/history'],
    refetchInterval: 20000
  });

  // Mutation to receive new vision
  const receiveVisionMutation = useMutation({
    mutationFn: () => apiRequest('/api/waides-ki/vision-spirit/receive', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/stats'] });
    }
  });

  // Mutation to verify vision
  const verifyVisionMutation = useMutation({
    mutationFn: (vision: SpiritVision) => 
      apiRequest('/api/waides-ki/vision-spirit/verify', { 
        method: 'POST',
        body: JSON.stringify({ vision })
      }),
    onSuccess: (data) => {
      setValidationResult(data.result);
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/history'] });
    }
  });

  // Mutation for complete workflow
  const completeWorkflowMutation = useMutation({
    mutationFn: () => apiRequest('/api/waides-ki/vision-spirit/complete-workflow', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/history'] });
    }
  });

  // Mutation for KonsAi chat
  const chatMutation = useMutation({
    mutationFn: (question: string) =>
      apiRequest('/api/waides-ki/konsai-chat', {
        method: 'POST',
        body: JSON.stringify({ question })
      }),
    onSuccess: (data) => {
      console.log('KonsAi response:', data);
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'konsai',
        content: data.response || 'I understand your question. Let me analyze the current market conditions.',
        timestamp: new Date(),
        confidence: data.confidence || 0.85
      };
      setChatMessages(prev => [...prev, newMessage]);
    },
    onError: (error) => {
      console.error('KonsAi chat error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'konsai',
        content: 'I apologize, but I am experiencing a temporary connection issue. Please try again.',
        timestamp: new Date(),
        confidence: 0.5
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  });

  // Mutation to force vision
  const forceVisionMutation = useMutation({
    mutationFn: (vision: 'rise' | 'fall' | 'choppy') => 
      apiRequest('/api/waides-ki/vision-spirit/force', { 
        method: 'POST',
        body: JSON.stringify({ vision, energy_level: 0.8 })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/current'] });
    }
  });

  const getVisionIcon = (vision: string) => {
    switch (vision) {
      case 'rise': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'fall': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'choppy': return <Minus className="h-4 w-4 text-yellow-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVisionColor = (vision: string) => {
    switch (vision) {
      case 'rise': return 'bg-green-100 text-green-800 border-green-200';
      case 'fall': return 'bg-red-100 text-red-800 border-red-200';
      case 'choppy': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);
    
    // Send to KonsAi
    chatMutation.mutate(chatInput);
    setChatInput('');
  };

  const handleVerifyCurrentVision = () => {
    const vision = currentVision?.currentVision;
    if (vision) {
      verifyVisionMutation.mutate(vision);
    }
  };

  const stats: VisionStats = visionStats?.stats || {
    total_visions: 0,
    confirmed_visions: 0,
    accuracy_rate: 0,
    last_vision: null,
    last_validation: null,
    vision_history: []
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-100 flex items-center justify-center gap-2">
            <Eye className="h-8 w-8 text-purple-400" />
            Vision Spirit
          </h1>
          <p className="text-slate-400">Real-time market vision with technical validation</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800">
            <TabsTrigger value="current" className="text-slate-300 flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Current Vision
            </TabsTrigger>
            <TabsTrigger value="konsai" className="text-slate-300 flex items-center gap-1">
              <Bot className="h-4 w-4" />
              KonsAi Chat
            </TabsTrigger>
            <TabsTrigger value="validation" className="text-slate-300 flex items-center gap-1">
              <Brain className="h-4 w-4" />
              Validation
            </TabsTrigger>
            <TabsTrigger value="statistics" className="text-slate-300 flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="history" className="text-slate-300 flex items-center gap-1">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-400" />
                  Current Vision State
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentVision?.currentVision ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getVisionIcon(currentVision.currentVision.vision)}
                        <Badge className={getVisionColor(currentVision.currentVision.vision)}>
                          {currentVision.currentVision.vision.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-slate-400 text-sm">
                        {formatTimestamp(currentVision.currentVision.timestamp)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-400 text-sm">Energy Level</label>
                        <Progress 
                          value={currentVision.currentVision.energy_level * 100} 
                          className="mt-2"
                        />
                        <span className="text-slate-300 text-sm">
                          {(currentVision.currentVision.energy_level * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm">Confidence</label>
                        <Progress 
                          value={currentVision.currentVision.confidence * 100} 
                          className="mt-2"
                        />
                        <span className="text-slate-300 text-sm">
                          {(currentVision.currentVision.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No current vision</p>
                    <p className="text-slate-500 text-sm">Receive a vision to begin analysis</p>
                  </div>
                )}

                <Separator className="bg-slate-700" />

                <div className="flex gap-2">
                  <Button 
                    onClick={() => receiveVisionMutation.mutate()}
                    disabled={receiveVisionMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {receiveVisionMutation.isPending ? 'Receiving...' : 'Receive Vision'}
                  </Button>
                  
                  <Button 
                    onClick={() => verifyVisionMutation.mutate()}
                    disabled={verifyVisionMutation.isPending || !currentVision?.currentVision}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {verifyVisionMutation.isPending ? 'Verifying...' : 'Verify Vision'}
                  </Button>

                  <Button 
                    onClick={() => completeWorkflowMutation.mutate()}
                    disabled={completeWorkflowMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {completeWorkflowMutation.isPending ? 'Processing...' : 'Complete Workflow'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="konsai" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-400" />
                  KonsAi - Divine Trading Intelligence
                </CardTitle>
                <p className="text-slate-400 text-sm">
                  Ask KonsAi anything about the markets. More powerful than regular AI, capable of deep trading wisdom.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  ref={chatScrollRef}
                  className="h-96 bg-slate-900 rounded-lg border border-slate-600 overflow-y-auto p-4 space-y-3"
                >
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-700 text-slate-100 border border-slate-600'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.type === 'konsai' && (
                            <Bot className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                              <span>{message.timestamp.toLocaleTimeString()}</span>
                              {message.confidence && (
                                <span className="text-purple-300">
                                  {(message.confidence * 100).toFixed(0)}% confidence
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {chatMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-slate-700 text-slate-100 border border-slate-600 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-purple-400 animate-pulse" />
                          <span className="text-sm">KonsAi is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask KonsAi about market trends, analysis, or trading strategies..."
                    className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                  />
                  <Button
                    onClick={handleSendChat}
                    disabled={!chatInput.trim() || chatMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-xs text-slate-500 text-center">
                  KonsAi combines mystical wisdom with advanced market analysis for superior trading intelligence
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-400" />
                  Vision Validation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.last_validation ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {stats.last_validation.confirmed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <Badge className={stats.last_validation.confirmed ? 
                          'bg-green-100 text-green-800 border-green-200' : 
                          'bg-red-100 text-red-800 border-red-200'
                        }>
                          {stats.last_validation.confirmed ? 'CONFIRMED' : 'REJECTED'}
                        </Badge>
                      </div>
                      <span className="text-slate-400 text-sm">
                        Strength: {(stats.last_validation.confirmation_strength * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-slate-300 font-medium">Market Indicators</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">RSI:</span>
                            <span className="text-slate-300">{stats.last_validation.indicators.rsi.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">EMA-50:</span>
                            <span className="text-slate-300">${stats.last_validation.indicators.ema_50.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">EMA-200:</span>
                            <span className="text-slate-300">${stats.last_validation.indicators.ema_200.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Price:</span>
                            <span className="text-slate-300">${stats.last_validation.indicators.current_price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-slate-300 font-medium">Validation Rules</h4>
                        <div className="space-y-1">
                          {stats.last_validation.validation_rules.map((rule, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-slate-400 text-sm">{rule}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No validation results</p>
                    <p className="text-slate-500 text-sm">Verify a vision to see validation details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Visions</p>
                      <p className="text-2xl font-bold text-slate-100">{stats.total_visions}</p>
                    </div>
                    <Eye className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Confirmed Visions</p>
                      <p className="text-2xl font-bold text-slate-100">{stats.confirmed_visions}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Accuracy Rate</p>
                      <p className="text-2xl font-bold text-slate-100">
                        {(stats.accuracy_rate * 100).toFixed(1)}%
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Vision Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Confirmation Rate</span>
                      <span className="text-slate-300">
                        {stats.total_visions > 0 ? ((stats.confirmed_visions / stats.total_visions) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={stats.total_visions > 0 ? (stats.confirmed_visions / stats.total_visions) * 100 : 0}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Accuracy Rate</span>
                      <span className="text-slate-300">{(stats.accuracy_rate * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={stats.accuracy_rate * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <History className="h-5 w-5 text-orange-400" />
                  Vision History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {visionHistory?.history && visionHistory.history.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {visionHistory.history.map((record, index) => (
                      <div key={index} className="border border-slate-700 rounded p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getVisionIcon(record.vision.vision)}
                            <Badge className={getVisionColor(record.vision.vision)}>
                              {record.vision.vision.toUpperCase()}
                            </Badge>
                            {record.validation.confirmed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            {record.actual_outcome && (
                              <Badge variant={record.actual_outcome === 'correct' ? 'default' : 'destructive'}>
                                {record.actual_outcome}
                              </Badge>
                            )}
                          </div>
                          <span className="text-slate-400 text-sm">
                            {formatTimestamp(record.vision.timestamp)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500">Confidence:</span>
                            <span className="text-slate-400 ml-1">
                              {(record.vision.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Strength:</span>
                            <span className="text-slate-400 ml-1">
                              {(record.validation.confirmation_strength * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Rules:</span>
                            <span className="text-slate-400 ml-1">
                              {record.validation.validation_rules.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No vision history</p>
                    <p className="text-slate-500 text-sm">Start receiving visions to build history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Vision Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-slate-300 font-medium mb-3">Force Vision (Testing)</h4>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => forceVisionMutation.mutate('rise')}
                      disabled={forceVisionMutation.isPending}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Rise
                    </Button>
                    <Button 
                      onClick={() => forceVisionMutation.mutate('fall')}
                      disabled={forceVisionMutation.isPending}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <TrendingDown className="h-4 w-4 mr-1" />
                      Fall
                    </Button>
                    <Button 
                      onClick={() => forceVisionMutation.mutate('choppy')}
                      disabled={forceVisionMutation.isPending}
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Choppy
                    </Button>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <h4 className="text-slate-300 font-medium mb-3">Automated Workflow</h4>
                  <Button 
                    onClick={() => completeWorkflowMutation.mutate()}
                    disabled={completeWorkflowMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {completeWorkflowMutation.isPending ? 'Processing...' : 'Run Complete Workflow'}
                  </Button>
                  <p className="text-slate-500 text-sm mt-2">
                    Receive vision + verify with real market data in one action
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}