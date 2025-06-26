import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Brain, Sparkles, Zap, Eye, Heart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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

export default function ChatOracleSystem() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🚀 Waides KI Oracle System Online:\n\nAdvanced AI assistant combining ChatGPT intelligence, Incite AI market analysis, and KonsLang command processing. Ask me anything about trading strategies, market analysis, or technical questions. Ready to assist with your trading decisions. 📊',
      timestamp: new Date(),
      source: 'konslang',
      confidence: 100
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Get Oracle Status
  const { data: oracleStatus } = useQuery<OracleStatus>({
    queryKey: ['/api/chat/oracle/status'],
    refetchInterval: 30000
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/chat/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context: messages.slice(-10) })
      });
      return response.json();
    },
    onSuccess: (data: OracleResponse & { success: boolean }) => {
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.answer,
          timestamp: new Date(),
          source: data.source,
          confidence: data.confidence,
          konslangProcessing: data.konslangProcessing
        };
        setMessages(prev => [...prev, assistantMessage]);
        typeMessage(data.answer);
      }
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Typing effect
  const typeMessage = async (text: string) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsTyping(false);
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(currentMessage);
    setCurrentMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'incite': return <Brain className="w-4 h-4 text-blue-400" />;
      case 'chatgpt': return <Zap className="w-4 h-4 text-green-400" />;
      case 'spiritual': return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'combined': return <Eye className="w-4 h-4 text-gold-400" />;
      default: return <Heart className="w-4 h-4 text-pink-400" />;
    }
  };

  const getSourceColor = (source?: string) => {
    switch (source) {
      case 'incite': return 'bg-blue-900/20 border-blue-500/30';
      case 'chatgpt': return 'bg-green-900/20 border-green-500/30';
      case 'spiritual': return 'bg-purple-900/20 border-purple-500/30';
      case 'combined': return 'bg-gold-900/20 border-gold-500/30';
      default: return 'bg-gray-900/20 border-gray-500/30';
    }
  };

  const quickSuggestions = [
    "What's the current ETH price trend?",
    "How do I overcome fear in trading?",
    "Should I buy ETH now?",
    "Guide me with spiritual trading wisdom",
    "Analyze the market sentiment",
    "What does the future hold for crypto?"
  ];

  return (
    <div className="space-y-6">
      {/* Oracle Status Header */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageCircle className="w-6 h-6 text-purple-400" />
              Waides KI Chat Oracle System
            </CardTitle>
            <div className="flex items-center gap-2">
              {oracleStatus && (
                <>
                  <Badge variant={oracleStatus.api_status.chatgpt ? "default" : "secondary"} className="text-xs">
                    ChatGPT {oracleStatus.api_status.chatgpt ? "✓" : "✗"}
                  </Badge>
                  <Badge variant={oracleStatus.api_status.incite ? "default" : "secondary"} className="text-xs">
                    Incite AI {oracleStatus.api_status.incite ? "✓" : "✗"}
                  </Badge>
                  <Badge variant="default" className="text-xs bg-purple-600">
                    Spiritual ✓
                  </Badge>
                </>
              )}
            </div>
          </div>
          {oracleStatus && (
            <p className="text-sm text-gray-300">{oracleStatus.message}</p>
          )}
        </CardHeader>
      </Card>

      {/* Chat Interface */}
      <Card className="bg-black/40 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Real-Time Oracle Chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages Area */}
          <ScrollArea className="h-96 w-full pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : `${getSourceColor(message.source)} border`
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        {getSourceIcon(message.source)}
                        <span className="text-xs font-medium text-gray-300">
                          {message.source?.toUpperCase() || 'ORACLE'}
                        </span>
                        {message.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {message.confidence}% confident
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    {message.konslangProcessing && (
                      <div className="mt-2 p-2 bg-purple-900/30 rounded border-l-2 border-purple-400">
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span className="text-xs font-medium text-purple-300">KonsLang Processing</span>
                        </div>
                        <p className="text-xs text-gray-300">{message.konslangProcessing}</p>
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span className="text-sm text-gray-300">Oracle is channeling wisdom...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator />

          {/* Quick Suggestions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-300">Quick Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setCurrentMessage(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Waides KI Oracle anything..."
              className="flex-1"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || sendMessageMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {sendMessageMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Sending
                </div>
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Oracle Stats */}
          {oracleStatus && (
            <div className="flex justify-between text-xs text-gray-400 pt-2">
              <span>Dual-AI Ready: {oracleStatus.dual_ai_ready ? "Yes" : "No"}</span>
              <span>Spiritual Layer: Always Active</span>
              <span>Messages: {messages.length}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}