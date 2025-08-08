import { useState, useEffect, useRef } from 'react';
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
  Activity,
  ChevronDown,
  Bot,
  Sparkles,
  BarChart3,
  Shield,
  Crown
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';

const StableNavigation = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Simple navigation items without dropdowns
  const simpleNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Forum', path: '/forum', icon: Users },
    { name: 'Academy', path: '/learning', icon: BookOpen }
  ];

  // Dropdown navigation categories
  const dropdownNavItems = [
    {
      name: 'Core Trading',
      icon: TrendingUp,
      key: 'trading',
      items: [
        { name: 'Vision Portal', path: '/portal', description: 'Main trading interface' },
        { name: 'Trading Interface', path: '/trading', description: 'Advanced trading tools' },
        { name: 'Bot Dashboard', path: '/bot-dashboard', description: 'Unified bot control' },
        { name: 'Live Data', path: '/live-data', description: 'Real-time market data' },
        { name: 'Dashboard', path: '/dashboard', description: 'Trading overview' }
      ]
    },
    {
      name: 'AI Systems',
      icon: Brain,
      key: 'ai',
      items: [
        { name: 'AI Systems', path: '/ai-systems', description: 'AI trading management' },
        { name: 'Maibot (Free)', path: '/maibot', description: 'Entry-level bot' },
        { name: 'WaidBot', path: '/waidbot', description: 'Standard trading bot' },
        { name: 'WaidBot Pro', path: '/waidbot-pro', description: 'Professional bot' },
        { name: 'Enhanced WaidBot', path: '/enhanced-waidbot', description: 'Advanced bot features' },
        { name: 'Autonomous Trader', path: '/autonomous-trader', description: 'Fully automated trading' },
        { name: 'Full Engine', path: '/full-engine', description: 'Complete AI system' }
      ]
    },
    {
      name: 'Wallet',
      icon: Wallet,
      key: 'wallet',
      items: [
        { name: 'Main Wallet', path: '/wallet', description: 'Portfolio management' },
        { name: 'SmaiSika Wallet', path: '/wallet-simple', description: 'Simplified wallet' },
        { name: 'Enhanced Wallet', path: '/enhanced-wallet', description: 'Professional tools' }
      ]
    },
    {
      name: 'Profile',
      icon: Settings,
      key: 'profile',
      items: [
        { name: 'Profile', path: '/profile', description: 'User profile' },
        { name: 'Settings', path: '/profile-settings', description: 'Account settings' },
        { name: 'Support', path: '/support', description: 'Help and assistance' }
      ]
    }
  ];

  // Close dropdowns when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const dropdownRef = dropdownRefs.current[activeDropdown];
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [activeDropdown]);

  const toggleDropdown = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const isPathInDropdown = (items: { path: string }[]) => {
    return items.some(item => location === item.path);
  };

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
            {/* Simple Navigation Items */}
            {simpleNavItems.map((item) => {
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

            {/* Dropdown Navigation Items */}
            {dropdownNavItems.map((dropdown) => {
              const Icon = dropdown.icon;
              const isActive = isPathInDropdown(dropdown.items);
              const isOpen = activeDropdown === dropdown.key;
              
              return (
                <div 
                  key={dropdown.key}
                  className="relative"
                  ref={(el) => { dropdownRefs.current[dropdown.key] = el; }}
                >
                  <button
                    onClick={() => toggleDropdown(dropdown.key)}
                    className={`
                      flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer
                      ${isActive 
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                        : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{dropdown.name}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-slate-800/95 backdrop-blur-md border border-purple-500/20 rounded-lg shadow-2xl z-50 overflow-hidden">
                      <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
                        {dropdown.items.map((item) => {
                          const isItemActive = location === item.path;
                          return (
                            <Link key={item.path} href={item.path}>
                              <div
                                onClick={() => setActiveDropdown(null)}
                                className={`
                                  px-4 py-3 transition-all duration-200 cursor-pointer border-b border-slate-700/50 last:border-0
                                  ${isItemActive 
                                    ? 'bg-blue-600/20 text-blue-300' 
                                    : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                                  }
                                `}
                              >
                                <div className="font-medium text-sm">{item.name}</div>
                                {item.description && (
                                  <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
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
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
              {/* Simple Mobile Items */}
              {simpleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer
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

              {/* Mobile Dropdown Sections */}
              {dropdownNavItems.map((dropdown) => {
                const Icon = dropdown.icon;
                const isActive = isPathInDropdown(dropdown.items);
                const isOpen = activeDropdown === dropdown.key;
                
                return (
                  <div key={dropdown.key} className="space-y-1">
                    <button
                      onClick={() => toggleDropdown(dropdown.key)}
                      className={`
                        w-full flex items-center justify-between space-x-3 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer
                        ${isActive 
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                          : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{dropdown.name}</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Mobile Dropdown Items */}
                    {isOpen && (
                      <div className="ml-6 space-y-1 border-l-2 border-purple-500/30 pl-3">
                        {dropdown.items.map((item) => {
                          const isItemActive = location === item.path;
                          return (
                            <Link key={item.path} href={item.path}>
                              <div
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setIsMobileMenuOpen(false);
                                }}
                                className={`
                                  px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer
                                  ${isItemActive 
                                    ? 'bg-blue-600/20 text-blue-300' 
                                    : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                                  }
                                `}
                              >
                                <div className="font-medium text-sm">{item.name}</div>
                                {item.description && (
                                  <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
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