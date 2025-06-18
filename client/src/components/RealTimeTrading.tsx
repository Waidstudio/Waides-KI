import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Play, Square, Zap, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";

interface RealTimeTradingStatus {
  isRunning: boolean;
  waidConfigured: boolean;
  message: string;
}

export default function RealTimeTrading() {
  const queryClient = useQueryClient();
  
  const { data: status, isLoading } = useQuery<RealTimeTradingStatus>({
    queryKey: ['/api/realtime-trading/status'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const startTradingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/realtime-trading/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/realtime-trading/status'] });
    }
  });

  const stopTradingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/realtime-trading/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/realtime-trading/status'] });
    }
  });

  if (isLoading) {
    return (
      <Card className="waides-card waides-border border animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-500" />
            <span>Real-Time Trading Engine</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="waides-text-secondary">Loading trading status...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="waides-card waides-border border bg-gradient-to-br from-green-900/20 to-blue-900/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-500" />
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Real-Time Trading Engine
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {status?.isRunning ? (
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
      
      <CardContent className="space-y-6">
        {/* Status Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm waides-text-secondary">Trading Status</div>
            <div className="flex items-center space-x-2">
              {status?.isRunning ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className={`text-sm font-medium ${status?.isRunning ? 'text-green-400' : 'text-gray-400'}`}>
                {status?.isRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm waides-text-secondary">Waid API</div>
            <div className="flex items-center space-x-2">
              {status?.waidConfigured ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${status?.waidConfigured ? 'text-green-400' : 'text-red-400'}`}>
                {status?.waidConfigured ? 'Configured' : 'Not Configured'}
              </span>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="text-sm waides-text-secondary mb-2">System Message</div>
          <p className="text-purple-300 font-medium">{status?.message}</p>
        </div>

        {/* Real-Time Features */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold waides-text-primary">Real-Time Features</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>15-second execution cycle</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span>Divine signal integration</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span>Automatic trade execution</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-3 h-3 text-purple-400" />
              <span>Live market monitoring</span>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="border-t border-slate-700/50 pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => startTradingMutation.mutate()}
              disabled={startTradingMutation.isPending || status?.isRunning || !status?.waidConfigured}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Real-Time
            </Button>
            
            <Button
              onClick={() => stopTradingMutation.mutate()}
              disabled={stopTradingMutation.isPending || !status?.isRunning}
              variant="destructive"
              className="bg-red-600 hover:bg-red-500"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Trading
            </Button>
          </div>
          
          {!status?.waidConfigured && (
            <div className="text-xs text-orange-400 text-center">
              ⚠️ Configure Waid API keys to enable real-time trading
            </div>
          )}
          
          {status?.isRunning && (
            <div className="text-xs text-green-400 text-center">
              🤖 Real-time trading active - Monitoring divine signals every 15 seconds
            </div>
          )}
        </div>

        {/* Trading Parameters */}
        <div className="border-t border-slate-700/50 pt-4">
          <div className="text-xs waides-text-secondary mb-2">Trading Parameters</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="waides-text-secondary">Trade Size: </span>
              <span className="text-purple-400">0.001 ETH</span>
            </div>
            <div>
              <span className="waides-text-secondary">Frequency: </span>
              <span className="text-purple-400">15 seconds</span>
            </div>
            <div>
              <span className="waides-text-secondary">Conditions: </span>
              <span className="text-purple-400">BreathLock + Clean Signal</span>
            </div>
            <div>
              <span className="waides-text-secondary">Actions: </span>
              <span className="text-purple-400">BUY LONG / SELL SHORT</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}