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
  PlayCircle, PauseCircle, Settings, History, Eye
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    ${walletBalance?.balance?.toLocaleString() || '0'}
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
                  <p className="text-2xl font-bold text-white">{positions?.length || 0}</p>
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
                  <p className="text-2xl font-bold text-white">{tradingSignals?.length || 0}</p>
                </div>
                <Target className="w-8 h-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Trading Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="execute">Execute Trade</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

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
                  All Trading Signals
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
                    {tradingSignals?.map((signal: TradingSignal) => (
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