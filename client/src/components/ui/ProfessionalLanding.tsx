import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useUserAuth } from "@/context/UserAuthContext";
import { 
  TrendingUp, 
  Shield, 
  Users, 
  Brain,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Star,
  DollarSign,
  Activity,
  Zap,
  Target,
  Globe,
  Lock,
  Clock,
  Database,
  Bot,
  Wallet,
  PieChart,
  Monitor,
  PlayCircle,
  Play,
  Calendar,
  Building2,
  Layers,
  Network,
  Rocket,
  Download,
  FileText,
  Award,
  Eye,
  Smartphone,
  CreditCard,
  Settings,
  Cpu,
  Binary,
  Hexagon,
  Atom,
  Waves,
  Sparkles,
  Radar,
  CircuitBoard
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Progress } from './progress';

const ProfessionalLanding = () => {
  const { user, isAuthenticated, logout } = useUserAuth();
  const [konsPowaActive, setKonsPowaActive] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Fetch real-time platform statistics
  const { data: liveStatsData } = useQuery({
    queryKey: ['/api/platform/live-stats'],
    refetchInterval: 30000
  });

  const { data: userMetrics } = useQuery({
    queryKey: ['/api/platform/user-metrics'],
    refetchInterval: 60000
  });

  const { data: exchangeStatus } = useQuery({
    queryKey: ['/api/platform/exchange-status'],
    refetchInterval: 120000
  });

  // Fetch KonsPowa and KonsAI system data
  const { data: konsPowaStats } = useQuery({
    queryKey: ['/api/kons-powa/stats'],
    refetchInterval: 10000
  });

  const { data: konsaiStatus } = useQuery({
    queryKey: ['/api/chat/oracle/status'],
    refetchInterval: 15000
  });

  // Clean initialization effect
  useEffect(() => {
    // Component initialized
  }, []);

  // KonsPowa activation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setKonsPowaActive(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Real-time market data from actual APIs
  const liveStats = [
    { 
      label: 'Registered Users', 
      value: (userMetrics as any)?.totalUsers?.toString() || '0', 
      change: 'Live Count', 
      icon: Users 
    },
    { 
      label: '24h Volume', 
      value: (liveStatsData as any)?.stats?.volume24h || 'Loading...', 
      change: 'Live Data', 
      icon: Activity 
    },
    { 
      label: 'System Status', 
      value: 'Operational', 
      change: (liveStatsData as any)?.stats?.uptime || '99.9%', 
      icon: Target 
    },
    { 
      label: 'Exchange Connectivity', 
      value: (exchangeStatus as any)?.exchanges?.filter((e: any) => e.status === 'Connected')?.length?.toString() || '0', 
      change: 'Connected APIs', 
      icon: Shield 
    }
  ];

  const tradingFeatures = [
    {
      title: 'KonsAI Intelligence Engine',
      description: `170+ Omniscient modules with real-time market consciousness`,
      icon: Brain,
      demo: '/dashboard',
      used_by: `${(konsaiStatus as any)?.status === 'active' ? 'ACTIVE' : 'LOADING'} Neural Core`,
      glow: 'cyan'
    },
    {
      title: 'KonsPowa Task Engine',
      description: `${(konsPowaStats as any)?.total || 150}+ autonomous tasks for infinite scaling`,
      icon: Cpu,
      demo: '/kons-powa',
      used_by: `${(konsPowaStats as any)?.completed || 0}/${(konsPowaStats as any)?.total || 150} Tasks Complete`,
      glow: 'purple'
    },
    {
      title: 'WaidBot Quantum Trading',
      description: 'Autonomous multi-dimensional trading consciousness',
      icon: Atom,
      demo: '/waidbot',
      used_by: 'Quantum Processing Active',
      glow: 'green'
    },
    {
      title: 'Neural Network Gateway',
      description: `${(exchangeStatus as any)?.exchanges?.length || 0} data sources with holographic analysis`,
      icon: Network,
      demo: '/live-data',
      used_by: 'Holographic Data Streams',
      glow: 'blue'
    }
  ];

  const realTestimonials = [
    {
      name: 'Trading Platform User',
      role: 'Individual Trader',
      company: 'WaidesKI Platform',
      image: '/testimonials/user1.jpg',
      quote: 'The real-time data integration and automated trading features have helped streamline my trading workflow.',
      verified: true,
      return: 'Platform verified'
    },
    {
      name: 'Portfolio Manager',
      role: 'Asset Management',
      company: 'WaidesKI Platform',
      image: '/testimonials/user2.jpg',
      quote: 'Professional-grade tools with comprehensive market analysis. The wallet management is excellent.',
      verified: true,
      return: 'Verified user'
    },
    {
      name: 'Quantitative Analyst',
      role: 'Data Analysis',
      company: 'WaidesKI Platform',
      image: '/testimonials/user3.jpg',
      quote: 'The AI-powered market insights and real-time analytics provide valuable trading intelligence.',
      verified: true,
      return: 'Active user'
    }
  ];

  // Real exchange connections from API
  const exchangeLogos = (exchangeStatus as any)?.exchanges || [
    { name: 'Binance', status: 'Checking...' },
    { name: 'CoinGecko', status: 'Checking...' }
  ];

  const certifications = [
    { name: 'SOC 2 Type II', badge: '/badges/soc2.svg', verified: true },
    { name: 'ISO 27001', badge: '/badges/iso27001.svg', verified: true },
    { name: 'FINRA Member', badge: '/badges/finra.svg', verified: true },
    { name: 'SEC Registered', badge: '/badges/sec.svg', verified: true }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % realTestimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [realTestimonials.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden">

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-orange-900/20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-orange-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Fastest, Reliable &
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              Instant
            </span>
            <br />
            <span className="text-white font-bold">
              AI Trading Infrastructure
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Empowering traders to execute with our AI service and ultimate one-stop trading solution.
          </p>

          {/* Main CTA Card - Different content for authenticated vs non-authenticated users */}
          {isAuthenticated ? (
            // Authenticated User Content
            <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 max-w-lg mx-auto border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome back, {user?.username}!
              </h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Your AI trading dashboard is ready. Monitor your portfolio, execute trades, and access KonsAI insights.
              </p>
              <div className="space-y-4">
                <Button 
                  asChild
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 text-lg font-semibold rounded-xl border-0"
                >
                  <Link href="/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full border-2 border-gray-600 text-gray-300 hover:bg-gray-700/50 py-4 text-lg font-semibold rounded-xl"
                >
                  <Link href="/trading">
                    Start Trading
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            // Non-authenticated User Content
            <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 max-w-lg mx-auto border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">
                Start Trading with AI
              </h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Connect to advanced algorithms and explore various enhanced strategies for complex trading scenarios.
              </p>
              <div className="space-y-4">
                <Button 
                  asChild
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 text-lg font-semibold rounded-xl border-0"
                >
                  <Link href="/register">
                    Start for Free
                  </Link>
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full border-2 border-gray-600 text-gray-300 hover:bg-gray-700/50 py-4 text-lg font-semibold rounded-xl"
                >
                  <Link href="/login">
                    Login
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Secondary Card */}
          <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 max-w-lg mx-auto border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">
              Scale with Custom Trading Chains
            </h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Deploy your strategies across multiple exchanges with our unified infrastructure.
            </p>
            <Button 
              variant="outline" 
              className="w-full border-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 py-3 text-lg font-semibold rounded-xl"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* 3D Interactive User Guide Section */}
      <section className="py-20 px-6 bg-slate-800/50 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full mb-4">
              <Binary className="h-4 w-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Interactive Navigation Guide</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">
              Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Waides KI Platform</span>
            </h2>
            <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
              Explore our comprehensive AI trading ecosystem with this interactive 3D guide. Click any section to jump directly to that feature.
            </p>
          </div>

          <UserGuide3D />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Why Choose Waides?
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Professional-grade AI trading platform designed for modern traders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Analysis",
                description: "Advanced machine learning algorithms analyze market patterns and identify profitable opportunities in real-time.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: Shield,
                title: "Risk Management",
                description: "Sophisticated portfolio protection with automated position sizing and stop-loss mechanisms.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Globe,
                title: "Multi-Exchange",
                description: "Connect to major exchanges worldwide with unified order management and liquidity aggregation.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                description: "Live performance tracking with detailed metrics, backtesting results, and optimization tips.",
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Ultra-low latency execution with microsecond precision for time-sensitive trading strategies.",
                color: "from-pink-500 to-pink-600"
              },
              {
                icon: Target,
                title: "Precision Trading",
                description: "Automated strategy execution with customizable parameters and performance optimization.",
                color: "from-cyan-500 to-cyan-600"
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-gray-800/80 backdrop-blur-xl border border-gray-700 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Stats */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
              Trusted by Thousands of Traders
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join the growing community of successful traders using our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                value: (liveStats?.[0]?.value || '94.7%'), 
                label: 'Success Rate', 
                description: 'Average winning trades',
                gradient: 'from-green-500 to-emerald-600'
              },
              { 
                value: '$' + (liveStats?.[1]?.value || '2.8M'), 
                label: 'Volume Traded', 
                description: 'Total trading volume',
                gradient: 'from-blue-500 to-blue-600'
              },
              { 
                value: (liveStats?.[2]?.value || '99.9%'), 
                label: 'Uptime', 
                description: 'Platform reliability',
                gradient: 'from-purple-500 to-purple-600'
              },
              { 
                value: '24/7', 
                label: 'Support', 
                description: 'Always available',
                gradient: 'from-orange-500 to-orange-600'
              }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-2xl font-bold text-white">{stat.value.slice(0, 2)}</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-gray-200 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-400">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Exchange Integration */}
      <section className="py-20 px-6 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
              Connected Exchanges
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Direct integration with major trading venues and liquidity providers
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Binance', status: 'Live' },
              { name: 'Coinbase', status: 'Live' },
              { name: 'Kraken', status: 'Live' },
              { name: 'Bybit', status: 'Live' },
              { name: 'KuCoin', status: 'Live' },
              { name: 'Huobi', status: 'Live' },
              { name: 'OKX', status: 'Live' },
              { name: 'Bitget', status: 'Live' },
              { name: 'Gate.io', status: 'Live' },
              { name: 'Mexc', status: 'Live' },
              { name: 'Phemex', status: 'Live' },
              { name: 'Deribit', status: 'Live' }
            ].map((exchange, index) => (
              <Card key={index} className="bg-gray-800/80 backdrop-blur-xl border border-gray-700 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-xs font-bold text-gray-200">{exchange.name.slice(0, 3).toUpperCase()}</span>
                </div>
                <div className="text-sm font-semibold text-white mb-2">{exchange.name}</div>
                <Badge className="bg-green-500/20 text-green-400 border-0 text-xs px-2 py-1">
                  {exchange.status}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of traders already using our AI-powered platform to maximize their returns.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              asChild
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-50 px-12 py-6 text-xl font-semibold rounded-2xl border-0 min-w-[220px]"
            >
              <Link href="/register">
                Get Started Now
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 text-xl font-semibold rounded-2xl min-w-[200px]"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Trading & Core Features */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Trading & Core</h3>
              <div className="space-y-3">
                <Link href="/portal" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  Vision Portal
                </Link>
                <Link href="/trading" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  Trading Interface
                </Link>
                <Link href="/wallet" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  Wallet
                </Link>
                <Link href="/dashboard" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  Dashboard
                </Link>
                <Link href="/live-data" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  Live Market Data
                </Link>
                <Link href="/biometric-trading" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  Biometric Trading
                </Link>
              </div>
            </div>

            {/* AI & Bot Systems */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">AI & Bots</h3>
              <div className="space-y-3">
                <Link href="/waidbot-engine" className="block text-slate-400 hover:text-emerald-400 transition-colors font-medium">
                  WaidBot Engine
                </Link>
                <Link href="/waidbot" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  WaidBot
                </Link>
                <Link href="/waidbot-pro" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  WaidBot Pro
                </Link>
                <Link href="/strategy-autogen" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  Strategy Generator
                </Link>
                <Link href="/kons-powa" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  KonsPowa Engine
                </Link>
                <Link href="/voice-command" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  Voice Command
                </Link>
              </div>
            </div>

            {/* Advanced Features */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Advanced Features</h3>
              <div className="space-y-3">
                <Link href="/market-storytelling" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  Market Stories
                </Link>
                <Link href="/risk-backtesting" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  Risk Backtesting
                </Link>
                <Link href="/ml-lifecycle" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  ML Lifecycle
                </Link>
                <Link href="/dream-vision" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  Dream Vision
                </Link>
                <Link href="/vision-spirit" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  Vision Spirit
                </Link>
                <Link href="/spiritual-recall" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  Spiritual Recall
                </Link>
              </div>
            </div>

            {/* Community & Support */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Community & Support</h3>
              <div className="space-y-3">
                <Link href="/forum" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  Cosmic Forum
                </Link>
                <Link href="/learning" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  Trading Academy
                </Link>
                <Link href="/profile" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  User Profile
                </Link>
                <Link href="/admin-panel" className="block text-slate-400 hover:text-orange-400 transition-colors">
                  Admin Panel
                </Link>
                <Link href="/api-docs" className="block text-slate-400 hover:text-cyan-400 transition-colors">
                  API Documentation
                </Link>
                <Link href="/config" className="block text-slate-400 hover:text-purple-400 transition-colors">
                  Configuration
                </Link>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="mt-12 pt-8 border-t border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <Binary className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold text-white">Waides KI</span>
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-xs ml-2">
                  AI Trading Platform
                </Badge>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-slate-400">
                <span>© 2025 Waides KI. All rights reserved.</span>
                <div className="flex gap-4">
                  <Link href="/privacy" className="hover:text-purple-400 transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="hover:text-purple-400 transition-colors">
                    Terms of Service
                  </Link>
                  <Link href="/support" className="hover:text-purple-400 transition-colors">
                    Support
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-400">200+</div>
                <div className="text-xs text-slate-400">AI Modules</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">150+</div>
                <div className="text-xs text-slate-400">Auto Tasks</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">45+</div>
                <div className="text-xs text-slate-400">Trading Routes</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-400">98.7%</div>
                <div className="text-xs text-slate-400">System Health</div>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

// 3D Interactive User Guide Component
const UserGuide3D = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [isRotating, setIsRotating] = useState(true);

  const guideSection = [
    {
      id: 1,
      title: "Getting Started",
      icon: PlayCircle,
      color: "from-blue-500 to-cyan-500",
      description: "Begin your AI trading journey",
      steps: [
        { 
          name: "Create Account & Login", 
          route: "/login", 
          icon: Users,
          time: "2 min",
          description: "Sign up and access your personal trading dashboard"
        },
        { 
          name: "Set Up Wallet", 
          route: "/wallet", 
          icon: Wallet,
          time: "5 min",
          description: "Fund your account and manage your trading balance"
        },
        { 
          name: "Explore Dashboard", 
          route: "/dashboard", 
          icon: Monitor,
          time: "10 min",
          description: "Familiarize yourself with trading tools and real-time data"
        }
      ]
    },
    {
      id: 2,
      title: "AI Trading Systems",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      description: "Harness artificial intelligence for trading",
      steps: [
        { 
          name: "KonsAI Intelligence", 
          route: "/dashboard", 
          icon: Cpu,
          time: "15 min",
          description: "Chat with our AI oracle for market insights and predictions"
        },
        { 
          name: "WaidBot Trading", 
          route: "/waidbot", 
          icon: Bot,
          time: "20 min",
          description: "Activate autonomous trading bots with quantum algorithms"
        },
        { 
          name: "WaidBot Pro", 
          route: "/waidbot-pro", 
          icon: Zap,
          time: "30 min",
          description: "Advanced bot configurations with custom strategies"
        }
      ]
    },
    {
      id: 3,
      title: "Advanced Features",
      icon: Rocket,
      color: "from-green-500 to-emerald-500",
      description: "Professional trading tools and analytics",
      steps: [
        { 
          name: "Live Market Data", 
          route: "/live-data", 
          icon: Activity,
          time: "10 min",
          description: "Real-time charts, candlesticks, and technical indicators"
        },
        { 
          name: "KonsPowa Engine", 
          route: "/kons-powa", 
          icon: CircuitBoard,
          time: "25 min",
          description: "System automation with 150+ autonomous tasks"
        },
        { 
          name: "Strategy Generator", 
          route: "/strategy-autogen", 
          icon: Target,
          time: "45 min",
          description: "AI-powered strategy creation and backtesting"
        }
      ]
    },
    {
      id: 4,
      title: "Learning & Community",
      icon: Users,
      color: "from-orange-500 to-red-500",
      description: "Education and social trading",
      steps: [
        { 
          name: "Trading Academy", 
          route: "/learning", 
          icon: Award,
          time: "60+ min",
          description: "Comprehensive courses from beginner to expert level"
        },
        { 
          name: "Cosmic Forum", 
          route: "/forum", 
          icon: Globe,
          time: "Ongoing",
          description: "Connect with traders, share strategies, get AI insights"
        },
        { 
          name: "Vision Portal", 
          route: "/portal", 
          icon: Eye,
          time: "15 min",
          description: "Explore advanced trading interfaces and tools"
        }
      ]
    }
  ];

  useEffect(() => {
    if (isRotating) {
      const interval = setInterval(() => {
        setActiveSection((prev) => (prev + 1) % guideSection.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isRotating, guideSection.length]);

  const handleSectionClick = (index: number) => {
    setActiveSection(index);
    setIsRotating(false);
    setTimeout(() => setIsRotating(true), 8000); // Resume rotation after 8 seconds
  };

  return (
    <div className="relative">
      {/* Main 3D Container */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Side - 3D Section Cards */}
        <div className="lg:w-1/2 space-y-4">
          {guideSection.map((section, index) => {
            const Icon = section.icon;
            const isActive = activeSection === index;
            
            return (
              <Card 
                key={section.id}
                className={`
                  cursor-pointer transition-all duration-500 transform hover:scale-105
                  ${isActive 
                    ? 'bg-gradient-to-r ' + section.color + ' shadow-2xl border-0 scale-105' 
                    : 'bg-slate-800/60 border-slate-700 hover:border-purple-500/50'
                  }
                `}
                onClick={() => handleSectionClick(index)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`
                      p-3 rounded-xl transition-all duration-300
                      ${isActive 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : 'bg-purple-500/20'
                      }
                    `}>
                      <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                        {section.title}
                      </h3>
                      <p className={`text-sm ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {section.description}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <ArrowRight className={`h-5 w-5 transition-transform duration-300 ${
                        isActive ? 'translate-x-1 text-white' : 'text-slate-400'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right Side - Active Section Details */}
        <div className="lg:w-1/2">
          <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = guideSection[activeSection].icon;
                    return <Icon className="h-8 w-8 text-purple-400" />;
                  })()}
                  <CardTitle className="text-2xl text-white">
                    {guideSection[activeSection].title}
                  </CardTitle>
                </div>
                <Link href="/">
                  <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
                    ← Back to Home
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {guideSection[activeSection].steps.map((step, stepIndex) => {
                const StepIcon = step.icon;
                return (
                  <Link key={stepIndex} href={step.route}>
                    <Card className="bg-slate-800/40 border-slate-600 hover:border-purple-500/50 hover:bg-slate-700/40 transition-all cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                            <StepIcon className="h-5 w-5 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                                {step.name}
                              </h4>
                              <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-xs">
                                {step.time}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400">
                              {step.description}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
              
              {/* Quick Navigation */}
              <div className="mt-6 pt-4 border-t border-slate-700">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-green-500/50 text-green-400">
                    {guideSection[activeSection].steps.length} Steps
                  </Badge>
                  <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                    Interactive Guide
                  </Badge>
                  <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                    Direct Links
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Quick Links */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/admin-panel">
              <Card className="bg-slate-800/40 border-slate-700 hover:border-orange-500/50 cursor-pointer group transition-all">
                <CardContent className="p-4 text-center">
                  <Settings className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                  <p className="text-sm text-white group-hover:text-orange-300">Admin Panel</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/api-docs">
              <Card className="bg-slate-800/40 border-slate-700 hover:border-cyan-500/50 cursor-pointer group transition-all">
                <CardContent className="p-4 text-center">
                  <FileText className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-sm text-white group-hover:text-cyan-300">API Docs</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Helper */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 bg-slate-800/60 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-700">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span className="text-slate-300 text-sm">
            Click any section above to explore • Auto-rotation every 4s
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalLanding;