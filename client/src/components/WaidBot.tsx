import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, Activity, BarChart3, AlertCircle, Play, Pause, Wallet, DollarSign, Signal, BarChart, Crown, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface WaidBotDecision {
  action: 'BUY_ETH' | 'SELL_ETH' | 'HOLD' | 'OBSERVE';
  reasoning: string;
  confidence: number;
  ethPosition: 'LONG' | 'NEUTRAL';
  tradingPair: 'ETH/USDT' | 'NONE';
  quantity: number;
  trendDirection: 'UPWARD' | 'DOWNWARD' | 'SIDEWAYS';
  autoTradingEnabled: boolean;
  timestamp: number;
}

interface WaidBotStatus {
  isActive: boolean;
  autoTradingEnabled: boolean;
  currentPosition: 'LONG' | 'NEUTRAL';
  totalTrades: number;
  winRate: number;
  currentBalance: number;
  lastDecision: WaidBotDecision | null;
}

export function WaidBot() {
  const [isGeneratingDecision, setIsGeneratingDecision] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [tradingMode, setTradingMode] = useState<'demo' | 'real'>('demo');
  const [fundAmount, setFundAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const { toast } = useToast();

  // Fetch WaidBot status
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/waidbot-engine/waidbot/status'],
    refetchInterval: 5000,
  });

  // Fetch WaidBot balance
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['/api/waidbot-engine/waidbot/balance'],
    refetchInterval: 3000,
  });

  // Fetch decision history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/waidbot/history'],
    refetchInterval: 10000,
  });

  // Toggle trading mode mutation
  const toggleModeMutation = useMutation({
    mutationFn: (mode: 'demo' | 'real') => 
      apiRequest('/api/waidbot-engine/waidbot/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      }),
    onSuccess: (data) => {
      setTradingMode(data.mode);
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot/balance'] });
      toast({
        title: "Trading Mode Updated",
        description: `WaidBot α switched to ${data.mode} mode`,
      });
    }
  });

  // Fund bot mutation
  const fundMutation = useMutation({
    mutationFn: (amount: number) =>
      apiRequest('/api/waidbot-engine/waidbot/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot/balance'] });
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
      apiRequest('/api/waidbot-engine/waidbot/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot/balance'] });
      setWithdrawAmount('');
      toast({
        title: "Withdrawal Successful",
        description: data.message,
      });
    }
  });

  // Start/Stop bot mutations
  const startMutation = useMutation({
    mutationFn: () => apiRequest('/api/waidbot-engine/waidbot/start', { method: 'POST' }),
    onSuccess: (data) => {
      console.log("✅ WaidBot start response:", data);
      toast({
        title: "WaidBot α Started",
        description: data?.message || "Alpha bot is now actively trading ETH uptrends",
      });
      // Force immediate refetch
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot/status'] });
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/waidbot-engine/waidbot/status'] });
      }, 1000);
    },
    onError: (error) => {
      console.error("❌ WaidBot start error:", error);
      toast({
        title: "Start Failed", 
        description: error.message || "Failed to start WaidBot",
        variant: "destructive",
      });
    }
  });

  const stopMutation = useMutation({
    mutationFn: () => apiRequest('/api/waidbot-engine/waidbot/stop', { method: 'POST' }),
    onSuccess: (data) => {
      console.log("✅ WaidBot stop response:", data);
      toast({
        title: "WaidBot α Stopped",
        description: data?.message || "Alpha bot trading has been paused",
      });
      // Force immediate refetch
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot-engine/waidbot/status'] });
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/waidbot-engine/waidbot/status'] });
      }, 1000);
    },
    onError: (error) => {
      console.error("❌ WaidBot stop error:", error);
      toast({
        title: "Stop Failed",
        description: error.message || "Failed to stop WaidBot", 
        variant: "destructive",
      });
    }
  });

  // Generate decision mutation
  const decisionMutation = useMutation({
    mutationFn: () => 
      apiRequest('/api/waidbot/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waidbot/history'] });
      setIsGeneratingDecision(false);
    }
  });

  const status = statusData || {
    id: 'waidbot',
    name: 'WaidBot Alpha',
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

  const history: WaidBotDecision[] = historyData?.history || [];

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

  const handleGenerateDecision = () => {
    setIsGeneratingDecision(true);
    decisionMutation.mutate();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY_ETH': return 'text-green-600 dark:text-green-400';
      case 'SELL_ETH': return 'text-red-600 dark:text-red-400';
      case 'HOLD': return 'text-yellow-600 dark:text-yellow-400';
      case 'OBSERVE': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'UPWARD': return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'DOWNWARD': return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'SIDEWAYS': return <Activity className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            WaidBot α (Alpha)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Professional ETH Uptrend Specialist - Waides Konsmik Intelligence
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={status.isActive ? "default" : "secondary"} className="px-3 py-1 bg-green-500/20 text-green-400 border-green-400/30">
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

      {/* Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 backdrop-blur">
          <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <BarChart className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Wallet className="w-4 h-4" />
            Bot Wallet
          </TabsTrigger>
          <TabsTrigger value="signals" className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Signal className="w-4 h-4" />
            Signals
          </TabsTrigger>
          <TabsTrigger value="trades" className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <DollarSign className="w-4 h-4" />
            Trades
          </TabsTrigger>
          <TabsTrigger value="upgrade" className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            <Crown className="w-4 h-4" />
            Upgrade
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-400/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Bot Status</p>
                    <p className="text-2xl font-bold text-white">
                      {status.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-400/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Confidence</p>
                    <p className="text-2xl font-bold text-white">
                      {status.confidence || 0}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-400/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Total Profit</p>
                    <p className="text-2xl font-bold text-white">
                      {status.performance?.profit || 0} {balance.currency}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border-yellow-400/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Total Trades</p>
                    <p className="text-2xl font-bold text-white">
                      {status.performance?.trades || 0}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Controls */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-green-400/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Play className="h-5 w-5" />
                WaidBot α Trading Controls
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage uptrend specialist trading operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => status.isActive ? stopMutation.mutate() : startMutation.mutate()}
                  disabled={startMutation.isPending || stopMutation.isPending}
                  variant={status.isActive ? "destructive" : "default"}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {status.isActive ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Stop WaidBot α
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start WaidBot α
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleGenerateDecision}
                  disabled={isGeneratingDecision || decisionMutation.isPending}
                  variant="outline"
                  className="flex items-center gap-2 border-green-400/40 text-green-400 hover:bg-green-400/10"
                >
                  <BarChart3 className="h-4 w-4" />
                  {isGeneratingDecision ? "Analyzing..." : "Generate Signal"}
                </Button>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        {/* Bot Wallet Tab */}
        <TabsContent value="wallet" className="space-y-6 mt-6">
          {/* Trading Mode Switch */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-green-400/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Wallet className="h-5 w-5" />
                WaidBot α Wallet Management
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage your WaidBot Alpha trading funds - Demo vs Live trading
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Label htmlFor="trading-mode" className="text-sm font-medium text-slate-300">
                    Trading Mode:
                  </Label>
                  <Badge variant="outline" className={`${
                    balance.mode === 'demo' 
                      ? 'bg-blue-500/20 text-blue-400 border-blue-400/30' 
                      : 'bg-green-500/20 text-green-400 border-green-400/30'
                  }`}>
                    {balance.mode === 'demo' ? 'Demo Mode' : 'Live Trading'}
                  </Badge>
                </div>
                <Switch
                  id="trading-mode"
                  checked={tradingMode === 'real'}
                  onCheckedChange={handleModeToggle}
                  className="data-[state=checked]:bg-green-400"
                />
              </div>

              {/* Balance Display */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-400/30">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {balance.available?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-slate-400">Available Balance</p>
                      <p className="text-xs text-green-400">{balance.currency}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-400/30">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {balance.invested?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-slate-400">Currently Invested</p>
                      <p className="text-xs text-blue-400">{balance.currency}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-400/30">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {balance.totalProfit?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-slate-400">Total Profit</p>
                      <p className="text-xs text-purple-400">{balance.currency}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border-yellow-400/30">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {balance.dailyProfit?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-slate-400">Daily Profit</p>
                      <p className="text-xs text-yellow-400">{balance.currency}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Fund & Withdraw Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-400/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-400 text-sm">
                      <ArrowUpCircle className="h-4 w-4" />
                      Fund WaidBot α
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fund-amount" className="text-slate-300">Amount ({balance.currency})</Label>
                      <Input
                        id="fund-amount"
                        type="number"
                        placeholder="Enter amount to fund"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        className="bg-slate-800/50 border-green-400/30 focus:border-green-400"
                      />
                    </div>
                    <Button 
                      onClick={handleFund}
                      disabled={!fundAmount || fundMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {fundMutation.isPending ? "Processing..." : "Fund Bot"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500/10 to-pink-600/10 border-red-400/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-400 text-sm">
                      <ArrowDownCircle className="h-4 w-4" />
                      Withdraw from WaidBot α
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-amount" className="text-slate-300">Amount ({balance.currency})</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        placeholder="Enter amount to withdraw"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="bg-slate-800/50 border-red-400/30 focus:border-red-400"
                      />
                    </div>
                    <Button 
                      onClick={handleWithdraw}
                      disabled={!withdrawAmount || withdrawMutation.isPending}
                      variant="destructive"
                      className="w-full"
                    >
                      {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signals Tab */}
        <TabsContent value="signals" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-green-400/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Signal className="h-5 w-5" />
                WaidBot α Trading Signals
              </CardTitle>
              <CardDescription className="text-slate-400">
                Real-time uptrend detection signals and market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Signal className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-slate-400">Real-time signals will appear here</p>
                <p className="text-sm text-slate-500 mt-2">WaidBot α continuously analyzes ETH uptrend patterns</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trades Tab */}
        <TabsContent value="trades" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-green-400/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <DollarSign className="h-5 w-5" />
                WaidBot α Trade History
              </CardTitle>
              <CardDescription className="text-slate-400">
                Complete trading history and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-slate-400">Trade history will appear here</p>
                <p className="text-sm text-slate-500 mt-2">All WaidBot α transactions and performance data</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upgrade Tab */}
        <TabsContent value="upgrade" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-green-400/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Crown className="h-5 w-5" />
                WaidBot α Advanced Features
              </CardTitle>
              <CardDescription className="text-slate-400">
                Unlock premium trading capabilities and advanced AI models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Crown className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-slate-400">Advanced features coming soon</p>
                <p className="text-sm text-slate-500 mt-2">Enhanced AI models, custom strategies, and more</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
                        {balance.invested?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-slate-400">Invested</p>
                      <p className="text-xs text-blue-400">{balance.currency}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-400/30">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {balance.totalProfit?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-slate-400">Total Profit</p>
                      <p className="text-xs text-purple-400">{balance.currency}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border-yellow-400/30">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {balance.dailyProfit?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-slate-400">Daily Profit</p>
                      <p className="text-xs text-yellow-400">{balance.currency}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Fund/Withdraw Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fund Bot */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-slate-300">Fund WaidBot α</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white"
                    />
                    <Button
                      onClick={handleFund}
                      disabled={fundMutation.isPending || !fundAmount}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ArrowUpCircle className="w-4 h-4 mr-2" />
                      Fund
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400">
                    {balance.mode === 'demo' 
                      ? 'Add demo funds for simulation trading' 
                      : 'Transfer funds from personal wallet'}
                  </p>
                </div>

                {/* Withdraw */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-slate-300">Withdraw from WaidBot α</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white"
                    />
                    <Button
                      onClick={handleWithdraw}
                      disabled={withdrawMutation.isPending || !withdrawAmount}
                      variant="outline"
                      className="border-red-400/40 text-red-400 hover:bg-red-400/10"
                    >
                      <ArrowDownCircle className="w-4 h-4 mr-2" />
                      Withdraw
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400">
                    {balance.mode === 'demo' 
                      ? 'Simulate withdrawal (demo mode)' 
                      : 'Transfer to personal wallet'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signals Tab */}
        <TabsContent value="signals" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-green-400/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Signal className="h-5 w-5" />
                WaidBot α Signals
              </CardTitle>
              <CardDescription className="text-slate-400">
                Real-time uptrend analysis and trading signals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Signal className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-slate-400">Signal system coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trades Tab */}
        <TabsContent value="trades" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-green-400/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <DollarSign className="h-5 w-5" />
                WaidBot α Trade History
              </CardTitle>
              <CardDescription className="text-slate-400">
                View all uptrend trading activity and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-slate-400">No trades executed yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upgrade Tab */}
        <TabsContent value="upgrade" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-green-400/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Crown className="h-5 w-5" />
                Upgrade to WaidBot Pro
              </CardTitle>
              <CardDescription className="text-slate-400">
                Unlock advanced features and multi-directional trading
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">WaidBot Pro β</h3>
                <p className="text-slate-400 mb-4">Advanced bi-directional trading with enhanced Konsmik Intelligence</p>
                <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold hover:from-yellow-500 hover:to-yellow-700">
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Latest Decision */}
      {status.lastDecision && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Decision</CardTitle>
            <CardDescription>
              Most recent trading decision from WaidBot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge className={getActionColor(status.lastDecision.action)}>
                {status.lastDecision.action}
              </Badge>
              <div className="flex items-center gap-2">
                {getTrendIcon(status.lastDecision.trendDirection)}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {status.lastDecision.trendDirection} Trend
                </span>
              </div>
              <Badge variant="outline">
                {status.lastDecision.confidence}% Confidence
              </Badge>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Reasoning:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {status.lastDecision.reasoning}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Trading Pair:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {status.lastDecision.tradingPair}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Position Size:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {(status.lastDecision.quantity * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">ETH Position:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {status.lastDecision.ethPosition}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Timestamp:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(status.lastDecision.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decision History */}
      <Card>
        <CardHeader>
          <CardTitle>Decision History</CardTitle>
          <CardDescription>
            Recent trading decisions and their outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No trading decisions yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Enable auto-trading or generate a manual decision to see history
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.slice(0, 10).map((decision, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className={getActionColor(decision.action)}>
                        {decision.action}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(decision.trendDirection)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {decision.trendDirection}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(decision.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {decision.reasoning}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Confidence: {decision.confidence}%</span>
                    <span>Size: {(decision.quantity * 100).toFixed(1)}%</span>
                    <span>Pair: {decision.tradingPair}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}