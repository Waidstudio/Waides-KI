import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  Plus, 
  ArrowUpDown, 
  Globe, 
  CreditCard,
  Smartphone, 
  Building, 
  Bitcoin,
  TrendingUp,
  RefreshCw,
  Eye,
  EyeOff,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  Settings,
  Copy,
  QrCode,
  Key,
  Send,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  PieChart,
  Activity,
  Lock,
  Unlock,
  History,
  CreditCard as CardIcon,
  Zap,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SmaiSikaWallet from '@/components/SmaiSikaWallet';
import ComprehensiveWallet from '@/components/ComprehensiveWallet';

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
  gateway?: string;
}

interface PaymentMethod {
  id: string;
  type: 'bank' | 'card' | 'mobile_money' | 'crypto' | 'digital_wallet';
  name: string;
  details: string;
  isVerified: boolean;
  isDefault: boolean;
  fees: { fixed: number; percentage: number };
  limits: { min: number; max: number; daily: number };
}

interface Portfolio {
  totalValue: number;
  currency: string;
  allocation: Array<{
    asset: string;
    amount: number;
    value: number;
    percentage: number;
    change24h: number;
  }>;
  performance: {
    day: number;
    week: number;
    month: number;
    year: number;
  };
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  whitelistEnabled: boolean;
  dailyLimits: {
    withdrawal: number;
    transfer: number;
  };
  sessionTimeout: number;
}

const ProfessionalWalletPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferCurrency, setTransferCurrency] = useState('USDT');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch wallet balance
  const { data: walletBalance, isLoading: balanceLoading } = useQuery<WalletBalance>({
    queryKey: ['/api/wallet/balance'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch transaction history
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/wallet/transactions'],
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch payment methods
  const { data: paymentMethods = [], isLoading: methodsLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/wallet/payment-methods'],
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // Fetch portfolio data
  const { data: portfolio } = useQuery<Portfolio>({
    queryKey: ['/api/wallet/portfolio'],
    refetchInterval: 30000
  });

  // Fetch security settings
  const { data: securitySettings } = useQuery<SecuritySettings>({
    queryKey: ['/api/wallet/security'],
    refetchInterval: 300000
  });

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async (data: { amount: number; currency: string; recipient: string; type: string }) => {
      return apiRequest('POST', '/api/wallet/transfer', data);
    },
    onSuccess: () => {
      toast({
        title: 'Transfer Initiated',
        description: 'Your transfer has been submitted for processing',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      setTransferAmount('');
      setRecipientAddress('');
    },
    onError: (error: any) => {
      toast({
        title: 'Transfer Failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  });

  const handleTransfer = () => {
    if (!transferAmount || !recipientAddress) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter amount and recipient address',
        variant: 'destructive',
      });
      return;
    }

    transferMutation.mutate({
      amount: parseFloat(transferAmount),
      currency: transferCurrency,
      recipient: recipientAddress,
      type: 'transfer'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdrawal': return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'transfer': return <Send className="h-4 w-4 text-blue-500" />;
      case 'trade': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'fee': return <DollarSign className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Professional Wallet</h1>
              <p className="text-gray-400">Manage your digital assets and trading funds</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <Shield className="w-3 h-3 mr-1" />
                Secured
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
                }}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Balance</p>
                    <div className="flex items-center space-x-2">
                      {showBalance ? (
                        <p className="text-2xl font-bold text-white">
                          ${walletBalance?.balance?.toLocaleString() || '0.00'}
                        </p>
                      ) : (
                        <p className="text-2xl font-bold text-white">••••••</p>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBalance(!showBalance)}
                        className="p-1 h-auto"
                      >
                        {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Wallet className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Available</p>
                    <p className="text-2xl font-bold text-green-400">
                      ${walletBalance?.available?.toLocaleString() || '0.00'}
                    </p>
                  </div>
                  <Unlock className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Locked</p>
                    <p className="text-2xl font-bold text-orange-400">
                      ${walletBalance?.locked?.toLocaleString() || '0.00'}
                    </p>
                  </div>
                  <Lock className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">24h Change</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      +{portfolio?.performance?.day || 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="transfer" className="data-[state=active]:bg-emerald-600">
              <Send className="w-4 h-4 mr-2" />
              Transfer
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="methods" className="data-[state=active]:bg-orange-600">
              <CardIcon className="w-4 h-4 mr-2" />
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="smaisika" className="data-[state=active]:bg-yellow-600">
              <Target className="w-4 h-4 mr-2" />
              SmaiSika
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-red-600">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Portfolio Allocation */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Portfolio Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {portfolio?.allocation?.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                          index === 0 ? 'from-blue-500 to-cyan-500' :
                          index === 1 ? 'from-emerald-500 to-green-500' :
                          index === 2 ? 'from-purple-500 to-violet-500' :
                          'from-orange-500 to-red-500'
                        }`} />
                        <div>
                          <p className="text-white font-medium">{asset.asset}</p>
                          <p className="text-sm text-gray-400">{asset.amount} units</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">${asset.value?.toLocaleString()}</p>
                        <p className={`text-sm ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Recent Activity
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('history')}>
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          {getTransactionIcon(tx.type)}
                          <div>
                            <p className="text-white font-medium capitalize">{tx.type}</p>
                            <p className="text-sm text-gray-400">{new Date(tx.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            tx.type === 'deposit' ? 'text-green-400' : 
                            tx.type === 'withdrawal' ? 'text-red-400' : 'text-white'
                          }`}>
                            {tx.type === 'deposit' ? '+' : '-'}${tx.amount}
                          </p>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(tx.status)}
                            <span className={`text-xs ${getStatusColor(tx.status)}`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart Placeholder */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Portfolio Performance
                  </div>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-24 bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1D">1D</SelectItem>
                      <SelectItem value="1W">1W</SelectItem>
                      <SelectItem value="1M">1M</SelectItem>
                      <SelectItem value="3M">3M</SelectItem>
                      <SelectItem value="1Y">1Y</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-600 rounded-lg">
                  <p className="text-gray-400">Portfolio performance chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfer Tab */}
          <TabsContent value="transfer" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 max-w-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Send className="w-5 h-5 mr-2" />
                  Send Funds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount" className="text-white">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency" className="text-white">Currency</Label>
                    <Select value={transferCurrency} onValueChange={setTransferCurrency}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="recipient" className="text-white">Recipient Address</Label>
                  <Input
                    id="recipient"
                    placeholder="Enter wallet address or email"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <span className="text-gray-300">Network Fee</span>
                  <span className="text-white">~$2.50</span>
                </div>

                <Button
                  onClick={handleTransfer}
                  disabled={transferMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {transferMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Send Transfer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transaction History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getTransactionIcon(tx.type)}
                        <div>
                          <p className="text-white font-medium flex items-center space-x-2">
                            <span className="capitalize">{tx.type}</span>
                            {getStatusIcon(tx.status)}
                          </p>
                          <p className="text-sm text-gray-400">{tx.description}</p>
                          <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          tx.type === 'deposit' ? 'text-green-400' : 
                          tx.type === 'withdrawal' ? 'text-red-400' : 'text-white'
                        }`}>
                          {tx.type === 'deposit' ? '+' : '-'}${tx.amount} {tx.currency}
                        </p>
                        {tx.fee && (
                          <p className="text-xs text-gray-400">Fee: ${tx.fee}</p>
                        )}
                        {tx.txHash && (
                          <Button variant="ghost" size="sm" className="p-0 h-auto text-xs text-blue-400">
                            View on Explorer
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="methods" className="space-y-6">
            <ComprehensiveWallet />
          </TabsContent>

          {/* SmaiSika Tab */}
          <TabsContent value="smaisika" className="space-y-6">
            <SmaiSikaWallet />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 max-w-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-400">Add an extra layer of security</p>
                  </div>
                  <Badge variant={securitySettings?.twoFactorEnabled ? "default" : "outline"}>
                    {securitySettings?.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Biometric Authentication</p>
                    <p className="text-sm text-gray-400">Use fingerprint or face ID</p>
                  </div>
                  <Badge variant={securitySettings?.biometricEnabled ? "default" : "outline"}>
                    {securitySettings?.biometricEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Withdrawal Whitelist</p>
                    <p className="text-sm text-gray-400">Only allow withdrawals to pre-approved addresses</p>
                  </div>
                  <Badge variant={securitySettings?.whitelistEnabled ? "default" : "outline"}>
                    {securitySettings?.whitelistEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <Separator className="bg-slate-600" />

                <div className="space-y-3">
                  <h3 className="text-white font-medium">Daily Limits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-sm text-gray-400">Withdrawal Limit</p>
                      <p className="text-lg font-bold text-white">
                        ${securitySettings?.dailyLimits?.withdrawal?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-sm text-gray-400">Transfer Limit</p>
                      <p className="text-lg font-bold text-white">
                        ${securitySettings?.dailyLimits?.transfer?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setShowSecurityDialog(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Security Settings Dialog */}
      <Dialog open={showSecurityDialog} onOpenChange={setShowSecurityDialog}>
        <DialogContent className="max-w-md bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Security Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Security settings require additional verification to modify.
              </AlertDescription>
            </Alert>
            
            <Button className="w-full" onClick={() => setShowSecurityDialog(false)}>
              Verify Identity
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfessionalWalletPage;