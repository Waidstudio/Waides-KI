import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Network, Bot, Activity, AlertTriangle, CheckCircle, Zap, Target, TrendingUp } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface SystemHealthReport {
  overall: {
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    uptime: number;
    responseTime: number;
  };
  entities: {
    [key: string]: {
      status: 'online' | 'offline' | 'degraded';
      performance: number;
      errorRate: number;
      lastUpdate: string;
    };
  };
  integration: {
    signalFlow: number;
    dataConsistency: number;
    communicationHealth: number;
    systemSync: number;
  };
}

interface CrossEntityAnalysis {
  correlations: {
    [key: string]: number;
  };
  consensus: {
    bullish: number;
    bearish: number;
    neutral: number;
    dominant: 'bullish' | 'bearish' | 'neutral';
  };
  performance: {
    bestPerforming: string;
    worstPerforming: string;
    averageAccuracy: number;
  };
  recommendations: string[];
}

interface IntegratedSignal {
  signal: {
    action: 'buy' | 'sell' | 'hold';
    confidence: number;
    consensus: number;
    timestamp: string;
  };
  entityContributions: {
    [key: string]: {
      weight: number;
      confidence: number;
      recommendation: string;
    };
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigation: string[];
  };
}

interface IntegrationStats {
  totalSignals: number;
  successfulIntegrations: number;
  averageConsensus: number;
  systemEfficiency: number;
  entitySyncRate: number;
}

