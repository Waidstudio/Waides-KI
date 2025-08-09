import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  BarChart3, 
  Activity, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Monitor,
  Database,
  Server,
  Globe,
  Shield,
  DollarSign,
  Bot,
  MessageSquare,
  Star,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  LineChart,
  PieChart
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface SystemOverview {
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeUsers: number;
  totalUsers: number;
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

interface TradingOverview {
  activeBots: number;
  totalTrades: number;
  totalProfit: number;
  winRate: number;
  exchangesConnected: number;
  marketHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

interface SupportOverview {
  openTickets: number;
  resolvedToday: number;
  avgResponseTime: number;
  customerSatisfaction: number;
  activeAgents: number;
  escalatedTickets: number;
}

interface AnalyticsData {
  dailyActiveUsers: number;
  weeklyGrowth: number;
  monthlyRevenue: number;
  conversionRate: number;
  retentionRate: number;
  churnRate: number;
}

export default function ViewerAdminDashboard() {
  // Mock data for viewer dashboard (read-only)
  const mockSystemOverview: SystemOverview = {
    uptime: '47 days, 12 hours',
    cpuUsage: Math.random() * 40 + 30, // 30-70%
    memoryUsage: Math.random() * 30 + 50, // 50-80%
    diskUsage: Math.random() * 20 + 40, // 40-60%
    activeUsers: Math.floor(Math.random() * 100) + 150,
    totalUsers: Math.floor(Math.random() * 500) + 2000,
    systemHealth: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as any
  };

  const mockTradingOverview: TradingOverview = {
    activeBots: Math.floor(Math.random() * 3) + 4, // 4-6
    totalTrades: Math.floor(Math.random() * 500) + 1000,
    totalProfit: Math.random() * 10000 + 5000,
    winRate: Math.random() * 20 + 60, // 60-80%
    exchangesConnected: Math.floor(Math.random() * 2) + 7, // 7-8
    marketHealth: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as any
  };

  const mockSupportOverview: SupportOverview = {
    openTickets: Math.floor(Math.random() * 50) + 20,
    resolvedToday: Math.floor(Math.random() * 30) + 15,
    avgResponseTime: Math.random() * 2 + 1, // 1-3 hours
    customerSatisfaction: Math.random() * 1.5 + 3.5, // 3.5-5.0
    activeAgents: Math.floor(Math.random() * 3) + 6, // 6-8
    escalatedTickets: Math.floor(Math.random() * 10)
  };

  const mockAnalyticsData: AnalyticsData = {
    dailyActiveUsers: Math.floor(Math.random() * 200) + 300,
    weeklyGrowth: Math.random() * 10 + 5, // 5-15%
    monthlyRevenue: Math.random() * 50000 + 75000,
    conversionRate: Math.random() * 5 + 10, // 10-15%
    retentionRate: Math.random() * 20 + 70, // 70-90%
    churnRate: Math.random() * 5 + 2 // 2-7%
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'good': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'fair': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'poor': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage > 80) return 'text-red-500';
    if (usage > 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Viewer Admin Dashboard</h1>
            <p className="text-slate-400">Read-only access to system metrics and analytics</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              <Eye className="w-3 h-3 mr-1" />
              View Only
            </Badge>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* System Health */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">System Health</CardTitle>
              <Monitor className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white capitalize">{mockSystemOverview.systemHealth}</div>
              <p className="text-xs text-slate-500">
                Uptime: {mockSystemOverview.uptime}
              </p>
              <div className="flex items-center mt-2">
                {getHealthIcon(mockSystemOverview.systemHealth)}
                <span className={`text-xs ml-1 ${getHealthColor(mockSystemOverview.systemHealth)}`}>
                  All systems operational
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Users</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{mockSystemOverview.activeUsers}</div>
              <p className="text-xs text-slate-500">
                {mockSystemOverview.totalUsers} total users
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-xs text-green-400">+12% from yesterday</span>
              </div>
            </CardContent>
          </Card>

          {/* Trading Performance */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Trading Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                ${mockTradingOverview.totalProfit.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500">
                {mockTradingOverview.activeBots} active bots
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-xs text-green-400">{mockTradingOverview.winRate.toFixed(1)}% win rate</span>
              </div>
            </CardContent>
          </Card>

          {/* Support Metrics */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Support Status</CardTitle>
              <MessageSquare className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{mockSupportOverview.openTickets}</div>
              <p className="text-xs text-slate-500">
                {mockSupportOverview.resolvedToday} resolved today
              </p>
              <div className="flex items-center mt-2">
                <Star className="w-3 h-3 text-yellow-500 mr-1" />
                <span className="text-xs text-yellow-400">{mockSupportOverview.customerSatisfaction.toFixed(1)}/5 satisfaction</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">System Overview</TabsTrigger>
            <TabsTrigger value="trading" className="data-[state=active]:bg-slate-700">Trading Metrics</TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-slate-700">Support Metrics</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">Analytics</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-slate-700">Reports</TabsTrigger>
          </TabsList>

          {/* System Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Server className="w-5 h-5 mr-2" />
                    System Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">CPU Usage</span>
                      <span className={getUsageColor(mockSystemOverview.cpuUsage)}>
                        {mockSystemOverview.cpuUsage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={mockSystemOverview.cpuUsage} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Memory Usage</span>
                      <span className={getUsageColor(mockSystemOverview.memoryUsage)}>
                        {mockSystemOverview.memoryUsage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={mockSystemOverview.memoryUsage} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Disk Usage</span>
                      <span className={getUsageColor(mockSystemOverview.diskUsage)}>
                        {mockSystemOverview.diskUsage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={mockSystemOverview.diskUsage} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Cpu className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-white font-medium">CPU Cores</div>
                        <div className="text-sm text-slate-400">8 cores available</div>
                      </div>
                    </div>
                    <div className="text-white">100%</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <HardDrive className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-white font-medium">Storage</div>
                        <div className="text-sm text-slate-400">500GB SSD</div>
                      </div>
                    </div>
                    <div className="text-white">85%</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Wifi className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="text-white font-medium">Network</div>
                        <div className="text-sm text-slate-400">1 Gbps connection</div>
                      </div>
                    </div>
                    <div className="text-white">Active</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trading Metrics Tab */}
          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Trading Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{mockTradingOverview.activeBots}</div>
                      <div className="text-sm text-slate-400">Active Bots</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{mockTradingOverview.winRate.toFixed(1)}%</div>
                      <div className="text-sm text-slate-400">Win Rate</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-700">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{mockTradingOverview.totalTrades}</div>
                      <div className="text-sm text-slate-400">Total Trades</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Exchange Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {mockTradingOverview.exchangesConnected}/9
                    </div>
                    <div className="text-slate-400 mb-4">Exchanges Connected</div>
                    <div className="flex items-center justify-center">
                      {getHealthIcon(mockTradingOverview.marketHealth)}
                      <span className={`text-sm ml-2 ${getHealthColor(mockTradingOverview.marketHealth)}`}>
                        Market conditions: {mockTradingOverview.marketHealth}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Metrics Tab */}
          <TabsContent value="support" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Support Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{mockSupportOverview.openTickets}</div>
                      <div className="text-sm text-slate-400">Open Tickets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{mockSupportOverview.resolvedToday}</div>
                      <div className="text-sm text-slate-400">Resolved Today</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-700 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Response Time</span>
                      <span className="text-white">{mockSupportOverview.avgResponseTime.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Agents</span>
                      <span className="text-white">{mockSupportOverview.activeAgents}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Customer Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">
                      {mockSupportOverview.customerSatisfaction.toFixed(1)}/5
                    </div>
                    <div className="text-slate-400 mb-4">Average Rating</div>
                    <div className="flex justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < Math.floor(mockSupportOverview.customerSatisfaction) ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">User Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{mockAnalyticsData.dailyActiveUsers}</div>
                    <div className="text-sm text-slate-400">Daily Active Users</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Weekly Growth</span>
                      <span className="text-green-400">+{mockAnalyticsData.weeklyGrowth.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Retention Rate</span>
                      <span className="text-blue-400">{mockAnalyticsData.retentionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      ${mockAnalyticsData.monthlyRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400">Monthly Revenue</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Conversion Rate</span>
                      <span className="text-purple-400">{mockAnalyticsData.conversionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Churn Rate</span>
                      <span className="text-orange-400">{mockAnalyticsData.churnRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">System</span>
                    <Badge className="bg-green-500/20 text-green-400">Excellent</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Trading</span>
                    <Badge className="bg-blue-500/20 text-blue-400">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Support</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400">Responsive</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Growth</span>
                    <Badge className="bg-purple-500/20 text-purple-400">Strong</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Available Reports</CardTitle>
                <CardDescription className="text-slate-400">
                  Read-only access to system and business reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center" disabled>
                    <BarChart3 className="w-6 h-6 mb-2" />
                    <span>System Performance</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center" disabled>
                    <LineChart className="w-6 h-6 mb-2" />
                    <span>Trading Analytics</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center" disabled>
                    <PieChart className="w-6 h-6 mb-2" />
                    <span>User Demographics</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center" disabled>
                    <DollarSign className="w-6 h-6 mb-2" />
                    <span>Revenue Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center" disabled>
                    <Shield className="w-6 h-6 mb-2" />
                    <span>Security Audit</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center" disabled>
                    <Activity className="w-6 h-6 mb-2" />
                    <span>Health Status</span>
                  </Button>
                </div>
                <Alert>
                  <Eye className="h-4 w-4" />
                  <AlertDescription>
                    This is a read-only dashboard. Report generation and data modification features are disabled for viewer access.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}