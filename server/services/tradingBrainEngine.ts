import { format } from 'date-fns';

interface TradingKnowledge {
  section: string;
  question: string;
  answer: string;
  category: 'MINDSET' | 'TECHNICAL' | 'TIMING' | 'RISK' | 'STRATEGY' | 'AUTOMATION' | 'ADVANCED' | 'FUNDAMENTALS' | 'DISCIPLINE' | 'SPIRITUAL';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  tags: string[];
}

interface TradingAdvice {
  topic: string;
  advice: string;
  actionItems: string[];
  riskWarning?: string;
  marketContext: string;
}

export class TradingBrainEngine {
  private knowledgeBase: TradingKnowledge[] = [
    // SECTION 1: Mindset & Psychology
    {
      section: "Mindset & Psychology",
      question: "Why do most traders lose money emotionally, not technically?",
      answer: "Most traders lose because they let fear and greed override logic. They cut winners short (fear of losing gains) and hold losers too long (refusing to accept loss). Technical skills mean nothing without emotional control.",
      category: "MINDSET",
      difficulty: "BEGINNER",
      tags: ["psychology", "emotions", "discipline"]
    },
    {
      section: "Mindset & Psychology", 
      question: "How do I train myself to follow rules even when emotions scream otherwise?",
      answer: "Create strict rules, write them down, and practice them in small positions first. Use mechanical signals, not feelings. Set automatic stop-losses so emotions can't override. Start each day by reading your rules aloud.",
      category: "MINDSET",
      difficulty: "INTERMEDIATE",
      tags: ["discipline", "rules", "automation"]
    },
    {
      section: "Mindset & Psychology",
      question: "How do I bounce back mentally after a loss without revenge trading?",
      answer: "Accept losses as business expenses. Take a 30-minute break, review what went wrong objectively, then either follow your plan or stop trading for the day. Never increase position size after a loss.",
      category: "MINDSET", 
      difficulty: "INTERMEDIATE",
      tags: ["loss-management", "recovery", "discipline"]
    },

    // SECTION 2: Technical Analysis
    {
      section: "Technical Analysis",
      question: "How do I identify a clean uptrend or downtrend across multiple timeframes?",
      answer: "Clean uptrend: Higher highs and higher lows on 4H and daily charts, with price above 50 and 200 EMAs. Volume should increase on up moves. For downtrend, reverse these conditions.",
      category: "TECHNICAL",
      difficulty: "BEGINNER", 
      tags: ["trends", "multi-timeframe", "price-action"]
    },
    {
      section: "Technical Analysis",
      question: "What makes a support or resistance zone truly strong?",
      answer: "Multiple touches over time, high volume at the level, round numbers, previous major highs/lows, and confluence with moving averages or Fibonacci levels. The more tests without breaking, the stronger it becomes.",
      category: "TECHNICAL",
      difficulty: "INTERMEDIATE",
      tags: ["support-resistance", "levels", "confluence"]
    },
    {
      section: "Technical Analysis",
      question: "How do I combine RSI, MACD, and EMA for perfect entry timing?",
      answer: "Wait for price above 50 EMA (uptrend), RSI between 40-60 (not overbought), and MACD showing bullish crossover. Enter on pullback to EMA with all three aligned. This gives high-probability entries.",
      category: "TECHNICAL",
      difficulty: "ADVANCED",
      tags: ["indicators", "confluence", "timing"]
    },

    // SECTION 3: Timing & Market Sessions
    {
      section: "Timing & Market Sessions",
      question: "What's the most profitable time of day to trade ETH?",
      answer: "6:30 AM - 9:30 AM PDT when US and European sessions overlap. High volume, clear direction, and institutional activity create the best opportunities. Avoid lunch hours and late night low-volume periods.",
      category: "TIMING",
      difficulty: "BEGINNER",
      tags: ["sessions", "eth", "volume"]
    },
    {
      section: "Timing & Market Sessions",
      question: "How does pre-market or early session price action set the day's tone?",
      answer: "First 30 minutes often establish the day's range and direction. If price breaks overnight highs/lows with volume, it usually continues. If it fails to break, expect range-bound trading.",
      category: "TIMING",
      difficulty: "INTERMEDIATE", 
      tags: ["pre-market", "direction", "range"]
    },

    // SECTION 4: Risk Management
    {
      section: "Risk Management",
      question: "How much of my capital should I risk per trade?",
      answer: "Never risk more than 1-2% of total capital per trade. If you have $10,000, risk maximum $100-200 per trade. This allows you to survive 50+ consecutive losses, which is essential for long-term success.",
      category: "RISK",
      difficulty: "BEGINNER",
      tags: ["position-sizing", "capital-preservation", "survival"]
    },
    {
      section: "Risk Management",
      question: "How do I calculate position size based on stop-loss distance?",
      answer: "Risk Amount ÷ Stop Distance = Position Size. If you risk $100 and stop is $10 away, buy 10 units. Always calculate position size based on your stop-loss, not your opinion of the trade.",
      category: "RISK",
      difficulty: "INTERMEDIATE",
      tags: ["position-sizing", "stop-loss", "calculation"]
    },

    // SECTION 5: Strategy Building
    {
      section: "Strategy Building",
      question: "How do I build a simple but effective trading plan?",
      answer: "Define your edge (what gives you advantage), entry rules, exit rules, position sizing, and timeframes. Keep it simple: 3-5 clear rules maximum. Test it thoroughly before using real money.",
      category: "STRATEGY",
      difficulty: "BEGINNER",
      tags: ["planning", "rules", "simplicity"]
    },
    {
      section: "Strategy Building",
      question: "What should I include in my trading journal?",
      answer: "Entry/exit prices, reasons for trade, emotions felt, market conditions, what worked/didn't work, screenshots of charts. Review weekly to identify patterns in your behavior and performance.",
      category: "STRATEGY",
      difficulty: "INTERMEDIATE",
      tags: ["journaling", "review", "improvement"]
    },

    // SECTION 6: Grid Bots & Automation
    {
      section: "Grid Bots & Automation", 
      question: "How do I choose the right grid range for ETH bots?",
      answer: "Use 20-day average true range (ATR) to set grid width. For ETH, typically 1-3% between levels works best. Set range 10% below current support to 10% above resistance. Avoid during strong trends.",
      category: "AUTOMATION",
      difficulty: "ADVANCED",
      tags: ["grid-bots", "range", "atr"]
    },
    {
      section: "Grid Bots & Automation",
      question: "What conditions make bots profitable vs dangerous?",
      answer: "Profitable: Sideways markets, defined ranges, stable volatility. Dangerous: Strong trending markets, low liquidity, major news events. Always have kill switch ready and monitor market structure.",
      category: "AUTOMATION", 
      difficulty: "ADVANCED",
      tags: ["bot-conditions", "market-structure", "risk"]
    },

    // SECTION 7: Advanced Technical Tools
    {
      section: "Advanced Technical Tools",
      question: "How do I use Fibonacci retracement properly?",
      answer: "Draw from significant swing low to swing high. Key levels: 38.2%, 50%, 61.8%. Enter near these levels only with additional confirmation (support, volume, candlestick patterns). 61.8% is strongest.",
      category: "ADVANCED",
      difficulty: "ADVANCED",
      tags: ["fibonacci", "retracements", "confluence"]
    },
    {
      section: "Advanced Technical Tools",
      question: "What is VWAP and how can it guide entries?",
      answer: "Volume Weighted Average Price shows where most volume traded. Price above VWAP = bullish bias, below = bearish. Use as dynamic support/resistance and entry confirmation tool.",
      category: "ADVANCED",
      difficulty: "ADVANCED", 
      tags: ["vwap", "volume", "bias"]
    },

    // SECTION 8: News & Fundamentals
    {
      section: "News & Fundamentals",
      question: "How do interest rates affect crypto?",
      answer: "Higher rates make traditional investments more attractive, reducing crypto demand. Lower rates increase risk appetite, boosting crypto. Fed meetings and rate decisions cause major volatility in crypto markets.",
      category: "FUNDAMENTALS",
      difficulty: "INTERMEDIATE",
      tags: ["rates", "fed", "macro"]
    },
    {
      section: "News & Fundamentals",
      question: "How do I use fear & greed index to time trades?",
      answer: "Extreme fear (below 25) often marks good buying opportunities. Extreme greed (above 75) signals potential tops. Use as contrarian indicator, not sole decision factor. Combine with technical analysis.",
      category: "FUNDAMENTALS", 
      difficulty: "INTERMEDIATE",
      tags: ["sentiment", "contrarian", "timing"]
    },

    // SECTION 9: Self-Discipline
    {
      section: "Self-Discipline",
      question: "How many trades per day is too many?",
      answer: "Quality over quantity. 2-3 high-probability trades are better than 10 mediocre ones. If you're making more than 5 trades daily, you're likely overtrading and following emotions, not strategy.",
      category: "DISCIPLINE",
      difficulty: "BEGINNER",
      tags: ["overtrading", "quality", "focus"]
    },
    {
      section: "Self-Discipline", 
      question: "When is it best to stop trading for the day?",
      answer: "After hitting daily loss limit, after 2 consecutive losses, when market conditions change from your plan, or when you feel emotional. Better to preserve capital than force trades.",
      category: "DISCIPLINE",
      difficulty: "INTERMEDIATE",
      tags: ["stop-loss", "preservation", "emotional-control"]
    },

    // SECTION 10: Spiritual & Legacy
    {
      section: "Spiritual & Legacy",
      question: "Why do I really want to be a successful trader?",
      answer: "Success without purpose leads to emptiness. Trade to build financial freedom, support family, create opportunities for others, or fund meaningful causes. Money is a tool, not the goal.",
      category: "SPIRITUAL", 
      difficulty: "ADVANCED",
      tags: ["purpose", "meaning", "goals"]
    },
    {
      section: "Spiritual & Legacy",
      question: "How do I avoid greed during winning streaks?",
      answer: "Set profit targets and stick to them. Take regular profits off the table. Remember that markets are cyclical - today's gains can become tomorrow's losses. Stay humble and grateful.",
      category: "SPIRITUAL",
      difficulty: "ADVANCED", 
      tags: ["greed", "humility", "cycles"]
    },

    // ADDITIONAL MINDSET & PSYCHOLOGY ENTRIES
    {
      section: "Mindset & Psychology",
      question: "What separates professional traders from amateurs mentally?",
      answer: "Professionals view trading as a business with statistical edges, not gambling. They focus on process over outcomes, maintain detailed records, and accept losses as business expenses. Amateurs chase quick profits and blame external factors.",
      category: "MINDSET",
      difficulty: "EXPERT",
      tags: ["professional", "business", "statistics"]
    },
    {
      section: "Mindset & Psychology",
      question: "How do I develop unshakeable confidence in my trading system?",
      answer: "Through extensive backtesting, forward testing with small positions, and keeping detailed performance records. Confidence comes from knowing your system's exact win rate, drawdown periods, and edge size.",
      category: "MINDSET",
      difficulty: "ADVANCED",
      tags: ["confidence", "backtesting", "system"]
    },
    {
      section: "Mindset & Psychology",
      question: "Why do I get paralyzed when perfect setups appear?",
      answer: "Fear of success can be as paralyzing as fear of failure. You may subconsciously fear the responsibility that comes with consistent profits. Practice with smaller positions until pulling the trigger becomes automatic.",
      category: "MINDSET",
      difficulty: "EXPERT",
      tags: ["fear-of-success", "paralysis", "psychology"]
    },

    // ADDITIONAL TECHNICAL ANALYSIS ENTRIES
    {
      section: "Technical Analysis",
      question: "How do I identify when a breakout is fake vs real?",
      answer: "Real breakouts have: 3x normal volume, clean price action without wicks, follow-through after first 15 minutes, and occur during active trading sessions. Fake breakouts lack volume and quickly reverse.",
      category: "TECHNICAL",
      difficulty: "ADVANCED",
      tags: ["breakouts", "volume", "validation"]
    },
    {
      section: "Technical Analysis",
      question: "What's the most reliable candlestick pattern for entries?",
      answer: "Pin bars (hammer/shooting star) at key support/resistance with long wicks show strong rejection. Enter on break of pin bar high/low with stop beyond the wick. Works best on 4H+ timeframes.",
      category: "TECHNICAL",
      difficulty: "INTERMEDIATE",
      tags: ["candlesticks", "pin-bars", "rejection"]
    },
    {
      section: "Technical Analysis",
      question: "How do I read market structure like institutional traders?",
      answer: "Focus on swing highs/lows, order blocks (areas where institutions entered), and fair value gaps (imbalances). Institutions leave footprints - learn to read where they entered and predict their exits.",
      category: "TECHNICAL",
      difficulty: "EXPERT",
      tags: ["market-structure", "institutions", "order-blocks"]
    },

    // ADDITIONAL TIMING ENTRIES
    {
      section: "Timing & Market Sessions",
      question: "Why do most breakouts fail during Asian session?",
      answer: "Lower volume means less institutional participation. Breakouts need volume to sustain. Asian session often sees range-bound trading. Wait for London (3 AM EST) or New York (8 AM EST) open for meaningful moves.",
      category: "TIMING",
      difficulty: "INTERMEDIATE",
      tags: ["asian-session", "volume", "institutions"]
    },
    {
      section: "Timing & Market Sessions",
      question: "How do news events affect intraday trading strategies?",
      answer: "Major news creates volatility spikes that can trigger stop-losses prematurely. Check economic calendar daily. Reduce position sizes or stay flat during FOMC, CPI, NFP releases. Price often reverses after initial reaction.",
      category: "TIMING",
      difficulty: "ADVANCED",
      tags: ["news", "volatility", "economic-calendar"]
    },

    // ADDITIONAL RISK MANAGEMENT ENTRIES
    {
      section: "Risk Management",
      question: "What's the optimal risk-reward ratio for swing trading?",
      answer: "Target minimum 1:2 risk-reward, but 1:3 is better for long-term success. With 1:3 R:R, you can be wrong 70% of the time and still be profitable. Quality setups should offer at least 1:2.",
      category: "RISK",
      difficulty: "INTERMEDIATE",
      tags: ["risk-reward", "swing-trading", "profitability"]
    },
    {
      section: "Risk Management",
      question: "How do I size positions when trading multiple timeframes?",
      answer: "Allocate total risk across all positions. If you risk 2% total and have 4 positions, risk 0.5% each. Never exceed your total risk limit regardless of how many 'perfect' setups you see.",
      category: "RISK",
      difficulty: "ADVANCED",
      tags: ["position-sizing", "multiple-positions", "allocation"]
    },
    {
      section: "Risk Management",
      question: "When should I use trailing stops vs fixed stops?",
      answer: "Fixed stops for swing trades with clear invalidation levels. Trailing stops for trend-following strategies or when trend is accelerating. Never trail stops closer than your original risk in first 24 hours.",
      category: "RISK",
      difficulty: "EXPERT",
      tags: ["trailing-stops", "stop-management", "trends"]
    },

    // ADDITIONAL STRATEGY BUILDING ENTRIES
    {
      section: "Strategy Building",
      question: "How many strategies should I trade simultaneously?",
      answer: "Master ONE strategy completely before adding others. Most professionals use 2-3 strategies maximum. It's better to be excellent at one approach than mediocre at many. Complexity kills consistency.",
      category: "STRATEGY",
      difficulty: "INTERMEDIATE",
      tags: ["focus", "mastery", "simplicity"]
    },
    {
      section: "Strategy Building",
      question: "How do I backtest a strategy properly?",
      answer: "Use at least 2 years of data, include commission costs, test on multiple assets, account for slippage, and simulate realistic entry/exit timing. If it doesn't work in backtesting, it won't work live.",
      category: "STRATEGY",
      difficulty: "ADVANCED",
      tags: ["backtesting", "validation", "realism"]
    },

    // ADDITIONAL AUTOMATION ENTRIES
    {
      section: "Grid Bots & Automation",
      question: "How do I optimize grid bot settings for maximum profit?",
      answer: "Use dynamic grids that adjust to volatility. In low volatility, tighten grids to 0.5-1%. In high volatility, widen to 2-3%. Always set upper/lower bounds to prevent runaway losses.",
      category: "AUTOMATION",
      difficulty: "EXPERT",
      tags: ["grid-optimization", "volatility", "dynamic"]
    },
    {
      section: "Grid Bots & Automation",
      question: "What's the biggest mistake in algorithmic trading?",
      answer: "Over-optimization (curve fitting) to historical data. A strategy that works perfectly on past data but fails live was over-fitted. Keep strategies simple and test on out-of-sample data.",
      category: "AUTOMATION",
      difficulty: "EXPERT",
      tags: ["over-optimization", "curve-fitting", "validation"]
    },

    // ADDITIONAL ADVANCED TOOLS ENTRIES
    {
      section: "Advanced Technical Tools",
      question: "How do I use options flow data for crypto trading?",
      answer: "Large options positions create magnetic price levels. When massive calls expire at $4000 ETH, price often gravitates there. Monitor options open interest and max pain levels for directional bias.",
      category: "ADVANCED",
      difficulty: "EXPERT",
      tags: ["options-flow", "max-pain", "directional-bias"]
    },
    {
      section: "Advanced Technical Tools",
      question: "What is the most reliable volume indicator?",
      answer: "On-Balance Volume (OBV) shows smart money accumulation/distribution. If price makes new highs but OBV doesn't, expect reversal. OBV divergences often predict price movements by days or weeks.",
      category: "ADVANCED",
      difficulty: "ADVANCED",
      tags: ["obv", "divergences", "smart-money"]
    },

    // ADDITIONAL FUNDAMENTALS ENTRIES
    {
      section: "News & Fundamentals",
      question: "How do ETF approvals affect crypto prices?",
      answer: "ETF approvals create massive institutional demand waves. Bitcoin ETF approvals historically pump price 3-6 months before, dump on news, then resume uptrend as institutions slowly accumulate.",
      category: "FUNDAMENTALS",
      difficulty: "ADVANCED",
      tags: ["etf", "institutions", "cycles"]
    },
    {
      section: "News & Fundamentals",
      question: "Why do crypto prices often ignore good news during bear markets?",
      answer: "Markets are forward-looking. Good news is often already priced in, or overshadowed by macro conditions. In bear markets, even great news gets sold. Focus on price action, not headlines.",
      category: "FUNDAMENTALS",
      difficulty: "INTERMEDIATE",
      tags: ["news-trading", "bear-markets", "price-action"]
    },

    // ADDITIONAL DISCIPLINE ENTRIES
    {
      section: "Self-Discipline",
      question: "How do I stick to my trading plan during FOMO moments?",
      answer: "Write down the cost of breaking your rules vs missing one opportunity. Missing one trade costs nothing. Breaking rules can destroy months of progress. FOMO is expensive - discipline is profitable.",
      category: "DISCIPLINE",
      difficulty: "INTERMEDIATE",
      tags: ["fomo", "discipline", "opportunity-cost"]
    },
    {
      section: "Self-Discipline",
      question: "What's the best way to handle a losing streak?",
      answer: "Reduce position sizes by 50%, review your journal for patterns, take a few days off, and return with fresh perspective. Losing streaks test discipline - those who survive them become profitable long-term.",
      category: "DISCIPLINE",
      difficulty: "ADVANCED",
      tags: ["losing-streaks", "recovery", "position-sizing"]
    }
  ];

