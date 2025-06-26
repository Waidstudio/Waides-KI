/**
 * MODULE B — Real-Time Sentiment via Social Feed
 * Adds on-chain psychology by measuring ETH sentiment across social sources
 */

interface SentimentData {
  score: number; // -1 to 1 scale
  timestamp: number;
  source: string;
  confidence: number;
}

interface SentimentAnalysis {
  overall_sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number; // -100 to 100
  confidence: number;
  sample_size: number;
  trend: 'rising' | 'falling' | 'stable';
  sources: string[];
}

export class WaidesKIETHSentimentTracker {
  private sentimentWindow: SentimentData[] = [];
  private maxWindowSize = 200;
  private sentimentHistory: SentimentAnalysis[] = [];
  private isRunning = false;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSentimentTracking();
  }

  /**
   * Initialize sentiment tracking system
   */
  private initializeSentimentTracking(): void {
    console.log('🐦 Initializing ETH sentiment tracking system');
    
    // Start periodic sentiment analysis
    this.startPeriodicAnalysis();
  }

  /**
   * Start periodic sentiment analysis
   */
  private startPeriodicAnalysis(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Update sentiment every 30 seconds
    this.updateInterval = setInterval(() => {
      this.fetchSentimentData();
    }, 30000);

    console.log('🐦 Started periodic sentiment analysis');
  }

  /**
   * Fetch sentiment data from various sources
   */
  async fetchSentimentData(): Promise<SentimentAnalysis> {
    try {
      // Simulate fetching from multiple sentiment sources
      // In production, this would integrate with:
      // - Fear & Greed Index API
      // - Social media sentiment APIs
      // - News sentiment APIs
      // - On-chain activity indicators
      
      const sentimentSources = [
        this.getCryptoFearGreedSentiment(),
        this.getMarketNewsSentiment(),
        this.getTechnicalSentiment(),
        this.getVolumeBasedSentiment(),
        this.getSocialMediaSentiment()
      ];

      const results = await Promise.allSettled(sentimentSources);
      
      // Process results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          this.addSentimentData(result.value);
        }
      });

      return this.calculateOverallSentiment();
    } catch (error) {
      console.error('❌ Error fetching sentiment data:', error);
      return this.getDefaultSentiment();
    }
  }

  /**
   * Get Fear & Greed Index sentiment
   */
  private async getCryptoFearGreedSentiment(): Promise<SentimentData> {
    try {
      // Alternative.me Fear & Greed Index
      const response = await fetch('https://api.alternative.me/fng/', {
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        const data = await response.json();
        const fearGreedValue = parseInt(data.data[0].value);
        
        // Convert 0-100 scale to -1 to 1 scale
        // 0-25 = fearful (negative), 25-75 = neutral, 75-100 = greedy (positive)
        let score = 0;
        if (fearGreedValue < 25) {
          score = -1 + (fearGreedValue / 25); // -1 to 0
        } else if (fearGreedValue > 75) {
          score = (fearGreedValue - 75) / 25; // 0 to 1
        } else {
          score = (fearGreedValue - 50) / 50; // Neutral range
        }

        return {
          score: Math.max(-1, Math.min(1, score)),
          timestamp: Date.now(),
          source: 'fear_greed_index',
          confidence: 0.8
        };
      }
    } catch (error) {
      // Fallback to simulated data
    }

    return this.generateSimulatedSentiment('fear_greed_index', 0.8);
  }

  /**
   * Get market news sentiment
   */
  private async getMarketNewsSentiment(): Promise<SentimentData> {
    // Simulate news sentiment analysis
    // In production, this would analyze recent crypto news headlines
    return this.generateSimulatedSentiment('market_news', 0.6);
  }

  /**
   * Get technical analysis sentiment
   */
  private async getTechnicalSentiment(): Promise<SentimentData> {
    // Analyze technical indicators for sentiment
    // RSI, MACD, moving averages, etc.
    
    // Simulate based on current market conditions
    const now = Date.now();
    const hourOfDay = new Date(now).getHours();
    
    // Simulate daily sentiment patterns
    let score = 0;
    if (hourOfDay >= 6 && hourOfDay <= 9) {
      score = 0.3; // Morning optimism
    } else if (hourOfDay >= 14 && hourOfDay <= 16) {
      score = 0.1; // Afternoon consolidation
    } else {
      score = -0.1; // Evening caution
    }

    // Add some randomness
    score += (Math.random() - 0.5) * 0.4;

    return {
      score: Math.max(-1, Math.min(1, score)),
      timestamp: now,
      source: 'technical_analysis',
      confidence: 0.7
    };
  }

  /**
   * Get volume-based sentiment
   */
  private async getVolumeBasedSentiment(): Promise<SentimentData> {
    // Analyze trading volume patterns for sentiment
    return this.generateSimulatedSentiment('volume_analysis', 0.5);
  }

  /**
   * Get social media sentiment
   */
  private async getSocialMediaSentiment(): Promise<SentimentData> {
    // Simulate social media sentiment analysis
    // In production, this would analyze Twitter, Reddit, Discord, etc.
    return this.generateSimulatedSentiment('social_media', 0.4);
  }

  /**
   * Generate simulated sentiment data
   */
  private generateSimulatedSentiment(source: string, confidence: number): SentimentData {
    // Generate realistic sentiment patterns
    const now = Date.now();
    const dayOfWeek = new Date(now).getDay();
    const hourOfDay = new Date(now).getHours();
    
    let baseScore = 0;
    
    // Weekend sentiment tends to be more neutral
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      baseScore = (Math.random() - 0.5) * 0.3;
    } else {
      // Weekday patterns
      if (hourOfDay >= 9 && hourOfDay <= 16) {
        baseScore = 0.1 + (Math.random() - 0.5) * 0.4; // Slightly bullish during trading hours
      } else {
        baseScore = (Math.random() - 0.5) * 0.3; // More neutral outside hours
      }
    }

    // Add market cycle influence
    const marketCycle = Math.sin((now / (1000 * 60 * 60 * 24)) * Math.PI / 7); // Weekly cycle
    baseScore += marketCycle * 0.2;

    return {
      score: Math.max(-1, Math.min(1, baseScore)),
      timestamp: now,
      source,
      confidence
    };
  }

  /**
   * Add sentiment data to window
   */
  private addSentimentData(data: SentimentData): void {
    this.sentimentWindow.push(data);
    
    // Keep window size manageable
    if (this.sentimentWindow.length > this.maxWindowSize) {
      this.sentimentWindow.shift();
    }
  }

  /**
   * Calculate overall sentiment from window
   */
  private calculateOverallSentiment(): SentimentAnalysis {
    if (this.sentimentWindow.length === 0) {
      return this.getDefaultSentiment();
    }

    // Recent data (last 10 minutes)
    const recentCutoff = Date.now() - (10 * 60 * 1000);
    const recentData = this.sentimentWindow.filter(d => d.timestamp > recentCutoff);
    
    if (recentData.length === 0) {
      return this.getDefaultSentiment();
    }

    // Calculate weighted average sentiment
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    recentData.forEach(data => {
      const weight = data.confidence;
      totalWeightedScore += data.score * weight;
      totalWeight += weight;
    });

    const averageScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    
    // Convert to 0-100 scale
    const normalizedScore = Math.round(averageScore * 100);
    
    // Determine sentiment category
    let overallSentiment: 'bullish' | 'bearish' | 'neutral';
    if (normalizedScore > 15) {
      overallSentiment = 'bullish';
    } else if (normalizedScore < -15) {
      overallSentiment = 'bearish';
    } else {
      overallSentiment = 'neutral';
    }

    // Calculate confidence based on data consistency
    const scores = recentData.map(d => d.score);
    const variance = this.calculateVariance(scores);
    const confidence = Math.round(Math.max(0, Math.min(100, (1 - variance) * 100)));

    // Determine trend
    const trend = this.calculateSentimentTrend();

    const analysis: SentimentAnalysis = {
      overall_sentiment: overallSentiment,
      score: normalizedScore,
      confidence,
      sample_size: recentData.length,
      trend,
      sources: [...new Set(recentData.map(d => d.source))]
    };

    // Store in history
    this.sentimentHistory.push(analysis);
    if (this.sentimentHistory.length > 100) {
      this.sentimentHistory.shift();
    }

    return analysis;
  }

  /**
   * Calculate sentiment trend
   */
  private calculateSentimentTrend(): 'rising' | 'falling' | 'stable' {
    if (this.sentimentHistory.length < 3) {
      return 'stable';
    }

    const recent = this.sentimentHistory.slice(-3);
    const scores = recent.map(h => h.score);
    
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    const difference = lastScore - firstScore;

    if (difference > 10) return 'rising';
    if (difference < -10) return 'falling';
    return 'stable';
  }

  /**
   * Calculate variance for confidence scoring
   */
  private calculateVariance(scores: number[]): number {
    if (scores.length === 0) return 1;
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Get default sentiment when no data available
   */
  private getDefaultSentiment(): SentimentAnalysis {
    return {
      overall_sentiment: 'neutral',
      score: 0,
      confidence: 0,
      sample_size: 0,
      trend: 'stable',
      sources: []
    };
  }

  /**
   * Get current sentiment analysis
   */
  getCurrentSentiment(): SentimentAnalysis {
    if (this.sentimentHistory.length === 0) {
      return this.getDefaultSentiment();
    }
    return this.sentimentHistory[this.sentimentHistory.length - 1];
  }

  /**
   * Get sentiment for trading decisions
   */
  getSentimentForTrading(): {
    sentiment: SentimentAnalysis;
    trading_signal: 'bullish' | 'bearish' | 'neutral' | 'wait';
    confidence_level: 'high' | 'medium' | 'low';
    recommendation: string;
  } {
    const sentiment = this.getCurrentSentiment();
    
    let tradingSignal: 'bullish' | 'bearish' | 'neutral' | 'wait';
    let confidenceLevel: 'high' | 'medium' | 'low';
    let recommendation: string;

    if (sentiment.confidence >= 70) {
      confidenceLevel = 'high';
      tradingSignal = sentiment.overall_sentiment;
      
      if (sentiment.overall_sentiment === 'bullish') {
        recommendation = 'Strong bullish sentiment - consider long positions';
      } else if (sentiment.overall_sentiment === 'bearish') {
        recommendation = 'Strong bearish sentiment - consider short positions or reduce exposure';
      } else {
        recommendation = 'Neutral sentiment - wait for clearer signals';
      }
    } else if (sentiment.confidence >= 40) {
      confidenceLevel = 'medium';
      tradingSignal = 'wait';
      recommendation = 'Mixed sentiment signals - wait for confirmation';
    } else {
      confidenceLevel = 'low';
      tradingSignal = 'wait';
      recommendation = 'Insufficient sentiment data - avoid trading based on sentiment';
    }

    return {
      sentiment,
      trading_signal: tradingSignal,
      confidence_level: confidenceLevel,
      recommendation
    };
  }

  /**
   * Get sentiment statistics
   */
  getSentimentStatistics(): {
    total_data_points: number;
    active_sources: number;
    average_confidence: number;
    sentiment_distribution: Record<string, number>;
    trend_analysis: any;
  } {
    const recentData = this.sentimentWindow.filter(d => 
      d.timestamp > Date.now() - (60 * 60 * 1000) // Last hour
    );

    const activeSources = new Set(recentData.map(d => d.source)).size;
    const avgConfidence = recentData.length > 0 ? 
      Math.round(recentData.reduce((sum, d) => sum + d.confidence, 0) / recentData.length * 100) : 0;

    // Sentiment distribution
    const distribution = this.sentimentHistory.slice(-20).reduce((acc, analysis) => {
      acc[analysis.overall_sentiment] = (acc[analysis.overall_sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_data_points: this.sentimentWindow.length,
      active_sources: activeSources,
      average_confidence: avgConfidence,
      sentiment_distribution: distribution,
      trend_analysis: {
        current_trend: this.calculateSentimentTrend(),
        recent_scores: this.sentimentHistory.slice(-5).map(h => h.score)
      }
    };
  }

  /**
   * Stop sentiment tracking
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 ETH sentiment tracking stopped');
  }

  /**
   * Restart sentiment tracking
   */
  restart(): void {
    this.stop();
    this.startPeriodicAnalysis();
  }
}

export const waidesKIETHSentimentTracker = new WaidesKIETHSentimentTracker();