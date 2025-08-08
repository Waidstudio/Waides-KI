import React, { useState, useEffect, useRef } from 'react';
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
  Command
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { useUserAuth } from '../../hooks/useUserAuth';
import './FuturisticNavbar.css';

const FuturisticNavbar = () => {
  const [location, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(3);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const { user, isAuthenticated, logout } = useUserAuth();

  // Navigation categories with dropdown items - filtered by authentication
  const getNavigationCategories = () => {
    const authenticatedItems = [
      {
        name: 'Core Trading',
        key: 'trading',
        icon: TrendingUp,
        items: [
          { name: 'Vision Portal', path: '/portal', icon: Eye },
          { name: 'Trading Interface', path: '/trading', icon: BarChart3 },
          { name: 'Bot Dashboard', path: '/bot-dashboard', icon: Bot },
          { name: 'Live Data', path: '/live-data', icon: Activity },
          { name: 'Dashboard', path: '/dashboard', icon: Gauge },
          { name: 'Analytics', path: '/analytics', icon: TrendingUp }
        ]
      },
      {
        name: 'AI Systems',
        key: 'ai',
        icon: Brain,
        items: [
          { name: 'AI Systems Hub', path: '/ai-systems', icon: Brain },
          { name: 'Maibot (Free)', path: '/maibot', icon: Bot },
          { name: 'WaidBot', path: '/waidbot', icon: Zap },
          { name: 'WaidBot Pro', path: '/waidbot-pro', icon: Crown },
          { name: 'Enhanced WaidBot', path: '/enhanced-waidbot', icon: Sparkles },
          { name: 'Autonomous Trader', path: '/autonomous-trader', icon: Target }
        ]
      },
      {
        name: 'Spiritual AI',
        key: 'spiritual',
        icon: Sparkles,
        items: [
          { name: 'Dream Vision', path: '/dream-vision', icon: Eye },
          { name: 'Vision Spirit', path: '/vision-spirit', icon: Heart },
          { name: 'Spiritual Recall', path: '/spiritual-recall', icon: Brain },
          { name: 'Seasonal Rebirth', path: '/seasonal-rebirth', icon: Waves },
          { name: 'Sigil Layer', path: '/sigil-layer', icon: Star },
          { name: 'Shadow Defense', path: '/shadow-defense', icon: Shield }
        ]
      },
      {
        name: 'Wallet & Finance',
        key: 'wallet',
        icon: Wallet,
        items: [
          { name: 'Main Wallet', path: '/wallet', icon: Wallet },
          { name: 'SmaiSika Wallet', path: '/wallet-simple', icon: Coins },
          { name: 'Professional Wallet', path: '/wallet-pro', icon: TrendingUp },
          { name: 'Payment Admin', path: '/payment-admin', icon: Settings }
        ]
      },
      {
        name: 'Admin & Config',
        key: 'admin',
        icon: Settings,
        items: [
          { name: 'Admin Panel', path: '/admin', icon: Settings },
          { name: 'Admin Dashboard', path: '/admin-panel', icon: Gauge },
          { name: 'Configuration', path: '/config', icon: Command },
          { name: 'Security', path: '/security', icon: Lock }
        ]
      }
    ];

    return isAuthenticated ? authenticatedItems : [];
  };

  const navigationCategories = getNavigationCategories();

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
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [activeDropdown]);

  const handleDropdownToggle = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveDropdown(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  return (
    <div className="futuristic-navbar">
      <div className="navbar-content">
        {/* Logo */}
        <div className="navbar-logo">
          <Link href="/">
            <div className="logo-container">
              <div className="logo-icon">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <h2 className="logo-text">SmaiSika</h2>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links - Only show for authenticated users */}
        <div className="navbar-links">
          {navigationCategories.map((category) => (
            <div
              key={category.key}
              className="dropdown"
              ref={(ref) => (dropdownRefs.current[category.key] = ref)}
            >
              <button
                className="dropdown-toggle"
                onClick={() => handleDropdownToggle(category.key)}
              >
                <category.icon className="w-4 h-4" />
                {category.name}
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-300 ${
                    activeDropdown === category.key ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              {activeDropdown === category.key && (
                <div className="dropdown-menu open">
                  {category.items.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className="dropdown-link"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="navbar-actions">
          {/* Search - Only for authenticated users */}
          {isAuthenticated && (
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                className="search-input"
              />
            </div>
          )}

          {/* User Profile and Actions */}
          {isAuthenticated ? (
            <>
              {/* WaidChat Icon */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="action-button"
                onClick={() => navigate('/waid-chat')}
                title="WaidChat"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="action-button" title="Notifications">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <Badge className="notification-badge">
                    {notificationCount}
                  </Badge>
                )}
              </Button>

              {/* User Profile */}
              <div className="user-profile">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="action-button"
                  onClick={() => navigate('/profile')}
                  title={`Profile (${user?.username || 'User'})`}
                >
                  <User className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="action-button"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/login')}
              className="action-button"
            >
              Login
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <div className="mobile-menu-toggle">
            <button
              className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
            >
              <div></div>
              <div></div>
              <div></div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Only show navigation for authenticated users */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        {isAuthenticated ? (
          <>
            {navigationCategories.map((category) => (
              <div key={category.key} className="mobile-category">
                <button
                  className="mobile-category-toggle"
                  onClick={() => handleDropdownToggle(`mobile-${category.key}`)}
                >
                  <category.icon className="w-4 h-4" />
                  {category.name}
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform duration-300 ${
                      activeDropdown === `mobile-${category.key}` ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                {activeDropdown === `mobile-${category.key}` && (
                  <div className="mobile-dropdown">
                    {category.items.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        className="mobile-link"
                        onClick={() => {
                          setActiveDropdown(null);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Mobile User Actions */}
            <div className="mobile-user-actions">
              <Link
                href="/waid-chat"
                className="mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MessageCircle className="w-4 h-4" />
                WaidChat
              </Link>
              <Link
                href="/profile"
                className="mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                Profile ({user?.username || 'User'})
              </Link>
              <button
                className="mobile-link"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="mobile-guest-actions">
            <Link
              href="/login"
              className="mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuturisticNavbar;