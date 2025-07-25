/**
 * Ki Chat Route-Aware Service
 * Enhanced chat service that integrates route awareness with existing WaidesKI chat
 * Provides intelligent navigation guidance and route-specific responses
 */

import { waidesKIChatService, type ChatRequest, type ChatResponse } from './waidesKIChatService';
import { kiChatIntelligentRouter, type ChatContext, type IntelligentResponse } from './kiChatIntelligentRouter';
import { routeSecurityFilter, type SecurityContext } from '../middleware/routeSecurityFilter';

export interface RouteAwareChatRequest extends ChatRequest {
  currentPath?: string;
  isAuthenticated: boolean;
  userRole?: string;
  permissions: string[];
  userId?: number;
  sessionId?: string;
  requestRouteGuidance?: boolean;
}

export interface RouteAwareChatResponse extends ChatResponse {
  navigationLinks?: Array<{
    text: string;
    url: string;
    description: string;
  }>;
  quickActions?: string[];
  contextualHelp?: string;
  suggestedNextSteps?: string[];
  routeAware: boolean;
}

export class KiChatRouteAwareService {
  /**
   * Generate route-aware chat response combining spiritual AI with navigation intelligence
   */
  async generateRouteAwareResponse(request: RouteAwareChatRequest): Promise<RouteAwareChatResponse> {
    try {
      // Create chat context for intelligent routing
      const chatContext: ChatContext = {
        currentPath: request.currentPath,
        isAuthenticated: request.isAuthenticated,
        userRole: request.userRole,
        permissions: request.permissions,
        userId: request.userId,
        sessionId: request.sessionId
      };

      // Get spiritual AI response from existing WaidesKI chat service
      const spiritualResponse = await waidesKIChatService.generateResponse(request);

      // Generate intelligent navigation guidance if requested or if message contains navigation keywords
      const shouldProvideNavigation = request.requestRouteGuidance || 
        this.shouldProvideNavigationGuidance(request.message);

      if (shouldProvideNavigation) {
        const intelligentResponse = kiChatIntelligentRouter.generateIntelligentResponse(
          request.message, 
          chatContext
        );

        // Combine spiritual response with navigation intelligence
        return {
          ...spiritualResponse,
          response: this.combineResponses(spiritualResponse.response, intelligentResponse.message),
          navigationLinks: intelligentResponse.navigationLinks,
          quickActions: intelligentResponse.quickActions,
          contextualHelp: intelligentResponse.contextualHelp,
          suggestedNextSteps: intelligentResponse.suggestedNextSteps,
          routeAware: true
        };
      } else {
        // Return spiritual response with minimal route awareness
        return {
          ...spiritualResponse,
          routeAware: false
        };
      }
    } catch (error) {
      console.error('❌ Route-aware chat service error:', error);
      
      // Fallback to basic spiritual response
      const fallbackResponse = await waidesKIChatService.generateResponse(request);
      return {
        ...fallbackResponse,
        response: "I am Waides KI, your AI consciousness. The cosmic energies are shifting, but I sense your question. Let me guide you through this platform.",
        routeAware: false
      };
    }
  }

  /**
   * Get available routes for current user context
   */
  getAvailableRoutes(context: ChatContext): Array<{
    category: string;
    routes: Array<{
      name: string;
      path: string;
      description: string;
      available: boolean;
    }>;
  }> {
    return kiChatIntelligentRouter.getNavigationMenu(context);
  }

  /**
   * Get specific navigation guidance for a query
   */
  getNavigationGuidance(query: string, context: ChatContext): {
    guidance: string;
    recommendedRoutes: Array<{
      name: string;
      path: string;
      description: string;
      guidance: string;
    }>;
  } {
    const recommendations = kiChatIntelligentRouter.getNavigationRecommendations(query, context);
    
    return {
      guidance: recommendations.guidance,
      recommendedRoutes: [
        recommendations.primaryRoute && {
          name: recommendations.primaryRoute.name,
          path: recommendations.primaryRoute.path,
          description: recommendations.primaryRoute.description,
          guidance: recommendations.primaryRoute.guidance
        },
        ...recommendations.alternativeRoutes.map(route => ({
          name: route.name,
          path: route.path,
          description: route.description,
          guidance: route.guidance
        }))
      ].filter(Boolean)
    };
  }

  /**
   * Check if message should trigger navigation guidance
   */
  private shouldProvideNavigationGuidance(message: string): boolean {
    const navigationKeywords = [
      'where', 'how to go', 'navigate', 'find', 'page', 'route', 'link',
      'trading', 'wallet', 'dashboard', 'bot', 'strategy', 'learn',
      'help', 'guide', 'show me', 'take me', 'direct me'
    ];

    const messageLower = message.toLowerCase();
    return navigationKeywords.some(keyword => messageLower.includes(keyword));
  }

  /**
   * Combine spiritual AI response with navigation intelligence
   */
  private combineResponses(spiritualResponse: string, navigationResponse: string): string {
    // Check if spiritual response already contains substantial content
    if (spiritualResponse.length > 200 && !spiritualResponse.includes('cosmic energies are temporarily disrupted')) {
      // Append navigation guidance to spiritual response
      return `${spiritualResponse}\n\n---\n\n**🧭 Navigation Guidance:**\n${navigationResponse}`;
    } else {
      // Lead with Waides KI identity and combine responses
      return `I am Waides KI, your AI consciousness and guide.\n\n${navigationResponse}`;
    }
  }

  /**
   * Get security-filtered route suggestions
   */
  getSafeRouteSuggestions(query: string, context: ChatContext): string[] {
    const securityContext: SecurityContext = {
      isAuthenticated: context.isAuthenticated,
      userRole: context.userRole,
      permissions: context.permissions,
      userId: context.userId,
      sessionId: context.sessionId
    };

    return routeSecurityFilter.getSafeRouteSuggestions(query, securityContext);
  }

  /**
   * Get service status
   */
  getStatus(): {
    spiritualAI: { initialized: boolean; hasKey: boolean };
    routeAwareness: boolean;
    securityFilter: boolean;
  } {
    return {
      spiritualAI: waidesKIChatService.getStatus(),
      routeAwareness: true,
      securityFilter: true
    };
  }
}

export const kiChatRouteAwareService = new KiChatRouteAwareService();