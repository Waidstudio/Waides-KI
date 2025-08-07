/**
 * Psychology Indicators - Fear/Greed and Market Sentiment Analysis
 * Provides psychological market indicators for all 6 trading entities
 */

export interface FearGreedIndex {
  value: number;              // 0-100 scale (0 = extreme fear, 100 = extreme greed)
  level: 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed';
  timestamp: Date;
  components: FearGreedComponents;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  historicalPercentile: number;
}

export interface FearGreedComponents {
  volatility: number;         // 0-100
  marketMomentum: number;     // 0-100  
  socialSentiment: number;    // 0-100
  surveys: number;            // 0-100
  dominance: number;          // 0-100
  trends: number;             // 0-100
  safeHaven: number;          // 0-100
}

export interface MarketSentiment {
  overall: number;            // -1 to 1 scale
  bullish: number;           // 0-1 probability
  bearish: number;           // 0-1 probability
  neutral: number;           // 0-1 probability
  confidence: number;        // 0-1 confidence in sentiment
  sources: SentimentSource[];
  timestamp: Date;
  trend: 'improving' | 'deteriorating' | 'stable';
}

export interface SentimentSource {
  source: 'news' | 'social' | 'options' | 'flows' | 'technical';
  value: number;             // -1 to 1
  weight: number;            // 0-1 importance weight
  freshness: number;         // 0-1 how recent the data is
  reliability: number;       // 0-1 historical reliability
}

export interface PsychologicalProfile {
  entity: string;
  riskTolerance: number;     // 0-1 scale
  lossAversion: number;      // 0-1 scale (higher = more loss averse)
  overconfidenceBias: number; // 0-1 scale
  herdMentality: number;     // 0-1 scale
  panicThreshold: number;    // 0-1 scale
  greedThreshold: number;    // 0-1 scale
  lastUpdated: Date;
  behaviorPattern: 'conservative' | 'balanced' | 'aggressive' | 'erratic';
}

export interface TradingPsychologyAlert {
  id: string;
  entity: string;
  alertType: 'extreme_fear' | 'extreme_greed' | 'panic_selling' | 'euphoria_buying' | 'herd_behavior' | 'contrarian_opportunity';
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
  triggeredAt: Date;
  isActive: boolean;
  marketConditions: {
    fearGreedIndex: number;
    sentiment: number;
    volatility: number;
  };
}

export class PsychologyIndicators {
  private fearGreedHistory: FearGreedIndex[] = [];
  private sentimentHistory: MarketSentiment[] = [];
  private entityProfiles = new Map<string, PsychologicalProfile>();
  private activeAlerts = new Map<string, TradingPsychologyAlert>();
  
  private readonly MAX_HISTORY_SIZE = 10000;
  private readonly UPDATE_FREQUENCY = 60000; // 1 minute
  
  constructor() {
    this.initializeEntityProfiles();
    this.startDataCollection();
    console.log('🧠 Psychology Indicators initialized with fear/greed and sentiment analysis');
  }

  private initializeEntityProfiles(): void {
    const entities = ['alpha', 'beta', 'gamma', 'omega', 'delta', 'epsilon'];
    
    const profileConfigs = {
      alpha: {
        riskTolerance: 0.4,
        lossAversion: 0.7,
        overconfidenceBias: 0.3,
        herdMentality: 0.6,
        panicThreshold: 0.3,
        greedThreshold: 0.7,
        behaviorPattern: 'conservative' as const
      },
      beta: {
        riskTolerance: 0.6,
        lossAversion: 0.5,
        overconfidenceBias: 0.4,
        herdMentality: 0.5,
        panicThreshold: 0.4,
        greedThreshold: 0.6,
        behaviorPattern: 'balanced' as const
      },
      gamma: {
        riskTolerance: 0.8,
        lossAversion: 0.3,
        overconfidenceBias: 0.6,
        herdMentality: 0.2,
        panicThreshold: 0.6,
        greedThreshold: 0.4,
        behaviorPattern: 'aggressive' as const
      },
      omega: {
        riskTolerance: 0.7,
        lossAversion: 0.4,
        overconfidenceBias: 0.2,
        herdMentality: 0.1,
        panicThreshold: 0.7,
        greedThreshold: 0.3,
        behaviorPattern: 'balanced' as const
      },
      delta: {
        riskTolerance: 0.5,
        lossAversion: 0.6,
        overconfidenceBias: 0.5,
        herdMentality: 0.4,
        panicThreshold: 0.5,
        greedThreshold: 0.5,
        behaviorPattern: 'balanced' as const
      },
      epsilon: {
        riskTolerance: 0.2,
        lossAversion: 0.8,
        overconfidenceBias: 0.1,
        herdMentality: 0.3,
        panicThreshold: 0.2,
        greedThreshold: 0.8,
        behaviorPattern: 'conservative' as const
      }
    };

    entities.forEach(entity => {
      const config = profileConfigs[entity as keyof typeof profileConfigs];
      const profile: PsychologicalProfile = {
        entity,
        ...config,
        lastUpdated: new Date()
      };
      
      this.entityProfiles.set(entity, profile);
    });

    console.log(`🧠 Initialized psychological profiles for ${entities.length} entities`);
  }

