/**
 * Enhanced Bot Management Component
 * Comprehensive bot settings, profit/loss tracking, and advanced features
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings, TrendingUp, TrendingDown, DollarSign, Shield, 
  Brain, Target, AlertTriangle, CheckCircle, XCircle,
  BarChart3, Activity, Zap, Eye, Clock, Sliders,
  PieChart, LineChart, Gauge, Star, Award, TrendingUpDown,
  RefreshCw, Play, Pause, StopCircle, RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface EnhancedBotManagementProps {
  botId: string;
  botName: string;
  onClose: () => void;
}

interface BotSettings {
  settings?: {
    id: string;
    name: string;
    riskLevel: string;
    maxPositionSize: number;
    stopLoss: number;
    takeProfit: number;
    activeStrategy: string;
    autoTrading: boolean;
    maxDailyTrades: number;
    tradingPairs: string[];
    timeframes: string[];
    activeTimeframe: string;
    strategies: string[];
    notifications: {
      email: boolean;
      sms: boolean;
      inApp: boolean;
      profitThreshold: number;
      lossThreshold: number;
    };
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
  };
}

interface ProfitLossData {
  profitLoss?: {
    netProfitLoss: number;
    isCurrentlyProfiting: boolean;
    isCurrentlyLosing: boolean;
    winRate: number;
    winningTrades: number;
    totalTrades: number;
    consecutiveWins: number;
    consecutiveLosses: number;
    totalProfit: number;
    totalLoss: number;
    largestWin: number;
    largestLoss: number;
    averageWin: number;
    averageLoss: number;
    profitFactor: number;
    sharpeRatio: number;
  };
}

interface PerformanceData {
  performance?: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
  };
}

interface SignalsData {
  signals?: Array<{
    timestamp: number;
    signal: string;
    confidence: number;
    price: number;
    symbol: string;
  }>;
}

interface TradesData {
  trades?: Array<{
    id: string;
    timestamp: number;
    symbol: string;
    side: string;
    quantity: number;
    price: number;
    status: string;
    profit?: number;
  }>;
}

interface AnalysisData {
  analysis?: {
    recommendations: string[];
    riskAssessment: string;
    marketConditions: string;
    optimizationSuggestions: string[];
  };
}

export default function EnhancedBotManagement({ botId, botName, onClose }: EnhancedBotManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Bot-specific configurations
  const isMaibot = botId === 'maibot';
  const isWaidBot = botId === 'waidbot';
  const isWaidBotPro = botId === 'waidbot-pro';
  const isAutonomous = botId === 'autonomous';
  const isFullEngine = botId === 'full-engine';
  const isNwaoraChigozie = botId === 'nwaora-chigozie';
  const isSmaiChinnikstah = botId === 'smai-chinnikstah';

  // Fetch bot settings
  const { data: settings, isLoading: settingsLoading } = useQuery<BotSettings>({
    queryKey: [`/api/waidbot-engine/${botId}/settings`],
    refetchInterval: 30000,
  });

  // Fetch profit/loss data
  const { data: profitLoss, isLoading: profitLossLoading } = useQuery<ProfitLossData>({
    queryKey: [`/api/waidbot-engine/${botId}/profit-loss`],
    refetchInterval: 10000,
  });

  // Fetch performance metrics
  const { data: performance, isLoading: performanceLoading } = useQuery<PerformanceData>({
    queryKey: [`/api/waidbot-engine/${botId}/performance`],
    refetchInterval: 30000,
  });

  // Fetch trading signals
  const { data: signals } = useQuery<SignalsData>({
    queryKey: [`/api/waidbot-engine/${botId}/signals`],
    refetchInterval: 15000,
  });

  // Fetch trade history
  const { data: trades } = useQuery<TradesData>({
    queryKey: [`/api/waidbot-engine/${botId}/trades`],
    refetchInterval: 20000,
  });

  // Fetch advanced analysis
  const { data: analysis } = useQuery<AnalysisData>({
    queryKey: [`/api/waidbot-engine/${botId}/advanced-analysis`],
    refetchInterval: 60000,
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await fetch(`/api/waidbot-engine/${botId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Settings Updated', description: 'Bot settings have been successfully updated' });
      queryClient.invalidateQueries({ queryKey: [`/api/waidbot-engine/${botId}/settings`] });
    },
    onError: () => {
      toast({ title: 'Update Failed', description: 'Failed to update bot settings', variant: 'destructive' });
    },
  });

  // Generate signal mutation
  const generateSignalMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/waidbot-engine/${botId}/generate-signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: 'ETH/USDT' }),
      });
      if (!response.ok) throw new Error('Failed to generate signal');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Signal Generated', description: 'New trading signal has been generated' });
      queryClient.invalidateQueries({ queryKey: [`/api/waidbot-engine/${botId}/signals`] });
    },
  });

  // Auto-optimize mutation
  const autoOptimizeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/waidbot-engine/${botId}/auto-optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to auto-optimize');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Optimization Complete', description: 'Bot has been auto-optimized based on performance data' });
      queryClient.invalidateQueries({ queryKey: [`/api/waidbot-engine/${botId}/settings`] });
    },
  });

  // Emergency stop mutation
  const emergencyStopMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await fetch(`/api/waidbot-engine/${botId}/emergency-stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error('Failed to trigger emergency stop');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Emergency Stop Activated', description: 'Bot has been safely stopped', variant: 'destructive' });
      queryClient.invalidateQueries({ queryKey: [`/api/waidbot-engine/${botId}/settings`] });
    },
  });

  const handleSettingUpdate = (key: string, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getProfitLossColor = (value: number) => {
    return value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (settingsLoading || profitLossLoading || performanceLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-black border border-slate-700 rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
            <h3 className="text-lg font-semibold mb-2 text-white">Loading Enhanced Bot Management</h3>
            <p className="text-slate-400">Fetching comprehensive bot data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-black border border-slate-700 rounded-lg max-w-7xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div className={`p-4 sm:p-6 border-b ${isNwaoraChigozie 
          ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600' 
          : 'bg-gradient-to-r from-blue-600 to-purple-600'} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                {botName} Enhanced Management
                {isNwaoraChigozie && <span className="text-yellow-300">✨</span>}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100">
                {isNwaoraChigozie 
                  ? "Cosmic Intelligence Configuration & Divine Monitoring" 
                  : "Comprehensive bot configuration and monitoring"}
              </p>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)] bg-black">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 sticky top-0 bg-slate-900 border-slate-700 z-10 text-xs sm:text-sm">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs sm:text-sm hidden sm:block">Performance</TabsTrigger>
              <TabsTrigger value="signals" className="text-xs sm:text-sm hidden sm:block">Signals</TabsTrigger>
              <TabsTrigger value="trades" className="text-xs sm:text-sm hidden sm:block">Trades</TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs sm:text-sm">Advanced</TabsTrigger>
            </TabsList>
            
            {/* Mobile-only secondary tab navigation */}
            <div className="sm:hidden bg-slate-900 border-slate-700 px-2 py-1">
              <TabsList className="grid w-full grid-cols-3 h-8 bg-slate-800 border-slate-600">
                <TabsTrigger value="performance" className="text-xs text-white">Performance</TabsTrigger>
                <TabsTrigger value="signals" className="text-xs text-white">Signals</TabsTrigger>
                <TabsTrigger value="trades" className="text-xs text-white">Trades</TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="p-3 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {/* Profit/Loss Summary */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Profit/Loss</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getProfitLossColor(profitLoss?.profitLoss?.netProfitLoss || 0)}`}>
                      {formatCurrency(profitLoss?.profitLoss?.netProfitLoss || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {profitLoss?.profitLoss?.isCurrentlyProfiting ? 'Currently Profitable' : 
                       profitLoss?.profitLoss?.isCurrentlyLosing ? 'Currently Losing' : 'Neutral'}
                    </p>
                  </CardContent>
                </Card>

                {/* Win Rate */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatPercentage(profitLoss?.profitLoss?.winRate || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {profitLoss?.profitLoss?.winningTrades || 0} wins / {profitLoss?.profitLoss?.totalTrades || 0} total
                    </p>
                  </CardContent>
                </Card>

                {/* Performance Score */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getPerformanceColor(performance?.performance?.overallScore || 0)}`}>
                      {Math.round(performance?.performance?.overallScore || 0)}/100
                    </div>
                    <Progress value={performance?.performance?.overallScore || 0} className="mt-2" />
                  </CardContent>
                </Card>

                {/* Current Status */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Status</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      {settings?.settings?.autoTrading ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Play className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          <Pause className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Risk Level: {settings?.settings?.riskLevel || 'Unknown'}
                    </p>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      onClick={() => generateSignalMutation.mutate()} 
                      disabled={generateSignalMutation.isPending}
                      className="w-full"
                      size="sm"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Signal
                    </Button>
                    <Button 
                      onClick={() => autoOptimizeMutation.mutate()} 
                      disabled={autoOptimizeMutation.isPending}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Auto-Optimize
                    </Button>
                    <Button 
                      onClick={() => emergencyStopMutation.mutate('Manual emergency stop')} 
                      disabled={emergencyStopMutation.isPending}
                      variant="destructive"
                      className="w-full"
                      size="sm"
                    >
                      <StopCircle className="w-4 h-4 mr-2" />
                      Emergency Stop
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Recent Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs">Daily P&L:</span>
                        <span className={`text-xs font-medium ${getProfitLossColor(profitLoss?.profitLoss?.dailyProfitLoss || 0)}`}>
                          {formatCurrency(profitLoss?.profitLoss?.dailyProfitLoss || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs">Weekly P&L:</span>
                        <span className={`text-xs font-medium ${getProfitLossColor(profitLoss?.profitLoss?.weeklyProfitLoss || 0)}`}>
                          {formatCurrency(profitLoss?.profitLoss?.weeklyProfitLoss || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs">Consecutive:</span>
                        <span className="text-xs font-medium">
                          {profitLoss?.profitLoss?.consecutiveWins > 0 
                            ? `${profitLoss.profitLoss.consecutiveWins} wins` 
                            : `${profitLoss?.profitLoss?.consecutiveLosses || 0} losses`}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="p-3 sm:p-6 bg-black">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Maibot - Free Tier Settings */}
                {isMaibot && (
                  <Card className="col-span-full border-blue-500/30 bg-gradient-to-br from-blue-950/50 to-slate-900/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        🎓 Maibot Learning Assistant Settings
                        <span className="text-blue-400">📚</span>
                      </CardTitle>
                      <CardDescription className="text-slate-300">Free tier trading education and manual approval settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="learningMode" className="text-white">Learning Mode</Label>
                          <Select defaultValue="educational">
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="educational">Educational Only</SelectItem>
                              <SelectItem value="simulation">Paper Trading</SelectItem>
                              <SelectItem value="guided">Guided Practice</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxPositionSize" className="text-white">Max Position Size</Label>
                          <Input
                            type="number"
                            step="0.001"
                            max="0.01"
                            defaultValue="0.005"
                            className="bg-slate-800 border-slate-600 text-white"
                            placeholder="0.005 ETH"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="approvalRequired" className="text-white">Manual Approval</Label>
                          <div className="flex items-center space-x-2">
                            <Switch defaultChecked />
                            <span className="text-slate-300 text-sm">Required for all trades</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* WaidBot α - Basic ETH Uptrend */}
                {isWaidBot && (
                  <Card className="col-span-full border-green-500/30 bg-gradient-to-br from-green-950/50 to-slate-900/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        📈 WaidBot α Uptrend Specialist Settings
                        <span className="text-green-400">⬆️</span>
                      </CardTitle>
                      <CardDescription className="text-slate-300">ETH uptrend-only trading configuration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="uptrendConfidence" className="text-white">Uptrend Confidence %</Label>
                          <Input
                            type="number"
                            min="60"
                            max="95"
                            defaultValue="75"
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="trendTimeframe" className="text-white">Trend Timeframe</Label>
                          <Select defaultValue="4h">
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="1h">1 Hour</SelectItem>
                              <SelectItem value="4h">4 Hours</SelectItem>
                              <SelectItem value="1d">1 Day</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stopLoss" className="text-white">Stop Loss %</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            step="0.1"
                            defaultValue="3.5"
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="takeProfit" className="text-white">Take Profit %</Label>
                          <Input
                            type="number"
                            min="2"
                            max="20"
                            step="0.1"
                            defaultValue="8.0"
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* WaidBot Pro β - Bidirectional Trading */}
                {isWaidBotPro && (
                  <Card className="col-span-full border-purple-500/30 bg-gradient-to-br from-purple-950/50 to-slate-900/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        ⚡ WaidBot Pro β Advanced Settings
                        <span className="text-purple-400">🔄</span>
                      </CardTitle>
                      <CardDescription className="text-slate-300">Bidirectional KonsAi trading configuration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tradingDirection" className="text-white">Trading Direction</Label>
                          <Select defaultValue="bidirectional">
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="long_only">Long Only</SelectItem>
                              <SelectItem value="short_only">Short Only</SelectItem>
                              <SelectItem value="bidirectional">Bidirectional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="konsaiSignals" className="text-white">KonsAi Signal Strength</Label>
                          <Select defaultValue="medium">
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="low">Conservative</SelectItem>
                              <SelectItem value="medium">Balanced</SelectItem>
                              <SelectItem value="high">Aggressive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="leverageMultiplier" className="text-white">Leverage Multiplier</Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            defaultValue="2.0"
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="riskPerTrade" className="text-white">Risk Per Trade %</Label>
                          <Input
                            type="number"
                            min="0.5"
                            max="5"
                            step="0.1"
                            defaultValue="2.0"
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Autonomous Trader γ - Advanced Autonomous */}
                {isAutonomous && (
                  <Card className="col-span-full border-orange-500/30 bg-gradient-to-br from-orange-950/50 to-slate-900/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        🤖 Autonomous Trader γ Settings
                        <span className="text-orange-400">🧠</span>
                      </CardTitle>
                      <CardDescription className="text-slate-300">Advanced autonomous trading configuration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="autonomyLevel" className="text-white">Autonomy Level</Label>
                          <Select defaultValue="semi_autonomous">
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="manual">Manual Approval</SelectItem>
                              <SelectItem value="semi_autonomous">Semi-Autonomous</SelectItem>
                              <SelectItem value="full_autonomous">Full Autonomous</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="aiModelVersion" className="text-white">AI Model Version</Label>
                          <Select defaultValue="v3_enhanced">
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="v2_stable">V2 Stable</SelectItem>
                              <SelectItem value="v3_enhanced">V3 Enhanced</SelectItem>
                              <SelectItem value="v4_experimental">V4 Experimental</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxConcurrentTrades" className="text-white">Max Concurrent Trades</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            defaultValue="3"
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="riskTolerance" className="text-white">Risk Tolerance</Label>
                          <Select defaultValue="moderate">
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="conservative">Conservative</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="aggressive">Aggressive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Full Engine Ω - Complete System */}
                {isFullEngine && (
                  <Card className="col-span-full border-cyan-500/30 bg-gradient-to-br from-cyan-950/50 to-slate-900/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        🌟 Full Engine Ω Master Control
                        <span className="text-cyan-400">∞</span>
                      </CardTitle>
                      <CardDescription className="text-slate-300">Complete system orchestration and master settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="orchestrationMode" className="text-white">Orchestration Mode</Label>
                          <Select defaultValue="intelligent">
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="manual">Manual Control</SelectItem>
                              <SelectItem value="intelligent">Intelligent Auto</SelectItem>
                              <SelectItem value="master">Master Override</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="botSyncEnabled" className="text-white">Bot Synchronization</Label>
                          <div className="flex items-center space-x-2">
                            <Switch defaultChecked />
                            <span className="text-slate-300 text-sm">Sync all bots</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="globalRiskLimit" className="text-white">Global Risk Limit %</Label>
                          <Input
                            type="number"
                            min="1"
                            max="15"
                            step="0.5"
                            defaultValue="5.0"
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="diversificationRules" className="text-white">Diversification</Label>
                          <Select defaultValue="advanced">
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="dynamic">Dynamic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyProtocol" className="text-white">Emergency Protocol</Label>
                          <Select defaultValue="conservative">
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="conservative">Conservative</SelectItem>
                              <SelectItem value="balanced">Balanced</SelectItem>
                              <SelectItem value="aggressive">Aggressive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Nwaora Chigozie ε - Guardian System */}
                {isNwaoraChigozie && (
                  <Card className="col-span-full border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 to-slate-900/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        🛡️ Nwaora Chigozie ε Guardian Settings
                        <span className="text-emerald-400">👁️</span>
                      </CardTitle>
                      <CardDescription className="text-slate-300">Guardian backup and protection system configuration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="guardianMode" className="text-white">Guardian Mode</Label>
                          <Select defaultValue="active_protection">
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="passive">Passive Monitoring</SelectItem>
                              <SelectItem value="active_protection">Active Protection</SelectItem>
                              <SelectItem value="guardian_override">Guardian Override</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="backupFrequency" className="text-white">Backup Frequency</Label>
                          <Select defaultValue="real_time">
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="real_time">Real-time</SelectItem>
                              <SelectItem value="every_trade">Every Trade</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="protectedValue" className="text-white">Protected Value $</Label>
                          <Input
                            type="number"
                            min="1000"
                            max="1000000"
                            step="1000"
                            defaultValue="85200"
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="interventionThreshold" className="text-white">Intervention Threshold %</Label>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            step="0.5"
                            defaultValue="5.0"
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <Switch defaultChecked />
                          <span className="text-slate-300 text-sm">Emergency Backup Protocol</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch defaultChecked />
                          <span className="text-slate-300 text-sm">Automatic Recovery</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch />
                          <span className="text-slate-300 text-sm">Guardian Notifications</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* SmaiChinnikstah - Additional SmaiChinnikstah settings if it's a separate bot */}
                {isSmaiChinnikstah && (
                  <Card className="col-span-full border-pink-500/30 bg-gradient-to-br from-pink-950/50 to-slate-900/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        💎 SmaiChinnikstah Divine Intelligence
                        <span className="text-pink-400">✨</span>
                      </CardTitle>
                      <CardDescription className="text-slate-300">Advanced cosmic and metaphysical trading configuration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="divineConnection" className="text-white">Divine Connection Level</Label>
                          <Select defaultValue="cosmic">
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="earthly">Earthly (Basic)</SelectItem>
                              <SelectItem value="spiritual">Spiritual (Enhanced)</SelectItem>
                              <SelectItem value="cosmic">Cosmic (Advanced)</SelectItem>
                              <SelectItem value="universal">Universal (Master)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="energyAlignment" className="text-white">Energy Alignment</Label>
                          <Select defaultValue="harmony">
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="harmony">Harmony (Balanced)</SelectItem>
                              <SelectItem value="power">Power (Aggressive)</SelectItem>
                              <SelectItem value="wisdom">Wisdom (Conservative)</SelectItem>
                              <SelectItem value="transcendence">Transcendence (Ultimate)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cosmicFrequency" className="text-white">Cosmic Frequency Hz</Label>
                          <Input
                            type="number"
                            min="432"
                            max="963"
                            defaultValue="528"
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="intuitionStrength" className="text-white">Intuition Strength %</Label>
                          <Input
                            type="number"
                            min="50"
                            max="100"
                            step="5"
                            defaultValue="85"
                            className="bg-slate-800 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <Switch defaultChecked />
                          <span className="text-slate-300 text-sm">Mystical Vision Mode</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch defaultChecked />
                          <span className="text-slate-300 text-sm">Crystal Energy Amplification</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch />
                          <span className="text-slate-300 text-sm">Celestial Event Sync</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Basic Settings - Updated with black theme */}
                <Card className="border-slate-700 bg-slate-900/50">
                  <CardHeader>
                    <CardTitle className="text-white text-sm sm:text-base">
                      {isNwaoraChigozie ? "Earthly Trading Parameters" : "Basic Settings"}
                    </CardTitle>
                    <CardDescription className="text-slate-300 text-xs sm:text-sm">Core trading parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="autoTrading" className="text-white">Auto Trading</Label>
                      <Switch
                        id="autoTrading"
                        checked={settings?.settings?.autoTrading || false}
                        onCheckedChange={(checked) => handleSettingUpdate('autoTrading', checked)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="riskLevel" className="text-white">Risk Level</Label>
                      <Select 
                        value={settings?.settings?.riskLevel || 'moderate'}
                        onValueChange={(value) => handleSettingUpdate('riskLevel', value)}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="conservative">Conservative</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="aggressive">Aggressive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxPositionSize" className="text-white">Max Position Size (%)</Label>
                      <Input
                        id="maxPositionSize"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={settings?.settings?.maxPositionSize || 0.05}
                        onChange={(e) => handleSettingUpdate('maxPositionSize', parseFloat(e.target.value))}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stopLoss" className="text-white">Stop Loss (%)</Label>
                        <Input
                          id="stopLoss"
                          type="number"
                          value={settings?.settings?.stopLoss || -5}
                          onChange={(e) => handleSettingUpdate('stopLoss', parseFloat(e.target.value))}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="takeProfit" className="text-white">Take Profit (%)</Label>
                        <Input
                          id="takeProfit"
                          type="number"
                          value={settings?.settings?.takeProfit || 10}
                          onChange={(e) => handleSettingUpdate('takeProfit', parseFloat(e.target.value))}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Settings - Updated with black theme */}
                <Card className="border-slate-700 bg-slate-900/50">
                  <CardHeader>
                    <CardTitle className="text-white text-sm sm:text-base">
                      {isNwaoraChigozie ? "Divine AI Configuration" : "Advanced Settings"}
                    </CardTitle>
                    <CardDescription className="text-slate-300 text-xs sm:text-sm">
                      {isNwaoraChigozie ? "Spiritual AI and cosmic strategy configuration" : "AI and strategy configuration"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="activeStrategy" className="text-white">Active Strategy</Label>
                      <Select 
                        value={settings?.settings?.activeStrategy || 'trend_following'}
                        onValueChange={(value) => handleSettingUpdate('activeStrategy', value)}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {settings?.settings?.strategies?.map((strategy: string) => (
                            <SelectItem key={strategy} value={strategy}>
                              {strategy.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="activeTimeframe" className="text-white">Active Timeframe</Label>
                      <Select 
                        value={settings?.settings?.activeTimeframe || '15m'}
                        onValueChange={(value) => handleSettingUpdate('activeTimeframe', value)}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {settings?.settings?.timeframes?.map((timeframe: string) => (
                            <SelectItem key={timeframe} value={timeframe}>
                              {timeframe}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxDailyTrades" className="text-white">Max Daily Trades</Label>
                      <Input
                        id="maxDailyTrades"
                        type="number"
                        min="1"
                        value={settings?.settings?.maxDailyTrades || 10}
                        onChange={(e) => handleSettingUpdate('maxDailyTrades', parseInt(e.target.value))}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Controls */}
                <Card className="border-slate-700 bg-slate-900/50">
                  <CardHeader>
                    <CardTitle className="text-white">Emergency Controls</CardTitle>
                    <CardDescription className="text-slate-300">Safety and risk management</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyStopEnabled" className="text-white">Emergency Stop Enabled</Label>
                      <Switch
                        id="emergencyStopEnabled"
                        checked={settings?.settings?.emergencyStop?.enabled || false}
                        onCheckedChange={(checked) => handleSettingUpdate('emergencyStop', {
                          ...settings?.settings?.emergencyStop,
                          enabled: checked
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxDailyLoss" className="text-white">Max Daily Loss ($)</Label>
                      <Input
                        id="maxDailyLoss"
                        type="number"
                        value={settings?.settings?.emergencyStop?.maxDailyLoss || -500}
                        onChange={(e) => handleSettingUpdate('emergencyStop', {
                          ...settings?.settings?.emergencyStop,
                          maxDailyLoss: parseFloat(e.target.value)
                        })}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consecutiveLossLimit" className="text-white">Consecutive Loss Limit</Label>
                      <Input
                        id="consecutiveLossLimit"
                        type="number"
                        min="1"
                        value={settings?.settings?.emergencyStop?.consecutiveLossLimit || 5}
                        onChange={(e) => handleSettingUpdate('emergencyStop', {
                          ...settings?.settings?.emergencyStop,
                          consecutiveLossLimit: parseInt(e.target.value)
                        })}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="border-slate-700 bg-slate-900/50">
                  <CardHeader>
                    <CardTitle className="text-white">Notifications</CardTitle>
                    <CardDescription className="text-slate-300">Alert preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailNotifications" className="text-white">Email Notifications</Label>
                      <Switch
                        id="emailNotifications"
                        checked={settings?.settings?.notifications?.email || false}
                        onCheckedChange={(checked) => handleSettingUpdate('notifications', {
                          ...settings?.settings?.notifications,
                          email: checked
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inAppNotifications" className="text-white">In-App Notifications</Label>
                      <Switch
                        id="inAppNotifications"
                        checked={settings?.settings?.notifications?.inApp !== false}
                        onCheckedChange={(checked) => handleSettingUpdate('notifications', {
                          ...settings?.settings?.notifications,
                          inApp: checked
                        })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="profitThreshold" className="text-white">Profit Alert ($)</Label>
                        <Input
                          id="profitThreshold"
                          type="number"
                          value={settings?.settings?.notifications?.profitThreshold || 100}
                          onChange={(e) => handleSettingUpdate('notifications', {
                            ...settings?.settings?.notifications,
                            profitThreshold: parseFloat(e.target.value)
                          })}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lossThreshold" className="text-white">Loss Alert ($)</Label>
                        <Input
                          id="lossThreshold"
                          type="number"
                          value={settings?.settings?.notifications?.lossThreshold || -50}
                          onChange={(e) => handleSettingUpdate('notifications', {
                            ...settings?.settings?.notifications,
                            lossThreshold: parseFloat(e.target.value)
                          })}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="p-3 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
                {/* Performance Metrics */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-base">Performance Metrics</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Comprehensive performance analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                      {['efficiency', 'adaptability', 'consistency', 'riskManagement', 'learningProgress'].map((metric) => (
                        <div key={metric} className="text-center">
                          <div className={`text-2xl font-bold ${getPerformanceColor(performance?.performance?.[metric] || 0)}`}>
                            {Math.round(performance?.performance?.[metric] || 0)}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {metric.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <Progress value={performance?.performance?.[metric] || 0} className="mt-1 h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths & Weaknesses */}
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-green-600 mb-2">Strengths</h4>
                      <div className="space-y-1">
                        {performance?.performance?.strengths?.map((strength: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-red-600 mb-2">Weaknesses</h4>
                      <div className="space-y-1">
                        {performance?.performance?.weaknesses?.map((weakness: string, index: number) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            <XCircle className="w-3 h-3 mr-1" />
                            {weakness}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed P&L Stats */}
                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle>Detailed Profit & Loss Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency(profitLoss?.profitLoss?.totalProfit || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Profit</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-red-600">
                          {formatCurrency(profitLoss?.profitLoss?.totalLoss || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Loss</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {(profitLoss?.profitLoss?.profitFactor || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Profit Factor</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {formatCurrency(profitLoss?.profitLoss?.maxDrawdown || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Max Drawdown</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {formatCurrency(profitLoss?.profitLoss?.averageWin || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Win</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {formatCurrency(profitLoss?.profitLoss?.averageLoss || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Loss</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {formatCurrency(profitLoss?.profitLoss?.largestWin || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Largest Win</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {formatCurrency(profitLoss?.profitLoss?.largestLoss || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Largest Loss</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Signals Tab */}
            <TabsContent value="signals" className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Trading Signals</CardTitle>
                  <CardDescription>Latest AI-generated trading signals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {signals?.signals?.slice(0, 10).map((signal: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge className={`${
                              signal.action === 'BUY' ? 'bg-green-100 text-green-800' :
                              signal.action === 'SELL' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {signal.action}
                            </Badge>
                            <span className="font-medium">{signal.symbol}</span>
                            <Badge variant="outline">{signal.strategy}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(signal.timestamp).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Confidence:</span>
                            <div className="font-medium">{formatPercentage(signal.confidence * 100)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Strength:</span>
                            <div className="font-medium">{signal.strength}/100</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Risk Level:</span>
                            <div className="font-medium">{signal.riskLevel}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Target:</span>
                            <div className="font-medium">{formatCurrency(signal.targetPrice)}</div>
                          </div>
                        </div>

                        {signal.reasoning?.length > 0 && (
                          <div className="mt-2">
                            <span className="text-muted-foreground text-sm">Reasoning:</span>
                            <ul className="text-sm mt-1 space-y-1">
                              {signal.reasoning.map((reason: string, reasonIndex: number) => (
                                <li key={reasonIndex} className="flex items-center">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trades Tab */}
            <TabsContent value="trades" className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Trade History</CardTitle>
                  <CardDescription>Recent trading activity and results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trades?.trades?.slice(0, 15).map((trade: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge className={`${
                              trade.action === 'BUY' ? 'bg-green-100 text-green-800' :
                              trade.action === 'SELL' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {trade.action}
                            </Badge>
                            <span className="font-medium">{trade.symbol}</span>
                            <Badge className={trade.isWin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {trade.isWin ? 'WIN' : 'LOSS'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(trade.timestamp).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Entry Price:</span>
                            <div className="font-medium">{formatCurrency(trade.entryPrice)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Quantity:</span>
                            <div className="font-medium">{trade.quantity}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Net Result:</span>
                            <div className={`font-medium ${getProfitLossColor(trade.netResult)}`}>
                              {formatCurrency(trade.netResult)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Strategy:</span>
                            <div className="font-medium">{trade.strategy}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Confidence:</span>
                            <div className="font-medium">{formatPercentage(trade.confidence * 100)}</div>
                          </div>
                        </div>

                        {trade.reason && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            <span className="font-medium">Reason:</span> {trade.reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Analysis</CardTitle>
                    <CardDescription>Real-time bot intelligence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis?.analysis?.currentStatus && (
                        <div>
                          <h4 className="font-medium mb-2">Current Status</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Performance:</span>
                              <span className={getPerformanceColor(analysis.analysis.currentStatus.performance)}>
                                {Math.round(analysis.analysis.currentStatus.performance)}/100
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Profitability:</span>
                              <span className={analysis.analysis.currentStatus.profitability ? 'text-green-600' : 'text-red-600'}>
                                {analysis.analysis.currentStatus.profitability ? 'Profitable' : 'Not Profitable'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Risk Level:</span>
                              <span>{analysis.analysis.currentStatus.riskLevel}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {analysis?.analysis?.insights?.recommendations?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Recommendations</h4>
                          <ul className="space-y-2 text-sm">
                            {analysis.analysis.insights.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest signals and trades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis?.analysis?.recentActivity?.signals?.slice(0, 3).map((signal: any, index: number) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-3">
                          <div className="flex items-center justify-between">
                            <Badge className="text-xs">{signal.action}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(signal.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm mt-1">
                            {signal.symbol} - Confidence: {formatPercentage(signal.confidence * 100)}
                          </div>
                        </div>
                      ))}

                      {analysis?.analysis?.recentActivity?.trades?.slice(0, 3).map((trade: any, index: number) => (
                        <div key={index} className={`border-l-4 ${trade.isWin ? 'border-green-500' : 'border-red-500'} pl-3`}>
                          <div className="flex items-center justify-between">
                            <Badge className={trade.isWin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {trade.isWin ? 'WIN' : 'LOSS'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(trade.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm mt-1">
                            {trade.symbol} - {formatCurrency(trade.netResult)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}