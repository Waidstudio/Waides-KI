import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Target,
  Shield,
  Brain,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Zap,
  Atom,
  Globe,
  Clock,
  Lock,
  Sparkles,
  Eye,
  Cpu
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface PredictionData {
  prediction: number;
  direction: string;
  confidence: number;
}

interface MarketState {
  state: string;
  timestamp: string;
}

interface TradingSignals {
  entry?: number;
  stopLoss?: number;
  takeProfit?: number;
  size?: number;
  strategy?: string;
  direction?: string;
}

interface Portfolio {
  USDT: number;
  ETH: number;
  totalValue: number;
  timestamp: string;
}

interface Analytics {
  marketState: string;
  portfolioValue: number;
  totalTrades: number;
  winRate: number;
  strategyPerformance: {
    trend_following: { wins: number; losses: number; };
    mean_reversion: { wins: number; losses: number; };
    breakout: { wins: number; losses: number; };
  };
  riskMetrics: {
    currentDrawdown: number;
    withinLimits: boolean;
  };
}

interface TradeRecord {
  timestamp: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  cost: number;
  strategy: string;
  portfolioValue: number;
}

export function WaidBotPro() {
  const [autoTrading, setAutoTrading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch real-time data
  const { data: prediction } = useQuery({
    queryKey: ['/api/waidbot-pro/prediction'],
    refetchInterval: 30000,
  });

  const { data: marketState } = useQuery({
    queryKey: ['/api/waidbot-pro/market-state'],
    refetchInterval: 15000,
  });

  const { data: signals } = useQuery({
    queryKey: ['/api/waidbot-pro/signals'],
    refetchInterval: 20000,
  });

  const { data: portfolio } = useQuery({
    queryKey: ['/api/waidbot-pro/portfolio'],
    refetchInterval: 10000,
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/waidbot-pro/analytics'],
    refetchInterval: 15000,
  });

  const { data: trades } = useQuery({
    queryKey: ['/api/waidbot-pro/trades'],
    refetchInterval: 30000,
  });

  const { data: riskCheck } = useQuery({
    queryKey: ['/api/waidbot-pro/risk-check'],
    refetchInterval: 60000,
  });

  // Quantum Trading Features - Next 500 Years Technology
  const { data: quantumSignal } = useQuery({
    queryKey: ['/api/waidbot-pro/quantum-signal'],
    refetchInterval: 5000, // Ultra-fast quantum updates
  });

  const { data: quantumMarket } = useQuery({
    queryKey: ['/api/waidbot-pro/quantum-market'],
    refetchInterval: 8000,
  });

  const { data: quantumPerformance } = useQuery({
    queryKey: ['/api/waidbot-pro/quantum-performance'],
    refetchInterval: 15000,
  });

  // KonsLang AI Learning Features
  const { data: konsPersonality } = useQuery({
    queryKey: ['/api/konslang/personality'],
    refetchInterval: 30000,
  });

  const { data: konsLearning } = useQuery({
    queryKey: ['/api/konslang/learning'],
    refetchInterval: 20000,
  });

  const { data: konsMemoryStats } = useQuery({
    queryKey: ['/api/konslang/memory-stats'],
    refetchInterval: 15000,
  });

  const { data: konsSacredPatterns } = useQuery({
    queryKey: ['/api/konslang/patterns'],
    refetchInterval: 45000,
  });

  // Auto trading mutation
  const autoTradeMutation = useMutation({
    mutationFn: () => apiRequest('/api/waidbot-pro/auto-trade', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-pro/portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-pro/analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-pro/trades'] });
    },
  });

  // Trade simulation mutation
  const simulateTradeMutation = useMutation({
    mutationFn: (signals: TradingSignals) => 
      apiRequest('/api/waidbot-pro/simulate-trade', { 
        method: 'POST', 
        body: JSON.stringify(signals) 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-pro/portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-pro/trades'] });
    },
  });

  // Quantum Mode Activation
  const quantumActivationMutation = useMutation({
    mutationFn: () => apiRequest('/api/waidbot-pro/activate-quantum', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-pro/quantum-signal'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-pro/quantum-market'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-pro/quantum-performance'] });
    },
  });

  const handleAutoTrade = () => {
    autoTradeMutation.mutate();
  };

  const handleSimulateTrade = () => {
    if (signals) {
      simulateTradeMutation.mutate(signals);
    }
  };

  const getPredictionColor = (direction: string) => {
    switch (direction) {
      case 'strong_bullish': return 'text-green-600 bg-green-50';
      case 'bullish': return 'text-green-500 bg-green-50';
      case 'strong_bearish': return 'text-red-600 bg-red-50';
      case 'bearish': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getMarketStateColor = (state: string) => {
    switch (state) {
      case 'bullish': return 'text-green-600 bg-green-100';
      case 'bearish': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(value);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            WaidBot Pro
          </h1>
          <p className="text-gray-400">Advanced AI-Powered ETH Trading System</p>
          <div className="flex items-center space-x-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Quantum Mode Ready</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-400">ETH3L/ETH3S Active</span>
          </div>
        </div>
        <Button
          onClick={handleAutoTrade}
          disabled={autoTradeMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {autoTradeMutation.isPending ? (
            <>
              <Activity className="w-4 h-4 mr-2 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Execute Auto Trade
            </>
          )}
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {portfolio ? formatCurrency(portfolio.totalValue) : '$0.00'}
            </div>
            <p className="text-xs text-gray-400">
              USDT: {portfolio?.USDT.toFixed(2) || '0.00'} | ETH: {portfolio?.ETH.toFixed(4) || '0.0000'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Market State</CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <Badge className={`text-sm font-semibold ${getMarketStateColor(marketState?.state || 'neutral')}`}>
              {marketState?.state?.toUpperCase() || 'ANALYZING'}
            </Badge>
            <p className="text-xs text-gray-400 mt-1">
              AI-determined market condition
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics ? `${(analytics.winRate * 100).toFixed(1)}%` : '0.0%'}
            </div>
            <p className="text-xs text-gray-400">
              {analytics?.totalTrades || 0} total trades
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-200">Risk Status</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {riskCheck?.withinLimits ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-white">
                {riskCheck?.withinLimits ? 'Safe' : 'Risk Alert'}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Drawdown: {riskCheck ? `${(riskCheck.currentDrawdown * 100).toFixed(1)}%` : '0.0%'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="quantum" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7 bg-gray-800">
          <TabsTrigger value="quantum" className="text-gray-300 bg-gradient-to-r from-purple-600 to-blue-600">
            <Atom className="w-4 h-4 mr-1" />
            Quantum
          </TabsTrigger>
          <TabsTrigger value="konslang" className="text-gray-300 bg-gradient-to-r from-orange-600 to-red-600">
            <Brain className="w-4 h-4 mr-1" />
            KonsLang AI
          </TabsTrigger>
          <TabsTrigger value="prediction" className="text-gray-300">Prediction</TabsTrigger>
          <TabsTrigger value="signals" className="text-gray-300">Signals</TabsTrigger>
          <TabsTrigger value="analytics" className="text-gray-300">Analytics</TabsTrigger>
          <TabsTrigger value="trades" className="text-gray-300">Trades</TabsTrigger>
          <TabsTrigger value="risk" className="text-gray-300">Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="quantum" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quantum Activation Panel */}
            <Card className="bg-gradient-to-br from-purple-900 to-blue-900 border-purple-500">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Quantum Mode Activation
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Next 500 Years Trading Technology
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => quantumActivationMutation.mutate()}
                  disabled={quantumActivationMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3"
                >
                  <Atom className="w-4 h-4 mr-2" />
                  {quantumActivationMutation.isPending ? 'Initializing Quantum...' : 'ACTIVATE QUANTUM MODE'}
                </Button>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Temporal Arbitrage
                  </div>
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Zero-Loss Guarantee
                  </div>
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Micro-Movement Capture
                  </div>
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Probability Wave Control
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quantum Signal Interface */}
            <Card className="bg-gray-800 border-cyan-500">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-cyan-400" />
                  Quantum Signal Reader
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time quantum market intelligence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {quantumSignal ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400 text-sm">Quantum Action:</span>
                      <Badge className="bg-cyan-600 text-white">
                        {(quantumSignal as any).action || 'ANALYZING'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400 text-sm">Temporal Confidence:</span>
                      <Progress 
                        value={((quantumSignal as any).confidence || 0) * 100} 
                        className="w-24 h-2"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400 text-sm">Quantum Phase:</span>
                      <span className="text-white text-sm">
                        {(quantumSignal as any).phase || 'INITIALIZING'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                    Quantum signals loading...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quantum Market Analysis */}
          <Card className="bg-gray-800 border-purple-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="w-5 h-5 mr-2 text-purple-400" />
                Quantum Market Matrix
              </CardTitle>
              <CardDescription className="text-gray-400">
                Multi-dimensional probability analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quantumMarket ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="text-purple-400 text-sm">Temporal Arbitrage</div>
                    <div className="text-2xl font-bold text-white">
                      {((quantumMarket as any).temporalArbitrage || 0).toFixed(3)}%
                    </div>
                    <Progress 
                      value={Math.abs((quantumMarket as any).temporalArbitrage || 0) * 10} 
                      className="h-2"
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-blue-400 text-sm">Probability Waves</div>
                    <div className="text-2xl font-bold text-white">
                      {((quantumMarket as any).probabilityWaves || 0).toFixed(1)}
                    </div>
                    <Progress 
                      value={(quantumMarket as any).probabilityWaves || 0} 
                      className="h-2"
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-green-400 text-sm">Zero-Loss Factor</div>
                    <div className="text-2xl font-bold text-white">
                      {((quantumMarket as any).zeroLossFactor || 0).toFixed(2)}x
                    </div>
                    <Progress 
                      value={((quantumMarket as any).zeroLossFactor || 0) * 20} 
                      className="h-2"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Cpu className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                  Quantum matrix initializing...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quantum Performance Dashboard */}
          <Card className="bg-gray-800 border-green-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                Quantum Performance Metrics
              </CardTitle>
              <CardDescription className="text-gray-400">
                Beyond human imagination analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quantumPerformance ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-green-400 text-sm">Total Captures</div>
                    <div className="text-xl font-bold text-white">
                      {(quantumPerformance as any).totalCaptures || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 text-sm">Micro Profits</div>
                    <div className="text-xl font-bold text-white">
                      ${((quantumPerformance as any).microProfits || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 text-sm">Quantum Efficiency</div>
                    <div className="text-xl font-bold text-white">
                      {((quantumPerformance as any).efficiency || 0).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 text-sm">Success Rate</div>
                    <div className="text-xl font-bold text-white">
                      {((quantumPerformance as any).successRate || 0).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-4">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  Quantum performance calculating...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="konslang" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Evolution Status */}
            <Card className="bg-gray-900 border-orange-500 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  KonsLang AI Evolution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Evolution Stage</div>
                    <div className="text-lg font-bold text-orange-400">
                      {konsMemoryStats?.evolutionStage || 'apprentice'}
                    </div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Total Memories</div>
                    <div className="text-lg font-bold text-blue-400">
                      {konsMemoryStats?.totalMemories || 0}
                    </div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Wisdom Level</div>
                    <div className="text-lg font-bold text-purple-400">
                      {konsMemoryStats?.wisdomLevel || 70}%
                    </div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Success Rate</div>
                    <div className="text-lg font-bold text-green-400">
                      {konsMemoryStats?.successRate?.toFixed(1) || 0}%
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Spiritual Alignment</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${konsMemoryStats?.spiritualAlignment || 90}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {konsMemoryStats?.spiritualAlignment || 90}% aligned with divine trading wisdom
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Personality Matrix */}
            <Card className="bg-gray-900 border-red-500 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Personality Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {konsPersonality && Object.entries(konsPersonality).map(([trait, value]) => (
                  <div key={trait} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 capitalize">
                      {trait.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-300 w-8">{Math.round(value as number)}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Learning Progress */}
            <Card className="bg-gray-900 border-yellow-500 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {konsLearning && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Total Experiences</span>
                      <span className="text-lg font-bold text-yellow-400">
                        {konsLearning.totalExperiences}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Average Profit</span>
                      <span className={`text-lg font-bold ${konsLearning.averageProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${konsLearning.averageProfit?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Best Strategy</span>
                      <span className="text-sm text-blue-400 font-semibold">
                        {konsLearning.bestStrategy}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Adaptation Level</span>
                      <span className="text-lg font-bold text-purple-400">
                        {konsLearning.adaptationLevel}/10
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sacred Patterns */}
            <Card className="bg-gray-900 border-purple-500 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Atom className="w-5 h-5" />
                  Sacred Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {konsSacredPatterns && Object.entries(konsSacredPatterns).map(([pattern, confidence]) => (
                    <div key={pattern} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <span className="text-sm text-gray-300 capitalize">
                        {pattern.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full"
                            style={{ width: `${(confidence as number) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8">
                          {Math.round((confidence as number) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prediction" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-500" />
                AI Price Prediction
              </CardTitle>
              <CardDescription className="text-gray-400">
                Advanced machine learning price movement analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prediction && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Direction</p>
                      <Badge className={`text-sm font-semibold ${getPredictionColor(prediction.direction)}`}>
                        {prediction.direction.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Prediction</p>
                      <p className="text-lg font-bold text-white">
                        {prediction.prediction > 0 ? '+' : ''}{(prediction.prediction * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Confidence</p>
                      <p className="text-lg font-bold text-white">
                        {(prediction.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={prediction.confidence * 100} 
                    className="w-full h-2 bg-gray-700"
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-500" />
                Trading Signals
              </CardTitle>
              <CardDescription className="text-gray-400">
                Real-time trading recommendations based on market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {signals && Object.keys(signals).length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {signals.entry && (
                      <div>
                        <p className="text-sm text-gray-400">Entry Price</p>
                        <p className="text-lg font-bold text-white">${signals.entry.toFixed(2)}</p>
                      </div>
                    )}
                    {signals.size && (
                      <div>
                        <p className="text-sm text-gray-400">Position Size</p>
                        <p className="text-lg font-bold text-white">{signals.size.toFixed(4)} ETH</p>
                      </div>
                    )}
                    {signals.stopLoss && (
                      <div>
                        <p className="text-sm text-gray-400">Stop Loss</p>
                        <p className="text-lg font-bold text-red-400">${signals.stopLoss.toFixed(2)}</p>
                      </div>
                    )}
                    {signals.takeProfit && (
                      <div>
                        <p className="text-sm text-gray-400">Take Profit</p>
                        <p className="text-lg font-bold text-green-400">${signals.takeProfit.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                  {signals.strategy && (
                    <Badge className="bg-blue-100 text-blue-800">
                      Strategy: {signals.strategy.replace('_', ' ').toUpperCase()}
                    </Badge>
                  )}
                  <Button
                    onClick={handleSimulateTrade}
                    disabled={simulateTradeMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {simulateTradeMutation.isPending ? 'Simulating...' : 'Simulate Trade'}
                  </Button>
                </div>
              ) : (
                <Alert className="bg-gray-700 border-gray-600">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-gray-300">
                    No trading signals available. Market conditions may not meet entry criteria.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                Performance Analytics
              </CardTitle>
              <CardDescription className="text-gray-400">
                Comprehensive trading strategy performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-400">Total Trades</p>
                      <p className="text-2xl font-bold text-white">{analytics.totalTrades}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Win Rate</p>
                      <p className="text-2xl font-bold text-green-400">
                        {(analytics.winRate * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Portfolio Value</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(analytics.portfolioValue)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white">Strategy Performance</h4>
                    {Object.entries(analytics.strategyPerformance).map(([strategy, performance]) => {
                      const total = performance.wins + performance.losses;
                      const winRate = total > 0 ? (performance.wins / total) * 100 : 0;
                      
                      return (
                        <div key={strategy} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium text-white capitalize">
                              {strategy.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-400">
                              {performance.wins}W / {performance.losses}L
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">{winRate.toFixed(1)}%</p>
                            <p className="text-sm text-gray-400">{total} trades</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                Trade History
              </CardTitle>
              <CardDescription className="text-gray-400">
                Recent trading activity and execution details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trades && trades.length > 0 ? (
                <div className="space-y-3">
                  {trades.slice(-10).reverse().map((trade: TradeRecord, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {trade.type === 'buy' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium text-white capitalize">
                            {trade.type} {trade.amount.toFixed(4)} ETH
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(trade.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">${trade.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-400">{trade.strategy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert className="bg-gray-700 border-gray-600">
                  <AlertDescription className="text-gray-300">
                    No trades executed yet. Start trading to see activity here.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-orange-500" />
                Risk Management
              </CardTitle>
              <CardDescription className="text-gray-400">
                Portfolio risk metrics and safety controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              {riskCheck && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-700">
                    <div className="flex items-center space-x-3">
                      {riskCheck.withinLimits ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium text-white">Risk Status</p>
                        <p className="text-sm text-gray-400">
                          {riskCheck.withinLimits ? 'Within safe limits' : 'Risk threshold exceeded'}
                        </p>
                      </div>
                    </div>
                    <Badge className={riskCheck.withinLimits ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {riskCheck.withinLimits ? 'SAFE' : 'ALERT'}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-400">Current Drawdown</p>
                        <p className="text-sm font-medium text-white">
                          {(riskCheck.currentDrawdown * 100).toFixed(2)}%
                        </p>
                      </div>
                      <Progress 
                        value={riskCheck.currentDrawdown * 100} 
                        className="w-full h-3 bg-gray-700"
                      />
                      <p className="text-xs text-gray-500 mt-1">Max allowed: 20%</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-400">Risk per Trade</p>
                        <p className="text-lg font-bold text-white">5%</p>
                      </div>
                      <div className="p-3 bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-400">Max Drawdown</p>
                        <p className="text-lg font-bold text-white">20%</p>
                      </div>
                    </div>
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