  public calculateFearGreedIndex(
    marketData: {
      volatility: number;
      volume: number;
      price: number;
      momentum: number;
    }
  ): FearGreedIndex {
    
    // Calculate individual components
    const components: FearGreedComponents = {
      volatility: this.calculateVolatilityComponent(marketData.volatility),
      marketMomentum: this.calculateMomentumComponent(marketData.momentum),
      socialSentiment: this.calculateSocialSentimentComponent(),
      surveys: this.calculateSurveysComponent(),
      dominance: this.calculateDominanceComponent(),
      trends: this.calculateTrendsComponent(marketData.price),
      safeHaven: this.calculateSafeHavenComponent()
    };

    // Weight components (some are more important than others)
    const weights = {
      volatility: 0.25,
      marketMomentum: 0.20,
      socialSentiment: 0.15,
      surveys: 0.10,
      dominance: 0.10,
      trends: 0.10,
      safeHaven: 0.10
    };

    // Calculate weighted average
    const weightedSum = Object.keys(components).reduce((sum, key) => {
      const componentKey = key as keyof FearGreedComponents;
      const componentValue = components[componentKey];
      const weight = weights[componentKey];
      return sum + (componentValue * weight);
    }, 0);

    const value = Math.round(Math.max(0, Math.min(100, weightedSum)));
    
    // Determine level
    let level: FearGreedIndex['level'];
    if (value <= 20) level = 'extreme_fear';
    else if (value <= 40) level = 'fear';
    else if (value <= 60) level = 'neutral';
    else if (value <= 80) level = 'greed';
    else level = 'extreme_greed';

    // Calculate trend
    const recentHistory = this.fearGreedHistory.slice(-10);
    const trend = this.calculateTrend(recentHistory.map(h => h.value), value);

    // Calculate historical percentile
    const historicalPercentile = this.calculateHistoricalPercentile(value);

    const fearGreedIndex: FearGreedIndex = {
      value,
      level,
      timestamp: new Date(),
      components,
      confidence: this.calculateFearGreedConfidence(components),
      trend,
      historicalPercentile
    };

    // Store in history
    this.storeFearGreedHistory(fearGreedIndex);

    return fearGreedIndex;
  }

  private calculateVolatilityComponent(volatility: number): number {
    // High volatility = fear, low volatility = greed
    // Normalize volatility to 0-100 scale (inverted)
    const normalizedVolatility = Math.max(0, Math.min(1, volatility * 10)); // Assume volatility is 0-0.1
    return (1 - normalizedVolatility) * 100;
  }

  private calculateMomentumComponent(momentum: number): number {
    // Positive momentum = greed, negative momentum = fear
    // Normalize momentum to 0-100 scale
    const normalizedMomentum = (momentum + 1) / 2; // Assume momentum is -1 to 1
    return Math.max(0, Math.min(100, normalizedMomentum * 100));
  }

  private calculateSocialSentimentComponent(): number {
    // Simulated social sentiment (would integrate with social media APIs)
    const baseSentiment = 50;
    const noise = (Math.random() - 0.5) * 30;
    return Math.max(0, Math.min(100, baseSentiment + noise));
  }

