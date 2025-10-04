import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Activity, BarChart3, Play, Pause, Zap, Wallet, DollarSign, Signal, Crown } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TradeActivityPanel } from "@/components/TradeActivityPanel";


export function WaidBotPro() {
  const [activeTab, setActiveTab] = useState("overview");
  const [tradingMode, setTradingMode] = useState<'demo' | 'real'>('demo');
  const [fundAmount, setFundAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const { toast } = useToast();

  // Fetch WaidBot Pro status
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/waidbot-engine/waidbot-pro/status'],
    refetchInterval: 5000,
  });

  // Fetch WaidBot Pro balance
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['/api/waidbot-engine/waidbot-pro/balance'],
    refetchInterval: 3000,
  });

  // Toggle trading mode mutation
  const toggleModeMutation = useMutation({
    mutationFn: (mode: 'demo' | 'real') => 
      apiRequest('/api/waidbot-engine/waidbot-pro/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      }),
    onSuccess: (data) => {
      setTradingMode(data.mode);
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot-pro/balance'] });
      toast({
        title: "Trading Mode Updated",
        description: `WaidBot Pro β switched to ${data.mode} mode`,
      });
    }
  });

  // Fund bot mutation
  const fundMutation = useMutation({
    mutationFn: (amount: number) =>
      apiRequest('/api/waidbot-engine/waidbot-pro/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot-pro/balance'] });
      setFundAmount('');
      toast({
        title: "Funding Successful",
        description: data.message,
      });
    }
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: (amount: number) =>
      apiRequest('/api/waidbot-engine/waidbot-pro/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot-pro/balance'] });
      setWithdrawAmount('');
      toast({
        title: "Withdrawal Successful",
        description: data.message,
      });
    }
  });

  // Start mutation
  const startMutation = useMutation({
    mutationFn: () => apiRequest('/api/waidbot-engine/waidbot-pro/start', "POST"),
    onSuccess: (data) => {
      console.log("✅ WaidBot Pro start response:", data);
      toast({
        title: "WaidBot Pro Started",
        description: data?.message || "Professional trading bot is now active",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot-pro/status'] });
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/waidbot-engine/waidbot-pro/status'] });
      }, 1000);
    },
    onError: (error) => {
      console.error("❌ WaidBot Pro start error:", error);
      toast({
        title: "Start Failed",
        description: error.message || "Failed to start WaidBot Pro",
        variant: "destructive",
      });
    }
  });

  // Stop mutation
  const stopMutation = useMutation({
    mutationFn: () => apiRequest('/api/waidbot-engine/waidbot-pro/stop', "POST"),
    onSuccess: (data) => {
      console.log("✅ WaidBot Pro stop response:", data);
      toast({
        title: "WaidBot Pro Stopped",
        description: data?.message || "Professional trading bot has been deactivated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot-pro/status'] });
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/waidbot-engine/waidbot-pro/status'] });
      }, 1000);
    },
    onError: (error) => {
      console.error("❌ WaidBot Pro stop error:", error);
      toast({
        title: "Stop Failed",
        description: error.message || "Failed to stop WaidBot Pro",
        variant: "destructive",
      });
    }
  });

  const status = statusData || {
    id: 'waidbot-pro',
    name: 'WaidBot Pro β',
    isActive: false,
    confidence: 0,
    performance: { profit: 0, trades: 0, winRate: 0 }
  };

  const balance = balanceData?.balance || {
    available: 0,
    invested: 0,
    totalProfit: 0,
    dailyProfit: 0,
    currency: 'SmaiSika',
    mode: 'demo'
  };

  const handleModeToggle = () => {
    const newMode = tradingMode === 'demo' ? 'real' : 'demo';
    toggleModeMutation.mutate(newMode);
  };

  const handleFund = () => {
    const amount = parseFloat(fundAmount);
    if (amount && amount > 0) {
      fundMutation.mutate(amount);
    }
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount && amount > 0) {
      withdrawMutation.mutate(amount);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            WaidBot Pro β (Beta)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Advanced Binary Options Trader - Multi-Asset Specialist
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={status.isActive ? "default" : "secondary"} className="px-3 py-1 bg-blue-500/20 text-blue-400 border-blue-400/30">
            {status.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="outline" className={`px-3 py-1 ${
            balance.mode === 'demo' 
              ? 'bg-blue-500/20 text-blue-400 border-blue-400/30' 
              : 'bg-green-500/20 text-green-400 border-green-400/30'
          }`}>
            {balance.mode === 'demo' ? 'Demo Mode' : 'Live Trading'}
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Advanced Trading Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Start/Stop Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => startMutation.mutate()}
                  disabled={status.isActive || startMutation.isPending}
                  className={`${
                    status.isActive 
                      ? 'bg-gray-500 dark:bg-gray-600' 
                      : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
                  } text-white`}
                >
                  {startMutation.isPending ? (
                    <Activity className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {startMutation.isPending ? 'Starting...' : 'Start'}
                </Button>
                
                <Button
                  onClick={() => stopMutation.mutate()}
                  disabled={!status.isActive || stopMutation.isPending}
                  className={`${
                    !status.isActive 
                      ? 'bg-gray-500 dark:bg-gray-600' 
                      : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                  } text-white`}
                >
                  {stopMutation.isPending ? (
                    <Activity className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Pause className="h-4 w-4 mr-2" />
                  )}
                  {stopMutation.isPending ? 'Stopping...' : 'Stop'}
                </Button>
              </div>
              
              {/* Demo/Real Mode Toggle */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Demo Mode</Label>
                <Switch 
                  checked={tradingMode === 'real'}
                  onCheckedChange={handleModeToggle}
                  disabled={toggleModeMutation.isPending}
                />
                <Label className="text-sm font-medium">Real Trading</Label>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={status.isActive ? "default" : "secondary"} className="px-3 py-1">
                {status.isActive ? "🟢 Active" : "🔴 Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 backdrop-blur">
          <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Wallet className="w-4 h-4" />
            Bot Wallet
          </TabsTrigger>
          <TabsTrigger value="signals" className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Signal className="w-4 h-4" />
            Signals
          </TabsTrigger>
          <TabsTrigger value="trades" className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <DollarSign className="w-4 h-4" />
            Trades
          </TabsTrigger>
          <TabsTrigger value="upgrade" className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
            <Crown className="w-4 h-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Live Binary Options Trading Activity */}
          <TradeActivityPanel
            botName="WaidBot Pro β"
            trades={status.recentTrades || []}
            performance={{
              totalTrades: status.performance?.totalTrades || status.performance?.trades || 0,
              winRate: status.performance?.winRate || 0,
              profit: status.performance?.profit || status.performance?.dailyProfit || 0,
              currentWinningStreak: status.performance?.currentWinningStreak || 0,
              longestWinningStreak: status.performance?.longestWinningStreak || 0
            }}
            activeConnector={status.activeConnector || 'Binary Options Platform'}
            profitSharing={{ userShare: 90, platformShare: 10 }}
            marketType="binary"
          />
        </TabsContent>

        <TabsContent value="wallet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bot Wallet Management</CardTitle>
              <CardDescription>
                Fund or withdraw from your WaidBot Pro trading wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Fund Bot Wallet</h4>
                  <div className="space-y-2">
                    <Label htmlFor="fund-amount">Amount ({balance.currency})</Label>
                    <Input
                      id="fund-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleFund}
                    disabled={fundMutation.isPending || !fundAmount}
                    className="w-full"
                  >
                    {fundMutation.isPending ? 'Processing...' : 'Fund Bot'}
                  </Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Withdraw from Bot</h4>
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">Amount ({balance.currency})</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleWithdraw}
                    disabled={withdrawMutation.isPending || !withdrawAmount}
                    className="w-full"
                    variant="outline"
                  >
                    {withdrawMutation.isPending ? 'Processing...' : 'Withdraw'}
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Current Balance</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                    <p className="text-xl font-bold">{balance.available.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Invested</p>
                    <p className="text-xl font-bold">{balance.invested.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Profit</p>
                    <p className="text-xl font-bold text-green-600">{balance.totalProfit.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Daily Profit</p>
                    <p className="text-xl font-bold text-green-600">{balance.dailyProfit.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Binary Options Signals</CardTitle>
              <CardDescription>
                Real-time trading signals for binary options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Signal className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Binary options signals coming soon</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  WaidBot Pro will provide real-time signals for optimal entry points
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trade History</CardTitle>
              <CardDescription>
                Complete history of all binary options trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No trade history yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Start trading to see your complete trade history here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upgrade" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Features</CardTitle>
              <CardDescription>
                Unlock premium binary options trading features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Premium Features</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Advanced automation, custom strategies, and more coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Detailed performance analysis and risk management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Risk Management</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Risk Level</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(status.currentRisk * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${status.currentRisk * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Strategy Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Trend Following</span>
                      <span className="text-gray-900 dark:text-white">35%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Mean Reversion</span>
                      <span className="text-gray-900 dark:text-white">25%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Breakout</span>
                      <span className="text-gray-900 dark:text-white">20%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sideways Range</span>
                      <span className="text-gray-900 dark:text-white">20%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}