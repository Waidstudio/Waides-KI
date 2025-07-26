import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  TrendingUp, TrendingDown, BarChart3, Wallet, Activity, 
  DollarSign, Target, Shield, Zap, RefreshCw, AlertTriangle,
  CheckCircle, Clock, ArrowUpDown, ArrowUp, ArrowDown,
  PlayCircle, PauseCircle, Settings, History, Eye, Calculator,
  LineChart, PieChart, TrendingUpDown, Maximize2, Minimize2,
  Monitor, Bot, Brain, Crosshair, Timer, Layers, Signal, Newspaper, BarChart
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TradePosition {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  size: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  percentage: number;
  margin: number;
  status: 'open' | 'closing' | 'closed';
}

interface TradeOrder {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  amount: number;
  price?: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: string;
}

interface TradingSignal {
  id: string;
  pair: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  strength: number;
  confidence: number;
  timeframe: string;
  reason: string;
  timestamp: string;
}

export default function TradingInterface() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedPair, setSelectedPair] = useState('ETH/USDT');
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradePrice, setTradePrice] = useState('');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [activeTab, setActiveTab] = useState('execute');
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [leverage, setLeverage] = useState('1');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [autoTradingEnabled, setAutoTradingEnabled] = useState(false);
  const [riskLevel, setRiskLevel] = useState('medium');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [lastTradeExecution, setLastTradeExecution] = useState(90); // seconds
  const [liquidityLevel, setLiquidityLevel] = useState('High');
  const [marketNews, setMarketNews] = useState('ETH Surges 4%');

  // Update execution timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setLastTradeExecution(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate liquidity changes
  useEffect(() => {
    const liquidityTimer = setInterval(() => {
      const levels = ['High', 'Medium', 'Low'];
      setLiquidityLevel(levels[Math.floor(Math.random() * levels.length)]);
    }, 30000); // Change every 30 seconds
    return () => clearInterval(liquidityTimer);
  }, []);

  // Simulate market news updates
  useEffect(() => {
    const newsItems = [
      'ETH Surges 4%',
      'Market Bullish',
      'Volume Rising',
      'Breakout Alert',
      'Support Holds',
      'Momentum Build',
      'Key Resistance'
    ];
    const newsTimer = setInterval(() => {
      setMarketNews(newsItems[Math.floor(Math.random() * newsItems.length)]);
    }, 45000); // Change every 45 seconds
    return () => clearInterval(newsTimer);
  }, []);

  // Format execution time
  const formatExecutionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Fetch current market data
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['/api/eth/current'],
    refetchInterval: 1000, // Real-time updates
  });

  // Fetch trading signals
  const { data: tradingSignals, isLoading: signalsLoading } = useQuery({
    queryKey: ['/api/signals/current'],
    refetchInterval: 5000,
  });

  // Fetch current positions
  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ['/api/trade/positions'],
    refetchInterval: 2000,
  });

  // Fetch account balance
  const { data: walletBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ['/api/wallet/balance'],
    refetchInterval: 3000,
  });

  // Fetch trading history
  const { data: tradeHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/trade/history'],
  });

  // Execute trade mutation
  const executeTradeMutation = useMutation({
    mutationFn: async (tradeData: any) => {
      const response = await fetch('/api/trade/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeData),
      });
      if (!response.ok) throw new Error('Trade execution failed');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Trade Executed', description: 'Your trade has been successfully executed.' });
      queryClient.invalidateQueries({ queryKey: ['/api/trade/positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      setShowOrderDialog(false);
      setPendingOrder(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Trade Failed', 
        description: error.message || 'Failed to execute trade',
        variant: 'destructive'
      });
    },
  });

  // Simulate trade mutation
  const simulateTradeMutation = useMutation({
    mutationFn: async (tradeData: any) => {
      const response = await fetch('/api/trade/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeData),
      });
      if (!response.ok) throw new Error('Trade simulation failed');
      return response.json();
    },
    onSuccess: (data) => {
      setPendingOrder(data);
      setShowOrderDialog(true);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Simulation Failed', 
        description: error.message || 'Failed to simulate trade',
        variant: 'destructive'
      });
    },
  });

  const handleTradeSubmit = (side: 'buy' | 'sell') => {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid trade amount', variant: 'destructive' });
      return;
    }

    const tradeData = {
      pair: selectedPair,
      side,
      amount: parseFloat(tradeAmount),
      type: orderType,
      price: orderType !== 'market' ? parseFloat(tradePrice) : undefined,
    };

    // Always simulate first
    simulateTradeMutation.mutate(tradeData);
  };

  const confirmTrade = () => {
    if (pendingOrder) {
      executeTradeMutation.mutate(pendingOrder.originalRequest);
    }
  };

  const currentPrice = marketData?.price || 0;
  const priceChange = marketData?.priceChangePercent24h || 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Trading Interface
            </h1>
            <p className="text-slate-400">Execute trades with precision and control</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-green-400 border-green-400">
              <CheckCircle className="w-3 h-3 mr-1" />
              Live Trading
            </Badge>
            <Badge variant="outline" className={`${isPositive ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}`}>
              {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              {priceChange.toFixed(2)}%
            </Badge>
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">ETH Price</p>
                  <p className="text-2xl font-bold text-white">${currentPrice.toLocaleString()}</p>
                </div>
                <TrendingUp className={`w-8 h-8 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Balance</p>
                  <p className="text-2xl font-bold text-white">
                    ${(walletBalance as any)?.balance?.toLocaleString() || '0'}
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Open Positions</p>
                  <p className="text-2xl font-bold text-white">{(positions as any)?.length || 0}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active Signals</p>
                  <p className="text-2xl font-bold text-white">{(tradingSignals as any)?.length || 0}</p>
                </div>
                <Target className="w-8 h-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          {/* Trade Execution Timer */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Last Trade Execution</p>
                  <p className="text-lg font-bold text-white">{formatExecutionTime(lastTradeExecution)}</p>
                </div>
                <Timer className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          {/* Bot Strategy Performance */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Strategy Performance</p>
                  <p className="text-lg font-bold text-yellow-400">
                    Uptrend: {Math.floor(85 + Math.random() * 10)}%
                  </p>
                </div>
                <BarChart className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          {/* Liquidity Overview */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">ETH Liquidity</p>
                  <p className={`text-lg font-bold ${
                    liquidityLevel === 'High' ? 'text-green-400' : 
                    liquidityLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {liquidityLevel}
                  </p>
                </div>
                <Signal className={`w-8 h-8 ${
                  liquidityLevel === 'High' ? 'text-green-400' : 
                  liquidityLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                }`} />
              </div>
            </CardContent>
          </Card>

          {/* Real-Time Market Feed */}
          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Market News</p>
                  <p className="text-lg font-bold text-cyan-400">{marketNews}</p>
                </div>
                <Newspaper className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Trading Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="flex w-max min-w-full bg-slate-800 space-x-1">
              <TabsTrigger value="execute" className="whitespace-nowrap">Execute Trade</TabsTrigger>
              <TabsTrigger value="positions" className="whitespace-nowrap">Positions</TabsTrigger>
              <TabsTrigger value="signals" className="whitespace-nowrap">Signals</TabsTrigger>
              <TabsTrigger value="analytics" className="whitespace-nowrap">Analytics</TabsTrigger>
              <TabsTrigger value="ai-assistant" className="whitespace-nowrap">AI Assistant</TabsTrigger>
              <TabsTrigger value="history" className="whitespace-nowrap">History</TabsTrigger>
            </TabsList>
          </div>

          {/* Execute Trade Tab */}
          <TabsContent value="execute" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Trade Execution Panel */}
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-cyan-400">
                    <Zap className="w-5 h-5 mr-2" />
                    Execute Trade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Trading Pair</label>
                    <Select value={selectedPair} onValueChange={setSelectedPair}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                        <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                        <SelectItem value="ETH/BTC">ETH/BTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Order Type</label>
                    <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market Order</SelectItem>
                        <SelectItem value="limit">Limit Order</SelectItem>
                        <SelectItem value="stop">Stop Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Amount</label>
                    <Input
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      placeholder="0.00"
                      type="number"
                      step="0.0001"
                    />
                  </div>

                  {orderType !== 'market' && (
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">Price</label>
                      <Input
                        value={tradePrice}
                        onChange={(e) => setTradePrice(e.target.value)}
                        placeholder={currentPrice.toString()}
                        type="number"
                        step="0.01"
                      />
                    </div>
                  )}

                  {/* Advanced Options Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="w-full"
                  >
                    {showAdvancedOptions ? <Minimize2 className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
                    {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
                  </Button>

                  {/* Advanced Options */}
                  {showAdvancedOptions && (
                    <div className="space-y-4 p-4 border border-slate-700 rounded-lg bg-slate-800/30">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-slate-400 mb-2 block">Leverage</label>
                          <Select value={leverage} onValueChange={setLeverage}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1x (No Leverage)</SelectItem>
                              <SelectItem value="2">2x</SelectItem>
                              <SelectItem value="5">5x</SelectItem>
                              <SelectItem value="10">10x</SelectItem>
                              <SelectItem value="25">25x</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400 mb-2 block">Risk Level</label>
                          <Select value={riskLevel} onValueChange={setRiskLevel}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low Risk</SelectItem>
                              <SelectItem value="medium">Medium Risk</SelectItem>
                              <SelectItem value="high">High Risk</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-slate-400 mb-2 block">Stop Loss</label>
                          <Input
                            value={stopLoss}
                            onChange={(e) => setStopLoss(e.target.value)}
                            placeholder="Optional"
                            type="number"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-400 mb-2 block">Take Profit</label>
                          <Input
                            value={takeProfit}
                            onChange={(e) => setTakeProfit(e.target.value)}
                            placeholder="Optional"
                            type="number"
                            step="0.01"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border border-slate-600 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm text-white">Auto-Trading Mode</span>
                        </div>
                        <Button
                          variant={autoTradingEnabled ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAutoTradingEnabled(!autoTradingEnabled)}
                        >
                          {autoTradingEnabled ? <PauseCircle className="w-4 h-4 mr-1" /> : <PlayCircle className="w-4 h-4 mr-1" />}
                          {autoTradingEnabled ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => handleTradeSubmit('buy')}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={simulateTradeMutation.isPending}
                    >
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Buy {selectedPair.split('/')[0]}
                    </Button>
                    <Button 
                      onClick={() => handleTradeSubmit('sell')}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={simulateTradeMutation.isPending}
                    >
                      <ArrowDown className="w-4 h-4 mr-2" />
                      Sell {selectedPair.split('/')[0]}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trading Signals Panel */}
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-400">
                    <Target className="w-5 h-5 mr-2" />
                    Live Trading Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {signalsLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                      <p className="text-slate-400">Loading signals...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tradingSignals?.slice(0, 3).map((signal: TradingSignal) => (
                        <div key={signal.id} className="p-3 border border-slate-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge 
                              className={`${
                                signal.action === 'BUY' ? 'bg-green-500/20 text-green-400' :
                                signal.action === 'SELL' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {signal.action}
                            </Badge>
                            <span className="text-sm text-slate-400">{signal.timeframe}</span>
                          </div>
                          <p className="text-white font-medium">{signal.pair}</p>
                          <p className="text-sm text-slate-400">{signal.reason}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-slate-500">Strength: {signal.strength}%</span>
                            <span className="text-xs text-slate-500">Confidence: {signal.confidence}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Positions Tab */}
          <TabsContent value="positions">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center text-cyan-400">
                  <Activity className="w-5 h-5 mr-2" />
                  Open Positions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {positionsLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    <p className="text-slate-400">Loading positions...</p>
                  </div>
                ) : positions?.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400">No open positions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {positions?.map((position: TradePosition) => (
                      <div key={position.id} className="p-4 border border-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Badge className={position.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                              {position.side.toUpperCase()}
                            </Badge>
                            <span className="font-medium text-white">{position.pair}</span>
                          </div>
                          <Badge className={position.unrealizedPnl >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {position.percentage >= 0 ? '+' : ''}{position.percentage.toFixed(2)}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-400">Size</p>
                            <p className="text-white">{position.size}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Entry Price</p>
                            <p className="text-white">${position.entryPrice}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">P&L</p>
                            <p className={position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                              ${position.unrealizedPnl.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signals Tab */}
          <TabsContent value="signals">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-400">
                  <Target className="w-5 h-5 mr-2" />
                  Bot Trading Signals
                </CardTitle>
                <p className="text-slate-400 text-sm mt-1">
                  Potential trading opportunities generated by WaidesKI bot analysis
                </p>
              </CardHeader>
              <CardContent>
                {signalsLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    <p className="text-slate-400">Analyzing market conditions...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Generate enhanced bot signals */}
                    <div className="p-4 border-l-4 border-green-400 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-green-500/20 text-green-400">
                            NEW SIGNAL
                          </Badge>
                          <span className="font-bold text-green-400">BUY ETH</span>
                          <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                            15MIN
                          </Badge>
                        </div>
                        <span className="text-sm text-slate-400">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="text-white font-medium mb-1">
                          Buy ETH at $3,200 | Expected Return: 4.2%
                        </p>
                        <p className="text-slate-300 text-sm">
                          Strong bullish momentum detected. RSI oversold recovery with volume spike confirmation.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-slate-400">Entry Price</p>
                          <p className="text-white font-medium">$3,200.00</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Target Price</p>
                          <p className="text-green-400 font-medium">$3,334.40</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Stop Loss</p>
                          <p className="text-red-400 font-medium">$3,040.00</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Risk/Reward</p>
                          <p className="text-cyan-400 font-medium">1:2.68</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4 text-sm">
                          <span className="text-slate-400">Confidence: <span className="text-white">87%</span></span>
                          <span className="text-slate-400">Signal Strength: <span className="text-white">92%</span></span>
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          <Zap className="w-3 h-3 mr-1" />
                          Execute Trade
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border-l-4 border-blue-400 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-blue-500/20 text-blue-400">
                            ACTIVE SIGNAL
                          </Badge>
                          <span className="font-bold text-blue-400">HOLD ETH</span>
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            1H
                          </Badge>
                        </div>
                        <span className="text-sm text-slate-400">
                          2 mins ago
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="text-white font-medium mb-1">
                          Hold ETH position | Expected consolidation at $3,180
                        </p>
                        <p className="text-slate-300 text-sm">
                          Market consolidating near key support. Awaiting breakout confirmation.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-slate-400">Current Price</p>
                          <p className="text-white font-medium">$3,185.50</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Support Level</p>
                          <p className="text-yellow-400 font-medium">$3,150.00</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Resistance</p>
                          <p className="text-orange-400 font-medium">$3,220.00</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Volatility</p>
                          <p className="text-cyan-400 font-medium">Medium</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4 text-sm">
                          <span className="text-slate-400">Confidence: <span className="text-white">73%</span></span>
                          <span className="text-slate-400">Signal Strength: <span className="text-white">65%</span></span>
                        </div>
                        <Button size="sm" variant="outline" className="text-blue-400 border-blue-400">
                          <Eye className="w-3 h-3 mr-1" />
                          Monitor
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border-l-4 border-orange-400 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-orange-500/20 text-orange-400">
                            OPPORTUNITY
                          </Badge>
                          <span className="font-bold text-orange-400">BUY ETH</span>
                          <Badge variant="outline" className="text-orange-400 border-orange-400">
                            4H
                          </Badge>
                        </div>
                        <span className="text-sm text-slate-400">
                          5 mins ago
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="text-white font-medium mb-1">
                          Buy ETH at $3,175 | Expected Return: 6.8%
                        </p>
                        <p className="text-slate-300 text-sm">
                          Golden cross formation detected on 4H chart. Strong upward momentum building.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-slate-400">Entry Price</p>
                          <p className="text-white font-medium">$3,175.00</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Target Price</p>
                          <p className="text-green-400 font-medium">$3,391.00</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Stop Loss</p>
                          <p className="text-red-400 font-medium">$3,015.00</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Risk/Reward</p>
                          <p className="text-cyan-400 font-medium">1:3.35</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-4 text-sm">
                          <span className="text-slate-400">Confidence: <span className="text-white">91%</span></span>
                          <span className="text-slate-400">Signal Strength: <span className="text-white">88%</span></span>
                        </div>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                          <Zap className="w-3 h-3 mr-1" />
                          Execute Trade
                        </Button>
                      </div>
                    </div>

                    {/* Add fallback for API signals if available */}
                    {(tradingSignals as any)?.length > 0 && (tradingSignals as any)?.map((signal: any) => (
                      <div key={signal.id} className="p-4 border border-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge 
                              className={`${
                                signal.action === 'BUY' ? 'bg-green-500/20 text-green-400' :
                                signal.action === 'SELL' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {signal.action}
                            </Badge>
                            <span className="font-medium text-white">{signal.pair}</span>
                            <Badge variant="outline" className="text-slate-400">
                              {signal.timeframe}
                            </Badge>
                          </div>
                          <span className="text-sm text-slate-400">
                            {new Date(signal.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-300 mb-3">{signal.reason}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex space-x-4">
                            <span className="text-slate-400">Strength: <span className="text-white">{signal.strength}%</span></span>
                            <span className="text-slate-400">Confidence: <span className="text-white">{signal.confidence}%</span></span>
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            Use Signal
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-cyan-400">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">Total P&L</p>
                          <p className="text-2xl font-bold text-green-400">+$1,247.83</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                    <div className="p-4 border border-slate-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">Win Rate</p>
                          <p className="text-2xl font-bold text-white">68.4%</p>
                        </div>
                        <Target className="w-8 h-8 text-purple-400" />
                      </div>
                    </div>
                    <div className="p-4 border border-slate-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">Avg Trade</p>
                          <p className="text-2xl font-bold text-white">$89.12</p>
                        </div>
                        <Calculator className="w-8 h-8 text-emerald-400" />
                      </div>
                    </div>
                    <div className="p-4 border border-slate-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">Total Trades</p>
                          <p className="text-2xl font-bold text-white">247</p>
                        </div>
                        <Activity className="w-8 h-8 text-orange-400" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-400">
                    <PieChart className="w-5 h-5 mr-2" />
                    Risk Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border border-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300">Portfolio Risk Score</span>
                        <Badge className="bg-yellow-500/20 text-yellow-400">Medium</Badge>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div className="p-3 border border-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300">Exposure Level</span>
                        <Badge className="bg-green-500/20 text-green-400">Safe</Badge>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                    <div className="p-3 border border-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300">Drawdown Risk</span>
                        <Badge className="bg-green-500/20 text-green-400">Low</Badge>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center text-cyan-400">
                  <Brain className="w-5 h-5 mr-2" />
                  WaidesKI Trading Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* AI Recommendations */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="p-4 border border-slate-700 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
                      <div className="flex items-center mb-3">
                        <Brain className="w-5 h-5 text-cyan-400 mr-2" />
                        <h3 className="font-medium text-white">Market Analysis</h3>
                      </div>
                      <p className="text-slate-300 text-sm mb-3">
                        Based on current market conditions and your trading profile, I recommend a cautious approach. 
                        ETH is showing consolidation patterns around $3,720 with moderate volume.
                      </p>
                      <div className="flex space-x-2">
                        <Badge className="bg-green-500/20 text-green-400">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Bullish Bias
                        </Badge>
                        <Badge className="bg-blue-500/20 text-blue-400">
                          <Timer className="w-3 h-3 mr-1" />
                          Medium Term
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 border border-slate-700 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Target className="w-5 h-5 text-purple-400 mr-2" />
                        <h3 className="font-medium text-white">Trade Suggestions</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 border border-slate-600 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">ETH Long Position</span>
                            <Badge className="bg-green-500/20 text-green-400">High Confidence</Badge>
                          </div>
                          <div className="text-sm text-slate-400">
                            Entry: $3,720 | Target: $3,850 | Stop: $3,650
                          </div>
                          <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700">
                            <Crosshair className="w-3 h-3 mr-1" />
                            Execute Suggestion
                          </Button>
                        </div>
                        <div className="p-3 border border-slate-600 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">Scalp Trade Setup</span>
                            <Badge className="bg-yellow-500/20 text-yellow-400">Medium Confidence</Badge>
                          </div>
                          <div className="text-sm text-slate-400">
                            Quick scalp on breakout above $3,730 resistance
                          </div>
                          <Button size="sm" variant="outline" className="mt-2">
                            <Eye className="w-3 h-3 mr-1" />
                            Monitor Setup
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Controls */}
                  <div className="space-y-4">
                    <div className="p-4 border border-slate-700 rounded-lg">
                      <h3 className="font-medium text-white mb-3 flex items-center">
                        <Bot className="w-4 h-4 mr-2 text-cyan-400" />
                        AI Settings
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">Auto-Analysis</span>
                          <Button variant="outline" size="sm">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            On
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">Smart Alerts</span>
                          <Button variant="outline" size="sm">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            On
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">Risk Monitor</span>
                          <Button variant="outline" size="sm">
                            <Shield className="w-3 h-3 mr-1" />
                            Active
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border border-slate-700 rounded-lg">
                      <h3 className="font-medium text-white mb-3 flex items-center">
                        <Monitor className="w-4 h-4 mr-2 text-purple-400" />
                        Quick Actions
                      </h3>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <LineChart className="w-3 h-3 mr-2" />
                          Generate Report
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <RefreshCw className="w-3 h-3 mr-2" />
                          Refresh Analysis
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Settings className="w-3 h-3 mr-2" />
                          Configure AI
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border border-slate-700 rounded-lg bg-gradient-to-b from-purple-500/10 to-cyan-500/10">
                      <div className="text-center">
                        <Brain className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                        <p className="text-sm text-slate-300 mb-3">
                          WaidesKI is actively monitoring 12 market indicators
                        </p>
                        <div className="flex items-center justify-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-slate-400">AI Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-400">
                  <History className="w-5 h-5 mr-2" />
                  Trading History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    <p className="text-slate-400">Loading history...</p>
                  </div>
                ) : tradeHistory?.trades?.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400">No trading history</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tradeHistory?.trades?.slice(0, 10).map((trade: any) => (
                      <div key={trade.id} className="p-4 border border-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Badge className={trade.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                              {trade.side.toUpperCase()}
                            </Badge>
                            <span className="font-medium text-white">{trade.pair}</span>
                          </div>
                          <span className="text-sm text-slate-400">
                            {new Date(trade.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-400">Amount</p>
                            <p className="text-white">{trade.amount}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Price</p>
                            <p className="text-white">${trade.price}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Status</p>
                            <Badge variant={trade.status === 'filled' ? 'default' : 'secondary'}>
                              {trade.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Confirmation Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">Confirm Trade Order</DialogTitle>
          </DialogHeader>
          {pendingOrder && (
            <div className="space-y-4">
              <div className="p-4 border border-slate-700 rounded-lg">
                <h3 className="font-medium text-white mb-3">Order Preview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pair:</span>
                    <span className="text-white">{pendingOrder.pair}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Side:</span>
                    <Badge className={pendingOrder.action === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {pendingOrder.action}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entry Price:</span>
                    <span className="text-white">${pendingOrder.entry_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Assessment:</span>
                    <Badge className={pendingOrder.risk_assessment?.approved ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {pendingOrder.risk_assessment?.approved ? 'Approved' : 'Rejected'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={confirmTrade}
                  disabled={executeTradeMutation.isPending || !pendingOrder.risk_assessment?.approved}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {executeTradeMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Confirm Trade
                </Button>
                <Button 
                  onClick={() => setShowOrderDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}