import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Play, 
  Square, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Target,
  Activity,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Zap,
  Brain,
  Eye,
  ArrowUpDown
} from 'lucide-react';

interface EngineStatus {
  is_active: boolean;
  active_trades: ActiveTrade[];
  total_trades_today: number;
  daily_pnl_pct: number;
  daily_pnl_usd: number;
  current_strategy: string;
  last_tuning: number;
  next_evaluation: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  emergency_stop_active: boolean;
}

interface ActiveTrade {
  trade_id: string;
  entry_price: number;
  entry_time: number;
  pair: string;
  position_type: 'LONG' | 'SHORT';
  amount: number;
  current_price?: number;
  current_pnl_pct?: number;
  stop_loss_price?: number;
  strategy_name: string;
  confidence_score: number;
}

interface PerformanceAnalytics {
  total_trades: number;
  winning_trades: number;
  win_rate: number;
  total_return_pct: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  avg_trade_duration_minutes: number;
  profit_factor: number;
}

interface StrategyPerformance {
  strategy_name: string;
  metrics: PerformanceAnalytics;
  performance_trend: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'UNKNOWN';
  confidence_score: number;
  recommendation: 'INCREASE_ALLOCATION' | 'DECREASE_ALLOCATION' | 'MAINTAIN' | 'PAUSE';
}

interface StopLossState {
  entry_price: number | null;
  trailing_sl: number | null;
  highest_price: number | null;
  lowest_price: number | null;
  position_type: 'LONG' | 'SHORT' | null;
  sl_triggered: boolean;
  sl_history: Array<{
    price: number;
    timestamp: number;
    reason: string;
  }>;
}

