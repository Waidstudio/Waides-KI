import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingUp, TrendingDown, Shield, Zap, Brain, Activity } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface BotStatus {
  running: boolean;
  profit: number;
  totalTrades: number;
  winRate: number;
  currentBalance: number;
  trades: TradeRecord[];
  lastDecision: any;
  currentRisk: number;
  uptime: number;
  startTime: number;
}

interface TradeRecord {
  id: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  timestamp: number;
  profit?: number;
  bot: 'WaidBot' | 'WaidBot Pro';
  strategy?: string;
  confidence: number;
}

interface EnhancedWaidBotStatus {
  waidBot: BotStatus;
  waidBotPro: BotStatus;
  ethPrice: number;
  parameters: any;
  timestamp: number;
}

interface PerformanceAnalytics {
  waidBot: any;
  waidBotPro: any;
  combined: any;
}

export default function EnhancedWaidBotController() {
  const queryClient = useQueryClient();
  
  // Fetch enhanced WaidBot status
  const { data: status, isLoading } = useQuery<EnhancedWaidBotStatus>({
    queryKey: ['/api/enhanced-waidbot/status'],
    refetchInterval: 2000, // Update every 2 seconds
  });

  // Fetch performance analytics
  const { data: analytics } = useQuery<PerformanceAnalytics>({
    queryKey: ['/api/enhanced-waidbot/analytics'],
    refetchInterval: 5000, // Update every 5 seconds
  });

  // Toggle WaidBot mutation
  const toggleWaidBot = useMutation({
    mutationFn: (enabled: boolean) => 
      apiRequest('/api/enhanced-waidbot/waidbot/toggle', {
        method: 'POST',
        body: JSON.stringify({ enabled }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-waidbot/status'] });
    },
  });

  // Toggle WaidBot Pro mutation
  const toggleWaidBotPro = useMutation({
    mutationFn: (enabled: boolean) => 
      apiRequest('/api/enhanced-waidbot/waidbot-pro/toggle', {
        method: 'POST',
        body: JSON.stringify({ enabled }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-waidbot/status'] });
    },
  });

  // Emergency stop mutation
  const emergencyStop = useMutation({
    mutationFn: () => 
      apiRequest('/api/enhanced-waidbot/emergency-stop', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-waidbot/status'] });
    },
  });

  // Reset stats mutation
  const resetStats = useMutation({
    mutationFn: (bot?: string) => 
      apiRequest('/api/enhanced-waidbot/reset-stats', {
        method: 'POST',
        body: JSON.stringify({ bot }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-waidbot/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enhanced-waidbot/analytics'] });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-500';
    if (profit < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getRiskColor = (risk: number) => {
    if (risk < 0.3) return 'bg-green-500';
    if (risk < 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No enhanced WaidBot data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Emergency Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Enhanced WaidBot Controller</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time trading bot management and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={() => emergencyStop.mutate()}
            disabled={emergencyStop.isPending}
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Emergency Stop
          </Button>
          <Button
            variant="outline"
            onClick={() => resetStats.mutate()}
            disabled={resetStats.isPending}
          >
            Reset All Stats
          </Button>
        </div>
      </div>

      {/* Bot Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WaidBot Status */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  WaidBot
                </CardTitle>
                <CardDescription>Long-only ETH trading (upward trends)</CardDescription>
              </div>
              <Switch
                checked={status.waidBot.running}
                onCheckedChange={(enabled) => toggleWaidBot.mutate(enabled)}
                disabled={toggleWaidBot.isPending}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Profit/Loss</p>
                <p className={`text-lg font-bold ${getProfitColor(status.waidBot.profit)}`}>
                  {formatCurrency(status.waidBot.profit)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Balance</p>
                <p className="text-lg font-bold">{formatCurrency(status.waidBot.currentBalance)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
                <p className="text-lg font-bold">{status.waidBot.totalTrades}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
                <p className="text-lg font-bold">{status.waidBot.winRate.toFixed(1)}%</p>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Risk Level</span>
                <span>{(status.waidBot.currentRisk * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={status.waidBot.currentRisk * 100} 
                className={`h-2 ${getRiskColor(status.waidBot.currentRisk)}`}
              />
            </div>

            {status.waidBot.running && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Activity className="h-4 w-4" />
                <span>Running for {formatUptime(status.waidBot.uptime)}</span>
              </div>
            )}

            {status.waidBot.lastDecision && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium">Last Decision</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {status.waidBot.lastDecision.action} - {status.waidBot.lastDecision.confidence}% confidence
                </p>
                <p className="text-xs mt-1">{status.waidBot.lastDecision.reasoning}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* WaidBot Pro Status */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  WaidBot Pro
                </CardTitle>
                <CardDescription>Advanced long/short trading (all markets)</CardDescription>
              </div>
              <Switch
                checked={status.waidBotPro.running}
                onCheckedChange={(enabled) => toggleWaidBotPro.mutate(enabled)}
                disabled={toggleWaidBotPro.isPending}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Profit/Loss</p>
                <p className={`text-lg font-bold ${getProfitColor(status.waidBotPro.profit)}`}>
                  {formatCurrency(status.waidBotPro.profit)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Balance</p>
                <p className="text-lg font-bold">{formatCurrency(status.waidBotPro.currentBalance)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
                <p className="text-lg font-bold">{status.waidBotPro.totalTrades}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
                <p className="text-lg font-bold">{status.waidBotPro.winRate.toFixed(1)}%</p>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Risk Level</span>
                <span>{(status.waidBotPro.currentRisk * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={status.waidBotPro.currentRisk * 100} 
                className={`h-2 ${getRiskColor(status.waidBotPro.currentRisk)}`}
              />
            </div>

            {status.waidBotPro.running && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Activity className="h-4 w-4" />
                <span>Running for {formatUptime(status.waidBotPro.uptime)}</span>
              </div>
            )}

            {status.waidBotPro.lastDecision && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium">Last Decision</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {status.waidBotPro.lastDecision.action} - {status.waidBotPro.lastDecision.confidence}% confidence
                </p>
                <p className="text-xs mt-1">{status.waidBotPro.lastDecision.reasoning}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ETH Price</p>
              <p className="text-2xl font-bold">{formatCurrency(status.ethPrice)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Combined Profit</p>
              <p className={`text-2xl font-bold ${getProfitColor(status.waidBot.profit + status.waidBotPro.profit)}`}>
                {formatCurrency(status.waidBot.profit + status.waidBotPro.profit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
              <p className="text-2xl font-bold">{status.waidBot.totalTrades + status.waidBotPro.totalTrades}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Bots</p>
              <p className="text-2xl font-bold">
                {(status.waidBot.running ? 1 : 0) + (status.waidBotPro.running ? 1 : 0)}/2
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trades">Recent Trades</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>WaidBot Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Profit Factor</span>
                    <span className="font-bold">{analytics.waidBot.profitFactor?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sharpe Ratio</span>
                    <span className="font-bold">{analytics.waidBot.sharpeRatio?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Profit</span>
                    <span className="font-bold text-green-500">
                      {formatCurrency(analytics.waidBot.maxProfit || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Loss</span>
                    <span className="font-bold text-red-500">
                      {formatCurrency(analytics.waidBot.maxLoss || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Drawdown</span>
                    <span className="font-bold">
                      {(analytics.waidBot.currentDrawdown * 100).toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>WaidBot Pro Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Profit Factor</span>
                    <span className="font-bold">{analytics.waidBotPro.profitFactor?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sharpe Ratio</span>
                    <span className="font-bold">{analytics.waidBotPro.sharpeRatio?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Profit</span>
                    <span className="font-bold text-green-500">
                      {formatCurrency(analytics.waidBotPro.maxProfit || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Loss</span>
                    <span className="font-bold text-red-500">
                      {formatCurrency(analytics.waidBotPro.maxLoss || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Drawdown</span>
                    <span className="font-bold">
                      {(analytics.waidBotPro.currentDrawdown * 100).toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
              <CardDescription>Latest trading activity from both bots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...status.waidBot.trades, ...status.waidBotPro.trades]
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .slice(0, 10)
                  .map((trade) => (
                    <div
                      key={trade.id}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={trade.type === 'BUY' ? 'default' : 'secondary'}>
                          {trade.type}
                        </Badge>
                        <div>
                          <p className="font-medium">{trade.bot}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(trade.price)} × {trade.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {trade.profit && (
                          <p className={`font-bold ${getProfitColor(trade.profit)}`}>
                            {formatCurrency(trade.profit)}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {trade.confidence}% confidence
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Parameters</CardTitle>
              <CardDescription>Current bot configuration settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">WaidBot Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Trend Threshold</span>
                      <span>{status.parameters.waidBot.trendThreshold}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence Threshold</span>
                      <span>{status.parameters.waidBot.confidenceThreshold}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Position Size</span>
                      <span>{(status.parameters.waidBot.positionSize * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Only Uptrends</span>
                      <span>{status.parameters.waidBot.onlyUptrends ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">WaidBot Pro Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Risk Level</span>
                      <span>{status.parameters.waidBotPro.riskLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sideways Detection</span>
                      <span>{status.parameters.waidBotPro.sidewaysDetection ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Short Selling</span>
                      <span>{status.parameters.waidBotPro.shortSelling ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Positions</span>
                      <span>{status.parameters.waidBotPro.maxPositions}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Max Risk Per Trade</span>
                  <span>{(status.parameters.riskManagement.maxRiskPerTrade * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Drawdown</span>
                  <span>{(status.parameters.riskManagement.maxDrawdown * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Stop Loss</span>
                  <span>{(status.parameters.riskManagement.stopLossPercentage * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Take Profit</span>
                  <span>{(status.parameters.riskManagement.takeProfitPercentage * 100).toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}