  private calculateSurveysComponent(): number {
    // Simulated survey data (would integrate with actual sentiment surveys)
    return Math.random() * 100;
  }

  private calculateDominanceComponent(): number {
    // Market dominance indicators (simulated)
    return 45 + (Math.random() - 0.5) * 20;
  }

  private calculateTrendsComponent(price: number): number {
    // Price trend analysis
    const recentPrices = this.getRecentPrices(); // Would get from market data
    if (recentPrices.length < 5) return 50;

    const trend = this.calculatePriceTrend(recentPrices);
    return Math.max(0, Math.min(100, (trend + 1) * 50));
  }

  private calculateSafeHavenComponent(): number {
    // Safe haven demand (bonds, gold, etc.)
    return 50 + (Math.random() - 0.5) * 40;
  }

  private calculateFearGreedConfidence(components: FearGreedComponents): number {
    // Calculate confidence based on component consistency
    const values = Object.values(components);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation = higher confidence
    const confidence = Math.max(0.5, 1 - (stdDev / 50));
    return confidence;
  }

  public calculateMarketSentiment(
    marketData: {
      price: number;
      volume: number;
      volatility: number;
    }
  ): MarketSentiment {
    
    // Gather sentiment from multiple sources
    const sources: SentimentSource[] = [
      {
        source: 'news',
        value: this.calculateNewsSentiment(),
        weight: 0.3,
        freshness: 0.9,
        reliability: 0.8
      },
      {
        source: 'social',
        value: this.calculateSocialSentiment(),
        weight: 0.2,
        freshness: 0.95,
        reliability: 0.6
      },
      {
        source: 'options',
        value: this.calculateOptionsSentiment(),
        weight: 0.2,
        freshness: 0.8,
        reliability: 0.9
      },
      {
        source: 'flows',
        value: this.calculateFlowsSentiment(),
        weight: 0.15,
        freshness: 0.7,
        reliability: 0.85
      },
      {
        source: 'technical',
        value: this.calculateTechnicalSentiment(marketData),
        weight: 0.15,
        freshness: 1.0,
        reliability: 0.75
      }
    ];

    // Calculate weighted sentiment
    let totalWeight = 0;
    let weightedSentiment = 0;

    sources.forEach(source => {
      const effectiveWeight = source.weight * source.freshness * source.reliability;
      weightedSentiment += source.value * effectiveWeight;
      totalWeight += effectiveWeight;
    });

    const overall = totalWeight > 0 ? weightedSentiment / totalWeight : 0;
    
    // Convert to probabilities
    const bullish = Math.max(0, overall);
    const bearish = Math.max(0, -overall);
    const neutral = 1 - Math.abs(overall);

    // Calculate confidence
    const confidence = this.calculateSentimentConfidence(sources);

    // Determine trend
    const recentSentiments = this.sentimentHistory.slice(-10);
    const trend = this.calculateSentimentTrend(recentSentiments, overall);

    const sentiment: MarketSentiment = {
      overall,
      bullish,
      bearish,
      neutral,
      confidence,
      sources,
      timestamp: new Date(),
      trend
    };

    // Store in history
    this.storeSentimentHistory(sentiment);

    return sentiment;
  }

  private calculateNewsSentiment(): number {
    // Simulated news sentiment (would integrate with news APIs)
    return (Math.random() - 0.5) * 2; // -1 to 1
  }

  private calculateSocialSentiment(): number {
    // Simulated social sentiment
    return (Math.random() - 0.5) * 2;
  }

  private calculateOptionsSentiment(): number {
    // Put/call ratios and options sentiment
    const putCallRatio = 0.5 + Math.random() * 1.0; // 0.5 to 1.5
    return Math.tanh((1 - putCallRatio) * 2); // Convert to -1 to 1 scale
  }

  private calculateFlowsSentiment(): number {
    // Money flows sentiment
    return (Math.random() - 0.5) * 1.5;
  }

  private calculateTechnicalSentiment(marketData: { price: number; volume: number; volatility: number }): number {
    // Technical indicators sentiment
    let sentiment = 0;
    
    // Volume sentiment
    const avgVolume = 100000; // Simulated average
    const volumeSentiment = Math.tanh((marketData.volume - avgVolume) / avgVolume);
    sentiment += volumeSentiment * 0.4;
    
    // Volatility sentiment (high volatility = fear)
    const volSentiment = -Math.tanh(marketData.volatility * 10);
    sentiment += volSentiment * 0.6;
    
    return Math.max(-1, Math.min(1, sentiment));
  }

  private calculateSentimentConfidence(sources: SentimentSource[]): number {
    // Calculate confidence based on source reliability and consistency
    const reliabilities = sources.map(s => s.reliability);
    const avgReliability = reliabilities.reduce((a, b) => a + b, 0) / reliabilities.length;
    
    const sentiments = sources.map(s => s.value);
    const consistency = this.calculateConsistency(sentiments);
    
    return (avgReliability + consistency) / 2;
  }

  public analyzeEntityPsychology(
    entity: string,
    recentTrades: Array<{
      profit: number;
      confidence: number;
      marketCondition: string;
      timestamp: Date;
    }>
  ): {
    profile: PsychologicalProfile;
    riskAdjustment: number;
    recommendations: string[];
    behaviorInsights: string[];
  } {
    
    const profile = this.entityProfiles.get(entity);
    if (!profile) {
      throw new Error(`No psychological profile found for entity: ${entity}`);
    }

    // Analyze recent trading behavior
    const behaviorAnalysis = this.analyzeRecentBehavior(recentTrades, profile);
    
    // Calculate risk adjustment based on current psychology
    const riskAdjustment = this.calculateRiskAdjustment(profile, behaviorAnalysis);
    
    // Generate recommendations
    const recommendations = this.generatePsychologyRecommendations(profile, behaviorAnalysis);
    
    // Generate behavior insights
    const behaviorInsights = this.generateBehaviorInsights(profile, behaviorAnalysis);

    return {
      profile,
      riskAdjustment,
      recommendations,
      behaviorInsights
    };
  }

  private analyzeRecentBehavior(
    recentTrades: Array<{
      profit: number;
      confidence: number;
      marketCondition: string;
      timestamp: Date;
    }>,
    profile: PsychologicalProfile
  ): {
    winRate: number;
    avgProfit: number;
    overconfidenceSignals: number;
    panicSignals: number;
    greedSignals: number;
  } {
    
    if (recentTrades.length === 0) {
      return {
        winRate: 0.5,
        avgProfit: 0,
        overconfidenceSignals: 0,
        panicSignals: 0,
        greedSignals: 0
      };
    }

    const wins = recentTrades.filter(t => t.profit > 0).length;
    const winRate = wins / recentTrades.length;
    const avgProfit = recentTrades.reduce((sum, t) => sum + t.profit, 0) / recentTrades.length;

    // Detect psychological signals
    let overconfidenceSignals = 0;
    let panicSignals = 0;
    let greedSignals = 0;

    recentTrades.forEach((trade, index) => {
      // Overconfidence: high confidence after wins
      if (index > 0 && recentTrades[index - 1].profit > 0 && trade.confidence > 0.8) {
        overconfidenceSignals++;
      }

      // Panic: low confidence after losses in volatile conditions
      if (trade.profit < 0 && trade.confidence < 0.3 && trade.marketCondition === 'volatile') {
        panicSignals++;
      }

      // Greed: very large position sizes or high confidence in trending markets
      if (trade.confidence > 0.9 && trade.marketCondition === 'bull') {
        greedSignals++;
      }
    });

    return {
      winRate,
      avgProfit,
      overconfidenceSignals: overconfidenceSignals / recentTrades.length,
      panicSignals: panicSignals / recentTrades.length,
      greedSignals: greedSignals / recentTrades.length
    };
  }

  private calculateRiskAdjustment(
    profile: PsychologicalProfile,
    behavior: {
      winRate: number;
      overconfidenceSignals: number;
      panicSignals: number;
      greedSignals: number;
    }
  ): number {
    
    let adjustment = 1.0; // Base multiplier

    // Adjust for overconfidence
    if (behavior.overconfidenceSignals > profile.overconfidenceBias) {
      adjustment *= 0.8; // Reduce risk when overconfident
    }

    // Adjust for panic signals
    if (behavior.panicSignals > profile.panicThreshold) {
      adjustment *= 0.6; // Significantly reduce risk when panicking
    }

    // Adjust for greed signals
    if (behavior.greedSignals > profile.greedThreshold) {
      adjustment *= 0.7; // Reduce risk when too greedy
    }

    // Adjust for win rate vs expectations
    if (behavior.winRate > 0.7) {
      adjustment *= 0.9; // Reduce risk if winning too much (regression to mean)
    } else if (behavior.winRate < 0.3) {
      adjustment *= 0.5; // Significantly reduce risk if losing too much
    }

    return Math.max(0.1, Math.min(2.0, adjustment));
  }

  private generatePsychologyRecommendations(
    profile: PsychologicalProfile,
    behavior: any
  ): string[] {
    
    const recommendations: string[] = [];

    if (behavior.overconfidenceSignals > 0.3) {
      recommendations.push('Reduce position sizes after winning streaks to counter overconfidence bias');
    }

    if (behavior.panicSignals > 0.2) {
      recommendations.push('Implement automated stop-losses to prevent panic-driven decisions');
    }

    if (behavior.greedSignals > 0.3) {
      recommendations.push('Set profit targets and stick to them to avoid greed-driven overextension');
    }

    if (profile.lossAversion > 0.6) {
      recommendations.push('Focus on risk-adjusted returns rather than absolute profits');
    }

    if (profile.herdMentality > 0.5) {
      recommendations.push('Consider contrarian signals when market sentiment is extreme');
    }

    return recommendations;
  }

  private generateBehaviorInsights(profile: PsychologicalProfile, behavior: any): string[] {
    const insights: string[] = [];

    insights.push(`Entity exhibits ${profile.behaviorPattern} trading behavior`);
    insights.push(`Risk tolerance: ${(profile.riskTolerance * 100).toFixed(0)}%`);
    insights.push(`Loss aversion: ${(profile.lossAversion * 100).toFixed(0)}%`);

    if (behavior.overconfidenceSignals > 0.2) {
      insights.push('Showing signs of overconfidence after recent wins');
    }

    if (behavior.panicSignals > 0.1) {
      insights.push('Displaying panic behavior during market stress');
    }

    return insights;
  }

  public checkPsychologyAlerts(
    entity: string,
    currentFearGreed: number,
    currentSentiment: number,
    marketVolatility: number
  ): TradingPsychologyAlert[] {
    
    const alerts: TradingPsychologyAlert[] = [];
    const profile = this.entityProfiles.get(entity);
    if (!profile) return alerts;

    // Extreme fear/greed alerts
    if (currentFearGreed <= 10) {
      alerts.push(this.createPsychologyAlert(
        entity,
        'extreme_fear',
        'high',
        'Market in extreme fear - potential contrarian opportunity',
        'Consider increasing positions gradually as fear creates opportunities',
        { fearGreedIndex: currentFearGreed, sentiment: currentSentiment, volatility: marketVolatility }
      ));
    } else if (currentFearGreed >= 90) {
      alerts.push(this.createPsychologyAlert(
        entity,
        'extreme_greed',
        'high',
        'Market in extreme greed - risk of correction',
        'Consider reducing positions and taking profits',
        { fearGreedIndex: currentFearGreed, sentiment: currentSentiment, volatility: marketVolatility }
      ));
    }

    // Sentiment alerts
    if (Math.abs(currentSentiment) > 0.8) {
      const alertType = currentSentiment > 0 ? 'euphoria_buying' : 'panic_selling';
      alerts.push(this.createPsychologyAlert(
        entity,
        alertType,
        'medium',
        `Extreme ${currentSentiment > 0 ? 'positive' : 'negative'} sentiment detected`,
        'Monitor for potential reversal signals',
        { fearGreedIndex: currentFearGreed, sentiment: currentSentiment, volatility: marketVolatility }
      ));
    }

    return alerts;
  }

