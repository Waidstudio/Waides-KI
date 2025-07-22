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
  Target,
  Users,
  Database,
  Monitor,
  Layers,
  Network
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletBalance {
  balance: number;
  currency: string;
  available: number;
  locked: number;
  pending: number;
}

interface Portfolio {
  totalValue: number;
  currency: string;
  allocation: {
    asset: string;
    amount: number;
    value: number;
    percentage: number;
    change24h: number;
  }[];
  performance: {
    day: number;
    week: number;
    month: number;
    year: number;
  };
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
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferCurrency, setTransferCurrency] = useState('USDT');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch wallet balance
  const { data: balance, isLoading: balanceLoading } = useQuery<WalletBalance>({
    queryKey: ['/api/wallet/balance'],
    refetchInterval: 30000
  });

  // Fetch portfolio data
  const { data: portfolio, isLoading: portfolioLoading } = useQuery<Portfolio>({
    queryKey: ['/api/wallet/portfolio'],
    refetchInterval: 30000
  });

  // Fetch transaction history
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/wallet/transactions'],
    refetchInterval: 60000
  });

  // Fetch security settings
  const { data: security, isLoading: securityLoading } = useQuery<SecuritySettings>({
    queryKey: ['/api/wallet/security']
  });

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: (data: { amount: number; currency: string; recipient: string; type: string }) =>
      apiRequest('/api/wallet/transfer', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: 'Transfer initiated successfully' });
      setTransferAmount('');
      setTransferRecipient('');
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
    },
    onError: () => {
      toast({ title: 'Transfer failed', variant: 'destructive' });
    }
  });

  const handleTransfer = () => {
    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0 || !transferRecipient) {
      toast({ title: 'Please fill in all fields correctly', variant: 'destructive' });
      return;
    }
    
    transferMutation.mutate({
      amount,
      currency: transferCurrency,
      recipient: transferRecipient,
      type: 'internal'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'USDT' ? 'USD' : currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 pt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Professional Wallet</h1>
              <p className="text-gray-400 text-lg">Comprehensive asset management and trading portfolio</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="text-gray-400 hover:text-white"
              >
                {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <Activity className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Balance</p>
                    <p className="text-2xl font-bold text-white">
                      {showBalance ? (balance ? formatCurrency(balance.balance) : '$0.00') : '••••••'}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-400" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
                    <span className="text-emerald-400">+5.2% today</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Available</p>
                    <p className="text-2xl font-bold text-white">
                      {showBalance ? (balance ? formatCurrency(balance.available) : '$0.00') : '••••••'}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <Progress value={85} className="mt-4 h-2" />
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Locked</p>
                    <p className="text-2xl font-bold text-white">
                      {showBalance ? (balance ? formatCurrency(balance.locked) : '$0.00') : '••••••'}
                    </p>
                  </div>
                  <Lock className="w-8 h-8 text-orange-400" />
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  In active trades
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Pending</p>
                    <p className="text-2xl font-bold text-white">
                      {showBalance ? (balance ? formatCurrency(balance.pending) : '$0.00') : '••••••'}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  Processing
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Tabs Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 h-14 mb-8">
            <TabsTrigger value="overview" className="text-sm data-[state=active]:bg-blue-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Portfolio Overview
            </TabsTrigger>
            <TabsTrigger value="transfer" className="text-sm data-[state=active]:bg-purple-600">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Transfer & Send
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-sm data-[state=active]:bg-emerald-600">
              <History className="w-4 h-4 mr-2" />
              Transaction History
            </TabsTrigger>
            <TabsTrigger value="security" className="text-sm data-[state=active]:bg-orange-600">
              <Shield className="w-4 h-4 mr-2" />
              Security & Settings
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-sm data-[state=active]:bg-red-600">
              <Settings className="w-4 h-4 mr-2" />
              Advanced Features
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Asset Allocation Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Asset Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {portfolio?.allocation.map((asset, index) => (
                    <div key={asset.asset} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          index === 0 ? 'bg-blue-400' : 
                          index === 1 ? 'bg-emerald-400' : 
                          'bg-purple-400'
                        }`} />
                        <div>
                          <p className="text-white font-medium">{asset.asset}</p>
                          <p className="text-gray-400 text-sm">{asset.amount} {asset.asset}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{formatCurrency(asset.value)}</p>
                        <div className="flex items-center">
                          <span className="text-gray-400 text-sm mr-2">{asset.percentage}%</span>
                          <span className={`text-sm ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance Chart */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {portfolio && Object.entries(portfolio.performance).map(([period, value]) => (
                      <div key={period} className="flex items-center justify-between">
                        <span className="text-gray-400 capitalize">{period}</span>
                        <div className="flex items-center">
                          <span className={`font-medium ${value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {value >= 0 ? '+' : ''}{value}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transfer Tab */}
          <TabsContent value="transfer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Send className="w-5 h-5 mr-2" />
                    Send Funds
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Amount</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Currency</Label>
                    <Select value={transferCurrency} onValueChange={setTransferCurrency}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Recipient</Label>
                    <Input
                      placeholder="Email or wallet address"
                      value={transferRecipient}
                      onChange={(e) => setTransferRecipient(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button 
                    onClick={handleTransfer}
                    disabled={transferMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {transferMutation.isPending ? 'Processing...' : 'Send Transfer'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start border-slate-600 text-gray-300 hover:bg-slate-700">
                    <Download className="w-4 h-4 mr-2" />
                    Deposit Funds
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-slate-600 text-gray-300 hover:bg-slate-700">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Withdraw to Bank
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-slate-600 text-gray-300 hover:bg-slate-700">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Convert Currency
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-slate-600 text-gray-300 hover:bg-slate-700">
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR Code
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions?.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                          tx.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' :
                          tx.type === 'withdrawal' ? 'bg-red-500/20 text-red-400' :
                          tx.type === 'transfer' ? 'bg-blue-500/20 text-blue-400' :
                          tx.type === 'trade' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> :
                           tx.type === 'withdrawal' ? <ArrowUpRight className="w-5 h-5" /> :
                           tx.type === 'transfer' ? <ArrowUpDown className="w-5 h-5" /> :
                           tx.type === 'trade' ? <BarChart3 className="w-5 h-5" /> :
                           <DollarSign className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-white font-medium capitalize">{tx.type}</p>
                          <p className="text-gray-400 text-sm">{tx.description}</p>
                          <p className="text-gray-500 text-xs">{formatDate(tx.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          tx.type === 'deposit' || tx.type === 'trade' ? 'text-emerald-400' : 'text-white'
                        }`}>
                          {tx.type === 'deposit' || tx.type === 'trade' ? '+' : ''}
                          {formatCurrency(tx.amount, tx.currency)}
                        </p>
                        <Badge variant={
                          tx.status === 'completed' ? 'default' :
                          tx.status === 'pending' ? 'secondary' : 'destructive'
                        } className="text-xs">
                          {tx.status}
                        </Badge>
                        {tx.fee && (
                          <p className="text-gray-400 text-xs">Fee: {formatCurrency(tx.fee)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Two-Factor Authentication</p>
                      <p className="text-gray-400 text-sm">Enhanced account security</p>
                    </div>
                    <Badge className={security?.twoFactorEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}>
                      {security?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <Separator className="bg-slate-600" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Biometric Login</p>
                      <p className="text-gray-400 text-sm">Fingerprint/Face ID</p>
                    </div>
                    <Badge className={security?.biometricEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}>
                      {security?.biometricEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <Separator className="bg-slate-600" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Address Whitelist</p>
                      <p className="text-gray-400 text-sm">Restrict withdrawals</p>
                    </div>
                    <Badge className={security?.whitelistEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}>
                      {security?.whitelistEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    Daily Limits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">Withdrawal Limit</span>
                      <span className="text-white font-medium">
                        {security ? formatCurrency(security.dailyLimits.withdrawal) : '$0'}
                      </span>
                    </div>
                    <Progress value={30} className="h-2" />
                    <p className="text-gray-400 text-xs mt-1">30% used today</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">Transfer Limit</span>
                      <span className="text-white font-medium">
                        {security ? formatCurrency(security.dailyLimits.transfer) : '$0'}
                      </span>
                    </div>
                    <Progress value={15} className="h-2" />
                    <p className="text-gray-400 text-xs mt-1">15% used today</p>
                  </div>
                  <div className="pt-4 border-t border-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Session Timeout</span>
                      <span className="text-white font-medium">
                        {security?.sessionTimeout || 30} minutes
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Features Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Database className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">API Access</h3>
                  <p className="text-gray-400 mb-4">Programmatic trading and wallet management</p>
                  <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
                    Manage API Keys
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Network className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">DeFi Integration</h3>
                  <p className="text-gray-400 mb-4">Connect to decentralized protocols</p>
                  <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                    Explore DeFi
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Monitor className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-400 mb-4">Advanced portfolio insights</p>
                  <Button variant="outline" className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10">
                    View Analytics
                  </Button>
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