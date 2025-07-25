/**
 * Ki Chat Natural Language Processor
 * Transforms markdown-heavy responses into professional, natural conversation
 * Integrates with existing KonsAI and Kons Powa systems for intelligent responses
 */

import { kiChatRouteAwareness, type RouteInfo } from './kiChatRouteAwareness';

export interface QuestionAnalysis {
  isQuestion: boolean;
  questionType: 'how' | 'what' | 'where' | 'why' | 'when' | 'who' | 'can' | 'should' | 'general' | 'none';
  intent: 'navigation' | 'learning' | 'trading' | 'technical' | 'general' | 'greeting';
  confidence: number;
  keywords: string[];
}

export interface NaturalResponse {
  message: string;
  isQuestion: boolean;
  context: string[];
  suggestions: RouteInfo[];
  reasoning: string;
  tone: 'professional' | 'friendly' | 'educational' | 'guidance';
}

export interface ProcessingContext {
  currentPath?: string;
  isAuthenticated: boolean;
  userRole?: string;
  permissions: string[];
  userId?: number;
  previousMessages?: string[];
  userIntent?: string;
}

export class KiChatNaturalProcessor {
  private questionPatterns = {
    how: /\b(how\s+(do|can|does|will|would|should|to)|how's)\b/i,
    what: /\b(what('s|'re)?|what\s+(is|are|does|do|will|would|should|can))\b/i,
    where: /\b(where('s|'re)?|where\s+(is|are|does|do|will|would|should|can))\b/i,
    why: /\b(why('s|'re)?|why\s+(is|are|does|do|will|would|should|can))\b/i,
    when: /\b(when('s|'re)?|when\s+(is|are|does|do|will|would|should|can))\b/i,
    who: /\b(who('s|'re)?|who\s+(is|are|does|do|will|would|should|can))\b/i,
    can: /\b(can\s+i|could\s+i|am\s+i\s+able|is\s+it\s+possible)\b/i,
    should: /\b(should\s+i|ought\s+i|is\s+it\s+better|recommend)\b/i
  };

  private intentPatterns = {
    navigation: /\b(go\s+to|navigate|find|locate|show\s+me|take\s+me|direct\s+me|route|page|section)\b/i,
    learning: /\b(learn|education|tutorial|guide|teach|study|understand|explain|course|academy)\b/i,
    trading: /\b(trade|trading|buy|sell|investment|portfolio|strategy|market|bot|waidbot)\b/i,
    technical: /\b(error|problem|issue|bug|help|support|troubleshoot|fix|broken|not\s+working)\b/i,
    greeting: /\b(hello|hi|hey|good\s+(morning|afternoon|evening)|greetings|start|begin)\b/i
  };

  /**
   * Analyze user input to detect questions and intent
   */
  analyzeQuestion(input: string): QuestionAnalysis {
    const lowerInput = input.toLowerCase().trim();
    
    // Check for question patterns
    let questionType: QuestionAnalysis['questionType'] = 'none';
    let isQuestion = false;
    
    for (const [type, pattern] of Object.entries(this.questionPatterns)) {
      if (pattern.test(lowerInput)) {
        questionType = type as QuestionAnalysis['questionType'];
        isQuestion = true;
        break;
      }
    }
    
    // Additional question detection (question marks, question structure)
    if (!isQuestion) {
      if (lowerInput.includes('?') || 
          lowerInput.startsWith('is ') || 
          lowerInput.startsWith('are ') ||
          lowerInput.startsWith('do ') ||
          lowerInput.startsWith('does ')) {
        isQuestion = true;
        questionType = 'general';
      }
    }

    // Detect intent
    let intent: QuestionAnalysis['intent'] = 'general';
    for (const [intentType, pattern] of Object.entries(this.intentPatterns)) {
      if (pattern.test(lowerInput)) {
        intent = intentType as QuestionAnalysis['intent'];
        break;
      }
    }

    // Extract keywords (remove common words)
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must'];
    const keywords = lowerInput
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 10);

    // Calculate confidence based on pattern matches and structure
    let confidence = 0.5;
    if (isQuestion) confidence += 0.3;
    if (intent !== 'general') confidence += 0.2;
    if (keywords.length > 0) confidence += Math.min(keywords.length * 0.05, 0.2);

    return {
      isQuestion,
      questionType,
      intent,
      confidence: Math.min(confidence, 1.0),
      keywords
    };
  }

