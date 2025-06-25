import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Copy, Eye, EyeOff, Key, Shield, Zap, Users } from 'lucide-react';

export default function GatewayPage() {
  const [showAPIKey, setShowAPIKey] = useState<string | null>(null);
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    permissions: [] as string[],
    rateLimit: 50
  });
  const [testRequest, setTestRequest] = useState({
    apikey: '',
    trend: 'UPTREND',
    rsi: 55,
    vwap_status: 'ABOVE',
    price: 2400
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apiKeys } = useQuery({
    queryKey: ['/api/waides_ki/admin/keys'],
    refetchInterval: 30000,
  });

  const createKeyMutation = useMutation({
    mutationFn: async (keyData: any) => {
      const response = await fetch('/api/waides_ki/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keyData),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.api_key) {
        toast({
          title: "API Key Created",
          description: "New API key generated successfully",
        });
        setNewKeyData({ name: '', permissions: [], rateLimit: 50 });
        queryClient.invalidateQueries();
      }
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (apikey: string) => {
      const response = await fetch(`/api/waides_ki/admin/keys/${apikey}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "API Key Revoked",
        description: "API key has been deactivated",
      });
      queryClient.invalidateQueries();
    },
  });

  const testAPICall = async () => {
    try {
      const response = await fetch('/api/waides_ki/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testRequest),
      });
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "API Test Successful",
          description: `Strategy: ${data.strategy_id}`,
        });
      } else {
        toast({
          title: "API Test Failed",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "API Test Error",
        description: "Failed to connect to API",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${type} copied successfully`,
    });
  };

  const permissionOptions = ['strategy', 'trade', 'status', 'webhook'];

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setNewKeyData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }));
    } else {
      setNewKeyData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permission)
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Strategy Gateway</h1>
          <p className="text-slate-400 mt-2">Secure API access for external trading platforms</p>
        </div>
        <Badge variant="outline" className="border-green-500 text-green-400">
          <Shield className="w-4 h-4 mr-2" />
          Protected API
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="test">API Test</TabsTrigger>
          <TabsTrigger value="docs">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-100 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-400" />
                  Strategy API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-3">
                  Get AI-powered trading strategies without exposing internal logic
                </p>
                <Badge variant="secondary" className="mb-2">POST /api/waides_ki/strategy</Badge>
                <div className="text-xs text-slate-500">
                  Returns strategy recommendations based on market conditions
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-100 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-400" />
                  Trade API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-3">
                  Complete trade decisions with risk assessment and position sizing
                </p>
                <Badge variant="secondary" className="mb-2">POST /api/waides_ki/trade</Badge>
                <div className="text-xs text-slate-500">
                  Includes stop loss, take profit, and confidence scoring
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-100 flex items-center">
                  <Key className="w-5 h-5 mr-2 text-purple-400" />
                  Secure Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-3">
                  API key authentication with rate limiting and permission control
                </p>
                <Badge variant="secondary" className="mb-2">Protected Endpoints</Badge>
                <div className="text-xs text-slate-500">
                  No access to internal memory or learning algorithms
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">API Features</CardTitle>
              <CardDescription>What external platforms can access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-lg font-medium text-green-400">✓ Available</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Strategy recommendations based on market data</li>
                    <li>• Risk-assessed trade decisions</li>
                    <li>• Real-time confidence scoring</li>
                    <li>• Position sizing suggestions</li>
                    <li>• Stop loss and take profit levels</li>
                    <li>• System status and health checks</li>
                    <li>• Webhook integration for live data</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-medium text-red-400">✗ Protected</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Internal learning algorithms</li>
                    <li>• Strategy performance history</li>
                    <li>• Risk management logic</li>
                    <li>• Signal generation methods</li>
                    <li>• Memory and experience data</li>
                    <li>• Exact indicator calculations</li>
                    <li>• Administrative controls</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Create New API Key</CardTitle>
                <CardDescription>Generate secure access for external platforms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="keyName">Platform Name</Label>
                  <Input
                    id="keyName"
                    value={newKeyData.name}
                    onChange={(e) => setNewKeyData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="External Trading Platform"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                
                <div>
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {permissionOptions.map(permission => (
                      <div key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={permission}
                          checked={newKeyData.permissions.includes(permission)}
                          onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor={permission} className="text-sm">{permission}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="rateLimit">Rate Limit (requests/minute)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={newKeyData.rateLimit}
                    onChange={(e) => setNewKeyData(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                
                <Button 
                  onClick={() => createKeyMutation.mutate(newKeyData)}
                  disabled={!newKeyData.name || newKeyData.permissions.length === 0 || createKeyMutation.isPending}
                  className="w-full"
                >
                  Create API Key
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Active API Keys</CardTitle>
                <CardDescription>Manage external platform access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys?.api_keys?.map((key: any, index: number) => (
                    <div key={index} className="p-4 bg-slate-700 rounded border border-slate-600">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-slate-100">{key.name}</h4>
                        <Badge variant={key.isActive ? "default" : "destructive"}>
                          {key.isActive ? 'Active' : 'Revoked'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">Key:</span>
                          <code className="text-slate-300 bg-slate-800 px-2 py-1 rounded">
                            {showAPIKey === key.key ? key.key : key.key}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(key.key, 'API Key')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-slate-400">Usage:</span>
                          <span className="text-slate-300">{key.usageCount} requests</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rate Limit:</span>
                          <span className="text-slate-300">{key.rateLimit}/min</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-slate-400">Permissions:</span>
                          <div className="flex gap-1">
                            {key.permissions.map((perm: string) => (
                              <Badge key={perm} variant="outline" className="text-xs">
                                {perm}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-slate-400">Last Used:</span>
                          <span className="text-slate-300">{key.lastUsed}</span>
                        </div>
                      </div>
                      
                      {key.isActive && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => revokeKeyMutation.mutate(key.key)}
                          disabled={revokeKeyMutation.isPending}
                          className="mt-3"
                        >
                          Revoke Access
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">API Testing Console</CardTitle>
              <CardDescription>Test strategy API calls with live data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="testApiKey">API Key</Label>
                    <Input
                      id="testApiKey"
                      value={testRequest.apikey}
                      onChange={(e) => setTestRequest(prev => ({ ...prev, apikey: e.target.value }))}
                      placeholder="WAIDES_ABC123_STRATEGY"
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="testTrend">Trend</Label>
                    <select
                      id="testTrend"
                      value={testRequest.trend}
                      onChange={(e) => setTestRequest(prev => ({ ...prev, trend: e.target.value }))}
                      className="w-full bg-slate-700 border-slate-600 rounded px-3 py-2 text-slate-100"
                    >
                      <option value="UPTREND">UPTREND</option>
                      <option value="DOWNTREND">DOWNTREND</option>
                      <option value="RANGING">RANGING</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="testRSI">RSI</Label>
                    <Input
                      id="testRSI"
                      type="number"
                      value={testRequest.rsi}
                      onChange={(e) => setTestRequest(prev => ({ ...prev, rsi: parseInt(e.target.value) }))}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="testVWAP">VWAP Status</Label>
                    <select
                      id="testVWAP"
                      value={testRequest.vwap_status}
                      onChange={(e) => setTestRequest(prev => ({ ...prev, vwap_status: e.target.value }))}
                      className="w-full bg-slate-700 border-slate-600 rounded px-3 py-2 text-slate-100"
                    >
                      <option value="ABOVE">ABOVE</option>
                      <option value="BELOW">BELOW</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="testPrice">Price (Optional)</Label>
                    <Input
                      id="testPrice"
                      type="number"
                      value={testRequest.price}
                      onChange={(e) => setTestRequest(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  
                  <Button onClick={testAPICall} className="w-full">
                    Test Strategy API
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-slate-100">Sample Request</h4>
                  <pre className="bg-slate-700 p-4 rounded text-xs text-slate-300 overflow-x-auto">
{JSON.stringify({
  "apikey": "WAIDES_ABC123_STRATEGY",
  "trend": "UPTREND",
  "rsi": 55,
  "vwap_status": "ABOVE",
  "price": 2400
}, null, 2)}
                  </pre>
                  
                  <h4 className="text-lg font-medium text-slate-100">Expected Response</h4>
                  <pre className="bg-slate-700 p-4 rounded text-xs text-slate-300 overflow-x-auto">
{JSON.stringify({
  "strategy_id": "WKI_UBA_1234",
  "confidence": 85,
  "recommendation": "BUY",
  "risk_level": "LOW",
  "timestamp": Date.now(),
  "expires_in": 300
}, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Integration Guide</CardTitle>
              <CardDescription>How to integrate Waides KI Strategy API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-slate-300 mb-3">Strategy API Example</h4>
                <pre className="bg-slate-700 p-4 rounded text-sm text-slate-300 overflow-x-auto">
{`// JavaScript/Node.js Example
const getStrategy = async (marketData) => {
  const response = await fetch('${window.location.origin}/api/waides_ki/strategy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      apikey: 'YOUR_API_KEY',
      trend: marketData.trend,
      rsi: marketData.rsi,
      vwap_status: marketData.vwap_status,
      price: marketData.price
    })
  });
  
  const strategy = await response.json();
  
  if (strategy.confidence > 70) {
    console.log('High confidence strategy:', strategy.recommendation);
    return strategy;
  }
  
  return null;
};`}
                </pre>
              </div>

              <div>
                <h4 className="text-lg font-medium text-slate-300 mb-3">Python Example</h4>
                <pre className="bg-slate-700 p-4 rounded text-sm text-slate-300 overflow-x-auto">
{`import requests

def get_waides_strategy(api_key, trend, rsi, vwap_status, price=None):
    url = "${window.location.origin}/api/waides_ki/strategy"
    
    payload = {
        "apikey": api_key,
        "trend": trend,
        "rsi": rsi,
        "vwap_status": vwap_status
    }
    
    if price:
        payload["price"] = price
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        strategy = response.json()
        return strategy
    else:
        print(f"Error: {response.json().get('error')}")
        return None

# Usage
strategy = get_waides_strategy(
    api_key="YOUR_API_KEY",
    trend="UPTREND",
    rsi=55,
    vwap_status="ABOVE",
    price=2400
)`}
                </pre>
              </div>

              <div>
                <h4 className="text-lg font-medium text-slate-300 mb-3">Trade API Example</h4>
                <pre className="bg-slate-700 p-4 rounded text-sm text-slate-300 overflow-x-auto">
{`// Complete Trade Decision
const getTradeDecision = async (marketData) => {
  const response = await fetch('${window.location.origin}/api/waides_ki/trade', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      apikey: 'YOUR_API_KEY',
      market_data: {
        price: 2400,
        trend: 'UPTREND',
        rsi: 55,
        vwap_status: 'ABOVE',
        volume: 1000000
      },
      risk_tolerance: 'MODERATE'
    })
  });
  
  const trade = await response.json();
  
  if (trade.action !== 'WAIT' && trade.risk_assessment.approved) {
    console.log(\`Trade: \${trade.action} at \${marketData.price}\`);
    console.log(\`Stop Loss: \${trade.stop_loss}\`);
    console.log(\`Take Profit: \${trade.take_profit}\`);
    console.log(\`Suggested Amount: \${trade.suggested_amount}\`);
  }
  
  return trade;
};`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}