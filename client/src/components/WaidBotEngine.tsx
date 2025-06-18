import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, TrendingDown, Eye, Zap, Activity, Play, Square, RefreshCw } from "lucide-react";

interface WaidDecision {
  action: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'OBSERVE';
  reasoning: string;
  confidence: number;
  konsWisdom: string;
  ethPosition: 'LONG' | 'NEUTRAL';
  tradingPair: 'ETH/USDT' | 'NONE';
  quantity: number;
  urgency: 'IMMEDIATE' | 'WITHIN_HOUR' | 'WHEN_READY' | 'PATIENCE';
  btcConfirmation?: {
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    strength: number;
    supportLevel: number;
  };
  solConfirmation?: {
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    strength: number;
    momentum: number;
  };
}

interface KonsLangAnalysis {
  marketMood: 'EUPHORIC' | 'FEARFUL' | 'GREEDY' | 'CONFUSED' | 'BALANCED';
  ethVibration: 'ASCENDING' | 'DESCENDING' | 'OSCILLATING' | 'DORMANT';
  divineAlignment: number;
  tradingWindow: 'SACRED' | 'NORMAL' | 'FORBIDDEN';
  konsMessage: string;
}

interface WaidBotStatus {
  tradingEnabled: boolean;
  lastDecision: WaidDecision | null;
  decisionHistory: WaidDecision[];
  totalDecisions: number;
}

