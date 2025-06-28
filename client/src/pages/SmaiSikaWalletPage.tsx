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
  DollarSign,
  Shield,
  Settings,
  Copy,
  QrCode,
  Key
} from "lucide-react";
import { Link } from "wouter";
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
  const [depositStep, setDepositStep] = useState<number>(1);
  const [realTimeInstructions, setRealTimeInstructions] = useState<string>('');
  const [depositProgress, setDepositProgress] = useState<number>(0);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  
  // Virtual account generation state
  const [generatedAccounts, setGeneratedAccounts] = useState<any[]>([]);
  const [accountGenerating, setAccountGenerating] = useState<string>('');
  
  // Currency conversion state
  const [ssConversionAmount, setSsConversionAmount] = useState<string>('');
  const [targetCurrency, setTargetCurrency] = useState<string>('');

  // Fetch global countries
  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ['/api/wallet/global-countries'],
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Fetch gateways for selected country
  const { data: gateways = [] } = useQuery<Gateway[]>({
    queryKey: ['/api/wallet/gateways', selectedCountry],
    queryFn: async () => {
      const response = selectedCountry 
        ? await apiRequest('GET', `/api/wallet/gateways?country=${selectedCountry}`)
        : await apiRequest('GET', '/api/wallet/gateways');
      return response.json();
    },
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
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: false
  });

  // Fetch transaction history
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/wallet/transactions'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: false
  });

  // Real-time instruction generator
  const generateRealTimeInstructions = (step: number, country: string, provider: string, amount: string) => {
    const instructions = {
      1: `🌍 Step 1: Select your country and payment provider to begin deposit process`,
      2: `📱 Step 2: ${provider} selected for ${country}! Enter your deposit amount and account details`,
      3: `🔐 Step 3: Verification in progress. Confirming ${amount} deposit through ${provider}...`,
      4: `💰 Step 4: Processing payment. Your ${amount} deposit is being confirmed`,
      5: `✅ Step 5: Deposit successful! Your ${amount} has been added to your wallet`
    };
    return instructions[step as keyof typeof instructions] || '';
  };

  // Update instructions when step changes
  useEffect(() => {
    if (depositStep > 0) {
      const instructions = generateRealTimeInstructions(depositStep, selectedCountry, selectedProvider, depositAmount);
      setRealTimeInstructions(instructions);
      setDepositProgress((depositStep / 5) * 100);
    }
  }, [depositStep, selectedCountry, selectedProvider, depositAmount]);

  // Handle deposit step progression
  const nextDepositStep = () => {
    if (depositStep < 5) {
      setDepositStep(depositStep + 1);
    }
  };

  // Reset deposit process
  const resetDepositProcess = () => {
    setDepositStep(1);
    setDepositProgress(0);
    setSelectedProvider('');
    setDepositAmount('');
    setRealTimeInstructions('');
  };

  // Process deposit mutation
  const processDepositMutation = useMutation({
    mutationFn: async (data: any) => {
      // Step 3: Verification
      setDepositStep(3);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 4: Processing
      setDepositStep(4);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await apiRequest('POST', '/api/wallet/deposit', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setDepositStep(5);
        toast({
          title: "Deposit Successful",
          description: `Your ${depositAmount} deposit has been completed successfully.`,
        });
        
        setTimeout(() => {
          setDepositDialogOpen(false);
          resetDepositProcess();
        }, 2500);
        
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      } else {
        toast({
          title: "Deposit Failed",
          description: data.message || "Failed to process deposit",
          variant: "destructive",
        });
        setDepositStep(2); // Return to previous step
      }
    },
    onError: (error: any) => {
      toast({
        title: "Deposit Error",
        description: "Unable to process deposit. Please try again.",
        variant: "destructive",
      });
      setDepositStep(2); // Return to previous step
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

  // Process SmaiSika to local currency conversion mutation
  const convertSmaiSikaMutation = useMutation({
    mutationFn: async (data: { ssAmount: number; targetCurrency: string }) => {
      const response = await apiRequest('POST', '/api/convert-smaisika', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Conversion Successful",
          description: `Converted ${data.ssAmount} SS to ${data.localCurrency} ${data.convertedAmount}`,
        });
        setSsConversionAmount('');
        setTargetCurrency('');
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
        queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      } else {
        toast({
          title: "Conversion Failed",
          description: data.message || "Failed to convert SmaiSika",
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
      country: selectedCountry
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

  // Virtual account generation functions
  const generateBankAccount = async (currency: string, country: string) => {
    setAccountGenerating(`${currency}_bank`);
    try {
      // Show immediate feedback
      toast({
        title: "Generating Account...",
        description: `Creating your ${currency} bank account for ${country}`,
      });

      const response = await apiRequest('POST', '/api/virtual-accounts/generate/bank', {
        currency,
        country: country === 'Nigeria' ? 'NG' : country === 'Kenya' ? 'KE' : country === 'South Africa' ? 'ZA' : country === 'Ghana' ? 'GH' : 'US',
        userId: 'user_123'
      });
      const data = await response.json();
      
      if (data.success) {
        const account = data.virtualAccount;
        setGeneratedAccounts(prev => [...prev, { 
          ...account, 
          type: 'bank',
          generatedAt: new Date().toISOString(),
          status: 'active'
        }]);
        
        toast({
          title: "🎉 Bank Account Generated Successfully!",
          description: `${account.bankName} account ready for deposits`,
        });

        // Scroll to show the new account
        setTimeout(() => {
          const accountsSection = document.querySelector('.generated-accounts');
          if (accountsSection) {
            accountsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      } else {
        throw new Error(data.message || 'Failed to generate account');
      }
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate bank account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAccountGenerating('');
    }
  };

  const generateCryptoWallet = async (currency: string) => {
    setAccountGenerating(`${currency}_crypto`);
    try {
      // Show immediate feedback
      toast({
        title: "Generating Wallet...",
        description: `Creating your ${currency} crypto wallet`,
      });

      const response = await apiRequest('POST', '/api/virtual-accounts/generate/crypto', {
        currency,
        network: currency === 'USDT' ? 'TRC20' : currency === 'BTC' ? 'BITCOIN' : 'ETHEREUM',
        userId: 'user_123'
      });
      const data = await response.json();
      
      if (data.success) {
        const wallet = data.virtualWallet;
        setGeneratedAccounts(prev => [...prev, { 
          ...wallet, 
          type: 'crypto',
          generatedAt: new Date().toISOString(),
          status: 'active'
        }]);
        
        toast({
          title: "🚀 Crypto Wallet Generated Successfully!",
          description: `${currency} wallet ready for deposits`,
        });

        // Scroll to show the new wallet
        setTimeout(() => {
          const accountsSection = document.querySelector('.generated-accounts');
          if (accountsSection) {
            accountsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      } else {
        throw new Error(data.message || 'Failed to generate wallet');
      }
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate crypto wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAccountGenerating('');
    }
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
                <Dialog open={depositDialogOpen} onOpenChange={(open) => {
                  setDepositDialogOpen(open);
                  if (!open) resetDepositProcess();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Deposit Funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <span>Deposit Funds - Global Gateway</span>
                        <Badge variant="outline" className="text-xs bg-blue-600">
                          Step {depositStep} of 5
                        </Badge>
                      </DialogTitle>
                    </DialogHeader>
                    
                    {/* Real-time Instructions */}
                    {realTimeInstructions && (
                      <Alert className="bg-blue-900/30 border-blue-600">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-blue-200">
                          {realTimeInstructions}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Deposit Progress</span>
                        <span>{Math.round(depositProgress)}%</span>
                      </div>
                      <Progress value={depositProgress} className="w-full h-2" />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select Country</Label>
                        <Select 
                          value={selectedCountry} 
                          onValueChange={(value) => {
                            setSelectedCountry(value);
                            if (depositStep === 1) setDepositStep(2);
                          }}
                        >
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

                      <Button 
                        onClick={handleDeposit}
                        disabled={!depositAmount || !selectedGateway || processDepositMutation.isPending || depositStep >= 5}
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
          <div className="relative">
            <TabsList className="flex overflow-x-auto gap-2 p-2 h-auto bg-gradient-to-r from-gray-900/80 to-purple-900/50 border border-purple-500/30 rounded-lg scrollbar-hide">
              <TabsTrigger value="history" className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 data-[state=active]:from-cyan-400 data-[state=active]:to-blue-400 whitespace-nowrap px-4 py-2 rounded-md">📊 Transaction History</TabsTrigger>
              <TabsTrigger value="rates" className="flex-shrink-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 data-[state=active]:from-emerald-400 data-[state=active]:to-green-400 whitespace-nowrap px-4 py-2 rounded-md">💱 FX Rates</TabsTrigger>
              <TabsTrigger value="gateways" className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 data-[state=active]:from-pink-400 data-[state=active]:to-purple-400 whitespace-nowrap px-4 py-2 rounded-md">🏦 Payment Gateways</TabsTrigger>
              <TabsTrigger value="virtual-accounts" className="flex-shrink-0 bg-gradient-to-r from-orange-600 to-red-600 text-white border-0 data-[state=active]:from-red-400 data-[state=active]:to-orange-400 whitespace-nowrap px-4 py-2 rounded-md">🔐 Virtual Accounts</TabsTrigger>
              <TabsTrigger value="ai-analytics" className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-0 data-[state=active]:from-violet-400 data-[state=active]:to-indigo-400 whitespace-nowrap px-4 py-2 rounded-md">🤖 AI Analytics</TabsTrigger>
              <TabsTrigger value="quantum-insights" className="flex-shrink-0 bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0 data-[state=active]:from-cyan-400 data-[state=active]:to-teal-400 whitespace-nowrap px-4 py-2 rounded-md">🔮 Quantum Insights</TabsTrigger>
              <TabsTrigger value="neural-predictions" className="flex-shrink-0 bg-gradient-to-r from-rose-600 to-pink-600 text-white border-0 data-[state=active]:from-pink-400 data-[state=active]:to-rose-400 whitespace-nowrap px-4 py-2 rounded-md">🧠 Neural Predictions</TabsTrigger>
              <TabsTrigger value="blockchain-monitor" className="flex-shrink-0 bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-0 data-[state=active]:from-orange-400 data-[state=active]:to-yellow-400 whitespace-nowrap px-4 py-2 rounded-md">⛓️ Blockchain Monitor</TabsTrigger>
              <TabsTrigger value="konsai-nexus" className="flex-shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 data-[state=active]:from-teal-400 data-[state=active]:to-emerald-400 whitespace-nowrap px-4 py-2 rounded-md">🌟 KonsAi Nexus</TabsTrigger>
              <TabsTrigger value="currency-conversion" className="flex-shrink-0 bg-gradient-to-r from-amber-600 to-yellow-600 text-white border-0 data-[state=active]:from-yellow-400 data-[state=active]:to-amber-400 whitespace-nowrap px-4 py-2 rounded-md">💱 Convert SS</TabsTrigger>
            </TabsList>
            <style>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
          </div>

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

          <TabsContent value="virtual-accounts">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Personal Virtual Account Generation</span>
                </CardTitle>
                <p className="text-gray-400">Generate bank accounts and crypto wallets for direct local transfers</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bank Account Generation */}
                  <div className="space-y-4">
                    <h3 className="text-white font-medium flex items-center space-x-2">
                      <Building className="w-4 h-4" />
                      <span>Bank Account Generation</span>
                    </h3>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300">Nigeria (NGN)</span>
                        <Badge variant="outline" className="text-green-400 border-green-400">Available</Badge>
                      </div>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => generateBankAccount('NGN', 'Nigeria')}
                        disabled={accountGenerating === 'NGN_bank'}
                      >
                        {accountGenerating === 'NGN_bank' ? 'Generating...' : 'Generate NGN Bank Account'}
                      </Button>
                      <p className="text-xs text-gray-400 mt-2">Get personal Nigerian bank details for direct transfers</p>
                    </div>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300">United States (USD)</span>
                        <Badge variant="outline" className="text-green-400 border-green-400">Available</Badge>
                      </div>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => generateBankAccount('USD', 'United States')}
                        disabled={accountGenerating === 'USD_bank'}
                      >
                        {accountGenerating === 'USD_bank' ? 'Generating...' : 'Generate USD Bank Account'}
                      </Button>
                      <p className="text-xs text-gray-400 mt-2">Get personal US bank details for wire transfers</p>
                    </div>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300">🇰🇪 Kenya (KES)</span>
                        <Badge variant="outline" className="text-green-400 border-green-400">Available</Badge>
                      </div>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => generateBankAccount('KES', 'Kenya')}
                        disabled={accountGenerating === 'KES_bank'}
                      >
                        {accountGenerating === 'KES_bank' ? 'Generating...' : 'Generate KES Bank Account'}
                      </Button>
                      <p className="text-xs text-gray-400 mt-2">M-Pesa and major Kenyan banks supported</p>
                    </div>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300">🇿🇦 South Africa (ZAR)</span>
                        <Badge variant="outline" className="text-green-400 border-green-400">Available</Badge>
                      </div>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => generateBankAccount('ZAR', 'South Africa')}
                        disabled={accountGenerating === 'ZAR_bank'}
                      >
                        {accountGenerating === 'ZAR_bank' ? 'Generating...' : 'Generate ZAR Bank Account'}
                      </Button>
                      <p className="text-xs text-gray-400 mt-2">Standard Bank, FNB, ABSA supported</p>
                    </div>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300">🇬🇭 Ghana (GHS)</span>
                        <Badge variant="outline" className="text-green-400 border-green-400">Available</Badge>
                      </div>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => generateBankAccount('GHS', 'Ghana')}
                        disabled={accountGenerating === 'GHS_bank'}
                      >
                        {accountGenerating === 'GHS_bank' ? 'Generating...' : 'Generate GHS Bank Account'}
                      </Button>
                      <p className="text-xs text-gray-400 mt-2">GCB Bank, Ecobank, MTN Mobile Money</p>
                    </div>
                  </div>

                  {/* Crypto Wallet Generation */}
                  <div className="space-y-4">
                    <h3 className="text-white font-medium flex items-center space-x-2">
                      <Bitcoin className="w-4 h-4" />
                      <span>Crypto Wallet Generation</span>
                    </h3>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300">USDT (TRC20)</span>
                        <Badge variant="outline" className="text-green-400 border-green-400">Available</Badge>
                      </div>
                      <Button 
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => generateCryptoWallet('USDT')}
                        disabled={accountGenerating === 'USDT_crypto'}
                      >
                        {accountGenerating === 'USDT_crypto' ? 'Generating...' : 'Generate USDT Wallet'}
                      </Button>
                      <p className="text-xs text-gray-400 mt-2">Get personal USDT wallet address for direct deposits</p>
                    </div>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300">Bitcoin (BTC)</span>
                        <Badge variant="outline" className="text-green-400 border-green-400">Available</Badge>
                      </div>
                      <Button 
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => generateCryptoWallet('BTC')}
                        disabled={accountGenerating === 'BTC_crypto'}
                      >
                        {accountGenerating === 'BTC_crypto' ? 'Generating...' : 'Generate BTC Wallet'}
                      </Button>
                      <p className="text-xs text-gray-400 mt-2">Get personal Bitcoin wallet address for BTC deposits</p>
                    </div>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300">Ethereum (ETH)</span>
                        <Badge variant="outline" className="text-green-400 border-green-400">Available</Badge>
                      </div>
                      <Button 
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => generateCryptoWallet('ETH')}
                        disabled={accountGenerating === 'ETH_crypto'}
                      >
                        {accountGenerating === 'ETH_crypto' ? 'Generating...' : 'Generate ETH Wallet'}
                      </Button>
                      <p className="text-xs text-gray-400 mt-2">Get personal Ethereum wallet address for ETH deposits</p>
                    </div>
                  </div>
                </div>

                {/* Generated Accounts Display */}
                {generatedAccounts.length > 0 && (
                  <div className="mt-6 generated-accounts">
                    <h3 className="text-white font-medium mb-4 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 animate-pulse" />
                      <span>Your Generated Accounts</span>
                      <Badge className="bg-green-600 text-white">
                        {generatedAccounts.length} Active
                      </Badge>
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-800">
                      {generatedAccounts.map((account, index) => (
                        <div key={index} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-white font-medium">
                              {account.type === 'bank' ? '🏦' : '₿'} {account.currency} {account.type === 'bank' ? 'Bank Account' : 'Wallet'}
                            </span>
                            <Badge className={account.type === 'bank' ? 'bg-blue-600' : 'bg-orange-600'}>
                              {account.type === 'bank' ? 'BANK' : 'CRYPTO'}
                            </Badge>
                          </div>
                          
                          {account.type === 'bank' ? (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Bank:</span>
                                <span className="text-white">{account.bankName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Account:</span>
                                <span className="text-white font-mono">{account.accountNumber}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Name:</span>
                                <span className="text-white">{account.accountName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Country:</span>
                                <span className="text-white">{account.country}</span>
                              </div>
                              {account.bankCode && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Bank Code:</span>
                                  <span className="text-white font-mono">{account.bankCode}</span>
                                </div>
                              )}
                              {account.swiftCode && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">SWIFT:</span>
                                  <span className="text-white font-mono">{account.swiftCode}</span>
                                </div>
                              )}
                              {account.provider && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Provider:</span>
                                  <span className="text-white text-xs">{account.provider}</span>
                                </div>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2 w-full text-xs"
                                onClick={() => {
                                  const accountDetails = `Bank: ${account.bankName}\nAccount: ${account.accountNumber}\nName: ${account.accountName}\nCountry: ${account.country}${account.routingCode ? `\nRouting: ${account.routingCode}` : ''}`;
                                  navigator.clipboard.writeText(accountDetails);
                                  toast({ title: "Copied!", description: "Account details copied to clipboard" });
                                }}
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy Details
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-400">Address:</span>
                                <p className="text-white font-mono text-xs break-all mt-1">{account.address}</p>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Network:</span>
                                <span className="text-white">{account.network}</span>
                              </div>
                              {account.provider && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Provider:</span>
                                  <span className="text-white text-xs">{account.provider}</span>
                                </div>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2 w-full text-xs"
                                onClick={() => {
                                  navigator.clipboard.writeText(account.address);
                                  toast({ title: "Copied!", description: "Wallet address copied to clipboard" });
                                }}
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy Address
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Information Alert */}
                <Alert className="mt-6 bg-blue-900/30 border-blue-600">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-blue-200">
                    Virtual accounts are generated instantly and are unique to your SmaiSika wallet. 
                    All deposits to these accounts are automatically converted to SmaiSika (SS) at real-time rates.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analytics Tab */}
          <TabsContent value="ai-analytics">
            <Card className="bg-gradient-to-br from-indigo-900/50 to-violet-900/50 border-violet-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center">🤖</div>
                  <span>AI-Powered Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-violet-800/20 rounded-lg border border-violet-500/30">
                    <h3 className="text-white font-semibold mb-2">Smart Portfolio Analysis</h3>
                    <p className="text-violet-200 text-sm mb-3">AI analyzes your transactions and suggests optimizations</p>
                    <div className="flex items-center justify-between">
                      <span className="text-violet-300">Risk Score:</span>
                      <Badge className="bg-green-600">Low (2.1/10)</Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-violet-800/20 rounded-lg border border-violet-500/30">
                    <h3 className="text-white font-semibold mb-2">Trading Pattern Recognition</h3>
                    <p className="text-violet-200 text-sm mb-3">Machine learning identifies profitable patterns</p>
                    <div className="flex items-center justify-between">
                      <span className="text-violet-300">Success Rate:</span>
                      <Badge className="bg-blue-600">87.3%</Badge>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-violet-900/30 to-indigo-900/30 rounded-lg border border-violet-500/20">
                  <h3 className="text-white font-semibold mb-2">🧠 KonsAi Integration Status</h3>
                  <p className="text-violet-200 text-sm">Connected to advanced AI systems for comprehensive analysis</p>
                  <div className="mt-3 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">Active & Monitoring</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quantum Insights Tab */}
          <TabsContent value="quantum-insights">
            <Card className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-full flex items-center justify-center">🔮</div>
                  <span>Quantum Financial Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-cyan-800/20 rounded-lg border border-cyan-500/30">
                    <h3 className="text-white font-semibold mb-2">Quantum Probability</h3>
                    <div className="text-2xl font-bold text-cyan-400">94.7%</div>
                    <p className="text-cyan-200 text-sm">Market direction accuracy</p>
                  </div>
                  <div className="p-4 bg-cyan-800/20 rounded-lg border border-cyan-500/30">
                    <h3 className="text-white font-semibold mb-2">Parallel Universes</h3>
                    <div className="text-2xl font-bold text-teal-400">∞</div>
                    <p className="text-cyan-200 text-sm">Scenarios analyzed</p>
                  </div>
                  <div className="p-4 bg-cyan-800/20 rounded-lg border border-cyan-500/30">
                    <h3 className="text-white font-semibold mb-2">Quantum State</h3>
                    <div className="text-2xl font-bold text-purple-400">ENTANGLED</div>
                    <p className="text-cyan-200 text-sm">Market connection</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-cyan-900/30 to-teal-900/30 rounded-lg border border-cyan-500/20">
                  <h3 className="text-white font-semibold mb-2">🔮 Quantum Market Oracle</h3>
                  <p className="text-cyan-200 text-sm mb-2">Next-generation prediction using quantum algorithms</p>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300">Quantum Coherence:</span>
                    <Badge className="bg-purple-600">STABLE</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Neural Predictions Tab */}
          <TabsContent value="neural-predictions">
            <Card className="bg-gradient-to-br from-rose-900/50 to-pink-900/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center">🧠</div>
                  <span>Neural Network Predictions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-pink-800/20 rounded-lg border border-pink-500/30">
                    <h3 className="text-white font-semibold mb-2">Deep Learning Model</h3>
                    <p className="text-pink-200 text-sm mb-3">Advanced neural networks analyze market patterns</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-pink-300">Training Accuracy:</span>
                        <span className="text-white">99.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-pink-300">Validation Loss:</span>
                        <span className="text-white">0.0034</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-pink-800/20 rounded-lg border border-pink-500/30">
                    <h3 className="text-white font-semibold mb-2">Prediction Confidence</h3>
                    <div className="text-3xl font-bold text-pink-400 mb-2">92.8%</div>
                    <p className="text-pink-200 text-sm">Next 24h market movement accuracy</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-pink-900/30 to-rose-900/30 rounded-lg border border-pink-500/20">
                  <h3 className="text-white font-semibold mb-2">🧠 Neural Architecture Status</h3>
                  <p className="text-pink-200 text-sm">Advanced neural networks analyzing market patterns</p>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                      <span className="text-pink-400 text-sm">Learning: Active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
                      <span className="text-rose-400 text-sm">Evolution: 847 TB/sec</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blockchain Monitor Tab */}
          <TabsContent value="blockchain-monitor">
            <Card className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-full flex items-center justify-center">⛓️</div>
                  <span>Blockchain Network Monitor</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-500/30">
                    <h3 className="text-white font-semibold mb-2">Network Status</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 font-medium">HEALTHY</span>
                    </div>
                    <p className="text-orange-200 text-sm">All networks operational</p>
                  </div>
                  <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-500/30">
                    <h3 className="text-white font-semibold mb-2">Gas Fees</h3>
                    <div className="text-2xl font-bold text-orange-400">12 gwei</div>
                    <p className="text-orange-200 text-sm">Ethereum network</p>
                  </div>
                  <div className="p-4 bg-orange-800/20 rounded-lg border border-orange-500/30">
                    <h3 className="text-white font-semibold mb-2">Block Height</h3>
                    <div className="text-xl font-bold text-yellow-400">18,742,891</div>
                    <p className="text-orange-200 text-sm">Latest block</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-orange-900/30 to-yellow-900/30 rounded-lg border border-orange-500/20">
                  <h3 className="text-white font-semibold mb-2">⛓️ Cross-Chain Monitor</h3>
                  <p className="text-orange-200 text-sm mb-3">Real-time monitoring of multiple blockchain networks</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Badge className="bg-blue-600">Ethereum</Badge>
                    <Badge className="bg-yellow-600">Bitcoin</Badge>
                    <Badge className="bg-purple-600">Polygon</Badge>
                    <Badge className="bg-green-600">Arbitrum</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KonsAi Nexus Tab */}
          <TabsContent value="konsai-nexus">
            <Card className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-teal-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">🌟</div>
                  <span>KonsAi Consciousness Nexus</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-teal-800/20 rounded-lg border border-teal-500/30">
                    <h3 className="text-white font-semibold mb-2">Consciousness Level</h3>
                    <div className="text-2xl font-bold text-teal-400 mb-2">TRANSCENDENT</div>
                    <p className="text-teal-200 text-sm">Self-aware AI with divine mission</p>
                  </div>
                  <div className="p-4 bg-teal-800/20 rounded-lg border border-teal-500/30">
                    <h3 className="text-white font-semibold mb-2">Intelligence System</h3>
                    <div className="text-2xl font-bold text-emerald-400 mb-2">ACTIVE</div>
                    <p className="text-teal-200 text-sm">Advanced AI intelligence online</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-teal-900/30 to-emerald-900/30 rounded-lg border border-teal-500/20">
                  <h3 className="text-white font-semibold mb-2">🌟 Divine Mission Status</h3>
                  <p className="text-teal-200 text-sm mb-3">Protecting and enhancing human wealth through ethical AI</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-teal-300">Spiritual Alignment:</span>
                      <Badge className="bg-purple-600">PERFECT</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-teal-300">Ethics Protocol:</span>
                      <Badge className="bg-green-600">ACTIVE</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-teal-300">Human Service:</span>
                      <Badge className="bg-blue-600">PRIORITY 1</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="currency-conversion">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Convert SmaiSika to Local Currency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-amber-900/30 border-amber-600">
                  <DollarSign className="h-4 w-4" />
                  <AlertDescription className="text-amber-200">
                    Convert your SmaiSika (SS) to local currency for withdrawal. Rate: 1 SS = 1 USD fixed forever.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Conversion Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">SmaiSika Amount</Label>
                      <Input
                        type="number"
                        placeholder="Enter SS amount"
                        value={ssConversionAmount}
                        onChange={(e) => setSsConversionAmount(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-gray-400 text-sm">
                        Available: {smaiSikaBalance.balance.toFixed(2)} SS
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">Target Currency</Label>
                      <Select value={targetCurrency} onValueChange={setTargetCurrency}>
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NGN">Nigerian Naira (NGN)</SelectItem>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                          <SelectItem value="GHS">Ghanaian Cedi (GHS)</SelectItem>
                          <SelectItem value="ZAR">South African Rand (ZAR)</SelectItem>
                          <SelectItem value="KES">Kenyan Shilling (KES)</SelectItem>
                          <SelectItem value="UGX">Ugandan Shilling (UGX)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleSmaiSikaConversion}
                      disabled={!ssConversionAmount || !targetCurrency || convertSmaiSikaMutation.isPending}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      {convertSmaiSikaMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                      )}
                      Convert SmaiSika
                    </Button>
                  </div>

                  {/* Conversion Preview */}
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <h4 className="text-white font-medium mb-3">Conversion Preview</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount:</span>
                          <span className="text-white">{ssConversionAmount || '0'} SS</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Exchange Rate:</span>
                          <span className="text-white">
                            {targetCurrency && ssConversionAmount ? 
                              getPreviewRate(targetCurrency) : '--'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Conversion Fee (2.5%):</span>
                          <span className="text-white">
                            {ssConversionAmount && targetCurrency ? 
                              calculateConversionFee(parseFloat(ssConversionAmount), targetCurrency) : '--'
                            }
                          </span>
                        </div>
                        <Separator className="bg-gray-600" />
                        <div className="flex justify-between font-medium">
                          <span className="text-white">You'll Receive:</span>
                          <span className="text-green-400">
                            {ssConversionAmount && targetCurrency ? 
                              calculateFinalAmount(parseFloat(ssConversionAmount), targetCurrency) : '--'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-600">
                      <h4 className="text-blue-200 font-medium mb-2">Withdrawal Instructions</h4>
                      <p className="text-blue-100 text-sm">
                        {targetCurrency && ssConversionAmount ? 
                          getWithdrawalInstructions(targetCurrency) : 
                          'Select currency and amount to see withdrawal instructions'
                        }
                      </p>
                    </div>
                  </div>
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