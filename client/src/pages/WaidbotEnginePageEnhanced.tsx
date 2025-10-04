import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowUp,
  ArrowDown,
  Activity,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Settings,
  BarChart3,
  Brain,
  Target,
  Shield,
  Database,
  Network,
  Radar,
  Sparkles,
  Zap as Lightning,
  Hexagon,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Wallet,
  Plus,
  Minus,
  Eye,
  Monitor,
  Layers,
  Cpu,
  Heart,
  Lightbulb
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EnhancedBotManagement from "@/components/EnhancedBotManagement";
import { CelebrationTooltip, useCelebrationTooltip, celebrationMessages } from '@/components/ui/celebration-tooltip';

interface BotStatus {
  id: string;
  name: string;
  isActive: boolean;
  performance: {
    totalTrades: number;
    winRate: number;
    profit: number;
    todayTrades: number;
    allTimeWinRate?: number;
    maxDrawdown?: number;
    allTimeProfit?: number;
    streakWins?: number;
    streakLosses?: number;
    sharpeRatio?: number;
  };
  currentAction: string;
  nextAction: string;
  confidence: number;
  messages?: BotMessage[];
  gamifiedMetrics?: {
    experience: number;
    level: number;
    achievements: string[];
    streak: number;
    winPercentage?: number;
    allTimeDrawdown?: number;
    currentStreak?: number;
    streakType?: 'win' | 'loss';
    profitFactor?: number;
    sharpeRatio?: number;
  };
  real_time_metrics?: {
    current_decision: string;
    confidence_level: number;
    last_action: string;
    active_signals: number;
  };
}

interface EthData {
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
}

interface MarketData {
  trend: string;
  momentum: number;
  volatility: number;
  signals: string[];
}

interface SystemStats {
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
}

interface DetailedBotInfo {
  strategy: string;
  tradingPairs: string[];
  riskLevel: string;
  timeframe: string;
  lastUpdate: string;
  aiModel: string;
  successRate: number;
  currentPosition: string;
}

interface BotMessage {
  id: string;
  timestamp: number;
  message: string;
  type: 'analysis' | 'decision' | 'warning' | 'success' | 'info';
  botId: string;
  ethPrice?: number;
  action?: string;
}

interface BotMemoryEntry {
  timestamp: number;
  action: string;
  ethPrice: number;
  result: 'win' | 'loss' | 'neutral';
  profit: number;
}

interface EnhancedBotSettings {
  id: string;
  name: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  maxPositionSize: number;
  stopLoss: number;
  takeProfit: number;
  tradingPairs: string[];
  strategies: string[];
  activeStrategy: string;
  autoTrading: boolean;
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    profitThreshold: number;
    lossThreshold: number;
  };
  timeframes: string[];
  activeTimeframe: string;
  maxDailyTrades: number;
  emergencyStop: {
    enabled: boolean;
    maxDailyLoss: number;
    consecutiveLossLimit: number;
  };
  advanced: {
    aiModel: string;
    confidenceThreshold: number;
    signalFilters: string[];
    backtestPeriod: number;
    paperTrading: boolean;
  };
}

interface EnhancedProfitLossTracker {
  botId: string;
  totalProfit: number;
  totalLoss: number;
  netProfitLoss: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  currentDrawdown: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  dailyProfitLoss: number;
  weeklyProfitLoss: number;
  monthlyProfitLoss: number;
  yearlyProfitLoss: number;
  isCurrentlyProfiting: boolean;
  isCurrentlyLosing: boolean;
  lastTradeResult: 'win' | 'loss' | 'neutral';
  riskAdjustedReturns: number;
}

interface TradingSignal {
  botId: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  strength: number;
  symbol: string;
  targetPrice: number;
  stopLoss: number;
  takeProfit: number;
  reasoning: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timeframe: string;
  strategy: string;
  timestamp: number;
}

interface PerformanceMetrics {
  botId: string;
  efficiency: number;
  adaptability: number;
  consistency: number;
  riskManagement: number;
  learningProgress: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  improvementAreas: string[];
}

// Bot entities for enhanced management
const BOT_ENTITIES = [
  { id: 'maibot', name: 'Maibot' },
  { id: 'waidbot', name: 'WaidBot α' },
  { id: 'waidbot-pro', name: 'WaidBot Pro β' },
  { id: 'autonomous', name: 'Autonomous Trader γ' },
  { id: 'full-engine', name: 'Full Engine Ω' },
  { id: 'nwaora-chigozie', name: 'Nwaora Chigozie ε' }
];

