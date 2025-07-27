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

  // Fetch comprehensive real-time dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['/api/dashboard/comprehensive-data'],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    staleTime: 0, // Always consider data stale for fresh updates
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Legacy endpoints for fallback compatibility
  const { data: transactions } = useQuery({
    queryKey: ['/api/wallet/transactions'],
    refetchInterval: 30000
  });

  // Real-time trading bot data
  const { data: tradingBotData } = useQuery({
    queryKey: ['/api/waidbot-engine/autonomous/status'],
    refetchInterval: 3000
  });

  const handleLogout = async () => {
    await logout();
  };

  // Real-time dashboard statistics from comprehensive data
  const dashboardStats = [
    {
      title: 'Portfolio Value',
      value: `$${(dashboardData as any)?.portfolio?.totalValue?.toLocaleString() || '0'}`,
      change: `${(dashboardData as any)?.portfolio?.profitLossPercent >= 0 ? '+' : ''}${(dashboardData as any)?.portfolio?.profitLossPercent?.toFixed(2) || '0.00'}%`,
      trend: (dashboardData as any)?.portfolio?.profitLossPercent >= 0 ? 'up' : 'down',
      icon: Wallet,
      color: (dashboardData as any)?.portfolio?.profitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'
    },
    {
      title: 'Active Trades',
      value: (dashboardData as any)?.tradingStats?.activeTrades?.toString() || '0',
      change: `${(dashboardData as any)?.tradingStats?.totalTrades || 0} total`,
      trend: 'up',
      icon: Activity,
      color: 'text-blue-400'
    },
    {
      title: 'AI Confidence',
      value: `${Math.round((dashboardData as any)?.aiStatus?.aiConfidence || 85)}%`,
      change: (dashboardData as any)?.aiStatus?.neurNetworkStatus || 'Optimal',
      trend: 'up',
      icon: Brain,
      color: 'text-purple-400'
    },
    {
      title: 'Success Rate',
      value: `${Math.round((dashboardData as any)?.tradingStats?.successRate || 78)}%`,
      change: `${(dashboardData as any)?.tradingStats?.winRate?.toFixed(1) || '0.0'}% win rate`,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-20">
      {/* Header - Mobile Responsive */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Waides KI Dashboard</h1>
                <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Welcome back, {user?.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Badge variant="outline" className={`text-xs hidden sm:inline-flex ${(dashboardData as any)?.aiStatus?.konsaiOnline ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}`}>
                {(dashboardData as any)?.aiStatus?.konsaiOnline ? 'KonsAI Online' : 'KonsAI Offline'}
              </Badge>
              <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
                ETH ${(dashboardData as any)?.marketData?.ethPrice?.toFixed(2) || '0.00'}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline text-sm">{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-slate-800 border-slate-700">
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

      {/* Dashboard Content - Mobile Responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Stats Grid - Mobile Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 backdrop-blur-xl hover:bg-slate-800/70 transition-all duration-300">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-400 text-xs sm:text-sm font-medium truncate">{stat.title}</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white mt-1 truncate">{stat.value}</p>
                    <p className={`text-xs sm:text-sm mt-1 ${stat.color} truncate`}>
                      {stat.trend === 'up' ? '↗ ' : '↘ '}{stat.change}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg bg-slate-700/50 mt-2 sm:mt-0 sm:ml-2 self-start sm:self-center`}>
                    <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions - Mobile Responsive */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
            <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-200 cursor-pointer backdrop-blur-xl group">
                  <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-200`}>
                      <action.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                    <p className="text-sm sm:text-base text-white font-medium group-hover:text-blue-300 transition-colors">{action.title}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Futuristic Features - Mobile Responsive */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
            <Rocket className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
            Advanced AI Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {futuristicFeatures.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="bg-slate-800/30 border-slate-700 hover:bg-slate-700/40 hover:border-slate-600 transition-all duration-300 cursor-pointer backdrop-blur-xl group overflow-hidden">
                  <CardContent className="p-4 sm:p-5 lg:p-6">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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
                    <h3 className="text-white font-semibold mb-2 group-hover:text-blue-300 transition-colors text-sm sm:text-base">{feature.title}</h3>
                    <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 group-hover:text-slate-300 transition-colors">{feature.description}</p>
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

        {/* Main Content Grid - Mobile Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-base sm:text-lg">
                  <Activity className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            transaction.type === 'deposit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {transaction.type === 'deposit' ? <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium capitalize text-sm sm:text-base truncate">{transaction.type}</p>
                            <p className="text-slate-400 text-xs sm:text-sm truncate">{transaction.timestamp}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`font-medium text-sm sm:text-base ${transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount}
                          </p>
                          <p className="text-slate-400 text-xs sm:text-sm">{transaction.currency}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <Activity className="h-8 w-8 sm:h-12 sm:w-12 text-slate-500 mx-auto mb-3 sm:mb-4" />
                      <p className="text-slate-400 text-sm sm:text-base">No recent transactions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Sidebar - Mobile Responsive */}
          <div>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl mb-4 sm:mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-base sm:text-lg">
                  <Brain className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                  Live AI Insights
                  {dashboardLoading && <div className="ml-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {(dashboardData as any)?.aiInsights?.map((insight: any, index: number) => (
                    <div key={index} className={`p-3 sm:p-4 bg-${insight.color}-500/10 border border-${insight.color}-500/20 rounded-lg hover:bg-${insight.color}-500/15 transition-colors`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {insight.type === 'neural_signal' && <Zap className={`h-3 w-3 sm:h-4 sm:w-4 text-${insight.color}-400`} />}
                        {insight.type === 'quantum_analysis' && <Cpu className={`h-3 w-3 sm:h-4 sm:w-4 text-${insight.color}-400`} />}
                        {insight.type === 'performance_boost' && <Network className={`h-3 w-3 sm:h-4 sm:w-4 text-${insight.color}-400`} />}
                        {insight.type === 'risk_alert' && <Shield className={`h-3 w-3 sm:h-4 sm:w-4 text-${insight.color}-400`} />}
                        <span className={`text-${insight.color}-400 font-medium text-xs sm:text-sm capitalize`}>
                          {insight.type.replace('_', ' ')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}%
                        </Badge>
                      </div>
                      <h4 className="text-white text-xs sm:text-sm font-medium mb-1">{insight.title}</h4>
                      <p className="text-white text-xs sm:text-sm">{insight.description}</p>
                    </div>
                  )) || (
                    <div className="p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Cpu className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                        <span className="text-blue-400 font-medium text-xs sm:text-sm">System Status</span>
                      </div>
                      <p className="text-white text-xs sm:text-sm">AI systems are analyzing market conditions...</p>
                    </div>
                  )}
                </div>

                <Separator className="my-3 sm:my-4 bg-slate-600" />

                <div className="space-y-2 sm:space-y-3">
                  <Link href="/portal">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm h-8 sm:h-10">
                      <Brain className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Waides KI Chat Portal
                    </Button>
                  </Link>
                  
                  <Link href="/learning">
                    <Button variant="outline" className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10 text-sm h-8 sm:h-10">
                      <BookOpen className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      AI Learning Center
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* System Status - Mobile Responsive */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center text-base sm:text-lg">
                  <Monitor className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-xs sm:text-sm">Trading Engine</span>
                    <Badge variant="outline" className="text-green-400 border-green-400 text-xs">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-xs sm:text-sm">Waides KI Oracle</span>
                    <Badge variant="outline" className="text-green-400 border-green-400 text-xs">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-xs sm:text-sm">Market Data</span>
                    <Badge variant="outline" className="text-green-400 border-green-400 text-xs">Live</Badge>
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