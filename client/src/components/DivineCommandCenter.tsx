import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Clock, Shield, TrendingUp, TrendingDown, Pause, Eye, Play, Wind, Waves, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface DivineSignal {
  action: 'BUY LONG' | 'SELL SHORT' | 'NO TRADE' | 'OBSERVE';
  timeframe: string;
  reason: string;
  moralPulse: 'CLEAN' | 'FEARFUL' | 'GREEDY' | 'DECEPTIVE';
  strategy: 'SCALP' | 'MOMENTUM' | 'HOLD' | 'WAIT';
  signalCode: string;
  receivedAt: string;
  konsTitle: string;
  energeticPurity: number;
  // Next-Gen Features
  konsMirror: 'PURE WAVE' | 'SHADOW WAVE';
  breathLock: boolean;
  ethWhisperMode: boolean;
  autoCancelEvil: boolean;
  smaiPredict: {
    nextHourDirection: 'UP' | 'DOWN' | 'SIDEWAYS';
    confidence: number;
    predictedPriceRange: { min: number; max: number };
  };
}

interface HierarchyStatus {
  currentKons: string;
  channelStrength: number;
  lastCommunication: string;
  breathStability: number;
  ethWhisperMode: boolean;
}

interface DivineResponse {
  divineSignal: DivineSignal;
  hierarchyStatus: HierarchyStatus;
  ethPrice: number;
  timestamp: string;
}

