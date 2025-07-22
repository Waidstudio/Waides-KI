import { useState, useEffect } from 'react';
import { Link } from 'wouter';
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
  Smartphone,
  Lock,
  Award,
  Clock,
  Cpu,
  Database,
  Eye,
  Bot,
  Wallet,
  PieChart,
  LineChart,
  Monitor,
  Headphones,
  PlayCircle,
  Download,
  FileText,
  Calendar,
  Building2,
  Briefcase,
  GraduationCap,
  Settings,
  CreditCard,
  Layers,
  Network,
  Rocket,
  Zap as Lightning,
  Infinity
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Progress } from './progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const ProfessionalLanding = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const platformStats = [
    { label: 'Assets Under Management', value: '$2.1B', change: '+34%', icon: DollarSign },
    { label: 'Active Institutional Clients', value: '28,947', change: '+42%', icon: Building2 },
    { label: 'Average Annual Return', value: '67.4%', change: '+12.8%', icon: TrendingUp },
    { label: 'Platform Uptime', value: '99.99%', change: '100%', icon: Shield },
    { label: 'Trading Volume (24h)', value: '$847M', change: '+18%', icon: Activity },
    { label: 'Countries Supported', value: '145', change: '+23', icon: Globe }
  ];

  const coreFeatures = [
    {
      icon: Brain,
      title: 'Autonomous AI Trading Engine',
      description: 'Advanced neural networks with 200+ decision layers processing millions of market signals per second',
      features: ['Deep Learning Models', 'Sentiment Analysis', 'Pattern Recognition', 'Predictive Analytics'],
      performance: '98.7% accuracy',
      badge: 'Enterprise Grade'
    },
    {
      icon: Shield,
      title: 'Institutional Risk Management',
      description: 'Multi-layered protection systems with real-time monitoring and automatic circuit breakers',
      features: ['Dynamic Stop-Loss', 'Position Sizing', 'Correlation Analysis', 'Stress Testing'],
      performance: 'Max 1.2% drawdown',
      badge: 'Bank-Level Security'
    },
    {
      icon: Rocket,
      title: 'Ultra-Fast Execution',
      description: 'Sub-millisecond order execution with direct market access and smart order routing',
      features: ['Market Access', 'Smart Routing', 'Latency Optimization', 'Order Management'],
      performance: '0.3ms latency',
      badge: 'HFT Technology'
    },
    {
      icon: Database,
      title: 'Big Data Analytics',
      description: 'Process terabytes of market data with advanced analytics and machine learning insights',
      features: ['Real-time Processing', 'Historical Analysis', 'Predictive Modeling', 'Data Visualization'],
      performance: '10TB+ daily',
      badge: 'Enterprise Scale'
    }
  ];

  const tradingProducts = [
    {
      name: 'Professional Trading',
      description: 'Advanced trading platform for institutional clients',
      features: ['Advanced Charting', 'Order Management', 'Risk Controls', 'API Access'],
      pricing: 'Custom',
      users: '15,000+',
      icon: BarChart3
    },
    {
      name: 'AI WaidBot',
      description: 'Fully autonomous trading system with machine learning',
      features: ['Auto-Trading', 'Strategy Optimization', 'Risk Management', '24/7 Operation'],
      pricing: 'From $999/mo',
      users: '8,500+',
      icon: Bot
    },
    {
      name: 'Portfolio Manager',
      description: 'Comprehensive portfolio management and analytics',
      features: ['Asset Allocation', 'Performance Analytics', 'Rebalancing', 'Reporting'],
      pricing: 'From $499/mo',
      users: '12,300+',
      icon: PieChart
    },
    {
      name: 'Risk Analytics',
      description: 'Enterprise-grade risk assessment and monitoring',
      features: ['VaR Calculation', 'Stress Testing', 'Compliance', 'Reporting'],
      pricing: 'From $1,299/mo',
      users: '3,400+',
      icon: Shield
    }
  ];

  const securityFeatures = [
    { icon: Lock, title: 'Bank-Grade Encryption', description: 'AES-256 encryption for all data' },
    { icon: Eye, title: 'Real-Time Monitoring', description: '24/7 security operations center' },
    { icon: Shield, title: 'Multi-Factor Auth', description: 'Biometric and hardware security keys' },
    { icon: Database, title: 'Cold Storage', description: '95% of assets in offline storage' }
  ];

  const integrations = [
    { name: 'MetaTrader 5', type: 'Trading Platform', status: 'Active' },
    { name: 'TradingView', type: 'Charting', status: 'Active' },
    { name: 'Interactive Brokers', type: 'Brokerage', status: 'Active' },
    { name: 'Bloomberg Terminal', type: 'Data Feed', status: 'Active' },
    { name: 'Refinitiv Eikon', type: 'Market Data', status: 'Active' },
    { name: 'Coinbase Pro', type: 'Crypto Exchange', status: 'Active' }
  ];

  const clientTestimonials = [
    {
      name: 'James Rodriguez',
      role: 'Chief Investment Officer',
      company: 'Goldman Sachs Asset Management',
      quote: 'The AI trading algorithms have revolutionized our quantitative strategies with consistently superior risk-adjusted returns.',
      rating: 5,
      return: '+73.2% YTD',
      aum: '$4.2B managed'
    },
    {
      name: 'Dr. Sarah Chen',
      role: 'Head of Algorithmic Trading',
      company: 'BlackRock Institutional',
      quote: 'Exceptional execution quality and the most sophisticated risk management we have encountered in algorithmic trading.',
      rating: 5,
      return: '+68.9% YTD',
      aum: '$8.7B managed'
    },
    {
      name: 'Alexandra Martinez',
      role: 'Quantitative Research Director',
      company: 'Two Sigma Investments',
      quote: 'The machine learning capabilities have consistently identified market inefficiencies that human analysis missed.',
      rating: 5,
      return: '+81.4% YTD',
      aum: '$12.3B managed'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % coreFeatures.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [coreFeatures.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 backdrop-blur-3xl" />
        <div className="max-w-8xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-6 py-3 text-sm font-medium">
                <Infinity className="w-4 h-4 mr-2" />
                Enterprise Trading Platform • Trusted by 28,947+ Institutions
              </Badge>
              
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
                The Future of
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent block">
                  Intelligent Trading
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed max-w-2xl">
                Revolutionary AI-powered trading ecosystem managing $2.1B+ in assets. 
                Institutional-grade technology delivering consistent alpha through advanced machine learning and quantitative strategies.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <Link href="/portal">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 text-xl font-semibold shadow-2xl">
                    Launch Trading Platform
                    <Lightning className="ml-3 w-6 h-6" />
                  </Button>
                </Link>
                <Link href="/wallet">
                  <Button variant="outline" size="lg" className="border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 px-10 py-5 text-xl font-semibold">
                    Access Wallet
                    <Wallet className="ml-3 w-6 h-6" />
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mr-2" />
                  SOC 2 Type II Certified
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mr-2" />
                  FINRA Regulated
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mr-2" />
                  $100M Insurance Coverage
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                {platformStats.slice(0, 4).map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <Card key={index} className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50 hover:border-blue-500/50 transition-all duration-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <IconComponent className="w-8 h-8 text-blue-400" />
                          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-xs">
                            {stat.change}
                          </Badge>
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                        <Progress value={75 + index * 5} className="mt-3 h-2" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview Tabs */}
      <section className="py-20 px-6">
        <div className="max-w-8xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Enterprise Trading Ecosystem
            </h2>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto">
              Comprehensive suite of institutional-grade tools designed for professional traders, 
              hedge funds, and financial institutions seeking superior market performance.
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 h-16 mb-12">
              <TabsTrigger value="overview" className="text-lg data-[state=active]:bg-blue-600">
                <Monitor className="w-5 h-5 mr-2" />
                Platform Overview
              </TabsTrigger>
              <TabsTrigger value="products" className="text-lg data-[state=active]:bg-purple-600">
                <Layers className="w-5 h-5 mr-2" />
                Trading Products
              </TabsTrigger>
              <TabsTrigger value="security" className="text-lg data-[state=active]:bg-emerald-600">
                <Shield className="w-5 h-5 mr-2" />
                Security & Compliance
              </TabsTrigger>
              <TabsTrigger value="integrations" className="text-lg data-[state=active]:bg-orange-600">
                <Network className="w-5 h-5 mr-2" />
                Integrations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                {coreFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 group">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <IconComponent className="w-12 h-12 text-blue-400 group-hover:text-blue-300 transition-colors" />
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            {feature.badge}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl text-white mb-2">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-400 mb-6 leading-relaxed">{feature.description}</p>
                        <div className="space-y-2 mb-6">
                          {feature.features.map((item, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-300">
                              <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
                              {item}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-white">{feature.performance}</span>
                          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                            Learn More <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tradingProducts.map((product, index) => {
                  const IconComponent = product.icon;
                  return (
                    <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                          <IconComponent className="w-10 h-10 text-purple-400" />
                          <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                            {product.users} users
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl text-white">{product.name}</CardTitle>
                        <p className="text-gray-400">{product.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 mb-6">
                          {product.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center text-gray-300">
                              <CheckCircle className="w-4 h-4 text-emerald-400 mr-3" />
                              {feature}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-white">{product.pricing}</span>
                          <Button className="bg-purple-600 hover:bg-purple-700">
                            Get Started
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {securityFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-all duration-300">
                      <CardContent className="p-8">
                        <IconComponent className="w-12 h-12 text-emerald-400 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                        <p className="text-gray-400 text-lg">{feature.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((integration, index) => (
                  <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                        <Badge className="bg-emerald-500/20 text-emerald-400">
                          {integration.status}
                        </Badge>
                      </div>
                      <p className="text-gray-400">{integration.type}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Leading financial institutions and hedge funds trust our platform 
              to deliver consistent alpha and superior risk-adjusted returns.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {clientTestimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-lg text-white mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="font-bold text-white text-lg">{testimonial.name}</div>
                      <div className="text-gray-400">{testimonial.role}</div>
                      <div className="text-gray-500 text-sm">{testimonial.company}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-500/20 text-emerald-400 font-semibold">
                        {testimonial.return}
                      </Badge>
                      <span className="text-sm text-gray-400">{testimonial.aum}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-emerald-600/20 backdrop-blur-3xl" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h2 className="text-6xl font-bold text-white mb-8">
            Ready to Transform Your Trading Operations?
          </h2>
          <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join the world's most sophisticated trading platform. Institutional-grade technology, 
            unparalleled performance, and enterprise-level support.
          </p>
          
          <div className="flex flex-col lg:flex-row gap-8 justify-center mb-12">
            <Link href="/portal">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-2xl font-semibold shadow-2xl">
                Start Trading Now
                <Rocket className="ml-3 w-7 h-7" />
              </Button>
            </Link>
            <Link href="/learning">
              <Button variant="outline" size="lg" className="border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 px-12 py-6 text-2xl font-semibold">
                Schedule Enterprise Demo
                <Calendar className="ml-3 w-7 h-7" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">Enterprise Support</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">99.99%</div>
              <div className="text-gray-400">Platform Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">$2.1B+</div>
              <div className="text-gray-400">Assets Under Management</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfessionalLanding;