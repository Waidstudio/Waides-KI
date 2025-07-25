import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Scrollable Tab Navigation */}
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-max min-w-full h-12 items-center justify-start rounded-md bg-slate-800/50 p-1 text-slate-400">
              {scrollableTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-sm min-w-fit"
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {/* Tab Contents */}
          <div className="mt-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
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
            </TabsContent>

            {/* Smaipin Tab */}
            <TabsContent value="smaipin" className="space-y-6">
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
            </TabsContent>

            {/* Convert Tab */}
            <TabsContent value="convert" className="space-y-6">
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
            </TabsContent>

            {/* Additional tabs would follow similar pattern... */}
            <TabsContent value="multicurrency">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-green-400" />
                    Multi-Currency Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">Multi-currency management features coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Placeholder for other tabs */}
            {scrollableTabs.slice(4).map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <tab.icon className="h-5 w-5 mr-2 text-cyan-400" />
                      {tab.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{tab.label} features are being implemented...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
}