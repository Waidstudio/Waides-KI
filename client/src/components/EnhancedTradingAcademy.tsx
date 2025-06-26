import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Star, 
  Clock, 
  Users, 
  TrendingUp, 
  Award,
  Play,
  Check,
  Lock,
  Brain,
  Zap,
  Crown,
  MessageCircle,
  BarChart3,
  PieChart,
  LineChart,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  GraduationCap,
  Bot,
  ChevronRight,
  PlayCircle,
  FileText,
  Calculator,
  TrendingDown,
  Shield,
  Eye,
  Sparkles
} from 'lucide-react';

// Enhanced Trading Academy with KonsAi Integration
export default function EnhancedTradingAcademy() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [lessonProgress, setLessonProgress] = useState<{[key: number]: boolean}>({});
  const [konsAiChat, setKonsAiChat] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'konsai', message: string, timestamp: number}>>([]);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [calculatorInputs, setCalculatorInputs] = useState({
    positionSize: { accountBalance: '', riskPercent: '', stopLossDistance: '' },
    riskReward: { entryPrice: '', stopLoss: '', takeProfit: '' },
    portfolio: { positions: '' }
  });
  const [calculatorResults, setCalculatorResults] = useState<{
    positionSize: any,
    riskReward: any,
    portfolio: any
  }>({
    positionSize: null,
    riskReward: null,
    portfolio: null
  });
  const queryClient = useQueryClient();

  // Comprehensive Trading Courses
  const tradingCourses = [
    {
      id: 'fundamentals',
      title: 'Trading Fundamentals',
      description: 'Learn the core concepts of trading, market mechanics, and financial instruments',
      level: 'BEGINNER',
      duration: '4 hours',
      lessons: 12,
      category: 'FOUNDATIONS',
      icon: <BookOpen className="h-6 w-6" />,
      topics: ['Market Types', 'Order Types', 'Risk vs Reward', 'Market Psychology', 'Basic Analysis']
    },
    {
      id: 'technical-analysis',
      title: 'Technical Analysis Mastery',
      description: 'Master chart patterns, indicators, and technical trading strategies',
      level: 'INTERMEDIATE',
      duration: '6 hours',
      lessons: 18,
      category: 'ANALYSIS',
      icon: <BarChart3 className="h-6 w-6" />,
      topics: ['Chart Patterns', 'Support/Resistance', 'Moving Averages', 'RSI & MACD', 'Volume Analysis']
    },
    {
      id: 'risk-management',
      title: 'Risk Management & Capital Preservation',
      description: 'Protect your capital with advanced risk management techniques',
      level: 'INTERMEDIATE',
      duration: '3 hours',
      lessons: 10,
      category: 'RISK',
      icon: <Shield className="h-6 w-6" />,
      topics: ['Position Sizing', 'Stop Loss', 'Portfolio Management', 'Drawdown Control', 'Kelly Criterion']
    },
    {
      id: 'psychology',
      title: 'Trading Psychology & Discipline',
      description: 'Develop the mental framework for consistent trading success',
      level: 'ADVANCED',
      duration: '5 hours',
      lessons: 15,
      category: 'MINDSET',
      icon: <Brain className="h-6 w-6" />,
      topics: ['Emotional Control', 'FOMO & Fear', 'Discipline', 'Patience', 'Mental Models']
    },
    {
      id: 'crypto-trading',
      title: 'Cryptocurrency Trading Strategies',
      description: 'Navigate the crypto markets with specialized strategies and insights',
      level: 'INTERMEDIATE',
      duration: '4 hours',
      lessons: 14,
      category: 'CRYPTO',
      icon: <TrendingUp className="h-6 w-6" />,
      topics: ['DeFi Trading', 'Altcoin Analysis', 'Market Cycles', 'On-Chain Analysis', 'Yield Strategies']
    },
    {
      id: 'advanced-strategies',
      title: 'Advanced Trading Strategies',
      description: 'Complex strategies for experienced traders seeking alpha',
      level: 'EXPERT',
      duration: '8 hours',
      lessons: 24,
      category: 'STRATEGIES',
      icon: <Crown className="h-6 w-6" />,
      topics: ['Arbitrage', 'Options Trading', 'Algorithmic Trading', 'Market Making', 'Derivatives']
    }
  ];

  // Detailed Course Lessons - Trading Psychology & Discipline
  const tradingPsychologyLessons = [
    {
      id: 1,
      title: 'The Psychology of Trading Success',
      duration: '25 min',
      type: 'theory',
      content: {
        objectives: [
          'Understand how psychology impacts trading performance',
          'Identify the key mental traits of successful traders',
          'Recognize the difference between amateur and professional mindset'
        ],
        keyPoints: [
          'Trading is 80% psychology and 20% strategy',
          'Successful traders control emotions rather than being controlled by them',
          'The market tests your emotional weaknesses repeatedly',
          'Consistency comes from disciplined execution, not perfect predictions'
        ],
        summary: 'Trading psychology is the foundation of consistent profitability. Understanding how emotions affect decision-making and developing mental discipline are more important than any technical strategy. This lesson establishes the psychological framework needed for trading success.'
      }
    },
    {
      id: 2,
      title: 'Understanding Fear and Greed Cycles',
      duration: '30 min',
      type: 'theory',
      content: {
        objectives: [
          'Recognize how fear and greed manifest in trading decisions',
          'Learn to identify market fear and greed cycles',
          'Develop strategies to counteract emotional trading impulses'
        ],
        keyPoints: [
          'Fear causes traders to exit winning trades too early',
          'Greed leads to holding losing positions too long',
          'Market cycles are driven by collective fear and greed',
          'Contrarian thinking often provides the best opportunities'
        ],
        summary: 'Fear and greed are the two dominant emotions that drive market behavior and individual trading decisions. Learning to recognize these emotions in yourself and the market is crucial for making rational trading decisions and capitalizing on emotional extremes.'
      }
    },
    {
      id: 3,
      title: 'Conquering FOMO (Fear of Missing Out)',
      duration: '28 min',
      type: 'practical',
      content: {
        objectives: [
          'Identify FOMO triggers and warning signs',
          'Develop systematic approaches to avoid FOMO trading',
          'Create personal rules for trade entry and patience'
        ],
        keyPoints: [
          'FOMO leads to chasing prices and poor entry points',
          'There are always new opportunities in the market',
          'Patience is more profitable than activity',
          'Having a trading plan reduces FOMO impulses'
        ],
        summary: 'FOMO is one of the most destructive emotions in trading, leading to impulsive decisions and poor risk management. This lesson provides practical strategies for maintaining discipline and waiting for proper setups instead of chasing the market.'
      }
    },
    {
      id: 4,
      title: 'Dealing with Trading Losses and Drawdowns',
      duration: '35 min',
      type: 'practical',
      content: {
        objectives: [
          'Develop healthy attitudes toward trading losses',
          'Learn psychological strategies for handling drawdowns',
          'Build resilience and maintain confidence during difficult periods'
        ],
        keyPoints: [
          'Losses are part of trading - expect them and plan for them',
          'How you handle losses determines long-term success',
          'Drawdowns test your psychological strength and system faith',
          'Recovery requires both mental and strategic adjustments'
        ],
        summary: 'Learning to handle losses and drawdowns psychologically is essential for long-term trading success. This lesson teaches how to maintain emotional balance during difficult periods and use setbacks as learning opportunities rather than confidence destroyers.'
      }
    },
    {
      id: 5,
      title: 'Building Unshakeable Trading Discipline',
      duration: '32 min',
      type: 'practical',
      content: {
        objectives: [
          'Understand the components of trading discipline',
          'Develop personal accountability systems',
          'Create habits that support consistent execution'
        ],
        keyPoints: [
          'Discipline means following your plan even when you don\'t want to',
          'Small, consistent actions build strong trading habits',
          'Rules without consequences are merely suggestions',
          'Discipline is developed through practice and reinforcement'
        ],
        summary: 'Trading discipline is the ability to consistently execute your trading plan regardless of market conditions or emotional state. This lesson provides frameworks for building and maintaining the discipline necessary for long-term trading success.'
      }
    },
    {
      id: 6,
      title: 'The Winner\'s Mindset vs. Loser\'s Mindset',
      duration: '25 min',
      type: 'theory',
      content: {
        objectives: [
          'Identify characteristics of winning and losing trader mentalities',
          'Transform limiting beliefs into empowering thoughts',
          'Develop a growth mindset for continuous improvement'
        ],
        keyPoints: [
          'Winners focus on process; losers focus on outcomes',
          'Successful traders take responsibility; unsuccessful ones blame external factors',
          'Growth mindset sees failures as learning opportunities',
          'Confidence comes from preparation and consistent execution'
        ],
        summary: 'The difference between successful and unsuccessful traders often lies in their mindset and approach to the market. This lesson explores the mental frameworks that separate winners from losers and how to cultivate a winning mentality.'
      }
    },
    {
      id: 7,
      title: 'Overconfidence and Revenge Trading',
      duration: '30 min',
      type: 'practical',
      content: {
        objectives: [
          'Recognize signs of overconfidence and its dangers',
          'Understand the revenge trading cycle and how to break it',
          'Develop strategies for maintaining emotional equilibrium'
        ],
        keyPoints: [
          'Overconfidence leads to larger position sizes and increased risk',
          'Revenge trading attempts to recover losses through emotional decisions',
          'Both patterns destroy accounts faster than any market movement',
          'Humility and respect for the market are essential for survival'
        ],
        summary: 'Overconfidence and revenge trading are two of the most dangerous psychological traps in trading. This lesson teaches how to recognize these patterns early and implement safeguards to prevent emotional decision-making from destroying your account.'
      }
    },
    {
      id: 8,
      title: 'Stress Management and Mental Health',
      duration: '28 min',
      type: 'practical',
      content: {
        objectives: [
          'Understand how stress affects trading performance',
          'Learn stress reduction techniques for traders',
          'Develop sustainable trading practices for mental health'
        ],
        keyPoints: [
          'Chronic stress impairs decision-making and judgment',
          'Physical health directly impacts trading performance',
          'Regular breaks and exercise improve mental clarity',
          'Trading should enhance life, not consume it'
        ],
        summary: 'Managing stress and maintaining mental health are crucial for sustainable trading success. This lesson covers practical techniques for managing trading-related stress and maintaining psychological well-being in a high-pressure environment.'
      }
    },
    {
      id: 9,
      title: 'Patience and Timing in Trading',
      duration: '22 min',
      type: 'theory',
      content: {
        objectives: [
          'Develop patience as a trading skill',
          'Learn to wait for optimal market conditions',
          'Understand the relationship between patience and profitability'
        ],
        keyPoints: [
          'The market rewards patience and punishes impatience',
          'Best traders wait for their setups rather than forcing trades',
          'Doing nothing is often the most profitable action',
          'Quality over quantity leads to better results'
        ],
        summary: 'Patience is one of the most undervalued skills in trading. This lesson teaches how to develop patience as a competitive advantage and understand that in trading, sometimes the best action is no action at all.'
      }
    },
    {
      id: 10,
      title: 'Creating Your Personal Trading Rules',
      duration: '35 min',
      type: 'practical',
      content: {
        objectives: [
          'Develop personalized trading rules and guidelines',
          'Create accountability systems for rule adherence',
          'Build flexibility within structured frameworks'
        ],
        keyPoints: [
          'Personal rules should reflect your risk tolerance and lifestyle',
          'Written rules are more powerful than mental commitments',
          'Rules should be specific, measurable, and actionable',
          'Regular review and refinement of rules is necessary'
        ],
        summary: 'Personal trading rules create structure and consistency in an unpredictable environment. This lesson guides you through creating a personalized set of trading rules that align with your goals, personality, and risk tolerance.'
      }
    },
    {
      id: 11,
      title: 'The Power of Routine and Habits',
      duration: '25 min',
      type: 'practical',
      content: {
        objectives: [
          'Understand how routines support trading success',
          'Develop pre-market and post-market routines',
          'Build positive trading habits that become automatic'
        ],
        keyPoints: [
          'Routines reduce decision fatigue and improve focus',
          'Consistent habits create reliable performance patterns',
          'Pre-market preparation sets the tone for the trading day',
          'Post-market review drives continuous improvement'
        ],
        summary: 'Successful traders follow consistent routines that prepare them mentally and strategically for market sessions. This lesson helps you develop powerful routines and habits that support disciplined trading and continuous improvement.'
      }
    },
    {
      id: 12,
      title: 'Handling Success and Winning Streaks',
      duration: '20 min',
      type: 'theory',
      content: {
        objectives: [
          'Learn to handle success without becoming overconfident',
          'Understand the psychological challenges of winning streaks',
          'Maintain discipline during profitable periods'
        ],
        keyPoints: [
          'Success can be more dangerous than failure in trading',
          'Winning streaks often lead to increased risk-taking',
          'Humility during success preserves long-term profitability',
          'Good times are when you should prepare for difficult times'
        ],
        summary: 'Learning to handle success properly is often more challenging than dealing with losses. This lesson addresses the psychological pitfalls of winning streaks and how to maintain discipline and perspective during profitable periods.'
      }
    },
    {
      id: 13,
      title: 'Social Media and External Influences',
      duration: '18 min',
      type: 'practical',
      content: {
        objectives: [
          'Recognize how external influences affect trading decisions',
          'Develop independence from social media trading advice',
          'Create information filters for better decision-making'
        ],
        keyPoints: [
          'Social media often amplifies emotional trading decisions',
          'Following others\' trades prevents developing your own skills',
          'Information overload leads to analysis paralysis',
          'Independent thinking is essential for trading success'
        ],
        summary: 'External influences, particularly social media, can significantly impact trading psychology and decision-making. This lesson teaches how to maintain independence and filter information to support rather than hinder your trading success.'
      }
    },
    {
      id: 14,
      title: 'Long-term Perspective and Goal Setting',
      duration: '30 min',
      type: 'theory',
      content: {
        objectives: [
          'Develop a long-term perspective on trading success',
          'Set realistic and achievable trading goals',
          'Balance short-term performance with long-term objectives'
        ],
        keyPoints: [
          'Trading success is measured over years, not days or weeks',
          'Realistic goals prevent disappointment and emotional trading',
          'Long-term thinking improves decision-making quality',
          'Consistent small gains compound into significant wealth'
        ],
        summary: 'Maintaining a long-term perspective is crucial for sustainable trading success. This lesson helps you set realistic goals and develop the patience needed to achieve lasting profitability in the markets.'
      }
    },
    {
      id: 15,
      title: 'Developing Your Trading Psychology Plan',
      duration: '40 min',
      type: 'practical',
      content: {
        objectives: [
          'Integrate all psychological concepts into a comprehensive plan',
          'Create systems for ongoing psychological development',
          'Establish metrics for measuring psychological progress'
        ],
        keyPoints: [
          'A written psychology plan provides structure and accountability',
          'Regular self-assessment identifies areas for improvement',
          'Psychological development is an ongoing process, not a destination',
          'Mental preparation is as important as technical preparation'
        ],
        summary: 'This final lesson integrates all previous concepts into a comprehensive trading psychology plan. You\'ll create a structured approach to ongoing psychological development that supports consistent trading performance and continuous improvement.'
      }
    }
  ];

  // Detailed Course Lessons - Cryptocurrency Trading Strategies
  const cryptoTradingLessons = [
    {
      id: 1,
      title: 'Introduction to Cryptocurrency Markets',
      duration: '20 min',
      type: 'theory',
      content: {
        objectives: [
          'Understand the unique characteristics of cryptocurrency markets',
          'Learn the differences between crypto and traditional markets',
          'Identify key market participants and their impact'
        ],
        keyPoints: [
          'Crypto markets operate 24/7 with no closing times',
          'Higher volatility provides both opportunity and risk',
          'Market is influenced by technology, regulation, and sentiment',
          'Liquidity varies significantly between different cryptocurrencies'
        ],
        summary: 'Cryptocurrency markets present unique opportunities and challenges compared to traditional financial markets. Understanding the 24/7 nature, extreme volatility, and diverse factors that drive price movements is essential for developing effective trading strategies in this dynamic environment.'
      }
    },
    {
      id: 2,
      title: 'Understanding Crypto Market Cycles',
      duration: '25 min',
      type: 'theory',
      content: {
        objectives: [
          'Learn to identify crypto market cycles and phases',
          'Understand Bitcoin\'s influence on the broader crypto market',
          'Recognize accumulation, markup, distribution, and markdown phases'
        ],
        keyPoints: [
          'Crypto markets follow predictable cycles of boom and bust',
          'Bitcoin typically leads market cycles with altcoins following',
          'Market cycles are influenced by halving events and adoption waves',
          'Each cycle tends to be longer and less volatile than the previous'
        ],
        summary: 'Crypto market cycles follow patterns of accumulation, growth, euphoria, and correction. Understanding these cycles helps traders position themselves advantageously, recognizing when to accumulate during bear markets and when to take profits during bull markets.'
      }
    },
    {
      id: 3,
      title: 'Bitcoin Dominance and Market Correlation',
      duration: '18 min',
      type: 'practical',
      content: {
        objectives: [
          'Understand Bitcoin dominance and its market implications',
          'Learn how altcoins correlate with Bitcoin movements',
          'Develop strategies based on dominance trends'
        ],
        keyPoints: [
          'Bitcoin dominance indicates market sentiment and risk appetite',
          'Rising dominance often signals risk-off behavior in crypto',
          'Falling dominance can indicate altcoin season opportunities',
          'Use dominance as a macro indicator for portfolio allocation'
        ],
        summary: 'Bitcoin dominance is a crucial metric for understanding crypto market dynamics. When dominance rises, capital flows into Bitcoin as a safer crypto asset. When it falls, traders become more willing to take risks with altcoins, creating opportunities for diversified crypto strategies.'
      }
    },
    {
      id: 4,
      title: 'Altcoin Analysis and Selection',
      duration: '30 min',
      type: 'practical',
      content: {
        objectives: [
          'Learn frameworks for analyzing and selecting altcoins',
          'Understand fundamental analysis for cryptocurrency projects',
          'Develop criteria for evaluating altcoin investment potential'
        ],
        keyPoints: [
          'Evaluate team experience, technology innovation, and use cases',
          'Analyze tokenomics, supply distribution, and inflation schedules',
          'Consider market cap, trading volume, and exchange listings',
          'Assess community strength, developer activity, and partnerships'
        ],
        summary: 'Successful altcoin trading requires thorough fundamental analysis beyond just technical charts. Evaluating the project\'s technology, team, tokenomics, and market position helps identify altcoins with genuine long-term potential versus speculative plays.'
      }
    },
    {
      id: 5,
      title: 'Layer 1 vs Layer 2 Investment Strategies',
      duration: '22 min',
      type: 'theory',
      content: {
        objectives: [
          'Understand the differences between Layer 1 and Layer 2 solutions',
          'Learn investment strategies for each blockchain layer',
          'Identify opportunities in the blockchain ecosystem'
        ],
        keyPoints: [
          'Layer 1 blockchains offer base layer security and decentralization',
          'Layer 2 solutions provide scalability and reduced transaction costs',
          'Layer 1 investments tend to be more stable with network effects',
          'Layer 2 tokens can offer higher growth but with execution risk'
        ],
        summary: 'Understanding the blockchain technology stack helps inform investment decisions. Layer 1 blockchains like Ethereum provide foundational value, while Layer 2 solutions offer scalability innovations with different risk-reward profiles for traders.'
      }
    },
    {
      id: 6,
      title: 'DeFi Trading Fundamentals',
      duration: '35 min',
      type: 'practical',
      content: {
        objectives: [
          'Learn the basics of decentralized finance trading',
          'Understand key DeFi protocols and their tokens',
          'Develop strategies for trading DeFi assets'
        ],
        keyPoints: [
          'DeFi protocols offer lending, borrowing, and trading without intermediaries',
          'Token values are driven by protocol usage, fees, and governance rights',
          'Yield farming and liquidity mining create additional earning opportunities',
          'Smart contract risks and impermanent loss must be considered'
        ],
        summary: 'DeFi trading involves protocols that recreate traditional financial services on blockchain. Understanding how protocols generate value through fees and usage helps traders identify opportunities in lending protocols, DEXs, and yield farming platforms.'
      }
    },
    {
      id: 7,
      title: 'Yield Farming and Liquidity Mining',
      duration: '28 min',
      type: 'practical',
      content: {
        objectives: [
          'Understand yield farming mechanics and opportunities',
          'Learn to calculate and compare yields across protocols',
          'Manage risks associated with liquidity provision'
        ],
        keyPoints: [
          'Yield farming involves providing liquidity to earn token rewards',
          'APY can fluctuate dramatically based on token prices and demand',
          'Impermanent loss risk increases with asset price divergence',
          'Consider gas fees and lock-up periods when calculating returns'
        ],
        summary: 'Yield farming allows traders to earn returns by providing liquidity to DeFi protocols. While potentially profitable, it requires careful analysis of impermanent loss, token emission schedules, and protocol sustainability to achieve consistent returns.'
      }
    },
    {
      id: 8,
      title: 'NFT Trading and Digital Collectibles',
      duration: '25 min',
      type: 'practical',
      content: {
        objectives: [
          'Learn NFT market dynamics and trading strategies',
          'Understand valuation factors for digital collectibles',
          'Develop approaches for NFT portfolio management'
        ],
        keyPoints: [
          'NFT value is driven by rarity, utility, community, and creator reputation',
          'Floor price movements often indicate collection health and demand',
          'Utility NFTs with gaming or access rights can have sustained value',
          'Market cycles for NFTs can be independent of broader crypto trends'
        ],
        summary: 'NFT trading requires understanding digital scarcity, community dynamics, and utility value. Success comes from identifying strong communities, authentic creators, and NFTs with real utility beyond just collectible value.'
      }
    },
    {
      id: 9,
      title: 'Meme Coin Trading Psychology',
      duration: '20 min',
      type: 'theory',
      content: {
        objectives: [
          'Understand the psychology behind meme coin movements',
          'Learn risk management for highly speculative assets',
          'Recognize social media signals and trends'
        ],
        keyPoints: [
          'Meme coins are driven primarily by social sentiment and viral trends',
          'Price movements can be extreme and disconnected from fundamentals',
          'Social media influence and celebrity endorsements drive demand',
          'Exit strategies are crucial due to pump and dump risks'
        ],
        summary: 'Meme coin trading is pure speculation based on social trends and community sentiment. While potentially profitable, it requires strict risk management, quick decision-making, and understanding of social media dynamics driving these assets.'
      }
    },
    {
      id: 10,
      title: 'Cross-Chain Trading Opportunities',
      duration: '30 min',
      type: 'practical',
      content: {
        objectives: [
          'Learn about trading opportunities across different blockchains',
          'Understand bridge technologies and cross-chain protocols',
          'Identify arbitrage opportunities between chains'
        ],
        keyPoints: [
          'Different blockchains can have price discrepancies for same assets',
          'Bridge technologies enable asset movement between chains',
          'Transaction fees and bridge risks must be factored into profits',
          'Emerging chains often offer higher yields but with greater risks'
        ],
        summary: 'Cross-chain trading involves moving assets between different blockchains to capture price differences or access unique opportunities. Understanding bridge technologies and calculating all associated costs is essential for profitable cross-chain strategies.'
      }
    },
    {
      id: 11,
      title: 'Governance Token Strategies',
      duration: '22 min',
      type: 'practical',
      content: {
        objectives: [
          'Understand governance tokens and their value proposition',
          'Learn strategies for trading protocol governance rights',
          'Evaluate governance participation rewards and risks'
        ],
        keyPoints: [
          'Governance tokens provide voting rights in protocol decisions',
          'Token value can increase with protocol growth and fee generation',
          'Governance participation can earn additional token rewards',
          'Regulatory risks around governance tokens are evolving'
        ],
        summary: 'Governance tokens represent ownership stakes in DeFi protocols, giving holders voting rights and often fee-sharing benefits. Trading these tokens requires understanding protocol fundamentals, governance processes, and the evolving regulatory landscape.'
      }
    },
    {
      id: 12,
      title: 'Crypto Derivatives and Futures Trading',
      duration: '35 min',
      type: 'practical',
      content: {
        objectives: [
          'Learn about cryptocurrency futures and perpetual contracts',
          'Understand leverage and margin requirements in crypto',
          'Develop risk management for leveraged crypto positions'
        ],
        keyPoints: [
          'Crypto futures allow leveraged exposure with limited capital',
          'Perpetual contracts have funding rates that affect holding costs',
          'Liquidation risks are higher due to crypto market volatility',
          'Futures can be used for hedging existing spot positions'
        ],
        summary: 'Crypto derivatives provide leveraged exposure and hedging opportunities but come with significant risks. Understanding funding rates, liquidation mechanics, and proper position sizing is crucial for safely trading crypto futures and perpetuals.'
      }
    },
    {
      id: 13,
      title: 'Regulatory Impact on Crypto Trading',
      duration: '18 min',
      type: 'theory',
      content: {
        objectives: [
          'Understand how regulation affects crypto markets',
          'Learn to anticipate regulatory impact on different assets',
          'Develop strategies for regulatory risk management'
        ],
        keyPoints: [
          'Regulatory announcements can cause immediate and dramatic price moves',
          'Different jurisdictions have varying approaches to crypto regulation',
          'Securities classification affects which assets can be traded where',
          'Regulatory clarity often leads to institutional adoption and price appreciation'
        ],
        summary: 'Regulatory developments significantly impact crypto markets, often causing major price movements. Staying informed about regulatory trends and understanding how different cryptocurrencies might be classified helps traders anticipate and position for regulatory changes.'
      }
    },
    {
      id: 14,
      title: 'Building a Crypto Trading Portfolio',
      duration: '40 min',
      type: 'practical',
      content: {
        objectives: [
          'Learn portfolio construction strategies for crypto assets',
          'Understand diversification within the crypto ecosystem',
          'Develop rebalancing strategies for volatile assets'
        ],
        keyPoints: [
          'Diversify across different crypto sectors and use cases',
          'Balance between established coins and emerging opportunities',
          'Regular rebalancing captures gains and manages risk',
          'Consider correlation with traditional markets and Bitcoin'
        ],
        summary: 'Building a successful crypto portfolio requires diversification across different blockchain ecosystems, use cases, and risk levels. This final lesson integrates all previous concepts to create a comprehensive approach to crypto trading and investment that balances opportunity with risk management.'
      }
    }
  ];

  // Detailed Course Lessons - Risk Management & Capital Preservation
  const riskManagementLessons = [
    {
      id: 1,
      title: 'Introduction to Risk Management',
      duration: '20 min',
      type: 'theory',
      content: {
        objectives: [
          'Understand the fundamental principles of trading risk management',
          'Learn the difference between risk and uncertainty in trading',
          'Identify the key components of a comprehensive risk management plan'
        ],
        keyPoints: [
          'Risk management is about preserving capital, not maximizing profits',
          'Professional traders focus on managing downside before considering upside',
          'Risk comes from not knowing what you are doing',
          'A good risk management plan helps you survive losing streaks'
        ],
        summary: 'Risk management is the foundation of successful trading. It involves identifying, analyzing, and taking steps to reduce or control exposure to financial loss. The primary goal is capital preservation, which enables long-term trading success.'
      }
    },
    {
      id: 2,
      title: 'Position Sizing Fundamentals',
      duration: '25 min',
      type: 'practical',
      content: {
        objectives: [
          'Master the basic principles of position sizing',
          'Learn to calculate appropriate position sizes for different account sizes',
          'Understand the relationship between position size and risk tolerance'
        ],
        keyPoints: [
          'Position size determines your potential profit and loss per trade',
          'Never risk more than 1-2% of your account on a single trade',
          'Larger positions amplify both gains and losses',
          'Position sizing should be based on stop loss distance, not gut feeling'
        ],
        summary: 'Position sizing is the process of determining how much capital to allocate to each trade. Proper position sizing ensures that no single trade can significantly damage your account, while still allowing for meaningful profits.'
      }
    },
    {
      id: 3,
      title: 'The 1% Rule and Risk Per Trade',
      duration: '18 min',
      type: 'theory',
      content: {
        objectives: [
          'Understand the mathematical foundation of the 1% rule',
          'Learn how the 1% rule protects against catastrophic losses',
          'Calculate maximum position sizes using the 1% rule'
        ],
        keyPoints: [
          'Risk only 1% of your account balance per trade',
          'With 1% risk, you can survive 100 consecutive losses',
          'The 1% rule forces disciplined position sizing',
          'Adjust position size based on stop loss distance, not market excitement'
        ],
        summary: 'The 1% rule is a cornerstone of professional risk management. By risking only 1% of your account per trade, you ensure long-term survival even during extended losing streaks, while maintaining the potential for substantial gains.'
      }
    },
    {
      id: 4,
      title: 'Stop Loss Strategies and Implementation',
      duration: '30 min',
      type: 'practical',
      content: {
        objectives: [
          'Master different types of stop loss orders and their applications',
          'Learn to set stop losses based on technical analysis',
          'Understand trailing stops and their proper implementation'
        ],
        keyPoints: [
          'Stop losses should be set before entering a trade, not after',
          'Place stops based on market structure, not arbitrary percentages',
          'Trailing stops can lock in profits as trades move favorably',
          'Never move a stop loss further away from your entry price'
        ],
        summary: 'Stop loss orders are essential tools for limiting losses and protecting capital. Proper stop loss placement requires understanding market structure, volatility, and the specific characteristics of each trading setup.'
      }
    },
    {
      id: 5,
      title: 'Risk-Reward Ratios and Expectancy',
      duration: '25 min',
      type: 'theory',
      content: {
        objectives: [
          'Calculate and interpret risk-reward ratios for trading setups',
          'Understand positive expectancy and its importance in trading',
          'Learn to evaluate trading systems using expectancy calculations'
        ],
        keyPoints: [
          'Minimum risk-reward ratio should be 1:2 for most strategies',
          'Higher win rates can compensate for lower risk-reward ratios',
          'Positive expectancy means your system makes money over time',
          'Focus on trades with favorable risk-reward profiles'
        ],
        summary: 'Risk-reward ratios and expectancy calculations help traders evaluate the long-term profitability of their trading strategies. Understanding these concepts is crucial for developing sustainable trading approaches.'
      }
    },
    {
      id: 6,
      title: 'Portfolio Diversification and Correlation',
      duration: '22 min',
      type: 'theory',
      content: {
        objectives: [
          'Understand the principles of portfolio diversification in trading',
          'Learn about asset correlation and its impact on risk',
          'Apply diversification strategies to reduce overall portfolio risk'
        ],
        keyPoints: [
          'Diversification reduces risk without necessarily reducing returns',
          'Avoid trading highly correlated assets simultaneously',
          'Diversify across timeframes, strategies, and asset classes',
          'True diversification requires understanding correlation coefficients'
        ],
        summary: 'Portfolio diversification involves spreading risk across multiple assets, strategies, or timeframes to reduce overall portfolio volatility. Proper diversification can improve risk-adjusted returns significantly.'
      }
    },
    {
      id: 7,
      title: 'Drawdown Management and Recovery',
      duration: '20 min',
      type: 'practical',
      content: {
        objectives: [
          'Understand different types of drawdowns and their implications',
          'Learn strategies for managing and recovering from drawdowns',
          'Develop psychological resilience during difficult trading periods'
        ],
        keyPoints: [
          'Drawdowns are inevitable in trading - plan for them',
          'Maximum drawdown limits help preserve capital',
          'Recovery from large drawdowns requires exponentially larger gains',
          'Consider reducing position sizes during drawdown periods'
        ],
        summary: 'Drawdown management involves preparing for and responding to periods of losses. Effective drawdown strategies help traders maintain their capital and psychological well-being during challenging market conditions.'
      }
    },
    {
      id: 8,
      title: 'Kelly Criterion and Optimal Position Sizing',
      duration: '25 min',
      type: 'theory',
      content: {
        objectives: [
          'Understand the Kelly Criterion formula and its applications',
          'Learn to calculate optimal position sizes using historical data',
          'Recognize the limitations and practical applications of Kelly sizing'
        ],
        keyPoints: [
          'Kelly Criterion maximizes long-term growth rate',
          'Full Kelly sizing can be too aggressive for most traders',
          'Fractional Kelly (25-50%) provides more conservative approach',
          'Kelly requires accurate estimates of win rate and average win/loss'
        ],
        summary: 'The Kelly Criterion provides a mathematical approach to optimal position sizing based on your trading system\'s historical performance. While powerful, it should be applied conservatively in practice.'
      }
    },
    {
      id: 9,
      title: 'Market Volatility and Risk Adjustment',
      duration: '18 min',
      type: 'practical',
      content: {
        objectives: [
          'Understand how market volatility affects trading risk',
          'Learn to adjust position sizes based on volatility conditions',
          'Apply volatility-based risk management techniques'
        ],
        keyPoints: [
          'Higher volatility requires smaller position sizes',
          'Use Average True Range (ATR) to measure volatility',
          'Volatility clustering means volatile periods tend to continue',
          'Adjust stop losses and position sizes for current market conditions'
        ],
        summary: 'Market volatility significantly impacts trading risk. Successful traders adjust their position sizing and risk management approach based on current volatility conditions to maintain consistent risk exposure.'
      }
    },
    {
      id: 10,
      title: 'Building a Complete Risk Management System',
      duration: '35 min',
      type: 'practical',
      content: {
        objectives: [
          'Integrate all risk management components into a cohesive system',
          'Develop a personal risk management plan and trading rules',
          'Create procedures for monitoring and adjusting risk parameters'
        ],
        keyPoints: [
          'Document your risk management rules and follow them consistently',
          'Regular review and adjustment of risk parameters is essential',
          'Combine multiple risk management techniques for robust protection',
          'Risk management should evolve with your trading experience and market conditions'
        ],
        summary: 'A complete risk management system integrates position sizing, stop losses, diversification, and drawdown management into a comprehensive framework. This system should be documented, tested, and consistently applied to achieve long-term trading success.'
      }
    }
  ];

  // Detailed Course Lessons - Technical Analysis Mastery
  const technicalAnalysisLessons = [
    {
      id: 1,
      title: 'Introduction to Technical Analysis',
      duration: '25 min',
      type: 'theory',
      content: {
        objectives: [
          'Understand the core principles of technical analysis',
          'Learn the difference between technical and fundamental analysis',
          'Identify key assumptions and limitations of technical analysis'
        ],
        keyPoints: [
          'Price action reflects all available information',
          'Market trends tend to persist over time',
          'History repeats itself in market behavior',
          'Technical analysis works across all timeframes and markets'
        ],
        summary: 'Technical analysis is the study of price action and market behavior to predict future price movements. It relies on the principle that all market information is reflected in price, making chart analysis a powerful tool for trading decisions.'
      }
    },
    {
      id: 2,
      title: 'Chart Types and Timeframes',
      duration: '30 min',
      type: 'theory',
      content: {
        objectives: [
          'Master different chart types: line, bar, and candlestick charts',
          'Understand how to select appropriate timeframes for analysis',
          'Learn the advantages and disadvantages of each chart type'
        ],
        keyPoints: [
          'Candlestick charts provide the most information about price action',
          'Higher timeframes show stronger trends and support/resistance',
          'Multiple timeframe analysis improves trading accuracy',
          'Line charts are best for identifying long-term trends'
        ],
        summary: 'Chart selection and timeframe analysis are fundamental skills in technical analysis. Candlestick charts offer the most detailed view of price action, while proper timeframe selection helps align trades with market trends.'
      }
    },
    {
      id: 3,
      title: 'Support and Resistance Fundamentals',
      duration: '35 min',
      type: 'theory',
      content: {
        objectives: [
          'Identify horizontal support and resistance levels',
          'Understand the psychology behind support and resistance',
          'Learn how support becomes resistance and vice versa'
        ],
        keyPoints: [
          'Support levels act as price floors where buying interest emerges',
          'Resistance levels act as price ceilings where selling pressure increases',
          'Broken support often becomes new resistance',
          'Volume confirmation strengthens support/resistance levels'
        ],
        summary: 'Support and resistance levels are the foundation of technical analysis. These price levels represent areas where supply and demand forces create significant price reactions, forming the basis for entry and exit decisions.'
      }
    },
    {
      id: 4,
      title: 'Trend Lines and Channels',
      duration: '30 min',
      type: 'practical',
      content: {
        objectives: [
          'Draw accurate trend lines using swing highs and lows',
          'Identify uptrends, downtrends, and sideways trends',
          'Construct trend channels for range-bound trading'
        ],
        keyPoints: [
          'Trend lines connect at least two significant price points',
          'Steeper trend lines are less reliable than gradual ones',
          'Trend line breaks often signal trend reversals',
          'Channels help identify optimal entry and exit points'
        ],
        summary: 'Trend lines and channels are essential tools for identifying market direction and potential reversal points. Proper trend line construction requires connecting significant swing points and understanding market structure.'
      }
    },
    {
      id: 5,
      title: 'Moving Averages: Simple and Exponential',
      duration: '25 min',
      type: 'theory',
      content: {
        objectives: [
          'Understand Simple Moving Average (SMA) and Exponential Moving Average (EMA)',
          'Learn how to use moving averages for trend identification',
          'Master moving average crossover strategies'
        ],
        keyPoints: [
          'SMAs give equal weight to all periods in the calculation',
          'EMAs give more weight to recent prices, making them more responsive',
          'Moving average crossovers can signal trend changes',
          'Price above/below MA indicates bullish/bearish bias'
        ],
        summary: 'Moving averages smooth price data to identify trends and provide dynamic support/resistance levels. EMAs react faster to price changes, while SMAs provide more stable trend identification.'
      }
    },
    {
      id: 6,
      title: 'RSI: Momentum and Divergence Analysis',
      duration: '30 min',
      type: 'practical',
      content: {
        objectives: [
          'Calculate and interpret RSI values for momentum analysis',
          'Identify overbought and oversold conditions',
          'Spot bullish and bearish divergences for reversal signals'
        ],
        keyPoints: [
          'RSI ranges from 0 to 100, with 70+ overbought and 30- oversold',
          'RSI divergence often precedes price reversals',
          'RSI trendlines can provide additional confirmation signals',
          'RSI works best in ranging markets, less effective in strong trends'
        ],
        summary: 'The Relative Strength Index (RSI) measures momentum and helps identify potential reversal points. Divergence analysis using RSI provides early warning signals for trend changes.'
      }
    },
    {
      id: 7,
      title: 'MACD: Trend and Momentum Convergence',
      duration: '25 min',
      type: 'theory',
      content: {
        objectives: [
          'Understand MACD line, signal line, and histogram components',
          'Learn MACD crossover signals and their implications',
          'Use MACD for trend confirmation and momentum analysis'
        ],
        keyPoints: [
          'MACD line crossing above signal line suggests bullish momentum',
          'MACD histogram shows the strength of momentum changes',
          'MACD works best in trending markets',
          'Zero line crossovers indicate potential trend changes'
        ],
        summary: 'MACD combines trend-following and momentum characteristics, making it versatile for both trend identification and timing entry/exit points. The histogram provides additional insight into momentum strength.'
      }
    },
    {
      id: 8,
      title: 'Bollinger Bands: Volatility and Mean Reversion',
      duration: '30 min',
      type: 'practical',
      content: {
        objectives: [
          'Understand Bollinger Band construction and interpretation',
          'Use bands for volatility measurement and trading signals',
          'Identify squeeze patterns and expansion phases'
        ],
        keyPoints: [
          'Bands expand during high volatility and contract during low volatility',
          'Price touching bands suggests potential reversal opportunities',
          'Bollinger squeezes often precede significant price moves',
          'Middle band (20 SMA) acts as dynamic support/resistance'
        ],
        summary: 'Bollinger Bands adapt to market volatility, providing dynamic support and resistance levels. Band squeezes and expansions help identify optimal trading opportunities in different market conditions.'
      }
    },
    {
      id: 9,
      title: 'Volume Analysis and Price-Volume Relationships',
      duration: '35 min',
      type: 'theory',
      content: {
        objectives: [
          'Understand the relationship between price and volume',
          'Learn volume confirmation patterns for trend validation',
          'Identify volume divergences and their implications'
        ],
        keyPoints: [
          'Volume should increase in the direction of the trend',
          'High volume breakouts are more reliable than low volume ones',
          'Volume divergence can signal potential trend weakness',
          'Volume spikes often occur at reversal points'
        ],
        summary: 'Volume analysis confirms the strength behind price movements. Understanding price-volume relationships helps validate trend direction and identify potential reversal points.'
      }
    },
    {
      id: 10,
      title: 'Classic Chart Patterns: Triangles and Flags',
      duration: '40 min',
      type: 'practical',
      content: {
        objectives: [
          'Identify ascending, descending, and symmetrical triangles',
          'Recognize flag and pennant continuation patterns',
          'Calculate price targets for pattern breakouts'
        ],
        keyPoints: [
          'Triangles typically resolve in the direction of the prior trend',
          'Flags and pennants are short-term continuation patterns',
          'Volume should decrease during pattern formation',
          'Breakout volume confirms pattern validity'
        ],
        summary: 'Chart patterns provide visual representations of market psychology and help predict future price movements. Triangle and flag patterns are among the most reliable continuation patterns in technical analysis.'
      }
    },
    {
      id: 11,
      title: 'Reversal Patterns: Head and Shoulders, Double Tops/Bottoms',
      duration: '35 min',
      type: 'practical',
      content: {
        objectives: [
          'Identify head and shoulders reversal patterns',
          'Recognize double top and double bottom formations',
          'Calculate pattern targets and risk management levels'
        ],
        keyPoints: [
          'Head and shoulders patterns signal major trend reversals',
          'Neckline breaks confirm pattern completion',
          'Volume should increase on neckline breakouts',
          'Failed patterns often lead to strong moves in the opposite direction'
        ],
        summary: 'Reversal patterns indicate potential trend changes and provide high-probability trading opportunities. Proper pattern identification and confirmation are crucial for successful reversal trading.'
      }
    },
    {
      id: 12,
      title: 'Fibonacci Retracements and Extensions',
      duration: '30 min',
      type: 'practical',
      content: {
        objectives: [
          'Apply Fibonacci retracement levels to identify support/resistance',
          'Use Fibonacci extensions for profit target calculation',
          'Combine Fibonacci with other technical analysis tools'
        ],
        keyPoints: [
          'Key Fibonacci levels: 23.6%, 38.2%, 50%, 61.8%, 78.6%',
          '61.8% retracement is often the deepest pullback in strong trends',
          'Fibonacci extensions help project price targets',
          'Confluence with other levels increases reliability'
        ],
        summary: 'Fibonacci retracements help identify potential reversal levels within trends, while extensions project profit targets. These mathematical ratios appear frequently in financial markets.'
      }
    },
    {
      id: 13,
      title: 'Candlestick Patterns: Single and Multiple Candle Formations',
      duration: '45 min',
      type: 'practical',
      content: {
        objectives: [
          'Master single candlestick patterns: doji, hammer, shooting star',
          'Identify multiple candlestick patterns: engulfing, morning/evening star',
          'Apply candlestick analysis for entry and exit timing'
        ],
        keyPoints: [
          'Candlestick patterns show market sentiment and potential reversals',
          'Patterns are more reliable at key support/resistance levels',
          'Volume confirmation strengthens candlestick signals',
          'Context matters more than individual pattern formation'
        ],
        summary: 'Candlestick patterns provide insight into market psychology and help time entries and exits. Understanding both single and multiple candle formations improves trading precision.'
      }
    },
    {
      id: 14,
      title: 'Multiple Timeframe Analysis',
      duration: '35 min',
      type: 'theory',
      content: {
        objectives: [
          'Implement top-down analysis using multiple timeframes',
          'Align short-term trades with longer-term trends',
          'Identify optimal entry points using timeframe confluence'
        ],
        keyPoints: [
          'Higher timeframes determine overall market direction',
          'Lower timeframes provide precise entry and exit points',
          'Trade in the direction of the higher timeframe trend',
          'Look for confluence between different timeframe signals'
        ],
        summary: 'Multiple timeframe analysis improves trading accuracy by aligning trades with the broader market trend while using lower timeframes for precise timing.'
      }
    },
    {
      id: 15,
      title: 'Market Structure and Smart Money Concepts',
      duration: '40 min',
      type: 'theory',
      content: {
        objectives: [
          'Understand market structure: higher highs, higher lows, lower highs, lower lows',
          'Identify institutional order flow and smart money movements',
          'Recognize liquidity zones and market manipulation patterns'
        ],
        keyPoints: [
          'Market structure defines the current trend direction',
          'Break of structure signals potential trend changes',
          'Smart money often moves opposite to retail sentiment',
          'Liquidity grabs often precede significant moves'
        ],
        summary: 'Understanding market structure and smart money concepts provides insight into institutional trading behavior and helps identify high-probability trading opportunities.'
      }
    },
    {
      id: 16,
      title: 'Advanced Pattern Recognition',
      duration: '35 min',
      type: 'practical',
      content: {
        objectives: [
          'Identify complex patterns: cup and handle, wedges, diamonds',
          'Recognize harmonic patterns: ABCD, Gartley, butterfly',
          'Apply advanced pattern trading strategies'
        ],
        keyPoints: [
          'Complex patterns often provide higher probability setups',
          'Harmonic patterns use Fibonacci ratios for precise reversal levels',
          'Pattern failure can provide strong counter-trend opportunities',
          'Combine patterns with other technical indicators for confirmation'
        ],
        summary: 'Advanced pattern recognition expands trading opportunities and provides more sophisticated entry and exit techniques for experienced traders.'
      }
    },
    {
      id: 17,
      title: 'Momentum Oscillators: Stochastic and Williams %R',
      duration: '25 min',
      type: 'theory',
      content: {
        objectives: [
          'Apply Stochastic oscillator for momentum analysis',
          'Use Williams %R for overbought/oversold identification',
          'Combine oscillators with trend analysis for optimal timing'
        ],
        keyPoints: [
          'Stochastic compares closing price to recent price range',
          'Williams %R measures momentum from a different perspective',
          'Oscillators work best in ranging or corrective markets',
          'Divergence signals often precede price reversals'
        ],
        summary: 'Momentum oscillators provide additional confirmation for trading decisions and help identify optimal entry and exit timing within established trends.'
      }
    },
    {
      id: 18,
      title: 'Building a Complete Technical Analysis Trading System',
      duration: '45 min',
      type: 'practical',
      content: {
        objectives: [
          'Integrate multiple technical tools into a cohesive trading system',
          'Develop entry and exit criteria using technical analysis',
          'Create a systematic approach to market analysis and trade execution'
        ],
        keyPoints: [
          'Combine trend, momentum, and volume analysis for comprehensive view',
          'Use multiple confirmations before entering trades',
          'Develop systematic rules for risk management and position sizing',
          'Backtest and refine your technical analysis system'
        ],
        summary: 'A complete technical analysis system integrates multiple tools and techniques to create consistent, rule-based trading decisions. Systematic approach reduces emotional trading and improves long-term results.'
      }
    }
  ];

  // Detailed Course Lessons - Trading Fundamentals
  const tradingFundamentalsLessons = [
    {
      id: 1,
      title: 'Introduction to Financial Markets',
      duration: '20 min',
      type: 'theory',
      content: {
        objectives: [
          'Understand what financial markets are and how they work',
          'Learn the difference between primary and secondary markets',
          'Identify major market participants and their roles'
        ],
        keyPoints: [
          'Markets facilitate the exchange of financial instruments',
          'Price discovery mechanism through supply and demand',
          'Market makers provide liquidity for smoother trading',
          'Retail vs institutional traders have different advantages'
        ],
        summary: 'Financial markets are complex ecosystems where buyers and sellers meet to trade securities. Understanding the basic structure and participants helps you navigate trading more effectively.'
      }
    },
    {
      id: 2,
      title: 'Market Types and Sessions',
      duration: '25 min',
      type: 'theory',
      content: {
        objectives: [
          'Distinguish between stock, forex, commodity, and crypto markets',
          'Understand trading sessions and market hours',
          'Learn about market volatility and liquidity patterns'
        ],
        keyPoints: [
          'Each market type has unique characteristics and trading hours',
          'Overlapping sessions create higher volatility opportunities',
          'Cryptocurrency markets trade 24/7 with no closing times',
          'Volume and volatility vary significantly across different sessions'
        ],
        summary: 'Different markets operate on different schedules and have varying levels of volatility. Timing your trades according to market sessions can improve your success rate.'
      }
    },
    {
      id: 3,
      title: 'Order Types Mastery',
      duration: '30 min',
      type: 'practical',
      content: {
        objectives: [
          'Master market orders, limit orders, and stop orders',
          'Learn advanced order types like stop-limit and trailing stops',
          'Understand when to use each order type effectively'
        ],
        keyPoints: [
          'Market orders execute immediately at current price',
          'Limit orders control your entry/exit price precisely',
          'Stop orders help manage risk and protect profits',
          'Advanced orders provide automation and risk management'
        ],
        summary: 'Proper order management is crucial for trading success. Each order type serves a specific purpose in your trading strategy and risk management plan.'
      }
    },
    {
      id: 4,
      title: 'Risk vs Reward Fundamentals',
      duration: '25 min',
      type: 'theory',
      content: {
        objectives: [
          'Calculate risk-reward ratios for potential trades',
          'Understand the importance of positive expectancy',
          'Learn to assess trade probability and position sizing'
        ],
        keyPoints: [
          'Risk-reward ratio should typically be 1:2 or better',
          'Win rate and risk-reward ratio determine profitability',
          'Never risk more than you can afford to lose',
          'Position sizing affects overall portfolio risk'
        ],
        summary: 'Successful trading requires favorable risk-reward ratios. Understanding this relationship helps you make profitable trading decisions over time.'
      }
    },
    {
      id: 5,
      title: 'Understanding Market Psychology',
      duration: '20 min',
      type: 'theory',
      content: {
        objectives: [
          'Recognize common psychological biases in trading',
          'Understand crowd behavior and market sentiment',
          'Learn to control emotions during trading'
        ],
        keyPoints: [
          'Fear and greed drive most market movements',
          'Confirmation bias leads to poor decision making',
          'FOMO causes entry at poor price levels',
          'Discipline separates successful traders from failures'
        ],
        summary: 'Trading psychology is often more important than technical analysis. Controlling your emotions and understanding market sentiment gives you a significant edge.'
      }
    },
    {
      id: 6,
      title: 'Basic Chart Reading',
      duration: '30 min',
      type: 'practical',
      content: {
        objectives: [
          'Read and interpret candlestick charts',
          'Understand timeframes and their significance',
          'Identify basic trend patterns'
        ],
        keyPoints: [
          'Candlesticks show open, high, low, and close prices',
          'Green/white candles indicate bullish price action',
          'Red/black candles show bearish price movement',
          'Multiple timeframe analysis provides better context'
        ],
        summary: 'Chart reading is the foundation of technical analysis. Learning to interpret price action through candlesticks is essential for timing entries and exits.'
      }
    },
    {
      id: 7,
      title: 'Support and Resistance Basics',
      duration: '25 min',
      type: 'practical',
      content: {
        objectives: [
          'Identify horizontal support and resistance levels',
          'Understand how these levels affect price movement',
          'Learn to trade bounces and breakouts'
        ],
        keyPoints: [
          'Support acts as a floor where buying interest emerges',
          'Resistance acts as a ceiling where selling pressure increases',
          'Volume confirms the strength of these levels',
          'Broken support often becomes new resistance'
        ],
        summary: 'Support and resistance levels are among the most reliable trading concepts. These psychological price levels provide excellent entry and exit opportunities.'
      }
    },
    {
      id: 8,
      title: 'Volume Analysis Introduction',
      duration: '20 min',
      type: 'theory',
      content: {
        objectives: [
          'Understand the relationship between price and volume',
          'Learn to spot volume confirmation and divergence',
          'Use volume to validate trading signals'
        ],
        keyPoints: [
          'Volume confirms the strength of price movements',
          'High volume breakouts are more reliable',
          'Low volume moves often lack conviction',
          'Volume precedes price in many market moves'
        ],
        summary: 'Volume is the fuel behind price movements. Understanding volume patterns helps you distinguish between strong and weak trading signals.'
      }
    },
    {
      id: 9,
      title: 'Position Sizing Strategies',
      duration: '25 min',
      type: 'practical',
      content: {
        objectives: [
          'Calculate appropriate position sizes for your account',
          'Understand the 1% and 2% risk rules',
          'Learn fixed fractional and Kelly Criterion methods'
        ],
        keyPoints: [
          'Never risk more than 1-2% of your account per trade',
          'Position size should be based on your stop loss distance',
          'Larger accounts can use smaller percentage risks',
          'Proper position sizing prevents catastrophic losses'
        ],
        summary: 'Position sizing is the most important aspect of risk management. Proper sizing ensures you can survive losing streaks and compound profits effectively.'
      }
    },
    {
      id: 10,
      title: 'Money Management Rules',
      duration: '20 min',
      type: 'theory',
      content: {
        objectives: [
          'Establish clear money management guidelines',
          'Learn about maximum drawdown limits',
          'Understand when to increase or decrease position sizes'
        ],
        keyPoints: [
          'Set maximum daily and monthly loss limits',
          'Scale position sizes based on recent performance',
          'Keep detailed records of all trading activity',
          'Regular performance reviews identify areas for improvement'
        ],
        summary: 'Money management rules protect your capital during difficult periods. Having clear guidelines helps you stay disciplined and trade consistently.'
      }
    },
    {
      id: 11,
      title: 'Creating a Trading Plan',
      duration: '30 min',
      type: 'practical',
      content: {
        objectives: [
          'Develop a comprehensive trading plan',
          'Set clear entry and exit criteria',
          'Establish daily and weekly routines'
        ],
        keyPoints: [
          'A trading plan removes emotions from decision making',
          'Include specific setups you will trade',
          'Define your risk management rules clearly',
          'Regular plan reviews and updates are essential'
        ],
        summary: 'A well-defined trading plan is your roadmap to success. It provides structure and helps you stay disciplined during both winning and losing periods.'
      }
    },
    {
      id: 12,
      title: 'Record Keeping and Performance Analysis',
      duration: '25 min',
      type: 'practical',
      content: {
        objectives: [
          'Set up effective trade journaling systems',
          'Learn to analyze your trading performance',
          'Identify strengths and weaknesses in your trading'
        ],
        keyPoints: [
          'Document every trade with entry/exit reasons',
          'Track both winning and losing trades',
          'Look for patterns in your trading mistakes',
          'Use performance metrics to guide improvements'
        ],
        summary: 'Keeping detailed records is essential for continuous improvement. Regular analysis of your trading performance helps you evolve and become more profitable.'
      }
    }
  ];

  // Interactive Trading Simulations
  const tradingSimulations = [
    {
      id: 'trend-following',
      title: 'Trend Following Simulation',
      description: 'Practice identifying and trading trends in different market conditions',
      difficulty: 'BEGINNER',
      duration: '15 minutes',
      scenario: 'Bull Market Breakout'
    },
    {
      id: 'support-resistance',
      title: 'Support & Resistance Trading',
      description: 'Learn to identify key levels and trade bounces and breakouts',
      difficulty: 'INTERMEDIATE',
      duration: '20 minutes',
      scenario: 'Range-Bound Market'
    },
    {
      id: 'risk-management-practice',
      title: 'Risk Management Challenge',
      description: 'Practice position sizing and stop-loss placement in volatile conditions',
      difficulty: 'INTERMEDIATE',
      duration: '25 minutes',
      scenario: 'High Volatility Event'
    },
    {
      id: 'psychology-test',
      title: 'Trading Psychology Test',
      description: 'Face emotional trading scenarios and learn to maintain discipline',
      difficulty: 'ADVANCED',
      duration: '30 minutes',
      scenario: 'Losing Streak Recovery'
    }
  ];

  // KonsAi Trading Questions and Answers
  const konsAiKnowledge = [
    {
      category: 'Basics',
      questions: [
        'What is the difference between a bull and bear market?',
        'How do I calculate position size?',
        'What are the main types of trading orders?',
        'When should I use a stop loss?',
        'What is market volatility and how does it affect trading?'
      ]
    },
    {
      category: 'Technical Analysis',
      questions: [
        'How do I read candlestick patterns?',
        'What are the most reliable technical indicators?',
        'How do I identify support and resistance levels?',
        'What is divergence and how do I trade it?',
        'How do moving averages help in trend identification?'
      ]
    },
    {
      category: 'Risk Management',
      questions: [
        'What is the 1% rule in trading?',
        'How do I manage multiple positions?',
        'What is the Kelly Criterion and when should I use it?',
        'How do I calculate risk-reward ratios?',
        'What are the signs of overtrading?'
      ]
    },
    {
      category: 'Psychology',
      questions: [
        'How do I overcome FOMO in trading?',
        'What causes revenge trading and how to avoid it?',
        'How do I stay disciplined during losing streaks?',
        'What is the importance of trading journals?',
        'How do emotions affect trading decisions?'
      ]
    },
    {
      category: 'Crypto Trading',
      questions: [
        'What makes crypto markets different from traditional markets?',
        'How do I analyze altcoin fundamentals?',
        'What are the best times to trade cryptocurrency?',
        'How do I evaluate DeFi projects?',
        'What is yield farming and what are the risks?'
      ]
    }
  ];

  // KonsAi Chat Integration
  const handleKonsAiQuestion = async (question: string) => {
    if (!question.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user' as const, message: question, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMessage]);
    setCurrentQuestion('');

    try {
      const response = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: question,
          context: 'trading_education',
          mode: 'educational'
        })
      });

      const data = await response.json();
      const konsAiMessage = { 
        role: 'konsai' as const, 
        message: data.message || data.response || 'I can help you learn about trading. Ask me anything!', 
        timestamp: Date.now() 
      };
      setChatHistory(prev => [...prev, konsAiMessage]);
    } catch (error) {
      console.error('KonsAi error:', error);
      const errorMessage = { 
        role: 'konsai' as const, 
        message: 'I apologize, but I\'m having trouble connecting right now. Please try asking your trading question again.', 
        timestamp: Date.now() 
      };
      setChatHistory(prev => [...prev, errorMessage]);
    }
  };

  // Trading Simulation Runner
  const runSimulation = async (simulationId: string) => {
    setActiveSimulation(simulationId);
    
    try {
      const response = await fetch('/api/trading/simulation/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ simulationId, userId: 'demo-user' })
      });
      
      const data = await response.json();
      setSimulationResults(data);
    } catch (error) {
      console.error('Simulation error:', error);
      // Provide demo results for simulation
      setSimulationResults({
        success: true,
        scenario: 'Demo Trading Scenario',
        initialBalance: 10000,
        finalBalance: 10500,
        trades: 5,
        winRate: 80,
        profitLoss: 500,
        lessons: ['Great job on risk management!', 'Consider using tighter stop losses', 'Your entry timing was excellent']
      });
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-500';
      case 'INTERMEDIATE': return 'bg-yellow-500';
      case 'ADVANCED': return 'bg-orange-500';
      case 'EXPERT': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Trading Calculator Functions
  const calculatePositionSize = async () => {
    const { accountBalance, riskPercent, stopLossDistance } = calculatorInputs.positionSize;
    
    if (!accountBalance || !riskPercent || !stopLossDistance) {
      alert('Please fill in all position size fields');
      return;
    }

    try {
      const response = await fetch('/api/trading/tools/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolType: 'position-size',
          inputs: {
            accountBalance: parseFloat(accountBalance),
            riskPercent: parseFloat(riskPercent),
            stopLossDistance: parseFloat(stopLossDistance)
          }
        })
      });

      const data = await response.json();
      setCalculatorResults(prev => ({ ...prev, positionSize: data }));
    } catch (error) {
      console.error('Position size calculation error:', error);
    }
  };

  const calculateRiskReward = async () => {
    const { entryPrice, stopLoss, takeProfit } = calculatorInputs.riskReward;
    
    if (!entryPrice || !stopLoss || !takeProfit) {
      alert('Please fill in all risk/reward fields');
      return;
    }

    try {
      const response = await fetch('/api/trading/tools/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolType: 'risk-reward',
          inputs: {
            entryPrice: parseFloat(entryPrice),
            stopLoss: parseFloat(stopLoss),
            takeProfit: parseFloat(takeProfit)
          }
        })
      });

      const data = await response.json();
      setCalculatorResults(prev => ({ ...prev, riskReward: data }));
    } catch (error) {
      console.error('Risk/reward calculation error:', error);
    }
  };

  const analyzePortfolio = async () => {
    const { positions } = calculatorInputs.portfolio;
    
    if (!positions.trim()) {
      alert('Please enter your portfolio positions');
      return;
    }

    try {
      const response = await fetch('/api/trading/tools/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolType: 'portfolio-analysis',
          inputs: { positions }
        })
      });

      const data = await response.json();
      setCalculatorResults(prev => ({ ...prev, portfolio: data }));
    } catch (error) {
      console.error('Portfolio analysis error:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FOUNDATIONS': return 'border-blue-500';
      case 'ANALYSIS': return 'border-purple-500';
      case 'RISK': return 'border-red-500';
      case 'MINDSET': return 'border-green-500';
      case 'CRYPTO': return 'border-yellow-500';
      case 'STRATEGIES': return 'border-orange-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center space-x-3">
            <GraduationCap className="h-10 w-10 text-blue-500" />
            <span>Waides KI Trading Academy</span>
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Master trading with AI-powered education and interactive simulations</p>
        </div>
        <div className="flex items-center space-x-4">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Level 5</div>
                <div className="text-sm text-blue-100">Trading Student</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800">
          <TabsTrigger value="courses" className="text-white">Courses</TabsTrigger>
          <TabsTrigger value="konsai-tutor" className="text-white">KonsAi Tutor</TabsTrigger>
          <TabsTrigger value="simulations" className="text-white">Simulations</TabsTrigger>
          <TabsTrigger value="tools" className="text-white">Trading Tools</TabsTrigger>
          <TabsTrigger value="progress" className="text-white">Progress</TabsTrigger>
        </TabsList>

        {/* Trading Courses */}
        <TabsContent value="courses" className="space-y-6">
          {!selectedCourse && (
            <>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <BookOpen className="h-6 w-6" />
                    <span>Comprehensive Trading Courses</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Structured learning paths from beginner to expert level
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tradingCourses.map((course) => (
                  <Card key={course.id} className={`bg-gray-800 border-2 ${getCategoryColor(course.category)} hover:border-opacity-100 border-opacity-50 transition-all duration-300 hover:scale-105`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-gray-700">
                            {course.icon}
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg">{course.title}</CardTitle>
                            <Badge className={`${getLevelColor(course.level)} text-white mt-1`}>
                              {course.level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-gray-400 mt-3">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{course.lessons} lessons</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-300">Key Topics:</div>
                          <div className="flex flex-wrap gap-1">
                            {course.topics.slice(0, 3).map((topic, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {course.topics.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{course.topics.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={() => setSelectedCourse(course.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Start Course
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Risk Management & Capital Preservation Course Detail View */}
          {selectedCourse === 'risk-management' && (
            <div className="space-y-6">
              {/* Course Header with Back Button */}
              <Card className="bg-gradient-to-r from-red-900 to-orange-900 border-red-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-2xl flex items-center space-x-3">
                        <Shield className="h-8 w-8" />
                        <span>Risk Management & Capital Preservation</span>
                        <Badge className="bg-orange-600 text-white">INTERMEDIATE</Badge>
                      </CardTitle>
                      <CardDescription className="text-orange-200 mt-2">
                        Protect your capital with advanced risk management techniques
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCourse(null);
                        setSelectedLesson(null);
                      }}
                      className="text-white border-white hover:bg-white hover:text-red-900"
                    >
                      ← Back to Courses
                    </Button>
                  </div>
                  <div className="flex items-center space-x-6 mt-4 text-orange-200">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>3 hours total</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>10 lessons</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>{Object.keys(lessonProgress).length}/10 completed</span>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Lesson List or Lesson Detail */}
              {!selectedLesson && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {riskManagementLessons.map((lesson) => (
                    <Card 
                      key={lesson.id} 
                      className={`bg-gray-800 border-gray-700 hover:border-red-500 transition-all duration-300 cursor-pointer ${
                        lessonProgress[lesson.id] ? 'border-green-500' : ''
                      }`}
                      onClick={() => setSelectedLesson(lesson.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg flex items-center space-x-2">
                              <span className="text-red-500">#{lesson.id}</span>
                              <span>{lesson.title}</span>
                              {lessonProgress[lesson.id] && <Badge className="bg-green-600">✓ Completed</Badge>}
                            </CardTitle>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{lesson.duration}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {lesson.type}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}

              {/* Individual Lesson Detail */}
              {selectedLesson && (
                <div className="space-y-6">
                  {(() => {
                    const lesson = riskManagementLessons.find(l => l.id === selectedLesson);
                    if (!lesson) return null;
                    
                    return (
                      <>
                        <Card className="bg-gray-800 border-gray-700">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-white text-xl flex items-center space-x-2">
                                  <span className="text-red-500">Lesson {lesson.id}:</span>
                                  <span>{lesson.title}</span>
                                </CardTitle>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{lesson.duration}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {lesson.type}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedLesson(null)}
                                className="text-white border-gray-600 hover:bg-gray-700"
                              >
                                ← Back to Lessons
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Learning Objectives */}
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                                <Lightbulb className="h-5 w-5 text-yellow-500" />
                                <span>Learning Objectives</span>
                              </h3>
                              <ul className="space-y-2">
                                {lesson.content.objectives.map((objective, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-gray-300">
                                    <span className="text-red-500 mt-1">•</span>
                                    <span>{objective}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Key Points */}
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                                <Eye className="h-5 w-5 text-green-500" />
                                <span>Key Points</span>
                              </h3>
                              <ul className="space-y-2">
                                {lesson.content.keyPoints.map((point, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-gray-300">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Summary */}
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-red-500" />
                                <span>Summary</span>
                              </h3>
                              <p className="text-gray-300 leading-relaxed">
                                {lesson.content.summary}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                              <div className="flex items-center space-x-3">
                                {lesson.id > 1 && (
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedLesson(lesson.id - 1)}
                                    className="text-white border-gray-600 hover:bg-gray-700"
                                  >
                                    ← Previous Lesson
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                <Button
                                  onClick={() => {
                                    setLessonProgress(prev => ({ ...prev, [lesson.id]: true }));
                                  }}
                                  className={`${
                                    lessonProgress[lesson.id] 
                                      ? 'bg-green-600 hover:bg-green-700' 
                                      : 'bg-red-600 hover:bg-red-700'
                                  }`}
                                >
                                  {lessonProgress[lesson.id] ? '✓ Completed' : 'Mark Complete'}
                                </Button>
                                {lesson.id < riskManagementLessons.length && (
                                  <Button
                                    onClick={() => setSelectedLesson(lesson.id + 1)}
                                    className="bg-orange-600 hover:bg-orange-700"
                                  >
                                    Next Lesson →
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Trading Psychology & Discipline Course Detail View */}
          {selectedCourse === 'trading-psychology' && (
            <div className="space-y-6">
              {/* Course Header with Back Button */}
              <Card className="bg-gradient-to-r from-purple-900 to-pink-900 border-purple-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-2xl flex items-center space-x-3">
                        <Brain className="h-8 w-8" />
                        <span>Trading Psychology & Discipline</span>
                        <Badge className="bg-pink-600 text-white">ADVANCED</Badge>
                      </CardTitle>
                      <CardDescription className="text-purple-200 mt-2">
                        Develop the mental framework for consistent trading success
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCourse(null);
                        setSelectedLesson(null);
                      }}
                      className="text-white border-white hover:bg-white hover:text-purple-900"
                    >
                      ← Back to Courses
                    </Button>
                  </div>
                  <div className="flex items-center space-x-6 mt-4 text-purple-200">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>5 hours total</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>15 lessons</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>{Object.keys(lessonProgress).length}/15 completed</span>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Lesson List or Lesson Detail */}
              {!selectedLesson && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tradingPsychologyLessons.map((lesson) => (
                    <Card 
                      key={lesson.id} 
                      className={`bg-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer ${
                        lessonProgress[lesson.id] ? 'border-green-500' : ''
                      }`}
                      onClick={() => setSelectedLesson(lesson.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg flex items-center space-x-2">
                              <span className="text-purple-500">#{lesson.id}</span>
                              <span>{lesson.title}</span>
                              {lessonProgress[lesson.id] && <Badge className="bg-green-600">✓ Completed</Badge>}
                            </CardTitle>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{lesson.duration}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {lesson.type}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}

              {/* Individual Lesson Detail */}
              {selectedLesson && (
                <div className="space-y-6">
                  {(() => {
                    const lesson = tradingPsychologyLessons.find(l => l.id === selectedLesson);
                    if (!lesson) return null;
                    
                    return (
                      <>
                        <Card className="bg-gray-800 border-gray-700">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-white text-xl flex items-center space-x-2">
                                  <span className="text-purple-500">Lesson {lesson.id}:</span>
                                  <span>{lesson.title}</span>
                                </CardTitle>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{lesson.duration}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {lesson.type}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedLesson(null)}
                                className="text-white border-gray-600 hover:bg-gray-700"
                              >
                                ← Back to Lessons
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Learning Objectives */}
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                                <Lightbulb className="h-5 w-5 text-yellow-500" />
                                <span>Learning Objectives</span>
                              </h3>
                              <ul className="space-y-2">
                                {lesson.content.objectives.map((objective, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-gray-300">
                                    <span className="text-purple-500 mt-1">•</span>
                                    <span>{objective}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Key Points */}
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                                <Eye className="h-5 w-5 text-green-500" />
                                <span>Key Points</span>
                              </h3>
                              <ul className="space-y-2">
                                {lesson.content.keyPoints.map((point, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-gray-300">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Summary */}
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-purple-500" />
                                <span>Summary</span>
                              </h3>
                              <p className="text-gray-300 leading-relaxed">
                                {lesson.content.summary}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                              <div className="flex items-center space-x-3">
                                {lesson.id > 1 && (
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedLesson(lesson.id - 1)}
                                    className="text-white border-gray-600 hover:bg-gray-700"
                                  >
                                    ← Previous Lesson
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                <Button
                                  onClick={() => {
                                    setLessonProgress(prev => ({ ...prev, [lesson.id]: true }));
                                  }}
                                  className={`${
                                    lessonProgress[lesson.id] 
                                      ? 'bg-green-600 hover:bg-green-700' 
                                      : 'bg-purple-600 hover:bg-purple-700'
                                  }`}
                                >
                                  {lessonProgress[lesson.id] ? '✓ Completed' : 'Mark Complete'}
                                </Button>
                                {lesson.id < tradingPsychologyLessons.length && (
                                  <Button
                                    onClick={() => setSelectedLesson(lesson.id + 1)}
                                    className="bg-pink-600 hover:bg-pink-700"
                                  >
                                    Next Lesson →
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Cryptocurrency Trading Strategies Course Detail View */}
          {selectedCourse === 'crypto-strategies' && (
            <div className="space-y-6">
              {/* Course Header with Back Button */}
              <Card className="bg-gradient-to-r from-orange-900 to-yellow-900 border-orange-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-2xl flex items-center space-x-3">
                        <Zap className="h-8 w-8" />
                        <span>Cryptocurrency Trading Strategies</span>
                        <Badge className="bg-yellow-600 text-white">INTERMEDIATE</Badge>
                      </CardTitle>
                      <CardDescription className="text-orange-200 mt-2">
                        Navigate the crypto markets with specialized strategies and insights
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCourse(null);
                        setSelectedLesson(null);
                      }}
                      className="text-white border-white hover:bg-white hover:text-orange-900"
                    >
                      ← Back to Courses
                    </Button>
                  </div>
                  <div className="flex items-center space-x-6 mt-4 text-orange-200">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>4 hours total</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>14 lessons</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>{Object.keys(lessonProgress).length}/14 completed</span>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Lesson List or Lesson Detail */}
              {!selectedLesson && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cryptoTradingLessons.map((lesson) => (
                    <Card 
                      key={lesson.id} 
                      className={`bg-gray-800 border-gray-700 hover:border-orange-500 transition-all duration-300 cursor-pointer ${
                        lessonProgress[lesson.id] ? 'border-green-500' : ''
                      }`}
                      onClick={() => setSelectedLesson(lesson.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg flex items-center space-x-2">
                              <span className="text-orange-500">#{lesson.id}</span>
                              <span>{lesson.title}</span>
                              {lessonProgress[lesson.id] && <Badge className="bg-green-600">✓ Completed</Badge>}
                            </CardTitle>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{lesson.duration}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {lesson.type}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}

              {/* Individual Lesson Detail */}
              {selectedLesson && (
                <div className="space-y-6">
                  {(() => {
                    const lesson = cryptoTradingLessons.find(l => l.id === selectedLesson);
                    if (!lesson) return null;
                    
                    return (
                      <>
                        <Card className="bg-gray-800 border-gray-700">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-white text-xl flex items-center space-x-2">
                                  <span className="text-orange-500">Lesson {lesson.id}:</span>
                                  <span>{lesson.title}</span>
                                </CardTitle>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{lesson.duration}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {lesson.type}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedLesson(null)}
                                className="text-white border-gray-600 hover:bg-gray-700"
                              >
                                ← Back to Lessons
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Learning Objectives */}
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                                <Lightbulb className="h-5 w-5 text-yellow-500" />
                                <span>Learning Objectives</span>
                              </h3>
                              <ul className="space-y-2">
                                {lesson.content.objectives.map((objective, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-gray-300">
                                    <span className="text-orange-500 mt-1">•</span>
                                    <span>{objective}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Key Points */}
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                                <Eye className="h-5 w-5 text-green-500" />
                                <span>Key Points</span>
                              </h3>
                              <ul className="space-y-2">
                                {lesson.content.keyPoints.map((point, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-gray-300">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Summary */}
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-orange-500" />
                                <span>Summary</span>
                              </h3>
                              <p className="text-gray-300 leading-relaxed">
                                {lesson.content.summary}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                              <div className="flex items-center space-x-3">
                                {lesson.id > 1 && (
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedLesson(lesson.id - 1)}
                                    className="text-white border-gray-600 hover:bg-gray-700"
                                  >
                                    ← Previous Lesson
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                <Button
                                  onClick={() => {
                                    setLessonProgress(prev => ({ ...prev, [lesson.id]: true }));
                                  }}
                                  className={`${
                                    lessonProgress[lesson.id] 
                                      ? 'bg-green-600 hover:bg-green-700' 
                                      : 'bg-orange-600 hover:bg-orange-700'
                                  }`}
                                >
                                  {lessonProgress[lesson.id] ? '✓ Completed' : 'Mark Complete'}
                                </Button>
                                {lesson.id < cryptoTradingLessons.length && (
                                  <Button
                                    onClick={() => setSelectedLesson(lesson.id + 1)}
                                    className="bg-yellow-600 hover:bg-yellow-700"
                                  >
                                    Next Lesson →
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Technical Analysis Mastery Course Detail View */}
          {selectedCourse === 'technical-analysis' && (
            <div className="space-y-6">
              {/* Course Header with Back Button */}
              <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-2xl flex items-center space-x-3">
                        <BarChart3 className="h-8 w-8" />
                        <span>Technical Analysis Mastery</span>
                        <Badge className="bg-orange-600 text-white">INTERMEDIATE</Badge>
                      </CardTitle>
                      <CardDescription className="text-purple-200 mt-2">
                        Master chart patterns, indicators, and technical trading strategies
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCourse(null);
                        setSelectedLesson(null);
                      }}
                      className="text-white border-white hover:bg-white hover:text-purple-900"
                    >
                      ← Back to Courses
                    </Button>
                  </div>
                  <div className="flex items-center space-x-6 mt-4 text-purple-200">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>6 hours total</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>18 lessons</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>{Object.keys(lessonProgress).length}/18 completed</span>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Lesson List or Lesson Detail */}
              {!selectedLesson && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {technicalAnalysisLessons.map((lesson) => (
                    <Card 
                      key={lesson.id} 
                      className={`bg-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer ${
                        lessonProgress[lesson.id] ? 'border-green-500' : ''
                      }`}
                      onClick={() => setSelectedLesson(lesson.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg flex items-center space-x-2">
                              <span className="text-purple-500">#{lesson.id}</span>
                              <span>{lesson.title}</span>
                              {lessonProgress[lesson.id] && <Badge className="bg-green-600">✓ Completed</Badge>}
                            </CardTitle>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{lesson.duration}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {lesson.type}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}

              {/* Individual Lesson Detail */}
              {selectedLesson && (
                <div className="space-y-6">
                  {(() => {
                    const lesson = technicalAnalysisLessons.find(l => l.id === selectedLesson);
                    if (!lesson) return null;
                    
                    return (
                      <>
                        <Card className="bg-gray-800 border-gray-700">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-white text-xl flex items-center space-x-2">
                                  <span className="text-purple-500">Lesson {lesson.id}:</span>
                                  <span>{lesson.title}</span>
                                </CardTitle>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{lesson.duration}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {lesson.type}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedLesson(null)}
                                className="text-white border-gray-600 hover:bg-gray-700"
                              >
                                ← Back to Lessons
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Learning Objectives */}
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                                <Lightbulb className="h-5 w-5 text-yellow-500" />
                                <span>Learning Objectives</span>
                              </h3>
                              <ul className="space-y-2">
                                {lesson.content.objectives.map((objective, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-gray-300">
                                    <span className="text-purple-500 mt-1">•</span>
                                    <span>{objective}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Key Points */}
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                                <Eye className="h-5 w-5 text-green-500" />
                                <span>Key Points</span>
                              </h3>
                              <ul className="space-y-2">
                                {lesson.content.keyPoints.map((point, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-gray-300">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Summary */}
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-purple-500" />
                                <span>Summary</span>
                              </h3>
                              <p className="text-gray-300 leading-relaxed">
                                {lesson.content.summary}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                              <div className="flex items-center space-x-3">
                                {lesson.id > 1 && (
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedLesson(lesson.id - 1)}
                                    className="text-white border-gray-600 hover:bg-gray-700"
                                  >
                                    ← Previous Lesson
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                <Button
                                  onClick={() => {
                                    setLessonProgress(prev => ({ ...prev, [lesson.id]: true }));
                                  }}
                                  className={`${
                                    lessonProgress[lesson.id] 
                                      ? 'bg-green-600 hover:bg-green-700' 
                                      : 'bg-purple-600 hover:bg-purple-700'
                                  }`}
                                >
                                  {lessonProgress[lesson.id] ? '✓ Completed' : 'Mark Complete'}
                                </Button>
                                {lesson.id < technicalAnalysisLessons.length && (
                                  <Button
                                    onClick={() => setSelectedLesson(lesson.id + 1)}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                  >
                                    Next Lesson →
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Trading Fundamentals Course Detail View */}
          {selectedCourse === 'fundamentals' && (
            <div className="space-y-6">
              {/* Course Header with Back Button */}
              <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-2xl flex items-center space-x-3">
                        <BookOpen className="h-8 w-8" />
                        <span>Trading Fundamentals</span>
                        <Badge className="bg-green-600 text-white">BEGINNER</Badge>
                      </CardTitle>
                      <CardDescription className="text-blue-200 mt-2">
                        Master the core concepts of trading, market mechanics, and financial instruments
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCourse(null);
                        setSelectedLesson(null);
                      }}
                      className="text-white border-white hover:bg-white hover:text-blue-900"
                    >
                      ← Back to Courses
                    </Button>
                  </div>
                  <div className="flex items-center space-x-6 mt-4 text-blue-200">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>4 hours total</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>12 lessons</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>{Object.keys(lessonProgress).length}/12 completed</span>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Lesson List or Lesson Detail */}
              {!selectedLesson && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tradingFundamentalsLessons.map((lesson) => (
                    <Card 
                      key={lesson.id} 
                      className={`bg-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300 cursor-pointer ${
                        lessonProgress[lesson.id] ? 'border-green-500' : ''
                      }`}
                      onClick={() => setSelectedLesson(lesson.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg flex items-center space-x-2">
                              <span className="text-blue-500">#{lesson.id}</span>
                              <span>{lesson.title}</span>
                              {lessonProgress[lesson.id] && <Badge className="bg-green-600">✓ Completed</Badge>}
                            </CardTitle>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{lesson.duration}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {lesson.type}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}

              {/* Individual Lesson Detail */}
              {selectedLesson && (
                <div className="space-y-6">
                  {(() => {
                    const lesson = tradingFundamentalsLessons.find(l => l.id === selectedLesson);
                    if (!lesson) return null;
                    
                    return (
                      <>
                        <Card className="bg-gray-800 border-gray-700">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-white text-xl flex items-center space-x-2">
                                  <span className="text-blue-500">Lesson {lesson.id}:</span>
                                  <span>{lesson.title}</span>
                                </CardTitle>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{lesson.duration}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {lesson.type}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedLesson(null)}
                                className="text-white border-gray-600 hover:bg-gray-700"
                              >
                                ← Back to Lessons
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Learning Objectives */}
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                                <Lightbulb className="h-5 w-5 text-yellow-500" />
                                <span>Learning Objectives</span>
                              </h3>
                              <ul className="space-y-2">
                                {lesson.content.objectives.map((objective, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-gray-300">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <span>{objective}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Key Points */}
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                                <Eye className="h-5 w-5 text-green-500" />
                                <span>Key Points</span>
                              </h3>
                              <ul className="space-y-2">
                                {lesson.content.keyPoints.map((point, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-gray-300">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Summary */}
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-purple-500" />
                                <span>Summary</span>
                              </h3>
                              <p className="text-gray-300 leading-relaxed">
                                {lesson.content.summary}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                              <div className="flex items-center space-x-3">
                                {lesson.id > 1 && (
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedLesson(lesson.id - 1)}
                                    className="text-white border-gray-600 hover:bg-gray-700"
                                  >
                                    ← Previous Lesson
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                <Button
                                  onClick={() => {
                                    setLessonProgress(prev => ({ ...prev, [lesson.id]: true }));
                                  }}
                                  className={`${
                                    lessonProgress[lesson.id] 
                                      ? 'bg-green-600 hover:bg-green-700' 
                                      : 'bg-blue-600 hover:bg-blue-700'
                                  }`}
                                >
                                  {lessonProgress[lesson.id] ? '✓ Completed' : 'Mark Complete'}
                                </Button>
                                {lesson.id < tradingFundamentalsLessons.length && (
                                  <Button
                                    onClick={() => setSelectedLesson(lesson.id + 1)}
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    Next Lesson →
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* KonsAi Tutor */}
        <TabsContent value="konsai-tutor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Bot className="h-6 w-6 text-blue-500" />
                    <span>KonsAi Trading Tutor</span>
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Ask me anything about trading! I'm here to help you learn and improve.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Chat History */}
                    <ScrollArea className="h-96 p-4 border border-gray-700 rounded-lg bg-gray-900">
                      <div className="space-y-4">
                        {chatHistory.length === 0 ? (
                          <div className="text-center text-gray-500 py-8">
                            <Bot className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                            <p>Hello! I'm KonsAi, your personal trading tutor.</p>
                            <p className="text-sm mt-2">Ask me anything about trading strategies, risk management, technical analysis, or market psychology!</p>
                          </div>
                        ) : (
                          chatHistory.map((chat, index) => (
                            <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] p-3 rounded-lg ${
                                chat.role === 'user' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-700 text-gray-100'
                              }`}>
                                <div className="flex items-start space-x-2">
                                  {chat.role === 'konsai' && <Bot className="h-5 w-5 mt-0.5 text-blue-400" />}
                                  <div>
                                    <p className="text-sm">{chat.message}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                      {new Date(chat.timestamp).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>

                    {/* Question Input */}
                    <div className="flex space-x-2">
                      <Input
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        placeholder="Ask me about trading strategies, risk management, or any trading topic..."
                        className="flex-1 bg-gray-700 border-gray-600 text-white"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleKonsAiQuestion(currentQuestion);
                          }
                        }}
                      />
                      <Button 
                        onClick={() => handleKonsAiQuestion(currentQuestion)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Questions */}
            <div>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Quick Questions</CardTitle>
                  <CardDescription className="text-gray-400">
                    Popular trading topics to get you started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {konsAiKnowledge.map((category) => (
                        <div key={category.category}>
                          <h4 className="font-semibold text-white mb-2">{category.category}</h4>
                          <div className="space-y-2">
                            {category.questions.map((question, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="w-full text-left justify-start text-xs h-auto py-2 px-3"
                                onClick={() => {
                                  setCurrentQuestion(question);
                                  handleKonsAiQuestion(question);
                                }}
                              >
                                <Lightbulb className="h-3 w-3 mr-2 flex-shrink-0" />
                                <span className="truncate">{question}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Trading Simulations */}
        <TabsContent value="simulations" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Target className="h-6 w-6" />
                <span>Interactive Trading Simulations</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Practice trading in risk-free environments with real market scenarios
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tradingSimulations.map((simulation) => (
              <Card key={simulation.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>{simulation.title}</span>
                    <Badge className={`${getLevelColor(simulation.difficulty)} text-white`}>
                      {simulation.difficulty}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-400">{simulation.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{simulation.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <span>{simulation.scenario}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => runSimulation(simulation.id)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={activeSimulation === simulation.id}
                    >
                      {activeSimulation === simulation.id ? (
                        'Running Simulation...'
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Simulation
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Simulation Results */}
          {simulationResults && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Award className="h-6 w-6 text-yellow-500" />
                  <span>Simulation Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      ${simulationResults.finalBalance?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Final Balance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {simulationResults.trades}
                    </div>
                    <div className="text-sm text-gray-400">Total Trades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">
                      {simulationResults.winRate}%
                    </div>
                    <div className="text-sm text-gray-400">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${simulationResults.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${simulationResults.profitLoss}
                    </div>
                    <div className="text-sm text-gray-400">P&L</div>
                  </div>
                </div>

                {simulationResults.lessons && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Key Lessons:</h4>
                    {simulationResults.lessons.map((lesson: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <span className="text-gray-300 text-sm">{lesson}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trading Tools */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Position Size Calculator</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input 
                    placeholder="Account Balance" 
                    className="bg-gray-700 border-gray-600" 
                    value={calculatorInputs.positionSize.accountBalance}
                    onChange={(e) => setCalculatorInputs(prev => ({
                      ...prev,
                      positionSize: { ...prev.positionSize, accountBalance: e.target.value }
                    }))}
                  />
                  <Input 
                    placeholder="Risk Per Trade (%)" 
                    className="bg-gray-700 border-gray-600" 
                    value={calculatorInputs.positionSize.riskPercent}
                    onChange={(e) => setCalculatorInputs(prev => ({
                      ...prev,
                      positionSize: { ...prev.positionSize, riskPercent: e.target.value }
                    }))}
                  />
                  <Input 
                    placeholder="Stop Loss Distance" 
                    className="bg-gray-700 border-gray-600" 
                    value={calculatorInputs.positionSize.stopLossDistance}
                    onChange={(e) => setCalculatorInputs(prev => ({
                      ...prev,
                      positionSize: { ...prev.positionSize, stopLossDistance: e.target.value }
                    }))}
                  />
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={calculatePositionSize}
                  >
                    Calculate Position Size
                  </Button>
                  {calculatorResults.positionSize && (
                    <div className="mt-4 p-3 bg-gray-700 rounded-lg space-y-2">
                      <div className="text-sm text-gray-300">
                        <strong>Position Size:</strong> ${calculatorResults.positionSize.positionSize}
                      </div>
                      <div className="text-sm text-gray-300">
                        <strong>Risk Amount:</strong> ${calculatorResults.positionSize.riskAmount}
                      </div>
                      <div className="text-sm text-gray-300">
                        <strong>Max Loss:</strong> ${calculatorResults.positionSize.maxLoss}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Risk/Reward Calculator</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input 
                    placeholder="Entry Price" 
                    className="bg-gray-700 border-gray-600" 
                    value={calculatorInputs.riskReward.entryPrice}
                    onChange={(e) => setCalculatorInputs(prev => ({
                      ...prev,
                      riskReward: { ...prev.riskReward, entryPrice: e.target.value }
                    }))}
                  />
                  <Input 
                    placeholder="Stop Loss Price" 
                    className="bg-gray-700 border-gray-600" 
                    value={calculatorInputs.riskReward.stopLoss}
                    onChange={(e) => setCalculatorInputs(prev => ({
                      ...prev,
                      riskReward: { ...prev.riskReward, stopLoss: e.target.value }
                    }))}
                  />
                  <Input 
                    placeholder="Take Profit Price" 
                    className="bg-gray-700 border-gray-600" 
                    value={calculatorInputs.riskReward.takeProfit}
                    onChange={(e) => setCalculatorInputs(prev => ({
                      ...prev,
                      riskReward: { ...prev.riskReward, takeProfit: e.target.value }
                    }))}
                  />
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={calculateRiskReward}
                  >
                    Calculate R:R Ratio
                  </Button>
                  {calculatorResults.riskReward && (
                    <div className="mt-4 p-3 bg-gray-700 rounded-lg space-y-2">
                      <div className="text-sm text-gray-300">
                        <strong>Risk:</strong> ${calculatorResults.riskReward.riskAmount}
                      </div>
                      <div className="text-sm text-gray-300">
                        <strong>Reward:</strong> ${calculatorResults.riskReward.rewardAmount}
                      </div>
                      <div className="text-sm text-gray-300">
                        <strong>R:R Ratio:</strong> 1:{calculatorResults.riskReward.ratio}
                      </div>
                      <div className={`text-sm font-semibold ${
                        calculatorResults.riskReward.quality === 'Excellent' ? 'text-green-400' :
                        calculatorResults.riskReward.quality === 'Good' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        Quality: {calculatorResults.riskReward.quality}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Portfolio Analyzer</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Textarea 
                    placeholder="Enter your positions (Symbol:Amount, e.g., ETH:1.5 BTC:0.1)"
                    className="bg-gray-700 border-gray-600"
                    rows={3}
                    value={calculatorInputs.portfolio.positions}
                    onChange={(e) => setCalculatorInputs(prev => ({
                      ...prev,
                      portfolio: { ...prev.portfolio, positions: e.target.value }
                    }))}
                  />
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={analyzePortfolio}
                  >
                    Analyze Portfolio
                  </Button>
                  {calculatorResults.portfolio && (
                    <div className="mt-4 p-3 bg-gray-700 rounded-lg space-y-2">
                      <div className="text-sm text-gray-300">
                        <strong>Total Value:</strong> ${calculatorResults.portfolio.totalValue?.toLocaleString()}
                      </div>
                      {calculatorResults.portfolio.allocation && (
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-gray-300">Allocation:</div>
                          {Object.entries(calculatorResults.portfolio.allocation).map(([asset, percentage]) => (
                            <div key={asset} className="flex justify-between text-sm text-gray-400">
                              <span>{asset}:</span>
                              <span>{percentage}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {calculatorResults.portfolio.riskScore && (
                        <div className="text-sm text-gray-300">
                          <strong>Risk Score:</strong> {calculatorResults.portfolio.riskScore}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress Tracking */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tradingCourses.map((course, index) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {course.icon}
                        <span className="text-white text-sm">{course.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={Math.random() * 100} className="w-20 h-2" />
                        <span className="text-sm text-gray-400">{Math.floor(Math.random() * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Achievement Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">15</div>
                    <div className="text-sm text-gray-400">Courses Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">89%</div>
                    <div className="text-sm text-gray-400">Average Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-500">24</div>
                    <div className="text-sm text-gray-400">Simulations Run</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-500">127</div>
                    <div className="text-sm text-gray-400">Questions Asked</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}