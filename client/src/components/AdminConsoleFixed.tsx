import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Shield, BarChart3, Users, DollarSign, Settings, 
  TrendingUp, Cpu, Menu, Download, Save, Search
} from "lucide-react";

export default function AdminConsole() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [configSection, setConfigSection] = useState('system');
  const [searchQuery, setSearchQuery] = useState('');

  const { toast } = useToast();

  // Fetch system status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/admin/status'],
    refetchInterval: 5000,
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

              {/* Navigation content */}
              <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Core Systems</h4>
                  <nav className="space-y-1">
                    {[
                      { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'text-green-400' },
                      { id: 'advanced-config', icon: Cpu, label: 'Advanced Config', color: 'text-orange-400', badge: '500+' }
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
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportConfig}
                        className="bg-gray-800 border-gray-600 text-gray-300"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Config
                      </Button>
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
                                        Configuration setting for {key.replace(/_/g, ' ')}
                                      </p>
                                    </div>
                                    <div>
                                      {typeof value === 'boolean' ? (
                                        <Switch checked={value} disabled />
                                      ) : typeof value === 'number' ? (
                                        <Input 
                                          type="number" 
                                          value={value} 
                                          disabled
                                          className="bg-gray-700 border-gray-600 text-white"
                                        />
                                      ) : (
                                        <Input 
                                          type="text" 
                                          value={String(value)} 
                                          disabled
                                          className="bg-gray-700 border-gray-600 text-white"
                                        />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          ) : (
                            <div className="text-center py-12">
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
              {!['dashboard', 'advanced-config'].includes(activeTab) && (
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