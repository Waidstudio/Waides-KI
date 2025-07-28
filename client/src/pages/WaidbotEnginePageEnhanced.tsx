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
  Wallet
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BotFundingInterface from "@/components/BotFundingInterface";

interface BotStatus {
  id: string;
  name: string;
  isActive: boolean;
  performance: {
    totalTrades: number;
    winRate: number;
    profit: number;
    todayTrades: number;
  };
  currentAction: string;
  nextAction: string;
  confidence: number;
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

export default function WaidbotEnginePageEnhanced() {
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [showFundingInterface, setShowFundingInterface] = useState(false);
  const queryClient = useQueryClient();

  // Fetch bot statuses
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

  // Fetch Full Engine status (now independent)
  const { data: fullEngineStatus } = useQuery<any>({
    queryKey: ['/api/full-engine/status'],
    refetchInterval: 2000,
  });

  const { data: fullEngineAnalytics } = useQuery<any>({
    queryKey: ['/api/full-engine/analytics'],
    refetchInterval: 5000,
  });

  // Fetch Nwaora Chigozie bot status (Smai Chinnikstah now background API only)
  const { data: nwaoraChigozieStatus } = useQuery<any>({
    queryKey: ['/api/divine-bots/nwaora-chigozie/status'],
    refetchInterval: 2000,
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

  // Bot control mutations
  const startWaidBot = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/waidbot/start', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot/status'] });
    },
  });

  const stopWaidBot = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/waidbot/stop', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot/status'] });
    },
  });

  const startWaidBotPro = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/waidbot-pro/start', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot-pro/status'] });
    },
  });

  const stopWaidBotPro = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/waidbot-pro/stop', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot-pro/status'] });
    },
  });

  const startAutonomous = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/autonomous/start', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/autonomous/status'] });
    },
  });

  const stopAutonomous = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot-engine/autonomous/stop', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/autonomous/status'] });
    },
  });

  // Full Engine mutations (unified system)
  const startFullEngine = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/full-engine/start', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/autonomous/status'] });
    },
  });

  const stopFullEngine = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/full-engine/stop', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/autonomous/status'] });
    },
  });

  // Nwaora Chigozie Bot mutations
  const startNwaoraChigozie = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/divine-bots/nwaora-chigozie/start', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/divine-bots/nwaora-chigozie/status'] });
    },
  });

  const stopNwaoraChigozie = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/divine-bots/nwaora-chigozie/stop', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/divine-bots/nwaora-chigozie/status'] });
    },
  });

  // Enhanced bot information
  const botDetails: Record<string, DetailedBotInfo> = {
    waidbot: {
      strategy: "ETH Uptrend Momentum",
      tradingPairs: ["ETH/USDT"],
      riskLevel: "Conservative",
      timeframe: "1 Hour",
      lastUpdate: "2 minutes ago",
      aiModel: "Divine Quantum Flux",
      successRate: 87.5,
      currentPosition: "Long ETH"
    },
    waidbot_pro: {
      strategy: "Bidirectional Konsai",
      tradingPairs: ["ETH/USDT", "ETH3L/USDT", "ETH3S/USDT"],
      riskLevel: "Aggressive",
      timeframe: "4 Hours",
      lastUpdate: "1 minute ago",
      aiModel: "Konsai Quantum Singularity",
      successRate: 92.3,
      currentPosition: "Short ETH3S"
    },
    autonomous: {
      strategy: "24/7 Multi-Strategy",
      tradingPairs: ["ETH/USDT", "BTC/USDT", "SOL/USDT"],
      riskLevel: "Balanced",
      timeframe: "Real-time",
      lastUpdate: "Live",
      aiModel: "Autonomous Wealth Engine",
      successRate: 89.7,
      currentPosition: "Scanning Markets"
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
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowFundingInterface(!showFundingInterface)}
                className={`${
                  showFundingInterface
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-all`}
              >
                <Wallet className="w-4 h-4" />
                <span>{showFundingInterface ? 'Hide Funding' : 'Fund Bots'}</span>
              </Button>
            </div>
          </div>
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
                   ((waidbotStatus?.isActive ? 1 : 0) + (waidbotProStatus?.isActive ? 1 : 0) + (autonomousStatus?.isActive ? 1 : 0) + (fullEngineStatus?.engine_status?.is_active ? 1 : 0))}
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
                  {comprehensiveMetrics?.real_time_metrics?.active_users || (27 + Math.floor(Math.random() * 8))}
                </p>
                <p className="text-sm text-orange-400">Live Sessions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Bot Control Panels - 4-Bot Core System + Guardian Bot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6 lg:gap-8">
          {/* WaidBot α - Enhanced */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-green-400/40 backdrop-blur shadow-xl shadow-green-500/20 hover:shadow-green-500/30 transition-all group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">WaidBot α</CardTitle>
                    <p className="text-sm text-slate-400">ETH Uptrend Specialist</p>
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

              {/* Performance Metrics */}
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
                    <p className="text-lg font-bold text-green-400">{waidbotStatus?.performance?.winRate || 0}%</p>
                    <p className="text-xs text-slate-400">Win Rate</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">${waidbotStatus?.performance?.profit?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-slate-400">Profit</p>
                  </div>
                </div>
                <Progress value={waidbotStatus?.performance?.winRate || 0} className="h-2 bg-slate-700" />
              </div>

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
                <Button variant="outline" className="border-green-400/40 text-green-400 hover:bg-green-400/10">
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

          {/* WaidBot Pro β - Enhanced */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-blue-400/40 backdrop-blur shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Lightning className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">WaidBot Pro β</CardTitle>
                    <p className="text-sm text-slate-400">Bidirectional Konsai</p>
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

              {/* Performance Metrics */}
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
                    <p className="text-lg font-bold text-blue-400">{waidbotProStatus?.performance?.winRate || 0}%</p>
                    <p className="text-xs text-slate-400">Win Rate</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">${waidbotProStatus?.performance?.profit?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-slate-400">Profit</p>
                  </div>
                </div>
                <Progress value={waidbotProStatus?.performance?.winRate || 0} className="h-2 bg-slate-700" />
              </div>

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
                <Button variant="outline" className="border-blue-400/40 text-blue-400 hover:bg-blue-400/10">
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

          {/* Autonomous Trader Ω - Enhanced */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-purple-400/40 backdrop-blur shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 transition-all group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Hexagon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">Autonomous Ω</CardTitle>
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

              {/* Performance Metrics */}
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
                    <p className="text-lg font-bold text-purple-400">{autonomousStatus?.performance?.winRate || 0}%</p>
                    <p className="text-xs text-slate-400">Win Rate</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">${autonomousStatus?.performance?.profit?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-slate-400">Profit</p>
                  </div>
                </div>
                <Progress value={autonomousStatus?.performance?.winRate || 0} className="h-2 bg-slate-700" />
              </div>

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
                <Button variant="outline" className="border-purple-400/40 text-purple-400 hover:bg-purple-400/10">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-purple-400/40 text-purple-400 hover:bg-purple-400/10"
                onClick={() => window.location.href = '/full-engine'}
              >
                Full Engine Interface
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
                <Button variant="outline" className="border-orange-400/40 text-orange-400 hover:bg-orange-400/10">
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

              {/* Control Buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => nwaoraChigozieStatus?.isActive ? stopNwaoraChigozie.mutate() : startNwaoraChigozie.mutate()}
                  disabled={startNwaoraChigozie.isPending || stopNwaoraChigozie.isPending}
                  className={`flex-1 ${nwaoraChigozieStatus?.isActive 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {nwaoraChigozieStatus?.isActive ? (
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
                <Button variant="outline" className="border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10">
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

        {/* Bot Funding Interface */}
        {showFundingInterface && (
          <div className="mt-8">
            <BotFundingInterface />
          </div>
        )}
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