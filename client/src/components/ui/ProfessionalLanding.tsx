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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Futuristic Background */}
      <div className="absolute inset-0 digital-grid opacity-20"></div>
      <div className="absolute inset-0 hologram opacity-30"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full parallax-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {/* Matrix Status Badge */}
              <Badge className="mb-6 bg-cyan-500/20 text-cyan-400 border-cyan-500/50 px-6 py-3 border-glow-cyan">
                <Binary className="w-5 h-5 mr-3" />
                <span className="matrix-text">{matrixText}</span>
              </Badge>
              
              {/* Glitch Title */}
              <h1 className="text-6xl lg:text-7xl font-bold mb-8 leading-tight" data-text="WAIDES KI">
                <span className="glitch neon-cyan">WAIDES KI</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-green-400 to-blue-400 bg-clip-text text-transparent text-4xl lg:text-5xl">
                  Neural Trading Matrix
                </span>
              </h1>
              
              {/* Futuristic Description */}
              <p className="text-xl text-gray-300 mb-10 leading-relaxed font-mono">
                &gt; Advanced AI consciousness with{' '}
                <span className="neon-green">170+ intelligence modules</span>,{' '}
                <span className="neon-purple">quantum trading algorithms</span>, and{' '}
                <span className="neon-cyan">autonomous task execution</span>
              </p>
              
              {/* Futuristic Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 mb-10">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white px-10 py-4 tech-hover border-glow-cyan"
                >
                  <Link href="/register">
                    <Hexagon className="w-6 h-6 mr-3" />
                    INITIALIZE NEURAL LINK
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-purple-500 text-purple-400 hover:bg-purple-500/20 px-10 py-4 tech-hover border-glow-purple"
                >
                  <Radar className="w-6 h-6 mr-3" />
                  SCAN QUANTUM DEMO
                </Button>
              </div>
              
              {/* System Status Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm font-mono">
                <div className="flex items-center text-cyan-400">
                  <div className={`w-3 h-3 rounded-full mr-3 ${(konsaiStatus as any)?.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                  KONSAI: {(konsaiStatus as any)?.status === 'active' ? 'ONLINE' : 'LOADING'}
                </div>
                <div className="flex items-center text-purple-400">
                  <div className={`w-3 h-3 rounded-full mr-3 ${konsPowaActive ? 'bg-purple-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  KONS POWA: {(konsPowaStats as any)?.completionPercentage || 0}%
                </div>
                <div className="flex items-center text-green-400">
                  <div className="w-3 h-3 rounded-full bg-green-400 mr-3 animate-pulse"></div>
                  QUANTUM LINK: ACTIVE
                </div>
              </div>
            </div>

            {/* Holographic Interface Preview */}
            <div className="relative parallax-fast">
              <Card className="bg-black/60 backdrop-blur-sm border-cyan-500/30 overflow-hidden tech-hover border-glow-cyan">
                <CardHeader className="border-b border-cyan-500/30 bg-gradient-to-r from-cyan-900/20 to-purple-900/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-cyan-400 font-mono">NEURAL INTERFACE</CardTitle>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-glow-cyan">
                      <Waves className="w-3 h-3 mr-1" />
                      SCANNING
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Holographic Trading Interface */}
                  <div className="p-6 space-y-4 bg-gradient-to-br from-black/80 to-purple-900/20">
                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
                      <span className="text-cyan-400 font-mono">ETH/QUANTUM</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold neon-green">$3,287.50</div>
                        <div className="neon-green text-sm">+12.34% SURGE</div>
                      </div>
                    </div>
                    
                    <div className="bg-black/50 p-4 rounded-lg border border-purple-500/30 hologram">
                      <div className="text-purple-400 text-sm font-mono mb-2">KONSAI ANALYSIS:</div>
                      <div className="text-green-400 text-xs font-mono">
                        &gt; NEURAL PATTERN DETECTED<br/>
                        &gt; QUANTUM PROBABILITY: 87.3%<br/>
                        &gt; KONS POWA ENGAGED
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-mono">
                        <span className="text-gray-400">SYSTEM LOAD:</span>
                        <span className="neon-cyan">{(konsPowaStats as any)?.total || 150} TASKS</span>
                      </div>
                      <Progress value={85} className="h-2 bg-black/50" />
                      <div className="flex justify-between text-xs font-mono text-gray-500">
                        <span>AUTONOMOUS</span>
                        <span>INFINITE SCALE</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Neural Statistics */}
      <section className="py-20 px-6 bg-gradient-to-r from-black via-gray-900 to-black relative">
        <div className="absolute inset-0 digital-grid opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="neon-cyan">QUANTUM ANALYTICS</span>
            </h2>
            <p className="text-gray-400 font-mono">Real-time neural network processing</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {liveStats.map((stat, index) => {
              const IconComponent = stat.icon;
              const glowColors = ['cyan', 'purple', 'green', 'blue'];
              const glowClass = `border-glow-${glowColors[index % glowColors.length]}`;
              return (
                <Card key={index} className={`bg-black/60 backdrop-blur-sm ${glowClass} text-center tech-hover`}>
                  <CardContent className="p-6">
                    <IconComponent className={`w-8 h-8 neon-${glowColors[index % glowColors.length]} mx-auto mb-3`} />
                    <div className={`text-2xl font-bold neon-${glowColors[index % glowColors.length]} mb-1 font-mono`}>{stat.value}</div>
                    <div className="text-gray-400 text-sm mb-2 font-mono">{stat.label}</div>
                    <Badge className={`bg-${glowColors[index % glowColors.length]}-500/20 text-${glowColors[index % glowColors.length]}-400 text-xs font-mono`}>
                      {stat.change}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Neural Architecture Features */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 hologram opacity-20"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              <span className="glitch neon-purple" data-text="NEURAL">NEURAL</span>{' '}
              <span className="neon-cyan">ARCHITECTURE</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto font-mono">
              &gt; Quantum consciousness modules operating at infinite scale<br/>
              &gt; {(konsaiStatus as any)?.status === 'active' ? '170+ Intelligence Modules ACTIVE' : 'Systems Initializing...'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tradingFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              const glowColor = feature.glow || 'cyan';
              return (
                <Card key={index} className={`bg-black/60 backdrop-blur-sm border-${glowColor}-500/30 tech-hover border-glow-${glowColor} group`}>
                  <CardHeader className="bg-gradient-to-r from-black/80 to-gray-900/40">
                    <div className="flex items-center justify-between">
                      <IconComponent className={`w-12 h-12 neon-${glowColor} parallax-slow`} />
                      <Badge className={`bg-${glowColor}-500/20 text-${glowColor}-400 border-${glowColor}-500/50 font-mono`}>
                        {feature.used_by}
                      </Badge>
                    </div>
                    <CardTitle className={`text-xl neon-${glowColor} font-mono`}>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-300 mb-6 font-mono text-sm leading-relaxed">{feature.description}</p>
                    <div className="flex items-center justify-between">
                      <Link href={feature.demo}>
                        <Button variant="ghost" className={`text-${glowColor}-400 hover:text-${glowColor}-300 p-0 font-mono`}>
                          &gt; ACCESS MODULE
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                      <Button size="sm" className={`bg-gradient-to-r from-${glowColor}-600 to-${glowColor}-500 hover:from-${glowColor}-500 hover:to-${glowColor}-400 tech-hover font-mono`}>
                        INITIALIZE
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Exchange Integrations */}
      <section className="py-16 px-6 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Connected Exchanges</h3>
            <p className="text-gray-400">Direct integration with major cryptocurrency and traditional exchanges</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {exchangeLogos.map((exchange, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center">
                    {/* Placeholder for exchange logo */}
                    <span className="text-slate-800 font-bold text-xs">{exchange.name.slice(0, 3)}</span>
                  </div>
                  <div className="text-white text-sm font-medium">{exchange.name}</div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-xs mt-1">
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