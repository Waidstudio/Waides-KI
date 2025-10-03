import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  Activity,
  Brain,
  TrendingUp,
  TrendingDown,
  Zap,
  Play,
  Pause,
  Settings,
  BarChart3,
  Eye,
  Database
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function SmaiChinnikstahPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch Smai Chinnikstah status
  const { data: botStatus } = useQuery({
    queryKey: ['/api/divine-bots/smai-chinnikstah/status'],
    refetchInterval: 3000
  });

  // Fetch trade history
  const { data: tradesData } = useQuery({
    queryKey: ['/api/divine-bots/smai-chinnikstah/trades'],
    refetchInterval: 5000
  });

  // Fetch divine trading status
  const { data: divineStatus } = useQuery({
    queryKey: ['/api/divine-trading/status'],
    refetchInterval: 3000
  });

  // Start mutation
  const startMutation = useMutation({
    mutationFn: () => apiRequest('/api/waidbot-engine/smai-chinnikstah/start', "POST"),
    onSuccess: (data) => {
      toast({
        title: "SmaiChinnikstah Started",
        description: data?.message || "Divine trading bot is now active",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/divine-bots/smai-chinnikstah/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/divine-trading/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Start Failed",
        description: error.message || "Failed to start SmaiChinnikstah",
        variant: "destructive",
      });
    }
  });

  // Stop mutation
  const stopMutation = useMutation({
    mutationFn: () => apiRequest('/api/waidbot-engine/smai-chinnikstah/stop', "POST"),
    onSuccess: (data) => {
      toast({
        title: "SmaiChinnikstah Stopped",
        description: data?.message || "Divine trading bot has been deactivated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/divine-bots/smai-chinnikstah/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/divine-trading/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Stop Failed",
        description: error.message || "Failed to stop SmaiChinnikstah",
        variant: "destructive",
      });
    }
  });

  const status = botStatus || {};
  const isActive = status.isActive || divineStatus?.divine_engine?.smai_chinnikstah_connected || false;
  const performance = status.performance || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-2">
                SmaiChinnikstah δ
                <div className="h-6 w-6 text-indigo-400" title="Divine Trading">✨</div>
              </h1>
              <p className="text-indigo-200">Divine Trading System - Sacred Energy Distribution & Market Intelligence</p>
            </div>
            <div className="ml-auto">
              <Badge 
                variant={isActive ? "default" : "secondary"}
                className={isActive ? "bg-green-500/20 text-green-400 border-green-500/40" : ""}
              >
                {isActive ? "ACTIVE" : "STANDBY"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Control Panel */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-indigo-400/40">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-400" />
                Divine Control Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => isActive ? stopMutation.mutate() : startMutation.mutate()}
                disabled={startMutation.isPending || stopMutation.isPending}
                className={`w-full ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                data-testid={isActive ? "button-stop-smai-chinnikstah" : "button-start-smai-chinnikstah"}
              >
                {isActive ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Divine Trading
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Divine Trading
                  </>
                )}
              </Button>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Energy Level</span>
                  <span className="text-indigo-400">{divineStatus?.divine_engine?.energy_distribution || 95}%</span>
                </div>
                <Progress value={divineStatus?.divine_engine?.energy_distribution || 95} className="h-2" />
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Distribution Mode</span>
                  <span className="text-indigo-400">{divineStatus?.divine_engine?.distribution_mode || 'STANDBY'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Unified System</span>
                  <span className={divineStatus?.divine_engine?.unified_system ? "text-green-400" : "text-slate-400"}>
                    {divineStatus?.divine_engine?.unified_system ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-indigo-400/40">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-400" />
                Divine Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Total Trades</div>
                  <div className="text-xl font-bold text-white">{performance.totalTrades || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Win Rate</div>
                  <div className="text-xl font-bold text-green-400">{performance.winRate || 0}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Divine Signals</div>
                  <div className="text-xl font-bold text-indigo-400">{performance.divineSignals || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Energy Dist.</div>
                  <div className="text-xl font-bold text-purple-400">{performance.energyDistributions || 0}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Total Profit</span>
                  <span className="text-lg font-bold text-green-400">${performance.totalProfit?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Daily Profit</span>
                  <span className="text-sm text-green-400">+${performance.dailyProfit?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Divine Intelligence */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-indigo-400/40">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-400" />
                Divine Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Sacred Pattern Analysis</div>
                  <Progress value={status.sacredPatternAccuracy || 94} className="h-2" />
                  <div className="text-xs text-slate-500 mt-1">{status.sacredPatternAccuracy || 94}% accuracy</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Divine Signal Strength</div>
                  <Progress value={status.divineSignalStrength || 88} className="h-2" />
                  <div className="text-xs text-slate-500 mt-1">{status.divineSignalStrength || 88}% strength</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Energy Clarity</div>
                  <Progress value={status.energyClarity || 92} className="h-2" />
                  <div className="text-xs text-slate-500 mt-1">{status.energyClarity || 92}% clarity</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Divine Trades */}
        <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-indigo-400/40">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              Divine Trade History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tradesData?.trades?.slice(0, 5).map((trade: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${trade.result === 'win' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {trade.result === 'win' ? <TrendingUp className="h-4 w-4 text-green-400" /> : <TrendingDown className="h-4 w-4 text-red-400" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{trade.symbol || 'ETH/USD'}</div>
                      <div className="text-xs text-slate-400">{trade.timestamp || 'Just now'}</div>
                    </div>
                  </div>
                  <div className={`font-bold ${trade.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.profit > 0 ? '+' : ''}{trade.profit?.toFixed(2) || '0.00'} SmaiSika
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-slate-400">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Divine trading awaits activation...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
