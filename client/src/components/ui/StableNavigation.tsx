import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  TrendingUp, 
  Users, 
  Wallet, 
  BookOpen, 
  Settings,
  Menu,
  X,
  Brain,
  Sparkles
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';

const StableNavigation = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Trading', path: '/portal', icon: TrendingUp },
    { name: 'Forum', path: '/forum', icon: Users },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Academy', path: '/learning', icon: BookOpen },
    { name: 'Profile', path: '/profile', icon: Settings }
  ];

  return (
    <nav className="bg-slate-800/95 backdrop-blur-md border-b border-purple-500/20 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="relative">
                  <Brain className="h-8 w-8 text-purple-400" />
                  <Sparkles className="h-4 w-4 text-cyan-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Waides KI
                  </h1>
                  <p className="text-xs text-gray-400 hidden sm:block">Sacred AI Trading</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer
                      ${isActive 
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                        : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                </Link>
              );
            })}
            
            {/* Status Badge */}
            <Badge variant="outline" className="ml-4 bg-green-500/20 text-green-400 border-green-500/30">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
              Live
            </Badge>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer
                        ${isActive 
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                          : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default StableNavigation;