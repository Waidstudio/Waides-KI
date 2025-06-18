import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Robot, Zap, Play, Square, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Activity } from "lucide-react";

interface UltimateBotSignal {
  action: string;
  timeframe: string;
  reason: string;
  moralPulse: string;
  strategy: string;
  signalCode: string;
  receivedAt: string;
  konsTitle: string;
  energeticPurity: number;
  konsMirror: string;
  breathLock: boolean;
  ethWhisperMode: boolean;
  autoCancelEvil: boolean;
  smaiPredict: {
    nextHourDirection: string;
    confidence: number;
    predictedPriceRange: { min: number; max: number };
  };
}

interface AutomatedTradingStatus {
  is_running: boolean;
  pionex_configured: boolean;
  last_trade_time: number;
  trade_count: number;
}

interface TradeHistory {
  history: Array<{
    action: string;
    quantity: number;
    price: number;
    timestamp: number;
    order_id?: string;
    result: any;
  }>;
  performance: {
    total_trades: number;
    profitable_trades: number;
    total_pnl: number;
    win_rate: number;
  };
}

export default function UltimateBot() {
  const [tradeQuantity, setTradeQuantity] = useState("0.01");
  const [automationInterval, setAutomationInterval] = useState("300");
  const queryClient = useQueryClient();

  // Get Ultimate Bot Signal
  const { data: ultimateSignal, isLoading: signalLoading } = useQuery<UltimateBotSignal>({
    queryKey: ['/api/ultimate-bot/signal'],
    refetchInterval: 30000, // 30 seconds
    retry: 1
  });

  // Get Automated Trading Status
  const { data: tradingStatus } = useQuery<AutomatedTradingStatus>({
    queryKey: ['/api/ultimate-bot/automated-trading/status'],
    refetchInterval: 10000, // 10 seconds
    retry: 1
  });

  // Get Trade History
  const { data: tradeHistory } = useQuery<TradeHistory>({
    queryKey: ['/api/ultimate-bot/trade-history'],
    refetchInterval: 30000, // 30 seconds
    retry: 1
  });

  // Execute Auto Trade Mutation
  const autoTradeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ultimate-bot/auto-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to execute auto trade');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ultimate-bot/trade-history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ultimate-bot/signal'] });
    }
  });

  // Manual Trade Mutation
  const manualTradeMutation = useMutation({
    mutationFn: async ({ action, quantity }: { action: string; quantity: number }) => {
      const response = await fetch('/api/ultimate-bot/manual-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, quantity })
      });
      if (!response.ok) throw new Error('Failed to execute manual trade');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ultimate-bot/trade-history'] });
    }
  });

  // Start Automated Trading Mutation
  const startAutomationMutation = useMutation({
    mutationFn: async (interval: number) => {
      const response = await fetch('/api/ultimate-bot/automated-trading/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval })
      });
      if (!response.ok) throw new Error('Failed to start automation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ultimate-bot/automated-trading/status'] });
    }
  });

  // Stop Automated Trading Mutation
  const stopAutomationMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ultimate-bot/automated-trading/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to stop automation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ultimate-bot/automated-trading/status'] });
    }
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY_LONG': return 'text-green-400';
      case 'SELL_SHORT': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY_LONG': return <TrendingUp className="w-4 h-4" />;
      case 'SELL_SHORT': return <TrendingDown className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Ultimate Bot Header */}
      <Card className="waides-card waides-border border bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <CardHeader>
          <CardTitle className="text-xl waides-text-primary flex items-center space-x-3">
            <Robot className="w-6 h-6 text-purple-400" />
            <span>Ultimate ETH Trading Bot</span>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400">
              Kons Powa Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-400">
                {tradingStatus?.pionex_configured ? '✅' : '❌'}
              </div>
              <div className="text-sm waides-text-secondary">Pionex Connected</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-400">
                {tradingStatus?.trade_count || 0}
              </div>
              <div className="text-sm waides-text-secondary">Total Trades</div>
            </div>
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${tradingStatus?.is_running ? 'text-green-400' : 'text-gray-400'}`}>
                {tradingStatus?.is_running ? <Activity className="w-8 h-8 mx-auto" /> : <Square className="w-8 h-8 mx-auto" />}
              </div>
              <div className="text-sm waides-text-secondary">
                {tradingStatus?.is_running ? 'Running' : 'Stopped'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Divine Signal Display */}
        <Card className="waides-card waides-border border">
          <CardHeader>
            <CardTitle className="text-lg waides-text-primary flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Divine Signal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {signalLoading ? (
              <div className="text-center text-slate-400 py-8">Loading divine signal...</div>
            ) : ultimateSignal ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm waides-text-secondary">Action</span>
                  <div className={`flex items-center space-x-2 ${getActionColor(ultimateSignal.action)}`}>
                    {getActionIcon(ultimateSignal.action)}
                    <span className="font-semibold">{ultimateSignal.action}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm waides-text-secondary">Kons Title</span>
                  <span className="font-medium text-purple-400">{ultimateSignal.konsTitle}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm waides-text-secondary">Energetic Purity</span>
                  <span className="font-medium">{ultimateSignal.energeticPurity}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm waides-text-secondary">Moral Pulse</span>
                  <Badge variant="outline" className={
                    ultimateSignal.moralPulse === 'CLEAN' ? 'bg-green-500/20 text-green-400' :
                    ultimateSignal.moralPulse === 'FEARFUL' ? 'bg-yellow-500/20 text-yellow-400' :
                    ultimateSignal.moralPulse === 'GREEDY' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                  }>
                    {ultimateSignal.moralPulse}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm waides-text-secondary">SmaiPredict</span>
                  <div className="flex items-center space-x-2">
                    {ultimateSignal.smaiPredict.nextHourDirection === 'UP' ? 
                      <TrendingUp className="w-4 h-4 text-green-400" /> :
                      ultimateSignal.smaiPredict.nextHourDirection === 'DOWN' ?
                      <TrendingDown className="w-4 h-4 text-red-400" /> :
                      <AlertTriangle className="w-4 h-4 text-gray-400" />
                    }
                    <span className="text-sm font-medium">
                      {ultimateSignal.smaiPredict.nextHourDirection} ({ultimateSignal.smaiPredict.confidence}%)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center space-x-2">
                    {ultimateSignal.breathLock ? 
                      <CheckCircle className="w-4 h-4 text-green-400" /> :
                      <XCircle className="w-4 h-4 text-red-400" />
                    }
                    <span className="text-xs">BreathLock</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {ultimateSignal.ethWhisperMode ? 
                      <CheckCircle className="w-4 h-4 text-blue-400" /> :
                      <XCircle className="w-4 h-4 text-gray-400" />
                    }
                    <span className="text-xs">ETH Whisper</span>
                  </div>
                </div>

                <div className="text-xs waides-text-secondary text-center pt-2">
                  Signal: {ultimateSignal.signalCode}
                </div>
              </>
            ) : (
              <div className="text-center text-red-400 py-8">
                Failed to connect to Ultimate Bot backend
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trading Controls */}
        <Card className="waides-card waides-border border">
          <CardHeader>
            <CardTitle className="text-lg waides-text-primary">Trading Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Manual Trading */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold waides-text-primary">Manual Trading</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm">Trade Quantity (ETH)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.001"
                    value={tradeQuantity}
                    onChange={(e) => setTradeQuantity(e.target.value)}
                    className="waides-input"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => autoTradeMutation.mutate()}
                    disabled={autoTradeMutation.isPending || !ultimateSignal?.breathLock}
                    className="bg-purple-600 hover:bg-purple-500"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Auto Trade
                  </Button>
                  
                  <Button
                    onClick={() => manualTradeMutation.mutate({ 
                      action: ultimateSignal?.action || 'NO_TRADE', 
                      quantity: parseFloat(tradeQuantity) 
                    })}
                    disabled={manualTradeMutation.isPending}
                    variant="outline"
                  >
                    Manual Execute
                  </Button>
                </div>
              </div>
            </div>

            {/* Automated Trading */}
            <div className="space-y-4 border-t border-slate-700/50 pt-4">
              <h4 className="text-sm font-semibold waides-text-primary">Automated Trading</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="interval" className="text-sm">Interval (seconds)</Label>
                  <Input
                    id="interval"
                    type="number"
                    value={automationInterval}
                    onChange={(e) => setAutomationInterval(e.target.value)}
                    className="waides-input"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => startAutomationMutation.mutate(parseInt(automationInterval))}
                    disabled={startAutomationMutation.isPending || tradingStatus?.is_running}
                    className="bg-green-600 hover:bg-green-500"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Bot
                  </Button>
                  
                  <Button
                    onClick={() => stopAutomationMutation.mutate()}
                    disabled={stopAutomationMutation.isPending || !tradingStatus?.is_running}
                    className="bg-red-600 hover:bg-red-500"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Bot
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      {tradeHistory && (
        <Card className="waides-card waides-border border">
          <CardHeader>
            <CardTitle className="text-lg waides-text-primary">Performance Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold waides-text-primary">
                  {tradeHistory.performance.total_trades}
                </div>
                <div className="text-sm waides-text-secondary">Total Trades</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-400">
                  {tradeHistory.performance.profitable_trades}
                </div>
                <div className="text-sm waides-text-secondary">Profitable</div>
              </div>
              <div className="space-y-2">
                <div className={`text-2xl font-bold ${tradeHistory.performance.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${tradeHistory.performance.total_pnl}
                </div>
                <div className="text-sm waides-text-secondary">Total P&L</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold waides-text-primary">
                  {tradeHistory.performance.win_rate}%
                </div>
                <div className="text-sm waides-text-secondary">Win Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}