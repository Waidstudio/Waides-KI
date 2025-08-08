import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Settings,
  History,
  Wallet,
  Copy,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  DollarSign,
  Eye,
  EyeOff,
  Filter,
  Search,
  Download,
  Upload,
  MoreHorizontal,
  ExternalLink,
  Zap,
  Bot,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSmaiWallet } from '@/contexts/SmaiWalletContext';

interface WalletBalance {
  balance: number;
  currency: string;
  available: number;
  locked: number;
  pending: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'trade' | 'fee';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description: string;
  fee?: number;
  txHash?: string;
}

const ProfessionalWalletPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [conversionAmount, setConversionAmount] = useState('');
  const [botFundingAmount, setBotFundingAmount] = useState('');
  const [selectedBot, setSelectedBot] = useState('');
  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const [showBotFundingDialog, setShowBotFundingDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use enhanced SmaiWallet context for KonsMesh integration
  const { 
    walletData: smaiWalletData, 
    isLoading: isSmaiLoading,
    refreshWallet: refreshSmaiWallet,
    convertToSmaiSika,
    fundBot,
    switchAccountMode,
    isConverting,
    isFunding,
    isSwitching
  } = useSmaiWallet();

  // Legacy wallet data for backward compatibility
  const { data: balance } = useQuery<WalletBalance>({
    queryKey: ['/api/wallet/balance'],
    refetchInterval: 30000,
    enabled: !smaiWalletData?.wallet // Only fetch if KonsMesh data is unavailable
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/wallet/transactions'],
    refetchInterval: 60000
  });

  // Use KonsMesh wallet data if available, otherwise fallback to legacy
  const currentBalance = smaiWalletData ? {
    balance: smaiWalletData.hasConverted ? smaiWalletData.smaiBalance : smaiWalletData.localBalance,
    currency: smaiWalletData.hasConverted ? 'SS' : smaiWalletData.localCurrency,
    available: smaiWalletData.hasConverted ? smaiWalletData.smaiBalance : smaiWalletData.localBalance - 1500,
    locked: 1500,
    pending: 250
  } : balance;

  const transferMutation = useMutation({
    mutationFn: (data: { amount: number; currency: string; recipient: string }) =>
      apiRequest('/api/wallet/transfer', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: 'Transfer completed successfully' });
      setTransferAmount('');
      setTransferRecipient('');
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
    }
  });

  // KonsMesh wallet functions
  const handleConvertToSmaiSika = async () => {
    try {
      const amount = parseFloat(conversionAmount);
      if (!amount || amount <= 0) {
        toast({ title: 'Invalid amount', variant: 'destructive' });
        return;
      }

      await convertToSmaiSika({ usdAmount: amount, rate: 1.0 });
      toast({ 
        title: 'Conversion successful', 
        description: `Converted $${amount} to ${amount} SmaiSika` 
      });
      setConversionAmount('');
      setShowConversionDialog(false);
      refreshSmaiWallet();
    } catch (error: any) {
      toast({ 
        title: 'Conversion failed', 
        description: error.error || 'Please try again',
        variant: 'destructive' 
      });
    }
  };

  const handleFundBot = async () => {
    try {
      const amount = parseFloat(botFundingAmount);
      if (!amount || amount <= 0 || !selectedBot) {
        toast({ title: 'Invalid amount or bot selection', variant: 'destructive' });
        return;
      }

      await fundBot({ botId: selectedBot, smaiSikaAmount: amount });
      toast({ 
        title: 'Bot funding successful', 
        description: `Funded ${selectedBot} with ${amount} SmaiSika` 
      });
      setBotFundingAmount('');
      setSelectedBot('');
      setShowBotFundingDialog(false);
      refreshSmaiWallet();
    } catch (error: any) {
      toast({ 
        title: 'Bot funding failed', 
        description: error.error || 'Please try again',
        variant: 'destructive' 
      });
    }
  };

  const handleSwitchAccountMode = async (mode: 'demo' | 'real') => {
    try {
      await switchAccountMode(mode);
      toast({ 
        title: 'Account mode switched', 
        description: `Switched to ${mode} mode` 
      });
      refreshSmaiWallet();
    } catch (error: any) {
      toast({ 
        title: 'Mode switch failed', 
        description: error.error || 'Please try again',
        variant: 'destructive' 
      });
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'USDT' ? 'USD' : currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-500 bg-emerald-500/10';
      case 'pending': return 'text-amber-500 bg-amber-500/10';
      case 'failed': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-4 h-4 text-emerald-500" />;
      case 'withdrawal': return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'transfer': return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'trade': return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default: return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <div className="max-w-[1400px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Wallet</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your trading account and portfolio
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="text-slate-600 dark:text-slate-400"
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Deposit
            </Button>
          </div>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Balance</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {showBalance ? (currentBalance ? formatCurrency(currentBalance.balance, currentBalance.currency) : '$0.00') : '••••••'}
                  </p>
                  {smaiWalletData?.wallet && (
                    <Badge variant="outline" className="text-xs">
                      {smaiWalletData.wallet.accountMode === 'demo' ? '🎮 Demo' : '💰 Real'} • KonsMesh
                    </Badge>
                  )}
                </div>
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">USD Balance</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {showBalance ? `$${smaiWalletData?.localBalance?.toFixed(2) || '0.00'}` : '••••••'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">SmaiSika (SS)</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {showBalance ? `${smaiWalletData?.smaiBalance?.toFixed(4) || '0.0000'} SS` : '••••••'}
                  </p>
                  {smaiWalletData?.hasConverted && (
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Converted
                    </Badge>
                  )}
                </div>
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">In Orders</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {showBalance ? (balance ? formatCurrency(balance.locked) : '$0.00') : '••••••'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {showBalance ? (balance ? formatCurrency(balance.pending) : '$0.00') : '••••••'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900/20 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-900 h-12">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
              Overview
            </TabsTrigger>
            <TabsTrigger value="transfer" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
              Transfer
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                    <CardTitle className="text-lg font-semibold">Portfolio Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total P&L</span>
                        <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">+$2,847.50</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Today's P&L</span>
                        <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">+$127.34</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Return</span>
                        <span className="text-lg font-semibold text-slate-900 dark:text-white">+12.4%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">KonsMesh Actions</CardTitle>
                    {smaiWalletData?.wallet && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSwitchAccountMode(smaiWalletData.wallet!.accountMode === 'demo' ? 'real' : 'demo')}
                          disabled={isSwitching}
                          className="text-xs"
                        >
                          {smaiWalletData.wallet.accountMode === 'demo' ? (
                            <><ToggleRight className="w-3 h-3 mr-1" /> Real</>
                          ) : (
                            <><ToggleLeft className="w-3 h-3 mr-1" /> Demo</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <Dialog open={showConversionDialog} onOpenChange={setShowConversionDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Zap className="w-4 h-4 mr-3" />
                        Convert to SmaiSika
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Convert USD to SmaiSika</DialogTitle>
                        <DialogDescription>
                          Convert your USD balance to SmaiSika tokens for bot trading
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="conversion-amount">Amount (USD)</Label>
                          <Input
                            id="conversion-amount"
                            type="number"
                            placeholder="0.00"
                            value={conversionAmount}
                            onChange={(e) => setConversionAmount(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowConversionDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleConvertToSmaiSika} disabled={isConverting}>
                            {isConverting ? 'Converting...' : 'Convert'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showBotFundingDialog} onOpenChange={setShowBotFundingDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Bot className="w-4 h-4 mr-3" />
                        Fund Trading Bot
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Fund Trading Bot</DialogTitle>
                        <DialogDescription>
                          Allocate SmaiSika tokens to a trading bot
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="bot-select">Select Bot</Label>
                          <Select value={selectedBot} onValueChange={setSelectedBot}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a bot" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="waidbot_alpha">WaidBot Alpha</SelectItem>
                              <SelectItem value="waidbot_pro_beta">WaidBot Pro Beta</SelectItem>
                              <SelectItem value="autonomous_gamma">Autonomous Gamma</SelectItem>
                              <SelectItem value="full_engine_omega">Full Engine Omega</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bot-funding-amount">Amount (SmaiSika)</Label>
                          <Input
                            id="bot-funding-amount"
                            type="number"
                            placeholder="0.0000"
                            value={botFundingAmount}
                            onChange={(e) => setBotFundingAmount(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowBotFundingDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleFundBot} disabled={isFunding}>
                            {isFunding ? 'Funding...' : 'Fund Bot'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="w-full justify-start" onClick={refreshSmaiWallet}>
                    <RefreshCw className="w-4 h-4 mr-3" />
                    Refresh Wallet
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="w-4 h-4 mr-3" />
                    Trading Terminal
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transfer" className="space-y-6">
            <div className="max-w-md mx-auto">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                  <CardTitle className="text-lg font-semibold">Send Transfer</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="text-lg font-medium"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Currency
                    </Label>
                    <Select defaultValue="USDT">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recipient" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Recipient Address
                    </Label>
                    <Input
                      id="recipient"
                      placeholder="Enter wallet address or email"
                      value={transferRecipient}
                      onChange={(e) => setTransferRecipient(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="w-full" 
                    disabled={!transferAmount || !transferRecipient || transferMutation.isPending}
                    onClick={() => transferMutation.mutate({
                      amount: parseFloat(transferAmount),
                      currency: 'USDT',
                      recipient: transferRecipient
                    })}
                  >
                    {transferMutation.isPending ? 'Processing...' : 'Send Transfer'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Transaction History</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                      <tr>
                        <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Type</th>
                        <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Amount</th>
                        <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Status</th>
                        <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Date</th>
                        <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400">Details</th>
                        <th className="w-12 p-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {transactions?.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {getTypeIcon(tx.type)}
                              <div>
                                <div className="font-medium text-slate-900 dark:text-white capitalize">
                                  {tx.type}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  {tx.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {formatCurrency(tx.amount, tx.currency)}
                            </div>
                            {tx.fee && (
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                Fee: {formatCurrency(tx.fee)}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge className={`${getStatusColor(tx.status)} border-0 capitalize`}>
                              {tx.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {formatDateTime(tx.timestamp)}
                            </div>
                          </td>
                          <td className="p-4">
                            {tx.txHash && (
                              <Button variant="ghost" size="sm">
                                <Copy className="w-4 h-4 mr-2" />
                                Hash
                              </Button>
                            )}
                          </td>
                          <td className="p-4">
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                  <CardTitle className="text-lg font-semibold">Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Two-Factor Authentication</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security</div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Withdrawal Whitelist</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Restrict withdrawals to approved addresses</div>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">API Access</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Manage API keys and permissions</div>
                    </div>
                    <Button variant="outline" size="sm">View Keys</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="border-b border-slate-200 dark:border-slate-800">
                  <CardTitle className="text-lg font-semibold">Preferences</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Default Currency</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Primary display currency</div>
                    </div>
                    <Select defaultValue="USD">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Email Notifications</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Transaction alerts and updates</div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfessionalWalletPage;