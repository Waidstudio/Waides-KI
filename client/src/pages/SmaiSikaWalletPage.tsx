import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Gateway {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank_transfer' | 'crypto' | 'card' | 'digital_wallet';
  countries: string[];
  currencies: string[];
  fees: { fixed: number; percentage: number };
  processingTime: string;
  isActive: boolean;
}

interface Country {
  code: string;
  name: string;
  gateways: number;
}

interface FXRate {
  currency: string;
  rate: number;
  symbol: string;
  lastUpdated: string;
}

interface LocalBalance {
  currency: string;
  amount: number;
  symbol: string;
}

interface SmaiSikaBalance {
  balance: number;
  symbol: 'SS';
}

interface Transaction {
  id: string;
  type: 'deposit' | 'conversion' | 'withdrawal';
  amount: string;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  date: string;
  description: string;
  gateway?: string;
}

export default function SmaiSikaWalletPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [accountDetails, setAccountDetails] = useState<string>('');
  const [conversionAmount, setConversionAmount] = useState<string>('');
  const [conversionCurrency, setConversionCurrency] = useState<string>('');
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [depositDialogOpen, setDepositDialogOpen] = useState<boolean>(false);
  const [conversionDialogOpen, setConversionDialogOpen] = useState<boolean>(false);

  // Fetch global countries
  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ['/api/wallet/global-countries'],
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Fetch gateways for selected country
  const { data: gateways = [] } = useQuery<Gateway[]>({
    queryKey: ['/api/wallet/gateways', selectedCountry],
    enabled: !!selectedCountry,
    staleTime: 1000 * 60 * 5
  });

  // Fetch FX rates
  const { data: fxData } = useQuery({
    queryKey: ['/api/wallet/fx-rates'],
    staleTime: 1000 * 60 * 2 // 2 minutes
  });

  // Fetch wallet balance
  const { data: walletBalance } = useQuery({
    queryKey: ['/api/wallet/balance'],
    staleTime: 1000 * 30 // 30 seconds
  });

  // Fetch transaction history
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/wallet/transactions'],
    staleTime: 1000 * 30
  });

  // Process deposit mutation
  const processDepositMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/wallet/deposit', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Deposit Initiated",
          description: `Your ${depositAmount} deposit has been started successfully.`,
        });
        setDepositDialogOpen(false);
        setDepositAmount('');
        setAccountDetails('');
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      } else {
        toast({
          title: "Deposit Failed",
          description: data.message || "Failed to process deposit",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Deposit Error",
        description: "Unable to process deposit. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Process SmaiSika conversion mutation
  const convertToSmaiSikaMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/wallet/convert-to-smaisika', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        const conversion = data.conversion;
        toast({
          title: "Conversion Successful",
          description: `Converted ${conversion.fromAmount} ${conversion.fromCurrency} to ${conversion.toAmount.toFixed(4)} SS`,
        });
        setConversionDialogOpen(false);
        setConversionAmount('');
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      } else {
        toast({
          title: "Conversion Failed",
          description: data.message || "Failed to convert to SmaiSika",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Conversion Error",
        description: "Unable to process conversion. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDeposit = () => {
    if (!depositAmount || !selectedGateway || !accountDetails || !selectedCountry) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const gateway = gateways.find(g => g.id === selectedGateway);
    if (!gateway) return;

    processDepositMutation.mutate({
      amount: parseFloat(depositAmount),
      currency: gateway.currencies[0],
      providerId: selectedGateway,
      country: selectedCountry,
      accountDetails
    });
  };

  const handleConversion = () => {
    if (!conversionAmount || !conversionCurrency) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and select currency",
        variant: "destructive",
      });
      return;
    }

    convertToSmaiSikaMutation.mutate({
      amount: parseFloat(conversionAmount),
      currency: conversionCurrency,
      userId: 'user_123'
    });
  };

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'mobile_money': return <Smartphone className="w-4 h-4" />;
      case 'bank_transfer': return <Building className="w-4 h-4" />;
      case 'crypto': return <Bitcoin className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'digital_wallet': return <Wallet className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Mock balances for demonstration
  const localBalances: LocalBalance[] = [
    { currency: 'NGN', amount: 250000, symbol: '₦' },
    { currency: 'USD', amount: 1500, symbol: '$' },
    { currency: 'GHS', amount: 8500, symbol: 'GH₵' },
    { currency: 'KES', amount: 45000, symbol: 'KSh' }
  ];

  const smaiSikaBalance: SmaiSikaBalance = {
    balance: 847.32,
    symbol: 'SS'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">SmaiSika Global Wallet</h1>
          <p className="text-blue-200">Multi-continent payment gateway for the Konsai ecosystem</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Local Currency Balances */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Local Wallet Balances</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="text-gray-400 hover:text-white"
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {localBalances.map((balance) => (
                <div key={balance.currency} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {balance.currency.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{balance.currency}</p>
                      <p className="text-gray-400 text-sm">Local Currency</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">
                      {showBalance ? `${balance.symbol}${balance.amount.toLocaleString()}` : '••••••'}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SmaiSika Balance */}
          <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-purple-600 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>SmaiSika Wallet</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  {showBalance ? `${smaiSikaBalance.balance.toFixed(2)} SS` : '••••••'}
                </p>
                <p className="text-purple-200">Universal Currency for Waides Ki</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Deposit Funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle>Deposit Funds - Global Gateway</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select Country</Label>
                        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue placeholder="Choose your country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{country.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {country.gateways} gateways
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {gateways.length > 0 && (
                        <div className="space-y-2">
                          <Label>Payment Method</Label>
                          <Select value={selectedGateway} onValueChange={setSelectedGateway}>
                            <SelectTrigger className="bg-gray-700 border-gray-600">
                              <SelectValue placeholder="Choose payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              {gateways.map((gateway) => (
                                <SelectItem key={gateway.id} value={gateway.id}>
                                  <div className="flex items-center space-x-2">
                                    {getGatewayIcon(gateway.type)}
                                    <span>{gateway.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {gateway.fees.percentage}% + {gateway.fees.fixed}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Account Details</Label>
                        <Input
                          type="text"
                          placeholder="Phone number, account number, or wallet address"
                          value={accountDetails}
                          onChange={(e) => setAccountDetails(e.target.value)}
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>

                      <Button 
                        onClick={handleDeposit}
                        disabled={!depositAmount || !selectedGateway || !accountDetails || processDepositMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {processDepositMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Process Deposit
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={conversionDialogOpen} onOpenChange={setConversionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      Convert to SS
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle>Convert to SmaiSika (SS)</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select Currency</Label>
                        <Select value={conversionCurrency} onValueChange={setConversionCurrency}>
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue placeholder="Choose currency to convert" />
                          </SelectTrigger>
                          <SelectContent>
                            {localBalances.map((balance) => (
                              <SelectItem key={balance.currency} value={balance.currency}>
                                <div className="flex items-center space-x-2">
                                  <span>{balance.symbol}{balance.amount.toLocaleString()}</span>
                                  <span className="text-gray-400">{balance.currency}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Amount to Convert</Label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={conversionAmount}
                          onChange={(e) => setConversionAmount(e.target.value)}
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>

                      {conversionAmount && conversionCurrency && fxData && (
                        <div className="p-3 bg-purple-900/30 rounded-lg">
                          <p className="text-sm text-purple-200">Conversion Preview:</p>
                          <p className="text-lg font-bold text-white">
                            {conversionAmount} {conversionCurrency} → {(parseFloat(conversionAmount) / (fxData.rates.find((r: FXRate) => r.currency === conversionCurrency)?.rate || 1)).toFixed(4)} SS
                          </p>
                        </div>
                      )}

                      <Button 
                        onClick={handleConversion}
                        disabled={!conversionAmount || !conversionCurrency || convertToSmaiSikaMutation.isPending}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {convertToSmaiSikaMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 mr-2" />
                        )}
                        Convert to SmaiSika
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="history" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
            <TabsTrigger value="history" className="text-white">Transaction History</TabsTrigger>
            <TabsTrigger value="rates" className="text-white">FX Rates</TabsTrigger>
            <TabsTrigger value="gateways" className="text-white">Payment Gateways</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            {transaction.type === 'deposit' ? <Plus className="w-5 h-5 text-white" /> : 
                             transaction.type === 'conversion' ? <ArrowUpDown className="w-5 h-5 text-white" /> :
                             <RefreshCw className="w-5 h-5 text-white" />}
                          </div>
                          <div>
                            <p className="text-white font-medium">{transaction.description}</p>
                            <p className="text-gray-400 text-sm">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{transaction.amount}</p>
                          <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No transactions yet</p>
                      <p className="text-gray-500 text-sm">Your transaction history will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rates">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Live FX Rates (1 SS = ?)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fxData?.rates?.map((rate: FXRate) => (
                    <div key={rate.currency} className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-medium">{rate.currency}</p>
                          <p className="text-gray-400 text-sm">1 SS =</p>
                        </div>
                        <p className="text-white font-bold">
                          {rate.symbol} {rate.rate.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gateways">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Global Payment Gateways</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {countries.map((country) => (
                    <Card key={country.code} className="bg-gray-700/30 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="text-white font-medium">{country.name}</p>
                              <p className="text-gray-400 text-sm">{country.code}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            {country.gateways} gateways
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* KonsAi Assistant Alert */}
        <Alert className="bg-blue-900/50 border-blue-600">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-blue-200">
            KonsAi Assistant is monitoring all transactions for security and optimal routing. 
            Auto-detection of failed deposits and retry mechanisms are active.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}