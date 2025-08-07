import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Star, 
  Crown, 
  Zap, 
  Rocket, 
  Infinity, 
  Sparkles, 
  Play,
  Square,
  Activity,
  TrendingUp,
  Shield,
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  Eye,
  Heart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

/**
 * Complete WaidBot Engine - All 6 Trading Entities with Standalone Autonomous Decision Making
 * Enhanced implementation showing all bots with their respective page connections
 */

interface BotEntity {
  id: string;
  name: string;
  displayName: string;
  tier: string;
  price: number;
  icon: any;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
  specialties: string[];
  routePath: string;
  autonomous: boolean;
  decisionEngine: string;
  tradingPairs: string[];
  riskLevel: string;
  maxPosition: number;
  fees: number;
}

const BOT_ENTITIES: BotEntity[] = [
  {
    id: 'maibot',
    name: 'Maibot',
    displayName: 'Free Trading Assistant',
    tier: 'FREE',
    price: 0,
    icon: Star,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-900",
    description: 'Entry-level bot with manual approval for all trades',
    specialties: ['Basic Market Analysis', 'Manual Approval', 'Conservative Risk'],
    routePath: '/maibot',
    autonomous: false,
    decisionEngine: 'Manual Override Required',
    tradingPairs: ['ETH/USDT'],
    riskLevel: 'Conservative',
    maxPosition: 0.01,
    fees: 35
  },
  {
    id: 'waidbot-alpha',
    name: 'WaidBot α',
    displayName: 'Basic ETH Uptrend Trading',
    tier: 'BASIC',
    price: 9.99,
    icon: TrendingUp,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-900",
    description: 'ETH uptrend-only trading with semi-autonomous decision making',
    specialties: ['Uptrend Detection', 'ETH Focus', 'Semi-Autonomous'],
    routePath: '/waidbot',
    autonomous: true,
    decisionEngine: 'Uptrend-Only Algorithm',
    tradingPairs: ['ETH/USDT'],
    riskLevel: 'Moderate',
    maxPosition: 0.1,
    fees: 20
  },
  {
    id: 'waidbot-pro-beta',
    name: 'WaidBot Pro β',
    displayName: 'Professional Bidirectional Trading',
    tier: 'PRO',
    price: 29.99,
    icon: Crown,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-900",
    description: 'Full bidirectional ETH3L/ETH3S trading with advanced AI',
    specialties: ['Bidirectional Trading', 'ETH3L/ETH3S', 'Advanced AI'],
    routePath: '/waidbot-pro',
    autonomous: true,
    decisionEngine: 'Bidirectional Analysis Engine',
    tradingPairs: ['ETH3L/USDT', 'ETH3S/USDT'],
    riskLevel: 'Aggressive',
    maxPosition: 0.5,
    fees: 10
  },
  {
    id: 'autonomous-gamma',
    name: 'Autonomous Trader γ',
    displayName: '24/7 Market Scanner Elite',
    tier: 'ELITE',
    price: 59.99,
    icon: Zap,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-900",
    description: 'Multi-market autonomous scanner with 24/7 operation',
    specialties: ['24/7 Operation', 'Multi-Market', 'ML Algorithms'],
    routePath: '/enhanced-waidbot',
    autonomous: true,
    decisionEngine: 'Multi-Strategy ML Engine',
    tradingPairs: ['ETH/USDT', 'BTC/USDT', 'SOL/USDT'],
    riskLevel: 'Dynamic',
    maxPosition: 1.0,
    fees: 5
  },
  {
    id: 'full-engine-omega',
    name: 'Full Engine Ω',
    displayName: 'Master Trading Engine',
    tier: 'MASTER',
    price: 149.99,
    icon: Rocket,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    textColor: "text-red-900",
    description: 'Complete trading suite with smart risk management',
    specialties: ['Complete Suite', 'Smart Risk Management', 'ML Integration'],
    routePath: '/waidbot-engine',
    autonomous: true,
    decisionEngine: 'Guardian Decision System',
    tradingPairs: ['All Major Pairs'],
    riskLevel: 'Intelligent',
    maxPosition: 5.0,
    fees: 3
  },
  {
    id: 'smai-chinnikstah-delta',
    name: 'SmaiChinnikstah δ',
    displayName: 'Divine Spiritual Trading',
    tier: 'DIVINE_DELTA',
    price: 299.99,
    icon: Sparkles,
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
    textColor: "text-pink-900",
    description: 'Spiritual market intelligence with divine energy distribution',
    specialties: ['Spiritual Intelligence', 'Divine Signals', 'Energy Distribution'],
    routePath: '/divine-trading',
    autonomous: true,
    decisionEngine: 'Divine Energy Algorithm',
    tradingPairs: ['ETH/USD', 'Cosmic Pairs'],
    riskLevel: 'Spiritual',
    maxPosition: 10.0,
    fees: 2
  },
  {
    id: 'nwaora-chigozie-epsilon',
    name: 'Nwaora Chigozie ε',
    displayName: 'Cosmic Intelligence Omega',
    tier: 'COSMIC_EPSILON',
    price: 999.99,
    icon: Infinity,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-900",
    description: 'Ultimate cosmic intelligence with backup trading system',
    specialties: ['Cosmic Intelligence', 'Backup System', 'Unlimited Features'],
    routePath: '/divine-commands',
    autonomous: true,
    decisionEngine: 'Cosmic Consciousness Engine',
    tradingPairs: ['All Pairs + Cosmic'],
    riskLevel: 'Transcendent',
    maxPosition: 50.0,
    fees: 1
  }
];

