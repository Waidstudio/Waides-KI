import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { AdminSystemHealth, AdminConfigData } from '@/types/componentTypes';
import { 
  Shield, BarChart3, Users, DollarSign, Brain, Settings, 
  TrendingUp, Bell, Database, Activity, Zap, Rocket, 
  RefreshCw, Save, X, Link, Brush, Cpu, Bot, Menu,
  Download, Upload, RotateCcw, Check, AlertTriangle, Search
} from "lucide-react";

// Helper functions for configuration management
const getSettingDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    // System Settings
    maintenance_mode: "Enable maintenance mode to restrict access",
    debug_logging: "Enable detailed debug logging for troubleshooting",
    rate_limiting: "Enable API rate limiting to prevent abuse",
    max_requests_per_minute: "Maximum API requests allowed per minute",
    api_timeout: "API request timeout in milliseconds",
    cache_ttl: "Cache time-to-live in seconds",
    
    // Trading Settings
    auto_trading_enabled: "Enable autonomous trading functionality",
    max_position_size: "Maximum position size in USDT",
    risk_level: "Trading risk tolerance level",
    stop_loss_percentage: "Default stop loss percentage",
    take_profit_percentage: "Default take profit percentage",
    
    // Wallet Settings
    min_deposit: "Minimum deposit amount",
    max_deposit: "Maximum deposit amount",
    conversion_fee_rate: "Currency conversion fee percentage",
    instant_withdrawal: "Enable instant withdrawals",
    
    // KonsAi Settings
    intelligence_level: "AI intelligence complexity level",
    spiritual_mode: "Enable spiritual trading guidance",
    divine_guidance_level: "Level of divine guidance integration",
    personality_type: "AI personality type preference",
    
    // Security Settings
    two_factor_auth: "Require two-factor authentication",
    biometric_auth: "Enable biometric authentication",
    encryption_level: "Data encryption strength level",
    session_security: "Enhanced session security protocols",
    
    // UI Settings
    theme_preference: "Application theme preference",
    display_mode: "Display mode complexity level",
    language: "Application language setting",
    currency_display: "Preferred currency display format",
    
    // Performance Settings
    background_processing: "Enable background processing",
    real_time_updates: "Real-time data update frequency",
    memory_optimization: "Memory usage optimization level",
    
    // Notifications Settings
    email_alerts: "Email notification alerts",
    sms_alerts: "SMS notification alerts",
    push_notifications: "Browser push notifications",
    alert_threshold: "Alert threshold sensitivity"
  };
  
  return descriptions[key] || "Advanced configuration setting";
};

