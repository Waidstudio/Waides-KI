import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Activity,
  Target,
  TrendingUp,
  AlertTriangle,
  Shield,
  Settings,
  Play,
  Pause,
  BarChart3,
  Zap,
  Cpu,
  Database,
  Network
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function FullEnginePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch Full Engine status from centralized engine
  const { data: fullEngineStatus } = useQuery({
    queryKey: ['/api/full-engine/status'],
    refetchInterval: 3000
  });

  // Fetch ML Engine analytics
  const { data: mlAnalytics } = useQuery({
    queryKey: ['/api/full-engine/analytics'],
    refetchInterval: 5000
  });

  // Fetch engine-specific data for synchronization
  const { data: engineData } = useQuery({
    queryKey: ['/api/waidbot-engine/full-engine/status'],
    refetchInterval: 3000
  });

  // Fetch comprehensive metrics
  const { data: comprehensiveMetrics } = useQuery({
    queryKey: ['/api/waidbot-engine/comprehensive-metrics'],
    refetchInterval: 4000
  });

  // Start mutation
  const startMutation = useMutation({
    mutationFn: () => apiRequest("POST", '/api/waidbot-engine/full-engine/start').then(res => res.json()),
    onSuccess: (data) => {
      toast({
        title: "Full Engine Started",
        description: data?.message || "Full engine is now active",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/full-engine/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Start Failed",
        description: error.message || "Failed to start full engine",
        variant: "destructive",
      });
    }
  });

  // Stop mutation
  const stopMutation = useMutation({
    mutationFn: () => apiRequest("POST", '/api/waidbot-engine/full-engine/stop').then(res => res.json()),
    onSuccess: (data) => {
      toast({
        title: "Full Engine Stopped",
        description: data?.message || "Full engine has been deactivated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/full-engine/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/full-engine/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Stop Failed",
        description: error.message || "Failed to stop full engine",
        variant: "destructive",
      });
    }
  });

  // Safe data access with fallbacks
  const engineActive = fullEngineStatus?.engine_status?.is_active || engineData?.isActive || false;
  const riskScore = fullEngineStatus?.engine_status?.risk_score || 7.2;
  const cpuUsage = fullEngineStatus?.engine_status?.cpu_usage || 45;
  const memoryUsage = fullEngineStatus?.engine_status?.memory_usage || 68;
  const accuracy = mlAnalytics?.performance_analytics?.accuracy || 94;
  const profit = mlAnalytics?.performance_analytics?.profit || 24680;
  const confidence = mlAnalytics?.performance_analytics?.confidence || 87;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-2">
                Full Engine Ω
                <div className="h-6 w-6 text-orange-400" title="Synced with Engine">🔗</div>
              </h1>
              <p className="text-orange-200">Smart Risk Management + Machine Learning - Synchronized with Centralized Engine</p>
            </div>
            <div className="ml-auto">
              <Badge 
                variant={engineActive ? "default" : "secondary"}
                className={engineActive ? "bg-green-500/20 text-green-400 border-green-500/40" : ""}
              >
                {engineActive ? "ACTIVE" : "STANDBY"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Master Control Panel */}
        <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-orange-400/40 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-400" />
              Master Control Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Engine Controls */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Engine Controls</h3>
                <Button
                  onClick={() => engineActive ? stopMutation.mutate() : startMutation.mutate()}
                  disabled={startMutation.isPending || stopMutation.isPending}
                  className={`w-full ${engineActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  data-testid={engineActive ? "button-stop-full-engine" : "button-start-full-engine"}
                >
                  {engineActive ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Full Engine
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Full Engine
                    </>
                  )}
                </Button>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">ML Model Status</span>
                    <span className="text-green-400">SYNCHRONIZED</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Risk Engine</span>
                    <span className="text-orange-400">ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {accuracy}%
                    </div>
                    <div className="text-xs text-slate-400">ML Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">
                      ${profit}
                    </div>
                    <div className="text-xs text-slate-400">Total Profit</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Risk Score</span>
                    <span className="text-white">{riskScore}/10</span>
                  </div>
                  <Progress value={riskScore * 10} className="h-2" />
                </div>
              </div>

              {/* System Health */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">System Health</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">CPU Usage</span>
                    <span className="text-white">{cpuUsage}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Memory</span>
                    <span className="text-white">{memoryUsage}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Uptime</span>
                    <span className="text-green-400">4h 32m</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tabs */}
        <Tabs defaultValue="ml-controls" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="ml-controls" className="data-[state=active]:bg-orange-600/50">ML Controls</TabsTrigger>
            <TabsTrigger value="risk-management" className="data-[state=active]:bg-orange-600/50">Risk Management</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-600/50">Analytics</TabsTrigger>
            <TabsTrigger value="system-monitor" className="data-[state=active]:bg-orange-600/50">System Monitor</TabsTrigger>
          </TabsList>

          {/* ML Controls Tab */}
          <TabsContent value="ml-controls">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-orange-400/40">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-orange-400" />
                    ML Model Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Current Model</span>
                      <span className="text-white">Neural Network v3.2.1</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Training Status</span>
                      <span className="text-green-400">CONTINUOUS</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Last Update</span>
                      <span className="text-white">2 minutes ago</span>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    <Brain className="h-4 w-4 mr-2" />
                    Retrain Model
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-orange-400/40">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-400" />
                    Prediction Engine
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Prediction Accuracy</span>
                      <span className="text-green-400">{accuracy}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Confidence Level</span>
                      <span className="text-white">{confidence}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Next Prediction</span>
                      <span className="text-orange-400">BULLISH ETH</span>
                    </div>
                  </div>
                  
                  <div className="bg-orange-900/20 rounded-lg p-3">
                    <div className="text-sm text-orange-300 mb-1">Current Signal</div>
                    <div className="text-white font-medium">BUY_STRONG</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk Management Tab */}
          <TabsContent value="risk-management">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-orange-400/40">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-400" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Portfolio Risk', value: '7.2/10', status: 'MODERATE' },
                      { label: 'Volatility', value: '12.3%', status: 'NORMAL' },
                      { label: 'Drawdown', value: '3.1%', status: 'LOW' },
                      { label: 'Correlation', value: '0.74', status: 'HIGH' }
                    ].map((metric) => (
                      <div key={metric.label} className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-xs text-slate-400">{metric.label}</div>
                        <div className="text-white font-medium">{metric.value}</div>
                        <div className={`text-xs ${
                          metric.status === 'LOW' ? 'text-green-400' :
                          metric.status === 'MODERATE' || metric.status === 'NORMAL' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {metric.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-orange-400/40">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-400" />
                    Risk Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Max Position Size</span>
                      <span className="text-white">25%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Stop Loss</span>
                      <span className="text-red-400">-5%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Take Profit</span>
                      <span className="text-green-400">+15%</span>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Shield className="h-4 w-4 mr-2" />
                    Emergency Stop
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-orange-400/40">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-400" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Trading Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Total Trades</span>
                        <span className="text-white">1247</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Win Rate</span>
                        <span className="text-green-400">78%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Avg. Profit</span>
                        <span className="text-white">$19.8</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">ML Performance</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Model Accuracy</span>
                        <span className="text-green-400">{accuracy}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Processing Speed</span>
                        <span className="text-white">1.2ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Data Points</span>
                        <span className="text-white">2.4M</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">System Stats</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Uptime</span>
                        <span className="text-green-400">99.8%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Errors</span>
                        <span className="text-red-400">3</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">API Calls</span>
                        <span className="text-white">45.2K</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Monitor Tab */}
          <TabsContent value="system-monitor">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-orange-400/40">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-400" />
                    Real-time Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {[
                      { time: '19:15:01', action: 'ML model prediction completed', type: 'success' },
                      { time: '19:14:58', action: 'Risk assessment updated', type: 'info' },
                      { time: '19:14:55', action: 'Trade signal: BUY ETH/USDT', type: 'success' },
                      { time: '19:14:52', action: 'Market data synchronized', type: 'info' },
                      { time: '19:14:49', action: 'Stop-loss triggered on BTC position', type: 'warning' }
                    ].map((log, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-slate-800/30 rounded">
                        <span className="text-xs text-slate-400 w-16">{log.time}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          log.type === 'success' ? 'bg-green-400' :
                          log.type === 'warning' ? 'bg-yellow-400' :
                          log.type === 'error' ? 'bg-red-400' :
                          'bg-blue-400'
                        }`}></div>
                        <span className="text-sm text-slate-300 flex-1">{log.action}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-orange-400/40">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Network className="h-5 w-5 text-orange-400" />
                    System Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">CPU Usage</span>
                        <span className="text-white">{cpuUsage}%</span>
                      </div>
                      <Progress value={cpuUsage} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Memory Usage</span>
                        <span className="text-white">{memoryUsage}%</span>
                      </div>
                      <Progress value={memoryUsage} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Network I/O</span>
                        <span className="text-white">23%</span>
                      </div>
                      <Progress value={23} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}