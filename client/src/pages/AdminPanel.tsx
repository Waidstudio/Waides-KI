import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Settings,
  Database,
  Users,
  DollarSign,
  Bot,
  Shield,
  Globe,
  Activity,
  RefreshCw,
  Save,
  Trash2,
  Plus,
  Edit,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Zap,
  Brain,
  Lock,
  Unlock,
  Monitor,
  Server,
  Network,
  Code
} from 'lucide-react';

interface AdminConfig {
  system: {
    maintenance_mode: boolean;
    debug_logging: boolean;
    rate_limiting: boolean;
    max_requests_per_minute: number;
    api_timeout: number;
    cache_ttl: number;
    auto_scaling: boolean;
    load_balancing: boolean;
    cdn_enabled: boolean;
    compression_enabled: boolean;
    ssl_force: boolean;
    backup_frequency: string;
    monitoring_level: string;
  };
  branding: {
    app_name: string;
    logo_url: string;
    favicon_url: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    font_family: string;
    background_gradient: string;
    custom_css: string;
    footer_text: string;
    meta_description: string;
    meta_keywords: string;
    og_image: string;
  };
  ui_customization: {
    theme_mode: string;
    sidebar_style: string;
    navigation_type: string;
    card_style: string;
    animation_speed: string;
    border_radius: string;
    shadow_intensity: string;
    typography_scale: string;
    button_style: string;
    form_style: string;
    table_style: string;
    chart_theme: string;
  };
  trading: {
    auto_trading_enabled: boolean;
    max_position_size: number;
    risk_level: string;
    stop_loss_percentage: number;
    take_profit_percentage: number;
    allowed_pairs: string[];
    trading_hours: string[];
    max_daily_trades: number;
    slippage_tolerance: number;
    min_trade_amount: number;
    max_leverage: number;
    margin_requirements: number;
    portfolio_diversification: boolean;
    risk_management_ai: boolean;
  };
  wallet: {
    min_deposit: number;
    max_deposit: number;
    conversion_fee_rate: number;
    withdrawal_fee_rate: number;
    daily_withdrawal_limit: number;
    supported_currencies: string[];
    instant_withdrawal: boolean;
    multi_signature: boolean;
    cold_storage_percentage: number;
    insurance_coverage: boolean;
    compliance_level: string;
    kyc_requirements: string[];
    aml_monitoring: boolean;
  };
  security: {
    session_timeout: number;
    max_login_attempts: number;
    require_2fa: boolean;
    password_min_length: number;
    api_key_expiry_days: number;
    ip_whitelist: string[];
    geo_blocking: boolean;
    encryption_level: string;
    audit_logging: boolean;
    penetration_testing: boolean;
    vulnerability_scanning: boolean;
    backup_encryption: boolean;
    data_retention_days: number;
  };
  konsai: {
    intelligence_level: string;
    response_delay: number;
    learning_enabled: boolean;
    memory_limit: number;
    auto_evolution: boolean;
    module_count: number;
    personality_mode: string;
    voice_synthesis: boolean;
    emotion_detection: boolean;
    context_awareness: boolean;
    multilingual_support: boolean;
    custom_knowledge_base: boolean;
    api_integration_limit: number;
    quantum_processing: boolean;
  };
  notifications: {
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
    webhook_url: string;
    slack_integration: boolean;
    discord_integration: boolean;
    telegram_integration: boolean;
    alert_thresholds: {
      price_change: number;
      volume_spike: number;
      balance_low: number;
      system_load: number;
      error_rate: number;
      security_breach: number;
    };
    notification_frequency: string;
    quiet_hours: string[];
  };
  analytics: {
    google_analytics_id: string;
    mixpanel_token: string;
    hotjar_id: string;
    custom_tracking: boolean;
    data_export: boolean;
    real_time_dashboard: boolean;
    user_behavior_tracking: boolean;
    performance_monitoring: boolean;
    conversion_tracking: boolean;
    a_b_testing: boolean;
  };
  integrations: {
    binance_api: boolean;
    coinbase_api: boolean;
    kraken_api: boolean;
    stripe_payments: boolean;
    paypal_payments: boolean;
    bank_transfers: boolean;
    crypto_payments: boolean;
    ai_services: string[];
    cloud_storage: string;
    cdn_provider: string;
    email_service: string;
    sms_provider: string;
  };
  compliance: {
    gdpr_enabled: boolean;
    ccpa_enabled: boolean;
    sox_compliance: boolean;
    iso_27001: boolean;
    pci_dss: boolean;
    data_localization: string;
    privacy_policy_url: string;
    terms_of_service_url: string;
    cookie_consent: boolean;
    data_processing_agreement: boolean;
  };
}

