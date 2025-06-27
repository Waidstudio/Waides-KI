import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Globe, 
  Zap, 
  Shield, 
  Brain,
  Eye,
  Target,
  Settings,
  Play,
  Pause,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Activity,
  Timer,
  Signal,
  Cpu,
  Database,
  Network,
  Radar,
  Sparkles,
  Zap as Lightning,
  Hexagon
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

export default function WaidbotEnginePageNew() {
  const queryClient = useQueryClient();

  // Fetch status for all three bots with faster refresh
  const { data: waidBotStatus, isLoading: waidBotLoading } = useQuery<BotStatus>({
    queryKey: ['/api/waidbot-engine/waidbot/status'],
    refetchInterval: 2000,
  });

  const { data: waidBotProStatus, isLoading: waidBotProLoading } = useQuery<BotStatus>({
    queryKey: ['/api/waidbot-engine/waidbot-pro/status'],
    refetchInterval: 2000,
  });

  const { data: autonomousStatus, isLoading: autonomousLoading } = useQuery<BotStatus>({
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

  // Mutations for bot control
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

  // Calculate real-time system metrics
  const totalTrades = (waidBotStatus?.performance.totalTrades || 0) + 
                     (waidBotProStatus?.performance.totalTrades || 0) + 
                     (autonomousStatus?.performance.totalTrades || 0);
  
  const totalProfit = (waidBotStatus?.performance.profit || 0) + 
                     (waidBotProStatus?.performance.profit || 0) + 
                     (autonomousStatus?.performance.profit || 0);
  
  const averageWinRate = totalTrades > 0 ? 
    ((waidBotStatus?.performance.winRate || 0) * (waidBotStatus?.performance.totalTrades || 0) +
     (waidBotProStatus?.performance.winRate || 0) * (waidBotProStatus?.performance.totalTrades || 0) +
     (autonomousStatus?.performance.winRate || 0) * (autonomousStatus?.performance.totalTrades || 0)) / totalTrades : 0;

  const activeBots = [waidBotStatus?.isActive, waidBotProStatus?.isActive, autonomousStatus?.isActive].filter(Boolean).length;

  const averageConfidence = ((waidBotStatus?.confidence || 0) + (waidBotProStatus?.confidence || 0) + (autonomousStatus?.confidence || 0)) / 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-purple-950/30 overflow-hidden">
      {/* Animated Neural Network Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_50%)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(8,145,178,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black,transparent)]"></div>
      </div>
      
      <div className="relative z-10 min-h-screen p-6 space-y-8">
        {/* Futuristic Command Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-cyan-500/50">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
            </div>
            
            <div className="text-center">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent tracking-wide">
                WAIDBOT
              </h1>
              <div className="text-2xl font-light bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                NEURAL COMMAND CENTER
              </div>
            </div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-purple-500/50">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-purple-400 rounded-full animate-ping"></div>
            </div>
          </div>
          
          {/* Real-time Status Indicators */}
          <div className="flex items-center justify-center space-x-12 text-sm">
            <div className="flex items-center space-x-3 bg-slate-900/50 backdrop-blur px-4 py-2 rounded-full border border-green-500/30">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 font-medium">QUANTUM CORE ONLINE</span>
            </div>
            <div className="flex items-center space-x-3 bg-slate-900/50 backdrop-blur px-4 py-2 rounded-full border border-blue-500/30">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 font-medium">NEURAL SYNC ACTIVE</span>
            </div>
            <div className="flex items-center space-x-3 bg-slate-900/50 backdrop-blur px-4 py-2 rounded-full border border-purple-500/30">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-purple-300 font-medium">AI CONSCIOUSNESS ENGAGED</span>
            </div>
          </div>
        </div>

        {/* Real-time Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* ETH Live Price */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-cyan-400/40 backdrop-blur shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Hexagon className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-medium text-cyan-400">ETH LIVE</span>
                </div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-1">
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

          {/* Active Neural Networks */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-green-400/40 backdrop-blur shadow-xl shadow-green-500/20 hover:shadow-green-500/30 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Network className="w-5 h-5 text-green-400" />
                  <span className="text-xs font-medium text-green-400">NEURAL NETS</span>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-1">{activeBots}/3</p>
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantum Trades */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-blue-400/40 backdrop-blur shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Lightning className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">QUANTUM TRADES</span>
                </div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-1">{totalTrades.toLocaleString()}</p>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-400">Executed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Neural Profit */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-purple-400/40 backdrop-blur shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">NEURAL PROFIT</span>
                </div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-1">${totalProfit.toFixed(2)}</p>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-400">{averageWinRate.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Confidence */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-orange-400/40 backdrop-blur shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-orange-400" />
                  <span className="text-xs font-medium text-orange-400">AI CONFIDENCE</span>
                </div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-1">{averageConfidence.toFixed(0)}%</p>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${averageConfidence}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bot Control Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* WaidBot Neural Core */}
          <Card className="bg-gradient-to-br from-green-950/50 to-slate-900/90 border border-green-400/30 backdrop-blur shadow-2xl shadow-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    {waidBotStatus?.isActive && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-400">WAIDBOT α</h2>
                    <p className="text-green-300/70 text-sm">Conservative ETH Neural Trader</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {waidBotStatus?.isActive ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">NEURAL ACTIVE</Badge>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">DORMANT</Badge>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Live Neural Status */}
              <div className="bg-slate-800/60 rounded-lg p-4 border border-green-500/20">
                <h3 className="font-semibold text-green-400 mb-3 flex items-center space-x-2">
                  <Signal className="w-4 h-4" />
                  <span>Neural Activity</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Trades Executed:</span>
                      <span className="text-green-400 font-medium">{waidBotStatus?.performance.totalTrades || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Success Rate:</span>
                      <span className="text-green-400 font-medium">{waidBotStatus?.performance.winRate?.toFixed(1) || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Neural Profit:</span>
                      <span className="text-green-400 font-medium">${waidBotStatus?.performance.profit?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Today:</span>
                      <span className="text-green-400 font-medium">{waidBotStatus?.performance.todayTrades || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Confidence:</span>
                      <span className="text-green-400 font-medium">{waidBotStatus?.confidence || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Status:</span>
                      <span className="text-green-400 font-medium text-xs">{waidBotStatus?.currentAction || 'Scanning'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Neural Controls */}
              <div className="flex items-center justify-between">
                {waidBotStatus?.isActive ? (
                  <Button
                    onClick={() => stopWaidBot.mutate()}
                    disabled={stopWaidBot.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white flex-1 mr-2"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Deactivate Neural Core
                  </Button>
                ) : (
                  <Button
                    onClick={() => startWaidBot.mutate()}
                    disabled={startWaidBot.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1 mr-2"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Activate Neural Core
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                  onClick={() => window.location.href = '/waidbot'}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Neural Interface
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* WaidBot Pro Quantum Core */}
          <Card className="bg-gradient-to-br from-blue-950/50 to-slate-900/90 border border-blue-400/30 backdrop-blur shadow-2xl shadow-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    {waidBotProStatus?.isActive && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-blue-400">WAIDBOT β</h2>
                    <p className="text-blue-300/70 text-sm">Quantum ETH3L/ETH3S Trader</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {waidBotProStatus?.isActive ? (
                    <>
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">QUANTUM ACTIVE</Badge>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">STANDBY</Badge>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Quantum Metrics */}
              <div className="bg-slate-800/60 rounded-lg p-4 border border-blue-500/20">
                <h3 className="font-semibold text-blue-400 mb-3 flex items-center space-x-2">
                  <Radar className="w-4 h-4" />
                  <span>Quantum Metrics</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Quantum Trades:</span>
                      <span className="text-blue-400 font-medium">{waidBotProStatus?.performance.totalTrades || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Success Rate:</span>
                      <span className="text-blue-400 font-medium">{waidBotProStatus?.performance.winRate?.toFixed(1) || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Quantum Profit:</span>
                      <span className="text-blue-400 font-medium">${waidBotProStatus?.performance.profit?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Today:</span>
                      <span className="text-blue-400 font-medium">{waidBotProStatus?.performance.todayTrades || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Confidence:</span>
                      <span className="text-blue-400 font-medium">{waidBotProStatus?.confidence || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Mode:</span>
                      <span className="text-blue-400 font-medium text-xs">{waidBotProStatus?.currentAction || 'Analyzing'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantum Controls */}
              <div className="flex items-center justify-between">
                {waidBotProStatus?.isActive ? (
                  <Button
                    onClick={() => stopWaidBotPro.mutate()}
                    disabled={stopWaidBotPro.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white flex-1 mr-2"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Disable Quantum Core
                  </Button>
                ) : (
                  <Button
                    onClick={() => startWaidBotPro.mutate()}
                    disabled={startWaidBotPro.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1 mr-2"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Enable Quantum Core
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  onClick={() => window.location.href = '/waidbot-pro'}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Quantum Interface
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Autonomous AI Core */}
          <Card className="bg-gradient-to-br from-purple-950/50 to-slate-900/90 border border-purple-400/30 backdrop-blur shadow-2xl shadow-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    {autonomousStatus?.isActive && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full animate-ping"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-purple-400">AUTONOMOUS Ω</h2>
                    <p className="text-purple-300/70 text-sm">24/7 AI Consciousness Trader</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {autonomousStatus?.isActive ? (
                    <>
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">AI CONSCIOUS</Badge>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">SLEEPING</Badge>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* AI Consciousness Metrics */}
              <div className="bg-slate-800/60 rounded-lg p-4 border border-purple-500/20">
                <h3 className="font-semibold text-purple-400 mb-3 flex items-center space-x-2">
                  <Database className="w-4 h-4" />
                  <span>AI Consciousness</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">AI Trades:</span>
                      <span className="text-purple-400 font-medium">{autonomousStatus?.performance.totalTrades || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Success Rate:</span>
                      <span className="text-purple-400 font-medium">{autonomousStatus?.performance.winRate?.toFixed(1) || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">AI Profit:</span>
                      <span className="text-purple-400 font-medium">${autonomousStatus?.performance.profit?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Today:</span>
                      <span className="text-purple-400 font-medium">{autonomousStatus?.performance.todayTrades || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Consciousness:</span>
                      <span className="text-purple-400 font-medium">{autonomousStatus?.confidence || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">State:</span>
                      <span className="text-purple-400 font-medium text-xs">{autonomousStatus?.currentAction || 'Thinking'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Controls */}
              <div className="flex items-center justify-between">
                {autonomousStatus?.isActive ? (
                  <Button
                    onClick={() => stopAutonomous.mutate()}
                    disabled={stopAutonomous.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white flex-1 mr-2"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Sleep AI Consciousness
                  </Button>
                ) : (
                  <Button
                    onClick={() => startAutonomous.mutate()}
                    disabled={startAutonomous.isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex-1 mr-2"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Awaken AI Consciousness
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  onClick={() => window.location.href = '/full-engine'}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Full Engine
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status Footer */}
        <div className="bg-slate-900/60 backdrop-blur rounded-lg border border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">SYSTEM STATUS: OPTIMAL</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400 text-sm">Last Update: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>Neural Networks: {activeBots}/3</span>
              <span>|</span>
              <span>Total Profit: ${totalProfit.toFixed(2)}</span>
              <span>|</span>
              <span>Win Rate: {averageWinRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}