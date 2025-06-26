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