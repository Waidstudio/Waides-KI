import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  Search,
  Bell,
  User,
  TrendingUp,
  Wallet,
  Brain,
  Settings,
  LogOut,
  Activity,
  Wifi,
  WifiOff,
  ChevronDown,
  Home,
  Bot,
  BarChart3,
  Zap,
  Shield,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useEthPrice, useSystemAlerts, useBotStatuses } from "@/hooks/useKonsMesh";

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  description?: string;
  children?: NavigationItem[];
}

export default function UnifiedHeader() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // KonsMesh real-time data
  const ethPrice = useEthPrice();
  const systemAlerts = useSystemAlerts();
  const botStatuses = useBotStatuses();

  // Navigation structure
  const navigation: NavigationItem[] = [
    {
      name: "Dashboard",
      path: "/",
      icon: Home,
      description: "Overview and analytics"
    },
    {
      name: "Trading",
      path: "/trading",
      icon: TrendingUp,
      description: "Trading tools and bots",
      children: [
        { name: "Trading Interface", path: "/trading", icon: BarChart3, description: "Manual trading" },
        { name: "WaidBot (Free)", path: "/waidbot", icon: Bot, description: "AI trading assistant" },
        { name: "WaidBot Pro", path: "/waidbot-pro", icon: Bot, description: "Advanced AI trading" },
        { name: "Bot Dashboard", path: "/bot-dashboard", icon: Activity, description: "Manage all bots" },
      ]
    },
    {
      name: "Wallet",
      path: "/wallet",
      icon: Wallet,
      description: "Manage your assets"
    },
    {
      name: "AI Systems",
      path: "/ai-systems",
      icon: Brain,
      description: "AI and automation",
      children: [
        { name: "KonsPowa Engine", path: "/kons-powa", icon: Zap, description: "Spiritual AI engine" },
        { name: "Autonomous Trader", path: "/autonomous-trader", icon: Shield, description: "Fully automated trading" },
      ]
    }
  ];

  // Format ETH price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format price change percentage
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  // Get connection status info
  const getConnectionStatus = () => {
    if (ethPrice.isConnected) {
      return {
        icon: <Wifi className="w-3 h-3 text-green-500" />,
        text: "Live",
        color: "text-green-500"
      };
    }
    return {
      icon: <WifiOff className="w-3 h-3 text-red-500" />,
      text: "Offline", 
      color: "text-red-500"
    };
  };

  const connectionStatus = getConnectionStatus();

  // Mobile menu close handler
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Mobile menu button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 sm:max-w-xs">
            <SheetHeader>
              <SheetTitle className="text-left">
                <Link href="/" onClick={closeMobileMenu}>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                    Waides KI
                  </span>
                </Link>
              </SheetTitle>
            </SheetHeader>

            {/* Mobile KonsMesh Status */}
            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {connectionStatus.icon}
                  <span className={`text-sm font-medium ${connectionStatus.color}`}>
                    KonsMesh {connectionStatus.text}
                  </span>
                </div>
                {systemAlerts.unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {systemAlerts.unreadCount}
                  </Badge>
                )}
              </div>

              {/* Mobile ETH Price */}
              {ethPrice.price > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ETH Price</span>
                    <div className="text-right">
                      <div className="font-semibold">{formatPrice(ethPrice.price)}</div>
                      <div className={`text-xs ${ethPrice.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatChange(ethPrice.priceChange24h)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link href={item.path} onClick={closeMobileMenu}>
                    <div className={cn(
                      "flex items-center space-x-3 rounded-lg p-3 text-sm font-medium hover:bg-muted",
                      location === item.path && "bg-muted"
                    )}>
                      <item.icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                  
                  {/* Mobile submenu items */}
                  {item.children && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link key={child.name} href={child.path} onClick={closeMobileMenu}>
                          <div className={cn(
                            "flex items-center space-x-3 rounded-lg p-2 text-sm hover:bg-muted/50",
                            location === child.path && "bg-muted/50"
                          )}>
                            <child.icon className="h-3 w-3" />
                            <span className="text-sm">{child.name}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile footer */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">U</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">User</span>
                </div>
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Brand */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Waides KI
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex items-center space-x-1",
                        location.startsWith(item.path) && "bg-muted"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <DropdownMenuLabel className="flex items-center space-x-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.name} asChild>
                        <Link href={child.path} className="w-full">
                          <div className="flex items-start space-x-3">
                            <child.icon className="h-4 w-4 mt-0.5" />
                            <div>
                              <div className="font-medium">{child.name}</div>
                              {child.description && (
                                <div className="text-xs text-muted-foreground">{child.description}</div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href={item.path}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex items-center space-x-1",
                      location === item.path && "bg-muted"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Mobile brand */}
          <div className="md:hidden">
            <Link href="/" className="flex items-center">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                Waides KI
              </span>
            </Link>
          </div>

          {/* Desktop ETH Price and Status */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* ETH Price */}
            {ethPrice.price > 0 && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">ETH</span>
                <span className="font-semibold">{formatPrice(ethPrice.price)}</span>
                <span className={`text-xs ${ethPrice.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatChange(ethPrice.priceChange24h)}
                </span>
              </div>
            )}

            {/* Connection Status */}
            <div className="flex items-center space-x-1">
              {connectionStatus.icon}
              <span className={`text-xs ${connectionStatus.color}`}>
                {connectionStatus.text}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <DropdownMenu open={searchOpen} onOpenChange={setSearchOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <form onSubmit={handleSearch} className="p-2">
                  <Input
                    type="search"
                    placeholder="Search Waides KI..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                    autoFocus
                  />
                </form>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                  <Bell className="h-4 w-4" />
                  {systemAlerts.unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0"
                    >
                      {systemAlerts.unreadCount > 9 ? '9+' : systemAlerts.unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {systemAlerts.alerts.length > 0 ? (
                  systemAlerts.alerts.slice(0, 5).map((alert: any, index: number) => (
                    <DropdownMenuItem key={index} className="p-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{alert.title || 'System Alert'}</p>
                        <p className="text-xs text-muted-foreground">{alert.message || 'System notification'}</p>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    <span className="text-sm text-muted-foreground">No new notifications</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}