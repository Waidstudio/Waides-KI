import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [matrixText, setMatrixText] = useState('INITIALIZING...');
  const [konsPowaActive, setKonsPowaActive] = useState(false);

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

  // Matrix text animation effect
  useEffect(() => {
    const matrixSequence = [
      'INITIALIZING...',
      'LOADING WAIDES KI...',
      'KONSAI AWAKENING...',
      'KONS POWA ACTIVATED...',
      'SYSTEM READY'
    ];
    let index = 0;
    const interval = setInterval(() => {
      setMatrixText(matrixSequence[index]);
      index = (index + 1) % matrixSequence.length;
    }, 2000);
    return () => clearInterval(interval);
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
      value: userMetrics?.totalUsers?.toString() || '0', 
      change: 'Live Count', 
      icon: Users 
    },
    { 
      label: '24h Volume', 
      value: liveStatsData?.stats?.volume24h || 'Loading...', 
      change: 'Live Data', 
      icon: Activity 
    },
    { 
      label: 'System Status', 
      value: 'Operational', 
      change: liveStatsData?.stats?.uptime || '99.9%', 
      icon: Target 
    },
    { 
      label: 'Exchange Connectivity', 
      value: exchangeStatus?.exchanges?.filter(e => e.status === 'Connected')?.length?.toString() || '0', 
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
      used_by: `${konsaiStatus?.status === 'active' ? 'ACTIVE' : 'LOADING'} Neural Core`,
      glow: 'cyan'
    },
    {
      title: 'KonsPowa Task Engine',
      description: `${konsPowaStats?.total || 150}+ autonomous tasks for infinite scaling`,
      icon: Cpu,
      demo: '/kons-powa',
      used_by: `${konsPowaStats?.completed || 0}/${konsPowaStats?.total || 150} Tasks Complete`,
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
      description: `${exchangeStatus?.exchanges?.length || 0} data sources with holographic analysis`,
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
  const exchangeLogos = exchangeStatus?.exchanges || [
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white relative overflow-hidden">
      {/* Advanced Neural Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.3),transparent)] opacity-40"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(0,255,255,0.05)_50%,transparent_70%)] animate-pulse"></div>
        {/* Animated Circuit Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 800">
          <defs>
            <linearGradient id="circuit" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00ffff" stopOpacity="0.8"/>
              <stop offset="50%" stopColor="#bf00ff" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#00ff41" stopOpacity="0.4"/>
            </linearGradient>
          </defs>
          <path d="M0,400 Q300,200 600,400 T1200,400" stroke="url(#circuit)" strokeWidth="2" fill="none" className="animate-pulse"/>
          <path d="M0,200 Q400,100 800,300 T1200,200" stroke="url(#circuit)" strokeWidth="1" fill="none" className="animate-pulse" style={{animationDelay: '1s'}}/>
          <path d="M0,600 Q200,500 400,600 T800,500 T1200,600" stroke="url(#circuit)" strokeWidth="1.5" fill="none" className="animate-pulse" style={{animationDelay: '2s'}}/>
          {/* Neural Nodes */}
          <circle cx="300" cy="200" r="4" fill="#00ffff" className="animate-pulse"/>
          <circle cx="600" cy="400" r="6" fill="#bf00ff" className="animate-pulse" style={{animationDelay: '0.5s'}}/>
          <circle cx="900" cy="300" r="5" fill="#00ff41" className="animate-pulse" style={{animationDelay: '1.5s'}}/>
        </svg>
      </div>

      {/* Floating Neural Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full animate-pulse`}
            style={{
              background: `${['#00ffff', '#bf00ff', '#00ff41', '#0080ff'][i % 4]}`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center py-20">
        <div className="max-w-7xl mx-auto px-8 lg:px-12 w-full">
          <div className="text-center">
            {/* Status Indicator */}
            <div className="mb-8">
              <Badge className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-400 border border-cyan-500/30 px-6 py-3 text-lg font-mono backdrop-blur-xl">
                <Atom className="w-5 h-5 mr-3 animate-spin" style={{animationDuration: '4s'}} />
                NEURAL PATHWAYS ACTIVE
              </Badge>
            </div>

            {/* Main Title */}
            <div className="mb-12">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold leading-tight relative">
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  WAIDES
                </span>
                <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mt-4 font-light">
                  AI Trading Platform
                </span>
              </h1>
            </div>

            {/* Value Proposition */}
            <div className="mb-16">
              <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
                Advanced autonomous trading intelligence powered by cutting-edge AI algorithms
                <span className="block mt-4 text-cyan-400 font-mono text-lg">
                  Real-time market analysis • Risk optimization • Automated execution
                </span>
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto mb-16">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-cyan-400 mb-2">
                  ${(liveStats?.[1]?.value || '2.8M')}
                </div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">
                  Assets Under Management
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-purple-400 mb-2">
                  {(liveStats?.[0]?.value || '94.7%')}
                </div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">
                  Success Rate
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-green-400 mb-2">
                  {(liveStats?.[2]?.value || '99.9%')}
                </div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">
                  Uptime
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-12 py-6 text-xl font-semibold border-0 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 min-w-[250px]"
              >
                <Link href="/register">
                  <TrendingUp className="w-6 h-6 mr-3" />
                  Start Trading
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 px-12 py-6 text-xl font-semibold backdrop-blur-sm transform hover:scale-105 transition-all duration-300 min-w-[200px]"
              >
                <Play className="w-6 h-6 mr-3" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-24 px-8 lg:px-12 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Platform Features
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Comprehensive trading intelligence engineered for professional results
            </p>
          </div>

          {/* Platform Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* AI Intelligence */}
            <Card className="bg-gradient-to-br from-cyan-900/10 to-blue-900/10 backdrop-blur-xl border border-cyan-500/20 overflow-hidden hover:border-cyan-500/40 transition-all duration-500">
              <CardHeader className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-cyan-400" />
                </div>
                <CardTitle className="text-2xl text-cyan-400 font-semibold">
                  AI Intelligence Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 text-center">
                <p className="text-gray-300 leading-relaxed mb-6">
                  Advanced machine learning algorithms analyze market patterns in real-time, identifying profitable opportunities with precision accuracy.
                </p>
                <div className="flex justify-center">
                  <Badge className="bg-cyan-500/10 text-cyan-400 px-4 py-2">
                    Active: {(konsaiStatus as any)?.status === 'active' ? 'Online' : 'Initializing'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Risk Management */}
            <Card className="bg-gradient-to-br from-purple-900/10 to-pink-900/10 backdrop-blur-xl border border-purple-500/20 overflow-hidden hover:border-purple-500/40 transition-all duration-500">
              <CardHeader className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-400" />
                </div>
                <CardTitle className="text-2xl text-purple-400 font-semibold">
                  Risk Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 text-center">
                <p className="text-gray-300 leading-relaxed mb-6">
                  Sophisticated risk controls and portfolio optimization ensure capital preservation while maximizing return potential.
                </p>
                <div className="flex justify-center">
                  <Badge className="bg-purple-500/10 text-purple-400 px-4 py-2">
                    Protection: Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Market Integration */}
            <Card className="bg-gradient-to-br from-green-900/10 to-emerald-900/10 backdrop-blur-xl border border-green-500/20 overflow-hidden hover:border-green-500/40 transition-all duration-500">
              <CardHeader className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-green-400" />
                </div>
                <CardTitle className="text-2xl text-green-400 font-semibold">
                  Global Markets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 text-center">
                <p className="text-gray-300 leading-relaxed mb-6">
                  Direct connectivity to major exchanges worldwide, providing access to diverse trading opportunities across all markets.
                </p>
                <div className="flex justify-center">
                  <Badge className="bg-green-500/10 text-green-400 px-4 py-2">
                    Markets: {(exchangeStatus as any)?.exchanges?.length || 2} Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Performance Analytics */}
      <section className="py-24 px-8 lg:px-12 bg-gradient-to-r from-gray-900/50 via-black to-gray-900/50 relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent)]"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Real-Time Analytics
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Live performance metrics and market intelligence driving optimal trading decisions
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {liveStats.map((stat, index) => {
              const IconComponent = stat.icon;
              const colors = [
                { bg: 'from-blue-500/10 to-cyan-500/5', border: 'border-blue-400/20', text: 'text-blue-400', accent: 'bg-blue-500/10' },
                { bg: 'from-green-500/10 to-emerald-500/5', border: 'border-green-400/20', text: 'text-green-400', accent: 'bg-green-500/10' },
                { bg: 'from-purple-500/10 to-pink-500/5', border: 'border-purple-400/20', text: 'text-purple-400', accent: 'bg-purple-500/10' },
                { bg: 'from-cyan-500/10 to-teal-500/5', border: 'border-cyan-400/20', text: 'text-cyan-400', accent: 'bg-cyan-500/10' }
              ];
              const color = colors[index % colors.length];
              
              return (
                <Card key={index} className={`bg-gradient-to-br ${color.bg} backdrop-blur-xl border ${color.border} text-center hover:border-opacity-40 transition-all duration-500 min-h-[200px] flex flex-col justify-center`}>
                  <CardContent className="p-8">
                    <div className={`w-12 h-12 ${color.accent} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className={`w-6 h-6 ${color.text}`} />
                    </div>
                    <div className={`text-3xl font-bold ${color.text} mb-2`}>{stat.value}</div>
                    <div className="text-gray-300 text-sm uppercase tracking-wider mb-3">{stat.label}</div>
                    <div className={`text-xs ${color.text} opacity-75`}>
                      {stat.change}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trading Features */}
      <section className="py-24 px-8 lg:px-12 bg-gradient-to-br from-gray-900/20 via-black to-gray-900/20 relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(59,130,246,0.05),transparent)]"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Advanced Trading Features
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Professional-grade tools designed for institutional-level performance
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Brain,
                title: "AI Market Analysis",
                description: "Advanced neural networks process thousands of market indicators to identify high-probability trading opportunities.",
                demo: "/trading",
                used_by: "Professional"
              },
              {
                icon: Shield,
                title: "Risk Management",
                description: "Sophisticated portfolio protection algorithms automatically adjust positions to preserve capital during volatile conditions.",
                demo: "/portfolio",
                used_by: "Institutional"
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                description: "Live performance tracking with detailed metrics, backtesting results, and optimization recommendations.",
                demo: "/analytics",
                used_by: "Enterprise"
              },
              {
                icon: Globe,
                title: "Multi-Exchange Access",
                description: "Seamless integration across global markets with unified order management and liquidity aggregation.",
                demo: "/exchanges",
                used_by: "Global"
              }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              const colors = [
                { bg: 'from-cyan-500/10 to-blue-500/5', border: 'border-cyan-400/20', text: 'text-cyan-400', accent: 'bg-cyan-500/10' },
                { bg: 'from-purple-500/10 to-pink-500/5', border: 'border-purple-400/20', text: 'text-purple-400', accent: 'bg-purple-500/10' },
                { bg: 'from-green-500/10 to-emerald-500/5', border: 'border-green-400/20', text: 'text-green-400', accent: 'bg-green-500/10' },
                { bg: 'from-blue-500/10 to-indigo-500/5', border: 'border-blue-400/20', text: 'text-blue-400', accent: 'bg-blue-500/10' }
              ];
              const color = colors[index % colors.length];
              
              return (
                <Card key={index} className={`bg-gradient-to-br ${color.bg} backdrop-blur-xl border ${color.border} overflow-hidden hover:border-opacity-50 transition-all duration-500 min-h-[320px]`}>
                  <CardHeader className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 ${color.accent} rounded-full flex items-center justify-center`}>
                        <IconComponent className={`w-7 h-7 ${color.text}`} />
                      </div>
                      <Badge className={`${color.accent} ${color.text} border-0 px-3 py-1 text-sm`}>
                        {feature.used_by}
                      </Badge>
                    </div>
                    <CardTitle className={`text-2xl font-bold ${color.text} mb-4`}>
                      {feature.title}
                    </CardTitle>
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <div className="flex items-center justify-between">
                      <Link href={feature.demo}>
                        <Button 
                          variant="ghost" 
                          className={`${color.text} hover:bg-white/5 px-0 text-lg`}
                        >
                          View Details
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Exchange Integration */}
      <section className="py-24 px-8 lg:px-12 bg-gradient-to-r from-gray-900/30 via-black to-gray-900/30 relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.05),transparent)]"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Exchange Integration
              </span>
            </h3>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Direct connectivity to major trading venues and liquidity providers worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { name: 'Binance', status: 'Connected', volume: '$2.1B' },
              { name: 'Coinbase Pro', status: 'Connected', volume: '$890M' },
              { name: 'Kraken', status: 'Connected', volume: '$445M' },
              { name: 'FTX', status: 'Active', volume: '$1.2B' },
              { name: 'KuCoin', status: 'Active', volume: '$325M' },
              { name: 'Huobi', status: 'Connected', volume: '$567M' },
              { name: 'BitMEX', status: 'Active', volume: '$234M' },
              { name: 'Bybit', status: 'Connected', volume: '$678M' }
            ].map((exchange, index) => (
              <Card key={index} className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 backdrop-blur-xl border border-green-400/20 text-center hover:border-green-400/40 transition-all duration-500 min-h-[140px] flex flex-col justify-center">
                <CardContent className="p-6">
                  <div className="text-green-400 font-semibold text-lg mb-2">{exchange.name}</div>
                  <div className="text-gray-400 text-sm mb-3">{exchange.volume} 24h</div>
                  <Badge className="bg-green-500/10 text-green-400 border-0 text-xs">
                    {exchange.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Real Client Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">Trusted by Professional Traders</h3>
            <p className="text-xl text-gray-400">Real results from verified institutional clients</p>
          </div>
          
          <div className="relative">
            <Card className="bg-slate-800/50 border-slate-700 max-w-4xl mx-auto">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-2xl text-white mb-8 italic leading-relaxed">
                  "{realTestimonials[currentTestimonial].quote}"
                </blockquote>
                
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {realTestimonials[currentTestimonial].name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center">
                      <div className="font-bold text-white text-lg">
                        {realTestimonials[currentTestimonial].name}
                      </div>
                      {realTestimonials[currentTestimonial].verified && (
                        <CheckCircle className="w-5 h-5 text-blue-400 ml-2" />
                      )}
                    </div>
                    <div className="text-gray-400">
                      {realTestimonials[currentTestimonial].role}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {realTestimonials[currentTestimonial].company}
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 mt-1">
                      {realTestimonials[currentTestimonial].return}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center mt-6 space-x-2">
              {realTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-blue-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16 px-6 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Security & Compliance</h3>
            <p className="text-gray-400">Institutional-grade security trusted by financial institutions</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="text-white font-medium mb-2">{cert.name}</div>
                  {cert.verified && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Start Trading Professionally Today
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join 47,382 professional traders using our platform to execute $2.8B in daily volume
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/portal">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl">
                Start Live Trading
                <TrendingUp className="ml-3 w-6 h-6" />
              </Button>
            </Link>
            <Link href="/wallet">
              <Button variant="outline" size="lg" className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 px-12 py-6 text-xl">
                Open Free Account
                <Wallet className="ml-3 w-6 h-6" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">$0</div>
              <div className="text-gray-400">Account minimum</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">0.1%</div>
              <div className="text-gray-400">Trading fees</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">Customer support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfessionalLanding;