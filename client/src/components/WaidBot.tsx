import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Activity, BarChart3, AlertCircle, Play, Pause } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface WaidBotDecision {
  action: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'OBSERVE';
  reasoning: string;
  confidence: number;
  ethPosition: 'LONG' | 'NEUTRAL';
  tradingPair: 'ETH/USDT' | 'NONE';
  quantity: number;
  trendDirection: 'UPWARD' | 'DOWNWARD' | 'SIDEWAYS';
  autoTradingEnabled: boolean;
  timestamp: number;
}

interface WaidBotStatus {
  isActive: boolean;
  autoTradingEnabled: boolean;
  currentPosition: 'LONG' | 'NEUTRAL';
  totalTrades: number;
  winRate: number;
  currentBalance: number;
  lastDecision: WaidBotDecision | null;
}

export function WaidBot() {
  const [isGeneratingDecision, setIsGeneratingDecision] = useState(false);

  // Fetch WaidBot status
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/waidbot/status'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch decision history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/waidbot/history'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Toggle auto-trading mutation
  const toggleMutation = useMutation({
    mutationFn: (enabled: boolean) => 
      apiRequest('/api/waidbot/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot/status'] });
    }
  });

  // Generate decision mutation
  const decisionMutation = useMutation({
    mutationFn: () => 
      apiRequest('/api/waidbot/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot/history'] });
      setIsGeneratingDecision(false);
    }
  });

  const status: WaidBotStatus = statusData?.status || {
    isActive: false,
    autoTradingEnabled: false,
    currentPosition: 'NEUTRAL',
    totalTrades: 0,
    winRate: 0,
    currentBalance: 10000,
    lastDecision: null
  };

  const history: WaidBotDecision[] = historyData?.history || [];

  const handleToggleTrading = () => {
    toggleMutation.mutate(!status.autoTradingEnabled);
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

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'UPWARD': return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'DOWNWARD': return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'SIDEWAYS': return <Activity className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">WaidBot</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Basic Long-Only ETH Trading Bot - Focuses on upward trends only
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={status.autoTradingEnabled ? "default" : "secondary"} className="px-3 py-1">
            {status.autoTradingEnabled ? "AUTO TRADING ON" : "AUTO TRADING OFF"}
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Trading Controls
          </CardTitle>
          <CardDescription>
            Manage WaidBot auto-trading and generate manual decisions
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
                  Stop Auto Trading
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Auto Trading
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
              {isGeneratingDecision ? "Analyzing..." : "Generate Decision"}
            </Button>
          </div>

          {toggleMutation.isPending && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Updating trading settings...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Position</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {status.currentPosition}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
                  ${status.currentBalance.toLocaleString()}
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
            <CardTitle>Latest Decision</CardTitle>
            <CardDescription>
              Most recent trading decision from WaidBot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge className={getActionColor(status.lastDecision.action)}>
                {status.lastDecision.action}
              </Badge>
              <div className="flex items-center gap-2">
                {getTrendIcon(status.lastDecision.trendDirection)}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {status.lastDecision.trendDirection} Trend
                </span>
              </div>
              <Badge variant="outline">
                {status.lastDecision.confidence}% Confidence
              </Badge>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Reasoning:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {status.lastDecision.reasoning}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                <p className="font-medium text-gray-900 dark:text-white">
                  {status.lastDecision.ethPosition}
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

      {/* Decision History */}
      <Card>
        <CardHeader>
          <CardTitle>Decision History</CardTitle>
          <CardDescription>
            Recent trading decisions and their outcomes
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
              <p className="text-gray-600 dark:text-gray-400">No trading decisions yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Enable auto-trading or generate a manual decision to see history
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.slice(0, 10).map((decision, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className={getActionColor(decision.action)}>
                        {decision.action}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(decision.trendDirection)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {decision.trendDirection}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(decision.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {decision.reasoning}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Confidence: {decision.confidence}%</span>
                    <span>Size: {(decision.quantity * 100).toFixed(1)}%</span>
                    <span>Pair: {decision.tradingPair}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}