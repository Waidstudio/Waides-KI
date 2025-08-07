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
  HelpCircle
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

  // Enhanced navigation items with categories
  const mainNavigationItems = [
    { name: 'Home', path: '/', icon: Home, category: 'main' },
    { name: 'Trading Portal', path: '/portal', icon: TrendingUp, category: 'main' },
    { name: 'WaidBot Engine', path: '/waidbot-engine', icon: Bot, category: 'main' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, category: 'main' },
  ];

  const secondaryNavigationItems = [
    { name: 'Wallet', path: '/wallet', icon: Wallet, category: 'secondary' },
    { name: 'Forum', path: '/forum', icon: Users, category: 'secondary' },
    { name: 'Academy', path: '/learning', icon: BookOpen, category: 'secondary' },
    { name: 'Vision Portal', path: '/vision-portal', icon: Eye, category: 'secondary' },
  ];

  const toolsNavigationItems = [
    { name: 'Security', path: '/security', icon: Shield, category: 'tools' },
    { name: 'KonsPowa', path: '/kons-powa', icon: Zap, category: 'tools' },
    { name: 'Chat Oracle', path: '/chat', icon: MessageSquare, category: 'tools' },
    { name: 'Support', path: '/support', icon: HelpCircle, category: 'tools' },
  ];

  const allNavigationItems = [...mainNavigationItems, ...secondaryNavigationItems, ...toolsNavigationItems];

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

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative">
                  <Brain className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <TrendingUp className="h-4 w-4 text-emerald-400 absolute -top-1 -right-1" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                    Waides KI
                  </h1>
                  <p className="text-xs text-slate-400 hidden sm:block -mt-1">AI Trading Platform</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Main Navigation */}
            <nav className="flex items-center space-x-1">
              {mainNavigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`
                        flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer
                        ${isActive 
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-md' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* More Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                  More
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Secondary Pages</DropdownMenuLabel>
                {secondaryNavigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link href={item.path}>
                        <Icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Tools & Support</DropdownMenuLabel>
                {toolsNavigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link href={item.path}>
                        <Icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search trading signals, bots, analytics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* System Status */}
            <Badge variant="outline" className="hidden sm:flex bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Badge>

            {/* Notifications */}
            <NotificationBell />

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-700/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-slate-400">{currentUser.role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {currentUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{currentUser.name}</p>
                      <p className="text-sm text-slate-500">{currentUser.email}</p>
                      <p className="text-xs text-emerald-400">{currentUser.role}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wallet">
                    <Wallet className="h-4 w-4 mr-2" />
                    Wallet & Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/security">
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-300 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-700 py-4">
            {/* Mobile Search */}
            <div className="mb-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-600 text-slate-200 placeholder-slate-400"
                />
              </form>
            </div>

            {/* Mobile Navigation Items */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main</div>
              {mainNavigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`
                        flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer
                        ${isActive 
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
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

              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-4 mb-2">Tools</div>
              {[...secondaryNavigationItems, ...toolsNavigationItems].map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`
                        flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer
                        ${isActive 
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
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

            {/* Mobile User Actions */}
            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-200">{currentUser.name}</p>
                  <p className="text-sm text-slate-400">{currentUser.role}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Link href="/profile">
                  <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50">
                    <User className="h-5 w-5" />
                    <span>Profile Settings</span>
                  </div>
                </Link>
                <div 
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Log Out</span>
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