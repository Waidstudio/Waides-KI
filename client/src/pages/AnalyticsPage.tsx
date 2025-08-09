import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  Wallet,
  Bot,
  Brain,
  Shield,
  Calendar,
  RefreshCw
} from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";

interface UserAnalytics {
  totalTrades: number;
  successfulTrades: number;
  totalProfit: number;
  totalLoss: number;
  winRate: number;
  averageReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  activeBots: number;
  totalInvested: number;
  portfolioValue: number;
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
}

interface SystemAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalTrades: number;
  systemUptime: number;
  apiResponseTime: number;
  successRate: number;
  totalVolume: number;
  revenue: number;
}

interface TradingPerformance {
  symbol: string;
  trades: number;
  profit: number;
  winRate: number;
  avgReturn: number;
}

interface BotPerformance {
  botId: string;
  name: string;
  trades: number;
  profit: number;
  winRate: number;
  status: 'active' | 'inactive' | 'paused';
  lastTrade: string;
}

export default function AnalyticsPage() {
  const { user } = useUserAuth();
  const [refreshPaused, setRefreshPaused] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // User Analytics
  const { data: userAnalytics, isLoading: userLoading, refetch: refetchUser } = useQuery<UserAnalytics>({
    queryKey: ['/api/analytics/user', user?.id],
    refetchInterval: refreshPaused ? false : 30000,
    staleTime: 20000,
    enabled: !!user?.id && !refreshPaused,
  });

  // System Analytics (for admins)
  const { data: systemAnalytics, isLoading: systemLoading, refetch: refetchSystem } = useQuery<SystemAnalytics>({
    queryKey: ['/api/analytics/system'],
    refetchInterval: refreshPaused ? false : 60000,
    staleTime: 45000,
    enabled: (user?.role === 'admin' || user?.role === 'super_admin') && !refreshPaused,
  });

  // Trading Performance
  const { data: tradingPerformance, refetch: refetchTrading } = useQuery<TradingPerformance[]>({
    queryKey: ['/api/analytics/trading-performance', user?.id],
    refetchInterval: refreshPaused ? false : 45000,
    staleTime: 30000,
    enabled: !!user?.id && !refreshPaused,
  });

  // Bot Performance
  const { data: botPerformance, refetch: refetchBots } = useQuery<BotPerformance[]>({
    queryKey: ['/api/analytics/bot-performance', user?.id],
    refetchInterval: refreshPaused ? false : 45000,
    staleTime: 30000,
    enabled: !!user?.id && !refreshPaused,
  });

  // Portfolio Analytics
  const { data: portfolioAnalytics, refetch: refetchPortfolio } = useQuery({
    queryKey: ['/api/analytics/portfolio', user?.id],
    refetchInterval: refreshPaused ? false : 30000,
    staleTime: 20000,
    enabled: !!user?.id && !refreshPaused,
  });

  // Risk Analytics
  const { data: riskAnalytics, refetch: refetchRisk } = useQuery({
    queryKey: ['/api/analytics/risk-assessment', user?.id],
    refetchInterval: refreshPaused ? false : 60000,
    staleTime: 45000,
    enabled: !!user?.id && !refreshPaused,
  });

  const handleManualRefresh = () => {
    setLastRefresh(Date.now());
    refetchUser();
    refetchSystem();
    refetchTrading();
    refetchBots();
    refetchPortfolio();
    refetchRisk();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  if (userLoading) {
    return (
      <div className="min-h-screen waides-bg">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen waides-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-blue-200">
                Comprehensive performance insights and metrics
              </p>
              <div className="text-xs text-slate-400 mt-1">
                Last updated: {new Date(lastRefresh).toLocaleTimeString()}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefreshPaused(!refreshPaused)}
              className="flex items-center space-x-1"
            >
              {refreshPaused ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3" />
                  <span>Pause</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {refreshPaused && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-400">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Auto-refresh paused</span>
            </div>
          </div>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="bots">Bots</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="risk">Risk</TabsTrigger>
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <TabsTrigger value="system">System</TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Portfolio Value</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(userAnalytics?.portfolioValue || 0)}
                      </p>
                      <p className={`text-sm ${(userAnalytics?.dailyPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(userAnalytics?.dailyPnL || 0) >= 0 ? '+' : ''}{formatCurrency(userAnalytics?.dailyPnL || 0)} today
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-full">
                      <Wallet className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Total Profit</p>
                      <p className="text-2xl font-bold text-green-400">
                        {formatCurrency(userAnalytics?.totalProfit || 0)}
                      </p>
                      <p className="text-sm text-slate-400">
                        Win Rate: {formatPercentage(userAnalytics?.winRate || 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-full">
                      <TrendingUp className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Active Bots</p>
                      <p className="text-2xl font-bold text-white">
                        {userAnalytics?.activeBots || 0}
                      </p>
                      <p className="text-sm text-slate-400">
                        {userAnalytics?.totalTrades || 0} total trades
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-full">
                      <Bot className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Sharpe Ratio</p>
                      <p className="text-2xl font-bold text-white">
                        {(userAnalytics?.sharpeRatio || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-400">
                        Max DD: {formatPercentage(userAnalytics?.maxDrawdown || 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-full">
                      <Target className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-blue-400" />
                    Recent Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Daily P&L</span>
                    <span className={`font-semibold ${(userAnalytics?.dailyPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(userAnalytics?.dailyPnL || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Weekly P&L</span>
                    <span className={`font-semibold ${(userAnalytics?.weeklyPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(userAnalytics?.weeklyPnL || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Monthly P&L</span>
                    <span className={`font-semibold ${(userAnalytics?.monthlyPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(userAnalytics?.monthlyPnL || 0)}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Average Return</span>
                      <span className="font-semibold text-blue-400">
                        {formatPercentage(userAnalytics?.averageReturn || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-400" />
                    Trading Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Trades</span>
                      <span className="font-semibold text-white">{userAnalytics?.totalTrades || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Successful Trades</span>
                      <span className="font-semibold text-green-400">{userAnalytics?.successfulTrades || 0}</span>
                    </div>
                    <Progress 
                      value={(userAnalytics?.winRate || 0) * 100} 
                      className="h-2"
                    />
                    <div className="text-center text-sm text-slate-400">
                      Win Rate: {formatPercentage(userAnalytics?.winRate || 0)}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Total Invested</span>
                      <span className="font-semibold text-blue-400">
                        {formatCurrency(userAnalytics?.totalInvested || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trading Performance Tab */}
          <TabsContent value="trading" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Trading Performance by Symbol
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of your trading performance across different symbols
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tradingPerformance?.length ? (
                    tradingPerformance.map((performance, index) => (
                      <div key={index} className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-semibold text-white">
                              {performance.symbol}
                            </div>
                            <Badge variant={performance.profit >= 0 ? "default" : "destructive"}>
                              {performance.profit >= 0 ? "Profitable" : "Loss"}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-semibold ${performance.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(performance.profit)}
                            </div>
                            <div className="text-sm text-slate-400">
                              {performance.trades} trades · {formatPercentage(performance.winRate)} win rate
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Progress 
                            value={performance.winRate * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      No trading data available yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bot Performance Tab */}
          <TabsContent value="bots" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-400" />
                  Bot Performance Overview
                </CardTitle>
                <CardDescription>
                  Individual bot performance metrics and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {botPerformance?.length ? (
                    botPerformance.map((bot, index) => (
                      <div key={index} className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                              <Brain className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-white">
                                {bot.name}
                              </div>
                              <div className="text-sm text-slate-400">
                                ID: {bot.botId} · Last trade: {bot.lastTrade}
                              </div>
                            </div>
                            <Badge 
                              variant={bot.status === 'active' ? "default" : bot.status === 'paused' ? "secondary" : "destructive"}
                            >
                              {bot.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-semibold ${bot.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(bot.profit)}
                            </div>
                            <div className="text-sm text-slate-400">
                              {bot.trades} trades · {formatPercentage(bot.winRate)} win rate
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Progress 
                            value={bot.winRate * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      No active bots found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-green-400" />
                  Portfolio Analytics
                </CardTitle>
                <CardDescription>
                  Detailed portfolio composition and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-400">
                  Portfolio analytics coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Tab */}
          <TabsContent value="risk" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>
                  Risk metrics and exposure analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-400">
                  Risk analytics coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab (Admin Only) */}
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Total Users</p>
                        <p className="text-2xl font-bold text-white">
                          {systemAnalytics?.totalUsers || 0}
                        </p>
                        <p className="text-sm text-green-400">
                          {systemAnalytics?.activeUsers || 0} active
                        </p>
                      </div>
                      <div className="p-3 bg-blue-500/20 rounded-full">
                        <Users className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">System Uptime</p>
                        <p className="text-2xl font-bold text-white">
                          {((systemAnalytics?.systemUptime || 0) * 100).toFixed(1)}%
                        </p>
                        <p className="text-sm text-slate-400">
                          {systemAnalytics?.apiResponseTime || 0}ms avg response
                        </p>
                      </div>
                      <div className="p-3 bg-green-500/20 rounded-full">
                        <Zap className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Total Volume</p>
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(systemAnalytics?.totalVolume || 0)}
                        </p>
                        <p className="text-sm text-slate-400">
                          {systemAnalytics?.totalTrades || 0} trades
                        </p>
                      </div>
                      <div className="p-3 bg-purple-500/20 rounded-full">
                        <Activity className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Revenue</p>
                        <p className="text-2xl font-bold text-white">
                          {formatCurrency(systemAnalytics?.revenue || 0)}
                        </p>
                        <p className="text-sm text-green-400">
                          {formatPercentage(systemAnalytics?.successRate || 0)} success rate
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-500/20 rounded-full">
                        <DollarSign className="w-6 h-6 text-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}