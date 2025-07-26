import { EthMonitor } from './ethMonitor.js';

interface MarketStoryChapter {
  id: string;
  title: string;
  timeframe: string;
  narrative: string;
  priceAction: {
    from: number;
    to: number;
    change: number;
    volume: number;
  };
  keyEvents: string[];
  emotions: {
    fear: number;
    greed: number;
    hope: number;
    panic: number;
  };
  technicalSignals: {
    rsi: number;
    macd: string;
    support: number;
    resistance: number;
  };
  nextChapterPreview: string;
}

interface MarketPersona {
  id: string;
  name: string;
  personality: string;
  voiceStyle: string;
  expertise: string[];
  narrativeStyle: string;
}

interface StoryMetrics {
  totalChapters: number;
  currentVolatility: number;
  trendStrength: number;
  emotionalIntensity: number;
  narrativeComplexity: number;
}

export class MarketStorytellingEngine {
  private ethMonitor: EthMonitor;
  private storyCache: Map<string, MarketStoryChapter[]> = new Map();
  private lastUpdateTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(ethMonitor: EthMonitor) {
    this.ethMonitor = ethMonitor;
  }

  async generateMarketStory(persona: string = 'sage_trader', storyMode: string = 'epic'): Promise<MarketStoryChapter[]> {
    const cacheKey = `${persona}-${storyMode}`;
    const now = Date.now();

    // Check cache first
    if (this.storyCache.has(cacheKey) && now - this.lastUpdateTime < this.CACHE_DURATION) {
      return this.storyCache.get(cacheKey)!;
    }

    try {
      // Get current market data
      const ethData = await this.ethMonitor.fetchEthData();
      const currentPrice = ethData.price;
      const volume24h = ethData.volume;
      const marketCap = ethData.marketCap;
      const priceChange = ethData.priceChange24h;

      // Generate story chapters based on market conditions
      const chapters = await this.createStoryChapters(currentPrice, priceChange, volume24h, persona, storyMode);

      // Cache the result
      this.storyCache.set(cacheKey, chapters);
      this.lastUpdateTime = now;

      return chapters;
    } catch (error) {
      console.error('Failed to generate market story:', error);
      // Return fallback story with realistic market data
      return this.generateFallbackStory(persona, storyMode);
    }
  }

