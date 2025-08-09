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
  Crown,
  MessageCircle,
  Bell,
  User,
  Search,
  LogOut,
  Moon,
  Sun,
  Globe,
  Zap,
  Target,
  Database,
  Cpu,
  Eye,
  Lock,
  Star,
  Layers,
  Network,
  Gauge,
  Coins,
  TrendingDown,
  Calendar,
  Heart,
  Flame,
  Wind,
  Mountain,
  Waves,
  Compass,
  Infinity,
  Command,
  DollarSign,
  TestTube
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { useUserAuth } from '../../hooks/useUserAuth';

const StableNavigation = () => {
  const [location, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalTradingMode, setGlobalTradingMode] = useState<'demo' | 'real'>('demo');
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const { user, isAuthenticated, logout } = useUserAuth();

  // Simple navigation items without dropdowns
  const simpleNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Forum', path: '/forum', icon: Users },
    { name: 'Academy', path: '/learning', icon: BookOpen }
  ];

  // Comprehensive dropdown navigation categories
  const dropdownNavItems = [
    {
      name: 'Core Trading',
      icon: TrendingUp,
      key: 'trading',
      color: 'from-blue-500 to-cyan-400',
      items: [
        { name: 'Vision Portal', path: '/portal', description: 'Main trading interface', icon: Eye },
        { name: 'Trading Interface', path: '/trading', description: 'Advanced trading tools', icon: BarChart3 },
        { name: 'Bot Dashboard', path: '/bot-dashboard', description: 'Unified bot control', icon: Bot },
        { name: 'Live Data', path: '/live-data', description: 'Real-time market data', icon: Activity },
        { name: 'Dashboard', path: '/dashboard', description: 'Trading overview', icon: Gauge },
        { name: 'Analytics', path: '/analytics', description: 'Performance metrics', icon: TrendingUp },
        { name: 'Risk Backtesting', path: '/risk-backtesting', description: 'Strategy validation', icon: Shield }
      ]
    },
    {
      name: 'AI Systems',
      icon: Brain,
      key: 'ai',
      color: 'from-purple-500 to-pink-400',
      items: [
        { name: 'AI Systems Hub', path: '/ai-systems', description: 'AI trading management', icon: Brain },
        { name: 'Maibot (Free)', path: '/maibot', description: 'Entry-level bot', icon: Bot },
        { name: 'WaidBot', path: '/waidbot', description: 'Standard trading bot', icon: Zap },
        { name: 'WaidBot Pro', path: '/waidbot-pro', description: 'Professional bot', icon: Crown },
        { name: 'Enhanced WaidBot', path: '/enhanced-waidbot', description: 'Advanced features', icon: Sparkles },
        { name: 'Autonomous Trader', path: '/autonomous-trader', description: 'Fully automated', icon: Target },
        { name: 'Full Engine', path: '/full-engine', description: 'Complete AI system', icon: Cpu },
        { name: 'WaidBot Engine', path: '/waidbot-engine', description: 'Core engine', icon: Database },
        { name: 'Strategy Generator', path: '/strategy-autogen', description: 'AI strategy creation', icon: Star }
      ]
    },
    {
      name: 'Spiritual AI',
      icon: Sparkles,
      key: 'spiritual',
      color: 'from-emerald-500 to-teal-400',
      items: [
        { name: 'Dream Vision', path: '/dream-vision', description: 'AI consciousness layer', icon: Eye },
        { name: 'Vision Spirit', path: '/vision-spirit', description: 'Spiritual guidance', icon: Heart },
        { name: 'Spiritual Recall', path: '/spiritual-recall', description: 'Memory healing', icon: Brain },
        { name: 'Seasonal Rebirth', path: '/seasonal-rebirth', description: 'Renewal cycles', icon: Waves },
        { name: 'Sigil Layer', path: '/sigil-layer', description: 'Symbolic systems', icon: Star },
        { name: 'Shadow Defense', path: '/shadow-defense', description: 'Protection protocols', icon: Shield },
        { name: 'Reincarnation Loop', path: '/reincarnation', description: 'Evolutionary AI', icon: Infinity },
        { name: 'ETH Guardian', path: '/eth-empath-guardian', description: 'Network guardian', icon: Globe },
        { name: 'Meta Guardian', path: '/meta-guardian', description: 'Universal protection', icon: Mountain }
      ]
    },
    {
      name: 'Advanced Systems',
      icon: Cpu,
      key: 'advanced',
      color: 'from-orange-500 to-red-400',
      items: [
        { name: 'KonsPowa Engine', path: '/kons-powa', description: 'System automation', icon: Flame },
        { name: 'ML Lifecycle', path: '/ml-lifecycle', description: 'Model management', icon: Database },
        { name: 'Voice Commands', path: '/voice-command', description: 'Voice control', icon: Command },
        { name: 'Biometric Trading', path: '/biometric-trading', description: 'Bio-authentication', icon: Lock },
        { name: 'Market Storytelling', path: '/market-storytelling', description: 'AI narratives', icon: BookOpen },
        { name: 'Gateway', path: '/gateway', description: 'System gateway', icon: Network },
        { name: 'System Validation', path: '/system-validation', description: 'Health checks', icon: Gauge }
      ]
    },
    {
      name: 'Wallet & Finance',
      icon: Wallet,
      key: 'wallet',
      color: 'from-green-500 to-emerald-400',
      items: [
        { name: 'Main Wallet', path: '/wallet', description: 'Portfolio management', icon: Wallet },
        { name: 'SmaiSika Wallet', path: '/wallet-simple', description: 'Simplified interface', icon: Coins },
        { name: 'Professional Wallet', path: '/wallet-pro', description: 'Advanced KonsMesh wallet', icon: TrendingUp },
        { name: 'Payment Admin', path: '/payment-admin', description: 'Payment management', icon: Settings },
        { name: 'Exchange Pool', path: '/admin-exchange-pool', description: 'Exchange management', icon: Globe }
      ]
    },
    {
      name: 'Admin & Config',
      icon: Settings,
      key: 'admin',
      color: 'from-gray-500 to-slate-400',
      items: [
        { name: 'Admin Panel', path: '/admin', description: 'System administration', icon: Settings },
        { name: 'Admin Dashboard', path: '/admin-panel', description: 'Admin interface', icon: Gauge },
        { name: 'Configuration', path: '/config', description: 'System config', icon: Command },
        { name: 'Expanded Config', path: '/expanded-config', description: 'Advanced settings', icon: Layers },
        { name: 'SMS Config', path: '/sms-config', description: 'SMS settings', icon: MessageCircle },
        { name: 'API Documentation', path: '/api-docs', description: 'API reference', icon: BookOpen },
        { name: 'Security', path: '/security', description: 'Security settings', icon: Lock }
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
    // On desktop, toggle normally
    if (window.innerWidth >= 768) {
      setActiveDropdown(activeDropdown === key ? null : key);
    } else {
      // On mobile, toggle normally for category buttons
      setActiveDropdown(activeDropdown === key ? null : key);
    }
  };

  // Handle navigation clicks differently for desktop vs mobile
  const handleNavigationClick = (path: string, isMobile: boolean = false) => {
    if (isMobile) {
      // On mobile, close menu and dropdown after navigation
      setIsMobileMenuOpen(false);
      setActiveDropdown(null);
    } else {
      // On desktop, keep dropdown open for continued navigation
      // Only close dropdown if explicitly needed
    }
    navigate(path);
  };

  const isPathInDropdown = (items: { path: string }[]) => {
    return items.some(item => location === item.path);
  };

  return (
    <nav className="bg-slate-800/95 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 transition-all duration-300">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard">
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

          {/* Global Trading Mode Selector (After Logo) */}
          <div className="flex items-center ml-6">
            <div className="relative" ref={(el) => { dropdownRefs.current['trading-mode'] = el; }}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleDropdown('trading-mode')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                  globalTradingMode === 'demo' 
                    ? 'bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30' 
                    : 'bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30'
                }`}
              >
                {globalTradingMode === 'demo' ? (
                  <TestTube className="h-4 w-4" />
                ) : (
                  <DollarSign className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {globalTradingMode === 'demo' ? 'Demo Mode' : 'Real Trading'}
                </span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeDropdown === 'trading-mode' ? 'rotate-180' : ''}`} />
              </Button>

              {/* Trading Mode Dropdown */}
              {activeDropdown === 'trading-mode' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-md border border-purple-500/20 rounded-lg shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-700/50">
                    <h3 className="text-sm font-semibold text-white">Global Trading Mode</h3>
                    <p className="text-xs text-gray-400 mt-1">Controls all trading bots across the platform</p>
                  </div>
                  
                  <div className="py-2">
                    <div 
                      onClick={() => {
                        setGlobalTradingMode('demo');
                        setActiveDropdown(null);
                      }}
                      className={`flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-200 cursor-pointer ${
                        globalTradingMode === 'demo' 
                          ? 'bg-purple-500/20 text-purple-300' 
                          : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <TestTube className="h-4 w-4" />
                      <div className="flex-1">
                        <div className="font-medium">Demo Mode</div>
                        <div className="text-xs text-gray-400">Trade with 50,000 SmaiSika virtual funds</div>
                      </div>
                      {globalTradingMode === 'demo' && (
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    
                    <div 
                      onClick={() => {
                        setGlobalTradingMode('real');
                        setActiveDropdown(null);
                      }}
                      className={`flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-200 cursor-pointer ${
                        globalTradingMode === 'real' 
                          ? 'bg-amber-500/20 text-amber-300' 
                          : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <DollarSign className="h-4 w-4" />
                      <div className="flex-1">
                        <div className="font-medium">Real Trading</div>
                        <div className="text-xs text-gray-400">Trade with actual funds from your wallet</div>
                      </div>
                      {globalTradingMode === 'real' && (
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-3 border-t border-slate-700/50 bg-slate-700/20">
                    <div className="text-xs text-gray-400">
                      💡 Tip: Switch to Demo mode to test strategies risk-free
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Actions - Chat, Notifications, Profile (After Logo) */}
          <div className="flex items-center space-x-4 ml-8">
            {/* Search */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 w-56"
              />
            </div>

            {/* Chat Icon */}
            <Link href="/waidchat">
              <Button variant="ghost" size="sm" className="relative text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 p-2">
                <MessageCircle className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-blue-500 hover:bg-blue-500 flex items-center justify-center">
                  2
                </Badge>
              </Button>
            </Link>

            {/* Notifications */}
            <div className="relative" ref={(el) => { dropdownRefs.current['notifications'] = el; }}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleDropdown('notifications')}
                className="relative text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 p-2"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-emerald-500 hover:bg-emerald-500 animate-pulse flex items-center justify-center">
                    {notificationCount}
                  </Badge>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {activeDropdown === 'notifications' && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-md border border-purple-500/20 rounded-lg shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-700/50">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
                    <div className="p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 animate-pulse"></div>
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">ETH Price Alert</p>
                          <p className="text-xs text-gray-400 mt-1">ETH reached $4,045.39 (+4.55%)</p>
                          <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">WaidBot Update</p>
                          <p className="text-xs text-gray-400 mt-1">Trading cycle completed successfully</p>
                          <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">System Health</p>
                          <p className="text-xs text-gray-400 mt-1">All systems operational</p>
                          <p className="text-xs text-gray-500 mt-1">10 minutes ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-slate-700/50">
                    <Button variant="ghost" size="sm" className="w-full text-blue-400 hover:text-blue-300 text-xs">
                      View All Notifications
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={(el) => { dropdownRefs.current['profile'] = el; }}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleDropdown('profile')}
                className="relative text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 flex items-center space-x-2 p-2"
              >
                <User className="h-5 w-5" />
                {user && <span className="text-sm hidden lg:block">{user.username}</span>}
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeDropdown === 'profile' ? 'rotate-180' : ''}`} />
              </Button>

              {/* Profile Dropdown */}
              {activeDropdown === 'profile' && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-md border border-purple-500/20 rounded-lg shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  {user && (
                    <div className="p-4 border-b border-slate-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{user.username?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.username}</p>
                          <p className="text-xs text-gray-400">{user.email || 'Premium User'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="py-2">
                    <Link href="/profile">
                      <div 
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 cursor-pointer"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile Settings</span>
                      </div>
                    </Link>
                    
                    <Link href="/wallet">
                      <div 
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 cursor-pointer"
                      >
                        <Wallet className="h-4 w-4" />
                        <span>Wallet</span>
                      </div>
                    </Link>

                    <Link href="/support">
                      <div 
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 cursor-pointer"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Support</span>
                      </div>
                    </Link>
                  </div>

                  <div className="border-t border-slate-700/50 py-2">
                    <button
                      onClick={() => {
                        setActiveDropdown(null);
                        logout();
                      }}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 cursor-pointer w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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

                  {/* Enhanced Dropdown Menu with Category Colors and Icons */}
                  {isOpen && (
                    <div className={`absolute top-full left-0 mt-2 w-72 bg-slate-800/95 backdrop-blur-md border border-purple-500/20 rounded-lg shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200`}>
                      {/* Category Header */}
                      <div className={`p-3 border-b border-slate-700/50 bg-gradient-to-r ${dropdown.color} bg-opacity-10`}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-white" />
                          <h3 className="text-sm font-semibold text-white">{dropdown.name}</h3>
                        </div>
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
                        {dropdown.items.map((item, index) => {
                          const ItemIcon = item.icon;
                          const isItemActive = location === item.path;
                          return (
                            <Link 
                              key={item.path} 
                              href={item.path}
                            >
                              <div
                                onClick={(e) => {
                                  console.log('Desktop navigation clicked:', item.path, item.name);
                                  // Close dropdown on desktop after navigation
                                  setTimeout(() => setActiveDropdown(null), 100);
                                }}
                                className={`
                                  px-4 py-3 transition-all duration-200 cursor-pointer border-b border-slate-700/30 last:border-0
                                  hover:bg-slate-700/30 group
                                  ${isItemActive 
                                    ? 'bg-blue-600/20 text-blue-300 border-l-2 border-l-blue-400' 
                                    : 'text-gray-300 hover:text-white'
                                  }
                                `}
                                style={{
                                  animationDelay: `${index * 50}ms`,
                                  animation: isOpen ? 'fadeInUp 0.3s ease-out forwards' : ''
                                }}
                              >
                                  <div className="flex items-start space-x-3">
                                    {ItemIcon && (
                                      <ItemIcon className={`h-4 w-4 mt-0.5 transition-all duration-200 ${
                                        isItemActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                                      }`} />
                                    )}
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{item.name}</div>
                                      {item.description && (
                                        <div className="text-xs text-gray-400 group-hover:text-gray-300 mt-1">
                                          {item.description}
                                        </div>
                                      )}
                                    </div>
                                  </div>
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
            <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs animate-pulse">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>

          {/* Enhanced Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 p-2"
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <div className={`absolute transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 opacity-100' : 'rotate-0 opacity-100'}`}>
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* COMPLETELY NEW Mobile Navigation - No Category Issues */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700 py-3 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent px-2">
              
              {/* ALL Navigation Items as Simple List - No Complex Dropdowns */}
              {/* Simple Mobile Items */}
              {simpleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      onClick={() => {
                        setIsMobileMenuOpen(false); // Always close menu on click
                      }}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer
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

              {/* Convert All Dropdown Items to Simple Mobile Links */}
              {dropdownNavItems.map((dropdown) => {
                return dropdown.items.map((item) => {
                  const ItemIcon = item.icon;
                  const isItemActive = location === item.path;
                  const Icon = dropdown.icon;
                  
                  return (
                    <Link 
                      key={item.path} 
                      href={item.path}
                    >
                      <div
                        onClick={() => {
                          setIsMobileMenuOpen(false); // Always close menu on click
                        }}
                        className={`
                          flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group
                          ${isItemActive 
                            ? 'bg-blue-600/20 text-blue-300 border-l-4 border-l-blue-400' 
                            : 'text-gray-300 hover:text-white hover:bg-slate-700/30'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          {ItemIcon ? (
                            <ItemIcon className={`h-4 w-4 transition-all duration-200 ${
                              isItemActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                            }`} />
                          ) : (
                            <Icon className={`h-4 w-4 opacity-60 transition-all duration-200 ${
                              isItemActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                            }`} />
                          )}
                          <div className="flex-1">
                            <div className="text-sm font-medium">{item.name}</div>
                            <div className={`text-xs opacity-70 bg-gradient-to-r ${dropdown.color} bg-clip-text text-transparent`}>
                              {dropdown.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          →
                        </div>
                      </div>
                    </Link>
                  );
                });
              })}

              {/* Mobile Actions */}
              <div className="border-t border-slate-700/50 pt-4 mt-4">
                <div className="space-y-2">
                  {/* Mobile Chat */}
                  <Link href="/forum">
                    <div
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-between px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Community Chat</span>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                        2
                      </Badge>
                    </div>
                  </Link>

                  {/* Mobile Notifications */}
                  <div className="flex items-center justify-between px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5" />
                      <span className="text-sm font-medium">Notifications</span>
                    </div>
                    {notificationCount > 0 && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs animate-pulse">
                        {notificationCount}
                      </Badge>
                    )}
                  </div>

                  {/* Mobile Profile */}
                  {user && (
                    <div className="px-4 py-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{user.username?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.username}</p>
                          <p className="text-xs text-gray-400">{user.email || 'Premium User'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default StableNavigation;