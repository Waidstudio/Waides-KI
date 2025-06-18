import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Shield, 
  Activity,
  BarChart3,
  Settings,
  Play,
  Pause,
  AlertTriangle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Position {
  symbol: string;
  quantity: number;
  entryPrice: number;
  entryTime: number;
  positionType: 'LONG' | 'SHORT';
  unrealizedPnL: number;
  realizedPnL: number;
}

interface PortfolioStats {
  totalValue: number;
  availableBalance: number;
  totalPnL: number;
  dailyPnL: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  positions: Position[];
}

interface Trade {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  price: number;
  timestamp: number;
  type: 'OPEN' | 'CLOSE';
  pnl?: number;
  reason?: string;
  confidence?: number;
}

export default function PortfolioManager() {
  const [autoTradingEnabled, setAutoTradingEnabled] = useState(false);
  const [riskParams, setRiskParams] = useState({
    maxPositionSize: 20,
    stopLossPercentage: 5,
    takeProfitPercentage: 15,
    maxDrawdown: 15,
    maxDailyLoss: 5
  });

  const { data: portfolioStats, isLoading: statsLoading } = useQuery<PortfolioStats>({
    queryKey: ['/api/portfolio/stats'],
    refetchInterval: 5000,
  });

  const { data: recentTrades, isLoading: tradesLoading } = useQuery<Trade[]>({
    queryKey: ['/api/portfolio/trades'],
    refetchInterval: 10000,
  });

  const { data: mlPrediction } = useQuery({
    queryKey: ['/api/ml/prediction'],
    refetchInterval: 15000,
  });

  const updateRiskParamsMutation = useMutation({
    mutationFn: (params: any) => apiRequest('/api/portfolio/risk-params', 'POST', params),
    onSuccess: () => {
      console.log('Risk parameters updated successfully');
    }
  });

  const openPositionMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/portfolio/position/open', 'POST', data),
    onSuccess: () => {
      console.log('Position opened successfully');
    }
  });

  const closePositionMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/portfolio/position/close', 'POST', data),
    onSuccess: () => {
      console.log('Position closed successfully');
    }
  });

  const handleUpdateRiskParams = () => {
    const formattedParams = {
      maxPositionSize: riskParams.maxPositionSize / 100,
      stopLossPercentage: riskParams.stopLossPercentage / 100,
      takeProfitPercentage: riskParams.takeProfitPercentage / 100,
      maxDrawdown: riskParams.maxDrawdown / 100,
      maxDailyLoss: riskParams.maxDailyLoss / 100
    };
    updateRiskParamsMutation.mutate(formattedParams);
  };

  const handleManualTrade = (action: 'BUY_ETH3L' | 'BUY_ETH3S') => {
    const currentPrice = 2530; // This would come from real market data
    const confidence = 0.8;
    const symbol = action === 'BUY_ETH3L' ? 'ETH3L' : 'ETH3S';
    const side = action === 'BUY_ETH3L' ? 'LONG' : 'SHORT';

    openPositionMutation.mutate({
      symbol,
      side,
      currentPrice,
      confidence
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  if (statsLoading) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Portfolio Manager</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <CardTitle>Portfolio Manager</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={autoTradingEnabled ? "destructive" : "default"}
              size="sm"
              onClick={() => setAutoTradingEnabled(!autoTradingEnabled)}
              className="flex items-center space-x-2"
            >
              {autoTradingEnabled ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Stop Auto</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start Auto</span>
                </>
              )}
            </Button>
          </div>
        </div>
        <CardDescription>
          Self-learning portfolio with ML-driven risk management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="risk">Risk</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Portfolio Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-400">Total Value</span>
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(portfolioStats?.totalValue || 0)}
                </div>
                <div className={`text-sm ${
                  (portfolioStats?.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(portfolioStats?.totalPnL || 0) >= 0 ? '+' : ''}{formatCurrency(portfolioStats?.totalPnL || 0)}
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-400">Daily P&L</span>
                </div>
                <div className={`text-xl font-bold ${
                  (portfolioStats?.dailyPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(portfolioStats?.dailyPnL || 0) >= 0 ? '+' : ''}{formatCurrency(portfolioStats?.dailyPnL || 0)}
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-400">Win Rate</span>
                </div>
                <div className="text-xl font-bold">
                  {formatPercentage(portfolioStats?.winRate || 0)}
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-slate-400">Sharpe Ratio</span>
                </div>
                <div className="text-xl font-bold">
                  {(portfolioStats?.sharpeRatio || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* ML Prediction */}
            {mlPrediction && (
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-lg border border-purple-500/30">
                <h3 className="text-lg font-semibold mb-3 text-purple-300">ML Prediction</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-purple-400">Trend Probability</div>
                    <div className="text-lg font-bold">{((mlPrediction as any).trendProbability * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-purple-400">Volatility Risk</div>
                    <div className="text-lg font-bold">{((mlPrediction as any).volatilityRisk * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-purple-400">Confidence</div>
                    <div className="text-lg font-bold">{((mlPrediction as any).confidence * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-purple-400">Recommendation</div>
                    <Badge variant="outline" className="text-purple-300 border-purple-500">
                      {(mlPrediction as any).recommendation}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Trading Controls */}
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Manual Trading</h3>
              <div className="flex space-x-4">
                <Button
                  onClick={() => handleManualTrade('BUY_ETH3L')}
                  disabled={openPositionMutation.isPending}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Buy ETH3L</span>
                </Button>
                <Button
                  onClick={() => handleManualTrade('BUY_ETH3S')}
                  disabled={openPositionMutation.isPending}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>Buy ETH3S</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="positions" className="space-y-4">
            {portfolioStats?.positions && portfolioStats.positions.length > 0 ? (
              portfolioStats.positions.map((position, index) => (
                <div key={index} className="bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Badge variant={position.positionType === 'LONG' ? 'default' : 'destructive'}>
                        {position.positionType}
                      </Badge>
                      <span className="font-semibold">{position.symbol}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => closePositionMutation.mutate({
                        symbol: position.symbol,
                        currentPrice: position.entryPrice * 1.02, // Mock current price
                        reason: 'Manual close'
                      })}
                    >
                      Close
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400">Quantity</div>
                      <div>{position.quantity.toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Entry Price</div>
                      <div>{formatCurrency(position.entryPrice)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Unrealized P&L</div>
                      <div className={position.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatCurrency(position.unrealizedPnL)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Duration</div>
                      <div>{Math.floor((Date.now() - position.entryTime) / (1000 * 60))} min</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">
                No open positions
              </div>
            )}
          </TabsContent>

          <TabsContent value="trades" className="space-y-4">
            {recentTrades && recentTrades.length > 0 ? (
              recentTrades.map((trade, index) => (
                <div key={trade.id || index} className="bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Badge variant={trade.type === 'OPEN' ? 'default' : 'secondary'}>
                        {trade.type}
                      </Badge>
                      <Badge variant={trade.side === 'LONG' ? 'default' : 'destructive'}>
                        {trade.side}
                      </Badge>
                      <span className="font-semibold">{trade.symbol}</span>
                    </div>
                    <div className="text-sm text-slate-400">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400">Quantity</div>
                      <div>{trade.quantity.toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Price</div>
                      <div>{formatCurrency(trade.price)}</div>
                    </div>
                    {trade.pnl !== undefined && (
                      <div>
                        <div className="text-slate-400">P&L</div>
                        <div className={trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {formatCurrency(trade.pnl)}
                        </div>
                      </div>
                    )}
                    {trade.confidence && (
                      <div>
                        <div className="text-slate-400">Confidence</div>
                        <div>{(trade.confidence * 100).toFixed(1)}%</div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">
                No recent trades
              </div>
            )}
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold">Risk Parameters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxPosition">Max Position Size (%)</Label>
                  <Input
                    id="maxPosition"
                    type="number"
                    value={riskParams.maxPositionSize}
                    onChange={(e) => setRiskParams(prev => ({
                      ...prev,
                      maxPositionSize: parseFloat(e.target.value)
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="stopLoss">Stop Loss (%)</Label>
                  <Input
                    id="stopLoss"
                    type="number"
                    value={riskParams.stopLossPercentage}
                    onChange={(e) => setRiskParams(prev => ({
                      ...prev,
                      stopLossPercentage: parseFloat(e.target.value)
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="takeProfit">Take Profit (%)</Label>
                  <Input
                    id="takeProfit"
                    type="number"
                    value={riskParams.takeProfitPercentage}
                    onChange={(e) => setRiskParams(prev => ({
                      ...prev,
                      takeProfitPercentage: parseFloat(e.target.value)
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxDrawdown">Max Drawdown (%)</Label>
                  <Input
                    id="maxDrawdown"
                    type="number"
                    value={riskParams.maxDrawdown}
                    onChange={(e) => setRiskParams(prev => ({
                      ...prev,
                      maxDrawdown: parseFloat(e.target.value)
                    }))}
                  />
                </div>
              </div>
              <Button
                onClick={handleUpdateRiskParams}
                disabled={updateRiskParamsMutation.isPending}
                className="mt-4"
              >
                Update Risk Parameters
              </Button>
            </div>

            {/* Risk Warnings */}
            <div className="bg-orange-900/30 border border-orange-500/50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h4 className="font-semibold text-orange-300">Risk Warning</h4>
              </div>
              <p className="text-sm text-orange-200">
                Leveraged ETF trading (ETH3L/ETH3S) involves significant risk of loss. 
                The ML system is experimental and past performance does not guarantee future results.
                Only trade with funds you can afford to lose.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}