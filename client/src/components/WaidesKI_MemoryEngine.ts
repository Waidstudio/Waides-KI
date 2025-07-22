// Convert from JS to TypeScript with proper types
import type { ChatMessage, OracleResponse } from '@/types/componentTypes';

interface SmartAnswerResponse {
  message: string;
  confidence: number;
  recommendations?: Array<{
    page: string;
    route: string;
    description: string;
  }>;
}

export default function getSmartAnswer(
  query: string, 
  enhancedDashboardData?: any, 
  smaiBalance?: number, 
  localBalance?: number
): SmartAnswerResponse {
  const messageText = query.toLowerCase();

  // Learning about crypto/trading queries
  if (messageText.includes('learn') || messageText.includes('crypto') || messageText.includes('education') || messageText.includes('study') || messageText.includes('course')) {
    return {
      message: `# 📚 KI Learning Guide - Your Personal Education Assistant

## Welcome to Your Crypto Trading Education Journey

Excellent! I see you're ready to learn about cryptocurrency trading. As your dedicated learning guide, I'm here to ensure you build solid foundations before risking any capital.

### 🎯 **Your Next Action - Start Here:**
**Please click this link to access your complete learning path:**
> **[🚀 Visit Trading Academy - Start Learning Now](/learning)**

---

## Why the Trading Academy is Perfect for You

The Trading Academy isn't just another course - it's a comprehensive, structured learning system designed specifically for beginners who want to become skilled traders:

### 📖 **Core Learning Modules:**

**Module 1: Cryptocurrency Fundamentals**
- Blockchain technology explained simply
- Understanding different types of cryptocurrencies
- How crypto markets work vs traditional markets
- Wallet security and best practices

**Module 2: Technical Analysis Mastery**
- Reading candlestick charts effectively
- Key indicators and what they mean
- Trend identification and pattern recognition
- Support and resistance levels

**Module 3: Trading Strategies & Execution**
- Scalping strategies for quick profits
- Swing trading for medium-term gains
- Long-term investment approaches
- When and how to enter/exit positions

**Module 4: Risk Management & Psychology**
- Position sizing calculations
- Stop-loss and take-profit strategies
- Managing emotions while trading
- Building discipline and patience

### 🎯 **Interactive Learning Features:**
- Real-time market examples
- Practice exercises with immediate feedback
- Quiz assessments to test knowledge
- Case studies from successful traders
- Risk-free simulation environments

---

## Your Learning Path - Start Today

> **Step 1:** Click the Trading Academy link above
> **Step 2:** Begin with Module 1: "Cryptocurrency Fundamentals"
> **Step 3:** Complete each module sequentially
> **Step 4:** Take quizzes to verify understanding
> **Step 5:** Apply knowledge in safe practice environments

---

## Why Education Before Trading?

**Critical Statistics:**
- 90% of new traders lose money within their first year
- Proper education reduces failure rate by 70%
- Educated traders make 3x more consistent profits
- Risk management knowledge prevents 80% of major losses

**Remember:** Every successful trader started with education. Skip this step at your own risk.

### 🚀 **Ready to Begin?**
**[Click here to start your Trading Academy journey →](/learning)**`,
      confidence: 98,
      recommendations: [
        { page: 'Trading Academy', route: '/learning', description: 'Complete crypto education course - start here first!' },
        { page: 'Dashboard', route: '/dashboard', description: 'Practice reading real market data after learning basics' },
        { page: 'Charts', route: '/charts', description: 'Apply chart analysis skills you learn in the academy' }
      ]
    };
  }

  // Help and guidance queries - redirect to learning
  if (messageText.includes('help') || messageText.includes('guide') || messageText.includes('how') || messageText.includes('what')) {
    return {
      message: `# 👋 Welcome to KI Learning Assistant

## Your Personal Guide to Crypto Trading Success

I'm your dedicated learning assistant, designed to guide you toward profitable trading through comprehensive education. Rather than providing quick answers that might lead to costly mistakes, I focus on building your knowledge foundation.

### 🎯 **Immediate Action Required:**
**Start your education journey today:**
> **[📚 Access Trading Academy - Complete Learning System →](/learning)**

---

## Why I Prioritize Education Over Quick Answers

### 🚨 **The Hard Truth About Trading:**
**Without proper education, 90% of new traders lose money.** I'm here to make sure you're in the successful 10%.

### 📊 **What Makes the Difference:**
- **Educated traders:** 70% success rate over 1 year
- **Self-taught traders:** 10% success rate over 1 year
- **Gambling mindset:** 5% success rate over 1 year

---

## Your Complete Learning System Awaits

### 🎓 **Trading Academy - Premium Education Modules:**

**Foundation Level:**
- Cryptocurrency fundamentals and blockchain technology
- Market mechanics and how exchanges work
- Wallet security and transaction management
- Understanding volatility and market cycles

**Intermediate Level:**
- Technical analysis and chart reading
- Trading indicators and signals
- Risk assessment and position sizing
- Entry and exit strategy development

**Advanced Level:**
- Complex trading strategies (scalping, swing, position)
- Portfolio management and diversification
- Trading psychology and emotional control
- Automated trading system integration

### 🛠️ **Interactive Learning Tools:**
- Real-time market simulators
- Risk-free practice environments
- Progress tracking and assessments
- Case study analysis
- Trading journal templates

---

## The Professional Approach to Trading

> **Quote from Warren Buffett:** *"Risk comes from not knowing what you're doing."*

### 📈 **Your Success Timeline:**
1. **Week 1-2:** Complete fundamental education
2. **Week 3-4:** Practice with simulated trading
3. **Week 5-6:** Learn risk management systems
4. **Week 7-8:** Develop personal trading strategy
5. **Week 9+:** Begin live trading with small amounts

---

## Ready to Join the Successful 10%?

**Don't let impatience cost you money. Invest in your education first.**

### 🚀 **Start Your Journey:**
**[Begin Trading Academy Education →](/learning)**

After completing your education, you'll have access to:
- Advanced trading tools and bots
- Real-time market analysis
- Professional-grade charting systems
- Automated risk management

**Remember:** Every successful trader started with education. Make this your first step toward financial freedom.`,
      confidence: 95,
      recommendations: [
        { page: 'Trading Academy', route: '/learning', description: 'Your complete crypto education starts here' },
        { page: 'WaidBot Engine', route: '/waidbot-engine', description: 'Set up automated trading after learning fundamentals' },
        { page: 'Dashboard', route: '/dashboard', description: 'Practice market analysis with real data' }
      ]
    };
  }

  // Strategy queries - redirect to learning
  if (messageText.includes('strategy') || messageText.includes('trading plan') || messageText.includes('how to trade') || messageText.includes('trade')) {
    return {
      message: `📈 **Learning Trading Strategies**\n\nI understand you want to learn about trading strategies. This is excellent! Instead of giving you a quick overview, let me direct you to comprehensive strategy education:\n\n🎯 **Go to Trading Academy** → [Start Strategy Course](/learning)\n\n**Why learn strategies properly?**\n• Each strategy has specific market conditions where it works best\n• You need to understand risk management for each approach\n• Proper entry and exit rules are crucial for success\n• Psychology and discipline vary by strategy type\n\n**Strategy modules you'll study:**\n• **Scalping Strategies** - Quick 1-5 minute trades\n• **Day Trading** - Intraday position management\n• **Swing Trading** - Multi-day trend following\n• **Position Trading** - Long-term wealth building\n• **Risk Management** - Protecting your capital\n\n**Start with Module 3: "Trading Strategies"** in the academy. Don't skip the fundamentals - they're the foundation of profitable trading!`,
      confidence: 95,
      recommendations: [
        { page: 'Trading Academy', route: '/learning', description: 'Complete strategy education course - essential for success!' },
        { page: 'Charts', route: '/charts', description: 'Practice strategy identification on live charts after learning' },
        { page: 'WaidBot Engine', route: '/waidbot-engine', description: 'Automate strategies you learn once you understand them' }
      ]
    };
  }

  // Wallet and funding queries - educational approach
  if (messageText.includes('fund') || messageText.includes('wallet') || messageText.includes('balance') || messageText.includes('money')) {
    return {
      message: `💰 **Learning About Wallets & Funding**\n\nI see you're interested in wallet management and funding. Before diving into funding, let me guide you to understand wallets properly:\n\n🎯 **First, learn the basics** → [Wallet Education](/learning)\n\n**Visit the Trading Academy to understand:**\n• What are crypto wallets and how they work\n• Different types of wallets (hot vs cold storage)\n• Security best practices for wallet management\n• How to safely deposit and withdraw funds\n• Understanding transaction fees and confirmations\n\n**Then visit your wallet** → [SmaiSika Wallet](/wallet)\n\n**Why learn first?**\n• Avoid costly mistakes with wrong addresses\n• Understand transaction fees before funding\n• Learn security practices to protect your money\n• Know how to track and verify transactions\n\n**Current Balance:** ꠄ${smaiBalance?.toLocaleString() || 'Loading...'}\n\n**Ready to learn?** Start with Module 2: "Wallet Fundamentals" in the Trading Academy!`,
      confidence: 92,
      recommendations: [
        { page: 'Trading Academy', route: '/learning', description: 'Learn wallet security and management first!' },
        { page: 'SmaiSika Wallet', route: '/wallet', description: 'Visit your wallet after understanding the basics' },
        { page: 'Admin Panel', route: '/admin', description: 'Configure payment methods once you understand security' }
      ]
    };
  }

  // ETH/Ethereum queries - educational focus
  if (messageText.includes('eth') || messageText.includes('ethereum') || messageText.includes('price')) {
    return {
      message: `⚡ **Learning About Ethereum**\n\nExcellent question about Ethereum! Instead of just showing you the current price, let me guide you to truly understand ETH:\n\n🎯 **Start your ETH education** → [Ethereum Course](/learning)\n\n**Visit the Trading Academy to learn:**\n• What is Ethereum and how it differs from Bitcoin\n• Understanding ETH price movements and market cycles\n• How to read ETH charts and identify trends\n• Smart contracts and DeFi ecosystem impact on price\n• Best times to buy, sell, or hold ETH\n\n**Current ETH Price:** $${enhancedDashboardData?.ethData?.price || 'Loading...'} (24h: ${enhancedDashboardData?.ethData?.priceChange24h?.toFixed(2) || 'N/A'}%)\n\n**After learning, explore:**\n• **Dashboard** - Apply your knowledge to real market data\n• **Charts** - Practice technical analysis on ETH\n• **WaidBot Engine** - Automate ETH strategies you understand\n\n**Remember:** Knowing the price is just 1% of successful trading. Understanding WHY the price moves is the other 99%!`,
      confidence: 95,
      recommendations: [
        { page: 'Trading Academy', route: '/learning', description: 'Learn about Ethereum fundamentals and price analysis' },
        { page: 'Charts', route: '/charts', description: 'Practice ETH chart analysis after learning the basics' },
        { page: 'Dashboard', route: '/dashboard', description: 'Apply your ETH knowledge to live market data' }
      ]
    };
  }

  // Default educational response - always guide to learning
  return {
    message: `👨‍🏫 **KI Learning Assistant**\n\nI see you're asking: "${query}"\n\nAs your learning guide, I always recommend starting with proper education before jumping into trading or investing.\n\n🎯 **My #1 recommendation for you:**\n**Start with comprehensive education** → [Trading Academy](/learning)\n\n**Why education first?**\n• 90% of traders lose money due to lack of knowledge\n• Proper education saves you from costly mistakes\n• Understanding concepts gives you confidence\n• Structured learning builds solid foundations\n• You'll make better decisions with knowledge\n\n**What the Trading Academy offers:**\n• Module 1: Crypto & Blockchain Fundamentals\n• Module 2: Wallet Security & Management\n• Module 3: Trading Strategies & Techniques\n• Module 4: Technical Analysis & Chart Reading\n• Module 5: Risk Management & Psychology\n\n**After completing your education, explore:**\n• Practice with real data on the Dashboard\n• Apply knowledge using trading tools\n• Start small with automated systems\n\n**Ready to become a knowledgeable trader?** Click the link above and start learning today!`,
    confidence: 98,
    recommendations: [
      { page: 'Trading Academy', route: '/learning', description: 'Complete crypto education course - your first step to success!' },
      { page: 'Dashboard', route: '/dashboard', description: 'Practice applying your knowledge with real market data' },
      { page: 'Charts', route: '/charts', description: 'Use technical analysis skills you learn in the academy' }
    ]
  };
}

export function detectCommandTrigger(message: string): string | null {
  const commands = [
    'activate waidbot',
    'start trading',
    'show charts',
    'fund wallet',
    'check balance',
    'divine reading',
    'kons powa',
    'spiritual guidance'
  ];

  for (const command of commands) {
    if (message.toLowerCase().includes(command)) {
      return command;
    }
  }

  return null;
}

export function detectPageRecommendation(message: string): { page: string; route: string } | null {
  const pageKeywords = {
    dashboard: ['dashboard', 'overview', 'main', 'home'],
    trading: ['trade', 'trading', 'bot', 'waidbot'],
    wallet: ['wallet', 'balance', 'fund', 'money'],
    learning: ['learn', 'education', 'academy', 'tutorial'],
    charts: ['chart', 'price', 'analysis', 'technical']
  };

  const text = message.toLowerCase();

  for (const [page, keywords] of Object.entries(pageKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      const routeMap: Record<string, string> = {
        dashboard: '/dashboard',
        trading: '/waidbot-engine',
        wallet: '/wallet',
        learning: '/learning',
        charts: '/charts'
      };

      return { page: page.charAt(0).toUpperCase() + page.slice(1), route: routeMap[page] };
    }
  }

  return null;
}