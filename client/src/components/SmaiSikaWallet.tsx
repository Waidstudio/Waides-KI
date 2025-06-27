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
                            
                            <h4 className="font-medium mt-4">🌍 West Africa</h4>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'ghs')}
                              >
                                <span className="text-sm font-bold">MTN Momo</span>
                                <span className="text-xs text-gray-400">🇬🇭 Ghana</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'ngn')}
                              >
                                <span className="text-sm font-bold">Paga</span>
                                <span className="text-xs text-gray-400">🇳🇬 Nigeria</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'xof')}
                              >
                                <span className="text-sm font-bold">Orange Money</span>
                                <span className="text-xs text-gray-400">🇸🇳 Senegal</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'xof')}
                              >
                                <span className="text-sm font-bold">Moov Money</span>
                                <span className="text-xs text-gray-400">🇧🇫 Burkina Faso</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'xof')}
                              >
                                <span className="text-sm font-bold">MTN Momo</span>
                                <span className="text-xs text-gray-400">🇨🇮 Ivory Coast</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'lrd')}
                              >
                                <span className="text-sm font-bold">Orange Money</span>
                                <span className="text-xs text-gray-400">🇱🇷 Liberia</span>
                              </Button>
                            </div>
                            
                            <h4 className="font-medium mt-4">🌍 Southern Africa</h4>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'zar')}
                              >
                                <span className="text-sm font-bold">FNB eWallet</span>
                                <span className="text-xs text-gray-400">🇿🇦 South Africa</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'zmw')}
                              >
                                <span className="text-sm font-bold">MTN Momo</span>
                                <span className="text-xs text-gray-400">🇿🇲 Zambia</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'bwp')}
                              >
                                <span className="text-sm font-bold">Orange Money</span>
                                <span className="text-xs text-gray-400">🇧🇼 Botswana</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'nad')}
                              >
                                <span className="text-sm font-bold">MTC Mobile</span>
                                <span className="text-xs text-gray-400">🇳🇦 Namibia</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'mzn')}
                              >
                                <span className="text-sm font-bold">mKesh</span>
                                <span className="text-xs text-gray-400">🇲🇿 Mozambique</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'zwl')}
                              >
                                <span className="text-sm font-bold">EcoCash</span>
                                <span className="text-xs text-gray-400">🇿🇼 Zimbabwe</span>
                              </Button>
                            </div>
                            
                            <h4 className="font-medium mt-4">🌍 Central & North Africa</h4>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'egp')}
                              >
                                <span className="text-sm font-bold">Orange Money</span>
                                <span className="text-xs text-gray-400">🇪🇬 Egypt</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'mad')}
                              >
                                <span className="text-sm font-bold">Orange Money</span>
                                <span className="text-xs text-gray-400">🇲🇦 Morocco</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'dzd')}
                              >
                                <span className="text-sm font-bold">Mobilis</span>
                                <span className="text-xs text-gray-400">🇩🇿 Algeria</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'xaf')}
                              >
                                <span className="text-sm font-bold">Orange Money</span>
                                <span className="text-xs text-gray-400">🇨🇲 Cameroon</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'xaf')}
                              >
                                <span className="text-sm font-bold">Airtel Money</span>
                                <span className="text-xs text-gray-400">🇹🇩 Chad</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'cdf')}
                              >
                                <span className="text-sm font-bold">Airtel Money</span>
                                <span className="text-xs text-gray-400">🇨🇩 DR Congo</span>
                              </Button>
                            </div>
                            
                            <h4 className="font-medium mt-4">Asia</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'php')}
                              >
                                <span className="text-sm font-bold">GCash</span>
                                <span className="text-xs text-gray-400">Philippines</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('mobile_money', 'inr')}
                              >
                                <span className="text-sm font-bold">Paytm</span>
                                <span className="text-xs text-gray-400">India</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-700/30 p-4 rounded-lg">
                          <h4 className="font-medium mb-3">Mobile Payment Benefits</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span>Instant transactions</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span>No bank account required</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span>Local currency support</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span>24/7 availability</span>
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
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('crypto', 'btc')}
                              >
                                <Bitcoin className="w-6 h-6 text-orange-400" />
                                <span className="text-sm">Bitcoin</span>
                                <span className="text-xs text-gray-400">BTC</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('crypto', 'eth')}
                              >
                                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                                <span className="text-sm">Ethereum</span>
                                <span className="text-xs text-gray-400">ETH</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('crypto', 'usdt')}
                              >
                                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                                <span className="text-sm">USDT</span>
                                <span className="text-xs text-gray-400">Tether</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="h-16 flex flex-col gap-1"
                                onClick={() => handleGlobalFunding('crypto', 'usdc')}
                              >
                                <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
                                <span className="text-sm">USDC</span>
                                <span className="text-xs text-gray-400">USD Coin</span>
                              </Button>
                            </div>
                            
                            <div className="bg-slate-700/50 p-3 rounded-lg">
                              <div className="text-sm font-medium mb-2">Deposit Address (ETH)</div>
                              <div className="font-mono text-xs bg-slate-800 p-2 rounded break-all">
                                0x742d35Cc6532C97D67b87A6e5238B8e9B8C9876B
                              </div>
                              <Button size="sm" className="mt-2 w-full" variant="outline">
                                <ArrowRightLeft className="w-3 h-3 mr-1" />
                                Copy Address
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-700/30 p-4 rounded-lg">
                          <h4 className="font-medium mb-3">Crypto Deposit Info</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Network:</span>
                              <span>Ethereum (ERC-20)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Confirmations:</span>
                              <span>12 blocks</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Processing:</span>
                              <span className="text-green-400">~5-15 minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Minimum:</span>
                              <span>0.001 ETH</span>
                            </div>
                          </div>
                          
                          <Alert className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Only send ETH and ERC-20 tokens to this address. Other cryptocurrencies will be lost.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Global Options */}
                    <TabsContent value="global" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-purple-400">Global Payment Solutions</h3>
                          <p className="text-sm text-gray-400">International payment methods for all countries.</p>
                          
                          <div className="space-y-3">
                            <Button 
                              className="w-full h-16 bg-blue-600 hover:bg-blue-700 flex items-center justify-between"
                              onClick={() => handleGlobalFunding('paypal', selectedCurrency)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-bold text-xs">PP</span>
                                </div>
                                <div className="text-left">
                                  <div className="font-medium">PayPal</div>
                                  <div className="text-xs text-blue-200">Available in 200+ countries</div>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              className="w-full h-16 flex items-center justify-between"
                              onClick={() => handleGlobalFunding('wise', selectedCurrency)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                  <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium">Wise (TransferWise)</div>
                                  <div className="text-xs text-gray-400">Multi-currency wallet</div>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              className="w-full h-16 flex items-center justify-between"
                              onClick={() => handleGlobalFunding('western_union', selectedCurrency)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                                  <Banknote className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium">Western Union</div>
                                  <div className="text-xs text-gray-400">Cash pickup available</div>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              className="w-full h-16 flex items-center justify-between"
                              onClick={() => handleGlobalFunding('local_bank', selectedCurrency)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                  <Smartphone className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium">Local Banks</div>
                                  <div className="text-xs text-gray-400">Country-specific options</div>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-slate-700/30 p-4 rounded-lg">
                          <h4 className="font-medium mb-3">Supported Regions</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>🌍 Africa (54 countries)</div>
                            <div>🌏 Asia-Pacific (48 countries)</div>
                            <div>🌎 Americas (35 countries)</div>
                            <div>🌍 Europe (44 countries)</div>
                            <div>🏝️ Caribbean (13 countries)</div>
                            <div>🌊 Oceania (14 countries)</div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-blue-500/10 rounded border border-blue-500/30">
                            <div className="text-sm font-medium text-blue-400">Need Help?</div>
                            <div className="text-xs text-gray-400 mt-1">
                              Contact our support team for payment options specific to your country.
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" className="h-16 flex flex-col gap-2">
                <Send className="w-6 h-6" />
                <span>Send Money</span>
              </Button>
              
              <Button variant="outline" className="h-16 flex flex-col gap-2">
                <ArrowRightLeft className="w-6 h-6" />
                <span>Convert</span>
              </Button>
              
              <Button variant="outline" className="h-16 flex flex-col gap-2">
                <History className="w-6 h-6" />
                <span>History</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Enhanced Balance Overview */}
              <Card className="lg:col-span-2 bg-slate-800/50 border-purple-500/30 hover:border-purple-400/50 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-purple-400" />
                      Portfolio Balance
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SmaiSika Balance */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">SmaiSika Balance</span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-cyan-400 animate-pulse">
                            ₭{smaiBalance?.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">≈ ₦{(smaiBalance * conversionRate).toLocaleString()}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Local Balance</span>
                        <div className="text-right">
                          <div className="text-lg font-semibold">₦{localBalance?.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">Available for conversion</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Locked for Trading</span>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-orange-400">₭{lockedForTrade?.toFixed(2)}</div>
                          <div className="text-xs text-gray-400">
                            {lockedUntil ? `Until ${new Date(lockedUntil).toLocaleDateString()}` : 'Flexible'}
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Total Portfolio Value</span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">
                            ₭{(smaiBalance + (localBalance / conversionRate) + lockedForTrade).toFixed(2)}
                          </div>
                          <div className="text-xs text-green-300">+12.5% this month</div>
                        </div>
                      </div>
                    </div>

                    {/* Crypto Holdings */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Bitcoin className="w-5 h-5 text-orange-400" />
                        Crypto Holdings
                      </h3>
                      {cryptoHoldings.map((crypto) => (
                        <div key={crypto.symbol} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-black">{crypto.symbol.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="font-medium">{crypto.symbol}</div>
                              <div className="text-xs text-gray-400">{crypto.amount} tokens</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${crypto.value.toLocaleString()}</div>
                            <div className={`text-xs ${crypto.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                              {crypto.change}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Spiritual Metrics */}
              <Card className="bg-slate-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-400" />
                    Spiritual Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Karma Score</span>
                      <span className={`font-bold ${getKarmaColor()}`}>{karmaScore}/100</span>
                    </div>
                    <Progress value={karmaScore} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trade Energy</span>
                      <span className="font-bold text-blue-400">{tradeEnergy}/100</span>
                    </div>
                    <Progress value={tradeEnergy} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Moral Status</span>
                    <Badge variant="outline" className={getMoralColor()}>
                      {moralIndicator}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Divine Approval</span>
                    <Badge variant={divineApproval ? "default" : "secondary"}>
                      {divineApproval ? "Blessed" : "Pending"}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDemoKarma('profit')}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Good Karma
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleRequestDivineApproval}
                      className="text-xs"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Request Blessing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-cyan-400" />
                    Recent Activity
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-48 h-9 bg-slate-700/50"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-3 h-3 mr-1" />
                      Filter
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions?.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'deposit' ? 'bg-green-500/20' :
                            transaction.type === 'withdrawal' ? 'bg-red-500/20' :
                            transaction.type === 'trade' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                          }`}>
                            {transaction.type === 'deposit' ? <Download className="w-4 h-4 text-green-400" /> :
                             transaction.type === 'withdrawal' ? <Send className="w-4 h-4 text-red-400" /> :
                             transaction.type === 'trade' ? <TrendingUp className="w-4 h-4 text-blue-400" /> :
                             <ArrowRightLeft className="w-4 h-4 text-purple-400" />}
                          </div>
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {transaction.date}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${
                            transaction.type === 'deposit' ? 'text-green-400' :
                            transaction.type === 'withdrawal' ? 'text-red-400' : 'text-cyan-400'
                          }`}>
                            {transaction.type === 'withdrawal' ? '-' : '+'}₭{transaction.amount}
                          </div>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 
                                         transaction.status === 'pending' ? 'secondary' : 'destructive'}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No transactions yet</p>
                    <p className="text-sm">Your transaction history will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Tab */}
          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Trading Dashboard */}
              <Card className="bg-slate-800/50 border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Trading Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{tradingMetrics.totalTrades}</div>
                      <div className="text-xs text-gray-400">Total Trades</div>
                    </div>
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">{tradingMetrics.winRate}%</div>
                      <div className="text-xs text-gray-400">Win Rate</div>
                    </div>
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">₭{tradingMetrics.totalProfit}</div>
                      <div className="text-xs text-gray-400">Total Profit</div>
                    </div>
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-400">{tradingMetrics.roi}%</div>
                      <div className="text-xs text-gray-400">ROI</div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Best Trade</span>
                      <span className="font-semibold text-green-400">₭{tradingMetrics.bestTrade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Average Profit</span>
                      <span className="font-semibold text-blue-400">₭{tradingMetrics.averageProfit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fund Management */}
              <Card className="bg-slate-800/50 border-orange-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-orange-400" />
                    Fund Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lockAmount">Amount to Lock/Unlock</Label>
                    <Input
                      id="lockAmount"
                      placeholder="Enter amount..."
                      value={lockAmount}
                      onChange={(e) => setLockAmount(e.target.value)}
                      className="bg-slate-700/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={handleLockFunds} className="bg-orange-600 hover:bg-orange-700">
                      <Lock className="w-4 h-4 mr-1" />
                      Lock Funds
                    </Button>
                    <Button onClick={handleUnlockFunds} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Unlock Funds
                    </Button>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Locked funds are protected from impulsive trading decisions and can only be unlocked after the specified period.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DeFi Tab */}
          <TabsContent value="defi" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* DeFi Positions */}
              <Card className="bg-slate-800/50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-blue-400" />
                    DeFi Positions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {defiPositions.map((position, index) => (
                      <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{position.protocol}</div>
                            <div className="text-sm text-gray-400">{position.pair || position.asset}</div>
                          </div>
                          <Badge variant={position.status === 'Active' ? 'default' : 'secondary'}>
                            {position.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">
                            {position.liquidity || position.supplied || position.borrowed}
                          </span>
                          <span className="text-green-400 font-semibold">{position.apy} APY</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Staking */}
              <Card className="bg-slate-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-purple-400" />
                    Staking Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                    <div className="text-3xl font-bold text-purple-400">8.5%</div>
                    <div className="text-sm text-gray-300">Annual Percentage Yield</div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stakingAmount">Staking Amount</Label>
                    <Input
                      id="stakingAmount"
                      placeholder="Enter amount to stake..."
                      value={stakingAmount}
                      onChange={(e) => setStakingAmount(e.target.value)}
                      className="bg-slate-700/50"
                    />
                  </div>

                  <Button onClick={handleStaking} className="w-full bg-purple-600 hover:bg-purple-700">
                    <PiggyBank className="w-4 h-4 mr-1" />
                    Start Staking
                  </Button>

                  <div className="text-xs text-gray-400 text-center">
                    Minimum staking period: 30 days
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Portfolio Analytics */}
              <Card className="lg:col-span-2 bg-slate-800/50 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-cyan-400" />
                    Portfolio Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-slate-700/30 rounded-lg">
                    <div className="text-center">
                      <LineChart className="w-16 h-16 mx-auto mb-4 text-cyan-400/50" />
                      <p className="text-lg font-medium text-gray-300">Interactive Chart</p>
                      <p className="text-sm text-gray-400">Portfolio performance over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Metrics */}
              <Card className="bg-slate-800/50 border-red-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    Risk Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Risk Score</span>
                      <span className="font-bold text-yellow-400">Medium</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Diversification</span>
                      <span className="font-bold text-green-400">Good</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Volatility</span>
                      <span className="font-bold text-orange-400">15.2%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>

                  <Separator />

                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">B+</div>
                    <div className="text-xs text-gray-400">Overall Portfolio Grade</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Security Status */}
              <Card className="bg-slate-800/50 border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    Security Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>2FA Enabled</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-5 h-5 text-green-400" />
                      <span>Biometric Lock</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-400" />
                      <span>Account Monitoring</span>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-300">Watching</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-purple-400" />
                      <span>Encryption</span>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300">AES-256</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Security Activity */}
              <Card className="bg-slate-800/50 border-orange-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-400" />
                    Security Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Login Detected</span>
                        <span className="text-xs text-gray-400">2 hours ago</span>
                      </div>
                      <div className="text-sm text-gray-400">New login from Chrome, Nigeria</div>
                    </div>

                    <div className="p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">2FA Code Used</span>
                        <span className="text-xs text-gray-400">5 hours ago</span>
                      </div>
                      <div className="text-sm text-gray-400">Authentication successful</div>
                    </div>

                    <div className="p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Password Updated</span>
                        <span className="text-xs text-gray-400">1 day ago</span>
                      </div>
                      <div className="text-sm text-gray-400">Security settings modified</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Loyalty Program */}
              <Card className="bg-slate-800/50 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-400" />
                    Loyalty Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">Gold</div>
                    <div className="text-sm text-gray-400">Premium Member</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Progress to Platinum</span>
                      <span className="text-sm font-medium">2,450 / 5,000 pts</span>
                    </div>
                    <Progress value={49} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-yellow-400">Benefits:</div>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• 0.5% trading fee discount</li>
                      <li>• Priority customer support</li>
                      <li>• Monthly airdrops</li>
                      <li>• Advanced analytics</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Referral Program */}
              <Card className="bg-slate-800/50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    Referral Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">12</div>
                    <div className="text-sm text-gray-400">Friends Referred</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Earned This Month</span>
                      <span className="font-semibold text-green-400">₭450</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Total Earned</span>
                      <span className="font-semibold text-blue-400">₭2,750</span>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Users className="w-4 h-4 mr-1" />
                    Invite Friends
                  </Button>
                </CardContent>
              </Card>

              {/* Achievement System */}
              <Card className="bg-slate-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-400" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">First Trade</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 text-xs">+50 pts</Badge>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Profit Streak</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 text-xs">+100 pts</Badge>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-600/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Volume Trader</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Locked</Badge>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-600/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">HODLer</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Locked</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Account Settings */}
              <Card className="bg-slate-800/50 border-slate-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-slate-400" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Display Currency</Label>
                    <Select defaultValue="ngn">
                      <SelectTrigger className="bg-slate-700/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ngn">Nigerian Naira (₦)</SelectItem>
                        <SelectItem value="usd">US Dollar ($)</SelectItem>
                        <SelectItem value="eur">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time Zone</Label>
                    <Select defaultValue="wat">
                      <SelectTrigger className="bg-slate-700/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wat">West Africa Time (WAT)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="bg-slate-700/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ha">Hausa</SelectItem>
                        <SelectItem value="yo">Yoruba</SelectItem>
                        <SelectItem value="ig">Igbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card className="bg-slate-800/50 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-400" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Trading Alerts</div>
                      <div className="text-sm text-gray-400">Price movements and signals</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Security Alerts</div>
                      <div className="text-sm text-gray-400">Login and security events</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Promotional</div>
                      <div className="text-sm text-gray-400">News and promotions</div>
                    </div>
                    <input type="checkbox" className="w-4 h-4" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">SMS Notifications</div>
                      <div className="text-sm text-gray-400">Critical alerts via SMS</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input 
                      placeholder="+234 XXX XXX XXXX" 
                      className="bg-slate-700/50"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Settings */}
            <Card className="bg-slate-800/50 border-red-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  Advanced Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
                    <Archive className="w-4 h-4 mr-1" />
                    Backup Wallet
                  </Button>
                  <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Close Account
                  </Button>
                </div>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    These actions are permanent and cannot be undone. Please proceed with caution.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}