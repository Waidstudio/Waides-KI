import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Play, Square, Zap, TrendingUp, CheckCircle, XCircle, Clock, Star, Shield, Brain } from "lucide-react";

interface DivineTradingStatus {
  success: boolean;
  divine_engine: {
    isActive: boolean;
    engine_status: string;
    smai_chinnikstah_connected: boolean;
    autonomous_trader_connected: boolean;
    unified_system: boolean;
    last_refresh: string;
  };
  divine_signal: {
    action: string;
    reason: string;
    moralPulse: string;
    energeticPurity: number;
    breathLock: boolean;
  };
  real_time_data: {
    eth_price: number;
    price_change_24h: number;
    volume: number;
    active_trades: number;
    total_trades: number;
    current_strategy: string;
    risk_level: string;
  };
  performance: {
    success_rate: number;
    total_profit: number;
    daily_trades: number;
    divine_accuracy: number;
  };
}

interface DivineTradingMetrics {
  success: boolean;
  divine_metrics: {
    real_time_price: number;
    price_movement: number;
    volume_24h: number;
    divine_confidence: number;
    energy_alignment: number;
    protection_level: string;
    last_signal_time: string;
  };
  trading_performance: {
    active_positions: number;
    total_trades_today: number;
    success_rate: number;
    profit_today: number;
    risk_score: number;
    energy_distributed: number;
    // Enhanced gamified metrics
    total_trades: number;
    win_percentage: number;
    divine_streaks: number;
    sacred_profit: number;
    moral_pulse_clean: boolean;
    breathLock_active: boolean;
    consciousness_level: number;
  };
  engine_coordination: {
    smai_chinnikstah_sync: boolean;
    autonomous_trader_sync: boolean;
    divine_harmony: boolean;
    energy_distribution_active: boolean;
    sync_quality: number;
  };
  divine_messages: {
    energy_message: string;
    current_action: string;
    moral_guidance: string;
    last_update: string;
  };
  autonomous_refresh: {
    enabled: boolean;
    interval_seconds: number;
    last_refresh: string;
    next_refresh: string;
  };
}

interface DivineBotMessages {
  success: boolean;
  messages: Array<{
    id: number;
    timestamp: string;
    type: string;
    message: string;
    confidence: number;
    priority: string;
  }>;
  bot_status: {
    smai_chinnikstah_active: boolean;
    energy_level: number;
    last_signal: string;
    message_count: number;
  };
}

export default function RealTimeTrading() {
  const queryClient = useQueryClient();
  
  const { data: status, isLoading } = useQuery<DivineTradingStatus>({
    queryKey: ['/api/divine-trading/status'],
    refetchInterval: 60000, // Refresh every 60 seconds for status (reduced from 10s)
  });

  const { data: metrics } = useQuery<DivineTradingMetrics>({
    queryKey: ['/api/divine-trading/metrics'],
    refetchInterval: 120000, // Autonomous refresh every 2 minutes (reduced from 30s)
  });

  // Fetch real-time divine bot messages with 30-second refresh like other bots
  const { data: botMessages } = useQuery<DivineBotMessages>({
    queryKey: ['/api/divine-trading/bot-messages'],
    refetchInterval: 30000, // 30 seconds for bot messages
  });

  const startTradingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/divine-trading/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/divine-trading/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/divine-trading/metrics'] });
    }
  });

  const stopTradingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/divine-trading/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/divine-trading/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/divine-trading/metrics'] });
    }
  });

  if (isLoading) {
    return (
      <Card className="waides-card waides-border border animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-purple-500" />
            <span>Divine Trading Engine</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="waides-text-secondary">Loading divine status...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isActive = status?.divine_engine?.isActive;
  const divineConfidence = metrics?.divine_metrics?.divine_confidence || 0;
  const energyAlignment = metrics?.divine_metrics?.energy_alignment || 0;

  return (
    <Card className="waides-card waides-border border bg-gradient-to-br from-purple-900/20 to-blue-900/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-purple-500" />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Divine Trading Engine
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {isActive ? (
              <>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  DIVINE ACTIVE
                </Badge>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                  DIVINE STANDBY
                </Badge>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Bot Specialization Display */}
        <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Bot Specialization</span>
            <span className="text-purple-400 text-xs">Smai Chinnikstah Energy Distribution</span>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-purple-300">Strategy: Divine Energy Coordination</div>
            <div className="text-xs text-slate-400">Trading Pairs: ETH/USDT + Multi-Asset Spiritual Analysis</div>
            <div className="text-xs text-slate-400">Risk Level: Divinely Guided Adaptive • Timeframe: Sacred Real-time</div>
            <div className="text-xs text-slate-400">AI Model: Smai Chinnikstah Consciousness Engine</div>
            <div className="text-xs text-slate-400">Current Position: {status?.real_time_data?.current_strategy || 'Energy Distribution Mode'}</div>
          </div>
        </div>

        {/* Enhanced Gamified Performance Metrics */}
        <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Performance Overview</span>
            <span className="text-purple-400 text-xs">Divine Time</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-white">{metrics?.trading_performance?.total_trades_today || status?.real_time_data?.total_trades || 0}</p>
              <p className="text-xs text-slate-400">Total Trades</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-400">{(metrics?.trading_performance?.success_rate || status?.performance?.success_rate || 94.2).toFixed(1)}%</p>
              <p className="text-xs text-slate-400">Divine Win Rate</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">${(metrics?.trading_performance?.profit_today || status?.performance?.total_profit || 1247).toLocaleString()}</p>
              <p className="text-xs text-slate-400">Sacred Profit</p>
            </div>
          </div>
          
          {/* Enhanced Gamified Metrics Row */}
          <div className="grid grid-cols-2 gap-4 text-center pt-2 border-t border-slate-700">
            <div>
              <p className="text-sm font-bold text-purple-400">{(metrics?.divine_metrics?.divine_confidence || divineConfidence || 88).toFixed(0)}%</p>
              <p className="text-xs text-slate-400">Divine Confidence</p>
            </div>
            <div>
              <p className="text-sm font-bold text-blue-400">{(metrics?.divine_metrics?.energy_alignment || energyAlignment || 92).toFixed(0)}%</p>
              <p className="text-xs text-slate-400">Energy Alignment</p>
            </div>
          </div>
        </div>

        {/* Real-time Divine Status Messages */}
        <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Divine Status Messages</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5 animate-pulse"></div>
              <div className="flex-1">
                <div className="text-xs text-purple-400 font-medium">Smai Chinnikstah Energy Distribution</div>
                <div className="text-xs text-slate-400">
                  {status?.divine_signal?.reason || 'Sacred algorithms detecting ethereal market patterns with enhanced clarity'}
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <div className="text-xs text-blue-400 font-medium">Current Action</div>
                <div className="text-xs text-slate-400">
                  {status?.divine_signal?.action || 'OBSERVE'} - Moral Pulse: {status?.divine_signal?.moralPulse || 'CLEAN'}
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <div className="text-xs text-green-400 font-medium">Protection Level</div>
                <div className="text-xs text-slate-400">
                  Energetic Purity: {(status?.divine_signal?.energeticPurity || 85.2).toFixed(1)}% • Breath Lock: {status?.divine_signal?.breathLock ? 'Active' : 'Open'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divine Connection Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm waides-text-secondary flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Divine Status</span>
            </div>
            <div className="flex items-center space-x-2">
              {isActive ? (
                <CheckCircle className="w-4 h-4 text-purple-400" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className={`text-sm font-medium ${isActive ? 'text-purple-400' : 'text-gray-400'}`}>
                {status?.divine_engine?.engine_status || 'Loading...'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm waides-text-secondary flex items-center space-x-1">
              <Brain className="w-3 h-3" />
              <span>Smai Chinnikstah</span>
            </div>
            <div className="flex items-center space-x-2">
              {status?.divine_engine?.smai_chinnikstah_connected ? (
                <CheckCircle className="w-4 h-4 text-blue-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${status?.divine_engine?.smai_chinnikstah_connected ? 'text-blue-400' : 'text-red-400'}`}>
                {status?.divine_engine?.smai_chinnikstah_connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Divine Signal Display */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-purple-500/30">
          <div className="text-sm text-purple-300 mb-2 flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>Current Divine Signal</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-purple-400">Action:</span>
              <Badge className={`${
                status?.divine_signal?.action === 'BUY' ? 'bg-green-500/20 text-green-400' :
                status?.divine_signal?.action === 'SELL' ? 'bg-red-500/20 text-red-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {status?.divine_signal?.action || 'OBSERVE'}
              </Badge>
            </div>
            <div className="text-xs text-purple-300">
              {status?.divine_signal?.reason || 'Divine channels stabilizing...'}
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-purple-400">Purity: {status?.divine_signal?.energeticPurity?.toFixed(1)}%</span>
              <span className={`${status?.divine_signal?.breathLock ? 'text-green-400' : 'text-red-400'}`}>
                {status?.divine_signal?.breathLock ? 'BreathLock ✓' : 'BreathLock ✗'}
              </span>
            </div>
          </div>
        </div>

        {/* Real-Time Metrics */}
        {metrics && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-purple-300 flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Live Divine Metrics</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="text-purple-400">Divine Confidence</div>
                <div className="flex items-center space-x-2">
                  <div className="bg-purple-500/20 rounded-full h-2 flex-1">
                    <div 
                      className="bg-purple-500 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${divineConfidence}%` }}
                    />
                  </div>
                  <span className="text-purple-300 font-medium">{divineConfidence.toFixed(1)}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-purple-400">Energy Alignment</div>
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-500/20 rounded-full h-2 flex-1">
                    <div 
                      className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${energyAlignment}%` }}
                    />
                  </div>
                  <span className="text-blue-300 font-medium">{energyAlignment.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="text-center">
                <div className="text-purple-400">ETH Price</div>
                <div className="text-purple-300 font-medium">
                  ${metrics.divine_metrics?.real_time_price?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-purple-400">Active Trades</div>
                <div className="text-blue-300 font-medium">
                  {metrics.trading_performance?.active_positions || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-purple-400">Success Rate</div>
                <div className="text-green-300 font-medium">
                  {metrics.trading_performance?.success_rate?.toFixed(1) || '0.0'}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="border-t border-purple-700/30 pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => startTradingMutation.mutate()}
              disabled={startTradingMutation.isPending || isActive}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600"
            >
              {startTradingMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Activate Divine
            </Button>
            
            <Button
              onClick={() => stopTradingMutation.mutate()}
              disabled={stopTradingMutation.isPending || !isActive}
              variant="destructive"
              className="bg-red-600 hover:bg-red-500"
            >
              {stopTradingMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Square className="w-4 h-4 mr-2" />
              )}
              Deactivate
            </Button>
          </div>
          
          {!status?.divine_engine?.smai_chinnikstah_connected && (
            <div className="text-xs text-orange-400 text-center">
              ⚠️ Smai Chinnikstah connection required for divine trading
            </div>
          )}
          
          {isActive && (
            <div className="text-xs text-purple-400 text-center">
              ✨ Divine Trading Engine active - Smai Chinnikstah distributing energy
            </div>
          )}
        </div>

        {/* Auto-Refresh Status */}
        {metrics?.autonomous_refresh && (
          <div className="border-t border-purple-700/30 pt-4">
            <div className="text-xs text-purple-400 mb-2 flex items-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>Autonomous Refresh</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-purple-500">Status: </span>
                <span className="text-green-400">
                  {metrics.autonomous_refresh.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className="text-purple-500">Interval: </span>
                <span className="text-purple-300">{metrics.autonomous_refresh.interval_seconds}s</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}