import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, Activity, BarChart3, AlertCircle, Play, Pause, Target, Shield, Zap, Wallet, DollarSign, Signal, Crown, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface WaidBotProDecision {
  action: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'OBSERVE';
  reasoning: string;
  confidence: number;
  ethPosition: 'LONG' | 'SHORT' | 'NEUTRAL';
  tradingPair: 'ETH/USDT' | 'NONE';
  quantity: number;
  trendDirection: 'UPWARD' | 'DOWNWARD' | 'SIDEWAYS';
  strategy: 'TREND_FOLLOWING' | 'MEAN_REVERSION' | 'BREAKOUT' | 'SIDEWAYS_RANGE';
  autoTradingEnabled: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: number;
}

interface WaidBotProStatus {
  isActive: boolean;
  autoTradingEnabled: boolean;
  currentPosition: 'LONG' | 'SHORT' | 'NEUTRAL';
  totalTrades: number;
  winRate: number;
  currentBalance: number;
  lastDecision: WaidBotProDecision | null;
  currentRisk: number;
}

interface TechnicalAnalysis {
  currentPrice: number;
  trendDirection: 'UPWARD' | 'DOWNWARD' | 'SIDEWAYS';
  strategy: string;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  volume: number;
  priceChange24h: number;
}

export function WaidBotPro() {
  const [isGeneratingDecision, setIsGeneratingDecision] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [tradingMode, setTradingMode] = useState<'demo' | 'real'>('demo');
  const [fundAmount, setFundAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const { toast } = useToast();

  // Fetch WaidBot Pro status
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/waidbot-engine/waidbot-pro/status'],
    refetchInterval: 5000,
  });

  // Fetch WaidBot Pro balance
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['/api/waidbot-engine/waidbot-pro/balance'],
    refetchInterval: 3000,
  });

  // Fetch decision history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/waidbot-pro/history'],
    refetchInterval: 10000,
  });

  // Fetch technical analysis
  const { data: analysisData, isLoading: analysisLoading } = useQuery({
    queryKey: ['/api/waidbot-pro/analysis'],
    refetchInterval: 15000,
  });

  // Toggle trading mode mutation
  const toggleModeMutation = useMutation({
    mutationFn: (mode: 'demo' | 'real') => 
      apiRequest('/api/waidbot-engine/waidbot-pro/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      }),
    onSuccess: (data) => {
      setTradingMode(data.mode);
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot-pro/balance'] });
      toast({
        title: "Trading Mode Updated",
        description: `WaidBot Pro β switched to ${data.mode} mode`,
      });
    }
  });

  // Fund bot mutation
  const fundMutation = useMutation({
    mutationFn: (amount: number) =>
      apiRequest('/api/waidbot-engine/waidbot-pro/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot-pro/balance'] });
      setFundAmount('');
      toast({
        title: "Funding Successful",
        description: data.message,
      });
    }
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: (amount: number) =>
      apiRequest('/api/waidbot-engine/waidbot-pro/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot-pro/balance'] });
      setWithdrawAmount('');
      toast({
        title: "Withdrawal Successful",
        description: data.message,
      });
    }
  });

  // Generate decision mutation
  const decisionMutation = useMutation({
    mutationFn: () => 
      apiRequest('/api/waidbot-pro/decision', 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-pro/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-pro/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-pro/analysis'] });
      setIsGeneratingDecision(false);
    }
  });

  const status = statusData || {
    id: 'waidbot-pro',
    name: 'WaidBot Pro β',
    isActive: false,
    confidence: 0,
    performance: { profit: 0, trades: 0, winRate: 0 }
  };

  const balance = balanceData?.balance || {
    available: 0,
    invested: 0,
    totalProfit: 0,
    dailyProfit: 0,
    currency: 'SmaiSika',
    mode: 'demo'
  };

  const history: WaidBotProDecision[] = Array.isArray(historyData) ? historyData : [];
  const analysis: TechnicalAnalysis = (analysisData && typeof analysisData === 'object') ? {
    currentPrice: analysisData.currentPrice || 0,
    trendDirection: analysisData.trendDirection || 'SIDEWAYS',
    strategy: analysisData.strategy || 'SIDEWAYS_RANGE',
    confidence: analysisData.confidence || 0,
    riskLevel: analysisData.riskLevel || 'LOW',
    volume: analysisData.volume || 0,
    priceChange24h: analysisData.priceChange24h || 0
  } : {
    currentPrice: 0,
    trendDirection: 'SIDEWAYS',
    strategy: 'SIDEWAYS_RANGE',
    confidence: 0,
    riskLevel: 'LOW',
    volume: 0,
    priceChange24h: 0
  };

  const handleModeToggle = () => {
    const newMode = tradingMode === 'demo' ? 'real' : 'demo';
    toggleModeMutation.mutate(newMode);
  };

  const handleFund = () => {
    const amount = parseFloat(fundAmount);
    if (amount && amount > 0) {
      fundMutation.mutate(amount);
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount && amount > 0) {
      withdrawMutation.mutate(amount);
    }
  };

  const handleGenerateDecision = () => {
    setIsGeneratingDecision(true);
    decisionMutation.mutate();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY_ETH': return 'text-green-600 dark:text-green-400';
      case 'SELL_ETH': return 'text-red-600 dark:text-red-400';
      case 'HOLD': return 'text-yellow-600 dark:text-yellow-400';
      case 'OBSERVE': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'LONG': return 'text-green-600 dark:text-green-400';
      case 'SHORT': return 'text-red-600 dark:text-red-400';
      case 'NEUTRAL': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'TREND_FOLLOWING': return <TrendingUp className="h-4 w-4" />;
      case 'MEAN_REVERSION': return <Target className="h-4 w-4" />;
      case 'BREAKOUT': return <Zap className="h-4 w-4" />;
      case 'SIDEWAYS_RANGE': return <Activity className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-600 dark:text-green-400';
      case 'MEDIUM': return 'text-yellow-600 dark:text-yellow-400';
      case 'HIGH': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            WaidBot Pro β (Beta)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Advanced Bi-Directional ETH Specialist - Waides Konsmik Intelligence
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={status.isActive ? "default" : "secondary"} className="px-3 py-1 bg-blue-500/20 text-blue-400 border-blue-400/30">
            {status.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="outline" className={`px-3 py-1 ${
            balance.mode === 'demo' 
              ? 'bg-blue-500/20 text-blue-400 border-blue-400/30' 
              : 'bg-green-500/20 text-green-400 border-green-400/30'
          }`}>
            {balance.mode === 'demo' ? 'Demo Mode' : 'Live Trading'}
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Advanced Trading Controls
          </CardTitle>
          <CardDescription>
            Manage WaidBot Pro auto-trading with sophisticated risk management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleToggleTrading}
              disabled={toggleMutation.isPending}
              variant={status.autoTradingEnabled ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {status.autoTradingEnabled ? (
                <>
                  <Pause className="h-4 w-4" />
                  Stop Pro Trading
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Pro Trading
                </>
              )}
            </Button>
            
            <Button
              onClick={handleGenerateDecision}
              disabled={isGeneratingDecision || decisionMutation.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {isGeneratingDecision ? "Analyzing..." : "Generate Pro Decision"}
            </Button>
          </div>

          {toggleMutation.isPending && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Updating pro trading settings...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 backdrop-blur">
          <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Wallet className="w-4 h-4" />
            Bot Wallet
          </TabsTrigger>
          <TabsTrigger value="signals" className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Signal className="w-4 h-4" />
            Signals
          </TabsTrigger>
          <TabsTrigger value="trades" className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <DollarSign className="w-4 h-4" />
            Trades
          </TabsTrigger>
          <TabsTrigger value="upgrade" className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Crown className="w-4 h-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Position</p>
                    <p className={`text-2xl font-bold ${getPositionColor(status.currentPosition)}`}>
                      {status.currentPosition}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    {status.currentPosition === 'LONG' ? (
                      <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    ) : status.currentPosition === 'SHORT' ? (
                      <TrendingDown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Trades</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {status.totalTrades}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Win Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {(status.winRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${status?.currentBalance ? status.currentBalance.toLocaleString() : '10,000'}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Latest Decision */}
          {status.lastDecision && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Pro Decision</CardTitle>
                <CardDescription>
                  Most recent advanced trading decision from WaidBot Pro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge className={getActionColor(status.lastDecision.action)}>
                    {status.lastDecision.action}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {getStrategyIcon(status.lastDecision.strategy)}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {status.lastDecision.strategy.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {status.lastDecision.confidence}% Confidence
                  </Badge>
                  <Badge className={getRiskLevelColor(status.lastDecision.riskLevel)}>
                    {status.lastDecision.riskLevel} Risk
                  </Badge>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Reasoning:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {status.lastDecision.reasoning}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Trading Pair:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {status.lastDecision.tradingPair}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Position Size:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {(status.lastDecision.quantity * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">ETH Position:</span>
                    <p className={`font-medium ${getPositionColor(status.lastDecision.ethPosition)}`}>
                      {status.lastDecision.ethPosition}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Trend:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {status.lastDecision.trendDirection}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Timestamp:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(status.lastDecision.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Technical Analysis</CardTitle>
              <CardDescription>
                Real-time market analysis with professional indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Price</h4>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${analysis.currentPrice.toLocaleString()}
                      </p>
                      <p className={`text-sm ${analysis.priceChange24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {analysis.priceChange24h >= 0 ? '+' : ''}{analysis.priceChange24h.toFixed(2)}% (24h)
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Trend Direction</h4>
                      <div className="flex items-center gap-2">
                        {analysis.trendDirection === 'UPWARD' ? (
                          <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                        ) : analysis.trendDirection === 'DOWNWARD' ? (
                          <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                        ) : (
                          <Activity className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        )}
                        <span className="font-bold text-gray-900 dark:text-white">
                          {analysis.trendDirection}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Strategy</h4>
                      <div className="flex items-center gap-2">
                        {getStrategyIcon(analysis.strategy)}
                        <span className="font-bold text-gray-900 dark:text-white">
                          {analysis.strategy.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Confidence Score</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${analysis.confidence}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {analysis.confidence}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Risk Level</h4>
                      <Badge className={getRiskLevelColor(analysis.riskLevel)}>
                        {analysis.riskLevel} RISK
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Volume Analysis</h4>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {analysis.volume ? analysis.volume.toLocaleString() : 'N/A'} ETH
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pro Decision History</CardTitle>
              <CardDescription>
                Advanced trading decisions with strategy details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No pro trading decisions yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Enable pro trading or generate a manual decision to see history
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.slice(0, 10).map((decision, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className={getActionColor(decision.action)}>
                            {decision.action}
                          </Badge>
                          <div className="flex items-center gap-2">
                            {getStrategyIcon(decision.strategy)}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {decision.strategy.replace('_', ' ')}
                            </span>
                          </div>
                          <Badge className={getPositionColor(decision.ethPosition)}>
                            {decision.ethPosition}
                          </Badge>
                          <Badge className={getRiskLevelColor(decision.riskLevel)}>
                            {decision.riskLevel}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(decision.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {decision.reasoning}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                        <span>Confidence: {decision.confidence}%</span>
                        <span>Size: {(decision.quantity * 100).toFixed(1)}%</span>
                        <span>Pair: {decision.tradingPair}</span>
                        <span>Trend: {decision.trendDirection}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Detailed performance analysis and risk management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Risk Management</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Risk Level</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(status.currentRisk * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${status.currentRisk * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Strategy Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Trend Following</span>
                      <span className="text-gray-900 dark:text-white">35%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Mean Reversion</span>
                      <span className="text-gray-900 dark:text-white">25%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Breakout</span>
                      <span className="text-gray-900 dark:text-white">20%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sideways Range</span>
                      <span className="text-gray-900 dark:text-white">20%</span>
                    </div>
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