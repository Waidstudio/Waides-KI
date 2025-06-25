import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skull, ArrowUp, Brain, Flame, Eye, Timer, Target, Zap } from 'lucide-react';

export function ReincarnationLoop() {
  const queryClient = useQueryClient();

  // Fetch reincarnation data
  const { data: memoryVault } = useQuery({
    queryKey: ['/api/waides-ki/reincarnation/memory-vault'],
    refetchInterval: 30000
  });

  const { data: reincarnationStats } = useQuery({
    queryKey: ['/api/waides-ki/reincarnation/stats'],
    refetchInterval: 30000
  });

  const { data: phoenixStats } = useQuery({
    queryKey: ['/api/waides-ki/reincarnation/phoenix-stats'],
    refetchInterval: 15000
  });

  const { data: sacredWisdom } = useQuery({
    queryKey: ['/api/waides-ki/reincarnation/sacred-wisdom'],
    refetchInterval: 30000
  });

  const { data: evolutionStats } = useQuery({
    queryKey: ['/api/waides-ki/reincarnation/evolution-stats'],
    refetchInterval: 30000
  });

  const { data: recentEvolutions } = useQuery({
    queryKey: ['/api/waides-ki/reincarnation/recent-evolutions'],
    refetchInterval: 30000
  });

  // Mutations for reincarnation actions
  const triggerCycleMutation = useMutation({
    mutationFn: () => fetch('/api/waides-ki/reincarnation/trigger-cycle', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/reincarnation/phoenix-stats'] });
    }
  });

  const stopCycleMutation = useMutation({
    mutationFn: () => fetch('/api/waides-ki/reincarnation/stop-cycle', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/reincarnation/phoenix-stats'] });
    }
  });

  const getSpiritualMaturityColor = (maturity: string) => {
    const colors = {
      'NOVICE': 'bg-slate-500',
      'APPRENTICE': 'bg-blue-500',
      'ADEPT': 'bg-purple-500',
      'MASTER': 'bg-orange-500',
      'TRANSCENDENT': 'bg-gradient-to-r from-yellow-400 to-orange-500'
    };
    return colors[maturity as keyof typeof colors] || 'bg-slate-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-100 flex items-center justify-center gap-2">
          <Zap className="w-8 h-8 text-orange-500" />
          Waides KI Reincarnation Loop
        </h2>
        <p className="text-slate-400">
          "There are no failed trades — only unfinished timelines."
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Skull className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-xs text-slate-400">Souls Processed</div>
                <div className="text-lg font-bold text-slate-100">
                  {memoryVault?.total_souls_processed || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Phoenix className="w-5 h-5 text-orange-400" />
              <div>
                <div className="text-xs text-slate-400">Reincarnations</div>
                <div className="text-lg font-bold text-slate-100">
                  {sacredWisdom?.total_reincarnations || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-xs text-slate-400">Spiritual Growth</div>
                <div className="text-lg font-bold text-slate-100">
                  {memoryVault?.spiritual_growth || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ArrowUp className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-xs text-slate-400">Phoenix Strength</div>
                <div className="text-lg font-bold text-slate-100">
                  {sacredWisdom?.phoenix_strength || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="memory-vault" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800">
          <TabsTrigger value="memory-vault">Memory Vault</TabsTrigger>
          <TabsTrigger value="phoenix-cycle">Phoenix Cycle</TabsTrigger>
          <TabsTrigger value="strategy-evolution">Strategy Evolution</TabsTrigger>
          <TabsTrigger value="sacred-wisdom">Sacred Wisdom</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
        </TabsList>

        {/* Memory Vault Tab */}
        <TabsContent value="memory-vault" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Skull className="w-5 h-5 text-red-400" />
                  Most Painful Lesson
                </CardTitle>
              </CardHeader>
              <CardContent>
                {memoryVault?.most_painful_lesson ? (
                  <div className="space-y-2">
                    <div className="text-sm text-slate-400">
                      Trade: {memoryVault.most_painful_lesson.id?.substring(0, 8)}...
                    </div>
                    <div className="text-slate-200 font-medium">
                      {memoryVault.most_painful_lesson.lesson}
                    </div>
                    <div className="text-xs text-slate-400">
                      Spiritual Weight: {memoryVault.most_painful_lesson.spiritual_weight}/100
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400">No painful lessons yet...</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Phoenix className="w-5 h-5 text-orange-400" />
                  Most Reincarnated
                </CardTitle>
              </CardHeader>
              <CardContent>
                {memoryVault?.most_reincarnated ? (
                  <div className="space-y-2">
                    <div className="text-sm text-slate-400">
                      Trade: {memoryVault.most_reincarnated.id?.substring(0, 8)}...
                    </div>
                    <div className="text-slate-200 font-medium">
                      Reincarnated {memoryVault.most_reincarnated.reincarnation_count} times
                    </div>
                    <div className="text-xs text-slate-400">
                      Last analyzed: {new Date(memoryVault.most_reincarnated.last_analyzed).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400">No reincarnations yet...</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Failure Patterns */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Failure Patterns Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {memoryVault?.failure_patterns && Object.entries(memoryVault.failure_patterns).map(([pattern, count]) => (
                  <div key={pattern} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                    <span className="text-sm text-slate-300">{pattern.replace('_', ' ')}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Konslang Wisdom */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                Konslang Wisdom Collected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {memoryVault?.konslang_wisdom?.map((wisdom: string, index: number) => (
                  <div key={index} className="p-2 bg-slate-800 rounded text-sm text-purple-300 italic">
                    {wisdom}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phoenix Cycle Tab */}
        <TabsContent value="phoenix-cycle" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-orange-400" />
                  Current Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                {phoenixStats?.current_session ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status</span>
                      <Badge className="bg-green-500">{phoenixStats.current_session.completion_status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Trades Processed</span>
                      <span className="text-slate-200">{phoenixStats.current_session.trades_processed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Strategies Evolved</span>
                      <span className="text-slate-200">{phoenixStats.current_session.strategies_evolved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Insights Gained</span>
                      <span className="text-slate-200">{phoenixStats.current_session.spiritual_insights?.length || 0}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-4">
                    No active reincarnation session
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Reincarnation Mastery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Current Level</span>
                    <Badge className={getSpiritualMaturityColor(sacredWisdom?.reincarnation_mastery || 'NOVICE')}>
                      {sacredWisdom?.reincarnation_mastery || 'NOVICE'}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Phoenix Strength</span>
                      <span className="text-slate-300">{sacredWisdom?.phoenix_strength || 0}/1000</span>
                    </div>
                    <Progress 
                      value={(sacredWisdom?.phoenix_strength || 0) / 10} 
                      className="h-2"
                    />
                  </div>
                  <div className="text-xs text-slate-400">
                    Spiritual Growth Score: {sacredWisdom?.spiritual_growth_score || 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trades Awaiting Reincarnation */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Skull className="w-5 h-5 text-red-400" />
                Trades Awaiting Reincarnation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-2xl font-bold text-slate-100">
                  {phoenixStats?.trades_awaiting_reincarnation || 0}
                </div>
                <div className="text-sm text-slate-400">
                  souls ready for rebirth
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Spiritual Insights */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                Recent Spiritual Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {phoenixStats?.last_spiritual_insights?.map((insight: string, index: number) => (
                  <div key={index} className="p-2 bg-slate-800 rounded text-sm text-purple-300 italic">
                    {insight}
                  </div>
                )) || (
                  <div className="text-slate-400 text-center py-4">
                    No recent insights available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategy Evolution Tab */}
        <TabsContent value="strategy-evolution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-100">
                    {evolutionStats?.total_strategies || 0}
                  </div>
                  <div className="text-sm text-slate-400">Total Strategies</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-100">
                    {evolutionStats?.total_evolutions || 0}
                  </div>
                  <div className="text-sm text-slate-400">Total Evolutions</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-100">
                    {evolutionStats?.average_performance_boost?.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-slate-400">Avg Performance Boost</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Evolutions */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUp className="w-5 h-5 text-green-400" />
                Recent Strategy Evolutions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentEvolutions?.map((evolution: any, index: number) => (
                  <div key={index} className="p-3 bg-slate-800 rounded space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-slate-200">
                          {evolution.evolved_strategy}
                        </div>
                        <div className="text-xs text-slate-400">
                          From: {evolution.original_strategy}
                        </div>
                      </div>
                      <Badge className={
                        evolution.implementation_priority === 'CRITICAL' ? 'bg-red-500' :
                        evolution.implementation_priority === 'HIGH' ? 'bg-orange-500' :
                        evolution.implementation_priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                      }>
                        {evolution.implementation_priority}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-purple-300 italic">
                      {evolution.spiritual_advancement}
                    </div>
                    
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{evolution.improvement_type.replace('_', ' ')}</span>
                      <span className="text-green-400">+{evolution.expected_performance_boost.toFixed(1)}%</span>
                    </div>
                  </div>
                )) || (
                  <div className="text-slate-400 text-center py-4">
                    No recent evolutions available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sacred Wisdom Tab */}
        <TabsContent value="sacred-wisdom" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                Most Learned Lesson
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-lg text-purple-300 italic mb-2">
                  "{sacredWisdom?.most_learned_lesson || 'The journey of wisdom begins with the first fall'}"
                </div>
                <div className="text-sm text-slate-400">
                  Phoenix Mastery: {sacredWisdom?.reincarnation_mastery || 'NOVICE'}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle>Reincarnation Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Failures Processed</span>
                  <span className="text-slate-200">{reincarnationStats?.total_failures_processed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Reincarnations</span>
                  <span className="text-slate-200">{reincarnationStats?.total_reincarnations || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lessons Learned</span>
                  <span className="text-slate-200">{reincarnationStats?.lessons_learned || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Strategies Evolved</span>
                  <span className="text-slate-200">{reincarnationStats?.strategies_evolved || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Success Rate</span>
                  <span className="text-slate-200">{reincarnationStats?.reincarnation_success_rate?.toFixed(1) || 0}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle>Phoenix Progression</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-400 mb-2">
                    🔥
                  </div>
                  <div className="text-lg font-bold text-slate-100">
                    {sacredWisdom?.reincarnation_mastery || 'NOVICE'}
                  </div>
                  <div className="text-sm text-slate-400">
                    Phoenix Level
                  </div>
                </div>
                
                <Progress 
                  value={(sacredWisdom?.phoenix_strength || 0) / 10} 
                  className="h-3"
                />
                
                <div className="text-xs text-center text-slate-400">
                  {sacredWisdom?.phoenix_strength || 0} / 1000 Phoenix Strength
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Reincarnation Cycle Controls
              </CardTitle>
              <CardDescription>
                Manually trigger or stop the reincarnation process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => triggerCycleMutation.mutate()}
                  disabled={triggerCycleMutation.isPending || phoenixStats?.current_session?.completion_status === 'ACTIVE'}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {triggerCycleMutation.isPending ? 'Triggering...' : 'Begin Reincarnation Cycle'}
                </Button>

                <Button
                  onClick={() => stopCycleMutation.mutate()}
                  disabled={stopCycleMutation.isPending || !phoenixStats?.current_session}
                  variant="destructive"
                >
                  <Timer className="w-4 h-4 mr-2" />
                  {stopCycleMutation.isPending ? 'Stopping...' : 'Stop Current Cycle'}
                </Button>
              </div>

              <div className="text-sm text-slate-400">
                <p>• Reincarnation cycles run automatically every 4 hours</p>
                <p>• Each cycle processes failed trades and evolves strategies</p>
                <p>• Manual triggers can accelerate the learning process</p>
              </div>
            </CardContent>
          </Card>

          {/* Test Failure Logging */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Skull className="w-5 h-5 text-red-400" />
                Test Failure Logging
              </CardTitle>
              <CardDescription>
                Simulate a failed trade for testing the reincarnation system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  const testFailure = {
                    trade_id: `test_${Date.now()}`,
                    reason: 'greed_loss',
                    loss_amount: -25.50,
                    context: {
                      entry_price: 3400,
                      exit_price: 3374.50,
                      pattern: 'false_breakout',
                      strategy: 'Test_Strategy',
                      confidence: 85
                    },
                    market_data: {
                      volatility: 'high',
                      price_change_24h: -3.2
                    }
                  };

                  fetch('/api/waides-ki/reincarnation/log-failure', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testFailure)
                  }).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/reincarnation/memory-vault'] });
                    queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/reincarnation/stats'] });
                  });
                }}
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                <Skull className="w-4 h-4 mr-2" />
                Log Test Failure
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}