interface SystemStatus {
  uptime: string;
  memory_usage: number;
  cpu_usage: number;
  active_users: number;
  total_transactions: number;
  error_rate: number;
  api_calls_today: number;
  database_size: string;
  cache_hit_rate: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  last_login: string;
  balance: number;
  created_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  gateway: string;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingConfig, setEditingConfig] = useState<Partial<AdminConfig>>({});
  const [showPasswords, setShowPasswords] = useState(false);

  // Fetch admin configuration
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['/api/admin/config'],
    queryFn: () => apiRequest('GET', '/api/admin/config').then(res => res.json()),
  });

  // Fetch system status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/admin/status'],
    queryFn: () => apiRequest('GET', '/api/admin/status').then(res => res.json()),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: () => apiRequest('GET', '/api/admin/users').then(res => res.json()),
  });

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/admin/transactions'],
    queryFn: () => apiRequest('GET', '/api/admin/transactions').then(res => res.json()),
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<AdminConfig>) => {
      return await apiRequest('POST', '/api/admin/config', newConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/config'] });
      toast({
        title: "Configuration Updated",
        description: "Settings have been saved successfully",
      });
      setEditingConfig({});
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update configuration",
        variant: "destructive",
      });
    }
  });

  // User management mutations
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      return await apiRequest('PATCH', `/api/admin/users/${userId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Updated",
        description: "User settings have been updated",
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Deleted",
        description: "User has been removed from the system",
      });
    }
  });

  // System control mutations
  const systemControlMutation = useMutation({
    mutationFn: async (action: string) => {
      return await apiRequest('POST', '/api/admin/system/control', { action });
    },
    onSuccess: (data, action) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/status'] });
      toast({
        title: "System Action Complete",
        description: `System ${action} executed successfully`,
      });
    }
  });

  const handleConfigUpdate = (section: keyof AdminConfig, field: string, value: any) => {
    setEditingConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const saveConfig = () => {
    if (Object.keys(editingConfig).length > 0) {
      updateConfigMutation.mutate(editingConfig);
    }
  };

  const getStatusColor = (value: number, type: 'usage' | 'rate' | 'count') => {
    if (type === 'usage') {
      if (value > 80) return 'text-red-400';
      if (value > 60) return 'text-yellow-400';
      return 'text-green-400';
    }
    if (type === 'rate') {
      if (value > 5) return 'text-red-400';
      if (value > 1) return 'text-yellow-400';
      return 'text-green-400';
    }
    return 'text-blue-400';
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (configLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading admin panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Control Panel</h1>
            <p className="text-gray-400">Unified management interface for Waides KI</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={status?.maintenance_mode ? "destructive" : "secondary"}>
              {status?.maintenance_mode ? "Maintenance Mode" : "Live"}
            </Badge>
            <Button
              onClick={saveConfig}
              disabled={Object.keys(editingConfig).length === 0 || updateConfigMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {updateConfigMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-8 bg-gray-800 border-gray-700">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>System</span>
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Trading</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="konsai" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>KonsAi</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Logs</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-400" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Uptime:</span>
                      <span className="text-green-400">{status?.uptime || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Memory:</span>
                      <span className={getStatusColor(status?.memory_usage || 0, 'usage')}>
                        {status?.memory_usage || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">CPU:</span>
                      <span className={getStatusColor(status?.cpu_usage || 0, 'usage')}>
                        {status?.cpu_usage || 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-400" />
                    User Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Users:</span>
                      <span className="text-blue-400">{status?.active_users || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Users:</span>
                      <span className="text-blue-400">{users?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">API Calls Today:</span>
                      <span className="text-blue-400">{status?.api_calls_today || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
                    Financial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Transactions:</span>
                      <span className="text-yellow-400">{status?.total_transactions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Volume:</span>
                      <span className="text-yellow-400">
                        {formatCurrency(transactions?.reduce((sum: number, t: Transaction) => sum + t.amount, 0) || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Error Rate:</span>
                      <span className={getStatusColor(status?.error_rate || 0, 'rate')}>
                        {status?.error_rate || 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-400" />
                    KonsAi Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Intelligence:</span>
                      <span className="text-purple-400">{config?.konsai?.intelligence_level || 'TRANSCENDENT'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Modules:</span>
                      <span className="text-purple-400">{config?.konsai?.module_count || 220}+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Learning:</span>
                      <span className="text-purple-400">
                        {config?.konsai?.learning_enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    {transactions?.slice(0, 10).map((transaction: Transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                        <div>
                          <p className="text-white font-medium">{transaction.type.toUpperCase()}</p>
                          <p className="text-gray-400 text-sm">{formatDate(transaction.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-medium">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">System Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => systemControlMutation.mutate('restart')}
                      variant="outline"
                      className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restart System
                    </Button>
                    <Button
                      onClick={() => systemControlMutation.mutate('maintenance')}
                      variant="outline"
                      className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Maintenance Mode
                    </Button>
                    <Button
                      onClick={() => systemControlMutation.mutate('clear_cache')}
                      variant="outline"
                      className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Clear Cache
                    </Button>
                    <Button
                      onClick={() => systemControlMutation.mutate('backup')}
                      variant="outline"
                      className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Create Backup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Configuration Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Core Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Maintenance Mode</Label>
                        <Switch
                          checked={editingConfig.system?.maintenance_mode ?? config?.system?.maintenance_mode}
                          onCheckedChange={(checked) => handleConfigUpdate('system', 'maintenance_mode', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Debug Logging</Label>
                        <Switch
                          checked={editingConfig.system?.debug_logging ?? config?.system?.debug_logging}
                          onCheckedChange={(checked) => handleConfigUpdate('system', 'debug_logging', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Rate Limiting</Label>
                        <Switch
                          checked={editingConfig.system?.rate_limiting ?? config?.system?.rate_limiting}
                          onCheckedChange={(checked) => handleConfigUpdate('system', 'rate_limiting', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Performance Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-300">Max Requests/Minute</Label>
                        <Input
                          type="number"
                          value={editingConfig.system?.max_requests_per_minute ?? config?.system?.max_requests_per_minute}
                          onChange={(e) => handleConfigUpdate('system', 'max_requests_per_minute', parseInt(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">API Timeout (seconds)</Label>
                        <Input
                          type="number"
                          value={editingConfig.system?.api_timeout ?? config?.system?.api_timeout}
                          onChange={(e) => handleConfigUpdate('system', 'api_timeout', parseInt(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Cache TTL (seconds)</Label>
                        <Input
                          type="number"
                          value={editingConfig.system?.cache_ttl ?? config?.system?.cache_ttl}
                          onChange={(e) => handleConfigUpdate('system', 'cache_ttl', parseInt(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Configuration Tab */}
          <TabsContent value="trading" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Trading Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Trading Controls</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Auto Trading Enabled</Label>
                        <Switch
                          checked={editingConfig.trading?.auto_trading_enabled ?? config?.trading?.auto_trading_enabled}
                          onCheckedChange={(checked) => handleConfigUpdate('trading', 'auto_trading_enabled', checked)}
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Max Position Size</Label>
                        <Input
                          type="number"
                          value={editingConfig.trading?.max_position_size ?? config?.trading?.max_position_size}
                          onChange={(e) => handleConfigUpdate('trading', 'max_position_size', parseFloat(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Risk Level</Label>
                        <Select
                          value={editingConfig.trading?.risk_level ?? config?.trading?.risk_level}
                          onValueChange={(value) => handleConfigUpdate('trading', 'risk_level', value)}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conservative">Conservative</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="aggressive">Aggressive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Risk Management</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-300">Stop Loss %</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={editingConfig.trading?.stop_loss_percentage ?? config?.trading?.stop_loss_percentage}
                          onChange={(e) => handleConfigUpdate('trading', 'stop_loss_percentage', parseFloat(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Take Profit %</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={editingConfig.trading?.take_profit_percentage ?? config?.trading?.take_profit_percentage}
                          onChange={(e) => handleConfigUpdate('trading', 'take_profit_percentage', parseFloat(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Allowed Trading Pairs</Label>
                        <Textarea
                          value={editingConfig.trading?.allowed_pairs?.join('\n') ?? config?.trading?.allowed_pairs?.join('\n')}
                          onChange={(e) => handleConfigUpdate('trading', 'allowed_pairs', e.target.value.split('\n').filter(Boolean))}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="ETH/USDT&#10;BTC/USDT&#10;SOL/USDT"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Configuration Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Wallet Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Deposit/Withdrawal Limits</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-300">Minimum Deposit</Label>
                        <Input
                          type="number"
                          value={editingConfig.wallet?.min_deposit ?? config?.wallet?.min_deposit}
                          onChange={(e) => handleConfigUpdate('wallet', 'min_deposit', parseFloat(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Maximum Deposit</Label>
                        <Input
                          type="number"
                          value={editingConfig.wallet?.max_deposit ?? config?.wallet?.max_deposit}
                          onChange={(e) => handleConfigUpdate('wallet', 'max_deposit', parseFloat(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Daily Withdrawal Limit</Label>
                        <Input
                          type="number"
                          value={editingConfig.wallet?.daily_withdrawal_limit ?? config?.wallet?.daily_withdrawal_limit}
                          onChange={(e) => handleConfigUpdate('wallet', 'daily_withdrawal_limit', parseFloat(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Fee Structure</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-300">Conversion Fee Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingConfig.wallet?.conversion_fee_rate ?? config?.wallet?.conversion_fee_rate}
                          onChange={(e) => handleConfigUpdate('wallet', 'conversion_fee_rate', parseFloat(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Withdrawal Fee Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingConfig.wallet?.withdrawal_fee_rate ?? config?.wallet?.withdrawal_fee_rate}
                          onChange={(e) => handleConfigUpdate('wallet', 'withdrawal_fee_rate', parseFloat(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Supported Currencies</Label>
                        <Textarea
                          value={editingConfig.wallet?.supported_currencies?.join('\n') ?? config?.wallet?.supported_currencies?.join('\n')}
                          onChange={(e) => handleConfigUpdate('wallet', 'supported_currencies', e.target.value.split('\n').filter(Boolean))}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="USD&#10;EUR&#10;NGN&#10;GHS"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {users?.map((user: User) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-white font-medium">{user.username}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                            <p className="text-gray-400 text-sm">Last login: {formatDate(user.last_login)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-yellow-400 font-medium">{formatCurrency(user.balance)}</p>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                            <Badge variant="outline" className="ml-2">
                              {user.role}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserMutation.mutate({ 
                                userId: user.id, 
                                updates: { status: user.status === 'active' ? 'suspended' : 'active' }
                              })}
                            >
                              {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteUserMutation.mutate(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KonsAi Configuration Tab */}
          <TabsContent value="konsai" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">KonsAi Intelligence Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">AI Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-300">Intelligence Level</Label>
                        <Select
                          value={editingConfig.konsai?.intelligence_level ?? config?.konsai?.intelligence_level}
                          onValueChange={(value) => handleConfigUpdate('konsai', 'intelligence_level', value)}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BASIC">Basic</SelectItem>
                            <SelectItem value="ADVANCED">Advanced</SelectItem>
                            <SelectItem value="TRANSCENDENT">Transcendent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-300">Response Delay (ms)</Label>
                        <Input
                          type="number"
                          value={editingConfig.konsai?.response_delay ?? config?.konsai?.response_delay}
                          onChange={(e) => handleConfigUpdate('konsai', 'response_delay', parseInt(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Learning Enabled</Label>
                        <Switch
                          checked={editingConfig.konsai?.learning_enabled ?? config?.konsai?.learning_enabled}
                          onCheckedChange={(checked) => handleConfigUpdate('konsai', 'learning_enabled', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Advanced Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-300">Memory Limit (MB)</Label>
                        <Input
                          type="number"
                          value={editingConfig.konsai?.memory_limit ?? config?.konsai?.memory_limit}
                          onChange={(e) => handleConfigUpdate('konsai', 'memory_limit', parseInt(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Auto Evolution</Label>
                        <Switch
                          checked={editingConfig.konsai?.auto_evolution ?? config?.konsai?.auto_evolution}
                          onCheckedChange={(checked) => handleConfigUpdate('konsai', 'auto_evolution', checked)}
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Active Modules</Label>
                        <Input
                          type="number"
                          value={editingConfig.konsai?.module_count ?? config?.konsai?.module_count}
                          onChange={(e) => handleConfigUpdate('konsai', 'module_count', parseInt(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Configuration Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Security Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Authentication</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-300">Session Timeout (minutes)</Label>
                        <Input
                          type="number"
                          value={editingConfig.security?.session_timeout ?? config?.security?.session_timeout}
                          onChange={(e) => handleConfigUpdate('security', 'session_timeout', parseInt(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Max Login Attempts</Label>
                        <Input
                          type="number"
                          value={editingConfig.security?.max_login_attempts ?? config?.security?.max_login_attempts}
                          onChange={(e) => handleConfigUpdate('security', 'max_login_attempts', parseInt(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Require 2FA</Label>
                        <Switch
                          checked={editingConfig.security?.require_2fa ?? config?.security?.require_2fa}
                          onCheckedChange={(checked) => handleConfigUpdate('security', 'require_2fa', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Password Policy</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-300">Minimum Password Length</Label>
                        <Input
                          type="number"
                          value={editingConfig.security?.password_min_length ?? config?.security?.password_min_length}
                          onChange={(e) => handleConfigUpdate('security', 'password_min_length', parseInt(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">API Key Expiry (days)</Label>
                        <Input
                          type="number"
                          value={editingConfig.security?.api_key_expiry_days ?? config?.security?.api_key_expiry_days}
                          onChange={(e) => handleConfigUpdate('security', 'api_key_expiry_days', parseInt(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">System Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2 font-mono text-sm">
                    <div className="text-green-400">[INFO] System started successfully</div>
                    <div className="text-blue-400">[DEBUG] KonsAi Intelligence Engine loaded - 220+ modules active</div>
                    <div className="text-yellow-400">[WARN] High memory usage detected: 78%</div>
                    <div className="text-green-400">[INFO] User authentication successful: user_123</div>
                    <div className="text-blue-400">[DEBUG] Currency conversion completed: 100 NGN → 0.057 SS</div>
                    <div className="text-green-400">[INFO] Wallet transaction processed: deposit_456</div>
                    <div className="text-red-400">[ERROR] API rate limit exceeded for endpoint /api/wallet/balance</div>
                    <div className="text-blue-400">[DEBUG] Cache hit rate: 94.2%</div>
                    <div className="text-green-400">[INFO] Backup completed successfully</div>
                    <div className="text-yellow-400">[WARN] SSL certificate expires in 30 days</div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}