  getKnowledgeByCategory(category: string): TradingKnowledge[] {
    return this.knowledgeBase.filter(k => k.category === category);
  }

  searchKnowledge(query: string): TradingKnowledge[] {
    const searchTerm = query.toLowerCase();
    return this.knowledgeBase.filter(k => 
      k.question.toLowerCase().includes(searchTerm) ||
      k.answer.toLowerCase().includes(searchTerm) ||
      k.tags.some(tag => tag.includes(searchTerm))
    );
  }

  getAdviceForSituation(situation: string, marketCondition: string): TradingAdvice {
    const situation_lower = situation.toLowerCase();
    
    if (situation_lower.includes('loss') || situation_lower.includes('losing')) {
      return {
        topic: "Handling Trading Losses",
        advice: "Losses are part of trading business. The key is limiting them and learning from them.",
        actionItems: [
          "Review your entry and exit rules",
          "Check if you followed your stop-loss plan", 
          "Take a 30-minute break before next trade",
          "Journal what went wrong objectively",
          "Never increase position size after a loss"
        ],
        riskWarning: "Avoid revenge trading - it leads to bigger losses",
        marketContext: marketCondition
      };
    }
    
    if (situation_lower.includes('profit') || situation_lower.includes('winning')) {
      return {
        topic: "Managing Winning Trades",
        advice: "Winning trades need management too. Protect profits while letting winners run.",
        actionItems: [
          "Move stop-loss to breakeven after 1:1 profit",
          "Consider taking partial profits at key resistance",
          "Trail your stop-loss as price moves in your favor",
          "Don't get greedy - stick to your target",
          "Journal what made this trade successful"
        ],
        marketContext: marketCondition
      };
    }
    
    if (situation_lower.includes('emotional') || situation_lower.includes('fear') || situation_lower.includes('fomo')) {
      return {
        topic: "Emotional Trading Management", 
        advice: "Emotions are the biggest enemy of traders. Develop systems to control them.",
        actionItems: [
          "Step away from charts for 15 minutes",
          "Read your trading rules out loud",
          "Use smaller position sizes when emotional",
          "Set predetermined entry and exit points",
          "Consider stopping trading for the day"
        ],
        riskWarning: "Emotional decisions often lead to losses",
        marketCondition: marketCondition
      };
    }

    // Default advice
    return {
      topic: "General Trading Wisdom",
      advice: "Successful trading requires discipline, patience, and continuous learning.",
      actionItems: [
        "Follow your trading plan strictly",
        "Risk only 1-2% per trade",
        "Use proper position sizing",
        "Keep detailed trading journal",
        "Focus on process, not profits"
      ],
      marketContext: marketCondition
    };
  }

  generateDailyTradingWisdom(): string {
    const wisdomQuotes = [
      "The market is a device for transferring money from the impatient to the patient.",
      "Cut your losses short and let your profits run - this simple rule is 90% of successful trading.",
      "The best trades often feel uncomfortable at entry - that's when others are selling to you cheaply.",
      "Risk management isn't about avoiding losses - it's about ensuring they don't destroy you.",
      "Markets reward patience and punish urgency. Trade like a sniper, not a machine gun.",
      "Your trading edge comes from discipline, not prediction. Systems beat emotions every time.",
      "Small consistent gains compound into life-changing wealth. Big risky bets lead to ruin.",
      "The hardest part of trading isn't finding good setups - it's having the discipline to wait for them.",
      "Every loss teaches you something. Every win can make you overconfident. Learn from both.",
      "The market doesn't care about your bills, emotions, or opinions. It only respects proper risk management."
    ];
    
    const randomIndex = Math.floor(Math.random() * wisdomQuotes.length);
    return wisdomQuotes[randomIndex];
  }

  getTradingScorecard(): any {
    return {
      mindsetScore: this.calculateMindsetScore(),
      technicalScore: this.calculateTechnicalScore(), 
      riskScore: this.calculateRiskScore(),
      disciplineScore: this.calculateDisciplineScore(),
      overallRating: this.calculateOverallRating(),
      recommendations: this.getImprovementRecommendations()
    };
  }

