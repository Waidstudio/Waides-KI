import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Heart, 
  Brain, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap
} from 'lucide-react';
import type { BiometricData } from '@/types/componentTypes';

interface BiometricConfig {
  enabled: boolean;
  heartRateThreshold: number;
  stressThreshold: number;
  focusThreshold: number;
  autoTradingEnabled: boolean;
  riskTolerance: number;
}

export default function BiometricTradingInterface() {
  const [isConnected, setIsConnected] = useState(false);
  const [biometricConfig, setBiometricConfig] = useState<BiometricConfig>({
    enabled: false,
    heartRateThreshold: 100,
    stressThreshold: 70,
    focusThreshold: 60,
    autoTradingEnabled: false,
    riskTolerance: 50
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current biometric data
  const { data: biometricData, isLoading: isBiometricLoading } = useQuery({
    queryKey: ['/api/biometric/current'],
    refetchInterval: biometricConfig.enabled ? 2000 : false, // Real-time updates when enabled
    enabled: biometricConfig.enabled,
  });

  // Fetch biometric history
  const { data: biometricHistory = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['/api/biometric/history'],
    refetchInterval: 10000,
    enabled: biometricConfig.enabled,
  });

  // Fetch trading recommendations based on biometric data
  const { data: tradingRecommendations, isLoading: isRecommendationsLoading } = useQuery({
    queryKey: ['/api/biometric/trading-recommendations'],
    refetchInterval: 5000,
    enabled: biometricConfig.enabled && biometricConfig.autoTradingEnabled,
  });

  // Start biometric monitoring mutation
  const startMonitoringMutation = useMutation({
    mutationFn: async (config: BiometricConfig) => {
      const response = await apiRequest('POST', '/api/biometric/start-monitoring', config);
      return response.json();
    },
    onSuccess: () => {
      setIsConnected(true);
      toast({
        title: "Biometric Monitoring Started",
        description: "Successfully connected to biometric sensors",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/biometric'] });
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to biometric sensors",
        variant: "destructive",
      });
    }
  });

  // Stop monitoring mutation
  const stopMonitoringMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/biometric/stop-monitoring');
      return response.json();
    },
    onSuccess: () => {
      setIsConnected(false);
      setBiometricConfig(prev => ({ ...prev, enabled: false }));
      toast({
        title: "Monitoring Stopped",
        description: "Biometric monitoring has been disabled",
      });
    },
    onError: (error) => {
      toast({
        title: "Stop Failed",
        description: error instanceof Error ? error.message : "Failed to stop monitoring",
        variant: "destructive",
      });
    }
  });

  const handleConfigChange = (field: keyof BiometricConfig, value: boolean | number) => {
    setBiometricConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleStartMonitoring = () => {
    startMonitoringMutation.mutate(biometricConfig);
  };

  const handleStopMonitoring = () => {
    stopMonitoringMutation.mutate();
  };

  const getEmotionalStateColor = (state: string) => {
    switch (state) {
      case 'calm':
        return 'text-green-400';
      case 'focused':
        return 'text-blue-400';
      case 'excited':
        return 'text-yellow-400';
      case 'stressed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRecommendationColor = (action: string) => {
    switch (action) {
      case 'trade':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'wait':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'stop':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getRecommendationIcon = (action: string) => {
    switch (action) {
      case 'trade':
        return <TrendingUp className="w-4 h-4" />;
      case 'wait':
        return <Eye className="w-4 h-4" />;
      case 'stop':
        return <Shield className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Biometric Trading Interface</h2>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "outline"} className={isConnected ? "bg-green-600" : "text-gray-400"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ display: isConnected ? 'block' : 'none' }} />
        </div>
      </div>

      {/* Configuration Panel */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Biometric Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled" className="text-gray-300">Enable Monitoring</Label>
              <Switch
                id="enabled"
                checked={biometricConfig.enabled}
                onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="autoTrading" className="text-gray-300">Auto Trading</Label>
              <Switch
                id="autoTrading"
                checked={biometricConfig.autoTradingEnabled}
                onCheckedChange={(checked) => handleConfigChange('autoTradingEnabled', checked)}
                disabled={!biometricConfig.enabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-gray-300">Heart Rate Threshold</Label>
              <div className="text-sm text-gray-400 mb-2">{biometricConfig.heartRateThreshold} BPM</div>
              <input
                type="range"
                min="60"
                max="150"
                value={biometricConfig.heartRateThreshold}
                onChange={(e) => handleConfigChange('heartRateThreshold', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-gray-300">Stress Threshold</Label>
              <div className="text-sm text-gray-400 mb-2">{biometricConfig.stressThreshold}%</div>
              <input
                type="range"
                min="0"
                max="100"
                value={biometricConfig.stressThreshold}
                onChange={(e) => handleConfigChange('stressThreshold', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-gray-300">Focus Threshold</Label>
              <div className="text-sm text-gray-400 mb-2">{biometricConfig.focusThreshold}%</div>
              <input
                type="range"
                min="0"
                max="100"
                value={biometricConfig.focusThreshold}
                onChange={(e) => handleConfigChange('focusThreshold', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-gray-300">Risk Tolerance</Label>
              <div className="text-sm text-gray-400 mb-2">{biometricConfig.riskTolerance}%</div>
              <input
                type="range"
                min="0"
                max="100"
                value={biometricConfig.riskTolerance}
                onChange={(e) => handleConfigChange('riskTolerance', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleStartMonitoring}
              disabled={startMonitoringMutation.isPending || isConnected}
              className="bg-green-600 hover:bg-green-700"
            >
              {startMonitoringMutation.isPending ? 'Connecting...' : 'Start Monitoring'}
            </Button>
            <Button
              onClick={handleStopMonitoring}
              disabled={stopMonitoringMutation.isPending || !isConnected}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
            >
              {stopMonitoringMutation.isPending ? 'Stopping...' : 'Stop Monitoring'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Biometric Data */}
      {isConnected && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-time Biometric Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isBiometricLoading ? (
              <div className="text-gray-400">Loading biometric data...</div>
            ) : biometricData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <Heart className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{biometricData.heartRate}</div>
                  <div className="text-sm text-gray-300">BPM</div>
                  <Progress 
                    value={(biometricData.heartRate / 150) * 100} 
                    className="mt-2"
                  />
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{biometricData.stressLevel}%</div>
                  <div className="text-sm text-gray-300">Stress</div>
                  <Progress 
                    value={biometricData.stressLevel} 
                    className="mt-2"
                  />
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <Brain className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{biometricData.focusLevel}%</div>
                  <div className="text-sm text-gray-300">Focus</div>
                  <Progress 
                    value={biometricData.focusLevel} 
                    className="mt-2"
                  />
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className={`text-2xl font-bold ${getEmotionalStateColor(biometricData.emotionalState)}`}>
                    {biometricData.emotionalState.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-300">State</div>
                  <Badge className={`mt-2 ${getRecommendationColor(biometricData.recommendedAction)}`}>
                    {getRecommendationIcon(biometricData.recommendedAction)}
                    {biometricData.recommendedAction.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">No biometric data available</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trading Recommendations */}
      {isConnected && biometricConfig.autoTradingEnabled && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Biometric Trading Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isRecommendationsLoading ? (
              <div className="text-gray-400">Analyzing biometric data for trading signals...</div>
            ) : tradingRecommendations ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">Current Recommendation</h3>
                    <Badge className={getRecommendationColor(tradingRecommendations.action)}>
                      {getRecommendationIcon(tradingRecommendations.action)}
                      {tradingRecommendations.action.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm">{tradingRecommendations.reasoning}</p>
                  <div className="mt-3 text-xs text-gray-400">
                    Confidence: {tradingRecommendations.confidence}% | 
                    Risk Level: {tradingRecommendations.riskLevel} | 
                    Updated: {new Date(tradingRecommendations.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                
                {tradingRecommendations.suggestedActions && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-white">Suggested Actions:</h4>
                    {tradingRecommendations.suggestedActions.map((action: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-700/30 rounded-lg text-sm">
                        <div className="text-white font-medium">{action.type}</div>
                        <div className="text-gray-300">{action.description}</div>
                        {action.parameters && (
                          <div className="text-gray-400 text-xs mt-1">
                            Parameters: {JSON.stringify(action.parameters)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">No trading recommendations available</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Biometric History Chart */}
      {isConnected && biometricHistory.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Biometric History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isHistoryLoading ? (
                <div className="text-gray-400">Loading history...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {biometricHistory.slice(-10).map((data: BiometricData, index: number) => (
                    <div key={index} className="p-3 bg-gray-700/30 rounded-lg">
                      <div className="text-xs text-gray-400 mb-2">
                        {new Date(data.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Heart Rate:</span>
                          <span className="text-white">{data.heartRate} BPM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Stress:</span>
                          <span className="text-white">{data.stressLevel}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Focus:</span>
                          <span className="text-white">{data.focusLevel}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">State:</span>
                          <span className={getEmotionalStateColor(data.emotionalState)}>
                            {data.emotionalState}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}