const renderSettingControl = (key: string, value: any, onChange: (key: string, newValue: any) => void) => {
  // Boolean settings - render as switch
  if (typeof value === 'boolean') {
    return (
      <Switch
        checked={value}
        onCheckedChange={(checked) => onChange(key, checked)}
        className="data-[state=checked]:bg-blue-600"
      />
    );
  }
  
  // Number settings - render based on context
  if (typeof value === 'number') {
    // Percentage values (0-100)
    if (key.includes('percentage') || key.includes('rate') || key.includes('level')) {
      return (
        <div className="space-y-2">
          <Slider
            value={[value]}
            onValueChange={([newValue]) => onChange(key, newValue)}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-400">{value}%</div>
        </div>
      );
    }
    
    // Large numbers - render as input
    return (
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(key, Number(e.target.value))}
        className="bg-gray-700 border-gray-600 text-white"
      />
    );
  }
  
  // String settings - render based on context
  if (typeof value === 'string') {
    // Predefined options
    const selectOptions: Record<string, string[]> = {
      theme_preference: ['dark', 'light', 'cosmic'],
      personality_type: ['conservative', 'balanced', 'aggressive', 'mystical'],
      display_mode: ['minimal', 'detailed', 'expert'],
      encryption_level: ['standard', 'high', 'kons-powa'],
      language: ['en', 'es', 'fr', 'de', 'zh', 'ja'],
      currency_display: ['USD', 'EUR', 'GBP', 'SS']
    };
    
    if (selectOptions[key]) {
      return (
        <Select value={value} onValueChange={(newValue) => onChange(key, newValue)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600">
            {selectOptions[key].map((option) => (
              <SelectItem key={option} value={option} className="text-white hover:bg-gray-600">
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    
    // Multi-line text
    if (key.includes('description') || key.includes('config') || value.length > 50) {
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(key, e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
          rows={3}
        />
      );
    }
    
    // Regular text input
    return (
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(key, e.target.value)}
        className="bg-gray-700 border-gray-600 text-white"
      />
    );
  }
  
  // Array settings - render as JSON editor
  if (Array.isArray(value)) {
    return (
      <Textarea
        value={JSON.stringify(value, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange(key, parsed);
          } catch (error) {
            // Invalid JSON, don't update
          }
        }}
        className="bg-gray-700 border-gray-600 text-white font-mono text-sm"
        rows={4}
      />
    );
  }
  
  // Object settings - render as JSON editor
  if (typeof value === 'object' && value !== null) {
    return (
      <Textarea
        value={JSON.stringify(value, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange(key, parsed);
          } catch (error) {
            // Invalid JSON, don't update
          }
        }}
        className="bg-gray-700 border-gray-600 text-white font-mono text-sm"
        rows={6}
      />
    );
  }
  
  // Fallback - regular input
  return (
    <Input
      type="text"
      value={String(value)}
      onChange={(e) => onChange(key, e.target.value)}
      className="bg-gray-700 border-gray-600 text-white"
    />
  );
};

// Main AdminConsole component
export default function AdminConsole() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [configSection, setConfigSection] = useState('system');
  const [searchQuery, setSearchQuery] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/admin/status'],
    refetchInterval: 5000,
  });

  // Fetch basic configuration
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['/api/admin/config'],
    refetchInterval: 2000,
  });

  // Fetch advanced configuration
  const { data: advancedConfig, isLoading } = useQuery({
    queryKey: ['/api/admin/advanced-config'],
    refetchInterval: 2000,
  });

  // Fetch user list
  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  // Fetch transaction history
  const { data: transactions } = useQuery({
    queryKey: ['/api/admin/transactions'],
  });

  // Get current section configuration
  const sectionConfig = advancedConfig?.[configSection];

  // Mutation for updating configuration
  const updateConfigMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest('PUT', '/api/admin/advanced-config', updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/advanced-config'] });
      setUnsavedChanges(false);
      setPendingChanges({});
      toast({
        title: "Configuration Updated",
        description: "Advanced settings have been saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to save configuration changes",
        variant: "destructive",
      });
    },
  });

  // Mutation for resetting configuration section
  const resetConfigMutation = useMutation({
    mutationFn: async (section: string) => {
      const response = await apiRequest('POST', `/api/admin/advanced-config/reset/${section}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/advanced-config'] });
      toast({
        title: "Configuration Reset",
        description: `${configSection} settings have been reset to defaults`,
      });
    },
  });

  // Handle configuration changes
  const handleConfigChange = (key: string, value: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [configSection]: {
        ...prev[configSection],
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };

  // Save pending changes
  const saveChanges = () => {
    updateConfigMutation.mutate(pendingChanges);
  };

  // Export configuration
  const exportConfig = () => {
    const dataStr = JSON.stringify(advancedConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-gray-800 border-r border-gray-700 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
              <Shield className="w-8 h-8 text-blue-400 mr-3" />
              <h1 className="text-xl font-bold text-white">Admin Console</h1>
            </div>

            {/* System Status */}
            <div className="px-4 py-3 bg-gray-900/50">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">System Status</div>
              {statusLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Memory</span>
                    <span className="text-green-400">{status?.memory_usage}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">CPU</span>
                    <span className="text-blue-400">{status?.cpu_usage}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Uptime</span>
                    <span className="text-purple-400">{status?.uptime}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Categories */}
            <div className="flex-1 px-4 py-6 space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Core Systems</h4>
                <nav className="space-y-1">
                  {[
                    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'text-green-400' },
                    { id: 'system', icon: Settings, label: 'System Config', color: 'text-blue-400' },
                    { id: 'advanced-config', icon: Cpu, label: 'Advanced Config', color: 'text-orange-400', badge: '500+' },
                    { id: 'trading', icon: TrendingUp, label: 'Trading Engine', color: 'text-purple-400' },
                    { id: 'wallet', icon: DollarSign, label: 'Wallet System', color: 'text-yellow-400' },
                    { id: 'users', icon: Users, label: 'User Management', color: 'text-cyan-400' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {(item as any).badge && (
                        <Badge variant="outline" className="text-xs">
                          {(item as any).badge}
                        </Badge>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Intelligence</h4>
                <nav className="space-y-1">
                  {[
                    { id: 'konsai', icon: Brain, label: 'KonsAi Engine', color: 'text-pink-400' },
                    { id: 'automation', icon: Bot, label: 'Bot Network', color: 'text-indigo-400' },
                    { id: 'analytics', icon: Activity, label: 'Analytics Hub', color: 'text-red-400' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Configuration</h4>
                <nav className="space-y-1">
                  {[
                    { id: 'security', icon: Shield, label: 'Security', color: 'text-red-400' },
                    { id: 'notifications', icon: Bell, label: 'Notifications', color: 'text-yellow-400' },
                    { id: 'integrations', icon: Link, label: 'Integrations', color: 'text-green-400' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Advanced</h4>
                <nav className="space-y-1">
                  {[
                    { id: 'database', icon: Database, label: 'Database', color: 'text-blue-400' },
                    { id: 'performance', icon: Zap, label: 'Performance', color: 'text-yellow-400' },
                    { id: 'deployment', icon: Rocket, label: 'Deployment', color: 'text-purple-400' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 bg-gray-800 border-gray-700 p-0">
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
                <Shield className="w-8 h-8 text-blue-400 mr-3" />
                <h1 className="text-xl font-bold text-white">Admin Console</h1>
              </div>

              {/* Navigation content (same as desktop but in mobile sheet) */}
              <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Core Systems</h4>
                  <nav className="space-y-1">
                    {[
                      { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'text-green-400' },
                      { id: 'system', icon: Settings, label: 'System Config', color: 'text-blue-400' },
                      { id: 'advanced-config', icon: Cpu, label: 'Advanced Config', color: 'text-orange-400', badge: '500+' },
                      { id: 'trading', icon: TrendingUp, label: 'Trading Engine', color: 'text-purple-400' },
                      { id: 'wallet', icon: DollarSign, label: 'Wallet System', color: 'text-yellow-400' },
                      { id: 'users', icon: Users, label: 'User Management', color: 'text-cyan-400' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                          activeTab === item.id
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        {(item as any).badge && (
                          <Badge variant="outline" className="text-xs">
                            {(item as any).badge}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="flex flex-col h-full">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-4 lg:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-700"
                        onClick={() => setSidebarOpen(true)}
                      >
                        <Menu className="w-5 h-5" />
                      </Button>
                    </SheetTrigger>
                  </Sheet>
                  
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-white">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')} 
                    </h2>
                    <p className="text-sm text-gray-400">
                      Advanced administrative controls and system management
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {statusLoading ? (
                    <div className="animate-pulse flex space-x-2">
                      <div className="w-16 h-6 bg-gray-700 rounded"></div>
                      <div className="w-16 h-6 bg-gray-700 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <Badge variant="outline" className="text-green-400 border-green-400 hidden lg:flex">
                        Memory: {status?.memory_usage}%
                      </Badge>
                      <Badge variant="outline" className="text-blue-400 border-blue-400 hidden lg:flex">
                        CPU: {status?.cpu_usage}%
                      </Badge>
                      <Badge variant="outline" className="text-purple-400 border-purple-400">
                        {status?.uptime}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="space-y-4 lg:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-green-400 text-base lg:text-lg">System Health</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl lg:text-3xl font-bold text-white">{status?.memory_usage}%</div>
                        <p className="text-sm text-gray-400">Memory Usage</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-blue-400 text-base lg:text-lg">Active Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl lg:text-3xl font-bold text-white">{users?.length || 0}</div>
                        <p className="text-sm text-gray-400">Connected</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-purple-400 text-base lg:text-lg">Transactions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl lg:text-3xl font-bold text-white">{transactions?.length || 0}</div>
                        <p className="text-sm text-gray-400">Today</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-yellow-400 text-base lg:text-lg">Uptime</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg lg:text-xl font-bold text-white">{status?.uptime}</div>
                        <p className="text-sm text-gray-400">Running</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* System Config Tab */}
              {activeTab === 'system' && (
                <div className="space-y-4 lg:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-blue-400 text-base lg:text-lg">System Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-white text-sm lg:text-base">Maintenance Mode</Label>
                          <Switch checked={config?.system?.maintenance_mode || false} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-white text-sm lg:text-base">Debug Logging</Label>
                          <Switch checked={config?.system?.debug_logging || false} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-white text-sm lg:text-base">Rate Limiting</Label>
                          <Switch checked={config?.system?.rate_limiting || false} />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-green-400 text-base lg:text-lg">Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-white text-sm lg:text-base">Max Requests/Min</Label>
                          <Input 
                            type="number" 
                            defaultValue={config?.system?.max_requests_per_minute || 100}
                            className="bg-gray-800 border-gray-600 text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white text-sm lg:text-base">API Timeout (ms)</Label>
                          <Input 
                            type="number" 
                            defaultValue={config?.system?.api_timeout || 30000}
                            className="bg-gray-800 border-gray-600 text-white mt-1"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Advanced Configuration Management */}
              {activeTab === 'advanced-config' && (
                <div className="space-y-4 lg:space-y-6">
                  {/* Configuration Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Advanced Configuration</h3>
                      <p className="text-gray-400">
                        Complete control over 500+ system settings with real-time updates
                      </p>
                      {advancedConfig && (
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            {Object.keys(advancedConfig).length} Sections
                          </Badge>
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            500+ Settings
                          </Badge>
                          {unsavedChanges && (
                            <Badge variant="destructive">
                              Unsaved Changes
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery('')}
                        className="bg-gray-800 border-gray-600 text-gray-300"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Clear Search
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportConfig}
                        className="bg-gray-800 border-gray-600 text-gray-300"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetConfigMutation.mutate(configSection)}
                        className="bg-red-600/20 border-red-600 text-red-400"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset Section
                      </Button>
                      {unsavedChanges && (
                        <Button
                          size="sm"
                          onClick={saveChanges}
                          disabled={updateConfigMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Input
                      placeholder="Search 500+ settings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>

                  {/* Configuration Sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Section Selector */}
                    <div className="lg:col-span-1">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-base">Configuration Sections</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {advancedConfig && Object.keys(advancedConfig).map((section) => (
                            <button
                              key={section}
                              onClick={() => setConfigSection(section)}
                              className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                                configSection === section
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="capitalize">{section.replace('_', ' ')}</span>
                                <Badge variant="outline" className="text-xs">
                                  {advancedConfig[section] ? Object.keys(advancedConfig[section]).length : 0}
                                </Badge>
                              </div>
                            </button>
                          ))}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Settings Panel */}
                    <div className="lg:col-span-3">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-base capitalize">
                            {configSection.replace('_', ' ')} Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                            </div>
                          ) : sectionConfig ? (
                            <ScrollArea className="h-96">
                              <div className="space-y-4">
                                {Object.entries(sectionConfig).map(([key, value]) => (
                                  <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-700/50 rounded-lg">
                                    <div>
                                      <Label className="text-white font-medium capitalize">
                                        {key.replace(/_/g, ' ')}
                                      </Label>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {getSettingDescription(key)}
                                      </p>
                                    </div>
                                    <div>
                                      {renderSettingControl(key, value, handleConfigChange)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          ) : (
                            <div className="text-center py-12">
                              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                              <p className="text-gray-400">Failed to load configuration section</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Configuration Summary */}
                  {advancedConfig && (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white text-base">Configuration Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                          {Object.entries(advancedConfig).map(([section, settings]) => (
                            <div key={section} className="text-center">
                              <div className="text-2xl font-bold text-blue-400">
                                {typeof settings === 'object' ? Object.keys(settings).length : 0}
                              </div>
                              <div className="text-xs text-gray-400 capitalize">
                                {section.replace('_', ' ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Other tab content placeholder */}
              {!['dashboard', 'system', 'advanced-config'].includes(activeTab) && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Configuration
                  </h3>
                  <p className="text-gray-400">
                    Advanced {activeTab} settings and controls will be displayed here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}