interface BotStatusData {
  isActive: boolean;
  isRunning: boolean;
  currentBalance?: any;
  performance?: any;
  currentAction?: string;
  confidence?: number;
}

export default function WaidbotEngineComplete() {
  const [selectedBot, setSelectedBot] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch status for all bots
  const botStatusQueries = BOT_ENTITIES.map(bot => 
    useQuery({
      queryKey: [`/api/waidbot-engine/${bot.id.replace('-', '/')}/status`],
      refetchInterval: 10000,
      enabled: true
    })
  );

  // Bot control mutations
  const startBotMutation = useMutation({
    mutationFn: (botId: string) => {
      const apiPath = botId.replace('-', '/');
      return apiRequest(`/api/waidbot-engine/${apiPath}/start`, "POST", {});
    },
    onSuccess: (_, botId) => {
      const bot = BOT_ENTITIES.find(b => b.id === botId);
      toast({
        title: "Bot Started",
        description: `${bot?.name} is now running autonomously`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/waidbot-engine`] });
    },
    onError: (error: any, botId) => {
      const bot = BOT_ENTITIES.find(b => b.id === botId);
      toast({
        title: "Start Failed",
        description: `Failed to start ${bot?.name}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const stopBotMutation = useMutation({
    mutationFn: (botId: string) => {
      const apiPath = botId.replace('-', '/');
      return apiRequest(`/api/waidbot-engine/${apiPath}/stop`, "POST", {});
    },
    onSuccess: (_, botId) => {
      const bot = BOT_ENTITIES.find(b => b.id === botId);
      toast({
        title: "Bot Stopped",
        description: `${bot?.name} has been stopped`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/waidbot-engine`] });
    },
    onError: (error: any, botId) => {
      const bot = BOT_ENTITIES.find(b => b.id === botId);
      toast({
        title: "Stop Failed",
        description: `Failed to stop ${bot?.name}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const getBotStatus = (botId: string): BotStatusData => {
    const queryIndex = BOT_ENTITIES.findIndex(b => b.id === botId);
    const statusData = botStatusQueries[queryIndex]?.data;
    
    return {
      isActive: statusData?.isActive || false,
      isRunning: statusData?.isRunning || false,
      currentBalance: statusData?.currentBalance || statusData?.balance,
      performance: statusData?.performance,
      currentAction: statusData?.currentAction || statusData?.status || 'Standby',
      confidence: statusData?.confidence || 0
    };
  };

  const getAutonomousDecisionDisplay = (bot: BotEntity, status: BotStatusData) => {
    if (!bot.autonomous) {
      return "Manual approval required for all trades";
    }

    const decisions = [
      "Analyzing market conditions...",
      "Evaluating risk parameters...",
      "Scanning for opportunities...",
      "Calculating optimal position size...",
      "Monitoring active positions...",
      "Adjusting strategy parameters..."
    ];

    return status.currentAction || decisions[Math.floor(Math.random() * decisions.length)];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">WaidBot Engine Complete</h2>
          <p className="text-blue-200">
            Central command for all 6 trading entities • Autonomous decision-making bots
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Bot Entities Display */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">All Bots</TabsTrigger>
          <TabsTrigger value="autonomous">Autonomous</TabsTrigger>
          <TabsTrigger value="control">Control Panel</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab - All Bots */}
        <TabsContent value="overview" className="space-y-6">
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {BOT_ENTITIES.map((bot) => {
              const Icon = bot.icon;
              const status = getBotStatus(bot.id);
              const decisionText = getAutonomousDecisionDisplay(bot, status);

              return (
                <Card 
                  key={bot.id} 
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedBot === bot.id ? 'ring-2 ring-blue-500' : ''
                  } ${status.isActive ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                  onClick={() => setSelectedBot(selectedBot === bot.id ? '' : bot.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${bot.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        {status.isActive && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">LIVE</span>
                          </div>
                        )}
                        <Badge variant={status.isRunning ? "default" : "secondary"}>
                          {status.isRunning ? "Running" : "Stopped"}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {bot.name}
                        <span className="text-sm font-normal text-gray-500">
                          ${bot.price}/mo
                        </span>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {bot.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Autonomous Decision Display */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {bot.autonomous ? 'Autonomous Decision' : 'Manual Control'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{decisionText}</p>
                      {bot.autonomous && status.confidence > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Confidence</span>
                            <span>{status.confidence}%</span>
                          </div>
                          <Progress value={status.confidence} className="h-1" />
                        </div>
                      )}
                    </div>

                    {/* Bot Specifications */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Engine:</span>
                        <span className="font-medium">{bot.decisionEngine}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Risk Level:</span>
                        <Badge variant="outline" className="text-xs">
                          {bot.riskLevel}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform Fee:</span>
                        <span className="font-medium text-orange-600">{bot.fees}%</span>
                      </div>
                    </div>

                    {/* Trading Pairs */}
                    <div className="space-y-1">
                      <span className="text-xs text-gray-600">Trading Pairs:</span>
                      <div className="flex flex-wrap gap-1">
                        {bot.tradingPairs.map((pair, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {pair}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant={status.isRunning ? "destructive" : "default"}
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (status.isRunning) {
                            stopBotMutation.mutate(bot.id);
                          } else {
                            startBotMutation.mutate(bot.id);
                          }
                        }}
                        disabled={startBotMutation.isPending || stopBotMutation.isPending}
                      >
                        {status.isRunning ? (
                          <>
                            <Square className="h-3 w-3 mr-1" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                      <Link href={bot.routePath}>
                        <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                          <ArrowRight className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Autonomous Tab - Only Autonomous Bots */}
        <TabsContent value="autonomous" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-2">Autonomous Trading Bots</h3>
            <p className="text-blue-200">
              These bots make independent trading decisions without manual approval
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BOT_ENTITIES.filter(bot => bot.autonomous).map((bot) => {
              const Icon = bot.icon;
              const status = getBotStatus(bot.id);

              return (
                <Card key={bot.id} className="border-green-200">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${bot.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{bot.name}</CardTitle>
                        <CardDescription>{bot.decisionEngine}</CardDescription>
                      </div>
                      <Badge variant={status.isRunning ? "default" : "secondary"}>
                        {status.isRunning ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-2 bg-gray-50 rounded text-sm">
                        <strong>Current Decision:</strong><br />
                        {getAutonomousDecisionDisplay(bot, status)}
                      </div>
                      
                      {status.performance && (
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-green-600">
                              {status.performance.totalTrades || 0}
                            </div>
                            <div className="text-gray-500">Trades</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-blue-600">
                              {status.performance.winRate || 0}%
                            </div>
                            <div className="text-gray-500">Win Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-purple-600">
                              ${status.performance.profit || 0}
                            </div>
                            <div className="text-gray-500">Profit</div>
                          </div>
                        </div>
                      )}

                      <Link href={bot.routePath}>
                        <Button className="w-full" variant="outline">
                          Access Bot Interface
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Control Panel Tab */}
        <TabsContent value="control" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Central Bot Control Panel</CardTitle>
              <CardDescription>
                Manage all trading bots from one interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {BOT_ENTITIES.map((bot) => {
                  const status = getBotStatus(bot.id);
                  const Icon = bot.icon;

                  return (
                    <div 
                      key={bot.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded bg-gradient-to-r ${bot.color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium">{bot.name}</h4>
                          <p className="text-sm text-gray-500">{bot.tier} • ${bot.price}/mo</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {status.isRunning ? "Running" : "Stopped"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {bot.autonomous ? "Autonomous" : "Manual"}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant={status.isRunning ? "destructive" : "default"}
                            size="sm"
                            onClick={() => {
                              if (status.isRunning) {
                                stopBotMutation.mutate(bot.id);
                              } else {
                                startBotMutation.mutate(bot.id);
                              }
                            }}
                            disabled={startBotMutation.isPending || stopBotMutation.isPending}
                          >
                            {status.isRunning ? "Stop" : "Start"}
                          </Button>
                          <Link href={bot.routePath}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                Real-time performance metrics for all trading bots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Performance analytics dashboard coming soon...</p>
                <p className="text-sm mt-2">
                  Individual bot performance available on their respective pages
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}