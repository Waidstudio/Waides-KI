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
      },
      {
        method: 'POST',
        path: '/api/trade/execute',
        description: 'Execute a real trade with AI validation',
        body: '{ "pair": "ETH/USDT", "side": "buy", "amount": 0.1, "type": "market" }',
        response: '{ "trade_id": "live_1640995200_xyz789", "status": "EXECUTED", "fill_price": 2415.25, "fee": 0.001, "timestamp": 1640995200000 }'
      },
      {
        method: 'GET',
        path: '/api/trade/history',
        description: 'Get trading history with pagination',
        response: '{ "trades": [{ "id": "trade_123", "pair": "ETH/USDT", "side": "buy", "amount": 0.1, "price": 2414.50, "timestamp": 1640995200000 }], "total": 50, "page": 1 }'
      },
      {
        method: 'GET',
        path: '/api/trade/positions',
        description: 'Get current open positions',
        response: '{ "positions": [{ "pair": "ETH/USDT", "side": "long", "size": 0.5, "entry_price": 2400.00, "unrealized_pnl": 7.25, "margin": 240.00 }] }'
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
    ],
    analytics: [
      {
        method: 'GET',
        path: '/api/analytics/performance',
        description: 'Get comprehensive trading performance metrics',
        response: '{ "total_pnl": 1250.75, "win_rate": 78.5, "sharpe_ratio": 1.85, "max_drawdown": -125.50, "total_trades": 142, "avg_trade_duration": "4.2h" }'
      },
      {
        method: 'GET',
        path: '/api/analytics/portfolio',
        description: 'Get portfolio allocation and risk metrics',
        response: '{ "total_value": 10000.00, "allocations": { "ETH": 0.65, "BTC": 0.25, "USDT": 0.10 }, "risk_score": 6.8, "volatility": 0.24 }'
      },
      {
        method: 'GET',
        path: '/api/analytics/ai-insights',
        description: 'Get AI-generated market insights and predictions',
        response: '{ "market_sentiment": "BULLISH", "confidence": 85, "key_levels": { "support": 2380.00, "resistance": 2450.00 }, "prediction_horizon": "24h" }'
      },
      {
        method: 'GET',
        path: '/api/analytics/risk-assessment',
        description: 'Get real-time risk assessment for portfolio',
        response: '{ "overall_risk": "MODERATE", "risk_score": 6.2, "var_95": 250.00, "margin_usage": 0.45, "recommended_actions": ["reduce_leverage", "diversify"] }'
      }
    ],
    admin: [
      {
        method: 'GET',
        path: '/api/admin/system-status',
        description: 'Get comprehensive system health status',
        response: '{ "uptime": "99.98%", "active_users": 1247, "system_load": 0.65, "memory_usage": 0.72, "trading_engine_status": "ACTIVE" }'
      },
      {
        method: 'GET',
        path: '/api/admin/user-metrics',
        description: 'Get user activity and engagement metrics',
        response: '{ "total_users": 5247, "active_today": 892, "new_registrations": 47, "avg_session_duration": "28m", "top_trading_pairs": ["ETH/USDT", "BTC/USDT"] }'
      },
      {
        method: 'POST',
        path: '/api/admin/maintenance',
        description: 'Control system maintenance modes',
        body: '{ "action": "start", "duration": 30, "message": "Scheduled maintenance" }',
        response: '{ "success": true, "maintenance_id": "maint_123", "estimated_duration": "30m", "start_time": 1640995200000 }'
      },
      {
        method: 'GET',
        path: '/api/admin/audit-logs',
        description: 'Get system audit logs with filtering',
        response: '{ "logs": [{ "timestamp": 1640995200000, "user_id": "user_123", "action": "trade_executed", "details": { "pair": "ETH/USDT", "amount": 0.1 } }], "total": 15247 }'
      }
    ]
  };

  const baseUrl = window.location.origin;

  const renderEndpoints = (endpointList: any[], color: string) => (
    <div className="grid gap-6">
      {endpointList.map((endpoint, index) => (
        <Card key={index} className="bg-slate-800/80 border-slate-700 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle className="text-white flex items-center flex-wrap gap-3">
                <Badge 
                  className={`px-3 py-1 text-xs font-bold text-white ${
                    endpoint.method === 'GET' ? 'bg-green-600' : 
                    endpoint.method === 'POST' ? `bg-${color}-600` : 'bg-blue-600'
                  }`}
                >
                  {endpoint.method}
                </Badge>
                <code className={`text-${color}-400 font-mono text-sm lg:text-base break-all`}>{endpoint.path}</code>
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(`${baseUrl}${endpoint.path}`, endpoint.path)}
                  className="hover:bg-slate-700"
                >
                  {copiedEndpoint === endpoint.path ? (
                    <span className="text-green-400 text-xs">Copied!</span>
                  ) : (
                    <Copy className="h-4 w-4 text-slate-300" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`${baseUrl}${endpoint.path}`, '_blank')}
                  className="hover:bg-slate-700"
                >
                  <ExternalLink className="h-4 w-4 text-slate-300" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-slate-300 text-base mt-2 leading-relaxed">
              {endpoint.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {endpoint.body && (
              <div>
                <h4 className={`text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2`}>
                  <span className={`w-2 h-2 bg-${color}-500 rounded-full`}></span>
                  Request Body:
                </h4>
                <div className="bg-slate-900/50 border border-slate-600 rounded-lg overflow-hidden">
                  <pre className="p-4 text-sm text-slate-300 overflow-x-auto leading-relaxed">
                    {JSON.stringify(JSON.parse(endpoint.body), null, 2)}
                  </pre>
                </div>
              </div>
            )}
            <div>
              <h4 className={`text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2`}>
                <span className={`w-2 h-2 bg-${color}-500 rounded-full`}></span>
                Response Example:
              </h4>
              <div className="bg-slate-900/50 border border-slate-600 rounded-lg overflow-hidden">
                <pre className="p-4 text-sm text-slate-300 overflow-x-auto leading-relaxed">
                  {JSON.stringify(JSON.parse(endpoint.response), null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
              API Documentation
            </span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-4xl mx-auto px-4">
            Comprehensive REST API endpoints for seamless third-party integration with Waides KI trading platform
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <Badge variant="outline" className="border-blue-500 text-blue-400 px-4 py-2 text-sm font-medium">
              REST API v1.0
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-400 px-3 py-1 text-xs">
              Live Production
            </Badge>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-xl shadow-2xl">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="text-white text-xl flex items-center justify-center gap-2">
                <ExternalLink className="h-5 w-5 text-blue-400" />
                API Base URL
              </CardTitle>
              <CardDescription className="text-slate-300">
                All endpoints are relative to this base URL. Copy to get started with integration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-700/50 p-4 rounded-lg border border-slate-600 gap-3">
                <code className="text-blue-400 font-mono text-sm sm:text-lg flex-1 text-center sm:text-left break-all">{baseUrl}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(baseUrl, 'base-url')}
                  className="hover:bg-slate-600 shrink-0"
                >
                  {copiedEndpoint === 'base-url' ? (
                    <span className="text-green-400 text-sm">Copied!</span>
                  ) : (
                    <Copy className="h-4 w-4 text-slate-300" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="market" className="space-y-6 sm:space-y-8">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-slate-800/80 backdrop-blur-xl p-2 h-auto gap-1 sm:gap-2">
              <TabsTrigger value="market" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">
                Market Data
              </TabsTrigger>
              <TabsTrigger value="signals" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">
                AI Signals
              </TabsTrigger>
              <TabsTrigger value="trading" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">
                Trading
              </TabsTrigger>
              <TabsTrigger value="websocket" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">
                WebSocket
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="admin" className="data-[state=active]:bg-red-600 data-[state=active]:text-white px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">
                Admin
              </TabsTrigger>
            </TabsList>

            <div className="max-h-[75vh] overflow-y-auto px-1 space-y-6 sm:space-y-8">
            <TabsContent value="market" className="space-y-6 mt-0">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Market Data Endpoints</h2>
                <p className="text-slate-400">Real-time cryptocurrency market data and price feeds</p>
              </div>
              {renderEndpoints(endpoints.market, 'blue')}
            </TabsContent>

            <TabsContent value="signals" className="space-y-6 mt-0">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">AI Trading Signals</h2>
                <p className="text-slate-400">Advanced AI-powered trading signals and market analysis</p>
              </div>
              {renderEndpoints(endpoints.signals, 'purple')}
            </TabsContent>

            <TabsContent value="trading" className="space-y-6 mt-0">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Trading Operations</h2>
                <p className="text-slate-400">Execute trades, manage positions, and access trading history</p>
              </div>
              {renderEndpoints(endpoints.trading, 'emerald')}
            </TabsContent>

            <TabsContent value="websocket" className="space-y-6 mt-0">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">WebSocket APIs</h2>
                <p className="text-slate-400">Real-time WebSocket connection management and monitoring</p>
              </div>
              {renderEndpoints(endpoints.websocket, 'orange')}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 mt-0">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Analytics & Insights</h2>
                <p className="text-slate-400">Advanced analytics, performance metrics, and AI-powered insights</p>
              </div>
              {renderEndpoints(endpoints.analytics, 'pink')}
            </TabsContent>

              <TabsContent value="admin" className="space-y-6 mt-0">
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Admin Operations</h2>
                  <p className="text-slate-400 text-sm sm:text-base">System administration, monitoring, and maintenance endpoints</p>
                </div>
                {renderEndpoints(endpoints.admin, 'red')}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-xl sm:text-2xl">Integration Examples</CardTitle>
              <CardDescription className="text-slate-300 text-sm sm:text-base">Code examples for common integration scenarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-base sm:text-lg font-medium text-slate-300 mb-3">JavaScript/Node.js</h4>
                <div className="bg-slate-900/50 border border-slate-600 rounded-lg overflow-hidden">
                  <pre className="p-3 sm:p-4 text-xs sm:text-sm text-slate-300 overflow-x-auto leading-relaxed">
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
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-medium text-slate-300 mb-3">Python</h4>
                <div className="bg-slate-900/50 border border-slate-600 rounded-lg overflow-hidden">
                  <pre className="p-3 sm:p-4 text-xs sm:text-sm text-slate-300 overflow-x-auto leading-relaxed">
{`import requests

# Get market summary
response = requests.get('${baseUrl}/api/eth/market-summary')
data = response.json()
print(f"ETH: {data['currentPrice']} ({data['priceChangePercent24h']}%)")

# Simulate trade
trade_data = {
    "strategy_id": "UPTREND_ABOVE_HV",
    "action": "buy",
    "amount": 0.1
}
sim_response = requests.post('${baseUrl}/api/trade/simulate', json=trade_data)
trade = sim_response.json()
print(f"Simulated trade: {trade['action']} at {trade['entry_price']}")`}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-medium text-slate-300 mb-3">cURL</h4>
                <div className="bg-slate-900/50 border border-slate-600 rounded-lg overflow-hidden">
                  <pre className="p-3 sm:p-4 text-xs sm:text-sm text-slate-300 overflow-x-auto leading-relaxed">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}