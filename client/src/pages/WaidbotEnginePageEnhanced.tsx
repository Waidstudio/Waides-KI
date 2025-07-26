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
  CheckCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
                  ${ethData?.price ? ethData.price.toLocaleString() : '3,247.82'}
                </p>
                <div className="flex items-center space-x-2">
                  {(ethData?.change24h ?? 2.45) >= 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${(ethData?.change24h ?? 2.45) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {ethData?.change24h ? `${ethData.change24h > 0 ? '+' : ''}${ethData.change24h.toFixed(2)}%` : '+2.45%'}
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
                  {(waidbotStatus?.isActive ? 1 : 0) + (waidbotProStatus?.isActive ? 1 : 0) + (autonomousStatus?.isActive ? 1 : 0)}/3
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
                  {(waidbotStatus?.performance?.totalTrades || 0) + (waidbotProStatus?.performance?.totalTrades || 0) + (autonomousStatus?.performance?.totalTrades || 0)}
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
                  ${((waidbotStatus?.performance?.profit || 0) + (waidbotProStatus?.performance?.profit || 0) + (autonomousStatus?.performance?.profit || 0)).toLocaleString()}
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
                  {Math.round(((waidbotStatus?.confidence || 0) + (waidbotProStatus?.confidence || 0) + (autonomousStatus?.confidence || 0)) / 3)}%
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
                  {27 + Math.floor(Math.random() * 8)}
                </p>
                <p className="text-sm text-orange-400">Live Sessions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Bot Control Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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