export default function EntityIntegrationDashboard() {
  const [selectedTab, setSelectedTab] = useState('health');
  const [signalRequest, setSignalRequest] = useState({
    entityId: 'alpha',
    signal: {
      action: 'buy',
      confidence: '0.8',
      amount: '1000'
    },
    marketData: {
      price: '3200',
      volume: '150000',
      volatility: '0.025'
    }
  });

  // Fetch system health report
  const { data: healthReport, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/integration/system-health'],
    refetchInterval: 10000,
  });

  // Fetch cross-entity analysis
  const { data: crossAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['/api/integration/cross-entity-analysis'],
    refetchInterval: 15000,
  });

  // Fetch integration statistics
  const { data: integrationStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/integration/stats'],
    refetchInterval: 20000,
  });

  // Process integrated signal mutation
  const processSignal = useMutation({
    mutationFn: async (request: any) => {
      return apiRequest('/api/integration/process-signal', 'POST', {
        entityId: request.entityId,
        signal: {
          action: request.signal.action,
          confidence: parseFloat(request.signal.confidence),
          amount: parseFloat(request.signal.amount)
        },
        marketData: {
          price: parseFloat(request.marketData.price),
          volume: parseFloat(request.marketData.volume),
          volatility: parseFloat(request.marketData.volatility),
          timestamp: Date.now()
        }
      });
    },
  });

  const handleProcessSignal = () => {
    processSignal.mutate(signalRequest);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600';
      case 'critical':
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
      case 'offline':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const entityNames = {
    alpha: 'WaidBot Alpha',
    beta: 'WaidBot Pro Beta',
    gamma: 'Autonomous Trader Gamma',
    omega: 'Full Engine Omega',
    delta: 'Smai Chinnikstah Delta',
    epsilon: 'Nwaora Chigozie Epsilon'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Network className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-semibold">Entity Integration Hub</h2>
        <Badge variant="outline" className="text-xs">
          Central Coordination
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="analysis">Cross Analysis</TabsTrigger>
          <TabsTrigger value="signals">Signal Processing</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  System Overview
                </CardTitle>
                <CardDescription>
                  Overall system health and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {healthReport?.success ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${getStatusColor(healthReport.report.overall.status)}`}>
                        {healthReport.report.overall.score}%
                      </div>
                      <div className="text-lg font-medium mt-2 capitalize">
                        {healthReport.report.overall.status}
                      </div>
                      <Progress value={healthReport.report.overall.score} className="mt-4" />
                    </div>

                    <div className="grid gap-3 text-sm">
                      <div className="flex justify-between">
                        <span>System Uptime</span>
                        <span className="font-medium">{healthReport.report.overall.uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time</span>
                        <span className="font-medium">{healthReport.report.overall.responseTime}ms</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Integration Health</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Signal Flow</span>
                          <div className="flex items-center gap-2">
                            <Progress value={healthReport.report.integration.signalFlow} className="w-24" />
                            <span className="text-xs w-12">{healthReport.report.integration.signalFlow}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Data Consistency</span>
                          <div className="flex items-center gap-2">
                            <Progress value={healthReport.report.integration.dataConsistency} className="w-24" />
                            <span className="text-xs w-12">{healthReport.report.integration.dataConsistency}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Communication</span>
                          <div className="flex items-center gap-2">
                            <Progress value={healthReport.report.integration.communicationHealth} className="w-24" />
                            <span className="text-xs w-12">{healthReport.report.integration.communicationHealth}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">System Sync</span>
                          <div className="flex items-center gap-2">
                            <Progress value={healthReport.report.integration.systemSync} className="w-24" />
                            <span className="text-xs w-12">{healthReport.report.integration.systemSync}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    {healthLoading ? 'Loading system health...' : 'Health data unavailable'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-500" />
                  Entity Status
                </CardTitle>
                <CardDescription>
                  Individual entity health and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {healthReport?.success ? (
                  <div className="space-y-3">
                    {Object.entries(healthReport.report.entities).map(([entityId, entity]: [string, any]) => (
                      <div key={entityId} className="flex items-center justify-between p-3 bg-muted rounded">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(entity.status)}
                          <div>
                            <div className="font-medium">
                              {entityNames[entityId as keyof typeof entityNames] || entityId}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {entity.status} • {entity.performance}% performance
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={entity.errorRate < 5 ? 'default' : 'destructive'}>
                            {entity.errorRate}% errors
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(entity.lastUpdate).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Entity statuses will appear here
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Cross-Entity Analysis
              </CardTitle>
              <CardDescription>
                Correlation and consensus analysis across all trading entities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {crossAnalysis?.success ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {crossAnalysis.analysis.consensus.bullish}%
                      </div>
                      <div className="text-sm text-green-500">Bullish Consensus</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded">
                      <div className="text-2xl font-bold text-yellow-600">
                        {crossAnalysis.analysis.consensus.neutral}%
                      </div>
                      <div className="text-sm text-yellow-500">Neutral</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded">
                      <div className="text-2xl font-bold text-red-600">
                        {crossAnalysis.analysis.consensus.bearish}%
                      </div>
                      <div className="text-sm text-red-500">Bearish Consensus</div>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-xl font-bold mb-2">
                      Market Consensus: {crossAnalysis.analysis.consensus.dominant.toUpperCase()}
                    </div>
                    <Badge variant={
                      crossAnalysis.analysis.consensus.dominant === 'bullish' ? 'default' :
                      crossAnalysis.analysis.consensus.dominant === 'bearish' ? 'destructive' : 'secondary'
                    }>
                      Dominant Signal
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <Label>Entity Correlations</Label>
                    {Object.entries(crossAnalysis.analysis.correlations).map(([pair, correlation]: [string, any]) => (
                      <div key={pair} className="flex justify-between items-center">
                        <span className="text-sm">{pair}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.abs(correlation) * 100} className="w-24" />
                          <span className={`text-xs w-12 ${correlation > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(correlation * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Performance Leaders</Label>
                      <div className="p-3 bg-green-50 rounded">
                        <div className="font-medium text-green-700">Best Performing</div>
                        <div className="text-green-600">
                          {entityNames[crossAnalysis.analysis.performance.bestPerforming as keyof typeof entityNames] || 
                           crossAnalysis.analysis.performance.bestPerforming}
                        </div>
                      </div>
                      <div className="p-3 bg-red-50 rounded">
                        <div className="font-medium text-red-700">Needs Improvement</div>
                        <div className="text-red-600">
                          {entityNames[crossAnalysis.analysis.performance.worstPerforming as keyof typeof entityNames] || 
                           crossAnalysis.analysis.performance.worstPerforming}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>System Recommendations</Label>
                      <div className="space-y-2">
                        {crossAnalysis.analysis.recommendations.map((recommendation: string, index: number) => (
                          <div key={index} className="p-2 bg-muted rounded text-sm">
                            {recommendation}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {crossAnalysis.analysis.performance.averageAccuracy}%
                    </div>
                    <div className="text-sm text-muted-foreground">Average System Accuracy</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                  <div className="text-lg font-medium">Cross-Entity Analysis</div>
                  <div className="text-sm">
                    {analysisLoading ? 'Analyzing correlations...' : 'Analysis data will appear here'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Process Integrated Signal
                </CardTitle>
                <CardDescription>
                  Submit signals for integration across all entities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="entityId">Source Entity</Label>
                  <Select 
                    value={signalRequest.entityId}
                    onValueChange={(value) => setSignalRequest(prev => ({ ...prev, entityId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alpha">WaidBot Alpha</SelectItem>
                      <SelectItem value="beta">WaidBot Pro Beta</SelectItem>
                      <SelectItem value="gamma">Autonomous Trader Gamma</SelectItem>
                      <SelectItem value="omega">Full Engine Omega</SelectItem>
                      <SelectItem value="delta">Smai Chinnikstah Delta</SelectItem>
                      <SelectItem value="epsilon">Nwaora Chigozie Epsilon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Signal Details</Label>
                  <div className="grid gap-2">
                    <Select 
                      value={signalRequest.signal.action}
                      onValueChange={(value) => setSignalRequest(prev => ({ 
                        ...prev, 
                        signal: { ...prev.signal, action: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                        <SelectItem value="hold">Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Confidence (0-1)"
                      value={signalRequest.signal.confidence}
                      onChange={(e) => setSignalRequest(prev => ({
                        ...prev,
                        signal: { ...prev.signal, confidence: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Amount ($)"
                      value={signalRequest.signal.amount}
                      onChange={(e) => setSignalRequest(prev => ({
                        ...prev,
                        signal: { ...prev.signal, amount: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Market Context</Label>
                  <div className="grid gap-2">
                    <Input
                      placeholder="Price"
                      value={signalRequest.marketData.price}
                      onChange={(e) => setSignalRequest(prev => ({
                        ...prev,
                        marketData: { ...prev.marketData, price: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Volume"
                      value={signalRequest.marketData.volume}
                      onChange={(e) => setSignalRequest(prev => ({
                        ...prev,
                        marketData: { ...prev.marketData, volume: e.target.value }
                      }))}
                    />
                    <Input
                      placeholder="Volatility"
                      value={signalRequest.marketData.volatility}
                      onChange={(e) => setSignalRequest(prev => ({
                        ...prev,
                        marketData: { ...prev.marketData, volatility: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleProcessSignal}
                  disabled={processSignal.isPending}
                  className="w-full"
                >
                  {processSignal.isPending ? 'Processing...' : 'Process Integrated Signal'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Integration Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processSignal.data?.success ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {processSignal.data.integratedSignal.signal.action.toUpperCase()}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Confidence: {(processSignal.data.integratedSignal.signal.confidence * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Consensus: {(processSignal.data.integratedSignal.signal.consensus * 100).toFixed(0)}%
                      </div>
                      <Progress value={processSignal.data.integratedSignal.signal.consensus * 100} className="mt-2" />
                    </div>

                    <div className="space-y-3">
                      <Label>Entity Contributions</Label>
                      {Object.entries(processSignal.data.integratedSignal.entityContributions).map(([entityId, contribution]: [string, any]) => (
                        <div key={entityId} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm font-medium">
                            {entityNames[entityId as keyof typeof entityNames] || entityId}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">Weight: {(contribution.weight * 100).toFixed(0)}%</span>
                            <Progress value={contribution.confidence * 100} className="w-16" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-muted rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Risk Assessment</span>
                        <Badge variant={
                          processSignal.data.integratedSignal.riskAssessment.level === 'low' ? 'default' :
                          processSignal.data.integratedSignal.riskAssessment.level === 'medium' ? 'secondary' : 'destructive'
                        }>
                          {processSignal.data.integratedSignal.riskAssessment.level.toUpperCase()} RISK
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {processSignal.data.integratedSignal.riskAssessment.factors.map((factor: string, index: number) => (
                          <div key={index}>• {factor}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : processSignal.error ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Processing failed: {processSignal.error.message}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Target className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <div>Submit a signal to see integration results</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-blue-500" />
                Integration Statistics
              </CardTitle>
              <CardDescription>
                Performance metrics for entity integration system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {integrationStats?.success ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold">
                      {integrationStats.stats?.totalSignals || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Signals</div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {integrationStats.stats?.successfulIntegrations || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Successful</div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {integrationStats.stats?.averageConsensus || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Consensus</div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      {integrationStats.stats?.systemEfficiency || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Efficiency</div>
                  </div>

                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-orange-600">
                      {integrationStats.stats?.entitySyncRate || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Sync Rate</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Network className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                  <div className="text-lg font-medium">Integration Statistics</div>
                  <div className="text-sm">
                    {statsLoading ? 'Loading statistics...' : 'System performance metrics'}
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