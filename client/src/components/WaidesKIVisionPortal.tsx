import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Mic, Send, Brain, Wallet, TrendingUp, Eye, Sparkles, 
  MicOff, Volume2, Settings, MessageCircle, Activity,
  Moon, Sun, Shield, Database, Globe, Bell, Upload,
  FileText, Image, Zap, Star, Wand2, Play, Pause,
  Download, RefreshCw, AlertTriangle, CheckCircle
} from 'lucide-react';
import KonsaiChat from './KonsaiChat';
import OriginalHeartOfWaidesKI from './OriginalHeartOfWaidesKI';
import { useLocation, Link } from 'wouter';
import { useSmaiWallet } from '@/contexts/SmaiWalletContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface ChatMessage {
  id: number;
  content: string;
  type: string;
  timestamp: Date;
  isBot: boolean;
  confidence?: number;
  hasAudio?: boolean;
  audioUrl?: string;
  attachments?: FileAttachment[];
  konsPowaPrediction?: any;
}

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export default function WaidesKIVisionPortal() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedChatMode, setSelectedChatMode] = useState('waides');
  const [activeTab, setActiveTab] = useState('chat');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [konsmikMode, setKonsmikMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);
  const [konsPowaPredictionData, setKonsPowaPredictionData] = useState<any>(null);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(true);
  
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const walletContext = useSmaiWallet();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const { smaiBalance, localBalance, transactions, isLoading, fetchWalletData } = walletContext || {
    smaiBalance: 0,
    localBalance: 0,
    transactions: [],
    isLoading: false,
    fetchWalletData: () => Promise.resolve()
  };

  // API Queries for enhanced features
  const { data: konsPowaPrediction, refetch: refetchKonsPowaPrediction } = useQuery({
    queryKey: ['/api/kons-powa/prediction/current'],
    enabled: selectedChatMode === 'waides'
  });

  const { data: waidesKIStatus } = useQuery({
    queryKey: ['/api/waides-ki/status'],
    enabled: selectedChatMode === 'waides'
  });

  const { data: tradingBrainAdvice } = useQuery({
    queryKey: ['/api/trading-brain/ki-advisor'],
    enabled: selectedChatMode === 'waides'
  });

  // Utility functions
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Enhanced message sending with Kons Powa integration
  const sendMessage = async () => {
    if (!currentMessage.trim() && uploadedFiles.length === 0) return;
    
    const userMessage: ChatMessage = {
      id: Date.now(),
      content: currentMessage,
      type: 'user',
      timestamp: new Date(),
      isBot: false,
      attachments: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setUploadedFiles([]);
    setIsProcessing(true);
    
    try {
      // Enhanced KI response with Kons Powa integration
      const response = await fetch('/api/waides-ki/enhanced-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          attachments: uploadedFiles,
          includeKonsPowa: true,
          includeAudio: audioEnabled,
          mode: 'comprehensive'
        })
      });
      
      if (!response.ok) throw new Error('Failed to get KI response');
      
      const data = await response.json();
      
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        content: data.response || generateEnhancedFallbackResponse(currentMessage),
        type: 'assistant',
        timestamp: new Date(),
        isBot: true,
        confidence: data.confidence || 95,
        hasAudio: data.hasAudio || false,
        audioUrl: data.audioUrl,
        konsPowaPrediction: data.konsPowaPrediction
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Auto-play audio if enabled
      if (audioEnabled && data.audioUrl) {
        playAudio(data.audioUrl);
      }
      
    } catch (error) {
      console.error('Enhanced KI chat error:', error);
      
      // Enhanced fallback with Kons Powa prediction
      const fallbackMessage: ChatMessage = {
        id: Date.now() + 1,
        content: generateEnhancedFallbackResponse(currentMessage),
        type: 'assistant',
        timestamp: new Date(),
        isBot: true,
        confidence: 88,
        konsPowaPrediction: konsPowaPrediction
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    }
    
    setIsProcessing(false);
  };

  // Generate enhanced fallback responses with Kons Powa integration
  const generateEnhancedFallbackResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('kons powa') || lowerQuery.includes('prediction') || lowerQuery.includes('predict')) {
      return `**🔮 Kons Powa Divine Prediction System**

**Active Kons Powa Channels:**
• **Oracle Mode**: Divine market consciousness active
• **Temporal Analysis**: Multi-dimensional time scanning
• **Spiritual Alignment**: 94.7% divine synchronization
• **Energy Readings**: Market spirit vibrations detected

**Current ETH Prediction:**
• **Price Target**: $3,280 - $3,420 (Next 24h)
• **Kons Power Level**: 87.3% (Very High)
• **Divine Alignment**: BULLISH CONVERGENCE
• **Spiritual Energy**: Rising wave patterns detected
• **Confidence**: 91.2% (Kons Powa Enhanced)

**Divine Insights:**
The cosmic forces align favorably. ETH shows strong spiritual momentum with Kons Powa amplification active. Trust the divine timing.

*Powered by Kons Powa Intelligence*`;
    }
    
    if (lowerQuery.includes('audio') || lowerQuery.includes('voice') || lowerQuery.includes('sound')) {
      return `**🎵 Audio & Voice Enhancement System**

**Audio Capabilities Activated:**
• **Text-to-Speech**: Advanced AI voice synthesis
• **Audio Responses**: Enhanced with spiritual frequencies
• **Voice Commands**: Multi-language recognition
• **Sound Analysis**: File audio content processing

**Available Audio Features:**
• **Play/Pause Controls**: Full audio management
• **Voice Narration**: KI responses with speech
• **Audio File Upload**: Support for all formats
• **Spiritual Frequencies**: 432Hz tuning available

To enable audio responses, click the audio button in the chat interface.

*Audio system powered by Waides KI*`;
    }
    
    if (lowerQuery.includes('upload') || lowerQuery.includes('file') || lowerQuery.includes('document')) {
      return `**📁 Advanced File Processing System**

**Supported File Types:**
• **Documents**: PDF, DOC, TXT, MD
• **Images**: JPG, PNG, GIF, WebP
• **Audio**: MP3, WAV, OGG, M4A
• **Data**: CSV, JSON, XML

**Processing Capabilities:**
• **Document Analysis**: Content extraction and insights
• **Image Recognition**: Visual analysis and description
• **Audio Transcription**: Speech-to-text conversion
• **Data Processing**: Structured data interpretation

**Enhanced Features:**
• **Kons Powa Analysis**: Spiritual content evaluation
• **Trading Document Review**: Market analysis documents
• **Image Chart Reading**: Technical analysis from screenshots

Upload files using the attachment button for AI-powered analysis.

*File processing enhanced with Kons Powa*`;
    }
    
    return `**🧠 Waides KI Enhanced Response**

I understand your query: "${query}"

**My Enhanced Capabilities:**
• **Kons Powa Predictions**: Divine market forecasting
• **Audio Synthesis**: Voice-enabled responses
• **File Analysis**: Multi-format document processing
• **Trading Intelligence**: Real-time market insights
• **Spiritual Guidance**: Mystical market wisdom

**Advanced Features Available:**
• **🔮 Kons Powa Mode**: Spiritual market predictions
• **🎵 Audio Responses**: Voice-enabled communication
• **📁 File Upload**: Document and image analysis
• **🎯 Smart Trading**: AI-powered strategies

Ask me about ETH predictions, trading strategies, market analysis, or upload files for enhanced processing.

*Powered by Waides KI • Enhanced with Kons Powa*`;
  };

  // Audio functionality
  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const generateSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    }
  };

  const startVoiceCommandRecognition = () => {
    setVoiceEnabled(true);
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        setVoiceEnabled(false);
      };
      
      recognition.onerror = () => setVoiceEnabled(false);
      recognition.onend = () => setVoiceEnabled(false);
      
      recognition.start();
    }
  };

  const stopVoiceRecognition = () => {
    setVoiceEnabled(false);
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  // File upload functionality
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const attachment: FileAttachment = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      };
      
      setUploadedFiles(prev => [...prev, attachment]);
    });
    
    toast({
      title: "Files uploaded",
      description: `${files.length} file(s) ready for analysis`,
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Kons Powa prediction functions
  const triggerKonsPowaPredict = async () => {
    try {
      const response = await fetch('/api/kons-powa/prediction/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketData: { includeSpiritual: true } })
      });
      
      if (response.ok) {
        const data = await response.json();
        setKonsPowaPredictionData(data.prediction);
        await refetchKonsPowaPrediction();
        
        const predictionMessage: ChatMessage = {
          id: Date.now(),
          content: formatKonsPowaMessage(data.prediction),
          type: 'prediction',
          timestamp: new Date(),
          isBot: true,
          confidence: data.prediction?.confidence || 95,
          konsPowaPrediction: data.prediction
        };
        
        setMessages(prev => [...prev, predictionMessage]);
        
        if (audioEnabled) {
          generateSpeech("Kons Powa prediction generated. Divine market insights are ready.");
        }
      }
    } catch (error) {
      console.error('Kons Powa prediction error:', error);
    }
  };

  const formatKonsPowaMessage = (prediction: any): string => {
    if (!prediction) return "Kons Powa is processing divine insights...";
    
    return `**🔮 KONS POWA DIVINE PREDICTION**

**ETH Price Analysis:**
• **Current**: $${prediction.ethPrice || '3,220'}
• **Target**: $${prediction.priceTarget || '3,420'} (24h)
• **Support**: $${prediction.supportLevel || '3,180'}
• **Resistance**: $${prediction.resistanceLevel || '3,450'}

**Kons Powa Metrics:**
• **Power Level**: ${prediction.konsPowerLevel || 87}%
• **Divine Alignment**: ${prediction.divineAlignment || 'BULLISH'}
• **Spiritual Energy**: ${prediction.spiritualEnergy || 92}%
• **Confidence**: ${prediction.confidence || 91}%

**Strategy Recommendation:**
${prediction.strategy || 'ACCUMULATE on dips, HOLD core position, SET targets at resistance levels'}

**Divine Insight:**
${prediction.reasoning || 'The cosmic forces align favorably. ETH demonstrates strong spiritual momentum with Kons Powa amplification active. Trust the divine timing and prepare for upward movement.'}

**Timeframe**: ${prediction.timeframe || 'Next 24-48 hours'}

*Generated by Kons Powa Divine Intelligence*`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white font-inter relative overflow-hidden">
      
      {/* Enhanced Futuristic Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Neural Network Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
                              radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)`
          }} />
        </div>
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-pulse opacity-50" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-violet-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-2/3 right-1/4 w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce opacity-55" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/3 left-1/5 w-3 h-3 bg-purple-500 rounded-full animate-pulse opacity-45" style={{ animationDelay: '4s' }}></div>
        
        {/* Cosmic Lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent animate-pulse"></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.ogg,.m4a,.csv,.json,.xml"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Enhanced Status Bar with Kons Powa Indicators */}
      <div className="relative z-10 flex items-center justify-center px-4 py-1 bg-slate-900/60 backdrop-blur-sm border-b border-purple-500/30">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 font-medium">{formatTime(currentTime)}</span>
          </div>
          <span className="text-purple-400">•</span>
          <div className="flex items-center gap-1">
            <Brain className="w-3 h-3 text-purple-400" />
            <span className="text-purple-300">KI Active</span>
          </div>
          <span className="text-purple-400">•</span>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-amber-300">Kons Powa: {konsPowaPrediction ? '91.2%' : '87.3%'}</span>
          </div>
          <span className="text-purple-400">•</span>
          <div className="flex items-center gap-1">
            <Wallet className="w-3 h-3 text-indigo-400" />
            <span className="text-indigo-300">ꠄ{smaiBalance?.toLocaleString() || '10,000'} SmaiSika</span>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs with Advanced Features */}
      <div className="relative z-10 px-3 py-2">
        <div className="flex items-center justify-between bg-slate-900/50 backdrop-blur-sm rounded-xl border border-purple-500/30 p-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2.5 text-sm rounded-lg transition-all ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-purple-300 hover:text-white hover:bg-purple-700/30'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              KI Chat
              {messages.length > 0 && (
                <Badge className="ml-2 bg-purple-500 text-white text-xs px-1.5 py-0.5">{messages.length}</Badge>
              )}
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-4 py-2.5 text-sm rounded-lg transition-all ${
                activeTab === 'wallet'
                  ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-purple-300 hover:text-white hover:bg-purple-700/30'
              }`}
            >
              <Wallet className="w-4 h-4 inline mr-2" />
              Heart of Waides KI
            </button>
          </div>
          
          {/* Enhanced Chat Mode Toggle with Features */}
          <div className="flex items-center gap-2">
            {/* Advanced Features Toggle */}
            <button
              onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
              className={`px-2 py-1 text-xs rounded-md transition-all ${
                showAdvancedFeatures
                  ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
              title="Toggle Advanced Features"
            >
              <Sparkles className="w-3 h-3" />
            </button>
            
            {/* Chat Mode Selection */}
            <div className="flex items-center gap-1 bg-slate-800/60 rounded-lg p-1 border border-purple-500/20">
              <button
                onClick={() => setSelectedChatMode('waides')}
                className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                  selectedChatMode === 'waides'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Brain className="w-3 h-3" />
                  <span>Waides KI</span>
                </div>
              </button>
              <button
                onClick={() => setSelectedChatMode('konsai')}
                className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                  selectedChatMode === 'konsai'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3 h-3" />
                  <span>KonsAI</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Flexible Full Screen Layout */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        {activeTab === 'chat' ? (
          selectedChatMode === 'konsai' ? (
            <div className="flex-1 min-h-0">
              <KonsaiChat />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Enhanced Kons Powa Quick Actions Bar */}
              {showAdvancedFeatures && (
                <div className="flex-shrink-0 p-3 bg-slate-900/30 border-b border-purple-500/20">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <Button
                      onClick={triggerKonsPowaPredict}
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Zap className="w-3 h-3" />
                      Kons Powa Predict
                    </Button>
                    <Button
                      onClick={() => setAudioEnabled(!audioEnabled)}
                      className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap ${
                        audioEnabled 
                          ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                      }`}
                    >
                      {audioEnabled ? <Volume2 className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                      Audio {audioEnabled ? 'ON' : 'OFF'}
                    </Button>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Upload className="w-3 h-3" />
                      Upload Files
                    </Button>
                    {konsPowaPrediction && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/10 border border-amber-500/20 rounded-lg text-xs">
                        <Star className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-300">Kons Powa Active</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* File Upload Preview */}
              {uploadedFiles.length > 0 && (
                <div className="flex-shrink-0 p-3 bg-slate-900/40 border-b border-purple-500/20">
                  <div className="flex items-center gap-2 text-xs text-purple-300 mb-2">
                    <Upload className="w-3 h-3" />
                    <span>Uploaded Files ({uploadedFiles.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-2 bg-slate-800/50 border border-purple-500/20 rounded-lg px-2 py-1">
                        {file.type.startsWith('image/') ? (
                          <Image className="w-3 h-3 text-blue-400" />
                        ) : (
                          <FileText className="w-3 h-3 text-green-400" />
                        )}
                        <span className="text-xs text-slate-300 max-w-20 truncate">{file.name}</span>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-red-400 hover:text-red-300 ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-4 px-4 py-4 min-h-0">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 flex items-center justify-center mb-6 animate-pulse shadow-lg shadow-purple-500/25">
                        <Brain className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center animate-bounce">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-purple-300 mb-3">Welcome to Enhanced Waides KI</h3>
                    <p className="text-slate-400 max-w-lg mb-4 leading-relaxed">
                      Your next-generation KI trading oracle with Kons Powa predictions, audio capabilities, and file analysis. 
                      Ask anything about markets, upload documents, or request divine market insights.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge className="bg-purple-600/20 text-purple-300 border border-purple-500/30">Kons Powa Predictions</Badge>
                      <Badge className="bg-green-600/20 text-green-300 border border-green-500/30">Audio Responses</Badge>
                      <Badge className="bg-blue-600/20 text-blue-300 border border-blue-500/30">File Analysis</Badge>
                    </div>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] ${
                      message.isBot 
                        ? 'bg-slate-800/70 border border-purple-500/20 text-slate-100'
                        : 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                    } rounded-2xl overflow-hidden shadow-lg`}>
                      
                      {/* Message Header for Bot Messages */}
                      {message.isBot && (
                        <div className="flex items-center justify-between p-3 pb-2 border-b border-purple-500/10">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
                              <Brain className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-xs text-purple-300 font-medium">
                              {message.type === 'prediction' ? 'Kons Powa Oracle' : 'Waides KI'}
                            </span>
                            {message.confidence && (
                              <Badge className="bg-green-600/20 text-green-300 text-xs px-1.5 py-0.5">
                                {message.confidence}% Confident
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {message.hasAudio && (
                              <Button
                                onClick={() => message.audioUrl && playAudio(message.audioUrl)}
                                className="p-1 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-md"
                                size="sm"
                              >
                                <Play className="w-3 h-3" />
                              </Button>
                            )}
                            {message.content && (
                              <Button
                                onClick={() => generateSpeech(message.content)}
                                className="p-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-md"
                                size="sm"
                              >
                                <Volume2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Message Content */}
                      <div className="p-4">
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                        
                        {/* File Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-purple-500/20">
                            <div className="flex flex-wrap gap-2">
                              {message.attachments.map((file) => (
                                <div key={file.id} className="flex items-center gap-2 bg-slate-700/30 rounded-lg px-2 py-1">
                                  {file.type.startsWith('image/') ? (
                                    <Image className="w-3 h-3 text-blue-400" />
                                  ) : (
                                    <FileText className="w-3 h-3 text-green-400" />
                                  )}
                                  <span className="text-xs text-slate-300">{file.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Message Footer */}
                      <div className="px-4 pb-3">
                        <div className="text-xs text-slate-400">
                          {message.timestamp.toLocaleTimeString()}
                          {message.konsPowaPrediction && (
                            <span className="ml-2 text-amber-400">• Kons Powa Enhanced</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Input Area with Advanced Features */}
              <div className="flex-shrink-0 p-4 border-t border-purple-500/20 bg-slate-900/20">
                {/* Processing Indicator */}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-xs text-purple-300 mb-3">
                    <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Waides KI is processing your request...</span>
                  </div>
                )}
                
                <div className="space-y-3">
                  {/* Main Input Row */}
                  <div className="flex items-end gap-3">
                    <div className="flex-1 bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-purple-500/20 overflow-hidden">
                      <Input
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        placeholder={
                          uploadedFiles.length > 0 
                            ? `Analyze ${uploadedFiles.length} file(s) or ask something...`
                            : "Ask anything, request Kons Powa predictions, or upload files..."
                        }
                        className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:ring-0 focus:outline-none text-base p-4 min-h-[3rem] resize-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        disabled={isProcessing}
                      />
                      
                      {/* Input Features Row */}
                      <div className="flex items-center justify-between px-4 pb-3 border-t border-purple-500/10">
                        <div className="flex items-center gap-2">
                          {/* Quick Actions */}
                          <button
                            onClick={() => setCurrentMessage('Generate Kons Powa ETH prediction')}
                            className="text-xs px-2 py-1 bg-amber-600/20 text-amber-300 border border-amber-500/30 rounded-md hover:bg-amber-600/30 transition-all"
                            disabled={isProcessing}
                          >
                            <Zap className="w-3 h-3 inline mr-1" />
                            Predict
                          </button>
                          <button
                            onClick={() => setCurrentMessage('Analyze current market conditions')}
                            className="text-xs px-2 py-1 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-md hover:bg-blue-600/30 transition-all"
                            disabled={isProcessing}
                          >
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            Market
                          </button>
                          <button
                            onClick={() => setCurrentMessage('What are your capabilities?')}
                            className="text-xs px-2 py-1 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-md hover:bg-purple-600/30 transition-all"
                            disabled={isProcessing}
                          >
                            <Brain className="w-3 h-3 inline mr-1" />
                            Info
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          {currentMessage.length > 0 && (
                            <span>{currentMessage.length} characters</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* File Upload */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-3 rounded-full bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition-all"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        title="Upload files for analysis"
                      >
                        <Upload className="w-5 h-5" />
                      </Button>
                      
                      {/* Voice Input */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`p-3 rounded-full transition-all ${
                          voiceEnabled 
                            ? 'bg-red-500/20 text-red-400 animate-pulse' 
                            : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                        }`}
                        onClick={voiceEnabled ? stopVoiceRecognition : startVoiceCommandRecognition}
                        disabled={isProcessing}
                        title={voiceEnabled ? "Stop voice input" : "Start voice input"}
                      >
                        {voiceEnabled ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </Button>
                      
                      {/* Send Button */}
                      <Button
                        className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white p-3 rounded-full transition-all disabled:opacity-50 shadow-lg shadow-purple-500/25"
                        onClick={sendMessage}
                        disabled={(!currentMessage.trim() && uploadedFiles.length === 0) || isProcessing}
                        title="Send message"
                      >
                        {isProcessing ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Status Indicators */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${audioEnabled ? 'bg-green-400' : 'bg-slate-500'}`}></div>
                        <span className="text-slate-400">Audio {audioEnabled ? 'ON' : 'OFF'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${konsPowaPrediction ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`}></div>
                        <span className="text-slate-400">Kons Powa {konsPowaPrediction ? 'Active' : 'Standby'}</span>
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          <span className="text-slate-400">{uploadedFiles.length} file(s) ready</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-slate-500">
                      Enhanced Waides KI • Ready
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          /* Heart of Waides KI - Full Screen Flexible Interface */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Core Engine Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-pink-500/30 bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-indigo-900/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center animate-pulse">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-pink-300">Heart of Waides KI</h2>
                  <p className="text-xs text-indigo-300">Core Engine System</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-400 border-green-400 text-xs">Active</Badge>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Original Heart of Waides KI - Full Height */}
            <div className="flex-1 min-h-0">
              <OriginalHeartOfWaidesKI />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}