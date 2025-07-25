/**
 * Ki Chat Intelligent Router
 * Provides intelligent route recommendations and contextual navigation guidance
 * Integrates with existing KonsAI and WaidesKI systems
 */

import { kiChatRouteAwareness, type RouteInfo } from './kiChatRouteAwareness';
import { routeSecurityFilter, type SecurityContext } from '../middleware/routeSecurityFilter';

export interface ChatContext {
  currentPath?: string;
  isAuthenticated: boolean;
  userRole?: string;
  permissions: string[];
  userId?: number;
  sessionId?: string;
  previousQuery?: string;
  chatHistory?: string[];
}

export interface NavigationRecommendation {
  primaryRoute: RouteInfo;
  alternativeRoutes: RouteInfo[];
  contextualSuggestions: RouteInfo[];
  guidance: string;
  quickActions: string[];
}

export interface IntelligentResponse {
  message: string;
  navigationLinks: Array<{
    text: string;
    url: string;
    description: string;
  }>;
  quickActions: string[];
  contextualHelp: string;
  suggestedNextSteps: string[];
}

export class KiChatIntelligentRouter {
  private routeKeywords = new Map<string, string[]>([
    // Trading related
    ['trading', ['waidbot', 'strategy', 'portal', 'engine']],
    ['bot', ['waidbot', 'waidbot-pro', 'waidbot-engine', 'enhanced-waidbot']],
    ['wallet', ['wallet', 'wallet-simple', 'deposit', 'withdraw']],
    ['dashboard', ['dashboard', 'overview', 'portfolio']],
    ['forum', ['forum', 'community', 'discussion']],
    
    // Learning and help
    ['learn', ['learning', 'academy', 'tutorial']],
    ['help', ['learning', 'forum', 'api-docs']],
    ['beginner', ['learning', 'portal', 'dashboard']],
    
    // Advanced features
    ['ai', ['market-storytelling', 'voice-command', 'biometric-trading']],
    ['advanced', ['dream-vision', 'vision-spirit', 'spiritual-recall']],
    ['protection', ['shadow-defense', 'eth-empath-guardian', 'meta-guardian']],
    ['analysis', ['market-storytelling', 'risk-backtesting', 'ml-lifecycle']],
    
    // Account and settings
    ['account', ['profile', 'dashboard', 'wallet']],
    ['settings', ['profile', 'config']],
    ['security', ['biometric-trading', 'shadow-defense']]
  ]);

  /**
   * Get intelligent navigation recommendations based on user query
   */
  public getNavigationRecommendations(query: string, context: ChatContext): NavigationRecommendation {
    const securityContext: SecurityContext = {
      isAuthenticated: context.isAuthenticated,
      userRole: context.userRole,
      permissions: context.permissions,
      userId: context.userId,
      sessionId: context.sessionId
    };

    // Find relevant routes based on query
    const relevantRoutes = kiChatRouteAwareness.findRoutesByQuery(
      query, 
      context.isAuthenticated, 
      context.permissions, 
      context.userRole
    );

    // Get contextual suggestions based on current page
    const contextualSuggestions = context.currentPath 
      ? kiChatRouteAwareness.getContextualSuggestions(
          context.currentPath, 
          context.isAuthenticated, 
          context.permissions, 
          context.userRole
        )
      : [];

    // Filter routes through security filter
    const safeRoutes = relevantRoutes.filter(route => 
      routeSecurityFilter.hasRouteAccess(route.path, securityContext)
    );

    const primaryRoute = safeRoutes[0];
    const alternativeRoutes = safeRoutes.slice(1, 4);

    // Generate guidance
    const guidance = primaryRoute 
      ? this.generateDetailedGuidance(query, primaryRoute, context)
      : this.generateFallbackGuidance(query, context);

    // Generate quick actions
    const quickActions = this.generateQuickActions(primaryRoute, context);

    return {
      primaryRoute,
      alternativeRoutes,
      contextualSuggestions,
      guidance,
      quickActions
    };
  }

