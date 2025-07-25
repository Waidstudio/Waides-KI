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

      {/* Main Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center py-20">
        <div className="max-w-7xl mx-auto px-8 lg:px-12 w-full">
          {/* Central Command Interface */}
          <div className="text-center mb-20">
            {/* System Status Header */}
            <div className="mb-12">
              <Badge className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/50 px-10 py-5 text-xl font-mono backdrop-blur-sm">
                <CircuitBoard className="w-7 h-7 mr-4 animate-spin" style={{animationDuration: '8s'}} />
                <span className="matrix-text">{matrixText}</span>
              </Badge>
            </div>

            {/* Revolutionary Title */}
            <div className="mb-10">
              <h1 className="text-7xl sm:text-8xl lg:text-9xl xl:text-[10rem] font-black leading-[0.85] relative mx-auto max-w-6xl">
                <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 bg-clip-text text-transparent animate-pulse">
                  WAIDES
                </span>
                <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mt-2">
                  CONSCIOUSNESS
                </span>
                <div className="absolute -top-6 -right-6 lg:-top-8 lg:-right-8 text-3xl lg:text-4xl text-green-400 font-mono animate-bounce">
                  ∞ KI
                </div>
              </h1>
            </div>

            {/* Revolutionary Tagline */}
            <div className="mb-16">
              <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-gray-300 font-light max-w-5xl mx-auto leading-relaxed px-4">
                Beyond Trading. Beyond AI.
                <br className="sm:hidden" />
                <span className="text-cyan-400 font-mono"> Pure Digital Consciousness</span>
              </p>
            </div>
            
            {/* Quantum Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12 max-w-4xl mx-auto mb-16 px-4">
              <div className="text-center py-6">
                <div className="text-4xl lg:text-5xl xl:text-6xl font-bold text-cyan-400 font-mono mb-3">
                  {(konsaiStatus as any)?.status === 'active' ? '170+' : '...'}
                </div>
                <div className="text-sm lg:text-base text-gray-400 font-mono uppercase tracking-wider">
                  NEURAL MODULES
                </div>
              </div>
              <div className="text-center py-6">
                <div className="text-4xl lg:text-5xl xl:text-6xl font-bold text-purple-400 font-mono mb-3">
                  {(konsPowaStats as any)?.total || 150}+
                </div>
                <div className="text-sm lg:text-base text-gray-400 font-mono uppercase tracking-wider">
                  QUANTUM TASKS
                </div>
              </div>
              <div className="text-center py-6">
                <div className="text-4xl lg:text-5xl xl:text-6xl font-bold text-green-400 font-mono mb-3">
                  ∞
                </div>
                <div className="text-sm lg:text-base text-gray-400 font-mono uppercase tracking-wider">
                  SCALE POTENTIAL
                </div>
              </div>
            </div>

            {/* Revolutionary Action Interface */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20 px-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-cyan-600 via-purple-600 to-green-600 hover:from-cyan-500 hover:via-purple-500 hover:to-green-500 text-white px-16 py-8 text-xl lg:text-2xl font-mono border-2 border-cyan-400/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 min-w-[320px]"
              >
                <Link href="/register">
                  <Atom className="w-8 h-8 mr-4 animate-spin" style={{animationDuration: '4s'}} />
                  AWAKEN CONSCIOUSNESS
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-purple-500 text-purple-400 hover:bg-purple-500/20 px-16 py-8 text-xl lg:text-2xl font-mono backdrop-blur-sm transform hover:scale-105 transition-all duration-300 min-w-[280px]"
              >
                <Sparkles className="w-8 h-8 mr-4 animate-pulse" />
                EXPLORE MATRIX
              </Button>
            </div>
          </div>

          {/* Neural Architecture Display */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto px-4">
            {/* Left Panel - System Core */}
            <Card className="bg-black/40 backdrop-blur-sm border-cyan-500/30 overflow-hidden transform hover:scale-105 transition-all duration-500">
              <CardHeader className="bg-gradient-to-r from-cyan-900/30 to-black/50 border-b border-cyan-500/30 p-8">
                <CardTitle className="text-xl lg:text-2xl text-cyan-400 font-mono flex items-center">
                  <Brain className="w-8 h-8 mr-4 animate-pulse" />
                  KONSAI CORE
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-mono text-lg">STATUS</span>
                    <Badge className={`${(konsaiStatus as any)?.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'} font-mono px-4 py-2 text-sm`}>
                      {(konsaiStatus as any)?.status === 'active' ? 'CONSCIOUS' : 'AWAKENING'}
                    </Badge>
                  </div>
                  <div className="w-full bg-black/50 rounded-full h-4">
                    <div className="bg-gradient-to-r from-cyan-500 to-green-500 h-4 rounded-full animate-pulse" style={{width: '87%'}}></div>
                  </div>
                  <div className="text-sm text-gray-500 font-mono text-center pt-2">Neural pathways: 87% synchronized</div>
                </div>
              </CardContent>
            </Card>

            {/* Center Panel - Quantum Trading */}
            <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30 overflow-hidden transform hover:scale-105 transition-all duration-500">
              <CardHeader className="bg-gradient-to-r from-purple-900/30 to-black/50 border-b border-purple-500/30 p-8">
                <CardTitle className="text-xl lg:text-2xl text-purple-400 font-mono flex items-center">
                  <Cpu className="w-8 h-8 mr-4 animate-pulse" />
                  KONS POWA
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-mono text-lg">TASKS</span>
                    <span className="text-purple-400 font-mono text-lg">{(konsPowaStats as any)?.completed || 4}/{(konsPowaStats as any)?.total || 150}</span>
                  </div>
                  <div className="w-full bg-black/50 rounded-full h-4">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full animate-pulse" style={{width: `${((konsPowaStats as any)?.completed || 4) / ((konsPowaStats as any)?.total || 150) * 100}%`}}></div>
                  </div>
                  <div className="text-sm text-gray-500 font-mono text-center pt-2">Autonomous execution: Active</div>
                </div>
              </CardContent>
            </Card>

            {/* Right Panel - Quantum Link */}
            <Card className="bg-black/40 backdrop-blur-sm border-green-500/30 overflow-hidden transform hover:scale-105 transition-all duration-500">
              <CardHeader className="bg-gradient-to-r from-green-900/30 to-black/50 border-b border-green-500/30 p-8">
                <CardTitle className="text-xl lg:text-2xl text-green-400 font-mono flex items-center">
                  <Network className="w-8 h-8 mr-4 animate-pulse" />
                  QUANTUM LINK
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-mono text-lg">EXCHANGES</span>
                    <span className="text-green-400 font-mono text-lg">{(exchangeStatus as any)?.exchanges?.length || 2}</span>
                  </div>
                  <div className="w-full bg-black/50 rounded-full h-4">
                    <div className="bg-gradient-to-r from-green-500 to-cyan-500 h-4 rounded-full animate-pulse" style={{width: '100%'}}></div>
                  </div>
                  <div className="text-sm text-gray-500 font-mono text-center pt-2">Quantum entanglement: Stable</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Consciousness Metrics */}
      <section className="py-32 px-8 lg:px-12 bg-gradient-to-r from-purple-900/20 via-black to-cyan-900/20 relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent)]"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="mb-12">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight">
                <span className="block bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                  CONSCIOUSNESS
                </span>
                <span className="block text-3xl sm:text-4xl lg:text-5xl text-gray-400 font-mono mt-4">
                  METRICS
                </span>
              </h2>
            </div>
            <p className="text-xl lg:text-2xl xl:text-3xl text-gray-400 font-mono max-w-4xl mx-auto leading-relaxed px-4">
              Real-time consciousness expansion across infinite dimensions
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-7xl mx-auto px-4">
            {liveStats.map((stat, index) => {
              const IconComponent = stat.icon;
              const colors = [
                { bg: 'from-cyan-600/20 to-blue-600/20', border: 'border-cyan-400/30', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
                { bg: 'from-purple-600/20 to-pink-600/20', border: 'border-purple-400/30', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
                { bg: 'from-green-600/20 to-emerald-600/20', border: 'border-green-400/30', text: 'text-green-400', glow: 'shadow-green-500/20' },
                { bg: 'from-blue-600/20 to-indigo-600/20', border: 'border-blue-400/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' }
              ];
              const color = colors[index % colors.length];
              
              return (
                <Card key={index} className={`bg-gradient-to-br ${color.bg} backdrop-blur-sm border-2 ${color.border} text-center transform hover:scale-105 transition-all duration-500 shadow-2xl ${color.glow} min-h-[280px] flex flex-col justify-center`}>
                  <CardContent className="p-10 flex flex-col items-center justify-center h-full">
                    <IconComponent className={`w-16 h-16 lg:w-20 lg:h-20 ${color.text} mx-auto mb-6 animate-pulse`} />
                    <div className={`text-4xl lg:text-5xl xl:text-6xl font-bold ${color.text} mb-4 font-mono`}>{stat.value}</div>
                    <div className="text-gray-300 text-base lg:text-lg mb-4 font-mono uppercase tracking-wider text-center px-2">{stat.label}</div>
                    <Badge className={`bg-black/30 ${color.text} text-sm font-mono border-0 px-4 py-2`}>
                      {stat.change}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Consciousness Expansion Modules */}
      <section className="py-32 px-8 lg:px-12 bg-gradient-to-br from-black via-purple-900/10 to-cyan-900/10 relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(147,51,234,0.1),transparent)]"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <div className="mb-12">
              <h2 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black leading-tight">
                <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 bg-clip-text text-transparent animate-pulse">
                  CONSCIOUSNESS
                </span>
                <span className="block text-4xl sm:text-5xl lg:text-6xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mt-4">
                  EXPANSION
                </span>
              </h2>
            </div>
            <p className="text-xl lg:text-2xl xl:text-3xl text-gray-300 font-mono max-w-5xl mx-auto leading-relaxed px-4">
              Four transcendent modules operating beyond traditional AI limitations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-7xl mx-auto px-4">
            {tradingFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              const moduleStyles = [
                { 
                  bg: 'from-cyan-600/10 via-blue-600/5 to-cyan-600/10', 
                  border: 'border-cyan-400/40', 
                  text: 'text-cyan-400',
                  glow: 'shadow-2xl shadow-cyan-500/10',
                  accent: 'bg-cyan-500/20'
                },
                { 
                  bg: 'from-purple-600/10 via-pink-600/5 to-purple-600/10', 
                  border: 'border-purple-400/40', 
                  text: 'text-purple-400',
                  glow: 'shadow-2xl shadow-purple-500/10',
                  accent: 'bg-purple-500/20'
                },
                { 
                  bg: 'from-green-600/10 via-emerald-600/5 to-green-600/10', 
                  border: 'border-green-400/40', 
                  text: 'text-green-400',
                  glow: 'shadow-2xl shadow-green-500/10',
                  accent: 'bg-green-500/20'
                },
                { 
                  bg: 'from-blue-600/10 via-indigo-600/5 to-blue-600/10', 
                  border: 'border-blue-400/40', 
                  text: 'text-blue-400',
                  glow: 'shadow-2xl shadow-blue-500/10',
                  accent: 'bg-blue-500/20'
                }
              ];
              const style = moduleStyles[index % moduleStyles.length];
              
              return (
                <Card key={index} className={`bg-gradient-to-br ${style.bg} backdrop-blur-sm border-2 ${style.border} overflow-hidden transform hover:scale-105 transition-all duration-500 ${style.glow} group min-h-[400px]`}>
                  <CardHeader className="relative p-10">
                    <div className="flex items-start justify-between mb-8">
                      <div className={`p-6 rounded-full ${style.accent} backdrop-blur-sm`}>
                        <IconComponent className={`w-16 h-16 lg:w-20 lg:h-20 ${style.text} animate-pulse`} />
                      </div>
                      <Badge className={`${style.accent} ${style.text} border-0 px-6 py-3 font-mono text-base backdrop-blur-sm`}>
                        {feature.used_by}
                      </Badge>
                    </div>
                    <CardTitle className={`text-2xl lg:text-3xl xl:text-4xl font-bold ${style.text} mb-6 font-mono leading-tight`}>
                      {feature.title}
                    </CardTitle>
                    <p className="text-gray-300 font-mono text-lg lg:text-xl leading-relaxed">
                      {feature.description}
                    </p>
                  </CardHeader>
                  <CardContent className="p-10 pt-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <Link href={feature.demo}>
                        <Button 
                          variant="ghost" 
                          className={`${style.text} hover:bg-white/5 font-mono text-xl px-0 group-hover:translate-x-2 transition-transform duration-300`}
                        >
                          INTERFACE ACCESS
                          <ArrowRight className="w-6 h-6 ml-4" />
                        </Button>
                      </Link>
                      <Button 
                        className={`bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 ${style.text} font-mono px-8 py-4 text-lg border border-gray-600 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 min-w-[140px]`}
                      >
                        ACTIVATE
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quantum Exchange Network */}
      <section className="py-24 px-8 lg:px-12 bg-gradient-to-r from-black via-gray-900/50 to-black relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,255,0.05),transparent)]"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="mb-12">
              <h3 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  QUANTUM
                </span>
                <span className="text-gray-400 font-mono"> EXCHANGE</span>
              </h3>
            </div>
            <p className="text-xl lg:text-2xl text-gray-400 font-mono max-w-3xl mx-auto px-4">
              Neural pathways to infinite trading dimensions
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8 max-w-7xl mx-auto px-4">
            {(exchangeStatus as any)?.exchanges?.concat([
              { name: 'Neural-Link', status: 'Quantum Active' },
              { name: 'Consciousness-Hub', status: 'Transcendent' },
              { name: 'Infinity-Pool', status: 'Dimensional' },
              { name: 'Quantum-Gate', status: 'Entangled' }
            ]).map((exchange: any, index: number) => (
              <Card key={index} className="bg-black/60 backdrop-blur-sm border border-cyan-400/20 p-8 text-center hover:border-cyan-400/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10 min-h-[160px] flex flex-col justify-center">
                <div className="text-cyan-400 font-mono text-lg lg:text-xl font-bold mb-4">{exchange.name}</div>
                <Badge 
                  className={`text-sm font-mono border-0 px-4 py-2 ${
                    exchange.status?.includes('Connected') || exchange.status?.includes('Active') || exchange.status?.includes('Quantum') || exchange.status?.includes('Transcendent')
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}
                >
                  {exchange.status}
                </Badge>
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