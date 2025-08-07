import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Users, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";

interface ExchangeCredentials {
  id: number;
  exchangeName: string;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  sandbox: boolean;
  maxUsersPerKey: number;
  currentUsers: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsageStats {
  [exchangeName: string]: {
    totalCredentials: number;
    activeCredentials: number;
    totalSlots: number;
    usedSlots: number;
    availableSlots: number;
  };
}

const SUPPORTED_EXCHANGES = [
  'Binance',
  'Coinbase Pro', 
  'Kraken',
  'KuCoin',
  'Bybit',
  'OKX',
  'Gate.io',
  'Huobi',
  'Bitget'
];

export default function AdminExchangePoolPage() {
  const [credentials, setCredentials] = useState<ExchangeCredentials[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats>({});
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState('');
  const { toast } = useToast();

  // New credential form state
  const [newCredential, setNewCredential] = useState({
    exchangeName: '',
    apiKey: '',
    apiSecret: '',
    passphrase: '',
    sandbox: false,
    maxUsersPerKey: 10
  });

  // Fetch credentials and usage stats
  const fetchData = async () => {
    setLoading(true);
    try {
      const [credentialsRes, statsRes] = await Promise.all([
        fetch('/api/admin/exchange-pool/credentials'),
        fetch('/api/admin/exchange-pool/usage-stats')
      ]);

      if (credentialsRes.ok) {
        const credentialsData = await credentialsRes.json();
        setCredentials(credentialsData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setUsageStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch exchange pool data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add new credentials
  const handleAddCredentials = async () => {
    try {
      const response = await fetch('/api/admin/exchange-pool/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCredential),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Exchange credentials added successfully",
        });
        setIsAddDialogOpen(false);
        setNewCredential({
          exchangeName: '',
          apiKey: '',
          apiSecret: '',
          passphrase: '',
          sandbox: false,
          maxUsersPerKey: 10
        });
        await fetchData();
      } else {
        throw new Error(result.message || 'Failed to add credentials');
      }
    } catch (error) {
      console.error('Error adding credentials:', error);
      toast({
        title: "Error",
        description: "Failed to add exchange credentials",
        variant: "destructive",
      });
    }
  };

  // Toggle credential status
  const toggleCredentialStatus = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/exchange-pool/update/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: `Credentials ${isActive ? 'activated' : 'deactivated'} successfully`,
        });
        await fetchData();
      } else {
        throw new Error(result.message || 'Failed to update credentials');
      }
    } catch (error) {
      console.error('Error updating credentials:', error);
      toast({
        title: "Error",
        description: "Failed to update credentials status",
        variant: "destructive",
      });
    }
  };

  // Delete credentials
  const handleDeleteCredentials = async (id: number) => {
    if (!confirm('Are you sure you want to delete these credentials?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/exchange-pool/delete/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Credentials deleted successfully",
        });
        await fetchData();
      } else {
        throw new Error('Failed to delete credentials');
      }
    } catch (error) {
      console.error('Error deleting credentials:', error);
      toast({
        title: "Error",
        description: "Failed to delete credentials",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const totalCredentials = credentials.length;
  const activeCredentials = credentials.filter(c => c.isActive).length;
  const totalSlots = credentials.reduce((sum, c) => sum + c.maxUsersPerKey, 0);
  const usedSlots = credentials.reduce((sum, c) => sum + c.currentUsers, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Exchange Pool Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage shared exchange API credentials for users without their own keys
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Credentials</p>
                  <p className="text-3xl font-bold text-blue-600">{totalCredentials}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Credentials</p>
                  <p className="text-3xl font-bold text-emerald-600">{activeCredentials}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available Slots</p>
                  <p className="text-3xl font-bold text-purple-600">{totalSlots - usedSlots}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Usage Rate</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {totalSlots > 0 ? Math.round((usedSlots / totalSlots) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="credentials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="usage">Usage Stats</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Exchange Credentials</h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Credentials
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Exchange Credentials</DialogTitle>
                    <DialogDescription>
                      Add new API credentials for users to share
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="exchange">Exchange</Label>
                      <Select 
                        value={newCredential.exchangeName} 
                        onValueChange={(value) => setNewCredential({...newCredential, exchangeName: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select exchange" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_EXCHANGES.map(exchange => (
                            <SelectItem key={exchange} value={exchange}>
                              {exchange}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={newCredential.apiKey}
                        onChange={(e) => setNewCredential({...newCredential, apiKey: e.target.value})}
                        placeholder="Enter API key"
                      />
                    </div>

                    <div>
                      <Label htmlFor="apiSecret">API Secret</Label>
                      <Input
                        id="apiSecret"
                        type="password"
                        value={newCredential.apiSecret}
                        onChange={(e) => setNewCredential({...newCredential, apiSecret: e.target.value})}
                        placeholder="Enter API secret"
                      />
                    </div>

                    {newCredential.exchangeName === 'Coinbase Pro' && (
                      <div>
                        <Label htmlFor="passphrase">Passphrase</Label>
                        <Input
                          id="passphrase"
                          type="password"
                          value={newCredential.passphrase}
                          onChange={(e) => setNewCredential({...newCredential, passphrase: e.target.value})}
                          placeholder="Enter passphrase"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="maxUsers">Max Users Per Key</Label>
                      <Input
                        id="maxUsers"
                        type="number"
                        min="1"
                        max="50"
                        value={newCredential.maxUsersPerKey}
                        onChange={(e) => setNewCredential({...newCredential, maxUsersPerKey: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="sandbox"
                        checked={newCredential.sandbox}
                        onCheckedChange={(checked) => setNewCredential({...newCredential, sandbox: checked})}
                      />
                      <Label htmlFor="sandbox">Sandbox Mode</Label>
                    </div>

                    <Button onClick={handleAddCredentials} className="w-full">
                      Add Credentials
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {credentials.map((cred) => (
                <Card key={cred.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-lg">{cred.exchangeName}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={cred.isActive ? "default" : "secondary"}>
                              {cred.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {cred.sandbox && (
                              <Badge variant="outline">Sandbox</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {cred.currentUsers} / {cred.maxUsersPerKey} users
                          </p>
                          <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(cred.currentUsers / cred.maxUsersPerKey) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={cred.isActive}
                            onCheckedChange={(checked) => toggleCredentialStatus(cred.id, checked)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCredentials(cred.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {credentials.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Credentials Added</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Add exchange API credentials to enable trading for users without their own keys
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Usage Stats Tab */}
          <TabsContent value="usage" className="space-y-6">
            <h2 className="text-2xl font-semibold">Usage Statistics</h2>
            <div className="grid gap-4">
              {Object.entries(usageStats).map(([exchange, stats]) => (
                <Card key={exchange}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {exchange}
                      <Badge variant="outline">
                        {stats.availableSlots} slots available
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Credentials</p>
                        <p className="text-2xl font-bold">{stats.totalCredentials}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                        <p className="text-2xl font-bold text-emerald-600">{stats.activeCredentials}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Slots</p>
                        <p className="text-2xl font-bold">{stats.totalSlots}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Used Slots</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.usedSlots}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Usage Rate</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {stats.totalSlots > 0 ? Math.round((stats.usedSlots / stats.totalSlots) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <h2 className="text-2xl font-semibold">System Monitoring</h2>
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Exchange Health Status</CardTitle>
                  <CardDescription>
                    Real-time status of all exchange connections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {SUPPORTED_EXCHANGES.map(exchange => {
                      const hasCredentials = credentials.some(c => c.exchangeName === exchange && c.isActive);
                      return (
                        <div key={exchange} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{exchange}</span>
                          <div className="flex items-center space-x-2">
                            {hasCredentials ? (
                              <>
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                <span className="text-emerald-600">Connected</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-5 w-5 text-gray-400" />
                                <span className="text-gray-500">No Credentials</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}