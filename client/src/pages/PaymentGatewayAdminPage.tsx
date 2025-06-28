import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Key, 
  Globe, 
  CreditCard, 
  Smartphone, 
  Bitcoin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  TestTube,
  Eye,
  EyeOff
} from 'lucide-react';

interface PaymentGatewayConfig {
  id: string;
  name: string;
  type: 'mobile' | 'card' | 'crypto' | 'bank';
  countries: string[];
  apiKey?: string;
  secretKey?: string;
  merchantId?: string;
  publicKey?: string;
  testMode: boolean;
  enabled: boolean;
  lastTested?: string;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  transactionFee: number;
  supportedCurrencies: string[];
}

export default function PaymentGatewayAdminPage() {
  const [configs, setConfigs] = useState<PaymentGatewayConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  // Initialize payment gateway configurations
  useEffect(() => {
    const defaultConfigs: PaymentGatewayConfig[] = [
      {
        id: 'paystack',
        name: 'Paystack',
        type: 'card',
        countries: ['NG', 'GH', 'ZA'],
        testMode: true,
        enabled: false,
        status: 'disconnected',
        transactionFee: 1.5,
        supportedCurrencies: ['NGN', 'GHS', 'ZAR', 'USD']
      },
      {
        id: 'flutterwave',
        name: 'Flutterwave',
        type: 'card',
        countries: ['NG', 'GH', 'KE', 'UG', 'TZ', 'RW'],
        testMode: true,
        enabled: false,
        status: 'disconnected',
        transactionFee: 2.0,
        supportedCurrencies: ['NGN', 'GHS', 'KES', 'UGX', 'TZS', 'RWF', 'USD']
      },
      {
        id: 'mpesa',
        name: 'M-PESA',
        type: 'mobile',
        countries: ['KE', 'TZ', 'UG'],
        testMode: true,
        enabled: false,
        status: 'disconnected',
        transactionFee: 0.5,
        supportedCurrencies: ['KES', 'TZS', 'UGX']
      },
      {
        id: 'payfast',
        name: 'PayFast',
        type: 'card',
        countries: ['ZA'],
        testMode: true,
        enabled: false,
        status: 'disconnected',
        transactionFee: 3.0,
        supportedCurrencies: ['ZAR']
      },
      {
        id: 'monnify',
        name: 'Monnify',
        type: 'bank',
        countries: ['NG'],
        testMode: true,
        enabled: false,
        status: 'disconnected',
        transactionFee: 1.0,
        supportedCurrencies: ['NGN']
      },
      {
        id: 'crypto_usdt',
        name: 'USDT Wallet',
        type: 'crypto',
        countries: ['GLOBAL'],
        testMode: false,
        enabled: false,
        status: 'disconnected',
        transactionFee: 0.0,
        supportedCurrencies: ['USDT']
      },
      {
        id: 'crypto_usdc',
        name: 'USDC Wallet',
        type: 'crypto',
        countries: ['GLOBAL'],
        testMode: false,
        enabled: false,
        status: 'disconnected',
        transactionFee: 0.0,
        supportedCurrencies: ['USDC']
      },
      {
        id: 'crypto_btc',
        name: 'Bitcoin Wallet',
        type: 'crypto',
        countries: ['GLOBAL'],
        testMode: false,
        enabled: false,
        status: 'disconnected',
        transactionFee: 0.0,
        supportedCurrencies: ['BTC']
      }
    ];

    // Load saved configurations from localStorage
    const savedConfigs = localStorage.getItem('paymentGatewayConfigs');
    if (savedConfigs) {
      try {
        const parsed = JSON.parse(savedConfigs);
        setConfigs(parsed);
      } catch {
        setConfigs(defaultConfigs);
      }
    } else {
      setConfigs(defaultConfigs);
    }
    setLoading(false);
  }, []);

  const saveConfiguration = async (gatewayId: string, config: Partial<PaymentGatewayConfig>) => {
    setSaving(gatewayId);
    try {
      const updatedConfigs = configs.map(c => 
        c.id === gatewayId ? { ...c, ...config } : c
      );
      setConfigs(updatedConfigs);
      localStorage.setItem('paymentGatewayConfigs', JSON.stringify(updatedConfigs));

      // Save to API keys storage
      if (config.apiKey || config.secretKey) {
        await apiRequest('POST', '/api/admin/payment-gateway/config', {
          gatewayId,
          config: config
        });
      }

      toast({
        title: "Configuration Saved",
        description: `${configs.find(c => c.id === gatewayId)?.name} configuration has been saved successfully.`
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(null);
    }
  };

  const testConnection = async (gatewayId: string) => {
    setTesting(gatewayId);
    try {
      const response = await apiRequest('POST', '/api/admin/payment-gateway/test', {
        gatewayId
      });

      const updatedConfigs = configs.map(c => 
        c.id === gatewayId ? { 
          ...c, 
          status: response.success ? 'connected' : 'error',
          lastTested: new Date().toISOString()
        } : c
      );
      setConfigs(updatedConfigs);
      localStorage.setItem('paymentGatewayConfigs', JSON.stringify(updatedConfigs));

      toast({
        title: response.success ? "Test Successful" : "Test Failed",
        description: response.message || (response.success ? "Gateway connection verified" : "Failed to connect to gateway"),
        variant: response.success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test gateway connection.",
        variant: "destructive"
      });
    } finally {
      setTesting(null);
    }
  };

  const toggleSecret = (gatewayId: string, field: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [`${gatewayId}_${field}`]: !prev[`${gatewayId}_${field}`]
    }));
  };

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="h-5 w-5" />;
      case 'crypto': return <Bitcoin className="h-5 w-5" />;
      case 'bank': return <CreditCard className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'testing': return <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const ConfigCard = ({ config }: { config: PaymentGatewayConfig }) => (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getGatewayIcon(config.type)}
            <div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <CardDescription>
                {config.countries.join(', ')} • {config.supportedCurrencies.join(', ')}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(config.status)}
            <Badge variant={config.enabled ? "default" : "secondary"}>
              {config.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${config.id}_enabled`}>Enable Gateway</Label>
            <Switch
              id={`${config.id}_enabled`}
              checked={config.enabled}
              onCheckedChange={(enabled) => saveConfiguration(config.id, { enabled })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${config.id}_testMode`}>Test Mode</Label>
            <Switch
              id={`${config.id}_testMode`}
              checked={config.testMode}
              onCheckedChange={(testMode) => saveConfiguration(config.id, { testMode })}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          {config.type !== 'crypto' && (
            <>
              <div className="space-y-2">
                <Label htmlFor={`${config.id}_apiKey`}>API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id={`${config.id}_apiKey`}
                    type={showSecrets[`${config.id}_apiKey`] ? "text" : "password"}
                    value={config.apiKey || ''}
                    onChange={(e) => saveConfiguration(config.id, { apiKey: e.target.value })}
                    placeholder="Enter API key..."
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleSecret(config.id, 'apiKey')}
                  >
                    {showSecrets[`${config.id}_apiKey`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${config.id}_secretKey`}>Secret Key</Label>
                <div className="flex gap-2">
                  <Input
                    id={`${config.id}_secretKey`}
                    type={showSecrets[`${config.id}_secretKey`] ? "text" : "password"}
                    value={config.secretKey || ''}
                    onChange={(e) => saveConfiguration(config.id, { secretKey: e.target.value })}
                    placeholder="Enter secret key..."
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleSecret(config.id, 'secretKey')}
                  >
                    {showSecrets[`${config.id}_secretKey`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {(config.id === 'paystack' || config.id === 'monnify') && (
                <div className="space-y-2">
                  <Label htmlFor={`${config.id}_publicKey`}>Public Key</Label>
                  <Input
                    id={`${config.id}_publicKey`}
                    value={config.publicKey || ''}
                    onChange={(e) => saveConfiguration(config.id, { publicKey: e.target.value })}
                    placeholder="Enter public key..."
                  />
                </div>
              )}

              {config.id === 'payfast' && (
                <div className="space-y-2">
                  <Label htmlFor={`${config.id}_merchantId`}>Merchant ID</Label>
                  <Input
                    id={`${config.id}_merchantId`}
                    value={config.merchantId || ''}
                    onChange={(e) => saveConfiguration(config.id, { merchantId: e.target.value })}
                    placeholder="Enter merchant ID..."
                  />
                </div>
              )}
            </>
          )}

          {config.type === 'crypto' && (
            <div className="space-y-2">
              <Label htmlFor={`${config.id}_wallet`}>Wallet Address</Label>
              <Input
                id={`${config.id}_wallet`}
                value={config.apiKey || ''}
                onChange={(e) => saveConfiguration(config.id, { apiKey: e.target.value })}
                placeholder="Enter wallet address..."
              />
            </div>
          )}
        </div>

        <Separator />

        <div className="flex gap-2">
          <Button
            onClick={() => testConnection(config.id)}
            disabled={testing === config.id || !config.apiKey}
            variant="outline"
            className="flex-1"
          >
            {testing === config.id ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
        </div>

        {config.lastTested && (
          <p className="text-xs text-muted-foreground">
            Last tested: {new Date(config.lastTested).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const cardGateways = configs.filter(c => c.type === 'card');
  const mobileGateways = configs.filter(c => c.type === 'mobile');
  const cryptoGateways = configs.filter(c => c.type === 'crypto');
  const bankGateways = configs.filter(c => c.type === 'bank');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Payment Gateway Administration</h1>
          </div>
          <p className="text-purple-200">
            Configure and manage payment gateways for global deposits and SmaiSika conversions
          </p>
        </div>

        <Tabs defaultValue="card" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="card" className="data-[state=active]:bg-purple-600">
              <CreditCard className="h-4 w-4 mr-2" />
              Card Payments
            </TabsTrigger>
            <TabsTrigger value="mobile" className="data-[state=active]:bg-purple-600">
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile Money
            </TabsTrigger>
            <TabsTrigger value="crypto" className="data-[state=active]:bg-purple-600">
              <Bitcoin className="h-4 w-4 mr-2" />
              Cryptocurrency
            </TabsTrigger>
            <TabsTrigger value="bank" className="data-[state=active]:bg-purple-600">
              <Globe className="h-4 w-4 mr-2" />
              Bank Transfer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {cardGateways.map(config => (
                <ConfigCard key={config.id} config={config} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {mobileGateways.map(config => (
                <ConfigCard key={config.id} config={config} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="crypto" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {cryptoGateways.map(config => (
                <ConfigCard key={config.id} config={config} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bank" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {bankGateways.map(config => (
                <ConfigCard key={config.id} config={config} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Gateway Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {configs.filter(c => c.status === 'connected').length}
                </div>
                <div className="text-sm text-muted-foreground">Connected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {configs.filter(c => c.enabled).length}
                </div>
                <div className="text-sm text-muted-foreground">Enabled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {configs.filter(c => c.testMode).length}
                </div>
                <div className="text-sm text-muted-foreground">Test Mode</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {configs.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Gateways</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}