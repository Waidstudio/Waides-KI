import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  Plus
} from "lucide-react";

export default function EnhancedWalletPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [smaipinCode, setSmaipinCode] = useState("");
  const [convertAmount, setConvertAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [balancesVisible, setBalancesVisible] = useState(true);
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
      const response = await apiRequest("/api/wallet/smaipin/redeem", {
        method: "POST",
        body: JSON.stringify({ smaipinCode })
      });
      return response;
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
      const response = await apiRequest("/api/wallet/convert/smaisika-to-local", {
        method: "POST",
        body: JSON.stringify({ amount, targetCurrency })
      });
      return response;
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
      const response = await apiRequest("/api/wallet/virtual-account/generate", {
        method: "POST",
        body: JSON.stringify({ country, currency })
      });
      return response;
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

  const scrollableTabs = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "smaipin", label: "Smaipin", icon: Gift },
    { id: "convert", label: "Convert", icon: RefreshCw },
    { id: "multicurrency", label: "Multi-Currency", icon: Globe },
    { id: "virtual", label: "Virtual Accounts", icon: CreditCard },
    { id: "ai", label: "AI Insights", icon: Brain },
    { id: "biometric", label: "Biometric", icon: Fingerprint },
    { id: "voice", label: "Voice Control", icon: Mic },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "auto", label: "Auto Rules", icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  SmaiSika Wallet
                </h1>
                <p className="text-slate-400">Advanced AI-Powered Financial Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalancesVisible(!balancesVisible)}
                className="text-slate-300 hover:text-white"
              >
                {balancesVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Badge variant="outline" className="border-emerald-500 text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                Online
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Overview */}
      {balancesVisible && walletBalance && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm">Total SmaiSika</p>
                    <p className="text-2xl font-bold text-white">
                      ꠄ {(walletBalance as any)?.smaiSika?.total?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <Coins className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-300 text-sm">Available</p>
                    <p className="text-2xl font-bold text-white">
                      ꠄ {(walletBalance as any)?.smaiSika?.available?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <ArrowUpRight className="h-8 w-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
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

            <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm">USD Value</p>
                    <p className="text-2xl font-bold text-white">
                      ${(walletBalance as any)?.totalValueInUSD?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Scrollable Tab Navigation */}
        <div className="w-full overflow-x-auto mb-6">
          <div className="flex space-x-2 p-2 bg-slate-800/50 rounded-lg min-w-max">
            {scrollableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 min-w-fit ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">
            {/* Overview Tab */}
            <div className={activeTab === 'overview' ? 'block space-y-6' : 'hidden'}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
                      Portfolio Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {multiCurrencyBalances && (
                      <div className="space-y-4">
                        {Object.entries((multiCurrencyBalances as any)?.currencies || {}).map(([currency, data]: [string, any]) => (
                          <div key={currency} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                            <div className="flex items-center space-x-3">
                              <div className="text-lg">{data?.symbol || '•'}</div>
                              <div>
                                <p className="font-medium text-white">{currency}</p>
                                <p className="text-sm text-slate-400">{data?.balance?.toLocaleString() || '0'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-white">${data?.usdValue?.toLocaleString() || '0'}</p>
                              <p className={`text-sm ${(data?.change24h || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {(data?.change24h || 0) >= 0 ? '+' : ''}{data?.change24h || 0}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-purple-400" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {aiAnalysis && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/30 to-blue-900/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300">Risk Score</span>
                            <span className="font-bold text-white">{(aiAnalysis as any)?.analysis?.riskScore || 0}/10</span>
                          </div>
                          <Progress value={((aiAnalysis as any)?.analysis?.riskScore || 0) * 10} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          {((aiAnalysis as any)?.analysis?.suggestions || []).slice(0, 2).map((suggestion: any, index: number) => (
                            <div key={index} className="p-3 rounded-lg bg-slate-700/30">
                              <div className="flex items-center justify-between mb-1">
                                <Badge variant="outline" className={`
                                  ${suggestion?.priority === 'high' ? 'border-red-500 text-red-400' : 
                                    suggestion?.priority === 'medium' ? 'border-yellow-500 text-yellow-400' : 
                                    'border-green-500 text-green-400'}
                                `}>
                                  {suggestion?.priority || 'low'}
                                </Badge>
                                <span className="text-xs text-slate-400">{suggestion?.type || 'general'}</span>
                              </div>
                              <p className="text-sm text-slate-300">{suggestion?.message || 'No suggestion available'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Smaipin Tab */}
            <div className={activeTab === 'smaipin' ? 'block space-y-6' : 'hidden'}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Gift className="h-5 w-5 mr-2 text-green-400" />
                      Redeem Smaipin
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Enter Smaipin code (e.g., SMAI-2024-ABCD-1234)"
                      value={smaipinCode}
                      onChange={(e) => setSmaipinCode(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                    <Button 
                      onClick={handleSmaipinRedeem}
                      disabled={redeemSmaipinMutation.isPending}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                    >
                      {redeemSmaipinMutation.isPending ? "Redeeming..." : "Redeem Smaipin"}
                    </Button>
                    
                    <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-700/50">
                      <h4 className="font-medium text-blue-300 mb-2">Sample Smaipin Codes:</h4>
                      <div className="space-y-1 text-sm">
                        <code className="block text-slate-300">SMAI-2024-ABCD-1234 (100 SmaiSika)</code>
                        <code className="block text-slate-300">SMAI-2024-EFGH-5678 (250.5 SmaiSika)</code>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <QrCode className="h-5 w-5 mr-2 text-purple-400" />
                      Generate Smaipin
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      type="number"
                      placeholder="Amount to convert to Smaipin"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600">
                      Generate Smaipin Code
                    </Button>
                    
                    <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-700/50">
                      <p className="text-sm text-slate-300">
                        Generate shareable Smaipin codes that others can redeem for SmaiSika. 
                        Perfect for gifts, payments, or rewards.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Convert Tab */}
            <div className={activeTab === 'convert' ? 'block space-y-6' : 'hidden'}>
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <RefreshCw className="h-5 w-5 mr-2 text-cyan-400" />
                    Currency Conversion
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Amount (SmaiSika)</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={convertAmount}
                        onChange={(e) => setConvertAmount(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Convert To</label>
                      <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="w-full p-2 rounded-md bg-slate-700/50 border border-slate-600 text-white"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="NGN">Nigerian Naira (₦)</option>
                        <option value="GHS">Ghanaian Cedi (₵)</option>
                        <option value="KES">Kenyan Shilling (KSh)</option>
                        <option value="ZAR">South African Rand (R)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">British Pound (£)</option>
                      </select>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleCurrencyConvert}
                    disabled={convertCurrencyMutation.isPending}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-700 hover:to-blue-600"
                  >
                    {convertCurrencyMutation.isPending ? "Converting..." : "Convert Currency"}
                  </Button>

                  {(walletBalance as any)?.conversionRates && (
                    <div className="p-4 rounded-lg bg-slate-700/30">
                      <h4 className="font-medium text-white mb-3">Current Exchange Rates</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries((walletBalance as any)?.conversionRates || {}).map(([currency, rate]: [string, any]) => (
                          <div key={currency} className="flex justify-between text-sm">
                            <span className="text-slate-300">1 SmaiSika =</span>
                            <span className="text-white">{rate || 0} {currency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Multi-Currency Tab */}
            <div className={activeTab === 'multicurrency' ? 'block' : 'hidden'}>
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-green-400" />
                    Multi-Currency Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {multiCurrencyBalances && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries((multiCurrencyBalances as any)?.currencies || {}).map(([currency, data]: [string, any]) => (
                        <Card key={currency} className="bg-slate-700/30 border-slate-600/50">
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-2xl mb-2">{data?.symbol || '•'}</div>
                              <h3 className="text-lg font-bold text-white">{currency}</h3>
                              <p className="text-2xl font-bold text-cyan-400">{data?.balance?.toLocaleString() || '0'}</p>
                              <p className="text-sm text-slate-400">${data?.usdValue?.toLocaleString() || '0'} USD</p>
                              <p className={`text-sm font-medium ${(data?.change24h || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {(data?.change24h || 0) >= 0 ? '+' : ''}{data?.change24h || 0}% 24h
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Virtual Accounts Tab */}
            <div className={activeTab === 'virtual' ? 'block' : 'hidden'}>
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-purple-400" />
                      Virtual Account Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Virtual Bank Accounts</h3>
                        <div className="bg-slate-700/30 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300">USD Account</span>
                            <Badge className="bg-green-600">Active</Badge>
                          </div>
                          <p className="text-sm text-slate-400">Account: ****-****-****-1234</p>
                          <p className="text-sm text-slate-400">Routing: 021000021</p>
                        </div>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">
                          Generate New Virtual Account
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Virtual Phone Numbers</h3>
                        <div className="bg-slate-700/30 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300">US Number</span>
                            <Badge className="bg-blue-600">Verified</Badge>
                          </div>
                          <p className="text-sm text-slate-400">+1 (555) ***-8901</p>
                          <p className="text-xs text-slate-500">For SMS verification & trading alerts</p>
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Generate Virtual Number
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Biometric Tab */}
            <div className={activeTab === 'biometric' ? 'block' : 'hidden'}>
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Fingerprint className="h-5 w-5 mr-2 text-emerald-400" />
                    Biometric Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Available Methods</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Fingerprint className="h-5 w-5 text-emerald-400" />
                            <span className="text-white">Fingerprint</span>
                          </div>
                          <Badge className="bg-emerald-600">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Eye className="h-5 w-5 text-blue-400" />
                            <span className="text-white">Face Recognition</span>
                          </div>
                          <Badge className="bg-slate-600">Disabled</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Mic className="h-5 w-5 text-purple-400" />
                            <span className="text-white">Voice Recognition</span>
                          </div>
                          <Badge className="bg-purple-600">Enabled</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Security Settings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Require for login</span>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Enabled</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Require for transfers</span>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Enabled</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Require for trading</span>
                          <Button size="sm" className="bg-slate-600 hover:bg-slate-700">Disabled</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Voice Control Tab */}
            <div className={activeTab === 'voice' ? 'block' : 'hidden'}>
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Mic className="h-5 w-5 mr-2 text-purple-400" />
                    Voice Control System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-600/20 border-2 border-purple-500 mb-4">
                      <Mic className="h-10 w-10 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Voice Assistant Ready</h3>
                    <p className="text-slate-400 mb-6">Say "Hey SmaiSika" to start voice commands</p>
                    <Button className="bg-purple-600 hover:bg-purple-700 px-8">
                      Start Voice Session
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Available Commands</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-slate-300">"Check my balance"</p>
                        <p className="text-slate-300">"Send money to [contact]"</p>
                        <p className="text-slate-300">"Convert [amount] to [currency]"</p>
                        <p className="text-slate-300">"Show recent transactions"</p>
                        <p className="text-slate-300">"Enable trading mode"</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Voice Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Wake word detection</span>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">On</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Voice confirmations</span>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">On</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Audio feedback</span>
                          <Button size="sm" className="bg-slate-600 hover:bg-slate-700">Off</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Tab */}
            <div className={activeTab === 'analytics' ? 'block' : 'hidden'}>
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-cyan-400" />
                      Advanced Analytics Dashboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {predictions && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-700/30 p-4 rounded-lg text-center">
                          <h3 className="text-sm text-slate-400 mb-1">Next Week Prediction</h3>
                          <p className="text-2xl font-bold text-emerald-400">
                            +{(predictions as any)?.predictions?.nextWeek?.growth || 0}%
                          </p>
                          <p className="text-xs text-slate-500">Growth forecast</p>
                        </div>
                        <div className="bg-slate-700/30 p-4 rounded-lg text-center">
                          <h3 className="text-sm text-slate-400 mb-1">Risk Score</h3>
                          <p className="text-2xl font-bold text-orange-400">
                            {(predictions as any)?.predictions?.riskLevel || 'Medium'}
                          </p>
                          <p className="text-xs text-slate-500">Current portfolio risk</p>
                        </div>
                        <div className="bg-slate-700/30 p-4 rounded-lg text-center">
                          <h3 className="text-sm text-slate-400 mb-1">Optimal Action</h3>
                          <p className="text-2xl font-bold text-purple-400">
                            {(predictions as any)?.predictions?.recommendation || 'HOLD'}
                          </p>
                          <p className="text-xs text-slate-500">AI recommendation</p>
                        </div>
                      </div>
                    )}
                    <div className="bg-slate-700/30 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-3">Portfolio Performance</h3>
                      <div className="text-slate-300 text-sm">
                        <p>• 7-day performance: +12.4%</p>
                        <p>• Best performing asset: SmaiSika (+18.2%)</p>
                        <p>• Transaction volume: $45,230</p>
                        <p>• Success rate: 89.5%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Auto Rules Tab */}
            <div className={activeTab === 'autorules' ? 'block' : 'hidden'}>
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-orange-400" />
                    Automated Rules & Triggers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {autoRules && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Active Rules</h3>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                          Create New Rule
                        </Button>
                      </div>
                      
                      {((autoRules as any)?.rules || []).map((rule: any) => (
                        <div key={rule.id} className="bg-slate-700/30 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">{rule.name}</h4>
                            <Badge className={rule.enabled ? "bg-emerald-600" : "bg-slate-600"}>
                              {rule.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 mb-2">{rule.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>Trigger: {rule.trigger}</span>
                            <span>Action: {rule.action}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

        </div>
      </div>
    </div>
  );
}
