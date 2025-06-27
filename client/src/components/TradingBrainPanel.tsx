import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Brain, Search, TrendingUp, Shield, Target, Zap, BarChart3, Globe, Clock, Heart, Activity } from "lucide-react";

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

interface TradingScorecard {
  mindsetScore: number;
  technicalScore: number;
  riskScore: number;
  disciplineScore: number;
  overallRating: string;
  recommendations: string[];
}

export default function TradingBrainPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [situationInput, setSituationInput] = useState("");

  const { data: dailyWisdom } = useQuery<{ wisdom: string }>({
    queryKey: ['/api/trading-brain/daily-wisdom'],
    refetchInterval: 3600000, // Refresh every hour
  });

  const { data: searchResults } = useQuery<TradingKnowledge[]>({
    queryKey: ['/api/trading-brain/search', searchQuery],
    enabled: searchQuery.length > 2,
  });

  const { data: categoryKnowledge } = useQuery<TradingKnowledge[]>({
    queryKey: ['/api/trading-brain/category', selectedCategory],
    enabled: selectedCategory !== "ALL",
  });

  const { data: situationAdvice } = useQuery<TradingAdvice>({
    queryKey: ['/api/trading-brain/advice', situationInput],
    enabled: situationInput.length > 3,
  });

  const { data: scorecard } = useQuery<TradingScorecard>({
    queryKey: ['/api/trading-brain/scorecard'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const { data: marketPsychology } = useQuery<any>({
    queryKey: ['/api/trading-brain/psychology'],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: waidesKIStatus } = useQuery<{
    isActive: boolean;
    lastScan: string;
    performance: {
      winRate: number;
      totalTrades: number;
      status: string;
      evolutionStage: string;
      learningConfidence: number;
      activeTrades: number;
      tradingMode: string;
      totalReturn: number;
      currentCapital: number;
      maxDrawdown: number;
    };
    observation: {
      totalObservations: number;
      signalQuality: number;
      strongSignals: number;
      marketPhase: string;
      isObserving: boolean;
    };
    riskManagement: {
      currentRiskLevel: number;
      blockedStrategies: number;
      riskAdjustment: string;
    };
  }>({
    queryKey: ['/api/waides-ki/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: capitalStats } = useQuery<{
    currentCapital: number;
    totalReturn: number;
    totalReturnPercent: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
    blockedStrategies: number;
  }>({
    queryKey: ['/api/waides-ki/capital-stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: ethPriceData } = useQuery<{
    price: number;
    timestamp: number;
    isLive: boolean;
    symbol: string;
  }>({
    queryKey: ['/api/eth/price'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: marketSummary } = useQuery<{
    currentPrice: number;
    priceChangePercent24h: number;
    volume24h: number;
    isLive: boolean;
  }>({
    queryKey: ['/api/eth/market-summary'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: learningStats } = useQuery<{
    total_strategies: number;
    best_strategy: string;
    worst_strategy: string;
    overall_win_rate: number;
    total_trades: number;
    evolution_stage: string;
    learning_confidence: number;
  }>({
    queryKey: ['/api/waides-ki/learning-stats'],
    refetchInterval: 60000, // Refresh every minute
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MINDSET': return <Brain className="w-4 h-4" />;
      case 'TECHNICAL': return <BarChart3 className="w-4 h-4" />;
      case 'TIMING': return <Clock className="w-4 h-4" />;
      case 'RISK': return <Shield className="w-4 h-4" />;
      case 'STRATEGY': return <Target className="w-4 h-4" />;
      case 'AUTOMATION': return <Zap className="w-4 h-4" />;
      case 'ADVANCED': return <TrendingUp className="w-4 h-4" />;
      case 'FUNDAMENTALS': return <Globe className="w-4 h-4" />;
      case 'DISCIPLINE': return <Shield className="w-4 h-4" />;
      case 'SPIRITUAL': return <Heart className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'INTERMEDIATE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'ADVANCED': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'EXPERT': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const categories = [
    { id: 'MINDSET', name: 'Mindset & Psychology', icon: Brain },
    { id: 'TECHNICAL', name: 'Technical Analysis', icon: BarChart3 },
    { id: 'TIMING', name: 'Timing & Sessions', icon: Clock },
    { id: 'RISK', name: 'Risk Management', icon: Shield },
    { id: 'STRATEGY', name: 'Strategy Building', icon: Target },
    { id: 'AUTOMATION', name: 'Bots & Automation', icon: Zap },
    { id: 'ADVANCED', name: 'Advanced Tools', icon: TrendingUp },
    { id: 'FUNDAMENTALS', name: 'News & Fundamentals', icon: Globe },
    { id: 'DISCIPLINE', name: 'Self-Discipline', icon: Shield },
    { id: 'SPIRITUAL', name: 'Spiritual & Legacy', icon: Heart }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Daily Wisdom and KI Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-purple-400" />
              <span>Waides KI Trading Brain</span>
            </CardTitle>
            <CardDescription>
              Advanced trading knowledge system with 100+ professional insights
            </CardDescription>
          </CardHeader>
          {dailyWisdom && (
            <CardContent>
              <div className="bg-purple-950/30 p-4 rounded-lg border border-purple-500/20">
                <div className="text-sm font-medium text-purple-300 mb-2">Daily Trading Wisdom</div>
                <div className="text-purple-200 italic">"{dailyWisdom.wisdom}"</div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Waides KI Status (Minimal Info) */}
        {waidesKIStatus && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm">
                <Activity className="w-4 h-4 text-green-400" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Status</span>
                <span className="text-xs text-green-400">{waidesKIStatus.performance?.status || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Performance</span>
                <span className="text-xs text-slate-300">{waidesKIStatus.performance?.winRate || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Evolution</span>
                <span className="text-xs text-blue-400">{waidesKIStatus.performance?.evolutionStage || 'Learning'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Learning</span>
                <span className="text-xs text-green-400">{waidesKIStatus.performance?.learningConfidence || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Trading Mode</span>
                <span className="text-xs text-purple-400">{waidesKIStatus.performance?.tradingMode || 'Observing'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Active Trades</span>
                <span className="text-xs text-orange-400">{waidesKIStatus.performance?.activeTrades || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Last Scan</span>
                <span className="text-xs text-slate-300">
                  {waidesKIStatus.lastScan ? new Date(waidesKIStatus.lastScan).toLocaleTimeString() : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Observations</span>
                <span className="text-xs text-slate-300">{waidesKIStatus.observation?.totalObservations || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Signal Quality</span>
                <span className="text-xs text-blue-400">{waidesKIStatus.observation?.signalQuality || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">ETH Price</span>
                <span className="text-xs text-blue-400">
                  ${ethPriceData?.price?.toFixed(2) || '2,414'}
                  {ethPriceData?.isLive && <span className="ml-1 text-green-400">●</span>}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">24h Change</span>
                <span className={`text-xs ${(marketSummary?.priceChangePercent24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(marketSummary?.priceChangePercent24h || 0).toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Capital</span>
                <span className="text-xs text-green-400">${capitalStats?.currentCapital?.toFixed(0) || '10,000'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Return</span>
                <span className={`text-xs ${(capitalStats?.totalReturnPercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(capitalStats?.totalReturnPercent || 0).toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-slate-500 text-center mt-2">
                Live WebSocket Data Feed
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="knowledge" className="w-full">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-1 mb-6">
          <div className="overflow-x-auto scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <TabsList className="flex w-max bg-transparent gap-1 p-0 h-auto min-w-fit">
              <TabsTrigger 
                value="knowledge" 
                className="flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors whitespace-nowrap"
              >
                Knowledge Base
              </TabsTrigger>
              <TabsTrigger 
                value="advisor" 
                className="flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors whitespace-nowrap"
              >
                AI Advisor
              </TabsTrigger>
              <TabsTrigger 
                value="scorecard" 
                className="flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors whitespace-nowrap"
              >
                Scorecard
              </TabsTrigger>
              <TabsTrigger 
                value="psychology" 
                className="flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-md data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors whitespace-nowrap"
              >
                Market Psychology
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="knowledge" className="space-y-6">
          {/* Search and Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Search Trading Knowledge</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search trading questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Browse by Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200"
              >
                <option value="ALL">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Results or Category Results */}
          <ScrollArea className="h-96">
            {searchResults && searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200">Search Results</h3>
                {searchResults.map((item, index) => (
                  <Card key={index} className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(item.category)}
                          <span className="text-sm font-medium text-slate-300">{item.section}</span>
                        </div>
                        <Badge className={getDifficultyColor(item.difficulty)} variant="outline">
                          {item.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-slate-200 text-base">{item.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300 mb-3">{item.answer}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs bg-slate-700/50 text-slate-400">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {categoryKnowledge && categoryKnowledge.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200">
                  {categories.find(c => c.id === selectedCategory)?.name} Knowledge
                </h3>
                {categoryKnowledge.map((item, index) => (
                  <Card key={index} className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(item.category)}
                          <span className="text-sm font-medium text-slate-300">{item.section}</span>
                        </div>
                        <Badge className={getDifficultyColor(item.difficulty)} variant="outline">
                          {item.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-slate-200 text-base">{item.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300 mb-3">{item.answer}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs bg-slate-700/50 text-slate-400">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!searchResults && !categoryKnowledge && (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Search for trading knowledge or select a category to explore</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="advisor" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>AI Trading Advisor</CardTitle>
              <CardDescription>
                Describe your trading situation for personalized advice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Describe your situation</label>
                <Input
                  placeholder="e.g., 'I'm feeling emotional after a loss' or 'I'm in a winning streak'"
                  value={situationInput}
                  onChange={(e) => setSituationInput(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              
              {situationAdvice && (
                <div className="space-y-4">
                  <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-300 mb-2">{situationAdvice.topic}</h4>
                    <p className="text-blue-200 mb-3">{situationAdvice.advice}</p>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-blue-300">Action Items:</h5>
                      <ul className="space-y-1">
                        {situationAdvice.actionItems.map((item, index) => (
                          <li key={index} className="text-sm text-blue-200 flex items-start space-x-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {situationAdvice.riskWarning && (
                      <div className="mt-3 bg-red-900/30 border border-red-500/30 p-2 rounded">
                        <span className="text-red-300 text-sm font-medium">⚠️ {situationAdvice.riskWarning}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scorecard" className="space-y-6">
          {scorecard && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle>Trading Skills Assessment</CardTitle>
                  <CardDescription>Your current trading performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Mindset & Psychology</span>
                        <span className="text-slate-300">{scorecard.mindsetScore}%</span>
                      </div>
                      <Progress value={scorecard.mindsetScore} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Technical Analysis</span>
                        <span className="text-slate-300">{scorecard.technicalScore}%</span>
                      </div>
                      <Progress value={scorecard.technicalScore} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Risk Management</span>
                        <span className="text-slate-300">{scorecard.riskScore}%</span>
                      </div>
                      <Progress value={scorecard.riskScore} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Discipline</span>
                        <span className="text-slate-300">{scorecard.disciplineScore}%</span>
                      </div>
                      <Progress value={scorecard.disciplineScore} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg">
                    <div className="text-lg font-bold text-green-400">{scorecard.overallRating}</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle>Improvement Recommendations</CardTitle>
                  <CardDescription>Focus areas for skill development</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scorecard.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-slate-800/50 rounded-lg">
                        <Target className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-300">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="psychology" className="space-y-6">
          {marketPsychology && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle>Current Market Psychology</CardTitle>
                  <CardDescription>Understanding crowd emotions and behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-slate-400">Dominant Emotion:</span>
                      <div className="text-lg font-semibold text-orange-400">{marketPsychology.dominantEmotion}</div>
                    </div>
                    
                    <div>
                      <span className="text-sm text-slate-400">Crowd Behavior:</span>
                      <div className="text-sm text-slate-300">{marketPsychology.crowdBehavior}</div>
                    </div>
                    
                    <div className="bg-yellow-900/30 border border-yellow-500/30 p-3 rounded-lg">
                      <div className="text-sm font-medium text-yellow-300 mb-1">Contrarian Opportunity:</div>
                      <div className="text-sm text-yellow-200">{marketPsychology.contrarian_opportunity}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle>Psychology-Based Advice</CardTitle>
                  <CardDescription>How to use market emotions to your advantage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-lg">
                    <p className="text-blue-200 text-sm">{marketPsychology.advice}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}