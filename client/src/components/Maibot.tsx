import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Play, Square, TrendingUp, AlertCircle, Star, Lock, DollarSign, ArrowUpCircle, ArrowDownCircle, TestTube, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TradeActivityPanel } from "@/components/TradeActivityPanel";

/**
 * Maibot - Free Entry Level Trading Bot Component
 * Designed for beginners with simplified interface and manual approval system
 */
export default function Maibot() {
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Maibot status
  const { data: status, isLoading } = useQuery({
    queryKey: ["/api/waidbot-engine/maibot/status"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Fetch recent trades
  const { data: tradesData } = useQuery({
    queryKey: ["/api/waidbot-engine/maibot/trades"],
    refetchInterval: 30000,
  });

  // Fetch Maibot balance
  const { data: balanceData } = useQuery({
    queryKey: ["/api/waidbot-engine/maibot/balance"],
    refetchInterval: 15000,
  });

  // Ensure proper fallback for balanceData
  const balance = balanceData || {
    balance: 0,
    tradingMode: 'demo',
    currency: 'SmaiSika'
  };

  // Start/Stop Maibot mutations
  const startMutation = useMutation({
    mutationFn: () => apiRequest("/api/waidbot-engine/maibot/start", "POST"),
    onSuccess: (data) => {
      console.log("✅ Maibot start response:", data);
      toast({
        title: "Maibot Started",
        description: data?.message || "Your free trading assistant is now active and monitoring the market.",
      });
      // Force immediate refetch
      queryClient.invalidateQueries({ queryKey: ["/api/waidbot-engine/maibot/status"] });
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/waidbot-engine/maibot/status"] });
      }, 1000);
    },
    onError: (error) => {
      console.error("❌ Maibot start error:", error);
      toast({
        title: "Start Failed",
        description: error.message || "Failed to start Maibot",
        variant: "destructive",
      });
    },
    onSettled: () => setIsStarting(false),
  });

  const stopMutation = useMutation({
    mutationFn: () => apiRequest("/api/waidbot-engine/maibot/stop", "POST"),
    onSuccess: (data) => {
      console.log("✅ Maibot stop response:", data);
      toast({
        title: "Maibot Stopped",
        description: data?.message || "Your trading assistant has been deactivated.",
      });
      // Force immediate refetch
      queryClient.invalidateQueries({ queryKey: ["/api/waidbot-engine/maibot/status"] });
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/waidbot-engine/maibot/status"] });
      }, 1000);
    },
    onError: (error) => {
      console.error("❌ Maibot stop error:", error);
      toast({
        title: "Stop Failed",
        description: error.message || "Failed to stop Maibot",
        variant: "destructive",
      });
    },
    onSettled: () => setIsStopping(false),
  });

  // Trading mode toggle mutation
  const tradingModeMutation = useMutation({
    mutationFn: (mode: 'demo' | 'real') => 
      apiRequest(`/api/trading-mode/maibot`, "POST", { mode }),
    onSuccess: () => {
      toast({
        title: "Trading Mode Changed", 
        description: `Maibot switched to ${balance?.tradingMode === 'demo' ? 'real' : 'demo'} mode`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/waidbot-engine/maibot/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/waidbot-engine/maibot/balance"] });
    },
    onError: (error) => {
      toast({
        title: "Mode Switch Failed",
        description: error.message || "Failed to switch trading mode",
        variant: "destructive",
      });
    },
  });

  // Fund bot mutation
  const fundMutation = useMutation({
    mutationFn: (amount: number) => 
      apiRequest("/api/waidbot-engine/maibot/fund", "POST", { amount }),
    onSuccess: (data: any) => {
      toast({
        title: "Funding Successful",
        description: data?.message || "Maibot funded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/waidbot-engine/maibot/balance"] });
      setFundAmount('');
    },
    onError: (error) => {
      toast({
        title: "Funding Failed",
        description: error.message || "Failed to fund Maibot",
        variant: "destructive",
      });
    },
  });

  // Withdraw from bot mutation
  const withdrawMutation = useMutation({
    mutationFn: (amount: number) => 
      apiRequest("/api/waidbot-engine/maibot/withdraw", "POST", { amount }),
    onSuccess: (data: any) => {
      toast({
        title: "Withdrawal Successful",
        description: data?.message || "Withdrawal completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/waidbot-engine/maibot/balance"] });
      setWithdrawAmount('');
    },
    onError: (error) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to withdraw from Maibot",
        variant: "destructive",
      });
    },
  });

  const handleStart = () => {
    setIsStarting(true);
    startMutation.mutate();
  };

  const handleStop = () => {
    setIsStopping(true);
    stopMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const isActive = status?.isActive || false;
  const performance = status?.performance || {};
  const confidence = status?.confidence || 0;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-blue-900">
                  Maibot - Free Trading Assistant
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Perfect for beginners • Manual approval required • 35% platform fee
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant={isActive ? "default" : "secondary"}
              className={isActive ? "bg-green-500" : "bg-gray-400"}
            >
              {isActive ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Control Buttons */}
          <div className="flex gap-3 mb-6">
            {!isActive ? (
              <Button
                onClick={handleStart}
                disabled={isStarting}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="mr-2 h-4 w-4" />
                {isStarting ? "Starting..." : "Start Maibot"}
              </Button>
            ) : (
              <Button
                onClick={handleStop}
                disabled={isStopping}
                variant="destructive"
              >
                <Square className="mr-2 h-4 w-4" />
                {isStopping ? "Stopping..." : "Stop Maibot"}
              </Button>
            )}
          </div>

          {/* Free Tier Information */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Free Tier Features</AlertTitle>
            <AlertDescription className="text-blue-700">
              • Simplified market analysis • Manual trade approval required • Conservative risk management 
              • 35% platform fee on profits • Limited to basic strategies
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Trading Mode Switch */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TestTube className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Trading Mode</p>
                <p className="text-sm text-gray-600">
                  {balance?.tradingMode === 'demo' ? 'SmaiSika Simulation Pool (Safe Testing)' : 'Real Trading with Personal Funds'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Real</span>
              <Switch
                checked={balance?.tradingMode === 'demo'}
                onCheckedChange={(checked) => 
                  tradingModeMutation.mutate(checked ? 'demo' : 'real')
                }
                disabled={tradingModeMutation.isPending}
              />
              <span className="text-sm font-medium text-gray-700">Demo</span>
              <Badge variant={balance?.tradingMode === 'demo' ? 'default' : 'secondary'} className="ml-2">
                {balance?.tradingMode === 'demo' ? 'DEMO MODE' : 'REAL MODE'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wallet">Bot Wallet</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Live Binary Options Trading Activity */}
          <TradeActivityPanel
            botName="Maibot"
            trades={status?.recentTrades || []}
            performance={{
              totalTrades: performance?.totalTrades || 0,
              winRate: performance?.winRate || 0,
              profit: performance?.profit || 0,
              currentWinningStreak: performance?.currentWinningStreak || 0,
              longestWinningStreak: performance?.longestWinningStreak || 0
            }}
            activeConnector={status?.activeConnector}
            profitSharing={{ userShare: 65, platformShare: 35 }}
            marketType="binary"
          />
        </TabsContent>

        {/* Bot Wallet Tab */}
        <TabsContent value="wallet" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Balance */}
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-emerald-600" />
                  Bot Balance
                </CardTitle>
                <CardDescription>
                  {balance?.tradingMode === 'demo' ? 'SmaiSika simulation funds' : 'Real trading funds'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-700">
                    {balance?.balance?.toLocaleString() || '0'} SmaiSika
                  </div>
                  <div className="text-sm text-emerald-600">
                    {balance?.currency || 'Available Balance'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-700">Invested</div>
                    <div className="text-blue-600">{balance?.invested?.toLocaleString() || '0'}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-700">Profit</div>
                    <div className="text-green-600">+{balance?.totalProfit?.toLocaleString() || '0'}</div>
                  </div>
                </div>

                <Badge 
                  variant={balance?.tradingMode === 'demo' ? 'default' : 'secondary'}
                  className="w-full justify-center"
                >
                  {balance?.tradingMode === 'demo' ? '🧪 DEMO MODE' : '💰 REAL MODE'}
                </Badge>
              </CardContent>
            </Card>

            {/* Funding & Withdrawal */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-lg">Manage Funds</CardTitle>
                <CardDescription>
                  Add or withdraw funds from your bot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fund Bot */}
                <div className="space-y-3">
                  <Label htmlFor="fund-amount" className="text-sm font-medium">Fund Bot</Label>
                  <div className="flex gap-2">
                    <Input
                      id="fund-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => {
                        const amount = parseFloat(fundAmount);
                        if (amount > 0) {
                          fundMutation.mutate(amount);
                        }
                      }}
                      disabled={!fundAmount || fundMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ArrowUpCircle className="w-4 h-4 mr-2" />
                      Fund
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {balance?.tradingMode === 'demo' 
                      ? 'Unlimited demo funding available' 
                      : 'Funds transferred from main wallet'
                    }
                  </div>
                </div>

                {/* Withdraw from Bot */}
                <div className="space-y-3">
                  <Label htmlFor="withdraw-amount" className="text-sm font-medium">Withdraw</Label>
                  <div className="flex gap-2">
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => {
                        const amount = parseFloat(withdrawAmount);
                        if (amount > 0) {
                          withdrawMutation.mutate(amount);
                        }
                      }}
                      disabled={!withdrawAmount || withdrawMutation.isPending}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <ArrowDownCircle className="w-4 h-4 mr-2" />
                      Withdraw
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {balance?.tradingMode === 'demo' 
                      ? 'Demo withdrawal simulation only' 
                      : 'Funds returned to main wallet'
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Status */}
          {(fundMutation.isPending || withdrawMutation.isPending) && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                  <div>
                    <p className="font-medium text-yellow-800">Processing Transaction...</p>
                    <p className="text-sm text-yellow-700">
                      {fundMutation.isPending ? 'Adding funds to bot' : 'Withdrawing funds from bot'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Signals Tab */}
        <TabsContent value="signals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trading Signals</CardTitle>
              <CardDescription>
                AI-generated opportunities requiring your manual approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isActive ? (
                <div className="space-y-3">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertTitle>Signal Available</AlertTitle>
                    <AlertDescription>
                      Market showing potential buy opportunity. RSI indicates oversold conditions.
                      <div className="mt-2">
                        <Button size="sm" variant="outline">
                          Review Signal
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                  <div className="text-sm text-gray-500 italic">
                    All signals require manual review and approval before execution
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Start Maibot to begin receiving trading signals
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trades Tab */}
        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trade History</CardTitle>
              <CardDescription>
                Your approved and executed trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                No trades executed yet. Start Maibot and approve signals to begin trading.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upgrade Tab */}
        <TabsContent value="upgrade" className="space-y-4">
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-lg text-purple-900">Upgrade Your Trading Power</CardTitle>
              <CardDescription className="text-purple-700">
                Unlock advanced features with our premium bot tiers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {/* WaidBot Alpha */}
                <div className="p-4 border border-blue-200 rounded-lg bg-white">
                  <h4 className="font-semibold text-blue-900">WaidBot α - Basic Plan ($9.99/month)</h4>
                  <p className="text-sm text-blue-700 mb-2">ETH uptrend trading with 20% platform fee</p>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Upgrade to Alpha
                  </Button>
                </div>

                {/* WaidBot Pro Beta */}
                <div className="p-4 border border-green-200 rounded-lg bg-white">
                  <h4 className="font-semibold text-green-900">WaidBot Pro β - Pro Plan ($29.99/month)</h4>
                  <p className="text-sm text-green-700 mb-2">Bidirectional trading with advanced AI - 10% platform fee</p>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Upgrade to Pro
                  </Button>
                </div>

                {/* Autonomous Trader */}
                <div className="p-4 border border-purple-200 rounded-lg bg-white">
                  <h4 className="font-semibold text-purple-900">Autonomous Trader γ - Elite Plan ($59.99/month)</h4>
                  <p className="text-sm text-purple-700 mb-2">Fully autonomous 24/7 trading - Fixed fee structure</p>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Upgrade to Elite
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}