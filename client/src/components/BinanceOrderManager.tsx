import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, PlayCircle, StopCircle, Settings, TrendingUp, TrendingDown, RefreshCw, DollarSign, PieChart, Activity, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderResult {
  success: boolean;
  trade_id: string;
  side: 'BUY' | 'SELL';
  symbol: string;
  quantity: number;
  price: number;
  quote_amount: number;
  timestamp: number;
  mode: 'SIMULATED' | 'LIVE';
  error?: string;
  fees?: number;
  slippage?: number;
}

interface SimulatorBalance {
  usdt: number;
  eth: number;
  total_value_usdt: number;
}

interface SimulatorPosition {
  symbol: string;
  quantity: number;
  average_price: number;
  current_value: number;
  pnl: number;
  pnl_percentage: number;
}

interface SimulatedTrade {
  id: string;
  side: 'BUY' | 'SELL';
  symbol: string;
  quantity: number;
  price: number;
  quoteAmount: number;
  timestamp: number;
  balance: number;
  success: boolean;
  error?: string;
}

export default function BinanceOrderManager() {
  const [tradeAmount, setTradeAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('ETH');
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch order manager status
  const { data: orderManagerStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/order-manager/status'],
    refetchInterval: 5000,
  });

  // Fetch simulator balance
  const { data: simulatorBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ['/api/order-simulator/balance'],
    refetchInterval: 3000,
  });

  // Fetch simulator positions
  const { data: simulatorPositions, isLoading: positionsLoading } = useQuery({
    queryKey: ['/api/order-simulator/positions'],
    refetchInterval: 5000,
  });

  // Fetch simulator statistics
  const { data: simulatorStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/order-simulator/statistics'],
    refetchInterval: 5000,
  });

  // Fetch trade history
  const { data: tradeHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/order-simulator/history', { limit: 20 }],
    refetchInterval: 10000,
  });

  // Fetch system health
  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/order-manager/system-health'],
    refetchInterval: 8000,
  });

  // Buy order mutation
  const buyMutation = useMutation({
    mutationFn: async ({ symbol, amount }: { symbol: string; amount: number }) => {
      const response = await fetch('/api/order-manager/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, quote_amount: amount }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.order_result?.success) {
        toast({
          title: "Buy Order Executed",
          description: `Successfully bought ${data.order_result.quantity} ${data.order_result.symbol}`,
        });
      } else {
        toast({
          title: "Buy Order Failed",
          description: data.order_result?.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/order-simulator/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/order-simulator/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/order-simulator/statistics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/order-simulator/history'] });
    },
  });

  // Sell order mutation
  const sellMutation = useMutation({
    mutationFn: async ({ symbol }: { symbol: string }) => {
      const response = await fetch('/api/order-manager/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.order_result?.success) {
        toast({
          title: "Sell Order Executed",
          description: `Successfully sold ${data.order_result.quantity} ${data.order_result.symbol}`,
        });
      } else {
        toast({
          title: "Sell Order Failed",
          description: data.order_result?.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/order-simulator/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/order-simulator/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/order-simulator/statistics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/order-simulator/history'] });
    },
  });

  // Demo trade mutation
  const demoTradeMutation = useMutation({
    mutationFn: async ({ action, amount }: { action: string; amount: number }) => {
      const response = await fetch('/api/order-manager/demo-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, amount }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Demo Trade Completed",
        description: `Demo ${data.demo_trade?.action} executed successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/order-simulator/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/order-simulator/statistics'] });
    },
  });

  // Emergency stop mutation
  const emergencyStopMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/order-manager/emergency-stop', {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Emergency Stop Activated",
        description: "All trading has been halted immediately",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/order-manager/status'] });
    },
  });

  // Clear emergency mutation
  const clearEmergencyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/order-manager/clear-emergency', {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Emergency Mode Cleared",
        description: "Trading can now resume",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/order-manager/status'] });
    },
  });

  // Simulation mode toggle mutation
  const toggleSimulationMutation = useMutation({
    mutationFn: async (simulate: boolean) => {
      const response = await fetch('/api/order-manager/set-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulate }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Simulation Mode Updated",
        description: `Simulation mode ${data.simulation_enabled ? 'enabled' : 'disabled'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/order-manager/status'] });
    },
  });

  const handleBuyOrder = () => {
    const amount = customAmount ? parseFloat(customAmount) : tradeAmount;
    if (amount > 0) {
      buyMutation.mutate({ symbol: selectedSymbol, amount });
    }
  };

  const handleSellOrder = () => {
    sellMutation.mutate({ symbol: selectedSymbol });
  };

  const handleDemoTrade = (action: string) => {
    const amount = customAmount ? parseFloat(customAmount) : tradeAmount;
    demoTradeMutation.mutate({ action, amount });
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (statusLoading || balanceLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading Binance Order Manager...</span>
      </div>
    );
  }

  const status = orderManagerStatus?.status || {};
  const config = orderManagerStatus?.configuration || {};
  const balance = simulatorBalance?.balance || {};
  const positions = simulatorPositions?.positions || [];
  const stats = simulatorStats?.statistics || {};
  const history = tradeHistory?.trade_history || [];
  const health = systemHealth?.system_health || {};

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Binance Order Manager</h1>
          <p className="text-gray-400 mt-2">Real-time order simulation and trading plumbing system</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge 
            variant={health.overall_health === 'healthy' ? 'default' : 'destructive'}
            className="text-sm"
          >
            {health.overall_health === 'healthy' ? 'System Healthy' : 'System Degraded'}
          </Badge>
          <Badge 
            variant={config.simulate ? 'secondary' : 'destructive'}
            className="text-sm"
          >
            {config.simulate ? 'Simulation Mode' : 'Live Trading'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Balance Overview */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(balance.total_value_usdt || 0)}
            </div>
            <p className="text-xs text-gray-400">
              USDT: {balance.usdt?.toFixed(2) || '0.00'} | ETH: {balance.eth?.toFixed(4) || '0.0000'}
            </p>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.success_rate?.toFixed(1) || '0.0'}%
            </div>
            <Progress value={stats.success_rate || 0} className="mt-2" />
          </CardContent>
        </Card>

        {/* Total Trades */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.total_trades || 0}
            </div>
            <p className="text-xs text-gray-400">
              Wins: {stats.successful_trades || 0} | Losses: {stats.failed_trades || 0}
            </p>
          </CardContent>
        </Card>

        {/* P&L */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Profit & Loss</CardTitle>
            {(stats.profit_loss || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(stats.profit_loss || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(stats.profit_loss || 0)}
            </div>
            <p className="text-xs text-gray-400">
              {formatPercentage(stats.roi || 0)} ROI
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800">
          <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
          <TabsTrigger value="trading" className="text-white">Trading</TabsTrigger>
          <TabsTrigger value="positions" className="text-white">Positions</TabsTrigger>
          <TabsTrigger value="history" className="text-white">History</TabsTrigger>
          <TabsTrigger value="settings" className="text-white">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-500" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Order Manager</span>
                  <Badge variant={health.order_manager?.operational ? 'default' : 'destructive'}>
                    {health.order_manager?.operational ? 'Operational' : 'Stopped'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Simulator Active</span>
                  <Badge variant={health.simulator?.active ? 'default' : 'destructive'}>
                    {health.simulator?.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Emergency Stop</span>
                  <Badge variant={status.emergency_stop ? 'destructive' : 'default'}>
                    {status.emergency_stop ? 'Activated' : 'Normal'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Safety Enabled</span>
                  <Badge variant={status.safety_enabled ? 'default' : 'secondary'}>
                    {status.safety_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleDemoTrade('buy')}
                    disabled={demoTradeMutation.isPending}
                    className="flex-1"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Demo Buy
                  </Button>
                  <Button
                    onClick={() => handleDemoTrade('sell')}
                    disabled={demoTradeMutation.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Demo Sell
                  </Button>
                </div>
                <Separator />
                <div className="flex space-x-2">
                  {status.emergency_stop ? (
                    <Button
                      onClick={() => clearEmergencyMutation.mutate()}
                      disabled={clearEmergencyMutation.isPending}
                      variant="outline"
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Clear Emergency
                    </Button>
                  ) : (
                    <Button
                      onClick={() => emergencyStopMutation.mutate()}
                      disabled={emergencyStopMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      Emergency Stop
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Trades */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Trades</CardTitle>
              <CardDescription className="text-gray-400">
                Latest {history.length} trading activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-2">
                  {history.slice(0, 5).map((trade: SimulatedTrade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={trade.side === 'BUY' ? 'default' : 'secondary'}>
                          {trade.side}
                        </Badge>
                        <span className="text-white font-medium">{trade.symbol}</span>
                        <span className="text-gray-400">{trade.quantity.toFixed(4)}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white">{formatCurrency(trade.price)}</div>
                        <div className="text-xs text-gray-400">{formatDate(trade.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No trading history available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Manual Trading</CardTitle>
              <CardDescription className="text-gray-400">
                Execute buy and sell orders through the simulation system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="symbol" className="text-white">Trading Symbol</Label>
                    <select
                      id="symbol"
                      value={selectedSymbol}
                      onChange={(e) => setSelectedSymbol(e.target.value)}
                      className="w-full mt-1 p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    >
                      <option value="ETH">ETH</option>
                      <option value="BTC">BTC</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="amount" className="text-white">Trade Amount (USDT)</Label>
                    <div className="flex space-x-2 mt-1">
                      <Button
                        variant={tradeAmount === 50 ? 'default' : 'outline'}
                        onClick={() => { setTradeAmount(50); setCustomAmount(''); }}
                        size="sm"
                      >
                        $50
                      </Button>
                      <Button
                        variant={tradeAmount === 100 ? 'default' : 'outline'}
                        onClick={() => { setTradeAmount(100); setCustomAmount(''); }}
                        size="sm"
                      >
                        $100
                      </Button>
                      <Button
                        variant={tradeAmount === 500 ? 'default' : 'outline'}
                        onClick={() => { setTradeAmount(500); setCustomAmount(''); }}
                        size="sm"
                      >
                        $500
                      </Button>
                    </div>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="mt-2 bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Order Preview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Symbol:</span>
                        <span className="text-white">{selectedSymbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white">
                          {formatCurrency(customAmount ? parseFloat(customAmount) : tradeAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mode:</span>
                        <span className="text-white">{config.simulate ? 'Simulation' : 'Live'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex space-x-4">
                <Button
                  onClick={handleBuyOrder}
                  disabled={buyMutation.isPending || status.emergency_stop}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {buyMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  Buy {selectedSymbol}
                </Button>
                <Button
                  onClick={handleSellOrder}
                  disabled={sellMutation.isPending || status.emergency_stop}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                >
                  {sellMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-2" />
                  )}
                  Sell {selectedSymbol}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-blue-500" />
                Current Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {positions.length > 0 ? (
                <div className="space-y-4">
                  {positions.map((position: SimulatorPosition, index: number) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">{position.symbol}</h4>
                          <p className="text-gray-400 text-sm">
                            Quantity: {position.quantity.toFixed(4)} | Avg Price: {formatCurrency(position.average_price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">
                            {formatCurrency(position.current_value)}
                          </div>
                          <div className={`text-sm ${position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(position.pnl)} ({formatPercentage(position.pnl_percentage)})
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No open positions
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Trading History</CardTitle>
              <CardDescription className="text-gray-400">
                Complete record of all simulated trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!historyLoading && history.length > 0 ? (
                <div className="space-y-2">
                  {history.map((trade: SimulatedTrade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge variant={trade.side === 'BUY' ? 'default' : 'secondary'}>
                          {trade.side}
                        </Badge>
                        <div>
                          <div className="text-white font-medium">{trade.symbol}</div>
                          <div className="text-gray-400 text-sm">ID: {trade.id}</div>
                        </div>
                        <div className="text-gray-300">
                          {trade.quantity.toFixed(4)} @ {formatCurrency(trade.price)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white">{formatCurrency(trade.quoteAmount)}</div>
                        <div className="text-xs text-gray-400">{formatDate(trade.timestamp)}</div>
                        {trade.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500 inline ml-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  {historyLoading ? 'Loading trade history...' : 'No trading history available'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-500" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Simulation Mode</Label>
                  <p className="text-gray-400 text-sm">Enable simulation for safe testing</p>
                </div>
                <Switch
                  checked={config.simulate}
                  onCheckedChange={(checked) => toggleSimulationMutation.mutate(checked)}
                  disabled={toggleSimulationMutation.isPending}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white">Max Trade Amount</Label>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(config.max_trade_amount || 0)}
                  </div>
                </div>
                <div>
                  <Label className="text-white">Max Daily Trades</Label>
                  <div className="text-2xl font-bold text-white">
                    {config.max_daily_trades || 0}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-white font-medium">Connection Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-gray-400 text-sm">Order Manager</div>
                    <div className="text-white">{orderManagerStatus?.connection_test?.status || 'Unknown'}</div>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-gray-400 text-sm">Daily Trades</div>
                    <div className="text-white">{status.daily_trade_count || 0}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}