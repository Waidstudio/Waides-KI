import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target, 
  Shield, 
  Clock, 
  Activity,
  Database,
  Play,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Zap,
  PieChart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BacktestConfig {
  symbol: string;
  interval: string;
  startingBalance: number;
  lookbackPeriod: number;
  strategy: string;
  stopLoss?: number;
  takeProfit?: number;
  maxPosition?: number;
}

interface ScenarioResult {
  scenario: {
    id: string;
    name: string;
    description: string;
    symbol: string;
    interval: string;
    strategy: string;
  };
  result: {
    performance: {
      totalTrades: number;
      winRate: number;
      totalReturn: number;
      maxDrawdown: number;
      sharpeRatio: number;
      profitFactor: number;
    };
  };
  riskMetrics: {
    volatility: number;
    valueAtRisk: number;
    conditionalVaR: number;
    sortinRatio: number;
    calmarRatio: number;
    ulcerIndex: number;
  };
  duration: number;
  completedAt: Date;
}

export default function RiskScenarioBacktesting() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [customConfig, setCustomConfig] = useState<BacktestConfig>({
    symbol: 'ETHUSDT',
    interval: '1h',
    startingBalance: 10000,
    lookbackPeriod: 50,
    strategy: 'waides_full',
    stopLoss: 2,
    takeProfit: 5,
    maxPosition: 1000
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available scenarios
  const { data: availableScenarios, isLoading: scenariosLoading } = useQuery({
    queryKey: ['/api/scenarios/available'],
    refetchInterval: 10000,
  });

  // Fetch scenario results
  const { data: scenarioResults, isLoading: resultsLoading } = useQuery({
    queryKey: ['/api/scenarios/results'],
    refetchInterval: 15000,
  });

  // Fetch scenario comparison
  const { data: scenarioComparison, isLoading: comparisonLoading } = useQuery({
    queryKey: ['/api/scenarios/comparison'],
    refetchInterval: 20000,
  });

  // Fetch backtest status
  const { data: backtestStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/backtest/status'],
    refetchInterval: 5000,
  });

  // Historical data query
  const { data: historicalData, isLoading: historicalLoading } = useQuery({
    queryKey: ['/api/backtest/historical-data', { symbol: 'ETHUSDT', interval: '1h', limit: 100 }],
    refetchInterval: 30000,
  });

  // Run single scenario mutation
  const runScenarioMutation = useMutation({
    mutationFn: async (scenarioId: string) => {
      const response = await fetch(`/api/scenarios/run/${scenarioId}`, {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Scenario Completed",
          description: `Successfully ran scenario: ${data.scenario_result?.scenario?.name}`,
        });
      } else {
        toast({
          title: "Scenario Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios/results'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios/comparison'] });
    },
  });

  // Run all scenarios mutation
  const runAllScenariosMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/scenarios/run-all', {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "All Scenarios Completed",
          description: `Successfully ran ${data.scenarios_completed} scenarios`,
        });
      } else {
        toast({
          title: "Scenarios Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios/results'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios/comparison'] });
    },
  });

  // Custom backtest mutation
  const customBacktestMutation = useMutation({
    mutationFn: async (config: BacktestConfig) => {
      const response = await fetch('/api/backtest/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Custom Backtest Completed",
          description: `Backtest finished with ${data.backtest_result?.performance?.totalTrades} trades`,
        });
      } else {
        toast({
          title: "Backtest Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    },
  });

  // Demo workflow mutation
  const demoWorkflowMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/scenarios/demo-workflow', {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Demo Workflow Completed",
          description: `Loaded ${data.historical_data_loaded} historical candles and completed full system validation`,
        });
      } else {
        toast({
          title: "Demo Workflow Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/scenarios/results'] });
    },
  });

  const handleRunScenario = () => {
    if (selectedScenario) {
      runScenarioMutation.mutate(selectedScenario);
    }
  };

  const handleCustomBacktest = () => {
    customBacktestMutation.mutate(customConfig);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatDuration = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (scenariosLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg text-white">Loading Risk Scenario Backtesting...</span>
      </div>
    );
  }

  const scenarios = availableScenarios?.available_scenarios || [];
  const results = scenarioResults?.all_scenario_results || [];
  const comparison = scenarioComparison?.scenario_comparison || {};
  const status = backtestStatus?.backtest_status || {};
  const strategies = backtestStatus?.supported_strategies || [];
  const historical = historicalData?.historical_data || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Risk Scenario Backtesting</h1>
          <p className="text-gray-400 mt-2">Battle-tested trading strategies against historical market conditions</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={status.isRunning ? 'destructive' : 'default'} className="text-sm">
            {status.isRunning ? 'Running Backtest' : 'System Ready'}
          </Badge>
          <Button
            onClick={() => demoWorkflowMutation.mutate()}
            disabled={demoWorkflowMutation.isPending}
            variant="outline"
          >
            {demoWorkflowMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Demo Workflow
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* System Status */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">System Status</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {historical.length} Candles
            </div>
            <p className="text-xs text-gray-400">
              Historical data loaded | {strategies.length} strategies
            </p>
          </CardContent>
        </Card>

        {/* Available Scenarios */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Scenarios</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {scenarios.length}
            </div>
            <p className="text-xs text-gray-400">
              Available | {results.length} completed
            </p>
          </CardContent>
        </Card>

        {/* Best Performance */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Best Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {comparison.bestPerforming?.result?.performance?.totalReturn 
                ? formatPercentage(comparison.bestPerforming.result.performance.totalReturn)
                : '0.00%'
              }
            </div>
            <p className="text-xs text-gray-400">
              {comparison.bestPerforming?.scenario?.name || 'No data'}
            </p>
          </CardContent>
        </Card>

        {/* Risk Metrics */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Avg Sharpe</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {comparison.averageMetrics?.sharpeRatio?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-gray-400">
              Risk-adjusted return
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800">
          <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
          <TabsTrigger value="scenarios" className="text-white">Scenarios</TabsTrigger>
          <TabsTrigger value="backtest" className="text-white">Custom Backtest</TabsTrigger>
          <TabsTrigger value="results" className="text-white">Results</TabsTrigger>
          <TabsTrigger value="comparison" className="text-white">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription className="text-gray-400">
                  Run predefined scenarios or custom backtests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Select Scenario</Label>
                  <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Choose a scenario" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {scenarios.map((scenario: any) => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                          {scenario.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={handleRunScenario}
                    disabled={!selectedScenario || runScenarioMutation.isPending}
                    className="flex-1"
                  >
                    {runScenarioMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Run Scenario
                  </Button>
                  <Button
                    onClick={() => runAllScenariosMutation.mutate()}
                    disabled={runAllScenariosMutation.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    {runAllScenariosMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <BarChart3 className="h-4 w-4 mr-2" />
                    )}
                    Run All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Historical Data Stats */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Historical Data</CardTitle>
                <CardDescription className="text-gray-400">
                  Current data availability for backtesting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!historicalLoading && historical.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Candles:</span>
                      <span className="text-white font-medium">{historical.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Symbol:</span>
                      <span className="text-white font-medium">{historical[0]?.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Interval:</span>
                      <span className="text-white font-medium">{historical[0]?.interval}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Latest Price:</span>
                      <span className="text-white font-medium">
                        {formatCurrency(historical[historical.length - 1]?.close || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Data Quality:</span>
                      <Badge variant="default" className="text-xs">Excellent</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    {historicalLoading ? 'Loading historical data...' : 'No historical data available'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Results */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Backtest Results</CardTitle>
              <CardDescription className="text-gray-400">
                Latest completed scenario results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!resultsLoading && results.length > 0 ? (
                <div className="space-y-3">
                  {results.slice(0, 5).map((result: ScenarioResult, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={result.result.performance.totalReturn >= 0 ? 'default' : 'destructive'}>
                          {result.scenario.strategy}
                        </Badge>
                        <div>
                          <div className="text-white font-medium">{result.scenario.name}</div>
                          <div className="text-gray-400 text-sm">
                            {result.result.performance.totalTrades} trades | {formatDuration(result.duration)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${result.result.performance.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatPercentage(result.result.performance.totalReturn)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Win Rate: {result.result.performance.winRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  {resultsLoading ? 'Loading results...' : 'No backtest results available'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Available Scenarios</CardTitle>
              <CardDescription className="text-gray-400">
                Predefined backtesting scenarios for comprehensive strategy validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scenarios.map((scenario: any) => (
                  <div key={scenario.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{scenario.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{scenario.strategy}</Badge>
                        <Badge variant="secondary">{scenario.interval}</Badge>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{scenario.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Symbol:</span>
                        <div className="text-white font-medium">{scenario.symbol}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Starting Balance:</span>
                        <div className="text-white font-medium">{formatCurrency(scenario.startingBalance)}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Stop Loss:</span>
                        <div className="text-white font-medium">{scenario.stopLoss}%</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Take Profit:</span>
                        <div className="text-white font-medium">{scenario.takeProfit}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backtest" className="space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Custom Backtest Configuration</CardTitle>
              <CardDescription className="text-gray-400">
                Configure and run custom backtests with your own parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Symbol</Label>
                    <Select 
                      value={customConfig.symbol} 
                      onValueChange={(value) => setCustomConfig(prev => ({ ...prev, symbol: value }))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                        <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Interval</Label>
                    <Select 
                      value={customConfig.interval} 
                      onValueChange={(value) => setCustomConfig(prev => ({ ...prev, interval: value }))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="5m">5 Minutes</SelectItem>
                        <SelectItem value="15m">15 Minutes</SelectItem>
                        <SelectItem value="1h">1 Hour</SelectItem>
                        <SelectItem value="4h">4 Hours</SelectItem>
                        <SelectItem value="1d">1 Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Strategy</Label>
                    <Select 
                      value={customConfig.strategy} 
                      onValueChange={(value) => setCustomConfig(prev => ({ ...prev, strategy: value }))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {strategies.map((strategy: string) => (
                          <SelectItem key={strategy} value={strategy}>
                            {strategy.replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Starting Balance (USDT)</Label>
                    <Input
                      type="number"
                      value={customConfig.startingBalance}
                      onChange={(e) => setCustomConfig(prev => ({ ...prev, startingBalance: parseFloat(e.target.value) || 0 }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Lookback Period</Label>
                    <Input
                      type="number"
                      value={customConfig.lookbackPeriod}
                      onChange={(e) => setCustomConfig(prev => ({ ...prev, lookbackPeriod: parseInt(e.target.value) || 0 }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Stop Loss (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={customConfig.stopLoss}
                        onChange={(e) => setCustomConfig(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) || undefined }))}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Take Profit (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={customConfig.takeProfit}
                        onChange={(e) => setCustomConfig(prev => ({ ...prev, takeProfit: parseFloat(e.target.value) || undefined }))}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <Button
                onClick={handleCustomBacktest}
                disabled={customBacktestMutation.isPending}
                className="w-full"
              >
                {customBacktestMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Activity className="h-4 w-4 mr-2" />
                )}
                Run Custom Backtest
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Detailed Results</CardTitle>
              <CardDescription className="text-gray-400">
                Complete analysis of all completed scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!resultsLoading && results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((result: ScenarioResult, index: number) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">{result.scenario.name}</h4>
                        <div className="flex items-center space-x-2">
                          {result.result.performance.totalReturn >= 0 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`font-medium ${result.result.performance.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatPercentage(result.result.performance.totalReturn)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-gray-400 text-sm">Total Trades</span>
                          <div className="text-white font-medium">{result.result.performance.totalTrades}</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Win Rate</span>
                          <div className="text-white font-medium">{result.result.performance.winRate.toFixed(1)}%</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Max Drawdown</span>
                          <div className="text-red-400 font-medium">{result.result.performance.maxDrawdown.toFixed(2)}%</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Sharpe Ratio</span>
                          <div className="text-white font-medium">{result.result.performance.sharpeRatio.toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-gray-400 text-sm">Volatility</span>
                          <div className="text-white font-medium">{(result.riskMetrics.volatility * 100).toFixed(2)}%</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">VaR (95%)</span>
                          <div className="text-orange-400 font-medium">{result.riskMetrics.valueAtRisk.toFixed(2)}%</div>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Duration</span>
                          <div className="text-white font-medium">{formatDuration(result.duration)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  {resultsLoading ? 'Loading detailed results...' : 'No results available'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Ranking */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-blue-500" />
                  Risk-Adjusted Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!comparisonLoading && comparison.riskAdjustedRanking?.length > 0 ? (
                  <div className="space-y-3">
                    {comparison.riskAdjustedRanking.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <span className="text-white">{item.scenario}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{item.score.toFixed(2)}</div>
                          <div className="text-xs text-gray-400">Sharpe Ratio</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">No ranking data available</div>
                )}
              </CardContent>
            </Card>

            {/* Best vs Worst Performance */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Best vs Worst Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {comparison.bestPerforming && (
                  <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-400 font-medium">Best Performing</span>
                      <TrendingUp className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="text-white font-medium">{comparison.bestPerforming.scenario?.name}</div>
                    <div className="text-green-400 text-lg font-bold">
                      {formatPercentage(comparison.bestPerforming.result?.performance?.totalReturn || 0)}
                    </div>
                  </div>
                )}

                {comparison.worstPerforming && (
                  <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-red-400 font-medium">Worst Performing</span>
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    </div>
                    <div className="text-white font-medium">{comparison.worstPerforming.scenario?.name}</div>
                    <div className="text-red-400 text-lg font-bold">
                      {formatPercentage(comparison.worstPerforming.result?.performance?.totalReturn || 0)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Average Metrics */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Average Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {comparison.averageMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{comparison.averageMetrics.winRate?.toFixed(1)}%</div>
                    <div className="text-gray-400 text-sm">Avg Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{comparison.averageMetrics.sharpeRatio?.toFixed(2)}</div>
                    <div className="text-gray-400 text-sm">Avg Sharpe Ratio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{comparison.averageMetrics.maxDrawdown?.toFixed(2)}%</div>
                    <div className="text-gray-400 text-sm">Avg Max Drawdown</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{comparison.averageMetrics.profitFactor?.toFixed(2)}</div>
                    <div className="text-gray-400 text-sm">Avg Profit Factor</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}