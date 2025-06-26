import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Heart, Zap, TrendingUp, TrendingDown, Activity, Eye, Shield, Settings } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface EngineStatus {
  isRunning: boolean;
  memory: {
    totalTrades: number;
    successRate: number;
    gainStreak: number;
    failStreak: number;
    spiritualState: 'enlightened' | 'focused' | 'cautious' | 'blocked';
    learningWeight: number;
    priceHistoryLength: number;
    signalHistoryLength: number;
  };
  lastMarketPrice: number;
  recentSignals: any[];
}

interface MarketData {
  price: number;
  volume: number;
  change: number;
  marketCap: number;
  timestamp: number;
}

interface TradeDecision {
  shouldTrade: boolean;
  type?: 'BUY' | 'SELL' | 'SCALP';
  confidence: number;
  reasoning: string;
}

export function WaidesKICoreEnginePanel() {
  const [engineConfig, setEngineConfig] = useState({
    balance: 10000,
    activeBot: 'autonomous',
    riskLevel: 'moderate'
  });

  const queryClient = useQueryClient();

  // Fetch engine status
  const { data: engineStatus, isLoading: statusLoading } = useQuery<{ success: boolean; engine: EngineStatus }>({
    queryKey: ['/api/waides-ki/core/status'],
    refetchInterval: 5000, // Update every 5 seconds
  });

  // Fetch engine memory
  const { data: engineMemory } = useQuery({
    queryKey: ['/api/waides-ki/core/memory'],
    refetchInterval: 10000, // Update every 10 seconds
  });

  // Fetch market analysis
  const { data: marketAnalysis, isLoading: analysisLoading } = useQuery<{
    success: boolean;
    marketData: MarketData;
    decision: TradeDecision;
    spiritualGuidance: string;
  }>({
    queryKey: ['/api/waides-ki/core/market-analysis'],
    refetchInterval: 15000, // Update every 15 seconds
  });

  // Start engine mutation
  const startEngineMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waides-ki/core/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(engineConfig)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/core/status'] });
    }
  });

  // Stop engine mutation
  const stopEngineMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waides-ki/core/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/core/status'] });
    }
  });

  // Dream mode mutation
  const dreamModeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waides-ki/core/dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    }
  });

  // Execute trade mutation
  const executeTradeimulation = useMutation({
    mutationFn: async (tradeData: { type: string; confidence: number }) => {
      const response = await fetch('/api/waides-ki/core/execute-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tradeData, walletBalance: engineConfig.balance })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/core/memory'] });
    }
  });

  const getSpiritualStateColor = (state: string) => {
    switch (state) {
      case 'enlightened': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'focused': return 'bg-gradient-to-r from-blue-400 to-blue-600';
      case 'cautious': return 'bg-gradient-to-r from-orange-400 to-orange-600';
      case 'blocked': return 'bg-gradient-to-r from-red-400 to-red-600';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  const getDecisionColor = (decision: TradeDecision) => {
    if (!decision.shouldTrade) return 'text-gray-400';
    switch (decision.type) {
      case 'BUY': return 'text-green-400';
      case 'SELL': return 'text-red-400';
      case 'SCALP': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Waides KI Core Intelligence Engine
            </CardTitle>
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              <Heart className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardDescription className="text-purple-300">
            The Heart of Waides Ki - Autonomous spiritual trading intelligence
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
          <TabsTrigger value="memory" className="data-[state=active]:bg-purple-600">Memory</TabsTrigger>
          <TabsTrigger value="trading" className="data-[state=active]:bg-purple-600">Trading</TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-600">Analysis</TabsTrigger>
          <TabsTrigger value="controls" className="data-[state=active]:bg-purple-600">Controls</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Engine Status */}
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Engine Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status</span>
                    <Badge className={engineStatus?.engine.isRunning ? 'bg-green-600' : 'bg-red-600'}>
                      {engineStatus?.engine.isRunning ? 'ACTIVE' : 'STOPPED'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Spiritual State</span>
                    <Badge className={getSpiritualStateColor(engineStatus?.engine.memory.spiritualState || 'blocked')}>
                      {engineStatus?.engine.memory.spiritualState?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Learning Weight</span>
                    <span className="text-purple-400 font-mono">
                      {engineStatus?.engine.memory.learningWeight?.toFixed(2) || '0.00'}x
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Success Rate</span>
                    <span className="text-green-400 font-mono">
                      {((engineStatus?.engine.memory.successRate || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Trades</span>
                    <span className="text-purple-400 font-mono">
                      {engineStatus?.engine.memory.totalTrades || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Current Streak</span>
                    <div className="flex items-center gap-2">
                      {(engineStatus?.engine.memory.gainStreak || 0) > 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-mono">
                            +{engineStatus?.engine.memory.gainStreak}
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 font-mono">
                            -{engineStatus?.engine.memory.failStreak || 0}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Data */}
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  Market Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">ETH Price</span>
                    <span className="text-blue-400 font-mono">
                      ${marketAnalysis?.marketData.price?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">24h Change</span>
                    <span className={`font-mono ${(marketAnalysis?.marketData.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(marketAnalysis?.marketData.change || 0) >= 0 ? '+' : ''}{marketAnalysis?.marketData.change?.toFixed(2) || '0.00'}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Decision</span>
                    <span className={`font-mono ${getDecisionColor(marketAnalysis?.decision || { shouldTrade: false, confidence: 0, reasoning: '' })}`}>
                      {marketAnalysis?.decision.shouldTrade ? marketAnalysis.decision.type : 'HOLD'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Spiritual Guidance */}
          {marketAnalysis?.spiritualGuidance && (
            <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Spiritual Guidance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-300 text-center italic">
                  "{marketAnalysis.spiritualGuidance}"
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Memory Tab */}
        <TabsContent value="memory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-lg">Memory Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Price History</span>
                    <span className="text-purple-400">{engineMemory?.memory.priceHistoryLength || 0} points</span>
                  </div>
                  <Progress 
                    value={(engineMemory?.memory.priceHistoryLength || 0) / 200 * 100} 
                    className="h-2 bg-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Signal History</span>
                    <span className="text-purple-400">{engineMemory?.memory.signalHistoryLength || 0} signals</span>
                  </div>
                  <Progress 
                    value={(engineMemory?.memory.signalHistoryLength || 0) / 100 * 100} 
                    className="h-2 bg-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Learning Progress</span>
                    <span className="text-purple-400">{((engineMemory?.memory.learningWeight || 1) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={(engineMemory?.memory.learningWeight || 1) * 100} 
                    className="h-2 bg-gray-700"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-lg">Recent Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {engineMemory?.recentSignals?.length > 0 ? 
                    engineMemory.recentSignals.map((signal: any, index: number) => (
                      <div key={index} className="p-2 bg-gray-700/50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className={`font-mono text-sm ${getDecisionColor({ shouldTrade: true, type: signal.type, confidence: 0, reasoning: '' })}`}>
                            {signal.type}
                          </span>
                          <span className="text-xs text-gray-400">
                            {((signal.confidence || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                        {signal.result && (
                          <div className="text-xs mt-1">
                            <span className={signal.result.success ? 'text-green-400' : 'text-red-400'}>
                              {signal.result.success ? 'SUCCESS' : 'FAILED'} | 
                              ${signal.result.profit?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        )}
                      </div>
                    )) :
                    <p className="text-gray-400 text-center py-4">No recent signals</p>
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-lg">Manual Trade Execution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    onClick={() => executeTradeimulation.mutate({ type: 'BUY', confidence: 0.8 })}
                    disabled={executeTradeimulation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    BUY
                  </Button>
                  <Button 
                    onClick={() => executeTradeimulation.mutate({ type: 'SELL', confidence: 0.8 })}
                    disabled={executeTradeimulation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    SELL
                  </Button>
                  <Button 
                    onClick={() => executeTradeimulation.mutate({ type: 'SCALP', confidence: 0.7 })}
                    disabled={executeTradeimulation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    SCALP
                  </Button>
                </div>
                <Button 
                  onClick={() => dreamModeMutation.mutate()}
                  disabled={dreamModeMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Activate Dream Mode
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-lg">Trading Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">
                      {((engineStatus?.engine.memory.successRate || 0) * 100).toFixed(1)}%
                    </div>
                    <div className="text-gray-400">Success Rate</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-green-400">
                        {engineStatus?.engine.memory.gainStreak || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Win Streak</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-purple-400">
                        {engineStatus?.engine.memory.totalTrades || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Total Trades</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {marketAnalysis && (
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-lg">Current Market Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      ${marketAnalysis.marketData.price?.toFixed(2)}
                    </div>
                    <div className="text-gray-400 text-sm">ETH Price</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${marketAnalysis.marketData.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {marketAnalysis.marketData.change >= 0 ? '+' : ''}{marketAnalysis.marketData.change?.toFixed(2)}%
                    </div>
                    <div className="text-gray-400 text-sm">24h Change</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {(marketAnalysis.decision.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-gray-400 text-sm">Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getDecisionColor(marketAnalysis.decision)}`}>
                      {marketAnalysis.decision.shouldTrade ? marketAnalysis.decision.type : 'HOLD'}
                    </div>
                    <div className="text-gray-400 text-sm">Decision</div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                  <h4 className="font-semibold text-purple-400 mb-2">Trading Reasoning</h4>
                  <p className="text-gray-300 text-sm">{marketAnalysis.decision.reasoning}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls" className="space-y-4">
          <Card className="bg-gray-800/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Engine Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="balance">Wallet Balance ($)</Label>
                  <Input
                    id="balance"
                    type="number"
                    value={engineConfig.balance}
                    onChange={(e) => setEngineConfig(prev => ({ ...prev, balance: Number(e.target.value) }))}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activeBot">Active Bot</Label>
                  <Select value={engineConfig.activeBot} onValueChange={(value) => setEngineConfig(prev => ({ ...prev, activeBot: value }))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="autonomous">Autonomous</SelectItem>
                      <SelectItem value="WaidBot">WaidBot</SelectItem>
                      <SelectItem value="WaidBotPro">WaidBot Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskLevel">Risk Level</Label>
                  <Select value={engineConfig.riskLevel} onValueChange={(value) => setEngineConfig(prev => ({ ...prev, riskLevel: value }))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="safe">Safe</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => startEngineMutation.mutate()}
                  disabled={startEngineMutation.isPending || engineStatus?.engine.isRunning}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {startEngineMutation.isPending ? 'Starting...' : 'Start Engine'}
                </Button>
                <Button 
                  onClick={() => stopEngineMutation.mutate()}
                  disabled={stopEngineMutation.isPending || !engineStatus?.engine.isRunning}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                >
                  {stopEngineMutation.isPending ? 'Stopping...' : 'Stop Engine'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}