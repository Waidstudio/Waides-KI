import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Settings,
  Database,
  DollarSign,
  Bot,
  Shield,
  Globe,
  Activity,
  RefreshCw,
  Save,
  Upload,
  Download,
  Search,
  Eye,
  EyeOff,
  ChevronRight,
  Monitor,
  Palette,
  Bell,
  BarChart3,
  Cloud,
  Server,
  Cpu,
  HardDrive,
  Network,
  Lock,
  Key,
  Users,
  CreditCard,
  Smartphone,
  Mail,
  MessageSquare,
  Zap,
  Gauge,
  Target,
  Layers,
  Filter,
  FileText,
  Image,
  Sliders,
  RotateCcw,
  Check,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';

interface MegaAdminConfig {
  system: Record<string, any>;
  trading: Record<string, any>;
  security: Record<string, any>;
  ui: Record<string, any>;
  wallet: Record<string, any>;
  konsai: Record<string, any>;
  notifications: Record<string, any>;
  analytics: Record<string, any>;
  infrastructure: Record<string, any>;
}

interface MegaAdminStats {
  totalSettings: number;
  totalSections: number;
  sectionBreakdown: Record<string, number>;
  enabledFeatures: number;
  maintenanceMode: boolean;
  tradingEnabled: boolean;
  aiEnabled: boolean;
  lastUpdated: string;
}

interface AppConfig {
  branding: {
    app_name: string;
    logo_url: string;
    favicon_url: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;
    font_family: string;
    theme_mode: string;
  };
  features: Record<string, boolean>;
  layout: Record<string, any>;
  security: Record<string, any>;
  trading: Record<string, any>;
  notifications: Record<string, any>;
  api: Record<string, any>;
  maintenance: Record<string, any>;
}