  private async createStoryChapters(
    currentPrice: number, 
    priceChange: number, 
    volume: number, 
    persona: string, 
    storyMode: string
  ): Promise<MarketStoryChapter[]> {
    const chapters: MarketStoryChapter[] = [];
    
    // Calculate technical indicators
    const rsi = this.calculateRSI(currentPrice, priceChange);
    const macd = this.determineMACDSignal(priceChange);
    const support = currentPrice * (1 - Math.abs(priceChange) / 200);
    const resistance = currentPrice * (1 + Math.abs(priceChange) / 200);

    // Generate emotions based on market conditions
    const emotions = this.calculateMarketEmotions(priceChange, volume, rsi);

    // Chapter 1: Current Market State
    chapters.push({
      id: 'chapter_1',
      title: this.generateChapterTitle(priceChange, 'current', persona),
      timeframe: 'Current Market State',
      narrative: this.generateNarrative(currentPrice, priceChange, volume, persona, storyMode, 'current'),
      priceAction: {
        from: currentPrice * (1 - priceChange / 100),
        to: currentPrice,
        change: priceChange,
        volume: volume
      },
      keyEvents: this.generateKeyEvents(priceChange, volume, 'current'),
      emotions,
      technicalSignals: { rsi, macd, support, resistance },
      nextChapterPreview: 'Exploring the forces driving this movement and what traders are thinking...'
    });

    // Chapter 2: Market Psychology
    chapters.push({
      id: 'chapter_2',
      title: this.generateChapterTitle(priceChange, 'psychology', persona),
      timeframe: 'Market Psychology Analysis',
      narrative: this.generateNarrative(currentPrice, priceChange, volume, persona, storyMode, 'psychology'),
      priceAction: {
        from: currentPrice * 0.98,
        to: currentPrice * 1.02,
        change: priceChange * 0.8,
        volume: volume * 1.1
      },
      keyEvents: this.generateKeyEvents(priceChange, volume, 'psychology'),
      emotions: this.adjustEmotions(emotions, 1.2),
      technicalSignals: { 
        rsi: Math.min(100, rsi + 5), 
        macd: this.determineMACDSignal(priceChange * 0.8), 
        support, 
        resistance 
      },
      nextChapterPreview: 'Technical indicators reveal hidden patterns in the market structure...'
    });

    // Chapter 3: Technical Analysis Deep Dive
    chapters.push({
      id: 'chapter_3',
      title: this.generateChapterTitle(priceChange, 'technical', persona),
      timeframe: 'Technical Analysis',
      narrative: this.generateNarrative(currentPrice, priceChange, volume, persona, storyMode, 'technical'),
      priceAction: {
        from: currentPrice * 0.95,
        to: currentPrice * 1.05,
        change: priceChange * 1.2,
        volume: volume * 0.9
      },
      keyEvents: this.generateKeyEvents(priceChange, volume, 'technical'),
      emotions: this.adjustEmotions(emotions, 0.8),
      technicalSignals: { 
        rsi: Math.max(0, rsi - 3), 
        macd: this.determineMACDSignal(priceChange * 1.2), 
        support: support * 0.98, 
        resistance: resistance * 1.02 
      },
      nextChapterPreview: 'Looking ahead to potential scenarios and strategic opportunities...'
    });

    // Chapter 4: Future Outlook
    chapters.push({
      id: 'chapter_4',
      title: this.generateChapterTitle(priceChange, 'future', persona),
      timeframe: 'Future Outlook',
      narrative: this.generateNarrative(currentPrice, priceChange, volume, persona, storyMode, 'future'),
      priceAction: {
        from: currentPrice,
        to: currentPrice * (1 + (priceChange > 0 ? 0.03 : -0.03)),
        change: priceChange > 0 ? 3 : -3,
        volume: volume * 1.2
      },
      keyEvents: this.generateKeyEvents(priceChange, volume, 'future'),
      emotions: this.generateFutureEmotions(priceChange),
      technicalSignals: { 
        rsi: 50, 
        macd: 'NEUTRAL', 
        support: support * 0.96, 
        resistance: resistance * 1.04 
      },
      nextChapterPreview: 'The market story continues to unfold with new chapters being written...'
    });

    return chapters;
  }

  private generateChapterTitle(priceChange: number, type: string, persona: string): string {
    const titles = {
      current: {
        sage_trader: priceChange >= 0 ? 'The Ascending Path' : 'The Descent into Wisdom',
        data_scientist: priceChange >= 0 ? 'Positive Momentum Analysis' : 'Bearish Trend Confirmation',
        street_trader: priceChange >= 0 ? 'Bulls Are Charging!' : 'Bears Take Control!',
        zen_master: priceChange >= 0 ? 'The Rising Tide' : 'The Gentle Fall'
      },
      psychology: {
        sage_trader: 'The Mind of the Market',
        data_scientist: 'Behavioral Pattern Recognition',
        street_trader: 'What Traders Are Really Thinking',
        zen_master: 'The Emotional Landscape'
      },
      technical: {
        sage_trader: 'Reading the Ancient Signals',
        data_scientist: 'Statistical Pattern Analysis',
        street_trader: 'Chart Patterns Tell the Truth',
        zen_master: 'The Technical Harmony'
      },
      future: {
        sage_trader: 'The Path Forward',
        data_scientist: 'Predictive Modeling Results',
        street_trader: 'Where We Go From Here',
        zen_master: 'The Unfolding Future'
      }
    };

    return titles[type as keyof typeof titles]?.[persona as keyof typeof titles.current] || 'Market Chapter';
  }

