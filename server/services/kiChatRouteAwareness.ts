/**
 * Ki Chat Route Awareness Service
 * Provides comprehensive route mapping and navigation guidance for Ki Chat
 * Maintains security by filtering sensitive admin routes
 */

export interface RouteInfo {
  path: string;
  name: string;
  description: string;
  category: 'public' | 'user' | 'advanced' | 'admin';
  requiresAuth: boolean;
  requiredPermissions?: string[];
  requiredRole?: string | string[];
  keywords: string[];
  guidance: string;
  quickActions?: string[];
}

export interface RouteCategory {
  name: string;
  description: string;
  routes: RouteInfo[];
}

export class KiChatRouteAwareness {
  private routes: RouteInfo[] = [
    // Public Routes - Always accessible
    {
      path: '/',
      name: 'Landing Page',
      description: 'Welcome page for new and returning users',
      category: 'public',
      requiresAuth: false,
      keywords: ['home', 'landing', 'start', 'welcome', 'main'],
      guidance: 'Perfect starting point for new users. Learn about Waides KI capabilities and get started with trading.',
      quickActions: ['Sign Up', 'Learn More', 'Login']
    },
    {
      path: '/login',
      name: 'User Login',
      description: 'Sign in to your trading account',
      category: 'public',
      requiresAuth: false,
      keywords: ['login', 'sign in', 'authenticate', 'access account'],
      guidance: 'Access your trading account with your credentials. New users should register first.',
      quickActions: ['Login', 'Forgot Password', 'Register']
    },
    {
      path: '/register',
      name: 'User Registration',
      description: 'Create a new trading account',
      category: 'public',
      requiresAuth: false,
      keywords: ['register', 'sign up', 'create account', 'new user'],
      guidance: 'Create your Waides KI trading account to access all platform features.',
      quickActions: ['Register', 'Login Instead']
    },
    {
      path: '/forgot-password',
      name: 'Password Recovery',
      description: 'Reset your account password',
      category: 'public',
      requiresAuth: false,
      keywords: ['forgot password', 'reset password', 'recover account'],
      guidance: 'Recover access to your account if you\'ve forgotten your password.',
      quickActions: ['Reset Password', 'Back to Login']
    },

    // Core User Routes - Authentication required
    {
      path: '/portal',
      name: 'Ki Chat Portal',
      description: 'Main AI chat interface and trading portal',
      category: 'user',
      requiresAuth: true,
      keywords: ['portal', 'chat', 'ki chat', 'ai assistant', 'trading interface'],
      guidance: 'Your main hub for AI-powered trading assistance. Chat with Ki for guidance and execute trades.',
      quickActions: ['Ask Ki Chat', 'Check Market', 'View Portfolio']
    },
    {
      path: '/dashboard',
      name: 'User Dashboard',
      description: 'Personal trading dashboard with portfolio overview',
      category: 'user',
      requiresAuth: true,
      keywords: ['dashboard', 'overview', 'portfolio', 'summary', 'stats'],
      guidance: 'View your trading performance, portfolio balance, and key metrics.',
      quickActions: ['View Portfolio', 'Recent Trades', 'Performance']
    },
    {
      path: '/wallet',
      name: 'Wallet Management',
      description: 'Manage funds, deposits, and withdrawals',
      category: 'user',
      requiresAuth: true,
      keywords: ['wallet', 'funds', 'deposit', 'withdraw', 'balance', 'money'],
      guidance: 'Manage your trading funds. Deposit money to start trading or withdraw profits.',
      quickActions: ['Deposit Funds', 'Withdraw', 'View Transactions']
    },
    {
      path: '/wallet-simple',
      name: 'Simple Wallet',
      description: 'Simplified wallet interface for basic operations',
      category: 'user',
      requiresAuth: true,
      keywords: ['simple wallet', 'basic wallet', 'easy wallet'],
      guidance: 'Simplified wallet interface perfect for beginners.',
      quickActions: ['Quick Deposit', 'Check Balance']
    },
    {
      path: '/forum',
      name: 'Community Forum',
      description: 'Connect with other traders and share insights',
      category: 'user',
      requiresAuth: true,
      keywords: ['forum', 'community', 'discussion', 'traders', 'social'],
      guidance: 'Join discussions with other traders, share strategies, and learn from the community.',
      quickActions: ['Browse Topics', 'Create Post', 'View Discussions']
    },
    {
      path: '/profile',
      name: 'User Profile',
      description: 'Manage account settings and preferences',
      category: 'user',
      requiresAuth: true,
      keywords: ['profile', 'settings', 'account', 'preferences', 'personal'],
      guidance: 'Update your profile information, trading preferences, and account settings.',
      quickActions: ['Edit Profile', 'Change Password', 'Preferences']
    },
    {
      path: '/learning',
      name: 'Trading Academy',
      description: 'Learn trading fundamentals and advanced strategies',
      category: 'user',
      requiresAuth: false,
      keywords: ['learning', 'education', 'academy', 'tutorial', 'course', 'beginner'],
      guidance: 'Perfect for beginners! Learn trading basics, risk management, and advanced strategies.',
      quickActions: ['Start Learning', 'Trading Basics', 'Advanced Strategies']
    },

    // Advanced AI Features - User authentication + permissions
    {
      path: '/waidbot-engine',
      name: 'WaidBot Engine',
      description: 'Advanced AI trading bot control center',
      category: 'advanced',
      requiresAuth: true,
      requiredPermissions: ['control_trading'],
      keywords: ['waidbot', 'trading bot', 'automated trading', 'engine', 'ai trading'],
      guidance: 'Control advanced AI trading bots. Set parameters and monitor automated trading performance.',
      quickActions: ['Start Bot', 'View Performance', 'Adjust Settings']
    },
    {
      path: '/waidbot',
      name: 'WaidBot Basic',
      description: 'Basic AI trading bot interface',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['waidbot', 'basic bot', 'simple trading'],
      guidance: 'Basic AI trading bot perfect for getting started with automated trading.',
      quickActions: ['Activate Bot', 'Monitor Trades']
    },
    {
      path: '/waidbot-pro',
      name: 'WaidBot Pro',
      description: 'Professional AI trading bot with advanced features',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['waidbot pro', 'professional bot', 'advanced trading'],
      guidance: 'Professional-grade AI trading bot with advanced features and strategies.',
      quickActions: ['Configure Pro Bot', 'Advanced Settings']
    },
    {
      path: '/strategy-autogen',
      name: 'Strategy Auto-Generation',
      description: 'AI-powered trading strategy generation',
      category: 'advanced',
      requiresAuth: true,
      requiredPermissions: ['control_trading'],
      keywords: ['strategy', 'autogen', 'generate strategy', 'ai strategy'],
      guidance: 'Let AI create personalized trading strategies based on market conditions and your preferences.',
      quickActions: ['Generate Strategy', 'View Strategies', 'Backtest']
    },
    {
      path: '/enhanced-waidbot',
      name: 'Enhanced WaidBot',
      description: 'Enhanced AI trading bot with premium features',
      category: 'advanced',
      requiresAuth: true,
      requiredPermissions: ['control_trading'],
      keywords: ['enhanced waidbot', 'premium bot', 'advanced features'],
      guidance: 'Enhanced trading bot with premium features and superior performance.',
      quickActions: ['Enhanced Settings', 'Premium Features']
    },
    {
      path: '/market-storytelling',
      name: 'Market Storytelling',
      description: 'AI-driven market analysis and narrative insights',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['market story', 'narrative', 'analysis', 'insights', 'ai analysis'],
      guidance: 'Get AI-powered market analysis with narrative insights and trend storytelling.',
      quickActions: ['Market Story', 'Trend Analysis', 'AI Insights']
    },
    {
      path: '/voice-command',
      name: 'Voice Trading',
      description: 'Voice-controlled trading interface',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['voice', 'voice command', 'voice trading', 'speak'],
      guidance: 'Control your trading using voice commands. Trade hands-free with AI voice recognition.',
      quickActions: ['Start Voice Mode', 'Voice Commands']
    },
    {
      path: '/biometric-trading',
      name: 'Biometric Trading',
      description: 'Advanced biometric-secured trading interface',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['biometric', 'fingerprint', 'secure trading', 'bio auth'],
      guidance: 'Ultra-secure trading using biometric authentication and emotional state analysis.',
      quickActions: ['Biometric Setup', 'Secure Trade']
    },
    {
      path: '/dream-vision',
      name: 'Dream Vision Analysis',
      description: 'AI-powered dream and vision analysis for trading insights',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['dream', 'vision', 'spiritual trading', 'intuitive'],
      guidance: 'Unique AI system that analyzes dreams and visions for trading insights.',
      quickActions: ['Dream Analysis', 'Vision Insights']
    },
    {
      path: '/vision-spirit',
      name: 'Vision Spirit',
      description: 'Spiritual trading insights and consciousness guidance',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['vision spirit', 'spiritual', 'consciousness', 'intuitive trading'],
      guidance: 'Connect with spiritual trading intelligence for deeper market understanding.',
      quickActions: ['Spirit Guidance', 'Consciousness Trading']
    },
    {
      path: '/spiritual-recall',
      name: 'Spiritual Recall',
      description: 'Access past trading wisdom and spiritual insights',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['spiritual recall', 'past wisdom', 'trading memory'],
      guidance: 'Tap into accumulated trading wisdom and spiritual insights from past experiences.',
      quickActions: ['Access Wisdom', 'Recall Insights']
    },
    {
      path: '/seasonal-rebirth',
      name: 'Seasonal Rebirth',
      description: 'Seasonal trading patterns and rebirth cycles',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['seasonal', 'rebirth', 'cycles', 'patterns'],
      guidance: 'Understand and leverage seasonal trading patterns and market rebirth cycles.',
      quickActions: ['Seasonal Analysis', 'Cycle Patterns']
    },
    {
      path: '/sigil-layer',
      name: 'Sigil Layer',
      description: 'Advanced symbolic trading pattern recognition',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['sigil', 'symbols', 'pattern recognition', 'mystical'],
      guidance: 'Advanced pattern recognition using symbolic and mystical trading analysis.',
      quickActions: ['Symbol Analysis', 'Pattern Recognition']
    },
    {
      path: '/shadow-defense',
      name: 'Shadow Defense',
      description: 'Advanced risk management and defensive trading',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['shadow defense', 'risk management', 'protection', 'defensive'],
      guidance: 'Advanced risk management system that protects your trades from market shadows.',
      quickActions: ['Defense Mode', 'Risk Analysis']
    },
    {
      path: '/reincarnation',
      name: 'Reincarnation Loop',
      description: 'Continuous learning and strategy evolution system',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['reincarnation', 'evolution', 'continuous learning', 'adaptation'],
      guidance: 'System that continuously evolves and reincarnates trading strategies for better performance.',
      quickActions: ['Evolution Cycle', 'Strategy Adaptation']
    },
    {
      path: '/eth-empath-guardian',
      name: 'ETH Empath Guardian',
      description: 'Empathetic Ethereum trading guardian system',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['eth guardian', 'ethereum', 'empath', 'guardian'],
      guidance: 'Advanced Ethereum trading guardian that empathetically protects your ETH investments.',
      quickActions: ['Guardian Mode', 'ETH Protection']
    },
    {
      path: '/meta-guardian',
      name: 'Meta-Guardian Network',
      description: 'Advanced meta-level trading protection network',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['meta guardian', 'network protection', 'advanced guardian'],
      guidance: 'Meta-level guardian network providing comprehensive trading protection across all systems.',
      quickActions: ['Network Status', 'Guardian Settings']
    },
    {
      path: '/full-engine',
      name: 'Full Engine',
      description: 'Complete AI trading engine with all features',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['full engine', 'complete system', 'all features'],
      guidance: 'Access the complete AI trading engine with all advanced features enabled.',
      quickActions: ['Full System', 'All Features']
    },
    {
      path: '/ml-lifecycle',
      name: 'ML Lifecycle Manager',
      description: 'Machine learning model lifecycle management',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['ml lifecycle', 'machine learning', 'model management'],
      guidance: 'Manage machine learning models and their lifecycle for trading optimization.',
      quickActions: ['Model Status', 'ML Performance']
    },
    {
      path: '/risk-backtesting',
      name: 'Risk Backtesting',
      description: 'Advanced risk scenario backtesting and analysis',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['risk backtesting', 'scenario testing', 'risk analysis'],
      guidance: 'Test trading strategies against various risk scenarios and historical data.',
      quickActions: ['Backtest Strategy', 'Risk Scenarios']
    },
    {
      path: '/gateway',
      name: 'System Gateway',
      description: 'System integration gateway and API access',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['gateway', 'system access', 'integration'],
      guidance: 'Access system integration gateway for API connections and external services.',
      quickActions: ['Gateway Status', 'API Access']
    },
    {
      path: '/api-docs',
      name: 'API Documentation',
      description: 'Complete API documentation for developers',
      category: 'advanced',
      requiresAuth: true,
      keywords: ['api docs', 'documentation', 'developer', 'api reference'],
      guidance: 'Comprehensive API documentation for developers and advanced users.',
      quickActions: ['API Reference', 'Developer Guide']
    },
    {
      path: '/live-data',
      name: 'Live Data Feed',
      description: 'Real-time market data and live trading information',
      category: 'user',
      requiresAuth: true,
      keywords: ['live data', 'real-time', 'market data', 'live feed'],
      guidance: 'Access real-time market data, live prices, and trading information.',
      quickActions: ['Live Prices', 'Market Data', 'Real-time Feed']
    }
  ];

