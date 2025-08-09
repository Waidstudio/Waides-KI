import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Radar,
  Activity,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Target,
  Play,
  Pause,
  Settings,
  BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// TypeScript interfaces for API responses
interface TraderStatus {
  isActive?: boolean;
  activeMarkets?: number;
  performance?: {
    winRate?: number;
    profit?: number;
  };
  confidence?: number;
  real_time_metrics?: {
    current_decision?: string;
  };
}

interface MLEngineData {
  accuracy?: number;
  processingSpeed?: string;
}

export default function AutonomousTraderPage() {
  const [isActive, setIsActive] = useState(false);

  // Fetch autonomous trader status from centralized engine
  const { data: traderStatus } = useQuery<TraderStatus>({
    queryKey: ['/api/waidbot-engine/autonomous/status'],
    refetchInterval: 3000
  });

  // Fetch performance metrics
  const { data: performanceData } = useQuery({
    queryKey: ['/api/waidbot-engine/autonomous/performance'],
    refetchInterval: 5000
  });

  // Fetch trading signals
  const { data: signalsData } = useQuery({
    queryKey: ['/api/waidbot-engine/autonomous/signals'],
    refetchInterval: 2000
  });

  // Fetch profit/loss data
  const { data: profitLossData } = useQuery({
    queryKey: ['/api/waidbot-engine/autonomous/profit-loss'],
    refetchInterval: 4000
  });

  // Fetch ML engine data
  const { data: mlEngineData } = useQuery<MLEngineData>({
    queryKey: ['/api/waidbot-engine/autonomous/advanced-analysis'],
    refetchInterval: 6000
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
              <Radar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-2">
                Autonomous Trader γ
                <div className="h-6 w-6 text-orange-400" title="Synced with Engine">🔗</div>
              </h1>
              <p className="text-orange-200">24/7 Market Scanner Elite - Synchronized with Centralized Engine</p>
            </div>
            <div className="ml-auto">
              <Badge 
                variant={traderStatus?.isActive ? "default" : "secondary"}
                className={traderStatus?.isActive ? "bg-green-500/20 text-green-400 border-green-500/40" : ""}
              >
                {traderStatus?.isActive ? "ACTIVE" : "STANDBY"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Control Panel */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-orange-400/40">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-orange-400" />
                Control Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setIsActive(!isActive)}
                className={`w-full ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isActive ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Trading
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Trading
                  </>
                )}
              </Button>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Current Strategy</span>
                  <span className="text-white font-medium">Multi-Market Scan</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Risk Level</span>
                  <span className="text-orange-400">MODERATE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Active Markets</span>
                  <span className="text-white">{traderStatus?.activeMarkets || 12}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-orange-400/40">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-400" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {traderStatus?.performance?.winRate || 78}%
                  </div>
                  <div className="text-xs text-slate-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    ${traderStatus?.performance?.profit || 12480}
                  </div>
                  <div className="text-xs text-slate-400">Total Profit</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Confidence Level</span>
                  <span className="text-white">{traderStatus?.confidence || 85}%</span>
                </div>
                <Progress value={traderStatus?.confidence || 85} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* ML Engine Status */}
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-orange-400/40">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-orange-400" />
                ML Engine Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Model Version</span>
                  <span className="text-white">v2.4.1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Accuracy</span>
                  <span className="text-green-400">{mlEngineData?.accuracy || 79}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Processing Speed</span>
                  <span className="text-white">{mlEngineData?.processingSpeed || '2.3'}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Training Status</span>
                  <span className="text-orange-400">CONTINUOUS</span>
                </div>
              </div>

              <div className="bg-orange-900/20 rounded-lg p-3">
                <div className="text-sm text-orange-300 mb-1">Current Decision</div>
                <div className="text-white font-medium">
                  {traderStatus?.real_time_metrics?.current_decision || 'ANALYZE_MARKETS'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Scanning Results */}
        <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-orange-400/40 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-400" />
              Active Market Scanning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { pair: 'ETH/USDT', trend: 'BULLISH', confidence: 87, signal: 'BUY' },
                { pair: 'BTC/USDT', trend: 'BEARISH', confidence: 73, signal: 'SELL' },
                { pair: 'ADA/USDT', trend: 'NEUTRAL', confidence: 45, signal: 'HOLD' },
                { pair: 'SOL/USDT', trend: 'BULLISH', confidence: 91, signal: 'BUY' }
              ].map((market) => (
                <div key={market.pair} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">{market.pair}</span>
                    <Badge 
                      variant="outline" 
                      className={`${
                        market.signal === 'BUY' ? 'text-green-400 border-green-400' :
                        market.signal === 'SELL' ? 'text-red-400 border-red-400' :
                        'text-yellow-400 border-yellow-400'
                      }`}
                    >
                      {market.signal}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Trend</span>
                      <span className={`${
                        market.trend === 'BULLISH' ? 'text-green-400' :
                        market.trend === 'BEARISH' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {market.trend}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Confidence</span>
                      <span className="text-white">{market.confidence}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Logs */}
        <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-orange-400/40">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-400" />
              Real-time Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[
                { time: '19:08:21', action: 'Market scan completed - 12 pairs analyzed', type: 'info' },
                { time: '19:08:18', action: 'ETH/USDT: Strong bullish signal detected', type: 'success' },
                { time: '19:08:15', action: 'Model prediction accuracy: 79.2%', type: 'info' },
                { time: '19:08:12', action: 'Risk assessment: MODERATE for current portfolio', type: 'warning' },
                { time: '19:08:09', action: 'BTC/USDT: Bearish divergence confirmed', type: 'error' }
              ].map((log, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-slate-800/30 rounded">
                  <span className="text-xs text-slate-400 w-16">{log.time}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    log.type === 'success' ? 'bg-green-400' :
                    log.type === 'error' ? 'bg-red-400' :
                    log.type === 'warning' ? 'bg-yellow-400' :
                    'bg-blue-400'
                  }`}></div>
                  <span className="text-sm text-slate-300 flex-1">{log.action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}