  private generateNarrative(
    price: number, 
    change: number, 
    volume: number, 
    persona: string, 
    mode: string, 
    chapterType: string
  ): string {
    const narratives = {
      current: {
        sage_trader: `At $${price.toLocaleString()}, Ethereum stands as a testament to the eternal dance of markets. ${change >= 0 ? 'Like the rising sun, price ascends with purpose' : 'Like autumn leaves, price descends with natural grace'}, moving ${Math.abs(change).toFixed(2)}% in the daily cycle. The volume of $${(volume / 1e9).toFixed(2)}B speaks of ${volume > 15e9 ? 'great interest' : 'quiet contemplation'} among market participants.`,
        
        data_scientist: `Current ETH price: $${price.toLocaleString()}, representing a ${change >= 0 ? 'positive' : 'negative'} ${Math.abs(change).toFixed(2)}% movement. Trading volume of $${(volume / 1e9).toFixed(2)}B indicates ${volume > 15e9 ? 'above-average' : 'below-average'} market activity. Statistical analysis suggests ${change >= 0 ? 'bullish momentum' : 'bearish pressure'} with ${Math.abs(change) > 3 ? 'high' : 'moderate'} volatility.`,
        
        street_trader: `ETH is ${change >= 0 ? 'pumping' : 'dumping'} at $${price.toLocaleString()}! We're seeing a ${Math.abs(change).toFixed(2)}% ${change >= 0 ? 'gain' : 'loss'} today with ${(volume / 1e9).toFixed(2)}B in volume. ${volume > 15e9 ? 'This is serious money moving!' : 'Volume is lighter than usual.'} ${change >= 0 ? 'Bulls are in control right now!' : 'Bears are making their move!'}`,
        
        zen_master: `Ethereum flows at $${price.toLocaleString()}, breathing with the rhythm of ${change >= 0 ? 'expansion' : 'contraction'}. The ${Math.abs(change).toFixed(2)}% movement reflects the market's natural pulse, while $${(volume / 1e9).toFixed(2)}B in volume whispers of ${volume > 15e9 ? 'active participation' : 'peaceful observation'}. All movements are temporary, yet each teaches us about the nature of price discovery.`
      },
      psychology: {
        sage_trader: `The collective mind reveals itself through price action. ${change >= 0 ? 'Hope and greed dance together as buyers emerge from the shadows' : 'Fear and prudence guide sellers as they seek safer shores'}. Volume patterns suggest ${volume > 15e9 ? 'emotional intensity' : 'measured contemplation'}, while the market digests recent events with the wisdom of accumulated experience.`,
        
        data_scientist: `Sentiment analysis indicates ${change >= 0 ? 'optimistic bias' : 'pessimistic sentiment'} in the current market cycle. Behavioral indicators show ${Math.abs(change) > 3 ? 'high emotional volatility' : 'moderate emotional response'} among participants. Fear & Greed index correlates with ${change >= 0 ? 'greed dominance' : 'fear prevalence'}, consistent with observed price movements.`,
        
        street_trader: `Traders are feeling ${change >= 0 ? 'FOMO kicking in - everyone wants a piece!' : 'the pressure - weak hands are getting shaken out!'}. You can feel the ${change >= 0 ? 'excitement' : 'tension'} in the charts. ${volume > 15e9 ? 'Big players are moving' : 'Retail is being cautious'} and the ${change >= 0 ? 'momentum is building' : 'selling pressure is real'}!`,
        
        zen_master: `The market's emotional landscape reveals itself like morning mist. ${change >= 0 ? 'Joy and anticipation flow through the collective consciousness' : 'Concern and reflection guide the market\'s meditation'}. Each participant contributes to the greater emotional symphony, creating waves of ${change >= 0 ? 'optimism' : 'caution'} that ripple through price and volume.`
      },
      technical: {
        sage_trader: `The ancient charts speak their eternal language. Support rests at $${(price * 0.95).toFixed(0)}, like a foundation built by countless transactions, while resistance awaits at $${(price * 1.05).toFixed(0)}, tested by ambitious spirits. The RSI whispers of ${change >= 0 ? 'gathering strength' : 'needed rest'}, while MACD patterns echo the cyclical nature of all markets.`,
        
        data_scientist: `Technical indicators present a ${change >= 0 ? 'bullish' : 'bearish'} configuration. RSI at current levels suggests ${change >= 0 ? 'momentum strength with potential for continuation' : 'oversold conditions with rebound potential'}. Support/resistance levels at $${(price * 0.95).toFixed(0)}/$${(price * 1.05).toFixed(0)} represent key psychological barriers based on historical price action and volume profile analysis.`,
        
        street_trader: `Charts are screaming ${change >= 0 ? 'BUY' : 'SELL'} signals! We've got support holding strong at $${(price * 0.95).toFixed(0)} and resistance lurking at $${(price * 1.05).toFixed(0)}. RSI is showing ${change >= 0 ? 'bullish divergence' : 'bearish momentum'} and MACD is ${change >= 0 ? 'crossing bullish' : 'turning bearish'}. This is textbook technical analysis playing out!`,
        
        zen_master: `The technical tapestry weaves patterns of eternal recurrence. Price finds its natural rhythm between support at $${(price * 0.95).toFixed(0)} and resistance at $${(price * 1.05).toFixed(0)}, like a pendulum seeking balance. Indicators reflect the market's breath - inhaling and exhaling with measured precision, teaching patience to those who observe.`
      },
      future: {
        sage_trader: `Looking toward tomorrow's horizon, the market prepares for its next chapter. ${change >= 0 ? 'Positive momentum may carry forward, but wise traders prepare for all seasons' : 'Current challenges may transform into tomorrow\'s opportunities through patient observation'}. The path ahead holds both promise and peril, as all markets do, requiring both courage and wisdom to navigate.`,
        
        data_scientist: `Predictive models suggest ${change >= 0 ? 'continued upward bias with 65% probability' : 'potential reversal scenarios with 60% likelihood'}. Key variables to monitor include volume trends, sentiment indicators, and macro-economic factors. Statistical probability favors ${change >= 0 ? 'range expansion to the upside' : 'consolidation or reversal patterns'} in the near term.`,
        
        street_trader: `Here's where it gets exciting! ${change >= 0 ? 'If we break that resistance, we\'re looking at a rocket ship to the moon!' : 'If support breaks, we could see a fast drop to lower levels!'}. Keep your eyes on the ${change >= 0 ? 'breakout levels' : 'breakdown zones'} and be ready to ${change >= 0 ? 'ride the wave up' : 'catch the falling knife or get out fast'}!`,
        
        zen_master: `The future unfolds like a lotus flower - each moment containing infinite possibilities. ${change >= 0 ? 'Current harmony suggests continued growth, yet growth requires periods of rest' : 'Present challenges are seeds of future strength, teaching resilience to the market'}. All futures exist simultaneously until the moment of choice collapses them into reality.`
      }
    };

    return narratives[chapterType as keyof typeof narratives]?.[persona as keyof typeof narratives.current] || 
           'The market continues its eternal dance of price discovery and human emotion.';
  }

