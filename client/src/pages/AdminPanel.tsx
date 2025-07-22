import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import AdminConsole from '@/components/AdminConsole';
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
  BarChart,
  Maximize2,
  Link,
  Unlock,
  Monitor,
  Server,
  Network,
  Code,
  Palette,
  ShieldCheck,
  Gauge,
  Mail,
  Archive,
  Package,
  Smartphone,
  Search,
  FileText,
  CreditCard,
  UserCheck,
  ScrollText,
  Heart,
  Wrench,
  Languages,
  Share2,
  GitBranch,
  PieChart,
  Upload,
  ImageIcon
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
  const [isFullscreen, setIsFullscreen] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingConfig, setEditingConfig] = useState<Partial<AdminConfig>>({});
  const [showPasswords, setShowPasswords] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ logo: boolean; favicon: boolean }>({ logo: false, favicon: false });
  const [uploadedFiles, setUploadedFiles] = useState<{ logo?: string; favicon?: string }>({});

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

  // File upload handlers
  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingFiles(prev => ({ ...prev, [type]: true }));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await apiRequest('POST', '/api/admin/upload-branding', formData);
      const result = await response.json();

      if (response.ok) {
        setUploadedFiles(prev => ({ ...prev, [type]: result.url }));
        handleConfigUpdate('branding', type === 'logo' ? 'logo_url' : 'favicon_url', result.url);
        
        toast({
          title: "Upload Successful",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`,
        });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(prev => ({ ...prev, [type]: false }));
    }
  };

  const removeUploadedFile = (type: 'logo' | 'favicon') => {
    setUploadedFiles(prev => ({ ...prev, [type]: undefined }));
    handleConfigUpdate('branding', type === 'logo' ? 'logo_url' : 'favicon_url', '');
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

  if (isFullscreen) {
    return <AdminConsole />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Control Panel</h1>
            <p className="text-gray-400">Unified management interface for Waides KI</p>
          </div>
          <Button
            onClick={() => setIsFullscreen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Enter Admin Mode
          </Button>
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
          <div className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2">
            <div className="overflow-x-auto">
              <TabsList className="flex w-max min-w-full bg-transparent space-x-1">
                <TabsTrigger value="dashboard" className="flex items-center space-x-2 whitespace-nowrap">
                  <Monitor className="w-4 h-4" />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center space-x-2 whitespace-nowrap">
                  <Settings className="w-4 h-4" />
                  <span>System</span>
                </TabsTrigger>
                <TabsTrigger value="branding" className="flex items-center space-x-2 whitespace-nowrap">
                  <Palette className="w-4 h-4" />
                  <span>Branding</span>
                </TabsTrigger>
                <TabsTrigger value="website-info" className="flex items-center space-x-2 whitespace-nowrap">
                  <Globe className="w-4 h-4" />
                  <span>Website Info</span>
                </TabsTrigger>
                <TabsTrigger value="ui-design" className="flex items-center space-x-2 whitespace-nowrap">
                  <Eye className="w-4 h-4" />
                  <span>UI Design</span>
                </TabsTrigger>
                <TabsTrigger value="trading" className="flex items-center space-x-2 whitespace-nowrap">
                  <TrendingUp className="w-4 h-4" />
                  <span>Trading</span>
                </TabsTrigger>
                <TabsTrigger value="wallet" className="flex items-center space-x-2 whitespace-nowrap">
                  <DollarSign className="w-4 h-4" />
                  <span>Wallet</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center space-x-2 whitespace-nowrap">
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </TabsTrigger>
                <TabsTrigger value="konsai" className="flex items-center space-x-2 whitespace-nowrap">
                  <Brain className="w-4 h-4" />
                  <span>KonsAi</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2 whitespace-nowrap">
                  <Shield className="w-4 h-4" />
                  <span>Security</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center space-x-2 whitespace-nowrap">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center space-x-2 whitespace-nowrap">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="integrations" className="flex items-center space-x-2 whitespace-nowrap">
                  <Zap className="w-4 h-4" />
                  <span>Integrations</span>
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex items-center space-x-2 whitespace-nowrap">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Compliance</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center space-x-2 whitespace-nowrap">
                  <Gauge className="w-4 h-4" />
                  <span>Performance</span>
                </TabsTrigger>
                <TabsTrigger value="database" className="flex items-center space-x-2 whitespace-nowrap">
                  <Database className="w-4 h-4" />
                  <span>Database</span>
                </TabsTrigger>
                <TabsTrigger value="api-management" className="flex items-center space-x-2 whitespace-nowrap">
                  <Code className="w-4 h-4" />
                  <span>API Management</span>
                </TabsTrigger>
                <TabsTrigger value="cdn-cache" className="flex items-center space-x-2 whitespace-nowrap">
                  <Globe className="w-4 h-4" />
                  <span>CDN & Cache</span>
                </TabsTrigger>
                <TabsTrigger value="email-sms" className="flex items-center space-x-2 whitespace-nowrap">
                  <Mail className="w-4 h-4" />
                  <span>Email & SMS</span>
                </TabsTrigger>
                <TabsTrigger value="comprehensive-config" className="flex items-center space-x-2 whitespace-nowrap">
                  <Settings className="w-4 h-4" />
                  <span className="flex items-center gap-1">
                    Manual Config
                    <Badge variant="secondary" className="text-xs">500+</Badge>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="backup-restore" className="flex items-center space-x-2 whitespace-nowrap">
                  <Archive className="w-4 h-4" />
                  <span>Backup & Restore</span>
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="flex items-center space-x-2 whitespace-nowrap">
                  <Activity className="w-4 h-4" />
                  <span>Monitoring</span>
                </TabsTrigger>
                <TabsTrigger value="deployment" className="flex items-center space-x-2 whitespace-nowrap">
                  <Rocket className="w-4 h-4" />
                  <span>Deployment</span>
                </TabsTrigger>
                <TabsTrigger value="themes" className="flex items-center space-x-2 whitespace-nowrap">
                  <Brush className="w-4 h-4" />
                  <span>Themes</span>
                </TabsTrigger>
                <TabsTrigger value="plugins" className="flex items-center space-x-2 whitespace-nowrap">
                  <Package className="w-4 h-4" />
                  <span>Plugins</span>
                </TabsTrigger>
                <TabsTrigger value="workflows" className="flex items-center space-x-2 whitespace-nowrap">
                  <GitBranch className="w-4 h-4" />
                  <span>Workflows</span>
                </TabsTrigger>
                <TabsTrigger value="automation" className="flex items-center space-x-2 whitespace-nowrap">
                  <Bot className="w-4 h-4" />
                  <span>Automation</span>
                </TabsTrigger>
                <TabsTrigger value="ai-models" className="flex items-center space-x-2 whitespace-nowrap">
                  <Cpu className="w-4 h-4" />
                  <span>AI Models</span>
                </TabsTrigger>
                <TabsTrigger value="localization" className="flex items-center space-x-2 whitespace-nowrap">
                  <Languages className="w-4 h-4" />
                  <span>Localization</span>
                </TabsTrigger>
                <TabsTrigger value="social-media" className="flex items-center space-x-2 whitespace-nowrap">
                  <Share2 className="w-4 h-4" />
                  <span>Social Media</span>
                </TabsTrigger>
                <TabsTrigger value="payment-gateways" className="flex items-center space-x-2 whitespace-nowrap">
                  <CreditCard className="w-4 h-4" />
                  <span>Payment Gateways</span>
                </TabsTrigger>
                <TabsTrigger value="mobile-apps" className="flex items-center space-x-2 whitespace-nowrap">
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile Apps</span>
                </TabsTrigger>
                <TabsTrigger value="seo-marketing" className="flex items-center space-x-2 whitespace-nowrap">
                  <Search className="w-4 h-4" />
                  <span>SEO & Marketing</span>
                </TabsTrigger>
                <TabsTrigger value="content-management" className="flex items-center space-x-2 whitespace-nowrap">
                  <FileText className="w-4 h-4" />
                  <span>Content</span>
                </TabsTrigger>
                <TabsTrigger value="user-roles" className="flex items-center space-x-2 whitespace-nowrap">
                  <UserCheck className="w-4 h-4" />
                  <span>User Roles</span>
                </TabsTrigger>
                <TabsTrigger value="audit-logs" className="flex items-center space-x-2 whitespace-nowrap">
                  <ScrollText className="w-4 h-4" />
                  <span>Audit Logs</span>
                </TabsTrigger>
                <TabsTrigger value="system-health" className="flex items-center space-x-2 whitespace-nowrap">
                  <Heart className="w-4 h-4" />
                  <span>System Health</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center space-x-2 whitespace-nowrap">
                  <Wrench className="w-4 h-4" />
                  <span>Advanced</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                    Live Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">$10,247.85</div>
                    <div className="text-gray-400 text-sm">Total Value</div>
                    <div className="text-sm text-green-400">+2.47% (24h)</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Available:</span>
                      <span className="text-blue-400">$2,847.30</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">In Positions:</span>
                      <span className="text-yellow-400">$7,400.55</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Trades:</span>
                      <span className="text-purple-400">4</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Bot className="w-5 h-5 mr-2 text-blue-400" />
                    Trading Engines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <div>
                      <div className="text-white text-sm font-medium">WaidBot</div>
                      <div className="text-gray-400 text-xs">Quantum Flux</div>
                    </div>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <div>
                      <div className="text-white text-sm font-medium">WaidBot Pro</div>
                      <div className="text-gray-400 text-xs">Neural Singularity</div>
                    </div>
                    <Badge className="bg-blue-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <div>
                      <div className="text-white text-sm font-medium">KonsAi Engine</div>
                      <div className="text-gray-400 text-xs">220+ Modules</div>
                    </div>
                    <Badge className="bg-purple-600">Active</Badge>
                  </div>
                  <Button className="w-full bg-gray-600 hover:bg-gray-500 text-white">
                    Configure Engines
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-red-400" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-lg font-bold text-green-400">78%</div>
                      <div className="text-gray-400 text-xs">Win Rate</div>
                    </div>
                    <div className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-lg font-bold text-blue-400">1.8x</div>
                      <div className="text-gray-400 text-xs">Avg Return</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-lg font-bold text-yellow-400">-3.2%</div>
                      <div className="text-gray-400 text-xs">Max DD</div>
                    </div>
                    <div className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-lg font-bold text-purple-400">147</div>
                      <div className="text-gray-400 text-xs">Total Trades</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                        <Label className="text-gray-300">Max Position Size (%)</Label>
                        <Input
                          type="number"
                          value={editingConfig.trading?.max_position_size ?? config?.trading?.max_position_size ?? 25}
                          onChange={(e) => handleConfigUpdate('trading', 'max_position_size', parseFloat(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                          min="5"
                          max="50"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Risk Level</Label>
                        <Select
                          value={editingConfig.trading?.risk_level ?? config?.trading?.risk_level ?? 'moderate'}
                          onValueChange={(value) => handleConfigUpdate('trading', 'risk_level', value)}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
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
                        <Label className="text-gray-300">Stop Loss (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={editingConfig.trading?.stop_loss_percentage ?? config?.trading?.stop_loss_percentage ?? 5.0}
                          onChange={(e) => handleConfigUpdate('trading', 'stop_loss_percentage', parseFloat(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                          min="1"
                          max="20"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Take Profit (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={editingConfig.trading?.take_profit_percentage ?? config?.trading?.take_profit_percentage ?? 10.0}
                          onChange={(e) => handleConfigUpdate('trading', 'take_profit_percentage', parseFloat(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                          min="2"
                          max="50"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Emergency Stop</Label>
                        <Switch
                          checked={editingConfig.trading?.emergency_stop ?? config?.trading?.emergency_stop ?? false}
                          onCheckedChange={(checked) => handleConfigUpdate('trading', 'emergency_stop', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Trading Pairs & Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300">Allowed Trading Pairs</Label>
                      <Textarea
                        value={editingConfig.trading?.allowed_pairs?.join('\n') ?? config?.trading?.allowed_pairs?.join('\n') ?? 'ETH/USDT\nBTC/USDT'}
                        onChange={(e) => handleConfigUpdate('trading', 'allowed_pairs', e.target.value.split('\n').filter(Boolean))}
                        className="bg-gray-700 border-gray-600 text-white h-24"
                        placeholder="ETH/USDT&#10;BTC/USDT&#10;SOL/USDT"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Trading Hours (24h format)</Label>
                      <Textarea
                        value={editingConfig.trading?.trading_hours?.join('\n') ?? config?.trading?.trading_hours?.join('\n') ?? '00:00-23:59'}
                        onChange={(e) => handleConfigUpdate('trading', 'trading_hours', e.target.value.split('\n').filter(Boolean))}
                        className="bg-gray-700 border-gray-600 text-white h-24"
                        placeholder="09:00-17:00&#10;19:00-23:00"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Configuration Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                    Live Balances
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
                      <span className="text-gray-400">USDT</span>
                      <span className="text-green-400 font-bold">$10,000.00</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
                      <span className="text-gray-400">SS (SmaiSika)</span>
                      <span className="text-blue-400 font-bold">247.85 SS</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
                      <span className="text-gray-400">ETH</span>
                      <span className="text-purple-400 font-bold">2.45 ETH</span>
                    </div>
                  </div>
                  <div className="text-center pt-2 border-t border-gray-600">
                    <div className="text-2xl font-bold text-white">$17,892.30</div>
                    <div className="text-gray-400 text-sm">Total Portfolio</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-400" />
                    24h Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-lg font-bold text-green-400">847</div>
                      <div className="text-gray-400 text-xs">Deposits</div>
                    </div>
                    <div className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-lg font-bold text-yellow-400">234</div>
                      <div className="text-gray-400 text-xs">Withdrawals</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-lg font-bold text-purple-400">1,249</div>
                      <div className="text-gray-400 text-xs">Conversions</div>
                    </div>
                    <div className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-lg font-bold text-blue-400">54</div>
                      <div className="text-gray-400 text-xs">Countries</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-red-400" />
                    Security Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Multi-Sig</span>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Biometric Auth</span>
                      <Badge className="bg-green-600">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Cold Storage</span>
                      <Badge className="bg-blue-600">87%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Fraud Detection</span>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                        <Label className="text-gray-300">Minimum Deposit (USD)</Label>
                        <Input
                          type="number"
                          value={editingConfig.wallet?.min_deposit ?? config?.wallet?.min_deposit ?? 10}
                          onChange={(e) => handleConfigUpdate('wallet', 'min_deposit', parseFloat(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                          min="1"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Maximum Deposit (USD)</Label>
                        <Input
                          type="number"
                          value={editingConfig.wallet?.max_deposit ?? config?.wallet?.max_deposit ?? 50000}
                          onChange={(e) => handleConfigUpdate('wallet', 'max_deposit', parseFloat(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                          min="100"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Daily Withdrawal Limit (USD)</Label>
                        <Input
                          type="number"
                          value={editingConfig.wallet?.daily_withdrawal_limit ?? config?.wallet?.daily_withdrawal_limit ?? 10000}
                          onChange={(e) => handleConfigUpdate('wallet', 'daily_withdrawal_limit', parseFloat(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                          min="100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Fee Structure & Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-300">Conversion Fee Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingConfig.wallet?.conversion_fee_rate ?? config?.wallet?.conversion_fee_rate ?? 0.5}
                          onChange={(e) => handleConfigUpdate('wallet', 'conversion_fee_rate', parseFloat(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                          min="0"
                          max="5"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Withdrawal Fee Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingConfig.wallet?.withdrawal_fee_rate ?? config?.wallet?.withdrawal_fee_rate ?? 1.0}
                          onChange={(e) => handleConfigUpdate('wallet', 'withdrawal_fee_rate', parseFloat(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                          min="0"
                          max="10"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Auto Conversion</Label>
                        <Switch
                          checked={editingConfig.wallet?.auto_conversion ?? config?.wallet?.auto_conversion ?? true}
                          onCheckedChange={(checked) => handleConfigUpdate('wallet', 'auto_conversion', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Currency Support & SmaiSika Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300">Supported Currencies</Label>
                      <Textarea
                        value={editingConfig.wallet?.supported_currencies?.join('\n') ?? config?.wallet?.supported_currencies?.join('\n') ?? 'USD\nEUR\nNGN\nGHS\nKES\nZAR'}
                        onChange={(e) => handleConfigUpdate('wallet', 'supported_currencies', e.target.value.split('\n').filter(Boolean))}
                        className="bg-gray-700 border-gray-600 text-white h-24"
                        placeholder="USD&#10;EUR&#10;NGN&#10;GHS"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">SmaiSika Exchange Rate (Fixed 1:1 USD)</Label>
                      <div className="p-3 bg-gray-700 rounded border border-gray-600">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">1 SS = 1 USD</div>
                          <div className="text-gray-400 text-sm mt-1">Fixed Exchange Rate</div>
                          <div className="text-gray-500 text-xs mt-2">This rate is permanently fixed and cannot be changed</div>
                        </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-400" />
                    Live Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">220+</div>
                    <div className="text-gray-400 text-sm">Active Modules</div>
                    <div className="text-sm text-green-400">Transcendent Level</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Kons Modules:</span>
                      <span className="text-blue-400">29</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Deep Core:</span>
                      <span className="text-yellow-400">120+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Futuristic:</span>
                      <span className="text-purple-400">50+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Response Time:</span>
                      <span className="text-green-400">~200ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-400" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-lg font-bold text-green-400">98.7%</div>
                      <div className="text-gray-400 text-xs">Accuracy</div>
                    </div>
                    <div className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-lg font-bold text-blue-400">24/7</div>
                      <div className="text-gray-400 text-xs">Uptime</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-lg font-bold text-yellow-400">15,847</div>
                      <div className="text-gray-400 text-xs">Queries Today</div>
                    </div>
                    <div className="text-center p-2 bg-gray-700 rounded">
                      <div className="text-lg font-bold text-purple-400">847TB</div>
                      <div className="text-gray-400 text-xs">Knowledge Base</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-red-400" />
                    Security Level
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Module Visibility</span>
                      <Badge className="bg-red-600">Hidden</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Query Filtering</span>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Auto-Learning</span>
                      <Badge className="bg-blue-600">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Quantum Processing</span>
                      <Badge className="bg-purple-600">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">KonsAi Intelligence Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Core AI Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-300">Intelligence Level</Label>
                        <Select
                          value={editingConfig.konsai?.intelligence_level ?? config?.konsai?.intelligence_level ?? 'TRANSCENDENT'}
                          onValueChange={(value) => handleConfigUpdate('konsai', 'intelligence_level', value)}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BASIC">Basic (29 Modules)</SelectItem>
                            <SelectItem value="ADVANCED">Advanced (149 Modules)</SelectItem>
                            <SelectItem value="TRANSCENDENT">Transcendent (220+ Modules)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-300">Response Delay (ms)</Label>
                        <Input
                          type="number"
                          value={editingConfig.konsai?.response_delay ?? config?.konsai?.response_delay ?? 200}
                          onChange={(e) => handleConfigUpdate('konsai', 'response_delay', parseInt(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                          min="50"
                          max="5000"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Learning Enabled</Label>
                        <Switch
                          checked={editingConfig.konsai?.learning_enabled ?? config?.konsai?.learning_enabled ?? true}
                          onCheckedChange={(checked) => handleConfigUpdate('konsai', 'learning_enabled', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Auto Evolution</Label>
                        <Switch
                          checked={editingConfig.konsai?.auto_evolution ?? config?.konsai?.auto_evolution ?? true}
                          onCheckedChange={(checked) => handleConfigUpdate('konsai', 'auto_evolution', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Advanced Capabilities</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-gray-300">Personality Mode</Label>
                        <Select
                          value={editingConfig.konsai?.personality_mode ?? config?.konsai?.personality_mode ?? 'spiritual'}
                          onValueChange={(value) => handleConfigUpdate('konsai', 'personality_mode', value)}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spiritual">Spiritual Guide</SelectItem>
                            <SelectItem value="analytical">Analytical Expert</SelectItem>
                            <SelectItem value="creative">Creative Assistant</SelectItem>
                            <SelectItem value="balanced">Balanced Intelligence</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-300">Memory Limit (experiences)</Label>
                        <Input
                          type="number"
                          value={editingConfig.konsai?.memory_limit ?? config?.konsai?.memory_limit ?? 1000}
                          onChange={(e) => handleConfigUpdate('konsai', 'memory_limit', parseInt(e.target.value))}
                          className="bg-gray-700 border-gray-600 text-white"
                          min="100"
                          max="10000"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Voice Synthesis</Label>
                        <Switch
                          checked={editingConfig.konsai?.voice_synthesis ?? config?.konsai?.voice_synthesis ?? true}
                          onCheckedChange={(checked) => handleConfigUpdate('konsai', 'voice_synthesis', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Quantum Processing</Label>
                        <Switch
                          checked={editingConfig.konsai?.quantum_processing ?? config?.konsai?.quantum_processing ?? true}
                          onCheckedChange={(checked) => handleConfigUpdate('konsai', 'quantum_processing', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Security & Privacy Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Module Count Visibility</h4>
                      <p className="text-gray-400 text-sm mb-3">Controls whether users can see internal module structure</p>
                      <Switch
                        checked={editingConfig.konsai?.hide_module_count ?? config?.konsai?.hide_module_count ?? true}
                        onCheckedChange={(checked) => handleConfigUpdate('konsai', 'hide_module_count', checked)}
                      />
                    </div>
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Query Filtering</h4>
                      <p className="text-gray-400 text-sm mb-3">Automatically filters harmful or inappropriate queries</p>
                      <Switch
                        checked={editingConfig.konsai?.query_filtering ?? config?.konsai?.query_filtering ?? true}
                        onCheckedChange={(checked) => handleConfigUpdate('konsai', 'query_filtering', checked)}
                      />
                    </div>
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Context Awareness</h4>
                      <p className="text-gray-400 text-sm mb-3">Maintains conversation context across multiple interactions</p>
                      <Switch
                        checked={editingConfig.konsai?.context_awareness ?? config?.konsai?.context_awareness ?? true}
                        onCheckedChange={(checked) => handleConfigUpdate('konsai', 'context_awareness', checked)}
                      />
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

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Brand Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-gray-300">Application Name</Label>
                    <Input
                      value={editingConfig.branding?.app_name ?? config?.branding?.app_name}
                      onChange={(e) => handleConfigUpdate('branding', 'app_name', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Waides KI"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Logo Upload</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer text-sm"
                        >
                          {uploadingFiles.logo ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          <span>{uploadingFiles.logo ? 'Uploading...' : 'Upload Logo'}</span>
                        </label>
                        {uploadedFiles.logo && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeUploadedFile('logo')}
                            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {uploadedFiles.logo && (
                        <div className="flex items-center space-x-2 text-sm text-green-400">
                          <Image className="w-4 h-4" />
                          <span>Logo uploaded successfully</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Favicon Upload</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'favicon')}
                          className="hidden"
                          id="favicon-upload"
                        />
                        <label
                          htmlFor="favicon-upload"
                          className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md cursor-pointer text-sm"
                        >
                          {uploadingFiles.favicon ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          <span>{uploadingFiles.favicon ? 'Uploading...' : 'Upload Favicon'}</span>
                        </label>
                        {uploadedFiles.favicon && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeUploadedFile('favicon')}
                            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {uploadedFiles.favicon && (
                        <div className="flex items-center space-x-2 text-sm text-green-400">
                          <Image className="w-4 h-4" />
                          <span>Favicon uploaded successfully</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-gray-300">Primary Color</Label>
                    <Input
                      type="color"
                      value={editingConfig.branding?.primary_color ?? config?.branding?.primary_color}
                      onChange={(e) => handleConfigUpdate('branding', 'primary_color', e.target.value)}
                      className="bg-gray-700 border-gray-600 h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Secondary Color</Label>
                    <Input
                      type="color"
                      value={editingConfig.branding?.secondary_color ?? config?.branding?.secondary_color}
                      onChange={(e) => handleConfigUpdate('branding', 'secondary_color', e.target.value)}
                      className="bg-gray-700 border-gray-600 h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Accent Color</Label>
                    <Input
                      type="color"
                      value={editingConfig.branding?.accent_color ?? config?.branding?.accent_color}
                      onChange={(e) => handleConfigUpdate('branding', 'accent_color', e.target.value)}
                      className="bg-gray-700 border-gray-600 h-10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-300">Website Description</Label>
                    <Textarea
                      value={editingConfig.branding?.meta_description ?? config?.branding?.meta_description}
                      onChange={(e) => handleConfigUpdate('branding', 'meta_description', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-24"
                      placeholder="Brief description of your application for search engines..."
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Keywords (SEO)</Label>
                    <Textarea
                      value={editingConfig.branding?.meta_keywords ?? config?.branding?.meta_keywords}
                      onChange={(e) => handleConfigUpdate('branding', 'meta_keywords', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white h-24"
                      placeholder="cryptocurrency, trading, AI, blockchain, ethereum..."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-300">Footer Text</Label>
                    <Input
                      value={editingConfig.branding?.footer_text ?? config?.branding?.footer_text}
                      onChange={(e) => handleConfigUpdate('branding', 'footer_text', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="© 2025 Waides KI. All rights reserved."
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Social Media Image URL</Label>
                    <Input
                      value={editingConfig.branding?.og_image ?? config?.branding?.og_image}
                      onChange={(e) => handleConfigUpdate('branding', 'og_image', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="https://example.com/social-preview.jpg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-300">Font Family</Label>
                    <Select value={editingConfig.branding?.font_family ?? config?.branding?.font_family}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select font family" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                        <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Background Gradient</Label>
                    <Select value={editingConfig.branding?.background_gradient ?? config?.branding?.background_gradient}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select gradient style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="cosmic">Cosmic Blue</SelectItem>
                        <SelectItem value="sunset">Sunset Orange</SelectItem>
                        <SelectItem value="ocean">Ocean Teal</SelectItem>
                        <SelectItem value="forest">Forest Green</SelectItem>
                        <SelectItem value="royal">Royal Purple</SelectItem>
                        <SelectItem value="fire">Fire Red</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Custom CSS</Label>
                  <Textarea
                    value={editingConfig.branding?.custom_css ?? config?.branding?.custom_css}
                    onChange={(e) => handleConfigUpdate('branding', 'custom_css', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white h-32"
                    placeholder="/* Custom CSS styles */
.custom-header { background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); }
.trading-panel { border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Website Info Tab */}
          <TabsContent value="website-info" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Website Information & Description</CardTitle>
                <CardDescription className="text-gray-400">
                  Comprehensive website details, project overview, and technical specifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Overview Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Project Overview</h3>
                  <div>
                    <Label className="text-gray-300">Project Title</Label>
                    <Input
                      value="Waides KI - Advanced AI Trading Platform"
                      className="bg-gray-700 border-gray-600 text-white"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Full Project Description</Label>
                    <Textarea
                      value="Waides KI is a next-generation autonomous wealth management platform that combines AI-driven insights with ethical trading principles. The platform features KonsAi Intelligence Engine with 220+ omniscient modules, SmaiSika global currency system with fixed 1:1 USD exchange rate, comprehensive trading automation, and advanced biometric security. Built with TypeScript/React frontend, Express.js backend, PostgreSQL database, and real-time WebSocket integration."
                      className="bg-gray-700 border-gray-600 text-white h-32"
                      readOnly
                    />
                  </div>
                </div>

                {/* Technical Architecture Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Technical Architecture</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300">Frontend Technologies</Label>
                      <Textarea
                        value="• React 18 with TypeScript
• Vite build system
• TanStack Query for state management
• shadcn/ui component library
• Tailwind CSS styling
• Wouter routing
• WebSocket integration"
                        className="bg-gray-700 border-gray-600 text-white h-32"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Backend Technologies</Label>
                      <Textarea
                        value="• Express.js with TypeScript
• PostgreSQL database
• Drizzle ORM
• WebSocket server
• Service registry architecture
• Real-time data processing
• RESTful API endpoints"
                        className="bg-gray-700 border-gray-600 text-white h-32"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Core Features Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Core Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300">AI & Intelligence Features</Label>
                      <Textarea
                        value="• KonsAi Intelligence Engine (220+ modules)
• Real-time market analysis
• Autonomous trading decisions
• Neural quantum singularity strategies
• Divine quantum flux algorithms
• Predictive analytics
• Risk management AI"
                        className="bg-gray-700 border-gray-600 text-white h-32"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Trading & Financial Features</Label>
                      <Textarea
                        value="• SmaiSika global currency (1 SS = 1 USD)
• Multi-currency wallet system
• 54 African country support
• Real-time ETH/USDT trading
• Automated position management
• Advanced risk controls
• Biometric authentication"
                        className="bg-gray-700 border-gray-600 text-white h-32"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Security & Compliance Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Security & Compliance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300">Security Features</Label>
                      <Textarea
                        value="• Biometric authentication (WebAuthn)
• Multi-signature wallets
• End-to-end encryption
• Session management
• IP whitelisting
• 2FA requirements
• Audit logging"
                        className="bg-gray-700 border-gray-600 text-white h-24"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Compliance Standards</Label>
                      <Textarea
                        value="• GDPR compliance
• KYC/AML procedures
• Financial regulations
• Data protection standards
• Privacy policy enforcement
• Terms of service
• Regional compliance"
                        className="bg-gray-700 border-gray-600 text-white h-24"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Deployment & Infrastructure Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Deployment & Infrastructure</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300">Deployment Platform</Label>
                      <Input
                        value="Replit with PostgreSQL Database"
                        className="bg-gray-700 border-gray-600 text-white"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Runtime Environment</Label>
                      <Input
                        value="Node.js 20+ with Express.js Server"
                        className="bg-gray-700 border-gray-600 text-white"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300">Database</Label>
                      <Input
                        value="PostgreSQL 16 with 20+ Tables"
                        className="bg-gray-700 border-gray-600 text-white"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">External APIs</Label>
                      <Input
                        value="CoinGecko, Binance WebSocket, OpenAI"
                        className="bg-gray-700 border-gray-600 text-white"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Development Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Development Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-gray-300">Development Commands</Label>
                      <Textarea
                        value="• npm run dev - Start development server
• npm run build - Build production assets
• npm run start - Start production server
• npm run db:push - Deploy schema changes"
                        className="bg-gray-700 border-gray-600 text-white h-24"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Key Dependencies</Label>
                      <Textarea
                        value="• @anthropic-ai/sdk - AI integration
• @stripe/stripe-js - Payment processing
• drizzle-orm - Database ORM
• ws - WebSocket server
• bcrypt - Password hashing"
                        className="bg-gray-700 border-gray-600 text-white h-24"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* UI Design Tab */}
          <TabsContent value="ui-design" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Interface Customization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-300">Theme Mode</Label>
                    <Select value={editingConfig.ui_customization?.theme_mode ?? config?.ui_customization?.theme_mode}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark Mode</SelectItem>
                        <SelectItem value="light">Light Mode</SelectItem>
                        <SelectItem value="auto">Auto (System)</SelectItem>
                        <SelectItem value="cosmic">Cosmic Theme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Navigation Type</Label>
                    <Select value={editingConfig.ui_customization?.navigation_type ?? config?.ui_customization?.navigation_type}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="horizontal">Horizontal</SelectItem>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                        <SelectItem value="tabs">Tabs</SelectItem>
                        <SelectItem value="floating">Floating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-300">Animation Speed</Label>
                    <Select value={editingConfig.ui_customization?.animation_speed ?? config?.ui_customization?.animation_speed}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Disabled</SelectItem>
                        <SelectItem value="slow">Slow</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="fast">Fast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Card Style</Label>
                    <Select value={editingConfig.ui_customization?.card_style ?? config?.ui_customization?.card_style}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="glass">Glass</SelectItem>
                        <SelectItem value="neon">Neon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Email Notifications</Label>
                    <Switch
                      checked={editingConfig.notifications?.email_enabled ?? config?.notifications?.email_enabled}
                      onCheckedChange={(checked) => handleConfigUpdate('notifications', 'email_enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">SMS Notifications</Label>
                    <Switch
                      checked={editingConfig.notifications?.sms_enabled ?? config?.notifications?.sms_enabled}
                      onCheckedChange={(checked) => handleConfigUpdate('notifications', 'sms_enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Push Notifications</Label>
                    <Switch
                      checked={editingConfig.notifications?.push_enabled ?? config?.notifications?.push_enabled}
                      onCheckedChange={(checked) => handleConfigUpdate('notifications', 'push_enabled', checked)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Alert Thresholds</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    <div>
                      <Label className="text-gray-400 text-xs">Price Change (%)</Label>
                      <Input
                        type="number"
                        value={editingConfig.notifications?.alert_thresholds?.price_change ?? config?.notifications?.alert_thresholds?.price_change}
                        onChange={(e) => handleConfigUpdate('notifications', 'alert_thresholds', { 
                          ...(editingConfig.notifications?.alert_thresholds ?? config?.notifications?.alert_thresholds), 
                          price_change: parseFloat(e.target.value) 
                        })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-xs">Volume Spike (%)</Label>
                      <Input
                        type="number"
                        value={editingConfig.notifications?.alert_thresholds?.volume_spike ?? config?.notifications?.alert_thresholds?.volume_spike}
                        onChange={(e) => handleConfigUpdate('notifications', 'alert_thresholds', { 
                          ...(editingConfig.notifications?.alert_thresholds ?? config?.notifications?.alert_thresholds), 
                          volume_spike: parseFloat(e.target.value) 
                        })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-xs">Balance Low ($)</Label>
                      <Input
                        type="number"
                        value={editingConfig.notifications?.alert_thresholds?.balance_low ?? config?.notifications?.alert_thresholds?.balance_low}
                        onChange={(e) => handleConfigUpdate('notifications', 'alert_thresholds', { 
                          ...(editingConfig.notifications?.alert_thresholds ?? config?.notifications?.alert_thresholds), 
                          balance_low: parseFloat(e.target.value) 
                        })}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Analytics & Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-300">Google Analytics ID</Label>
                    <Input
                      value={editingConfig.analytics?.google_analytics_id ?? config?.analytics?.google_analytics_id}
                      onChange={(e) => handleConfigUpdate('analytics', 'google_analytics_id', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="GA-XXXXXXXXX-X"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Mixpanel Token</Label>
                    <Input
                      value={editingConfig.analytics?.mixpanel_token ?? config?.analytics?.mixpanel_token}
                      onChange={(e) => handleConfigUpdate('analytics', 'mixpanel_token', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Your Mixpanel token"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">User Tracking</Label>
                    <Switch
                      checked={editingConfig.analytics?.user_behavior_tracking ?? config?.analytics?.user_behavior_tracking}
                      onCheckedChange={(checked) => handleConfigUpdate('analytics', 'user_behavior_tracking', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">Performance</Label>
                    <Switch
                      checked={editingConfig.analytics?.performance_monitoring ?? config?.analytics?.performance_monitoring}
                      onCheckedChange={(checked) => handleConfigUpdate('analytics', 'performance_monitoring', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">A/B Testing</Label>
                    <Switch
                      checked={editingConfig.analytics?.a_b_testing ?? config?.analytics?.a_b_testing}
                      onCheckedChange={(checked) => handleConfigUpdate('analytics', 'a_b_testing', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">Real-time</Label>
                    <Switch
                      checked={editingConfig.analytics?.real_time_dashboard ?? config?.analytics?.real_time_dashboard}
                      onCheckedChange={(checked) => handleConfigUpdate('analytics', 'real_time_dashboard', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Performance Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Label className="text-gray-300">Cache TTL (minutes)</Label>
                    <Input
                      type="number"
                      value={editingConfig.system?.cache_ttl ?? config?.system?.cache_ttl}
                      onChange={(e) => handleConfigUpdate('system', 'cache_ttl', parseInt(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">Auto Scaling</Label>
                    <Switch
                      checked={editingConfig.system?.auto_scaling ?? config?.system?.auto_scaling}
                      onCheckedChange={(checked) => handleConfigUpdate('system', 'auto_scaling', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">Load Balancing</Label>
                    <Switch
                      checked={editingConfig.system?.load_balancing ?? config?.system?.load_balancing}
                      onCheckedChange={(checked) => handleConfigUpdate('system', 'load_balancing', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">CDN</Label>
                    <Switch
                      checked={editingConfig.system?.cdn_enabled ?? config?.system?.cdn_enabled}
                      onCheckedChange={(checked) => handleConfigUpdate('system', 'cdn_enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">Compression</Label>
                    <Switch
                      checked={editingConfig.system?.compression_enabled ?? config?.system?.compression_enabled}
                      onCheckedChange={(checked) => handleConfigUpdate('system', 'compression_enabled', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Advanced Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-yellow-600 bg-yellow-900/20">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-200">
                    Advanced settings require technical knowledge. Changes may affect system stability.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-300">KonsAi Intelligence Level</Label>
                    <Select value={editingConfig.konsai?.intelligence_level ?? config?.konsai?.intelligence_level}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (50 modules)</SelectItem>
                        <SelectItem value="enhanced">Enhanced (120 modules)</SelectItem>
                        <SelectItem value="omniscient">Omniscient (220+ modules)</SelectItem>
                        <SelectItem value="transcendent">Transcendent (∞ modules)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Module Count</Label>
                    <Input
                      type="number"
                      value={editingConfig.konsai?.module_count ?? config?.konsai?.module_count}
                      onChange={(e) => handleConfigUpdate('konsai', 'module_count', parseInt(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                      disabled
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">Quantum Processing</Label>
                    <Switch
                      checked={editingConfig.konsai?.quantum_processing ?? config?.konsai?.quantum_processing}
                      onCheckedChange={(checked) => handleConfigUpdate('konsai', 'quantum_processing', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">Auto Evolution</Label>
                    <Switch
                      checked={editingConfig.konsai?.auto_evolution ?? config?.konsai?.auto_evolution}
                      onCheckedChange={(checked) => handleConfigUpdate('konsai', 'auto_evolution', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">Voice Synthesis</Label>
                    <Switch
                      checked={editingConfig.konsai?.voice_synthesis ?? config?.konsai?.voice_synthesis}
                      onCheckedChange={(checked) => handleConfigUpdate('konsai', 'voice_synthesis', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Third-Party Integrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">Binance API</Label>
                    <Switch
                      checked={editingConfig.integrations?.binance_api ?? config?.integrations?.binance_api}
                      onCheckedChange={(checked) => handleConfigUpdate('integrations', 'binance_api', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">Coinbase API</Label>
                    <Switch
                      checked={editingConfig.integrations?.coinbase_api ?? config?.integrations?.coinbase_api}
                      onCheckedChange={(checked) => handleConfigUpdate('integrations', 'coinbase_api', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">Stripe Payments</Label>
                    <Switch
                      checked={editingConfig.integrations?.stripe_payments ?? config?.integrations?.stripe_payments}
                      onCheckedChange={(checked) => handleConfigUpdate('integrations', 'stripe_payments', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-sm">PayPal</Label>
                    <Switch
                      checked={editingConfig.integrations?.paypal_payments ?? config?.integrations?.paypal_payments}
                      onCheckedChange={(checked) => handleConfigUpdate('integrations', 'paypal_payments', checked)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-300">Cloud Storage Provider</Label>
                    <Select value={editingConfig.integrations?.cloud_storage ?? config?.integrations?.cloud_storage}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws">Amazon S3</SelectItem>
                        <SelectItem value="gcp">Google Cloud Storage</SelectItem>
                        <SelectItem value="azure">Azure Blob Storage</SelectItem>
                        <SelectItem value="local">Local Storage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">CDN Provider</Label>
                    <Select value={editingConfig.integrations?.cdn_provider ?? config?.integrations?.cdn_provider}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cloudflare">Cloudflare</SelectItem>
                        <SelectItem value="aws">AWS CloudFront</SelectItem>
                        <SelectItem value="fastly">Fastly</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Database Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">20</div>
                    <div className="text-gray-400">Tables</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">497</div>
                    <div className="text-gray-400">Total Records</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">2.4 MB</div>
                    <div className="text-gray-400">Database Size</div>
                  </div>
                </div>
                <Separator className="bg-gray-600" />
                <div>
                  <Label className="text-gray-300">Database Actions</Label>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      <Archive className="w-4 h-4 mr-2" />
                      Backup Now
                    </Button>
                    <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Optimize
                    </Button>
                    <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      <Activity className="w-4 h-4 mr-2" />
                      Health Check
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">AI Automation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">WaidBot Automation</Label>
                    <Switch
                      checked={editingConfig.trading?.auto_trading_enabled ?? config?.trading?.auto_trading_enabled}
                      onCheckedChange={(checked) => handleConfigUpdate('trading', 'auto_trading_enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">KonsAi Auto Evolution</Label>
                    <Switch
                      checked={editingConfig.konsai?.auto_evolution ?? config?.konsai?.auto_evolution}
                      onCheckedChange={(checked) => handleConfigUpdate('konsai', 'auto_evolution', checked)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-300">AI Response Delay (ms)</Label>
                    <Input
                      type="number"
                      value={editingConfig.konsai?.response_delay ?? config?.konsai?.response_delay}
                      onChange={(e) => handleConfigUpdate('konsai', 'response_delay', parseInt(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Memory Limit (MB)</Label>
                    <Input
                      type="number"
                      value={editingConfig.konsai?.memory_limit ?? config?.konsai?.memory_limit}
                      onChange={(e) => handleConfigUpdate('konsai', 'memory_limit', parseInt(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comprehensive Configuration Tab */}
          <TabsContent value="comprehensive-config" className="space-y-6">
            <AdminConsole />
          </TabsContent>

          {/* Placeholder tabs for all remaining tabs */}
          {[
            'compliance', 'api-management', 'cdn-cache', 'email-sms', 'backup-restore', 
            'monitoring', 'deployment', 'themes', 'plugins', 'workflows', 'ai-models',
            'localization', 'social-media', 'payment-gateways', 'mobile-apps', 'seo-marketing',
            'content-management', 'user-roles', 'audit-logs', 'system-health'
          ].map((tabId) => (
            <TabsContent key={tabId} value={tabId} className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    {tabId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Settings className="w-12 h-12 mx-auto mb-2" />
                      Configuration Panel
                    </div>
                    <p className="text-gray-500">
                      Advanced {tabId.split('-').join(' ')} settings and customization options will be available here.
                    </p>
                    <Button variant="outline" className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-700">
                      Configure Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}