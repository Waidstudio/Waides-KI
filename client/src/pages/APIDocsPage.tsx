import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function APIDocsPage() {
  const { toast } = useToast();
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    toast({
      title: "Copied to clipboard",
      description: `${endpoint} endpoint copied`,
    });
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = {
    market: [
      {
        method: 'GET',
        path: '/api/eth/price',
        description: 'Get current ETH price with real-time data',
        response: '{ "price": 2414.50, "timestamp": 1640995200000, "isLive": true, "symbol": "ETHUSDT" }'
      },
      {
        method: 'GET',
        path: '/api/eth/market-summary',
        description: 'Get comprehensive market summary with 24h stats',
        response: '{ "currentPrice": 2414.50, "priceChangePercent24h": 2.35, "volume24h": 125000, "high24h": 2450.00, "low24h": 2380.00, "isLive": true }'
      },
      {
        method: 'GET',
        path: '/api/eth/trading-activity',
        description: 'Get real-time trading activity metrics',
        response: '{ "tradesLastMinute": 45, "tradesLast5Minutes": 234, "avgVolumeLastMinute": 12.5, "priceVolatility": 0.025 }'
      },
      {
        method: 'GET',
        path: '/api/eth/price-history',
        description: 'Get recent price history (query: ?count=50)',
        response: '[{ "price": 2414.50, "timestamp": 1640995200000, "volume": 1.25, "symbol": "ETHUSDT" }]'
      }
    ],
    signals: [
      {
        method: 'GET',
        path: '/api/signal-strength',
        description: 'Get current trading signal with AI analysis',
        response: '{ "trend": "UPTREND", "rsi": 65.5, "vwap_status": "ABOVE", "signal_strength": 85, "recommendation": "STRONG BUY SIGNAL", "should_trade": true, "current_price": 2414.50 }'
      },
      {
        method: 'GET',
        path: '/api/status',
        description: 'Get comprehensive system status',
        response: '{ "waides_ki": { "autonomous_mode": true, "win_rate": 75, "total_trades": 142 }, "data_feeds": { "websocket_tracker": { "connected": true } } }'
      },
      {
        method: 'GET',
        path: '/api/strategy',
        description: 'Get strategy analysis and performance metrics',
        response: '{ "top_strategies": [{ "strategy": "UPTREND_ABOVE_Strategy", "count": 25, "avgStrength": 82.5 }], "quality_metrics": { "signalAccuracy": 78 } }'
      },
      {
        method: 'GET',
        path: '/api/memory',
        description: 'Get learning system memory and analytics',
        response: '{ "learning_stats": { "totalStrategies": 15, "evolutionStage": "EXPERIENCED" }, "signal_analytics": { "totalSignals": 1250, "successRate": 75 } }'
      }
    ],
    trading: [
      {
        method: 'POST',
        path: '/api/trade/simulate',
        description: 'Simulate a trade with risk assessment',
        body: '{ "strategy_id": "UPTREND_ABOVE_HV", "action": "buy", "amount": 0.1 }',
        response: '{ "trade_id": "sim_1640995200_abc123", "action": "BUY", "entry_price": 2414.50, "risk_assessment": { "approved": true, "confidence_weight": 1.25 }, "status": "SIMULATED" }'
      }
    ],
    websocket: [
      {
        method: 'GET',
        path: '/api/websocket/status',
        description: 'Get WebSocket connection status',
        response: '{ "isConnected": true, "lastPrice": 2414.50, "lastUpdate": 1640995200000, "priceHistorySize": 1000 }'
      },
      {
        method: 'POST',
        path: '/api/websocket/reconnect',
        description: 'Force WebSocket reconnection',
        response: '{ "success": true, "message": "WebSocket reconnection initiated" }'
      }
    ]
  };

  const baseUrl = window.location.origin;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">API Documentation</h1>
          <p className="text-slate-400 mt-2">External REST API endpoints for third-party integration</p>
        </div>
        <Badge variant="outline" className="border-blue-500 text-blue-400">
          REST API v1.0
        </Badge>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">API Base URL</CardTitle>
          <CardDescription>All endpoints are relative to this base URL</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 bg-slate-700 p-3 rounded font-mono">
            <code className="text-blue-400">{baseUrl}</code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(baseUrl, 'base-url')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="market" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger value="market">Market Data</TabsTrigger>
          <TabsTrigger value="signals">AI Signals</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="websocket">WebSocket</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-4">
          <div className="grid gap-6">
            {endpoints.market.map((endpoint, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-100 flex items-center space-x-3">
                      <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-blue-400">{endpoint.path}</code>
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`${baseUrl}${endpoint.path}`, endpoint.path)}
                      >
                        {copiedEndpoint === endpoint.path ? 'Copied!' : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`${baseUrl}${endpoint.path}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Response Example:</h4>
                    <pre className="bg-slate-700 p-3 rounded text-xs text-slate-300 overflow-x-auto">
                      {JSON.stringify(JSON.parse(endpoint.response), null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <div className="grid gap-6">
            {endpoints.signals.map((endpoint, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-100 flex items-center space-x-3">
                      <Badge variant="default">GET</Badge>
                      <code className="text-blue-400">{endpoint.path}</code>
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`${baseUrl}${endpoint.path}`, endpoint.path)}
                      >
                        {copiedEndpoint === endpoint.path ? 'Copied!' : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`${baseUrl}${endpoint.path}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Response Example:</h4>
                    <pre className="bg-slate-700 p-3 rounded text-xs text-slate-300 overflow-x-auto">
                      {JSON.stringify(JSON.parse(endpoint.response), null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          <div className="grid gap-6">
            {endpoints.trading.map((endpoint, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-100 flex items-center space-x-3">
                      <Badge variant="destructive">POST</Badge>
                      <code className="text-blue-400">{endpoint.path}</code>
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(`${baseUrl}${endpoint.path}`, endpoint.path)}
                    >
                      {copiedEndpoint === endpoint.path ? 'Copied!' : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {endpoint.body && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Request Body:</h4>
                      <pre className="bg-slate-700 p-3 rounded text-xs text-slate-300 overflow-x-auto">
                        {JSON.stringify(JSON.parse(endpoint.body), null, 2)}
                      </pre>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Response Example:</h4>
                    <pre className="bg-slate-700 p-3 rounded text-xs text-slate-300 overflow-x-auto">
                      {JSON.stringify(JSON.parse(endpoint.response), null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="websocket" className="space-y-4">
          <div className="grid gap-6">
            {endpoints.websocket.map((endpoint, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-100 flex items-center space-x-3">
                      <Badge variant={endpoint.method === 'GET' ? 'default' : 'destructive'}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-blue-400">{endpoint.path}</code>
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`${baseUrl}${endpoint.path}`, endpoint.path)}
                      >
                        {copiedEndpoint === endpoint.path ? 'Copied!' : <Copy className="h-4 w-4" />}
                      </Button>
                      {endpoint.method === 'GET' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`${baseUrl}${endpoint.path}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Response Example:</h4>
                    <pre className="bg-slate-700 p-3 rounded text-xs text-slate-300 overflow-x-auto">
                      {JSON.stringify(JSON.parse(endpoint.response), null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100">Integration Examples</CardTitle>
          <CardDescription>Code examples for common integration scenarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-slate-300 mb-3">JavaScript/Node.js</h4>
            <pre className="bg-slate-700 p-4 rounded text-sm text-slate-300 overflow-x-auto">
{`// Get current ETH price
const response = await fetch('${baseUrl}/api/eth/price');
const data = await response.json();
console.log('ETH Price:', data.price);

// Get trading signal
const signalResponse = await fetch('${baseUrl}/api/signal-strength');
const signal = await signalResponse.json();
if (signal.should_trade) {
  console.log('Signal:', signal.recommendation);
}`}
            </pre>
          </div>

          <div>
            <h4 className="text-lg font-medium text-slate-300 mb-3">Python</h4>
            <pre className="bg-slate-700 p-4 rounded text-sm text-slate-300 overflow-x-auto">
{`import requests

# Get market summary
response = requests.get('${baseUrl}/api/eth/market-summary')
data = response.json()
print(f"ETH: ${data['currentPrice']} ({data['priceChangePercent24h']}%)")

# Simulate trade
trade_data = {
    "strategy_id": "UPTREND_ABOVE_HV",
    "action": "buy",
    "amount": 0.1
}
sim_response = requests.post('${baseUrl}/api/trade/simulate', json=trade_data)
trade = sim_response.json()
print(f"Simulated trade: {trade['action']} at ${trade['entry_price']}")`}
            </pre>
          </div>

          <div>
            <h4 className="text-lg font-medium text-slate-300 mb-3">cURL</h4>
            <pre className="bg-slate-700 p-4 rounded text-sm text-slate-300 overflow-x-auto">
{`# Get system status
curl "${baseUrl}/api/status"

# Get current ETH price
curl "${baseUrl}/api/eth/price"

# Simulate a trade
curl -X POST "${baseUrl}/api/trade/simulate" \\
  -H "Content-Type: application/json" \\
  -d '{"strategy_id":"UPTREND_ABOVE_HV","action":"buy","amount":0.1}'`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}