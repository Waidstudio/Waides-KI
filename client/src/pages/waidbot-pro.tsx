import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Activity, BarChart3, AlertCircle, Play, Pause, Settings, Zap, Brain, Link, Target, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WaidBotProPage() {
  const [isToggling, setIsToggling] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch WaidBot Pro status from centralized engine
  const { data: engineStatus, isLoading } = useQuery({
    queryKey: ['/api/waidbot-engine/waidbot-pro/status'],
    refetchInterval: 3000, // Real-time sync every 3 seconds
  });

  // Fetch performance metrics
  const { data: performanceData } = useQuery({
    queryKey: ['/api/waidbot-engine/waidbot-pro/performance'],
    refetchInterval: 5000,
  });

  // Fetch trading signals
  const { data: signalsData } = useQuery({
    queryKey: ['/api/waidbot-engine/waidbot-pro/signals'],
    refetchInterval: 2000,
  });

  // Fetch profit/loss data
  const { data: profitLossData } = useQuery({
    queryKey: ['/api/waidbot-engine/waidbot-pro/profit-loss'],
    refetchInterval: 4000,
  });

  // Fetch trade history
  const { data: tradesData } = useQuery({
    queryKey: ['/api/waidbot-engine/waidbot-pro/trades'],
    refetchInterval: 6000,
  });

  // Toggle bot mutation
  const toggleMutation = useMutation({
    mutationFn: () => {
      const endpoint = engineStatus?.isActive 
        ? '/api/waidbot-engine/waidbot-pro/stop'
        : '/api/waidbot-engine/waidbot-pro/start';
      return apiRequest(endpoint, 'POST');
    },
    onSuccess: () => {
      const action = engineStatus?.isActive ? 'stopped' : 'started';
      toast({
        title: `WaidBot Pro β ${action}`,
        description: `Advanced Multi-Strategy bot has been ${action}`,
      });
      // Invalidate all related queries for real-time sync
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot-pro'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/comprehensive-metrics'] });
    },
    onError: (error) => {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to toggle WaidBot Pro",
        variant: "destructive",
      });
    },
    onSettled: () => setIsToggling(false),
  });

  const handleToggleBot = () => {
    setIsToggling(true);
    toggleMutation.mutate();
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-500/20 text-green-400 border-green-500/40" : 
                     "bg-red-500/20 text-red-400 border-red-500/40";
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const status = engineStatus || {};
  const performance = performanceData || {};
  const signals = signalsData?.signals || [];
  const profitLoss = profitLossData || {};
  const trades = tradesData?.trades || [];

  if (isLoading) {
    return (
      <div className="min-h-screen waides-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen waides-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Engine Sync Status */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-2">
                WaidBot Pro β 
                <Link className="h-6 w-6 text-purple-400" title="Synced with Engine" />
              </h1>
              <p className="text-purple-200">Advanced Multi-Strategy - Synchronized with Centralized Engine</p>
            </div>
            <div className="ml-auto flex gap-2">
              <Badge className={getStatusColor(status.isActive)}>
                {status.isActive ? "ACTIVE" : "STANDBY"}
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40">
                TIER: PRO
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Control Panel */}
          <div className="xl:col-span-2 space-y-6">
            {/* Engine Sync Status Card */}
            <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-400/40">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Engine Synchronization Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-2xl font-bold text-green-400">SYNCED</div>
                    <div className="text-sm text-green-200">Real-time Data Flow</div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">{signals.length}</div>
                    <div className="text-sm text-blue-200">Active Signals</div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">{trades.length}</div>
                    <div className="text-sm text-purple-200">Recent Trades</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Control Panel */}
            <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-400/40">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-400" />
                  WaidBot Pro β Control Center
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <Button
                    onClick={handleToggleBot}
                    disabled={isToggling}
                    className={`px-8 py-3 text-lg font-semibold ${
                      status.isActive 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isToggling ? (
                      <Activity className="h-5 w-5 mr-2 animate-spin" />
                    ) : status.isActive ? (
                      <Pause className="h-5 w-5 mr-2" />
                    ) : (
                      <Play className="h-5 w-5 mr-2" />
                    )}
                    {status.isActive ? 'Stop Trading' : 'Start Trading'}
                  </Button>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-4 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {performance.winRate?.toFixed(1) || '0.0'}%
                    </div>
                    <div className="text-sm text-gray-400">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      ${profitLoss.totalProfit?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-gray-400">Total Profit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {performance.totalTrades || 0}
                    </div>
                    <div className="text-sm text-gray-400">Total Trades</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getRiskColor(status.currentRiskLevel || 'LOW')}`}>
                      {status.currentRiskLevel || 'LOW'}
                    </div>
                    <div className="text-sm text-gray-400">Risk Level</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Strategy Panel */}
            <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-400/40">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  Multi-Strategy Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Active Strategy:</span>
                      <Badge className="bg-blue-500/20 text-blue-400">
                        {status.currentStrategy || 'TREND_FOLLOWING'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Confidence:</span>
                      <span className="text-green-400 font-bold">
                        {status.confidence?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Position:</span>
                      <Badge className={
                        status.currentPosition === 'LONG' ? 'bg-green-500/20 text-green-400' :
                        status.currentPosition === 'SHORT' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }>
                        {status.currentPosition || 'NEUTRAL'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Auto Trading:</span>
                      <Badge className={status.autoTradingEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {status.autoTradingEnabled ? 'ENABLED' : 'DISABLED'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Last Update:</span>
                      <span className="text-gray-400 text-sm">
                        {status.lastUpdate ? new Date(status.lastUpdate).toLocaleTimeString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Engine Sync:</span>
                      <Badge className="bg-green-500/20 text-green-400">
                        CONNECTED
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Tabs */}
            <Tabs defaultValue="signals" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
                <TabsTrigger value="signals" className="text-white">Live Signals</TabsTrigger>
                <TabsTrigger value="performance" className="text-white">Performance</TabsTrigger>
                <TabsTrigger value="trades" className="text-white">Trade History</TabsTrigger>
                <TabsTrigger value="analysis" className="text-white">Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="signals">
                <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-400/40">
                  <CardHeader>
                    <CardTitle className="text-white">Live Trading Signals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {signals.length > 0 ? (
                      <div className="space-y-3">
                        {signals.slice(0, 5).map((signal, index) => (
                          <div key={index} className="p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Badge className={
                                  signal.action === 'BUY' ? 'bg-green-500/20 text-green-400' :
                                  signal.action === 'SELL' ? 'bg-red-500/20 text-red-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }>
                                  {signal.action}
                                </Badge>
                                <span className="text-white font-medium">{signal.symbol}</span>
                                <Badge className={`text-xs ${getRiskColor(signal.riskLevel)}`}>
                                  {signal.riskLevel}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <div className="text-green-400 font-bold">{signal.confidence}%</div>
                                <div className="text-xs text-gray-400">Confidence</div>
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-300">{signal.reasoning}</div>
                            <div className="mt-1 text-xs text-purple-300">Strategy: {signal.strategy}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        No active signals. Start the bot to begin receiving signals.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance">
                <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-400/40">
                  <CardHeader>
                    <CardTitle className="text-white">Advanced Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-purple-400">Profit & Loss</h4>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Total Profit:</span>
                          <span className="text-green-400 font-bold">
                            ${profitLoss.totalProfit?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Total Loss:</span>
                          <span className="text-red-400 font-bold">
                            ${profitLoss.totalLoss?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Net P&L:</span>
                          <span className={`font-bold ${
                            (profitLoss.netProfitLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            ${profitLoss.netProfitLoss?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Profit Factor:</span>
                          <span className="text-blue-400 font-bold">
                            {profitLoss.profitFactor?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-purple-400">Trading Stats</h4>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Win Rate:</span>
                          <span className="text-green-400 font-bold">
                            {performance.winRate?.toFixed(1) || '0.0'}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Winning Trades:</span>
                          <span className="text-green-400 font-bold">
                            {profitLoss.winningTrades || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Losing Trades:</span>
                          <span className="text-red-400 font-bold">
                            {profitLoss.losingTrades || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Max Drawdown:</span>
                          <span className="text-yellow-400 font-bold">
                            {profitLoss.maxDrawdown?.toFixed(2) || '0.00'}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trades">
                <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-400/40">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Trade History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trades.length > 0 ? (
                      <div className="space-y-2">
                        {trades.slice(0, 10).map((trade, index) => (
                          <div key={index} className="p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Badge className={
                                  trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' :
                                  'bg-red-500/20 text-red-400'
                                }>
                                  {trade.type}
                                </Badge>
                                <span className="text-white">{trade.symbol}</span>
                                <span className="text-gray-300">{trade.quantity}</span>
                              </div>
                              <div className="text-right">
                                <div className={`font-bold ${
                                  (trade.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  ${trade.profit?.toFixed(2) || '0.00'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {new Date(trade.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        No trade history available.
                        <br />
                        Synchronized with centralized engine data.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis">
                <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-400/40">
                  <CardHeader>
                    <CardTitle className="text-white">Market Analysis & Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-400">
                      Advanced market analysis synchronized with centralized engine.
                      <br />
                      View comprehensive analysis in /waidbot-engine dashboard.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Quick Stats */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-purple-400/40">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {status.isActive ? 'ACTIVE' : 'STANDBY'}
                  </div>
                  <Badge className={getStatusColor(status.isActive)}>
                    WaidBot Pro β
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Engine Sync:</span>
                    <span className="text-green-400">CONNECTED</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Last Signal:</span>
                    <span className="text-white">
                      {signals[0]?.timestamp ? new Date(signals[0].timestamp).toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Risk:</span>
                    <span className={getRiskColor(status.currentRiskLevel || 'LOW')}>
                      {status.currentRiskLevel || 'LOW'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engine Connection */}
            <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-green-400/40">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Link className="h-5 w-5 text-green-400" />
                  Engine Sync
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">SYNCED</div>
                  <div className="text-sm text-green-200">
                    Real-time data synchronization with centralized engine active
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}