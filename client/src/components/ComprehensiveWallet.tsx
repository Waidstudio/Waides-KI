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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Wallet, TrendingUp, History, ArrowRightLeft, Plus, DollarSign, Shield, Zap, Heart, Lock, Eye,
  CreditCard, Coins, BarChart3, Settings, Bell, Gift, Smartphone, Globe, TrendingDown,
  PiggyBank, Repeat, Send, Download, Star, Award, Target, ChevronRight, Activity,
  Banknote, Bitcoin, Users, Network, Fingerprint, AlertTriangle, CheckCircle,
  Calendar, Clock, RefreshCw, Archive, Trash2, Filter, Search, LineChart
} from 'lucide-react';

// Types and interfaces
interface AfricanPaymentProvider {
  id: number;
  country: string;
  countryCode: string;
  provider: string;
  providerType: string;
  currency: string;
  minAmount: string;
  maxAmount: string;
  fees: string;
  processingTime: string;
  logo: string;
  description: string;
  isActive: boolean;
}

interface PaymentMethod {
  id: number;
  methodType: string;
  provider: string;
  country: string;
  currency: string;
  accountIdentifier: string;
  displayName: string;
  isActive: boolean;
  isVerified: boolean;
}

interface WalletTransaction {
  id: number;
  transactionType: string;
  amount: string;
  currency: string;
  localAmount?: string;
  localCurrency?: string;
  status: string;
  description?: string;
  createdAt: string;
  processedAt?: string;
}

interface CountryInfo {
  code: string;
  name: string;
  currency: string;
  providers: number;
}

