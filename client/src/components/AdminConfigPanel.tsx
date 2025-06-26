import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Key, TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ServiceStatus {
  configured: boolean;
  active: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'NOT_CONFIGURED';
}

interface ConfigStatus {
  services: {
    openai: ServiceStatus;
    inciteAI: ServiceStatus;
  };
  timestamp: string;
}

export default function AdminConfigPanel() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [inciteKey, setInciteKey] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch configuration status
  const { data: configStatus, isLoading } = useQuery<ConfigStatus>({
    queryKey: ['/api/admin/config/status'],
    refetchInterval: 30000
  });

  // Update OpenAI API Key
  const updateOpenAIMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      const response = await fetch('/api/admin/config/openai-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      if (!response.ok) throw new Error('Failed to update OpenAI key');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? 'Success' : 'Error',
        description: data.message,
        variant: data.success ? 'default' : 'destructive'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/config/status'] });
      if (data.success) setOpenaiKey('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update OpenAI API key',
        variant: 'destructive'
      });
    }
  });

  // Test OpenAI connection
  const testOpenAIMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/config/test-openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? 'Test Successful' : 'Test Failed',
        description: data.message,
        variant: data.success ? 'default' : 'destructive'
      });
    }
  });

  const getStatusBadge = (service: ServiceStatus) => {
    if (service.status === 'ACTIVE') {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
    } else if (service.status === 'INACTIVE') {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><AlertCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
    } else {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Not Configured</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Configuration Panel
            </h1>
            <p className="text-gray-400">Manage API keys and external service integrations</p>
          </div>
        </div>

        {/* Service Status Overview */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-purple-300">Service Status Overview</CardTitle>
            <CardDescription>Current status of all external service integrations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            ) : configStatus ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-white">OpenAI (ChatGPT)</h3>
                    <p className="text-sm text-gray-400">Spiritual AI Chat Service</p>
                  </div>
                  {getStatusBadge(configStatus.services.openai)}
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-white">Incite AI</h3>
                    <p className="text-sm text-gray-400">Advanced Analytics Engine</p>
                  </div>
                  {getStatusBadge(configStatus.services.inciteAI)}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">Failed to load service status</div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Tabs */}
        <Tabs defaultValue="openai" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="openai" className="data-[state=active]:bg-purple-600">OpenAI</TabsTrigger>
            <TabsTrigger value="incite" className="data-[state=active]:bg-purple-600">Incite AI</TabsTrigger>
            <TabsTrigger value="testing" className="data-[state=active]:bg-purple-600">Testing</TabsTrigger>
          </TabsList>

          {/* OpenAI Configuration */}
          <TabsContent value="openai" className="space-y-4">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-400" />
                  OpenAI API Configuration
                </CardTitle>
                <CardDescription>
                  Configure OpenAI ChatGPT integration for enhanced spiritual AI responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="openai-key"
                      type={showKeys ? "text" : "password"}
                      placeholder="sk-..."
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setShowKeys(!showKeys)}
                      className="border-gray-600"
                    >
                      {showKeys ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-400">
                    Get your API key from OpenAI Platform dashboard
                  </p>
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex gap-2">
                  <Button
                    onClick={() => updateOpenAIMutation.mutate(openaiKey)}
                    disabled={!openaiKey.trim() || updateOpenAIMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {updateOpenAIMutation.isPending ? 'Updating...' : 'Update API Key'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => testOpenAIMutation.mutate()}
                    disabled={testOpenAIMutation.isPending}
                    className="border-gray-600"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Incite AI Configuration */}
          <TabsContent value="incite" className="space-y-4">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-400" />
                  Incite AI Configuration
                </CardTitle>
                <CardDescription>
                  Configure Incite AI integration for advanced analytics and insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="incite-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="incite-key"
                      type={showKeys ? "text" : "password"}
                      placeholder="incite_..."
                      value={inciteKey}
                      onChange={(e) => setInciteKey(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      disabled
                    />
                    <Button
                      variant="outline"
                      onClick={() => setShowKeys(!showKeys)}
                      className="border-gray-600"
                    >
                      {showKeys ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-400">
                    Incite AI integration coming soon
                  </p>
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex gap-2">
                  <Button
                    disabled
                    className="bg-gray-600"
                  >
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-4">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-purple-400" />
                  Service Testing
                </CardTitle>
                <CardDescription>
                  Test connectivity and functionality of configured services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg space-y-3">
                    <h3 className="font-semibold text-white">OpenAI Chat Test</h3>
                    <p className="text-sm text-gray-400">Test spiritual AI chat functionality</p>
                    <Button
                      onClick={() => testOpenAIMutation.mutate()}
                      disabled={testOpenAIMutation.isPending}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {testOpenAIMutation.isPending ? 'Testing...' : 'Test OpenAI'}
                    </Button>
                  </div>

                  <div className="p-4 bg-gray-800/50 rounded-lg space-y-3">
                    <h3 className="font-semibold text-white">Incite AI Test</h3>
                    <p className="text-sm text-gray-400">Test analytics engine connectivity</p>
                    <Button
                      disabled
                      className="w-full bg-gray-600"
                    >
                      Coming Soon
                    </Button>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div className="space-y-2">
                  <h3 className="font-semibold text-white">Test Results</h3>
                  <div className="p-3 bg-gray-800/30 rounded border border-gray-700">
                    <p className="text-sm text-gray-400">
                      Test results will appear here after running connectivity tests
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Usage Information */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-purple-300">Usage Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-400">
            <p>• API keys are stored securely and used only for authorized requests</p>
            <p>• OpenAI integration enhances spiritual AI chat with advanced language capabilities</p>
            <p>• Test connections regularly to ensure optimal performance</p>
            <p>• All API usage is monitored and logged for security purposes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}