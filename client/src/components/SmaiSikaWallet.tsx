import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useSmaiWallet } from '@/context/SmaiWalletContext';
import { Wallet, TrendingUp, History, ArrowRightLeft, Plus, DollarSign, Shield, Zap, Heart, Lock, Eye } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'conversion' | 'trade' | 'withdrawal';
  amount: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

export default function SmaiSikaWallet() {
  const {
    smaiBalance,
    localBalance,
    lockedForTrade,
    karmaScore,
    tradeEnergy,
    lockedUntil,
    moralIndicator,
    divineApproval,
    smaiPrintAuthorized,
    transactions,
    isLoading,
    lockTradeFunds,
    unlockTradeFunds,
    updateKarma,
    chargeTradeEnergy,
    consumeTradeEnergy,
    isTradeAllowed,
    requestDivineApproval,
    checkMoralAlignment,
    setTimeLock,
    clearTimeLock,
    fetchWalletData,
  } = useSmaiWallet();

  const [fundAmount, setFundAmount] = useState('');
  const [convertAmount, setConvertAmount] = useState('');
  const [lockAmount, setLockAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const { toast } = useToast();

  const conversionRate = 500; // 1 ₭ = ₦500
  const convertedAmount = convertAmount ? (parseFloat(convertAmount) / conversionRate).toFixed(2) : '0.00';

  // Handle trade fund locking
  const handleLockFunds = async () => {
    const amount = parseFloat(lockAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to lock",
        variant: "destructive",
      });
      return;
    }

    const success = await lockTradeFunds(amount);
    if (success) {
      setLockAmount('');
    }
  };

  // Handle trade fund unlocking
  const handleUnlockFunds = async () => {
    const amount = parseFloat(lockAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount", 
        description: "Please enter a valid amount to unlock",
        variant: "destructive",
      });
      return;
    }

    const success = await unlockTradeFunds(amount);
    if (success) {
      setLockAmount('');
    }
  };

  // Simulate divine approval request
  const handleRequestDivineApproval = async () => {
    const amount = parseFloat(lockAmount) || 100;
    await requestDivineApproval(amount);
  };

  // Demo karma update
  const handleDemoKarma = (result: 'profit' | 'loss') => {
    const amount = Math.random() * 50 + 10; // Random amount between 10-60
    updateKarma(result, amount);
  };

  // Get moral indicator color
  const getMoralColor = () => {
    switch (moralIndicator) {
      case 'ethical': return 'text-green-400';
      case 'neutral': return 'text-yellow-400';
      case 'blocked': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Get karma color based on score
  const getKarmaColor = () => {
    if (karmaScore >= 80) return 'text-green-400';
    if (karmaScore >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            SmaiSika Wallet
          </h1>
          <p className="text-lg text-purple-300">Konsmic Intelligence Trading Engine</p>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Balance Overview */}
          <Card className="lg:col-span-2 bg-slate-800/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-purple-400" />
                Balance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-900/30 rounded-lg border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-300">₭{smaiBalance?.toLocaleString() || 0}</div>
                  <div className="text-sm text-gray-400">Available SMAI</div>
                </div>
                <div className="text-center p-4 bg-orange-900/30 rounded-lg border border-orange-500/20">
                  <div className="text-2xl font-bold text-orange-300">₭{lockedForTrade?.toLocaleString() || 0}</div>
                  <div className="text-sm text-gray-400">Locked for Trading</div>
                </div>
                <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-500/20">
                  <div className="text-2xl font-bold text-green-300">₦{localBalance?.toLocaleString() || 0}</div>
                  <div className="text-sm text-gray-400">Local Currency</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Divine Intelligence Status */}
          <Card className="bg-slate-800/50 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-cyan-400" />
                Divine Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Karma Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Karma Score</span>
                  <span className={`font-bold ${getKarmaColor()}`}>{karmaScore}/200</span>
                </div>
                <Progress value={(karmaScore / 200) * 100} className="h-2" />
              </div>

              {/* Trade Energy */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Trade Energy
                  </span>
                  <span className="font-bold text-blue-400">{tradeEnergy}/100</span>
                </div>
                <Progress value={tradeEnergy} className="h-2" />
              </div>

              {/* Moral Indicator */}
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  Moral Alignment
                </span>
                <Badge className={`${getMoralColor()} capitalize`}>
                  {moralIndicator}
                </Badge>
              </div>

              {/* Divine Approval */}
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Divine Approval
                </span>
                <Badge variant={divineApproval ? "default" : "destructive"}>
                  {divineApproval ? "Granted" : "Pending"}
                </Badge>
              </div>

              {/* Trading Status */}
              <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                <div className="text-center">
                  <div className={`text-lg font-bold ${isTradeAllowed() ? 'text-green-400' : 'text-red-400'}`}>
                    {isTradeAllowed() ? 'Trading Enabled' : 'Trading Restricted'}
                  </div>
                  {lockedUntil && (
                    <div className="text-xs text-gray-400 mt-1">
                      Locked until: {new Date(lockedUntil).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Konsmic Intelligence Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Fund Management */}
          <Card className="bg-slate-800/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-400" />
                Trading Fund Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="lockAmount">Amount (₭)</Label>
                <Input
                  id="lockAmount"
                  type="number"
                  value={lockAmount}
                  onChange={(e) => setLockAmount(e.target.value)}
                  placeholder="Enter amount to lock/unlock"
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleLockFunds} className="flex-1 bg-orange-600 hover:bg-orange-700">
                  Lock Funds
                </Button>
                <Button onClick={handleUnlockFunds} variant="outline" className="flex-1">
                  Unlock Funds
                </Button>
              </div>
              <Button onClick={handleRequestDivineApproval} className="w-full bg-cyan-600 hover:bg-cyan-700">
                Request Divine Approval
              </Button>
            </CardContent>
          </Card>

          {/* Karma & Energy Controls */}
          <Card className="bg-slate-800/50 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-green-400" />
                Karma & Energy Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-400 mb-4">
                Simulate trading outcomes to see karma effects:
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleDemoKarma('profit')} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Profitable Trade
                </Button>
                <Button 
                  onClick={() => handleDemoKarma('loss')} 
                  variant="destructive" 
                  className="flex-1"
                >
                  Loss Trade
                </Button>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => chargeTradeEnergy(10)} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Charge Energy +10
                </Button>
                <Button 
                  onClick={() => consumeTradeEnergy(5)} 
                  variant="outline" 
                  className="flex-1"
                >
                  Use Energy -5
                </Button>
              </div>

              {lockedUntil && (
                <Button onClick={clearTimeLock} className="w-full bg-purple-600 hover:bg-purple-700">
                  Clear Time Lock
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-slate-800/50 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-400" />
              Recent Trading Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions?.length > 0 ? (
              <div className="space-y-2">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-gray-400">{transaction.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₭{transaction.amount}</div>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No recent transactions found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}