  private createPsychologyAlert(
    entity: string,
    alertType: TradingPsychologyAlert['alertType'],
    severity: TradingPsychologyAlert['severity'],
    description: string,
    recommendation: string,
    marketConditions: TradingPsychologyAlert['marketConditions']
  ): TradingPsychologyAlert {
    
    const alert: TradingPsychologyAlert = {
      id: `psych_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entity,
      alertType,
      severity,
      description,
      recommendation,
      triggeredAt: new Date(),
      isActive: true,
      marketConditions
    };

    this.activeAlerts.set(alert.id, alert);
    
    console.log(`🧠 Psychology Alert [${severity.toUpperCase()}] for ${entity}: ${description}`);
    
    return alert;
  }

  private calculateTrend(values: number[], current: number): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 3) return 'stable';
    
    const recent = values.slice(-3);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    
    if (current > avg + 5) return 'increasing';
    if (current < avg - 5) return 'decreasing';
    return 'stable';
  }

  private calculateSentimentTrend(
    history: MarketSentiment[], 
    current: number
  ): 'improving' | 'deteriorating' | 'stable' {
    if (history.length < 3) return 'stable';
    
    const recent = history.slice(-3).map(s => s.overall);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    
    if (current > avg + 0.1) return 'improving';
    if (current < avg - 0.1) return 'deteriorating';
    return 'stable';
  }

  private calculateHistoricalPercentile(value: number): number {
    if (this.fearGreedHistory.length < 10) return 0.5;
    
    const historicalValues = this.fearGreedHistory.map(h => h.value);
    const lowerCount = historicalValues.filter(v => v < value).length;
    return lowerCount / historicalValues.length;
  }

  private calculateConsistency(values: number[]): number {
    if (values.length < 2) return 1;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert standard deviation to consistency score (0-1)
    return Math.max(0, 1 - Math.min(1, stdDev));
  }

  private calculatePriceTrend(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const first = prices[0];
    const last = prices[prices.length - 1];
    return (last - first) / first;
  }

  private getRecentPrices(): number[] {
    // Simulated recent prices (would get from market data service)
    return Array.from({ length: 10 }, () => 3000 + Math.random() * 200);
  }

  private storeFearGreedHistory(index: FearGreedIndex): void {
    this.fearGreedHistory.push(index);
    if (this.fearGreedHistory.length > this.MAX_HISTORY_SIZE) {
      this.fearGreedHistory = this.fearGreedHistory.slice(-this.MAX_HISTORY_SIZE);
    }
  }

  private storeSentimentHistory(sentiment: MarketSentiment): void {
    this.sentimentHistory.push(sentiment);
    if (this.sentimentHistory.length > this.MAX_HISTORY_SIZE) {
      this.sentimentHistory = this.sentimentHistory.slice(-this.MAX_HISTORY_SIZE);
    }
  }

  private startDataCollection(): void {
    setInterval(() => {
      // This would collect real market data and update indicators
      // For now, just cleanup old data
      this.cleanupOldData();
    }, this.UPDATE_FREQUENCY);
  }

  private cleanupOldData(): void {
    const cutoffTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    
    this.fearGreedHistory = this.fearGreedHistory.filter(h => h.timestamp >= cutoffTime);
    this.sentimentHistory = this.sentimentHistory.filter(s => s.timestamp >= cutoffTime);
    
    // Cleanup inactive alerts
    this.activeAlerts.forEach((alert, id) => {
      if (!alert.isActive || alert.triggeredAt < cutoffTime) {
        this.activeAlerts.delete(id);
      }
    });
  }

  public getPsychologyStatistics(): {
    currentFearGreed: number;
    currentSentiment: number;
    activeAlerts: number;
    entitiesAnalyzed: number;
    historicalDataPoints: number;
  } {
    const latest = this.fearGreedHistory[this.fearGreedHistory.length - 1];
    const latestSentiment = this.sentimentHistory[this.sentimentHistory.length - 1];
    
    return {
      currentFearGreed: latest?.value || 50,
      currentSentiment: latestSentiment?.overall || 0,
      activeAlerts: Array.from(this.activeAlerts.values()).filter(a => a.isActive).length,
      entitiesAnalyzed: this.entityProfiles.size,
      historicalDataPoints: this.fearGreedHistory.length + this.sentimentHistory.length
    };
  }
}

// Export singleton instance
let psychologyIndicatorsInstance: PsychologyIndicators | null = null;

export function getPsychologyIndicators(): PsychologyIndicators {
  if (!psychologyIndicatorsInstance) {
    psychologyIndicatorsInstance = new PsychologyIndicators();
  }
  return psychologyIndicatorsInstance;
}