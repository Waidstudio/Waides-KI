import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2, Plus, Trash2, CheckCircle2, XCircle, AlertCircle, Link as LinkIcon, TestTube } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConnectorConfig {
  id: number;
  connectorCode: string;
  connectorName: string;
  connectorType: 'binary' | 'forex' | 'spot';
  selectedBot: string;
  isActive: boolean;
  verificationStatus: 'pending' | 'verified' | 'failed';
  errorMessage?: string;
  lastVerified?: string;
  createdAt: string;
}

interface MarketTypeConnector {
  code: string;
  name: string;
  status: 'operational' | 'maintenance' | 'not_implemented';
  description: string;
}

interface MarketSummary {
  binary: { total: number; operational: number; connectors: MarketTypeConnector[] };
  forex: { total: number; operational: number; connectors: MarketTypeConnector[] };
  spot: { total: number; operational: number; connectors: MarketTypeConnector[] };
}

const BOT_OPTIONS = [
  { value: 'waidbot-alpha', label: 'WaidBot α (Alpha)', type: 'binary', description: 'Binary Options Master' },
  { value: 'waidbot-pro-beta', label: 'WaidBot Pro β (Beta)', type: 'binary', description: 'Advanced Binary Trader' },
  { value: 'autonomous-trader-gamma', label: 'Autonomous Trader γ (Gamma)', type: 'forex', description: 'Forex/CFD Engine' },
  { value: 'full-engine-omega', label: 'Full Engine Ω (Omega)', type: 'spot', description: 'Spot Exchange Master' },
  { value: 'maibot', label: 'Maibot', type: 'binary', description: 'Entry-Level Learning Bot' },
];

export default function APIConnectionPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMarketType, setSelectedMarketType] = useState<'binary' | 'forex' | 'spot'>('spot');
  const [selectedBot, setSelectedBot] = useState('');
  const [selectedConnector, setSelectedConnector] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  // Fetch user's connector configurations
  const { data: connectors, isLoading } = useQuery<{ connectors: ConnectorConfig[] }>({
    queryKey: ['/api/user-connectors'],
  });

  // Fetch available connectors by market type
  const { data: marketSummary } = useQuery<{ summary: MarketSummary }>({
    queryKey: ['/api/connectors/market-summary'],
  });

  // Create/Update connector mutation
  const createConnectorMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/user-connectors', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-connectors'] });
      toast({
        title: 'Success',
        description: 'Connector added successfully',
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add connector',
      });
    },
  });

  // Delete connector mutation
  const deleteConnectorMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/user-connectors/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-connectors'] });
      toast({
        title: 'Success',
        description: 'Connector deleted successfully',
      });
    },
  });

  // Test connector mutation
  const testConnectorMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/user-connectors/${id}/test`, {
        method: 'POST',
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-connectors'] });
      toast({
        title: data.verified ? 'Verified' : 'Test Failed',
        description: data.verified ? 'Connection verified successfully' : 'Connection verification failed',
        variant: data.verified ? 'default' : 'destructive',
      });
    },
  });

  // Toggle connector active status
  const toggleConnectorMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/user-connectors/${id}/toggle`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-connectors'] });
    },
  });

  const resetForm = () => {
    setSelectedMarketType('spot');
    setSelectedBot('');
    setSelectedConnector('');
    setApiKey('');
    setApiSecret('');
  };

  const handleSubmit = () => {
    if (!selectedBot || !selectedConnector) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select both a trading bot and connector',
      });
      return;
    }

    const connector = getAvailableConnectors().find(c => c.code === selectedConnector);
    if (!connector) return;

    createConnectorMutation.mutate({
      connectorCode: selectedConnector,
      connectorName: connector.name,
      connectorType: selectedMarketType,
      selectedBot,
      apiKey,
      apiSecret,
      additionalCredentials: {},
    });
  };

  const getAvailableConnectors = (): MarketTypeConnector[] => {
    if (!marketSummary) return [];
    
    const connectors = marketSummary.summary[selectedMarketType]?.connectors || [];
    return connectors.filter(c => c.status === 'operational');
  };

  const getCompatibleBots = () => {
    return BOT_OPTIONS.filter(bot => bot.type === selectedMarketType);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getBotLabel = (botValue: string) => {
    return BOT_OPTIONS.find(b => b.value === botValue)?.label || botValue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              API Connections
            </h1>
            <p className="text-gray-400 mt-2">Connect your trading accounts and select your Waides KI trading bots</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Connection
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">Add API Connection</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Connect your broker/exchange account and select which trading bot to use
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Market Type Selection */}
                <div className="space-y-2">
                  <Label className="text-white">Market Type</Label>
                  <Select value={selectedMarketType} onValueChange={(value: any) => {
                    setSelectedMarketType(value);
                    setSelectedBot('');
                    setSelectedConnector('');
                  }}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-market-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="spot">Spot Exchange (Crypto)</SelectItem>
                      <SelectItem value="binary">Binary Options</SelectItem>
                      <SelectItem value="forex">Forex/CFD</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400">
                    {selectedMarketType === 'spot' && 'Trade cryptocurrencies on spot exchanges (Binance, Coinbase, etc.)'}
                    {selectedMarketType === 'binary' && 'Binary options trading (Deriv, Quotex, PocketOption, etc.)'}
                    {selectedMarketType === 'forex' && 'Forex and CFD trading (MT4/MT5, OANDA, etc.)'}
                  </p>
                </div>

                {/* Trading Bot Selection */}
                <div className="space-y-2">
                  <Label className="text-white">Trading Bot</Label>
                  <Select value={selectedBot} onValueChange={setSelectedBot}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-trading-bot">
                      <SelectValue placeholder="Select a trading bot" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {getCompatibleBots().map(bot => (
                        <SelectItem key={bot.value} value={bot.value}>
                          {bot.label} - {bot.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Connector Selection */}
                <div className="space-y-2">
                  <Label className="text-white">Broker/Exchange</Label>
                  <Select value={selectedConnector} onValueChange={setSelectedConnector}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-connector">
                      <SelectValue placeholder="Select broker/exchange" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {getAvailableConnectors().map(connector => (
                        <SelectItem key={connector.code} value={connector.code}>
                          {connector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedMarketType === 'binary' && (
                    <Alert className="bg-yellow-900/20 border-yellow-700">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <AlertDescription className="text-yellow-200 text-xs">
                        Binary options APIs are in development. Connection will be available soon.
                      </AlertDescription>
                    </Alert>
                  )}
                  {selectedMarketType === 'forex' && (
                    <Alert className="bg-yellow-900/20 border-yellow-700">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <AlertDescription className="text-yellow-200 text-xs">
                        Forex platform APIs are in development. MT4/MT5 bridge coming soon.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* API Credentials */}
                <div className="space-y-2">
                  <Label className="text-white">API Key</Label>
                  <Input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="bg-slate-800 border-slate-700 text-white"
                    data-testid="input-api-key"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">API Secret</Label>
                  <Input
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="Enter your API secret"
                    className="bg-slate-800 border-slate-700 text-white"
                    data-testid="input-api-secret"
                  />
                </div>

                <Alert className="bg-blue-900/20 border-blue-700">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-200 text-xs">
                    Your API credentials are encrypted and stored securely. We never access your funds directly.
                  </AlertDescription>
                </Alert>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700 text-white hover:bg-slate-800">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createConnectorMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-emerald-600"
                  data-testid="button-submit-connector"
                >
                  {createConnectorMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Connection
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Market Type Statistics */}
        {marketSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Spot Exchanges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-400">
                  {marketSummary.summary.spot?.operational || 0}/{marketSummary.summary.spot?.total || 0}
                </div>
                <p className="text-xs text-gray-400 mt-1">Operational connectors</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Binary Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">
                  {marketSummary.summary.binary?.operational || 0}/{marketSummary.summary.binary?.total || 0}
                </div>
                <p className="text-xs text-gray-400 mt-1">Operational connectors</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Forex/CFD</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">
                  {marketSummary.summary.forex?.operational || 0}/{marketSummary.summary.forex?.total || 0}
                </div>
                <p className="text-xs text-gray-400 mt-1">Operational connectors</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Connected Accounts */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Your Connected Accounts</CardTitle>
            <CardDescription className="text-gray-400">Manage your broker/exchange connections</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              </div>
            ) : connectors?.connectors && connectors.connectors.length > 0 ? (
              <div className="space-y-4">
                {connectors.connectors.map((connector) => (
                  <div
                    key={connector.id}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                    data-testid={`connector-${connector.id}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center">
                        <LinkIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{connector.connectorName}</h3>
                          {getStatusBadge(connector.verificationStatus)}
                          {connector.isActive ? (
                            <Badge className="bg-green-600">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          Trading Bot: {getBotLabel(connector.selectedBot)} • Type: {connector.connectorType.toUpperCase()}
                        </p>
                        {connector.errorMessage && (
                          <p className="text-xs text-red-400 mt-1">{connector.errorMessage}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testConnectorMutation.mutate(connector.id)}
                        disabled={testConnectorMutation.isPending}
                        className="border-slate-700 text-white hover:bg-slate-700"
                        data-testid={`button-test-${connector.id}`}
                      >
                        <TestTube className="w-4 h-4 mr-1" />
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleConnectorMutation.mutate(connector.id)}
                        className="border-slate-700 text-white hover:bg-slate-700"
                        data-testid={`button-toggle-${connector.id}`}
                      >
                        {connector.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteConnectorMutation.mutate(connector.id)}
                        disabled={deleteConnectorMutation.isPending}
                        data-testid={`button-delete-${connector.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <LinkIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Connections Yet</h3>
                <p className="text-gray-400 mb-4">Connect your first broker/exchange account to start trading</p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-emerald-600"
                  data-testid="button-add-first-connection"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Connection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
