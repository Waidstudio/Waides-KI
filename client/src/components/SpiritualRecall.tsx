import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Shield, Wand2, RotateCcw, Trash2, Play, TrendingUp, Brain } from 'lucide-react';

export function SpiritualRecall() {
  const queryClient = useQueryClient();
  const [manualStrategyId, setManualStrategyId] = useState('');
  const [manualReason, setManualReason] = useState('');

  // Fetch spiritual recall data
  const { data: recallStats } = useQuery({
    queryKey: ['/api/waides-ki/spiritual-recall/stats'],
    refetchInterval: 30000
  });

  const { data: failedStrategies } = useQuery({
    queryKey: ['/api/waides-ki/spiritual-recall/failed-strategies'],
    refetchInterval: 30000
  });

  const { data: rewriteHistory } = useQuery({
    queryKey: ['/api/waides-ki/spiritual-recall/rewrite-history'],
    refetchInterval: 30000
  });

  // Mutations for spiritual recall actions
  const manualRecallMutation = useMutation({
    mutationFn: async ({ strategy_id, reason }: { strategy_id: string; reason: string }) =>
      fetch('/api/waides-ki/spiritual-recall/manual-recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy_id, reason })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/spiritual-recall/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/spiritual-recall/failed-strategies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/spiritual-recall/rewrite-history'] });
      setManualStrategyId('');
      setManualReason('');
    }
  });

  const demoWorkflowMutation = useMutation({
    mutationFn: () => fetch('/api/waides-ki/spiritual-recall/demo-workflow', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/spiritual-recall/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/spiritual-recall/rewrite-history'] });
    }
  });

  const clearDataMutation = useMutation({
    mutationFn: () => fetch('/api/waides-ki/spiritual-recall/clear-data', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/spiritual-recall/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/spiritual-recall/failed-strategies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/spiritual-recall/rewrite-history'] });
    }
  });

  const getKonslangColor = (symbol: string) => {
    const colors = {
      "NA'VEL": 'bg-blue-500',
      "ZUNTH": 'bg-purple-500',
      "AL'MIR": 'bg-green-500',
      "TALOR": 'bg-orange-500',
      "SHAI": 'bg-cyan-500',
      "KORVEX": 'bg-red-500',
      "THALAR": 'bg-yellow-500',
      "ZEPHYR": 'bg-pink-500'
    };
    return colors[symbol as keyof typeof colors] || 'bg-slate-500';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-100 flex items-center justify-center gap-2">
          <Wand2 className="w-8 h-8 text-purple-500" />
          Waides KI Spiritual Recall
        </h2>
        <p className="text-slate-400">
          "There are no failed trades — only unfinished timelines."
        </p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {recallStats?.stats?.total_recalls || 0}
              </div>
              <div className="text-sm text-slate-400">Total Recalls</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {recallStats?.stats?.total_rewrites || 0}
              </div>
              <div className="text-sm text-slate-400">Strategies Rewritten</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {recallStats?.stats?.active_failures || 0}
              </div>
              <div className="text-sm text-slate-400">Active Failures</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">
                {recallStats?.stats?.recall_success_rate?.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-slate-400">Success Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="failed-strategies">Failed Strategies</TabsTrigger>
          <TabsTrigger value="rewrite-history">Rewrite History</TabsTrigger>
          <TabsTrigger value="manual-recall">Manual Recall</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Spiritual Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Protection Rate</span>
                  <span className="text-slate-200">{recallStats?.stats?.spiritual_protection_rate?.toFixed(1) || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Most Common Failure</span>
                  <span className="text-slate-200 text-sm">{recallStats?.stats?.most_common_failure || 'None'}</span>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-slate-400 mb-2">Konslang Patterns Used</div>
                  <div className="flex flex-wrap gap-1">
                    {recallStats?.stats?.konslang_patterns_used?.map((pattern: string, index: number) => (
                      <Badge key={index} className={`${getKonslangColor(pattern)} text-white text-xs`}>
                        {pattern}
                      </Badge>
                    )) || (
                      <span className="text-slate-500 text-xs">No patterns used yet</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-green-400" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Monitoring</span>
                    <Badge className="bg-green-500">ACTIVE</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recall Threshold</span>
                    <span className="text-slate-200">3 failures</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Auto-Rewrite</span>
                    <Badge className="bg-blue-500">ENABLED</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Konslang Integration</span>
                    <Badge className="bg-purple-500">BLESSED</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Failed Strategies Tab */}
        <TabsContent value="failed-strategies" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Strategies Awaiting Recall
              </CardTitle>
              <CardDescription>
                Strategies with multiple failures being monitored for spiritual recall
              </CardDescription>
            </CardHeader>
            <CardContent>
              {failedStrategies?.failed_strategies?.length > 0 ? (
                <div className="space-y-3">
                  {failedStrategies.failed_strategies.map((strategy: any, index: number) => (
                    <div key={index} className="p-3 bg-slate-800 rounded border border-red-500/20">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="font-mono text-sm text-slate-200">{strategy.strategy_id}</div>
                          <div className="text-xs text-red-400">
                            {strategy.failure_count} failures - Last: {formatTimestamp(strategy.last_failure)}
                          </div>
                          <div className="text-xs text-slate-400">
                            Reasons: {strategy.failure_reasons.join(', ')}
                          </div>
                        </div>
                        <Badge variant="destructive" className="ml-2">
                          FAILING
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Shield className="w-12 h-12 mx-auto mb-2 text-green-400" />
                  <div>No strategies currently failing</div>
                  <div className="text-sm">All strategies are performing within acceptable parameters</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewrite History Tab */}
        <TabsContent value="rewrite-history" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-400" />
                Spiritual Rewrite History
              </CardTitle>
              <CardDescription>
                Strategies that have been spiritually recalled and rewritten with Konslang wisdom
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {rewriteHistory?.rewrite_history?.map((rewrite: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-800 rounded border border-purple-500/20">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="font-mono text-sm text-slate-200">{rewrite.strategy_id}</div>
                        <Badge className={`${getKonslangColor(rewrite.symbolic_patch)} text-white`}>
                          {rewrite.symbolic_patch}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-400">
                        Rewritten: {formatTimestamp(rewrite.rewrite_timestamp)}
                      </div>
                      <div className="text-xs text-orange-400">
                        Reason: {rewrite.recall_reason}
                      </div>
                      <div className="text-xs text-purple-300 italic bg-slate-900/50 p-2 rounded">
                        "{rewrite.konslang_wisdom}"
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-slate-400">
                    <Wand2 className="w-12 h-12 mx-auto mb-2 text-purple-400" />
                    <div>No spiritual rewrites yet</div>
                    <div className="text-sm">Strategies will appear here after spiritual recall</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Recall Tab */}
        <TabsContent value="manual-recall" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-400" />
                Manual Spiritual Recall
              </CardTitle>
              <CardDescription>
                Manually trigger spiritual recall for a specific strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="strategy-id">Strategy ID</Label>
                <Input
                  id="strategy-id"
                  value={manualStrategyId}
                  onChange={(e) => setManualStrategyId(e.target.value)}
                  placeholder="Enter strategy identifier"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recall-reason">Recall Reason</Label>
                <Textarea
                  id="recall-reason"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="Describe why this strategy needs spiritual recall..."
                  className="bg-slate-800 border-slate-700"
                  rows={3}
                />
              </div>
              <Button
                onClick={() => manualRecallMutation.mutate({ strategy_id: manualStrategyId, reason: manualReason })}
                disabled={!manualStrategyId || manualRecallMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {manualRecallMutation.isPending ? 'Recalling...' : 'Trigger Spiritual Recall'}
              </Button>
              {manualRecallMutation.isSuccess && (
                <div className="text-green-400 text-sm text-center">
                  Strategy has been spiritually recalled and rewritten successfully
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Spiritual Recall Controls
              </CardTitle>
              <CardDescription>
                System controls and demonstration functions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => demoWorkflowMutation.mutate()}
                  disabled={demoWorkflowMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {demoWorkflowMutation.isPending ? 'Running...' : 'Demo Workflow'}
                </Button>

                <Button
                  onClick={() => clearDataMutation.mutate()}
                  disabled={clearDataMutation.isPending}
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {clearDataMutation.isPending ? 'Clearing...' : 'Clear All Data'}
                </Button>
              </div>

              {demoWorkflowMutation.isSuccess && (
                <div className="bg-green-900/30 border border-green-500/30 rounded p-3">
                  <div className="text-green-400 font-medium mb-2">Demo Workflow Completed</div>
                  <div className="text-sm text-slate-300">
                    A demo strategy was created with 3 failures, automatically recalled, and rewritten with Konslang wisdom.
                    Check the Rewrite History tab to see the results.
                  </div>
                </div>
              )}

              {clearDataMutation.isSuccess && (
                <div className="bg-blue-900/30 border border-blue-500/30 rounded p-3">
                  <div className="text-blue-400 font-medium">Data Cleared</div>
                  <div className="text-sm text-slate-300">
                    All spiritual recall data has been cleared successfully.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}