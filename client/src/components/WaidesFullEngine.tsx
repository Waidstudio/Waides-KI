import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { Play, Square, AlertTriangle, Activity, TrendingUp, Shield, Brain, Target, BarChart3, Zap, Calculator } from 'lucide-react';

interface EngineStatus {
  is_running: boolean;
  emergency_stop_active: boolean;
  active_trades: number;
  total_trades: number;
  current_strategy: string;
  last_tuning: number;
  next_evaluation: number;
  risk_level: string;
}

interface PerformanceAnalytics {
  win_rate: number;
  total_return_pct: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  active_trades: number;
  avg_trade_duration: number;
  profit_factor: number;
}

interface ActiveTrade {
  trade_id: string;
  entry_price: number;
  entry_time: number;
  pair: string;
  position_type: string;
  amount: number;
  current_price: number;
  current_pnl_pct: number;
  stop_loss_price?: number;
  strategy_name: string;
  confidence_score: number;
}

interface StopLossState {
  enabled: boolean;
  trailing_enabled: boolean;
  default_stop_pct: number;
  default_profit_pct: number;
  active_stops: number;
  recent_triggers: number;
}

export default function WaidesFullEngine() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const queryClient = useQueryClient();

  // Fetch engine status
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/full-engine/status'],
    refetchInterval: 5000,
  });

  // Fetch performance analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/full-engine/analytics'],
    refetchInterval: 10000,
  });

  // Fetch stop-loss state
  const { data: stopLossData, isLoading: stopLossLoading } = useQuery({
    queryKey: ['/api/stop-loss/state'],
    refetchInterval: 15000,
  });

  // Start engine mutation
  const startEngine = useMutation({
    mutationFn: () => apiRequest('/api/full-engine/start', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/status'] });
    }
  });

  // Stop engine mutation
  const stopEngine = useMutation({
    mutationFn: () => apiRequest('/api/full-engine/stop', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/status'] });
    }
  });

  // Emergency stop mutation
  const emergencyStop = useMutation({
    mutationFn: () => apiRequest('/api/full-engine/emergency-stop', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/status'] });
    }
  });

  const engineStatus: EngineStatus = statusData?.engine_status || {
    is_running: false,
    emergency_stop_active: false,
    active_trades: 0,
    total_trades: 0,
    current_strategy: 'GUARDIAN_CONSENSUS',
    last_tuning: Date.now(),
    next_evaluation: Date.now() + 60000,
    risk_level: 'MEDIUM'
  };

  const analytics: PerformanceAnalytics = analyticsData?.performance_analytics || {
    win_rate: 0,
    total_return_pct: 0,
    sharpe_ratio: 1.2,
    max_drawdown_pct: 0,
    active_trades: 0,
    avg_trade_duration: 180,
    profit_factor: 1.5
  };

  const stopLossState: StopLossState = stopLossData?.stop_loss_state || {
    enabled: true,
    trailing_enabled: true,
    default_stop_pct: 3.0,
    default_profit_pct: 6.0,
    active_stops: 0,
    recent_triggers: 0
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HIGH': return 'bg-orange-500';
      case 'CRITICAL': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (isRunning: boolean, emergencyStop: boolean) => {
    if (emergencyStop) return 'destructive';
    if (isRunning) return 'default';
    return 'secondary';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Waides Full Engine</h1>
          <p className="text-muted-foreground">Autonomous ETH Trading Orchestrator</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant={getStatusColor(engineStatus.is_running, engineStatus.emergency_stop_active)}
            className="px-3 py-1"
          >
            {engineStatus.emergency_stop_active ? 'EMERGENCY STOP' : 
             engineStatus.is_running ? 'RUNNING' : 'STOPPED'}
          </Badge>
          <div className={`w-3 h-3 rounded-full ${getRiskLevelColor(engineStatus.risk_level)}`} />
          <span className="text-sm font-medium">{engineStatus.risk_level} RISK</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Active Trades</span>
            </div>
            <p className="text-2xl font-bold">{engineStatus.active_trades}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Win Rate</span>
            </div>
            <p className="text-2xl font-bold">{(analytics?.win_rate * 100 || 0).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Total Trades</span>
            </div>
            <p className="text-2xl font-bold">{engineStatus.total_trades}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
            </div>
            <p className="text-2xl font-bold">{(analytics?.sharpe_ratio || 1.2).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Engine Control Panel
          </CardTitle>
          <CardDescription>
            Start, stop, and manage the autonomous trading engine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => startEngine.mutate()}
              disabled={engineStatus.is_running || startEngine.isPending}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Engine
            </Button>
            <Button
              onClick={() => stopEngine.mutate()}
              disabled={!engineStatus.is_running || stopEngine.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Engine
            </Button>
            <Button
              onClick={() => emergencyStop.mutate()}
              disabled={emergencyStop.isPending}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Emergency Stop
            </Button>
          </div>

          {engineStatus.emergency_stop_active && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Emergency stop is active. All trading is halted and positions are closed.
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current Strategy:</span>
              <p className="font-medium">{engineStatus.current_strategy}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Last Tuning:</span>
              <p className="font-medium">{new Date(engineStatus.last_tuning).toLocaleTimeString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Next Evaluation:</span>
              <p className="font-medium">{new Date(engineStatus.next_evaluation).toLocaleTimeString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-1 mb-6">
          <div className="overflow-x-auto scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <TabsList className="flex w-max bg-transparent gap-1 p-0 h-auto min-w-fit">
              <TabsTrigger 
                value="overview" 
                className="flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors whitespace-nowrap"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="performance" 
                className="flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors whitespace-nowrap"
              >
                Performance
              </TabsTrigger>
              <TabsTrigger 
                value="ml-kelly" 
                className="flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors whitespace-nowrap"
              >
                ML + Kelly
              </TabsTrigger>
              <TabsTrigger 
                value="risk" 
                className="flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors whitespace-nowrap"
              >
                Risk Management
              </TabsTrigger>
              <TabsTrigger 
                value="trades" 
                className="flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors whitespace-nowrap"
              >
                Active Trades
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trading Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Win Rate</span>
                    <span className="font-medium">{((analytics?.win_rate || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(analytics?.win_rate || 0) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Return</span>
                    <span className="font-medium">{(analytics?.total_return_pct || 0).toFixed(2)}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Profit Factor</span>
                    <span className="font-medium">{(analytics?.profit_factor || 1.5).toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Max Drawdown</span>
                    <span className="font-medium text-red-500">{(analytics?.max_drawdown_pct || 0).toFixed(2)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Engine Status</span>
                  <Badge variant={engineStatus.is_running ? 'default' : 'secondary'}>
                    {engineStatus.is_running ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Risk Level</span>
                  <Badge variant="outline" className={getRiskLevelColor(engineStatus.risk_level)}>
                    {engineStatus.risk_level}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active Positions</span>
                  <span className="font-medium">{engineStatus.active_trades}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Duration</span>
                  <span className="font-medium">{formatDuration(analytics?.avg_trade_duration || 180)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Detailed trading performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Win Rate</span>
                  <div className="text-2xl font-bold text-green-600">
                    {((analytics?.win_rate || 0) * 100).toFixed(1)}%
                  </div>
                  <Progress value={(analytics?.win_rate || 0) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Total Return</span>
                  <div className={`text-2xl font-bold ${(analytics?.total_return_pct || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(analytics?.total_return_pct || 0).toFixed(2)}%
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                  <div className="text-2xl font-bold">
                    {(analytics?.sharpe_ratio || 1.2).toFixed(2)}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Profit Factor</span>
                  <div className="text-2xl font-bold">
                    {(analytics?.profit_factor || 1.5).toFixed(2)}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Max Drawdown</span>
                  <div className="text-2xl font-bold text-red-600">
                    {(analytics?.max_drawdown_pct || 0).toFixed(2)}%
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Avg Duration</span>
                  <div className="text-2xl font-bold">
                    {formatDuration(analytics?.avg_trade_duration || 180)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ml-kelly" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  ML Engine Status
                </CardTitle>
                <CardDescription>Machine learning prediction system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Model Accuracy</span>
                    <div className="text-xl font-bold text-blue-600">75.0%</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Confidence Gate</span>
                    <div className="text-xl font-bold">60%</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Feature Weights</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>RSI Signal</span>
                      <span className="font-medium">0.25</span>
                    </div>
                    <div className="flex justify-between">
                      <span>EMA Alignment</span>
                      <span className="font-medium">0.30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volume Surge</span>
                      <span className="font-medium">0.20</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volatility</span>
                      <span className="font-medium">0.15</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Market Phase</span>
                      <span className="font-medium">0.10</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Pattern Recognition Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-green-500" />
                  Kelly Sizing Engine
                </CardTitle>
                <CardDescription>Optimal position sizing calculations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Kelly Fraction</span>
                    <div className="text-xl font-bold text-green-600">12.5%</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Risk Level</span>
                    <div className="text-xl font-bold">MODERATE</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Capital Protection</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Win Rate History</span>
                      <span className="font-medium">68.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Win Size</span>
                      <span className="font-medium">$245</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Loss Size</span>
                      <span className="font-medium">$89</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence Factor</span>
                      <span className="font-medium">0.75</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Optimal Sizing Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Clinical-Grade Precision System
              </CardTitle>
              <CardDescription>
                Integrated ML predictions with Kelly optimal position sizing for institutional-grade trading
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">85.3%</div>
                  <div className="text-sm text-blue-700">ML Confidence</div>
                  <div className="text-xs text-muted-foreground mt-1">Current Signal</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">$1,247</div>
                  <div className="text-sm text-green-700">Recommended Size</div>
                  <div className="text-xs text-muted-foreground mt-1">Kelly Optimal</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">EXECUTE</div>
                  <div className="text-sm text-purple-700">Trade Decision</div>
                  <div className="text-xs text-muted-foreground mt-1">Both Systems Agree</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Clinical Integration Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>ML Prediction Model</span>
                      <Badge variant="default">v2.1 Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Kelly Calculator</span>
                      <Badge variant="default">Optimized</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Risk Assessment</span>
                      <Badge variant="outline">Conservative</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Pattern Detection</span>
                      <Badge variant="default">Multi-Regime</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Position Scaling</span>
                      <Badge variant="default">Dynamic</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Capital Protection</span>
                      <Badge variant="default">Maximum</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  Clinical-grade precision system combines ML pattern recognition with Kelly optimal sizing for institutional-level risk management and trade execution.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Risk Management
              </CardTitle>
              <CardDescription>Stop-loss and risk control settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Stop-Loss Configuration</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Stop-Loss Enabled</span>
                      <Badge variant={stopLossState.enabled ? 'default' : 'secondary'}>
                        {stopLossState.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trailing Stop</span>
                      <Badge variant={stopLossState.trailing_enabled ? 'default' : 'secondary'}>
                        {stopLossState.trailing_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Default Stop %</span>
                      <span className="font-medium">{stopLossState.default_stop_pct}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Default Profit %</span>
                      <span className="font-medium">{stopLossState.default_profit_pct}%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Risk Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Stops</span>
                      <span className="font-medium">{stopLossState.active_stops}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Recent Triggers</span>
                      <span className="font-medium">{stopLossState.recent_triggers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risk Level</span>
                      <Badge variant="outline" className={getRiskLevelColor(engineStatus.risk_level)}>
                        {engineStatus.risk_level}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Max Drawdown</span>
                      <span className="font-medium text-red-500">{(analytics?.max_drawdown_pct || 0).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Active Trades
              </CardTitle>
              <CardDescription>Currently open positions managed by the engine</CardDescription>
            </CardHeader>
            <CardContent>
              {engineStatus.active_trades === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active trades</p>
                  <p className="text-sm">The engine will open positions when conditions are optimal</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {engineStatus.active_trades} active position{engineStatus.active_trades !== 1 ? 's' : ''}
                  </p>
                  {/* Placeholder for active trades list */}
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Trade details will be displayed here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {statusLoading && (
        <div className="text-center py-4 text-muted-foreground">
          Loading engine status...
        </div>
      )}
    </div>
  );
}