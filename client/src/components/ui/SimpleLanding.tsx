import { Link } from 'wouter';
import { 
  TrendingUp, 
  Shield, 
  Brain,
  BarChart3,
  ArrowRight,
  Zap,
  DollarSign,
  Users
} from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

const SimpleLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SmaiSika</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            AI-Powered Trading Platform
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Advanced autonomous wealth management platform delivering intelligent financial solutions 
            through adaptive digital technologies and AI-powered trading systems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700">
                Start Trading Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Advanced Trading Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <Brain className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">AI Trading Bots</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Advanced AI-powered trading bots with machine learning capabilities
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <Shield className="w-8 h-8 text-emerald-400 mb-2" />
                <CardTitle className="text-white">Risk Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Smart risk management across multiple autonomous trading systems
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-purple-400 mb-2" />
                <CardTitle className="text-white">Real-time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Live market data and comprehensive trading analytics
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <Zap className="w-8 h-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">High Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Lightning-fast execution with enterprise-grade infrastructure
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">$2.5M+</div>
              <div className="text-slate-300">Assets Under Management</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">94.7%</div>
              <div className="text-slate-300">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">99.9%</div>
              <div className="text-slate-300">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900/50 to-emerald-900/50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of traders using our AI-powered platform
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700">
              Create Your Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/80 py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-slate-400">
            © 2025 SmaiSika. Advanced autonomous wealth management platform.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SimpleLanding;