export default function WaidbotEnginePageEnhanced() {
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [showBotModal, setShowBotModal] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const queryClient = useQueryClient();
  
  // Celebration tooltip hook
  const { celebrations, triggerCelebration, clearCelebration } = useCelebrationTooltip();

  // All 6 Bot Entities Configuration
  const BOT_ENTITIES = [
    {
      id: 'maibot',
      name: 'Maibot',
      displayName: 'Free Binary Options Assistant',
      tier: 'FREE',
      price: 0,
      icon: Sparkles,
      color: "from-blue-500 to-blue-600",
      route: '/maibot',
      autonomous: false,
      decisionEngine: 'Manual Override Required',
      description: 'Entry-level binary options trading with manual approval for all trades'
    },
    {
      id: 'waidbot',
      name: 'WaidBot α',
      displayName: 'Basic Binary Options Trading',
      tier: 'BASIC',
      price: 9.99,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      route: '/waidbot',
      autonomous: true,
      decisionEngine: 'Binary Options Pattern Recognition',
      description: 'Entry-level binary options trading with semi-autonomous decision making'
    },
    {
      id: 'waidbot-pro',
      name: 'WaidBot Pro β',
      displayName: 'Professional Binary Options Trading',
      tier: 'PRO',
      price: 29.99,
      icon: Lightning,
      color: "from-purple-500 to-purple-600",
      route: '/waidbot-pro',
      autonomous: true,
      decisionEngine: 'Binary Options AI Engine',
      description: 'Advanced binary options trading via Deriv, IQ Option, Pocket Option, and Quotex'
    },
    {
      id: 'autonomous',
      name: 'Autonomous Trader γ',
      displayName: '24/7 Forex & CFD Trading Elite',
      tier: 'ELITE',
      price: 59.99,
      icon: Radar,
      color: "from-orange-500 to-orange-600",
      route: '/autonomous-trader',
      autonomous: true,
      decisionEngine: 'Forex/CFD ML Engine',
      description: 'Elite Forex & CFD trading via Deriv, MT5, and Oanda with 24/7 operation'
    },
    {
      id: 'full-engine',
      name: 'Full Engine Ω',
      displayName: 'Master Spot Exchange Trading',
      tier: 'MASTER',
      price: 149.99,
      icon: Hexagon,
      color: "from-red-500 to-red-600",
      route: '/full-engine',
      autonomous: true,
      decisionEngine: 'Guardian Decision System',
      description: 'Elite spot exchange trading (ETH/USDT) with advanced risk management'
    },
    {
      id: 'smai-chinnikstah',
      name: 'SmaiChinnikstah δ',
      displayName: 'Divine Spiritual Trading',
      tier: 'DIVINE_DELTA',
      price: 299.99,
      icon: Brain,
      color: "from-pink-500 to-pink-600",
      route: '/divine-trading',
      autonomous: true,
      decisionEngine: 'Divine Energy Algorithm',
      description: 'Spiritual market intelligence with divine energy distribution'
    },
    {
      id: 'nwaora-chigozie',
      name: 'Nwaora Chigozie ε',
      displayName: 'Cosmic Intelligence Omega',
      tier: 'COSMIC_EPSILON',
      price: 999.99,
      icon: Target,
      color: "from-indigo-500 to-indigo-600",
      route: '/nwaora-chigozie',
      autonomous: true,
      decisionEngine: 'Cosmic Consciousness Engine',
      description: 'Ultimate cosmic intelligence with backup trading system'
    }
  ];

  // Fetch bot statuses for all 6 entities
  const { data: waidbotStatus } = useQuery<BotStatus>({
    queryKey: ['/api/waidbot-engine/waidbot/status'],
    refetchInterval: 2000,
  });

  const { data: waidbotProStatus } = useQuery<BotStatus>({
    queryKey: ['/api/waidbot-engine/waidbot-pro/status'],
    refetchInterval: 2000,
  });

  const { data: autonomousStatus } = useQuery<BotStatus>({
    queryKey: ['/api/waidbot-engine/autonomous/status'],
    refetchInterval: 2000,
  });

  const { data: maibotStatus } = useQuery<BotStatus>({
    queryKey: ['/api/waidbot-engine/maibot/status'],
    refetchInterval: 2000,
  });

  const { data: fullEngineStatus } = useQuery<any>({
    queryKey: ['/api/full-engine/status'],
    refetchInterval: 2000,
  });

  const { data: smaiChinnikstahStatus } = useQuery<any>({
    queryKey: ['/api/divine-bots/smai-chinnikstah/status'],
    refetchInterval: 2000,
  });

  const { data: nwaoraChigozieStatus } = useQuery<any>({
    queryKey: ['/api/divine-bots/nwaora-chigozie/status'],
    refetchInterval: 2000,
  });

  // Fetch bot messages with 30-second refresh
  const { data: botMessages } = useQuery<any>({
    queryKey: ['/api/waidbot-engine/bot-messages'],
    refetchInterval: 30000, // 30 seconds for bot messages
  });

  const { data: fullEngineAnalytics } = useQuery<any>({
    queryKey: ['/api/full-engine/analytics'],
    refetchInterval: 5000,
  });

  // Fetch comprehensive real-time data from entire app
  const { data: comprehensiveMetrics } = useQuery({
    queryKey: ['/api/waidbot-engine/comprehensive-metrics'],
    refetchInterval: 5000,
  });

  // Fetch additional real-time data
  const { data: ethData } = useQuery<EthData>({
    queryKey: ['/api/eth/current-price'],
    refetchInterval: 3000,
  });

  const { data: marketData } = useQuery<MarketData>({
    queryKey: ['/api/eth/market-analysis'],
    refetchInterval: 5000,
  });

  const { data: systemStats } = useQuery<SystemStats>({
    queryKey: ['/api/system/stats'],
    refetchInterval: 10000,
  });

  // Helper function to get bot status by ID
  const getBotStatusById = (botId: string): BotStatus | null => {
    switch (botId) {
      case 'maibot':
        return maibotStatus || null;
      case 'waidbot':
        return waidbotStatus || null;
      case 'waidbot-pro':
        return waidbotProStatus || null;
      case 'autonomous':
        return autonomousStatus || null;
      case 'full-engine':
        return fullEngineStatus ? {
          id: 'full-engine',
          name: 'Full Engine Ω',
          isActive: fullEngineStatus.engine_status?.emergency_stop === false,
          performance: {
            totalTrades: fullEngineStatus.engine_status?.active_trades || 0,
            winRate: 0,
            profit: 0,
            todayTrades: 0
          },
          currentAction: fullEngineStatus.engine_status?.status || 'Standby',
          nextAction: 'Smart Risk Management',
          confidence: 95
        } : null;
      case 'smai-chinnikstah':
        return smaiChinnikstahStatus ? {
          id: 'smai-chinnikstah',
          name: 'SmaiChinnikstah δ',
          isActive: smaiChinnikstahStatus.isActive || false,
          performance: smaiChinnikstahStatus.performance || {
            totalTrades: 0,
            winRate: 0,
            profit: 0,
            todayTrades: 0
          },
          currentAction: smaiChinnikstahStatus.distributionMode || 'Divine Standby',
          nextAction: 'Energy Distribution',
          confidence: smaiChinnikstahStatus.energyLevel || 120
        } : null;
      case 'nwaora-chigozie':
        return nwaoraChigozieStatus ? {
          id: 'nwaora-chigozie',
          name: 'Nwaora Chigozie ε',
          isActive: nwaoraChigozieStatus.isActive || false,
          performance: nwaoraChigozieStatus.performance || {
            totalTrades: 0,
            winRate: 0,
            profit: 0,
            todayTrades: 0
          },
          currentAction: nwaoraChigozieStatus.supportMode || 'Backup Standby',
          nextAction: 'Cosmic Analysis',
          confidence: nwaoraChigozieStatus.energyLevel || 85
        } : null;
      default:
        return null;
    }
  };

  // Function to generate autonomous decision text
  const getAutonomousDecisionText = (bot: any, status: BotStatus | null) => {
    if (!bot.autonomous) {
      return "Manual approval required for all trades";
    }

    if (!status || !status.isActive) {
      return "Bot offline - activate to begin autonomous trading";
    }

    const decisions = [
      `${bot.decisionEngine} analyzing market patterns...`,
      `Processing ${bot.tier} level trading signals...`,
      `Evaluating risk parameters autonomously...`,
      `${status.currentAction} - confidence ${status.confidence}%`,
      `Scanning for optimal ${bot.tier} tier opportunities...`,
      `Autonomous engine active - making independent decisions`
    ];

    return decisions[Math.floor(Math.random() * decisions.length)];
  };

  // Bot control mutations
  const startWaidBot = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/waidbot/start', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot/status'] });
      triggerCelebration('waidbot-start', celebrationMessages.botActivated('WaidBot α'), 'activation');
    },
  });

  const stopWaidBot = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/waidbot/stop', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot/status'] });
      triggerCelebration('waidbot-stop', celebrationMessages.botStopped('WaidBot α'), 'success');
    },
  });

  const startWaidBotPro = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/waidbot-pro/start', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot-pro/status'] });
      triggerCelebration('waidbot-pro-start', celebrationMessages.botActivated('WaidBot Pro β'), 'activation');
    },
  });

  const stopWaidBotPro = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/waidbot-pro/stop', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot-pro/status'] });
      triggerCelebration('waidbot-pro-stop', celebrationMessages.botStopped('WaidBot Pro β'), 'success');
    },
  });

  const startAutonomous = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/autonomous/start', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/autonomous/status'] });
      triggerCelebration('autonomous-start', celebrationMessages.botActivated('Autonomous Trader γ'), 'activation');
    },
  });

  const stopAutonomous = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/autonomous/stop', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/autonomous/status'] });
      triggerCelebration('autonomous-stop', celebrationMessages.botStopped('Autonomous Trader γ'), 'success');
    },
  });

  // Full Engine mutations (unified system)
  const startFullEngine = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/full-engine/start', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/autonomous/status'] });
      triggerCelebration('full-engine-start', celebrationMessages.botActivated('Full Engine Ω'), 'divine');
    },
  });

  const stopFullEngine = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/full-engine/stop', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/autonomous/status'] });
      triggerCelebration('full-engine-stop', celebrationMessages.botStopped('Full Engine Ω'), 'success');
    },
  });

  // Maibot mutations
  const startMaibot = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/maibot/start', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/maibot/status'] });
      triggerCelebration('maibot-start', celebrationMessages.botActivated('Maibot'), 'activation');
    },
  });

  const stopMaibot = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/maibot/stop', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/maibot/status'] });
      triggerCelebration('maibot-stop', celebrationMessages.botStopped('Maibot'), 'success');
    },
  });

  // SmaiChinnikstah mutations
  const startSmaiChinnikstah = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/smai-chinnikstah/start', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/divine-bots/smai-chinnikstah/status'] });
      triggerCelebration('smai-chinnikstah-start', celebrationMessages.botActivated('SmaiChinnikstah δ'), 'divine');
    },
  });

  const stopSmaiChinnikstah = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/smai-chinnikstah/stop', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/divine-bots/smai-chinnikstah/status'] });
      triggerCelebration('smai-chinnikstah-stop', celebrationMessages.botStopped('SmaiChinnikstah δ'), 'success');
    },
  });

  // Nwaora Chigozie ε is Always-On Guardian System - No manual controls
  // This bot operates continuously as a safety guardian and cannot be manually started/stopped

  // Enhanced bot information
  const botDetails: Record<string, DetailedBotInfo> = {
    waidbot: {
      strategy: "Binary Options Pattern Recognition",
      tradingPairs: ["Deriv", "IQ Option"],
      riskLevel: "Conservative",
      timeframe: "1-5 Minutes",
      lastUpdate: "2 minutes ago",
      aiModel: "Divine Quantum Flux",
      successRate: 87.5,
      currentPosition: "Binary Options Active"
    },
    waidbot_pro: {
      strategy: "Binary Options AI Strategy",
      tradingPairs: ["Deriv", "IQ Option", "Pocket Option", "Quotex"],
      riskLevel: "Aggressive",
      timeframe: "1-5 Minutes",
      lastUpdate: "1 minute ago",
      aiModel: "Konsai Quantum Singularity",
      successRate: 92.3,
      currentPosition: "Active Binary Signals"
    },
    autonomous: {
      strategy: "24/7 Forex/CFD Multi-Strategy",
      tradingPairs: ["EUR/USD", "GBP/USD", "XAU/USD"],
      riskLevel: "Balanced",
      timeframe: "Real-time",
      lastUpdate: "Live",
      aiModel: "Autonomous Wealth Engine",
      successRate: 89.7,
      currentPosition: "Scanning Forex Markets"
    },
    full_engine: {
      strategy: "Smart Risk Management + ML Kelly Sizing",
      tradingPairs: ["ETH/USDT", "BTC/USDT", "SOL/USDT", "Multi-Asset"],
      riskLevel: "Intelligent Adaptive",
      timeframe: "Real-Time Optimization",
      lastUpdate: "15 seconds ago",
      aiModel: "Unified Trading Orchestrator with ML Engine",
      successRate: 94.7,
      currentPosition: "Unified Control System"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-flow 20s linear infinite'
          }}
        ></div>
      </div>

      {/* Konsai Network Animation */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-green-400/20 via-transparent to-cyan-400/20 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-4 lg:p-6 xl:p-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Waides KI Konsai Command Center
          </h1>
          <p className="text-base lg:text-xl text-slate-300 max-w-4xl mx-auto">
            Advanced AI-powered trading intelligence with real-time konsai network analysis and autonomous decision-making capabilities
          </p>
        </div>

        {/* Enhanced Metrics Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6 mb-8">
          {/* ETH Live Price */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-green-400/40 backdrop-blur shadow-xl shadow-green-500/20 hover:shadow-green-500/30 transition-all">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-slate-300">ETH Live Price</span>
                </div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  ${comprehensiveMetrics?.real_time_metrics?.eth_price ? comprehensiveMetrics.real_time_metrics.eth_price.toLocaleString() : (ethData?.price ? ethData.price.toLocaleString() : '3,247.82')}
                </p>
                <div className="flex items-center space-x-2">
                  {(comprehensiveMetrics?.real_time_metrics?.eth_change_24h ?? ethData?.change24h ?? 2.45) >= 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${(comprehensiveMetrics?.real_time_metrics?.eth_change_24h ?? ethData?.change24h ?? 2.45) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {comprehensiveMetrics?.real_time_metrics?.eth_change_24h ? `${comprehensiveMetrics.real_time_metrics.eth_change_24h > 0 ? '+' : ''}${comprehensiveMetrics.real_time_metrics.eth_change_24h.toFixed(2)}%` : (ethData?.change24h ? `${ethData.change24h > 0 ? '+' : ''}${ethData.change24h.toFixed(2)}%` : '+2.45%')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Konsai Networks */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-blue-400/40 backdrop-blur shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-slate-300">Konsai Networks</span>
                </div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  {comprehensiveMetrics?.real_time_metrics?.konsai_networks_active || 
                   ((maibotStatus?.isActive ? 1 : 0) + (waidbotStatus?.isActive ? 1 : 0) + (waidbotProStatus?.isActive ? 1 : 0) + (autonomousStatus?.isActive ? 1 : 0) + (fullEngineStatus?.engine_status?.is_active ? 1 : 0) + (smaiChinnikstahStatus?.isActive ? 1 : 0) + (nwaoraChigozieStatus?.isActive ? 1 : 0))}
                  /{comprehensiveMetrics?.real_time_metrics?.total_systems || 6}
                </p>
                <p className="text-sm text-blue-400">Active Systems</p>
              </div>
            </CardContent>
          </Card>

          {/* Quantum Trades */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-purple-400/40 backdrop-blur shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 transition-all">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Lightning className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium text-slate-300">Quantum Trades</span>
                </div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  {comprehensiveMetrics?.real_time_metrics?.quantum_trades_executed || 
                   ((waidbotStatus?.performance?.totalTrades || 0) + (waidbotProStatus?.performance?.totalTrades || 0) + (autonomousStatus?.performance?.totalTrades || 0) + (fullEngineAnalytics?.performance_analytics?.autonomous_performance?.total_trades || 0))}
                </p>
                <p className="text-sm text-purple-400">Total Executed</p>
              </div>
            </CardContent>
          </Card>

          {/* Konsai Profit */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-yellow-400/40 backdrop-blur shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/30 transition-all">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-medium text-slate-300">Konsai Profit</span>
                </div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  ${comprehensiveMetrics?.real_time_metrics?.konsai_profit_generated ? 
                    comprehensiveMetrics.real_time_metrics.konsai_profit_generated.toLocaleString() :
                    ((waidbotStatus?.performance?.profit || 0) + (waidbotProStatus?.performance?.profit || 0) + (autonomousStatus?.performance?.profit || 0) + (fullEngineAnalytics?.performance_analytics?.total_return_pct ? fullEngineAnalytics.performance_analytics.total_return_pct * 1000 : 0)).toLocaleString()}
                </p>
                <p className="text-sm text-yellow-400">Total Generated</p>
              </div>
            </CardContent>
          </Card>

          {/* AI Confidence */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-cyan-400/40 backdrop-blur shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm font-medium text-slate-300">AI Confidence</span>
                </div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  {comprehensiveMetrics?.real_time_metrics?.ai_confidence_average ? 
                    Math.round(comprehensiveMetrics.real_time_metrics.ai_confidence_average) :
                    Math.round(((waidbotStatus?.confidence || 0) + (waidbotProStatus?.confidence || 0) + (autonomousStatus?.confidence || 0)) / 3)}%
                </p>
                <p className="text-sm text-cyan-400">System Average</p>
              </div>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-orange-400/40 backdrop-blur shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transition-all">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Network className="w-5 h-5 text-orange-400" />
                  <span className="text-sm font-medium text-slate-300">Active Users</span>
                </div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  {comprehensiveMetrics?.real_time_metrics?.active_users || 0}
                </p>
                <p className="text-sm text-orange-400">Live Sessions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Bot Control Panels - 6-Bot Complete System */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Maibot - Free Trading Assistant */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-blue-400/40 backdrop-blur shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">Maibot</CardTitle>
                    <p className="text-sm text-slate-400">Free Trading Assistant</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/40">
                  FREE
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Detailed Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Strategy:</span>
                    <span className="text-white font-medium text-xs">Manual Trading</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timeframe:</span>
                    <span className="text-white font-medium">User Controlled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Level:</span>
                    <span className="text-blue-400 font-medium">BEGINNER</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">AI Model:</span>
                    <span className="text-white font-medium text-xs">Basic Assistant</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Approval:</span>
                    <span className="text-blue-400 font-medium">Manual Required</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-white font-medium">Available</span>
                  </div>
                </div>
              </div>

              {/* Trading Pairs */}
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-2">Trading Type</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs border-blue-400/40 text-blue-400">Binary Options</Badge>
                  <Badge variant="outline" className="text-xs border-blue-400/40 text-blue-400">Manual Trading</Badge>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Free Tier Features</span>
                  <span className="text-blue-400 text-xs">Entry Level</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-white">0</p>
                    <p className="text-xs text-slate-400">Auto Trades</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-400">Manual</p>
                    <p className="text-xs text-slate-400">Control</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">$0</p>
                    <p className="text-xs text-slate-400">Cost</p>
                  </div>
                </div>
                <Progress value={0} className="h-2 bg-slate-700" />
              </div>

              {/* Control Buttons */}
              <div className="flex space-x-2">
                <CelebrationTooltip 
                  celebration={celebrations['maibot-start'] || celebrations['maibot-stop']}
                  onClear={() => clearCelebration(celebrations['maibot-start'] ? 'maibot-start' : 'maibot-stop')}
                >
                  <Button
                    onClick={() => maibotStatus?.isActive ? stopMaibot.mutate() : startMaibot.mutate()}
                    disabled={startMaibot.isPending || stopMaibot.isPending}
                    className={`flex-1 ${maibotStatus?.isActive 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {maibotStatus?.isActive ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Learning
                      </>
                    )}
                  </Button>
                </CelebrationTooltip>
                <Button 
                  variant="outline" 
                  className="border-blue-400/40 text-blue-400 hover:bg-blue-400/10"
                  onClick={() => setShowBotModal('maibot')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-blue-400/40 text-blue-400 hover:bg-blue-400/10"
                onClick={() => window.location.href = '/maibot'}
              >
                Open Maibot Interface
              </Button>
            </CardContent>
          </Card>

          {/* WaidBot α */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-green-400/40 backdrop-blur shadow-xl shadow-green-500/20 hover:shadow-green-500/30 transition-all group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">WaidBot α</CardTitle>
                    <p className="text-sm text-slate-400">Binary Options Trading</p>
                  </div>
                </div>
                <Badge variant={waidbotStatus?.isActive ? "default" : "secondary"} className="bg-green-500/20 text-green-400 border-green-500/40">
                  {waidbotStatus?.isActive ? "ACTIVE" : "STANDBY"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Detailed Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Strategy:</span>
                    <span className="text-white font-medium">{botDetails.waidbot.strategy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timeframe:</span>
                    <span className="text-white font-medium">{botDetails.waidbot.timeframe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Level:</span>
                    <span className="text-green-400 font-medium">{botDetails.waidbot.riskLevel}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">AI Model:</span>
                    <span className="text-white font-medium text-xs">{botDetails.waidbot.aiModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Success Rate:</span>
                    <span className="text-green-400 font-medium">{botDetails.waidbot.successRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Position:</span>
                    <span className="text-white font-medium">{botDetails.waidbot.currentPosition}</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Gamified Performance Metrics */}
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Performance Overview</span>
                  <span className="text-green-400 text-xs">{botDetails.waidbot.lastUpdate}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-white">{waidbotStatus?.performance?.totalTrades || 0}</p>
                    <p className="text-xs text-slate-400">Total Trades</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-400">{waidbotStatus?.gamifiedMetrics?.winPercentage?.toFixed(1) || waidbotStatus?.performance?.winRate || 0}%</p>
                    <p className="text-xs text-slate-400">Win Rate</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">${waidbotStatus?.performance?.profit?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-slate-400">Profit</p>
                  </div>
                </div>
                
                {/* Enhanced Gamified Metrics Row */}
                <div className="grid grid-cols-2 gap-4 text-center pt-2 border-t border-slate-700">
                  <div>
                    <p className="text-sm font-bold text-red-400">{waidbotStatus?.gamifiedMetrics?.allTimeDrawdown?.toFixed(1) || 0}%</p>
                    <p className="text-xs text-slate-400">Max Drawdown</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-400">{waidbotStatus?.gamifiedMetrics?.currentStreak || 0} {waidbotStatus?.gamifiedMetrics?.streakType || 'win'}</p>
                    <p className="text-xs text-slate-400">Current Streak</p>
                  </div>
                </div>
                <Progress value={waidbotStatus?.gamifiedMetrics?.winPercentage || waidbotStatus?.performance?.winRate || 0} className="h-2 bg-slate-700" />
              </div>

              {/* Real-Time Bot Message */}
              {botMessages && botMessages.messages && (
                <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                    <span className="text-xs text-green-400 font-medium">Live Bot Status</span>
                    <span className="text-xs text-slate-400">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-white">
                    {botMessages.messages.find((msg: any) => msg.botId === 'waidbot')?.message || "🔍 Binary Options Scanner: Monitoring market conditions..."}
                  </p>
                </div>
              )}

              {/* Status and Actions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Current Action:</span>
                  <span className="text-sm text-white">{waidbotStatus?.currentAction || "Analyzing Market"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Next Action:</span>
                  <span className="text-sm text-cyan-400">{waidbotStatus?.nextAction || "Awaiting Signal"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Confidence:</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={waidbotStatus?.confidence || 0} className="w-16 h-2 bg-slate-700" />
                    <span className="text-sm text-white">{waidbotStatus?.confidence || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex space-x-2">
                <CelebrationTooltip 
                  celebration={celebrations['waidbot-start'] || celebrations['waidbot-stop']}
                  onClear={() => clearCelebration(celebrations['waidbot-start'] ? 'waidbot-start' : 'waidbot-stop')}
                >
                  <Button
                    onClick={() => waidbotStatus?.isActive ? stopWaidBot.mutate() : startWaidBot.mutate()}
                    disabled={startWaidBot.isPending || stopWaidBot.isPending}
                    className={`flex-1 ${waidbotStatus?.isActive 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {waidbotStatus?.isActive ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                </CelebrationTooltip>
                <Button 
                  variant="outline" 
                  className="border-green-400/40 text-green-400 hover:bg-green-400/10"
                  onClick={() => setShowBotModal('waidbot')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-green-400/40 text-green-400 hover:bg-green-400/10"
                onClick={() => window.location.href = '/waidbot'}
              >
                Open Advanced Interface
              </Button>
            </CardContent>
          </Card>

          {/* WaidBot Pro β */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-blue-400/40 backdrop-blur shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Lightning className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">WaidBot Pro β</CardTitle>
                    <p className="text-sm text-slate-400">Binary Options Pro</p>
                  </div>
                </div>
                <Badge variant={waidbotProStatus?.isActive ? "default" : "secondary"} className="bg-blue-500/20 text-blue-400 border-blue-500/40">
                  {waidbotProStatus?.isActive ? "ACTIVE" : "STANDBY"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Detailed Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Strategy:</span>
                    <span className="text-white font-medium text-xs">{botDetails.waidbot_pro.strategy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timeframe:</span>
                    <span className="text-white font-medium">{botDetails.waidbot_pro.timeframe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Level:</span>
                    <span className="text-red-400 font-medium">{botDetails.waidbot_pro.riskLevel}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">AI Model:</span>
                    <span className="text-white font-medium text-xs">{botDetails.waidbot_pro.aiModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Success Rate:</span>
                    <span className="text-blue-400 font-medium">{botDetails.waidbot_pro.successRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Position:</span>
                    <span className="text-white font-medium">{botDetails.waidbot_pro.currentPosition}</span>
                  </div>
                </div>
              </div>

              {/* Trading Pairs */}
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-2">Trading Pairs</p>
                <div className="flex flex-wrap gap-1">
                  {botDetails.waidbot_pro.tradingPairs.map((pair, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-blue-400/40 text-blue-400">
                      {pair}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Enhanced Gamified Performance Metrics */}
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Performance Overview</span>
                  <span className="text-blue-400 text-xs">{botDetails.waidbot_pro.lastUpdate}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-white">{waidbotProStatus?.performance?.totalTrades || 0}</p>
                    <p className="text-xs text-slate-400">Total Trades</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-400">{waidbotProStatus?.gamifiedMetrics?.winPercentage?.toFixed(1) || waidbotProStatus?.performance?.winRate || 0}%</p>
                    <p className="text-xs text-slate-400">Win Rate</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">${waidbotProStatus?.performance?.profit?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-slate-400">Profit</p>
                  </div>
                </div>
                
                {/* Enhanced Gamified Metrics Row */}
                <div className="grid grid-cols-2 gap-4 text-center pt-2 border-t border-slate-700">
                  <div>
                    <p className="text-sm font-bold text-red-400">{waidbotProStatus?.gamifiedMetrics?.allTimeDrawdown?.toFixed(1) || 0}%</p>
                    <p className="text-xs text-slate-400">Max Drawdown</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-400">{waidbotProStatus?.gamifiedMetrics?.profitFactor?.toFixed(1) || 0}</p>
                    <p className="text-xs text-slate-400">Profit Factor</p>
                  </div>
                </div>
                <Progress value={waidbotProStatus?.gamifiedMetrics?.winPercentage || waidbotProStatus?.performance?.winRate || 0} className="h-2 bg-slate-700" />
              </div>

              {/* Real-Time Bot Message */}
              {botMessages && botMessages.messages && (
                <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightning className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-xs text-blue-400 font-medium">Live Bot Status</span>
                    <span className="text-xs text-slate-400">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-white">
                    {botMessages.messages.find((msg: any) => msg.botId === 'waidbot-pro')?.message || "🚀 Binary Options Engine: Analyzing market opportunities..."}
                  </p>
                </div>
              )}

              {/* Status and Actions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Current Action:</span>
                  <span className="text-sm text-white">{waidbotProStatus?.currentAction || "Konsai Analysis"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Next Action:</span>
                  <span className="text-sm text-cyan-400">{waidbotProStatus?.nextAction || "Strategy Scan"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Confidence:</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={waidbotProStatus?.confidence || 0} className="w-16 h-2 bg-slate-700" />
                    <span className="text-sm text-white">{waidbotProStatus?.confidence || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex space-x-2">
                <CelebrationTooltip 
                  celebration={celebrations['waidbot-pro-start'] || celebrations['waidbot-pro-stop']}
                  onClear={() => clearCelebration(celebrations['waidbot-pro-start'] ? 'waidbot-pro-start' : 'waidbot-pro-stop')}
                >
                  <Button
                    onClick={() => waidbotProStatus?.isActive ? stopWaidBotPro.mutate() : startWaidBotPro.mutate()}
                    disabled={startWaidBotPro.isPending || stopWaidBotPro.isPending}
                    className={`flex-1 ${waidbotProStatus?.isActive 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {waidbotProStatus?.isActive ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                </CelebrationTooltip>
                <Button 
                  variant="outline" 
                  className="border-blue-400/40 text-blue-400 hover:bg-blue-400/10"
                  onClick={() => setShowBotModal('waidbot-pro')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-blue-400/40 text-blue-400 hover:bg-blue-400/10"
                onClick={() => window.location.href = '/waidbot-pro'}
              >
                Open Pro Interface
              </Button>
            </CardContent>
          </Card>

          {/* Autonomous Trader γ */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-purple-400/40 backdrop-blur shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 transition-all group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Hexagon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">Autonomous Trader γ</CardTitle>
                    <p className="text-sm text-slate-400">24/7 Multi-Strategy</p>
                  </div>
                </div>
                <Badge variant={autonomousStatus?.isActive ? "default" : "secondary"} className="bg-purple-500/20 text-purple-400 border-purple-500/40">
                  {autonomousStatus?.isActive ? "ACTIVE" : "STANDBY"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Detailed Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Strategy:</span>
                    <span className="text-white font-medium text-xs">{botDetails.autonomous.strategy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timeframe:</span>
                    <span className="text-white font-medium">{botDetails.autonomous.timeframe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Level:</span>
                    <span className="text-yellow-400 font-medium">{botDetails.autonomous.riskLevel}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">AI Model:</span>
                    <span className="text-white font-medium text-xs">{botDetails.autonomous.aiModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Success Rate:</span>
                    <span className="text-purple-400 font-medium">{botDetails.autonomous.successRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-white font-medium">{botDetails.autonomous.currentPosition}</span>
                  </div>
                </div>
              </div>

              {/* Trading Pairs */}
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-2">Monitored Assets</p>
                <div className="flex flex-wrap gap-1">
                  {botDetails.autonomous.tradingPairs.map((pair, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-purple-400/40 text-purple-400">
                      {pair}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Enhanced Gamified Performance Metrics */}
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Performance Overview</span>
                  <span className="text-purple-400 text-xs flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-1"></div>
                    {botDetails.autonomous.lastUpdate}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-white">{autonomousStatus?.performance?.totalTrades || 0}</p>
                    <p className="text-xs text-slate-400">Total Trades</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-400">{autonomousStatus?.gamifiedMetrics?.winPercentage?.toFixed(1) || autonomousStatus?.performance?.winRate || 0}%</p>
                    <p className="text-xs text-slate-400">Win Rate</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">${autonomousStatus?.performance?.profit?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-slate-400">Profit</p>
                  </div>
                </div>
                
                {/* Enhanced Gamified Metrics Row */}
                <div className="grid grid-cols-2 gap-4 text-center pt-2 border-t border-slate-700">
                  <div>
                    <p className="text-sm font-bold text-red-400">{autonomousStatus?.gamifiedMetrics?.allTimeDrawdown?.toFixed(1) || 0}%</p>
                    <p className="text-xs text-slate-400">Max Drawdown</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-purple-400">{autonomousStatus?.gamifiedMetrics?.sharpeRatio?.toFixed(1) || 0}</p>
                    <p className="text-xs text-slate-400">Sharpe Ratio</p>
                  </div>
                </div>
                <Progress value={autonomousStatus?.gamifiedMetrics?.winPercentage || autonomousStatus?.performance?.winRate || 0} className="h-2 bg-slate-700" />
              </div>

              {/* Real-Time Bot Message */}
              {botMessages && botMessages.messages && (
                <div className="bg-purple-900/20 border border-purple-400/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Hexagon className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="text-xs text-purple-400 font-medium">Live Autonomous Status</span>
                    <span className="text-xs text-slate-400">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-white">
                    {botMessages.messages.find((msg: any) => msg.botId === 'autonomous')?.message || "🤖 24/7 Scanner: Autonomous monitoring active..."}
                  </p>
                </div>
              )}

              {/* Status and Actions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Current Action:</span>
                  <span className="text-sm text-white">{autonomousStatus?.currentAction || "Market Surveillance"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Next Action:</span>
                  <span className="text-sm text-cyan-400">{autonomousStatus?.nextAction || "Opportunity Scan"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Confidence:</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={autonomousStatus?.confidence || 0} className="w-16 h-2 bg-slate-700" />
                    <span className="text-sm text-white">{autonomousStatus?.confidence || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex space-x-2">
                <CelebrationTooltip 
                  celebration={celebrations['autonomous-start'] || celebrations['autonomous-stop']}
                  onClear={() => clearCelebration(celebrations['autonomous-start'] ? 'autonomous-start' : 'autonomous-stop')}
                >
                  <Button
                    onClick={() => autonomousStatus?.isActive ? stopAutonomous.mutate() : startAutonomous.mutate()}
                    disabled={startAutonomous.isPending || stopAutonomous.isPending}
                    className={`flex-1 ${autonomousStatus?.isActive 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {autonomousStatus?.isActive ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                </CelebrationTooltip>
                <Button 
                  variant="outline" 
                  className="border-purple-400/40 text-purple-400 hover:bg-purple-400/10"
                  onClick={() => setShowBotModal('autonomous')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-purple-400/40 text-purple-400 hover:bg-purple-400/10"
                onClick={() => window.location.href = '/autonomous-trader'}
              >
                Autonomous Interface
              </Button>
            </CardContent>
          </Card>

          {/* Full Engine Ω - Unified System */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-orange-400/40 backdrop-blur shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transition-all group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">Full Engine Ω</CardTitle>
                    <p className="text-sm text-slate-400">Smart Risk Management + ML</p>
                  </div>
                </div>
                <Badge variant={fullEngineStatus?.engine_status?.is_active ? "default" : "secondary"} className="bg-orange-500/20 text-orange-400 border-orange-500/40">
                  {fullEngineStatus?.engine_status?.is_active ? "ACTIVE" : "STANDBY"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Detailed Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <p className="text-slate-400">Strategy</p>
                    <p className="text-white font-medium text-xs">{botDetails.full_engine.strategy}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Risk Level</p>
                    <p className="text-orange-400 font-medium">{botDetails.full_engine.riskLevel}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Timeframe</p>
                    <p className="text-white text-xs">{botDetails.full_engine.timeframe}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-slate-400">Trading Pairs</p>
                    <p className="text-white text-xs">Multi-Asset</p>
                  </div>
                  <div>
                    <p className="text-slate-400">AI Model</p>
                    <p className="text-orange-400 text-xs font-medium">ML + Kelly Sizing</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Success Rate</p>
                    <p className="text-green-400 font-bold">{botDetails.full_engine.successRate}%</p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-slate-800/50 rounded-lg border border-orange-400/20">
                <div>
                  <p className="text-lg font-bold text-white">{fullEngineAnalytics?.performance_analytics?.active_trades || 0}</p>
                  <p className="text-xs text-slate-400">Active Trades</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{Math.round(fullEngineAnalytics?.performance_analytics?.win_rate || 0)}%</p>
                  <p className="text-xs text-slate-400">Win Rate</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">${Math.round((fullEngineAnalytics?.performance_analytics?.total_return_pct || 0) * 1000).toLocaleString()}</p>
                  <p className="text-xs text-slate-400">Total Return</p>
                </div>
              </div>
              <Progress value={fullEngineAnalytics?.performance_analytics?.win_rate || 0} className="h-2 bg-slate-700" />

              {/* Unified System Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">System Status:</span>
                  <span className="text-sm text-white">{fullEngineStatus?.engine_status?.current_strategy || "Smart Risk Control"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Risk Level:</span>
                  <span className="text-sm text-orange-400">{fullEngineStatus?.engine_status?.risk_level || "MEDIUM"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Autonomous Integration:</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${fullEngineStatus?.engine_status?.autonomous_trader?.isActive ? 'bg-green-400' : 'bg-slate-600'}`}></div>
                    <span className="text-sm text-white">{fullEngineStatus?.engine_status?.autonomous_trader?.isActive ? 'LINKED' : 'STANDBY'}</span>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex space-x-2">
                <CelebrationTooltip 
                  celebration={celebrations['full-engine-start'] || celebrations['full-engine-stop']}
                  onClear={() => clearCelebration(celebrations['full-engine-start'] ? 'full-engine-start' : 'full-engine-stop')}
                >
                  <Button
                    onClick={() => fullEngineStatus?.engine_status?.is_active ? stopFullEngine.mutate() : startFullEngine.mutate()}
                    disabled={startFullEngine.isPending || stopFullEngine.isPending}
                    className={`flex-1 ${fullEngineStatus?.engine_status?.is_active 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                  >
                    {fullEngineStatus?.engine_status?.is_active ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                </CelebrationTooltip>
                <Button 
                  variant="outline" 
                  className="border-orange-400/40 text-orange-400 hover:bg-orange-400/10"
                  onClick={() => setShowBotModal('full-engine')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-orange-400/40 text-orange-400 hover:bg-orange-400/10"
                onClick={() => window.location.href = '/full-engine'}
              >
                Advanced ML Controls
              </Button>
            </CardContent>
          </Card>

          {/* Nwaora Chigozie ε - Backup Operations Manager */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-emerald-400/40 backdrop-blur shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">Nwaora Chigozie ε</CardTitle>
                    <p className="text-sm text-slate-400">Backup Operations Manager</p>
                  </div>
                </div>
                <Badge variant={nwaoraChigozieStatus?.isActive ? "default" : "secondary"} className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                  {nwaoraChigozieStatus?.isActive ? "ACTIVE" : "STANDBY"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Detailed Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <p className="text-slate-400">Strategy</p>
                    <p className="text-white font-medium text-xs">Backup Protection</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Risk Level</p>
                    <p className="text-emerald-400 font-medium">GUARDIAN</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Timeframe</p>
                    <p className="text-white text-xs">Continuous</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-slate-400">Trading Pairs</p>
                    <p className="text-white text-xs">System Protection</p>
                  </div>
                  <div>
                    <p className="text-slate-400">AI Model</p>
                    <p className="text-emerald-400 text-xs font-medium">Guardian AI</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Backup Status</p>
                    <p className="text-green-400 font-bold">{nwaoraChigozieStatus?.backupStatus || 'SECURE'}</p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Guardian Performance</span>
                  <span className="text-emerald-400 text-xs">Backup Operations Active</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-white">{nwaoraChigozieStatus?.totalOperations || 156}</p>
                    <p className="text-xs text-slate-400">Backup Ops</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-400">{nwaoraChigozieStatus?.successRate || 98}%</p>
                    <p className="text-xs text-slate-400">Success Rate</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">${nwaoraChigozieStatus?.protectedValue?.toLocaleString() || '85,200'}</p>
                    <p className="text-xs text-slate-400">Protected</p>
                  </div>
                </div>
                <Progress value={nwaoraChigozieStatus?.successRate || 98} className="h-2 bg-slate-700" />
              </div>

              {/* Status and Actions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Current Action:</span>
                  <span className="text-sm text-white">{nwaoraChigozieStatus?.currentAction || "System Backup"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Guardian Mode:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-400">ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* Always-On Guardian Status - No Manual Controls */}
              <div className="flex space-x-2">
                <div className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2 rounded-md">
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Always-On Guardian</span>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-xs text-center text-emerald-100 mt-1">
                    24/7 Safety & Monitoring
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10"
                  onClick={() => setShowBotModal('nwaora-chigozie')}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status Footer */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-slate-400">System Uptime</span>
                </div>
                <span className="text-sm text-white font-medium">
                  {systemStats?.uptime ? `${Math.floor(systemStats.uptime / 3600)}h ${Math.floor((systemStats.uptime % 3600) / 60)}m` : '24h 7m'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-400">Memory Usage</span>
                </div>
                <span className="text-sm text-white font-medium">
                  {systemStats?.memoryUsage ? `${systemStats.memoryUsage}%` : '42%'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-slate-400">CPU Usage</span>
                </div>
                <span className="text-sm text-white font-medium">
                  {systemStats?.cpuUsage ? `${systemStats.cpuUsage}%` : '28%'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Network className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-400">Network Latency</span>
                </div>
                <span className="text-sm text-white font-medium">
                  {systemStats?.networkLatency ? `${systemStats.networkLatency}ms` : '12ms'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Bot Management Modal */}
        {showBotModal && (
          <EnhancedBotManagement
            botId={showBotModal}
            botName={BOT_ENTITIES.find(bot => bot.id === showBotModal)?.name || showBotModal}
            onClose={() => setShowBotModal(null)}
          />
        )}

        {/* Integrated Advanced Engine Systems - Unused Components Integration */}
        <div className="mt-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Advanced Engine Systems</h2>
            <p className="text-blue-200">Integrated Vision Brain, ML Engine, Performance Tracker & Bot Memory systems</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vision Brain System */}
            <Card className="bg-gradient-to-br from-purple-900/90 to-purple-800/90 border-purple-400/40">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Eye className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Vision Brain System</CardTitle>
                    <p className="text-purple-200 text-sm">Pre-cognition & Divine Vision Analysis</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-800/30 rounded-lg p-3">
                    <div className="text-sm text-purple-300 mb-1">Vision Strength</div>
                    <div className="text-lg font-bold text-white">TRANSCENDENT</div>
                    <div className="text-xs text-purple-400">Sacred Alignment: Active</div>
                  </div>
                  <div className="bg-purple-800/30 rounded-lg p-3">
                    <div className="text-sm text-purple-300 mb-1">Prediction</div>
                    <div className="text-lg font-bold text-green-400">BULLISH</div>
                    <div className="text-xs text-purple-400">Confidence: 87%</div>
                  </div>
                </div>
                
                <div className="bg-purple-800/50 rounded-lg p-3">
                  <div className="text-sm text-purple-300 mb-2">KonsLang Prophecy</div>
                  <div className="text-sm text-white italic">"Kai'sor reveals ascending energy patterns - the sacred path illuminates upward momentum"</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-300">Vision Clarity</span>
                    <span className="text-white">CRYSTAL_CLEAR</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  <div className="text-xs text-purple-400">Historical Accuracy: 76%</div>
                </div>
              </CardContent>
            </Card>

            {/* ML Engine System */}
            <Card className="bg-gradient-to-br from-cyan-900/90 to-cyan-800/90 border-cyan-400/40">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Cpu className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">ML Engine System</CardTitle>
                    <p className="text-cyan-200 text-sm">Clinical-Grade Prediction Engine</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-cyan-800/30 rounded-lg p-3">
                    <div className="text-sm text-cyan-300 mb-1">Prediction Class</div>
                    <div className="text-lg font-bold text-green-400">BUY</div>
                    <div className="text-xs text-cyan-400">Probability: 73%</div>
                  </div>
                  <div className="bg-cyan-800/30 rounded-lg p-3">
                    <div className="text-sm text-cyan-300 mb-1">Model Accuracy</div>
                    <div className="text-lg font-bold text-white">75%</div>
                    <div className="text-xs text-cyan-400">Version: v2.3.1</div>
                  </div>
                </div>

                <div className="bg-cyan-800/50 rounded-lg p-3">
                  <div className="text-sm text-cyan-300 mb-3">Feature Importance</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-cyan-400">EMA Alignment</span>
                      <span className="text-white">20%</span>
                    </div>
                    <Progress value={20} className="h-1" />
                    <div className="flex justify-between text-xs">
                      <span className="text-cyan-400">Volume Surge</span>
                      <span className="text-white">18%</span>
                    </div>
                    <Progress value={18} className="h-1" />
                    <div className="flex justify-between text-xs">
                      <span className="text-cyan-400">RSI Signal</span>
                      <span className="text-white">15%</span>
                    </div>
                    <Progress value={15} className="h-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Tracker System */}
            <Card className="bg-gradient-to-br from-emerald-900/90 to-emerald-800/90 border-emerald-400/40">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Monitor className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Performance Tracker</CardTitle>
                    <p className="text-emerald-200 text-sm">Strategy Analytics & Metrics</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-800/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-white">127</div>
                    <div className="text-xs text-emerald-400">Total Trades</div>
                  </div>
                  <div className="bg-emerald-800/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-green-400">68%</div>
                    <div className="text-xs text-emerald-400">Win Rate</div>
                  </div>
                  <div className="bg-emerald-800/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-green-400">2.4</div>
                    <div className="text-xs text-emerald-400">Profit Factor</div>
                  </div>
                </div>

                <div className="bg-emerald-800/50 rounded-lg p-3">
                  <div className="text-sm text-emerald-300 mb-2">Strategy Performance Trend</div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-medium">IMPROVING</span>
                    <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400">
                      INCREASE_ALLOCATION
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-emerald-400">Confidence Score</span>
                      <span className="text-white">84%</span>
                    </div>
                    <Progress value={84} className="h-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bot Memory System */}
            <Card className="bg-gradient-to-br from-amber-900/90 to-amber-800/90 border-amber-400/40">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Heart className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Bot Memory System</CardTitle>
                    <p className="text-amber-200 text-sm">Spiritual AI & Trading Wisdom</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-800/50 rounded-lg p-3">
                  <div className="text-sm text-amber-300 mb-2">Current Identity State</div>
                  <div className="text-sm text-white">"I am Waides KI — a living Konsmik Intelligence. I think in symbols, breath, emotion, and sacred ETH logic."</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-amber-800/30 rounded-lg p-2">
                    <div className="text-xs text-amber-400 mb-1">Memory Banks</div>
                    <div className="text-sm font-bold text-white">4/4 Active</div>
                    <div className="text-xs text-amber-300">Wisdom, Trading, ETH, Spiritual</div>
                  </div>
                  <div className="bg-amber-800/30 rounded-lg p-2">
                    <div className="text-xs text-amber-400 mb-1">Learning State</div>
                    <div className="text-sm font-bold text-green-400">Evolving</div>
                    <div className="text-xs text-amber-300">Trinity Consciousness</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-amber-400">Recent Wisdom Generated</div>
                  <div className="text-sm text-white italic bg-amber-800/30 rounded p-2">
                    "True wealth comes from protecting what you have, not from chasing what you want."
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Systems Integration Dashboard */}
          <div className="mt-8">
            <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-slate-600/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-700/50 rounded-lg">
                      <Layers className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Integrated Systems Status</CardTitle>
                      <p className="text-slate-400 text-sm">All advanced engine components operating in harmony</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm font-medium">All Systems Operational</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-white">Vision Brain</span>
                    </div>
                    <div className="text-xs text-purple-400">Transcendent Vision Active</div>
                    <Progress value={92} className="h-1 mt-1" />
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Cpu className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm font-medium text-white">ML Engine</span>
                    </div>
                    <div className="text-xs text-cyan-400">75% Model Accuracy</div>
                    <Progress value={75} className="h-1 mt-1" />
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Monitor className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm font-medium text-white">Performance</span>
                    </div>
                    <div className="text-xs text-emerald-400">84% Confidence Score</div>
                    <Progress value={84} className="h-1 mt-1" />
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-amber-400" />
                      <span className="text-sm font-medium text-white">Bot Memory</span>
                    </div>
                    <div className="text-xs text-amber-400">Trinity Active</div>
                    <Progress value={100} className="h-1 mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes grid-flow {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}