  // ADMIN routes are deliberately EXCLUDED for security
  // These routes should NEVER be exposed to Ki Chat:
  // /admin, /admin-panel, /config, /expanded-config, /payment-admin, /sms-config, /kons-powa

  /**
   * Get routes accessible to user based on authentication and permissions
   */
  public getAccessibleRoutes(isAuthenticated: boolean, userPermissions: string[] = [], userRole?: string): RouteInfo[] {
    return this.routes.filter(route => {
      // Always show public routes
      if (!route.requiresAuth) {
        return true;
      }

      // Hide protected routes if not authenticated
      if (route.requiresAuth && !isAuthenticated) {
        return false;
      }

      // Check required permissions
      if (route.requiredPermissions) {
        const hasPermissions = route.requiredPermissions.every(permission => 
          userPermissions.includes(permission)
        );
        if (!hasPermissions) {
          return false;
        }
      }

      // Check required role
      if (route.requiredRole) {
        const requiredRoles = Array.isArray(route.requiredRole) ? route.requiredRole : [route.requiredRole];
        if (userRole && !requiredRoles.includes(userRole)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Find routes based on user query keywords
   */
  public findRoutesByQuery(query: string, isAuthenticated: boolean, userPermissions: string[] = [], userRole?: string): RouteInfo[] {
    const accessibleRoutes = this.getAccessibleRoutes(isAuthenticated, userPermissions, userRole);
    const queryLower = query.toLowerCase();

    return accessibleRoutes.filter(route => {
      return route.keywords.some(keyword => 
        keyword.includes(queryLower) || queryLower.includes(keyword)
      ) || 
      route.name.toLowerCase().includes(queryLower) ||
      route.description.toLowerCase().includes(queryLower);
    }).sort((a, b) => {
      // Sort by relevance (exact matches first)
      const aExact = route.keywords.some(keyword => keyword === queryLower);
      const bExact = route.keywords.some(keyword => keyword === queryLower);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });
  }

  /**
   * Get route categories for navigation
   */
  public getRouteCategories(isAuthenticated: boolean, userPermissions: string[] = [], userRole?: string): RouteCategory[] {
    const accessibleRoutes = this.getAccessibleRoutes(isAuthenticated, userPermissions, userRole);

    const categories: { [key: string]: RouteCategory } = {
      public: {
        name: 'Getting Started',
        description: 'Public pages for new users',
        routes: []
      },
      user: {
        name: 'Core Features',
        description: 'Essential trading and account features',
        routes: []
      },
      advanced: {
        name: 'Advanced AI Features',
        description: 'Advanced AI trading and analysis tools',
        routes: []
      }
    };

    accessibleRoutes.forEach(route => {
      if (categories[route.category]) {
        categories[route.category].routes.push(route);
      }
    });

    return Object.values(categories).filter(category => category.routes.length > 0);
  }

  /**
   * Get contextual navigation suggestions based on current page
   */
  public getContextualSuggestions(currentPath: string, isAuthenticated: boolean, userPermissions: string[] = [], userRole?: string): RouteInfo[] {
    const accessibleRoutes = this.getAccessibleRoutes(isAuthenticated, userPermissions, userRole);

    // Define contextual relationships
    const contextMap: { [key: string]: string[] } = {
      '/': ['/login', '/register', '/learning'],
      '/login': ['/register', '/forgot-password', '/dashboard'],
      '/register': ['/login', '/learning'],
      '/dashboard': ['/wallet', '/portal', '/waidbot-engine'],
      '/wallet': ['/portal', '/dashboard', '/waidbot-engine'],
      '/portal': ['/waidbot-engine', '/strategy-autogen', '/market-storytelling'],
      '/learning': ['/portal', '/dashboard', '/waidbot'],
      '/waidbot': ['/waidbot-pro', '/waidbot-engine', '/strategy-autogen'],
      '/waidbot-pro': ['/waidbot-engine', '/enhanced-waidbot', '/strategy-autogen'],
      '/waidbot-engine': ['/strategy-autogen', '/market-storytelling', '/risk-backtesting']
    };

    const suggestedPaths = contextMap[currentPath] || [];
    return accessibleRoutes.filter(route => suggestedPaths.includes(route.path));
  }

  /**
   * Get route information by path
   */
  public getRouteInfo(path: string): RouteInfo | undefined {
    return this.routes.find(route => route.path === path);
  }

  /**
   * Generate navigation guidance text
   */
  public generateNavigationGuidance(query: string, isAuthenticated: boolean, userPermissions: string[] = [], userRole?: string): string {
    const relevantRoutes = this.findRoutesByQuery(query, isAuthenticated, userPermissions, userRole);

    if (relevantRoutes.length === 0) {
      return "I couldn't find any specific pages for that request. Try asking about trading, wallet, dashboard, or learning resources.";
    }

    const topRoute = relevantRoutes[0];
    let guidance = `For **${query}**, I recommend visiting the **${topRoute.name}** page:\n\n`;
    guidance += `🔗 **${topRoute.path}**\n\n`;
    guidance += `${topRoute.guidance}\n\n`;

    if (topRoute.quickActions && topRoute.quickActions.length > 0) {
      guidance += `**Quick Actions:** ${topRoute.quickActions.join(', ')}\n\n`;
    }

    if (relevantRoutes.length > 1) {
      guidance += `**Other relevant pages:**\n`;
      relevantRoutes.slice(1, 4).forEach(route => {
        guidance += `• **${route.name}** (${route.path}) - ${route.description}\n`;
      });
    }

    return guidance;
  }
}

export const kiChatRouteAwareness = new KiChatRouteAwareness();