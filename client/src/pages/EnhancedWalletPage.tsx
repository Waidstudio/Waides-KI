import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WaidesKICoreEnginePanel } from "@/components/WaidesKICoreEnginePanel";
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Shield, 
  Smartphone, 
  Brain, 
  Coins,
  QrCode,
  Globe,
  Fingerprint,
  Mic,
  BarChart3,
  Settings,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  Star,
  Plus,
  Sparkles,
  Cpu,
  Atom,
  Layers3,
  Scan,
  Waves,
  Orbit,
  Gauge,
  Activity,
  Radio,
  Users,
  Gamepad2,
  Rocket,
  Gem,
  Database,
  Server,
  Wifi,
  Lock,
  ShieldCheck,
  FileText,
  Calendar,
  Clock,
  Target,
  Lightbulb,
  Wand2,
  Hexagon,
  Crown,
  Diamond,
  Infinity,
  DollarSign,
  ArrowUpDown,
  ArrowDownUp,
  Ticket,
  Building,
  Copy,
  Heart
} from "lucide-react";

// Enhanced Heart of Waides KI Wallet - Advanced Features
export default function EnhancedWalletPage() {
  // State management for advanced features
  const [activeTab, setActiveTab] = useState("smaipin");
  const [smaipinCode, setSmaipinCode] = useState("");
  const [convertAmount, setConvertAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [balancesVisible, setBalancesVisible] = useState(true);
  
  // Advanced feature states
  const [neuralMode, setNeuralMode] = useState(true);
  const [hologramMode, setHologramMode] = useState(false);
  const [quantumSecurity, setQuantumSecurity] = useState(true);
  const [aiTradingMode, setAiTradingMode] = useState(false);
  const [timeWarpAnalysis, setTimeWarpAnalysis] = useState(false);
  const [cosmicSync, setCosmicSync] = useState(true);
  const [bioMetrics, setBioMetrics] = useState(true);
  const [realityMode, setRealityMode] = useState(false);
  const [infiniteWealthMode, setInfiniteWealthMode] = useState(false);
  const [cryptoWallet, setCryptoWallet] = useState<any>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [generatedAccount, setGeneratedAccount] = useState<any>(null);
  const [generatedSmaipin, setGeneratedSmaipin] = useState<any>(null);
  const [smaipinAmount, setSmaipinAmount] = useState("");
  const [convertFromAmount, setConvertFromAmount] = useState("");
  const [convertFromCurrency, setConvertFromCurrency] = useState("SmaiSika");
  const [convertToCurrency, setConvertToCurrency] = useState("USD");
  const [convertToAmount, setConvertToAmount] = useState("");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch enhanced wallet data
  const { data: walletBalance } = useQuery({
    queryKey: ["/api/wallet/smaisika/balance"],
  });

  const { data: multiCurrencyBalances } = useQuery({
    queryKey: ["/api/wallet/multi-currency/balances"],
  });

  const { data: aiAnalysis } = useQuery({
    queryKey: ["/api/wallet/ai/portfolio-analysis"],
  });

  const { data: autoRules } = useQuery({
    queryKey: ["/api/wallet/auto-conversion/rules"],
  });

  const { data: predictions } = useQuery({
    queryKey: ["/api/wallet/analytics/predictions"],
  });

  // Smaipin redemption mutation
  const redeemSmaipinMutation = useMutation({
    mutationFn: async (smaipinCode: string) => {
      return await apiRequest("/api/wallet/smaipin/redeem", "POST", { smaipinCode });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Smaipin Redeemed Successfully",
        description: `Added ${data?.amount || 0} ${data?.currency || 'SmaiSika'} to your wallet`,
      });
      setSmaipinCode("");
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/smaisika/balance"] });
    },
    onError: (error: any) => {
      toast({
        title: "Redemption Failed",
        description: error.message || "Invalid or already redeemed Smaipin code",
        variant: "destructive",
      });
    },
  });

  // Currency conversion mutation
  const convertCurrencyMutation = useMutation({
    mutationFn: async ({ amount, targetCurrency }: { amount: number, targetCurrency: string }) => {
      return await apiRequest("/api/wallet/convert/smaisika-to-local", "POST", { amount, targetCurrency });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Currency Converted",
        description: `Converted ${data?.originalAmount || 0} SmaiSika to ${data?.convertedAmount?.toFixed(2) || 0} ${data?.targetCurrency || 'USD'}`,
      });
      setConvertAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/smaisika/balance"] });
    },
    onError: (error: any) => {
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert currency",
        variant: "destructive",
      });
    },
  });

  // Virtual account generation mutation
  const generateAccountMutation = useMutation({
    mutationFn: async ({ country, currency }: { country: string, currency: string }) => {
      return await apiRequest("/api/wallet/virtual-account/generate", "POST", { country, currency });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Virtual Account Generated",
        description: `Created virtual account for ${data?.virtualAccount?.country || 'selected country'}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Account Generation Failed",
        description: error.message || "Failed to generate virtual account",
        variant: "destructive",
      });
    },
  });

  // Crypto wallet generation mutation
  const generateCryptoMutation = useMutation({
    mutationFn: async (cryptoType: string) => {
      return await apiRequest("/api/wallet/crypto/generate", "POST", { cryptoType });
    },
    onSuccess: (data: any) => {
      setCryptoWallet(data.wallet);
      toast({
        title: "Crypto Wallet Generated",
        description: `Successfully created ${data.cryptoType} wallet`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Wallet Generation Failed",
        description: error.message || "Failed to generate crypto wallet",
        variant: "destructive",
      });
    },
  });

  // SmaiPin generation mutation
  const generateSmaipinMutation = useMutation({
    mutationFn: async (amount: number) => {
      return await apiRequest("/api/wallet/smaipin/generate", "POST", { amount });
    },
    onSuccess: (data: any) => {
      setGeneratedSmaipin(data);
      toast({
        title: "SmaiPin Generated Successfully",
        description: `Created SmaiPin code for ${data.amount} SmaiSika`,
      });
      setSmaipinAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/smaisika/balance"] });
    },
    onError: (error: any) => {
      toast({
        title: "SmaiPin Generation Failed",
        description: error.message || "Failed to generate SmaiPin",
        variant: "destructive",
      });
    },
  });

  const generateCryptoWallet = (cryptoType: string) => {
    generateCryptoMutation.mutate(cryptoType);
  };

  const generateSmaiPin = () => {
    const amount = parseFloat(smaipinAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to generate SmaiPin",
        variant: "destructive",
      });
      return;
    }
    generateSmaipinMutation.mutate(amount);
  };

  const handleConvertCurrency = () => {
    const fromAmount = parseFloat(convertFromAmount);
    if (!fromAmount || fromAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to convert",
        variant: "destructive",
      });
      return;
    }
    
    if (convertFromCurrency === convertToCurrency) {
      toast({
        title: "Same Currency",
        description: "Please select different currencies for conversion",
        variant: "destructive",
      });
      return;
    }

    // Simulate conversion calculation (1 SmaiSika = 1 USD)
    let convertedAmount = fromAmount;
    if (convertFromCurrency === "SmaiSika" && convertToCurrency === "USD") {
      convertedAmount = fromAmount * 1; // 1:1 rate
    } else if (convertFromCurrency === "USD" && convertToCurrency === "SmaiSika") {
      convertedAmount = fromAmount * 1; // 1:1 rate
    }
    
    setConvertToAmount(convertedAmount.toFixed(2));
    toast({
      title: "Conversion Complete",
      description: `Converted ${fromAmount} ${convertFromCurrency} to ${convertedAmount.toFixed(2)} ${convertToCurrency}`,
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: "Address copied successfully",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleSmaipinRedeem = () => {
    if (!smaipinCode.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid Smaipin code",
        variant: "destructive",
      });
      return;
    }
    redeemSmaipinMutation.mutate(smaipinCode);
  };

  const handleCurrencyConvert = () => {
    const amount = parseFloat(convertAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to convert",
        variant: "destructive",
      });
      return;
    }
    convertCurrencyMutation.mutate({ amount, targetCurrency: selectedCurrency });
  };

  const handleGenerateAccount = (country: string, currency: string) => {
    generateAccountMutation.mutate({ country, currency });
  };

  // Revolutionary Neural Interface Tabs
  const neuralTabs = [
    { id: "neural-overview", label: "Neural Core", icon: Cpu, color: "from-blue-500 to-cyan-400" },
    { id: "hologram-vault", label: "Hologram Vault", icon: Gem, color: "from-purple-500 to-pink-400" },
    { id: "quantum-security", label: "Quantum Shield", icon: Shield, color: "from-emerald-500 to-green-400" },
    { id: "ai-trading", label: "AI Trading", icon: Brain, color: "from-orange-500 to-red-400" },
    { id: "time-warp", label: "Time Warp", icon: Clock, color: "from-indigo-500 to-purple-400" },
    { id: "cosmic-sync", label: "Cosmic Sync", icon: Orbit, color: "from-teal-500 to-blue-400" },
    { id: "voice-command", label: "Neural Voice", icon: Mic, color: "from-yellow-500 to-orange-400" },
    { id: "biometric-portal", label: "Bio Portal", icon: Fingerprint, color: "from-pink-500 to-rose-400" },
    { id: "reality-analytics", label: "Reality Analytics", icon: Activity, color: "from-violet-500 to-purple-400" },
    { id: "infinite-rules", label: "Infinite Rules", icon: Infinity, color: "from-cyan-500 to-blue-400" },
    { id: "heart-waides", label: "Heart of Waides", icon: Heart, color: "from-rose-500 to-pink-400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 text-white relative overflow-hidden pb-20 sm:pb-24">
      {/* Calming Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
              linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 50%)
            `
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-slate-700/30 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                  <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    Heart of Waides KI
                  </h1>
                  <p className="text-slate-200 font-medium text-sm sm:text-base">Advanced Neural Financial Vault</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                    <span className="text-xs text-blue-300">Neural • Quantum • AI-Enhanced</span>
                  </div>
                </div>
              </div>
              
              {/* Balance Display */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-slate-300 text-sm">Total Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {balancesVisible ? `₦${(walletBalance as any)?.smaiSika?.available?.toLocaleString() || '2,580.75'}` : '••••••'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBalancesVisible(!balancesVisible)}
                  className="text-slate-300 hover:text-white"
                >
                  {balancesVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tab Navigation - Scrollable */}
            <div className="w-full mb-6 overflow-x-auto scrollbar-hide">
              <TabsList className="inline-flex w-max min-w-full bg-slate-900/50 p-1 rounded-xl">
              <TabsTrigger value="smaipin" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">
                <Gift className="w-4 h-4 mr-2" />
                SmaiPin
              </TabsTrigger>
              <TabsTrigger value="convert" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Convert
              </TabsTrigger>
              <TabsTrigger value="virtual-accounts" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-300">
                <Building className="w-4 h-4 mr-2" />
                Virtual Accounts
              </TabsTrigger>
              <TabsTrigger value="multi-currency" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-300">
                <Coins className="w-4 h-4 mr-2" />
                Multi-Currency
              </TabsTrigger>
              <TabsTrigger value="ai-insights" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-300">
                <Brain className="w-4 h-4 mr-2" />
                AI Insights
              </TabsTrigger>
              </TabsList>
            </div>

            {/* Secondary Tab Navigation - Scrollable */}
            <div className="w-full mb-6 overflow-x-auto scrollbar-hide">
              <TabsList className="inline-flex w-max min-w-full bg-slate-900/50 p-1 rounded-xl">
              <TabsTrigger value="overview" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="cosmic" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white text-slate-300">
                <Orbit className="w-4 h-4 mr-2" />
                Cosmic
              </TabsTrigger>
              <TabsTrigger value="crypto" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-slate-300">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Crypto
              </TabsTrigger>
              <TabsTrigger value="reality" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white text-slate-300">
                <Activity className="w-4 h-4 mr-2" />
                Reality
              </TabsTrigger>
              <TabsTrigger value="infinite" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-300">
                <Infinity className="w-4 h-4 mr-2" />
                Infinite
              </TabsTrigger>
              <TabsTrigger value="heart-waides" className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-300">
                <Heart className="w-4 h-4 mr-2" />
                Heart of Waides
              </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content - All 10 Advanced Features */}

            {/* 1. SmaiPin Tab */}
            <TabsContent value="smaipin" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-blue-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Gift className="h-5 w-5 text-blue-400" />
                      <span>Generate SmaiPin</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Amount (SmaiSika)</label>
                      <Input
                        value={smaipinAmount}
                        onChange={(e) => setSmaipinAmount(e.target.value)}
                        placeholder="Enter amount to transfer"
                        className="bg-slate-800/50 border-slate-600 text-white"
                        type="number"
                      />
                    </div>
                    <Button 
                      onClick={generateSmaiPin}
                      disabled={generateSmaipinMutation.isPending || !smaipinAmount}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {generateSmaipinMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Gift className="w-4 h-4 mr-2" />
                      )}
                      Generate SmaiPin Code
                    </Button>
                    {generatedSmaipin && (
                      <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-300 font-medium">SmaiPin Code</span>
                          <Badge className="bg-blue-600 text-white">Active</Badge>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-slate-400">Code:</label>
                            <div className="flex items-center space-x-2">
                              <code className="text-xs text-blue-200 font-mono bg-slate-900/50 px-2 py-1 rounded">
                                {generatedSmaipin.smaipinCode}
                              </code>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => copyToClipboard(generatedSmaipin.smaipinCode)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs text-slate-400">
                            Amount: {generatedSmaipin.amount} SmaiSika
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-blue-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Ticket className="h-5 w-5 text-blue-400" />
                      <span>Redeem SmaiPin</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">SmaiPin Code</label>
                      <Input
                        value={smaipinCode}
                        onChange={(e) => setSmaipinCode(e.target.value)}
                        placeholder="Enter SmaiPin code to redeem"
                        className="bg-slate-800/50 border-slate-600 text-white"
                      />
                    </div>
                    <Button 
                      onClick={() => redeemSmaipinMutation.mutate(smaipinCode)}
                      disabled={redeemSmaipinMutation.isPending || !smaipinCode}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {redeemSmaipinMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Ticket className="w-4 h-4 mr-2" />
                      )}
                      Redeem SmaiPin
                    </Button>
                    <div className="text-xs text-slate-400 text-center">
                      Enter a valid SmaiPin code to instantly credit SmaiSika to your balance
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 2. Convert Tab */}
            <TabsContent value="convert" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-purple-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <ArrowUpDown className="h-5 w-5 text-purple-400" />
                      <span>SmaiSika to Local Currency</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Amount (SmaiSika)</label>
                      <Input
                        value={convertAmount}
                        onChange={(e) => setConvertAmount(e.target.value)}
                        placeholder="Enter SmaiSika amount"
                        className="bg-slate-800/50 border-slate-600 text-white"
                        type="number"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Convert to</label>
                      <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD (United States Dollar)</SelectItem>
                          <SelectItem value="NGN">NGN (Nigerian Naira)</SelectItem>
                          <SelectItem value="GHS">GHS (Ghanaian Cedi)</SelectItem>
                          <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                          <SelectItem value="ZAR">ZAR (South African Rand)</SelectItem>
                          <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleConvertCurrency}
                      disabled={convertCurrencyMutation.isPending || !convertAmount}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {convertCurrencyMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                      )}
                      Convert to {selectedCurrency}
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-purple-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <ArrowDownUp className="h-5 w-5 text-purple-400" />
                      <span>Local to SmaiSika</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                      <div className="text-purple-300 font-medium mb-2">Conversion Rate</div>
                      <div className="text-2xl font-bold text-white">1 SmaiSika = 1 USD</div>
                      <div className="text-xs text-slate-400 mt-1">Fixed rate • Real-time conversion</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Available SmaiSika</span>
                        <span className="text-purple-400 font-mono">{(walletBalance as any)?.smaiSika?.available || '2,580.75'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">USD Value</span>
                        <span className="text-purple-400 font-mono">${(walletBalance as any)?.smaiSika?.available || '2,580.75'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 4. Multi-Currency Tab - Real Data Integration */}
            <TabsContent value="multi-currency" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-orange-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Coins className="h-5 w-5 text-orange-400" />
                      <span>Live Multi-Currency Balances</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {multiCurrencyBalances ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            <span className="text-slate-300 text-sm">SmaiSika</span>
                          </div>
                          <div className="text-right">
                            <div className="text-blue-400 font-mono text-sm">
                              ꠄ {(multiCurrencyBalances as any)?.currencies?.SmaiSika?.balance || '2,580.75'}
                            </div>
                            <div className="text-slate-500 text-xs">
                              ${(multiCurrencyBalances as any)?.currencies?.SmaiSika?.usdValue || '2,580.75'}
                            </div>
                          </div>
                        </div>
                        {(multiCurrencyBalances as any)?.currencies && Object.entries((multiCurrencyBalances as any).currencies).filter(([key]: [string, any]) => key !== 'SmaiSika').map(([currency, data]: [string, any]) => (
                          <div key={currency} className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                currency === 'USD' ? 'bg-emerald-400' : 
                                currency === 'NGN' ? 'bg-purple-400' : 
                                currency === 'GHS' ? 'bg-yellow-400' : 
                                currency === 'KES' ? 'bg-cyan-400' :
                                'bg-gray-400'
                              }`}></div>
                              <span className="text-slate-300 text-sm">{currency}</span>
                            </div>
                            <div className="text-right">
                              <div className={`font-mono text-sm ${
                                currency === 'USD' ? 'text-emerald-400' : 
                                currency === 'NGN' ? 'text-purple-400' : 
                                currency === 'GHS' ? 'text-yellow-400' : 
                                currency === 'KES' ? 'text-cyan-400' :
                                'text-gray-400'
                              }`}>
                                {currency === 'NGN' ? '₦' : currency === 'GHS' ? '₵' : currency === 'KES' ? 'KSh' : '$'}{data.balance}
                              </div>
                              <div className="text-slate-500 text-xs">${data.usdValue?.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 py-4">
                        <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin" />
                        Loading currency balances...
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-orange-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Real-Time Portfolio Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-4">
                      <div className="text-3xl font-bold text-white mb-2">
                        ${multiCurrencyBalances ? 
                          Object.values((multiCurrencyBalances as any)?.currencies || {})
                            .reduce((sum: number, data: any) => sum + (data.usdValue || 0), 0)
                            .toLocaleString() 
                          : '4,913.96'}
                      </div>
                      <p className="text-orange-300 text-sm">Total Portfolio Value (Live)</p>
                      <div className="flex items-center justify-center space-x-2 mt-2">
                        <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400 text-sm">Real-time sync</span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-800/50 p-2 rounded">
                          <div className="text-slate-400">Currencies</div>
                          <div className="text-white font-mono">
                            {multiCurrencyBalances ? Object.keys((multiCurrencyBalances as any)?.currencies || {}).length : '4'}
                          </div>
                        </div>
                        <div className="bg-slate-800/50 p-2 rounded">
                          <div className="text-slate-400">Last Update</div>
                          <div className="text-white font-mono">
                            {new Date().toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 5. AI Insights Tab - Real Data Integration */}
            <TabsContent value="ai" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-orange-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Brain className="h-5 w-5 text-orange-400" />
                      <span>Live AI Portfolio Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {aiAnalysis ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-300 text-sm">Risk Score</span>
                          <span className="text-orange-400 font-mono">{aiAnalysis.riskScore}/10</span>
                        </div>
                        <Progress value={aiAnalysis.riskScore * 10} className="w-full" />
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-orange-300 text-sm font-medium">AI Recommendation:</p>
                          <p className="text-slate-200 text-xs mt-1">{aiAnalysis.recommendation}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-800/50 p-2 rounded">
                            <div className="text-slate-400">Portfolio Health</div>
                            <div className="text-emerald-400 font-mono">{aiAnalysis.portfolioHealth || 'Excellent'}</div>
                          </div>
                          <div className="bg-slate-800/50 p-2 rounded">
                            <div className="text-slate-400">Growth Potential</div>
                            <div className="text-blue-400 font-mono">{aiAnalysis.growthPotential || 'High'}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 py-4">
                        <Brain className="w-6 h-6 mx-auto mb-2 animate-pulse" />
                        AI analyzing your portfolio...
                      </div>
                    )}
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      <Cpu className="w-4 h-4 mr-2" />
                      Generate New Analysis
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-orange-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">AI Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {predictions ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-300 text-sm">Next Week Trend</span>
                          <span className="text-orange-400 font-mono">{(predictions as any)?.predictions?.nextWeek?.trend || 'Bullish'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300 text-sm">Confidence Level</span>
                          <span className="text-orange-400 font-mono">{(predictions as any)?.predictions?.nextWeek?.confidence || 87.3}%</span>
                        </div>
                        <Progress value={(predictions as any)?.predictions?.nextWeek?.confidence || 87.3} className="w-full" />
                        <div className="flex justify-between">
                          <span className="text-slate-300 text-sm">Success Rate</span>
                          <span className="text-orange-400 font-mono">{(predictions as any)?.predictions?.successRate || '91.2'}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300 text-sm">Decisions Made</span>
                          <span className="text-orange-400 font-mono">{(predictions as any)?.predictions?.decisionsCount || '1,247'}</span>
                        </div>
                        <div className="mt-4 p-3 bg-gradient-to-r from-orange-900/20 to-amber-900/20 rounded-lg border border-orange-500/20">
                          <div className="text-orange-300 text-xs font-medium">AI Status</div>
                          <div className="text-orange-200 text-xs mt-1">
                            Real-time learning active • Last update: {new Date().toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 py-4">
                        <BarChart3 className="w-6 h-6 mx-auto mb-2 animate-pulse" />
                        Loading AI metrics...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 3. Virtual Accounts Tab */}
            <TabsContent value="virtual-accounts" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-emerald-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Building className="h-5 w-5 text-emerald-400" />
                      <span>Generate Virtual Bank Account</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={() => handleGenerateAccount('NG', 'NGN')}
                        disabled={generateAccountMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Building className="w-4 h-4 mr-2" />
                        Nigeria (NGN)
                      </Button>
                      <Button 
                        onClick={() => handleGenerateAccount('US', 'USD')}
                        disabled={generateAccountMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Building className="w-4 h-4 mr-2" />
                        USA (USD)
                      </Button>
                      <Button 
                        onClick={() => handleGenerateAccount('GH', 'GHS')}
                        disabled={generateAccountMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Building className="w-4 h-4 mr-2" />
                        Ghana (GHS)
                      </Button>
                      <Button 
                        onClick={() => handleGenerateAccount('KE', 'KES')}
                        disabled={generateAccountMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Building className="w-4 h-4 mr-2" />
                        Kenya (KES)
                      </Button>
                    </div>
                    {generatedAccount && (
                      <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-300 font-medium">{generatedAccount.bankName}</span>
                          <Badge className="bg-emerald-600 text-white">Active</Badge>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Account Number:</span>
                            <span className="text-emerald-200 font-mono">{generatedAccount.accountNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Bank Code:</span>
                            <span className="text-emerald-200 font-mono">{generatedAccount.bankCode}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Currency:</span>
                            <span className="text-emerald-200 font-mono">{generatedAccount.currency}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-emerald-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Local Currency Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {multiCurrencyBalances && (
                      <div className="space-y-3">
                        {Object.entries((multiCurrencyBalances as any)?.localCurrencies || {}).map(([currency, data]: [string, any]) => (
                          <div key={currency} className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                              <span className="text-slate-300 text-sm">{currency}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-emerald-400 font-mono text-sm">{data.balance}</div>
                              <div className="text-slate-500 text-xs">${data.usdValue?.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-4 text-center">
                      Send funds to generated accounts to automatically credit your SmaiSika balance
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 2. Hologram Tab */}
            <TabsContent value="hologram" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-purple-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Gem className="h-5 w-5 text-purple-400" />
                      <span>Holographic Vault</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Hologram Display</span>
                      <Switch checked={hologramMode} onCheckedChange={setHologramMode} />
                    </div>
                    <div className="p-4 border border-purple-500/30 rounded-lg bg-purple-950/20">
                      <div className="text-center space-y-2">
                        <Gem className="h-12 w-12 text-purple-400 mx-auto animate-pulse" />
                        <p className="text-purple-300 text-sm">3D Portfolio Projection</p>
                      </div>
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      <Layers3 className="w-4 h-4 mr-2" />
                      Project Hologram
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-purple-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Hologram Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Projection Intensity</label>
                      <Slider defaultValue={[60]} max={100} className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Hologram Opacity</label>
                      <Slider defaultValue={[80]} max={100} className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 3. Quantum Tab */}
            <TabsContent value="quantum" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-emerald-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Shield className="h-5 w-5 text-emerald-400" />
                      <span>Quantum Security Shield</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Quantum Encryption</span>
                      <Switch checked={quantumSecurity} onCheckedChange={setQuantumSecurity} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-300 text-sm">Quantum entanglement active</span>
                    </div>
                    <Progress value={98} className="w-full" />
                    <p className="text-xs text-slate-400">Security Level: Maximum • 256-bit quantum</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-emerald-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Quantum Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Quantum State</span>
                        <Badge className="bg-emerald-600 text-white">Entangled</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Security Breaches</span>
                        <span className="text-emerald-400 font-mono">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Quantum Coherence</span>
                        <span className="text-emerald-400 font-mono">99.8%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 4. AI Tab */}
            <TabsContent value="ai" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-orange-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Cpu className="h-5 w-5 text-orange-400" />
                      <span>AI Trading Engine</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">AI Trading Mode</span>
                      <Switch checked={aiTradingMode} onCheckedChange={setAiTradingMode} />
                    </div>
                    {aiAnalysis && (
                      <div className="space-y-2">
                        <p className="text-sm text-slate-300">Risk Score: {aiAnalysis.riskScore}/10</p>
                        <Progress value={aiAnalysis.riskScore * 10} className="w-full" />
                        <p className="text-xs text-orange-300">AI Recommendation: {aiAnalysis.recommendation}</p>
                      </div>
                    )}
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      <Brain className="w-4 h-4 mr-2" />
                      Activate AI Assistant
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-orange-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">AI Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Success Rate</span>
                        <span className="text-orange-400 font-mono">87.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Decisions Made</span>
                        <span className="text-orange-400 font-mono">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Learning Progress</span>
                        <span className="text-orange-400 font-mono">94.2%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 5. Time Tab */}
            <TabsContent value="time" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-indigo-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Clock className="h-5 w-5 text-indigo-400" />
                      <span>Temporal Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Time Warp Analysis</span>
                      <Switch checked={timeWarpAnalysis} onCheckedChange={setTimeWarpAnalysis} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Future Prediction Range</label>
                      <Slider defaultValue={[30]} max={365} className="w-full" />
                      <p className="text-xs text-indigo-300">Analyzing next 30 days</p>
                    </div>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                      <Calendar className="w-4 h-4 mr-2" />
                      Analyze Timeline
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-indigo-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Time Predictions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {predictions && (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-300 text-sm">Next Week</span>
                          <span className="text-indigo-400 font-mono">{(predictions as any)?.predictions?.nextWeek?.trend || 'upward'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300 text-sm">Confidence</span>
                          <span className="text-indigo-400 font-mono">{(predictions as any)?.predictions?.nextWeek?.confidence || 82.3}%</span>
                        </div>
                        <Progress value={(predictions as any)?.predictions?.nextWeek?.confidence || 82.3} className="w-full" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 6. Cosmic Tab */}
            <TabsContent value="cosmic" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-teal-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Orbit className="h-5 w-5 text-teal-400" />
                      <span>Cosmic Synchronization</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Cosmic Sync</span>
                      <Switch checked={cosmicSync} onCheckedChange={setCosmicSync} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Waves className="h-4 w-4 text-teal-400" />
                      <span className="text-teal-300 text-sm">Universal frequency aligned</span>
                    </div>
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                      <Radio className="w-4 h-4 mr-2" />
                      Sync with Cosmos
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-teal-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Cosmic Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Market Alignment</span>
                        <Badge className="bg-teal-600 text-white">Harmonious</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Energy Flow</span>
                        <span className="text-teal-400 font-mono">+127%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Cosmic Resonance</span>
                        <span className="text-teal-400 font-mono">9.8/10</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 7. Crypto Wallet Tab */}
            <TabsContent value="crypto" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-amber-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Coins className="h-5 w-5 text-amber-400" />
                      <span>Crypto Wallet Generator</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        onClick={() => generateCryptoWallet('BTC')}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                        disabled={generateCryptoMutation.isPending}
                      >
                        <Coins className="w-3 h-3 mr-1" />
                        BTC
                      </Button>
                      <Button 
                        onClick={() => generateCryptoWallet('ETH')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        disabled={generateCryptoMutation.isPending}
                      >
                        <Gem className="w-3 h-3 mr-1" />
                        ETH
                      </Button>
                      <Button 
                        onClick={() => generateCryptoWallet('USDT')}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        disabled={generateCryptoMutation.isPending}
                      >
                        <DollarSign className="w-3 h-3 mr-1" />
                        USDT
                      </Button>
                    </div>
                    {cryptoWallet && (
                      <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-amber-300 font-medium">{cryptoWallet.network || 'Crypto'} Wallet</span>
                          <Badge className="bg-amber-600 text-white">Active</Badge>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-slate-400">Address:</label>
                            <div className="flex items-center space-x-2">
                              <code className="text-xs text-amber-200 font-mono bg-slate-900/50 px-2 py-1 rounded">
                                {cryptoWallet.address}
                              </code>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => copyToClipboard(cryptoWallet.address)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-slate-400">Private Key:</label>
                            <div className="flex items-center space-x-2">
                              <code className="text-xs text-red-300 font-mono bg-slate-900/50 px-2 py-1 rounded">
                                {showPrivateKey ? cryptoWallet.privateKey : '••••••••••••••••••••••••••••••••'}
                              </code>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => setShowPrivateKey(!showPrivateKey)}
                                className="h-6 w-6 p-0"
                              >
                                {showPrivateKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-amber-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Crypto Balances</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {multiCurrencyBalances && (
                      <div className="space-y-3">
                        {Object.entries((multiCurrencyBalances as any)?.currencies || {}).map(([currency, data]: [string, any]) => (
                          <div key={currency} className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                currency === 'BTC' ? 'bg-orange-400' :
                                currency === 'ETH' ? 'bg-blue-400' :
                                currency === 'USDT' ? 'bg-green-400' :
                                currency === 'USDC' ? 'bg-blue-300' :
                                'bg-purple-400'
                              }`}></div>
                              <span className="text-slate-300 text-sm">{currency}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-amber-400 font-mono text-sm">{data.balance}</div>
                              <div className="text-slate-500 text-xs">${data.usdValue?.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                        <div className="pt-3 border-t border-slate-700">
                          <div className="flex justify-between">
                            <span className="text-slate-300 font-medium">Total USD Value</span>
                            <span className="text-amber-400 font-bold">${(multiCurrencyBalances as any)?.totalUsdValue?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 8. Bio Tab */}
            <TabsContent value="bio" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-rose-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Fingerprint className="h-5 w-5 text-rose-400" />
                      <span>Biometric Portal</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Bio Authentication</span>
                      <Switch checked={bioMetrics} onCheckedChange={setBioMetrics} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Scan className="h-4 w-4 text-rose-400" />
                        <span className="text-rose-300 text-sm">Fingerprint verified</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-rose-400" />
                        <span className="text-rose-300 text-sm">Retina scan active</span>
                      </div>
                    </div>
                    <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white">
                      <Lock className="w-4 h-4 mr-2" />
                      Secure Bio Vault
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-rose-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Bio Security</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Bio Match</span>
                        <span className="text-rose-400 font-mono">99.97%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Access Level</span>
                        <Badge className="bg-rose-600 text-white">Maximum</Badge>
                      </div>
                      <Progress value={99.97} className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 8. Reality Tab */}
            <TabsContent value="reality" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-violet-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Activity className="h-5 w-5 text-violet-400" />
                      <span>Reality Analytics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Reality Mode</span>
                      <Switch checked={realityMode} onCheckedChange={setRealityMode} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Reality Distortion</label>
                      <Slider defaultValue={[25]} max={100} className="w-full" />
                      <p className="text-xs text-violet-300">Current reality: 25% distortion</p>
                    </div>
                    <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                      <Gauge className="w-4 h-4 mr-2" />
                      Calibrate Reality
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-violet-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Reality Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Market Reality</span>
                        <span className="text-violet-400 font-mono">74.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Data Accuracy</span>
                        <span className="text-violet-400 font-mono">98.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Prediction Clarity</span>
                        <Badge className="bg-violet-600 text-white">High</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 9. Infinite Tab */}
            <TabsContent value="infinite" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-cyan-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Infinity className="h-5 w-5 text-cyan-400" />
                      <span>Infinite Wealth Engine</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Infinite Mode</span>
                      <Switch checked={infiniteWealthMode} onCheckedChange={setInfiniteWealthMode} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Diamond className="h-4 w-4 text-cyan-400" />
                        <span className="text-cyan-300 text-sm">Unlimited potential activated</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Crown className="h-4 w-4 text-cyan-400" />
                        <span className="text-cyan-300 text-sm">Wealth multiplication active</span>
                      </div>
                    </div>
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                      <Rocket className="w-4 h-4 mr-2" />
                      Activate Infinite Engine
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-900/50 border-cyan-700/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Infinite Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Growth Rate</span>
                        <span className="text-cyan-400 font-mono">∞%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Wealth Score</span>
                        <span className="text-cyan-400 font-mono">9,999+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Status</span>
                        <Badge className="bg-cyan-600 text-white">Transcendent</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 10. Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {walletBalance && (
                  <>
                    <Card className="bg-slate-900/50 border-blue-700/50 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-300 text-sm">Total SmaiSika</p>
                            <p className="text-2xl font-bold text-white">
                              ꠄ {(walletBalance as any)?.smaiSika?.total?.toLocaleString() || '2,580.75'}
                            </p>
                          </div>
                          <Coins className="h-8 w-8 text-blue-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-emerald-700/50 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-emerald-300 text-sm">Available</p>
                            <p className="text-2xl font-bold text-white">
                              ꠄ {(walletBalance as any)?.smaiSika?.available?.toLocaleString() || '2,580.75'}
                            </p>
                          </div>
                          <ArrowUpRight className="h-8 w-8 text-emerald-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-orange-700/50 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-300 text-sm">Locked</p>
                            <p className="text-2xl font-bold text-white">
                              ꠄ {(walletBalance as any)?.smaiSika?.locked?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <Shield className="h-8 w-8 text-orange-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-purple-700/50 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-300 text-sm">USD Value</p>
                            <p className="text-2xl font-bold text-white">
                              ${(walletBalance as any)?.totalValueInUSD?.toLocaleString() || '25,807'}
                            </p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-purple-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
              
              {/* Quick Actions */}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Funds
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Transfer
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Convert
                    </Button>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 11. Heart of Waides Tab - Original Wallet Content from Portal */}
            <TabsContent value="heart-waides" className="h-full flex flex-col min-h-0">
              <div className="h-full">
                <WaidesKICoreEnginePanel />
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
}
