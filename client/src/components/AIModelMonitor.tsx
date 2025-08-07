import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Activity, TrendingUp, Shield, AlertTriangle, Zap, Target } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface AIModelStats {
  testDatasets: {
    total: number;
    validated: number;
    training: number;
    testing: number;
  };
  modelPerformance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  driftAlerts: Array<{
    modelId: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: string;
  }>;
  trainingStats: {
    modelsInTraining: number;
    averageTrainingTime: number;
    lastTrainingCompleted: string;
    successRate: number;
  };
}

interface TraceabilityStats {
  totalModels: number;
  activeModels: number;
  modelVersions: number;
  deploymentHistory: Array<{
    modelId: string;
    version: string;
    deployedAt: string;
    performance: number;
  }>;
}

export default function AIModelMonitor() {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch AI model data statistics
  const { data: testDataStats, isLoading: testDataLoading } = useQuery({
    queryKey: ['/api/ai/test-data/stats'],
    refetchInterval: 10000,
  });

  // Fetch model training statistics
  const { data: trainingStats, isLoading: trainingLoading } = useQuery({
    queryKey: ['/api/ai/models/training-stats'],
    refetchInterval: 15000,
  });

  // Fetch drift monitoring alerts
  const { data: driftAlerts, isLoading: driftLoading } = useQuery({
    queryKey: ['/api/ai/drift-monitor/alerts'],
    refetchInterval: 5000,
  });

  // Fetch traceability statistics
  const { data: traceabilityStats, isLoading: traceabilityLoading } = useQuery({
    queryKey: ['/api/ai/traceability/stats'],
    refetchInterval: 20000,
  });

  const isLoading = testDataLoading || trainingLoading || driftLoading || traceabilityLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-semibold">AI Model Monitor</h2>
        <Badge variant="outline" className="text-xs">
          {isLoading ? 'Loading...' : 'Live Data'}
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="drift">Drift Monitor</TabsTrigger>
          <TabsTrigger value="traceability">Traceability</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Test Datasets</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {testDataStats?.stats?.testDatasets?.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {testDataStats?.stats?.testDatasets?.validated || 0} validated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {trainingStats?.stats?.modelPerformance?.accuracy || 0}%
                </div>
                <Progress 
                  value={trainingStats?.stats?.modelPerformance?.accuracy || 0} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Models</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {traceabilityStats?.stats?.activeModels || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {traceabilityStats?.stats?.totalModels || 0} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Drift Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {driftAlerts?.alerts?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active monitoring
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Drift Alerts */}
          {driftAlerts?.alerts && driftAlerts.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Recent Drift Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {driftAlerts.alerts.slice(0, 3).map((alert: any, index: number) => (
                  <Alert key={index} className="border-orange-200">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex justify-between items-center">
                        <span>{alert.message}</span>
                        <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Training Statistics
              </CardTitle>
              <CardDescription>
                Current model training performance and metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Models in Training</Label>
                  <div className="text-2xl font-bold">
                    {trainingStats?.stats?.trainingStats?.modelsInTraining || 0}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Success Rate</Label>
                  <div className="text-2xl font-bold text-green-600">
                    {trainingStats?.stats?.trainingStats?.successRate || 0}%
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Average Training Time</Label>
                <div className="text-lg">
                  {trainingStats?.stats?.trainingStats?.averageTrainingTime || 0} minutes
                </div>
              </div>

              <div className="space-y-2">
                <Label>Last Training Completed</Label>
                <div className="text-sm text-muted-foreground">
                  {trainingStats?.stats?.trainingStats?.lastTrainingCompleted || 'No recent training'}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drift" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-500" />
                Performance Drift Monitor
              </CardTitle>
              <CardDescription>
                Real-time monitoring of model performance degradation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {driftAlerts?.alerts && driftAlerts.alerts.length > 0 ? (
                <div className="space-y-3">
                  {driftAlerts.alerts.map((alert: any, index: number) => (
                    <Alert key={index} 
                          className={alert.severity === 'high' ? 'border-red-200' : 
                                   alert.severity === 'medium' ? 'border-orange-200' : 'border-yellow-200'}>
                      <AlertTriangle className={`h-4 w-4 ${
                        alert.severity === 'high' ? 'text-red-500' : 
                        alert.severity === 'medium' ? 'text-orange-500' : 'text-yellow-500'
                      }`} />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{alert.modelId}</div>
                            <div className="text-sm">{alert.message}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <Badge variant={alert.severity === 'high' ? 'destructive' : 
                                         alert.severity === 'medium' ? 'default' : 'secondary'}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <div className="text-lg font-medium">All Models Stable</div>
                  <div className="text-sm">No performance drift detected</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traceability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Model Traceability
              </CardTitle>
              <CardDescription>
                Complete audit trail of model deployments and versions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {traceabilityStats?.stats?.totalModels || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Models</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {traceabilityStats?.stats?.activeModels || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Models</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {traceabilityStats?.stats?.modelVersions || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Versions</div>
                </div>
              </div>

              {traceabilityStats?.stats?.deploymentHistory && (
                <div className="space-y-2">
                  <Label>Recent Deployments</Label>
                  <div className="space-y-2">
                    {traceabilityStats.stats.deploymentHistory.slice(0, 5).map((deployment: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <div className="font-medium">{deployment.modelId}</div>
                          <div className="text-sm text-muted-foreground">v{deployment.version}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{deployment.performance}%</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(deployment.deployedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
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