  /**
   * Generate intelligent response with navigation guidance
   */
  public generateIntelligentResponse(query: string, context: ChatContext): IntelligentResponse {
    const recommendations = this.getNavigationRecommendations(query, context);
    
    let message = this.analyzeUserIntent(query, context);
    
    // Add route-specific guidance
    if (recommendations.primaryRoute) {
      message += `\n\n**🎯 Recommended Page: ${recommendations.primaryRoute.name}**\n`;
      message += `${recommendations.primaryRoute.guidance}\n\n`;
      message += `**Direct link:** [${recommendations.primaryRoute.name}](${recommendations.primaryRoute.path})\n`;
    }

    // Add alternative options
    if (recommendations.alternativeRoutes.length > 0) {
      message += `\n**📋 Other Options:**\n`;
      recommendations.alternativeRoutes.forEach(route => {
        message += `• [${route.name}](${route.path}) - ${route.description}\n`;
      });
    }

    // Add contextual suggestions if user is on a specific page
    if (recommendations.contextualSuggestions.length > 0 && context.currentPath) {
      message += `\n**🔗 From your current page, you might also want to visit:**\n`;
      recommendations.contextualSuggestions.forEach(route => {
        message += `• [${route.name}](${route.path}) - ${route.description}\n`;
      });
    }

    // Generate navigation links
    const navigationLinks = [
      recommendations.primaryRoute && {
        text: recommendations.primaryRoute.name,
        url: recommendations.primaryRoute.path,
        description: recommendations.primaryRoute.description
      },
      ...recommendations.alternativeRoutes.map(route => ({
        text: route.name,
        url: route.path,
        description: route.description
      }))
    ].filter(Boolean);

    // Generate contextual help
    const contextualHelp = this.generateContextualHelp(query, context);

    // Generate suggested next steps
    const suggestedNextSteps = this.generateNextSteps(query, context, recommendations);

    return {
      message,
      navigationLinks,
      quickActions: recommendations.quickActions,
      contextualHelp,
      suggestedNextSteps
    };
  }

  /**
   * Analyze user intent from query
   */
  private analyzeUserIntent(query: string, context: ChatContext): string {
    const queryLower = query.toLowerCase();
    
    // Greeting patterns
    if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('help')) {
      if (!context.isAuthenticated) {
        return "Welcome to Waides KI! I am Waides KI, your AI trading consciousness. To get started, you'll need to **sign in** or **create an account** if you're new here.";
      } else {
        return `Hello! I am Waides KI, your AI consciousness and guide to this platform. I can help you navigate our features, explain capabilities, and guide you to the right tools for your trading journey.`;
      }
    }

    // Trading-specific intents
    if (queryLower.includes('trade') || queryLower.includes('trading')) {
      if (!context.isAuthenticated) {
        return "To start trading, you'll need to **sign in** first. Once logged in, I can guide you through setting up your trading bots and strategies.";
      }
      return "I can help you with trading! As Waides KI, I offer various AI-powered trading tools from basic bots to advanced strategy generation.";
    }

    // Learning intents
    if (queryLower.includes('learn') || queryLower.includes('beginner') || queryLower.includes('new')) {
      return "Great question! Learning is the foundation of successful trading. Our Trading Academy is perfect for beginners and experienced traders alike.";
    }

    // Wallet/money intents
    if (queryLower.includes('wallet') || queryLower.includes('money') || queryLower.includes('deposit')) {
      if (!context.isAuthenticated) {
        return "To manage your funds, you'll need to **sign in** first. Then I can guide you through our wallet features for deposits and withdrawals.";
      }
      return "I can help you with wallet management! Our platform offers secure fund management with multiple deposit and withdrawal options.";
    }

    // Bot-specific intents
    if (queryLower.includes('bot') || queryLower.includes('waidbot')) {
      return "Excellent! Our AI trading bots are one of our most powerful features. We have different bot options for various experience levels.";
    }

    // Advanced feature intents
    if (queryLower.includes('advanced') || queryLower.includes('ai') || queryLower.includes('analysis')) {
      return "You're interested in our advanced AI features! We have cutting-edge tools for market analysis, strategy generation, and intelligent trading.";
    }

