import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useSmaiWallet } from '@/context/SmaiWalletContext';
import { 
  Wallet, TrendingUp, History, ArrowRightLeft, Plus, DollarSign, Shield, Zap, Heart, Lock, Eye,
  CreditCard, Coins, BarChart3, Settings, Bell, Gift, Smartphone, Globe, TrendingDown,
  PiggyBank, Repeat, Send, Download, Star, Award, Target, ChevronRight, Activity,
  Banknote, Bitcoin, Users, Network, Fingerprint, AlertTriangle, CheckCircle,
  Calendar, Clock, RefreshCw, Archive, Trash2, Filter, Search, LineChart
} from 'lucide-react';

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
  const [selectedCurrency, setSelectedCurrency] = useState('ngn');
  const [convertAmount, setConvertAmount] = useState('');
  const [lockAmount, setLockAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [stakingAmount, setStakingAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const conversionRate = 500; // 1 ₭ = ₦500
  const convertedAmount = convertAmount ? (parseFloat(convertAmount) / conversionRate).toFixed(2) : '0.00';

  // Mock data for enhanced features
  const cryptoHoldings = [
    { symbol: 'ETH', name: 'Ethereum', amount: 2.45, value: 5960.50, change: '+5.2%' },
    { symbol: 'BTC', name: 'Bitcoin', amount: 0.12, value: 5200.00, change: '+2.1%' },
    { symbol: 'USDT', name: 'Tether', amount: 1250.00, value: 1250.00, change: '0.0%' },
  ];

  const defiPositions = [
    { protocol: 'Uniswap V3', pair: 'ETH/USDC', liquidity: '$12,450', apy: '18.5%', status: 'Active' },
    { protocol: 'Compound', asset: 'USDT', supplied: '$5,200', apy: '4.2%', status: 'Active' },
    { protocol: 'Aave', asset: 'ETH', borrowed: '$3,100', apy: '2.8%', status: 'Healthy' },
  ];

  const tradingMetrics = {
    totalTrades: 156,
    winRate: 68.5,
    totalProfit: 2450.75,
    bestTrade: 1250.00,
    averageProfit: 15.71,
    roi: 24.5
  };

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
      toast({
        title: "Funds Locked",
        description: `₭${amount} locked for trading`,
      });
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
      toast({
        title: "Funds Unlocked",
        description: `₭${amount} unlocked from trading`,
      });
    }
  };

  // Handle global funding
  const handleGlobalFunding = async (paymentMethod: string, currency: string) => {
    const amount = parseFloat(fundAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to add",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/wallet/fund-global', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          paymentMethod,
          currency
        })
      });

      const result = await response.json();

      if (result.success) {
        setFundAmount('');
        toast({
          title: "Payment Successful",
          description: result.message,
        });
        // Refresh wallet data
        fetchWalletData();
      } else {
        toast({
          title: "Payment Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Simulate staking
  const handleStaking = () => {
    const amount = parseFloat(stakingAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid staking amount",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Staking Successful",
      description: `₭${amount} staked at 8.5% APY for 30 days`,
    });
    setStakingAmount('');
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
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Enhanced Header */}
        <div className="text-center py-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-2xl blur-xl"></div>
          <div className="relative">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              SmaiSika Wallet
            </h1>
            <p className="text-xl text-purple-300">Advanced Konsmic Intelligence Trading Platform</p>
            <div className="flex justify-center items-center gap-4 mt-4">
              <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                <Shield className="w-3 h-3 mr-1" />
                Secured
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                <Activity className="w-3 h-3 mr-1" />
                Active Trading
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                <Star className="w-3 h-3 mr-1" />
                Premium Features
              </Badge>
            </div>
          </div>
        </div>

        {/* Advanced Tabs System */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-slate-800/50 rounded-xl p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="defi" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              DeFi
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 h-16 flex flex-col gap-2">
                    <Plus className="w-6 h-6" />
                    <span>Add Funds</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-600 max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl md:text-2xl bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                      Add Funds to Your Wallet
                    </DialogTitle>
                  </DialogHeader>
                  
                  <Tabs defaultValue="card" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-slate-700/50 mb-6 overflow-x-auto">
                      <TabsTrigger value="card" className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        Card
                      </TabsTrigger>
                      <TabsTrigger value="bank" className="flex items-center gap-1">
                        <Banknote className="w-4 h-4" />
                        Bank
                      </TabsTrigger>
                      <TabsTrigger value="mobile" className="flex items-center gap-1">
                        <Smartphone className="w-4 h-4" />
                        Mobile
                      </TabsTrigger>
                      <TabsTrigger value="crypto" className="flex items-center gap-1">
                        <Bitcoin className="w-4 h-4" />
                        Crypto
                      </TabsTrigger>
                      <TabsTrigger value="global" className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        Global
                      </TabsTrigger>
                    </TabsList>

                    {/* Credit/Debit Card */}
                    <TabsContent value="card" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-green-400">Credit/Debit Card</h3>
                          <p className="text-sm text-gray-400">Secure payments powered by Stripe. Accepted worldwide.</p>
                          
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label>Amount</Label>
                              <Input
                                placeholder="Enter amount..."
                                value={fundAmount}
                                onChange={(e) => setFundAmount(e.target.value)}
                                className="bg-slate-700/50"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Currency</Label>
                              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                                <SelectTrigger className="bg-slate-700/50">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ngn">🇳🇬 Nigerian Naira (NGN)</SelectItem>
                                  <SelectItem value="usd">🇺🇸 US Dollar (USD)</SelectItem>
                                  <SelectItem value="eur">🇪🇺 Euro (EUR)</SelectItem>
                                  <SelectItem value="gbp">🇬🇧 British Pound (GBP)</SelectItem>
                                  <SelectItem value="cad">🇨🇦 Canadian Dollar (CAD)</SelectItem>
                                  <SelectItem value="aud">🇦🇺 Australian Dollar (AUD)</SelectItem>
                                  <SelectItem value="jpy">🇯🇵 Japanese Yen (JPY)</SelectItem>
                                  <SelectItem value="chf">🇨🇭 Swiss Franc (CHF)</SelectItem>
                                  <SelectItem value="cny">🇨🇳 Chinese Yuan (CNY)</SelectItem>
                                  <SelectItem value="inr">🇮🇳 Indian Rupee (INR)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleGlobalFunding('stripe', selectedCurrency)}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay with Stripe
                          </Button>
                        </div>
                        
                        <div className="bg-slate-700/30 p-4 rounded-lg">
                          <h4 className="font-medium mb-3">Supported Cards</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-xs text-white font-bold">VISA</div>
                              <span>Visa</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-5 bg-red-600 rounded flex items-center justify-center text-xs text-white font-bold">MC</div>
                              <span>Mastercard</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-5 bg-blue-800 rounded flex items-center justify-center text-xs text-white font-bold">AMEX</div>
                              <span>American Express</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-5 bg-orange-600 rounded flex items-center justify-center text-xs text-white font-bold">DIS</div>
                              <span>Discover</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-green-500/10 rounded border border-green-500/30">
                            <div className="flex items-center gap-2 text-green-400 text-sm">
                              <Shield className="w-4 h-4" />
                              <span>256-bit SSL encryption</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Bank Transfer */}
                    <TabsContent value="bank" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-blue-400">Bank Transfer</h3>
                          <p className="text-sm text-gray-400">Direct bank transfers and wire payments worldwide.</p>
                          
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <Button 
                                variant="outline" 
                                className="h-12 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('bank_transfer', 'usd')}
                              >
                                <span className="text-xs">🇺🇸 US</span>
                                <span className="text-xs">ACH Transfer</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('bank_transfer', 'eur')}
                              >
                                <span className="text-xs">🇪🇺 EU</span>
                                <span className="text-xs">SEPA Transfer</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('bank_transfer', 'gbp')}
                              >
                                <span className="text-xs">🇬🇧 UK</span>
                                <span className="text-xs">Faster Payments</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('bank_transfer', selectedCurrency)}
                              >
                                <span className="text-xs">🌍 Global</span>
                                <span className="text-xs">SWIFT Wire</span>
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Select Country</Label>
                              <Select>
                                <SelectTrigger className="bg-slate-700/50">
                                  <SelectValue placeholder="Choose your country..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ng">🇳🇬 Nigeria</SelectItem>
                                  <SelectItem value="us">🇺🇸 United States</SelectItem>
                                  <SelectItem value="gb">🇬🇧 United Kingdom</SelectItem>
                                  <SelectItem value="ca">🇨🇦 Canada</SelectItem>
                                  <SelectItem value="au">🇦🇺 Australia</SelectItem>
                                  <SelectItem value="de">🇩🇪 Germany</SelectItem>
                                  <SelectItem value="fr">🇫🇷 France</SelectItem>
                                  <SelectItem value="jp">🇯🇵 Japan</SelectItem>
                                  <SelectItem value="in">🇮🇳 India</SelectItem>
                                  <SelectItem value="br">🇧🇷 Brazil</SelectItem>
                                  <SelectItem value="mx">🇲🇽 Mexico</SelectItem>
                                  <SelectItem value="za">🇿🇦 South Africa</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-700/30 p-4 rounded-lg">
                          <h4 className="font-medium mb-3">Transfer Details</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Processing Time:</span>
                              <span>1-3 business days</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Fees:</span>
                              <span className="text-green-400">Free for amounts &gt; $100</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Minimum:</span>
                              <span>$10 / ₦5,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Maximum:</span>
                              <span>$50,000 daily</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Mobile Money */}
                    <TabsContent value="mobile" className="space-y-4 md:space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-3 md:space-y-4">
                          <h3 className="text-base md:text-lg font-semibold text-orange-400">Mobile Money</h3>
                          <p className="text-xs md:text-sm text-gray-400">Mobile payments for Africa, Asia, and emerging markets.</p>
                          
                          <div className="space-y-3 max-h-80 md:max-h-none overflow-y-auto">
                            <h4 className="font-medium text-sm md:text-base">Nigeria</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'ngn')}
                              >
                                <span className="text-xs md:text-sm font-bold">Paystack</span>
                                <span className="text-xs text-gray-400">All Nigerian banks</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'ngn')}
                              >
                                <span className="text-xs md:text-sm font-bold">Flutterwave</span>
                                <span className="text-xs text-gray-400">Cards + USSD</span>
                              </Button>
                            </div>
                            
                            <h4 className="font-medium mt-4">🌍 East Africa</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'kes')}
                              >
                                <span className="text-xs md:text-sm font-bold">M-Pesa</span>
                                <span className="text-xs text-gray-400">🇰🇪 Kenya</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'tzs')}
                              >
                                <span className="text-xs md:text-sm font-bold">M-Pesa TZ</span>
                                <span className="text-xs text-gray-400">🇹🇿 Tanzania</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'ugx')}
                              >
                                <span className="text-xs md:text-sm font-bold">MTN Mobile</span>
                                <span className="text-xs text-gray-400">🇺🇬 Uganda</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'rwf')}
                              >
                                <span className="text-xs md:text-sm font-bold">MTN Momo</span>
                                <span className="text-xs text-gray-400">🇷🇼 Rwanda</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'etb')}
                              >
                                <span className="text-xs md:text-sm font-bold">Telebirr</span>
                                <span className="text-xs text-gray-400">🇪🇹 Ethiopia</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'sos')}
                              >
                                <span className="text-xs md:text-sm font-bold">Hormuud</span>
                                <span className="text-xs text-gray-400">🇸🇴 Somalia</span>
                              </Button>
                            </div>
                            
                            <h4 className="font-medium mt-4 text-sm md:text-base text-yellow-400">🌍 West Africa</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-yellow-600/50 hover:border-yellow-400/70"
                                onClick={() => handleGlobalFunding('mobile_money', 'ghs')}
                              >
                                <span className="text-xs md:text-sm font-bold">MTN Momo</span>
                                <span className="text-xs text-gray-400">🇬🇭 Ghana</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'ngn')}
                              >
                                <span className="text-xs md:text-sm font-bold">Paga</span>
                                <span className="text-xs text-gray-400">🇳🇬 Nigeria</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'xof')}
                              >
                                <span className="text-xs md:text-sm font-bold">Orange Money</span>
                                <span className="text-xs text-gray-400">🇸🇳 Senegal</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'xof')}
                              >
                                <span className="text-xs md:text-sm font-bold">Moov Money</span>
                                <span className="text-xs text-gray-400">🇧🇫 Burkina Faso</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'xof')}
                              >
                                <span className="text-xs md:text-sm font-bold">MTN Momo</span>
                                <span className="text-xs text-gray-400">🇨🇮 Ivory Coast</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'lrd')}
                              >
                                <span className="text-xs md:text-sm font-bold">Orange Money</span>
                                <span className="text-xs text-gray-400">🇱🇷 Liberia</span>
                              </Button>
                            </div>
                            
                            <h4 className="font-medium mt-4 text-sm md:text-base">🌍 Southern Africa</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'zar')}
                              >
                                <span className="text-xs md:text-sm font-bold">FNB eWallet</span>
                                <span className="text-xs text-gray-400">🇿🇦 South Africa</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'zmw')}
                              >
                                <span className="text-xs md:text-sm font-bold">MTN Momo</span>
                                <span className="text-xs text-gray-400">🇿🇲 Zambia</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'bwp')}
                              >
                                <span className="text-xs md:text-sm font-bold">Orange Money</span>
                                <span className="text-xs text-gray-400">🇧🇼 Botswana</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'nad')}
                              >
                                <span className="text-xs md:text-sm font-bold">MTC Mobile</span>
                                <span className="text-xs text-gray-400">🇳🇦 Namibia</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'mzn')}
                              >
                                <span className="text-xs md:text-sm font-bold">mKesh</span>
                                <span className="text-xs text-gray-400">🇲🇿 Mozambique</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm"
                                onClick={() => handleGlobalFunding('mobile_money', 'zwl')}
                              >
                                <span className="text-xs md:text-sm font-bold">EcoCash</span>
                                <span className="text-xs text-gray-400">🇿🇼 Zimbabwe</span>
                              </Button>
                            </div>
                            
                            <h4 className="font-medium mt-4 text-sm md:text-base text-purple-400">🌍 Central & North Africa</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-purple-600/50 hover:border-purple-400/70"
                                onClick={() => handleGlobalFunding('mobile_money', 'egp')}
                              >
                                <span className="text-xs md:text-sm font-bold text-purple-300">Vodafone Cash</span>
                                <span className="text-xs text-gray-400">🇪🇬 Egypt</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-purple-600/50 hover:border-purple-400/70"
                                onClick={() => handleGlobalFunding('mobile_money', 'mad')}
                              >
                                <span className="text-xs md:text-sm font-bold text-purple-300">Orange Money</span>
                                <span className="text-xs text-gray-400">🇲🇦 Morocco</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-purple-600/50 hover:border-purple-400/70"
                                onClick={() => handleGlobalFunding('mobile_money', 'dzd')}
                              >
                                <span className="text-xs md:text-sm font-bold text-purple-300">Mobilis Money</span>
                                <span className="text-xs text-gray-400">🇩🇿 Algeria</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-purple-600/50 hover:border-purple-400/70"
                                onClick={() => handleGlobalFunding('mobile_money', 'tnd')}
                              >
                                <span className="text-xs md:text-sm font-bold text-purple-300">Ooredoo Money</span>
                                <span className="text-xs text-gray-400">🇹🇳 Tunisia</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-purple-600/50 hover:border-purple-400/70"
                                onClick={() => handleGlobalFunding('mobile_money', 'xaf')}
                              >
                                <span className="text-xs md:text-sm font-bold text-purple-300">MTN Mobile</span>
                                <span className="text-xs text-gray-400">🇨🇲 Cameroon</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-purple-600/50 hover:border-purple-400/70"
                                onClick={() => handleGlobalFunding('mobile_money', 'xaf')}
                              >
                                <span className="text-xs md:text-sm font-bold text-purple-300">Airtel Money</span>
                                <span className="text-xs text-gray-400">🇹🇩 Chad</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-purple-600/50 hover:border-purple-400/70"
                                onClick={() => handleGlobalFunding('mobile_money', 'xaf')}
                              >
                                <span className="text-xs md:text-sm font-bold text-purple-300">Orange Money</span>
                                <span className="text-xs text-gray-400">🇨🇫 CAR</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-purple-600/50 hover:border-purple-400/70"
                                onClick={() => handleGlobalFunding('mobile_money', 'cdf')}
                              >
                                <span className="text-xs md:text-sm font-bold text-purple-300">Vodacom M-Pesa</span>
                                <span className="text-xs text-gray-400">🇨🇩 DR Congo</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-purple-600/50 hover:border-purple-400/70"
                                onClick={() => handleGlobalFunding('mobile_money', 'sdg')}
                              >
                                <span className="text-xs md:text-sm font-bold text-purple-300">Bankak</span>
                                <span className="text-xs text-gray-400">🇸🇩 Sudan</span>
                              </Button>
                            </div>
                            
                            <h4 className="font-medium mt-4 text-sm md:text-base text-green-400">🌏 Asia Mobile Money</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-green-600/50 hover:border-green-400/70"
                                onClick={() => handleGlobalFunding('mobile_money', 'php')}
                              >
                                <span className="text-xs md:text-sm font-bold text-green-300">GCash</span>
                                <span className="text-xs text-gray-400">🇵🇭 Philippines</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-green-600/50 hover:border-green-400/70"
                                onClick={() => handleGlobalFunding('mobile_money', 'idr')}
                              >
                                <span className="text-xs md:text-sm font-bold text-green-300">OVO</span>
                                <span className="text-xs text-gray-400">🇮🇩 Indonesia</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-green-600/50 hover:border-green-400/70"
                                onClick={() => handleGlobalFunding('mobile_money', 'myr')}
                              >
                                <span className="text-xs md:text-sm font-bold text-green-300">Touch 'n Go</span>
                                <span className="text-xs text-gray-400">🇲🇾 Malaysia</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-green-600/50 hover:border-green-400/70"
                                onClick={() => handleGlobalFunding('mobile_money', 'thb')}
                              >
                                <span className="text-xs md:text-sm font-bold text-green-300">TrueMoney</span>
                                <span className="text-xs text-gray-400">🇹🇭 Thailand</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-green-600/50 hover:border-green-400/70"
                                onClick={() => handleGlobalFunding('mobile_money', 'vnd')}
                              >
                                <span className="text-xs md:text-sm font-bold text-green-300">MoMo</span>
                                <span className="text-xs text-gray-400">🇻🇳 Vietnam</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-green-600/50 hover:border-green-400/70"
                                onClick={() => handleGlobalFunding('mobile_money', 'bdt')}
                              >
                                <span className="text-xs md:text-sm font-bold text-green-300">bKash</span>
                                <span className="text-xs text-gray-400">🇧🇩 Bangladesh</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-700/30 p-4 rounded-lg">
                          <h4 className="font-medium mb-3 text-orange-400">Mobile Money Features</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Transfer Speed:</span>
                              <span className="text-green-400">Instant to 5 minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Coverage:</span>
                              <span className="text-white">50+ African countries</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Daily Limits:</span>
                              <span className="text-white">$1,000 - $10,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Fees:</span>
                              <span className="text-green-400">0.5% - 2.5%</span>
                            </div>
                          </div>
                          
                          <Alert className="mt-4 border-orange-500/30 bg-orange-500/10">
                            <Smartphone className="h-4 w-4 text-orange-400" />
                            <AlertDescription className="text-orange-200">
                              Mobile money is the fastest way to fund your wallet in Africa and Asia. No bank account required!
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Americas */}
                    <TabsContent value="americas" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-green-400">Americas Payment Methods</h3>
                          <p className="text-sm text-gray-400">Payment solutions for North, Central, and South America.</p>
                          
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm md:text-base text-blue-400">🇺🇸 North America</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-blue-600/50 hover:border-blue-400/70"
                                onClick={() => handleGlobalFunding('zelle', 'usd')}
                              >
                                <span className="text-xs md:text-sm font-bold text-blue-300">Zelle</span>
                                <span className="text-xs text-gray-400">🇺🇸 US Banks</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-blue-600/50 hover:border-blue-400/70"
                                onClick={() => handleGlobalFunding('interac', 'cad')}
                              >
                                <span className="text-xs md:text-sm font-bold text-blue-300">Interac e-Transfer</span>
                                <span className="text-xs text-gray-400">🇨🇦 Canada</span>
                              </Button>
                            </div>
                            
                            <h4 className="font-medium mt-4 text-sm md:text-base text-yellow-400">🌎 Latin America</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-yellow-600/50 hover:border-yellow-400/70"
                                onClick={() => handleGlobalFunding('pix', 'brl')}
                              >
                                <span className="text-xs md:text-sm font-bold text-yellow-300">PIX</span>
                                <span className="text-xs text-gray-400">🇧🇷 Brazil</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-yellow-600/50 hover:border-yellow-400/70"
                                onClick={() => handleGlobalFunding('spei', 'mxn')}
                              >
                                <span className="text-xs md:text-sm font-bold text-yellow-300">SPEI</span>
                                <span className="text-xs text-gray-400">🇲🇽 Mexico</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-yellow-600/50 hover:border-yellow-400/70"
                                onClick={() => handleGlobalFunding('pse', 'cop')}
                              >
                                <span className="text-xs md:text-sm font-bold text-yellow-300">PSE</span>
                                <span className="text-xs text-gray-400">🇨🇴 Colombia</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-yellow-600/50 hover:border-yellow-400/70"
                                onClick={() => handleGlobalFunding('khipu', 'clp')}
                              >
                                <span className="text-xs md:text-sm font-bold text-yellow-300">Khipu</span>
                                <span className="text-xs text-gray-400">🇨🇱 Chile</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-yellow-600/50 hover:border-yellow-400/70"
                                onClick={() => handleGlobalFunding('oxxo', 'mxn')}
                              >
                                <span className="text-xs md:text-sm font-bold text-yellow-300">OXXO</span>
                                <span className="text-xs text-gray-400">🇲🇽 Cash</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-yellow-600/50 hover:border-yellow-400/70"
                                onClick={() => handleGlobalFunding('nequi', 'cop')}
                              >
                                <span className="text-xs md:text-sm font-bold text-yellow-300">Nequi</span>
                                <span className="text-xs text-gray-400">🇨🇴 Colombia</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-700/30 p-4 rounded-lg">
                          <h4 className="font-medium mb-3 text-green-400">Americas Benefits</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Real-time transfers:</span>
                              <span className="text-green-400">PIX, SPEI, Zelle</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Cash options:</span>
                              <span className="text-white">OXXO, 7-Eleven</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Bank integration:</span>
                              <span className="text-white">All major banks</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Processing:</span>
                              <span className="text-green-400">1-15 minutes</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-green-500/10 rounded border border-green-500/30">
                            <div className="text-sm font-medium text-green-400">Regional Coverage</div>
                            <div className="text-xs text-gray-400 mt-1">
                              Serving 35 countries from Canada to Argentina with local payment preferences.
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Europe */}
                    <TabsContent value="europe" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-blue-400">European Payment Solutions</h3>
                          <p className="text-sm text-gray-400">SEPA transfers, open banking, and local payment methods.</p>
                          
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-blue-600/50 hover:border-blue-400/70"
                                onClick={() => handleGlobalFunding('sepa', 'eur')}
                              >
                                <span className="text-xs md:text-sm font-bold text-blue-300">SEPA Transfer</span>
                                <span className="text-xs text-gray-400">🇪🇺 EU/EEA</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-blue-600/50 hover:border-blue-400/70"
                                onClick={() => handleGlobalFunding('ideal', 'eur')}
                              >
                                <span className="text-xs md:text-sm font-bold text-blue-300">iDEAL</span>
                                <span className="text-xs text-gray-400">🇳🇱 Netherlands</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-blue-600/50 hover:border-blue-400/70"
                                onClick={() => handleGlobalFunding('sofort', 'eur')}
                              >
                                <span className="text-xs md:text-sm font-bold text-blue-300">Sofort</span>
                                <span className="text-xs text-gray-400">🇩🇪 Germany</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-blue-600/50 hover:border-blue-400/70"
                                onClick={() => handleGlobalFunding('bancontact', 'eur')}
                              >
                                <span className="text-xs md:text-sm font-bold text-blue-300">Bancontact</span>
                                <span className="text-xs text-gray-400">🇧🇪 Belgium</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-blue-600/50 hover:border-blue-400/70"
                                onClick={() => handleGlobalFunding('giropay', 'eur')}
                              >
                                <span className="text-xs md:text-sm font-bold text-blue-300">Giropay</span>
                                <span className="text-xs text-gray-400">🇩🇪 Germany</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-blue-600/50 hover:border-blue-400/70"
                                onClick={() => handleGlobalFunding('faster_payments', 'gbp')}
                              >
                                <span className="text-xs md:text-sm font-bold text-blue-300">Faster Payments</span>
                                <span className="text-xs text-gray-400">🇬🇧 UK</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-700/30 p-4 rounded-lg">
                          <h4 className="font-medium mb-3 text-blue-400">European Features</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">SEPA Coverage:</span>
                              <span className="text-white">36 countries</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Transfer Speed:</span>
                              <span className="text-green-400">Instant to same-day</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Open Banking:</span>
                              <span className="text-green-400">PSD2 compliant</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Security:</span>
                              <span className="text-green-400">Strong Customer Authentication</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-blue-500/10 rounded border border-blue-500/30">
                            <div className="text-sm font-medium text-blue-400">Regulatory Compliance</div>
                            <div className="text-xs text-gray-400 mt-1">
                              All European payment methods are PSD2 compliant with strong customer authentication.
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Cryptocurrency */}
                    <TabsContent value="crypto" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-yellow-400">Cryptocurrency Deposit</h3>
                          <p className="text-sm text-gray-400">Deposit popular cryptocurrencies instantly.</p>
                          
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-orange-600/50 hover:border-orange-400/70"
                                onClick={() => handleGlobalFunding('crypto', 'btc')}
                              >
                                <Bitcoin className="w-6 h-6 text-orange-400" />
                                <span className="text-xs md:text-sm text-orange-300">Bitcoin</span>
                                <span className="text-xs text-gray-400">BTC</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-blue-600/50 hover:border-blue-400/70"
                                onClick={() => handleGlobalFunding('crypto', 'eth')}
                              >
                                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                                <span className="text-xs md:text-sm text-blue-300">Ethereum</span>
                                <span className="text-xs text-gray-400">ETH</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-green-600/50 hover:border-green-400/70"
                                onClick={() => handleGlobalFunding('crypto', 'usdt')}
                              >
                                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                                <span className="text-xs md:text-sm text-green-300">USDT</span>
                                <span className="text-xs text-gray-400">Tether</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-12 md:h-16 flex flex-col gap-1 text-xs md:text-sm border-blue-600/50 hover:border-blue-400/70"
                                onClick={() => handleGlobalFunding('crypto', 'usdc')}
                              >
                                <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
                                <span className="text-xs md:text-sm text-blue-300">USDC</span>
                                <span className="text-xs text-gray-400">USD Coin</span>
                              </Button>
                            </div>
                            
                            <div className="bg-slate-700/50 p-3 rounded-lg">
                              <div className="text-sm font-medium mb-2 text-yellow-400">Deposit Address (ETH)</div>
                              <div className="font-mono text-xs bg-slate-800 p-2 rounded break-all text-gray-300">
                                0x742d35Cc6532C97D67b87A6e5238B8e9B8C9876B
                              </div>
                              <Button size="sm" className="mt-2 w-full" variant="outline">
                                <ArrowRightLeft className="w-3 h-3 mr-1" />
                                Generate New Address
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-700/30 p-4 rounded-lg">
                          <h4 className="font-medium mb-3 text-yellow-400">Crypto Features</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Confirmation time:</span>
                              <span className="text-green-400">1-6 blocks</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Network fees:</span>
                              <span className="text-white">Paid by user</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Minimum deposit:</span>
                              <span className="text-white">$10 equivalent</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Security:</span>
                              <span className="text-green-400">Multi-sig wallet</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-yellow-500/10 rounded border border-yellow-500/30">
                            <div className="text-sm font-medium text-yellow-400">24/7 Processing</div>
                            <div className="text-xs text-gray-400 mt-1">
                              Cryptocurrency deposits are processed automatically around the clock.
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>

              {/* Other Quick Actions */}
              <Button className="bg-blue-600 hover:bg-blue-700 h-16 flex flex-col gap-2">
                <ArrowRightLeft className="w-6 h-6" />
                <span>Convert</span>
              </Button>
              
              <Button className="bg-purple-600 hover:bg-purple-700 h-16 flex flex-col gap-2">
                <Send className="w-6 h-6" />
                <span>Send</span>
              </Button>
              
              <Button className="bg-amber-600 hover:bg-amber-700 h-16 flex flex-col gap-2">
                <Download className="w-6 h-6" />
                <span>Withdraw</span>
              </Button>
            </div>

            {/* Rest of component content */}
            <div className="text-center text-gray-400 mt-8">
              <p>Wallet functionality is under development</p>
            </div>
          </TabsContent>

          {/* Other Tabs can be added here */}
        </Tabs>
      </div>
    </div>
  );
}
