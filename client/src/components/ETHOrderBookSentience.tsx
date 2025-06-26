import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Activity, Users, TrendingUp, TrendingDown, Minus, Wifi, WifiOff } from 'lucide-react';

export default function ETHOrderBookSentience() {
  const [testAction, setTestAction] = useState('BUY_ETH');
  const [validationResult, setValidationResult] = useState(null);

  // Fetch order book presence
  const { data: presence, isLoading: presenceLoading } = useQuery({
    queryKey: ['/api/order-book/presence'],
    refetchInterval: 1000 // Update every second for real-time
  });

  // Fetch comprehensive analysis
  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['/api/order-book/analysis'],
    refetchInterval: 2000
  });

  // Fetch sentiment
  const { data: sentiment, isLoading: sentimentLoading } = useQuery({
    queryKey: ['/api/order-book/sentiment'],
    refetchInterval: 1500
  });

  // Fetch flow insights
  const { data: flowInsights, isLoading: flowLoading } = useQuery({
    queryKey: ['/api/order-book/flow-insights'],
    refetchInterval: 2000
  });

  // Fetch pressure analysis
  const { data: pressureData, isLoading: pressureLoading } = useQuery({
    queryKey: ['/api/order-book/pressure'],
    refetchInterval: 1000
  });

  // Fetch system status
  const { data: systemStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/order-book/system-status'],
    refetchInterval: 5000
  });

  // Fetch peer status
  const { data: peerStatus, isLoading: peerLoading } = useQuery({
    queryKey: ['/api/order-book/peer-status'],
    refetchInterval: 10000
  });

  const validateTrade = async () => {
    try {
      const response = await fetch('/api/order-book/validate-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: testAction })
      });
      const result = await response.json();
      setValidationResult(result);
    } catch (error) {
      console.error('Failed to validate trade:', error);
    }
  };

  const getPressureIcon = (pressure: string) => {
    switch (pressure) {
      case 'buy_pressure': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'sell_pressure': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPressureColor = (pressure: string) => {
    switch (pressure) {
      case 'buy_pressure': return 'text-green-500 bg-green-50 border-green-200';
      case 'sell_pressure': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ETH Order Book Sentience
        </h1>
        <p className="text-gray-600">Deep order book awareness - From seeing to feeling market heartbeat</p>
      </div>

      <Tabs defaultValue="presence" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="presence">Live Presence</TabsTrigger>
          <TabsTrigger value="analysis">Deep Analysis</TabsTrigger>
          <TabsTrigger value="sentiment">Crowd Sentiment</TabsTrigger>
          <TabsTrigger value="flow">Order Flow</TabsTrigger>
          <TabsTrigger value="validation">Trade Validation</TabsTrigger>
          <TabsTrigger value="network">Peer Network</TabsTrigger>
        </TabsList>

        <TabsContent value="presence" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Current Presence
                </CardTitle>
              </CardHeader>
              <CardContent>
                {presenceLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                ) : presence?.order_book_presence ? (
                  <div className="space-y-3">
                    <div className={`flex items-center gap-2 p-2 rounded border ${getPressureColor(presence.order_book_presence.pressure)}`}>
                      {getPressureIcon(presence.order_book_presence.pressure)}
                      <span className="font-medium">{presence.order_book_presence.pressure.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <p className="text-sm text-gray-600">{presence.order_book_presence.description}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Confidence</span>
                        <span className={getConfidenceColor(presence.order_book_presence.confidence)}>
                          {presence.order_book_presence.confidence}%
                        </span>
                      </div>
                      <Progress value={presence.order_book_presence.confidence} className="h-2" />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No presence data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Crowd Behavior</CardTitle>
              </CardHeader>
              <CardContent>
                {presenceLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {presence?.order_book_presence?.crowd_behavior || 'Analyzing crowd behavior...'}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      {presence?.order_book_presence?.trading_implication || ''}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {presence?.system_health?.connection_quality === 'excellent' ? 
                    <Wifi className="h-5 w-5 text-green-500" /> : 
                    <WifiOff className="h-5 w-5 text-red-500" />
                  }
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                {presenceLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Data Quality</span>
                      <Badge variant={presence?.system_health?.data_freshness === 'fresh' ? 'default' : 'secondary'}>
                        {presence?.system_health?.data_freshness || 'unknown'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Connection</span>
                      <Badge variant={presence?.system_health?.connection_quality === 'excellent' ? 'default' : 'destructive'}>
                        {presence?.system_health?.connection_quality || 'unknown'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Auto Update</span>
                      <Badge variant={presence?.system_health?.auto_update_running ? 'default' : 'destructive'}>
                        {presence?.system_health?.auto_update_running ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Live Narrative</CardTitle>
              <CardDescription>Real-time market sentiment interpretation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm leading-relaxed">
                  {presence?.order_book_presence?.narrative || 'Waiting for order book data...'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Pressure Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {pressureLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                ) : pressureData?.pressure_analysis ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {pressureData.pressure_analysis.strength}%
                        </div>
                        <div className="text-sm text-gray-600">Pressure Strength</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-medium capitalize">
                          {pressureData.pressure_analysis.direction}
                        </div>
                        <div className="text-sm text-gray-600">Direction</div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Badge variant={pressureData.pressure_analysis.quality === 'excellent' ? 'default' : 'secondary'}>
                        {pressureData.pressure_analysis.quality} Quality
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No pressure data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Status</CardTitle>
              </CardHeader>
              <CardContent>
                {statusLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : systemStatus?.system_status ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Service Init:</div>
                      <Badge variant={systemStatus.system_status.service_initialized ? 'default' : 'destructive'}>
                        {systemStatus.system_status.service_initialized ? 'Ready' : 'Not Ready'}
                      </Badge>
                      
                      <div>Sentry Status:</div>
                      <Badge variant={systemStatus.system_status.components_status?.order_book_sentry?.depth_connected ? 'default' : 'destructive'}>
                        {systemStatus.system_status.components_status?.order_book_sentry?.depth_connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                      
                      <div>Data Quality:</div>
                      <Badge variant={systemStatus.system_status.performance_metrics?.data_quality === 'good' ? 'default' : 'secondary'}>
                        {systemStatus.system_status.performance_metrics?.data_quality || 'Unknown'}
                      </Badge>
                    </div>
                    <Separator />
                    <p className="text-xs text-green-600">
                      {systemStatus.order_book_sentience}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No system status available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {analysis?.comprehensive_analysis && (
            <Card>
              <CardHeader>
                <CardTitle>Comprehensive Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Trading Decision Support</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Risk Assessment:</span>
                        <span className="font-medium">{analysis.comprehensive_analysis.trading_decision_support?.risk_assessment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Crowd Sentiment:</span>
                        <span className="font-medium capitalize">{analysis.comprehensive_analysis.trading_decision_support?.crowd_sentiment}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Health Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Integration Ready:</span>
                        <Badge variant={analysis.comprehensive_analysis.integration_ready ? 'default' : 'destructive'}>
                          {analysis.comprehensive_analysis.integration_ready ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Connection:</span>
                        <span className="font-medium">{analysis.comprehensive_analysis.health_status?.connection_quality}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Market Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sentimentLoading ? (
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : sentiment?.sentiment ? (
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        sentiment.sentiment.sentiment === 'bullish' ? 'text-green-600' :
                        sentiment.sentiment.sentiment === 'bearish' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {sentiment.sentiment.sentiment.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600">Current Sentiment</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Strength</span>
                        <span className="font-medium">{sentiment.sentiment.strength}%</span>
                      </div>
                      <Progress value={sentiment.sentiment.strength} className="h-2" />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No sentiment data</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Confidence Level</CardTitle>
              </CardHeader>
              <CardContent>
                {sentimentLoading ? (
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getConfidenceColor(sentiment?.sentiment?.confidence || 0)}`}>
                        {sentiment?.sentiment?.confidence || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Signal Confidence</div>
                    </div>
                    <Progress value={sentiment?.sentiment?.confidence || 0} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Trading Signal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-center">
                    <Badge variant={sentiment?.crowd_analysis?.trading_implication?.includes('High confidence') ? 'default' : 'secondary'}>
                      {sentiment?.crowd_analysis?.trading_implication || 'Analyzing...'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 text-center">
                    {sentiment?.sentiment?.description || 'Waiting for signal data'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sentiment Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm leading-relaxed">
                  {sentiment?.sentiment?.description || 'Analyzing market sentiment...'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flow" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Trade Flow Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {flowLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                ) : flowInsights?.flow_insights ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-lg font-medium capitalize">
                        {flowInsights.flow_insights.recent_trades_bias?.replace('_', ' ') || 'Neutral'}
                      </div>
                      <div className="text-sm text-gray-600">Recent Trade Bias</div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Liquidity Distribution</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Bid/Ask Ratio:</div>
                        <div className="font-medium">
                          {flowInsights.flow_insights.liquidity_distribution?.bid_ask_ratio?.toFixed(3) || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No flow data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trading Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                {flowLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {flowInsights?.flow_insights?.trading_opportunities?.length > 0 ? (
                      flowInsights.flow_insights.trading_opportunities.map((opportunity: string, index: number) => (
                        <div key={index} className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                          {opportunity}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
                        No clear opportunities detected
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Crowd Behavior Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm leading-relaxed">
                  {flowInsights?.flow_insights?.crowd_behavior_analysis || 'Analyzing crowd behavior patterns...'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trade Validation Testing</CardTitle>
              <CardDescription>Test how order book sentiment affects trading decisions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="test-action">Trading Action</Label>
                  <Input
                    id="test-action"
                    value={testAction}
                    onChange={(e) => setTestAction(e.target.value)}
                    placeholder="e.g., BUY_ETH, SELL_ETH, LONG_ETH"
                  />
                </div>
                <Button onClick={validateTrade}>Validate Trade</Button>
              </div>

              {validationResult && (
                <div className="space-y-3">
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Validation Result</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Should Proceed:</span>
                          <Badge variant={validationResult.order_book_check?.should_proceed ? 'default' : 'destructive'}>
                            {validationResult.order_book_check?.should_proceed ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Level:</span>
                          <Badge variant={validationResult.validation?.risk_level === 'low' ? 'default' : 'destructive'}>
                            {validationResult.validation?.risk_level}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Position Multiplier:</span>
                          <span className="font-medium">
                            {validationResult.validation?.suggested_amount_multiplier?.toFixed(2)}x
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Order Book Check</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span className={getConfidenceColor(validationResult.order_book_check?.confidence || 0)}>
                            {validationResult.order_book_check?.confidence}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sentiment:</span>
                          <span className="font-medium capitalize">
                            {validationResult.order_book_check?.crowd_sentiment}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                    <h4 className="font-medium text-sm mb-1">Recommendation</h4>
                    <p className="text-sm">{validationResult.recommendation}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <h4 className="font-medium text-sm mb-1">Reasoning</h4>
                    <p className="text-sm">{validationResult.order_book_check?.reasoning}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Peer Network Status</CardTitle>
              </CardHeader>
              <CardContent>
                {peerLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : peerStatus?.peer_network ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {peerStatus.peer_network.active_peers}
                        </div>
                        <div className="text-sm text-gray-600">Active Peers</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {peerStatus.peer_network.total_peers}
                        </div>
                        <div className="text-sm text-gray-600">Total Peers</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <Badge variant={peerStatus.peer_network.sync_health === 'excellent' ? 'default' : 'secondary'}>
                        {peerStatus.peer_network.sync_health} Sync Health
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No peer data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sync Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {peerLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : peerStatus?.sync_statistics ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Broadcasting:</div>
                      <Badge variant={peerStatus.sync_statistics.broadcasting_active ? 'default' : 'destructive'}>
                        {peerStatus.sync_statistics.broadcasting_active ? 'Active' : 'Inactive'}
                      </Badge>
                      
                      <div>Success Rate:</div>
                      <span className="font-medium">
                        {peerStatus.sync_statistics.sync_performance?.success_rate || 0}%
                      </span>
                      
                      <div>Total Broadcasts:</div>
                      <span className="font-medium">
                        {peerStatus.sync_statistics.total_broadcasts || 0}
                      </span>
                      
                      <div>Successful Syncs:</div>
                      <span className="font-medium text-green-600">
                        {peerStatus.sync_statistics.successful_syncs || 0}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No sync statistics available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {peerStatus?.peer_network?.peer_details && (
            <Card>
              <CardHeader>
                <CardTitle>Peer Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {peerStatus.peer_network.peer_details.map((peer: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div className="text-sm font-mono truncate flex-1">
                        {peer.url.replace('https://', '').replace('/api/order_presence', '')}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={peer.status === 'active' ? 'default' : 'destructive'}>
                          {peer.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {peer.sync_count} syncs
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}