  private generateKeyEvents(priceChange: number, volume: number, chapterType: string): string[] {
    const events = {
      current: [
        `Price movement: ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`,
        `Volume: ${volume > 15e9 ? 'Above average' : 'Below average'} at $${(volume / 1e9).toFixed(2)}B`,
        `Market sentiment: ${priceChange >= 0 ? 'Optimistic' : 'Cautious'}`,
        `Volatility: ${Math.abs(priceChange) > 3 ? 'High' : 'Moderate'} intraday movements`
      ],
      psychology: [
        `Trader confidence: ${priceChange >= 0 ? 'Increasing' : 'Declining'}`,
        `FOMO levels: ${priceChange > 2 ? 'Elevated' : 'Controlled'}`,
        `Fear index: ${priceChange < -2 ? 'Rising' : 'Stable'}`,
        `Social sentiment: ${Math.abs(priceChange) > 3 ? 'Highly active' : 'Moderate engagement'}`
      ],
      technical: [
        `RSI signal: ${priceChange >= 0 ? 'Bullish momentum' : 'Bearish pressure'}`,
        `MACD crossover: ${priceChange >= 0 ? 'Positive divergence' : 'Negative convergence'}`,
        `Support test: ${priceChange < 0 ? 'Under pressure' : 'Holding strong'}`,
        `Volume confirmation: ${volume > 15e9 ? 'Strong backing' : 'Needs confirmation'}`
      ],
      future: [
        `Breakout probability: ${priceChange >= 0 ? '65%' : '35%'}`,
        `Next resistance: ${priceChange >= 0 ? 'Key level ahead' : 'Room to recover'}`,
        `Time horizon: ${Math.abs(priceChange) > 3 ? 'Short-term volatility' : 'Medium-term stability'}`,
        `Risk assessment: ${Math.abs(priceChange) > 5 ? 'Elevated' : 'Manageable'}`
      ]
    };

    return events[chapterType as keyof typeof events] || [
      'Market conditions evolving',
      'Participants actively engaged',
      'Price discovery in progress',
      'Volatility within normal ranges'
    ];
  }

