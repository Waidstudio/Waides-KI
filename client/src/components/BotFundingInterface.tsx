import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Bot,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface BotBalance {
  balance: number;
  allocated: number;
  available: number;
  totalTrades: number;
  profit: number;
  profitPercent: number;
}

interface BotBalances {
  waidbot: BotBalance;
  waidbot_pro: BotBalance;
  autonomous_trader: BotBalance;
  full_engine: BotBalance;
}

interface FundingTransaction {
  id: string;
  type: 'bot_funding' | 'bot_withdrawal';
  botType: string;
  botName: string;
  amount: number;
  status: string;
  timestamp: string;
  description: string;
}

export const BotFundingInterface: React.FC = () => {
  const [selectedBot, setSelectedBot] = useState<string>('');
  const [fundAmount, setFundAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'fund' | 'withdraw' | 'history'>('fund');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch bot balances
  const { data: botBalances, isLoading: balancesLoading } = useQuery<{
    success: boolean;
    botBalances: BotBalances;
    totalBotBalance: number;
    totalProfit: number;
  }>({
    queryKey: ['/api/wallet/bot-balances'],
    refetchInterval: 5000
  });

  // Fetch SmaiSika wallet balance
  const { data: walletBalance } = useQuery<{
    smaiSika: {
      available: number;
      total: number;
    };
  }>({
    queryKey: ['/api/wallet/smaisika/balance'],
    refetchInterval: 5000
  });

  // Fetch funding history
  const { data: fundingHistory } = useQuery<{
    success: boolean;
    history: FundingTransaction[];
  }>({
    queryKey: ['/api/wallet/funding-history']
  });

  // Fund bot mutation
  const fundBot = useMutation({
    mutationFn: async ({ botType, amount }: { botType: string; amount: number }) => {
      const response = await fetch('/api/wallet/fund-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botType, amount })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Bot Funded Successfully",
          description: data.message
        });
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/bot-balances'] });
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/smaisika/balance'] });
        setFundAmount('');
        setSelectedBot('');
      } else {
        toast({
          title: "Funding Failed",
          description: data.error,
          variant: "destructive"
        });
      }
    }
  });

  // Withdraw from bot mutation
  const withdrawFromBot = useMutation({
    mutationFn: async ({ botType, amount }: { botType: string; amount: number }) => {
      const response = await fetch('/api/wallet/withdraw-from-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botType, amount })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Withdrawal Successful",
          description: data.message
        });
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/bot-balances'] });
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/smaisika/balance'] });
        setWithdrawAmount('');
        setSelectedBot('');
      } else {
        toast({
          title: "Withdrawal Failed",
          description: data.error,
          variant: "destructive"
        });
      }
    }
  });

  const handleFundBot = () => {
    if (!selectedBot || !fundAmount || parseFloat(fundAmount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select a bot and enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    fundBot.mutate({
      botType: selectedBot,
      amount: parseFloat(fundAmount)
    });
  };

  const handleWithdrawFromBot = () => {
    if (!selectedBot || !withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Input", 
        description: "Please select a bot and enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    withdrawFromBot.mutate({
      botType: selectedBot,
      amount: parseFloat(withdrawAmount)
    });
  };

  const botOptions = [
    { value: 'waidbot', label: 'WaidBot', color: 'blue' },
    { value: 'waidbot_pro', label: 'WaidBot Pro', color: 'green' },
    { value: 'autonomous_trader', label: 'Autonomous Trader', color: 'purple' },
    { value: 'full_engine', label: 'Full Engine', color: 'orange' }
  ];

  if (balancesLoading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-blue-500/30">
        <CardContent className="p-6 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
          <span className="ml-2 text-white">Loading bot balances...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet & Bot Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">SmaiSika Wallet</p>
                <p className="text-2xl font-bold text-white">
                  ꠄ{walletBalance?.smaiSika?.available?.toLocaleString() || '2,580'}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Total Bot Balance</p>
                <p className="text-2xl font-bold text-white">
                  ${botBalances?.totalBotBalance?.toLocaleString() || '45,000'}
                </p>
              </div>
              <Bot className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Total Bot Profit</p>
                <p className="text-2xl font-bold text-white">
                  ${botBalances?.totalProfit?.toLocaleString() || '6,711'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm">Avg ROI</p>
                <p className="text-2xl font-bold text-white">
                  {botBalances ? (
                    ((botBalances.totalProfit / botBalances.totalBotBalance) * 100).toFixed(1)
                  ) : '14.9'}%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Bot Balances */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            Bot Balance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {botOptions.map((bot) => {
              const balance = botBalances?.botBalances?.[bot.value as keyof BotBalances];
              return (
                <div
                  key={bot.value}
                  className={`p-4 rounded-lg border border-${bot.color}-500/40 bg-${bot.color}-900/20`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold text-${bot.color}-300`}>{bot.label}</h3>
                    <Badge variant={balance?.balance ? "default" : "secondary"} className={`bg-${bot.color}-500/20 text-${bot.color}-400`}>
                      {balance?.balance ? 'FUNDED' : 'EMPTY'}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Balance:</span>
                      <span className="text-white font-medium">${balance?.balance?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Profit:</span>
                      <span className={`font-medium ${(balance?.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${balance?.profit?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ROI:</span>
                      <span className={`font-medium ${(balance?.profitPercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {balance?.profitPercent?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((balance?.profitPercent || 0), 100)} 
                      className={`h-2 bg-slate-700`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Funding Interface */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <ArrowUpRight className="w-5 h-5 mr-2" />
              Bot Funding Center
            </CardTitle>
            <div className="flex space-x-2">
              {(['fund', 'withdraw', 'history'] as const).map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className={activeTab === tab ? "bg-blue-600 text-white" : "border-slate-600 text-slate-300"}
                >
                  {tab === 'fund' && <ArrowUpRight className="w-4 h-4 mr-1" />}
                  {tab === 'withdraw' && <ArrowDownLeft className="w-4 h-4 mr-1" />}
                  {tab === 'history' && <RefreshCw className="w-4 h-4 mr-1" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'fund' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select Bot to Fund</label>
                  <div className="grid grid-cols-2 gap-2">
                    {botOptions.map((bot) => (
                      <Button
                        key={bot.value}
                        variant={selectedBot === bot.value ? "default" : "outline"}
                        onClick={() => setSelectedBot(bot.value)}
                        className={`text-sm ${
                          selectedBot === bot.value 
                            ? `bg-${bot.color}-600 text-white` 
                            : `border-${bot.color}-500/40 text-${bot.color}-300 hover:bg-${bot.color}-900/20`
                        }`}
                      >
                        {bot.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Amount (SmaiSika)</label>
                  <Input
                    type="number"
                    placeholder="Enter amount to fund"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Available: ꠄ{walletBalance?.smaiSika?.available?.toLocaleString() || '2,580.75'}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleFundBot}
                disabled={fundBot.isPending || !selectedBot || !fundAmount}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {fundBot.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Funding Bot...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Fund Bot
                  </>
                )}
              </Button>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select Bot to Withdraw From</label>
                  <div className="grid grid-cols-2 gap-2">
                    {botOptions.map((bot) => (
                      <Button
                        key={bot.value}
                        variant={selectedBot === bot.value ? "default" : "outline"}
                        onClick={() => setSelectedBot(bot.value)}
                        className={`text-sm ${
                          selectedBot === bot.value 
                            ? `bg-${bot.color}-600 text-white` 
                            : `border-${bot.color}-500/40 text-${bot.color}-300 hover:bg-${bot.color}-900/20`
                        }`}
                      >
                        {bot.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Amount to Withdraw</label>
                  <Input
                    type="number"
                    placeholder="Enter amount to withdraw"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Available: ${botBalances?.botBalances?.[selectedBot as keyof BotBalances]?.balance?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleWithdrawFromBot}
                disabled={withdrawFromBot.isPending || !selectedBot || !withdrawAmount}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {withdrawFromBot.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing Withdrawal...
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Withdraw Funds
                  </>
                )}
              </Button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="max-h-64 overflow-y-auto">
                {fundingHistory?.history?.length ? (
                  <div className="space-y-2">
                    {fundingHistory.history.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                      >
                        <div className="flex items-center space-x-3">
                          {transaction.type === 'bot_funding' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-400" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4 text-orange-400" />
                          )}
                          <div>
                            <p className="text-white font-medium">{transaction.botName}</p>
                            <p className="text-xs text-slate-400">{new Date(transaction.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.type === 'bot_funding' ? 'text-green-400' : 'text-orange-400'
                          }`}>
                            {transaction.type === 'bot_funding' ? '+' : '-'}ꠄ{transaction.amount.toLocaleString()}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No funding history available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BotFundingInterface;