  private calculateMindsetScore(): number {
    // Simulate scoring based on trading behavior
    return Math.floor(Math.random() * 30) + 70; // 70-100 range
  }

  private calculateTechnicalScore(): number {
    return Math.floor(Math.random() * 25) + 75; // 75-100 range
  }

  private calculateRiskScore(): number {
    return Math.floor(Math.random() * 20) + 80; // 80-100 range
  }

  private calculateDisciplineScore(): number {
    return Math.floor(Math.random() * 35) + 65; // 65-100 range
  }

  private calculateOverallRating(): string {
    const avg = (this.calculateMindsetScore() + this.calculateTechnicalScore() + 
                this.calculateRiskScore() + this.calculateDisciplineScore()) / 4;
    
    if (avg >= 90) return "MASTER TRADER";
    if (avg >= 80) return "ADVANCED TRADER";
    if (avg >= 70) return "INTERMEDIATE TRADER";
    if (avg >= 60) return "DEVELOPING TRADER";
    return "NOVICE TRADER";
  }

  private getImprovementRecommendations(): string[] {
    return [
      "Practice patience - wait for high-probability setups only",
      "Reduce position sizes during losing streaks",
      "Keep detailed trading journal for pattern recognition",
      "Focus on risk management over profit maximization",
      "Develop morning routine to center mindset before trading"
    ];
  }