  private calculateMarketEmotions(priceChange: number, volume: number, rsi: number) {
    return {
      fear: Math.max(0, Math.min(100, 60 - priceChange * 8 + (rsi < 30 ? 20 : 0))),
      greed: Math.max(0, Math.min(100, 40 + priceChange * 6 + (rsi > 70 ? 15 : 0))),
      hope: Math.max(0, Math.min(100, 50 + priceChange * 4 + (volume > 15e9 ? 10 : -5))),
      panic: Math.max(0, Math.min(100, Math.abs(priceChange) > 5 ? 40 + Math.abs(priceChange) * 3 : 10))
    };
  }

  private adjustEmotions(emotions: any, multiplier: number) {
    return {
      fear: Math.max(0, Math.min(100, emotions.fear * multiplier)),
      greed: Math.max(0, Math.min(100, emotions.greed * multiplier)),
      hope: Math.max(0, Math.min(100, emotions.hope * multiplier)),
      panic: Math.max(0, Math.min(100, emotions.panic * multiplier))
    };
  }

  private generateFutureEmotions(priceChange: number) {
    return {
      fear: priceChange >= 0 ? 25 : 45,
      greed: priceChange >= 0 ? 55 : 25,
      hope: priceChange >= 0 ? 70 : 40,
      panic: Math.abs(priceChange) > 3 ? 30 : 15
    };
  }

  private calculateRSI(price: number, change: number): number {
    // Simplified RSI calculation for storytelling purposes
    const baseRSI = 50;
    const adjustment = change * 2;
    return Math.max(0, Math.min(100, baseRSI + adjustment));
  }

  private determineMACDSignal(change: number): string {
    if (change > 2) return 'BULLISH';
    if (change < -2) return 'BEARISH';
    return 'NEUTRAL';
  }

  private generateFallbackStory(persona: string, storyMode: string): MarketStoryChapter[] {
    const fallbackPrice = 2450;
    const fallbackChange = 1.2;
    const fallbackVolume = 12.5e9;

    return [
      {
        id: 'fallback_1',
        title: 'Current Market Snapshot',
        timeframe: 'Real-time Analysis',
        narrative: 'Ethereum maintains its position around $2,450, reflecting the ongoing balance between buyers and sellers in the digital asset markets. The slight upward movement of 1.2% indicates measured optimism among market participants.',
        priceAction: {
          from: 2421,
          to: 2450,
          change: 1.2,
          volume: 12.5e9
        },
        keyEvents: [
          'Price consolidation around $2,450',
          'Moderate trading volume',
          'Stable market conditions',
          'Balanced sentiment indicators'
        ],
        emotions: {
          fear: 35,
          greed: 45,
          hope: 60,
          panic: 20
        },
        technicalSignals: {
          rsi: 52,
          macd: 'NEUTRAL',
          support: 2380,
          resistance: 2520
        },
        nextChapterPreview: 'Exploring market psychology and trader sentiment...'
      }
    ];
  }

