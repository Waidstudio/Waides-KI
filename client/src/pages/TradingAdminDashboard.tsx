import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  TrendingUp, 
  TrendingDown,
  Bot, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Play,
  Pause,
  Settings,
  DollarSign,
  BarChart3,
  Globe,
  Shield,
  Clock,
  Users,
  Zap,
  Target,
  LineChart
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TradingBot {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'error';
  profit24h: number;
  trades24h: number;
  winRate: number;
  lastAction: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface TradingMetrics {
  totalProfit: number;
  totalTrades: number;
  winRate: number;
  activeBots: number;
  pausedBots: number;
  errorBots: number;
  totalVolume: number;
  marketHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

interface ExchangeStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  latency: number;
  apiCalls: number;
  lastUpdate: string;
}

interface RiskMetrics {
  portfolioExposure: number;
  maxDrawdown: number;
  sharpeRatio: number;
  riskScore: number;
  leverageUsed: number;
}

export default function TradingAdminDashboard() {
  const { toast } = useToast();
  const [selectedBot, setSelectedBot] = useState<string | null>(null);

  // Mock data for trading dashboard
  const mockTradingMetrics: TradingMetrics = {
    totalProfit: 15647.32,
    totalTrades: 1247,
    winRate: 68.4,
    activeBots: 4,
    pausedBots: 2,
    errorBots: 0,
    totalVolume: 847392.18,
    marketHealth: 'good'
  };

  const mockTradingBots: TradingBot[] = [
    {
      id: 'waidbot_alpha',
      name: 'WaidBot Alpha',
      type: 'Scalping',
      status: 'active',
      profit24h: 342.18,
      trades24h: 47,
      winRate: 72.1,
      lastAction: 'BUY ETH @ $3,247.50',
      riskLevel: 'medium'
    },
    {
      id: 'waidbot_beta',
      name: 'WaidBot Pro Beta',
      type: 'Swing Trading',
      status: 'active',
      profit24h: 189.63,
      trades24h: 12,
      winRate: 83.3,
      lastAction: 'SELL BTC @ $67,890.25',
      riskLevel: 'low'
    },
    {
      id: 'autonomous_gamma',
      name: 'Autonomous Gamma',
      type: 'DCA Strategy',
      status: 'paused',
      profit24h: -45.21,
      trades24h: 8,
      winRate: 37.5,
      lastAction: 'HOLD positions',
      riskLevel: 'high'
    },
    {
      id: 'full_engine_omega',
      name: 'Full Engine Omega',
      type: 'Arbitrage',
      status: 'active',
      profit24h: 756.92,
      trades24h: 89,
      winRate: 94.4,
      lastAction: 'ARB USDT/USDC',
      riskLevel: 'low'
    },
    {
      id: 'smai_delta',
      name: 'Smai Chinnikstah Delta',
      type: 'Grid Trading',
      status: 'active',
      profit24h: 423.67,
      trades24h: 34,
      winRate: 67.6,
      lastAction: 'GRID UPDATE',
      riskLevel: 'medium'
    },
    {
      id: 'nwaora_epsilon',
      name: 'Nwaora Chigozie Epsilon',
      type: 'AI Sentiment',
      status: 'paused',
      profit24h: 128.45,
      trades24h: 15,
      winRate: 80.0,
      lastAction: 'SENTIMENT ANALYSIS',
      riskLevel: 'medium'
    }
  ];

  const mockExchanges: ExchangeStatus[] = [
    { name: 'Binance', status: 'connected', latency: 45, apiCalls: 1247, lastUpdate: '2 min ago' },
    { name: 'Coinbase Pro', status: 'connected', latency: 78, apiCalls: 892, lastUpdate: '1 min ago' },
    { name: 'Kraken', status: 'connected', latency: 124, apiCalls: 445, lastUpdate: '3 min ago' },
    { name: 'KuCoin', status: 'disconnected', latency: 0, apiCalls: 0, lastUpdate: '15 min ago' }
  ];

  const mockRiskMetrics: RiskMetrics = {
    portfolioExposure: 73.2,
    maxDrawdown: 8.4,
    sharpeRatio: 1.84,
    riskScore: 6.7,
    leverageUsed: 2.1
  };

  // Bot control mutations
  const toggleBotMutation = useMutation({
    mutationFn: async ({ botId, action }: { botId: string; action: 'start' | 'stop' }) => {
      return await apiRequest('POST', `/api/trading/bots/${botId}/${action}`);
    },
    onSuccess: (data, variables) => {
      toast({
        title: `Bot ${variables.action === 'start' ? 'Started' : 'Stopped'}`,
        description: `${variables.botId} has been ${variables.action === 'start' ? 'activated' : 'paused'}`,
      });
    },
    onError: () => {
      toast({
        title: "Action Failed",
        description: "Failed to control bot",
        variant: "destructive",
      });
    },
  });

  const emergencyStopMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/trading/emergency-stop');
    },
    onSuccess: () => {
      toast({
        title: "Emergency Stop Activated",
        description: "All trading bots have been immediately stopped",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'connected': case 'excellent': return 'text-green-500';
      case 'paused': case 'good': case 'fair': return 'text-yellow-500';
      case 'error': case 'disconnected': case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': case 'connected': case 'excellent': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paused': case 'good': case 'fair': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error': case 'disconnected': case 'poor': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'high': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Admin Dashboard</h1>
            <p className="text-slate-400">Advanced trading operations and bot management</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => emergencyStopMutation.mutate()}
              variant="destructive"
              size="sm"
              disabled={emergencyStopMutation.isPending}
            >
              <Shield className="w-4 h-4 mr-2" />
              Emergency Stop
            </Button>
            <Badge variant="outline" className="border-green-500 text-green-400">
              Trading Active
            </Badge>
          </div>
        </div>

        {/* Trading Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Profit */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Profit (24h)</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                ${mockTradingMetrics.totalProfit.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500">
                +12.3% from yesterday
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-xs text-green-400">Trending up</span>
              </div>
            </CardContent>
          </Card>

          {/* Active Bots */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Bots</CardTitle>
              <Bot className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{mockTradingMetrics.activeBots}</div>
              <p className="text-xs text-slate-500">
                {mockTradingMetrics.pausedBots} paused, {mockTradingMetrics.errorBots} errors
              </p>
              <div className="flex items-center mt-2">
                {getStatusIcon('active')}
                <span className="text-xs ml-1 text-green-400">All systems operational</span>
              </div>
            </CardContent>
          </Card>

          {/* Win Rate */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{mockTradingMetrics.winRate}%</div>
              <p className="text-xs text-slate-500">
                {mockTradingMetrics.totalTrades} trades total
              </p>
              <Progress value={mockTradingMetrics.winRate} className="mt-2" />
            </CardContent>
          </Card>

          {/* Market Health */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Market Health</CardTitle>
              <BarChart3 className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white capitalize">{mockTradingMetrics.marketHealth}</div>
              <p className="text-xs text-slate-500">Overall market condition</p>
              <div className="flex items-center mt-2">
                {getStatusIcon(mockTradingMetrics.marketHealth)}
                <span className={`text-xs ml-1 ${getStatusColor(mockTradingMetrics.marketHealth)}`}>
                  {mockTradingMetrics.marketHealth.charAt(0).toUpperCase() + mockTradingMetrics.marketHealth.slice(1)} conditions
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="bots" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="bots" className="data-[state=active]:bg-slate-700">Trading Bots</TabsTrigger>
            <TabsTrigger value="exchanges" className="data-[state=active]:bg-slate-700">Exchanges</TabsTrigger>
            <TabsTrigger value="risk" className="data-[state=active]:bg-slate-700">Risk Management</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">Settings</TabsTrigger>
          </TabsList>

          {/* Trading Bots Tab */}
          <TabsContent value="bots" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bot className="w-5 h-5 mr-2" />
                  Trading Bot Management
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Monitor and control all trading bots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTradingBots.map((bot) => (
                    <div key={bot.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(bot.status)}
                            <div>
                              <div className="text-white font-medium">{bot.name}</div>
                              <div className="text-sm text-slate-400">{bot.type} • {bot.lastAction}</div>
                            </div>
                          </div>
                          <Badge className={getRiskColor(bot.riskLevel)}>
                            {bot.riskLevel} risk
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className={`text-lg font-bold ${bot.profit24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {bot.profit24h >= 0 ? '+' : ''}${bot.profit24h.toFixed(2)}
                            </div>
                            <div className="text-sm text-slate-400">
                              {bot.trades24h} trades • {bot.winRate}% win rate
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={bot.status === 'active'}
                              onCheckedChange={(checked) => 
                                toggleBotMutation.mutate({
                                  botId: bot.id,
                                  action: checked ? 'start' : 'stop'
                                })
                              }
                              disabled={toggleBotMutation.isPending}
                            />
                            <Button size="sm" variant="outline">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exchanges Tab */}
          <TabsContent value="exchanges" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Exchange Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockExchanges.map((exchange) => (
                      <div key={exchange.name} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(exchange.status)}
                          <div>
                            <div className="text-white font-medium">{exchange.name}</div>
                            <div className="text-sm text-slate-400">
                              {exchange.status === 'connected' ? `${exchange.latency}ms latency` : 'Disconnected'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white">{exchange.apiCalls}</div>
                          <div className="text-xs text-slate-400">API calls</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Trading Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      ${mockTradingMetrics.totalVolume.toLocaleString()}
                    </div>
                    <div className="text-slate-400 mb-4">24h Trading Volume</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-white font-semibold">87%</div>
                        <div className="text-slate-400">Spot Trading</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-semibold">13%</div>
                        <div className="text-slate-400">Futures</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk Management Tab */}
          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Risk Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Portfolio Exposure</span>
                      <span className="text-white">{mockRiskMetrics.portfolioExposure}%</span>
                    </div>
                    <Progress value={mockRiskMetrics.portfolioExposure} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Max Drawdown</span>
                      <span className="text-white">{mockRiskMetrics.maxDrawdown}%</span>
                    </div>
                    <Progress value={mockRiskMetrics.maxDrawdown} className="bg-red-900" />
                  </div>
                  <div className="pt-2 border-t border-slate-700 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Sharpe Ratio</span>
                      <span className="text-white">{mockRiskMetrics.sharpeRatio}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Risk Score</span>
                      <span className="text-white">{mockRiskMetrics.riskScore}/10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Leverage Used</span>
                      <span className="text-white">{mockRiskMetrics.leverageUsed}x</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Risk Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Update Risk Limits
                  </Button>
                  <Button className="w-full" variant="outline">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Generate Risk Report
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Alerts
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Trading Analytics</CardTitle>
                <CardDescription className="text-slate-400">
                  Performance metrics and trading insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{mockTradingMetrics.totalTrades}</div>
                    <div className="text-sm text-slate-400">Total Trades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{mockTradingMetrics.winRate}%</div>
                    <div className="text-sm text-slate-400">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">2.34x</div>
                    <div className="text-sm text-slate-400">Avg. Profit Factor</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Trading Settings</CardTitle>
                <CardDescription className="text-slate-400">
                  Global trading configuration and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-16">
                    <div className="text-center">
                      <Settings className="w-6 h-6 mx-auto mb-1" />
                      <div>Global Settings</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-16">
                    <div className="text-center">
                      <Shield className="w-6 h-6 mx-auto mb-1" />
                      <div>Security Settings</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-16">
                    <div className="text-center">
                      <AlertTriangle className="w-6 h-6 mx-auto mb-1" />
                      <div>Alert Configuration</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-16">
                    <div className="text-center">
                      <BarChart3 className="w-6 h-6 mx-auto mb-1" />
                      <div>Analytics Setup</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}