export default function WaidBotEngine() {
  const queryClient = useQueryClient();

  const { data: status, isLoading: statusLoading } = useQuery<WaidBotStatus>({
    queryKey: ['/api/waidbot/status'],
    refetchInterval: 3000,
  });

  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['/api/waidbot/analysis'],
    refetchInterval: 5000,
  });

  const { data: decision, isLoading: decisionLoading } = useQuery({
    queryKey: ['/api/waidbot/decision'],
    refetchInterval: 10000,
  });

  const enableMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot/enable', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot/status'] });
    }
  });

  const disableMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot/disable', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot/status'] });
    }
  });

  const executeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waidbot/execute', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot/status'] });
    }
  });

  if (statusLoading || analysisLoading || decisionLoading) {
    return (
      <div className="space-y-6">
        <Card className="waides-card waides-border border animate-pulse">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-purple-500" />
              <span>WaidBot KonsLang Engine</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="waides-text-secondary">Initializing KonsLang Analysis...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const konsAnalysis: KonsLangAnalysis = (analysis as any)?.konsAnalysis || {
    marketMood: 'BALANCED',
    ethVibration: 'DORMANT',
    divineAlignment: 50,
    tradingWindow: 'NORMAL',
    konsMessage: 'KonsLang analysis initializing...'
  };
  const currentDecision: WaidDecision = (decision as any)?.decision || {
    action: 'OBSERVE',
    reasoning: 'Analyzing market conditions...',
    confidence: 0,
    konsWisdom: 'Patience brings clarity.',
    ethPosition: 'NEUTRAL',
    tradingPair: 'NONE',
    quantity: 0,
    urgency: 'PATIENCE'
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY_ETH3L': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'BUY_ETH3S': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'SELL_ETH3L': case 'SELL_ETH3S': return <RefreshCw className="w-4 h-4 text-orange-500" />;
      case 'HOLD': return <Activity className="w-4 h-4 text-blue-500" />;
      default: return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'EUPHORIC': return 'text-green-400';
      case 'FEARFUL': return 'text-red-400';
      case 'GREEDY': return 'text-yellow-400';
      case 'CONFUSED': return 'text-gray-400';
      case 'BALANCED': return 'text-blue-400';
      default: return 'text-purple-400';
    }
  };

  const getVibrationColor = (vibration: string) => {
    switch (vibration) {
      case 'ASCENDING': return 'text-green-400';
      case 'DESCENDING': return 'text-red-400';
      case 'OSCILLATING': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* WaidBot Status Header */}
      <Card className="waides-card waides-border border bg-gradient-to-br from-purple-900/20 to-blue-900/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-purple-500" />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                WaidBot KonsLang Engine
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {status?.tradingEnabled ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    ACTIVE
                  </Badge>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                    INACTIVE
                  </Badge>
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm waides-text-secondary">
            KonsLang-powered autonomous ETH spot trading without external APIs
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => enableMutation.mutate()}
              disabled={enableMutation.isPending || status?.tradingEnabled}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600"
            >
              <Play className="w-4 h-4 mr-2" />
              Enable Trading
            </Button>
            
            <Button
              onClick={() => disableMutation.mutate()}
              disabled={disableMutation.isPending || !status?.tradingEnabled}
              variant="destructive"
              className="bg-red-600 hover:bg-red-500"
            >
              <Square className="w-4 h-4 mr-2" />
              Disable Trading
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KonsLang Analysis */}
      {konsAnalysis && (
        <Card className="waides-card waides-border border">
          <CardHeader>
            <CardTitle className="text-lg">KonsLang Market Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm waides-text-secondary mb-1">Market Mood</div>
                <div className={`font-bold ${getMoodColor(konsAnalysis.marketMood)}`}>
                  {konsAnalysis.marketMood}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm waides-text-secondary mb-1">ETH Vibration</div>
                <div className={`font-bold ${getVibrationColor(konsAnalysis.ethVibration)}`}>
                  {konsAnalysis.ethVibration}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm waides-text-secondary mb-1">Divine Alignment</div>
                <div className="font-bold text-purple-400">
                  {konsAnalysis.divineAlignment}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm waides-text-secondary mb-1">Trading Window</div>
                <div className={`font-bold ${
                  konsAnalysis.tradingWindow === 'SACRED' ? 'text-green-400' :
                  konsAnalysis.tradingWindow === 'FORBIDDEN' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {konsAnalysis.tradingWindow}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-sm waides-text-secondary mb-2">Divine Alignment Progress</div>
              <Progress value={konsAnalysis.divineAlignment} className="h-2" />
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="text-sm waides-text-secondary mb-2">KonsLang Message</div>
              <p className="text-purple-300 font-medium italic">
                "{konsAnalysis.konsMessage}"
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Decision */}
      {currentDecision && (
        <Card className="waides-card waides-border border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>WaidBot Decision</span>
              <div className="flex items-center space-x-2">
                {getActionIcon(currentDecision.action)}
                <Badge className={`${
                  currentDecision.action.includes('BUY') ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  currentDecision.action.includes('SELL') ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  'bg-gray-500/20 text-gray-400 border-gray-500/30'
                }`}>
                  {currentDecision.action}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="text-sm waides-text-secondary">Trading Pair</div>
                <div className="font-semibold text-purple-400">
                  {currentDecision.tradingPair}
                </div>
              </div>
              
              <div>
                <div className="text-sm waides-text-secondary">Position</div>
                <div className={`font-semibold ${
                  currentDecision.ethPosition === 'LONG' ? 'text-green-400' : 
                  currentDecision.ethPosition === 'SHORT' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {currentDecision.ethPosition}
                </div>
              </div>
              
              <div>
                <div className="text-sm waides-text-secondary">Confidence</div>
                <div className="font-semibold text-purple-400">
                  {currentDecision.confidence}%
                </div>
              </div>
              
              <div>
                <div className="text-sm waides-text-secondary">Urgency</div>
                <div className={`font-semibold ${
                  currentDecision.urgency === 'IMMEDIATE' ? 'text-red-400' :
                  currentDecision.urgency === 'WITHIN_HOUR' ? 'text-yellow-400' : 'text-blue-400'
                }`}>
                  {currentDecision.urgency}
                </div>
              </div>
            </div>

            {currentDecision.quantity > 0 && (
              <div>
                <div className="text-sm waides-text-secondary mb-1">Position Size</div>
                <div className="font-semibold text-purple-400">
                  {currentDecision.quantity} USDT
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <div className="text-sm waides-text-secondary mb-2">KonsLang Reasoning</div>
                <p className="text-sm waides-text-primary">
                  {currentDecision.reasoning}
                </p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="text-sm waides-text-secondary mb-1">Divine Wisdom</div>
                <p className="text-purple-300 font-medium italic text-sm">
                  "{currentDecision.konsWisdom}"
                </p>
              </div>
            </div>

            {status?.tradingEnabled && currentDecision.action !== 'OBSERVE' && currentDecision.action !== 'HOLD' && (
              <div className="border-t border-slate-700/50 pt-4">
                <Button
                  onClick={() => executeMutation.mutate()}
                  disabled={executeMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-500"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Execute Decision
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Decision History */}
      {status?.decisionHistory && status.decisionHistory.length > 0 && (
        <Card className="waides-card waides-border border">
          <CardHeader>
            <CardTitle>Recent Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {status.decisionHistory.slice(-5).reverse().map((decision, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    {getActionIcon(decision.action)}
                    <span className="font-medium text-sm">
                      {decision.action}
                    </span>
                    {decision.tradingPair !== 'NONE' && (
                      <Badge variant="outline" className="text-xs">
                        {decision.tradingPair}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm waides-text-secondary">
                    {decision.confidence}% confidence
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trading Pairs Info */}
      <Card className="waides-card waides-border border">
        <CardHeader>
          <CardTitle>ETH Trading Pairs (Bybit Spot)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-blue-400">ETH/USDT</span>
              </div>
              <p className="text-xs waides-text-secondary">
                Direct ETH spot trading
              </p>
            </div>
            
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="font-semibold text-green-400">ETH3L/USDT</span>
              </div>
              <p className="text-xs waides-text-secondary">
                3x Long ETH spot token
              </p>
            </div>
            
            <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <span className="font-semibold text-red-400">ETH3S/USDT</span>
              </div>
              <p className="text-xs waides-text-secondary">
                3x Short ETH spot token
              </p>
            </div>
          </div>
          
          <div className="text-xs waides-text-secondary">
            WaidBot uses KonsLang AI to capture micro-movements across all ETH pairs for maximum profit
          </div>
        </CardContent>
      </Card>
    </div>
  );
}