/**
 * Ki Chat Response Templates Service
 * Professional response templates for natural conversation
 * Integrates with existing route awareness and user context
 */

import type { RouteInfo } from './kiChatRouteAwareness';
import type { QuestionAnalysis, ProcessingContext } from './kiChatNaturalProcessor';

export interface ResponseTemplate {
  greeting: string;
  guidance: string;
  routeSuggestion: string;
  conclusion: string;
}

export interface TemplateContext {
  userName?: string;
  isFirstTime?: boolean;
  currentPage?: string;
  relevantRoutes: RouteInfo[];
  userIntent: string;
  isAuthenticated: boolean;
}

export class KiChatResponseTemplates {
  
  /**
   * Generate greeting based on user context
   */
  generateGreeting(context: TemplateContext, analysis: QuestionAnalysis): string {
    const greetings = {
      firstTime: [
        "Hello! I'm Ki Chat, your personal guide here at Waides KI.",
        "Welcome to Waides KI! I'm Ki Chat, and I'm here to help you navigate the platform.",
        "Hi there! I'm Ki Chat, your intelligent assistant for everything related to Waides KI."
      ],
      returning: [
        "Welcome back! How can I assist you today?",
        "Good to see you again! What can I help you with?",
        "Hello! Ready to continue your journey with Waides KI?"
      ],
      question: [
        "That's a great question!",
        "I'd be happy to help you with that.",
        "Let me help you understand this better."
      ]
    };

    if (analysis.intent === 'greeting') {
      return context.isFirstTime ? 
        this.randomChoice(greetings.firstTime) : 
        this.randomChoice(greetings.returning);
    }

    if (analysis.isQuestion) {
      return this.randomChoice(greetings.question);
    }

    return "I'm here to help you with that.";
  }

  /**
   * Generate educational guidance for new users
   */
  generateEducationalGuidance(context: TemplateContext): string {
    const guidanceTemplates = [
      "If you're new to trading, I always recommend starting with comprehensive education. Did you know that 90% of traders lose money simply because they lack the right knowledge? The Trading Academy is the perfect place to build a strong foundation.",
      
      "Education is the key to successful trading. Many traders make costly mistakes by jumping in without understanding the fundamentals. I suggest beginning with our Trading Academy, which covers everything from crypto basics to advanced strategies.",
      
      "Before diving into live trading, it's crucial to understand the fundamentals. The Trading Academy offers structured learning paths that will help you avoid common pitfalls and develop profitable strategies."
    ];

    return this.randomChoice(guidanceTemplates);
  }

  /**
   * Generate route suggestion text
   */
  generateRouteSuggestion(routes: RouteInfo[], intent: string): string {
    if (routes.length === 0) {
      return "Feel free to explore the platform, and let me know if you need directions to any specific features.";
    }

    const primaryRoute = routes[0];
    
    const suggestionTemplates = {
      single: [
        `You can start by visiting the ${primaryRoute.name} where ${primaryRoute.guidance.toLowerCase()}`,
        `I recommend checking out the ${primaryRoute.name}. ${primaryRoute.guidance}`,
        `The ${primaryRoute.name} would be perfect for what you're looking for. ${primaryRoute.guidance}`
      ],
      multiple: [
        `I'd suggest starting with the ${primaryRoute.name}, and you might also find the ${routes[1]?.name} helpful.`,
        `You have a few great options: the ${primaryRoute.name} for ${primaryRoute.description.toLowerCase()}, or the ${routes[1]?.name} for ${routes[1]?.description.toLowerCase()}.`,
        `The ${primaryRoute.name} is a great place to begin, and once you're comfortable there, you can explore the ${routes[1]?.name}.`
      ]
    };

    if (routes.length === 1) {
      return this.randomChoice(suggestionTemplates.single);
    } else {
      return this.randomChoice(suggestionTemplates.multiple);
    }
  }

  /**
   * Generate specific guidance based on user intent
   */
  generateIntentSpecificGuidance(analysis: QuestionAnalysis, context: TemplateContext): string {
    switch (analysis.intent) {
      case 'learning':
        return "Learning is the foundation of successful trading. Our comprehensive educational resources will help you understand market dynamics, risk management, and proven strategies.";
      
      case 'trading':
        return "When it comes to trading, preparation is everything. Make sure you understand the risks and have a solid strategy before placing any trades.";
      
      case 'navigation':
        return "I can help you find exactly what you're looking for. The platform has many powerful features, and I'll guide you to the right ones based on your needs.";
      
      case 'technical':
        return "I understand you're experiencing some technical concerns. Let me help you resolve this so you can get back to focusing on your trading goals.";
      
      default:
        return "I'm here to help you make the most of your Waides KI experience.";
    }
  }