export default function ComprehensiveWallet() {
  const { smaiBalance, isLoading: walletLoading } = useSmaiWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('NG');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isAddPaymentMethodOpen, setIsAddPaymentMethodOpen] = useState(false);
  const [fundingMethod, setFundingMethod] = useState('mobile');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  
  // Currency conversion state
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [convertAmount, setConvertAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('NGN');
  const [toCurrency, setToCurrency] = useState('SS');

  // Fetch African payment providers
  const { data: africanProviders = [], isLoading: providersLoading } = useQuery({
    queryKey: ['/api/wallet/african-providers'],
    queryFn: async () => {
      const result = await apiRequest('GET', '/api/wallet/african-providers');
      return Array.isArray(result) ? result : [];
    },
  });

  // Fetch user payment methods
  const { data: paymentMethods = [], isLoading: methodsLoading } = useQuery({
    queryKey: ['/api/wallet/payment-methods'],
    queryFn: async () => {
      const result = await apiRequest('GET', '/api/wallet/payment-methods');
      return Array.isArray(result) ? result : [];
    },
  });

  // Fetch wallet transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/wallet/transactions'],
    queryFn: async () => {
      const result = await apiRequest('GET', '/api/wallet/transactions');
      return Array.isArray(result) ? result : [];
    },
  });

  // Fetch supported countries
  const { data: supportedCountries = [], isLoading: countriesLoading } = useQuery({
    queryKey: ['/api/wallet/countries'],
    queryFn: async () => {
      const result = await apiRequest('GET', '/api/wallet/countries');
      return Array.isArray(result) ? result : [];
    },
  });

  // Add payment method mutation
  const addPaymentMethodMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/wallet/payment-methods', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/payment-methods'] });
      toast({
        title: "Payment Method Added",
        description: "Your mobile money account has been successfully added.",
      });
      setIsAddPaymentMethodOpen(false);
      setPhoneNumber('');
      setSelectedProvider('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add payment method",
        variant: "destructive",
      });
    },
  });

  // Process deposit mutation
  const processDepositMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/wallet/deposit', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      toast({
        title: "Deposit Initiated",
        description: "Your deposit is being processed. It should reflect in your wallet within 2-5 minutes.",
      });
      setIsAddFundsOpen(false);
      setDepositAmount('');
    },
    onError: (error: any) => {
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to process deposit",
        variant: "destructive",
      });
    },
  });

  // Process withdrawal mutation
  const processWithdrawalMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/wallet/withdraw', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      toast({
        title: "Withdrawal Initiated",
        description: "Your withdrawal is being processed. Funds will be sent to your mobile money account within 5-10 minutes.",
      });
      setWithdrawAmount('');
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  // Process conversion mutation
  const processConversionMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/wallet/convert', data),
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      toast({
        title: "Conversion Successful",
        description: `Converted ${result.fromCurrency} ${result.fromAmount} to ${result.toCurrency} ${result.convertedAmount.toFixed(2)}`,
      });
      setIsConvertOpen(false);
      setConvertAmount('');
    },
    onError: (error: any) => {
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to process conversion",
        variant: "destructive",
      });
    },
  });

  // Get providers for selected country
  const countryProviders = Array.isArray(africanProviders) 
    ? africanProviders.filter((p: AfricanPaymentProvider) => 
        p.countryCode === selectedCountry && p.isActive
      )
    : [];

  // Get selected provider details
  const providerDetails = countryProviders.find((p: AfricanPaymentProvider) => 
    p.provider === selectedProvider
  );

  // Handle add payment method
  const handleAddPaymentMethod = async () => {
    if (!phoneNumber || !selectedProvider || !selectedCountry) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const providerInfo = Array.isArray(countryProviders) 
      ? countryProviders.find(p => p.provider === selectedProvider) 
      : null;
    if (!providerInfo) return;

    const paymentMethodData = {
      methodType: 'mobile_money',
      provider: selectedProvider,
      country: providerInfo.country,
      currency: providerInfo.currency,
      accountIdentifier: phoneNumber,
      displayName: `${selectedProvider} - ${phoneNumber}`,
    };

    addPaymentMethodMutation.mutate(paymentMethodData);
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || !selectedPaymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please select amount and payment method",
        variant: "destructive",
      });
      return;
    }

    const depositData = {
      amount: depositAmount,
      paymentMethodId: selectedPaymentMethod.id,
      localAmount: depositAmount,
      localCurrency: selectedPaymentMethod.currency,
    };

    processDepositMutation.mutate(depositData);
  };

  // Handle withdrawal
  const handleWithdrawal = async () => {
    if (!withdrawAmount || !selectedPaymentMethod) {
      toast({
        title: "Missing Information",
        description: "Please select amount and payment method",
        variant: "destructive",
      });
      return;
    }

    const withdrawalData = {
      amount: withdrawAmount,
      paymentMethodId: selectedPaymentMethod.id,
      localAmount: withdrawAmount,
      localCurrency: selectedPaymentMethod.currency,
    };

    processWithdrawalMutation.mutate(withdrawalData);
  };

  const formatCurrency = (amount: string | number, currency: string = 'USD') => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'NGN': '₦',
      'KES': 'KSh',
      'GHS': '₵',
      'ZAR': 'R',
      'UGX': 'UGX',
      'TZS': 'TSh',
      'RWF': 'RWF',
      'ZMW': 'ZK',
      'BWP': 'P',
      'MWK': 'MK'
    };
    return `${symbols[currency] || currency} ${Number(amount).toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (walletLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            SmaiSika Wallet
          </h1>
          <p className="text-gray-400 mt-2">
            Comprehensive African payment integration with next-generation features
          </p>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">SmaiSika Balance</p>
                  <p className="text-2xl font-bold text-white">ꠄ{smaiBalance}</p>
                </div>
                <Wallet className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Value (USD)</p>
                  <p className="text-2xl font-bold text-white">${(Number(smaiBalance) * 1.2).toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">24h Change</p>
                  <p className="text-2xl font-bold text-green-400">+5.2%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Methods</p>
                  <p className="text-2xl font-bold text-white">{paymentMethods.length}</p>
                </div>
                <Smartphone className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Funds to Your Wallet</DialogTitle>
              </DialogHeader>
              
              <Tabs value={fundingMethod} onValueChange={setFundingMethod} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                  <TabsTrigger value="mobile" className="data-[state=active]:bg-purple-600">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Mobile Money
                  </TabsTrigger>
                  <TabsTrigger value="bank" className="data-[state=active]:bg-purple-600">
                    <Banknote className="w-4 h-4 mr-2" />
                    Bank Transfer
                  </TabsTrigger>
                  <TabsTrigger value="crypto" className="data-[state=active]:bg-purple-600">
                    <Bitcoin className="w-4 h-4 mr-2" />
                    Cryptocurrency
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="mobile" className="space-y-4">
                  {paymentMethods.length === 0 ? (
                    <Alert className="bg-yellow-900 border-yellow-700">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        No mobile money accounts found. Please add a payment method first.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Select Payment Method</Label>
                        <Select onValueChange={(value) => {
                          const method = paymentMethods.find((m: PaymentMethod) => m.id.toString() === value);
                          setSelectedPaymentMethod(method || null);
                        }}>
                          <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue placeholder="Choose your mobile money account" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method: PaymentMethod) => (
                              <SelectItem key={method.id} value={method.id.toString()}>
                                <div className="flex items-center space-x-2">
                                  <span>{method.provider}</span>
                                  <span className="text-gray-400">({method.accountIdentifier})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Amount ({selectedPaymentMethod?.currency || 'Currency'})</Label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>

                      {selectedPaymentMethod && (
                        <div className="p-4 bg-gray-800 rounded-lg">
                          <h4 className="font-semibold mb-2">Transaction Details</h4>
                          <div className="space-y-1 text-sm text-gray-400">
                            <div className="flex justify-between">
                              <span>Provider:</span>
                              <span>{selectedPaymentMethod.provider}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Account:</span>
                              <span>{selectedPaymentMethod.accountIdentifier}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Processing Time:</span>
                              <span>2-5 minutes</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <Button 
                        onClick={handleDeposit}
                        disabled={!depositAmount || !selectedPaymentMethod || processDepositMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {processDepositMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Deposit Funds
                      </Button>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="bank" className="space-y-4">
                  <Alert className="bg-blue-900 border-blue-700">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Bank transfer functionality will be available soon. Currently supporting mobile money payments.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="crypto" className="space-y-4">
                  <Alert className="bg-blue-900 border-blue-700">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Cryptocurrency deposits will be available soon. Currently supporting mobile money payments.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddPaymentMethodOpen} onOpenChange={setIsAddPaymentMethodOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                <CreditCard className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Add Mobile Money Account</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCountries.map((country: CountryInfo) => (
                        <SelectItem key={country.code} value={country.code}>
                          <div className="flex items-center space-x-2">
                            <span>{country.name}</span>
                            <span className="text-gray-400">({country.providers} providers)</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mobile Money Provider</Label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryProviders.map((provider: AfricanPaymentProvider) => (
                        <SelectItem key={provider.id} value={provider.provider}>
                          <div className="flex items-center space-x-2">
                            <span>{provider.logo}</span>
                            <span>{provider.provider}</span>
                            <span className="text-gray-400">({provider.currency})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="Enter your mobile money number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                {providerDetails && (
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <h4 className="font-semibold mb-2">{providerDetails.provider} Details</h4>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div className="flex justify-between">
                        <span>Currency:</span>
                        <span>{providerDetails.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Amount:</span>
                        <span>{formatCurrency(providerDetails.minAmount, providerDetails.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Amount:</span>
                        <span>{formatCurrency(providerDetails.maxAmount, providerDetails.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing:</span>
                        <span>{providerDetails.processingTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fees:</span>
                        <span>{(Number(providerDetails.fees) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleAddPaymentMethod}
                  disabled={!phoneNumber || !selectedProvider || addPaymentMethodMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {addPaymentMethodMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Payment Method
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
            <Send className="w-4 h-4 mr-2" />
            Withdraw
          </Button>

          <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Exchange
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-900">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              <Eye className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-purple-600">
              <History className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="methods" className="data-[state=active]:bg-purple-600">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <History className="w-5 h-5 mr-2" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : transactions.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No transactions yet</p>
                  ) : (
                    <div className="space-y-4">
                      {(transactions || []).slice(0, 5).map((transaction: WalletTransaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(transaction.status)}`} />
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-gray-400">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${transaction.transactionType === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                              {transaction.transactionType === 'deposit' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Smartphone className="w-5 h-5 mr-2" />
                    Active Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {methodsLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No payment methods added</p>
                      <Button 
                        onClick={() => setIsAddPaymentMethodOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Add Payment Method
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paymentMethods.map((method: PaymentMethod) => (
                        <div key={method.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Smartphone className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="font-medium">{method.provider}</p>
                              <p className="text-sm text-gray-400">{method.accountIdentifier}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={method.isVerified ? "default" : "secondary"}>
                              {method.isVerified ? "Verified" : "Pending"}
                            </Badge>
                            <span className="text-sm text-gray-400">{method.currency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Supported Countries */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Supported African Countries & Providers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {countriesLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-700 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {supportedCountries.map((country: CountryInfo) => (
                      <div key={country.code} className="p-4 bg-gray-800 rounded-lg text-center">
                        <div className="text-2xl mb-2">
                          {country.code === 'NG' && '🇳🇬'}
                          {country.code === 'KE' && '🇰🇪'}
                          {country.code === 'GH' && '🇬🇭'}
                          {country.code === 'ZA' && '🇿🇦'}
                          {country.code === 'UG' && '🇺🇬'}
                          {country.code === 'TZ' && '🇹🇿'}
                          {country.code === 'RW' && '🇷🇼'}
                          {country.code === 'ZM' && '🇿🇲'}
                          {country.code === 'BW' && '🇧🇼'}
                          {country.code === 'MW' && '🇲🇼'}
                        </div>
                        <p className="font-medium text-sm">{country.name}</p>
                        <p className="text-xs text-gray-400">{country.providers} providers</p>
                        <p className="text-xs text-purple-400">{country.currency}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs would be implemented similarly */}
          <TabsContent value="transactions">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Transaction history will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methods">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Payment Methods Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Payment method management will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Wallet Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Analytics and insights will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Wallet Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Wallet settings and preferences will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}