import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  Bell,
  MessageCircle,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Bot,
  BarChart3,
  Brain,
  Zap,
  Activity,
  Crown,
  Search,
  Home,
  Wallet,
  Shield,
  TrendingUp,
  Database,
  Users,
  HelpCircle,
  FileText,
  Cog,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/UserAuthContext";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  badge?: string;
  category: string;
}

const FuturisticHeader: React.FC = () => {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [notifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Trading Alert",
      message: "WaidBot Pro detected a profitable opportunity",
      timestamp: new Date(),
      type: "success",
      read: false
    },
    {
      id: "2",
      title: "System Update",
      message: "KonsAi mesh network optimized",
      timestamp: new Date(Date.now() - 300000),
      type: "info",
      read: false
    }
  ]);

  const navigationItems: NavItem[] = [
    // Trading Bots
    { path: "/maibot", label: "Maibot", icon: <Bot className="h-4 w-4" />, category: "Bots", badge: "Free", description: "Entry-level AI trader" },
    { path: "/waidbot", label: "WaidBot", icon: <Brain className="h-4 w-4" />, category: "Bots", description: "Advanced AI system" },
    { path: "/waidbot-pro", label: "WaidBot Pro", icon: <Crown className="h-4 w-4" />, category: "Bots", badge: "Pro", description: "Professional suite" },
    { path: "/autonomous-trader", label: "Autonomous Trader", icon: <Zap className="h-4 w-4" />, category: "Bots", description: "Fully autonomous" },
    { path: "/full-engine", label: "Full Engine", icon: <Activity className="h-4 w-4" />, category: "Bots", description: "Complete intelligence" },
    { path: "/waidbot-engine", label: "Bot Engine", icon: <Cog className="h-4 w-4" />, category: "Bots", description: "Management hub" },
    
    // Trading & Analytics
    { path: "/trading", label: "Trading Interface", icon: <TrendingUp className="h-4 w-4" />, category: "Trading", description: "Live dashboard" },
    { path: "/analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" />, category: "Trading", description: "Performance metrics" },
    { path: "/portal", label: "Vision Portal", icon: <Globe className="h-4 w-4" />, category: "Trading", description: "AI insights" },
    
    // Wallet & Finance
    { path: "/wallet", label: "SmaiSika Wallet", icon: <Wallet className="h-4 w-4" />, category: "Finance", description: "Digital wallet" },
    
    // Community & Support
    { path: "/forum", label: "Forum", icon: <Users className="h-4 w-4" />, category: "Community", description: "Discussion board" },
    { path: "/help", label: "Help Center", icon: <HelpCircle className="h-4 w-4" />, category: "Community", description: "Documentation" },
    
    // System & Admin
    { path: "/admin", label: "Admin Panel", icon: <Shield className="h-4 w-4" />, category: "System", description: "System control" },
    { path: "/api-docs", label: "API Docs", icon: <FileText className="h-4 w-4" />, category: "System", description: "Developer tools" },
  ];

  const categories = ["Bots", "Trading", "Finance", "Community", "System"];

  const filteredItems = searchQuery 
    ? navigationItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const unreadCount = notifications.filter(n => !n.read).length;

  const QuickSearch = () => (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 text-white hover:bg-white/10 border border-white/20 hover:border-white/30"
        >
          <Search className="h-4 w-4 xl:mr-2" />
          <span className="hidden xl:inline-flex text-sm text-white/70">Search anything...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 text-[10px] font-medium text-white/70 xl:flex">
            ⌘K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-gray-900/95 border-gray-700 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-white">Quick Navigation</DialogTitle>
          <DialogDescription className="text-gray-400">
            Search and navigate to any page or feature quickly
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search pages, features, or commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            autoFocus
          />
          {searchQuery && (
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {filteredItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer group"
                    onClick={() => setSearchOpen(false)}
                  >
                    <div className="text-blue-400 group-hover:text-blue-300">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-400">{item.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {filteredItems.length === 0 && (
                <div className="p-4 text-center text-gray-400">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  const NotificationPanel = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-gray-900/98 border-gray-700 backdrop-blur-md" align="end">
        <DropdownMenuLabel className="text-blue-300 flex items-center justify-between">
          Notifications
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="p-3 cursor-pointer hover:bg-gray-800/50">
              <div className="space-y-1 w-full">
                <div className="flex items-start justify-between">
                  <span className="font-medium text-white text-sm">{notification.title}</span>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                  )}
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{notification.message}</p>
                <span className="text-xs text-gray-500">
                  {notification.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const ChatSupport = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
          <MessageCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-gray-900/98 border-gray-700 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-white">AI Assistant</DialogTitle>
          <DialogDescription className="text-gray-400">
            Chat with your personal AI trading assistant
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="h-[300px] bg-gray-800/50 rounded-lg p-4 overflow-y-auto">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-700 rounded-lg p-3 max-w-[80%]">
                <p className="text-white text-sm">
                  Hello! I'm your AI trading assistant. How can I help you optimize your trading strategies today?
                </p>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="Ask about trading, bots, or strategies..."
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-white/10 hover:bg-white/20">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-gray-900/98 border-gray-700 backdrop-blur-md" align="end">
        <DropdownMenuLabel className="text-blue-300">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user?.username || 'User'}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem className="hover:bg-gray-800/50 cursor-pointer">
          <Link href="/profile" className="flex items-center space-x-2 w-full">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-gray-800/50 cursor-pointer">
          <Link href="/settings" className="flex items-center space-x-2 w-full">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem 
          className="hover:bg-gray-800/50 cursor-pointer text-red-400 hover:text-red-300"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const CategoryNavigation = () => (
    <nav className="flex items-center justify-center space-x-1">
      {categories.map((category) => {
        const categoryItems = navigationItems.filter(item => item.category === category);
        return (
          <DropdownMenu key={category}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-200"
              >
                {category}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 bg-gray-900/98 border-gray-700 backdrop-blur-md">
              <DropdownMenuLabel className="text-blue-300">{category}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              {categoryItems.map((item) => (
                <DropdownMenuItem key={item.path} className="p-0">
                  <Link href={item.path} className="flex items-center space-x-3 w-full p-3 hover:bg-gray-800/50 rounded-lg">
                    <div className="text-blue-400">{item.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium text-sm">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">{item.badge}</Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                      )}
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </nav>
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, []);

  return (
    <header className="w-full bg-gradient-to-r from-gray-950 via-blue-950 to-purple-950 border-b border-white/10 shadow-2xl">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5 animate-pulse"></div>
      
      <div className="relative container mx-auto px-4">
        {/* Main header row */}
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-300"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-cyan-300 transition-all duration-300">
                  Waides Ki
                </h1>
                <p className="text-xs text-white/50 -mt-1 group-hover:text-white/70 transition-colors">
                  Autonomous AI Trading Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Center - Quick Search */}
          <div className="flex-1 max-w-xl mx-8">
            <QuickSearch />
          </div>

          {/* Right side - User actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NotificationPanel />
                <ChatSupport />
                <UserMenu />
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20 hover:border-white/30">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Navigation row */}
        <div className="border-t border-white/10 py-3">
          <CategoryNavigation />
        </div>
      </div>
    </header>
  );
};

export default FuturisticHeader;