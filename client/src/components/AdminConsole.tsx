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
    response_delay: "Response delay in milliseconds",
    learning_enabled: "Enable AI learning and adaptation",
    personality_mode: "AI personality type",
    
    // Security Settings
    two_factor_auth: "Enable two-factor authentication",
    biometric_auth: "Enable biometric authentication",
    password_complexity: "Minimum password complexity score",
    
    // UI Settings
    theme: "Application theme",
    primary_color: "Primary color scheme",
    font_size: "Base font size in pixels",
    dark_mode: "Enable dark mode interface",
    
    // Performance Settings
    caching_strategy: "Caching strategy type",
    cache_duration: "Cache duration in seconds",
    
    // Default fallback
    default: "Configuration setting for system optimization"
  };
  
  return descriptions[key] || descriptions.default;
};

const renderSettingControl = (key: string, value: any, onChange: (key: string, value: any) => void) => {
  // Boolean controls
  if (typeof value === 'boolean') {
    return (
      <Switch
        checked={value}
        onCheckedChange={(checked) => onChange(key, checked)}
        className="data-[state=checked]:bg-blue-600"
      />
    );
  }
  
  // Number controls
  if (typeof value === 'number') {
    // Percentage sliders
    if (key.includes('percentage') || key.includes('rate') || key.includes('threshold')) {
      return (
        <div className="space-y-2">
          <Slider
            value={[value]}
            onValueChange={(values) => onChange(key, values[0])}
            max={100}
            min={0}
            step={0.1}
            className="w-full"
          />
          <div className="text-xs text-gray-400 text-right">{value}%</div>
        </div>
      );
    }
    
    // Regular number inputs
    return (
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(key, parseFloat(e.target.value) || 0)}
        className="bg-gray-700 border-gray-600 text-white"
      />
    );
  }
  
  // String controls with predefined options
  if (typeof value === 'string') {
    // Select controls for specific settings
    if (key === 'risk_level') {
      return (
        <Select value={value} onValueChange={(val) => onChange(key, val)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="conservative">Conservative</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="aggressive">Aggressive</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    if (key === 'theme') {
      return (
        <Select value={value} onValueChange={(val) => onChange(key, val)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="auto">Auto</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    if (key === 'intelligence_level') {
      return (
        <Select value={value} onValueChange={(val) => onChange(key, val)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
            <SelectItem value="transcendent">Transcendent</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    if (key === 'personality_mode') {
      return (
        <Select value={value} onValueChange={(val) => onChange(key, val)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="friendly">Friendly</SelectItem>
            <SelectItem value="analytical">Analytical</SelectItem>
            <SelectItem value="balanced">Balanced</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    
    // Color picker for color settings
    if (key.includes('color')) {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-12 h-8 rounded border-gray-600"
          />
          <Input
            value={value}
            onChange={(e) => onChange(key, e.target.value)}
            className="bg-gray-700 border-gray-600 text-white flex-1"
          />
        </div>
      );
    }
    
    // Default text input
    return (
      <Input
        value={value}
        onChange={(e) => onChange(key, e.target.value)}
        className="bg-gray-700 border-gray-600 text-white"
      />
    );
  }
  
  // Array controls
  if (Array.isArray(value)) {
    return (
      <Textarea
        value={value.join(', ')}
        onChange={(e) => onChange(key, e.target.value.split(', ').filter(Boolean))}
        className="bg-gray-700 border-gray-600 text-white"
        placeholder="Enter comma-separated values"
        rows={3}
      />
    );
  }
  
  // Object controls (simplified JSON editor)
  if (typeof value === 'object' && value !== null) {
    return (
      <Textarea
        value={JSON.stringify(value, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange(key, parsed);
          } catch (error) {
            // Handle invalid JSON gracefully
          }
        }}
        className="bg-gray-700 border-gray-600 text-white font-mono text-xs"
        rows={4}
      />
    );
  }
  
  // Fallback
  return (
    <Input
      value={String(value)}
      onChange={(e) => onChange(key, e.target.value)}
      className="bg-gray-700 border-gray-600 text-white"
    />
  );
};

interface AdminConsoleProps {
  onExit: () => void;
  status?: any;
  config?: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminConsole({ onExit, status, config, activeTab, setActiveTab }: AdminConsoleProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [configSection, setConfigSection] = useState('system');
  const [searchQuery, setSearchQuery] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch advanced configuration
  const { data: advancedConfig, isLoading } = useQuery({
    queryKey: ['/api/admin/advanced-config'],
    refetchInterval: 5000, // Real-time updates every 5 seconds
  });

  // Fetch specific configuration section
  const { data: sectionConfig, refetch: refetchSection } = useQuery({
    queryKey: ['/api/admin/advanced-config', configSection],
    enabled: !!configSection,
    refetchInterval: 2000, // Real-time updates
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async ({ section, data }: { section: string; data: any }) => {
      const result = await apiRequest('PUT', `/api/admin/advanced-config/${section}`, data);
      return result.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuration Updated",
        description: "Settings saved successfully",
      });
      setUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/advanced-config'] });
      refetchSection();
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to save configuration",
        variant: "destructive",
      });
    },
  });

  // Reset configuration mutation
  const resetConfigMutation = useMutation({
    mutationFn: async (section?: string) => {
      const result = await apiRequest('POST', `/api/admin/advanced-config/reset${section ? `/${section}` : ''}`);
      return result.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuration Reset",
        description: "Settings restored to defaults",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/advanced-config'] });
      refetchSection();
    },
  });

  // Export configuration
  const exportConfig = async () => {
    try {
      const response = await fetch('/api/admin/advanced-config/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'waides-ki-config.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Export Complete",
        description: "Configuration downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export configuration",
        variant: "destructive",
      });
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setUnsavedChanges(true);
    // Update local state here if needed
  };

  const saveChanges = () => {
    if (sectionConfig) {
      updateConfigMutation.mutate({ section: configSection, data: sectionConfig });
    }
  };

  const NavigationContent = () => (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Administration</h3>
      
      {/* Quick Actions */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white justify-start"
            onClick={() => {
              setActiveTab('dashboard');
              setSidebarOpen(false);
            }}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white justify-start"
            onClick={() => {
              setActiveTab('trading');
              setSidebarOpen(false);
            }}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Trading
          </Button>
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white justify-start"
            onClick={() => {
              setActiveTab('wallet');
              setSidebarOpen(false);
            }}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Wallet
          </Button>
          <Button
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white justify-start"
            onClick={() => {
              setActiveTab('konsai');
              setSidebarOpen(false);
            }}
          >
            <Brain className="w-4 h-4 mr-2" />
            KonsAi
          </Button>
        </div>
      </div>

      {/* Navigation Categories */}
      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Core Systems</h4>
          <nav className="space-y-1">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'text-green-400' },
              { id: 'system', icon: Settings, label: 'System Config', color: 'text-blue-400' },
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
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Intelligence</h4>
          <nav className="space-y-1">
            {[
              { id: 'konsai', icon: Brain, label: 'KonsAi Engine', color: 'text-purple-400' },
              { id: 'ai-models', icon: Cpu, label: 'AI Models', color: 'text-blue-400' },
              { id: 'automation', icon: Bot, label: 'Automation', color: 'text-green-400' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
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
              { id: 'branding', icon: Brush, label: 'Branding', color: 'text-pink-400' },
              { id: 'security', icon: Shield, label: 'Security', color: 'text-red-400' },
              { id: 'notifications', icon: Bell, label: 'Notifications', color: 'text-orange-400' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics', color: 'text-cyan-400' },
              { id: 'integrations', icon: Link, label: 'Integrations', color: 'text-indigo-400' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
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
              { id: 'database', icon: Database, label: 'Database', color: 'text-emerald-400' },
              { id: 'performance', icon: Zap, label: 'Performance', color: 'text-yellow-400' },
              { id: 'monitoring', icon: Activity, label: 'Monitoring', color: 'text-blue-400' },
              { id: 'deployment', icon: Rocket, label: 'Deployment', color: 'text-purple-400' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
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
  );

  return (
    <div className="fixed inset-0 bg-gray-900 text-white z-50 overflow-hidden flex flex-col">
      {/* Admin App Header */}
      <header className="bg-black border-b border-gray-800 px-4 lg:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-gray-800"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-gray-800 border-gray-700 text-white p-0">
              <NavigationContent />
            </SheetContent>
          </Sheet>

          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-white">Waides KI Admin Console</h1>
            <p className="text-xs text-gray-400">Enterprise Control Panel v2.0</p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-lg font-bold text-white">Admin</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Live System Status - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-600/20 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Online</span>
          </div>
          
          {/* Active Users - Hidden on small screens */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-blue-600/20 rounded-full">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">{status?.active_users || 0}</span>
          </div>
          
          {/* Memory Usage - Compact on mobile */}
          <div className="flex items-center space-x-2 px-2 lg:px-3 py-1 bg-yellow-600/20 rounded-full">
            <Activity className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">{status?.memory_usage || 0}%</span>
          </div>
          
          {/* Exit Admin */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExit}
            className="bg-red-600/20 border-red-600 text-red-400 hover:bg-red-600/30"
          >
            <X className="w-4 h-4 lg:mr-2" />
            <span className="hidden lg:inline">Exit</span>
          </Button>
        </div>
      </header>

      {/* Admin App Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Left Sidebar Navigation - Hidden on mobile */}
        <aside className="hidden lg:block w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <NavigationContent />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-900">
          <div className="p-4 lg:p-6">
            {/* Content Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-white capitalize">
                    {activeTab.replace('-', ' ')} {activeTab === 'konsai' ? 'Intelligence' : 'Management'}
                  </h2>
                  <p className="text-gray-400 mt-1 text-sm lg:text-base">
                    {activeTab === 'dashboard' && 'System overview and real-time metrics'}
                    {activeTab === 'trading' && 'Trading engines and portfolio management'}
                    {activeTab === 'wallet' && 'Wallet configuration and financial controls'}
                    {activeTab === 'konsai' && 'AI intelligence configuration and monitoring'}
                    {activeTab === 'users' && 'User accounts and access management'}
                    {activeTab === 'system' && 'Core system configuration and settings'}
                    {activeTab === 'security' && 'Security protocols and authentication'}
                    {activeTab === 'branding' && 'Visual identity and brand management'}
                    {!['dashboard', 'trading', 'wallet', 'konsai', 'users', 'system', 'security', 'branding'].includes(activeTab) && 'Advanced system configuration'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Save className="w-4 h-4 lg:mr-2" />
                    <span className="hidden lg:inline">Save Changes</span>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 lg:mr-2" />
                    <span className="hidden lg:inline">Refresh</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 min-h-96 p-4 lg:p-6">
              {/* Dashboard Tab Content */}
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-green-400 text-base lg:text-lg">System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl lg:text-2xl font-bold text-white">{status?.uptime || 'N/A'}</div>
                      <p className="text-gray-400 text-sm">Uptime</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-blue-400 text-base lg:text-lg">Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl lg:text-2xl font-bold text-white">{status?.active_users || 0}</div>
                      <p className="text-gray-400 text-sm">Currently online</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-700 border-gray-600 sm:col-span-2 lg:col-span-1">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-purple-400 text-base lg:text-lg">Total Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl lg:text-2xl font-bold text-white">{status?.total_transactions || 0}</div>
                      <p className="text-gray-400 text-sm">All time</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* System Configuration */}
              {activeTab === 'system' && (
                <div className="space-y-4 lg:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-blue-400 text-base lg:text-lg">Core Settings</CardTitle>
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