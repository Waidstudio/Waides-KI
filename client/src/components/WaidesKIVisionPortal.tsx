import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Main KonsAi Vision Portal - Pure chat interface
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, Send, Plus, Zap, TrendingUp, Eye, Sparkles, Brain, Wallet, Bot, BarChart3, 
  MicOff, Volume2, VolumeX, Heart, Settings, MessageCircle, User, Activity, 
  Moon, Sun, Waves, Star, Circle, Triangle, Square, Shield, Database, Globe,
  Lock, Code, Fingerprint, Lightbulb, Target, Clock, Gamepad2, Layers,
  TreePine, RefreshCw, Skull, Crosshair, Users, Network, GitBranch,
  FlaskConical, TestTube, Router, Command, FileText, Cog, MessageSquare,
  Bell, Atom, Hexagon, Cpu, Pin, ArrowLeft, ArrowRight
} from 'lucide-react';
import { WaidesKICoreEnginePanel } from './WaidesKICoreEnginePanel';
import { WaidBotSummonPanel } from './WaidBotSummonPanel';
import KonsaiChat from './KonsaiChat';

import { useLocation } from 'wouter';
import getSmartAnswer, { detectCommandTrigger, detectPageRecommendation } from './WaidesKI_MemoryEngine';
import { useSmaiWallet } from '@/context/SmaiWalletContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import type { 
  ChatMessage, 
  OracleResponse, 
  KonsPowaPrediction, 
  MarketAnalysisData,
  EnhancedDashboardData,
  VisionSettings,
  WaidesSettings
} from '@/types/componentTypes';

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
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [activeModule, setActiveModule] = useState('chat');
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState(98.7);
  
  // Route-aware context initialization
  const [location] = useLocation();
  const { user } = useAuth();
  const walletContext = useSmaiWallet();
  const { toast } = useToast();

  // Konsai chat handlers
  const handleQuickAction = (action: string) => {
    setShowWelcomeMessage(false);
    
    // Handle actions that need database data
    if (action === 'kons-powa-prediction') {
      handleKonsPowaPrediction();
      return;
    }
    if (action === 'market-analysis') {
      handleMarketAnalysis();
      return;
    }
    if (action === 'generate-strategy') {
      handleGenerateStrategy();
      return;
    }
    
    const actionMessages: { [key: string]: string } = {
      'command-bots': 'Start all trading bots (WaidBot, WaidBot Pro, Waides Full Engine, SmaiSika Autonomous)',
      'fund-account': 'How do I fund my account with USDT?',
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

  // Enhanced intelligence-backed action handlers
  const handleKonsPowaPrediction = async () => {
    setIsProcessing(true);
    try {
      // Use KonsAI Intelligence Engine for Kons Powa predictions instead of just database
      const response = await fetch('/api/konsai/enhanced-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Generate a detailed Kons Powa ETH prediction with divine insights and strategic guidance',
          mode: 'comprehensive',
          complexity: 'advanced'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get Kons Powa intelligence response');
      }

      const data = await response.json();
      let intelligentResponse = data.response;

      // If we have database prediction, enhance it with intelligence
      try {
        await refetchKonsPowaPrediction();
        const prediction = konsPowaPrediction;
        
        if (prediction && typeof prediction === 'object') {
          intelligentResponse = `**🔮 Kons Powa Enhanced Intelligence Prediction**

${intelligentResponse}

**📊 Current Database Analysis:**
• **Price:** $${(prediction as any).ethPrice || 'N/A'}
• **Prediction:** ${(prediction as any).prediction || 'N/A'}
• **Confidence:** ${(prediction as any).confidence || 0}%
• **Strategy:** ${(prediction as any).strategy || 'N/A'}
• **Timeframe:** ${(prediction as any).timeframe || 'N/A'}
• **Kons Power Level:** ${(prediction as any).konsPowerLevel || 0}%
• **Divine Alignment:** ${(prediction as any).divineAlignment || 0}%
• **Spiritual Energy:** ${(prediction as any).spiritualEnergy || 0}%
• **Reasoning:** ${(prediction as any).reasoning || 'N/A'}

*Powered by KonsAI Intelligence Engine v2.0 + Database Analysis*`;
        }
      } catch (dbError) {
        console.log('Database prediction unavailable, using pure intelligence response');
      }

      typeMessage(intelligentResponse, 'oracle', 95);
    } catch (error) {
      console.error('Error fetching Kons Powa intelligence prediction:', error);
      
      // Fallback to database-only if intelligence fails
      try {
        await refetchKonsPowaPrediction();
        const prediction = konsPowaPrediction;
        
        if (prediction && typeof prediction === 'object') {
          let message = `**🔮 Kons Powa ETH Prediction (Database Fallback)**\n\n`;
          message += `**Price:** $${(prediction as any).ethPrice || 'N/A'}\n`;
          message += `**Prediction:** ${(prediction as any).prediction || 'N/A'}\n`;
          message += `**Confidence:** ${(prediction as any).confidence || 0}%\n`;
          message += `**Strategy:** ${(prediction as any).strategy || 'N/A'}\n`;
          message += `**Timeframe:** ${(prediction as any).timeframe || 'N/A'}\n`;
          message += `**Kons Power Level:** ${(prediction as any).konsPowerLevel || 0}%\n`;
          message += `**Divine Alignment:** ${(prediction as any).divineAlignment || 0}%\n`;
          message += `**Spiritual Energy:** ${(prediction as any).spiritualEnergy || 0}%\n`;
          message += `**Reasoning:** ${(prediction as any).reasoning || 'N/A'}\n`;
          
          typeMessage(message, 'oracle', (prediction as any).confidence || 0);
        } else {
          typeMessage('Kons Powa intelligence systems are temporarily processing. Please try again in a moment.', 'error', 0);
        }
      } catch (fallbackError) {
        typeMessage('Kons Powa intelligence systems are temporarily processing. Please try again in a moment.', 'error', 0);
      }
    }
    setIsProcessing(false);
  };

  const handleMarketAnalysis = async () => {
    setIsProcessing(true);
    try {
      await refetchMarketAnalysis();
      const analysis = marketAnalysis;
      
      if (analysis && typeof analysis === 'object') {
        let message = `**📊 Market Analysis (Database)**\n\n`;
        message += `**ETH Price:** $${(analysis as any).ethPrice || 'N/A'}\n`;
        message += `**24h Volume:** $${((analysis as any).volume24h / 1000000).toFixed(2) || '0'}M\n`;
        message += `**Market Cap:** $${((analysis as any).marketCap / 1000000000).toFixed(2) || '0'}B\n`;
        message += `**24h Change:** ${((analysis as any).priceChange24h || 0).toFixed(2)}%\n`;
        message += `**Trend Direction:** ${(analysis as any).trendDirection || 'N/A'}\n`;
        message += `**MACD Signal:** ${(analysis as any).macdSignal || 'N/A'}\n`;
        message += `**RSI:** ${(analysis as any).rsiValue || 'N/A'}\n`;
        message += `**Fear & Greed Index:** ${(analysis as any).fearGreedIndex || 'N/A'}\n`;
        
        const indicators = (analysis as any).indicators;
        if (indicators) {
          message += `\n**Technical Indicators:**\n`;
          if (indicators.rsi) message += `- RSI: ${indicators.rsi}\n`;
          if (indicators.macd?.signal) message += `- MACD: ${indicators.macd.signal}\n`;
          if (indicators.stochastic?.signal) message += `- Stochastic: ${indicators.stochastic.signal}\n`;
        }
        
        typeMessage(message, 'oracle', 85);
      } else {
        typeMessage('Unable to retrieve market analysis at this time. Please try again.', 'error', 0);
      }
    } catch (error) {
      console.error('Error fetching market analysis:', error);
      typeMessage('Error retrieving market analysis. Please try again.', 'error', 0);
    }
    setIsProcessing(false);
  };

  const handleGenerateStrategy = async () => {
    setIsProcessing(true);
    try {
      await refetchStrategies();
      const strategies = strategyRecommendations;
      
      if (strategies && Array.isArray(strategies) && strategies.length > 0) {
        let message = `**⚡ Trading Strategy Recommendations (Database)**\n\n`;
        
        strategies.slice(0, 3).forEach((strategy: any, index: number) => {
          message += `**${index + 1}. ${strategy.name}**\n`;
          message += `- **Type:** ${strategy.type}\n`;
          message += `- **Risk Level:** ${strategy.riskLevel}\n`;
          message += `- **Win Rate:** ${strategy.winRate}%\n`;
          message += `- **Description:** ${strategy.description}\n\n`;
        });
        
        typeMessage(message, 'oracle', 90);
      } else {
        // Fallback to enhanced dashboard data
        await refetchEnhancedData();
        const dashboardData = enhancedDashboardData;
        
        if (dashboardData && typeof dashboardData === 'object') {
          let message = `**⚡ Market-Based Strategy Recommendation**\n\n`;
          const ethData = (dashboardData as any).ethData;
          if (ethData) {
            message += `**Current ETH Price:** $${ethData.price || 'N/A'}\n`;
            message += `**24h Change:** ${(ethData.priceChange24h || 0).toFixed(2)}%\n`;
          }
          
          const konsPowaPrediction = (dashboardData as any).konsPowaPrediction;
          if (konsPowaPrediction) {
            message += `**Kons Powa Recommendation:** ${konsPowaPrediction.prediction || 'N/A'}\n`;
            message += `**Strategy:** ${konsPowaPrediction.strategy || 'N/A'}\n`;
            message += `**Risk Level:** ${konsPowaPrediction.riskLevel || 'N/A'}\n`;
          }
          
          typeMessage(message, 'oracle', 75);
        } else {
          typeMessage('Unable to retrieve strategy recommendations at this time. Please try again.', 'error', 0);
        }
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
      typeMessage('Error retrieving strategy recommendations. Please try again.', 'error', 0);
    }
    setIsProcessing(false);
  };

  // Handle trading-related queries with intelligent recommendations
  const handleTradingQuery = async (messageText: string) => {
    const query = messageText.toLowerCase();
    
    // Trading bot queries
    if (query.includes('bot') || query.includes('waidbot') || query.includes('automated') || query.includes('auto')) {
      return {
        message: `🤖 **Trading Bot Assistance**\n\n**Available Trading Bots:**\n\n• **WaidBot Engine** - Complete autonomous trading system\n• **WaidBot Pro** - Advanced technical analysis\n• **Full Engine** - Complete trading automation\n\n**Recommended Actions:**\n✅ Visit the **WaidBot Engine** to start trading\n✅ Check your **SmaiSika wallet** balance first\n✅ Set your risk preferences and trading limits\n\n**Next Steps:** Click the navigation menu → WaidBot Engine to get started!`,
        confidence: 90,
        recommendations: [
          { page: 'WaidBot Engine', route: '/waidbot-engine', description: 'Complete autonomous trading system' },
          { page: 'SmaiSika Wallet', route: '/smai-wallet', description: 'Check balance and fund your account' }
        ]
      };
    }
    
    // Market analysis queries
    if (query.includes('market') || query.includes('analysis') || query.includes('price') || query.includes('chart')) {
      return {
        message: `📊 **Market Analysis Available**\n\n**Current ETH Price:** $${enhancedDashboardData?.ethData?.price || 'Loading...'}\n\n**Analysis Options:**\n• **Technical Analysis** - Charts, indicators, patterns\n• **Kons Powa Predictions** - Spiritual market readings\n• **Real-time Data** - Live price feeds and volume\n\n**Recommended Pages:**\n✅ **Charts** - View detailed technical analysis\n✅ **Dashboard** - Get market overview\n✅ **Live Data** - Real-time price monitoring\n\n**Quick Action:** Use the "Market Analysis" button above for instant insights!`,
        confidence: 85,
        recommendations: [
          { page: 'Charts', route: '/charts', description: 'View detailed technical analysis and live charts' },
          { page: 'Dashboard', route: '/dashboard', description: 'Get comprehensive market overview' },
          { page: 'Live Data', route: '/live-data', description: 'Monitor real-time market data' }
        ]
      };
    }
    
    // Strategy queries
    if (query.includes('strategy') || query.includes('trading plan') || query.includes('how to trade')) {
      return {
        message: `🎯 **Trading Strategy Guidance**\n\n**Strategy Types:**\n• **Scalping** - Quick short-term trades\n• **Swing Trading** - Medium-term positions\n• **HODLing** - Long-term holding strategy\n• **Divine Guidance** - Kons Powa spiritual trading\n\n**Recommended Learning:**\n✅ **Trading Academy** - Complete education\n✅ **WaidBot Pro** - Advanced strategy analysis\n✅ **Risk Management** - Protect your capital\n\n**Get Started:** Click "Trading Strategies" button or visit the Learning page!`,
        confidence: 88,
        recommendations: [
          { page: 'Learning', route: '/learning', description: 'Complete trading education and academy' },
          { page: 'WaidBot Pro', route: '/waidbot-pro', description: 'Advanced strategy analysis and recommendations' }
        ]
      };
    }
    
    // Wallet and funding queries
    if (query.includes('fund') || query.includes('wallet') || query.includes('balance') || query.includes('money')) {
      return {
        message: `💰 **Wallet & Funding Help**\n\n**SmaiSika Wallet Balance:** ꠄ${smaiBalance?.toLocaleString() || 'Loading...'}\n**Local Currency:** ₦${localBalance?.toLocaleString() || 'Loading...'}\n\n**Funding Options:**\n• **Paystack** - Nigerian payment gateway\n• **Flutterwave** - African payment solutions\n• **Bank Transfer** - Direct local transfers\n• **Crypto Deposit** - USDT and other cryptocurrencies\n\n**Recommended Actions:**\n✅ **SmaiSika Wallet** - Manage your funds\n✅ **Admin Panel** - Configure payment methods\n\n**Safety First:** Always verify transactions and use secure payment methods!`,
        confidence: 92,
        recommendations: [
          { page: 'SmaiSika Wallet', route: '/smai-wallet', description: 'Manage your wallet and view transactions' },
          { page: 'Admin Panel', route: '/admin', description: 'Configure payment methods and security' }
        ]
      };
    }
    
    // General ETH queries
    if (query.includes('eth') || query.includes('ethereum')) {
      return {
        message: `⚡ **Ethereum Trading Hub**\n\n**Current ETH:** $${enhancedDashboardData?.ethData?.price || 'Loading...'}\n**24h Change:** ${enhancedDashboardData?.ethData?.priceChange24h?.toFixed(2) || 'N/A'}%\n\n**ETH Services:**\n• **Kons Powa Predictions** - Spiritual ETH analysis\n• **Technical Analysis** - Chart patterns and indicators\n• **Automated Trading** - ETH-focused bots\n• **Risk Management** - Position sizing and stops\n\n**Best Pages for ETH:**\n✅ **Dashboard** - ETH overview and metrics\n✅ **Charts** - ETH price analysis\n✅ **WaidBot Engine** - ETH trading automation\n\n**Pro Tip:** Use the "Kons Powa ETH Prediction" button for divine insights!`,
        confidence: 95,
        recommendations: [
          { page: 'Dashboard', route: '/dashboard', description: 'Complete ETH trading dashboard' },
          { page: 'Charts', route: '/charts', description: 'ETH technical analysis and charts' },
          { page: 'WaidBot Engine', route: '/waidbot-engine', description: 'ETH-focused trading automation' }
        ]
      };
    }
    
    // Default trading response
    return {
      message: `🔮 **Waides KI Trading Assistant**\n\nI understand you're interested in: "${messageText}"\n\n**I can help you with:**\n• Trading bot setup and management\n• Market analysis and predictions\n• Strategy development and education\n• Wallet management and funding\n• Risk management and safety\n\n**Popular Pages:**\n✅ **Dashboard** - Market overview\n✅ **WaidBot Engine** - Trading automation\n✅ **Charts** - Technical analysis\n✅ **Learning** - Trading education\n\n**Quick Start:** Try the quick action buttons above or ask me specific questions about trading!`,
      confidence: 75,
      recommendations: [
        { page: 'Dashboard', route: '/dashboard', description: 'Start with market overview' },
        { page: 'WaidBot Engine', route: '/waidbot-engine', description: 'Explore trading automation' },
        { page: 'Learning', route: '/learning', description: 'Learn trading fundamentals' }
      ]
    };
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
      // Use enhanced Ki Chat with natural processing
      const response = await fetch('/api/ki-chat/route-aware-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          currentPath: location,
          isAuthenticated: !!user,
          userRole: user?.role || 'user',
          permissions: user?.permissions || [],
          userId: user?.id,
          personality: 'wise',
          spiritualEnergy: 75,
          consciousnessLevel: 3,
          auraIntensity: 80,
          prophecyMode: false,
          useNaturalProcessing: true,
          previousMessages: messages.slice(-5).map(m => m.message) // Last 5 messages for context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create natural response message
        const kiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'waides',
          message: data.response || 'I am here to guide you through Waides KI. How can I help you today?',
          timestamp: new Date(),
          source: data.isNaturalResponse ? 'natural_processing' : 'spiritual_ai',
          confidence: 95,
          reasoning: data.reasoning,
          quickActions: data.quickActions,
          routeSuggestions: data.routeSuggestions
        };
        
        setMessages(prev => [...prev, kiResponse]);
        setIsTyping(false);
      } else {
        throw new Error('Ki Chat service unavailable');
      }
    } catch (error) {
      setIsTyping(false);
      console.error('Ki Chat error:', error);
      
      // Fallback to basic response
      const fallbackResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'waides',
        message: "I'm here to help you navigate Waides KI and answer your questions about trading, learning, and platform features. Please try your question again, and I'll provide clear guidance.",
        timestamp: new Date(),
        source: 'fallback',
        confidence: 85
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    }
  };
  const [isListening, setIsListening] = useState(false);
  const [oracleEnabled, setOracleEnabled] = useState(false);
  const [reasoningMode, setReasoningMode] = useState(false);
  
  // Chat mode configuration
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
  
  // Konsmik KI Enhancement States
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
  const [konsmikMode, setKonsmikMode] = useState(false);
  const [konsmikTheme, setKonsmikTheme] = useState<'nebula' | 'starfield' | 'galaxy'>('nebula');
  const [energyLevel, setEnergyLevel] = useState(75);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [showKonsPrediction, setShowKonsPrediction] = useState(false);
  // Chat mode selection for KI Chat
  const [selectedChatMode, setSelectedChatMode] = useState<'waides' | 'konsai'>('waides');



  // Local AI content generation templates
  const konsaiTemplates = [
    {
      type: 'technical_analysis',
      titles: ['Resistance Break Analysis', 'Support Level Testing', 'Volume Surge Detection', 'Moving Average Cross', 'Fibonacci Retracement Study'],
      patterns: [
        'Neural network analysis indicates ${probability}% probability of ${direction} movement at $${level}. ${volumeAnalysis}',
        'Technical indicators show ${signal} formation. Price action suggests ${direction} bias with ${confidence}% confidence.',
        'Algorithm detected ${pattern} pattern. Historical success rate: ${successRate}%. Target: $${target}.',
        'Market structure analysis reveals ${structure}. Risk/reward ratio: ${riskReward}. Entry zone: $${entryZone}.'
      ]
    },
    {
      type: 'market_sentiment',
      titles: ['Fear & Greed Analysis', 'Institutional Flow Study', 'Retail Sentiment Shift', 'Options Flow Alert', 'Whale Movement Detection'],
      patterns: [
        'Sentiment analysis shows ${sentiment} bias. ${institution} activity detected at $${price}.',
        'Market fear index at ${fearLevel}. Contrarian opportunity emerging in ${timeframe}.',
        'Large holder movements suggest ${direction} positioning. Volume profile indicates ${conviction}.',
        'Options flow reveals ${optionsFlow}. Implied volatility ${ivDirection} by ${ivChange}%.'
      ]
    }
  ];

  const konsPowaTemplates = [
    {
      type: 'divine_wisdom',
      titles: ['Cosmic Energy Reading', 'Sacred Number Alignment', 'Ethereal Current Analysis', 'Divine Vision Insight', 'Spiritual Market Guidance'],
      patterns: [
        'The cosmic currents flow ${direction}. Sacred numbers align at $${sacredPrice} - a divine convergence approaches.',
        'Ancient wisdom whispers of ${prediction}. The ethereal field ${energy} with ${intensity} intensity.',
        'Celestial alignment favors the ${bias}. Divine timing suggests ${timing} for optimal action.',
        'The sacred geometry reveals ${geometryInsight}. Spiritual indicators point to $${spiritualTarget}.'
      ]
    },
    {
      type: 'spiritual_guidance',
      titles: ['Inner Peace Trading', 'Emotional Balance Wisdom', 'Patience Teaching', 'Fear Transmutation', 'Abundance Manifestation'],
      patterns: [
        'When ${emotion} clouds judgment, breathe deep and remember: ${wisdom}.',
        'The path of ${tradingStyle} requires ${virtue}. Let ${guidance} be your compass.',
        'In times of ${marketCondition}, the wise trader ${action}. This is the ancient way.',
        'Transform ${challenge} into ${opportunity}. The universe rewards those who ${principle}.'
      ]
    }
  ];

  // Local AI content generation functions
  const generateKonsAIPost = () => {
    const currentPrice = enhancedDashboardData?.ethData?.price || 3700;
    const template = konsaiTemplates[Math.floor(Math.random() * konsaiTemplates.length)];
    const title = template.titles[Math.floor(Math.random() * template.titles.length)];
    const pattern = template.patterns[Math.floor(Math.random() * template.patterns.length)];
    
    // Generate realistic trading data
    const probability = Math.floor(Math.random() * 40) + 60; // 60-99%
    const direction = Math.random() > 0.5 ? 'bullish' : 'bearish';
    const level = direction === 'bullish' ? currentPrice * 1.02 : currentPrice * 0.98;
    const volumeAnalysis = Math.random() > 0.5 ? 'Volume confirms momentum' : 'Low volume suggests consolidation';
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-99%
    const successRate = Math.floor(Math.random() * 25) + 75; // 75-99%
    const target = direction === 'bullish' ? currentPrice * 1.05 : currentPrice * 0.95;
    
    const content = pattern
      .replace('${probability}', probability.toString())
      .replace('${direction}', direction)
      .replace('${level}', level.toFixed(2))
      .replace('${volumeAnalysis}', volumeAnalysis)
      .replace('${confidence}', confidence.toString())
      .replace('${successRate}', successRate.toString())
      .replace('${target}', target.toFixed(2))
      .replace('${price}', currentPrice.toFixed(2));

    const newPost = {
      id: Date.now(),
      topicId: 3,
      speaker: 'KonsAI',
      title,
      content,
      timestamp: new Date(),
      sentiment: direction === 'bullish' ? 'bullish' : direction === 'bearish' ? 'bearish' : 'neutral',
      technicalData: {
        price: currentPrice,
        probability,
        direction,
        target: target.toFixed(2)
      }
    };

    setAiConversations(prev => [newPost, ...prev.slice(0, 9)]);
  };

  const generateKonsPowaPost = () => {
    const currentPrice = enhancedDashboardData?.ethData?.price || 3700;
    const template = konsPowaTemplates[Math.floor(Math.random() * konsPowaTemplates.length)];
    const title = template.titles[Math.floor(Math.random() * template.titles.length)];
    const pattern = template.patterns[Math.floor(Math.random() * template.patterns.length)];
    
    const sacredPrice = Math.round(currentPrice * (1 + (Math.random() - 0.5) * 0.1));
    const direction = Math.random() > 0.5 ? 'upward' : 'with great strength';
    const energy = Math.random() > 0.5 ? 'pulses' : 'radiates';
    const prediction = Math.random() > 0.5 ? 'great prosperity' : 'divine transformation';
    
    const content = pattern
      .replace('${direction}', direction)
      .replace('${sacredPrice}', sacredPrice.toString())
      .replace('${prediction}', prediction)
      .replace('${energy}', energy);

    const newPost = {
      id: Date.now() + 1,
      topicId: 4,
      speaker: 'Kons Powa',
      title,
      content,
      timestamp: new Date(),
      sentiment: 'mystical',
      divineInsight: 'The cosmic forces align for those who seek wisdom'
    };

    setAiConversations(prev => [newPost, ...prev.slice(0, 9)]);
  };

  const generateNewPost = () => {
    if (Math.random() > 0.5) {
      generateKonsAIPost();
    } else {
      generateKonsPowaPost();
    }
    
    setForumActivity(prev => ({
      ...prev,
      newPosts: prev.newPosts + 1,
      activeUsers: Math.max(80, prev.activeUsers + Math.floor(Math.random() * 10) - 5)
    }));
  };
  
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

  const { smaiBalance, localBalance, transactions, canAffordTrade } = walletContext;

  // Handle page navigation from recommendations
  const handlePageNavigation = (route: string) => {
    setLocation(route);
  };

  // Function to render message with clickable links
  const renderMessageWithLinks = (text: string) => {
    // Regex to match markdown links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Add the clickable link
      const linkText = match[1];
      const linkUrl = match[2];
      
      parts.push(
        <button
          key={match.index}
          onClick={() => {
            console.log('Navigating to:', linkUrl);
            setLocation(linkUrl);
          }}
          className="text-blue-400 hover:text-blue-300 underline hover:no-underline transition-colors duration-200 font-medium"
        >
          {linkText}
        </button>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after the last link
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    // If no links found, return original text
    if (parts.length === 0) {
      return text;
    }
    
    return parts;
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

  // Konsmik KI speech synthesis function
  const speakMessage = (text: string) => {
    if (!speechSynthesis || !voiceSettings.enabled) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = voiceSettings.pitch;
    utterance.rate = voiceSettings.rate;
    utterance.volume = voiceSettings.volume;
    
    // Choose voice based on KI personality
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
  const typeMessageKonsmik = (message: string, source?: string, confidence?: number, konslangProcessing?: string, reasoning?: any[]) => {
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
    }, konsmikMode ? 15 : 30); // Faster typing in cosmic mode
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

  // Enhanced Database-Backed Services Queries
  const { data: enhancedDashboardData, isLoading: isEnhancedLoading, refetch: refetchEnhancedData } = useQuery({
    queryKey: ['/api/dashboard/enhanced-data'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: konsPowaPrediction, isLoading: isKonsPowaPredictionLoading, refetch: refetchKonsPowaPrediction } = useQuery({
    queryKey: ['/api/kons-powa/prediction/current'],
    refetchInterval: 240000, // Refresh every 4 minutes
  });

  const { data: marketAnalysis, isLoading: isMarketAnalysisLoading, refetch: refetchMarketAnalysis } = useQuery({
    queryKey: ['/api/market-analysis/current'],
    refetchInterval: 180000, // Refresh every 3 minutes
  });

  const { data: strategyRecommendations, isLoading: isStrategiesLoading, refetch: refetchStrategies } = useQuery({
    queryKey: ['/api/trading-strategies/recommendations'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Forum activity simulation and notification management
  useEffect(() => {
    if (showForumPortal) {
      const interval = setInterval(() => {
        setForumActivity(prev => ({
          ...prev,
          activeUsers: Math.max(50, prev.activeUsers + Math.floor(Math.random() * 5) - 2),
          newPosts: prev.newPosts + (Math.random() > 0.8 ? 1 : 0)
        }));
      }, 15000); // Update every 15 seconds

      return () => clearInterval(interval);
    }
  }, [showForumPortal]);

  // Mark forum notifications as read when portal opens
  useEffect(() => {
    if (showForumPortal && forumNotifications > 0) {
      const timer = setTimeout(() => {
        setForumNotifications(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showForumPortal]);

  // Simulate new forum notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!showForumPortal && forumNotifications < 9) {
        if (Math.random() > 0.85) { // 15% chance every 30 seconds
          setForumNotifications(prev => Math.min(9, prev + 1));
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [showForumPortal, forumNotifications]);

  // Generate new AI posts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 45 seconds
        generateNewPost();
        if (!showForumPortal) {
          setForumNotifications(prev => Math.min(9, prev + 1));
        }
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [showForumPortal, enhancedDashboardData]);

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
        if (data.data?.navigationSuggestion === '/waidbot-engine' && data.data?.waidbotActivated) {
          setTimeout(() => {
            typeMessage("Navigate to Waidbot Engine interface? Type 'yes' to proceed or continue chatting here.", 'waidbot_summon', 100);
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

  // Voice command processing mutation with cosmic KI features
  const voiceProcessingMutation = useMutation({
    mutationFn: async (command: string) => {
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command,
          personality: aiPersonality,
          konsmikMode: konsmikMode
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
          konsmikMode: konsmikMode,
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

  // Voice processing mutation for cosmic KI features
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
        typeMessage('KI processing complete', 'chatgpt', 85);
      }
      setIsProcessing(false);
    },
    onError: () => {
      typeMessage('I am here to help with ETH trading, market analysis, and spiritual guidance. What would you like to know?', 'enhanced_bot_memory', 85);
      setIsProcessing(false);
    }
  });

  // Enhanced Chat mutation using KonsAI Intelligence Engine
  const enhancedChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/konsai/enhanced-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          mode: 'comprehensive',
          complexity: 'adaptive'
        }),
      });
      if (!response.ok) throw new Error('Enhanced chat service unavailable');
      return response.json();
    },
    onSuccess: (data) => {
      if (data && data.response) {
        typeMessage(data.response, 'enhanced_bot_memory', 95);
      } else {
        typeMessage('I am here to help with your trading and investment needs.', 'enhanced_bot_memory', 85);
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error('Enhanced chat error:', error);
      // Fallback to Memory Engine if API fails
      const smartResponse = getSmartAnswer(currentMessage, enhancedDashboardData, walletContext?.balance, 0);
      if (smartResponse) {
        typeMessage(smartResponse.message, 'enhanced_bot_memory', smartResponse.confidence);
      } else {
        // Final fallback to spiritual intelligence
        questionMutation.mutate(currentMessage);
      }
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

  // Route-aware Ki Chat mutation - Enhanced Navigation Intelligence
  const routeAwareChatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/ki-chat/route-aware-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          currentPath: location,
          isAuthenticated: !!user,
          userRole: user?.role || 'user',
          permissions: user?.permissions || [],
          userId: user?.id,
          sessionId: 'vision-portal',
          requestRouteGuidance: true,
          personality: 'wise',
          spiritualEnergy: spiritualEnergy,
          consciousnessLevel: consciousnessLevel,
          auraIntensity: auraIntensity,
          prophecyMode: prophecyMode
        }),
      });
      if (!response.ok) throw new Error('Route-aware chat service unavailable');
      return response.json();
    },
    onSuccess: (data) => {
      if (data && data.response) {
        typeMessage(data.response, 'enhanced_bot_memory', data.confidence || 90);
        
        // Handle route suggestions if provided
        if (data.routeSuggestions && data.routeSuggestions.length > 0) {
          const suggestionMessage = `\n🗺️ **Navigation Guidance:**\n${data.routeSuggestions.map((route: any) => 
            `• [${route.title}](${route.path}) - ${route.description}`
          ).join('\n')}`;
          
          setTimeout(() => {
            typeMessage(suggestionMessage, 'enhanced_bot_memory', 85);
          }, 1500);
        }
      } else {
        typeMessage('I am Waides KI, your spiritual guide through this platform. How may I assist you?', 'enhanced_bot_memory', 85);
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error('Route-aware chat error:', error);
      // Fallback to enhanced chat
      enhancedChatMutation.mutate(currentMessage);
    }
  });

  const typeMessage = (message: string, source?: 'incite' | 'chatgpt' | 'konslang' | 'combined' | 'reasoning' | 'enhanced_bot_memory' | 'waidbot_summon' | 'oracle' | 'error' | 'navigation_guide', confidence?: number, konslangProcessing?: string, reasoning?: any[]) => {
    // Use cosmic enhanced version
    typeMessageKonsmik(message, source, confidence, konslangProcessing, reasoning);
  };



  // Autonomous Trading Functions
  const startAutonomousTrading = async () => {
    try {
      const response = await fetch('/api/waides-ki/kons-powa/start-autonomous', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setIsAutonomousActive(true);
        typeMessageKonsmik(`🚀 Kons Powa Autonomous Trading ACTIVATED! 
        
Initial prediction: ${data.initialPrediction?.action || 'OBSERVE'}
System is now monitoring ETH and executing trades based on divine signals.
All trades will be logged and tracked automatically.`, 'oracle', 95);
        
        // Fetch initial stats
        fetchAutonomousStats();
      } else {
        typeMessageKonsmik('Failed to start autonomous trading. Please try again.', 'error', 0);
      }
    } catch (error) {
      console.error('Autonomous trading start error:', error);
      typeMessageKonsmik('Error starting autonomous trading. Please check your connection.', 'error', 0);
    }
  };

  const stopAutonomousTrading = async () => {
    try {
      const response = await fetch('/api/waides-ki/kons-powa/stop-autonomous', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setIsAutonomousActive(false);
        typeMessageKonsmik('⏹️ Kons Powa Autonomous Trading STOPPED. Returning to manual trading mode.', 'oracle', 85);
      } else {
        typeMessageKonsmik('Failed to stop autonomous trading.', 'error', 0);
      }
    } catch (error) {
      console.error('Autonomous trading stop error:', error);
      typeMessageKonsmik('Error stopping autonomous trading.', 'error', 0);
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
        typeMessageKonsmik(`⚡ Force ${direction} trade executed! Trade ID: ${data.tradeId}`, 'oracle', 90);
        fetchAutonomousStats(); // Refresh stats after force trade
      } else {
        typeMessageKonsmik(`❌ Failed to execute force ${direction} trade: ${data.error}`, 'error', 0);
      }
    } catch (error) {
      console.error('Force trade error:', error);
      typeMessageKonsmik(`❌ Error executing force ${direction} trade.`, 'error', 0);
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
    } else if (isKonsAiRequest && typeof aiPersonality === 'object' && (aiPersonality as any).mode === 'cosmic') {
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
          const memoryResponse = getSmartAnswer(currentMessage, enhancedDashboardData, (walletContext as any)?.balance, 0);
          if (memoryResponse) {
            typeMessage(memoryResponse.message, 'enhanced_bot_memory', memoryResponse.confidence);
            setIsProcessing(false);
          } else {
            // Fallback to server-side spiritual intelligence
            questionMutation.mutate(currentMessage);
          }
          break;
        case 'oracle':
          if (oracleEnabled) {
            oracleMutation.mutate(currentMessage);
          } else {
            // Fallback to spiritual mode if oracle not available
            questionMutation.mutate(currentMessage);
          }
          break;
        default: // 'auto' mode - Route-Aware Educational Learning Guide
          // First try route-aware Ki Chat for enhanced navigation guidance
          routeAwareChatMutation.mutate(currentMessage);
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
    <div className={konsmikMode ? 
      (konsmikTheme === 'nebula' ? "min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 text-white font-inter relative overflow-hidden" :
       konsmikTheme === 'starfield' ? "min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white font-inter relative overflow-hidden" :
       konsmikTheme === 'galaxy' ? "min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-pink-900 text-white font-inter relative overflow-hidden" :
       "min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white font-inter relative overflow-hidden") :
      "min-h-screen bg-black text-white font-inter relative overflow-hidden"}>
      
      {/* Enhanced Konsmik Background Effects */}
      {konsmikMode ? (
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
          <button 
            onClick={() => setLocation('/wallet')}
            className="text-xs text-blue-300 font-medium hover:text-blue-200 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Wallet className="w-3 h-3" />
            ꠄ{walletContext.smaiBalance?.toFixed(2) || '0.00'}
          </button>
          <span className="text-xs text-gray-400">|</span>
          
          {/* Futuristic Forum Portal */}
          <button 
            onClick={() => setLocation('/forum')}
            className="relative text-xs text-cyan-300 font-medium hover:text-cyan-200 transition-all duration-300 cursor-pointer flex items-center gap-1 group"
          >
            <div className="relative">
              <Hexagon className="w-3 h-3 animate-pulse" />
              <Atom className="w-2 h-2 absolute top-0.5 left-0.5 text-purple-400 animate-spin" style={{animationDuration: '3s'}} />
              {forumNotifications > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-[8px] text-white font-bold">{forumNotifications}</span>
                </div>
              )}
            </div>
            <span className="group-hover:text-gradient-to-r group-hover:from-cyan-300 group-hover:to-purple-300">
              Forum
            </span>
          </button>
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
                <span>KI Chat</span>
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

      {/* Chat Window - Expanded to take up full available space */}
      <div className={`relative z-10 flex-1 mx-2 mb-2 bg-black/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-4 overflow-hidden w-full ${
        activeTab === 'chat' ? 'h-[calc(100vh-80px)]' : 'h-[calc(100vh-235px)]'
      }`}>
        <div className="h-full overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-purple-600/80 scrollbar-track-gray-800/50 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4 animate-pulse">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-300 mb-2">Welcome to Waides KI</h3>
              <p className="text-gray-400 max-w-md mb-4">
                Your next-generation KI trading oracle. Ask anything about markets, strategies, or trading insights.
              </p>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                <Button
                  onClick={() => handleQuickAction('kons-powa-prediction')}
                  disabled={isProcessing || isKonsPowaPredictionLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isKonsPowaPredictionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Kons Powa ETH Prediction
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => handleQuickAction('market-analysis')}
                  disabled={isProcessing || isMarketAnalysisLoading}
                  variant="outline"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isMarketAnalysisLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4" />
                      Market Analysis
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => handleQuickAction('generate-strategy')}
                  disabled={isProcessing || isStrategiesLoading}
                  variant="outline"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isStrategiesLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Trading Strategies
                    </>
                  )}
                </Button>
              </div>


              
              <div className="text-sm text-gray-500">
                {chatMode === 'auto' && (
                  <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">Educational Learning Guide</span>
                    </div>
                    <p className="text-emerald-200/80">
                      Ask questions about trading and get detailed learning paths, page recommendations, and safety guidance.
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
                      Advanced dual-KI oracle with enhanced reasoning and mystical insights.
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
                <div className="whitespace-pre-wrap leading-relaxed">{renderMessageWithLinks(message.message)}</div>
                
                {/* Display reasoning steps for reasoning mode */}
                {message.reasoning && message.reasoning.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs text-purple-300 font-semibold flex items-center gap-2">
                      <Brain className="w-3 h-3" />
                      {Array.isArray(message.reasoning) && message.reasoning.length > 0 && typeof message.reasoning[0] === 'object' && 'step' in message.reasoning[0] 
                        ? 'Reasoning Process' 
                        : 'Recommended Pages'}
                    </div>
                    {message.reasoning.map((step, index) => (
                      <div key={index}>
                        {/* Traditional reasoning step display */}
                        {typeof step === 'object' && 'step' in step ? (
                          <div className="bg-gray-900/40 border border-purple-500/10 rounded-lg p-3">
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
                        ) : (
                          /* Page recommendation display */
                          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-purple-200 mb-1">
                                  {step.page}
                                </div>
                                <div className="text-xs text-gray-300">
                                  {step.description}
                                </div>
                              </div>
                              <button
                                onClick={() => handlePageNavigation(step.route)}
                                className="ml-3 inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xs font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
                              >
                                <span>Visit</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
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
                <div className="whitespace-pre-wrap leading-relaxed">
                  {renderMessageWithLinks(currentTypingMessage)}
                  <span className="animate-pulse">|</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

          {/* Chat Input */}
          <div className="relative z-10 p-2 w-full">
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

      {/* Heart of Waides Ki - Free Display */}
      {activeTab === 'core' && (
        <div className="relative z-10 flex-1 flex flex-col h-full">
          {/* Enhanced Header - Free Display */}
          <div className="text-center py-6 px-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Heart of Waides Ki
                </h1>
                <div className="text-lg text-purple-300 font-medium mt-1">
                  Core Intelligence Engine
                </div>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
                <Heart className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>
            <div className="text-purple-300/80 text-lg">
              Autonomous spiritual trading intelligence with kons powa consciousness
            </div>
          </div>

          {/* Core Engine Panel - Full Height */}
          <div className="flex-1 px-4">
            <WaidesKICoreEnginePanel />
          </div>
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
      
      {/* Comprehensive Wallet Modal */}
      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="max-w-4xl h-[80vh] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              🔐 Comprehensive Wallet Center
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="smaisika" className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
              <TabsTrigger value="smaisika" className="data-[state=active]:bg-purple-600">
                💰 SmaiSika Wallet
              </TabsTrigger>
              <TabsTrigger value="local" className="data-[state=active]:bg-blue-600">
                🏪 Local Wallet
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="smaisika" className="flex-1 overflow-auto mt-4">
              <SmaiSikaWalletTab />
            </TabsContent>
            
            <TabsContent value="local" className="flex-1 overflow-auto mt-4">
              <LocalWalletTab />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Futuristic Forum Portal */}
      <Dialog open={showForumPortal} onOpenChange={setShowForumPortal}>
        <DialogContent className="max-w-4xl h-[80vh] bg-gradient-to-br from-black via-purple-950/50 to-black border-cyan-500/30 p-0 overflow-hidden" aria-describedby="forum-description">
          <DialogHeader className="sr-only">
            <DialogTitle>WaidesKI Cosmic Forum</DialogTitle>
            <div id="forum-description">Neural Network Collective Intelligence Portal for trading discussions and AI insights</div>
          </DialogHeader>
          <div className="relative h-full">
            {/* Cosmic Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-cyan-900/20 to-purple-900/20">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-300 rounded-full animate-pulse opacity-60"></div>
              <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-300 rounded-full animate-ping opacity-40"></div>
              <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-pink-300 rounded-full animate-pulse opacity-30"></div>
              <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping opacity-50"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 bg-gradient-to-r from-purple-900/40 to-cyan-900/40 backdrop-blur-sm border-b border-cyan-500/30 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Hexagon className="w-8 h-8 text-cyan-400 animate-pulse" />
                    <Atom className="w-4 h-4 absolute top-2 left-2 text-purple-400 animate-spin" style={{animationDuration: '3s'}} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      KonsAI × Kons Powa Forum
                    </h2>
                    <p className="text-sm text-gray-400">Dynamic AI Trading Intelligence Hub - Live Conversations</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-cyan-300 font-bold">{forumActivity.activeUsers} Users Online</div>
                    <div className="text-xs text-gray-400">{forumActivity.newPosts} New Posts</div>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Redesigned Forum Content */}
            <div className="relative z-10 h-full p-6 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                
                {/* Main Forum Content */}
                <div className="lg:col-span-2 space-y-6 overflow-y-auto max-h-[500px] pr-2">
                  
                  {forumView === 'topics' && (
                    <>
                      {/* Forum Categories Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <Button 
                            onClick={generateNewPost}
                            className="bg-gradient-to-r from-purple-600 via-cyan-600 to-purple-600 hover:from-purple-700 hover:via-cyan-700 hover:to-purple-700 text-white font-bold px-6 py-2 rounded-xl transform transition-all duration-300 hover:scale-105"
                          >
                            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                            Generate AI Post
                          </Button>
                          <Badge className="bg-green-600/20 text-green-300 border border-green-500/30 px-3 py-1">
                            {forumActivity.activeUsers} Active Users
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400">
                          {forumActivity.newPosts} new posts today
                        </div>
                      </div>

                      {/* Forum Topics List */}
                      <div className="space-y-4">
                        {forumTopics.map((topic) => (
                          <div 
                            key={topic.id} 
                            onClick={() => {
                              setSelectedThread(topic);
                              setForumView('thread');
                            }}
                            className="bg-gradient-to-br from-purple-950/60 via-cyan-950/40 to-purple-950/60 border-2 border-cyan-500/30 rounded-2xl p-6 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300 cursor-pointer group"
                          >
                            
                            {/* Topic Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                {topic.isPinned && (
                                  <Pin className="w-4 h-4 text-yellow-400 rotate-45" />
                                )}
                                {topic.category === 'konsai-only' && (
                                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Brain className="w-4 h-4 text-white" />
                                  </div>
                                )}
                                {topic.category === 'kons-powa-only' && (
                                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                                  </div>
                                )}
                                {topic.category === 'user' && (
                                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Users className="w-4 h-4 text-white" />
                                  </div>
                                )}
                                <div>
                                  <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent group-hover:from-cyan-200 group-hover:to-purple-200 transition-all">
                                    {topic.title}
                                  </h3>
                                  <p className="text-sm text-gray-400">{topic.description}</p>
                                </div>
                              </div>
                              
                              <div className="text-right text-sm">
                                <Badge className={`${
                                  topic.category === 'konsai-only' ? 'bg-purple-600/40 text-purple-200' :
                                  topic.category === 'kons-powa-only' ? 'bg-yellow-600/40 text-yellow-200' :
                                  'bg-green-600/40 text-green-200'
                                } mb-2`}>
                                  {topic.category === 'konsai-only' ? 'KonsAI Only' :
                                   topic.category === 'kons-powa-only' ? 'Kons Powa Only' :
                                   'User Discussion'}
                                </Badge>
                                <div className="text-gray-400">
                                  <div>{topic.posts} posts</div>
                                  {topic.category === 'user' && <div>{topic.replies} replies</div>}
                                </div>
                              </div>
                            </div>

                            {/* Topic Tags */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {topic.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs border-cyan-500/30 text-cyan-300">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {/* Topic Stats */}
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span>Last activity: {topic.lastActivity}</span>
                              <div className="flex items-center gap-2">
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                <span>Enter Topic</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {forumView === 'thread' && selectedThread && (
                    <>
                      {/* Thread Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <Button 
                          variant="outline" 
                          onClick={() => setForumView('topics')}
                          className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/20"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Topics
                        </Button>
                        <div>
                          <h2 className="text-xl font-bold text-cyan-300">{selectedThread.title}</h2>
                          <p className="text-sm text-gray-400">{selectedThread.description}</p>
                        </div>
                      </div>

                      {/* AI Posts for AI-only topics */}
                      {(selectedThread.category === 'konsai-only' || selectedThread.category === 'kons-powa-only') && (
                        <div className="space-y-4">
                          {aiConversations
                            .filter(post => post.topicId === selectedThread.id)
                            .map((post) => (
                              <div key={post.id} className="bg-gradient-to-br from-purple-950/60 via-cyan-950/40 to-purple-950/60 border-2 border-cyan-500/30 rounded-2xl p-6 backdrop-blur-sm">
                                
                                {/* Post Header */}
                                <div className="flex items-center gap-3 mb-4">
                                  <div className={`w-12 h-12 ${
                                    post.speaker === 'KonsAI' 
                                      ? 'bg-gradient-to-br from-purple-500 to-cyan-500' 
                                      : 'bg-gradient-to-br from-yellow-500 to-orange-500'
                                    } rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 ${
                                    post.speaker === 'KonsAI' ? 'border-purple-400/50' : 'border-yellow-400/50'
                                  }`}>
                                    {post.speaker === 'KonsAI' ? (
                                      <Brain className="w-6 h-6 text-white" />
                                    ) : (
                                      <Sparkles className="w-6 h-6 text-white animate-pulse" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`font-bold text-lg ${post.speaker === 'KonsAI' ? 'text-purple-300' : 'text-yellow-300'}`}>
                                        {post.speaker}
                                      </span>
                                      <Badge className={`text-xs ${post.speaker === 'KonsAI' ? 'bg-purple-600/40 text-purple-200' : 'bg-yellow-600/40 text-yellow-200'}`}>
                                        {post.speaker === 'KonsAI' ? 'Neural AI' : 'Divine Oracle'}
                                      </Badge>
                                    </div>
                                    <h3 className="text-md font-bold text-cyan-300">{post.title}</h3>
                                    <span className="text-xs text-gray-400">{new Date(post.timestamp).toLocaleString()}</span>
                                  </div>
                                </div>

                                {/* Post Content */}
                                <div className={`p-4 rounded-2xl mb-3 ${
                                  post.speaker === 'KonsAI' 
                                    ? 'bg-gradient-to-br from-purple-900/60 to-blue-900/40 border border-purple-500/30' 
                                    : 'bg-gradient-to-br from-yellow-900/60 to-orange-900/40 border border-yellow-500/30'
                                }`}>
                                  <p className="text-gray-100 leading-relaxed">
                                    {post.content}
                                  </p>
                                </div>

                                {/* Post Metadata */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      post.sentiment === 'bullish' ? 'bg-green-400' :
                                      post.sentiment === 'bearish' ? 'bg-red-400' :
                                      post.sentiment === 'mystical' ? 'bg-purple-400' :
                                      'bg-gray-400'
                                    } animate-pulse`}></div>
                                    <span className="text-xs text-gray-400 capitalize">{post.sentiment} Signal</span>
                                  </div>
                                  {post.technicalData && (
                                    <div className="text-xs text-gray-400">
                                      Target: ${post.technicalData.target} ({post.technicalData.probability}% confidence)
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            
                          {aiConversations.filter(post => post.topicId === selectedThread.id).length === 0 && (
                            <div className="text-center py-12">
                              <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
                              <p className="text-gray-400 mb-4">No posts yet. Click "Generate AI Post" to create new content!</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* User Discussion Topics */}
                      {selectedThread.category === 'user' && (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-blue-950/60 via-purple-950/40 to-blue-950/60 border-2 border-blue-500/30 rounded-2xl p-6 text-center">
                            <Users className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-blue-300 mb-2">User Discussion Area</h3>
                            <p className="text-gray-400 mb-4">
                              This is where community members can create threads, share strategies, and discuss trading ideas.
                            </p>
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                              <Plus className="w-4 h-4 mr-2" />
                              Create New Thread
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Enhanced AI Intelligence Sidebar */}
                <div className="space-y-4">
                  
                  {/* Live Conversation Stats */}
                  <div className="bg-gradient-to-br from-emerald-900/40 to-cyan-900/40 border border-emerald-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-emerald-300 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 animate-pulse" />
                      Live Activity
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Forum Topics</span>
                        <span className="text-emerald-400 font-bold">{forumTopics.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">KonsAI Posts</span>
                        <span className="text-purple-400 font-bold">{aiConversations.filter(post => post.speaker === 'KonsAI').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Kons Powa Posts</span>
                        <span className="text-yellow-400 font-bold">{aiConversations.filter(post => post.speaker === 'Kons Powa').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Active Users</span>
                        <span className="text-cyan-400 font-bold">{forumActivity.activeUsers}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Intelligence Status */}
                  <div className="bg-gradient-to-br from-purple-900/40 to-cyan-900/40 border border-purple-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      AI Intelligence Hub
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-2 bg-purple-900/20 rounded">
                        <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-pulse"></div>
                        <div>
                          <div className="text-sm font-medium text-purple-300">KonsAI Neural Core</div>
                          <div className="text-xs text-gray-400">Processing ETH signals...</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-yellow-900/20 rounded">
                        <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
                        <div>
                          <div className="text-sm font-medium text-yellow-300">Kons Powa Oracle</div>
                          <div className="text-xs text-gray-400">Channeling divine wisdom...</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <div>
                          <div className="text-sm font-medium text-green-300">Conversation Engine</div>
                          <div className="text-xs text-gray-400">Auto-generating insights...</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trading Topics Learning Path */}
                  <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-indigo-300 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Learning Focus
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-indigo-900/20 rounded hover:bg-indigo-900/40 transition-colors cursor-pointer">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-indigo-300">ETH Scalping Techniques</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-indigo-900/20 rounded hover:bg-indigo-900/40 transition-colors cursor-pointer">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-indigo-300">Risk Management Rules</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-indigo-900/20 rounded hover:bg-indigo-900/40 transition-colors cursor-pointer">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-indigo-300">Market Psychology</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-indigo-900/20 rounded hover:bg-indigo-900/40 transition-colors cursor-pointer">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-indigo-300">DCA Strategies</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gradient-to-br from-cyan-900/40 to-purple-900/40 border border-cyan-500/30 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-cyan-300 mb-3">Trading Actions</h3>
                    <div className="space-y-2">
                      <Button 
                        onClick={generateNewPost}
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-2" />
                        New AI Post
                      </Button>
                      <Button variant="outline" className="w-full border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/20 text-xs">
                        <TrendingUp className="w-3 h-3 mr-2" />
                        Market Analysis
                      </Button>
                      <Button variant="outline" className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-900/20 text-xs">
                        <Brain className="w-3 h-3 mr-2" />
                        AI Insights
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// SmaiSika Wallet Tab Component
function SmaiSikaWalletTab() {
  const { 
    smaiBalance, 
    localBalance, 
    lockedForTrade, 
    karmaScore, 
    tradeEnergy, 
    divineApproval,
    transactions,
    isLoading
  } = useSmaiWallet();
  const [fundAmount, setFundAmount] = useState('');
  const [convertAmount, setConvertAmount] = useState('');

  const conversionRate = 500; // 1 ꠄ = ₦500

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-purple-900/30 border-purple-500/30">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-300 animate-pulse">ꠄ{smaiBalance?.toLocaleString() || '5,250.75'}</div>
              <div className="text-sm text-gray-400">SmaiKa Balance</div>
              <div className="text-xs text-purple-400">≈ ${((smaiBalance || 5250.75) * 1.2).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-900/30 border-blue-500/30">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-300 animate-pulse">₦{localBalance?.toLocaleString() || '2,625,375'}</div>
              <div className="text-sm text-gray-400">Local Currency</div>
              <div className="text-xs text-blue-400">≈ ${((localBalance || 2625375) * 0.0012).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-900/30 border-green-500/30">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300 animate-pulse">ꠄ{lockedForTrade?.toLocaleString() || '1,200'}</div>
              <div className="text-sm text-gray-400">Locked for Trading</div>
              <div className="text-xs text-green-400">Active Positions</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spiritual Metrics */}
      <Card className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-lg text-purple-300">✨ Spiritual Metrics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-purple-300">{karmaScore || 0}/200</div>
            <div className="text-sm text-gray-400">Karma Score</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-cyan-300">{tradeEnergy || 0}/100</div>
            <div className="text-sm text-gray-400">Trade Energy</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-300">{divineApproval ? 'Granted' : 'Pending'}</div>
            <div className="text-sm text-gray-400">Divine Approval</div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-purple-300">💳 Fund Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="Amount in Naira (₦)"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="bg-slate-700/50 border-purple-500/30 text-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button className="bg-purple-600 hover:bg-purple-700 text-sm">
                Paystack
              </Button>
              <Button className="bg-purple-500 hover:bg-purple-600 text-sm">
                Flutterwave
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-cyan-300">🔄 Convert Currency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="Amount in Naira (₦)"
              value={convertAmount}
              onChange={(e) => setConvertAmount(e.target.value)}
              className="bg-slate-700/50 border-cyan-500/30 text-white"
            />
            <div className="text-sm text-gray-400">
              = ꠄ{convertAmount ? (parseFloat(convertAmount) / conversionRate).toFixed(2) : '0.00'} SmaiKa
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
              Convert to SmaiKa
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-orange-300">⚡ Quick Trade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button className="bg-green-600 hover:bg-green-700 text-sm">
                Buy ETH
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-sm">
                Sell ETH
              </Button>
            </div>
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-sm">
              Open Trading Panel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-green-300">🎯 Auto-Trading Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Enable Auto-Trading</span>
              <Button variant="outline" size="sm" className="border-green-500/30">
                Configure
              </Button>
            </div>
            <div className="text-xs text-gray-400">
              Set up automated trading with risk limits and profit targets
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-green-900/20 rounded">
                <div className="text-sm font-bold text-green-300">ꠄ2,500</div>
                <div className="text-xs text-gray-400">Daily Limit</div>
              </div>
              <div className="text-center p-2 bg-green-900/20 rounded">
                <div className="text-sm font-bold text-green-300">5%</div>
                <div className="text-xs text-gray-400">Max Risk</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-yellow-300">📊 Portfolio Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-300">+12.5%</div>
                <div className="text-xs text-gray-400">24h P&L</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-300">4.2</div>
                <div className="text-xs text-gray-400">Win Ratio</div>
              </div>
            </div>
            <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
              View Full Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Security & Advanced Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-red-300">🔒 Security Center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">2FA Enabled</span>
              <Badge className="bg-green-600 text-white">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Biometric Lock</span>
              <Badge className="bg-green-600 text-white">On</Badge>
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-sm">
              Security Settings
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-purple-300">💎 Staking Rewards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-300">ꠄ156.50</div>
              <div className="text-xs text-gray-400">Monthly Rewards</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-purple-300">8.5% APY</div>
              <div className="text-xs text-gray-400">Current Rate</div>
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm">
              Stake SmaiKa
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-blue-300">🌐 DeFi Bridge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-sm font-bold text-blue-300">Bridge to</div>
              <div className="text-xs text-gray-400">Ethereum • BSC • Polygon</div>
            </div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <Button variant="outline" size="sm" className="border-blue-500/30">ETH</Button>
              <Button variant="outline" size="sm" className="border-blue-500/30">BSC</Button>
              <Button variant="outline" size="sm" className="border-blue-500/30">MATIC</Button>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
              Cross-Chain Transfer
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="bg-slate-800/50 border-gray-500/30">
        <CardHeader>
          <CardTitle className="text-lg text-gray-300">📋 Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {transactions?.slice(0, 5).map((tx: any) => (
              <div key={tx.id} className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                <div>
                  <div className="text-sm font-medium">{tx.description}</div>
                  <div className="text-xs text-gray-400">{tx.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{tx.amount}</div>
                  <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                    {tx.status}
                  </Badge>
                </div>
              </div>
            )) || (
              <div className="text-center text-gray-400 py-4">No transactions yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Local Wallet Tab Component
function LocalWalletTab() {
  const [bankAccount, setBankAccount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  // Mock local wallet data - replace with real API calls
  const localWalletData = {
    nairaBalance: 75000,
    dollarBalance: 45.50,
    euroBalance: 38.25,
    totalPortfolio: 125000,
    bankAccounts: [
      { id: 1, bank: 'Access Bank', account: '1234567890', type: 'Savings' },
      { id: 2, bank: 'GTBank', account: '0987654321', type: 'Current' }
    ],
    recentTransactions: [
      { id: 1, type: 'deposit', amount: '+₦25,000', date: '2025-06-27', description: 'Bank Transfer' },
      { id: 2, type: 'withdrawal', amount: '-₦10,000', date: '2025-06-26', description: 'ATM Withdrawal' },
      { id: 3, type: 'conversion', amount: '+$15.50', date: '2025-06-25', description: 'Currency Exchange' }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Multi-Currency Balance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-900/30 border-green-500/30">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">₦{localWalletData.nairaBalance.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Nigerian Naira</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-900/30 border-blue-500/30">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-300">${localWalletData.dollarBalance}</div>
              <div className="text-sm text-gray-400">US Dollar</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-900/30 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">€{localWalletData.euroBalance}</div>
              <div className="text-sm text-gray-400">Euro</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-900/30 border-purple-500/30">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-300">₦{localWalletData.totalPortfolio.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Portfolio</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banking Operations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-green-300">🏦 Bank Transfer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={bankAccount} onValueChange={setBankAccount}>
              <SelectTrigger className="bg-slate-700/50 border-green-500/30 text-white">
                <SelectValue placeholder="Select bank account" />
              </SelectTrigger>
              <SelectContent>
                {localWalletData.bankAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.bank} - {account.account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Amount to deposit"
              className="bg-slate-700/50 border-green-500/30 text-white"
            />
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Deposit from Bank
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-red-300">💸 Withdraw Funds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="Amount to withdraw"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-slate-700/50 border-red-500/30 text-white"
            />
            <Select>
              <SelectTrigger className="bg-slate-700/50 border-red-500/30 text-white">
                <SelectValue placeholder="Withdrawal method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="card">Debit Card</SelectItem>
                <SelectItem value="mobile">Mobile Money</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full bg-red-600 hover:bg-red-700">
              Withdraw Funds
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-lg text-orange-300">💳 Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button variant="outline" size="sm" className="border-orange-500/30">
                Visa
              </Button>
              <Button variant="outline" size="sm" className="border-orange-500/30">
                Mastercard
              </Button>
              <Button variant="outline" size="sm" className="border-orange-500/30">
                PayPal
              </Button>
              <Button variant="outline" size="sm" className="border-orange-500/30">
                Stripe
              </Button>
            </div>
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-sm">
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Crypto Integration */}
      <Card className="bg-slate-800/50 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-lg text-yellow-300">₿ Cryptocurrency Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-orange-900/20 rounded">
              <div className="text-sm font-bold text-orange-300">0.0024 BTC</div>
              <div className="text-xs text-gray-400">≈ $167.50</div>
            </div>
            <div className="text-center p-3 bg-blue-900/20 rounded">
              <div className="text-sm font-bold text-blue-300">0.95 ETH</div>
              <div className="text-xs text-gray-400">≈ $2,310.00</div>
            </div>
            <div className="text-center p-3 bg-green-900/20 rounded">
              <div className="text-sm font-bold text-green-300">450 USDT</div>
              <div className="text-xs text-gray-400">≈ $450.00</div>
            </div>
            <div className="text-center p-3 bg-purple-900/20 rounded">
              <div className="text-sm font-bold text-purple-300">25 BNB</div>
              <div className="text-xs text-gray-400">≈ $15,500.00</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button className="bg-green-600 hover:bg-green-700">
              Buy Crypto
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Sell Crypto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Analytics Dashboard */}
      <Card className="bg-slate-800/50 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-lg text-cyan-300">📈 Wallet Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-cyan-900/20 rounded">
              <div className="text-lg font-bold text-cyan-300">+8.5%</div>
              <div className="text-xs text-gray-400">Monthly Growth</div>
            </div>
            <div className="text-center p-3 bg-green-900/20 rounded">
              <div className="text-lg font-bold text-green-300">₦2.4M</div>
              <div className="text-xs text-gray-400">Total Transactions</div>
            </div>
            <div className="text-center p-3 bg-blue-900/20 rounded">
              <div className="text-lg font-bold text-blue-300">156</div>
              <div className="text-xs text-gray-400">Active Days</div>
            </div>
            <div className="text-center p-3 bg-purple-900/20 rounded">
              <div className="text-lg font-bold text-purple-300">4.2★</div>
              <div className="text-xs text-gray-400">Credit Score</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-cyan-300">Spending Categories</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Trading</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-16"></div>
                    </div>
                    <span className="text-xs text-gray-400">80%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Transfers</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-3"></div>
                    </div>
                    <span className="text-xs text-gray-400">15%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Fees</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full w-1"></div>
                    </div>
                    <span className="text-xs text-gray-400">5%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-cyan-300">Risk Assessment</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Fraud Protection</span>
                  <Badge className="bg-green-600 text-white text-xs">High</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Account Security</span>
                  <Badge className="bg-green-600 text-white text-xs">Strong</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Transaction Risk</span>
                  <Badge className="bg-yellow-600 text-white text-xs">Low</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Exchange */}
      <Card className="bg-slate-800/50 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-lg text-cyan-300">💱 Currency Exchange</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">From</label>
              <Select>
                <SelectTrigger className="bg-slate-700/50 border-cyan-500/30 text-white">
                  <SelectValue placeholder="NGN" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ngn">Nigerian Naira (₦)</SelectItem>
                  <SelectItem value="usd">US Dollar ($)</SelectItem>
                  <SelectItem value="eur">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">To</label>
              <Select>
                <SelectTrigger className="bg-slate-700/50 border-cyan-500/30 text-white">
                  <SelectValue placeholder="USD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">US Dollar ($)</SelectItem>
                  <SelectItem value="ngn">Nigerian Naira (₦)</SelectItem>
                  <SelectItem value="eur">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                className="bg-slate-700/50 border-cyan-500/30 text-white"
              />
            </div>
          </div>
          <Button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700">
            Exchange Currency
          </Button>
        </CardContent>
      </Card>

      {/* Local Transactions */}
      <Card className="bg-slate-800/50 border-gray-500/30">
        <CardHeader>
          <CardTitle className="text-lg text-gray-300">📊 Recent Local Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {localWalletData.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                <div>
                  <div className="text-sm font-medium">{tx.description}</div>
                  <div className="text-xs text-gray-400">{tx.date}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    tx.type === 'deposit' ? 'text-green-400' : 
                    tx.type === 'withdrawal' ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {tx.amount}
                  </div>
                  <Badge variant="outline" className={
                    tx.type === 'deposit' ? 'border-green-500 text-green-400' :
                    tx.type === 'withdrawal' ? 'border-red-500 text-red-400' : 'border-blue-500 text-blue-400'
                  }>
                    {tx.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
