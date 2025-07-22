import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Users, 
  Zap,
  ChevronRight,
  Play,
  Star,
  Activity,
  BookOpen
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent } from './card';

const StableLanding = () => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Brain,
      title: 'AI Trading Intelligence',
      description: 'Advanced KonsAI algorithms analyze market patterns with 98% accuracy',
      stats: '98% Win Rate'
    },
    {
      icon: Shield,
      title: 'Risk Protection',
      description: 'Intelligent risk management with auto-stop losses and portfolio protection',
      stats: 'Zero Loss Mode'
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Analytics',
      description: 'Live market data and predictive insights for informed trading decisions',
      stats: 'Live Data'
    },
    {
      icon: Users,
      title: 'Trading Community',
      description: 'Connect with experienced traders and share winning strategies',
      stats: '10k+ Members'
    }
  ];

  const quickStats = [
    { label: 'Active Traders', value: '12,847', change: '+18%' },
    { label: 'Total Profit', value: '$2.4M', change: '+24%' },
    { label: 'Success Rate', value: '94.2%', change: '+2.1%' },
    { label: 'Uptime', value: '99.9%', change: '100%' }
  ];

  // Rotate features every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-cyan-600/10 to-purple-600/10 animate-pulse" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Status Badge */}
            <Badge variant="outline" className="mb-6 bg-green-500/20 text-green-400 border-green-500/30">
              <Activity className="w-3 h-3 mr-2 animate-pulse" />
              System Operational - 99.9% Uptime
            </Badge>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Waides KI
              </span>
              <br />
              <span className="text-white text-3xl sm:text-4xl md:text-5xl">
                Autonomous Trading Intelligence
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience the future of trading with AI-powered decision making, 
              real-time analytics, and sacred wealth management principles
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/portal">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-3">
                  <Play className="w-5 h-5 mr-2" />
                  Start Trading
                </Button>
              </Link>
              <Link href="/learning">
                <Button variant="outline" size="lg" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 px-8 py-3">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              {quickStats.map((stat, index) => (
                <Card key={index} className="bg-slate-800/40 border-purple-500/30 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                    <div className="text-xs text-green-400">+{stat.change}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Powered by Advanced AI Intelligence
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our comprehensive trading platform combines cutting-edge technology 
            with intelligent automation for optimal results
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className={`bg-slate-800/40 border-purple-500/30 backdrop-blur-sm transition-all duration-300 hover:border-purple-400/60 cursor-pointer ${
                  index === currentFeature ? 'ring-2 ring-purple-500/50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-purple-400" />
                    <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      {feature.stats}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-2xl p-8 border border-purple-500/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Begin Your Trading Journey?
            </h2>
            <p className="text-gray-300">
              Join thousands of successful traders using Waides KI
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/portal">
              <Card className="bg-slate-800/40 border-purple-500/30 hover:border-purple-400/60 transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Trading Portal</h3>
                  <p className="text-gray-400 text-sm">Access live trading interface</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/forum">
              <Card className="bg-slate-800/40 border-purple-500/30 hover:border-purple-400/60 transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Community</h3>
                  <p className="text-gray-400 text-sm">Connect with traders</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/learning">
              <Card className="bg-slate-800/40 border-purple-500/30 hover:border-purple-400/60 transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Brain className="h-8 w-8 text-green-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Learning</h3>
                  <p className="text-gray-400 text-sm">Master trading skills</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StableLanding;