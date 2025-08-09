import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  Users, 
  Shield, 
  Monitor, 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Zap,
  Server,
  HardDrive,
  Cpu,
  Clock,
  Globe,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SystemMetrics {
  server: {
    cpu: number;
    memory: number;
    disk: number;
    uptime: string;
    load: number[];
  };
  database: {
    connections: number;
    queries: number;
    performance: string;
    size: string;
  };
  users: {
    total: number;
    active: number;
    newToday: number;
    banned: number;
  };
  security: {
    activeThreats: number;
    blockedIPs: number;
    failedLogins: number;
    securityLevel: 'high' | 'medium' | 'low';
  };
  trading: {
    activeBots: number;
    totalTrades: number;
    profitToday: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
  lastLogin: string;
  isActive: boolean;
}

export default function SystemAdminDashboard() {
  const { toast } = useToast();
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  // Fetch system metrics
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery<SystemMetrics>({
    queryKey: ['/api/admin/system/metrics'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch system alerts
  const { data: alerts = [], refetch: refetchAlerts } = useQuery<SystemAlert[]>({
    queryKey: ['/api/admin/system/alerts'],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Fetch admin users
  const { data: adminUsers = [] } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/users'],
  });

  // System restart mutation
  const restartSystemMutation = useMutation({
    mutationFn: async (service: string) => {
      return await apiRequest('POST', '/api/admin/system/restart', { service });
    },
    onSuccess: () => {
      toast({
        title: "System Restart Initiated",
        description: "The system service is being restarted",
      });
      refetchMetrics();
    },
    onError: () => {
      toast({
        title: "Restart Failed",
        description: "Failed to restart the system service",
        variant: "destructive",
      });
    },
  });

  // Clear cache mutation
  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/admin/system/clear-cache');
    },
    onSuccess: () => {
      toast({
        title: "Cache Cleared",
        description: "System cache has been cleared successfully",
      });
    },
  });

  // Resolve alert mutation
  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return await apiRequest('POST', `/api/admin/system/alerts/${alertId}/resolve`);
    },
    onSuccess: () => {
      toast({
        title: "Alert Resolved",
        description: "Alert has been marked as resolved",
      });
      refetchAlerts();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'high': return 'text-green-500';
      case 'warning': case 'medium': return 'text-yellow-500';
      case 'critical': case 'low': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': case 'high': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical': case 'low': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Monitor className="w-4 h-4 text-gray-500" />;
    }
  };

  if (metricsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">System Admin Dashboard</h1>
            <p className="text-slate-400">Comprehensive system monitoring and control</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => refetchMetrics()}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Badge variant="outline" className="border-green-500 text-green-400">
              System Online
            </Badge>
          </div>
        </div>

        {/* Critical Alerts */}
        {alerts.length > 0 && (
          <Alert className="border-red-500 bg-red-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-200">
              {alerts.filter(a => !a.resolved).length} unresolved system alerts require attention
            </AlertDescription>
          </Alert>
        )}

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Server Health */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Server Health</CardTitle>
              <Server className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics?.server.cpu || 0}%</div>
              <p className="text-xs text-slate-500">CPU Usage</p>
              <Progress value={metrics?.server.cpu || 0} className="mt-2" />
            </CardContent>
          </Card>

          {/* Database Status */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Database</CardTitle>
              <Database className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics?.database.connections || 0}</div>
              <p className="text-xs text-slate-500">Active Connections</p>
              <div className="flex items-center mt-2">
                {getStatusIcon(metrics?.database.performance || 'healthy')}
                <span className={`text-xs ml-1 ${getStatusColor(metrics?.database.performance || 'healthy')}`}>
                  {metrics?.database.performance || 'Healthy'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* User Activity */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Users</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics?.users.active || 0}</div>
              <p className="text-xs text-slate-500">Active Users</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-xs text-green-400">+{metrics?.users.newToday || 0} today</span>
              </div>
            </CardContent>
          </Card>

          {/* Security Status */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Security</CardTitle>
              <Shield className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics?.security.activeThreats || 0}</div>
              <p className="text-xs text-slate-500">Active Threats</p>
              <div className="flex items-center mt-2">
                {getStatusIcon(metrics?.security.securityLevel || 'high')}
                <span className={`text-xs ml-1 ${getStatusColor(metrics?.security.securityLevel || 'high')}`}>
                  {metrics?.security.securityLevel || 'High'} Security
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">Overview</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-700">User Management</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-slate-700">Security</TabsTrigger>
            <TabsTrigger value="maintenance" className="data-[state=active]:bg-slate-700">Maintenance</TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-slate-700">
              Alerts {alerts.filter(a => !a.resolved).length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">{alerts.filter(a => !a.resolved).length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Performance */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Monitor className="w-5 h-5 mr-2" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">CPU Usage</span>
                      <span className="text-white">{metrics?.server.cpu || 0}%</span>
                    </div>
                    <Progress value={metrics?.server.cpu || 0} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Memory Usage</span>
                      <span className="text-white">{metrics?.server.memory || 0}%</span>
                    </div>
                    <Progress value={metrics?.server.memory || 0} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Disk Usage</span>
                      <span className="text-white">{metrics?.server.disk || 0}%</span>
                    </div>
                    <Progress value={metrics?.server.disk || 0} />
                  </div>
                  <div className="pt-2 border-t border-slate-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Uptime</span>
                      <span className="text-white">{metrics?.server.uptime || '0h 0m'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trading System Status */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Trading System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{metrics?.trading.activeBots || 0}</div>
                      <div className="text-xs text-slate-400">Active Bots</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{metrics?.trading.totalTrades || 0}</div>
                      <div className="text-xs text-slate-400">Total Trades</div>
                    </div>
                  </div>
                  <div className="text-center pt-2 border-t border-slate-700">
                    <div className="text-lg font-bold text-green-400">
                      ${(metrics?.trading.profitToday || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400">Profit Today</div>
                  </div>
                  <div className="flex items-center justify-center mt-4">
                    {getStatusIcon(metrics?.trading.systemHealth || 'healthy')}
                    <span className={`ml-2 ${getStatusColor(metrics?.trading.systemHealth || 'healthy')}`}>
                      System {metrics?.trading.systemHealth || 'Healthy'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Admin Users</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage system administrators and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {user.isActive ? (
                          <UserCheck className="w-5 h-5 text-green-400" />
                        ) : (
                          <UserX className="w-5 h-5 text-red-400" />
                        )}
                        <div>
                          <div className="text-white font-medium">{user.email}</div>
                          <div className="text-sm text-slate-400">
                            {user.role} • Last login: {user.lastLogin}
                          </div>
                        </div>
                      </div>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Security Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Security Level</span>
                    <Badge className={getStatusColor(metrics?.security.securityLevel || 'high')}>
                      {metrics?.security.securityLevel || 'High'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Blocked IPs</span>
                    <span className="text-white">{metrics?.security.blockedIPs || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Failed Logins (24h)</span>
                    <span className="text-white">{metrics?.security.failedLogins || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Security Scan
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    Backup System
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Update Security Rules
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">System Maintenance</CardTitle>
                <CardDescription className="text-slate-400">
                  System maintenance and administrative tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => restartSystemMutation.mutate('api')}
                    disabled={restartSystemMutation.isPending}
                    variant="outline"
                    className="h-16"
                  >
                    <div className="text-center">
                      <RefreshCw className="w-6 h-6 mx-auto mb-1" />
                      <div>Restart API Server</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => clearCacheMutation.mutate()}
                    disabled={clearCacheMutation.isPending}
                    variant="outline"
                    className="h-16"
                  >
                    <div className="text-center">
                      <Zap className="w-6 h-6 mx-auto mb-1" />
                      <div>Clear System Cache</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => restartSystemMutation.mutate('database')}
                    disabled={restartSystemMutation.isPending}
                    variant="outline"
                    className="h-16"
                  >
                    <div className="text-center">
                      <Database className="w-6 h-6 mx-auto mb-1" />
                      <div>Restart Database</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => restartSystemMutation.mutate('websocket')}
                    disabled={restartSystemMutation.isPending}
                    variant="outline"
                    className="h-16"
                  >
                    <div className="text-center">
                      <Globe className="w-6 h-6 mx-auto mb-1" />
                      <div>Restart WebSocket</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">System Alerts</CardTitle>
                <CardDescription className="text-slate-400">
                  Monitor and resolve system alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border ${
                          alert.resolved
                            ? 'bg-slate-700/30 border-slate-600'
                            : alert.type === 'error'
                            ? 'bg-red-500/10 border-red-500/30'
                            : alert.type === 'warning'
                            ? 'bg-yellow-500/10 border-yellow-500/30'
                            : 'bg-blue-500/10 border-blue-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {alert.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                            {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                            {alert.type === 'info' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                            <div>
                              <div className="text-white">{alert.message}</div>
                              <div className="text-sm text-slate-400">{alert.timestamp}</div>
                            </div>
                          </div>
                          {!alert.resolved && (
                            <Button
                              onClick={() => resolveAlertMutation.mutate(alert.id)}
                              disabled={resolveAlertMutation.isPending}
                              size="sm"
                              variant="outline"
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                      <div>No active alerts</div>
                      <div className="text-sm">System is running smoothly</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}