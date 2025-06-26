/**
 * STEP 58 — ETH Empath Network Guardian Interface
 * Frontend for Guardian Mesh Execution & Trust Management
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Zap, Users, TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock, Target } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface GuardianStatus {
  guardian: {
    statistics: {
      total_evaluations: number;
      approval_rate: number;
      average_confidence: number;
      average_safety_score: number;
      protection_frequency: { [key: string]: number };
      recent_decisions: any[];
    };
    health: {
      status: 'healthy' | 'cautious' | 'protective';
      recent_approval_rate: number;
      safety_trend: string;
      protection_level: string;
    };
  };
  executor: {
    statistics: {
      total_executions: number;
      execution_rate: number;
      success_rate: number;
      average_guardian_confidence: number;
      safety_measure_frequency: { [key: string]: number };
      trade_outcomes: {
        total_trades: number;
        wins: number;
        losses: number;
        pending: number;
        win_rate: number;
        total_pnl: number;
      };
      recent_executions: any[];
    };
    health: {
      status: 'healthy' | 'degraded' | 'critical';
      execution_enabled: boolean;
      safety_lock_active: boolean;
      recent_success_rate: number;
      guardian_trust_level: string;
    };
  };
}

interface TrustStatus {
  node_trust_scores: Array<{
    node_id: string;
    trust_score: number;
    performance_history: {
      total_trades: number;
      wins: number;
      losses: number;
      win_rate: number;
      avg_profit: number;
      last_update: number;
    };
    influence_weight: number;
    trust_level: 'low' | 'moderate' | 'high' | 'elite';
  }>;
  mesh_metrics: {
    total_feedback_cycles: number;
    network_performance: {
      overall_win_rate: number;
      total_profit_loss: number;
      average_trade_quality: number;
      consensus_accuracy: number;
    };
    trust_distribution: {
      low_trust_nodes: number;
      moderate_trust_nodes: number;
      high_trust_nodes: number;
      elite_trust_nodes: number;
    };
    learning_progression: {
      improvement_rate: number;
      stability_score: number;
      adaptation_speed: number;
    };
  };
  feedback_health: {
    status: 'healthy' | 'degraded' | 'critical';
    active_nodes: number;
    feedback_frequency: number;
    trust_stability: number;
    performance_trend: string;
  };
}

interface TradeRecords {
  trade_records: Array<{
    trade_id: string;
    symbol: string;
    action: string;
    amount: number;
    timestamp: number;
    guardian_decision: any;
    execution_result: any;
    outcome?: 'pending' | 'win' | 'loss';
    profit_loss?: number;
  }>;
  last_trade: any;
  total_trades: number;
}

export function ETHEmpathNetworkGuardian() {
  const [executionForm, setExecutionForm] = useState({
    symbol: 'ETH/USDT',
    action: 'BUY',
    amount: '0.1',
    setup: 'Guardian mesh execution test',
    meta: '{}',
    indicators: '{}'
  });

  const [outcomeForm, setOutcomeForm] = useState({
    tradeId: '',
    symbol: 'ETH/USDT',
    action: 'BUY',
    outcome: 'win',
    profitLoss: '0',
    guardianConfidence: '0.8',
    meshConsensus: '0.7',
    durationMinutes: '60'
  });

  const queryClient = useQueryClient();

  // Query guardian status
  const { data: guardianStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/mesh/guardian_status'],
    refetchInterval: 10000
  });

  // Query trust status
  const { data: trustStatus, isLoading: trustLoading } = useQuery({
    queryKey: ['/api/mesh/trust_status'],
    refetchInterval: 15000
  });

  // Query trade records
  const { data: tradeRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ['/api/mesh/trade_records'],
    refetchInterval: 5000
  });

  // Execute trade mutation
  const executeTradeMutation = useMutation({
    mutationFn: async (tradeData: any) => {
      return apiRequest('/api/mesh/execute_trade', {
        method: 'POST',
        body: JSON.stringify(tradeData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mesh/guardian_status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mesh/trade_records'] });
    }
  });

  // Record outcome mutation
  const recordOutcomeMutation = useMutation({
    mutationFn: async (outcomeData: any) => {
      return apiRequest('/api/mesh/record_outcome', {
        method: 'POST',
        body: JSON.stringify(outcomeData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mesh/trust_status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mesh/trade_records'] });
    }
  });

  // Guardian control mutation
  const guardianControlMutation = useMutation({
    mutationFn: async ({ action, duration }: { action: string; duration?: number }) => {
      return apiRequest('/api/mesh/guardian_control', {
        method: 'POST',
        body: JSON.stringify({ action, duration })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mesh/guardian_status'] });
    }
  });

  // Demo execution mutation
  const demoExecutionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/mesh/demo_execution', {
        method: 'POST'
      });
    }
  });

  const handleExecuteTrade = () => {
    try {
      const tradeData = {
        ...executionForm,
        amount: parseFloat(executionForm.amount),
        meta: executionForm.meta ? JSON.parse(executionForm.meta) : {},
        indicators: executionForm.indicators ? JSON.parse(executionForm.indicators) : {}
      };
      executeTradeMutation.mutate(tradeData);
    } catch (error) {
      console.error('Invalid JSON in form fields');
    }
  };

  const handleRecordOutcome = () => {
    const outcomeData = {
      ...outcomeForm,
      profitLoss: parseFloat(outcomeForm.profitLoss),
      guardianConfidence: parseFloat(outcomeForm.guardianConfidence),
      meshConsensus: parseFloat(outcomeForm.meshConsensus),
      durationMinutes: parseInt(outcomeForm.durationMinutes)
    };
    recordOutcomeMutation.mutate(outcomeData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': case 'cautious': return 'text-yellow-500';
      case 'critical': case 'protective': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case 'elite': return 'bg-purple-500';
      case 'high': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold">ETH Empath Network Guardian</h1>
          <p className="text-muted-foreground">Sentient Trade Execution & Mesh Trust Management</p>
        </div>
      </div>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="status">Guardian Status</TabsTrigger>
          <TabsTrigger value="execution">Trade Execution</TabsTrigger>
          <TabsTrigger value="trust">Trust Network</TabsTrigger>
          <TabsTrigger value="records">Trade Records</TabsTrigger>
          <TabsTrigger value="controls">System Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Guardian Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Guardian Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {statusLoading ? (
                  <div>Loading guardian status...</div>
                ) : guardianStatus ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <Badge className={getStatusColor(guardianStatus.guardian.health.status)}>
                        {guardianStatus.guardian.health.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Approval Rate:</span>
                        <span>{Math.round(guardianStatus.guardian.health.recent_approval_rate * 100)}%</span>
                      </div>
                      <Progress value={guardianStatus.guardian.health.recent_approval_rate * 100} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Safety Trend:</span>
                        <span className="capitalize">{guardianStatus.guardian.health.safety_trend}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protection Level:</span>
                        <span className="capitalize">{guardianStatus.guardian.health.protection_level}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>No guardian status available</div>
                )}
              </CardContent>
            </Card>

            {/* Executor Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Executor Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {statusLoading ? (
                  <div>Loading executor status...</div>
                ) : guardianStatus ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <Badge className={getStatusColor(guardianStatus.executor.health.status)}>
                        {guardianStatus.executor.health.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span>{Math.round(guardianStatus.executor.health.recent_success_rate * 100)}%</span>
                      </div>
                      <Progress value={guardianStatus.executor.health.recent_success_rate * 100} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span>Execution:</span>
                        <Badge variant={guardianStatus.executor.health.execution_enabled ? "default" : "destructive"}>
                          {guardianStatus.executor.health.execution_enabled ? "ENABLED" : "DISABLED"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Safety Lock:</span>
                        <Badge variant={guardianStatus.executor.health.safety_lock_active ? "destructive" : "default"}>
                          {guardianStatus.executor.health.safety_lock_active ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>No executor status available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Guardian Statistics */}
          {guardianStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Guardian Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{guardianStatus.guardian.statistics.total_evaluations}</div>
                    <div className="text-sm text-muted-foreground">Total Evaluations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(guardianStatus.guardian.statistics.approval_rate * 100)}%</div>
                    <div className="text-sm text-muted-foreground">Approval Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(guardianStatus.guardian.statistics.average_confidence * 100)}%</div>
                    <div className="text-sm text-muted-foreground">Avg Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(guardianStatus.guardian.statistics.average_safety_score * 100)}%</div>
                    <div className="text-sm text-muted-foreground">Safety Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="execution" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Execute Trade */}
            <Card>
              <CardHeader>
                <CardTitle>Execute Guardian Trade</CardTitle>
                <CardDescription>Submit trade for guardian evaluation and execution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      value={executionForm.symbol}
                      onChange={(e) => setExecutionForm({ ...executionForm, symbol: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="action">Action</Label>
                    <select
                      id="action"
                      className="w-full px-3 py-2 border rounded-md"
                      value={executionForm.action}
                      onChange={(e) => setExecutionForm({ ...executionForm, action: e.target.value })}
                    >
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.001"
                    value={executionForm.amount}
                    onChange={(e) => setExecutionForm({ ...executionForm, amount: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="setup">Trading Setup</Label>
                  <Input
                    id="setup"
                    value={executionForm.setup}
                    onChange={(e) => setExecutionForm({ ...executionForm, setup: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="meta">Meta (JSON)</Label>
                  <Textarea
                    id="meta"
                    value={executionForm.meta}
                    onChange={(e) => setExecutionForm({ ...executionForm, meta: e.target.value })}
                    placeholder='{"strategy": "breakout", "timeframe": "4h"}'
                  />
                </div>

                <div>
                  <Label htmlFor="indicators">Indicators (JSON)</Label>
                  <Textarea
                    id="indicators"
                    value={executionForm.indicators}
                    onChange={(e) => setExecutionForm({ ...executionForm, indicators: e.target.value })}
                    placeholder='{"rsi": 45, "ema_alignment": "bullish"}'
                  />
                </div>

                <Button 
                  onClick={handleExecuteTrade} 
                  disabled={executeTradeMutation.isPending}
                  className="w-full"
                >
                  {executeTradeMutation.isPending ? 'Executing...' : 'Execute Trade'}
                </Button>

                {executeTradeMutation.data && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Trade executed: {executeTradeMutation.data.execution_result.status}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Demo Execution */}
            <Card>
              <CardHeader>
                <CardTitle>Demo Guardian System</CardTitle>
                <CardDescription>Test guardian decision-making process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => demoExecutionMutation.mutate()}
                  disabled={demoExecutionMutation.isPending}
                  className="w-full"
                >
                  {demoExecutionMutation.isPending ? 'Running Demo...' : 'Run Demo Execution'}
                </Button>

                {demoExecutionMutation.data && (
                  <div className="space-y-2">
                    <div className="font-semibold">Demo Result:</div>
                    <div className="space-y-1 text-sm">
                      <div>Status: <Badge>{demoExecutionMutation.data.demo_execution.status}</Badge></div>
                      <div>Reason: {demoExecutionMutation.data.demo_execution.reason}</div>
                      <div>Protection: {demoExecutionMutation.data.guardian_protection.join(', ')}</div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div>Consensus: {Math.round((demoExecutionMutation.data.mesh_alignment.consensus_confidence || 0) * 100)}%</div>
                      <div>Vision: {Math.round((demoExecutionMutation.data.mesh_alignment.vision_confidence || 0) * 100)}%</div>
                      <div>Ethics: {demoExecutionMutation.data.mesh_alignment.ethical_approval ? '✓' : '✗'}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trust" className="space-y-4">
          {/* Node Trust Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Mesh Node Trust Scores</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trustLoading ? (
                <div>Loading trust data...</div>
              ) : trustStatus ? (
                <div className="space-y-4">
                  {trustStatus.node_trust_scores.map((node) => (
                    <div key={node.node_id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{node.node_id}</span>
                        <Badge className={getTrustLevelColor(node.trust_level)}>
                          {node.trust_level.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Trust Score</div>
                          <div className="font-semibold">{Math.round(node.trust_score * 100)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Influence</div>
                          <div className="font-semibold">{Math.round(node.influence_weight * 100)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Win Rate</div>
                          <div className="font-semibold">{Math.round(node.performance_history.win_rate * 100)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Total Trades</div>
                          <div className="font-semibold">{node.performance_history.total_trades}</div>
                        </div>
                      </div>
                      <Progress value={node.trust_score * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div>No trust data available</div>
              )}
            </CardContent>
          </Card>

          {/* Mesh Metrics */}
          {trustStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Network Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Overall Win Rate:</span>
                    <span>{Math.round(trustStatus.mesh_metrics.network_performance.overall_win_rate * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total P&L:</span>
                    <span className={trustStatus.mesh_metrics.network_performance.total_profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {trustStatus.mesh_metrics.network_performance.total_profit_loss.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trade Quality:</span>
                    <span>{Math.round(trustStatus.mesh_metrics.network_performance.average_trade_quality * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consensus Accuracy:</span>
                    <span>{Math.round(trustStatus.mesh_metrics.network_performance.consensus_accuracy * 100)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Progression</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Improvement Rate:</span>
                    <span className={trustStatus.mesh_metrics.learning_progression.improvement_rate >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {(trustStatus.mesh_metrics.learning_progression.improvement_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stability Score:</span>
                    <span>{Math.round(trustStatus.mesh_metrics.learning_progression.stability_score * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adaptation Speed:</span>
                    <span>{Math.round(trustStatus.mesh_metrics.learning_progression.adaptation_speed * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance Trend:</span>
                    <span className="capitalize">{trustStatus.feedback_health.performance_trend}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Record Trade Outcome */}
            <Card>
              <CardHeader>
                <CardTitle>Record Trade Outcome</CardTitle>
                <CardDescription>Update trust scores with trade results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tradeId">Trade ID</Label>
                  <Input
                    id="tradeId"
                    value={outcomeForm.tradeId}
                    onChange={(e) => setOutcomeForm({ ...outcomeForm, tradeId: e.target.value })}
                    placeholder="GT-1234567890-abc123"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="outcome-symbol">Symbol</Label>
                    <Input
                      id="outcome-symbol"
                      value={outcomeForm.symbol}
                      onChange={(e) => setOutcomeForm({ ...outcomeForm, symbol: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="outcome-action">Action</Label>
                    <select
                      id="outcome-action"
                      className="w-full px-3 py-2 border rounded-md"
                      value={outcomeForm.action}
                      onChange={(e) => setOutcomeForm({ ...outcomeForm, action: e.target.value })}
                    >
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="outcome">Outcome</Label>
                    <select
                      id="outcome"
                      className="w-full px-3 py-2 border rounded-md"
                      value={outcomeForm.outcome}
                      onChange={(e) => setOutcomeForm({ ...outcomeForm, outcome: e.target.value })}
                    >
                      <option value="win">Win</option>
                      <option value="loss">Loss</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="profitLoss">Profit/Loss</Label>
                    <Input
                      id="profitLoss"
                      type="number"
                      step="0.01"
                      value={outcomeForm.profitLoss}
                      onChange={(e) => setOutcomeForm({ ...outcomeForm, profitLoss: e.target.value })}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleRecordOutcome} 
                  disabled={recordOutcomeMutation.isPending}
                  className="w-full"
                >
                  {recordOutcomeMutation.isPending ? 'Recording...' : 'Record Outcome'}
                </Button>

                {recordOutcomeMutation.data && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Outcome recorded successfully
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Recent Trade Records */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Trade Records</CardTitle>
              </CardHeader>
              <CardContent>
                {recordsLoading ? (
                  <div>Loading trade records...</div>
                ) : tradeRecords ? (
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {tradeRecords.trade_records.slice(0, 10).map((trade) => (
                        <div key={trade.trade_id} className="border rounded p-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-xs">{trade.trade_id.slice(-8)}</span>
                            <Badge variant={trade.outcome === 'win' ? 'default' : trade.outcome === 'loss' ? 'destructive' : 'secondary'}>
                              {trade.outcome || 'pending'}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground">
                            {trade.symbol} {trade.action} {trade.amount}
                            {trade.profit_loss !== undefined && (
                              <span className={trade.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {' '}({trade.profit_loss > 0 ? '+' : ''}{trade.profit_loss})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div>No trade records available</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Execution Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Execution Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => guardianControlMutation.mutate({ action: 'enable_execution' })}
                  disabled={guardianControlMutation.isPending}
                  className="w-full"
                  variant="default"
                >
                  Enable Execution
                </Button>
                <Button 
                  onClick={() => guardianControlMutation.mutate({ action: 'disable_execution' })}
                  disabled={guardianControlMutation.isPending}
                  className="w-full"
                  variant="destructive"
                >
                  Disable Execution
                </Button>
              </CardContent>
            </Card>

            {/* Safety Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Safety Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => guardianControlMutation.mutate({ action: 'activate_safety_lock', duration: 3600000 })}
                  disabled={guardianControlMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  Safety Lock (1 hour)
                </Button>
                <Button 
                  onClick={() => guardianControlMutation.mutate({ action: 'activate_safety_lock', duration: 7200000 })}
                  disabled={guardianControlMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  Safety Lock (2 hours)
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {guardianStatus && (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Guardian:</span>
                      <Badge className={getStatusColor(guardianStatus.guardian.health.status)}>
                        {guardianStatus.guardian.health.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Executor:</span>
                      <Badge className={getStatusColor(guardianStatus.executor.health.status)}>
                        {guardianStatus.executor.health.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Trust Network:</span>
                      <Badge className={trustStatus ? getStatusColor(trustStatus.feedback_health.status) : 'text-gray-500'}>
                        {trustStatus?.feedback_health.status || 'unknown'}
                      </Badge>
                    </div>
                  </>
                )}

                {guardianControlMutation.data && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {guardianControlMutation.data.message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}