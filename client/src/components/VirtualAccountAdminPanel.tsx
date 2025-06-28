import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Settings, Building, Bitcoin, Key, Eye, EyeOff, Save, RefreshCw } from 'lucide-react';

interface VirtualAccountProvider {
  id: string;
  name: string;
  type: 'bank' | 'crypto';
  countries: string[];
  currencies: string[];
  apiEndpoint?: string;
  apiKey?: string;
  secretKey?: string;
  isActive: boolean;
}

export function VirtualAccountAdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [providerConfig, setProviderConfig] = useState<Partial<VirtualAccountProvider>>({});

  // Fetch all providers
  const { data: providers = [], isLoading } = useQuery<VirtualAccountProvider[]>({
    queryKey: ['/api/virtual-accounts/providers'],
    queryFn: () => apiRequest('GET', '/api/virtual-accounts/providers').then(res => res.json())
  });

  // Update provider mutation
  const updateProviderMutation = useMutation({
    mutationFn: async ({ providerId, config }: { providerId: string; config: Partial<VirtualAccountProvider> }) => {
      const response = await apiRequest('PUT', `/api/virtual-accounts/providers/${providerId}`, config);
      if (!response.ok) {
        throw new Error('Failed to update provider');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/virtual-accounts/providers'] });
      setEditingProvider(null);
      setProviderConfig({});
      toast({
        title: "Provider Updated",
        description: "Virtual account provider configuration saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update provider configuration.",
        variant: "destructive",
      });
    }
  });

  const startEditing = (provider: VirtualAccountProvider) => {
    setEditingProvider(provider.id);
    setProviderConfig({
      apiEndpoint: provider.apiEndpoint || '',
      apiKey: provider.apiKey || '',
      secretKey: provider.secretKey || '',
      isActive: provider.isActive
    });
  };

  const saveProvider = () => {
    if (!editingProvider) return;
    updateProviderMutation.mutate({
      providerId: editingProvider,
      config: providerConfig
    });
  };

  const toggleSecretVisibility = (providerId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  const bankProviders = providers.filter(p => p.type === 'bank');
  const cryptoProviders = providers.filter(p => p.type === 'crypto');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading virtual account providers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Virtual Account Provider Management</h2>
      </div>

      <Tabs defaultValue="bank" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bank" className="flex items-center space-x-2">
            <Building className="w-4 h-4" />
            <span>Bank Providers ({bankProviders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="crypto" className="flex items-center space-x-2">
            <Bitcoin className="w-4 h-4" />
            <span>Crypto Providers ({cryptoProviders.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bank" className="space-y-4">
          <div className="grid gap-4">
            {bankProviders.map((provider) => (
              <Card key={provider.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Building className="w-5 h-5" />
                        <span>{provider.name}</span>
                        <Badge variant={provider.isActive ? "default" : "secondary"}>
                          {provider.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Countries: {provider.countries.join(', ')} | 
                        Currencies: {provider.currencies.join(', ')}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(provider)}
                      disabled={editingProvider === provider.id}
                    >
                      {editingProvider === provider.id ? "Editing..." : "Configure"}
                    </Button>
                  </div>
                </CardHeader>
                
                {editingProvider === provider.id && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${provider.id}-endpoint`}>API Endpoint</Label>
                        <Input
                          id={`${provider.id}-endpoint`}
                          placeholder="https://api.provider.com"
                          value={providerConfig.apiEndpoint || ''}
                          onChange={(e) => setProviderConfig(prev => ({
                            ...prev,
                            apiEndpoint: e.target.value
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={providerConfig.isActive}
                            onCheckedChange={(checked) => setProviderConfig(prev => ({
                              ...prev,
                              isActive: checked
                            }))}
                          />
                          <span className="text-sm">
                            {providerConfig.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${provider.id}-apikey`}>API Key</Label>
                        <div className="flex space-x-2">
                          <Input
                            id={`${provider.id}-apikey`}
                            type={showSecrets[provider.id] ? "text" : "password"}
                            placeholder="Enter API key"
                            value={providerConfig.apiKey || ''}
                            onChange={(e) => setProviderConfig(prev => ({
                              ...prev,
                              apiKey: e.target.value
                            }))}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSecretVisibility(provider.id)}
                          >
                            {showSecrets[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${provider.id}-secret`}>Secret Key</Label>
                        <div className="flex space-x-2">
                          <Input
                            id={`${provider.id}-secret`}
                            type={showSecrets[provider.id] ? "text" : "password"}
                            placeholder="Enter secret key"
                            value={providerConfig.secretKey || ''}
                            onChange={(e) => setProviderConfig(prev => ({
                              ...prev,
                              secretKey: e.target.value
                            }))}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSecretVisibility(provider.id)}
                          >
                            {showSecrets[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingProvider(null);
                          setProviderConfig({});
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={saveProvider}
                        disabled={updateProviderMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateProviderMutation.isPending ? "Saving..." : "Save Configuration"}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="crypto" className="space-y-4">
          <div className="grid gap-4">
            {cryptoProviders.map((provider) => (
              <Card key={provider.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Bitcoin className="w-5 h-5" />
                        <span>{provider.name}</span>
                        <Badge variant={provider.isActive ? "default" : "secondary"}>
                          {provider.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Supported: {provider.currencies.join(', ')} | Global Coverage
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(provider)}
                      disabled={editingProvider === provider.id}
                    >
                      {editingProvider === provider.id ? "Editing..." : "Configure"}
                    </Button>
                  </div>
                </CardHeader>
                
                {editingProvider === provider.id && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${provider.id}-endpoint`}>API Endpoint</Label>
                        <Input
                          id={`${provider.id}-endpoint`}
                          placeholder="https://api.crypto-provider.com"
                          value={providerConfig.apiEndpoint || ''}
                          onChange={(e) => setProviderConfig(prev => ({
                            ...prev,
                            apiEndpoint: e.target.value
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={providerConfig.isActive}
                            onCheckedChange={(checked) => setProviderConfig(prev => ({
                              ...prev,
                              isActive: checked
                            }))}
                          />
                          <span className="text-sm">
                            {providerConfig.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${provider.id}-apikey`}>API Key</Label>
                        <div className="flex space-x-2">
                          <Input
                            id={`${provider.id}-apikey`}
                            type={showSecrets[provider.id] ? "text" : "password"}
                            placeholder="Enter API key"
                            value={providerConfig.apiKey || ''}
                            onChange={(e) => setProviderConfig(prev => ({
                              ...prev,
                              apiKey: e.target.value
                            }))}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSecretVisibility(provider.id)}
                          >
                            {showSecrets[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${provider.id}-secret`}>Secret Key</Label>
                        <div className="flex space-x-2">
                          <Input
                            id={`${provider.id}-secret`}
                            type={showSecrets[provider.id] ? "text" : "password"}
                            placeholder="Enter secret key"
                            value={providerConfig.secretKey || ''}
                            onChange={(e) => setProviderConfig(prev => ({
                              ...prev,
                              secretKey: e.target.value
                            }))}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSecretVisibility(provider.id)}
                          >
                            {showSecrets[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingProvider(null);
                          setProviderConfig({});
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={saveProvider}
                        disabled={updateProviderMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateProviderMutation.isPending ? "Saving..." : "Save Configuration"}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>Integration Instructions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Bank Providers:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Monnify:</strong> Get API credentials from your Monnify dashboard</li>
              <li><strong>Paystack:</strong> Generate keys from Paystack Settings → API Keys & Webhooks</li>
              <li><strong>Flutterwave:</strong> Access keys in your Flutterwave dashboard under Settings</li>
              <li><strong>Stripe:</strong> Copy keys from Stripe Dashboard → Developers → API keys</li>
              <li><strong>Wise:</strong> Generate API token from Wise Business Settings</li>
            </ul>
            
            <p className="pt-2"><strong>Crypto Providers:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Coinbase Commerce:</strong> Create API key from Coinbase Commerce Settings</li>
              <li><strong>Binance Pay:</strong> Generate merchant key from Binance Pay for Business</li>
              <li><strong>Blockchain.info:</strong> Get API key from Blockchain.info wallet</li>
              <li><strong>TronLink:</strong> Use TronLink Pro API for wallet generation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}