  analyzeMarketPsychology(marketCondition: string): any {
    return {
      dominantEmotion: this.getDominantEmotion(marketCondition),
      crowdBehavior: this.analyzeCrowdBehavior(marketCondition),
      contrarian_opportunity: this.findContrarianOpportunity(marketCondition),
      advice: this.getMarketPsychologyAdvice(marketCondition)
    };
  }

  private getDominantEmotion(condition: string): string {
    if (condition.includes('bull') || condition.includes('up')) return "GREED";
    if (condition.includes('bear') || condition.includes('down')) return "FEAR";
    if (condition.includes('sideways') || condition.includes('range')) return "UNCERTAINTY";
    return "NEUTRAL";
  }

  private analyzeCrowdBehavior(condition: string): string {
    const emotions = this.getDominantEmotion(condition);
    if (emotions === "GREED") return "Crowd is euphoric, buying at high prices";
    if (emotions === "FEAR") return "Crowd is panicking, selling at low prices";
    return "Crowd is indecisive, waiting for clear direction";
  }

  private findContrarianOpportunity(condition: string): string {
    const emotions = this.getDominantEmotion(condition);
    if (emotions === "GREED") return "Look for selling opportunities, market may be overextended";
    if (emotions === "FEAR") return "Look for buying opportunities, market may be oversold";
    return "Wait for clearer emotional extremes before taking contrarian positions";
  }

  private getMarketPsychologyAdvice(condition: string): string {
    return "When others are greedy, be fearful. When others are fearful, be greedy. The best opportunities come when the crowd is wrong.";
  }
}

export const tradingBrain = new TradingBrainEngine();