  /**
   * Generate conversational conclusion
   */
  generateConclusion(analysis: QuestionAnalysis, hasRoutes: boolean): string {
    const conclusions = {
      question: [
        "Let me know if you have any other questions!",
        "Feel free to ask if you need clarification on anything else.",
        "I'm here if you need any additional guidance."
      ],
      navigation: [
        "Let me know if you'd like directions to any other features!",
        "Feel free to ask if you need help finding anything else.",
        "I can guide you to any other part of the platform you're interested in."
      ],
      general: [
        "How else can I assist you today?",
        "What would you like to explore next?",
        "Is there anything else I can help you with?"
      ]
    };

    if (analysis.isQuestion) {
      return this.randomChoice(conclusions.question);
    }

    if (analysis.intent === 'navigation' || hasRoutes) {
      return this.randomChoice(conclusions.navigation);
    }

    return this.randomChoice(conclusions.general);
  }

  /**
   * Generate complete professional response
   */
  generateCompleteResponse(
    originalContent: string,
    analysis: QuestionAnalysis,
    context: TemplateContext
  ): string {
    const parts = [];

    // Add greeting if appropriate
    if (analysis.intent === 'greeting' || context.isFirstTime) {
      parts.push(this.generateGreeting(context, analysis));
    }

    // Add intent-specific guidance
    const intentGuidance = this.generateIntentSpecificGuidance(analysis, context);
    if (intentGuidance) {
      parts.push(intentGuidance);
    }

    // Add main content (cleaned original response)
    if (originalContent && originalContent.trim()) {
      parts.push(originalContent);
    }

    // Add educational guidance for new users
    if (analysis.intent === 'learning' || (context.isFirstTime && analysis.intent !== 'technical')) {
      parts.push(this.generateEducationalGuidance(context));
    }

    // Add route suggestions
    if (context.relevantRoutes && context.relevantRoutes.length > 0) {
      parts.push(this.generateRouteSuggestion(context.relevantRoutes, analysis.intent));
    }

    // Add conversational conclusion
    parts.push(this.generateConclusion(analysis, context.relevantRoutes.length > 0));

    // Join parts with proper spacing
    return parts
      .filter(part => part && part.trim())
      .join('\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Generate quick action text
   */
  generateQuickActions(routes: RouteInfo[], analysis: QuestionAnalysis): string[] {
    const actions = [];

    // Add route-specific actions
    routes.slice(0, 2).forEach(route => {
      if (route.quickActions && route.quickActions.length > 0) {
        actions.push(route.quickActions[0]);
      } else {
        actions.push(`Visit ${route.name}`);
      }
    });

    // Add intent-specific actions
    switch (analysis.intent) {
      case 'learning':
        actions.push('Start Learning', 'View Courses');
        break;
      case 'trading':
        actions.push('Check Dashboard', 'View Bots');
        break;
      case 'navigation':
        actions.push('Show Navigation', 'List Features');
        break;
    }

    // Remove duplicates and limit to 4 actions
    return [...new Set(actions)].slice(0, 4);
  }

  /**
   * Generate contextual help text
   */
  generateContextualHelp(analysis: QuestionAnalysis, context: TemplateContext): string {
    const helpTexts = {
      learning: "💡 Tip: Start with basic concepts before moving to advanced strategies. Our Learning Path is designed to build knowledge progressively.",
      trading: "⚠️ Remember: Never trade with money you can't afford to lose. Always use proper risk management.",
      navigation: "🧭 Navigation Tip: Use the main menu or ask me to find specific features quickly.",
      technical: "🔧 Technical Help: Describe the specific issue you're experiencing for targeted assistance.",
      general: "💬 I can help you navigate the platform, learn about trading, or answer questions about features."
    };

    return helpTexts[analysis.intent] || helpTexts.general;
  }

  /**
   * Utility function to randomly select from array
   */
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate personalized response based on user context
   */
  generatePersonalizedResponse(
    originalResponse: string,
    analysis: QuestionAnalysis,
    processingContext: ProcessingContext,
    routes: RouteInfo[]
  ): {
    message: string;
    quickActions: string[];
    contextualHelp: string;
  } {
    const templateContext: TemplateContext = {
      isFirstTime: !processingContext.previousMessages || processingContext.previousMessages.length === 0,
      currentPage: processingContext.currentPath,
      relevantRoutes: routes,
      userIntent: analysis.intent,
      isAuthenticated: processingContext.isAuthenticated
    };

    const message = this.generateCompleteResponse(originalResponse, analysis, templateContext);
    const quickActions = this.generateQuickActions(routes, analysis);
    const contextualHelp = this.generateContextualHelp(analysis, templateContext);

    return {
      message,
      quickActions,
      contextualHelp
    };
  }
}

// Export singleton instance
export const kiChatResponseTemplates = new KiChatResponseTemplates();