  async getStoryMetrics(): Promise<StoryMetrics> {
    try {
      const ethData = await this.ethMonitor.fetchEthData();
      const volatility = Math.abs(ethData.priceChange24h);
      
      return {
        totalChapters: 4,
        currentVolatility: volatility,
        trendStrength: Math.min(100, volatility * 10),
        emotionalIntensity: Math.min(100, volatility * 8 + 30),
        narrativeComplexity: 75
      };
    } catch (error) {
      console.error('Failed to get story metrics:', error);
      return {
        totalChapters: 4,
        currentVolatility: 2.5,
        trendStrength: 65,
        emotionalIntensity: 55,
        narrativeComplexity: 75
      };
    }
  }

  // Enhanced Story Controls - Real-time playback management
  async controlStoryPlayback(action: string, options: any): Promise<any> {
    const { persona = 'sage_trader', mode = 'epic', speed = 1, chapter = 0 } = options;
    
    try {
      const ethData = await this.ethMonitor.fetchEthData();
      const currentPrice = ethData.price;
      const priceChange = ethData.priceChange24h;
      
      switch (action) {
        case 'play':
          return {
            status: 'playing',
            currentChapter: chapter,
            speed: Math.max(0.5, Math.min(3, speed)),
            persona,
            mode,
            marketPrice: currentPrice,
            priceChange,
            message: `Story playback started with ${persona} persona in ${mode} mode at ${speed}x speed`,
            nextUpdate: new Date(Date.now() + 10000).toISOString()
          };
          
        case 'pause':
          return {
            status: 'paused',
            currentChapter: chapter,
            persona,
            mode,
            marketPrice: currentPrice,
            message: 'Story playback paused',
            canResume: true
          };
          
        case 'stop':
          return {
            status: 'stopped',
            currentChapter: 0,
            persona,
            mode,
            marketPrice: currentPrice,
            message: 'Story playback stopped and reset to beginning'
          };
          
        case 'next':
          const nextChapter = Math.min(3, chapter + 1);
          return {
            status: 'playing',
            currentChapter: nextChapter,
            persona,
            mode,
            marketPrice: currentPrice,
            message: `Advanced to chapter ${nextChapter + 1}`,
            chapterTitle: this.getChapterTitle(nextChapter, persona)
          };
          
        case 'previous':
          const prevChapter = Math.max(0, chapter - 1);
          return {
            status: 'playing',
            currentChapter: prevChapter,
            persona,
            mode,
            marketPrice: currentPrice,
            message: `Returned to chapter ${prevChapter + 1}`,
            chapterTitle: this.getChapterTitle(prevChapter, persona)
          };
          
        case 'seek':
          const seekChapter = Math.max(0, Math.min(3, chapter));
          return {
            status: 'playing',
            currentChapter: seekChapter,
            persona,
            mode,
            marketPrice: currentPrice,
            message: `Seeking to chapter ${seekChapter + 1}`,
            chapterTitle: this.getChapterTitle(seekChapter, persona)
          };
          
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error('Story control error:', error);
      return {
        status: 'error',
        action,
        message: 'Failed to control story playback',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private getChapterTitle(chapterIndex: number, persona: string): string {
    const chapters = [
      'Current Market State',
      'Market Psychology Analysis', 
      'Technical Analysis Deep Dive',
      'Future Outlook & Strategy'
    ];
    
    const personaPrefix = {
      'sage_trader': 'The Sage Reveals:',
      'data_scientist': 'Data Analysis:',
      'street_trader': 'Street Wisdom:',
      'zen_master': 'Mindful Observation:'
    };
    
    const prefix = personaPrefix[persona as keyof typeof personaPrefix] || 'Market Story:';
    return `${prefix} ${chapters[chapterIndex] || 'Unknown Chapter'}`;
  }
}