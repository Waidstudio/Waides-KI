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
  Activity
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
    <nav className="bg-slate-800/95 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-12">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="relative">
                  <Brain className="h-6 w-6 text-blue-400" />
                  <TrendingUp className="h-3 w-3 text-emerald-400 absolute -top-1 -right-1" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Waides KI
                  </h1>
                  <p className="text-xs text-gray-400 hidden sm:block -mt-1">AI Trading Platform</p>
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
                      flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer
                      ${isActive 
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
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
            <Badge variant="outline" className="ml-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
              <Activity className="w-3 h-3 mr-1" />
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
          <div className="md:hidden border-t border-slate-700 py-2">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer
                        ${isActive 
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
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