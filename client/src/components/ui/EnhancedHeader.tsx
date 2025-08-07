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
  Activity,
  User,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Bot,
  BarChart3,
  Shield,
  Zap,
  Eye,
  MessageSquare,
  HelpCircle,
  Globe,
  Database,
  Terminal,
  Target,
  Layers,
  GitBranch,
  Monitor
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { NotificationBell } from '../NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './dropdown-menu';
import { Input } from './input';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

const EnhancedHeader = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Navigation categories with organized items
  const navigationCategories = {
    trading: {
      name: 'Trading',
      icon: TrendingUp,
      items: [
        { name: 'Vision Portal', path: '/portal', icon: Eye, description: 'Advanced trading interface' },
        { name: 'Trading Interface', path: '/trading', icon: Target, description: 'Direct trading controls' },
        { name: 'WaidBot Engine', path: '/waidbot-engine', icon: Bot, description: 'AI trading bots' },
        { name: 'Bot Dashboard', path: '/bot-dashboard', icon: Monitor, description: 'Bot management' },
        { name: 'Maibot (Free)', path: '/maibot', icon: Bot, description: 'Free tier bot' },
        { name: 'WaidBot Pro', path: '/waidbot-pro', icon: Bot, description: 'Premium bot' },
        { name: 'Live Data', path: '/live-data', icon: Activity, description: 'Real-time market data' },
      ]
    },
    ai: {
      name: 'AI Systems',
      icon: Brain,
      items: [
        { name: 'AI Systems', path: '/ai-systems', icon: Brain, description: 'AI engine overview' },
        { name: 'KonsPowa Engine', path: '/kons-powa', icon: Zap, description: 'Spiritual AI engine' },
        { name: 'Autonomous Trader', path: '/autonomous-trader', icon: Bot, description: 'Fully automated trading' },
        { name: 'Full Engine', path: '/full-engine', icon: Layers, description: 'Complete AI system' },
        { name: 'System Validation', path: '/system-validation', icon: Shield, description: 'System health check' },
        { name: 'Strategy Autogen', path: '/strategy-autogen', icon: GitBranch, description: 'Auto strategy creation' },
      ]
    },
    platform: {
      name: 'Platform',
      icon: Globe,
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: Home, description: 'Main dashboard' },
        { name: 'Wallet', path: '/wallet', icon: Wallet, description: 'Financial management' },
        { name: 'Forum', path: '/forum', icon: Users, description: 'Community discussions' },
        { name: 'Learning', path: '/learning', icon: BookOpen, description: 'Trading academy' },
        { name: 'Market Stories', path: '/market-storytelling', icon: MessageSquare, description: 'AI market insights' },
        { name: 'Support', path: '/support', icon: HelpCircle, description: 'Help & assistance' },
      ]
    },
    admin: {
      name: 'Admin',
      icon: Settings,
      items: [
        { name: 'Admin Panel', path: '/admin-panel', icon: Settings, description: 'System administration' },
        { name: 'Configuration', path: '/config', icon: Settings, description: 'System settings' },
        { name: 'API Docs', path: '/api-docs', icon: Database, description: 'API documentation' },
        { name: 'Gateway', path: '/gateway', icon: Globe, description: 'Payment gateways' },
        { name: 'Voice Command', path: '/voice-command', icon: Terminal, description: 'Voice controls' },
      ]
    }
  };

  // Mock user data - in real app, this would come from auth context
  const currentUser = {
    name: 'Nwaora Chigozie',
    email: 'nwaora@waidesai.com',
    avatar: '/api/placeholder/32/32',
    role: 'Cosmic Intelligence Trader',
    status: 'online'
  };

  const handleLogout = () => {
    // In real app, this would call logout API
    window.location.href = '/api/logout';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or perform search
      console.log('Searching for:', searchQuery);
    }
  };

  const closeDropdowns = () => {
    setOpenDropdown(null);
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard">
              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative">
                  <Brain className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <TrendingUp className="h-4 w-4 text-emerald-400 absolute -top-1 -right-1" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                    Waides KI
                  </h1>
                  <p className="text-xs text-slate-400 -mt-1">AI Trading Platform</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation with Category Dropdowns */}
          <div className="hidden lg:flex items-center space-x-1">
            <nav className="flex items-center space-x-1">
              {Object.entries(navigationCategories).map(([key, category]) => {
                const CategoryIcon = category.icon;
                const isOpen = openDropdown === key;
                
                return (
                  <DropdownMenu key={key} open={isOpen} onOpenChange={(open) => setOpenDropdown(open ? key : null)}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-800/50 px-3 py-2 rounded-lg transition-all duration-200"
                      >
                        <CategoryIcon className="h-4 w-4" />
                        <span className="font-medium">{category.name}</span>
                        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 bg-slate-800/95 backdrop-blur-md border-slate-700" align="start">
                      <DropdownMenuLabel className="text-slate-300 font-semibold px-4 py-2">
                        {category.name} Tools
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <div className="grid gap-1 p-2">
                        {category.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = location === item.path;
                          
                          return (
                            <Link key={item.path} href={item.path}>
                              <DropdownMenuItem 
                                className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                  isActive 
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                                    : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                                }`}
                                onClick={closeDropdowns}
                              >
                                <ItemIcon className={`h-4 w-4 mt-0.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{item.name}</div>
                                  <div className="text-xs text-slate-400 truncate">{item.description}</div>
                                </div>
                              </DropdownMenuItem>
                            </Link>
                          );
                        })}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}
            </nav>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-6">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search trading tools, bots, or features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </form>
          </div>

          {/* Right Side - Notifications and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="hidden sm:block">
              <NotificationBell />
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-2 py-1 hover:bg-slate-800/50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-medium text-slate-200">{currentUser.name}</div>
                    <div className="text-xs text-slate-400">{currentUser.role}</div>
                  </div>
                  <ChevronDown className="h-3 w-3 text-slate-400 hidden lg:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-slate-800/95 backdrop-blur-md border-slate-700" align="end">
                <DropdownMenuLabel className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {currentUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-slate-200">{currentUser.name}</div>
                      <div className="text-sm text-slate-400">{currentUser.email}</div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                        {currentUser.status}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700/50 cursor-pointer">
                  <User className="mr-3 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700/50 cursor-pointer">
                  <Settings className="mr-3 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700/50 cursor-pointer">
                  <Activity className="mr-3 h-4 w-4" />
                  Trading Activity
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-slate-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-700 bg-slate-900/98 backdrop-blur-md">
            <div className="px-4 py-6 space-y-6">
              {/* Mobile Search */}
              <div className="md:hidden">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border-slate-600 text-slate-200 placeholder-slate-400"
                    />
                  </div>
                </form>
              </div>

              {/* Mobile Navigation Categories */}
              {Object.entries(navigationCategories).map(([key, category]) => {
                const CategoryIcon = category.icon;
                
                return (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center space-x-2 text-slate-300 font-semibold">
                      <CategoryIcon className="h-5 w-5" />
                      <span>{category.name}</span>
                    </div>
                    <div className="grid gap-2 pl-7">
                      {category.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = location === item.path;
                        
                        return (
                          <Link key={item.path} href={item.path}>
                            <div
                              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                                isActive 
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                              }`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <ItemIcon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-slate-400">{item.description}</div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Mobile Notifications */}
              <div className="sm:hidden pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Notifications</span>
                  <NotificationBell />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default EnhancedHeader;