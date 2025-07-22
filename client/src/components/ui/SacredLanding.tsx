import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Brain, 
  Zap,
  Users,
  ChevronRight,
  Play,
  Star
} from 'lucide-react';
import { Link } from 'wouter';
import { SacredPageTransition, SacredHover, SacredGlow, SacredBreath, CosmicBackground } from './SacredMotion';
import { Button } from './button';
import { Badge } from './badge';

const SacredLanding = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const sacredFeatures = [
    {
      icon: Brain,
      title: 'Divine Intelligence',
      description: 'KonsAI powered autonomous trading with sacred wisdom',
      color: 'purple',
      stats: '98% Accuracy'
    },
    {
      icon: Shield,
      title: 'Sacred Protection',
      description: 'Advanced risk management with spiritual guidance',
      color: 'cyan',
      stats: 'Zero Loss Mode'
    },
    {
      icon: TrendingUp,
      title: 'Mystic Analytics',
      description: 'Real-time market insights with cosmic patterns',
      color: 'gold',
      stats: 'Live Data'
    },
    {
      icon: Users,
      title: 'Sacred Community',
      description: 'Connect with fellow spiritual traders',
      color: 'green',
      stats: '10k+ Members'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Mystic Trader',
      quote: 'Waides KI transformed my trading with divine wisdom.',
      rating: 5,
      profit: '+340%'
    },
    {
      name: 'Marcus Webb',
      role: 'Sacred Investor',
      quote: 'The spiritual approach to wealth creation is revolutionary.',
      rating: 5,
      profit: '+280%'
    },
    {
      name: 'Aria Patel',
      role: 'Divine Analyst',
      quote: 'KonsAI predictions have been incredibly accurate.',
      rating: 5,
      profit: '+420%'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % sacredFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <SacredPageTransition>
      <CosmicBackground className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
        
        {/* Sacred Hero Section */}
        <section className="relative pt-32 pb-20 px-4">
          <div className="sacred-container text-center">
            
            {/* Floating cursor effect */}
            <motion.div
              className="fixed w-6 h-6 pointer-events-none z-50 mix-blend-difference"
              animate={{
                x: mousePosition.x - 12,
                y: mousePosition.y - 12,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
              <div className="w-full h-full bg-white rounded-full opacity-50" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto mb-8"
            >
              <Badge className="mb-6 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 text-purple-300 border-purple-500/30">
                <Sparkles className="w-4 h-4 mr-2" />
                Sacred Intelligence Platform
              </Badge>
              
              <h1 className="sacred-title text-5xl md:text-7xl mb-6">
                Welcome to the
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Sacred Future
                </span>
                <br />
                of Wealth
              </h1>
              
              <p className="sacred-subtitle max-w-2xl mx-auto mb-8">
                Where ancient wisdom meets modern technology. Transform your relationship with money through divine intelligence and sacred trading principles.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <SacredHover>
                  <Link href="/trading">
                    <Button className="sacred-button bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-4 text-lg font-semibold">
                      Begin Sacred Journey
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </SacredHover>
                
                <SacredHover>
                  <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-8 py-4 text-lg">
                    <Play className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Button>
                </SacredHover>
              </div>
            </motion.div>

            {/* Sacred Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
            >
              {[
                { label: 'Sacred Traders', value: '10,000+' },
                { label: 'Total Profit', value: '$50M+' },
                { label: 'Success Rate', value: '98.5%' },
                { label: 'Countries', value: '120+' }
              ].map((stat, index) => (
                <SacredBreath key={index} intensity={1}>
                  <div className="text-center">
                    <div className="sacred-title text-2xl md:text-3xl text-purple-300 mb-1">
                      {stat.value}
                    </div>
                    <div className="sacred-muted text-sm">
                      {stat.label}
                    </div>
                  </div>
                </SacredBreath>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Sacred Features Showcase */}
        <section className="py-20 px-4">
          <div className="sacred-container">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="sacred-title text-4xl mb-6">
                Sacred Powers
              </h2>
              <p className="sacred-subtitle max-w-2xl mx-auto">
                Experience the divine fusion of spirituality and financial technology
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {sacredFeatures.map((feature, index) => {
                const Icon = feature.icon;
                const isActive = index === currentFeature;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`sacred-card text-center ${isActive ? 'border-purple-400/50' : ''}`}
                  >
                    <SacredGlow color={feature.color as any}>
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r ${
                        feature.color === 'purple' ? 'from-purple-600 to-violet-600' :
                        feature.color === 'cyan' ? 'from-cyan-600 to-blue-600' :
                        feature.color === 'gold' ? 'from-yellow-600 to-orange-600' :
                        'from-green-600 to-emerald-600'
                      } flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </SacredGlow>
                    
                    <h3 className="text-xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="sacred-muted mb-4">
                      {feature.description}
                    </p>
                    <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                      {feature.stats}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sacred Testimonials */}
        <section className="py-20 px-4 bg-gradient-to-r from-purple-900/20 to-cyan-900/20">
          <div className="sacred-container">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="sacred-title text-4xl mb-6">
                Sacred Testimonials
              </h2>
              <p className="sacred-subtitle max-w-2xl mx-auto">
                Hear from our divine community of spiritual traders
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="sacred-card"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="sacred-body mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">
                        {testimonial.name}
                      </div>
                      <div className="sacred-muted text-sm">
                        {testimonial.role}
                      </div>
                    </div>
                    <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                      {testimonial.profit}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Sacred Call to Action */}
        <section className="py-20 px-4">
          <div className="sacred-container text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto sacred-card p-12"
            >
              <SacredGlow color="purple">
                <Zap className="w-16 h-16 mx-auto mb-6 text-purple-400" />
              </SacredGlow>
              
              <h2 className="sacred-title text-4xl mb-6">
                Ready to Begin Your
                <br />
                Sacred Journey?
              </h2>
              
              <p className="sacred-subtitle mb-8">
                Join thousands of spiritual traders who have transformed their relationship with wealth through divine wisdom and sacred intelligence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SacredHover>
                  <Link href="/trading">
                    <Button className="sacred-button bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-4 text-lg font-semibold">
                      Enter the Sacred Portal
                      <Sparkles className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </SacredHover>
                
                <SacredHover>
                  <Link href="/academy">
                    <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 px-8 py-4 text-lg">
                      Learn Sacred Wisdom
                      <Brain className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </SacredHover>
              </div>
            </motion.div>
          </div>
        </section>

      </CosmicBackground>
    </SacredPageTransition>
  );
};

export default SacredLanding;