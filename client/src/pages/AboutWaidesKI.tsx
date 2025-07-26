import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Brain, 
  Bot, 
  Cpu, 
  Network, 
  Shield, 
  TrendingUp, 
  Zap, 
  Eye, 
  MessageSquare, 
  BookOpen, 
  ChevronRight, 
  Play, 
  Star, 
  Globe, 
  Lock, 
  Activity, 
  BarChart3, 
  Sparkles, 
  Target, 
  Atom, 
  Binary, 
  Hexagon,
  ArrowRight,
  CheckCircle,
  Layers,
  CircuitBoard,
  Database,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const AboutWaidesKI = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Auto-scroll through sections
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSection(prev => (prev + 1) % 6);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch real-time data for live stats
  const { data: liveStats } = useQuery({
    queryKey: ['/api/platform/live-stats'],
    refetchInterval: 30000
  });

  const { data: konsaiStatus } = useQuery({
    queryKey: ['/api/chat/oracle/status'],
    refetchInterval: 15000
  });

  const { data: konsPowaStats } = useQuery({
    queryKey: ['/api/kons-powa/stats'],
    refetchInterval: 20000
  });

  const platformFeatures = [
    {
      icon: Brain,
      title: "KonsAI Intelligence Engine",
      description: "Advanced AI oracle with 170+ omniscient modules providing real-time market consciousness and spiritual trading guidance.",
      capabilities: [
        "Real-time market analysis with neural processing",
        "Spiritual trading guidance and mystical insights",
        "170+ autonomous modules for comprehensive analysis",
        "Deep learning pattern recognition"
      ],
      status: (konsaiStatus as any)?.status === 'active' ? 'ACTIVE' : 'LOADING',
      route: '/portal',
      color: 'from-cyan-400 to-blue-600'
    },
    {
      icon: Bot,
      title: "WaidBot Quantum Trading",
      description: "Four-tier autonomous trading system with quantum consciousness for multi-dimensional market analysis.",
      capabilities: [
        "WaidBot: Core autonomous trading intelligence",
        "WaidBot Pro: Enhanced premium trading features",
        "Autonomous Trader: Self-executing trade management",
        "Full Engine: Complete AI trading coordination"
      ],
      status: 'QUANTUM ACTIVE',
      route: '/waidbot-engine',
      color: 'from-green-400 to-emerald-600'
    },
    {
      icon: Cpu,
      title: "KonsPowa Task Engine",
      description: `Autonomous task management system with ${(konsPowaStats as any)?.total || 150}+ tasks for infinite scaling and self-healing capabilities.`,
      capabilities: [
        `${(konsPowaStats as any)?.total || 150}+ autonomous tasks running 24/7`,
        "Self-healing system architecture",
        "Auto-scaling for infinite growth potential",
        "Advanced monitoring and diagnostics"
      ],
      status: `${(konsPowaStats as any)?.completed || 0}/${(konsPowaStats as any)?.total || 150} ACTIVE`,
      route: '/kons-powa',
      color: 'from-purple-400 to-violet-600'
    },
    {
      icon: MessageSquare,
      title: "Waides KI Chat System",
      description: "Dual AI communication system with educational guidance and market analysis capabilities.",
      capabilities: [
        "KI Chat: Educational learning guide and mentor",
        "KonsAI Chat: Real-time market analysis oracle",
        "Contextual responses based on user needs",
        "Integration with trading systems"
      ],
      status: 'DUAL ACTIVE',
      route: '/portal',
      color: 'from-pink-400 to-rose-600'
    },
    {
      icon: Shield,
      title: "Advanced Security & Risk Management",
      description: "Multi-layer security architecture with biometric authentication and advanced risk controls.",
      capabilities: [
        "Biometric authentication systems",
        "Advanced portfolio risk management",
        "Real-time security monitoring",
        "Multi-factor protection protocols"
      ],
      status: 'SECURED',
      route: '/config',
      color: 'from-orange-400 to-red-600'
    },
    {
      icon: Network,
      title: "Global Exchange Integration",
      description: "Unified infrastructure connecting to major exchanges worldwide with holographic data streams.",
      capabilities: [
        "Multi-exchange connectivity",
        "Unified order management",
        "Real-time data aggregation",
        "Cross-platform trading execution"
      ],
      status: 'CONNECTED',
      route: '/live-data',
      color: 'from-blue-400 to-indigo-600'
    }
  ];

  const journeySteps = [
    {
      step: 1,
      title: "Start Your Journey",
      description: "Begin with our comprehensive Trading Academy to understand the fundamentals of AI-powered trading.",
      action: "Visit Learning Center",
      route: "/learning",
      icon: BookOpen,
      color: "from-emerald-500 to-teal-600"
    },
    {
      step: 2,
      title: "Explore the Vision Portal",
      description: "Connect with Waides KI and KonsAI through our mystical portal interface for spiritual trading guidance.",
      action: "Enter Portal",
      route: "/portal",
      icon: Eye,
      color: "from-purple-500 to-violet-600"
    },
    {
      step: 3,
      title: "Activate Trading Systems",
      description: "Launch your WaidBot engines and experience quantum-level autonomous trading across multiple exchanges.",
      action: "Launch WaidBot Engine",
      route: "/waidbot-engine",
      icon: Rocket,
      color: "from-blue-500 to-cyan-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 px-6 py-3 rounded-full mb-8">
            <Hexagon className="h-5 w-5 text-purple-400" />
            <span className="text-purple-300 font-medium">The Future of AI Trading</span>
          </div>

          <h1 className="text-6xl lg:text-8xl font-bold mb-8">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Waides KI
            </span>
          </h1>

          <p className="text-2xl lg:text-3xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto">
            Advanced autonomous wealth management platform delivering intelligent financial solutions through 
            <span className="text-cyan-400"> adaptive digital consciousness</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
              <div className="text-3xl font-bold text-cyan-400 mb-2">
                {(liveStats as any)?.stats?.activeTradingPairs || '12+'}
              </div>
              <div className="text-gray-300">Active Trading Pairs</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {(konsPowaStats as any)?.total || '150+'}
              </div>
              <div className="text-gray-300">Autonomous Tasks</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
              <div className="text-3xl font-bold text-pink-400 mb-2">99.7%</div>
              <div className="text-gray-300">System Uptime</div>
            </div>
          </div>

          <Button 
            asChild
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-4 text-lg font-semibold rounded-xl"
          >
            <Link href="#features">
              Explore the Future <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Revolutionary <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">AI Systems</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the next generation of trading technology with our comprehensive suite of AI-powered tools and systems
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {platformFeatures.map((feature, index) => (
              <Card 
                key={index}
                className={`bg-gray-800/50 backdrop-blur-xl border-gray-700 hover:border-purple-500/50 transition-all duration-500 ${
                  activeSection === index ? 'ring-2 ring-purple-500/50 scale-105' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color}`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-6 leading-relaxed">{feature.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    {feature.capabilities.map((capability, capIndex) => (
                      <div key={capIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{capability}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    asChild
                    variant="outline"
                    className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Link href={feature.route}>
                      Explore System <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Screenshots Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-900 to-purple-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Platform</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              See the advanced interfaces and real-time capabilities of the Waides KI platform in action
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* WaidBot Engine Screenshot */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20">
              <div className="bg-gradient-to-br from-gray-900 to-purple-900/50 rounded-2xl p-8 mb-6 border border-cyan-500/20">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-cyan-500/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-cyan-400">₽12.4K</div>
                    <div className="text-xs text-gray-400">ETH Live</div>
                  </div>
                  <div className="bg-green-500/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">42</div>
                    <div className="text-xs text-gray-400">Networks</div>
                  </div>
                  <div className="bg-purple-500/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">1,247</div>
                    <div className="text-xs text-gray-400">Trades</div>
                  </div>
                  <div className="bg-orange-500/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">97%</div>
                    <div className="text-xs text-gray-400">AI Confidence</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">4-Bot Quantum Engine</div>
                  <div className="text-green-400 text-sm">● ACTIVE</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">WaidBot Engine Dashboard</h3>
              <p className="text-gray-300 mb-6">Real-time monitoring of all four trading bots with live metrics, quantum analysis, and autonomous decision making.</p>
              <Button asChild variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                <Link href="/waidbot-engine">View Live Dashboard</Link>
              </Button>
            </div>

            {/* Vision Portal Screenshot */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20">
              <div className="bg-gradient-to-br from-purple-900/50 to-cyan-900/50 rounded-2xl p-8 mb-6 border border-purple-500/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Waides KI Oracle</div>
                    <div className="text-purple-400 text-sm">Spiritual Trading Guidance</div>
                  </div>
                </div>
                <div className="bg-purple-500/10 rounded-xl p-4 mb-4">
                  <div className="text-purple-400 text-sm mb-2">KonsAI Analysis:</div>
                  <div className="text-gray-300 text-sm">"ETH shows strong bullish patterns with resistance at $3,400. The quantum field suggests a 73% probability of upward movement..."</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">Chat Sessions: 247</div>
                  <div className="text-cyan-400 text-sm">● ONLINE</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Vision Portal Interface</h3>
              <p className="text-gray-300 mb-6">Connect with KonsAI oracle for mystical trading insights and spiritual guidance through our advanced AI communication system.</p>
              <Button asChild variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                <Link href="/portal">Enter Portal</Link>
              </Button>
            </div>
          </div>

          {/* Single Large Screenshot - Trading Interface */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20">
            <div className="bg-gradient-to-br from-gray-900 to-blue-900/50 rounded-2xl p-8 mb-6 border border-blue-500/20">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-500/10 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="h-6 w-6 text-blue-400" />
                    <div className="text-white font-semibold">Live Trading</div>
                  </div>
                  <div className="text-3xl font-bold text-blue-400 mb-2">$47,293</div>
                  <div className="text-green-400 text-sm">+12.7% Today</div>
                </div>
                <div className="bg-green-500/10 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="h-6 w-6 text-green-400" />
                    <div className="text-white font-semibold">Portfolio</div>
                  </div>
                  <div className="text-3xl font-bold text-green-400 mb-2">₽189.2K</div>
                  <div className="text-cyan-400 text-sm">SmaiSika Balance</div>
                </div>
                <div className="bg-purple-500/10 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="h-6 w-6 text-purple-400" />
                    <div className="text-white font-semibold">AI Signals</div>
                  </div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">14</div>
                  <div className="text-orange-400 text-sm">Active Opportunities</div>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                  <div className="text-cyan-400 font-semibold">BUY SIGNAL</div>
                  <div className="text-gray-300 text-sm">ETH @ $3,247</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                  <div className="text-green-400 font-semibold">HOLD</div>
                  <div className="text-gray-300 text-sm">BTC @ $96,432</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                  <div className="text-purple-400 font-semibold">ANALYSIS</div>
                  <div className="text-gray-300 text-sm">SOL @ $247.3</div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                  <div className="text-orange-400 font-semibold">WATCH</div>
                  <div className="text-gray-300 text-sm">ADA @ $1.09</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-white mb-4">Advanced Trading Interface</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Real-time portfolio management with AI-generated trading signals, live market data, and comprehensive analytics. 
                  Monitor your SmaiSika balance and execute trades across multiple exchanges simultaneously.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Real-time market data feeds</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">AI-powered trading signals</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">Multi-exchange execution</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">SmaiSika currency integration</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <Link href="/trading">Launch Trading Interface</Link>
                </Button>
                <Button asChild variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                  <Link href="/wallet">View SmaiSika Wallet</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Communication Systems */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-900/20 to-cyan-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Communication</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Connect with advanced AI entities designed to guide your trading journey and provide market insights
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Waides KI Chat */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Waides KI Chat</h3>
                  <p className="text-emerald-400">Educational Learning Guide</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                  <h4 className="text-emerald-400 font-semibold mb-2">Primary Purpose</h4>
                  <p className="text-gray-300 text-sm">
                    Your personal trading mentor focused on education, safety, and proper learning fundamentals before you begin trading.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-gray-300 text-sm">Comprehensive trading education</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-gray-300 text-sm">Learning path recommendations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-gray-300 text-sm">Risk management guidance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-gray-300 text-sm">Trading Academy integration</span>
                  </div>
                </div>
              </div>

              <Button 
                asChild
                variant="outline"
                className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
              >
                <Link href="/learning">
                  Start Learning Journey <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* KonsAI Chat */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">KonsAI Oracle</h3>
                  <p className="text-cyan-400">Market Analysis Intelligence</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                  <h4 className="text-cyan-400 font-semibold mb-2">Primary Purpose</h4>
                  <p className="text-gray-300 text-sm">
                    Advanced AI oracle providing real-time market analysis, mystical insights, and spiritual trading guidance.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-cyan-400" />
                    <span className="text-gray-300 text-sm">Real-time market consciousness</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-cyan-400" />
                    <span className="text-gray-300 text-sm">170+ autonomous analysis modules</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-cyan-400" />
                    <span className="text-gray-300 text-sm">Spiritual trading insights</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-cyan-400" />
                    <span className="text-gray-300 text-sm">Divine market readings</span>
                  </div>
                </div>
              </div>

              <Button 
                asChild
                variant="outline"
                className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Link href="/portal">
                  Connect with Oracle <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Your Journey Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Journey</span> Begins
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Follow this recommended path to master the Waides KI platform and unlock your trading potential
            </p>
          </div>

          <div className="space-y-8">
            {journeySteps.map((step, index) => (
              <div 
                key={index}
                className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all duration-500"
              >
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className={`p-6 rounded-2xl bg-gradient-to-r ${step.color} relative`}>
                      <step.icon className="h-12 w-12 text-white" />
                      <div className="absolute -top-2 -right-2 bg-white text-gray-900 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-3xl font-bold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      {step.description}
                    </p>
                    <Button 
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl"
                    >
                      <Link href={step.route}>
                        {step.action} <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-900/50 to-cyan-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-8">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Transform</span> Your Trading?
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Join thousands of traders who have already discovered the power of AI-driven wealth management with Waides KI
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-4 text-lg rounded-xl"
            >
              <Link href="/waidbot-engine">
                Launch WaidBot Engine <Rocket className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button 
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 px-8 py-4 text-lg rounded-xl"
            >
              <Link href="/learning">
                Start Learning <BookOpen className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutWaidesKI;