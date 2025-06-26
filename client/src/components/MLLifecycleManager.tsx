import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Activity, TrendingUp, Settings, Play, Pause, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  training_samples: number;
  training_timestamp: number;
  model_version: string;
}

interface HealthStatus {
  overall_health: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  health_score: number;
  accuracy_trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  last_drift_check: number;
  consecutive_drift_alerts: number;
  model_age_days: number;
  recommendation: string;
}

interface DriftMetrics {
  statistical_distance: number;
  p_value: number;
  drift_detected: boolean;
  drift_severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affected_features: string[];
  drift_timestamp: number;
}

interface ABTestDashboard {
  current_test: any;
  active_variants: any[];
  test_comparison: any;
  recommendations: string[];
  test_statistics: any;
}

export default function MLLifecycleManager() {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Fetch model trainer metrics
  const { data: trainerData, isLoading: trainerLoading } = useQuery({
    queryKey: ['/api/model-trainer/metrics'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch model health status
  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/model-health/status'],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Fetch A/B testing dashboard
  const { data: abTestData, isLoading: abTestLoading } = useQuery({
    queryKey: ['/api/ab-testing/dashboard'],
    refetchInterval: 20000, // Refresh every 20 seconds
  });

  // Fetch drift history
  const { data: driftHistory } = useQuery({
    queryKey: ['/api/model-health/drift-history'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Force retrain mutation
  const forceRetrainMutation = useMutation({
    mutationFn: () => apiRequest('/api/model-trainer/force-retrain', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/model-trainer/metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/model-health/status'] });
    },
  });

  // Reset baseline mutation
  const resetBaselineMutation = useMutation({
    mutationFn: () => apiRequest('/api/model-health/reset-baseline', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/model-health/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/model-health/drift-history'] });
    },
  });

  // Start A/B test mutation
  const startABTestMutation = useMutation({
    mutationFn: (testConfig: any) => apiRequest('/api/ab-testing/start-test', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testConfig)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ab-testing/dashboard'] });
    },
  });

  // Demo workflow mutation
  const runDemoMutation = useMutation({
    mutationFn: () => apiRequest('/api/ml-lifecycle/demo-workflow', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/model-trainer/metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/model-health/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ab-testing/dashboard'] });
    },
  });

  const modelMetrics: ModelMetrics = trainerData?.model_metrics || {
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1_score: 0,
    training_samples: 0,
    training_timestamp: 0,
    model_version: 'v1.0'
  };

  const healthStatus: HealthStatus = healthData?.health_status || {
    overall_health: 'GOOD',
    health_score: 85,
    accuracy_trend: 'STABLE',
    last_drift_check: Date.now(),
    consecutive_drift_alerts: 0,
    model_age_days: 0,
    recommendation: 'Model performing within normal parameters'
  };

  const driftMetrics: DriftMetrics = healthData?.drift_metrics || {
    statistical_distance: 0,
    p_value: 1,
    drift_detected: false,
    drift_severity: 'LOW',
    affected_features: [],
    drift_timestamp: Date.now()
  };

  const abDashboard: ABTestDashboard = abTestData?.ab_test_dashboard || {
    current_test: null,
    active_variants: [],
    test_comparison: null,
    recommendations: [],
    test_statistics: {}
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'EXCELLENT': return 'text-green-500';
      case 'GOOD': return 'text-blue-500';
      case 'FAIR': return 'text-yellow-500';
      case 'POOR': return 'text-orange-500';
      case 'CRITICAL': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getDriftSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HIGH': return 'bg-orange-500';
      case 'CRITICAL': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">ML Lifecycle Manager</h1>
          <p className="text-gray-400 mt-2">Automated model retraining, health monitoring, and A/B testing</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => runDemoMutation.mutate()}
            disabled={runDemoMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Run Demo
          </Button>
          <Button 
            onClick={() => queryClient.invalidateQueries()}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="training">Model Training</TabsTrigger>
          <TabsTrigger value="health">Health Monitor</TabsTrigger>
          <TabsTrigger value="abtesting">A/B Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* System Status Card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Model Health</span>
                    <Badge className={getHealthColor(healthStatus.overall_health)}>
                      {healthStatus.overall_health}
                    </Badge>
                  </div>
                  <Progress value={healthStatus.health_score} className="h-2" />
                  <span className="text-sm text-gray-400">{healthStatus.health_score}% Health Score</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Drift Detection</span>
                    <Badge className={driftMetrics.drift_detected ? 'bg-red-500' : 'bg-green-500'}>
                      {driftMetrics.drift_detected ? 'DETECTED' : 'NORMAL'}
                    </Badge>
                  </div>
                  {driftMetrics.drift_detected && (
                    <div className={`text-xs px-2 py-1 rounded ${getDriftSeverityColor(driftMetrics.drift_severity)}`}>
                      {driftMetrics.drift_severity} severity
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">A/B Testing</span>
                    <Badge className={abDashboard.current_test ? 'bg-blue-500' : 'bg-gray-500'}>
                      {abDashboard.current_test ? 'ACTIVE' : 'IDLE'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Model Performance Card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Model Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {(modelMetrics.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {(modelMetrics.f1_score * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">F1 Score</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {modelMetrics.training_samples.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Training Samples</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {modelMetrics.model_version}
                    </div>
                    <div className="text-sm text-gray-400">Version</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => forceRetrainMutation.mutate()}
                  disabled={forceRetrainMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  Force Retrain Model
                </Button>
                <Button 
                  onClick={() => resetBaselineMutation.mutate()}
                  disabled={resetBaselineMutation.isPending}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  size="sm"
                >
                  Reset Drift Baseline
                </Button>
                <Button 
                  onClick={() => startABTestMutation.mutate({
                    variant_a_id: 'model_a',
                    variant_b_id: 'model_b',
                    traffic_split: { a: 50, b: 50 },
                    duration_hours: 24
                  })}
                  disabled={startABTestMutation.isPending || abDashboard.current_test}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  Start A/B Test
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* System Recommendations */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">System Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1" />
                  <span className="text-gray-300">{healthStatus.recommendation}</span>
                </div>
                {abDashboard.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500 mt-1" />
                    <span className="text-gray-300">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Training Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {trainerLoading ? (
                  <div className="text-gray-400">Loading training data...</div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-lg font-semibold text-white">
                          {(modelMetrics.precision * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-400">Precision</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">
                          {(modelMetrics.recall * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-400">Recall</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Last Training</div>
                      <div className="text-white">
                        {new Date(modelMetrics.training_timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Should Retrain</div>
                      <Badge className={trainerData?.training_statistics?.should_retrain ? 'bg-orange-500' : 'bg-green-500'}>
                        {trainerData?.training_statistics?.should_retrain ? 'YES' : 'NO'}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Training Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Min Samples Required</span>
                    <span className="text-white">100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Retrain Interval</span>
                    <span className="text-white">24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Performance Threshold</span>
                    <span className="text-white">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Max Model Age</span>
                    <span className="text-white">7 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Health Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {healthLoading ? (
                  <div className="text-gray-400">Loading health data...</div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">Overall Health</span>
                        <span className={`font-semibold ${getHealthColor(healthStatus.overall_health)}`}>
                          {healthStatus.overall_health}
                        </span>
                      </div>
                      <Progress value={healthStatus.health_score} className="h-3" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Accuracy Trend</span>
                      <Badge className={
                        healthStatus.accuracy_trend === 'IMPROVING' ? 'bg-green-500' :
                        healthStatus.accuracy_trend === 'STABLE' ? 'bg-blue-500' : 'bg-red-500'
                      }>
                        {healthStatus.accuracy_trend}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Model Age</span>
                      <span className="text-white">{healthStatus.model_age_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Drift Alerts</span>
                      <span className="text-white">{healthStatus.consecutive_drift_alerts}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Drift Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Drift Status</span>
                    <Badge className={driftMetrics.drift_detected ? 'bg-red-500' : 'bg-green-500'}>
                      {driftMetrics.drift_detected ? 'DETECTED' : 'NORMAL'}
                    </Badge>
                  </div>
                  {driftMetrics.drift_detected && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Severity</span>
                        <span className={`px-2 py-1 rounded text-xs ${getDriftSeverityColor(driftMetrics.drift_severity)}`}>
                          {driftMetrics.drift_severity}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Affected Features</div>
                        <div className="text-white text-sm">
                          {driftMetrics.affected_features.join(', ') || 'None'}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-300">Statistical Distance</span>
                    <span className="text-white">{driftMetrics.statistical_distance.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">P-Value</span>
                    <span className="text-white">{driftMetrics.p_value.toFixed(4)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Drift History */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Drift History</CardTitle>
            </CardHeader>
            <CardContent>
              {driftHistory?.drift_history?.length > 0 ? (
                <div className="space-y-2">
                  {driftHistory.drift_history.slice(0, 5).map((alert: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                      <div>
                        <span className="text-white text-sm">
                          {new Date(alert.drift_timestamp).toLocaleString()}
                        </span>
                        <div className="text-xs text-gray-400">
                          Severity: {alert.drift_severity}
                        </div>
                      </div>
                      <Badge className={getDriftSeverityColor(alert.drift_severity)}>
                        {alert.drift_severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400">No drift alerts recorded</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abtesting" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Current Test</CardTitle>
              </CardHeader>
              <CardContent>
                {abTestLoading ? (
                  <div className="text-gray-400">Loading A/B test data...</div>
                ) : abDashboard.current_test ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Test Status</span>
                      <Badge className="bg-green-500">ACTIVE</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Variant A</span>
                      <span className="text-white">{abDashboard.current_test.variant_a}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Variant B</span>
                      <span className="text-white">{abDashboard.current_test.variant_b}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Traffic Split</span>
                      <span className="text-white">50% / 50%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">No active A/B test</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Variant Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {abDashboard.active_variants?.length > 0 ? (
                  <div className="space-y-3">
                    {abDashboard.active_variants.slice(0, 2).map((variant: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-700 rounded">
                        <div className="flex justify-between mb-2">
                          <span className="text-white font-medium">{variant.name}</span>
                          <Badge className="bg-blue-500">{variant.weight}%</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Accuracy:</span>
                            <span className="text-white ml-1">
                              {(variant.performance_metrics?.accuracy * 100 || 0).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Win Rate:</span>
                            <span className="text-white ml-1">
                              {(variant.performance_metrics?.win_rate * 100 || 0).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400">No variants available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Test Recommendations */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">A/B Test Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {abDashboard.recommendations?.length > 0 ? (
                <div className="space-y-2">
                  {abDashboard.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500 mt-1" />
                      <span className="text-gray-300">{rec}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400">No recommendations available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}