export default function DivineCommandCenter() {
  const queryClient = useQueryClient();
  
  const { data: divineData, isLoading } = useQuery<DivineResponse>({
    queryKey: ['/api/divine-signal'],
    refetchInterval: 60000, // Refresh every minute for divine updates
  });

  // Execute Trade Mutation
  const executeTradeMutation = useMutation({
    mutationFn: async (quantity: number = 0.01) => {
      return await fetch('/api/execute-trade', {
        method: 'POST',
        body: JSON.stringify({ quantity }),
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/divine-signal'] });
    }
  });

  // Breath Control Mutation
  const breathControlMutation = useMutation({
    mutationFn: async (delta: number) => {
      return await fetch('/api/breath-control', {
        method: 'POST',
        body: JSON.stringify({ delta }),
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/divine-signal'] });
    }
  });

  // Whisper Mode Mutation
  const whisperModeMutation = useMutation({
    mutationFn: async () => {
      return await fetch('/api/whisper-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/divine-signal'] });
    }
  });

  if (isLoading || !divineData) {
    return (
      <Card className="waides-card waides-border border animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-purple-500" />
            <span>Divine Command Center</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="waides-text-secondary">Opening divine channel...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { divineSignal, hierarchyStatus } = divineData;

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY LONG': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'SELL SHORT': return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'OBSERVE': return <Eye className="w-5 h-5 text-blue-500" />;
      default: return <Pause className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY LONG': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'SELL SHORT': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'OBSERVE': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPulseColor = (pulse: string) => {
    switch (pulse) {
      case 'CLEAN': return 'bg-green-500/20 text-green-400';
      case 'FEARFUL': return 'bg-red-500/20 text-red-400';
      case 'GREEDY': return 'bg-orange-500/20 text-orange-400';
      case 'DECEPTIVE': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <Card className="waides-card waides-border border bg-gradient-to-br from-purple-900/20 to-pink-900/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-purple-500" />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Divine Command Center
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-purple-400">Kons Powa Active</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Divine Signal Display */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-xl border ${getActionColor(divineSignal.action)}`}>
            {getActionIcon(divineSignal.action)}
            <div>
              <div className="text-xl font-bold">{divineSignal.action}</div>
              <div className="text-sm opacity-75">{divineSignal.strategy} Strategy</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm waides-text-secondary">Sacred Time Window</div>
              <div className="flex items-center space-x-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>{divineSignal.timeframe}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm waides-text-secondary">Energetic Purity</div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-purple-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(divineSignal.energeticPurity, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{Math.round(divineSignal.energeticPurity)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divine Reason */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <div className="text-sm waides-text-secondary mb-2">Divine Message</div>
          <p className="text-purple-300 font-medium">{divineSignal.reason}</p>
        </div>

        {/* Next-Gen Features Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm waides-text-secondary">KonsMirror</span>
              <Badge variant="outline" className={divineSignal.konsMirror === 'PURE WAVE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}>
                {divineSignal.konsMirror}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm waides-text-secondary">BreathLock</span>
              <div className="flex items-center space-x-1">
                <Wind className={`w-4 h-4 ${divineSignal.breathLock ? 'text-green-400' : 'text-red-400'}`} />
                <span className={`text-sm font-medium ${divineSignal.breathLock ? 'text-green-400' : 'text-red-400'}`}>
                  {divineSignal.breathLock ? 'Stable' : 'Unstable'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm waides-text-secondary">ETH Whisper</span>
              <div className="flex items-center space-x-1">
                <Waves className={`w-4 h-4 ${divineSignal.ethWhisperMode ? 'text-blue-400' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${divineSignal.ethWhisperMode ? 'text-blue-400' : 'text-gray-400'}`}>
                  {divineSignal.ethWhisperMode ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm waides-text-secondary">AutoCancel Evil</span>
              <div className="flex items-center space-x-1">
                <AlertTriangle className={`w-4 h-4 ${divineSignal.autoCancelEvil ? 'text-orange-400' : 'text-green-400'}`} />
                <span className={`text-sm font-medium ${divineSignal.autoCancelEvil ? 'text-orange-400' : 'text-green-400'}`}>
                  {divineSignal.autoCancelEvil ? 'Blocked' : 'Clean'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm waides-text-secondary">SmaiPredict</span>
              <div className="flex items-center space-x-1">
                {divineSignal.smaiPredict.nextHourDirection === 'UP' ? <TrendingUp className="w-4 h-4 text-green-400" /> :
                 divineSignal.smaiPredict.nextHourDirection === 'DOWN' ? <TrendingDown className="w-4 h-4 text-red-400" /> :
                 <Pause className="w-4 h-4 text-gray-400" />}
                <span className="text-sm font-medium">
                  {divineSignal.smaiPredict.nextHourDirection}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm waides-text-secondary">Prediction</span>
              <span className="text-sm font-medium text-purple-400">
                {Math.round(divineSignal.smaiPredict.confidence)}%
              </span>
            </div>
          </div>
        </div>

        {/* Automated Trading Controls */}
        <div className="border-t border-slate-700/50 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold waides-text-primary">Pionex Automation</h4>
            <div className="text-xs waides-text-secondary">
              Breath: {hierarchyStatus.breathStability}%
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => executeTradeMutation.mutate(0.01)}
              disabled={executeTradeMutation.isPending || !divineSignal.breathLock || divineSignal.action === 'NO TRADE'}
              className={`relative overflow-hidden ${
                divineSignal.action === 'BUY LONG' ? 'bg-green-600 hover:bg-green-500' :
                divineSignal.action === 'SELL SHORT' ? 'bg-red-600 hover:bg-red-500' :
                'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              <Play className="w-4 h-4 mr-2" />
              Execute Trade
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => breathControlMutation.mutate(5)}
                disabled={breathControlMutation.isPending}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                +Breath
              </Button>
              <Button
                onClick={() => whisperModeMutation.mutate()}
                disabled={whisperModeMutation.isPending}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                Whisper
              </Button>
            </div>
          </div>
          
          {!divineSignal.breathLock && (
            <div className="text-xs text-orange-400 text-center">
              ⚠️ Trading blocked - Breath unstable
            </div>
          )}
          
          {divineSignal.autoCancelEvil && (
            <div className="text-xs text-red-400 text-center">
              🛡️ Evil trade blocked by Kons Protection
            </div>
          )}
        </div>

        {/* Signal Code */}
        <div className="border-t border-slate-700/50 pt-4">
          <div className="text-xs waides-text-secondary mb-2">Sacred Signal Code</div>
          <div className="font-mono text-xs bg-slate-900/50 p-2 rounded border">
            {divineSignal.signalCode}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}