  /**
   * Remove markdown formatting and convert to natural text
   */
  removeMarkdown(text: string): string {
    return text
      // Remove headers
      .replace(/#{1,6}\s+/g, '')
      // Remove bold/italic
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove bullet points and convert to natural sentences
      .replace(/^\s*[-•*]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove arrows and formatting symbols
      .replace(/→/g, '')
      .replace(/[\[\]]/g, '')
      // Clean up extra whitespace
      .replace(/\n\s*\n/g, '\n\n')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generate natural, professional response based on analysis
   */
  processResponse(
    originalResponse: string,
    userInput: string,
    analysis: QuestionAnalysis,
    context: ProcessingContext
  ): NaturalResponse {
    // Remove markdown from original response
    let naturalMessage = this.removeMarkdown(originalResponse);
    
    // Get relevant route suggestions based on user input and context
    const suggestions = this.getRelevantRoutes(analysis.keywords, context);
    
    // Enhance response based on question analysis
    naturalMessage = this.enhanceResponseForIntent(naturalMessage, analysis, context);
    
    // Add conversational elements
    naturalMessage = this.addConversationalElements(naturalMessage, analysis);
    
    // Determine tone based on context and intent
    const tone = this.determineTone(analysis, context);
    
    // Generate reasoning for response choice
    const reasoning = this.generateReasoning(analysis, context, suggestions);

    return {
      message: naturalMessage,
      isQuestion: analysis.isQuestion,
      context: this.buildContextArray(context, analysis),
      suggestions,
      reasoning,
      tone
    };
  }

  /**
   * Get relevant routes based on keywords and context
   */
  private getRelevantRoutes(keywords: string[], context: ProcessingContext): RouteInfo[] {
    const allRoutes = kiChatRouteAwareness.getAllSafeRoutes({
      isAuthenticated: context.isAuthenticated,
      userRole: context.userRole,
      permissions: context.permissions
    });

    // Score routes based on keyword relevance
    const scoredRoutes = allRoutes.map(route => {
      let score = 0;
      
      // Check keywords against route properties
      keywords.forEach(keyword => {
        if (route.name.toLowerCase().includes(keyword)) score += 3;
        if (route.description.toLowerCase().includes(keyword)) score += 2;
        if (route.keywords.some(k => k.toLowerCase().includes(keyword))) score += 4;
        if (route.guidance.toLowerCase().includes(keyword)) score += 1;
      });

      return { route, score };
    });

    // Return top 3 most relevant routes
    return scoredRoutes
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.route);
  }

  /**
   * Enhance response based on detected intent
   */
  private enhanceResponseForIntent(
    message: string,
    analysis: QuestionAnalysis,
    context: ProcessingContext
  ): string {
    switch (analysis.intent) {
      case 'greeting':
        return `Hello! I'm your personal guide here at Waides KI. ${message}`;
      
      case 'navigation':
        if (analysis.isQuestion) {
          return `I can help you navigate to the right place. ${message} Let me know if you need directions to any specific features!`;
        }
        return message;
      
      case 'learning':
        return `That's great that you're interested in learning! ${message} Education is crucial for successful trading, and I'm here to guide you through the process.`;
      
      case 'trading':
        if (analysis.isQuestion) {
          return `Regarding your trading question: ${message} Remember, it's important to understand the fundamentals before diving into live trading.`;
        }
        return message;
      
      case 'technical':
        return `I understand you're having a technical concern. ${message} Feel free to describe what specific issue you're experiencing, and I'll help you resolve it.`;
      
      default:
        return message;
    }
  }

  /**
   * Add conversational elements to make response more natural
   */
  private addConversationalElements(message: string, analysis: QuestionAnalysis): string {
    // Add appropriate conversation starters based on question type
    const conversationStarters = {
      how: "Here's how you can approach this: ",
      what: "Let me explain what this involves: ",
      where: "You can find this at: ",
      why: "The reason for this is: ",
      when: "Regarding timing: ",
      who: "This relates to: ",
      can: "Yes, you can do this! ",
      should: "I'd recommend: "
    };

    if (analysis.isQuestion && analysis.questionType !== 'none' && analysis.questionType !== 'general') {
      const starter = conversationStarters[analysis.questionType];
      if (starter && !message.toLowerCase().startsWith(starter.toLowerCase().split(':')[0])) {
        return starter + message;
      }
    }

    return message;
  }

  /**
   * Determine appropriate tone for response
   */
  private determineTone(analysis: QuestionAnalysis, context: ProcessingContext): NaturalResponse['tone'] {
    if (analysis.intent === 'learning') return 'educational';
    if (analysis.intent === 'greeting') return 'friendly';
    if (analysis.intent === 'navigation' || analysis.intent === 'technical') return 'guidance';
    return 'professional';
  }

  /**
   * Generate reasoning for why this response was chosen
   */
  private generateReasoning(
    analysis: QuestionAnalysis,
    context: ProcessingContext,
    suggestions: RouteInfo[]
  ): string {
    const reasons = [];
    
    if (analysis.isQuestion) {
      reasons.push(`Detected ${analysis.questionType} question about ${analysis.intent}`);
    }
    
    if (suggestions.length > 0) {
      reasons.push(`Found ${suggestions.length} relevant route suggestions`);
    }
    
    if (context.isAuthenticated) {
      reasons.push("User is authenticated - providing full feature access");
    } else {
      reasons.push("User not authenticated - providing public route guidance");
    }
    
    return reasons.join('; ');
  }

  /**
   * Build context array for response tracking
   */
  private buildContextArray(context: ProcessingContext, analysis: QuestionAnalysis): string[] {
    const contextArray = [];
    
    if (context.currentPath) contextArray.push(`Current path: ${context.currentPath}`);
    if (analysis.intent) contextArray.push(`Intent: ${analysis.intent}`);
    if (analysis.questionType !== 'none') contextArray.push(`Question type: ${analysis.questionType}`);
    if (context.userRole) contextArray.push(`User role: ${context.userRole}`);
    
    return contextArray;
  }
}

// Export singleton instance
export const kiChatNaturalProcessor = new KiChatNaturalProcessor();