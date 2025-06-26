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
  const [calculatorResults, setCalculatorResults] = useState({
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
                    placeholder="Enter your positions (Symbol:Amount)"
                    className="bg-gray-700 border-gray-600"
                    rows={3}
                  />
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Analyze Portfolio
                  </Button>
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