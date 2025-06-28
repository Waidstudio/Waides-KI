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
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ExpandedAdminConfig } from '@/components/ExpandedAdminConfig';
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
  TrendingUp,
  Brain,
  BarChart,
  Monitor,
  Server,
  Network,
  Gauge,
  Blocks,
  Code2,
  Palette,
  ShieldCheck,
  Bell,
  Mail,
  Search,
  FileText,
  CreditCard,
  Smartphone,
  Download,
  Upload,
  Cpu,
  HardDrive,
  Wifi,
  Clock
} from 'lucide-react';

interface SystemStats {
  uptime: string;
  memory_usage: number;
  cpu_usage: number;
  active_users: number;
  total_transactions: number;
  revenue_today: number;
  error_rate: number;
  response_time: number;
}

interface AdminConfig {
  system: Record<string, any>;
  trading: Record<string, any>;
  wallet: Record<string, any>;
  konsai: Record<string, any>;
  security: Record<string, any>;
  ui: Record<string, any>;
  notifications: Record<string, any>;
  api: Record<string, any>;
}

export function EnhancedAdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system status and stats
  const { data: systemStats, isLoading: statsLoading } = useQuery<SystemStats>({
    queryKey: ['/api/admin/status'],
    refetchInterval: 5000,
  });

  // Fetch admin configuration
  const { data: config, isLoading: configLoading } = useQuery<AdminConfig>({
    queryKey: ['/api/admin/advanced-config'],
    refetchInterval: 10000,
  });

  // Fetch expanded configuration
  const { data: expandedConfig } = useQuery({
    queryKey: ['/api/admin/expanded-config'],
    refetchInterval: 15000,
  });

  // Fetch expanded config stats
  const { data: expandedStats } = useQuery({
    queryKey: ['/api/admin/expanded-config/stats'],
    refetchInterval: 20000,
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ section, key, value }: { section: string; key: string; value: any }) => {
      return apiRequest('PUT', `/api/admin/advanced-config/${section}/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/advanced-config'] });
      toast({ title: "Setting updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update setting", variant: "destructive" });
    },
  });

  const formatUptime = (uptime: string) => {
    return uptime || "0d 0h 0m";
  };

  const getStatusColor = (value: number, type: 'usage' | 'rate' | 'time') => {
    if (type === 'usage') {
      if (value > 80) return 'text-red-500';
      if (value > 60) return 'text-yellow-500';
      return 'text-green-500';
    }
    if (type === 'rate') {
      if (value > 5) return 'text-red-500';
      if (value > 2) return 'text-yellow-500';
      return 'text-green-500';
    }
    if (type === 'time') {
      if (value > 500) return 'text-red-500';
      if (value > 200) return 'text-yellow-500';
      return 'text-green-500';
    }
    return 'text-gray-500';
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-200 dark:bg-blue-700 rounded-lg">
                <Clock className="h-5 w-5 text-blue-700 dark:text-blue-200" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">System Uptime</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {statsLoading ? "Loading..." : formatUptime(systemStats?.uptime || "")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-200 dark:bg-green-700 rounded-lg">
                <Cpu className="h-5 w-5 text-green-700 dark:text-green-200" />
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-300 font-medium">CPU Usage</p>
                <p className={`text-lg font-bold ${getStatusColor(systemStats?.cpu_usage || 0, 'usage')}`}>
                  {statsLoading ? "Loading..." : `${systemStats?.cpu_usage || 0}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-200 dark:bg-purple-700 rounded-lg">
                <HardDrive className="h-5 w-5 text-purple-700 dark:text-purple-200" />
              </div>
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-300 font-medium">Memory Usage</p>
                <p className={`text-lg font-bold ${getStatusColor(systemStats?.memory_usage || 0, 'usage')}`}>
                  {statsLoading ? "Loading..." : `${systemStats?.memory_usage || 0}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-orange-200 dark:border-orange-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-200 dark:bg-orange-700 rounded-lg">
                <Users className="h-5 w-5 text-orange-700 dark:text-orange-200" />
              </div>
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-300 font-medium">Active Users</p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                  {statsLoading ? "Loading..." : (systemStats?.active_users || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configuration Overview</span>
          </CardTitle>
          <CardDescription>Quick access to key system configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config && Object.entries(config).map(([section, settings]) => (
              <Card key={section} className="border-2 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => setActiveTab('settings')}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold capitalize">{section.replace('_', ' ')}</h3>
                      <p className="text-sm text-gray-600">
                        {Object.keys(settings || {}).length} settings
                      </p>
                    </div>
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      {section === 'system' && <Server className="h-4 w-4" />}
                      {section === 'trading' && <TrendingUp className="h-4 w-4" />}
                      {section === 'wallet' && <DollarSign className="h-4 w-4" />}
                      {section === 'konsai' && <Brain className="h-4 w-4" />}
                      {section === 'security' && <Shield className="h-4 w-4" />}
                      {section === 'ui' && <Palette className="h-4 w-4" />}
                      {section === 'notifications' && <Bell className="h-4 w-4" />}
                      {section === 'api' && <Network className="h-4 w-4" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expanded Configuration Stats */}
      {expandedStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Blocks className="h-5 w-5" />
              <span>Advanced Configuration Status</span>
              <Badge variant="secondary">{expandedStats.totalSettings} Settings</Badge>
            </CardTitle>
            <CardDescription>Complete system configuration management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{expandedStats.totalSettings}</div>
                <div className="text-sm text-blue-600">Total Settings</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{expandedStats.sections}</div>
                <div className="text-sm text-green-600">Sections</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{expandedStats.enabledSettings}</div>
                <div className="text-sm text-purple-600">Enabled</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round((expandedStats.enabledSettings / expandedStats.totalSettings) * 100)}%
                </div>
                <div className="text-sm text-orange-600">Configuration Density</div>
              </div>
            </div>
            <Button 
              onClick={() => setActiveTab('expanded-config')} 
              className="w-full"
              variant="outline"
            >
              <Settings className="h-4 w-4 mr-2" />
              Access Advanced Configuration
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderQuickSettingsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick System Controls</CardTitle>
          <CardDescription>Common settings and system controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {config && config.system && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">Put system in maintenance mode</p>
                </div>
                <Switch
                  checked={config.system.maintenance_mode || false}
                  onCheckedChange={(checked) => 
                    updateSettingMutation.mutate({ section: 'system', key: 'maintenance_mode', value: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Debug Logging</Label>
                  <p className="text-sm text-gray-600">Enable detailed system logs</p>
                </div>
                <Switch
                  checked={config.system.debug_logging || false}
                  onCheckedChange={(checked) => 
                    updateSettingMutation.mutate({ section: 'system', key: 'debug_logging', value: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Rate Limiting</Label>
                  <p className="text-sm text-gray-600">Protect against API abuse</p>
                </div>
                <Switch
                  checked={config.system.rate_limiting || false}
                  onCheckedChange={(checked) => 
                    updateSettingMutation.mutate({ section: 'system', key: 'rate_limiting', value: checked })
                  }
                />
              </div>

              {config.trading && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-medium">Auto Trading</Label>
                    <p className="text-sm text-gray-600">Enable automated trading</p>
                  </div>
                  <Switch
                    checked={config.trading.auto_trading_enabled || false}
                    onCheckedChange={(checked) => 
                      updateSettingMutation.mutate({ section: 'trading', key: 'auto_trading_enabled', value: checked })
                    }
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Enhanced Admin Panel
          </h1>
          <p className="text-gray-600 mt-1">Complete system administration and configuration</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search settings, users, or transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Monitor className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Quick Settings</span>
          </TabsTrigger>
          <TabsTrigger value="expanded-config" className="flex items-center space-x-2">
            <Blocks className="h-4 w-4" />
            <span>Advanced Config</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Server className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
        <TabsContent value="settings">{renderQuickSettingsTab()}</TabsContent>
        <TabsContent value="expanded-config">
          <ExpandedAdminConfig />
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users, roles, and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">User management interface coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Analytics dashboard coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Logs & Monitoring</CardTitle>
              <CardDescription>Real-time system monitoring and logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Server className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">System monitoring interface coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}