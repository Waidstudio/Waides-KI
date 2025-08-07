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
  Wallet,
  Users,
  Shield,
  Brain,
  Zap,
  TrendingUp,
  Database,
  Activity,
  Crown,
  Home,
  ChevronRight,
  ArrowLeft,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/UserAuthContext";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
}

interface NavigationCategory {
  label: string;
  icon: React.ReactNode;
  items: {
    path: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

const ModernNavigationHeader: React.FC = () => {
  const [location] = useLocation();
  const { user, logout, isAuthenticated, token, isLoading } = useAuth();
  

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Navigation categories with organized menu structure
  const navigationCategories: NavigationCategory[] = [
    {
      label: "Trading Bots",
      icon: <Bot className="h-4 w-4" />,
      items: [
        {
          path: "/maibot",
          label: "Maibot",
          description: "Free entry-level trading bot",
          icon: <Bot className="h-4 w-4" />,
          badge: "Free"
        },
        {
          path: "/waidbot",
          label: "WaidBot",
          description: "Advanced AI trading system",
          icon: <Brain className="h-4 w-4" />
        },
        {
          path: "/waidbot-pro",
          label: "WaidBot Pro",
          description: "Professional trading suite",
          icon: <Crown className="h-4 w-4" />,
          badge: "Pro"
        },
        {
          path: "/autonomous-trader",
          label: "Autonomous Trader",
          description: "Fully autonomous trading engine",
          icon: <Zap className="h-4 w-4" />
        },
        {
          path: "/full-engine",
          label: "Full Engine",
          description: "Complete trading intelligence",
          icon: <Activity className="h-4 w-4" />
        },
        {
          path: "/waidbot-engine",
          label: "Bot Engine",
          description: "Central bot management hub",
          icon: <Settings className="h-4 w-4" />
        }
      ]
    },
    {
      label: "Analytics & Trading",
      icon: <BarChart3 className="h-4 w-4" />,
      items: [
        {
          path: "/trading",
          label: "Trading Interface",
          description: "Live trading dashboard",
          icon: <TrendingUp className="h-4 w-4" />
        },
        {
          path: "/dashboard",
          label: "Dashboard",
          description: "Overview and metrics",
          icon: <BarChart3 className="h-4 w-4" />
        },
        {
          path: "/live-data",
          label: "Live Data",
          description: "Real-time market data",
          icon: <Database className="h-4 w-4" />
        },
        {
          path: "/market-storytelling",
          label: "Market Stories",
          description: "Interactive trend analysis",
          icon: <Activity className="h-4 w-4" />
        },
        {
          path: "/risk-backtesting",
          label: "Risk Backtesting",
          description: "Strategy validation tools",
          icon: <Shield className="h-4 w-4" />
        }
      ]
    },
    {
      label: "AI & Intelligence",
      icon: <Brain className="h-4 w-4" />,
      items: [
        {
          path: "/ai-systems",
          label: "AI Systems",
          description: "Intelligence management",
          icon: <Brain className="h-4 w-4" />
        },
        {
          path: "/portal",
          label: "Vision Portal",
          description: "AI consciousness interface",
          icon: <Zap className="h-4 w-4" />
        },
        {
          path: "/kons-powa",
          label: "KonsPowa Engine",
          description: "Spiritual AI system",
          icon: <Crown className="h-4 w-4" />
        },
        {
          path: "/strategy-autogen",
          label: "Strategy Generator",
          description: "AI strategy creation",
          icon: <Settings className="h-4 w-4" />
        },
        {
          path: "/voice-command",
          label: "Voice Command",
          description: "Voice-controlled interface",
          icon: <MessageCircle className="h-4 w-4" />
        }
      ]
    },
    {
      label: "Wallet & Finance",
      icon: <Wallet className="h-4 w-4" />,
      items: [
        {
          path: "/wallet",
          label: "SmaiSika Wallet",
          description: "Digital asset management",
          icon: <Wallet className="h-4 w-4" />
        },
        {
          path: "/professional-wallet",
          label: "Professional Wallet",
          description: "Advanced wallet features",
          icon: <Crown className="h-4 w-4" />
        },
        {
          path: "/enhanced-wallet",
          label: "Enhanced Wallet",
          description: "Premium wallet suite",
          icon: <Shield className="h-4 w-4" />
        }
      ]
    },
    {
      label: "Community & Learning",
      icon: <Users className="h-4 w-4" />,
      items: [
        {
          path: "/forum",
          label: "Cosmic Forum",
          description: "Community discussions",
          icon: <Users className="h-4 w-4" />
        },
        {
          path: "/learning",
          label: "Trading Academy",
          description: "Educational resources",
          icon: <Brain className="h-4 w-4" />
        },
        {
          path: "/support",
          label: "Support Center",
          description: "Help and documentation",
          icon: <MessageCircle className="h-4 w-4" />
        }
      ]
    }
  ];

  // Load notifications on component mount
  useEffect(() => {
    const mockNotifications: NotificationItem[] = [
      {
        id: "1",
        title: "Trading Alert",
        message: "WaidBot Pro completed successful trade on ETH/USDT",
        timestamp: new Date(Date.now() - 300000),
        type: "success",
        read: false
      },
      {
        id: "2",
        title: "System Update",
        message: "KonsAi intelligence engine has been upgraded",
        timestamp: new Date(Date.now() - 600000),
        type: "info",
        read: false
      },
      {
        id: "3",
        title: "Risk Warning",
        message: "High volatility detected in current market conditions",
        timestamp: new Date(Date.now() - 900000),
        type: "warning",
        read: true
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Handle dropdown toggle with click
  const handleDropdownToggle = (categoryLabel: string) => {
    setActiveDropdown(activeDropdown === categoryLabel ? null : categoryLabel);
  };

  // Close dropdown when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [activeDropdown]);

  const InteractiveDropdown = ({ category }: { category: NavigationCategory }) => (
    <div className="relative dropdown-container">
      <Button 
        variant="ghost" 
        className={cn(
          "flex items-center space-x-2 text-white hover:text-blue-300 transition-all duration-200 px-4 py-2 rounded-lg hover:bg-blue-900/20",
          activeDropdown === category.label && "text-blue-300 bg-blue-900/30 shadow-lg"
        )}
        onClick={() => handleDropdownToggle(category.label)}
      >
        <div className="flex items-center space-x-2">
          {category.icon}
          <span className="font-medium">{category.label}</span>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform duration-300",
            activeDropdown === category.label && "rotate-180"
          )} />
        </div>
      </Button>
      
      {/* Enhanced Dropdown Content */}
      <div className={cn(
        "absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-96 bg-gray-900/98 border border-gray-600 rounded-2xl shadow-2xl backdrop-blur-md z-50 transition-all duration-300 ease-out",
        activeDropdown === category.label 
          ? "opacity-100 visible translate-y-0 scale-100" 
          : "opacity-0 invisible -translate-y-3 scale-95 pointer-events-none"
      )}>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            {category.icon}
            <h3 className="text-blue-300 font-semibold text-lg">{category.label}</h3>
          </div>
          <div className="space-y-2">
            {category.items.map((item, index) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-800/50 group",
                  "animate-in slide-in-from-left-2 fade-in-0"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setActiveDropdown(null)}
              >
                <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-400 transition-colors">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium group-hover:text-blue-300 transition-colors truncate">
                      {item.label}
                    </span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs bg-blue-900/50 text-blue-300 border-blue-700">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const NotificationsDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative text-white hover:text-blue-300">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 bg-gray-900/95 border-gray-700 backdrop-blur-sm" align="end">
        <DropdownMenuLabel className="flex items-center justify-between text-blue-300">
          Notifications
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllNotificationsRead}
              className="text-xs text-gray-400 hover:text-white"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="hover:bg-gray-800/50 cursor-pointer p-4"
            >
              <div className="flex items-start space-x-3 w-full">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-2",
                  !notification.read && "bg-blue-500",
                  notification.read && "bg-gray-500"
                )} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className={cn(
                      "text-sm font-medium",
                      !notification.read ? "text-white" : "text-gray-300"
                    )}>
                      {notification.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        notification.type === "success" && "border-green-500 text-green-400",
                        notification.type === "warning" && "border-yellow-500 text-yellow-400",
                        notification.type === "error" && "border-red-500 text-red-400",
                        notification.type === "info" && "border-blue-500 text-blue-400"
                      )}
                    >
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const ChatSupport = () => (
    <Sheet open={chatOpen} onOpenChange={setChatOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white hover:text-blue-300">
          <MessageCircle className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-96 bg-gray-900/95 border-gray-700 backdrop-blur-sm">
        <SheetHeader>
          <SheetTitle className="text-blue-300">Support Chat</SheetTitle>
          <SheetDescription className="text-gray-400">
            Connect with our admin team for assistance
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col h-full mt-6">
          <div className="flex-1 bg-gray-800/50 rounded-lg p-4 mb-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-600 text-white">A</AvatarFallback>
                </Avatar>
                <div className="bg-gray-700 rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-white">
                    Hello! How can our admin team help you today?
                  </p>
                  <span className="text-xs text-gray-400 mt-1">Admin • just now</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">
              Send
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-white hover:text-blue-300">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-600 text-white">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block">{user?.username || 'User'}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-gray-900/95 border-gray-700 backdrop-blur-sm" align="end">
        <DropdownMenuLabel className="text-blue-300">
          My Account
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
          className="hover:bg-gray-800/50 cursor-pointer text-red-400"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="w-full bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 border-b border-gray-700/50 shadow-lg">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
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
                <NotificationsDropdown />
                <ChatSupport />
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
                <div className="mt-8 space-y-6">
                  {navigationCategories.map((category) => (
                    <div key={category.label} className="space-y-3">
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full justify-start text-lg font-semibold text-white hover:text-blue-300 hover:bg-gray-800/30 p-3 h-auto transition-all duration-200",
                          activeDropdown === `mobile-${category.label}` && "text-blue-300 bg-blue-900/20"
                        )}
                        onClick={() => handleDropdownToggle(`mobile-${category.label}`)}
                      >
                        <div className="flex items-center space-x-2 w-full">
                          {category.icon}
                          <span className="flex-1 text-left">{category.label}</span>
                          <ChevronDown className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            activeDropdown === `mobile-${category.label}` && "rotate-180"
                          )} />
                        </div>
                      </Button>
                      
                      <div className={cn(
                        "pl-6 space-y-2 transition-all duration-300 ease-in-out overflow-hidden",
                        activeDropdown === `mobile-${category.label}` 
                          ? "max-h-96 opacity-100" 
                          : "max-h-0 opacity-0"
                      )}>
                        {category.items.map((item, index) => (
                          <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setActiveDropdown(null);
                            }}
                            className={cn(
                              "block animate-in slide-in-from-left-2 fade-in-0"
                            )}
                            style={{ animationDelay: `${index * 75}ms` }}
                          >
                            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-all duration-200 group">
                              <div className="text-gray-400 group-hover:text-blue-400 transition-colors">
                                {item.icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-white group-hover:text-blue-300 transition-colors">{item.label}</span>
                                  {item.badge && (
                                    <Badge variant="secondary" className="text-xs bg-blue-900/50 text-blue-300 border-blue-700">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors mt-1">{item.description}</p>
                              </div>
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
        <div className="border-t border-gray-700/30">
          <div className="flex items-center justify-between py-3">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-400 hover:text-blue-300 transition-colors">
                <Home className="h-4 w-4" />
              </Link>
              {location !== '/' && (
                <>
                  <ChevronRight className="h-3 w-3 text-gray-500" />
                  <span className="text-blue-300 font-medium capitalize">
                    {location.substring(1).replace('-', ' ')}
                  </span>
                </>
              )}
              {location !== '/' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.history.back()}
                  className="ml-4 text-gray-400 hover:text-white text-xs border border-gray-600 hover:border-blue-500"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Back
                </Button>
              )}
            </div>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationCategories.map((category) => (
                <InteractiveDropdown key={category.label} category={category} />
              ))}
            </nav>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-blue-300 text-xs"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ModernNavigationHeader;