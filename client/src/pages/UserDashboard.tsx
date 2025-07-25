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
  Monitor,
  BookOpen,
  Rocket,
  Globe,
  Cpu,
  Network,
  Layers,
  Sparkles,
  Gamepad2,
  Fingerprint,
  Scan,
  ChevronRight
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
    { title: 'Start Trade', href: '/waidbot-engine', icon: Target, color: 'bg-emerald-600' },
    { title: 'Waides KI Chat', href: '/portal', icon: Brain, color: 'bg-purple-600' },
    { title: 'View Wallet', href: '/wallet', icon: Wallet, color: 'bg-blue-600' },
    { title: 'Analytics', href: '/analytics', icon: BarChart3, color: 'bg-orange-600' }
  ];

  const futuristicFeatures = [
    {
      title: 'AI Learning Lab',
      description: 'Advanced neural network training modules',
      icon: BookOpen,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      href: '/learning',
      badge: 'NEW'
    },
    {
      title: 'Quantum Analytics',
      description: 'Next-gen market prediction algorithms',
      icon: Cpu,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      href: '/quantum-analytics',
      badge: 'BETA'
    },
    {
      title: 'Neural Trading',
      description: 'Deep learning autonomous trading system',
      icon: Network,
      color: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      href: '/neural-trading',
      badge: 'PRO'
    },
    {
      title: 'Biometric Security',
      description: 'Advanced biometric authentication system',
      icon: Fingerprint,
      color: 'bg-gradient-to-r from-red-500 to-orange-500',
      href: '/biometric-auth',
      badge: 'SECURE'
    },
    {
      title: 'Market Scanner',
      description: 'Real-time global market scanning AI',
      icon: Scan,
      color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      href: '/market-scanner',
      badge: 'LIVE'
    },
    {
      title: 'Holographic UI',
      description: '3D holographic trading interface',
      icon: Layers,
      color: 'bg-gradient-to-r from-cyan-500 to-blue-500',
      href: '/holographic-ui',
      badge: 'FUTURE'
    }
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
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Zap className="mr-2 h-5 w-5 text-yellow-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-200 cursor-pointer backdrop-blur-xl group">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-white font-medium group-hover:text-blue-300 transition-colors">{action.title}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Futuristic Features */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Rocket className="mr-2 h-5 w-5 text-purple-400" />
            Advanced AI Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {futuristicFeatures.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="bg-slate-800/30 border-slate-700 hover:bg-slate-700/40 hover:border-slate-600 transition-all duration-300 cursor-pointer backdrop-blur-xl group overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="secondary" className={`text-xs font-bold ${
                        feature.badge === 'NEW' ? 'bg-green-500/20 text-green-400' :
                        feature.badge === 'BETA' ? 'bg-yellow-500/20 text-yellow-400' :
                        feature.badge === 'PRO' ? 'bg-purple-500/20 text-purple-400' :
                        feature.badge === 'SECURE' ? 'bg-red-500/20 text-red-400' :
                        feature.badge === 'LIVE' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {feature.badge}
                      </Badge>
                    </div>
                    <h3 className="text-white font-semibold mb-2 group-hover:text-blue-300 transition-colors">{feature.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 group-hover:text-slate-300 transition-colors">{feature.description}</p>
                    <div className="flex items-center text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
                      <span>Explore</span>
                      <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
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
                  <Brain className="mr-2 h-5 w-5 text-purple-400" />
                  Waides KI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/15 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-400 font-medium text-sm">Neural Signal</span>
                    </div>
                    <p className="text-white text-sm">Advanced AI detecting bullish momentum. Confidence: 87%</p>
                  </div>
                  
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/15 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <Cpu className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400 font-medium text-sm">Quantum Analysis</span>
                    </div>
                    <p className="text-white text-sm">Multi-dimensional market patterns suggest upward trend.</p>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/15 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <Network className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400 font-medium text-sm">Deep Learning</span>
                    </div>
                    <p className="text-white text-sm">Neural network identified 94% success probability pattern.</p>
                  </div>

                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg hover:bg-orange-500/15 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-orange-400" />
                      <span className="text-orange-400 font-medium text-sm">Risk Matrix</span>
                    </div>
                    <p className="text-white text-sm">Advanced risk assessment: Optimal portfolio balance detected.</p>
                  </div>

                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/15 transition-colors">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-4 w-4 text-cyan-400" />
                      <span className="text-cyan-400 font-medium text-sm">Precision Trading</span>
                    </div>
                    <p className="text-white text-sm">WaidBot AI calculated 15% gain opportunity with low risk.</p>
                  </div>
                </div>

                <Separator className="my-4 bg-slate-600" />

                <div className="space-y-3">
                  <Link href="/portal">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      <Brain className="mr-2 h-4 w-4" />
                      Waides KI Chat Portal
                    </Button>
                  </Link>
                  
                  <Link href="/learning">
                    <Button variant="outline" className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10">
                      <BookOpen className="mr-2 h-4 w-4" />
                      AI Learning Center
                    </Button>
                  </Link>
                </div>
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
                    <span className="text-slate-300">Waides KI Oracle</span>
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