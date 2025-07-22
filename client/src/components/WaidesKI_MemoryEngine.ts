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

  // Help and guidance queries
  if (messageText.includes('help') || messageText.includes('guide') || messageText.includes('how') || messageText.includes('what')) {
    return {
      message: `🔮 **Waides KI Guidance**\n\n**I can help you with:**\n• **Trading Bot Setup** - Configure WaidBot and WaidBot Pro\n• **Market Analysis** - ETH price predictions and technical analysis\n• **Wallet Management** - SmaiSika wallet and funding options\n• **Strategy Development** - Trading strategies and risk management\n• **Learning Resources** - Trading education and academy\n\n**Quick Actions:**\n✅ **Ask about ETH** - Get current price and predictions\n✅ **Trading strategies** - Learn profitable trading methods\n✅ **Fund wallet** - Add money to your SmaiSika wallet\n✅ **Start trading** - Activate bots and begin trading\n\n**Example questions:** "What's ETH price?", "How to trade?", "Fund my wallet"`,
      confidence: 95,
      recommendations: [
        { page: 'Dashboard', route: '/dashboard', description: 'Start with market overview and statistics' },
        { page: 'Learning', route: '/learning', description: 'Complete trading education and academy' },
        { page: 'WaidBot Engine', route: '/waidbot-engine', description: 'Configure trading bots and automation' }
      ]
    };
  }

  // Strategy queries
  if (messageText.includes('strategy') || messageText.includes('trading plan') || messageText.includes('how to trade')) {
    return {
      message: `🎯 **Trading Strategy Guidance**\n\n**Strategy Types:**\n• **Scalping** - Quick short-term trades\n• **Swing Trading** - Medium-term positions\n• **HODLing** - Long-term holding strategy\n• **Divine Guidance** - Kons Powa spiritual trading\n\n**Recommended Learning:**\n✅ **Trading Academy** - Complete education\n✅ **WaidBot Pro** - Advanced strategy analysis\n✅ **Risk Management** - Protect your capital\n\n**Get Started:** Click "Trading Strategies" button or visit the Learning page!`,
      confidence: 88,
      recommendations: [
        { page: 'Learning', route: '/learning', description: 'Complete trading education and academy' },
        { page: 'WaidBot Pro', route: '/waidbot-pro', description: 'Advanced strategy analysis and recommendations' }
      ]
    };
  }

  // Wallet and funding queries
  if (messageText.includes('fund') || messageText.includes('wallet') || messageText.includes('balance') || messageText.includes('money')) {
    return {
      message: `💰 **Wallet & Funding Help**\n\n**SmaiSika Wallet Balance:** ꠄ${smaiBalance?.toLocaleString() || 'Loading...'}\n**Local Currency:** ₦${localBalance?.toLocaleString() || 'Loading...'}\n\n**Funding Options:**\n• **Paystack** - Nigerian payment gateway\n• **Flutterwave** - African payment solutions\n• **Bank Transfer** - Direct local transfers\n• **Crypto Deposit** - USDT and other cryptocurrencies\n\n**Recommended Actions:**\n✅ **SmaiSika Wallet** - Manage your funds\n✅ **Admin Panel** - Configure payment methods\n\n**Safety First:** Always verify transactions and use secure payment methods!`,
      confidence: 92,
      recommendations: [
        { page: 'SmaiSika Wallet', route: '/wallet', description: 'Manage your wallet and view transactions' },
        { page: 'Admin Panel', route: '/admin', description: 'Configure payment methods and security' }
      ]
    };
  }

  // General ETH queries
  if (messageText.includes('eth') || messageText.includes('ethereum')) {
    return {
      message: `⚡ **Ethereum Trading Hub**\n\n**Current ETH:** $${enhancedDashboardData?.ethData?.price || 'Loading...'}\n**24h Change:** ${enhancedDashboardData?.ethData?.priceChange24h?.toFixed(2) || 'N/A'}%\n\n**ETH Services:**\n• **Kons Powa Predictions** - Spiritual ETH analysis\n• **Technical Analysis** - Chart patterns and indicators\n• **Automated Trading** - ETH-focused bots\n• **Risk Management** - Position sizing and stops\n\n**Best Pages for ETH:**\n✅ **Dashboard** - ETH overview and metrics\n✅ **Charts** - ETH price analysis\n✅ **WaidBot Engine** - ETH trading automation\n\n**Pro Tip:** Use the "Kons Powa ETH Prediction" button for divine insights!`,
      confidence: 95,
      recommendations: [
        { page: 'Dashboard', route: '/dashboard', description: 'Complete ETH trading dashboard' },
        { page: 'Charts', route: '/charts', description: 'ETH technical analysis and charts' },
        { page: 'WaidBot Engine', route: '/waidbot-engine', description: 'ETH-focused trading automation' }
      ]
    };
  }

  // Default trading response
  return {
    message: `🔮 **Waides KI Trading Assistant**\n\nI understand you're interested in: "${query}"\n\n**I can help you with:**\n• Trading bot setup and management\n• Market analysis and predictions\n• Strategy development and education\n• Wallet management and funding\n• Risk management and safety\n\n**Popular Pages:**\n✅ **Dashboard** - Market overview\n✅ **WaidBot Engine** - Trading automation\n✅ **Charts** - Technical analysis\n✅ **Learning** - Trading education\n\n**Quick Start:** Try the quick action buttons above or ask me specific questions about trading!`,
    confidence: 75,
    recommendations: [
      { page: 'Dashboard', route: '/dashboard', description: 'Start with market overview' },
      { page: 'WaidBot Engine', route: '/waidbot-engine', description: 'Explore trading automation' },
      { page: 'Learning', route: '/learning', description: 'Learn trading fundamentals' }
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