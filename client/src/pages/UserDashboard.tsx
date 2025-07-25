import React, { useState, useEffect } from 'react';
import { useUserAuth } from '@/context/UserAuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  BarChart3,
  Brain,
  Zap,
  Shield,
  Users,
  Activity,
  Clock,
  Star,
  Target,
  Bot,
  Eye,
  Settings,
  LogOut,
  User,
  PieChart,
  Monitor
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const UserDashboard = () => {
  const { user, logout } = useUserAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user-specific data
  const { data: walletData } = useQuery({
    queryKey: ['/api/wallet/balance'],
    refetchInterval: 10000
  });

  const { data: transactions } = useQuery({
    queryKey: ['/api/wallet/transactions'],
    refetchInterval: 30000
  });

  const { data: konsaiStatus } = useQuery({
    queryKey: ['/api/chat/oracle/status'],
    refetchInterval: 15000
  });

  const { data: liveStats } = useQuery({
    queryKey: ['/api/platform/live-stats'],
    refetchInterval: 30000
  });

  const handleLogout = async () => {
    await logout();
  };

  const dashboardStats = [
    {
      title: 'Portfolio Value',
      value: `$${(walletData as any)?.balance?.toLocaleString() || '0'}`,
      change: '+12.5%',
      trend: 'up',
      icon: Wallet,
      color: 'text-green-400'
    },
    {
      title: 'Active Trades',
      value: (liveStats as any)?.stats?.activeTrades || '0',
      change: '+3 today',
      trend: 'up',
      icon: Activity,
      color: 'text-blue-400'
    },
    {
      title: 'AI Confidence',
      value: `${(liveStats as any)?.stats?.aiConfidence || 85}%`,
      change: 'High',
      trend: 'up',
      icon: Brain,
      color: 'text-purple-400'
    },
    {
      title: 'Success Rate',
      value: `${(liveStats as any)?.stats?.successRate || 78}%`,
      change: '+5.2%',
      trend: 'up',
      icon: Target,
      color: 'text-emerald-400'
    }
  ];

  const quickActions = [
    { title: 'Start Trading', href: '/trading', icon: BarChart3, color: 'bg-blue-600' },
    { title: 'Portfolio', href: '/portfolio', icon: PieChart, color: 'bg-purple-600' },
    { title: 'KonsAI Chat', href: '/chat', icon: Bot, color: 'bg-emerald-600' },
    { title: 'Analytics', href: '/analytics', icon: Monitor, color: 'bg-orange-600' }
  ];

  const recentTransactions = (transactions as any)?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Waides KI Dashboard</h1>
                <p className="text-slate-400">Welcome back, {user?.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-400 border-green-400">
                {(konsaiStatus as any)?.status === 'active' ? 'KonsAI Online' : 'KonsAI Offline'}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.color}`}>
                      {stat.trend === 'up' ? '↗ ' : '↘ '}{stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-slate-700/50`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer backdrop-blur-xl">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-white font-medium">{action.title}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'deposit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {transaction.type === 'deposit' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-white font-medium capitalize">{transaction.type}</p>
                            <p className="text-slate-400 text-sm">{transaction.timestamp}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount}
                          </p>
                          <p className="text-slate-400 text-sm">{transaction.currency}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400">No recent transactions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Sidebar */}
          <div>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="mr-2 h-5 w-5" />
                  KonsAI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-400 font-medium text-sm">Market Signal</span>
                    </div>
                    <p className="text-white text-sm">ETH showing bullish momentum. Consider long positions.</p>
                  </div>
                  
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 font-medium text-sm">Risk Assessment</span>
                    </div>
                    <p className="text-white text-sm">Current portfolio risk level: Moderate</p>
                  </div>
                </div>
                
                <Button asChild className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                  <Link href="/chat">
                    Chat with KonsAI
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Monitor className="mr-2 h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Trading Engine</span>
                    <Badge variant="outline" className="text-green-400 border-green-400">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">KonsAI Oracle</span>
                    <Badge variant="outline" className="text-green-400 border-green-400">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Market Data</span>
                    <Badge variant="outline" className="text-green-400 border-green-400">Live</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;