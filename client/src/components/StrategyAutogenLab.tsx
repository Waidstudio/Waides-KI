import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Brain, Zap, TrendingUp, TrendingDown, Activity, Sparkles, Code, BarChart3, Target, Trash2 } from "lucide-react";

interface GeneratedStrategy {
  id: string;
  name: string;
  code: string;
  description: string;
  profit: number;
  winRate: number;
  totalTrades: number;
  createdAt: string;
  lastTestedAt: string;
  performanceTrend: number;
  riskScore: number;
  isActive: boolean;
  backtestResults: BacktestResult[];
}

interface BacktestResult {
  initialBalance: number;
  finalBalance: number;
  profit: number;
  trades: TradeLog[];
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  testedAt: string;
}

interface TradeLog {
  timestamp: string;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  balance: number;
  reason: string;
}

interface StrategyStats {
  totalStrategies: number;
  activeStrategies: number;
  totalProfit: number;
  averageProfit: number;
  isGenerating: boolean;
  profitThreshold: number;
}

export default function StrategyAutogenLab() {
  const [selectedStrategy, setSelectedStrategy] = useState<GeneratedStrategy | null>(null);
  const [isAutoEvolution, setIsAutoEvolution] = useState(false);
  const queryClient = useQueryClient();

  // Fetch strategies
  const { data: strategiesData, isLoading: strategiesLoading } = useQuery({
    queryKey: ['/api/strategy-autogen/strategies'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['/api/strategy-autogen/stats'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch top performers
  const { data: topPerformersData } = useQuery({
    queryKey: ['/api/strategy-autogen/top-performers'],
    refetchInterval: 15000,
  });

  // Generate new strategy mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/strategy-autogen/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to generate strategy');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategy-autogen/strategies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/strategy-autogen/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/strategy-autogen/top-performers'] });
    },
  });

  // Batch generate strategies mutation
  const batchGenerateMutation = useMutation({
    mutationFn: async (count: number) => {
      const response = await fetch('/api/strategy-autogen/batch-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
      if (!response.ok) throw new Error('Failed to batch generate strategies');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategy-autogen/strategies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/strategy-autogen/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/strategy-autogen/top-performers'] });
    },
  });

  // Evolve strategies mutation
  const evolveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/strategy-autogen/evolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to evolve strategies');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategy-autogen/strategies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/strategy-autogen/stats'] });
    },
  });

  // Delete strategy mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/strategy-autogen/strategy/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete strategy');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategy-autogen/strategies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/strategy-autogen/stats'] });
      setSelectedStrategy(null);
    },
  });

  // Start auto-evolution mutation
  const autoEvolutionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/strategy-autogen/start-auto-evolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalMinutes: 60 }),
      });
      if (!response.ok) throw new Error('Failed to start auto-evolution');
      return response.json();
    },
    onSuccess: () => {
      setIsAutoEvolution(true);
    },
  });

  const strategies: GeneratedStrategy[] = strategiesData?.strategies || [];
  const stats: StrategyStats = statsData?.stats || {
    totalStrategies: 0,
    activeStrategies: 0,
    totalProfit: 0,
    averageProfit: 0,
    isGenerating: false,
    profitThreshold: 50
  };
  const topPerformers: GeneratedStrategy[] = topPerformersData?.strategies || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return "text-green-400";
    if (profit < 0) return "text-red-400";
    return "text-gray-400";
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 30) return "text-green-400";
    if (riskScore < 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Waides KI Strategy Autogen Lab
            </h1>
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Witness Waides KI create, test, and evolve its own trading strategies using advanced AI. 
            Each strategy is battle-tested and only the profitable ones survive.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-black/40 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-gray-400 text-sm">Total Strategies</p>
                  <p className="text-2xl font-bold text-white">{stats.totalStrategies}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-gray-400 text-sm">Active Strategies</p>
                  <p className="text-2xl font-bold text-white">{stats.activeStrategies}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Total Profit</p>
                  <p className={`text-2xl font-bold ${getProfitColor(stats.totalProfit)}`}>
                    {formatCurrency(stats.totalProfit)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-yellow-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-gray-400 text-sm">Avg Profit</p>
                  <p className={`text-2xl font-bold ${getProfitColor(stats.averageProfit)}`}>
                    {formatCurrency(stats.averageProfit)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <Card className="bg-black/40 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Strategy Generation Controls
            </CardTitle>
            <CardDescription className="text-gray-400">
              Create and evolve trading strategies autonomously
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || stats.isGenerating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {generateMutation.isPending ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Strategy
                  </>
                )}
              </Button>

              <Button
                onClick={() => batchGenerateMutation.mutate(5)}
                disabled={batchGenerateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {batchGenerateMutation.isPending ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Batch Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Batch Generate (5)
                  </>
                )}
              </Button>

              <Button
                onClick={() => evolveMutation.mutate()}
                disabled={evolveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {evolveMutation.isPending ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Evolving...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    Evolve All
                  </>
                )}
              </Button>

              <Button
                onClick={() => autoEvolutionMutation.mutate()}
                disabled={autoEvolutionMutation.isPending || isAutoEvolution}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isAutoEvolution ? (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Auto-Evolution Active
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Start Auto-Evolution
                  </>
                )}
              </Button>
            </div>

            {stats.isGenerating && (
              <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2 text-purple-400">
                  <Brain className="w-4 h-4 animate-spin" />
                  <span>Waides KI is creating a new strategy...</span>
                </div>
                <Progress value={65} className="mt-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="all-strategies" className="space-y-4">
          <TabsList className="bg-black/40 border border-purple-500/30">
            <TabsTrigger value="all-strategies" className="text-gray-300">
              All Strategies ({strategies.length})
            </TabsTrigger>
            <TabsTrigger value="top-performers" className="text-gray-300">
              Top Performers ({topPerformers.length})
            </TabsTrigger>
            <TabsTrigger value="strategy-details" className="text-gray-300">
              Strategy Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all-strategies">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {strategiesLoading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-black/40 border-gray-500/30 animate-pulse">
                    <CardContent className="p-4 space-y-3">
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      <div className="h-20 bg-gray-700 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : strategies.length === 0 ? (
                <Card className="col-span-full bg-black/40 border-gray-500/30">
                  <CardContent className="p-8 text-center">
                    <Brain className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      No Strategies Generated Yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Generate your first strategy to see Waides KI's autonomous trading intelligence in action.
                    </p>
                    <Button
                      onClick={() => generateMutation.mutate()}
                      disabled={generateMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Generate First Strategy
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                strategies.map((strategy) => (
                  <Card
                    key={strategy.id}
                    className={`bg-black/40 border cursor-pointer transition-all hover:scale-105 ${
                      strategy.isActive ? 'border-green-500/50' : 'border-gray-500/30'
                    } ${selectedStrategy?.id === strategy.id ? 'ring-2 ring-purple-500' : ''}`}
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-sm">{strategy.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={strategy.isActive ? "default" : "secondary"}
                            className={strategy.isActive ? "bg-green-600" : "bg-gray-600"}
                          >
                            {strategy.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMutation.mutate(strategy.id);
                            }}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-gray-400 text-xs">
                        {strategy.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Profit:</span>
                          <span className={`font-semibold ${getProfitColor(strategy.profit)}`}>
                            {formatCurrency(strategy.profit)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Win Rate:</span>
                          <span className="text-white font-semibold">
                            {strategy.winRate.toFixed(1)}%
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Risk Score:</span>
                          <span className={`font-semibold ${getRiskColor(strategy.riskScore)}`}>
                            {strategy.riskScore.toFixed(0)}/100
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Trades:</span>
                          <span className="text-white font-semibold">{strategy.totalTrades}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Trend:</span>
                          <div className="flex items-center gap-1">
                            {strategy.performanceTrend >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            <span className={getProfitColor(strategy.performanceTrend)}>
                              {formatCurrency(Math.abs(strategy.performanceTrend))}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">
                          Created: {formatDate(strategy.createdAt)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="top-performers">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {topPerformers.length === 0 ? (
                <Card className="col-span-full bg-black/40 border-gray-500/30">
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      No Top Performers Yet
                    </h3>
                    <p className="text-gray-500">
                      Generate more strategies to see top performers.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                topPerformers.map((strategy, index) => (
                  <Card
                    key={strategy.id}
                    className="bg-black/40 border-yellow-500/50 cursor-pointer transition-all hover:scale-105"
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-black font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle className="text-white text-sm">{strategy.name}</CardTitle>
                          <CardDescription className="text-gray-400 text-xs">
                            {strategy.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Profit:</span>
                          <span className={`font-bold ${getProfitColor(strategy.profit)}`}>
                            {formatCurrency(strategy.profit)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Win Rate:</span>
                          <span className="text-green-400 font-bold">
                            {strategy.winRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="strategy-details">
            {selectedStrategy ? (
              <Card className="bg-black/40 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-purple-400" />
                    {selectedStrategy.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {selectedStrategy.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-purple-900/30 rounded-lg">
                      <p className="text-gray-400 text-sm">Profit</p>
                      <p className={`text-xl font-bold ${getProfitColor(selectedStrategy.profit)}`}>
                        {formatCurrency(selectedStrategy.profit)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-900/30 rounded-lg">
                      <p className="text-gray-400 text-sm">Win Rate</p>
                      <p className="text-xl font-bold text-green-400">
                        {selectedStrategy.winRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-blue-900/30 rounded-lg">
                      <p className="text-gray-400 text-sm">Total Trades</p>
                      <p className="text-xl font-bold text-blue-400">
                        {selectedStrategy.totalTrades}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-yellow-900/30 rounded-lg">
                      <p className="text-gray-400 text-sm">Risk Score</p>
                      <p className={`text-xl font-bold ${getRiskColor(selectedStrategy.riskScore)}`}>
                        {selectedStrategy.riskScore.toFixed(0)}/100
                      </p>
                    </div>
                  </div>

                  {/* Strategy Code */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Code className="w-4 h-4 text-purple-400" />
                      Generated Strategy Code
                    </h3>
                    <ScrollArea className="h-64 w-full border border-gray-600 rounded-lg">
                      <pre className="p-4 text-sm text-gray-300 bg-black/50">
                        {selectedStrategy.code}
                      </pre>
                    </ScrollArea>
                  </div>

                  {/* Backtest Results */}
                  {selectedStrategy.backtestResults.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        Backtest History
                      </h3>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {selectedStrategy.backtestResults.map((result, index) => (
                            <div key={index} className="p-3 bg-gray-900/50 rounded-lg">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-400">Profit: </span>
                                  <span className={getProfitColor(result.profit)}>
                                    {formatCurrency(result.profit)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Win Rate: </span>
                                  <span className="text-white">{result.winRate.toFixed(1)}%</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Trades: </span>
                                  <span className="text-white">{result.trades.length}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Tested: </span>
                                  <span className="text-white">{formatDate(result.testedAt)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-black/40 border-gray-500/30">
                <CardContent className="p-8 text-center">
                  <Code className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">
                    No Strategy Selected
                  </h3>
                  <p className="text-gray-500">
                    Click on a strategy from the list to view its details.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}