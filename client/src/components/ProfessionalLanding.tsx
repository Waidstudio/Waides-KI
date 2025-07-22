import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, TrendingUp, Shield, Zap, Users, BarChart3, 
  Globe, Cpu, Database, ChevronRight, Star, ArrowRight,
  Bot, Wallet, MessageCircle, Settings, Eye, Heart
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status?: 'active' | 'beta' | 'coming-soon';
  link?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, status = 'active', link }) => (
  <Card className="group relative overflow-hidden border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900/80 transition-all duration-300 hover:scale-105">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all">
          {icon}
        </div>
        {status && (
          <Badge 
            variant="outline" 
            className={`text-xs ${
              status === 'active' ? 'border-green-500/50 text-green-300' :
              status === 'beta' ? 'border-yellow-500/50 text-yellow-300' :
              'border-gray-500/50 text-gray-400'
            }`}
          >
            {status === 'active' ? 'LIVE' : status === 'beta' ? 'BETA' : 'SOON'}
          </Badge>
        )}
      </div>
      <CardTitle className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-400 text-sm leading-relaxed mb-4">
        {description}
      </p>
      {link && (
        <Link href={link}>
          <Button variant="ghost" size="sm" className="w-full justify-between text-purple-300 hover:text-white hover:bg-purple-600/20">
            Launch Platform
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      )}
    </CardContent>
  </Card>
);

