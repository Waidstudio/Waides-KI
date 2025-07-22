import { Link } from 'wouter';
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Users, 
  Play,
  BookOpen
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent } from './card';

const StaticLanding = () => {
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
    { label: 'Active Traders', value: '12,847' },
    { label: 'Total Profit', value: '$2.4M' },
    { label: 'Success Rate', value: '94.2%' },
    { label: 'Uptime', value: '99.9%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Static Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-cyan-600/10 to-purple-600/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Status Badge */}
            <div className="mb-8">
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                System Operational - 99.9% Uptime
              </Badge>
            </div>

            {/* Main Heading */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Waides KI
                </span>
              </h1>
              <h2 className="text-3xl md:text-4xl font-semibold text-white">
                Autonomous Trading Intelligence
              </h2>
            </div>

            {/* Subtitle */}
            <div className="mb-12">
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Experience the future of trading with AI-powered decision making, 
                real-time analytics, and sacred wealth management principles
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link href="/portal">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-4">
                  <Play className="w-5 h-5 mr-2" />
                  Start Trading
                </Button>
              </Link>
              <Link href="/learning">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-purple-500/30 text-purple-300 hover:bg-purple-500/20 px-8 py-4">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
                <Card key={index} className="bg-slate-800/40 border-purple-500/30">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Powered by Advanced AI Intelligence
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our comprehensive trading platform combines cutting-edge technology 
              with intelligent automation for optimal results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="bg-slate-800/40 border-purple-500/30 hover:border-purple-400/60 transition-colors duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="h-8 w-8 text-purple-400" />
                      <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        {feature.stats}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-2xl p-12 border border-purple-500/20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Begin Your Trading Journey?
              </h2>
              <p className="text-xl text-gray-300">
                Join thousands of successful traders using Waides KI
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Link href="/portal">
                <Card className="bg-slate-800/40 border-purple-500/30 hover:border-purple-400/60 transition-all cursor-pointer h-full">
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-3">Trading Portal</h3>
                    <p className="text-gray-400">Access live trading interface</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/forum">
                <Card className="bg-slate-800/40 border-purple-500/30 hover:border-purple-400/60 transition-all cursor-pointer h-full">
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-3">Community</h3>
                    <p className="text-gray-400">Connect with traders</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/learning">
                <Card className="bg-slate-800/40 border-purple-500/30 hover:border-purple-400/60 transition-all cursor-pointer h-full">
                  <CardContent className="p-8 text-center">
                    <Brain className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-3">Learning</h3>
                    <p className="text-gray-400">Master trading skills</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticLanding;