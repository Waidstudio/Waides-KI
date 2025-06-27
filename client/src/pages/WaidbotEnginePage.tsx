import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Globe, 
  Zap, 
  Shield, 
  Brain,
  Eye,
  Target,
  Settings,
  Play,
  Pause,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Activity,
  Timer
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface BotStatus {
  id: string;
  name: string;
  isActive: boolean;
  performance: {
    totalTrades: number;
    winRate: number;
    profit: number;
    todayTrades: number;
  };
  currentAction: string;
  nextAction: string;
  confidence: number;
}

export default function WaidbotEnginePage() {
  const queryClient = useQueryClient();

  // Fetch status for all three bots
  const { data: waidBotStatus, isLoading: waidBotLoading } = useQuery<BotStatus>({
    queryKey: ['/api/waidbot-engine/waidbot/status'],
    refetchInterval: 3000,
  });

  const { data: waidBotProStatus, isLoading: waidBotProLoading } = useQuery<BotStatus>({
    queryKey: ['/api/waidbot-engine/waidbot-pro/status'],
    refetchInterval: 3000,
  });

  const { data: autonomousStatus, isLoading: autonomousLoading } = useQuery<BotStatus>({
    queryKey: ['/api/waidbot-engine/autonomous/status'],
    refetchInterval: 3000,
  });

  // Toggle mutations for each bot
  const toggleWaidBot = useMutation({
    mutationFn: async (action: 'start' | 'stop') => {
      const response = await fetch(`/api/waidbot-engine/waidbot/${action}`, { 
        method: 'POST' 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot/status'] });
    }
  });

  const toggleWaidBotPro = useMutation({
    mutationFn: async (action: 'start' | 'stop') => {
      const response = await fetch(`/api/waidbot-engine/waidbot-pro/${action}`, { 
        method: 'POST' 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot-pro/status'] });
    }
  });

  const toggleAutonomous = useMutation({
    mutationFn: async (action: 'start' | 'stop') => {
      const response = await fetch(`/api/waidbot-engine/autonomous/${action}`, { 
        method: 'POST' 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/autonomous/status'] });
    }
  });

  const isLoading = waidBotLoading || waidBotProLoading || autonomousLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-slate-700 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                    <div className="h-8 bg-slate-700 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Bot className="w-12 h-12 text-emerald-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Waidbot Engine
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Choose your trading companion: Three distinct AI-powered trading bots designed for different market strategies and timeframes
          </p>
        </div>

        {/* Waidbot - ETH Uptrend Only */}
        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-400">WaidBot</h2>
                  <p className="text-green-300/70 text-sm">Conservative ETH Uptrend Trader</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {waidBotStatus?.isActive ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">ACTIVE</Badge>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">INACTIVE</Badge>
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Description */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h3 className="font-semibold text-green-400 mb-3">Strategy Overview</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <ArrowUp className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">ETH uptrend trading only</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">Buy low, sell high strategy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">1-hour trade duration</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">Best during USA market opening</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">Conservative risk management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">9:30 AM - 10:30 AM EST optimal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{waidBotStatus?.performance.totalTrades || 0}</div>
                <div className="text-xs text-slate-400">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{waidBotStatus?.performance.winRate || 0}%</div>
                <div className="text-xs text-slate-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">+{waidBotStatus?.performance.profit || 0}%</div>
                <div className="text-xs text-slate-400">Total Profit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{waidBotStatus?.performance.todayTrades || 0}</div>
                <div className="text-xs text-slate-400">Today's Trades</div>
              </div>
            </div>

            {/* Current Status */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Current Action:</span>
                <span className="text-green-400 font-medium">{waidBotStatus?.currentAction || 'Waiting for uptrend'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Next Action:</span>
                <span className="text-slate-300">{waidBotStatus?.nextAction || 'Monitor for entry signals'}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Confidence Level:</span>
                  <span className="text-green-400 font-medium">{waidBotStatus?.confidence || 0}%</span>
                </div>
                <Progress value={waidBotStatus?.confidence || 0} className="h-2" />
              </div>
            </div>

            {/* Controls */}
            <div className="flex space-x-3">
              {waidBotStatus?.isActive ? (
                <Button
                  onClick={() => toggleWaidBot.mutate('stop')}
                  disabled={toggleWaidBot.isPending}
                  variant="destructive"
                  className="flex-1"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Stop WaidBot
                </Button>
              ) : (
                <Button
                  onClick={() => toggleWaidBot.mutate('start')}
                  disabled={toggleWaidBot.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-500"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start WaidBot
                </Button>
              )}
              <Button 
                variant="outline" 
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                onClick={() => window.location.href = '/waidbot'}
              >
                <Eye className="w-4 h-4 mr-2" />
                Open WaidBot
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* WaidBot Pro - Bidirectional with ETH3L/ETH3S */}
        <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/10 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-400">WaidBot Pro</h2>
                  <p className="text-blue-300/70 text-sm">Advanced Bidirectional ETH3L/ETH3S Trader</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {waidBotProStatus?.isActive ? (
                  <>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">ACTIVE</Badge>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">INACTIVE</Badge>
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Description */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h3 className="font-semibold text-blue-400 mb-3">Strategy Overview</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">Buy ETH3L when ETH rises</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-slate-300">Buy ETH3S when ETH falls</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300">Profits in sideways markets</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300">4-hour trade duration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300">USA & Asia market sessions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300">Advanced technical analysis</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{waidBotProStatus?.performance.totalTrades || 0}</div>
                <div className="text-xs text-slate-400">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{waidBotProStatus?.performance.winRate || 0}%</div>
                <div className="text-xs text-slate-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">+{waidBotProStatus?.performance.profit || 0}%</div>
                <div className="text-xs text-slate-400">Total Profit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{waidBotProStatus?.performance.todayTrades || 0}</div>
                <div className="text-xs text-slate-400">Today's Trades</div>
              </div>
            </div>

            {/* Current Status */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Current Action:</span>
                <span className="text-blue-400 font-medium">{waidBotProStatus?.currentAction || 'Analyzing market direction'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Next Action:</span>
                <span className="text-slate-300">{waidBotProStatus?.nextAction || 'Position for directional move'}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Confidence Level:</span>
                  <span className="text-blue-400 font-medium">{waidBotProStatus?.confidence || 0}%</span>
                </div>
                <Progress value={waidBotProStatus?.confidence || 0} className="h-2" />
              </div>
            </div>

            {/* Controls */}
            <div className="flex space-x-3">
              {waidBotProStatus?.isActive ? (
                <Button
                  onClick={() => toggleWaidBotPro.mutate('stop')}
                  disabled={toggleWaidBotPro.isPending}
                  variant="destructive"
                  className="flex-1"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Stop WaidBot Pro
                </Button>
              ) : (
                <Button
                  onClick={() => toggleWaidBotPro.mutate('start')}
                  disabled={toggleWaidBotPro.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-500"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start WaidBot Pro
                </Button>
              )}
              <Button 
                variant="outline" 
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                onClick={() => window.location.href = '/waidbot-pro'}
              >
                <Brain className="w-4 h-4 mr-2" />
                Open WaidBot Pro
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Autonomous Trader - 24/7 Trading */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-purple-400">Autonomous Trader</h2>
                  <p className="text-purple-300/70 text-sm">24/7 Self-Operating Market Scanner</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {autonomousStatus?.isActive ? (
                  <>
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">SCANNING</Badge>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">OFFLINE</Badge>
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Description */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h3 className="font-semibold text-purple-400 mb-3">Strategy Overview</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300">Watches charts 24/7</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300">Instant opportunity capture</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300">Both directions profitable</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300">AI-powered pattern recognition</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300">Advanced risk management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300">Global market coverage</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{autonomousStatus?.performance.totalTrades || 0}</div>
                <div className="text-xs text-slate-400">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{autonomousStatus?.performance.winRate || 0}%</div>
                <div className="text-xs text-slate-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">+{autonomousStatus?.performance.profit || 0}%</div>
                <div className="text-xs text-slate-400">Total Profit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{autonomousStatus?.performance.todayTrades || 0}</div>
                <div className="text-xs text-slate-400">Today's Trades</div>
              </div>
            </div>

            {/* Current Status */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Current Action:</span>
                <span className="text-purple-400 font-medium">{autonomousStatus?.currentAction || 'Scanning for opportunities'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Next Action:</span>
                <span className="text-slate-300">{autonomousStatus?.nextAction || 'Continuous monitoring'}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">AI Confidence:</span>
                  <span className="text-purple-400 font-medium">{autonomousStatus?.confidence || 0}%</span>
                </div>
                <Progress value={autonomousStatus?.confidence || 0} className="h-2" />
              </div>
            </div>

            {/* Controls */}
            <div className="flex space-x-3">
              {autonomousStatus?.isActive ? (
                <Button
                  onClick={() => toggleAutonomous.mutate('stop')}
                  disabled={toggleAutonomous.isPending}
                  variant="destructive"
                  className="flex-1"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Autonomous
                </Button>
              ) : (
                <Button
                  onClick={() => toggleAutonomous.mutate('start')}
                  disabled={toggleAutonomous.isPending}
                  className="flex-1 bg-purple-600 hover:bg-purple-500"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Autonomous
                </Button>
              )}
              <Button 
                variant="outline" 
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                onClick={() => window.location.href = '/autonomous-wealth'}
              >
                <Globe className="w-4 h-4 mr-2" />
                Open Autonomous
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Comparison Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl text-slate-100">Quick Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 text-slate-400">Feature</th>
                    <th className="text-center py-3 text-green-400">WaidBot</th>
                    <th className="text-center py-3 text-blue-400">WaidBot Pro</th>
                    <th className="text-center py-3 text-purple-400">Autonomous</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 text-slate-300">Trading Direction</td>
                    <td className="text-center py-3 text-green-400">Uptrend Only</td>
                    <td className="text-center py-3 text-blue-400">Bidirectional</td>
                    <td className="text-center py-3 text-purple-400">Both Ways</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 text-slate-300">Assets</td>
                    <td className="text-center py-3 text-green-400">ETH</td>
                    <td className="text-center py-3 text-blue-400">ETH3L/ETH3S</td>
                    <td className="text-center py-3 text-purple-400">All Available</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 text-slate-300">Trade Duration</td>
                    <td className="text-center py-3 text-green-400">1 Hour</td>
                    <td className="text-center py-3 text-blue-400">4 Hours</td>
                    <td className="text-center py-3 text-purple-400">Variable</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 text-slate-300">Best Time</td>
                    <td className="text-center py-3 text-green-400">USA Opening</td>
                    <td className="text-center py-3 text-blue-400">USA + Asia</td>
                    <td className="text-center py-3 text-purple-400">24/7</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-slate-300">Risk Level</td>
                    <td className="text-center py-3 text-green-400">Conservative</td>
                    <td className="text-center py-3 text-blue-400">Moderate</td>
                    <td className="text-center py-3 text-purple-400">Dynamic</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}