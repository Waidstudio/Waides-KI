import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Shield, BarChart3, Users, DollarSign, Brain, Settings, 
  TrendingUp, Bell, Database, Activity, Zap, Rocket, 
  RefreshCw, Save, X, Link, Brush, Cpu, Bot, Menu 
} from "lucide-react";

interface AdminConsoleProps {
  onExit: () => void;
  status?: any;
  config?: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminConsole({ onExit, status, config, activeTab, setActiveTab }: AdminConsoleProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

              {/* Other tab content placeholder */}
              {!['dashboard', 'system'].includes(activeTab) && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Configuration
                  </h3>
                  <p className="text-gray-400">
                    Advanced {activeTab} settings and controls will be displayed here.
                  </p>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-blue-400">Configuration Panel</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300">Manage {activeTab} settings and preferences</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-green-400">Real-time Monitoring</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300">Live {activeTab} metrics and analytics</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-purple-400">Advanced Controls</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300">Expert {activeTab} configuration options</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}