export default function WaidesFullEngine() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [tradeForm, setTradeForm] = useState({
    action: 'BUY',
    confidence: '75',
    price: '',
    reasoning: '',
    strategy_source: 'MANUAL',
    risk_assessment: 'Standard risk'
  });
  const queryClient = useQueryClient();

  // Queries
  const { data: engineStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/full-engine/status'],
    refetchInterval: 3000
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/full-engine/analytics'],
    refetchInterval: 10000
  });

  const { data: strategyPerformances, isLoading: strategiesLoading } = useQuery({
    queryKey: ['/api/performance-tracker/strategies'],
    refetchInterval: 15000
  });

  const { data: stopLossState, isLoading: stopLossLoading } = useQuery({
    queryKey: ['/api/stop-loss/state'],
    refetchInterval: 5000
  });

  // Mutations
  const startEngine = useMutation({
    mutationFn: () => apiRequest('/api/full-engine/start', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/status'] });
    }
  });

  const stopEngine = useMutation({
    mutationFn: () => apiRequest('/api/full-engine/stop', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/status'] });
    }
  });

  const executeTrade = useMutation({
    mutationFn: (tradeData: any) => apiRequest('/api/full-engine/execute-trade', {
      method: 'POST',
      body: JSON.stringify(tradeData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/analytics'] });
      setTradeForm({
        action: 'BUY',
        confidence: '75',
        price: '',
        reasoning: '',
        strategy_source: 'MANUAL',
        risk_assessment: 'Standard risk'
      });
    }
  });

  const closeAllTrades = useMutation({
    mutationFn: () => apiRequest('/api/full-engine/close-all-trades', {
      method: 'POST',
      body: JSON.stringify({ reason: 'MANUAL_EMERGENCY_CLOSE' })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/status'] });
    }
  });

  const updateConfig = useMutation({
    mutationFn: (config: any) => apiRequest('/api/full-engine/config', {
      method: 'POST',
      body: JSON.stringify(config)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/status'] });
    }
  });

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HIGH': return 'bg-orange-500';
      case 'CRITICAL': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'DECLINING': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'STABLE': return <Activity className="w-4 h-4 text-blue-500" />;
      default: return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeForm.price) return;
    
    executeTrade.mutate({
      ...tradeForm,
      confidence: parseFloat(tradeForm.confidence),
      price: parseFloat(tradeForm.price)
    });
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Zap className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-sm text-muted-foreground">Loading Waides Full Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-500" />
            Waides Full Engine
          </h1>
          <p className="text-sm text-muted-foreground">
            Smart Risk Management with Dynamic Stop-Loss & Auto-Tuning
          </p>
        </div>
        <div className="flex items-center gap-2">
          {engineStatus?.engine_status?.is_active ? (
            <Button
              onClick={() => stopEngine.mutate()}
              variant="destructive"
              size="sm"
              disabled={stopEngine.isPending}
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Engine
            </Button>
          ) : (
            <Button
              onClick={() => startEngine.mutate()}
              size="sm"
              disabled={startEngine.isPending}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Engine
            </Button>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold">
                  {engineStatus?.engine_status?.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                engineStatus?.engine_status?.is_active ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Trades</p>
                <p className="font-semibold">
                  {engineStatus?.engine_status?.active_trades?.length || 0}
                </p>
              </div>
              <Target className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily P&L</p>
                <p className={`font-semibold ${
                  (engineStatus?.engine_status?.daily_pnl_pct || 0) >= 0 
                    ? 'text-green-500' : 'text-red-500'
                }`}>
                  {(engineStatus?.engine_status?.daily_pnl_pct || 0).toFixed(2)}%
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <Badge className={getRiskLevelColor(engineStatus?.engine_status?.risk_level || 'LOW')}>
                  {engineStatus?.engine_status?.risk_level || 'LOW'}
                </Badge>
              </div>
              <Shield className="w-5 h-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trades">Active Trades</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="stop-loss">Stop-Loss</TabsTrigger>
          <TabsTrigger value="manual">Manual Trade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engine Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Engine Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Trades Today:</span>
                  <span className="font-semibold">
                    {engineStatus?.engine_status?.total_trades_today || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Strategy:</span>
                  <span className="font-semibold">
                    {engineStatus?.engine_status?.current_strategy || 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Tuning:</span>
                  <span className="font-semibold">
                    {engineStatus?.engine_status?.last_tuning 
                      ? new Date(engineStatus.engine_status.last_tuning).toLocaleTimeString()
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Emergency Stop:</span>
                  <Badge variant={engineStatus?.engine_status?.emergency_stop_active ? 'destructive' : 'secondary'}>
                    {engineStatus?.engine_status?.emergency_stop_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.performance_analytics ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Win Rate:</span>
                      <span className="font-semibold">
                        {((analytics.performance_analytics.win_rate || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Return:</span>
                      <span className={`font-semibold ${
                        (analytics.performance_analytics.total_return_pct || 0) >= 0 
                          ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {(analytics.performance_analytics.total_return_pct || 0).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sharpe Ratio:</span>
                      <span className="font-semibold">
                        {analytics.performance_analytics.sharpe_ratio.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Max Drawdown:</span>
                      <span className="text-red-500 font-semibold">
                        {analytics.performance_analytics.max_drawdown_pct.toFixed(2)}%
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No performance data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Emergency Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Emergency Controls
              </CardTitle>
              <CardDescription>
                Use these controls for emergency situations only
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => closeAllTrades.mutate()}
                variant="destructive"
                disabled={closeAllTrades.isPending || !engineStatus?.engine_status?.active_trades?.length}
              >
                <Square className="w-4 h-4 mr-2" />
                Close All Trades
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Trades</CardTitle>
              <CardDescription>
                Currently open positions managed by the Full Engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              {engineStatus?.engine_status?.active_trades?.length ? (
                <div className="space-y-4">
                  {engineStatus.engine_status.active_trades.map((trade) => (
                    <div key={trade.trade_id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Trade ID</p>
                          <p className="font-mono text-sm">{trade.trade_id.slice(0, 8)}...</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Position</p>
                          <Badge variant={trade.position_type === 'LONG' ? 'default' : 'secondary'}>
                            {trade.position_type}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Entry Price</p>
                          <p className="font-semibold">${trade.entry_price.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">P&L</p>
                          <p className={`font-semibold ${
                            (trade.current_pnl_pct || 0) >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {(trade.current_pnl_pct || 0).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Strategy: </span>
                          <span>{trade.strategy_name}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence: </span>
                          <span>{(trade.confidence_score * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Stop Loss: </span>
                          <span>${trade.stop_loss_price?.toFixed(2) || 'None'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No active trades</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Performance</CardTitle>
              <CardDescription>
                Performance metrics for all active strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {strategyPerformances?.strategy_performances?.length ? (
                <div className="space-y-4">
                  {strategyPerformances.strategy_performances.map((strategy: StrategyPerformance) => (
                    <div key={strategy.strategy_name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{strategy.strategy_name}</h3>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(strategy.performance_trend)}
                          <Badge variant={
                            strategy.recommendation === 'INCREASE_ALLOCATION' ? 'default' :
                            strategy.recommendation === 'DECREASE_ALLOCATION' ? 'destructive' :
                            strategy.recommendation === 'PAUSE' ? 'secondary' : 'outline'
                          }>
                            {strategy.recommendation.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Win Rate</p>
                          <p className="font-semibold">{(strategy.metrics.win_rate * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Trades</p>
                          <p className="font-semibold">{strategy.metrics.total_trades}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Profit Factor</p>
                          <p className="font-semibold">{strategy.metrics.profit_factor.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Confidence</p>
                          <p className="font-semibold">{(strategy.confidence_score * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No strategy performance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stop-loss" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Stop-Loss Management
              </CardTitle>
              <CardDescription>
                Dynamic stop-loss configuration and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stopLossState?.stop_loss_state ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Entry Price</p>
                      <p className="font-semibold">
                        {stopLossState.stop_loss_state.entry_price 
                          ? `$${stopLossState.stop_loss_state.entry_price.toFixed(2)}`
                          : 'None'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Trailing SL</p>
                      <p className="font-semibold">
                        {stopLossState.stop_loss_state.trailing_sl 
                          ? `$${stopLossState.stop_loss_state.trailing_sl.toFixed(2)}`
                          : 'None'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Position Type</p>
                      <p className="font-semibold">
                        {stopLossState.stop_loss_state.position_type || 'None'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">SL Triggered</p>
                      <Badge variant={stopLossState.stop_loss_state.sl_triggered ? 'destructive' : 'secondary'}>
                        {stopLossState.stop_loss_state.sl_triggered ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  {stopLossState.configuration && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Configuration</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Initial SL %</p>
                            <p className="font-semibold">{(stopLossState.configuration.initial_sl_pct * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Trail %</p>
                            <p className="font-semibold">{(stopLossState.configuration.trail_pct * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Max SL %</p>
                            <p className="font-semibold">{(stopLossState.configuration.max_sl_pct * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Min SL %</p>
                            <p className="font-semibold">{(stopLossState.configuration.min_sl_pct * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No stop-loss data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Trade Execution</CardTitle>
              <CardDescription>
                Execute trades manually through the Full Engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTradeSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="action">Action</Label>
                    <select
                      id="action"
                      value={tradeForm.action}
                      onChange={(e) => setTradeForm({ ...tradeForm, action: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                    >
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                      <option value="HOLD">HOLD</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="confidence">Confidence (%)</Label>
                    <Input
                      id="confidence"
                      type="number"
                      min="0"
                      max="100"
                      value={tradeForm.confidence}
                      onChange={(e) => setTradeForm({ ...tradeForm, confidence: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={tradeForm.price}
                      onChange={(e) => setTradeForm({ ...tradeForm, price: e.target.value })}
                      placeholder="Enter price"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="strategy_source">Strategy Source</Label>
                    <select
                      id="strategy_source"
                      value={tradeForm.strategy_source}
                      onChange={(e) => setTradeForm({ ...tradeForm, strategy_source: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                    >
                      <option value="MANUAL">Manual</option>
                      <option value="TECHNICAL">Technical Analysis</option>
                      <option value="FUNDAMENTAL">Fundamental</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reasoning">Reasoning</Label>
                  <Textarea
                    id="reasoning"
                    value={tradeForm.reasoning}
                    onChange={(e) => setTradeForm({ ...tradeForm, reasoning: e.target.value })}
                    placeholder="Explain the reasoning for this trade..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="risk_assessment">Risk Assessment</Label>
                  <Input
                    id="risk_assessment"
                    value={tradeForm.risk_assessment}
                    onChange={(e) => setTradeForm({ ...tradeForm, risk_assessment: e.target.value })}
                    placeholder="Risk assessment description"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={executeTrade.isPending || !tradeForm.price}
                  className="w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {executeTrade.isPending ? 'Executing...' : 'Execute Trade'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}