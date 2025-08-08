import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, Heart, Zap, TrendingUp, TrendingDown, Activity, Eye, Shield, Settings, 
  Wallet, ArrowUpRight, ArrowDownRight, PieChart, CreditCard, Smartphone, 
  RefreshCw, Send, Award, CheckCircle, Lock, Gift, Star, DollarSign, Users
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSmaiWallet } from '@/contexts/SmaiWalletContext';

export function WaidesKICoreEnginePanel() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const walletContext = useSmaiWallet();
  const { smaiBalance, localBalance, transactions, isLoading, fetchWalletData } = walletContext || {
    smaiBalance: 10000,
    localBalance: 5000,
    transactions: [],
    isLoading: false,
    fetchWalletData: () => Promise.resolve()
  };

  // Wallet data queries
  const { data: walletData } = useQuery({
    queryKey: ['/api/wallet/balance'],
    refetchInterval: 30000
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['/api/wallet/transactions'],
    refetchInterval: 60000
  });

  const { data: aiAnalysis } = useQuery({
    queryKey: ['/api/wallet/ai/portfolio-analysis'],
    refetchInterval: 300000 // 5 minutes
  });

  const refreshWalletData = async () => {
    setRefreshing(true);
    try {
      if (fetchWalletData) {
        await fetchWalletData();
      }
    } catch (error) {
      console.error('Error refreshing wallet:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (fetchWalletData) {
      fetchWalletData();
    }
  }, [fetchWalletData]);

  // Calculate portfolio metrics
  const totalBalance = (smaiBalance || 0) + (localBalance || 0);
  const weeklyGain = 1247.50;
  const weeklyGainPercent = ((weeklyGain / totalBalance) * 100);
  const portfolioGrowth = 8.3;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-slate-50/5 via-blue-50/5 to-purple-50/5">
      {/* Beautiful Header with Calming Gradient */}
      <div className="flex-shrink-0 p-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-b border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Heart className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Heart of Waides KI</h1>
              <p className="text-blue-200 text-sm">Your Sacred Financial Sanctuary</p>
            </div>
          </div>
          <Button
            onClick={refreshWalletData}
            disabled={refreshing}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-4 py-2 transition-all duration-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Balance */}
          <Card className="bg-gradient-to-br from-emerald-50/10 to-green-50/10 border border-emerald-500/20 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  Active
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-emerald-200">Total Balance</p>
                <p className="text-2xl font-bold text-white">
                  ꠄ{totalBalance.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-300">+{weeklyGainPercent.toFixed(1)}% this week</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SmaiSika Balance */}
          <Card className="bg-gradient-to-br from-blue-50/10 to-indigo-50/10 border border-blue-500/20 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-blue-400" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  SmaiSika
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-blue-200">SmaiSika Balance</p>
                <p className="text-2xl font-bold text-white">
                  ꠄ{(smaiBalance || 0).toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300">Primary Currency</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Local Balance */}
          <Card className="bg-gradient-to-br from-purple-50/10 to-pink-50/10 border border-purple-500/20 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                </div>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  Local
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-purple-200">Local Currency</p>
                <p className="text-2xl font-bold text-white">
                  ${(localBalance || 0).toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">USD Balance</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Gain */}
          <Card className="bg-gradient-to-br from-amber-50/10 to-orange-50/10 border border-amber-500/20 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                  +{weeklyGainPercent.toFixed(1)}%
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-amber-200">Weekly Gain</p>
                <p className="text-2xl font-bold text-white">
                  +ꠄ{weeklyGain.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-amber-300">Excellent Performance</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Growth Chart */}
          <Card className="bg-gradient-to-br from-cyan-50/10 to-teal-50/10 border border-cyan-500/20 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <PieChart className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">Portfolio Growth</CardTitle>
                    <CardDescription className="text-cyan-200">30-day performance</CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  +{portfolioGrowth}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-200">Growth Rate</span>
                  <span className="text-white font-semibold">+{portfolioGrowth}%</span>
                </div>
                <Progress value={portfolioGrowth * 10} className="h-2 bg-slate-700" />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">+24</div>
                    <div className="text-xs text-cyan-200">Profitable Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">-6</div>
                    <div className="text-xs text-cyan-200">Loss Days</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Portfolio Analysis */}
          <Card className="bg-gradient-to-br from-rose-50/10 to-pink-50/10 border border-rose-500/20 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">AI Analysis</CardTitle>
                    <CardDescription className="text-rose-200">Portfolio insights</CardDescription>
                  </div>
                </div>
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">
                  Smart
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-sm text-rose-200">Portfolio Health: Excellent</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-sm text-rose-200">Risk Level: Moderate</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="text-sm text-rose-200">Diversification: Good</span>
                </div>
                <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                  <p className="text-sm text-rose-100 italic">
                    "Your portfolio shows strong momentum with balanced risk management. 
                    Continue current strategy for optimal growth."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-gradient-to-br from-indigo-50/10 to-purple-50/10 border border-indigo-500/20 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-indigo-200">Latest transactions</CardDescription>
                </div>
              </div>
              <Button className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-lg px-4 py-2">
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Transaction items */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Divine Trading Profit</div>
                    <div className="text-xs text-indigo-200">2 hours ago</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-400">+ꠄ247.50</div>
                  <div className="text-xs text-indigo-200">ETH Trade</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Gift className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">SmaiSika Reward</div>
                    <div className="text-xs text-indigo-200">1 day ago</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-blue-400">+ꠄ100.00</div>
                  <div className="text-xs text-indigo-200">Daily Bonus</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">KonsAI Consultation</div>
                    <div className="text-xs text-indigo-200">2 days ago</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-purple-400">+ꠄ50.00</div>
                  <div className="text-xs text-indigo-200">Premium Service</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="h-20 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 border border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300">
            <Send className="w-6 h-6 text-emerald-400" />
            <span className="text-sm text-emerald-300">Send SmaiSika</span>
          </Button>

          <Button className="h-20 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-500/30 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300">
            <RefreshCw className="w-6 h-6 text-blue-400" />
            <span className="text-sm text-blue-300">Exchange</span>
          </Button>

          <Button className="h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300">
            <Eye className="w-6 h-6 text-purple-400" />
            <span className="text-sm text-purple-300">View History</span>
          </Button>

          <Button className="h-20 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300">
            <Settings className="w-6 h-6 text-amber-400" />
            <span className="text-sm text-amber-300">Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}