export function StandaloneAdminApp() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSection, setActiveSection] = useState('system');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedSettings, setSelectedSettings] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch mega admin configuration (1000+ settings)
  const { data: megaConfig, isLoading: megaLoading } = useQuery<MegaAdminConfig>({
    queryKey: ['/api/mega-admin-config'],
    refetchInterval: 5000,
  });

  // Fetch mega admin stats
  const { data: megaStats, isLoading: statsLoading } = useQuery<MegaAdminStats>({
    queryKey: ['/api/mega-admin-config/stats'],
    refetchInterval: 10000,
  });

  // Fetch app configuration that controls main frontend
  const { data: appConfig, isLoading: appLoading } = useQuery<AppConfig>({
    queryKey: ['/api/app-config'],
    refetchInterval: 3000,
  });

  // Update mega setting mutation
  const updateMegaSetting = useMutation({
    mutationFn: async ({ section, key, value }: { section: string; key: string; value: any }) => {
      return apiRequest('PUT', `/api/mega-admin-config/${section}/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mega-admin-config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mega-admin-config/stats'] });
      toast({
        title: "Setting Updated",
        description: "Configuration setting updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update configuration setting",
        variant: "destructive",
      });
    },
  });

  // Update app configuration mutation (affects main frontend)
  const updateAppConfig = useMutation({
    mutationFn: async ({ section, updates }: { section: string; updates: any }) => {
      return apiRequest('PUT', `/api/app-config/${section}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/app-config'] });
      toast({
        title: "App Configuration Updated",
        description: "Main application configuration updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update app configuration",
        variant: "destructive",
      });
    },
  });

  // Upload logo mutation
  const uploadLogo = useMutation({
    mutationFn: async (logoData: string) => {
      return apiRequest('POST', '/api/app-config/upload/logo', { logoData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/app-config'] });
      toast({
        title: "Logo Uploaded",
        description: "Logo uploaded and will appear in main app",
      });
    },
  });

  // Export configuration mutation
  const exportConfig = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/mega-admin-config/export');
    },
    onSuccess: (data) => {
      const blob = new Blob([data.configuration], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `waides-ki-config-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Configuration Exported",
        description: "Configuration file downloaded successfully",
      });
    },
  });

  // Import configuration mutation
  const importConfig = useMutation({
    mutationFn: async (configJson: string) => {
      return apiRequest('POST', '/api/mega-admin-config/import', { configJson });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mega-admin-config'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mega-admin-config/stats'] });
      toast({
        title: "Configuration Imported",
        description: "Configuration imported successfully",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoData = e.target?.result as string;
        uploadLogo.mutate(logoData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfigImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const configJson = e.target?.result as string;
        importConfig.mutate(configJson);
      };
      reader.readAsText(file);
    }
  };

  const renderSettingControl = (section: string, key: string, value: any, type: string = typeof value) => {
    const settingId = `${section}.${key}`;
    
    if (type === 'boolean') {
      return (
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex-1">
            <Label htmlFor={settingId} className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {section}.{key}
            </p>
          </div>
          <Switch
            id={settingId}
            checked={value}
            onCheckedChange={(checked) => 
              updateMegaSetting.mutate({ section, key, value: checked })
            }
          />
        </div>
      );
    }

    if (type === 'number') {
      return (
        <div className="space-y-2 p-3 border rounded-lg">
          <Label htmlFor={settingId} className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id={settingId}
              type="number"
              value={value}
              onChange={(e) => 
                updateMegaSetting.mutate({ section, key, value: parseInt(e.target.value) || 0 })
              }
              className="flex-1"
            />
            <Badge variant="outline" className="text-xs">
              {typeof value === 'number' && value > 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {section}.{key}
          </p>
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-2 p-3 border rounded-lg">
          <Label htmlFor={settingId} className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Label>
          <Textarea
            id={settingId}
            value={value.join(', ')}
            onChange={(e) => 
              updateMegaSetting.mutate({ 
                section, 
                key, 
                value: e.target.value.split(',').map(item => item.trim()).filter(Boolean)
              })
            }
            placeholder="Comma-separated values"
            className="min-h-[60px]"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {section}.{key}
            </p>
            <Badge variant="outline" className="text-xs">
              {value.length} items
            </Badge>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2 p-3 border rounded-lg">
        <Label htmlFor={settingId} className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Label>
        <Input
          id={settingId}
          value={value}
          onChange={(e) => 
            updateMegaSetting.mutate({ section, key, value: e.target.value })
          }
          placeholder={`Enter ${key.replace(/_/g, ' ')}`}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {section}.{key}
        </p>
      </div>
    );
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'system': return <Server className="h-4 w-4" />;
      case 'trading': return <DollarSign className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'ui': return <Palette className="h-4 w-4" />;
      case 'wallet': return <CreditCard className="h-4 w-4" />;
      case 'konsai': return <Bot className="h-4 w-4" />;
      case 'notifications': return <Bell className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      case 'infrastructure': return <Cloud className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'system': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'trading': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'security': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      case 'ui': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      case 'wallet': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
      case 'konsai': return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300';
      case 'notifications': return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
      case 'analytics': return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300';
      case 'infrastructure': return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  if (megaLoading || statsLoading || appLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Waides KI Admin Control Center</h1>
            <p className="text-gray-400 mt-2">
              Comprehensive platform administration with {megaStats?.totalSettings || '1000+'} settings
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
              {megaStats?.totalSettings || 0} Settings
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300">
              {megaStats?.totalSections || 9} Sections
            </Badge>
            <Button
              onClick={() => exportConfig.mutate()}
              disabled={exportConfig.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Config
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Settings</p>
                  <p className="text-2xl font-bold text-white">{megaStats?.totalSettings || 0}</p>
                </div>
                <Settings className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Maintenance Mode</p>
                  <p className="text-2xl font-bold text-white">
                    {megaStats?.maintenanceMode ? 'ON' : 'OFF'}
                  </p>
                </div>
                <Monitor className={`h-8 w-8 ${megaStats?.maintenanceMode ? 'text-red-500' : 'text-green-500'}`} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Trading Status</p>
                  <p className="text-2xl font-bold text-white">
                    {megaStats?.tradingEnabled ? 'ACTIVE' : 'INACTIVE'}
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${megaStats?.tradingEnabled ? 'text-green-500' : 'text-gray-500'}`} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">KonsAi Status</p>
                  <p className="text-2xl font-bold text-white">
                    {megaStats?.aiEnabled ? 'ONLINE' : 'OFFLINE'}
                  </p>
                </div>
                <Bot className={`h-8 w-8 ${megaStats?.aiEnabled ? 'text-cyan-500' : 'text-gray-500'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              <Monitor className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="mega-config" className="data-[state=active]:bg-purple-600">
              <Sliders className="h-4 w-4 mr-2" />
              Mega Config (1000+)
            </TabsTrigger>
            <TabsTrigger value="app-control" className="data-[state=active]:bg-green-600">
              <Zap className="h-4 w-4 mr-2" />
              App Control
            </TabsTrigger>
            <TabsTrigger value="branding" className="data-[state=active]:bg-orange-600">
              <Palette className="h-4 w-4 mr-2" />
              Branding
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Configuration Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {megaStats?.sectionBreakdown && Object.entries(megaStats.sectionBreakdown).map(([section, count]) => (
                    <div key={section} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getSectionIcon(section)}
                        <span className="text-white capitalize">{section.replace(/_/g, ' ')}</span>
                      </div>
                      <Badge variant="outline" className={getSectionColor(section)}>
                        {count} settings
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Last Updated</span>
                    <span className="text-white text-sm">
                      {megaStats?.lastUpdated ? new Date(megaStats.lastUpdated).toLocaleString() : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Enabled Features</span>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                      {megaStats?.enabledFeatures || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Configuration Health</span>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                      Optimal
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mega Configuration Tab */}
          <TabsContent value="mega-config" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search 1000+ settings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80 bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="border-gray-600 text-gray-300"
                >
                  {showAdvanced ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleConfigImport}
                  className="hidden"
                  id="config-import"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('config-import')?.click()}
                  className="border-gray-600 text-gray-300"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Section Navigation */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Configuration Sections</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-96">
                    {megaConfig && Object.keys(megaConfig).map((section) => (
                      <button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={`w-full p-3 flex items-center justify-between text-left transition-colors hover:bg-gray-700/50 ${
                          activeSection === section ? 'bg-blue-600/20 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {getSectionIcon(section)}
                          <span className="text-white capitalize text-sm">
                            {section.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge variant="outline" className="text-xs">
                            {Object.keys(megaConfig[section as keyof MegaAdminConfig] || {}).length}
                          </Badge>
                          <ChevronRight className="h-3 w-3 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Settings Panel */}
              <div className="lg:col-span-3">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      {getSectionIcon(activeSection)}
                      <span className="ml-2 capitalize">{activeSection.replace(/_/g, ' ')} Settings</span>
                      <Badge variant="outline" className="ml-2">
                        {Object.keys(megaConfig?.[activeSection as keyof MegaAdminConfig] || {}).length} settings
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Configure {activeSection} settings that control the entire platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {megaConfig?.[activeSection as keyof MegaAdminConfig] && 
                          Object.entries(megaConfig[activeSection as keyof MegaAdminConfig]).map(([key, value]) => {
                            if (searchQuery && !key.toLowerCase().includes(searchQuery.toLowerCase())) {
                              return null;
                            }
                            
                            return (
                              <div key={key}>
                                {renderSettingControl(activeSection, key, value)}
                              </div>
                            );
                          })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* App Control Tab */}
          <TabsContent value="app-control" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Features Control */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Main App Features
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Control what features are available in the main application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appConfig?.features && Object.entries(appConfig.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <Label htmlFor={feature} className="text-white capitalize">
                        {feature.replace(/_/g, ' ')}
                      </Label>
                      <Switch
                        id={feature}
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          updateAppConfig.mutate({ 
                            section: 'features', 
                            updates: { [feature]: checked } 
                          })
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Security Control */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security Settings
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure security settings for the main application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appConfig?.security && Object.entries(appConfig.security).map(([setting, value]) => (
                    <div key={setting} className="space-y-2">
                      <Label className="text-white capitalize">
                        {setting.replace(/_/g, ' ')}
                      </Label>
                      {typeof value === 'boolean' ? (
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            updateAppConfig.mutate({ 
                              section: 'security', 
                              updates: { [setting]: checked } 
                            })
                          }
                        />
                      ) : typeof value === 'number' ? (
                        <Input
                          type="number"
                          value={value}
                          onChange={(e) => 
                            updateAppConfig.mutate({ 
                              section: 'security', 
                              updates: { [setting]: parseInt(e.target.value) } 
                            })
                          }
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      ) : (
                        <Input
                          value={value}
                          onChange={(e) => 
                            updateAppConfig.mutate({ 
                              section: 'security', 
                              updates: { [setting]: e.target.value } 
                            })
                          }
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Logo & Assets */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Image className="h-5 w-5 mr-2" />
                    Logo & Assets
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Upload assets that will appear in the main application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Application Logo</Label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        disabled={uploadLogo.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                      {appConfig?.branding?.logo_url && (
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          Logo Active
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="app-name" className="text-white">Application Name</Label>
                    <Input
                      id="app-name"
                      value={appConfig?.branding?.app_name || ''}
                      onChange={(e) => 
                        updateAppConfig.mutate({ 
                          section: 'branding', 
                          updates: { app_name: e.target.value } 
                        })
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Enter application name"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Color Scheme */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Palette className="h-5 w-5 mr-2" />
                    Color Scheme
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Customize colors that will be applied to the main application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['primary_color', 'secondary_color', 'accent_color', 'background_color', 'text_color'].map((colorKey) => (
                    <div key={colorKey} className="flex items-center space-x-4">
                      <Label className="text-white capitalize flex-1">
                        {colorKey.replace(/_/g, ' ')}
                      </Label>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-8 h-8 rounded border border-gray-600"
                          style={{ backgroundColor: appConfig?.branding?.[colorKey as keyof typeof appConfig.branding] || '#000' }}
                        />
                        <Input
                          type="color"
                          value={appConfig?.branding?.[colorKey as keyof typeof appConfig.branding] || '#000000'}
                          onChange={(e) => 
                            updateAppConfig.mutate({ 
                              section: 'branding', 
                              updates: { [colorKey]: e.target.value } 
                            })
                          }
                          className="w-20 h-8 p-1 bg-gray-700 border-gray-600"
                        />
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2">
                    <Label className="text-white">Theme Mode</Label>
                    <Select
                      value={appConfig?.branding?.theme_mode || 'dark'}
                      onValueChange={(value) => 
                        updateAppConfig.mutate({ 
                          section: 'branding', 
                          updates: { theme_mode: value } 
                        })
                      }
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
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