const StatCard: React.FC<{ icon: React.ReactNode; value: string; label: string; trend?: string }> = ({ 
  icon, value, label, trend 
}) => (
  <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
      {icon}
    </div>
    <div>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {trend && (
          <span className="text-sm text-green-400 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  </div>
);

export default function ProfessionalLanding() {
  const [systemStats, setSystemStats] = useState({
    activeBots: '12',
    totalVolume: '$2.4M',
    winRate: '87.3%',
    uptime: '99.9%'
  });

  const coreFeatures = [
    {
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      title: "AI Trading Intelligence",
      description: "Advanced KonsAI system with 200+ autonomous modules for market analysis, prediction, and trade execution with spiritual guidance.",
      status: 'active' as const,
      link: "/portal"
    },
    {
      icon: <Wallet className="w-6 h-6 text-blue-400" />,
      title: "Global Wallet System",
      description: "SmaiSika universal wallet supporting 50+ payment providers worldwide with biometric security and real-time transactions.",
      status: 'active' as const,
      link: "/wallet"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-400" />,
      title: "WaidBot Trading Engine",
      description: "Autonomous trading bots with machine learning capabilities, risk management, and 24/7 market monitoring.",
      status: 'active' as const,
      link: "/waidbot-engine"
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-cyan-400" />,
      title: "Cosmic Trading Forum",
      description: "Dynamic AI-powered community hub with KonsAI oracle posts, technical analysis, and real-time market discussions.",
      status: 'active' as const,
      link: "/forum"
    },
    {
      icon: <Shield className="w-6 h-6 text-amber-400" />,
      title: "KonsPowa Auto-Healer",
      description: "100-task autonomous healing system with real-time monitoring, self-repair capabilities, and intelligent optimization.",
      status: 'active' as const,
      link: "/kons-powa"
    },
    {
      icon: <Settings className="w-6 h-6 text-red-400" />,
      title: "Advanced Admin Suite",
      description: "Comprehensive administrative interface with 20+ management panels, system controls, and enterprise-grade monitoring.",
      status: 'active' as const,
      link: "/admin-panel"
    }
  ];

  const advancedFeatures = [
    {
      icon: <Eye className="w-6 h-6 text-indigo-400" />,
      title: "Vision Spirit Engine",
      description: "Mystical market analysis combining technical indicators with spiritual insights for enhanced trading awareness.",
      status: 'beta' as const,
      link: "/vision-spirit"
    },
    {
      icon: <Cpu className="w-6 h-6 text-pink-400" />,
      title: "Quantum Strategy Generator",
      description: "AI-powered strategy creation using quantum computing principles and advanced market pattern recognition.",
      status: 'beta' as const,
      link: "/strategy-autogen"
    },
    {
      icon: <Database className="w-6 h-6 text-violet-400" />,
      title: "Memory Tree System",
      description: "Advanced learning engine with persistent memory, pattern recognition, and evolutionary strategy improvement.",
      status: 'active' as const,
      link: "/full-engine"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Next-Generation Autonomous Wealth Management
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-6">
              Waides KI
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              The world's most advanced AI-powered trading ecosystem. Combining cutting-edge technology 
              with spiritual intelligence for ethical, profitable, and autonomous wealth creation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/portal">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold">
                  Launch Trading Portal
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 px-8 py-3 text-lg">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            <StatCard 
              icon={<Bot className="w-5 h-5 text-purple-400" />}
              value={systemStats.activeBots}
              label="Active Trading Bots"
              trend="+15%"
            />
            <StatCard 
              icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
              value={systemStats.totalVolume}
              label="Total Volume"
              trend="+23%"
            />
            <StatCard 
              icon={<Star className="w-5 h-5 text-amber-400" />}
              value={systemStats.winRate}
              label="Win Rate"
              trend="+5.2%"
            />
            <StatCard 
              icon={<Shield className="w-5 h-5 text-cyan-400" />}
              value={systemStats.uptime}
              label="System Uptime"
            />
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Core Trading Platform
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Complete suite of professional trading tools designed for both beginners and experts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {coreFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Advanced Intelligence Systems
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Cutting-edge AI modules for sophisticated trading strategies and market analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Scale & Security
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Enterprise-grade infrastructure powering millions of trades with zero downtime
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Globe className="w-6 h-6 text-blue-400" />
                  Global Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-400">
                  <li>• 99.9% Uptime SLA</li>
                  <li>• Multi-region deployment</li>
                  <li>• Real-time data processing</li>
                  <li>• Auto-scaling capabilities</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Shield className="w-6 h-6 text-emerald-400" />
                  Security & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-400">
                  <li>• Bank-grade encryption</li>
                  <li>• Multi-factor authentication</li>
                  <li>• Regulatory compliance</li>
                  <li>• Audit trail logging</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <Brain className="w-6 h-6 text-purple-400" />
                  AI Technology
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-400">
                  <li>• 200+ AI modules</li>
                  <li>• Machine learning models</li>
                  <li>• Predictive analytics</li>
                  <li>• Continuous improvement</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of traders already using Waides KI to maximize their potential
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/portal">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold">
                Start Trading Now
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <Link href="/learning">
              <Button variant="outline" size="lg" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 px-8 py-3 text-lg">
                Learn Trading Academy
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Waides KI</h3>
              <p className="text-gray-400 text-sm">
                Next-generation autonomous wealth management platform powered by AI and spiritual intelligence.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/portal" className="hover:text-white transition-colors">Trading Portal</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/wallet" className="hover:text-white transition-colors">Wallet</Link></li>
                <li><Link href="/forum" className="hover:text-white transition-colors">Forum</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Tools</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/waidbot-engine" className="hover:text-white transition-colors">WaidBot Engine</Link></li>
                <li><Link href="/strategy-autogen" className="hover:text-white transition-colors">Strategy Generator</Link></li>
                <li><Link href="/risk-backtesting" className="hover:text-white transition-colors">Risk Analysis</Link></li>
                <li><Link href="/api-docs" className="hover:text-white transition-colors">API Docs</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/learning" className="hover:text-white transition-colors">Trading Academy</Link></li>
                <li><Link href="/profile" className="hover:text-white transition-colors">Profile</Link></li>
                <li><Link href="/admin-panel" className="hover:text-white transition-colors">Admin</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Waides KI. All rights reserved. Built with advanced AI for autonomous wealth management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}