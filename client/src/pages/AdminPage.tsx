import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const [commandInput, setCommandInput] = useState('');
  const [configUpdates, setConfigUpdates] = useState({
    signalThreshold: '',
    maxRiskPercent: '',
    autonomousMode: false
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: adminStatus } = useQuery({
    queryKey: ['/api/waides-ki/admin/status'],
    refetchInterval: 10000,
  });

  const { data: adminConfig } = useQuery({
    queryKey: ['/api/waides-ki/admin/config'],
    refetchInterval: 30000,
  });

  const { data: memoryAnalysis } = useQuery({
    queryKey: ['/api/waides-ki/admin/memory'],
    refetchInterval: 30000,
  });

  const { data: strategyAnalysis } = useQuery({
    queryKey: ['/api/waides-ki/admin/strategies'],
    refetchInterval: 30000,
  });

  const executeCommandMutation = useMutation({
    mutationFn: async (command: string) => {
      const response = await fetch('/api/waides-ki/admin-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Command Executed",
          description: data.message,
        });
      } else {
        toast({
          title: "Command Failed",
          description: data.message,
          variant: "destructive",
        });
      }
      queryClient.invalidateQueries();
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await fetch('/api/waides-ki/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Configuration Updated",
          description: data.message,
        });
        queryClient.invalidateQueries();
      }
    },
  });

  const emergencyStopMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/waides-ki/admin/emergency-stop', {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Emergency Stop Activated",
        description: "All trading activity has been stopped",
        variant: "destructive",
      });
      queryClient.invalidateQueries();
    },
  });

  const handleExecuteCommand = () => {
    if (commandInput.trim()) {
      executeCommandMutation.mutate(commandInput.trim());
      setCommandInput('');
    }
  };

  const handleConfigUpdate = () => {
    const updates: any = {};
    if (configUpdates.signalThreshold) {
      updates.signalThreshold = parseFloat(configUpdates.signalThreshold);
    }
    if (configUpdates.maxRiskPercent) {
      updates.maxRiskPercent = parseFloat(configUpdates.maxRiskPercent);
    }
    updates.autonomousMode = configUpdates.autonomousMode;
    
    updateConfigMutation.mutate(updates);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Admin Control Center</h1>
          <p className="text-slate-400 mt-2">System management and configuration</p>
        </div>
        <Button 
          variant="destructive" 
          onClick={() => emergencyStopMutation.mutate()}
          disabled={emergencyStopMutation.isPending}
        >
          Emergency Stop
        </Button>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          {adminStatus?.success && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Core System</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Autonomous Mode</span>
                    <Badge variant={adminStatus.data.core.autonomousMode ? "default" : "secondary"}>
                      {adminStatus.data.core.autonomousMode ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Evolution Stage</span>
                    <span className="text-slate-100">{adminStatus.data.core.evolutionStage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Trades</span>
                    <span className="text-slate-100">{adminStatus.data.core.activeTrades}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Data Feeds</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Live Feed</span>
                    <Badge variant={adminStatus.data.dataFeed.isLive ? "default" : "destructive"}>
                      {adminStatus.data.dataFeed.isLive ? "LIVE" : "OFFLINE"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Source</span>
                    <span className="text-slate-100">{adminStatus.data.dataFeed.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quality</span>
                    <span className="text-slate-100">{adminStatus.data.dataFeed.quality}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Observer System</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Observing</span>
                    <Badge variant={adminStatus.data.observer.isObserving ? "default" : "secondary"}>
                      {adminStatus.data.observer.isObserving ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Observations</span>
                    <span className="text-slate-100">{adminStatus.data.observer.totalObservations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Market Phase</span>
                    <span className="text-slate-100">{adminStatus.data.observer.marketPhase}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Win Rate</span>
                    <span className="text-green-400">{adminStatus.data.performance.winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Trades</span>
                    <span className="text-slate-100">{adminStatus.data.performance.totalTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Capital</span>
                    <span className="text-green-400">${adminStatus.data.performance.currentCapital?.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Return</span>
                    <span className={adminStatus.data.performance.totalReturn >= 0 ? "text-green-400" : "text-red-400"}>
                      {adminStatus.data.performance.totalReturn?.toFixed(2)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="commands" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Execute Admin Commands</CardTitle>
              <CardDescription>Run system commands for diagnostics and control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="command">Command</Label>
                <div className="flex space-x-2">
                  <Input
                    id="command"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    placeholder="/status, /memory, /strategies, /health, /help"
                    className="bg-slate-700 border-slate-600"
                    onKeyPress={(e) => e.key === 'Enter' && handleExecuteCommand()}
                  />
                  <Button 
                    onClick={handleExecuteCommand}
                    disabled={executeCommandMutation.isPending || !commandInput.trim()}
                  >
                    Execute
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCommandInput('/status')}
                >
                  /status
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCommandInput('/memory')}
                >
                  /memory
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCommandInput('/strategies')}
                >
                  /strategies
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCommandInput('/health')}
                >
                  /health
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">System Configuration</CardTitle>
              <CardDescription>Adjust system parameters and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {adminConfig?.success && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-100">Current Settings</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Signal Threshold</span>
                        <span className="text-slate-100">{adminConfig.data.signalThreshold}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Max Risk</span>
                        <span className="text-slate-100">{adminConfig.data.maxRiskPercent}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Autonomous Mode</span>
                        <Badge variant={adminConfig.data.autonomousMode ? "default" : "secondary"}>
                          {adminConfig.data.autonomousMode ? "ON" : "OFF"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Binance WebSocket</span>
                        <Badge variant={adminConfig.data.binanceWSStatus ? "default" : "destructive"}>
                          {adminConfig.data.binanceWSStatus ? "CONNECTED" : "DISCONNECTED"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-100">Update Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="signalThreshold">Signal Threshold (%)</Label>
                        <Input
                          id="signalThreshold"
                          type="number"
                          value={configUpdates.signalThreshold}
                          onChange={(e) => setConfigUpdates(prev => ({ ...prev, signalThreshold: e.target.value }))}
                          placeholder={adminConfig.data.signalThreshold.toString()}
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxRisk">Max Risk Per Trade (%)</Label>
                        <Input
                          id="maxRisk"
                          type="number"
                          step="0.1"
                          value={configUpdates.maxRiskPercent}
                          onChange={(e) => setConfigUpdates(prev => ({ ...prev, maxRiskPercent: e.target.value }))}
                          placeholder={adminConfig.data.maxRiskPercent.toString()}
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          id="autonomousMode"
                          type="checkbox"
                          checked={configUpdates.autonomousMode}
                          onChange={(e) => setConfigUpdates(prev => ({ ...prev, autonomousMode: e.target.checked }))}
                          className="rounded"
                        />
                        <Label htmlFor="autonomousMode">Enable Autonomous Mode</Label>
                      </div>
                      <Button 
                        onClick={handleConfigUpdate}
                        disabled={updateConfigMutation.isPending}
                        className="w-full"
                      >
                        Update Configuration
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="space-y-6">
          {memoryAnalysis?.success && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Learning System</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Strategies</span>
                    <span className="text-slate-100">{memoryAnalysis.data.learning.totalStrategies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Best Strategy</span>
                    <span className="text-slate-100">{memoryAnalysis.data.learning.bestStrategy || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Best Win Rate</span>
                    <span className="text-green-400">{memoryAnalysis.data.learning.bestWinRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Evolution Stage</span>
                    <span className="text-slate-100">{memoryAnalysis.data.learning.evolutionStage}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Signal Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Signals</span>
                    <span className="text-slate-100">{memoryAnalysis.data.signals.totalSignals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Strong Signals</span>
                    <span className="text-green-400">{memoryAnalysis.data.signals.strongSignals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average Strength</span>
                    <span className="text-blue-400">{memoryAnalysis.data.signals.averageStrength}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Success Rate</span>
                    <span className="text-green-400">{memoryAnalysis.data.signals.successRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
          {strategyAnalysis?.success && (
            <div className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Top Performing Strategies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {strategyAnalysis.data.topStrategies?.map((strategy: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                        <span className="text-slate-100">{strategy.strategy}</span>
                        <div className="flex space-x-4">
                          <span className="text-blue-400">{strategy.count} trades</span>
                          <span className="text-green-400">{strategy.avgStrength.toFixed(1)}% avg</span>
                        </div>
                      </div>
                    )) || <div className="text-slate-400">No strategy data available</div>}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Signal Patterns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Strongest Time</span>
                    <span className="text-slate-100">{strategyAnalysis.data.patterns?.strongestTimeOfDay || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Best Trend</span>
                    <span className="text-slate-100">{strategyAnalysis.data.patterns?.bestTrendConditions || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Optimal RSI</span>
                    <span className="text-slate-100">{strategyAnalysis.data.patterns?.optimalRSIRange || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              {strategyAnalysis.data.blocked?.length > 0 && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-100">Blocked Strategies</CardTitle>
                    <CardDescription>Strategies temporarily blocked due to poor performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {strategyAnalysis.data.blocked.map((blocked: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-red-900/20 rounded border border-red-800">
                          <span className="text-slate-100">{blocked.strategyId}</span>
                          <span className="text-red-400">{blocked.reason}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}