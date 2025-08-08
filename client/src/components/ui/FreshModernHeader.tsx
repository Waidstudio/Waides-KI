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
  Home,
  Bot,
  BarChart3,
  Wallet,
  Users,
  Shield,
  Brain,
  Zap,
  TrendingUp,
  Activity,
  Crown,
  Sparkles,
  Target,
  Globe,
  Cog
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/UserAuthContext";

interface NavigationCategory {
  label: string;
  icon: React.ReactNode;
  items: { path: string; label: string; description?: string; }[];
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
}

const FreshModernHeader = () => {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Trading Signal",
      message: "New high-probability ETH signal detected",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: "success",
      read: false,
    },
    {
      id: "2",
      title: "System Update",
      message: "KonsAi mesh network optimization complete",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: "info",
      read: false,
    },
    {
      id: "3",
      title: "Portfolio Alert",
      message: "Portfolio rebalancing recommended",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: "warning",
      read: true,
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Navigation categories with all application pages organized
  const navigationCategories: NavigationCategory[] = [
    {
      label: "Core Trading",
      icon: <TrendingUp className="h-4 w-4" />,
      items: [
        { path: "/portal", label: "Vision Portal", description: "Main trading interface" },
        { path: "/trading", label: "Trading Interface", description: "Advanced trading tools" },
        { path: "/waidbot-engine", label: "Waidbot Engine", description: "6 trading entities hub" },
        { path: "/live-data", label: "Live Data", description: "Real-time market data" },
        { path: "/dashboard", label: "Dashboard", description: "Trading overview" }
      ]
    },
    {
      label: "AI Systems",
      icon: <Brain className="h-4 w-4" />,
      items: [
        { path: "/ai-systems", label: "AI Systems", description: "AI trading management" },
        { path: "/maibot", label: "Maibot (Free)", description: "Entry-level bot" },
        { path: "/waidbot", label: "WaidBot", description: "Standard trading bot" },
        { path: "/waidbot-pro", label: "WaidBot Pro", description: "Professional bot" },
        { path: "/bot-dashboard", label: "Bot Dashboard", description: "Unified bot control" },
        { path: "/enhanced-waidbot", label: "Enhanced WaidBot", description: "Advanced bot features" }
      ]
    },
    {
      label: "Advanced AI",
      icon: <Sparkles className="h-4 w-4" />,
      items: [
        { path: "/autonomous-trader", label: "Autonomous Trader", description: "Fully automated trading" },
        { path: "/full-engine", label: "Full Engine", description: "Complete AI system" },
        { path: "/strategy-autogen", label: "Strategy Autogen", description: "AI strategy generation" },
        { path: "/kons-powa", label: "KonsPowa Engine", description: "Divine AI core" },
        { path: "/voice-command", label: "Voice Command", description: "Voice-controlled trading" }
      ]
    },
    {
      label: "Spiritual Systems",
      icon: <Crown className="h-4 w-4" />,
      items: [
        { path: "/dream-vision", label: "Dream Vision", description: "Spiritual trading insights" },
        { path: "/vision-spirit", label: "Vision Spirit", description: "Divine market guidance" },
        { path: "/spiritual-recall", label: "Spiritual Recall", description: "Market memory system" },
        { path: "/seasonal-rebirth", label: "Seasonal Rebirth", description: "Cyclical trading wisdom" },
        { path: "/sigil-layer", label: "Sigil Layer", description: "Metaphysical signals" },
        { path: "/shadow-defense", label: "Shadow Defense", description: "Risk protection" },
        { path: "/reincarnation", label: "Reincarnation", description: "Strategy evolution" },
        { path: "/eth-empath-guardian", label: "ETH Guardian", description: "Ethereum-focused AI" },
        { path: "/meta-guardian", label: "Meta-Guardian", description: "Multi-layer protection" }
      ]
    },
    {
      label: "Financial",
      icon: <Wallet className="h-4 w-4" />,
      items: [
        { path: "/wallet", label: "Wallet", description: "Portfolio management" },
        { path: "/smai-wallet", label: "SmaiSika Wallet", description: "Advanced wallet features" },
        { path: "/enhanced-wallet", label: "Enhanced Wallet", description: "Professional wallet tools" }
      ]
    },
    {
      label: "Analytics & Tools",
      icon: <BarChart3 className="h-4 w-4" />,
      items: [
        { path: "/ml-lifecycle", label: "ML Lifecycle", description: "Machine learning management" },
        { path: "/risk-backtesting", label: "Risk Backtesting", description: "Strategy testing" },
        { path: "/market-storytelling", label: "Market Stories", description: "Interactive market analysis" },
        { path: "/system-validation", label: "System Validation", description: "System health check" }
      ]
    },
    {
      label: "Community & Learning",
      icon: <Users className="h-4 w-4" />,
      items: [
        { path: "/forum", label: "Cosmic Forum", description: "Community discussions" },
        { path: "/community-forum", label: "Community Forum", description: "Advanced forum features" },
        { path: "/learning", label: "Trading Academy", description: "Educational resources" },
        { path: "/support", label: "Support", description: "Help and assistance" }
      ]
    },
    {
      label: "Administration",
      icon: <Shield className="h-4 w-4" />,
      items: [
        { path: "/admin", label: "Admin Panel", description: "System administration" },
        { path: "/admin-panel", label: "Admin Dashboard", description: "Advanced admin tools" },
        { path: "/expanded-config", label: "Expanded Config", description: "System configuration" },
        { path: "/config", label: "Configuration", description: "Basic settings" },
        { path: "/api-docs", label: "API Docs", description: "API documentation" },
        { path: "/gateway", label: "Gateway", description: "System gateway" },
        { path: "/admin-exchange-pool", label: "Exchange Pool", description: "Exchange management" },
        { path: "/payment-gateway-admin", label: "Payment Admin", description: "Payment management" },
        { path: "/sms-config", label: "SMS Config", description: "SMS configuration" }
      ]
    }
  ];

  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const handleDropdownTouchStart = (label: string) => {
    // For touch devices, handle immediate response
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const handleDropdownMouseEnter = (label: string) => {
    // For desktop, show on hover but with slight delay for UX
    setTimeout(() => {
      if (window.innerWidth >= 768) { // Only on desktop
        setActiveDropdown(label);
      }
    }, 100);
  };

  const handleDropdownMouseLeave = () => {
    // For desktop, hide with delay to allow mouse movement to dropdown
    setTimeout(() => {
      if (window.innerWidth >= 768) {
        setActiveDropdown(null);
      }
    }, 200);
  };

  const handleNotificationClick = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Enhanced event handling for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveDropdown(null);
    };

    const handleTouchOutside = (event: TouchEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    const handleScroll = () => {
      setActiveDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleTouchOutside);
    document.addEventListener('keydown', handleEscapeKey);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Chat Support Component
  const ChatSupport = () => (
    <Button 
      variant="ghost" 
      size="sm" 
      className="relative text-gray-300 hover:text-blue-400 hover:bg-blue-900/20 transition-all duration-200"
      onClick={() => {
        // Navigate to chat or open chat interface
        window.location.href = '/chat';
      }}
    >
      <MessageCircle className="h-5 w-5" />
      <span className="sr-only">Chat Support</span>
    </Button>
  );

  // Enhanced Notifications Component
  const NotificationsDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative text-gray-300 hover:text-blue-400 hover:bg-blue-900/20 transition-all duration-200">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-gray-900/98 border-gray-700 backdrop-blur-md">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-blue-300">Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs text-gray-400 hover:text-white"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={cn(
                  "flex flex-col items-start p-3 cursor-pointer hover:bg-blue-900/20",
                  !notification.read && "bg-blue-900/10 border-l-2 border-l-blue-500"
                )}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex w-full items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-white">{notification.title}</p>
                    <p className="text-xs text-gray-300 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // User Menu Component
  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative text-gray-300 hover:text-blue-400 hover:bg-blue-900/20 transition-all duration-200">
          <Avatar className="h-6 w-6">
            <AvatarImage src={""} alt={user?.email || 'User'} />
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="ml-2 hidden sm:inline-block text-sm">
            {user?.email?.split('@')[0] || 'User'}
          </span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-gray-900/98 border-gray-700 backdrop-blur-md">
        <DropdownMenuLabel className="text-blue-300">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center w-full cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile-settings" className="flex items-center w-full cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={logout}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Interactive Dropdown Component with Enhanced Touch Support
  const InteractiveDropdown = ({ category }: { category: NavigationCategory }) => (
    <div 
      className="relative dropdown-container"
      onMouseEnter={() => handleDropdownMouseEnter(category.label)}
      onMouseLeave={handleDropdownMouseLeave}
    >
      <Button 
        variant="ghost" 
        className={cn(
          "flex items-center space-x-2 text-white hover:text-blue-300 transition-all duration-200 px-4 py-2 rounded-lg hover:bg-blue-900/20 touch-manipulation select-none",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-900",
          "active:bg-blue-900/40 active:scale-95 transform",
          activeDropdown === category.label && "text-blue-300 bg-blue-900/30 shadow-lg ring-2 ring-blue-500/30"
        )}
        onClick={(e) => {
          e.stopPropagation();
          handleDropdownToggle(category.label);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          handleDropdownTouchStart(category.label);
        }}
        onTouchEnd={(e) => {
          e.preventDefault(); // Prevent double-tap zoom
        }}
        aria-expanded={activeDropdown === category.label}
        aria-haspopup="true"
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center space-x-2">
          {category.icon}
          <span className="font-medium text-sm sm:text-base">{category.label}</span>
          <ChevronDown className={cn(
            "h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 ease-in-out",
            activeDropdown === category.label && "rotate-180"
          )} />
        </div>
      </Button>
      
      {/* Enhanced Touch-Friendly Dropdown Content */}
      <div 
        className={cn(
          "absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-80 sm:w-96 bg-gray-900/98 border border-gray-600 rounded-2xl shadow-2xl backdrop-blur-md z-50 transition-all duration-300 ease-out max-h-[80vh] overflow-y-auto",
          activeDropdown === category.label 
            ? "opacity-100 visible translate-y-0 scale-100" 
            : "opacity-0 invisible -translate-y-3 scale-95 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="p-3 sm:p-4">
          <div className="grid gap-1 sm:gap-2">
            {category.items.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setActiveDropdown(null)}
                onTouchEnd={() => setActiveDropdown(null)}
                className={cn(
                  "flex flex-col p-3 sm:p-4 rounded-lg transition-all duration-200 hover:bg-blue-900/20 active:bg-blue-900/30 group touch-manipulation",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-blue-900/20",
                  "min-h-[3rem] sm:min-h-[3.5rem] flex justify-center", // Touch-friendly minimum height
                  location === item.path && "bg-blue-900/30 border border-blue-500/50 ring-1 ring-blue-500/30"
                )}
                role="menuitem"
                tabIndex={0}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1">
                    <span className="font-medium text-white group-hover:text-blue-300 group-focus:text-blue-300 transition-colors text-sm sm:text-base">
                      {item.label}
                    </span>
                    {item.description && (
                      <span className="text-xs text-gray-400 mt-1 group-hover:text-gray-300 group-focus:text-gray-300 block">
                        {item.description}
                      </span>
                    )}
                  </div>
                  {location === item.path && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Touch-friendly close indicator */}
        <div className="flex justify-center py-2 border-t border-gray-700/50 md:hidden">
          <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );

  return (
    <header className="w-full bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 border-b border-gray-700/50 shadow-lg">
      <div className="container mx-auto px-4">
        {/* Main Header Row */}
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo and Brand */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                  Waides Ki
                </span>
                <p className="text-xs text-gray-400 -mt-1">Autonomous AI Trading</p>
              </div>
            </Link>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <ChatSupport />
                <NotificationsDropdown />
                <UserMenu />
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:text-blue-300 border border-gray-600 hover:border-blue-500">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 shadow-lg">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-white hover:text-blue-300">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80 bg-gray-900/95 border-gray-700 backdrop-blur-sm">
                <SheetHeader>
                  <SheetTitle className="text-blue-300 text-left">Navigation</SheetTitle>
                </SheetHeader>
                <div className="mt-8 space-y-4">
                  {navigationCategories.map((category) => (
                    <div key={category.label} className="space-y-2">
                      <div className="flex items-center space-x-2 text-lg font-semibold text-blue-300 px-3 py-2">
                        {category.icon}
                        <span>{category.label}</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        {category.items.map((item) => (
                          <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            onTouchEnd={() => setMobileMenuOpen(false)}
                            className={cn(
                              "block px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-800/30 active:bg-gray-700/40 rounded-lg transition-all duration-200 touch-manipulation",
                              "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-gray-800/30",
                              "min-h-[2.75rem] flex items-center", // Touch-friendly height
                              location === item.path && "text-blue-300 bg-blue-900/20 ring-1 ring-blue-500/30"
                            )}
                            role="menuitem"
                            tabIndex={0}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-sm">{item.label}</span>
                              {location === item.path && (
                                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Navigation Bar - Second Row */}
        {isAuthenticated && (
          <div className="border-t border-gray-700/30">
            <nav className="hidden md:flex items-center justify-center space-x-6 py-4">
              {navigationCategories.map((category) => (
                <InteractiveDropdown key={category.label} category={category} />
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default FreshModernHeader;