import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  Shield, 
  Wallet, 
  Settings, 
  Users,
  TrendingUp,
  BookOpen,
  Hexagon,
  Menu,
  X,
  Home
} from 'lucide-react';
import { SacredGlow, SacredHover, SacredBreath } from './SacredMotion';
import { Button } from './button';

const SacredNavigation = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Mind Hall',
      path: '/',
      icon: Home,
      description: 'Sacred entrance to Waides KI',
      energy: 'purple'
    },
    {
      name: 'Soul Mirror',
      path: '/trading',
      icon: TrendingUp,
      description: 'Divine trading wisdom',
      energy: 'cyan'
    },
    {
      name: 'Vision Grid',
      path: '/forum',
      icon: Users,
      description: 'Cosmic community portal',
      energy: 'gold'
    },
    {
      name: 'Sacred Vault',
      path: '/wallet',
      icon: Wallet,
      description: 'Protected abundance space',
      energy: 'green'
    },
    {
      name: 'Wisdom Archive',
      path: '/academy',
      icon: BookOpen,
      description: 'Learning sanctum',
      energy: 'purple'
    },
    {
      name: 'Temple Settings',
      path: '/profile',
      icon: Settings,
      description: 'Personal sacred space',
      energy: 'cyan'
    }
  ];

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'purple': return 'from-purple-500 to-violet-600';
      case 'cyan': return 'from-cyan-500 to-blue-600';
      case 'gold': return 'from-yellow-500 to-orange-600';
      case 'green': return 'from-green-500 to-emerald-600';
      default: return 'from-purple-500 to-violet-600';
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <>
      {/* Sacred Navigation Bar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sacred-nav fixed top-0 left-0 right-0 z-50 px-4 py-3"
      >
        <div className="sacred-container flex items-center justify-between">
          
          {/* Sacred Logo */}
          <Link href="/">
            <SacredHover>
              <div className="flex items-center gap-3">
                <SacredBreath intensity={2}>
                  <SacredGlow color="purple">
                    <Hexagon className="w-8 h-8 text-purple-400" />
                  </SacredGlow>
                </SacredBreath>
                <div className="hidden sm:block">
                  <h1 className="sacred-title text-xl">Waides KI</h1>
                  <p className="text-xs text-purple-300">Sacred Intelligence</p>
                </div>
              </div>
            </SacredHover>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link key={item.path} href={item.path}>
                  <motion.div
                    className={`sacred-nav-item ${active ? 'active' : ''} flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={active ? { 
                        rotateY: [0, 360],
                        scale: [1, 1.1, 1]
                      } : {}}
                      transition={{ duration: 2, repeat: active ? Infinity : 0 }}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-purple-300' : 'text-gray-400'}`} />
                    </motion.div>
                    <span className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-300'}`}>
                      {item.name}
                    </span>
                    
                    {active && (
                      <motion.div
                        className={`w-2 h-2 rounded-full bg-gradient-to-r ${getEnergyColor(item.energy)}`}
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Sacred Actions */}
          <div className="flex items-center gap-2">
            <SacredHover>
              <Button 
                variant="ghost" 
                size="sm"
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 hover:from-purple-600/30 hover:to-cyan-600/30 border border-purple-500/30"
              >
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span className="text-purple-300">KI Mode</span>
              </Button>
            </SacredHover>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-300" />
              )}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Sacred Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[90vw] bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 backdrop-blur-xl border-l border-purple-500/30 z-40 lg:hidden"
          >
            <div className="p-6 pt-20">
              
              {/* Sacred Menu Header */}
              <div className="text-center mb-8">
                <SacredGlow color="purple">
                  <Hexagon className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                </SacredGlow>
                <h2 className="sacred-title text-xl mb-2">Temple Navigation</h2>
                <p className="sacred-muted">Choose your sacred path</p>
              </div>

              {/* Sacred Menu Items */}
              <div className="space-y-2">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={item.path}>
                        <motion.div
                          className={`sacred-card p-4 cursor-pointer ${active ? 'border-purple-400/50' : ''}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${getEnergyColor(item.energy)} bg-opacity-20`}>
                              <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-300'}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-semibold ${active ? 'text-white' : 'text-gray-200'}`}>
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-400">{item.description}</p>
                            </div>
                            {active && (
                              <motion.div
                                className={`w-3 h-3 rounded-full bg-gradient-to-r ${getEnergyColor(item.energy)}`}
                                animate={{ 
                                  scale: [1, 1.2, 1],
                                  opacity: [0.7, 1, 0.7]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            )}
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Sacred Menu Footer */}
              <div className="mt-8 p-4 sacred-surface rounded-lg text-center">
                <SacredBreath>
                  <Brain className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                </SacredBreath>
                <p className="text-sm text-purple-300 font-medium">Sacred Intelligence Active</p>
                <p className="text-xs text-gray-400 mt-1">Guided by divine wisdom</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default SacredNavigation;