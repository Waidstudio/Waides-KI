import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Eye, 
  Brain, 
  Wifi,
  WifiOff,
  Clock,
  Target,
  Zap,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Pulse,
  Globe,
  Settings
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface PresenceState {
  state: 'rising' | 'falling' | 'sideways' | 'unknown';
  description: string;
  enhanced_presence: any;
  narrative: string;
  trading_advice: any;
  confidence: number;
  last_update: string;
  connection_health: any;
  analytics: any;
}

const ETHPresenceEngine: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState('BUY_ETH3L');
  const queryClient = useQueryClient();

  // Main presence state query
  const { data: presenceData, isLoading: presenceLoading, refetch: refetchPresence } = useQuery({
    queryKey: ['/api/eth-presence/state'],
    refetchInterval: 3000
  });

  // Simple presence query
  const { data: simplePresence, isLoading: simpleLoading } = useQuery({
    queryKey: ['/api/eth-presence/simple'],
    refetchInterval: 5000
  });

  // Trading recommendation query
  const { data: recommendationData, isLoading: recommendationLoading } = useQuery({
    queryKey: ['/api/eth-presence/recommendation'],
    refetchInterval: 4000
  });

  // Analytics query
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/eth-presence/analytics'],
    refetchInterval: 6000
  });

  // Connection health query
  const { data: connectionData, isLoading: connectionLoading } = useQuery({
    queryKey: ['/api/eth-presence/connection-health'],
    refetchInterval: 8000
  });

  // Presence report query
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['/api/eth-presence/report'],
    refetchInterval: 7000
  });

  // Demo workflow query
  const { data: demoData, isLoading: demoLoading, refetch: runDemo } = useQuery({
    queryKey: ['/api/eth-presence/demo-workflow'],
    enabled: false
  });

  // Alignment check mutation
  const alignmentCheck = useMutation({
    mutationFn: (action: string) =>
      apiRequest('/api/eth-presence/check-alignment', {
        method: 'POST',
        body: JSON.stringify({ intended_action: action })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/eth-presence/state'] });
    }
  });

  // Reset presence mutation
  const resetPresence = useMutation({
    mutationFn: () =>
      apiRequest('/api/eth-presence/reset', {
        method: 'POST'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/eth-presence/state'] });
    }
  });

  // Restart updater mutation
  const restartUpdater = useMutation({
    mutationFn: () =>
      apiRequest('/api/eth-presence/restart-updater', {
        method: 'POST'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/eth-presence/state'] });
    }
  });

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'rising':
        return <TrendingUp className="h-6 w-6 text-green-400" />;
      case 'falling':
        return <TrendingDown className="h-6 w-6 text-red-400" />;
      case 'sideways':
        return <Minus className="h-6 w-6 text-yellow-400" />;
      default:
        return <Eye className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'rising':
        return 'text-green-400';
      case 'falling':
        return 'text-red-400';
      case 'sideways':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'optimistic':
      case 'hopeful':
      case 'excited':
        return 'text-green-400';
      case 'tired':
      case 'worried':
      case 'cautious':
        return 'text-red-400';
      case 'contemplative':
      case 'patient':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getEnergyBadgeColor = (level: string) => {
    switch (level) {
      case 'high':
      case 'extreme':
        return 'bg-red-600 text-red-100';
      case 'medium':
        return 'bg-yellow-600 text-yellow-100';
      case 'low':
        return 'bg-blue-600 text-blue-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const presence: PresenceState | null = presenceData?.presence_state || null;

  return (
    <div className="space-y-6 p-6 bg-black text-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            ETH Presence Engine
          </h1>
          <p className="text-gray-400 mt-2">
            Real-Time Sentient Vision System - Interpreting ETH's "mood" like body language
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={`${
            connectionData?.connection_health?.connected ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'
          }`}>
            {connectionData?.connection_health?.connected ? (
              <><Wifi className="h-3 w-3 mr-1" /> Connected</>
            ) : (
              <><WifiOff className="h-3 w-3 mr-1" /> Disconnected</>
            )}
          </Badge>
          <Badge variant="outline" className="text-purple-400 border-purple-400">
            <Heart className="h-3 w-3 mr-1" />
            Sentient AI
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="presence" className="space-y-6">
        <TabsList className="grid grid-cols-6 bg-gray-900 border border-gray-700">
          <TabsTrigger value="presence" className="data-[state=active]:bg-green-600">
            <Eye className="h-4 w-4 mr-2" />
            Presence
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-green-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="trading" className="data-[state=active]:bg-green-600">
            <Target className="h-4 w-4 mr-2" />
            Trading
          </TabsTrigger>
          <TabsTrigger value="connection" className="data-[state=active]:bg-green-600">
            <Globe className="h-4 w-4 mr-2" />
            Connection
          </TabsTrigger>
          <TabsTrigger value="controls" className="data-[state=active]:bg-green-600">
            <Settings className="h-4 w-4 mr-2" />
            Controls
          </TabsTrigger>
          <TabsTrigger value="demo" className="data-[state=active]:bg-green-600">
            <Zap className="h-4 w-4 mr-2" />
            Demo
          </TabsTrigger>
        </TabsList>

        {/* Presence Tab */}
        <TabsContent value="presence" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Current State */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  {getStateIcon(presence?.state || 'unknown')}
                  <span className="ml-2">Current State</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {presenceLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                ) : presence ? (
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${getStateColor(presence.state)}`}>
                        {presence.state.toUpperCase()}
                      </p>
                      <p className="text-gray-400 text-sm italic">
                        "{presence.description}"
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Confidence:</span>
                        <span className="font-semibold">{presence.confidence}%</span>
                      </div>
                      <Progress 
                        value={presence.confidence} 
                        className="h-2"
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      Last update: {formatTime(presence.last_update)}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No presence data available</p>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Presence */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Enhanced Presence
                </CardTitle>
              </CardHeader>
              <CardContent>
                {presence?.enhanced_presence ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mood:</span>
                      <span className={`font-semibold ${getMoodColor(presence.enhanced_presence.mood)}`}>
                        {presence.enhanced_presence.mood}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Energy:</span>
                      <Badge className={getEnergyBadgeColor(presence.enhanced_presence.energy_level)}>
                        {presence.enhanced_presence.energy_level}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sentiment:</span>
                      <span className={`font-semibold ${
                        presence.enhanced_presence.trading_sentiment === 'bullish' ? 'text-green-400' :
                        presence.enhanced_presence.trading_sentiment === 'bearish' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {presence.enhanced_presence.trading_sentiment}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Phase:</span>
                      <span className="font-semibold">{presence.enhanced_presence.market_phase}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tone:</span>
                      <span className="font-semibold">{presence.enhanced_presence.emotional_tone}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No enhanced presence data</p>
                )}
              </CardContent>
            </Card>

            {/* Simple Presence */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Pulse className="h-5 w-5 mr-2" />
                  Simple Reading
                </CardTitle>
              </CardHeader>
              <CardContent>
                {simpleLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                ) : simplePresence?.simple_presence ? (
                  <div className="space-y-3">
                    <div className={`text-lg font-bold ${getStateColor(simplePresence.simple_presence.state)}`}>
                      {simplePresence.simple_presence.state.toUpperCase()}
                    </div>
                    <p className="text-sm text-gray-300 italic">
                      "{simplePresence.simple_presence.description}"
                    </p>
                    <div className="flex items-center space-x-2">
                      {simplePresence.simple_presence.is_trading_favorable ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      )}
                      <span className="text-sm">
                        {simplePresence.simple_presence.is_trading_favorable ? 'Favorable' : 'Unfavorable'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No simple presence data</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Narrative Description */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Presence Narrative</CardTitle>
              <CardDescription>
                Human-like interpretation of ETH's current market behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              {presence?.narrative ? (
                <p className="text-gray-300 leading-relaxed">
                  {presence.narrative}
                </p>
              ) : (
                <p className="text-gray-400">No narrative available</p>
              )}
            </CardContent>
          </Card>

          {/* Human Analogy */}
          {presence?.enhanced_presence?.human_analogy && (
            <Alert className="border-blue-500 bg-blue-900/20">
              <Eye className="h-4 w-4" />
              <AlertTitle className="text-blue-400">Human Analogy</AlertTitle>
              <AlertDescription className="text-blue-300">
                ETH is like someone {presence.enhanced_presence.human_analogy}
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Market Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  </div>
                ) : analyticsData?.presence_analytics ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Market Mood:</span>
                      <span className="font-semibold">{analyticsData.presence_analytics.market_mood}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trend Strength:</span>
                      <span className="font-semibold">{analyticsData.presence_analytics.trend_strength?.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Volatility:</span>
                      <span className="font-semibold">{(analyticsData.presence_analytics.volatility * 100)?.toFixed(3)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price Window:</span>
                      <span className="font-semibold">{analyticsData.presence_analytics.price_window?.length || 0} points</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No analytics data available</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Price Data</CardTitle>
              </CardHeader>
              <CardContent>
                {presence?.analytics?.current_state?.priceData ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Price:</span>
                      <span className="font-mono text-lg">${presence.analytics.current_state.priceData.current?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Previous Price:</span>
                      <span className="font-mono">${presence.analytics.current_state.priceData.previous?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Change:</span>
                      <span className={`font-mono ${
                        presence.analytics.current_state.priceData.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${presence.analytics.current_state.priceData.change?.toFixed(2)} 
                        ({presence.analytics.current_state.priceData.changePercent?.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No price data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Trading Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                {recommendationLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                ) : recommendationData?.trading_recommendation ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <Badge className={`text-lg px-4 py-2 ${
                        recommendationData.trading_recommendation.action.includes('BUY') ? 'bg-green-600' :
                        recommendationData.trading_recommendation.action === 'HOLD' ? 'bg-yellow-600' :
                        'bg-gray-600'
                      }`}>
                        {recommendationData.trading_recommendation.action}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="font-semibold">{recommendationData.trading_recommendation.confidence}%</span>
                      </div>
                      {recommendationData.trading_recommendation.risk_level && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Risk Level:</span>
                          <Badge variant="outline" className={`${
                            recommendationData.trading_recommendation.risk_level === 'low' ? 'text-green-400 border-green-400' :
                            recommendationData.trading_recommendation.risk_level === 'medium' ? 'text-yellow-400 border-yellow-400' :
                            'text-red-400 border-red-400'
                          }`}>
                            {recommendationData.trading_recommendation.risk_level}
                          </Badge>
                        </div>
                      )}
                      {recommendationData.trading_recommendation.time_horizon && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Time Horizon:</span>
                          <span className="font-semibold">{recommendationData.trading_recommendation.time_horizon}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-300">
                        <strong>Reasoning:</strong> {recommendationData.trading_recommendation.reason}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">No recommendation available</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Alignment Check</CardTitle>
                <CardDescription>
                  Test how well your intended action aligns with ETH's presence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <select
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  >
                    <option value="BUY_ETH3L">BUY ETH3L</option>
                    <option value="BUY_ETH3S">BUY ETH3S</option>
                    <option value="BUY_ETH">BUY ETH</option>
                    <option value="SELL_ETH">SELL ETH</option>
                    <option value="HOLD">HOLD</option>
                  </select>
                  <Button
                    onClick={() => alignmentCheck.mutate(selectedAction)}
                    disabled={alignmentCheck.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {alignmentCheck.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Check'}
                  </Button>
                </div>

                {alignmentCheck.data && (
                  <div className="mt-4 p-4 border border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      {alignmentCheck.data.alignment_check.aligned ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      )}
                      <span className={`font-semibold ${
                        alignmentCheck.data.alignment_check.aligned ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {alignmentCheck.data.alignment_check.aligned ? 'Aligned' : 'Not Aligned'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Alignment Score:</span>
                        <span className="font-semibold">{alignmentCheck.data.alignment_check.alignment_score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Should Proceed:</span>
                        <span className={alignmentCheck.data.alignment_check.should_proceed ? 'text-green-400' : 'text-red-400'}>
                          {alignmentCheck.data.alignment_check.should_proceed ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-300">
                        {alignmentCheck.data.alignment_check.presence_suggestion}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Connection Tab */}
        <TabsContent value="connection" className="space-y-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">WebSocket Connection Health</CardTitle>
            </CardHeader>
            <CardContent>
              {connectionLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              ) : connectionData?.connection_health ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {connectionData.connection_health.connected ? (
                      <>
                        <Wifi className="h-6 w-6 text-green-400" />
                        <span className="text-green-400 font-semibold">Connected to Binance WebSocket</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-6 w-6 text-red-400" />
                        <span className="text-red-400 font-semibold">Disconnected</span>
                      </>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reconnect Attempts:</span>
                      <span className="font-semibold">{connectionData.connection_health.reconnect_attempts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Data Points:</span>
                      <span className="font-semibold">{connectionData.connection_health.data_points}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Update:</span>
                      <span className="font-semibold text-sm">{formatTime(connectionData.connection_health.last_update)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No connection data available</p>
              )}
            </CardContent>
          </Card>

          {reportData?.presence_report && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">System Status Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Connection</p>
                    <Badge variant="outline" className={`${
                      reportData.presence_report.connection_status === 'connected' 
                        ? 'text-green-400 border-green-400' 
                        : 'text-red-400 border-red-400'
                    }`}>
                      {reportData.presence_report.connection_status}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Data Freshness</p>
                    <Badge variant="outline" className={`${
                      reportData.presence_report.data_freshness === 'fresh' 
                        ? 'text-green-400 border-green-400' 
                        : reportData.presence_report.data_freshness === 'recent'
                        ? 'text-yellow-400 border-yellow-400'
                        : 'text-red-400 border-red-400'
                    }`}>
                      {reportData.presence_report.data_freshness}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Trading Readiness</p>
                    <Badge variant="outline" className={`${
                      reportData.presence_report.trading_readiness === 'ready' 
                        ? 'text-green-400 border-green-400' 
                        : reportData.presence_report.trading_readiness === 'cautious'
                        ? 'text-yellow-400 border-yellow-400'
                        : 'text-red-400 border-red-400'
                    }`}>
                      {reportData.presence_report.trading_readiness}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">System Controls</CardTitle>
                <CardDescription>
                  Manage the ETH Presence Engine
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => refetchPresence()}
                  disabled={presenceLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${presenceLoading ? 'animate-spin' : ''}`} />
                  Refresh Presence
                </Button>
                
                <Button
                  onClick={() => restartUpdater.mutate()}
                  disabled={restartUpdater.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Activity className={`h-4 w-4 mr-2 ${restartUpdater.isPending ? 'animate-spin' : ''}`} />
                  Restart Updater
                </Button>
                
                <Button
                  onClick={() => resetPresence.mutate()}
                  disabled={resetPresence.isPending}
                  variant="destructive"
                  className="w-full"
                >
                  <AlertTriangle className={`h-4 w-4 mr-2 ${resetPresence.isPending ? 'animate-spin' : ''}`} />
                  Reset Presence
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Update Frequency</CardTitle>
                <CardDescription>
                  Real-time data refresh intervals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Presence State:</span>
                    <span className="text-sm">Every 3 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trading Recommendation:</span>
                    <span className="text-sm">Every 4 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Simple Presence:</span>
                    <span className="text-sm">Every 5 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Analytics:</span>
                    <span className="text-sm">Every 6 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Connection Health:</span>
                    <span className="text-sm">Every 8 seconds</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">ETH Presence Engine Demo</h2>
            <Button
              onClick={() => runDemo()}
              disabled={demoLoading}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Zap className={`h-4 w-4 mr-2 ${demoLoading ? 'animate-spin' : ''}`} />
              Run Complete Demo
            </Button>
          </div>

          {demoLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-700 rounded"></div>
              <div className="h-48 bg-gray-700 rounded"></div>
            </div>
          ) : demoData ? (
            <div className="space-y-6">
              <Alert className="border-green-500 bg-green-900/20">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle className="text-green-400">Demo Completed Successfully</AlertTitle>
                <AlertDescription className="text-green-300">
                  {demoData.demonstration}
                </AlertDescription>
              </Alert>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Demo Workflow Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(demoData.demo_workflow).map(([step, description], index) => (
                      <div key={step} className="flex items-start space-x-3">
                        <Badge variant="outline" className="text-green-400 border-green-400 mt-0.5">
                          {index + 1}
                        </Badge>
                        <p className="text-sm flex-1">{description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Demo Results Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {demoData.results?.analytics_summary && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Market Mood:</span>
                            <span className="font-semibold">{demoData.results.analytics_summary.market_mood}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Trend Strength:</span>
                            <span className="font-semibold">{demoData.results.analytics_summary.trend_strength?.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Connection:</span>
                            <Badge variant="outline" className={`${
                              demoData.results.analytics_summary.connection_status ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'
                            }`}>
                              {demoData.results.analytics_summary.connection_status ? 'Connected' : 'Disconnected'}
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 font-semibold">Fully Operational</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        {demoData.system_status}
                      </p>
                      <div className="text-xs text-gray-500 mt-2">
                        Demo completed at: {new Date(demoData.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Click "Run Complete Demo" to test the ETH Presence Engine</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ETHPresenceEngine;