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
  Target
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent } from './card';

const ProfessionalLanding = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Trading',
      description: 'Advanced machine learning algorithms analyze market patterns and execute optimal trades automatically',
      stats: '98.2% Success Rate'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Sophisticated risk controls and position sizing protect your capital in volatile market conditions',
      stats: 'Maximum 2% Risk'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Live market data, technical indicators, and performance metrics delivered instantly',
      stats: 'Sub-second Data'
    },
    {
      icon: Target,
      title: 'Portfolio Optimization',
      description: 'Dynamic asset allocation and rebalancing based on market conditions and your risk profile',
      stats: 'Automated Rebalancing'
    }
  ];

  const stats = [
    { label: 'Assets Under Management', value: '$127M', change: '+23%' },
    { label: 'Active Traders', value: '15,847', change: '+18%' },
    { label: 'Average Annual Return', value: '34.2%', change: '+5.1%' },
    { label: 'Platform Uptime', value: '99.97%', change: '100%' }
  ];

  const testimonials = [
    {
      name: 'Michael Chen',
      role: 'Portfolio Manager',
      company: 'Apex Capital',
      quote: 'The AI trading algorithms have consistently outperformed our manual strategies.',
      rating: 5,
      return: '+42% YTD'
    },
    {
      name: 'Sarah Johnson',
      role: 'Investment Director', 
      company: 'Sterling Investments',
      quote: 'Risk management features saved us significant losses during market volatility.',
      rating: 5,
      return: '+38% YTD'
    },
    {
      name: 'David Rodriguez',
      role: 'Quantitative Trader',
      company: 'Alpha Trading Group',
      quote: 'The real-time analytics and execution speed give us a competitive advantage.',
      rating: 5,
      return: '+45% YTD'
    }
  ];

  // Rotate testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100/[0.02] bg-[size:40px_40px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="text-center">
            {/* Status Badge */}
            <Badge variant="outline" className="mb-6 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <Activity className="w-3 h-3 mr-2" />
              Live Trading Platform
            </Badge>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
              Professional AI Trading
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Platform
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Institutional-grade automated trading with advanced AI algorithms, 
              comprehensive risk management, and real-time market analytics
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/portal">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Start Trading
                </Button>
              </Link>
              <Link href="/learning">
                <Button variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3">
                  View Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                    <div className="text-xs text-emerald-400">{stat.change}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Enterprise-Grade Trading Technology
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Built for professional traders and institutional investors who demand 
            the highest levels of performance, security, and reliability
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-blue-400" />
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      {feature.stats}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Testimonials Section */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-8 border border-slate-600">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              Trusted by Professional Traders
            </h3>
            <p className="text-gray-400">
              See what industry professionals say about our platform
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800/40 border-slate-600">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-lg text-gray-300 mb-4 italic">
                      "{testimonials[currentTestimonial].quote}"
                    </blockquote>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">
                          {testimonials[currentTestimonial].name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {testimonials[currentTestimonial].role}, {testimonials[currentTestimonial].company}
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        {testimonials[currentTestimonial].return}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Testimonial indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTestimonial ? 'bg-blue-400' : 'bg-gray-600'
                }`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-900/30 to-emerald-900/30 rounded-2xl p-8 border border-blue-500/20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Professional Trading?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professional traders using our AI-powered platform 
            to maximize returns and minimize risk
          </p>

          <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
            <Link href="/portal">
              <Card className="bg-slate-800/40 border-blue-500/30 hover:border-blue-400/60 transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Trading Portal</h3>
                  <p className="text-gray-400 text-sm">Access live trading interface</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/forum">
              <Card className="bg-slate-800/40 border-emerald-500/30 hover:border-emerald-400/60 transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Community</h3>
                  <p className="text-gray-400 text-sm">Connect with traders</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/learning">
              <Card className="bg-slate-800/40 border-purple-500/30 hover:border-purple-400/60 transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Brain className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Education</h3>
                  <p className="text-gray-400 text-sm">Learn trading strategies</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-12 py-3">
            <Zap className="w-5 h-5 mr-2" />
            Get Started Today
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalLanding;