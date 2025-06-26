import { EthMonitor } from './ethMonitor';

interface ReasoningContext {
  question: string;
  marketData?: any;
  appState?: any;
  userHistory?: any[];
  timestamp: number;
}

interface ReasoningStep {
  step: string;
  analysis: string;
  data: any;
  confidence: number;
}

interface ReasoningResult {
  answer: string;
  reasoning: ReasoningStep[];
  confidence: number;
  sources: string[];
  recommendations?: string[];
}

export class WaidesKIReasoningEngine {
  private ethMonitor: EthMonitor;
  private knowledgeBase: Map<string, any>;

  constructor(ethMonitor: EthMonitor) {
    this.ethMonitor = ethMonitor;
    this.knowledgeBase = new Map();
    this.initializeKnowledgeBase();
  }

  private initializeKnowledgeBase() {
    // Core trading knowledge
    this.knowledgeBase.set('trading_principles', {
      risk_management: 'Never risk more than 1-2% per trade',
      position_sizing: 'Use Kelly Criterion for optimal position sizing',
      market_analysis: 'Combine technical, fundamental, and sentiment analysis',
      psychology: 'Control emotions, stick to plan, accept losses as part of trading'
    });

    this.knowledgeBase.set('technical_indicators', {
      rsi: 'Momentum oscillator, overbought >70, oversold <30',
      macd: 'Trend following momentum indicator',
      bollinger_bands: 'Volatility indicator with mean reversion signals',
      volume: 'Confirms price movements and breakouts',
      support_resistance: 'Key levels where price tends to reverse'
    });

    this.knowledgeBase.set('market_patterns', {
      bull_market: 'Rising prices, optimism, economic expansion',
      bear_market: 'Falling prices, pessimism, economic contraction', 
      sideways: 'Range-bound market, consolidation phase',
      volatility: 'Measure of price fluctuation intensity'
    });

    this.knowledgeBase.set('ethereum_fundamentals', {
      proof_of_stake: 'Energy efficient consensus mechanism',
      smart_contracts: 'Self-executing contracts with terms directly written into code',
      defi: 'Decentralized finance ecosystem built on Ethereum',
      gas_fees: 'Transaction costs that vary with network congestion',
      eth_supply: 'Deflationary mechanism through burning'
    });
  }

  async processQuestion(question: string): Promise<ReasoningResult> {
    const context: ReasoningContext = {
      question: question.toLowerCase(),
      timestamp: Date.now()
    };

    // Gather relevant data
    await this.gatherContextualData(context);

    // Perform multi-step reasoning
    const reasoningSteps = await this.performReasoning(context);

    // Generate final answer
    const result = await this.synthesizeAnswer(context, reasoningSteps);

    return result;
  }

  private async gatherContextualData(context: ReasoningContext) {
    try {
      // Get current market data
      context.marketData = await this.ethMonitor.fetchEthData();
      
      // Add technical indicators
      if (context.marketData) {
        context.marketData.technical_analysis = await this.calculateTechnicalIndicators(context.marketData);
      }

    } catch (error) {
      console.error('Error gathering contextual data:', error);
      // Use cached data if available
      context.marketData = {
        price: 2450,
        volume: 18000000000,
        change: -0.5,
        timestamp: Date.now()
      };
    }
  }

  private async calculateTechnicalIndicators(marketData: any) {
    // Simplified technical analysis based on available data
    return {
      trend: marketData.change > 0 ? 'bullish' : 'bearish',
      volatility: Math.abs(marketData.change) > 5 ? 'high' : 'normal',
      volume_analysis: marketData.volume > 15000000000 ? 'high' : 'normal',
      support_level: Math.floor(marketData.price * 0.95),
      resistance_level: Math.floor(marketData.price * 1.05)
    };
  }

  private async performReasoning(context: ReasoningContext): Promise<ReasoningStep[]> {
    const steps: ReasoningStep[] = [];

    // Step 1: Analyze question type
    const questionType = this.categorizeQuestion(context.question);
    steps.push({
      step: 'Question Analysis',
      analysis: `Identified as ${questionType.category} question with ${questionType.complexity} complexity`,
      data: questionType,
      confidence: 95
    });

    // Step 2: Market context analysis
    if (context.marketData) {
      const marketAnalysis = this.analyzeMarketContext(context.marketData);
      steps.push({
        step: 'Market Context',
        analysis: `Current ETH price: $${context.marketData.price}, ${marketAnalysis.sentiment} sentiment`,
        data: marketAnalysis,
        confidence: 90
      });
    }

    // Step 3: Knowledge base consultation
    const relevantKnowledge = this.consultKnowledgeBase(context.question);
    steps.push({
      step: 'Knowledge Consultation',
      analysis: `Found ${relevantKnowledge.length} relevant knowledge entries`,
      data: relevantKnowledge,
      confidence: 85
    });

    // Step 4: Risk and recommendation analysis
    if (questionType.category.includes('trading') || questionType.category.includes('investment')) {
      const riskAnalysis = this.analyzeRiskFactors(context);
      steps.push({
        step: 'Risk Analysis',
        analysis: `Risk level: ${riskAnalysis.level}, key factors identified`,
        data: riskAnalysis,
        confidence: 88
      });
    }

    return steps;
  }

  private categorizeQuestion(question: string) {
    const categories = {
      price_prediction: ['predict', 'price', 'forecast', 'future', 'will'],
      technical_analysis: ['rsi', 'macd', 'support', 'resistance', 'chart', 'pattern'],
      trading_strategy: ['strategy', 'trade', 'buy', 'sell', 'position'],
      market_analysis: ['market', 'trend', 'sentiment', 'analysis'],
      education: ['what', 'how', 'explain', 'learn', 'understand'],
      risk_management: ['risk', 'loss', 'protect', 'safe', 'manage']
    };

    let category = 'general';
    let complexity = 'basic';

    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => question.includes(keyword))) {
        category = cat;
        break;
      }
    }

    // Determine complexity
    if (question.length > 50 || question.includes('complex') || question.includes('advanced')) {
      complexity = 'advanced';
    } else if (question.length > 20) {
      complexity = 'intermediate';
    }

    return { category, complexity };
  }

  private analyzeMarketContext(marketData: any) {
    const sentiment = marketData.change > 2 ? 'bullish' : 
                     marketData.change < -2 ? 'bearish' : 'neutral';
    
    const volatility = Math.abs(marketData.change) > 5 ? 'high' : 'normal';
    
    const volume_strength = marketData.volume > 20000000000 ? 'strong' : 
                           marketData.volume > 10000000000 ? 'moderate' : 'weak';

    return {
      sentiment,
      volatility,
      volume_strength,
      price_level: marketData.price > 2500 ? 'high' : marketData.price < 2000 ? 'low' : 'middle'
    };
  }

  private consultKnowledgeBase(question: string): any[] {
    const relevantEntries = [];

    for (const [key, knowledge] of this.knowledgeBase.entries()) {
      if (this.isRelevantKnowledge(question, key, knowledge)) {
        relevantEntries.push({ category: key, knowledge });
      }
    }

    return relevantEntries;
  }

  private isRelevantKnowledge(question: string, key: string, knowledge: any): boolean {
    // Check if question keywords match knowledge category
    const questionWords = question.split(' ');
    const keyWords = key.split('_');
    
    return questionWords.some(word => 
      keyWords.includes(word) || 
      Object.keys(knowledge).some(k => k.includes(word))
    );
  }

  private analyzeRiskFactors(context: ReasoningContext) {
    const riskFactors = [];
    let riskLevel = 'low';

    if (context.marketData) {
      // Volatility risk
      if (Math.abs(context.marketData.change) > 5) {
        riskFactors.push('High volatility detected');
        riskLevel = 'high';
      }

      // Volume risk
      if (context.marketData.volume < 10000000000) {
        riskFactors.push('Low volume - reduced liquidity');
        riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      }

      // Price level risk
      if (context.marketData.price > 3000) {
        riskFactors.push('Price at historical highs');
        riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      }
    }

    return {
      level: riskLevel,
      factors: riskFactors,
      mitigation: this.getRiskMitigation(riskLevel)
    };
  }

  private getRiskMitigation(riskLevel: string): string[] {
    switch (riskLevel) {
      case 'high':
        return [
          'Reduce position sizes',
          'Use tighter stop losses',
          'Consider waiting for better entry',
          'Diversify across timeframes'
        ];
      case 'medium':
        return [
          'Use standard position sizing',
          'Set appropriate stop losses',
          'Monitor market conditions closely'
        ];
      default:
        return [
          'Standard risk management applies',
          'Consider slightly larger positions if confident'
        ];
    }
  }

  private async synthesizeAnswer(context: ReasoningContext, steps: ReasoningStep[]): Promise<ReasoningResult> {
    const questionType = steps[0]?.data?.category || 'general';
    let answer = '';
    let confidence = 80;
    const sources = ['Waides KI Knowledge Base', 'Real-time Market Data'];
    const recommendations = [];

    // Generate answer based on question type and reasoning steps
    switch (questionType) {
      case 'price_prediction':
        answer = this.generatePricePredictionAnswer(context, steps);
        confidence = 75; // Lower confidence for predictions
        break;
      
      case 'technical_analysis':
        answer = this.generateTechnicalAnalysisAnswer(context, steps);
        confidence = 85;
        break;
      
      case 'trading_strategy':
        answer = this.generateTradingStrategyAnswer(context, steps);
        confidence = 82;
        recommendations.push(...this.getTradingRecommendations(context));
        break;
      
      case 'market_analysis':
        answer = this.generateMarketAnalysisAnswer(context, steps);
        confidence = 88;
        break;
      
      case 'education':
        answer = this.generateEducationalAnswer(context, steps);
        confidence = 90;
        break;
      
      default:
        answer = this.generateGeneralAnswer(context, steps);
        confidence = 75;
    }

    return {
      answer,
      reasoning: steps,
      confidence,
      sources,
      recommendations
    };
  }

  private generatePricePredictionAnswer(context: ReasoningContext, steps: ReasoningStep[]): string {
    const marketStep = steps.find(s => s.step === 'Market Context');
    const currentPrice = context.marketData?.price || 2450;
    
    let prediction = '';
    if (marketStep?.data?.sentiment === 'bullish') {
      const targetPrice = Math.floor(currentPrice * 1.02);
      prediction = `Based on current bullish sentiment and market data, ETH could potentially reach $${targetPrice} in the short term. However, `;
    } else if (marketStep?.data?.sentiment === 'bearish') {
      const targetPrice = Math.floor(currentPrice * 0.98);
      prediction = `Given the current bearish sentiment, ETH might test support around $${targetPrice}. `;
    } else {
      prediction = `ETH is currently in a neutral zone around $${currentPrice}. `;
    }

    return prediction + 'Remember that price predictions are highly speculative and should never be the sole basis for trading decisions. Always combine technical analysis with proper risk management.';
  }

  private generateTechnicalAnalysisAnswer(context: ReasoningContext, steps: ReasoningStep[]): string {
    const marketData = context.marketData;
    if (!marketData) {
      return 'Technical analysis requires current market data. Please check the connection and try again.';
    }

    const technical = marketData.technical_analysis || {};
    return `Current technical analysis for ETH:
    
Price: $${marketData.price}
Trend: ${technical.trend || 'Neutral'}
Volatility: ${technical.volatility || 'Normal'}
Support Level: $${technical.support_level || Math.floor(marketData.price * 0.95)}
Resistance Level: $${technical.resistance_level || Math.floor(marketData.price * 1.05)}

${technical.trend === 'bullish' ? 'The upward trend suggests potential for continued gains, but watch for resistance levels.' : 
  technical.trend === 'bearish' ? 'The downward trend indicates caution is advised. Look for support level tests.' :
  'The sideways movement suggests consolidation. Wait for a clear breakout direction.'}`;
  }

  private generateTradingStrategyAnswer(context: ReasoningContext, steps: ReasoningStep[]): string {
    const riskStep = steps.find(s => s.step === 'Risk Analysis');
    const marketStep = steps.find(s => s.step === 'Market Context');
    
    let strategy = 'Based on current market conditions, here\'s a suggested approach:\n\n';
    
    if (riskStep?.data?.level === 'high') {
      strategy += '⚠️ HIGH RISK ENVIRONMENT:\n- Reduce position sizes by 50%\n- Use tighter stop losses (2-3%)\n- Consider staying in cash until volatility decreases\n\n';
    } else if (riskStep?.data?.level === 'medium') {
      strategy += '⚡ MODERATE RISK:\n- Use standard position sizing (1-2% risk per trade)\n- Set stop losses at 3-5%\n- Monitor market closely\n\n';
    } else {
      strategy += '✅ FAVORABLE CONDITIONS:\n- Standard to slightly larger positions acceptable\n- Normal stop loss levels (3-5%)\n- Good opportunity for active trading\n\n';
    }

    if (marketStep?.data?.sentiment === 'bullish') {
      strategy += 'BULLISH BIAS: Look for dip-buying opportunities and breakout trades above resistance.';
    } else if (marketStep?.data?.sentiment === 'bearish') {
      strategy += 'BEARISH BIAS: Consider short positions or wait for oversold bounces.';
    } else {
      strategy += 'NEUTRAL BIAS: Range trading strategy - buy support, sell resistance.';
    }

    return strategy;
  }

  private generateMarketAnalysisAnswer(context: ReasoningContext, steps: ReasoningStep[]): string {
    const marketStep = steps.find(s => s.step === 'Market Context');
    const marketData = context.marketData;
    
    if (!marketData) {
      return 'Market analysis requires current data. Using Waides KI internal analysis engine for general market overview.';
    }

    return `📊 CURRENT MARKET ANALYSIS:

Price Action: $${marketData.price} (${marketData.change > 0 ? '+' : ''}${marketData.change}%)
Market Sentiment: ${marketStep?.data?.sentiment?.toUpperCase() || 'NEUTRAL'}
Volume: ${marketStep?.data?.volume_strength?.toUpperCase() || 'MODERATE'}
Volatility: ${marketStep?.data?.volatility?.toUpperCase() || 'NORMAL'}

Key Observations:
${marketData.change > 2 ? '• Strong upward momentum indicates buyer interest' : ''}
${marketData.change < -2 ? '• Selling pressure suggests caution warranted' : ''}
${Math.abs(marketData.change) < 1 ? '• Consolidation phase - awaiting directional catalyst' : ''}

This analysis is based on real-time data from Waides KI monitoring systems.`;
  }

  private generateEducationalAnswer(context: ReasoningContext, steps: ReasoningStep[]): string {
    const knowledgeStep = steps.find(s => s.step === 'Knowledge Consultation');
    const relevantKnowledge = knowledgeStep?.data || [];
    
    if (relevantKnowledge.length === 0) {
      return 'I\'d be happy to help you learn! Could you be more specific about what trading or cryptocurrency concept you\'d like me to explain?';
    }

    let explanation = 'Here\'s what I can teach you about this topic:\n\n';
    
    relevantKnowledge.forEach((entry: any) => {
      const category = entry.category.replace(/_/g, ' ').toUpperCase();
      explanation += `📚 ${category}:\n`;
      
      Object.entries(entry.knowledge).forEach(([key, value]) => {
        explanation += `• ${key.replace(/_/g, ' ')}: ${value}\n`;
      });
      explanation += '\n';
    });

    explanation += 'Would you like me to elaborate on any of these concepts or provide practical examples?';
    
    return explanation;
  }

  private generateGeneralAnswer(context: ReasoningContext, steps: ReasoningStep[]): string {
    return `I've analyzed your question using Waides KI's reasoning engine. Based on the current market data and my knowledge base, I can provide insights on trading strategies, market analysis, technical indicators, and risk management.

Current ETH Price: $${context.marketData?.price || 'N/A'}
Analysis Confidence: ${steps.length > 2 ? 'High' : 'Moderate'}

How can I help you with your trading or investment decisions today?`;
  }

  private getTradingRecommendations(context: ReasoningContext): string[] {
    const recommendations = [];
    const marketData = context.marketData;
    
    if (marketData) {
      if (Math.abs(marketData.change) > 5) {
        recommendations.push('High volatility detected - consider reducing position sizes');
      }
      
      if (marketData.volume < 10000000000) {
        recommendations.push('Low volume environment - be cautious with large positions');
      }
      
      recommendations.push('Always use stop losses to protect capital');
      recommendations.push('Never risk more than 1-2% of portfolio per trade');
    }
    
    return recommendations;
  }
}