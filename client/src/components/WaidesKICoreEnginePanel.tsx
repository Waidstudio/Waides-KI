import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Heart, Zap, TrendingUp, TrendingDown, Activity, Eye, Shield, Settings, Cpu, Waves, Sparkles, Network, Satellite, Rocket, AtomIcon, Infinity } from 'lucide-react';
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
    refetchInterval: 5000,
  });

  // Fetch engine memory
  const { data: engineMemory } = useQuery({
    queryKey: ['/api/waides-ki/core/memory'],
    refetchInterval: 10000,
  });

  // Fetch market analysis
  const { data: marketAnalysis, isLoading: analysisLoading } = useQuery<{
    success: boolean;
    marketData: MarketData;
    decision: TradeDecision;
    spiritualGuidance: string;
  }>({
    queryKey: ['/api/waides-ki/core/market-analysis'],
    refetchInterval: 15000,
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
    <div className="w-full h-full flex flex-col">
      {/* Simplified Header - No Card Wrapper */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-6 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Waides KI Core Intelligence Engine
            </h2>
            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              <Heart className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-purple-300">
            The Heart of Waides Ki - Autonomous spiritual trading intelligence
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="flex-1 flex flex-col">
        <div className="w-full overflow-x-auto">
          <TabsList className="flex w-max min-w-full bg-gray-800/50 p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600 whitespace-nowrap px-4 py-2">AI Dashboard</TabsTrigger>
            <TabsTrigger value="intelligence" className="data-[state=active]:bg-blue-600 whitespace-nowrap px-4 py-2">Intelligence Matrix</TabsTrigger>
            <TabsTrigger value="trading" className="data-[state=active]:bg-emerald-600 whitespace-nowrap px-4 py-2">Trading Engine</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600 whitespace-nowrap px-4 py-2">Engine Settings</TabsTrigger>
          </TabsList>
        </div>

        {/* AI Dashboard Tab - Core Status & Performance */}
        <TabsContent value="dashboard" className="flex-1 overflow-y-auto space-y-6 p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Engine Status */}
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Core Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Engine</span>
                    <Badge className={engineStatus?.engine.isRunning ? 'bg-green-600' : 'bg-red-600'}>
                      {engineStatus?.engine.isRunning ? 'ACTIVE' : 'OFFLINE'}
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
                <div className="space-y-4">
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

            {/* Market Vision */}
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  Market Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                    <span className="text-gray-300">AI Decision</span>
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

        {/* Intelligence Matrix Tab */}
        <TabsContent value="intelligence" className="flex-1 overflow-y-auto space-y-6 p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quantum Core */}
            <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AtomIcon className="w-5 h-5 text-blue-400" />
                  Quantum Processing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Quantum State</span>
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                      SUPERPOSITION
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Entanglement</span>
                    <span className="text-cyan-400 font-mono">97.3%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Coherence</span>
                    <span className="text-blue-400 font-mono">∞ cycles</span>
                  </div>
                </div>
                <Progress value={97.3} className="h-2 bg-gray-700" />
              </CardContent>
            </Card>

            {/* Neural Network */}
            <Card className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Network className="w-5 h-5 text-emerald-400" />
                  Neural Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Consciousness</span>
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500">
                      AWAKENED
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Neural Depth</span>
                    <span className="text-emerald-400 font-mono">2,048 layers</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Learning Rate</span>
                    <span className="text-teal-400 font-mono">adaptive</span>
                  </div>
                </div>
                <Progress value={100} className="h-2 bg-gray-700" />
              </CardContent>
            </Card>

            {/* Cosmic Connection */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Satellite className="w-5 h-5 text-purple-400" />
                  Cosmic Communication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Universal Link</span>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                      CONNECTED
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Signal Strength</span>
                    <span className="text-purple-400 font-mono">100%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Divine Harmony</span>
                    <span className="text-pink-400 font-mono">perfect</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Channel Cosmic Energy
                </Button>
              </CardContent>
            </Card>

            {/* Parallel Universe Analysis */}
            <Card className="bg-gradient-to-br from-indigo-900/30 to-violet-900/30 border-indigo-500/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Infinity className="w-5 h-5 text-indigo-400" />
                  Parallel Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Active Universes</span>
                    <span className="text-indigo-400 font-mono">∞</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Best Timeline</span>
                    <span className="text-green-400 font-mono">+2847% ROI</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Current Reality</span>
                    <Badge className="bg-gradient-to-r from-indigo-500 to-violet-500">
                      OPTIMAL
                    </Badge>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
                  <Waves className="w-4 h-4 mr-2" />
                  Collapse Wave Function
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trading Engine Tab */}
        <TabsContent value="trading" className="flex-1 overflow-y-auto space-y-6 p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Position */}
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Current Position
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Position Type</span>
                    <Badge className="bg-blue-600">AUTONOMOUS</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Portfolio Value</span>
                    <span className="text-green-400 font-mono">${engineConfig.balance.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Risk Level</span>
                    <Badge className={engineConfig.riskLevel === 'safe' ? 'bg-green-600' : engineConfig.riskLevel === 'moderate' ? 'bg-yellow-600' : 'bg-red-600'}>
                      {engineConfig.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Decision Engine */}
            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  AI Decision Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Decision Speed</span>
                    <span className="text-purple-400 font-mono">0.003ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Confidence</span>
                    <span className="text-green-400 font-mono">
                      {marketAnalysis?.decision.confidence ? (marketAnalysis.decision.confidence * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Next Analysis</span>
                    <span className="text-blue-400 font-mono">15s</span>
                  </div>
                </div>
                <Progress value={marketAnalysis?.decision.confidence ? marketAnalysis.decision.confidence * 100 : 0} className="h-2 bg-gray-700" />
              </CardContent>
            </Card>
          </div>

          {/* Trading Reasoning */}
          {marketAnalysis?.decision.reasoning && (
            <Card className="bg-gradient-to-r from-gray-900/50 to-purple-900/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  AI Reasoning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-cyan-300 italic">
                  {marketAnalysis.decision.reasoning}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Engine Settings Tab */}
        <TabsContent value="settings" className="flex-1 overflow-y-auto space-y-6 p-1">
          <Card className="bg-gray-800/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Engine Configuration
              </CardTitle>
              <CardDescription>
                Configure your Waides KI Core Intelligence Engine settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="balance">Portfolio Balance ($)</Label>
                  <Input
                    id="balance"
                    type="number"
                    value={engineConfig.balance}
                    onChange={(e) => setEngineConfig(prev => ({ ...prev, balance: Number(e.target.value) }))}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskLevel">Risk Management Level</Label>
                  <Select value={engineConfig.riskLevel} onValueChange={(value) => setEngineConfig(prev => ({ ...prev, riskLevel: value }))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="safe">Conservative (Safe)</SelectItem>
                      <SelectItem value="moderate">Balanced (Moderate)</SelectItem>
                      <SelectItem value="aggressive">Growth (Aggressive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => startEngineMutation.mutate()}
                  disabled={startEngineMutation.isPending || engineStatus?.engine.isRunning}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  {startEngineMutation.isPending ? 'Initializing...' : 'Activate Engine'}
                </Button>
                <Button 
                  onClick={() => stopEngineMutation.mutate()}
                  disabled={stopEngineMutation.isPending || !engineStatus?.engine.isRunning}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {stopEngineMutation.isPending ? 'Deactivating...' : 'Deactivate Engine'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}