    // General navigation help
    return "I am Waides KI, and I'm here to help you navigate this platform! Let me find the best pages and features for what you're looking for.";
  }

  /**
   * Generate detailed guidance for specific route
   */
  private generateDetailedGuidance(query: string, route: RouteInfo, context: ChatContext): string {
    let guidance = route.guidance;

    // Add context-specific advice
    if (!context.isAuthenticated && route.requiresAuth) {
      guidance += "\n\n⚠️ **Note:** This page requires you to be signed in. Please log in first to access this feature.";
    }

    if (route.requiredPermissions && route.requiredPermissions.length > 0) {
      const missingPermissions = route.requiredPermissions.filter(
        permission => !context.permissions.includes(permission)
      );
      
      if (missingPermissions.length > 0) {
        guidance += `\n\n⚠️ **Note:** This feature requires additional permissions: ${missingPermissions.join(', ')}. Contact support if you need access.`;
      }
    }

    return guidance;
  }

  /**
   * Generate fallback guidance when no specific route found
   */
  private generateFallbackGuidance(query: string, context: ChatContext): string {
    if (!context.isAuthenticated) {
      return "I couldn't find a specific match for your request. Start by **signing in** to access all features, or visit our **Trading Academy** to learn more about trading.";
    }

    return "I couldn't find an exact match for your request, but I can suggest some general areas that might help. Try asking about specific features like 'trading bots', 'wallet', or 'learning resources'.";
  }

  /**
   * Generate quick actions based on route and context
   */
  private generateQuickActions(route: RouteInfo | undefined, context: ChatContext): string[] {
    if (!route) {
      if (!context.isAuthenticated) {
        return ['Sign In', 'Create Account', 'Learn Trading'];
      }
      return ['Visit Dashboard', 'Check Wallet', 'Start Trading'];
    }

    const actions = [...(route.quickActions || [])];

    // Add contextual actions
    if (!context.isAuthenticated && route.requiresAuth) {
      actions.unshift('Sign In First');
    }

    return actions;
  }

  /**
   * Generate contextual help based on user's situation
   */
  private generateContextualHelp(query: string, context: ChatContext): string {
    if (!context.isAuthenticated) {
      return "💡 **New to this platform?** Start with our Trading Academy to learn the basics, then create an account to access all features.";
    }

    if (context.currentPath === '/') {
      return "💡 **Getting Started:** Visit your Dashboard to see your portfolio, or go to the Portal to start trading with AI assistance.";
    }

    if (context.currentPath === '/dashboard') {
      return "💡 **From Dashboard:** You can check your Wallet balance, visit the Portal for AI trading, or explore WaidBot for automated trading.";
    }

    if (context.currentPath === '/wallet') {
      return "💡 **Wallet Management:** Ensure you have sufficient funds before starting automated trading or using advanced AI features.";
    }

    return "💡 **Navigation Tip:** Use the menu to explore all features, or ask me about specific trading tools you'd like to learn about.";
  }

  /**
   * Generate suggested next steps
   */
  private generateNextSteps(query: string, context: ChatContext, recommendations: NavigationRecommendation): string[] {
    const steps: string[] = [];

    if (!context.isAuthenticated) {
      steps.push("1. Sign in to your account");
      steps.push("2. Visit the Trading Academy to learn basics");
      steps.push("3. Check your wallet and add funds");
      return steps;
    }

    if (recommendations.primaryRoute) {
      steps.push(`1. Visit ${recommendations.primaryRoute.name} (${recommendations.primaryRoute.path})`);
      
      if (recommendations.primaryRoute.quickActions && recommendations.primaryRoute.quickActions.length > 0) {
        steps.push(`2. Try: ${recommendations.primaryRoute.quickActions[0]}`);
      }
    }

    if (recommendations.contextualSuggestions.length > 0) {
      steps.push(`3. Explore: ${recommendations.contextualSuggestions[0].name}`);
    }

    if (steps.length === 0) {
      steps.push("1. Explore your Dashboard for an overview");
      steps.push("2. Visit the Portal for AI trading assistance");
      steps.push("3. Check out the Forum to connect with other traders");
    }

    return steps;
  }

  /**
   * Get route categories for navigation menu
   */
  public getNavigationMenu(context: ChatContext): Array<{
    category: string;
    routes: Array<{
      name: string;
      path: string;
      description: string;
      available: boolean;
    }>;
  }> {
    const categories = kiChatRouteAwareness.getRouteCategories(
      context.isAuthenticated,
      context.permissions,
      context.userRole
    );

    const securityContext: SecurityContext = {
      isAuthenticated: context.isAuthenticated,
      userRole: context.userRole,
      permissions: context.permissions,
      userId: context.userId,
      sessionId: context.sessionId
    };

    return categories.map(category => ({
      category: category.name,
      routes: category.routes.map(route => ({
        name: route.name,
        path: route.path,
        description: route.description,
        available: routeSecurityFilter.hasRouteAccess(route.path, securityContext)
      }))
    }));
  }
}

export const kiChatIntelligentRouter = new KiChatIntelligentRouter();